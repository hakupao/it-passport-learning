# Rule A 全数抽検 — technology-14-37-u04 (データ型)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 照合スクリプトは scratchpad のみ)。
- **Date**: 2026-11-08 (S149 第 51 批 b51)、repo HEAD `be49bdf9` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b51-u04-a1` merge 結果、`merged.json` と jq -S 比較で同一、sha256 先頭 `d278e8ff5c2b7cc6`)。
- **対象**: `data/ip/textbook/units/technology-14-37-u04.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (データ型 / 整数型 / 実数型 / 論理型 / 文字型) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、D-208〜D-210、テンプレの既知失敗型 (1)〜(10)。比較: `data/ip/textbook/.planning/v2/technology-14-37-u04/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (tree label・table cells) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題**: manifest の `term_questions` は 5 用語とも空 (topic にデータ型を見出し語とする過去問なし)。考点 5 件は全て `kind: mix` で qid なし、`quiz` は 5 用語とも空。したがって考点 × 正答の照合対象は 0 件。代わりに topic `technology-14-37` 全 32 題のうち型を明示する擬似言語題 (2022r04-q078 / 2022r04-q096 / 2023r05-q060 / 2023r05-q064 / 2024r06-q062 / 2024r06-q085 / 2025r07-q078 / 2025r07-q099 / 2026r08-q067 / 2026r08-q085) と本文の型の説明が食い違わないかを点検 (→ L1)。
3. **challenge_questions 4 題を手で追跡** (配列・スタック・キューを扱う題は 4 題中 0。配列の要素番号を問う題も無い。本文の「配列の何番目か」(整数型 detail / pairs[0].rows[3]) は起点を述べず、topic の擬似言語題 [要素番号は 1 から] と衝突しない):
   - 2010h22a-q069 (2 変数の手続を繰り返し、終了時の x を問う): x=2, y=3 → y=2, x=4 (y≠1 で戻る) → y=1, x=5 → y=1 で終了 → x=5 = 正答イ ✓。
   - 2010h22h-q053 (作業用変数を使った 2 変数の入替え): TMP←A, A←B, B←TMP の順だけが両方の値を保つ → 正答イ ✓ (他の 3 肢は元の A か B の値が失われることを各肢で確認)。
   - 2011h23a-q064 (状態番号 ×11 を 3 で割った余りで環状に遷移、2 回): 生 stem_jp は余り 0 の処理が OCR 崩れ (「そのまま」) のため stem_jp_clean (余り 0 = 時計回りに 1 つ) で判断。1 → 11 mod 3 = 2 → 時計回り 2 つ → 3; 3 → 33 mod 3 = 0 → 時計回り 1 つ → 4 = 正答エ ✓ (崩れた版で解くと 3 = ウ になり正答と合わない → clean が正)。整数型 detail「整数どうしの割り算では、商と余りを整数で求める」と整合。
   - 2021r03-q074 (流れ図 X: i が 1→3→7→13、Y: 1→5→13→25、a と b の組合せ): X は k=1,2,3 で差 2,4,6 = 2k → a=i+2k (2i+k は k=2 で 8 になり不一致)。Y は差 4,8,12 = 2k で k=2,4,6 → b=k:2,2,6 → 正答エ ✓。
   4 題とも本文と矛盾せず、本文のどのフック・比喩を当てはめても誤答肢を選ばせない (失敗型 (9) なし)。4 題は型そのものを問う題ではない (JP review の LOW 指摘どおり; topic に型の題が無いための代替) → L7。v1 の challenge (5 題) から 2011h23tokubetsu-q096 (中問組員) 等が外れ、中問組員は 0。
4. **D-198 写し**: validate の copy guard = 0 件、`warn choice-echo` 0 件。独立照合として単元の JP 文字列 81 本 (派生フィールド除く、goals / key_points / overview / fig label・cell / pairs 含む) を topic 内全 32 題の stem_jp_clean (無い題は stem_jp) + 選択肢と 12 字連続照合 (句読点・記号・空白除去) を **カタカナ 4 字以上・英数を □ に遮蔽した版 (遮蔽後の実字 6 未満の窓は除外)** と **遮蔽なし版** の両方で実施 → **exact 0 / 0**。1〜2 字置換の近似一致 (同長窓のハミング距離 ≤2) も 12 字で **0**。照合器の感度確認として窓 8 字で走らせると近似 18 件 (「取り出し」「値を入れ替える/入れられる」「integerArray/integerは」等の断片) が出て、全て無関係な短い語の偶然一致 → 12 字で 0 は照合器の取りこぼしではない。カタカナの多い文 (データ型 hook・文字型 hook「プログラムの中では略して char」・論理型 hook「ジョージ・ブール」) を目視、いずれも題文に無い自作表現。比喩 (書類棚の引き出し・階段・定規の目盛り・照明のスイッチ・活字) は引用題・challenge に無い場面。論理型 table (8 > 5 / 4 = 9 / 6 ≦ 6) と pairs の値の例 (-3、0、42 / 2.5、-0.75 / '5') は自作で、topic の題の数値 (配列 {2,4,1,3}・{3,5,1,2,4}・49 と 11 等) を使っていない。
5. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 2〜3 文 (3/2/2/2/2 文)、比喩・フックが定義の言い換えでないこと (語源 [integer・floating・Boole・char・type] / 別の場面の比喩)、定義前使用 (メモリ・演算 = 一般語、浮動小数点数 = 実数型 detail で太字導入、文字コード・文字列 = 文字型 detail で導入、処理系 = 未定義 → L8)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh 必须 / 考试 + en must / exam / always / very) → jp・zh 0 件、en 2 件 (`terms[0].analogy_en` の always、`terms[2].analogy_en` の very small) は通常の用法で偽陽性。`freq_badge` は「標準」。図の型 (データ型 = tree static、論理型 = table static; validate 0 = 登録内、他 3 語は図なし)、pair 配置 (整数型 / 実数型 4 行 key 1、整数型 / 文字型 3 行 key 1、各組 key 行あり)。
6. **D-200**: 考点数 1/1/1/1/1 (≤3 ✓)、各 JP 文数 1〜2・字数 42〜60 (≤100 ✓、最大は文字型 `points[0]` の 60 字)。**framing 件数** (validateV2 `pointFraming`): jp 0 / zh 0 / en 0 (validate 0 issues、上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の「〜だけ」「〜ではない」の照合: 論理型 one「真と偽の 2 つの値のどちらかだけ」と table・overview・analogy [オンかオフ、中間なし] 一致; 整数型 one「負の数も含めて」と overview・pairs の例 -3 一致、analogy は端数なしだけを述べ負数を否定しない → L6; 実数型 detail「多くの場合」と pairs[0].rows[2]「多くは」・key_points[2]「多くの場合」一致; データ型 detail「この単元で扱う基本型は…4 つ」と tree 根ラベル「(この単元の基本型)」一致 = 閉じた列挙ではない) → 不整合 0。書き方 8 → L3。書き方 9 (限定条件) → 引用題なしのため対象 0。§6 → 比喩は全て別場面 (文字型の比喩は対比を繰り返す → L3)。§9 言い直し → L4。
8. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行の三語一致、`[[jp:…]]` 原語 6 種 (データ型 / 整数型 / 実数型 / 論理型 / 文字型 / 文字コード) が全て jp 本文に実在、one_zh / one_en の見出し語併記 5/5。en に生の日本語 2 箇所 (`terms[3].detail_en` のブール型・論理型 → L2、`terms[0].hook_en` の 型 (kata) → L9)。zh 訳語表 (`zh_terms.unit.json` 19 項): データ型→数据类型 / 整数型 / 实数型 / 逻辑型 / 字符型 / 平均値→均值 / 繰返し→循环 は全て表どおり。
9. **validate warn の判定 (`terms[3](論理型).analogy_zh スイッチ → 交换机（Switch）`)**: jp「照明のスイッチのようなもの。状態はオンかオフのどちらかで、その中間はない。」の スイッチ は **照明の入切スイッチ (on/off switch)** であり、ネットワーク機器 (L2 スイッチ) の意味ではない。zh_terms.unit.json の注記も「Japanese word has that headword's technical sense のときだけ使う」。zh「就像电灯开关」・en "a light switch" が文脈上正しく、「交换机」にすると誤訳になる → **偽陽性、修正不要** (loc review の LOW 判定と一致)。比喩としても 2 値・中間なしで論理型 one と一致し、範囲の矛盾 (D-204) なし。
10. **D-205 / D-210**: 改訂される文書 (規格・法令・ガイドライン・知識体系) の構成要素数・名称は単元に無し → 対象外。
11. **前段の指摘の解消確認**: journal `b51-u04-a1` の jp-review (PASS、LOW 9) と loc-review (PASS、LOW 6) に HIGH / MEDIUM は無し。LOW のうち本監査でも残存を確認したものは §3 に記録 (L2〜L5・L7〜L9)。後退 (失敗型 (5)) なし。

## 2. 用語別の照合表

| 用語 | 考点 (kind) | 引用 qid | 考点の主張と根拠 | 限定条件 | 三語 | 指摘 |
|---|---|---|---|---|---|---|
| データ型 | 1 (mix) | なし | データ型は総称、整数型・文字型はその中の 1 つ。tree 図・detail 2 文目・overview と一致 | — | OK | L4 (§9 言い直し、記録のみ)、L5 |
| 整数型 | 1 (mix) | なし | 値に上限と下限、幅は処理系で異なる、範囲外の結果は正しく表せない。事実として妥当 (固定長整数のモデル) | — | OK | L4、L6、L8 |
| 実数型 | 1 (mix) | なし | 実数型と整数型はどちらも数値、小数部の有無で分かれる。pairs[0].rows[0] (key) と一致。detail の 0.1 の誤差は正しい | 「多くの場合」保持 | OK | — |
| 論理型 | 1 (mix) | なし | 真偽そのものを値にする型、比べる対象の数値・文字の型とは別。table (8 > 5 = 真 / 4 = 9 = 偽 / 6 ≦ 6 = 真) を手で確認、全て正しい。2026r08-q085 (論理型の戻り値 true / false) と整合 | — | OK | L2 |
| 文字型 | 1 (mix) | なし | 文字の '5' は文字コードで表す文字、数値 5 とは別、計算には数値の型へ変換。pairs[1] と一致 | — | OK | L1、L3 |

**単元レベル**: goals 3 点・overview_cols 1 (表す値の例)・overview_rows 5 行・pairs 2 組・key_points 5・summary (記法除去版と一致)・challenge_questions 4 件 (§1-3 で全て手追跡、本文と矛盾なし)。事実誤りなし、三語一致 (parity 23 locations 0 diff)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 2)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[4](文字型).detail_jp/zh/en` 2 文目 (+ 派生 `explanation_*`) | 「文字列 = 文字型を並べたもの」という C 系言語のモデルだけを書く。同じ topic の擬似言語題 (2024r06-q062 の戻り値、2024r06-q085 の引数) では **文字列型** が独立した型として宣言されており、本文だけ読んだ学習者は 文字列型 を知らないまま擬似言語題に出会う。事実誤りではなく (「この単元で扱う基本型は 4 つ」と範囲を限っている)、引用題も無いため LOW | jp: `複数の文字を並べた値は、文字型を並べた **文字列** として扱う。` → `複数の文字を並べた値は **文字列** として扱い、擬似言語などでは **文字列型** という別の型で表す。` / zh: `由多个字符排列而成的值，则作为字符型排列而成的 **字符串** 来处理。` → `由多个字符排列而成的值作为 **字符串** 来处理，在伪代码等中用 **字符串型** 这一单独的类型来表示。` / en: `A value made of several characters in a row is handled as a **string**, a sequence of character-type values.` → `A value made of several characters in a row is handled as a **string**; pseudo-language and similar notations give it a separate type, the **string type**.` |
| L2 | LOW **建議修** | `terms[3](論理型).detail_en` 3 文目 (+ 派生 `explanation_en`) | en 本文に日本語の原語を `[[jp:…]]` 記法なしで書き、日本語そのものを太字にしている (loc review LOW の未修)。意味は正しい | `In Japanese it is also called **ブール型** (Boolean type), while the formal term 論理型 literally means "logical type".` → `In Japanese it is also called **Boolean type** ([[jp:ブール型]]), while the formal term [[jp:論理型]] literally means "logical type".` |
| L3 | LOW | `terms[4].analogy_jp/zh/en` 2 文目、`terms[4].points[0]`、`pairs[1].rows[2]` | 文字の '5' と数値 5 は別物という対比が 3 箇所 (書き方 8 は ≤2)。比喩の 2 文目「数字の形をした活字も…計算する数ではない」が考点と pairs key 行の繰り返し | 記録のみ (任意: 比喩 2 文目を削り 1 文目だけにする) |
| L4 | LOW | `terms[1].points[0].text_jp` 1 文目 = `key_points_jp[1]`、`terms[0].points[0]` | 整数型の考点 1 文目と要点 2 が一字一句同じ。データ型の考点は tree 図・detail・overview の上位下位関係の言い直し (D-203 §9) | 記録のみ (考点が引用題を持たない単元で、要点は振り返り欄) |
| L5 | LOW | `overview_rows[0].extra_jp/zh/en[0]` | 列見出し「表す値の例」に対しデータ型の行だけ「各型の総称」で値の例でない | 記録のみ |
| L6 | LOW | `terms[1].analogy_jp/zh/en` | 階段の比喩は端数の無さだけを示し、one の「負の数も含めて」は運ばない (否定もしない; D-204 の矛盾には当たらない)。`terms[1].points[0].kind` は対比でない事実に mix (JP review LOW) | 記録のみ |
| L7 | LOW | `challenge_questions` | 4 題 (変数追跡・値の交換・余りによる状態遷移・流れ図の繰返し) は型そのものを問わない。topic に型を問う題が無いための代替で、整数の演算 (余り) は本文で扱う | 記録のみ |
| L8 | LOW | `terms[1].points[0].text_jp/zh` / `key_points_jp/zh[1]` | 「処理系」が単元内で未定義 (定義前使用、初学者向け説明不足)。zh「处理系统」は日式直訳 (loc review LOW)。「零头」(整数型・実数型 detail_zh) は口語寄り | 記録のみ (任意: zh「其范围因编程语言的实现而异」) |
| L9 | LOW | `terms[0].hook_en` (+ `memory_hook_en`, `summary.memory_hooks_en[0]`) | 生の 型 (kata) — 複合語 データ型 では「gata」と読む (loc review LOW)。事実 (型 は type の訳) は正しい | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 整数型 = 小数部なし / 実数型 = 小数部あり: `pairs[0].rows[0]`、各 one (定義)、`terms[2].points[0]`、overview 総表 → pairs + mix 考点の 2 箇所 + 定義・総表 (D-195 §3 構造) で許容。② 内部表現 (誤差なし / 浮動小数点で誤差): `pairs[0].rows[2]`、実数型 detail・key_points[2] は片側のみ → 許容。③ 数値 5 / 文字 '5': L3。

