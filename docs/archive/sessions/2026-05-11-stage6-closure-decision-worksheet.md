# Stage 6 closure decision worksheet（2026-05-11）

> Stage B rerun #2 跑完，detector fix 已验证生效。剩下一个真实的翻译幻觉 FAIL — 是 Stage 6 LLM Phase-2 reviewer **设计目标** 抓的那种 case。
>
> **目的**：决定 Stage 6 怎么收尾。比 Stage A/B retro 短，只有 1 道判断题。
>
> **数据源**：
> - `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/audit/stage6_review.json`（最新 rerun #2 输出）
> - `evidence/.../stage6_review_stageB_rerun2.json`（永久存档 133KB）
> - `.omc/logs/stage6_stageB_rerun2_dispatch.log`

---

## 0. TL;DR — 你只需要回答 1 道判断题

| # | 判断 | 选项 |
|---|---|---|
| **Q1** | 剩下 1 个真 FAIL（page_22 翻译幻觉）怎么处理？ | A 接受现状文档化 / **B 修这一处后再 audit 一次** / C Plan-C 大修（FAIL + 部分 WARN） |

详细背景见下面。

---

## 1. Stage B rerun #2 结果

| 指标 | rerun #1 (halted) | rerun #2 (after detector fix) | Δ |
|---|---|---|---|
| pages_processed | 32 / 40 | **40 / 40** | ✅ 全覆盖 |
| safety_failed | True (page_42) | **False** | ✅ D5 fix 验证 |
| halt_reason | page_42 safety FAIL | None | ✅ 不再 halt |
| overall | FAIL | FAIL | — |
| pass / warn / fail | 17 / 13 / 2 | **21 / 18 / 1** | +4 PASS, -1 FAIL |
| most_severe_repair_stage | 4 | **5** | ✅ 不再指向上游 Stage 4 |
| cost_shadow | $7.56 | **$10.95** | rerun #2 一次 |
| billed | $0 | $0 | max plan OAuth |
| wall-clock | 7m39s | 11m17s | 40 vs 32 页正常比例 |

### Detector fix 三件套全部验证生效

| Fix | 前 | 后 | 状态 |
|---|---|---|---|
| D5 regex（排除选项前缀）| page_42 SAFETY FAIL | page_42 → WARN（D6 choice_marker 真信号，rs=7）| ✅ |
| D7 子集差异 → WARN | page_19 FAIL | page_19 → WARN | ✅ |
| D9 WARN → INFO | 30 实例污染 verdict | 30 实例全 INFO，不再降 verdict | ✅ |

---

## 2. 剩下的 1 个 FAIL — page_22 翻译幻觉（LLM 真信号）

### 实际数据（我从 `translated/page_022.json` 现读）

`entities[2]`（"分野ごとの出題内容" 表格，4 行 × 2 列）

`row[1]`（ストラテジ系/战略系/Strategy Domain）`col[1]`（详细内容）：

```
jp: ・企業と法務
    ・経営戦略
    ・システム戦略

zh: ・企业与法务
    ・经营战略
    ・系统战略

en: - Corporate Activities and Legal Affairs    ← ★ "Activities" 是凭空加的
    - Management Strategy
    - System Strategy
```

### LLM 的判断

```
[llm/FAIL/rs=5] translation_hallucination
path: page_022.entities[2].rows[1][1].en
rationale: JP source is 「企業」 (enterprises/companies); EN adds the noun 'Activities'
           that is not in the source — the previous table did contain 「企業活動」
           but this syllabus row does not.
```

### 这是不是真问题？

**是**。jp 是「企業と法務」（"Corporate AND Legal Affairs" — 两个并列项），en 把它译成 "**Corporate Activities** and Legal Affairs"，凭空加了 "Activities"。

zh 处理正确（"企业与法务"）。

**怎么发生的**：Stage 5 译者大概率受同页前面表格里出现的「企業活動」(Corporate Activities) 影响，把这个 row 也按"企业活动"翻译了。属于跨 entity 的 context bleed-in 类幻觉。

**Phase-1 deterministic detector 100% 抓不到**（语义类问题），必须 LLM 才能识别。

