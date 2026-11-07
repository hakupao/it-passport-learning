# Rule A 全数抽検 — technology-14-37-u02 (式・代入・注釈)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S150 b51)、repo HEAD `be49bdf9` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b51-u02-a2` merge 結果、sha256 先頭 `52eebf2f8765ede3`)。
- **対象**: `data/ip/textbook/units/technology-14-37-u02.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (式 / 演算子 / 条件式 / 代入 / 注釈) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-210、共通指示 (既知失敗型 (1)〜(10))。比較: `data/ip/textbook/.planning/v2/technology-14-37-u02/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致、`unit_summary_*` は v1 と同文)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・前回修正の zh / en 回帰 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (nodes・tree label・table cells・steps caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版 (`**` 除去、`[[jp:X]]` → X) であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題**: 考点 全 9 件 (exam 7 + mix 2)、qid 付き 7 件、引用 qid 延べ 10 件 = 異なり 8 題 (2022r04-q096 / 2025r07-q078 / 2026r08-q085 / 2022r04-q078 / 2011h23tokubetsu-q093 / 2025r07-q099 / 2010h22h-q053 / 2010h22a-q069、全題 topic `technology-14-37`)。`questions.json` + `translations/<exam>.json` の stem_jp_clean で題文・プログラム・選択肢・`correct_answer` を再読 (2010h22h-q053 / 2010h22a-q069 は raw stem に OCR 崩れあり、clean で判定)。
3. **擬似言語の手トレース** (引用題・quiz・challenge の全プログラム / 手続、及び単元内の全コード例を自分で実行):
   - **2022r04-q096** (calcX / calcY の空欄 a・b): a = `num + 2×i` のとき calcX(1) は i = 1,2,3 で 1 → 1+2 = 3 → 3+4 = 7 → 7+6 = **13** ✓、calcY(1) は b = i を 2 から 6 まで 2 ずつで i = 2,4,6 → 1+4 = 5 → 5+8 = 13 → 13+12 = **25** ✓ → 正答エ 一致。a = `2×num + i` だと calcX(1) が 1 → 2+1 = 3 → 6+2 = **8** となり題の推移 (7) と合わない → ア・イ 不成立。b = 1 から 7 まで 3 ずつ (i = 1,4,7) だと calcY が 1 → 3 → 11 → 25 で途中の推移が合わない → ウ 不成立。**× が + より先** (2×i を先に計算) が判別点で、演算子 `points[1]` の主張 (b × 2 が先) と一致。
   - **2025r07-q078** (calcMod3): i = 1〜7 のうち i ÷ 3 の余りが 0 = i ∈ {3, 6} → totalValue = 0+3+6 = **9** → 正答エ 一致。
   - **2026r08-q085** (isPrime): a = より小さい (num < 2 → false)、b = より大きい (while num > div)。isPrime(2): 2 < 2 偽 → while 2 > 2 偽で即抜け → **true** ✓ (題の例と一致)。isPrime(4): 4 > 2 真、4 ÷ 2 の余り 0 → **false** ✓。isPrime(5): div = 2,3,4 で余り 1,2,1 → div = 5 で 5 > 5 偽 → **true** ✓。a = 以下 だと isPrime(2) が false になり題の例に反する → ア・イ 不成立、b = と等しい だと isPrime(5) で 5 = 2 偽 → 即 true、isPrime(4) も 4 = 2 偽 → true (誤り) → ウ 不成立 → 正答エ 一致。
   - **2022r04-q078** (checkDigit の空欄 a): k ← j ÷ 10 の商、a = `j ← k + (j − 10 × k)`。j = 19 → k = 1 → j = 1 + (19 − 10) = **10** → 9 より大きいので再度 k = 1 → j = 1 + 0 = **1** ✓ (1+9 → 10 → 1+0 = 1、各桁和の繰返しと一致)。j = 81 → k = 8 → j = 8 + 1 = **9** ✓。ア `j − 10×k` は 19 → 9 (一の位だけで十の位を捨てる) ✗、エ `k + j` は 19 → 20 → 22 → … と増え続け終わらない ✗、ウ `k + (j − 10) × k` は 19 → 1 + 9×1 = 10 → 1 + 0 = 1 と偶然一致するが j = 81 → 8 + 71×8 = 576 ✗ → 正答イ 一致。**括弧の中・× が − より先**が必要で、演算子 `points[1]` の引用として正当。
   - **2011h23tokubetsu-q093** (購入条件の条件式 a): 大人・子供それぞれ 0〜20 枚の両方を満たすとき Yes → 2 条件を **and** → 正答ア 一致。or (イ) は片方だけ満たせば Yes になり購入条件に反する、合計 ≦20 (ウ) は各 20 枚まで・合計 20 以上は割引という仕様と食い違う、両方 > 20 (エ) は逆。
   - **2025r07-q099** (calculateAmountOfPrize): (200000, 3) → 外側 improvement < 100000 偽 → else 枝、内側 period < 7 真 → **2000**。(50000, 14) → 外側 真 → 内側 14 < 7 偽 → **1000**。合計 **3,000** → 正答ウ 一致。外側の真偽で枝が決まり、その中で内側を評価 = 条件式 `points[1]` と一致。
   - **2010h22h-q053** (変数の入替え): イ TMP←A, A←B, B←TMP で A=a, B=b → TMP=a, A=b, B=a ✓。ア は B←A で B=b (既に上書き後の A) ✗、ウ TMP←B, A←B で a が失われ B←TMP = b ✗、エ も同様に a が失われる ✗ → 正答イ 一致。
   - **2010h22a-q069** (手続の繰返し): x=2, y=3 → y=2, x=4 (y≠1 → 戻る) → y=1, x=5 (y=1 → 終了) → **x = 5** → 正答イ 一致。
   - **2024r06-q062** (quiz、convert): 要素が 1 と等しければ "A"、それ以外は "B" → "AABAB" = 1, 1, ≠1, 1, ≠1 → {1, 1, 2, 1, 0} → 正答エ 一致 (ア "BBABA"、イ "BABAA"、ウ "ABABB")。
   - **2015h27a-q048** (challenge、比較回数の最小): 件数の多い順に x = C(50), y = B(30), z = A(10) → 50×1 + 30×2 + 10×3 + その他 10×3 = 50+60+30+30 = **170** → 正答ア 一致。
   - **単元内のコード例**: 式 fig `(4 + 6) × 2` → `10 × 2` → **20** ✓ / 代入 fig `n ← n × 2` (n = 5) → 右辺 5 × 2 = 10 → n = **10**、元の 5 は残らない ✓ / 「a + b × 2」は b × 2 が先 ✓ / 「a ≧ 18」は a が 18 以上で真 ✓ / overview `x ≧ 0 and x < 10` (0 以上 10 未満で真) ✓ / `s ← s + x` (右辺を今の s で計算し s を更新) ✓ / 真理値表 4 行 (真真 → and 真・or 真、真偽 → 偽・真、偽真 → 偽・真、偽偽 → 偽・偽) ✓ / 条件式 hook (真 = 1・偽 = 0: and = 積 1·1 = 1・1·0 = 0、or = 和 ≥ 1: 1+0 = 1 → 真、0+0 = 0 → 偽) 4 組とも ✓。
   - **mod / 整数除算**: 単元は「割り算の**余り**を求める演算」(演算子 `points[0]`) を言葉で述べるだけで、記号 (mod / %) も、整数どうしの素の ÷ の結果 (切捨てか否か) も主張しない。引用題は ÷ を常に「の余り」(q078 / q085) 「の商」(2022r04-q078) で修飾している → 検証すべき整数除算の結果主張は単元に無い。
4. **擬似言語の記法 (IPA 擬似言語の記述形式 × 引用題での現れ方)**:

   | 単元の記法 | 単元の箇所 | 引用 / quiz / challenge 題での現れ方 | 判定 |
   |---|---|---|---|
   | 代入 `←` (右辺を評価して左辺に格納) | 代入 one・detail・fig、overview_rows[3]、pairs[1].rows[0] | 2022r04-q096 / 2022r04-q078 / 2026r08-q085 / 2025r07-q078 / 2025r07-q099 のプログラム、2010h22h-q053 (題が「x←y = y のデータで x を置き換える」と定義) | 一致 |
   | 注釈 `/* 〜 */` | 注釈 detail、overview_rows[4] | 2022r04-q078 (while 内の注釈) | 一致 |
   | 注釈 `//` | 注釈 detail | 2025r07-q099 (引数・変数の単位)、2024r06-q062 (空文字列の注記) | 一致 |
   | 算術 `+ − × ÷` | 演算子 fig | × = 2022r04-q096 / q078、÷ = q078 / q085 / 2022r04-q078 (常に「の余り」「の商」付き) | 一致 (÷ の素の結果は主張なし、§1-3) |
   | 比較 `= ≠ < ≦` / `≧` | 演算子 fig、条件式 detail・overview、pairs[1].rows[0] | 令和の IP 題は「が 0 と等しい」「より大きい」「より小さい」と**言葉で**書く (q078 / q085 / q099 / q062)。記号は 2011h23tokubetsu-q093 (≦)・2010h22a-q069 (≠, =)・2009h21a-q090 (≦, >) の流れ図 / 手続のみ | IPA の演算子表 (関係演算子 ≠ ≦ ≧ < = >) と整合。引用題では記号で示されない (≠ は手続 q069 のみ) — 誤りではなく、観察 O2 |
   | 論理 `and or not` | 演算子 fig、条件式 detail・table・hook | and = 2011h23tokubetsu-q093 正答ア、or = 同 誤答イ | 一致 (not は題に無いが IPA の単項演算子で事実どおり) |
   | 優先順位 (括弧 → 乗除 → 加減) | 演算子 detail・points[1]、key_points[0]、式 fig | 2022r04-q096 (2×i が先)、2022r04-q078 (括弧内、10×k が先) | 一致。単元は関係・論理演算子との間の順位や not の順位は述べない (誤りなし) |
   | 「=」= 比較 (代入ではない) | 条件式 points[2]、pairs[1].rows[0] | 擬似言語では正しい。ただし 2011h23tokubetsu-q093 の流れ図は処理箱で「L＝−1」等、＝ を代入の意味で使う (旧形式の流れ図) | pairs 行に範囲が無い → **L3** |

5. **quiz / challenge_questions**: quiz = `terms[2].quiz` (2024r06-q062 / 2025r07-q078 / 2025r07-q099)、`terms[3].quiz` (2010h22h-q053 / 2022r04-q078)。challenge 4 件 = 2010h22a-q069 / 2015h27a-q048 / 2026r08-q085 / 2022r04-q096 (v1 は 2022r04-q096 / 2024r06-q062 / 2025r07-q078 / 2026r08-q085 / 2009h21a-q090 の 5 件; q062 / q078 は quiz へ移り、q090 は外れ、q069 / q048 を追加)。全題 §1-3 で解き直し、本文はどの誤答肢も支持しない (2×num+i / 素の ÷ / or での購入条件 / B←A の直接代入 等を誘う記述なし)。2015h27a-q048 は「比較を上から順に行う」= 条件式 `points[1]` (外側から順に評価) と overview の「分岐の判定」で、並べ方を試算すれば解ける (件数の多い区分を先に置く工夫そのものは単元に無いが、手トレースで導ける) → 単元に合うと判断、指摘なし。
6. **D-198 写し**: validate の copy guard = 0 件 (`warn  choice-echo` 行の出力なし)。独立照合: 単元の JP 文字列 127 本 (派生フィールド・summary・source_figures 除く) を topic 内全 32 題の stem_jp_clean + 選択肢と 12 字連続照合 (句読点・記号・空白・記法除去) — **カタカナ 4 字以上と英数を □ に遮蔽: 0 件 / 遮蔽なし: 0 件 / 1〜2 字置換の近似一致: 0 件**。カタカナの多い文 (ホワイトボード・オペランド) を目視 — 題文に該当句なし。(iii) 選択肢なぞり: 条件式 `points[0]` (2011h23tokubetsu-q093) は and の一般的な働きだけを述べ、比較相手の or・合計の条件・枚数 / 金額を持ち込まない (D-209 の分類型の免除内); 代入 `points[0]` (2010h22h-q053) は変数名 (TMP / A / B) も 3 手順の並びも再現しない; 演算子 `points[0]` は q078 / q085 の数値 (3・7・9・2) や関数名を使わない; 条件式 `points[1]` は q099 の金額・日数・賞金額を使わない; 演算子 `points[1]` の例「a + b × 2」は q096 の選択肢の式 (2×num+i / num+2×i) と項の並びも変数も異なる自作例 → 該当なし。単元のコード例 ((4+6)×2、n ← n×2、a ≧ 18、x ≧ 0 and x < 10、s ← s + x) はいずれも題に無い。
7. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、detail 3 文 × 5、比喩 (電卓 / 料理の動詞 / 身長の目盛り / ホワイトボード / 地図のメモ) は別場面、hook は語源・字形・1/0 の対応・矢印の向き (§6: 式 hook は定義寄り → L8)。定義前使用: 変数 = 式 detail で定義、被演算子・優先順位・余り・真・偽 = 太字で導入、評価 = one で使い detail で定義・代入 = 式 / 条件式の mix 考点で term 4 より前に使用 (総表に一行定義あり) → L9。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が): jp **0 件**。zh / en (必须 / 考试 / must / always / every / exam): always 2 = `goals_en[1]` + 派生 `overview.intro_en` (「真か偽のどちらか」の訳、通常語)、every 3 = `terms[2].points[0].text_en`「every condition」・`terms[3].points[1].text_en`「every pass」・`key_points_en[1]` (+ 派生) (通常語)、exam = `kind: "exam"` と example 内 (偽陽性) → 全て偽陽性。図種: 式 = flow steps 3、演算子 = tree static、条件式 = table static、代入 = flow steps 4、注釈 = 図なし (validate 0 issues = 登録 6 種内)。pair 配置: 式 / 条件式 (3 行、key 1) = 条件式の後、条件式 / 代入 (3 行、key 1) = 代入の後。
8. **D-200**: 考点数 2/2/3/2/0 (≤3 ✓、注釈 0 は jp-review a1 r2 の指示どおり削除)、各 JP 1〜2 文、字数 41〜64 (≤100 ✓、最大は代入 `points[0]` の 64 字)。**framing 件数** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0。
9. **D-202 / D-203 / D-204**: 書き方 7 (欄同士の照合: 式 one「評価すると一つの値」= overview_rows[0] = detail「数値 1 つや変数 1 つでも式」[a1 r1 MEDIUM 解消]; 式 mix「変数の中身は変えない」と pairs[1].rows[1]「条件式 = 変わらない」一致; 論理演算子 = fig「組み合わせたり反転したり」・detail 同文・条件式 detail「not は入れ替える」一致 [a2 r1 MEDIUM 解消]; 代入 detail「実行した順」と points[1] 一致; key_points_jp[1] の or → L2) → 不整合は L2 のみ (LOW)。書き方 8: ① 変数を変えない / 書き換える = 式 `points[1]` + `pairs[1].rows[1]` の 2 箇所、② = / ← = 条件式 `points[2]` + `pairs[1].rows[0]` の 2 箇所 → ≤2 で許容。書き方 9 (限定条件): exam 考点 7 件 — q093 の「購入条件 = それぞれの枚数条件をすべて」は「すべて満たすことを求める判定には」で保持、q099 の入れ子は「分岐の中にさらに分岐があるときは」で保持、q069 / q096 の繰返しは「繰返しの中の」で保持 → 落ち 0。D-204 (比喩・図の範囲): 電卓の比喩「イコールを押す」→ L7 (記録のみ)。
10. **D-205 / D-210**: 改訂される規格・法令・知識体系の構成要素の数・名称なし。IPA 擬似言語の注釈記法は「例えば」付きで開いた列挙 → 対象外。
11. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・caption の三語一致 (parity 27 locations 0 diff)、`[[jp:…]]` 原語 12 種 (式 / 評価 / 変数 / 演算子 / 被演算子 / 優先順位 / 余り / 条件式 / 真 / 偽 / 代入 / 注釈) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 5 用語に見出し語の `[[jp:]]` あり、zh 訳語は `zh_terms.json` (表达式 / 运算符 / 条件表达式 / 赋值 / 注释) に一致 (変数・優先順位 等は表に無く、变量 / 优先级 / 操作数 / 余数 は通常訳)。型 (6) zh / en の語が誤答肢寄りか: key_points_zh[1]「任一条件为真」・en「any one of them」は包含的な or で jp より明確、他に誤答寄りの訳なし。型 (5) 回帰: a2 r1 MEDIUM (not を「組み合わせる」に含めない) は zh「组合或反转真假」・en「combine or invert」で fig・detail とも反映 ✓。
12. **前回指摘の解消確認** (journal `b51-u02-a1` / `b51-u02-a2` type:"result"):
    - a1 jp-review r1 MEDIUM ×3: 式 `points[0]` が空欄問題の解き方 + 代入文 (2022r04-q078) を「式」と呼んでいた → 式の事実 (評価時点の変数の値で決まる) に改め、qid は q096 のみ ✓ / 条件式 `points[0]`「上限と下限を同時に課す」→ 削除し「すべて満たすことを求める判定」に ✓ / 式 one「演算子でつないだ記述」と detail の範囲差 → one を「評価すると一つの値が得られる記述」に ✓。
    - a1 jp-review r2 MEDIUM: 注釈の exam 考点 (根拠題が注釈を問わない) → 削除、`terms[4].points = []` ✓。r2 LOW「条件式を入れ子にした分岐」→「分岐の中にさらに分岐があるとき」✓。
    - a2 jp-review r1 MEDIUM: 論理演算子の役割「組み合わせる」が not と食い違う → fig `logic_r`・detail とも「組み合わせたり反転したりする」✓。r1 LOW「文の順番どおり」→「実行した順に」✓。
    - a2 jp-review r2 PASS の LOW 8 件・loc-review r1 PASS の LOW 5 件は §3 に継承 / 再判定 (未修のまま残る)。
13. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件、トレース) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 式 | OK — exam 1 / 1 題: 式の値は評価時点の変数の値で決まり、変数が変われば結果も変わる (2022r04-q096 正答エ: num + 2×i が繰返しごとに 3 → 7 → 13 と変わる、§1-3 で再計算) / mix: 式は値を求めるだけで変数を変えず、書き換えるのは代入 (pairs[1].rows[1] と一致)。flow steps 3 ((4+6)×2 → 10×2 → 20) 再計算一致。detail「数値 1 つ・変数 1 つでも式」は事実どおり | OK (§6 hook → L8) | overview_rows[0].one_line_en の循環 → L5 / caption_zh → L6 | L5, L6, L8, L9, L10 |
| 2 | 演算子 | OK — exam 2 / 4 題: 余りが 0 なら割り切れる (2025r07-q078 正答エ 9 = 3+6、2026r08-q085 正答エ、§1-3 で再計算) / 優先順位で a + b × 2 は b × 2 が先、加算を先にするなら括弧 (2022r04-q078 正答イ [括弧内・10×k 先] / 2022r04-q096 正答エ [2×i 先]、判別点として正当)。tree (算術 + − × ÷ / 比較 = ≠ < ≦ / 論理 and or not) は IPA の演算子表と整合、論理の役割「組み合わせたり反転したり」は not を含めて正しい | OK | hook_en の「子」→ L4 | L4, L10, L11 |
| 3 | 条件式 | OK — exam 2 / 2 題: すべて満たすことを求める判定は and (2011h23tokubetsu-q093 正答ア; 限定条件「すべて満たすことを求める」保持、or [誤答イ] を支持しない) / 入れ子の分岐は外側の真偽で枝が決まり、その中で内側を評価 (2025r07-q099 正答ウ 2000 + 1000 = 3000、再計算一致) / mix: 条件式の「=」は比較で、代入 (←) と違う (擬似言語の記法として正しい)。table (真理値表 4 行) と hook (1/0 の積・和) 検算一致。quiz 3 題 (q062 / q078 / q099) は本文で解ける | OK | `[[jp:演算子]]` の併記範囲 → L12 | L2 (key_points), L12 |
| 4 | 代入 | OK — exam 2 / 3 題: 入替えは退避用の変数を使い、使わないと最初の代入で片方が失われる (2010h22h-q053 正答イ、§1-3 で 4 肢とも追跡) → 退避する値の特定が無い → L1 / 繰返しの中の代入は毎回更新し次はその値から (2010h22a-q069 正答イ x = 5 / 2022r04-q096、再計算一致; 限定条件「繰返しの中の」保持)。flow steps 4 (n = 5 → 右辺 10 → n に格納 → 5 は残らない) 一致。one「擬似言語では「←」」は q053 の定義・各プログラムと一致 | OK | OK | L1, L3 (pairs), L10 |
| 5 | 注釈 | OK — 考点 0 (a1 r2 MEDIUM の指示どおり exam 考点を削除)。one「実行の対象にならない」・detail「IPA の擬似言語では、例えば /* 〜 */ や // の後ろ」は 2022r04-q078 (/* */) / 2025r07-q099・2024r06-q062 (//) の記法と一致、「書き足しても消しても処理結果は変わらない」は事実どおり | OK (図なし = 定義型) | detail_zh「使用用」→ L13 | L13 |

