# D-073 — Phase 1 Launch Strategy: Single-Chapter Dry-Run + Full-Book

| 字段 | 值 |
|---|---|
| **Status** | Locked (Session 06, 2026-05-06) |
| **Decision Maker** | Claude (per "你来定" 委托, D-019; user framing "严格但不死板，前提是做出来") |
| **Source** | `docs/discussion/2026-05-06-session-06.md` §4.5 |
| **Related** | 规则 C (retro), D-008 (pipeline), D-046 (GitHub Release), D-053 (run-id), D-063 (audit), D-069/D-070/D-071/D-072 |

---

## 1. Context

Phase 1 第一次跑全本（~500 pages of 《IT パスポート》）风险高:

- Mistral OCR quality 未验证（日文混排 / 教科书 PDF 排版）
- Structure prompt 可能漏 case
- Translation 可能术语不一致 / kana_helper 触发不准
- 综合错误可能直到 stage 6 audit 才暴露（500 pages × cost + 时间 = 高失败成本）

User 全权委托 Claude 决定启动节奏。

---

## 2. Decision

### 2.1 三阶段启动

**Stage A: 单 chapter dry-run**

- 输入: 单 chapter (~50 pages, user 在 YAML 指定 `chapter_index`)
- 跑: 完整 stage 0~7 e2e
- 走: 全部抽检 (per D-060 强制 stage) + 全部 reviewer (per D-061) + 全部 cap (per D-071)
- run_id: `dry_run_<timestamp>`
- 输出路径: `data/<cert_id>/runs/dry_run_<ts>/`

**Stage B: User retro**

- User 看 dry-run 输出（含三语 schema / kana_helper / 抽检 PASS 率 / failures / cost.json）
- PASS → Stage C
- WARN → 调 prompt / 调阈值 → 重 Stage A
- FAIL → 重大调整 + 写 RETROSPECTIVE.md (per 规则 C) → 回讨论

**Stage C: 全本**

- 输入: 全本 ~500 pages
- 跑: 同 Stage A 流程 (stage 0~7 完整 e2e)
- 走: 同样 cap (per D-071)
- run_id: `<timestamp>` (无 `dry_run_` 前缀)
- 输出路径: `data/<cert_id>/runs/<ts>/`
- 完成 → GitHub Release 发版 (per D-046)

### 2.2 Dry-run chapter 选择

推荐选教科书 **"中等难度章节"**（不是开篇 / 不是末章），让 dry-run 暴露真实排版复杂度。

```yaml
# pipelines/itpassport-r6.yaml
dry_run:
  chapter_index: 4   # user 选；默认 ceil(total_chapters / 2)
  pages_estimate: 50
```

如 user 不指定，默认 `chapter_index = ceil(total_chapters / 2)`（取中位 chapter）。

### 2.3 Dry-run vs 正式 run 区分

| 维度 | dry_run | 正式 run |
|---|---|---|
| run_id 前缀 | `dry_run_` | (无前缀) |
| 路径 | `data/<cert>/runs/dry_run_<ts>/` | `data/<cert>/runs/<ts>/` |
| 完成动作 | user retro | GitHub Release (per D-046) |
| Cap 阈值 | 默认（per D-071） | 默认（per D-071） |
| Evidence 落点 | 同结构 (per D-062) | 同结构 |

### 2.4 失败可恢复性

| Stage | 失败类型 | 恢复路径 |
|---|---|---|
| A dry-run | OCR quality 差 | 调 Mistral / 切 Hard Re-OCR / 重 dry-run |
| A dry-run | Structure 抽取漏 | 调 prompt / 重 dry-run |
| A dry-run | Translation 术语不一 | 调 stage 4.5 glossary / 重 dry-run |
| A dry-run | Cap 触发 | 调阈值 / 重 dry-run |
| C 全本 | Cap 触发 | per D-071 软硬 cap 处理 |
| C 全本 | systemic bug | 写 RETROSPECTIVE.md + halt + 回 dry-run 阶段 |

### 2.5 与规则 C retro 对接

| 触发 | retro 形式 |
|---|---|
| dry-run FAIL | mini-retro (`RETROSPECTIVE_required.md`) |
| dry-run repeated WARN | mini-retro |
| 全本完成 | full retro (`RETROSPECTIVE.md` per Phase 1 收尾，规则 C 标准) |

---

## 3. Rationale

### 3.1 为何不直接全本 1-shot

