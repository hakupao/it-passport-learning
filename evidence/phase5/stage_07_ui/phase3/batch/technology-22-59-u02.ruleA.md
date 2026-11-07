# Rule A 全数抽検 — technology-22-59-u02 (TCP/IPとWebプロトコル)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / jp-review / localiser / loc-review) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成、照合スクリプトは scratchpad)。
- **Date**: 2026-11-08 (第 47 批 b47)、repo HEAD `50314ed8` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b47-u02-a1` merge 結果、sha256 先頭 `d0864a2d26adeef4`)。
- **対象**: `data/ip/textbook/units/technology-22-59-u02.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (TCP/IP / UDP / ポート番号 / HTTP / HTTPS) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/technology-22-59-u02/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。前回指摘: `journal.b47-u02-a1.jsonl` (jp-review r1 REVISE = MEDIUM 2 + LOW 4、r2 PASS = LOW 10、loc-review r1 PASS = LOW 5)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 10 件 = exam 8 + mix 2、qid 付き 8 件、引用 qid 延べ 12 件 = 異なり 11 題)**: manifest の題文・選択肢・`correct_answer` を再読し、OCR 損傷の可能性がある題は `translations/<exam>.json` の `stem_jp_clean` で確認 (topic `technology-22-59` 全 34 題)。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化・限定をしていないこと、限定条件を外していないことを 1 件ずつ確認 (§2)。
3. **quiz / challenge_questions** (quiz 計 7 枠 = TCP/IP 2・UDP 0・ポート番号 2・HTTP 1・HTTPS 2、challenge 5 題 = 2010h22h-q080 / 2015h27a-q077 / 2016h28h-q056 / 2013h25a-q073 / 2020r02o-q067、全て考点で引用済み → 未引用 0): 本文だけで解け、本文と矛盾しないことを確認。2010h22a-q065 (穴埋め a = HTTP、b = TCP) は HTTP の one・points[0] と detail (下位の TCP) で解ける。
4. **D-198 写し**: validate の copy guard = 0、`warn choice-echo` = 0 行。独立照合として単元の JP 文字列 108 本 (派生フィールド除く) を topic 内全 34 題の題文 (stem_jp_clean 優先) + 選択肢と 12 字連続照合 (句読点・記号・空白除去)。
   - カタカナ 4 字以上と英数を □ に遮蔽 (遮蔽後の実字 6 未満の窓は除外): **0 件**。
   - 遮蔽なし: **2 件** — `overview_rows[4].extra_jp[1]` ↔ 2015h27h-q083 題文 (「URL が https:// で始ま」= URL の書式の定型表現、偽陽性) / `terms[3].points[0].text_jp` ↔ 2010h22a-q065 題文 (「で Web ページを閲覧する」) → L4。
   - 近似一致 (文単位の Dice / 正規化編集距離、HIGH 較正 = ed 0.14 / Dice 0.52): 最大 Dice 0.57 / ed 0.92 は図セル「イーサネット、無線 LAN」↔ 2020r02o-q067 誤答エ (用語名、偽陽性)。他は全て Dice ≤0.47・ed ≥0.58。個別: HTTPS points[0] ↔ 2012h24h-q080 正答イ 0.31 / 0.80、TCP/IP points[0] ↔ 2015h27a-q077 正答エ 0.32 / 0.90、ポート番号 points[0] ↔ 2020r02o-q067 正答ウ 0.29 / 0.85、TCP/IP points[1] ↔ 2023r05-q068 題文 0.15 / 0.88 → いずれも較正値に遠い。
   - カタカナの多い文 (図の層名・ポート番号の caption・overview) を目視: 題文・選択肢の流用なし。
   - (iii) 選択肢なぞり (D-208 (1)): 誤答肢だけを打ち消す考点・選択肢の組や順序の再現・誤答場面の再演は無い。ポート番号 points[0] は 3 題の誤答 (機器・コンピュータを識別する値) にあたる内容を IP アドレスの正の定義として対置 (D-209 の両側正定義、誤答肢の語句・組・順序は再現しない)。HTTP points[1] (HTML / HTTP) は 2011h23a-q077 誤答アと同じ取り違えを両側正定義で述べ qid なし (D-209)。HTTPS points[2] は 2015h27h-q083 の正答 (双方向) を一文で述べ、誤答 (片方向だけ・設定次第) の組を並べない。2024r06-q092 由来の points[1] は題の場面 (メールと Web の 2 機能) を使わず「複数のサービス」に一般化。
5. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、detail 2〜3 文、比喩・フックが定義の言い換えでないこと (宅配便の部署 / 館内放送 / 会社の部署棚 / 料理の注文 / はがき → 封筒; フックは名前の分解・語源)、定義前使用 (通信プロトコル = TCP/IP detail、階層 = one、ポート番号 = UDP points[0] で先に使用 → L9、IP アドレス = 前提単元 u01 + TCP/IP detail、SSL/TLS = HTTPS detail、電子証明書 = 同 detail の中で使用)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh・en 相当語) → jp は `unit_summary_jp` の「押さえ」1 件のみ (v1 と同文の未改稿フィールド、O1)。en の must (UDP detail「must be dealt with」・HTTPS detail「must not see」)・very (deliver**y** 等の部分一致) は通常の用法で偽陽性。図の型: TCP/IP = static table、UDP = static compare、ポート番号・HTTP = flow steps 3、HTTPS = 図なし → 全て登録内。pair 配置: HTTP / HTTPS は HTTPS の後、key 行あり。
6. **D-200**: 考点数 2/1/2/2/3 (≤3 ✓)、各 JP 文数 1〜2・字数 41〜91 (≤100 ✓、最大は TCP/IP `points[1]` の 2 文 91 字)。**framing 件数** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0 (上限 2)。D-197 羅列: validate 0 (TCP/IP detail の 4 層列挙は「4 階層」の分類数の例外、図セルのプロトコル例は図)。
7. **D-205 / D-210 (層の数・ポート番号・プロトコルの版) — 一次資料で確認**:
   - **4 階層**: RFC 1122 §1.1.3 は Internet architecture の層を Application / Transport / Internet / Link の 4 層と定める。単元 detail は「一般に…4 階層で表される」と限定語つきで、層名 (ネットワークインタフェース層 = RFC の Link Layer) は IPA シラバスの呼び方。OSI 7 層同様に改正される文書の構成数ではない (D-205 の対象外) が、いずれにせよ一次資料と一致。
   - **0〜65535**: RFC 6335 §6「TCP, UDP, UDP-Lite, SCTP, and DCCP use 16-bit namespaces」、System (Well Known) Ports 0-1023 / User 1024-49151 / Dynamic 49152-65535 → 範囲・「ウェルノウンポート」の呼び名とも一致。
   - **80 / 443**: RFC 9110 §4.2.1「TCP port 80 … is the default」/ §4.2.2「TCP port 443 (the reserved port for HTTP over TLS) is the default」→ 一致 (単元は「通常」「例えば」を付けている)。
   - **HTTP の下位 = TCP**: RFC 9114 (HTTP/3、2022-06) は QUIC 上で動き、RFC 9110 §1.2 は HTTP/3 を「QUIC … over UDP instead of TCP」と記す。`terms[3].detail_jp` の「データを確実に運ぶ部分はトランスポート層の TCP に任せ」は版なしの言い切りで、引用題 2010h22a-q065 (2010 年、HTTP/3 以前) の前提の版を書いていない → L2 (下記)。
   - **SSL/TLS**: 版名は書かず「SSL/TLS」は IPA シラバスの用語 (O2)。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士): TCP/IP の広い意味 (one・図・hook・overview「体系全体 (4 階層)」) と狭い意味 (points[1]) は points[1] が両義を明示して整合 (r1 MEDIUM の解消)。HTTP の analogy「1 回の注文に 1 回の提供」と HTTP 図 steps[1..2]「HTML や画像を…返す…1 往復が終わる」が食い違う → L3。HTTPS analogy の認証の向き → L1。書き方 8 (対比の列挙) → §3 末尾。書き方 9 (限定条件) → §2、落ち 0。
9. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行・caption の三語一致 (parity 26 箇所 0 diff)。`[[jp:…]]` 原語 12 種 (ポート番号 / 階層 / 通信プロトコル / OS / IPアドレス / サーバ / サービス / リクエスト / レスポンス / アプリケーション層 / 暗号化 / 機密性) が jp 本文に実在 (スクリプト、全 ok)。one_zh / one_en: ポート番号は `[[jp:ポート番号]]` あり、他 4 語は英字の見出し語 (TCP/IP・UDP・HTTP・HTTPS) で jp と同表記。zh 訳語: 端口号 / 应用层 / 传输层 / 服务器 / 加密 / 机密性 / 操作系统 / IP 地址 / 口令（密码） が `zh_terms.json` と一致、validate の B6 warn 0。zh「电子证书」(電子証明書は zh_terms 未登録、デジタル証明書 → 数字证书) と「80 号 / 443 号」→ L7。
10. **前回指摘の解消と退行**: jp-review r1 MEDIUM ① `terms[0].points[1]` (TCP/IP をアプリケーション層の下に置く欄間不整合 + 2023r05-q068 題文の流れのなぞり) → 現行は広狭 2 義を明示し、題文の列挙 (Web や電子メールなど) を使わない。zh・en も 2 義を保持 (退行なし)。② `challenge_questions[4]` (u03 の FTP 題 2025r07-q060) → 2020r02o-q067 に差し替え済み (本単元で解ける)。r1 LOW `terms[3].quiz[1]` (SMTP 題 2011h23a-q077) も quiz から外れている。r1 LOW「HTTP detail の暗号化対比」は現行 HTTP detail に暗号化の記述なし (解消)。r2 LOW `terms[4].analogy_jp` (認証の向き) は未対応 → L1。loc-review LOW 5 件は未適用 (L7 に記録)。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | TCP/IP | OK — exam 2 / 3 題: 通信プロトコルは通信の取り決めの集まりで、同じ取り決めに従えば製品・OS の違う機器どうしでも通信できる (2015h27a-q077 正答エ / 2016h28a-q065 正答エ; 限定条件「同じ取り決めに従えば」保持、誤答 [アナログ通信には無い・国際機関制定のものだけ・正常時の手順だけ] を支持しない) / TCP/IP は 4 層の体系全体と、中核の TCP・IP だけの狭い意味があり、狭い意味では用途別プロトコルが共通に頼る下位の通信機能 (2023r05-q068 正答エ; 誤答 FTP・POP・SMTP は考点に並べない)。4 層の表 (層名・役割・例) は RFC 1122 §1.1.3 と一致。analogy (隣の部署とだけ受け渡す) は層の独立性の像で one と矛盾なし | OK (points[1] の題文語句寄り = L6) | OK | L6 |
| 2 | UDP | OK — mix 1 (qid なし): UDP も TCP と同じトランスポート層で、宛先アプリケーションはどちらもポート番号で区別 (RFC 6335 §6 と一致)。one (コネクションレス)・detail (確認・再送なし、欠け・順序はアプリ側、音声・動画向き)・compare 図 3 行 (key = 到達確認と再送) は標準事実どおり。term_questions 0 題で quiz 0 枠 (D-211 経路外、引用題なし) | OK | OK | L9 |
| 3 | ポート番号 | OK — exam 2 / 4 題: ポート番号は機器の中の通信アプリケーションを識別し、機器を識別する IP アドレスとは役割が別 (2009h21a-q055 正答エ / 2010h22h-q080 正答イ / 2020r02o-q067 正答ウ; 誤答 = 物理ポート・機器・コンピュータの識別 → IP アドレス側の正定義として対置、D-209) / 1 台のサーバが複数のサービスを提供していても、ポート番号の指定で使いたいサービスを選べる (2024r06-q092 正答ウ; 題の誤答 IP アドレス・ドメイン・ホスト名を支持しない)。detail 0〜65535・ウェルノウンポート・80 / 443 は RFC 6335 / RFC 9110 と一致。flow steps 3 (IP で機器 → ポートでアプリ) は考点と一致。hook (港 = 入口で町 = アプリが決まる) はアプリ側に結び、誤答の物理ポートへ寄らない | OK | OK | L8 (反復) |
| 4 | HTTP | OK — exam 1 / 1 題 + mix 1: HTTP はアプリケーション層で、Web 閲覧時のブラウザとサーバのやり取りを定める (2010h22a-q065 正答イ a = HTTP; b = TCP は detail が担う) / mix: HTML = 記述言語、HTTP = 運ぶ手順 (2011h23a-q077 誤答アと同じ取り違えを両側正定義で、D-209)。detail の「TCP に任せ」は HTTP/1.1・HTTP/2 では正しいが HTTP/3 (RFC 9114) では QUIC/UDP → L2。flow 図 steps[1..2] が HTML と画像を 1 レスポンス・1 往復で返す像 → L3 | points[0] 題文寄り = L4 | OK | L2 / L3 / L4 |
| 5 | HTTPS | OK — exam 3 / 4 題: HTTPS の目的は SSL/TLS によるサーバ認証と内容の暗号化で Web 通信の安全を確保 (2012h24h-q080 正答イ / 2013h25a-q073 正答ウ; 誤答 = 一括受信の効率化・圧縮・動的生成・二重化・手順の簡略化・商取引の保証 を支持しない) / HTTP → HTTPS で機密性が保たれる (2016h28h-q056 正答ウ; 誤答 = 速度向上・ウイルス感染防止 を支持しない) / 暗号化は双方向 (2015h27h-q083 正答ウ)。detail (電子証明書によるサーバ認証・https://・443) は RFC 9110 §4.2.2 と一致。pairs 4 行も一致。analogy の「差出人の印」は認証の向きが曖昧 → L1 | points[0] 正答肢寄り = L5 | zh 电子证书 = L7 | L1 / L5 / L7 / L8 |

**単元レベル**: goals 3 点・overview_cols 2 (属する層 / 見分ける手がかり)・overview_rows 5 行・pairs 1 組 (HTTP / HTTPS 4 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge_questions 5 件 (全て本文で解ける、§1-3)。overview_rows[2] (トランスポート層、0〜65535) / [3] (通常 80 番) / [4] (https://、通常 443 番) は detail・pairs と一致。key_points[4]「両方向の暗号化とサーバの認証」は HTTPS points[0]・[2] と一致。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 3)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[4].analogy_jp` / `analogy_zh` / `analogy_en` | 「差出人の印も添えてあるので受け取った側は相手を確かめられる」は誰が差出人か曖昧で、HTTP 図の流れ (ブラウザが要求を送る) で読むとサーバがブラウザを確かめる像になり、one_jp・pairs[0].rows[1]・goals[2] の「サーバの認証」と向きが逆に読める (r2 LOW の未対応)。引用・quiz・challenge の 5 題 (2012h24h-q080 / 2013h25a-q073 / 2015h27h-q083 / 2016h28h-q056 / 2010h22a-q065) にクライアント認証を内容とする誤答肢は無く、この像で誤答する題は無い → 観点 7 の像の曖昧さとして LOW (MEDIUM の「否定内容を運ぶ」には至らない) | jp: `はがきで送っていた文面を、封をした封筒に入れて送るようなもの。運ぶ途中の人には中身が見えず、差出人の印も添えてあるので受け取った側は相手を確かめられる。` → `はがきで送っていた文面を、封をした封筒に入れてやり取りするようなもの。運ぶ途中の人には中身が見えず、店 (サーバ) からの封筒には公の証明印が押してあるので、客 (ブラウザ) は相手が本物の店かを確かめられる。` / zh: `就像把原来写在明信片上的内容，改为装进封好的信封里寄出。运送途中的人看不到内容，又附有寄件人的印章，收件方可以确认对方身份。` → `就像把原来写在明信片上的内容，改为装进封好的信封里往来。运送途中的人看不到内容，而且商店（服务器）寄来的信封上盖有公认的证明印章，顾客（浏览器）可以确认对方是不是真正的商店。` / en: `It is like moving a message from a postcard into a sealed envelope. People handling it on the way cannot see inside, and the sender's seal lets the recipient confirm who sent it.` → `It is like moving messages from postcards into sealed envelopes. People handling them on the way cannot see inside, and the envelopes from the shop (the server) carry an officially certified seal, so the customer (the browser) can confirm the shop is genuine.` |
| L2 | LOW **建議修** | `terms[3].detail_jp` / `detail_zh` / `detail_en` 2 文目 (派生 `explanation_*` は自動追従) | 「データを確実に運ぶ部分はトランスポート層の TCP に任せ」が版なしの言い切り。HTTP/3 (RFC 9114、2022-06) は QUIC を使い、RFC 9110 §1.2 は「QUIC … over UDP instead of TCP」と記す。引用題 2010h22a-q065 (b = TCP) は HTTP/3 以前の出題で、D-210 の「題が前提とする版を書く」に当たる。D-205 の対象 (改正文書の構成要素の数・名称) に厳密には入らず (版を名指ししていない)、34 題中この言い切りで誤答する題も無いため LOW。一次資料確認済みなので Rule A 補丁で版を明記できる (S138 §6) | jp: `データを確実に運ぶ部分はトランスポート層の TCP に任せ、通常のポート番号は 80 番を使う。` → `データを確実に運ぶ部分は、HTTP/1.1 や HTTP/2 ではトランスポート層の TCP に任せ、通常のポート番号は 80 番を使う。` / zh: `可靠传送数据的部分交给传输层的 TCP，通常的端口号是 80 号。` → `在 HTTP/1.1 和 HTTP/2 中，可靠传送数据的部分交给传输层的 TCP，通常的端口号是 80 号。` / en: `Reliable delivery of the data is left to TCP at the transport layer, and port 80 is the usual number.` → `In HTTP/1.1 and HTTP/2, reliable delivery of the data is left to TCP at the transport layer, and port 80 is the usual number.` |
| L3 | LOW **建議修** | `terms[3].fig.steps[1].caption_jp/zh/en`、`terms[3].fig.steps[2].caption_jp/zh/en` | 「そのページの HTML や画像をレスポンスとして返す」+「受け取ったデータを組み立てて画面に表示し、1 往復が終わる」は、HTML と画像が 1 回のレスポンス・1 往復で届く像。HTTP では画像などは別のリクエストで取り寄せ、同用語の analogy「1 回の注文に対して 1 回の提供」とも食い違う (観点 7)。HTTP の題で誤答に結びつく選択肢は無く (2012h24h-q080 誤答ア「1 回の接続で全データを効率的に受信」は HTTPS の目的を問う題で、本文の HTTPS 欄が正答イを明示)、簡略化の不正確さとして LOW | steps[1] jp: `サーバは、そのページの HTML や画像をレスポンスとして返す。` → `サーバは、指定されたページの HTML をレスポンスとして返す。` / zh: `服务器把该页面的 HTML 和图片作为响应返回。` → `服务器把所指定页面的 HTML 作为响应返回。` / en: `The server sends back that page's HTML and images as a response.` → `The server sends back the requested page's HTML as a response.` ; steps[2] jp: `ブラウザが受け取ったデータを組み立てて画面に表示し、1 往復が終わる。` → `ブラウザが受け取ったデータを画面に表示し、1 往復が終わる。画像などは、同じ往復をくり返して取り寄せる。` / zh: `浏览器把收到的数据组装后显示在画面上，一次往返结束。` → `浏览器把收到的数据显示在画面上，一次往返结束。图片等内容通过重复同样的往返来获取。` / en: `The browser assembles the data on screen, and one round trip is complete.` → `The browser displays the data it received, and one round trip is complete. Images and other files are fetched by repeating the same round trip.` |
| L4 | LOW | `terms[3].points[0].text_jp` | 2010h22a-q065 の題文を空欄 a = HTTP で埋めた第 1 文 (Web ページを閲覧する場合、ブラウザと Web サーバが a を使う) を同じ順で平叙化しており、遮蔽なし 12 字照合で「で Web ページを閲覧する」が一致 (遮蔽後 0、Dice 0.43 / ed 0.70 で HIGH 較正に遠い)。比較相手 (b = TCP、下層の IP) は考点に並べず、内容は見出し語の一般定義 (D-209) | 記録のみ (任意: 「Web ページを閲覧するときの」→「Web ページを表示する際の」) |
| L5 | LOW | `terms[4].points[0].text_jp/zh/en` | 2012h24h-q080 正答イ (サーバの認証とデータの暗号化で通信のセキュリティを確保) を語順どおり語の置き換えで述べ、問い方「目的」も残る (r2 LOW と同判断)。Dice 0.31 / ed 0.80、誤答肢の組・順序はなぞらず、HTTPS の標準定義 | 記録のみ |
| L6 | LOW | `terms[0].points[1].text_jp/zh/en` 2 文目 | 「用途ごとのプロトコルが共通に頼る下位の通信機能」は 2023r05-q068 題文の記述 (アプリケーション層のプロトコルの下位で、基本的な通信機能として共通に使われる) の語 (下位・共通・通信機能) を使う。分類題の正答を見出し語の定義として述べたもので (D-209)、選択肢 (FTP・POP・SMTP) の組は再現せず、Dice 0.15 | 記録のみ |
| L7 | LOW | `terms[4].detail_zh`「电子证书」・`pairs[0].rows[1].b_zh`; `overview_rows[3..4].extra_zh[1]`・`terms[2..4].detail_zh`・`pairs[0].rows[2].a_zh/b_zh` の「80 号 / 443 号」; `terms[0].fig.data.rows[3].cells[2].zh`「无线局域网」(zh_terms は 无线LAN); `terms[1].fig.data.rows[2].b.zh`「怕延迟」; `goals_en[0]` | loc-review r1 LOW 5 件の未適用。「电子证书」は technology-23-63 u03 / u07 / u11・strategy-05-14 u04 / u05 でも同じ訳で、本単元だけ数字证书に変えると単元間で揺れる。いずれも意味のずれなし | 記録のみ + 批間候補 (zh_terms に 電子証明書 の訳を登録して全単元で統一) |
| L8 | LOW | `terms[2..4].detail_*`・`overview_rows[3..4]`・`pairs[0].rows[2]` (80 / 443)、`terms[2].detail/analogy/fig captions/points[0]` + `key_points[2]` (IP アドレス = 機器 / ポート番号 = アプリ)、`terms[4].points[1]` | D-203 §9 / 書き方 8 の反復: 80 / 443 が 5 欄、IP とポートの対比が 5 欄 (見出し語の定義そのものの対比)、HTTPS points[1] は points[0]・one の暗号化の言い直し (r1 / r2 LOW と同判断)。事実は正しい | 記録のみ |
| L9 | LOW | `terms[1].points[0].text_jp/zh/en`、`terms[1].analogy_*` | UDP の考点が次の用語で定義するポート番号を先に使う (総表 overview_rows[2] に一行定義あり、観点 3)。analogy「館内放送」は一斉送信の像で、UDP の通常の 1 対 1 通信とは像の範囲がずれるが、one・detail の否定内容 (接続確立・確認・再送をする) は運ばない | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① TCP / UDP (接続・確認と再送・向く通信): UDP の compare 図 3 行、UDP detail、overview_rows[1].extra、key_points[1] → 図が対比の本体、detail・key_points は UDP 側の定義 → 許容。② IP アドレス = 機器 / ポート番号 = アプリ: L8。③ HTTP / HTTPS (暗号化・認証・ポート・URL): `pairs[0]` 4 行、HTTPS points[1] (切り替え)、key_points[4] (HTTPS 側のみ) → pairs + 考点 1 = 2 箇所で許容 (80 / 443 の反復は L8)。④ HTML / HTTP: HTTP mix 考点のみ → 許容。⑤ TCP/IP の広狭 2 義: TCP/IP points[1] と hook (広い意味の補足) → 許容。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。jp の「押さえ」は §9 grep の唯一のヒットだが、D-195 の改稿対象外フィールド。
- O2 「SSL/TLS」は IPA シラバスの用語で、現行は TLS のみが使われる (SSL 3.0 は RFC 7568 で使用禁止)。単元は SSL を現役と言い切らず版名も書かないため指摘しない。
- O3 確認題の幅 (r2 LOW): ポート番号の識別対象を問う題が challenge 2 題 + quiz 1 題。不適切ではない。

確認済みで問題なし: 限定条件 (考点 8 件全て保持、§2)、§9 禁止句 grep (改稿欄 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤91 字)、D-198 写し (validate 0、choice-echo warn 0、遮蔽照合 0、近似一致は較正値に遠い)、D-205 / D-210 の数値 (4 層 RFC 1122、0〜65535 RFC 6335、80 / 443 RFC 9110 — 一致、HTTP の TCP は L2)、`[[jp:]]` 原語 (12 種全て jp 本文に実在)、zh 訳語表 (B6 warn 0)、図種 (static table / static compare / flow steps ×2 / 図なし = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、前回 MEDIUM 2 件の解消と zh / en 退行なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 3: L1〜L3 / 記録のみ 6: L4〜L9) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 10 件 (qid 付き 8 件)・引用 11 題 + quiz / challenge (未引用 0) で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。層の数・ポート番号の範囲・既定ポートは RFC 1122 / 6335 / 9110 と一致。LOW 建議修 3 件 (L1 HTTPS 比喩の認証の向き / L2 HTTP の TCP に版を明記 [RFC 9114 一次確認済み] / L3 HTTP 図の 1 往復の像) は補丁 (B3) で修正推奨、L4〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-22-59-u02
✓ technology-22-59-u02 unit: 0 issues (data/ip/textbook/units/technology-22-59-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-22-59-u02
✓ technology-22-59-u02 parity: 26 locations, 0 diff
EXIT=0
```
