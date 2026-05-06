# D-061 — Reviewer Agent Mapping & Model Tier Policy

| 字段 | 值 |
|---|---|
| **Status** | Locked (Session 04, 2026-05-06) |
| **Decision Maker** | User 直答 (Q24=B "多 reviewer 分工") → Claude 升级为 ADR（融合原 (C) 选项 paper trail 形式） |
| **Source** | `docs/discussion/2026-05-06-session-04.md` §4.3 |
| **Related** | 规则 D (writer/reviewer 分离), D-008 (pipeline 8 stage), D-026 (插件机制), D-056 (Discriminated Union), D-059, D-060, D-063 |

---

## 1. Context

规则 D 要求 writer 和 reviewer 不能是同一 agent / 同一 session 自审。OMC 提供多种 reviewer 类型（`verifier` / `code-reviewer` / `scientist` / `tracer` / `architect` / `critic`）。需明确 stage → reviewer 映射 + 模型档位规则。

User 在 Q24 直答 (B)：按 stage 性质映射 reviewer。Claude 升级为 ADR 形式（融合原 (C) 选项 paper trail），让映射可追溯、可演化。

---

## 2. Decision

### 2.1 Stage → Reviewer + 模型档位映射表

| Stage | Stage 名 | Writer agent | Reviewer agent | 默认模型档位 | 选 reviewer 理由 |
|---|---|---|---|---|---|
| **1** | OCR | Mistral OCR (非 OMC) | `scientist` | sonnet | 数据/语料分析专长（跨页对照、像素 vs 文本一致性） |
| **3** | Hard Re-OCR | Claude Vision | `scientist` | sonnet | 同 stage 1（critical 时升 opus） |
| **4** | Structure | OMC `executor` | `code-reviewer` | sonnet | 类型/结构合规性专长（呼应 D-056 Discriminated Union 校验） |
| **5** | Translate | OMC `executor` | `scientist` | sonnet | 语料/术语一致性专长（呼应 stage 4.5 Glossary） |
| **6** | Audit | OMC `executor` | `verifier` | sonnet | 完成度证据校验专长（OMC 默认 reviewer） |

**默认跳过 stage（per D-060）不在此表**: 0 Unpack / 2 Classify / 4.5 Glossary / 7 Export。如 escape hatch 临时强开，按内容性质从此表挑近似 reviewer。

### 2.2 模型档位通则

- **默认 sonnet** (Claude Sonnet 4.6) — 中等成本+中等能力 sweet spot
- **升 opus 触发条件**:
  - 同 stage 第二次 FAIL（per D-063）
  - 安全字段 FAIL（per D-063 安全字段清单）
  - cert 首次 onboarding 抽检（高保险 baseline）
- **降 haiku 触发条件**:
  - 同 stage 连续 5 次 PASS
  - 业务非 critical（非安全字段为主）
  - 成本预算紧张时 user 显式同意

### 2.3 Override 机制

pipeline YAML 可 per-stage override：

```yaml
audit:
  reviewers:
    stage_5_translate:
      reviewer: "scientist"
      model: "opus"  # 临时升档
    stage_4_structure:
      reviewer: "critic"  # 改用更严格的 reviewer
      model: "sonnet"
```

任何 override 必须在 pipeline YAML 中显式声明 + 在该 run 的 evidence 中记录（per D-062 字段 9 + 10）。

### 2.4 规则 D 自动满足验证

| Stage | Writer subagent_type | Reviewer subagent_type | 是否自审 |
|---|---|---|---|
| 1 | (外部 Mistral) | scientist | ✅ 不自审 |
| 3 | (外部 Claude Vision) | scientist | ✅ 不自审 |
| 4 | executor | code-reviewer | ✅ 不自审 |
| 5 | executor | scientist | ✅ 不自审 |
| 6 | executor | verifier | ✅ 不自审 |

---

## 3. Rationale

### 3.1 为何按 stage 性质映射

不同 stage 的"质量"语义不同:

- **OCR / Translate** = 数据/语料一致性 → `scientist` 专长
- **Structure** = 类型/结构合规性 → `code-reviewer` 专长
- **Audit** = 完成度证据校验 → `verifier` 专长

单一 reviewer 不能同时擅长三种性质。

### 3.2 为何默认 sonnet

成本 / 能力 sweet spot:

- haiku 太弱（漏检语义类问题）
- opus 成本 ~5x 但只在 critical 时需要
- sonnet 4.6 = 大部分场景"够用"，per Anthropic 官方推荐

