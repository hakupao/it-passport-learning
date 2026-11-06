# Rule A 全数抽検 — strategy-01-01-u06 (人的資源管理と働き方)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / jp-review / localiser / tr-review) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 照合スクリプト・補丁の試し適用は scratchpad `ra0106/`)。
- **Date**: 2026-11-06 (S147 第 22 批 b22)、repo HEAD `eb783aa6` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b22-u06-a2` merge 結果、`merged.json` と同一 [cmp 一致]、sha256 先頭 `bf7f7874cc0e5607`)。
- **対象**: `data/ip/textbook/units/strategy-01-01-u06.json` (textbook-unit-v2)、用語 **8 / 8 = 全数** (HRM / MBO / CDP / リスキリング / HRテック / タレントマネジメント / リテンション / DE&I) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。topic = strategy-01-01。
- **経緯**: 2 attempt。a1 (`b22-u06-a1`、jp-rejected、Rule B = `failures/phase5/stage_07_ui/phase3/batch/strategy-01-01-u06_attempt_1.md`) → a2 (`b22-u06-a2`、a1 `jp.r1` + jp-review #2 を種、jp-review r1 REVISE [medium 1] → r1 書き直し → jp-review r2 PASS → loc r0 → loc-review r1 PASS [low 7])。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205、D-208 (失敗型の明示点検)、D-209 ((iii) の免除 2 型)、D-210。比較: `data/ip/textbook/.planning/v2/strategy-01-01-u06/v1-original.json` (用語 8 語・`term_zh`・`term_en` とも v1 と一致、`prerequisites` 一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 (比喩の像が考点の否定する内容を運ぶ = 観点 7)・D-198 (iii)・zh / en の語が誤答肢の読みに寄る (b18 u05 型) / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え; 一致断片は 12 字以内)。

## 1. 方法

1. **全文読み取り**: 8 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ (DE&I は hook 空 = 三語とも空で validate 許容)。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 9 件 = exam 4 + mix 5、qid 付き 4 件、引用 qid 延べ 5 件 = 異なり 5 題)**: `data/ip/quiz/questions.json` + `translations/<exam>.json` の `stem_jp_clean` から題文・選択肢・`correct_answer` を再読 (全題 topic `strategy-01-01`)。manifest の関連題 13 題のうち本単元の用語を扱う 6 題 (2011h23a-q001 / 2015h27h-q003 / 2015h27a-q021 / 2017h29h-q025 / 2018h30h-q007 / 2021r03-q026) を全て読んだ。残り 7 題 (CSR / 組織形態 / 経営理念 等) は v1 の challenge に入っていた別単元の題で、v2 の challenge は本単元の 5 題に差し替わった (改善、指摘ではない)。題 bank 全体を `MBO|目標による管理|CDP|リスキリング|リカレント|タレントマネジメント|リテンション|HRM|DE&I|エクイティ|インクルージョン|ダイバーシティ|HRTech|HRテック` で grep → 本単元の用語を正答とする題は上記 5 題 + HRM を正答とする 2019h31h-q022 (支援活動に使う情報システム、strategy-03-12) のみ。MBO はどの題でも目標管理の意味で正答にならず (2012h24a-q018 / 2013h25h-q006 は買収の意味で正答、他は誤答肢)、タレントマネジメントは 2022r04-q004 / 2018h30a-q014 の誤答肢、HRM は 2014h26a-q007 / 2015h27h-q028 / 2017h29h-q006 / 2019h31h-q014 の誤答肢としてのみ出る → HRM / MBO / リスキリング / タレントマネジメント / リテンション の `quiz = []` は妥当。
3. **quiz / challenge_questions** (quiz 計 5 枠 = CDP 2 + HRテック 1 + DE&I 2、challenge 5 題 = 同じ 5 題): 全て考点 qid と一致し本文と矛盾しない (§2)。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合: 単元の JP 文字列 128 本 (派生除く、図ラベル・caption・表セル・総表 `overview_rows` / `overview_cols`・対比表を含む) を topic 内全 62 題の題文 (`stem_jp_clean` と raw 両方) + 選択肢と 12 字連続照合 (句読点・記号・空白・長音除去、NFKC) を **カタカナ 4 字以上 + 英数遮蔽あり / 遮蔽なし** の 2 通りで実施 → **遮蔽あり 0 件 / 遮蔽なし 2 件、2 件とも偽陽性** (`terms[7].detail_jp` と `terms[7].points[1].text_jp` ↔ 2017h29h-q025 正答イ: 一致部は見出し語「ダイバーシティマネジメント」そのもの [12 字] で表現ではない)。
   - **近似一致 (1〜2 字差し替え)**: 文単位 (題の各文 14 字以上 × 単元各文の長さ ±3 の窓) の最近接は ed 0.61 / Dice 0.32 (見出し語どうしのカタカナ語の偶然の重なり)。題文が 1 文の長い定義題が多いため、**節単位** (読点で区切った節の連なり 10 字以上 × 単元文の窓 ±4) でも引用 5 題 × 関連欄 14 組を照合:
     - **最近接 = `terms[4](HRテック).one_jp` ↔ 2021r03-q026 題文 (節 ed 0.47 / Dice 0.44、全文 Dice 0.26)**。対応: 題が挙げる人事業務の例 2 つ (評価・採用) が、単元では順を入れ替えて 4 つ (採用・評価・配置・育成) に広げた列挙の中に出る / 題の「人事関連業務」→「人事業務」/ 題の IT の例 (AI と IoT) → 「AI やクラウドなど」(IoT をクラウドに替える) / 「〜業務に IT を活用する手法」の枠は同じ。判定: 2021r03-q026 は「この手法を表す用語はどれか」の分類題で、one_jp はその見出し語の一般的な定義 (HR + Technology の造語、AI・クラウド等で人事業務を支える — 標準的な辞書定義の形) を述べたもの = D-209 の免除型。題に固有の要素 (IoT・人事機能の向上・働き方改革という目的) は one_jp に無く、列挙は順も数も変わり、12 字一致 0。較正の HIGH 例 (ed 0.14 / Dice 0.52) からも遠い → **写しではない、L7 (記録のみ)**。同じ枠は `overview_rows[4].one_line_jp` にもある (節 ed 0.70 / Dice 0.42、より遠い)。
     - `terms[7].points[1]` ↔ 2017h29h-q025 題文 (ed 0.57 / Dice 0.40)、`terms[7].detail_jp` ↔ 同 (ed 0.60 / Dice 0.33)、`terms[7].points[0]` ↔ 2018h30h-q007 題文 (ed 0.74 / Dice 0.17)、`terms[2].points[0]` ↔ 2015h27h-q003 題文 (ed 0.71 / Dice 0.21)、`terms[2].points[0]` / `one_jp` ↔ 2011h23a-q001 ア・イ (ed 0.73〜0.86) — いずれも閾値外。判定は §4。
   - **カタカナの多い文の目視**: HRテック (one / detail / 考点 / hook) × 2021r03-q026 全選択肢、DE&I (one / detail / 考点 3 / 表 / analogy) × 2018h30h-q007・2017h29h-q025 の題文と全選択肢、タレントマネジメント (one / detail / 図 caption 3) × 2022r04-q004・2018h30a-q014、リテンション / リスキリング (one / detail / 考点) × topic 全題 → 写し 0。遮蔽なしの 2 件は見出し語のみ (遮蔽ありは 0)。
5. **D-208 失敗型の明示点検 (§4)**: validate は **`warn choice-echo` 行 0 件** (出力は ✓ 行のみ)。warn が見えない題文側の要素 (定義題の題文の例の列挙・目的の列挙) は 2018h30h-q007・2017h29h-q025・2021r03-q026・2015h27h-q003 にあり、各題で 1 件ずつ判定。穴埋め題・判断項目 (a・b・c) 型の題は引用題に無い。
6. **D-195**: 結論先行 (one = 1 文 × 8、太字あり)、展開 2〜3 文 (2/2/3/2/2/2/2/2 文)、比喩・フック (§6: フック 7 = 語源・略語展開 [HR / Objectives / Program / re+skill / 分野名+Tech / talent / retain]、比喩 8、いずれも定義の言い換えではない [CDP hook 2 文目のみ one の言い直し寄り = jp-review r2 LOW、記録のみ]; DE&I は hook なし)、定義前使用 (マネジメントバイアウト = MBO 考点内で定義、リカレント教育 = リスキリング考点内で定義、OJT / Off-JT = CDP detail で定義 [前単元 u05 の見出し語]、ダイバーシティマネジメント = DE&I detail で定義、イクオリティ = エクイティ考点内で定義; HRM 考点と木図で後続の用語名が先に出るのは総表の一句話で補われる = jp-review a2 r1 LOW、記録のみ)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → `freq_badge`「頻出」、**「重要」4 件 = `terms[5].detail_jp`「重要なポスト」+ 派生 `explanation_jp` + zh「重要岗位」×2** (通常の語義、締め句ではない)、**「と覚える」3 hook × 3 欄 = 9 件** [HRM / CDP / タレントマネジメント の `hook_jp` + 派生 `memory_hook_jp` + `summary.memory_hooks_jp`] のみ。7 フック中 3 件の結びで、前例 technology-23-63-u06 (6 中 4 = L2 記録) より少ないため記録のみの扱い (§3 に指摘は立てない)。zh / en の grep [exam = `kind:"exam"` 6 件] は偽陽性)、図の型 (HRM = tree static、MBO = flow steps 4、CDP = flow steps 3、タレントマネジメント = flow steps 3、DE&I = table static、リスキリング / HRテック / リテンション = 図なし; 全て登録内。a1 の「手順図が static」LOW は a2 で steps に改善)、pair 配置 (MBO→CDP は CDP の後、タレントマネジメント→リテンション はリテンションの後、各組 key 行 1)。
7. **D-200**: 考点数 1/1/2/1/1/0/0/3 (≤3 ✓; タレントマネジメント・リテンションは考点 0 — D-195 §1 / D-200 / manifest `rules` とも考点は上限のみで下限なし、validate も `points` が配列であることだけを求め 0 件許容。両語とも bank に正答題が無く exam 考点を立てる根拠題が無い)、各 JP 文数 1〜2・字数 39〜86 (≤100 ✓、最大は CDP `points[0]` の 86 字)。**framing 件数** (`validateV2.ts` の `pointFraming` を直接呼び出し、全考点): jp 0 / zh 0 / en 0 (上限 2)。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (「〜に限らず」「〜だけでなく」「〜ではなく」の照合: HRテック考点「事務の手間を減らすことに限らず」と detail「事務の手間を減らすことに加え」と overview「効率化と高度化」一致、analogy は効率側のみ → L5; リスキリング one「新しい職務に就くとき / 今の職務で求められるスキルが大きく変わるとき」と overview `one_line_jp`「職務の変化に合わせて」・`extra_jp[1]`「職務や役割が変わるとき」・mix 考点「職務の変化に合わせて」・key_points[2] 一致; DE&I key_points[4]「受け入れるだけでなく」と detail「集めるだけでは力を発揮しにくい」一致) → 不整合 0。書き方 8 (対比の出現欄) → §3 末尾に列挙。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → L4 (HRM analogy の行為主体)。§9 言い直し → L6。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・caption・表セル・総表・対比表の三語一致 (parity 35 箇所 0 diff)、`[[jp:…]]` 原語 10 種 (タレントマネジメント / マネジメントバイアウト / リスキリング / リカレント教育 / HRテック / リテンション / ダイバーシティ / エクイティ / インクルージョン / ダイバーシティマネジメント) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` = 片仮名 5 用語 (リスキリング / HRテック / タレントマネジメント / リテンション / DE&I の 3 要素) はあり (HRM / MBO / CDP は英字見出しで原語 = 表記同一)、zh 訳語が `zh_terms.json` (unit 抽出 `zh_terms.unit.json`) に従うこと (validate の B6 warn 0 / jp-origin warn 0; HRM(人力资源管理) / MBO(目标管理) [u06 専用の訳、strategy-03-09-u04 は管理层收购] / CDP(职业发展计划) / 再技能化(reskilling) / HR 科技(HR Tech) / 人才管理(talent management) / 人才保留(retention) / DE&I(多样性、公平性与包容) / OJT（在岗培训） / Off-JT（脱产培训） / FinTech（金融科技） 一致)。MBO 考点の zh は買収の意味の MBO を「**MBO**」とだけ太字にし (目标管理) を付けない — 文意どおりで正しい。tr-review (loc-review r1) の LOW 7 件の反映状況を確認 → 7 件とも未反映 (PASS 判定のため B3 に回っていない)。うち意味に関わる 2 件を L1・L2、表記・語気の 2 件を L3・L8 (建议修) として再掲、残り 3 件は L9 (記録のみ)。
10. **前回審査の HIGH / MEDIUM 解消 (§5)**: a1 jp-review #1 MEDIUM 1 件 + #2 MEDIUM 3 件、a2 jp-review r1 MEDIUM 1 件 = 計 5 件 (うち #1 / #2 の `terms[7].points[0]` は同一欄の 2 観点) を現行 JSON で 1 件ずつ確認 → 全件解消、zh / en も追随、退行なし。
11. **D-205 / D-210**: 改訂される文書 (規格・法・ガイドライン・知識体系) の構成要素の数・名称は本単元に無い (DE&I の「3 つ」は語の構成で文書の版に依存しない)。改正前の文言で書かれた引用題も無い (法・規格の題なし) → N/A。
12. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§8 に出力全文)。

