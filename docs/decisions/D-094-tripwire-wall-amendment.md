# D-094 — γ tripwire 3rd data point cascade: Module A wall actuals + Module B-D estimate hold

| 字段 | 值 |
|---|---|
| 状态 | **LOCKED final** — Session 35 Turn 1 user terminal sign-off path α 2026-05-19 (`全部按照你推荐的来` blanket ACK on 4Q recommend chain `c/c/b/a`) |
| 锁定 session | `docs/discussion/2026-05-19-session-35.md` Turn 1 (4Q recommend + blanket ACK) + Turn 2 (D-094 write + PLAN.md amend + STATE.md sync) |
| 类型 | sub-amendment of D-091 §2.5(γ) cascade — minor in-place amend per D-091 §2.5 cascade pattern + D-080 v1.1 §8 style |
| 颗粒度 | g1 narrow — 锁 wall 列 actual annotation 写法 + Module B-D estimate hold；不动 D-091 §2.5(γ) threshold；不动 PLAN §1 Module B-D wall estimate |
| 前置 ADR | D-091（§2.3 15 step / 3 week ground truth + §2.5(γ) 30% drift threshold + cascade）/ D-088（Opus 4.7 + cache 设计）/ D-090（cost cap） |
| Supersede? | 否；**amend** D-091 §2.3 wall column annotation 措辞（minor 数值 amend in-place + log，per D-091 §2.5 explicit pattern） |

---

## 1. Context

D-091 §2.5(γ) tripwire 条件：

> **(γ)** Step 数 / wall time 偏差 > 30%：§2.3 lock 15 step / 3 week；若实测 > 20 step / > 4 week → §2.2 Tier 不变（Tier 3 已 cover），但 §2.3 estimate amend + 触发 Phase 2 mid-implementation retro

**Module A (Step 1-3) 实测 wall vs PLAN estimate**:

| Step | PLAN estimate | Actual wall | Drift |
|---|---|---|---|
| 1 | 1 day | ~25 min | **−98%** |
| 2 | 2 day | ~30 min | **−98%** |
| 3 | 1.5 day | ~30 min | **−98%** |

**累计 3 consecutive data point > 30% drift** → §2.5(γ) trigger 触达 → 进 review session（本场 Session 35 Turn 1）。

**Drift 根因分析**（pre-lock 讨论 implicit in Q1 recommend chain）:

1. **Module A 性质**: 纯 local TS + 已熟悉栈 (Next.js 15 / TS strict / vitest / pnpm)；无 LLM；无网络；无 async non-determinism；无 cache verification；无 UI a11y
2. **Phase 1 实施经验 carry-over**: Phase 1 已踩过 Tier 3 evidence ceremony 节奏（Sessions 14-22）；Phase 2 evidence dump 走熟，无 overhead 学习成本
3. **Step granularity**: Module A 三 step 各自单纯 scaffold（next-app / DataSource / assembly + boot），无 cross-step coupling，无 design ambiguity
4. **Module B-D 性质** **不同**:
   - Module B (Step 4-8): 首次真 LLM call + Vercel AI SDK 集成 + cache 验证 + 3 mode wiring + retry middleware (D-088 §2.4) → 涉及 network / async / 第三方 provider 行为 / cache hit retro 实测 / token usage delta 检验 → 不可预知性质质上不同于 Module A
   - Module C (Step 9-12): Chat / Quiz / Hover UI + i18n 三语 + a11y → DOM / accessibility / 三语 string library 设计 / streaming UI 表现 → UI iteration cycle 多
   - Module D (Step 13-15): cap implementation + Lighthouse audit + E2E Playwright + 生产 deploy → 性能调优 / 浏览器自动化 / DNS 配置等

**因此**: 用 Module A 实测推 Module B-D 是 sample selection bias；§2.5(γ) 触发 review 的正确处理 = **承认 Module A 实测 + 不向 B-D 外推 + 等 B-D 实测出再 mid-implementation retro 校正**（per PLAN.md §3 Step 5 + Step 12 mid-retro 节点）。

