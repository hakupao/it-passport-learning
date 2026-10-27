# Phase 3a 截图抽检（Rule A，Task 5 Step 2）

- 抽检者：`general-purpose` opus（与实现者 `oh-my-claudecode:executor`、审查者 `oh-my-claudecode:code-reviewer` 不同 type，Rule D）
- 对象：branch `stage7-ui` @ `1eac8e0`（含 `07fac01`），未改动应用代码
- 构建：`cd apps/web && npm run build`（`next build --turbopack`，exit 0）→ `next start -p 3160`，`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` / `KV_REST_API_URL` / `KV_REST_API_TOKEN` 置空串。PID 40494（npx）/ 40602（node，监听 :3160）；结束后按 PID 停止，`lsof -iTCP:3160 -sTCP:LISTEN` 无输出、`ps -p` 两个 PID 均不存在 → 端口已释放。未使用 :3000。
- 工具：`@playwright/test` 的 chromium，node 脚本（从 `apps/web` 解析模块）。每页新 context（空学习记录），`waitUntil: networkidle`，并等待 `[data-part="read"]` 可用。
- **期望值独立计算**：脚本只读原始 `data/ip/textbook/units/<id>.json` 与 `data/ip/quiz/chumon_groups.json`（`groups[].member_ids`，200 个组员），未 import 应用的 `normalizeUnit` / `pickConfirm` / `termId`；`article id` 以 FNV-1a 32（UTF-8，NFC，`t` + hex(term) + hex(term+"#")）自行重算。

## 选取规则

每个分野 2 个单元：
1. **该分野用语数最多的单元**（并列取 unit_id 字典序最前）：strategy `strategy-01-02-u08`（9 用语，与 technology 两单元并列全 244 单元最多）、management `management-09-26-u04`（8）、technology `technology-23-63-u05`（9，同时 challenge 含 1 个中問组员）。
2. **该分野的边界用例**：technology = 指定的 `technology-21-54-u01`（原 challenge 0 题 → 全靠用语内过去问补到 3）；strategy = `strategy-03-10-u05`（challenge 3 题中 2 题是中問组员 → 去组员后 1 题、补 2 题；strategy 仅 2 个补题单元，取 topic 号较大者）；management = `management-10-27-u02`（management 唯一 challenge 含组员的单元，且为 3b 试点 topic）。

| 单元 | 用语 | 有图用语 | challenge 原数 | 其中组员 | 期望确认题 | 其中补题 | 要点 | 有用语内过去问的用语 |
|---|---|---|---|---|---|---|---|---|
| strategy-01-02-u08 | 9 | 1 | 5 | 0 | 5 | 0 | 5 | 1 |
| strategy-03-10-u05 | 5 | 2 | 3 | 2 | 3 | 2 | 5 | 4 |
| management-09-26-u04 | 8 | 2 | 5 | 0 | 5 | 0 | 5 | 2 |
| management-10-27-u02 | 4 | 2 | 5 | 2 | 3 | 0 | 5 | 4 |
| technology-21-54-u01 | 8 | 2 | 0 | 0 | 3 | 3 | 5 | 3 |
| technology-23-63-u05 | 9 | 2 | 5 | 1 | 4 | 0 | 5 | 7 |

期望确认题 = `challenge_questions` 去组员（去重）→ 不足 3 时按用语顺序从 `inline_fallback=false` 的 `inline_quiz`（去组员）补到 3 → 截到 5。

## 检查项

