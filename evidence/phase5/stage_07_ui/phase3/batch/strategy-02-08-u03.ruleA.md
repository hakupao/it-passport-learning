# Rule A 全数抽検 — strategy-02-08-u03 (主要な国際・国内規格)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 作業用スクリプトは scratchpad のみ)。
- **Date**: 2026-11-08 (S150 b53)、repo HEAD `9dea1e22` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b53-u03-a2` merge 結果、sha256 先頭 `8d687ded9493b21f`)。
- **対象**: `data/ip/textbook/units/strategy-02-08-u03.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (ISO 9000 / ISO 14000 / ISO 26000 / ISO/IEC 27000 / ISO 30414 / JIS Q 31000 / JIS Q 38500) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、D-208〜D-210、S147 追加型 (8)〜(10)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種)。比較: `data/ip/textbook/.planning/v2/strategy-02-08-u03/v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致、`title_*`・`unit_summary_*` も v1 と同文)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・D-205 版なしの閉じた構成 (現行版と違う) / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版 (`**` 除去、`[[jp:X]]` → X) であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 9 件 = exam 6 + mix 3、qid 付き 6 件、引用 qid 延べ 8 件 = 異なり 7 題)**: `data/ip/quiz/questions.json` から各題の題文 (`stem_jp_clean` 優先)・選択肢・`correct_answer` を再読 (全題 topic `strategy-02-08`)。考点の主張が正答と一致し、誤答肢を支持せず、題の限定条件を外していないことを 1 件ずつ確認 (§2)。ISO 26000 / ISO 30414 / JIS Q 31000 / JIS Q 38500 は term_questions 0 題 (manifest) で、考点は mix のみ (JIS Q 31000 は考点 0)。
3. **quiz / challenge_questions** (quiz 計 7 枠 = 異なり 6 題 + challenge 3 題、うち本文で未引用 2 題 [2018h30a-q014 / 2018h30h-q032]): 2018h30a-q014 (ISO が規格化している MS = ISMS; 誤答 = コンテンツ / タレント / ナレッジ MS) は ISO/IEC 27000 one「ISO と IEC が共同で作る国際規格群」と整合。2018h30h-q032 (ISMS・QMS を標準化する国際機関 = ISO; 誤答 ANSI / CEN / JIS) も one・key_points[0] と整合 (IEC は選択肢に無く、「共同」は正答 ISO を否定しない)。2024r06-q011 (品質の運営管理を標準化し管理の質・効率を上げる方策 = ISO 9001 の導入; 誤答 ISMS / ITIL / プライバシーマーク) は terms[0].points[0]・points[2] で解ける。2018h30a-q033 (情報セキュリティマネジメントの規格 = JIS Q 27001) は terms[3].points[0] で解ける。
4. **D-198 写し**: validate の copy guard = 0 件、`warn  choice-echo` 行 0。独立照合として単元の JP 文字列 123 本 (派生除く) を topic 内全 29 題の題文 + 選択肢と 12 字連続照合 (記号・空白除去):
   - **カタカナ 4 字以上・英数を遮蔽**: 0 件。
   - **遮蔽なし**: 22 件、全て偽陽性 — 一致部は「品質 / 環境 / 情報セキュリティ マネジメントシステム」「メントシステムの国際規格」「セキュリティマネジメント」(分野名 + マネジメントシステム = 見出し語の概念名そのもの) と、`terms[0].points[2]`↔2016h28h-q016「ISO9001を導入する」(規格名 + 動詞、題文の問い方 [期待できるメリット] は使っていない)。
   - **1〜2 字置換の近似一致**: 255 件、全て「〜マネジメントシステム」を含む窓 (同じ概念名の言い換え) で、それを除くと 0 件。
   - **類似度 (考点・one・detail・hook・key_points × 全題の題文・各選択肢)**: 最大は `terms[1].points[0]` ↔ 2017h29a-q010 題文 Dice 0.48 / ed 0.63 (HIGH の較正 ed 0.14 / Dice 0.52 から遠い)、次いで `terms[3].one_jp` ↔ 2018h30a-q014 イ 0.40 / 0.74、他は ≤0.38。
   - **(iii) 選択肢のなぞり**: `terms[1].points[0]`「ISO が定めた環境マネジメントシステムの規格群は ISO 14000 で、…要求事項は ISO 14001」は 2017h29a-q010 (ISO が定めた環境 MS の国際規格はどれか、正答 ISO 14000) の題文を正答で埋めた形に近い。重なりは「ISO が定めた」+ 見出し語の概念名「環境マネジメントシステム」で、選択肢の組 (9000 / 14000 / 20000 / 27000) も順序も再現せず、誤答の打ち消しも無い。分類型の題の正答内容を見出し語の一般定義として述べたもので D-209 の免除に当たる → L2 (記録のみ)。`terms[0].points[2]` は 2016h28h-q016 正答エ・2024r06-q011 題文と同じ因果 (品質業務の標準化 → 管理の質・効率) だが、正答 1 肢の内容の一般表現で、誤答 (貿易手続・技術仕様・情報資産) の組・場面を使わない → L3。`terms[3].points[1]` は 2025r07-q002 題文の 3 要素 (既存の ISMS 規格が土台 / クラウド / 指針) と同順だが 27017 の標準的な定義で、選択肢 (14001 / 15001 / 27017 / 9001) に触れない → L4。カタカナの多い文 (`terms[3].one_jp`・`points[1]`・`fig` 行) は目視でも題文の語順を写していない。比喩 (飲食チェーン・家計簿・市民の心得・家族の防犯計画・健康診断票・旅行の段取り・船長) はいずれも引用題に無い場面。
5. **D-195**: 結論先行 (one = 1 文 × 7、太字あり; JIS Q 31000 のみ見出しの概念語 **リスクマネジメント** を太字)、展開 2〜3 文 (3/2/2/2/2/2/2 文)、図の型 (ISO/IEC 27000 = static table 3 行、JIS Q 31000 = flow steps 4、JIS Q 38500 = flow steps 3、他 4 用語 = 図なし; 全て登録内)、定義前使用 (QMS・EMS・ISMS・SR = one の括弧注、要求事項 = ISO 9000 detail、管理策 = 27000 detail [図が先 → L7]、人的資本 = 30414 one、リスク・リスクアセスメント = 31000 detail、IT ガバナンス = 38500 one)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → 「検定試験」(ISO 26000 analogy、比喩の場面で定型句ではない) と「EDM と覚える」(hook の記憶の言い方、1 件) のみ。zh / en 相当語 [考试 / exam / must] は analogy の「资格考试 / certification exam」、caption の "Examine / examine"、"must meet" (要求事項の説明) で全て通常の用法)、pair 配置 (ISO 9000→14000 は ISO 14000 の後、JIS Q 31000→38500 は JIS Q 38500 の後、各組 key 行あり)。
6. **D-200**: 考点数 3/1/1/2/1/0/1 (≤3 ✓)、各 JP 1〜2 文・字数 54〜72 (≤100 ✓)。**framing 件数** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0 (validate 0 issues; 考点内に「試験」「出題」等の語なし)。
7. **D-205 / D-210 (改訂される規格) — 一次資料照合**:
   - **JIS Q 38500**: 2026-02-20 に改正 (JIS Q 38500:2026 ← ISO/IEC 38500:2024)。改正原案作成委員会 委員長の解説 (ITSCJ ニュースレター NL111, 2026-1) に「モデルでは、従来の、EDM（評価、指示、モニタ）にステークホルダー対応が追加されています」「JIS Q 38500 の旧版では、6 の原則…11 の原則に併せるために改訂」。ISO/IEC 38500:2024 の目次 (iteh / DIN 草案) も 6.2.1 Engage stakeholders → 6.2.2〜6.2.4 Evaluate / Direct / Monitor。JSA Webdesk は 2026-11-11 まで保守停止のため JIS 本文そのものは未読。単元は `terms[6].detail` のみ「JIS Q 38500:2015 では」と版付きで、`pairs[1].rows[2].b`・`terms[6].hook` (+ `summary.memory_hooks_*[2]`)・3 ノード図は版なしで EDM の 3 つを閉じた構成として示す → **M1**。原則の数 (6 / 11) はどの欄も言わない ✓。`terms[6].points[0]` (評価・指示・モニタする主体は経営者層) は 2026 年版でも EDM と統治主体は残るので正しく、閉じた列挙でもない → 修正不要。
   - **ISO 30414**: ISO TC 260 公式 (committee.iso.org、2025-08-24) — 第 2 版 ISO 30414:2025 (Requirements and recommendations for human capital reporting and disclosure) が 2018 年版 (Guidelines) を置き換え、「auditable requirements」を導入。単元は `terms[4].one`「2018 年版は指針」・`overview_rows[4].extra[1]`「(2018 年版)」と版付き ✓ だが、`overview_rows[4].one_line` は版なしで「国際的な指針」 → **L1 建議修**。
   - **ISO/IEC 27017**: 第 2 版 2026 (Information security controls based on ISO/IEC 27002 for cloud services) も 27002 を土台にした指針 (guidance、要求事項ではない) で、クラウド事業者・利用者の両方向け (iso27001security.com の版情報・概要) → `terms[3].points[1]`・図 row[2] は両版で正しく版不要。2025r07-q002 (2015 年版当時の「ガイドライン規格」) とも一致し D-210 の影響なし。
   - **JIS Q 31000 / ISO 31000**: ISO 31000:2018 (= JIS Q 31000:2019) の改訂版の発行は見当たらず。`terms[5].detail` は「JIS Q 31000:2019 では」と版付きで、リスク = 目的に対する不確かさの影響、リスクアセスメント = 特定・分析・評価 は同版どおり ✓。図 4 ノード (特定 / 分析 / 評価 / 対応) は 2010 年版から不変。
   - **ISO 26000** (2010、未改訂): detail の中核主題は 5 つを挙げて「など」で閉じない ✓ (原典は 7)。**ISO/IEC 27000 系**: detail「要求事項・管理策の手引・特定分野向けの補足など」✓、図 3 行は列見出し「規格」で系列の全員とは言わず、detail の「など」と併せて閉じた列挙と読まれない (L7 に付記、記録のみ)。CIA の定義は ISO/IEC 27000 どおり ✓。
   - **ISO 9001 / 14001** (2026 年改訂が進行): 版で変わる数・構成を述べる欄なし (PDCA は一般の運用法として 1 文) → 影響なし。
   - **D-210**: 引用・quiz・challenge 9 題のうち改訂前の文言に依拠するのは 2010h22a-q013 (JIS Q 9000 の品質の定義を題文で引用) だけで、2015 年版の定義も同じ趣旨 (対象に本来備わっている特性の集まりが要求事項を満たす程度) → `terms[0].points[1]`「ISO 9000 の考え方では」で版不要。2014h26a-q003 / 2018h30a-q033 (JIS Q 9001 / 27001) も規格の性格は現行版と同じ。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士): 要求事項 = 認証の基準 は overview_rows[0][1][3]・terms[0][1] detail・図 27000 row0・pairs[0].rows[1]・key_points[1] で一致; ISO 26000 = 手引・認証を目的としない は one・analogy・points[0]・overview_rows[2] で一致; ISO 30414 は one (2018 年版は指針) と overview_rows[4].one_line (版なし) の食い違い → L1; JIS Q 38500 の担い手 = 経営者層 は one・detail・analogy・points[0]・pairs[1].rows[1] で一致。書き方 8 → §3 列挙 (L5)。書き方 9 → §2 表、落ち 0。§6 (比喩・フックが定義の言い換えでないこと): 27000 hook (略語の頭文字) と 31000 hook (JIS 部門記号 Q = 管理システム、JISC の部門記号どおり) は別の手がかり、38500 hook は EDM の頭字語 ✓。型 (8)(9): 比喩・フックの鍵語が他の見出し語と衝突せず、引用題の場面に当てはめても誤答を選ばない (31000 hook の Q を 2014h26a-q003 の JIS Q 9001〜27001 に当てても全て Q で判別に使われない; a2 r1 low の ISO 9000 hook は削除済み)。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 12 種 (要求事項 / 品質マネジメントシステム / 環境マネジメントシステム / 手引 / 管理策 / 情報セキュリティマネジメント / クラウドサービス / リスクアセスメント / 評価 / 指示 / モニタ / 経営者層) が jp 本文に実在 (スクリプト、全 ok)。`one_zh / one_en` の見出し語 `[[jp:]]` は 0/7 だが、7 見出し語は全て英数の規格番号で三語同表記 (`term_zh`・`term_en` も同じ) のため併記の対象外。zh 訳語 (质量管理体系 / 环境管理体系 / 信息安全管理体系 / IT治理 / 风险评估 / 控制措施 / 指南 / 指导方针) は validate B6 warn 0。loc-review r1 の low 6 件は未適用のまま (L8)。
10. **前回指摘の解消確認 (journal `type:"result"`)**: a1 r1 MEDIUM 3 件 — `terms[0].fig` (PDCA 環状 SVG) → null ✓、`terms[3].points[2]` (2018h30h-q032 題文の平叙文化) → 削除 (考点 2 件) ✓、`key_points_jp[1]` (末尾 1 の規格 = 要求事項の一般則) → 「品質・環境・情報セキュリティの各系列では」に限定 ✓。a1 r2 MEDIUM — `key_points_jp[0]` (番号が分野を表す一般則) → 系列ごとの対応 + 27000 系は ISO/IEC 共同 ✓。a2 r1 MEDIUM — `terms[5].one_jp` (リスク = 不確かさ) → 括弧の言い換え削除、定義は detail で規格どおり ✓。zh / en にも旧主張の残存なし (型 (5) 回帰なし)。a2 r2 / loc r1 は PASS (low のみ)。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | ISO 9000 | OK — exam 3 / 4 題: QMS の要求事項は ISO 9001、日本では JIS Q 9001 (2014h26a-q003 正答ア JIS Q 9001; 2011h23a-q015 正答イ 9001-品質・14001-環境; 2024r06-q011 正答イ ISO 9001 の導入) / 品質 = 備わった特性が要求を満たす程度 → 顧客満足が目安 (2010h22a-q013 正答ア 顧客満足度が高い製品; 誤答 = 自社生産・CAD/CAM・良質の材料 を支持しない) / 9001 導入で品質業務の進め方がそろい管理の質・効率が改善 (2016h28h-q016 正答エ)。detail「ISO 9000 そのものは基本の考え方と用語」は ISO 9000 (Fundamentals and vocabulary) どおり、第三者認証・PDCA も正しい | OK (図なし) | OK (loc low: one_zh「持续」付加 → L8) | L3 |
| 2 | ISO 14000 | OK — exam 1 / 2 題: 環境 MS の規格群は ISO 14000、認証の基準の要求事項は 14001 (2017h29a-q010 正答イ ISO 14000; 2011h23a-q015 正答イ)。誤答 ISO/IEC 20000・27000 を支持しない | OK | OK (loc low: analogy_en 構文 → L8) | L2 |
| 3 | ISO 26000 | OK — 引用題 0、mix 1: 9001・14001 は認証の基準の要求事項、26000 は認証を目的としない手引 — ISO 26000:2010 (Guidance on social responsibility, not intended for certification) どおり。detail の主題 5 つ + 「など」、「企業に限らずあらゆる組織」とも原典どおり | OK | OK | L5 |
| 4 | ISO/IEC 27000 | OK — exam 2 / 2 題: ISMS 要求事項の国内規格は JIS Q 27001、ISO/IEC 27001 が基 (2018h30a-q033 正答イ JIS Q 27001; 誤答 IEEE 802.3・JPEG 2000・MPEG1 を支持しない) / 27017 = 27002 (管理策の手引) を土台にクラウド事業者・利用者向けの管理策を加えた指針 (2025r07-q002 正答ウ; 誤答 14001・15001・9001 を支持しない; §1-7 で 2026 年版も同性格)。one「ISO と IEC が共同」は 2018h30a-q014・2018h30h-q032 (正答 ISMS / ISO) と矛盾しない。CIA・管理策の説明は 27000 の定義どおり。表 3 行一致 | OK (table static) | OK | L4 / L7 |
| 5 | ISO 30414 | OK (版付き) — 引用題 0、mix 1: 30414 = 人材の情報の報告、26000 = 社会的責任全般の手引 — 正しい。one「2018 年版は指針」は 2018 年版の題名 (Guidelines for internal and external human capital reporting) どおり。detail (指標の考え方、社内の経営判断 + 投資家等社外への説明) も正しい。ただし 2025 年版 (要求事項 + 推奨) への言及なし、総表 one_line は版なし | OK | OK (loc low: detail_en "return on investment" → L8) | L1 |
| 6 | JIS Q 31000 | OK — 引用題 0、考点 0。one (原則と進め方)・detail (ISO 31000 の日本語化、業種・規模を問わない指針、:2019 の定義「目的に対する不確かさの影響」、特定・分析・評価 = リスクアセスメント → 対応) は JIS Q 31000:2019 どおり。flow steps 4 の caption (起こりやすさと影響の大きさ / 基準と比べて対応の要否) も同版の分析・評価の説明と一致。「原則と進め方」は枠組みに触れないが「だけ」と閉じない (L9) | OK (flow steps 4) | OK | L9 |
| 7 | JIS Q 38500 | **M1** — 引用題 0、mix 1: EDM の主体は経営者層で IT を運用する現場ではない — 両版で正しい。one・detail (ISO/IEC 38500 の日本語化、:2015 の EDM) は版付きで正しいが、hook・pairs[1].rows[2].b・3 ノード図は版なしで EDM の 3 つだけをモデルの構成として示し、現行 JIS Q 38500:2026 (EDM + ステークホルダ対応) と食い違う。「統治機関」は JIS の訳語か未確認 (L6) | OK (flow steps 3) | OK (loc low: analogy_en 言い切り → L8) | M1 / L6 |

**単元レベル**: goals 3 点・overview_cols 2 (分野 / 規格の性格)・overview_rows 7 行・pairs 2 組 (ISO 9000 / 14000 3 行 key 1、JIS Q 31000 / 38500 4 行 key 1)・key_points 3・summary (記法除去版と一致)・challenge_questions 3 件 (2024r06-q011 / 2018h30h-q032 / 2018h30a-q033 — 本文と矛盾なし、§1-3)。pairs[1].rows[3] (元の国際規格 ISO 31000 / ISO/IEC 38500) は両 detail と一致。事実誤りなし (M1 は版の不足)、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 9 (うち 建议修 2)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `pairs[1].rows[2].b_jp/zh/en`、`terms[6](JIS Q 38500).hook_jp/zh/en` (+ 派生 `memory_hook_*`、`summary.memory_hooks_*[2]`)、`terms[6].detail_jp/zh/en` 1 文目 (+ 派生 `explanation_*`)、関連 `terms[6].fig` (flow 3 ノード) | **D-205 / 型 (10) 版なしの閉じた構成**。改訂された規格のモデルの構成を、版を付けずに「評価・指示・モニタ」の 3 つで示している。JIS Q 38500 は 2026-02-20 に改正され (JIS Q 38500:2026 ← ISO/IEC 38500:2024)、モデルは「従来の EDM にステークホルダー対応が追加」された (ITSCJ NL111、改正原案作成委員会 委員長の解説; ISO/IEC 38500:2024 目次 6.2.1 Engage stakeholders)。版付きなのは detail の「JIS Q 38500:2015 では」だけで、pairs の「示す主な内容」と hook は今の JIS Q 38500 の説明として読める。スクラム M1 と違い構成員そのものが版で変わる (S147 型 (10)、資金決済法 M1 と同じ扱い: Rule A が一次確認のうえ改正内容を補丁で足す)。図はノード追加 = 構造変更になるため本補丁では扱わず、detail と hook に版が付けば図は 2015 年版のモデルの図として読める | pairs jp: `評価・指示・モニタのモデル` → `評価・指示・モニタのモデル (2015 年版)` / zh: `评估、指导、监督的模型` → `评估、指导、监督的模型（2015 年版）` / en: `The evaluate-direct-monitor model` → `The evaluate-direct-monitor model (2015 edition)`<br>hook jp: `評価（Evaluate）・指示（Direct）・モニタ（Monitor）の頭文字をつないで EDM と覚える。` → `2015 年版のモデルは、評価（Evaluate）・指示（Direct）・モニタ（Monitor）の頭文字をつないで EDM と覚える。` / zh: `取评估（Evaluate）、指导（Direct）、监督（Monitor）的首字母，记作 EDM。` → `2015 年版的模型取评估（Evaluate）、指导（Direct）、监督（Monitor）的首字母，记作 EDM。` / en: `Take the initials of Evaluate, Direct, and Monitor and remember them as EDM.` → `For the 2015 model, take the initials of Evaluate, Direct, and Monitor and remember them as EDM.`<br>detail jp: `統治機関である経営者層が IT について評価・指示・モニタを行うモデルを示している。` → `統治機関である経営者層が IT について評価・指示・モニタを行うモデルを示している (2026 年の改正版では、このモデルにステークホルダへの対応が加わった)。` / zh: `给出了作为治理机构的经营层对 IT 进行评估、指导、监督的模型。` → `给出了作为治理机构的经营层对 IT 进行评估、指导、监督的模型（2026 年的修订版在这一模型中增加了对利益相关者的应对）。` / en: `evaluates, directs, and monitors IT. It is` → `evaluates, directs, and monitors IT (the 2026 revision adds engaging with stakeholders to this model). It is` (detail は 2 文のまま; 訳語 ステークホルダ → 利益相关者 は `zh_terms.json` どおり; 太字・`[[jp:]]` の数は前後で不変) |
| L1 | LOW **建议修** | `overview_rows[4](ISO 30414).one_line_jp/zh/en`; 任意で `terms[4].one_jp/zh/en` (+ 派生 `definition_*`) | 総表の一行が版なしで「国際的な指針」と言い切る。同じ行の extra と one は「2018 年版」と版付きで食い違いは小さいが、現行の 2025 年版は要求事項 + 推奨の規格に改められている (ISO TC 260 公式: 2025-08-24 発行、"introduces auditable requirements")。欄同士の性格の言い方の不一致 (D-205 の措辞級) | one_line jp: `人的資本の情報開示についての国際的な指針` → `人的資本の情報開示についての国際規格` / zh: `关于人力资本信息披露的国际指导方针` → `关于人力资本信息披露的国际标准` / en: `International guidelines on human capital reporting` → `International standard on human capital reporting`<br>任意 one jp: `2018 年版は**指針**として書かれている。` → `2018 年版は**指針**として書かれている (2025 年版では要求事項も含む形に改められた)。` / zh: `2018 年版以**指导方针**的形式编写。` → `2018 年版以**指导方针**的形式编写（2025 年版改为也包含要求的形式）。` / en: `the 2018 edition is written as **guidelines**.` → `the 2018 edition is written as **guidelines** (the 2025 edition was revised to include requirements as well).` |
| L2 | LOW | `terms[1].points[0].text_jp` | 2017h29a-q010 の題文を正答で埋めた形に近い (「ISO が定めた環境マネジメントシステムの…」、Dice 0.48 / ed 0.63)。重なりは「ISO が定めた」+ 見出し語の概念名で、選択肢の組・順序・誤答の打ち消しなし → D-209 免除 (分類型の正答を一般定義で述べる)。後半 (14001 = 要求事項) は one・detail の言い直し (D-203 §9)。JP review a1 r2・a2 r1 と同じ判断を独立に再確認 | 記録のみ (任意: `ISO が定めた環境マネジメントシステムの規格群は` → `環境マネジメントシステムを扱う ISO の規格群は`) |
| L3 | LOW | `terms[0].points[2].text_jp` | 2016h28h-q016 正答エ・2024r06-q011 題文と同じ因果 (品質業務の標準化 → 管理の質・効率)。正答 1 肢の一般表現で誤答の組・場面を使わない (D-209) | 記録のみ |
| L4 | LOW | `terms[3].points[1].text_jp` | 2025r07-q002 題文の 3 要素 (既存 ISMS 規格が土台 / クラウド / 指針) と同順。27017 の標準的な定義で選択肢に触れない (D-209) | 記録のみ |
| L5 | LOW | `goals_jp[1]`、`overview_rows[0..4].extra_jp[1]`、`terms[2].analogy_jp`、`terms[2].points[0].text_jp`、`terms[0..1].detail_jp`、`terms[3].fig.data.rows[0]`、`pairs[0].rows[1]`、`key_points_jp[1]` | 書き方 8 / §9: 「要求事項 = 認証の基準 / 手引・指針 = 認証を目的としない」の対比・言い直しが多欄に出る。単元の主題 (goals[1]) そのもので、総表の列「規格の性格」は D-195 §3 の構造 | 記録のみ |
| L6 | LOW | `terms[6].detail_jp`、`pairs[1].rows[1].b_jp` (三語) | governing body の JIS 訳語は「統治主体」の可能性 (JP review a2 r2 low)。JSA Webdesk 保守停止 (〜2026-11-11) で JIS 本文を確認できず。意味は通じる | 記録のみ (JSA 再開後に確認) |
| L7 | LOW | `terms[3].fig.data.rows[1..2].cells[1]` | 「管理策」が図 (detail より先に表示) で定義前に使われる (a2 r1・r2 low)。表は列見出し「規格」の 3 行で 27000 系の全員とは言わないが、detail の「など」が閉じを防ぐ | 記録のみ |
| L8 | LOW **建议修** (a_zh のみ) | `pairs[0].rows[2].a_zh`; 他 `terms[0].one_zh`「持续」、`terms[1].analogy_en` "turned into…"、`terms[4].detail_en` "return on investment"、`terms[6].analogy_en` "defines the captain's part"、`key_points_zh/en[0]` 「管理体系」の掛かり | loc-review r1 の low 6 件が未適用。a_zh は単元内の訳語揺れ (`terms[0].points[1].text_zh` と zh_terms 顧客満足 → 客户满意度 は「客户」) | a_zh: `稳定提供满足顾客需求的产品与服务` → `稳定提供满足客户需求的产品与服务`; 他 5 件は記録のみ (loc-review の任意案のとおり) |
| L9 | LOW | `terms[5].one_jp`、`overview_rows[5].extra_jp[1]` | JIS Q 31000 の構成は原則・枠組み・プロセスだが「原則と進め方」と述べ枠組みに触れない。「だけ」と閉じず、版付きの detail・図とも矛盾しない | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 要求事項 (認証) / 手引・指針: L5 の各欄 → L5 (主題)。② ISO 9000 / 14000 (品質 / 環境): `pairs[0]`、`key_points[0]`、27000 hook (略語の頭文字) → 許容。③ JIS Q 31000 / 38500 (対象・担い手・内容・元の国際規格): `pairs[1]` 4 行、`goals[2]`、`key_points[2]` (元の国際規格の 4 箇所目、a2 r1・r2 low) → 許容 (L5 の範囲で記録)。④ ISO 30414 / 26000: `terms[4].points[0]` のみ → 許容。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en`・`title_*` は v1 と同文 (未改稿)。
- O2 2017h29a-q010・2014h26a-q003・2025r07-q002 の誤答肢 ISO/IEC 20000 (IT サービスマネジメント)・JIS Q 15001 (個人情報保護) は単元の見出し語でなく本文に出ない。正答は本文で直接解けるので不足ではない (他単元の範囲)。
- O3 2018h30a-q014 の誤答エ (ナレッジマネジメントシステム) は、その後 ISO 30401:2018 (2018-11 発行) で ISO 規格になった。題 (2018 年秋期) は発行前の文言で、単元はこの規格に触れないため D-210 の対象外。題自体の注記は quiz 層の課題。

