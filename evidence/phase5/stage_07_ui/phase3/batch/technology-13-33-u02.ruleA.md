# Rule A 全数抽検 — technology-13-33-u02 (集合と論理演算)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成、作業用スクリプトは scratchpad)。
- **Date**: 2026-11-08 (S150 b56)、repo HEAD `f34f258c` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b56-u02-a1` merge 結果、sha256 先頭 `0df585627596b29f`)。
- **対象**: `data/ip/textbook/units/technology-13-33-u02.json` (textbook-unit-v2)、用語 **8 / 8 = 全数** (集合 / ベン図 / 真理値表 / 論理演算 / AND / OR / NOT / XOR) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し、(iii) 選択肢の組・場面の流用) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202、D-203、D-204、D-205、D-208 (既知の失敗型)、D-209、D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `data/ip/textbook/.planning/v2/technology-13-33-u02/v1-original.json` (用語 8 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え。ただし §3 H1 は D-198 判定の根拠として一致窓 [正規化後] を示す)。

## 1. 方法

1. **全文読み取り**: 8 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (cols・rows・cells・nodes・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_*` = one の記法除去 [`[[jp:X]]`→X]、`memory_hook_*` = hook、`summary.key_points_*` = key_points) が本体と一致することをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 12 件 = exam 11 + mix 1、引用 qid 延べ 14 件 = 異なり 13 題、全題 topic `technology-13-33`)**: `data/ip/quiz/questions.json` + `translations/<exam>.json` の `stem_jp_clean` から題文・選択肢・`correct_answer` を再読。図付きの Venn 2 題は `data/ip/exams/figures/` の原図を目視。**全題を自分で解いた**:
   - 集合: 2010h22h-q069 正答イ (積集合 ⊆ A。ア [⊆ A の補]・ウ [和 ⊆ 積]・エ [和 ⊆ A] は一般には不成立) / 2015h27h-q062 正答ウ (積 ⊆ 和)。考点「積 ⊆ もとの集合 ⊆ 和」から両題とも出る。
   - ベン図: 2009h21h-q071 (原図: B と C の重なりのうち A の外の 1 領域のみ黒) → (not A) and B and C = 正答ア / 2017h29a-q098 (原図: B∪C のうち A の外の 3 領域が網掛け) → (not A) and (B or C) = 正答イ。考点の「領域ごとに内側 = 条件、外側 = 否定で組み合わせる」で両題とも導ける。
   - 真理値表: 2012h24a-q082 (出力 1 は 11 の行だけ) → AND = 正答ア / 2013h25a-q064 (出力 1 は 00 の行だけ) → NOT(x OR y) = 正答ウ (NOT(x AND y) = 1110、x OR y = 0111、x AND y = 0001 を計算し不一致確認)。
   - 論理演算: 2012h24h-q069 → (札幌 OR 函館) AND 日本料理 = 正答ウ / 2013h25a-q054 → 男性 AND (20 歳未満 OR 65 歳以上) = 正答イ。
   - AND: 2018h30a-q079 (X AND 00001111 → 上位 4 ビット 0、下位 4 ビットは X のまま) = 正答ウ / 2014h26h-q057 (AND ボックス 2 段 → 3 入力とも賛成のときだけ賛成) = 正答エ。
   - OR: 2015h27h-q099 → 55 + 60 − 30 = 85 = 正答ウ (再計算一致)。
   - XOR: 2013h25h-q082 → (A OR B) AND ((NOT A) OR (NOT B)) を 4 行で評価 0110 = 正答イ (ア = A、ウ = 1001 [一致]、エ = NOT A を確認) / 2010h22a-q068 (X XOR 00001111 → 上位はそのまま、下位 4 ビット反転) = 正答エ。
