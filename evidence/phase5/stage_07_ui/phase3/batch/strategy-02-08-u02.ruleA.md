# Rule A 全数抽検 — strategy-02-08-u02 (標準化団体)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S150 b53)、repo HEAD `be49bdf9` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b53-u02-a1` merge 結果、sha256 先頭 `04645221d97faf38`)。
- **対象**: `data/ip/textbook/units/strategy-02-08-u02.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (ISO / IEC / IEEE / W3C / JIS) + 単元レベル (goals / overview_rows / pairs / key_points / overview / challenge_questions)。
- **基準**: D-195、D-197 / D-198 / D-199 / D-200、D-202 / D-203、D-204 / D-205、D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `.planning/v2/strategy-02-08-u02/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも manifest `v1_terms` と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生 `definition_*` が `one_*` の記法除去版であることをスクリプトで確認 (15/15 一致)。
2. **考点 × 引用題 (考点 9 件 = exam 6 + mix 3、引用 qid 延べ 9 = 異なり 7 題)**: `questions.json` + `translations/<exam>.json` の `stem_jp_clean` で各題の題文・選択肢・`correct_answer` を再読 (全題 topic `strategy-02-08`)。
3. **quiz / challenge**: quiz 枠 6 (ISO 1・IEC 1・IEEE 1・W3C 0・JIS 2) + challenge 3 (2018h30h-q032 / 2011h23a-q015 / 2018h30a-q033)。chumon (2012h24h-q097/098 = ISBN チェック数字) は本単元の見出し語外で、本文から参照されない。
4. **D-198 写し**: validate copy guard 0 件・`choice-echo` warn 0 件。独立照合: 単元の JP 文字列 85 本 (派生除く) を topic 内全 29 題の題文 (stem_jp_clean) + 選択肢と 12 字連続照合 — (a) カタカナ 4 字以上と英数を □ に遮蔽 (遮蔽後実字 6 未満の窓は除外) → **0 件**、(b) 遮蔽なし → 6 件、(c) 14 字窓・1〜2 字置換の近似照合 → 7 件。(b)(c) は全て「マネジメントシステム(規格/の/など)」という見出し語級の一般名詞 1 語を跨いだだけの窓 (2018h30h-q032 / 2025r07-q002 / 2014h26a-q003 / 2017h29a-q010) で偽陽性。カタカナの多い文 (ISO points[0]・JIS points[1]・IEEE detail・key_points[0]) は目視で確認し、題文の語順・組の流用なし (§2、L6)。
5. **D-195**: one 1 文 × 5 (太字あり)、detail 3 文 × 5、図 = IEC tree static (ISO/IEC/ITU の 1 段)・JIS flow steps 4 (登録内)、pairs 2 組 (ISO/IEC 3 行 key 1、IEEE/W3C 3 行 key 1) は後側用語の後に配置。定義前使用: デジュレスタンダード = ISO detail で括弧内定義、デファクト = ISO mix 考点内で定義、JISC = ISO detail で正式名、ITU = IEC 考点で正式名、勧告 = W3C detail、JIS Q = JIS detail (図 steps[3] が detail より先に出るのは jp-review r2 の LOW と同じ、記録のみ)。**§9 禁止句 grep** (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `試験` 1 (IEC detail「試験の方法」= 通常語、偽陽性)。ただし活用形 **「略称とされ、」** (ISO `hook_jp`) が完全一致 grep を逃れていた → L5。zh / en (必须 / 考试 / 务必 / 记住 / must / exam / always / important / remember) → `exam` は `kind` 値と "example" のみ (偽陽性)。
6. **D-200**: 考点数 2/2/2/1/2 (≤3 ✓)、JP 文数 1〜2、字数 58〜88 (≤100 ✓、最大 JIS `points[1]` 88 字)。**framing 件数** (`validateV2.pointFraming`、全考点を tsx で実行): jp 0 / zh 0 / en 0。
7. **一次資料照合 (単元指定: 団体の名称・範囲・関係)**: 公式サイトは iso.org / iec.ch / jisc.go.jp / meti.go.jp / kanto.meti.go.jp が直接取得を拒否 (WebFetch・curl とも 403 / 502 / 202 空)。このため以下は **当該ドメインに限定した検索結果の抜粋** で確認した (ドメイン明記)。w3.org/about は WebFetch で直接取得、itu.int About は curl で直接取得。
   - ISO (iso.org 限定検索: About・"Friendship among equals" 史料 PDF): 名称は略語でなくギリシャ語 isos 由来、英語なら IOS・仏語なら OIN になるため ISO とした → hook と一致 (「とされ」の留保は不要、L5)。設立: 1946 年 10 月ロンドン会議の翌 1947 年に発足 (About ページは「1946 年以来」と書く版もある) → 単元の 1947 年は ISO 自身の史料で支持。各国の国家標準化機関のネットワーク・中央事務局ジュネーブ → detail と一致。日本の加盟機関 = JISC (jisc.go.jp 限定検索「ISO の概要」: 1952 年から加盟、IEC は 1953 年) → ISO detail「日本からは JISC」と一致。
   - IEC (iec.ch 限定検索: History / How & why): 1906 年 6 月ロンドンで設立、1948 年にジュネーブへ移り ISO と同じ建物を共用 → detail・pairs[0].rows[2] (1906 / 1947) と一致、IEC は ISO の下部組織ではない (analogy の「独立して建つ専門病院」と一致)。会員 = 各国の National Committee → overview_rows[1].extra・detail と一致。
   - ITU (itu.int 直接): 国連の ICT 専門機関、1865 年設立、通信網の技術標準を作る → IEC points[0]「国連の専門機関…電気通信の国際標準化」と一致 (2021r03-q002 正答エと一致)。
   - IEEE (ieee.org 系の支部ページ・History ページの検索抜粋; 本体 About は空応答): Institute of Electrical and Electronics Engineers、読みは "eye-triple-E"、1963 年 AIEE と IRE の合併で発足 (起源はニューヨーク)、個人会員 (技術者・科学者など)、Ethernet = 802.3・Wi-Fi = 802.11 → one / detail / hook / points[0] と一致。「個人の技術者が会員」は科学者等も含む会員層の要約として IT パスポートの水準で許容。
   - W3C (w3.org/about 直接): 1994 年 Tim Berners-Lee が設立、世界の組織が Member として参加、標準は W3C Recommendations → detail「1994 年」「企業や大学、研究機関などが会員」「勧告」と一致。
   - JIS / JISC (jisc.go.jp・meti.go.jp 限定検索の抜粋): 2019 年 (令和元年) 7 月 1 日施行の改正で工業標準化法 → 産業標準化法、日本工業規格 → 日本産業規格、対象にデータ・サービス・経営管理等を追加 → JIS detail 2 文目と一致。日本工業標準調査会 → 日本産業標準調査会 (JISC) も同改正での改称 (METI 資料 "JIS法の抜本的改正")。単元は現称のみを使い旧称を書かないが、旧称 JISC を使う過去問は topic 内に無い (O2)。英語名 Japanese Industrial Standards / JISC (Japanese Industrial Standards Committee) は改称後も不変 → JIS hook / ISO detail_en と一致。**同改正で、認定産業標準作成機関が作った JIS 案は JISC の審議を経ずに主務大臣が制定できる仕組みが加わった** (meti.go.jp 抜粋「審議会（JISC）の審議を経ずに迅速に制定できるスキーム」) → JIS detail 1 文目の言い切りに例外がある → L1。
   - ANSI / CEN (2018h30h-q032 の誤答肢)・ICANN (2021r03-q002 / 2016h28a-q019 の誤答肢) は単元本文に登場しない。単元はどれも ISO / ITU / IEEE を正の定義で述べるだけで、これらの誤答肢を支持する記述は無い。
8. **三語**: zh・en が jp と同じ事実か、図ラベル・caption・pairs セルの三語一致、`[[jp:…]]` 原語 13 種 (イーサネット / デジュレスタンダード / デファクトスタンダード / マネジメントシステム規格 / 会議 / 勧告 / 国家規格 / 国際標準化機構 / 国際電気標準会議 / 国際電気通信連合 / 学会 / 日本工業規格 / 日本産業規格) が jp 本文に実在 (スクリプト、全 ok)。zh 訳語 (`zh_terms.unit.json`: デジュレ = 法定标准、デファクト = 事实标准、LAN = 局域网（LAN） 等) 一致、validate B6 warn 0。
9. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | ISO | OK — exam: ISO は製品規格に加えマネジメントシステム規格も策定、例 = 品質 9001・情報セキュリティ ISO/IEC 27001 (2018h30a-q014 正答イ = 情報セキュリティ MS、誤答 = コンテンツ / タレント / ナレッジ MS を支持しない / 2018h30h-q032 正答ウ ISO)。「ISO/IEC 27001 を ISO の例とする」は IEC mix 考点「どちらの機関の規格としても扱われる」と整合 (jp-review r1 MEDIUM の解消を確認、zh / en も同義で退行なし)。mix: ISO 規格 = 加盟国の合意によるデジュレ、デファクトとは道筋が違う — 正しい (2009h21a-q001 の正答ウ = デファクトの定義とも整合、表記は u01・シラバスどおり「デジュレ」に修正済み)。一次資料: §1-7 | OK。points[0] は q032 題文の 2 MS の組と重なる (順序は逆、規格番号付きの一般定義) → L6 | detail_zh / en が組織 ISO を「標準の代表」と述べる → L2 | L2 / L5 / L6 |
| 2 | IEC | OK — exam: IEC の分野は電気・電子技術、電気通信は国連専門機関 ITU (2021r03-q002 正答エ ITU = 電気通信; 誤答イ IEC = 電子商取引を否定)。D-208 (iii): 分類型の題で、正答の内容 (ITU) と見出し語 IEC の分野を正の定義で述べる → D-209 の免除に該当、選択肢 4 つの組・順序 (ICANN / IEC / IEEE / ITU) は再現せず ICANN・IEEE に触れない、`choice-echo` warn 0。mix: ISO/IEC を冠した規格は共同で作り、どちらの機関の規格としても扱われる — 正しい (iec.ch / iso.org の共同委員会 JTC 1 の運用と一致)。図 (ISO: 電気・電子と電気通信を除く / IEC / ITU) と pairs[0].rows[1] 一致 (jp-review r1 LOW の不揃いは解消) | OK。points[0] 1 文目は one の言い直し (§9) → L7 | **analogy_en が ISO を「他の全ての診療科」と閉じ、図・pairs の「電気通信を除く」と食い違う → M1** | **M1** / L7 |
| 3 | IEEE | OK — exam: 米国に本部の技術者の学会、有線 LAN 802.3・無線 LAN 802.11 (2016h28a-q019 正答イ IEEE; 誤答 ICANN / ISO / W3C を支持しない / 2011h23a-q015 正答イ の 802.3 = LAN 部分と一致)。mix: 会員は個人、ISO・IEC は各国機関・委員会が加盟 — 正しい (§1-7)。hook「アイトリプルイー」= "eye-triple-E" 一致 | OK。points[0] は q019 題文の要素 (米国・学会・有線 / 無線 LAN) を全て含むが、語順が違い規格番号を加えた一般定義 (分類型 → D-209 免除、jp-review r2 LOW と同判断) → L6 | OK | L6 |
| 4 | W3C | OK — 引用題 0 (freq 0)。mix: W3C の対象は Web ページ・ブラウザの技術で、ネットワーク規格の IEEE と層が違う — 正しい (2016h28a-q019 の誤答 W3C を退ける方向と整合)。detail (1994 年・Berners-Lee・会員 = 企業や大学など・「勧告」) は w3.org/about と一致 | OK | detail_zh / key_points_zh[3] の「建议」→ L3 | L3 |
| 5 | JIS | OK — exam: JIS は国際規格との整合を図る国家規格で、ISO を基に内容をそろえた JIS が数多い (2015h27h-q014 正答ア = 国際規格との整合性に配慮; 誤答 = 不適合品の製造販売禁止 / 民間団体の標準集 / 食品・医薬品の基準 を支持しない。限定条件「数多くある」で全 JIS とは言わない)。exam: ISO の MS 規格に対応する JIS は JIS Q + 同番号、品質 JIS Q 9001・情報セキュリティ JIS Q 27001 (2014h26a-q003 正答ア / 2018h30a-q033 正答イ)。JIS Q 15001 (誤答肢ウ、国内独自規格) は「ISO に対応する」限定の外で矛盾なし。**D-210**: 2015h27h-q014 (題文) と 2009h21a-q001 (誤答肢ア) は改正前の名称「日本工業規格」で書かれている。detail 2 文目 (2019 年 7 月施行の法改正で名称が日本工業規格 → 日本産業規格、対象にデータ・サービス追加) と hook (英語名は不変) が版を明示しており、考点の主張 (国際規格との整合) は改正の前後で変わらないため版の前置きは不要 → 充足。JIS Q = マネジメントシステム (管理システム) の部門記号 — 正しい | OK。points[1] の 9001 / 27001 は 2014h26a-q003 の 4 肢中 2 つで、各題の正答を対応規則として述べる分類型 (D-209 免除、組・順序の再現なし) → L6 | OK (zh「日本产业规格」は v1 継承、[[jp:]] 併記あり → 記録のみ O3) | **L1** / L4 / L6 |

**単元レベル**: goals 3・overview_cols 2 (組織の種類 / 主な対象)・overview_rows 5・pairs 2 組・key_points 5・overview.intro (= goals 連結)・challenge 3 件 — 本文と矛盾なし。2018h30h-q032 は ISO points[0] で、2018h30a-q033 は JIS points[1] で、2011h23a-q015 は IEEE 802.3 = LAN と ISO 9001 = 品質で解けるが、ISO 14001 = 環境は本単元で番号として教えない (ISO detail「品質や環境などを管理する仕組み」まで; 番号付き規格は manifest rationale どおり u03 の範囲) → O1。前回 (journal) の challenge 2009h21a-q001 は外され、jp-review r1 の LOW (確認題としての適合の弱さ) は解消。

**前回指摘の解消確認** (`journal.b53-u02-a1.jsonl` result 行): jp-review r1 MEDIUM 4 件 — ① IEC mix の「どちらか一方の規格ではない」→ 正の言い方に修正済み (zh / en も同義) ② 「デジュール」→「デジュレ」2 箇所修正済み (zh / en は [[jp:デジュレスタンダード]]) ③ IEC analogy の「分科会」→ 独立の専門病院に修正済み (**ただし en に新たな閉じた範囲 → M1**) ④ JIS analogy → 「多くの章」に範囲を合わせ済み (zh「很多章节」/ en "many chapters" 退行なし)。jp-review r2 PASS の LOW 7 件と loc-review r1 PASS の LOW 4 件は未適用のまま (loc LOW 3 件は L2 / L3 / L8 として 建議修 に引き上げ、1 件は O3)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 8 (うち 建議修 5)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[1](IEC).analogy_en` | jp「幅広い診療科をそろえた総合病院」/ zh「设有各种科室的综合医院」に対し、en だけが "a general hospital that covers **every other department**" と ISO 側を「電気以外の全て」に閉じる。同単元の図ラベル `terms[1].fig…children[0].label.en` と `pairs[0].rows[1].a_en` は「電気・電子と**電気通信**を除く」で、電気通信は ITU の担当 (IEC points[0] / 2021r03-q002 正答)。比喩が他欄と食い違う範囲を言い切る (観点 7 / D-204、zh / en のみの不整合 = 既知失敗型 (5)(6)) | before: `standing on its own beside a general hospital that covers every other department.` → after: `standing on its own beside a general hospital that covers a wide range of departments.` (jp / zh 変更なし) |
| L1 | LOW **建議修** | `terms[4](JIS).detail_jp/zh/en` 1 文目 | 「JISC の審議を経て主務大臣が制定する」と言い切るが、同じ detail が述べる 2019 年 7 月施行の改正で、認定産業標準作成機関の JIS 案は JISC の審議を経ずに制定できる仕組みが加わった (meti.go.jp 抜粋、§1-7)。D-205 / 既知失敗型 (10) の MEDIUM にしないのは、制定経路を問う引用題・quiz・challenge が無く、どの正答・誤答にも影響しないため (欠落が無害だからではない)。図 `fig.steps[0]` は「流れの例」と明示しており図は変更不要 | jp「日本産業標準調査会 (**JISC**) の審議を経て主務大臣が制定する。」→「日本産業標準調査会 (**JISC**) の審議を経て主務大臣が制定するのが原則である。」/ zh「JIS 依据《产业标准化法》，经日本产业标准调查会（**JISC**）审议后由主管大臣制定。」→「JIS 依据《产业标准化法》，原则上经日本产业标准调查会（**JISC**）审议后由主管大臣制定。」/ en "Under the Industrial Standardization Act, JIS are enacted by the competent minister after review by the Japanese Industrial Standards Committee (**JISC**)." → "Under the Industrial Standardization Act, JIS are, as a rule, enacted by the competent minister after review by the Japanese Industrial Standards Committee (**JISC**)." |
| L2 | LOW **建議修** | `terms[0](ISO).detail_zh` / `detail_en` 2 文目 | jp は「規格は加盟国の合意で決まるため、(その規格は) デジュレスタンダードの代表」と規格を主語に読めるが、zh「因此 ISO 是…标准…的代表」・en "ISO is the leading example of a standard" は組織 ISO を「標準」と言う (組織と規格の区別が崩れる、loc-review r1 LOW の未適用分) | zh「因此 ISO 是通过正式程序制定的标准，」→「因此 ISO 标准是通过正式程序制定的标准，」/ en "ISO is the leading example of a standard set through formal procedures, a **de jure standard** ([[jp:デジュレスタンダード]])." → "ISO standards are the leading example of standards set through formal procedures, **de jure standards** ([[jp:デジュレスタンダード]])." |
| L3 | LOW **建議修** | `terms[3](W3C).detail_zh`、`key_points_zh[3]` | W3C Recommendation の zh 通称は「推荐标准」で、「建议」は直訳寄り (loc-review r1 LOW の未適用分、[[jp:勧告]] 併記で意味は保たれる) | detail_zh「以“**建议**”（[[jp:勧告]]）的形式公开。浏览器开发者和网站制作者遵循同一份建议，」→「以“**推荐标准**”（[[jp:勧告]]）的形式公开。浏览器开发者和网站制作者遵循同一份推荐标准，」/ key_points_zh[3]「以“建议”的形式公开」→「以“推荐标准”的形式公开」 |
| L4 | LOW 記録のみ | `goals_jp/zh/en[2]` (+ 派生 `overview.intro_*`) | 「国際規格と内容を合わせて作られる」は JIS 全体を言うように読め、JIS points[0]「数多くある」・analogy「多くの章」・key_points[4]「ものが多い」より広い (jp-review r2 LOW の未適用分)。2015h27h-q014 正答 (整合性に配慮) とは矛盾せず、目標文の要約 | 任意: jp「国際規格と内容を合わせて作られることを」→「国際規格と内容を合わせたものが多いことを」/ zh「并且是与国际标准的内容保持一致来制定的。」→「并且很多 JIS 与国际标准的内容保持一致。」/ en "and is written to match the content of international standards." → "and that many JIS match the content of international standards." |
| L5 | LOW **建議修** | `terms[0](ISO).hook_jp/zh/en` (+ 派生 `memory_hook_*`, `summary.memory_hooks_*[0]`) | 「略称とされ」は §9 禁止句「とされる」の活用形 (完全一致 grep を逃れていた)。ISO 自身が isos 由来と明言しており (iso.org)、留保は不要 | jp「ギリシャ語の isos (等しい) にちなんだ略称とされ、」→「ギリシャ語の isos (等しい) にちなんだ略称で、」/ zh「一般认为它取自希腊语 isos（相等），」→「它取自希腊语 isos（相等），」/ en "The short name is said to come from the Greek isos," → "The short name comes from the Greek isos," |
| L6 | LOW 記録のみ | `terms[0].points[0]`、`terms[2].points[0]`、`terms[4].points[1]` (各 text_jp) | D-208 (iii) 検討: ISO 考点の 2 MS の組は 2018h30h-q032 題文の組 (順序逆)、IEEE 考点は 2016h28a-q019 題文の要素一式 (語順違い・番号付き)、JIS 考点の 9001 / 27001 は 2014h26a-q003 の 4 肢中 2 つ。いずれも分類型の題の正答を見出し語の一般定義・対応規則として述べ (D-209 免除)、題文・選択肢の語句・順序の再現はなく、遮蔽照合 0 件。jp-review r2 と同判断 | 記録のみ |
| L7 | LOW 記録のみ | `terms[1](IEC).points[0].text_jp` 1 文目、`terms[0].points[1]` 前半、`key_points_jp[0..1]` | §9 言い直し: IEC 考点 1 文目は one の再述、ISO mix 前半は detail 2 文目、key_points[0] は ISO exam 考点、key_points[1] は IEC detail 3 文目・mix 考点と同内容 (D-203 low) | 記録のみ (IEC 考点 1 文目は 2 文目 ITU との対比の前提で、削ると考点が独立して読めない) |
| L8 | LOW **建議修** | `key_points_en[1]` | "Standards that span both fields" は key point 単独で読まれると "both fields" の指す先が無い (jp「2 つの分野」は直後の ISO と IEC で補われる; loc-review r1 LOW の未適用分) | "Standards that span both fields, such as those for information technology," → "Standards that span the two bodies' fields, such as those for information technology," |

**対比の出現欄 (書き方 8 の列挙)**: ① ISO = 幅広い / IEC = 電気・電子: `pairs[0].rows[1]` (key)、IEC fig、各 one (定義そのもの)、IEC points[0] 1 文目 (L7) → 許容 (fig は ITU を加える点で表と別の情報、jp-review r2 LOW と同判断)。② 会員構成 (個人 / 各国機関): IEEE points[1] (mix)、`pairs[1].rows[0]`、overview_rows extra → 2 箇所 + 総表の構造で許容。③ IEEE = ネットワーク / W3C = Web: W3C points[0] (mix)、`pairs[1].rows[1]` (key) → 許容。④ デジュレ / デファクト: ISO points[1] のみ → 許容。`goals_jp[0..1]` は観点の予告。

**範囲外の観察**:
- O1 challenge 2011h23a-q015 は ISO 14001 = 環境マネジメントの知識も要るが、本単元は番号を教えない (u03 の範囲)。誤答の消去 (802.3 = LAN・9001 = 品質) で正答に届くため指摘しない。
- O2 JISC の旧称「日本工業標準調査会」は単元に書かれていない。旧称を使う過去問は topic 内に無く (全 29 題を確認)、D-210 の要件外。JIS 本体の改称は detail と hook が明示。
- O3 `terms[4].one_zh / detail_zh`・`overview_rows[4].one_line_zh` の「日本产业规格」は v1 継承の訳で、大陸の通称は「日本工业标准 / 日本产业标准」(loc-review r1 LOW)。[[jp:日本産業規格]] 併記があり誤解は生じない → 記録のみ。

確認済みで問題なし: 限定条件 (考点 6 件の exam 全て保持; JIS「数多くある」「ISO に対応する」)、誤答肢を支持する記述 0、§9 禁止句 (L5 以外 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200、写し (validate 0・遮蔽照合 0・非遮蔽 / 近似のヒットは一般名詞のみ)、`[[jp:]]` 原語 13 種実在、one_zh / one_en の見出し語 (英字略称は三語同形)、zh 訳語 (B6 warn 0)、図種 (tree static ×1 / flow steps ×1 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、一次資料照合 (§1-7: 名称・設立年・本部・会員構成・分野・ISO/IEC 共同規格・ITU・JIS 改称と対象拡大 — L1 以外 一致)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **8** (建議修 5: L1 / L2 / L3 / L5 / L8、記録のみ 3: L4 / L6 / L7、L4 は任意の修正案あり) |

## 5. 判定

**FAIL (補丁で PASS 可)** — D-199: MEDIUM 1 件 (M1、en の比喩 1 句のみ、jp / zh は正しい)。事実・考点・引用題の限定条件・D-198 写し・D-210 版明示はいずれも問題なし。M1 を B3 補丁 (`terms[1].analogy_en` の文字列置換 1 件) で直せば HIGH 0 / MEDIUM 0 となる。LOW 建議修 5 件 (L1 / L2 / L3 / L5 / L8) も同じ補丁で適用を推奨。補丁後は validate / parity の再実行と M1 箇所の再確認で足りる。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-02-08-u02
✓ strategy-02-08-u02 unit: 0 issues (data/ip/textbook/units/strategy-02-08-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-02-08-u02
✓ strategy-02-08-u02 parity: 24 locations, 0 diff
EXIT=0
```