**単元レベル**: goals 4 点・overview_cols 2 (何をするか / 擬似言語での例)・overview_rows 5 行 (例はすべて IPA 擬似言語の記法)・pairs 2 組・key_points 4・summary (記法除去版と一致)・challenge_questions 4 件 (§1-5、本文と矛盾なし、全て解ける)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 13 (うち 建議修 6: L1〜L6)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[3](代入).points[0].text_jp / text_zh / text_en` | 「一方の値を退避用の変数に先に移しておく」は必要条件として正しいが、どちらの値を退避するかを言わない。2010h22h-q053 の 4 肢はすべて最初に退避用の変数へ移す手順で始まり、誤答ウ・エ (上書きされない側を退避) もこの規則を満たす → 規則だけでは正答イと誤答を区別できない (誤答を選ばせるわけではないので型 (9) MEDIUM には当たらない)。2 文目「最初の代入で片方の値が上書きされて」が手がかりにはなる | jp before「2 つの変数の値を入れ替えるには、一方の値を退避用の変数に先に移しておく。」→ after「2 つの変数の値を入れ替えるには、これから上書きする変数の値を、先に退避用の変数に移しておく。」/ zh before「要交换两个变量的值，先把其中一个的值移到临时变量里。」→ after「要交换两个变量的值，先把即将被覆盖的那个变量的值移到临时变量里。」/ en before "To swap the values of two variables, first move one of them into a temporary variable." → after "To swap the values of two variables, first move the value of the variable about to be overwritten into a temporary variable." (2 文目は三語とも不変。変数名・手順の並びは持ち込まない) |
| L2 | LOW **建議修** | `key_points_jp[1]` (+ 派生 `summary.key_points_jp[1]`) | 「or はどれか一つが真のときに真になる」は「でも」が無く、ちょうど一つだけ真 (排他的論理和) とも読める。条件式 detail「どれか一つでも真なら真」・真理値表 (真・真 → 真) とは事実上矛盾しないが、要点だけを読むと誤解の余地 (jp-review a2 r2 LOW、未修)。zh「任一条件为真时为真」・en「any one of them is true」は包含的で問題なし | jp before「**条件式**の値は真か偽で、and はすべての条件が真のとき、or はどれか一つが真のときに真になる。」→ after「**条件式**の値は真か偽で、and はすべての条件が真のとき、or はどれか一つでも真のときに真になる。」(zh / en 不変) |
| L3 | LOW **建議修** | `pairs[1].rows[0].label_jp / label_zh / label_en` | 「記号」の行は 条件式 = 「=」、代入 = 「←」を範囲なしで対比する。代入 one は「擬似言語では」と範囲を限るが、この行には無い。引用題 2011h23tokubetsu-q093 の流れ図は処理箱で ＝ を代入の意味で使っており (旧形式)、どの記法でも成り立つ区別と読まれるおそれ (jp-review a2 r2 LOW、未修)。q093 の答え (条件式 a) には影響しない | jp before「記号」→ after「擬似言語での記号」/ zh before「符号」→ after「伪代码中的符号」/ en before "Symbol" → after "Symbol in the pseudo-language" |
| L4 | LOW **建議修** | `terms[1](演算子).hook_en` (+ 派生 `memory_hook_en`, `summary.memory_hooks_en[1]`) | 「ends in the same character as "atom" and "factor"」だと英単語 atom / factor が漢字で終わるように読め、英語読者に「子」が見えない (loc-review r1 LOW、未修) | en before "The Japanese word ends in the same character as \"atom\" and \"factor\", so read it as a small part that carries out an operation." → after "The Japanese word 演算子 ends in 子, the same character as in 原子 (atom) and 因子 (factor), so read it as a small part that carries out an operation." (jp / zh 不変) |
| L5 | LOW **建議修** | `overview_rows[0].one_line_en` | 見出し語 Expression の行の一行説明が「An expression that…」で循環定義 (jp「評価すると一つの値になる記述」、one_en は "a piece of code") (loc-review r1 LOW、未修) | en before "An expression that yields one value when evaluated" → after "Code that yields one value when evaluated" (jp / zh 不変) |
| L6 | LOW **建議修** | `terms[0](式).fig.steps[2].caption_zh` | 「得到表达式的值 20，只有一个。」は「只有一个」が後付けで不自然 (loc-review r1 LOW、未修) | zh before「算完剩下的乘法，得到表达式的值 20，只有一个。」→ after「算完剩下的乘法，得到表达式唯一的值 20。」(jp / en 不変) |
| L7 | LOW | `terms[0](式).analogy_jp/zh/en` | 電卓の「イコールを押すと答えが出る」は、単元が条件式 `points[2]`・pairs[1] で「= は比較」と教える記号と同じ字の別の働き (型 (8) 確認)。引用 / quiz 題で = を「計算実行」と読ませて誤答に向かう題は無く、比喩の場面 (電卓のキー) も明確 | 記録のみ |
| L8 | LOW | `terms[0](式).hook_jp/zh/en` | 「計算した結果の一つの値を「表すもの」」は one の「一つの値が得られる」の言い換えに近い (D-203 §6、jp-review a2 r2 LOW) | 記録のみ |
| L9 | LOW | `terms[0].one_jp` / `terms[0].fig.steps[0].caption_jp` (評価)、`terms[0].points[1]` / `terms[2].points[2]` (代入) | 定義前使用: 評価は detail より前、代入は term 4 より前 (総表に一行定義あり、日常語に近い) (jp-review a2 r1 / r2 LOW) | 記録のみ |
| L10 | LOW | `terms[0].points[0]` / `terms[3].points[1]`; `terms[1].detail_jp` 3 文目 / `terms[1].points[1]` / `key_points_jp[0]`; `terms[3].detail_jp` 2 文目 / 代入 fig / `key_points_jp[2]` | §9 同義の言い直し: 評価時点の値 / 繰返しの更新が同じ q096 で 2 回、優先順位の規則が 3 箇所、n ← n × 2 の右辺先評価が 3 箇所 (D-203 low、jp-review LOW 継承) | 記録のみ |
| L11 | LOW | `terms[1](演算子).detail_jp` 1 文目 | 被演算子 (オペランド) を太字で導入するが、単元の他の欄で使わない (jp-review a2 r2 LOW) | 記録のみ |
| L12 | LOW | `terms[2](条件式).points[2].text_zh / text_en` | jp「比較演算子」に対し zh「比较用的运算符[[jp:演算子]]」・en "comparison operator ([[jp:演算子]])" で併記が見出し語止まり (見出し語の併記規則としては合っており validate も通る) (loc-review r1 LOW) | 記録のみ |
| L13 | LOW | `terms[4](注釈).detail_zh` 2 文目 | 「会使用用“/* 〜 */”括起来」で「用」が重なる (意味は jp と同じ) (loc-review r1 LOW、未修)。1 字削除で済むので補丁に含めてもよい | 任意: zh before「IPA 的伪代码中会使用用“/* 〜 */”括起来，或写在“//”后面等写法。」→ after「IPA 的伪代码中会使用“/* 〜 */”括起来，或写在“//”后面等写法。」(jp / en 不変) |

**対比の出現欄 (書き方 8 の列挙)**: ① 変数を変えない / 書き換える: `terms[0].points[1]` (式 vs 代入)、`pairs[1].rows[1]` (条件式 vs 代入、key) → 2 箇所。② = (比較) / ← (代入): `terms[2].points[2]`、`pairs[1].rows[0]` → 2 箇所。③ 式 / 条件式 の結果 (一つの値 / 真偽): `pairs[0].rows[0]` のみ (各 one は定義そのもの)。④ and / or: 条件式 detail・table・hook・key_points[1] は対比ではなく両演算子の定義の提示 (真理値表は D-195 §2 の図) → 許容。`goals_jp` は予告のみ。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `source_figures` に 2009h21a-q090 (v1 の challenge) が残るが、v2 では本文・quiz・challenge のどこにも引用されない。本文外のメタデータで validate も 0 issues。
- O2 令和の IP 擬似言語題は関係を「が 0 と等しい」「より大きい」等の言葉で書くが、単元は記号 (= ≠ < ≦ ≧) で示す。IPA の演算子表と整合し誤りではない。将来の改稿で「題では『〜と等しい』『〜より大きい』とも書く」と添える余地あり (本 Rule A の指摘ではない)。
- O3 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。独立 copy 照合 0 件 (遮蔽あり / なし / 近似とも)。

確認済みで問題なし: 全 11 題の手トレース (§1-3)、記法 8 項目 (§1-4)、限定条件 (exam 考点 7 件全て保持)、§9 禁止句 grep (jp 0、zh / en は偽陽性のみ)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤64 字)、D-198 (validate 0 + 独立照合 0/0/0 + (iii) 該当なし)、`[[jp:]]` 原語 (12 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (5/5)、zh 訳語表、図種 (flow steps ×2 / tree static / table static / 図なし = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、前回 MEDIUM 5 件 (a1 r1 ×3・a1 r2 ×1・a2 r1 ×1) の解消と zh / en への反映。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **13** (建議修 6: L1〜L6 / 記録のみ 7: L7〜L13、うち L13 は任意の修正案あり) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 9 件 (qid 付き 7 件)・引用 8 題 + 本文未引用の quiz / challenge 2 題 (2024r06-q062 / 2015h27a-q048) を手でトレースし、考点の主張は正答と一致、誤答肢を支持する記述は無く、限定条件の落ちも無い。単元の擬似言語の記法 (←・/* */・//・+ − × ÷・and or not・優先順位) は引用題のプログラムと IPA の記述形式に合う。LOW 建議修 6 件 (L1〜L6) は補丁 (B3) で修正推奨、L7〜L13 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-37-u02
✓ technology-14-37-u02 unit: 0 issues (data/ip/textbook/units/technology-14-37-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-14-37-u02
✓ technology-14-37-u02 parity: 27 locations, 0 diff
EXIT=0
```
