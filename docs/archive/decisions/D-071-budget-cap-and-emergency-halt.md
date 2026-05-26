# D-071 — Phase 1 Budget Cap & Emergency Halt Policy

| 字段 | 值 |
|---|---|
| **Status** | Locked (Session 06, 2026-05-06) |
| **Decision Maker** | Claude (per "你来定" 委托, D-019; user framing "严格但不死板，前提是做出来") |
| **Source** | `docs/discussion/2026-05-06-session-06.md` §4.3 |
| **Related** | 规则 C (retro), D-008 (pipeline), D-063 (audit FAIL), D-069 (Anthropic), D-072 (cost), D-073 (Phase 1 启动) |

---

## 1. Context

Phase 1 实施时 LLM API 调用需防失控:

- prompt bug 致单 page 反复重试
- reviewer 死循环
- 抽检 FAIL 全 stage 重跑（撞 D-063 max 3 次仍触发更上层失控）
- max 20 plan quota 撞了卡 5h 不算钱但卡死 pipeline

User framing "严格但不死板，前提是做出来" 要求:

- 设质量底线（严格）
- 留 user 介入 hatch（不死板）
- 防死循环（做出来）

---

## 2. Decision

### 2.1 软硬 cap 阈值（默认值，YAML 可调）

| 维度 | 软 cap (WARN → 等人决) | 硬 cap (FAIL → halt) |
|---|---|---|
| Wall-time | 2h (7200s) | 8h (28800s) |
| 累计 Mistral USD | $5 | $20 |
| 累计 Anthropic USD (仅 API key 路径) | $5 | $30 |
| 累计 fail 次数 (任意 stage) | 10 | 30 |

每 stage 完成后 BudgetMonitor 跑一次轻量检查：任一维度超软 cap → WARN，任一维度超硬 cap → FAIL halt。

### 2.2 触发动作

**软 cap (WARN)**:

1. log warning + 写 `failures/<cert_id>/runs/<run_id>/SOFT_CAP_WARN.md`
2. **暂停 pipeline，等 user 决定**（继续 / 调阈值 / abort）
3. User 决定:
   - "继续" → 阈值不变 + 跳过本次 WARN（重新触发会再 warn）
   - "调阈值" → 改 pipeline YAML override + 重启
   - "abort" → 写 RETROSPECTIVE.md (per 规则 C) + halt

**硬 cap (FAIL halt)**:

1. log error + 写 `failures/<cert_id>/runs/<run_id>/EMERGENCY_HALT.md`
2. **自动 halt pipeline**
3. 触发规则 C mini-retro（强制写 `RETROSPECTIVE_required.md`）
4. User 必须介入分析根因 + 修代码 / 调阈值 / abort

### 2.3 阈值层级关系

| 层级 | 决策 D | 触发位置 |
|---|---|---|
| Sample 级 | (无独立 D) | 单 sample reviewer 判 PASS/FAIL |
| Stage 级 audit | D-063 | stage 完成后 audit verdict (PASS/WARN/FAIL) |
| Stage 级 retry | D-063 | stage 重跑 max 3 次 |
| **Run 级 budget** | **D-071 (本)** | 每 stage 完成后 BudgetMonitor.check() |

D-071 与 D-063 是层级互补关系: D-063 stage 内质量, D-071 run 总预算。

### 2.4 与规则 C retro 对接

| 触发 | retro 形式 |
|---|---|
| 软 cap user "abort" | 写 RETROSPECTIVE.md |
| 硬 cap auto halt | 写 RETROSPECTIVE_required.md |

两者都触发规则 C mini-retro，确保失败有 paper trail。

### 2.5 Override 机制

```yaml
# pipelines/itpassport-r6.yaml
budget:
  caps:
    soft:
      wall_time_seconds: 7200       # 2h
      mistral_usd: 5.0
      anthropic_usd: 5.0
      fail_count: 10
    hard:
      wall_time_seconds: 28800      # 8h
      mistral_usd: 20.0
      anthropic_usd: 30.0
      fail_count: 30
```

User 可任意调，但**硬 cap 不可超过软 cap × 10**（防 user 误关导致失控）。

> **Revision note (v1.0 → v1.1, 2026-05-06)**: 原约定为 ×5，但发现默认 `anthropic_usd: soft=$5 / hard=$30` 比例为 6 (`$30 hard` 是为 D-069 max plan → API key 升级路径预留的合理余量)。Phase 1 实施期 (Step 4) pytest 验证时与默认值冲突触发 ValueError。修订为 ×10 既保留 anti-mistake 兜底（user 调到 soft × 11 仍被拦），又让默认值通过。其余三维度 (wall-time/mistral/fail) 默认比例分别 4/4/3，原本就在 ×10 内。

---

## 3. Rationale

### 3.1 为何软硬两档

User "严格但不死板":

- 单档 = 死板（一触发就 halt 或一直让过）
- 三档 (PASS/WARN/FAIL) = D-063 风格 = "严格的中间地带"

