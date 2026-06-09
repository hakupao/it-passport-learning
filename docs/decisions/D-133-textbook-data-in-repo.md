# D-133 — 自作教科書データのみ in-repo 化(著作権境界つき gitignore 解除)

> Status: **Locked** (2026-06-08, Session 85)
> Supersedes: 部分的に D-050 / D-109 の「全 pipeline data は gitignored、終産物は Release のみ」モデルを精緻化(撤回ではなく境界の明確化)。
> Related: D-108(教科書提取路線の放棄)、D-118(Stage 4 出力 schema)、Stage 6(Web App 統合)。

## Context

Stage 6(教科書アプリ統合)v1 = **244 unit 三語教科書アプリのリーダー上線**。Session 81 の harness は gitignored な `data/ip/` を `TEXTBOOK_DATA_ROOT` で server 直読していたが、これは生産デプロイ(public GitHub → Vercel)では成立しない(リポジトリに無いファイルはビルドに含まれない)。

ユーザー要望: 「取消 gitignore、もう教科書(=放棄した抽出路線, D-108)は無く、全部自分で書いたものだから」。

しかし `data/` の実測で前提との食い違いを確認:

| 目录 | 大小 | 来源 | 自作か |
|---|---|---|---|
| `data/ip/textbook` | **25M** | Stage 4 AI 生成(244 三語 unit + 409 自作 SVG) | ✅ **自作** |
| `data/ip/exams` | **1.2G** | IPA 公式過去問(2900 題 stem/choices + 裁剪 PNG) | ❌ **IPA 著作権** |
| `data/ip/sources` | **168M** | IPA 公式 PDF(シラバス/過去問原件) | ❌ **IPA 著作権** |
| `data/ip/syllabus` | 224K | IPA シラバス PDF からの抽出構造 | ⚠️ IPA 派生 |

remote = **public** `github.com/hakupao/it-passport-learning`。

→ 「全部 un-gitignore」は 1.2G+ の IPA 著作物を public repo に commit する(著作権暴露 + リポ 68M→~1.4G の 20 倍肥大)。ユーザー前提「都是自己写的」は **`textbook/` のみ**に当てはまる。AskUserQuestion で範囲を確認 → **「只 textbook/(推奨)」をユーザー選択**。

## Decision

**`data/ip/textbook/` の自作成果物のみ gitignore 解除し in-repo 化する。** IPA 由来データ(`exams/`・`sources/`・`syllabus/`)は gitignored を維持。

In-repo 化する対象(`textbook/` 配下):
- `units/*.json`(244 三語 unit)
- `figures/*.svg`(409 自作生成図)
- `unit_index.json`(全量 ToC)
- `figure_index.json`

除外(commit しない、`textbook/` 内でも):
- `.omc/`・`.planning/`(作業中間物)
- `*.pilot.json`(pilot 残骸)

維持 gitignored(著作権 + 容量):
- `data/ip/exams/`(IPA 過去問)・`data/ip/sources/`(IPA PDF)・`data/ip/syllabus/`

## Scope boundary(なぜ exams/sources を出さないか)

1. **著作権**: 過去問 stem/choices・裁剪図・公式 PDF は IPA 著作物。public repo への commit は不可。
2. **容量**: exams 単体 1.2G。リポ肥大はクローン/CI/Vercel に実害。
3. **v1 に不要**: リーダー v1 は unit の自作 prose + 自作 SVG のみで成立。unit が持つ IPA 由来参照(`inline_quiz`/`challenge_questions`=question_bank ID、`source_figures`=exam PNG)は **後続 Quiz サブ段階**へ繰延(loader は欠落を null で優雅降級)。その段階で「IPA 過去問を ship するか/別配信か」を別途決定する(本 ADR では未決)。

## Rejected alternatives

- **全 un-gitignore**(exams/sources 含む): 著作権暴露 + 20 倍肥大。却下。
- **現状維持(`TEXTBOOK_DATA_ROOT` server 直読)**: 生産デプロイで data がビルドに無く成立しない。却下。
- **派生 quiz-id manifest を今 commit**: ID だけの小清单で将来の quiz 参照解決を先回り。v1 では quiz 自体を繰延するため不要(YAGNI)。後続 Quiz 段階で再検討。

## Consequences

- `.gitignore` の `/data/` 一括 ignore に `textbook/` の例外(negation)を追加。`.omc`/`.planning`/`*.pilot.json` は再 ignore。
- 生産リーダーは in-repo の `data/ip/textbook/` を読む(Next.js `outputFileTracingIncludes` 等でサーバ関数にトレース同梱)。実装は Stage 6。
- D-109 の「data は Release のみ」モデルは IPA 由来データには引き続き適用。自作教科書だけ例外。
- リポ +25M(68M→~93M)。許容範囲。
