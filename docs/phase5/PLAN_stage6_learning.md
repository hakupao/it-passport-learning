# Stage 6 学習機能 (辞典 / 連結 / 学習記録 / AI 先生) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 glossary / tutor / chat 从死掉的电子书语料迁到 topic・term 主轴：上线静态三语辞典，接到 quiz 和教科书，加学习记录（owner 同步），最后做 BYOK 的 AI 老师。

**Architecture:** 辞典在服务器端用纯函数从 `data/ip/textbook/units/*.json` + `data/ip/quiz/questions.json` 建出（模块级缓存），由 server component 渲染，客户端只拿当前页需要的卡片数据，不走任何 API。学习记录是一个纯数据结构 + 可交换、幂等的合并函数，本地存 localStorage，owner 通过 `/api/learning` 同步到 Upstash。AI 老师（Phase 4）另写计划，先做浏览器直连 spike。

**Tech Stack:** Next.js 15 App Router (`force-dynamic` server components)、next-intl、TypeScript、vitest (node env, `src/**/*.test.ts`)、`@upstash/redis`、Playwright (e2e 对 prod)。

**Spec:** `docs/decisions/D-179-learning-features-redesign.md`（本计划的 §0 是对它的细化，计划批准时作为 D-180 锁定）。

## Global Constraints

- TypeScript only (D-110)，不加 Python，不加新的运行时依赖（Phase 1〜3 零新依赖）。
- 现在是设计阶段；计划经用户批准后才写代码。每个 Phase 走 TDD。
- 显示辞典时不调用 LLM（D-179 §2）。服务器不持有、不接收 LLM key（D-179 §4）。
- 学习记录只有 owner（D-148 cookie `itp_owner`）同步；API key 永不同步（D-179 §5）。
- ~~新的读 fs 的 route 必须加进 `outputFileTracingIncludes` / `outputFileTracingExcludes`（D-179 §9）~~ → **S131 改訂**：`next build --turbopack`（Next 15.5.18）不应用 per-route tracing 配置（turbopack-build 不返回 buildTraceContext），不要再往 `next.config.ts` 加 trace 条目；打包内容由 turbopack 自己追踪，IPA 防护 = Gates 里的 nft IPA leak 检查。
- locale `ja` 对应数据后缀 `_jp`：一律通过 `toDataLang()` / `pick()` / `pickTerm()`（`src/lib/textbook/reader.ts`），不自己拼。
- 小分類名只有 JP（OQ-03），所有 locale 都显示 JP。
- 每个 Task 结束 commit；每个 Phase 结束：gates 全绿 → Rule D（与 writer 不同 subagent_type）PASS → push。
- Gates（每个 Phase 末尾，`apps/web` 下）：`npx tsc --noEmit` 0 error / `npm run lint` 0 error / `npm test` 全 pass / `npm run build` exit 0 / nft IPA leak 0：`find .next -name '*.nft.json' -exec grep -lE 'data/ip/(exams|sources|syllabus)/' {} + | wc -l` 输出 `0`。
- 提交信息结尾带会话要求的 attribution 行。

## Review Focus

1. **同形异 unit 的术语（22 个，定义各不相同）**：辞典条目必须把每个 unit 的释义都列出来，不能只留第一个 → Task 2 的 `multi-sense` 测试 + Task 3 的真语料测试。
2. **含 URL 特殊字符的术语（26 个，如 `ISO/IEC 27000`、`M&A`、`A/Bテスト`）**：链接和路由必须能打开 → id 用哈希，不放原文；Task 2 `termId format` 测试 + Task 5 的 404/200 测试。
3. **zh/en 译名缺失或重复（zh 标题重复 6 组）**：列表和搜索不能因为 zh 同名而合并条目 → 条目主键是 JP 原文的 id，Task 2 测试。
4. **学习记录在两台设备上交叉更新**：合并后不能丢新的结果、重复合并结果不变 → Task 9 的交换律 / 幂等测试 + Task 11 的服务器端合并测试。
5. **非 owner 或 Redis 未配置时访问同步 API**：分别 403 / 503，绝不写入 → Task 11 测试。

---

## §0 细化决定（批准时锁为 D-180）

