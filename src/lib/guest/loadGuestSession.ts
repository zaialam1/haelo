import { redirect } from "next/navigation";
import { isPlanet, type Planet } from "@/lib/prompts";
import {
  getSessionDetailForUser,
  type SessionDetail,
} from "@/lib/sessions/getSession";
import { createClient } from "@/lib/supabase/server";

export type LoadedGuestSession = {
  planet: Planet;
  session: SessionDetail;
  userId: string;
};

/**
 * Load a session owned by the current anonymous guest.
 * Registered users are sent to the normal session routes; missing auth → /try.
 */
export async function loadGuestOwnedSession(
  planetParam: string,
  sessionId: string,
): Promise<
  | { ok: true; data: LoadedGuestSession }
  | {
      ok: false;
      kind: "invalid_planet" | "not_found" | "wrong_planet";
    }
> {
  if (!isPlanet(planetParam)) {
    return { ok: false, kind: "invalid_planet" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/try");
  }

  if (!user.is_anonymous) {
    redirect(`/session/${planetParam}/${sessionId}/review`);
  }

  const session = await getSessionDetailForUser(sessionId, user.id);
  if (!session) {
    return { ok: false, kind: "not_found" };
  }

  if (session.planet !== planetParam) {
    return { ok: false, kind: "wrong_planet" };
  }

  return {
    ok: true,
    data: { planet: planetParam, session, userId: user.id },
  };
}
