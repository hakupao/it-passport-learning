# Stage 2.6 — Phase A 全量センサス トリアージ

> 全 2,900 題に L3/L4/L6 を決定的スクリプト (`scripts/stage026-census.mjs`) で適用。
> 生成: `stage_026_census_L3_contamination.json` / `_L4_figref.json` / `_L6_distribution.json`。
> 本書 = フラグの全件トリアージ（D-119 ゲート条件 1）。

## L3 — 跨题重复/汚染

| シグナル | 件数 | 判定 | 根拠 |
|---|---|---|---|
| choice-set 衝突 `shared_choices_diff_stem` | 69 | ❌ **全件誤検出** | 選択肢が短い共通トークン（数字 `1/2/3/4`、PDCA `P/D/C/A`、組合せ `a,b,c`）の問題が偶然一致。設問は別物。標本確認 3 群で確証。 |
| stem_pairs `near_identical_reuse` / `high_stem_overlap`（年度跨ぎ） | 7 | ❌ **正当な再出題** | サニタイジング(`2016h28h-q064`↔`2026r08-q095`)、ハッカソン(`2019r01a-q019`↔`2026r08-q004`)等。IPA は過去問を年度跨ぎで再利用。選択肢順違いで答案記号のみ相違、各々内部整合。 |
| stem_pairs **同回内ほぼ同一・答案違い** | 2 ペア | ⚠️ **要 PDF 照合** | `2018h30h-q010`↔`q100`(著作権, 答案 イ/ウ)、`2018h30h-q006`↔`q008`(非機能要件, 答案 ウ/エ)。同一回に同設問は異常。重複抽出 or 答案誤りの疑い → 深核行き。 |
| **stem 表紙ボイラープレート汚染**（専用全量スキャン） | 4 | ⚠️ **真の欠陥・新類** | `2010h22h-q045`/`2011h23tokubetsu-q045`(本文消失・表紙のみ)、`2009h21a-q099`(本文+q100+表計算仕様付着)、`2018h30h-q001`(表紙prefix+本文)。→ 深核で真 stem 復元。 |

→ L3 の自動シグナルのうち**汚染を示す有用フラグは「同回重複 2 ペア + 表紙汚染 4」のみ**。choice 衝突と年度跨ぎ reuse は系統的に良性。

## L4 — 図文引用整合性

| シグナル | 件数 | 判定 |
|---|---|---|
| `orphans`（has_figure=true・figure_path 欠落） | 16 | ⚠️ 既知シードと一致。深核で図抽出 or 降格判定。 |
| `ref_but_no_figure`（図/表強参照・has_figure=false） | 32 | ⚠️ 図欠落候補。ただし大問 sibling が共有図を参照する正当ケースを含む → 深核で個別判定。 |
| `figure_but_no_ref`（図あり・文中参照なし） | 87 | ◯ 大体良性（図が選択肢側 or 大問共有）。低優先、抽样でスポット確認。 |

## L6 — 答案分布 + 構造

| 指標 | 値 | 判定 |
|---|---|---|
| 総題数 | 2,900 | ✅ |
| 100題/套 | 29/29 | ✅ |
| 空 stem / 空 choice / 不正 answer / choice キー異常 | **0** | ✅ 構造完全クリーン |
| global 答案分布 ア/イ/ウ/エ | 667/741/780/712 | — |
| global χ² (df=3) | 9.40 | ◯ p≈0.024、軽度偏斜。IPA 実答案は厳密一様でなく許容範囲。 |
| 套別 χ² p<0.05 | 2 套 | ◯ 偶然変動の範囲、構造異常なし。 |

→ L6 は系統的構造欠陥ゼロ。答案分布の軽度偏斜は IPA 原データ由来で受容。

## Phase A 結論 → Phase B/C 深核ワークリスト

画像照合が必要なフラグを `scripts/stage026-build-worklist.mjs` で統合 → `data/ip/exams/.tmp/s026/deep_worklist.json`（**53 unique qid**、全件 page_image 実在確認済）:

| reason | 件数 | lens |
|---|---|---|
| has_figure_orphan | 16 | L4_verify_figure |
| figref_no_figure_flag | 32 | L4_verify_figure_missing |
| stem_boilerplate_contamination | 4 | L1_recover_stem |
| same_exam_near_dup | 4 (2ペア) | L2_verify_dup |

これに加え Phase C で **層化ランダム N≈100（L1+L2）** と **L-ext 外部交叉 ~30**、既知シード「0↔9 数字 ~30」「不整合 ~14 @2015h27h/2022r04」を深核。
