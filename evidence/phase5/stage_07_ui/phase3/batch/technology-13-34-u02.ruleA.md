# Rule A 全数抽検 — technology-13-34-u02 (記述統計量(代表値と散布度))

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成、作業用スクリプトは scratchpad)。
- **Date**: 2026-11-08 (S149 b49)、repo HEAD `69504337` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b49-u02-a1` merge 結果、sha256 先頭 `dee9db6e52b9cea4`)。
- **対象**: `data/ip/textbook/units/technology-13-34-u02.json` (textbook-unit-v2)、用語 **8 / 8 = 全数** (平均値 / 中央値 / メジアン / 最頻値 / モード / 分散 / 標準偏差 / 偏差値) + 単元レベル (goals / overview_rows / pairs / key_points / summary / overview / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 / D-203 / D-204 / D-205、D-208 既知失敗型 (1)〜(10)、D-209 / D-210、図種は登録 6 種のみ。比較: `data/ip/textbook/.planning/v2/technology-13-34-u02/v1-original.json` (用語 8 語・`term_zh`・`term_en` とも v1 と一致、`unit_summary_*` も v1 と同文)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 8 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ (hook は メジアン / 最頻値 / モード / 標準偏差 の 4 用語のみ、analogy は メジアン / モード が空 = 別名語)。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版 (`**` 除去・`[[jp:X]]`→X、memory_hooks は見出し語接頭) であることをスクリプトで確認 (87 照合、不一致 0)。
2. **考点 × 引用題 (考点 全 6 件 = exam 5 + mix 1、qid 付き 5 件、引用 qid 延べ 5 件 = 異なり 3 題)**: `data/ip/quiz/questions.json` から各題の題文・選択肢・`correct_answer` を再読し、判定は `translations/<exam>.json` の `stem_jp_clean` で行った (全題 topic `technology-13-34`)。**計算は全て自分で再計算**:
   - 2022r04-q059 (正答エ): 9 個の合計 2700 ÷ 9 = **300**、奇数個なので 5 番目 = **40** → 平均値 300・中央値 40 で正答と一致。同じ値の重複を数え落とすと平均は 380 となり、どの選択肢にも無い (= 平均値 points[0] の「重複を含めて数える」は正しく、誤答を支持しない)。外れ値で平均と中央値が大きく離れる (中央値 points[0]) の実例。
   - 2009h21h-q080 (正答イ): clean の度数表から再計算。黒 n=25・平均 5・分散 **4** (標準偏差 2)、グレー n=25・平均 5・分散 **1.04** (標準偏差 約 1.02) → グレーの分散が小さい = 正答と一致。分散 points[0] (平均の近くに度数が集中し、離れた点数の度数が少ない分布ほど分散は小さい) が正答を導き、誤答エ (グラフだけでは比べられない) を支持しない。
   - 2023r05-q077 (正答ウ): 得点 71 で (71 − 平均) ÷ 標準偏差 = 国語 1.800 / 社会 1.778 / 数学 **2.167** / 理科 1.571 → 偏差値 68.00 / 67.78 / **71.67** / 65.71、数学が最大 = 正答と一致。raw `stem_jp` は国語の平均が OCR で「82」になっているが clean は 62 (テンプレートどおり clean で判定)。どちらでも数学が最大。題の前提「正規分布に従う」は、差 ÷ 標準偏差で大小を決める考点の主張に影響しない。
   - 単元内の例の再計算: 最頻値の表 (1, 2, 2, 4, 6 → 15 ÷ 5 = 3 / 3 番目 = 2 / 最頻 2) 一致。標準偏差の表 (4, 4, 6, 6 → 平均 5・分散 1・標準偏差 1 / 2, 2, 8, 8 → 平均 5・分散 9・標準偏差 3、母分散) 一致。偏差値の手順図 (平均 40・標準偏差 8・値 52 → 差 12 → 1.5 → 65) 一致。
3. **quiz / challenge_questions** (quiz 計 8 枠、challenge 3 題 = 2022r04-q059 / 2009h21h-q080 / 2023r05-q077、全て本文で引用済み; 未引用題なし): 本文と矛盾しない。topic 内で本単元の用語を持つ未引用題 2010h22h-q011 (期待値、u01 系) / 2014h26a-q095・q096 (標準偏差の読み取り、`source_figures` のみ) も確認: q096 の正答 R 組 (平均 5.00 で標準偏差最小) は key_points[2]「平均の近くに集まるほど標準偏差は小さい」と整合、q095 の誘導文「全員同じ得点なら標準偏差 0」は分散 detail / key_points[2] と整合。
4. **D-198 写し**: validate の copy guard (本文 + 図ラベル・caption・総表・対比表) = 0 件。独立照合として単元の JP 文字列 131 本 (派生フィールド除く、図ラベル・セル・caption 含む) を topic 内全 32 題の題文 (clean) + 選択肢と 12 字連続照合 (句読点・記号・空白・記法除去、遮蔽後の実字 6 未満の窓は除外):
   - カタカナ 4 字以上と英数を □ に遮蔽: **0 件**。
   - 遮蔽なし: **0 件**。
   - 近似一致 (12 字窓で編集距離 1〜2): **0 件**。
   - 目視: カタカナの多い文 (メジアン / モード の one・detail・hook、pairs[1]) は題に無い表現 (中央分離帯・ファッションの流行) で写しなし。
   - (iii) 選択肢なぞり (D-208 (1)): validate の `warn choice-echo` は出力なし。題側の判定項目・空欄: q059 は数値の組合せ (平均値 / 中央値) の選択肢で、考点は計算規則の一般表現 (重複も数える・外れ値で平均が動く) だけを述べ、データ列・誤答の数値の組 (20 / 40 等) を再現しない。q080 の選択肢 (大きい / 小さい / 等しい / 比べられない) の並び・集合を再現せず、正しい原理だけを肯定で述べる。グラフの色 (黒・グレー) や度数も不使用。q077 の 4 教科・平均点・標準偏差の数値は不使用 (手順図は自作の 40 / 8 / 52)。具体例の流用もなし (積み木・背の順・売り場・的当て・面積と一辺・両替は題に無い場面)。
5. **D-195**: 結論先行 (one = 1 文 × 8、太字あり)、展開 2〜3 文、定義前使用 (代表値 = 平均値 detail、外れ値 = 同 detail の括弧、散布度・偏差 = 分散 detail、度数分布 = 一般語)。overview_rows[5] は r1 low (偏差の定義前使用) を「平均値との差を 2 乗して平均した値」に直して解消。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh・en 相当語): ヒットは `terms[4].detail_jp`「最も多いものを選ぶ」(求め方の動詞、定型締め句ではない)、en の「every」内の very、`kind: "exam"`、caption の「Example」内の exam → **全て偽陽性**。「と覚える」0 件。図の型: 中央値・分散・偏差値 = flow steps (3 / 4 / 3)、最頻値・標準偏差 = static table、平均値・メジアン・モード = 図なし; 全て登録内。pair 配置 (平均値→中央値、メジアン→モード、分散→標準偏差、各組 key 行あり)。
6. **D-200**: 考点数 1/1/0/1/0/1/1/1 (≤3 ✓)、各 JP 文数 1〜2・字数 51〜65 (≤100 ✓、最大は標準偏差 `points[0]` 65 字)。**framing 件数** (validateV2 `pointFraming` を tsx で実行、全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 / D-204 / D-205 単元全体点検**: 書き方 7 (欄同士): 代表値の定義「少数の値で」(r1 MEDIUM 修正後) は最頻値 detail の「数値でないデータ」「2 つ以上」と両立。pairs[0].rows[1].b「ほとんど動かない」と中央値 detail「最大値を大きくしても変わらない」・points[0]「真ん中の値のまま」は整合。key_points[2]「全部同じなら 0」と分散 detail 一致。不整合 0 (比喩の基準点の揺れ = L1)。書き方 8 → L6。書き方 9 (限定条件) → §2 表、落ち 0。§6 → L1・L7。D-205: 改訂される文書の構成数の記述なし (対象外)。D-208 (3) 別名: メジアン / モード は one・detail・overview・key_points[0] で一貫して「英語名 = 同じ値」と述べ、別物として教えていない ✓。(10) 閉じた列挙: key_points[0] は「この単元で扱う代表値は…3 つ」と範囲を限定 (r1 low 解消) ✓。(7) D-210: 法令・規格の改正なし。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 10 種 (平均値 / 中央値 / 外れ値 / メジアン / 最頻値 / モード / 分散 / 度数分布 / 標準偏差 / 偏差値) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 8 用語に見出し語の `[[jp:]]` あり、zh 訳語が `zh_terms.unit.json` に一致 (均值 / 中位数 / median（中位数） / 众数 / mode（众数） / 方差 / 标准差 / 偏差值; validate B6 warn 0)。
9. **前回までの指摘の解消確認 (journal `type:"result"`)**: jp-review r1 **HIGH** `terms[7].points[0]` 第 2 文 (「差が同じなら標準偏差の小さい集団の偏差値が高い」= 差が負で逆転) → 削除・差し替え済み、zh / en も新文 (同じ得点でも平均・標準偏差が違えば偏差値が変わる) で旧主張の残存なし (D-208 (5) 退行なし)。ただし新文は言い切りすぎ → L2。r1 **MEDIUM** `terms[0].detail` (代表値 =「1 つの数」) → jp「少数の値で」/ zh「用少数几个值」/ en "with just one or a few numbers" で三語解消。r1 **MEDIUM** `terms[5].points[0]` (山の位置・高さを条件に入れる) → 三語とも「平均の近くに集中・離れた点数の度数が少ない」に絞られ解消。r2 PASS の low と loc-review PASS の low のうち未反映分 → L4・L5。
10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (8 / 8)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 平均値 | OK — exam 1 / 1 題: 同じ値も出現回数分を合計に入れ、重複込みの個数で割る (2022r04-q059 正答エ、再計算 300 一致)。detail の外れ値で大きく引っ張られる、比喩 (積み木をならす = 等しい高さ) も正しい | OK (図なし) | detail_en "a single value" は jp に無い個数限定 (L5) | L5 |
| 2 | 中央値 | OK — exam 1 / 1 題: 外れ値があると平均は外れ値側へ動き中央値は真ん中のまま、両者が大きく離れうる (q059: 300 と 40、「ことがある」で限定) 。detail の奇数 / 偶数の規則正しい。flow steps 3 は detail と一致 | OK | OK | L7 (analogy / detail の端の例) |
| 3 | メジアン | OK — 考点なし (別名語)。one / detail = 中央値と同じ値・同じ求め方。hook (median = 中間の、中央分離帯) は事実 (米英語の median strip) | OK | detail_en の同語反復 (L4) | L4 |
| 4 | 最頻値 | OK — mix 1: 出現回数で決まり、平均値 (足す)・中央値 (位置) と決め方が違う — 正しい。detail (数値でないデータにも使える、同数なら複数) 正しい。table 再計算一致 | OK | OK | L3 (図の例で中央値 = 最頻値) / L6 |
| 5 | モード | OK — 考点なし (別名語)。one / detail = 最頻値と同じ | OK | detail_en の同語反復 (L4)、hook_zh の手がかり (L5) | L4, L5 |
| 6 | 分散 | OK — exam 1 / 1 題: 度数が平均の近くに集中し離れた度数が少ないほど分散は小さい (2009h21h-q080 正答イ、再計算 黒 4 / グレー 1.04)。detail (偏差の和 = 0 → 2 乗、全部同じなら 0) 正しい。flow steps 4 一致 | OK | analogy の基準点 (zh 靶心 / en bullseye) | L1 |
| 7 | 標準偏差 | OK — exam 1 / 1 題: 平均との差 ÷ 標準偏差 = 標準偏差何個分、ばらつきの違う集団どうしで位置を比べられる (2023r05-q077 正答ウ、再計算 数学 2.167 最大)。detail (単位の 2 乗 → 平方根で元の単位)、analogy (面積 → 一辺)、table 再計算一致 | OK | OK | L6 (偏差値 points[0] と重複) |
| 8 | 偏差値 | OK — exam 1 / 1 題: 偏差値の大小は差 ÷ 標準偏差で決まる (q077、正答と一致)。第 2 文「同じ得点でも平均・標準偏差が違えば偏差値は変わる」は得点がちょうど平均のとき (標準偏差だけ違っても 50 のまま) や平均・標準偏差が打ち消し合うときに成り立たない言い切り。誤答肢は支持しない。式・60 / 40・手順図 (65) 一致 | OK | one_en に (standard score) 無し (L5) | L2, L5 |

**単元レベル**: goals 3 点・overview_cols 2 (種類 / 求め方)・overview_rows 8 行・pairs 3 組 (平均値 / 中央値 2 行 key 1、メジアン / モード 2 行 key 1、分散 / 標準偏差 2 行 key 1)・key_points 4・summary (記法除去版と一致)・overview.intro (goals の連結、三語一致)・challenge_questions 3 件 (全て本文で引用、§1-3)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 7 (うち 建議修 4: L1〜L4)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[5].analogy_jp` / `analogy_zh` / `analogy_en` | 比喩の基準点が zh「偏离靶心」/ en "from the bullseye" で的の中心 (外にある固定の目標) になっており、分散の定義 (detail: 各値と**平均値**との差) と基準点が食い違う (的の中心からの距離 = 分散 + 偏りの 2 乗)。jp「中心」は detail の散布度の定義 (中心のまわり) と同じ語でデータの中心とも読めるため、欄同士の明示的な矛盾には至らず、q080 (2 分布とも平均 5) で誤答も導かない → D-204 の MEDIUM には当たらず LOW。zh / en は誤読を固定するので直す | jp「的当てで矢が中心からどれだけ散ったかを測るとき、大きく外れた矢ほど重く数える採点法に似ている。」→「的当てで、刺さった矢の集まりの中心から各矢がどれだけ散ったかを測るとき、大きく離れた矢ほど重く数える採点法に似ている。」/ zh「就像在投靶游戏中衡量箭偏离靶心多远时，采用偏得越远计分越重的评分方法。」→「就像在投靶游戏中衡量每支箭离所有箭落点的中心有多远时，采用离得越远计分越重的评分方法。」/ en "It resembles scoring a round of darts by how far each dart lands from the bullseye, with wide misses counting much more heavily." → "It resembles scoring a round of darts by how far each dart lands from the center of the whole cluster of darts, with darts far from that center counting much more heavily." |
| L2 | LOW **建議修** | `terms[7].points[0].text_jp` / `text_zh` / `text_en` 第 2 文 | 「同じ得点でも、集団の平均値や標準偏差が違えば偏差値は変わる」は言い切り。得点がちょうど平均のときは標準偏差が違っても 50 のまま、平均と標準偏差の違いが打ち消し合えば同じ偏差値になる。r1 HIGH の差し替え文で、誤答肢は支持しない (r2 が `terms[1].detail` の端の例を low とした基準と同じ扱い) | jp「同じ得点でも、集団の平均値や標準偏差が違えば偏差値は変わる。」→「同じ得点でも、集団の平均値や標準偏差が違えば偏差値は変わりうる。」/ zh「即使得分相同，只要群体的均值或标准差不同，偏差值也会改变。」→「即使得分相同，只要群体的均值或标准差不同，偏差值也可能不同。」/ en "The same score gives a different deviation value when the group's mean or standard deviation differs." → "The same score can give a different deviation value when the group's mean or standard deviation differs." |
| L3 | LOW **建議修** | `terms[3].fig.data.cols[2]` / `rows[0].cells[2]` / `rows[1].cells[2]` (各 jp / zh / en) | 3 つの代表値の決め方を見分けるための表なのに、例 1, 2, 2, 4, 6 では中央値 = 最頻値 = 2 で 2 つの結果が重なる (計算自体は正しい)。q059 の誤答は中央値に最頻値の値を入れた組なので、結果が分かれる例のほうが対比が立つ。代替 2, 2, 3, 5, 8 → 平均 20 ÷ 5 = 4 / 中央値 3 / 最頻値 2 で 3 つとも異なり、q059 のデータとも無関係 (再計算済み)。`rows[2].cells[2]` (2 回現れる 2) は代替でも正しいので変えない | `cols[2].jp`「データ 1, 2, 2, 4, 6 の場合」→「データ 2, 2, 3, 5, 8 の場合」/ `cols[2].zh`「数据 1, 2, 2, 4, 6 的情况」→「数据 2, 2, 3, 5, 8 的情况」/ `cols[2].en` "For data 1, 2, 2, 4, 6" → "For data 2, 2, 3, 5, 8" / `rows[0].cells[2].jp/zh/en`「15 ÷ 5 = 3」→「20 ÷ 5 = 4」/ `rows[1].cells[2].jp`「3 番目の値 = 2」→「3 番目の値 = 3」/ `.zh`「第 3 个值 = 2」→「第 3 个值 = 3」/ `.en` "3rd value = 2" → "3rd value = 3" |
| L4 | LOW **建議修** | `terms[2].detail_en`、`terms[4].detail_en` (+ 派生 `explanation_en`) | loc-review の low が未反映: en では見出し語自体が median / mode なので「the same as for the median」「the same way as the mode」が同語反復で、jp の「中央値の手順」「最頻値と同じ」の対応 (和名との同一性) が伝わらない | `terms[2].detail_en` "The calculation is also the same as for the median:" → "The calculation is also the same as for [[jp:中央値]]:" / `terms[4].detail_en` "It is found the same way as the mode:" → "It is found the same way as [[jp:最頻値]]:" (jp / zh は変更なし) |
| L5 | LOW | `pairs[1].rows[0].a_zh/b_zh/a_en/b_en`、`terms[4].hook_zh`、`goals_zh[0]` / `terms[0].detail_zh` の「代表值」、`terms[7].one_en`、`terms[0].detail_en` | loc-review PASS の low のうち未反映分: (a) pairs[1] の和名セル zh「中央值（中位数）」「最频值（众数）」は日本語の字形でも中国語の標準語でもない形、en「中央値 (median)」は平文の和名; ただし pairs セル内で `[[jp:]]` を使う単元は全単元で 0 件 (描画未検証) なので記法化は勧めない; (b) hook_zh「时装界的 mode（流行）」は中国語では mode が流行の意で通じにくい; (c)「代表值」は日本語寄り (集中趋势量); (d) one_en に term_en の "(Standard Score)" 相当が無い; (e) detail_en "a single value" は jp に無い個数限定。いずれも事実は jp と一致 | 記録のみ |
| L6 | LOW | `terms[6].points[0]` / `terms[7].points[0]` 第 1 文 / `terms[7].detail_jp` 第 3 文; `terms[0].detail` / `terms[1].detail` / `terms[1].points[0]` / `pairs[0].rows[1]`; `terms[3].points[0]` / `terms[3].fig` cols[1] / `pairs[1].rows[1]` | §9 言い直し + 書き方 8 対比の反復: ① 差 ÷ 標準偏差で位置を比べる = 標準偏差 考点・偏差値 考点・偏差値 detail (同じ q077); ② 外れ値に対する平均値 / 中央値の動き = 4 箇所; ③ 決め方 (足す / 位置 / 回数) = 3 箇所。r1 / r2 で low 記録済み | 記録のみ (①は 2 用語が同じ題の別側面を担う、②③は定義の中核) |
| L7 | LOW | `terms[1].analogy_jp/zh/en`、`terms[1].detail_jp` 第 2 文 | 背の順の「ちょうど真ん中に立つ人」は奇数個の場面のみ (偶数個は detail・図が補う)。「最大値をさらに大きくしても変わらない」はデータ 2 個のとき不成立の端の例 (r2 low)。誤学習には至らない | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 平均値 = 外れ値で大きく動く / 中央値 = ほとんど動かない: `pairs[0].rows[1]` (key)、`terms[0].detail`、`terms[1].detail`、`terms[1].points[0]` → L6。② 決め方 (合計 ÷ 個数 / 並べた真ん中 / 出現回数): `pairs[0].rows[0]`、`pairs[1].rows[1]` (key)、`terms[3].points[0]` (mix)、`terms[3].fig` 求め方の列、`overview_rows` の extra (D-195 §3 の総表の構造で反復に数えない) → L6。③ 分散 = 2 乗の単位 / 標準偏差 = 元の単位: `pairs[2].rows[1]` (key)、`terms[6].one`・`detail` (定義そのもの) → 許容。④ 和名 / 英語名: `pairs[1].rows[0]`、メジアン / モード の one・detail、`key_points[0]` (別名の関係が見出し語の定義そのもの) → 許容。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿、manifest `index_unit.summary_jp` と一致) だが、「ばらつきを表す散布度(分散・標準偏差・偏差値)」と**偏差値を散布度に分類**している。本文では偏差値は「集団の中での位置」(`overview_rows[7].extra_jp`、`terms[7].one_jp`) で、散布度 = ばらつきの大きさ (`terms[5].detail_jp`) ではない。単元カードに出る分類の誤りなので、v1 由来・審査対象外の扱いを続けるか、別途 jp「…と、ばらつきを表す散布度(分散・標準偏差)、集団内の位置を表す偏差値を学ぶ。」等で直すかは呼び出し側の判断に委ねる (manifest の index と同時に直す必要あり)。
- O2 2023r05-q077 の raw `stem_jp` は国語の平均点が OCR 誤り (82)、clean は 62。判定は clean で行い、どちらでも数学が最大 (正答ウ) で単元の主張に影響なし。
- O3 独立 copy 照合 0 件 (遮蔽あり / なし / 近似)。§9 grep のヒットは `terms[4].detail_jp`「選ぶ」(求め方の動詞)・en の every / Example・`kind: "exam"` の偽陽性のみ。

