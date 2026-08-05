import { createClient } from "@/lib/supabase/server";
import { getSubtopicTint, getTopicCatalog } from "@/lib/topics/catalog";
import type {
  GrowthArc,
  MonthAnchor,
  PlanetViewModel,
  ReflectionRow,
  SummaryInsight,
  TimelineNode,
  TopicCatalogEntry,
} from "@/lib/topics/types";

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short" });
}

function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export async function getReflectionsForTopic(
  userId: string,
  topicId: string,
): Promise<ReflectionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reflections")
    .select(
      "id, user_id, topic_id, subtopic_id, prompt_text, recorded_at, audio_url, transcript, duration_seconds, confidence, meaningfulness, growth_signal, stood_out, voice_notes, theme_label, created_at, question_id, session_type, session_id, question_ids, prompt_texts, question_timestamps",
    )
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .order("recorded_at", { ascending: true });

  if (error) {
    // Table may not exist yet before migration; treat as empty for new users.
    console.error("[reflections] fetch failed:", error.message);
    return [];
  }

  return (data ?? []) as ReflectionRow[];
}

function buildMonthAnchors(reflections: ReflectionRow[]): MonthAnchor[] {
  if (reflections.length === 0) return [];

  const first = new Date(reflections[0].recorded_at).getTime();
  const last = new Date(reflections[reflections.length - 1].recorded_at).getTime();
  const span = Math.max(last - first, 1);

  const seen = new Map<string, MonthAnchor>();
  for (const r of reflections) {
    const key = monthKey(r.recorded_at);
    if (seen.has(key)) continue;
    const t = new Date(r.recorded_at).getTime();
    seen.set(key, {
      key,
      label: monthLabel(r.recorded_at),
      x: (t - first) / span,
    });
  }

  return Array.from(seen.values()).sort((a, b) => a.x - b.x);
}

function buildBaseNodes(
  topic: TopicCatalogEntry,
  reflections: ReflectionRow[],
): TimelineNode[] {
  if (reflections.length === 0) return [];

  const first = new Date(reflections[0].recorded_at).getTime();
  const last = new Date(reflections[reflections.length - 1].recorded_at).getTime();
  const span = Math.max(last - first, 1);

  return reflections.map((r, i) => {
    const t = new Date(r.recorded_at).getTime();
    const x = reflections.length === 1 ? 0.5 : (t - first) / span;
    // Gentle vertical snake so the path feels like a constellation
    const wave = Math.sin(i * 0.9) * 0.18 + (i % 2 === 0 ? -0.06 : 0.06);
    const y = 0.5 + wave;

    return {
      id: r.id,
      x,
      y: Math.min(0.85, Math.max(0.15, y)),
      recordedAt: r.recorded_at,
      subtopicId: r.subtopic_id,
      tint: getSubtopicTint(topic, r.subtopic_id),
      size: r.meaningfulness != null ? 0.65 + r.meaningfulness * 0.75 : 0.9,
      glow: r.confidence != null ? r.confidence : 0.45,
      growth: Boolean(r.growth_signal),
      promptText: r.prompt_text,
      stoodOut: r.stood_out,
      voiceNotes: r.voice_notes ?? [],
      themeLabel: r.theme_label,
      audioUrl: r.audio_url,
      transcript: r.transcript,
      emphasis: 1,
      sessionType: r.session_type,
      isDaily: r.session_type === "daily",
    };
  });
}