- **HTTP**：状态 200 且无 `pageerror`。
- **用语**：`main article` 数 = 用语数；顺序与 JSON 一致；每个 `article#<termId>` 存在。
- **文字**：每个用语的 `[data-part=one]` 文本 == `definition_<lang>`、`[data-part=detail]` == `explanation_<lang>`（空白归一后全等；zh 页用 zh 字段。对照：43 个用语的 zh 定义 / 解说均与 jp 不同，故 zh 页确实在核对 zh 文本）。
- **图**：`[data-part=fig] svg` 存在 ⇔ 用语有 `figure.svg_path`。
- **用语内过去问**（附加）：有非 fallback、去组员后非空的题单 ⇔ 有 `[data-part=term-past]` 链接，且链接 `ids` 与期望完全一致。
- **要点**：`[data-part=key-points] li` 数 = `summary.key_points_<lang>` 数。
- **确认题**：`#confirm a` 的 `ids` 与期望列表**逐个、同顺序**一致（空记录 → orderConfirm 全为「未做」→ 原顺序），且 `from=unit`、`unit=<本单元>`。
- **不显示**：`overview.intro_<lang>` 全文不在 `main` 文本中；`summary.memory_hooks_<lang>` 各条均不在 `main` 文本中。
- **読了**：`[data-part=read]` 为 `BUTTON`（空记录 → 未读）。
- **topic 过去问链接**：「この分野の過去問をすべて見る」（zh「查看这个领域的全部过去问」）存在，链到 `/<locale>/practice/browse/<topicId>`。
- **溢出**：`documentElement.scrollWidth <= clientWidth`。
- **列宽（1440）**：`main` 宽 ≤ 44em（font-size 15px → 660px）+ 左右 padding（0）。

## 结果（24 页）

| 单元 | 语言 | 宽 | HTTP | 用语数/顺序/id | 一句话+展開 | 图（有图数） | 用语内过去问 | 要点 | 确认题 | 无 intro/hooks | 読了 | topic 链接 | 溢出 sw/cw | 列宽 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| strategy-01-02-u08 | ja | 1440 | PASS | PASS 9/9 | PASS | PASS 1 | PASS | PASS 5/5 | PASS 5/5 | PASS | PASS | PASS | PASS 1440/1440 | PASS 660px ≤ 660px |
| strategy-01-02-u08 | ja | 390 | PASS | PASS 9/9 | PASS | PASS 1 | PASS | PASS 5/5 | PASS 5/5 | PASS | PASS | PASS | PASS 390/390 | n/a (326px) |
| strategy-01-02-u08 | zh | 1440 | PASS | PASS 9/9 | PASS | PASS 1 | PASS | PASS 5/5 | PASS 5/5 | PASS | PASS | PASS | PASS 1440/1440 | PASS 660px ≤ 660px |
| strategy-01-02-u08 | zh | 390 | PASS | PASS 9/9 | PASS | PASS 1 | PASS | PASS 5/5 | PASS 5/5 | PASS | PASS | PASS | PASS 390/390 | n/a (326px) |
| strategy-03-10-u05 | ja | 1440 | PASS | PASS 5/5 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 3/3 | PASS | PASS | PASS | PASS 1440/1440 | PASS 660px ≤ 660px |
| strategy-03-10-u05 | ja | 390 | PASS | PASS 5/5 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 3/3 | PASS | PASS | PASS | PASS 390/390 | n/a (326px) |
| strategy-03-10-u05 | zh | 1440 | PASS | PASS 5/5 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 3/3 | PASS | PASS | PASS | PASS 1440/1440 | PASS 660px ≤ 660px |
| strategy-03-10-u05 | zh | 390 | PASS | PASS 5/5 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 3/3 | PASS | PASS | PASS | PASS 390/390 | n/a (326px) |
| management-09-26-u04 | ja | 1440 | PASS | PASS 8/8 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 5/5 | PASS | PASS | PASS | PASS 1440/1440 | PASS 660px ≤ 660px |
| management-09-26-u04 | ja | 390 | PASS | PASS 8/8 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 5/5 | PASS | PASS | PASS | PASS 390/390 | n/a (326px) |
| management-09-26-u04 | zh | 1440 | PASS | PASS 8/8 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 5/5 | PASS | PASS | PASS | PASS 1440/1440 | PASS 660px ≤ 660px |
| management-09-26-u04 | zh | 390 | PASS | PASS 8/8 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 5/5 | PASS | PASS | PASS | PASS 390/390 | n/a (326px) |
| management-10-27-u02 | ja | 1440 | PASS | PASS 4/4 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 3/3 | PASS | PASS | PASS | PASS 1440/1440 | PASS 660px ≤ 660px |
| management-10-27-u02 | ja | 390 | PASS | PASS 4/4 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 3/3 | PASS | PASS | PASS | PASS 390/390 | n/a (326px) |
| management-10-27-u02 | zh | 1440 | PASS | PASS 4/4 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 3/3 | PASS | PASS | PASS | PASS 1440/1440 | PASS 660px ≤ 660px |
| management-10-27-u02 | zh | 390 | PASS | PASS 4/4 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 3/3 | PASS | PASS | PASS | PASS 390/390 | n/a (326px) |
| technology-21-54-u01 | ja | 1440 | PASS | PASS 8/8 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 3/3 | PASS | PASS | PASS | PASS 1440/1440 | PASS 660px ≤ 660px |
| technology-21-54-u01 | ja | 390 | PASS | PASS 8/8 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 3/3 | PASS | PASS | PASS | PASS 390/390 | n/a (326px) |
| technology-21-54-u01 | zh | 1440 | PASS | PASS 8/8 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 3/3 | PASS | PASS | PASS | PASS 1440/1440 | PASS 660px ≤ 660px |
| technology-21-54-u01 | zh | 390 | PASS | PASS 8/8 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 3/3 | PASS | PASS | PASS | PASS 390/390 | n/a (326px) |
| technology-23-63-u05 | ja | 1440 | PASS | PASS 9/9 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 4/4 | PASS | PASS | PASS | PASS 1440/1440 | PASS 660px ≤ 660px |
| technology-23-63-u05 | ja | 390 | PASS | PASS 9/9 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 4/4 | PASS | PASS | PASS | PASS 390/390 | n/a (326px) |
| technology-23-63-u05 | zh | 1440 | PASS | PASS 9/9 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 4/4 | PASS | PASS | PASS | PASS 1440/1440 | PASS 660px ≤ 660px |
| technology-23-63-u05 | zh | 390 | PASS | PASS 9/9 | PASS | PASS 2 | PASS | PASS 5/5 | PASS 4/4 | PASS | PASS | PASS | PASS 390/390 | n/a (326px) |

