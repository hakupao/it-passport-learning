# Stage 7 Phase 3 — 教科书批量重写 Implementation Plan（v2，S135）

> **For agentic workers:** 前置任务 B1〜B7 用 superpowers:subagent-driven-development；内容循环（Task B8）按 §2 逐批执行，不一次跑完。

> **修订记录**：v1 草案 → 独立 critic（`oh-my-claudecode:critic` opus）判 REVISE（Critical 0 / Major 8 / Minor 14）→ 本 v2 全部吸收：workflow 全结局→动作表 + 每次失败 Rule B（M1）、补丁作用在 merge 内存 loc part 上并带 base_sha256（M2）、测试钉点盘点 B4（M3）、全语料检查改 vitest SSR、e2e 只跑本批（M4）、无匹配图种的回退规则（M5）、启动前用量检查 + 实测每单元占比 + 日历（M6）、zh 译语表来源与 warn 检查（M7）、等待确认期间只推进到 `.planning`（M8）；数字按脚本重算（62 topic / 241 单元 / 1402 用语 / 78 批）。→ 范围限定复审 REVISE（措辞 3 处 + Minor 2）→ 已全部改字：B3 验收改为试点冻结基线（N1）、loc-seed 的双 journal（N2）、0-6 计入 Rule A 与并行算法、zh 冲突清单（N3）、确认点 5 与 0-3 统一（N4）、日数 41。

**Goal:** 把剩余 **62 个 topic / 241 个单元 / 1402 个用语**按 D-195（+ D-197〜D-200）重写为 v2，**按出题数从多到少**，每批上线前由你在画面上确认。

**Architecture:** 沿用 3b 流水线与阅读页，不改 schema。本计划补：① 批量前的 7 个前置任务 ② 每批固定流程、结局→动作表、停止规则 ③ 每批证据与测试范围。

**Spec:** D-195（含 S135 补足）、D-197〜D-200、S135 log §10、`RETROSPECTIVE_stage7_ui.md` Phase 3 节、`evidence/phase5/stage_07_ui/phase3/pilot_audit.md`。§0 经你批准后锁为 **D-201**。

---

## 需要你确认的点（批准本计划 = 同意以下各点）

1. **分量不设上限**（你在 §10 的选择）。外推：试点 4〜6 用语的单元 38〜49 分；全语料有 81 个单元是 7〜9 用语，按同样写法约 **60〜75 分**，今日页会显示这个分钟数。
2. **顺序 = 出题数降序**；**凡超过 5 单元的 topic 都拆批（每批 ≤5）**，共 12 个 topic 被拆，合计 **78 批**。
3. **节奏 = 1 天 ≤2 批 且 ≤6 单元**；每次启动前检查用量（§0-6）。按此最少约 **41 个工作日**（241 ÷ 6）；第一批实测每单元用量后，我给出更准的日历。
4. **你的确认 = 每批上线前**：在本地 :3150 看本批单元（附本批 Rule A 摘要、分钟数表、截图）；你回答「上线 / 改 X / 暂停」。
5. **停下来问你的时机**：同一单元连续 2 次 attempt 未过；或 Rule A 的 HIGH 经补丁 + 复审后仍为 HIGH。其他失败我按 §0-3 自行处理（D-161），不打断你。
6. **图种不够用时**（例如统计图表、回归、检定的单元）：先用表格 / 既有 SVG 代替，审查对此最多判 low；第 4 位的 strategy-01-02（15 单元，含 7 种统计图）开始前，我先提出一个「图表图种」的小任务请你决定做不做。
7. **已读的单元**：重写后仍显示「読了」，今日页不再推荐（学习记录格式锁定，不能重置）。接受这一点。
8. **本番 e2e** 每批只跑 smoke + 本批单元（全量 e2e 在本地跑），以控制时间。

---

## §0 细化决定（批准后 = D-201）

