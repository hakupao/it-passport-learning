# Rule A 全数抽検 — technology-20-52-u03 (静止画のデータ表現方式)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 第 68 批 b68)、repo HEAD `3c2f850e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b68-u03-a1` merge 結果、`merged.json` と完全一致、sha256 先頭 `264a4541d308afb4`; HEAD 側は `stage4-unit-v1-trilingual`)。
- **対象**: `data/ip/textbook/units/technology-20-52-u03.json` (textbook-unit-v2)、用語 **3 / 3 = 全数** (ラスターデータ / ビットマップデータ / ベクターデータ) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。manifest の `rationale_jp` に D-115 下限 (5 語) 逸脱の明記あり (u04 の前提単元として意図的分割)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、D-208 / D-209 / D-210、template 既知失敗型 (1)〜(10)。比較: `data/ip/textbook/.planning/v2/technology-20-52-u03/v1-original.json` (用語 3 語・`term_zh`・`term_en` とも v1 と一致、スクリプト確認)。前回指摘: `journal.b68-u03-a1.jsonl` (jp-review r1 PASS = LOW 6 / loc-review r1 PASS = LOW 3、HIGH・MEDIUM 0)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 3 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (nodes label・steps caption) / quiz / inline_quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`、`summary.key_points_* / summary.memory_hooks_*`、`overview.intro_*`) が本体の記法除去版 (`**` 除去・`[[jp:X]]`→X) であることをスクリプトで確認 (51 箇所、不一致 0)。
2. **考点 × 引用題 (考点 全 4 件 = exam 2 + mix 2、全て qid 付き、引用 qid 延べ 4 件 = 異なり 2 題)**: `data/ip/quiz/questions.json` から題文・選択肢・`correct_answer` を再読 (両題 topic `technology-20-52`、translations に `stem_jp_clean` なし = raw stem に OCR 損傷なし)。
   - 2013h25a-q061 (ラスタグラフィックスの説明として適切なもの、正答イ = 色・明るさを画素ごとに調節できる; 誤答 ア CAD で広く使用 / ウ 解像度に関係なく容量一定 / エ 拡大してもジャギーが出ない)。
   - 2016h28a-q078 (画素数とビット数を変えたときの記憶容量の倍率、正答ア 1/12)。**再計算**: 変換後 / 変換前 = (150×300×8) / (300×600×24) = 360,000 / 4,320,000 = 1/12 → 正答ア と一致。考点の「縦横ともに 2 倍 → 4 倍」(ビット数同じ) は 2×2 = 4 で正しく、題の数値 (300×600 / 24 ビット / 1/12) は本文に一切使われていない。
   - **色・ビット数の再計算**: 1 ビット = 2^1 = 2 色 (白黒) ✓、24 ビット = 2^24 = 16,777,216 ≈ 約 1,677 万色 ✓ (`terms[1].detail`、`key_points[2]`)。
3. **quiz / challenge_questions** (quiz 計 5 枠 + challenge 3 題、本文で未引用 = 2010h22a-q085): q085 はランレングス法の圧縮率計算 (正答イ)。単元はランレングスを教えず、本文に q085 と矛盾する記述は無い (画素で図を表すという前提だけ共有)。見出し語 3 語を直接問う題ではない点は jp-review の LOW 6 と同じ判断で記録のみ (§3 O1)。topic 内の他の画像関連題 2012h24a-q094〜q096 (8×8 白黒画像を 1 画素 1 ビット = 64 ビットで表し、ランレングスで圧縮) も本文と矛盾しない (1 画素 1 ビットで白黒 = `key_points[2]`)。ただし q094〜q096 は「画素数 × ビット数」の値が圧縮で変わる場面そのもので、L1 の根拠。
4. **D-198 写し**: validate の copy guard = 0 件、`warn  choice-echo` 行も 0 件。独立照合として単元の JP 文字列 61 本 (派生フィールド除く) を topic 内全 20 題の題文 (stem_jp_clean 優先) + 選択肢と 12 字連続照合 (句読点・記号・空白・太字記号除去):
   - **カタカナ 4 字以上 + 英数を □ に遮蔽** (遮蔽後の実字 6 未満の窓は除外): **0 件**。
   - **遮蔽なし**: **0 件**。
   - **近似一致** (文単位 SequenceMatcher ratio > 0.5): **0 件**。キャリブレーション例 (ed 0.14 / Dice 0.52 級) に当たるものは無い。
   - **カタカナの多い文の目視**: `terms[0].one`・`detail` (ピクセル / ジャギー)、`terms[1].detail` (BMP / フルカラー)、`terms[2].fig.steps` — 題の文言の流用なし。
   - **(iii) 選択肢なぞり (D-208 (1)、q061 を重点)**:
     - `terms[0].points[0]` (exam) は q061 の正答イの内容 (画素ごとに色・明るさを変えられる) を一般性質として述べる。題は「適切なものはどれか」= 分類型で、D-209 の免除 (正しい内容を見出し語の一般定義として述べる) に当たる。語句は 題「ピクセルごとに調節」→ 本文「画素ごとに…値を持つので、1画素単位で色を変えて編集」と言い換え済みで、誤答肢 ア・ウ・エ を否定する形は取らない → 写しではない。
     - `terms[2].points[0]` (mix) は拡大時の縁を ベクター = なめらか / ラスター = 階段状 と両側とも正の定義で述べる対比 (D-209 免除)。誤答エの言い回し (拡大しても…生じない) をなぞらず、選択肢集合・順序も再現しない → 写しではない (jp-review LOW 3 と同判断)。
     - `terms[0].detail_jp` 1〜2 文目は 解像度↑ → データ量↑ (誤答ウの否定に当たる)、拡大でジャギー (誤答エの否定に当たる) を 題の選択肢順 (ウ → エ) で述べ、用語と言い換えの括弧の組 (ジャギー / ギザギザ) も選択肢エと同じ組を逆順で使う。ただし 考点ではなく detail で、両方ともラスター方式の標準的な基本性質 (v1 から継承) であり、誤答肢の場面を再現して否定する形ではない → **L5 記録のみ**。
5. **D-195**: 結論先行 (one = 1 文 × 3、太字あり)、展開 2〜3 文 (3/2/3 文)、比喩・フックが定義の言い換えでないこと (モザイク画 / 方眼紙の色番号表 / 作図手順書; 熊手の語源 / bit + map の字面 / ベクトルの矢印 — 方眼紙は定義に近い → L6)、定義前使用 (画素 = ラスター one で定義、解像度・ジャギー = ラスター detail で括弧注、ビットの並び = ビットマップ one、BMP は「代表的なファイル形式」の名前のみ、座標・図形の情報 = ベクター one)、**§9 禁止句 grep** (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → `terms[0].detail_jp`「ジャギーが出る」[通常の動詞、偽陽性] と 「字面のまま覚える」1 件 [`terms[1].hook_jp` + 派生 2] のみ。3 フック中 1 件で前例どおり記録なし。manifest の `banned_phrases` 正規表現 jp/zh/en = 0 件。zh・en の grep ヒット [every / never / all = small] は通常の用法)、図の型 (ラスター・ベクター = flow steps 3/3、ビットマップ = 図なし [ラスターの別称で D-195 §2 の「別名」に当たる]; 全て登録内)、pair 配置 (ラスター→ベクターはベクターの後、key 行 1)。
6. **D-200**: 考点数 1/2/1 (≤3 ✓)、各 JP 文数 1〜2・字数 43〜75 (≤100 ✓、最大はベクター `points[0]` の 75 字)。**framing 件数** (manifest `exam_framing_outside_points` 正規表現を全フィールドに適用): jp 0 / zh 0 / en 0。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士): ラスター one「色の値」と fig steps[1]・points[0]「色と明るさの値」は表現の揺れで矛盾ではない (→ L2 で caption の「1つずつ」のみ修正提案)。ビットマップ one「ほぼ同じ意味」= overview_rows[1]・points[1]・key_points[1] 一致。ベクター detail「データ量は図形の数と複雑さ」= pairs[0].rows[2].b 一致。書き方 8 (対比の出現欄) → 下記列挙。書き方 9 (限定条件) → §2 表、引用題の限定条件の落ち 0 (q078 の「1 画素のビット数が同じなら」相当は points[0] に保持)。D-205: 改訂される文書の構成数は無し。D-210: 法令・規格改正に関わる題なし。
8. **既知失敗型の個別確認**: (1) §1-4。(2) 引用題の「など」: q061 の「図形の縁など」→ 本文は「斜めの線や曲線の縁」「輪郭」で範囲を閉じる主張なし。(3) **別称を別物として教えていないか**: ビットマップ = ラスターの別称を one・overview・mix 考点・key_points で一貫して「ほぼ同じ意味」と述べ、図を持たせず、pairs もラスター vs ベクターのみ → 別物扱いなし (overview_rows の extra 列で ビット列 / 色の値 と書き分けるのは記録の観点の違いで、拡大時列は「ラスターデータと同じく」と明示)。(4) 比喩の範囲: モザイク画 (近づくと境目) = detail のジャギーと整合、作図手順書 (どんな大きさでもきれい) = detail と整合。(5) zh・en の退行: 前回 HIGH/MEDIUM なし、三語で事実一致。(6) zh・en の誤答肢寄り訳: なし (en `never blur` は jp「ぼやけたりギザギザになったりしない」と同じ強さ)。(7) 法改正なし。(8) フックの鍵語が他の見出し語の語幹 / 役割名: 熊手・地図・矢印 いずれも該当なし。(9) フックを q061 / q078 / q085 の場面に当てて誤答を選ぶか: 熊手 (行の積み重ね)・bit+map・ベクトル矢印 はいずれも誤答肢 (CAD / 容量一定 / ジャギーなし) に導かない。(10) 法令・規格の閉じた列挙なし。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、図ラベル・caption・比較行の三語一致 (parity 20 locations 0 diff)、`[[jp:…]]` 原語 3 種 (ラスターデータ / ビットマップデータ / ベクターデータ) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` 3/3 × 2 = 6/6、zh 訳語が `zh_terms.unit.json` に従うこと (光栅数据 / 位图数据 / 矢量数据 / 比特 / BMP; validate の B6 warn 0 / jp-origin warn 0)。
10. **technology-20-52 u01 / u02 / u04 / u06 との整合**: u04 BMP (`terms[3]`) = 基本的に圧縮せず画素の色を並べる、容量は縦横画素数 × 1 画素のビット数で「ほぼ」決まる、拡大でギザギザ → 本単元の BMP「代表的なファイル形式」・ジャギーと整合。ただし本単元 `terms[1].points[0]`・`key_points[1]` は「決まる / 求める」と無条件 → **L1**。u04 JPEG「約 1677 万色のフルカラー」と本単元「約1,677万色…24ビット」は表記 (桁区切り) の差のみ。u04 EPS「ベクター形式で描けば拡大しても輪郭が崩れない」= 本単元ベクターと一致。u04 GIF「各画素はパレットの番号で表す」は本単元ビットマップ analogy の「色番号」と同じ像 (L6)。u06 可逆 / 非可逆圧縮・ランレングス法は本単元で扱わず、矛盾する記述なし (L1 の修正で接続が明確になる)。u02 PCM のデータ量式 (標本化周波数 × 量子化ビット数 × …) と本単元の 画素数 × ビット数 は同型で矛盾なし。u01 (マルチメディア / エンコード等) と重なる主張なし。
11. **前回指摘の解消確認**: jp-review / loc-review とも HIGH・MEDIUM 0 で、解消確認の対象なし。LOW 9 件の現状: jp-review LOW 1 (q078 の mix 考点支持弱) → 残存 (L4)、LOW 2 (§9 言い直し) → 残存 (L4)、LOW 3 (ベクター mix の D-209) → 同判断、LOW 4 (非圧縮の前提) → 残存、u04 との不整合を確認して **L1 建議修**、LOW 5 (色 / 色と明るさ、「1つずつ」) → 残存 (**L2 建議修**)、LOW 6 (challenge q085) → O1。loc-review LOW 3 件 (`terms[0].detail_zh` 锯齿 重複、`terms[2].analogy_en` 引用符なし、`terms[2].one_en` fills) → 3 件とも未反映で残存 (**L3 建議修**)。
12. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (3 / 3)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | ラスターデータ | OK — exam 1 / 1 題: 画素ごとに色・明るさの値を持ち 1 画素単位で編集できる (2013h25a-q061 正答イ; 誤答 ア CAD・ウ 容量一定・エ ジャギーなし を支持する記述なし — detail は 解像度↑で容量↑・拡大でジャギー と逆を述べる)。detail「写真のように…向く」は pairs[0].rows[3] と一致。fig steps 3 (格子 → 値 → 拡大で階段状) は one・detail と一致 | OK (D-198 は L5 記録) | zh 锯齿 重複 (L3) | L2, L3, L5 |
| 2 | ビットマップデータ | OK — exam 1 / 1 題: 容量 = 画素数 × 1 画素のビット数、ビット数同じで縦横 2 倍 → 4 倍 (2016h28a-q078 正答ア 1/12、再計算一致; 題の数値不使用) / mix: ラスターとほぼ同じもの (事実として正しい、qid の支持は弱い)。detail: 1 ビット = 白黒、24 ビット ≈ 約 1,677 万色 (再計算一致)、BMP = 代表的形式。限定条件: 「1画素のビット数が同じなら」保持。ただし容量式に「圧縮しない場合」の前提なし (q078 は非圧縮前提なので正答とは矛盾しない、u04 BMP は「ほぼ」と留保) | OK | OK | L1, L4, L6 |
| 3 | ベクターデータ | OK — mix 1 / 1 題: 拡大時の縁 = ベクターはなめらか・ラスターは階段状 (2013h25a-q061 誤答エがラスターに当てはまらない理由の正の対比、D-209)。detail: 表示のたびに描き直す・データ量は図形の数と複雑さ・写真には向かない — IT パスポート水準で正しい (u04 EPS と一致)。fig steps 3 (座標記録 → 表示サイズで再計算 → なめらかに描画) は detail と一致 | OK | en one の fills・analogy の引用符 (L3) | L3 |

