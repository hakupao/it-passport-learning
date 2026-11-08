# Rule A 全数抽検 — technology-20-52-u04 (静止画・文書のファイル形式)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b68)、repo HEAD `3c2f850e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = run `b68-u04-a1` merge 結果、sha256 先頭 `2623cd251c299e5e`)。
- **対象**: `data/ip/textbook/units/technology-20-52-u04.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (JPEG / GIF / PNG / BMP / TIFF / EPS / PDF) + 単元レベル (goals / overview_rows / pairs 3 組 / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-210、`docs/templates/ruleA_unit_audit.md` の既知失敗型 (1)〜(10)。比較: `data/ip/textbook/.planning/v2/technology-20-52-u04/v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致、diff 0)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (nodes label・steps caption・table cols/cells) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。`summary.key_points_* / memory_hooks_*` も目視で本体と一致。
2. **考点 × 引用題**: 考点 9 件 (exam 1 + mix 8)、qid 付き 2 件 (2013h25h-q079 / 2018h30a-q086)。各題の題文 (`stem_jp_clean` があればそれ)・選択肢・`correct_answer` を `data/ip/quiz/questions.json` / translations から再読 (全題 topic `technology-20-52`)。
3. **quiz / challenge_questions**: quiz 枠 = JPEG 2・GIF 2・BMP 1 (いずれも上記 2 題)、challenge 4 題 (2018h30a-q086 / 2013h25h-q079 / 2013h25a-q061 / 2016h28a-q078)。未引用 2 題 (2013h25a-q061 / 2016h28a-q078) も本文と照合。
4. **計算の再計算** (§2 末尾): BMP 表 3 行・色数・2016h28a-q078。
5. **D-198 写し**: validate copy guard = 0 件。独立照合として単元の JP 文字列 95 本 (派生除く、図ラベル・caption・表セル・総表・対比表を含む) を topic 内全 20 題の題文 + 選択肢と 12 字連続照合 — (a) 句読点・記号・空白除去 + カタカナ 4 字以上 / 英数を □ 1 字に遮蔽 (実字 6 未満の窓は除外) → **0 件**、(b) 遮蔽なし → **0 件**、(c) 1〜2 字置換の近似一致 (編集距離 ≤2) → **1 件、偽陽性**: `title_jp`「静止画・文書のファイル形式」↔ 2018h30a-q086 の「静止画圧縮のファイル形式」(ed 2/12)。単元タイトルは v1 / manifest の index から不変で、「静止画の…ファイル形式」は分野名の一般表現。(d) カタカナの多い文 (TIFF one・EPS one/detail・PNG detail) を目視 → 題の語句の再現なし。
6. **D-195**: one = 1 文 × 7 (太字あり)、detail 2〜3 文、図は JPEG = flow steps 4 / BMP = static table (登録内 2 図、他 5 用語は図なし)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が; zh 考试 / 必须 / 常考 / 记住; en exam / must / always / never / every / important) → jp・zh ヒット 0 (`freq_badge`「低頻」のみ)。en の never / every / must は全て通常の用法 (「完全には一致しない」「劣化しない」の訳、"every single square"、"images must be kept" = 品質を保ちたい用途の説明) で偽陽性。定義前使用: 可逆 / 非可逆 = JPEG detail、パレット = GIF detail の括弧、アルファチャネル = PNG detail の同格説明、画素 = BMP one の括弧 (GIF / PNG detail が先に使うが前提単元 u03 で定義済み → 前回 JP-review の low と同じ、記録不要)、タグ = TIFF one、ページ記述言語 = EPS detail 1 文目、ベクター = EPS detail、DTP = 括弧注、フォント = 一般語。
7. **D-200**: 考点数 2/2/1/1/1/1/1 (≤3 ✓)、各 JP 文数 1〜2、字数 51〜77 (≤100 ✓、最大 PNG `points[0]` 77 字)。**framing 件数**: jp 0 / zh 0 / en 0 (上限 2、validate 0 issue)。
8. **三語**: parity 29 locations 0 diff。zh 訳語 (`zh_terms.unit.json`): 可逆圧縮 → 无损压缩、非可逆圧縮 → 有损压缩、タグ → 标签、DTP → DTP（桌面出版）、アイコン → 图标、ビット → 比特、OS → 操作系统 — 全て一致 (validate B6 warn 0)。`[[jp:]]` 原語 6 種 (非可逆圧縮 / 可逆圧縮 / 画素 / タグ / ページ記述言語 / 電子文書) は全て jp 本文に実在。one_zh / one_en の見出し語併記 7/7 (見出し語自体が英字略称のため原語併記は太字の定義語に付く)。
9. **前回レビュー指摘の解消 (journal `journal.b68-u04-a1.jsonl`)**: jp-review r1 (REVISE) の MEDIUM 2 件 —
   - M(r1-1) `pairs[1].rows[2]` PNG のアニメーションを版明記なく「基本の仕様には無い」と言い切り → **解消**: pairs[1] は 色数 / 透過 の 2 行に削られ、PNG のアニメーション有無は単元のどの欄 (jp / zh / en) にも無い (grep で確認)。GIF 側の「簡単なアニメーション」(detail / key_points[1]) は GIF の事実で正しい。回帰なし。
   - M(r1-2) `terms[3].hook_jp` で bit を「点」と訳した → **解消**: hook は「Bitmap を縮めて B・M・P の 3 文字を拾った名前、拡張子も .bmp」となり bit = 点 の像は jp / zh / en とも消えた。BMP 考点・表は「画素数 × 1 画素のビット数」で画素とビットを分けて扱い、u03 `terms[1]` (ビットマップデータ) とも一致。回帰なし。
   - r1 の LOW のうち EPS の tree 図 (PDF を PostScript の子に置く図) は削除済み (figs 3 → 2)、BMP の比較表は BMP 固有の「ビット数 → 色数 → 容量」表に作り替え済み、challenge の 2010h22a-q085 (ランレングス、u06 の内容) は challenge から外れた (source_figures にのみ残る、v1 継承)、「版下」は消えた。r2 (PASS) / loc-review (PASS) の LOW は §3 で必要なものだけ再掲。

