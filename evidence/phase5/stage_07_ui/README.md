# Stage 7 UI — 旧渲染器显示基线

- 采集时 HEAD: `3ae84e5eac39c0d556cd2a35d2f72b524607fbd7`（branch `stage7-ui`, S132；按 controller 裁定修正哈希规则后重新采集。渲染器与 `data/ip/quiz/` 自 `032ae93` 起未变）
- 文件: `baseline.jsonl` — 2900 题 × ja/zh/en = 8700 行，每行一个 `BaselineRow`（JSON）
- 用途: Stage 7 Phase 1 用新练习视图替换 `QuizSet` 之前，冻结**现行** `StemBlocks` / `ChoiceBody` 的显示结果；Task 8 的 fidelity 测试用同一套哈希（`apps/web/src/components/practice/__tests__/fidelityBaseline.ts`）证明新视图显示的文字完全一致。
- 只存 id / locale / 哈希 / 布尔值 / 选项下标 0–3，**不含题目原文**（IPA 版权）。

## 重新生成

```sh
cd apps/web
CAPTURE_BASELINE=1 npx vitest run src/components/practice/__tests__/fidelityBaseline.capture.test.ts
```

不带变量运行同一测试 = 校验文件存在、8700 行、无假名 / 汉字。数据（`data/ip/quiz/`）不变时重新生成结果逐字节相同。

## 字段

数据来源: `loadAllQuestions()`（已合并 translations / explanations，`stem_jp` 已是 `stem_jp_clean`）。行顺序 = 加载顺序 × `ja, zh, en`。

| 字段 | 内容 |
|---|---|
| `qid` / `locale` | 题 id / `ja`·`zh`·`en` |
| `source` | `source_label` 的文本哈希 |
| `stemJp` | `StemBlocks(stem_jp)` 渲染结果的文本哈希（三个 locale 行相同） |
| `choicesJp[4]` | `ChoiceBody({text: JP, jpText: JP, figure})`，ア..エ |
| `stemTr` | `StemBlocks(localizedStem)`；ja 行为 `null` |
| `choicesTr[4]` | `ChoiceBody({text: localizedChoices, jpText: JP, figure})`；ja 行全 `null` |
| `figure` | 题图的图片哈希 `imageHash(src)`，src = `/quiz-figures/<figure>.webp`，**只取 basename**（alt 是通用 i18n 标签、不是内容）；三个 locale 行相同；无图 `null` |
| `choiceFigures[4]` | 该 locale 下 `ChoiceBody` 渲染出的 `<img>` 的图片哈希 `imageHash(src, alt)`（alt = 选项文字）；非图选项 `null` |
| `explCorrect` | `localizedExplanation().correct` 的文本哈希；无解说 `null` |
| `explDistractors` | `[选项下标 0–3, 文本哈希]`，按 ア..エ 顺序，跳过正解 |
| `points` | 各要点的文本哈希 |
| `suspect` | `key_guard.suspect`（无解说 `false`） |

### 哈希定义

- **文本哈希** `textHash(html)` = `sha256(fieldText(html))` 前 16 hex。
- `fieldText`: 解码实体（`&amp; &lt; &gt; &quot; &apos; &nbsp;`、十进制 / 十六进制数字实体）；文本节点**逐字保留**（不合并空白、不逐行 trim、不删空行，所以 `<pre>` 缩进与刻意空行都计入）；`<br>` → `\n`；块元素（p div pre table thead tbody tfoot tr caption ul ol li dl dt dd）的开始 / 结束边界只在已累积文本不以 `\n` 结尾时补一个 `\n`，`th`/`td` 边界只在不以空白结尾时补一个空格（合成分隔符不叠加，多一层包裹 `<div>` 不改变结果）；只 trim 整个字段的首尾；末尾加 `\n#sig pre=N table=N tr=N th=N td=N img=N br=N ul=N li=N`（开始标签计数）。
- 纯文本字段（`source`、解说各项）先按 React 文本节点渲染（`<span>{text}</span>`）再取文本哈希。
- **图片哈希**（basename 含扩展名，如 `<figure>.webp`）: 选项图 `imageHash(src, alt)` = `sha256(basename(src) + "|" + alt)` 前 16 hex；题图 `imageHash(src)` = `sha256(basename(src))` 前 16 hex。