3. **quiz / challenge_questions** (quiz 計 14 枠、challenge 5 題 = 2015h27h-q062 / 2017h29a-q098 / 2013h25a-q064 / 2013h25h-q082 / 2018h30a-q079): 全て本文の考点で引用済み (未引用 0)。quiz の割当 (OR の quiz = 2013h25a-q054、NOT の quiz に 2017h29a-q098) も本文で解ける。
4. **真理値表・ベン図のセル全数点検**: `terms[3].fig` (4 行 × 5 列: A / B / AND / OR / XOR) を真理値で再計算 — AND 0001・OR 0111・XOR 0110、key 行 = 11 (OR 1 / XOR 0) で正しく、jp / zh / en の 60 セルは全て同値。`terms[1].fig` (2 円の 4 領域 × 円 A / 円 B / 表す集合) — A だけ (内・外) = A かつ非 B、重なり (内・内) = A∩B (key)、B だけ (外・内) = B かつ非 A、どれにも入らない (外・外) = (A∪B) の補集合: 全て正しく三語一致。`terms[0].fig` (和 / 積 / 補 × 記号・要素) 正しく三語一致。`pairs[1].rows[2]` (OR = 2 円の全体、XOR = 重なりを除いた部分) 正しい。`terms[2].fig` steps 4 (00/01/10/11 の 4 行 → 括弧内の列 → 外側の演算 → 出力列) は 2013h25a-q064 の手順と一致。
5. **D-198 写し**: validate の copy guard = 0 件、`choice-echo` warn 0。独立照合: 単元の JP 文字列 163 本 (派生除く) を topic の全 28 題の題文 + 選択肢と 12 字連続照合 — (a) カタカナ 4 字以上・英数を □ 遮蔽 (実字 6 未満の窓除外): **1 件** / (b) 遮蔽なし: **1 件** / (c) 近似 (12 字窓の編集距離 ≤2): 遮蔽 16 窓・遮蔽なし 16 窓 — **全て `terms[0].points[0].text_jp` 1 本に集中** → H1 (§3)。他の文字列はヒット・近似とも 0。目視: カタカナの多い文 (ベン図 hook のジョン・ベン、真理値表 / XOR analogy のスイッチ) に題文の流用なし。(iii) 点検: 論理演算 points[0] は題の地名・料理・性別・年齢を使わず一般形 (同じ項目の候補を OR で括り、別項目と AND)、AND points[0] / XOR points[1] は 8 ビット・00001111・上位 / 下位を使わず「相手のビットが 0 / 1 の桁」で一般化、OR points[0] は 55・60・30 を使わず包除の一般則、AND points[1] は賛成 / 反対を使わず、XOR points[0] は正答の式形 (NOT A OR NOT B) を書かず「少なくとも一方が 1 かつ両方 1 ではない」の定義のみ → いずれも誤答肢の打ち消し・組や順のなぞりなし。
6. **D-195**: one = 1 文 × 8 (太字あり)、detail 2〜3 文、図 = table static ×3 (集合 / ベン図 / 論理演算)・flow steps ×1 (真理値表)・図なし ×4 (AND / OR / NOT / XOR、真理値は論理演算の表に集約) で全て登録内。定義前使用: 論理積 (真理値表 points[0]) と XOR (論理演算の図) は総表の一句話が先行 (jp-review r1 low、影響小)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → 「と覚える」1 件 (`terms[0].hook_jp` + 派生 2) と `freq_badge` のみ。1 件のみで前例どおり記録なし。
7. **D-200**: 考点数 1/1/2/1/2/1/1/3 (≤3 ✓)、各 JP 1〜2 文・51〜89 字 (≤100 ✓、最大は集合 points[0] 89 字)。**framing** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0。
8. **D-202 / D-203 / D-204 単元全体点検**: 書き方 7 → M1 (論理演算 analogy の範囲)。書き方 8 → §3 の対比列挙 (L4)。書き方 9 → §2 表、限定条件落ち 0 (2010h22h-q069 / 2015h27h-q062 の「常に成立」= 考点の「どんな 2 つの集合でも」で保持)。§6 / §9 → L3・L5・L6。
9. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行・caption の三語一致 (§1-4)、`[[jp:…]]` 原語 12 種 (集合 / 積集合 / 部分集合 / 和集合 / ベン図 / 論理式 / 否定 / 真理値表 / 論理積 / 論理演算 / 論理和 / 排他的論理和) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 8 用語に見出し語の `[[jp:]]` あり。zh-term warn 12 件の判定は §4。
10. **前回指摘の解消 (journal `b56-u02-a1`)**: jp-review r1 MEDIUM (`goals_jp[2]`「両方が 1 の行で」が AND/OR にも掛かる) → 現文は「AND と OR は片方だけが 1 の行で、OR と XOR は両方が 1 の行で」と組ごとに分け、zh・en も同じ構造 (退行なし) = **解消**。r1 low (`terms[0].hook`「和集合のほうが大きい」、OR points[1]「重ねるほど減る」、ハック「2 倍」) は削除済み。r2 low (2013h25a-q064 を `terms[2].points[1]` と `terms[6].points[0]` の 2 考点で同趣旨に言う) は残存 → L3。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (8 / 8)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 集合 | 事実は OK — exam 1 / 2 題: 積 ⊆ もとの集合 ⊆ 和 (2010h22h-q069 正答イ / 2015h27h-q062 正答ウ)。「どんな 2 つの集合でも」で「常に成立」を保持。どの誤答肢 (補集合への包含・和 ⊆ 積・和 ⊆ A) も支持しない。table (和 / 積 / 補) 正しい。analogy (名簿 / 「背の高い人」は集合でない) は one の「はっきり決まる」と一致 | **D-198 写し: points[0] 前半が 2010h22h-q069 の正答肢の文をそのまま再現 → H1** | OK | H1 |
| 2 | ベン図 | OK — exam 1 / 2 題: 領域ごとに内側 = 条件・外側 = 否定で組み合わせる (2009h21h-q071 正答ア / 2017h29a-q098 正答イ、原図で確認)。detail の「2 円で 4、3 円で 8 領域」(外側の領域を含む) 正しい。table 4 行正しい | OK | OK (hook の jp 駄洒落「便利な図」は zh/en で「人名で図の描写ではない」に置換、妥当) | なし |
| 3 | 真理値表 | OK — exam 2 / 2 題: 出力 1 の行の入力組で演算が決まる、入力すべて 1 の行だけ = 論理積 (2012h24a-q082 正答ア) / 括弧外の否定は括弧内の列を作って 0・1 を入れ替える (2013h25a-q064 正答ウ)。detail「n 入力で 2^n 行」「同じ表 = 同じ働き」正しい。flow steps 4 一致 | OK | analogy の「スイッチ」は照明の開关 (zh 开关) で正しい (§4) | L3 |
| 4 | 論理演算 | OK — exam 1 / 2 題: 同じ項目の候補を OR で括り、別項目と AND (2012h24h-q069 正答ウ / 2013h25a-q054 正答イ)。detail の集合対応 (積・和・補 ↔ 論理積・論理和・否定) 正しい。hook (Boolean / ブール) 正しく、「ともいい」で term_en (Logical Operation) と整合。table 60 セル正しい | analogy の範囲 → M1 | OK | M1 |
| 5 | AND | OK — exam 2 / 2 題: ビットごとの AND は相手 0 の桁を 0、1 の桁は元の値 (2018h30a-q079 正答ウ) / AND を 2 段につなぐとすべて 1 のときだけ 1 (2014h26h-q057 正答エ; 誤答イ [2 つ以上で賛成] を支持しない)。hook (∧・「・」、0/1 の掛け算と同じ) 正しい | OK | OK | なし |
| 6 | OR | OK — exam 1 / 1 題: OR の該当数 = 各該当数の和 − 両方の数 (2015h27h-q099 正答ウ 85、再計算一致)。hook「1 + 1 も 1 と扱う点だけが普通の足し算と違う」は 0/1 の範囲で正しい | OK | OK | なし |
| 7 | NOT | OK — exam 1 / 1 題: OR の結果を否定すると入力すべて 0 の行だけ 1 (2013h25a-q064 正答ウ)。detail (単項演算・補集合・円の外側) 正しい。hook (二重否定) 正しい | OK | OK | L3 / L6 (analogy) |
| 8 | XOR | OK — exam 2 / 2 題 + mix 1: 少なくとも一方が 1 かつ両方 1 ではない → 他の基本演算で表せる (2013h25h-q082 正答イ) / ビットごとの XOR は相手 1 の桁を反転、0 の桁はそのまま (2010h22a-q068 正答エ) / mix: OR と XOR の差は両方 1 の 1 行だけ (2 入力で正しい)。analogy (階段の 3 路スイッチ) は XOR の正しい像 | OK | detail の zh / en の帰属 → L2 | L2 / L6 |

