# L4-d round C (quiz ・→•/、) — Rule D 独立审阅

> Reviewer: verifier lane（与 writer 不同 agent），2026-11-15 S157。只读审阅：除本文件外没有改动 tracked 文件（意外产物见末尾「附注」）。
> 审阅脚本在 scratchpad（mech.mjs / sample.mjs / show.mjs / inl.mjs / bul.mjs / kana.mjs / ja.mjs / base.mjs），不入库；复现所需的谓词和顺序写在 §1。

## 结论
**REQUEST_CHANGES：1 个 blocker（MEDIUM-1），只需窄范围复核。** 机械、完整性、baseline、门禁、测试全部通过；Rule A 抽检 30 件 29 件 OK、1 件 MEDIUM。MEDIUM-1 是本次改动新引入的问题，属于 check 1 点名的「嵌套列表歧义」，而且同一欄的 en 已经修过、zh 漏了，所以判为 blocker。修完只需复核那一欄和它在 baseline 中的那一行。

## 1. Rule A 语义抽检（N = 30）
- 抽样（复现方法）: 先取全部 EXACT 欄（15 条规则落在 13 个欄）。其余欄（exact 为空）按以下谓词分层：
  - `kana` = before 匹配 `/[ア-ン]・[ア-ン]/` 或 `/[a-dA-D]・[a-dA-D]/`（总体 11）；
  - `bulletOnly` = 非 kana 且 classes 全为 bullet（38）；
  - `inlineOnly` = 非 kana 且 classes 全为 inline（88）；
  - `mixed` = 非 kana 且两类都有（2）。
  - 用 mulberry32，**seed = 20261115**，按 kana 4 → bulletOnly 5 → inlineOnly 6 → mixed 2 的顺序，从各层（保持 l4d_quiz_apply.json 原顺序）不放回地抽，下标取 `floor(rnd()*len)`。
- 阅读方式: 短欄（< 450 字）读全文；长欄读每个改动点前后 ±50 字。stem 逐行对照 `stem_jp_clean`（ja.mjs）：#1-4 的 ja 是「保管方法，廃棄・返却予定日」（外层「，」，内层「・」，与 zh「、…/…」结构一致）；#18、#19、#22 以及 2016h28h-q051〔条件〕、2016h28h-q001 表格，ja 都是行首 ・，与 zh 的 • 逐行对应，二级缩进「　・」也保留。
- en 欄总体 5 个：2 个 EXACT 在样本中；另外 3 个（2016h28h-q001、2022r04-q079、2011h23a-q072，都只有行首 •）逐个看过。

