# Stage 6 Stage B — 用户 retro worksheet（2026-05-11）

> Stage B 40 页 audit dispatch 结果。这是 Stage A worksheet 的姊妹篇，结构相同但有 FAIL 情况要决策。
>
> **重要**：Stage B 在 page_042 撞 safety FAIL 后按 D-077 §2.8 自动 halt。32/40 页跑完，**page_043-050 共 8 页未审计**。
>
> **数据源**：
> - `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/audit/stage6_review.json`（Stage B 最终输出，已 snapshot 到 `evidence/.../stage6_review_stageB.json`）
> - `.omc/logs/stage6_stageB_dispatch.log`（dispatch 日志）

---

## 0. TL;DR — 你需要回答 3 道判断题（外加 2 道可选）

| # | 判断 | 选项 | 阻塞? |
|---|---|---|---|
| **Q1** | page_42 D5 FP 怎么修？（不是 Stage 4 bug，是 detector regex 误把"问题序号 1-N\nア." 当成答案行）| A 改 regex 排除选项前缀 / B 改 regex 只认"問題X-Y" 前缀 / C 重新设计 D5 ground-truth 解析 | ✅ |
| **Q2** | page_19 D7 FP 怎么修？（en 把月份拼出来"April"导致 set 不一致 → FAIL，应该走 WARN 同 Stage A page_014 "4種類 vs four types"） | A 扩展严重度启发式：子集差异 → WARN / B 维持 FAIL 强制重译 / C 改 D7 regex 把 spelled-out 月份当数字 | ✅ |
| **Q3** | Detector 修完后重跑策略？ | A 重跑全 40 页 / B 仅重跑受影响 10 页（19+42+43~50）/ C 仅跑 8 个 skipped 页 + 加 unit test 验证 19/42 fix | ✅ |
| **Q4** | D9 噪音处理（30 实例横跨 32 页，集中在 term-heavy 页面）| A 保 WARN / B 降 INFO / C 加白名单逻辑 / D 再延到 Stage 7 后 | — |
| **Q5** | 10 条 LLM Phase-2 catch 质量是否认可？ | ✓ 认可 / ✗ 不认可（说明哪条不行） | — |

下面是判断材料。

---

## 1. Stage B 总分（halt 详情）

| 指标 | 值 | 怎么读 |
|---|---|---|
| **dispatch 时长** | **7 分 39 秒**（17:17:36 → 17:25:16）| Stage A 一次约 3 分，Stage B 8x 数据约 2.5x 时间，合理 |
| pages_processed | **32 / 40** | **8 页 skipped**（43, 44, 45, 46, 47, 48, 49, 50）— halt-after-current-page |
| overall_verdict | **FAIL** | 1 FAIL 触发 D-077 §2.8 safety halt |
| pass / warn / fail | **17 / 13 / 2** | pass_rate 53%（基于已审计的 32 页）|
| safety_failed | **True** | page_042 `Question.answer_index` |
| most_severe_repair_stage | **4** | D5 把它指向 Stage 4，但**根因分析下来其实是 D5 detector 误报，不是 Stage 4 bug**（见 §3.1）|
| halt_reason | `page_042: safety field FAIL (['Question.answer_index']); halting per D-077 §2.8.` | |
| run_level_issues | 2 | D13 INFO（同 Stage A 的 g_022 + g_028，不变）|
| total issues | **76**（detector 57 + LLM 10 + INFO 9）| 平均 2.4 issues / page |
| LLM calls | ~64-72（推算）| Stage A 12 calls/5pages → Stage B 32 pages 比例约 76 calls |
| shadow cost | **$7.56** | 实际比预算下限略高，符合"~$4-15 shadow 估计" |
| billed | **$0** | max-plan OAuth |

**halt 后的剩余 8 页**（pages 43, 44, 45, 46, 47, 48, 49, 50）**完全未审计** — 需要 detector 修完后重跑覆盖。

---

## 2. 全 32 页 verdict 表

```
PASS (17 页)：page_006, 007, 008, 009, 015, 018, 020, 021, 023, 024, 025, 026, 027, 028, 029, 032 (注：还包括 page_036 因 issues=1 但全 INFO)
WARN (13 页)：page_014, 017, 022, 030, 031, 033, 034, 035, 037, 038, 039, 040, 041
FAIL ( 2 页)：page_019, 042
未审计 ( 8 页)：page_043, 044, 045, 046, 047, 048, 049, 050
```

