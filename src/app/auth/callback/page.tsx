"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeIconCorner } from "@/components/theme/ThemeIconToggle";
import { safeNextPath } from "@/lib/auth/paths";
import { isPasswordRecoveryNext } from "@/lib/auth/passwordReset";
import { createClient } from "@/lib/supabase/client";

/**
 * Auth email / OAuth redirects land here.
 *
 * Supports:
 * - PKCE `?code=` (same-browser recovery / signup)
 * - Hash tokens `#access_token=...&type=recovery` (legacy email templates)
 * - Provider error query params (`error`, `error_code`)
 *
 * Cross-browser recovery should use `/auth/confirm?token_hash=...&type=recovery`
 * via the Supabase email template (see docs/PASSWORD_RESET.md).
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Confirming your account…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : "",
      );

      const next = safeNextPath(
        params.get("next") ?? hashParams.get("next"),
        "/home",
      );
      const isRecovery =
        isPasswordRecoveryNext(next) ||
        hashParams.get("type") === "recovery" ||
        params.get("type") === "recovery";

      if (isRecovery) {
        setMessage("Opening password reset…");
      }

      const providerError =
        params.get("error") ||
        params.get("error_code") ||
        hashParams.get("error") ||
        hashParams.get("error_code");

      if (providerError) {
        if (!cancelled) {
          router.replace(
            `/auth/error?reason=${isRecovery ? "recovery" : "confirm"}`,
          );
        }
        return;
      }

      const supabase = createClient();
      const code = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;

        if (error) {
          setMessage(
            isRecovery
              ? "That reset link didn’t work."
              : "That confirmation link didn’t work.",
          );
          router.replace(
            `/auth/error?reason=${isRecovery ? "recovery" : "confirm"}`,
          );
          return;
        }
      } else {
        // Hash-based or already-established session (e.g. legacy template).
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // One short retry — client may still be parsing the URL hash.
          await new Promise((r) => window.setTimeout(r, 150));
          if (cancelled) return;
          const retry = await supabase.auth.getSession();
          if (!retry.data.session) {
            router.replace(
              `/auth/error?reason=${isRecovery ? "recovery" : "confirm"}`,
            );
            return;
          }
        }
      }

      if (cancelled) return;

      const { resolvePostAuthPathAction } = await import("@/lib/auth/postAuth");
      const destination = await resolvePostAuthPathAction(
        isRecovery ? "/auth/update-password" : next,
        isRecovery ? "/auth/update-password" : next,
      );
      router.replace(destination);
      router.refresh();
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main
      className="relative flex min-h-dvh items-center justify-center px-6"
      style={{ background: "var(--background)" }}
    >
      <ThemeIconCorner />
      <p className="text-sm text-[var(--foreground-muted)]">{message}</p>
    </main>
  );
}
