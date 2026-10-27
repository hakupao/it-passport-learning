# Stage 7 UI/UX 全面再设计 — Phase 3 Implementation Plan（教科书）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 分两段上线教科书：
- **3a**：新阅读界面（单栏全宽、按 D-195 骨架排现有内容）+ 单元末确认题（错题自动进复习）+「読了」按钮（取代打开即已读）。套用现有内容先上线。
- **3b**：单元数据 v2 + 图解部件（静态 / 分步 / 小部件）+ 生成流水线，按 D-195 **试写 1 个 topic（management-10-27 プロジェクトマネジメント，3 单元 15 用语）**，用户看过后上线。其余 60 个 topic 的批量重写**不在本计划**，试点通过后另写计划。

**Architecture:** 3a 只动 web：`UnitReader` 重排、确认题沿用练习组（`/practice?ids=…`，作答走现有 `answer()`，`src:"practice"`，学习记录 v2 格式不变）、读完按钮写现有 `unitsRead`。3b 新增单元 schema `textbook-unit-v2`，`reader.ts` 里用一个归一化适配器把 v1 / v2 都转成同一个阅读模型（辞典・AI 先生 anchor・今日页继续读同名字段）；图解是**封闭注册表**里的 TS 组件，由单元 JSON 里的参数驱动，不在数据里放代码或 HTML。生成在 Claude Code 里用 workflow 脚本跑（D-132，不用外部 API），日文先写 → 中英意译。

**Tech Stack:** Next.js 15 App Router（`force-dynamic`）、next-intl、TypeScript、CSS Modules、vitest、Playwright；生成侧 = `scripts/*.mjs` + Claude Code Workflow（opus）。

**Spec:** `docs/decisions/D-195-textbook-writing-and-figure-rules.md`（文体・构成・图解规则，样稿 Artifact SzjFw5SDtGcYZwbjCZAWer 的 D 页签）；`docs/phase5/ui_redesign/DESIGN.md` §5（复习规则）、§6.4（教科书，本计划有 3 处偏离，见 §0）；S134 问答（`docs/discussion/2026-10-27-session-134.md` §2〜§4、§7）。本计划 §0 经用户批准后锁为 **D-196**。

---

## 需要你确认的 4 点（批准本计划 = 同意这 4 点）

1. **确认题用单元自带的题单**（`challenge_questions`，每单元中位 5 题），不按 DESIGN 写的「按 topic 抽」。→ §0-1
2. **不做右侧窄栏**（DESIGN §6.4 原有），单元位置・本单元过去问数・用语一览都放进单元开头。理由：你在 OQ-13 说过不喜欢文字并排。→ §0-5
3. **确认题第一次做也算进「今日新题」的配额**（每天默认 10 题）。也就是读完单元做了 5 道确认题，今日页的新题会少 5 道。→ §0-7
4. **试点 topic = プロジェクトマネジメント**（3 单元，出题 172 道，是安全以外出题最多的 topic；正好能用上三种图：WBS 分解的分步图、风险应对的分步图、关键路径可调的小部件）。→ §0-10

---

## Global Constraints

- Phase 1 计划 `PLAN_stage7_ui.md` 与 Phase 2 计划 `PLAN_stage7_phase2.md` 的 Global Constraints 继续适用（TypeScript only、不加运行时依赖、7 个颜色 token / 圆角 ≤ 6px / 无阴影 / 对错不用红绿、`force-dynamic`、CSP 不变、Gates 五项、e2e 端口 ≥ 3100 + Redis env 置空 + 按 PID 停、push 前请用户同意、subagent 一律 `model: opus`、Rule D 审查者与执行者不同 `subagent_type`、证据不放题目原文）。
- **学习记录 v2 线上格式不变**（DESIGN §5.2 已锁；新 `src` 会让旧客户端把整份记录当损坏、服务器 500）。本计划不新增 attempt src、不新增 record 字段。
- **IPA 泄漏闸**：`find apps/web/.next -name '*.nft.json' -exec grep -lE 'data/ip/(exams|sources|syllabus)/' {} + | wc -l` = 0，每次 build 后都跑。新数据文件只放 `data/ip/textbook/` 下并经 `textbookRoot()` 用 fs 读，或放 `apps/web/public/`。
- 生成只在 Claude Code 内（workflow / subagent），**不调用 `@anthropic-ai/sdk`**（虽然它还在 root devDependencies 里）。
- 保留 `article id={termId(term)}` 锚点（`e2e/glossary.spec.ts:116` 依赖）。
- 文案：ja / zh / en 三套同时加，不留占位。
- 两个 push 同意点：3a 完成时（Task 5）、试点审阅后（Task 11）。

