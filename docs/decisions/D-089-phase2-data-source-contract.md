# D-089 — Phase 2 数据源 contract

| 字段 | 值 |
|---|---|
| 状态 | **LOCKED final** — Session 30 Turn 4 user terminal sign-off path α 2026-05-19 |
| 锁定 session | `docs/discussion/2026-05-19-session-30.md` |
| 类型 | sub-ADR of D-083 §2.5 + D-087 §2.4 (Vercel SSR) + D-088 §2.3 (cache 区块) |
| 颗粒度 | g2 mid level（数据源选型 + manifest schema 大纲 + per-scope excerpt 装配；不锁具体 server module 边界 / Vercel build config / cache invalidation 策略 → 推 Phase 2 实施前 retro） |
| 前置 ADR | D-083 (direction) / D-085 (form mainline) / D-086 (portability s1) / D-087 (stack Next.js 15 + Vercel AI SDK + Vercel + SSR) / D-088 (Opus 4.7 + system+glossary cache) |

---

## 1. Context

Session 28 D-087 锁了 Phase 2 stack = Next.js 15 + Vercel AI SDK + Vercel SSR；Session 29 D-088 锁了 AI 模型 = Opus 4.7 单模型 + system+glossary ephemeral cache block。

v1.0.3 corpus（`itpassport-r6-v1.0.3` @ `8563c49`）是 Phase 2 唯一数据源 per D-083 §2.2（cert-extractor NOT modified；Phase 2 消费只读 output/）。 但**怎么把这个 corpus 接入 Next.js server-side runtime** 还未锁：

- 数据源选 FS-at-boot / Vercel Blob / Static import / Postgres / ... 中的哪个？
- Manifest 是直接复用 `index.json` 还是要扩展？
- Per-scope excerpt 装配（per D-085 §2.4 mode-dependent scope table）走什么协议？
- D-088 §2.3 cache 区块边界（system + glossary ~98.9K tokens 实测）和数据源接口怎么对接？
- α-now → β open 切换时数据源是否要切？

Session 30 Turn 2 β light PoC 实测（`evidence/phase2_d089_poc_2026-05-19/measurement.md`）确认：
- Whole-book 798K tokens FITS Opus 4.7 1M ctx at 79.9% ✅
- Cache block real = 98,910 tokens（system 500 + glossary 98,410）
- FS read 8.5ms warm / parse 16ms warm（Mac SSD baseline；Vercel cold start +50-200ms 仍 trivial）
- 7.2 MB total corpus on disk = 各 backend 都 viable scale

D-089 = 锁数据源 contract，使 Phase 2 实施可以起手。

---

## 2. Decision

### 2.1 数据源选型 = Interface abstraction with FS adapter default

**Lock**: 定义 `DataSource` TypeScript interface（仅 contract，无实现细节）；α-now 内置一个 `FsDataSource` adapter 作为默认 implementation；β-ready 通过实现 `BlobDataSource` / `KvDataSource` / `DbDataSource` 等 0 code rewrite 切换。

```typescript
// 锁的是 contract shape，不锁 method 签名细节（推 Phase 2 实施前 retro 定）
interface DataSource {
  loadIndex(): Promise<Index>;
  loadPage(pageId: number): Promise<Page>;
  loadChapter(chapterId: string): Promise<Page[]>;
  loadGlossary(): Promise<Glossary>;
  loadWholeBook(): Promise<Page[]>;
  // per-scope excerpt assembly fns build on top of above
}
```

α-now default = `FsDataSource`（读 `data/itpassport_r6/runs/<run_id>/output/` 本地文件系统，server boot 时 eager-load + in-memory Map）。

**Reasoning**：
- 符合 D-086 §2.4 portability strictness（s1 strict web stack 不限定具体 storage backend；interface 抽象 = β migration 0 code rewrite）
- 符合 D-083 §3 intent signal（α-now 简单 + β-ready 不阻塞）
- β PoC 实测 FS-at-boot 在 Vercel Node runtime 可行（即使冷启动也 <100ms total per measurement.md §4）
- Interface 抽象比硬绑 FS 多 1 个文件 (`adapters/fs.ts`)，engineering overhead 可忽略

### 2.2 Manifest schema = extend `index.json` v2

**Lock**: 在现有 `index.json` 基础上扩展为 v2 schema，**作为 Phase 2 实施时的一次性 backfill**（不动 cert-extractor，不重跑 Stage 7 export）。 新增字段：

```jsonc
{
  "schema_version": "v2",  // bumped from "v1"
  "cert_id": "itpassport_r6",
  "run_id": "dry_run_2026-05-12T13-23-19",
  "exported_at": "...",
  "totals": { "pages": 554, "entities": 2224, "leaves": 6059 },
  "stage6_summary": { /* unchanged */ },
  "pages": [ /* unchanged */ ],

  // ↓↓↓ v2 additions ↓↓↓
  "chapters": [
    { "chapter_id": "ch01", "title_jp": "...", "title_zh": "...", "title_en": "...", "first_page": 87, "last_page": 184 },
    ...
  ],
  "glossary_index": {
    "surface_jp_to_id": { "3Dプリンター": "g_009", ... },
    "id_to_surface": { "g_009": "3Dプリンター", ... }
  },
  "entity_by_id": {
    "page_087_entity_0": { "page": 87, "entity_index": 0, "type": "question" },
    ...
  }
}
```