1. **术语 ID**：`termId(term) = "t" + fnv1a32hex(nfc(term)) + fnv1a32hex(nfc(term) + "#")`，即 `t` + 16 位小写 hex。FNV-1a 32 位、按 UTF-8 字节、offset basis `0x811c9dc5`、prime `0x01000193`。同步、纯函数、浏览器和服务器都能算。真语料上必须无碰撞（测试守住）。理由：26 个术语含 `/ & ? 空格 .`，不能直接当 path；哈希不需要额外的映射文件。
2. **辞典条目**：一个 JP 原文 = 一个条目。22 个跨 unit 术语保留全部释义（`senses[]`），顺序 = `buildNav()` 的 unit 出现顺序（technology → management → strategy，topic 顺序，unit_order）。条目的代表 topic = 第一个 sense 的 topic。
3. **URL**：列表 `/[locale]/glossary`，详情 `/[locale]/glossary/[termId]`。题目锚点 `/[locale]/quiz?mode=exam&id=<exam_id>#<question_id>`；教科书锚点 `/[locale]/textbook/<unitId>#<termId>`。
4. **对 D-179 §7「保持」的修正**：provider.ts / tutorPrompt.ts / 三个 shell 的 Chat・Tutor 视图 / useChatSession / useTutorSession 都依赖被删的服务器 route 或旧语料类型，留着就是没有调用方、还要维护编译的代码；而且 Phase 4 浏览器直连会重写它们。所以 **Phase 1 一并删除，Phase 4 需要时从 git 历史取回**（Task 1 在 commit message 里记下删除前的 commit hash）。真正保留的只有纯模块：`src/lib/tutor/escalation.ts`、`src/lib/chat/historyStore.ts`、`src/lib/tutor/tutorHistoryStore.ts`（`StorageLike` 类型迁到 `src/lib/storage.ts`，学习记录也要用）。
5. **quiz 的作答交互**（Phase 3）：点选项 = 作答，立刻显示对错和解析并记录；原来的「显示答案」按钮保留，按它只揭示、不记录。
6. **学习记录 schema**：每题只存最近一次结果（不存全部历史，体积有上限）：
   ```ts
   interface QuestionResult { choice: string; correct: boolean; at: number /* epoch ms */ }
   interface LearningRecord { v: 1; questions: Record<string, QuestionResult>; unitsRead: Record<string, number /* first read, epoch ms */> }
   ```
   合并：`questions` 每个 key 取 `at` 较大者（相等时取 `choice` 字典序较大者，保证确定性）；`unitsRead` 每个 key 取较小值。localStorage key `itp:learn:v1`。
7. **同步 API**：`GET /api/learning` 返回存储的记录；`PUT /api/learning` body = LearningRecord，服务器与已存记录合并后写回并返回合并结果。非 owner → 403，Redis 未配置 → 503，body 非法或超过 512 KB → 400。Redis key `learn:owner:v1`（单个 JSON 文档）。客户端：页面加载时 GET 并合并；本地变化后 2 秒防抖 PUT。

## File Structure

| 路径 | 职责 | Phase |
|---|---|---|
| `src/lib/storage.ts` | `StorageLike` 接口（从 progressStore 迁出） | 1 |
| `src/lib/glossary/termId.ts` | `termId()` 纯函数 | 1 |
| `src/lib/glossary/dictionary.ts` | 辞典类型 + `buildDictionary()` + `toTermCard()` + `buildListGroups()`（纯） | 1 |
| `src/lib/glossary/dictionaryReader.ts` | `loadDictionary()`（读盘 + 模块缓存） | 1 |
| `src/lib/textbook/reader.ts` | 新增 `loadAllUnits()` | 1 |
| `src/lib/quiz/quizReader.ts` | 新增 `loadBaseQuestions()`（只读 questions.json） | 1 |
| `src/app/[locale]/glossary/page.tsx` | 改写：列表 | 1 |
| `src/app/[locale]/glossary/[termId]/page.tsx` | 新建：详情 | 1 |
| `src/components/glossary/GlossaryList.tsx` / `TermDetail.tsx` / `glossary.module.css` | 列表（客户端搜索）/ 详情 | 1 |
| `src/components/glossary/TermChip.tsx` | 术语链接 + 卡片弹出 | 2 |
| `src/lib/learning/record.ts` | 记录 schema / 更新 / 合并 / 统计（纯） | 3 |
| `src/lib/learning/localStore.ts` | localStorage 读写 | 3 |
| `src/lib/learning/syncStore.ts` | Redis 读写 + 服务器端合并 | 3 |
| `src/hooks/useLearningRecord.ts` | 客户端 hook（本地 + owner 同步） | 3 |
| `src/app/api/learning/route.ts` | 同步 API | 3 |