**単元レベル**: goals 3 点 (r1 MEDIUM 解消済み)・overview_cols 2・overview_rows 8 行 (extra の「入力 n 個なら 2 の n 乗行」「両方 1 なら 0」等すべて正しい)・pairs 2 組 (AND / OR 3 行 key 1、OR / XOR 3 行 key 1、全セル正しい)・key_points 4 (L1)・summary (派生一致)・challenge 5 題 (全て本文で解ける)。

## 3. 指摘一覧

**HIGH: 1 / MEDIUM: 1 / LOW: 6 (うち 建议修 2)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| H1 | **HIGH** (D-198 写し) | `terms[0](集合).points[0].text_jp` (+ zh / en を同形に揃える) | 前半「積集合 A∩B は A の部分集合であり」が 2010h22h-q069 の**正答肢の文そのもの**を同じ記法で再現する。正規化後の一致窓: 単元「A∩BはAの部分集合であり」↔ 正答肢「A∩BはAの部分集合である」= 13 字中 1 字違い (ed ≈ 0.08、HIGH 較正 ed 0.14 より近い)。12 字完全一致 1 件 (遮蔽あり・なし両方)、近似 16 窓は全てこの文と q069 / q062 の正答肢 (後者「(A∩B) は (A∪B) の部分集合である」) の骨格。「どんな 2 つの集合 A と B でも」も題文の「二つの集合 A と B について常に成立」の枠をなぞる。D-198 の「標準的な定義・原則の一般表現」免除は、句が長い文の一部に溶けている場合の扱いで、本件は選択肢 1 本の全文を選択肢の記法 (A / B) ごと写しているため当たらない。同じ事実は `key_points_jp[0]` が記号なしで述べており、記号を外せば写しにならない (修正案の新文は topic 28 題と 10 字照合 0 件、73 字・2 文) | jp「どんな 2 つの集合 A と B でも、積集合 A∩B は A の部分集合であり、A は和集合 A∪B の部分集合である。包含は「積集合 ⊆ もとの集合 ⊆ 和集合」の順に並ぶ。」→「どんな 2 つの集合でも、積集合の要素はすべてもとの集合に入り、もとの集合の要素はすべて和集合に入る。包含は「積集合 ⊆ もとの集合 ⊆ 和集合」の順に並ぶ。」<br>zh「对于任意两个集合（[[jp:集合]]） A 和 B，交集（[[jp:積集合]]） A∩B 都是 A 的子集（[[jp:部分集合]]），而 A 又是并集（[[jp:和集合]]） A∪B 的子集。包含关系按“交集 ⊆ 原集合 ⊆ 并集”的顺序排列。」→「对于任意两个集合（[[jp:集合]]），交集（[[jp:積集合]]）的元素都属于原集合，原集合的元素又都属于并集（[[jp:和集合]]）。包含关系按“交集 ⊆ 原集合 ⊆ 并集”的顺序排列。」<br>en "For any two sets ([[jp:集合]]) A and B, the intersection ([[jp:積集合]]) A∩B is a subset ([[jp:部分集合]]) of A, and A is a subset of the union ([[jp:和集合]]) A∪B. Inclusion runs in the order "intersection ⊆ original set ⊆ union."" → "For any two sets ([[jp:集合]]), every element of the intersection ([[jp:積集合]]) is in each original set, and every element of an original set is in the union ([[jp:和集合]]). Inclusion runs in the order "intersection ⊆ original set ⊆ union."" |
| M1 | **MEDIUM** (D-204 / 書き方 7、既知型 (4)) | `terms[3](論理演算).analogy_jp` / `analogy_zh` / `analogy_en` (派生なし) | 比喩が論理演算 (総称) を「**複数の答えを 1 つにまとめる**作業」と描き、入力 1 つの演算を範囲から外す。同じ用語の `detail_jp`「入力を 1 つだけとる否定もある」、NOT の `one`・`detail`「入力を 1 つだけとる単項演算で、2 つの入力を組み合わせる演算とは形が違う」、`overview_rows[6].extra`「入力が 1 つだけ」と食い違う (総称の比喩の像が detail の認める成員を否定する = 前例 b 系の「募金箱」「購入時だけ」と同型)。引用題で誤答に直結はしない | jp「質問に「はい」か「いいえ」でしか答えない係が、決まった手順で複数の答えを 1 つにまとめる作業。」→「質問に「はい」か「いいえ」でしか答えない係が、受け取った 1 つ以上の答えから、決まった手順で「はい」か「いいえ」を 1 つ返す作業。」<br>zh「就像只用“是”或“否”回答问题的工作人员，按固定步骤把多个回答汇总成一个。」→「就像只用“是”或“否”回答问题的工作人员，根据收到的一个或多个回答，按固定步骤返回一个“是”或“否”。」<br>en "Like a clerk who answers only "yes" or "no" and follows a fixed procedure to merge several answers into one." → "Like a clerk who answers only "yes" or "no" and, from the one or more answers received, returns a single "yes" or "no" by a fixed procedure." |
| L1 | LOW **建议修** | `key_points_jp[3]` (+ 派生 `summary.key_points_jp[3]`) | jp「AND は 0 の桁を 0 にし、XOR は 1 の桁を反転する」は誰の桁かを書かず、データ自身の 1 の桁を反転するとも読める。zh「对方为 0 的位」・en "in the other operand" と考点 (AND points[0] / XOR points[1]「相手のビットが」) は相手側と明記 → 三語の精度差 (jp だけ曖昧、誤りではない) | jp のみ「ビットごとの演算では、AND は 0 の桁を 0 にし、XOR は 1 の桁を反転する。」→「ビットごとの演算では、AND は相手が 0 の桁を 0 にし、XOR は相手が 1 の桁を反転する。」 |
| L2 | LOW **建议修** | `terms[7](XOR).detail_zh` / `detail_en` 2 文目 | jp「同じ値で 2 回 XOR をとると元の値に戻る性質があり、誤りの検出などにも使われる」は主語 (XOR) がゆるく読めるが、zh「这一性质也用于检测错误等」・en "a property used for purposes such as error detection" は誤り検出を「2 回で元に戻る性質」の用途と特定する。誤り検出 (パリティ) は XOR の演算そのものを使うもので、自己逆の性質の用途ではない (既知型 (6) の形: zh/en だけが jp より狭い帰属)。引用題はこの点を問わない | zh「无论两个输入都为 0 还是都为 1，只要值相同，输出就为 0。用同一个值做两次 XOR 会回到原值，这一性质也用于检测错误等。」→「无论两个输入都为 0 还是都为 1，只要值相同，输出就为 0。用同一个值做两次 XOR 会回到原值；XOR 还用于检测错误等。」<br>en "Whether both inputs are 0 or both are 1, matching values give an output of 0. Applying XOR twice with the same value restores the original, a property used for purposes such as error detection." → "Whether both inputs are 0 or both are 1, matching values give an output of 0. Applying XOR twice with the same value restores the original, and XOR is also used for purposes such as error detection." |
| L3 | LOW | `terms[2].points[1].text_*` / `terms[6].points[0].text_*` | 2013h25a-q064 を 2 考点で引き「括弧外の否定は括弧内の結果を作ってから反転」を言い直す (真理値表の図 steps 2〜3 とも重なる、jp-review r2 low の残存、D-203 §9)。NOT 側は「OR の否定 = すべて 0 の行だけ 1」を足しており事実は正しい | 記録のみ |
| L4 | LOW | `terms[3].detail_*` 3 文目、`terms[4].detail_*`、`terms[5].detail_*`、`terms[6].detail_*`、`pairs[0].rows[1]` | 書き方 8: 集合 ↔ 論理演算の対応 (積 = AND・和 = OR・補 = NOT) が論理演算 detail・AND / OR / NOT 各 detail・pairs[0].rows[1] の 5 箇所に出る (各 detail は自分の側だけ述べ、対比として並べるのは 論理演算 detail と pairs の 2 箇所)。ベン図 ↔ 論理演算の橋という単元の設計意図 (index rationale) に沿う | 記録のみ |
| L5 | LOW | `terms[0].one_zh` / `terms[6].one_zh` (+ 派生 `definition_zh`) | zh 訳語と jp 原語が同字のため「集合（集合）」「NOT（否定，否定）」と同じ語が括弧内に重なる (D-202 の見出し語併記を機械的に満たした形、他単元にも同型あり) | 記録のみ (D-202 の規則どおり。表示側の扱いは単元外) |
| L6 | LOW | `terms[6].analogy_*` / `terms[7].analogy_*` | NOT (押すたびに点灯・消灯が切り替わるボタン) と XOR (階段の 2 スイッチ) がともに「切り替え」の像。XOR の相手 1 = 反転 (XOR points[1]) と整合し、引用題・challenge で NOT と XOR を取り違えさせる題は無い (2012h24a-q082 の NOT 肢は 1 入力の表で別) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① AND / OR (すべて 1 / どれか 1): `pairs[0].rows[0]` (key)、各 one (定義そのもの)、`goals[2]` (予告、行の指定のみ)、overview extra (各自の性質) → 許容。② OR / XOR (両方 1 の行): `pairs[1].rows[0]` (key)、XOR mix `points[2]`、`goals[2]` (予告)、overview_rows[7].extra / XOR detail 1 文目 / XOR hook (XOR 自身の性質で OR と並べない) → pairs + mix の 2 箇所で上限内。③ 集合対応 → L4。④ ベン図の塗り範囲 OR / XOR: `pairs[1].rows[2]` のみ → 許容。

