// Stage 4 step3 — schema-verification core.
//
// validateUnit() is the heart of the step3 check: does each pilot unit actually
// satisfy the stage4-unit-v1-trilingual contract once deserialized? It reports
//   - trilingual completeness (every _jp/_zh/_en field present & non-empty)
//   - summary array completeness (parity across langs AND non-empty AND no blank
//     elements — a missing/blank summary must NOT pass as OK)
//   - overview metadata presence (freq_badge, est_minutes)
//   - lang_status == "generated" for all three languages
//   - figure resolution (generated SVG file exists & looks like an <svg>)
//   - source figure resolution (origin PNG exists)
//   - quiz reference resolution (inline_quiz + challenge ids exist in question_bank)
//
// Surfacing these on 12 pilot units is the whole point (≫ discovering them on 250+).
// The content checks are split into a pure validateContent() so they can be unit
// tested without touching disk (see __tests__/validate.test.ts).

import {
  loadGeneratedSvg,
  loadQuestionBankIds,
  loadSourcePngDataUri,
} from "./loader";
import { LANGS, type TextbookUnit } from "./types";

export type Severity = "error" | "warn";

export interface SchemaIssue {
  unitId: string;
  severity: Severity;
  field: string;
  message: string;
}

export interface UnitReport {
  unitId: string;
  topicId: string;
  errorCount: number;
  warnCount: number;
  /** Every trilingual text / term / summary field is present & non-empty. */
  langComplete: boolean;
  figures: {
    generated: number;
    generatedResolved: number;
    source: number;
    sourceResolved: number;
  };
  quiz: { total: number; resolved: number; dead: string[] };
  issues: SchemaIssue[];
}

export interface ContentResult {
  issues: SchemaIssue[];
  /** False if any trilingual text / term / summary field is missing/blank. */
  contentComplete: boolean;
}

/**
 * Pure (no I/O) content checks: trilingual text, terms, summary arrays, overview
 * metadata, lang_status. Disk-backed checks (figures, quiz refs) live in
 * validateUnit(). Exported separately so corruption-detection can be unit tested.
 */
