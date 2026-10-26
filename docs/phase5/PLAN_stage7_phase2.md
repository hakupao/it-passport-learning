# Stage 7 UI/UX 全面再设计 — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 上线 Phase 2：领域页载荷瘦身（2.32 MB → 目标 ≤ 15%）、模拟考试 `/mock`（随机比例抽题 / 指定一回真题，120 分钟，可续考，手机可用）、学习记录页 `/record`（领域正答率表 + 近 5 周每日题数 + 复习预报 7 天 + 累计），模考作答计入学习记录。

**Architecture:** 沿用 Phase 1 的做法：业务逻辑全是学习记录 v2 上的纯函数（`src/lib/mock/*`、`src/lib/record/*`），在浏览器里算；服务器只给题目数据。模考的进行状态（题单、作答、标记、开始时刻）存在 localStorage（跨刷新、跨关闭标签页续考；倒计时 = 实时间），交卷时用一次批量动作把已答题以 `src:"mock"` 写入学习记录，并在模考状态上记 `recorded`，保证只写一次。模考题面复用 `PracticeQuestion`，加一个「不判对错」模式。领域页只把题目的轻量行发给客户端，AI 复习需要的错题全文在打开面板时按需取（新 GET `/api/quiz/questions`，≤ 5 题）。

**Tech Stack:** Next.js 15 App Router（`force-dynamic` server components）、next-intl、TypeScript、CSS Modules、vitest（node env，`src/**/*.test.ts`，SSR 测试用 `renderToStaticMarkup`）、Playwright。

**Spec:** `docs/phase5/ui_redesign/DESIGN.md` §4（路由）、§6.1（今日的次要链接）、§6.6（学习记录）、§6.7（模拟考试）、§7（分期）；ADR `docs/decisions/D-189-ui-ux-redesign.md`；S133 用户问答 **D-192**（`docs/discussion/2026-10-26-session-133.md` §7）。本计划 §0 是对它们的细化，经用户批准后锁为 **D-193**。Phase 1 计划 `docs/phase5/PLAN_stage7_ui.md`（§0 的约定继续有效）。

## Global Constraints

- Phase 1 计划 `PLAN_stage7_ui.md` 的「Global Constraints」全部继续适用（TypeScript only、不加运行时依赖、题面文字不变、`toDataLang()` / `localized*()` 取字段、7 个颜色 token / 圆角 ≤ 6px / 无阴影 / 对错不用红绿、反目标清单、`LearningRecordProvider` 只挂在需要的页面并 `force-dynamic`、不改 `next.config.ts` 的 trace、CSP 不变、Gates 五项、e2e 端口 ≥ 3100 + Redis env 置空 + 按 PID 停、push 前请用户同意、subagent 一律 `model: opus`、Rule D 审查者与执行者用不同 `subagent_type`、证据不放题目原文）。
- 模考数值（DESIGN §6.7）：100 题、120 分钟、总分换算 1000 分制、合格 = 总分 ≥ 600 **且** 三分野各 ≥ 300。作答过程中**不显示对错和解说**。
- 随机抽题的分野比例 = `OFFICIAL_RATIO`（`src/lib/learning/schedule.ts`：strategy 35 / management 20 / technology 45），正好 100 题。
- D-192：① 模考作答计入学习记录（错题本・复习盒・正答率）；② 中断后可续考，倒计时按实时间走；③ 两种出题都提供；④ 模考与学习记录页在 360px 宽也必须可用（无横向溢出）。
- 学习记录页（DESIGN §6.6）：「不做装饰图形」——只有表格、数字和细柱。
- 文案：ja / zh / en 三套 messages 同时加；新增 namespace `Mock`、`Record`；不留占位文案。

## Review Focus

