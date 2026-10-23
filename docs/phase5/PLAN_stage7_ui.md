# Stage 7 UI/UX 全面再设计 — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 上线 Phase 1：A4 单一外观 + 学习记录 v2（服务器先行）+ 今日 / 练习（一题一屏）/ 错题本 / 单题 / 设置 + 旧链接跳转 + 教科书・辞典・AI 老师换皮，让用户能在电脑上每天走「今日 → 练习」。

**Architecture:** 学习记录升到 v2（每题最近 10 次作答 + LWW 设置），仍是纯数据结构 + 可交换・结合・幂等的合并；服务器先上线并同时讲 v1 / v2。复习排期、每日任务都是 attempts 的纯函数，在浏览器里算（记录只在客户端）；服务器只给出题库的轻量索引。练习组的"题目清单"在 URL 里，组内进度在 sessionStorage 里，组的状态机是纯 reducer。外观换成一套 CSS 变量 token，`ui/*` 组件改为引用 token，三套 shell 删除。

**Tech Stack:** Next.js 15 App Router（`force-dynamic` server components）、next-intl、TypeScript、Tailwind v4 + CSS Modules、`next/font/google`（BIZ UDPGothic / Noto Sans SC）、vitest（node env，`src/**/*.test.ts`，SSR 测试用 `renderToStaticMarkup`）、`@upstash/redis`、Playwright。

**Spec:** `docs/phase5/ui_redesign/DESIGN.md`（ADR `docs/decisions/D-189-ui-ux-redesign.md`）。本计划 §0 是对它的细化，**已于 S132 经用户批准锁为 D-190**（含「与 DESIGN 的偏离」a〜e；执行方式 = subagent-driven，每 Task 配审查）。mockup：`docs/phase5/ui_redesign/mockups/A4-Practice.dc.html`、`A4-Home.dc.html`。

## Global Constraints

- TypeScript only (D-110)。**不加新的运行时依赖**（字体走 `next/font/google`，不算依赖）。
- STATE = 实施阶段，但**本计划经用户批准后才写代码**。每个 Task 走 TDD（先写失败测试）。
- 题面文字一个字也不能变（D-189 §7）。不改 `data/ip/**` 的语料；只新增派生文件 `data/ip/textbook/unit_minutes.json`（Task 6）。
- locale `ja` ↔ 数据后缀 `_jp`：一律通过 `toDataLang()` / `localized()` / `localizedStem()` / `localizedChoices()` / `localizedExplanation()`（`src/lib/quiz/quizModel.ts`）和 `pick()` / `pickTerm()`（`src/lib/textbook/reader.ts`），不自己拼字段名。
- 小分類名只有 JP（OQ-03），所有 locale 都显示 JP。
- 颜色只用 DESIGN §3.1 的 7 个 token：`--ink #1B2A4A` `--ink-muted #5A6680` `--spot #B8501A` `--tint #FBF0E8` `--paper #FFFFFF` `--rule #D5DAE3` `--rule-spot #E4D3C6`。圆角 0〜6px，无阴影，无渐变（波浪下划线除外），对错不用红绿。
- 反目标（DESIGN §1）：灰底白圆角卡片满屏、蓝色强调、胶囊徽章、`⌘K`/`Enter` 键帽提示、对称卡片网格、到处灰色小字；打乱 ア〜エ；弹窗打断做题；惩罚式游戏化。任何 Task 的产物出现这些 = 不通过。
- `LearningRecordProvider` 永远不放进 `[locale]/layout.tsx`（读 cookie 会让全站变 dynamic）；需要记录的页面各自挂 provider 并 `force-dynamic`。
- 不往 `next.config.ts` 加 trace 条目（S131 改訂：turbopack build 不用 per-route tracing）。CSP 不变（`connect-src 'self' https://api.anthropic.com`）。
- Gates（`apps/web` 下，每个 Checkpoint 必须全绿）：`npx tsc --noEmit` 0 error / `npm run lint` 0 error / `npm test` 全 pass / `npm run build` exit 0 / nft IPA leak `find .next -name '*.nft.json' -exec grep -lE 'data/ip/(exams|sources|syllabus)/' {} + | wc -l` 输出 `0`。
- e2e：部署前一律跑本地：`npm run build && npm start`（另一终端）后 `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test`；owner 同步 spec 另加 `E2E_OWNER_KEY=<本地 .env.local 的 OWNER_KEY>`。默认 base URL 是本番，**部署前不要不带 `PLAYWRIGHT_BASE_URL` 跑**。
- **push = 本番部署，是对外动作**：每次 push 前停下来请用户明确同意（Checkpoint 1A、1C 各一次）。不 force-push，不 rebase。
- 每个 Task 结束 commit（信息结尾带会话要求的 attribution 行）；subagent 一律 `model: opus`；Rule D 审查者与执行者用不同 `subagent_type`。
- 证据目录：`evidence/phase5/stage_07_ui/`（Rule A）；失败 attempt 归档 `failures/phase5/stage_07_ui/`（Rule B，不删）。
- 证据文件里**不放题目原文**（IPA 版权）：只放 id、哈希、计数。

## Review Focus

1. **升级期间一台设备还是旧版页面（v1 客户端）**：它的 GET / PUT 必须照常工作，两边的作答都不丢 → Task 3 `v1 client round-trip` 测试 + Task 4 `v1 key written by an old tab is merged` 测试。
2. **跨午夜作答 / 同一天反复做同一题**：23:59 与 00:01 是两天；同一天第二次作答存下来但不推进盒子 → Task 5 `day boundary` 与 `same-day repeats` 测试（注入 `toLocalDay`）。
3. **迁移后旧错题几百道**：今日复习行 ≤ 30，旧对题平铺在 14 天内，第一天不会出现 2000 题到期 → Task 5 `migration backlog` 测试（800 错 + 1500 对的合成记录）。
4. **中問组跨练习组边界 / 直接打开组内第 3 题**：整组按顺序一起出，折叠的前文文字不丢 → Task 6 `lcpPreamble` 测试 + Task 8 `chumon fold keeps full stem text` 测试 + Task 9 `group expansion` 测试。
5. **做题中途刷新；URL 被改坏；焦点在 AI 老师输入框里按数字键**：刷新后位置和已答恢复、同一题在组内不重复记录（sessionStorage 按标签页隔离，新标签页 = 新的一组，同日重做只是多存一条 attempt、不推进盒子）；未知 id 被丢弃，全部无效时回到设置面板；输入框里的按键不作答 → Task 9 `restore / duplicate pick / parseScope / keys ignored in editable targets` 测试。

---

## §0 细化决定（D-190，S132 用户批准）

1. **记录 v2 的线上 / 存储格式**（DESIGN §5.2 的紧凑编码）：
   ```ts
   // 内存
   interface Attempt { at: number; choice: ChoiceLetter; correct: boolean; src: "practice" | "mock" | "v1" }
   // 线上 / localStorage / Redis（WireRecordV2）
   { v: 2, a: Record<qid, [at, choiceIdx 0-3, correct 0|1, src "p"|"m"|"1"][]>, u: Record<unitId, number>,
     s: { examDate?: [value, at], dailyReviewCap?: [value, at], dailyNewTarget?: [value, at], transDefault?: [value, at] },
     since?: number }
   ```
   `choice` 必须是 ア/イ/ウ/エ 之一；v1 里不是这四个字母的作答在升格时丢弃（测试固定）。