| # | 决定 | 理由 / 却下案 |
|---|---|---|
| 0-1 | 顺序：出题数降序（同数按 topic_id）；拆批 = 单元数 >5 的 topic 按 `unit_order` 每 5 个一批。表由 B1 脚本生成。 | §10。却下：只拆 ≥7（6 单元 topic 一天撞上限）。 |
| 0-2 | 结局→动作（workflow `status`）：`ready-to-merge` → merge；`jp-rejected` → 以 final JP part + 最后一轮 JP 审查为种子改稿（attempt +1）；`loc-rejected` → 用 B5 的 loc 种子改稿（只重写 zh/en，JP 不动，attempt +1）；`needs-fix` → 读 issue，措辞级走 B3 补丁，否则同 jp-rejected；`seed-invalid` / `part-path-mismatch` / `*-write-failed` / `*-review-failed` / `crashed` → 换新 run_tag 重跑同输入（不计 attempt，连续 2 次则停）。**每个非 ready 结局都写** `failures/phase5/stage_07_ui/phase3/batch/<unit>_attempt_N.md`。 | critic M1。试点的 Rule B 做法。 |
| 0-3 | 停止：同一单元 attempt 2 次未过 → 停下问你（先用 Fable 咨询给出建议）；Rule A 出现 HIGH → 补丁 + 复审，复审仍 HIGH → 停下问你。 | D-161 与 §10「topic 单位确认」的折中。 |
| 0-4 | 补丁（B3）作用在 merge 内存中的 loc part 上（assemble 与 validate 之前），兼容字段与 est_minutes 自动重算；补丁文件记 `base_sha256`（对应 loc part）；before 命中→应用、只有 after 命中→跳过、都不命中→拒绝；loc part 重生成后 base 不符 → merge 拒绝并要求把补丁标为 retired。试点 lowfix 迁成首批登记补丁。 | critic M2。 |
| 0-5 | Rule A：每批全数用语，**按单元起 verifier**，汇总到 `evidence/phase5/stage_07_ui/phase3/batch/<批id>.md`（不含题目原文）。HIGH/MEDIUM 必修；LOW 由 verifier 标「建议修」，其余登记在该批证据的「未修 LOW」表。 | D-199 依赖 Rule A 全数；critic Minor 4。 |
| 0-6 | 用量：启动一个 run 前，`当前 5h 用量% + (正在运行的 run 数 + 1) × 单元实测% ≤ 78%` 才启动；**单元实测% = 该单元的 workflow + 该单元的 Rule A verifier**（截图等计入批开销）；周额度剩余 < 下一批预计用量时停在批边界。第一批记录每单元 token / 用语数 / 5h%。 | critic M6、D-161。 |
| 0-7 | 等待你确认期间：下一批只能推进到 `ready-to-merge`（停在 `.planning`，不 merge `--write`、不 commit）；本批 push 后才 merge 下一批。「改 X」：措辞级 → B3 补丁 + 该用语 Rule A 复审；结构级 → 按 0-2 重生成。 | critic M8。 |
| 0-8 | 图种：只用注册表内的 6 种；无合适部件时用 static table / 既有 SVG；critic 对「缺少注册表外的图种」最多判 low（写进 critic prompt）。新图种另立任务（strategy-01-02 前提议）。 | critic M5。 |
| 0-9 | 测试：全语料「顺序 / 无标记 / 辞典无标记」改为 vitest SSR（B4）；e2e 只跑本批单元（env 传 id）+ 试点交互测试；钉在待重写单元上的测试改钉 `__fixtures__` 冻结副本或改为独立重算（B4）。跟着改测试必须附独立重算依据。 | critic M3 / M4。 |
| 0-10 | 中途改 D-195（D-202…）时：只对之后的批生效；已上线批由 Rule A 的 diff 检查决定是否走补丁，不重生成。 | critic「遗漏」。 |
| 0-11 | 分支：`stage7-ui` 工作，push = main fast-forward；回滚 = `git revert` 该批 commit 组（content + unit_minutes + fixture）。`.planning` 的 v1-original 仅本机（gitignored），回滚不依赖它（v1 在 git 历史）。 | critic Minor 11 / 14。 |

---

## §1 顺序

由 B1 生成 `docs/phase5/batch_order.md`（批 id、topic、单元、出题数、用语数、状态列）。前几批：technology-23-63（13 单元 → 3 批）、technology-23-62（7 → 2 批）、management-08-25（5）、strategy-01-02（15 → 3 批）…

---

## §2 每批固定流程（Task B8 循环）

1. 逐单元 `node scripts/textbook-v2-prep.mjs --unit <id>`（prep 一次一个单元）。
2. 用量检查（0-6）→ workflow 每次 **1 个单元一个 run**（`{unit, run_tag}`），同时最多 2 个 run；run_tag = ASCII `b<批序号>-<unit末尾>-a<attempt>[-r<重跑>]`，例 `b01-u04-a1`（符合 `^[A-Za-z0-9_-]{1,40}$`，每 run 新 tag）。结局按 0-2。
3. `merge --unit --journal …` `--write`：一般 = 最后一个 run 的 journal；JP seed run = 只需它自己的 journal；**loc seed run = `--journal <原 run> --journal <loc-seed run>`**（JP 行与其 PASS 审查在原 run 里）。 → validate / parity → `unit_minutes` 重建 + `--check` → v1 glosses fixture 自动追加（B4）→ vitest。
4. Rule A（0-5）→ 补丁（B3）→ 复审。
5. Gates 五项 + IPA 闸 + 本地 e2e 全量（本批 + 交互）。
6. 你确认（:3150 + 本批 Rule A 摘要 + 分钟数表 + 每单元 ja/zh/en × 1440/390 截图）→ push → 本番 smoke + 本批 e2e → `batch_order.md` 打勾（commit / attempt 数 / 每单元用量）+ 会话日志 + STATE。