1. **考到一半刷新 / 关掉标签页再回来；离开期间时间已到**：回来后同一组题、同样的作答与标记、剩余时间按实时间扣减；已超时则直接显示成绩，作答只写入学习记录一次，时刻 = 截止时刻（不是回来的时刻）→ Task 3 `resume` / `expired while away` / `recordOnce` 测试。
2. **两个标签页开着同一场模考**：一边交卷，另一边收到 storage 事件后切到成绩页，不重复写记录 → Task 3 `recorded flag survives a second finish` 测试 + Task 4 e2e `two tabs`。
3. **随机抽题碰到中問组**：组员整组、按顺序相邻出现，三分野正好 35 / 20 / 45、总数正好 100，不出现重复 → Task 2 `draw keeps groups whole and exact quotas` 测试（用真实语料，多个 seed）。
4. **未作答就交卷 / 全部空白交卷**：未答计为错（计分），但不写入学习记录（没有选项）；全空白时成绩页正常显示 0 分、不合格 → Task 2 `unanswered counts wrong` + Task 3 `nothing recorded for unanswered` 测试。
5. **URL 被改坏（未知 id、超过 100 个、未知回）**：丢弃无效部分；题单为空或不是 100 题的随机模考 → 回到模考设置页；指定回不存在 → 404 → Task 4 `parseMockScope` 测试。

---

## §0 细化决定（批准后 = D-193）

| # | 决定 | 理由 / 却下案 |
|---|---|---|
| 0-1 | 领域页只发 `TopicRow = Pick<QuizQuestion, "id" \| "exam_id" \| "source_label" \| "correct_answer" \| "terms">`；AI 复习打开时，用 `reviewWrongIds()` 算出 ≤ 5 道最近错题，`GET /api/quiz/questions?topic=<id>&ids=a,b` 取全文（含解说）后再建 anchor。取失败时 anchor 里错题只写 `#id（出典）` 一行。 | 2.32 MB 的主体是 ≤ 217 题的全文 + 解说，而全文只在 anchor 的错题段用到。却下：server action（仓库里还没有先例，API route 是现有模式）；服务器端建 anchor（anchor 依赖浏览器里的学习记录）。 |
| 0-2 | 路由：`/[locale]/mock` = 设置页（选「随机 100 题」+「优先未做过」开关，或从回列表选一回）；`/[locale]/mock/run?ids=…` 或 `?exam=<exam_id>` = 考试页；成绩在考试页内交卷后显示（同一 URL）。随机题单在客户端算（依赖记录），通过 `ids=` 进 URL（与练习的 `MAX_SCOPE_IDS = 100` 一致）。 | 与练习组「题单在 URL」的模式一致，服务器只按 URL 取题。 |
| 0-3 | 考试页只取 `loadBaseQuestions()` + 翻译（不合并解说）；成绩页的正误一览每行链到 `/practice/q/<id>`（那里有解说）。 | 模考中不显示解说；载荷 ≈ 练习组。 |
| 0-4 | 模考状态 `MockState` 存 localStorage `itp:mock:v1`（只保留一场：开新的一场会覆盖；设置页若有未交卷的一场，显示「继续上次的模考（剩 N 分）」与「放弃并开始新的一场」）。 | 续考要跨标签页关闭（sessionStorage 不够）。 |
| 0-5 | 计分：每题 1 分；总分 = round(正答数 / 题数 × 1000)；分野得分 = round(该分野正答 / 该分野题数 × 1000)（指定回时各分野题数按真题实际，如 2025r07 = 32 / 19 / 49）。未答 = 错。合格 = 总分 ≥ 600 且三分野各 ≥ 300。 | IRT 换算不公开，DESIGN 写「1000 分制换算」。 |
| 0-6 | 交卷（手动「試験終了」确认，或时间到）后：已答题用新动作 `answerBatch(items, at, "mock")` 一次写入学习记录，`at = endedAt = min(交卷时刻, startedAt + 120 分)`；`MockState.recorded = true`。未答题不写。 | 一次 functional update；时刻不受「回来晚了」影响（Review Focus 1）。 |
| 0-7 | 模考中题面：`PracticeQuestion` 新 prop `mode?: "practice" \| "exam"`（默认 practice）。exam 模式：点选只标「已选」（可改选），不出 ○×、不出解说栏、不出 AI 入口与问题报告；题号用模考内序号「第 N 問 / 100」+ 出典行保持。 | 复用版式（OQ-09/10 的 row4 规则、图放大都继承）。 |
| 0-8 | 考试页布局：顶栏 = 剩余时间（mm:ss，剩 10 分钟起加粗）+「回答見直し」按钮 +「試験終了」按钮；底栏 = 前へ / 「あとで見直す」勾选 / 次へ。「回答見直し」= 100 格一览（已答 / 未答 / 已标记三态，用字形区分：已答 = 反白号码、未答 = 空心、标记 = 号码右上 ▲），点格跳题。≤ 560px 时一览为 5 列，其余 10 列。 | IPA CBT 疑似体験的要素；对错不用红绿。 |
| 0-9 | 学习记录页 `/[locale]/record`：① 累计行（已做 x / 2900、作答次数、已掌握（盒 5）题数、学习天数）② 复习预报 7 天（今天 + 6 天，每天数字 + 细横柱；今天含逾期）③ 近 5 周每日题数（35 天，每天 = 当天作答过的不同题数，所有 src；周一起始的 5 行 × 7 列数字格，0 显示为「·」）④ 领域正答率表（三分野分组，列 = 领域名・★・已答/题数・正答率（最近一次作答判定，已答 0 显示「—」）；排序切换：頻出度（★ 降序 → 题数降序 → id）/ 正答率（升序，「—」排最后））。 | DESIGN §6.6；「不做装饰图形」。作答历史只保存每题最近 10 次（`ATTEMPTS_K`），近 5 周统计基于保存窗口——页面不做额外说明。 |
| 0-10 | 入口：`APP_NAV` 加 `{ href: "/record", key: "record" }`（在 glossary 之后）；今日页次要链接加「模拟考试」→ `/mock`；练习设置页底部加「模拟考试」链接。 | DESIGN §6.1「Phase 2 前隐藏」到期。 |