2. **作答的全序与 top-K**：比较键依次 `at` 降序 → `choice` 降序 → `correct=false` 在前 → `src`（"v1" < "practice" < "mock" 的反序，即 mock 在前）。去重键 = `(at, choice, correct)`，撞键时留全序里靠前的那个。合并 = 两边并集 → 去重 → 排序 → 取前 `ATTEMPTS_K = 10`。`recordAttempt` 保留 v1 的 `at ≥ 该题已有最大 at + 1` 规则。
3. **新旧客户端共存（服务器先行）**：`PUT` 按 body 的 `v` 回同版本（v1 body → 合并后降级为 v1 返回）；`GET` 默认回 v1 降级版，`GET /api/learning?v=2` 回 v2。降级 = 每题取全序第一的那次 → `{choice, correct, at}`。Redis 新 key `learn:owner:v2`；读不到时读 `learn:owner:v1` 升格（旧 key 永不再写、不删）。body 上限 `1048576` 字节。
4. **`v2Since`**：`upgradeV1(r, now)` 设 `since = now`；合并取较小值。客户端升格、服务器升格都用同一个 `upgradeV1`。
5. **"天"**：一律用浏览器本地日期，`toLocalDay(at: number): number`（本地年月日 → `Date.UTC(y, m, d) / 86400000`，即自 1970-01-01 起的天序号）。排期函数把 `toLocalDay` 作为参数注入（测试传 UTC 版，结果确定）。
6. **排期**：`reviewState(attempts, v2Since, qid, toDay)`（qid 用于 v1 正解的平铺哈希），规则照 DESIGN §5.4 表；v1 升格来的正解 = 盒 2、到期 = `toDay(v2Since) + fnv1a32(qid) % 14`——**只在该 `src:"v1"` 作答是这题时间上最早的一条、且 `at < v2Since` 时适用**，否则按普通作答处理（迁移后旧标签页写进来的 v1 作答不会拿到已过去的到期日）；`v2Since` 缺失（正常不会出现，`upgradeV1` 总会设）时用该作答自己的 `at`。「第一次作答就答对」= 保存窗口（最近 10 次）里最早的一条；历史超过 10 次后是近似（第一次早已被挤出窗口，此时盒子早已 ≥ 2，影响可忽略）。`at ≥ 已有最大 at + 1` 只在设备时钟倒退时才会把作答推后 1 ms，可能跨到下一天，接受。错题的到期 = 最后计入日 + 当前盒间隔（答错当天 → 明天）。**今日队列只收到期 ≤ 今天的错题与到期复习**（今天刚错的题明天出，与 mockup「明天再出」一致）。
7. **每日量的计数**：`reviewedToday` = 今天第一次作答、且该题今天之前已有作答的题数；`newToday` = 第一次作答在今天的题数。复习余量 = `max(0, cap − reviewedToday)`；新题余量 = `max(0, target − newToday)`。今日任务行显示余量；余量 0 且今日做过 → 勾选。
8. **中問组的计数与溢出**：组内一题被抽到 → 整组按题号顺序进入，**允许超出组上限 20**（不拆组）；组按成员数计入复习余量 / 新题余量。
9. **新题挑选**：种子 = `fnv1a32(<本地日期 YYYY-MM-DD>)`，PRNG = mulberry32，同一天刷新结果不变。先补"已答 < 5 题"的领域（頻出度 ★ 高 → 题数多 → topic_id 字典序），每个这样的领域先取 1 题，轮流直到够数；仍不够则按三分野 **ストラテジ 35 : マネジメント 20 : テクノロジ 45**（IPA 公布的出题数）加权随机。**新用户摸底**（记录为空）= 同一函数、n = 20、`fillWeakTopics: false`，即只按三分野比例随机（DESIGN §6.1；否则空记录下 63 个领域都算「已答 < 5」，会全是 ★★★）。
10. **薄弱领域排序**：按领域内每题的"最近一次"作答算正答率；要求已答 ≥ 5 且至少错 1 题；分数 = `(1 − rate) × 该领域题数`，降序，平手按 rate 升序 → topic_id；最多 5 行。
11. **頻出度 ★**：`quiz_index.topics[].question_count` 在 63 个领域里排序，前 1/3 → ★★★，中 1/3 → ★★☆，后 1/3 → ★☆☆（`Math.floor(rank * 3 / 63)`，rank 0 = 最多；题数相同按 topic_id 字典序）。运行时纯函数，不存文件。
12. **练习 URL**：`/practice?ids=<id,id,…>`（≤ 100 个，客户端算出的队列用这个）｜`?topic=<id>[,<id>…]` / `?exam=<id>` + `n=10|20|50|all` + `order=seq|rand` + `seed=<int>`（服务器解析出题清单）；任一形式可加 `from=today`（组末「继续下一项」回到今日链）。无任何范围参数 → 设置面板。未知 id 丢弃；全部无效 → 设置面板。
13. **练习组的状态**：纯 reducer `practiceReducer`；组键 = `fnv1a32(ids.join(","))` 的 hex；`sessionStorage["itp:practice:v1:<组键>"]` 存 `{ pos, answers: Record<qid, choice>, startedAt }`，刷新恢复；同一题在组内只记录一次（reducer 拒绝重复作答）。storage 不可用 → 只在内存里跑。
14. **键盘**：`1`–`4` 选 ア〜エ（未答时），`←` / `→` 上一题 / 下一题，`Enter` 已答时下一题，`Esc` 关闭图片放大。键盘处理只把按键映射成 reducer action（`keyToAction`，纯函数可测）；按键目标是 `input` / `textarea` / `select` / `contenteditable`，或 AI 老师面板 / 图片放大层开着时，一律不处理。
15. **选项排法**：四个选项都满足「JP 文本去空白后 ≤ 12 个码点、无换行、不是表（`isTableChoice`）、无 `choice_figures`」→ 4 列横排；`choice_figures` → 2×2；其他一项一行。
16. **解说标题短句**：`points[0]` 在第一个「。」之前的部分，≤ 30 码点时显示「問 N　<短句>」，否则只显示「問 N」。
17. **AI 老师入口**：今日薄弱领域表的「AI 分析」= 写 click intent（现有 `writeReviewIntent`）后进入 `/practice/browse/<topicId>?review=1`，该页挂现有 `ReviewLauncher`（行为与 D-181 Phase B 完全相同）。`reviewIntent` 模块保留。练习解说里的「问 AI 老师」= 现有 `AskSensei`。**偏离 DESIGN §4**（DESIGN 写旧 `?review=1` → 今日页打开 AI 复习）：今日页没有该领域的题目全文，建不了 `reviewAnchor`，所以旧 `?review=1` / `&thread=` 也落到领域页，在那里打开。
18. **AI 回复里的 `#<question_id>` 链接**：`SenseiHost` 新增可选 `onQuestionLink?: (id: string) => boolean`；`SenseiPanel` 点击时先问它（返回 true = 已处理：关面板、跳到组内那题），否则若页面上有该元素按旧逻辑滚动，否则 `router.push("/practice/q/<id>")`。
19. **`ui/*` 换皮**：保留 shadcn 组件，改 `button.tsx` 等的 cva 类名：去掉 `rounded-md`/`shadow-xs`/蓝色 ring，改为 `rounded-[4px]`、无阴影、`focus-visible:outline-2 outline-[var(--ink)]`；`globals.css` 的 `@theme inline` 把 `--color-primary/foreground/background/border/ring/accent` 映射到 token，`--font-sans` 改成 BIZ UD 的变量。删除 `prefers-color-scheme: dark` 块与 retro / nav-fade 工具类。
20. **今日页的客户端载荷**（记录在浏览器，所以任务在浏览器里算）：`TodayIndex = { topics: TopicMeta[]; topicQuestionIds: Record<topicId, string[]>; groups: Record<groupKey, string[]>; topicTerms: Record<topicId, TermCard[]>; exams: Record<examId, string /*label_jp*/> }`，`TopicMeta = { id, category, name_jp, stars: 1|2|3, questionCount, units: { id, title, minutes }[] }`。JSON 序列化 ≤ 160 KB（测试守住）。错题本 / 领域页的每行标签（「令和7年度 問1」+ 领域名）由 qid（`<exam_id>-q<NNN>`）+ `exams` + `topics` 在客户端拼出，不另发数据。「今天的 3 个用语」= 今日第一项任务里第一题所在领域的 `topicTerms`（该领域题目 `terms` 里出现次数最多、且辞典有条目的前 3 个）——这是对 DESIGN §6.1「从今日任务的题的 terms 里取」的近似，为的是不把 2900 题的 terms 全量发给浏览器。
21. **单元预估时间**：`scripts/textbook-unit-minutes-build.mjs` 从 `data/ip/textbook/units/*.json` 的 `overview.est_minutes` 生成 `data/ip/textbook/unit_minutes.json`（`{ schema_version: 1, minutes: Record<unitId, number> }`），带 `--check`；vitest 守住一致（同 `chumon_groups.json` 的做法）。
22. **導航**：Phase 1 显示 今日 / 练习 / 教科书 / 辞典；「记录」与「模拟考试」在 Phase 2 才出现（页面不存在时不放链接）。右侧 = `日 / 中 / EN` + 「设置」。
23. **messages**：新 namespace `App`（框架、导航）、`Today`、`Practice`（含原 `Quiz` 里仍要用的 feedback 文案）、`Mistakes`、`Settings`；删除 `Shell`、`Nav`、`Quiz`。`Textbook` / `Glossary` / `Sensei` 本期只删过时文案（如 `Textbook.quizDeferred` 改为指向练习），全面重写放 Phase 3 / 4（对 DESIGN §6.9「全部重写」的分期）。
24. **`suspect` 提示文案**（三语，Task 8 原样使用）：
    - ja「※ この問題は、解説作成時の検算で公表解答を確認しきれませんでした。判定は IPA 公表の解答どおりです。」
    - zh「※ 编写解析时的验算未能完全确认公布答案；判定仍按 IPA 公布的答案。」
    - en「※ Our check while writing this explanation could not fully confirm the published answer; scoring follows IPA's official key.」
25. **解说内的重要语与语言切换**：解说块顶部 `日 / 中 / EN` 切换（默认 = UI 语言，D-186），只换解说语言、不换题面。重要语 = 本题 `terms` 中有辞典卡片的词，在解说文本里出现处加 spot 色粗体（只加样式，不改文字）。**波浪下划线本期不做**：数据里没有"关键句"的标记，DESIGN 也说不做 NLP 猜测。
26. **今日任务的分组**：每个任务行的 href 只装该类的前 ≤ 20 题（按优先顺序，`expandGroups` 后不拆中問组，可略超 20）；做完一组，总结页「继续下一项」重算 `dailyPlan`，同类还有余量就再来一组，否则进入下一类。

### 与 DESIGN 的偏离（随 D-190 请用户批准）
| # | DESIGN 原文 | 本计划 | 理由 |
|---|---|---|---|
| a | §4 旧 `?review=1` → 今日页打开 AI 复习 | → 领域页 `/practice/browse/<topicId>?review=1`（§0-17） | 今日页没有建 `reviewAnchor` 所需的题目全文 |
| b | §6.1「今天的 3 个用语」从今日任务的题的 terms 里取 | 取第一项任务第一题所在领域的高频 term（§0-20） | 不把 2900 题的 terms 全量发给浏览器 |
| c | §6.1 / §5.4 单元分钟数「构建时生成」 | 一致（脚本 + `--check`）；頻出度 ★ 改为运行时纯函数（§0-11） | 只依赖 `quiz_index`，计算量可忽略 |
| d | §6.2 关键句波浪下划线 | 本期不做（§0-25） | 无关键句标记数据 |
| e | §6.9 三语 messages 全部重写 | 新页面全新；教科书 / 辞典 / AI 老师只删过时文案，重写放 Phase 3 / 4（§0-23） | 这三页本期只换皮 |

