# Rule A 全数抽検 — strategy-01-02-u04 (回帰・相関と擬似相関)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-10-29 (S138 b07)、repo HEAD `d9e6216` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b07-u04-a2` merge 結果、sha256 先頭 `69026908aff66b07`。監査開始時に 1 回だけ読み、scratchpad に写しを取って全照合をその写しで行った)。
- **対象**: `data/ip/textbook/units/strategy-01-02-u04.json` (textbook-unit-v2)、用語 **4 / 4 = 全数** (最小二乗法 / 回帰分析 / 相関と因果 / 擬似相関) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202、D-203 (session-137)、D-204 / D-205 (session-138 §2 / §6)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ、登録外図種の欠如は最大 low)。比較: `data/ip/textbook/.planning/v2/strategy-01-02-u04/v1-original.json` (用語 4 語・`term_zh`・`term_en` とも v1 と一致)。
- **前段の指摘**: `journal.b07-u04-a1.jsonl` (jp-review r1 REVISE medium 2 / r2 REVISE medium 1) と `journal.b07-u04-a2.jsonl` (jp-review r1 REVISE medium 2 / r2 PASS、loc-review r1 PASS low 3) の type:"result" を全件読んだ (§1-10)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 4 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_* / overview.intro_*`) が本体の記法除去版であることをスクリプトで確認 (三語 57 組を比較、不一致 0)。
2. **考点 × 引用題 (考点 全 7 件 = exam 3 + mix 4、qid 付き 3 件、引用 qid 異なり 3 題)**: `data/ip/quiz/questions.json` から各題の題文・選択肢・`correct_answer` を再読 (全題 topic `strategy-01-02`)。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化をしていないこと、題の場面・前提 (限定条件) を外していないことを 1 件ずつ確認。数値は自分で再計算: 最小二乗法の表 = 残差 +3 / −1 / −2 → 合計 0、二乗 9 / 1 / 4 → 合計 14 (一致)。相関 mix 考点 = |−0.9| > |+0.3| (一致)。
3. **quiz / challenge_questions** (quiz 計 4 枠 + challenge 3 題、うち本文の考点で未引用 1 題 = 2023r05-q006): 2023r05-q006 (販売数量を説明するパラメータを少数に絞る分析法 → 正答 主成分分析; 誤答 = ABC 分析・クラスター分析・相関分析) は 回帰分析 `points[1]` (mix: 主成分分析は多くの変数を少数の総合指標にまとめる、回帰分析とは目的が違う) で解け、相関分析を支持する記述はない (pairs[0].rows[0] は相関 = 関係の向きと強さを測る)。manifest の term_questions のうち本文・quiz とも未使用の 2 題も確認: 2024r06-q009 (フェルミ推定; 誤答ウ = 入出力データから因果関係を統計的に推定する手法) — 本単元は回帰分析を「因果を推定する」とはどこでも言わず、誤答を支持しない。2011h23a-q099 (要望の因果関係の順序付け) — 相関と因果 one「因果 = 一方が原因となって他方を引き起こす関係」と整合。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合として単元の JP 文字列 84 本 (図ラベル・セル・caption・総表・対比表を含み、派生フィールド除く) を topic 内全 98 題の題文 + 選択肢と 12 字連続照合 — (a) カタカナ 4 字以上と英数を □ に遮蔽 (遮蔽後の実字 6 未満の窓は除外)、(b) **遮蔽なし** の両方で実施 → **いずれも 0 件**。近似一致 (1〜2 字置換) は文単位 77 本 × 題側文単位 472 本で bigram Dice と正規化編集距離を計算 (校正: HIGH 例 ed 0.14 / Dice 0.52)。最終の緩い閾値 (Dice ≥ 0.30 または ed ≤ 0.50) でも **0 件**。カタカナの多い文は少ない (単回帰分析・重回帰分析・ゴルトン・spurious のみ) が目視でも題の文言なし。(iii) 具体例の流用: 擬似相関の比喩 (暑さで扇風機とかき氷が売れる) は 2011h23tokubetsu-q015 / 2024r06-q014 の「気温 × 売上・販売量」と素材が近い (a1 r1 で判断保留の記録あり) が、題は相関の向きの読み取り・回帰の手法名を問うもので、比喩は第三の要因の構造・別の商品・数値なし → 写しではない (L9 で記録)。最小二乗法の表 (+3 / −1 / −2)、回帰の比喩 (歩数と消費カロリー)、相関の比喩 (同じ電車の 2 人) はいずれも引用題に無い場面。
5. **D-195**: 結論先行 (one = 1 文 × 4、太字あり)、展開 2〜3 文 (3/2/3/2 文)、比喩・フックが定義の言い換えでないこと (回帰 = ゴルトンの語源、相関と因果 = 字義、擬似相関 = 「擬」の字義 + spurious; 最小二乗法は hook なし)、**定義前使用** (a1 の誤りの再発確認、§1-10)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → `freq_badge`「頻出」と `terms[0].analogy_jp`「場所を選ぶ」の通常用法のみ = 偽陽性; zh 务必 / 考试 0、「一定」2 件は「不一定有因果」の通常用法; en exam は `kind` 値のみ、must は detail_en「you must confirm」の通常用法)、図の型 (最小二乗法 = static table、回帰分析 = flow steps 4、相関と因果 = 図なし、擬似相関 = svg static; 全て manifest `figures.kinds` に登録内、steps 数 4 は 3〜4 の範囲内)、pair 配置 (回帰分析→相関と因果 は相関と因果の後、相関と因果→擬似相関 は擬似相関の後、各組 key 行 1)。
6. **D-200**: 考点数 1/2/3/1 (≤3 ✓)、各 JP 文数 1〜2・字数 41〜79 (≤100 ✓、最大は最小二乗法 `points[0]` の 79 字)。**framing 件数** (validate `exam_framing_outside_points` / `pointFraming`): jp 0 / zh 0 / en 0 (validate 0 issues)。D-197 羅列 (validate 0)。
7. **D-205**: 該当なし (改訂される文書 [規格・法令・ガイドライン・知識体系] の構成要素の数・名前の列挙なし)。qid に結ぶ加筆で限定を作っていないことも確認 (§2 の各考点)。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の「〜だけ」「〜ではない」の照合: 相関 mix 考点「負の相関は関係が弱いという意味ではない」は detail・key_points[2]「符号 = 向き、絶対値 = 強さ」と一致; 擬似相関 detail「一方を操作しても他方は変わらない」と pairs[1].rows[0]「直接のつながりはない」と one「直接の因果関係がない」は一致; pairs[0].rows[2]「相関は 2 つの量を区別せず対等」と回帰 detail「説明変数 / 目的変数を区別」は一致; 回帰の one の範囲 [2 変数] と detail [重回帰 = 複数] → L1) → 事実の不整合 0、範囲表現 1 件 (L1)。書き方 8 (対比の出現欄を列挙) → L4。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → 比喩・hook は定義の言い換えでなく、否定内容を運ぶ像もない (最小二乗法の停留所 = 「遠いほど重く数える」が二乗の重み付けと外れ値への引き寄せに対応; 相関の電車の 2 人 = 連動しても一方が他方を連れて来ない; 擬似相関の暑さ = 第三の要因)。§9 言い直し → L5。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 19 種 (最小二乗法 / 残差 / 回帰分析 / 説明変数 / 目的変数 / 単回帰分析 / 重回帰分析 / 主成分分析 / 相関と因果 / 散布図 / 正の相関 / 負の相関 / 相関係数 / 相関 / 因果 / 擬似相関 / 第三の要因 / 交絡因子 / 擬音) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 4 用語に見出し語の `[[jp:]]` あり (D-202)、zh 訳語が `zh_terms.json` に従うこと (最小二乘法 / 回归分析 / 相关与因果 / 伪相关 / 说明变量 / 目标变量 / 散点图 / 相关系数 一致; 表に無い 一元回归分析 / 多元回归分析 / 主成分分析 / 混杂因素 / 残差 / 第三个因素 / 正相关・负相关 は標準訳; validate の B6 warn / jp-origin warn 0)。訳の軽微なずれ → L2 / L3、hook_zh の標記 → L8。
10. **前段指摘の解消確認 (再発なし)**:
    - a1 r1 medium (説明変数・目的変数を定義前に図 caption と総表で使用) → **解消**: `overview_rows[1].one_line_jp`「手がかりとなる変数の値から別の変数の値を…」、`terms[1].fig.steps[0].caption_jp`「手がかりにする量 x と予測したい量 y」。説明変数・目的変数の初出は `terms[1].detail_jp` の定義文。図 (one の直後・detail の前に表示) の node / caption は 残差 (terms[0] で定義済み)・最小二乗法 (同)・回帰式 / 切片 / 傾き (中学数学の語) のみ。単元冒頭で両語を名指すのは `goals_jp[1]` (= `overview.intro_jp`) のみで、これは「この単元で区別できるようになること」の予告 (D-195 §3) であり定義前使用には当たらない。
    - a1 r1 medium (相関係数・散布図・正負の相関を定義前に図で使用) → **解消**: `terms[2].fig = null`。`overview_rows[2].extra_jp[1]` は「連動の向きと強さを表す -1〜+1 の値」で名称を出さない。4 語の初出は `terms[2].detail_jp` 1〜2 文目の定義文で、考点 (detail の後) と pairs[0] (相関と因果の後に配置) はその後。
    - a1 r2 medium (hook の「向き」が正負と逆の意味) → **解消**: 「向き」9・「方向」11 (うち jp「縦方向」2)・"direction" 9 の全出現 (派生含む) を列挙 — goals[2]、overview_rows[2].extra[0..1]、terms[2].detail 2 文目、pairs[0].rows[0].b、key_points[2] (+派生) はすべて **相関の符号** の意味、`terms[0].one`「縦方向」は残差の測り方 (別語)。因果の向き (どちらが原因か) は `terms[2].hook_*`「どちらが原因でどちらが結果かを分けている」で「向き」を使わずに述べる。二義の混用 0。
    - a2 r1 medium (最小二乗法 quiz に回帰分析の題) → **解消**: `terms[0].quiz` 空。
    - a2 r1 medium (相関と因果の表が飾り) → **解消**: 表を撤去 (fig null、L7 で記録)。
    - a2 r1 low「条件をそろえる」が分からない → 「第三の要因が同じ水準のデータどうしで比べる」に言い換え済み。
    - a2 loc-review low 3 件 → **未修のまま残存** (L2 / L3 / L8 で再記録、L2 は建議修)。
11. **注目点の個別確認 (依頼の重点)**:
    - 最小二乗法: 縦方向の残差の **二乗** の合計を最小にする (one・overview_rows[0]・key_points[0]・fig step 2 で一貫)。絶対値の和とはどこにも書いていない。残差 = 実測 − 直線の値、上なら正・下なら負 (正しい)。二乗で大きなずれが重く数えられ外れ値に引き寄せられやすい (正しい)。数値例は再計算一致。
    - 回帰分析: 説明変数から目的変数を説明・予測する式を作る (正しい)。「回帰直線が因果を示す」という記述はどの欄にもない (比喩の歩数 → 消費カロリーは予測の例で、因果の証明とは言っていない)。明示の「回帰は因果を証明しない」文はないが、相関と因果の one・detail・key_points[3] が相関一般について述べており、欠落ではない (O5)。
    - 相関係数: −1〜+1、符号 = 向き、絶対値が 1 に近いほど強く 0 に近いほど弱い。「0 = 関係が全くない」とは書いていない。「直線的な」の限定はないが、相関は one で「2 つの量が連動して増減する関係」と定義され、detail の「関係」はこの連動を指して読める。IT パスポートの水準で正しく、「直線的」を足すと未定義語を増やすため指摘しない。
    - 擬似相関 vs 相関と因果: 擬似相関 = 第三の要因 (交絡因子) が両方を動かして相関して見える; 相関と因果 = 相関があっても因果とは限らない。擬似相関の考点・detail は引用題を持たない mix / 本文のみで、「効果が出ない」は「このとき」(= 擬似相関の場合) に限定。層別で「消えるか弱まる / 残る」も標準的な説明で、引用題を超える一般化には当たらない (擬似相関は term_questions 0 題)。
12. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (4 / 4)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 最小二乗法 | OK — mix 1: 残差をそのまま足すと正負が打ち消し合い 0 になり得るので当てはまりの目安にならず、比べるのは二乗の合計 (正しい)。term_questions は 2024r06-q014 のみ (正答 = 回帰分析の手法名) で、考点には引用せず quiz も空 (a2 r1 の指摘どおり)。table (+3/−1/−2 → 0、9/1/4 → 14) 再計算一致 | OK (static table) | 表セル en 1 件 LOW、detail_en の強調 LOW | L2, L3, L5 |
| 2 | 回帰分析 | OK — exam 1 / 1 題: 2 つの量の関係を一次式で表し一方から他方を見積もる = 回帰分析 (2024r06-q014 正答ア; 誤答 線形計画法・デルファイ法・パレート分析を支持しない; 限定条件「関係が一次式で近似できるとき」は「直線の式 (一次式) で表し」で保持) / mix: 主成分分析は多変数を少数の総合指標に要約、回帰とは目的が違う (2023r05-q006 正答ウと整合)。flow steps 4 (データ収集 → 最小二乗法で直線 → y = a + bx → 新しい x から y) は one・detail と一致。hook (ゴルトンの平均への回帰) は史実どおり | OK (flow steps) | one の範囲表現 LOW | L1, L6 (quiz 重複) |
| 3 | 相関と因果 | OK — exam 2 / 2 題: 右下がりの散布図 = 負の相関、一方が増えると他方は減る傾向 (2011h23tokubetsu-q015 正答イ; 誤答 = 右上がり・水平帯・ばらけ を支持しない) / 相関係数が +1 に近いほど「一方が大きいと他方も大きい」関係が強い (2015h27a-q088 正答エ = 評価平均が低く相関係数が大きい項目を最優先; 考点は題の前提知識で正答判断と矛盾しない、限定条件「正の関連性の場合」は「+1 に近いほど」で保持) / mix: 負の相関 ≠ 弱い、−0.9 は +0.3 より強い (正しい)。detail の範囲 −1〜+1 正しい | OK (図なし; 散布図は登録図種になく §0-8 で最大 low) | hook_zh の標記 LOW | L4, L5, L6, L7, L8 |
| 4 | 擬似相関 | OK — mix 1: 第三の要因が同じ水準のデータどうしで比べると擬似相関は消えるか弱まり、直接の因果は残る (層別の標準説明)。term_questions 0 題のため引用題の限定条件は該当なし。detail の交絡因子・「このとき一方を操作しても他方は変わらない」は one「直接の因果関係がない」と整合。svg (第三の要因 → 変数 X・変数 Y、X - Y 見かけの相関) は one と一致 | OK (svg static) | OK | L4, L7, L9 |

**単元レベル**: goals 3 点・overview_cols 2 (扱うもの / 手がかりになる量・形)・overview_rows 4 行・pairs 2 組 (回帰分析 / 相関と因果 3 行 key 1、相関と因果 / 擬似相関 2 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 3 件 (2024r06-q014 / 2011h23tokubetsu-q015 / 2023r05-q006 — 本文と矛盾なし、§1-3)。pairs[0].rows[1]「相関係数 (-1〜+1)」・rows[2]「対等に扱う」は本文と一致。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 2)** + 範囲外観察 5

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1].one_jp` / `one_zh` / `one_en` (+ 派生 `definition_jp/zh/en`) | one は「両者の関係」/「两个变量之间的关系」/ "between two variables … the value of the other" と 2 変数に限って定義し、同用語 detail は説明変数が複数の重回帰分析も回帰分析に含める。detail が one の基本形を拡げる書き方で否定ではない (a1 r2 も low) が、定義の範囲が欄によって狭い (観点 7 の範囲表現) | jp「…両者の関係を式で表す分析手法である。」→「…**変数どうしの関係**を式で表す分析手法である。」/ zh「是用公式表示两个变量之间的关系，」→「是用公式表示**变量之间的关系**，」/ en "expresses the relationship between two variables as a formula so that the value of one can be explained or predicted from the value of the other." → "expresses the relationship between variables as a formula so that the value of one variable can be explained or predicted from the values of one or more clue variables." (見出し語の `[[jp:回帰分析]]` は zh・en とも置換範囲外で保持) |
| L2 | LOW **建議修** | `terms[0].fig.data.rows[3].cells[1].en` | jp「0 (ずれが見えない)」= ずれはあるが合計では見えなくなる、zh「0（看不出偏差）」は正確。en "0 (the gaps disappear)" はずれ自体が無くなったとも読める (a2 loc-review low、未修) | en "0 (the gaps disappear)" → "0 (the gaps cancel out)" |
| L3 | LOW | `terms[0].detail_en` 3 文目 (+ 派生 `explanation_en`) | jp「大きなずれほど重く数えられる」に対し en "count far more heavily" は強調 far を足す (二乗の性質と矛盾しない、a2 loc-review low、未修) | 記録のみ (任意: "Squaring makes large gaps count far more heavily" → "Squaring makes large gaps count more heavily") |
| L4 | LOW | `terms[2].one_*` / `detail_*` 3 文目 / `analogy_*`、`pairs[1].rows[0]`、`key_points_*[3]`、`terms[3].one_*` / `detail_*` | 書き方 8: 「相関があっても因果とは限らない」の対比が多くの欄に出る (a2 r1 low)。ただし相関と因果の one では見出し語の定義そのもの、key_points はまとめ | 記録のみ |
| L5 | LOW | `terms[0].points[0]`、`terms[2].points[0]` | §9 言い直し: 最小二乗法の mix 考点は detail 2 文目と表の合計行の言い直し、相関の exam 考点 (右下がり = 負の相関) は detail 1 文目の言い直しに「一方が増えると他方は減る」を足したもの (a2 r2 low) | 記録のみ |
| L6 | LOW | `terms[1].quiz` / `terms[2].quiz` / `challenge_questions` | 2023r05-q006 が 回帰分析・相関と因果の quiz と challenge の 3 か所、2024r06-q014 が 回帰分析の quiz と challenge の 2 か所に出て、challenge 3 題すべてが quiz と重複 (a2 r1 / r2 low)。2023r05-q006 の正答 (主成分分析) は相関と因果の欄では扱わない | 記録のみ |
| L7 | LOW | `terms[2].fig` (null)、`terms[3].fig` (svg static) | 相関と因果は散布図 (量の関係) の用語だが登録図種に散布図がなく図なし。擬似相関は因果の構造で段階図の候補だが v1 の静的 SVG を流用 (§0-8: 登録外・未使用図種の欠如は最大 low、SVG のラベルは本文と一致) | 記録のみ |
| L8 | LOW | `terms[2].hook_zh` / `terms[3].hook_zh` | hook_en は [[jp:相関]] [[jp:因果]] [[jp:擬似相関]] で原語を示すが、hook_zh は 「相関」「因果」「擬似」 を平文の鉤括弧で書く (zh 字面の一致を説明する現地化として意味は正しい、a2 loc-review low) | 記録のみ |
| L9 | LOW | `terms[3].analogy_jp/zh/en` | D-198 (iii) の判断保留: 暑さで売れ行きが動く場面が 2011h23tokubetsu-q015 / 2024r06-q014 の気温 × 売上・販売量の素材に近い (a1 r1 low)。構造 (第三の要因)・商品・数値なしで写しではない (12 字照合・近似照合とも 0) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 相関 ≠ 因果: L4 のとおり (one の定義そのもの + key_points のまとめを含む) → L4。② 層別すると擬似相関は消える / 因果は残る: `pairs[1].rows[1]` と `terms[3].points[0]` (mix) の **2 箇所** (a1 r2 の 3 箇所から detail を削って上限内) → 許容。③ 回帰 = 予測式・変数を区別 / 相関 = 向きと強さ・対等: `pairs[0].rows[0..2]` のみ → 許容。④ 主成分分析 / 回帰分析: `terms[1].points[1]` のみ → 許容。`goals_jp` は観点の予告で内容を述べない。