---

### Task 1: 领域页载荷瘦身（§0-1）

**Files:**
- Modify: `apps/web/src/app/[locale]/practice/browse/[topicId]/page.tsx`
- Modify: `apps/web/src/components/practice/TopicPage.tsx`
- Modify: `apps/web/src/components/sensei/ReviewLauncher.tsx`
- Modify: `apps/web/src/lib/sensei/anchors.ts`（`reviewAnchor` 签名、新 `reviewWrongIds`）
- Create: `apps/web/src/app/api/quiz/questions/route.ts`
- Create: `apps/web/src/lib/practice/topicRows.ts`
- Test: `apps/web/src/lib/sensei/__tests__/anchors.test.ts`（改现有 14 处 `reviewAnchor(` 调用）、`apps/web/src/app/api/quiz/questions/__tests__/route.test.ts`、`apps/web/src/lib/practice/__tests__/topicRows.test.ts`

**Interfaces:**
- Produces:
  - `type TopicRow = Pick<QuizQuestion, "id" | "exam_id" | "source_label" | "correct_answer" | "terms">`；`toTopicRow(q: QuizQuestion): TopicRow`（`topicRows.ts`）
  - `reviewWrongIds(rows: readonly TopicRow[], record: LearningRecord): string[]`（按该次作答 `at` 降序、再按 id，最多 `REVIEW_MAX_WRONG`）
  - `reviewAnchor(rows: readonly TopicRow[], full: ReadonlyMap<string, QuizQuestion>, record: LearningRecord, locale: AppLocale, termCards: Record<string, TermCard>, topicLabel: string): string`
  - `GET /api/quiz/questions?topic=<topic_id>&ids=<id,id,…>` → 200 `{ questions: QuizQuestion[] }`（解说已合并）；ids 0 个或 > `REVIEW_MAX_WRONG`、任何 id 不符合 `QUESTION_ID_RE` 或不属于该 topic、topic 未知 → 400；`Cache-Control: no-store`。

- [ ] **Step 1: 记录基线**：本地 build + `next start -p 3150`（Redis env 空），`curl -s http://localhost:3150/ja/practice/browse/<题数最多的 topic> | wc -c`，记入 `evidence/phase5/stage_07_ui/phase2/topic_payload.md`（也记 gzip：`| gzip -c | wc -c`）。题数最多的 topic 用 `node -e` 从 `data/ip/quiz/questions.json` 求。
- [ ] **Step 2: 写失败测试**
  - `topicRows.test.ts`：`toTopicRow` 只含 5 个键（`Object.keys(...).sort()` 等于 `["correct_answer","exam_id","id","source_label","terms"]`）。
  - `anchors.test.ts`：现有断言全部改用 `(rows, fullMap, …)` 形式且期望文本不变；新增 `reviewWrongIds` 最多 5 个、按 at 降序；新增「`full` 缺少某错题时该题只出 `- #<id>（<source_label>）` 一行，不抛异常」。
  - `route.test.ts`：合法请求 200 且 `questions[0].explanation` 存在；6 个 id → 400；别的 topic 的 id → 400；`ids=` 空 → 400；未知 topic → 400。
