-- Journey visualization metrics (internal 1–100 scores).
-- Stored with session analysis so Journey never re-calls the LLM on load.
-- Numeric scores are never shown in the post-session analysis UI.

alter table public.session_analyses
  add column if not exists journey_metrics jsonb,
  add column if not exists journey_metrics_version text,
  add column if not exists journey_metrics_prompt_version text,
  add column if not exists journey_metrics_model text,
  add column if not exists journey_metrics_scored_at timestamptz;

comment on column public.session_analyses.journey_metrics is
  'Array of { metric, score, level, status } for Journey Y-position. Internal only.';

comment on column public.session_analyses.journey_metrics_version is
  'Rubric/mapping version used when scores were written.';

comment on column public.session_analyses.journey_metrics_prompt_version is
  'Prompt calibration version used when scores were written.';

comment on column public.session_analyses.journey_metrics_model is
  'Model id used when journey metrics were scored.';
