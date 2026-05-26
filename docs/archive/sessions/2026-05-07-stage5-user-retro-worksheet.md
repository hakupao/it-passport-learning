# Stage 5 User Retro — 工作表（Session 09 闭后续）

> **本文件用途**：Session 09 已经在 `6da5022` 关掉，但 Stage 5 的最终业务签字
> 需要 user 用学习者的眼睛独立审查实物（per 规则 D Writer/Reviewer 隔离 +
> 规则 A 语义抽检）。本工作表是 user 离线审阅清单 + 决定填写处。
>
> **使用方式**：每个 § 都是 "**背景**（why we are looking at this）→ **你看
> 什么**（how to look）→ **我的发现 / 提议**（claude's spotted issues）→
> **你的答案**（fill in here）"。一段段读，一段段填。
>
> 完成后，把本文件 commit 到 git，我下次 Session 10 起手会读它，把
> answers 纳入 (a) `evidence/.../step_05_audit.md` Stage B reviewer 行的
> 业务签字，(b) Stage 6 reviewer LLM 的 catch 列表，(c) 必要时新 D /
> failure / OQ。

---

## A. Glossary 抽检（必做 · 估 10-15 min）

### A.1 背景

Stage 4.5 跑出的 `glossary.json` 是**整个三语管道的术语锚点**：

- 55 条术语 × 3 语言 = 165 个核心字符串
- 18 条带 `kana_helper`（katakana 词的罗马音 + 中文概念）
- Stage 5 翻译时会先在 glossary 查表 → **117 处自动套用 glossary 翻译**（page_043 选项里 e-ラーニング → 在线学习 / e-Learning 就是这么来的）
- 一条术语翻错 = 全管道下游每次引用它的地方都跟着错（dry-run 这版还能补救；全本 579 pages 错一条可能波及 100+ 处）

**为什么 user 必须看**：claude 不是 IT 教材中文圈的专家。"行内标准译名" 这种东西只有有真实学习者经验的人能判（e.g. ステークホルダ → "利益相关者" vs "利害相关者" 中文圈哪个常用？）。

### A.2 你看什么

打开文件：

```
data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/glossary/glossary.json
```

55 条 entries，每条结构是：

```json
{
  "id": "g_001",
  "surface": {"jp": "...", "zh": "...", "en": "..."},
  "first_page": 14,
  "occurrences": [14, 30],
  "kana_helper": null   // 或 {"reading": "...", "zh_concept": "..."} 仅 katakana 词
}
```

**重点扫这 4 类 issue**：

1. **行内中文译名是否标准**：抽 8-10 条常见 IT 术语（CEO / CIO / CSR / SDGs / FinTech / e-ラーニング / ステークホルダ / ダイバーシティ / コンピテンシ / ブレーンストーミング 等）→ 中文圈学习这本教材的人会不会觉得译法别扭？
2. **kana_helper 罗马音是否正确**：18 条 katakana 词的 reading 字段。例如 `ステークホルダ` → `suteekuhoruda` 看着对吗？
3. **英文缩写展开是否对**（CEO / CIO / CFO / SDGs / WHO / UNESCO 等）：括号里的全称展开有没有错。
4. **alias 合并对不对**：g_033 把 `プレーンストーミング`（OCR typo）合并到 `ブレーンストーミング` — 这种 typo 修正 OK 吗？还有别的合并是不是也合理？

### A.3 我的发现 / 提议

我之前在 step_04_5_audit.md 里 sample 过 8 条，全 PASS（CEO / CSR / e-ラーニング / コンピテンシ / ブレーンストーミング / ワークライフバランス / 回帰分析 / 環境アセスメント）。但这 8 条是我挑的、不一定能 catch 中文译法的"行业惯用"问题。

**1 个我自己有疑虑的点**：`グリーンIT` 的 `surface.zh = 绿色IT`，`kana_helper.zh_concept = 绿色信息技术`。这两个不冲突但有点别扭（一个是字面 surface，一个是长形概念）。F-GREENIT-CONCEPT 已记入 step_04_5_audit §F3。问 user：你看这种 surface vs concept 的分裂能接受不？

### A.4 你的答案

**A.4.1 整体 verdict**：