**失敗型 (1)〜(10) の個別確認**: (1) D-198 (iii) = 引用題なし・choice-echo 0 → 該当なし / (2) 限定条件落ち = 引用題なし → 該当なし / (3) 別名を別物扱い = ブール型 を「とも呼ばれる」と別名で記述 → なし / (4) 比喩・図の範囲 = L6 (矛盾なし)、スイッチ比喩は 2 値で一致 / (5) 後退 = なし / (6) zh・en の訳語が誤答肢に読める = challenge の選択肢は数値・式のみ → なし / (7) 改正前の版 = 対象外 / (8) 比喩の鍵語が他の見出し語 = 「スイッチ」は単元の見出し語でなく、ネットワークの スイッチ とも読めない文脈 (照明・オンオフ) → なし / (9) フックを challenge に当てると誤答 = §1-3 で 4 題確認、なし / (10) 法令・規格カテゴリの閉じた列挙 = 対象外 (基本型 4 つは「この単元で扱う」と限定)。

確認済みで問題なし: §9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤60 字)、図の文字列の写し (validate 0、独立照合 0)、`[[jp:]]` 原語 (6 種全て jp 本文に実在)、zh 訳語表 (スイッチ warn は偽陽性、§1-9)、図種 (tree static / table static = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、challenge 4 題の手追跡 (全て正答と一致)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 2: L1・L2 / 記録のみ 7: L3〜L9) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 5 件 (全て mix、qid なし)・challenge 4 題 (手追跡で全て正答と一致) で、事実誤り・誤答肢を支持する記述・写しは無い。validate の zh-term warn (スイッチ) は照明スイッチの比喩で偽陽性。LOW 建議修 2 件 (L1 文字列型、L2 en の `[[jp:]]` 記法) は補丁 (B3) で修正推奨、L3〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-37-u04
✓ technology-14-37-u04 unit: 0 issues (data/ip/textbook/units/technology-14-37-u04.json), 1 warning(s)
  warn  zh-term  terms[3](論理型).analogy_zh  スイッチ → 交换机（Switch） not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-14-37-u04
✓ technology-14-37-u04 parity: 23 locations, 0 diff
EXIT=0
```
