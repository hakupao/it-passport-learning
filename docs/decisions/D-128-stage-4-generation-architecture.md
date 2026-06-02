# D-128 — Stage 4 生成アーキテクチャと実行戦略

> Status: **Locked** (Session 78, 2026-06-02)
> 関連: D-114〜118 (Stage 4 高層設計), D-126/D-127 (Stage 3/3.5), D-110 (TS), **D-132 (LLM は Claude Code・外部 API 不使用 — 128-C/D を更正)**, D-129/D-130/D-131 (本 Stage 同時 lock), Rule A/B/C/D
> 前提: G4 起動 (ユーザー)。基盤 = enriched question_bank.json 2,900題 (confidence high2292/medium591/low17) + knowledge_tree 63小分類/1,417用語。`data/ip/textbook/` 空 (新規)。
> 公式確認: claude-api skill (Anthropic 公式) で Batches/効力/caching を grounding (記憶のみに依拠せず, D-019)。

## 文脈

Stage 4 は **~180〜240 ユニット** (実測: 1,417用語 ÷ 5〜8 ≈ 180〜240。D-115 の「330〜530」は旧シラバス推定語数 **2,651** ベースで過大。curated tree は 1,417) の三語生成。Phase 5 で最も高コスト・準不可逆。D-114〜118 は内容架构・導航を定めたが「どう生成するか」の実行戦略が未確定。

## 決定

### 128-A 二段式生成 (規劃 → ToC ゲート → 内容)

- **Phase A 規劃 (廉価)**: 63 小分類ごとに 1 LLM call で「ユニット分割 + 排列」**のみ**を構造化出力 → 全書 ToC (目次)。
- **ToC ゲート**: ユーザーが ToC を承認してから Phase B に着手 (激安の中間ゲート)。
- **Phase B 内容 (高コスト)**: 確定 ToC に沿い、ユニット単位で三語全文を生成。

**採用理由**: 目次の誤り (ユニット境界・順序) が最も手戻りコストが高い。規劃を内容生成から分離すれば、正文に金を使う**前に**骨格をほぼ無償で審査できる。
**却下**: 内容生成内でユニット境界を即興決定 (構造と内容が結合し ToC を単独審査不可、手戻り高)。

### 128-B Pilot-first (3 跨類節点)

各 category 1 節点を端到端で先行生成: **technology-16-43 システムの構成 (25語/38題)** / **management-11-29 サービスマネジメントシステム (25語/77題)** / **strategy-02-04 知的財産権 (18語/69題)** (各3〜4 unit, 計~10〜11 unit)。検証 = schema 妥当 + 質 (Rule A) + 単 unit 実測コスト + effort xhigh/max 比較。外挿してユーザー gate → 全量。

**採用理由**: 三類で内容形態が大きく異なる (技術=具体/図解、管理=過程、戦略=抽象法務)。単節点 pilot では戦略類の質問題を露呈できない。3 節点は最廉の「全形態」保険。
**却下**: 単節点 pilot (全形態を覆えず) / 直接全量 (証拠なしで最高コストを all-in、Tier3/RuleA 違反)。

### 128-C 実行チャネル: Claude Code (Max plan、外部 API 不使用) — D-132 で更正

全 LLM 工作 (Phase A 規劃 / Phase B 内容生成) は **Claude Code の Workflow tool / subagents** (ultracode + `model=opus`) で実行。**外部 Anthropic API / Message Batches API は不使用** (D-132: ユーザー Max plan・定額・按 token 課金回避)。並列は Workflow の `parallel()`/`pipeline()` (同時 ~10〜16)。pilot = 小 workflow (3節点)、全量 = 大 workflow (63 topic)。機械装配 (選題・`figure_index`・JSON 書込) と図レンダ (mmdc) は TS/JS スクリプト (API 不要)。

**コスト観**: 定額サブスクリプション。按 token 課金なし → pilot は **吞吐・耗時** を測り全量スケジュールを外挿 (ドル成本ではない)。Max plan レート制限が実質制約。
**却下/撤回**: Message Batches API / 外部 SDK 直叫 — 按 token 課金が発生 (ユーザー方針に反する)。Session 78 当初 lock 時の Batches 案は **D-132 で撤回**。

### 128-D コンテキスト効率 (Claude Code harness 管理)

Claude Code 内実行のため prompt caching は harness が自動管理 (当方が API `cache_control` を設定する経路ではない)。設計上は各 subagent に共有指針 (schema/スタイル/該当 topic 文脈) を渡し、ユニット単位で独立生成 (long-context 衰減回避、記憶: batch size cap)。

## 影響

- 産出: `data/ip/textbook/{unit_index.json, units/*.json, figures/*}`。invariants (question_bank の correct_answer / answer_keys / figure / group / source) **不変**、textbook は新規生成物。
- 証拠: `evidence/phase5/stage_04_*`。Rule A バッチ毎抽检 (D-118)。失敗 `failures/` (Rule B)。Rule D: writer ≠ reviewer。
- 実装は **Phase A** から (G4 続行)。生成は Claude Code (Workflow/subagents, D-132)、機械装配は TS/JS スクリプト (D-110 TS-only)。