function buildSummaryInsights(
  topic: TopicCatalogEntry,
  reflections: ReflectionRow[],
): SummaryInsight[] {
  if (reflections.length === 0) {
    return [
      {
        label: "Most natural talking about",
        value: "Will appear as you reflect",
        isPlaceholder: true,
      },
      {
        label: "Growing in",
        value: "Will appear as you reflect",
        isPlaceholder: true,
      },
      {
        label: "Recently exploring",
        value: "Will appear as you reflect",
        isPlaceholder: true,
      },
    ];
  }

  const subCounts = new Map<string, number>();
  for (const r of reflections) {
    if (!r.subtopic_id) continue;
    subCounts.set(r.subtopic_id, (subCounts.get(r.subtopic_id) ?? 0) + 1);
  }

  const mostNaturalId = [...subCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const mostNatural =
    topic.subtopics.find((s) => s.id === mostNaturalId)?.label ?? null;

  const growthOnes = reflections.filter((r) => r.growth_signal);
  const growingIn =
    growthOnes.length > 0
      ? topic.subtopics.find(
          (s) =>
            s.id ===
            growthOnes[growthOnes.length - 1]?.subtopic_id,
        )?.label ?? null
      : null;

  const recent = reflections[reflections.length - 1];
  const exploring =
    topic.subtopics.find((s) => s.id === recent?.subtopic_id)?.label ?? null;

  const hasAnalysis = reflections.some(
    (r) => r.stood_out || (r.voice_notes && r.voice_notes.length > 0),
  );

  return [
    {
      label: "Most natural talking about",
      value: mostNatural ?? "—",
      isPlaceholder: !mostNatural,
    },
    {
      label: "Growing in",
      value: growingIn ?? (hasAnalysis ? "—" : "—"),
      isPlaceholder: !growingIn,
    },
    {
      label: "Recently exploring",
      value: exploring ?? "—",
      isPlaceholder: !exploring,
    },
  ];
}

function buildGrowthArcs(
  topic: TopicCatalogEntry,
  reflections: ReflectionRow[],
): GrowthArc[] {
  if (reflections.length < 2) {
    return [
      {
        id: "placeholder",
        label: `Expressing yourself in ${topic.label}`,
        points: [0.25, 0.35, 0.4, 0.45],
        startLabel: "Soon",
        endLabel: "Later",
        summary:
          "Growth patterns will appear as you keep reflecting on this planet.",
      },
    ];
  }

  const withConfidence = reflections.filter((r) => r.confidence != null);
  if (withConfidence.length >= 2) {
    const n = withConfidence.length;
    return [
      {
        id: "confidence",
        label: "Speaking with ease",
        // Evenly spaced along time; confidence reserved for future arc height
        points: withConfidence.map((_, i) => (n === 1 ? 0.5 : i / (n - 1))),
        startLabel: formatMonthYear(withConfidence[0].recorded_at),
        endLabel: formatMonthYear(
          withConfidence[withConfidence.length - 1].recorded_at,
        ),
        summary:
          withConfidence[withConfidence.length - 1]?.stood_out ?? null,
      },
    ];
  }

  // Enough sessions but no analysis yet — still show a calm placeholder arc
  const count = reflections.length;
  return [
    {
      id: "placeholder",
      label: `Your growth in ${topic.label}`,
      points: reflections.map((_, i) => (count === 1 ? 0.5 : i / (count - 1))),
      startLabel: formatMonthYear(reflections[0].recorded_at),
      endLabel: formatMonthYear(reflections[reflections.length - 1].recorded_at),
      summary:
        "Deeper growth notes will appear once your reflections are analyzed.",
    },
  ];
}

export function buildPlanetViewModel(
  topic: TopicCatalogEntry,
  reflections: ReflectionRow[],
): PlanetViewModel {
  return {
    topic,
    reflections,
    nodes: buildBaseNodes(topic, reflections),
    monthAnchors: buildMonthAnchors(reflections),
    summaryInsights: buildSummaryInsights(topic, reflections),
    growthArcs: buildGrowthArcs(topic, reflections),
    isEmpty: reflections.length === 0,
  };
}

export async function getPlanetPageData(
  userId: string | null,
  topicId: string,
): Promise<PlanetViewModel | null> {
  const topic = getTopicCatalog(topicId);
  if (!topic) return null;

  const reflections = userId
    ? await getReflectionsForTopic(userId, topicId)
    : [];

  return buildPlanetViewModel(topic, reflections);
}