## 2. 用語別判定 (8 / 8)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | HRM | OK — mix 1 (qid なし): HRM は人に関する管理全体の広い枠組みで、MBO・タレントマネジメントはその中の個別手法 — 標準的な上位・下位関係で正しい。one (採用から配置・育成・評価・処遇・定着までを一貫して管理、人を経営資源とみなす) は 2019h31h-q022 (HRM = 支援活動の情報システム、正答ウ) と矛盾しない。tree static (評価 / 育成 / 活用・定着 / 支える技術と方針 の 4 枝に単元の 7 用語) は detail 2 文目と一致 | OK | OK (zh「活用」L9) | L4, L6 |
| 2 | MBO | OK — mix 1 (qid なし): 略語 MBO はマネジメントバイアウト (経営陣が自社株式を買い取り経営権を得る) も指すので文脈で見分ける — 正しい (別 topic の 2012h24a-q018 正答イ・2013h25h-q006 正答ウ と一致; §3 範囲外 O1)。one (上司と話し合って期間の目標を自ら設定し達成度で評価) と hook (ドラッカーが提唱 — 1954 年『現代の経営』で正しい) は標準。flow steps 4 (目標設定 → 本人が進める → 期末に振り返る → 評価・処遇と次の目標へ) は one・detail と一致。quiz は a1 の 2015h27a-q021 (CSR の題、MBO は買収の意味の誤答肢) を外して `[]` | OK | en「pay」L1 | L1, L6 |
| 3 | CDP | OK — exam 1 / 2 題: OJT = 実際の仕事を受け持って進めること自体を通じて技能・知識を身につける訓練方法、CDP = 長期の目標に合わせてそうした訓練や研修を計画的に組み合わせる仕組み (2015h27h-q003 正答エ OJT、誤答ア CDP / イ eラーニング / ウ Off-JT; 2011h23a-q001 正答ア = 参画プロジェクトで業務の一部を担当)。限定条件: q003 の(いま担当する業務を実践しながら、という条件)は「実際の仕事を受け持って進めること自体を通じて」で保持、a2 r1 で指摘された指導者 (上司・先輩) の限定は考点・detail とも除去済み → q001 の正答ア (指導者の出てこない担当業務) を外させない / mix 1: MBO = 一つの評価期間、CDP = 数年先 — pairs[0].rows[0] と一致。one (配置転換や研修を計画的に組み合わせる)、detail (面談で希望と人材像をすり合わせ数年単位の計画、OJT / Off-JT は計画の中の手段、成長・事業の変化に合わせて見直す) は標準。flow steps 3 一致 | OK (考点 × q003 / q001 は §4 で判定) | zh「的」欠落 L8、detail_zh の括弧 L9 | L8, L9 |
| 4 | リスキリング | OK — mix 1 (qid なし): リカレント教育 = 社会に出た後に仕事と学びの期間を交互に繰り返す考え方 / リスキリング = 職務の変化に合わせて必要な技能を身につける (両側とも正の定義、D-209 の取り違えやすい組)。one は a1 #2 の MEDIUM どおり「新しい職務に就くとき」と「今の職務で求められるスキルが大きく変わるとき」の両方を含む範囲 (経済産業省の資料の定義の形と一致)。detail (デジタル化で仕事の中身が変わる場面、企業が機会と時間を用意して進めることが多い、対象はこれまで使ってこなかった知識・技能) は one と整合。analogy (紙の地図職人がデジタル地図の編集を学び新しい部署へ) は「新しい職務」側の一例で、もう一方を否定しない | OK | OK | L6 (hook の「入れ替える」は §3 L6 に注記) |
| 5 | HRテック | OK — exam 1 / 1 題: 目的は事務の手間を減らすことに限らず、人事部門の働きそのものを高めることも含む (2021r03-q026 正答ウ HRTech; 題の挙げる目的「人事機能の向上」を含む形で述べ、「〜などを目的として」の開いた列挙を「含む」で開いたまま保持 → 限定条件落ちなし。「人事部門の働き」は題の「人事機能」の主体を部門に寄せた言い方 = jp-review r2 LOW、正答と矛盾せず記録のみ)。one (HR + Technology の造語、採用・評価・配置・育成などの人事業務に AI やクラウドなどの IT を活用する手法やサービス) は標準定義 (§1-4 で近似一致を判定 → L7)。detail (AI が応募書類の振り分けを手伝う、クラウドで勤怠・評価を一元管理、蓄積データを配置・育成に生かす) 正しい。hook (分野名 + Tech: FinTech / EdTech / HR Tech) は正しい造語の型 | OK | OK | L5, L7 |
| 6 | タレントマネジメント | OK — 考点なし (bank に正答題 0; 2022r04-q004 [正答 アダプティブラーニング] と 2018h30a-q014 [正答 ISMS] の誤答肢として出るのみ。one・detail はどちらの題の正答とも衝突しない: 学習内容の個別最適化や ISO 規格化を主張しない)。one (スキル・経験・適性などの人材情報を集めて一元管理し、戦略的な配置や育成に生かす) と detail (誰がどの能力を持つかの見える化、新事業・重要ポストの人材を社内から探す、HRテックが使われることが多い) は標準。flow steps 3 (収集 → 一元管理・見える化 → 配置・登用・育成の判断) 一致。hook (talent = 才能、頭数でなく才能の単位で管理) 正しい | OK | zh「适应性」L2 | L2, L6 |
| 7 | リテンション | OK — 考点なし (bank に題 0)。one (必要な人材が辞めずに働き続けるよう定着を促す施策の総称)、detail (評価・報酬の見直し、柔軟な勤務制度、成長の機会や相談の場; 経験者が抜けると採用・育成の費用と時間が失われる)、analogy (穴の開いたバケツはまず穴をふさぐ)、hook (retain = 保つ・引き留める、データの retention period と同じ語) いずれも正しい。pairs[1] (タレントマネジメント / リテンション: 狙い key・手段・働く場面) は両用語の one・detail と一致 | OK | en「pay」L1 (pairs[1].rows[1].b_en) | L1 |
| 8 | DE&I | OK — exam 2 / 2 題 + mix 1: ダイバーシティ = 属性や経歴、価値観などが人によって異なる状態を指す語 (2018h30h-q007 正答イ ダイバーシティ; 誤答 グラスシーリング / ホワイトカラーエグゼンプション / ワークライフバランス を支持しない。題の「〜など」の開いた例示は「〜など」で保持) / ダイバーシティマネジメント = 人材の違いを受け入れて経営に生かし組織の力を高めるマネジメント手法 (2017h29h-q025 正答イ; 誤答 CRM / ナレッジ / バリューチェーン を支持しない) / mix: エクイティ (公平性) は全員に同じものを配る平等 (イクオリティ) とは別で、人ごとの事情に合わせて支え方を変える — 標準の区別で正しい。a1 で問題になった「取組みや方針の名前ではない」という否定の後半は削除済み (§5)。detail (ダイバーシティマネジメントに公平性と包摂を加えて広げた考え方; 集めるだけでは力を発揮しにくいので機会の条件をそろえ受け入れ側の仕組みを整える) と analogy (必要な高さの踏み台を配り [エクイティ]、同じ応援席に迎え入れる [インクルージョン]) は表 3 行と一致 | OK (考点 × q007 / q025 は §4 で判定) | en detail の言い切り L3 | L3, L6 |

