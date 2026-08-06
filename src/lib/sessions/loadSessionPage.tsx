import Link from "next/link";
import { redirect } from "next/navigation";
import { SessionShell } from "@/components/session/SessionShell";
import { getPlanetPageContent } from "@/lib/planets/content";
import { isPlanet, type Planet } from "@/lib/prompts";
import {
  getSessionDetailForUser,
  type SessionDetail,
} from "@/lib/sessions/getSession";
import { createClient } from "@/lib/supabase/server";

export type LoadedSessionContext = {
  planet: Planet;
  session: SessionDetail;
  userId: string;
};

export async function loadOwnedSession(
  planetParam: string,
  sessionId: string,
): Promise<
  | { ok: true; data: LoadedSessionContext }
  | {
      ok: false;
      kind: "invalid_planet" | "unauthorized" | "not_found" | "wrong_planet";
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
    redirect(`/login?next=/session/${planetParam}/${sessionId}/review`);
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

export function SessionNotFound({
  planet,
  href,
}: {
  planet?: Planet;
  href: string;
}) {
  const label = planet ? getPlanetPageContent(planet).label : "Universe";

  return (
    <main
      className="flex min-h-dvh w-full flex-col px-5 py-8 sm:px-10"
      style={{ background: "var(--background)" }}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
        <h1
          className="font-[family-name:var(--font-fraunces)] text-3xl"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          Session not found
        </h1>
        <p
          className="mt-4 text-[1.0625rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          This session isn&rsquo;t available. It may belong to another account
          or the link may be incomplete.
        </p>
        <Link
          href={href}
          className="mt-8 inline-flex w-fit rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)]"
        >
          Back to {label}
        </Link>
      </div>
    </main>
  );
}

export { SessionShell };
