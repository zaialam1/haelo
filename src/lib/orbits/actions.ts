"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrbitByKey } from "@/lib/orbits/catalog";
import {
  getUserOrbitProgress,
  startOrResumeOrbit,
} from "@/lib/orbits/progress";
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