**単元レベル**: goals 3 点 (HRM の枠内の区別 / タレントマネジメントとリテンションの狙い / DE&I の 3 要素)・overview_cols 2 (分類 / 主に扱う場面)・overview_rows 8 行・pairs 2 組 (MBO / CDP 3 行 key 1、タレントマネジメント / リテンション 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge_questions 5 件 (2021r03-q026 / 2017h29h-q025 / 2018h30h-q007 / 2015h27h-q003 / 2011h23a-q001 — 全て本単元の考点 qid で本文と矛盾なし)。key_points[3] (HRテックで人事情報を IT で扱えるとタレントマネジメントを進めやすい) はタレントマネジメント detail 2 文目と一致。事実誤りなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建议修 4: L1・L2・L3・L8)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 (B3: 1 欄内の文字列置換) |
|---|---|---|---|---|
| L1 | LOW **建议修** | `terms[1](MBO).fig.data.nodes[3].label.en`、`terms[1].fig.steps[3].caption_en`、`pairs[0].rows[1].a_en`、`pairs[1].rows[1].b_en` | jp「処遇」(昇進・配置を含む待遇全般) を en で "pay" と訳し範囲が狭まる。同単元の `terms[0].one_en` は同じ「処遇」を "compensation" と訳しており訳語も不統一 (tr-review r1 LOW、未修)。`terms[6].detail_en` の "pay" は jp「報酬」の訳で正しいので触らない | nodes[3].label.en "Reflect results in evaluation, **pay**, and the next objectives" → "Reflect results in evaluation, **compensation**, and the next objectives" / steps[3].caption_en "The degree of achievement feeds into evaluation and **pay**, and the review informs the objectives for the next period." → "…feeds into evaluation and **compensation**, and the review informs…" / pairs[0].rows[1].a_en "Reaching objectives, and the evaluation and **pay** based on them" → "Reaching objectives, and the evaluation and **compensation** based on them" / pairs[1].rows[1].b_en "Revising **pay**, work arrangements, and growth opportunities" → "Revising **compensation**, work arrangements, and growth opportunities" |
| L2 | LOW **建议修** | `terms[5](タレントマネジメント).one_zh` (+ 派生 `definition_zh`) | jp「適性」(向き不向き = aptitude) を「适应性」(環境に慣れる力 = adaptability) と訳し意味がずれる (tr-review r1 LOW、未修)。見出し語の一句話の中で、en "aptitudes" とも食い違う。「适应性」は bank の 2022r04-q004 (タレントマネジメントが誤答肢、正答アダプティブラーニング = 自适应学习) の正答語に語形が近いが、本単元の引用題ではないため (6) 型の MEDIUM には当たらない | 「每位员工的技能、经验、**适应性**等 **人才信息**」→「每位员工的技能、经验、**资质**等 **人才信息**」 |
| L3 | LOW **建议修** | `terms[7](DE&I).detail_en` (+ 派生 `explanation_en`) | jp「力を発揮しにくい」(しにくい = 傾向) を "does not let them perform well" と言い切り程度が強まる (tr-review r1 LOW、未修; u05 L2 と同型)。zh「难以发挥力量」は jp どおり | "Because simply gathering diverse people **does not let them perform well**, it stresses…" → "Because simply gathering diverse people **makes it hard for them to perform well**, it stresses…" |
| L4 | LOW | `terms[0](HRM).analogy_jp/zh/en` | 比喩の「編成部門」が「試合での起用」まで受け持つ像だが、実際のスポーツチームで試合ごとの起用を決めるのは監督で、同単元のタレントマネジメントの比喩も布陣を組むのを「監督」としている。比喩どうしの役割の割り振りが少しずれる (事実の誤学習には至らない、§6 の範囲) | 記録のみ (任意: jp「…試合での起用、契約の更新までを一つの方針で考える…」→「…起用の方針、契約の更新までを一つの方針で考える…」/ zh「比赛中的起用」→「起用方针」/ en "choosing who plays in each game" → "setting how players are used") |
| L5 | LOW | `terms[4](HRテック).analogy_jp/zh/en` | 出欠アプリの比喩が伝えるのは事務の効率化だけで、考点の「事務の手間を減らすことに限らず」の「限らない」側を運ばない (jp-review a2 r2 LOW)。考点が否定するのは「目的が事務の削減だけ」という限定で、比喩は削減が目的の一部であることを示すだけ = 否定された内容そのものは運ばない → MEDIUM (観点 7) には当たらない | 記録のみ |
| L6 | LOW | `terms[0].points[0]` / `detail_jp` 2 文目 / `key_points_jp[0]`、`terms[1].detail_jp` 2 文目 × `fig.steps[0]`・`[3]`、`terms[2].detail_jp` × `fig.steps[0..2]`、`terms[5].detail_jp` 1 文目 × `fig.steps[1]`、`terms[7].points[0]` × `fig.data.rows[0]`、`terms[7].points[1]` × `detail_jp` 1 文目、`terms[2].hook_jp` 2 文目 × `one_jp` (三語) | D-203 §9 の同義の言い直し (jp-review a1 #2 / a2 r1 / a2 r2 の LOW 各件、未修)。いずれも事実の誤りを生まない。リスキリング hook の「道具箱の中身を入れ替える」は「新たに身につける」より置き換えの含みがやや強いが、像の範囲で one と矛盾しない | 記録のみ |
| L7 | LOW | `terms[4](HRテック).one_jp` (三語)、`overview_rows[4].one_line_jp` | 2021r03-q026 題文との節単位近似一致が単元内で最も近い (ed 0.47 / Dice 0.44、§1-4)。題の業務例 2 つを順を替えて 4 つの列挙に含め、IT の例 1 つを替え、「〜業務に IT を活用する手法」の枠を共有する。分類題の見出し語の一般定義 (D-209 免除) で、題に固有の要素 (IoT・目的 2 つ) を含まず 12 字一致 0 → 写しではない | 記録のみ |
| L8 | LOW **建议修** | `terms[2](CDP).one_zh` (+ 派生 `definition_zh`) | 「按照每位员工 **长期职业** 目标」に「的」が無く文法が崩れ、太字の切れ目も不自然 (tr-review r1 LOW、未修) | 「按照每位员工 **长期职业** 目标」→「按照每位员工的 **长期职业** 目标」 |
| L9 | LOW | `overview_rows[4].extra_zh[1]`「高度化」、`overview_rows[4].one_line_zh` / `extra_zh[0]` / `overview_rows[5].extra_zh[0]` / `terms[4].one_zh` / `terms[0].fig.data.root.children[2].label.zh` の「活用」、`terms[2].detail_zh` の「(**Off-JT（脱产培训）**)」 | 日本語の直訳調 (高度化・活用の多用) と、半角・全角の二重括弧 (tr-review r1 LOW 3 件、未修)。いずれも事実に影響なし | 記録のみ (任意: 「效率化与高度化」→「效率与水平的提升」/「活用」→「运用」/「(**Off-JT（脱产培训）**)」→「**Off-JT（脱产培训）**」) |

**対比の出現欄 (書き方 8 の列挙)**: ① MBO = 一つの評価期間 / CDP = 数年単位: `pairs[0].rows[0]` (key) + `terms[2].points[1]` (mix) の 2 箇所、overview の extra は総表の構造、goals[0] は予告 → 許容。② OJT = 業務を通じて身につける / CDP = 計画的に組み合わせる仕組み: `terms[2].points[0]` + `terms[2].detail_jp` 2 文目 (計画の中の手段という位置づけで、対比の言い直しではなく包含関係) → 許容。③ タレントマネジメント = 活用 / リテンション = 定着: `pairs[1].rows[0]` (key) のみ (goals[1] は予告、各 one は自分の側だけ) → 許容。④ リカレント教育 / リスキリング: `terms[3].points[0]` のみ → 許容。⑤ エクイティ / イクオリティ: `terms[7].points[2]` のみ (analogy の「同じ高さではなく必要な高さ」は像の手がかりで D-195 §6 の対比の手がかりとして数えない、表 row[1] は自分の側だけ) → 許容。⑥ ダイバーシティ (状態) / ダイバーシティマネジメント (手法): `terms[7].points[0]`・`points[1]` が各々正の定義を並べるだけで、否定の対比文は無い (a1 の否定の後半は削除済み) → 許容。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `terms[1].points[0].text_jp` (MBO = マネジメントバイアウト の説明) は別 topic (strategy-03-09) の 2012h24a-q018 正答イ (節 ed 0.50 / Dice 0.48) と 2013h25h-q006 正答ウ (ed 0.45 / Dice 0.50、短い節) に近い。考点に qid は無く、引用題でも同 topic でもない。内容は MBO (買収) の辞書的な定義そのもの (経営陣・自社株式・経営権) で、題の固有語 (株式の「大半」・事業再編の文脈) は使っていない → 写しではない。
- O2 `unit_summary_jp/zh/en` は v1 と同文 (未改稿、validate の D-197 対象外)。v1 challenge の別単元 5 題 (CSR / 組織形態 等) は v2 で本単元の 5 題に差し替わった (改善)。
- O3 独立 copy 照合の遮蔽なし 2 ヒットは見出し語「ダイバーシティマネジメント」そのものの偽陽性 (§1-4)。

確認済みで問題なし: 限定条件 (qid 付き考点 4 件全て保持、§2)、§9 禁止句 grep (定型締め句 0; 「重要」4 = 「重要なポスト」系、「と覚える」3 hook)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤86 字、1 用語 ≤3)、図の文字列の写し (validate 0、独立照合は偽陽性のみ)、`[[jp:]]` 原語 (10 種全て jp 本文に実在)、one_zh / one_en の見出し語併記、zh 訳語表 (B6 warn 0)、図種 (tree static ×1 / flow steps ×3 / table static ×1 / 図なし ×3 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en`・`prerequisites` の v1 不変量。

## 4. D-208 失敗型の明示点検

| 型 | 判定 | 根拠 |
|---|---|---|
| (1) D-198 (iii) 選択肢・判断項目・題文の列挙のなぞり | **該当なし** (境界 L7 は記録のみ) | validate の `warn choice-echo` 0 行。各題で確認: **2015h27h-q003** (CDP exam 考点) — 4 肢 (CDP / eラーニング / Off-JT / OJT) のうち正答 OJT と誤答 CDP の 2 つを、どちらも正の定義で並べる (D-209 の取り違えやすい組の免除)。eラーニング・Off-JT には触れず、選択肢の組・順を再現せず、CDP を打ち消す文でもない。OJT 側は題文 (担当業務の実践を通じて技術・知識を習得させる手法) と要素の順が同じだが、これは OJT の標準定義の唯一の自然な語順で、題の固有語 (「現在」「遂行に必要な」「教育訓練の手法」) は使わず、節 ed 0.71 / Dice 0.21 → 分類題の見出し語の一般定義 (D-209 免除)。**2011h23a-q001** — 正答アの場面 (参画プロジェクトでモデル化の一部を担当) も、誤答イの場面 (数年後のキャリアを描き必要スキルの習得計画を自主的に策定 — CDP に近い肢) も再現しない。CDP 側は「長期の目標に合わせて…計画的に組み合わせる仕組み」と会社の仕組みとして正の定義で述べ、イの「自主的に策定」の像を打ち消す形も取らない (ed 0.73〜0.86)。**2021r03-q026** — HRテック one は §1-4 / L7 (分類題の見出し語の一般定義、固有要素なし)。exam 考点は題の目的 2 つ (人事機能の向上・働き方改革) のうち 1 つだけを言い換えて含め、a1 で LOW だった 2 項目同順の言い直しは解消 (ed 0.73 / Dice 0.13)。hook の FinTech は誤答肢イと同じ語だが、「分野名 + Tech」の造語の型を金融・教育・人事の 3 例で正の意味で並べたもので、誤答肢の打ち消しでも選択肢の組 (e-ラーニング / FinTech / HRTech / コンピテンシ) の再現でもない (jp-review a2 r2 と同判定)。**2018h30h-q007** — 考点「属性や経歴、価値観など」は題の例 4 つ (性別・年齢・国籍・経験) を同義語で同順に置き換えたもの (a1 の MEDIUM) ではなく、一般的な分類語 2 つ + 題に無い「価値観」。文の枠 (〜などが人によって異なる状態を指す語) は多様性の辞書的定義の形で、題の「個人ごとに」「示す言葉」とは語が異なる (ed 0.74 / Dice 0.17) → 分類題の見出し語の一般定義 (D-209 免除)。**2017h29h-q025** — 考点は題の「能力・経験・価値観」を「人材の違い」、(組織の活性化と価値を生む力の向上という 2 つの狙い)を「組織の力を高める」に一般化し、a1 で LOW だった「異なる経験や価値観」「活性化と新しい価値の創出」の組と順は除去済み (ed 0.57 / Dice 0.40)。ダイバーシティマネジメントの標準定義 (D-209 免除)、誤答肢 3 つは扱わない |
| (2) 引用題の限定語 (「など」等) の落ち | なし | q007 の「〜など」→ 考点「〜など」保持。q026 の「〜などを目的として」→ 考点「〜も含む」(開いたまま)、one「〜など」保持。q003 の(いま担当する業務を実践しながら、という条件)→「実際の仕事を受け持って進めること自体を通じて」保持。q025 の「受け入れることによって」→「受け入れて経営に生かし」保持 |
| (3) シラバス上の別名を別物として教える | なし | MBO = 目標による管理 (目標管理) を同一物、マネジメントバイアウトの MBO は別概念として明示 (同名異義で、別名ではない)。HRテック = HR Tech = HRTech、DE&I の 3 要素とダイバーシティマネジメントは別概念として正しく関係づける (detail「加えて広げた考え方」) |
| (4) 比喩・図の範囲が one / detail と矛盾 (D-204) | なし (L4・L5 記録のみ) | 比喩 8 つのうち HRテック (効率側のみ = L5) と HRM (起用の主体 = L4) は境界だが、考点・detail の否定する内容を運ばない。リスキリングの analogy は one の 2 場合のうち一方の例で否定しない。図 5 つ (tree / flow ×3 / table) は one・detail と一致 |
| (5) 前回修正の zh / en での退行 | なし | §5 の 5 件全てで zh / en を目視、jp の修正に追随 (parity 0 diff) |
| (6) zh / en の語が引用題・quiz の誤答肢の読みに寄る | なし (L2 は意味ずれの LOW) | CDP 考点 zh「通过承担并推进实际工作本身」/ en "through taking on and doing actual work" は q003 の誤答 (eラーニング / Off-JT) に寄らない。HRテック hook_zh の「FinTech（金融科技）」は金融分野の造語と明示。DE&I 考点の zh「多样性」/ en "Diversity" は q007 の誤答 (ワークライフバランス 等) に寄らない。タレントマネジメント one_zh「适应性」は本単元の引用題の誤答肢ではなく L2 |
| (7) D-210 改正前の文言の題 | N/A | 法・規格の題なし |

## 5. 前回審査の HIGH / MEDIUM の解消確認 (退行点検)

| # | 出典 | 指摘 (要約) | 現行 (a2 merge) | zh / en | 判定 |
|---|---|---|---|---|---|
| 1 | a1 jp-review #1 MEDIUM `terms[7].points[0].text_jp` | 2018h30h-q007 の例 4 つを同義語置換・同順で並べる (年代・出身国 …) | 「属性や経歴、価値観などが人によって異なる状態を指す語」— 一般分類語 + 題に無い価値観、図 row[0] と同じ言い方 | zh「属性、经历、价值观等」/ en "attributes, background, values, and so on" 追随 | **解消** |
| 2 | a1 jp-review #2 MEDIUM `terms[7].points[0].text_jp` | 後半「違いを生かす取組みや方針の名前ではない」は題の支持しない否定の規則 | 否定の後半を削除し正の定義 1 文だけ。手法の名前は points[1] と detail が正の形で担う | zh / en とも否定文なし | **解消** |
| 3 | a1 jp-review #2 MEDIUM `terms[3].one_jp` (+ overview_rows[3]、detail、hook) | リスキリングを「新しい職務に就くため」に限定、欄同士の範囲ずれ | one = 新しい職務に就くとき + 今の職務のスキルが大きく変わるとき。detail の「重心」の文と hook の「研ぐより新しい道具」は消え、detail 2 文目は「これまでの業務では使ってこなかった知識や技能」(範囲と整合)。overview `one_line_jp`「職務の変化に合わせて」、`extra_jp[1]`「職務や役割が変わるとき」(列見出し「主に扱う場面」の下で、職務の中身が変わる場合も読めるため狭い範囲の残りではない)、key_points[2]・mix 考点も同じ広い範囲 | zh「就任新职务时，或现有职务要求的技能发生很大变化时」/ en "when taking on a new job, or when the skills your current job requires change significantly" 追随 | **解消** |
| 4 | a1 jp-review #2 MEDIUM `terms[1].quiz` | MBO の quiz 2015h27a-q021 は CSR の題 (MBO は買収の意味の誤答肢) | `terms[1].quiz = []`・`inline_quiz = []`、challenge にも q021 なし (MBO を目標管理の意味で正答とする題は bank に 0) | — | **解消** |
| 5 | a2 jp-review r1 MEDIUM `terms[2].points[0].text_jp` (+ detail) | OJT を「上司や先輩の指導で」と主体限定、q001 正答ア (指導者なし) を外させる | 考点「実際の仕事を受け持って進めること自体を通じて技能や知識を身につける訓練方法」、detail「実際の仕事を進めること自体を通じて技能を身につける OJT」— 指導者の限定は両欄から除去。CDP 側の説明は維持 | zh「通过承担并推进实际工作本身」「通过推进实际工作本身」/ en "through taking on and doing actual work" "through doing the actual work" 追随 | **解消** |

a1 / a2 の LOW (MBO quiz 以外) で現行に残るもの: 図の static → steps (解消)、HRテック考点の 2 項目同順 (1 項目に減り解消)、ダイバーシティマネジメント考点の要素順 (一般化で解消)、§9 言い直し各件 (L6 に集約、未修)。

## 6. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建议修 4: L1・L2・L3・L8 / 記録のみ 5: L4〜L7・L9、うち L4・L9 は任意の修正案あり) |

## 7. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 8 用語・考点 9 件 (qid 付き 4 件、引用 5 題)・quiz / challenge の全 5 題で、考点の主張は正答と一致し、誤答肢を支持する記述・限定条件の落ち・D-198 写し ((i)(ii)(iii)) は無い。a1 / a2 の MEDIUM 5 件は全て解消し、zh / en にも退行なし。最も近い境界 (HRテック one × 2021r03-q026、節 ed 0.47 / Dice 0.44) は分類題の見出し語の一般定義で写しではない (L7)。LOW 建议修 4 件 (L1・L2・L3・L8、いずれも tr-review r1 の未修 LOW の再掲で、1 欄内の文字列置換) は補丁 (B3) で修正推奨、残り 5 件はバッチ証拠の「未修 LOW」表へ。

## 8. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-01-u06
✓ strategy-01-01-u06 unit: 0 issues (data/ip/textbook/units/strategy-01-01-u06.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-01-u06
✓ strategy-01-01-u06 parity: 35 locations, 0 diff
EXIT=0
```

独立照合 (scratchpad `ra0106/check.mts`、`ra0106/clause.mjs`) の要約: framing jp 0 / zh 0 / en 0、D-200 考点 9 件 = 1〜2 文・39〜86 字、12 字連続一致 遮蔽なし 2 (見出し語のみ、偽陽性) / カタカナ遮蔽 0 (JP 128 本 × topic 62 題)、近似一致の最近接 文単位 ed 0.61 / Dice 0.32、節単位 ed 0.47 / Dice 0.44 (L7)、`[[jp:]]` 原語 10 種全て jp 本文に実在、派生フィールド不一致 0、用語・`term_zh`・`term_en`・`prerequisites` の v1 不変量 一致。

補丁の試し適用 (scratchpad の写しに L1 + L2 + L3 + L8 を当て派生フィールドも更新した版、repo の単元は未変更): `node --no-warnings scripts/textbook-v2-validate.mjs --file <scratchpad>/ra0106/patched.json --manifest data/ip/textbook/.planning/v2/strategy-01-01-u06/manifest.json` → `✓ strategy-01-01-u06 unit: 0 issues`、EXIT=0。