- [ ] **Step 3: 运行**：`cd apps/web && npx vitest run src/lib/sensei src/lib/practice/__tests__/topicRows.test.ts src/app/api/quiz/questions` → FAIL。
- [ ] **Step 4: 实现**：页面传 `rows={questions.map(toTopicRow)}`（`TopicPage` 的 `questions` prop 改名 `rows`，类型 `TopicRow[]`）；`ReviewLauncher` 点击时先 `reviewWrongIds` → 有 id 则 fetch（按钮在取数期间 `aria-busy` 并禁用），再 `reviewAnchor`；route 用 `loadQuestionsByIds`。
- [ ] **Step 5: 运行** Step 3 命令 → PASS；`npm test` 全 PASS；`npx tsc --noEmit` 0。
- [ ] **Step 6: 测量**：重 build，同 Step 1 的 curl；写入 `topic_payload.md`。**验收：raw ≤ 基线的 15%**（不达标 = 不通过，回到 Step 4 找剩余大头，如 `termCards`）。`npx playwright test e2e/sensei.spec.ts --retries=0`（PLAYWRIGHT_BASE_URL=:3150）PASS。
- [ ] **Step 7: Commit** `perf(practice): topic page sends slim rows; AI review fetches wrong questions on open (Phase 2 §0-1)`

### Task 2: 模考的纯逻辑（抽题・计分・时间）

**Files:**
- Create: `apps/web/src/lib/mock/mockModel.ts`
- Test: `apps/web/src/lib/mock/__tests__/mockModel.test.ts`

**Interfaces:**
- Consumes: `QuestionPool`、`OFFICIAL_RATIO`、`expandGroups`（`schedule.ts`）；`LearningRecord`（`record.ts`）；`QuizQuestion`（只用 `id`/`category`/`exam_id`/`correct_answer`）。
- Produces:
  - 常量 `MOCK_N = 100`、`MOCK_MS = 120 * 60_000`、`PASS_TOTAL = 600`、`PASS_AREA = 300`
  - `type MockCategory = "strategy" | "management" | "technology"`
  - `drawRandomMock(r: LearningRecord, pool: QuestionPool, categoryOf: ReadonlyMap<string, MockCategory>, seed: number, preferUnanswered: boolean): string[]` — 正好 100 个，分野 35 / 20 / 45；中問组整组相邻（组员按 `pool.groups` 顺序），一个组若会让任一分野超额就跳过；`preferUnanswered` 时先从未作答（`r.attempts` 无键）里抽，不够再从已答里抽；同 seed 同结果（mulberry32 + fnv1a32，同 `pickNew`）。
  - `examMockIds(examId: string, questions: readonly Pick<QuizQuestion, "id" | "exam_id">[]): string[]` — 该回全部题，按 id 升序（= 真题顺序）。
  - `interface MockScore { total: number; areas: Record<MockCategory, number>; correct: number; answered: number; n: number; passed: boolean }`
  - `scoreMock(ids: readonly string[], answers: Readonly<Record<string, ChoiceLetter>>, keyOf: ReadonlyMap<string, { correct: ChoiceLetter; category: MockCategory }>): MockScore`（§0-5）
  - `remainingMs(startedAt: number, now: number): number` = `max(0, startedAt + MOCK_MS − now)`；`deadline(startedAt: number): number`

