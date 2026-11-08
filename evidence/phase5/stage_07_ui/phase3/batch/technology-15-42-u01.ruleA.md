# Rule A 全数抽検 — technology-15-42-u01 (信号方式と映像インタフェース)

- **Auditor**: `oh-my-claudecode:verifier` (opus)。Rule D に従い、本文の書き手 (workflow writer / critic / localiser) とは別の agent・別の context で監査した。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b62)。repo HEAD `05c1955e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b62-u01-a2` の merge 結果、sha256 先頭 `361120bacb59fdcc`)。
- **対象**: `data/ip/textbook/units/technology-15-42-u01.json` (textbook-unit-v2)。用語は **6 / 6 = 全数** (アナログ / デジタル / アナログRGB / DVI / HDMI / DisplayPort)。単元レベル (goals / overview_rows / pairs 3 / key_points 5 / summary / challenge_questions 3) も対象にした。比較元は `v1-original.json` (用語・`term_zh`・`term_en` とも v1 と一致)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210 / D-211、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。
- **重大度**: HIGH = 過去問を誤答させる、誤った事実を学ばせる、または引用題の限定条件が落ちている / MEDIUM = 誤解を招く、規則に違反する、または欄同士が食い違う / LOW = 文体、または D-203 の low 類。過去問の題文・選択肢は引用せず、qid と言い換えで示す。
- **既往の指摘** (journal `b62-u01-a1` / `b62-u01-a2` の type:"result"): a1 jp-review r1 MEDIUM と a1 jp-review r2 MEDIUM の 2 件。a2 の jp-review r1 / loc-review r1 はともに PASS で、指摘は LOW のみ。→ §2-0 で解消と退行の有無を確認した。

## 1. 方法

