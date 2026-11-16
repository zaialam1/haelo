# Halo password reset

Halo uses **Supabase Auth** for password recovery.

## App flow

1. `/login` → **Forgot password?** → `/forgot-password`
2. User submits email → `supabase.auth.resetPasswordForEmail` with  
   `redirectTo = {origin}/auth/callback?next=/auth/update-password`
3. Email link returns to Halo:
   - **PKCE (default ConfirmationURL):** `/auth/callback?code=…&next=/auth/update-password` (same browser as the request)
   - **Recommended token hash (cross-browser):** `/auth/confirm?token_hash=…&type=recovery&next=/auth/update-password`
4. Session established → `/auth/update-password`
5. User sets a new password → signed out → **Log in** with the new password

## Supabase dashboard settings you must configure

### Authentication → URL Configuration

**Site URL** (production):

```text
https://www.halo-speak.com
```

(or `https://halo-speak.com` if that is your canonical host)

**Redirect URLs** (add all that apply):

```text
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
https://halo-speak.com/auth/callback
https://halo-speak.com/auth/confirm
https://www.halo-speak.com/auth/callback
https://www.halo-speak.com/auth/confirm
```

Also add preview deployment callback URLs if you test resets on Vercel previews, e.g.:

```text
https://*.vercel.app/auth/callback
https://*.vercel.app/auth/confirm
```

(Only if your Supabase project allows wildcard redirect URLs; otherwise add specific preview hosts.)

### Authentication → Email Templates → Reset password

For recovery links that work when the email is opened on another device or browser, use the token hash template:

```html
<h2>Reset your Halo password</h2>
<p>Someone requested a password reset for your Halo account.</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password">
    Choose a new password
  </a>
</p>
<p>If you didn’t ask for this, you can ignore this email.</p>
```

If you keep Supabase’s default `{{ .ConfirmationURL }}`, same-browser PKCE via `/auth/callback` still works, but opening the link in a different browser often fails.

### SMTP / email delivery

Supabase must be able to send mail (built-in email or custom SMTP). Check Auth logs if requests succeed in the app but no email arrives.

## Local testing checklist

1. Sign out (or use a private window).
2. Open `/login` → Forgot password?
3. Submit a real test account email.
4. Confirm Auth logs show a recovery email.
5. Open the link → `/auth/update-password`.
6. Set a new password → Log in with it.
7. Confirm the old password fails.