## File Structure

| 路径 | 职责 | Task |
|---|---|---|
| `evidence/phase5/stage_07_ui/baseline.jsonl` + `src/components/practice/__tests__/fidelityBaseline.ts` | 旧渲染器逐题逐字段哈希（改动前冻结） | 1 |
| `src/lib/hash.ts` | `fnv1a32()`、`mulberry32()`（termId 改用它） | 2 |
| `src/lib/learning/record.ts` | v2 schema / 更新 / 合并 / 编解码 / `latestResult` / `topicStats`（纯） | 2 |
| `src/lib/learning/recordV1.ts` | v1 类型、`parseRecordV1`、`upgradeV1`、`downgradeToV1`（纯） | 2 |
| `src/lib/learning/syncStore.ts` / `src/app/api/learning/route.ts` | v2 key、v1 回退读、按版本回复 | 3 |
| `src/lib/learning/localStore.ts` / `syncClient.ts` / `src/hooks/useLearningRecord.ts` | v2 本地存储、`?v=2`、新 actions | 4 |
| `src/lib/learning/schedule.ts` | `toLocalDay`、`reviewState`、`classify`、`dailyPlan`、`pickNew`（纯） | 5 |
| `src/lib/practice/practiceIndex.ts` | 頻出度、中問组、LCP 前文、范围解析、`TodayIndex` 组装（纯） | 6 |
| `src/lib/practice/practiceReader.ts` | 读盘 + 模块缓存（questions / groups / unit_minutes / 辞典） | 6 |
| `scripts/textbook-unit-minutes-build.mjs` + `data/ip/textbook/unit_minutes.json` | 单元分钟数派生表 | 6 |
| `src/app/globals.css`、`src/app/[locale]/layout.tsx`、`src/components/app/AppShell.tsx`、`app.module.css` | token、字体、全局框架 | 7 |
| `src/components/ui/*.tsx` | 换皮（token） | 7 |
| `src/components/practice/PracticeQuestion.tsx`、`ExplanationPane.tsx`、`choiceLayout.ts`、`practice.module.css` | 问题面 / 解说 | 8 |
| `src/lib/practice/practiceSession.ts` | `practiceReducer`、`keyToAction`、`parseScope`、session 存取（纯 + storage 注入） | 9 |
| `src/components/practice/PracticeSession.tsx`、`SessionSummary.tsx`、`AnswerCard.tsx` | 一题一屏 + 组末总结 | 9 |
| `src/app/[locale]/practice/page.tsx` | 设置面板或练习组 | 9–10 |
| `src/components/practice/PracticeSetup.tsx` | 设置面板 | 10 |
| `src/app/[locale]/practice/browse/page.tsx`、`browse/[topicId]/page.tsx`、`q/[qid]/page.tsx` | 浏览 / 领域页 / 单题页 | 10 |
| `src/app/[locale]/page.tsx`、`src/components/today/*` | 今日 | 11 |
| `src/app/[locale]/practice/mistakes/page.tsx`、`src/app/[locale]/settings/page.tsx`、对应组件 | 错题本 / 设置 | 12 |
| `src/app/[locale]/quiz/page.tsx`（改为跳转页）、`src/lib/practice/legacyLinks.ts` | 旧链接 | 13 |
| `src/lib/sensei/threadLinks.ts`、`src/components/glossary/TermDetail.tsx`、`src/components/sensei/{AskSensei,SenseiPanel}.tsx` | 新链接 | 9、13 |
| `src/components/textbook/*.module.css`、`glossary.module.css`、`sensei/*` | 换皮 | 14 |
| `e2e/*.spec.ts` | 重写 / 新增 | 15 |
| **删除** `src/components/shells/`、`src/hooks/useTheme.ts`(+test)、`src/components/quiz/{QuizSet,QuizBrowser,TopicProgress}.tsx`(+tests)、`src/components/sensei/ReviewCard.tsx` | — | 7、13 |

---

## Part 1A — 学习记录 v2（服务器先行）

### Task 1: 冻结旧渲染器的显示基线（任何改动之前）

**Files:**
- Create: `src/components/practice/__tests__/fidelityBaseline.ts`（导出 `fieldText()` 与 `baselineRows()`，不是测试文件）
- Create: `src/components/practice/__tests__/fidelityBaseline.capture.test.ts`
- Create: `evidence/phase5/stage_07_ui/baseline.jsonl`、`evidence/phase5/stage_07_ui/README.md`

**Interfaces:**
- Produces: `interface BaselineRow { qid: string; locale: "ja"|"zh"|"en"; source: string; stemJp: string; choicesJp: string[4]; stemTr: string|null; choicesTr: (string|null)[4]; figure: string|null; choiceFigures: (string|null)[4]; explCorrect: string|null; explDistractors: [letterIndex 0-3, string][]; points: string[]; suspect: boolean }`（ja 行的 `*Tr` = null）。
  - 文本字段 = `sha256(fieldText(html))` 前 16 hex；`fieldText` = 去标签但**保留换行**（`<br>` 与块元素边界 → `\n`，行内连续空白合成 1 个，每行 trim），再拼上**标签签名**（`pre/table/tr/th/td/img/br/ul/li` 各自的个数），表格压扁成段落或缩进丢失都会改哈希。
  - 图片字段 = `sha256(src 的 basename + "|" + alt)` 前 16 hex（`<img>` 没有文本，不能用 `fieldText`）。
  - `source` = `source_label` 的哈希。不存任何假名 / 汉字（字母用下标 0–3）。

- [ ] **Step 1:** 记下当前 HEAD（`git rev-parse HEAD`）写进 README 头部。
- [ ] **Step 2:** 写 capture 测试：对 `loadAllQuestions()` 的 2900 题 × ja/zh/en，用**现行** `StemBlocks` 分别渲染 `stem_jp`（→ `stemJp`）与 `localizedStem`（zh/en → `stemTr`），`ChoiceBody` 分别渲染 JP 选项与 `localizedChoices`（zh/en），`renderToStaticMarkup` 后取 `fieldText`；图题 / 选项图按图片字段规则；`localizedExplanation` 的各字段直接取文本；按行写 `BaselineRow`。只在 `CAPTURE_BASELINE=1` 时写文件，否则断言文件存在且行数 = `8700`。
- [ ] **Step 3:** `CAPTURE_BASELINE=1 npx vitest run src/components/practice/__tests__/fidelityBaseline.capture.test.ts` → 生成 8700 行；再不带变量跑一次 → PASS。
- [ ] **Step 4:** `grep -c "" evidence/phase5/stage_07_ui/baseline.jsonl` 输出 `8700`；`grep -E "[ぁ-んァ-ン一-龥]" evidence/phase5/stage_07_ui/baseline.jsonl | wc -l` 输出 `0`（不含原文）。
- [ ] **Step 5:** Commit `test(ui): S132 Stage 7 — freeze display baseline of the current quiz renderer (2900 × 3 locales, hashes only)`

### Task 2: 记录 v2 纯模型

**Files:**
- Create: `src/lib/hash.ts`、`src/lib/__tests__/hash.test.ts`
- Modify: `src/lib/glossary/termId.ts`（改用 `fnv1a32`，行为不变；`termId.test.ts` 不改且全过；用相对路径 `import { fnv1a32 } from "../hash"`——e2e 用相对路径直接 import termId，不能用 `@/`；`hash.ts` 自身不 import 任何东西）
- Create: `src/lib/learning/recordV1.ts`（**先把现在的 `record.ts` 原样复制过来**，导出名不变，再加下面 3 个新函数）、`src/lib/learning/__tests__/recordV1.test.ts`（现 `record.test.ts` 原样移过来 + 新用例）
- Modify（只改 import 路径到 `@/lib/learning/recordV1`，逻辑不动，保证每个 commit `tsc` 全绿）：`localStore.ts`、`syncClient.ts`、`syncStore.ts`、`src/app/api/learning/route.ts`、`src/hooks/useLearningRecord.ts`、`src/lib/sensei/{weakness,anchors}.ts`、`src/components/quiz/TopicProgress.tsx` 及它们的测试，以及 `e2e/learning-owner.spec.ts:31`、`src/components/textbook/__tests__/TextbookToc.ssr.test.ts:11`、`src/components/quiz/__tests__/QuizBrowser.ssr.test.ts:13`（`tsconfig` 的 `**/*.ts` 包含 e2e）
- Modify: `src/lib/learning/record.ts`（重写为 v2，不再被上面这些文件引用）、`src/lib/learning/__tests__/record.test.ts`（重写）

