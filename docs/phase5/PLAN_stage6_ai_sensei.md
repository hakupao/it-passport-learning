# Stage 6「AI 先生」(BYOK ブラウザ直結) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 chat + tutor 合并成一个「AI 先生」：用户在自己的浏览器里填 Anthropic key，浏览器直接调 `claude-sonnet-5-5`，答疑以监查过的题目解说和教科书术语为根据；能在题目、术语、unit、自由提问四个入口发起，也能根据学习记录主动带用户复习薄弱 topic。

**Architecture:** 全部 LLM 调用发生在浏览器：自定义的 `ChatTransport` 在 `sendMessages` 里调 AI SDK `streamText`，返回 `result.toUIMessageStream()`，所以 UI 继续用 `useChat` / `UIMessage`，保留下来的 `escalation.ts` 和 `historyStore.ts` 不用改。服务器不碰 key，只负责把已经在页面上的审定内容整理成「锚点上下文」文本交给客户端组件。key 和对话只存在本浏览器的 localStorage。生产环境加一条静态 CSP，`connect-src` 只放行自身和 `api.anthropic.com`。

**Tech Stack:** Next.js 15 App Router、next-intl、TypeScript、`ai@6.0.185`、`@ai-sdk/anthropic@3.0.78`、`@ai-sdk/react@3`、`react-markdown`（Phase A 重新加回）、vitest、Playwright（Anthropic 请求一律用 `page.route` 拦截成假流，测试绝不调用真 API）。

**Spec:** `docs/decisions/D-179-learning-features-redesign.md` 决定 3・4・7 + Task 13 spike 证据 `evidence/phase5/stage_06_ai_sensei/spike_S131.md` + 用户 S131 回答（入口 4 个都要、顺序由 Claude 定；可以主动出击；模型用 Sonnet；对话要保存）。本计划的 §0 在批准时锁为 **D-181**。

## Global Constraints

- TypeScript only (D-110)。新增运行时依赖只有 `react-markdown`（§0-7）。
- 服务器不持有、不接收、不转发 LLM key（D-179 §4）。不新增任何调用 LLM 的服务器路由。
- key 只存 `localStorage["itp:sensei:key:v1"]`；不进 `/api/learning`、不进对话存储、不进 console、不进错误上报、不进 e2e 产物。报错时只取 `error.message` 的文字，绝不把 error 对象本身 log 或存下来（APICallError 带有请求数据）。
- 页面必须明示 key 的保存位置（「このブラウザだけ」）和删除按钮（D-179 §4）。
- AI 不自己出题。复习时用的题一律从题库里取真实过去问（用户不信任未审定的即时生成，见 memory「Pre-stored translations over real-time API」）。
- 学习记录里的 `correct` 是作答当时的判定；喂给模型之前，凡是手上有当前 `correct_answer` 的，都用 `choice === correct_answer` 重新判定（Phase 3 申し送り (a)）。
- 不新增读 fs 的路由，Phase C 的 `/api/sensei/terms` 是唯一例外（§0-9）；任何时候 nft IPA leak gate 必须为 0。
- 辞典列表 `/[locale]/glossary` 必须保持静态（prerender-manifest 里有 `/ja|zh|en/glossary`）。
- 每个 Task 结束 commit；每个 Phase = 一个 unit（D-176：开始前、完成后向用户报告），Phase 末尾 gates 全绿 → Rule D（与 writer 不同 subagent_type）PASS → push。
- Gates（`apps/web` 下）：`npx tsc --noEmit` 0 / `npm run lint` 0 error / `npm test` 全 pass / `npm run build` exit 0 / `find .next -name '*.nft.json' -exec grep -lE 'data/ip/(exams|sources|syllabus)/' {} + | wc -l` = `0` / 本地 prod build 的 e2e 全 pass（`--retries=0`）/ 生产 e2e 全 pass。
- 提交信息结尾带会话要求的 attribution 行。

## Review Focus