## Review Focus

1. **确认题回到单元**：从单元进入 → 做完 → 总结页「単元に戻る」回到同一单元；再点一次确认题必须是新的一轮（不能直接显示上次的总结）→ Task 3 `run nonce per launch` 测试 + e2e。
2. **「読了」只能加、不能撤**：`unitsRead` 合并取最小值，撤销会被别的设备同步回来 → 按钮单向，已读后显示「✓ 読了 M/D」。旧数据里「打开过」的标记保留。→ Task 2 测试。
3. **v1 / v2 混存时辞典与 AI 先生不变**：v1 单元经适配器后，`buildDictionary` 的 1,395 条与 `unitAnchor` 的输出逐字不变 → Task 6 语料快照测试。
4. **图解数据安全**：单元 JSON 里的图参数只是数据（标签、数值、步骤），渲染不用 `dangerouslySetInnerHTML`（v1 的 mermaid SVG 例外，保持现状）；参数不合法时该图不显示、其余正文照常 → Task 7 测试。
5. **关键路径小部件算对**：改工期后关键路径与总工期正确（含多条并列关键路径、虚活动）→ Task 7 纯函数测试，期望值独立手算。
6. **三语结构一致**：同一单元三种语言的用语数・图数・要点数・易混组数相同，图的步骤数相同 → Task 9 校验脚本（machdiff 式机械检查）。

---

## §0 细化决定（批准后 = D-196）

