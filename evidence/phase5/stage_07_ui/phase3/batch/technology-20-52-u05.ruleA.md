# Rule A 全数抽検 — technology-20-52-u05 (動画の仕組みとファイル形式)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b68)、repo HEAD `3c2f850e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b68-u05-a2` merge 結果、sha256 先頭 `126c7c8d95dc722d`)。a2 は a1 r1 (`f1d1bbe9…`) を seed にした再走。
- **対象**: `data/ip/textbook/units/technology-20-52-u05.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (フレーム / フレームレート / MPEG / H.264 / H.265 / AVI / MP4) + 単元レベル (goals / overview_rows / pairs 3 組 / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-210、Rule A 共通指示の既知失敗型 (1)〜(10)。比較: `data/ip/textbook/.planning/v2/technology-20-52-u05/v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ (派生フィールドを除いたダンプ 504 行)。派生フィールド・summary は validate が本体との一致を検査 (0 issues)。MP4 は `hook_*` キーなし・`analogy_*` 空 (summary.memory_hooks は 6 件) → L10。
2. **考点 × 引用題 (考点 全 8 件 = exam 2 + mix 6、qid 付き 2 件 = 2 題)**: `data/ip/quiz/questions.json` (+ translations の stem_jp_clean) から各題を再読 (全題 topic `technology-20-52`)。
   - 2013h25h-q079 (映像データや音声データの圧縮方式を 4 つの形式名から選ぶ、正答エ MPEG、誤答 = 静止画の 3 形式) ↔ `terms[2].points[0]`「MPEG は映像の圧縮方式と音声の圧縮方式の両方を含む規格群」— 正答と一致、題の「映像や音声」の両方を保持 (a1 M1 の「対象は映像」限定は解消)、誤答肢の名前・組を述べない (iii なし)。
   - 2016h28h-q097 (拡張子 avi のファイルが扱う対象、正答ウ 動画、誤答 = 音声・静止画・文書) ↔ `terms[5].points[0]`「.avi は動画のファイルで、映像を中心に、音声も合わせて収められる」— 正答と一致、「収められる」(可能) で a1 L「必ず音声が入る」も解消。音声に触れるが「動画のファイル」が主語で誤答ア を支持しない。選択肢の組 (4 種) も順もなぞらない (iii なし)。
