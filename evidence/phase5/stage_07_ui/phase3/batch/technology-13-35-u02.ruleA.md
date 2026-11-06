# Rule A 全数抽検 — technology-13-35-u02 (符号化と文字コード)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (S148 続、第 41 批 b41)、repo HEAD `a08306eb` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b41-u02-a1` merge 結果、sha256 先頭 `96a9416b8126291f`)。
- **対象**: `data/ip/textbook/units/technology-13-35-u02.json` (textbook-unit-v2)、用語 **4 / 4 = 全数** (符号化 / JISコード / シフトJISコード / Unicode) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197〜D-200、D-202〜D-205、D-208〜D-211、PLAN §0-5 / §0-8。比較: `.planning/v2/technology-13-35-u02/v1-original.json` (用語 4 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 4 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (table cell・flow label) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。`terms[0].fig` の svg (v1 継承) の文字列 = 文字や情報 / 符号化(エンコード) / ビット列(0と1) / 復号(デコード) で本文と一致。
2. **考点 × 引用題 (考点 8 件 = exam 6 + mix 2、引用 qid 延べ 8 = 異なり 7 題、全題 topic `technology-13-35`)**: `questions.json` の正答・選択肢と `translations/<exam>.json` の stem_jp_clean で再読。計算題は自分で再計算: 2018h30h-q075 (26 種 → 2^5=32 ≥ 26 > 16 → 5 ビット、正答イ一致) / 2012h24a-q072 (0|11|0|0|0|10|10 → A C A A A B B、正答イ一致) / 2009h21a-q097 (1 件 = 1 バイト 10×2 + 2 バイト (20+40+10+10)×2 = 20+160 = 180 バイト × 10,000 件 = 1,800,000 バイト = 1,800 k、正答ウ一致) / 2012h24a-q093 (0100 + 0011 = 01000011 → C、正答ウ一致) / 2009h21a-q060 (1 の桁が重ならない ウ のみ加減算で合成・除去が成立; エ は桁が重なり繰り上がる、正答ウ一致)。単元の例 (10 種 → 4 ビット) は引用題の数値 (26) を使っていない。
3. **quiz / challenge_questions** (quiz 6 枠 = 異なり 4 題 + challenge 5 題、本文未引用は quiz 側で 2013h25h-q078 が JISコード・シフトJISコード の quiz を兼ねるのみ): q078 (世界の主要言語を 1 体系で = Unicode; 誤答 ASCII / EUC / SJIS) は Unicode one・pairs[1].rows[0] と整合し、JIS analogy (国の番号表)・SJIS の one とも誤答肢を支持しない。2010h22h-q060 (8→16 ビット、同じサンプリング周波数) は challenge と 符号化 points[1] で整合 (誤答 データ量が減る・CPU 負担が減る・周波数上限が上がる のいずれも本文は支持しない)。D-211 (quiz のみの出口) は本単元で未使用: quiz の qid は全て exam 考点の引用題か、本文の定義で解ける題。2009h21a-q097 / 2012h24a-q093 は考点に引用され quiz に無い (長文グループ題、D-211 とは逆向きで規則上問題なし)。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合: 単元の JP 文字列 94 本 (派生・source_figures・figure 除く) を topic 内全 35 題の stem_jp_clean + 選択肢と 12 字連続照合 (句読点・記号・空白除去)。**遮蔽なし** → 1 件: `unit_summary_jp` ↔ 2013h25h-q078 の「JISシフトJISUni…」= 見出し語の略形の連なり (v1 継承、用語名は表現ではない) → 偽陽性。**カタカナ 4 字以上・英数遮蔽あり** (実字 6 未満の窓除外) → 0 件。**近似 (編集距離 ≤2)** → 3 件、全て同じ `unit_summary_jp` の見出し語連なり → 偽陽性。カタカナの多い文 (シフトJIS 欄・Unicode 欄・図ラベル) を目視、題の語句の流用なし。(iii) 選択肢なぞり: validate の `warn choice-echo` 0 行。SJIS mix 考点 (SJIS vs Unicode の範囲) は q078 の誤答肢 SJIS を否定する形に見えうるが、二語対比を両側の肯定定義で述べ (D-209 免除)、q078 の選択肢の組 (ASCII / EUC) や順序を再現せず qid も付けていない → (iii) に当たらない。符号化 points[2] は q060 の味覚名・6 ビット・符号値を使わず一般原則 (1 の桁が重ならない) のみ → 写しでない。JIS points[1] は q097 の件数・文字数を使わない計算手順の一般表現。
5. **D-195**: 結論先行 (one = 1 文 × 4、太字あり)、展開 2〜3 文、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が / 必须 / 考试 / must / important) → `選択肢` 1 = `source_figures[2].figure_description` (メタデータ、本文外)、`must` 6 = 「must be told apart / must be represented」の通常用法、`exam` = `kind` 値のみ → 本文の定型句 0。図の型 (符号化 = svg static [v1 継承]、JIS = static table、Unicode = flow static nodes 3、SJIS = 図なし; 登録内)。pair 配置 (JIS→SJIS は SJIS の後、SJIS→Unicode は Unicode の後、各組 key 行あり)。
6. **D-200**: 考点数 3/2/1/2 (≤3 ✓)、各 JP 1〜2 文・字数 (空白・記法除く) 47〜88 (≤100 ✓)。**framing 件数** (validate `pointFraming`): validate 0 issues = jp / zh / en とも上限内。
7. **D-202 / D-203 / D-205**: 書き方 7 → L1 (JIS one の「かな」と表の 半角カナ)・L3 (SJIS「重ならない範囲」の粒度) 以外の不整合 0。書き方 8 → L5。書き方 9 (限定条件): q097「圧縮しない」→ points[1]「圧縮しない文字データ」保持、q060「同じサンプリング周波数」→ points[1] は標本 1 回のビット数だけを述べ周波数を変える主張なし、q078「世界の主要な言語」→「多くの言語」で範囲を閉じない、q075「最小限」→「最小の n」保持 → 落ち 0。D-205: JIS X 0201 / X 0208 は detail・points[0] で「例えば」、表の列見出し「(例)」、UTF-8 / UTF-16 は「例えば」→ 閉じた列挙・版なし件数 0。D-210: 引用題に法令・規格改正前の文言なし (JIS の 2019 改称は one_jp が新名称「日本産業規格」で記述)。
8. **事実 (符号幅ほか)**: UTF-8 = 1〜4 バイト可変長 (RFC 3629)、英数字 1・日本語の多く 3 バイト ✓; あ = U+3042、UTF-8 3 バイト (E3 81 82) ✓; 「同じ Unicode 文字でも UTF-8 と UTF-16 でバイト列が異なる」は全符号位置で成立 (1 バイト対 2 バイト、2 バイト域は先頭 0xC2–0xDF 対 0x00–0x07、3 バイト対 2 バイト、4 バイト先頭 0xF0– 対サロゲート 0xD8– で一致し得ない) ✓; Unicode = 番号体系、UTF-8 = 符号化方式で、「Unicode = UTF-8」の混同なし (detail・mix 考点・key_points[4]) ✓; JIS X 0201 = 1 バイト (8 ビット)、JIS X 0208 = 2 バイト ✓; 狭義の JIS コード = 切替え符号 (エスケープシーケンス) を挟む形式・電子メール ✓; シフトJIS = 1/2 バイト混在、2 バイト文字の 1 バイト目が 1 バイト文字に無い値 ✓ (detail・pairs[0].rows[0])、Windows 等で使用 ✓; pairs[1].rows[2]「日本語以外の多くの文字は表せない」は「多くの」で JIS X 0208 のギリシャ・キリル文字と矛盾しない ✓。
9. **三語**: zh・en が jp と同じ事実か、表セル・flow ラベル・比較行の三語一致、`[[jp:…]]` 原語 12 種 (符号化 / 復号 / 符号 / 化 / 復 / ビット数 / 標本 / 可変長 / JISコード / 文字コード / シフトJISコード / 符号化方式) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` (Unicode は zh/en/jp 同綴りで不要) ✓、zh 訳語 (编码 / JIS 编码 / Shift_JIS 编码 / Unicode / 字节 / 比特) は zh_terms.json と一致; 復号 は zh_terms の「解密」(暗号の意味) ではなく「解码」— 本単元は符号の意味で、unit 版 zh_terms にも 復号 は入っていない → 正しい。
10. **前段指摘の回収**: journal `journal.b41-u02-a1.jsonl` の jp-review r1 (PASS、low 10) と loc-review r1 (PASS、low 6) — HIGH / MEDIUM は 0 で、回帰の対象なし。未修の low のうち事実寄りのもの (en の「など」落ち) を L2 として建議修に上げ、他は L3〜L8 に記録。

## 2. 用語別判定 (4 / 4)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 符号化 | OK — exam 3 / 4 題: n ビット = 2^n 通り、最小 n (2018h30h-q075 正答イ 5 ビット、再計算一致; 例は 10 種で題の 26 を使わない、限定「最小限」保持) / 標本 1 回のビット数を増やすと段階が増え振幅を細かく表せる (2010h22h-q060 正答ア; 誤答 データ量減・CPU 負担減・周波数上限上昇 を支持しない) / 接頭部にならない可変長符号は一意に読み戻せる (2012h24a-q072 正答イ、再計算一致)・1 の桁が重ならない符号で加減算 (2009h21a-q060 正答ウ、再計算一致)。detail の固定長 / 可変長・規則の共有・文字化け ✓ | OK | en「など」落ち (L2) | L2, L6 (hook), L8 |
| 2 | JISコード | OK — exam 2 / 2 題: 英数字等 1 バイト (8 ビット)・漢字等 2 バイト、例えば JIS X 0201 の 8 ビット値 (2009h21a-q097 / 2012h24a-q093 正答ウ、再計算一致) / 圧縮しない文字データ容量 = Σ(文字数 × バイト数) × 件数 (q097 正答ウ 1,800、限定「圧縮しない」保持)。table (X 0201 1 バイト / X 0208 2 バイト) ✓ | OK | en「the kanji set」(L2) | L1 (建議修), L2 (建議修), L4, L5, L6 |
| 3 | シフトJISコード | OK — mix 1: SJIS = 日本語の文字と英数字、Unicode = 多言語 1 体系 (q078 と整合、D-209 二語対比)。detail の 1 バイト目判別・Windows ✓ | OK | OK | L3 |
| 4 | Unicode | OK — exam 1 / 1 題: 多言語を共通番号体系、言語ごとに使い分け不要 (2013h25h-q078 正答エ; 限定「世界の主要な言語」→「多くの言語」で閉じない) / mix: UTF-8 は符号化方式で文字集合の名前ではない、UTF-8 と UTF-16 でバイト列が異なる (全符号位置で成立)。flow (あ → U+3042 → UTF-8 3 バイト) ✓ | OK | OK | L5, L6 |

**単元レベル**: goals 3・overview_cols 2 (対象 / 1 文字の大きさ)・overview_rows 4・pairs 2 組 (JIS / SJIS 3 行 key 1、SJIS / Unicode 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge 5 件 (2018h30h-q075 / 2012h24a-q072 / 2009h21a-q060 / 2013h25h-q078 / 2010h22h-q060 — 本文と矛盾なし)。事実誤りなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 8 (うち 建議修 2)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1].one_jp` / `one_zh` / `one_en` (+ 派生 `definition_*`) | one は「漢字やかなを 2 バイト」と言うが、同用語の表 `fig.data.rows[0]` は JIS X 0201 の **半角カナ = 1 バイト**、overview_rows[2] も SJIS の半角カナ 1 バイトを示す。「かな」を全て 2 バイトと読める措辞の粒度差 (観点 7、事実誤りには至らない: 狭義 JIS コードでは全角かなが 2 バイト) | jp「漢字やかなを 2 バイトで表す」→「漢字やひらがな・全角カナを 2 バイトで表す」/ zh「汉字和假名用 2 字节表示」→「汉字、平假名和全角假名用 2 字节表示」/ en "and 2 bytes for kanji and kana." → "and 2 bytes for kanji, hiragana and full-width kana." |
| L2 | LOW **建議修** | `terms[1].detail_en`、`terms[0].detail_en` (+ 派生 `explanation_en`) | jp「漢字などの集合」「文字化けなどが起こる」の「など」が en で落ち、JIS X 0208 = 漢字だけ (実際はかな・記号・ギリシャ文字等も含む) と読める (loc-review r1 low の未修分) | `terms[1].detail_en` "the kanji set in JIS X 0208" → "the set of kanji and other characters in JIS X 0208" / `terms[0].detail_en` "if the rules differ, the result is garbled text." → "if the rules differ, the result can be garbled text and similar errors." |
| L3 | LOW | `terms[2].one_*`、`overview_rows[2].one_line_*`、`key_points_*[3]`、`terms[2].hook_*` | 「2 バイト文字の番号を 1 バイト文字と重ならない範囲へずらす」は 2 バイト全体が重ならないとも読めるが、実際に重ならないのは 1 バイト目だけ (2 バイト目は英数字域と重なり得る)。detail・pairs[0].rows[0] が 1 バイト目と正しく限定して橋渡し (jp-review r1 low) | 記録のみ |
| L4 | LOW | `pairs[0].rows[0].a_*`、`goals_*[1]` vs `terms[1].one_*` | one は広義 (JIS の文字コード全般)、pairs key 行と goals は detail の「狭い意味」(切替え符号を挟む形式) を前提。detail が明記して橋渡し (jp-review r1 low) | 記録のみ |
| L5 | LOW | `terms[3].detail` / `points[1]` / `key_points[4]` / `pairs[1].rows[1]`、`pairs[1].rows[0]` と `rows[2]` | 書き方 8: 「Unicode = 番号体系 / UTF-8 = 符号化方式」が 3 欄以上、SJIS vs Unicode の範囲差が pairs 2 行 + mix 考点 + 総表で反復。SJIS「日本語の文字と英数字」は X 0208 のギリシャ・キリル文字を含めない言い方だが「だけ」と閉じていない | 記録のみ |
| L6 | LOW | `terms[1].points[0]`、`terms[3].points[0]`、`terms[0].hook_jp`、`terms[1].hook_*` | §9: JIS points[0] 1 文目・Unicode points[0] は one の言い直し。符号化 hook「復(もど)す」は表外訓、JIS hook「工業製品の規格と同じ名前の仲間」はぼかした言い方 (jp-review r1 low) | 記録のみ |
| L7 | LOW | `overview_cols_*[1]` × `overview_rows[0].extra_*[1]`、`terms[0].points[1]` (標本・振幅)、`terms[0].fig` (svg static) | 列「1 文字の大きさ」に符号化の一般則、標本・振幅は前提単元 U01 の語で未定義、過程図が static svg (v1 継承、§0-8 で最大 low) | 記録のみ |
| L8 | LOW | zh 全般「英文数字」「代码」、`terms[0].points[1].text_zh`「级数」、`terms[1].detail_zh`「主要用于电子邮件」、`pairs[0].rows[0].b_en` | loc-review r1 low の未修分 (現地化・時制・目的句の欠落)。誤答肢寄りの読み (型 6) にはならない | 記録のみ |