export function validateContent(u: TextbookUnit): ContentResult {
  const issues: SchemaIssue[] = [];
  let contentComplete = true;

  const push = (severity: Severity, field: string, message: string): void => {
    issues.push({ unitId: u.unit_id, severity, field, message });
  };
  // A content error means trilingual text is missing/blank → not lang-complete.
  const pushContent = (field: string, message: string): void => {
    contentComplete = false;
    push("error", field, message);
  };

  const nonEmptyStr = (v: unknown): v is string =>
    typeof v === "string" && v.trim() !== "";

  // A trilingual {base}_jp/_zh/_en triple must all be present & non-empty.
  const triCheck = (
    obj: Record<string, unknown>,
    base: string,
    where: string,
  ): void => {
    for (const l of LANGS) {
      if (!nonEmptyStr(obj[`${base}_${l}`])) {
        pushContent(`${where}.${base}_${l}`, `missing/empty ${l}`);
      }
    }
  };

  // unit-level trilingual fields
  const unitRec = u as unknown as Record<string, unknown>;
  triCheck(unitRec, "title", "unit");
  triCheck(unitRec, "unit_summary", "unit");
  triCheck(u.overview as unknown as Record<string, unknown>, "intro", "overview");

  // overview metadata (user-visible; a missing value renders as "~undefinedmin")
  if (
    typeof u.overview?.est_minutes !== "number" ||
    !Number.isFinite(u.overview.est_minutes) ||
    u.overview.est_minutes <= 0
  ) {
    push("error", "overview.est_minutes", `invalid: ${String(u.overview?.est_minutes)}`);
  }
  if (!nonEmptyStr(u.overview?.freq_badge)) {
    push("error", "overview.freq_badge", "missing/empty");
  }

  // lang_status flags (a non-"generated" language is an incompleteness signal)
  for (const l of LANGS) {
    if (u.lang_status?.[l] !== "generated") {
      push("error", `lang_status.${l}`, `= ${String(u.lang_status?.[l])}`);
    }
  }

  // terms: jp term key is `term`; zh/en are suffixed; 4 trilingual prose fields.
  if (!Array.isArray(u.terms) || u.terms.length === 0) {
    pushContent("terms", "missing/empty terms array");
  } else {
    u.terms.forEach((t, i) => {
      const where = `terms[${i}](${t.term || "?"})`;
      const rec = t as unknown as Record<string, unknown>;
      if (!nonEmptyStr(t.term)) pushContent(`${where}.term`, "missing jp term");
      if (!nonEmptyStr(t.term_zh)) pushContent(`${where}.term_zh`, "missing zh");
      if (!nonEmptyStr(t.term_en)) pushContent(`${where}.term_en`, "missing en");
      for (const base of ["definition", "explanation", "analogy", "memory_hook"]) {
        triCheck(rec, base, where);
      }
    });
  }

  // summary arrays: parity across langs AND non-empty AND no blank elements.
  const sumRec = u.summary as unknown as Record<string, unknown>;
  for (const base of ["memory_hooks", "key_points"]) {
    const perLang = LANGS.map((l) => ({ l, arr: sumRec?.[`${base}_${l}`] }));
    const lens = perLang.map(({ arr }) => (Array.isArray(arr) ? arr.length : -1));
    if (lens.includes(-1)) {
      pushContent(`summary.${base}`, `not an array: ${JSON.stringify(lens)}`);
      continue;
    }
    if (new Set(lens).size !== 1) {
      pushContent(`summary.${base}`, `length mismatch: ${JSON.stringify(lens)}`);
    }
    if (lens.every((n) => n === 0)) {
      pushContent(`summary.${base}`, "empty in all languages");
    }
    for (const { l, arr } of perLang) {
      (arr as unknown[]).forEach((el, idx) => {
        if (!nonEmptyStr(el)) {
          pushContent(`summary.${base}_${l}[${idx}]`, "empty/non-string element");
        }
      });
    }
  }

  return { issues, contentComplete };
}

export async function validateUnit(u: TextbookUnit): Promise<UnitReport> {
  const { issues, contentComplete } = validateContent(u);
  const push = (severity: Severity, field: string, message: string): void => {
    issues.push({ unitId: u.unit_id, severity, field, message });
  };

  // generated figures (Mermaid → SVG) — a missing file is an error.
  let generated = 0;
  let generatedResolved = 0;
  for (const t of u.terms ?? []) {
    if (!t.figure) continue;
    generated += 1;
    const svg = await loadGeneratedSvg(t.figure.svg_path);
    if (svg && svg.includes("<svg")) generatedResolved += 1;
    else push("error", "figure", `svg unresolved: ${t.figure.svg_path}`);
    if (!t.figure.rendered) {
      push("warn", "figure", `rendered=false: ${t.figure.svg_path}`);
    }
  }

  // source figures (origin exam PNGs) — a dangling reference is an error.
  let source = 0;
  let sourceResolved = 0;
  for (const s of u.source_figures ?? []) {
    source += 1;
    if (await loadSourcePngDataUri(s.figure_path)) sourceResolved += 1;
    else push("error", "source_figure", `png unresolved: ${s.figure_path}`);
  }

  // quiz reference resolution (deduped for honest counts)
  const ids = await loadQuestionBankIds();
  const refs = Array.from(
    new Set([
      ...(u.terms ?? []).flatMap((t) => t.inline_quiz ?? []),
      ...(u.challenge_questions ?? []),
    ]),
  );
  const dead = refs.filter((id) => !ids.has(id));
  dead.forEach((id) => push("error", "quiz_ref", `dead id: ${id}`));

  return {
    unitId: u.unit_id,
    topicId: u.topic_id,
    errorCount: issues.filter((i) => i.severity === "error").length,
    warnCount: issues.filter((i) => i.severity === "warn").length,
    langComplete: contentComplete,
    figures: { generated, generatedResolved, source, sourceResolved },
    quiz: { total: refs.length, resolved: refs.length - dead.length, dead },
    issues,
  };
}
