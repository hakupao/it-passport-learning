# ecal3 植錯較正セット — 準備記録 (S131, D-174)

目的: prompt v2 (`prompt_version: 2`) の解説監査者の型別再現率・対照誤報率を、ecal2 と重ならない新しい植錯集合で測る (D-174)。
植錯 agent = ecal3-prep (oh-my-claudecode:executor)。ecal2 の植錯者とは別 run。監査者・採点者とは別 subagent_type (Rule D)。
**本ファイルには植錯した id・植錯内容を書かない** (seal は監査後に開示)。
独立性: ecal2 の script を流用するとき、ecal2 の `patches.mjs` の先頭 4 件 (型・field・書換え文) と `targets.json` の一部が画面に出た。ecal2 の seal 本体 (`ecal2_seal.json`) と採点結果 (`ecal2_scoring_S131.json` / `ecal2_seal_S131.json` / `ruleA_result_S131_ecal2.json`) は開いていない。session log の D-174 (v2 の追加検査項目) は依頼どおり読んだ。ecal2 の見逃しに合わせて植錯を調整することはしていない。

## プール
- ecal2 と同じ定義のプール 293 id (S130 pilot + etgt の accurate=true 294 から n9/n9b 書換え id を除く。draw script で 293 を assert) から、`data/ip/quiz/.phase2/ecal2_ids.json` の 100 id を除いた。
- プール = 193 id (has_figure 108)。

## 抽出 (決定的)
- ecal2 の draw script と同じ手順で、PRNG mulberry32、seed 132。has_figure 層から 30、非図層から 70。各層の中で exam の順序と exam 内の id を seed で混ぜ、exam を巡回して 1 件ずつ取った。
- 結果: 100 id、図 30 / 非図 70、27 exam (プールに残っていた exam の数)。
- 植錯 60 / 対照 40 の割付も同じ PRNG の続きで、図の層ごとに行った (図: 植錯 18・対照 12、非図: 植錯 42・対照 28)。入力の sample 順も同じ PRNG で混ぜた。
- 入力 meta の `seed: 130` は prep script の既定値で、`--ids-from` を使ったため抽出には効いていない (抽出の seed は 132)。

## 入力の生成
- `node scripts/quiz-expl-audit-prep-S130.mjs --ids-from data/ip/quiz/.phase2/ecal3_ids.json --out-prefix ecal3_base --label ecal3`。現行 corpus の explanations を読む。
- base は scratchpad に移し、`.phase2/` には残していない (監査者が base と diff できないようにするため)。
- args は `{input_path, items[{id,has_figure}], input_only: true, prompt_version: 2}`。

## 植錯の規則と件数
- 型は ecal2 と同じ定義で 5 種 × 12 件: M1 誤答説明の理由が題幹・選択肢の前提と矛盾 / M2 対応付けの取り違え (番号・記号・表の行列・ラベル・役割) / M3 数値・計算の誤り / M4 用語・概念の混同 / M5 正解根拠のすり替え (正解の字母は変えない)。
- 型別の図問題の件数: M1 1 / M2 8 / M3 4 / M4 3 / M5 2 (計 18)。図問題の植錯は、題幹 (stem_jp_clean の図の文章化) と図から確かめられる値・位置・対応を使った。
- 誤りは 1 問に 1 つ、field も 1 つ。同じ誤りを jp・zh・en の 3 言語すべてに入れた (60 件すべてで 3 言語とも変更を確認済み)。
- 書き換えた field: correct 16 / distractors 36 / points 8 (計 60)。
- 変えていないもの: correct_answer, key_guard, stem, choices, figure 関連の field、それ以外のすべての field。
- 依頼された形のまま 60 件すべてに植錯できた (飛ばした問題はない)。

## 内部の手掛かり (has_internal_clue)
- seal には問題ごとに `has_internal_clue` を記した。true は、植錯した field 以外の explanation field (key_guard.note_jp / points / correct / distractors) に正しい値や根拠がそのまま残っていることを示す。
- 手掛かりのない場所を優先して植錯したが、残ったものもある。植錯 60 件のうち true は 30 件、false は 30 件。型別の true の件数: M1 7 / M2 8 / M3 1 / M4 2 / M5 12。
- M5 は 12 件とも true になった。正解の根拠は points[] や key_guard に言い直されていることが多く、そこを変えずに正解根拠だけをすり替えると、正しい根拠が他の field に必ず残るため。
- 植錯した field の中の別の文に正しい値が残っている問題が 6 件ある (seal の `has_intra_field_clue`)。採点では、手掛かりのない部分集合 (has_internal_clue=false) の再現率を別に出すこと。

## 既知の限界 (採点時に考慮)
- 監査者は repo 内の corpus を読めるが、args に `input_only: true` を入れてあるので、読める範囲は input と PNG に限られる (D-173)。
- 植錯した問題のうち 1 件で、植錯とは別の field に、元からある誤りの疑いを見つけた (seal の `preexisting_note_jp`)。監査者がその箇所を指摘しても、誤報として数えないこと。対照の 40 件では、元からある誤りを探していない。対照で medium/high の指摘が出たら、誤報と決める前に、その指摘が正しいかを確かめること。
- M3 には、計算 1 行の値だけを誤りにしたものが多い (結論の字母は変わらない)。
- 植錯のうち 2 件は、誤りの度合いの判定が割れうる (seal の `scoring_note_jp`)。監査者が low で返した場合の扱いを、採点の前に決めること。

## ファイルと md5
| ファイル | md5 |
|---|---|
| `data/ip/quiz/.phase2/ecal3_input.json` (監査入力、100 sample、混ぜた順) | `5be66daa62febbd9aff054bb036f6fd7` |
| `data/ip/quiz/.phase2/ecal3_workflow_args.json` | `995d39d30f3d9002c0d91bde3f037651` |
| `data/ip/quiz/.phase2/ecal3_ids.json` | `245f8c813d468c3f320518e57fb2e85e` |
| base (scratchpad、prep の出力そのまま) | `31cfe50c7889039eca1bd84cf191d720` |
| seal (scratchpad、repo の外) | `90985cdb17176ae36a33f6c54d1227c6` |

## 自己検査 (入力と base を id 単位で比較)
- ecal3_ids は 100 件で重複なし。ecal2_ids との共通部分は 0 件。100 件すべてが 193 件のプールから取ったもの。
- 差がある sample = 60。対照 40 は JSON として byte 一致。
- 植錯 60 件では、変わった leaf がすべて `explanation.*` の中にあり、seal に記した path の jp/zh/en と完全に一致した (それ以外の leaf に変化なし)。
- correct_answer / stem_jp / choices_jp / has_figure / figure_png / figure_page_png / key_guard は 100 件すべて不変。
- args の input_path は `ecal3_input.json` を指し、items の順は入力と一致する。入力と args に植錯を示唆する key や meta はない。leak 検査では `clue` と `control` の 2 語が見つかったが、どちらも corpus の英訳に元からある語 (base に `clue` 4 件、`control` 49 件)。`control` が 1 件増えたのは、植錯した 1 文の英訳に、corpus に元からある語が 1 回分加わったためで、植錯を示唆する語ではない。
- 植錯の位置は入力の前半と後半に 30 件ずつ。植錯が続く最長の長さは 7。
- corpus は不変: `git status --short` に data の変更は出ない (植錯適用の直後に開始時と一致することを確認。その後の差は、この記録ファイルと親 session の commit によるもの)。`data/ip/quiz/explanations/*.json` 29 ファイルと `questions.json` の md5 も開始時と一致する。
