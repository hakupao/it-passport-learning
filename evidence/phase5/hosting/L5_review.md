# L5 恒久関門の独立審査 (Rule D)

- 日付 2026-11-11 (S154)。审查者 = oh-my-claudecode:critic (opus)，与书写者 (oh-my-claudecode:executor) 不同 subagent_type。
- 只读：未改 repo 内任何文件 (本文件除外)；合成用例全部在 scratchpad 副本 `/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/77583127-fb4e-4fd0-a19d-486c67c9fd79/scratchpad/l5rev` 中执行 (数据 + scripts + messages 的拷贝，每例执行后复原，基线与终态均 exit 0)。
- 全文精读：`L5_gate.md` (含「修正後」)、`scripts/lang-leak-scan.ts`、`scripts/lib/lang-leak.ts`、`scripts/l5-build-allowlist.ts`、`scripts/l5-fix-apply.ts`、`scripts/fixtures/lang-allow.json` (scope_exclusions / categories / 抽样条目)、session-154 l.110–157 (D-221 / D-222 / 改訂 / 末尾 minor D)。
- 部分阅读 (按需检索的段落)：`scripts/lang-leak-scan.test.ts` (18 个 test 名，未逐行审)、`L3_audit.md` (Task A 表、l.75、l.188 的 L5 推荐)、`L4_review.md` (l.1–40)、`L4_round2_review.md` 与 `L4_apply_round2.md` (保留词 / UNSURE / L-4 相关行)。

## 结论：**APPROVE-WITH-CHANGES**

关门本身 (fixture + `--gate`) 成立：题目要求的 9 类合成混入全部令 `--gate` exit 1；位置/次数/别处同文的三种许可绕过全部被拦；derived 欄新字被 derived guard 拦。3 处修正只动了目标的 3 个叶子，措辞正确。抽查 40 条许可项全部合法，未发现掩盖真实混入的条目。

但有 2 个 MEDIUM 必须在 H6 接入前处理 (或明确记录为已接受的限制)：
1. **R-ja-simp 只认 60 字的 SIMP_ONLY 表**：ja 欄混入 东 / 车 等常见简体字时 gate 照样 PASS。改用已存在的「GB2312 有、Shift_JIS 无」判定，现 corpus 只多 1 个当たり (内部欄)。
2. **生成器 (`l5-build-allowlist.ts`) 的类过宽，重生成会把新混入吸收进 fixture 且报告 `unclaimed 0`**。L5_gate.md §6 规定 path 变动时要重生成 → 唯一防线是人读 `+` 行。

## 5. 在 repo 中执行 (只读)

| 命令 | 结果 |
|---|---|
| `node --no-warnings scripts/lang-leak-scan.ts --gate` | **exit 0**，`lang-leak gate: PASS`。522 entries，groups 89,615，hits 7,515，allowed 659，derived=6010，key-guard-note=106，punct-only 543，warn 197，キー集合 zh/en vs ja 0/0 |
| `node --test scripts/lang-leak-scan.test.ts` | **18/18 pass** |

与 L5_gate.md「修正後」所记一致 (quiz-bracket jpform 44 → 45 = 共連れ 的 連，符合预期)。

## 1. 合成用例 (scratch 副本)