| # | 决定 | 理由 / 却下案 |
|---|---|---|
| 0-1 | 确认题 = 单元 JSON 的 `challenge_questions`（1,173 条全部可解析、与单元同 topic、5 题的单元 218 个）。显示顺序：未做过 → 错题本里的 → 其余（各组内保持原顺序），最多 5 题。唯一 0 题的 `technology-21-54-u01`：不显示确认题区块，只留「この分野の過去問」链接。 | 题单在生成时已按年份分散与用语覆盖挑过。却下：按 `topic_id` 现抽（DESIGN 原文）——会抽到本单元没讲的用语的题。 |
| 0-2 | 确认题入口 = `/practice?ids=<…>&from=unit&unit=<unitId>&run=<nonce>`，作答走现有 `answer()`（`src:"practice"`）。`from` 的类型从 `"today" \| null` 扩为 `"today" \| "unit" \| null`；`unit` 用 `UNIT_ID_RE` 校验且必须存在，否则当作无 `from`。总结页：`from=unit` 时主按钮「単元に戻る」→ `/textbook/<unitId>#confirm`，保留「只做错题再来一遍」。`run=` 每次从单元点入都生成新值。 | 复用练习组的一题一屏、即判、错题进本。却下：单元页内嵌答题（重复实现练习逻辑）；新 src `"unit"`（改锁定的线上格式）。 |
| 0-3 | 错题进复习：不改代码。`schedule.ts` 已有规则：当天第一次作答答错 → 盒 0（错题本，明天出现）。 | 闭环已经存在，只需从单元进入。 |
| 0-4 | 「読了」= 单元末的明确按钮，调用现有 `readUnit(unitId)`；删除 `MarkUnitRead`（打开即已读）。按钮单向（Review Focus 2）。旧的「打开过」标记保留，不迁移。今日页「读一个单元」行的含义随之变成「点了読了」。 | S134 用户选择「显式按钮」。**偏离 DESIGN §6.4**（原为滚到底 / 停留时长静默记录）。却下：旧标记清空（无法区分，且会让用户已有的进度消失）。 |
| 0-5 | 版式：单栏，正文最大宽 44em、居中；**无右侧窄栏**。单元头 = 面包屑（分野 › 中分类 › topic › 単元 n / N）+ 标题 + 頻出度・分钟数・用语数 + 本单元过去问数（`challenge_questions ∪ inline_quiz` 去重计数）+ 用语一览（v1：用语名横排可跳转；v2：D-195 的总表，可折叠）。 | 用户在 OQ-13 拒绝文字并排。**偏离 DESIGN §6.4**（右侧窄栏）。 |
| 0-6 | 3a 用 v1 内容套 D-195 骨架：一句話 = `definition`；图 = 现有 SVG（有则显示）；展開 = `explanation`；打个比方 = `analogy`；记法 = `memory_hook`；**无考点框**（v1 没有该数据）；单元末 = `summary.key_points` → 确认题 → 読了。`summary.memory_hooks` 不再单独列（与每个用语的记法重复）。`inline_quiz` 3a 不显示（477 条是 fallback，与用语未必相关）。 | 先让结构上线，内容在 3b 逐步替换。 |
| 0-7 | 确认题第一次作答计入 `dailyNewTarget`（今日新题配额）。不改 `dailyPlan`。 | 它们确实是新做的题；单独计数需要新 src 或新字段（违反格式锁定）。 |
| 0-8 | 解说里的「単元に戻る：<单元名>」链接**只在 `from=unit` 的练习组里出现**（单元 id 来自 URL）。 | 题 → 单元没有现成映射，548 道题出现在 2〜10 个单元里，需要取舍规则。却下（推迟）：全局反查表 `question_units.json`——试点后视需要再做。 |
| 0-9 | 单元 schema v2（`schema_version: "textbook-unit-v2"`），**同一 `unit_id`、同一路径覆盖 v1 文件**。新增：`goals_{lang}[]`、`overview_rows[]`（用语总表）、每个用语 `one_{lang}`（一句话，含标记）/ `detail_{lang}` / `analogy_{lang}?` / `hook_{lang}?` / `points[]`（`kind: "exam" \| "mix"`）/ `figure`（见 0-11）、`pairs[]`（易混组，`after_term` 指定放在哪个用语之后，行带 `key` 标志）、`key_points_{lang}[]`、`confirm_questions[]`。**同时保留** `definition_*`（= 一句话去掉标记）、`explanation_*`（= 展開）、`memory_hook_*`、`unit_summary_*`、`overview.{freq_badge, est_minutes}`，让 `buildDictionary` / `unitAnchor` / `validate.ts` / 今日页不需要分支。`reader.ts` 新增 `normalizeUnit(raw): ReaderUnit`，v1 / v2 都进同一模型。 | 一个阅读器、一个模型。却下：两个阅读器（重复）；v2 去掉旧字段（要同时改辞典・anchor・测试，试点阶段风险大）。 |
| 0-10 | 试点 topic = `management-10-27` プロジェクトマネジメント（u01 体制と登場人物 5 用语 / u02 スコープとスケジュール 4 / u03 リスクマネジメント 6）。图解预定：WBS 分解（分步）、アローダイアグラム → クリティカルパス（小部件：改工期看关键路径变化）、ガントチャート vs アローダイアグラム（易混对比 + 静态）、リスク対応 4 种（回避/軽減/転嫁/受容，易混对比 + 分步）。最终用哪种图由写作者按 D-195 判断，注册表外的图种不允许。 | 出题最多（安全以外）、规模小、三种图都用得上。却下：システムの評価指標（计算小部件最好，但 u01/u02 用语不足 5 个）；システム開発技術（5 单元，回帰テスト与リグレッションテスト拆在两单元，需先改目录）。 |
| 0-11 | 图解 = 封闭注册表 `FIGURE_KINDS`。试点实现：`table`（静态表）、`compare`（并列对比，易混组共用）、`svg`（v1 已有 SVG，原样）、`flow`（方框箭头，`steps` 时逐步高亮 / 出现）、`tree`（层级分解，`steps` 时逐层展开）、`network`（活动箭头图，`widget` 时可改工期 → 关键路径与总工期实时重算）。每个 figure = `{ kind, mode: "static" \| "steps" \| "widget", data, steps?: [{ caption_{lang}, state }] }`。分步：手动「次へ / 前へ」，首次进入视口时自动播一遍；`prefers-reduced-motion` 时直接最终状态。新图种 = 新的代码任务（加组件 + 测试），不能由生成直接引入。 | 「动图・动画」有边界，可测试，三语标签在数据里。却下：每单元手写组件（不可维护）；数据里放 SVG/HTML（安全与三语不可控）；mermaid 动画（表现力不够）。 |
| 0-12 | 正文标记只有两种：`**词**` = 关键词（下划线马克笔）、`[[jp:用语]]` = 日文原词标签。由纯函数 `parseInline` 解析成 React 节点，不用 HTML。 | D-195 强调 4 种中「关键词」「日文原词」需要行内标记；「考点」「易混」是块级（`points` / `pairs`）。 |
| 0-13 | 生成流水线（Task 9）：`scripts/textbook-v2-prep.mjs`（确定性：现有单元、用语、topic 目标、每个用语相关的过去问题干与正解、可用图种说明）→ `scripts/textbook-v2.workflow.mjs`：日文写作（`general-purpose` opus）→ 日文审查（`oh-my-claudecode:critic` opus，按 D-195 清单 + 事实核对，≤ 2 轮）→ 中英意译（`general-purpose` opus，意译 + 现地化，结构不变）→ 译文审查（`oh-my-claudecode:code-reviewer` opus）→ `scripts/textbook-v2-merge.mjs`（以 `journal.jsonl` 为准）→ `scripts/textbook-v2-validate.mjs`（schema、标记可解析、三语结构一致、题 id 可解析且同 topic、图参数合法、D-195 §9 禁用句式扫描）→ `scripts/textbook-unit-minutes-build.mjs` 重算分钟数（v2 按 一句话+展開 字数估算）。 | 沿用 stage4 的 writer/reviewer 结构与 S121 的「journal 为准」教训。v1 的翻译提示是「直译优先」，v2 改为意译。 |
| 0-14 | Rule A（改写率 ≈ 100%）：试点 **全数抽检** = 15 个用语的事实（对照シラバス与过去问正解）+ 3 单元三语对照（意义一致、未漏、术语符合大陆 / 日本 / 英语惯例），由独立 `oh-my-claudecode:critic` opus（非写作者、非审查者）执行，证据 `evidence/phase5/stage_07_ui/phase3/pilot_audit.md`。**业务验收 = 你看过 3 个单元后同意**；不同意 → Rule B 归档 + 修 D-195 / 提示词再生成。批量阶段的 N 在下一份计划里定。 | 试点规模小，全数抽检成本可接受；规则还在验证期。 |
| 0-15 | 上线方式：v2 单元文件 commit 到 `data/ip/textbook/units/` 并 push main（D-133：该目录随 git 发布）。试点 3 单元上线后，其余单元仍是 v1，阅读器两种都能显示。 | 无需 release 或构建步骤。 |

