# ecal2 植錯較正セット — 準備記録 (S131, D-173 (b))

目的: 解説監査者 (`scripts/quiz-phase2-ruleA.workflow.mjs`, opus, agentType pr-review-toolkit:code-reviewer) の型別再現率・誤報率を測る植錯 (seeded errors) 入力の準備。
植錯 agent = ecal2-prep (oh-my-claudecode:executor)。監査者・採点者とは別 subagent_type (Rule D)。
**本ファイルには植錯した id・植錯内容を書かない** (seal は監査後に開示)。

## プール
- 源: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S130_eaudit_pilot.json` (100) + `ruleA_result_S130_etgt.json` (200) の audits[]。
- accurate=true = 294 id (97 + 197。依頼文の「296」ではなく実数 294)。accurate≠true 6 id を除外。
- S130 n9/n9b で書き換えた id (2011h23tokubetsu-q093/q095, 2016h28a-q098, 2020r02o-q094, 2009h21a-q096, 2014h26h-q096, 2015h27h-q096, 2015h27a-q021) を除外。accurate かつこの集合にあったのは 2011h23tokubetsu-q095 の 1 件だけ。
- プール = 293 id (has_figure 138)。

## 抽出 (決定的)
- PRNG mulberry32、seed 131。has_figure 層から 30、非図層から 70。各層の中では exam の順序を seed で混ぜ、exam 内の id も seed で混ぜてから、exam を巡回して 1 件ずつ取った。
- 結果: 100 id、図 30 / 非図 70、29 exam すべてを含む。
- 植錯 60 / 対照 40 の割付も同じ PRNG の続きで、図の層ごとに行った (図: 植錯 18・対照 12、非図: 植錯 42・対照 28)。
- 入力の sample 順も同じ PRNG で混ぜた。入力 meta の `seed: 130` は prep script の既定値で、`--ids-from` を使ったため抽出には効いていない (抽出の seed は 131)。

## 入力の生成
- `data/ip/quiz/.phase2/ecal2_ids.json` (ids 100 件) を作り、`node scripts/quiz-expl-audit-prep-S130.mjs --ids-from data/ip/quiz/.phase2/ecal2_ids.json --out-prefix ecal2_base --label ecal2` を実行。これは現行 corpus の explanations (S130 是正後の状態) を読む。
- base はコピーを scratchpad に移し、`.phase2/` からは消した (監査者が base と diff できないようにするため)。

## 植錯の規則と件数
- 型は 5 種 × 12 件: M1 誤答説明の理由が題幹・選択肢の前提と矛盾 / M2 対応付けの取り違え (番号・記号・表の行列・ラベル) / M3 数値・計算の誤り / M4 用語・概念の混同 / M5 正解根拠のすり替え (正解の字母は変えない)。
- 型別の図問題の件数: M1 3 / M2 8 / M3 6 / M4 1 / M5 0 (計 18)。図問題の M2・M3 は図や表の値・位置を使った誤り。
- 誤りは 1 問に 1 つ。同じ誤りを jp・zh・en の 3 言語すべてに入れた (60 件すべてで 3 言語とも変更を確認済み)。
- 書き換えた field: correct 20 / distractors 39 / points 3 (field 数の合計は 62。2 問は同じ誤りを 2 つの field に入れた)。
- 変えていないもの: correct_answer, key_guard, stem, choices, figure 関連の field、それ以外のすべての field。

## 既知の限界 (採点時に考慮)
- `key_guard.note_jp` は変えていない。そのため、正しい根拠や計算値がそこに残っている問題がある。points[] や別の field に正しい値が書いてある問題もある。監査者は推論の再計算ではなく、field 間の不一致から誤りを見つける場合がある。points との重複は 2 問で同じ誤りを points にも入れて避けたが、key_guard 側との重複は残っている。
- M3 は、計算 1 行の値だけを誤りにしたものが多い (結論の字母は変わらない)。
- 監査者は repo 内の corpus (`data/ip/quiz/explanations/`) を読める。原理上は corpus と diff すれば植錯を見つけられるので、監査の prompt では corpus との照合を禁止しておくこと。
- 依頼された形のまま、すべての問題に植錯できた (きれいに入らず型を変えた問題・飛ばした問題はない)。

## ファイルと md5
| ファイル | md5 |
|---|---|
| `data/ip/quiz/.phase2/ecal2_input.json` (監査入力、100 sample、混ぜた順) | `91421070ee2a33f44d5e428627ea6273` |
| `data/ip/quiz/.phase2/ecal2_workflow_args.json` ({input_path, items[{id,has_figure}]}、入力と同じ順) | `da664df1d3151282e80b596ae9c933b7` |
| `data/ip/quiz/.phase2/ecal2_ids.json` | `0d551dca35d068330b929e1260496c71` |
| base (scratchpad、prep の出力そのまま) | `d208d8f78ff5405e97e4238114f3c91e` |
| seal (scratchpad、repo の外) | `3c1fdb9c11e18ea2e89ba0e415a8125f` |

## 自己検査 (入力と base を id 単位で比較)
- 差がある sample = 60。対照 40 は JSON として byte 一致。
- 植錯 60 件では、変わった leaf がすべて `explanation.*` の中にあり、seal に記した path の jp/zh/en と完全に一致した (それ以外の leaf に変化なし)。
- correct_answer / stem_jp / choices_jp / has_figure / figure_png / figure_page_png / key_guard は 100 件すべて不変。
- args の input_path は `ecal2_input.json` を指し、items の順は入力と一致する。入力と args に植錯を示唆する key や meta はない (`mutat` / `control` の文字列は corpus の英訳 (permutation, internal control) に元からあるもので、base と同じ)。
- corpus は不変: `git status --short` に data の変更なし。`data/ip/quiz/explanations/*.json` 29 ファイルの md5 は開始時と一致する。