| # | 用例 | 位置 | exit | 拦截规则 |
|---|---|---|---|---|
| A | zh 解说里的假名词「ですから」 | 2016h28a-q001 points[0].zh | **1** | R-zh-kana |
| B | zh 译文里的「正解」 | translations 2016h28a-q001 stem.zh | **1** | R-zh-jpword |
| C1 | zh.json「你的分野」 | Mock.colYours | **1** | R-zh-jpword |
| C2 | zh.json「正答率」 | Mock.colYours | **1** | R-zh-jpword (正答) |
| D1 | zh 单元欄的日本字形 対 | technology-13-33-u01 title_zh | **1** | R-zh-jpform |
| D2 | zh 单元欄的 図 | unit_summary_zh | **1** | R-zh-jpform |
| D3 | zh.json 的 対 | Mock.colYours | **1** | R-zh-jpform |
| E1 | en 单元欄的汉字 | title_en | **1** | R-en-cjk |
| E2 | en.json 的片假名 | Mock.colKey | **1** | R-en-cjk |
| E3 | en 译文选项的汉字 | 2016h28a-q001 choices.ア.en | **1** | R-en-cjk |
| F1 | ja 单元欄的 这 | title_jp | **1** | R-ja-simp |
| F2 | questions.json (ja-only) 的 们 | 2009h21a-q001 stem_jp | **1** | R-ja-simp |
| **F3** | ja 单元欄的「东京」(东 不在 SIMP_ONLY) | title_jp | **0 (漏)** | — → M-1 |
| **F4** | ja.json「正解车」 | Mock.colKey | **0 (漏)** | — → M-1 |
| G1 | zh 空串 (ja/en 有) | 单元 title_zh | **1** | R-empty |
| G2 | zh 键缺失 | 单元 title_zh | **1** | R-empty (missing) |
| G3 | zh 空串 (译文，ja 来自 questions.json) | stem.zh | **1** | R-empty |
| G4 | derived 欄 zh 空串 | terms[0].definition_zh | **1** | R-empty (不被 derived 排除) |
| H1 | zh = ja (数据，>12 字) | unit_summary_zh | **1** | R-same (+ kana/jpform) |
| H2 | zh.json 改成日语短标签「あなたの解答」(与 ja「あなたの答え」不同，故非 R-same 用例；纯 R-same 见 H4) | Mock.colYours | **1** | R-zh-kana |
| H3 | zh 选项 = questions.json 的 ja 选项 | choices.ア.zh | **1** | R-same (+ kana/jpform) |
| H4 | ja.json 与 zh.json 同为纯汉字「答案」(只有 R-same 能触发) | Mock.colYours | **1** | R-same 单独 |
| H5 | 单元 ja/zh 同为 14 字纯汉字 | unit_summary_* | **1** | R-same (+ R-ja-simp 进) |
| I1 | en.json 删一个键 | Mock.colYours | **1** | key set missing 1 + R-empty |
| I2 | zh.json 多一个键 | Mock.colExtra | **1** | key set extra 1 + R-empty |
| J1 | 已许可的「みちびき」出现在同题另一欄 | 2024r06-q099 distractors.ア.zh | **1** | R-zh-kana (未许可的 path) |
| J2 | 已许可的「过去问」出现在 zh.json 另一键 | Mock.colYours | **1** | R-zh-jpword |
| K | 同一 path 第二次出现「みちびき」 | 2024r06-q099 correct.zh | **1** | count 超出 (2 > 1) |
| K2 | tb-jp-unmarked 已许可 path 上的新假名 | strategy-03-10-u07 pairs[0].rows[3].a_zh | **1** | R-zh-kana (新文字串) |
| L1 | derived 欄新增本文没有的 図 | terms[0].definition_zh | **1** | derived guard |
| L2 | derived 欄新增本文没有的假名「です」 | terms[0].explanation_zh | **1** | derived guard |
| L3 | derived 欄新增本单元 `[[jp:2進数]]` 里有的字「進数」 | terms[0].definition_zh | 0 | 已知限制 (§7 字集合)；vitest `v2-corpus.test.ts` 的 validateV2 compat 等值检查会抓到 |
| M1 | quiz 括号内的纯汉字日语「（対応策検討）」 | 2016h28a-q001 points[0].zh | 0 | 已知限制 (§7 括号遮罩过宽) |
| M2 | 同上但不加括号 | 同上 | **1** | R-zh-jpform |
| N1 | unit_index 的 zh 假名 | topics[0].units[0].title_zh | **1** | R-zh-kana |
| N2 | `[[jp:正解]]` 注记 | 单元 title_zh | 0 | 设计如此 (lang="ja" 描画) |
| N3 | zh「部署」而 ja 无 部署 | stem.zh | 0 | 设计如此 (jaSibling：中文 部署 = 部署/デプロイ) |

题目要求的全部失败规则均已验证 fail；漏网的只有 F3/F4 (M-1，属 §7「ja 欄の簡体字表に無い中国語は見えない」的已自述限制)，以及 §7 已自述的 L3/M1。

## 2. 许可项抽查 (40 条，LCG 种子 154，按类分层)

逐条读源文件的 ja/zh/en 兄弟值核对。