- [ ] **Step 1: 写失败测试**（`mockModel.test.ts`，真实语料用 `loadAllQuestions()` + `loadChumonGroups()` 建 pool，同 `schedule.test.ts` 的做法）
  - `draw keeps groups whole and exact quotas`：seed 1..20 × preferUnanswered true/false：长度 100、无重复、三分野计数 = 35/20/45、每个被抽到的组的组员全部在内且在结果中连续且按组内顺序。
  - `preferUnanswered draws unanswered first`：取 `drawRandomMock(empty, pool, cat, 7, false)` 的 100 题保持未答、其余 2800 题在记录里各加一条 attempt → `drawRandomMock(r, pool, cat, 99, true)` 的结果集合 = 那 100 题（`new Set` 相等）。
  - `same seed same list`。
  - `examMockIds`：`2025r07` → 100 个，按 id 升序，全部 `exam_id === "2025r07"`。
  - `scoreMock`：全对 → total 1000、passed true；全空 → total 0、answered 0、passed false；`unanswered counts wrong`：答 60 对 0 错其余未答（三分野均匀）→ total 600；总分 ≥ 600 但 management 得 299 → passed false（构造：management 20 题对 6 题 = 300，对 5 题 = 250）。
  - `remainingMs`：开始后 119 分 → 60_000；121 分 → 0。
- [ ] **Step 2: 运行** `npx vitest run src/lib/mock` → FAIL。
- [ ] **Step 3: 实现** `mockModel.ts`。抽题算法：按分野分桶（候选单位 = 单题或整组，组的分野计数按每个组员自己的 `category`），每个分野内按 PRNG 洗牌后顺序取单位，单位放得下（不超任何分野剩余配额）就取；`preferUnanswered` 时先对「全部组员都未答」的单位做一轮，再对其余单位做一轮。最后输出顺序 = 分野顺序 strategy → management → technology，分野内按抽中的顺序（组员连续）。
- [ ] **Step 4: 运行** → PASS。
- [ ] **Step 5: Commit** `feat(mock): draw / score / timer pure model (DESIGN §6.7, D-192)`

### Task 3: 模考状态的存取与写入学习记录

**Files:**
- Create: `apps/web/src/lib/mock/mockStore.ts`
- Modify: `apps/web/src/hooks/useLearningRecord.ts`（新动作 `answerBatch`）
- Modify: `apps/web/src/lib/learning/record.ts`（新 `recordAttempts`，复用 `recordAttempt`）
- Test: `apps/web/src/lib/mock/__tests__/mockStore.test.ts`、`apps/web/src/lib/learning/__tests__/record.test.ts`（追加）、`apps/web/src/hooks/__tests__/useLearningRecord.ssr.test.ts`（追加）

**Interfaces:**
- Consumes: Task 2 的 `MOCK_MS`、`deadline`。
- Produces:
  - `MOCK_STORAGE_KEY = "itp:mock:v1"`
  - `interface MockState { v: 1; kind: "random" | "exam"; examId: string | null; ids: string[]; answers: Record<string, ChoiceLetter>; flagged: string[]; pos: number; startedAt: number; endedAt: number | null; recorded: boolean }`
  - `newMock(kind, examId, ids, now): MockState`；`parseMock(raw: string | null): MockState | null`（结构不对 → null，不抛）；`serializeMock(s): string`
  - `type MockAction = { type: "pick"; qid: string; choice: ChoiceLetter } | { type: "flag"; qid: string } | { type: "go"; pos: number } | { type: "finish"; now: number } | { type: "tick"; now: number } | { type: "recorded" }`
  - `mockReducer(s: MockState, a: MockAction): MockState` — 交卷后 pick/flag 无效；`tick` 在 `now ≥ deadline` 时等价于 `finish`；`finish` 的 `endedAt = min(now, deadline(startedAt))`，已交卷时不变。
  - `sameMock(s: MockState, kind, examId, ids): boolean`（URL 与存档是否同一场）
  - `recordAttempts(r: LearningRecord, items: readonly [qid: string, choice: ChoiceLetter, correct: boolean][], at: number, src: "practice" | "mock"): LearningRecord`
  - `LearningActions.answerBatch(items: readonly [string, ChoiceLetter, boolean][], at: number, src: "mock"): void`

