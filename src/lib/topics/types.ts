export type TopicSubtopic = {
  id: string;
  label: string;
  /** Soft tint within rose / violet / gold family */
  tint: string;
};

export type TopicCatalogEntry = {
  id: string;
  label: string;
  /** Planet orb color from the universe map */
  color: string;
  tagline: string;
  subtopics: TopicSubtopic[];
  explorePrompt: string;
  /** Shown when analysis fields are empty */
  insightPlaceholders: [string, string, string];
};

export type SessionType = "main" | "focus" | "daily";

export type ReflectionRow = {
  id: string;
  user_id: string;
  topic_id: string;
  subtopic_id: string | null;
  prompt_text: string;
  recorded_at: string;
  audio_url: string | null;
  transcript: string | null;
  duration_seconds: number | null;
  confidence: number | null;
  meaningfulness: number | null;
  growth_signal: boolean | null;
  stood_out: string | null;
  voice_notes: string[] | null;
  theme_label: string | null;
  created_at: string;
  /** Bank question id (primary / first for focus) */
  question_id: string | null;
  session_type: SessionType | null;
  /** Groups main-session clips; also used for focus/daily single-row sessions */
  session_id: string | null;
  /** Focus: all question ids in order */
  question_ids: string[] | null;
  /** Focus: prompt texts aligned with question_ids */
  prompt_texts: string[] | null;
  /** Focus: start offsets in seconds per question, e.g. [{questionId, startSeconds}] */
  question_timestamps: Array<{ questionId: string; startSeconds: number }> | null;
};

export type TimelineViewMode = "all" | "confidence" | "topics" | "growth";

export type TimelineNode = {
  id: string;
  /** Layout position 0–1 within the timeline viewport */
  x: number;
  y: number;
  recordedAt: string;
  subtopicId: string | null;
  tint: string;
  /** Pixel-ish radius scale 0.6–1.4 */
  size: number;
  /** Glow intensity 0–1 */
  glow: number;
  growth: boolean;
  promptText: string;
  stoodOut: string | null;
  voiceNotes: string[];
  themeLabel: string | null;
  audioUrl: string | null;
  transcript: string | null;
  /** Dimmed when filter deemphasizes this node */
  emphasis: number;
  sessionType: SessionType | null;
  isDaily: boolean;
};

export type MonthAnchor = {
  key: string;
  label: string;
  /** 0–1 along the time axis */
  x: number;
};

export type GrowthArc = {
  id: string;
  label: string;
  /** Chronological points 0–1 along the arc */
  points: number[];
  startLabel: string;
  endLabel: string;
  summary: string | null;
};

export type SummaryInsight = {
  label: string;
  value: string;
  isPlaceholder: boolean;
};

export type PlanetViewModel = {
  topic: TopicCatalogEntry;
  reflections: ReflectionRow[];
  nodes: TimelineNode[];
  monthAnchors: MonthAnchor[];
  summaryInsights: SummaryInsight[];
  growthArcs: GrowthArc[];
  isEmpty: boolean;
};