3. **quiz / challenge_questions** (quiz 2 枠 + challenge 4 題 [2013h25h-q079 / 2016h28h-q097 / 2009h21h-q078 / 2015h27h-q076]、うち本文未引用 2 題): 2009h21h-q078 (MP3 = 音声データのファイル圧縮形式、誤答に動画用の形式あり) は本単元に MP3 の記述がなく、MPEG の hook「Moving Picture = 動画」と MP4 (MPEG-4 の動画コンテナ) の組合せが誤答エ 側へ寄せうる → **type (9) 判定は §3 L1** (LOW)。2015h27h-q076 (ストリーミング) は u01 の用語で本文に記述なし、矛盾もなし → L7。他の topic 題で MPEG が誤答肢に出る 2018h30a-q086 (256 色の静止画形式 = GIF) とも、本文は MPEG を静止画形式とせず整合。
4. **D-198 写し**: validate の copy guard = 0。独立照合: 単元の JP 文字列 126 本 (派生・summary 除く) × topic 全 20 題 (stem_jp_clean + 選択肢) の 12 字連続照合を **カタカナ 4 字以上・英数遮蔽あり / 遮蔽なし** の両方で実施 → **0 / 0 件**。近似一致 (12 字窓、1〜2 字置換) → 3 件、全て偽陽性: `terms[2].one_jp`「…のデータを圧縮する方式を…」↔ 2012h24a-q094/q095/q096 の大問共通文「画像データを圧縮する方法を」= 一般的な言い回し。`terms[2].one_jp` と 2013h25h-q079 の問い (映像や音声の圧縮方式) は意味が重なるが、正答 MPEG の標準的な定義の一般表現で写しではない (D-198)。カタカナの多い文 (フレーム・フレームレート・コンテナ形式・ブルーレイディスク・ワンセグ) は目視でも題文との対応なし。具体例 (30 fps・15/30/60 fps 表・連続写真の比喩・荷物の畳み方・段ボール箱) は全て自作で引用題に無い場面。
5. **D-195**: 結論先行 (one = 1 文 × 7、太字あり; H.264 one_en は loc r1 で 1 文に統合済み)、展開 2〜3 文、比喩・フック (§6; H.265 hook は L5)、定義前使用 (静止画 = フレーム one、fps = フレームレート one の括弧、解像度 = points[1] 内で定義、コンテナ形式 = AVI one・detail で定義後に MP4 で使用、ITU-T = H.264 one の同格説明 [a1 L 解消]、伸長 = H.265 detail で「再生 (伸長)」、符号化 = u01 エンコード one で定義済み [本単元の prerequisites は u04 のみ → 記録のみ、L11])、§9 禁止句 grep: `overview_cols_jp[1]`「覚える手がかり」(列見出し) / `terms[0].hook_jp`「字面で覚える」(記憶フックの言い方、1 件のみ) / `terms[3].detail_jp`・`pairs[0].rows[2].b_jp` (+ `terms[4].detail_jp`)「とされる」= 圧縮効率「約半分」という量的主張の留保で、試験の言い回しではない → 全て偽陽性。図の型: MPEG・MP4 = flow steps 4/4、フレームレート = static table、他 = 図なし (全て登録内)。
6. **D-200**: 考点数 1/2/1/1/1/1/1 (≤3 ✓)、各 JP 1〜2 文・34〜69 字 (≤100 ✓)。**framing 件数** (validateV2 `pointFraming`、全考点、スクリプトで計数): jp 0 / zh 0 / en 0。
7. **D-205 / 規格の事実 (D-210 含む)**: 引用題の前提に改正前後の版の差はない。本文の規格事実の確認:
   - `terms[6].one_*`・`pairs[2].rows[0].b_*` 「MPEG-4 の Part 14」: Rule A の外部確認 = 米議会図書館 FDD `fdd000155` (MP4 File Format v2) が「ISO/IEC 14496-14:2003 … Coding of audio-visual objects — Part 14: MP4 File Format」と記載 (v1 は Part 1 [2001])。部番号は版をまたいで不変の識別名で、数・構成の言い切りではないため版の明記は不要と判断。
   - MPEG-2 (DVD・デジタル放送) は「例えば」付き。H.264 = ITU-T と MPEG の共同策定・MPEG-4 AVC (Part 10)・ブルーレイ / ワンセグ、H.265 = HEVC・4K/8K 放送、AVI = Microsoft の Windows 向け形式・interleave の語義 はいずれも標準的事実。圧縮効率の「約半分」は 2 箇所とも「とされる」で留保。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 5 種 (フレーム / 静止画 / フレームレート / 解像度 / コンテナ形式) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` はカナ語 2 用語 (フレーム・フレームレート) にあり、英字見出し語 5 用語は三語同表記 (validate 0)。zh 訳語 (帧 / 帧率 / 编码 / MPEG / H.264) は `zh_terms.json` と一致、validate の B6 / jp-origin warn 0。loc-review r1 の修正 (H.264 one_en 1 文化、`pairs[1].rows[0].b_zh/en`、`terms[5].detail_zh`、`pairs[2].rows[2].a_zh`、`overview_rows[3].one_line_en`、`terms[0].hook_en`、MPEG detail_en 2 文化) は全て反映済み。r2 の LOW 2 件は未反映 → L2・L8。
9. **前 run 指摘の解消 (a1 → a2)**: §4 表。
10. **同 topic 他単元との整合** (u01〜u04 / u06): §5。
11. **機械ゲート**: §7。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | フレーム | OK — mix 1: 前後と続けて表示して動きを表す 1 枚。detail (フィルムの 1 コマ・差分圧縮の単位) 正しい | OK | OK (hook_en は英語話者向けに置換、意味は同じ) | L4 (points[0]) / L12 (hook「元の意味」) |
| 2 | フレームレート | OK — mix 2: フレーム = 1 枚 / フレームレート = 毎秒の枚数; 解像度 = 1 フレームの画素数 (空間) / フレームレート = 時間方向、どちらでも圧縮前データ量増。表 15/30/60 fps → 約 0.067/0.033/0.017 秒・150/300/600 枚を再計算し一致。detail の「1 フレームのデータ量 × フレームレート × 秒数」、key_points[0]「比例して増える」と整合 | OK | OK | L4 (points[0]) |
| 3 | MPEG | OK — exam 1 / 1 題 (2013h25h-q079 正答エ、§1-2)。one「映像や音声のデータを圧縮する方式を中心とした規格群の総称」、detail (差分記録、MPEG-2 例、MPEG-4 はファイル形式まで定める規格もある)、hook (Moving Picture Experts Group の頭文字 = 組織名) とも事実どおり。flow 4 段 (基準フレームを単独で圧縮 → 前後との違い → 違いだけ記録 → 再生時に復元) は detail と一致 (a1 L の「直前」「丸ごと」は解消) | OK | OK | L1 (q078 との関係) |
| 4 | H.264 | OK — mix 1: H.264 = ITU-T 勧告番号 / MPEG-4 AVC = MPEG 側の名前、同一規格。事実 §1-7 | OK | OK | L4 (points[0]) |
| 5 | H.265 | OK — mix 1: H.265 と HEVC は同じ規格の 2 つの呼び名。detail (約半分とされる・計算は重い・4K/8K) 正しい | OK | OK | L4 / L5 (hook) / L6 (goals との関係) |
| 6 | AVI | OK — exam 1 / 1 題 (2016h28h-q097 正答ウ、§1-2)。detail (コンテナ形式の定義、Microsoft の Windows 向け、映像の符号化方式は固定されない)、hook (interleave = 映像と音声を交互に並べる構造) 正しい | OK | detail_en 3 文 / jp・zh 2 文 → L2 | L2 / L3 (対比反復) |
| 7 | MP4 | OK — mix 1: MPEG-4 = 規格群全体、MP4 = その中で定めたファイルの入れ物の形式 (MPEG detail「ファイルの形式まで定めている規格もある」と一致)。one の Part 14 は §1-7 で外部確認。detail (字幕も、中身は H.264/H.265 が多い、最も普及した形式の 1 つ) 正しい。flow 4 段 (映像を圧縮 → 音声も別に圧縮 → 1 ファイルに格納 → 取り出して伸長) は one・detail と一致 | OK | OK | L10 (hook なし) |

**単元レベル**: goals 3・overview_cols 2 (分類 / 覚える手がかり)・overview_rows 7・pairs 3 組 (H.264/H.265 4 行 key 1、H.264/AVI 3 行 key 1、AVI/MP4 3 行 key 1)・key_points 4・summary (validate 一致)・challenge 4 題 (CONFIRM 3〜5 内)。事実誤りなし、三語一致。

### 2-1. 「MPEG が何を定めるか」全欄の照合 (依頼の重点)

| 欄 | jp の述べ方 | zh / en | 判定 |
|---|---|---|---|
| `unit_summary_*` | 代表的な映像符号化方式・コンテナ形式を理解する (MPEG を名指ししない) | 同 | OK |
| `goals_*[1]` | MPEG の規格群と、その中の映像の符号化規格 H.264・H.265 | 这一系列标准 / family of standards | OK (H.265 の MPEG 側の位置は本文に無い → L6) |
| `overview_rows[2]` | 映像や音声の圧縮方式を中心とした規格群の総称 / 分類 = 規格群 | 同 | OK (H.264・H.265 = 符号化方式、AVI・MP4 = コンテナ形式 と別の分類) |
| `terms[2].one_*` | 映像や音声のデータを圧縮する方式を中心とした規格群の総称 | 以…为核心的一系列标准 / centered on methods for compressing video and audio | OK |
| `terms[2].detail_*` | 映像の圧縮は差分記録、番号付き規格 (例えば MPEG-2)、MPEG-4 のようにファイルの形式まで定める規格もある | 同 | OK — 「中心とした」と MP4 欄 (MPEG-4 Part 14) を橋渡し |
| `terms[2].points[0]` | 映像の圧縮方式と音声の圧縮方式の両方を含む規格群 | 既包括视频…也包括音频 / covers both video … and audio | OK (a1 M1 解消) |
| `terms[2].hook_*` | 規格を作った専門家の組織 Moving Picture Experts Group の頭文字 | 同 | OK — 規格群名 = 組織名の由来を明示 (a1 M2 の JPEG 比較は三語とも削除) |
| `terms[2].analogy_*` / `fig` | 背景が同じ連続写真の差分だけ伝える / 映像のフレーム間差分 | 同 | OK — MPEG の映像圧縮の手法の例示で、one の範囲 (映像や音声) より狭いが否定はしない (記録のみ) |
| `terms[3].one_* / detail_*` / `points[0]` | ITU-T と MPEG (組織) が共同で定めた、MPEG 側では MPEG-4 の一部として AVC | 同 | OK — 組織としての MPEG、hook の説明と整合 |
| `terms[6].one_* / points[0]` | MPEG-4 規格の一部 (Part 14) のコンテナ形式 / MPEG-4 = 圧縮方式などを含む規格群全体 | 同 | OK |
| `pairs[1]` | H.264 (符号化方式) ↔ AVI (コンテナ形式) | 同 | OK — a1 M (MPEG を符号化側に置いて AVI と対比) は H.264 に置換して解消。AVI の旧 mix 考点「符号化方式 (例: MPEG)」も削除済み |
| `pairs[2].rows[0].b_*` | 定めたところ = MPEG (MPEG-4 の Part 14) | 同 | OK |
| `key_points_*[1]` | 映像や音声の圧縮方式を中心とした規格群、動画の圧縮では隣り合うフレームの違いを利用 | 同 | OK |

→ 全欄が「圧縮方式が中心で、ファイル形式の規格 (MPEG-4 Part 14) も含む規格群 / その規格を作る組織」の範囲でそろい、「MPEG = 符号化方式そのもの」「MPEG = 映像だけ」と読める欄はない。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 12 (うち 建議修 2)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[2].detail_jp` / `detail_zh` / `detail_en` | type (9) 判定: challenge 2009h21h-q078 (MP3 の説明を選ぶ; 誤答に動画データ用の形式) に対し、MPEG hook の像「Moving Picture = 動画」と MP4 (MPEG-4 の動画コンテナ) を合わせて「MP〜 = 動画」と当てはめると誤答側に寄る余地がある。ただし本単元は MP3 を名指ししないため hook を題に直接当てはめることはできず、`terms[2].points[0]` が「音声の圧縮方式も含む」と明言して像を打ち消しているので MEDIUM には当たらない (hook 自体は a1 M2 の修正箇所で、語源だけに保つ)。MP3 = MPEG-1 の音声規格 (MPEG-1 Audio Layer III) は u02 MP3 hook と同じ事実 | detail の末尾に 1 文追加 (jp・zh・en とも 2 → 3 文、上限内)。jp: before「…MPEG-4 のように、圧縮したデータを収めるファイルの形式まで定めている規格もある。」→ after「…MPEG-4 のように、圧縮したデータを収めるファイルの形式まで定めている規格もある。音声だけの規格も含まれ、例えば MP3 は MPEG-1 の音声の規格から生まれた形式である。」/ zh: before「…也有像 MPEG-4 这样连存放压缩数据的文件格式都一并规定的标准。」→ after「…也有像 MPEG-4 这样连存放压缩数据的文件格式都一并规定的标准。其中也包括只针对音频的标准，例如 MP3 就是由 MPEG-1 的音频标准而来的格式。」/ en: before "…and some, like MPEG-4, even define the file format that holds the compressed data." → after "…and some, like MPEG-4, even define the file format that holds the compressed data. The family also includes audio-only standards; MP3, for example, comes from the audio part of MPEG-1." |
| L2 | LOW **建議修** | `terms[5].detail_en` | jp・zh 2 文に対し en 3 文 (loc-review r2 の LOW 未反映)。意味は一致 | before "AVI is a long-standing format that Microsoft created for Windows. It does not fix which coding method the video inside must use." → after "AVI is a long-standing format that Microsoft created for Windows, and it does not fix which coding method the video inside must use." (jp・zh 変更なし) |
| L3 | LOW | 符号化方式 = 畳み方 / コンテナ形式 = 箱 の対比 | 書き方 8 (pairs + mix 考点の 2 箇所まで) を超えて反復: `pairs[1].rows[0..2]`、`terms[5].analogy_*` (箱と畳み方は別々に選べる)、`terms[5].detail_*` 2 文目後半 (符号化方式は 1 つに決まっていない)、`terms[3].analogy_*`・`terms[4].analogy_*` (畳み方の像、対比の片側)、`terms[6].fig.steps[2]`、`key_points_*[3]`、`goals_*[2]`。a1 L (観点 8) と同型で未削減。誤学習には至らず、単元の中心の区別 | 記録のみ (AVI analogy は pairs[1].rows[2] と重複するが、削ると AVI の比喩が空になる) |
| L4 | LOW | `terms[0].points[0]`、`terms[1].points[0]`、`terms[3].points[0]`、`terms[4].points[0]` (各 text_jp/zh/en) | D-203 §9: one / detail の言い直し (a2 JP-review の LOW と同じ)。事実は正しい。`terms[2].points[0]` も one の範囲の言い直しに近いが、引用題に結ぶ exam 考点で範囲 (映像と音声の両方) を明示する役があるため数えない | 記録のみ |
| L5 | LOW | `terms[4].hook_*` | 「HEVC の HE は High Efficiency」は one の括弧 (High Efficiency Video Coding) の言い直し (§6) | 記録のみ |
| L6 | LOW | `goals_*[1]` / `terms[4]` | goals は H.265 を「MPEG の規格群…の中の」とするが、H.265 欄に MPEG との関係 (MPEG-H Part 2 / ITU-T と共同) が無い。事実として誤りではない (a2 JP-review LOW と同じ) | 記録のみ |
| L7 | LOW | `challenge_questions[3]` (2015h27h-q076) | ストリーミングは u01 の用語で本文に手がかりなし (同 topic のため可、矛盾なし) | 記録のみ |
| L8 | LOW | `pairs[2].rows[2].a_zh` / `a_en` | jp「古くからの Windows のパソコン」(昔から Windows で使われてきた) に対し zh「早期的」・en "from earlier years" は「初期の機種だけ」と読め少し狭い (loc r2 LOW 未反映、jp 自体もやや曖昧) | 記録のみ (任意: zh「长期以来的 Windows 电脑」/ en "Long used on Windows PCs") |
| L9 | LOW | `terms[4].detail_zh` (「广播和分发」) | 「配信」→「分发」はやや技術寄り (loc r1 LOW、H.264 側は「在线视频」に修正済みで H.265 側のみ残存)。誤訳ではない | 記録のみ |
| L10 | LOW | `terms[6]` (MP4) | `hook_*` キーなし・`analogy_*` 空 (memory_hooks 6 / 用語 7)。validate は許容 (D-203 (b) 空欄可) | 記録のみ |
| L11 | LOW | `goals_jp[1]`・`terms[3].one_jp` ほか「符号化」 | 本単元内で未定義 (u01 エンコード one で「符号化ともいう」と定義済み、prerequisites は u04 のみ) | 記録のみ |
| L12 | LOW | `terms[0].hook_jp` / `hook_zh` | 「frame の元の意味は『枠』」は語源としては緩い (英語 frame の古い意味は「構造・骨組み」系) が、基本義として「枠」は正しく誤学習には至らない。en は picture frame の手がかりに置換済み | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 符号化方式 / コンテナ形式: L3 の列挙どおり → L3。② H.264 / H.265 の世代・データ量: `pairs[0].rows[1..3]`、`terms[4].one_*` (後継 = 定義そのもの)、`terms[4].detail_*` (約半分、4K/8K)、`terms[3].detail_*` は MPEG-2 との比較で別の対比、`key_points_*[2]`、`overview_rows[4]` (総表の one_line) → H.265 の定義・展開そのものであり、mix 考点では繰り返さない (H.264/H.265 の mix 考点は別名のみ) → 許容。③ AVI / MP4: `pairs[2]` のみ (各 one は片側) → 許容。④ フレーム / フレームレート: `terms[1].points[0]` (mix) と `key_points[0]` → 許容。⑤ MPEG-4 / MP4: `terms[6].points[0]` (mix) と `terms[2].detail` (規格の側から) → 許容。

