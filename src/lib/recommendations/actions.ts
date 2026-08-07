"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrbitByKey } from "@/lib/orbits/catalog";
import { startOrResumeOrbit } from "@/lib/orbits/progress";
import { getOwnProfile } from "@/lib/profiles/data";
import { createClient } from "@/lib/supabase/server";
import { markOrbitRecommendationViewed } from "./data";
import {
  MESSAGE_MAX_LENGTH,
  PURPOSE_MAX_LENGTH,
  type CreateOrbitRecommendationResult,
} from "./types";

function revalidateRecommendationPaths(orbitKey?: string) {
  revalidatePath("/home");
  revalidatePath("/orbits");
  revalidatePath("/professional/home");
  revalidatePath("/professional/recommend");
  revalidatePath("/settings/connections");
  if (orbitKey) {
    revalidatePath(`/orbits/${orbitKey}`);
  }
}

export async function sendOrbitRecommendationAction(input: {
  recipientUserId: string;
  orbitKey: string;
  purpose: string;
  personalMessage?: string;
}): Promise<CreateOrbitRecommendationResult> {
  const profile = await getOwnProfile();
  if (!profile) {
    return {
      ok: false,
      error: "unauthenticated",
      message: "You need to be signed in.",
    };
  }
  if (profile.accountRole !== "professional") {
    return {
      ok: false,
      error: "forbidden",
      message: "Only professionals can recommend Orbits.",
    };
  }

  const orbit = getOrbitByKey(input.orbitKey);
  if (!orbit || !orbit.isActive) {
    return {
      ok: false,
      error: "invalid_orbit",
      message: "That Orbit isn’t available.",
    };
  }

  const purpose = input.purpose.trim();
  if (!purpose || purpose.length > PURPOSE_MAX_LENGTH) {
    return {
      ok: false,
      error: "invalid_purpose",
      message: `Add a short purpose (1–${PURPOSE_MAX_LENGTH} characters).`,
    };
  }

  const personalMessage = input.personalMessage?.trim() || undefined;
  if (personalMessage && personalMessage.length > MESSAGE_MAX_LENGTH) {
    return {
      ok: false,
      error: "invalid_message",
      message: `Keep the note under ${MESSAGE_MAX_LENGTH} characters.`,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_orbit_recommendation", {
    p_recipient_user_id: input.recipientUserId,
    p_orbit_key: orbit.orbitKey,
    p_orbit_version: orbit.version,
    p_purpose: purpose,
    p_personal_message: personalMessage ?? null,
  });

  if (error) {
    return {
      ok: false,
      error: "unknown",
      message: error.message || "Couldn’t send the recommendation.",
    };
  }

  const payload = data as {
    ok?: boolean;
    error?: string;
    recommendation?: { id?: string };
    recommendation_id?: string;
  } | null;

  if (!payload?.ok) {
    const code = payload?.error ?? "unknown";
    if (code === "not_connected") {
      return {
        ok: false,
        error: "not_connected",
        message:
          "You can only recommend Orbits to people who have accepted a connection.",
      };
    }
    if (code === "duplicate_active") {
      return {
        ok: false,
        error: "duplicate_active",
        message: "You’ve already recommended this Orbit.",
        existingRecommendationId:
          payload?.recommendation_id ?? undefined,
      };
    }
    if (code === "forbidden") {
      return {
        ok: false,
        error: "forbidden",
        message: "Only professionals can recommend Orbits.",
      };
    }
    return {
      ok: false,
      error: "unknown",
      message: "Couldn’t send the recommendation. Try again.",
    };
  }

  revalidateRecommendationPaths(orbit.orbitKey);
  return {
    ok: true,
    recommendationId: payload.recommendation?.id ?? "",
  };
}

export async function markRecommendationViewedAction(
  recommendationId: string,
): Promise<{ ok: boolean }> {
  const ok = await markOrbitRecommendationViewed(recommendationId);
  if (ok) {
    revalidatePath("/orbits");
    revalidatePath("/home");
  }
  return { ok };
}

export async function markRecommendationStartedAction(
  recommendationId: string,
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("mark_orbit_recommendation_started", {
    p_id: recommendationId,
  });
  const payload = data as { ok?: boolean } | null;
  revalidatePath("/orbits");
  return { ok: Boolean(payload?.ok) };
}

export async function dismissOrbitRecommendationAction(
  recommendationId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("dismiss_orbit_recommendation", {
    p_id: recommendationId,
  });

  if (error) {
    return { ok: false, message: "Couldn’t dismiss this recommendation." };
  }

  const payload = data as { ok?: boolean } | null;
  if (!payload?.ok) {
    return { ok: false, message: "Couldn’t dismiss this recommendation." };
  }

  revalidatePath("/orbits");
  revalidatePath("/home");
  return { ok: true };
}

/**
 * Begin (or continue) an Orbit from a recommendation detail page.
 * Marks recommendation started and links progress when newly created / resumed.
 */
export async function beginOrbitFromRecommendationAction(
  recommendationId: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: detailData } = await supabase.rpc(
    "get_orbit_recommendation_detail",
    { p_id: recommendationId },
  );
  const detail = detailData as {
    ok?: boolean;
    recommendation?: {
      id: string;
      orbit_key: string;
      recipient_user_id: string;
      status: string;
    };
  } | null;

  if (!user || !detail?.ok || !detail.recommendation) {
    redirect("/orbits");
  }

  const rec = detail.recommendation;
  if (rec.recipient_user_id !== user.id) {
    redirect("/orbits");
  }

  if (rec.status === "dismissed") {
    redirect(`/orbits/${rec.orbit_key}`);
  }

  const orbit = getOrbitByKey(rec.orbit_key);
  if (!orbit || !orbit.isActive) {
    redirect("/orbits");
  }

  if (rec.status !== "completed") {
    await supabase.rpc("mark_orbit_recommendation_started", {
      p_id: recommendationId,
    });
  }

  const progress = await startOrResumeOrbit(user.id, rec.orbit_key, {
    sourceRecommendationId: recommendationId,
  });

  revalidateRecommendationPaths(rec.orbit_key);

  if (progress.status === "completed") {
    redirect(`/orbits/${rec.orbit_key}/complete`);
  }

  redirect(`/orbits/${rec.orbit_key}/reflect`);
}
