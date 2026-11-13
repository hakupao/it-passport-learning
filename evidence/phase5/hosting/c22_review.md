# C22 — Rule D independent review (S156)

Reviewer: verifier lane (separate subagent from the writer, the main session). Read and run only; the only file written is this review.
Target: the uncommitted working tree (C22 = triage of the 6 `tb-data` entries in `scripts/fixtures/lang-allow.json`).

## Verdict: **PASS** (0 HIGH, 0 MEDIUM, 2 LOW)

## Checks (run fresh by the reviewer)

| # | check | command / method | result |
|---|---|---|---|
| 1 | unit diff vs HEAD | deep diff of `git show HEAD:data/ip/textbook/units/technology-14-37-u03.json` against the working copy | diff paths = `[.terms.2.detail_en]` only. `strip([[jp:…]])(new) === HEAD` → true. 3 `[[jp:整数型]]` marks, no unmarked 整数型 left. Derived `terms[2].explanation_en` unchanged and still equals the stripped `detail_en` (compat holds) |
| 2a | B3 patch replay (plan mode) | `node --no-warnings scripts/tbjp-apply.ts --round c22 --out <scratch>` | exit 1: `«○整数型: functionName(整数型: name), where 整数型 is» occurs 0×`. Expected: the field is already marked, so the round cannot apply twice |
| 2b | patch p09 base | `shasum -a 256 …/parts/b51-u03-a1/technology-14-37-u03.loc.r1.json` | `d4384f77…fdf5`, the same as p09 `base_sha256` |
| 2c | merge dry-run (no `--write`) | `node --no-warnings scripts/textbook-v2-merge.mjs --unit technology-14-37-u03 --journal …/journal.b51-u03-a1.jsonl` | exit 0. p01–p09 applied; reviews PASS, validate 0, parity 0. Deep diff merged.json vs units = `[]` (the whole unit, so it covers this field). The regenerated merged.json is byte-identical to the pre-run copy (gitignored `.planning/`) |
| 3a | gate | `node --no-warnings scripts/lang-leak-scan.ts --gate` (no `--accept-new`) | exit 0, `498 entries`, `lang-leak gate: PASS` |
| 3b | allowlist dry run | `node --no-warnings scripts/l5-build-allowlist.ts` (no `--write`) | `claimed 633 → 498 entries, unclaimed 0, new claims 0, dropped 0`; `tb-data: 5` |
| 4 | negative test | `git show HEAD:scripts/fixtures/lang-allow.json > tmp`; `lang-leak-scan.ts --gate --allow tmp` | exit 1. The only failure: `FAIL stale allow entries: 1 — R-en-cjk …technology-14-37-u03.json terms[2].detail_en «整数型» count 3, found 0`. Entry-set diff HEAD → new: removed exactly that 1 entry, added 0. The only category text changed is `tb-data` |
| 5 | unit validate | `node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-37-u03` | 0 issues, exit 0 |
| 6 | scan unit tests | `node --test scripts/lang-leak-scan.test.ts` | 22/22 pass |
| 7 | built HTML | `apps/web/out/en/textbook/technology-14-37-u03.html` (mtime 07:53, after the unit edit at 07:52) | 3 × `<span lang="ja" data-inline="jp" class="…jpWord">整数型</span>`, 0 × `[[jp:` |

The writer's `tsc` / lint / vitest / `build:cf` results were not re-run (C22 touches no app code). The fresh HTML in `out/` corroborates the build claim.

## Triage on the merits

- **en marked, zh not marked: consistent with the corpus.** A survey of every zh/en string with 整数型/実数型/論理型/文字型/文字列型 shows the following. technology-14-37-u04 makes `term_zh = 整数型`, so zh treats 整数型 as the Chinese term and glosses it `**整数型**（[[jp:整数型]]）`. en always says `integer type ([[jp:整数型]])`. In the u03 zh pseudo-code `○整数型: 函数名(整数型: 名称)`, the function and parameter names are localised. u03 `terms[4]` zh writes `逻辑型（[[jp:論理型]]）`, so zh uses the Chinese type names. An unmarked 整数型 in zh is therefore the Chinese form, not a leak. In en the token is foreign Japanese explained as "the exam notation", so `[[jp:]]` is correct (D-221).
- **あ / 山 kept as `tb-data`: justified.** They are sample values (a character-code example, `'A'、'7'、'あ'`, the LIKE patterns `%山` / `山%`), not exam wording. The `jpWord` styling signals "Japanese original term", which would mislabel sample data.
- **"Figure labels don't parse inline markers": correct.** `apps/web/src/components/textbook/figures/` has no `parseInline` reference (grep: none). Figure labels come from `pick.ts`, which returns the plain string, so a mark would print raw `[[jp:`.

## Findings

- **LOW-1: inaccurate rationale for technology-14-37-u04 `overview_rows[4].extra_*`.** `c22_apply.md` ("sample value of 文字型 in a derived field") and the session-156 log ("`overview_rows` は派生欄") are both wrong on this point:
  - `overview_rows` is not in the scanner's `DERIVED` regex (`lang-leak-scan.ts:55`), so it is scanned as content.
  - `UnitHeader.tsx:127` renders every extra cell via `parseInline(x, INLINE)`.
  - `validateV2.ts:645` accepts inline markers there (`inlineErrors(s).length === 0`).
  
  A mark would render. The keep decision still stands on the primary reason (sample data, not exam wording). Suggestion: correct the sentence in `c22_apply.md` and the session log. No data change needed.
- **LOW-2: plan-mode replay of `--round c22` now throws, which is expected.** The round cannot be re-run as a regression check because the from-string no longer exists. This is the same pattern as earlier rounds (`b`, default) and is not a defect. Future auditors should rely on the merge dry-run (merged == units) as the replay proof, not on plan mode.

## Regression risk

Low. The `tbjp-apply.ts` change only adds a `ROUND` string and an `EDITS_C22` list. The default and `b` round selection logic is unchanged (`ROUND === "b"`; with no `--round`, `ROUND = ""` → `EDITS`). The non-B `stripInline` invariants also apply to c22. The allowlist diff is −1 entry plus one category description.