---

## 2. Decision

### 2.1 PLAN.md §1 Module A wall column — 标 actual + estimate parallel 形式

**Lock**: PLAN.md §1 Module A 三 row 的 `Wall` 列措辞统一为 **`actual <N> min (vs estimate <M> day → −X%)`**；Module A 三 row 已实测 closing，actual 值 final 不再变。

**形式**（Step 1 示例）:

| Step | ... | Wall |
|---|---|---|
| **1** ✅ DONE 2026-05-19 | ... | **actual ~25 min** (vs estimate 1 day → −98%) |

Module A 三 row 全按此格式 amend；既保留原 estimate 历史性，又记 actual 实测，便于后续 retro。

### 2.2 PLAN.md §1 Module B-D wall column — estimate 不动

**Lock**: PLAN.md §1 Module B (Step 4-8) / Module C (Step 9-12) / Module D (Step 13-15) 三模块共 12 step 的 `Wall` 列 estimate 全数不动，等到 Module B 至少 2 step 实测 closing（≥ Step 5 完）后由 mid-implementation retro 校正。

**理由**:
- §1 Context 4 点（Module B-D 性质质上不同于 Module A）
- 用 Module A 三 data point 外推到 12 step 是 sample selection bias
- PLAN.md §3 已明文 `Step 5 完成后` + `Step 12 完成后` 为 mid-implementation retro 节点；§3 节奏不动

### 2.3 D-091 §2.5(γ) 30% drift threshold — 不 amend

**Lock**: D-091 §2.5(γ) 的 30% drift 阈值 + `> 20 step / > 4 week` 总量 cap 数值不动。

**理由**:
- §2.5(γ) trigger 本场已正确 fire（accumulate 3 consecutive data point → review session）；threshold 工作如设计，无 amend 必要
- 若把阈值放宽（如改 50%）= 把 sample bias 错误地烧进 ADR；本场 review 已展示 30% threshold 让我们 caught Module A early，正面信号
- 若把阈值收紧 = noise 风险，无证据支持

### 2.4 Defer Module B-D wall estimate amend 到 Step 5 mid-retro

**Lock**: Module B-D wall 列 估算的 amend 决定推 PLAN.md §3 既约的 **Step 5 完成后 mid-implementation retro**。

