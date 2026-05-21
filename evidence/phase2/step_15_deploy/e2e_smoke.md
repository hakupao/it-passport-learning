# Step 15 — Playwright E2E smoke summary (Session 48)

> **11/11 PASS** against prod canonical `https://web-mu-sandy-78.vercel.app` in
> **22.8 s** total wall (1 worker, no retries). Q1=a Medium ratified.

## 1. Run metadata

| Field | Value |
|---|---|
| Date (JST) | 2026-05-21 14:17–14:18 |
| Playwright version | 1.60.0 (cli + chromium-headless-shell v1223) |
| Browser engine | Chrome Headless Shell 148.0.7778.96 |
| Target URL | `https://web-mu-sandy-78.vercel.app` |
| Underlying deploy | `dpl_CCjwr37vkFKJoDBwV1q4T9PgQrjT` (Session 47 Step 14 deploy) |
| Auth | D-097 firewall Basic Auth via `Authorization: Basic <base64>` |
| Workers | 1 (serial — kind to LLM cost envelope) |
| Retries | 1 (0 actually exercised; 0 flaky) |

## 2. Test matrix (3 surfaces × 3 locales + 2 firewall = 11)

| # | Spec | Locale | Wall | Assertions covered |
|---:|---|---|---:|---|
| 1 | chat.spec.ts | ja | 1.8 s | h1 title / input aria-label / send btn / user-bubble appears after submit / `aria-busy=true` stream indicator |
| 2 | chat.spec.ts | zh | 285 ms | (same as ja but `zh-CN` chrome strings) |
| 3 | chat.spec.ts | en | 298 ms | (same as ja but `en` chrome strings) |
| 4 | firewall.spec.ts | — | 143 ms | D-097: `GET /ja/chat` no Authorization → 401 + `WWW-Authenticate: Basic` |
| 5 | firewall.spec.ts | — | 110 ms | D-097: `GET /ja/chat` with Authorization → 200 |
| 6 | glossary.spec.ts | ja | 3.4 s | h1 / first Explain btn / URL `?term=` / `role="dialog"` opens / busy text / close → `?term=` cleared |
| 7 | glossary.spec.ts | zh | 2.6 s | (same as ja) |
| 8 | glossary.spec.ts | en | 2.2 s | (same as ja) |
| 9 | quiz.spec.ts | ja | 2.9 s | h1 / first Explain btn / URL `?qid=` / `role="dialog"` opens / busy text / close → `?qid=` cleared |
| 10 | quiz.spec.ts | zh | 2.9 s | (same as ja) |
| 11 | quiz.spec.ts | en | 3.8 s | (same as ja) |

**Aggregate: 11 expected / 11 passed / 0 skipped / 0 unexpected / 0 flaky.**

## 3. Coverage cross-check vs locked ADRs

| Locked decision | Asserted by |
|---|---|
| **D-097** (Edge middleware Basic Auth, `/api/*` + protected routes) | firewall.spec.ts tests #4 + #5 |
| **D-099** (next-intl + path-based localePrefix=`always`) | All 9 happy-path tests use `/{locale}/...` paths and assert locale-specific chrome |
| **D-085 §2.1** (Chat mode surface) | chat tests #1-3 |
| **D-085 §2.4** (Quiz Explain modal) | quiz tests #9-11 (Explain → `?qid=` → dialog → close) |
| **D-085 §2.4** (Glossary term hover modal) | glossary tests #6-8 (Explain → `?term=` → dialog → close) |
| **D-088 §2.4** (`maxRetries: 1` retain; user-facing per-locale error fallback) | Path exercised on close-aborted streams (no actual error observed; mechanism preserved) |
| **D-091 §2.5(β)** (cache-hit tripwire silent under healthy operation) | No `[tripwire]` fire observed (server-side; cache hit ≫ 50% threshold) |
| **D-094 §2.1** (PLAN.md inline wall amend pattern) | row #12 amend in tripwire_log + PLAN.md Step 15 row |

## 4. LLM cost envelope

| Surface | Calls fired | Approx cost (DeepSeek prefix cache 95%+) |
|---|---:|---|
| chat (×3 locales, identical Japanese prompt `DNS とは何か？`) | 3 | ≤ $0.0004 (chat-model, ~96%+ hit on 2nd+3rd) |
| quiz (×3 locales, first-card abort) | 3 | ≤ $0.0005 (reasoner, abort mid-stream) |
| glossary (×3 locales, first-card abort) | 3 | ≤ $0.0004 (chat-model, hover, abort mid-stream) |
| firewall (×2 raw HTTP, no LLM) | 0 | $0 |
| **Total estimated 真 LLM spend this session** | **9** | **≤ $0.002** |

Cumulative Phase 2 真 LLM ~$0.0825 + ~$0.002 ≈ **~$0.085** vs D-090 α-silent
$5 cap = **~59× headroom**.

## 5. Observability notes (non-failures)

- **(i)** `playwright-report/html/index.html` is the HTML viewer. Result JSON
  is at `playwright-report/results.json`; copied to
  `evidence/phase2/step_15_deploy/e2e_results.json` for the committed evidence
  trail. Both `playwright-report/` and `test-results/` are gitignored.
- **(ii)** `aria-busy="true"` selector in chat.spec.ts matches the scroll
  container in `<Chat />` (`role="log"` aria-busy bound to `isStreaming`).
  This is the LD-7 a11y polish from Step 14 paying double duty as the
  E2E-detectable streaming probe.
- **(iii)** Tests run serial (workers=1) on prod — gentle on the upstream LLM
  cost envelope and on the single-instance Vercel function concurrency.
  Parallel would have cut wall ~3× but is unnecessary at the α-private scope.
- **(iv)** Per Session 44 obs §ii: preview URLs `*-bojiangs-projects.vercel.app`
  remain SSO-blocked at the platform layer. `playwright.config.ts` defaults
  baseURL to the canonical prod alias (`web-mu-sandy-78.vercel.app`) for this
  reason. Overridable via `PLAYWRIGHT_BASE_URL` env var if a future preview
  deploy is unblocked via team-level SSO exception.
- **(v)** Locale assertions match `messages/{ja,zh,en}.json` content. If a key
  is renamed in messages catalogs without updating these specs, the test will
  fail on `toHaveText` — this gives the E2E suite a useful side function as
  an i18n catalog drift detector.