1. **CSP 把页面弄坏**：生产环境开 CSP 后，任何页面（首页、教科书、quiz、辞典、AI 先生）都不能出现 CSP violation，Vercel Analytics / Speed Insights 继续工作 → Task A2 的 e2e 逐页监听 `securitypolicyviolation` + 生产 e2e。
2. **key 泄漏到别处**：错误、对话存储、学习同步、console 中都不能出现 key → Task A2 / A3 单元测试（错误路径只留 message、对话存储里搜不到 key 字符串）+ e2e 检查 `/api/learning` 请求体和 localStorage 其它键。
3. **key 无效 / 余额不足 / 被拒答（refusal）/ 网络断开**：显示可读的提示，不白屏，已输入的问题不丢 → Task A3 transport 测试 + A4 e2e（假流返回 401 和 refusal）。
4. **同一锚点重复提问时缓存失效**：锚点上下文必须逐字节稳定（同输入同输出，不含时间戳、不依赖对象键顺序），否则每轮都按全价重写缓存 → Task A3 的确定性测试。
5. **localStorage 写满或损坏**：对话存储超额时淘汰最旧的线程而不是抛错，损坏的存储不影响 quiz 等其它功能 → Task A3 threadStore 测试。

---

## §0 设计决定（批准时锁为 D-181）

1. **只接 Anthropic，模型 `claude-sonnet-5-5`**（用户选 Sonnet）。DeepSeek 在 v1 不接（它的有效 key 流式未验证，用户也不用），D-179 决定 4 中的「DeepSeek / Anthropic」相应缩为 Anthropic。将来要接时另开 D。调用：`createAnthropic({ apiKey, headers: { "anthropic-dangerous-direct-browser-access": "true" } })("claude-sonnet-5-5")`。Sonnet 5.5 不能关 thinking，所以不传 `thinking`，用 `providerOptions.anthropic.effort` 控制：平时 `"low"`，`shouldEscalate()` 为真时 `"high"`（沿用 `escalation.ts`，旧版是换 Opus，现在只提 effort）。`maxOutputTokens: 4000`（thinking 也算在输出里，spike 中 haiku 就有 43 token thinking；篇幅靠 prompt 控制，不靠截断）。`maxRetries: 1`。
2. **费用估算**（Sonnet 5.5：输入 $2 / 输出 $10 / 缓存读 $0.20 / 5 分钟缓存写 $2.5，每百万 token）：一次「なぜ」首轮 ≈ 系统指示 1.5k + 题目锚点 3k token 写缓存 ≈ $0.011，输出 ≈ 600 token ≈ $0.006，合计约 **2 美分**；同一题追问约 **1 美分**（缓存读 ≈ $0.001）。一天问 30 轮 ≈ $0.3。**Task A1 实测修正**（spike §3）：题目锚点实为 ≈1.6k token，费用以输出为主，首轮 ≈ $0.005〜0.009（缓存冷时较高）、追问 ≈ $0.006；首字 2.3〜4.2 s，UI 必须显示生成中状态。
3. **入口顺序**（用户交给 Claude 定）：按「数据是否已经在浏览器里」排。
   - Phase A：**quiz 题目的「なぜ」**。题干、选项、`correct_answer`、三语解说、`termCards` 已经是客户端 props，不需要新的数据通路，价值最高。
   - Phase B：**主动复习**。quiz 首页根据学习记录给出薄弱 topic，点进去后 AI 先生先开口。
   - Phase C：**术语 / unit / 自由提问**。术语详情和 unit 页是 server component，需要由服务器拼好锚点文本传给客户端；自由提问还需要按关键词找术语。
