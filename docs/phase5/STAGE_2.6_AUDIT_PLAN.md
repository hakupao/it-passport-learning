# Stage 2.6 — データ実測審核 実行計画

> **これは次セッション(Session 72)が実行する仕様書**。決定根拠は `docs/decisions/D-119-stage-2.6-data-audit.md`。
> **フェーズ**: 実施阶段（コード可、TDD/Tier 3 証拠遵守）。

---

## 目的

question_bank.json（2,900 題）の真の正確度を**信頼区間付きで実測**し、系統的欠陥を除去する。Stage 3 着手前のゲート（D-119）。

**真相源の階層**: 答案 key のみ IPA 公式 PDF 由来（外部真相あり）。他字段は同源（Claude vision 抽出＝Claude vision 検証）のため、本審核は**未使用の視点**と**外部源**で同源盲点を破ることを主眼とする。

---

## 視点（レンズ）一覧

### 全量センサス（全 2,900 題・スクリプト・決定的）

| ID | 視点 | 方法 | 出力 |
|----|------|------|------|
| **L3** | 跨题重复/汚染 | 全 stem を正規化し pairwise 類似度（例: 文字 n-gram Jaccard / Levenshtein 比）。異なる qid 間で stem 類似度高 or choice-set ほぼ一致を flag（q026 型の串題検出） | 疑似ペア降順リスト |
| **L4** | 図文引用整合性 | stem を正規表現で走査: `図|表|グラフ|フロー|回路|ネットワーク|次の(図|表)|下記|以下の(図|表)|図\d|表\d` ⟺ `has_figure` 真 かつ `figure_path` 存在。双方向の不一致を flag | 「図と言うが図なし」「図ありと言わぬが has_figure」両リスト |
| **L6** | 答案分布異常 | 全体 & 套別の ア/イ/ウ/エ 頻度、χ²。極端偏斜の套を flag。構造再チェック（100/套、空 stem/choice/answer ゼロ、choice キー={ア,イ,ウ,エ}、answer∈{ア,イ,ウ,エ}） | 分布表 + 異常套 |

→ L3/L4/L6 は N に関係なく**系統的錯位を一網打尽**にする。まず全量で走らせ、フラグを全件トリアージ。

### 抽样深核（N サンプル + 95% CI・reasoning/画像・高コスト）

| ID | 視点 | 方法（1 題 1 agent、画像 Read 可） | 検出 |
|----|------|------|------|
| **L1** | 再解答→答案逆検査 | agent が stem+choices(+figure) を読み**独立に解答**→ key と比較。不一致を flag | stem 汚染 / answer 誤 / figure 誤 |
| **L2** | 跨字段語義整合性 | agent が stem+choices+answer+figure を見て「全て同一問題として整合するか」判定 | q026 型串題 / choice 混入 |
| **L5** | 数字/単位完整性 | 計算・数値題で源ページ画像から数字を**再読**し JSON と diff（0↔9 等） | 数字誤識 / 単位欠落 |
| **L-ext** | 外部源交叉核対 | サブサンプルを IPA 公式/解説站から取得（WebSearch/Fetch）し stem/choices/answer を diff。**同源盲点を破る**（D-119 許可、審核用・非分発） | 同源で見逃した全種 |

### サンプリング設計

- **基本 N = 100〜120 題**、29 套で層化（≈3-4/套）+ **図表題・計算題をオーバーサンプル**（欠陥密度が高い層）。
- N=100 で critical 欠陥率の 95% CI は概ね ±6〜9%（p に依存）。**一発で正確な数字を出すより、ラウンド反復で欠陥類を枯らすのが本旨**（D-119: loop-until-no-new-class）。
- L-ext は別途サブサンプル（例 30 題）で十分（外部取得コスト高、同源盲点の有無を見るのが目的）。

---

## 既知シード（最初から審核対象に織り込む）

