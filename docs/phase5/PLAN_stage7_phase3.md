# Stage 7 UI/UX 全面再设计 — Phase 3 Implementation Plan（教科书）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **修订记录**：v1 草案（S134）→ 独立 critic（`oh-my-claudecode:critic` opus）判 REVISE（Critical 1 / Major 5 / Minor 12）→ 本 v2 全部吸收：v2 图字段改名 `fig` 并写全兼容字段（C1）、确认题排除中問组员（M1）、快照测试改口径（M2）、组件 e2e 改到真实试点单元（M3）、锁定用语集合不变（M4）、保留用语内过去问（M5）、Minor 1〜12 写进各 Task。

**Goal:** 分两段上线教科书：
- **3a**：新阅读界面（单栏、按 D-195 骨架排现有内容）+ 单元末确认题（错题自动进复习）+「読了」按钮（取代打开即已读）。套用现有内容先上线。
- **3b**：单元数据 v2 + 图解部件（静态 / 分步 / 小部件）+ 生成流水线，按 D-195 **试写 1 个 topic（management-10-27 プロジェクトマネジメント，3 单元 15 用语）**，你看过后上线。其余 60 个 topic 的批量重写**不在本计划**，试点通过后另写计划。

**Architecture:** 3a 只动 web：`UnitReader` 重排、确认题沿用练习组（`/practice?ids=…`，作答走现有 `answer()`，`src:"practice"`，学习记录 v2 格式不变）、读完按钮写现有 `unitsRead`。3b 新增单元 schema `textbook-unit-v2`：新内容放在新字段（图 = `fig`），**同时由合并脚本确定性地写出全部 v1 兼容字段**（纯文本、无标记），所以辞典・AI 先生・今日页・`validateContent` 继续按 v1 字段读、不分支；阅读页经 `normalizeUnit` 把 v1 / v2 都转成同一个阅读模型。图解是**封闭注册表**里的 TS 组件，由 JSON 参数驱动。生成在 Claude Code 里用 workflow 脚本跑（D-132，不用外部 API），日文先写 → 中英意译。

**Tech Stack:** Next.js 15 App Router（`force-dynamic`）、next-intl、TypeScript、CSS Modules、vitest（node env）、Playwright；生成侧 = `scripts/*.mjs` + Claude Code Workflow（opus）；Node 原生 type stripping 跑共享校验模块。

**Spec:** `docs/decisions/D-195-textbook-writing-and-figure-rules.md`（样稿 Artifact SzjFw5SDtGcYZwbjCZAWer 的 D 页签）；`docs/phase5/ui_redesign/DESIGN.md` §5、§6.4（本计划有 4 处偏离，见 §0）；S134 问答（`docs/discussion/2026-10-27-session-134.md` §2〜§4、§7）。§0 经用户批准后锁为 **D-196**。

---

## 需要你确认的 4 点（批准本计划 = 同意这 4 点）

1. **确认题用单元自带的题单**，不按 DESIGN 写的「按 topic 抽」；**中問（几道题共用一段前文的题组）不放进确认题**，不够 3 题时用本单元各用语的相关过去问补。实测：244 个单元全部有 3〜5 题（5 题 173 个、4 题 45 个、3 题 26 个）。→ §0-1
2. **不做右侧窄栏**（DESIGN §6.4 原有），单元位置・过去问数・用语一览都放进单元开头。理由：你在 OQ-13 说过不喜欢文字并排。→ §0-5
3. **确认题第一次做也算进「今日新题」的配额**（每天默认 10 题）：读完一个单元做了 5 道确认题，今日页的新题会少 5 道（最多 5 道，因为确认题 ≤ 5）。→ §0-7
4. **试点 topic = プロジェクトマネジメント**（3 单元，出题 172 道，安全以外最多；WBS 分解的分步图、风险应对的分步图、关键路径可调的小部件都用得上）。→ §0-10

---

## Global Constraints