---

## Phase 1 — 拆掉死语料层 + 静态辞典

### Task 1: 删除死语料链和服务器 AI 路由

**Files:**
- Create: `src/lib/storage.ts`
- Modify: `src/lib/tutor/tutorHistoryStore.ts:5`、`src/lib/tutor/__tests__/tutorHistoryStore.test.ts:6`（`StorageLike` 的 import 改到 `@/lib/storage`）
- Modify: `src/components/shells/gamified/GamifiedNav.tsx`、`src/components/shells/retro/RetroMenuBar.tsx`、`src/components/shells/terminal/TerminalShell.tsx`（NAV_ITEMS 删 `/chat`、`/tutor`）
- Modify: `messages/{ja,zh,en}.json`（删 `Chat`、`Tutor`、`QuizExplain`、`TermPopover`、`GlossaryList`、`Book` namespace）
- Delete: `src/lib/data/`（整个目录含测试）、`src/app/[locale]/{chat,tutor}/`、`src/app/[locale]/glossary/page.tsx`、`src/app/api/{chat,tutor,glossary,hello-ai}/`、`src/app/api/quiz/explain/`、`src/components/QuizExplain.tsx`、`src/components/TermPopover.tsx`、`src/components/shells/ThemedPage.tsx`、`src/components/shells/{gamified/GamifiedChat,gamified/GamifiedTutor,gamified/GamifiedGlossary,retro/RetroChat,retro/RetroTutor,retro/RetroGlossary,terminal/TerminalChat,terminal/TerminalTutor,terminal/TerminalGlossary}.tsx`、`src/hooks/{useChatSession,useTutorSession,useGlossaryState,useGrouping}.ts`（含其测试）、`src/lib/glossary/{glossaryScope,glossarySseTransport}.ts`（含测试）、`src/lib/quiz/{quizScope,quizSseTransport}.ts`（含测试）、`src/lib/tutor/tutorContext.ts`（含测试）、`src/lib/ai/`（整个目录含测试）、`e2e/{chat,tutor,firewall,glossary}.spec.ts`

**Interfaces:**
- Produces: `export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }`（`src/lib/storage.ts`）

- [ ] **Step 1:** 记下当前 HEAD hash（Phase 4 取回旧代码用）。
- [ ] **Step 2:** 按 Files 删除、新建、修改。`src/lib/owner.ts`、`src/middleware.ts`、`src/lib/quiz/feedback*`、`src/app/api/quiz/feedback/` 不动。
- [ ] **Step 3:** 残留检查：`grep -rnE "@/lib/(data|ai)|ThemedPage|TermPopover|useGrouping|_fixtures" src e2e` 无输出；`grep -rn "\"/chat\"\|\"/tutor\"" src` 无输出。
- [ ] **Step 4:** `npx tsc --noEmit` 0 error，`npm test` 全 pass（测试数会减少，记下前后数字）。
- [ ] **Step 5:** Commit：`refactor(web): D-179 Phase 1 — 死語料層とサーバー AI 経路を撤去 (旧コードは <hash> に残る)`。

### Task 2: termId 与辞典纯函数

**Files:**
- Create: `src/lib/glossary/termId.ts`、`src/lib/glossary/dictionary.ts`
- Test: `src/lib/glossary/__tests__/termId.test.ts`、`src/lib/glossary/__tests__/dictionary.test.ts`

