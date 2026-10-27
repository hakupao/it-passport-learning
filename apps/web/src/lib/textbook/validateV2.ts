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
//   - D-200: ≤ 3 考点 per term, each JP ≤ 2 sentences / ≤ 100 characters (POINT_LIMITS),
//   - D-195: 展開 2〜3 sentences, 要点 3〜5, banned phrasing (§9 → BANNED_PHRASES
//     everywhere; EXAM_FRAMING everywhere but the 考点 box, whose job is to say
//     what the exam asks), three or more headwords listed in one sentence of any
//     JP prose (§9 羅列 → listingRun, scope D-197), a memory hook that restates
//     the definition (§6),
//   - figures against the closed registry (figureSpec.ts), 易混 pairs, 考点
//     (`exam` cites its questions), past questions (resolvable, same topic; the
//     per-term ones must list the term), 3〜5 confirm questions once chumon
//     members are removed (confirmIds = confirm.ts pickConfirm's selection).
// Each problem is one V2Issue with a stable `code`. Malformed JSON (a null where
// an object belongs, …) is reported as `schema` issues: validateV2 never throws.

import { figErrors } from "./figureSpec.ts";
import { inlineErrors, stripInline } from "./inline.ts";
import { LANGS, V2_SCHEMA, type Lang, type TextbookUnitV2, type UnitTermV2 } from "./types.ts";

export type V2IssueCode =
  | "schema"
  | "framing"
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
  | "points"
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
  /**
   * Headword glosses of the v1 unit the v2 file replaces (term_zh / term_en invariant).
   * Required: once the pilot overwrites units/<id>.json the v1 glosses survive only in
   * what the caller kept from before the rewrite (the Task 9 prep manifest), so the
   * pipeline must pass them from there, never from the file being validated.
   */
  v1Terms: readonly { term: string; term_zh: string; term_en: string }[];
  /** data/ip/quiz/questions.json by id. */
  questions: ReadonlyMap<string, V2QuestionRef>;
  /** Chumon group member ids (data/ip/quiz/chumon_groups.json): the confirm count (§0-1) needs them. */
  members: ReadonlySet<string>;
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
  v1Terms: V2Context["v1Terms"],
  members: ReadonlySet<string>,
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
      members,
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

/** D-195 §9: stock closing lines and unfounded exaggeration (checked in all prose). */
export const BANNED_PHRASES: Record<Lang, readonly RegExp[]> = {
  jp: [/理解しておきましょう/, /(覚え|押さえ)ておきましょう/, /(非常に|極めて|きわめて)重要/, /必ず(出題|出る)/],
  zh: [/务必(理解|掌握|记住|牢记)/, /(非常|极其|极为)重要/, /一定会考/],
  en: [
    /\bmake sure (to|you) (understand|remember|know)\b/i,
    /\b(extremely|crucially) important\b/i,
    /\bit is (important|essential) to (understand|remember)\b/i,
  ],
};

/** D-195 §9: 「試験では〜が問われます」-style exam talk; banned in prose, allowed in the 考点 box. */
export const EXAM_FRAMING: Record<Lang, readonly RegExp[]> = {
  jp: [/試験では[^。]*(問われ|狙われ|出題され)/],
  zh: [/考试(中|时)?(会|常|经常|往往)?(考查|考到|问到)/],
  en: [/\bthe exam (often |frequently |typically )?(asks|tests|targets)\b/i, /\b(is|are) (frequently|often) tested\b/i],
};

const OPEN = "「『（(【［〔“";
const CLOSE = "」』）)】］〕”";
const hasWord = (p: string): boolean => /[\p{L}\p{N}]/u.test(p);
const EN_ABBR = /\b(e\.g|i\.e|vs|etc)\.$/i;

/**
 * Sentences of plain text. jp / zh: 。！？ outside brackets ends a sentence (closing
 * brackets right after it stay with it). en: . ! ? followed by a space, except after
 * e.g. / i.e. / vs. / etc. (so 1.5 is one number). Fragments without a letter or a
 * digit (「…」, ")") are not sentences.
 */