| # | 类 | 规则 | 位置 | 文本 | 判定 |
|---|---|---|---|---|---|
| 1 | keep-decision | jpword | zh.json Textbook.confirmCount | 过去问 | OK (D-222.2) |
| 2 | keep-decision | jpword | 2009h21a-q067 distractors.イ.zh | 多重化 | OK (D-222 改訂；同欄另有 双重化 是中文) |
| 3 | keep-decision | jpword | 2010h22a-q086 distractors.イ.zh | 误答 | OK (D-222.3) |
| 4 | keep-decision | jpword | 2013h25a-q047 points[0].zh | 多重化 | OK |
| 5 | keep-decision | jpword | 2026r08-q040 correct.zh | 利害关系者 | OK (L4 第 2 回保留) |
| 6 | keep-decision | jpword | translations 2013h25a-q047 choices.エ.zh | 多重化 | OK (「硬件的多重化（冗余化）」) |
| 7 | keep-decision | jpword | strategy-02-08-u01 fig rows[0].cells[0].zh | 事业者 | OK (GS1 事业者代码 = 固有名) |
| 8 | tb-jp-unmarked | zh-kana | strategy-03-10-u07 pairs[0].rows[3].a_zh | み | OK (行见出し「日语中的别称」，上澄み吸収価格戦略) |
| 9 | tb-jp-unmarked | en-cjk | 同 rows[3].b_en | 市場浸透価格戦略 | OK |
| 10 | tb-jp-unmarked | jpform | 同 rows[3].b_zh | 場 | OK |
| 11 | tb-jp-unmarked | jpform | 同 rows[3].b_zh | 戦 | OK |
| 12 | tb-jp-unmarked | jpform | technology-20-53-u03 terms[5].detail_zh | 複 | OK (「体现在日语名称“複合”上」) |
| 13 | tb-jp-unmarked | en-cjk | technology-21-55-u01 terms[4].term_en | 表 | OK (「Table (Japanese term 表)」) |
| 14 | d189-label | en-cjk | en.json Practice.terms | 用語 | OK (70978b70 直接改动) |
| 15 | d189-label | en-cjk | en.json Record.colStars | 頻出度 | OK (7e7f4b27 D-189 today page 起即三语同值；非 70978b70，见 L-1) |
| 16 | d189-label | R-same | en.json Record.colStars | 頻出度 | OK (同上) |
| 17 | d189-label | en-cjk | en.json Today.colStars | 頻出度 | OK (同上) |
| 18 | d189-label | R-same | zh.json Practice.preamble | 共通前文 ▸ | OK (70978b70) |
| 19 | d189-label | R-same | zh.json Practice.qLabel | 問 | OK (70978b70) |
| 20 | d189-label | jpform | zh.json Record.sortStars | 頻 | OK |
| 21 | ui-same-chinese | R-same | zh.json Practice.countAll | 全部 | OK |
| 22 | ui-same-chinese | R-same | zh.json Practice.scope_exam | 年度 | OK |
| 23 | ui-same-chinese | R-same | zh.json Today.aiReview | AI 分析 | OK |
| 24 | ui-same-chinese | R-same | zh.json Today.colActions | 操作 | OK |
| 25 | proper-name | zh-kana | 2024r06-q099 correct.zh | みちびき | OK (「在日本称为「みちびき」」) |
| 26 | proper-name | jpform | translations 2009h21a-q099 stem.zh | 込 | OK (本驹込，中文地名写法) |
| 27 | proper-name | jpform | translations 2009h21a-q100 stem.zh | 込 | OK |
| 28 | bracket-original | en-cjk | 2011h23tokubetsu-q013 correct.en | 戦略的提携 | OK |
| 29 | bracket-original | jpform | 2012h24h-q041 correct.zh | 業 ×2 | OK (「日语称作業分解構成図／作業分解構造」) |
| 30 | bracket-original | en-cjk | 2014h26h-q008 distractors.エ.en | 最高執行責任者 | OK (「in Japanese, …」) |
| 31 | bracket-original | jpword | 2020r02o-q036 distractors.イ.zh | 结合测试 | OK (「集成测试（结合测试）」) |
| 32 | bracket-original | zh-kana | 2022r04-q040 distractors.イ.zh | フレーム | OK (「共通框架（共通フレーム，SLCP-JCF）」) |
| 33 | question-data | en-cjk | 2024r06-q093 distractors.ア.en | 千葉翔 | OK (LIKE %葉_ 的匹配对象) |
| 34 | question-data | jpform | 2024r06-q093 distractors.ア.zh | 葉 ×2 | OK |
| 35 | question-label | zh-kana | translations 2009h21a-q095 stem.zh | い | OK (商品あ〜こ) |
| 36 | jp-explained | zh-kana | 2013h25a-q054 points[0].zh | のいずれか | OK (解释日语检索词) |
| 37 | jp-explained | zh-kana | 2019r01a-q008 points[1].zh | シティ | OK |
| 38 | same-formula | R-same | translations 2016h28h-q080 choices.ア.zh | IF(… 整数部 …) | OK (试题表计算记法) |
| 39 | tb-data | en-cjk | technology-21-56-u01 terms[2].points[1].text_en | 山 ×4 | OK (LIKE "%山") |
| 40 | locale-name | en-cjk | en.json Locale.ja | 日本語 | OK |

