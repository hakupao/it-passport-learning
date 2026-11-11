# L4-b / L4-c 提案の独立審査 (Rule D / Rule A)

- 日付 2026-11-11 (S154)。审查者 = oh-my-claudecode:critic (opus)，与书写者 (oh-my-claudecode:executor) 不同 subagent_type。只读：未改 data/ip/**、messages、units、补丁、脚本；未 commit。
- 对象：`L4_proposal.md`、`L4b_wordlist.md`、`L4b_hits.json`、`L4c_hooks.json`、`L3_audit.md`，以及 session-154 的 D-221 / D-222。
- 样本与逐条判定：`L4_review_samples.json`（种子、ID、判定、修正）。

## 结论：**APPROVE-WITH-CHANGES**

LEAK 的判定本身可靠（随机 36/36 确为日语混入），扫描器、验证器、两条修正路径的前提都核对过并且成立。但有 3 处会改变或破坏意思的置换（担当者→负责人 的「其他」家族、作成者→编写者、L4-c zh 中把中文词的字标成日语），必须先改再施工。D-222 第 1、3 条按现在的写法不能直接执行。

**本结论覆盖的范围（重要）**
- **可以按提案直接施工**：正解 113、2010h22a-q087 改名 47（+ 本审查新增的 取入→引入 2）、立案 19、正答率 9、结合测试 7、系统要件 5、实装 3、案件 7、检讨 4、责任者 3、提携 2、利用者 1（B0457）、不正竞争防止法 1、報告 1、2014h26a 担当者 48（+ 会计负责人→财务负责人 4）、textbook 担当人员 5、2012h24a-q052 B0398；L4-c 的 en 74 hook；L4-c zh 中「kana / 日本字形」类的标签（109 个）。
- **必须改完后再交 Rule D 复审（不在本次批准内）**：H-1 的 6 处与 2023r05-q007 选项エ、H-2 的 作成者 8 处、L4-c zh 的 75 个非字形类标签（全读）与 サブロク 重做、D-222 第 3 条的 指摘 23 + 试作 38、个人番号 49（连同 zh_terms / term_zh / fixture）、其余 UNSURE 的处置。这些替换词有一部分是审查者提出的，不能由审查者自己批准（Rule D）。

## 已独立核实（成立）

| 项 | 方法 | 结果 |
|---|---|---|
| L4-c 验证器 | 读 `scripts/l4-hooks.ts` 195–305、`apps/web/src/lib/textbook/inline.ts` 的 `stripInline` / `compatText` / `inlineErrors`、`apps/web/src/lib/textbook/validateV2.ts` 356–445（jp-origin）、`scripts/lib/textbook-v2.mjs` 647 `zhNorm` / 728 `zhTermWarnings` | strip / compat / inline 检查、`validateUnit` 前后差分、`applyPatches→assemble→applyUnitPatches` 重放、窗口唯一性，实现与提案描述一致。jp-origin 只看 考点 的 text_zh/en（不看 hook）✓。`zhNorm` 把 `[[jp:…]]` 连内容一起删掉 → B6 zh-term WARN +2 的解释成立 ✓。注意：这些只证明「只加了标记」，不证明标得对不对（见 H-3） |
| L3 对账 | 读 `L3_audit.md` Task C / 表 | 现有带印 hook 155 ✓、en 当たり 75 ✓、zh 下限 ≈97 (34+63) ✓；提案 zh 125 ≥ 97，en 75 = 75，一致 |
| quiz 解说路径 (`.phase2` → re-merge) | 受影响 28 个试验回的全部题目，sidecar 与 `.phase2/expl_tr_*` 的 zh/en 全字段比较 + `expl_jp_*.correct_jp` | 比较的 33,632 个 zh/en 字段差 0、correct_jp 差 0。**未比较** distractors_jp / points_jp / `key_guard`（D-143 note 在这里；merge 脚本头注说 key_guard 取自 workflow 的 StructuredOutput）→ 只能说 zh/en 层不会带进别的改动。**闸门（必须）**：每个试验回 merge dry-run，diff 只允许出现在目标字段，且既有 key_guard.note_jp 不丢 |
| 置换可施工性 | 在内存里对 sidecar 依次应用全部 275 个 quiz LEAK 置换 | 每个 `before` 在当时都恰好出现 1 次（0 件跳过）。2010h22a-q087 改后 社员/部署 残留 0（部门 26、员工 21，与 hits 47 一致） |
| D-189 标签 | `git show 70978b70` | UI 的「正解」(Practice.correct / Mock.colKey) 确在三语共通日语标签表内 → OK 判定正确 |
| 术语登记 | `data/ip/textbook/zh_terms.json` | 不正競争防止法=反不正当竞争法 ✓、統合テスト=集成测试 ✓、機能要件=功能性需求 ✓（结合测试→集成测试、系统要件→系统需求 与登记一致）。利害関係者=利害关系者（登记即如此）。D-175 只涉及 双重/双工系统，与本批无关 |

## 精度

| 样本 | 数 | 结果 |
|---|---|---|
| L4-b LEAK 随机（分层，每个语群 ≥1） | 36 | 确为混入 **36/36 (100%)**；置换正确 **35/36**（错：B0187 作成者） |
| L4-b LEAK 定向全读（不计入随机精度） | 担当「其他」12 + 作成者 7 + 利用者 2 | 担当其他 12 中 **5 处置换错 + 1 处应改进**；作成者 **7/7 目标词错**；利用者 1 处应保留。全体 290 条中约 14 条要改 → 置换正确率约 95% |
| L4-b UNSURE（D-222 第 3 条） | 20 | 改 12 / 留 8（见下表） |
| L4-b OK | 10 | **10/10 确为 OK**（漏判 0）；B0547「单元测试（单体测试）」括号内是日语的简体化，LOW |
| L4-c zh 随机 | 20 | 正确 17；明确多标 1（疫）；边界 1（率，LOW）；1 待按 D-222.7 重做（サブロク） |
| L4-c en 随机 | 10 | **10/10** |
| L4-c §4-7 列出的 hook（8 单元全部 hook） | 21 | D-222.8 的 6 句 **0/6 可原样采用**（5 多标/不一致 + 1 漏标）；帰無 2 句按 D-222.6 不标，成立 |

## 发现

### HIGH

**H-1 担当者→负责人 在「其他」家族与同一字段里已有的 负责人 (= 責任者) 冲突，改后意思错误或自相矛盾。**（随机样本没有抽到，是定向全读发现的；这个家族需要全读，本审查已读完 12 条）
- 2011h23tokubetsu-q036 イ：改后为「…经过负责人的评审和批准…而不是由**负责人**自行修改」——前后矛盾。ja 的 担当者 = テスト担当者，选项本身用「测试人员」→ B0386、B0387、B0388 都应改为 **测试人员**（points[1] 的 en 也是 "a tester"）。
- 2023r05-q007 エ：题目问 責任者（负责人）。改后为「系统规划负责人是…规划制定的**负责人**，…作为负责人并不适当」——自相矛盾。应为「…承担规划制定工作的**实务人员**」。另外选项エ的译文「系统规划负责人」本身就是误译（ja システム企画担当者，en "staff member"），会把错误选项译得像正确答案 → 一并改为「系统规划人员」。该题 zh 中「系统规划负责人」共 **2 处**（translations 选项エ 1 + 解说 distractors.エ 开头 1），必须同时改（扫描器不会发现，因为里面没有「担当」）。
- 同类检查：责任者→负责人 的 2022r04-q015 两字段已全文读过，没有同字段冲突，可以照提案。
- 2025r07-q052 エ：改后「质量管理负责人是受托方的质量管理负责人」同语反复 → **质量管理人员**。
- 2010h22a-q010 ウ（B0292）「IT 运维担当」→ 建议 **IT 运维人员**（选项イ/エ 已用 负责人 表示 責任者）。

**H-2 作成者姓名 → 编写者姓名 的目标词错。** 2013h25a q094–q096 共通题文表 1 写的是「编制者姓名」，而选项就是要和这个文件名格式对照的。改成 编写者 会让 7 个字段（选项 4 + 解说 3）与题文不一致。→ 一律改为 **编制者**，另外把 q094 distractors.エ 已有的「编写者姓名」也改为「编制者姓名」（新增 1 处）。

**H-3 L4-c zh：非字形类的标签（「引号内 = en hook 的 CJK 串」53 + 手工 13 + 「ja hook / 见出し语中且在 日语/日文 之后」9 = 75 个）会把中文词里的同形字、或中文释义标成 `lang="ja"`。** 这和提案自己对 residual_zh（“组”“汇总”）的判断（zh 已改写成中文的字形 → 不标）相矛盾。
- 明确多标（应去掉）：management-08-25-u05「“类”…“[[jp:推]]”」（类推 是中文的拆字）、strategy-01-01-u01 t6「人力资本 的“[[jp:本]]”」、strategy-05-14-u04 t0「“数字”加“[[jp:政府]]”」（政府 是 ガバメント 的中文释义）、technology-14-37-u04 第 1 个「type 意为“[[jp:型]]”」（英语的中文释义；第 2 个「日语的“[[jp:型]]”」保留）、technology-23-63-u03「“检”…“[[jp:疫]]”」（拆的是中文 检疫）。
- 不一致：strategy-02-07-u04「“[[jp:公益]]”“通报者”“保护”」三段只标一段 → 去掉 公益 的标记（或者三段都用日本字形并标记，那就是改字）。
- 漏标：technology-13-34-u04 t1「“[[jp:昇]]”…“降”」→ 补「“[[jp:降]]”」。
- 边界（没有 日语/日文 提示、且字在 term_zh 内，建议去掉，LOW）：理/念（经营理念）、率（概率）、列（排列）、固定（固定资产，L3 C06 也提到这条 hook）。
- 政府、公益 属于第三类「after 日语/日文」（9 个），不在 en 回声类里；型#1、疫 所在 hook 也有「日语」提示。所以 **hook 里有日语提示不是充分条件**。
- 结论：en 侧可以按样本通过；zh 侧这 75 个标签需要全读，规则按**被引用的那个字串本身**判断：只有当这个字串就是被引用的日语原文（日语名称/日语的字）时才标；如果它是中文释义、或是中文译名里的字（类推、人力资本、检疫、数字政府…），不标。75 个的清单（含 term_zh、是否有提示、字是否在 term_zh 内）见 `L4_review_samples.json` 的 `l4c_zh_full_read_candidates`。
- 另外：`L4c_hooks.json` 里仍是「[[jp:サブロク协定]]」，施工前必须按 D-222.7 重新生成为「[[jp:サブロク]]协定」。

### MEDIUM

**M-1 2014h26a 改名后仍不一致。** 共通题文把 経理担当者 译成 财务担当者 → 负责人化后为「财务负责人」，但 q100 题文 (4) 和 q100 解说 3 处已经是「会计负责人」。改后同一角色两种说法。→ 新增 4 处：会计负责人 → **财务负责人**（与「财务部」一致）。q100 的「申请人/审批人」与其他处「申请者/审批者」也不一致（LOW，可一起改）。担当者→负责人 这一选择本身成立：q098/q100 题文、解说原来就用「事务负责人」，图说明是「负责人列」。
**2010h22a-q087**：题文、选项、解说、要点改后全部一致（员工/部门，与 en 的 Employee/Department 对应）。只有解说 correct 和 points[1] 里还有日语「取入」2 处 → 同批改为「引入」。

**M-2 D-222 第 3 条按现在的写法不能执行。**
- 「指摘→指出」：23 处大多数是名词用法（指摘事项、收到了如下指摘、〔A收到的指摘〕、提出指摘、审计指摘），机械替换会产生「提出指出」「本题的指出是」这样的病句。→ 逐处给出：名词 → 「指出的问题」/「审计发现」/「意见」，动词 → 「指出」。2014h26h-q099 的标题〔A收到的指摘〕与解说「根据指摘(2)」要像改名家族一样同时改。
- 「试作→试制」：38 处全部是软件的原型法。「试制」偏向制造业的试生产。建议改为「原型」：试作品（原型）→原型、试作软件→原型软件、试作评估→原型评估、通过试作→通过制作原型、试作型→原型式。注意「原型（试作品）」不能整体换成「原型（原型）」。
- 这两族共 61 处，需要逐处的置换表 + 全读 + 单独的 Rule D，不能用抽样代替。

**M-3 D-222 第 1 条不完整。** `zh_terms.json` 登记的是 マイナンバー=「个人番号（My Number）」、マイナンバー法=「我的编号法」。`zhTermWarnings` 接受的是登记值整体、括号外（个人番号）、括号内（My Number）三种；zh 改成「个人编号」而文中没有「My Number」的字段会出 B6 zh-term WARN（不阻塞，但与决定冲突）。所以必须同时改登记、改 term_zh（manifest v1_terms + v1terms fixture，B3 改不了）。另外「番号法 作为固有名保留」和登记里的「我的编号法」（是 My Number 的直译，不自然）是三种说法并存，需要定下来（建议：概念用 个人编号，法律名用 番号法，「我的编号法」废止）。

**M-4 假阴性（扫描器没有收录的族）。** 本审查用词探测发现：「传票」24（2009h21a-q100 题文/选项 6 + 解说 17，另 2013h25a-q025 解说 1 未读；ja 伝票番号。q100 题文里同一个 伝票番号 既译「单据编号」又译「传票编号」，题内不统一 → 统一为「单据编号」）、「决裁」不在括号里的 1 处（2012h24h-q027 エ「申请、审批、决裁」）、「取入」2（q087）、「不正当竞争防止法」1（`不正(?![当…])` 的正则把它排除了，应为 反不正当竞争法）。语表自己也写了同形词网只看到出现约 6 次以上的串 → LEAK 290 是下限，L5 的常设检查不能说已经覆盖完全。「实绩」137 属于中文也通用的范围，不算。

### LOW

- B0490（2014h26h-q010）「共同利用者」→ 不要改：同一括号里「共同利用」出现 3 次（个人信息保护法用语），只改「者」会不统一。
- 检讨→研究 可用；「考虑/探讨」更自然。B0002 冲刺回顾的「检讨」→「反思」。
- B0366「结合测试（集成测试）」→「集成测试（结合测试）」：括号里留的是日语的简体化，可以接受（与教科书「日语中也叫结合测试」一致）。
- D-222 保留「多重化」，而 S131 efix3 的先例是把「双工化/二重化」改成「冗余化」。两种做法并存，L5 许可清单里要写明理由。
- 验证器只证明「只加了标记」，标记正确性完全靠人读（H-3 就是这个空当）。

## 我会改的置换（before → 提案 → 本审查的修正）

| 处 | 提案 | 修正 | 理由 |
|---|---|---|---|
| 2011h23tokubetsu-q036 イ/ウ/points[1]（B0386–0388） | 担当者 → 负责人 | **测试人员** | H-1 |
| 2023r05-q007 エ 解说（B0720） | 担当者 → 负责人 | **实务人员**（并把选项エ「系统规划负责人」→「系统规划人员」） | H-1 |
| 2025r07-q052 エ（B0781） | 担当者 → 负责人 | **质量管理人员** | H-1 |
| 2010h22a-q010 ウ（B0292） | 担当 → 负责人 | **IT 运维人员** | H-1 |
| 2013h25a-q095 选项×4、解说×3（B0186–0189、B0444–0446） | 作成者 → 编写者 | **编制者** | H-2 |
| 2013h25a-q094 distractors.エ（新增） | — | 编写者姓名 → **编制者姓名** | H-2 |
| 2014h26a-q100 题文(4)+解说×3（新增） | — | 会计负责人 → **财务负责人** | M-1 |
| 2010h22a-q087 correct / points[1]（新增） | — | 取入 → **引入** | M-1 |
| 2014h26h-q010（B0490） | 利用者 → 使用者 | **不改** | LOW |
| 2009h21a-q064 ウ（B0274，UNSURE） | 误答项 → 错误选 | 采纳 → **错误选项** | 「误答项」不成中文 |
| L4-c 6 句 + 边界 5 处 | 见 H-3 | 去掉/补上标记 | H-3 |

## UNSURE 20 的去向（D-222 第 3 条）

| ID | 词 | 去向 |
|---|---|---|
| B0295 B0730 B0667 B0794 | 试作 | 改（建议 原型 系；D-222 字面为 试制，见 M-2） |
| B0434 B0540 B0541 B0542 | 多重化 | 留（D-222），许可清单 |
| B0274 | 误答 | 「误答项」→ 错误选项 |
| B0002 | 检讨 | → 反思 |
| B0071 B0574 B0077 B0254 | 个人番号 | → 个人编号（番号法 保留，M-3） |
| B0182 B0384 | 指摘 | → 所指出的问题 / 本题指出的问题是 |
| B0148 | 株式会社 | 留（题目单据里的公司名） |
| B0810 B0805 | 过去问 | 留（D-222.2） |
| B0501 | 案件 | → 受理事项 |

其余 UNSURE（不在样本内，也给出判断）：利害关系者 7 → 留（与 zh_terms 登记一致，许可清单）；选定要件 7 → 题文〔选定要件〕与解说一起改为「选定条件」或整体保留，不能只改一边；事业者 2 → 经营者（与「个人信息处理经营者」登记一致）；满足度 2 → 满足感 / 满意度；事件管理的 案件 4 → 事件 / 受理事项；稟议（混合字形）2 → 写成纯日语「（稟議書）」或中文「审批文件」；实装（unit_summary）→ 去掉「实装」（「内存模块（DIMM 系列）」）；记忆装置 → 存储装置。

## 需要全读、不能只靠抽样的族

1. 担当者/担当人员「其他」12 —— 本审查已全读（结果见上）。
2. 作成者 7 —— 全部改目标词。
3. L4-c zh 的「en 回声 / 手工」标签 66 个 —— 按 H-3 的规则全读。
4. D-222 改为修正的 指摘 23 + 试作 38 —— 逐处置换表 + 单独 Rule D。
5. 个人番号 49 —— 连同 zh_terms / term_zh / fixture 一起，按改名家族的方式一次做完。

## 对 D-222 本身的意见

- 第 1 条：方向对，但缺「我的编号法」与 zh_terms / term_zh 的处理（M-3）。
- 第 3 条：「指摘→指出」措辞不可执行；「试作→试制」对本语料（全是软件）不是最佳（M-2）。
- 第 2、4、5、6、7、9 条：同意。（第 5 条讲的是 `.phase1/tr_`；本审查只核实了 translations sidecar 上 75 个置换都能一次命中，`.phase2` 的比较属于解说路径，见上表。）
- 第 8 条：已全读，6 句都需要修改（H-3）。

## 施工前的闸门（建议）

- 按上表修正后重新生成 `L4b` 置换表与 `L4c_hooks.json`（含 D-222.7）。
- quiz 解说（必须）：每个试验回 merge dry-run，diff 只能出现在目标字段，key_guard.note_jp 不丢；之后按 D-222.4 加 1 条总 note。
- 施工后在 2010h22a-q087、2014h26a-q097〜q100、2013h25a-q094〜q096、2011h23tokubetsu-q036、2023r05-q007 上跑残留检查（旧词 0、同一角色只有一种译名）。

## 逐样本表

种子见 `L4_review_samples.json` 的 `seeds`（mulberry32 + Fisher-Yates）。

### L4-b LEAK 随机 36

| ID | 语 | 字段 | before → after | 是混入 | 置换 |
|---|---|---|---|---|---|
| B0397 | 不正(竞争防止法) | 2012h24a.json questions.2012h24a-q052.correct.zh | 不正竞争防止法 → 反不正当竞争法 | 是 | 正确 |
| B0187 | 作成者 | 2013h25a.json questions.2013h25a-q095.choices.イ.zh | 作成者 → 编写者 | 是 | **改**：作成者 → 编制者 (同じ中問の題文 表1 が「编制者姓名」、選択肢はその書式と照合する) |
| B0457 | 利用者 | 2013h25h.json questions.2013h25h-q042.distractors.ウ.zh | 利用者 → 使用者 | 是 | 正确 |
| B0443 | 報 | 2013h25a.json questions.2013h25a-q094.distractors.エ.zh | 報告 → 报告 | 是 | 正确 |
| B0412 | 实装 | 2012h24h.json questions.2012h24h-q071.points[1].zh | 实装 → 集成 | 是 | 正确 |
| B0200 | 担当 | 2014h26a.json questions.2014h26a-q097.stem.zh | 务担当者进 → 务负责人进 | 是 | 正确 |
| B0585 | 提携 | 2018h30a.json questions.2018h30a-q008.distractors.イ.zh | 提携 → 合作 | 是 | 正确 |
| B0361 | 案件 | 2011h23a.json questions.2011h23a-q031.correct.zh | 握案件的 → 握商机的 | 是 | 正确 |
| B0562 | 检讨 | 2017h29a.json questions.2017h29a-q038.distractors.ウ.zh | 检讨 → 研究 | 是 | 正确 |
| B0802 | 正答 | zh.json Today.weakLead | 正答 → 正确 | 是 | 正确 |
| B0695 | 正解 | 2021r03.json questions.2021r03-q064.correct.zh | 正解 → 正确答案 | 是 | 正确 |
| B0160 | 社员 | 2010h22a.json questions.2010h22a-q087.stem.zh | 的「社员」表 → 的「员工」表 | 是 | 正确 |
| B0535 | 立案 | 2016h28a.json questions.2016h28a-q008.correct.zh | 立案 → 规划 | 是 | 正确 |
| B0175 | 结合测试 | 2011h23a.json questions.2011h23a-q037.stem.zh | 结合测试 → 集成测试 | 是 | 正确 |
| B0180 | 要件 | 2011h23tokubetsu.json questions.2011h23tokubetsu-q092.stem.zh | 要件 → 需求 | 是 | 正确 |
| B0491 | 责任者 | 2014h26h.json questions.2014h26h-q010.correct.zh | 责任者 → 负责人 | 是 | 正确 |
| B0158 | 部署(日本語の意味) | 2010h22a.json questions.2010h22a-q087.stem.zh | ，部署代 → ，部门代 | 是 | 正确 |
| B0588 | 正解 | 2018h30a.json questions.2018h30a-q051.correct.zh | 正解 → 正确答案 | 是 | 正确 |
| B0631 | 正解 | 2018h30h.json questions.2018h30h-q095.correct.zh | 正解 → 正确答案 | 是 | 正确 |
| B0716 | 正解 | 2022r04.json questions.2022r04-q058.correct.zh | 正解 → 正确答案 | 是 | 正确 |
| B0784 | 正解 | 2025r07.json questions.2025r07-q074.correct.zh | 正解 → 正确答案 | 是 | 正确 |
| B0626 | 正解 | 2018h30h.json questions.2018h30h-q056.correct.zh | 正解 → 正确答案 | 是 | 正确 |
| B0785 | 正解 | 2025r07.json questions.2025r07-q094.correct.zh | 正解 → 正确答案 | 是 | 正确 |
| B0203 | 担当 | 2014h26a.json questions.2014h26a-q097.stem.zh | 」→ 事务担当者的处理「a → 」→ 事务负责人的处理「a | 是 | 正确 |
| B0227 | 担当 | 2014h26a.json questions.2014h26a-q100.stem.zh | 务担当者汇 → 务负责人汇 | 是 | 正确 |
| B0218 | 担当 | 2014h26a.json questions.2014h26a-q099.stem.zh | 交给事务担当者。⏎（5 → 交给事务负责人。⏎（5 | 是 | 正确 |
| B0220 | 担当 | 2014h26a.json questions.2014h26a-q099.stem.zh | 务担当者对 → 务负责人对 | 是 | 正确 |
| B0013 | 担当 | management-12-32-u01.json pairs[0].rows[1].b_zh | 担当人员 → 工作人员 | 是 | 正确 |
| B0153 | 部署(日本語の意味) | 2010h22a.json questions.2010h22a-q087.stem.zh |  部署代 →  部门代 | 是 | 正确 |
| B0155 | 部署(日本語の意味) | 2010h22a.json questions.2010h22a-q087.stem.zh | 名 ／ 部署名 ／  → 名 ／ 部门名 ／  | 是 | 正确 |
| B0165 | 社员 | 2010h22a.json questions.2010h22a-q087.choices.ア.zh |  社员编 →  员工编 | 是 | 正确 |
| B0312 | 社员 | 2010h22a.json questions.2010h22a-q087.correct.zh | 由 社员编号 → 由 员工编号 | 是 | 正确 |
| B0499 | 立案 | 2014h26h.json questions.2014h26h-q025.correct.zh | 的企划立案能 → 的策划能 | 是 | 正确 |
| B0052 | 立案 | strategy-02-06-u01.json terms[5].detail_zh | 立案 → 规划 | 是 | 正确 |
| B0245 | 立案 | 2018h30h.json questions.2018h30h-q028.stem.zh | 立案 → 制定 | 是 | 正确 |
| B0827 | 正答 | zh.json Record.colRate | 正答 → 正确 | 是 | 正确 |

### L4-b UNSURE 20

| ID | 语 | 字段 | 去向 |
|---|---|---|---|
| B0295 | 试作 | 2010h22a.json questions.2010h22a-q034.correct.zh | 改：试作品 → 原型 (D-222 の字面どおりなら 试制品; reviewer 推奨は 原型、全 38 件がソフトウェアの原型法) |
| B0434 | 多重化 | 2013h25a.json questions.2013h25a-q047.points[0].zh | 留：多重化: D-222 で残す (許可リスト) |
| B0730 | 试作 | 2023r05.json questions.2023r05-q040.distractors.ア.zh | 改：试作品（原型）→ 原型 (D-222 字面: 试制品（原型）) |
| B0667 | 试作 | 2019r01a.json questions.2019r01a-q055.points[1].zh | 改：原型法（试作评估）→ 原型法（制作原型并评估）(D-222 字面 试制评估 は不自然) |
| B0794 | 试作 | 2026r08.json questions.2026r08-q038.points[1].zh | 改：试作型方法 → 原型式方法 (D-222 字面 试制型 は不自然) |
| B0540 | 多重化 | 2016h28a.json questions.2016h28a-q067.correct.zh | 留：多重化 残す |
| B0274 | 误答 | 2009h21a.json questions.2009h21a-q064.distractors.ウ.zh | 改：误答项 → 错误选项 (D-222 は 误答 を残すが「误答项」は中国語として不成立、書き手の置換案を採る) |
| B0541 | 多重化 | 2016h28a.json questions.2016h28a-q067.points[0].zh | 留：多重化 残す |
| B0002 | 检讨 | management-09-26-u04.json terms[5].detail_zh | 改：检讨 → 反思 (or 审视、書き手案で可) |
| B0071 | 个人番号 | strategy-05-14-u05.json terms[3].term_zh | 改：term_zh 个人番号（My Number）→ 个人编号（My Number） (D-222.1; manifest v1_terms・v1terms fixture・zh_terms.json の マイナンバー 登録も同時に) |
| B0182 | 指摘 | 2012h24a.json questions.2012h24a-q097.stem.zh | 改：作为该指摘内容 → 作为所指出的问题 (名詞用法、「指出」の機械置換は不可) |
| B0574 | 个人番号 | 2017h29h.json questions.2017h29h-q024.distractors.イ.zh | 改：个人番号 → 个人编号 |
| B0148 | 会社 | 2009h21a.json questions.2009h21a-q100.stem.zh | 留：株式会社 I = 題目の請求書の会社名 (固有名)、許可リスト |
| B0810 | 过去问 | zh.json Textbook.termPast | 留：过去问 (D-222.2) |
| B0542 | 多重化 | 2016h28a.json questions.2016h28a-q067.points[0].zh | 留：多重化 残す |
| B0077 | 个人番号 | strategy-05-14-u05.json terms[3].points[0].text_zh | 改：个人番号 → 个人编号、番号法 は残す (D-222.1) |
| B0254 | 个人番号 | 2022r04.json questions.2022r04-q016.choices.ウ.zh | 改：个人番号 → 个人编号 |
| B0384 | 指摘 | 2011h23tokubetsu.json questions.2011h23tokubetsu-q034.distractors.エ.zh | 改：本题的指摘是 → 本题指出的问题是 |
| B0501 | 案件 | 2014h26h.json questions.2014h26h-q037.points[1].zh | 改：记录全部案件 → 记录全部受理事项 (同欄の SPOC 文脈) |
| B0805 | 过去问 | zh.json Today.answered | 留：过去问 (D-222.2) |

### L4-b OK 10

| ID | 语 | 字段 | 判定 |
|---|---|---|---|
| B0547 | 单体测试 | 2016h28h.json questions.2016h28h-q043.distractors.ア.zh | OK；OK (括弧内「单体测试」は日本語 単体テスト の簡体化で厳密には日本語ではない、LOW) |
| B0492 | 要件 | 2014h26h.json questions.2014h26h-q019.correct.zh | OK |
| B0352 | 独占禁止 | 2011h23a.json questions.2011h23a-q018.distractors.ア.zh | OK |
| B0057 | 景品 | strategy-02-06-u02.json terms[5].points[1].text_zh | OK |
| B0271 | 要件 | 2009h21a.json questions.2009h21a-q023.points[0].zh | OK |
| B0607 | 要件 | 2018h30h.json questions.2018h30h-q024.distractors.ウ.zh | OK |
| B0563 | 要件 | 2017h29a.json questions.2017h29a-q100.distractors.ウ.zh | OK |
| B0124 | 啓発 | technology-23-63-u01.json terms[0].hook_zh | OK |
| B0651 | 要件 | 2019r01a.json questions.2019r01a-q020.points[0].zh | OK |
| B0770 | 葉 | 2024r06.json questions.2024r06-q093.points[1].zh | OK |

### L4-c hook 51（zh 随机 20 / en 随机 10 / §4-7 所列 8 单元全部 hook 21；有重叠）

| 组 | 单元 | 字段 | after | 判定 |
|---|---|---|---|---|
| zh_random | technology-13-34-u01 | terms[0](確率).hook_zh | “[[jp:率]]”是比率的率，把概率读成以全体为分母的比例。 | borderline：率 は中国語 概率 の字でもあり 日语 の手がかり無し → 外す方を推奨 (LOW) |
| zh_random | technology-23-62-u03 | terms[2](可用性).hook_zh | 日语“[[jp:可用]]”可读作“可以使用”。英文 Availability 也来自 available（就在手边、随时能用）。 | ok |
| zh_random | technology-23-63-u10 | terms[7](他人受入率).hook_zh | 主语是“[[jp:他人]]”（日文“[[jp:他人受入率]]”的字面意思就是他人被接受的比率）。 | ok |
| zh_random | management-11-29-u04 | terms[0](サービス可用性管理).hook_zh | 日语的“[[jp:可用]]”取“可以使用”之意，指能用的状态。英语 availability 也是“可获得、可使用”的意思。 | ok |
| zh_random | technology-13-34-u04 | terms[3](尺度).hook_zh | 日语“[[jp:尺度]]”原本指量长度用的尺子。尺子种类不同，能量的东西也不同，从字面就能读出这层意思。 | ok |
| zh_random | management-10-27-u03 | terms[5](転嫁).hook_zh | 日语里“[[jp:転嫁]]”和成语“责任转嫁”是同一个词，中文叫“转移”，字面就是把负担“转”到别处“移”走。 | ok |
| zh_random | strategy-05-14-u04 | terms[5](電子自治体).hook_zh | “[[jp:自治体]]”可以读作“自己治理的团体”。从字面就能看出，这是地方而非国家一方的举措。 | ok |
| zh_random | strategy-07-22-u01 | terms[0](企画プロセス).hook_zh | 日语[[jp:企画]]中的“[[jp:企]]”字，据说源于人踮起脚尖眺望远方的样子。可以把它和预见未来、制定计划的工序联系起来。 | ok |
| zh_random | strategy-02-06-u03 | terms[3](金融商品取引法).hook_zh | 简称「[[jp:金商法]]」。内部控制报告制度仿照美国的 SOX 法而建，所以也叫 J-SOX（日本版 SOX 法）。 | ok |
| zh_random | technology-23-63-u01 | terms[0](情報セキュリティ啓発).hook_zh | “宣导”就是宣传加引导：把信息讲出去，引导大家自己留心。日语写作“[[jp:啓発]]”，其中“[[jp:啓]]”有“开启”之意，即让人睁开眼睛。 | ok |
| zh_random | technology-13-35-u04 | terms[2](教師あり学習).hook_zh | “[[jp:教師]]”（老师）就是知道答案的人。把答案放在旁边学习，所以是“有老师”（[[jp:あり]]）。中文叫“监督”，同样是有人在旁边对答案。 | ok |
| zh_random | technology-20-52-u06 | terms[2](可逆圧縮).hook_zh | 日语名称“[[jp:可逆]]”拆开读，就是“可以逆向回到原样”。中文的“无损”则直接说明没有损失。 | ok |
| zh_random | technology-23-63-u03 | terms[3](検疫ネットワーク).hook_zh | 日语名称里的“[[jp:検疫]]”就是中文的“检疫”：“检”是检查，“[[jp:疫]]”是疫病。正如字面所示，先查清是否被感染，再放行进入。 | over-mark：“检”“疫” は中国語 检疫 の分解 (检 は簡体) → [[jp:疫]] を外す ([[jp:検疫]] は可) |
| zh_random | strategy-01-02-u04 | terms[3](擬似相関).hook_zh | 「[[jp:擬似]]」的“拟”与“拟声”“拟态”的“拟”相同，意为“模仿得像真的”；英文 spurious 也是“虚假的”意思。 | ok |
| zh_random | technology-13-34-u03 | terms[3](推定).hook_zh | 日语写作「[[jp:推定]]」：「[[jp:推]]」是推测，「[[jp:定]]」是确定。从手头的一部分出发，去确定整体的数值。 | ok |
| zh_random | strategy-02-06-u01 | terms[3](36協定).hook_zh | “36”是条文编号。因为是劳动基准法第 36 条规定的协定，所以在日语中读作“[[jp:サブロク协定]]”。 | change：D-222.7 → 「[[jp:サブロク]]协定」に作り直す (提案ファイルは未反映) |
| zh_random | management-11-29-u03 | terms[2](リリース及び展開管理).hook_zh | 日语里“[[jp:リリース]]”是“放出”，“[[jp:展開]]”是“铺开”。可以用动作来记：把在手边完成的东西放出去，铺开到用户那一侧。 | ok |
| zh_random | strategy-03-09-u02 | terms[0](競争優位).hook_zh | 日语「[[jp:優位]]」二字的字面意思是“优越的位置”。它表示的不是能力本身，而是在竞争中所站的位置。 | ok |
| zh_random | strategy-05-14-u05 | terms[2](電子入札).hook_zh | 日语「[[jp:入札]]」字面意思是「投入标牌」。过去把纸质标牌投进箱子的手续，换成了在网上提交。 | ok |
| zh_random | strategy-02-05-u01 | terms[4](匿名加工情報).hook_zh | 正如“[[jp:匿名]]”加上“[[jp:加工]]”这个名称所示，不只是删掉名字，还要按标准完成加工，才适用这种处理方式。 | ok |
| en_random | technology-14-37-u04 | terms[0](データ型).hook_en | The Japanese [[jp:型]] (kata) is simply a translation of "type", which means a kind or category. | ok |
| en_random | strategy-05-16-u04 | terms[2](暗号資産).hook_en | Read the two parts of the Japanese name: [[jp:暗号]] (cipher) is the technology that protects the records, and [[jp:資産]] (asset) means property value rather than money itself. | ok |
| en_random | strategy-03-09-u02 | terms[0](競争優位).hook_en | The Japanese [[jp:優位]] literally reads "superior position." It names where you stand in the competition, not the capability itself. | ok |
| en_random | technology-13-34-u04 | terms[3](尺度).hook_en | The Japanese word [[jp:尺度]] originally meant a ruler for measuring length, and different rulers can measure different things. | ok |
| en_random | strategy-01-01-u10 | terms[0](第4次産業革命).hook_en | The Japanese [[jp:次]] marks order: this is the fourth turning point after steam, electricity, and computers, hence "4th." | ok |
| en_random | technology-22-60-u05 | terms[1](基地局).hook_en | The character [[jp:局]] in [[jp:基地局]] also appears in the Japanese words for broadcaster and post office, marking a site in charge of a service. | ok |
| en_random | strategy-05-14-u03 | terms[3](業務別ソフトウェアパッケージ).hook_en | The [[jp:務]] in [[jp:業務別]] is the [[jp:務]] of duties, as in [[jp:事務]] (office work) and [[jp:職務]] (job duties). That one character tells you the product is chosen by department tasks found in companies of every industry, like those of an accounting or HR section. | ok |
| en_random | technology-23-63-u01 | terms[1](情報セキュリティ訓練).hook_en | A drill is something you repeat until it becomes automatic, just as the Japanese [[jp:訓練]] combines "teach" and "train by repetition." | ok |
| en_random | strategy-02-04-u01 | terms[4](意匠法).hook_en | The [[jp:匠]] in [[jp:意匠]] means craftsman. Remember it as the design care a craftsman puts into a shape. | ok |
| en_random | strategy-02-04-u01 | terms[3](実用新案法).hook_en | [[jp:実用]] means making everyday tools handier, and [[jp:新案]] means a new idea. Link the name to clever changes in the shape of tools, that is, articles. | ok |
| listed_§4-7 | management-08-25-u05 | terms[1](類推見積法).hook_zh | “类”指相似的东西，“[[jp:推]]”指推测。也就是从相似的先例推测出来的方法。 | over-mark：“类”“推” は中国語 类推 の分解 → [[jp:推]] を外す (en 側の 類・推 は可) |
| listed_§4-7 | management-08-25-u05 | terms[1](類推見積法).hook_en | In the Japanese name, [[jp:類]] means "similar" and [[jp:推]] means "infer": the method infers from similar precedents. | ok |
| listed_§4-7 | strategy-01-01-u01 | terms[0](経営理念).hook_zh | “[[jp:理]]”是条理，“[[jp:念]]”是心中始终怀有的想法。拆开来看，可以读作“作为经营的条理而始终坚持的想法”。 | borderline：理念 は中国語 经营理念 と同字、手がかり無し → 外す方を推奨 (LOW) |
| listed_§4-7 | strategy-01-01-u01 | terms[0](経営理念).hook_en | In the Japanese term, [[jp:理]] means a guiding path and [[jp:念]] means a thought held in mind. Split apart, it reads as a thought kept in mind as the guiding path of management. | ok |
| listed_§4-7 | strategy-01-01-u01 | terms[6](人的資本経営).hook_zh | 从“人工费”的“费”到“人力资本”的“[[jp:本]]”。看法从花掉就没了的东西，变成了作为本钱不断增值的东西。 | over-mark：本 は中国語 人力资本 の字 (费 も中国語で無印) → 外す |
| listed_§4-7 | strategy-01-01-u01 | terms[6](人的資本経営).hook_en | The Japanese wording moves from the [[jp:費]] (expense) in [[jp:人件費]], personnel costs, to the [[jp:本]] (principal) in [[jp:人的資本]], human capital. People stop being seen as something spent and gone and become capital to build up. | ok |
| listed_§4-7 | strategy-02-06-u01 | terms[3](36協定).hook_zh | “36”是条文编号。因为是劳动基准法第 36 条规定的协定，所以在日语中读作“[[jp:サブロク协定]]”。 | change：D-222.7 → 「[[jp:サブロク]]协定」に作り直す (提案ファイルは未反映) |
| listed_§4-7 | strategy-02-07-u04 | terms[1](公益通報者保護法).hook_zh | 把日文名称拆成“[[jp:公益]]”“通报者”“保护”三段来读，目的、受保护的人和效果便一目了然。 | inconsistent：三段の 1 つだけ lang=ja。通报者・保护 は簡体で書き直し済 → 公益 も外す (又は 3 つとも日本字形で印、字の変更) |
| listed_§4-7 | strategy-05-14-u04 | terms[0](デジタルガバメント).hook_zh | [[jp:ガバメント]] 来自英语 government（政府），日语名称就是“数字”加“[[jp:政府]]”的组合。 | over-mark：政府 は ガバメント の中国語訳 (日本語名は デジタル+ガバメント) → 外す |
| listed_§4-7 | strategy-05-14-u04 | terms[5](電子自治体).hook_zh | “[[jp:自治体]]”可以读作“自己治理的团体”。从字面就能看出，这是地方而非国家一方的举措。 | ok |
| listed_§4-7 | technology-13-34-u03 | terms[3](推定).hook_zh | 日语写作「[[jp:推定]]」：「[[jp:推]]」是推测，「[[jp:定]]」是确定。从手头的一部分出发，去确定整体的数值。 | ok |
| listed_§4-7 | technology-13-34-u03 | terms[3](推定).hook_en | The Japanese word [[jp:推定]] combines [[jp:推]] (to infer) and [[jp:定]] (to fix). You start from the part in hand and pin down a value for the whole. | ok |
| listed_§4-7 | technology-13-34-u03 | terms[4](仮説検定).hook_zh | 日语「**帰無**」意为“归于无”。可以从字面记住：这是一开始就打算被推翻而提出的假设。 | ok：D-222.6 で印なし (L5 で個別許可) |
| listed_§4-7 | technology-13-34-u03 | terms[4](仮説検定).hook_en | The Japanese term **帰無** means "to return to nothing." Remember it as a hypothesis set up from the start in the hope of being thrown out. | ok：D-222.6 で印なし |
| listed_§4-7 | technology-13-34-u04 | terms[0](データの集計).hook_en | The Japanese word [[jp:集計]] joins [[jp:集]] (gather) and [[jp:計]] (measure), naming the two steps of the job: collect the records, then compute the figures. | ok |
| listed_§4-7 | technology-13-34-u04 | terms[1](データの並べ替え).hook_zh | 日语写作“[[jp:昇順]]”“[[jp:降順]]”：“[[jp:昇]]”是像登台阶一样往上走，“降”是往下走，看字的方向就能记住数值的变化。 | under-mark：昇 と対の 降 (降順 の字) が印の外 → “[[jp:降]]” を足す |
| listed_§4-7 | technology-13-34-u04 | terms[3](尺度).hook_zh | 日语“[[jp:尺度]]”原本指量长度用的尺子。尺子种类不同，能量的东西也不同，从字面就能读出这层意思。 | ok |
| listed_§4-7 | technology-13-34-u04 | terms[3](尺度).hook_en | The Japanese word [[jp:尺度]] originally meant a ruler for measuring length, and different rulers can measure different things. | ok |
| listed_§4-7 | technology-13-34-u04 | terms[4](名義尺度).hook_zh | 日语“[[jp:名義]]”就是名字的意思。名字之间可以互相区分，却说不出哪个更大。 | ok |
| listed_§4-7 | technology-14-37-u04 | terms[0](データ型).hook_zh | 英语为 data type。type 意为“[[jp:型]]”“种类”，日语的“[[jp:型]]”正是这个词的译法。 | over-mark：1 つ目「type 意为“型”」は英語の中国語訳 → 1 つ目の印を外し、2 つ目「日语的“[[jp:型]]”」だけ残す |
| listed_§4-7 | technology-14-37-u04 | terms[0](データ型).hook_en | The Japanese [[jp:型]] (kata) is simply a translation of "type", which means a kind or category. | ok |

### 定向全读（不计入随机精度）

| ID | 位置 | 提案 | 修正 | 理由 |
|---|---|---|---|---|
| B0292 | 2010h22a-q010 distractors.ウ.zh | 担当 → 负责人 | IT 运维人员 | ja「IT 運用担当」= 役割。選択肢 イ/エ の 负责人 (= 責任者) と紛れる |
| B0386 | 2011h23tokubetsu-q036 distractors.イ.zh | 担当者 → 负责人 | 测试人员 | 同じ文に「经过负责人的评审和批准」があり、置換すると『负责人の承認を経て…负责人が自分で直すのではない』と矛盾。選択肢は 测试人员 |
| B0387 | 2011h23tokubetsu-q036 distractors.ウ.zh | 担当者 → 负责人 | 测试人员 | ja 担当者 = テスト担当者、選択肢 ウ「由测试人员修改程序」 |
| B0388 | 2011h23tokubetsu-q036 points[1].zh | 担当者 → 负责人 | 测试人员 | en「a tester」 |
| B0720 | 2023r05-q007 distractors.エ.zh | 担当者 → 负责人 | 实务人员 (文全体: 系统规划人员是在实务上承担…规划制定工作的人员，…作为负责人并不适当) | 題は 責任者(负责人) を問う。担当者→负责人 で「负责人は…负责人であり…负责人として不適切」と自己矛盾。選択肢エの訳「系统规划负责人」自体も誤訳 (en は staff member) → 系统规划人员 に |
| B0781 | 2025r07-q052 distractors.エ.zh | 担当者 → 负责人 | 质量管理人员 | 「质量管理负责人是…质量管理负责人」の同語反復。ja 品質管理担当 |
| B0490 | 2014h26h-q010 correct.zh | 利用者 → 使用者 | 変えない (共同利用者) | 同じ括弧内に 共同利用 が 3 回 (個人情報保護法の用語)。者 だけ変えると不統一 |
| B0186-B0189,B0444-B0446 | 2013h25a-q095 | 作成者 → 编写者 | 编制者 | 題文 表1 (q094-q096 共通) は「编制者姓名」 |
| (new) | 2013h25a-q094 distractors.エ.zh | - | 编写者姓名 → 编制者姓名 | 同上 |
| (new) | 2014h26a-q100 stem.zh (4) + correct/distractors zh ×3 | - | 会计负责人 → 财务负责人 | 提案後も 経理担当者 が 财务负责人 (共通題文) と 会计负责人 (q100 の (4)・解説) に分裂 |
| (new) | 2010h22a-q087 correct.zh / points[1].zh | - | 取入 → 引入 (2 処) | 同じ題の改名と同時に; 日本語 取り込む |