export function sentences(s: string, lang: Lang): string[] {
  const parts: string[] = [];
  if (lang === "en") {
    for (const piece of s.split(/(?<=[.!?])\s+/)) {
      const prev = parts[parts.length - 1];
      if (prev !== undefined && EN_ABBR.test(prev)) parts[parts.length - 1] = `${prev} ${piece}`;
      else parts.push(piece);
    }
  } else {
    let cur = "";
    let depth = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s[i]!;
      cur += c;
      if (OPEN.includes(c)) depth += 1;
      else if (CLOSE.includes(c)) depth = Math.max(0, depth - 1);
      else if (depth === 0 && "。！？".includes(c)) {
        while (i + 1 < s.length && CLOSE.includes(s[i + 1]!)) cur += s[++i];
        parts.push(cur);
        cur = "";
      }
    }
    parts.push(cur);
    // brackets that never close (「（」 typo) would swallow every later sentence: split plainly instead
    if (depth !== 0) return s.split(/(?<=[。！？])/).map((p) => p.trim()).filter(hasWord);
  }
  return parts.map((p) => p.trim()).filter(hasWord);
}

/**
 * D-195 §3 / §9 羅列: the longest run of headwords joined only by ・ 、 , ， in `text`.
 * Headwords are matched longest-first without overlap, so a headword inside a longer
 * one (リスク in プロジェクトリスクマネジメント) is not counted twice.
 */
