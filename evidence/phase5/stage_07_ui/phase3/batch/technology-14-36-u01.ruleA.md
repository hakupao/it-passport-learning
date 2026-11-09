# Rule A 全数抽検 — technology-14-36-u01 (データ構造の基本)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / jp-review / localiser / loc-review) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b76)、repo HEAD `afb67ad0` + 作業ツリー (単元 JSON は未コミットの書き直し版 = run `b76-u01-a1` の loc r0 と本体フィールド完全一致 [スクリプトで diff 0]、sha256 先頭 `20b77c6c590618f3`)。
- **対象**: `data/ip/textbook/units/technology-14-36-u01.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (リスト / スタック / キュー / 木構造 / 2分木) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/technology-14-36-u01/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。整合確認先: technology-14-37 (擬似言語・配列, v2 済) u01〜u05。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 8 件 = exam 3 + mix 5、引用 qid 延べ 6 件 = 異なり 6 題)**: topic `technology-14-36` の全 7 題を `questions.json` から再読し、手で再トレース:
   - 2018h30a-q076 (正答イ = 最後に格納したものを最初に取り出す): `terms[1].points[0]` と一致。誤答 (任意位置 / 先入れ先出し / キー優先度) を支持する記述なし。
   - 2010h22h-q085 (X,Y,Z 入力、直接出力・積む・取り出すの 3 操作、出力不可能 = 正答ウ Z,X,Y): Z を最初に出すには X・Y が両方スタックにあり Y が上 → 次は Y でなければならず X は不可。他の 3 肢は実現手順あり (ア: X 直出し→Y 積む→Z 直出し→Y 取出し / イ: X 積む→Y・Z 直出し→X 取出し / エ: X・Y 積む→Z 直出し→Y→X)。`points[1]`「同時に積まれた 2 つは後から積んだ方が先」で正答のみ排除 → 一致。
   - 2016h28a-q092 (A〜D、同じ装置、出力不可能 = 正答エ C,D,A,B): C の時点で A・B が積まれ B が上 → A が B より先に出る エ は不可。ア (A 積む→B 直→A 取→C 積む→D 直→C 取)・イ (A 積む→B 直→C 積む→D 直→C→A)・ウ (A・B 積む→C 直→B→D 直→A) は実現可 → 一致。
   - 2019r01a-q062 (PUSH/POP のみ、a,b,c 到着、あり得ない = 正答ウ c,a,b): c を先に出すには a・b が積まれ b が上 → a が先は不可 → 一致。
   - 2011h23tokubetsu-q058 (3 要素格納済み + 1 追加後に 2 回取出し、2 回目 = 2 番目格納 → 正答イ): `terms[2].points[0]`「k 回目 = k 番目」で k=2 → 一致。2018h30h-q096 (4 値格納後 2 回取出し、2 回目 = 2 番目格納 → 正答ア): 一致。
   - 未引用 quiz 2009h21a-q054 (箱の積み上げ + 操作 1〜4): 下から 1,2,2,3,4 → 操作 1 (4+3=7) → 1,2,2,7 → 操作 2 → 1,2,2,7,3 → 操作 3 (3,7,2 の平均 4) → 1,2,4 → 操作 4 (|4−2|=2) → 1,2 = 上から「2 と 1」= 正答イ。本文 (出し入れは常にいちばん上の 1 か所) と整合。
3. **quiz / challenge_questions**: スタック quiz [q076, q054, q085] / キュー quiz [q058] / challenge [q092, q062, q096] — topic の 7 題全てを使用、全て本文で解ける。v1 の quiz は用語への割り当てが崩れていた (リストに q085 等) が v2 で正しい用語へ付け替え済み。リスト / 木構造 / 2分木 は引用題 0 (manifest term_questions 空) で考点は全て mix。
4. **D-198 写し**: validate の copy guard = 0 件 (warn 行の出力なし = `choice-echo` 0)。独立照合として JP 文字列 147 本 (派生除く) を topic 全 7 題の題文 (stem_jp_clean 優先) + 選択肢と 12 字連続照合 (句読点・記号・空白除去):
   - カタカナ 4 字以上・英数を遮蔽: **0 件**。
   - 遮蔽なし: 2 件 (`terms[1].one_jp`「LastInFirstOut」/ `terms[2].one_jp`「FirstInFirstOut」 ↔ 2018h30h-q096) = LIFO / FIFO の標準展開形で写しではない (偽陽性)。
   - 近似 (編集距離 1〜2): 2 件、同じ英字展開形の窓ずれのみ (偽陽性)。
   - (iii) 選択肢なぞり: `terms[1].points[1]` は出力順の候補 (X,Y,Z / A〜D / a,b,c の並び) を一切再現せず一般規則のみ。`terms[2].points[0]` は題の値 (33 / 27 / 12 / 45、8 / 1 / 6 / 3) を使わず k で一般化。2 文目「途中で追加しても追い越されない」は q058 の場面 (格納済み + 追加) の形だが、FIFO の一般原則で数値・要素名なし (jp-review と同判断、L8)。`terms[2].points[1]` (スタック = 新しい方 / キュー = 古い方) は q076 の誤答ウ (FIFO) の言い回しを使わず両側を肯定定義で述べる対比 (D-209 免除)。図 (赤・青の積み / 並び、りんご・みかん・ぶどう、社長・部・課の組織図) はいずれも引用題に無い自作の場面。
5. **D-195**: one = 1 文 × 5 (太字あり)、detail 2〜3 文 (3/2/3/2/2)。定義前使用: ポインタ (リスト one)、LIFO / FIFO (one の括弧)、プッシュ / ポップ・エンキュー / デキュー (detail)、節 (木構造 one)・根 / 葉 (木構造 detail)、左の子 / 右の子 (2分木 one)。例外 = `goals_jp[2]` が根・節・葉を予告で先に使う (jp-review L、L7)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh/en 相当) → `terms[0].hook_jp`「〜と覚える」1 件 (+ 派生 `memory_hook_jp` / `summary.memory_hooks_jp[0]`) = L4、`freq_badge`「低頻」は対象外、図 caption の「〜が出る」4 件は「取り出される」の通常用法、en の always / every / only / never は通常用法で偽陽性。図の型: リスト = table static、スタック / キュー = flow steps 4、木構造 = tree steps 3、2分木 = tree static (全て登録内、steps 3〜4 の範囲内)。pair 配置: スタック→キュー (キュー の後)、リスト→木構造 (木構造 の後)、各組 key 行 1。
6. **D-200**: 考点数 1/2/2/2/1 (≤3 ✓)、各 JP 文数 1〜2・字数 46〜69 (≤100 ✓)。**framing 件数** (`validateV2.pointFraming`、tsx で全考点に適用): jp 0 / zh 0 / en 0。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (「だけ」「ではない」「以下」の照合) → `terms[3].points[0]` / `pairs[1].rows[0].a`「次につながる要素は 1 つだけ」と リスト図の末尾行「なし (末尾)」が措辞上ずれる (L1)。2分木の「2 つ以下」は one・detail・overview・key_points[3]・points[0] で一致。スタックの「いちばん上の 1 か所」は detail・pairs[0].rows[1] で一致。書き方 8 (対比の出現欄): ① スタック = 新しい方 / キュー = 古い方: `pairs[0].rows[0]` + `terms[2].points[1]` (mix) の 2 箇所 (overview 総表の列と key_points[1]・[2] は各片側のみ) → 許容。② リスト = 次は 1 つ / 木構造 = 複数の子: `pairs[1].rows[0]` + `terms[3].points[0]` の 2 箇所 → 許容。③ 配列 / リスト: `terms[0].points[0]` のみ。書き方 9: 引用題の限定条件 (q085 / q092 の「①〜③を組み合わせても」= 直接出力も可、q062 の「一つの装置だけ」「PUSH/POP に限る」) — 考点は「スタックに同時に積まれている 2 つ」に限定して述べるので、直接出力のある装置でも、全てがスタックを通る装置でも成り立つ (落ち 0)。§6 → L2。§9 言い直し → L5。
8. **technology-14-37 との整合**: 14-37 は配列を「要素番号で参照」(u03)・「配列の何番目かを示す番号」(u04) と述べる。本単元 `terms[0].points[0]`「配列は…番号で直接参照する」と矛盾なし。14-37-u05 の 2分探索法 (整列済み配列) と 2分木 detail の探索の例 (例えば、値の大小で左右に振り分け) は別物として並立し、混同させる記述なし。配列・スタック・キュー・リスト・木の用語は他の v2 単元で見出し語になっておらず定義の衝突なし。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 11 種 (リスト / 配列 / スタック / 後入れ先出し / キュー / 先入れ先出し / 木構造 / 節 / 根 / 葉 / 2分木) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 5 用語に見出し語の `[[jp:]]` あり、zh 訳語が `zh_terms.json` (列表 / 栈 / 队列 / 树结构 / 二叉树) に一致 (validate の B6 / jp-origin warn 0)。
10. **前回指摘の解消確認**: journal `journal.b76-u01-a1.jsonl` の jp-review r1 (PASS、low 5) と loc-review r1 (PASS、low 2) に HIGH / MEDIUM は無い。low 7 件は全て未修のまま残っており (unit = loc r0 と一致)、本監査で再判定した (L2・L3・L5・L6・L7・L8 に吸収)。退行 (zh / en で前回 OK の主張が崩れる) なし。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | リスト | OK — 引用題 0、mix 1: 配列 = 連続した位置・番号で直接参照 / リスト = ポインタで次を決め、並べ替え・挿入で要素を動かさない (標準事実、14-37 と整合)。table 図 (位置 1 りんご→3、3 みかん→2、2 ぶどう→末尾) を手でたどり detail「りんご、みかん、ぶどう」と一致、key 行 (位置 3) が「記憶位置の順と一致しなくてよい」を示す | OK (hook「と覚える」L4) | OK | L4 / L5 (key_points[0]) |
| 2 | スタック | OK — exam 2 / 4 題 (q076 / q085 / q092 / q062、§1-2 で全肢再トレース一致)。「同時に積まれている 2 つ」の限定で、直接出力ありの装置 (q085・q092) と PUSH/POP のみの装置 (q062) の両方に正しく効く。flow steps 4 (赤→青→青出る→赤出る) は LIFO と一致。未引用 quiz q054 も再計算一致 | OK | OK | L5 (key_points[1]) |
| 3 | キュー | OK — exam 1 / 2 題 (q058 正答イ / q096 正答ア、k=2 で一致) / mix 1: 違いは取り出す端 (pairs[0].rows[1] と整合)。flow steps 4 (赤→青→赤出る→青出る) は FIFO と一致 | OK (L8 は (iii) に当たらず) | OK | L3 (overview en) / L5 (key_points[2]) / L8 |
| 4 | 木構造 | OK — 引用題 0、mix 2: リスト = 次は 1 つ / 木 = 複数の子 (措辞 L1) / 根 = 親なし・葉 = 子なし・根は 1 つ・葉は複数可 (標準事実)。tree steps 3 (社長 → 2 部 → 3 課) の caption は図と一致 | OK | zh「根（[[jp:根]]）」冗長 L7 | L1 / L6 / L7 |
| 5 | 2分木 | OK — 引用題 0、mix 1: 「2」は上限で、全節がちょうど 2 つではない (one「2 つ以下」・detail「子が 1 つ・0 の節も可」と一致)。detail の探索の例は「例えば」付きで「減らせる」(可能) に留まり全称化なし。tree static (根→左の子 [葉 2]・右の子 [葉 1]) は子 1 つの節を含み考点を体現 | analogy / hook の像 L2 | OK | L2 |

**単元レベル**: goals 3・overview_cols 2 (形 / 取り出し方・たどり方)・overview_rows 5・pairs 2 組 (スタック / キュー 4 行 key 1、リスト / 木構造 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge 3 題 (q092 / q062 / q096、本文で解ける)。`unit_summary_*` は v1 と同文 (B2 審査済み、事実正しい)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 8 (うち 建議修 3)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[3].points[0].text_jp/zh/en`、`pairs[1].rows[0].a_jp/a_zh/a_en` | 「各要素の次につながる要素は 1 つだけ」/「1 つだけ」と言い切るが、同単元のリスト図の末尾行は「なし (末尾)」で、末尾要素には次が無い (観点 7 の措辞級、どの題も誤答させない。対の木構造側は「つながりうる」と可能形) | `terms[3].points[0]`: jp「各要素の次につながる要素は 1 つだけだが」→「各要素の次につながる要素は 1 つまでだが」/ zh「每个元素后面只连着 1 个元素」→「每个元素后面最多连着 1 个元素」/ en "each element links to only one next element" → "each element links to at most one next element"。`pairs[1].rows[0]`: a_jp「1 つだけ」→「1 つまで」/ a_zh「只有 1 个」→「最多 1 个」/ a_en "Only one" → "At most one" |
| L2 | LOW **建議修** | `terms[4].analogy_jp/zh/en` (hook_jp/zh/en は記録のみ) | トーナメント表は試合ごとに枠がちょうど 2 つの像 (全内部節が子 2 つ) で、mix 考点・detail が退ける「子はちょうど 2 つ」の読みに寄る。本文「二股以下」「最多分成两股」"never…more than two" で矛盾までは行かない (jp-review の low を再確認、D-204 の像のずれ、引用題 0 なので (9) 非該当)。hook「二股に分かれる枝」も同じ像 | jp「トーナメント表のようなもの。どの試合も 2 つの枠から勝者が 1 人上がり、枝は常に二股以下に分かれる。」→「はい / いいえで進む診断チャートのようなもの。1 つの質問から先は「はい」と「いいえ」の 2 方向までに分かれ、片方にしか続きがない質問や、そこで結果が出て終わる質問もある。」/ zh「就像淘汰赛的对阵表。每场比赛都从两个位置中晋级一名胜者，分支始终最多分成两股。」→「就像按“是 / 否”往下走的诊断流程图。每个问题往下最多分成“是”和“否”两个方向，也有只有一边接着往下走的问题，或者到此给出结果、不再往下的问题。」/ en "Think of a knockout tournament bracket. Every match sends one winner up from two slots, so a branch never splits into more than two." → "Think of a yes/no quiz chart. Each question leads on in at most two directions, yes and no; some questions continue on only one side, and some end there with a result." |
| L3 | LOW **建議修** | `overview_rows[1].extra_en[1]`、`overview_rows[2].extra_en[1]` | loc-review の low (未修): "Take out the item added first first" は first が重なり、"Take out the item stacked last first" も読み直しが要る。意味は jp と一致 (jp / zh 変更なし) | `overview_rows[1].extra_en[1]` "Take out the item stacked last first" → "Last item stacked comes out first" / `overview_rows[2].extra_en[1]` "Take out the item added first first" → "First item added comes out first" |
| L4 | LOW | `terms[0].hook_jp` (+ 派生 `memory_hook_jp`、`summary.memory_hooks_jp[0]`) | §9 grep で「〜と覚える」1 件。記憶フックの結びとして許容 (5 フック中 1 件、前例 u02/u04/u05 と同じ扱い) | 記録のみ (任意: 「…矢印で結んだ形と覚える。」→「…矢印で結んだ形である。」) |
| L5 | LOW | `key_points_jp/zh/en[0..2]` | jp-review の low (未修): key_points[1]・[2] はスタック `points[1]`・キュー `points[0]` の、key_points[0] はリスト detail 3 文目の言い直し (D-203 §9)。事実は正しい | 記録のみ (要点の振り返り欄としての役割) |
| L6 | LOW | `terms[3].fig` (tree steps) | jp-review の low (未修): 形の概念に steps を使う (§2 では静的が本筋)。加えて例の木はどの節も子が 2 つ以下で、一般の木構造の例なのに 2分木 の条件も満たしてしまう (子 3 つ以上の節があればリスト / 2分木 との違いがより見える)。誤りではない | 記録のみ (節の追加は構造変更で B3 補丁の範囲外) |
| L7 | LOW | `goals_jp/zh/en[2]`、`terms[3].points[1].text_zh` | jp-review / loc-review の low (未修): goals が根・節・葉を定義前に予告で使う / zh「根（[[jp:根]]）」は同字で併記の情報が増えない | 記録のみ |
| L8 | LOW | `terms[2].points[0].text_jp/zh/en` 2 文目 | jp-review の low: 「途中でデータを追加しても先に入ったデータが追い越されない」は q058 の場面 (格納済み + 追加 + 取出し) の形。数値・要素名・順序は再現せず FIFO の一般原則 → D-198 (iii) に当たらない | 記録のみ |

