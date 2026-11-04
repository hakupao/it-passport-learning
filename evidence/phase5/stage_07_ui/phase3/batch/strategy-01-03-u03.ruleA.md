# Rule A 全数抽検 — strategy-01-03-u03 (財務諸表の全体像)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成、照合スクリプトは scratchpad)。
- **Date**: 2026-11-04 (S142 第 12 批 b12)、repo HEAD `e38e4a3` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b12-u03-a1` merge 結果 [attempt 1、parts `jp.r0` / `loc.r0` / `loc.r1`; JP 審査 1 輪目 PASS、訳審査 2 輪目 PASS]、sha256 先頭 `1266c7ba4b895b3b`、`merged.json` と同一)。
- **対象**: `data/ip/textbook/units/strategy-01-03-u03.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (貸借対照表 / キャッシュフロー計算書 / 資産 / 純資産 / 負債) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 (one_zh / one_en の `[[jp:]]` 見出し語、書き方 7・8・9)、D-203 (観点 8 対比反復・§6・§9 言い直し = low、観点 7 = medium [事実誤りなら high]、観点 9 限定条件落ち = high)、D-204 (比喩・hook の像が考点・detail の否定する内容を運べば medium) / D-205 (改訂される文書の構成数・名称に版か「例えば」)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `.planning/v2/strategy-01-03-u03/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・引用題が支持しない限定 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。hook は資産のみ空 (許容)。
2. **考点 × 引用題 (考点 全 12 件 = exam 12、全件 qid 付き、引用 qid 延べ 17 件 = 異なり 15 題)**: `data/ip/quiz/questions.json` から各題の題文・選択肢・`correct_answer` を再読 (全題 topic `strategy-01-03`; raw `stem_jp` に OCR 損傷なし)。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化・限定をしていないこと、題の前提を保持していることを 1 件ずつ確認。**計算題を自分で再計算し正答と一致**: 2017h29h-q021 営業利益 = 3,000 − 2,000 − 700 = 300 (網掛けを復元)、300 ÷ 1,000 × 100 = 30 (ウ) / 2018h30h-q011 総資産 100 + 500 = 600、純資産 (株主資本) 240、240 ÷ 600 = 40 (ア)、恒等式 160 + 200 + 240 = 600 ✓ / 2026r08-q026 総資産 730 + 270 = 1,000、純資産 (資本金) 300 → 30 (ア)、200 + 500 + 300 = 1,000 ✓ / 2025r07-q026 売上計上済み・未回収 = ③ 1,300 + ④ 1,000 = 2,300 (ウ); ①② 回収済み・⑤ 受注のみは除外 = `terms[2].points[0]` の除外 2 種と一致、④ 回収予定日未定も売掛金 (考点は除外しない ✓)、前提「期首残高なし」は定義の考点に影響しない。
3. **図・数値例の再計算 (三語とも)**: 純資産の表 800 − 500 = 300 (jp / zh / en とも同値、単位 万円 / 万日元 / 10,000 yen)。貸借対照表の表は数値なし (左右合計一致の行 key)。キャッシュフロー計算書の表は数値なし。
4. **数値の一致 (D-198 (iii))**: 単元の全数字 (800 / 500 / 300 / 3 / 100) を引用・quiz・challenge 全 16 題の数字・途中値・正解と照合。**組の一致・答えの再現 0**。単独値の一致のみ → L5: 800・500 ↔ 2025r07-q026 の取引①②の金額 (役割違い: 受注額 vs 資産・負債合計) / 500・300 ↔ 2026r08-q026 の固定負債 500・資本金 300 (300 は純資産で同じ役割だが、総資産 1,000 vs 800・負債 700 vs 500 で組が異なり、図の 300 ÷ 800 = 37.5% は どの選択肢とも一致しない)。
5. **D-198 写し**: validate の copy guard = 0 件。独立照合として単元の JP 文字列 111 本 (派生フィールド除く、`unit_summary_jp` 含む) を topic 内全 90 題の題文 + 選択肢と 12 字連続照合 (記法・句読点・記号・空白除去、NFKC)。**(イ) カタカナ 4 字以上と英数を □ 1 字に遮蔽** (見出し語は遮蔽しない、実字 6 未満の窓は除外) → **0 件**、**(ロ) 遮蔽なし** → **1 件** = `terms[1].points[0].text_jp` ↔ 2011h23a-q023: 一致部「はキャッシュフロー計算書」は見出し語 + 助詞で偽陽性。**近似一致** (文単位、bigram Dice ≥ 0.40 または最長共通連 ≥ 9; 較正 = HIGH 例 ed 0.14 / Dice 0.52): 候補 66 件、最高 Dice 0.56 / 連 5 (`overview_rows[2].extra_jp[0]` ↔ 2017h29a-q003 の表見出し「貸借対照表 / 借方 / 貸方」)、連 ≥ 9 は 見出し語の並び (`unit_summary_jp` / `goals_jp[0]` / `key_points_jp[0]` ↔ 財務諸表名の選択肢、連 11 =「キャッシュフロー計算書」) と `terms[2].points[1]` ↔ 2017h29h-q021 (連 9 =「総資産営業利益率」= 見出し語) のみ → 全て用語名の重なりで、1〜2 字置換の近似写しは無い。**目視**: カタカナの多い文はキャッシュフロー系の複合語だけ。比喩 (家計の記念写真・通帳・家とローン・友人への借金) はいずれも引用題に無い場面。
6. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 3 / 2 / 3 / 2 / 2 文、定義前使用 (財政状態 = 貸借対照表 one、借方・貸方 = detail、経営成績 = 考点内の括弧注、売掛金 = キャッシュフロー計算書 detail の括弧注、総資産 = 資産 detail、自己資本 = 純資産 detail、他人資本 = 負債 detail; 例外は L9 [自己資本比率]・L3 [有価証券報告書]、営業利益 は前単元 u01 の見出し語)、§9 禁止句 grep (jp: 試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が / 正解、zh: 考试 / 务必 / 重要 / 必须 / 一定 / 出题 / 选项 / 答案 / 记住 / 常考、en: exam / must / always / important / remember / choice / answer / tested / key → ヒットは `freq_badge`「頻出」、図列名「資金が出る例」(= 出ていく)、zh「一定期间」、en "examples" / "must be repaid" / "always match" / "always holds" (恒等式の記述)、`source_figures[0].figure_description` の「選択肢」(本文外のメタデータ) のみ、全て通常の用法)、図の型 (貸借対照表・キャッシュフロー計算書・純資産 = static table、資産・負債 = 図なし; 全て登録内)、pair 配置 (貸借対照表 / キャッシュフロー計算書 は後者の後、純資産 / 負債 は負債の後、各組 key 行あり)。
7. **D-200**: 考点数 3 / 3 / 2 / 2 / 2 (≤3 ✓)、各 JP 文数 1〜2・字数 27〜67 (≤100 ✓、最大は資産 `points[0]` の 67 字)。**framing 件数** (validateV2 `POINT_FRAMING`): jp 0 / zh 0 / en 0 (上限 2)。D-197 羅列: validate 0。
8. **D-202 / D-203 / D-204 単元全体点検 (書き方 7 = 欄同士の範囲)**: 下記を全欄で照合。
   - 貸借対照表 = 時点: one「決算日など特定の時点」/ overview「特定の時点」+ extra「時点 (決算日など)」/ pairs[0].rows[0].a「決算日など特定の時点」/ 考点 points[0]「決算日など一時点」/ key_points[0] / analogy「月末のある瞬間に撮った写真」→ 一致。引用題の語「財務状態」(2019h31h-q018 / 2009h21h-q016) と単元の「財政状態」(2010h22h-q010 の語) は同じ指示物、単元内は「財政状態」で統一 ✓。
   - キャッシュフロー計算書 = 期間・資金・3 区分: one / overview / pairs[0].rows[0..2] / detail / 図 / points[0] / key_points[0] → 一致。区分の範囲: detail・図 col「本業の売り買い / 設備などへの投資 / 資金の調達と返済」に対し図の例は 給料 (営業)・配当の支払い (財務) を含む。日本基準で事実は正しい (配当支払 = 財務、給料 = 営業) が、見出しの言葉より例が広い → L12。points[1] の「本業で」は 2011h23a-q023 の 商品の販売による収入 を言い換えたもので限定の追加ではない。
   - **資金の増減と利益の関係**: detail「代金を受け取る前なら手元の資金は増えていない」/ points[2]「売掛金が増えると…代金がまだ入っていないので、キャッシュフローは減る」/ key_points[2]「資金の増減は…現金の出入りで決まり、売掛金の増加は資金を減らし」→ **不整合 = M1** (§3)。
   - 資産 = 借方・資金の使い道・総資産: one / overview / detail / 図 (貸借対照表) / 純資産図 row0 → 一致。analogy「いま手元にある持ち物」と detail の売掛金 (代金を後日受け取る) → L2。
   - 純資産 = 資産 − 負債、返済不要、自己資本、貸方の下: one / overview / pairs[1] / detail / 図 / points[0] → 一致。純資産 = 自己資本 は IT パスポートの慣行どおり (引用 2 題の B/S は純資産の部が 株主資本 240 / 資本金 300 の 1 項目のみ) — 範囲外観察 O2。one「正味の財産」と貸借対照表の図「返す必要のない調達元」は同じ額の 2 つの見方で矛盾しない。
   - 負債 = 将来の返済・支払義務、貸方の上、他人資本、調達源: one / overview / pairs[1] / detail / 図 → 一致。points[0] 借入金増 → 資金増 は 2009h21a-q010 正答エ と一致 (直接の現金流入なので「増える」と言い切って正しい)。
   - **恒等式 資産 = 負債 + 純資産**: goals[1] / 貸借対照表 detail / 図 row2 (key) / 負債 points[1] / key_points[1] / 純資産図 (800 − 500) → 一致、両引用題の表で成り立つ (§1-2)。
   - **D-204 比喩・hook**: 記念写真 (時点) / 家 − ローン (純資産) / 友人への借金・後払い (負債) は否定内容を運ばない。通帳の明細「順に並ぶ」は考点の 3 区分と像がずれる → L1。資産の「いま手元にある」→ L2。いずれも考点が明示的に否定する内容 (D-204 の型) ではないため medium にしない。
   書き方 8 (対比の出現欄) → L7。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → L10。§9 言い直し → L6。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行の三語一致 (en の単位表記 → L4)、`[[jp:…]]` 原語 24 種 (キャッシュフロー / キャッシュフロー計算書 / 借入金 / 借方 / 債務 / 収益性 / 営業利益 / 営業活動 / 売掛金 / 当期純利益 / 損益計算書 / 純資産 / 経営成績 / 総資産 / 総資産営業利益率 / 自己資本 / 自己資本比率 / 負債 / 財務諸表 / 財政状態 / 貸借対照表 / 貸方 / 資産 / 連結貸借対照表) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 5 用語に見出し語の `[[jp:]]` あり (D-202)、zh 訳語が `zh_terms.json` (unit 抽出 14 語) に従う (资产负债表 / 现金流量表 / 资产 / 净资产 / 负债 / 营业利润 / 盈利性 一致; validate の B6 warn / jp-origin warn 0)。
10. **D-205**: 改訂される文書の構成数・名称は登場しない (有価証券報告書は名称のみで構成・数を述べない) → 該当なし。
11. **quiz / challenge_questions** (quiz 計 8 枠 + challenge 5 題、うち本文で未引用 1 題 = 2014h26a-q018): 本文と矛盾なし。challenge 5 題は v1 と同じ集合 (2011h23a-q023 / 2017h29h-q021 / 2018h30h-q011 / 2016h28a-q011 / 2019h31h-q018)。2014h26a-q018 (有価証券報告書で開示が義務の情報 = CF・損益・貸借、市場シェアは否) は 貸借対照表 detail「損益計算書などとともに有価証券報告書で開示」から 損益・貸借 は読めるが CF が開示対象であることは本文に無く、ウ / エ を決めきれない → L3。
12. **prior 指摘の解消状況** (jp-review r1 PASS [low 7] / loc-review r1 REVISE [medium 1 + low 3] / loc-review r2 PASS [low 3]): **loc r1 MEDIUM「决算日」解消・退行なし** — zh 4 箇所 (`terms[0].one_zh`・`terms[0].points[0].text_zh`・`overview_rows[0].extra_zh[1]`・`pairs[0].rows[0].a_zh`) 全て「决算日」、en 4 箇所 全て "fiscal year-end" (loc r1 LOW も解消)。loc r1 LOW「純」の字の対応 (`terms[3].hook_zh`) → 語の対応に書き直し済み ✓。loc r1/r2 LOW 他人资本 → 未適用 (L13)。loc r2 LOW 合影・hook_en "Net" → 未適用 (L13)。jp r1 LOW 7 件 (全て fix_jp 空、JP は r0 のまま) → 再確認し全て LOW のまま: §9 言い直し 3 件 → L6、総資産恒等式の引用の弱さ → L6 (両引用題の表で恒等式が成り立つので qid 不適ではない)、対比反復 → L7、自己資本比率の定義前使用 → L9、負債 hook → L10、ROE の ×100 → L11。
13. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 貸借対照表 | OK — exam 3 / 4 題: 決算日など一時点の財政状態、期間のもうけ (経営成績) は損益計算書で別の表 (2019h31h-q018 正答エ; 誤答ア CF・イ 損益・ウ 純資産の変動 を支持しない / 2009h21h-q016 正答ア 一会計期間の経営成績; 誤答イ 現金収支・ウ 一時点の財務状態・エ 純資産の部の変動 を支持しない) / 借方 = 資産の部、貸方 = 負債の部 + 純資産の部 (2017h29a-q003 正答ア; 資本金・利益の部 を置く誤答を支持しない) / 子会社を含む企業集団を親会社が作る = 連結貸借対照表 (2010h22h-q010 正答エ; 限定条件「子会社まで含めたグループ全体」「親会社が作る」保持)。table (左 = 資産のみ / 右 = 負債・純資産 / 合計一致 key) は detail・考点と一致 | OK | OK | L3, L6, L7 |
| 2 | キャッシュフロー計算書 | 3 区分で示す財務諸表 (2010h22a-q021 正答ア; 誤答エ 有価証券報告書 を支持しない) / 商品販売の受取り = 営業活動 (2011h23a-q023 正答ア) — OK / **売掛金の増加 → キャッシュフローは減る (2016h28a-q011 正答ア と結論は一致、誤答 減価償却費増・在庫減・短期借入金増 を支持しない) が、理由「代金がまだ入っていないので」から導けるのは「増えない」で、detail と食い違い、前提「利益と比べて」が落ちている → M1**。table 3 区分 (営業 / 投資 / 財務、入り・出の例) は日本基準で事実どおり | OK | OK | **M1**, L1, L6, L7, L8, L12 |
| 3 | 資産 | OK — exam 2 / 2 題: 売掛金 = 売上計上済み・未回収、受注のみ・回収済みは含まない (2025r07-q026 正答ウ 2,300、再計算一致) / 総資産営業利益率 = 営業利益 ÷ 総資産 × 100 (2017h29h-q021 正答ウ 30、再計算一致; 営業利益は u01 で定義)。図なし (定義型) | OK | OK | L2, L9 |
| 4 | 純資産 | OK — exam 2 / 5 題: 自己資本比率 = 純資産 (自己資本) ÷ 総資産 × 100 (2018h30h-q011 正答ア 40 / 2026r08-q026 正答ア 30、再計算一致) / ROE = 当期純利益 ÷ 自己資本、収益性の指標、E = Equity (2018h30a-q024 正答イ / 2020r02o-q030 正答エ / 2013h25h-q002 正答ウ; 誤答 ROA・自己資本比率・当座比率、Earnings 等を支持しない)。table 800 − 500 = 300 三語一致 | OK | hook_en の手がかり差 (L13) | L5, L11, L13 |
| 5 | 負債 | OK — exam 2 / 3 題: 借入金の増加 → 資金が入りキャッシュフローは増える (2009h21a-q010 正答エ; 誤答ア 売上債権増・イ 投資増・ウ 棚卸資産増 を支持しない) / 総資産 = 負債 + 純資産 (2018h30h-q011・2026r08-q026 の表で成立、§1-2)。図なし | OK | 他人资本 (L13) | L6, L10, L13 |

**単元レベル**: goals 3 点・overview_cols 2 (分類・位置 / 手がかり)・overview_rows 5 行・pairs 2 組 (貸借対照表 / キャッシュフロー計算書 3 行 key 1、純資産 / 負債 4 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 5 件 (§1-11)。key_points[2] は M1 に含む。他に事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 13 (うち 建議修 4)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** (観点 7 欄同士の不整合 + 前提落ち) | `terms[1].points[2].text_jp/zh/en`、`key_points_jp/zh/en[2]` (+ 派生 `summary.key_points_*[2]`) | 同用語 detail は「代金を受け取る前なら手元の資金は**増えていない**」(正しい) と書くが、points[2] は同じ理由 (代金がまだ入っていない) から「キャッシュフローは**減る**」と結び、key_points[2] は「資金の増減は現金の出入りで決まり、売掛金の増加は資金を減らし」と書く。掛け売りは現金を出さないので、現金の出入りで見れば売掛金の増加で資金は減らない。2016h28a-q011 の「減少要因」は **利益を出発点に資金を求めるとき利益より少なくなる** という意味 (間接法の調整) で、その前提が落ちたため detail と矛盾し、「売掛金が増えると手元の現金が減る」という誤った因果を学ばせる。正答 (ア) との結論は一致するので high ではない | points[2] jp「売掛金が増えると、売上は立っても代金がまだ入っていないので、キャッシュフローは減る。」→「売掛金が増えると、売上は立っても代金がまだ入っていないので、その分だけキャッシュフローは利益より少なくなる。」/ zh「应收账款（[[jp:売掛金]]）增加时，虽然确认了销售收入，但货款还没到手，所以现金流（[[jp:キャッシュフロー]]）减少。」→「应收账款（[[jp:売掛金]]）增加时，虽然确认了销售收入，但货款还没到手，所以现金流（[[jp:キャッシュフロー]]）会比利润少相应的金额。」/ en "When accounts receivable ([[jp:売掛金]]) rise, sales are booked but the money has not yet come in, so cash flow ([[jp:キャッシュフロー]]) falls." → "When accounts receivable ([[jp:売掛金]]) rise, sales are booked but the money has not yet come in, so cash flow ([[jp:キャッシュフロー]]) falls short of profit by that amount." ; key_points[2] jp「資金の増減は利益ではなく現金の出入りで決まり、売掛金の増加は資金を減らし、借入金の増加は資金を増やす。」→「資金の増減は利益ではなく現金の出入りで決まり、売掛金の増加は資金を利益より少なくし、借入金の増加は資金を増やす。」/ zh「资金的增减取决于现金的进出而不是利润，应收账款增加会使资金减少，借款增加会使资金增加。」→「资金的增减取决于现金的进出而不是利润，应收账款增加会使资金比利润少，借款增加会使资金增加。」/ en "Changes in cash depend on actual money in and out, not on profit: a rise in accounts receivable reduces cash, and a rise in borrowings increases it." → "Changes in cash depend on actual money in and out, not on profit: a rise in accounts receivable leaves cash short of profit, and a rise in borrowings increases it." (新 JP 54 字 / 56 字、topic 90 題と 12 字一致 0、2016h28a-q011 の題文の語「減少要因」は使わない) |
| L1 | LOW **建議修** | `terms[1].analogy_jp/zh/en` | 比喩の像「入出金が順に並ぶ」/「按顺序排列」/ "each movement is listed in order" は日付順の明細で、同用語の考点 points[0]・detail・pairs[0].rows[2] の「活動の種類ごとに 3 区分へ分けて示す」(2010h22a-q021 の判別点) と像がずれる。考点が日付順を明示的に否定するわけではないので D-204 medium にはしない | jp「1 か月分の通帳の入出金明細のようなもの。給料日に増え、家賃の引き落としで減った動きが順に並ぶ。」→「1 か月分の通帳の入出金を、給料や生活費、車の売り買い、ローンの借入れと返済の 3 つに分けて集計し直したようなもの。何のためにいくら動いたかが区分ごとにわかる。」/ zh「就像一个月的存折收支明细。发工资那天余额增加，扣房租时减少，这些变动按顺序排列。」→「就像把一个月存折上的收支，按工资和生活开支、汽车的买卖、贷款的借入与偿还分成 3 类重新汇总。为了什么、动了多少钱，按类别一目了然。」/ en "It is like a month of entries in a bank passbook. Money comes in on payday and goes out when the rent is debited, and each movement is listed in order." → "It is like taking a month of bank passbook entries and regrouping them into three totals: pay and living costs, buying or selling a car, and taking out or repaying a loan. You can see how much moved, and for what, in each group." (JP 78 字、12 字一致 0) |
| L2 | LOW **建議修** | `terms[2].analogy_jp/zh/en` | 「いま手元にある持ち物」は、同用語 detail の売掛金 (代金を後日受け取る = 手元に無い) も資産に含まれる点と像がずれる。例示 (など) で排他ではないため low | jp「家計でいえば、預金や家、車など、いま手元にある持ち物にあたる。」→「家計でいえば、預金や家、車、友人に貸していて返してもらう予定のお金など、いま持っている財産にあたる。」/ zh「放在家庭财务里，就相当于存款、房子、汽车等眼下手中的东西。」→「放在家庭财务里，就相当于存款、房子、汽车，以及借给朋友、等着收回的钱等眼下拥有的财产。」/ en "In household terms, these are the things you have right now, such as savings, a house, and a car." → "In household terms, these are what you own right now, such as savings, a house, a car, and money you lent a friend and expect to get back." |
| L3 | LOW **建議修** | `terms[0].detail_jp/zh/en` 3 文目 | quiz 2014h26a-q018 (キャッシュフロー計算書の inline quiz) の判別点 = キャッシュフロー計算書も有価証券報告書で開示されること が本文に無く、「損益計算書など」からは決めきれない。また「有価証券報告書」は単元・topic 内で未定義 (D-195 定義前使用) | jp「上場企業はこの表を損益計算書などとともに有価証券報告書で開示している。」→「上場企業はこの表を損益計算書やキャッシュフロー計算書などとともに、投資家向けに毎年出す有価証券報告書で開示している。」/ zh「上市公司会把这张表与利润表等一起，在有价证券报告书中公开披露。」→「上市公司会把这张表与利润表、现金流量表等一起，在每年面向投资者发布的有价证券报告书中公开披露。」/ en "Listed companies disclose this statement, along with the income statement and others, in their annual securities report." → "Listed companies disclose this statement, along with the income statement, the cash flow statement and others, in the annual securities report they publish for investors." (JP 58 字、12 字一致 0) |
| L4 | LOW **建議修** | `terms[3].fig.data.cols[1].en` | "Amount (10,000 yen)" は「金額は 1 万円」と読める。jp「金額 (万円)」/ zh「金额（万日元）」は単位の意味で明確 (三語差) | en "Amount (10,000 yen)" → "Amount (in units of 10,000 yen)" |
| L5 | LOW | `terms[3].fig.data` (800 / 500 / 300) | 引用題の数値との **単独の値** の一致 (§1-4: 800・500 ↔ 2025r07-q026 取引額、500・300 ↔ 2026r08-q026 固定負債・資本金)。組の一致・答えの再現なし → D-198 (iii) に当たらない (u02 L7 と同型) | 記録のみ |
| L6 | LOW | `terms[0].points[1]`、`terms[1].points[0]` / `[2]`、`terms[4].points[1]` | 同用語 detail・図の言い直し (D-203 §9、jp r1 LOW 3 件)。負債 points[1] は引用 2 題が自己資本比率の題だが、両題の表で恒等式が成り立つので qid 不適ではない | 記録のみ |
| L7 | LOW | 時点 / 期間: `pairs[0].rows[0]`・`key_points[0]`・`terms[1].hook`; 返済の要否: `pairs[1].rows[0]`・`terms[0].fig.data.rows[0..1]` | 書き方 8 の同じ対比の 3 箇所目 (overview 総表は D-195 §3 の構造、one は定義そのもので数えない) | 記録のみ (key_points は単元の要約で、図は貸借対照表の記載形式そのもの) |
| L8 | LOW | `terms[1].hook_jp/zh/en` | 「残高を写す表ではなく」は対比の手がかりとして有効だが、実際のキャッシュフロー計算書は末尾に期末の資金残高も示す (言い過ぎ、試験の判別点には影響しない) | 記録のみ |
| L9 | LOW | `terms[2].detail_*` 3 文目 | 自己資本比率を定義前に例示 (定義は純資産 points[0]、jp r1 LOW) | 記録のみ |
| L10 | LOW | `terms[4].hook_*` | 後半「支払いの約束を表す字」が one の「義務」の言い換えに近い (§6、jp r1 LOW) | 記録のみ |
| L11 | LOW | `terms[3].points[1].text_*` | ROE は「割って求める」のみで × 100 を書かず、同用語 points[0] (× 100) と粒度が揃わない (jp r1 LOW)。引用 2018h30a-q024 の判別点は分子 (当期純利益) で、誤答を支持しない | 記録のみ |
| L12 | LOW | `terms[1].detail_*` 1 文目・`terms[1].fig.data.rows[0..2].cells[1]` | 区分の説明「本業の売り買い」「資金の調達と返済」より図の例 (給料の支払い・配当の支払い) が広い。事実は日本基準どおり | 記録のみ |
| L13 | LOW | `terms[4].detail_zh`・`overview_rows[4].extra_zh[1]`・`pairs[1].rows[1].b_zh` (他人资本)、`terms[0].analogy_zh` (合影)、`terms[3].hook_en` ("Net") | loc r1 / r2 の LOW 3 件が未適用 (いずれも誤訳ではない) | 記録のみ (任意の修正案は loc-review r2 の fix_jp どおり) |

**対比の出現欄 (書き方 8 の列挙)**: ① 時点 / 期間: `pairs[0].rows[0]` (key)、各 one (定義)、overview 総表、`key_points[0]`、キャッシュフロー計算書 hook、貸借対照表 points[0] (損益計算書との対比で別軸) → L7。② 資産・負債・純資産の位置: `pairs[1].rows[3]`、貸借対照表 detail・図・points[1]、overview 総表 → 位置は記載形式そのもの (2017h29a-q003) で許容。③ 返済の要否・自己資本 / 他人資本: `pairs[1].rows[0..1]`、貸借対照表図、overview 総表、各 detail (別名の定義) → L7。④ 利益と資金: CF detail・points[2]・key_points[2] → M1 で範囲を揃える。

**範囲外の観察**:
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。見出し語の連なりで近似照合に掛かるが (§1-5)、用語名の重なりのみ。
- O2 純資産 = 自己資本 の同一視 (`terms[3].detail`・`pairs[1].rows[1]`・`overview_rows[3].extra[1]`・`terms[3].points[0]`) は厳密には会計上別概念 (新株予約権・非支配株主持分等) だが、IT パスポートの引用題は同一視しており、本単元で区別を足す必要はない。

確認済みで問題なし: 限定条件 (考点 12 件全て保持、§2; M1 は前提の欠落として別記)、計算題 4 題と図の再計算 (三語)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤67 字)、写し (validate 0、独立照合は見出し語の偽陽性のみ)、`[[jp:]]` 原語 (24 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (5/5)、zh 訳語表 (B6 warn 0)、図種 (static table ×3 / 図なし ×2 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、比喩 5 件の D-204 (medium 0)、loc r1 MEDIUM 解消。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **13** (建議修 4: L1〜L4 / 記録のみ 9: L5〜L13) |

## 5. 判定

**FAIL** (D-199: MEDIUM 1)。全 5 用語・考点 12 件・引用 15 題 + 未引用 quiz 1 題で、考点の結論は全て正答と一致し誤答肢を支持しないが、M1 (売掛金の増加と資金の関係で detail と考点・要点が食い違い、「利益と比べて」の前提が落ちる) は観点 7 の medium。M1 は 2 欄 × 三語の文字列置換 (構造変更なし) で解消でき、B3 補丁 (M1 + 建議修 L1〜L4) 適用後に validate / parity の再実行と M1 欄の再確認で PASS とできる。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-03-u03
✓ strategy-01-03-u03 unit: 0 issues (data/ip/textbook/units/strategy-01-03-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-03-u03
✓ strategy-01-03-u03 parity: 24 locations, 0 diff
EXIT=0
```