---

## 3a — 新阅读界面 + 确认题 + 読了

### Task 1: 阅读模型与 v1 归一化（3a 的地基）

**Files:**
- Modify: `apps/web/src/lib/textbook/reader.ts`（新 `normalizeUnit`、`ReaderUnit`）
- Modify: `apps/web/src/lib/textbook/types.ts`（`ReaderUnit` 等；v2 类型在 Task 6 加）
- Create: `apps/web/src/lib/textbook/confirm.ts`
- Test: `apps/web/src/lib/textbook/__tests__/normalize.test.ts`、`apps/web/src/lib/textbook/__tests__/confirm.test.ts`

**Interfaces:**
- Produces:
  - `interface ReaderTerm { id: string; term: string; gloss: Record<DataLang, string>; one: Record<DataLang, string>; detail: Record<DataLang, string>; analogy?: Record<DataLang, string>; hook?: Record<DataLang, string>; points: ReaderPoint[]; figure: ReaderFigure | null }`
  - `interface ReaderUnit { id; topicId; category; title; goals: Record<DataLang, string[]> | null; overviewRows: … | null; terms: ReaderTerm[]; pairs: ReaderPair[]; keyPoints: Record<DataLang, string[]>; confirm: string[]; pastCount: number; minutes: number; freqBadge: string; schema: "v1" \| "v2" }`
  - `normalizeUnit(raw: TextbookUnit): ReaderUnit`（v1：§0-6 的映射；`goals`/`overviewRows` = null；`points` = []；`pairs` = []；`figure` = `{kind:"svg", mode:"static", path}` 或 null）
  - `orderConfirm(ids: readonly string[], record: LearningRecord, today: number): string[]`（§0-1：未做过 → 错题本 → 其余，最多 5）
