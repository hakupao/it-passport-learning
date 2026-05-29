# Stage 2.6 残作業 実行仕様（Session 72 → 次セッション handoff）

> **新セッションはこれを実行**。前提: Session 72 で Phase A/B + 全量複製スキャン + 内容欠陥17件修復（Rule D検証済）が完了。
> 全アーティファクトはディスク永続化済。フェーズ: 実施阶段（コード可、Tier 3 証拠遵守）。
> ultracode 想定 → **Workflow オーケストレーション**で並列実行推奨。

## 完了済（再実行不要）

- Phase A 全量センサス: `evidence/phase5/stage_026_census_{L3,L4,L6}*.json` + `stage_026_census_triage.md`。
- Phase B 深核 53件: `evidence/phase5/stage_026_sample_audit.md` + `data/ip/exams/.tmp/s026/phaseB_findings.json`。
- 全量複製スキャン: `data/ip/exams/.tmp/s026/dup_scan.json` + `dupcheck_findings.json`（dup 4件収束）。
- 内容欠陥修復17件（backup付き・Rule D検証PASS）: `evidence/phase5/stage_026_fixes_applied.md`。
- 欠陥台帳: `evidence/phase5/stage_026_defect_matrix.csv`。
- 決定: D-120（グループ共有図）・D-121（複製系統バグ）。

## 残タスク

### ① 図表フェーズ（D-120、Stage 2.6 内完結＝ユーザー決定）

入力: `data/ip/exams/.tmp/s026/figure_worklist.json`。

**(a) 単問固有図の裁剪（16件 `add_figure_single`）**: 各 qid の `source.page_image` から図/表を裁剪 → `data/ip/exams/figures/<qid>.png`、`figure_path`/`figure_bbox_pct`/`figure_type` 充填、`has_figure=true`。
- 既存パイプライン流用可: `scripts/repair-figures-prep.mjs` / `repair-figures-crop.mjs` / `repair-collect.mjs` / `repair-figures-finalize.mjs`（per-figure 入力→bbox推定→確定裁剪→検証 loop-until-dry）。
- **注意 `2009h21a-q093`**: Phase B 監査で「page-37 に図が見当たらない（空白）」と報告 → 裁剪前に隣接ページを再探索して真の図所在を特定。無ければ降格 or 帰档。
- **注意 `2010h22a-q072` / `q085`**: figure_path 既設だが has_figure=false の矛盾 → 既存 crop を検証し has_figure=true に統一（再裁剪不要かも）。
- `2018h30h-q100` / `2010h22a-q008`: dup修復で has_figure=true 復元済、真の問の図表（無線LAN設定表 / 初期投資額の表）を裁剪。

**(b) 連問共有図のグループモデル実装（10件 `shared_group` + 関連連問）**: D-120 に従い `data/ip/exams/groups.json`（group_id → {preamble_page, shared_figure path/bbox, member_qids[]}）新設。共有図は前文ページから1枚裁剪しグループに紐付け、member は複製せず参照。
- 連問グループ例: 2009h21a 問97-100 / 2009h21h 中問A(89-92)・中問B(93-96) / 2012h24a 中問A(85-88)・中問C(93-96) / 2011h23tokubetsu 問97-100。
- Phase B の no-defect shared_preamble 18件（2013h25a/2013h25h/2015h27a/2015h27h 等）も同グループに取り込み、L4 の figref_no_figure_flag を恒久解消。
- スキーマ: question_bank に `group_id`（任意フィールド）追加。Stage 4 JSON Schema（D-118）にも group 概念追記。

### ② Phase C — CI 算出（N≈100 full ＝ユーザー決定）

ゲート条件2（critical欠陥率の95%CI記録）に直結。Rule D: read-only `explore`/`code-reviewer`（抽出の general-purpose 不使用）。

- **L1 再解答逆検査**: 29套層化ランダム N≈100（図表題・計算題オーバーサンプル）。agent が stem+choices(+図) を独立に解き、answer_keys と比較。不一致を flag。
- **L2 跨字段整合性**: 同サンプルで stem×choices×answer×figure の語義整合を判定（q026/q008型の残存検出）。
- **L5 数値/単位**: 計算題サブサンプル ~30（既知シード「0↔9 誤認識」）で源画像から数字再読 diff。
- **L-ext 外部交叉**: 別サブサンプル ~30 を IPA 公式/解説站（WebSearch/WebFetch）と交叉核対（D-119 許可・審核用非分発）。同源盲点を破る。
- **CI 計算**: critical欠陥率の点推定 + 95%CI（Wilson）。`evidence/phase5/stage_026_sample_audit.md` に追記。

### ③ 収束判定 + ゲート + Retro

- **収束**: 新欠陥類が出たら修正後もう1ラウンド（loop-until-no-new-class）。Session 72 で duplicate_extraction/choice_swap が新出 → これらは収束済だが、Phase C で新類ゼロを確認。
- **ゲート4条件（D-119）**: ①センサス全件triage済 ✅ ②抽样収束+CI+ユーザー受容 ⏳ ③既知シード解消（孤児16=triage済/不整合~14=2015h27h確認/0↔9=L5）⏳ ④Tier3証拠 ⏳。
- 全充足 → **Stage 3 開始**。
- **RETROSPECTIVE**: `RETROSPECTIVE_phase5_stage2.6.md`（Rule C）— 同源盲点の教訓、複製バグ根本原因、視点多様化の有効性。

## 既知の落とし穴（Session 71-72 の教訓）

- workflow runtime は `args` を JSON 文字列で渡す → `const A = typeof args==='string'?JSON.parse(args):args`。
- subagent は PNG を視覚 Read 可能（検証済）。
- agent は表の上端/ヘッダ行を過小評価しがち → bbox は y1 を明示・余白増。
- 2010h22h は page_image ファイル名が印刷ページ番号と系統的に1ずれ（内容は一致）。図裁剪時に注意。
- correct_answer は answer_keys.json（IPA公式・スロット別）が真相源。図/stem 修復でも answer は触らない。
