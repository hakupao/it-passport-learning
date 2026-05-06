# D-063 — Audit Failure Handling Policy

| 字段 | 值 |
|---|---|
| **Status** | Locked (Session 04, 2026-05-06) |
| **Decision Maker** | Claude (per "你来定" 委托, D-019 protocol; user framing: **"严格但不死板，前提是做出来"**) |
| **Source** | `docs/discussion/2026-05-06-session-04.md` §4.5 |
| **Related** | 规则 A (抽检), 规则 B (失败归档), 规则 C (retro), 规则 D (writer/reviewer 分离), D-008, D-056, D-058, D-059, D-061, D-062 |

---

## 1. Context

规则 A 要求 ">50% 改写 → N 样本独立抽检 → evidence"，但**抽检 FAIL 时怎么办**没定。

User Q26 委托 Claude 决定，明确 framing:

> "尽量严格，但不能完全把规则定死，我希望可以按照高标准做成整个项目，因为前提是做出来，如果因为标准太高做不出来就尴尬了"

按这个 framing，需要：

- 严格 → 设质量阈值
- 不死板 → 留 escape hatch + 重跑上限
- 做得出来 → 防死循环
- 安全兜底 → 安全字段不可妥协

---

## 2. Decision

### 2.1 PASS 率分档处理

| PASS 率 | verdict | 处理 | 自动度 |
|---|---|---|---|
| **≥90%** | `PASS` | ✅ 接受 + 归档失败例 (per 规则 B) + 继续 pipeline | 全自动 |
| **80–90%** | `WARN` | ⚠️ 警告 + 归档 + **暂停等 user 决定** | 半自动 |
| **<80%** | `FAIL` | ❌ 强制全 stage 重跑 + 归档全部 attempt | 全自动 |

**阈值参数（默认值，YAML 可调）**:

- PASS 阈值 = `0.90`
- WARN 下限 = `0.80`
- FAIL 上限 = `0.80`（< 0.80 即 FAIL）

### 2.2 重跑上限

| 项 | 默认值 | YAML key |
|---|---|---|
| 单 stage 同 run 最大重跑次数 | **3** | `audit.max_retries.<stage>` |
| 重跑超限后行为 | halt + 写 `RETROSPECTIVE_required.md` | — |

3 次仍不过 → halt + 写 `failures/<cert_id>/runs/<run_id>/RETROSPECTIVE_required.md`，等 user 介入（per 规则 C 触发 mini-retro）。

### 2.3 安全字段升级规则（关键 escape hatch）

某些字段一旦 FAIL 即使 PASS 率高也强制重跑（语义不可妥协）。

**默认安全字段清单**:

| 字段 | 影响 |
|---|---|
| `Question.answer_index` | 题目正确答案 index — 错了考试就考砸（产品价值核心） |
| `Term.surface.jp` | 术语日文形 — 错了下游 kana_helper 全错（项目核心动机） |
| `Entity.type` | Discriminated Union discriminator — 错了 Pydantic 类型校验全错 (D-056) |
| `Envelope.cert_id` | cert 标识 — 错了下游路由全错 (D-058) |
| `Envelope.schema_version` | 版本号 — 错了下游兼容判定全错 (D-058) |

**升级逻辑**:

- 任一安全字段 FAIL → verdict 升级为 `FAIL`（即使 PASS 率 ≥90%）
- 触发强制全 stage 重跑
- 重跑使用 opus 模型（per D-061 升档规则）

### 2.4 Escape hatch（YAML override）

```yaml
audit:
  thresholds:
    pass: 0.90      # PASS / WARN 分界
    warn: 0.80      # WARN / FAIL 分界
  max_retries:
    default: 3
    stage_5_translate: 5   # translate 容易 LLM 抖动，给多次重试
  safety_fields:
    extend:
      - "Question.choices.*.jp"   # 临时把题目选项也设为安全字段
```

### 2.5 与规则 B 对接

任何 FAIL 必归档到 `failures/<cert_id>/runs/<run_id>/step_NN_attempt_X.md`（per 规则 B）。归档内容必须包含:

- 失败 sample_id（per D-022 锚点）
- 失败原因（reviewer 文本）
- 完整 input snapshot
- writer prompt + 模型版本
- reviewer prompt + 模型版本
- 时间戳
- 重试编号 X

---

## 3. Rationale

### 3.1 为何 90 / 80 阈值

- **90% PASS** = 业界 LLM eval 通常 baseline（如 LangChain default eval pass rate）
- **80% WARN buffer** = 给 LLM 抖动 10% 缓冲，避免 single-failure halt
- 低于 80% 显然 systemic 问题，必须重跑