| # | 层 | 欄 | 类 | 判定 |
|---|---|---|---|---|
| 1-4 | tr | 2014h26h-q085〜q088 stem zh | EXACT | OK「保管方法、预定销毁/退还日期」，外层 、 列中的对用 / |
| 5 | ex | 2010h22a-q010 correct zh | EXACT | OK「ASP/SaaS 型」 |
| 6 | ex | 2010h22a-q080 correct en | EXACT | OK「×, ○, ○」 |
| 7 | ex | 2010h22h-q061 p:0 zh | EXACT×3 | OK「（Why：…）」作标签分隔 |
| 8 | ex | 2012h24h-q090 p:0 zh | EXACT | OK 外层 、 中的「听课费/教材费/开课日」 |
| 9 | ex | 2013h25a-q003 p:1 en | EXACT | OK「Price-Earnings」 |
| 10 | ex | 2015h27a-q097 correct zh | EXACT | OK「ア、イ 为3个词，ウ、エ 为4个词」 |
| 11 | ex | 2016h28a-q082 correct zh | EXACT | OK「(数学35/英语85)」，与同文「(45/30)」一致 |
| 12 | ex | 2016h28a-q082 p:1 zh | EXACT | OK「B3、C3，D8 引用 B8、C8」 |
| 13 | ex | 2026r08-q032 p:1 zh | EXACT+文中 | OK「扩大规模并抢占份额」；「低价格、大批量销售」可读 |
| 14 | ex | 2011h23a-q073 d:ウ zh | 片假名列 | OK「ク、ラ、イ、ア、ン、ト、サ、ー、バ」，「ー」保留正确 |
| 15 | ex | 2019r01a-q049 p:1 zh | 选项记号 | OK「瀑布型（ア、ウ）」 |
| 16 | ex | 2010h22a-q072 correct zh | 记号列 | OK「A、B、C、D」「1、2、3、4」 |
| 17 | ex | 2011h23a-q073 d:イ zh | 片假名列 | OK |
| 18 | tr | 2013h25a-q087 stem zh | 行首 | OK，前提条件 2 项 •，ja 同为行首 ・ |
| 19 | tr | 2011h23tokubetsu-q097 stem zh | 行首 | OK，二级「　•」保留 |
| 20 | ex | 2012h24a-q097 correct zh | 行首 | OK |
| 21 | ex | 2011h23a-q092 correct zh | 行首 | OK |
| 22 | tr | 2019h31h-q058 stem zh | 行首 | OK〔网络结构〕4 项 |
| 23 | ex | 2010h22a-q036 p:0 zh | 文中 | OK「预备调查、正式调查」 |
| 24 | ex | 2026r08-q032 d:ア zh | 文中 | OK |
| 25 | ex | 2017h29a-q092 p:0 zh | 文中 | OK「R（读取）、W（写入）、X（执行）」 |
| 26 | ex | 2013h25a-q003 p:1 zh | 文中 | **MEDIUM-1**「(Equity / Assets / Price、Earnings)」 |
| 27 | ex | 2021r03-q041 d:イ zh | 文中 | OK（可读；与外层子句的 、 同级，归入 LOW-1） |
| 28 | ex | 2009h21h-q086 p:0 zh | 文中 | OK「（真实性、防抵赖）」 |
| 29 | ex | 2012h24a-q094 correct zh | 混合 | OK，行首 • 加「白10、黑15」 |
| 30 | ex | 2012h24h-q092 correct zh | 混合 | OK「•文京花子（会员、课程Ｑ）」 |

（#1-4 是 4 件，表中合并成一行。EXACT 13 + 随机 17 = 30 件：OK 29，MEDIUM 1。）

### 补充全量扫描（针对抽检发现的类型，不是抽样）
- kana 层 11 欄全部读过（kana.mjs）：都是片假名逐字拆分（2011h23a-q073 的 4 欄）、选项记号（ア、ウ、エ 等）或拉丁记号/型号列（A、B、C、D；SSD、SD；CD、DVD；MO、MD），没有片假名复合专名被拆开。
- 242 处文中改动：落在 `[[…]]`（含 `[[jp:…]]`）里的 **0**，改动欄里根本没有 `[[`；两侧都是 ≥2 个假名的 **0**。所以不存在「zh 里引用的日语专名中的 ・ 被改掉」的情况。
- 两侧都是拉丁字母的 16 处、所在子句已含「、」的 4 处，全部人工看过（inl.mjs），结论见 MEDIUM-1 / LOW-1 / LOW-2。
- 行首 156 处按上下文分类：换行 125 / 换行+缩进 12 / 表格 `|` 8 / `<br>` 10 / 〔条件〕后 1，非纯换行的 31 处逐一看过（bul.mjs）。表格单元格中的 • 在 HTML 表格里渲染，不存在等宽对齐问题；流程图（2009h21h-q091、2022r04-q079）的缩进保留。

## 2. 完整性
- 两个 sidecar 的 zh / en 叶子里剩余的 ・：**0**。剩下的 ・ 都在 ja 层（`stem_jp_clean` 98、`jp` 8141、`note_jp` 2301）。
- `git diff --numstat`（translations + explanations）：45 个文件，**+152 / −152 行**，改动行全是 `"zh":` / `"en":` 行。因此 ja、`jp`、`key_guard`、其他键按字节不变。
- 叶子级 diff（mech.mjs）：改动叶子 152 = 计划 152；每处 HEAD 值 = 计划的 before，工作区值 = 计划的 after；计划外改动 0。
- 应用代码里没有按 ・ 解析 quiz 题面的逻辑。仅 textbook validateV2 和 sensei termMatch 的字符类里出现 ・，与 quiz zh/en 无关。

