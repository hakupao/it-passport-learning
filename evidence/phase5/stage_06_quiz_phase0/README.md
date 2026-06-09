# Evidence — Stage 6 / Quiz 接過去問 Phase 0 (Session 86, 2026-06-09)

Phase 0 = 止血 + 地基: rebuild `/[locale]/quiz` off the dead `_fixtures/v1.0.3` corpus
(removed S63 → 500) onto the in-repo derived past-exam corpus. Decisions D-134 (data
distribution) + D-135 (sub-stage architecture).

## What was built

| Artifact | Role |
|---|---|
| `scripts/build-quiz-corpus.mjs` | projection: raw `question_bank.json` (gitignored) → clean `data/ip/quiz/{quiz_index,questions}.json` (un-gitignored). Deterministic, invariant-checked. |
| `scripts/build-quiz-figures.mjs` | 467 referenced figures → `apps/web/public/quiz-figures/*.webp` (lossless, ≤900px) |
| `apps/web/src/lib/quiz/quizModel.ts` | pure types + helpers (bundler-safe, client-imported) |
| `apps/web/src/lib/quiz/quizReader.ts` | self-contained `node:fs` loaders (mirrors textbook `reader.ts`) |
| `apps/web/src/lib/quiz/__tests__/quizReader.test.ts` | 11 pure-helper TDD tests |
| `apps/web/src/components/quiz/{QuizBrowser,QuizSet}.tsx` + `quiz.module.css` | server landing (2 modes) + client reveal view |
| `apps/web/src/app/[locale]/quiz/page.tsx` | rewritten: searchParams → browser \| set |
| `middleware.ts` / `next.config.ts` / `messages/*.json` / `.gitignore` | matcher exclude / tracing / Quiz i18n / un-gitignore |

## Corpus projection (build-quiz-corpus.mjs)

```
✓ build-quiz-corpus
  questions : 2900
  topics    : 63 (sum 2900)
  exams     : 29 (2009h21h … 2026r08)
  with_fig  : 467
  sample 出典: 平成21年度 秋期 ITパスポート試験 問1  |  令和元年度 秋期 ITパスポート試験 問1
```

出典 derivation verified across all eras: 平成21春/秋, 平成23特別試験, 平成31春期,
令和元年度 秋期, 令和2/3/8年度 (通年). Exams ordered chronologically (春期 before 秋期).
Topic labels trilingual (major/medium localized; 小分類 name JP-only per OQ-03).

## Figure optimization (build-quiz-figures.mjs)

```
✓ build-quiz-figures
  optimized : 467/467
  size      : 80.6M → 30.7M  (62% smaller)   [lossless WebP, ≤900px]
```

Served statically at `/quiz-figures/<id>.webp` (apps/web/public). `source.page_image`
(→ 762M `pages/`) NOT used; only the cropped `figure_path` figures.

## Verification (all GREEN)

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| `eslint .` | 0 errors (1 pre-existing unrelated warning: RetroGlossary) |
| `vitest run` (full) | **446 passed** \| 2 skipped (S85 434 +11 quizReader +1 middleware-boundary) |
| `next build` | exit 0; `/[locale]/quiz` 6.96 kB |
| runtime `/` → redirect | **200** final `/ja/quiz` (**首页 500 治癒**) |
| `/{ja,zh,en}/quiz` (browser) | 200; headings localized (テクノロジ系 / 战略系 / Strategy) |
| `?mode=topic&id=…` / `?mode=exam&id=…` | 200; 出典 + ア/イ/ウ/エ + reveal + figure render |
| `?mode=bogus` | 200 (falls back to browser) |
| `/quiz-figures/<id>.webp` | 200 `image/webp`; missing → 404 |
| `/{ja,en}/textbook` (regression) | 200 |

## nft trace IPA-leak audit (S85 lesson)

19 nft files scanned across all routes:

```
exams: 0  pages: 0  figures_raw: 0  sources: 0  syllabus: 0   ← NO raw IPA leak
quiz: 3   textbook: 1314
```

The quiz route bundle traces ONLY `data/ip/quiz/{quiz_index,questions}.json`. The raw
gitignored IPA `exams/pages/sources/syllabus` are absent from every route bundle.

## Implementation refinements (discovered during build)