### 3.2 为何重跑上限 3 次

- 1 次太少（LLM 抖动可能恰好赶上）
- 5+ 次成本不可控
- 3 次 = 业界 retry 经验值（如 cloud SDK retry default）
- 防死循环（per user "做出来" 偏好）

### 3.3 为何安全字段升级机制

- 阈值是统计概念，但有些字段错了产品就废
- 安全字段清单 = 项目"产品价值核心"边界
- 一票否决 + 强制重跑 = 兜底机制

### 3.4 为何 WARN 暂停等 user 决定

- 80–90% 区间是"不确定要不要重跑"的灰色地带
- 重跑成本高，应让 user 决定
- 半自动设计 = "不死板" 体现

---

## 4. Alternatives Considered

### 4.1 (A) FAIL 一例 → 全 stage 重跑

**拒因**:

- 死循环风险（reviewer 标准过严时永远 ship 不出来）
- 与 user "做出来" 偏好直接冲突
- 不区分 sample-level vs stage-level 错因

### 4.2 (B) FAIL 一例 → 局部修补

**拒因**:

- 错过 systemic bug（如 prompt 缺示例导致 1/N FAIL，可能反映同问题在其他未抽检 sample 也存在）
- 与 "高标准" 偏好不符

---

## 5. Consequences

### 5.1 正面

- 主流程严格（90% 阈值）
- 配置层灵活（YAML override）
- 安全字段绝对兜底
- 防死循环（重跑上限 3）
- 与规则 B 完美对接（任何 FAIL 必归档）
- 半自动设计（WARN 等人决）符合 user "不死板"

### 5.2 负面 / 接受的代价

- 阈值参数需在初期 calibrate（如 90% 太严？太松？需运行几次后调整）
- 安全字段清单需 cert-specific 维护（每加一个 cert 可能要扩展）
- WARN 半自动会拖慢自动化 pipeline（user 不在线时 stuck）

---

## 6. Implementation Notes

> **本场不写代码**。以下仅为实施期参照。

```python
# packages/extractor/src/cert_extractor/audit/failure_handler.py

from enum import Enum

class Verdict(str, Enum):
    PASS = "PASS"
    WARN = "WARN"
    FAIL = "FAIL"

DEFAULT_PASS_THRESHOLD = 0.90
DEFAULT_WARN_THRESHOLD = 0.80
DEFAULT_MAX_RETRIES = 3

DEFAULT_SAFETY_FIELDS = {
    "Question.answer_index",
    "Term.surface.jp",
    "Entity.type",
    "Envelope.cert_id",
    "Envelope.schema_version",
}


def determine_verdict(
    pass_count: int,
    fail_count: int,
    failed_safety_fields: set[str],
    safety_fields: set[str] = DEFAULT_SAFETY_FIELDS,
    pass_threshold: float = DEFAULT_PASS_THRESHOLD,
    warn_threshold: float = DEFAULT_WARN_THRESHOLD,
) -> Verdict:
    """Per D-063 分档 + 安全字段升级."""
    # 安全字段一票否决
    if failed_safety_fields & safety_fields:
        return Verdict.FAIL

    rate = pass_count / (pass_count + fail_count)
    if rate >= pass_threshold:
        return Verdict.PASS
    if rate >= warn_threshold:
        return Verdict.WARN
    return Verdict.FAIL
```

---

## 7. Related Decisions

| D / 规则 | 关系 |
|---|---|
| **规则 A** 抽检 | 本 ADR 是规则 A 的 FAIL 分支 |
| **规则 B** 失败归档 | 任何 FAIL 必归档（§2.5） |
| **规则 C** retro | 重跑超限触发 mini-retro |
| **规则 D** writer/reviewer 分离 | 重跑必须仍走分离 (per D-061) |
| **D-008** pipeline | 重跑范围 = 整 stage |
| **D-056** Discriminated Union | `Entity.type` 是安全字段 |
| **D-058** envelope | `cert_id` / `schema_version` 是安全字段 |
| **D-059** N 公式 | 阈值计算的 denominator |
| **D-061** reviewer 映射 | 升 opus 触发条件来自本 ADR |
| **D-062** evidence 字段 | verdict 字段 (#14) 来自本 ADR |

---

## 8. Revision History

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-06 | 1.0 | Initial — Session 04 §4.5 锁定 |

---

> 本 ADR 关联的活页讨论: `docs/discussion/2026-05-06-session-04.md` §4.5 + §4.6 + §6.2。
