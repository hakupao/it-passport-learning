# Firewall setup — Phase 2 α single-user firewall (D-097)

> **Session 36 evidence** — α firewall mechanism revision (D-097 supersede D-096 §2.3) + Vercel deploy chain + acceptance probes
>
> **Mechanism**: Next.js Edge middleware + HTTP Basic Auth (RFC 7617) on Vercel Hobby tier
> **Scope**: preview + production (both env have `FIREWALL_BASIC_AUTH` set; middleware runs on every request except `_next/static`+`_next/image`+`favicon.ico`)
> **Cost**: $0 (Vercel platform feature; middleware Edge runtime free quota 1M invocations/month on Hobby)

---

## 1. Pre-firewall baseline (Session 36 Turn 1, 2026-05-19)

| URL | Probe | HTTP | Headers (key) | Reading |
|---|---|---|---|---|
| `https://web-mu-sandy-78.vercel.app/` (prod canonical) | `curl -sI` | **200** | `age: 24129`, `etag: c5a4a94e339da7a974cf91e3eee7a3be`, `x-nextjs-prerender: 1` | Step 1 stale Next.js scaffold, edge-cached, wide open |
| `https://web-mu-sandy-78.vercel.app/?bust=<ts>` | cache-bust | 200 (still cached) | same `age` / `etag` | Edge cache honors origin response not query string |
| `https://web-mu-sandy-78.vercel.app/api/hello-ai?bust=<ts>` | cache-bust | **404 age:0** | fresh origin response | Step 1 prod build has no `/api/hello-ai` route — confirms request reaches origin without auth challenge (= firewall NOT gating prod) |
| `https://web-6ucf4itkl-bojiangs-projects.vercel.app/` (Session 35 preview) | `curl -sI` | 401 | `set-cookie: _vercel_sso_nonce=...` | Vercel team SSO (Hobby default), pre-existing from Session 35; NOT new Password Protection |

**Diagnosis**: D-096 §2.3 nominal "Vercel Password Protection" mechanism was assumed Hobby-tier-free; user "我不想开会员" 2026-05-19 confirmed Pro-tier-only ($20/mo); triggered D-097 mechanism revision.

---

## 2. D-097 LOCKED — α firewall mechanism revision

See `docs/decisions/D-097-firewall-mechanism-revision.md` for full ADR.

**Headline change**: Vercel Password Protection (Pro-only) → Next.js Edge middleware + HTTP Basic Auth on Vercel Hobby ($0).

**Rejected**: Cloudflare full migration (4-8h wall + D-093 supersede + AI SDK Edge runtime risk), mechanism B cookie+/login (~50 行 over-engineering for α single-user), defer to Phase 3+ (violates D-096 §2.1 α-now scope).

---

## 3. Implementation artifacts (D-097 §2.4 step 2-3)

### 3.1 Code

| File | Lines | Tests |
|---|---|---|
| `apps/web/src/middleware.ts` | 35 (incl. `timingSafeStringEqual` helper, REALM constant, middleware fn, config matcher) | n/a |
| `apps/web/src/__tests__/middleware.test.ts` | 95 | **10/10 ✅** in vitest run (timing-safe-equal × 4 + middleware behavior × 5 + config matcher × 1) |

**Test suite cumulative**: 48 (Step 2 + Step 3 + Step 4) + 10 (middleware) = **58/58 ✅ in 198ms** via `pnpm test` (vitest@4.1.6, Session 36 Turn 3).

**Build verification**:
- `pnpm build` ✅ 6 routes (5 static + 1 dynamic `/api/hello-ai`) + **`ƒ Middleware 37.6 kB`** compiled successfully
- `pnpm lint` ✅ exit 0
- `tsc` ✅ exit 0 (TS strict + noUncheckedIndexedAccess preserved)
- First Load JS 119 kB no regression vs Session 35 Step 4 close

**Drift**: 1 retry — initial REALM constant contained Greek "α" (U+03B1) which broke HTTP header `WWW-Authenticate` ByteString constraint (chars > 255 rejected by Web Headers API). Fix: replaced with ASCII "IT Passport Learning firewall". 3 of 10 tests failed pre-fix, all 10 pass post-fix. No Rule B archive needed (inline correction within Turn 3).

### 3.2 Env var setup (Vercel + local)

