# Rule A 全数抽検 — technology-19-51-u04 (フィードバック表示とWebデザイン実装)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b71)、repo HEAD `2f3bebf6` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b71-u04-a1` merge 結果、sha256 先頭 `2534b4ca95b6d53d` = `.planning/v2/technology-19-51-u04/merged.json` と一致)。run は単一 attempt (jp r0 → jp-review r1 REVISE → jp r1 → jp-review r2 PASS → loc r0 → loc-review r1 PASS)。
- **対象**: `data/ip/textbook/units/technology-19-51-u04.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (ホバー / ロールオーバー / GUI / CSS / モバイルファースト / レスポンシブWebデザイン / リダイレクト) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、D-208〜D-211、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致)。同一トピックの `technology-19-51-u01` / `u02` / `u03` (v2) と照合。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / memory_hook_*` 等) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 11 件 = exam 4 + mix 7、引用 qid 延べ 6 = 異なり 5 題)**: `questions.json` + `translations/<exam>.json` の stem_jp_clean から各題の題文・選択肢・`correct_answer` を再読 (全題 topic `technology-19-51`)。正答一致・誤答肢を支持しない・一般化 / 限定の有無・題の前提 (限定条件) 保持を 1 件ずつ確認。ホバー / ロールオーバー / モバイルファースト / リダイレクトは exam 考点 0 (引用題なし、mix のみ)。
3. **quiz / challenge_questions** (quiz 6 枠 = GUI 1・CSS 3・モバイルファースト 1・レスポンシブ 1、challenge 5 題 = 引用 5 題と同一): 本文と矛盾しないことを確認。challenge は v1 (2009h21h-q067 等 5 題) から本単元の引用題 5 題へ差し替わっており、全て本単元の見出し語を問う。未引用の topic 題のうち GUI を題文に含む 2014h26h-q093 (入力項目に使う GUI 部品 = ラジオボタン) は GUI の one / mix と矛盾しない。
4. **D-198 写し**: validate の copy guard = 0 件 (choice-echo warn 出力なし)。独立照合: 単元の JP 文字列 103 本 (派生除く) を topic 内全 17 題の題文 (stem_jp_clean) + 選択肢 (計 85 本) と 12 字連続照合 (句読点・記号・空白・`**`・`[[jp:]]` 除去)。(a) カタカナ 4 字以上と英数を □ に遮蔽 (実字 6 未満の窓は除外) → **0 件**、(b) 遮蔽なし → **9 件、全て偽陽性**: 一致部は見出し語「レスポンシブWebデザイ(ン)」(goals_jp[2] / terms[5].one_jp / points[0] / points[1] / key_points_jp[3] / overview.intro_jp ↔ 2026r08-q060 題文)、略語の展開「GUI (Graphical User Interface)」(terms[2].one_jp / points[1] ↔ 2014h26h-q093 題文)、「CSS (Cascading Style Sheets)」(terms[3].one_jp ↔ 2013h25a-q080 ア) で、用語名・正式名称は表現ではない。(c) 近似 (12 字窓で編集距離 ≤2) → 上記 9 件 + 5 件: 「Webページの見た目を」(goals_jp[1] / overview_rows[3].one_line_jp / terms[3].points[0] / overview.intro_jp ↔ 2019h31h-q081 エ、編集距離 1) は CSS の標準定義の目的語句 (「見た目を指定する」vs 正答の「見た目を統一する」で述語も別)、terms[3].hook_jp「Style Sheets は」↔ 2013h25a-q080 ア (距離 2) は正式名称 → 全て偽陽性 (較正例 ed 0.14 / Dice 0.52 の水準に達するものなし)。(d) カタカナの多い文 (overview_rows・fig ラベル・pairs・ホバー / ロールオーバー の one・detail) を目視 → 題文・選択肢の言い回しの流用なし。2026r08-q060 の誤答エ (マウスポインタを重ねたときポップアップで機能説明) の場面は、ホバー detail / ロールオーバー points[1] では一般定義 (ツールチップ = 要素のそばに出る短い説明) としてのみ現れ、誤答肢の語 (操作説明書・ポップアップ・対象の状態) は使わない。
5. **D-208 既知失敗型 (1)〜(10)**: (1) option tracing — exam 考点 4 件を判定: GUI points[0] (2017h29a-q058 = どれがオートコンプリートか の分類型) は正答の内容を見出し語の一般定義として述べ (履歴 → 打ち始めに合う候補 → 入力補助)、題文の言い回し・誤答肢 (インデント / オートフィルタ / ハイパリンク) に触れない → D-209 例外、(iii) 非該当。CSS points[0] / [1] (q053 分類型・q080 組合せ・q081 理由) は正答の役割の一般表現、誤答肢 (cookie / CUI / SSL / SNS / SQL / XML / 更新通知 / 利用者識別) を否定する形で並べない。レスポンシブ points[0] (q060) は正答の一般定義、誤答イ・ウ・エ に触れない → (iii) 非該当。(2) 「など」等の限定語 → q060 正答の「画面サイズ**など**」に対し考点は「画面の幅」→ **L1**。q058 の「キーボード入力を補助する」は考点の「入力補助の機能」で範囲を閉じない。(3) 別名 → 該当なし (GUI / CUI、HTML / CSS は別物として正しく対比)。(4) 比喩・図の範囲 → ロールオーバー analogy (近づくと点き離れると消える照明) と detail (「戻るのが普通」) / 図 steps[3] (言い切り) の強さ差は jp r2 LOW のまま (L7)、矛盾ではない。(5) 前回直した主張の zh / en 退行 → §2 末尾 (モバイルファースト hook) で三語とも確認、退行なし。(6) zh / en の語が誤答肢寄り → なし (レスポンシブ zh「按屏幕宽度自动重新排列」/ en "rearranges itself automatically" は正答側)。(7) D-210 改正前の版 → 該当法令・規格なし。(8) 比喩の鍵語が他用語の役割 → なし (本棚・照明・写真付きメニュー・印刷の指示書・旅行かばん・伸びる布・郵便転送; いずれも他見出し語の語幹でない)。(9) hook を引用題に当てはめた検算: レスポンシブ hook (画面幅の合図に応じて形を変える) → q060 正答ア (誤答エのポップアップ説明は「形を変える」に当たらない)。モバイルファースト hook (まず携帯端末の小さな画面を置く) → q060 で誤答ウ (端末内蔵センサー) に寄らない。CSS hook (様式だけを書いた 1 枚を何ページにも重ねる) → q081 正答エ / q080 正答ア。GUI hook (描かれた絵を指して操作) → q058 は判断に関与しない (L3 の detail が橋渡し)。(10) 閉じた列挙 → なし。
6. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 2〜3 文、比喩・フックが定義の言い換えでないこと (語源 [hover / roll over / Graphical / Style Sheets / first / responsive / re+direct]、別場面の比喩; モバイルファースト hook は jp r2 LOW の「one に近い」→ L7)、定義前使用 (ツールチップ = ホバー detail 内「のような短い説明」で説明・u03 で定義済み、HTML = CSS detail 内で同格定義、スタイルシート = CSS detail 内で定義 [図ラベルの方が先に出るのは jp r2 LOW → L7]、CUI = GUI points[1] 内で正式名称と定義、オートコンプリート = 考点内で定義)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → ヒット 6 本: 「命令の名前を覚えていなくても」(terms[2].detail_jp / key_points_jp[1])・「語句を覚えておき」(terms[2].points[0])・「見て選ぶ」(key_points_jp[1]) は本来の語義で偽陽性、残り 3 本は hook の「〜と覚える」(GUI / レスポンシブ / リダイレクト) → L4。`freq_badge`「低頻」は対象外。D-205: 版のある規格・法令・指針 (JIS X 8341 / WCAG 等) の記述は単元に 0 件 (grep `JIS|WCAG|アクセシビリティ|ユニバーサル` = 0) → 該当なし。図の型: ロールオーバー = flow steps 4、CSS = tree static、モバイルファースト = flow steps 3、レスポンシブ = `svg` static (v1 の図 `figures/technology-19-51-u04-t02.svg` を継承、v1 `figure.svg_path` と同一)、リダイレクト = flow steps 3、ホバー・GUI = 図なし (v1 の GUI 図 t01 は不採用; §0-8 により欠如は最大 low、指摘しない); `svg / table / compare / flow / tree / network` の登録 6 種内 (`apps/web/src/lib/textbook/types.ts` FigSpec)。pair 配置 2 組、各組 key 行 1 つ。
7. **D-200**: 考点数 1/2/2/2/1/2/1 (≤3 ✓)、各 JP 1 文・字数 42〜84 (≤100 ✓、最大は GUI points[1] の 84 字)。**framing 件数** (`validateV2.ts` `pointFraming` を全考点に適用、tsx で実行): jp 0 / zh 0 / en 0 (上限 2)。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の「〜だけ」「常に」の照合: ホバー detail「ホバーだけに頼った案内は伝わらないことがある」は限定付き、レスポンシブ detail「端末の種類ごとに別のページを用意するのではなく」と points[0]「作り分けなくてよい」一致、モバイルファースト one「最初に考える」・detail「先に決めてから広げていく」・points[0]「設計を始める順序」・pairs[1] 一致) → 単元内の不整合 0 (同一トピック u03 との語の差は O1)。書き方 8 (対比の出現欄) → ① ホバー = 状態 / ロールオーバー = 効果: `terms[1].points[0]`・`pairs[0].rows[0..1]` の 2 箇所 (goals_jp[0] は観点の予告、overview_rows の extra は総表の構造で数えない) → 許容。② モバイルファースト = 方針 / レスポンシブ = 作り方: `terms[5].points[1]`・`pairs[1].rows[0..1]` の 2 箇所 (terms[4].points[0] は相手を名指ししない) → 許容。③ ロールオーバー / ツールチップ: `terms[1].points[1]` のみ。④ GUI / CUI: `terms[2].points[1]` のみ。⑤ HTML / CSS: `terms[3].points[0]`・analogy (原稿と指示書; §6 の別場面の比喩で反復に数えない) → 許容。書き方 9 (限定条件) → §2 表に記載、L1 を除き落ち 0。§9 言い直し → L6 / L7。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、図ラベル・caption・比較行の三語一致 (parity 0 diff)、`[[jp:…]]` 原語 9 種 (ホバー / ロールオーバー / ツールチップ / オートコンプリート / スタイルシート / モバイルファースト / レスポンシブWebデザイン / リダイレクト / リンク) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語: 5 用語は `[[jp:]]` あり、GUI・CSS は仮名漢字を含まない見出し語で平字のまま名指し (`hasJpOrigin` の ASCII 免除、D-202 準拠) → 7/7、zh 訳語は `zh_terms.json` (悬停（hover） / 翻转（rollover） / GUI（图形用户界面） / CSS / 移动优先（mobile first） / 响应式 Web 设计 / 重定向（redirect） / 工具提示 / HTML / PC（个人计算机）) に一致 (validate B6 / jp-origin warn 0)。loc-review r1 (PASS) の LOW 5 件は全て未反映 → L2 に集約。
10. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | ホバー | OK — mix 1 (qid なし): ホバーはクリック前の段階で、重ねただけではクリックの処理は実行されない (標準事実)。detail のタッチパネルには重ねる段階がない → 「ことがある」で限定 (jp)。en は "may never reach" と強い → L2c。v1 定義「重ねている状態」と一致 | OK (図なし) | en 強さ L2c、zh 原語表記 L2e | L2 |
| 2 | ロールオーバー | OK — mix 2 (qid なし): ホバー = 状態 / ロールオーバー = その状態での見た目の切替 (v1 定義と一致) / ロールオーバー = 要素自身の変化、ツールチップ = そばに説明を出す (u03 ツールチップ one「その近くに出る短い説明の表示」と一致)。flow steps 4 は one・detail と一致 (steps[3] の言い切りは L7) | OK (flow steps 4) | zh one の英語原語 L2e | L2 / L7 |
| 3 | GUI | OK — exam 1 / 1 題: オートコンプリート = 過去の入力から打ち始めに合う候補を示す入力補助 (2017h29a-q058 正答イ; 誤答 インデント / オートフィルタ / ハイパリンク を支持しない)。分類型で正答 = 一般定義 → D-209 例外。題の「キーボード入力を補助する」は「入力補助」で保持 (範囲を閉じない)。u01 `terms[0](ユーザビリティ).points[1]` が同 qid でほぼ同内容 → 主張一致 (O2)。detail 3 文目「GUI には…補助の機能も用意されている」は GUI 固有の話でない (jp r1 / r2 LOW 未解消) → L3。mix: GUI = 図形を指し示す、CUI = キーボードで命令を打ち込む (標準事実; 2012h24h-q053 の誤答 CUI を CSS と混同させない) | OK | OK | L3 / L4 |
| 4 | CSS | OK — exam 2 / 3 題: CSS = 見た目の指定、中身と構造は HTML (2012h24h-q053 正答イ / 2013h25a-q080 正答ア = HTML と組み合わせる) / 共通スタイルシートを複数ページで使うとサイト全体をそろえやすい (2013h25a-q080 正答ア / 2019h31h-q081 正答エ; 誤答 = 安全なやり取り・更新通知・利用者識別 に触れない)。限定条件「複数のページで」保持。tree static (共通スタイルシート → ページ A/B/C) は detail・points[1] と一致 | OK (tree static) | en analogy L2d、overview extra_en L2b | L2 / L7 |
| 5 | モバイルファースト | OK — mix 1 (qid なし): 設計を始める順序の考え方で PC 向けもあとから用意する (モバイル専用ではない; 標準事実)。**jp-review r1 MEDIUM (hook が「優先」の意味を打ち消す) 解消**: hook jp「first は「最初に・先に」。設計の机に、まず携帯端末の小さな画面を置くと読む。」/ zh「first 就是“最先、首先”。可以理解成在设计桌上首先摆上移动终端的小屏幕。」/ en "First means at the very start. Read it as putting the small mobile screen on the design desk before anything else." — 三語とも打ち消し (ではなく / 而是 / not) の句 0、one・detail・points・pairs も「優先」を否定しない (term_zh 移动优先 とも衝突なし)。v1 の「最優先に考える」は v2 で「最初に考える」になったが否定ではない (記録のみ)。quiz の q060 はこの用語を直接問わない (jp r1 LOW) → L5。flow steps 3 は detail と一致 | OK (flow steps 3) | OK | L5 / L7 |
| 6 | レスポンシブWebデザイン | OK (事実) — exam 1 / 1 題: 同じページが画面に応じて配置を変え、端末ごとに作り分けなくてよい (2026r08-q060 正答ア; 誤答イ [配信サーバ選択]・ウ [内蔵センサー]・エ [ポインタを重ねたときの説明表示] を支持しない)。ただし正答の「画面サイズ**など**」を考点は「画面の幅」に絞る → L1。detail (CSS で画面幅ごとの指定を書き分け、ブラウザが選ぶ; 3 列 → 1 列の例) は標準事実で「例えば」付き。svg static (同一ページ → 画面幅を判定 → PC / タブレット / スマホ向け) は one・detail と一致 (図中文字は jp のみ、O4) | OK (svg static、v1 継承) | OK | L1 |
| 7 | リダイレクト | OK — mix 1 (qid なし): リダイレクト = 自動で別 URL へ移る、リンク = 利用者がクリックして移る (契機の違い; 標準事実)。detail (サーバが転送先 URL を返しブラウザが開き直す; 移転時のリンク切れ防止・http → https 誘導) は事実だが方法をサーバ側に限って書く (jp r1 LOW) → L6。flow steps 3 は detail と一致 | OK (flow steps 3) | en overview L2a | L2 / L6 |

