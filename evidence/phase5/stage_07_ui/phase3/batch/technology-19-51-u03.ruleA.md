# Rule A 全数抽検 — technology-19-51-u03 (GUIの画面部品とメニュー・補助表示)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b71)、repo HEAD `3c2f850e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b71-u03-a2` merge 結果、sha256 先頭 `12d5c736d3163a9d` = `.planning/v2/technology-19-51-u03/merged.json` と一致)。
- **対象**: `data/ip/textbook/units/technology-19-51-u03.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (リストボックス / メニューバー / プルダウンメニュー / ポップアップメニュー / サムネイル / ヘルプ機能 / ツールチップ) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、D-208〜D-211、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致)。同一トピックの `technology-19-51-u01` / `u02` (v2)・`u04` (まだ v1 = `stage4-unit-v1-trilingual`) と照合。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 5 件 = exam 3 + mix 2、引用 qid 3 題)**: `questions.json` + `translations/<exam>.json` の stem_jp_clean から各題の題文・選択肢・`correct_answer` を再読 (全題 topic `technology-19-51`)。正答一致・誤答肢を支持しない・一般化 / 限定の有無・題の前提 (限定条件) 保持を 1 件ずつ確認。ポップアップメニュー (terms[3]) と ヘルプ機能 (terms[5]) は考点 0 件 (a1 で削除、2012h24a-q074 は D-211 に従い quiz のみ)。
3. **quiz / challenge_questions** (quiz 4 枠 = 引用 3 題 + 2012h24a-q074、challenge 5 題、うち challenge のみ 2014h26h-q032): 本文と矛盾しないことを確認 (§2 表・§3 O3)。
4. **D-198 写し**: validate の copy guard = 0 件 (choice-echo warn も出力なし)。独立照合: 単元の JP 文字列 101 本 (派生除く) を topic 内全 17 題の題文 (stem_jp_clean) + 選択肢 (計 85 本) と 12 字連続照合 (句読点・記号・空白・`**`・`[[jp:]]` 除去)。(a) カタカナ 4 字以上と英数を □ に遮蔽 (遮蔽後の実字 6 未満の窓は除外) → **0 件**、(b) 遮蔽なし → **0 件**、(c) 近似 (12 字窓で編集距離 ≤2) → **1 件**: `overview.intro_jp` ↔ 2013h25h-q065 題文、一致部は見出し語「プルダウンメニュー」+ 前後 3 字 (できる / ている) で偽陽性。(d) カタカナの多い文 (overview_rows・fig ラベル・pairs) を目視 → 題文・選択肢の言い回しの流用なし。2009h21h-q067 の場面 (営業伝票・関東の都道府県・入力作業の条件 (1)〜(5)) は単元のどこにも使われていない。
5. **D-208 既知失敗型 (1)〜(10)**: (1) option tracing → §2 で 3 件判定、(iii) 該当なし。(2) 「など」等の限定語 → q065 は限定語なし、q067 の前提は保持。(3) 別名 (ドロップダウンメニュー / コンテキストメニュー / オンラインヘルプ) は「〜とも呼ばれる」「〜と呼ぶ」で同一物 / 下位の呼び名として扱い、別物として教えていない。(4) 比喩・図の範囲 → L2 (ポップアップ analogy)。(5) a1 で直した主張の zh / en 退行 → §2 末尾で三語とも確認、退行なし。(6) zh / en の語が誤答肢寄り → なし。(7) D-210 改正前の版 → 該当法令・規格なし。(8) 比喩の鍵語が他用語の役割 → メニューバー hook「名札」とツールチップ analogy「名札」が共通するが、どちらも「項目 / 部品の名前を示す」の意で他用語の定義と食い違わない。(9) hook を引用題に当てはめた検算: プルダウン hook (下へ引き出す) → q065 正答エ; サムネイル hook (爪ほどの大きさに**縮めた**絵) → q079 正答ア (誤答イ = 小さな絵・記号 [アイコン] に寄らないのは「縮めた / 缩小 / shrunk」が三語にあるため); リストボックス hook → q067 は場面題で hook は判断に関与しない。(10) 閉じた列挙 → なし。
6. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 2〜3 文、比喩・フックが定義の言い換えでないこと (語源 [list+box / bar / pull down / pop up / thumbnail / tool+tip]、F1 キー、別場面の比喩)、定義前使用 (初期値 = リストボックス detail で太字定義、ホバー = ツールチップ detail で定義後に mix 考点、コンテキストメニュー・オンラインヘルプ = detail 内で定義)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → ヒット 20 本中 18 本は「選ぶ」「出る」の GUI 操作の本来の語義 (見出しを選ぶ・メニューが出る) で偽陽性、残り 2 本は hook の「〜と覚える」(サムネイル・ヘルプ機能) で L8。`freq_badge`「低頻」は対象外。zh / en の exam / must / always / 考试 / 必须 grep → en の always (常に見える) のみ通常用法。図の型: メニューバー = `svg` static (v1 の図 `figures/technology-19-51-u03-t01.svg` を継承、`git show HEAD` の v1 `figure` と同一)、プルダウン = flow steps 4、ツールチップ = flow steps 3、他 4 語 = 図なし; `svg / table / compare / flow / tree / network` の登録 6 種内 (`apps/web/src/lib/textbook/types.ts` FigSpec)。pair 配置 3 組、各組 key 行 1 つ。
7. **D-200**: 考点数 1/1/1/0/1/0/1 (≤3 ✓)、各 JP 1 文・字数 46〜53 (≤100 ✓)。**framing 件数** (`validateV2.ts` `pointFraming` を全考点に適用): jp 0 / zh 0 / en 0 (上限 2)。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の「〜だけ」「常に」「どの〜も」の照合) → L1 (メニューバー detail の「どの機能にも」)・L2・L6。書き方 8 → L5。書き方 9 (限定条件) → §2 表に記載、落ち 0。§6 → 比喩は全て別場面 (定義の言い換えなし)。§9 言い直し → L4。D-205: 版のある規格・法令・知識体系の構成要素数なし (該当なし)。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、図ラベル・caption・比較行の三語一致 (parity 0 diff)、`[[jp:…]]` 原語 11 種 (リストボックス / 初期値 / メニューバー / プルダウンメニュー / ポップアップメニュー / コンテキストメニュー / サムネイル / ヘルプ機能 / オンラインヘルプ / ツールチップ / ホバー) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 7 用語に見出し語の `[[jp:]]` あり (7/7)、zh 訳語は `zh_terms.json` (列表框 / 菜单栏 / 下拉菜单 / 弹出菜单 / 缩略图 / 帮助功能 / 工具提示 / 悬停) に一致 (validate B6 / jp-origin warn 0)。loc-review r1 (PASS) の LOW 4 件は未反映 → L3 に集約。
10. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | リストボックス | OK — exam 1 / 1 題: 同じ値が続けて入力される作業では初期値を直前の入力値にすると選び直しが減る (2009h21h-q067 正答エ = 前画面で入力した値; 誤答 = 成績・会社数・五十音順で決める、は一切触れず)。題の前提 (担当者ごと・都道府県ごとに複数枚をまとめて入力) は「同じ値が続けて入力される作業では」として保持。題の場面 (伝票・都道府県・条件番号) は使わない → (iii) 非該当。detail (常に見える・スクロール・誤り / 表記揺れの防止・初期値) は標準事実 | OK | OK | L3 (zh「作业」) |
| 2 | メニューバー | OK — mix 1 (qid なし): メニューバー = 帯そのもの、下へ開く一覧 = プルダウンメニュー。detail の「項目の一覧 (プルダウンメニュー)」は a1 r2 の「細かい操作の一覧」から修正済みで、プルダウンの選択対象を操作に限らない (三語とも「项目列表」/ "a list of items")。ただし detail 2 文目「どの機能にもここからたどり着ける」は根拠のない全称 | OK (svg static、v1 継承) | OK | L1 / L4 |
| 3 | プルダウンメニュー | OK — exam 1 / 1 題: 見出しを押したときだけ候補の一覧を開き 1 つを選ばせる (2013h25h-q065 正答エ; 誤答イ = 表示中の複数項目から全て選ぶ、を支持しない [「1 つ」])。q065 は「どれがプルダウンメニューの記述か」の分類型で、正答は見出し語の標準定義 → D-209 / D-211 の例外 (一般定義として述べる) に当たる。要素の流れ (見出し→一覧→1 つ選ぶ) は正答と同順だが、それは定義そのものの順序で、選択肢の組・誤答肢の場面は再現しておらず、正規化 12 字一致・近似一致とも 0、choice-echo warn なし → (iii) 非該当、§9 言い直しとして L4。**a1 r2 MEDIUM (選ぶ対象を「操作」に限定) 解消**: points[0] jp「候補の一覧…1 つを選ばせる部品」/ zh「候选列表…选择一项的部件」/ en "list of choices … pick one"、fig nodes[3] jp「項目が選ばれて一覧が閉じる」/ zh「项目被选中，列表关闭」/ en "The item is chosen and the list closes"、steps[3] jp「選んだ項目が決まり、一覧は閉じて見出しだけの表示に戻る。」/ zh「所选项目确定后…」/ en "The chosen item is set…" — 三語とも 操作 / 命令 / command / execute の語なし (grep 0)。goals[0]・pairs[0] (候補から選ばせる部品としての扱い) と整合 | OK (flow steps 4) | OK | L4 / L5 / L9 |
| 4 | ポップアップメニュー | OK — 考点 0 (qid なし)。**a1 r1 MEDIUM (ポップアップ = コンテキストメニューの同一性断定) 解消**: 考点を削除し、detail jp「右クリックで出すものは、そのとき指している対象に合わせた項目が並ぶため、**コンテキストメニュー**とも呼ばれる。」/ zh「用右键单击调出的菜单，会列出与当时所指对象相应的项目，因此也叫作**上下文菜单**…」/ en "One opened with a right-click lists items suited to whatever you are pointing at, so it is also called a **context menu**…" と三語とも右クリックで出すものに範囲を限定。pairs[1].rows[2].b も jp「右クリックで出す場合は、指している対象に合わせて変わる」/ zh「用右键单击调出时…」/ en "When opened by right-click…" で同範囲。「同じもの」「別の部品ではない」/ same / identical / 相同 の語は三語とも 0。analogy は対象依存を一般像として描く → L2 | OK | hook_en の掛かり L3 | L2 / L3 |
| 5 | サムネイル | OK — exam 1 / 1 題: 中身そのものを縮小した表示で、開く前に見た目で確かめる (2025r07-q079 正答ア; 誤答イ = 処理内容・対象を示す小さな絵や記号 [アイコン] を支持しない)。分類型の正答 = 標準定義 → D-209 例外。近い言い回し (画像や文書… を縮小…) はあるが 12 字一致・近似一致 0、誤答肢には触れない → (iii) 非該当、§9 言い直し L4。one の「画像や文書のページ」は題の範囲どおり (「だけ」なし、動画等を排除しない)。u02 アイコン考点 (同 qid) の「中身そのものを縮めて見せた表示」と一致 | OK | hook_en 循環 L3 | L3 / L4 / L8 |
| 6 | ヘルプ機能 | OK — 考点 0。**a1 r1 MEDIUM (オンラインヘルプ考点が 2012h24a-q074 正答エの要素の組と順序 [印刷物でない→画面→検索→ハイパリンク] をなぞる) 解消**: 考点を削除し qid は quiz のみ (D-211)。detail jp「説明を電子化し、ソフトウェアを使いながら直接読めるようにしたものを**オンラインヘルプ**と呼ぶ。」/ zh「把说明电子化…叫作**在线帮助**…」/ en "Explanations put into electronic form so users can read them directly while using the software are called **online help**…" — 印刷物 / 冊子 / 検索 / リンク / print / search / link / 打印 / 搜索 / 链接 は三語とも 0 (en analogy の "index print" のみ別用語で偽陽性)。q074 は「電子化された説明を画面で読む」で正答エが選べ、誤答イ (問い合わせ窓口) は one の「自分で解決できるよう」で、誤答ウ (対話形式で操作を進める) は one の「説明し」で外せる。範囲 (ソフトウェアに限る) は q074 の正答 (HW / SW の説明・サービス) より狭い → L7。hook「多くの Windows アプリでは F1」は限定語あり、事実 | OK | OK | L6 / L7 / L8 |
| 7 | ツールチップ | OK — mix 1 (qid なし): ホバー = 操作、ツールチップ = その結果の表示 (因果)。u04 (v1) ホバーの定義「ポインタを要素の上に重ねている状態」・「ホバー状態を起点に…説明 (ツールチップ) を表示」と一致 (u04 は v1 のため v1 文面との照合)。flow steps 3 は one・detail と一致 | OK (flow steps 3) | zh 連体修飾 L3 | L3 / L4 |

**単元レベル**: goals 3 点 (観点の予告)・overview_cols 2 (種類 / 表示のきっかけ)・overview_rows 7 行・pairs 3 組 (リストボックス / プルダウン 2 行 key 1、プルダウン / ポップアップ 3 行 key 1、ヘルプ / ツールチップ 2 行 key 1)・key_points 3 (a1 r1 LOW の「メニュー類全般に誤り防止を広げる」は「リストボックスは」に修正済み、a1 の key_points での対比再掲も解消)・summary (記法除去版と一致)・challenge_questions 5 件 (2009h21h-q067 / 2013h25h-q065 / 2025r07-q079 / 2012h24a-q074 / 2014h26h-q032 — 本文と矛盾なし)。2014h26h-q032 (使いやすい画面設計で考慮する事項 = 覚えやすさ・ボタン配置・文字の大きさや色) は見出し語を直接問わず結び付きは弱い (a1 r2 LOW、O3)。事実誤りなし、三語一致。

**同一トピック u01 / u02 との整合**: u01 `terms[0](ユーザビリティ).points[0]` は同じ 2009h21h-q067 を引き、ほぼ同文の考点 (直前の入力値を初期値に) を持つ — 主張は一致 (矛盾なし、重複は O1)。u02 `terms[4](アイコン).points[0]` (同 2025r07-q079) の サムネイル = 中身そのもの / アイコン = 記号の絵 と本単元のサムネイルは一致、本単元はアイコン側の対比を繰り返さない。u02 ロングプレス detail「補助メニューの表示…右クリックに近い役割」は本単元のポップアップ (右クリックなど) と整合。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 3: L1〜L3)** + 範囲外観察 5

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1](メニューバー).detail_jp` / `detail_zh` / `detail_en` 2 文目 | 「利用者はどの機能にもここからたどり着ける」/「用户从这里可以找到任何功能」/ "users can reach any function from here" は根拠 (引用題) のない全称。ポップアップ専用の操作やツールバーのみの機能もあり、リボン型のアプリにはメニューバー自体がない。誤答肢を支持する題はなく、メニューバーが機能の入口という設計意図としては正しいので措辞級 (観点 7 の言い切り強さ) | jp `利用者はどの機能にもここからたどり着ける。` → `利用者は多くの機能にここからたどり着ける。` / zh `横条本身在作业过程中一直显示在画面上，所以用户从这里可以找到任何功能。` → `横条本身在使用过程中一直显示在画面上，所以用户从这里可以找到大多数功能。` (loc-review の「作业」も同時に解消) / en `so users can reach any function from here.` → `so users can reach most functions from here.` |
| L2 | LOW **建議修** | `terms[3](ポップアップメニュー).analogy_jp` / `analogy_zh` / `analogy_en` | 比喩「手に取った本について尋ねると、その本に関する手続き**だけ**を教えてもらえる」は対象依存 (コンテキストメニューの性質) をポップアップメニュー全般の像として描く。detail と pairs[1].rows[2] は対象依存を「右クリックで出すもの / 場合」に限定しており (a1 r1 MEDIUM の修正)、比喩だけが範囲を広げる。ただし他欄は範囲を**限定**するだけで一般の対象依存を**否定**してはいないため、「比喩が考点・detail の否定する内容を運ぶ」(rule-7 MEDIUM) には当たらず LOW。また比喩の焦点が one の要点 (操作した位置に出る) から外れている | jp `図書館で手に取った本について司書に尋ねると、その本に関する手続きだけを教えてもらえるようなものです。` → `図書館で本を手に取ったその場に司書が来て、受付まで戻らなくても手続きを教えてくれるようなものです。` / zh `就像在图书馆拿起一本书去问馆员，馆员只告诉你与这本书相关的手续。` → `就像在图书馆拿起一本书时，馆员当场走过来告诉你手续，不必回到服务台。` / en `It is like taking a book to a librarian and being told only the procedures that apply to that particular book.` → `It is like a librarian coming over to explain the procedures right where you picked up a book, so you do not have to walk back to the front desk.` (受付 = 画面上端のメニューバー、detail の「画面上端までマウスを動かす手間が省ける」と対応) |
| L3 | LOW **建議修** | loc-review r1 (b71-u03-a2) の LOW 4 件、未反映: `terms[0].points[0].text_zh`、`terms[6].points[0].text_zh`、`terms[3].hook_en`、`terms[4].hook_en` (`terms[1].detail_zh` の「作业」は L1 で同時解消) | zh「作业」は大陸簡体で宿題・工程作業の語感 (日式借词)。zh ツールチップ考点は連体修飾が重なり読みにくい。en ポップアップ hook は "right where you are" がトーストに掛かって読め、メニューが操作位置に出る要点がぼやける。en サムネイル hook は thumbnail を thumbnail で説明する循環で、jp の「爪」の手がかりが立たない。いずれも意味は jp と一致 | `terms[0].points[0].text_zh`: `在连续输入相同值的作业中，` → `在连续输入相同值的录入工作中，` / `terms[6].points[0].text_zh`: `是这一操作所出现的显示的名称，` → `是这一操作后显示出来的说明的名称，` / `terms[3].hook_en`: `Pop up means to spring up suddenly, the way toast jumps out of a toaster right where you are.` → `Pop up means to spring up suddenly: like toast jumping out of a toaster, the menu appears right where you are.` / `terms[4].hook_en`: `so remember it as a picture shrunk to the size of a thumbnail.` → `so remember it as a picture shrunk to about the size of a fingernail.` |
| L4 | LOW | `terms[2].points[0]`、`terms[4].points[0]`、`terms[1].points[0]`、`terms[6].points[0]` (三語) | 考点が one / detail の言い直し (D-203 §9): プルダウン = one + 図 steps、サムネイル = one + detail、メニューバー mix = detail 1 文目、ツールチップ mix = detail のホバー定義。q065 / q079 は分類型で正答が標準定義のため D-209 / D-211 の例外内 (選択肢の組・誤答肢の場面の再現なし)。a1 r2 / a2 r1 の LOW と同じ | 記録のみ (考点に別の事実を足すと引用題の選択肢をなぞる方向になりやすい) |
| L5 | LOW | `pairs[0].rows[0]`・`rows[1]`、`terms[2].detail_jp/zh/en` 1 文目、`terms[2].points[0]` | 「プルダウン = 選ぶときだけ一覧が開く / 閉じている間は場所をとらない」の対比が pairs 2 行と detail で繰り返される (書き方 8)。考点の「だけ」は定義の中核で反復に数えない。a1 r2 LOW の 3 箇所目 (key_points) は解消済み | 記録のみ |
| L6 | LOW | `pairs[2].rows[0].a_jp/zh/en` (key 行)、`overview_rows[5].extra_jp/zh/en[1]` | 「利用者が呼び出す」と言い切るが、`terms[5].detail` は「…から呼び出し…のが典型的な使い方」と限定付き (状況に応じて自動で出るヘルプもある)。欄同士の言い切り強さのずれで事実誤りではない (a2 r1 LOW と同じ) | 記録のみ |
| L7 | LOW | `terms[5](ヘルプ機能).detail_jp/zh/en` 2 文目 | オンラインヘルプを「ソフトウェアを使いながら直接読める」電子化された説明とするのは、quiz 2012h24a-q074 正答 (HW・SW の操作説明を画面で閲覧できる機能・サービス) より狭い。ただし q074 の正答を選ぶのに支障はなく、誤答肢 (窓口・対話形式・分散処理) にも寄らない | 記録のみ (範囲を HW・画面・検索へ広げると a1 r1 MEDIUM の正答肢要素の組の再現に戻るため改稿しない方が安全) |
| L8 | LOW | `terms[4].hook_jp`「と字面で覚える」、`terms[5].hook_jp`「と指で覚える」(+ 派生 `memory_hook_jp`、`summary.memory_hooks_jp[4..5]`) | §9 grep の「覚え」2 件。記憶フックの言い方で定型締め句ではない (technology-23-63-u06 L2 と同じ扱い、7 フック中 2 つで反復も少ない) | 記録のみ |
| L9 | LOW | `terms[2].detail_zh` 3 文目 | 「它也叫作下拉式菜单（drop-down menu）」は term_zh「下拉菜单」とほぼ同じ字面で、zh では別名紹介の意味が薄い (en / jp は pull-down / drop-down で区別が立つ)。誤りではない | 記録のみ (任意: `它也叫作下拉式菜单（drop-down menu）。` → `英语中也叫 drop-down menu。`) |