结果：**40/40 合法，理由正确，键 = rule + file + path + 精确文字 + 次数**，无隐藏真实混入的条目。

追加全读 (因分层抽样对这三类覆盖偏少)：**tb-jp-unmarked 24/24、ui-same-chinese 12/12、proper-name 7/7** 逐条对照 ja/zh/en 兄弟值，全部合法。
- tb-jp-unmarked：公開 (TOB 的「公開」)、共食い (日语译名说明)、上澄み吸収価格戦略 / 市場浸透価格戦略 (「日语中的别称」行)、中央値 / 最頻値 (行见出し 和名)、エッジ / 辺 (goals_en[1] 与 terms[3].detail_en；后者同句 ノード 已有 `[[jp:]]` 而 辺 没有 = 半标)、手続 (zh/en)、拡張 / 複合、表、マイモ、シーサート / ソック (「日语读作」)、本人拒否率 (「Japanese materials may write」)。全为意图内日语缺 `[[jp:]]`，与 minor D (4) 一致。
- ui-same-chinese：辞典 今日 未回答 年度×2 全部 保存×2 停止 要点 AI 分析 操作，均为同义的普通中文 (今日 / 未回答 偏书面，可接受)。
- proper-name：栃木县、みちびき×2 (「在日本称为」)、本驹込×4。

重点类补充核对：
- **d189-label vs `70978b70`**：该 commit 的 messages 差分只含 Practice 的 qLabel / starsLabel / preamble / sourcePrefix / explanation(Tab) / correct / pointsTitle / terms / answerTag。生成器另列入 `Practice.cat_*` (7c993eac D-187)、`Today.colStars` / `Record.sortStars|colStars` (7e7f4b27「D-189 today page」)、`Mock.randomLead` 内的三系名。判别依据不是「创建时 zh = ja」(Mock.colKey 创建时 zh 也 = ja，却是混入)，而是 **en 也是日语** 且有设计陈述：`apps/web/src/lib/practice/practiceLabels.ts:7`「the JP 分野 tag in every locale」、`L3_audit.md` A10 (测试断言 `<span lang="ja">`) 与 l.188 (推荐把 70978b70 一览 + `cat_*` + siteName 做成 key 级 fixture)；頻出度 三键 en 也是「頻出度」。判定成立；类说明只写「D-189 (70978b70)」不准确 (L-1)。`Mock.colKey` 已正确排除 (`9f3478e7` D-192 加入时 en = "Key")，writer 对 `L4_review.md` l.23 的推翻成立。
- **keep-decision**：fixture 合计 过去问 6 (仅 zh.json)、多重化 22、误答 7、利害关系者 10、事业者 4、满足度 1、利用者 1 (共同利用者 B0490)。**词集合**与 D-222.2 / D-222.3 / D-222 改訂 / L4 第 2 回 minor D 一致 (`L4_apply_round2.md` l.66「多重化・误答・利害关系者・… = 残す語」)；**数目**只有 事业者 4 与 满足度 1 在 session log l.145 有记录可对，多重化 / 误答 / 利害关系者 的数目 L4 文书未列，只能确认「= 当前 corpus 的出现数」(gate 无 stale、无未许可)。
- **tb-jp-unmarked**：抽到的 6 条都是「日语别名」行或「日语名称」说明，确为意图内日语、只是缺 `[[jp:]]`；session log 末尾 minor D (4) 已决定后续补印、在此之前留在许可表。
- **ui-same-chinese / proper-name**：均为正常中文或固有名。

## 3. 范围除外与未覆盖面