## 3. 机制
- 重建后的 explanations sidecar 与 HEAD 的差异只在计划欄（26 回 113 欄；translations 19 文件 39 欄）。
- `.phase2`：80 个受影响题的 correct / distractors / points 的 zh、en 全文（960 个值）与 sidecar 逐一相等，数组长度也相等。`.phase1/tr_*`：报告中 fixed 的 13 欄重读，确认 = after；differs 的 26 欄未改动。
- `scripts/l4d-quiz-apply.ts` 审阅：
  - isBullet `/(^|\n|<br>|\|)[ 　]*$/` 作用于 `s.slice(0,i)`。没有 m flag，`^` 只匹配串首，行首由 `\n` 分支覆盖，正确。`〔[^〕]*〕 $` 只接受 1 个半角空格，是窄口特例，实际命中 1 处，正确。
  - en 遇到非行首、又没有 EXACT 的 ・ 时直接 throw，保护有效。
  - EXACT：要求 `from` 恰好出现 1 次，未用到的规则会 throw。不变量检查把 before 中的 `from`、after 中的 `to` 都替换成 \0 再逐字比较。`a.replace(to)` 取 after 中 `to` 的第一次出现，若同文更早处也有 `to` 文本会错位，但只会误报 throw，不会误放行（fail-safe）。
  - merge 先复现：每个受影响回先跑一次 merge，与 committed sidecar 不按字节一致就恢复并 throw；写入后再逐回比对「before + 计划欄 = 重建结果」。逻辑正确。
  - 问题见 LOW-3。

## 4. Fidelity baseline
用 base.mjs 比较 `git show HEAD:…/baseline.jsonl` 与工作区：行数 8700 = 8700，键对齐无偏差；变化字段 **152**、行 **118**、ja 行 **0**。按 stem→stemTr、c:X→choicesTr[i]、correct→explCorrect、d:X→explDistractors、p:i→points[i] 映射到计划欄后，多 0、少 0，与 writer 所述一致。

## 5. 门禁与测试（本次新跑）
- `node --no-warnings scripts/lang-leak-scan.ts --gate` → `lang-leak gate: PASS`，exit 0（508 entries，allowed 653）。
- `node --no-warnings scripts/l5-build-allowlist.ts`（dry run）→ `claimed 653 → 508 entries, unclaimed 0, new claims 0, dropped 0`，exit 0。
- `cd apps/web && npx vitest run src/components/practice` → 10 files / 104 tests passed。
- punct-only：按 L5_scan.json 拆分，共 64 = textbook-units「・」58 + quiz-explanations「ー」6（全在 2011h23a-q073 d:ウ/エ 的 zh/en），与 l4d_C.md 的「437 → 64」一致。gate 摘要行里的「punct-only 58」是另一种口径（推测是扣掉已被允许的 6 处后的数，未核实）。
- lang-allow.json 的 quiz 部分 diff 只涉及 2011h23a-q073（+25 / −15 行，全部 category question-data：原来用「・」连成一段的片假名命中拆成了单字），与 l4d_C.md 一致。另有 4 行属于 messages（round A/B 的范围，本审阅不涉及）。
- Build / type check / e2e：未运行。指示不让碰 apps/web/out，而且本次改动只有数据和一个独立的 node 脚本。

## 发现
- **MEDIUM-1（blocker）— 2013h25a-q003 p:1 zh「(Equity / Assets / Price、Earnings)」**：`Price・Earnings` 是 PER 一个指标的英文名，括号内各项用「 / 」分隔。改成 、 后读起来像 Price、Earnings 是两项，正是 EXACT 要排除的嵌套列表歧义。同一欄的 en 已经用 EXACT 改成「Price-Earnings」，zh 和 en 现在不一致。
  - 修法：当前树上**不能**加 EXACT 后重跑 `--apply`。zh/en 里已经没有 ・，新规则会以 "EXACT rule not used" throw；`.phase2` 已是 after、又 gitignored，没法从 git 还原。可行的做法：直接改 `data/ip/quiz/.phase2/expl_tr_2013h25a-q003.json` 的 points[1].zh，把「Price、Earnings」改成「Price-Earnings」（或「Price/Earnings」）→ `node scripts/quiz-phase2-merge.mjs 2013h25a` → 确认 sidecar 相对 HEAD 只有这一欄不同 → 用 `CAPTURE_BASELINE=1` 重取 baseline。baseline 的变化仍是 152 欄（这一欄本来就在其中，只是值再变一次）。最后同步 l4d_quiz_apply.json 里这一欄的 after，以及 l4d_C.md 的 EXACT 数（15 → 16）。
