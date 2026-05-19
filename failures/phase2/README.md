# failures/phase2/

Phase 2（带 AI 答疑的个人备考工具）实施期失败 attempt 归档。**This dir is committed.**

Per **Rule B**（`~/.claude/CLAUDE.md` `<personal_operating_principles>`）：每个失败 attempt 归档此处，**never deleted**。

Per **D-019 Q3=a** Phase 1 failures/ 同构 carry-over，flat 命名 `step_NN_<topic>_attempt_X.md`。

> 失败数据是重跑和复盘最贵的资料。不删。

---

## Layout

```
failures/phase2/
├── README.md                                    # 本 file
├── step_NN_<topic>_attempt_001.md               # 例：step_04_ai_sdk_cache_block_attempt_001.md
├── step_NN_<topic>_attempt_002.md
└── ...
```

flat 文件，不嵌套子目录（Phase 1 `failures/stage5_translate/attempt_001/` 嵌套模式是因为 attempt 内还有多个产物文件；Phase 2 默认 flat，仅当某 attempt 需多文件时改 dir）。

---

## 归档内容（per `../../docs/templates/failure-template.md` D-032）

每个 archive 至少含:

- **输入**：触发该 attempt 的 prompt / 命令 / 输入数据
- **产物**：该 attempt 实际产出（哪怕是错的）
- **技术判定**：技术层面 PASS / FAIL（test green? lint pass? deploy success?）
- **业务判定**：业务层面 PASS / FAIL（用户能用吗？体验对吗？符合 D-085 mode 定义吗？）
- **下一 attempt 输入**：本 attempt 失败学到的什么，下一 attempt 怎么改

---

## What lives here vs. elsewhere

| Question | Read |
|---|---|
| "Phase 2 成功 step 的 evidence" | `../../evidence/phase2/step_NN_<topic>/` |
| "Phase 2 实施 PLAN" | `../../docs/phase2/PLAN.md` |
| "Phase 1 失败归档" | `../stage1_ocr/` / `../stage4_structure/` / `../stage4_5_glossary/` / `../stage5_translate/` |
| "失败 template" | `../../docs/templates/failure-template.md` (D-032) |

---

## 命名约定

`step_NN_<topic>_attempt_X.md` 其中:

- `NN` = PLAN.md §1 中的 step 号（01-15）
- `<topic>` = step 标题简称（snake_case，e.g. `scaffold` / `datasource` / `ai_sdk` / `chat_ui`）
- `attempt_X` = attempt 序号（001 起；同 step 多 attempt 顺延）
- Plan-B 变体加 `_plan_b` 后缀（per Phase 1 `failures/stage5_translate/plan_b_attempt_002/` 惯例）