**Interfaces:**
- Produces (`hash.ts`): `fnv1a32(s: string): number`（UTF-8 字节，offset `0x811c9dc5`，prime `0x01000193`，无符号）；`mulberry32(seed: number): () => number`（[0,1)）。
- Produces (`record.ts`):
  - `type ChoiceLetter = "ア"|"イ"|"ウ"|"エ"`；`interface Attempt`、`interface LwwValue<T> { value: T; at: number }`、`interface LearningSettings { examDate?: LwwValue<string>; dailyReviewCap?: LwwValue<number>; dailyNewTarget?: LwwValue<number>; transDefault?: LwwValue<"hidden"|"shown"> }`、`interface LearningRecord { v: 2; attempts: Record<string, Attempt[]>; unitsRead: Record<string, number>; settings: LearningSettings; v2Since?: number }`（DESIGN §5.2）。
  - `ATTEMPTS_K = 10`；`LEARNING_STORAGE_KEY = "itp:learn:v2"`；`SETTING_DEFAULTS = { dailyReviewCap: 30, dailyNewTarget: 10, transDefault: "hidden" }`；`SETTING_RANGES = { dailyReviewCap: [10, 100], dailyNewTarget: [0, 50] }`。
  - `emptyRecord()`；`recordAttempt(r, qid, choice: ChoiceLetter, correct, at, src?: "practice"|"mock"): LearningRecord`（src 默认 "practice"）；`markUnitRead(r, unitId, at)`；`setSetting<K extends keyof LearningSettings>(r, key: K, value, at)`（范围外的数值 clamp 到 `SETTING_RANGES`）；`settingValue(r, key)`（带默认值）。
  - `mergeRecords(a, b)`、`canonicalJson(r)`、`mergeIfChanged(prev, other)`、`deltaSince(current, synced)`（语义同 v1；delta 对 attempts 按题整组比较）。
  - `encodeRecord(r): WireRecordV2`、`parseRecord(x: unknown): LearningRecord | null`（只收 v2 wire；永不抛）。
  - `latestResult(r, qid): Attempt | undefined`（全序第一）；`topicStats(r, questions)`（签名不变，用 `latestResult`）。
- Produces (`recordV1.ts`): 原 v1 的全部导出（`LearningRecord` 等名字不变；新代码引用时 `import type { LearningRecord as LearningRecordV1 }`）、`LEARNING_V1_STORAGE_KEY = "itp:learn:v1"`（= 原 `LEARNING_STORAGE_KEY` 的值）、`parseRecordV1 = parseRecord` 的别名、`upgradeV1(r1, now): LearningRecord`、`downgradeToV1(r): LearningRecordV1`、`parseAnyRecord(x, now): { record: LearningRecord; version: 1|2 } | null`。

- [ ] **Step 1:** 写 `hash.test.ts`：`fnv1a32("")` = `0x811c9dc5`，`fnv1a32("a")` = `0xe40c292c`；`mulberry32(1)` 前 3 个值固定（写入实算值）且都在 [0,1)。
- [ ] **Step 2:** 写 `record.test.ts`（用固定种子的 `mulberry32` 生成 200 组随机记录，不加依赖）：
  - `merge is commutative / associative / idempotent`（`canonicalJson` 比较，含 attempts > K、同 `at` 不同 choice、settings 同 `at` 不同值、`v2Since` 缺失与存在）。
  - `top-K keeps the 10 highest in total order`、`dedupe key (at, choice, correct) keeps the earlier-ranked src`。
  - `recordAttempt stamps at >= previous max at + 1`、`same-day repeats are all stored`。
  - `settings LWW: larger at wins; equal at → larger JSON wins`、`setSetting clamps 5 → 10 and 200 → 100 for dailyReviewCap`。
  - `encode → parse round-trips`、`a record with 2900 × 10 attempts encodes under 1048576 bytes`、`parseRecord rejects v:1, choiceIdx 4, correct 2, unknown src, negative at`、`parseRecord drops unknown fields`、`"__proto__" qid stays data`。
  - `deltaSince: merge(synced, delta) equals merge(synced, current)`。
  - `topicStats uses the latest attempt per question`。
- [ ] **Step 3:** 写 `recordV1.test.ts`：`upgradeV1 maps each question to one attempt with src "v1"`、`upgradeV1 drops non-letter choices`、`upgradeV1 sets v2Since = now`、`downgradeToV1(upgradeV1(r1)) equals r1 (canonical)`、`downgradeToV1 picks the first attempt in total order`、`parseAnyRecord reports version`。
- [ ] **Step 4:** 跑 `npx vitest run src/lib/__tests__/hash.test.ts src/lib/learning` → FAIL（未实现）。
- [ ] **Step 5:** 实现 `hash.ts`、`record.ts`、`recordV1.ts`；termId 改用 `fnv1a32`。全序比较器写成一个 `compareAttempts(x, y): number`（§0-2），合并、`latestResult`、降级都只用它。
- [ ] **Step 6:** `npx vitest run src/lib` → PASS（含原 `termId.test.ts`）；`npx tsc --noEmit` 0 error；`npm test` 全 pass（现有页面仍走 v1，行为不变）。
- [ ] **Step 7:** Commit `feat(learning): D-190 record v2 model — attempt history K=10, LWW settings, compact wire, v1 upgrade/downgrade`

### Task 3: 服务器同时讲 v1 / v2

**Files:**
- Modify: `src/lib/learning/syncStore.ts`、`src/app/api/learning/route.ts`
- Modify: `src/app/api/learning/__tests__/route.test.ts`、`src/lib/learning/__tests__/fakeLearningRedis.ts`
- 客户端此时仍是 v1（Task 2 已把它的 import 指到 `recordV1.ts`），本 Task 不碰。

**Interfaces:**
- Consumes: Task 2 的 `parseAnyRecord`、`downgradeToV1`、`encodeRecord`、`mergeRecords`。
- Produces: `LEARNING_REDIS_KEY = "learn:owner:v2"`、`LEARNING_REDIS_V1_KEY = "learn:owner:v1"`；`readStored(redis, now): Promise<LearningRecord>`（v2 key → 无则 v1 key 升格 → 无则 empty；坏数据 → `CorruptStoredRecordError`）；`mergeAndStore(redis, incoming, now)`（只写 v2 key）；route `MAX_BODY_BYTES = 1048576`。

- [ ] **Step 1:** 改 route 测试，新增：
  - `GET without ?v returns a v1 record (downgraded)`、`GET ?v=2 returns v2 wire`。
  - `PUT v1 body → 200 v1 body; stored v2 doc gains a src "v1" attempt`、`PUT v2 body → 200 v2 wire`。
  - `v1 client round-trip`：v1 PUT 两次（不同题）→ GET 默认 → 两题都在、值与发送的一致。
  - `first read falls back to learn:owner:v1 and never writes it`（fake 记录写过的 key）。
  - `body of 1048576 bytes accepted, 1048577 → 400`；保留原有 403 / 503 / 500（v2 坏文档、v1 坏文档各一条）/ 502。
- [ ] **Step 2:** `npx vitest run src/app/api/learning` → FAIL。
- [ ] **Step 3:** 实现 syncStore / route；`now` 由 route 传 `Date.now()`；日志格式不变（不记录记录内容）。
- [ ] **Step 4:** `npx tsc --noEmit` 0 error，`npm test` 全 pass。
- [ ] **Step 5:** Commit `feat(learning): D-190 /api/learning speaks v1 and v2 (server first), Redis key learn:owner:v2`

### Checkpoint 1A — 服务器先上线

- [ ] Gates 全绿（Global Constraints）。
- [ ] 本地 e2e（Task 3 的 build）：`npm run build && npm start` 后 `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/quiz.spec.ts e2e/learning.spec.ts e2e/sensei.spec.ts`，再加 `E2E_OWNER_KEY=…` 跑 `e2e/learning-owner.spec.ts`——这就是「v1 客户端在 v2 服务器上照常工作」的真浏览器检查，全过才继续。
- [ ] Rule D：`oh-my-claudecode:code-reviewer`（opus）审 Task 2–3 的 diff，重点 §0-2/§0-3 的合并性质与兼容；有问题修到 PASS，记 session log。
- [ ] **停下来请用户同意 push**（说明：这次只上服务器，页面不变）。同意后 push，等 Vercel 部署完成。
- [ ] 本番确认：`curl -s -o /dev/null -w "%{http_code}" https://web-mu-sandy-78.vercel.app/api/learning` = `403`（匿名）；请用户在已登录 owner 的两台设备上各答 1 题，刷新后两边都看得到（旧页面 = v1 客户端）。结果写 session log。

---

## Part 1B — 客户端 v2、排期、新页面

### Task 4: 客户端升到 v2

**Files:**
- Modify: `src/lib/learning/localStore.ts`、`syncClient.ts`、`src/hooks/useLearningRecord.ts` 及其测试（`localStore.test.ts`、`syncClient.test.ts`、`useLearningRecord.ssr.test.ts`）
- Modify: `e2e/learning-owner.spec.ts`（改用 v2 wire 与 `itp:learn:v2`，Task 15 再补新用例）、`TextbookToc.ssr.test.ts`、`QuizBrowser.ssr.test.ts`（构造 v2 记录）
- Modify: `src/lib/sensei/weakness.ts`、`src/lib/sensei/anchors.ts:189-205`、`src/components/textbook/UnitReadMark.tsx`（`unitsRead` 不变）、`src/components/quiz/TopicProgress.tsx`（回到 v2 `topicStats`；Task 13 删除）及测试 `weakness.test.ts`、`anchors.test.ts`

