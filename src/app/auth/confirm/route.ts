import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth/paths";
import {
  PASSWORD_UPDATE_PATH,
  isPasswordRecoveryNext,
} from "@/lib/auth/passwordReset";
import { createClient } from "@/lib/supabase/server";

/**
 * Token-hash email links land here.
 * Recovery links redirect to `/auth/recover` without verifying yet, so
 * email scanners that prefetch GET URLs cannot burn the one-time token.
 * Other confirm types still verify on GET.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const isRecovery =
    type === "recovery" || isPasswordRecoveryNext(searchParams.get("next"));
  const next = safeNextPath(
    searchParams.get("next"),
    isRecovery ? PASSWORD_UPDATE_PATH : "/home",
  );

  if (isRecovery && token_hash) {
    const recover = request.nextUrl.clone();
    recover.pathname = "/auth/recover";
    recover.search = "";
    recover.searchParams.set("token_hash", token_hash);
    recover.searchParams.set("type", "recovery");
    recover.searchParams.set("next", next);
    return NextResponse.redirect(recover);
  }

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.search = "";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = "/auth/error";
  redirectTo.search = "";
  redirectTo.searchParams.set("reason", isRecovery ? "recovery" : "confirm");
  return NextResponse.redirect(redirectTo);
}
