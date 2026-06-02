# D-129 — Stage 4 モデルと三語戦略

> Status: **Locked** (Session 78, 2026-06-02)
> 関連: D-128 (実行戦略), D-116 (記憶フック), D-118 (三語平铺 schema), D-110 (TS), **D-132 (LLM は Claude Code・外部 API 不使用 — 129-B を更正)**, Rule A/D
> 前提: ユーザー指示「著訳とも最高モデル・最高モード (Opus 4.8 max effort / xhigh + ultracode)」。
> 公式確認: claude-api skill (Anthropic 公式)。記憶: 事前計算翻訳優先 (real-time API 翻訳不信)。

## 文脈

当初案は著=Opus / 訳=Sonnet (コスト削減)。ユーザーは品質最優先で「全工程 Opus 4.8・最高 effort」を明示選択。公式仕様で技術定義を確認した結果、「extended thinking の最大 budget」という当初の枠組みが Opus 4.8 では成立しないことが判明 (下記 129-B)。

## 決定

### 129-A 全工程 Opus 4.8 (`claude-opus-4-8`)

著 (日語) も訳 (zh/en) も Opus 4.8。Sonnet への降格なし。

### 129-B 「最高 effort」= ultracode + Opus subagents (Claude Code 経路、D-132)

- 実行は **Claude Code** (D-132、外部 API 不使用)。「最高 model/effort」= **`model=opus` + ultracode** (Workflow/Agent で subagent を spawn)。
- 参考 (API を使う場合の等価設定、本プロジェクトでは**不使用**): Opus 4.8 は `budget_tokens` 非対応 (400)、effort は `output_config:{effort:"max"}` (階梯 low/medium/high/xhigh/max、max は Opus 専属)、`temperature/top_p/top_k` も除去。当方が直接設定するのは Claude Code の agent/workflow 構成のみ。
- pilot で 質 (Rule A) と 吞吐 を確認 (xhigh/max 相当の挙動はモード設定で調整)。

### 129-C 三語方式: 日語権威源 → 二次翻訳

日語を権威源として生成 → zh/en は固定日語源から翻訳 (別 pass)。同一プロンプトで三語同出はしない。

**採用理由**: ①日語は試験言語・術語真相源 (官方シラバス語に忠実)。②固定源翻訳で三語の意味一致を担保 (同出は漂移・深度不均)。③pre-computed (記憶: real-time 翻訳不信)。④Rule A 監査が容易。
**却下**: 三語同出 (漂移/深度不均/監査困難)。

## 影響

- 三語平铺 `_jp/_zh/_en` (D-118 踏襲)。
- コスト: **Claude Code Max plan の定額内** (D-132、外部 API 課金なし)。pilot で吞吐/耗時を測り全量を見積もる。
- 実装: **Claude Code (Workflow/subagents, `model=opus`) で生成** (D-132)。schema 拘束は agent の構造化出力 + 確定的後検証。機械装配は TS/JS スクリプト (D-110 TS-only)。
