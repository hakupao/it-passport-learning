# Rule A 全数抽検 — technology-17-47-u01 (オフィスツールとソフトウェアパッケージ)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (S148 続、b40)、repo HEAD `7a688efc` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b40-u01-a1` merge 結果、a1 初回通過、sha256 先頭 `591ae30f69c865b7`)。
- **対象**: `data/ip/textbook/units/technology-17-47-u01.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (ソフトウェアパッケージ / 表計算ソフト / 文書作成ソフト / プレゼンテーションソフト / Webブラウザ) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、D-208 / D-209 / D-210 / D-211、テンプレート既知型 (1)〜(10)。比較: `data/ip/textbook/.planning/v2/technology-17-47-u01/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド `definition_*` が `one_*` の記法除去版であることをスクリプトで確認 (不一致 0)。hook の文字列は `memory_hook_*` / `summary.memory_hooks_*` に同文 (各 3 箇所)。
2. **考点 × 引用題 (考点 9 件 = exam 7 + mix 2、qid 付き 7 件、引用 qid 延べ 11 = 異なり 11 題、全題 topic `technology-17-47`)**: `questions.json` の正答と翻訳 sidecar の `stem_jp_clean` で再読。表計算題は全て自分で再計算:
   - 2025r07-q076: C4 → C5・C6 へ下方向に複写。税抜価格 B4 は行がずれ、税率 B1 は行固定が要る → `B4*(1+B$1)` = 正答ウ。考点「ずらしたくない側にだけ $」と一致 (誤答ア の B$4 は行を固定し過ぎ)。
   - 2010h22h-q055: D4 → D5・E4・E5 の 2 方向複写。税抜価格は列 B 固定 (`$B4`)、税率は行 2 固定 (`D$2`) → 正答ウ。D5 = 600×1.1 = 660、E4 = 500×1.2 = 600 で表の値と一致。
   - 2017h29h-q091: E4 → E5・E6 下方向。確率の行 2 を固定、売上の行は動かす → `B$2*B4+…` = 正答イ。E4 = 0.5×300000+0.3×100000+0.2×80000 = 196,000。
   - 2019h31h-q098: 合計 ≧120 かつ 各 ≧50 → 論理積、真で合格 = 正答ア。2023r05-q075: (1) 又は (2) → 論理和、真で合格 = 正答ウ。考点 points[1] (論理積 = すべて成立で真 / 論理和 = どれか 1 つで真) と detail の IF 書式 (条件・真の値・偽の値の順) で両題とも解ける。
   - 2020r02o-q071: E2 → E4 へ複写すると範囲は B4:D4 (相対)。10,000 / 20,000 / 30,000 のうち >15000 は 2 個 → 正答ウ。
   - 2011h23a-q069: B102 → B102〜D105 へ 2 方向複写。範囲は行固定 `B$2～B$100` (列は科目ごとに動く)、条件は列固定 `=$A102` (行は成績ごとに動く) → 正答ウ。
   - challenge 2018h30a-q080: 誤式 `$B4*(1.0+$D$2)` を E5 へ → `$B5*(1+$D$2)` = 600×1.05 = 630 → 正答ウ。図の `$B$2 (変わらない)` と一致。
   - challenge 2019r01a-q076: C5 = `B$1*合計(B$3:B5)/個数(B$3:B5)` = 1000×(10+8+0)/3 = 6,000 → 正答イ (始点 `B$3` 固定・終点 `B5` 相対)。
   - challenge 2016h28h-q080: 3,350 は ≦1000・≦3000 を外れ第 3 枝 → 整数部(100.5) = 100 → 正答ウ (ア も 3,350 では 100 になるが 1,000 / 3,000 の境界で誤り)。detail の IF 書式で読める。
   - 図 `terms[1].fig` (B2 / $B$2 / B$2 / $B2 × 1 行下 / 1 列右) の 8 セルを再計算 → 全て正しい (B3・C2 / $B$2・$B$2 / B$2・C$2 / $B3・$B2)。
   - 非計算題: 2009h21h-q076 (独自開発せずパッケージを導入する目的 = 開発コスト削減、正答イ) / 2025r07-q022 (quiz のみ; 営業成績を集約しグラフ化 = オフィスツール、正答ウ) / 2022r04-q071 (禁則処理の例 = 行頭の句読点・閉じ括弧が前行末へ、正答イ) / 2024r06-q058 (操作手順を定義して実行 = マクロ、正答エ) / 2014h26h-q070 (文書・Web ページに貼る画像データ = クリップアート、正答ウ)。
