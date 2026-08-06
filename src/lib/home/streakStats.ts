import { TOPICS } from "@/lib/home/universe";
import { VOICE_PLANETS } from "@/lib/home/voicePlanets";
import { createClient } from "@/lib/supabase/client";

export type StreakStats = {
  streakDays: number;
  sessionsToday: number;
  totalReflections: number;
  topPlanetId: string | null;
  topPlanetLabel: string | null;
  /** Mon→Sun of the current local week; true if that day counted toward practice */
  weekActive: boolean[];
};

type PracticeEvent = {
  at: string;
  planetId: string | null;
  /** Distinct activity unit for "sessions today" */
  unitId: string;
};

type ReflectionLite = {
  id?: string;
  recorded_at: string;
  session_id: string | null;
  session_type: string | null;
  topic_id: string;
};

type SessionLite = {
  id: string;
  planet: string;
  status: string;
  source: string | null;
  completed_at: string | null;
  created_at: string;
  session_attempts: { id: string; created_at: string }[] | null;
};

function localDayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function shiftDayKey(key: string, delta: number): string {
  const [y, m, day] = key.split("-").map(Number);
  const d = new Date(y!, m! - 1, day!);
  d.setDate(d.getDate() + delta);
  return todayKey(d);
}

/**
 * A calendar day counts when the user practiced their voice that day —
 * completed planet/daily sessions, or legacy reflections.
 */
function buildActiveDays(events: PracticeEvent[]): Set<string> {
  const active = new Set<string>();
  for (const event of events) {
    active.add(localDayKey(event.at));
  }
  return active;
}

function computeStreak(active: Set<string>): number {
  const today = todayKey();
  // Streak continues overnight if yesterday was active and today isn't yet.
  let cursor = active.has(today) ? today : shiftDayKey(today, -1);
  if (!active.has(cursor)) return 0;

  let streak = 0;
  while (active.has(cursor)) {
    streak += 1;
    cursor = shiftDayKey(cursor, -1);
  }
  return streak;
}

function sessionsOnDay(events: PracticeEvent[], day: string): number {
  const ids = new Set<string>();
  for (const event of events) {
    if (localDayKey(event.at) === day) ids.add(event.unitId);
  }
  return ids.size;
}

function topPlanet(events: PracticeEvent[]): {
  id: string | null;
  label: string | null;
} {
  const withPlanet = events.filter((e) => e.planetId);
  if (withPlanet.length === 0) return { id: null, label: null };

  const counts = new Map<string, number>();
  for (const e of withPlanet) {
    const id = e.planetId!;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!best) return { id: null, label: null };

  const label =
    VOICE_PLANETS.find((p) => p.id === best[0])?.label ??
    TOPICS.find((t) => t.id === best[0])?.label ??
    best[0];
  return { id: best[0], label };
}

/** Monday-start local week keys for the week containing `d`. */
function currentWeekDayKeys(d = new Date()): string[] {
  const day = d.getDay(); // 0 Sun … 6 Sat
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate() + mondayOffset,
  );
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return todayKey(x);
  });
}

function eventsFromReflections(rows: ReflectionLite[]): PracticeEvent[] {
  return rows.map((row, index) => ({
    at: row.recorded_at,
    planetId: row.topic_id || null,
    unitId: row.session_id
      ? `reflection-session:${row.session_id}`
      : `reflection:${row.id ?? `${row.recorded_at}-${index}`}`,
  }));
}

/**
 * Planet practice sessions. A day counts when the user saved audio
 * (attempt exists) or finished the session — not empty drafts.
 *
 * Orbit sessions only count when completed (not abandoned mid-Orbit).
 */
function eventsFromSessions(rows: SessionLite[]): PracticeEvent[] {
  const events: PracticeEvent[] = [];

  for (const row of rows) {
    const attempts = row.session_attempts ?? [];
    const isOrbit = row.source === "orbit";

    if (isOrbit) {
      // Orbits: only completed question sessions count toward streak.
      if (row.status !== "completed") continue;
    } else if (row.status !== "completed" && attempts.length === 0) {
      continue;
    }

    // Completed → finish day; otherwise first practice day (session create).
    const at =
      row.status === "completed"
        ? (row.completed_at ?? row.created_at)
        : row.created_at;

    events.push({
      at,
      planetId: row.planet,
      unitId: `session:${row.id}`,
    });
  }

  return events;
}

export async function fetchStreakStats(): Promise<StreakStats> {
  const empty: StreakStats = {
    streakDays: 0,
    sessionsToday: 0,
    totalReflections: 0,
    topPlanetId: null,
    topPlanetLabel: null,
    weekActive: [false, false, false, false, false, false, false],
  };

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return empty;

    const [reflectionsRes, sessionsRes] = await Promise.all([
      supabase
        .from("reflections")
        .select("id, recorded_at, session_id, session_type, topic_id")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: true }),
      supabase
        .from("sessions")
        .select(
          "id, planet, status, source, completed_at, created_at, session_attempts(id, created_at)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
    ]);

    if (reflectionsRes.error) {
      console.error("[streak] reflections fetch failed:", reflectionsRes.error.message);
    }
    if (sessionsRes.error) {
      console.error("[streak] sessions fetch failed:", sessionsRes.error.message);
    }

    const reflectionRows = (reflectionsRes.data ?? []) as ReflectionLite[];
    const sessionRows = (sessionsRes.data ?? []) as SessionLite[];

    const events = [
      ...eventsFromReflections(reflectionRows),
      ...eventsFromSessions(sessionRows),
    ];

    const active = buildActiveDays(events);
    const planet = topPlanet(events);
    const weekKeys = currentWeekDayKeys();

    return {
      streakDays: computeStreak(active),
      sessionsToday: sessionsOnDay(events, todayKey()),
      totalReflections: reflectionRows.length + sessionRows.filter(
        (s) => s.status === "completed" || (s.session_attempts?.length ?? 0) > 0,
      ).length,
      topPlanetId: planet.id,
      topPlanetLabel: planet.label,
      weekActive: weekKeys.map((k) => active.has(k)),
    };
  } catch (e) {
    console.error("[streak] unexpected:", e);
    return empty;
  }
}
