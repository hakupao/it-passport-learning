# Rule A 全数抽検 — technology-13-34-u01 (確率と場合の数)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成、照合スクリプトは scratchpad)。
- **Date**: 2026-11-08 (S149 b49)、repo HEAD `69504337` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b49-u01-a1` merge 結果、sha256 先頭 `f96e8b9f3bc27236`)。
- **対象**: `data/ip/textbook/units/technology-13-34-u01.json` (textbook-unit-v2)、用語 **3 / 3 = 全数** (確率 / 順列 / 組合せ) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、D-208〜D-210 (既知の失敗型 (1)〜(10))。比較: `data/ip/textbook/.planning/v2/technology-13-34-u01/v1-original.json` (用語 3 語・`term_zh`・`term_en` とも v1 と一致、`unit_summary_*` は v1 と同文)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 3 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 9 件 = exam 6 + mix 3、引用 qid 延べ 12 件 = 異なり 12 題)**: `data/ip/quiz/questions.json` の各題 (題文は `translations/<exam>.json` の `stem_jp_clean`) と `correct_answer` を再読 (全題 topic `technology-13-34`)。**計算題は全て自分で再計算**:
   - 2024r06-q083: 1 回で 1 が出ない確率 5/6、3 回独立 → (5/6)^3 = 125/216 = 正答エ ✓
   - 2009h21h-q007: 確率 0.4 / 0.4 / 0.2 で各株の期待値 A = 8+4+3 = 15、B = 12+8+1 = 21、C = 10+2+4 = 16、D = 16+4−2 = 18 → 最大 B = 正答イ ✓
   - 2010h22h-q011: 確率 0.2 / 0.5 / 0.3、期待値 − 開発コスト: A = 49−20 = 29、B = 42−10 = 32、C = 40−15 = 25 → B = 正答イ ✓
   - 2009h21a-q070: 一様乱数 2 つの大小は対称で確率 1/2、600 × 1/2 = 300 = 正答ウ ✓
   - 2010h22a-q082: 指定 2 文字を両端に置く 2 通り × 残り 4 文字 4! = 24 → 48 = 正答ウ ✓
   - 2014h26h-q063: 隣り合う 2 文字を 1 まとまり → 5! = 120 × 内側 2 → 240 = 正答イ ✓
   - 2016h28a-q061: M 種 × 8 文字 → M^8 = 正答エ ✓
   - 2019r01a-q072: 兼任可 (重複順列) 5 × 5 = 25 = 正答エ ✓
   - 2009h21a-q046: 6C2 = 15 = 正答ウ ✓ / 2013h25h-q076: 8C2 = 28 = 正答ウ ✓ / 2018h30a-q042: 6C2 = 15 → 10C2 = 45、45 ÷ 15 = 3 倍 = 正答ウ ✓
   - 2013h25h-q036: nC2 から (n+1)C2 への増分 = n (元の人数が多いほど増分が大きい) = 正答ア ✓
3. **quiz / challenge_questions** (quiz 9 枠 = 異なり 9 題、うち本文で未引用 1 題 + challenge 5 題、うち本文で未引用 2 題): 全て再計算。
   - 2010h22h-q067 (組合せ quiz、未引用): 0〜9 の組 100 行から A ≦ B を除いた残り = A > B の行 = 異なる 2 数の組 10C2 = 45 = 正答イ ✓。組合せ points[0] の n(n−1)/2 (n = 10) で解ける。
   - 2025r07-q085 (challenge、未引用): 誤り率 70% → 0.7 × 0.95 = 0.665 (正解率 33.5%)、× 0.95 = 0.63175 (正解率 36.8%) → 2 回 = 正答イ ✓。確率 points[0] の「回数分掛ける」と同じ繰り返しの掛け算で解け、本文と矛盾しない。
   - 2016h28h-q098 (challenge、未引用): 5 個のランプ点灯/消灯 2^5 = 32 (重複順列 m^k) − 全消灯 1 − 1 個点灯 5 = 26 = 正答ウ ✓。本文と矛盾しない (補集合を引く操作は本文に明示が無い → O1)。
   - 2010h22h-q011 / 2016h28a-q061 / 2018h30a-q042 (challenge、本文引用済) は §2 のとおり。
4. **D-198 写し**: validate の copy guard = 0 件 (choice-echo warn 行も 0)。独立照合: 単元の JP 文字列 76 本 (派生フィールド・summary・overview.intro・source_figures 除く; 図ラベル・caption・総表・対比表を含む) を topic 内全 32 題の題文 (`stem_jp_clean`) + 選択肢と 12 字連続照合 (記法・句読点・記号・空白除去) — (a) カタカナ 4 字以上と英数を □ 遮蔽 (実字 6 未満の窓は除外) → **0 件**、(b) 遮蔽なし → **0 件**、(c) 近似一致 (14 字窓で 1〜2 字置換) → **0 件**。カタカナの多い文は無い (「チーム」1 語のみ) ため目視対象なし。
   - **(iii) 選択肢なぞり (D-208 (1))**: 2013h25h-q036 は「適切なもの」型。組合せ points[1] は正答の内容 (増分 = n、n が大きいほど増え方が大きい) を一般の性質として述べ、誤答 3 肢 (1 人増で必ず 1 増 / x! / x²) を否定する形を取らず、肢の文言・並びも再現しない → D-209 の除外に当たり (iii) ではない。順列 points[0] は 2010h22a-q082 / 2014h26h-q063 の「両端」「隣同士」を一般の数え方 (条件のある位置・まとまりを先に数えて掛ける / 隣り合う 2 つは 1 まとまり × 2) として述べ、題の 6 文字・数値を使わない。図の具体例 (赤玉 3・白玉 2 / 3 色の旗から 2 本 / 5 人から 2 人) と比喩 (降水確率 / 表彰台 / 鍋の具材) はいずれも topic 内の題に無い場面。
5. **D-195**: 結論先行 (one = 1 文 × 3、太字あり)、展開 3 / 3 / 2 文、定義前使用 (事象 = one の括弧注、独立 = detail「互いに影響しない」、期待値 = detail、nPr・階乗・重複順列 = 順列 detail、nCr = 組合せ detail; 総表の nPr / nCr は L7)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → 「選ぶ」18 件のみで全て「n 個から r 個を選ぶ」等の数学用法 (偽陽性)、zh / en (必须 / 考试 / 重要 / exam / must / always / important / 选项 / 记住 / remember) → `kind: "exam"` 6 件と en「two items that must be adjacent」1 件 (条件の記述) で偽陽性。図の型 (確率・組合せ = flow steps 3、順列 = tree steps 3; 全て登録内)、数値の整合 (3 ÷ 5 = 0.6、3 × 2 = 6、5 × 4 = 20、20 ÷ 2 = 10、pairs[0].rows[2] の 6 / 3 通り = 順列の木図 6 と一致) を再計算。pair 配置 (順列 / 組合せ、key 行あり)。
6. **D-200**: 考点数 3 / 3 / 3 (≤3 ✓)、各 JP 文数 1〜2・字数 39〜87 (≤100 ✓、最大は確率 `points[0]` の 87 字)。**framing 件数** (validateV2 `pointFraming`、全考点、tsx で直接実行): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の限定: detail「どの結果も同じ程度に起こるとき」は key_points[0] (三語とも) と overview_rows[0].extra[1] でも保持 — jp-review r1 の MEDIUM は解消; 確率 points[0] の「互いに影響しない回を繰り返すとき」は detail の独立の条件と一致; 組合せ mix「役割や順番を割り当てるなら順列」は 2019r01a-q072 [委員長と書記] の数え方と一致) → 不整合 0。書き方 8 → L6。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → L4。§9 言い直し → L5。D-205 (改訂される文書の構成数) / D-210 (法令改正) は該当なし。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、図ラベル・caption・比較行・総表の三語一致、`[[jp:…]]` 原語 5 種 (確率 / 順列 / 組合せ / 期待値 / 重複順列) が jp 本文に実在、one_zh / one_en 全 3 用語に見出し語の `[[jp:]]` あり (D-202)、zh 訳語が `zh_terms.json` (unit 抽出: 確率 = 概率 / 順列 = 排列 / 組合せ = 组合) に従う (validate warn 0)。表外の語 (期望值 / 阶乘 / 重复排列 / 情况数 / 独立) は数学の通常訳で誤りなし。
9. **前段の指摘の解消確認** (`journal.b49-u01-a1.jsonl`): jp-review r1 MEDIUM 2 件 — ① `terms[0].points[0]` の未定義記号 p と「試行」→ p の半分は解消 (現行は記号を使わず「1 回でその結果が起こらない確率を回数分掛けて」)。「試行」は points[0] からは消えたが `terms[0].points[1].text_jp` に「試行回数」として 1 件残る (grep 1 件; detail に説明なし)。文脈で「繰り返す回数」と読め IT パスポートの水準で誤学習に至らないため LOW とし L10 で記録 ② `key_points_jp[0]` の条件落ち → 三語とも条件付き → 解消。zh / en で再発なし (失敗型 (5) なし)。loc-review r1 の LOW 5 件は未修のまま (L1・L3・L8 で再掲)。
10. **既知の失敗型 (D-208 ほか)**: (1) §1-4 のとおり該当なし / (2) 引用題の限定 (2009h21a-q046「少なくとも」、2019r01a-q072「兼任も許す」= 重複順列の前提) は考点の数え方の前提として保持、閉じる「など」の落ちなし / (3) 別名を別物として教える箇所なし (順列・重複順列は親子関係として説明) / (4) 比喩・図の範囲が one・detail と矛盾しない / (5) なし / (6) zh・en の語が誤答肢寄りに読める箇所なし (2013h25h-q036 誤答イ「必ず 1 つ増」に対し zh「增加 n 个」/ en "grows by n") / (7) 該当なし / (8) 比喩・フックの鍵語が他の見出し語と衝突しない (「組」= 組合せ自身、「列」= 順列自身) / (9) フックを引用題・challenge に当てても誤答肢を選ばない (組合せ hook「組の中に順番はない」を 2019r01a-q072 に当てると 5C2 = 10 [誤答イ] へ誘う可能性を検討したが、同題は役割を割り当てる題で、組合せ mix 考点と順列の比喩 [表彰台] が順列側へ導き、フック単独で選ばせる記述ではない) / (10) 該当なし。
11. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (3 / 3)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 確率 | OK — exam 2 / 4 題 + mix 1: 互いに影響しない回の繰り返しで全回が条件を満たす確率は積、一度も起こらない確率は 1 回で起こらない確率を回数分掛ける (2024r06-q083 正答エ、再計算一致; 限定条件「互いに影響しない回を繰り返すとき」保持) / 期待値 = 値 × 確率の合計、回数の期待値 = 試行回数 × 確率 (2009h21h-q007 正答イ / 2010h22h-q011 正答イ / 2009h21a-q070 正答ウ、全て再計算一致; q011 の開発コスト差し引きは考点が述べない追加手順で、考点はそれを否定しない) / mix: 期待値は確率ではなく 0〜1 に収まるとは限らない — 正しい (q007・q011 の期待値は円・億円単位)。flow steps 3 (3 ÷ 5 = 0.6) は detail の条件「どの結果も同じ程度」と一致 | OK | en points[0] の曖昧さ L1 | L1 / L4 (hook) / L5 / L10 / L11 (analogy) |
| 2 | 順列 | OK — exam 2 / 4 題 + mix 1: 条件のある位置・まとまりを先に数え残りを掛ける、隣り合う 2 つは 1 まとまり × 2 (2010h22a-q082 正答ウ 48 / 2014h26h-q063 正答イ 240、再計算一致) / 重複順列 m^k (2016h28a-q061 正答エ M^8 / 2019r01a-q072 正答エ 25、再計算一致; 限定「各位置の候補数が減らない」= 兼任可・同じ文字可を保持) / mix: nPr (1 ずつ減る数を r 個) と m^k (同じ m を k 回) の計算の違い — 正しい。tree steps 3 (3 × 2 = 6) は nPr の 3P2 と一致 | OK | one_en の句 L8 | L5 / L6 / L8 |
| 3 | 組合せ | OK — exam 2 / 4 題 + mix 1: 2 者を結ぶ 1 組 = 2 個を選ぶ組合せ 1 つ、n(n−1)/2 (2009h21a-q046 正答ウ 15 / 2013h25h-q076 正答ウ 28 / 2018h30a-q042 正答ウ 3 倍、再計算一致) / n が 1 増えると組は n 増え、n が大きいほど増え方も大きい (2013h25h-q036 正答ア、増分 (n+1)C2 − nC2 = n で一致; 誤答肢を支持しない) / mix: 役割・順番を割り当てるなら順列、顔ぶれだけなら組合せ — 正しい。detail の nCr = nPr ÷ r!、nCr = nC(n−r) は正しい。flow steps 3 (5 × 4 = 20 → ÷ 2 = 10) 再計算一致。quiz 2010h22h-q067 (未引用) は 10C2 = 45 で解ける | OK | en analogy L3、en points[1] L2 | L2 / L3 / L4 (hook) / L6 |

**単元レベル**: goals 3 点・overview_cols 2 (求めるもの / 代表的な式)・overview_rows 3 行・pairs 1 組 (順列 / 組合せ 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 5 件 (2010h22h-q011 / 2025r07-q085 / 2016h28a-q061 / 2016h28h-q098 / 2018h30a-q042 — 全て再計算で正答と一致し本文と矛盾なし、§1-3)。key_points[3]「n が大きいほど増え方が大きい」は組合せ points[1] と一致。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 11 (うち 建議修 3)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[0](確率).points[0].text_en` | jp「1 回でその結果が起こらない確率を回数分掛けて」(= 回数乗) を "multiplying ... by itself once for each trial" と訳し、字義どおりには 回数 + 1 乗とも読める (loc-review r1 LOW の未修)。2024r06-q083 では (5/6)^4 に当たる肢は無く誤答には至らない | before: "The probability that an outcome never occurs is found by multiplying the probability that it does not occur in one trial by itself once for each trial." → after: "The probability that an outcome never occurs is found by multiplying together, once per trial, the probability that it does not occur in one trial." (jp / zh は変更なし) |
| L2 | LOW **建議修** | `terms[2](組合せ).points[1].text_jp` / `text_zh` / `text_en` | 「n が 1 増えるたびに n 個ずつ増える」は増分が「増える前の n」であることが読み取りにくく、「ずつ」で増分一定とも読める (jp-review r2 LOW の未修)。en は "pairs of 2" が冗長。事実は正しく 2013h25h-q036 正答アと一致 | jp before: 「2 個を選ぶ組の数は、n が 1 増えるたびに n 個ずつ増えるので、n が大きいほど増え方も大きい。」→ after: 「2 個を選ぶ組の数は、n 個が n + 1 個に増えると n 個増えるので、n が大きいほど増え方も大きい。」/ zh before: 「选 2 个的组数在 n 每增加 1 时增加 n 个，所以 n 越大，增加得也越多。」→ after: 「选 2 个的组数在 n 个增加到 n + 1 个时增加 n 个，所以 n 越大，增加得也越多。」/ en before: "Each time n grows by 1, the number of pairs of 2 grows by n, so the larger n is, the faster the count rises." → after: "When n items become n + 1, the number of pairs grows by n, so the larger n is, the faster the count rises." |
| L3 | LOW **建議修** | `terms[2](組合せ).analogy_en` | 第 2 文の主語 (the order) と述語 (makes the same pot) がかみ合わず不自然 (loc-review r1 LOW の未修)。jp / zh は正常 | before: "It is like picking three ingredients for a hot pot. As long as the ingredients are the same, the order you add them in still makes the same pot." → after: "It is like picking three ingredients for a hot pot. Whatever order you add them in, the same ingredients make the same pot." |
| L4 | LOW | `terms[0].hook_jp/zh/en`、`terms[2].hook_jp/zh/en` | 確率「全体を分母に置いた割合として読む」は detail の式の言い直し、組合せ「組の中に順番はない」は one の言い直し (D-203 §6; 字形の手がかりは付いている) | 記録のみ |
| L5 | LOW | `terms[0].points[0]` 第 1 文・`terms[0].points[1]` 第 1 文・`terms[1].points[1]` | それぞれ detail の第 2 文・第 3 文・第 3 文の言い直し (D-203 §9)。新しい情報は各考点の後半 (一度も起こらない確率 / 回数の期待値 / 候補数が減らない理由) にあり事実は正しい | 記録のみ |
| L6 | LOW | `terms[1].points[1]`・`points[2]`・`detail`、`pairs[0].rows[0]`・`terms[2].points[2]` | 書き方 8: nPr と m^k の違いが points[1] (候補数が減らない) と points[2] (mix) と detail で、順序の区別の対比が pairs[0].rows[0] と組合せ mix に加え両 one・比喩・フックでも出る (one = 定義、フック = 字形手がかりで反復に数えない; 実質の重複は 2〜3 箇所) | 記録のみ |
| L7 | LOW | `overview_rows[1].extra_*[1]`・`overview_rows[2].extra_*[1]` | 総表で nPr・nCr・r! が用語 detail での定義より先に出る (一覧の位置づけ、前段 LOW の未修) | 記録のみ |
| L8 | LOW | `terms[1].one_en`・`terms[2].one_en` | "A permutation ([[jp:順列]]) count is ..." / "A combination ([[jp:組合せ]]) count is ..." で併記が名詞句の途中に入りぎこちない (loc-review r1 LOW の未修)。意味は正しい | 記録のみ (直すなら "The number of **permutations** ([[jp:順列]]) is the total number of ways ..." の形) |
| L9 | LOW | `terms[0].points[1].text_zh/en`・`terms[1].points[1].text_zh/en`・`terms[2].points[2].text_zh/en` | zh / en で [[jp:]] 併記と同時に太字を付けるが jp は無太字 (parity は 0 diff で、併記箇所の太字は既存単元の慣例) | 記録のみ |
| L10 | LOW | `terms[0](確率).points[1].text_jp` / `text_zh` / `text_en` | 「試行回数」(试验次数 / number of trials) の「試行」が単元内で未説明 (jp-review r1 MEDIUM ① の後半が未修; r2 は再指摘せず)。文脈で「繰り返す回数」と読め、事実は正しい | 記録のみ (直すなら jp「試行回数 × その結果の確率」→「繰り返す回数 × その結果の確率」/ zh「试验次数 × 该结果的概率」→「重复的次数 × 该结果的概率」/ en "the number of trials × the probability of that outcome" → "the number of repetitions × the probability of that outcome") |
| L11 | LOW | `terms[0](確率).analogy_jp/zh/en` | 降水確率 30% = 0.3 は確率そのものの実例 (百分率表記) で、別の場面のたとえではない (D-203 §6 / writer 護欄 (b); u06 L3 と同型)。誤学習には至らない | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 順序を区別する / しない: `pairs[0].rows[0]` (key)、`terms[2].points[2]` (mix)、各 one (定義)、overview_rows の extra[0]、hook 2 つ・比喩 2 つ (場面の手がかり) → 実質 2 箇所 + 定義・総表で許容。② nPr / m^k: `terms[1].points[1]` (理由)、`terms[1].points[2]` (mix)、detail (定義) → L6。③ nPr / nCr の式: `pairs[0].rows[1]`、overview_rows extra[1] (総表の構造) → 許容。④ 3 個から 2 個 6 / 3 通り: `pairs[0].rows[2]` のみ → 許容。