1. **Garble cleanup deferred to Phase 1.** 249/467 figure-stems contain `|`, but most are
   LEGITIMATE markdown tables (損益計算資料, 生産性表), not OCR noise. The split is semantic,
   not pattern-based → deterministic stripping would delete real content. v1 shows raw JP stems
   (plain `white-space: pre-wrap`); clean text arrives with Phase 1 LLM translation.
2. **Figures → lossless WebP @900px in `public/`** (not palette PNG, not 1000px): honors
   "lossless" + lands ~31M (<~30M target) + static-served (no route handler).
3. **`quizModel` / `quizReader` split**: client `QuizSet` can't import `node:fs`; pure code
   isolated in `quizModel.ts`, fs loaders in `quizReader.ts`. (Caught by `next build`, fixed.)
4. **middleware matcher** had to exclude `quiz-figures` (the i18n middleware was rewriting
   `/quiz-figures/<id>.webp` → `/ja/quiz-figures/…`; textbook never hit this — inline SVG).

## Rule D independent review (writer ≠ reviewer)

Writer = main agent. Reviewer = independent review **Workflow** (`quiz-phase0-rule-d-review`,
run `wf_275dc1b8-550`): 4 dimensions (correctness / copyright-compliance / security /
ui-i18n-architecture) reviewed in parallel, HIGH/BLOCKER findings adversarially verified.

**VERDICT: APPROVE — 0 BLOCKER / 0 HIGH, 10 LOW** (adversarial verify confirmed 0 critical).
4 dimensions reviewed, 271k subagent tokens, 108 tool uses.

The review **caught a real gap** (value of writer≠reviewer): the late middleware-matcher
edit (adding `quiz-figures`) was shipped without updating `src/__tests__/middleware.test.ts`
which pins the matcher → the **full** suite was red, while the author's "445 passed" had come
from a quiz-scoped run. Fixed + re-verified (full suite now 446 green).

**Post-review fixes applied (8 of 10 LOW):**
1. ✅ `middleware.test.ts` updated to the new matcher + added a boundary assertion (`/quiz-figures/*` excluded, `/quiz-figuresEVIL/*` NOT) → full suite 446 green.
2. ✅ `build-quiz-corpus.mjs`: fail-fast on unknown exam-id season suffix (was silently → 通年).
3. ✅ `build-quiz-corpus.mjs`: invariant guarding the `has_figure`/`figure_path` pairing (no silent figure drop).
4. ✅ `build-quiz-figures.mjs`: header comment ≤1000→≤900px (matches `MAX_WIDTH`).
5. ✅ `_figure_ids.json` intermediate **eliminated** (figures derive ids from `questions.json`) → nft trace now exactly 2 quiz JSONs (`_figure_ids` 0).
6. ✅ middleware matcher anchored to `quiz-figures/` (unrelated `/quiz-figuresX` no longer bypassed).
7. ✅ zh JP-leaning UI labels fixed (正解→答案, 分野→个领域, 回→次考试, 按分野→按领域).

**Deferred (2 LOW, backlog — pre-existing / future-phase):**
- Stale `D-097 Basic-Auth firewall` comments across api/quiz/explain, lib/ai/quiz, QuizExplain,
  chat/tutor/glossary (firewall removed in 94be255; PRE-EXISTING, app-wide — doc sweep follow-up).
- Per-figure alt text (generic "図"/"图"/"Figure" for v1; real descriptions in the explanation phase).

Post-fix re-verification: full `vitest` **446 passed**, `tsc` clean, `next build` exit0, nft
`_figure_ids=0 / quiz=2 / IPA=0`, runtime `/quiz-figures/*`=200 & `/quiz-figuresX`=307(not bypassed)
& `/`→/ja/quiz=200 & all routes 200.

## Known deferred (non-blocking)

- glossary / tutor / chat still 500 (dead `_fixtures` corpus) — their own later sub-stages
  (user chose "no band-aid"). Quiz rebuild heals `/`→/quiz.
- Stem garble cleanup → Phase 1 (translation).
- Trilingual quiz translation → Phase 1; pre-stored explanations → Phase 2; textbook-unit
  embedding → Phase 3.
- Dead code (quizScope.ts, quizSseTransport.ts, theme Quiz components, api/quiz/explain) left
  inert; cleanup is backlog.