- Phase 1 / Phase 2 计划的 Global Constraints 继续适用（TypeScript only、不加运行时依赖、7 个颜色 token / 圆角 ≤ 6px / 无阴影 / 对错不用红绿、`force-dynamic`、CSP 不变、Gates 五项、e2e 端口 ≥ 3100 + Redis env 置空 + 按 PID 停、push 前请用户同意、证据不放题目原文）。
- **角色（Rule D）**：实现者 = `oh-my-claudecode:executor` opus；任务审查与整分支审查 = `oh-my-claudecode:code-reviewer` opus；截图抽检 = `general-purpose` opus；生成流水线的四个角色与试点 Rule A 抽检者见 §0-13 / §0-14，彼此 `subagent_type` 不同。
- **学习记录 v2 线上格式不变**（DESIGN §5.2）：不新增 attempt src、不新增 record 字段。
- **IPA 泄漏闸**：每次 build 后 `find apps/web/.next -name '*.nft.json' -exec grep -lE 'data/ip/(exams|sources|syllabus)/' {} + | wc -l` = 0。新数据只放 `data/ip/textbook/`（经 `textbookRoot()` 用 fs 读）或 `apps/web/public/`。
- 生成只在 Claude Code 内，**不调用 `@anthropic-ai/sdk`**。
- 保留 `article id={termId(term)}` 锚点（`e2e/glossary.spec.ts:116`）。
- e2e 全量跑时**完整日志先存 scratchpad，再摘要**（S134 教训：tail 截断丢了失败原因）。
- 两个 push 同意点：3a 完成（Task 5）、试点审阅后（Task 11）。

## Review Focus

1. **确认题回到单元、每次是新一轮**：从单元进入 → 做完 → 总结页「単元に戻る」回到同一单元；再点确认题是新一轮（不显示上次总结）→ Task 3：ConfirmBlock 每次点击生成的 `run` 不同（直接对 href 断言）+ 全部答对、顺序不变的场景 e2e。
2. **確認題 ≤ 5 且不含中問组员**：244 个单元经 `pickConfirm` 后全部 3〜5 题、无组员、`resolveScope` 展开后题数不变 → Task 1 语料测试。
3. **「読了」只能加、不能撤**：`unitsRead` 合并取最小值，撤销会被同步回来 → 按钮单向 → Task 2 测试。
4. **v2 单元进辞典・AI 先生不出错**：v2 样例单元经 `buildDictionary`、辞典条目页 SSR、`unitAnchor`、`/api/sensei/terms` 用到的函数：字段齐全、无 `**` / `[[jp:` 标记、不抛错；v1 单元输出与改动前快照一致（快照只覆盖 v1 单元 id 集合）→ Task 6。
5. **图解数据安全**：图参数只是数据；渲染不用 `dangerouslySetInnerHTML`（v1 的 mermaid SVG 例外）；参数不合法时该图不显示、正文照常 → Task 7。
6. **关键路径算对**：手算 3 例（单路径、两条并列关键路径、含虚活动）+ 改工期后关键路径切换 → Task 7 纯函数测试。
7. **三语结构一致**：同一单元三种语言的用语数・图数・步骤数・要点数・易混组数相同 → Task 9 parity 脚本。

---

## §0 细化决定（批准后 = D-196）