**实施路径**（Session 31+，Phase 2 实施前）:
- 写一个 `scripts/build_index_v2.py`（继 D-084 v1.0.3 backfill pattern；non-invasive；reads existing output/ → emits `index.v2.json`）
- 旧 `index.json` 保留 immutable；v2 是独立 augmented file
- v1.0.3 GitHub Release 不动；v2 manifest 在 Phase 2 app 端 build-time / boot-time 生成

**Reasoning**：
- α-now Study/Quiz/Chat 三 mode 都需要章节边界 (Study chapter navigation)、glossary 反查 (term hover)、entity 反查 (Quiz 直跳)；现 index.json 不足
- Backfill 比 cert-extractor regenerate 更安全（D-083 §2.2 锁 cert-extractor NOT modified；Phase 1 已 v1.0.3 immutable）
- Schema v2 显式 bump 保留向后追溯（v1 仍可用 if Phase 2 fallback）

### 2.3 Per-scope excerpt assembly

**Lock**: 在 `DataSource` interface 之上定义 4 个 per-scope assembly fns，对应 D-085 §2.4 mode-dependent scope table。 每个 fn 是 thin wrapper，输入 = scope identifier，输出 = `{ contextBlock: string, tokenEstimate: number }`。

| Fn | Mode | Source | 预期 token |
|---|---|---|---|
| `assembleQuestion(pageId, entityIndex)` | Quiz Explain | 1 page JSON + 相关 glossary terms | ~500-3000 |
| `assembleChapter(chapterId)` | Study Chat | N page JSONs (chapter 范围) | ~50K-150K |
| `assembleWholeBook()` | Standalone Chat | All 554 page JSONs concat | ~800K |
| `assembleTermHover(surfaceJp)` | Study term tooltip | 1 glossary entry | ~80-200 |

**Cache 边界对接 D-088 §2.3**：
- `system_prompt + glossary` = cached block（98,910 tokens 实测；Anthropic ephemeral 5min TTL）
- `per-scope excerpt` = uncached per-call input（每个 mode 不同 scope）
- `user message + Chat history` = uncached per D-088 §2.3
- Implementation detail（如 cache_control 标记如何放）推 Phase 2 实施 per D-087 §2.5 Vercel AI SDK `providerOptions.anthropic.cacheControl`

### 2.4 α/β migration handoff

**Lock**: 
- α-now：`FsDataSource` + 本地 corpus path（`process.env.CORPUS_PATH` default `./data/itpassport_r6/runs/<run_id>/output`）+ build-time bundling corpus 进 Vercel deploy artifact
- β-ready：保留切换到 `BlobDataSource` 的 path；切换 trigger 同 D-088 §2.5(γ) tripwire = OQ-40 β open
- Interface contract 不变；adapter 一次实现，长期使用

**β 切换的 prerequisite**（写入 D-089 §3 out-of-scope，留给 OQ-40 close 时锁）:
- Vercel Blob 数据 upload pipeline（一次性 corpus push to Blob）
- `BlobDataSource` adapter impl（fetch + cache layer）
- Cache invalidation 策略（v1.0.3 → v1.0.4 corpus 升级时如何 hot-reload）

---

## 3. Out-of-scope (推 Session 31+ / Phase 2 实施 retro)

- Specific `DataSource` method 签名细节（async iterator vs Promise<Array>，stream vs eager）→ 实施前小 retro
- `assembleChapter` 内 glossary subset 选择规则（章节内 mentioned terms only / 全 glossary / 章节首+尾 mention）
- `assembleWholeBook` 是否需要 chunking（798K fits 1M ctx 直接全塞；若 Anthropic 改 ctx 上限再 reactivate RAG sub-ADR）
- v2 manifest backfill 脚本具体形态（`scripts/build_index_v2.py` 实施前细化）
- Cache invalidation on corpus update（v1.0.3 → v1.0.4 切换；与 D-088 §2.2 hybrid pin 联动）
- Vercel Blob upload pipeline + auth + per-corpus path 命名
- Server module 边界（哪些 fn 在 Server Component vs Route Handler vs Server Action）

---

## 4. Rejected alternatives