- [ ] PASS — glossary 可以原样进 Stage 6
- [x] WARN — 有几条要修但不阻塞 Stage 6（列在下面 A.4.3）
- [ ] FAIL — 太多 issue，需要重跑 Stage 4.5 再说

**A.4.2 你具体看了哪些条**（列 ID 或术语）：

```
我会全部都看，修改意见放在了 evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/glossary_translation_review_2026-05-07.md
```

**A.4.3 发现的具体问题**（每条独立一行，格式：`g_NNN | jp | zh-issue | proposed-fix`）：

```
证据总表：evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/glossary_translation_review_2026-05-07.md

g_025 | ステークホルダ | 用户疑问：是否应为 ステークホルダー | 已确认：不是 OCR 丢长音。ocr/page_034.md、vision_full/page_034.md、structured/page_034.json、translated/page_034.json、glossary.json 全部都是 ステークホルダ；IT Passport 相关题库/用语页面也能看到 ステークホルダ 这种写法。建议：jp 保持原书表面形；如全本遇到 ステークホルダー，可作为 alias_jp 合并，但不要擅自改源 jp。
g_025 | ステークホルダ | zh = 利益相关者；kana_helper.zh_concept = 利益相关方 | 建议统一。IT/项目管理语境更推荐 利益相关方；CSR/商业读物语境 利益相关者 也能接受。不要用 利害相关者 作为简中主锁。
g_003 | CDP | en = Career Development Plan (CDP) | 应改为 Career Development Program (CDP)。源页定义是 Career Development Program（経歴開発プログラム）。zh 可用 职业发展计划，若追求 HR 语境清晰度可改 职业生涯发展计划。
g_008 | COP21 | zh/en 只写第21届气候大会/Conference of the Parties，不够适合作 glossary lock | 建议 zh = 《联合国气候变化框架公约》第21次缔约方会议（COP21）；en = COP21 或 21st Conference of the Parties to the UNFCCC (COP21)。若锁为长形，Stage 5 容易产生嵌套括号。
g_039 | 事業 | zh = 事业 偏日式；page_038 定义是 複数の業務 | 建议按上下文改 业务 或 事业（业务板块）。注意 事業部制組織 仍可保持 事业部制组织。
g_048 | 環境アセスメント | zh = 环境评估；en = Environmental Assessment | 应改为 环境影响评价 / Environmental Impact Assessment。源定义是 環境影響評価のこと。
g_020 | エコファーム | zh = 生态农场；en = Eco Farm | 源定义是 环境保全型农业。建议考虑 生态农业 / Eco-farming，或 环境友好型农业 / Environmentally friendly agriculture。
g_012 | HRテック | zh = 人力资源科技 | 可接受但不够行业化；建议 HR科技（人力资源科技）。en OK。
g_030 | パレート図 | zh = 帕累托图 | 可接受；建议 learner-facing glossary 写 帕累托图（排列图），避免 Excel/质量管理语境中“排列图”的常见叫法造成困惑。
g_038 | ワークライフバランス | zh = 工作与生活平衡 | 可理解但生硬；建议 工作生活平衡。
g_054 | 経営者 | en = Executive; Manager | 太含混；建议按教材语境定为 Business manager / Executive / Business operator 之一，避免分号锁。
```

**A.4.4 grünesIT vs 中文概念分裂**（A.3 我提的）：

- [x] 接受现状（surface 短译名 + kana_helper 长概念）
- [ ] 改：surface.zh 应改成 `n/a（本轮不改）`
- [ ] 改：kana_helper.zh_concept 应改成 `n/a（本轮不改）`

补充建议：接受现状可以进 Stage 6，但 Stage 6 reviewer 应把 `surface.zh` 与 `kana_helper.zh_concept` 不一致列为 WARN-only 数据一致性项，不要当作翻译 FAIL。

---

## B. page_043 questions 实物抽检（必做 · 估 10 min）

### B.1 背景

page_043 是 dry-run 里 question 密度最高的一页 — **5 道真实 IT パスポート过去题**（令和 3 年度 / 平成 22 / 28 / 25 / 26 年度）的三语版本。

这是**项目最终目标产物的形态**。Phase 2-4 的题库 / 学习应用 / AI 助手都要靠这种 question 实体喂。

### B.2 你看什么

打开文件：