---

## 3. 也顺便看：rerun #2 的 12 个 LLM Phase-2 catches

| Page | 严重度 | 类型 | 简述 |
|---|---|---|---|
| 17 | WARN | translation_unfaithful | 「効果的」→「高效」语感偏移（应为「有效」）|
| 19 | INFO | term_translation_idiomatic | 「考试会场」直译生硬 |
| 19 | INFO | term_translation_idiomatic | 「实施时期」直译生硬 |
| **22** | **FAIL** | **translation_hallucination** | **★ "Activities" 凭空加** |
| 22 | WARN | translation_unfaithful | "Strategy is Strategy" 同义循环（ストラテジ→Strategy 后注解失意义）|
| 22 | WARN | translation_unfaithful | 同上 entity[3].definition |
| 22 | WARN | translation_unfaithful | "Strategy/Management" 无 Domain 后缀 vs "Technology Domain" 有 |
| 22 | WARN | translation_unfaithful | 同上反向（entity[2] row[3]）|
| 22 | INFO | term_translation_idiomatic | 「仕組み→原理」可改「工作原理」更地道 |
| 33 | INFO | term_translation_idiomatic | 「活跃舞台」中文搭配生硬 |
| 38 | WARN | translation_unfaithful | EN 循环定义（同 Stage A 抓过的 case，复现）|
| 50 | INFO | term_translation_idiomatic | 「重量不重质」歧义解析 |

**注意**：你 Q2 已认可 LLM v1.0 prompt，这 12 条都是该 prompt 的正常产出。

**注意 2**：Stage B rerun #1（halted）没抓到 page_22 这个 FAIL，rerun #2 抓到了。LLM 即使 temperature=0 + tool_use forced，跨 chunk 仍有轻微 variance。两次都没出现幻想式 FAIL（LLM 自己 hallucinate），所以 variance 是"漏没漏"层面不是"假阳"层面，可接受。

---

## 4. Q1 — 1 个 FAIL 怎么处理？

| 选项 | 含义 | 工作量 | 影响 |
|---|---|---|---|
| **A — 接受现状 + 文档化** | 把 page_022 entity[2] row[1][1] en 列入 known issues，Stage 6 closure 时记入 `step_06_audit.md`，留给 Stage 7 export 阶段或将来 Stage 5 prompt 改进时处理 | 0 工作量 | Stage 7 export 时如果你想 release 这 40 页，会带着一个已知 EN 幻觉发布 |
| **B — 改这一处 + 再 audit 一次**（**我倾向**）| 手工编辑 `translated/page_022.json` 的 entities[2].rows[1][1].en，把 "Corporate Activities and Legal Affairs" 改成 "Corporate and Legal Affairs"（去掉 Activities）。然后重跑 audit，期望 0 FAIL。 | ~5 分钟手工 + 1 次 audit dispatch（~$11 shadow / $0 billed）| Stage 6 closure 时干净 — 0 FAIL，可以直接进 Step 6.10 Stage 7 export |
| **C — Plan-C 大修** | 修 FAIL 加上几条高价值 WARN（比如 page_17 効果的→高效、page_22 tautology、page_38 循环 EN、page_22 suffix 不一致）一起手工调，然后再 audit | ~15-30 分钟手工 + 1 次 audit dispatch | 最干净但工作量翻倍；与 Plan-B 类似的精修风格 |

### 我推荐 B 的理由

1. **FAIL 必须修**：你的 quality-over-cost feedback memory 明确"优质优先"。FAIL 级别留在 release 里就是不优质。
2. **WARN 留给 Stage 7 export 更经济**：D6 choice_marker 已经 tag 了 `rs=7`，Stage 7 export 阶段会规范化 marker。其他 WARN 多半是 Stage 5 prompt 改进项（不是单页 hand-fix 范围）。
3. **C 容易陷入"完美主义"**：12 条 WARN 全修后还会有第 13 条出现，无穷无尽。Plan-B 的教训是"分清楚 FAIL 必修 vs WARN 文档化"。

### 但你也可以选 A 或 C