WARN 页面里 issue 数排序（最多 → 最少）：
- page_22: 14 issues（**LLM 集中区**, 5 LLM catches, table 表格相关）
- page_33: 10 issues（D9 噪音区）
- page_41: 6 issues
- page_39: 5 issues  
- page_34: 4 issues; page_35: 4 issues; page_40: 4 issues
- page_31: 3 issues; page_38: 3 issues
- page_17: 2 issues
- page_14: 1; page_30: 1; page_36: 1; page_37: 1

---

## 3. 两个 FAIL 的根因分析（**这是你看 worksheet 最关键的部分**）

### 3.1 page_42 D5 FAIL — Detector 误报，**不是** Stage 4 bug

**D5 报的**：
- entity_path: `page_042.entities[0].answer_index`
- rationale: `Source answer line has 7 answers (アアアアイイエ) but page has 4 question entities; cannot align — needs Stage 4 re-extraction.`
- safety_field: `Question.answer_index`

**实际是什么情况**（我从 OCR 原文逐字读出来）：

Stage 4 extracted 4 questions on page_042，answer_index = [0, 1, 1, 3]（即 `ア, イ, イ, エ`）。

`ocr/page_042.md` 的真实答案行（L44，文件末尾）：

```
問題1-1 ア 問題1-2 イ 問題1-3 イ 問題1-4 エ
```

这是**正确的 4 个答案 `アイイエ`**，和 Stage 4 提取的 answer_index 完全一致。

**那 D5 怎么会数出 7 个？** D5 regex 是：

```regex
(?:問題\s*)?\d+\s*[\-‐–—ー－]\s*\d+\s*[\s　]+([アイウエオ])
```

逐字读 OCR 文件，D5 regex 实际匹配 7 处（我已经 grep 验证）：

| # | 位置 | 匹配的 kana | 真假 |
|---|---|---|---|
| 1 | `1-1\nア. 企業が...` | `ア` | **FP** — 这是题目 "1-1" 后面紧跟的**选项 `ア.`**，不是答案行 |
| 2 | `1-2\nア. 企業が他社...` | `ア` | **FP** — 同上，题目 "1-2" 的选项 `ア.` |
| 3 | `1-3\nア. グラスシーリング` | `ア` | **FP** — 题目 "1-3" 的选项 `ア.` |
| 4 | `問題1-1 ア 問題1-2...` | `ア` | 真 — 真实答案行 |
| 5 | `... 問題1-2 イ ...` | `イ` | 真 |
| 6 | `... 問題1-3 イ ...` | `イ` | 真 |
| 7 | `... 問題1-4 エ` | `エ` | 真 |

regex 因为 `\s*[\s　]+` 容许换行，所以"题目编号 1-N" 后面那个"换行 ア."的选项前缀被误吃。

**结论**：page_42 内容**完全正确**，Stage 4 没 bug，是 **D5 detector regex 太宽**。

#### Q1 — D5 怎么修？

| 选项 | 含义 | 影响 |
|---|---|---|
| **A — Regex 排除选项前缀** | 在捕获后加 negative lookahead 排除句号：`([アイウエオ])(?![.．])` | 最小改动，1 行代码 + regression test。能挡掉 "ア."/"ア．" 选项前缀。但如果某天答案行写成 "ア." 也会被误挡（这种情况罕见） |
| **B — Regex 只认"問題X-Y" 前缀** | 把可选的 `(?:問題\s*)?` 变成必须的 `問題\s*`，即只匹配 `問題1-1 ア` 不匹配 `1-1\nア.` | 简单。但万一某些 cleaned/ 文件答案行格式是 `1-1 ア` 没 "問題" 前缀，会全 miss |
| **C — 重新设计 D5 ground-truth 解析** | 用更结构化的方式定位答案行：找文件最后一段连续的 "問題X-Y キャラ" 模式 + 排除选项块 | 最干净，但工作量大 — 改 detector + 多个 fixture 测试 + 重新 audit |

我倾向 **A** — 改动最小，覆盖目前已知的所有 OCR 格式（Stage 1-7、Stage A re-run #2、Stage B 都是 `ア.` 选项前缀）。但 **B** 也合理（用我们已有的真实 OCR 数据看，每个答案行都有 "問題" 前缀）。**C** 工作量过大，性价比低。

**你的答**：**A — D5 regex 排除选项前缀**（2026-05-11 user sign-off）