合计 24 页 × 12 项 = 288 项，**FAIL 0**。

## 截图

全页截图（24 张，scratchpad，不入库）：`/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/977a122a-02e4-4287-a82a-156bea9c1433/scratchpad/audit_3a/<unitId>_<ja|zh>_<1440|390>.png`；390 宽分段截图：同目录 `crops/`。原始测量：同目录 `results.json`。

## 目视抽检（每单元至少 1 张）

| 截图 | 所见 |
|---|---|
| strategy-01-02-u08_ja_1440（全页） | 面包屑 → 标题 → meta → AI 先生 → 用语一览 → 9 个用语 → 要点 → 確認問題 → topic 链接 → 読了 → 前后单元；单栏居中，无错位 |
| management-09-26-u04_zh_1440（全页） | 同上顺序；用语标题旁 zh 释义；2 张图正常显示 |
| technology-23-63-u05_ja_1440（全页） | 9 用语，竖向流程图完整，无溢出 |
| technology-21-54-u01_zh_390 top / fig / end | 面包屑・标题换行正常；用语一览换行；确认题「从本单元的过去问中选 3 题」；読了按钮居中 |
| management-10-27-u02_ja_390 fig | WBS / アローダイアグラム 图在框内，正文正常换行 |
| strategy-03-10-u05_zh_390 top | 长标题与「在术语表中打开」在窄屏换到下一行，未重叠 |

未发现版式破损。

**观察（非 FAIL，不在 3a 检查范围）**：横向较宽的 v1 Mermaid SVG（如 `technology-21-54-u01` 的 NoSQL 图、`strategy-03-10-u05` 的インターネット広告图、`management-10-27-u02` 的 WBS 图）在 390 宽按比例缩到列宽，图内文字约 5〜6px，难以阅读；1440 下 `management-09-26-u04` スクラム的横向流程图亦偏小。这是 v1 图的固有形状，3b 的图解注册表会替换；如需在 3a 处理（例如窄屏允许图横向滚动或点击放大），另行决定。

## 判定

- 技术判定：**PASS**（288/288）。
- 业务判定：**PASS** — 6 个单元的阅读页按 D-196 §0-1、§0-4〜§0-6 显示现有 v1 内容；确认题数与独立计算一致（含 0 题单元补到 3、组员排除）。
- 证据不含任何过去问题干原文（仅题数与链接参数比对结果）。