**範囲外の観察**:
- O1 challenge 2016h28h-q098 は 2^5 から「全消灯」「1 個だけ点灯」を引く補集合の操作が要るが、本文は余事象 (全体から引く) を明示していない (確率 points[0] は「起こらない確率を掛ける」側)。m^k = 32 と場合分けで解け本文と矛盾しないため指摘にしない。
- O2 `unit_summary_*` は v1 と同文 (未改稿)。

確認済みで問題なし: 限定条件 (考点 6 件の exam 全て保持、§2)、§9 禁止句 grep (偽陽性のみ)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤87 字)、D-198 写し (copy guard 0、独立照合 遮蔽あり 0 / 遮蔽なし 0 / 近似 0)、(iii) 選択肢なぞり なし、`[[jp:]]` 原語 (5 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (3/3)、zh 訳語表 (warn 0)、図種 (flow steps ×2 / tree steps ×1 = 登録内)、図・表の数値 (全て再計算一致)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、前段 MEDIUM 2 件の解消 (三語; ① の「試行」の残り 1 件は L10)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **11** (建議修 3: L1・L2・L3 / 記録のみ 8: L4〜L11) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 3 用語・考点 9 件 (qid 付き 6 件)・引用 12 題 + 未引用の quiz / challenge 3 題 (計 15 題) を全て再計算し、正答と一致。考点の主張は正答と一致し、誤答肢を支持する記述・引用題の限定条件の落ち・写しは無い。LOW 建議修 3 件 (L1〜L3、いずれも前段 review の LOW 未修) は補丁 (B3) で修正推奨、L4〜L11 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-34-u01
✓ technology-13-34-u01 unit: 0 issues (data/ip/textbook/units/technology-13-34-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-34-u01
✓ technology-13-34-u01 parity: 22 locations, 0 diff
EXIT=0
```