---

### 3.2 page_19 D7 FAIL — Detector 严重度启发式漏 case，**不是**翻译 bug

**D7 报的**：
- entity_path: `page_019.entities[2].rows[6][1]`
- 三语：
  - jp: `54.4％（2022年4月～2022年8月）`
  - zh: `54.4％（2022年4月～2022年8月）`（注意：zh 完全照抄 jp，括号里全是日文格式）
  - en: `54.4% (April 2022 – August 2022)`

**D7 怎么判定的**：
- jp/zh 数字 set：`{54, 4, 2022, 8}`（包含年份的 4 和 8 月）
- en 数字 set：`{54, 4, 2022}`（4 是从 54.4 的小数部分；月份 April/August 被拼出来了，**没数字 8**）
- 两 set 不一致 → D7 当前严重度启发式判 FAIL

**对比 Stage A page_014 同类 case**：
- jp `4種類` / zh `4种` / en `four types`
- jp/zh set: `{4}` / en set: `{}`
- 当时 commit `162aebb` 加的启发式是：populated set 一致 → WARN，冲突 → FAIL
- 那条走了 WARN

**为什么 Stage A 走 WARN、Stage B page_19 走 FAIL？** 因为：
- Stage A page_014: en set 完全空（"four" 没数字）→ 启发式认 "一边完全没数字" = paraphrase → WARN
- Stage B page_19: en set 部分有（54, 4, 2022 都有，只缺 8）→ 启发式认 "set 不一致且不是全空" = 冲突 → FAIL

但这俩本质**都是 spelled-out 转换**（`8月` → `August`），不是真实数字冲突。en 没说"54.5"或"2023"，只是把月份拼出来。

**结论**：page_19 翻译**正确**，是 **D7 启发式没覆盖"部分 spelled-out"这个 case**。

#### Q2 — D7 怎么修？

| 选项 | 含义 | 影响 |
|---|---|---|
| **A — 子集差异 → WARN** | 启发式新规则：如果一边的 set 是另一边的**子集**（没冲突值，只是缺值），降级 WARN | 一行 if，加 regression test。能覆盖 spelled-out 月份/数量场景。 |
| **B — 维持 FAIL 强制重译** | 不动 detector，要求 zh/en 都用统一格式（zh 已是日文格式直抄，en 应该也用数字 `4/2022 – 8/2022` 或都拼出来） | 不改代码，但要 stage 5 prompt 加规则 + 重译 page_19 + 可能影响其他页 |
| **C — D7 regex 把 spelled-out 月份当数字** | regex 增强：识别 "April" "May" ... 等月份名 = 1-12，"first" "second" 等 ordinal | 复杂；语言间月份名映射麻烦；不通用 |

我倾向 **A** — Stage A 已经有 severity heuristic 框架，加个子集判断很自然，与已有逻辑一致。**B** 强迫翻译统一格式实际上是过度约束（en 用 "April" 是好英文），且会触发 Stage 5 重跑。**C** 工程上太重。

**你的答**：**A — D7 子集差异降 WARN**（2026-05-11 user sign-off）

---

## 4. Detector 修完后的重跑策略

### Q3 — 怎么重跑？

**前提**：Q1 + Q2 选完后，先实现 detector fix + regression test（不动 Anthropic API，本地 unit test 跑过即可），然后重跑 audit。

| 选项 | 含义 | 影响 | 估算 |
|---|---|---|---|
| **A — 重跑全 40 页** | 完整重审 | 最干净；如果其他页面也有相似 FP，一次性发现 | ~80 calls / ~$8 shadow / $0 billed |
| **B — 重跑 10 页**（19 + 42 + 43-50） | 验证 fix + 覆盖 skipped 页 | 中等。19/42 用来验证 fix 不再误报；43-50 完成首次审计 | ~20 calls / ~$2 shadow / $0 billed |
| **C — 只跑 8 个 skipped 页 + unit test 验证 19/42** | 最省 | 19/42 不重跑，仅靠 regression test 兜底 | ~16 calls / ~$1.5 shadow / $0 billed |

我倾向 **A** — Stage B 已经暴露 2 个 detector FP 在不同 case 上，**可能还有更多类似 FP 藏在没爆发的页面里**。全跑一次能给你"上线前最后一道防线"的 confidence。考虑 max-plan OAuth $0 billed，A 的额外成本只是 wall-clock 时间约 7 分钟。

