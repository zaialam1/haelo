import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(
    searchParams.get("next"),
    type === "recovery" ? "/auth/update-password" : "/age-verification",
  );

  // #region agent log
  fetch("http://127.0.0.1:7260/ingest/327a9bfd-1a4e-4e3a-9bbf-2eff52fa2f90", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "15d12f",
    },
    body: JSON.stringify({
      sessionId: "15d12f",
      runId: "post-fix",
      hypothesisId: "D",
      location: "auth/confirm/route.ts:entry",
      message: "Auth confirm hit",
      data: {
        hasTokenHash: Boolean(token_hash),
        type,
        next,
        paramKeys: Array.from(searchParams.keys()),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.search = "";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    // #region agent log
    fetch("http://127.0.0.1:7260/ingest/327a9bfd-1a4e-4e3a-9bbf-2eff52fa2f90", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "15d12f",
      },
      body: JSON.stringify({
        sessionId: "15d12f",
        runId: "post-fix",
        hypothesisId: "D",
        location: "auth/confirm/route.ts:verify",
        message: "verifyOtp result",
        data: {
          ok: !error,
          errorMessage: error?.message ?? null,
          errorStatus: error?.status ?? null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = "/auth/error";
  return NextResponse.redirect(redirectTo);
}