- [ ] **Step 1: 写失败测试**
  - `mockStore.test.ts`：`resume`（serialize → parse 往返相等）；`expired while away`（`tick` 于 startedAt + 3 小时 → `endedAt === startedAt + MOCK_MS`）；`finish twice keeps the first endedAt`；`pick after finish ignored`；`flag toggles`；`parseMock` 对 `"{"`、`null`、`{v:2}`、ids 非数组 → null；`recorded flag survives a second finish`。
  - `record.test.ts`：`recordAttempts` 3 项 → 3 题各多一条 attempt，`src === "mock"`，`at` 相同；空数组 → 返回值 `toEqual` 原记录。
  - hooks 测试（`src/hooks/__tests__/useLearningRecord.ssr.test.ts` 追加）：`makeLearningActions(update, now).answerBatch(...)` 只调用 `update` 1 次，且结果与 `recordAttempts` 相同。
  - `nothing recorded for unanswered`：由调用方保证——在 Task 4 的组件测试里断言（见 Task 4 Step 1）。
- [ ] **Step 2: 运行** `npx vitest run src/lib/mock src/lib/learning src/hooks` → FAIL。
- [ ] **Step 3: 实现**。
- [ ] **Step 4: 运行** → PASS。
- [ ] **Step 5: Commit** `feat(mock): resumable mock state + answerBatch into the learning record (D-192 ①②)`

### Task 4: 模考页面（设置・考试・回答見直し・成绩）

**Files:**
- Create: `apps/web/src/app/[locale]/mock/page.tsx`（设置）、`apps/web/src/app/[locale]/mock/run/page.tsx`（考试）
- Create: `apps/web/src/components/mock/MockSetup.tsx`、`MockRun.tsx`、`MockReview.tsx`、`MockResult.tsx`、`mock.module.css`
- Create: `apps/web/src/lib/mock/mockScope.ts`
- Modify: `apps/web/src/components/practice/PracticeQuestion.tsx`（`mode` prop，§0-7）
- Modify: `apps/web/messages/{ja,zh,en}.json`（namespace `Mock`）
- Test: `apps/web/src/lib/mock/__tests__/mockScope.test.ts`、`apps/web/src/components/mock/__tests__/Mock.ssr.test.ts`、`apps/web/src/components/practice/__tests__/PracticeQuestion.ssr.test.ts`（追加）、`apps/web/e2e/mock.spec.ts`

**Interfaces:**
- Consumes: Task 2 全部、Task 3 全部；`PracticeQuestion`、`loadBaseQuestions`、`loadTranslations`、`loadChumonGroups`、`loadSetupIndex`（设置页需要 pool / 分野 / 回列表）、`useLearningRecord`。
- Produces:
  - `parseMockScope(sp: SearchParams, validIds: ReadonlySet<string>, validExams: ReadonlySet<string>): { kind: "exam"; examId: string } | { kind: "random"; ids: string[] } | null` — `exam=` 优先；`ids=` 去重、丢未知、> 100 截断；随机题单不足 100 → null。
  - `mockRunHref(scope): string`

- [ ] **Step 1: 写失败测试**
  - `mockScope.test.ts`：未知 exam → null（页面据此 `notFound()`）；`ids` 含未知 id 且剩 99 → null；150 个 → 前 100；重复 id 去重。
  - `PracticeQuestion.ssr.test.ts`：`mode="exam"` 且 `picked="イ"` → イ 的 `<li>` `data-state="picked"`，HTML 不含 ○ / × 印记、不含解说栏、不含 AI 入口与问题报告按钮。
  - `Mock.ssr.test.ts`（mock `useLearningRecord`）：成绩页 `MockResult`：给定 score → 显示总分、三分野得分、合格 / 不合格文字、正误一览每行链到 `/practice/q/<id>`、未答行显示「未回答」；`MockReview`：已答 / 未答 / 标记三态字形各至少 1 例；`MockRun` 交卷时 `answerBatch` 收到的 items 只含已答题（`nothing recorded for unanswered`）且 `src === "mock"`、`at === endedAt`；`recorded === true` 的状态再渲染不再调用 `answerBatch`。
  - `e2e/mock.spec.ts`（`PLAYWRIGHT_BASE_URL` 本地）：
    - 指定回 `2025r07`：开考 → 答 3 题 → 标记 1 题 → 刷新 → 同题、同作答、标记仍在、剩余时间 < 120:00 → 「回答見直し」显示 3 已答 / 97 未答 / 1 标记 → 交卷确认 → 成绩页显示 → 回今日页，错题行包含模考答错的题（若有）/ 练习的「最近作答」含 mock。
    - 随机：设置页「随机 100 题」→ URL `ids` 100 个 → 第 1 题出现。
    - `expired`：用 `page.clock`（Playwright clock API）开考后快进 121 分钟 → 自动显示成绩。
    - `two tabs`：同一 context 两个 page 打开同一场，在 A 交卷 → B 在 3 秒内显示成绩；学习记录里该批 attempt 只一份（读 localStorage `itp:learn:v2` 计数）。
    - `phone`：viewport 360×800 与 390×844，考试页与成绩页 `document.documentElement.scrollWidth <= innerWidth`，「回答見直し」一览 5 列。