**単元レベル**: goals 3 点・overview_cols 2 (画像の持ち方 / 拡大したとき)・overview_rows 3 行・pairs 1 組 (ラスター / ベクター 4 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 3 件 (2013h25a-q061 / 2016h28a-q078 / 2010h22a-q085)。key_points[2]「白黒2色なら1ビット」は再計算一致。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 6 (うち 建議修 3)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1](ビットマップデータ).points[0].text_jp/zh/en`、`key_points_jp/zh/en[1]` (+ 派生 `summary.key_points_*[1]`) | 容量 = 画素数 × 1 画素のビット数 を無条件に「決まる / 求める」と述べる。引用題 q078 は非圧縮前提で正答と矛盾せず、限定条件落ち (観点 9) にも当たらないが、同 topic の u04 BMP は「基本的に圧縮せず」「ほぼ決まる」と留保し、u06 と topic 内の q094〜q096 は画素データを圧縮して値が変わる場面。jp-review LOW 4 の残存 | 下記「L1 置換」 |
| L2 | LOW **建議修** | `terms[0](ラスターデータ).fig.steps[1].caption_jp/zh/en` | 「色と明るさの値を1つずつ」は値が 2 つあるようにも、1 マス 1 値のようにも読める (one は「色の値」)。jp-review LOW 5 の残存 | 下記「L2 置換」 |
| L3 | LOW **建議修** | `terms[0].detail_zh`、`terms[2](ベクターデータ).one_en`、`terms[2].analogy_en` | loc-review LOW 3 件の未反映: zh「锯齿（**锯齿现象**）」の重複、en one の fills が「点を結ぶ」もの扱い、en analogy の指示文に引用符なし | 下記「L3 置換」 |
| L4 | LOW | `terms[1].points[1]` (mix) | 「ほぼ同じもの」は one・overview_rows[1]・key_points[1] の言い直し (D-203 §9)。qid 2016h28a-q078 は計算題で同義性を問わず根拠として弱い (jp-review LOW 1・2) | 記録のみ (qid 削除・考点削除は構造変更) |
| L5 | LOW | `terms[0].detail_jp/zh/en` 1〜2 文目 | q061 誤答 ウ・エ の否定に当たる性質を選択肢順に述べ、用語と言い換えの括弧の組を選択肢エと逆順で使う (§1-4)。detail で、両性質ともラスターの標準的定義で v1 から継承、誤答の場面の再現なし | 記録のみ |
| L6 | LOW | `terms[1].analogy_jp/zh/en` | 「方眼紙のマスごとに色番号を書き込んだ一覧表」はビットマップそのものの描写に近く (D-203 §6)、「色番号」は u04 GIF のパレット方式の像 (24 ビットのフルカラーは色の値を直接持つ)。誤学習には至らない | 記録のみ |

**L1 置換** (string replacement、3 語):
- `terms[1].points[0].text_jp`: 「**ビットマップデータ**の容量は「画素数 × 1画素のビット数」で決まる。」→「圧縮しない**ビットマップデータ**の容量は「画素数 × 1画素のビット数」で決まる。」 (考点 79 字、≤100)
- `terms[1].points[0].text_zh`: 「**位图数据**[[jp:ビットマップデータ]]的容量由“像素数 × 每个像素的比特数”决定。」→「不压缩时，**位图数据**[[jp:ビットマップデータ]]的容量由“像素数 × 每个像素的比特数”决定。」
- `terms[1].points[0].text_en`: "The size of **bitmap data** [[jp:ビットマップデータ]] is set by pixel count × bits per pixel." → "Without compression, the size of **bitmap data** [[jp:ビットマップデータ]] is set by pixel count × bits per pixel."
- `key_points_jp[1]`: 「容量は画素数に1画素のビット数を掛けて求める。」→「圧縮しない場合の容量は画素数に1画素のビット数を掛けて求める。」
- `key_points_zh[1]`: 「容量用像素数乘以每个像素的比特数求得。」→「不压缩时的容量用像素数乘以每个像素的比特数求得。」
- `key_points_en[1]`: "and its size is the pixel count multiplied by the bits per pixel." → "and its uncompressed size is the pixel count multiplied by the bits per pixel."

**L2 置換**:
- `terms[0].fig.steps[1].caption_jp`: 「マス目ごとに色と明るさの値を1つずつ持たせて画像を表す。」→「マス目ごとに色と明るさの値を持たせて画像を表す。」
- `terms[0].fig.steps[1].caption_zh`: 「每个方格各保存一个颜色和亮度的值，用来表示图像。」→「每个方格都保存颜色和亮度的值，用来表示图像。」
- `terms[0].fig.steps[1].caption_en`: "Give every square one value for color and brightness to represent the image." → "Give every square its color and brightness values to represent the image."

**L3 置換**:
- `terms[0].detail_zh`: 「斜线和曲线的边缘会出现阶梯状的锯齿（**锯齿现象**）。」→「斜线和曲线的边缘会出现阶梯状的**锯齿**（jaggies）。」
- `terms[2].one_en`: "such as the lines, curves and fills that connect them." → "such as the lines and curves that connect them and the fills inside them."
- `terms[2].analogy_en`: "such as draw a line from this point to that one, rather than a finished picture." → "such as “draw a line from this point to that one,” rather than a finished picture."

**対比の出現欄 (書き方 8 の列挙)**: ① 拡大時の縁 (階段状 / なめらか): 両側を並べるのは `pairs[0].rows[1]` と `terms[2].points[0]` (mix) の 2 箇所 → 許容。片側のみの記述 = `terms[0].detail` 2 文目・`terms[2].detail` 1 文目・両 fig の node 3 / steps[2]・`key_points[3]` (各用語の自分の性質) と構造欄 `overview_rows[*].extra[1]`・`goals[2]` (D-195 §3 の総表・予告) → 反復に数えない。② 向く画像 (写真 / 図形の組合せ): `pairs[0].rows[3]` のみ両側、`terms[0].detail` 3 文目・`terms[2].detail` 2〜3 文目 は片側 → 許容。③ データ量 (画素数 × ビット数 / 図形の数と複雑さ): `pairs[0].rows[2]` のみ両側 → 許容。④ ビットマップ = ラスター (同義): 対比ではなく同義の言い直し → L4。

**範囲外の観察**:
- O1 `challenge_questions[2]` 2010h22a-q085 はランレングス圧縮率の題で見出し語を直接問わない (jp-review LOW 6)。画素で図を表す前提の接続はあり、本文と矛盾しない。u06 の題として扱う方が適切かは単元構成の判断で本監査の範囲外。
- O2 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)、`overview.est_minutes` 11 → 20 は書き直し量に応じた値で本監査の対象外。

確認済みで問題なし: 考点 × 正答 (4/4)、計算 (q078 1/12、2^1・2^24、2×2)、限定条件落ち 0、§9 禁止句 / banned_phrases 0、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤75 字)、D-198 写し (遮蔽あり 0 / なし 0 / 近似 0、choice-echo 0)、`[[jp:]]` 原語 (3 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (6/6)、zh 訳語表 (B6 warn 0)、図種 (flow steps ×2 / 図なし ×1 = 登録内)、派生フィールド一致 (51/51)、用語・`term_zh`・`term_en` の v1 不変量、merged.json 一致、u01 / u02 / u04 / u06 との事実整合 (L1 の留保の差のみ)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **6** (建議修 3: L1 / L2 / L3 / 記録のみ 3: L4〜L6) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 3 用語・考点 4 件 (全て qid 付き)・引用 2 題 + 未引用 challenge 1 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。計算・色数は再計算で全て一致。LOW 建議修 3 件 (L1〜L3) は補丁 (B3) で修正推奨、L4〜L6 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-20-52-u03
✓ technology-20-52-u03 unit: 0 issues (data/ip/textbook/units/technology-20-52-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-20-52-u03
✓ technology-20-52-u03 parity: 20 locations, 0 diff
EXIT=0
```