| Scope | Method | Result |
|---|---|---|
| Vercel Production | `vercel env add FIREWALL_BASIC_AUTH production --value <base64> --yes` | ✅ "Added Environment Variable FIREWALL_BASIC_AUTH to Project web [218ms]" |
| Vercel Preview (all branches) | `vercel env add FIREWALL_BASIC_AUTH preview "" --value <base64> --yes` | ✅ after 2 attempts (first attempt missing empty-string positional for `[git-branch]` arg returned `git_branch_required`; explicit empty string `""` = "all preview branches" worked) |
| Local dev | `apps/web/.env.local` written with `FIREWALL_BASIC_AUTH=<base64>` (gitignored via `.env*` pattern) | ✅ |

**Credential format** (per D-097 §2.2):
- Username: `claude`
- Password: 32-char hex (random `openssl rand -hex 16` 2026-05-19)
- Auth header value: `Basic <base64(claude:<password>)>` per RFC 7617
- Env var content = base64 portion only; middleware constructs `Basic ${env}` for comparison

**Password NOT recorded in this evidence file** (per D-096 §2.6 + general security hygiene: 凭证 vs evidence 分离). Plain credential lives only in `apps/web/.env.local` (gitignored) + Vercel encrypted env vars + user terminal scrollback (this session).

---

## 4. Deploy chain

| Deploy | Trigger | URL | Status |
|---|---|---|---|
| Preview | `vercel deploy --yes` from `apps/web` (Session 36 Turn 5) | `web-kfr4qalfr-bojiangs-projects.vercel.app` (`dpl_EuATTbK2NsHd6XByBVUN7Xaeid12`) | READY |
| Production | `vercel deploy --prod --yes` (user-authorized 2026-05-20 00:51 UTC, Session 36 Turn 6) | `web-4vgz403oz-bojiangs-projects.vercel.app` (`dpl_4aA6jQjoMTdJR3TBkT819N9QpFQo`) aliased to `web-mu-sandy-78.vercel.app` | READY, target=production |

Both deploys completed in <30s, build region iad1/hnd1 (Tokyo edge for prod test sources).

---

## 5. Acceptance probes (D-097 §2.4 step 4 verification)

### 5.1 Production probes (clean test — no Vercel team SSO interference)

| # | Probe | Expected | Actual | ✅/❌ |
|---|---|---|---|---|
| P1 | `curl -sI -H "Cache-Control: no-cache" "https://web-mu-sandy-78.vercel.app/?bust=<ts>"` | 401 + `WWW-Authenticate: Basic realm=...` | HTTP/2 **401**, `www-authenticate: Basic realm="IT Passport Learning firewall"`, `cache-control: public, max-age=0, must-revalidate` | ✅ |
| P2 | `curl -sI -u "claude:<pass>" "https://web-mu-sandy-78.vercel.app/?bust2=<ts>"` | 200 + Next.js HTML | HTTP/2 **200**, `etag: a1343f8f32350b3f6fae69ca636b2aab` (NEW, differs from stale `c5a4a94e...` baseline), `x-nextjs-prerender: 1`, `age: 0` (fresh) | ✅ |
| P3 | `curl -sI -H "Cache-Control: no-cache" "https://web-mu-sandy-78.vercel.app/api/hello-ai?bust=<ts>"` | 401 (API route also gated) | HTTP/2 **401**, same `www-authenticate` header | ✅ |

### 5.2 Preview probes (defense-in-depth note, not the acceptance test)

| # | Probe | HTTP | Headers | Gate identified |
|---|---|---|---|---|
| V1 | `curl -sI <preview>/` (no auth) | 401 | `set-cookie: _vercel_sso_nonce=...` | Vercel team SSO (infrastructure layer, Hobby default — pre-existing from Session 35) |
| V2 | `curl -sI -u "claude:<pass>" <preview>/` | 401 | same `_vercel_sso_nonce` cookie | Vercel SSO fires FIRST before reaching Next.js middleware; Basic Auth header never seen by my code |