### 已核实的除外
- **derived**：DERIVED 正则与 `validateV2.ts` 的 compat 字段完全对应 (l.618 intro / 624 key_points / 659 definition / 669 explanation / 700–706 memory_hook / 794 memory_hooks)。R-empty / R-same 不被除外 (G4 证实)。derived guard 以 file(=单元)|lang 为单位，L1/L2 证实生效；字集合粒度的漏洞 (L3) 被 `apps/web/src/lib/textbook/__tests__/v2-corpus.test.ts`「validateV2: 0 issues each」的 compat 等值检查兜住——**但前提是 vitest 与关门一起跑** (见 L-3)。
- **key_guard.\***：无渲染路径。`quizReader.ts:117` 只取 `key_guard?.suspect`；components 中无 `note_jp` / `key_guard` 引用；`apps/web/src/lib/staticData/forbidden.ts` 把 `key_guard` / `round1` / `note_jp` / `derived_answer` 列为禁止出货键，供 /data allow-list test 与 out/ 扫描使用。除外成立。

### 独立普查 (不依赖扫描器自报的 unscanned 表)

对 244 单元 + unit_index + 29 解说文件做全部字符串叶子普查 (scratch `census.ts`)：187,272 叶，作为语言组成员被扫 160,422，非成员 26,850；扣除扫描器自报的 unscanned 26,031 后剩下的模式只有 `lang_status.{jp,zh,en}` (732)、解说文件顶层的 `exam_id` / `source_note` (58) 等元数据 → **没有被 `walk()` 静默丢弃的语言文本**。translations (只有 stem / choices / stem_jp_clean) 与 questions.json 的键也全部核对过。`fig.data.nodes[].id` 1,740 个全部是 ASCII 键 (flow 图的 React key)，0 个含 CJK。

apps/web 非测试源码中的 CJK 字面量 (grep)：仅品牌名 (`layout.tsx:44`)、语言简称 日/中 (`LocaleSwitcher.tsx`、`ExplanationPane.tsx`)、ja/zh 日期格式「M月D日」(`TodayPage.tsx:83`，en 走 Intl)、选项记号 ア〜エ、AI 先生的提示词/升级关键词 (`lib/sensei/*`、`lib/tutor/escalation.ts`，非 UI 文案)。均属设计内，但不在关门范围。

### 未被关门扫描的面 (清单)

| 面 | 是否渲染 | 现状 | 评价 |
|---|---|---|---|
| `data/ip/textbook/figures/*.svg` (409 文件；v2 单元中 50 个 term 的 `fig.kind = svg` 经 `SvgFig.tsx` 以 innerHTML 内联) | **是，zh/en 页同样显示** | 含日语文本节点 1,317 个 (如 単体テスト / 受入れテスト) | 未覆盖。Stage 7 记录 (`technology-18-49-u02.ruleA.md` L10) 已把它定为「ラベルは jp のみ、parity の対象外」，但 L5_gate.md §7 没写 → L-2 |
| `terms[].figure.mermaid` (50) | 否 (SVG 的源) | 未扫 | 无影响 |
| `data/ip/quiz/quiz_index.json` topics 的 `major_zh/en`、`medium_zh/en` | **是** (`BrowseList.tsx:51` `localized(...)`) | 未扫；本审查用 lib 函数离线扫 126 组 → 0 当たり | 现在干净但无守护 → L-2 |
| quiz_index `name_jp`、exams `label_jp` | 是 (所有 locale) | 只有 jp | 设计如此 (题目分类名/年度名统一日语) |
| `overview_rows[].term`、`pairs[].a/b` | 是 (term 名；pairs 经 gloss 映射，找不到才回退到日语) | 未扫 (unscanned 表) | 设计如此 (term 键 = 日语) |
| `source_figures[].figure_description`、unit_index 的 `*_jp` 内部欄 (rationale / order_reason / planning_notes) | 否 | ja-only 扫 R-ja-simp | 无影响 |
| `data/ip/quiz/chumon_groups.json`、`figure_index.json`、`zh_terms.json`、`unit_minutes.json` | 否 (或无语言文本) | 未扫 | 无影响 |
| 试题 PNG 图 (IPA 原图) | 是 | 不可扫 | 设计如此 (原题) |
| apps/web 源码内的硬编码 UI 字符串 | 是 | 未扫；现仅品牌 / 语言简称 / 日期格式 | 设计如此，记录即可 |
| /data 分片、`out/` HTML | 是 | 关门扫的是源；分片由这些源投影生成 (`staticData/build.ts`)，quiz_index 除外 | 源覆盖即可，quiz_index 见上 |

