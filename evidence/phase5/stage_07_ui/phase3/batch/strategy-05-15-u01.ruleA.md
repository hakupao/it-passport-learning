# Rule A 全数抽検 — strategy-05-15-u01 (設計・開発を支える工学技術)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (S149 b46)、repo HEAD `9fbf4e86` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b46-u01-a1` merge 結果、sha256 先頭 `17e71350a7501c6a`)。
- **対象**: `data/ip/textbook/units/strategy-05-15-u01.json` (textbook-unit-v2)、用語 **3 / 3 = 全数** (コンカレントエンジニアリング / シミュレーション / センシング技術) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/strategy-05-15-u01/v1-original.json` (用語 3 語・`term_zh`・`term_en` とも v1 / manifest `v1_terms` と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 3 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (compare static ×1、flow steps ×2 の label・cell・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 5 件 = exam 2 + mix 3、qid 付き 2 件、引用 qid 延べ 6 件 = 異なり 6 題、全題 topic `strategy-05-15`)**: `questions.json` から題文 (OCR 崩れのある 2 題は translations の `stem_jp_clean` で判断)・選択肢・`correct_answer` を再読。シミュレーション・センシング技術は `term_questions` 0 題 (manifest) で、考点は mix のみ・quiz 空 — 規定どおり。
3. **quiz / challenge_questions**: quiz = コンカレントエンジニアリングの 3 題 (2017h29a-q017 / 2012h24h-q003 / 2026r08-q018、全て考点で引用済)。challenge 4 題のうち本文で未引用は 2022r04-q032 (適用後の業務の流れの図を選ぶ題、正答 = 工程の矢印が少しずつずれて重なる図; 誤答 = 直列のみ・後工程から前工程へ戻る線のある図 2 種)。図 (`data/ip/exams/figures/2022r04-q032.png`) を目視: 本文の fig compare b 列「工程どうしの期間を重ね合わせる」、analogy (詰め終わった箱から積み始める)、detail「手戻りも減る」で正答を選べ、戻り線の図 (誤答) を選ばせる記述はない。hook「複数の流れが同時に走る」をこの図に当てても誤答 (直列 / 戻り線) を選ぶ方向には働かない (D-208 (9) 該当なし)。
   - 未引用の term_questions 5 題 (CAD の説明・効果: 2014h26a-q013 / 2015h27a-q023 / 2017h29h-q016 / 2019r01a-q014 / 2020r02o-q024) も照合: mix 考点「CAD = コンピュータで設計を行う、設計データを共有しやすくする道具」は各正答 (設計にコンピュータを用いる / 設計図面の共有・再利用 / 設計データの再利用) と一致。2015h27a-q023 の誤答 (生産ラインの温度センサで温度を監視・制御) と 2019r01a-q014 の誤答 (光を電気信号に変える撮像素子) はセンシング技術・センサの一般的な説明と重なるが、両題は「CAD はどれか」を問う題で、本単元のセンサ定義はその内容自体としては正しく、CAD と取り違えさせる記述はない (D-208 (6) 該当なし)。
4. **D-198 写し**: validate の copy guard = 0 件 (choice-echo warn も 0)。独立照合: 単元の JP 文字列 70 本 (派生フィールド除く、図 label・caption・cell・総表・対比表を含む) を topic 内全 34 題の題文 (`stem_jp_clean` 優先) + 選択肢と 12 字連続照合 (句読点・記号・空白除去)。
   - カタカナ 4 字以上 + 英数を □ に遮蔽 (遮蔽後実字 6 未満の窓は除外): **0 件**。
   - 遮蔽なし: 7 件、全て見出し語「コンカレントエンジニアリ…」の 12 字窓 (用語名は表現ではない) → 偽陽性。
   - 近似照合 (14 字窓 × 題の全 14 字窓の編集距離 ≤3): 見出し語を含む窓を除くと `terms[0].one_jp`「…並行して進め、開発期間を短縮する手法」↔ 2012h24h-q003 題文 (窓 ed 2/14) のみ。文単位では ed 0.78 / Dice 0.27 (較正 HIGH 例 ed 0.14 / Dice 0.52 から遠い)。同題は「どの手法か」を問う分類題で、一致部は CE の標準的な一般定義 (並行して進め期間を短縮する) であり、題の作業工程の列挙 (技術開発・機能設計・ハードウェア設計・試作・製造準備) や「手戻りや待ちをなくして」の組・順序は one に持ち込んでいない (D-209 の除外に当たる)。2017h29a-q017 正答エとの文単位も ed 0.77 / Dice 0.31、`points[1]` vs 同正答 ed 0.94 / Dice 0.13。`key_points_jp[0]` vs 2012h24a-q028 (題文 + 正答) は ed 0.61 / Dice 0.55 だが、一致の大半は見出し語 14 字と「目的…開発期間の短縮」= 目的を問う単純題の正答そのものの事実で、誤答肢 (標準化・強みを生かす・歩留り) の組や順序は含まない → 写しではない。
   - 前回 jp-review r1 MEDIUM (`terms[0].points[1]` が 2015h27h-q031 題文の 3 要素 [前工程の完了を待たない / 着手可能なものから後工程 / 工程間で設計情報を共有] を節ごとに言い換え) → 現行 `points[1]` は「複数の工程を時間的に重ね、関係する部門が協働して製品を開発する進め方」で 3 要素の組を持たない (文単位 ed 0.92 / Dice 0.07)。同 LOW の detail も「設計や製造などの部門が初期から協働し、製造のしやすさなどを設計に早めに反映する」に改まり ed 0.85 / Dice 0.09。図 compare b 列「始められる作業から…」も「工程どうしの期間を重ね合わせる」に変更済。**解消、回帰なし**。
   - カタカナの多い文 (CE の one / points / fig a・b、CAD の mix) を目視: 一致は見出し語のみ。
5. **D-195**: one = 1 文 × 3 (太字あり)、detail 2/3/3 文、比喩・フックは定義の言い換えでない別の場面 (引っ越しの積み込み / 間取り図の紙の切り抜き / 目・耳・皮膚) と語源の手がかり。定義前使用: 手戻り = CE detail 内で定義、モデル = シミュレーション detail 冒頭で定義、センサ = センシング detail 冒頭で定義、CAD = mix 考点内の同格説明、試作評価 = 考点内の関係節で説明。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が; zh 考试 / 必须 / 记住; en must / exam / always) → 「覚え」3 件 (`terms[1].hook_jp` + 派生 `memory_hook_jp` + `summary.memory_hooks_jp[1]` = 同一文 1 件)、zh「记成」3 件 (同)、"exam" 2 件 (`kind:"exam"` のフィールド値) のみ → 定型締め句 0。図の型: compare static (直列 / CE 3 行 key 1)・flow steps 4 ×2 — 全て登録内。pair 配置: シミュレーション / センシング技術 1 組 2 行 key 1 (後の用語の後)。
6. **D-200**: 考点数 3/1/1 (≤3 ✓)、各 JP 1 文・字数 46 / 54 / 78 / 53 / 74 (≤100 ✓)。framing 件数 (validate `pointFraming`): jp 0 / zh 0 / en 0。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の整合): センシング points[0]「受け持つのはデータにするところまで」と detail「得られたデータは自動制御・見守り・モデルの条件設定などに使われる」(受動、利用主体はセンシング外)・fig step 4・analogy (脳が判断) は一致。シミュレーション detail のモデル (数式・データ・縮小模型など) と fig step 1・3 (数式・コンピュータ上の模型 / 計算で求める) は図が一例に絞っているだけで矛盾しない (L4)。CE の key_points[0]「部門間の協働と手戻りの削減がそれ (期間短縮) を支える」は detail と一致。→ 不整合 0。書き方 8 → §3 末尾の列挙。書き方 9 (限定条件) → §2 表に記載、落ち 0。§6 → 指摘なし。§9 言い直し → L2。
8. **D-205**: 本単元は改訂のある文書・規格・法令・知識体系の構成要素の数や名称に依拠していない (センシングの物理量は「温度・圧力・光など」と例示)。一次資料照合の対象なし。D-210 (改正前の文言の題) も該当なし。
9. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 7 種 (コンカレントエンジニアリング / 手戻り / 開発期間 / シミュレーション / 試作評価 / センシング技術 / センサ) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 3 用語に見出し語の `[[jp:]]` あり、zh 訳語 (并行工程 / 仿真 / 传感技术) が `zh_terms.json` と一致 (他の語は表に項目なし; B6 warn 0)。
10. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (3 / 3)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | コンカレントエンジニアリング | OK — exam 2 / 6 題 + mix 1: 採る目的は開発期間の短縮 (2012h24a-q028 正答ア / 2014h26h-q028 正答ア / 2026r08-q018 正答ア「開発期間や納期の短縮」; 誤答 = 標準化・強みを生かす開発・歩留り向上・性能 / 品質向上・セキュリティ・省エネ・最新技術 を支持する記述なし。q018 の「納期」を落としているが、目的を開発期間側で言い切るのは正答と一致し範囲を閉じない) / 複数工程を時間的に重ね、関係部門が協働する進め方 (2015h27h-q031 正答ウ / 2012h24h-q003 正答イ / 2017h29a-q017 正答エ; 誤答 FMS・MRP・JIT・IE・VE・リバースエンジニアリング・BPR・実験計画法 を支持しない。q031 は 3 要素を題文に持つ分類題だが考点は一般定義のみ、§1-4) / mix: CE = 進め方、CAD = 設計データ共有で支える道具 (未引用の CAD 5 題の正答と一致)。fig compare 3 行 (前の工程が終わってから次へ / 重ね合わせる、区切りで引き渡す / 早い段階から共有、合計 / 重なった分だけ短く) は one・detail と一致、2022r04-q032 正答図とも整合 | OK | en の訳語ゆれ L5 | L1 (hook) / L5 |
| 2 | シミュレーション | OK — 関連題 0 (mix 1): 試作評価 (実物の試作品で試す) とはモデル上で結果を求める点で分かれる — 一般的な区別で正しい。detail のモデル定義 (数式・データ・縮小模型など)、試作の回数・費用・期間を抑える、危険・反復困難な条件も試せる — 正しい。flow steps 4 (モデル化 → 条件 → 実行 → 設計に反映) は one と一致 | OK | OK | L2 / L4 |
| 3 | センシング技術 | OK — 関連題 0 (mix 1): 受け持つのは測ってデータにするまでで、判断・予測は受け取る分析 / 制御の仕組み — 一般的な役割分担で正しい。センサ = 変化を感じ取り電気信号に置き換える部品 — 正しい (2019r01a-q014 誤答ウの撮像素子の説明と同趣旨だが、同題は CAD を問う題で矛盾ではない)。flow steps 4 の step 4 caption が境界を明示 | OK | detail 3 文目の代名詞 L3 | L2 / L3 |

**単元レベル**: goals 3・overview_cols 2 (扱うもの / 主な効果)・overview_rows 3 行・pairs 1 組 (シミュレーション / センシング技術 2 行 key 1)・key_points 3・summary (記法除去版と一致)・challenge_questions 4 件 (2012h24a-q028 / 2014h26h-q028 / 2015h27h-q031 / 2022r04-q032 — 本文と矛盾なし、§1-3)。事実誤りなし、三語の事実一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 6 (うち 建议修 1)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW | `terms[0].hook_jp/zh/en`、`terms[1].hook_jp/zh/en` (+ 派生 `memory_hook_*`, `summary.memory_hooks_*[0..1]`) | jp / zh は「concurrent は『同時に走る』という意味の英語」「simulate は『似せる・まねる』という意味の英語」と英語の意味として述べ、en は Latin の語源 (concurrere = running together / similis = like) に置き換えている (loc-review r1 で記録済)。concurrent の現代英語の意味は「同時に起こる」で「走る」は語源側の像。語源・意味とも誤りではなく、hook は 2022r04-q032 で誤答を選ばせない | 記録のみ |
| L2 | LOW | `terms[1].points[0].text_jp/zh/en`、`terms[2].points[0].text_jp/zh/en` + `terms[2].fig.steps[3].caption_*` + `terms[2].analogy_*` | シミュレーションの mix 考点 (実物を使わずモデル上で) は one の「実物を…代わりにモデルを使って」の言い直しに近い。センシングの境界 (データにするまで、判断は受け取る側) は考点・図 step 4・analogy の 3 箇所 (D-203 §9、jp-review r2 で記録済)。関連題 0 の用語で、矛盾・誤りなし | 記録のみ |
| L3 | LOW **建议修** | `terms[2].detail_zh` / `terms[2].detail_en` (3 文目) | jp 3 文目は主語省略 (= センシング技術) だが、zh「它是…」/ en "It is the technology…" は直前文の主語「得到的数据 / The resulting data」を指すように読める (loc-review r1 LOW が未修)。誤学習には至らないが補丁 1 語で解消 | zh「它是把现实情况以数值形式采集进来的技术，相当于数据利用的入口。」→「传感技术是把现实情况以数值形式采集进来的技术，相当于数据利用的入口。」/ en "It is the technology that brings the real world in as numbers, the entry point for putting data to use." → "Sensing technology is what brings the real world in as numbers, the entry point for putting data to use." (jp は変更なし; 派生 `explanation_zh/en` は自動追従) |
| L4 | LOW | `terms[1].fig.steps[0].caption_*`, `steps[2].caption_*` | detail はモデルに縮小模型を含めるが、図は「数式やコンピュータ上の模型」「計算で求める」に絞る。図は代表的な一例で矛盾ではない (D-204 の図の範囲が one / detail と食い違う、には当たらない: 図は否定していない) | 記録のみ |
| L5 | LOW | `terms[0].points[0].text_en` | 開発期間を "development period" と訳し、overview・one・key_points の "development time" と揺れる (loc-review r1 記録済) | 記録のみ (任意: "development period" → "development time") |
| L6 | LOW | `pairs[0]` | シミュレーション / センシング技術は取り違えやすい組というより補完関係 (センシングの値をモデルの条件に使う; detail にも明記)。関連題 0 で取り違えのデータなし (jp-review r1 / r2 記録済)。表の内容は正しい | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 直列 / CE: `terms[0].fig` rows[0..2]、detail 1 文目、one の「順番待ちにせず」(定義そのもの) → 許容。② シミュレーション (モデル上の現象・予測) / センシング (現実の物理量・実測値): `pairs[0].rows[0..1]`、`overview_rows[1..2].extra` (総表の構造) → 許容。③ シミュレーション / 試作評価: one と mix 考点 → L2。④ CE (進め方) / CAD (道具): mix 考点のみ → 許容。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。「並行設計・模擬実験・センシング」の言い換え 3 つの連なりで D-197 の形に近いが validate 対象外フィールドで、事実は正しい。
- O2 `hook_zh` 3 件が半角 "…" の引用符 (loc-review r1 記録済、標点のみ)。`key_points_zh[0]`「部门间的协同和返工的减少支撑着这一点」は直訳調 (同記録済)。
- O3 独立 copy 照合のヒットは見出し語窓 7 件と標準定義句 1 件 (§1-4) の偽陽性のみ。CE の 12 題中 CAD 5 題を本単元は mix 考点 1 件で扱う (jp-review r1 LOW 記録済) が、内容は正答と一致し誤りではない。

確認済みで問題なし: 限定条件 (考点 5 件、§2)、前回 MEDIUM (2015h27h-q031 の題文 3 要素の言い換え) の解消と回帰なし、D-208 (1)〜(10) 各型 (option tracing なし・など落ちなし・別名を別物として教えるものなし・比喩 / 図の範囲矛盾なし・zh / en の回帰なし・zh / en の誤答肢寄りの訳なし・改正前の文言の題なし・他見出し語の語幹を比喩の鍵語にしていない・hook が誤答を選ばせない・法令 / 規格の閉じた列挙なし)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 (validate 0)、D-200、D-205 該当なし、`[[jp:]]` 原語 7 種実在、one_zh / one_en の見出し語併記 (3/3)、zh 訳語表、図種 (登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **6** (建议修 1: L3 / 記録のみ 5: L1・L2・L4・L5・L6) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 3 用語・考点 5 件 (qid 付き 2 件)・引用 6 題 + 未引用の challenge 1 題 (図題) + 未引用 term_questions 5 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。前回 jp-review の MEDIUM は解消済み。LOW 建议修 1 件 (L3) は補丁 (B3) で修正推奨、他はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-15-u01
✓ strategy-05-15-u01 unit: 0 issues (data/ip/textbook/units/strategy-05-15-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-05-15-u01
✓ strategy-05-15-u01 parity: 21 locations, 0 diff
EXIT=0
```