- [ ] **Step 1: 写失败测试**：`normalize.test.ts` 对全部 244 个 v1 单元：`terms.length` 与原文件相同、`id` = `termId(term)`、`one.ja === definition_jp`、`detail.ja === explanation_jp`、`confirm` = `challenge_questions`、`pastCount` = `challenge_questions ∪ inline_quiz` 去重数。`confirm.test.ts`：空记录 → 原顺序前 5；有错题与已答题时顺序正确；超过 5 截断；0 题 → []。
- [ ] **Step 2: 运行** `cd apps/web && npx vitest run src/lib/textbook` → FAIL。
- [ ] **Step 3: 实现**。
- [ ] **Step 4: 运行** → PASS；`npx tsc --noEmit` 0。
- [ ] **Step 5: Commit** `feat(textbook): reader model + v1 normalizer + confirmation order (Phase 3 §0-1, §0-6)`

### Task 2: 阅读页重排 + 読了按钮

**Files:**
- Modify: `apps/web/src/components/textbook/UnitReader.tsx`、`reader.module.css`
- Delete: `apps/web/src/components/textbook/MarkUnitRead.tsx`
- Create: `apps/web/src/components/textbook/ReadButton.tsx`、`UnitHeader.tsx`、`TermBlock.tsx`、`ConfirmBlock.tsx`
- Modify: `apps/web/messages/{ja,zh,en}.json`（`Textbook` namespace：`readDone`、`readDoneOn`、`confirmTitle`、`confirmStart`、`confirmNone`、`pastCount`、`keyPoints`、`analogy`、`hook`、`breadcrumb` 等）
- Test: `apps/web/src/components/textbook/__tests__/UnitReader.ssr.test.ts`（改）、`ReadButton.ssr.test.ts`（新）；`apps/web/e2e/learning.spec.ts:55-75`（**改写**：打开单元不再标记；点「読了」后标记且目录显示 ✓）；新 `apps/web/e2e/textbook.spec.ts`

- [ ] **Step 1: 写失败测试**
  - SSR：顺序 = 面包屑 → h1 → meta（含过去问数）→ 用语一览 → 每个用语 `article#termId`（一句话在图之前、展開在图之后）→ 要点 → 确认题区 → 読了按钮；无 `MarkUnitRead`；`0 题单元` 不出确认题区；AI 先生按钮位置不变（h1 之后、第一个 article 之前）。
  - `ReadButton`：未读 → 「読了」；已读 → 「✓ 読了 M/D」且不可再点。
  - e2e `learning.spec`：打开单元 → `unitsRead` 为空；点「読了」→ `[UNIT_ID]`，目录该行 ✓；刷新后仍为已读。
  - e2e `textbook.spec`：1440 与 390 宽无横向溢出；正文列宽 ≤ 44em + 内边距。
- [ ] **Step 2: 运行** → FAIL。
- [ ] **Step 3: 实现**（§0-5、§0-6）。v1 的 SVG 仍用 `loadGeneratedSvg` 内联（现状）。
- [ ] **Step 4: 运行** vitest 全量 + `e2e/learning.spec.ts e2e/textbook.spec.ts e2e/glossary.spec.ts e2e/sensei.spec.ts e2e/csp.spec.ts`（:3150）→ PASS。
- [ ] **Step 5: Commit** `feat(textbook): single-column reader in the D-195 skeleton, explicit 読了 button (Phase 3 §0-4–§0-6)`