**単元レベル**: goals 4 点 (観点の予告)・overview_cols 1 (分類)・overview_rows 7 行・pairs 2 組 (ホバー / ロールオーバー 2 行 key 1、モバイルファースト / レスポンシブ 2 行 key 1)・key_points 5 (各用語の考点・detail と一致; key_points_jp[3]「画面幅で切り替える」は L1 と同じ語の範囲)・summary (記法除去版と一致)・challenge_questions 5 件 (2012h24h-q053 / 2013h25a-q080 / 2019h31h-q081 / 2017h29a-q058 / 2026r08-q060 — 本文と矛盾なし)。事実誤りなし、三語一致。

**同一トピック u01〜u03 との整合**: u03 `terms[6](ツールチップ)` の ホバー (重ねてクリックせずに止める; ツールチップはホバーをきっかけに出る) と本単元のホバー one / detail・ロールオーバー points[1] は内容が一致。ただし u03 は ホバーを「操作の名前」、本単元は「状態」と呼ぶ → O1。u02 `terms[3](ウィンドウ).detail` の GUI 説明 (文字の命令を打ち込む代わりに絵や枠を見てマウスや指で操作) と本単元の GUI one・GUI / CUI mix は一致。u01 `terms[6](VUI).hook` の「GUI の G (Graphical)」と本単元 GUI hook は一致。u01 オートコンプリート考点 (同 qid) と主張一致 (O2)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 7 (うち 建議修 3: L1〜L3)** + 範囲外観察 6

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[5](レスポンシブWebデザイン).points[0].text_jp / text_zh / text_en` | D-208 (2): 引用題 2026r08-q060 の正答は「表示する端末の画面サイズ**など**に応じて」変わると述べるが、この exam 考点は「画面の幅に応じて」と基準を幅に絞り「など」を落とす (one・detail・key_points[3]・overview・pairs・svg も一貫して「画面幅」)。**MEDIUM にしない理由**: 「だけ」等の閉じる語がなく範囲を明示的に閉じていない; 幅は画面サイズの一部で RWD の標準的な切替軸 (v1 定義も「画面幅」); 正答アを選べ、どの誤答肢も支持しない (誤答はいずれも幅 / サイズの軸と無関係)。ただし qid を付けた考点が正答より狭く言うので、考点だけ限定語を戻す (定義欄は標準説明のまま) | jp「**レスポンシブWebデザイン**では、同じページが画面の幅に応じて配置を変えるので、端末ごとにページを作り分けなくてよい。」→「**レスポンシブWebデザイン**では、同じページが画面の幅などに応じて配置を変えるので、端末ごとにページを作り分けなくてよい。」/ zh「在**响应式 Web 设计**（[[jp:レスポンシブWebデザイン]]）中，同一页面会按屏幕宽度改变布局，因此不必为每种终端分别制作页面。」→「在**响应式 Web 设计**（[[jp:レスポンシブWebデザイン]]）中，同一页面会按屏幕宽度等改变布局，因此不必为每种终端分别制作页面。」/ en "With **responsive web design** ([[jp:レスポンシブWebデザイン]]), the same page changes its layout to suit the screen width, so there is no need to build separate pages for each device." → "With **responsive web design** ([[jp:レスポンシブWebデザイン]]), the same page changes its layout to suit the screen width and other display conditions, so there is no need to build separate pages for each device." |
| L2 | LOW **建議修** | loc-review r1 の LOW 5 件 (全て未反映、jp は正しく zh / en のみ) | (a) en「moves an access」が不自然、(b) en「Description language」がなじみ薄い、(c) en「may never reach」が jp「伝わらないことがある」より強い (書き方 7 の強さずれ)、(d) en「print order」が「印刷部数の注文」とも読める、(e) zh one のうちロールオーバーだけ英語原語を併記 (他の one_zh は `**訳語**（[[jp:…]]）` 型) | (a) `overview_rows[6].one_line_en` "A mechanism that automatically moves an access to another URL" → "A mechanism that automatically sends a visitor on to another URL" / (b) `overview_rows[3].extra_en[0]` "Description language" → "Style language" / (c) `terms[0](ホバー).detail_en` "…so guidance that relies only on hover may never reach the user." → "…so guidance that relies only on hover may not reach the user." / (d) `terms[3](CSS).analogy_en` "If HTML is the manuscript, CSS is the print order that says which typeface and colors to print it in." → "If HTML is the manuscript, CSS is the printing instructions that say which typeface and colors to print it in." / (e) `terms[1](ロールオーバー).one_zh` "**翻转**（rollover，[[jp:ロールオーバー]]）是指…" → "**翻转**（[[jp:ロールオーバー]]）是指…" (文の残りは不変) |
| L3 | LOW **建議修** | `terms[2](GUI).detail_jp / detail_zh / detail_en` 3 文目 | 「GUI には、文字の入力の手間を減らす補助の機能も用意されている」は、オートコンプリート考点へつなぐための一文だが、入力補完は GUI 固有ではなく (CUI の補完もある)、直後の mix「CUI はキーボードで命令の文字列を打ち込む」と並ぶと「キーボード入力の補助 = GUI の機能」と読める (jp r1・r2 で LOW 2 回、未解消)。事実誤りではない | jp「GUI には、文字の入力の手間を減らす補助の機能も用意されている。」→「GUI の画面でも文字を打ち込む場面はあり、その手間を減らす補助の機能が用意されている。」/ zh「GUI 还提供了减少文字输入麻烦的辅助功能。」→「在 GUI 画面上也有需要打字的场合，为此准备了减少这种麻烦的辅助功能。」/ en "A GUI also offers helper features that cut down the effort of typing text." → "GUI screens still involve some typing, and helper features are provided to cut down that effort." |
| L4 | LOW | `terms[2].hook_jp`・`terms[5].hook_jp`・`terms[6].hook_jp` (+ 派生 `memory_hook_jp`, `summary.memory_hooks_jp`) | 7 フック中 3 つが「〜と覚える」で結ぶ (§9 同型の結び; 前例 23-63-u06 L2 と同類、記憶フックの言い方としては許容) | 記録のみ |
| L5 | LOW | `terms[4](モバイルファースト).quiz` / `inline_quiz` | 2026r08-q060 はレスポンシブWebデザインを選ぶ題でモバイルファーストを直接問わない (jp r1 LOW、manifest の terms タグには含まれる)。同題はレスポンシブの quiz・challenge にもある | 記録のみ (quiz 構成は B3 文字列補丁の対象外) |
| L6 | LOW | `terms[6](リダイレクト).detail_jp/zh/en` 1 文目、`fig` | リダイレクトの方法をサーバが転送先 URL を返す形に限って書く (meta refresh / JavaScript でも可; jp r1 LOW)。1 文目は図の 3 caption の言い直しに近い (jp r2 LOW、§9)。引用題なし、代表的な形で事実 | 記録のみ |
| L7 | LOW | jp-review r2 の残り LOW 5 件 | モバイルファースト hook が one に近い (§6) / モバイルファースト points[0] が detail の言い直しで取り違えの相手を名指ししない (§9) / goals_jp[2]「関係」に対し本文は別種の語であることと pairs の「(実現の手段)」のみ / CSS 図ラベル「共通のスタイルシート」が detail の定義より先に出る (ラベル内に括弧の説明あり) / ロールオーバー `fig.steps[3]` の言い切りと detail「戻るのが普通」の強さ差 — いずれも事実誤り・誤答誘導なし | 記録のみ |

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 **u03 との呼び方の差**: 本単元はホバーを一貫して「状態」(one・overview_rows[0]・goals[0]・pairs[0] key 行・terms[1].points[0]) と呼ぶが、同一トピック `technology-19-51-u03` は `terms[6](ツールチップ).detail_jp`「…止める操作を**ホバー**といい」・`terms[6].points[0].text_jp`「**ホバー**はポインタを重ねる操作の名前」と「操作」と呼ぶ。中身 (重ねてクリックせずに止める) は同じで、本単元 overview の分類「操作の状態」で両方が読めるため矛盾ではないが、統合トピックとして語をそろえるなら u03 側を「ポインタを重ねている状態の名前」とする案 (u03 の補丁扱い、本単元の補丁表には入れない)。
- O2 u01 `terms[0](ユーザビリティ).points[1]` は同じ 2017h29a-q058 を引き、ほぼ同内容のオートコンプリート考点を持つ (u01 = ユーザビリティを高める機能、本単元 = 入力補助の機能)。主張は一致、重複のみ。
- O3 `source_figures` は v1 期の題 (2011h23tokubetsu-q099 / q097 / 2014h26a-q093) を指したままで、本文・quiz・challenge では使われていない。
- O4 レスポンシブの svg (v1 継承) の図中文字は jp のみ (同一ページ / 画面幅を判定 / PC・タブレット・スマホ向けレイアウト)。u03 メニューバー svg と同じ扱いで、parity の対象外。
- O5 `unit_summary_jp/zh/en` は v1 と同文 (「反応表示を補い」は u03 からの続きの意; 事実は正しい)。
- O6 独立 copy 照合の raw 9 件・近似 5 件は見出し語・正式名称・CSS の標準定義句の偽陽性 (§1-4)。

確認済みで問題なし: 限定条件 (exam 考点 4 件中 3 件保持、1 件は L1)、§9 禁止句 grep (定型締め句 0; 「と覚える」は L4)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤84 字)、D-205 (該当なし)、図の文字列の写し (validate 0、独立照合は偽陽性のみ)、`[[jp:]]` 原語 (9 種全て jp 本文に実在)、one_zh / one_en の見出し語 (7/7、GUI・CSS は ASCII 免除)、zh 訳語表 (B6 warn 0)、図種 (flow steps ×3 / tree static ×1 / svg static ×1 / 図なし ×2 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、jp-review r1 MEDIUM の解消と三語の退行なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **7** (建議修 3: L1〜L3 / 記録のみ 4: L4〜L7) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 7 用語・考点 11 件 (exam 4)・引用 5 題 + challenge 5 題で、考点の主張は正答と一致し、誤答肢を支持する記述・option tracing は無い。前回 jp-review r1 の MEDIUM (モバイルファースト hook の「優先」打ち消し) は三語とも解消、退行なし。L1 (q060 の「など」を考点に戻す)・L2 (loc-review LOW 5 件)・L3 (GUI detail のつなぎ文) は補丁 (B3) で修正推奨、L4〜L7 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-19-51-u04
✓ technology-19-51-u04 unit: 0 issues (data/ip/textbook/units/technology-19-51-u04.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-19-51-u04
✓ technology-19-51-u04 parity: 33 locations, 0 diff
EXIT=0
```