**Interfaces:**
- Consumes: Task 2 全部；`LEARNING_V1_STORAGE_KEY`、`upgradeV1`、`parseRecordV1`。
- Produces:
  - `loadLocal(storage, now): LearningRecord`（读 `itp:learn:v2`，再把 `itp:learn:v1` 升格后合并进来；v1 key 不删不写）；`saveLocal(storage, r)` 只写 v2 key；`applyStorageEvent(prev, e, now)` 认两个 key；`LEARNING_CORRUPT_KEY = "itp:learn:v2:corrupt"`。
  - `syncClient`：GET 走 `/api/learning?v=2`；PUT 发 `encodeRecord(...)`。
  - `LearningActions = { answer(qid, choice: ChoiceLetter, correct, src?): void; readUnit(unitId): void; setSetting<K>(key: K, value): void }`。
  - `reviewAnchor` 改用 `latestResult`，签名不变。

- [ ] **Step 1:** 改 / 加测试：`loadLocal merges an old tab's itp:learn:v1 write`（Review Focus 1）、`a corrupt v2 value is copied to itp:learn:v2:corrupt once`、`storage event on itp:learn:v1 key is merged`、`pullRemote requests ?v=2 and parses v2`、`pushRemote body is v2 wire`、`hideFlushPlan delta of a 50-attempt change stays under KEEPALIVE_MAX_BYTES`、`setSetting action stores LWW value`（SSR 测试按现有方式），`reviewAnchor uses the latest attempt`。
- [ ] **Step 2:** 跑相关测试 → FAIL。
- [ ] **Step 3:** 实现；所有 import 从 `recordV1.ts` 改回 `record.ts`；`recordV1.ts` 里不再有调用方的 v1 函数删掉（只留 `LearningRecordV1` 类型、`LEARNING_V1_STORAGE_KEY`、`parseRecordV1`、`upgradeV1`、`downgradeToV1`、`parseAnyRecord`），对应旧测试一起删。`recordAttempt` 的 choice 参数类型收窄后，调用方（QuizSet）传 `c.letter as ChoiceLetter`（`CHOICE_LETTERS` 已保证）。
- [ ] **Step 4:** `npx tsc --noEmit` 0 error，`npm test` 全 pass；本地 `npm run dev` 打开现 quiz 答 1 题，DevTools 看 `itp:learn:v2` 有该 attempt、`itp:learn:v1` 未变。
- [ ] **Step 5:** Commit `feat(learning): D-190 client on record v2 (itp:learn:v2, v1 key merged read-only, sync ?v=2)`

### Task 5: 复习排期与每日量（纯函数）

**Files:**
- Create: `src/lib/learning/schedule.ts`、`src/lib/learning/__tests__/schedule.test.ts`

**Interfaces:**
- Consumes: `Attempt`、`LearningRecord`、`settingValue`、`fnv1a32`、`mulberry32`。
- Produces:
  - `BOX_INTERVALS = [1, 3, 7, 14, 30]`、`MASTERED_BOX = 5`、`LEECH_WRONG = 4`、`OFFICIAL_RATIO = { strategy: 35, management: 20, technology: 45 }`。
  - `toLocalDay(at: number): number`；`type ToDay = (at: number) => number`。
  - `interface ReviewState { box: 0|1|2|3|4|5; dueDay: number | null; lastDay: number; firstDay: number; isMistake: boolean; isLeech: boolean; wrongInWindow: number }`；`reviewState(attempts: Attempt[], v2Since: number | undefined, qid: string, toDay: ToDay): ReviewState | null`（无作答 → null）。
  - `type ReviewClass = "mistake" | "due" | "scheduled" | "mastered"`；`classify(s: ReviewState, today: number): ReviewClass`。
  - `interface QuestionPool { topicQuestionIds: Record<string, string[]>; groups: Record<string, string[]>; topicStars: Record<string, 1|2|3> }`。
  - `interface DailyPlan { mistakes: string[]; due: string[]; fresh: string[]; reviewedToday: number; newToday: number; reviewCap: number; newTarget: number }`；`dailyPlan(r: LearningRecord, pool: QuestionPool, today: number, toDay: ToDay, dateKey: string): DailyPlan`（`dateKey` = 本地 `YYYY-MM-DD`，作新题种子）。
  - `pickNew(r, pool, n: number, dateKey: string, opts?: { fillWeakTopics?: boolean /*默认 true*/ }): string[]`（§0-9，含整组展开）。
  - leech 计数 = 保存窗口（最近 10 条，含同日重做）里 `correct=false` 的条数，与错题本显示的「近 10 次错 N 次」同一个数。
  - `expandGroups(ids: string[], groups): string[]`（组内一题 → 整组按题号，保持首次出现位置，去重）。

- [ ] **Step 1:** 写测试（`toDay` 用 `(at) => Math.floor(at / 86400000)`，时刻用 `Date.UTC` 构造），每条对应 DESIGN §5.4 / §5.5 / §0：
  - `wrong → box 0, due tomorrow, class mistake`；`first-ever correct → box 2, due +7`；`wrong, correct(d+1) → still mistake (1 counted correct day)`；`wrong, correct(d+1), correct(d+4) → leaves mistakes, box 2`；`box 4 correct → mastered, dueDay null`。
  - `same-day repeats: only the first attempt of a day counts`；`day boundary: 23:59 and 00:01 are two counted days`（Review Focus 2）。
  - `leech: 4 wrong within the last 10 attempts`；`3 wrong → not leech`。
  - `v1 correct → box 2, due = day(v2Since) + fnv1a32(qid) % 14`；`v1 correct then wrong today → mistake`。
  - `classes are exclusive and cover every answered question`（随机 200 题）。
  - `dailyPlan caps mistakes + due at 30, mistakes first, earliest due first, ties by qid`；`reviewedToday reduces the remaining cap`；`newToday reduces fresh`。
  - `migration backlog`：800 v1 错 + 1500 v1 对、`v2Since` = 今天 → `mistakes.length + due.length <= 30`、未来 14 天每天到期的 v1 对题数都 ≤ 1500/14 × 1.5（Review Focus 3）。
  - `pickNew: same dateKey → same list; different dateKey → different list`；`fills topics with < 5 answered first, ★ high first`；`group member pulled → whole group, may exceed n`（§0-8）；`category share over 10 000 picks within ±3 points of 35/20/45`（`fillWeakTopics: false`）；`empty record + fillWeakTopics:false → not all ★★★, category share follows ratio`（新用户摸底）；`v1 attempt that is not the earliest, or at >= v2Since → normal attempt`；`leech counts same-day repeats`。
- [ ] **Step 2:** `npx vitest run src/lib/learning/__tests__/schedule.test.ts` → FAIL。
- [ ] **Step 3:** 实现。处理顺序：按 `compareAttempts` 反序（时间正序）遍历，按 `toDay(at)` 分天，每天只取第一条。
- [ ] **Step 4:** → PASS。
- [ ] **Step 5:** Commit `feat(learning): D-190 review boxes 1/3/7/14/30, exclusive classes, daily cap 30 + new 10, migration spread`

### Task 6: 练习用的题库索引（服务器侧）

**Files:**
- Create: `scripts/textbook-unit-minutes-build.mjs`、`data/ip/textbook/unit_minutes.json`
- Create: `src/lib/practice/practiceIndex.ts`、`src/lib/practice/practiceReader.ts`、`src/lib/practice/__tests__/practiceIndex.test.ts`、`practiceReader.test.ts`

**Interfaces:**
- Consumes: `loadQuizIndex`、`loadAllQuestions`、`loadBaseQuestions`（quizReader）；`loadReaderIndex`（textbook reader）；`loadDictionary`、`buildTermCards`（glossary）；`expandGroups`（Task 5）。
- Produces (`practiceIndex.ts`，纯):
  - `topicStars(index: QuizIndex): Record<string, 1|2|3>`（§0-11）。
  - `interface ChumonGroup { key: string; memberIds: string[]; preambleChars: Record<"jp"|"zh"|"en", number | null> }`；`lcpPreamble(stems: string[]): number | null`（取最长公共前缀，**向前退到前缀内最后一个段落边界 `\n\n`** 作为折叠点；前缀内没有段落边界 → null = 不折叠）。
  - `interface PracticeScope { kind: "ids"; ids: string[] } | { kind: "filter"; topics: string[]; exam: string | null; n: number | "all"; order: "seq"|"rand"; seed: number }`；`resolveScope(scope, questions: QuizQuestion[], groups): string[]`（filter：按题号顺序或 `mulberry32(seed)` 洗牌后取 n，再 `expandGroups`）。
  - `buildTodayIndex(...)` → `TodayIndex`（§0-20）。
- `poolFromIndex(index: TodayIndex): QuestionPool`（Task 5 的排期输入）。
- Produces (`practiceReader.ts`，读盘 + 模块缓存): `loadChumonGroups(): Promise<ChumonGroup[]>`、`loadUnitMinutes(): Promise<Record<string, number>>`、`loadTodayIndex(locale): Promise<TodayIndex>`、`loadQuestionsByIds(ids): Promise<QuizQuestion[]>`（保持输入顺序，丢弃未知 id）。

