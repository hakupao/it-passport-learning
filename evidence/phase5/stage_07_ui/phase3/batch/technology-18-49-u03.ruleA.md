# Rule A 全数抽検 — technology-18-49-u03 (文字・画像を取り込む入力装置)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b64)、repo HEAD `a0238a7c` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b64-u03-a1` merge 結果、sha256 先頭 `2202398b7d51a6c9`)。journal `data/ip/textbook/.planning/v2/technology-18-49-u03/journal.b64-u03-a1.jsonl` (jp r0 → jp-review r1 PASS → loc r0 → loc-review r1 PASS)。
- **対象**: `data/ip/textbook/units/technology-18-49-u03.json` (textbook-unit-v2)、用語 **4 / 4 = 全数** (キーボード / イメージスキャナー / バーコードリーダー / Webカメラ) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、D-208〜D-211、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `v1-original.json` (用語 4 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 4 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (cols・cells・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 6 件 = exam 4 + mix 2、引用 qid 延べ 6 = 異なり 6 題)**: `data/ip/quiz/questions.json` + `translations/<exam>.json` の stem_jp_clean で各題の題文・選択肢・`correct_answer` を再読 (全題 topic `technology-18-49`)。quiz 未引用 2 題 (2013h25a-q078 / 2016h28h-q014; 2026r08-q099 は `points[1]` で引用済) と challenge 4 題 (全て考点で引用済) も照合。加えて題庫全体の バーコード / テンキー / ファンクションキー / dpi を含む 15 題 (topic 外: strategy-05-14 / strategy-02-08 / technology-20-53 / technology-15-42) を grep し、本単元の主張と矛盾しないか確認。
3. **D-198 写し**: validate の copy guard = 0 件、`warn choice-echo` = 0 件。独立照合: 単元の JP 文字列 65 本 (派生除く) × topic 24 題の題文 + 選択肢、句読点・記号除去後 12 字連続 — **(a) カタカナ 4 字以上 + 英数を □ 遮蔽 = 0 件、(b) 遮蔽なし = 0 件、(c) 12 字窓のハミング 1〜2 の近似 = 0 件**。(d) 8 字窓 (遮蔽なし) 37 件を目視: 34 件は見出し語の一部 (ファンクションキー / イメージスキャナー / アプリケーション) で偽陽性、残る 3 件 (1 種)「細かく読み取れる(か)」(`terms[1].detail_jp`・`terms[1].points[1].text_jp` ↔ 2026r08-q099 題文) → L1。(e) ed / Dice (正規化全文): `terms[1].points[1]` ↔ q099 題文 2 文目 (空欄に正答を入れた形) 0.67 / 0.39、`terms[1].one_jp` ↔ q099 題文 1 文目 (正答を入れた形) 0.59 / 0.48、`overview_rows[1].one_line_jp` ↔ 同 0.76 / 0.28、`terms[1].points[0]` ↔ 2025r07-q081 題文 0.77 / 0.23・↔ 2024r06-q059 イ 0.77 / 0.22、`terms[0].points[0]` ↔ 2017h29h-q056 イ 0.96 / 0.35、`terms[0].points[1]` ↔ 2018h30h-q056 ア 0.88 / 0.26、`pairs[1].rows[2].a_jp` ↔ 2016h28h-q014 題文 0.85 / 0.05。いずれも較正 HIGH (ed 0.14 / Dice 0.52) から遠い。カタカナの多い文 (ファンクションキー・アプリケーション・イメージセンサー) も目視、写しなし。
4. **D-208 (iii) 選択肢なぞり**: q099 (穴埋め、比較相手 = スクリーンリーダー / bps) は `terms[1].one_jp` と `points[1]` が題文の 2 文を正答で埋めた形の言い直しに近いが、比較相手 (スクリーンリーダー・bps) は単元に 1 度も出ない → (iii) の要件 (正答 + 比較相手) を満たさず、スキャナーの標準定義・dpi の標準事実 → L1 (表現は題文から離すよう建議修)。q056 ×2 は分類型 (D-211) で一般定義として述べ、選択肢集合・順序の再現なし → L13。q014 は題文の場面の 2 項目の並び → L7。
5. **D-195**: one = 1 文 × 4 (太字あり)、detail 2〜3 文 (2/3/2/2)、図 = キーボード static table・スキャナー flow steps 4 (登録内)、バーコード・Webカメラは図なし。定義前使用: 文字コード (keyboard detail で導入)、OCR・dpi (scanner detail で括弧注)、イメージセンサー (webcam detail で働きを説明)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が / 必须 / must / always) → ヒット 0 (`freq_badge` は「低頻」)。「exam」4 件は `points[].kind` の値。
6. **D-200**: 考点数 2/2/1/1 (≤3 ✓)、各 JP 1 文・45〜63 字 (≤100 ✓)。**framing 件数** (validateV2 `EXAM_FRAMING`、全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (「だけ」「ではない」「固定ではなく」の照合): `terms[0].points[1]`「固定ではなく OS やアプリが決める」と analogy「空の引き出し」・fig cell「使っているソフトが決めた働き」一致; `terms[1].fig.steps[3]`「文字を編集したいときだけ」は OCR の目的を編集に絞る排他表現で、overview_rows[1].extra「文字として扱うには」、2015h27a-q047 (文字コードに変換したいとき) より狭い → L5; Webカメラ analogy「相手の画面へ映し続ける」vs detail / key_points「PC へ渡す」は範囲の拡張で否定と衝突しない → L11。書き方 8 (対比の出現欄) → §3 末尾に列挙、許容。書き方 9 (限定条件) → §2 に記載、落ち 0。§6 → L10 / L14。
8. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 6 種 (キーボード / テンキー / ファンクションキー / イメージスキャナー / バーコードリーダー / Webカメラ) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 4 用語に見出し語の `[[jp:]]` あり。zh 訳語 (`zh_terms.unit.json`): 键盘 / 图像扫描仪 / 条形码阅读器 / 条码 (`terms[2].one_zh`) / 网络摄像头 / 操作系统 (OS) / dpi 一致。validate の zh-term warn 2 件 (PC → PC（个人计算机）) は §3 L9 で判定。en のみの欠落 / 付加 → L2・L6・L15。
9. **型 (6) zh / en の語が誤答肢に寄るか**: q056 ウ (ショートカットの組合せ) ↔ keyboard zh / en (组合 / combination 0 件); q056 エ (F1・F2 表示のキー) ↔ detail の F1〜F12 はファンクションキーの正しい説明でテンキー側に付かない; q056 (2018) ウ (暗号化・復号の変換キー) ↔ barcode hook en "cipher" / zh「暗码」は別用語で直接は寄らないが、題庫 2009h21a-q020 誤答エ (磁気カードはバーコード記録で偽造されにくい) の読みに寄る → L4; q081 ア CCD ↔ webcam「イメージセンサー / 图像传感器 / image sensor」は誤答肢名を使わない; q014 ウ ディジタイザ ↔「図面の電子化」→ L7 で解消; q099 ウ・エ スクリーンリーダー ↔ 単元に 0 件 → 該当 0 (L4 を除く)。
10. **型 (9) フックを引用題の場面に当てる**: テンキー hook (ten = 10 個の数字) → q056 でイを選ぶ ✓; scan hook (端から順になぞる) → q078 ア (紙面を走査) ✓; bar hook → 引用題なし; Web hook → 引用題なし。該当 0。
11. **他単元との整合 (同 session の technology-15-42 + 同 topic)**: 15-42-u02 `terms[2].points[1]` (バーコードは印刷模様を光で読む、1 つずつ見せる) ↔ 本単元 one (光の反射の差) 一致; 15-42-u03 光学センサー (光の強さを電気信号へ) ↔ scanner fig step 2 (反射の強弱を点ごとに測る)・webcam detail (イメージセンサーが電気信号に) 一致; 15-42-u01 (DVI は映像出力の規格) ↔ q081 誤答イ DVI と単元に矛盾なし; 18-49-u04 dpi (1 インチあたりのドット数、大きいほど細かい) ↔ 本単元 dpi 一致; 18-49-u02 `terms[0].points[1]` (スキャナは画像として取り込む、位置指定とは目的が違う) 一致。題庫 2012h24h-q084 / 2013h25h-q054 (スキャナ・プリンタの解像度 = dpi) とも一致。
12. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (4 / 4)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | キーボード | OK — exam 2 / 2 題: テンキー = 数字キーと演算記号のキーを集めた区画、数値を素早く続けて打つ (2017h29h-q056 正答イ; 誤答 ア Enter・ウ キーの組合せ・エ F キー を支持しない) / ファンクションキーの働きは OS や個々のアプリが決める (2018h30h-q056 正答ア; 誤答 イ ソフトウェアキーボード・ウ 暗号の鍵・エ 主キー と無関係)。table (文字キー / テンキー / ファンクションキー × 置かれ方 / 使い道) は detail と一致、「右端」「最上段」はフルキーボードの典型配置 (L12)。hook (テン = ten) 正しい | OK (D-211 一般定義、L13) | OK | L12 / L13 |
| 2 | イメージスキャナー | OK — exam 2 / 4 題: OCR = 画像中の手書き・印刷字を判別し文字コードのテキストへ (2015h27a-q047 正答ウ [誤答 OMR = マーク読取り を支持しない] / 2024r06-q059 正答イ / 2025r07-q081 正答エ; q047 は OCR を「装置」として問う → L8) / 読取りの細かさ = dpi、点が多いほど細かい (2026r08-q099 正答イ; 誤答 bps・スクリーンリーダー 不使用)。quiz 2013h25a-q078 (走査して画像をデジタル化) / 2016h28h-q014 (紙の文書の電子化 = スキャナ) と一致。flow 4 step (光 → 反射を点ごとに測る → 画像データ → OCR) は one・detail と一致、step 3 の「だけ」→ L5。one_en「a paper original」は jp「紙など」の など落ち → L2 | q099 題文の言い直しに近い (L1)、pairs の用途 (L7) | en hook「originally」L6、zh/en 考点の展開付加 L15、analogy_zh「电脑」= validate warn L9 | L1 / L2 / L5 / L6 / L7 / L8 / L9 / L10 / L15 |
| 3 | バーコードリーダー | 引用題なし (freq 0)、mix 1: バーコードは規則で番号に戻して受け取る / スキャナーは点の画像として受け取る — 正しい。detail (番号を手がかりにコンピュータ側の記録から名前・価格を引く、レジ・倉庫) は題庫 2009h21h-q008 (JAN = 商品識別コード)・2015h27a-q013 ウ (POS でバーコードから商品情報) と整合。one「線で数字を表した」は JAN 型の数字に限る言い切りで、英数字を表す方式もある → L3。hook「数字の暗号 / 暗码 / cipher」→ L4 | OK | analogy_zh の主語の混線 (loc-review low) L14 | L3 / L4 / L14 |
| 4 | Webカメラ | 引用題なし (freq 0)、mix 1: Webカメラ = 動いている様子を連続した動画として、スキャナー = 紙面を 1 枚ずつ走査して静止画 — 正しい (Webカメラが静止画を撮れないとは言っていない)。detail (イメージセンサーで電気信号、内蔵 / USB、ビデオ会議・配信) 正しい。hook (Web = インターネット越しに映像を届ける用途から) は名称の由来として妥当 | OK | analogy_zh「电脑」= validate warn L9 | L9 / L11 |

**単元レベル**: goals 3 点・overview_cols 2 (取り込むもの / 受け取るデータ)・overview_rows 4 行・pairs 2 組 (スキャナー / バーコードリーダー 3 行 key 1、スキャナー / Webカメラ 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 4 件 (2015h27a-q047 / 2018h30h-q056 / 2024r06-q059 / 2025r07-q081 — 全て考点で引用済、本文と矛盾なし)。`pairs[0].rows[0]` は両側同文 (共通点の行) で key=false、適切。事実誤りなし、三語一致 (下記 L を除く)。

**過去回の HIGH / MEDIUM の解消 (型 5)**: jp-review r1 = PASS (low 11 件のみ)、loc-review r1 = PASS (low 4 件のみ)。HIGH / MEDIUM は過去回に 0 件で、退行の対象なし。low は後続の輪が無いため未反映のまま (本監査で L1・L2・L4・L7・L8 等として再判定)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 15 (うち 建議修 8)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1].points[1].text_jp` / `text_zh` / `text_en` | 2026r08-q099 (穴埋め) の題文 2 文目に正答 (イメージスキャナー / dpi) を入れた形に近い (なぞり語「どれだけ細かく読み取れるかは … dpi で示し」↔ 題文「どの程度細かく読み取れるかの性能を示す単位として」; 8 字一致「細かく読み取れる」、ed 0.67 / Dice 0.39)。比較相手 (スクリーンリーダー / bps) を単元が一切出さないため D-208 (iii) の穴埋め型には当たらず、dpi = 解像度は標準事実 (jp-review low と同判断)。detail 3 文目の言い直しでもある (§9) | jp「イメージスキャナーがどれだけ細かく読み取れるかは **dpi** で示し、1 インチあたりの点の数が多いほど細部まで写る。」→「**dpi** は 1 インチあたりの点の数を表す単位で、イメージスキャナーでは値が大きいほど原稿の細部まで写る。」/ zh「图像扫描仪（[[jp:イメージスキャナー]]）能读得多细，用 **dpi** 来表示；每英寸的点数越多，细节就呈现得越清楚。」→「**dpi** 是表示每英寸点数的单位；对图像扫描仪（[[jp:イメージスキャナー]]）来说，数值越大，原稿的细节就呈现得越清楚。」/ en "How finely an image scanner ([[jp:イメージスキャナー]]) can read is given in **dpi**, and the more dots per inch, the more detail it captures." → "**dpi** is a unit for the number of dots per inch; for an image scanner ([[jp:イメージスキャナー]]), a larger value means more of the original's fine detail is captured." (修正後 jp: topic 24 題に対し最長一致 10 字「イメージスキャナーで」= 見出し語 + 助詞、近似 1 件も見出し語窓、q099 由来の「細かく読み取れる」0 を実測) |
| L2 | LOW **建議修** | `terms[1].one_en` | jp「紙**など**の原稿」(zh「纸张等原稿」保持) の など が en「a paper original」で落ちる (型 2、loc-review low)。q099 題文にも「紙など」がある。MEDIUM としない根拠: topic 24 題 + quiz 3 題のどの正答も紙以外の原稿を要件とせず、紙に限ると誤答肢が正しくなる題もない; jp 自身も `overview_rows[1].one_line_jp`「紙面に」・`pairs[1].rows[0].a_jp`「台に置いた紙面」と紙で述べる → 範囲を閉じて誤答に導く落ちではない | en "An **image scanner** ([[jp:イメージスキャナー]]) is an input device that shines light on a paper original, reads it, and brings the page into the computer as **image data**." → "An **image scanner** ([[jp:イメージスキャナー]]) is an input device that shines light on an original such as a sheet of paper, reads it, and brings the page into the computer as **image data**." |
| L3 | LOW **建議修** | `terms[2].one_jp` / `one_zh` / `one_en` | 「線で**数字**を表したバーコード … その数字を読み取る」は JAN 型の数字に限る言い切り (英数字・記号を表す方式もある; jp-review low)。引用題なし、題庫のどの題の誤答肢も「数字のみ」で正しくならない (2014h26h-q012 は QR の容量の題) → 定義の制限で LOW。detail・pairs の「番号」(物を見分ける番号) は用途の説明として残してよい | jp「**バーコードリーダー** は、太さと間隔の異なる線で数字を表した **バーコード** に光を当て、反射の差からその数字を読み取る入力装置である。」→「**バーコードリーダー** は、太さと間隔の異なる線で数字などを表した **バーコード** に光を当て、反射の差からその内容を読み取る入力装置である。」/ zh「**条形码阅读器**（[[jp:バーコードリーダー]]）是向用粗细和间隔各不相同的线条表示数字的 **条码** 照光，并根据反射的差异读出这些数字的输入设备。」→「**条形码阅读器**（[[jp:バーコードリーダー]]）是向用粗细和间隔各不相同的线条表示数字等信息的 **条码** 照光，并根据反射的差异读出其内容的输入设备。」/ en "A **barcode reader** ([[jp:バーコードリーダー]]) is an input device that shines light on a **barcode**, which encodes digits as lines of varying width and spacing, and reads the digits from the differences in reflection." → "A **barcode reader** ([[jp:バーコードリーダー]]) is an input device that shines light on a **barcode**, which encodes digits and other characters as lines of varying width and spacing, and reads them from the differences in reflection." |
| L4 | LOW **建議修** | `terms[2].hook_jp` / `hook_zh` / `hook_en` (+ 派生 `memory_hook_*`, `summary.memory_hooks_*[2]`) | 「数字の**暗号**」/「暗码」/ "cipher" は本試験では暗号化 (秘匿) の技術語で、バーコードは秘匿でなく符号化 (jp-review low)。題庫 2009h21a-q020 (topic 外) の誤答エ「磁気カードはバーコードで記録するので偽造されにくい」の読み (バーコード = 暗号 = 安全) に寄る。引用・quiz 題ではないので型 (8) の MEDIUM には当たらない | jp「bar は英語で「棒」。棒の太さと隙間の並びが、そのまま数字の暗号になっている。」→「bar は英語で「棒」。棒の太さと隙間の並びが、そのまま数字を表す符号になっている。」/ zh「英语 bar 就是“棒”，一根根棒的粗细与空隙的排列，直接构成了数字的暗码。」→「英语 bar 就是“棒”，一根根棒的粗细与空隙的排列，直接构成了表示数字的编码。」/ en "Bar as in a stick: the widths of the sticks and the gaps between them are themselves a cipher for the digits." → "Bar as in a stick: the widths of the sticks and the gaps between them are themselves a code for the digits." |
| L5 | LOW **建議修** | `terms[1].fig.steps[3].caption_jp` / `caption_zh` / `caption_en` | 「文字を編集したいとき**だけ**」/「只有…才」/ "Only when" は OCR の用途を編集に絞る排他表現。2015h27a-q047 (文字コードに変換したいとき)・`overview_rows[1].extra_jp[1]` (文字として扱うには) より狭い (書き方 7)。誤答を導く題はない → LOW | jp「文字を編集したいときだけ、OCR が画像の中の字形を判別して文字コードに置き換える。」→「文字をテキストとして扱いたいときは、OCR が画像の中の字形を判別して文字コードに置き換える。」/ zh「只有需要编辑文字时，才由 OCR 识别图像中的字形，并替换成字符编码。」→「需要把文字当作文本处理时，由 OCR 识别图像中的字形，并替换成字符编码。」/ en "Only when you need to edit the text does OCR recognize the letter shapes in the image and replace them with character codes." → "When the characters are to be handled as text, OCR recognizes the letter shapes in the image and replaces them with character codes." |
| L6 | LOW **建議修** | `terms[1].hook_en` (+ 派生 `memory_hook_en`, `summary.memory_hooks_en[1]`) | en だけ "originally" を付加 (jp「という意味」/ zh「有…的意思」には無い)。scan の原義は詩の韻律を調べる (ラテン語 scandere = 登る) で、「端から順に目でなぞる」は派生義 → en だけ語源の誤りを含む | en "To scan originally means to run your eyes over something line by line, just as a strip of light runs down the original." → "To scan means to run your eyes over something line by line, just as a strip of light runs down the original." |
| L7 | LOW **建議修** | `pairs[1].rows[2].a_jp` / `a_zh` / `a_en` | 「書類や図面の電子化」が quiz 2016h28h-q014 題文の場面 (文書や設計図を電子ファイル化) の 2 項目を同順の同義語で再現 (jp-review low; Dice 0.05 で写しではない)。題の誤答ウ (ディジタイザ = 図面入力の装置) と「図面」で近づく | jp「書類や図面の電子化」→「紙の原稿の電子化」/ zh「把文件和图纸电子化」→「把纸质原稿电子化」/ en "Digitizing documents and drawings" → "Digitizing paper originals" |
| L8 | LOW **建議修** | `terms[1].points[0].text_jp` / `text_zh` / `text_en` | OCR を「技術である」と言い切るが、引用題 2015h27a-q047 は OCR を「装置」として問う (Optical Character Reader; jp-review low)。正答とは矛盾しない (他肢は媒体と OMR) が、引用題の呼び方を本文が欠く | jp「**OCR** は画像に写った手書きや印刷の字を判別し、編集できる文字コードのテキストに置き換える技術である。」→「**OCR** は画像に写った手書きや印刷の字を判別し、編集できる文字コードのテキストに置き換える技術で、この働きをする装置も OCR と呼ぶ。」/ zh「**OCR**（光学字符识别）是识别图像中手写或印刷的文字，并把它们转换成可编辑的字符编码文本的技术。」→「**OCR**（光学字符识别）是识别图像中手写或印刷的文字，并把它们转换成可编辑的字符编码文本的技术，具备这一功能的装置也称为 OCR。」/ en "**OCR** (optical character recognition) is the technology that recognizes handwritten or printed characters in an image and converts them into editable text in character codes." → "**OCR** (optical character recognition) is the technology that recognizes handwritten or printed characters in an image and converts them into editable text in character codes; a device that does this (an optical character reader) is also called OCR." (修正後 jp 65 字・1 文、topic 24 題に対し最長一致 5 字・近似 0) |
| L9 | LOW | `terms[1].analogy_zh`「放进电脑里」、`terms[3].analogy_zh`「装在电脑上的一只眼睛」 | validate warn `zh-term PC → PC（个人计算机） not in the zh text` 2 件の判定: 比喩の平文で「パソコン一般」の意味、「电脑」は文脈上正しい訳で偽陽性 (loc-review low と同判断)。前例: 同 topic の `evidence/phase5/stage_07_ui/phase3/batch/technology-18-49-u02.ruleA.md` (表セル「デスクトップ PC」→「台式电脑」) と BYOD detail「ノート PC」→「笔记本电脑」を偽陽性・記録のみと判定済み。単元内の detail / caption / key_points は「PC」で揃う | 記録のみ (揃える場合: 「放进 PC 里」/「装在 PC 上的一只眼睛」) |
| L10 | LOW | `terms[1].detail_jp` 1〜2 文目・`points[0]`・`analogy_*` 2 文目・`fig.steps[2..3]`・`key_points_*[1]` | 「スキャナーの結果は画像、テキストにするには OCR」が 5 欄で繰り返され (§9)、analogy 2 文目は detail 1 文目の言い直し (§6; jp-review low) | 記録のみ (OCR は単元の目標 goals[1] の中核で、図・考点・要点の各役割を外すと構成が崩れる) |
| L11 | LOW | `terms[3].analogy_jp/zh/en` | 「その場で相手の画面へ映し続ける」は Webカメラ単体の働きを相手への送信まで広げて読める; detail / key_points は「PC へ渡す」まで (D-204、jp-review low)。否定と衝突せず、detail のビデオ会議の用途の範囲内 | 記録のみ |
| L12 | LOW | `terms[0].detail_jp` 1 文目・`overview_rows[0].extra_*[1]`、`terms[0].fig.data.rows[1].cells[1]`「右端」 | キーボードが送るのは厳密にはキーの識別コードで、文字への対応付けは OS / IME (jp-review low)。テンキーの「右端」はフルキーボードの典型で、テンキー無し・埋込み型もある。IT パスポートの水準で許容 | 記録のみ |
| L13 | LOW | `terms[0].points[0]`・`points[1]` | 2017h29h-q056 イ / 2018h30h-q056 ア と同じ要素 (数字キー・演算・素早く / OS・アプリ) を語順を変えて一般定義として述べる。分類型の D-211 免除内、選択肢集合・順序の再現なし (ed 0.96 / 0.88) | 記録のみ |
| L14 | LOW | `terms[2].analogy_jp/zh/en`、`terms[2].analogy_zh` | 「番号ラベルを光でひと撫でして読み取る道具」は one の言い換えに近い (§6、jp-review low)。zh は「就像…编号标签」と比喩の主体 (道具) と対象 (ラベル) が混線 (loc-review low) | 記録のみ (任意: zh「就像图书馆书脊上贴的编号标签，不用眼睛去看，而是用光轻轻一扫就读出来的工具。」→「就像一种不用眼睛看、而是用光轻轻一扫就能读出图书馆书脊编号标签的工具。」) |
| L15 | LOW | `terms[1].points[0].text_zh/en` | jp に無い「（光学字符识别）」/ "(optical character recognition)" の展開を付加 (loc-review low)。detail_jp に既出で事実は正しい | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① スキャナー = 画像 / バーコードリーダー = 番号: `pairs[0].rows[2]` (key)、`terms[2].points[0]` (mix)、overview 総表の列 (D-195 §3 の構造) → 2 箇所で許容。② スキャナー = 静止画 / Webカメラ = 動画: `pairs[1].rows[1]` (key)、`terms[3].points[0]` (mix)、総表 → 許容。③ テンキー / ファンクションキー: `terms[0].detail`・analogy・fig table・`key_points[0]`・goals[0] — 1 用語内の 2 区画の説明 (見出し語同士の対比ではない)、`terms[0]` の 2 考点は片側ずつ → 許容。

**範囲外の観察**:
- O1 `data/ip/textbook/units/technology-18-49-u02.json` `terms[0].points[1].text_jp` は「イメージスキャナ」(長音なし)、本単元の見出し語は「イメージスキャナー」(題庫は両表記)。本単元の欠陥ではないが、表記を揃えるなら u02 側で。
- O2 `unit_summary_*` は v1 と同文 (未改稿)、事実は正しい。

確認済みで問題なし: 限定条件 (考点 6 件、§2)、§9 禁止句 grep (0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤63 字)、D-198 独立照合 (遮蔽あり / なし / 近似とも 0)、`[[jp:]]` 原語 6 種実在、one_zh / one_en 見出し語併記 4/4、zh 訳語表 (warn 2 件は L9)、図種 (static table ×1 / flow steps ×1 / 図なし ×2 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、D-205 / D-210 (規格・法令の構成要素の数え上げなし = 対象外)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **15** (建議修 8: L1〜L8 / 記録のみ 7: L9〜L15、うち L9・L14 は任意の修正案あり) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 4 用語・考点 6 件 (qid 付き 4 件)・引用 6 題 + quiz 未引用 2 題 + challenge 4 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。technology-15-42 (u01〜u03) / 18-49-u02・u04 の同じ装置・単位の記述と矛盾なし。LOW 建議修 8 件 (L1〜L8) は補丁 (B3) で修正推奨、L9〜L15 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-18-49-u03
✓ technology-18-49-u03 unit: 0 issues (data/ip/textbook/units/technology-18-49-u03.json), 2 warning(s)
  warn  zh-term  terms[1](イメージスキャナー).analogy_zh  PC → PC（个人计算机） not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[3](Webカメラ).analogy_zh  PC → PC（个人计算机） not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-18-49-u03
✓ technology-18-49-u03 parity: 22 locations, 0 diff
EXIT=0
```
