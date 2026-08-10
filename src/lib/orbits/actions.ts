"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { trackEvent } from "@/lib/analytics/track";
import { getOrbitByKey } from "@/lib/orbits/catalog";
import {
  getUserOrbitProgress,
  startOrResumeOrbit,
  buildOrbitList,
} from "@/lib/orbits/progress";
import {
  searchOrbits,
  type OrbitSearchResult,
} from "@/lib/orbits/search";
import { ensureOrbitSummativeAnalysis } from "@/lib/orbits/synthesize";
import type { OrbitSummativeAnalysisContent } from "@/lib/orbits/types";
import { createClient } from "@/lib/supabase/server";

export async function beginOrbitAction(formData: FormData) {
  const orbitKey = String(formData.get("orbitKey") ?? "").trim();
  if (!orbitKey) {
    throw new Error("Missing orbit key.");
  }

  const orbit = getOrbitByKey(orbitKey);
  if (!orbit || !orbit.isActive) {
    throw new Error("Orbit not found.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/orbits/${orbitKey}`)}`);
  }

  const progress = await startOrResumeOrbit(user.id, orbitKey);
  revalidatePath("/orbits");
  revalidatePath(`/orbits/${orbitKey}`);

  if (progress.status === "completed") {
    redirect(`/orbits/${orbitKey}/complete`);
  }

  redirect(`/orbits/${orbitKey}/reflect`);
}

export async function runOrbitSynthesisAction(
  orbitKey: string,
  opts?: { forceRetry?: boolean },
): Promise<
  | { ok: true; content: OrbitSummativeAnalysisContent }
  | { ok: false; message: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sign in to continue." };
  }

  const progress = await getUserOrbitProgress(user.id, orbitKey);
  if (!progress) {
    return { ok: false, message: "Orbit progress not found." };
  }

  const result = await ensureOrbitSummativeAnalysis({
    userId: user.id,
    progress,
    forceRetry: opts?.forceRetry ?? false,
  });

  revalidatePath(`/orbits/${orbitKey}/complete`);

  if (result.status === "ready") {
    return { ok: true, content: result.content };
  }

  return {
    ok: false,
    message:
      result.status === "failed"
        ? result.message
        : "We're having trouble creating your final reflection. Try again.",
  };
}

export async function retryOrbitSynthesisAction(orbitKey: string) {
  return runOrbitSynthesisAction(orbitKey, { forceRetry: true });
}

/**
 * Natural-language Orbit search. Never persists the raw query.
 * Analytics only receives result count + region keys.
 */
export async function searchOrbitsAction(
  query: string,
): Promise<OrbitSearchResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const items = await buildOrbitList({ userId: user?.id ?? null });
  const result = await searchOrbits(query, items);

  if (user && query.trim()) {
    const regionKeys = Array.from(
      new Set(result.matches.map((m) => m.regionKey)),
    );
    trackEvent("orbit_search_used", {
      userId: user.id,
      resultCount: result.matches.length,
      usedFallback: result.usedFallback,
      regionCount: regionKeys.length,
      // Structural only — never the raw query text
      regions: regionKeys.join(",").slice(0, 120),
    });
  }

  return result;
}
