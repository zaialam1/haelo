import type {
  AnalysisEvidence,
  AnalysisStatus,
  SessionAnalysis,
  SessionAnalysisRow,
} from "@/lib/sessions/types";

function parseEvidence(raw: unknown): AnalysisEvidence[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const items: AnalysisEvidence[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const text = "text" in entry ? entry.text : null;
    if (typeof text !== "string" || !text.trim()) continue;
    const item: AnalysisEvidence = { text: text.trim() };
    if (
      "startTime" in entry &&
      typeof entry.startTime === "number" &&
      Number.isFinite(entry.startTime)
    ) {
      item.startTime = entry.startTime;
    }
    if (
      "endTime" in entry &&
      typeof entry.endTime === "number" &&
      Number.isFinite(entry.endTime)
    ) {
      item.endTime = entry.endTime;
    }
    items.push(item);
  }
  return items.length > 0 ? items : undefined;
}

export function mapAnalysisRow(
  row: SessionAnalysisRow | null | undefined,
): SessionAnalysis | null {
  if (!row) return null;

  const analysis: SessionAnalysis = {
    sessionId: row.session_id,
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
  };

  if (row.status !== "ready") {
    return analysis;
  }

  if (row.strength_title?.trim() && row.strength_description?.trim()) {
    analysis.strength = {
      title: row.strength_title.trim(),
      description: row.strength_description.trim(),
    };
  }

  if (row.observation_title?.trim() && row.observation_description?.trim()) {
    analysis.observation = {
      title: row.observation_title.trim(),
      description: row.observation_description.trim(),
    };
  }

  const evidence = parseEvidence(row.evidence);
  if (evidence) analysis.evidence = evidence;

  if (row.experiment_title?.trim() && row.experiment_instruction?.trim()) {
    analysis.experiment = {
      title: row.experiment_title.trim(),
      instruction: row.experiment_instruction.trim(),
    };
  }

  if (row.comparison_observation?.trim()) {
    analysis.comparisonObservation = row.comparison_observation.trim();
  }

  return analysis;
}

export function pickAnalysisRow(
  value:
    | SessionAnalysisRow
    | SessionAnalysisRow[]
    | null
    | undefined,
): SessionAnalysisRow | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export function analysisStatusLabel(status: AnalysisStatus | null): string {
  if (status === "pending") return "processing";
  if (status === "ready") return "complete";
  if (status === "failed") return "unavailable";
  return "not started";
}