4. **锚点上下文**（缓存布局沿用旧 tutorPrompt）：`messages[0]` = 系统指示（固定文本，`cacheControl: ephemeral`），`messages[1]` = 锚点上下文（`cacheControl: ephemeral`），之后是对话。锚点是确定性的纯文本（日文原文 + 当前 UI 语言的译文，不用 JSON.stringify 对象）。不使用对话中途的 `role: "system"`（AI SDK 会把 system 消息提到前面）；换锚点 = 新线程。Sonnet 5.5 最小可缓存前缀 512 token，系统指示单独就够。
5. **系统指示要点**：用 UI 语言回答（ja / zh / en），专有名词附日文原文；只根据锚点里的审定内容讲，锚点没有的要明说「教材にない」；不自己出题，要练习就指向锚点里列出的真实过去问（带 `#question_id` 链接）；回答先结论、后理由，一般不超过 300 字；记录只反映「点过选项的题」，只看过答案的题不在记录里（Phase 3 申し送り (b)）；`unitsRead` 只表示打开过（(c)）；正确率回答数少于 5 题时要提醒样本少（(e)）。
6. **存储**：
   - key：`itp:sensei:key:v1` = `{ "provider": "anthropic", "apiKey": string, "savedAt": ISO }`，只在 AI 先生的设定面板读写。
   - 对话：一个锚点一个线程。索引 `itp:sensei:index:v1` = `{ v: 1, threads: [{ id, kind: "question"|"review"|"term"|"unit"|"free", anchorId, title, updatedAt }] }`；消息用现有 `historyStore.ts` 的 `save/load/clearChatHistory(storage, messages, key)`，key = `itp:sensei:thread:<id>:v1`，每线程最多 200 条（现有 `MAX_PERSISTED_MESSAGES`）。最多 30 个线程，超出时淘汰 `updatedAt` 最旧的。写入 QuotaExceeded 时淘汰最旧线程再试一次，再失败就放弃保存并提示，不抛出。
   - 不经 `/api/learning` 同步（用户只要求保存，不要求跨设备）。`tutorHistoryStore.ts` 删除（与 historyStore 重复）。
7. **模型输出渲染**：重新加回 `react-markdown`，默认设定（不渲染原始 HTML，不加 `rehype-raw`），链接只允许 `https:` 和站内相对路径（`urlTransform`），外链加 `rel="noopener noreferrer" target="_blank"`。理由：讲解里有列表和表格时纯文本难读；默认设定不执行 HTML，CSP 下也安全。
8. **CSP**：在 `next.config.ts` 的 `headers()` 里加静态响应头，只在 `NODE_ENV === "production"` 时生效（dev 需要 HMR websocket 和 `va.vercel-scripts.com`）：
   ```
   default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.anthropic.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
   ```
   残留风险如实记下：Next 15 生产页面有内联 flight script（`self.__next_f.push`），用 nonce 就必须逐请求生成 header → 所有页面变成动态渲染 → 辞典列表失去静态化。所以 `script-src` 保留 `'unsafe-inline'`；真正守住 key 的是 `connect-src`（就算有注入脚本，也只能把数据发到自身和 Anthropic）。`style-src 'unsafe-inline'` 是因为 next/font 和组件的 `style={{}}`。Vercel Analytics / Speed Insights 在生产是同源路径，不需另开。Vercel preview 部署的 toolbar 会被挡，接受。
9. **术语 / unit / 自由提问的上下文（Phase C）**：术语详情页和 unit 页由 server component 拼好锚点文本（每个术语：日文 + UI 语言的定义・解说・记忆钩子；unit 再加概要），作为 prop 传给客户端的「AI 先生に聞く」按钮；不新增路由。自由提问在 `/sensei` 页：浏览器拿到全部术语标题的轻量索引（id + 三语标题，约 1395 条），按最长匹配找出问题里出现的术语（最多 8 个），再 `GET /api/sensei/terms?ids=…`（新增的只读路由，读现有辞典 reader，返回卡片 JSON，最多 8 个 id，不调用 LLM、不需要 owner）取定义。这是唯一的新 fs 路由，nft gate 守住 IPA 目录。
10. **路由与导航**：`/[locale]/sensei`（AI 先生页：key 设定、线程列表、自由提问）。三个 shell 的导航各自硬编码三项 → 抽出一份共享的导航列表 `src/components/shells/navItems.ts`，加第四项。i18n 新增 `Sensei` 命名空间（ja / zh / en）。旧 `/tutor`、`/chat` 继续 404，不做重定向（没有外部链接指向它们）。
11. **拒答与错误**：AI SDK 3.0.78 不支持服务端 `fallbacks`。Anthropic 返回 `stop_reason: "refusal"` 时（AI SDK 映射后的 finish reason 在 Task A3 用假流确认，预期 `content-filter`）显示「この質問には答えられませんでした」类提示；401 → 「key が無効です」并打开设定面板；429 / 529 → 「混雑しています、少し待って再試行」；网络错误 → 「接続できません」。用户刚输入的问题保留在输入框。