## 4. 3 处修正

逐叶比较 `git show HEAD:` 与工作树 (JSON 展平，ja/zh/en 三个 messages 与两个 sidecar)：

| 文件 | 叶数 | 变化 | 内容 | 判定 |
|---|---|---|---|---|
| `apps/web/messages/zh.json` | — | 1 (`Mock.colKey`) | 正解 → 正确答案 | 正确；与同表 `colYours`「你的答案」对称；ja/en 0 变化 |
| `data/ip/quiz/explanations/2015h27a.json` | 2,506 | 1 (`2015h27a-q085.points[1].en`) | COUNTIF (条件计数) → COUNTIF (conditional count) | 正确 (与 zh「条件计数」、ja「条件付個数」对应) |
| `data/ip/quiz/translations/2022r04.json` | 1,073 | 1 (`2022r04-q074.stem.zh`) | 尾随（共连れ）→ 尾随（共連れ） | 正确 (ja stem「共連れの防止対策」) |

`git diff HEAD --stat -- data apps/web/messages` = 3 文件各 1 行。`l5-fix-apply.ts` 有「恰好 1 次」与序列化往返检查，路径与 L4 相同 (解说经 `.phase2` → merge)。

## 发现

### HIGH
无。

### MEDIUM

**M-1 R-ja-simp 只认 60 字表，常见简体字混入 ja 不会失败** (confidence HIGH；L5_gate.md §7 已自述此限制，本项是「低成本可消除的已知限制」)
- 证据：`scripts/lib/lang-leak.ts:47-50` `SIMP_ONLY`；`jaSimp` (l.154) 只查这张表。合成用例 F3「东京」、F4「车」→ `--gate` exit 0。
- 同文件 l.79 已有 `isSimplifiedHan` (GB2312 有、Shift_JIS 无)。本审查用它离线扫全部 ja 欄 (排除 key_guard)：SIMP_ONLY 之外只多 **1** 个：`unit_index.json topics[20].units[0].terms[6].order_reason_jp`「全題库」(内部欄，不渲染，本身是笔误)。
- 为何仍定 MEDIUM：审查任务明确要求「ja 中的简体字」必须令 gate 失败；SIMP_ONLY 只占 GB2312∖Shift_JIS 简体字的一小部分，而通用判定的代价只是 1 个内部欄当たり。
- 修正：`jaSimp` 改为 `SIMP_SET.has(c) || isSimplifiedHan(c)`；对那 1 处修正笔误或给 unit_index 的 `*_reason_jp` 类内部欄加 scope_exclusion；补一条 test (东/车)。

**M-2 生成器类过宽：重生成会把新混入吸收进 fixture，并报告 `unclaimed 0`** (confidence HIGH)
- 证据：scratch 中注入后跑 `l5-build-allowlist.ts` (dry-run)：
  - 在任意解说 zh 中加「服务器采用二重化。」(L4 判定的 LEAK 词，无括号) → `+ bracket-original R-zh-jpword … «二重化»`，unclaimed 0。原因：`{ cat: "bracket-original", rules: ["R-zh-jpword"], text: /^(结合测试|单体测试|二重化)$/ }` 无 path、无括号条件。
  - 任意位置新增「多重化」→ `+ keep-decision`。多重化 / 误答 / 事业者 / 利害关系者 的类均无 path 限制。
  - 在 bracket-original 的题 (2022r04-q040) 加「これが正しいです」→ `+ bracket-original` 两条 (qid 级的 KANA_CJK_FORM 类无 text 限制)。
  - tb-jp-unmarked 单元任意 `detail_zh` 加「のです」→ `+ tb-jp-unmarked` (11 单元 × 所有规则 × 任意文本)。
  - zh.json `Practice.correct` 改成「正解です」→ `+ d189-label` (Practice 行无 text 限制)。
