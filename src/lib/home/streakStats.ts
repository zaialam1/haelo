import { TOPICS } from "@/lib/home/universe";
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

type ReflectionLite = {
  recorded_at: string;
  session_id: string | null;
  session_type: string | null;
  topic_id: string;
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
 * A calendar day counts toward streak when the user completed:
 * daily, a focus session, or a full main session (5 clips),
 * or — as a graceful fallback — any reflection that day.
 */
function buildActiveDays(rows: ReflectionLite[]): Set<string> {
  const byDay = new Map<string, ReflectionLite[]>();
  for (const row of rows) {
    const key = localDayKey(row.recorded_at);
    const list = byDay.get(key) ?? [];
    list.push(row);
    byDay.set(key, list);
  }

  const active = new Set<string>();
  for (const [day, list] of byDay) {
    if (list.some((r) => r.session_type === "daily")) {
      active.add(day);
      continue;
    }
    if (list.some((r) => r.session_type === "focus")) {
      active.add(day);
      continue;
    }
    const mainBySession = new Map<string, number>();
    for (const r of list) {
      if (r.session_type !== "main" || !r.session_id) continue;
      mainBySession.set(r.session_id, (mainBySession.get(r.session_id) ?? 0) + 1);
    }
    if ([...mainBySession.values()].some((n) => n >= 5)) {
      active.add(day);
      continue;
    }
    // Any recording still counts so early usage isn't stuck at 0
    if (list.length > 0) active.add(day);
  }
  return active;
}

function computeStreak(active: Set<string>): number {
  const today = todayKey();
  let cursor = active.has(today) ? today : shiftDayKey(today, -1);
  if (!active.has(cursor)) return 0;

  let streak = 0;
  while (active.has(cursor)) {
    streak += 1;
    cursor = shiftDayKey(cursor, -1);
  }
  return streak;
}

function sessionsOnDay(rows: ReflectionLite[], day: string): number {
  const todays = rows.filter((r) => localDayKey(r.recorded_at) === day);
  const ids = new Set<string>();
  let orphans = 0;
  for (const r of todays) {
    if (r.session_id) ids.add(r.session_id);
    else orphans += 1;
  }
  return ids.size + orphans;
}

function topPlanet(rows: ReflectionLite[]): {
  id: string | null;
  label: string | null;
} {
  if (rows.length === 0) return { id: null, label: null };
  const counts = new Map<string, number>();
  for (const r of rows) {
    counts.set(r.topic_id, (counts.get(r.topic_id) ?? 0) + 1);
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!best) return { id: null, label: null };
  const label = TOPICS.find((t) => t.id === best[0])?.label ?? best[0];
  return { id: best[0], label };
}

/** Monday-start local week keys for the week containing `d`. */
function currentWeekDayKeys(d = new Date()): string[] {
  const day = d.getDay(); // 0 Sun … 6 Sat
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return todayKey(x);
  });
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

    const { data, error } = await supabase
      .from("reflections")
      .select("recorded_at, session_id, session_type, topic_id")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: true });

    if (error || !data) {
      console.error("[streak] fetch failed:", error?.message);
      return empty;
    }

    const rows = data as ReflectionLite[];
    const active = buildActiveDays(rows);
    const planet = topPlanet(rows);
    const weekKeys = currentWeekDayKeys();

    return {
      streakDays: computeStreak(active),
      sessionsToday: sessionsOnDay(rows, todayKey()),
      totalReflections: rows.length,
      topPlanetId: planet.id,
      topPlanetLabel: planet.label,
      weekActive: weekKeys.map((k) => active.has(k)),
    };
  } catch (e) {
    console.error("[streak] unexpected:", e);
    return empty;
  }
}
