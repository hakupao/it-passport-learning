# D-228 / D-229 Rule D 審査依頼 (code-reviewer opus)

Repo /Volumes/DevSSD/Project/IT-Passport-Learning. Review the uncommitted working tree (`git status`, `git diff`, deleted files via `git diff --stat` / `git show HEAD:<path>`). Writer = oh-my-claudecode:executor (opus) ×2 + main session (README / CLAUDE.md / docs). Decisions: last section of docs/discussion/2026-11-11-session-154.md (D-227, D-228, D-229).

Intended change: (D-228) Vercel project + Upstash DB deleted; repo tooling no longer targets Vercel (prod-smoke / prod-e2e vercel target removed, canonical check now on all targets), cf-monitor skips record size without KV env; learning-sync code stays (503 when unconfigured). (D-229) owner per-question feedback feature (D-149) removed entirely: UI, i18n keys, /api/quiz/feedback (Worker must return 404), lib, CLI, tests.

Check (read-only; no commit/push/deploy/wrangler, no secrets, no server on :3000 — use ≥3100 and stop by PID if you must run anything):
1. Correctness: anything still importing/rendering deleted modules; Worker routing (404 for /api/quiz/feedback, learning + owner unchanged); `QUESTION_ID_RE` move is byte-identical; apiGuards change doesn't weaken learning PUT checks; fakeUpstash reduction still serves learning e2e / cpu bench; i18n key sets equal across ja/zh/en.
2. Tests: deleted tests only covered deleted code; no remaining test lost coverage for kept behavior (owner activation, sync, CSRF guard). The prodSmoke canonical rework preserves the check's intent (see evidence/phase5/hosting/H6_ops.md).
3. Run gates yourself: in apps/web `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm exec vitest run`; repo root `node --no-warnings scripts/lang-leak-scan.ts --gate`. (build optional.)
4. Leftovers: grep for live references to vercel / Upstash DB / feedback that would mislead or break (docs/templates, scripts, apps/web, README*, CLAUDE.md, AGENTS.md). Historical annotations are fine.
5. Docs accuracy: DEPLOY_cloudflare.md D-227/228/229 annotations consistent with the session log.

Report in Japanese: verdict PASS / PASS-WITH-CHANGES / FAIL, findings table (ID, severity, file:line, issue, evidence, fix), gate outputs.
