# Rule A 全数抽検 — technology-20-52-u01 (マルチメディアの基礎・配信・権利保護)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 補丁案の試験適用は scratchpad の複製で行った)。
- **Date**: 2026-11-08 (S151 b68)、repo HEAD `b72a24ee` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b68-u01-a2` merge 結果、sha256 先頭 `7834ecf3bc9c1ee8`)。
- **対象**: `data/ip/textbook/units/technology-20-52-u01.json` (textbook-unit-v2)、用語 **8 / 8 = 全数** (マルチメディア / Webコンテンツ / ハイパーメディア / エンコード / デコード / ストリーミング / DRM / CPRM) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/technology-20-52-u01/v1-original.json` (用語 8 語・`term_zh`・`term_en` とも v1 と一致)。先行指摘: `journal.b68-u01-a1.jsonl` (jp-review r1 / r2 = REVISE) と `journal.b68-u01-a2.jsonl` (jp-review r1 PASS、loc-review r1 PASS)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 8 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0、validate の compat も 0)。
2. **考点 × 引用題 (考点 全 8 件 = exam 5 + mix 3、うち qid 付き 6 件 [mix の Webコンテンツ考点を含む]、引用 qid 6 題)**: `data/ip/quiz/questions.json` から各題の題文・選択肢・`correct_answer` を再読 (stem_jp_clean のある題はそれで判定; 全題 topic `technology-20-52`)。考点の主張が正答と一致し、誤答肢を支持せず、題が支持しない一般化・限定をしていないことを 1 件ずつ確認。
3. **quiz / challenge_questions** (quiz 計 6 枠 [エンコード・デコードは 0 枠] + challenge 5 題 = 全て本文で引用済み): 本文と矛盾しないことを確認。
4. **D-198 写し**: validate の copy guard = 0 件、`warn  choice-echo` 出力なし。独立照合として単元の JP 文字列 117 本 (派生フィールド除く、図ラベル・caption・総表・対比表を含む) を topic 内全 20 題の題文 (stem_jp_clean + 原文) + 選択肢と 12 字連続照合 (句読点・記号・空白除去) を **カタカナ 4 字以上・英数の遮蔽あり / なし** の 2 通りで実施 → 遮蔽ありで 0 件、遮蔽なしで 2 件 (`terms[1].points[0]` ↔ 2021r03-q087 の「プロポーショナルフォント」= 用語名、`terms[6].hook_jp` ↔ 2015h27a-q046 の「Digital Rights Management」= 略語の正式名) で全て偽陽性。**近似一致** (14 字窓・編集距離 ≤2 = ed ≤0.14) は同じ 2 箇所の用語名・正式名のみ。正答肢に最も近い考点の bigram Dice は 0.16〜0.30 (ハイパーメディア ↔ 2020r02o-q080 エ 0.16、ストリーミング ↔ 2015h27h-q076 エ 0.22、オーサリング ↔ 2009h21a-q080 ア 0.23、プロポーショナル ↔ 2021r03-q087 題文 0.23、DRM ↔ 2015h27a-q046 イ 0.29、CPRM ↔ 2018h30h-q084 題文 0.30) で、校正値 (HIGH 例 Dice 0.52) を大きく下回る。カタカナの多い文 (Webコンテンツ・ストリーミング・DRM・CPRM の考点) は目視でも題の語順・選択肢の組をなぞっていない。
5. **D-208 既知の失敗型**: (1) 選択肢なぞり — 2021r03-q087 (正答 = 文字ごとに幅が違うフォント) の考点はプロポーショナル / 等幅を両側とも正の定義で述べる 2 語対比で、選択肢 4 つの組 (アウトライン / 等幅 / ビットマップ / プロポーショナル) も順序 (考点はエ→イの順) もなぞらない → D-209 の除外に当たり (iii) ではない。DRM 考点「一つの方式の名前ではなく」は誤答肢の場面 (圧縮方式・記述言語・音響規格) を再演していない。他の考点は正答内容の一般定義。(2) 「など」落ち — 2018h30h-q084 の「DVD-R や SD カードなど」は単元で「書き込みのできる記録メディア」と一般化され範囲を閉じない。マルチメディア one「文字・音声・静止画・動画など」保持。(3) 別名の別物扱い — なし (逆向きの多義語の問題は L1)。(4) 比喩・図の範囲 — L5 / L6 (いずれも LOW)。(5) zh / en への退行 — a1 で直した 3 点 (§2-1) は zh / en でも解消済み。(6) zh / en の訳語が誤答肢に読める — なし。(7) 改正前の規定 — 該当題なし。(8) 比喩の鍵語が他の見出し語 — DRM の「鍵付きの貸し会議室」の「鍵」は暗号の鍵と同語だが DRM の手段に暗号化が含まれ矛盾しない。(9) フックを引用題に当てた結果 — CPRM フック (RM = Recordable Media) は 2018h30h-q084 で正答を選ばせ、ハイパー / stream / DRM のフックも誤答へ導かない。(10) 法令・標準の閉じた列挙 — なし。
6. **D-195**: 結論先行 (one = 1 文 × 8、太字あり)、展開 2 文 × 8、比喩・フックが定義の言い換えでないこと (定食・雑誌・路線図・荷造り / 荷解き・回転寿司・貸し会議室・回数券; フックは語源)、定義前使用 (リンク = one の括弧注、HTML / ハイパーテキスト = detail で定義、符号 = one の括弧、圧縮 = エンコード detail、伸長 / コーデック = デコード detail、可逆 / 非可逆圧縮 = 考点内で定義、バッファ = detail で定義し図では「一時的な記憶領域」、ダウンロード方式 = 考点内で定義、コピーワンス = detail の括弧前に意味; 例外は DRM 図の CPRM [L4] と、エンコード detail の MP3 [後続単元 u02 の見出し語、ファイル形式の例として名前のみ])、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → ハイパーメディア `hook_jp` の「と覚える」1 件 [+ 派生 `summary.memory_hooks_jp[2]`] のみ、記憶フックの言い方で定型締め句ではない。zh・en 相当語 [必须 / 考试 / 重点 / 记住 / must / exam / always / important / remember] の grep ヒットは every 内の very・example 内の exam・`kind: exam` のみで偽陽性)、図の型 (マルチメディア・DRM = static tree、デコード・ストリーミング = flow steps 4/4、Webコンテンツ・ハイパーメディア・エンコード・CPRM = 図なし; 全て登録内)、pair 配置 (3 組、各組 key 行あり)。
7. **D-200**: 考点数 1 × 8 (≤3 ✓)、各 JP 文数 1〜2・字数 50〜75 (≤100 ✓、最大はエンコード `points[0]` の 75 字)。**framing 件数** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0 (上限 2)。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の「〜だけ」「〜ではない」「完全に」「多い」の照合: エンコード考点「元の形式へ戻せる」とデコード考点「非可逆圧縮は一部の情報を捨てる」/ pairs[1]「元の形式へ」は「形式」で揃い、データの完全復元を言わない; `key_points_jp[1]`・デコード図 step 1 caption・pairs[1].rows[1] はいずれも「多い / 多くの場合」で圧縮を限定; ストリーミング考点「この点が異なる」は違いを 1 点に閉じない) → 不整合 0。書き方 8 (対比の出現欄を列挙) → L7。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → 定義の言い換えの比喩なし。§9 言い直し → L8。
9. **同 topic 他単元との整合** (同 session に merge 済みの u02 / u03 / u04 / u06 を grep): 可逆 = 伸長で完全に戻る / 非可逆 = 捨てた情報は戻らない (u02 MP3・u04 JPEG / pairs[0]・u06 可逆圧縮 / 非可逆圧縮) と本単元デコード考点は一致。MP3 = 非可逆圧縮の音声形式 (u02) と本単元のエンコード例は一致。「符号化」= 規則に従って符号へ (u02 PCM の第 3 段は 0 と 1 の並びで表すこと) は本単元の一般定義の特殊例で矛盾しない。伸長の別名が u01「解凍」/ u06「展開」と違う (L9)。u03 に関連語なし。
10. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・caption・比較行の三語一致、`[[jp:…]]` 原語 16 種 (マルチメディア / オーサリングソフト / Webコンテンツ / プロポーショナルフォント / 等幅フォント / ハイパーメディア / ハイパーテキスト / エンコード / 符号化 / 暗号化 / デコード / 復号 / 可逆圧縮 / 非可逆圧縮 / ストリーミング / ダウンロード方式) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` = カタカナ 6 用語で全てあり、DRM / CPRM は見出し語が全言語同じラテン文字略語で `term_zh` 形 (「DRM（数字版权管理）」等) を使う (validate 0)、zh 訳語が `zh_terms.json` に従うこと (编码 / 解码 / 流式传输 / 超媒体 / 多媒体 / Web 内容 / 加密 / 无损压缩 一致、B6 warn 0)。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。建議修 L1〜L3・L10・L11 を scratchpad の複製に当て (派生 `definition_*` も再生成) validate 0 issues / parity 0 diff を確認済み。

## 2. 用語別判定 (8 / 8)

### 2-1. 先行 MEDIUM の解消確認 (a1 jp-review r1 / r2)

| 先行指摘 | 現在の本文 (jp / zh / en) | 判定 |
|---|---|---|
| a1-r1 M: `terms[3].points[0]`「形式が分かれば元に戻せる」(非可逆圧縮と矛盾する言い過ぎ) | jp「エンコードしたデータは、鍵がなくても形式の規則に従えば**元の形式へ**戻せる」/ zh「恢复成原来的形式」/ en "returned to its original form" — 戻る先を「形式」に限り、データの完全復元を言わない。デコード考点 (非可逆は情報を捨てる) と矛盾しない | 解消 |
| a1-r2 M: 同考点 2 文目でエンコードが「元の形式へ戻す」主語になり向きが逆 | 主語は「エンコードしたデータは」(zh「经过编码（[[jp:エンコード]]）的数据」/ en "Encoded ([[jp:エンコード]]) data") で、戻す処理の対象が明示。**向きを全欄で照合**: one (データ→符号) / pairs[1].rows[0] (元の形式→符号 / 符号→元の形式) / rows[2] (保存・送信の前 / 再生・表示の前) / デコード one・図 nodes・steps 1〜4 / key_points[1] / overview_rows[3][4] / hook (en- 入れる / de- 外す) / analogy (荷造り / 荷解き) / detail (MP3 にする = エンコード、再生アプリがデコード) / goals[1] — 三語とも逆転 0 | 解消 |
| a1-r1 M: `terms[1].points[0]`「Webページの文字表示では」(引用題にない場所の限定) | jp「文字ごとに幅が変わるフォントを…、全文字が同じ幅のフォントを…という」/ zh・en も場所の限定なし (grep「Webページの文字」0 件) | 解消 |
| a1-r1 M: `terms[5].fig.steps[1]/[3]` がバッファを定義前に使用 | 図の nodes / captions は「一部をためる」「一時的な記憶領域」(zh 临时存储区 / en temporary storage area)、バッファ / 缓冲区 / buffer は detail の定義文にのみ出現 (grep 確認) | 解消 |

### 2-2. 用語別

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | マルチメディア | OK — exam 1 / 1 題: 素材 (文字・画像・音声など) を配置して作品に仕上げる制作ソフト = オーサリングソフト (2009h21a-q080 正答ア = 複数素材を組み合わせ編集してコンテンツ作成; 誤答 = 検索・アイコン表示・著作権登録 を支持しない)。「など」保持。one / detail (0 と 1 で表すので組み合わせられる) は正しい | OK (図は one の列挙の枝分け = L6) | OK | L6 |
| 2 | Webコンテンツ | OK — mix 1 / 1 題: 文字ごとに幅が変わる = プロポーショナル、全文字同幅 = 等幅 (2021r03-q087 正答エ)。題は表示・印刷一般を問い、考点も場所を限らない (a1 の M 解消)。題文の目的句 (読みやすくするため) を落としても主張の範囲は狭まらない。HTML の説明 (文書の構造を記述する言語) は正しい | OK (D-209 除外、§1-5) | OK | L8 (考点と見出し語の結び付きが弱い) |
| 3 | ハイパーメディア | OK — exam 1 / 1 題: ハイパーテキスト = 文書に埋め込んだリンクから関連情報へ移れる仕組み、対象を画像・音声へ広げたもの = ハイパーメディア (2020r02o-q080 正答エ = 文中の任意の場所に埋め込んだリンクで関連情報をたどれる; 誤答 = 数式・図形編集・テンプレート を支持しない)。detail (順に読む本と違い道筋を選べる、Web はこれを広く実現した例) は正しい | OK | OK | L8 (考点前半が detail の言い直し) |
| 4 | エンコード | OK — mix (qid なし): 暗号化は秘匿が目的で戻すには鍵が要る / エンコードしたデータは鍵なしで形式の規則に従えば元の形式へ戻せる (§2-1)。detail「圧縮を行うことが多く」(限定あり)、MP3 化 = エンコードは正しい (u02 と一致)。hook の en- (中に入れる・〜にする) は語源として妥当 | OK | OK | L1 (デコード側の別名と対) |
| 5 | デコード | OK — mix (qid なし): 可逆圧縮 = 伸長で完全に戻る / 非可逆 = 一部情報を捨てて大きく減らす (u06 の見出し語定義と一致)。detail: 伸長 (解凍)、再生アプリが受信データをデコードしてから表示、コーデック = エンコードとデコードを担うソフト・装置 — 正しい。one の別名「復号」は符号理論の用法として正しいが、暗号の「復号」(technology-23-63-u06 の見出し語、鍵が要る) と同語で、本単元エンコード考点が「暗号化は戻すのに鍵が要る」と対比しているため取り違えやすい → L1。flow steps 4 (変換・多くは圧縮 → 保存・送信 → 元の形式へ・圧縮されていれば広げる → 再生・表示) は one / pairs と向き一致 | OK | OK | **L1 建議修**, L5 |
| 6 | ストリーミング | OK — exam 1 / 1 題: 一部が届いた時点で再生を始められ、全体到着後に再生するダウンロード方式と異なる (2015h27h-q076 正答エ)。誤答の支持なし: ア (生中継不可) — 本文に記述なし / イ (欠落による画質悪化を完全排除) — 記述なし / ウ (準備時間なしで瞬時に開始) — detail・図「少し先の分をためておく」「ためた分から再生」が準備 (バッファリング) を示し、むしろ否定する。「この点が異なる」は違いを 1 点に閉じない | OK | en 図ラベル "bit by bit" (L2) | **L2 建議修** |
| 7 | DRM | OK — exam 1 / 1 題: 一つの方式名ではなく、著作権者を守るためコピーや再生などの使い方を技術で制限する方式の総称 (2015h27a-q046 正答イ = 著作権を保護し利用・複製を制限する技術の総称; 誤答 = 圧縮方式・データ放送記述言語・音響規格 を支持しない)。detail の手段は「例えば」付き (D-205 対象外だが列挙を閉じない)。図 tree (手段の例 3 / 個別方式の例 CPRM) は detail・pairs[2] と一致 | OK | zh「都」/ en 全称 (L11) | **L11 建議修**, L4, L7, L8 |
| 8 | CPRM | OK — exam 1 / 1 題: 記録メディア向けの著作権保護技術で、例えば 1 回だけの複製を認める条件付きコンテンツを条件どおりに記録させる (2018h30h-q084 正答イ; 題の「一度だけ複製を許容」は「例えば」で例として保持し、CPRM を 1 回限りに閉じない [ダビング 10 等とも矛盾しない])。「DVD-R や SD カードなど」は「書き込みのできる記録メディア」で一般化。detail「記録内容は暗号化され非対応機器では再生できない」は正しい | OK | zh「严格」/ en "strictly" は jp「その条件どおりに」にない強調 (L3) | **L3 建議修**, L5 |

**単元レベル**: goals 3 点・overview_cols 1 (役割)・overview_rows 8 行・pairs 3 組 (マルチメディア / ハイパーメディア 2 行 key 1、エンコード / デコード 3 行 key 1、DRM / CPRM 2 行 key 1)・key_points 4 (`[1]` は「多く」で限定済み = a1-r2 の low 解消)・summary (記法除去版と一致)・challenge_questions 5 件 (2009h21a-q080 / 2020r02o-q080 / 2015h27h-q076 / 2015h27a-q046 / 2018h30h-q084 — 全て本文で引用済み、矛盾なし)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 11 (うち 建議修 5: L1 / L2 / L3 / L10 / L11)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[4](デコード).one_jp` / `one_zh` / `one_en` (+ 派生 `definition_jp/zh/en`) | デコードの別名「復号」は符号理論の用法として正しいが、暗号の「復号」(technology-23-63-u06 の見出し語「暗号文を鍵を使って元の平文に戻す処理」、zh_terms でも 復号 → 解密) と同じ語で、直前のエンコード考点が「暗号化は戻すのに鍵が要る / エンコードは鍵なしで戻せる」と対比するため、「復号 = 鍵不要」と結び付けるおそれがある (a1-r1・a1-r2・a2-r1 の三度の low 指摘)。誤答を選ばせる引用題・全題中の該当題はない (全 2900 題 grep: デコード / 復号の取り違えを問う題なし) ため LOW | jp before「**デコード** とは、エンコードされたデータを、再生や表示ができる元の形式に戻すことで、**復号** ともいう。」→ after「**デコード** とは、エンコードされたデータを、再生や表示ができる元の形式に戻すことで、**復号** ともいう (暗号を解く意味の「復号」とは別の処理)。」 (本単元で未定義の「暗号文」を使わない言い方)/ zh before「…日语中也称作 [[jp:復号]]。」→ after「…日语中也称作 [[jp:復号]]（但在密码学中这个词指“解密”，是不同的处理）。」/ en before "…; in Japanese it is also called [[jp:復号]]." → after "…; in Japanese it is also called [[jp:復号]], though in cryptography the same word means decryption, a different process." |
| L2 | LOW **建議修** | `terms[5](ストリーミング).fig.data.nodes[0].label.en` | "Sender sends bit by bit" は IT 教材では bit = ビット (1 ビットずつ送る) と読まれやすい (loc-review r1 low、未反映)。jp「少しずつ」/ zh「一点点」は問題なし | en before "Sender sends bit by bit" → after "Sender sends in small pieces" |
| L3 | LOW **建議修** | `terms[7](CPRM).points[0].text_zh` / `text_en` | jp「その条件どおりに記録させる」に対し zh「严格按照」/ en "strictly" が強調を足し、en は make + O + get + p.p. の入れ子で読みにくい (loc-review r1 low、未反映) | zh before「…会让设备严格按照该条件进行录制。」→ after「…会让设备按照该条件进行录制。」/ en before "…makes content allowed to be copied only once get recorded strictly under that condition." → after "…ensures content permitted to be copied only once is recorded in line with that condition." |
| L4 | LOW | `terms[6](DRM).fig.data.root.children[1].children[0].label` | 次の用語で定義される CPRM が DRM の図に先に出る (定義前使用)。「(記録メディア向け)」の添え書きと総表の一句があり実害は小さい | 記録のみ |
| L5 | LOW | `terms[4].analogy_*`、`terms[7].analogy_*` | デコードの「畳んだ荷物を広げて使える状態に」は元どおりに戻る像で、非可逆圧縮 (考点) では完全には戻らない — ただし「使える状態」と言うだけで完全復元を言わず考点と衝突しない。CPRM の回数券「使える回数」は再生回数の制限にも読めうる (detail・考点は複製条件のみ) が、2018h30h-q084 の誤答 (AR / HDMI / MIDI) へは導かない | 記録のみ |
| L6 | LOW | `terms[0](マルチメディア).fig` | static tree の子 4 つ (文字・音声・静止画・動画) は one の列挙 (「など」付き) の枝分けで、定義以上の関係を示さない飾りに近い (D-195 §2)。枝に「など」がない | 記録のみ |
| L7 | LOW | `pairs[2]` / `terms[6].fig` / `terms[6].points[0]` / `goals_jp[2]`、`pairs[1]` / `key_points_jp[1]` / `terms[4].fig.steps` | 書き方 8: DRM (総称) / CPRM (個別方式) の関係が pairs[2]・DRM 図・DRM 考点 (「一つの方式の名前ではなく」は対比を明示しない)・goals で、エンコード / デコードの向きが pairs[1]・key_points[1]・デコード図で繰り返される。goals は予告、図は構造で、反復の中核は 2 箇所以内 | 記録のみ |
| L8 | LOW | `terms[6].points[0]`、`terms[2].points[0]`、`terms[5].points[0]`、`terms[1].points[0]` | D-203 §9: DRM 考点は one (総称) の言い直し (「一つの方式の名前ではない」に意味あり)、ハイパーメディア考点前半は detail のハイパーテキスト定義の言い直し、ストリーミング「全体を待たず再生」は one・detail・考点・key_points[2] の 4 箇所。Webコンテンツ考点 (フォント) は one〜hook のどこにもフォントへの言及がなく見出し語との結び付きが弱い (題の terms 付与による配置) | 記録のみ |
| L9 | LOW | `terms[4].detail_jp`「**伸長** (解凍)」 vs technology-20-52-u06 `terms[0].detail_jp`「**伸長** (展開)」 | 同 topic 内で伸長の別名が単元ごとに違う。どちらも正しい用法で矛盾ではない。zh / en は 解压缩 / decompression で別名が落ちる (意味は保たれる) | 記録のみ |
| L10 | LOW **建議修** | `overview_rows[2](ハイパーメディア).one_line_en` | 独立分詞 "images and sound included" がぎこちない (loc-review r1 low、未反映)。jp / zh は問題なし | en before "A scheme that links information, images and sound included, so users can move back and forth" → after "A scheme that links information, including images and sound, so users can move back and forth between it" |
| L11 | LOW **建議修** | `terms[6](DRM).detail_zh` / `detail_en` 1 文目 (+ 派生 `explanation_zh/en`) | jp「配信される音楽・動画・電子書籍では技術による保護が使われる」は傾向の記述だが、zh「都采用技术保护」(都 = 全て) / en "rely on technical protection" は全ての配信物が技術保護を使うと読める全称の言い過ぎ (zh / en が jp より強い、L3 と同型)。2015h27a-q046 の誤答は支持せず他欄とも衝突しない | zh before「…音乐、视频和电子书都采用技术保护。」→ after「…音乐、视频和电子书通常采用技术保护。」/ en before "…music, video and e-books delivered online rely on technical protection." → after "…music, video and e-books delivered online often rely on technical protection." |