3. **quiz / challenge_questions** (quiz 計 8 枠 + challenge 5 題、本文で exam 考点に未引用 = 2025r07-q022 / 2018h30a-q080 / 2016h28h-q080 / 2019r01a-q076): 本文と矛盾なし (§1-2)。2025r07-q022 は overview_rows[1] (集計・分析・グラフ化) と key_points[0] (オフィスツール = パッケージの代表例) で解ける。誤答肢 (AI / IoT / データサイエンス) は本文に出ない。
4. **D-198 写し**: validate copy guard = 0 件 (warn 行なし、`choice-echo` 0)。独立照合: 単元 JP 文字列 104 本 (派生・source_figures 除く) × topic 内全 36 題の題文 (stem_jp_clean) + 選択肢を 12 字連続照合 (句読点・記号・空白除去)。
   - カタカナ 4 字以上・英数遮蔽あり → **0 件**。
   - 遮蔽なし → 5 件、全て見出し語 (+「を導入す(る)」「を」) の連なりで偽陽性: goals_jp[0]・terms[0].points[0].text_jp ↔ 2009h21h-q076 (「ソフトウェアパッケージを導入する」)、goals_jp[2]・terms[3].one_jp・terms[3].points[1].text_jp ↔ 2014h26h-q070 (「プレゼンテーションソフト」)。
   - 近似照合 (文単位 SequenceMatcher ≥0.5) → 0 件。最も近い terms[0].points[0] ↔ 2009h21h-q076 (題の前提 + 正答を 1 文にしたもの) は Dice 0.32 / ratio 0.47 で、HIGH の校正点 (Dice 0.52) より下 → L4。
   - 目視 (カタカナの多い文): terms[0].one / detail (ソフトウェアパッケージ・オフィスツール・インストール) は題の言い回しと別。terms[3].detail のクリップアート文「紙面やスライドに貼り込んで見た目を補う既製のイラスト素材」は 2014h26h-q070 の題文 (文書や Web ページに貼り表現力を上げる画像データ) の言い換えで、語順・語彙とも別 → 写しではない。
   - D-208 (iii) 型: 選択肢セット・順序の再現なし。terms[1].points[1] の 論理積 / 論理和 は 2019h31h-q098 / 2023r05-q075 の選択肢軸 (論理積 / 論理和 × 合格・不合格の順) のうち関数側の 2 つを両方とも肯定的な定義で述べる二語対比 (D-209 免除) で、点数 (120・50・100) や合否の順序は使わない。terms[1].points[2] の条件例「80 以上」は題の >15000 / =$A102 を使わない。terms[2].points[0] → L5。terms[2].points[1] → L6。
   - D-211: 引用題に正誤選択型 (記述のうち適切なもの / 不適切なもの) は無い (全て「式はどれか」「値はどれか」「例はどれか」「機能・名称はどれか」「目的として最も適切」) → 適用なし。