**Interfaces:**
- Consumes: `TextbookUnit`、`UnitTerm`（`src/lib/textbook/types.ts`）、`ReaderIndex`、`buildNav`、`pick`、`pickTerm`（`src/lib/textbook/reader.ts`）、`QuizQuestion`（`src/lib/quiz/quizModel.ts`）
- Produces:
  ```ts
  export function termId(term: string): string; // /^t[0-9a-f]{16}$/
  export interface DictSense { unitId: string; topicId: string; category: string; term: UnitTerm }
  export interface DictQuestionRef { id: string; examId: string; sourceLabel: string }
  export interface DictEntry { id: string; term: string; termZh: string; termEn: string; senses: DictSense[]; questions: DictQuestionRef[] }
  export interface Dictionary { entries: DictEntry[]; byId: Map<string, DictEntry>; byTerm: Map<string, DictEntry> }
  export function buildDictionary(index: ReaderIndex, units: TextbookUnit[], questions: Pick<QuizQuestion, "id" | "exam_id" | "source_label" | "terms">[]): Dictionary;
  export interface TermCard { id: string; term: string; gloss: string; definition: string; memoryHook: string; senseCount: number; questionCount: number }
  export function toTermCard(entry: DictEntry, locale: string): TermCard; // 用 senses[0]
  export interface DictListItem { id: string; term: string; gloss: string; termZh: string; termEn: string }
  export interface DictListGroup { category: string; topicId: string; major: string; medium: string; nameJp: string; items: DictListItem[] }
  export function buildListGroups(dict: Dictionary, index: ReaderIndex, locale: string): DictListGroup[]; // 按 buildNav 顺序，组内按 term 的 localeCompare("ja")
  ```

- [ ] **Step 1: 写失败测试**
  - `termId`：`expect(termId("PDCA")).toMatch(/^t[0-9a-f]{16}$/)`；同一输入两次相同；`termId("ガ")`（NFC「ガ」）=== `termId("ガ")`（NFD）；`termId("ISO/IEC 27000")` 不含 `/`。
  - `buildDictionary`（用测试内的 2 个 unit 小夹具：术语 `機能要件` 同时出现在 `management-08-25-u01` 和 `strategy-07-23-u01`）：条目数 = 唯一 JP 原文数；`byTerm.get("機能要件")!.senses.map(s => s.unitId)` 等于 buildNav 顺序 `["management-08-25-u01", "strategy-07-23-u01"]`；两个 sense 的 `definition_jp` 都保留。
  - 题目反查：`questions: [{ id: "2024r06-q001", exam_id: "2024r06", source_label: "…", terms: ["機能要件", "不存在の語"] }]` → `機能要件` 的 `questions` 长度 1，未知术语被忽略且不抛错。
  - zh 同名：两个不同 JP 原文、相同 `term_zh` → 两个条目、两个不同 id。
  - `toTermCard(entry, "ja")` 的 `definition` = senses[0] 的 `definition_jp`，`senseCount` = 2；`toTermCard(entry, "zh").gloss` = `term_zh`。
  - `buildListGroups`：组顺序跟 `buildNav` 一致，每个条目只出现在代表 topic（第一个 sense）那一组。
- [ ] **Step 2:** `npx vitest run src/lib/glossary` → FAIL（模块不存在）。
- [ ] **Step 3:** 实现 §0-1 的 `termId`（`TextEncoder` 取 UTF-8 字节，`Math.imul` 做 32 位乘法，`>>> 0` 转无符号，`padStart(8, "0")`）；实现 dictionary.ts 的各函数。
- [ ] **Step 4:** 同一命令 → PASS。
- [ ] **Step 5:** Commit。

### Task 3: 读盘层 + 真语料不变量

**Files:**
- Modify: `src/lib/textbook/reader.ts`（新增 `loadAllUnits`）、`src/lib/quiz/quizReader.ts`（新增 `loadBaseQuestions`）
- Create: `src/lib/glossary/dictionaryReader.ts`
- Test: `src/lib/glossary/__tests__/dictionaryCorpus.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export function loadAllUnits(): Promise<TextbookUnit[]>;      // reader.ts，按 unit_index 里出现的 unit_id 逐个 loadUnit，模块级缓存
  export function loadBaseQuestions(): Promise<QuizQuestion[]>; // quizReader.ts，只读 questions.json，不合并 sidecar，模块级缓存
  export function loadDictionary(): Promise<Dictionary>;         // dictionaryReader.ts，模块级缓存
  ```

- [ ] **Step 1: 写失败测试**（读真实 `data/ip/`，模仿 `src/lib/quiz/__tests__/quizCorpusInvariants.test.ts` 的写法）：`entries.length === 1395`；senses ≥ 2 的条目数 `=== 22`；所有 `entries` 的 id 互不相同（Set 大小 1395）；`loadBaseQuestions()` 里所有 `terms` 的唯一值（999 个）都能在 `byTerm` 找到；`byTerm.get("ISO/IEC 27000")` 存在。
- [ ] **Step 2:** `npx vitest run src/lib/glossary/__tests__/dictionaryCorpus.test.ts` → FAIL。
- [ ] **Step 3:** 实现三个 loader。
- [ ] **Step 4:** 同一命令 → PASS。
- [ ] **Step 5:** Commit。