### §0 改訂（Phase A 执行中，主 context 裁定，ledger = `evidence/phase5/stage_06_ai_sensei/phaseA_sdd_ledger.md`）

- **§0-1**：每个线程的**第一轮用户发言固定 effort `"low"`**；从第二轮起才由 `shouldEscalate` 决定 `"high"`（「なぜ」入口本身含「なぜ」，否则首轮必升 high，与 A1 费用前提矛盾）。
- **§0-4**：题目入口的 anchorId = `<question_id>:<choice>`（作答后）/ `<question_id>:reveal`（只看答案），改选 = 新线程。对话尾部再加第 3 个 ephemeral 断点（追问时历史走缓存）。
- **§0-6**：出错（`isError`）和被拒答（finishReason `content-filter`）的那一轮**不保存**（问题退回输入框）；中止（abort）照常保存。线程标题在线程创建时固定（不在完成时读取）。`openThread` 写索引失败时淘汰最旧线程后重试一次。
- **§0-7 / Global Constraints 依赖**：新增运行时依赖 = `react-markdown` + `remark-gfm`（表格）+ `zod`（直接依赖，版本与 AI SDK 解析到的同一实例一致）。
- **§0-8**：AI SDK 内部 zod 的 `new Function` 探测会在生产 CSP 下触发 `script-src eval` 违规 → 加载 AI SDK 前调用公开 API `z.config({ jitless: true })`（`src/lib/sensei/zodJitless.ts`，`useSensei.ts` 的第一个 import）。残留风险的准确表述：`connect-src` 只限制 fetch / XHR / WebSocket / beacon 的去向，顶层导航和 `window.open` 外带不在 CSP 范围内，所以任何 XSS 仍等于 key 泄漏；模型输出经 react-markdown 默认设定（不渲染原始 HTML）+ `urlTransform` 白名单渲染。
- **§0-10**：英文名称统一为 "AI Tutor"（ja「AI 先生」、zh「AI 老师」）。Phase A 的 `/sensei` 页**不加载 AI SDK**（线程行链接回题目来源；自由提问在 Phase C）。

## File Structure

```
apps/web/src/lib/sensei/
  model.ts            # MODEL_ID / effort 常量、createSenseiModel(apiKey)
  keyStore.ts         # load/save/clearSenseiKey(storage)
  prompt.ts           # SENSEI_SYSTEM_INSTRUCTION、buildSenseiMessages(anchorText, conversation)
  anchors.ts          # questionAnchor / reviewAnchor / termAnchor / unitAnchor（纯函数，确定性文本）
  browserTransport.ts # createBrowserTransport({ getKey, getAnchor }) : ChatTransport<UIMessage>
  errors.ts           # toSenseiError(e) -> { kind, message }（只读 message）
  threadStore.ts      # 线程索引 + 淘汰，内部用 lib/chat/historyStore.ts
  weakness.ts         # Phase B：weakTopics(record, ...) 纯函数
  termMatch.ts        # Phase C：最长匹配找术语
apps/web/src/hooks/useSensei.ts          # useChat + transport + threadStore + escalation
apps/web/src/components/sensei/
  SenseiPanel.tsx     # 对话面板（抽屉 / 页面内两种布局）
  SenseiMarkdown.tsx  # react-markdown 包装
  KeySettings.tsx     # key 输入、保存位置说明、删除
  AskSensei.tsx       # 各入口的按钮 + 面板挂载
apps/web/src/app/[locale]/sensei/page.tsx
apps/web/src/app/api/sensei/terms/route.ts   # Phase C
apps/web/src/components/shells/navItems.ts
apps/web/e2e/sensei.spec.ts, e2e/csp.spec.ts, e2e/helpers/fakeAnthropic.ts
```

---

## Phase A — 基础 + 题目「なぜ」

### Task A1: Sonnet 5.5 实测（一次性，不进主代码）

