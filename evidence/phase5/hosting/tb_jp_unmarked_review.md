# tb-jp-unmarked — Rule D review (S155)

- Reviewer: oh-my-claudecode:verifier (opus). Writer: oh-my-claudecode:executor (opus). Read-only review of the uncommitted tree.
- **Verdict: PASS** (HIGH 0 / MEDIUM 0 / LOW 3). Confidence high.

## Evidence (reviewer re-ran)
- Full-field diff HEAD vs tree over 657 tracked JSON under data/ip/textbook: 20 fields changed, all in the 10 target files. 18 = strip(new) === strip(old); 2 = u02 pairs[1].rows[0].a_zh/b_zh (declared round b). numstat add = del per file (no re-serialisation).
- Quote/bracket placement matches corpus convention (quotes outside the mark: 76 vs 2).
- merge dry-run (no --write) × 10 units: 8 exit 0 with no diff vs units; strategy-03-10-u07 (challenge_questions[0..4], D-216) and technology-23-63-u10 (title_zh) exit 1 on pre-existing baseline diffs only, identical in HEAD and tree.
- `lang-leak-scan.ts --gate` exit 0. Negative test with HEAD allow-list: exit 1, exactly 23 stale entries → the hits really disappeared; technology-21-55-u01 term_en still hits (kept, `jp-explained`).
- l5-build-allowlist dry-run: new claims 0, dropped 0. Generator diff adds one exact (file, path, text) class only — no broad matching.
- tbjp-verify re-run pass; validate × 10 exit 0; unit_minutes --check match; vitest textbook+glossary 17 files / 220 pass.
- term_zh/term_en render as plain strings (TermBlock.tsx:42 termGloss, PairBlock gloss(), glossary/dictionary.ts:76,169,227) → leaving 表 unmarked is correct.
- out/ spot-check (built after last write): 0 literal `[[jp:`; u02/u07/u05 cells render `<span lang="ja" data-inline="jp">`.
- Not re-run by reviewer: full build:cf / tsc / lint / full vitest / validate × 244 (writer ran them; apps/web untouched).

## Findings
- **LOW-1**: technology-14-37-u03 terms[2].detail_en `整数型` ×3 (explained JP pseudo-code type name) is allowed under pre-existing `tb-data`; could take `[[jp:]]` under D-221. Out of scope.
- **LOW-2 (style)**: "Japanese name" rows exist in two orders: strategy-02-08-u02 `中文（[[jp:日语]]）` vs u07/u02 `[[jp:日语]]（中文）`. Both render fine.
- **LOW-3 (info)**: derived compat fields (definition_*/memory_hook_*) carry no marks by compatText design; scope-excluded. Pre-existing.
- Scripts tbjp-apply.ts / tbjp-verify.ts: recommended to commit (precedent l4-r1-units-apply.ts, l4-r2-apply.ts).