### Task 4: 辞典列表页

**Files:**
- Create: `src/app/[locale]/glossary/page.tsx`、`src/components/glossary/GlossaryList.tsx`、`src/components/glossary/glossary.module.css`
- Modify: `messages/{ja,zh,en}.json`（新 namespace `Glossary`：`title`、`subtitle`（含 `{n}` 条数）、`searchPlaceholder`、`noResults`、`backToList`、`definition`、`explanation`、`analogy`、`memoryHook`、`learnIn`、`questions`、`questionCount`（`{n}`）、`otherSenses`（`{n}`）、`openInGlossary`）
- Modify: `next.config.ts`（`/[locale]/glossary` 和 `/[locale]/glossary/[termId]` 都加 `[...TEXTBOOK_TRACE, "../../data/ip/quiz/questions.json"]` 和 `IPA_TRACE_EXCLUDE`）
- Test: `src/components/glossary/__tests__/GlossaryList.ssr.test.ts`

**Interfaces:**
- Consumes: `loadDictionary`、`loadReaderIndex`、`buildListGroups`
- Produces: `GlossaryList({ locale, groups }: { locale: string; groups: DictListGroup[] })`，客户端组件；搜索框按 `term` / `termZh` / `termEn` 做不区分大小写的子串匹配；每项链接到 `/glossary/<id>`。

- [ ] **Step 1: 写失败测试**（`renderToStaticMarkup` SSR 渲染，写法同 `src/components/quiz/__tests__/QuizRichText.ssr.test.ts`）：给 2 组 3 项 → 渲染出 3 个 `href` 为 `/ja/glossary/t…` 的链接；`filterItems(groups, "pdca")` 只留 `PDCA`（把过滤逻辑导出为纯函数 `filterItems(groups: DictListGroup[], q: string): DictListGroup[]`，空组去掉）。
- [ ] **Step 2:** 运行 → FAIL。
- [ ] **Step 3:** 实现页面（`force-dynamic`，`setRequestLocale`，metadata 用 `Glossary.title`）和组件；样式跟 `components/textbook/reader.module.css` 同一风格（不用 ThemedPage）。
- [ ] **Step 4:** 运行 → PASS；`npm run dev` 后手动打开 `/ja/glossary`、`/zh/glossary` 确认 200，搜索「ISO」能找到 `ISO/IEC 27000`。
- [ ] **Step 5:** Commit。

### Task 5: 辞典详情页

**Files:**
- Create: `src/app/[locale]/glossary/[termId]/page.tsx`、`src/components/glossary/TermDetail.tsx`
- Test: `src/components/glossary/__tests__/TermDetail.ssr.test.ts`

**Interfaces:**
- Consumes: `loadDictionary`、`loadReaderIndex`、`loadGeneratedSvg`、`pick`、`pickTerm`
- Produces: 页面：`termId` 不匹配 `/^t[0-9a-f]{16}$/` 或查不到 → `notFound()`。每个 sense 显示 定义・解说・类比・记忆口诀・图（`loadGeneratedSvg(term.figure.svg_path)`，内联方式同 `UnitReader.tsx`），「在哪学」链接 `/textbook/<unitId>#<termId>`；题目列表链接 `/quiz?mode=exam&id=<examId>#<questionId>`，文字为 `sourceLabel`。

- [ ] **Step 1: 写失败测试**：2 个 sense 的条目 → 渲染 2 个 sense 区块和 2 个 `/ja/textbook/…#t…` 链接；1 道题 → 1 个 `href="/ja/quiz?mode=exam&id=2024r06#2024r06-q001"` 的链接；`isValidTermId("t0123456789abcdef")` true、`isValidTermId("../x")` false（导出纯函数）。
- [ ] **Step 2:** 运行 → FAIL。
- [ ] **Step 3:** 实现。
- [ ] **Step 4:** 运行 → PASS；手动打开 `ISO/IEC 27000`、`機能要件`（2 个 sense）、一个无效 id（404）。
- [ ] **Step 5:** Commit。

### Task 6: Phase 1 收尾

