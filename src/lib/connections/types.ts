import type { AccountRole } from "@/lib/profiles/types";

export type ConnectionStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "removed";

export type NotificationType =
  | "connection_request"
  | "orbit_recommendation"
  | "orbit_recommendation_reminder"
  | "celestial_discovery"
  | "milestone_moment";

/** Mutual relationship between two Haelo accounts (either may be professional). */
export type HaeloConnection = {
  id: string;
  requesterUserId: string;
  recipientUserId: string;
  status: ConnectionStatus;
  requestedAt: string;
  respondedAt: string | null;
  removedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Present when joined for display */
  counterpartUsername?: string | null;
  counterpartAccountRole?: AccountRole | null;
};

/** @deprecated Prefer HaeloConnection — kept as alias during refactor. */
export type ProfessionalConnection = HaeloConnection;

export type ConnectionRow = {
  id: string;
  requester_user_id: string;
  recipient_user_id: string;
  status: ConnectionStatus;
  requested_at: string;
  responded_at: string | null;
  removed_at: string | null;
  created_at: string;
  updated_at: string;
  /** Legacy overlap during deploy */
  professional_user_id?: string;
  user_id?: string;
};

/** @deprecated Prefer ConnectionRow */
export type ProfessionalConnectionRow = ConnectionRow;

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
  accountRole: AccountRole;
};

export function mapConnectionRow(row: ConnectionRow): HaeloConnection {
  const requester =
    row.requester_user_id ?? row.professional_user_id ?? "";
  const recipient = row.recipient_user_id ?? row.user_id ?? "";
  return {
    id: row.id,
    requesterUserId: requester,
    recipientUserId: recipient,
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

/** Counterpart user id relative to `viewerId`. */
export function connectionCounterpartId(
  connection: HaeloConnection,
  viewerId: string,
): string {
  return connection.requesterUserId === viewerId
    ? connection.recipientUserId
    : connection.requesterUserId;
}

export function accountRoleDisplayLabel(
  role: AccountRole | null | undefined,
): "Personal" | "Professional" {
  return role === "professional" ? "Professional" : "Personal";
}