- 影响：fixture 本身精确，现时没有被掩盖的混入；但 L5_gate.md §6 规定数组重排/path 变化、以及 tb-jp-unmarked 补印后都要 `--write` 重生成，此时防线只剩人读 `+` 行，摘要行 `unclaimed 0` 反而给出「干净」的信号。agent 驱动的流程里这是可预见的失误点。
- 修正 (任选组合)：(a) keep-decision 与 jpword bracket-original 类改为枚举现有 path (或 `when` 要求括号/「日语」语境)；(b) qid 级类加 `text` 白名单；(c) tb-jp-unmarked 改成 (path, text) 精确枚举；(d) 生成器在出现新 `+` (fixture 中没有的键或 count 增加) 时 exit 非 0，需 `--accept-new` 才写入，并在摘要行打印 `new claims N`。

### LOW
- **L-1** `d189-label` 类说明写「D-189 (70978b70)」，但包含 `Practice.cat_*` (7c993eac / D-187)、`Today/Record` 的 頻出度 (7e7f4b27)、`Mock.randomLead` (9f3478e7 / D-192)。判定本身成立 (均为创建即三语同值)，说明应改为「D-189 设计，70978b70 + 创建即三语同值的键」并列出 commit。
- **L-2** L5_gate.md §7「限界」没有列出：SVG 图 (50 term，1,317 个日语文本节点，zh/en 也显示；Stage 7 已定为 parity 对象外)、`quiz_index.json` 的 `major/medium_zh/en` (渲染但不在源列表，现 0 当たり)。建议把 quiz_index 加入 `collect()` (walk 即可，零新许可)，SVG 在 §7 写明「设计上日语、关门不扫」。
- **L-3** H6 方案只在 build 前跑 `--gate`。derived 字集合漏洞 (L3 用例) 靠 vitest `v2-corpus.test.ts` 的 compat 等值兜底；接入时应同时跑该 test (或在 gate 内调用 validateV2 的 compat 检查)，否则单独的 gate 会放过「用本单元已有字拼出的新日语」。
- **L-4** stale 许可项不失败。修好的混入若未重生成 fixture，旧条目会继续放行同 path 同文的再次混入。建议 `--gate` 对 stale 至少打印醒目警告，或在 CI 中把 stale > 0 视为失败。
- **L-5** 关门尚未接入任何 CI / prebuild (repo 无 `.github/workflows`，`apps/web/package.json` 无 prebuild)，「恒久」要等 H6 才成立；L5_gate.md §6 已如实写成「案」，记录即可。

## 各视角补充
- 执行者：`--gate` 1.3 s、零依赖、Node ≥ 23，可直接进 Cloudflare build；输出可读 (rule / file / path / 文本 / excerpt)。
- 利益相关者：本步目标「新混入会让 build 失败」在 fixture 冻结的前提下成立；M-1 补完后对 ja 欄也成立。
- 怀疑者：最强反论是「许可表靠重生成维护，重生成会吸收」——即 M-2；规则层面的过宽 (括号遮罩、WARN 词、字集合 guard) writer 已在 §7 自述。

## 判定理由
- 审查模式：THOROUGH (无 CRITICAL，MAJOR/MEDIUM 2 个，未达升级条件)。
- Realist check：M-1 不降级——简体字进 ja 是本关门声称要防的类型，且修正成本极低；M-2 定为 MEDIUM 而非 HIGH——fixture 现状精确、生成器会打印 `+` 行、fixture 变更在 git diff 中可见，属于流程风险而非现存漏洞。
- 升级为 APPROVE 的条件：M-1 改用 `isSimplifiedHan` 并补 test；M-2 至少做 (d) (新 claim 时非 0 退出) 或 (a)+(c)；L-1/L-2 在 L5_gate.md 记录。

## 未决问题 (不计分)
- `Practice.correct` 等 d189 键在 zh 页显示日语「正解」而 `Mock.colKey` 用「正确答案」，同一应用内两种叫法——属 D-189 / D-192 的产品判断，不在 L5 范围。
- 「今日」(App.nav.today) 作为中文导航是否偏书面，属文案判断，判为可接受。

---

## 再審 (2026-11-11、同一 reviewer、同一规则：repo 只读，scratch `l5rev` 重新拷贝最新 scripts / fixture / data / messages)

### 结论：**APPROVE**

M-1、M-2、L-1 至 L-5 全部按「審査対応」落实，并经实测验证。没有新的 HIGH / MEDIUM。

### (1) 合成用例重跑 (36 例 + H4/H5 + quiz_index 新增 2 例)