**Files:**
- Create: `e2e/glossary.spec.ts`（新：列表 200、搜索、点进详情、详情里的题目链接带 `#`）
- Modify: `docs/STATE.md`、当次 session log

- [ ] **Step 1:** 跑 Global Constraints 的全部 gates，输出贴进 session log。
- [ ] **Step 2:** Rule D：reviewer 用与 writer 不同的 subagent_type（opus），审 Phase 1 全部 diff，重点看 Review Focus 1〜3。
- [ ] **Step 3:** PASS 后 push；部署后对 prod 跑 `npx playwright test e2e/glossary.spec.ts e2e/quiz.spec.ts`。
- [ ] **Step 3b:** 冷启动实测：prod 上对 `/ja/glossary` 和 `/ja/glossary/<任一 id>` 各请求 3 次（部署后第一次 = 冷启动），记录 TTFB。**冷启动 TTFB > 3 s** 时，在 Task 7 之前插入一个 Task：用构建脚本把辞典预先导出为 committed 的 `data/ip/glossary/dictionary.json`（与 D-134 派生数据同一模式），`loadDictionary()` 改读这个文件；≤ 3 s 则维持运行时构建。Task 7 之后对 `/ja/quiz?mode=exam&id=2024r06` 再测一次，同一阈值。
- [ ] **Step 4:** STATE 同步（glossary 500 解消、chat/tutor 已撤去）。Commit。

---

## Phase 2 — quiz・教科书 → 辞典

### Task 7: quiz 题目里的术语链接 + 卡片

**Files:**
- Create: `src/components/glossary/TermChip.tsx`
- Modify: `next.config.ts`（**只改注释**：在 `nextConfig` 上方写明 per-route tracing 在 turbopack 下不生效、IPA 防护靠 nft leak gate，并修正第 12-14 / 17-19 / 25-27 / 37-38 / 45-46 行把 tracing 写成有效的措辞；不加任何 trace 条目）
- Modify: `src/app/[locale]/quiz/page.tsx`（为当前题组收集 `terms` → `Record<string, TermCard>` 传给 QuizSet）、`src/components/quiz/QuizSet.tsx`（`<article id={q.id}>`；`q.terms` 每个渲染为 `TermChip`）
- Test: `src/components/glossary/__tests__/TermChip.ssr.test.ts`、`src/components/quiz/__tests__/QuizSet.ssr.test.ts`（新建）

**Interfaces:**
- Consumes: `loadDictionary`、`toTermCard`、`termId`
- Produces: `TermChip({ card, label, locale }: { card: TermCard | undefined; label: string; locale: string })`：有 card → 按钮，点开显示 gloss / definition / memoryHook / 「辞典で見る」链接（`/glossary/<id>`），Esc 和点外部关闭；无 card → 纯文本 `label`。`QuizSet` 新增 prop `termCards: Record<string, TermCard>`（key = JP 术语）。

- [ ] **Step 1: 写失败测试**：`TermChip` 有 card 时 SSR 输出含 `aria-expanded="false"` 的按钮，无 card 时只有文本；QuizSet 渲染出 `id="2024r06-q001"` 的 article。
- [ ] **Step 2:** 运行 → FAIL。
- [ ] **Step 3:** 实现。
- [ ] **Step 4:** 运行 → PASS；手动：从辞典详情点题目链接，页面滚动到该题。
- [ ] **Step 5:** Commit。

### Task 8: 教科书术语锚点 + 去辞典的链接

**Files:**
- Modify: `src/components/textbook/UnitReader.tsx:82`（`<article id={termId(tm.term)}>`，标题旁加链接 `/glossary/<id>`，文案 `Glossary.openInGlossary`）
- Test: 现有 UnitReader 测试追加（无则新建 `src/components/textbook/__tests__/UnitReader.ssr.test.ts`）

- [ ] **Step 1:** 失败测试：渲染含 `機能要件` 的 unit → 有 `id="<termId("機能要件")>"` 的 article 和指向 `/ja/glossary/<同 id>` 的链接。
- [ ] **Step 2〜4:** FAIL → 实现 → PASS。
- [ ] **Step 5:** Phase 2 收尾：gates → Rule D → push → STATE 同步。Commit。

---

## Phase 3 — 学习记录 + owner 同步

### Task 9: 记录模型（纯）

