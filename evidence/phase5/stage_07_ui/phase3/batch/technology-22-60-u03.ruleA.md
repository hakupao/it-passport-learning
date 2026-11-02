# Rule A 全数抽検 — technology-22-60-u03 (電子メールの仕組みと宛先指定)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-02 (S140 b10)、repo HEAD `7b23557` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b10-u03-a1` merge 結果、sha256 先頭 `d158367b4465548a`)。
- **対象**: `data/ip/textbook/units/technology-22-60-u03.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (メールボックス / 同報メール / メーリングリスト / cc / bcc / MIME) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `.planning/v2/technology-22-60-u03/v1-original.json` (用語 6 語・`term_zh`・`term_en`・challenge 5 題 [集合]・source_figures・`unit_summary_*` が v1 と一致)。横の整合: u01・u02 は v2 (u04・u05 は生成中で v1、用語一覧のみ参照)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_* / overview.intro_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 15 件 = exam 14 + mix 1、全件 qid 付き、引用 qid 延べ 25 件 = 異なり 19 題)**: `data/ip/quiz/questions.json` から各題の題文 (`stem_jp_clean` 優先)・選択肢・`correct_answer` を再読 (全題 topic `technology-22-60`)。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化・限定をせず、題の場面・前提を外していないことを 1 件ずつ確認。宛先の見え方の題 (2017h29a-q079 / 2019r01a-q079 / 2021r03-q059 / 2024r06-q096 / 2017h29h-q071) は図の表・pairs[1] を当てはめて解き直し、全て正答と一致。
3. **quiz / challenge_questions** (quiz 計 13 枠 + challenge 5 題、うち本文で未引用 1 題 = 2010h22a-q001): 2010h22a-q001 (受信者への配慮で最も適切 = 限られた顧客を Bcc に入れる; 誤答 = To に 100 名・無圧縮の大容量添付・Cc に複数顧客) は bcc の detail と cc の points[1] で解ける。無圧縮添付の肢に触れる記述は無く、支持もしない。challenge 2015h27h-q072 / 2016h28h-q066 / 2019h31h-q060 / 2019r01a-q079 / 2020r02o-q092 は全て引用題でもある。
4. **D-198 写し**: validate の copy guard = 0。独立照合: 単元の JP 文字列 113 本 (派生除く) × topic 内全 97 題の題文 (行単位含む) + 選択肢、12 字連続一致。**(a) カタカナ 4 字以上 + 英数を遮蔽** → **0 件**。**(b) 遮蔽なし** → 1 件 = `terms[5].hook_jp` の「Multipurpose」↔ 2010h22h-q058 題文 (規格名の綴り、偽陽性)。
   **(c) 近似一致** (文全体・節単位の正規化編集距離 ed / 文字 bigram Dice、半大域 ed も併用。較正: HIGH = ed 0.14 / Dice 0.52、建議修 = ed 0.40 / Dice 0.32):
   - **`terms[0].points[0]` ↔ 2018h30h-q059 小項目 c・2023r05-q092 正答**: 節 ed 0.49 / Dice 0.44、文全体 ed 0.52 / Dice 0.43。ed・Dice とも HIGH 較正に届かない。ただし主語以外の骨格が正答と同じで、語の置換 (名義→持つ、複数→別々、宛→に、一つ→1 か所、保存→集約) だけ → **L1 建議修**。修正案は ed 0.70 / Dice 0.34。
   - その他は全て較正から遠い: `terms[5].points[1]` 1 文目 ↔ 2022r04-q089 エ 0.67 / 0.44 (誤答の主述を正しい向きに戻した標準事実)、同 2 文目 ↔ 2022r04-q089 ア 0.60 / 0.43 (D-198 (iii) の列挙順: 考点の 書式→リンク→スクリプト は同題の肢の順 ア スクリプト→ウ リンク→エ 書式 の逆で、題の順序のままではない。同題の 3 肢の事実を 1 考点に集めているが、書式は 2019h31h-q060 ウ も支持する標準事実で、写しとしない)、`terms[0].points[2]` ↔ 2018h30a-q057 ③ 0.90 / 0.38、`terms[5].detail` 2 文目 ↔ 2022r04-q089 エ 0.70 / 0.39、`terms[3].points[0]` 後半 ↔ 2024r06-q096 (1) 0.48 / 0.51 (「知ることができる」の述語だけの一致で、人物名・場面なし; 短い節の偽陽性)。
   - **目視 (カタカナの多い文・具体例の流用)**: メーリングリスト points[0]・[1]、cc points[1]、bcc points[0]、Web メール考点を読み比べ、r1 で high だった MIME の誤答列挙は消えている。図・比喩の語句 (宅配 / 幹事 / 課長 / カーボン / 報告書 / 封筒 / 面識 / 流出) は topic 全題でヒットなし。「買い替」(r1 low) は本文から消えた。「名簿」= 2017h29a-q012 の同窓会名簿、「布」= 「配布」で別語 → 流用なし。A / B / X / Y の人物配置・100 名・同窓会などの場面も不使用。
5. **D-195**: 結論先行 (one = 1 文 × 6、太字あり)、展開 2〜3 文、比喩・フックが定義の言い換えでないこと (比喩 5 = 宅配ボックス / 幹事 / 参考欄 / 写しを渡す / 布を畳む、同報は比喩なし = r1 medium の削除; hook 5 = 語源 4 + 字面 1、メールボックスは hook なし) → L9。定義前使用 → L8。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → jp **0 件**、zh 相当語 0 件、en は every 内の very と同報 points[0] の must [受信者に知られてはならない場面の条件] のみで偽陽性)。図の型 (flow steps ×3 [メールボックス 4 / メーリングリスト 3 / MIME 3]、static table ×1 [bcc]、図なし ×2; 全て登録内)。pair 2 組 (各組 key 行あり)。
6. **D-200**: 考点数 3/2/2/3/3/2 (≤3 ✓)、各 JP 文数 1〜2・字数 28〜74 (≤100 ✓、最大は MIME `points[1]` の 74 字)。**framing 件数** (validateV2 `pointFraming`、全考点を実行): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 / D-204 単元全体点検**: 書き方 7 (「〜だけ」「〜ではない」の照合) → **M1 / L2**。r1 medium の「見え方だけ」は JP・zh・en とも解消、`terms[4].points[2]`・`pairs[1].rows[2]` (全員返信) と `key_points[2]` (中身は変わらない) は矛盾なし。比喩・hook の点検: cc 比喩「誰に渡したかが全員に分かる」は cc の範囲の像で bcc の否定を運ばない (L2 の修正で本文も揃う)。bcc 比喩は図と一致。MIME 比喩 (畳む→広げ直す) は符号化→復元の図と一致。書き方 8 → §3 の列挙、超過なし。書き方 9 → §2 表、限定条件の落ち 0。
8. **D-205**: 改訂のある文書 (規格・法律・ガイドライン・知識体系) の構成要素の個数・名称は本単元に無い。SMTP / POP3 は役割の名前のみ、MIME は展開形の語を hook で 2 語述べるだけで構成要素の網羅を言わない ✓。宛先欄「To / cc / bcc」は規格文書の構成ではなく欄の名前 ✓。
9. **三語**: zh・en が jp と同じ事実か (→ **M1** / L5 / L6)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 12 種が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語併記 = 和語 3 用語あり、cc / bcc / MIME は同綴りの英字語で併記不要 (validate 0)。zh 訳語 (`zh_terms.json`、unit 抽出 25 語): 邮箱・群发邮件・邮件列表・cc（抄送）・bcc（密送）・编码・服务器・电子邮件・文件 一致 (validate warn 0)。「附加文件 / 附件」の揺れ → L10。
10. **過去指摘の解消確認** (`journal.b10-u03-a1.jsonl`): jp-review r1 の high 1 + medium 3 → ① MIME 考点の誤答列挙 (high) = 第 2 文を削除、jp・zh・en とも解消 ② 同報の比喩「宛名だけ変えて」 = 比喩ごと削除、解消 ③ `terms[1].points[1]`「新たに漏れる情報はない」 = **jp・zh は「新たに知られるアドレスはない」に直ったが、en は "reveals nothing new" のまま同じ言い過ぎが残る → M1** ④「見え方だけ」・機能の列挙 = 三語とも解消。r1 low (面識・買い替え・goals の MIME) は解消、「MIME は添付のための規格」の範囲差は `points[0]` が「文字以外のデータ」に直して解消。r2 PASS の low → L2 / L3 / L4 / L7、loc-review PASS の low → L5 / L6 / L10 / L11 / L12 / L13 で扱う。
11. **横の整合 (u01 / u02)**: u02 はプロトコル類を「通信規約」と呼び本単元は SMTP / POP3 を「手順」と呼ぶ (引用題の語はプロトコル) が、矛盾ではなく記録のみ (L8)。u02 の「@ の右側」とメール宛先の説明、本単元の prerequisites = u02 に衝突なし。u01・u02 に SMTP / POP3 / MIME / cc / bcc の定義なし = 重複・食い違いなし。
12. **補丁の乾式確認**: §3 の建議修 (M1, L1〜L6, L11, L12) と L13 の `terms[4].points[2].text_zh` (loc-review の fix) を単元の scratch 複製に適用して validate / parity を実行 → 0 issues・warn 0 / 30 locations 0 diff。L10 の「附件」置換は `ファイル → 文件` warn を 3 件出したため、建議修にしない。実ファイルは不変。
13. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | メールボックス | OK — exam 3 / 4 題: 転送で自分の複数アドレス宛を 1 つのメールボックスへ (2018h30h-q059 正答エ = c のみ / 2023r05-q092 正答エ; 「自分が持つ」保持) / SMTP = 送信、POP3 = 受信 (両題の誤答 a・ア を否定) / Web メールはブラウザだけで可、専用ソフト・端末保存は不要 (2016h28h-q066 正答ウ = ②③ / 2018h30a-q057 正答エ = ②③; 誤答 ① [専用ソフト必要 / ブラウザでしか読めない] を支持しない。q066 ③ の前提「インターネット接続」は省略だが q057 ③ が「ブラウザだけ」で直接支持)。flow 4 段は detail と一致 | **L1 (正答の言い直し)** | zh「规程」L11 | L1 / L8 / L11 |
| 2 | 同報メール | OK — exam 2 / 2 題: 互いに知られたくないなら全員 bcc のみ、To 併記で見える (2015h27a-q078 正答ア、誤答エ の否定; 限定「知られたくない同報では」保持) / すでに互いのアドレスを知っている相手同士なら To に並べても新たに知られるアドレスはない (2017h29a-q012 正答ア = 不適切な事例 Cc、肢ウ [配布済み名簿の全員を宛先] が適切側; jp・zh は限定「アドレス」保持) | OK | **en は M1**、detail_en L6 | **M1** / L6 |
| 3 | メーリングリスト | OK — exam 2 / 4 題: 代表アドレス 1 つで登録者全員へ同じ内容 (2014h26h-q077 正答エ / 2015h27h-q072 正答ウ) / 宛先に全員のアドレスが並ぶわけではない (2018h30h-q059 誤答 b / 2023r05-q092 誤答イ の否定)。flow 3 段は one と一致。送信者がアドレスを知らなくてよいは標準事実で誤答を支持しない | OK | OK (「登记者」L12) | L7 / L12 |
| 4 | cc | OK — exam 2 / 3 題 + mix 1 / 1 題: To と cc は互いに見える (2017h29a-q079 正答イ / 2021r03-q059 正答ウ、誤答イ の否定) / 互いのアドレスを知らない相手同士を cc に並べると個人情報保護上の問題 (2017h29a-q012 正答ア; 題の「複数の顧客」を一般化、r1 low の「面識」は解消) / 知られてよい = cc、知られたくない = bcc (2020r02o-q092 正答ア; 題の「参考までに」保持) | OK | points[1]_en L5 | L2 / L5 |
| 5 | bcc | OK — exam 3 / 6 題: 本文・添付は変わらない (2014h26a-q064 誤答イ / 2026r08-q075 誤答ウ の否定; 正答の「他の宛先へ通知されない」は one が担う) / bcc の人に To・cc は見え、他の bcc は見えない (2017h29a-q079 誤答エ / 2019r01a-q079 正答エ = R のみ全員を知る / 2024r06-q096 正答ウ = (2) のみ) / cc の人の全員返信は bcc に届かない (2017h29h-q071 正答イ = A, X; Y = cc、Z = bcc の前提を一般化)。表 3 × 3 を 5 題に当てはめて全て正答と一致 | OK | zh の構文 L13 | L7 / L9 / L13 |
| 6 | MIME | OK — exam 2 / 3 題: 文字以外のデータをメールで運ぶ規格 (2010h22h-q058 正答ア; 誤答 ウ [HTML 記述] は L3) / 書式・リンク = HTML 形式、スクリプトの危険も HTML 側 (2019h31h-q060 正答ウ / 2022r04-q089 正答ウ、誤答ア・エ の否定; 「おそれ」保持)。detail「添付はどちらでも可」は q060 イ・q089 イ の否定と一致。Base64 等の符号化は題の外だが標準事実で矛盾なし | OK | zh「附加文件」L10 | L3 / L4 / L7 / L8 / L10 |

**単元レベル**: goals 4 点・overview_cols 1・overview_rows 6 行・pairs 2 組 (同報 / メーリングリスト 3 行 key 1、cc / bcc 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 5 件 (v1 と同一集合、本文と矛盾なし)。`source_figures` は v1 継承の 2020r02o-q092。事実誤りなし。三語は M1 を除き一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 13 (うち 建議修 8)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[1](同報メール).points[1].text_en` | "reveals nothing new" は jp「新たに知られるアドレスはない」・zh より広い。JP 審査 r1 が medium とした「新たに漏れる情報はない」と同じ言い過ぎが en だけ残った。To に並べれば誰に送ったかは新たに伝わり、同じ単元の cc mix 考点 (2020r02o-q092: 送った事実を知られたくない) と食い違う (観点 7 / 引用題 2017h29a-q012 の範囲超え) | en: "When people already know one another's addresses, listing them together in To reveals nothing new." → "When people already know one another's addresses, listing them together in To reveals no new addresses." (jp・zh は不変) |
| L1 | LOW **建議修** | `terms[0](メールボックス).points[0].text_jp/zh/en` | 2018h30h-q059 c・2023r05-q092 正答の骨格を語の置換でなぞる (節 ed 0.49 / Dice 0.44、§1-4)。HIGH 較正には届かず、転送機能の標準的な説明でもあるので写しとはしない | jp「自分が持つ別々のアドレスに届くメールを 1 か所のメールボックスに集約できる。」→「アドレスをいくつ持っていても、メールの受け取り先を 1 つのメールボックスにまとめられる。」/ zh「可以把发到自己不同地址的邮件集中到一个邮箱（[[jp:メールボックス]]）里。」→「不管有几个地址，都可以把收信的地方集中到一个邮箱（[[jp:メールボックス]]）。」/ en "mail arriving at your separate addresses can be gathered into one mailbox ([[jp:メールボックス]])." → "however many addresses you have, all their mail can end up in one mailbox ([[jp:メールボックス]])." (修正後 jp: ed 0.70 / Dice 0.34) |
| L2 | LOW **建議修** | `terms[3](cc).detail_jp/zh/en` | 「受信者は自分のほかに誰へ送られたかを読み取れる」は送り先の全体が分かるようにも読め、bcc の説明と字面で衝突する (r2 low)。前半の「cc の相手のアドレスは」が文脈を限るので事実の誤りとはしないが、2021r03-q059 ア の型の誤読を招きうる | jp「受信者は自分のほかに誰へ送られたかを読み取れる。」→「受信者は cc でほかに誰へ送られたかを読み取れる。」/ zh「所以收件人能看出除自己之外还发给了谁。」→「所以收件人能看出还抄送给了谁。」/ en "so recipients can tell who else received it." → "so recipients can tell who else was copied." |
| L3 | LOW **建議修** | `terms[5](MIME).detail_jp/zh/en` | MIME の説明から本文形式の話へ断りなく続き、HTML 形式の機能を MIME の働きと取り違える読み方が残る (r2 low; 2010h22h-q058 誤答ウ の型)。r1 high の修正で「別物」の文が消えたため | jp「メール本文の形式としては、」→「これとは別に、メール本文の形式としては、」/ zh「邮件正文的格式常用的有」→「另外，邮件正文的格式常用的有」/ en "The common body formats are" → "Separately, the common body formats are" |
| L4 | LOW **建議修** | `goals_jp[3]` (+ 派生 `overview.intro_jp`) | 「制約を広げた」は語の結び付きが不自然 (r2 low)。zh「放宽…限制」・en "lifted" は問題なし | jp「制約を広げた」→「制約を緩めた」 |
| L5 | LOW **建議修** | `terms[3](cc).points[1].text_en` | "strangers" は「互いのアドレスを知らない相手同士」より狭い。r1 low で JP から外した「面識」の意味が en に残る (loc-review low) | en "Listing strangers together in cc exposes their addresses, which" → "Listing people who do not know each other's addresses together in cc exposes those addresses, which" |
| L6 | LOW **建議修** | `terms[1](同報メール).detail_en` | cc の相手が共有する側に読める (loc-review low) | en "**cc** for those sharing it for reference" → "**cc** for those copied for reference" |
| L11 | LOW **建議修** | `terms[0](メールボックス).points[1].text_zh` | SMTP / POP3 の「规程」は硬い。中国語の IT 文脈は协议 (loc-review low) | zh「是发送邮件的规程，**POP3** 是从邮箱收取邮件的规程」→「是发送邮件的协议，**POP3** 是从邮箱收取邮件的协议」 |
| L12 | LOW **建議修** | `pairs[1].rows[0].b_en` | it が何を指すか不明確で、メール自体を届けないとも読める (loc-review low) | en "Keeps it from the other recipients" → "Hides the person from the other recipients" |
| L7 | LOW 記録のみ | `terms[2].points[0]` ↔ one、`terms[5].points[0]` ↔ one・`key_points[3]`、`terms[4].points[0]` ↔ `key_points[2]`、`terms[0].detail` ↔ `key_points[0]` | §9 / D-203 同義の言い直し (r2 low)。引用題の判別点で事実は正しい | 記録のみ |
| L8 | LOW 記録のみ | `terms[5].points[1]` (スクリプト)、`terms[0].points[1]` (SMTP / POP3 の「手順」)、`terms[5].detail` (HTML) | 単元内に定義のない語と、u02 の「通信規約」・引用題の「プロトコル」との呼び分け。読解を止めず、語の役割は文中で分かる | 記録のみ |
| L9 | LOW 記録のみ | `terms[4].analogy_jp/zh/en` | 「他の人には言わずに別の人へそっと渡す」は one の「他の受信者に伏せて」にかなり近い (§6) が、場面は書類の手渡しで否定内容を運ばない | 記録のみ |
| L10 | LOW 記録のみ | `terms[5].detail_zh`・`points[0].text_zh`・`fig.data.nodes[0].label.zh`、`key_points_zh[3]` | 添付ファイルの訳が「附加文件」「附件」に割れる (loc-review low)。「附件」に揃えると validate の `ファイル → 文件` warn が 3 件出るので (§1-12)、語表の扱いを決めずに補丁しない | 記録のみ (語表の批間候補) |
| L13 | LOW 記録のみ | `terms[4].points[2].text_zh`、「登记者」の全箇所、「对象」の全箇所 (`terms[4].fig.data.cols[1..3].zh` ほか) | 構文のぎこちなさ・日式の語感 (loc-review low)。意味のずれなし。loc-review の fix が使える | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 同報 / メーリングリスト: `pairs[0]` のみ (`goals[1]` は予告)。② cc = 見える / bcc = 見えない: `pairs[1].rows[1]`、bcc の表 (D-195 の図)、各 one (定義そのもの) → 許容。③ cc = 届く / bcc = 届かない (全員返信): `pairs[1].rows[2]`、`terms[4].points[2]` = 2 箇所。④ cc / bcc の使い分け: `pairs[1].rows[0]`、`terms[3].points[2]` (mix) = 2 箇所。⑤ SMTP / POP3: `terms[0].points[1]` のみ。⑥ テキスト / HTML 形式: `terms[5].detail`、`terms[5].points[1]` (片側) → 許容。超過なし。

