# Rule A 全数抽検 — technology-14-39-u01 (データ記述言語 (マークアップ言語と構造化データ形式))

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-09 (S151 第 77 批 b77)、repo HEAD `1ef669ad` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b77-u01-a2` merge 結果、sha256 先頭 `eeaf5aa8ad2547ac`、`.planning/v2/technology-14-39-u01/merged.json` とバイト一致)。
- **対象**: `data/ip/textbook/units/technology-14-39-u01.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (HTML / タグ / XML / SGML / JSON) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。topic `technology-14-39` の過去問は 7 題で、全題が本単元の考点・quiz・challenge のどれかに入っている。
- **経緯**: a1 (`b77-u01-a1`) は jp-review #1 / #2 とも REVISE (medium 各 1) で rejected (`failures/phase5/stage_07_ui/phase3/batch/technology-14-39-u01_attempt_1.md`)。a2 は a1 jp.r1 + jp-review #2 を seed にし、jp-review #1 REVISE (medium 1) → r1 → jp-review #2 PASS (low 3) → loc r0 → loc-review PASS (low 4)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-211、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。D-198 の照合で必要な最小限の語句だけ「」で示す。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (tree node label・svg 2 枚の foreignObject 文字列) / figure.mermaid / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールドは validate の「去標記 == 兼容字段」断言で一致 (0 issues)。
2. **考点 × 引用題** (考点 全 5 件 = exam 4 + mix 1、qid 付き 4 件、引用 qid 延べ 5 件 = 異なり 5 題): `data/ip/quiz/questions.json` + `translations/<exam>.json` の `stem_jp_clean` から各題の題文・選択肢・`correct_answer` を再読 (全題 topic `technology-14-39`)。正答との一致、誤答肢を支持しないこと、限定条件、D-198 (iii) なぞりを 1 件ずつ確認。
3. **quiz / challenge_questions** (quiz 計 6 枠 = 異なり 5 題 + challenge 4 題; 本文で未引用 = 2009h21h-q083 / 2022r04-q088 の 2 題): 本文と矛盾しないことを確認 (§2 表)。
4. **D-198 写し**: validate の copy guard = 0 件、`warn  choice-echo` 行は出力されていない (§6)。独立照合: 単元の JP 文字列 82 本 (派生フィールド・summary・overview.intro 除く、svg の文字列 6 本と figure.mermaid を含む) を topic 内全 7 題の題文 (`stem_jp_clean` 優先) + 選択肢と 12 字連続照合 (句読点・記号・空白除去)。
   - カタカナ 4 字以上と英数を □ に遮蔽 (遮蔽後の実字 6 未満の窓は除外): **完全一致 0 / 1〜2 字置換の近似 0**。
   - 遮蔽なし: 完全一致 0 / 近似 6 件 (d=2)。6 件とも「〜(表|表せ)るマークアップ言語であ」↔ 2012h24h-q067 ア・エ /2022r04-q088 の「〜(き|式は)マークアップ言語であ」で、一致部は分類語「マークアップ言語である」という定義の定型句だけ → 偽陽性。
   - 文単位の類似度 (bigram Dice / 正規化編集距離、較正: HIGH 例 = ed 0.14 / Dice 0.52): 最上位は `pairs[0].rows[0].a_jp` ↔ 2012h24a-q059 イ (Dice 0.53 / ed 0.60) だが、相手が 4 字の選択肢「Web ページ」だけの人工物。実質最上位は `terms[2].one_jp` ↔ 2012h24h-q067 エ (Dice 0.44 / **ed 0.51**)、`overview_rows[0].one_line_jp` ↔ q067 ア (0.46 / 0.57)。どちらも ed が HIGH 例 0.14 から遠く、XML / HTML の標準的な定義の一般表現 → 写しではない (§2 の D-209 判定も参照)。
   - カタカナの多い文 (マークアップ言語・メタ言語・ハイパーリンク・JavaScript オブジェクト) を目視: 引用題に同じ並びなし。
5. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 2〜3 文 (3/3/2/3/2)。定義前使用: マークアップ言語 = HTML detail で「マークアップ」を定義、タグ = HTML one の括弧注 (「<」と「>」で囲んだ目印)、要素・入れ子 = タグ detail、メタ言語 = SGML detail、キー・値 = JSON one。総表の「メタ言語」「開始タグと終了タグ」先出しは要約表で軽微 (a2 jp-review #1 low と同見解、記録なし)。**§9 禁止句 grep** (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh 必须 / 一定要 / 重要 / 考试 + en must / exam / always / important / remember) → `points[].kind` の値 `exam` と en の「for example」内 exam 2 件 (+派生 2) のみ = 全て偽陽性。「と覚える」0。`freq_badge` = 低頻。図種: タグ = svg static (v1 資産 t01)、XML = tree static、SGML = svg static (v1 資産 t02)、HTML・JSON = 図なし — 全て登録 6 種内。比喩空: JSON (hook あり、a2 jp-review で許容)。考点 0: SGML・JSON (a2 の medium 解消のための削除、§3)。pair 配置: HTML / XML (2 行 key 1)、XML / JSON (3 行 key 1)。
6. **D-200**: 考点数 2/1/2/0/0 (≤3 ✓)、各 JP 1 文、26〜61 字 (≤100 ✓、最大は XML `points[1]` mix 61 字)。**framing 件数** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (「だけ」「ではない」「使わない」の照合: JSON one「タグを使わない」と overview_rows[4].extra「使わない」・goals[2] 一致; HTML「あらかじめ決まったタグ」は overview_rows[0]・pairs[0].rows[1]・XML points[1] で一致; タグ detail「多くの場合」開始・終了タグで挟む と analogy「しおり 2 本」/ key_points[1] は「多くの場合」を外すが基本形の要約で不整合とはしない) → 不整合 0。書き方 8 (対比の出現欄) → 下記列挙、反復なし。書き方 9 (限定条件) → §2 表、落ち 0。§6 / §9 → L5。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、図ラベル (tree) ・表セル・比較行の三語一致、`[[jp:…]]` 原語 5 種 (タグ / マークアップ言語 / マークアップ / Web ページ / メタ言語) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 5 用語に見出し語 (タグ は `[[jp:タグ]]`、他 4 語は同綴りの英字見出し)、zh 訳語 (`zh_terms.unit.json`: タグ = 标签、HTML / XML / SGML / JSON 同綴り) 一致、B6 warn 0。
9. **D-205 / D-210 と技術的正しさ** (本単元の重点): 版の付く文書の構成要素の数・名前の列挙は無い (SGML の「国際標準」は分類で列挙ではない; W3C / RFC / ECMA の版の主張も無い) → D-205 該当なし。タグ・JSON の例の記法を個別に確認: `<p>` / `</p>` (斜線付き終了タグ)、要素・入れ子、JSON 例 `{"商品名": "ノート", "在庫数": 42}` (zh `{"商品名": "笔记本", "库存数": 42}`、en `{"product": "notebook", "stock": 42}`) は三語とも妥当な JSON (キーは二重引用符の文字列、コロン・カンマの説明も正しい)。略語の展開 (HyperText Markup Language / eXtensible Markup Language の X / Standard Generalized Markup Language / JavaScript Object Notation) は正しい。SGML が HTML・XML より前の規格で両者の土台 (HTML 4.01 までは SGML の応用、XML は SGML のサブセット) は過去形の歴史的事実として正しい。HTML のタグで見せ方も指定できる (`terms[0].points[1]`) は引用題 (2012・2013 年) の正答どおりで、現行の HTML でも `style` 属性・`style` 要素が規格内にあるため改正後に偽になる主張ではない → D-210 の版明記は不要と判断 (表示専用要素の廃止は本文が主張していない)。不正確な箇所は JSON の定義の言い切り (L2) と svg t01 の山かっこ (L3)、タグ detail の「画面に出ず」(L4)。
10. **関連単元との用語整合** (technology-14-38 u01〜u03 = merge 済み未 deploy、technology-14-37 = v2 済): 14-37 (u01〜u05) には HTML / XML / タグ / マークアップ / JSON / 入れ子 の語が無く、重なりなし。14-38-u02 の「入れ子 (ネスト)」/ 嵌套 / nesting は本単元タグ detail の 入れ子 / 嵌套 / nesting と一致。14-38-u01 の JavaScript 記述 (ブラウザ上で動くスクリプト言語、HTML で作った画面を書き換える) は本単元の JSON detail・hook (JavaScript のオブジェクトの書き方から生まれた) と矛盾しない。14-38-u03 には JSON / XML の語なし。zh の「Web ページ」の訳は本単元 = 网页、14-38-u01 (と 19-51-u04) = Web 页面 で揃っていない → O1 (本単元側は全単元の多数派 [网页 20 ファイル 85 件 / Web 页面 3 ファイル 19 件]、zh_terms に項目なし)。en は web page で一致。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

**対比の出現欄 (書き方 8 の列挙)**: ① HTML = 決まったタグ / XML = 利用者が定義: `pairs[0].rows[1]` (key)、`terms[2].points[1]` (mix)、総表の列 (D-195 §3 の構造)、`goals_jp[0]` (観点の予告) → 2 箇所まで、許容。② XML = タグで挟む / JSON = キーと値 (タグを使わない): `pairs[1].rows[0]` (key)、総表の列、JSON one (定義そのもの)、`goals_jp[2]` (予告) → 許容 (a1 で問題になった JSON 考点は削除済みで、a1 jp-review #1 low の key_points[4]「タグを使わない」も現行の key_points_jp[4] から消えている)。③ 由来 SGML / JavaScript: `pairs[1].rows[2]` と各用語 detail・hook → 各用語の片側の事実で対比の反復ではない。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | HTML | OK — exam 2 / 3 題: ① HTML で作れるのは Web ページ (2012h24a-q059 正答イ; 誤答の Web ブラウザ・音声・動画を本文は支持しない。考点は題の問いと正答を 1 文にしただけで、誤答肢の組を挙げない = 分類題の正答を一般的な事実として述べる D-209 免除内。「作れるのは〜である」の分裂文は排他的に読めるが引用題の範囲内 → L1) / ② タグは構造を示すだけでなく画面での見せ方を指定する役目も持てる (2013h25h-q069 正答イ / 2012h24h-q067 正答ア; 誤答 q067 イ スクリプト言語・ウ 通信プロトコル・エ 利用者定義タグ を支持しない。エ は XML として `pairs[0].rows[1]` で区別)。quiz 2009h21h-q083 (正答ウ = Web ページ記述言語・タグで論理構造) は one と一致、誤答ア (FTP で転送) は本文に記述なし、イ・エ は SGML detail の系譜で否定される。analogy (原稿の余白の赤字指示 → 印刷所が紙面を組む) は one / points[1] と一致 | OK (図なし = 定義型) | OK (loc low `detail_zh`「组成页面」→ L6) | L1, L6 |
| 2 | タグ | OK — exam 1 / 1 題: XML の文書の論理構造は各部分をタグで囲んで表す (2010h22h-q063 正答ウ; 誤答 引用符で囲む・コンマ・タブで区切る は打ち消さず、題の語句の並びもなぞらない → 一般的な記法の規則の記述で写しではない [a2 jp-review #2 low と同見解])。one「「<」と「>」で名前を囲んだ目印」、detail「多くの場合」開始タグ <p> と斜線を加えた終了タグ </p> で挟む・要素・入れ子 は技術的に正しい (空要素の例外を「多くの場合」で残す)。hook (荷物の名札) は定義の言い換えではない。detail 3 文目「タグそのものは画面に出ず」は HTML をブラウザで表示する場合の話で、`one` が対象に含める「データ」(XML) には当てはまらない → L4。図 t01 (v1 資産) の山かっこが全角 → L3 | OK (svg static = 登録内) | OK | L3, L4 |
| 3 | XML | OK — exam 1 / 1 題 + mix 1: どんなタグを使うかを書き手がデータの内容に合わせて決められる (2010h22a-q056 正答エ; 誤答イ HTML は mix 考点と `pairs[0].rows[1]` で区別、COBOL・Java は記述なし) / mix: HTML = Web ページを組み立てるために用意されたタグ、XML = データの中身を表すタグを利用者が作る (両側正の定義の対比 = D-209 免除。q067 エ「利用者が独自のタグを定義して…データの意味や構造」と考点「データの中身を表すためのタグを利用者が作る」は標準定義の言い換えで、選択肢の組・順序の再現ではない)。`one_jp`「使う人が目的に合わせてタグの名前を決め、データの意味と構造を書き表せる」も q056 題文・q067 エ と同じ標準定義 (Dice 0.44 / ed 0.51、§1-4) で、XML の定義として使っており HTML 側の誤答を支持しない。tree 図 (書籍 → 書名 / 著者 [姓・名] / 価格) は detail・analogy (著者の段の中に姓・名の小箱) と一致 | OK (tree static) | loc low `points[1].text_en`「the users」→ L6 | L6 |
| 4 | SGML | OK — 考点 0 (a2 jp-review #1 MEDIUM の解消のため削除、§3)。quiz 2009h21h-q083: one (タグで構造化するマークアップ言語そのものを定める国際標準のメタ言語)・detail (HTML や XML より前からある規格で、両者はこれを土台に生まれた)・図 t02 (SGML → HTML / XML)・`key_points[3]`・`pairs[1].rows[2]` は全て「SGML → HTML・XML」の正の向きの系譜を述べるだけで、誤答イ (HTML が SGML の基) ・エ (XML の縮小) の逆向きの場面を再現・打ち消す文は無い (「簡略化」「縮小」の語は三語とも 0)。detail「現在の Web で SGML を直接書くことはほとんどない」は正しい。hook (Standard Generalized = 標準で汎用) は語源の手がかり | OK (svg static = 登録内、v1 資産、JP のみ → L3 に併記) | loc low `analogy_en` "forms" → **L7 建議修** | L5 (hook), L7 |
| 5 | JSON | OK — 考点 0 (a1 jp-review #2 MEDIUM の解消のため削除、§3)。quiz / challenge 2022r04-q088 (空欄 a = 区切り文字の形式 → CSV、b = マークアップ言語でタグを使う形式 → XML): one「タグを使わない」と `pairs[1]` で b の選択肢 JSON を外せる。a の CSV は本単元の見出し語ではなく本文で扱わない (CSV は strategy-01-02-u07 の見出し語) → O3。detail の例・コロン・カンマ・JavaScript 由来・言語を問わず Web サービス間のやり取りに使われる は正しい (版の主張なし)。one「キーと値の組を波かっこで囲んで表す」は JSON のオブジェクトだけの説明で、配列 (角かっこ) や単独の値も JSON テキストになる (RFC 8259) → L2 | OK (図なし、比喩空) | OK | L2 |

**単元レベル**: goals 3 点・overview_cols 2 (分類 / タグの扱い)・overview_rows 5 行・pairs 2 組・key_points 5・summary (記法除去版と一致)・challenge_questions 4 件 (2012h24h-q067 / 2013h25h-q069 / 2010h22a-q056 / 2022r04-q088 — 本文と矛盾なし)。`key_points_jp[0]`「見た目の指定も書き込める」は HTML points[1] と一致。事実誤りなし、三語一致 (loc low の直訳調 `key_points_zh[0]` → L6)。

**D-209 判定の記録 (D-208 書き方 11、quote 付き)**:
- `pairs[1]` (XML / JSON) × 2022r04-q088 空欄 b: 題が組にしているのは空欄 a (CSV) と空欄 b (XML) で、JSON は b の選択肢の代替語。表は `rows[0]`「開始タグと終了タグで挟む / キーと値の組を波かっこで囲む」、`rows[1]`「マークアップ言語 / データ記述形式」で、b の説明の「データの論理構造を、タグを用いて記述」の語句を使わず、取り違えやすい 2 語の両側を正の定義で述べる → (iii) に当たらない。a1 jp-review #2 の fix_jp も「対比は pairs の表だけで担う」としており、その方針どおり。
- `terms[0].points[1]` × 2012h24h-q067 ア / 2013h25h-q069: 両題とも分類型 (HTML はどれか / HTML の正しい記述)。考点は「構造を示すだけでなく、画面での見せ方を指定する」の 2 項で、q069 題文の 4 項 (内容 → 文書構造 → レイアウト → フォント・サイズ) の組と順序、末尾の「など」は再現していない。q067 ア の「論理構造やレイアウト」と 2 項の順は同じだが、これは正答肢 1 つの中身 = HTML の一般的な定義そのもので、判断項目の組の再現ではない → D-209 免除内。
- `terms[1].points[0]` × 2010h22h-q063、`terms[0].points[0]` × 2012h24a-q059: 分類型の正答を一般的な事実として述べ、誤答肢を打ち消さない → 免除内 (前者は記録なし、後者は L1)。

## 3. a1 / a2 の HIGH・MEDIUM の解消確認 (三語)

| 出所 | 指摘 (要旨) | 現行の該当欄 (jp / zh / en) | 判定 |
|---|---|---|---|
| a1 jp-review #1 MEDIUM | `terms[0].points[1]` が 2013h25h-q069 題文の列挙 (内容 → 文書構造 → レイアウト → フォント・サイズ + 「だけでなく」+「など」) を同順で言い換え | jp「HTML のタグは文書の構造を示すだけでなく、画面での見せ方を指定する役目も持てる。」/ zh「HTML 的标签（[[jp:タグ]]）不仅表示文档的结构，还可以承担指定屏幕显示方式的作用。」/ en "HTML tags ([[jp:タグ]]) can do more than show a document's structure; they can also specify how it looks on screen." | **解消** — 4 項の組・順序・「など」は三語とも無い (2 項の判定は §2 D-209 記録)。`key_points[0]` も「見た目の指定も書き込める / 也可以写入外观方面的指定 / it can also specify how they look」の 1 項だけ |
| a1 jp-review #2 MEDIUM | JSON の考点が 2022r04-q088 空欄 b の語 (XML) と比較の相手 (JSON) を組にして再現 | `terms[4].points` = 空 (三語とも)。同旨は `pairs[1]` のみ | **解消** — 削除。pairs は §2 D-209 記録のとおり (iii) 外。他の欄 (JSON detail / key_points[4] / overview_rows[4]) に XML との組の言い直しは移っていない (key_points[4] は「言語を問わずデータのやり取りに使われる」に変わり、タグの対比を持たない) |
| a2 jp-review #1 MEDIUM | SGML の mix 考点「初期の HTML は SGML の規則に沿って定められ、XML は SGML を簡略化して作られた」が 2009h21h-q083 の誤答イ → エ を同順で裏返す | `terms[3].points` = 空 (三語とも) | **解消** — 削除。系譜は one / detail / 図 t02 / key_points[3] / pairs[1].rows[2] に正の向きでだけ残り、「簡略化 / 简化 / simplif」「縮小」の語は三語とも 0 (grep)。HTML の初期版の限定もどの欄にも移っていない |
| a1 / a2 の low で、今回も残るもの | HTML points[0] の言い直し・JSON one の言い切り・svg t01 の山かっこ・hook の語源反復 | — | L1 / L2 / L3 / L5 に引き継ぎ (退行ではなく未修 low)。a1 jp-review #1 low の「XML hook = detail の X = extensible の繰り返し」「JSON 図の値の種類列」「タグ hook の札 2 枚」は a2 で hook の書き換え・図の削除により解消 |

zh / en で先行ラウンドの修正内容が戻った箇所 (D-208 (5)) は無い。

## 4. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 7 (うち 建议修 3: L2・L4・L7)** + 範囲外観察 4

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW | `terms[0].points[0].text_jp/zh/en` | 「HTML を使って作れるのは Web ページである。」は 2012h24a-q059 の問いと正答を 1 文にしたもので one の言い直しに近く (D-203 §9)、分裂文「作れるのは〜である」は HTML の用途を Web ページだけに限るようにも読める。引用題とは一致 (a2 jp-review #1 / #2 とも low) | 任意: jp「HTML を使って作れるのは Web ページである。」→「HTML を使って Web ページを作ることができる。」/ zh「用 HTML 能制作的是网页（[[jp:Web ページ]]）。」→「用 HTML 可以制作网页（[[jp:Web ページ]]）。」/ en "What HTML lets you build is web pages ([[jp:Web ページ]])." → "HTML is used to build web pages ([[jp:Web ページ]])." (誤答肢 [ブラウザ・音声・動画] を並べて否定する形にはしない) |
| L2 | LOW **建议修** | `terms[4].one_jp/zh/en` (+ 派生 `definition_*`) | JSON を「キーと値の組を波かっこで囲んで表す」形式と定義で言い切るが、波かっこはオブジェクトの記法で、配列 (角かっこ) や単独の値も JSON テキストになる (RFC 8259 / ECMA-404)。初学者向けの基本形としては許容、引用題とも矛盾しない (a1 / a2 jp-review low)。技術的正しさの重点に当たるので最小の修正を推奨 | jp「…の組を波かっこで囲んで表す、タグを使わない軽いデータ記述形式である。」→「…の組を波かっこで囲むなどして表す、タグを使わない軽いデータ記述形式である。」/ zh「用花括号把**键**（项目名）和**值**的组合括起来表示数据。」→「例如用花括号把**键**（项目名）和**值**的组合括起来表示数据。」/ en "represents data as pairs of a **key** (item name) and a **value** enclosed in curly braces." → "represents data mainly as pairs of a **key** (item name) and a **value** enclosed in curly braces." (`pairs[1].rows[0].b` は対比行なのでそのままでよい) |
| L3 | LOW (B3 範囲外) | `terms[1].fig` = `data/ip/textbook/figures/technology-14-39-u01-t01.svg` (+ `terms[1].figure.mermaid`) | v1 資産の SVG のラベルが「開始タグ 〈p〉」「終了タグ 〈/p〉」で全角の山かっこ (U+3008/3009)。one は「「<」と「>」で」と定義しており、タグの記法の唯一の図示が正しい記法と食い違う (a2 jp-review #1 low、未修)。矢印つなぎで処理の流れにも読め、ラベルは JP のみで zh / en にも JP 表示 (他単元の v1 SVG と同じ扱い) | 文字列置換の B3 範囲外 (図ファイル) なので、直すかは caller 判断: SVG の foreignObject の `<p>開始タグ 〈p〉</p>` → `<p>開始タグ &lt;p&gt;</p>`、`<p>終了タグ 〈/p〉</p>` → `<p>終了タグ &lt;/p&gt;</p>`、`figure.mermaid` も `〈p〉` → `#lt;p#gt;`、`〈/p〉` → `#lt;/p#gt;`。直さない場合は記録のみ |
| L4 | LOW **建议修** | `terms[1].detail_jp/zh/en` 3 文目 (+ 派生 `explanation_*`) | 「タグそのものは画面に出ず、挟んだ中身に役割を与える」は HTML をブラウザで表示する場合の話だが、one は対象を「文書やデータ」(XML を含む) としており、XML ではタグが画面に出ないとは言えない (欄内の範囲のずれ、誤答肢は支持しない) | jp「タグそのものは画面に出ず、挟んだ中身に役割を与える。」→「ブラウザで表示すると、タグそのものは画面に出ず、挟んだ中身に役割を与える。」/ zh「标签本身不显示在屏幕上，而是为夹在中间的内容赋予作用。」→「在浏览器中显示时，标签本身不显示在屏幕上，而是为夹在中间的内容赋予作用。」/ en "The tags themselves do not appear on screen; they give a role to the content they enclose." → "When a browser displays the page, the tags themselves do not appear on screen; they give a role to the content they enclose." |
| L5 | LOW | `terms[0].hook_jp/zh/en`、`terms[3].hook_jp/zh/en`、`terms[2].hook_*` | HTML hook (HyperText = リンク、Markup = 印付け) は detail のマークアップの定義・ハイパーリンク文と、SGML hook (標準で汎用) は one の「国際標準」と重なる (D-203 §6/§9、a2 jp-review #1 low)。XML hook は X が eXtensible の 2 文字目という綴りの事実だけで、「拡張できる」の意味を手がかりにしていない (誤りではない) | 記録のみ |
| L6 | LOW | `terms[0].detail_zh`「组成页面」、`key_points_zh[0]`「也可以写入外观方面的指定」、`terms[2].points[1].text_en`「the users」 | loc-review low 3 件が未反映 (直訳調・冠詞)。意味のずれなし | 任意 (loc-review の fix_jp どおり): `terms[0].detail_zh`「按照这些记号在屏幕上组成页面。」→「按照这些记号把页面呈现在屏幕上。」/ `key_points_zh[0]`「**HTML** 是用标签描述网页结构的语言，也可以写入外观方面的指定。」→「**HTML** 是用标签描述网页结构的语言，也可以用来指定页面的外观。」/ `terms[2].points[1].text_en` "while in XML the users create tags that represent the content of the data." → "while in XML, users create their own tags to represent the content of the data." |
| L7 | LOW **建议修** | `terms[3].analogy_en` | 「書式の作り方の手引き」「用途別の書式」の 書式 (フォーマット・ひな形) を "forms" と訳し、英語では申込書などの記入用紙と読まれやすい (loc-review low、未反映)。比喩の焦点 (規則から個別の形式が分かれる) がぼやける | en "It is like a \"guide to making forms\" that exists before any individual form is designed. Forms for each purpose branch off from that guide." → "It is like a \"guide to designing formats\" that exists before any individual format is designed. Formats for each purpose branch off from that guide." (jp / zh は変更なし) |

**範囲外の観察** (書き直し対象外):
- O1 zh の「Web ページ」訳: 本単元 = 网页、technology-14-38-u01 (JavaScript) と technology-19-51-u04 (CSS) = Web 页面。zh_terms.json に項目が無く、全単元では 网页 が多数派 (20 ファイル 85 件 / Web 页面 3 ファイル 19 件)。本単元は直さず、統一するならバッチ側で zh_terms に項目を立てる。
- O2 technology-19-51-u04 (CSS、v2) との見え方: 同単元の考点は「見た目 = CSS、中身と構造 = HTML」、比喩は HTML = 原稿 / CSS = 印刷の指示書。本単元は `terms[0].points[1]`「HTML のタグは…見せ方を指定する役目も持てる」、analogy は HTML = 原稿の余白の赤字指示 → 印刷所。どちらもそれぞれの引用題が支持し (19-51 側の 2012h24h-q053 / 2013h25a-q080 / 2019h31h-q081 は HTML を誤答肢に持たない)、単元内の観点 7 不整合ではない。並べて読むと役割分担の像がずれるので、将来 CSS との関係を書くなら現行の役割分担 (表示は主に CSS) を一次資料 (HTML Living Standard) 付きで足す。
- O3 challenge / quiz の 2022r04-q088 は空欄 a (CSV) を本単元で解けない (CSV は strategy-01-02-u07 の見出し語)。空欄 b (XML) は本文で解ける。v1 からの引き継ぎで、topic 内の題で本単元に合う。
- O4 独立 copy 照合の遮蔽なし近似 6 件は定型句「マークアップ言語であ(る)」、Dice 最上位は 4 字選択肢の人工物 (§1-4)。

確認済みで問題なし: 限定条件 (考点 5 件全て保持)、§9 禁止句 grep (偽陽性のみ)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤61 字)、D-198 写し (validate 0、`warn choice-echo` 0、独立照合は偽陽性のみ)、D-205 (該当なし)、`[[jp:]]` 原語 (5 種全て jp 本文に実在)、one_zh / one_en の見出し語 (5/5)、zh 訳語表 (B6 warn 0)、図種 (svg static ×2 / tree static ×1 / 図なし ×2 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、14-37 / 14-38 との用語 (入れ子 / 嵌套 / nesting、JavaScript) 整合。

## 5. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **7** (建议修 3: L2 / L4 / L7、B3 範囲外 1: L3、記録のみ・任意 3: L1 / L5 / L6) |

## 6. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 5 件 (qid 付き 4 件)・引用 5 題 + 未引用の quiz / challenge 2 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。a1 の MEDIUM 2 件と a2 jp-review #1 の MEDIUM 1 件は三語とも解消し、退行は無い。LOW 建议修 3 件 (L2 / L4 / L7) は補丁 (B3) で修正推奨、L3 は図ファイルの置換で B3 の範囲外 (caller 判断)、L1 / L5 / L6 はバッチ証拠の「未修 LOW」表へ。

## 7. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-39-u01
✓ technology-14-39-u01 unit: 0 issues (data/ip/textbook/units/technology-14-39-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-14-39-u01
✓ technology-14-39-u01 parity: 24 locations, 0 diff
EXIT=0
```