**限定条件 (書き方 9)**: 集合 points[0] の「どんな 2 つの集合でも」(= 常に成立)、AND points[1] の「すべての入力が 1 のときだけ」、XOR points[2] の「両方の入力が 1 のとき」(2 入力)、OR points[0] の「両方に当てはまる数を引いて」→ 全て保持、落ち 0。

## 4. zh-term warn 12 件の判定 (validate B6)

| warn | 件数 | 判定 |
|---|---|---|
| 集合 → 集合 | 8 (`overview_rows[0].extra_zh[1]`、`terms[0].fig` rows[0..2].cells[0].zh、`terms[1].fig` rows[1].cells[3].zh・rows[3].cells[3].zh、`pairs[0].rows[1].a_zh/b_zh`) | **偽陽性**。照合は部分文字列: jp の 和集合 / 積集合 / 補集合 / 部分集合 に「集合」が含まれ、zh の該当欄は数学の標準訳 并集 / 交集 / 补集 / 子集 (および 并・交・补) で「集合」の字を含まないため warn になる。訳は正しく、zh_terms.json の 集合→集合 (単独の「集合」) にも反しない |
| スイッチ → 交换机（Switch） | 2 (`terms[2].analogy_zh`、`terms[7].analogy_zh`) | **偽陽性**。どちらも照明の壁スイッチ (真理値表: 2 スイッチの照明 / XOR: 階段の上下のスイッチ) で、zh は「开关」が正しい。交换机 (ネットワーク機器) にすると誤訳。`zh_terms.unit.json` の注記「その見出し語の技術的意味のときだけ使う」に従った正しい不使用 |
| ビット → 比特 | 2 (`terms[3].detail_zh`、`key_points_zh[3]`) | **偽陽性・用語は一貫**。jp「ビットごとの処理 / 演算」を zh は標準語「按位（进行的处理）/ 按位运算」(bitwise) で訳しており正しい。ビット値を指す箇所 (AND points[0]・XOR points[1]「相手のビット」) は「对方比特」と 比特 を使い、桁 (位置) は「位」で訳す。比特 = ビット (値)、位 = 桁、按位 = ビットごと、の使い分けが単元内で一貫 (`zh_terms.unit.json` の ビット→比特 に合致) |