確認済みで問題なし: 限定条件 (考点 9 件全て保持、§2)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤72 字)、写し (validate 0、独立照合は概念名の偽陽性のみ)、`[[jp:]]` 原語 (12 種全て jp 本文に実在)、zh 訳語表 (B6 warn 0)、図種 (table static ×1 / flow steps ×2 / 図なし ×4 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、前回 MEDIUM 5 件の解消と回帰なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **9** (建议修 2: L1 / L8 (a_zh) / 記録のみ 7: L2〜L7、L9) |

## 5. 判定

**FAIL (補丁待ち)** (D-199: MEDIUM 1)。考点 9 件・引用 7 題 + 未引用の quiz / challenge 2 題で、考点の主張は正答と一致し、誤答肢を支持する記述・限定条件の落ち・写しは無い。不合格の理由は M1 (JIS Q 38500 のモデルを版なしで EDM の 3 つとして示し、2026 年改正版 [EDM + ステークホルダ対応] と食い違う) の 1 件で、§3 の文字列置換 (pairs[1].rows[2].b / terms[6].hook / terms[6].detail の三語) を B3 補丁で当てれば HIGH 0 / MEDIUM 0 となる見込み (補丁後の validate / parity 再実行が必要)。L1・L8 (a_zh) は同じ補丁で修正推奨、他の LOW はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-02-08-u03
✓ strategy-02-08-u03 unit: 0 issues (data/ip/textbook/units/strategy-02-08-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-02-08-u03
✓ strategy-02-08-u03 parity: 30 locations, 0 diff
EXIT=0
```

一次資料: ITSCJ ニュースレター NL111 (https://itscj.ipsj.or.jp/news/gtv55200000001ia-att/NL111_2026-1r.pdf, JIS Q 38500 改正 2026-02-20、EDM + ステークホルダー対応)、ISO/IEC 38500:2024 目次 (https://standards.iteh.ai/catalog/standards/iso/4a0ca982-9f16-4acd-8a14-0a7a72c46416/iso-iec-38500-2024)、ISO TC 260 (https://committee.iso.org/sites/tc260/home/news/content-left-area/news-and-updates/iso-30414-2025-strengthening-hum.html, ISO 30414:2025)、ISO/IEC 27017 版情報 (https://www.iso27001security.com/html/27017)。iso.org 本体は 403、JSA Webdesk は保守停止で未取得。
