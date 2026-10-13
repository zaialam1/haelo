export type AccountRole = "user" | "professional";

export type Profile = {
  id: string;
  username: string | null;
  usernameNormalized: string | null;
  accountRole: AccountRole;
  createdAt: string;
  updatedAt: string;
};

export type ProfileRow = {
  id: string;
  username: string | null;
  username_normalized: string | null;
  account_role: AccountRole;
  created_at: string;
  updated_at: string;
};

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    usernameNormalized: row.username_normalized,
    accountRole: row.account_role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