## 5. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **1** (H1) |
| MEDIUM | **1** (M1) |
| LOW | **6** (建议修 2: L1・L2 / 記録のみ 4: L3〜L6) |

**範囲外の観察** (書き直し対象外):
- O1 `source_figures[6].figure_description` (2009h21h-q071) の文が「AとBとCの共通部分」と書くが、括弧内の式 B∩C∩(not A) と原図 (A の外) が正しい。`source_figures[8]` (2017h29a-q098) も文は「BとCの重なり部分」だが式 (not A) and (B or C) と原図 (B∪C) が正しい。v1 由来のメタデータの文言誤りで本文には影響なし。
- O2 `unit_summary_*` は manifest の summary_jp と同文 (未改稿)。
- O3 challenge は v1 (2015h27h-q097 / q099 を含む) から 2013h25a-q064 / 2013h25h-q082 に差し替わり、5 題とも本単元の考点で解ける。

確認済みで問題なし: 全 13 題の解答再計算 (§1-2)、真理値表 60 セル・ベン図 / 集合表のセル三語一致 (§1-4)、限定条件 (落ち 0)、D-198 (iii) 選択肢のなぞり 0 (§1-5)、§9 禁止句 (定型締め句 0)、framing 0/0/0、D-197 (validate 0)、D-200、D-205 / D-210 (該当する改訂文書・法令なし)、`[[jp:]]` 原語 12 種実在、one_zh / one_en 見出し語併記 8/8、派生フィールド一致、図種登録内、用語・`term_zh`・`term_en` の v1 不変量、jp-review r1 MEDIUM の三語解消。

