/**
 * Auth types for Haelo signup / sign-in against Supabase Auth.
 */

export type SignUpInput = {
  email: string;
  password: string;
  /** Stored as user metadata `first_name` */
  firstName: string;
  /** Haelo username (without @); claimed after signup when a session exists */
  username: string;
};

export type SignUpErrorCode =
  | "invalid_email"
  | "weak_password"
  | "email_taken"
  | "username_invalid"
  | "username_taken"
  | "username_reserved"
  | "unknown";

export type SignUpResult =
  | { ok: true; needsEmailConfirmation: boolean; usernameClaimed: boolean }
  | { ok: false; code: SignUpErrorCode; message: string };

export type SignInInput = {
  email: string;
  password: string;
};

export type SignInErrorCode =
  | "invalid_email"
  | "invalid_credentials"
  | "email_not_confirmed"
  | "unknown";

export type SignInResult =
  | { ok: true }
  | { ok: false; code: SignInErrorCode; message: string };

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; message: string };

export type UpdatePasswordResult =
  | { ok: true }
  | { ok: false; message: string };

export type AccountProfile = {
  firstName: string;
  email: string;
};