- [ ] **Step 1:** 写脚本测试思路照 `quizCorpusInvariants.test.ts`：`practiceReader.test.ts` 里 `unit_minutes.json は生成器の出力と一致する (--check)`、`every unit in unit_index has minutes > 0`。
- [ ] **Step 2:** 写 `practiceIndex.test.ts`（真语料）：`topicStars: 63 topics → 21 / 21 / 21`；`50 groups, 200 member ids, members of a group share exam_id`；`lcpPreamble: 139 of 150 group×lang fold exactly at the LCP, 11 fall back to an earlier paragraph boundary, 0 unfoldable`（审查实测值，以实算为准写进断言）；`a synthetic group with no \n\n inside the LCP → null`；`resolveScope seq/rand deterministic by seed`；`resolveScope expands a chumon member to its whole group`；`TodayIndex JSON <= 160 KB`；`topicTerms has <= 3 cards per topic, all with dictionary entries`。
- [ ] **Step 3:** → FAIL；实现脚本（照 `scripts/quiz-chumon-groups-build.mjs` 的 `--check` 风格）并生成 json；实现两个模块。
- [ ] **Step 4:** `npx vitest run src/lib/practice` → PASS。
- [ ] **Step 5:** Commit `feat(practice): D-190 practice index — 頻出度 tertiles, chumon preamble fold, scope resolution, today payload, unit_minutes.json`

### Task 7: 视觉基础 —— token、字体、AppShell、删除三套 shell

**Files:**
- Modify: `src/app/globals.css`（§0-19）、`src/app/[locale]/layout.tsx`
- Create: `src/components/app/AppShell.tsx`（server）、`src/components/app/AppNav.tsx`（client，`usePathname`）、`src/components/app/app.module.css`、`src/components/app/__tests__/AppShell.ssr.test.ts`
- Modify: `src/components/ui/{button,card,dialog,dropdown-menu,input,scroll-area,tabs}.tsx`（只改类名）、`src/components/LocaleSwitcher.tsx`（改成 `日 / 中 / EN` 文字链接，当前项加粗）
- Modify: `messages/{ja,zh,en}.json`（加 `App`，删 `Shell`、`Nav`）
- Delete: `src/components/shells/`（含 `__tests__/navItems.test.ts`）、`src/hooks/useTheme.ts`、`src/hooks/__tests__/useTheme.test.ts`

**Interfaces:**
- Produces: `AppShell({ locale, children })`；导航项常量 `APP_NAV = [{ href: "/", key: "today" }, { href: "/practice", key: "practice" }, { href: "/textbook", key: "textbook" }, { href: "/glossary", key: "glossary" }] as const`；`isNavActive(pathname: string, href: string): boolean`（`/` 只匹配首页；`/practice` 匹配 `/practice/**`）。字体 CSS 变量 `--font-biz`、`--font-sc`。

- [ ] **Step 1:** 写 SSR 测试：`renders 4 nav links in order 今日/练习/教科书/辞典 (ja)`；`active item has aria-current="page"`；`isNavActive("/ja/practice/mistakes", "/practice") is true, isNavActive("/ja/practice", "/") is false`；`no 记录 link in Phase 1`；`settings link present`；`site name is ITパスポート 過去問ノート and no IPA logo / iパス`。
- [ ] **Step 2:** → FAIL；实现。字体：`BIZ_UDPGothic({ weight: ["400","700"], variable: "--font-biz", display: "swap", preload: false })`、`Noto_Sans_SC({ weight: ["400","700"], variable: "--font-sc", display: "swap", preload: false })`；`--font-sans: var(--font-biz), var(--font-sc), system-ui, sans-serif`。顶部 4px ink 顶线、内容区最大宽 1240px、左右 32px（DESIGN §3.4）。
- [ ] **Step 3:** 删 shells / useTheme；`grep -rnE "shells/|useTheme|ThemeSwitcher|NAV_ITEMS|geist|JetBrains" src` 无输出。
- [ ] **Step 4:** `npx tsc --noEmit`、`npm test` 全绿；`npm run dev` 看 `/ja/textbook`、`/ja/glossary`、`/ja/sensei` 都在新框架里打开（现有页面内容不动）。
- [ ] **Step 5:** Commit `feat(ui): D-189 A4 tokens + BIZ UDPGothic + single AppShell; remove the 3 theme shells`

### Task 8: 问题面与解说组件 + 显示保真比较

**Files:**
- Create: `src/components/practice/choiceLayout.ts`、`PracticeQuestion.tsx`、`ExplanationPane.tsx`、`practice.module.css`
- Create: `src/components/practice/__tests__/choiceLayout.test.ts`、`PracticeQuestion.ssr.test.ts`、`ExplanationPane.ssr.test.ts`、`fidelity.test.ts`
- Modify: `messages/*.json`（`Practice` namespace：问题面 / 解说文案 + §0-24 suspect 文案）

**Interfaces:**
- Consumes: `StemBlocks`、`ChoiceBody`、`isTableChoice`（QuizRichText，保留）；`localized*`（quizModel）；`TermChip`；`AskSensei`；`QuizFeedback`；`ChumonGroup`（Task 6）；`ReviewState`（Task 5，复习三格用最近 3 次）。
- Produces:
  - `choiceLayout(q: QuizQuestion): "row4" | "grid2" | "list"`（§0-15）；`explanationTitle(points: string[]): string | null`（§0-16）。
  - `PracticeQuestion({ q, locale, number, picked: ChoiceLetter | null, onPick, recent: boolean[] /*最近 3 次，新→旧*/, stars, showTranslation, onToggleTranslation, preambleChars: number | null, foldPreamble: boolean })`。
  - `ExplanationPane({ q, locale, picked, termCards, isOwner })`（内部 state `explLocale`，初值 = `locale`，块内 `日 / 中 / EN` 切换；重要语按 §0-25；未答时只显示「作答后显示解说」一行）。
  - 所有可比较字段带 `data-fid`：`source`、`stem`、`stem-preamble`（折叠部分）、`stem-tr`、`choice-0..3`、`choice-tr-0..3`、`figure`、`choice-figure-0..3`、`expl-correct`（○ 那一行的理由文字）、`expl-0..3`（× 行，按字母下标；正解下标不出现）、`point-0..2`、`suspect`。

- [ ] **Step 1:** 写 `choiceLayout.test.ts`：真语料里 `row4` / `grid2` / `list` 的题数（实算写入断言，`grid2` = `choice_figures` 的题数）；`a choice with 13 code points → list`；`a table choice → list`；`explanationTitle` 三条（短 / 长 / 无「。」）。
- [ ] **Step 2:** 写 SSR 测试：`問 N uses the source question number`；`row4 renders 4 columns class`；`picked wrong: ink block + × and the correct choice spot ○`（不出现红 / 绿色值）；`explanation lists ×/○ for all 4 letters in ア〜エ order`；`your choice row is open, other wrong rows are closed (<details> without open)`；`points render 1–3 items`；`suspect question shows the suspect line in ja/zh/en`、`non-suspect shows none`；`translation toggle absent in ja, present in zh/en, default hidden`；`unanswered: explanation pane shows only the placeholder`。
- [ ] **Step 3:** 写 `fidelity.test.ts`：对 2900 题 × 3 locale 渲染新组件（已答状态，`picked` = 正解，zh/en 打开译文 `showTranslation=true`，`ExplanationPane` 的 `explLocale` = 该 locale），按 `data-fid` 用 Task 1 同一个 `fieldText` / 图片规则取哈希 → 与 `baseline.jsonl` 逐字段比较，**差异数 = 0**；`choice-0..3` 在 DOM 中按 0→3 顺序出现（不打乱 ア〜エ）；`practice.module.css` 里承载题干 / 表格的类保留 `white-space: pre-wrap` / `pre`（读 CSS 文件断言，对应现 `quiz.module.css:179,438`）；中問成员 `stem-preamble` + `stem` 的文本拼接 = 基线 `stem`（Review Focus 4）；失败时输出前 20 个差异的 `qid / locale / field`。另断言 `suspect` 题数 = `84`、3 条 points 的题数 = `22`。
- [ ] **Step 4:** → FAIL；实现组件（样式照 mockup `A4-Practice`：问题面 tint 平网、「問 N」spot 方块、悬挂缩进、出典行、解答栏、要点框「ここがポイント」、点线标题下划线；图点击放大用 `<dialog>`，Esc 关闭）。
- [ ] **Step 5:** `npx vitest run src/components/practice` → PASS。差异 ≠ 0 时修组件，不改基线；确属基线错误需改基线 → 停下来写 `failures/phase5/stage_07_ui/task08_attempt_N.md` 并问用户。
- [ ] **Step 6:** Commit `feat(practice): D-189 question face + explanation pane (A4), fidelity 0 diff vs frozen baseline`

### Task 9: 练习组（一题一屏 + 组末总结）

**Files:**
- Create: `src/lib/practice/practiceSession.ts`、`src/lib/practice/__tests__/practiceSession.test.ts`
- Create: `src/components/practice/PracticeSession.tsx`、`AnswerCard.tsx`、`SessionSummary.tsx`、`src/components/practice/__tests__/PracticeSession.ssr.test.ts`
- Create: `src/app/[locale]/practice/page.tsx`（本 Task 只做"有范围参数 → 练习组"；无参数先渲染占位，Task 10 换成设置面板）
- Modify: `src/components/sensei/AskSensei.tsx`（`SenseiHost` 加 `onQuestionLink`）、`SenseiPanel.tsx:126-140`（§0-18）