**記録のみの補足 (loc-review r1 の未反映 low で本監査も記録のみとするもの)**: `overview_rows[3][4].one_line_zh/en` の括弧「（编码）」「（解码）」/ "(encoding)" "(decoding)" が見出し語訳と同語で情報を足さない; zh の「代码」(符号) がソースコードの意味に寄る (`terms[3].one_zh` / `pairs[1].rows[0].a_zh/b_zh` / hook_zh); zh の間隔号「·」(`terms[4].fig` nodes・`terms[6].fig`); `terms[3/4].one_en` の **Encoding / Decoding** と `term_en` Encode / Decode の語形差 — いずれも誤りではなく誤答へ導かない。

**対比の出現欄 (書き方 8 の列挙)**: ① マルチメディア = まとめて扱う / ハイパーメディア = リンクでたどる: `pairs[0].rows[0..1]`、各 one (定義そのもの)、goals[0] (予告) → 許容。② エンコード / デコードの向き: `pairs[1].rows[0]`・`rows[2]`、`key_points_jp[1]`、デコード図 (構造)、hook 2 つ (en- / de- は D-195 §6 の対比の手がかり) → L7。③ 圧縮 / 伸長: `pairs[1].rows[1]`、各 detail (用語自身の定義) → 許容。④ DRM / CPRM: `pairs[2]`、DRM 図、DRM 考点、goals[2] → L7。⑤ 暗号化 / エンコード (鍵の要否): エンコード考点のみ → 許容。⑥ 可逆 / 非可逆: デコード考点のみ (u06 の見出し語) → 許容。⑦ ストリーミング / ダウンロード方式: ストリーミング考点のみ → 許容。