| # | 决定 | 理由 / 却下案 |
|---|---|---|
| 0-1 | 确认题 `pickConfirm(unit, groups)` = `challenge_questions` 去掉中問组员（`data/ip/quiz/chumon_groups.json` 的 `member_ids`）；不足 3 题时按用语顺序从 `inline_fallback=false` 的 `inline_quiz` 里补（同样去组员、去重），补到 3 题为止；最多 5 题。显示顺序 `orderConfirm`：未做过 → 错题本里的 → 其余（组内保持原顺序）。实测 244 个单元全部 3〜5 题（含原本 0 题的 `technology-21-54-u01`）。 | 单元题单在生成时已按年份分散与用语覆盖挑过。中問组员会被练习页整组展开（最多 14 题，超出 5 题与每日配额说明）。却下：按 `topic_id` 现抽（DESIGN 原文，会抽到本单元没讲的用语）；接受展开（题数不可控）。 |
| 0-2 | 入口 = `/practice?ids=<…>&from=unit&unit=<unitId>&run=<nonce>`，作答走现有 `answer()`（`src:"practice"`）。`isFromToday(sp): boolean` 改为 `parseFrom(sp): { kind: "today" } \| { kind: "unit"; unitId: string } \| null`，`PracticeSession` 的 `fromToday` prop 改为 `from`；`unit` 用 reader.ts 中**导出的** `UNIT_ID_RE` 校验且 `loadReaderIndex()` 里存在，否则当作无 `from`。`run` **在点击时**生成（`Date.now()` 字符串，满足 `/^\d{1,16}$/`），不在渲染时生成（避免 hydration 不一致）。总结页：`from=unit` 时主按钮「単元に戻る」→ `/textbook/<unitId>#confirm`；「只做错题再来一遍」的链接保留 `from=unit&unit=`。 | 复用练习组的一题一屏、即判、错题进本。却下：单元页内嵌答题（重复练习逻辑）；新 src `"unit"`（改锁定的线上格式）。 |
| 0-3 | 错题进复习：不改代码（`schedule.ts`：当天第一次作答答错 → 盒 0，明天出现）。 | 闭环已存在。 |
| 0-4 | 「読了」= 单元末明确按钮，调用现有 `readUnit(unitId)`；删除 `MarkUnitRead`。按钮单向，已读显示「✓ 読了 M/D」。旧的「打开过」标记保留不迁移（显示的日期是当时打开的日期）。今日页「读一个单元」的含义随之变为「点了読了」。 | S134 用户选择「显式按钮」。**偏离 DESIGN §6.4 ①**（原为滚到底 / 停留时长静默记录）。却下：清空旧标记（无法区分，已有进度会消失）。 |
| 0-5 | 版式：单栏，正文最大宽 44em、居中；**无右侧窄栏**。单元头 = 面包屑（分野 › 中分类 › topic › 単元 n / N，中分类与 n / N 从 `ReaderIndex` 取）+ 标题 + 頻出度・分钟数・用语数・本单元过去问数（`pastCount` = 确认题 ∪ 非 fallback 的用语内题，去重）+ 用语一览（v1：用语名横排可跳转；v2：D-195 总表，可折叠）。 | 用户在 OQ-13 拒绝文字并排。**偏离 DESIGN §6.4 ②**（右侧窄栏）**③**（行宽 ≈ 38em → 44em：日中混排加日文原词标签，38em 换行过密）。 |
| 0-6 | 3a 用 v1 内容套 D-195 骨架：一句话 = `definition`；图 = 现有 SVG；展開 = `explanation`；打个比方 = `analogy`；记法 = `memory_hook`；用语内过去问 = 非 fallback 的 `inline_quiz`，显示为「この用語の過去問 N 題 →」（链到 `/practice?ids=…&from=unit&unit=…&run=…`，点击生成 run）；**无考点框**（v1 无数据）；单元末 = `summary.key_points` → 确认题 → 読了。**不显示**：`overview.intro`（D-195 §3 废止的长罗列句）、`summary.memory_hooks`（与各用语记法重复）、fallback 的 `inline_quiz`（477 个，与用语未必相关）。 | 先让结构上线，内容在 3b 替换。D-195 第 1〜3 轮「用语内小测」保留。 |
| 0-7 | 确认题与用语内过去问第一次作答计入 `dailyNewTarget`。不改 `dailyPlan`。 | 它们确实是新做的题；单独计数需要新 src 或新字段（违反格式锁定）。 |
| 0-8 | 解说里的「単元に戻る：<单元名>」只在 `from=unit` 的练习组里、答错时出现；单元标题与用语由 practice 页按 URL 的 `unit` 调 `loadUnit` 取；题的 `terms` 与单元用语有交集时链接带第一个交集用语的锚点。 | 题 → 单元没有现成映射（548 道题出现在 2〜10 个单元）。却下（推迟）：全局反查表——试点后视需要。 |
| 0-9 | **单元 schema v2**（`schema_version: "textbook-unit-v2"`），同一 `unit_id`、同一路径覆盖 v1 文件。**不变量**：`unit_id`、`topic_id`、`title_jp`、用语标题词 `terms[].term` 的集合与顺序与 `unit_index.json` 一致（改标题或增删用语 = 另立任务并重建 index）。**新字段**：`goals_{jp,zh,en}[]`、`overview_rows[]`（用语总表：`term` + 三语 `one_line` + 三语附加列）、每个用语 `one_{lang}`（含行内标记）/ `detail_{lang}` / `analogy_{lang}?` / `hook_{lang}?` / `points[]`（`{ kind: "exam" \| "mix", text_{lang}, qids?: string[] }`，`exam` 必须带 `qids` 作出题依据）/ `fig`（见 0-11，**不用 `figure` 这个名字**）/ `quiz[]`（该用语的过去问：可解析、同 topic、题的 `terms` 含该用语）、`pairs[]`（易混组：`{ a, b, rows[{ label_{lang}, a_{lang}, b_{lang}, key }] }`，放在 a、b 中**用语顺序较后者**之后）、`key_points_{lang}[]`、`challenge_questions[]`（沿用 v1 名字）。**兼容字段（合并脚本确定性生成，纯文本、无标记、非空）**：`definition_*` = 去标记的 `one_*`；`explanation_*` = 去标记的 `detail_*`；`analogy_*` = `analogy_*` 去标记，缺省时为空串并由 `TermDetail` 隐藏空标签；`memory_hook_*` = `hook_*` 去标记，缺省同上；`figure` = `null`（v1 的 SVG 由 `fig.kind:"svg"` 承载时，`figure` 保持 v1 形状 `{svg_path, mermaid, rendered}`）；`inline_quiz` = `quiz`、`inline_fallback` = false；`overview.intro_*` = `goals_*` 连成一段；`overview.freq_badge` / `est_minutes`；`summary.key_points_*` = `key_points_*`；`summary.memory_hooks_*` = 各用语「用语: hook」（无 hook 的用语省略，至少 1 条）；`unit_summary_*`；`lang_status` 全 `"generated"`。v2 校验断言「去标记(新字段) == 兼容字段」。 | 新旧共存期内辞典（1,395 条）・AI 先生・今日页・`validateContent` 不需要任何分支；`figure.svg_path` 被辞典条目页直接读取（`glossary/[termId]/page.tsx:48`），换形会 500。却下：两个阅读器；v2 去掉旧字段（要同时改辞典・anchor・测试，试点风险大）。 |
| 0-10 | 试点 topic = `management-10-27`（u01 体制と登場人物 5 用语 / u02 スコープとスケジュール 4 / u03 リスクマネジメント 6）。预定图：WBS 分解（`tree` 分步）、アローダイアグラム → クリティカルパス（`network` 小部件）、ガントチャート vs アローダイアグラム（`compare` 易混）、リスク対応 4 种（`compare` 易混 + `flow` 分步）。最终用哪种图由写作者按 D-195 判断，不得超出注册表。 | 出题最多（安全以外）、规模小、三种图都用得上。却下：システムの評価指標（u01/u02 用语不足 5）；システム開発技術（回帰テスト / リグレッションテスト 拆在两单元，需先改目录）。 |
| 0-11 | 图解 = 封闭注册表 `FIGURE_KINDS`。`fig = { kind, mode: "static" \| "steps" \| "widget", data, steps?: [{ caption_{lang}, state }] }`。试点实现：`svg`（v1 SVG 原样）、`table`、`compare`、`flow`（steps：逐步高亮 / 出现）、`tree`（steps：逐层展开）、`network`（widget：改工期 → 关键路径与总工期实时重算）。分步 3〜4 步；手动「次へ / 前へ」，首次进入视口自动播一遍；`prefers-reduced-motion` 直接末状态。**参数校验的主防线在 validate**（含 `network` 的环与连通检查）；渲染层遇到非法参数返回 null 作为保险。新图种 = 新代码任务（组件 + 测试），生成不能直接引入。 | 「动图・动画」有边界、可测试、三语标签在数据里。却下：每单元手写组件；数据里放 SVG / HTML；mermaid 动画。 |
| 0-12 | 行内标记只有两种：`**词**` = 关键词、`[[jp:用语]]` = 日文原词标签；纯函数 `parseInline` 解析成 React 节点，不用 HTML。`stripInline` 给兼容字段去标记。 | D-195 强调 4 种中的行内两种；「考点」「易混」是块级。 |
| 0-13 | 生成流水线：`scripts/textbook-v2-prep.mjs`（确定性 manifest）→ `scripts/textbook-v2.workflow.mjs`：日文写作（`general-purpose` opus）→ 日文审查（`oh-my-claudecode:critic` opus，D-195 清单 + 事实，≤ 2 轮）→ 中英意译（`oh-my-claudecode:writer`，**model: opus**）→ 译文审查（`oh-my-claudecode:code-reviewer` opus）→ `scripts/textbook-v2-merge.mjs`（以 `journal.jsonl` 为准；写兼容字段；`est_minutes` 按一句话 + 展開字数在此写入）→ `scripts/textbook-v2-validate.mjs` + `scripts/textbook-v2-parity.mjs` → `scripts/textbook-unit-minutes-build.mjs`（**保持只复制** `est_minutes`，跑 `--check`）。校验逻辑放在**不依赖 fs、import 带 `.ts` 扩展名**的纯模块 `apps/web/src/lib/textbook/validateV2.ts`，web 与脚本共用（脚本用 Node 原生 type stripping import，不复制、不加 tsx）。 | 沿用 stage4 的 writer/reviewer 结构与 S121「journal 为准」的教训。v1 的翻译提示是「直译优先」，v2 改为意译。 |
| 0-14 | Rule A（改写率 ≈ 100%）：试点**全数抽检** 15 个用语（事实对照シラバス `objective_jp` 与相关过去问正解；D-195 清单逐条；三语意义一致），抽检者 = `oh-my-claudecode:verifier` opus（与流水线四个角色都不同 type），证据 `evidence/phase5/stage_07_ui/phase3/pilot_audit.md`。**业务验收 = 你看过 3 个单元后同意**。Rule B：流水线任一失败（validate / parity 不过、审查 2 轮仍拒、你不同意）→ `failures/phase5/stage_07_ui/phase3b_pilot_<unit>_attempt_N.md`（输入 manifest 路径、产物、技术判定、业务判定、下一次输入）。批量阶段的 N 在下一份计划定。 | 试点规模小，全数可承受；规则还在验证期。 |
| 0-15 | 上线：v2 单元文件 commit 到 `data/ip/textbook/units/` 并 push main（D-133）。其余单元仍为 v1，阅读器两种都能显示。 | 无需 release 或构建步骤。 |

