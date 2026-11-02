# Rule A 全数抽検 — technology-22-60-u02 (ドメイン名・DNSとWebの仕組み)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-02 (S140 b10)、repo HEAD `7b23557` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b10-u02-a1` merge 結果、sha256 先頭 `077caa4cb210d2b3`)。
- **対象**: `data/ip/textbook/units/technology-22-60-u02.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (ドメイン名 / DNS / URL / cookie / RSS) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `.planning/v2/technology-22-60-u02/v1-original.json` (用語 5 語・`term_zh`・`term_en`・challenge 5 題・source_figures・`unit_summary_*` が v1 と一致)。同 topic の他単元は v1 のままで (u01 / u03 は生成中)、横の整合は v1 の用語一覧のみ参照。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 14 件 = exam 12 + mix 2、全件 qid 付き、引用 qid 延べ 22 件 = 異なり 21 題)**: `data/ip/quiz/questions.json` から各題の題文 (`stem_jp_clean` 優先)・選択肢・`correct_answer` を再読 (全題 topic `technology-22-60`)。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化・限定をせず、題の場面・前提を外していないことを 1 件ずつ確認。計算題なし。
3. **quiz / challenge_questions** (quiz 計 13 枠 + challenge 5 題、うち本文で未引用 4 題 = 2012h24h-q073 / 2010h22h-q059 / 2012h24a-q071 / 2012h24h-q075): 本文と矛盾しないことを確認。q073 (名前と IP の対応付け = DNS) は DNS の one で解ける。2010h22h-q059 (サーバからの情報をブラウザに一時保存) は cookie の one・図と整合。2012h24a-q071 (情報の所在の記述方式 = URL) は URL の one で解ける。2012h24h-q075 (見出し・リンク・要約を定型で記述する形式の総称) は RSS の one「形で記述するデータ形式」と整合、誤答 (スタイル定義・暗号化・ブックマーク共有) を支持する記述なし。2015h27h-q060 / 2019h31h-q057 は引用題でもある。
4. **D-198 写し**: validate の copy guard = 0。独立照合: 単元の JP 文字列 127 本 (派生除く) × topic 内全 97 題の題文 (行単位含む) + 選択肢、12 字連続一致。**(a) カタカナ 4 字以上 + 英数を遮蔽** → **0 件**。**(b) 遮蔽なし** → 16 件 (重複含む)、内訳: 「トップレベルドメイン (TLD)」(用語名)、「ドメイン名と IP アドレス(の対応)」(用語名 2 つの連なり + 標準定義、one / key_points[1] ↔ 2012h24h-q073・2016h28h-q070 エ・2019r01a-q091 ウ・2023r05-q097 エ・2025r07-q058 ウ) = 偽陽性、**「クロスサイトスクリプティングなど」(cookie points[1] ↔ 2010h22a-q059) → 下記 (c) で L1**。
   **(c) 近似一致** (文全体の正規化編集距離 ed / 文字 bigram Dice、半大域 ed も併用、節単位も計算。較正: HIGH = ed 0.14 / Dice 0.52、建議修 = ed 0.40 / Dice 0.32、正答肢の言い直しで標準定義に依って HIGH を外した前例 = ed 0.19 / Dice 0.70):
   - **`terms[3].points[1]` 1 文目 ↔ 2010h22a-q059 小項目 c (正しい記述): cookie の表記を題の表記に揃えると ed 0.25 / Dice 0.72** (揃えない生値 0.35 / 0.62)。同じ主語 + 条件 + 攻撃名 + など + 結びの骨格で、言い換えは「保存されている場合→入っていると」「など→などの攻撃」のみ。2 文目は小項目 b の場面 (借用 PC) を「共用の PC」に抽象化したもの (節 ed 0.83 / Dice 0.11)。考点全体としては 1 題の小項目 2 つ (c と b) の言い直しである。判定 = ed は HIGH 較正 0.14 に届かないが、**Dice は 0.52 を超える** (Dice だけなら HIGH 側)。**写し (HIGH) としない根拠は 3 つ**: (a) D-198「写しでない = 標準的な定義・計算規則・原則を一般的な表現で述べること」の**原則**に当たる (用語の定義ではなく、cookie 内の個人情報は攻撃で盗まれうるという安全上の一般の注意で、場面・数値を含まない。前例 ed 0.19 / Dice 0.70 は定義の核だったので、本件は定義でなく原則の枠で適用している)、(b) その前例が ed・Dice とも本件と同水準で LOW 建議修、(c) 遮蔽 12 字照合 0 件。例外に依る判定なので **L1 建議修、補丁で必ず解消する**。親 agent が (iii) 寄りに読むなら HIGH へ上げる余地がある境界である。修正案は遮蔽なし ed 0.77 / Dice 0.50、カタカナ遮蔽後 Dice 0.25 (修正前 0.57)、最長一致は攻撃名の 14 字のみ。
   - `terms[4].points[0]` 前半 ↔ 2014h26h-q074 / 2021r03-q093 正答 (短い選択肢全体): 節単位 ed 0.27 / Dice 0.59 (文全体では閾値外)。「収集した→などから集めた」の置換だけ。続く否定 2 項も同題の誤答 2 肢を同じ順序でなぞる (D-198 (iii) の列挙順の境界) → **L2 建議修**。
   - その他は全て較正から遠い: DNS one ↔ 2019r01a-q091 ウ 0.69 / 0.41、key_points[1] ↔ 同 0.64 / 0.42、pairs[0].rows[0].b ↔ 2025r07-q058 ウ 0.55 / 0.43、DNS points[0] ↔ 2019h31h-q057 ア 0.69 / 0.49、ドメイン名 points[2] 1 文目 ↔ 2021r03-q098 ウ 0.63 / 0.52 (誤答を否定形に反転した標準事実)、キャッシュ節 ↔ 2024r06-q061 イ 0.62 / 0.45、URL 否定節 ↔ 2010h22a-q074 ウ 0.50 / 0.50 (14 字の句)、ホスト名節 ↔ 2018h30h-q064 エ 0.68 / 0.41、フィード節 ↔ 2015h27h-q048 ア 0.64 / 0.37。「example.…」のラベル ↔ 2020r02o-q075 エ・2015h27h-q060 は語が短いだけの偽陽性で、例は `example.ne.jp` と別パスの自作 (題の co.jp・ファイル名を使わない)。
   - **目視 (カタカナの多い文・具体例の流用)**: 図・比喩の語句 (192.0.2.10 / top.html / news / 図書館 / 引換札 / 新聞 / 番号案内 / 連絡先 / 領地 / お菓子 / 共用) を topic 全題で検索 → ヒットなし。「電話番号」= 2018h30a-q083 (SIM カード、無関係)。「ニュースサイト」= 2009h21a-q075 (RSS の別題、題の列挙の一語; 図の場面としての流用ではない) → L12 に記録。2017h29h-q066 の試験センター URL の場面は使わず一般化。プロキシ節は 2026r08-q065 ア の長い説明を「Web アクセスの代理」に圧縮、DHCP 節は 2019r01a-q091 ア・2026r08-q065 ウ の語をなぞらない。
5. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 3 文 × 5、比喩・フックが定義の言い換えでないこと (比喩は全て別領域の場面 = 連絡先アプリ / 番号案内 / 図書館の案内票 / クリーニングの引換札 / 新聞の見出し一覧; hook は語源 3 件 + 字面 2 件。DNS の hook のみ弱い → L10、結びの反復 → L14)、定義前使用 → L9、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → `freq_badge`「頻出」と one_jp「覚えやすい」[派生含む] のみ = 通常の語義。zh・en 相当語 → one_en・hook_en の "remember" のみ = 通常の用法)。図の型 (ドメイン名 = tree steps 3、DNS / cookie / RSS = flow steps 4、URL = static table; 全て登録内)。pair 3 組 (各組 key 行あり)。
6. **D-200**: 考点数 3/3/2/3/3 (≤3 ✓)、各 JP 文数 1〜2・字数 38〜70 (≤100 ✓)。**framing 件数** (validateV2 `pointFraming`、全考点を実行): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 / D-204 単元全体点検**: 書き方 7 (「〜ではない」「〜に限られず」の照合: ドメイン名の指す対象は全欄「接続先を示す名前」に統一され「組織」寄りの語なし; cookie「別の PC には引き継がれない」と共用 PC の消去は矛盾なし; 比喩・hook が考点の否定側を運ぶものなし = 引換札は客側に札がありサーバ側にも預かり物があるが、one の「ブラウザに預ける」は札 = データの位置で読め、hook「サーバではなく利用者側」と衝突しない) → 不整合 0。書き方 8 → §3 の列挙、反復超過なし。書き方 9 → §2 表、L3 を除き前提の差なし。
8. **D-205**: 改訂のある文書 (規格・法律・ガイドライン・知識体系) の構成要素の個数・名称は本単元に無い。jp 配下の区分は図 caption が「例えば」で、tree の co / ne / ac は「など」付きの 3 例で網羅を言わない ✓。RSS の展開形は「展開形の一つが」と複数形式の余地を保持 ✓。
9. **三語**: zh・en が jp と同じ事実か (→ L5)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 16 種が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語併記 = 和語のドメイン名のみ必要で併記あり、DNS / URL / cookie / RSS は jp と同じ綴りの英字語で併記不要 (validate 0)。zh 訳語 (`zh_terms.json`): 域名・IP 地址・MAC 地址・跨站脚本・博客・服务器・文件・登录 一致。`PC（个人计算机）` は単元内に一度も無い → L6。プロキシ → L11。
10. **過去指摘の解消確認** (`journal.b10-u02-a1.jsonl`): jp-review r1 の medium 3 件 → ① ドメイン名の対象の揺れ (「組織」) = 全欄で解消 ② key_points[1] の崩れた条件文 = 役割の一文に置換済み ③ URL の 3 用語羅列 (2012h24a-q071 の並び) = 考点を削除、同題は challenge のみ (考点 15→14)。退行なし。low のうち Atom (未定義) と RSS 比喩の像のずれ・「毎朝」は解消。jp-review r2 PASS の low と loc-review PASS の low は未修のまま → L4 / L5 / L7 / L8 / L9 / L13 で扱う。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | ドメイン名 | OK — exam 3 / 3 題: 接続先を示す文字の名前で通信規約の名前ではなく、メールアドレスにも現れる (2024r06-q071 正答イ、誤答ア = 通信規約の名前 / 2021r03-q098 正答エ、誤答イ = メールに使えない。誤答エ [宛先の相手の名前] は「@ の右側」で支持しない) / TLD は URL 全体でなくドメイン名部分の右端 (2015h27h-q060 正答エ、限定「URL の中で探すとき」保持) / 個人でも取得可・漢字平仮名あり (2021r03-q098 誤答ウ・ア の否定)。tree の階層・「右ほど広い」は事実どおり | OK | analogy_en の標識 L7 | L7 / L8 |
| 2 | DNS | OK — exam 3 / 5 題: 名前に結び付くのは IP で MAC ではない (2014h26h-q071 正答エ・誤答ウ / 2019h31h-q057 正答イ・誤答ア / 2025r07-q058 正答ウ・誤答エ) / DHCP・プロキシは別 (2019r01a-q091 誤答ア / 2026r08-q065 誤答ア・ウ、正答エ = 双方向変換は one・detail「逆に」と一致) / 名前不可・IP 可なら DNS サーバ障害が最も疑わしい (2017h29h-q066 正答イ; 「最も疑われる」保持、題の前提「正しく入力」は明示なし → L3)。flow steps 4 は detail と一致 | OK | PC の訳 L6 | L3 / L6 / L8 / L10 |
| 3 | URL | OK — exam 2 / 2 題: 場所の表記で、通信規約でも本文の文法でもない (2010h22a-q074 正答エ、誤答ア・ウ) / ドメイン名の左 = ホスト名でコンピュータなどを指す、ファイル名はパス側 (2018h30h-q064 正答エ、誤答イ; 字面の範囲 → L4)。表の 4 部分・順序は URL の例と一致 | OK | OK | L4 / L8 |
| 4 | cookie | OK — exam 2 / 3 題 + mix 1 / 1 題: 再訪時の設定表示など閲覧の手間を減らす (2014h26a-q081 正答エ / 2016h28h-q079 正答ア) / 個人情報が入っていると攻撃で盗まれうる、共用 PC では消去 (2010h22a-q059 正答エ = b・c; 限定「個人情報が入っていると」保持、誤答 a は detail「別の PC には引き継がれない」が否定) / キャッシュ = ページ自体をファイルで一時保存、cookie = サイトから渡されたデータ (2024r06-q061 正答ア・誤答イ) | **L1 (写しの境界)** | zh/en の「など」落ち L5 | L1 / L5 / L9 |
| 5 | RSS | OK — exam 2 / 3 題 + mix 1 / 3 題: リーダが見せるのは記事の情報で、アクセス数・管理画面でない (2014h26h-q074 / 2021r03-q093 正答ア) / フィードアイコン = フィード提供の目印 (2015h27h-q048 正答ア、題の RSS・Atom の両形式は「フィード」で包含) / CSS = デザイン定義、RSS = 更新情報の記述 (2013h25a-q069 正答イ・誤答ア / 2015h27a-q057 正答エ / 2025r07-q064 正答イ・誤答ア)。「一字違い」は事実。detail「XML を基に」は 2009h21a-q075 (未引用) と一致 | **L2 (正答肢の言い直し)** | OK | L2 / L9 / L12 |

**単元レベル**: goals 3 点・overview_cols 2・overview_rows 5 行・pairs 3 組 (ドメイン名 / DNS、ドメイン名 / URL、cookie / RSS; 各 2 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge_questions 5 件 (v1 と同一、本文と矛盾なし、§1-3)。`source_figures` は v1 継承の 2012h24a-q054 (本文未参照)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 14 (うち 建議修 7)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修 (補丁で必ず解消)** | `terms[3].points[1].text_jp/zh/en` | 1 文目が 2010h22a-q059 小項目 c の言い直し: ed 0.25 / Dice 0.72 (§1-4)。ed は HIGH 較正 0.14 に届かないが Dice は 0.52 を超える。2 文目は小項目 b の場面の抽象化で、考点全体が 1 題の小項目 2 つの言い直し。D-198 の「原則を一般的な表現で」の例外、ed 0.19 / Dice 0.70 の前例、遮蔽 12 字照合 0 件により写し (HIGH) とはしないが、遮蔽で機械照合を逃れる形 | jp「cookie に個人情報が入っていると、クロスサイトスクリプティングなどの攻撃で盗まれることがある。」→「クロスサイトスクリプティングのような攻撃を受けると、cookie の中の個人情報が漏れるおそれがある。」/ zh「如果 cookie 里含有个人信息，可能被跨站脚本（[[jp:クロスサイトスクリプティング]]）等攻击盗走。」→「遭到跨站脚本（[[jp:クロスサイトスクリプティング]]）这类攻击时，cookie 中的个人信息可能泄露。」/ en "Personal information in a cookie can be stolen through attacks such as cross-site scripting ([[jp:クロスサイトスクリプティング]])." → "An attack such as cross-site scripting ([[jp:クロスサイトスクリプティング]]) can expose personal information held in a cookie." (2 文目は不変。修正後 jp: 71 字、ed 0.77 / Dice 0.50、遮蔽後 Dice 0.25) |
| L2 | LOW **建議修** | `terms[4].points[0].text_jp/zh/en` | 前半が短い正答肢の 1 語置換 (節 ed 0.27 / Dice 0.59)、否定 2 項が同題の誤答の順序をなぞる。zh「投稿管理界面」は日式借用 (loc-review low) | jp 全文→「RSS リーダの画面に並ぶのは、ブログなどの新着記事の題名や概要である。ブログの編集画面や閲覧者数の集計を見る道具ではない。」/ zh 全文→「RSS 阅读器（[[jp:RSS リーダ]]）的画面上排列的是博客（[[jp:ブログ]]）等的新文章标题和概要。它不是查看博客编辑界面或访问人数统计的工具。」/ en 全文→ "An RSS reader ([[jp:RSS リーダ]]) lists the titles and summaries of new articles from sources such as blogs ([[jp:ブログ]]). It is not a tool for a blog's editing screen or for checking visitor counts." (否定 2 項は題の誤答と逆順。修正後 jp: 62 字・最長一致 6 字 = 用語名) |
| L3 | LOW **建議修** | `terms[1].points[2].text_jp/zh/en` | 2017h29h-q066 の前提「名前を正しく入力している」を明示しない。「名前では接続できない」は正しい名前を指すと読め、「最も疑われる」も保持し、過去問を誤答させないので限定条件落ち (HIGH) とはしないが、入力ミスでも同じ症状になるため字面は広い | jp「名前では接続できないのに」→「正しい名前を入力しても接続できないのに」/ zh「如果用名称连不上、」→「如果输入正确的名称也连不上、」/ en "If you cannot connect by name but can connect" → "If you cannot connect even with the correct name but can connect" |
| L4 | LOW **建議修** | `terms[2].points[1].text_jp/zh/en` | 「ドメイン名の左に付く部分」は字面上スキームも含み広い (jp-review r2 low、同用語の表が直後に示すので誤解の危険は小) | jp「ドメイン名の左に付く部分は」→「ドメイン名のすぐ左に付く部分は」/ zh「域名（[[jp:ドメイン名]]）左边的部分是」→「紧挨域名（[[jp:ドメイン名]]）左边的部分是」/ en "The part to the left of a domain name" → "The part immediately to the left of a domain name" |
| L5 | LOW **建議修** | `terms[3].points[0].text_zh/en` | jp の例示「〜など」が訳で落ち、設定どおりの表示だけが効果に読める (loc-review low) | zh 全文→「有了 cookie，可以按再次访问的用户的设置显示页面等，省去浏览时的麻烦。」/ en 全文→ "Cookies save effort while browsing, for example by showing a returning user a page with their settings." |
| L6 | LOW **建議修** | `terms[1].detail_zh` | `zh_terms.json` の PC = `PC（个人计算机）` が単元内で一度も使われない (validate は warn せず)。前例は初出に併記 | 「PC 先向 **DNS 服务器**」→「PC（个人计算机）先向 **DNS 服务器**」 |
| L7 | LOW **建議修** | `terms[0].analogy_en` | 比喩の標識が無く、ドメイン名と無関係な手順の説明に見える (他の 4 用語は Like / Think of、loc-review low) | "Instead of memorizing a friend's phone number, you pick their name in your contacts app and place the call." → "It is like picking a friend's name in your contacts app to place a call, instead of memorizing their number." |
| L8 | LOW 記録のみ | `terms[0].points[0]` 2 文目 ↔ detail 3 文目、`terms[2].points[1]` 1 文目 ↔ detail 3 文目・表、`terms[1].detail` 2 文目 ↔ 図、`terms[3].detail` 1 文目 ↔ 図 step 4 | §9 / D-203 同義の言い直し (jp-review r2 low)。引用題の判別点で事実は正しい | 記録のみ |
| L9 | LOW 記録のみ | `terms[1].points[0]` (MAC アドレス)、`terms[4].detail` (XML)、`terms[3].points[1]` (クロスサイトスクリプティング)、`terms[0].points[1]` (URL)、`overview_rows[1].extra_jp[1]` (名前解決) | 定義前・単元内未定義の語 (jp-review r1/r2 low)。MAC は対比相手の名前のみ、XSS は「攻撃」と添え、URL・名前解決は総表の一句で推測可。読解を止めない | 記録のみ |
| L10 | LOW 記録のみ | `terms[1].hook_jp/zh/en` | 略語の Name を「名前を引く係」に結ぶだけで、ほぼ定義の言い換え (§6)。zh「专员」は硬い | 記録のみ |
| L11 | LOW 記録のみ | `terms[1].points[1].text_zh` | `zh_terms.json` のプロキシ = `代理（Proxy）` に対し「代理服务器」。同文の「代理访问」と並ぶと表の語では読みにくく、意味は正しい。validate は warn せず | 記録のみ |
| L12 | LOW 記録のみ | `terms[4].one_jp`、`terms[4].fig.steps[0].caption_jp` | 「題名・概要・日時」の列挙順と「ニュースサイト」が未引用の 2009h21a-q075 の語順・語と重なる (語は全て同義置換、ed 大)。RSS の標準的な説明で写しではない | 記録のみ |
| L13 | LOW 記録のみ | `terms[4].detail_zh`・`fig.steps[2].caption_zh/en`・`detail_en`、`terms[3].fig.steps[1].caption_zh`・`points[2].text_zh`、`terms[1].analogy_zh`、`terms[0].points[0]`・`terms[2].points[0]` の zh/en、`pairs[0].rows[0].a_*` = `pairs[1].rows[0].a_*` | loc-review 未修 low (登记 / registered、交出、窗口、[[jp:通信規約]] 無し) と、対比表で同じ語を 2 回使う点。意味は正しい。loc-review の fix が使える | 記録のみ |
| L14 | LOW 記録のみ | `terms[2..4].hook_jp` (+ 派生 `memory_hook_jp`, `summary.memory_hooks_jp[2..4]`) | 5 フック中 3 つが「〜と思い出せる」で結ぶ (§9 同型の結びの反復、記憶フックの言い方としては許容; u06 の「と覚える」4/6 と同じ扱い) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① ドメイン名 / DNS: `pairs[0]` のみ。② ドメイン名 / URL: `pairs[1]` のみ (`key_points` は片側ずつ)。③ cookie / RSS: `pairs[2]` のみ。④ cookie / キャッシュ: `terms[3].points[2]` のみ。⑤ CSS / RSS: `terms[4].points[2]` のみ。⑥ IP / MAC: `terms[1].points[0]` のみ。⑦ DNS / DHCP・プロキシ: `terms[1].points[1]` のみ。⑧ cookie = 利用者側 / サーバ: hook が 1 箇所で対比、他 (detail・図・pairs[2].rows[1]・key_points[3]) は片側の位置の記述 → 許容。超過なし。

確認済みで問題なし: §9 禁止句 (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0、DNS points[1] は 2 用語に各説明 + 主語)、D-200、図の文字列の写し (遮蔽照合 0)、`[[jp:]]` 原語 16 種、図種 (tree steps ×1 / flow steps ×3 / static table ×1 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、D-205 該当なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **14** (建議修 7: L1〜L7 / 記録のみ 7: L8〜L14) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 14 件 (全件 qid 付き)・引用 21 題 + 未引用の quiz / challenge 4 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無い。過去の JP 審査の medium 3 は全て解消し退行なし。LOW 建議修 7 件は補丁 (B3) で修正推奨 — 特に **L1 は写しの例外 (一般表現) に依って HIGH を外した判定のため、補丁で必ず解消する**こと。L3 も限定条件の境界のため同時に直す。L8〜L14 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node scripts/textbook-v2-validate.mjs --unit technology-22-60-u02
✓ technology-22-60-u02 unit: 0 issues (data/ip/textbook/units/technology-22-60-u02.json)
EXIT=0
$ node scripts/textbook-v2-parity.mjs --unit technology-22-60-u02
✓ technology-22-60-u02 parity: 31 locations, 0 diff
EXIT=0
```
