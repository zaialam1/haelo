import { Resend } from "resend";

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

/** From address: verified domain in production, Resend onboarding sender in dev. */
export function getAuthEmailFrom(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() || "Halo <beth.t@example.com>"
  );
}

function mapResendSendError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("domain is not verified") ||
    lower.includes("only send testing emails") ||
    lower.includes("verify a domain")
  ) {
    return "Email isn’t set up yet. Verify your domain in Resend, set RESEND_FROM_EMAIL, then try again.";
  }
  return "Couldn’t send email.";
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const resend = getResendClient();
  if (!resend) {
    return {
      ok: false,
      message: "Email sending is not configured.",
    };
  }

  const from = getAuthEmailFrom();
  const { data, error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (error) {
    console.error("[resend] send failed", {
      from,
      to: input.to,
      message: error.message,
      name: error.name,
    });
    return {
      ok: false,
      message: mapResendSendError(error.message || ""),
    };
  }

  if (!data?.id) {
    console.error("[resend] send returned no id", { from, to: input.to });
    return { ok: false, message: "Couldn’t send email." };
  }

  return { ok: true };
}
