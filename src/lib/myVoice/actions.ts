"use server";

import { createClient } from "@/lib/supabase/server";
import { openMyVoiceForUser, regenerateMyVoiceForUser } from "./ensure";
import { trackMyVoiceEvent } from "./events";
import type { OpenMyVoiceResult } from "./types";

/**
 * Open My Voice for the current authenticated user only.
 * Professionals cannot open another user's My Voice through this action.
 */
export async function openMyVoiceAction(): Promise<OpenMyVoiceResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "unauthenticated",
      message: "You need to be signed in to open My Voice.",
    };
  }

  const view = await openMyVoiceForUser({ userId: user.id });
  return { ok: true, view };
}

export async function retryMyVoiceAction(): Promise<OpenMyVoiceResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "unauthenticated",
      message: "You need to be signed in to open My Voice.",
    };
  }

  const view = await regenerateMyVoiceForUser(user.id);
  return { ok: true, view };
}

export async function trackMyVoiceJourneyClickAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  trackMyVoiceEvent("my_voice_journey_clicked", { userId: user?.id });
}