- [ ] 用 Task 13 同样的临时页面（`src/app/[locale]/spike-byok/page.tsx`，不 commit，用完删、`git status` 确认无残留），模型 `claude-sonnet-5-5`，`providerOptions: { anthropic: { effort: "low" } }`，system 用一段约 3k token 的真实题目锚点（拿一题的题干 + 选项 + 日文解说），连发两次。
- [ ] 用户在本机浏览器填 key 运行（key 不经过本会话）。记录：AI SDK 3.0.78 是否接受该模型 ID 和 `effort`、首字延迟、thinking token、缓存写 / 读、每轮实际费用。结果追加到 `evidence/phase5/stage_06_ai_sensei/spike_S131.md`（或新 session 的文件）。
- [ ] 判定：若 `effort` 被拒或首字 > 5 s，在继续之前修订 §0-1（Rule B：失败归档 `failures/`）。

### Task A2: key 存储 + 设定面板 + CSP

**Files:** Create `lib/sensei/keyStore.ts`、`components/sensei/KeySettings.tsx`、`e2e/csp.spec.ts`；Modify `next.config.ts`；Test `lib/sensei/__tests__/keyStore.test.ts`、`src/__tests__/nextConfigHeaders.test.ts`。

**Interfaces — Produces:** `loadSenseiKey(storage: StorageLike): string | null`、`saveSenseiKey(storage, apiKey: string): void`、`clearSenseiKey(storage): void`、`SENSEI_KEY_STORAGE = "itp:sensei:key:v1"`；`<KeySettings onChange?: (hasKey: boolean) => void />`。

- [ ] 测试：保存后能读回；`clear` 后为 null；存储里是损坏 JSON 时返回 null 且不抛；空白字符串不保存；`StorageLike` 抛错时返回 null。
- [ ] 测试：`next.config.ts` 的 `headers()` 在 production 下对 `/:path*` 返回 §0-8 的 CSP 字符串（逐字比较），在非 production 下不返回 CSP。
- [ ] 实现。`KeySettings` 显示：输入框（`type="password"`、`autoComplete="off"`）、「保存先：このブラウザの localStorage のみ。サーバーには送信されません」、删除按钮、已保存时只显示末 4 位（`…abcd`）。
- [ ] e2e `csp.spec.ts`（本地 prod build + 生产）：依次打开首页、教科书目录、一个 unit、quiz 首页、一个题组、辞典列表、一个术语、`/sensei`，在页面上监听 `securitypolicyviolation` 并断言 0 件，console 无 CSP 报错。
- [ ] build 后确认 `.next/prerender-manifest.json` 仍含 `/ja/glossary`、`/zh/glossary`、`/en/glossary`。
- [ ] Commit。

### Task A3: 浏览器 transport + prompt + 线程存储

**Files:** Create `lib/sensei/{model,prompt,anchors,browserTransport,errors,threadStore}.ts`、`hooks/useSensei.ts`；Delete `lib/tutor/tutorHistoryStore.ts` + 其测试；Test 各自 `__tests__/*.test.ts`。

**Interfaces — Produces:**
- `MODEL_ID = "claude-sonnet-5-5"`、`EFFORT_DEFAULT = "low"`、`EFFORT_ESCALATED = "high"`、`MAX_OUTPUT_TOKENS = 4000`。
- `buildSenseiMessages(anchorText: string, conversation: ModelMessage[]): ModelMessage[]` —— `[system 指示 + cacheControl, system 锚点 + cacheControl, ...conversation]`。
- `questionAnchor(q: QuizQuestion, locale: Locale, ctx: { choice?: string; termCards: Record<string, TermCard> }): string`。
- `createBrowserTransport(opts: { getKey(): string | null; getAnchor(): string; onMissingKey(): void }): ChatTransport<UIMessage>` —— `sendMessages` 内 `convertToModelMessages` → `streamText({ model, messages: buildSenseiMessages(...), providerOptions: { anthropic: { effort } }, maxOutputTokens, maxRetries: 1, abortSignal })` → `return result.toUIMessageStream()`；`reconnectToStream` 返回 `null`。
- `toSenseiError(e: unknown): { kind: "auth" | "rate" | "refusal" | "network" | "other"; message: string }`。
- `threadStore`：`listThreads(storage)`、`openThread(storage, { kind, anchorId, title }): ThreadMeta`（同 kind+anchorId 复用）、`saveThreadMessages(storage, id, messages)`、`loadThreadMessages(storage, id)`、`deleteThread(storage, id)`；`MAX_THREADS = 30`。
- `useSensei({ kind, anchorId, title, anchorText })` → `{ messages, sendMessage, status, error: SenseiError | null, stop, clear, hasKey }`。

