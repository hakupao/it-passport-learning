# D-097 — α firewall mechanism revision (Vercel Password Protection → Next.js middleware Basic Auth)

| 字段 | 值 |
|---|---|
| 状态 | **LOCKED final** — Session 36 Turn 2 user terminal sign-off path α 2026-05-19 (`Lock per recommendation` ACK on Q1 confirm-recommend) |
| 锁定 session | `docs/discussion/2026-05-19-session-36.md` Turn 2 |
| 类型 | **Partial supersede of D-096 §2.3** (mechanism only) + amend PLAN.md §6 (mechanism wording + 实施 path) |
| 颗粒度 | g1 narrow — 仅锁 mechanism 替换 + 实施位置 + Cloudflare 备选记录；retain D-096 §2.1 / §2.2 / §2.4 / §2.5 (除 mechanism wording) / §2.6 实施时机 amend |
| 前置 ADR | D-091 §2.1 (α-now Hobby tier $0) / D-093 (apps/web on Vercel) / D-096 §2.1-§2.6 (auth scope split) |
| Supersede? | **YES partial** — supersede D-096 §2.3 mechanism claim only ("Vercel Password Protection 一键开启" + "Hobby tier 也有")；retain D-096 其余条款 |

---

## 1. Context

**Trigger**: Session 36 Turn 1 firewall ops 实测 → D-096 §2.3 factual error 暴露。

**实测发现序列** (Session 36 Turn 1):

1. User `firewall on` (Turn 1) → Claude 探针 prod (`web-mu-sandy-78.vercel.app/`) + preview + `/api/hello-ai`
2. Probe 结果：
   - **Prod HTTP 200** (cache-bust 后仍 200, `age:24159s` 边缘缓存但 origin 也未 gate; `/api/hello-ai` cache-bust HTTP 404 fresh = 请求到达 origin 无 auth 挑战)
   - **Preview HTTP 401** with `_vercel_sso_nonce` cookie = **Vercel Authentication SSO** (Session 35 已有), NOT new Password Protection
   - **Preview /api/hello-ai HTTP 401** = gate cover API
3. Claude 1st diagnosis: 用户 dashboard 把 SSO scope toggle 在 "Only Preview Deployments"；建议改 "All Deployments" 满足 D-096 §2.3 "preview + production env both ON"
4. User Turn 2: **"设置 Standard Protection 为 All Deployments 需要付费，我不想开会员"** = D-096 §2.3 factual claim **"Hobby tier 也有"** 错误暴露：
   - **Vercel Authentication** scope=All Deployments = **Pro tier feature ($20/月)**
   - **Vercel Password Protection** = also **Pro tier feature ($20/月)**
   - Hobby tier 只能 default-on preview SSO (无法覆盖 production)

**根因**: D-096 §2.3 lock 时 (Session 35 Turn 5) 假设 "Vercel Password Protection 是 Hobby 平台内置免费功能"，未做 docs 验证 (Vercel Pro 限定功能误为通用)。**这是 D-019 §3 "consult authoritative docs — do not rely on memory alone" 在 D-096 锁定瞬间被绕过的具体证据**。

**Implication**: D-096 §2.3 mechanism choice 与 D-091 §2.1 (α-now Hobby tier $0) 物理冲突；要么升 Pro tier (违 D-091 §2.1)，要么换 mechanism (本 D-097)。

**User constraint** (Session 36 Turn 2 explicit):
> 我不想开会员

= cost gate opened (`feedback_quality_over_cost.md` memory 触发 user 显式 open cost gate 情形)，进入 quality-best-within-Hobby-tier 决策模式。

**Slow-pace 4Q** (Session 36 Turn 2-4):
- Q1 mechanism (A Basic Auth middleware / B cookie+login middleware / C preview-only ops / D defer to Phase 3+ β)
- Q2 URL bookmark 用法 (prod canonical / preview-each-deploy / both)
- Q3 实施时机 (本场 / Step 5 并行 / Step 5 后)
- Confirm Q (recommend lock as A + 本场 + prod canonical / 中间路线 mechanism B / Cloudflare 迁移 / defer)