export function listingRun(text: string, headwords: readonly string[]): number {
  const hw = [...headwords].filter((h) => h !== "").sort((a, b) => b.length - a.length);
  const hits: { start: number; end: number }[] = [];
  for (let i = 0; i < text.length; ) {
    const h = hw.find((x) => text.startsWith(x, i));
    if (h) {
      hits.push({ start: i, end: i + h.length });
      i += h.length;
    } else i += 1;
  }
  let best = hits.length > 0 ? 1 : 0;
  let run = 1;
  for (let k = 1; k < hits.length; k++) {
    run = /^\s*[・、,，]\s*$/.test(text.slice(hits[k - 1]!.end, hits[k]!.start)) ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

/** 展開 length (D-195 §1). */
export const DETAIL_SENTENCES = { min: 2, max: 3 } as const;
/** 要点 count (D-195 §7). */
export const KEY_POINTS = { min: 3, max: 5 } as const;
/**
 * Batch 1 lesson (D-195 §9): the 考点 box may speak of the exam, but not all over it — u04 grew six
 * 「〜として問われる」 and u05 swapped them for 「〜が適切とされる」「…が挙がる」 (zh 被视为恰当 / en "is considered
 * appropriate", "Asked to name…, the answer is"). Exam-framing patterns, by type rather than word, counted per
 * language over all of a unit's points (sentences with a hit): more than POINT_FRAMING_MAX → a `framing` issue for
 * that language. The cap is fixed by design, not proportional to the number of 考点: b01 showed the pattern
 * spreading to every point once allowed, and a unit needs at most a couple of "how the exam puts it" sentences.
 * A pattern is a RegExp, or [pattern, context] when the word also has an ordinary / domain sense: then it counts
 * only when the same sentence also matches the exam context (Rule D on 04ba3e5, F2).
 * False-positive guards (each has a test):
 *   jp — とされる only after a correctness judgement (not 「有効とされる」 definitions); 試験 only standalone (not
 *        after kanji / kana / katakana: 結合試験, 受入れ試験 are tests; so 「この試験では」 is not counted either);
 *        が挙が only in a 「として(は)…が挙が」 form (利益が挙がる); 選択肢 only with 正解 / 誤り / 問わ / 問題 / 出題 /
 *        試験 in the sentence (a UI's 選択肢); 出題 not in 出題範囲 (the syllabus term); 正解 only as 正解は / 正解に /
 *        正解となる (正解と予測の差 = a label in ML).
 *   zh — 考到 not in 思考到 / 参考到; 选项 (not 候选项) only with 正确 / 错误 / 题 / 考 / 答案 (配置选项, 多个选项);
 *        正确答案 only with 选 / 题 in the sentence (用正确答案标注数据), 答案是 always.
 *   en — "asked to" not before enter / provide / input / confirm / verify / type / sign; "appears as" only before
 *        the name / a choice / an answer / the correct; "considered" only with a correctness word; correct / right /
 *        wrong answer|option|choice|description only with exam / question(s) / choices / among in the sentence.
 */
export const POINT_FRAMING_MAX = 2;
type FramingPattern = RegExp | readonly [RegExp, RegExp];
const ASK_NOT = "(?!(?:enter|provide|input|confirm|verify|type|sign)\\b)";
export const POINT_FRAMING: Record<Lang, readonly FramingPattern[]> = {
  jp: [
    /問われ/,
    /(?:不適切|適切|妥当|正しい|誤り|不正解|正解)(?:だ|である)?とされ/,
    /として(?:は)?[^。]*?が挙が[るりっ]/,
    [/選択肢/, /正解|誤り|問わ|問題|出題|試験/],
    /出題(?!範囲)/,
    /(?<![\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー])試験(?:では|で問わ|に出)/u,
    /として選ぶ/,
    /正解(?:は|に|とな)/,
  ],
  zh: [
    /被问到/,
    /(?<![思参])考到/,
    /被视为[^。，；]{0,15}?(?:恰当|适当|妥当|正确|错误)/,
    /考试(?:所说|中|里|时|题)/,
    [/(?<!候)选项/, /正确|错误|题|考|答案/],
    /出题/,
    [/正确答案/, /选|题/],
    /答案是/,
  ],
  en: [
    new RegExp(`\\basked (?:to ${ASK_NOT}|about\\b|which\\b|what\\b|whether\\b)|\\b(?:is|are|be|being|gets?) asked\\b(?! to ${ASK_NOT.slice(3, -1)})`, "i"),
    /\bappears? as (?:the name|a choice|an answer|the correct)\b/i,
    /\b(?:is|are) considered (?:an? )?(?:appropriate|inappropriate|proper|improper|correct|incorrect|right|wrong)\b/i,
    /\bthe answer is\b/i,
    /\bexam questions?\b|\b(?:in|on) the exam\b/i,
    /\bamong the (?:answer )?choices\b|\banswer choices?\b/i,
    [/\b(?:correct|right|wrong|incorrect) (?:description|answer|choice|option)\b/i, /\bexam|\bquestions?\b|\bchoices\b|\bamong\b/i],
  ],
};
const framingHit = (sen: string) => (p: FramingPattern): boolean => (p instanceof RegExp ? p.test(sen) : p[0].test(sen) && p[1].test(sen));
/** Exam-framing occurrences in one plain text: sentences with at least one POINT_FRAMING pattern
 *  (「試験では…が問われる」 is one phrase, not two). */
export function pointFraming(lang: Lang, plain: string): number {
  return sentences(plain, lang).filter((sen) => POINT_FRAMING[lang].some(framingHit(sen))).length;
}

/**
 * D-195 §9 羅列 (scope locked as D-197): longest allowed listingRun in one sentence of any
 * JP prose (goals / one / detail / analogy / hook / points / key_points / pairs), except a
 * sentence that states the count of a classification (COUNTED_CLASSIFICATION).
 */
export const LISTING_MAX = 2;
/** D-197 exception: 「〜には A・B・C・D の 4 つがある」「対応策は 4 種類あり…」 — the classification is the content. */
// a count of 2 or more (2〜9, 10〜99, 二〜九, 十…); 「一種」「一つ」「〜つ目」 are not a count of the classification
export const COUNTED_CLASSIFICATION = /(?:の\s*)?(?:[1-9１-９][0-9０-９]|[2-9２-９二三四五六七八九]|十)\s*(?:つ|種類|種)(?!目)/;
/**
 * D-200 考点 limits: at most `perTerm` points per term; each point's JP text (markup stripped,
 * whitespace not counted) at most `sentences` sentences and `chars` characters. zh / en follow the JP.
 */
export const POINT_LIMITS = { perTerm: 3, sentences: 2, chars: 100 } as const;
/** Confirm questions per unit (D-196 §0-1; = confirm.ts CONFIRM_MIN / CONFIRM_MAX). */
export const CONFIRM = { min: 3, max: 5 } as const;

/**
 * The unit's confirm questions, as confirm.ts pickConfirm selects them (mirrored: that
 * module is not Node-importable): challenge ids minus members, topped up in term order
 * from the terms' questions (minus members, deduped) to CONFIRM.min, at most CONFIRM.max.
 */
export function confirmIds(
  challenge: readonly string[],
  termQuizzes: readonly (readonly string[])[],
  isMember: (id: string) => boolean,
): string[] {
  const out: string[] = [];
  const add = (id: string) => {
    if (!isMember(id) && !out.includes(id)) out.push(id);
  };
  challenge.forEach(add);
  for (const q of termQuizzes) {
    for (const id of q) {
      if (out.length >= CONFIRM.min) break;
      add(id);
    }
  }
  return out.slice(0, CONFIRM.max);
}

// ---- validator -----------------------------------------------------------------

/** The JP-label marker (inline.ts) and the fields it must not appear in (…_jp, …_jp[i]). */
const JP_OPEN = "[[jp:";
const JP_FIELD = /_jp(\[\d+\])?$/;

type Rec = Record<string, unknown>;
const rec = (o: unknown): Rec => (o && typeof o === "object" ? (o as Rec) : {});
function nonEmpty(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}
const strList = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
const sameList = (a: unknown, b: readonly unknown[]): boolean =>
  Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);

const isObj = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);