- [ ] 测试 prompt / anchors：同一输入两次调用结果逐字节相同；anchor 文本不含 `Date`、随机值；选项顺序按 `ア イ ウ エ`；用户选项按当前 `correct_answer` 重新判定（构造 `record.correct=true` 但 `choice≠correct_answer` 的用例，锚点必须写「不正解」）；`locale="zh"` 时包含日文原文和中文解说，不含英文。
- [ ] 测试 transport（注入假的 `streamText` / model，不打网络）：没有 key 时调用 `onMissingKey` 且不发请求；effort 在 `shouldEscalate` 为真时是 `"high"`，否则 `"low"`；请求头含 `anthropic-dangerous-direct-browser-access`。
- [ ] 测试 errors：401 / 429 / 529 / `TypeError: Failed to fetch` / content-filter 分别映射到对应 kind；返回值里搜不到传入的 key 字符串（构造一个 message 中含 key 的错误，断言 `toSenseiError` 输出的 message 已把 key 替换成 `…` + 末 4 位）。
- [ ] 测试 threadStore：第 31 个线程淘汰最旧的（连同其消息键）；同 kind+anchorId 复用同一线程；setItem 抛 QuotaExceeded 时淘汰一个再试，再失败返回 `false` 不抛；索引损坏时当作空索引，不删除其它键；保存的消息 JSON 里搜不到 key。
- [ ] 实现。`historyStore.ts` 保持现有 API，只被 threadStore 调用。
- [ ] Commit。

### Task A4: quiz「なぜ」入口 + 面板

**Files:** Create `components/sensei/{SenseiPanel,SenseiMarkdown,AskSensei}.tsx`、`e2e/helpers/fakeAnthropic.ts`、`e2e/sensei.spec.ts`；Modify `components/quiz/QuizSet.tsx`、`package.json`（加 `react-markdown`）、`messages/{ja,zh,en}.json`（`Sensei` ns）。

- [ ] e2e 辅助 `fakeAnthropic(page, { mode: "ok" | "401" | "refusal" })`：`page.route("https://api.anthropic.com/v1/messages", …)` 返回 Anthropic SSE 格式的假流（`message_start` → `content_block_delta` × N → `message_delta` → `message_stop`），并记录请求体供断言。
- [ ] e2e：作答后出现「AI 先生に聞く」按钮 → 点开面板 → 没 key 时显示设定面板 → 填假 key → 发问 → 流式文字逐步出现 → 请求体的 system 里包含该题 `question_id` 和正解 → 刷新后同题线程的对话还在 → 401 时显示 key 无效提示且输入保留 → refusal 时显示拒答提示 → `/api/learning` 请求体与除 key 键以外的 localStorage 值都不含假 key。
- [ ] 实现：按钮在作答或「解答を表示」之后出现（两者都可以问「なぜ」）；面板在手机宽度为全屏抽屉，宽屏为右侧抽屉；Esc 关闭、焦点回到按钮；输出区 `aria-live="polite"`；生成中可停止。
- [ ] Commit。

### Task A5: `/sensei` 页 + 导航

**Files:** Create `app/[locale]/sensei/page.tsx`、`components/shells/navItems.ts`；Modify 三个 shell 的导航文件、`messages/*.json`。

- [ ] 测试 / e2e：三种 shell 的导航都有第四项且指向 `/[locale]/sensei`；`/sensei` 显示 key 设定和线程列表（按 `updatedAt` 新→旧），能删除线程；未保存 key 时说明怎么申请 Anthropic key（链接到 console.anthropic.com）。
- [ ] 实现（自由提问的输入框在 Phase C 才启用，Phase A 先显示「近日公開」）。
- [ ] Commit。

### Task A6: Phase A 收尾

