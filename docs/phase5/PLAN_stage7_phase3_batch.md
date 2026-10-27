# Stage 7 Phase 3 — 教科书批量重写 Implementation Plan（v1 草案，S135）

> **For agentic workers:** 前置工具任务（Task B1〜B4）用 superpowers:subagent-driven-development；内容任务（Task B5 循环）按 §2 的每 topic 流程执行，不按 checkbox 一次跑完。

**Goal:** 把剩余 60 个 topic / 241 个单元按 D-195 + D-197〜D-200 重写为 v2，**按出题数从多到少**逐个 topic 上线；每个 topic 上线前由你在画面上确认。

**Architecture:** 沿用 3b 的流水线（`textbook-v2-prep` → `textbook-v2.workflow` → `merge` → `validate` / `parity`）与阅读页，不新增图种、不改 schema。本计划只补：① 批量前必须先修的 4 处工具缺口 ② 每 topic 的固定流程与停止规则 ③ 每 topic 的证据与 e2e。

**Spec:** D-195（含 S135 补足）、D-197〜D-200、S135 log §10（本轮问答）、`RETROSPECTIVE_stage7_ui.md` Phase 3 节、试点证据 `evidence/phase5/stage_07_ui/phase3/pilot_audit.md`。§0 经你批准后锁为 **D-201**。

---

## 需要你确认的点（批准本计划 = 同意以下各点）

1. **分量不设上限**（你在 §10 的选择）：读了目安照实显示（试点 38〜49 分），D-200 的考点上限保留。
2. **顺序 = 出题数降序**（§1 表），同数时按 topic_id。
3. **节奏 = 1 天 1〜2 个 topic，另加单元数上限：1 天最多 6 个单元**。大 topic（≥7 单元，共 6 个：technology-23-63 13 单元、strategy-01-02 15、technology-23-61 13、strategy-01-01 11、strategy-05-14 9、technology-23-62 7 …）**拆成每批 ≤5 单元**，每批单独请你确认、单独上线。理由：1 单元 ≈ 150 万 token / 15〜30 分，13 单元一天跑完会撞 5 小时用量上限。
4. **你的确认 = 每个 topic（大 topic 为每批）上线前**：我给出本地 :3150 链接 + ja/zh/en × 1440/390 截图 + Rule A 摘要，你同意后才 push。
5. **Rule A = 每个 topic 全数用语**（试点做法），由 `oh-my-claudecode:verifier` opus 执行。

---

## §0 细化决定（批准后 = D-201）

| # | 决定 | 理由 / 却下案 |
|---|---|---|
| 0-1 | 顺序：§1 表的出题数降序；已完成的 management-10-27 跳过。 | 你的选择。却下：按分野。 |
| 0-2 | 每日上限：≤ 2 个 topic 且 ≤ 6 个单元；大 topic 拆批（每批 ≤ 5 单元，按 `unit_order`）。触到 D-161 的 5 小时 ≥ 78% 立即停在当前单元之后。 | 成本实测（S135）：1 单元 ≈ 150 万 token；u02 曾 5 attempt。却下：并行 3〜5 单元（你选了着实）。 |
| 0-3 | 每单元 attempt 规则：初稿 → 未过则以 r1 + 第 2 轮审查为种子改稿 1 次 → 仍未过则 Rule B 归档并**停下来问你**（不跑第 3 次）。 | 试点：u01 / u03 第 2 次即过；u02 的 5 次是规则未定期间。却下：无限重试。 |
| 0-4 | 合格基准 D-199（high/medium 0）；Rule A 全数用语；Rule A 的 LOW 修正**走 merge 之后的正式补丁工序**（Task B3），不再直接改 JSON。 | 试点缺口（RETRO「merge を迂回した事後修正」）。 |
| 0-5 | 分量：不设上限；est_minutes 公式不变（全 JP 本文 / 80）。 | 你在 §10 的选择。 |
| 0-6 | 每 topic 上线单位 = 一个 commit 组（content + unit_minutes + v1 glosses fixture + evidence），push 前 Gates 五项 + IPA 闸 + e2e 全量；push 后本番 e2e。 | 沿用 Phase 3 Global Constraints。 |
| 0-7 | 你的确认方式：本地 :3150（Redis env 空）+ 截图 6 张 + Rule A 摘要；你回答「上线 / 改 X / 暂停」。 | 你选了 topic 单位确认。 |

---

## §1 顺序表（出题数降序，括号 = 单元数；★ = 拆批）