**対比の出現欄 (書き方 8 の列挙)**: ① リストボックス = 常に見える / プルダウン = 選ぶときだけ開く: `pairs[0].rows[0..1]`、両用語の detail (片側ずつの定義)、プルダウン考点 (定義) → L5。② プルダウン = 決まった位置の見出しの下 / ポップアップ = 操作した位置: `pairs[1].rows[0..2]`、ポップアップ detail 2 文目「画面上端までマウスを動かす手間が省ける」(暗黙の対比 1 箇所) → 許容。③ ヘルプ = 呼び出す・詳しい / ツールチップ = 自動・一言: `pairs[2].rows[0..1]` のみ (key_points[2] は両者の共通点を述べ対比しない) → 許容。④ メニューバー / プルダウン: mix 考点 + detail → L4 (言い直し)。⑤ ホバー / ツールチップ: mix 考点 + detail → L4。`goals_jp[0..1]` は観点の予告で内容を述べない。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 u01 `terms[0](ユーザビリティ).points[0]` と本単元 `terms[0].points[0]` が同じ 2009h21h-q067 で、ほぼ同文の考点。主張は一致し矛盾はない。トピック内の重複として記録 (どちらを残すかは単元設計の判断)。
- O2 u04 (ホバー・ロールオーバー) はまだ v1 schema のため、ホバー / ツールチップの因果関係は u04 の v1 文面との照合 (一致)。u04 の v2 化の際に本単元の mix 考点 (ホバー = 操作 / ツールチップ = 結果) と揃えること。
- O3 challenge は v1 の 5 題 (2014h26a-q093 / 2014h26h-q032 / 2017h29h-q059 / 2019h31h-q081 / 2026r08-q060) から 4 題が入れ替わった。2014h26h-q032 は単元との結び付きが弱い (a1 r2 LOW)。`source_figures[1]` は challenge から外れた 2014h26a-q093 を指したまま (v1 継承の欄)。
- O4 メニューバーの svg (v1 継承) の文字は jp のみ (メニューバー / ファイル / 編集 / 表示 / プルダウンメニュー(開く・保存…))。「開く・保存」は File メニューの例示で、プルダウンの選択対象を操作に限る主張ではない (a1 r2 MEDIUM と別)。三語化は v1 図共通の課題。
- O5 独立 copy 照合の近似 1 件は見出し語 + 前後 3 字の偽陽性 (§1-4)。

