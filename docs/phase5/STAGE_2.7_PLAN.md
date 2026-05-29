# Stage 2.7 実行仕様（全量 stem/choices 源照合・修復）— 自己完結 handoff

> 新セッション/継続セッションはこれを実行。決定: D-122。前提: Stage 2.6 完了（図表 + has_figure整合 + Phase C CI）。
> フェーズ: 実施阶段（コード可、Tier 3 証拠遵守）。ultracode 想定 → Workflow 並列。

## 目的

question_bank 2,900 題の **stem/choices テキスト**を源ページと全量照合し、OCR garble + 内容不一致(q085型) を除去。**answer_keys は真相源として不変**（Phase C で 100% 確認済）。

## 前提・真相源

- 源ページ画像: `data/ip/exams/pages/<exam>/page-NN.png`（question_bank の `source.page_image` が指す）。
- 答案: `data/ip/exams/answer_keys.json`（IPA 公式・触らない）。
- 図/グループ: 図表は Stage 2.6 で確定（`figure_path` / `groups.json`）。本 Stage は **テキストのみ**対象。

## 手順

### Step 1 — ヒューリスティック garble スコアラ（全量・無料・即時）
- 全 2,900 題の stem_jp/choices_jp を正規表現/統計でスコア: 連続ラテン文字、mojibake 記号（`rrjp`,`mkm`,`@`,`|` 連打）、数字内ラテン、半端な記号列、極端に短い/長い choices 等。
- 出力: `evidence/phase5/stage_027_heuristic_garble.json`（score + フラグ）。母集団 garble 率の速報 + vision 照合のクロスチェック用。
- **注意**: q085 型（garble 無しの別問題）はヒューリスティックで捕捉**不可** → Step 2 で必ず全量 vision 照合する。

### Step 2 — 全量 vision 源照合（Rule D: read-only `explore`、抽出 general-purpose 不使用）
- 全 2,900 題、1 題=1 agent（バッチ、並列上限 ~12-16、~数十バッチ）。各 agent:
  1. 入力 JSON（stored stem/choices, source page abs, figure abs, group shared fig abs）を Read。
  2. 源ページ画像を VIEW。
  3. 保存 stem/choices vs 源ページの実テキストを照合 → 分類:
     - `clean` / `ocr_garble_minor`（意味不変の表記ノイズ）/ `ocr_garble_critical`（意味変化・解不能）/ `content_mismatch`（別問題＝q085型）/ `choices_garble`。
     - critical の場合: 源ページから**正しい stem + choices を全文転写**して返す（`true_stem`, `true_choices`）。
- 効率: 1 題ずつ source page を渡すと重い。**ページ単位バッチ**（1 ページ＝最大3-4題を1 agent でまとめて照合）でトークン削減可。バッチ設計は実行時に最適化。
- 出力: `data/ip/exams/.tmp/s027/scan/*.json` → 集約 `evidence/phase5/stage_027_scan.md` + `defect list`。

### Step 3 — 修復適用（確実 critical のみ、backup 付き）
- `content_mismatch` + `ocr_garble_critical` の `true_stem`/`true_choices` を question_bank + by_year に適用。
  - backup `question_bank.json.pre-s027`、原値 `stem_jp_corrupted_backup` / `choices_jp_corrupted_backup`、フラグ `stem_resourced_s7x`。
  - **answer_keys / correct_answer / figure_path / group_id は不変**。
- `ocr_garble_minor` は triage 記録（ユーザー判断、即修不要）。
- Rule D: 修復(writer executor) と 検証(code-reviewer/explore) を別 lane。Rule A: N サンプル独立監査。

### Step 4 — 修復後 再サンプル CI + ゲート
- 修復後、新 N≈100 層化サンプルで critical 率を再実測（Phase C と同手法）→ Wilson CI。
- D-122 ゲート条件5（再CI 許容 + ユーザー受容）充足 → **Stage 3 開始**。
- RETROSPECTIVE 追記（同源盲点・多視点の有効性・q085 型の教訓）。

## 落とし穴（Session 73 の教訓）

- workflow runtime は `args` を JSON 文字列で渡す → `const A = typeof args==='string'?JSON.parse(args):args`。workflow 内は fs 不可 → agent に絶対パスを渡して Read させる。
- subagent は PNG/PDF を視覚 Read 可（検証済）。**PDF 答案表は行ずれ誤読しやすい**（L-ext q073 で発生）→ 答案は answer_keys を信頼、PDF 再読時は前後行も確認。
- verifier agent は時に不整合（架空行/過少）→ 重要判定は主ループ直接視認で裁定（Session 73 q019 で実施）。
- 2010h22h は page_image とページ番号が系統1ずれの既知ケース。
- has_figure 整合は「全直積（has_figure×figure_path×file×stem参照）」で全量チェック済（Stage 2.6）。本 Stage はテキストのみ。

## Stage 2.6 の流用可能スクリプト

- `scripts/stage026-phaseC-sample.mjs`（層化サンプラ、再CI に流用）。
- `scripts/stage026-phaseC-ci.mjs`（Wilson CI）。
- 照合/転写/適用は新規（`stage027-*`）。Phase C の l1l2/adjudication プロンプトが転写ロジックの雛形。