/** Where the JSON does not have the object / array shape the checks walk ([] = fine). */
function shapeErrors(ur: Rec): [string, string][] {
  const out: [string, string][] = [];
  const objs = (v: unknown, at: string, each?: (o: Rec, at: string) => void) => {
    if (!Array.isArray(v)) return void out.push([at, "array"]);
    v.forEach((x, i) => (isObj(x) ? each?.(x, `${at}[${i}]`) : out.push([`${at}[${i}]`, "object"])));
  };
  for (const k of ["overview", "summary", "lang_status"]) if (!isObj(ur[k])) out.push([k, "object"]);
  if (!strList(ur.prerequisites)) out.push(["prerequisites", "string array"]);
  objs(ur.source_figures, "source_figures");
  objs(ur.overview_rows, "overview_rows");
  objs(ur.pairs, "pairs", (p, at) => objs(p.rows, `${at}.rows`));
  objs(ur.terms, "terms", (t, at) => {
    objs(t.points, `${at}.points`);
    for (const k of ["fig", "figure"]) if (t[k] !== null && !isObj(t[k])) out.push([`${at}.${k}`, "object or null"]);
  });
  return out;
}

/** Every problem of `unit` against `ctx`; [] = valid. Never throws. */
export function validateV2(unit: TextbookUnitV2, ctx: V2Context): V2Issue[] {
  const ur = rec(unit);
  const id = String(ur.unit_id);
  if (ur.schema_version !== V2_SCHEMA) {
    return [{ unitId: id, code: "schema", field: "schema_version", message: `expected ${V2_SCHEMA}, got ${JSON.stringify(ur.schema_version)}` }];
  }
  const shape = shapeErrors(ur);
  if (shape.length > 0) return shape.map(([field, want]) => ({ unitId: id, code: "schema", field, message: `expected ${want}` }));
  try {
    return check(unit, ctx);
  } catch (err) {
    // backstop: a shape shapeErrors does not foresee is still an issue, not a crash
    return [{ unitId: id, code: "schema", field: "(unit)", message: `malformed unit: ${err instanceof Error ? err.message : String(err)}` }];
  }
}