- [ ] **Step 2: 运行** vitest 部分 → FAIL。
- [ ] **Step 3: 实现**。要点：考试页 server component 取题（exam → `examMockIds`；random → `parseMockScope` 的 ids），只合并翻译不合并解说（§0-3），挂 `LearningRecordProvider`，`force-dynamic`。`MockRun`：mount 时读 `itp:mock:v1`，`sameMock` 则续，否则 `newMock` 写入；每秒 `tick`；监听 `storage` 事件同步另一标签页；交卷流程 = `finish` → 若 `!recorded` 则 `answerBatch(已答 items, endedAt, "mock")` → `recorded`。「試験終了」用页面内确认区（不用 `confirm()` / 原生弹窗打断——反目标「弹窗打断做题」），显示「未回答 N 問」。设置页：有未交卷且同一 localStorage 存档 → 显示继续 / 放弃（§0-4）；随机题单由 `drawRandomMock(record, pool, categoryOf, Date.now() 派生 seed, preferUnanswered)` 算出后 `router.push(mockRunHref)`，按钮在记录 `loaded` 前禁用。
- [ ] **Step 4: 运行** vitest → PASS；本地 build + :3150 跑 `npx playwright test e2e/mock.spec.ts --retries=0` → PASS。
- [ ] **Step 5: Commit** `feat(mock): /mock setup, timed exam with review list, result (DESIGN §6.7, D-192)`

### Task 5: 学习记录页

**Files:**
- Create: `apps/web/src/lib/record/recordModel.ts`
- Create: `apps/web/src/app/[locale]/record/page.tsx`、`apps/web/src/components/record/RecordPage.tsx`、`record.module.css`
- Modify: `apps/web/messages/{ja,zh,en}.json`（namespace `Record`）
- Test: `apps/web/src/lib/record/__tests__/recordModel.test.ts`、`apps/web/src/components/record/__tests__/RecordPage.ssr.test.ts`、`apps/web/e2e/record.spec.ts`

**Interfaces:**
- Consumes: `reviewState`、`toLocalDay`、`MASTERED_BOX`、`QuestionPool`（`schedule.ts`）；`topicStats`（`record.ts`）；`TodayIndex`（`loadTodayIndex` 的 topics / ★ / 题 id）。
- Produces:
  - `reviewForecast(r: LearningRecord, pool: QuestionPool, today: number, toDay: ToDay, days = 7): number[]` — `[d]` = `dueDay === today + d` 的题数；`[0]` 另含 `dueDay < today`；`dueDay === null`（掌握）不计；pool 外的 id 不计。
  - `dailyCounts(r: LearningRecord, today: number, toDay: ToDay, days = 35): number[]` — `[0]` = 34 天前 … `[34]` = 今天；每天 = 当天至少一次 attempt 的不同题数（全部 src）。
  - `recordTotals(r: LearningRecord, pool: QuestionPool, today: number, toDay: ToDay): { answered: number; total: number; attempts: number; mastered: number; studyDays: number }`
  - `type RecordSort = "stars" | "rate"`；`topicRows(r: LearningRecord, index: TodayIndex, sort: RecordSort): { category: string; rows: { topicId: string; name_jp: string; stars: Stars; answered: number; total: number; rate: number | null }[] }[]`（三分野顺序同 `PRACTICE_CATEGORY_ORDER`；排序规则见 §0-9）