確認済みで問題なし: a1 の MEDIUM 3 件 (オンラインヘルプの正答肢なぞり / ポップアップ = コンテキストメニューの同一性断定 / プルダウンの選択対象を「操作」に限定) は三語とも解消・退行なし (§2 表)、限定条件 (考点 3 件の引用題の前提保持)、§9 禁止句 grep (定型締め句 0; 「覚える」は L8、「選ぶ / 出る」は GUI の語義)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤53 字)、D-198 (validate 0、独立照合 遮蔽あり 0 / 遮蔽なし 0 / 近似は偽陽性 1)、D-205 (該当なし)、`[[jp:]]` 原語 (11 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (7/7)、zh 訳語表 (B6 warn 0)、図種 (svg static ×1 / flow steps ×2 / 図なし ×4 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 3: L1〜L3 / 記録のみ 6: L4〜L9、うち L9 は任意の修正案あり) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 7 用語・考点 5 件 (qid 付き 3 件)・引用 3 題 + quiz のみ 1 題 + challenge のみ 1 題で、考点の主張は正答と一致し、誤答肢を支持する記述・選択肢のなぞりは無く、引用題の限定条件の落ちも無い。a1 の MEDIUM 3 件は jp / zh / en とも解消し退行なし。LOW 建議修 3 件 (L1 全称の緩和・L2 ポップアップ比喩の範囲・L3 loc-review 未反映分) は補丁 (B3) で修正推奨、L4〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-19-51-u03
✓ technology-19-51-u03 unit: 0 issues (data/ip/textbook/units/technology-19-51-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-19-51-u03
✓ technology-19-51-u03 parity: 31 locations, 0 diff
EXIT=0
```