---

## Tasks（前置）

### Task B1: 顺序表
- [x] `scripts/textbook-v2-batch-order.mjs` → `docs/phase5/batch_order.md`；测试：排序、拆批（>5 才拆、每批 ≤5）、合计 62 / 241 / 78 与重算一致。

### Task B2: unit_summary 审计（一次性）
- [x] 规则扫描 + agent 判定 241 单元 `unit_summary_*` 的制作メモ → 命中列表 → 走 B3 补丁（三语同改）。不改 prep / merge。（critic 实测规则命中 ≈ 0。）

### Task B3: merge 内的正式补丁工序（按 0-4）
- [x] `scripts/textbook-v2-patch.mjs`（登记 / 列出 / retire）+ merge 在 assemble 前重放；补丁存 `evidence/phase5/stage_07_ui/phase3/batch/patches/<unit>.json`。测试：before 不一致拒绝、after 已在跳过、base_sha256 不符拒绝、兼容字段与 est 随补丁变化、validate 通过。
- [x] 试点 3 单元登记为**冻结基线**（merge 后另经 lowfix `7de5fb5` 与 D-200 削减 `1cb8080`，journal 无法复现）：merge 对其 `--write` 拒绝并提示「冻结基线」；删除 merge.mjs 的 NOTE。测试：重 merge 试点 → 被拒绝。字符串补丁不表达数组元素删除；结构变更一律走 0-2 重生成。

### Task B4: 测试规模与钉点
- [x] 盘点钉在待重写单元上的测试（已知：`confirm.test.ts:89` 分布与 `:94` 锚点、`UnitReader.ssr.test.ts:56`、`normalize.test.ts` 的 strategy-01-02-u14、e2e `textbook.spec.ts` 的 management-11-28-u01 等）→ 改钉冻结 fixture 或改为独立重算。
- [x] 全语料 v2「顺序 / 无标记 / 辞典无标记」vitest SSR；e2e `textbook-v2.spec.ts` 的遍历改为 env `TEXTBOOK_E2E_UNITS`（默认 = 试点）。
- [x] merge `--write` 自动追加 v1 glosses 到 `__fixtures__/v2-units.v1terms.json`（已有则校验一致）。
- [x] v1 路径的最终去留（全部 v2 后）记为 B9 的决定项。

### Task B5: loc 种子改稿
- [x] workflow 支持 `seed_loc_part` + 其审查轮：只重写 zh/en，JP part 按 sha 原样复用；merge 用两个 journal（原 run + loc-seed run）识别。假 runtime 测试 + merge 双 journal 测试。

### Task B6: zh 译语表
- [x] 先输出 v1 `term_zh` 冲突清单（实测 4 个：MBO 同形异义 → 按单元区分；E-R図 写法差异 → 统一写法；デュアルシステム / デュプレックスシステム 在不同单元译法对调 = v1 误译 → 另立 OQ，因 `term_zh` 不变量要求等于 v1，修正需放宽不变量并重建 fixture）。`data/ip/textbook/zh_terms.json` 种子 = 无冲突的 v1 `term_zh` + 试点统一词（变更管理 等）；写入 localiser prompt；validate 增加 warn：jp 字段出现表中词时 zh 字段须含映射；表变更时对已上线单元跑该检查，命中走 B3。

### Task B7: copy 检查覆盖图与表
- [x] `copyIssues` 扩展到 fig label / caption / overview extra / pairs 的 JP 文字；测试。

### Task B8: 批量循环
- [ ] 按 §1 / §2 逐批；第 1 批后报告每单元实测用量与日历。strategy-01-02 前提议图表图种任务（0-8）。

### Task B9: 收尾
- [ ] Rule C 追加；D-195 最终版；v1 代码路径与 v1 快照测试的去留。

---

## 不在本计划内（另立任务 / OQ）
- 新图种（统计图表等，0-8 先提议）；辞典页显示 v2 图；工程图 N3（交叉边、同列虚活动）；试点 Rule A 未修 LOW 10 件；改单元标题 / 增删用语（§0-9 不变量）。