**Interfaces:**
- Consumes: Task 4 `useLearningActions().answer`；Task 6 `resolveScope`、`loadQuestionsByIds`、`loadChumonGroups`；Task 8 组件；Task 5 `reviewState`（复习三格）。
- Produces:
  - `parseScope(sp: Record<string, string | string[] | undefined>, validIds: Set<string>, validTopics: Set<string>, validExams: Set<string>): PracticeScope | null`（§0-12）。
  - `interface SessionState { ids: string[]; pos: number; answers: Record<string, ChoiceLetter>; startedAt: number; finished: boolean }`；`type SessionAction = { type: "pick"; choice: ChoiceLetter } | { type: "next" } | { type: "prev" } | { type: "finish" }`；`practiceReducer(s, a): SessionState`（已答的题再 pick → 原样返回）。
  - `keyToAction(key: string, ctx: { answered: boolean; editableTarget: boolean; dialogOpen: boolean }): SessionAction | null`（§0-14）。
  - `sessionKey(ids): string`、`loadSession(storage | null, ids, now): SessionState`、`saveSession(storage | null, s): void`（永不抛）。
  - `SessionSummary({ ids, answers, questions, elapsedMs, from })`：正答数 / 题数、用时、错题列表（链 `/practice/q/<id>`）、按钮「只做错题再来一遍」（`/practice?ids=<错题>`）、「继续下一项」（仅 `from=today`，客户端 `dailyPlan` 算下一项）、「回今日」。

- [ ] **Step 1:** 写 `practiceSession.test.ts`：`parseScope: ids keeps order, drops unknown, caps at 100`；`all-invalid → null`；`topic + n=20 + order=rand + seed`；`garbage n → 20`；`pick records once (second pick ignored)`；`next at last → finished`；`prev at 0 stays 0`；`keyToAction: "1"→pick ア … "4"→pick エ only when unanswered; Enter→next only when answered; ArrowLeft→prev`；`loadSession restores pos/answers from storage`；`loadSession with throwing storage → fresh state`；`duplicate pick after restore is rejected, so answer() is called once per question per group`（组件只在 reducer 接受 pick 时调用 `answer`）；`keyToAction ignores keys from input / textarea / contenteditable and while a dialog is open`（Review Focus 5）。
- [ ] **Step 2:** 写 SSR 测试：`/practice?ids=a,b,c renders question 1 of 3 and the 3-cell answer card`；`a 结束 button is present (finish → summary of answered part)`；`after a wrong pick: 解答栏「解答 問N [正解]」+ 状态句「已记入错题本，明天再出」`；`translation default follows settings.transDefault`；`top bar shows 分野 tag + topic path + 1/3 + timer`；`finished → summary with score and wrong list`。
- [ ] **Step 3:** → FAIL；实现。页面 server 端：`parseScope` → ids → `loadQuestionsByIds` + `buildTermCards`（辞典失败时退化为纯文字，同现 quiz 页）+ owner flag + `LearningRecordProvider` + `SenseiHost onQuestionLink`（组内 → 跳到该题并返回 true）；`from=today` 时另传 `loadTodayIndex(locale)`（总结页「继续下一项」要用）。
- [ ] **Step 4:** `npx vitest run src/lib/practice src/components/practice` → PASS；`npm run dev` 手动走一组 5 题（含 1 道中問、1 道图题、1 道 `choice_figures` 题），刷新后位置不丢。
- [ ] **Step 5:** Commit `feat(practice): D-187 one question per screen, keyboard 1–4/←/→/Enter, session restore, summary`

### Task 10: 设置面板、浏览、领域页、单题页

**Files:**
- Create: `src/components/practice/PracticeSetup.tsx`、`src/app/[locale]/practice/browse/page.tsx`、`browse/[topicId]/page.tsx`、`q/[qid]/page.tsx`、`src/components/practice/{BrowseList,TopicPage,SingleQuestion}.tsx` 及 SSR 测试
- Modify: `src/app/[locale]/practice/page.tsx`（无参数或 `prefill=1` → `PracticeSetup`，后者预填 `topic` / `exam`）

**Interfaces:**
- Consumes: `TodayIndex`（领域树、★）；`dailyPlan`（错题本 / 到期复习范围的 ids）；`pickNew`（随机范围）；`ReviewLauncher`（领域页，原样）；`reviewState`。
- Produces:
  - `PracticeSetup`：范围（领域 [三分野 → 领域，多选] / 年度 / 错题本 / 到期复习 / 随机）、题数 10 / 20 / 50 / 全部、顺序 按题号 / 随机；上次设置存 `localStorage["itp:practice:last:v1"]`，「按上次的条件继续」；提交 → 拼 §0-12 URL。
  - 领域页 `/practice/browse/<topicId>`：领域名、★、正答率、题数、「练 10 题」「全部按题号」、`ReviewLauncher`（处理 `?review=1` / `&thread=`）、本领域题目一行一题（題号、○×、下次出现日 → 链单题页）。
  - 单题页 `/practice/q/<qid>`：`PracticeQuestion`（已答：显示最近一次选择）+ `ExplanationPane` + 作答历史（最近 10 次 ○× 与日期）+「练这一题」（`/practice?ids=<qid>`，中問自动整组）；未知 qid → 404。

- [ ] **Step 1:** 写 SSR 测试：`setup lists 3 categories → topics with ★`；`setup submit builds /practice?topic=…&n=20&order=seq`；`?topic=X&prefill=1 shows setup with X preselected, not a session`；`browse lists topics and exams`；`topic page renders ReviewLauncher and question rows`；`q page 404 for unknown id`；`q page renders history newest first`。
- [ ] **Step 2:** → FAIL；实现。
- [ ] **Step 3:** → PASS；Commit `feat(practice): setup panel, browse, topic page with AI review, single-question view`

### Task 11: 今日页

**Files:**
- Modify: `src/app/[locale]/page.tsx`（不再跳 quiz；`force-dynamic`，挂 provider）
- Create: `src/components/today/{TodayPage,TaskList,WeakTopics,ExamCountdown,AreaRates,TodayTerms}.tsx`、`today.module.css`、`src/lib/practice/todayModel.ts`、测试 `todayModel.test.ts`、`TodayPage.ssr.test.ts`
- Modify: `messages/*.json`（`Today`）

**Interfaces:**
- Consumes: `loadTodayIndex`、`dailyPlan`、`toLocalDay`、`settingValue`、`writeReviewIntent`。
- Produces (`todayModel.ts`，纯):
  - `interface TodayTask { kind: "mistakes"|"due"|"new"|"unit"; count: number; done: boolean; href: string; minutes: number; detail: string[] }`；`todayTasks(plan: DailyPlan, r, index: TodayIndex, weakest: string | null): TodayTask[]`（空行省略；href = `/practice?ids=…&from=today`，单元 = `/textbook/<unitId>`；每题 1 分钟，单元用 `unit_minutes`）。
  - `weakTopicRows(r, index): { topicId; name_jp; category; stars; rate; answered }[]`（§0-10）。
  - `areaRates(r, index): Record<"strategy"|"management"|"technology", number | null>`。
  - `daysUntil(examDate: string | undefined, today: number): number | null`。
  - `isNewUser(r): boolean`（无任何 attempt）→ 主按钮「先做 20 题摸底」= `pickNew(r, pool, 20, dateKey)`。

- [ ] **Step 1:** 写 `todayModel.test.ts`：`order mistakes → due → new → unit, empty rows omitted`；`30 due → the row href carries the first 20 ids; a chumon group is not split (§0-26)`；`done when remaining 0 and something done today`；`unit = first unread unit of the weakest topic, omitted when all read`；`weak rows: answered < 5 excluded, all-correct excluded, max 5, score order`；`areaRates null when a category has no answers`；`daysUntil null without examDate`。
- [ ] **Step 2:** 写 SSR 测试（照 mockup `A4-Home`）：`date tag + 今天的学习 heading`；`主按钮「从第 1 项开始」 links to the first task`；`new user sees 先做 20 题摸底 and empty-state lines`；`weak table has 练 10 题 and AI 分析 links per row`（AI 分析 → `/practice/browse/<topicId>?review=1`）；`no exam date → 设定考试日 link, no countdown`；`pass line text 600/1000 and 300 each`；`模拟考试 link hidden in Phase 1`。
- [ ] **Step 3:** → FAIL；实现。记录加载前（`loaded=false`）各区块保留高度、不显示数字。
- [ ] **Step 4:** → PASS；Commit `feat(today): D-189 today page — tasks, weak topics with AI review, countdown, area rates, 3 terms`

### Task 12: 错题本与设置页

**Files:**
- Create: `src/app/[locale]/practice/mistakes/page.tsx`、`src/components/practice/MistakesList.tsx`、`src/app/[locale]/settings/page.tsx`、`src/components/settings/SettingsForm.tsx` 及 SSR 测试
- Modify: `messages/*.json`（`Mistakes`、`Settings`）

**Interfaces:**
- Consumes: `reviewState`、`classify`、`setSetting`、`settingValue`、`SETTING_RANGES`。
- Produces: 错题本 = 按领域分组，每题一行（題号、领域、「近 10 次错 N 次」、下次出现日、leech →「顽固」+「读单元」「问 AI」链接），顶部「做全部错题 (N)」（> 100 题时按到期顺序取前 100）；每行标签按 §0-20 由 qid + `TodayIndex.exams/topics` 拼出（页面 server 端传 `loadTodayIndex(locale)`）。设置 = 考试日（`<input type="date">`）、每日复习上限（10–100）、每日新题目标（0–50）、题面翻译默认（隐藏 / 显示）、界面语言链接、「AI 老师：对话记录与自由提问」→ `/sensei`（DESIGN §3.4；删掉三套 shell 后这是 `/sensei` 的固定入口，AppShell 右侧「设置」旁不另放）。