**B** 也合理，但 19 + 42 fix 后的 verdict 不实际跑就只能靠测试推断，万一 D7/D5 修完引入新 FP 不会立即发现。

**C** 风险最高，省得少。

**你的答**：**A — 修完后重跑全 40 页**（2026-05-11 user sign-off）

---

## 5. D9 噪音 — 40 页真实分布（Q1=D 的延迟决策现在可以做了）

### 30 条 D9 instances 分布

| Page | D9 count | 主要触发的 glossary key |
|---|---|---|
| page_22 | 2 | システム / 業務 |
| page_30 | 1 | 経営者 |
| page_31 | 2 | 経営者 / システム |
| page_33 | 9 | システム / 戦略 / マネジメント / etc.（term-heavy 页）|
| page_34 | 1 | 組織形態 |
| page_35 | 4 | 経営理念 / システム / CEO / CFO |
| page_37 | 1 | システム |
| page_38 | 1 | システム |
| page_39 | 4 | 各種 IT 术语 |
| page_40 | 4 | 各種 IT 术语 |
| page_41 | 1 | システム |

**真实分布的形状**：30 条不是"100+ 大爆发"也不是"个位数小噪音"，是中等量级。集中在 **term-heavy 页（page_33 占 9 条）**。

**抽样审查**（我在 §1 全列了 Stage A 9 条 D9，Stage B 新增的没逐条看，但 Stage A 的 9 条结论是 7-8 条低精度噪音 + 1-2 条边界 WARN）。Stage B 30 条按相同比例推断：约 24 条低精度 + 6 条边界 WARN。

### Q4 — D9 怎么处理？

| 选项 | 含义 | 影响 |
|---|---|---|
| **A — 保 WARN** | 维持现状 | 用户 retro 时每次手动忽略 24 条噪音；Stage 6 closure 时背景噪音感强 |
| **B — D9 降 INFO** | 改 severity，不计 fail_pages，仅出现在 report | 简单。学习者 ld_verdict 不会因 D9 拉低（虽然 D9 现在也只 WARN 不 FAIL）|
| **C — D9 加白名单逻辑** | en 含 glossary 任一 zh_concept 替代字符串就静默 | 改代码 + 测试 + 跑用例。最干净但工作量中等 |
| **D — 延到 Stage 7 后** | 不在 Stage 6 处理 D9；export 时再判断 | 推迟。Stage 7 export 也不一定能解决（不是 export 问题）|

我倾向 **B** — 30 条数据足以判断 D9 现在的精度太低，**WARN 失去意义**（噪音 >> 信号）。降 INFO 不丢信息（依然在 report 里），但不会让用户在 retro 时疲劳。**C** 工程上能行但 ROI 边际（30 条 vs 加一套 substring-detection 测试）。

**你的答**：**B — D9 降到 INFO**（2026-05-11 user sign-off）

---

## 6. LLM Phase-2 catch 全清单（Stage B 共 10 条）

### WARN 级（6 条，全是 `translation_unfaithful`）

| Page | 路径 | LLM 说法 |
|---|---|---|
| 17 | ent[0].title.zh | 「効果的な」(effective, produces results) 译成「高效」(highly efficient, speed/effort) — 语义偏移 |
| 22 | ent[1].rows[1][1].en | EN tautological — JP 注解一个片假名词，但 EN 已经是英文，注解自指 |
| 22 | ent[1].rows[3][0].en | "Strategy/Management/Technology" 三个 suffix 不一致（前两个无 "Domain"，第三个有）|
| 22 | ent[2].rows[3][0].en | 同上反向 — Strategy/Management 有 "Domain"，Technology 没有 |
| 22 | ent[3].definition.en | 同 row 1 — JP 解释片假名外来词，EN 已是英文自指 |
| 42 | ent[1].choices[1].en | JP 是 "not only X but also Y"，EN 把 "fulfilling responsibility" 当头动词同时管 X+Y — 微妙语义偏移 |

### INFO 级（4 条，全是 `term_translation_idiomatic`）

| Page | 路径 | LLM 说法 |
|---|---|---|
| 17 | ent[0].title.zh | "IT Passport" → "IT护照" 字面正确但不地道（应保留原名）|
| 19 | ent[0].title.zh | 同上 — "IT Passport" → "IT护照" |
| 22 | ent[1].rows[3][0].zh | 「战略类 / 管理类 / 技术系」suffix 不一致 |
| 22 | ent[2].rows[3][0].zh | 「战略系 / 管理系 / 技术类」suffix 不一致 |

