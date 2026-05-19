# D-089 β Light PoC — v1.0.3 Corpus Measurement

> **PoC tier**: β light（measurement only，$0 LLM）。
> **Date**: 2026-05-19 Session 30 Turn 2.
> **Script**: `measure_corpus.py`（committed，re-runnable）。
> **Output**: `measurement.json`（raw）+ this file（summary）。
> **Tokenizer**: tiktoken `cl100k_base`（GPT-4 BPE，作为 Anthropic 代理；预期 ±10-15% 偏差，Phase 2 实施时用 `anthropic.count_tokens()` 校准）。
> **Hardware**: Mac SSD, Python 3.9.6。Vercel serverless 数字会有差异（cold start ~50-200ms），但本地数据级别在数十毫秒内 = 各 backend 都可行。

---

## 1. Corpus footprint

`data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/output/` 共 **7.2 MB on disk**，554 pages + 4 root files。

| File | Bytes | Chars | Tokens (cl100k) |
|---|---:|---:|---:|
| `index.json` | 114,123 | 113,917 | 21,420 |
| `glossary.json` | 317,921 | 308,099 | 98,410 |
| `polish_items.json` | 113,584 | 113,346 | 22,938 |
| `README.md` | 690 | 651 | 217 |
| **Pages JSON (×554)** total | 2,602,627 | — | **798,534** |
| **Pages MD (×554)** total | 1,564,693 | — | **491,154** |

**Per-page distribution**（JSON）:
- min: 114 tokens
- median: 1,158 tokens
- mean: 1,441 tokens
- max: 9,436 tokens
- stdev: 1,264

**Per-page distribution**（MD）:
- min: 71 tokens
- median: 629 tokens
- mean: 886 tokens
- max: 4,267 tokens
- stdev: 801

> JSON 比 MD 大 ~60%（因为结构化 wrapper、key 名、trilingual 嵌套）。
> 若需要"塞 LLM"的全本路径，**MD 比 JSON 节省 38% tokens**，但失去结构化字段（kana_helper、entity boundary 等 D-012 信号丢失）。

---

## 2. Per-scope token estimates（for D-089 §per-scope excerpt assembly + D-088 cache 区块边界）

| Scope | Source | Tokens (cl100k) | Pct of 1M ctx |
|---|---|---:|---:|
| **Whole-book JSON** | concat 554 pages | **798,534** | **79.9%** |
| Whole-book MD | concat 554 pages | 491,154 | 49.1% |
| Chapter sample (p087-p184，98 pages) | concat | 146,062 | 14.6% |
| **Glossary** | `glossary.json` 908 entries | **98,410** | 9.8% |
| **Index** | `index.json` 554 page metas | 21,420 | 2.1% |
| Single page sample (p087) | JSON | 3,017 (9.88 KB) | 0.3% |
| Single entity sample (p087 entity[0], `question`) | entity-level slice | 501 | — |
| Single glossary term sample | one entry | 78 | — |

**Key check**：**Whole-book JSON 798K tokens FITS 1M ctx**（Sonnet 4.6 / Opus 4.7 / Haiku 4.5 lacks）。 与 Session 28 β PoC 估计 0.84M tokens 一致（差 5%，在 token approximation 误差内）。

**Cache block size** (D-088 §2.3 = system + glossary):
- System prompt estimate: 500 tokens
- Glossary: 98,410 tokens
- **Total cache block: 98,910 tokens**（vs D-088 §2.3 估计 ~90.5K，real measurement +9%）

---

## 3. D-088 cache cost projection（updated with real corpus measurement）

Anthropic Opus 4.7 pricing（per `cost_table.md`）:
- Input: $15/M
- Cache write: $18.75/M (1.25× input)
- Cache read: $1.50/M (0.1× input)

**Per-call cost for D-088 §2.3 cache block (98,910 tokens)**:

| Mode | Input cost | Notes |
|---|---:|---|
| Uncached（每次发送全 cache block） | **$1.484** | 不可接受 baseline |
| Cache write（首次/TTL 过期后） | **$1.855** | session 首 call 一次 |
| Cache read（后续 5min 内 calls） | **$0.148** | **80-95% expected hit rate per D-088 §2.3** |

**Daily mix** (D-088 §2.3 + cost_table.md §3 baseline，校正后)：

α-now single user single-shot 路径（max-plan OAuth $0 effective billed）:
- Q+T+Chat 共 80 calls/day
- 1 cache write @ $1.855 + 79 cache read @ $0.148 = **$13.55/day shadow** (Opus everywhere)
- vs cost_table.md §3 估计 $7.92/day（旧基于 ~90K cache block）= 校正后 **+71% 偏高**

**对 D-090 cap 的影响**：cost_table.md §3 三档 cap candidates ($3 / $10 / $30) 需要**校正**:
- Soft cap $3/day → 已被 cache write 一发吃掉一半 → 偏紧
- Mid cap $10/day → 约 65 calls cached → 偏紧
- Hard cap $30/day → 约 195 calls cached → 合理 ceiling
- **建议 D-090 候选**：soft **$5** / mid **$15** / hard **$30** + per-query hard cap **$5**（whole-book Opus uncached call = $12.7 + output → blocked）

> **重要 caveat**：α-now max-plan OAuth = $0 real billed，shadow 数字只是 visibility tool（per memory `project_max_plan_billing.md`）。 但 β open 切真 API key 时，每天 80-200 calls × Opus 4.7 = $13.55-$30 真金；D-090 必须 land before OQ-40 β open per D-088 §5.2。

---

## 4. FS + parse latency（Mac SSD local，warm-cache mean over 3 iterations）

| Operation | n files | First (cold-ish) | Warm mean |
|---|---:|---:|---:|
| FS read whole-book JSON | 554 | 9.3 ms | **8.5 ms** |
| FS read whole-book MD | 554 | — | similar ~8-10 ms |
| FS read root JSONs (4) | 4 | <1 ms | <1 ms |
| FS read chapter (p087-p184) | 98 | ~2 ms | ~1.5 ms |
| JSON parse whole-book | 554 | 16.6 ms | **16.0 ms** |
| JSON parse glossary | 1 | <1 ms | <1 ms |
| JSON parse index | 1 | <1 ms | <1 ms |

**Implications for D-089 数据源 选型**:

| Backend | α-now suitability | β suitability | Notes |
|---|---|---|---|
| **(i) FS read at boot** | ✅ Excellent | ⚠️ Per-instance memory (×N instances) | Vercel Node runtime supports; ~16ms parse on cold instance start = trivial |
| **(ii) Vercel Blob** | ⚠️ Overkill | ✅ Good for mutable corpus | Adds network round-trip ~50-200ms per fetch；no mutation need α-now |
| **(iii) Vercel KV/Upstash** | ❌ Overkill | ⚠️ Cache layer only | FS+parse 已 16ms；KV 网络 ~30-80ms RTT 反而更慢 |
| **(iv) Postgres/Supabase** | ❌ Overkill | ⚠️ Only if query patterns | No JOIN/index need α-now |
| **(v) Static import bundled** | ✅ Possible | ⚠️ Bundle size +2.48 MB | Next.js 15 will tree-shake unused pages → bundle bloat manageable |
| **(vi) Hybrid (FS + Static)** | ⚠️ Premature | ✅ For per-scope optimization | β consideration |

**推荐 (D-089 §2 候选)**：
- **α-now**: (i) **FS read at boot** + 内存 cache（554 page JSONs parsed once into Map）
- **β-ready**: (i)→(ii) 迁移 path 通过 `dataSource` interface 抽象，0 code rewrite 切换

---

## 5. Per-scope excerpt assembly characteristics（informs D-089 §per-scope）