### Task 3: 确认题 → 练习组 → 回到单元

**Files:**
- Modify: `apps/web/src/lib/practice/practiceSession.ts`（`parseFrom`：`"today" | "unit" | null` + `unit` 参数校验）
- Modify: `apps/web/src/app/[locale]/practice/page.tsx`、`PracticeSession.tsx`、`SessionSummary.tsx`
- Modify: `apps/web/src/components/textbook/ConfirmBlock.tsx`（客户端：读记录 → `orderConfirm` → 链接带新 `run`）
- Test: `practiceSession.test.ts`（`parseFrom`）、`SessionSummary.ssr.test.ts`、e2e `textbook.spec.ts`

- [ ] **Step 1: 写失败测试**：`parseFrom`：`from=unit&unit=<存在>` → `{kind:"unit", unitId}`；未知 / 非法 unit → null；`from=today` 不变。总结页 `from=unit` → 主按钮「単元に戻る」链到 `/textbook/<id>#confirm`，无「回今日」主按钮。e2e：单元 → 确认题 → 答 1 错 → 总结 → 単元に戻る → 再点确认题 → 是新一轮（进度 1/N，不是总结）；错的那题出现在错题本。
- [ ] **Step 2: 运行** → FAIL。
- [ ] **Step 3: 实现**（§0-1、§0-2、§0-7）。
- [ ] **Step 4: 运行** → PASS。
- [ ] **Step 5: Commit** `feat(textbook): confirmation questions run as a practice set and return to the unit (Phase 3 §0-2)`

### Task 4: 解说里的「単元に戻る」

**Files:**
- Modify: `apps/web/src/components/practice/ExplanationPane.tsx`、`PracticeSession.tsx`（`from=unit` 时把单元 id 与标题传入）
- Test: `ExplanationPane.ssr.test.ts`、e2e `textbook.spec.ts`

- [ ] **Step 1: 写失败测试**：`from=unit` 的组里答错 → 解说下方出现「単元に戻る：<单元名>」链到 `/textbook/<id>#<termId?>`（题的 `terms` 与单元用语有交集时带第一个交集用语的锚点，否则不带）；答对不出现；非 `from=unit` 不出现。
- [ ] **Step 2〜4**：FAIL → 实现（§0-8）→ PASS。
- [ ] **Step 5: Commit** `feat(practice): wrong answers in a unit's set link back to the unit (Phase 3 §0-8)`

### Task 5: 3a 收尾（Gates・Rule A 截图・Rule D・上线）

- [ ] **Step 1: Gates**（五项 + IPA 泄漏闸 + 本地 e2e 全量 :3150 `--retries=0`，完整日志存 scratchpad 后再摘要）→ `evidence/phase5/stage_07_ui/phase3/gates_3a.md`。
- [ ] **Step 2: 截图抽检**：独立 `general-purpose` opus 截 6 个单元（三分野各 2，含 0 题单元与最多用语的单元）× ja / zh × 1440 / 390，对照 JSON：用语数与顺序、一句话 / 展開文字齐全、确认题数与 `orderConfirm` 一致、无溢出。→ `evidence/.../phase3/audit_3a.md`；FAIL → `failures/phase5/stage_07_ui/phase3a_audit_attempt_N.md`。
- [ ] **Step 3: Rule D 整分支审查**（`oh-my-claudecode:code-reviewer` opus），修正波 ≤ 1 轮 + 复审。
- [ ] **Step 4: 请你试用（本地 :3150）→ 同意 push** → main fast-forward + push → 本番 e2e 全量（完整日志）→ 会话日志 + STATE。

---

## 3b — 单元 v2 + 图解部件 + 试点

### Task 6: v2 schema、行内标记、校验

