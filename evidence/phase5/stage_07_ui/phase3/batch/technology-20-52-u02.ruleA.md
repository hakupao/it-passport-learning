# Rule A 全数抽検 — technology-20-52-u02 (音声のデジタル表現とファイル形式)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b68)、repo HEAD `b72a24ee` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b68-u02-a2` merge 結果、sha256 先頭 `6ef8d5811b81d4b8`)。
- **対象**: `data/ip/textbook/units/technology-20-52-u02.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (PCM / MIDI / WAV / MP3 / AAC) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `data/ip/textbook/.planning/v2/technology-20-52-u02/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。
- **前回指摘**: `journal.b68-u02-a1.jsonl` (jp-review r1 / r2) と `journal.b68-u02-a2.jsonl` (jp-review r1 PASS、loc-review r1 REVISE / r2 PASS) の type:"result" 全行。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 0. 前回 MEDIUM の解消確認 (a1 → a2)

| 前回指摘 | 箇所 | 現状 (三語) | 判定 |
|---|---|---|---|
| a1 jp-review r1 MEDIUM: 「音声や画像には前者 (非可逆)、文書やプログラムには後者 (可逆)」というデータ種別への割り当ての言い切り (画像の GIF / PNG は可逆、音声の WAV は無圧縮) | `terms[3].points[1].text_*` | jp「非可逆圧縮は伸長しても元のデータに完全には戻らず、ZIP のような可逆圧縮は完全に戻る。」1 文のみ。zh「有损压缩即使解压也无法完全恢复原来的数据，而像 ZIP 这样的无损压缩可以完全恢复。」/ en "… cannot be fully restored even after decompression, while lossless compression … such as ZIP restores it completely." — データ種別の割り当て文は三語とも無い。単元全体を grep しても「文書」「プログラム」「画像には」の割り当ては 0。u06 `terms[2].points[0]` (可逆かどうかはデータの種類ではなく戻せるかで決まる) とも整合 | **解消、退行なし** |
| a1 jp-review r2 MEDIUM: challenge 2010h22a-q085 (ランレングス・圧縮率 = u06 の内容) が本単元で解けない | `challenge_questions` | `[2012h24h-q064, 2009h21h-q078, 2013h25h-q079]` の 3 件、q085 は除去済み。3 題とも本文で解ける (§1-3) | **解消** (残渣は O1: `source_figures[0]` に q085 の図参照が v1 から残るが描画されない) |
| a2 loc-review r1 MEDIUM: en「Since compression throws no information away」(WAV が可逆圧縮しているように読める) | `terms[2].detail_en` | "Because it is not compressed, no information is discarded, …" | **解消** (jp / zh 側の同種の曖昧さは L3) |
| a2 loc-review r1 MEDIUM: zh「被削去的部分与原声不同」(主語のずれ) | `pairs[1].rows[2].b_zh` | 「因削去的部分而与原声有差异」 | **解消** |
| a2 loc-review r1 LOW (任意): 规格→标准、影像→视频、strength→loudness、"Data under lossy compression" | 各所 | 标准 / 视频 / loudness / "Data compressed with lossy compression" に直っている | 反映済み |

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ (派生フィールド除く 395 行のフラット展開)。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_* / overview.intro_*`) が本体の記法除去版 (`**` 除去・`[[jp:X]]`→X) であることをスクリプトで確認 (72 箇所。スクリプトは 2 件を報告したが、いずれも overview.intro_jp / intro_zh が goals を区切り文字なしで連結している差で、実質の不一致 0)。
2. **考点 × 引用題**: 考点 全 6 件 = exam 2 (qid 付き 2、異なり 2 題) + mix 4。`data/ip/quiz/questions.json` から topic `technology-20-52` 全 20 題の題文・選択肢・`correct_answer` を再読 (translations に `stem_jp_clean` は無く、該当題の raw stem は OCR 損傷なし)。音声に関わる題: 2012h24h-q064 (正答ウ MIDI)、2009h21h-q078 (正答イ 音声データの圧縮形式)、2013h25h-q079 (正答エ MPEG)、および MIDI が誤答肢として出る 2018h30a-q086 (正答 GIF) / 2018h30h-q084 (正答 CPRM)、AVI の 2016h28h-q097 (動画)。本単元は MIDI を「256 色の静止画形式」「複製制御の著作権保護技術」と読ませる記述を持たない (誤答肢の支持 0)。
   - **計算の再計算**: `terms[0].detail_*`「8,000 回/秒 × 8 ビット × 1 チャンネル × 10 秒 = 640,000 ビット (80,000 バイト)」→ 8000×8×1×10 = 640,000、÷8 = 80,000 で一致 (三語とも同じ数値)。式「標本化周波数 × 量子化ビット数 × チャンネル数 × 秒数」も正しい。`pairs[0].rows[1].a`「標本化周波数と量子化ビット数に比例して増える」は式と一致。
   - **音声の事実**: 標本化 (時間方向) → 量子化 (値の方向、段階に丸める) → 符号化 (0/1 で表す) の順 ✓ / MIDI = 波形ではなく演奏情報 (音の高さ・長さ・強さ等)、音は受け手の音源が作る、録音した声は表せない ✓ / WAV = 主に PCM を無圧縮で収める Windows 標準形式、名前は Waveform 由来 ✓ / MP3 = MPEG-1 Audio Layer-3、聞き取りにくい成分 (マスキング) を削る非可逆圧縮、設定によって PCM の約 1/10 (128 kbps ÷ 1,411 kbps ≈ 1/11 で妥当; この数値を持つ題は無い) ✓ / AAC = Advanced Audio Coding、MPEG-2・MPEG-4 の一部、MP3 より後で同じデータ量なら音質で有利、配信・スマートフォン・デジタル放送 (日本の地上デジタル放送の音声は AAC) で使用 ✓ / PCM hook の C = Code (Pulse Code Modulation) ✓。事実誤り 0。
3. **quiz / challenge_questions**: quiz = `terms[1]` q064、`terms[3]` q078 (inline_quiz 同じ)。challenge 3 題: q064 は MIDI one (電子楽器とコンピュータの間で演奏情報を伝える規格) で解ける。q078 は MP3 one / points[0] (対象は音声) で解ける。q079 (映像・音声の圧縮方式 = MPEG) は MP3 hook「映像と音声の圧縮規格 MPEG」と AAC detail (MPEG-2・MPEG-4) で解け、誤答肢 BMP / GIF / JPEG を支持する記述は無い (静止画形式は u04)。観点 (9) フック当てはめ: MP3 hook を q078 に当てても「MPEG の音声部分」と明記するため動画の誤答肢へ導かない。
4. **D-198 写し**: validate の copy guard = 0 件、`warn choice-echo` 行の出力も 0。独立照合: 単元の JP 文字列 90 本 (派生・summary・intro 除く) を topic 内全 20 題の題文 + 選択肢 100 本と 12 字連続照合 (句読点・記号・空白・記法除去) → **カタカナ 4 字以上と英数を □ に遮蔽 (実字 6 未満の窓除外): 0 件 / 遮蔽なし: 0 件**。近似一致 (各題文・選択肢と同じ長さの窓で正規化編集距離 ≤0.35 または Dice ≥0.5、10 字以上の題側テキスト): **候補 0 件**。カタカナの多い文 (AAC detail「音楽配信サービスやスマートフォン、デジタル放送」、PCM fig のラベル) を目視 — 題文に同様の連なりは無い。
   - (iii) 選択肢の跡: q078 (分類型、選択肢 = ファクシミリ / 音声 / カラー画像 / 動画 の圧縮形式) に対し MP3 points[0] は「扱う対象は音声」と正の定義のみで、他の 3 対象を列挙も否定もしない → D-209 の分類型例外、写しではない。q064 (選択肢 AVI / BMP / MIDI / MP3) に対し MIDI points[0] は正の定義のみ、選択肢の組・順を再現しない。題文の「電子楽器と PC」の組は one で「電子楽器とコンピュータ」と一般語で述べ、12 字一致なし。
5. **D-195**: one = 1 文 × 5 (太字あり)、detail 3/3/2/3/2 文、図 = PCM flow steps 4 (各 caption 1 文 — a1 r2 LOW 解消済み)、AAC tree static (登録内)、MIDI / WAV / MP3 = 図なし。定義前使用: 標本化・量子化・符号化 = PCM one / detail、標本化周波数・量子化ビット数 = detail の括弧、演奏情報 = MIDI one、音源 = MIDI detail の括弧、非可逆圧縮・伸長 = MP3 detail、可逆圧縮 = MP3 points[1] で ZIP 例示 (prerequisite の u01 `terms[4].points[0]` で可逆 / 非可逆とも定義済み)。§9 禁止句 grep (jp: 試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `freq_badge`「低頻」以外は **PCM hook の「順序を覚える」1 件** (+ 派生 2) のみ (記憶フックの言い方、定型締め句ではない)。zh「非常小」(MIDI detail・pairs) / 「记住」(PCM hook)、en "very small" / "Remember" は通常の用法で偽陽性。pair 配置 (PCM / MIDI は MIDI の後、WAV / MP3 は MP3 の後、各組 key 行 1)。
6. **D-200**: 考点数 1/1/1/2/1 (≤3 ✓)、各 JP 1 文・43〜63 字 (≤100 ✓)。**framing 件数** (`validateV2.ts` の `pointFraming` を tsx で全考点に適用): **jp 0 / zh 0 / en 0** (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (「〜だけ」「〜ない」の照合: MIDI「波形そのものは表せない」と pairs[0].rows[3] 一致; WAV「圧縮せずに」と tree・pairs[1].rows[0] 一致; 「主に PCM」の範囲ずれ → L4; MIDI の伝送範囲の書き方 → L8; pairs[0].rows[2].a の言い過ぎ → L1; AAC 考点の「違いは〜にあって」→ L2)。書き方 8 → L7。書き方 9 (限定条件): exam 考点 2 件とも引用題に限定条件なし (分類型)、落ち 0。§6 → L6 / L7。§9 言い直し → L6。
8. **D-205 / D-210**: 改訂される文書の構成要素の数・名称なし (MPEG-1 / -2 / -4 は規格名で数を言わない)。法令改正前提の題なし。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、図ラベル・caption・比較行の三語一致、`[[jp:…]]` 原語 8 種 (標本化周波数 / 量子化ビット数 / 標本化 / 量子化 / 演奏情報 / 伸長 / 非可逆圧縮 / 可逆圧縮) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語: PCM・MIDI は term_zh / term_en の正式名を併記、WAV / MP3 / AAC は英字略称がそのまま見出し語 (validate 0)。zh 訳語は `zh_terms.json` (unit 抽出 `zh_terms.unit.json`) に従う: 采样 / 量化 / 编码 / 有损压缩 / 无损压缩 / 模拟 / 数字化 / 比特 / 智能手机 / PCM（脉冲编码调制）/ MIDI（乐器数字接口） 一致。
10. **同 topic 他単元との整合**: u01 `terms[3]` エンコード = 符号化 (MP3 にする処理はエンコード)、`terms[4]` 伸長 (解凍) / u06 `terms[0]` 伸長 (展開)・`terms[3].points[0]` MP3 = 聞き取りにくい成分を削る非可逆圧縮・`terms[3].points[1]` MPEG = 動画と音声の非可逆圧縮 / u04 `terms[0].points[0]` MPEG = 動画と音声の圧縮方式 → 本単元の 伸長 (元の形式に戻す処理)・MP3 hook・AAC detail と矛盾なし。u03 (ラスター / ベクター) は音声の記述なし。u05 (v1 のまま) の AVI = 入れ物の比喩は本単元の WAV 「方式と入れ物」(points[0]) と同型で整合。
11. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | PCM | OK — 引用題なし (freq 0)。mix: 標本化 = 時間方向、量子化 = 値の方向を区切る — 正しい。detail の式・計算 (640,000 bit / 80,000 B) 再計算一致。fig flow steps 4 (波 → 標本化 → 量子化 → 符号化) は one の順と一致、各 caption 1 文。analogy (連写 + 最寄りの目盛り + 数字で記録) は 3 段階に対応し誤った含意なし | OK | OK | L6 (hook 前半) |
| 2 | MIDI | OK — exam 1 / 1 題: 受け渡すのは音の高さ・長さ・強さなどの指示で、受け手が音を作る (2012h24h-q064 正答ウ; 誤答 AVI / BMP / MP3 を支持しない)。「など」あり。detail「録音した人の声は表せない」・analogy (楽譜を渡す) は one と一致。誤答肢として MIDI が出る q086 / q084 にも矛盾なし | OK (正の定義、D-209) | OK | L6 (points[0])、L8 (伝送範囲) |
| 3 | WAV | OK — 引用題なし。mix: PCM = 方式、WAV = 入れ物 — 正しい。detail「保存しても音質は変わらない・PCM のデータ量がほぼそのままファイルの大きさ」正しい | OK | en 修正済み、jp / zh に軽い曖昧さ | L3、L4 |
| 4 | MP3 | OK — exam 1 / 1 題: 対象は音声、聞き取りにくい成分を捨てる非可逆圧縮 (2009h21h-q078 正答イ; 誤答 ファクシミリ / カラー画像 / 動画 を支持しない)。mix: 非可逆は完全に戻らず、ZIP のような可逆は完全に戻る — 正しく、データ種別への割り当てなし (§0)。hook MPEG-1 Audio Layer-3 正しい | OK | OK | L6 (points[0]) |
| 5 | AAC | OK — 引用題なし。mix: MP3 も AAC も非可逆、同じデータ量で AAC が音質で有利になりやすい — 事実として正しい (「なりやすい」の留保あり)。detail (MPEG-2 / -4、用途) 正しい。tree (圧縮しない: WAV / 非可逆圧縮: MP3・AAC) は単元の 3 形式の分類として正しい | OK | zh / en の 流媒体 / streaming | L2、L5、L7、L8、L9 |

**単元レベル**: goals 3 点・overview_cols 2 (分類 / 中に入るもの)・overview_rows 5 行・pairs 2 組 (PCM / MIDI 4 行 key 1、WAV / MP3 4 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 3 件 (§1-3)。key_points[3]「非可逆圧縮で捨てた情報は伸長しても戻らず、MP3 と AAC はこの方式」は a1 の割り当て文を含まない。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 3)** + 範囲外観察 4

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `pairs[0].rows[2].a_jp` / `a_zh` / `a_en` | 「記録したデータどおりに鳴り、再生する機器によって変わらない」は、MIDI 側 (受け手の音源で変わる) との対比としては妥当だが、字面どおりではスピーカー等の再生機器で聞こえ方は変わるので言い過ぎ (a2 jp-review r1 LOW の残り)。どの題の誤答肢も支持しない | jp「記録したデータどおりに鳴り、再生する機器によって変わらない」→「記録した波形のデータどおりに鳴り、音源の違いに左右されない」/ zh「按记录的数据发声，不因播放设备而改变」→「按记录的波形数据发声，不受音源不同的影响」/ en "Plays exactly as recorded, regardless of the playback device" → "Plays back the recorded waveform data as is, unaffected by which sound source is used" |
| L2 | LOW **建議修** | `terms[4].points[0].text_jp` / `text_zh` / `text_en` | 「違いは同じデータ量でどれだけ音質を保てるかにあって」と違いを 1 点に限るが、同単元の AAC detail (MPEG-2・MPEG-4 の一部) と MP3 hook (MPEG-1 由来) は成り立ちの違いも述べる (観点 7 の措辞級、a1 r1/r2・a2 r1 LOW の残り)。事実誤りではない | jp「違いは同じデータ量で」→「使ううえでの主な違いは同じデータ量で」(全文: 「**AAC** と **MP3** はどちらも非可逆圧縮であり、使ううえでの主な違いは同じデータ量でどれだけ音質を保てるかにあって、AAC のほうが有利になりやすい。」71 字) / zh「区别在于同等数据量下」→「使用上的主要区别在于同等数据量下」/ en "the difference lies in how much sound quality" → "the main practical difference lies in how much sound quality" |
| L3 | LOW **建議修** | `terms[2].detail_jp` / `detail_zh` | jp「圧縮で情報を捨てないため」・zh「因为不会因压缩而舍弃信息」は「(WAV の) 圧縮は情報を捨てない」とも読め、loc r1 で en だけ "Because it is not compressed" に直した結果、三語の明確さがずれている。one・tree で無圧縮は明記されており誤学習の危険は小さい | jp「圧縮で情報を捨てないため、保存しても音質は変わらず、編集の素材に向く。」→「圧縮しないので情報が捨てられず、保存しても音質は変わらないため、編集の素材に向く。」/ zh「因为不会因压缩而舍弃信息，保存后音质不变，适合作为编辑素材。」→「因为不经压缩，信息不会被舍弃，保存后音质不变，适合作为编辑素材。」/ en 変更なし |
| L4 | LOW | `terms[2].one_*` vs `overview_rows[2].one_line_*`・`key_points_*[2]`・`terms[2].points[0]` | WAV の one は「主に PCM で」と限定するが、総表・要点・考点は限定なしで言い切る (WAV は ADPCM 等の圧縮データも収められる)。さらに zh「主要用来…保存」/ en "mainly used to store" は「主に」を中身から用途へ移している (a1 r1・a2 loc r2 LOW の残り)。試験水準では誤りではない | 記録のみ |
| L5 | LOW | `terms[4].fig` (tree) / `goals_*[2]` | 根「音声ファイル形式」の子が「圧縮しない」「非可逆圧縮」の 2 枝だけで、音声の可逆圧縮形式 (FLAC 等) の存在が落ちる。単元の 3 形式の分類としては正しく網羅を言い切ってはいない。図が AAC 固有でなく単元全体の分類図である点も記録 | 記録のみ |
| L6 | LOW | `terms[1].points[0]`、`terms[3].points[0]`、`terms[4].points[0]`、`terms[0].hook_*` 前半 | §9: MIDI・MP3・AAC の考点が各 one / detail の言い直し (分類型の題で正の定義を述べる形で写しではない)。PCM hook「測る → 丸める → 書く」は 3 段階の定義の易しい言い換え (後半の C = Code は別の手がかりとして有効) | 記録のみ (考点を具体化すると q064 / q078 の選択肢の組に近づく) |
| L7 | LOW | `overview_rows[4].one_line_*`、`terms[4].one_*`、`terms[4].analogy_*`、`terms[4].points[0]` | 書き方 8: MP3 / AAC の「同じデータ量で AAC が音質を保ちやすい」対比が 4 欄に出る (pairs には無い)。AAC analogy (改良版の道具、同じ重さで多く残す) は one の言い換え (§6) | 記録のみ (AAC の定義の中核で、削ると AAC と MP3 の区別が本文から消える) |
| L8 | LOW | `terms[1].one_*` / `overview_rows[1].one_line_*` / `terms[1].hook_*`、`terms[4].one_jp` vs `overview_rows[4]`・tree 根 | MIDI の伝送範囲が「電子楽器とコンピュータの間」/「機器の間」/「もともと楽器と楽器」と欄ごとに少しずつ違う (限定語なし、矛盾ではない)。AAC は one で「音声形式」、総表・図で「ファイル形式」(厳密には符号化方式) | 記録のみ |
| L9 | LOW | `terms[4].detail_zh` / `detail_en` | jp「音楽配信サービス」(ダウンロード販売を含む配信全般) を zh「音乐流媒体服务」/ en "music streaming services" と狭めている (a2 loc r2 LOW の残り)。用例の列挙で学習上の影響は小さい | 記録のみ (直すなら zh「音乐流媒体服务」→「音乐分发服务」/ en "music streaming services" → "music distribution services") |

**対比の出現欄 (書き方 8 の列挙)**: ① PCM = 波形 / MIDI = 演奏情報: `pairs[0].rows[0]` (key)、MIDI one (定義そのもの)、goals[1] (予告) → 許容。② データ量 大 / 小: `pairs[0].rows[1]`、MIDI detail → 2 箇所で許容。③ 音源で変わる / 変わらない: `pairs[0].rows[2]`、MIDI detail・analogy・key_points[1] (片側だけ) → 許容 (L1 は言い過ぎの別件)。④ WAV 無圧縮 / MP3 非可逆: `pairs[1].rows[0]`、tree、overview_rows の extra (D-195 §3 の構造) → 許容。⑤ 非可逆 / 可逆: MP3 points[1] のみ → 許容。⑥ MP3 / AAC → L7。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `source_figures[0]` (2010h22a-q085 のランレングス図) と `source_figures[1]` (2012h24a-mqC の 8×8 白黒画像図) は v1 からの継承で、いずれも u06 / u03 の内容。`apps/web/src/components` / `src/app` に `source_figures` を描画するコードは無く (参照は validate / types / テストのみ)、学習者には見えない。a1 MEDIUM (q085) の本文側は解消済み。
- O2 AAC は `hook_*` を持たない (validate 0、summary.memory_hooks は 4 件で整合)。
- O3 challenge 3 題のうち q064・q078 は quiz と重複 (未引用の確認題は q079 のみ)。下限 3 は満たす。
- O4 translations に `stem_jp_clean` が無いため raw stem で照合した。topic 20 題の stem に OCR 損傷は見当たらない。

確認済みで問題なし: a1 MEDIUM 2 件・loc r1 MEDIUM 2 件の解消 (三語、退行なし)、限定条件 (exam 考点 2 件とも保持)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤63 字)、D-198 写し (copy guard 0、独立照合 遮蔽あり / なし 0、近似候補 0、choice-echo 0)、`[[jp:]]` 原語 (8 種全て jp 本文に実在)、zh 訳語表、図種 (flow steps ×1 / tree static ×1 / 図なし ×3 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、データ量計算 (再計算一致)、同 topic u01 / u03 / u04 / u06 との整合。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 3: L1〜L3 / 記録のみ 6: L4〜L9) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 6 件 (qid 付き 2 件)・引用 2 題 + 未引用の challenge 1 題 (q079) で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。a1 の MEDIUM 2 件 (データ種別への割り当て文 / 本単元で解けない challenge q085) は三語とも解消、loc r1 の MEDIUM 2 件も解消し退行なし。LOW 建議修 3 件 (L1〜L3) は補丁 (B3) で修正推奨、L4〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-20-52-u02
✓ technology-20-52-u02 unit: 0 issues (data/ip/textbook/units/technology-20-52-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-20-52-u02
✓ technology-20-52-u02 parity: 24 locations, 0 diff
EXIT=0
```