## 6. 判定

**FAIL** (D-199: HIGH 1 / MEDIUM 1)。事実面は全 8 用語・考点 12 件・引用 13 題で正答と一致し誤答肢の支持・限定条件落ちは無いが、H1 (集合 points[0] が 2010h22h-q069 の正答肢を記法ごと再現 = D-198 写し) と M1 (論理演算 analogy が単項の否定を範囲外にする) は B3 補丁 (各 1 フィールド内の文字列置換、構造変更なし) で解消可能。L1・L2 も同時に補丁推奨。補丁後に validate / parity を再実行し、H1 新文の 12 字照合 0 を再確認すること。

## 7. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-33-u02
✓ technology-13-33-u02 unit: 0 issues (data/ip/textbook/units/technology-13-33-u02.json), 12 warning(s)
  warn  zh-term  overview_rows[0].extra_zh[1]  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[0](集合).fig.data.rows[0].cells[0].zh  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[0](集合).fig.data.rows[1].cells[0].zh  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[0](集合).fig.data.rows[2].cells[0].zh  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[1](ベン図).fig.data.rows[1].cells[3].zh  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[1](ベン図).fig.data.rows[3].cells[3].zh  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[2](真理値表).analogy_zh  スイッチ → 交换机（Switch） not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[3](論理演算).detail_zh  ビット → 比特 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[7](XOR).analogy_zh  スイッチ → 交换机（Switch） not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  pairs[0].rows[1].a_zh  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  pairs[0].rows[1].b_zh  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  key_points_zh[3]  ビット → 比特 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-33-u02
✓ technology-13-33-u02 parity: 32 locations, 0 diff
EXIT=0
```