**範囲外の観察** (書き直し対象外 / 指摘にしないもの):
- O1 `data/ip/textbook/figures/strategy-01-02-u04-t02.svg` (擬似相関の図) の文字は jp のみ (第三の要因 / 変数X / 変数Y / 見かけの相関)。zh・en 読者には未訳の図が出る。v1 からの継承・登録図種で、前段の reviewer も指摘なし。
- O2 `source_figures[2]` = 2009h21h-q095 (性別年代別構成比の円グラフ、terms = クロス集計表・棒グラフ) は本単元の 4 用語と無関係。v1 からの継承。
- O3 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。「関係の強さ・因果の有無を見分ける相関の考え方」は相関そのものが因果を判定するとも読めるが、「相関の考え方 (相関と因果の区別)」の意で、validate 対象外フィールド。
- O4 回帰式 (`overview_rows[1].extra_jp[1]`、`pairs[0].rows[1].a_jp`、fig node[2])・切片 / 傾き (fig step 3) は正式な定義文なし。回帰式は見出し語の透明な複合語、切片・傾きは中学数学の語で、初学者の理解を妨げない。
- O5 「回帰直線は因果を証明しない」の明示文はないが、どの欄も回帰を因果の推定とは言わず、相関と因果の one・detail・key_points[3] が一般則を述べる。term_questions の 2024r06-q009 の誤答ウ (因果関係を統計的に推定する手法) を支持する記述もない。

確認済みで問題なし: a1 / a2 の medium 5 件の解消 (§1-10)、「向き」の一義性 (§1-10)、限定条件 (qid 付き考点 3 件全て保持、§2)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤79 字)、D-205 該当なし、写し (validate 0 + 独立 12 字照合 遮蔽あり / なし 0 + 近似照合 0)、`[[jp:]]` 原語 (19 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (4/4)、zh 訳語表、図種 (static table / flow steps / 図なし / svg static = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、数値 (残差表・相関係数比較) の再計算。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 2: L1 / L2、記録のみ 7: L3〜L9、うち L3 は任意の修正案あり) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 4 用語・考点 7 件 (qid 付き 3 件)・引用 3 題 + 未引用の quiz / challenge 1 題 + term_questions の未使用 2 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。a1 の誤り (説明変数 / 目的変数・相関係数 / 散布図 / 正負の相関の定義前使用、「向き」の二義) はいずれも再発していない。LOW 建議修 2 件 (L1 / L2) は補丁 (B3) で修正推奨、L3〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-02-u04
✓ strategy-01-02-u04 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u04.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-02-u04
✓ strategy-01-02-u04 parity: 23 locations, 0 diff
EXIT=0
```
