import type { AgeGateStatus } from "@/lib/age-gate/types";

export type AccountRole = "user" | "professional";

export type Profile = {
  id: string;
  username: string | null;
  usernameNormalized: string | null;
  accountRole: AccountRole;
  ageGateStatus: AgeGateStatus;
  ageGateClearedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfileRow = {
  id: string;
  username: string | null;
  username_normalized: string | null;
  account_role: AccountRole;
  age_gate_status?: AgeGateStatus | null;
  age_gate_cleared_at?: string | null;
  created_at: string;
  updated_at: string;
};

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    usernameNormalized: row.username_normalized,
    accountRole: row.account_role,
    ageGateStatus: row.age_gate_status ?? "unverified",
    ageGateClearedAt: row.age_gate_cleared_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
