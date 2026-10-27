// Stage 7 Phase 3 (D-196 §0-9 / §0-11 / §0-13, D-195) — the v2 unit validator,
// shared by the web tests and the generation scripts (scripts/textbook-v2-*.mjs
// import this file with Node's native type stripping: pure, no fs, relative
// imports with the `.ts` extension, `import type` for types, no enums).
//
// validateV2(unit, ctx) checks one unit against
//   - the invariants (§0-9): unit_id / topic_id / category / title_* / the
//     headwords and their order as unit_index lists them, term_zh / term_en as
//     the v1 unit had them. A broken invariant is fatal: nothing else is checked.
//   - three-language completeness, well-formed inline markup (§0-12),
//     compat field == the value derived from the new fields (stripInline,
//     introOf, hookLines; the merge script writes them with the same functions),
//   - D-195: 展開 2〜3 sentences, 要点 3〜5, banned phrasing (§9 → BANNED_PHRASES),
//     three or more of the unit's headwords in one sentence (§9 羅列), a memory
//     hook that restates the definition (§6),
//   - figures against the closed registry (figureSpec.ts), 易混 pairs, 考点
//     (`exam` cites its questions), past questions (resolvable, same topic; the
//     per-term ones must list the term).
// Each problem is one V2Issue with a stable `code`.

import { figErrors } from "./figureSpec.ts";
import { inlineErrors, stripInline } from "./inline.ts";
import { LANGS, V2_SCHEMA, type Lang, type TextbookUnitV2, type UnitTermV2 } from "./types.ts";

export type V2IssueCode =
  | "schema"
  | "invariant"
  | "meta"
  | "missing"
  | "markup"
  | "compat"
  | "sentences"
  | "key-points"
  | "overview"
  | "pair"
  | "point"
  | "fig"
  | "quiz"
  | "challenge"
  | "banned"
  | "listing"
  | "hook";

export interface V2Issue {
  unitId: string;
  code: V2IssueCode;
  field: string;
  message: string;
}

export interface V2QuestionRef {
  topic_id: string;
  terms: readonly string[];
}

export interface V2Context {
  /** The unit as unit_index.json lists it, with its topic's category. */
  index: {
    unit_id: string;
    topic_id: string;
    category: string;
    title_jp: string;
    title_zh?: string;
    title_en?: string;
    terms: string[];
  };
  /** Headword glosses of the v1 unit the v2 file replaces (term_zh / term_en invariant); unchecked when absent. */
  v1Terms?: readonly { term: string; term_zh: string; term_en: string }[];
  /** data/ip/quiz/questions.json by id. */
  questions: ReadonlyMap<string, V2QuestionRef>;
}

/** The parts of unit_index.json that v2Context reads. */
export interface V2IndexInput {
  topics: readonly {
    topic_id: string;
    category: string;
    units?: readonly {
      unit_id: string;
      title_jp: string;
      title_zh?: string;
      title_en?: string;
      terms?: readonly { term: string }[];
    }[];
  }[];
}

/** The context for `unitId`; null when the index does not list it. */
export function v2Context(
  index: V2IndexInput,
  questions: readonly ({ id: string } & V2QuestionRef)[],
  unitId: string,
  v1Terms?: V2Context["v1Terms"],
): V2Context | null {
  for (const t of index.topics) {
    const u = (t.units ?? []).find((x) => x.unit_id === unitId);
    if (!u) continue;
    return {
      index: {
        unit_id: u.unit_id,
        topic_id: t.topic_id,
        category: t.category,
        title_jp: u.title_jp,
        title_zh: u.title_zh,
        title_en: u.title_en,
        terms: (u.terms ?? []).map((x) => x.term),
      },
      v1Terms,
      questions: new Map(questions.map((q) => [q.id, { topic_id: q.topic_id, terms: q.terms }])),
    };
  }
  return null;
}

// ---- compat derivation (the merge script writes compat fields with these) ----

const ENDS: Record<Lang, RegExp> = { jp: /[。！？]$/, zh: /[。！？]$/, en: /[.!?]$/ };

/** overview.intro_{lang}: the stripped goals as one paragraph (a missing full stop added). */
export function introOf(goals: readonly string[], lang: Lang): string {
  const stop = lang === "en" ? "." : "。";
  return goals
    .map((g) => stripInline(g).trim())
    .map((g) => (ENDS[lang].test(g) ? g : `${g}${stop}`))
    .join(lang === "en" ? " " : "");
}

const gloss = (t: UnitTermV2, lang: Lang): string => (lang === "jp" ? t.term : lang === "zh" ? t.term_zh : t.term_en);

