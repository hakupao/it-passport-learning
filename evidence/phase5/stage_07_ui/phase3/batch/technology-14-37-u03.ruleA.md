# Rule A 全数抽検 — technology-14-37-u03 (入出力と手続・関数)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成、作業用スクリプトは scratchpad)。
- **Date**: 2026-11-08 (S149 b51)、repo HEAD `be49bdf9` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b51-u03-a1` merge 結果、sha256 先頭 `32f45d30f37d75e0`)。
- **対象**: `data/ip/textbook/units/technology-14-37-u03.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (入出力 / 手続 / 関数 / 引数 / 戻り値) + 単元レベル (goals / overview_rows / pairs / key_points / summary / overview / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 / D-203 / D-204 / D-205、D-208 既知失敗型 (1)〜(10)、D-209 / D-210、図種は登録 6 種のみ。比較: `data/ip/textbook/.planning/v2/technology-14-37-u03/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致、`unit_summary_*` も v1 と同文)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ (hook は 引数 のみ無し = r1 MEDIUM で削除)。派生フィールド (`definition_* / explanation_* / memory_hook_*`) が本体の記法除去版であること、`summary.key_points_*` = `key_points_*`、`inline_quiz` = `quiz` をスクリプトで確認 (42 照合、不一致 0)。
2. **考点 × 引用題 (考点 全 11 件 = exam 9 + mix 2、引用 qid 延べ 12 件 = 異なり 11 題、全題 topic `technology-14-37`)**: `data/ip/quiz/questions.json` の `correct_answer` と `translations/<exam>.json` の `stem_jp_clean` で判定。**擬似言語・手順の題は全て手でトレースした**:
   - 2019h31h-q071 (正答ア): 左の箱 49, 11 → B1 = 11、B2 = 49 mod 11 = 5 → 右の箱 A1 = 11, A2 = 5 → B2 = 11 mod 5 = **1** ✓。
   - 2009h21h-q072 (正答イ): 15, 6 → B1 = 6、B2 = 3 → 後ろの箱 6, 3 → B1 = **3** (B2 = 0) ✓。両題とも「前の箱の出力がそのまま次の箱の入力」(入出力 points[0]) で解ける。
   - 2013h25h-q053 (正答イ = 特定の目的を達成させる処理手順): 手続 points[0] の定義と一致、誤答 (機械語への変換ソフト / 人工言語の総称 / 設計作業) を支持しない。
   - 2010h22h-q053 (正答イ): TMP ← A、A ← B、B ← TMP をトレース → A, B 入替え成立。誤答ア・エ (最後に B ← A) は A が既に B の値で上書き済みのため B が元の B のまま、ウ・エ (最初に TMP ← B) は A の値が消える。手続 points[1]「上書きで消える側を先に退避し、最後に退避した値を相手へ」は正答の手順だけを肯定形で述べる ✓。
   - 2009h21a-q062 (正答エ): tmb → 20, 13, 2 → 位置ごとに 1, 2, 3 を引く → 19, 11, −1 → −1 は範囲外なので +26 → 25 → s, k, y = **sky** ✓。手続 points[2]「足す・引くは逆操作で後ろからたどり、余りは一通りに戻らないので取りうる範囲の値を選ぶ」が r1 MEDIUM (無条件の逆算) を解消し、正答を導く。
   - 2026r08-q085 (正答エ): `isPrime(2)` が true になる条件から a = 「より小さい」(以下だと 2 で false)。b = 「より大きい」: num = 2 → while 2 > 2 偽 → true ✓、num = 4 → 4 mod 2 = 0 で **while の途中の return false** で終了 ✓、num = 5 → div 2, 3, 4 で割り切れず div = 5 で終了 → true ✓。b = 「と等しい」だと num = 4 で while に入らず true (誤り)。関数 points[0] (繰返し途中の return で残りの繰返しは実行されない)、戻り値 points[1] (論理型を返す関数) と一致。
   - 2025r07-q099 (正答ウ): (200000, 3) → 外側 else、3 < 7 → 2000 / (50000, 14) → 外側 then、14 ≥ 7 → 1000 → 合計 **3,000** ✓。引数 points[0] (複数の引数を組み合わせて処理を分ける) は r1 MEDIUM (並び順の対応を本題に結び付けた) を解消し、題が支持する範囲に絞られている。
   - 2022r04-q078 (正答イ): 配列引数の各要素を `originalDigit[i]` で合計 → while j > 9 で k = j ÷ 10 の商、j ← k + (j − 10 × k) = 十の位 + 一の位 (例 j = 45 → 4 + 5 = 9) ✓。ア (一の位だけ)・エ (k + j) は桁和にならない。引数 points[1] (配列を渡せ、要素番号で参照) と一致。
   - 2024r06-q062 (正答エ): 要素 = 1 なら "A"、それ以外 "B" → AABAB には {1, 1, ≠1, 1, ≠1} が必要 → エ {1, 1, 2, 1, 0} ✓ (ア → BBABA、イ → BABAA、ウ → ABABB)。戻り値 points[1] (文字列型を返す関数)、引数 points[1] (配列引数) と一致。
   - 2022r04-q096 (正答エ): calcX(1) を a = num + 2 × i で i = 1..3 → 1 → 3 → 7 → 13 ✓ (2 × num + i だと 1 → 3 → 8 で不一致)。calcY: 増分 4, 8, 12 = 2 × i → i = 2, 4, 6 → 「2 から 6 まで 2 ずつ」で 1 → 5 → 13 → 25 ✓ (1 から 7 まで 3 ずつ = i 1, 4, 7 → 1 → 3 → 11 → 25 だが途中経過が不一致)。戻り値 points[0] (繰返しを終えてから return → 最後までたどった値が戻り値) と一致。
   - 2023r05-q064 (正答ウ): sigma(max) で calcX ← calcX + n を n = 1..max → 総和 ✓ (例 max = 3 → 0+1+2+3 = 6)。ア (× n) は 0 のまま、イ (+ 1) は max、エ (← n) は max。戻り値 points[0] と一致。
   - **単元内のコード例**: 関数 detail の宣言形「○整数型: 関数名(整数型: 名前)」= 試験の擬似言語の関数宣言形 (q064 / q096 / q099 と同じ形) ✓。手続 detail「名前の後ろのかっこ内に受け取る値の型と名前、名前の前には型を書かない」= 手続宣言形 ✓。pairs[0].rows[1] の 2 形 ✓。引数 fig (1 番目 x ← 8、2 番目 y ← 4) は宣言順の対応で、key_points[3]・引数 detail と一致。戻り値 fig (整数型 → 42 / 論理型 → true または false / 文字列型 → "ABC") は型と値の対応が正しい。関数・手続・入出力の flow steps (呼出し → 実行 → 戻る [関数は値を持って戻り、代入・計算に使う]) は one・pairs と一致。**再帰呼出しは単元にも引用題・quiz・challenge にも無い** (トレース対象なし)。
3. **quiz / challenge_questions** (quiz 計 9 枠 = 異なり 9 題、challenge 5 題 = 2013h25h-q053 / 2019h31h-q071 / 2009h21a-q062 / 2026r08-q085 / 2025r07-q099、全て本文で引用済み; 未引用題なし): 本文と矛盾しない。topic 内で本単元の用語を持つ未引用題 2011h23tokubetsu-q096 (関数・引数・戻り値) も確認: J = 10, K = 20, M = 2 → 10 × 4000 + 20 × 1500 = 70,000、30 枚 ≥ 20 で 1 割引 → 63,000 = 正答ウ。引数を追加すると処理が分かれる点が引数 points[0] と整合。
4. **D-198 写し**: validate の copy guard (本文 + 図ラベル・caption・総表・対比表) = 0 件、`warn choice-echo` 出力なし。独立照合として単元の JP 文字列 111 本 (派生除く、図ラベル・セル・caption・pairs・overview_rows 含む) × topic 内全 32 題の題文 (clean) + 選択肢 (計 160 本)、12 字連続一致 (句読点・記号・空白・記法除去、遮蔽後の実字 6 未満の窓は除外):
   - (a) カタカナ 4 字以上と英数を □ に遮蔽: **0 件**。
   - (b) 遮蔽なし: **0 件**。
   - (c) 近似一致 (12 字窓で編集距離 1〜2): **2 件**。(1) `terms[1].fig.data.nodes[1].label.jp`「…の中の処理を順に実行する」↔ 2026r08-q088 題文「次の処理を順に実行する」 — 一般動詞句の偶然一致で偽陽性。(2) **`terms[1].points[0].text_jp` ↔ 2013h25h-q053 正答イ**: 節「ある目的を達成するための処理の手順」↔「ある特定の目的を達成させるための処理手順」で **ed 0.30 / Dice 0.63** (文全体 ed 0.66 / Dice 0.39)。分類題の正答を見出し語の一般定義として述べる形 (D-209 の除外) でアルゴリズムの標準定義だが、正答肢の語の並びをほぼ保つ。前例 (technology-22-60-u05 L1: 標準定義で ed 0.19 / Dice 0.70 = LOW 建議修、較正 HIGH = ed 0.14 / Dice 0.52) と同じ扱い → **L1 建議修**。
   - 目視: カタカナの多い文 (キーボード・ファイル・コピー機・クリーニング・アルゴリズム) は題に無い表現。
   - (iii) 選択肢なぞり (D-208 (1)): 空欄補充題 (q085 a・b、q096 a・b、q078 a、q064 a) の正答字句 (より小さい / より大きい、num + 2 × i、桁和の式、calcX + n) と比較相手はどれも本文に出ない。q053 (2010h22h) の 4 通りの手順の集合・順序を再現せず、正しい手順だけを変数名なしで述べる。q071 / q072 の箱の規則 (B1 = A2、B2 = 余り) と数値、q099 の金額・日数、q062 (2024) の配列・文字列、q062 (2009h21a) の文字番号・26・tmb はいずれも不使用 (2009h21a-q062 の「足す + 余り」の 2 操作の一般化は逆算の一般原則で、u06 前例と同じく写しではない)。具体例は自作 (平均を表示するプログラム、x = 8 / y = 4、42 / "ABC"、飲食店・戸締まり・電卓・コピー機・クリーニング店)。
5. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 3/3/3/3/2 文、定義前使用: 引数・戻り値 は r1 MEDIUM (手続 detail・関数 図・pairs[0] で定義前使用) を「受け取る値」「結果の値」「値を渡して」に直して解消 ✓。部品 (overview_rows の「部品 (副プログラム)」、日常語) / 擬似言語・繰返し・代入 (u01・u02 の見出し語) / 論理型・文字列型 (戻り値 points[1] で同格説明) / return (関数 detail で定義) は OK。`配列`・`要素番号` (引数 points[1]) は本単元にも前提単元にも定義が無い → L7。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh・en 相当語): ヒットは「外へ出る」「出るもの」「出る向き」(入出力の意味の動詞)、手続 points[2]「範囲に入る値を選ぶ」(解き方の動詞)、`kind: "exam"` → 偽陽性。**「と覚えられる」2 件** (手続・関数 の hook_jp + 派生) と **関数 `detail_en` の "exam notation"** (jp に無い試験への言及) → L2 / L5。図の型: 入出力・手続 = flow steps 3、関数 = flow steps 4、引数・戻り値 = static table; 全て登録内 (関数 の静的 SVG → 段階図は r1 low の解消)。pair 配置 (手続→関数、引数→戻り値、各組 key 行あり)。
6. **D-200**: 考点数 1/3/2/2/3 (≤3 ✓)、各 JP 文数 1〜2・字数 35〜98 (≤100 ✓、最大は手続 `points[2]` 98 字)。**framing 件数** (validateV2 `pointFraming` を tsx で実行、全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 / D-204 / D-205 単元全体点検**: 書き方 7 (欄同士): r1 MEDIUM の 入出力 mix 考点 (入出力をプログラムと外部の間に限定) は削除済みで、入出力 detail 3 文目・points[0]・pairs[1].rows[2]・戻り値 one・goals[0] が「部品にも入出力の考え方を当てはめる」で一致 ✓。pairs[1].rows[1].b は「関数の中の return の後ろ」に直り、手続 = 返さない と整合 ✓ (r1 low 解消)。手続「値を返さない」/ 関数「return で返す」/ key_points[3] / overview_rows[1..2] の型の有無 一致。関数 detail・図 caption の「呼び出されるときに値を受け取り」は引数の無い関数を想定しない言い切り (r2 low 継続) → L6。書き方 8 → L4。書き方 9 (限定条件) → §2 表、落ち 0。§6 → L3。D-205: 改訂される文書の構成数の記述なし (対象外)。D-208 (3) 別名: 本単元に別名語なし ✓。(10) 閉じた列挙: 戻り値 points[1]「数値に限らない…もある」、戻り値 fig は「例」の表で閉じた列挙ではない ✓。(7) D-210: 法令・規格の改正前文言の題なし (対象外)。(8) 比喩の鍵語: 手続「戸締まり」・関数「電卓の平方根キー」・引数「コピー機」は他見出し語の語幹・役割を指さない ✓。(9) フックを引用題に当てる: 戻り値 hook「return の後ろを見れば何が返るか」は q096 / q064 で返る変数 (num / calcX) を示すだけで、値は points[0] のとおりたどる必要があり誤答を選ばせない ✓; 関数 hook「値を入れると結果が出る箱」・手続 hook「一歩ずつ進める」も q053 / q085 の誤答へ寄らない ✓。(6) zh / en が誤答肢寄り: 手続 points[1] zh / en は「退避した値を相手へ」で誤答 (B ← A) と読めない ✓。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 10 種 (入出力 / 入力 / 出力 / 手続 / 関数 / 引数 / 戻り値 / アルゴリズム / 論理型 / 文字列型) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 5 用語に見出し語の `[[jp:]]` あり (D-202)、zh 訳語が `zh_terms.json` に従うこと (输入输出 / 输入 / 输出 / 过程 / 函数 / 参数 / 返回值 / 逻辑型 / 整数型 / 伪代码 / 循环 / 赋值 一致、validate の B6 warn 0 / jp-origin warn 0)。loc r1 MEDIUM (関数 `detail_en` の仮名のまま) は "functionName(整数型: name)" + 整数型 の注に直り解消 ✓。関数 hook_zh「日语里它原本写作“函数”」は zh 読者向けに正しく限定。`detail_en` の「例えば」相当なし (counts as … で例示の意味は保たれる)。
9. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 入出力 | OK — exam 1 / 2 題: 部品を直列につなぐと前の部品の出力がそのまま次の部品の入力、値は前から順に求める (2019h31h-q071 正答ア = 1 / 2009h21h-q072 正答イ = 3、手トレース一致)。detail (キーボード・ファイル = 入力、画面・ファイル書込み = 出力、「例えば」あり)、flow steps 3 (2 数を読む → 平均 → 表示) 正しい。hook (I/O) 事実 | OK | OK | なし |
| 2 | 手続 | OK — exam 3 / 3 題: アルゴリズム = 目的達成のための処理手順 (2013h25h-q053 正答イ) / 交換は上書きで消える側を先に退避し最後に戻す (2010h22h-q053 正答イ、手トレース) / 足す・引くは逆操作で後ろから、余りは範囲に入る値を選ぶ (2009h21a-q062 正答エ sky、再計算; 限定「元に戻せる操作」「取りうる範囲」保持)。one (値を返さず戻る)・detail (広義の手順の意味もある、宣言形)・flow steps 3 正しい。hook (procedure ← 前へ進む) 事実 | points[0] 近似一致 (L1) | points[1] zh / en の語 (L8) | L1, L2, L8, L9 |
| 3 | 関数 | OK — exam 1 / 1 題 + mix 1: 繰返し途中の return で関数が終わり残りは実行されない (2026r08-q085 正答エ、num = 2 / 4 / 5 で手トレース) / mix: 手続は値を返さず、関数は返すので代入の右辺・式の中に書ける — 正しい。detail の宣言形・return の働き正しい。hook (函数・函 = 箱) は字義として正しく語源とは言い切らない | OK | detail_en "exam notation" (L5) | L2, L5, L6 |
| 4 | 引数 | OK — exam 2 / 3 題: 複数の引数を組み合わせて処理を分ける (2025r07-q099 正答ウ 3,000、手トレース) / 配列も渡せ、要素番号で参照 (2022r04-q078 正答イ / 2024r06-q062 正答エ、手トレース)。detail (部品への入力、宣言の順に渡す)・table (x ← 8 / y ← 4) 一致 | 配列の定義前使用 (L7) | OK | L4, L7 |
| 5 | 戻り値 | OK — exam 2 / 4 題 + mix 1: 繰返し後に return → 最後までたどった値 (2022r04-q096 正答エ 13 / 25 / 2023r05-q064 正答ウ、手トレース) / 数値に限らず論理型・文字列型も (2026r08-q085 論理型 / 2024r06-q062 文字列型) / mix: 引数 = 入る値、戻り値 = 返る値。detail (型は宣言行の名前の前の型と一致) 正しい。table (42 / true・false / "ABC") 正しい | OK | hook_en の同語反復 (L2) | L2, L3, L4 |

**単元レベル**: goals 3 点・overview_cols 2 (区分 / 見分ける手がかり)・overview_rows 5 行・pairs 2 組 (手続 / 関数 3 行 key 1、引数 / 戻り値 3 行 key 1)・key_points 4・summary (記法除去版と一致)・overview.intro (goals の連結、三語一致)・challenge_questions 5 件 (全て本文で引用、§1-3)。key_points[1]「名前を書くだけで何度も使える」は処理を書き直さずに済むことの対比で、引数を不要とは言っていない (L6 に併記)。事実誤りなし、三語一致。

**前ラウンド指摘の解消確認**: jp-review r1 MEDIUM 6 件 (入出力 mix の範囲 / 引数・戻り値の定義前使用 / 関数 points[0] の qids / 引数 points[0] の並び順 / 引数 hook の数の像 / 手続 points[2] の無条件逆算) → 全て解消、退行なし。r1 low (関数 SVG → 段階図、pairs[1].rows[1].b、入出力 quiz 空) 解消。r2 low 8 件は L1〜L9 に継続記録 (新規の上積みなし)。loc-review r1 MEDIUM (関数 detail_en の仮名) 解消、r1 low 4 件 (归纳 → 组织/封装/集中、remainder の訳、points[0] zh の「中」、引数 one_en) 全て適用済み、zh / en で退行なし (D-208 (5))。loc r2 low 4 件は未適用 → L2 (hook_en)・L8 (临时变量)・O2 (`[[jp:]]` 配列等)・L4 付記 (引数 detail_en 語法)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 1: L1)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1](手続).points[0].text_jp` / `text_zh` / `text_en` | 2013h25h-q053 正答イとの近似一致 (節 ed 0.30 / Dice 0.63、§1-4)。分類題の正答を見出し語の一般定義として述べる形で事実は正しく、誤答も支持しないが、正答肢の語の並び (目的を達成…ための処理…手順) をほぼ保つ。標準定義の前例 (ed 0.19 / Dice 0.70 = LOW 建議修) と同扱い | jp「**アルゴリズム** は、ある目的を達成するための処理の手順を指す言葉である。」→「**アルゴリズム** は、求める結果を得るために、どの処理をどの順に行うかを決めた手順を指す言葉である。」/ zh「**算法**（[[jp:アルゴリズム]]）指的是为了达成某个目的而进行的处理步骤。」→「**算法**（[[jp:アルゴリズム]]）指的是为了得到所求的结果，规定按什么顺序进行哪些处理的步骤。」/ en "An **algorithm** ([[jp:アルゴリズム]]) is the sequence of processing steps used to achieve a given goal." → "An **algorithm** ([[jp:アルゴリズム]]) is a set of steps that fixes which processing to do, and in what order, to get the result you want." |
| L2 | LOW | `terms[1].hook_jp`・`terms[2].hook_jp` (+ 派生 `memory_hook_jp`、`summary.memory_hooks_jp[1..2]`)、`terms[4].hook_en` | 4 フック中 2 つが「〜と覚えられる」で結ぶ (§9 同型の結び、記憶フックの言い方として許容; u06 前例と同じ扱い)。戻り値 hook_en "In English it is a return value" は英語読者には同語の言い直し (loc r2 low、jp の手がかり [return 命令と同じ語] は伝わる) | 記録のみ (任意: hook_en → "The name says it all: a return value is what the return instruction in the pseudo-language gives back, so look after return to see what comes back.") |
| L3 | LOW | `terms[4](戻り値).analogy_jp/zh/en` | クリーニング店の比喩は「預けた服が仕上がって戻る」で、戻り値 = 渡したもの (引数) が加工されて戻る、という像になりやすい (r2 low 継続)。pairs[1] は引数と戻り値を別の値として扱うが、平方根のように入力を変換した値を返す関数もあり矛盾ではない。引用題の誤答にも寄らない | 記録のみ (任意: jp「自動販売機にお金を入れてボタンを押すと飲み物が出てくる、その出てきた飲み物にあたる。」/ zh「就像往自动售货机投币并按下按钮后掉出来的饮料，那瓶掉出来的饮料就相当于返回值。」/ en "It is like the drink that drops out of a vending machine after you put in coins and press a button: the drink that comes out is the return value.") |
| L4 | LOW | `pairs[1].rows[0]` / `rows[2]`、`terms[4].points[2]`、`terms[3].detail_jp` 1 文目、`terms[4].one_jp` 後半; `pairs[0].rows[0]・rows[2]` と `terms[2].points[1]` | 書き方 8: 引数 = 部品への入力 (呼出し元 → 部品) / 戻り値 = 部品からの出力 (部品 → 呼出し元) の対比が pairs 2 行・mix 考点・detail・one に繰り返される (r2 low 継続)。手続 / 関数 の「返さない / 返す・式の中に書ける」も pairs と mix 考点で 2 箇所 (許容範囲)。付記: 引数 `detail_en` 3 文目の語法 (loc r2 low) | 記録のみ (入出力の観点で引数・戻り値を位置づけるのが単元の構成で、削ると goals[0] とのつながりが消える) |
| L5 | LOW | `terms[2](関数).detail_en` (+ 派生 `explanation_en`) | "where 整数型 is the exam notation for integer type" は jp に無い試験への言及 (loc r1 MEDIUM の修正案どおりの注で、定型締め句ではない) | 記録のみ (任意: "the exam notation" → "the pseudo-language's notation") |
| L6 | LOW | `terms[2].detail_jp` 1 文目 / `terms[2].fig.steps[0].caption_jp`、`key_points_jp[1]` | 「関数は呼び出されるときに値を受け取り」「値を添えて」は引数の無い関数を想定しない言い切り (r2 low 継続)。key_points[1]「名前を書くだけで」も引数を書く場合を含めない書き方。引用題の関数は全て引数を持ち、誤答を支持しない | 記録のみ |
| L7 | LOW | `terms[3](引数).points[1].text_jp/zh/en` | `配列`・`要素番号` が本単元・前提単元 (u02) で定義されないまま使われる (D-195 定義前使用)。引用題 2 題が配列引数を前提にし、括弧内で「要素番号で参照」と働きは示す | 記録のみ |
| L8 | LOW | `terms[1](手続).points[1].text_zh` / `text_en` | 「作業用の変数」を zh「工作用变量」/ en "a work variable" と直訳 (loc r2 low 未適用)。意味は通じる | 記録のみ (任意: zh「暂存到工作用变量里」→「暂存到临时变量里」/ en "first saved to a work variable" → "first saved to a temporary variable") |
| L9 | LOW | `terms[1](手続).points[0..2]` | 手続 の 3 考点はどれも広義の「処理の手順」(アルゴリズムの定義・交換の手順・逆算) で、one が定義する部品 (値を返さない副プログラム) としての手続を問う考点が無い。detail 1 文目 (広義の意味もある) が橋渡しし、引用題も手順の意味で「手続」を使う (2009h21a-q062) ため矛盾ではない (r2 low 継続) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 手続 = 返さない / 関数 = 返す: `pairs[0].rows[0]`、各 one (定義そのもの)、`terms[2].points[1]` (mix)、overview_rows[1..2] (総表の構造) → 許容。② 宣言行の型の有無: `pairs[0].rows[1]`、手続 detail・関数 detail (宣言形の説明)、key_points[2]、overview_rows → 定義の説明で反復とは数えない。③ 引数 / 戻り値 の向き・入出力での役割: → L4。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿、B2 審査済み)。
- O2 考点の zh / en で擬似言語の表記語 (配列・繰返し・変数) に `[[jp:]]` が無い (loc r2 low、validate warn 0、任意)。
- O3 独立 copy 照合の近似一致 (1) 2026r08-q088 は一般動詞句の偽陽性 (§1-4)。

確認済みで問題なし: 擬似言語・手順の引用題 11 題 + 未引用 1 題の手トレース (全て正答と一致)、単元内のコード例・図の値、限定条件 (考点 9 件の qid 付き全て保持)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤98 字)、図の文字列の写し (validate 0、独立照合は L1 と偽陽性のみ)、`[[jp:]]` 原語 (10 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (5/5)、zh 訳語表 (B6 warn 0)、図種 (flow steps ×3 / static table ×2 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、前ラウンド HIGH / MEDIUM の解消と zh / en の退行なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 1: L1 / 記録のみ 8: L2〜L9、うち L2・L3・L5・L8 は任意の修正案あり) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 11 件 (qid 付き 9 件)・引用 11 題 (全て手トレースで正答一致) + 未引用 1 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。LOW 建議修 1 件 (L1) は補丁 (B3) で修正推奨、L2〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-37-u03
✓ technology-14-37-u03 unit: 0 issues (data/ip/textbook/units/technology-14-37-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-14-37-u03
✓ technology-14-37-u03 parity: 29 locations, 0 diff
EXIT=0
```
