export type OrbitRecommendationStatus =
  | "new"
  | "viewed"
  | "started"
  | "completed"
  | "dismissed";

export const PURPOSE_MAX_LENGTH = 160;
export const MESSAGE_MAX_LENGTH = 500;

export function isActiveRecommendationStatus(
  status: OrbitRecommendationStatus,
): boolean {
  return status === "new" || status === "viewed";
}

export type OrbitRecommendation = {
  id: string;
  professionalUserId: string;
  recipientUserId: string;
  connectionId: string;
  orbitKey: string;
  orbitVersion: number;
  purpose: string;
  personalMessage: string | null;
  status: OrbitRecommendationStatus;
  createdAt: string;
  viewedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  dismissedAt: string | null;
  reminderSentAt: string | null;
  updatedAt: string;
  /** Present on detail / list joins */
  professionalUsername?: string | null;
  recipientUsername?: string | null;
};

export type OrbitRecommendationDetail = OrbitRecommendation & {
  professionalUsername: string | null;
};

export type OrbitRecommendationRow = {
  id: string;
  professional_user_id: string;
  recipient_user_id: string;
  connection_id: string;
  orbit_key: string;
  orbit_version: number;
  purpose: string;
  personal_message: string | null;
  status: OrbitRecommendationStatus;
  created_at: string;
  viewed_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  dismissed_at: string | null;
  reminder_sent_at: string | null;
  updated_at: string;
  professional_username?: string | null;
  recipient_username?: string | null;
};

export type CreateOrbitRecommendationResult =
  | { ok: true; recommendationId: string }
  | {
      ok: false;
      error:
        | "unauthenticated"
        | "forbidden"
        | "not_connected"
        | "invalid_recipient"
        | "invalid_orbit"
        | "invalid_orbit_version"
        | "invalid_purpose"
        | "invalid_message"
        | "duplicate_active"
        | "unknown";
      message: string;
      existingRecommendationId?: string;
    };

export function mapOrbitRecommendationRow(
  row: OrbitRecommendationRow,
): OrbitRecommendation {
  return {
    id: row.id,
    professionalUserId: row.professional_user_id,
    recipientUserId: row.recipient_user_id,
    connectionId: row.connection_id,
    orbitKey: row.orbit_key,
    orbitVersion: row.orbit_version,
    purpose: row.purpose,
    personalMessage: row.personal_message,
    status: row.status,
    createdAt: row.created_at,
    viewedAt: row.viewed_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    dismissedAt: row.dismissed_at,
    reminderSentAt: row.reminder_sent_at,
    updatedAt: row.updated_at,
    professionalUsername: row.professional_username ?? null,
    recipientUsername: row.recipient_username ?? null,
  };
}