/** summary.memory_hooks_{lang}: 「headword: hook」 for each term with a hook, in unit order (v1 format). */
export function hookLines(u: TextbookUnitV2, lang: Lang): string[] {
  return u.terms
    .filter((t) => nonEmpty(t[`hook_${lang}`]))
    .map((t) => `${gloss(t, lang)}${lang === "zh" ? "：" : ": "}${stripInline(t[`hook_${lang}`] as string)}`);
}

// ---- D-195 §9 style rules ----------------------------------------------------

/** D-195 §9: stock closing lines, exam-talk boilerplate, unfounded exaggeration. */
export const BANNED_PHRASES: Record<Lang, readonly RegExp[]> = {
  jp: [
    /理解しておきましょう/,
    /(覚え|押さえ)ておきましょう/,
    /試験では[^。]*(問われ|狙われ|出題され)/,
    /(非常に|極めて|きわめて)重要/,
    /必ず(出題|出る)/,
  ],
  zh: [/考试(中|时)?(会|常|经常|往往)?(考查|考到|问到)/, /务必(理解|掌握|记住|牢记)/, /(非常|极其|极为)重要/, /一定会考/],
  en: [
    /\bmake sure (to|you) (understand|remember|know)\b/i,
    /\bthe exam (often |frequently |typically )?(asks|tests|targets)\b/i,
    /\b(is|are) (frequently|often) tested\b/i,
    /\b(extremely|crucially) important\b/i,
    /\bit is (important|essential) to (understand|remember)\b/i,
  ],
};

/** Sentences of plain text: 。！？ for jp / zh; . ! ? followed by a space for en (so 1.5 is one number). */
export function sentences(s: string, lang: Lang): string[] {
  const parts = lang === "en" ? s.split(/(?<=[.!?])\s+/) : s.split(/(?<=[。！？])/);
  return parts.map((p) => p.trim()).filter((p) => p !== "");
}

/** 展開 length (D-195 §1). */
export const DETAIL_SENTENCES = { min: 2, max: 3 } as const;
/** 要点 count (D-195 §7). */
export const KEY_POINTS = { min: 3, max: 5 } as const;
/** D-195 §9 羅列: this many of the unit's headwords in one JP sentence. */
export const LISTING_MAX = 2;

// ---- validator -----------------------------------------------------------------

type Rec = Record<string, unknown>;
const rec = (o: unknown): Rec => (o && typeof o === "object" ? (o as Rec) : {});
function nonEmpty(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}
const strList = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
const sameList = (a: unknown, b: readonly unknown[]): boolean =>
  Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);