| 选项 | 理由 reject |
|---|---|
| Q5 (a) FS read at boot only | 无 interface 抽象 = β 切换需 code rewrite 违反 D-086 §2.4 portability + D-083 §3 intent |
| Q5 (b) FS + Static import dual | bundle size +2.48 MB；β migration 仍要 code rewrite；overkill α-now |
| Q5 (d) Hybrid FS + Blob from day 1 | engineering 复杂度 +20%；α-now 不需要 mutable corpus；YAGNI |
| Q6 (a) Reuse index.json as-is | 缺章节边界 + glossary 反查 + entity 反查；α-now Study/Quiz/Chat 三 mode 都会卡 |
| Q6 (c) Layer separate `manifest.json` | 双文件维护；v1 stale risk；Schema v2 bump 显式更清晰 |
| Vercel KV / Upstash Redis | β PoC 显示 FS+parse 16ms 已比 KV 网络 RTT 30-80ms 快；引入 cache layer 反而更慢 |
| Postgres / Supabase ingest | No JOIN/query 模式需求；overkill α-now；β 重做也比 KV 复杂 |
| RAG chunking + vector DB | Whole-book 798K FITS 1M ctx；vector DB 仅在 ctx 不够时 reactivate |

---

## 5. Consequences

### 5.1 Positive

- **α-now 实施简洁**：FsDataSource adapter + manifest v2 backfill 脚本 = Phase 2 起手即可
- **β 0 code rewrite**：interface 切 BlobDataSource 时 app layer 不动；符合 D-086 portability + D-083 intent
- **Manifest v2 backfill non-invasive**：cert-extractor 不动 per D-083 §2.2；v1.0.3 GitHub Release immutable
- **Cache 区块边界与 D-088 §2.3 自然对齐**：assembleX fns 返回 uncached excerpt + DataSource.loadGlossary() 走 cached block
- **Per-scope assembly 与 D-085 §2.4 mode-dependent scope 一一对应**：4 mode = 4 fn，无 over-engineering
- **Schema v2 显式 bump** = 长期 traceability；v1 不被破坏

### 5.2 Risks（+ mitigations）

| Risk | Severity | Mitigation |
|---|---|---|
| `FsDataSource` 在 Vercel serverless 冷启动慢（cold start +50-200ms + parse 16ms × 554 pages = 不可控） | Medium | β PoC 实测 trivially fast in local；Phase 2 实施前 retro 在 Vercel preview 实测 cold start latency；若 >500ms 需 lazy load + per-page LRU |
| Manifest v2 backfill 脚本 bug → α-now mode breakage | Low | TDD per Phase 1 pattern；unit tests cover chapter mapping + glossary_index + entity_by_id；v1 fallback if v2 build fails |
| Interface contract 后续修改 break adapter | Medium | g2 mid level 不锁 method 签名；实施前 retro 锁 signature；后续 amendment via D-080 v1.1 §8 |
| Whole-book 加载 798K tokens × Opus 4.7 uncached input = $12 单 call | High | D-090 per-query hard cap $5 阻挡；whole-book Chat 必须走 cache block；若 cache miss 触发自动降级（Phase 2 实施前 retro 设计） |
| v1.0.3 → v1.0.4 corpus 升级时 manifest v2 同步 | Medium | β 之前不会 corpus 升级（α-now 锁 v1.0.3 immutable）；β 切换时与 OQ-40 同期决定 |
| Static-import 路径完全不留 → 万一 Vercel FS access 不可靠 | Low | `DataSource` interface 抽象 = 临时切 Static adapter 仍 0 code rewrite |

### 5.3 Phase 2 RETRO 升级触发条件（per D-080 v1.1 §8 amendment pattern）

D-089 v1.1+ amendment 触发：
- (α) Vercel runtime 改变 FS access 模型（serverless edge 不支持 fs.readFile）
- (β) Whole-book Chat 实测 cache miss 频率 >20% 导致 cost spike
- (γ) Corpus 形态升级（v1.0.4+ schema change）
- (δ) OQ-40 β open + Blob adapter 实施 → D-089 §2.4 拆 sub-ADR D-093+

---

## 6. References

- `docs/decisions/D-083-phase2-direction.md` §2.5 sub-ADR carrier + §3 intent
- `docs/decisions/D-085-phase2-form-mainline.md` §2.4 mode-dependent scope table
- `docs/decisions/D-086-phase2-portability-strictness.md` §2.4 portability criteria → interface abstraction 标准
- `docs/decisions/D-087-phase2-stack.md` §2.4 SSR / §2.5 Vercel AI SDK
- `docs/decisions/D-088-phase2-ai-model.md` §2.3 cache 区块边界 / §5.2 cost spike risk
- `evidence/phase2_d089_poc_2026-05-19/measurement.md` — β light PoC corpus 实测
- `evidence/phase2_d089_poc_2026-05-19/measure_corpus.py` — re-runnable script
- `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/output/index.json` — current v1 manifest baseline
- D-084 v1.0.3 backfill pattern（non-invasive script precedent）

---

## 7. Sign-off

| 角色 | 状态 | 日期 |
|---|---|---|
| Writer (main session) | LOCKED final | 2026-05-19 |
| Reviewer #1 (user) | **APPROVED (path α)** | 2026-05-19 |
| Reviewer #2 (Rule D distinct agent) | n/a — design ADR，无 code 产物 user 可 path α terminal sign-off | — |

LOCKED final — Session 30 Turn 4 user terminal sign-off path α 2026-05-19.