软 cap = "严" 的 hatch（让 user 介入），硬 cap = "底线" 的兜底（防失控）。

### 3.2 为何 wall-time + cost + fail count 多维

任一维失控都该停:

- wall-time 失控 = quota 撞了 / pipeline 卡死
- cost 失控 = LLM 调用爆量
- fail 失控 = systemic bug

任一软 cap 触发 = 警告 user + 等决定。

### 3.3 阈值数值依据

| 阈值 | 依据 |
|---|---|
| Wall-time 2h soft / 8h hard | max 20 plan 5h quota window；2h 给 quota 一半 buffer，8h 跨 quota window 不可行 |
| Cost $5 soft / $20 hard | 全本预估 ~$0.50 → 10x 早期警告，40x 彻底失控 |
| Fail 10 soft / 30 hard | D-063 max 3 retries × 5 stages ≈ 15 fail 重试上限；10 软警告 systemic bug；30 硬熔断 |

### 3.4 与 D-063 风格一致

D-063 stage 级三档 (PASS≥90% / WARN 80-90% / FAIL <80%)，user "严格但不死板" 偏好已在那里 calibrate 过。本 D 沿用三档结构。

---

## 4. Alternatives Considered

### 4.1 (A) 单 cap (USD)

**拒因**: 不抓 wall-time → max plan quota 撞了卡 5h 不算钱但卡死 pipeline。

### 4.2 (B) 多 cap 单档

**拒因**: 缺 "WARN 等人决" 灰色区间，违反 "不死板"。

---

## 5. Consequences

### 5.1 正面

- Phase 1 失控有 hard ceiling (8h / $20 / 30 fails)
- User 在软 cap 时仍有控制权（不死板）
- 与 D-063 风格一致，认知负担低
- 与规则 C retro 自动对接

### 5.2 负面 / 接受的代价

- 阈值需 calibrate（Phase 1 第一次跑后可能调）
- 软 cap 半自动 = user 不在线时 stuck（接受 — design goal）
- 硬 cap 上限不可超软 × 5 限制 user 自由度（接受 — 防误关）

---

## 6. Implementation Notes

```python
# packages/extractor/src/cert_extractor/budget/monitor.py
from dataclasses import dataclass
from enum import Enum


class Verdict(str, Enum):
    PASS = "PASS"
    WARN = "WARN"
    FAIL = "FAIL"


@dataclass
class CapLevels:
    wall_time_seconds: float
    mistral_usd: float
    anthropic_usd: float
    fail_count: int


DEFAULT_SOFT = CapLevels(7200, 5.0, 5.0, 10)
DEFAULT_HARD = CapLevels(28800, 20.0, 30.0, 30)


class BudgetMonitor:
    def __init__(
        self,
        soft: CapLevels = DEFAULT_SOFT,
        hard: CapLevels = DEFAULT_HARD,
    ):
        # 强制 hard <= soft × 5 (防误关)
        for f in ("wall_time_seconds", "mistral_usd", "anthropic_usd", "fail_count"):
            if getattr(hard, f) > getattr(soft, f) * 5:
                raise ValueError(f"hard.{f} cannot exceed soft.{f} * 5")
        self.soft = soft
        self.hard = hard

    def check(self, current: dict) -> Verdict:
        """Per D-063 风格三档判定."""
        # 硬 cap 任一触发 → FAIL halt
        for f in ("wall_time_seconds", "mistral_usd", "anthropic_usd", "fail_count"):
            if current.get(f, 0) >= getattr(self.hard, f):
                return Verdict.FAIL
        # 软 cap 任一触发 → WARN 等人决
        for f in ("wall_time_seconds", "mistral_usd", "anthropic_usd", "fail_count"):
            if current.get(f, 0) >= getattr(self.soft, f):
                return Verdict.WARN
        return Verdict.PASS
```

---

## 7. Related Decisions

| D / 规则 | 关系 |
|---|---|
| **规则 C** retro | 软 cap abort + 硬 cap auto halt 都触发 retro |
| **D-008** pipeline | 每 stage 完成后跑 BudgetMonitor.check() |
| **D-063** audit FAIL | 阈值风格延伸；D-063 stage 级 / D-071 run 级 |
| **D-069** Anthropic | Agent SDK `max_budget_usd` 与硬 cap `anthropic_usd` 对接 |
| **D-072** cost tracking | BudgetMonitor reads cost.json |
| **D-073** Phase 1 启动 | dry-run + 全本都过 BudgetMonitor |

---

## 8. Revision History

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-06 | 1.0 | Initial — Session 06 §4.3 锁定 |
| 2026-05-06 | 1.1 | Phase 1 Step 4 实施期 calibration: anti-mistake clamp ×5 → ×10（解决与默认 anthropic 6x 的内部不一致；详见 §2.4 revision note）|

---

> 本 ADR 关联的活页讨论: `docs/discussion/2026-05-06-session-06.md` §4.3 + §4.6 + §6.2。