```
data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/translated/page_043.json
```

5 个 question 实体 + 1 个 figure。每个 question 结构：

```json
{
  "type": "question",
  "stem": {"jp": "...", "zh": "...", "en": "..."},
  "choices": [4 个 trilingual 选项],
  "answer_index": 0   // 0=ア, 1=イ, 2=ウ, 3=エ
}
```

**重点判断 4 件事**：

1. **stem 三语完整性**：你（不会日文的中/英学习者视角）能从 zh 或 en 准确理解这道题在考什么？还是说要看 jp 才搞得懂？
2. **answer_index 一致性**：jp 原题答案是 ア（最常见）→ zh 和 en 选项里"最像答案"的那个还是不是第一个？(注：答案对错由出题方定，**我们只检查三语版本是否仍然指向同一个语义答案**)
3. **F-CHOICE-MARKER 你是否在意**：Q1 用了 A/B/C/D；Q2 头两个 A/B 后面突然 ウ/エ；Q3 全保留 ア/イ/ウ/エ；Q4 zh 保留 ア/イ/ウ/エ 但 en 用了 a/b/c/d 小写；Q5 混乱。这种不一致会影响学习吗？还是 Stage 7 export 统一 normalize 就 OK？
4. **教材专有内容译得对吗**：例如 Q4 里 "事業部制組織" 的 4 个选项描述（购買・生産・販売・財務 / 利益責任 / 自己完結的な経営 等），这种业务管理学语境的中文译法你看着习惯吗？

### B.3 我的发现 / 提议

我已经标了 **F-CHOICE-MARKER**（cosmetic WARN，非阻塞），具体见 evidence step_05_audit.md Stage B audit 表 page_043 行。

**没标的潜在问题**：Q1 的 stem 长达 73 字 jp（"企業の人事機能の向上や、働き方改革を実現することなど..."），这种长 stem 在 zh / en 里被压成单句还是多句？信息有没有丢？这是 user 比 claude 更适合判的事。

### B.4 你的答案

**B.4.1 整体 verdict**：

- [ ] PASS — 5 题三语都能让学习者用，可以进 Stage 6
- [x] WARN — 至少 1 题 stem / choices 翻译有问题但不阻塞
- [ ] FAIL — 题目翻译质量不可接受，需要换 prompt 或换 tier 重跑

**B.4.2 5 题逐题打分**（PASS / WARN / FAIL + 一行 reason）：

```
证据：evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/page_043_translation_review_2026-05-07.md

Q1 (令和3年度, HRTech): WARN — stem zh/en 语义忠实；HRTech 译名可接受但 zh 建议 HR科技（人力资源科技）；结构上 answer_index 应为 2（ウ）而不是 0。
Q2 (平成22年度, グリーンIT): WARN/FIX — stem 语义忠实；環境アセスメント 应修为 环境影响评价 / Environmental Impact Assessment；choice marker 混乱；answer_index 应为 2（ウ）而不是 0。
Q3 (平成28年度, 組織形態 + figure): WARN — stem/caption/主要术语忠实；社内ベンチャー組織 可优化为 企业内部创业组织 / In-house venture organization；choice marker 保留日文，与其他题不一致；answer_index 应为 2（ウ）而不是 0。
Q4 (平成25年度, 事業部制組織): WARN — 语义大体忠实；“自我完结型经营活动”偏直译，建议“能够独立/自成体系地开展经营活动”；en 的 specific theme 建议改 specific issue/task；answer_index 应为 3（エ）而不是 0。
Q5 (平成26年度, CIO): WARN — 术语翻译正确；stem 可微调为“企业高管职位中，负责统管信息系统的最高负责人是哪一个？”；choice marker 混合 a/b 与 ウ/エ；answer_index 应为 2（ウ）而不是 0。
```

**B.4.3 F-CHOICE-MARKER 处理**（3 选 1）：

- [x] (A) 我介意，Stage 6 reviewer 应当 flag 成 WARN，Phase 2 prompt-tune
- [x] (B) 我不介意，Stage 7 export 时 normalize（jp 保留 `ア/イ/ウ/エ`；zh/en 统一成 `A/B/C/D`）
- [ ] (C) 完全不管，下游应用层（Phase 3 web app）渲染时再处理