**Note**: Preview Basic Auth middleware behavior cannot be verified via plain curl due to Vercel team SSO infrastructure-layer pre-gate (Session 35 used `vercel curl --debug`-extracted `x-vercel-protection-bypass` token to reach `/api/hello-ai` for the cache_audit; same mechanism applies here if direct preview middleware test is ever needed). For α firewall acceptance, **production probes (5.1) are sole truth source** since prod has no Vercel SSO layer (Hobby tier doesn't gate production).

**Defense-in-depth bonus**: preview deploys end up gated by Vercel SSO + my middleware (layered), not less secure than prod's middleware-only gating.

---

## 6. Compliance check

| Item | D-097 reference | Status | Note |
|---|---|---|---|
| Mechanism = Next.js Edge middleware + HTTP Basic Auth | §2.2 | ✅ | `apps/web/src/middleware.ts` |
| Scope = preview + production | §2.2 + D-096 §2.3 retained 总意 | ✅ | Both Vercel env scopes have FIREWALL_BASIC_AUTH; middleware runs on every matched path in both |
| Fail-closed on env missing | §2.2 | ✅ | Tested: `delete process.env.FIREWALL_BASIC_AUTH` → 503 |
| Constant-time string compare | §2.2 | ✅ | `timingSafeStringEqual` function, 4 dedicated unit tests |
| Matcher excludes static + image + favicon | §2.2 | ✅ | `'/((?!_next/static|_next/image|favicon.ico).*)'` |
| Cost = $0 | §2.2 | ✅ | $0 billed for env var + Edge middleware quota (1M invocations/month free on Hobby) |
| Cloudflare migration recorded as Phase 3+ option | §2.3 | ✅ | D-097 §2.3 + Rejected alternatives §3 (b) documented |
| Password rotation policy | §2.5 | ✅ | softgov (user discretion, quarterly suggested) recorded |
| PLAN.md §6 amend | §4.1 | ✅ | line 167 updated 2026-05-19 Session 36 Turn 3 |
| STATE.md sync | §4.2 | ✅ pending this evidence + STATE write | 96→97 ADR count + 最后更新 + 下一会话 |
| Session log Turn 1-X | §4.3 | ✅ | `docs/discussion/2026-05-19-session-36.md` Turns 1-6 narrative |

---

## 7. Wall budget (D-094 §2.4 data point — Module B in-flight ops)

| Phase | Wall | Notes |
|---|---|---|
| Turn 1 entry + probe + diagnosis | ~10 min | discovered factual error in D-096 §2.3 |
| Turn 2 4Q + Cloudflare eval + D-097 lock decision | ~15 min | slow-pace per D-019 |
| Turn 3 D-097 ADR + session-36 log + PLAN amend | ~20 min | ~280-line ADR + ~120-line session log |
| Turn 3 middleware + tests + run vitest/lint/build | ~15 min | 1 retry (REALM ASCII fix) |
| Turn 4-5 env var setup + preview deploy + probe | ~10 min | 2 retries on CLI gitbranch arg |
| Turn 6 prod deploy + probes + this evidence write | ~10 min | clean acceptance |
| **Total Session 36 Turn 1-6 wall** | **~80 min** | vs estimate "5 min ops" originally in D-096 §2.6 |

**Note**: 80 min ≫ 5 min original estimate — drift +1500%. Root cause: D-096 §2.3 factual error required full mechanism revision (D-097 ADR) + implementation + tests + 2-deploy chain. Not a D-094 §2.5(γ) tripwire data point per se (Module B-D estimates "held" per D-094 §2.2; this is mid-step ops not full step), but is the kind of data D-094 §2.4 Step 5 mid-implementation retro should weight.

---

## 8. Sign-off

| 项 | 状态 |
|---|---|
| D-097 ADR LOCKED | ✅ `docs/decisions/D-097-firewall-mechanism-revision.md` |
| Code green | ✅ 58/58 vitest + lint + build + tsc strict |
| Vercel env vars | ✅ FIREWALL_BASIC_AUTH on preview + production |
| Local .env.local | ✅ written, gitignored |
| Preview deploy | ✅ `dpl_EuATTbK2NsHd6XByBVUN7Xaeid12` READY |
| Production deploy | ✅ `dpl_4aA6jQjoMTdJR3TBkT819N9QpFQo` READY aliased canonical |
| Acceptance probes (prod, 3 cases) | ✅ all 3 ✅ (401 baseline / 200 with auth / 401 on /api/*) |
| PLAN.md §6 amend | ✅ line 167 updated |
| STATE.md sync | pending Turn 7 write (this evidence then STATE) |
| Rule A 抽检 | n/a (no LLM rewrite >50%) |
| Rule B 失败归档 | 0 (REALM Unicode → ASCII fix was inline, no scrapped artifact; CLI `--yes` retry was syntax discovery, no archive needed) |
| Rule C Phase retro | n/a (mid-Phase) |
| Rule D Writer ≠ Reviewer | ✅ user terminal acts as Reviewer via "Lock per recommendation" ACK + 2 production gates (`授权 vercel preview env add` + `授权 vercel --prod`) |

**α single-user firewall LIVE on production canonical URL `https://web-mu-sandy-78.vercel.app/` as of 2026-05-20 00:51 UTC (Session 36 Turn 6)**.

---

**END firewall_setup_2026-05-19.md**