- [ ] **Step 1: 写失败测试**（`recordModel.test.ts`，注入 `toDay`）
  - `reviewForecast`：逾期 2 + 今天到期 1 → `[0] === 3`；明天到期 1 → `[1] === 1`；掌握题不计；长度 7。
  - `dailyCounts`：同一天同题 3 次 → 1；跨午夜 23:59 / 00:01 计两天；35 天前的作答不计；mock 作答计入。
  - `recordTotals`：盒 5 计入 mastered；`studyDays` = 有作答的不同日数。
  - `topicRows`：`rate` 排序 → 正答率升序、未答（null）在最后；`stars` 排序 → ★ 降序、题数降序、id 升序。
  - `RecordPage.ssr.test.ts`：四个区块的标题都在；空记录时显示空状态一句话、不出 NaN；页面 HTML 不含 `<svg`、`<canvas`（「不做装饰图形」，细柱用 CSS 宽度）。
  - `e2e/record.spec.ts`：答 2 题后 `/ja/record` 的「已做」= 2、今天的每日格 = 2；360×800 无横向溢出。
- [ ] **Step 2: 运行** → FAIL。
- [ ] **Step 3: 实现**（页面 server component 用 `loadTodayIndex(locale)` 建 pool，挂 `LearningRecordProvider`，`force-dynamic`；排序状态放 URL `?sort=rate`）。
- [ ] **Step 4: 运行** vitest + e2e → PASS。
- [ ] **Step 5: Commit** `feat(record): learning record page — totals, 7-day forecast, 5-week daily counts, topic table (DESIGN §6.6)`

### Task 6: 入口（导航・今日・练习设置）

**Files:**
- Modify: `apps/web/src/components/app/AppNav.tsx`（`APP_NAV` 加 record，§0-10）
- Modify: `apps/web/src/components/today/*`（次要链接加「模拟考试」）、`apps/web/src/components/practice/PracticeSetup.tsx`
- Modify: `apps/web/messages/{ja,zh,en}.json`（`Nav.record`、今日 / 设置的链接文案）
- Test: `apps/web/src/components/today/__tests__/TodayPage.ssr.test.ts`（第 192–195 行「不含模考链接」的断言反转为「含 `href="/mock"`」）、`apps/web/src/components/app/__tests__/`（APP_NAV 5 项、`/record` 激活判定）、`apps/web/e2e/today.spec.ts`（点「模拟考试」到 `/mock`）

- [ ] **Step 1: 写失败测试**（上列断言）。
- [ ] **Step 2: 运行** → FAIL。
- [ ] **Step 3: 实现**。手机宽度下导航 5 项不得横向溢出（`e2e/mobile.spec.ts` 已有的溢出检查覆盖，跑一遍）。
- [ ] **Step 4: 运行** vitest + `e2e/today.spec.ts` + `e2e/mobile.spec.ts` → PASS。
- [ ] **Step 5: Commit** `feat(nav): record in the nav, mock links on today / practice setup (DESIGN §6.1, §0-10)`

### Task 7: 收尾（Gates・Rule D・上线）

- [ ] **Step 1: Gates 全绿**（Phase 1 计划 Global Constraints 的五项）+ 本地 e2e 全量（:3150、Redis env 空、`--retries=0`），结果记入 `evidence/phase5/stage_07_ui/phase2/gates.md`。
- [ ] **Step 2: 截图抽检（Rule A 口径同 Phase 1 Task 16）**：独立 agent（`general-purpose` opus，非实现者）对本地 build 截：模考设置 / 考试中（row4 题、图题、中問题各 1）/ 回答見直し / 成绩页 / 学习记录页 × ja・zh × 1440・390，共 ≥ 24 张，对照数据核对：题面文字齐全、ア〜エ 顺序、考试中无 ○× 与解说、成绩数字与 `scoreMock` 重算一致、无横向溢出。结果 `evidence/phase5/stage_07_ui/phase2/audit.md`；FAIL → `failures/phase5/stage_07_ui/phase2_audit_attempt_N.md`（Rule B）。
- [ ] **Step 3: Rule D 整分支审查**（`oh-my-claudecode:code-reviewer` opus，与实现者不同 type），修正波 ≤ 1 轮后复审。
- [ ] **Step 4: 请用户同意 push** → main fast-forward + push → 本番 e2e 全量 → 记录到会话日志 + STATE。
- [ ] **Step 5: Rule C**：`RETROSPECTIVE_stage7_ui.md` 追加 Phase 2 小结（保留的做法 / 缺口 / 关键决策）。