5. **D-195**: one = 1 文 × 5 (太字あり)、detail 2〜3 文、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `freq_badge`「標準」以外のヒットは「と覚える」1 件 (Webブラウザ hook + 派生 2) と「選ぶ」3 件 (mix 考点「…を選ぶ」= ソフトの使い分け、図 label / caption「リンクを選ぶ」= 操作) で、いずれも定型締め句ではない (u06 前例は 6 フック中 4 で記録、本単元 1/5 で記録なし)。zh / en の must / exam ヒットは通常の用法 (例: "must not shift"、"exam" は qid 配列近傍の `kind: exam`)。図の型: compare static (パッケージ vs 個別開発) / table static (参照の動き) / flow steps 4 (ブラウザ) / 図なし ×2 = 全て登録内。pair 配置: 文書作成ソフト → プレゼンテーションソフトは後者の後、key 行 (見せ方) あり。
6. **製品名の中立**: Excel / PowerPoint / Chrome / Edge / Safari / Firefox / Microsoft / Google / 一太郎 / Keynote / LibreOffice = 0 件。"Word"・"Office"・"Numbers" のヒットは全て一般語 (Word processing / Office tools / Numbers and formulas)。
7. **閉じた列挙 (観点 10)**: 参照の 3 種 (相対・絶対・複合) は網羅。ブラウザ機能「ブックマーク…履歴の機能もある」、文書作成の機能列挙、overview の「主な操作の例」、HTML「など」はいずれも開いた列挙 → 指摘なし。
8. **D-200**: 考点数 1/3/2/2/1 (≤3 ✓)、各 JP 1〜2 文 (terms[2].points[0] の「。」2 個のうち 1 個は鉤括弧内の記号で 1 文)・字数 45〜84 (≤100 ✓、最大 terms[1].points[1])。framing: validate 0 issues (上限 2 以内)。
9. **D-202 / D-203**: 書き方 7 (欄同士の照合) → L1・L3・L4 以外の不整合なし。書き方 8 (対比の出現欄): ① 文書作成 vs プレゼン = `pairs[0]` + `terms[3].points[1]` (mix) の 2 箇所 + goals_jp[2] (予告のみ) → 許容。② パッケージ vs 個別開発 = `terms[0].fig` + detail 2 文目 + analogy + key_points[0] → L7。③ 相対 / 絶対 = fig + detail + points[0] → L7。書き方 9 (限定条件): 2009h21h-q076「最も適切」→「主なねらい」保持、2024r06-q058「など」→ L6、2014h26h-q070 の「Web ページ」→ L6。
10. **三語・標記**: `[[jp:…]]` 原語 22 種が全て jp 本文に実在 (スクリプト、全 ok)。one_zh / one_en 5/5 に見出し語の `[[jp:]]` あり。zh 訳語が `zh_terms.json` (软件包 / 电子表格软件 / 文字处理软件 / 演示文稿软件 / Web 浏览器 / URL) と一致。
11. **既往指摘の解消 (journal `journal.b40-u01-a1.jsonl`)**: jp-review r1 MEDIUM (IF の書式が未定義) → detail_jp に「条件、条件が成り立つときの値、成り立たないときの値の順に書き」を追加済、三語一致、回帰なし。loc-review r1 MEDIUM (one_zh のワープロソフトが `[[jp:]]` なし) → 「又称**文字处理器**，[[jp:ワープロソフト]]」で解消。loc r1 LOW (避头尾処理 / hook の [[jp:ワープロ]] / hook_en の "spreadsheet" / detail_zh の「比较快」/ detail_en "on a page") → 全て適用済。loc-review r2 LOW (macro の en where 節) → **未適用** → L2。jp-review r2 LOW (絶対参照の「列や行」) → **未適用** → L1。
12. **D-205 / D-210**: 単元に規格・法令・ガイドラインの構成要素数や改正前文言に基づく引用題は無い → 適用なし。
13. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | ソフトウェアパッケージ | OK — exam 1 / 1 題: 自社開発の代わりに導入する主なねらい = 開発費用の抑制 (2009h21h-q076 正答イ; 「最も適切」→「主な」保持; 誤答 [開発環境・手法の習熟・担当者スキル] を支持しない)。quiz 2025r07-q022 は本文と整合。compare 図 4 行 (手に入れ方・費用 key・期間・業務への合い方) は detail / analogy (建売住宅) と一致 | OK | OK | L4 / L7 |
| 2 | 表計算ソフト | OK — exam 3 / 7 題: 複写で $ なしはずれ、$ 側は残る → ずらしたくない側にだけ $ (q076 / q055 / q091 再計算一致) / 論理積・論理和を IF 条件に (q098 / q075 一致) / 条件付個数 = 範囲 + 条件で個数 (q071 = 2、q069 = ウ 一致)。table 8 セル再計算一致。challenge 3 題 (630 / 6,000 / 100) も本文で解ける | OK | L1 (列や行) | L1 / L7 |
| 3 | 文書作成ソフト | OK — exam 2 / 2 題: 禁則処理 = 行頭「。」「、」「）」・行末「（」のように置き場所が禁じられた文字 (2022r04-q071 正答イ) / マクロは表計算ソフトにも備わり手順の繰り返しを自動化 (2024r06-q058 正答エ)。別名ワープロソフトは同一物として one の括弧内 (観点 3 の別物扱いなし) | OK | L2 (en where) | L2 / L5 / L6 |
| 4 | プレゼンテーションソフト | OK — exam 1 / 1 題: クリップアート = 既製の画像素材、スライドに限らず文書にも (2014h26h-q070 正答ウ) / mix: 手元で読む資料 = 文書作成、聞き手の前で映して話す = プレゼン。detail (スライドショー・切り替え効果・アニメーション) 正しい | OK | — | L3 / L6 |
| 5 | Webブラウザ | OK — exam 考点なし (topic 内出題 0、manifest freq_in_topic 0) / mix: ブラウザ = 表示側、Web サーバ = 保管・送出側。flow 4 段 (URL・リンク → 要求 → 受信 → 解釈して表示) は事実どおり、HTML「など」で開いた列挙 | OK | — | L8 / L7 |

