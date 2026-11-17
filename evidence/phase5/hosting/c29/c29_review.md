# C29 Rule D review (S164)

- Reviewer: verifier (opus), read-only. Writer = main session (patches generated mechanically + 8 hand patches).
- Verdict: **CONDITIONAL** → handled below → data layer PASS as reviewed.

## Reviewer evidence (re-run by reviewer)
- Leaf diff of 26 sidecars vs HEAD: 119 changed leaves, all in apply_report.fields, 0 unregistered, key set unchanged.
- en: 111/111 fields satisfy `before.replace(«→“, »→”) === after`. 205 resulting “…” pairs: nesting 0, ASCII quotes inside 0, glued to words 0, adjacent to existing “” 0.
- Residual scan (explanations, translations, questions.json): «» 0; 订货收货 0; 技术管理 only 2010h22a-q027 correct zh (common noun「単なる研究開発の技術管理」, correctly kept).
- MOT 4 fields match jp 技術経営 and textbook 技术经营. 受発注 4 fields fluent and faithful (接单 = 受注, 下单 = 発注).
- Exclusions agreed: 即兴 (jp 即興), 营业据点 (style only), possessives → C30.

## Findings and handling
- **MEDIUM** `scripts/c20-quiz-apply.ts` read `.phase1/tr_<id>.json` choices as an object keyed by letter (they are `[{letter, zh, en}]`) → every `c:` patch reported "differs (left)" and never reached `.phase1`; stems' real upstream `.phase1.5/stem_<id>.json` was not handled at all. Both dirs are gitignored (the committed sidecar is the truth; 507 questions' `.phase1` already differ), but a rebuild would restore these 11 C29 fields.
  - Fixed the script (`syncUpstream`: choices found by `letter`, stems also synced into `.phase1.5`, same exact-before rule).
  - C29's already-applied fields synced by `scripts/sync_upstream.cjs` → `upstream_sync.json`: `.phase1` c: 3 fixed; `.phase1.5` stem 6 fixed; 2 stems (2012h24h-q089, 2015h27a-q048) are stale with other content differences → glyph-only «» → “” applied by hand to `stem.en` (the history note in `change_summary_jp` of q089 left as is).
  - Earlier patches (C20/C27) with `c:` / stem targets may have the same upstream gap; not re-audited here (sidecar remains the source of truth).
- **LOW** 2010h22a-q027 correct en "called technology management in Japanese" (jp「技術経営」) → note for C30 / later en item.
- **LOW** 营业据点 → 营业网点 is a possible zh style pass; not blocking.
