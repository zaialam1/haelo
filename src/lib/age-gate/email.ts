import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  return new Resend(apiKey);
}

function getFromEmail() {
  // Resend onboarding sender works without a verified domain (dev/test).
  // It can usually only deliver to the email on your Resend account.
  return (
    process.env.RESEND_FROM_EMAIL?.trim() || "Haelo <beth.t@example.com>"
  );
}

export async function sendParentConsentEmail(params: {
  parentEmail: string;
  approveUrl: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const resend = getResendClient();
    const from = getFromEmail();

    const { error } = await resend.emails.send({
      from,
      to: params.parentEmail,
      subject: "Approve Haelo access for your child",
      html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 520px; margin: 0 auto; color: #2a2438;">
          <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #5B4B8A; font-weight: 700;">Haelo</p>
          <h1 style="font-size: 28px; line-height: 1.2; margin: 12px 0 16px;">A parent or guardian’s okay is needed</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #5a5268;">
            Someone under 13 wants to use Haelo, a private voice journaling app.
            If you are their parent or guardian and you approve, tap the button below.
          </p>
          <p style="margin: 28px 0;">
            <a href="${params.approveUrl}"
               style="display: inline-block; background: #5B4B8A; color: #fff; text-decoration: none; padding: 14px 24px; border-radius: 999px; font-family: system-ui, sans-serif; font-weight: 600; font-size: 15px;">
              Approve access
            </a>
          </p>
          <p style="font-size: 14px; line-height: 1.5; color: #5a5268;">
            This link expires in 7 days. If you did not expect this message, you can ignore it.
          </p>
        </div>
      `,
      text: [
        "Haelo — parent or guardian approval needed",
        "",
        "Someone under 13 wants to use Haelo, a private voice journaling app.",
        "If you are their parent or guardian and you approve, open this link:",
        params.approveUrl,
        "",
        "This link expires in 7 days. If you did not expect this message, you can ignore it.",
      ].join("\n"),
    });

    if (error) {
      return {
        ok: false,
        message: error.message || "Couldn’t send the approval email.",
      };
    }

    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Couldn’t send the approval email.";
    return { ok: false, message };
  }
}