**単元レベル**: goals 4・overview_cols 2・overview_rows 5・pairs 1 組 (3 行 key 1)・key_points 5・summary (派生一致)・challenge 5 件 (2018h30a-q080 / 2016h28h-q080 / 2023r05-q075 / 2011h23a-q069 / 2019r01a-q076、§1-2 で全て再計算・本文と矛盾なし)。事実誤りなし、三語一致 (L1・L2 を除く)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 8 (うち 建議修 4: L1〜L3、L8)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1].detail_jp` / `terms[1].detail_zh` (en は変更なし) | 絶対参照の定義が jp「列や行を動かさない」/ zh「让行或列不动」で「どちらか一方」とも読め、直後の複合参照 (片方だけ) と境界が曖昧。図セル「$B$2 (列と行の前に $)」と en "its column and row stay put" とも語がずれる (三語・欄の措辞級、jp-review r2 の LOW が未適用) | jp「**$** を付けて列や行を動かさない書き方を」→「**$** を付けて列と行を動かさない書き方を」/ zh「加上 **$** 让行或列不动的写法」→「加上 **$** 让行和列都不动的写法」 |
| L2 | LOW **建議修** | `terms[2].points[1].text_en` | 関係副詞 where が直前の spreadsheet software にだけ掛かり、自動化が表計算ソフトだけの働きに読める (jp・zh は両方に掛かる)。loc-review r2 の LOW が未適用 | en「, where they automate repeated fixed procedures.」→「, and in both they automate repeated fixed procedures.」 |
| L3 | LOW **建議修** | `terms[3].hook_jp / hook_zh / hook_en` (+ 派生 `memory_hook_*`, `summary.memory_hooks_*[3]`) | 「聞き手の前に資料を差し出して見せる」/ zh「把资料递到听众面前」/ en "handing material to the audience" は、特に zh「递」・en "handing" が資料を手渡す (配布) 像になり、同用語 mix 考点 `points[1]`「読み手が手元で読む資料なら文書作成ソフト」の側に寄る。目的節 (見せる / 展示 / so they can see it) で「見せる」側に留まる。型 (6) / (9) の MEDIUM は引用題・quiz・確認題の誤答肢への寄りを要件とし、本単元に配布資料 vs スライドを問う題は無い (衝突相手は同用語の mix 考点のみ) → LOW | jp「聞き手の前に資料を差し出して見せる場面を思い出す。」→「聞き手の目の前に資料を掲げて見せる場面を思い出す。」/ zh「想象把资料递到听众面前展示的场景。」→「想象把资料摆到听众眼前展示的场景。」/ en「Picture handing material to the audience so they can see it.」→「Picture material held up in front of the audience for them to see.」 (語源の像を残し手渡しの動詞だけを替える; one の言い直しを避ける) |
| L4 | LOW | `terms[0].points[0].text_jp/zh/en` | 2009h21h-q076 の前提 (独自に開発せず導入する) と正答 (開発コスト削減) を 1 文にした形。言い換え (業務用のソフトを自社で作る代わりに / 開発にかかる費用を抑える) で、12 字一致は見出し語 +「を導入する」のみ、Dice 0.32 / ratio 0.47 (HIGH 校正 0.52 未満)。誤答肢には触れない | 記録のみ |
| L5 | LOW | `terms[2].points[0].text_jp/zh/en` | 「行頭の「。」「、」「）」」は 2022r04-q071 正答イの「句読点や閉じ括弧」を同じ順で具体字にしたもの。ただし行末「（」を足した禁則処理の標準的な定義で、誤答肢の場面 (字下げ・大文字化・均等配置) は再現しない (分類型の正解内容を一般定義で述べる = D-209 免除の範囲、jp-review r2 と同判断) | 記録のみ |
| L6 | LOW | `terms[2].points[1].text_jp`、`terms[3].points[0].text_jp` | 型 (2) の点検: 2024r06-q058 の題文は「文書作成ソフトや表計算ソフト**など**」、考点は「文書作成ソフトに限らず表計算ソフトにも備わり」で「など」が落ちるが、「に限らず…にも」は追加の言い方で 2 種に閉じない → MEDIUM に当たらない。2014h26h-q070 の「文書や Web ページ」に対しクリップアート考点は「スライドに限らず文書づくりにも」で Web ページが落ちるが同じく閉じない。2 考点が「X に限らず Y にも」の同型 (jp-review r2 記録済) | 記録のみ |
| L7 | LOW | `terms[0].fig` / `detail_jp` / `analogy_jp` / `key_points_jp[0]`、`terms[1].fig` / `detail_jp` / `points[0]`、`terms[4].detail_jp` 1 文目 / `fig.steps[0].caption_jp` | D-203 §9 / 書き方 8 の反復: パッケージ vs 個別開発の結論が 4 欄、参照の動きが 3 欄、URL・リンクが detail と caption で同内容 (journal 記録済) | 記録のみ |
| L8 | LOW **建議修** | `terms[4].points[0].text_jp/zh/en` | ブラウザとサーバの関係を「役割が反対」/「正好相反」/ "the opposite role" と言うが、実際は要求・表示と保管・送出の分担で、goals_jp[3]「役割分担」・flow 図とも語がずれる (誤りではない、jp-review r2 記録済・未適用) | jp「とは受け持つ役割が反対である。」→「と役割を分担している。」/ zh「承担的角色正好相反。」→「分工合作。」/ en「, the opposite role from a **web server** ([[jp:Webサーバ]]), which stores page data and sends it out.」→「, sharing the work with a **web server** ([[jp:Webサーバ]]), which stores page data and sends it out.」 |

(before 文字列は全て単元 JSON 内に完全一致で存在することをスクリプトで確認: L1 jp/zh・L2・L8 各 1 箇所、L3 各 3 箇所 [hook + 派生 2])

**範囲外の観察**:
- O1 `unit_summary_*` は v1 と同文 (未改稿)。事実は正しい。
- O2 `terms[0].fig.data.rows[2].a`「導入と設定だけなので短い」の「だけ」はデータ移行・追加開発を捨象するが、個別開発との比較の行で IT パスポートの水準では誤りでない。
- O3 `terms[2].detail_jp` のマクロ「記録しておき」・`key_points_jp[3]`「操作を自動で繰り返す」は jp-review 記録済の措辞 LOW で、引用題 2024r06-q058 の正答と矛盾しない。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **8** (建議修 4: L1 / L2 / L3 / L8、記録のみ 4: L4〜L7) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 9 件 (qid 付き 7 件)・引用 11 題 + 未引用 quiz / challenge 4 題で、考点の主張は正答と一致 (表計算 10 題 = 引用 7 + challenge 3 を再計算して全て一致)、誤答肢を支持する記述・閉じた列挙・製品名・限定条件の落ちは無い。既往 MEDIUM 2 件は解消・回帰なし。LOW 建議修 4 件は補丁 (B3) で修正推奨。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-17-47-u01
✓ technology-17-47-u01 unit: 0 issues (data/ip/textbook/units/technology-17-47-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-17-47-u01
✓ technology-17-47-u01 parity: 24 locations, 0 diff
EXIT=0
```