確認済みで問題なし: 限定条件 (考点 6 件全て保持、§2)、§9 禁止句 (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤65 字)、図の文字列の写し (validate 0、独立照合 0)、`[[jp:]]` 原語 (10 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (8/8)、zh 訳語表 (B6 warn 0)、図種 (flow steps ×3 / static table ×2 / 図なし ×3 = 登録内)、派生フィールド一致 (87 照合 0 不一致)、用語・`term_zh`・`term_en` の v1 不変量 (8/8)、前回 HIGH 1 / MEDIUM 2 の三語解消。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **7** (建議修 4: L1〜L4 / 記録のみ 3: L5〜L7) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 8 用語・考点 6 件 (qid 付き 5 件)・引用 3 題 (= quiz / challenge の全題) で、考点の主張は正答と一致し (計算 3 題 + 単元内の例 4 つを全て再計算)、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。LOW 建議修 4 件 (L1〜L4) は補丁 (B3) で修正推奨、L5〜L7 はバッチ証拠の「未修 LOW」表へ。O1 (unit_summary の偏差値の分類) は v1 由来の範囲外として呼び出し側へ申し送り。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-34-u02
✓ technology-13-34-u02 unit: 0 issues (data/ip/textbook/units/technology-13-34-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-34-u02
✓ technology-13-34-u02 parity: 36 locations, 0 diff
EXIT=0
```
