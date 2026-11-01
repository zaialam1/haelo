/** Guest try limits — anonymous auth + recycled session engine. */

/** Max planet sessions (started) per anonymous user before soft block. */
export const GUEST_MAX_SESSIONS = 3;

/** Delete anonymous guest accounts (and cascaded sessions/audio) after this age. */
export const GUEST_RETENTION_HOURS = 24;

/** sessionStorage: set when a guest starts /try; read on signup for conversion. */
export const GUEST_CONVERSION_FLAG_KEY = "halo_guest_try";

/** sessionStorage: prompt ids shown this browser visit (cooldown). */
export const GUEST_RECENT_PROMPTS_KEY = "halo_guest_recent_prompts";

export const GUEST_TRY_PATH = "/try";