### 3.3 为何升降档自动化

避免 user 每次手动切换的认知负担：

- "FAIL 第二次" → 自动升 opus（多花钱救质量）
- "连续 5 次 PASS" → 可降 haiku（省钱）
- "安全字段" → 自动升 opus（兜底产品价值）

### 3.4 为何升级为 ADR (而不止散落注释)

User Q24 直答 (B)。但纯 (B) 把映射散落各 stage 注释/代码会失去 paper trail。Claude 自决加一层（融合原 (C) 选项形式）：

- 跨 cert 复用时新 cert 维护者有统一参考
- 任何映射变更走 ADR 修订流程
- D-029 明确"重大决定独立 ADR"，reviewer 映射跨 Phase 影响显然属重大

→ 仍是 user 选的 **B 精神**（多 reviewer 分工），只是 paper trail 升级。

---

## 4. Alternatives Considered

### 4.1 (A) 单一 reviewer 全场用 verifier

**拒因**:

- verifier 主长是"完成度证据校验"，不擅长数据分析（OCR/Translate）或类型校验（Structure）
- 一旦 verifier 漏检某 stage 类问题，全 stage 失守
- 与"高标准"偏好不符

### 4.2 纯 (B) 散落注释 / 不写 ADR

**拒因**:

- 映射散落各 stage 代码 / pipeline 注释，未来修订无 paper trail
- 跨 cert 复用时新 cert 维护者无统一参考
- D-029 明确"重大决定独立 ADR"，reviewer 映射跨 Phase 影响显然属重大

---

## 5. Consequences

### 5.1 正面

- 每 stage 有专业 reviewer，错误捕获更准
- 模型档位自动升降，成本/质量平衡
- ADR 形式让映射可追溯、可演化
- Override 机制留 escape hatch，符合 user "不死板" 偏好
- 规则 D 验证表（§2.4）让任何看 ADR 的人秒懂"已经满足分离规则"

### 5.2 负面 / 接受的代价

- 5 个 stage × 5 种 reviewer 配置 = 维护成本中等
- 升降档触发条件需在 pipeline 实现层落实（不是配置文件就能搞定）
- 模型档位变更影响成本预算（需在 Topic #7 LLM 预算讨论时核算）

---

## 6. Implementation Notes

> **本场不写代码**。以下仅为实施期参照。

```python
# packages/extractor/src/cert_extractor/audit/reviewer_dispatch.py

REVIEWER_MAP = {
    1: ("scientist", "sonnet"),       # OCR
    3: ("scientist", "sonnet"),       # Hard Re-OCR
    4: ("code-reviewer", "sonnet"),   # Structure
    5: ("scientist", "sonnet"),       # Translate
    6: ("verifier", "sonnet"),        # Audit
}

def select_reviewer(
    stage: int,
    history: "AuditHistory",
    override: dict | None = None,
) -> tuple[str, str]:
    """Per D-061 mapping + 升降档规则 + YAML override."""
    if override:
        return (override["reviewer"], override["model"])

    base_reviewer, base_model = REVIEWER_MAP[stage]

    # 升档判断
    if history.consecutive_fails(stage) >= 1:
        return (base_reviewer, "opus")
    if history.has_safety_field_fail(stage):  # per D-063
        return (base_reviewer, "opus")
    if history.is_first_onboarding(stage):
        return (base_reviewer, "opus")

    # 降档判断
    if (
        history.consecutive_passes(stage) >= 5
        and not history.is_critical(stage)
    ):
        return (base_reviewer, "haiku")

    return (base_reviewer, base_model)
```

---

## 7. Related Decisions

| D / 规则 | 关系 |
|---|---|
| **规则 D** writer/reviewer 分离 | 本 ADR §2.4 自动满足并验证 |
| **D-008** pipeline 8 stage | 本 ADR 映射的 stage 来源 |
| **D-026** 插件机制 | 第三方插件可 override 此映射（per Phase 5） |
| **D-056** Discriminated Union | code-reviewer 校验 stage 4 的合规性靶子 |
| **D-059** N 公式 | 决定每个 reviewer 跑多少 sample |
| **D-060** 强制 stage 政策 | 决定哪些 stage 进此映射表 |
| **D-063** FAIL 处理 | 升 opus / 降 haiku 触发条件来源 |

---

## 8. Revision History

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-06 | 1.0 | Initial — Session 04 §4.3 锁定 |

---

> 本 ADR 关联的活页讨论: `docs/discussion/2026-05-06-session-04.md` §4.3 + §4.6 + §6.2。