最终建议：这里实际是 **A+B 组合**，不是互斥。Stage 6 reviewer 应 flag 成 WARN；Stage 7 export 负责统一显示。原始 jp 保留 `ア/イ/ウ/エ`，zh/en export 统一显示为 `A/B/C/D`。

**B.4.4 其他问题**：

```
关于 B.4.3 F-CHOICE-MARKER 处理，日语保持原样，中文和英文都要统一成ABCD
其余 review 我都写进了文件 evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/page_043_translation_review_2026-05-07.md

补充：page_043 的最大阻塞不是翻译质量，而是 answer_index 全错。vision_full/page_043.md 答案行为：問題1-5 ウ / 1-6 ウ / 1-7 ウ / 1-8 エ / 1-9 ウ，所以 0-based answer_index 应为 [2,2,2,3,2]。Stage 6 reviewer 必须新增“answer_index vs source answer line”检查，否则 Stage 7/Phase 3 会把错答案带入题库。
```

---

## C. page_045 term-density 实物抽检（必做 · 估 5 min）

### C.1 背景

page_045 是 dry-run 里 term 密度最高的一页 — **19 条术语挤一页**（Stage 5 跑了 5 个 sub-batch 才完事）。definition 都是短句（"农业にITを活用すること" 这种），单条错误成本低，但 19 条一起容易暴露**系统性翻译习惯问题**。

也是 F-COP21 cosmetic finding 的发生页。

### C.2 你看什么

打开文件：

```
data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/translated/page_045.json
```

19 个 term 实体，每个 surface + definition 三语。

**重点扫**：

1. **国际机构名**（SDGs / COP21 / UNESCO / WHO）的中文标准译法对不对？特别是 **COP21** 我标了 cosmetic F-COP21（en 出现冗余双层括号 `(COP21 (21st Conference of the Parties))`）— 你看是 cosmetic 还是真的丑到不能用？
2. **简单 definition 翻译质量**（19 条都是 1 句话，5 秒看一条够）
3. **职衔类**（CEO / CIO / CFO / COO / 職能別組織 / 事業部制組織）的中文译法是中文圈管理学常用的吗？

### C.3 我的发现 / 提议

我标过：
- **F-COP21**（page_045 ent[16]）：英文 definition 末尾 `…International Rules…(COP21 (21st Conference of the Parties))` 两层括号嵌套。**根因**：glossary 里 COP21 的 en 锁的就是 `COP21 (21st Conference of the Parties)`，模型按 D-074 规则把 locked surface 原样替换进去，外层又有个翻译括号，于是嵌套。Stage 7 export normalize 一下应该可以解决（去掉外层 `(...)`）。

**没标但你可以确认**：term[3] `コンピテンシ` 的 zh = "胜任力" — 这个在中文 HR 圈应该是常用译法（vs "竞争力"），但我没把握。这种"是否中文圈惯用"是 user 比我更准的领域。

### C.4 你的答案

**C.4.1 整体 verdict**：

- [ ] PASS — 19 条术语都翻得到位
- [x] WARN — 个别条目有问题（写在 C.4.3）
- [ ] FAIL — 系统性问题需要 prompt 重调

**C.4.2 F-COP21 处理**（3 选 1）：

- [ ] (A) cosmetic 接受，留着不改
- [x] (B) Stage 7 export normalize 时去掉冗余外层括号
- [x] (C) 改 glossary：COP21 的 en 锁应该简化为 `COP21`（或长形改为 `21st Conference of the Parties to the UNFCCC (COP21)`，但不要锁成会嵌套的 `COP21 (21st Conference of the Parties)`）

补充建议：短期 dry-run 可用 B 修输出；长期全本应做 C 修 glossary 根因。

**C.4.3 其他问题**：

```
我的 review 细节写在了 evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/page_045_translation_review_2026-05-07.md

补充重点：
1. page_045 翻译语义大体 PASS，但 translated/page_045.json 把 3 个 source jp 改写了：HRTech -> HRテック，CIO -> CIO（最高情報責任者），CEO -> CEO（最高経営責任者）。这属于 source preservation issue，Stage 6 应当 catch。
2. 環境アセスメント 应统一为 环境影响评价 / Environmental Impact Assessment。
3. エコファーム 的 Eco Farm / Environmentally conservation-oriented agriculture 不自然；建议按定义改 Eco-farming / Environmentally friendly agriculture，中文考虑 生态农业 / 环境友好型农业。
4. WHO 英文 definition 忠实但不自然，可改为 whose objective is the attainment by all peoples of the highest possible level of health。
```

