import { mapAnalysisRow, pickAnalysisRow } from "@/lib/sessions/analysisMap";
import type {
  SessionAnalysis,
  SessionAnalysisRow,
  SessionAttemptRow,
  SessionRow,
  SessionWithAttempts,
} from "@/lib/sessions/types";

export const SESSION_DETAIL_SELECT = `
  id,
  user_id,
  planet,
  prompt_id,
  prompt_text_snapshot,
  status,
  source,
  user_reflection,
  feeling_reflection,
  sounded_like_you,
  authenticity_choice,
  analysis_status,
  created_at,
  completed_at,
  session_attempts (
    id,
    session_id,
    attempt_number,
    storage_path,
    mime_type,
    file_size_bytes,
    duration_seconds,
    transcript,
    transcript_status,
    created_at
  ),
  session_analyses (
    id,
    session_id,
    status,
    strength_title,
    strength_description,
    observation_title,
    observation_description,
    evidence,
    experiment_title,
    experiment_instruction,
    comparison_observation,
    created_at,
    completed_at
  )
`;

export type SessionDetail = SessionRow & {
  session_attempts: SessionAttemptRow[];
  analysis: SessionAnalysis | null;
};

export function normalizeSession(row: SessionWithAttempts): SessionDetail {
  const attempts = [...(row.session_attempts ?? [])].sort(
    (a, b) => a.attempt_number - b.attempt_number,
  );
  const analysisRow = pickAnalysisRow(
    row.session_analyses as
      | SessionAnalysisRow
      | SessionAnalysisRow[]
      | null
      | undefined,
  );

  return {
    ...row,
    feeling_reflection: row.feeling_reflection ?? null,
    sounded_like_you: row.sounded_like_you ?? null,
    authenticity_choice: row.authenticity_choice ?? null,
    session_attempts: attempts,
    analysis: mapAnalysisRow(analysisRow),
  };
}

export function getAttempt(
  detail: SessionDetail,
  attemptNumber: number,
): SessionAttemptRow | null {
  return (
    detail.session_attempts.find((a) => a.attempt_number === attemptNumber) ??
    null
  );
}