**触发**: Step 5 完 (`/api/chat` streaming + cache hit retro data point #1 落地) → 此时既有 Module A 3 data point + Module B 2 data point (Step 4 + Step 5) → 5 point 跨两性质模块 → 可以做最小有效校正。

**程序**:
- 若 Module B 实测 wall 与 estimate 平均 drift > 30% → 触 D-091 §2.5(γ) 再次 review → 走 D-094 v1.1 minor amend in-place（per D-080 v1.1 §8 pattern）
- 若 Module B 实测 与 estimate 平均 drift ≤ 30% → 保留 estimate，写 retro note 即可
- Module C 同样处理（Step 12 完后）

### 2.5 §2.5(γ) cascade event log（per D-091 §2.5 explicit pattern）

**记录到 evidence/phase2/tripwire_log.md**（本 D-094 lock 同 turn 起 file）:

| Date | Trigger | Data points | Resolution |
|---|---|---|---|
| 2026-05-19 | γ (Step 数 / wall > 30% drift) | Step 1 −98% / Step 2 −98% / Step 3 −98% (3 consecutive) | D-094 LOCKED — Module A wall annotation; Module B-D estimate hold; threshold unchanged; defer B-D amend to Step 5 mid-retro |

---

## 3. Rejected alternatives

### (a) 只把 Step 4-15 wall 列等比缩 50% — REJECTED

**Why rejected**: 缩 50% 是 ad-hoc 数学操作，无 Module B-D 实测支持；同 §1 Context 4 点指出的 sample selection bias；若实施后 Module B 因 LLM iteration 反而 > original estimate，反而需要 estimate 二次上调 → unnecessary churn。

### (b) Amend D-091 §2.5(γ) threshold (30% → 50% or per-module differentiation) + 全 12 step wall re-estimate — REJECTED

**Why rejected**: 改 threshold 把 sample bias 错误地烧进 ADR (§2.3 已论)；per-module differentiation 把 §2.5(γ) 复杂化无证据收益；全 12 step re-estimate 同 (a) 的 sample bias 问题；threshold 已本场正确 fire 是正面信号。

### (d) 推迟 D-094 lock 到 Step 5 mid-implementation retro — REJECTED

**Why rejected**: Module A 三 row 的 actual wall 已是事实，不记录就是丢数据 (Rule B 精神：失败 archive 不删；正面数据也是同理)；§2.5(γ) trigger 已 fire，不 lock = 留 trigger 状态悬空（不利于 audit traceability）；本 D-094 实际工作量约 15 min，无推迟收益。

---

## 4. Implications

### 4.1 PLAN.md §1 Module A 三 row amend (same turn as this D)

| Step | Wall 列 新文 |
|---|---|
| 1 ✅ DONE | **actual ~25 min** (vs estimate 1 day → −98%) |
| 2 ✅ DONE | **actual ~30 min** (vs estimate 2 day → −98%) |
| 3 ✅ DONE | **actual ~30 min** (vs estimate 1.5 day → −98%) |

### 4.2 PLAN.md §1 Module B-D 12 row — 不动

### 4.3 STATE.md sync (same turn)

- `最后更新` row → Session 35 entry
- `已锁定决定数` row 93 → **94**
- `下一会话` row → 重新组织为 Session 35 已开 + 本场 in-progress

### 4.4 evidence/phase2/tripwire_log.md (new file, this turn)

记 §2.5 cascade event log table，未来其他 trigger fire 时 append。

### 4.5 Future tripwire fire 模式

- 任何 future trigger fire（α/β/γ/δ/ε）→ append `tripwire_log.md` row + 若需 → sub-ADR amend in-place（D-091 §2.5 explicit pattern）
- D-094 本身可后续 amend in-place（v1.1 / v1.2…）按 D-080 v1.1 §8 模式，不立新 D-NNN supersede chain
- Module B mid-retro 触发的修订全数走 D-094 minor amend，除非 scope 跨入新 design 维度（如 step 数本身要 split / merge）才另起 D-NNN

---

## 5. Out of scope（推 后续 retro / Phase 3 backlog）

- Module B-D 具体 wall 数 — 待 mid-retro
- §2.5 其他 trigger (α / β / δ / ε) 的 wall estimate 影响 — 各自独立 cascade
- Phase 2 total wall (~3 week) 总量 cap 调整 — 暂不动，等 Module B 实测收据
- Step granularity (Module A 是否 over-granular / 是否应 merge) — 同 mid-retro
- Module B-D step granularity — 同上

---

## 6. Audit / Trace

- **Trigger**: D-091 §2.5(γ) accumulate fire
- **3 data point cumulative trace**:
  - Step 1: `docs/discussion/2026-05-19-session-32.md` §close + `evidence/phase2/step_01_scaffold/step_01_audit.md` §Wall actual
  - Step 2: `docs/discussion/2026-05-19-session-33.md` §close + `evidence/phase2/step_02_datasource/step_02_audit.md` §Wall actual
  - Step 3: `docs/discussion/2026-05-19-session-34.md` §close + `evidence/phase2/step_03_assembly/step_03_audit.md` §Wall actual
- **Recommend chain**: Session 35 Turn 1 4Q `c/c/b/a` user blanket ACK `全部按照你推荐的来` 2026-05-19
- **Lock turn**: Session 35 Turn 2 (本 ADR write + PLAN.md §1 Module A amend + STATE.md sync + tripwire_log.md create)
- **Cascade event**: `evidence/phase2/tripwire_log.md` row #1 (γ 3-point fire / resolved by D-094)

---

**END D-094 v1.0 — 2026-05-19 LOCKED**