- 失败成本太高（500 pages × cost + 时间）
- Stage 4 才发现 stage 1 systemic bug 的风险
- Mistral OCR + Structure + Translation 三类都未验证

### 3.2 为何不多阶段 dry-run

- 多阶段 = stage 0+1 dry-run → 全本 stage 0+1 → stage 2-7 dry-run → 全本 stage 2-7
- User retro 介入 4 次（频繁打断）
- 违反 user "做出来" (希望最少打断)
- 单 chapter dry-run 已经覆盖全 e2e，没必要拆

### 3.3 为何选 "中等难度" chapter

- 开篇 chapter 通常简单（未必暴露排版复杂度）
- 末章可能特殊（题库 / 附录）
- 中位 chapter = 教科书 "主体"，最具代表性

### 3.4 为何 dry-run + 正式 run 同流程同 cap

- 流程一致 = 测试覆盖 = dry-run PASS = 全本大概率 PASS
- 同 cap 阈值 = dry-run 也撞软 cap = 提前暴露 quota 问题

---

## 4. Alternatives Considered

### 4.1 (A) 全本 1-shot

**拒因**: 失败成本最高；Mistral / Structure / Translation 三类未验证；user "做出来" 偏好不接受这种 high risk 启动。

### 4.2 (C) 多阶段 dry-run

**拒因**: User retro 介入次数太多（4 次）；违 "做出来" 偏好；dry-run 已覆盖全 e2e 无必要拆；Phase 2+ 真有需求再升级到 C。

---

## 5. Consequences

### 5.1 正面

- 失败成本降到单 chapter (~$0.05 + 时间)
- User 在投入全本前看 e2e 形态
- 与规则 C retro 自动对接
- 与 D-063 audit + D-071 cap + D-046 Release 完美串联

### 5.2 负面 / 接受的代价

- +1 次 user retro (相比 1-shot)
- 多 ~30% 时间（dry-run + 全本两次跑）
- Dry-run chapter 选错风险（开篇过简单 chapter PASS 但全本 FAIL）— 接受，user 选 chapter 可调

---

## 6. Implementation Notes

```python
# packages/extractor/src/cert_extractor/launcher.py
from datetime import datetime
from typing import Literal
from zoneinfo import ZoneInfo


def launch_phase1(
    cert_id: str,
    mode: Literal["dry_run", "full"],
    chapter_index: int | None = None,
):
    tokyo = ZoneInfo("Asia/Tokyo")
    timestamp = datetime.now(tz=tokyo).strftime("%Y-%m-%dT%H-%M-%S")

    if mode == "dry_run":
        run_id = f"dry_run_{timestamp}"
        chapters = [chapter_index or default_chapter(cert_id)]
    else:
        run_id = timestamp
        chapters = None  # all

    pipeline = Pipeline(cert_id=cert_id, run_id=run_id, chapters=chapters)
    monitor = BudgetMonitor()  # per D-071

    for stage in pipeline.stages:
        result = pipeline.run_stage(stage)
        verdict = monitor.check(pipeline.cost_summary())
        if verdict == Verdict.FAIL:
            halt_with_emergency_md(run_id)
            return
        if verdict == Verdict.WARN:
            wait_for_user_decision(run_id)

    if mode == "full":
        github_release(cert_id, run_id)  # per D-046
    else:
        print(f"Dry-run done. Review: data/{cert_id}/runs/{run_id}/")
```

---

## 7. Related Decisions

| D / 规则 | 关系 |
|---|---|
| **规则 C** retro | dry-run FAIL / 全本完成 都触发 retro |
| **D-008** pipeline | dry-run 跑同样的 stage 0~7 |
| **D-046** GitHub Release | 全本完成后发版 |
| **D-053** run-id 累积式 | dry-run run_id 加 `dry_run_` 前缀 |
| **D-063** audit | dry-run 走相同抽检 |
| **D-069** Anthropic | dry-run 用 Agent SDK |
| **D-070** Mistral dry-run | Q33 dry-run = 本 D Stage A 的 stage 0+1 子集 |
| **D-071** budget cap | dry-run + 全本都过 cap |
| **D-072** cost tracking | dry-run 写 cost.json |

---

## 8. Revision History

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-06 | 1.0 | Initial — Session 06 §4.5 锁定 |

---

> 本 ADR 关联的活页讨论: `docs/discussion/2026-05-06-session-06.md` §4.5 + §4.6 + §6.2 + §6.7。