- **A** 合理：如果你想优先推进 Step 6.10 Stage 7 export，把 page_22 这条作为 known issue 写进 evidence 即可。Stage 7 export 时如果加上幻觉校验逻辑也能拦下来。
- **C** 合理：如果你想严格"零 FAIL + 主要 WARN 一并修"再进 Stage 7，C 是更高质量的路径。Plan-B 就是这种风格。

**你的答**：**B — 手工编辑 + 再 audit 一次**（2026-05-11 user sign-off; user 已自行完成 hand-edit, page_022 entity[2].rows[1][1].en 现为 `"- Corporate and Legal Affairs\n- Management Strategy\n- System Strategy"`）

---

## 5. 你回答完以后我会做什么

### 如果 Q1 = A

1. 把 page_22 FAIL 列入 `evidence/.../step_06_audit.md` § "Known issues carried over to Stage 7"
2. 写 Stage 6 closure summary 进 `step_06_audit.md`（per Tier 3 evidence 规则）
3. 更新 STATE.md：Step 6.9 ✅，准备 Step 6.10
4. **请你最后 sign off Stage 6 closure**

### 如果 Q1 = B

1. 手工编辑 `translated/page_022.json` entities[2].rows[1][1].en（移除 "Activities"）
2. 记录人工编辑到 `evidence/.../step_06_audit.md` § "Stage 5 manual fixes during Stage 6 closure"
3. 再发一次 audit-trilingual（你已默认授权 quality > cost，可以发 rerun #3）
4. 期望 0 FAIL → 写 Stage 6 closure
5. 如果 rerun #3 还有新 FAIL → 另开一份 closure worksheet

### 如果 Q1 = C

1. 我先开列 "要修的 WARN list"（page_17 + page_22 tautology + page_22 suffix + page_38 + 其它你点名的）给你确认范围
2. 范围 OK 后批量手工编辑 translated/*.json
3. 同样记录人工编辑 + 发 audit rerun
4. 期望 ≤ 2 FAIL + 多 PASS
5. 决定是否再循环或闭合

---

## 6. 累计成本（截至此刻）

| 项 | shadow | 实际 billed |
|---|---|---|
| Stage 1 (Mistral OCR) | — | $0.05 |
| Stage 2-5 + Plan-B | $47.44 | $0 |
| Stage 6 Stage A (3 dispatches) | $8.42 | $0 |
| Stage 6 Stage B (halted) | $7.56 | $0 |
| Stage 6 Stage B rerun #2 (after fix) | $10.95 | $0 |
| **Cumulative dry-run** | **$74.37** | **$0.05 Mistral + $0 Anthropic** |

按 $999 cap 还远没到约束（per D-077 §2.9 quality-over-cost feedback）。

---

## 7. 附：Detector 矩阵 + LLM Phase-2 表现总评

| Detector / 模块 | Stage A | Stage B rerun #1 (halt) | Stage B rerun #2 (after fix) | 总评 |
|---|---|---|---|---|
| D5 answer_index_mismatch | 0 触发（短路）| **1 FAIL FP (page_42)** | 0 触发 ✅ | regex fix 验证 |
| D6 choice_marker_inconsistent | 1 ✓ (page_43) | 1 ✓ (page_43) | 3 ✓ (page_42/43/44) | 多页真信号 |
| D7 numeric_inconsistent | 2 WARN | 17 WARN + **1 FAIL FP (page_19)** | 22 WARN | 子集差异 fix 验证 |
| D9 glossary_lock_missed | 9 WARN | 30 WARN（噪音）| 30 INFO ✅ | 降级生效 |
| D11 kana_helper_missing | 4 INFO | 7 INFO | 11 INFO | 真信号但 INFO 不阻塞 |
| D13 run-level | 2 INFO | 2 INFO | 2 INFO | 一致 |
| LLM L1 hallucination | 0 | 0 | **1 ✓ (page_22 真信号)** | **rerun #2 才抓到 — LLM variance** |
| LLM L3 unfaithful | 1 | 6 | 6 | 多重 catch 真信号 |
| LLM L4 idiomatic | 1 | 4 | 5 | 风格建议 |