確認済みで問題なし: 計算題 5 題の再計算一致、限定条件 (考点 6 件の qid 付き全て保持)、Unicode / UTF-8 の区別、UTF-8 1〜4 バイト・日本語の多く 3 バイト・UTF-16 とのバイト列差、JIS X 0208 2 バイト、SJIS 1/2 バイト混在と 1 バイト目判別、閉じた列挙なし (「例えば」付き)、D-198 (validate 0、独立照合の 1 + 近似 3 は見出し語連なりの偽陽性)、(iii) なぞりなし、D-211 未使用で問題なし、§9 禁止句 0、D-200、`[[jp:]]` 原語 12 種実在、zh 訳語表、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **8** (建議修 2: L1・L2 / 記録のみ 6: L3〜L8) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 4 用語・考点 8 件・引用 7 題 (計算 5 題を再計算) + quiz / challenge で、考点の主張は正答と一致し、誤答肢を支持する記述・限定条件落ち・写しは無い。LOW 建議修 2 件 (L1・L2) は B3 補丁で修正推奨、L3〜L8 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-35-u02
✓ technology-13-35-u02 unit: 0 issues (data/ip/textbook/units/technology-13-35-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-35-u02
✓ technology-13-35-u02 parity: 22 locations, 0 diff
EXIT=0
```