---

## D. Stage 6 Reviewer "你想 catch 什么" 清单（想做 · 估 5-10 min）

### D.1 背景

Session 10 起手第一题是设计 **Stage 6 audit reviewer LLM**（per D-061）。它是 Stage 5 输出的下一道关 — 跑一遍翻译产物，每页给个 verdict（PASS / WARN / FAIL）+ 具体问题列表。

per D-019 slow-pace 我会在 Session 10 起手开正式 interview，但你预先想好"我想让 reviewer 抓什么"，可以让设计期省 30+ min。

### D.2 候选 catch 项（你勾掉/补充/排序）

每行：你勾"是 / 否 / WARN-only" + 备注。

| # | Catch 候选 | 你的判断 | 备注 |
|---|---|---|---|
| 1 | UNTRANSLATED 残留（Stage 5 兜底） | [x] 是 [ ] 否 [ ] 仅 WARN | FAIL；任何 `UNTRANSLATED` 都不能进 export |
| 2 | Glossary 锁的术语在 jp 里出现但 zh/en 没用锁的版本 | [x] 是 [ ] 否 [ ] 仅 WARN | 分级：锁定术语缺失=FAIL；可接受别名/长短形差异=WARN |
| 3 | zh 或 en 出现幻觉（jp 没说但译文加了） | [x] 是 [ ] 否 [ ] 仅 WARN | FAIL；比较难自动判，但 reviewer LLM 必须给 evidence |
| 4 | zh 或 en 漏掉信息（jp 说了但译文没） | [x] 是 [ ] 否 [ ] 仅 WARN | FAIL；尤其题干条件、否定、数字、答案关键词 |
| 5 | kana_helper 罗马音错误（仅 katakana 词） | [ ] 是 [ ] 否 [x] 仅 WARN | WARN；不阻塞 Stage 6，但进入 glossary cleanup |
| 6 | choice marker 不一致（F-CHOICE-MARKER） | [ ] 是 [ ] 否 [x] 仅 WARN | Stage 6 flag WARN；Stage 7 export normalize；jp 原样，zh/en A/B/C/D |
| 7 | 数字 / 百分号 / 年份 在三语之间不一致 | [x] 是 [ ] 否 [ ] 仅 WARN | FAIL；包括 `17`、年度、页码、百分号、0/1-based index |
| 8 | 专有名词大写错误（en） | [x] 是 [ ] 否 [ ] 仅 WARN | 分级：CEO/CIO/SDGs/UNESCO/WHO 错=FAIL；大小写风格轻微问题=WARN |
| 9 | Trilingual schema 损坏（{jp,zh,en} 字段缺失） | [x] 是 [ ] 否 [ ] 仅 WARN | FAIL；兜底，Stage 5 已经保证但 reviewer 仍应检查 |
| 10 | F-COP21 这种冗余括号嵌套 | [ ] 是 [ ] 否 [x] 仅 WARN | WARN；若导致释义误读再升级 FAIL |
| 11 | answer_index 与原书答案行不一致 | [x] 是 [ ] 否 [ ] 仅 WARN | FAIL；page_043 已暴露 `[0,0,0,0,0]` 应为 `[2,2,2,3,2]` |
| 12 | translated 输出改写 source `jp` 字段 | [x] 是 [ ] 否 [ ] 仅 WARN | FAIL；page_045 已暴露 HRTech/CIO/CEO 被 glossary canonical 反写 |
| 13 | glossary `surface.zh` 与 `kana_helper.zh_concept` 冲突 | [ ] 是 [ ] 否 [x] 仅 WARN | WARN；如 グリーンIT / ステークホルダ，进入 glossary cleanup |
| 14 | glossary 本身疑似不规范，导致页面继承错误 | [x] 是 [ ] 否 [ ] 仅 WARN | 分级：環境アセスメント=FAIL；エコファーム/COP21=至少 WARN |

### D.3 Reviewer 模型 tier 倾向

