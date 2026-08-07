export type ConnectionStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "removed";

export type NotificationType =
  | "connection_request"
  | "orbit_recommendation"
  | "orbit_recommendation_reminder";

export type ProfessionalConnection = {
  id: string;
  professionalUserId: string;
  userId: string;
  status: ConnectionStatus;
  requestedAt: string;
  respondedAt: string | null;
  removedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Present when joined for display */
  counterpartUsername?: string | null;
};

export type ProfessionalConnectionRow = {
  id: string;
  professional_user_id: string;
  user_id: string;
  status: ConnectionStatus;
  requested_at: string;
  responded_at: string | null;
  removed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  referenceId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  reference_id: string | null;
  read_at: string | null;
  created_at: string;
};

export type UsernameSearchHit = {
  id: string;
  username: string;
};

export function mapConnectionRow(
  row: ProfessionalConnectionRow,
): ProfessionalConnection {
  return {
    id: row.id,
    professionalUserId: row.professional_user_id,
    userId: row.user_id,
    status: row.status,
    requestedAt: row.requested_at,
    respondedAt: row.responded_at,
    removedAt: row.removed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapNotificationRow(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    referenceId: row.reference_id,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}