- **LOW-1 — 嵌套 、（同一类，可读）**：2011h23tokubetsu-q067 d:イ「加减乘除等算术运算、AND、OR、NOT 等逻辑运算以及…」、2021r03-q041 d:イ「着眼于处理的流程、用顺序、选择、循环这些控制结构…、并…」、2011h23tokubetsu-q057「…汇总起来的分散处理、并行处理思路」。内层并列和外层的子句/列表都用 、，有「等逻辑运算」「这些控制结构」等词收束，读得通。若按 writer 自己的 EXACT 标准，q067 可以写成「AND/OR/NOT」，其余两处不必改。
- **LOW-2 — 同题写法不一**：2010h22a-q010 correct 是「ASP/SaaS 型」（EXACT），p:1 是「（ASP、SaaS 形态）」。两种写法单看都没错。2024r06-q011 p:1「/ ISMS、ISO/IEC 27001（信息安全）/」是同一事物的两个名字放在「/」列表里，可以接受。
- **LOW-3 — 脚本**：(a) `--apply` 不是原子的，依次写 .phase2 → translations → .phase1 → merge，step 4 失败时不回滚；(b) 不能在 apply 之后再跑一次（见 MEDIUM-1 的修法），后续修正只能手工改 .phase2；(c) .phase1/.phase2 的缩进只识别 2 或 0。本次运行事后核对全部一致，没有实际影响。

## 附注（审阅过程中的意外产物）
为了查 punct-only 的拆分，审阅时不带 `--gate` 跑了一次 `lang-leak-scan.ts`，生成了**未跟踪**的 `evidence/phase5/hosting/L5_scan.json` 和 `L5_scan.md`（23:15 生成；审阅开始时的 git status 里没有它们）。evidence/ 下的文件没有授权不删，所以保留着，交给主线决定删除还是忽略。tracked 文件没有受影响。

## 再審（fix2：scripts/l4d-quiz-fix2.ts / l4d_quiz_fix2.json）— **PASS**
复核对象：3 欄 zh——2013h25a-q003 p:1「Price-Earnings」、2011h23tokubetsu-q067 d:イ「AND/OR/NOT 等逻辑运算」、2010h22a-q010 p:1「（ASP/SaaS 形态）」。三处用词都正确，MEDIUM-1 和 LOW-1（q067）、LOW-2 已解决。
- sidecar vs HEAD：先用 fix2 的 after 覆盖计划中这 3 欄的值（3 欄的 fix2 before 都等于原 apply 的 after），再跑叶子级 diff。改动叶子 152 = 计划 152，值全部相符，计划外改动 0，问题列表为空。`git diff --numstat` 仍是 45 个文件、+152 / −152 行，非 zh/en 的改动行 0 → ja / key_guard 按字节不变。zh/en 剩余 ・ 仍为 0。
- `.phase2` == sidecar：这 3 题的 correct / distractors / points 的 zh、en 全部相等（jp 不在 .phase2 里，不比）。113 个计划欄的 .phase2 值都等于（覆盖后的）after。
- baseline vs HEAD：8700 行，变化字段 152 / 行 118 / ja 行 0，与计划对照多 0、少 0。这 3 行的 hash 是否已换成新文本，由 `fidelity.test.ts` 证明：它把 2900 题 × ja/zh/en 全部渲染后和 baseline 逐字段比较，要求 0 差异，结果 5/5 通过；practice 共 10 files / 104 tests passed。
- `lang-leak-scan.ts --gate` PASS（exit 0）；`l5-build-allowlist.ts` dry run 为 unclaimed 0 / new 0 / dropped 0。
- 剩余（LOW，不阻塞）：`l4d_quiz_apply.json` 中这 3 欄的 `after` 仍是旧值，最终值记在 `l4d_quiz_fix2.json`。建议在 l4d_C.md 中注明「最终值 = apply + fix2」，或同步改 apply.json。另外，`L5_scan.json/.md` 这两个未跟踪文件（本审阅意外生成，见附注）仍在，留给主线处理。