**Files:**
- Modify: `apps/web/src/lib/textbook/types.ts`（`TextbookUnitV2`、`FigureSpec` 联合类型）、`reader.ts`（`normalizeUnit` 加 v2 分支）、`validate.ts`（v2 校验；题 id 改为对 `data/ip/quiz/questions.json` 解析）
- Create: `apps/web/src/lib/textbook/inline.ts`（`parseInline`）
- Create: `apps/web/src/lib/textbook/__fixtures__/v2-sample.json`（手写的合规样例单元，三语、含每种图）
- Test: `inline.test.ts`、`normalize.test.ts`（加 v2）、`validate.test.ts`（加 v2）、`dictionary-snapshot.test.ts`（新：全部 v1 单元的 `buildDictionary` 输出与 `unitAnchor` 输出 = 改动前快照）

- [ ] **Step 1: 先生成快照**（改动前的 `buildDictionary` / 每单元 `unitAnchor` 输出写入 `__snapshots__`），commit。
- [ ] **Step 2: 写失败测试**：`parseInline`：`**A**` → 关键词节点；`[[jp:X]]` → 日文原词节点；未闭合 / 嵌套 → 原样文本，不抛异常；不产生 HTML 字符串。v2 校验：三语字段齐全、`one` 可解析、`pairs[].after_term` 指向存在的用语、`figure.kind` 在注册表内、`steps` 三语 caption 齐全、`confirm_questions` 可解析且同 topic。
- [ ] **Step 3〜4**：FAIL → 实现 → PASS；快照测试 PASS（v1 不变）。
- [ ] **Step 5: Commit** `feat(textbook): unit schema v2, inline markup, validator (Phase 3 §0-9, §0-12)`

### Task 7: 图解注册表与部件

**Files:**
- Create: `apps/web/src/components/textbook/figures/{registry.ts, TableFig.tsx, CompareFig.tsx, FlowFig.tsx, TreeFig.tsx, NetworkFig.tsx, StepStage.tsx}`、`figures.module.css`
- Create: `apps/web/src/lib/textbook/criticalPath.ts`
- Test: `criticalPath.test.ts`、`figures.ssr.test.ts`、e2e `textbook.spec.ts`（用 v2 样例单元的测试路由或 fixture 注入方式，见 Step 3）

**Interfaces:**
- `criticalPath(nodes: string[], acts: { from: string; to: string; days: number; dummy?: boolean }[]): { total: number; critical: Set<number>; es: Record<string, number>; lf: Record<string, number> }` — 有环 / 不连通 → 抛 `RangeError`（校验阶段拦下）。
- `StepStage` 通用分步容器：`steps.length` 个状态、「前へ / 次へ / もう一度」、进度点、`aria-live` 说明、`IntersectionObserver` 首次进入视口自动播一遍、reduced-motion 直接末状态。
- [ ] **Step 1: 写失败测试**：`criticalPath` 用 3 个手算例（单路径、两条并列关键路径、含虚活动）期望值写死；改一个非关键活动工期到超过浮动 → 关键路径切换。每个图种 SSR：合法数据渲染、非法数据返回 null 且不抛；无 `dangerouslySetInnerHTML`（`svg` 种除外）。
- [ ] **Step 2〜4**：FAIL → 实现 → PASS。e2e 用 Task 6 的样例单元：分步「次へ」推进 caption、reduced-motion 下初始即末状态、network 改工期后总工期数字变化；390 宽无溢出。（样例单元的加载方式：测试专用环境变量 `TEXTBOOK_DATA_ROOT` 指向 fixture 目录，与现有机制一致，不新增路由。）
- [ ] **Step 5: Commit** `feat(textbook): figure registry — table / compare / flow / tree / network, step stage (Phase 3 §0-11)`

### Task 8: 阅读页渲染 v2

**Files:**
- Modify: `UnitHeader.tsx`（v2：学习目标 + 可折叠总表）、`TermBlock.tsx`（v2：一句话标记、图、展開、比方 / 记法、考点框、易混标签）、新 `PairBlock.tsx`
- Test: `UnitReader.ssr.test.ts`（v2 样例）、e2e `textbook.spec.ts`