- [ ] Gates 全绿 → Rule D（`pr-review-toolkit:code-reviewer`，writer 为 `oh-my-claudecode:executor`）→ 修正 → push → 生产 e2e（含 `csp.spec.ts`、`sensei.spec.ts` 假流）。
- [ ] 用户用真 key 在生产页面问一题，确认流式和费用（usage 显示在开发者模式开关下，默认不显示）。

## Phase B — 主动复习

### Task B1: 薄弱 topic 判定（纯）

**Interfaces — Produces:** `weakTopics(record: LearningRecord, topicIds: Record<string, string[]>, opts?: { minAnswered?: number; limit?: number }): { topicId: string; answered: number; correct: number; rate: number }[]`，默认 `minAnswered = 5`、`limit = 3`，按 `rate` 升序，再按 `answered` 降序，再按 `topicId`。

- [ ] 测试：回答数不足 5 的 topic 不入选；全对的 topic 不入选；排序稳定；空记录返回 `[]`。
- [ ] 注意：quiz 首页没有 `correct_answer`，这里用记录里的 `correct`（近似值）；进入题组后的锚点会重新判定（§Global）。
- [ ] Commit。

### Task B2: 复习入口 + AI 先开口

**Files:** Create `components/sensei/ReviewCard.tsx`；Modify quiz 首页、`QuizSet.tsx`（读 `?review=1`）、`lib/sensei/anchors.ts`（`reviewAnchor`）。

- [ ] `reviewAnchor(questions, record, locale, termCards)`：该 topic 里答错的题（按当前 `correct_answer` 重判，最近的最多 10 题）+ 各自的解说 + 相关术语定义 + 该 topic 中还没做过的题 id 列表（最多 10 个，供 AI 推荐，AI 只能从这里选）。
- [ ] quiz 首页显示「AI 先生の復習」卡片：列出 `weakTopics` 前 3 个（topic 名、正确率、回答数）；没有符合条件的 topic 时显示「5 題以上解くと弱点を分析します」。
- [ ] 点卡片 → 跳到该 topic 题组 `?review=1` → 面板自动打开，**只在用户点了卡片的这一次**自动发送首轮（固定的开场指令「この分野の弱点を復習したい」），AI 总结错误倾向、讲关键术语、推荐 2〜3 道真实过去问（带 `#question_id` 链接）。刷新页面不会再次自动发送。
- [ ] e2e（假流）：卡片排序正确、首轮自动发送一次、请求体锚点里只含该 topic 的题、推荐链接能滚到对应题。
- [ ] Commit。

### Task B3: Phase B 收尾（同 A6）

## Phase C — 术语 / unit / 自由提问

### Task C1: 术语详情 + unit 页入口

- [ ] `termAnchor(entry, locale)`、`unitAnchor(unit, locale)` 纯函数 + 确定性测试（多释义术语列出全部 sense）。
- [ ] 术语详情页、unit 页由 server component 生成锚点文本，传给 `<AskSensei kind="term"|"unit" anchorId anchorText title />`。确认 build 后这两个页面的渲染方式没变、辞典列表仍静态。
- [ ] e2e（假流）：两个入口的请求体锚点含该术语 / unit 的日文定义。
- [ ] Commit。

### Task C2: 自由提问

- [ ] `matchTerms(text, index: { id, jp, zh, en }[], limit = 8): string[]` 最长匹配纯函数 + 测试（重叠时取长的、大小写不敏感的英文、全角半角统一）。
- [ ] `GET /api/sensei/terms?ids=` 测试：超过 8 个 → 400；非法 id → 跳过；返回 `TermCard` 形状；不需要 owner；无 LLM。
- [ ] `/sensei` 页启用输入框：发问前用 `matchTerms` 找术语 → 取卡片 → 锚点 = 匹配到的术语定义（没匹配到时锚点写「該当する教材の項目なし」，系统指示要求 AI 说明是一般知识）。每个自由提问是新线程。
- [ ] Commit。

### Task C3: Phase C 收尾（同 A6）+ Rule C

- [ ] Gates → Rule D → push → 生产 e2e。
- [ ] 写 `RETROSPECTIVE_stage6_learning.md`（Rule C：保留的做法 / 必须补的缺口 / 关键决策复盘，覆盖 D-179〜D-181 全部 Phase）。