確認済みで問題なし: §9 禁止句 (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200、図の文字列の写し (遮蔽照合 0)、`[[jp:]]` 原語 12 種、図種 (flow steps ×3 / static table ×1 / 図なし ×2 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、D-205 該当なし、限定条件 (考点 15 件全て保持。en の M1 を除く)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **13** (建議修 8: L1〜L6, L11, L12 / 記録のみ 5: L7〜L10, L13) |

## 5. 判定

**FAIL** (D-199: HIGH 0 かつ MEDIUM 0 を満たさない)。不合格の理由は **M1 の 1 件のみ**で、en の 1 文の文字列置換で解消できる (構造変更なし)。全 6 用語・考点 15 件 (全件 qid 付き)・引用 19 題 + 未引用の quiz 1 題で、JP の考点の主張は正答と一致し、誤答肢を支持する記述は無い。過去の JP 審査の high 1 / medium 3 は JP・zh で全て解消し、en に M1 だけが残る。M1 + LOW 建議修 8 件を補丁 (B3) で適用すれば PASS 条件を満たす見込みで、§1-12 の乾式で validate / parity は 0。**補丁適用後の確認は補丁の実物で行うこと**。L7〜L10, L13 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-22-60-u03
✓ technology-22-60-u03 unit: 0 issues (data/ip/textbook/units/technology-22-60-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-22-60-u03
✓ technology-22-60-u03 parity: 30 locations, 0 diff
EXIT=0
```