## 2. 用語別の照合

| 用語 | 考点 (qid) と照合結果 | 限定条件 | 事実 | 指摘 |
|---|---|---|---|---|
| JPEG | `points[0]` mix (2013h25h-q079 正答エ = MPEG、映像・音声の圧縮方式を選ぶ分類型): JPEG = 静止画 / MPEG = 動画と音声 を両側とも正の定義で対比 (D-209 例外)。選択肢 4 語の組 (BMP・GIF・JPEG・MPEG) や順序はなぞらず、BMP・GIF には触れない → 写しでない。主張は正答と一致。`points[1]` (無引用): 圧縮を強めるほど小さく・画質低下、保存し直すたびに劣化が重なる — 非可逆の一般的性質で正しい。fig 4 step (間引く → 小さく → 元とわずかに違う) は one・detail と一致 | 題の「映像データや音声データ」を MPEG 側に「動画と音声」として保持 | 約 1677 万色 (= 2^24 = 16,777,216) ✓、輪郭のにじみ・ブロックノイズ ✓、圧縮の強さを保存時に調整 ✓ | L6 (en 2 件、loc 既出) |
| GIF | `points[0]` exam (2018h30a-q086 正答ア = GIF、イラスト等に使う最大 256 色の静止画圧縮形式): 1 枚あたり 256 色上限・可逆・色数の少ない図やロゴに向く — 正答と一致。他の選択肢 (JPEG / MIDI / MPEG) には触れず、題の語句も再現しない。`points[1]` (無引用): 写真を GIF にすると 256 色への減色で段差が出る、圧縮方式ではなく色数上限による — 正しい (GIF の LZW は可逆)。analogy (256 本の色鉛筆) は points[1] と整合 | 題の「最大 256 色」「静止画」を保持、「イラストなど」は「色数の少ない図やロゴ」で範囲を閉じない | パレット方式 ✓、1 色透過 ✓、アニメーション ✓、CompuServe のパソコン通信由来 ✓ | L1 (analogy「決まった」) |
| PNG | `points[0]` mix (無引用): PNG = 画素ごとの透け具合 / GIF = 指定 1 色を消すだけ → 縁のなじみは PNG が得意 — 正しい (アルファチャネル vs 透過色インデックス)。pairs[1].rows[1] と同内容 (対比 2 箇所まで、許容) | — | GIF の代替として Web 用に作られた ✓、パレット / フルカラー両対応 ✓ | L2 (en far)、L5 (analogy スキャン) |
| BMP | `points[0]` mix (無引用、challenge 2016h28a-q078 と対応): 容量 ≈ 縦横の画素数 × 1 画素のビット数 ✓ (「ほぼ」でヘッダ・パレット分を吸収)。table 3 行を再計算 (下記) し全て一致。2016h28a-q078 の数値 (300×600 / 24 ビット → 150×300 / 8 ビット) は使っていない → 写しでない | — | 基本は無圧縮 (RLE 版があるので「基本的に」は必要な限定で保持) ✓、Windows 標準 ✓、拡大でギザギザ ✓ (u03 ラスターデータ と一致、2013h25a-q061 正答イ と矛盾なし) | L3 (「大きくなる」の断定) |
| TIFF | `points[0]` mix (無引用): 特定の圧縮方式名ではなく入れ物の形式、圧縮の有無・方式はファイルごと — 正しい。detail「無圧縮でも可逆圧縮でも」は「〜でも保存できる」で、JPEG 圧縮の TIFF を排除する閉じた列挙ではない | — | タグ ✓、複数ページ ✓、スキャナ・印刷原稿 ✓ | なし |
| EPS | `points[0]` mix (無引用): 描画命令で図を持てるので拡大縮小で画質が落ち**にくい**、画素の画像も入れられる — 限定が適切 (ベクターなら崩れない / 中身がラスターなら崩れうる、の両方と整合)。detail のベクター文も「ベクター形式で描けば」と条件付き | — | PostScript = アドビのページ記述言語 ✓、DTP の図版貼り込み ✓ | なし |
| PDF | `points[0]` mix (無引用): EPS = 他の文書へ貼り込む図版 / PDF = 文書を完成形のまま配って読む — 正しいが「複数ページの文書」と限定 | — | アドビが PostScript をもとに開発・ISO 規格 (ISO 32000) ✓、フォント埋め込み ✓ | L4 (「複数ページの」) |

