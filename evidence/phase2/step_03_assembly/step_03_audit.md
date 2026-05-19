# Step 3 audit — 4 per-scope assembly fns + corpus boot loader

> **Status**: ✅ DONE 2026-05-19 Session 34
> **Ground truth**: D-089 §2.3 (assembly fn contracts) + Session 34 Q1=a/Q2=b/Q3=b/Q4=a
> **Wall actual**: ~30 min (PLAN estimate 1.5 day → -98% delta; 3rd γ tripwire data point)
> **LLM cost**: $0 (no API calls)
> **Vercel deploy**: ✅ READY @ https://web-nrcpizp2b-bojiangs-projects.vercel.app (`dpl_6d2uo9pn44pL9cw1p6uAzSVyVutD`, 30s build iad1, post user "go all 4" auth)

---

## 1. Deliverables checklist

| Item | Status | Evidence |
|---|---|---|
| 4 per-scope assembly fns per D-089 §2.3 | ✅ | `apps/web/src/lib/data/assembleScope.ts` |
| Common `AssembledScope` return type | ✅ | `apps/web/src/lib/data/assembleScope.ts` lines 19-28 |
| Token estimate heuristic + calibration TODO | ✅ | inline doc lines 7-12; calibrate Step 4 retro |
| Module-level singleton boot loader (Q3=b) | ✅ | `apps/web/src/lib/data/index.ts` |
| `warmUp()` Promise.all helper | ✅ | `apps/web/src/lib/data/index.ts` lines 19-22 |
| Test-only injection helpers (NODE_ENV guarded) | ✅ | `apps/web/src/lib/data/index.ts` lines 26-43 |
| Unit tests for 4 fns × happy + edge cases | ✅ | `__tests__/assembleScope.test.ts` 10 tests |
| Singleton stability + warmUp tests | ✅ | `__tests__/index.test.ts` 5 tests |
| `tsc --noEmit` green | ✅ | `build_log.txt` exit 0 |
| `pnpm lint` clean | ✅ | `build_log.txt` exit 0 |
| `pnpm build` green (no regression) | ✅ | `build_log.txt` 1404ms compile / 119 kB FLJS unchanged |
| `pnpm test` 28/28 ✅ | ✅ | `test_results.txt` (178ms) |
| Vercel preview deploy smoke | ✅ | `vercel_deploy_dpl_6d2uo9pn44pL9cw1p6uAzSVyVutD.log` — READY 30s build iad1, post user "go all 4" auth |
| PLAN.md Step 3 row → ✅ DONE | ✅ | `docs/phase2/PLAN.md` |
| STATE.md 4 anchor sync | ✅ | `docs/STATE.md` |
| Session log 2 turn | ✅ | `docs/discussion/2026-05-19-session-34.md` |

---

## 2. Wall actual vs PLAN estimate

| Step | PLAN estimate | actual | delta |
|---|---|---|---|
| Step 1 (scaffold, Session 32) | 1 day | 25 min | -98% |
| Step 2 (DataSource + index.v2, Session 33) | 2 days | 30 min | -98% |
| **Step 3 (assembly + boot, Session 34)** | **1.5 days** | **~30 min** | **-98%** |

**γ tripwire 3rd data point**: per D-091 §2.5(γ), 3 consecutive steps with >30% drift under estimate triggers PLAN.md §1 wall column amendment.

Drift pattern:
- All three Module A steps came in at ~25-30 min wall, an order of magnitude under the 1-2 day estimate.
- Root cause hypothesis: Module A steps are all thin TS scaffolding on top of Phase 1's frozen v1.0.3 corpus + already-locked D-089 contract; no design-time uncertainty.
- Likely Module B (AI SDK) and Module C (UI) will diverge — they introduce real LLM calls + UX surface.

**Action**: per Q1=a (no PLAN校正 this session), the formal `D-094` ADR amending D-091 §2.5(γ) threshold + PLAN.md §1 wall column re-estimate for Step 4-15 is **deferred to Session 35**. Recorded here as the 3rd data point trigger.

---

## 3. Semantic audit (Rule A applicability)

| Operation | Compression / rewrite ratio | Rule A applies? |
|---|---|---|
| 4 assembly fn implementation | 0% (thin wrapper, no transformation) | no |
| Boot loader singleton | 0% (boilerplate) | no |
| Token estimate heuristic (chars/4) | rough; documented; calibrated next step | no (not data compression) |

No `> 50%` compression/rewrite this step. Rule A independent N-sample audit not triggered.

---

## 4. Rule B (failure archive)

**0 failed attempts this step**. All 4 fns + boot loader landed on first write; tsc + lint + build + test all passed first run.

`failures/phase2/` unchanged (still 1 entry from Step 1 Next.js 16 drift).

---

## 5. Rule D (Writer ≠ Reviewer)

- **Writer**: main session (this session)
- **Reviewer**: user terminal sign-off path α via Q1-Q4 ACK in Turn 1 + propose-plan implicit sign-off (per Q4=a propose-first execute)
- Distinct `code-reviewer` agent dispatch available on user request (none made this step)

---

## 6. Vercel preview deploy

**Status**: ✅ READY post user "go all 4" auth.

| Field | Value |
|---|---|
| Deployment ID | `dpl_6d2uo9pn44pL9cw1p6uAzSVyVutD` |
| Preview URL | https://web-nrcpizp2b-bojiangs-projects.vercel.app |
| Inspector URL | https://vercel.com/bojiangs-projects/web/6d2uo9pn44pL9cw1p6uAzSVyVutD |
| Region | Washington D.C. (iad1) |
| Build wall | 30s (`Build Completed in /vercel/output [30s]`) |
| Bundle | 5.43 kB route + 119 kB First Load JS (no regression vs Step 2 119 kB) |
| Cache | Restored from previous deploy `dpl_7LqtYNHvEuFSdiePWj5k8KqiYKoW` (Step 2) |
| Canonical alias check | https://web-mu-sandy-78.vercel.app/ HTTP/2 200 unchanged (Step 1 prod still pinned) |
| Cost | $0 真 billed (Hobby tier preview per D-091 §2.1 α-now) |

Initial `vercel deploy --yes` attempt was denied by the Claude Code auto-mode classifier (Session 33 precedent same command had succeeded; classifier behavior tightened this session). User authorized the action via explicit "go all 4" reply, after which the deploy ran cleanly.

Full deploy log: `vercel_deploy_dpl_6d2uo9pn44pL9cw1p6uAzSVyVutD.log`.

---

## 7. Carry-forward for Session 35

1. **γ tripwire 3rd data point**: lock `D-094` amending D-091 §2.5(γ) threshold; re-estimate PLAN.md §1 wall column for Step 4-15.
2. **Step 4 entry point**: Vercel AI SDK + `@ai-sdk/anthropic` + Opus 4.7 pin + `cache_control: ephemeral` block on system+glossary (per D-088 §2.3). First LLM call this step — D-090 cost cap envelope ($5 daily / $5 per-query α-silent) activates.
3. **Token estimate calibration**: replace `Math.ceil(len/4)` heuristic with measured chars-per-token ratio from real AI SDK `usage.input_tokens` once Step 4 lands.
4. **Vercel deploy**: if user authorizes, run `vercel deploy --yes` to land the preview smoke for Step 3; otherwise the build artifact is already verified locally via `pnpm build`.