---

## 3a — 新阅读界面 + 确认题 + 読了

### Task 1: 阅读模型、v1 归一化、确认题挑选

**Files:**
- Modify: `apps/web/src/lib/textbook/reader.ts`（导出 `UNIT_ID_RE`；新 `normalizeUnit`、`ReaderUnit`）、`types.ts`
- Create: `apps/web/src/lib/textbook/confirm.ts`
- Test: `apps/web/src/lib/textbook/__tests__/normalize.test.ts`、`confirm.test.ts`

**Interfaces:**
- `interface ReaderTerm { id: string; term: string; gloss: Record<DataLang, string>; one: Record<DataLang, string>; detail: Record<DataLang, string>; analogy: Record<DataLang, string> | null; hook: Record<DataLang, string> | null; points: ReaderPoint[]; fig: FigSpec | null; quiz: string[] }`
- `interface ReaderUnit { id; topicId; category; title: Record<DataLang, string>; goals: Record<DataLang, string[]> | null; overviewRows: OverviewRow[] | null; terms: ReaderTerm[]; pairs: ReaderPair[]; keyPoints: Record<DataLang, string[]>; challenge: string[]; minutes: number; freqBadge: string; schema: "v1" | "v2" }`
- `normalizeUnit(raw: TextbookUnit): ReaderUnit`（v1：§0-6 映射；`quiz` = 非 fallback 的 `inline_quiz`；`fig` = `{kind:"svg", mode:"static", data:{path}}` 或 null）
- `pickConfirm(unit: ReaderUnit, members: ReadonlySet<string>): string[]`（§0-1）
- `orderConfirm(ids: readonly string[], record: LearningRecord, now: number): string[]`
- `pastCount(unit: ReaderUnit): number`