1 technology-23-63 情報セキュリティ対策・実装技術 217 (13★) / 2 technology-23-62 情報セキュリティ管理 135 (7★) / 3 management-08-25 システム開発技術 125 (5) / 4 strategy-01-02 業務分析・データ利活用 98 (15★) / 5 technology-22-60 97 (6) / 6 strategy-01-03 90 (6) / 7 technology-23-61 89 (13★) / 8 technology-22-58 87 (5) / 9 management-11-29 77 (5) / 10 strategy-06-19 71 (3) / 11 strategy-02-04 69 (3) / 12 strategy-01-01 62 (11★) / 13 strategy-03-09 60 (5) / 14 management-12-31 58 (2) / 15 technology-21-55 55 (3) / … 以下 59 位まで同様（完整表由 Task B1 生成到 `docs/phase5/batch_order.md`）。

---

## §2 每 topic 的固定流程（Task B5 循环）

1. `textbook-v2-prep --unit` 本 topic（或本批）全部单元；检查 `unit_summary_*` 无制作メモ（Task B2 的检查）。
2. workflow 逐单元（同时最多 2 个）：`{unit, run_tag: "<topic短名><批><attempt>"}`；未过 → 种子改稿 1 次（§0-3）；再未过 → Rule B + 停。
3. merge `--write` → validate / parity → `unit_minutes` 重建 + `--check` → v1 glosses fixture 追加（Task B4 自动）→ vitest（`v2-corpus.test.ts` 自动覆盖新单元）。
4. Rule A（verifier opus，全数用语）→ `evidence/phase5/stage_07_ui/phase3/batch/<topic>[-批].md`；HIGH/MEDIUM → 正式补丁工序（Task B3）→ 该用语复审；推荐 LOW 同样走补丁工序。
5. Gates 五项 + IPA 闸 + e2e 全量（`textbook-v2.spec` 已自动覆盖所有 v2 单元，Task B4）。
6. 本地 :3150 + 截图 → 你确认 → push → 本番 e2e → 会话日志 + STATE（每 topic 一行）。

---

## Tasks（前置，批量开始前完成）

### Task B1: 顺序表
- [ ] `scripts/textbook-v2-batch-order.mjs`：按 `questions.json` 的 topic 出题数降序 + 单元数 + 拆批（≤5）写 `docs/phase5/batch_order.md`；测试：排序与拆批确定。

### Task B2: unit_summary 制作メモ
- [ ] 全 244 单元扫描 `unit_summary_*` 中的制作メモ（如「term 順は…」「planning」等元说明；规则写在脚本里），报告命中；prep 遇到命中时把 v1 原文与「需去除」标记写进 manifest，merge 以去除后的文本写入（三语同步，parity 覆盖）。测试：命中样例被去除、普通摘要不变。

### Task B3: merge 之后的正式补丁工序
- [ ] `scripts/textbook-v2-patch.mjs --unit --patch <json>`：补丁 = [{path, lang, before, after}]，before 必须完全一致才应用；应用后自动跑 validate / parity；补丁文件存 `evidence/.../batch/patches/<unit>.json`（不含题目原文）；merge 再次运行时自动重放已登记补丁。测试：before 不一致拒绝；重放幂等；merge 后补丁仍在。

### Task B4: 自动化覆盖新单元
- [ ] merge `--write` 时把该单元的 v1 glosses 追加到 `__fixtures__/v2-units.v1terms.json`（已有则校验一致）。
- [ ] `e2e/textbook-v2.spec.ts` 的「各单元 × ja/zh/en：顺序 / 无标记」与「辞典页」改为遍历所有 v2 单元（交互测试仍只用试点）。
- [ ] zh 译语表 `data/ip/textbook/zh_terms.json`（变更管理 等，试点中出现的统一词）写入 localiser prompt；parity 不变。

### Task B5: 批量循环
- [ ] 按 §1 / §2 逐 topic（批）执行；每 topic 在 `docs/phase5/batch_order.md` 打勾并写 commit / Rule A 结果 / attempt 数。

### Task B6: 收尾
- [ ] 全部完成后：Rule C 追加到 `RETROSPECTIVE_stage7_ui.md`；D-195 最终版。

---

## 不在本计划内
- 新图种（D-195 §2 计算图小部件不足，L14）— 需要时另立任务。
- 辞典页显示 v2 图（S135 持ち越し）— 另立任务。
- 改单元标题 / 增删用语（§0-9 不变量）。