1. **全文の読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption) / quiz` と単元レベルの全フィールドを、三語とも読んだ。派生フィールド (`definition_* / memory_hook_*`) が本体から記法を除いた版であることをスクリプトで確認した (不一致 0)。`summary.key_points_* / memory_hooks_*` も本体と一致した。DVI は hook を持たない (`hook_*` キーなし、`memory_hook_*` = 空文字 ×3、`summary.memory_hooks_*` は 5 件で DVI の行なし、三語で同じ)。DisplayPort は analogy が空 (三語)。
2. **考点 × 引用題**: 考点は全 6 件で、**全て `mix`、qid 付きの exam 考点は 0 件**。exam 考点がないため、限定条件の照合対象はない。topic `technology-15-42` の 25 題のうち、本単元の見出し語 (HDMI / DVI / DisplayPort / RGB / アナログ / デジタル / 映像 / VGA) に触れる題は 2 題だけである (2014h26h-q073 / 2018h30h-q071)。どちらも HDMI の quiz として置かれている。mix 考点の事実はすべて §2 で検算した。
3. **quiz / challenge_questions** (HDMI quiz 2 題 + challenge 3 題、異なり 3 題):
   - 2014h26h-q073 (HDMI の説明。正答ア = 映像・音声・制御信号を 1 本で入出力する AV 機器向け IF / 誤答 = 赤外線・外付け HDD 向けシリアル・電波の無線)。本文の one (映像と音声を 1 本でデジタル伝送)・detail (家庭用 AV 機器、機器どうしを連動させる信号もやり取り)・overview_rows[4] で解ける。誤答肢を支持する記述はない。
   - 2018h30h-q071 (正答エ = 複数種類の端子を持つ機能拡張機器 = ポートリプリケータ)。HDMI は題文に端子名として出るだけで、本単元は正答の語を扱わない。矛盾はない → L7。
   - 2011h23a-q088 (無線で接続する規格。正答ア Bluetooth)。本単元の用語外。矛盾はない → L7。
4. **D-198 写し**:
   - validate の copy guard / choice-echo の warn は 0 件。
   - 独立の照合として、単元の JP 文字列 98 本 (派生フィールドを除く) を、topic 内全 25 題の題文 (`stem_jp_clean` を優先) + 選択肢と 12 字連続で突き合わせた。句読点・記号・空白・記法は除去した。
     - カタカナ 4 字以上と英数を □ に遮蔽した照合 (遮蔽後の実字が 6 字未満の窓は除外): **0 件**。
     - **遮蔽なし**の照合: **0 件**。
     - 1〜2 字置換の近似一致: 12 件。全て one_jp 末尾の「…インタフェースである」が題の「…できるインタフェースである / …向けのインタフェースである」と近いだけで、文末の定型の偽陽性。
   - 目視: HDMI 関連のカタカナの多い文 (`one_jp` / `detail_jp` / `overview_rows[4].one_line_jp` / `pairs[1..2]` / `key_points_jp[3]`) を q073 正答アと並べて読んだ → L4 (記録のみ)。a1 の考点にあった要素の組 (制御信号 + 1 本 + AV 機器向け) が detail に移っていないかも確認した。detail は「AV 機器で広く使われる → 音声配線が不要 → 連動させる信号」の順で、q073 アの「映像・音声・制御信号・1 本・AV 機器向け」の並びとも、その組とも一致しない。
5. **D-195**:
   - 結論先行: one = 1 文 ×6、太字あり。展開: detail = 2〜3 文。
   - 比喩とフックの点検 (§2 表)。
   - 定義前使用: DVI がアナログRGB の考点 (第 3 用語) で先に出る → L10。
   - §9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が): jp は **0 件** (`freq_badge` は「低頻」)。zh は「必须」(DVI analogy の通常用法) と「记住」(DisplayPort hook と派生 2 欄。記憶フックの言い方) だけで、定型の締め句ではない。en は 0 件。
   - 図の型: デジタル = flow steps (4 ノード / 3 step)、DisplayPort = tree static。全て登録内。
   - pair の配置: アナログ→デジタル、DVI→HDMI、HDMI→DisplayPort。各組に key 行が 1 つずつある。
6. **D-200**: 考点数は 1/1/1/1/1/1 (≤3 ✓)。各 JP 考点は 1〜2 文・48〜79 字 (≤100 ✓、最大は DisplayPort `points[0]` の 79 字)。**framing 件数** (validateV2 `pointFraming`、全考点を `tsx` で計数): jp 0 / zh 0 / en 0。
7. **D-202 / D-203 / D-204 / D-208 の単元全体点検**:
   - 書き方 7: 欄同士の「だけ」「ではない」「専用」を照合した。
     - DVI「映像専用」(pairs[1].rows[0] / key_points[2]) は「音声を含まない」の意味で、detail / analogy / 図ラベルと一致する。
     - DisplayPort「映像専用ではなく」は音声の有無についての記述で、DVI の「映像専用」と矛盾しない。
     - HDMI detail「PC にも搭載」と DisplayPort 考点・pairs[2]「主な用途で区別」は、「主な」を保っているので衝突しない。
     - key_points[1] と detail の強さの差 → L1。
   - 書き方 8 (同じ対比の出現欄) → L5。
   - 失敗型 (1)〜(10) の点検:
     - (1) 引用題の選択肢をたどる型: exam 考点 0。HDMI 考点は DVI / HDMI の両側を肯定定義で並べた対比で、D-209 の免除に当たる → 該当なし。
     - (2) 限定条件の落ち: 引用題なし。
     - (3) 別名を別物として教える型: VGA 端子 = D-sub 15 ピンの別名として扱っており (「とも呼ばれる」)、別物にはしていない。
     - (4) 比喩・図の範囲が one / detail と食い違う型: 該当なし (§2)。
     - (5) zh / en の退行: §2-0。
     - (6) zh / en の語の選び方が誤答肢に寄る型: 該当なし (L3 は語の範囲の問題で、誤答肢との一致ではない)。
     - (7) 法改正前の題: 該当なし。
     - (8) 比喩・フックの鍵語が他の見出し語と衝突する型: DVI analogy の「トラック / 荷台」は他の用語の語幹ではない。
     - (9) フックを題の場面に当てると誤答肢を選ぶ型: HDMI hook (M = Multimedia → 音声あり) は肯定方向の手掛かりで、名前に M のない DisplayPort から「音声なし」を推させる文言はない。DisplayPort 考点が名前からの推測を明示的に否定している。q073 / q071 / q088 の場面に当てても誤答を選ばせない。
     - (10) 規格類の構成員を閉じた列挙で落とす型: DVI の端子種別 → L2。
8. **D-205 / 単元固有 (規格の技術事実)**: 引用題の正答で支えられる事実は、HDMI = 映像 + 音声 + 制御信号を 1 本、AV 機器向け (q073 ア) だけである。それ以外の事実は次のとおり。
   - DVI = Digital Visual Interface、DVI-D (デジタルのみ) / DVI-I (アナログも)、音声は規格外: DDWG DVI 1.0 (1999) の単一版で、改訂版はない。
   - アナログRGB = D-sub 15 ピン (台形)、VGA 端子とも呼ぶ、長いケーブル・高解像度でにじむ: 一般の技術事実。
   - HDMI = High-Definition Multimedia Interface、制定団体 = 家電メーカーなど: HDMI Founders 7 社 (Hitachi / Panasonic [Matsushita] / Philips / Silicon Image / Sony / Thomson / Toshiba)。半導体の Silicon Image が入るので「家電メーカー**など**」は正確 (出典: hdmi.org press / HDMI v1.0 20th Anniversary blog)。
   - DisplayPort = VESA 規格、音声を送れる、高解像度・複数モニタに向く、HDMI 変換アダプタ製品あり: VESA の DisplayPort v1.2 発表は「display, audio and other data」を運ぶデジタル IF とし、multi-streaming (複数モニタ) を v1.2 で追加している (displayport.org press "VESA Introduces DisplayPort v1.2")。
   - 「複数のモニタの接続に向く」は v1.2 以降の性質だが、現行の全版に当てはまる能力の記述である。D-205 の対象 (改訂される文書の構成要素の数・名称) ではないので、版の明記は不要と判断した (O2)。
   - 数・名称で版に依存する記述 (例「n 種類ある」「HDMI 2.1 では」) は単元にない。
9. **三語の点検**:
   - zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致 (parity 27 か所 0 diff)。
   - `[[jp:…]]` の原語 4 種 (アナログ / デジタル / デジタル化 / アナログRGB) が jp 本文に実在する (スクリプトで確認、全 ok)。
   - one_zh / one_en: 和語見出し 3 語 (アナログ / デジタル / アナログRGB) に `[[jp:]]` がある。DVI / HDMI / DisplayPort は三語同形の英字略称で、zh_terms も同形 (validate の jp-origin warn 0)。
   - zh 訳語は `zh_terms.json` に従っている (模拟 / 数字 / 模拟RGB / 线缆。validate の B6 warn 0)。
10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (6 / 6)

### 2-0. 既往 MEDIUM の解消確認 (三語)

| 既往 | 内容 | 現状 | 判定 |
|---|---|---|---|
| a1 r1 M (`terms[3].hook_jp`) | DVI の hook が「V = Visual で、名前に音の語がない」と、名前から音声なしを推させていた。DisplayPort 考点 (名前に Display とあっても映像専用ではない) と逆向きだった | DVI の `hook_jp/zh/en` は削除済み (キー自体がない)。`memory_hook_jp/zh/en` = ""、`summary.memory_hooks_jp/zh/en` は 5 件で DVI の行がない。DVI の残る記憶手掛かりは analogy「映像専用の荷台しかないトラック」だけで、名前に頼らない。他の hook (HDMI の M = Multimedia、DisplayPort の名前どおり差し込み口) も「名前に X がないから Y がない」という推論を運ばない | **解消・退行なし** (jp/zh/en) |
| a1 r2 M (`terms[4].points[0].text_jp`) | HDMI 考点が q073 正答アの列挙 (映像・音声・制御信号 → 1 本 → AV 機器向け) を、一揃い・同じ順で言い直していた | 現行の考点は `mix`・qid なしで、jp「DVI も HDMI もデジタルの映像を送れるが、音声まで同じケーブルで運べるのは HDMI のほうである。」。DVI / HDMI の両側を肯定で述べる易混対比 (D-209 の免除) で、制御信号・AV 機器向けは含まない。q073 は quiz にのみ置かれている (D-211 の方針どおり)。zh「…能用同一根线缆连音频一起传送的是 HDMI」/ en "…but only HDMI also carries audio over the same cable" も同じ内容で、列挙はない (en の only の範囲 → L3)。要素の組が他の欄へ移っていないかの確認は §1-4 で行った | **解消・退行なし** (jp/zh/en) |

### 2-1. 用語別

| # | 用語 | 事実 (考点・本文、技術事実の検算) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | アナログ | OK。連続量を信号の強さに置き換える。雑音が信号の一部として届き区別しにくい。距離とともに劣化する — 正しい。mix 考点 (連続 / 段階の離散値で分かれる) は pairs[0].rows[0] と一致。analogy (針の時計) は連続の別場面の例。hook (ギリシャ語 analogos = 比例した) は語源として正しい | OK | OK | L5 |
| 2 | デジタル | OK。0/1 の離散値、受け手の再判定で雑音に強い — 正しい。mix 考点 (一定間隔で読み段階に丸めるため細かい変化は失われ、完全には再現できない) は標本化・量子化の性質として正しい。flow (波形 → 一定間隔で読む → 段階に丸める → 0/1 列) は考点と一致。analogy (数字表示の時計は 1 分ごと) / hook (digit = 指・数字) も正しい | OK (図 L9) | zh「档位」L8 | L5, L8, L9 |
| 3 | アナログRGB | OK。R・G・B の 3 信号をアナログで送る。代表端子は台形の D-sub 15 ピン = VGA 端子。長距離・高解像度でにじむ — 正しい。音声なし (overview / 図) も正しい。mix 考点 (アナログRGB = アナログ / DVI = デジタルを基本) は「基本として」で DVI-I を排除しない | OK | OK | L1, L10 |
| 4 | DVI | OK。Digital Visual Interface、LCD の普及とともに広まった。DVI-D = デジタルのみ / DVI-I = アナログも、音声は規格外 — 正しい。one「デジタルで送る」は「だけ」と限っていないので、detail・overview「アナログ併用の種類あり」と矛盾しない。hook なし (§2-0) | OK | OK | L2, L5 |
| 5 | HDMI | OK。映像 + 音声を 1 本でデジタル伝送 (q073 ア)、High-Definition Multimedia Interface、TV・レコーダー・ゲーム機・PC、音声配線が不要、機器どうしを連動させる信号 (= q073 の制御信号) — 正しい。pairs[2].rows[2]「家電メーカーなどが作った団体」= HDMI Founders で正確。考点は §2-0 | OK (overview_rows[4] は L4) | en L3 | L3, L4 |
| 6 | DisplayPort | OK。VESA 規格、映像 + 音声をデジタルで送る、高解像度・複数モニタ (MST, v1.2〜) に向く、端子形状は HDMI と異なり変換アダプタ製品がある — 正しい。mix 考点 (名前に Display とあるが映像専用ではない / HDMI とは主な用途で区別) は pairs[2] と一致し、HDMI detail「PC にも搭載」とは「主な」で両立する。tree 図の分類 (アナログ = RGB、デジタル = DVI [アナログ併用あり] / HDMI / DP) は overview と一致。analogy は空 | OK (図 L9) | en 図ラベル L8 | L6, L9 |

**単元レベル**:
- goals 3 点、overview_cols 2 (信号方式 / 音声)、overview_rows 6 行。音声列は アナログRGB「送らない」/ DVI「送らない」/ HDMI・DP「送る」で正しい。
- pairs 3 組。アナログ / デジタル 2 行、DVI / HDMI 3 行、HDMI / DP 3 行。各組に key 1 行。
- key_points 5 (key_points[1] → L1)。
- summary は記法除去版と一致。
- challenge 3 題 (§1-3)。
- 事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 10 (うち 建議修 3: L1〜L3)** + 範囲外の観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `key_points_jp[1]` / `key_points_zh[1]` / `key_points_en[1]` (+ 派生 `summary.key_points_*[1]`) | 「D-sub 15 ピンの VGA 端子を使い」と言い切っている。一方 `terms[2].detail_jp` は「代表的な端子は」と限定しており、強さがそろわない (a2 jp-review の low が未修)。アナログRGB は DVI-I / DVI-A や BNC でも送られる。他の端子を否定してはいないので、限定の誤りではなく措辞級 | jp「**アナログRGB** は D-sub 15 ピンの VGA 端子を使い、3 色の信号をアナログのまま送る。」→「**アナログRGB** は主に D-sub 15 ピンの VGA 端子を使い、3 色の信号をアナログのまま送る。」/ zh「**模拟RGB** 使用 D-sub 15 针的 VGA 接口，把三种颜色的信号以模拟形式直接传送。」→「**模拟RGB** 主要使用 D-sub 15 针的 VGA 接口，把三种颜色的信号以模拟形式直接传送。」/ en "**Analog RGB** uses the 15-pin D-sub VGA connector and sends the three color signals in analog form as they are." → "**Analog RGB** mainly uses the 15-pin D-sub VGA connector and sends the three color signals in analog form as they are." |
| L2 | LOW **建議修** | `terms[3].points[0].text_jp` / `text_zh` / `text_en` | 「DVI には、デジタル専用の DVI-D と、アナログ信号も通せる DVI-I がある」は 2 種で言い切っている。detail の「など」が落ち、DVI-A (アナログのみ) が抜けた閉じた列挙に読める (失敗型 10 の形)。ただし考点の主張 (DVI を全てデジタル専用とみなすのは誤り) は正しく、引用題もないので LOW | jp「DVI には、デジタル専用の DVI-D と、アナログ信号も通せる DVI-I がある。」→「DVI には、デジタル専用の DVI-D と、アナログ信号も通せる DVI-I などがある。」/ zh「DVI 有数字专用的 DVI-D 和也能通过模拟（[[jp:アナログ]]）信号的 DVI-I。」→「DVI 有数字专用的 DVI-D 和也能通过模拟（[[jp:アナログ]]）信号的 DVI-I 等类型。」/ en "DVI comes as the digital-only DVI-D and DVI-I, which can also pass analog ([[jp:アナログ]]) signals." → "DVI comes in types such as the digital-only DVI-D and DVI-I, which can also pass analog ([[jp:アナログ]]) signals." |
| L3 | LOW **建議修** | `terms[4].points[0].text_en` | jp「HDMI のほう」と zh「…的是 HDMI」は 2 者の比較に閉じている。en "but only HDMI also carries audio" は単独で読むと「音声を運べるのは HDMI だけ」と読め、DisplayPort (音声あり) と欄同士で食い違って見える | en "Both DVI and HDMI can send digital ([[jp:デジタル]]) video, but only HDMI also carries audio over the same cable." → "Both DVI and HDMI can send digital ([[jp:デジタル]]) video, but of the two, only HDMI also carries audio over the same cable." |
| L4 | LOW | `overview_rows[4].one_line_jp` (+ `terms[4].one_jp`) | 「映像と音声を 1 本で送る AV 機器向けの接続」は、q073 正答アの要素のうち 映像 → 音声 → 1 本 → AV 機器向け を同じ順で持つ。ただし考点ではなく総表の定義行で、制御信号が抜けているので組は一揃いではない。12 字窓の一致は 0。q073 は「HDMI の説明として適切なもの」を問う定義型で、正答内容を見出し語の一般定義として述べることは D-209 で免除される。HDMI の標準的な定義表現でもある | 記録のみ (この並びは HDMI の定義そのもので、順を崩すとかえって不自然になる) |
| L5 | LOW | `terms[0].detail` / `terms[1].detail` / `pairs[0].rows[1]` / `key_points[0]`。`pairs[1].rows[2]` / `pairs[2].rows[0]` / `terms[5].points[0]` / `terms[5].fig` / `overview_rows[4..5]`。`terms[3].detail` / `points[0]` / `key_points[2]` / `overview_rows[3]` / `pairs[1].rows[1]` / `terms[5].fig` | 書き方 8 の対比反復。① 雑音への強さ (アナログ / デジタル) が 4 欄。② AV 機器向け / PC 向けが 5 欄以上。③ DVI-D / DVI-I (アナログ併用) が 6 欄。a1 / a2 の jp-review の low と同じで、未修 | 記録のみ (①は信号区分の存在理由、③は DVI の唯一の識別点で、削ると単元の筋が欠ける) |
| L6 | LOW | `terms[5].hook_jp/zh/en`、`terms[5].analogy_*` (空)、`terms[3].hook_*` (なし) | DisplayPort hook「名前どおりディスプレイの差し込み口 / PC 用モニタの裏の端子」は、one の「主に PC とモニタ」の言い換えに近い (D-203 §6)。DVI hook と DP analogy は欠けている (validate は許容) | 記録のみ |
| L7 | LOW | `terms[4].quiz[1]` / `inline_quiz[1]` (2018h30h-q071)、`challenge_questions[2]` (2011h23a-q088) | q071 の正答はポートリプリケータで HDMI は端子名として出るだけ。q088 は Bluetooth で単元の用語外。topic 内で本単元に結び付く題が 2 題しかなく、CONFIRM.min = 3 による構造上の制約。本文との矛盾はない | 記録のみ |
| L8 | LOW | zh「档位」(`terms[0].points[0]` / `terms[1].points[0]` / `terms[1].fig` nodes[2]・steps[2] / `pairs[0].rows[0].b_zh`)、zh「兼用模拟」(3 欄)、`key_points_zh[0]`「也以数字为主流」、en 図ラベル "(audio; …)"、`pairs[1].rows[2].label_en` | loc-review の low 5 件がいずれも未適用。意味は通じ、誤答肢寄りの語でもない | 記録のみ (適用するなら loc-review の fix_jp どおり) |
| L9 | LOW | `terms[1].fig.steps` (show 1→2→4)、`terms[5].fig` | flow で 3 番目のノードを単独で示す step がなく、caption が丸めと 0/1 化を 1 文にまとめている。DisplayPort の tree は単元全体の分類で、用語固有の図ではない (overview と重なる) | 記録のみ (登録図種の範囲内、§0-8 で最大 low) |
| L10 | LOW | `terms[2].points[0].text_*` | 第 3 用語の考点が、未定義の DVI (第 4 用語) を対比の相手にしている。「デジタルを基本として」と最小限の説明があるので致命的ではない | 記録のみ |

**範囲外の観察**:
- O1: 独立の copy 照合 (遮蔽あり / なし) で 12 字一致は 0 件。近似一致 12 件は「インタフェースである」の文末定型の偽陽性 (§1-4)。
- O2: DisplayPort の「複数のモニタの接続に向く」は v1.2 (2010) で入った MST による。現行の全版に当てはまる能力の記述で、構成要素の数・名称ではないので D-205 の版の明記は不要と判断した。HDMI「家電メーカーなど」は Founders 7 社 (Silicon Image を含む) と整合する。

確認済みで問題なし:
- 既往 MEDIUM 2 件の解消 (三語、§2-0)
- 技術事実 (信号方式・音声の有無・制定団体・端子種別・正式名称)。q073 正答とも一致
- exam 考点 0 件 (限定条件の対象なし)
- §9 禁止句 0、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤79 字)
- `[[jp:]]` 原語 (4 種とも実在)、zh 訳語表 (B6 warn 0)
- 図種 (flow steps / tree static = 登録内)、派生フィールドの一致
- 用語・`term_zh`・`term_en` の v1 不変量

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **10** (建議修 3: L1 / L2 / L3、記録のみ 7: L4〜L10) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。

- 全 6 用語・考点 6 件 (全て mix)・quiz / challenge の異なり 3 題で、規格の技術事実は正しい。q073 の正答と一致し、誤答肢を支持する記述はない。
- a1 の MEDIUM 2 件は次のとおり三語で解消し、退行はない。
  - DVI hook: 削除された。
  - HDMI 考点: 正答肢の列挙をやめ、DVI との肯定対比に置き換わった。
- LOW 建議修 3 件 (L1〜L3) は B3 補丁での修正を推奨する。L4〜L10 はバッチ証拠の「未修 LOW」表へ記録する。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-15-42-u01
✓ technology-15-42-u01 unit: 0 issues (data/ip/textbook/units/technology-15-42-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-15-42-u01
✓ technology-15-42-u01 parity: 27 locations, 0 diff
EXIT=0
```