D-085 §2.4 mode-dependent scope table:

| Mode | Scope | Tokens (avg) | Source files needed |
|---|---|---:|---|
| Study | chapter | varies | index.json + N page JSONs |
| Quiz | current question | ~2,400 / page or ~500 / entity | 1 page JSON |
| Chat (standalone) | whole-book | 798K | all 554 page JSONs |
| Term hover | single term | ~150 | glossary.json subset |

**Manifest schema candidate**（reuse existing `index.json`）:
```json
{
  "schema_version": "v1",
  "cert_id": "itpassport_r6",
  "run_id": "dry_run_2026-05-12T13-23-19",
  "exported_at": "...",
  "totals": { "pages": 554, "entities": 2224, "leaves": 6059 },
  "pages": [
    {
      "page": 7,
      "json": "pages/page_007.json",
      "md": "pages/page_007.md",
      "entity_count": 0,
      "leaf_count": 0,
      "verdict": "PASS",
      "polish_items_count": 0
    },
    ...
  ]
}
```

**已经存在的 manifest 满足 α-now 大部分需求**。 D-089 mid-level 可能需要补充：
- `chapter` 字段（页 → 章节映射；现 index.json 无）
- `entity_by_id` 反向查找（page+entity_id → location）
- `glossary_index`（surface → glossary entry id）

---

## 6. Calibration caveats

1. **tiktoken vs Anthropic tokens**: cl100k_base 是 GPT-4 BPE，Anthropic 用类似但不同的 BPE。 实际 Anthropic count_tokens 可能 ±10-15%。 关键判定 "whole-book fits 1M ctx" 仍稳健（798K vs 920K worst-case 仍 fit）。
2. **FS latency 是 Mac SSD 本地数字**。 Vercel Node runtime serverless instance:
   - Cold start: ~50-200 ms（VM 启动 + Node init）
   - Warm: in-process FS read 应仍 <50 ms（Vercel uses local filesystem in container）
   - 实际 β PoC 推 Phase 2 实施前 retro 测；α-now FS 路径足够
3. **Cache hit rate**: D-088 §2.3 估计 80-95%，未测真。 Phase 2 实施前需 `run_poc.ts` 跑实测（继承 Session 29 PoC plan L8）。

---

## 7. Conclusion → D-089 + D-090 input

**Confirmed for D-089**:
- ✅ Whole-book JSON 798K tokens FITS 1M ctx（Sonnet/Opus）
- ✅ Cache block 98.9K tokens（system + glossary）合理；fits Anthropic cache 限制
- ✅ FS-at-boot 数据源 viable（parse 16ms cold, 8ms warm 本地；Vercel 应 <100ms total）
- ✅ Existing `index.json` 已是合理 manifest baseline，可能需小补
- ❌ KV/Postgres/Blob = 在 α-now scale 下 overkill；β 迁移可走 interface 抽象
- 候选数据源 short-list：(i) FS-at-boot（主推）/ (v) Static import bundled / (vi) Hybrid β-ready

**Updated input for D-090**:
- 实测 cache block 98.9K tokens（vs D-088 §2.3 估计 ~90K）→ shadow cost +9%
- 真 daily mix shadow ≈ **$13.55/day Opus everywhere cached**（vs cost_table.md §3 估计 $7.92）
- 校正后建议 cap 三档: **soft $5 / mid $15 / hard $30** + per-query cap $5
- α-now max-plan OAuth = $0 real billed；shadow only visibility tool
- β-ready 切真 API key 时 cap MUST 已 in place per D-088 §5.2 High risk

**Items for Phase 2 实施 deferred**:
- Anthropic count_tokens 校准（D-088 §2.3 cache write 真实 token 数）
- Cache hit rate 实测（H3 from D-088 PoC, deferred to Phase 2 via run_poc.ts）
- Vercel cold-start latency 实测（runtime profile，pre-β）
