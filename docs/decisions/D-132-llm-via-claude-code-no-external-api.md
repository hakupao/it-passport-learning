# D-132 — 構建期/内容生産管線の LLM は Claude Code (Max plan)、外部 API 不使用 (web 運行時は対象外)

> Status: **Locked** (Session 78, 2026-06-02; 範囲を同 session 後段でユーザー共識として確定)
> 関連: D-110 (TS-only — 「Anthropic SDK で LLM」条項を構建期で精緻化), D-128/D-129 (Stage 4 実行 — 本決定で執行チャネル更正), D-095/D-104 (web の AI provider — 対象外), Rule A/B/D
> 前提: ユーザーは **Claude Code Max plan (20×)** 利用。明示共識: **構建期(内容生産)は外部 API 不使用 / web 運行時功能は外部 API 使用**(部署服务端は個人 CC 訂閱を使えないため)。

## 文脈

Session 78 同 turn で lock した D-128-C は全量を **Message Batches API**、D-129 は **Anthropic TS SDK 経由**を想定していた。直後にユーザーが「Max plan 利用、`ANTHROPIC_API_KEY`/Anthropic TS SDK の外部 API は使わない」と明示。実際 Stage 1-3 の LLM 工作 (vision 提取 / 知識マッピング / low-conf 重判, 例: `wf_6fb3a415`、scientist/explore/code-reviewer subagents) も Claude Code agents/workflows で行われており、本決定はそれを標準として確定する。

## 決定

**判定軸 = 「誰が・どこで実行するか」。**

### 対象 (本決定が縛る): 構建期 / 内容生産管線
OCR・vision 提取・翻訳・知識マッピング・**Stage 4 教科書生成**・データ生産 等、**開発時に Claude Code が実行**する LLM 工作。
- 全て **Claude Code** (subagents / Workflow tool / ultracode, `model=opus`) で実行。**外部 Anthropic API / Anthropic TS SDK の付費叫び / Message Batches API は不使用**。
- 「最高 model/effort」= **`model=opus` + ultracode** (API の `output_config.effort` / `budget_tokens` ではない)。
- 機械的データ処理 (選題・`figure_index` 組立・JSON 書込) と図レンダ (mmdc 本地 CLI) は **TS/JS スクリプト** (LLM 不要・API 不要)。
- コスト観: **定額サブスクリプション**。按 token 課金なし → 計画は **吞吐・耗時・Max plan レート制限**で見積る。

### 対象外 (本決定は縛らない): web 運行時 / 応用功能
chat・tutor・glossary hover・quiz explain・**未来の AI 学習功能** 等、**部署服务端が終端用户向けに実行**する功能。
- **外部 API を使用** (現状 `apps/web/src/lib/ai/provider.ts`: DeepSeek 既定 + Anthropic 切換; OpenAI は Phase 5 予約スタブ)。部署服务端は個人 CC 訂閱を使えないため。
- 按 token 課金 = 運営コストとして許容。

D-110 の TS-only 方針は維持。「Anthropic TS SDK で LLM を叩く」想定は**構建期では本決定で置換**、運行時 web は AI SDK 経由で外部 API を継続。

## 採用理由

ユーザー共識。構建期は Max plan (定額) で賄えるため外部 API の token 課金を回避。web 運行時は部署服务端が個人 CC 訂閱を使えないため外部 API が必須 (避けられない運営コスト)。Stage 1-3 の構建期 LLM 工作 (Claude Code 経路) とも一致。

## 却下案

- Message Batches API / 外部 SDK 直叫 — 按 token 課金が発生し、ユーザー方針に反する。Session 78 当初 lock 時の Batches 案は本決定で撤回。

## 影響

- **更正**: D-128-C (Batches → Claude Code Workflow/subagents)、D-128-D (caching は harness 管理)、D-129-B (effort は Claude Code 構成)。
- **不変**: 二段式 (D-128-A)、pilot-first (D-128-B)、三語方式 (D-129-C)、切分/排列 (D-130)、選題/頻度/図解二軌 (D-131) — 執行チャネルのみ変更、ロジックは不変。
- **web 運行時不変**: `apps/web/src/lib/ai/provider.ts` (DeepSeek/Anthropic) は対象外、外部 API を継続。
- Mistral OCR は Phase 1 と共に死 (Session 63 削除, D-110/D-113)。`.env.example` を整理 (Session 78)。
- ユーザー記憶に恒久記録 (`memory/no_external_anthropic_api.md`、範囲付き)。
