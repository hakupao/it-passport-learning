# D-126 — Stage 3 知識マッピング設計

> Status: **Locked** (Session 75, 2026-05-31)
> 関連: D-118（Stage 4 出力 schema, syllabus_refs を参照）, D-119（Stage 3 ゲート）, D-125（双盲方式の流用）
> 前提: Stage 2.7/2.7b 完了（question_bank 2,900 題、主毒除去・answer 保存、残 10 フラグは answer 不変）。

## 文脈

Stage 3 = 過去問 2,900 題を `knowledge_tree.json`（3系 / 23 中分類 / **63 小分類** / **1,413 用語**）の節点へマッピングし `syllabus_refs` を充填する。PLAN §5 は粗い骨子のみだったため、D-019 に従いユーザーへ設計問答（粒度 / 基数 / 検証）を提示し、回答を本決定に確定。

## 決定（ユーザー回答に基づく）

### 1. 粒度 — 二層（小分類 primary + 用語 tags）

各題を **1 つの小分類**（主帰属）に紐づけ、加えてその題が問う**具体的な用語**をタグ付けする。Stage 4 の「小分類→ユニット」構築と用語レベルの精密検索の双方に最適。

### 2. 基数 — primary + secondary[]

主小分類 1 + 関連小分類 0〜2（跨主題の題に対応）。主節点は帰属・統計・ユニット割当に、secondary は交差参照に使う。

### 3. 検証 — 双盲 + 覆盖分析

D-125 流用: 2 独立マッパー（異 subagent_type, Rule D）→ reconcile 一致判定。加えて **coverage 分析**（63 小分類のうち 0 題の節点を報告）。

### `syllabus_refs` schema（enriched question_bank.json）

```json
"syllabus_refs": {
  "primary_topic": "tech-07-01",            // 小分類 id（主、必須）
  "secondary_topics": ["tech-07-02"],       // 小分類 id（0〜2、関連）
  "terms": ["主記憶", "キャッシュメモリ"],     // 用語 term_jp（0〜N、その題が問う用語）
  "confidence": "high|medium|low",
  "mapping_status": "agree|reconciled|escalated"
}
```

- `correct_answer` / `answer_keys` / `figure_*` / `group_id` / `source` は不変（充填のみ）。
- 既存の空 `syllabus_refs: []` を上記オブジェクトへ置換。

## 手法（実装方針、G3 で起動）

1. **syllabus index 準備**: 63 小分類（id + 中分類/小分類名 + 配下用語リスト）を 1 つの参照ファイルに。マッパーはこれを Read して節点選択（全 1,413 用語を prompt に直貼りせず、エコー/トークン肥大を回避）。
2. **double-pass マッピング**: 1 題ごとに 2 独立マッパー（例 A=`general-purpose` / B=`explore`、ともに stem+choices+正答+index を読む）。各々 {primary_topic, secondary_topics, terms, confidence} を構造化出力。バッチ実行（テキストのみ＝vision より高速・低コスト）。
3. **reconcile**: 両者の primary_topic 一致 → confirmed。不一致 → escalate（3rd パス or 主ループ）。secondary/terms は和集合を候補に、信頼度で採否。
4. **coverage 分析**: 63 小分類別の被マッピング題数を集計、0 題節点を gap として報告。
5. **Rule A 監査**: N=20 層化抽検（第 3 の subagent_type）でマッピング妥当性を独立検証。

> モデル選定（opus vs sonnet）と正確なマッパー subagent_type 割当は実装着手時（G3）に確定。分類タスクのため sonnet でも可だが、正確性重視なら opus。

## 却下した代替案

- **用語レベル単独**: 1,413 節点は粒度過剰で誤帰属/漏れが増え、検証コスト高。→ 二層で用語は tag に留める。
- **小分類単独**: Stage 4 の用語別講解に紐づけられない。→ 用語 tag を併設。
- **単一節点のみ**: 跨主題の題で情報を失う。→ primary + secondary。
- **単一パス + N=20 のみ**: 2.7b で双盲が機械単一読みより正確と実証。マッピングは OCR より誤りにくいが、双盲 + coverage の方が gate 品質に資する。→ 双盲採用。

## 影響

- Stage 4（教科書生成）は本マッピングの primary_topic でユニットを構成し、terms で用語講解を、question id で inline_quiz/challenge を引く（D-118）。
- 残 10 フラグ題も stem は有るためマッピング可能（ブロックしない）。
- 次アクション: G3 起動でマッパー実装 → 2,900 題 double-pass → reconcile → coverage → Rule A → enriched question_bank。