**範囲外の観察** (本単元の補丁対象外):
- O1 **u06 (未 Rule A) へ回付**: `technology-20-52-u06` `terms[3].points[1].text_jp`「MPEG は動画とその音声を圧縮する方式の規格」と `key_points_jp[2]`「動画の MPEG」(+ `terms[3].detail_jp`「動画の MPEG」) は、本単元 a1 M1 で外した「音声を映像の従属物に限る」型の述べ方で、本単元 `terms[2].points[0]` (映像と音声の両方を含む規格群) および 2013h25h-q079 の範囲 (映像や音声) と食い違う。u06 の Rule A で判定を要する (同 topic の単元間不整合)。
- O2 u04 (Rule A 済み) `terms[0].points[0].text_jp` は「MPEG は動画と音声の圧縮方式」としたうえで「扱う対象が止まった絵か動く映像かで分かれる」と結ぶ。1 文目が音声を含むので誤りではないが、2 文目は MPEG の対象を動く映像に寄せる。次回 u04 改稿時の参考 (記録のみ)。
- O3 u02 の MP3 hook (MPEG-1 Audio Layer-3、映像と音声の圧縮規格 MPEG の音声部分) と AAC detail (MPEG-2・MPEG-4 の一部) は本単元の MPEG の範囲と一致。u03 の解像度 (画素の数) は本単元 `terms[1].points[1]` と一致。u01 の符号化・伸長・ストリーミングとも矛盾なし。L1 の追加文 (MP3 = MPEG-1 の音声規格から) は u02 hook と同じ事実。

