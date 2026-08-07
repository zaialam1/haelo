/** Keep DB convention: "user" = Personal account in product copy. */
export type AccountRole = "user" | "professional";

export type ProfessionalType =
  | "school_counselor"
  | "therapist"
  | "psychologist"
  | "educator"
  | "coach_or_mentor"
  | "other";

export type ProfessionalVerificationStatus =
  | "pending"
  | "verified"
  | "rejected";

export type ProfessionalProfile = {
  userId: string;
  displayName: string;
  professionalType: ProfessionalType;
  organizationName: string | null;
  verificationStatus: ProfessionalVerificationStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalProfileRow = {
  user_id: string;
  display_name: string;
  professional_type: ProfessionalType;
  organization_name: string | null;
  verification_status: ProfessionalVerificationStatus;
  created_at: string;
  updated_at: string;
};

export const PROFESSIONAL_TYPE_OPTIONS: {
  value: ProfessionalType;
  label: string;
}[] = [
  { value: "school_counselor", label: "School counselor" },
  { value: "therapist", label: "Therapist" },
  { value: "psychologist", label: "Psychologist" },
  { value: "educator", label: "Educator" },
  { value: "coach_or_mentor", label: "Coach or mentor" },
  { value: "other", label: "Other" },
];

export function mapProfessionalProfileRow(
  row: ProfessionalProfileRow,
): ProfessionalProfile {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    professionalType: row.professional_type,
    organizationName: row.organization_name,
    verificationStatus: row.verification_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function professionalTypeLabel(type: ProfessionalType): string {
  return (
    PROFESSIONAL_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
  );
}

export function accountRoleLabel(role: AccountRole): "Personal" | "Professional" {
  return role === "professional" ? "Professional" : "Personal";
}

export function verificationStatusLabel(
  status: ProfessionalVerificationStatus,
): string {
  switch (status) {
    case "verified":
      return "Verified";
    case "rejected":
      return "Not approved";
    default:
      return "Pending";
  }
}