- [ ] **Step 1: 写失败测试**：全部 244 个 v1 单元：`terms.length` 与原文件相同、`id` = `termId(term)`、`one.jp === definition_jp`、`detail.jp === explanation_jp`；`pickConfirm` 全部 3〜5 题、无组员（读 `chumon_groups.json` 的 `member_ids`）、全部可解析、同 topic，并且 `resolveScope` 展开后题数不变；`orderConfirm` 空记录 / 有错题 / 已答各一例。
- [ ] **Step 2: 运行** `cd apps/web && npx vitest run src/lib/textbook` → FAIL。
- [ ] **Step 3: 实现**。
- [ ] **Step 4: 运行** → PASS；`npx tsc --noEmit` 0。
- [ ] **Step 5: Commit** `feat(textbook): reader model, v1 normalizer, confirmation picker (Phase 3 §0-1, §0-6)`

### Task 2: 阅读页重排 + 読了按钮

**Files:**
- Modify: `apps/web/src/app/[locale]/textbook/[unitId]/page.tsx`（调 `normalizeUnit`，从 `ReaderIndex` 取面包屑与 n / N；`unitAnchor` 仍收原始单元）
- Modify: `apps/web/src/components/textbook/UnitReader.tsx`、`reader.module.css`
- Delete: `apps/web/src/components/textbook/MarkUnitRead.tsx`
- Create: `apps/web/src/components/textbook/{ReadButton,UnitHeader,TermBlock,ConfirmBlock}.tsx`
- Modify: `apps/web/messages/{ja,zh,en}.json`（`Textbook`：`readDone`、`readDoneOn`、`confirmTitle`、`confirmStart`、`termPast`、`pastCount`、`keyPoints`、`analogy`、`hook`、`breadcrumb`；删除不再使用的键）
- Test: `UnitReader.ssr.test.ts`（改）、`ReadButton.ssr.test.ts`、`ConfirmBlock.ssr.test.ts`（新）；`e2e/learning.spec.ts:55-75`（**改写**）、新 `e2e/textbook.spec.ts`