**User route**:
- Q1=A (回答 "能改用 cf 吗" 即提案 Cloudflare 全迁移 = Confirm Q (b) 路径) → Claude 二级 push-back (CF 迁移 4-8h + supersede D-093 + Edge runtime AI SDK 兼容性风险) → recommend A on Vercel
- Q2/Q3 user 答 "我不知道, 按你推荐来" / "你来推荐" = D-019 "你来定" 触发 → Claude consult Context7 docs (Next.js middleware Basic Auth pattern + `/vercel/next.js/v15.1.11` query) → propose: A mechanism + prod canonical bookmark + 本场实施
- Confirm Q user ans = `Lock per recommendation` = blanket ACK

---

## 2. Decision

### 2.1 Supersede target — D-096 §2.3 only

**Supersede** (D-097 §2.2 替换):
- D-096 §2.3 段："**Vercel Password Protection** (Vercel 平台内置功能，Hobby tier 也有；preview / production env 各自独立配置)"
- D-096 §2.3 段："**Default**：preview env 启 Password Protection ... production env 同步启"

**Retain**:
- D-096 §2.1 全段 (ChatGPT Plus / OpenAI Platform API 关系澄清表)
- D-096 §2.2 全段 (α single-user firewall vs β multi-user account system scope 拆)
- D-096 §2.3 标题 + 总意 "Phase 2 α single-user firewall in-scope" (mechanism 换 ≠ scope 换)
- D-096 §2.4 全段 (β multi-user account system out-of-scope 不动)
- D-096 §2.5 PLAN.md §6 amend 含义不变 (但 wording 由本 D-097 §4.1 进一步 amend)
- D-096 §2.6 实施 deferred Session 36 段已被本场 (Session 36 实施 in-flight) 自然 superseded by execution；保留 ADR 历史记录意义

### 2.2 New mechanism — Next.js middleware HTTP Basic Auth on Vercel Hobby

**Lock**: α single-user firewall 通过 **Next.js Edge middleware + HTTP Basic Auth** 实现，部署 platform 仍是 Vercel Hobby tier (D-091 §2.1 + D-093 不变)。

**形态**:

```typescript
// apps/web/src/middleware.ts (Edge runtime, ~30 行)
import { NextResponse, type NextRequest } from 'next/server'

const REALM = 'IT Passport Learning α firewall'

function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return result === 0
}

export function middleware(req: NextRequest) {
  const expected = process.env.FIREWALL_BASIC_AUTH
  if (!expected) {
    return new NextResponse('Firewall misconfigured', { status: 503 })  // fail-closed
  }
  const auth = req.headers.get('authorization')
  if (auth && timingSafeStringEqual(auth, `Basic ${expected}`)) {
    return NextResponse.next()
  }
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}"`,
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
```

**关键属性**:

| 维度 | 值 |
|---|---|
| Mechanism | HTTP Basic Auth (RFC 7617) via Edge middleware |
| 部署 platform | Vercel Hobby tier (D-091 §2.1 不动) |
| 覆盖 scope | preview + production 全 deploy (matcher 排除 `_next/static`+`_next/image`+`favicon.ico`，其他全 gate 含 `/api/*`) |
| 凭证存储 | `FIREWALL_BASIC_AUTH` env var (base64-encoded `user:pass`)，Vercel preview+production env 同步配置 |
| 凭证泄漏防护 | Constant-time string compare (`timingSafeStringEqual`) 防 timing attack；env var Vercel encrypted at rest |
| Fail mode | env var 缺失 → 503 fail-closed (永不无凭证放行) |
| 行数 | ~30 行 source + ~70 行 vitest test |
| 代码风险 | Edge runtime 受限子集 (no Node.js `Buffer` etc.)；本实现仅用 Web 标准 API (Request/Response/string ops) ✅ safe |
| Cost | $0 (Hobby tier infrastructure free; FIREWALL_BASIC_AUTH 是 env var 不计费) |

**Local dev 兼容**: `.env.local` 写入相同 `FIREWALL_BASIC_AUTH`，本地 `pnpm dev` 也 gate；fail-closed 实测在 fresh checkout 缺 env var 场景产 503 而非 silent-open。

### 2.3 Cloudflare Access 作 Phase 3+ β 阶段备选 (rejected for α)

**记录**: 用户 Session 36 Turn 2 提出 "能改用 cf 吗" 触发 Cloudflare Pages + Workers + Cloudflare Access 迁移评估。

**评估结论 (本 D-097 LOCK)**: 迁移 **rejected for Phase 2 α** + **kept as Phase 3+ β option**.

**Phase 3+ trigger 条件** (CF Access α→β 升级 path)：
- 触 D-092 β trigger checklist (user-explicit + multi-trigger)
- β multi-user account system 设计开 (D-083 §2.5 + D-097+ sub-ADR)
- 评估当时 Cloudflare Pages + Next.js + AI SDK 兼容性（Edge runtime / Workers runtime / Node compat 演进）
- 评估迁移 wall 成本 vs Phase 3+ 新功能开发增量

**为什么 α 不迁**：见 §3 Rejected alternatives (b).

### 2.4 实施清单 (本场 Session 36 完整 in-flight)

**5 steps** (执行顺序 fixed):

1. **本 D-097 ADR + session-36 log Turn 1-3 write** (this turn) — ADR lock + slow-pace traceability
2. **`apps/web/src/middleware.ts` + `apps/web/src/__tests__/middleware.test.ts`** — implementation + ≥6 vitest unit tests (no-auth/wrong-auth/correct-auth/env-missing/matcher-config/timing-safe-compare smoke)
3. **`FIREWALL_BASIC_AUTH` env var setup**: generate password (random hex 16 bytes via `/dev/urandom`), base64-encode `claude:<pass>`, set on Vercel preview + production (user via dashboard or `vercel env add` CLI), 写入 `apps/web/.env.local` 供本地 dev
4. **Deploy + verify chain**: `vercel deploy --yes` → preview 401 baseline → curl `-u claude:<pass>` 通过 → `vercel deploy --prod --yes` (overwrite Step 1 stale prod) → cache-bust prod URL → 401 expected → `-u claude:<pass>` 200/expected → screenshots + log evidence
5. **`evidence/phase2/step_04_ai_sdk/firewall_setup_2026-05-19.md`** + STATE.md sync (96→97 ADR count + 最后更新 + 下一会话) + PLAN.md §6 amend (本 D-097 §4.1)

### 2.5 Password rotation policy (软规)

- α single-user firewall：rotation 频率 user 自决 (建议季度 1 次)
- Rotation 流程：dashboard 改 env var → 触 redeploy → 本地 `.env.local` 同步 → 不进 ADR (不锁规则)
- 凭证 leak suspicion 时立即 rotate；不留 ADR (ops-level)

---

## 3. Rejected alternatives

### Mechanism Q (Confirm Q)

#### (b) Cloudflare Pages + Workers + Cloudflare Access 全迁移 — REJECTED for α

- **Pro**：Cloudflare Access 免费层 50 用户 OAuth/email OTP；zero code α firewall；scope=All Deployments 默认；真正 quality > shared password 方案
- **Con 1 — Wall cost**: 4-8 小时迁移 (Pages build pipeline + env vars + DNS + AI SDK 验证 + redeploy 链路)，远超 mechanism A on Vercel (~10 min)；Phase 2 mid-implementation (4/15 step done) 切换 platform = 引入大风险
- **Con 2 — D-093 supersede 连锁**: D-093 LOCKED "apps/web Next.js 15 app on Vercel"，CF 迁移触 D-093 + 后续多 ADR supersede；mechanism 换 vs platform 换 量级不对
- **Con 3 — Edge runtime AI SDK 兼容性**: `apps/web/src/app/api/hello-ai/route.ts` 当前 `runtime = 'nodejs'`，Cloudflare Workers V8 isolates 不直接支持 Node.js runtime；需切 Edge runtime 并验证 `@ai-sdk/deepseek` + `@ai-sdk/anthropic` cache_control providerMetadata 全链路 — 非平凡
- **Con 4 — Step 4 已验证 Vercel platform**: $0.017 真 billed + 99.98% cache hit + DeepSeek 链路实测 (Session 35 evidence)，沉没数据迁后须重做
- **Con 5 — α 威胁模型**: single-user firewall 防外人偶遇 URL，Basic Auth 已 100% 充分；CF Access 的 SSO/OAuth/email OTP 是给 β multi-user 准备的 — α 用 CF Access = over-engineering
- **决议**: 推 Cloudflare Access 评估到 Phase 3+ β 阶段 (per §2.3)，量级匹配；Phase 2 α 用 mechanism A

#### (c) Mechanism B — middleware + cookie + 自定义 `/login` page (~50 行) — REJECTED for α

- **Pro**：UX 比 Basic Auth 好 (自定义 login page，移动端漂亮)；session 持久化避免每次浏览器重新输 (虽然 Basic Auth 浏览器一般也会记)
- **Con 1 — Over-engineering for α**: α = single user，无 session sharing 需求；Basic Auth 浏览器原生 prompt 对单人单设备已经 fine
- **Con 2 — 代码风险**: 自定义 cookie + login flow ~50 行 vs Basic Auth ~30 行；CSRF / cookie expiry / HttpOnly / Secure / SameSite 五件套需逐一对，写错就是真漏洞
- **Con 3 — YAGNI**: 未来 β 上 NextAuth / Auth.js / OAuth 时，自写 cookie 逻辑被全替换 — 现在写白写
- **决议**: mechanism A 现在做，未来 β 时 NextAuth + DB 直接 land；中间不留临时手写 auth code

#### (d) Defer α firewall 到 Phase 3+ 与 β 一起做 — REJECTED

- **Con 1 — 违 D-096 §2.1 α-now 锁**: α single-user firewall is **in-scope NOW** per D-096 §2.1 + §2.3 (mechanism 换 ≠ scope 撤)；defer = scope 撤 = 触 D-098+ supersede D-096 §2.1+§2.3+§2.6 三段
- **Con 2 — 实操风险**: prod URL 公开期 Step 5+ 真 LLM call 流量 (含可能 PII 学习行为 / DeepSeek API consumption metadata) 暴露于扫描器 / bot；Step 4 已实测 99.98% cache hit 说明 prod 流量有真实 value，不应公开
- **决议**: defer 不 acceptable; mechanism A 本场实施

### Cloudflare migration timing alternatives

#### (e) Cloudflare 现在迁 + 推迟 Step 5 — REJECTED

- 等同于 (b) 但显式 trade Step 5 wall
- Same 5 反对理由

#### (f) Cloudflare 迁但保留 Vercel deploy 双轨 — REJECTED

- 双轨维护成本 = 2× infra；α 单人项目无双轨价值
- Discount: 仅在 audit 需要时考虑

### Vercel Pro tier 升级 — REJECTED upfront

- **Con**: $20/月 = $240/年 = 违 D-091 §2.1 α-now Hobby $0 锁；user 显式 "我不想开会员" close
- **决议**: rejected pre-discussion；本 D-097 §2.2 不考虑

---

## 4. Implications

### 4.1 PLAN.md §6 amend (this turn)

**原** (per D-096 §2.5 + PLAN.md current line 167):
> - **α single-user firewall** (Vercel Password Protection 一键开启级别，无 user identity / session / DB) — Phase 2 α **in-scope** per **D-096 §2.3**；Session 36 entry 5 min ops 配置 (Vercel dashboard → project `web` → Settings → Deployment Protection → Password Protection ON for preview + production)。**与多用户账户系统是性质不同的需求**：firewall = 平台层访问 token，account system = 应用层 user identity + state。

**新** (本 D-097 LOCK):
> - **α single-user firewall** (Next.js Edge middleware + HTTP Basic Auth (RFC 7617), 无 user identity / session / DB) — Phase 2 α **in-scope** per **D-097 supersede D-096 §2.3**；Session 36 in-flight 实施 (`apps/web/src/middleware.ts` ~30 行 + vitest test + `FIREWALL_BASIC_AUTH` env var on Vercel preview+production)。**与多用户账户系统是性质不同的需求**：firewall = 平台层访问 token (Basic Auth credential)，account system = 应用层 user identity + state。**Cloudflare Access 作 Phase 3+ β 阶段备选** per D-097 §2.3。

### 4.2 STATE.md sync (this turn)

- `已锁定决定数` 96 → **97**
- `最后更新` row append Session 36 Turn 2 narrative (D-097 lock + Cloudflare 路径推 β + mechanism A 本场实施)
- `下一会话` row update：原 Session 36 entry actions (i) firewall ops (this in-flight) + (ii) Step 5 → 本场后 → Step 5 D-019 4Q

### 4.3 Code changes (本场后续 turn)

- `apps/web/src/middleware.ts` (new, ~30 行)
- `apps/web/src/__tests__/middleware.test.ts` (new, ~70 行 vitest)
- `apps/web/.env.local` (new line `FIREWALL_BASIC_AUTH=<base64>`; gitignored)
- Vercel env var: `FIREWALL_BASIC_AUTH` set on preview + production scope (via dashboard or `vercel env add`)
- 不动 既有 `apps/web/src/lib/**` + `apps/web/src/app/api/hello-ai/**` + `apps/web/src/app/**` 任何 file (middleware 是独立 file)
- `pnpm test` 预期 36 → 36+N (N≥6) pass；`pnpm build` 预期 +1 middleware route 编译 (~+1-3s)；`pnpm lint` 预期 exit 0

### 4.4 Deploy chain

- `vercel deploy --yes` 后 preview URL 期待 401 baseline + `-u claude:<pass>` 通过 200
- `vercel deploy --prod --yes` 后 prod canonical `web-mu-sandy-78.vercel.app/` cache-bust 期待 401 (覆盖 Step 1 stale 200)
- 同时 `/api/hello-ai` gate cover 不能裸 POST 触 LLM (Step 5 LLM 调用必须带 Basic Auth header)

### 4.5 D-090 / D-091 cost envelope 不变

- Vercel platform cost = $0 unchanged
- middleware code 跑在 Vercel Edge runtime 单次执行 < 10ms，不显著占用 free tier quota (Hobby tier Edge middleware quota = 1M invocation/月 free)

### 4.6 D-094 wall data point (Module B 第二个)

- 本场 wall actual 估 ~30-45 min (middleware + test + env var setup + 2 deploy + probe + evidence + STATE/PLAN sync + ADR)
- 远小于 1-day step estimate；Module B 第二个 wall data point (Step 4 = Module B 第一个 = ~140 min)
- D-094 §2.4 Step 5 mid-implementation retro decision input 累积中 (本 D-097 是 Module B 内部 ops, 不算 Module B 主 step)

---

## 5. Out of scope

- **Cloudflare 迁移技术验证** — 推 Phase 3+ β trigger 触发后
- **NextAuth / Auth.js 集成** — β multi-user 形态 (D-083 §2.5 不动)
- **Password rotation 自动化** — α 单用户人工 dashboard 改即可，不锁 ADR
- **Multi-factor auth (TOTP / WebAuthn / FIDO2)** — α scope 外
- **Audit log / access log** — Vercel default logs 已足 α；自建审计 = β scope
- **IP whitelisting / geo-blocking** — α scope 外，need 时另立 ADR
- **Rate limiting on Basic Auth attempts** — Vercel 默认 Edge runtime 无内置 rate limit；自建 brute-force protection 推 β
- **Cookie-based session on top of Basic Auth** — 浏览器原生 Basic Auth credential cache 已足；不混合两机制

---

## 6. Audit / Trace

- **Trigger**: user Session 36 Turn 2 message "我不想开会员" 触发 mechanism revision，根因 D-096 §2.3 factual error
- **Docs consult** (per D-019 §3): Context7 `/vercel/next.js/v15.1.11` query → middleware.ts location convention (src/) + NextResponse/NextRequest API + matcher config + Edge runtime constraints 全 verified
- **Slow-pace 4Q**: Q1 mechanism / Q2 URL bookmark / Q3 timing / Confirm Q
- **User ans**: Q1 raw="能改用 cf 吗" (CF 提案) → Claude 二级 push-back → Confirm Q "Lock per recommendation" = mechanism A + 本场实施 + prod canonical
- **User ACK**: `Lock per recommendation` 2026-05-19 = blanket execute green light
- **Lock turn**: Session 36 Turn 2 (本 ADR write + PLAN.md §6 amend + session-36 log Turn 1-2 narrative + STATE.md sync)
- **Implementation**: 本场 Session 36 Turn 3+ in-flight (middleware + test + env + deploy + verify + evidence)

---

## 7. Amend / Future supersede pattern

- 本 D-097 可后续 amend in-place (v1.1 / v1.2…) per D-080 v1.1 §8 pattern
- α firewall (Basic Auth) → β account system 升级时 (β-open 触发 per D-092)：
  - 立 D-NNN supersede D-097 §2.2 mechanism (Basic Auth → NextAuth/Auth.js or Cloudflare Access)
  - 同时 amend PLAN.md §6 双向 (α firewall middleware 撤 / β account system in-scope)
  - 决策 input: D-097 §2.3 + Cloudflare Pages + Next.js + AI SDK 兼容性当时实测
- 若 D-091 §2.1 α-now cost envelope re-baseline (Hobby → Pro 升级) → 评估是否 D-097 §2.2 mechanism 换回 Vercel Authentication SSO with All Deployments scope (彼时 Pro 已含)；不强制 supersede，看 wall 收益

---

**END D-097 v1.0 — 2026-05-19 LOCKED**
