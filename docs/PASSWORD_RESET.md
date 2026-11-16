# Halo password reset

Halo uses **Supabase Auth** for password recovery tokens and **Resend** for delivery.

## App flow

1. `/login` → **Forgot password?** → `/forgot-password`
2. Server action creates a Supabase recovery token (`generateLink`) and emails it with **Resend**
3. Link opens `/auth/confirm?token_hash=…&type=recovery&next=/auth/update-password`
4. Session established → `/auth/update-password`
5. User sets a new password → signed out → **Log in** with the new password

Halo does **not** rely on Supabase’s built-in auth mailer for password reset (it often accepts the API call but never delivers). Delivery uses your `RESEND_API_KEY`.

## Env vars required for email delivery

```bash
RESEND_API_KEY=re_...
# Must use a verified domain in Resend:
RESEND_FROM_EMAIL=Halo <noreply@yourdomain.com>
NEXT_PUBLIC_SITE_URL=https://www.halo-speak.com
```

### Verify a sending domain (required)

Resend’s onboarding sender (`beth.t@example.com`) only delivers to the email on your Resend account. Real reset emails need a verified domain.

1. Open [Resend → Domains](https://resend.com/domains).
2. Add `halo-speak.com` (or a subdomain like `mail.halo-speak.com`).
3. Add the DNS records Resend shows (DKIM TXT, SPF TXT, MX) at your DNS host.
4. Wait until status is **Verified**.
5. Set in `.env.local` and Vercel:

```bash
RESEND_FROM_EMAIL=Halo <noreply@halo-speak.com>
```

Without this, forgot-password shows a setup error instead of a fake “check your email” success.

## Supabase dashboard settings

### Authentication → URL Configuration

**Site URL** (production):

```text
https://www.halo-speak.com
```

**Redirect URLs** (add all that apply):

```text
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
https://halo-speak.com/auth/callback
https://halo-speak.com/auth/confirm
https://www.halo-speak.com/auth/callback
https://www.halo-speak.com/auth/confirm
```

Also add preview hosts if you test on Vercel previews.

You do **not** need to customize the Supabase “Reset password” email template for the Resend path. Keep redirect URLs configured so `generateLink` accepts the app origin.

## Local testing checklist

1. Confirm `RESEND_API_KEY` and `RESEND_FROM_EMAIL` (verified domain) are set.
2. Restart the Next.js dev server after env changes.
3. Sign out (or use a private window).
4. Open `/login` → Forgot password?
5. Submit a real test account email.
6. Confirm the message arrives (and Resend → Emails shows it).
7. Open the link → `/auth/update-password`.
8. Set a new password → Log in with it.
9. Confirm the old password fails.