- [ ] **Step 1: 写失败测试**
  - SSR：顺序 = 面包屑 → h1 → meta（含过去问数）→ 用语一览 → 每个 `article#termId`（一句话 → 图 → 展開 → 比方 / 记法 → 用语内过去问链接）→ 要点 → `#confirm` 确认题区 → 読了；无 `MarkUnitRead`、无 intro、无 memory_hooks 列表；AI 先生按钮仍在 h1 之后、第一个 article 之前。
  - `ReadButton`：未读 → 「読了」；已读 → 「✓ 読了 M/D」且 `disabled`。
  - e2e `learning.spec`：打开单元 → `unitsRead` 空；点「読了」→ `[UNIT_ID]`；目录该行 ✓；刷新仍已读。
  - e2e `textbook.spec`：1440 / 390 无横向溢出；正文列宽 ≤ 44em。
- [ ] **Step 2: 运行** → FAIL。
- [ ] **Step 3: 实现**（§0-4〜§0-6）。
- [ ] **Step 4: 运行** vitest 全量 + `e2e/learning.spec.ts e2e/textbook.spec.ts e2e/glossary.spec.ts e2e/sensei.spec.ts e2e/csp.spec.ts e2e/today.spec.ts`（`PLAYWRIGHT_BASE_URL=http://localhost:3150`）→ PASS。
- [ ] **Step 5: Commit** `feat(textbook): single-column reader in the D-195 skeleton, explicit 読了 button (Phase 3 §0-4–§0-6)`

### Task 3: 确认题 → 练习组 → 回到单元

**Files:**
- Modify: `apps/web/src/lib/practice/practiceSession.ts`（`isFromToday` → `parseFrom`）
- Modify: `apps/web/src/app/[locale]/practice/page.tsx`（`from=unit` 时校验并 `loadUnit` 取标题与用语，传下去）、`PracticeSession.tsx`（`fromToday` → `from`）、`SessionSummary.tsx`、`TodayPage` 等 `isFromToday` 的调用方
- Modify: `ConfirmBlock.tsx`、`TermBlock.tsx`（点击生成 `run`）
- Test: `practiceSession.test.ts`、`SessionSummary.ssr.test.ts`、`ConfirmBlock` 交互（纯函数 `confirmHref(ids, unitId, run)`）、e2e `textbook.spec.ts`

- [ ] **Step 1: 写失败测试**：`parseFrom` 四例（today / 合法 unit / 未知 unit / 非法格式）；`confirmHref` 含 `from=unit&unit=` 与给定 `run`；ConfirmBlock 连点两次生成的 `run` 不同；总结页 `from=unit` → 主按钮「単元に戻る」链 `/textbook/<id>#confirm`，「只做错题」链接保留 `from=unit&unit=`。e2e ①：单元 → 确认题全部答对 → 単元に戻る → 再点 → 进度 1/N（新一轮）；e2e ②：答错 1 题 → 错题本里有该题。
- [ ] **Step 2〜4**：FAIL → 实现（§0-1、§0-2、§0-7）→ PASS（含 `e2e/practice.spec.ts e2e/today.spec.ts` 回归）。
- [ ] **Step 5: Commit** `feat(textbook): confirmation questions run as a practice set and return to the unit (Phase 3 §0-2)`

### Task 4: 解说里的「単元に戻る」

**Files:**
- Modify: `apps/web/src/components/practice/ExplanationPane.tsx`、`PracticeSession.tsx`
- Test: `ExplanationPane.ssr.test.ts`、e2e `textbook.spec.ts`

- [ ] **Step 1: 写失败测试**：`from=unit` 组里答错 → 解说下方「単元に戻る：<单元名>」，有交集用语时带锚点；答对 / 非 `from=unit` 不出现。
- [ ] **Step 2〜4**：FAIL → 实现（§0-8）→ PASS。
- [ ] **Step 5: Commit** `feat(practice): wrong answers in a unit's set link back to the unit (Phase 3 §0-8)`

### Task 5: 3a 收尾

- [ ] **Step 1: Gates**（五项 + IPA 泄漏闸 + 本地 e2e 全量 :3150 `--retries=0`，完整日志）→ `evidence/phase5/stage_07_ui/phase3/gates_3a.md`。
- [ ] **Step 2: 截图抽检**（`general-purpose` opus）：6 个单元（三分野各 2，含原 0 题单元与用语最多的单元）× ja / zh × 1440 / 390，对照 JSON：用语数与顺序、文字齐全、确认题数 = `pickConfirm` 结果、无溢出 → `audit_3a.md`；FAIL → `failures/phase5/stage_07_ui/phase3a_audit_attempt_N.md`。
- [ ] **Step 3: Rule D 整分支审查** + 修正波 ≤ 1 轮 + 复审。
- [ ] **Step 4: 你试用（本地 :3150）→ 同意 push** → main fast-forward + push → 本番 e2e 全量（完整日志）→ 会话日志 + STATE。