確認済みで問題なし: a1 の MEDIUM 3 件 (エンコード考点 ×2 文・フォント考点の場所限定・バッファの定義前使用) の三語での解消と退行なし (§2-1)、エンコード / デコードの向き (全欄・三語で逆転 0)、限定条件 (考点 8 件全て保持)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤75 字)、図の文字列の写し (validate 0、独立照合は用語名・正式名の偽陽性のみ)、`[[jp:]]` 原語 (16 種全て jp 本文に実在)、zh 訳語表 (B6 warn 0)、図種 (static tree ×2 / flow steps ×2 / 図なし ×4 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、同 topic u02 / u04 / u06 との事実整合。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **11** (建議修 5: L1 / L2 / L3 / L10 / L11 / 記録のみ 6: L4〜L9) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 8 用語・考点 8 件 (qid 付き 6 件)・引用 6 題 (quiz / challenge は全て引用題と同じ) で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。a1 の MEDIUM 3 件は jp / zh / en とも解消し、エンコード / デコードの向きは全欄で正しい。LOW 建議修 5 件 (L1 / L2 / L3 / L10 / L11) は補丁 (B3) で修正推奨 (scratchpad 複製で適用 → validate 0 issues / parity 0 diff 確認済み)、L4〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-20-52-u01
✓ technology-20-52-u01 unit: 0 issues (data/ip/textbook/units/technology-20-52-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-20-52-u01
✓ technology-20-52-u01 parity: 34 locations, 0 diff
EXIT=0
```

建議修 L1 / L2 / L3 / L10 / L11 適用後の複製 (派生 `terms[4].definition_*`・`terms[6].explanation_*` 再生成込み、scratchpad):

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --file <scratchpad>/u01_patched.json
✓ technology-20-52-u01 unit: 0 issues
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --file <scratchpad>/u01_patched.json
✓ technology-20-52-u01 parity: 34 locations, 0 diff
EXIT=0
```
