# H8 Rule D 審査依頼 (verifier opus)

You are the independent Rule D reviewer for step H8 (close-out docs) of the hosting migration in /Volumes/DevSSD/Project/IT-Passport-Learning. The writer was the main session. Read-only review; do NOT edit any file except writing your report to `evidence/phase5/hosting/H8_review.md`... (you may lack Write; if so, return the report text in full as your final answer).

Changed files (see `git diff` and the untracked file):
- `RETROSPECTIVE_hosting.md` (new)
- `docs/decisions/D-217-hosting-static-then-cloudflare.md` (annotations + 実績 section)
- `docs/STATE.md` (header table cells: 最后更新 / 当前阶段 / 锁定决策 / Open Questions / 次セッション; 基础设施现状 rows) — lines are very long; use `git diff --word-diff` 
- `docs/phase5/PLAN_hosting_migration.md`, `evidence/phase5/hosting/_progress.json`, `evidence/phase5/hosting/trace.jsonl`
- `docs/discussion/2026-11-11-session-154.md` (appended H8 section + What's Next)

Primary sources: `evidence/phase5/hosting/**` (H2_measurement.md, H3_worker.md, H4_cpu_measurement.md, H4_preview_checks.md, H5_fidelity.md, H6_ops.md, H6_review.md, H7_cutover.md, H7_review.md, L4_*.md, L5_*.md, audit_matrix.md, _progress.json from `git show HEAD:`), `failures/phase5/hosting/**`, the session-154 log above the H8 section, `docs/phase5/DEPLOY_cloudflare.md`, the repo itself (apps/web/public/robots.txt, apps/web/src/lib/release/watchPaths.ts, apps/web/worker/, apps/web/next.config.*, apps/web/src/middleware*), and `git log`.

Check:
1. Every number and factual claim in RETROSPECTIVE_hosting.md and the ADR 実績 section traces to a primary source (cite file:line). Flag any figure that is wrong, unsourced, or overstated.
2. Every "done" / "open" / "not yet" claim is true per evidence and repo state. Are any carry items from `_progress.json` (HEAD version) H1..H7 carries that are still open missing from the session log "What's Next (H8 後)" / STATE 次セッション / OQ-23 / OQ-24?
3. STATE.md: diff the edited cells against the repo — are the infrastructure rows (Next.js app, Middleware, sensei) accurate for the current main? Is 锁定决策 count correct (grep docs for the max D-NNN)? Do any other STATE cells still describe the pre-cutover world (Vercel as prod, hosting-cf branch as in-progress) in a way that would mislead a new session reading STATE first?
4. Rule C completeness: does the retro have the three required sections with substantive content, and does it omit any significant failure recorded in `failures/phase5/hosting/`?
5. OQ-23/OQ-24 registration: correctly described per D-225/D-226 and DEPLOY §6?
6. `_progress.json` is valid JSON and the replaced malformed entry is reasonable.

Report: verdict PASS / PASS-WITH-CHANGES / FAIL, findings table (ID, severity HIGH/MEDIUM/LOW, file:line, issue, evidence, suggested fix). Write in Japanese.