確認済みで問題なし: 限定条件 (exam 考点 2 件とも引用題の範囲を保持、支持外の限定なし)、(iii) 選択肢なぞり 0 (validate の choice-echo warn なし、題側の判定項目・空欄なし)、§9 禁止句 grep (定型締め句 0、ヒット 4 種は偽陽性 §1-5)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (≤2 文・≤69 字)、D-198 独立照合 (遮蔽あり / なし 0、近似 3 件偽陽性)、`[[jp:]]` 原語 5 種実在、zh 訳語表一致、図種 (flow steps ×2 / static table ×1 / 図なし ×4)、用語・`term_zh`・`term_en` の v1 不変量、(6) zh / en が誤答肢の語に寄る訳 0、(8) 比喩の鍵語が他の見出し語と衝突 0 (「箱」「畳み方」は pairs[1] と同じ向き)。

## 4. 前 run 指摘の解消 (journal a1 / a2)

| 出所 | 指摘 | a2 最終版 (jp / zh / en) | 状態 |
|---|---|---|---|
| a1 jp-review r1 MEDIUM | MPEG 考点が対象を映像に限る / one が音声を映像の従属物に (q079 は映像や音声、MP3 は MPEG の音声規格) | `terms[2].points[0]` = 映像の圧縮方式と音声の圧縮方式の両方を含む規格群 / 既包括视频…也包括音频 / covers both video … and audio。one = 映像や音声のデータを…中心とした規格群 (三語同)。key_points[1]・overview_rows[2] も「映像や音声」 | 解消、退行なし |
| a1 jp-review r2 MEDIUM | MPEG を符号化方式の側に置いて AVI と対比する欄と、MP4 を MPEG が定めたコンテナとする欄の食い違い | `pairs[1]` は H.264 / AVI に変更 (MPEG なし)、AVI の旧 mix 考点「符号化方式 (例: MPEG)」削除、MPEG one = 規格群・detail に「ファイルの形式まで定めている規格もある」、MP4 one / points / pairs[2] と同範囲 (§2-1) | 解消、退行なし |
| a1 jp-review r2 MEDIUM | MPEG hook が M (頭文字) と JPEG の 2 文字目を比べて「頭の 1 文字で動くか止まっているか」 | hook = 組織名 Moving Picture Experts Group の頭文字と Moving Picture = 動画 の語義のみ。JPEG 比較は jp / zh / en とも無し | 解消、退行なし |
| a1 LOW 群 | 図 steps[1]「直前」、node[0]「丸ごと」、AVI「必ず音声」、ITU-T 未定義、challenge (MIDI / DRM 題) 不適合 | それぞれ「前後」「単独で圧縮」「収められる」「通信の国際標準化機関である ITU-T」、challenge は q078 / q076 に差し替え | 解消 (q078 / q076 の適合は L1 / L7) |
| a1 / a2 LOW | 対比反復 (観点 8)、考点の言い直し (§9)、goals と H.265 | 未変更 | L3 / L4 / L6 として記録 |
| a2 loc-review r1 MEDIUM | `terms[3].one_en` 2 文 | 1 文 (ITU-T → MPEG の順で jp と一致) | 解消 |
| a2 loc-review r2 LOW | `terms[5].detail_en` 3 文、`pairs[2].rows[2].a_zh/en` | 未反映 | L2 (建議修) / L8 |

## 5. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **12** (建議修 2: L1 / L2、記録のみ 10: L3〜L12) |

## 6. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 7 用語・考点 8 件 (qid 付き 2 件)・引用 2 題 + 未引用の challenge 2 題で、考点の主張は正答と一致し、誤答肢を支持する記述・引用題の限定条件の落ち・支持外の限定はない。a1 の MEDIUM 3 件 (MPEG の対象範囲 / MPEG の符号化側配置と MP4 欄の食い違い / MPEG・JPEG の位置ずれ比較) は三語とも解消し、「MPEG が何を定めるか」は全 13 欄で同じ範囲にそろう (§2-1)。LOW 建議修 2 件 (L1 MP3 の位置付け、L2 en 文数) は補丁 (B3) で修正推奨。O1 (u06 の MPEG 記述) は u06 の Rule A へ回付。

## 7. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-20-52-u05
✓ technology-20-52-u05 unit: 0 issues (data/ip/textbook/units/technology-20-52-u05.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-20-52-u05
✓ technology-20-52-u05 parity: 31 locations, 0 diff
EXIT=0
```