候选：

- **sonnet**：~5×便宜（pay-as-you-go 真实账单），快，但精细判断弱
- **opus**：贵但准（Stage 5 已证明 opus 在长 context + 复杂规则更稳）
- **haiku**：超便宜，但 Stage 5 sonnet 都吃力，haiku 跑 reviewer 风险大

我倾向：**sonnet 起手 + 抽检发现关键漏判时升 opus**（Stage 6 reviewer 本身就是 audit，多一道 user retro 兜底）

你的选择：

- [ ] sonnet（默认）
- [x] opus
- [ ] haiku
- [ ] 其他：n/a（当前选择 opus；如成本 gate 强制，可先 sonnet smoke-test 再 opus）

### D.4 其他想法 / OQ

```
Stage 6 reviewer 不应只做“翻译流畅度”评分；应输出 machine-readable issue list，并标明 repair_stage：
- Stage 4/structure：answer_index 错、source answer line 未解析、entity type 错
- Stage 4.5/glossary：术语锁不规范、alias 缺失、kana_helper concept 冲突
- Stage 5/translate：jp 被改写、zh/en 漏译/幻觉/术语未锁定
- Stage 7/export：choice marker normalize、COP21 括号嵌套这类 display cleanup

建议 Stage 6 verdict 分两层：
1. translation_fidelity_verdict：只看 jp -> zh/en 是否忠实
2. learner_data_verdict：包含 answer_index、choice marker、schema、jp preservation 等能否进题库/export 的问题

Session 10 待确认问题：是否允许 Stage 7 export 在不改 translated/ raw 数据的前提下修复 display-only 问题？建议允许，但必须在 export report 里列出 normalization ledger。
```

---

## E. F-CHOICE-MARKER 跨页统一决策（想做 · 估 2 min）

§B.4.3 已经问过这个，但放在这里集中拍板，方便我汇总。

### E.1 选项

- **(A) Stage 6 reviewer flag → Phase 2 prompt-tune**
  - 优点：根因修
  - 缺点：要重跑 Stage 5 部分页（如 page_043），消耗 LLM
- **(B) Stage 7 export normalize**（推荐）
  - 优点：无需重跑 Stage 5；下游所有 export format（JSON / Markdown / SQLite）统一
  - 缺点：translated/ 内的 raw 数据保留不一致；如果未来想直接消费 translated/ 而不走 export，会看到这种不一致
- **(C) 完全不管，下游应用层处理**
  - 优点：最少工程介入
  - 缺点：每个下游应用都得自己实现 normalize 逻辑

### E.2 你的拍板

- [x] (A)
- [x] (B)
- [ ] (C)
- [x] 其他：A+B 组合。Stage 6 reviewer 先 flag 成 WARN；Stage 7 export 再统一显示。不要等 Phase 3 每个应用各自处理。

如果选 (B)，希望 normalize 成什么形式？

- [ ] 保留 jp 原始 ア/イ/ウ/エ（推荐 — 学习者本来要熟悉日文记法）
- [x] 转 A/B/C/D（中英学习者更熟悉）
- [ ] 转 1/2/3/4
- [x] 其他：按语种处理：jp 保留原始 `ア/イ/ウ/エ`；zh/en export 统一为 `A/B/C/D`。底层 `answer_index` 始终保留 0-based 数字，不依赖可见 label。

---

## 完成后

填完本文件后：

1. 你 git commit 本文件（commit 信息建议：`docs: stage 5 user retro answers (post-Session-09)`）
2. 下次 Session 10 起手 user 跟 claude 说"读 worksheet 答案 → 起手 Stage 6"
3. claude 会：
   - 把 §A/B/C 的 verdict 纳入 `evidence/.../step_05_audit.md` Stage B reviewer 行（更新业务签字）
   - 把 §D 的 catch 列表 + §D.3 tier 选择 纳入 Stage 6 设计文档（首个 Stage 6 ADR D-075 候选）
   - 把 §E 的 F-CHOICE-MARKER 决策落到 Stage 7 export 设计上
   - 如果 §A/B/C 任何一项 FAIL，先重跑该 Stage 再开 Stage 6

不用一次填完。可以分几次回来加。最后一次填完后告诉我"worksheet 填好了"就行。