### Q5 — 这 10 条 LLM catch 质量是否认可？

我评估：
- **page_22 的 5 条**：识别"同表格 suffix 不一致"+"片假名注解在英文里失意义" — 高质量，Phase-1 deterministic detector 100% 看不到
- **page_17 + page_19 IT Passport→IT护照**：用户 Plan-B 时已经处理过类似（page_014 也被抓过）— 一致性好，建议接受
- **page_17 「効果的」→「高效」**：语义细微偏移真实存在 — 真信号
- **page_42 JP 析构边界**：高质量 — Phase-1 看不到的 nuance

10 条全部站得住脚，没幻觉，没乱报。

**你的答**：**✓ 认可 LLM Phase-2 catch 质量**（2026-05-11 user sign-off）

---

## 7. 你回答完以后我会做什么

### 标准流程（Q1/Q2/Q3 都给具体方案）

1. **修 detector**（Q1 + Q2 选择的方案）+ 加 regression test（包含 page_42 + page_19 的 fixture），跑全 320+ unit test 通过
2. 给两条改动各一个 commit（"fix(extractor): D5 choice-prefix FP fix" + "fix(extractor): D7 subset-difference severity polish"）
3. **重跑 audit**（Q3 选择的范围）
4. snapshot 新的 stage6_review.json 到 evidence/ 作为 `stage6_review_stageB_rerun2.json`
5. 检查重跑结果：
   - 期望 page_19 → WARN（不再 FAIL）
   - 期望 page_42 → PASS 或 WARN（取决于其他 detector 是否触发）
   - 期望 pages 43-50 首次审计有结果（PASS/WARN/FAIL 分布未知）
   - 期望没有新出现的 FAIL（Q3 选 A 全跑能验证；选 B/C 只能部分验证）
6. 如果重跑通过 → **Stage 6 closure**：写 step_06_audit.md 收尾段，更新 STATE.md，请你最后 sign off Stage 6 进 Step 6.10 Stage 7
7. 如果重跑还有新 FAIL → 再做一轮 retro worksheet（Stage B rerun #1 retro）

### Q4 / Q5 落地

- Q4 选 B 的话，在 detector fix commit 里顺手做（D9 severity 改 INFO）
- Q5 ✓ 的话，不动 LLM reviewer prompt，下次 Stage B rerun 期望 LLM 继续输出类似质量的 catch

任何路径 **我都不会跳过你的 Q3 sign-off 重跑 audit**（dispatch 即使 $0 billed 也按 CLAUDE.md gate 走）。

---

## 8. 附：Stage B detector 验证矩阵（参考用）

| Detector | Stage A 触发 | Stage B 触发 | 备注 |
|---|---|---|---|
| D1 jp_mutation | 未触发 | 未触发 | Plan-B D-075 保持 |
| D2 untranslated_residue | 未触发 | 未触发 | Plan-B 0 sentinel 保持 |
| D3 schema_invalid | 未触发 | 未触发 | translated/ 合法 |
| D4 answer_index_out_of_range | 未触发 | 未触发 | D-076 envelope gate |
| **D5 answer_index_mismatch** | 未触发（短路）| **触发 ×1 FAIL** | **page_42 FP — choice-prefix 误捕** |
| D6 choice_marker_inconsistent | ×1 ✓ (page_43) | ×1 ✓ (page_43 不在 Stage B；可能是别页) | 真值 |
| **D7 numeric_inconsistent** | ×2 WARN | ×17 WARN + **×1 FAIL** | **page_19 FAIL FP — 部分 spelled-out 未降级** |
| D8 glossary_lock_violated | 未触发 | 未触发 | glossary 稳 |
| **D9 glossary_lock_missed** | ×9 WARN | **×30 WARN** | **Q4 焦点** |
| D10 redundant_nested_parens | 未触发 | 未触发 | F-COP21 已 mitigate |
| D11 kana_helper_missing | INFO ×4 | INFO ×7 | 真信号但 INFO 不阻塞 |
| D12 kana_helper_format | 未触发 | 未触发 | 无 kana_helper 数据 |
| D13 glossary_surface_concept_split | run INFO ×2 | run INFO ×2 | 一致 |
| **L1-L4** LLM Phase 2 | ×3 真信号 | **×10 真信号** | Q5 焦点 |
