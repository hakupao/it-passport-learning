# OQ-15 textbook-side fix — Rule D review (S155)

- Reviewer: oh-my-claudecode:critic (opus). Writer: oh-my-claudecode:executor (opus). Read-only.
- **Verdict: PASS** (HIGH 0 / MEDIUM 0 / LOW 5).

## What the reviewer ran
- Deep diff HEAD (git archive) vs tree: technology-16-44-u03 15 fields (planned 10 + derived 5), technology-23-63-u05 8 fields (planned 5 + derived 3); all `*_zh` / term_zh; ja/en 0.
- merge dry-run on a scratch copy of data/ip (never --write): u03 exit 0, p19–p26 applied, merged == units; u05 exit 1 (pre-existing jp-origin), merged == units.
- `node --test scripts/textbook-v2-zh-terms.test.mjs` 13/13; `scripts/textbook-v2-*.test.mjs` 108/108; `--check-units` output byte-identical to HEAD data (target units 0 warn); `--conflicts` = MBO, E-R図 only.
- lang-leak --gate PASS; vitest textbook+glossary 17 files / 220.
- Corpus pair scan (quiz explanations/translations, textbook units, messages): zh 双工 ⇒ jp/en duplex, 双重系统 ⇒ dual, mismatched pairs, and reverse (jp デュアル/デュプレックス/アンチパスバック ⇒ zh 双重系统/双工系统/反潜回): 79 checked, 0 alarms; 22 sentences containing both terms read by hand, all correct.
- out/zh: u03 correct pairs only; u05 反潜回 16 / 防尾随 0; only practice/q/2022r04-q074 keeps 防尾随 as generic "prevent tailgating" (jp 共連れ防止), correct option name there is 反潜回.

## Judgement
- a. Semantics PASS: contrast sentence order matches ja; dual hook now under 双重系统; remaining 尾随 in u05 all = 共連れ; new points[1] removes the old tautology.
- d. zh-terms.mjs change is stricter: removing the 2 "excluded" CONFLICT_RULES means a future re-swap throws in seedTable instead of being silently excluded; tests pin both units' values.

## LOW
1. u05 patch reasons p24–p27 / p05 retired_reason mention デュアル/デュプレックス (irrelevant to u05). → **fixed** by main session (reason text only).
2. `scripts/textbook-v2-zh-terms.mjs` header comment on `excluded` stale. → **fixed** (comment only).
3. gitignored copies still hold 防尾随 (u05 manifest.v1 original by design, `.planning/v2/technology-23-63-u0{2,3}/zh_terms.unit.json`, `.planning/translation_technology-23-63-u05.json`); no render path reads them; zh_terms WARN check catches re-prep. → recorded.
4. q074 「物理防尾随的对策」 slightly redundant. → not changed (correct as is).
5. u03 one-character patch windows hard to read alone; full sentences in oq15_apply_run.json. → accepted.
