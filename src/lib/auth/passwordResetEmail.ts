import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/resend";
import {
  PASSWORD_UPDATE_PATH,
  buildPasswordResetRedirectTo,
} from "@/lib/auth/passwordReset";

/**
 * Resolve the public origin used inside recovery links.
 * Prefer NEXT_PUBLIC_SITE_URL in deployed environments.
 */
export function resolvePasswordResetOrigin(clientOrigin: string | null): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  if (clientOrigin) {
    try {
      const url = new URL(clientOrigin);
      const host = url.hostname;
      if (host === "localhost" || host === "127.0.0.1") return url.origin;
      if (host === "halo-speak.com" || host === "www.halo-speak.com") {
        return url.origin;
      }
      if (host.endsWith(".vercel.app")) return url.origin;
    } catch {
      // fall through
    }
  }

  return "https://www.halo-speak.com";
}

function buildRecoveryEmail(resetUrl: string): { subject: string; html: string; text: string } {
  const subject = "Reset your Halo password";
  const text = [
    "Someone asked to reset the password for this Halo account.",
    "",
    `Choose a new password: ${resetUrl}`,
    "",
    "If you didn’t ask for this, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #333;">
      <p>Someone asked to reset the password for this Halo account.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}"
           style="display:inline-block;background:#5B4B8A;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;">
          Choose a new password
        </a>
      </p>
      <p style="color:#6b6259;font-size:14px;">If you didn’t ask for this, you can ignore this email.</p>
    </div>
  `.trim();

  return { subject, html, text };
}

/**
 * Create a recovery link and send it with Resend.
 * Returns:
 * - sent: true when an email was dispatched
 * - sent: false when no account exists (caller should still show generic success)
 * - ok: false only when sending failed for a real account
 */
export async function sendPasswordResetEmail(input: {
  email: string;
  origin: string;
}): Promise<
  | { ok: true; sent: boolean }
  | { ok: false; message: string }
> {
  const email = input.email.trim().toLowerCase();
  const origin = input.origin.replace(/\/$/, "");
  const redirectTo = buildPasswordResetRedirectTo(origin);

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (error) {
    const lower = (error.message || "").toLowerCase();
    if (
      error.status === 404 ||
      lower.includes("not found") ||
      lower.includes("user_not_found")
    ) {
      // No account: pretend success (no email enumeration).
      return { ok: true, sent: false };
    }
    return {
      ok: false,
      message: "Couldn’t send a reset email. Try again.",
    };
  }

  const hashedToken = data.properties?.hashed_token;
  if (!hashedToken) {
    return {
      ok: false,
      message: "Couldn’t send a reset email. Try again.",
    };
  }

  const resetUrl =
    `${origin}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}` +
    `&type=recovery&next=${encodeURIComponent(PASSWORD_UPDATE_PATH)}`;

  const content = buildRecoveryEmail(resetUrl);
  const send = await sendTransactionalEmail({
    to: email,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });

  if (!send.ok) {
    return {
      ok: false,
      message:
        send.message === "Email sending is not configured." ||
        send.message.startsWith("Email isn’t set up yet")
          ? send.message
          : "Couldn’t send a reset email. Try again.",
    };
  }

  return { ok: true, sent: true };
}