**Files:**
- Create: `src/lib/learning/record.ts`
- Test: `src/lib/learning/__tests__/record.test.ts`

**Interfaces:**
- Produces（schema 见 §0-6）：
  ```ts
  export const LEARNING_STORAGE_KEY = "itp:learn:v1";
  export function emptyRecord(): LearningRecord;
  export function recordAnswer(r: LearningRecord, qid: string, choice: string, correct: boolean, at: number): LearningRecord; // 不改原对象
  export function markUnitRead(r: LearningRecord, unitId: string, at: number): LearningRecord; // 已有则保留旧值
  export function mergeRecords(a: LearningRecord, b: LearningRecord): LearningRecord;
  export function parseRecord(x: unknown): LearningRecord | null; // v !== 1 或字段类型不对 → null
  export interface TopicStat { topicId: string; total: number; answered: number; correct: number }
  export function topicStats(r: LearningRecord, questions: Pick<QuizQuestion, "id" | "topic_id">[]): Map<string, TopicStat>;
  ```

- [ ] **Step 1: 写失败测试**：
  - `mergeRecords(a, b)` 深相等 `mergeRecords(b, a)`（交换律）；`mergeRecords(a, a)` 深相等 `a`（幂等）；`mergeRecords(mergeRecords(a,b),c)` 深相等 `mergeRecords(a,mergeRecords(b,c))`（结合律）。
  - 同一题 `at: 100` 错、`at: 200` 对 → 合并结果 `correct: true`；`at` 相同、choice `ア` vs `イ` → 取 `イ`。
  - `unitsRead` 合并取较小值。
  - `parseRecord({ v: 2 })` → null；`parseRecord({ v: 1, questions: { q: { choice: "ア", correct: "yes", at: 1 } }, unitsRead: {} })` → null。
  - `topicStats`：topic 有 3 题、答过 2 题、对 1 题 → `{ total: 3, answered: 2, correct: 1 }`。
- [ ] **Step 2〜4:** FAIL → 实现 → PASS。
- [ ] **Step 5:** Commit。

### Task 10: 同步存储 + API

**Files:**
- Create: `src/lib/learning/syncStore.ts`、`src/app/api/learning/route.ts`
- Test: `src/app/api/learning/__tests__/route.test.ts`（Redis 用接口注入，参考 `src/lib/quiz/__tests__/fakeFeedbackRedis.ts`）

**Interfaces:**
- Consumes: `isOwnerRequest`（`src/lib/owner.ts`）、`loadFeedbackRedis` 同样的 env 读取方式（`UPSTASH_REDIS_REST_URL || KV_REST_API_URL` 等）
- Produces:
  ```ts
  export const LEARNING_REDIS_KEY = "learn:owner:v1";
  export interface LearningRedis { get(key: string): Promise<unknown>; set(key: string, value: string): Promise<unknown> }
  export async function loadLearningRedis(): Promise<LearningRedis | null>;
  export async function readStored(redis: LearningRedis): Promise<LearningRecord>; // 无或非法 → emptyRecord()；`@upstash/redis` 的 `get` 会自动把 JSON 反序列化，所以返回值可能是对象也可能是字符串，两种都要先规整再 `parseRecord`
  export async function mergeAndStore(redis: LearningRedis, incoming: LearningRecord): Promise<LearningRecord>;
  ```
  route：`GET` / `PUT`，状态码见 §0-7；`PUT` 先看 `Content-Length` 或读出的字节数 > 524288 → 400。

- [ ] **Step 1: 写失败测试**：非 owner GET/PUT → 403 且 fake redis 无写入；fake redis 的 `get` 分别返回对象和 JSON 字符串时 `readStored` 结果相同；redis 为 null → 503；PUT 非法 JSON / `parseRecord` 失败 → 400；PUT 两次不同设备的记录 → 存储值 = 两者 `mergeRecords`，响应体相同；600 KB body → 400。
- [ ] **Step 2〜4:** FAIL → 实现 → PASS。
- [ ] **Step 5:** Commit。

### Task 11: 客户端 hook + quiz 作答

**Files:**
- Create: `src/lib/learning/localStore.ts`、`src/hooks/useLearningRecord.ts`
- Modify: `src/components/quiz/QuizSet.tsx`（选项变成按钮；未揭示时点选项 = 作答 + 揭示 + `recordAnswer`；已选的错误选项加样式；「显示答案」只揭示）、`src/app/[locale]/quiz/page.tsx`（`isOwner` 已有，传给 hook）
- Test: `src/lib/learning/__tests__/localStore.test.ts`、`src/components/quiz/__tests__/QuizSet.ssr.test.ts` 追加

