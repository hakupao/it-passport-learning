This is the **v1.0.2 patch release** of the IT パスポート (Japan Information-Technology Engineers Examination — "IT Passport") trilingual study material for **Reiwa 6 (FY 2024)**. The original v1.0.0 release shipped a pipeline-produced trilingual rendering (jp + zh + en) of a Japanese-language exam-preparation textbook; v1.0.2 ships the same scope **plus ~736 content corrections** discovered during post-publication deep validation.

### What changed since v1.0.0

After v1.0.0 went public, six iteration cycles (iter-3 → iter-8) audited the release content. Iter-3 ran in two tracks. Iter-4, iter-5, iter-6 each added independent reviewer chains. Iter-7 escalated to **full-corpus 100 % atomic-leaf coverage** — 56 reviewer agents in parallel batches covered every one of the 554 emitted pages, surfacing 25 release-impacting fixes (F12–F36). Iter-8 verified iter-7's corrections via a separate qa-tester + critic chain and applied 2 final fixes (F37, F38).

Cumulative across iter-3 → iter-8: **~736 JSON edit-units + 46 Markdown regenerations** layered on top of the v1.0.0 baseline. Examples of what was fixed: white-box/black-box test demerit inversions, IPv6 definitions that described IPv4, OCR boundary contamination on DevOps/agile pages, housing/hosting Chinese disambiguation, security/safety pillar translation in the system-audit table, sentence-as-term boundary leaks, jp-kanji-in-zh systemic substitutions, and many more. Full per-fix table at the project's `RETROSPECTIVE.md` §8 + §9.

**Verification cadence**: 9 distinct subagent types used across the iteration chain — `code-reviewer`, `analyst`, `verifier`, `critic`, `scientist`, `tracer`, `executor`, `architect`, `qa-tester` — the strongest cross-reviewer separation the project has ever applied (per the project's Rule D).

**Cost**: **$0 billed**. All ~80 reviewer + fix-writer agent dispatches ran through max-plan OAuth on Anthropic, identical to the v1.0.0 build pipeline.

### What you get

Same shape as v1.0.0 — `index.json` entry point, a per-page directory of trilingual entities (now with the corrections applied), the locked glossary, a polish-items audit sidecar, README, and `SHA256SUMS.txt`. Stage 6 audit verdict, Stage 7 dual-gate state, and the cost ledger in `RELEASE_NOTES.md` below are inherited from the v1.0.0 build run (not re-run for iter-3..8, which would have cost real LLM dollars without changing any downstream consumer behavior).

### Migration from v1.0.0 / v1.0.1

v1.0.1 was an in-tree patch-release candidate after iter-3 + iter-4 + iter-5 + iter-6 (~37 % coverage); it was never published as a standalone GitHub Release. v1.0.2 absorbs all of v1.0.1's edits plus the full-corpus iter-7 + iter-8 deltas. **If you consumed v1.0.0, replace with v1.0.2 directly.** Schema is unchanged.
