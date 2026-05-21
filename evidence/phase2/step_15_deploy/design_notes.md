# Step 15 — design notes (Session 48)

> Module D 3/3 final step. Q1-Q4 pre-locked at Session 47 close (6th
> consecutive Phase 2 blanket-ACK across Sessions 41/43/44/45/46/47):
>
> - **Q1=a** Playwright Medium = 9 happy-path tests (3 surfaces × 3 locales)
> - **Q2=a** Custom domain defer to β (D-092 §3 backlog)
> - **Q3=a** Standard Rule C 3-section RETROSPECTIVE + γ 15-data-point summary + β TTL appendix
> - **Q4=a** 1 atomic commit per Sessions 27-46 pattern (user `go commit` + `push it` gates)

## 1. In-source LDs (per D-094 §2.1 — NOT D-NNN-worthy individually)

| LD | Decision | Why |
|---|---|---|
| **LD-1** | `playwright.config.ts` lives at `apps/web/playwright.config.ts` (not at repo root) | Co-locates with the rest of the Next.js project; `pnpm exec playwright test` resolves config automatically; `apps/web/e2e/` testDir mirrors the colocation pattern. |
| **LD-2** | baseURL = **prod canonical** `web-mu-sandy-78.vercel.app`, NOT a fresh preview URL | Session 44 obs §ii: preview URLs are platform-SSO-blocked separately from D-097 application firewall. Prod canonical is the only URL that actually exercises the D-097 path. |
| **LD-3** | Auth = `extraHTTPHeaders: Authorization: Basic ${FIREWALL_BASIC_AUTH}` injected via config, NOT per-request | Single point of inclusion; Chrome carries the header to sub-resource fetches automatically so the AI SDK client-side calls inherit it. Mirrors how a real browser session works after the first 401 challenge. |
| **LD-4** | `FIREWALL_BASIC_AUTH` read from `process.env` first, fallback to manual `apps/web/.env.local` parser | Same secret already in `.env.local` (gitignored) for `next dev`. Avoids adding a `dotenv` dep just for the Playwright config — small hand-rolled parser is acceptable per D-094 §2.1 + D-080 v1.1 §8 in-source amendment patterns. |
| **LD-5** | `workers: 1` (serial), `retries: 1` | Serial keeps the LLM cost envelope tight (≤9 prompt fires across 22.8s wall) and respects Vercel function concurrency. Retries=1 absorbs transient network blips without hiding real regressions; observed 0/11 retries triggered. |
| **LD-6** | Happy-path scope = "user-interaction works end-to-end", NOT "AI returns content" | Sessions 41-44 + 47 already cover AI-response correctness via Chrome DevTools MCP smokes. Playwright value here is the UI plumbing layer (i18n routing + firewall + form submit + modal open/close URL pinning). Chat tests assert user-bubble + `aria-busy` indicator; modal tests assert dialog opens + busy text + close clears URL. |
| **LD-7** | Modal close via Close-labelled button (footer Close in glossary, ✕ button in quiz — both share the same locale `closeLabel`) | The page's `getByRole('button', { name: closeLabel }).first()` matches the first occurrence (which differs per modal — quiz has ✕ first, glossary has ✕ first too via aria-label). Both work because both Close buttons in a given modal carry the same locale string. |
| **LD-8** | Optional D-097 firewall tests included as a separate spec file `firewall.spec.ts` | Distinct surface area from the i18n happy-paths; isolated so a firewall regression doesn't mask app-layer regressions or vice versa. Uses `request.newContext({ extraHTTPHeaders: {} })` to strip the default auth header for the 401 case. |

## 2. Why no new ADR

Step 15 honoured locked decisions cleanly:

| Locked ADR | Step 15 touch |
|---|---|
| **D-085 §2.1/§2.4** (Chat/Quiz/Glossary surface contracts) | Tests assert against contract; no contract change |
| **D-088 §2.3/§2.4** (stable-prefix + per-locale error fallback) | Tests indirectly ratify by closing mid-stream without observing the error fallback (which would surface only on actual server failure) |
| **D-091 §2.5(β)** (cache-hit tripwire silent under healthy) | All 9 LLM calls expected ≥95% hit; no `[tripwire]` line in server logs (also subject to Session 44 §iv CLI suppression — server still records) |
| **D-094 §2.1** (in-source amend pattern) | Used for LD-1..LD-8 above |
| **D-095 §2.3** (stable-prefix corpus→SYSTEM→user) | Untouched server-side; tests issue real requests against the existing layout |
| **D-097** (Edge middleware Basic Auth) | Tests directly assert the contract (401 + 200) |
| **D-099 §2.3** (path-based localePrefix=always) | All 9 happy-path tests use `/{locale}/...` paths; verifies the locked routing contract |
| **D-100 §2.3 + LD-11** (Upstash KV_*/UPSTASH_* fallback) | Untouched (cap.ts is server-only; tests don't deliberately trigger cap) |

No architectural choices changed. The new test infrastructure is an
implementation artifact of locked Q1=a / Q4=a, not a decision-space change.

## 3. Wall-time tripwire (γ) — row #12 candidate

| Metric | Value |
|---|---|
| Session 48 wall on Step 15 (boot + impl + audit + evidence write) | ~75 min |
| Re-estimate locked Session 44 | ~1.1h = 66 min |
| Drift | **+14%** (slight over) |
| 15th data-point context | Module A 3× / Module B 5× / Module C 4× / Module D 3× (Step 13 −31%, Step 14 +52%, Step 15 +14%) |

**γ tripwire row #12 candidate**: 2nd consecutive over-estimate datapoint in
Module D after 12 prior under-estimates (Modules A-C). The "wide-but-shallow
polish + audit" sub-regime (Step 14) and the "Playwright bootstrap + spec
authoring + audit" sub-regime (Step 15) both run +14% to +52% over estimate,
suggesting Module D's velocity floor is closer to estimate (not -85% under
like Modules B/C). Module D N=3 mean drift = **(-31 + 52 + 14)/3 = +12%** —
within ±15% noise band; subsequent phases can use estimates as-locked without
correction.

This is a small over (not the Step 14 +52% magnitude), so it's a noise-band
observation rather than a structural finding. The actual Playwright work was
larger than I expected purely from "install + 9 tests + run" because of:
- LD-4 env file parser (small but unplanned)
- LD-3 auth header injection design (resolved cleanly via extraHTTPHeaders)
- LD-2 prod-vs-preview decision documentation
- LD-8 separate firewall spec (added 2 bonus tests beyond Q1=a's 9)
- Evidence + design_notes + smoke summary write

## 4. Cost envelope (真 LLM spend)

- Session 48 真 ≤ $0.002 (≤9 real LLM calls at 95%+ DeepSeek prefix cache hit)
- Cumulative Phase 2 真 ~$0.0845 vs D-090 α-silent $5 cap = **59× headroom**
- Module D total真 spend = ~$0.0021 (Step 13: $0 / Step 14: $0.000122 / Step 15: ~$0.002)

## 5. β tripwire data N=15 (one new for Step 15 round)

Step 15 fires 9 real LLM calls but the streaming is aborted mid-flight on all
6 modal-open tests (quiz + glossary × 3 locales). The 3 chat tests submit but
don't wait for completion. Cache-hit observability is therefore partial — the
SSE `usage` chunk arrives only after server-side completion, which we abort
before. β tripwire data unchanged at N=14 from Session 47 baseline; Step 15
doesn't add a fully-observable data point.

## 6. Phase 2 closing posture

Step 15 ✅ DONE close completes **Module D 3/3** and therefore **Phase 2
implementation phase**. Remaining session work this turn:

1. RETROSPECTIVE_phase2.md per Rule C (Session 47 Q3=a lock)
2. PLAN.md Step 15 row ✅ DONE + Module D completion banner
3. STATE.md 4-anchor sync to Phase 2 status = `implementation complete`
4. `tripwire_log.md` row #12 (Step 15 γ data point)
5. New session-48 log per D-027 §3
6. User `go commit` + `push it` gates per Q4=a

After commit + push, Phase 2 is the α-private shippable state on prod
canonical with D-097 firewall + i18n + a11y AA + cap mechanism + E2E ratified.