- **has_figure 孤児 16 件**: `data/ip/exams/.tmp/repair/orphan_has_figure_no_path.json`（has_figure=true だが figure_path 欠落）。→ L4 が全量で再確認。図表抽出 or 降格を判定。
- **題幹-選択肢不整合 ~14 件 @2015h27h, 2022r04**: STATE Session 68 の残存課題記載。→ L2 の重点套。
- **0↔9 数字誤識 ~30+ 件**: 計算題集中。→ L5 の重点。
- **q026 型 stem 汚染**: 既に 1 件修正済。→ L3 が兄弟ケースを全量検出。

---

## 欠陥タクソノミ（マトリクス列）

`qid, lens, defect_class, severity, evidence(page), action, fix_detail`

- **defect_class**: `stem_contamination`(串題) / `stem_ocr` / `choice_ocr` / `choice_swap` / `answer_wrong` / `numeric_error` / `figure_wrong` / `figure_ref_mismatch` / `has_figure_orphan` / `other`
- **severity**: `critical`（正しい学習内容を変える＝学習者が誤る）/ `minor`（表示上の typo、意味不変）
- **action**: `fixed`（原値 backup + フラグ）/ `archived`（要ユーザー裁決）

---

## 修復方針（D-119）

- 原 PDF 対照で**逐字確認できる確実な欠陥** → 即時修正。原値を `<field>_corrupted_backup` に温存、`<field>_corrected_s72=true`。question_bank.json + 該当 by_year/*.json 両方を更新。
- **曖昧/要判断** → マトリクスに帰档しユーザー裁決待ち（自動修正しない）。
- **Rule D**: 抽出と異なる agent type で審核（estimate=general-purpose は使わない）。修正(writer)と再検証(reviewer)を別 lane に。

---

## Stage 3 開始ゲート（D-119、全充足で通過）

1. L3/L4/L6 全量フラグを全件トリアージ済（fixed or 意識的受容）。
2. 抽样深核が「新欠陥類ゼロ」ラウンドに収束、critical 欠陥率の実測値+95% CI を記録、ユーザー受容。
3. 既知シード（孤児16 / 不整合~14 / 0↔9 ~30）解消。
4. Tier 3 証拠が `evidence/phase5/stage_026_*` に揃う（audit matrix + CI 計算 + Rule A/D 独立審核）。

---

## 証拠レイアウト（Tier 3）

```
evidence/phase5/
├── stage_026_census_L3_contamination.json   # 全量類似度ペア
├── stage_026_census_L4_figref.json          # 図文引用不一致
├── stage_026_census_L6_distribution.json    # 答案分布 + 構造
├── stage_026_sample_audit.md                # L1/L2/L5/L-ext 抽样結果 + CI 計算
├── stage_026_defect_matrix.csv              # 全欠陥台帳
└── stage_026_retro.md                       # 収束記録 + 受容判断
failures/                                     # 失敗 attempt（Rule B）
```

---

## 実行順序（推奨）

1. **全量センサス L3/L4/L6** をスクリプトで一括（速い、系統錯位を即可視化）→ フラグ triage。
2. **既知シード**を L1/L2/L5 で深核（孤児16 / 不整合~14 / 0↔9）。
3. **層化ランダム抽样 N≈100** を L1+L2 で深核（workflow 並列、Rule D agent）。L5 は数値題サブサンプル。
4. **L-ext** で別サブサンプル ≈30 を外部交叉核対。
5. 欠陥を D-119 方針で処理（即時修 or 帰档）。
6. **収束判定**: 新欠陥類が出たラウンドがあれば修正後もう 1 ラウンド。ゼロになったら CI を確定。
7. ゲート 4 条件を満たしたら **Stage 3 へ**。

---

## メモ（前セッションの教訓）

- **workflow runtime は `args` を JSON 文字列で渡す** → スクリプト先頭で `const A = typeof args==='string'?JSON.parse(args):args` 必須。
- **agent は表の上端/最右を過小評価しがち**（図表審核で判明）→ 数値/境界の再読は明示指示で。
- **subagent は PNG を視覚的に Read 可能**（検証済）。
- 既存ヘルパ: `scripts/repair-*.mjs`（per-figure 入力生成・workflow オーケストレーション・finalize のパターンが流用可能）。