**計算の再計算**: 640×480 = 307,200 画素。1 ビット → 307,200 / 8 = **38,400 バイト** ✓ (2 色 = 2^1 ✓)、8 ビット → **307,200 バイト** ✓ (2^8 = 256 色 ✓)、24 ビット → 307,200 × 3 = **921,600 バイト** ✓ (2^24 = 16,777,216 ≈ 約 1677 万色 ✓)。各行の 1 行バイト数 (80 / 640 / 1,920) は 4 の倍数で BMP の行パディングも生じず、「画素データの大きさ」の列名どおり厳密に一致。challenge 2016h28a-q078: (150×300×8) / (300×600×24) = (1/4)×(1/3) = 1/12 → 正答ア ✓ (BMP 考点「画素数 × ビット数」で解ける)。

**challenge の未引用 2 題**: 2013h25a-q061 (ラスタグラフィックス、正答イ = 色・明るさを画素ごとに調節できる) — BMP one (画素の色を並べて記録) と detail (拡大でギザギザ) で正答と整合、誤答 (CAD 向け / 容量一定 / ジャギーなし) を支持する記述なし (容量は BMP 考点で画素数依存と明言)。2016h28a-q078 は上記。

**単元レベル**: goals 3・overview_cols 2 (圧縮 / 主な用途)・overview_rows 7 行 (one_line は各 one と一致、extra の圧縮列: JPEG 非可逆 / GIF・PNG 可逆 / BMP 基本は無圧縮 / TIFF 選べる / EPS 中の画像による / PDF 中の画像や文字ごとに圧縮 — いずれも正しい)・pairs 3 組 (JPEG/PNG 4 行 key 1、GIF/PNG 2 行 key 1、EPS/PDF 3 行 key 1)・key_points 5 (「EPS と PDF はどちらも PostScript の流れをくむ」は「もとに開発」と一致、PDF が PostScript で書かれているとは言わない)・challenge 4 件。