- 所有混入用例 exit 1：A、B、C1–C2、D1–D3、E1–E3、F1–F2、G1–G4、H1–H5、I1–I2、J1–J2、K、K2、L1–L2、M2、N1。
- **F3 ja「东京」、F4 ja.json「正解车」现在 exit 1**，由 R-ja-simp 拦截 (M-1 已修)。
- quiz_index `topics[0].medium_zh` 加「の」→ R-zh-kana；`topics[1].major_en` 加「基礎」→ R-en-cjk。两例都 exit 1 (L-2 已修)。
- 仍为 exit 0 的只有设计内 / §7 已自述的 4 例，与初审相同：
  - L3：derived 欄用 `[[jp:]]` 已有的字拼成新词 (由 v2-corpus.test 兜底，§6 已要求一起跑)
  - M1：quiz 括号内的纯汉字日语
  - N2：`[[jp:正解]]`
  - N3：「部署」在 ja 中无对应
- 基线 / 终态均 PASS。

### (2) 吸收测试 (`l5-build-allowlist.ts`；每例分别跑 `--write` 和 `--write --accept-new`，并比较 fixture 哈希)

| # | 注入 | `--write` | `--write --accept-new` |
|---|---|---|---|
| 1 | 无括号「二重化」 | UNCLAIMED，fixture 不变 | 同左 |
| 2 | 别处新增「多重化」 | UNCLAIMED，不变 | 同左 |
| 3 | bracket-original 题加「これが正しいです」 | UNCLAIMED ×2，不变 | 同左 |
| 4 | tb-jp-unmarked 单元加「のです」 | UNCLAIMED，不变 | 同左 |
| 5 | `Practice.correct`=「正解です」 | UNCLAIMED ×2；旧的 2 条精确值项作为 dropped 被写出 (exit 0) | UNCLAIMED，不变 |
| 6 (新) | 已列 qid 中加括号内假名「请注意（ちゅうい）」 | **`+ NEW` 行，exit 1，fixture 不变** | 打印 `+ NEW`，写入 |
| 7 (新) | d189 值「問」挪到另一个 Practice 键 (`scope_topic`) | UNCLAIMED，不变 | 同左 |
| 8 (新) | 未列入的 qid 加「日语称「派遣です」」 | UNCLAIMED，不变 | 同左 |
| 9 (新) | question-data 题 (2011h23a-q073) 加假名词 | UNCLAIMED，不变 | 同左 |

- 初审的 5 个吸收例都不再被 claim，关门会继续失败。
- 能被 claim 的新文字只剩「已列 qid 内、括号内」这一形态 (例 6)。这一形态没有 `--accept-new` 就 exit 1、不写文件；加了它会逐条打印。完全符合要求。
- 补充说明：例 1–5 没有新 claim，所以 `--write` 是 exit 0。混入仍是 unclaimed，不会写进 fixture，`--gate` 照样失败，因此不构成漏洞。

### (3) stale 项

在 scratch 中删掉 `2024r06-q099.points[0].zh` 里的「，みちびき」：
- `--gate` **exit 1**，打印 stale 行和 refresh 命令。
- 复原后 PASS。

### (4) unit_index 修正

与 HEAD 逐叶比较 (9,945 叶)，只有 `topics.20.units.0.terms.6.order_reason_jp` 一个叶子变化：「全題库」→「全題庫」。
`git diff HEAD --stat -- data apps/web/messages` 共 4 文件、各 1 行 (之前的 3 处 + 此处)。

### (5) 在 repo 中运行

- `node --no-warnings scripts/lang-leak-scan.ts --gate` → **exit 0，PASS**。
  - 522 entries；groups 89,833 (+218 quiz-index)；hits 7,602；allowed 659。
  - derived 6,010；key-guard-note 193 (R-ja-simp 扩展后，note_jp 内部欄的命中增加，不渲染)。
  - punct-only 543；warn 197；key 集合 0/0。
- `node --test scripts/lang-leak-scan.test.ts` → **22/22 pass**。

### 发现

- HIGH：无。
- MEDIUM：无。
- LOW-R1：`--write` 在存在 unclaimed 时仍 exit 0。如果单看生成器的退出码，可能误以为「已干净」。建议 unclaimed > 0 时也非 0 退出，或在摘要中提示「gate will fail」。不影响关门本身。
- LOW-R2：`--write` 允许无确认地 drop 条目 (例 5)。符合「- 行だけなら書ける」的设计，fixture 的 diff 在 git 中可见。记录即可。
