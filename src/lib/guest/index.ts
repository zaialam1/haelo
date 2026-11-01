/**
 * Client-safe guest helpers only.
 * Server-only modules (loadGuestSession, limits) must be imported directly
 * from their files — never re-exported here — so Client Components don't
 * pull in next/headers via the Supabase server client.
 */
export {
  GUEST_MAX_SESSIONS,
  GUEST_RETENTION_HOURS,
  GUEST_CONVERSION_FLAG_KEY,
  GUEST_RECENT_PROMPTS_KEY,
  GUEST_TRY_PATH,
} from "./config";
export {
  isAnonymousUser,
  isAnonymousClaims,
  ensureGuestSession,
  clearGuestSessionIfAnonymous,
  markGuestConversionFlag,
  consumeGuestConversionFlag,
  peekGuestConversionFlag,
} from "./auth";
export { pickGuestPrompt, rememberGuestPromptId } from "./prompts";