**範囲外の観察**:
- O1 独立 copy 照合の遮蔽なしヒット 2 件・近似 2 件は LIFO / FIFO の英字展開形のみ (偽陽性)。
- O2 v1 では quiz の用語割当てが崩れていた (リストにスタック題 q085 等)。v2 で manifest term_questions どおりスタック / キューへ付け替え済み、リスト / 木構造 / 2分木 は quiz なし。

確認済みで問題なし: 計算・手順の再トレース (考点 6 題 + quiz 1 題、全肢)、限定条件 (§1-7)、§9 禁止句 (L4 のみ)、framing 0/0/0、D-197 (validate 0)、D-200 (≤2 文・≤69 字)、D-205 / D-210 (該当する規格・法令なし)、図の手順 (table / flow ×2 / tree ×2 を手でたどり本文と一致)、`[[jp:]]` 原語 11 種、one_zh / one_en の見出し語併記 5/5、zh 訳語表 (B6 warn 0)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、technology-14-37 との整合。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **8** (建議修 3: L1〜L3 / 記録のみ 5: L4〜L8) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 8 件 (qid 付き 3 件)・引用 6 題 + 未引用 quiz 1 題で、push / pop / 取出し順の再トレースは全て正答と一致し、誤答肢を支持する記述・限定条件の落ち・写しは無い。LOW 建議修 3 件 (L1〜L3) は補丁 (B3) で修正推奨、L4〜L8 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-36-u01
✓ technology-14-36-u01 unit: 0 issues (data/ip/textbook/units/technology-14-36-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-14-36-u01
✓ technology-14-36-u01 parity: 29 locations, 0 diff
EXIT=0
```