---

## 3b — 单元 v2 + 图解部件 + 试点

### Task 6: v2 schema、行内标记、共享校验、兼容性测试

**Files:**
- Modify: `apps/web/src/lib/textbook/types.ts`（`TextbookUnitV2`、`FigSpec`）、`reader.ts`（`normalizeUnit` 加 v2 分支）
- Create: `apps/web/src/lib/textbook/inline.ts`（`parseInline`、`stripInline`）
- Create: `apps/web/src/lib/textbook/validateV2.ts`（纯函数，无 fs，import 带 `.ts`；Node 脚本可直接 import）
- Modify: `apps/web/src/components/glossary/TermDetail.tsx`（比喩 / 覚え方为空串时不显示标签）
- Create: `apps/web/src/lib/textbook/__fixtures__/v2-sample.json`（手写合规样例，三语，含每种图）
- Test: `inline.test.ts`、`validateV2.test.ts`、`normalize.test.ts`（v2）、`v2-compat.test.ts`（新）、`v1-snapshot.test.ts`（新）

- [ ] **Step 1: 先写 v1 快照**（改动前）：只对**当前全部 v1 单元 id** 记录 `buildDictionary` 的条目与每单元 `unitAnchor` 输出的哈希（文件小）；测试按 `schema_version === "stage4-unit-v1-trilingual"` 过滤，v2 单元自动排除。commit。
- [ ] **Step 2: 写失败测试**
  - `parseInline` / `stripInline`：两种标记、未闭合 / 嵌套原样输出、不产生 HTML 字符串。
  - `validateV2`：不变量（与 index 的 `title_jp` / 用语集合与顺序一致）、三语齐全、标记可解析、去标记(新字段) == 兼容字段、`pairs` 放在较后用语之后、`exam` 考点带 `qids`、`fig.kind` 在注册表内、分步 3〜4 步且三语 caption 齐全、`network` 无环且连通、展開 2〜3 句（按 `。` / `.` 计）、`quiz` / `challenge_questions` 可解析且同 topic、D-195 §9 禁用句式（清单写在模块里）。样例单元 0 error；逐项改坏各报 1 error。
  - `v2-compat`：样例单元进 `buildDictionary` / 辞典条目页 SSR / `unitAnchor`：不抛、字段非空、无标记字符。
- [ ] **Step 3〜4**：FAIL → 实现 → PASS（含 v1 快照）。
- [ ] **Step 5: Commit** `feat(textbook): unit schema v2 with v1 compatibility fields, inline markup, shared validator (Phase 3 §0-9, §0-12)`

### Task 7: 图解注册表与部件

**Files:**
- Create: `apps/web/src/components/textbook/figures/{registry.ts,SvgFig.tsx,TableFig.tsx,CompareFig.tsx,FlowFig.tsx,TreeFig.tsx,NetworkFig.tsx,StepStage.tsx}`、`figures.module.css`
- Create: `apps/web/src/lib/textbook/criticalPath.ts`、`apps/web/src/lib/textbook/stepState.ts`（分步状态的纯函数：前进 / 后退 / 重播 / reduced-motion 初始值）
- Test: `criticalPath.test.ts`、`stepState.test.ts`、`figures.ssr.test.ts`

**Interfaces:**
- `criticalPath(nodes: string[], acts: { from: string; to: string; days: number; dummy?: boolean }[]): { total: number; critical: number[]; es: Record<string, number>; lf: Record<string, number> }`（有环 / 不连通 → `RangeError`）
- `StepStage`：「前へ / 次へ / もう一度」、进度点、`aria-live` 说明、首次进入视口自动播一遍、reduced-motion 直接末状态。

- [ ] **Step 1: 写失败测试**：`criticalPath` 手算 3 例 + 改工期切换关键路径；`stepState` 边界（第 1 步不能后退、末步「もう一度」回到第 1 步、reduced-motion 初始 = 末步）；每个图种 SSR：样例数据渲染、非法数据返回 null 不抛、除 `svg` 外无 `dangerouslySetInnerHTML`。
- [ ] **Step 2〜4**：FAIL → 实现 → PASS。（浏览器交互的 e2e 放到 Task 9 Step 4 之后，针对真实试点单元 `management-10-27-u02`，不用 fixture 根目录。）
- [ ] **Step 5: Commit** `feat(textbook): figure registry — svg / table / compare / flow / tree / network, step stage (Phase 3 §0-11)`

### Task 8: 阅读页渲染 v2