export function validateV2(unit: TextbookUnitV2, ctx: V2Context): V2Issue[] {
  const u = unit;
  const ur = rec(u);
  const issues: V2Issue[] = [];
  const push = (code: V2IssueCode, field: string, message: string): void => {
    issues.push({ unitId: String(ur.unit_id), code, field, message });
  };

  if (u.schema_version !== V2_SCHEMA) {
    push("schema", "schema_version", `expected ${V2_SCHEMA}, got ${JSON.stringify(u.schema_version)}`);
    return issues;
  }

  // ---- invariants (fatal) ----
  const ix = ctx.index;
  for (const k of ["unit_id", "topic_id", "category", "title_jp", "title_zh", "title_en"] as const) {
    const want = ix[k];
    if (want !== undefined && ur[k] !== want) push("invariant", k, `${JSON.stringify(ur[k])} ≠ index ${JSON.stringify(want)}`);
  }
  const terms: UnitTermV2[] = Array.isArray(u.terms) ? u.terms : [];
  const names = terms.map((t) => rec(t).term);
  if (!sameList(names, ix.terms)) {
    push("invariant", "terms[].term", `headwords ${JSON.stringify(names)} ≠ index ${JSON.stringify(ix.terms)}`);
  }
  if (ctx.v1Terms) {
    const v1 = new Map(ctx.v1Terms.map((t) => [t.term, t]));
    terms.forEach((t, i) => {
      const was = v1.get(t.term);
      if (was && (t.term_zh !== was.term_zh || t.term_en !== was.term_en)) {
        push("invariant", `terms[${i}](${t.term})`, `term_zh / term_en ≠ v1 (${was.term_zh} / ${was.term_en})`);
      }
    });
  }
  if (issues.length > 0) return issues;

  const qOf = (id: unknown) => (typeof id === "string" ? ctx.questions.get(id) : undefined);

  /** Inline markup of one string; true when well-formed. */
  const markupOk = (field: string, s: string): boolean => {
    const errs = inlineErrors(s);
    if (errs.length > 0) push("markup", field, errs.join("; "));
    return errs.length === 0;
  };

  /** D-195 §9 banned phrasing + JP 羅列 on one plain text. */
  const style = (field: string, plain: string, lang: Lang): void => {
    const hit = BANNED_PHRASES[lang].find((re) => re.test(plain));
    if (hit) push("banned", field, `D-195 §9 banned phrasing ${hit}`);
    if (lang === "jp") {
      for (const s of sentences(plain, "jp")) {
        const listed = ix.terms.filter((h) => s.includes(h));
        if (listed.length > LISTING_MAX) push("listing", field, `D-195 §9: ${listed.length} headwords in one sentence (${listed.join("・")})`);
      }
    }
  };

  /** A `{base}_{lang}` prose triple: present, well-formed, style; returns the stripped texts or null. */
  const prose = (o: Rec, base: string, where: string): Record<Lang, string> | null => {
    const missing = LANGS.filter((l) => !nonEmpty(o[`${base}_${l}`]));
    if (missing.length > 0) {
      push("missing", `${where}.${base}`, `missing/empty ${missing.join(", ")}`);
      return null;
    }
    let ok = true;
    const out = {} as Record<Lang, string>;
    for (const l of LANGS) {
      const s = o[`${base}_${l}`] as string;
      if (!markupOk(`${where}.${base}_${l}`, s)) ok = false;
      out[l] = stripInline(s);
      style(`${where}.${base}_${l}`, out[l], l);
    }
    return ok ? out : null;
  };

  /** A `{base}_{lang}` list triple: same length ≥ 1, items non-empty, well-formed; stripped lists or null. */
  const proseList = (o: Rec, base: string, where: string): Record<Lang, string[]> | null => {
    const lists = LANGS.map((l) => o[`${base}_${l}`]);
    if (!lists.every(strList) || new Set(lists.map((x) => (x as string[]).length)).size !== 1 || (lists[0] as string[]).length === 0) {
      push("missing", `${where}.${base}`, `need the same non-zero count in jp / zh / en: ${JSON.stringify(lists.map((x) => (Array.isArray(x) ? x.length : null)))}`);
      return null;
    }
    let ok = true;
    const out = {} as Record<Lang, string[]>;
    LANGS.forEach((l, li) => {
      const arr = lists[li] as string[];
      out[l] = arr.map((s, i) => {
        if (!nonEmpty(s)) {
          push("missing", `${where}.${base}_${l}[${i}]`, "empty");
          ok = false;
        } else if (!markupOk(`${where}.${base}_${l}[${i}]`, s)) ok = false;
        const plain = stripInline(s);
        style(`${where}.${base}_${l}[${i}]`, plain, l);
        return plain;
      });
    });
    return ok ? out : null;
  };

  const compat = (field: string, got: unknown, want: unknown): void => {
    const eq = Array.isArray(want) ? sameList(got, want) : got === want;
    if (!eq) push("compat", field, `${JSON.stringify(got)} ≠ derived ${JSON.stringify(want)}`);
  };

  // ---- unit metadata ----
  const ls = rec(u.lang_status);
  for (const l of LANGS) if (ls[l] !== "generated") push("meta", `lang_status.${l}`, `= ${JSON.stringify(ls[l])}`);
  const ov = rec(u.overview);
  if (!nonEmpty(ov.freq_badge)) push("meta", "overview.freq_badge", "missing/empty");
  if (typeof ov.est_minutes !== "number" || !Number.isFinite(ov.est_minutes) || ov.est_minutes <= 0) {
    push("meta", "overview.est_minutes", `invalid: ${JSON.stringify(ov.est_minutes)}`);
  }
  for (const l of LANGS) if (!nonEmpty(ur[`unit_summary_${l}`])) push("missing", `unit_summary_${l}`, "missing/empty");

  // ---- goals / key points (→ overview.intro_*, summary.key_points_*) ----
  const goals = proseList(ur, "goals", "unit");
  if (goals) for (const l of LANGS) compat(`overview.intro_${l}`, ov[`intro_${l}`], introOf(u[`goals_${l}`], l));
  const keys = proseList(ur, "key_points", "unit");
  const sum = rec(u.summary);
  if (keys) {
    const n = keys.jp.length;
    if (n < KEY_POINTS.min || n > KEY_POINTS.max) push("key-points", "key_points", `${n} items (D-195 §7: ${KEY_POINTS.min}〜${KEY_POINTS.max})`);
    for (const l of LANGS) compat(`summary.key_points_${l}`, sum[`key_points_${l}`], keys[l]);
  }

  // ---- 用語総表 ----
  const cols = LANGS.map((l) => ur[`overview_cols_${l}`]);
  if (!cols.every(strList) || new Set(cols.map((c) => (c as string[]).length)).size !== 1) {
    push("overview", "overview_cols", "need the same column count in jp / zh / en");
  } else {
    const rows = Array.isArray(u.overview_rows) ? u.overview_rows : [];
    if (!sameList(rows.map((r) => rec(r).term), ix.terms)) {
      push("overview", "overview_rows", "one row per term, in unit order");
    }
    rows.forEach((r, i) => {
      const where = `overview_rows[${i}]`;
      prose(rec(r), "one_line", where);
      const bad = LANGS.filter((l, li) => {
        const e = rec(r)[`extra_${l}`];
        return !strList(e) || e.length !== (cols[li] as string[]).length || !e.every(nonEmpty) || !e.every((s) => inlineErrors(s).length === 0);
      });
      if (bad.length > 0) push("overview", `${where}.extra`, `${bad.join(", ")}: one non-empty cell per column`);
    });
  }

  // ---- terms ----
  terms.forEach((t, i) => {
    const tr = rec(t);
    const where = `terms[${i}](${t.term})`;

    const one = prose(tr, "one", where);
    if (one) for (const l of LANGS) compat(`${where}.definition_${l}`, tr[`definition_${l}`], one[l]);
    const detail = prose(tr, "detail", where);
    if (detail) {
      for (const l of LANGS) compat(`${where}.explanation_${l}`, tr[`explanation_${l}`], detail[l]);
      const bad = LANGS.filter((l) => {
        const n = sentences(detail[l], l).length;
        return n < DETAIL_SENTENCES.min || n > DETAIL_SENTENCES.max;
      });
      if (bad.length > 0) {
        push("sentences", `${where}.detail`, `${bad.map((l) => `${l}=${sentences(detail[l], l).length}`).join(", ")} (D-195 §1: ${DETAIL_SENTENCES.min}〜${DETAIL_SENTENCES.max} sentences)`);
      }
    }

    // 比喩: plain text (shared with the compat field); all three or none
    const an = LANGS.map((l) => tr[`analogy_${l}`]);
    if (!an.every((x) => typeof x === "string") || (an.some(nonEmpty) && !an.every(nonEmpty))) {
      push("missing", `${where}.analogy`, "analogy_jp / _zh / _en: all three non-empty, or all three \"\"");
    } else if (an.every(nonEmpty)) {
      LANGS.forEach((l, li) => {
        const s = an[li] as string;
        if (stripInline(s) !== s || inlineErrors(s).length > 0) push("markup", `${where}.analogy_${l}`, "analogy is plain text (no inline markup)");
        style(`${where}.analogy_${l}`, s, l);
      });
    }

    // 記法: optional, all three or none; compat memory_hook_* = stripped hook or ""
    const hasHook = LANGS.map((l) => nonEmpty(tr[`hook_${l}`]));
    if (hasHook.some(Boolean) && !hasHook.every(Boolean)) {
      push("missing", `${where}.hook`, `hook_jp / _zh / _en: all three or none (present: ${LANGS.filter((_, li) => hasHook[li]).join(", ")})`);
    }
    LANGS.forEach((l, li) => {
      const h = tr[`hook_${l}`];
      if (!hasHook[li]) {
        if (h !== undefined && h !== "") push("missing", `${where}.hook_${l}`, "blank hook: omit the field");
        compat(`${where}.memory_hook_${l}`, tr[`memory_hook_${l}`], "");
        return;
      }
      const ok = markupOk(`${where}.hook_${l}`, h as string);
      const plain = stripInline(h as string);
      style(`${where}.hook_${l}`, plain, l);
      if (ok) compat(`${where}.memory_hook_${l}`, tr[`memory_hook_${l}`], plain);
    });
    if (hasHook.every(Boolean)) {
      const same = LANGS.filter((l) => one && stripInline(tr[`hook_${l}`] as string).trim() === one[l].trim());
      if (stripInline(t.hook_jp as string).startsWith(`${t.term}といえば`) || same.length > 0) {
        push("hook", `${where}.hook`, "D-195 §6: the memory hook restates the definition");
      }
    }

    // 考点
    const points = Array.isArray(t.points) ? t.points : null;
    if (!points) push("point", `${where}.points`, "array");
    points?.forEach((p, pi) => {
      const pw = `${where}.points[${pi}]`;
      const pr = rec(p);
      if (pr.kind !== "exam" && pr.kind !== "mix") push("point", `${pw}.kind`, `${JSON.stringify(pr.kind)}: exam / mix`);
      prose(pr, "text", pw);
      if (pr.kind === "exam") {
        const q = pr.qids;
        if (!strList(q) || q.length === 0) push("point", `${pw}.qids`, "an exam point cites the questions it rests on");
        else {
          const bad = q.filter((id) => qOf(id)?.topic_id !== ix.topic_id);
          if (bad.length > 0) push("point", `${pw}.qids`, `unknown or other-topic: ${bad.join(", ")}`);
        }
      } else if (pr.qids !== undefined && !strList(pr.qids)) push("point", `${pw}.qids`, "string array");
    });

    // 図
    let figOk = false;
    if (tr.fig === null) figOk = true;
    else {
      const errs = figErrors(tr.fig);
      if (errs.length > 0) push("fig", `${where}.fig`, errs.join("; "));
      figOk = errs.length === 0;
    }
    if (figOk) {
      const f = t.fig;
      const fg = rec(tr.figure);
      if (f?.kind === "svg") {
        const shape = tr.figure !== null && typeof fg.mermaid === "string" && typeof fg.rendered === "boolean";
        if (!shape || fg.svg_path !== f.data.path) {
          push("compat", `${where}.figure`, `an svg fig keeps the v1 figure {svg_path: ${JSON.stringify(f.data.path)}, mermaid, rendered}`);
        }
      } else if (tr.figure !== null) push("compat", `${where}.figure`, "null unless fig.kind is svg");
    }

    // この用語の過去問
    if (!strList(tr.quiz)) push("quiz", `${where}.quiz`, "string array");
    else {
      const seen = new Set<string>();
      for (const id of tr.quiz) {
        const q = qOf(id);
        const why = seen.has(id)
          ? "duplicate"
          : !q
            ? "unknown question"
            : q.topic_id !== ix.topic_id
              ? `topic ${q.topic_id}`
              : !q.terms.includes(t.term)
                ? `its terms do not include ${t.term}`
                : null;
        seen.add(id);
        if (why) push("quiz", `${where}.quiz`, `${id}: ${why}`);
      }
      compat(`${where}.inline_quiz`, tr.inline_quiz, tr.quiz);
    }
    if (tr.inline_fallback !== false) push("compat", `${where}.inline_fallback`, "false in v2");
  });

  // ---- summary.memory_hooks (≥ 1 line) ----
  if (hookLines(u, "jp").length === 0) push("missing", "terms[].hook", "no term has a memory hook (summary.memory_hooks needs ≥ 1 line)");
  for (const l of LANGS) compat(`summary.memory_hooks_${l}`, sum[`memory_hooks_${l}`], hookLines(u, l));

  // ---- 易混 pairs: a before b in unit order (rendered after b), ≥ 1 key row ----
  if (!Array.isArray(u.pairs)) push("pair", "pairs", "array");
  else
    u.pairs.forEach((p, i) => {
      const pw = `pairs[${i}]`;
      const ia = ix.terms.indexOf(p.a);
      const ib = ix.terms.indexOf(p.b);
      if (ia === -1 || ib === -1) push("pair", pw, `${p.a} / ${p.b}: both must be terms of this unit`);
      else if (ia >= ib) push("pair", pw, `${p.a} / ${p.b}: a must come before b in the unit (the pair shows after b)`);
      const rows = Array.isArray(p.rows) ? p.rows : [];
      if (rows.length === 0) push("pair", `${pw}.rows`, "non-empty");
      rows.forEach((r, ri) => {
        for (const base of ["label", "a", "b"]) prose(rec(r), base, `${pw}.rows[${ri}]`);
      });
      if (rows.length > 0 && !rows.some((r) => r.key === true)) push("pair", `${pw}.rows`, "mark the decisive row with key: true");
    });

  // ---- challenge_questions ----
  const ch = u.challenge_questions;
  if (!strList(ch)) push("challenge", "challenge_questions", "string array");
  else {
    const seen = new Set<string>();
    for (const id of ch) {
      const q = qOf(id);
      const why = seen.has(id) ? "duplicate" : !q ? "unknown question" : q.topic_id !== ix.topic_id ? `topic ${q.topic_id}` : null;
      seen.add(id);
      if (why) push("challenge", "challenge_questions", `${id}: ${why}`);
    }
  }

  return issues;
}