**同 topic 他単元 / technology-18-49-u04 との整合**: u03 `terms[1]` (1 ビット = 2 色、24 ビット = 約 1,677 万色、容量 = 画素数 × 1 画素のビット数) と BMP 表・考点が一致 (u03 は「決まる」、u04 は「ほぼ決まる」で矛盾なし)。u03 ラスター / ベクター (拡大でジャギー / 崩れない) と BMP detail・EPS detail が一致。u06 (PNG・GIF は可逆、JPEG は非可逆、可逆は縮められる量に限りがある) と JPEG / GIF / PNG / pairs[0] が一致。u05 / u06 の MPEG (映像・音声の圧縮方式の規格 [群]) と JPEG `points[0]` が一致。u02 (MP3 = 非可逆の音声形式) と矛盾なし。technology-18-49-u04 (画素 = 色を表す小さな点、解像度 = 横×縦の画素数、VGA = 640×480) と BMP one・表の 640×480 が一致。表記差 (u03「1,677万色」/ u04「1677 万色」) は意味同一で記録のみにも数えない。本単元は RGB / CMYK・解像度の語を扱わない (技術的に扱う必要のある箇所もない)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 7 (うち 建議修 4)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1](GIF).analogy_jp` / `analogy_zh` / `analogy_en` | 「決まった 256 本の色鉛筆」は、GIF が全ての画像で同じ固定の 256 色を使うように読める。実際は detail のとおり画像ごとに 256 色以内のパレットを選ぶ (D-204 比喩の範囲がわずかに detail とずれる、誤学習・誤答には至らない) | jp「決まった 256 本の色鉛筆だけで」→「選んだ 256 本までの色鉛筆だけで」/ zh「只用固定的 256 支彩色铅笔」→「只用挑好的最多 256 支彩色铅笔」/ en「with a fixed set of 256 colored pencils」→「with a chosen set of up to 256 colored pencils」 |
| L2 | LOW **建議修** | `terms[2](PNG).points[0].text_en` | jp「PNG のほうが得意である」に対し en が "far better" と程度を足す (loc-review の low、未適用) | 「so PNG handles edges that blend smoothly into the background far better.」→「so PNG handles edges that blend smoothly into the background better.」 |
| L3 | LOW **建議修** | `terms[3](BMP).points[0].text_jp` / `text_zh` / `text_en` | 2 文目「同じ画像なら圧縮形式より大きくなる」は例外なしの断定で、同用語 detail の「大きくなりやすい」と強さが食い違う (可逆圧縮は画像によってはほとんど縮まない) | jp「同じ画像なら圧縮形式より大きくなる。」→「同じ画像なら圧縮形式より大きくなりやすい。」/ zh「同一张图像，它比压缩格式更大。」→「同一张图像，它往往比压缩格式更大。」/ en「For the same image it is larger than a compressed format.」→「For the same image it is usually larger than a compressed format.」 |
| L4 | LOW **建議修** | `terms[6](PDF).points[0].text_jp` / `text_zh` / `text_en` | 「複数ページの文書を…配って読むための形式」は 1 ページの PDF を外すように読める限定 (r2 の low、未適用)。pairs[2].rows[1] は「複数ページをまとめられる」(できる) で、考点の方が狭い。引用題なし・正答と矛盾しないので LOW | jp「**PDF** は複数ページの文書を完成形のまま配って読むための形式である。」→「**PDF** は文書を完成形のまま配って読むための形式で、複数ページもまとめられる。」/ zh「**PDF** 则是把多页文档以完成形态分发和阅读的格式。」→「**PDF** 则是把文档以完成形态分发和阅读的格式，也能汇总多页。」/ en「while **PDF** is for distributing and reading multi-page documents in their finished form.」→「while **PDF** is for distributing and reading documents in their finished form, and it can hold many pages.」 |
| L5 | LOW | `terms[2](PNG).analogy_jp/zh/en` | 「高画質のスキャン原本」は同単元 TIFF の用途 (スキャナの取り込み) と重なる語。PNG vs TIFF を選ばせる引用題・challenge は無く、(8) の MEDIUM 条件 (誤答肢へ寄る) に当たらない | 記録のみ (任意: 「高画質のスキャン原本を」→「大切な絵画を」/ zh「高清扫描的原件」→「珍贵的画作」/ en「a high-quality scanned original」→「a valuable painting」) |
| L6 | LOW | `terms[0](JPEG).analogy_en`、`terms[0].detail_en`、`terms[1].hook_zh`、`terms[3].detail_zh`、`pairs[2].rows[2].a_en` | loc-review の low (along the way の意味ずれ / colors の重複 / 电脑通信 の直訳 / 标准使用的 の直訳調 / Designers への縮小) が未適用。事実・考点の判断に影響しない | 記録のみ (loc-review の fix 案どおりで可) |
| L7 | LOW | `terms[1].points[0].text_zh/en`、`terms[5].detail_zh/en` | 太字の数が jp と異なる (zh/en が 无损压缩 / lossless / DTP を太字化、loc-review 既出)。parity は 0 diff | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 非可逆 / 可逆: JPEG detail (定義そのもの)・pairs[0].rows[0]・overview 総表の圧縮列 (D-195 §3 の構造) → 許容。② GIF 256 色 / PNG フルカラー: pairs[0].rows[1]・pairs[1].rows[0]・PNG detail → 3 箇所だが pairs[0] は JPEG/PNG の組の PNG 側の性質記述、PNG detail は PNG の定義の中核 → 許容。③ 透過 1 色 / 画素ごと: pairs[1].rows[1]・PNG points[0] → 2 箇所で許容。④ EPS 貼り込み / PDF 配布: pairs[2].rows[0]・PDF points[0]・goals[2] (予告) → 許容。

**範囲外の観察**:
- O1 `unit_summary_*` は v1 / manifest index と同文 (未改稿)。
- O2 `source_figures` に 2010h22a-q085 / 2012h24a-mqC (ランレングス系) が v1 から残るが本文・challenge では使われない。
- O3 独立 copy 照合の近似 1 件はタイトルの分野名で偽陽性 (§1-5)。

確認済みで問題なし: 前回 MEDIUM 2 件の解消と三語での回帰なし (§1-9)、限定条件 (引用 2 題とも保持)、D-198 (iii) 選択肢なぞり (JPEG / GIF 考点とも D-209 例外の範囲で選択肢の組・順序・語句を再現しない; validate の choice-echo warn なし)、§9 禁止句 grep、framing 0/0/0、D-197 羅列 (validate 0)、D-200、D-205 (改訂文書の構成数・名称の列挙なし; PDF の「ISO の国際規格」は番号・版を言わない一般記述)、D-210 (法令・規格改正前の題なし)、図種 (flow steps ×1 / static table ×1 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、(3) 別名の分離なし、(9) フックを引用題に当てて誤答肢を選ぶものなし、(10) 閉じた列挙なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **7** (建議修 4: L1〜L4 / 記録のみ 3: L5〜L7) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 7 用語・考点 9 件 (qid 付き 2 件)・引用 2 題 + 未引用 challenge 2 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。BMP 表の数値・色数・2016h28a-q078 を再計算し全て一致。前回 jp-review の MEDIUM 2 件は解消、回帰なし。LOW 建議修 4 件 (L1〜L4) は補丁 (B3) で修正推奨。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-20-52-u04
✓ technology-20-52-u04 unit: 0 issues (data/ip/textbook/units/technology-20-52-u04.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-20-52-u04
✓ technology-20-52-u04 parity: 29 locations, 0 diff
EXIT=0
```