**Files:**
- Modify: `UnitHeader.tsx`（v2：学习目标 + 可折叠总表）、`TermBlock.tsx`（v2：行内标记、`fig`、考点框带「常考」/「易混」标签）
- Create: `PairBlock.tsx`
- Test: `UnitReader.ssr.test.ts`（以 v2 样例单元直接传入组件做 SSR）

- [ ] **Step 1: 写失败测试**：顺序 = 目标 → 总表 → 用语（一句话 → 图 → 展開 → 比方 / 记法 → 考点 → 用语内过去问）→ 易混组在较后用语之后 → 要点 → 确认题 → 読了；关键词与日文原词用对应元素；三语切换后结构相同。
- [ ] **Step 2〜4**：FAIL → 实现 → PASS。
- [ ] **Step 5: Commit** `feat(textbook): render v2 units (Phase 3 §0-9)`

### Task 9: 生成流水线 + 试点生成

**Files:**
- Create: `scripts/textbook-v2-prep.mjs`、`scripts/textbook-v2.workflow.mjs`、`scripts/textbook-v2-merge.mjs`、`scripts/textbook-v2-validate.mjs`、`scripts/textbook-v2-parity.mjs`（各配 `.test.mjs`）
- 中间产物：`data/ip/textbook/.planning/v2/`（gitignored）

- [ ] **Step 1: prep**（确定性）：每单元 manifest = 现有内容、用语（标题词与顺序不可改）、topic `objective_jp`、每用语相关过去问（题干 / 正解 / 解说摘要，仅给写作者看，不入库）、图种注册表与参数 schema、D-195 全文、输出 JSON schema。
- [ ] **Step 2: workflow**（§0-13 四个角色；每个 agent 写 `parts/<unit>.<stage>.json` 并只返回计数；日文审查 ≤ 2 轮）。
- [ ] **Step 3: merge / validate / parity + 测试**：用样例单元：validate 0 error、parity 0 diff；改坏一种语言的步骤数 → parity 报出；merge 写出的兼容字段 = 去标记的新字段。
- [ ] **Step 4: 先跑 1 个单元 `management-10-27-u02`** → merge → validate + parity 通过 → `textbook-unit-minutes-build.mjs` 重建并 `--check` → 本地 :3150 截图（ja / zh / en × 1440 / 390）给你看；**写 e2e**：该单元分步「次へ」推进 caption、reduced-motion 初始即末状态、`network` 改工期后总工期变化、该单元用语的辞典条目页 200 且无标记字符。你同意文风与图 → 跑 u01、u03；不同意 → Rule B 归档后改 D-195 或提示词重跑。
- [ ] **Step 5: Commit**：脚本、v2 单元文件、`unit_minutes.json` 分开 commit（`feat(scripts): textbook v2 generation pipeline (Phase 3 §0-13)` / `content(textbook): management-10-27 rewritten under D-195 (pilot)`）。v1 快照测试因按 schema 过滤，无需重新生成。

### Task 10: 试点 Rule A 全数抽检

- [ ] **Step 1**：`oh-my-claudecode:verifier` opus 对 15 个用语逐项判定（事实、D-195 清单、三语一致）+ 证据位置 → `evidence/phase5/stage_07_ui/phase3/pilot_audit.md`。
- [ ] **Step 2**：有 HIGH → 脚本化修正（before/after，原稿归档 Rule B）→ 该用语复审。
- [ ] **Step 3**：controller 再跑 validate + parity，结果写入同一 evidence。

### Task 11: 3b 收尾

- [ ] **Step 1: Gates**（五项 + IPA 泄漏闸 + e2e 全量，完整日志）→ `gates_3b.md`。
- [ ] **Step 2: Rule D 整分支审查** + 修正波。
- [ ] **Step 3: 你审阅 3 个试点单元**（本地 :3150，ja / zh / en）→ 同意后 push → 本番 e2e → 会话日志 + STATE。
- [ ] **Step 4: Rule C**：`RETROSPECTIVE_stage7_ui.md` 追加 Phase 3 小结；试点得到的规则修订写回 D-195，作为批量计划的输入（含：用语集合不变、兼容字段生成规则、中問规则、批量 Rule A 的 N）。

---

## 不在本计划内

- 其余 60 个 topic 的批量重写（试点通过后另写计划）。
- 全局「题 → 单元」反查与练习解说的通用回链（§0-8 推迟）。
- 改单元标题 / 增删用语（需要重建 `unit_index.json`，§0-9 不变量）。
- 辞典重做、AI 先生「选中文字 → 问这段」、API key 移到设置（Phase 4）；手机移植（Phase 5）。
