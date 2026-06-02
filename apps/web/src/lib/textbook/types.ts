// Stage 4 step3 — schema-verification harness types.
//
// Schema-faithful mirror of the pilot textbook data under data/ip/textbook/:
//   - unit_index.pilot.json   → UnitIndex
//   - units/{id}.json         → TextbookUnit  (schema "stage4-unit-v1-trilingual")
//
// These types exist ONLY to verify that the Phase A/B pilot JSON deserializes
// cleanly before full-corpus Phase B (Session 81, step3). Stage 6 will define the
// production data layer separately — do not treat this as the final contract.

export type Lang = "jp" | "zh" | "en";
export const LANGS: readonly Lang[] = ["jp", "zh", "en"] as const;

// ---- unit_index.pilot.json ------------------------------------------------

export interface RuleD {
  verdict: "PASS" | "CONCERNS" | "FAIL";
  rounds: number;
  history: Array<{ round: number; verdict: string }>;
}

export interface IndexTermRef {
  term: string;
  freq_in_topic: number;
  freq_global: number;
  order_reason_jp: string;
}

export interface IndexUnit {
  unit_id: string;
  topic_id: string;
  title_jp: string;
  summary_jp: string;
  rationale_jp: string;
  node_freq_badge: string;
  unit_total_freq_in_topic: number;
  term_count: number;
  terms: IndexTermRef[];
  prerequisites: string[];
}

export interface IndexTopic {
  topic_id: string;
  category: string;
  major: string;
  medium: string;
  name_jp: string;
  objective_jp: string;
  node_frequency: {
    primary_questions: number;
    secondary_questions: number;
    badge: string;
  };
  planning_notes_jp: string;
  rule_d: RuleD;
  unit_order: string[];
  units: IndexUnit[];
}

export interface UnitIndex {
  schema_version: string;
  generated_at: string;
  scope: string;
  pilot_topics: string[];
  decisions: string[];
  stats: { topics: number; units: number; terms: number };
  topics: IndexTopic[];
}

// ---- units/{id}.json  (stage4-unit-v1-trilingual) -------------------------

export interface UnitFigure {
  mermaid: string;
  svg_path: string; // relative to data/ip/textbook/
  rendered: boolean;
}

export interface SourceFigure {
  source: string;
  question_id: string;
  figure_path: string; // relative to data/ip/exams/
  figure_type: string;
  figure_description: string | null;
  group_id: string | null;
}

export interface UnitTerm {
  // NB: the JP term key is `term` (not `term_jp`); zh/en use the suffix form.
  term: string;
  term_zh: string;
  term_en: string;
  definition_jp: string;
  definition_zh: string;
  definition_en: string;
  explanation_jp: string;
  explanation_zh: string;
  explanation_en: string;
  analogy_jp: string;
  analogy_zh: string;
  analogy_en: string;
  memory_hook_jp: string;
  memory_hook_zh: string;
  memory_hook_en: string;
  inline_quiz: string[];
  inline_fallback: boolean;
  figure: UnitFigure | null;
}

export interface UnitOverview {
  intro_jp: string;
  intro_zh: string;
  intro_en: string;
  freq_badge: string;
  est_minutes: number;
}

export interface UnitSummary {
  memory_hooks_jp: string[];
  memory_hooks_zh: string[];
  memory_hooks_en: string[];
  key_points_jp: string[];
  key_points_zh: string[];
  key_points_en: string[];
}

export interface TextbookUnit {
  schema_version: string;
  unit_id: string;
  topic_id: string;
  category: string;
  title_jp: string;
  title_zh: string;
  title_en: string;
  unit_summary_jp: string;
  unit_summary_zh: string;
  unit_summary_en: string;
  order_in_topic: number;
  prerequisites: string[];
  overview: UnitOverview;
  terms: UnitTerm[];
  summary: UnitSummary;
  challenge_questions: string[];
  source_figures: SourceFigure[];
  lang_status: { jp: string; zh: string; en: string };
}