- [ ] **Step 1: 写失败测试**：v2 样例：顺序 = 目标 → 总表 → 用语（D-195 固定顺序）→ 易混组出现在 `after_term` 用语之后 → 要点 → 确认题 → 読了；关键词与日文原词用对应元素；考点框带「常考」/「易混」标签；三语切换后结构相同。
- [ ] **Step 2〜4**：FAIL → 实现 → PASS。
- [ ] **Step 5: Commit** `feat(textbook): render v2 units (Phase 3 §0-9)`

### Task 9: 生成流水线

**Files:**
- Create: `scripts/textbook-v2-prep.mjs`、`scripts/textbook-v2.workflow.mjs`、`scripts/textbook-v2-merge.mjs`、`scripts/textbook-v2-validate.mjs`（调用 web 侧同一校验逻辑：以 `tsx` 运行或复制为 `.mjs` 共享模块，实现者择一并写明）、`scripts/textbook-v2-parity.mjs`（三语结构一致检查）
- Modify: `scripts/textbook-unit-minutes-build.mjs`（v2 分钟数）
- 中间产物：`data/ip/textbook/.planning/v2/`（gitignored）

- [ ] **Step 1: prep 脚本 + 单元测试**（确定性；输出每单元一个 manifest：现有内容、用语、topic 目标、每用语相关过去问的题干 / 正解 / 解说摘要、图种注册表说明与参数 schema、D-195 全文）。
- [ ] **Step 2: workflow 脚本**（§0-13 的 4 个角色，各角色 `agentType` 不同；每个 agent 写 `parts/<unit>.<stage>.json` 并只返回计数；日文审查 ≤ 2 轮修正）。
- [ ] **Step 3: merge / validate / parity 脚本 + 测试**（用 Task 6 的样例单元做输入：validate 0 error、parity 0 diff；故意改坏三语之一 → parity 报出）。
- [ ] **Step 4: 先跑 1 个单元**（`management-10-27-u02`，WBS + アローダイアグラム 都在这里）→ validate + parity 通过 → 本地起 :3150 截图给你看 → 你同意文风与图后再跑 u01、u03。不同意 → Rule B 归档 `failures/phase5/stage_07_ui/phase3b_pilot_attempt_N.md`，改 D-195 或提示词后重跑。
- [ ] **Step 5: Commit**（脚本与 3 个 v2 单元文件分开 commit）`feat(scripts): textbook v2 generation pipeline (Phase 3 §0-13)` / `content(textbook): management-10-27 rewritten under D-195 (pilot)`

### Task 10: 试点 Rule A 全数抽检

- [ ] **Step 1**：独立 `oh-my-claudecode:critic` opus（不是 Task 9 的任何角色）对 15 个用语：事实（对照シラバス `objective_jp`、相关过去问正解）、D-195 清单逐条、三语意义一致；每条判定 + 证据位置。→ `evidence/phase5/stage_07_ui/phase3/pilot_audit.md`。
- [ ] **Step 2**：有 HIGH → 修正（脚本化 before/after，Rule B 归档原稿）→ 该用语复审。
- [ ] **Step 3**：controller 用 `textbook-v2-parity.mjs` 与 validate 再跑一次，结果写入同一 evidence。

### Task 11: 3b 收尾

- [ ] **Step 1: Gates**（五项 + IPA 泄漏闸 + e2e 全量）→ `evidence/.../phase3/gates_3b.md`。
- [ ] **Step 2: Rule D 整分支审查**（`oh-my-claudecode:code-reviewer` opus）+ 修正波。
- [ ] **Step 3: 你审阅 3 个试点单元**（本地 :3150，ja / zh / en）→ 同意后 push → 本番 e2e → 会话日志 + STATE。
- [ ] **Step 4: Rule C**：`RETROSPECTIVE_stage7_ui.md` 追加 Phase 3 小结；把试点得到的规则修订写回 D-195（如有），作为批量计划的输入。

---

## 不在本计划内

- 其余 60 个 topic 的批量重写（试点通过后另写计划，含批量 Rule A 的 N）。
- 全局「题 → 单元」反查与练习解说的通用回链（§0-8 推迟）。
- 辞典重做、AI 先生「选中文字 → 问这段」、API key 移到设置（Phase 4）。
- 手机移植（Phase 5）。
