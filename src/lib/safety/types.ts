export type ReportObjectType =
  | "account"
  | "connection_request"
  | "orbit_recommendation";

export type ReportReason =
  | "unwanted_contact"
  | "inappropriate_message"
  | "impersonation"
  | "unsafe_behavior"
  | "spam"
  | "other";

export const REPORT_REASONS: readonly {
  value: ReportReason;
  label: string;
}[] = [
  { value: "unwanted_contact", label: "Unwanted contact" },
  { value: "inappropriate_message", label: "Inappropriate message" },
  { value: "impersonation", label: "Pretending to be someone else" },
  { value: "unsafe_behavior", label: "Unsafe behavior" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
];

export type BlockedAccount = {
  userId: string;
  username: string | null;
  blockedAt: string;
};

export type AnalysisFeedbackReason =
  | "didnt_match"
  | "quote_unrelated"
  | "advice_not_useful"
  | "voice_analysis_wrong"
  | "other";

export const ANALYSIS_FEEDBACK_REASONS: readonly {
  value: AnalysisFeedbackReason;
  label: string;
}[] = [
  { value: "didnt_match", label: "Didn't match what I said" },
  { value: "quote_unrelated", label: "Quote felt unrelated" },
  { value: "advice_not_useful", label: "Advice wasn't useful" },
  { value: "voice_analysis_wrong", label: "Voice/delivery analysis felt wrong" },
  { value: "other", label: "Other" },
];