**Interfaces:**
- Consumes: `StorageLike`、Task 9 全部、`/api/learning`
- Produces:
  ```ts
  export function loadLocal(storage: StorageLike): LearningRecord;            // 坏 JSON → emptyRecord()
  export function saveLocal(storage: StorageLike, r: LearningRecord): void;
  export function useLearningRecord(opts: { isOwner: boolean }): { record: LearningRecord; answer(qid: string, choice: string, correct: boolean): void; readUnit(unitId: string): void };
  ```
  hook：挂载时 `loadLocal`；`isOwner` 时 GET `/api/learning` 并 `mergeRecords`；每次变化 `saveLocal`，`isOwner` 时 2000 ms 防抖 PUT；网络失败只 `console.warn`，本地照常。

- [ ] **Step 1: 写失败测试**：`loadLocal` 对 `"{bad"` 返回空记录；`saveLocal` 后 `loadLocal` 深相等；QuizSet 选项渲染为 `<button>`。
- [ ] **Step 2〜4:** FAIL → 实现 → PASS；手动：答一题 → 刷新后 localStorage 有记录；owner 在两个浏览器各答一题 → 刷新后两边都有两题。
- [ ] **Step 5:** Commit。

### Task 12: 进度显示 + unit 已读

**Files:**
- Modify: `src/components/quiz/QuizBrowser.tsx`（每个 topic 显示 `answered/total` 与正确率；数据来自 hook + 服务器传来的 `Pick<QuizQuestion,"id"|"topic_id">[]`）、`src/components/textbook/TextbookToc.tsx`（已读 unit 打标）、`src/components/textbook/UnitReader.tsx`（挂载时 `readUnit(unit.unit_id)`）、相关 page.tsx（传 `isOwner`）
- Modify: `messages/*.json`（`Quiz.progress`、`Textbook.read`）

- [ ] **Step 1〜4:** 失败测试（`QuizBrowser` 收到含 1 个已答题的记录 → 该 topic 显示 `1/…`）→ 实现 → PASS。
- [ ] **Step 5:** Phase 3 收尾：gates → Rule D（重点 Review Focus 4・5）→ push → prod 上 owner 同步实测 → STATE 同步。Commit。

---

## Phase 4 — AI 老师（BYOK 浏览器直连）

本 Phase 只在本计划里定前两步，详细计划等 spike 结果再写。

### Task 13: 浏览器直连 spike（一次性，不进主代码）

- [ ] **Step 1:** 在 Next dev app 里临时加一个不 commit 的页面（如 `src/app/[locale]/spike-byok/page.tsx`（不能用 `_` 开头，Next 会把它当私有目录不出路由），用完删除，`git status` 确认无残留；借用现成的 bundler，免得另搭工具链）。页面：输入 key → 用 `@ai-sdk/deepseek` 的 `createDeepSeek({ apiKey })` 和 `@ai-sdk/anthropic` 的 `createAnthropic({ apiKey, headers: { "anthropic-dangerous-direct-browser-access": "true" } })` 在浏览器里 `streamText`，打印逐块输出。
- [ ] **Step 2:** 用户在本机浏览器里输入自己的 key 运行（key 不经过本会话、不写文件）。记录两家：能否流式、首字延迟、错误时的表现、prompt cache 是否生效（Anthropic usage 字段）。
- [ ] **Step 3:** 结果写进 `evidence/phase5/stage_06_ai_sensei/spike_S13x.md`；失败的 provider 按 Rule B 归档到 `failures/`。

### Task 14: 写 Phase 4 计划

- [ ] 依据 spike 结果写 `docs/phase5/PLAN_stage6_ai_sensei.md`，至少决定：key 存储（localStorage key、删除入口、CSP 策略具体值）、入口（题目「为什么」/ 术语 / unit / 自由提问）、上下文取材（浏览器如何拿到 unit 和解析数据，是否需要只读的静态 JSON）、从 Task 1 记下的 hash 取回哪些旧代码（escalation、prompt 结构、history store）、`/tutor` 路由与 nav 恢复。交用户批准。