- [ ] **Step 1:** 写 SSR 测试：`mistakes grouped by topic, leech tagged 顽固 with unit + AI links`；`做全部错题 caps the URL at 100 ids`；`empty → one-line empty state`；`settings shows defaults 30 / 10 / hidden`；`settings save calls setSetting with clamped values`；`settings has a link to /sensei`；`mistake row label = exam label_jp + 問N + topic name`。
- [ ] **Step 2:** → FAIL；实现；→ PASS。
- [ ] **Step 3:** Commit `feat(practice): mistakes book + settings page (exam date, daily caps, translation default)`

### Task 13: 旧链接跳转、新链接、删除旧 quiz 视图

**Files:**
- Create: `src/lib/practice/legacyLinks.ts`、`src/lib/practice/__tests__/legacyLinks.test.ts`
- Modify: `src/app/[locale]/quiz/page.tsx`（改为客户端跳转页：一个 client 组件读 `location.hash` 与 query 后 `router.replace`）
- Modify: `src/lib/sensei/threadLinks.ts` + `threadLinks.test.ts`（`questionThreadHref` → `/practice/q/<qid>`；`reviewThreadHref` → `/practice/browse/<topicId>?thread=<date>`）
- Modify: `src/components/glossary/TermDetail.tsx:98` + `TermDetail.ssr.test.ts`（→ `/practice/q/<qid>`）
- Modify: `src/components/textbook/UnitReader.tsx:170`（`quizDeferred` 改为「本单元的过去问」链接到 `/practice/browse/<topicId>`）
- Delete: `src/components/quiz/QuizSet.tsx`、`QuizBrowser.tsx`、`TopicProgress.tsx`、`quiz.module.css`（`QuizRichText` 用到的类迁到 `practice.module.css`）及其测试；`src/components/sensei/ReviewCard.tsx`；`messages` 的 `Quiz` namespace（`QuizFeedback` 改用 `Practice`）
- Modify: `src/components/practice/__tests__/fidelityBaseline.capture.test.ts`（capture 分支只引用 `QuizRichText`，删除 QuizSet 后仍能跑校验分支）

**Interfaces:**
- Produces: `legacyQuizTarget(search: string, hash: string): string`（locale-less）：
  - `#<qid>`（合法 qid）→ `/practice/q/<qid>`；
  - `?mode=topic&id=X&review=1` → `/practice/browse/X?review=1`；`&thread=D` → `/practice/browse/X?thread=D`；
  - `?mode=topic&id=X` → `/practice?topic=X&prefill=1`；`?mode=exam&id=Y` → `/practice?exam=Y&prefill=1`（DESIGN §4：进入设置面板并预填范围，不直接开始；`parseScope` 见到 `prefill=1` 返回 null，页面以该范围预填 `PracticeSetup`）；
  - 其他 → `/practice/browse`。

- [ ] **Step 1:** 写 `legacyLinks.test.ts`（上面 5 条 + 非法 qid 片段 → 按 query 规则 + 未知 mode → browse）；改 `threadLinks.test.ts`、`TermDetail.ssr.test.ts` 的期望。
- [ ] **Step 2:** → FAIL；实现；删除文件。
- [ ] **Step 3:** `grep -rnE "\"/quiz|'/quiz|\`/quiz" src --include="*.ts" --include="*.tsx" | grep -v "legacyLinks\|app/\[locale\]/quiz"` 无输出；`npx tsc --noEmit`、`npm test` 全绿。
- [ ] **Step 4:** Commit `feat(practice): legacy /quiz links redirect, in-app links point to practice; remove QuizSet / QuizBrowser / ReviewCard`

---

## Part 1C — 换皮、e2e、收尾

### Task 14: 教科书 / 辞典 / AI 老师换皮

**Files:**
- Modify: `src/components/textbook/reader.module.css`、`TextbookToc.tsx`（只改类名时）、`src/components/glossary/glossary.module.css`、`src/components/sensei/{SenseiHome,SenseiPanel,KeySettings,SenseiMarkdown}.tsx`（Tailwind 类名 → token）、`src/components/glossary/TermChip.tsx`（样式）
- Modify: `messages/*.json`（三语 `Textbook` / `Glossary` / `Sensei` 里的过时文案，见 §0-23）

- [ ] **Step 1:** 机械检查（写成一条 vitest：`src/__tests__/tokensOnly.test.ts`）：`src/**/*.module.css` 与 `src/components/**/*.tsx` 里除 `globals.css` 外不出现 `#[0-9a-fA-F]{3,6}` 颜色字面量、`shadow-`、`rounded-(md|lg|xl|full)`、`bg-(blue|gray|slate|zinc|neutral)-`、`dark:` → 先 FAIL。
- [ ] **Step 2:** 改样式直到 PASS；行为与 DOM 结构不变（现有 SSR 测试不改且全过）。
- [ ] **Step 3:** `npm run dev` 截 `/ja/textbook`、`/ja/textbook/<unit>`、`/ja/glossary`、`/ja/glossary/<term>`、`/ja/sensei` 五张图到 `.playwright-mcp/ui/phase1/`（gitignored），自己对照 DESIGN §3 看一遍反目标。
- [ ] **Step 4:** Commit `style(ui): D-189 re-skin textbook / glossary / AI sensei with A4 tokens`

### Task 15: e2e 重写与新增（本地）

**Files:**
- Rewrite: `e2e/quiz.spec.ts` → `e2e/practice.spec.ts`；`e2e/learning.spec.ts`；`e2e/learning-owner.spec.ts`（`:42,159,176` 改 v2）；`e2e/sensei.spec.ts`（`:494,562` 删 shell 导航项断言；`:597,686-691` 改 v2 记录；`:715-907` 5 条复习流程改为 今日「AI 分析」→ 领域页 与 旧链接）；`e2e/glossary.spec.ts`（题目链接期望 → `/practice/q/`）；`e2e/csp.spec.ts`（路径表加新页面）
- Create: `e2e/today.spec.ts`、`e2e/legacy-links.spec.ts`、`e2e/settings.spec.ts`

- [ ] **Step 1:** 新 / 改 spec 覆盖：今日（新用户摸底按钮、有记录时任务行与主按钮）；练习（点选 / 键盘 1–4 作答、Enter 下一题、刷新恢复、组末总结、只做错题再来一遍）；错题本（答错一题后出现，明天才进今日队列——用 `page.clock` 前进 1 天）；设置（改上限后今日行数变化）；旧链接 5 条（§Task 13）；v1→v2：预置 `itp:learn:v1` 后打开今日，`itp:learn:v2` 出现且 v1 不变；owner：v1 客户端（直接 PUT v1 body）对 v2 服务器可同步；CSP 无违规；AI 老师 BYOK / 面板 / 对话保存契约（沿用 `e2e/helpers/fakeAnthropic.ts`）。
- [ ] **Step 2:** 本地：`npm run build && npm start`，另一终端 `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test` 全过；再 `E2E_OWNER_KEY=… PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/learning-owner.spec.ts` 全过。记下通过数。
- [ ] **Step 3:** Commit `test(e2e): Stage 7 Phase 1 — today / practice / mistakes / settings / legacy links, v2 record`

### Task 16: Phase 1 收尾（Rule A 抽检、Rule D、上线、试用）

- [ ] **Step 1 (Rule A 截图抽检)**：派独立 agent（`general-purpose`，opus，不是写代码的那个）对本地 build 截 N=30 题（图题、表题、中問 [含前文折叠]、`choice_figures`、`suspect`、`points` 3 条 各 ≥ 3 题，id 由主 context 从语料按类别用固定种子抽出并写进 prompt），每题 ja + zh 两张：对照数据核对题干 / 选项 / 图 / 解说是否齐全、ア〜エ 顺序、折叠前文可展开且文字完整、suspect 提示出现。结果写 `evidence/phase5/stage_07_ui/audit_phase1.md`（只写 id 与判定，不贴原文）。不通过 → `failures/` 归档 + 修 + 重抽。
- [ ] **Step 2 (Rule D)**：`oh-my-claudecode:code-reviewer`（opus）审 Part 1B + 1C 全部 diff（重点：Review Focus 5 条、反目标、旧链接、记录兼容），修到 PASS，记 session log。
- [ ] **Step 3:** Gates 全绿 + Task 15 本地 e2e 全过。
- [ ] **Step 4:** **停下来请用户同意 push。** 同意后 push，等部署。
- [ ] **Step 5:** 本番 e2e：`npx playwright test`（不带 base URL = 本番）全过（`learning-owner` 本地专用，不跑）；`curl` 匿名 `/api/learning` = `403`；冷启动 TTFB 记下 `/ja`、`/ja/practice?topic=strategy-01-01`。
- [ ] **Step 6:** 请用户在电脑上试用「今日 → 练习」（D-189 Phase 1 试用点），收集意见。
- [ ] **Step 7:** session log 写结果、`docs/STATE.md` 同步（当前阶段 = Phase 1 完成、待 Phase 2 计划）；Phase 1 小结写进 `RETROSPECTIVE_stage7_ui.md` 草稿（全部 Phase 完成后定稿，Rule C）。
