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

// ---- units/{id}.json  (textbook-unit-v2, D-196 §0-9) ------------------------
//
// v2 keeps every v1 field above as a *compatibility* field (plain text, no inline
// markup, written deterministically by the merge script from the new fields), so
// the glossary, AI 先生 anchors, today page and validateContent read a v2 unit as
// if it were v1. The new fields carry the D-195 content; the reader uses them via
// normalizeUnit. validateV2 asserts stripInline(new) == compat. Imported by Node
// scripts through validateV2.ts (native type stripping): no enums / namespaces.

export const V2_SCHEMA = "textbook-unit-v2";

/** A label in all three languages (figure data). */
export interface Text3 {
  jp: string;
  zh: string;
  en: string;
}

/** One step of a `mode: "steps"` figure: a one-line caption per language + the kind's state. */
export interface FigStep<S> {
  caption_jp: string;
  caption_zh: string;
  caption_en: string;
  state: S;
}

export interface SvgFigData {
  /** relative to data/ip/textbook/ (= the v1 `figure.svg_path`) */
  path: string;
}
export interface TableFigData {
  cols: Text3[];
  rows: { cells: Text3[]; key?: boolean }[];
}
export interface CompareFigData {
  a: Text3;
  b: Text3;
  rows: { label: Text3; a: Text3; b: Text3; key?: boolean }[];
}
/** A left-to-right sequence of nodes (process / procedure / cause → effect). */
export interface FlowFigData {
  nodes: { id: string; label: Text3 }[];
}
/** Steps: the first `show` nodes are visible, the last of them highlighted. */
export interface FlowState {
  show: number;
}
export interface TreeNode {
  id: string;
  label: Text3;
  children?: TreeNode[];
}
export interface TreeFigData {
  root: TreeNode;
}
/** Steps: levels 1..depth are open (1 = the root only). */
export interface TreeState {
  depth: number;
}
/** An arrow-diagram activity (criticalPath input, Task 7). */
export interface NetworkAct {
  from: string;
  to: string;
  days: number;
  dummy?: boolean;
  /** short activity name shown on the arrow ("A", "設計"); language-neutral */
  name?: string;
}
export interface NetworkFigData {
  nodes: string[];
  acts: NetworkAct[];
}

/** A figure (§0-11): one kind of the closed registry (figureSpec.ts FIGURE_KINDS), driven by data only. */
export type FigSpec =
  | { kind: "svg"; mode: "static"; data: SvgFigData }
  | { kind: "table"; mode: "static"; data: TableFigData }
  | { kind: "compare"; mode: "static"; data: CompareFigData }
  | { kind: "flow"; mode: "static" | "steps"; data: FlowFigData; steps?: FigStep<FlowState>[] }
  | { kind: "tree"; mode: "static" | "steps"; data: TreeFigData; steps?: FigStep<TreeState>[] }
  | { kind: "network"; mode: "widget"; data: NetworkFigData };

/** 「考点」 box: `exam` = 常考 (must cite the questions in `qids`), `mix` = 易混. */
export interface V2Point {
  kind: "exam" | "mix";
  text_jp: string;
  text_zh: string;
  text_en: string;
  qids?: string[];
}

export interface V2PairRow {
  label_jp: string;
  label_zh: string;
  label_en: string;
  a_jp: string;
  a_zh: string;
  a_en: string;
  b_jp: string;
  b_zh: string;
  b_en: string;
  /** the decisive difference (highlighted) */
  key: boolean;
}

/** 易混組 of terms `a` / `b` (JP headwords, a before b in unit order); shown after `b`. */
export interface V2Pair {
  a: string;
  b: string;
  rows: V2PairRow[];
}

/** 用語総表 row; `extra_{lang}` has one cell per `overview_cols_{lang}` column. */
export interface V2OverviewRow {
  term: string;
  one_line_jp: string;
  one_line_zh: string;
  one_line_en: string;
  extra_jp: string[];
  extra_zh: string[];
  extra_en: string[];
}

export interface UnitTermV2 extends UnitTerm {
  /** 一句話 (inline markup allowed) → compat definition_* */
  one_jp: string;
  one_zh: string;
  one_en: string;
  /** 展開 2〜3 sentences (markup allowed) → compat explanation_* */
  detail_jp: string;
  detail_zh: string;
  detail_en: string;
  // 比喩: the field name is shared with the compat field, so `analogy_{lang}` stays
  // plain text in v2 too ("" in all three = no analogy for this term).
  /** 記法 (markup allowed), absent = none → compat memory_hook_* ("" when absent) */
  hook_jp?: string;
  hook_zh?: string;
  hook_en?: string;
  points: V2Point[];
  fig: FigSpec | null;
  /** this term's past questions (resolvable, same topic, the question's terms include this term) → compat inline_quiz */
  quiz: string[];
}

export interface TextbookUnitV2 extends TextbookUnit {
  schema_version: typeof V2_SCHEMA;
  terms: UnitTermV2[];
  /** 学習目標 (markup allowed) → compat overview.intro_* (introOf) */
  goals_jp: string[];
  goals_zh: string[];
  goals_en: string[];
  /** 用語総表 extra column headers */
  overview_cols_jp: string[];
  overview_cols_zh: string[];
  overview_cols_en: string[];
  overview_rows: V2OverviewRow[];
  pairs: V2Pair[];
  /** 要点 3〜5 (markup allowed) → compat summary.key_points_* */
  key_points_jp: string[];
  key_points_zh: string[];
  key_points_en: string[];
}