function check(unit: TextbookUnitV2, ctx: V2Context): V2Issue[] {
  const u = unit;
  const ur = rec(u);
  const issues: V2Issue[] = [];
  const push = (code: V2IssueCode, field: string, message: string): void => {
    issues.push({ unitId: String(ur.unit_id), code, field, message });
  };

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
  if (!(ctx.members instanceof Set)) push("invariant", "ctx.members", "pass the chumon member ids (confirm count, §0-1)");
  if (!Array.isArray(ctx.v1Terms) || ctx.v1Terms.length === 0) {
    push("invariant", "ctx.v1Terms", "pass the pre-rewrite v1 glosses (prep manifest) to check term_zh / term_en");
  } else if (!sameList(ctx.v1Terms.map((t) => rec(t).term), ix.terms)) {
    push("invariant", "ctx.v1Terms", "the v1 glosses are not this unit's headwords in index order");
  } else {
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

  /** Inline markup of one string; true when well-formed. [[jp:…]] marks the JP wording inside zh / en only. */
  const markupOk = (field: string, s: string): boolean => {
    const errs = inlineErrors(s);
    if (JP_FIELD.test(field) && s.includes(JP_OPEN)) errs.push(`${JP_OPEN}…]] is for zh / en text only (D-195 §5)`);
    if (errs.length > 0) push("markup", field, errs.join("; "));
    return errs.length === 0;
  };

  type StyleOpts = { examTalk?: boolean; noListing?: boolean };
  /** D-195 §9 banned phrasing (+ exam talk unless allowed) and the JP 羅列 (D-197). */
  const style = (field: string, plain: string, lang: Lang, opts: StyleOpts = {}): void => {
    const rules = opts.examTalk ? BANNED_PHRASES[lang] : [...BANNED_PHRASES[lang], ...EXAM_FRAMING[lang]];
    const hit = rules.find((re) => re.test(plain));
    if (hit) push("banned", field, `D-195 §9 banned phrasing ${hit}`);
    if (!opts.noListing && lang === "jp") {
      for (const sen of sentences(plain, "jp")) {
        const n = listingRun(sen, ix.terms);
        if (n > LISTING_MAX && !COUNTED_CLASSIFICATION.test(sen)) {
          push("listing", field, `D-195 §9 / D-197: ${n} headwords listed in one sentence without stating the count`);
        }
      }
    }
  };

  /** A `{base}_{lang}` prose triple: present, well-formed, style; returns the stripped texts or null. */
  const prose = (o: Rec, base: string, where: string, opts?: StyleOpts): Record<Lang, string> | null => {
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
      style(`${where}.${base}_${l}`, out[l], l, opts);
    }
    return ok ? out : null;
  };

  /** A `{base}_{lang}` list triple: same length ≥ 1, items non-empty, well-formed; stripped lists or null. */
  const proseList = (o: Rec, base: string, where: string, opts?: StyleOpts): Record<Lang, string[]> | null => {
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
        style(`${where}.${base}_${l}[${i}]`, plain, l, opts);
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
      prose(rec(r), "one_line", where, { noListing: true }); // the 総表 is outside D-197's scope
      const bad = LANGS.filter((l, li) => {
        const e = rec(r)[`extra_${l}`];
        return (
          !strList(e) ||
          e.length !== (cols[li] as string[]).length ||
          !e.every(nonEmpty) ||
          !e.every((s) => inlineErrors(s).length === 0 && !(l === "jp" && s.includes(JP_OPEN)))
        );
      });
      if (bad.length > 0) push("overview", `${where}.extra`, `${bad.join(", ")}: one non-empty cell per column`);
    });
  }

  // ---- terms ----
  const framing: Record<Lang, number> = { jp: 0, zh: 0, en: 0 };
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
    else if (points.length > POINT_LIMITS.perTerm) {
      push("points", `${where}.points`, `${points.length} 考点 (D-200: at most ${POINT_LIMITS.perTerm} per term)`);
    }
    points?.forEach((p, pi) => {
      const pw = `${where}.points[${pi}]`;
      const pr = rec(p);
      if (pr.kind !== "exam" && pr.kind !== "mix") push("point", `${pw}.kind`, `${JSON.stringify(pr.kind)}: exam / mix`);
      const txt = prose(pr, "text", pw, { examTalk: true });
      if (txt) for (const l of LANGS) framing[l] += pointFraming(l, txt[l]);
      if (txt) {
        const n = sentences(txt.jp, "jp").length;
        const chars = txt.jp.replace(/\s/g, "").length;
        if (n > POINT_LIMITS.sentences || chars > POINT_LIMITS.chars) {
          push("points", `${pw}.text_jp`, `${n} sentence(s), ${chars} characters (D-200: ≤ ${POINT_LIMITS.sentences} sentences, ≤ ${POINT_LIMITS.chars} characters)`);
        }
      }
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

  for (const l of LANGS) {
    if (framing[l] > POINT_FRAMING_MAX) {
      push("framing", `points_${l}`, `${framing[l]} exam-framing phrase(s) across the unit's 考点 (D-195 §9, batch 1 lesson: at most ${POINT_FRAMING_MAX}; state the fact, not how the exam asks it)`);
    }
  }

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
    const before = issues.length;
    for (const id of ch) {
      const q = qOf(id);
      const why = seen.has(id) ? "duplicate" : !q ? "unknown question" : q.topic_id !== ix.topic_id ? `topic ${q.topic_id}` : null;
      seen.add(id);
      if (why) push("challenge", "challenge_questions", `${id}: ${why}`);
    }
    // §0-1: what the unit page will show as confirm questions (counted once every id is valid)
    const isMember = (q: string) => ctx.members.has(q);
    const kept = ch.filter((q) => !isMember(q));
    const picked = confirmIds(ch, terms.map((t) => (strList(t.quiz) ? t.quiz : [])), isMember);
    if (issues.length > before) return issues;
    if (kept.length > CONFIRM.max) push("challenge", "challenge_questions", `${kept.length} after removing chumon members (max ${CONFIRM.max})`);
    if (picked.length < CONFIRM.min) {
      push("challenge", "challenge_questions", `${picked.length} confirm questions after removing chumon members and topping up from the terms (min ${CONFIRM.min})`);
    }
  }

  return issues;
}
