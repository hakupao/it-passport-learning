# Rule A 全数抽検 — technology-22-59-u03 (メール・ファイル・運用プロトコル)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (b47)、repo HEAD `50314ed8` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b47-u03-a1` merge 結果、sha256 先頭 `d1cbdeb79cc0afa6`)。経緯: jp r0 → jp-review #1 REVISE (MEDIUM 3) → jp r1 → jp-review #2 PASS → loc r0 → loc-review #1 REVISE (MEDIUM 1) → loc r1 → loc-review #2 PASS。
- **対象**: `data/ip/textbook/units/technology-22-59-u03.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (SMTP / POP / IMAP / FTP / NTP / DHCP) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204、**D-205** (改訂される文書・規格の構成要素の数・名前、本単元ではプロトコルの版・ポート番号)、D-208 (既知の見逃し型 (1)〜(10)) / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/technology-22-59-u03/v1-original.json` (用語 6 語・`term_zh`・`term_en` とも v1 と一致、`unit_summary_*` は v1 と同文)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 9 件 = exam 8 + mix 1、qid 付き 8 件、引用 qid 延べ 20 件 = 異なり 20 題)**: `data/ip/quiz/questions.json` (+ `translations/<exam>.json` の `stem_jp_clean`、図問 2009h21a-q069 / 2019h31h-q082 / 2026r08-q068 は clean 版で区間 ①〜③ を確認) から各題の題文・選択肢・`correct_answer` を再読 (全題 topic `technology-22-59`)。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化・限定をしていないこと、題の前提 (限定条件) を外していないことを 1 件ずつ確認 (§2)。計算題なし。
3. **quiz / challenge_questions** (quiz 計 17 枠 + challenge 5 題、本文で未引用は 2021r03-q084 [POP quiz]、2011h23tokubetsu-q086 [DHCP quiz]、2026r08-q068 [challenge] の 3 題): 2021r03-q084 (メールソフト導入時に設定が要るのは受信用 POP3; 誤答 = DNS・FTP・MIME) は SMTP `points[1]` (mix「送信用 SMTP と受信用 POP または IMAP のサーバを分けて設定」) と `pairs[0].rows[2]` で解け、POP3 だけに限る語は無い (jp-review #1 MEDIUM の旧 POP points[1] は削除済み)。2011h23tokubetsu-q086 (DHCP を使う LAN では IP を自動取得に設定; 誤答 = ネットワークアドレス・ゲートウェイ・未使用アドレスを手で設定) は DHCP detail「端末側は設定を自動で受け取るようにしておくだけ」と図 step 1〜3 で解ける (旧 points[1] の場面再現は削除済み)。2026r08-q068 (送信 SMTP / 受信 IMAP4; 誤答 = IMAP4・POP3 を送信に) は SMTP one・IMAP one「受信用」・key_points[0..1] と一致。challenge の残り 4 題は引用題。topic 外で本単元の用語を選択肢に持つ題 (2018h30h-q059 / 2023r05-q092 の誤答「受信に SMTP、送信に POP3」、2010h22a-q065 の HTTP/TCP 階層、2014h26h-q079 の IMAP 誤答、2019r01a-q085 の IMAP・SMTP 誤答 等 20 題) とも矛盾なし。
4. **D-198 写し**: validate の copy guard (本文 + 図ラベル・caption・総表・対比表) = 0 件、`warn  choice-echo` 行 0。独立照合として単元の JP 文字列 110 本 (派生フィールド・`summary`・`overview`・v1 継承の `unit_summary_jp` 除く) を topic 内全 34 題の題文 (`stem_jp_clean` 優先) + 選択肢と 12 字連続照合 (記号・空白・記法除去):
   - **カタカナ 4 字以上・英数を遮蔽: 0 件**。
   - **遮蔽なし: 7 件、全て偽陽性** — `terms[0].one_jp` ↔ 2011h23a-q077 エ「SMTPは電子メールを送」(見出し語 + 「電子メールを送」の標準定義の書き出し)、`terms[0/1/3/4].one_jp` ↔ 2011h23a-q077 ア「…するためのプロトコルである」(定義文の定型句)、`terms[3].points[1].text_jp` ↔ 2012h24h-q060 題文「anonymousFTP」(用語名)、`terms[4].hook_jp` ↔ 2011h23tokubetsu-q085 題文「NetworkTimeP」(正式名称)。
   - **近似一致** (12 字窓の編集距離 ≤ 2、完全一致を除く): ほぼ全てが「〜するためのプロトコルである」「IPアドレスなどの設定 / 情報を」「◯◯Protocol の」の 1〜2 字違いの定型句。意味のある近接は `terms[1].one_jp` ↔ 2012h24a-q077 題文 (「メールサーバに届いた…メールをメールソフトが / で」)、`terms[2].one_jp` ↔ 2016h28a-q085 ア (「IMAP(4)はメール(サーバ)上」)、`terms[4].points[0].text_jp` ↔ 2019r01a-q094 ウ (「PCやサーバなどの」) で、いずれも見出し語の標準定義の語 (→ L5)。
   - **文単位 bigram Dice ≥ 0.45 上位** (較正: HIGH 例 ed 0.14 / Dice 0.52): `terms[0].points[0].text_jp` 第 1 文 ↔ 2011h23a-q077 正答エ 0.71 / 正規化編集距離 0.23 (「SMTP はメールを送る側のプロトコル」= 分類題の正答内容を見出し語の一般定義で述べたもの、D-209 免除内、選択肢の組・順序の再現なし → L5)、`terms[0].one_jp` ↔ 同エ 0.67 / ed 0.44、`terms[1].one_jp` ↔ 2017h29h-q074 エ 0.60 / 2012h24a-q077 題文 0.51 / ed 0.53、`terms[0].fig.steps[2].caption_jp` ↔ 2016h28h-q062 正答ウ 0.54 / ed 0.55、`terms[5].one_jp` ↔ 2025r07-q060 誤答ウ (DHCP の説明) 0.52 / ed 0.58、`terms[4].hook_jp` ↔ 2011h23tokubetsu-q085 題文 0.52 (正式名称)、他は「X は…のプロトコルである」の構文の一致で語は別。ed が較正 HIGH 例 (0.14) に近いものは無い。
   - **カタカナの多い文の目視**: IMAP one・detail・points[0] (メールボックス・サーバ)、FTP points[1] (アカウント・ログイン)、DHCP detail を 2017h29a-q083 / 2013h25h-q084 / 2022r04-q087 / 2012h24h-q060 と照合 → 題文の特徴語の列挙 (受信プロトコル → 残したまま → フォルダ作成 / 未読 → 振分け → 同一に見える) は再現されていない (jp-review #1 MEDIUM の解消を確認)。
   - **D-208 (1) option tracing**: 考点 9 件のうち誤答肢の否定だけで成り立つものは 0。誤答肢の場面 (遠隔操作・ネットワーク監視・バイナリ変換・暗号化) を再演する文なし。空欄・区間題 (2009h21a-q069 / 2019h31h-q082) については、SMTP `points[0]` は SMTP が担う 2 区間だけを述べ、題の区間 ①〜③ の組や比較相手 (POP3 / SMTP の割当て) を並べない。SMTP の図 steps (端末→サーバ SMTP / サーバ→サーバ SMTP / 受信は POP や IMAP) は 2019h31h-q082 の区間の並び (①②③) と同じ順だが、メール配送の時間順そのもので題固有の並べ方ではなく、受信側も「POP や IMAP」と題の選択肢 (POP3) に寄せていない。2009h21a-q069 の並び (送信 → 受信 → 転送) とは順も異なる → (iii) 非該当、記録のみ (L4)。2011h23tokubetsu-q086 の場面 (旧 DHCP points[1]) は削除済み。
5. **D-195**: 結論先行 (one = 1 文 × 6、太字あり)、展開 2 文 × 6、比喩・フックが定義の言い換えでないこと (郵便の区間 / 私書箱 / 写真アルバム / 宅配便 / 時報 / ホテルのフロント; フックは略語の語源 → FTP・NTP は頭文字の指摘のみで L2)、定義前使用 (メールサーバ = SMTP detail で定義、one と図が先に使う; 時刻サーバ・DHCP サーバも図 caption が先 → L9; アプリケーション層・TCP/IP は前提単元 u01 / u02)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh 务必 / 一定 / 考试 / 考查 / 必须 + en exam / must / always / important / tested → `points[].kind` の "exam" と **hook の「と覚える」5 件 (POP / IMAP / FTP / NTP / DHCP; + 派生 2 欄)** のみ、後者は記憶フックの言い方で定型締め句ではない → L2)、図の型 (SMTP = flow steps 3、FTP = static table、NTP = flow steps 3、DHCP = flow steps 3、POP・IMAP = 図なし; 全て登録内)、pair 配置 (SMTP→POP は POP の後、POP→IMAP は IMAP の後、各組 key 行 1)。
6. **D-200**: 考点数 2/1/1/3/1/1 (≤3 ✓)、各 JP 文数 1〜2・字数 45〜79 (≤100 ✓、最大は SMTP `points[1]` の 79 字)。**framing 件数** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の照合: 受信プロトコルは SMTP points[1]・fig step 3・key_points[1]・overview_rows・pairs[0] とも「POP または / や IMAP」で揃い、POP3 だけに限る欄は無い [jp-review #1 MEDIUM の解消]; POP の「基本の動作では消す (設定で残せる)」は detail と `pairs[1].rows[1]`「基本の動作では」で一致; SMTP の比喩は「宛先の局に留め置かれた郵便を受取人が取りに行く部分は含まない」で POP の比喩・hook・図 step 3 と同じ像に揃った [jp-review #1 low の解消]; FTP「アプリケーション層」は points[2] と key_points[2] で一致; DHCP の貸出し期限は detail と比喩 [チェックアウトで次の客] で一致) → 不整合 0。書き方 8 → L11。書き方 9 (限定条件) → §2 表に記載、落ち 0 (「など」: 2014h26a-q079 / 2025r07-q060 の「IP アドレスなどの情報」→ DHCP one「IPアドレスなどの通信に必要な設定」保持; 2019r01a-q094 の「PC やサーバなど」→ NTP points[0] 保持; 2009h21h-q075 の「PC とメールサーバとのやり取り」→ SMTP points[0]「メールソフトから送り出すとき」で保持)。§6 → L1 / L2。§9 言い直し → L6。
8. **D-205 / D-210 (版・ポート番号)**: 単元はポート番号を一切述べない (数字は POP3 / IMAP4 の版名のみ、grep で確認)。版名は全欄で「広く使われている版」「よく使われる版」と限定付き (POP detail・IMAP detail・key_points[1]・`pairs[1].rows[3]`) で、唯一の版とは言わない。一次資料照合: RFC 1939 = "Post Office Protocol - Version 3" (STD 53) — 現行の POP は版 3; DELE は印を付けるだけで QUIT による UPDATE 状態で削除、UIDL を使い DELE しない「サーバに残す」クライアントにも言及 → detail の「基本的な動作では…消す (設定で残すこともできる)」と整合。RFC 9051 (2021-08) = "Internet Message Access Protocol (IMAP) - Version 4rev2"、RFC 3501 (IMAP4rev1) を廃止し上位互換 → 現行版も「IMAP4」系で「広く使われている版は IMAP4」は正しい。NTP・SMTP・FTP・DHCP は版を述べない。引用題に法令・規格の改正前文言なし (D-210 非該当)。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 4 種 (メールサーバ / メールボックス / アプリケーション層 / IPアドレス) が jp 本文に実在 (スクリプト、全 ok)。見出し語 6 語は三語同形 (term_zh = term_en = term) のため one_zh / one_en の `[[jp:]]` 併記は不要 (validate 0)。zh 訳語が `zh_terms.json` に従うこと (validate の B6 warn 0; IP 地址 / 局域网（LAN） [DHCP detail_zh 初出] / 邮箱 / 应用层 / 无线LAN / 电子邮件 一致; PC は「PC」のまま → L10)。loc-review #1 MEDIUM (zh `[[jp:]]` 5 箇所の逆順) は 5 箇所とも「中文（[[jp:日本語]]）」に直っていることを確認、en「mail servers ([[jp:メールサーバ]])」・zh 中黒・「运营方式」・「手边」→「本地」・「偏差」の文法・DHCP 租期 の low も反映済み。zh / en に誤答肢方向の語選び (D-208 (6)) なし: FTP 各欄の zh/en は「文件」「files」で「邮件」を運ぶとは読めない; NTP en "synchronizes the clocks" は 2011h23tokubetsu-q085 の誤答 (配信・時刻証明・鍵更新) の方向に読めない。
10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | SMTP | OK — exam 1 / 4 題: 送る側のプロトコルで、メールソフトからの送出もサーバ間の中継も SMTP (2011h23a-q077 正答エ / 2009h21h-q075 正答イ [PC 送信 SMTP・受信 POP] / 2009h21a-q069 正答ウ [① SMTP ② POP3 ③ SMTP] / 2019h31h-q082 正答エ [① SMTP ② SMTP ③ POP3]); 限定条件「PC とメールサーバとのやり取り」保持、受信を SMTP とする誤答を支持しない / mix: 送受信は別プロトコル、メールソフトに送信 SMTP・受信 POP または IMAP のサーバを分けて設定 (2021r03-q084・2026r08-q068 と整合)。detail「端末→サーバ・サーバ→サーバの両方」は RFC 6409 の submission も SMTP で正しい。flow steps 3 は one・detail・POP/IMAP 欄と一致 | OK (D-198 近接 L5、図の並び L4) | OK | L3 / L4 / L5 / L6 / L9 / L11 |
| 2 | POP | OK — exam 1 / 3 題: 受信用で、端末のメールソフトがサーバの自分宛てメールボックスから引き取る (2017h29h-q074 正答エ / 2012h24a-q077 正答ウ POP3 / 2016h28h-q062 正答ウ [POP3 や IMAP4 で受信]; q062 は IMAP4 も受信とするが、考点は POP を受信と述べるだけで IMAP を除外しない)。detail の POP3・基本動作で削除 (設定で保持可) は RFC 1939 と整合 | OK | OK | L2 (hook) / L3 / L5 / L6 |
| 3 | IMAP | OK — exam 1 / 4 題: 保管も整理結果もサーバが受け持ち、端末を替えても同じメールボックスにつながり状態が共有 (2017h29a-q083 正答ア / 2013h25h-q084 正答イ / 2022r04-q087 正答ア / 2016h28a-q085 正答ア); 2022r04-q087 の「PC 内に取り込んで管理する必要がなく」は detail「手元にすべて写し取らずに扱う」で保持。題文の特徴語列挙・順序の再現なし (jp-review #1 MEDIUM 解消、2 考点 → 1 考点に統合) | OK | OK | L1 (analogy) / L2 (hook) |
| 4 | FTP | OK — exam 3 / 4 題: PC やサーバなどのコンピュータ間でファイルをやり取り (2025r07-q060 正答エ / 2013h25a-q065 正答イ; 誤答 = 時刻取得 [NTP]・メール転送 [SMTP]・IP 自動割当て [DHCP] を支持しない) / anonymous FTP = 個別アカウントの無い人が共通の名前でログインし公開ファイルを取得 (2012h24h-q060 正答ウ; 誤答ア 暗号化機能の追加・エ 認証も誤り訂正も無い軽量プロトコル を支持しない。detail の「暗号化に対応した方式」は FTP 一般の補足で anonymous FTP の説明とは別欄) / FTP・メールはアプリケーション層、下で共通の基本通信機能を担うのは TCP/IP (2023r05-q068 正答エ)。table (ダウンロード / アップロード) は detail と一致 | OK (図 L8) | OK (zh L10) | L2 (hook) / L6 / L7 / L8 |
| 5 | NTP | OK — exam 1 / 3 題: ネットワークの PC やサーバなどの時計を正確な時刻源を持つサーバに合わせて同期 (2011h23tokubetsu-q085 正答イ / 2018h30a-q088 正答イ / 2019r01a-q094 正答ウ; 「など」保持、誤答 = 配信・時刻証明・鍵更新・OS 更新・BIOS・遠隔起動 を支持しない)。detail「別々の機器の記録を同じ時間軸で突き合わせ」は時刻証明 (q085 ウ) の方向に読めない。flow steps 3 一致 | OK | OK | L2 (hook) / L5 / L6 / L9 |
| 6 | DHCP | OK — exam 1 / 2 題: DHCP を使うと PC は接続時に IP アドレスをサーバから自動で受け取る (2014h26h-q058 正答ア / 2014h26a-q079 正答ア; q079 の前提「自動取得に設定した PC」は考点の「DHCP を使うと」と detail「端末側は自動で受け取るようにしておく」で保持; 誤答エ プロバイダのメールアドレス は one「通信に必要な設定」に入らない)。detail の期限付き貸出し (リース) と比喩 (チェックアウト後の部屋を次の客へ) は一致。flow steps 3 一致 | OK | OK | L2 (hook) / L5 / L6 / L9 |

**単元レベル**: goals 3 点・overview_cols 2 (役割 / 使う場面の例)・overview_rows 6 行・pairs 2 組 (SMTP / POP 3 行 key 1、POP / IMAP 4 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 5 件 (2019h31h-q082 / 2026r08-q068 / 2022r04-q087 / 2013h25a-q065 / 2014h26h-q058 — 本文と矛盾なし、§1-3)。`pairs[1].rows[3]` 版 POP3 / IMAP4 は D-205 の限定付き (§1-8)。事実誤りなし、三語一致。

**Prior findings の解消確認**: jp-review #1 MEDIUM 3 件 (IMAP 2 考点の題文なぞり → 1 考点に統合・因果で言い切り / POP points[1] の POP3 限定・場面再現 → 削除 / DHCP points[1] の場面再現・誤答打消し → 削除)、loc-review #1 MEDIUM 1 件 (zh `[[jp:]]` 逆順 5 箇所 → 修正) は全て解消、zh / en で regression なし。jp-review #2・loc-review #2 は PASS (low のみ、下表に反映)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 11 (うち 建議修 1)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[2].analogy_jp` / `analogy_zh` / `analogy_en` | 「ネット上の共有アルバム」は他人と共有するアルバムを連想させ、1 人の利用者のメールボックスを複数端末から見る IMAP より像が広い。また「眺める」だけで one の「整理する」(サーバ側での整理) が像に入らない (jp-review #2 low、未反映)。誤答肢方向の読みは無い (D-204 措辞級) | jp before「写真を手元に移さず、ネット上の共有アルバムをいろいろな機器から開いて眺める使い方に似ている。」→ after「写真を手元に移さず、ネット上の自分のアルバムに置いたまま、いろいろな機器から開いて眺めたり整理したりする使い方に似ている。」/ zh before「类似于不把照片下载到手边，而是从各种设备打开网上的共享相册来浏览。」→ after「类似于不把照片下载到本地，而是把它们留在网上自己的相册里，从各种设备打开来浏览和整理。」/ en before "It is like leaving your photos in an online shared album and opening that album from whichever device you have at hand." → after "It is like leaving your photos in your own online album and opening it from whichever device you have at hand to view and sort them." |
| L2 | LOW | `terms[1..5].hook_jp` (+ 派生 `memory_hook_jp`, `summary.memory_hooks_jp[1..5]`)、`terms[3].hook_*` / `terms[4].hook_*` | 6 フック中 5 つが「〜と覚える」で結ぶ (§9 同型の結びの反復)。FTP・NTP のフックは「F が File」「T が Time」と略語の頭文字を指すだけで、one の言い換えに近い (D-203 §6) | 記録のみ (任意: 結びを「〜である」に) |
| L3 | LOW | `terms[1].hook_*` ↔ `terms[0].analogy_*`、`terms[0].hook_*` ↔ `terms[3].hook_*` | D-208 (8) 点検: POP hook の鍵語「郵便局」は SMTP 比喩の「郵便局どうしが…運ぶ」(= メールサーバ間の中継) にも出る。SMTP hook の鍵語 Transfer は FTP の正式名にもある。ただし POP hook は「局に留め置かれた郵便を取りに行く係」、SMTP 比喩は「取りに行く部分は含まない」と役割を明示し、FTP hook は「F が File、メール系と混ざらない」と区別する。D-208 (9) の当てはめ (2019h31h-q082 ② / 2009h21a-q069 ③ / 2025r07-q060) でも各 hook は正答を選ぶ → MEDIUM 非該当 | 記録のみ |
| L4 | LOW | `terms[0].fig.steps[0..2]` | 区間の並び (端末→サーバ SMTP / サーバ→サーバ SMTP / サーバ→受信者 POP や IMAP) が 2019h31h-q082 の区間 ①〜③ と同じ順。配送の時間順そのもので題固有の並べ方ではなく、受信側は「POP や IMAP」で題の選択肢 (POP3) をなぞらない。2009h21a-q069 (送信 → 受信 → 転送) とは順が違う → D-208 (1) / D-209 非該当 | 記録のみ |
| L5 | LOW | `terms[0].points[0].text_jp` 第 1 文、`terms[0].one_jp`、`terms[1].one_jp`、`terms[4].points[0].text_jp`、`terms[5].points[0].text_jp` | 分類題の正答・題文と語が近い (SMTP points[0] ↔ 2011h23a-q077 エ Dice 0.71 / ed 0.23; POP one ↔ 2012h24a-q077 題文「メールサーバに届いた…メールソフト」; NTP points[0] ↔ 2019r01a-q094 ウ「PC やサーバなど」+ 2018h30a-q088 題文; DHCP points[0] ↔ 2014h26h-q058 題文の構造)。いずれも見出し語の標準定義を正の形で述べたもので、選択肢の組・順序・数値の再現なし → D-198「標準的な定義の一般表現」/ D-209 免除内 (jp-review #2 low と同判定) | 記録のみ (言い換えると定義が不正確になりやすい) |
| L6 | LOW | `terms[1].points[0]`、`terms[3].points[0]`、`terms[4].points[0]`、`terms[5].points[0]` (各 `text_jp/zh/en`)、`terms[0].points[0]` 第 2 文 | 考点が同用語 one (SMTP は detail 2 文目・key_points[0]・`pairs[0].rows[1]` も) の言い直しで新しい事実を足さない (D-203 §9; jp-review #1・#2 low) | 記録のみ |
| L7 | LOW | `terms[3].points[2].text_*`、`key_points_*[2]` | 「FTP の下で通信機能を受け持つのは TCP/IP」は 2023r05-q068 の扱いと一致するが、厳密には TCP/IP はプロトコル群の名で FTP もその一員。主題が TCP/IP なのに FTP の考点に置かれる (jp-review #1・#2 low) | 記録のみ (引用題の正答と一致、誤答肢を支持しない) |
| L8 | LOW | `terms[3].fig` | ダウンロード / アップロードの 2 行表は detail 1 文目と比喩の内容と同じで、語を名付ける以外の情報が少ない (D-195 §2 飾りの図に近い、jp-review #1・#2 low) | 記録のみ |
| L9 | LOW | `terms[0].one_jp` / `terms[0].fig` (メールサーバ)、`terms[4].fig` (時刻サーバ)、`terms[5].fig` (DHCP サーバ) | 定義する detail より前に one・図で使う (D-195 の固定順に由来、語の意味は自明) | 記録のみ |
| L10 | LOW | `goals_zh[1]` / `terms[0..2].hook_zh` / `terms[5].hook_zh` (ASCII 引用符 "…")、`terms[3].points[1].text_zh`「用共同的名称登录」、`terms[0].points[0..1].text_zh` 等「邮件软件」、`terms[3].points[0].text_zh` / `terms[4].points[0].text_zh`「PC」(訳語表は PC（个人计算机）) | 現地化の細部 (loc-review #2 low の未反映分)。意味のずれ・誤答肢方向の語選びなし、validate B6 warn 0 | 記録のみ (任意: 引用符を “…” に、「共同的名称」→「通用的用户名」、「邮件软件」→「邮件客户端」) |
| L11 | LOW | `pairs[0]`、`terms[0].points[1]`、`terms[0].analogy_*` 後半、`terms[0].fig.steps[2]`、`key_points_*[0..1]` | 書き方 8: 「送るのは SMTP / 受け取るのは POP・IMAP」の対比が pairs と mix 考点の 2 箇所に加え、SMTP 比喩後半・図 step 3・key_points でも出る (jp-review #2 low) | 記録のみ (比喩後半は jp-review #1 low の像の不一致を直すために入ったもので、削ると POP 比喩との整合が弱まる) |

**対比の出現欄 (書き方 8 の列挙)**: ① SMTP = 送る / POP・IMAP = 受け取る: `pairs[0].rows[0..2]`、`terms[0].points[1]` (mix)、SMTP 比喩後半、図 step 3、key_points[0..1] → L11。② POP = 端末で管理 / IMAP = サーバで管理: `pairs[1].rows[0..2]`、各 one (定義そのもの)、overview_rows[1..2].extra、hook (持ち帰る / アクセスしに行く、D-195 §6 の対比の手がかり) → 許容。③ 版 POP3 / IMAP4: `pairs[1].rows[3]`、各 detail、key_points[1] → 各欄の定義上の記述で許容。`goals_jp` は観点の予告で内容を述べない。

確認済みで問題なし: 限定条件 (考点 8 件全て保持、§2)、D-205 (ポート番号の記述なし、版名は「広く使われている版」付きで RFC 1939 / RFC 9051 と整合)、D-210 非該当、§9 禁止句 grep (定型締め句 0; 「と覚える」は L2)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤79 字)、図の文字列の写し (validate 0、独立照合は偽陽性のみ)、`[[jp:]]` 原語 (4 種全て jp 本文に実在)、見出し語は三語同形、zh 訳語表 (B6 warn 0)、図種 (flow steps ×3 / static table ×1 / 図なし ×2 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、prior HIGH/MEDIUM 4 件の解消 (zh / en で regression なし)、D-208 (9) hook の当てはめ (§3 L3、全て正答を選ぶ)、D-208 (2) 「など」落ちなし、(3) 別名の別物扱いなし (POP / POP3、IMAP / IMAP4 は版として同一物と明記)、(10) 閉じた列挙なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **11** (建議修 1: L1 / 記録のみ 10: L2〜L11) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 6 用語・考点 9 件 (qid 付き 8 件)・引用 20 題 + 未引用の quiz / challenge 3 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。版名 (POP3 / IMAP4) は一次資料 (RFC 1939 / RFC 9051) と整合し、ポート番号は述べていない。LOW 建議修 1 件 (L1) は補丁 (B3) で修正推奨、L2〜L11 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-22-59-u03
✓ technology-22-59-u03 unit: 0 issues (data/ip/textbook/units/technology-22-59-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-22-59-u03
✓ technology-22-59-u03 parity: 30 locations, 0 diff
EXIT=0
```
