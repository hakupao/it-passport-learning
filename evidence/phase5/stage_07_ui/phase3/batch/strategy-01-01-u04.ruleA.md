# Rule A 全数抽検 — strategy-01-01-u04 (経営管理サイクルと事業継続)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S146 第 21 批 b21)、repo HEAD `1e197f46` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b21-u04-a4` merge 結果、sha256 先頭 `b7f936f06332fa56`)。a4 は a3 `jp.r1` + jp-review #2 を種とした 4 回目 (a1〜a3 は Rule B 記録 `failures/phase5/stage_07_ui/phase3/batch/strategy-01-01-u04_attempt_{1,2,3}.md`)。単元の jp 本体は a4 `jp.r0` と一致 (差分は派生欄・v1 継承欄 [title / unit_summary / overview.intro / lang_status] のみ)。
- **対象**: `data/ip/textbook/units/strategy-01-01-u04.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (経営目標 / 財務・資産・人事・情報管理 / PDCA / OODAループ / BCP / BCM / リスクアセスメント) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205 (S138 §2・§6)、D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/strategy-01-01-u04/v1-original.json` (用語 7 語・`term_zh`・`term_en`・challenge 4 題の集合が v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) 計 81 欄が本体の記法除去版 (`**` 除去、`[[jp:X]]`→X、summary の hook は「見出し語: 」前置) であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 8 件 = exam 6 + mix 2、引用 qid 延べ 9 件 = 異なり 9 題、全題 topic `strategy-01-01`)**: `data/ip/quiz/questions.json` の各題の選択肢・`correct_answer` と、`translations/<exam>.json` の `stem_jp_clean` を再読。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化・限定をしていないこと、限定条件を外していないことを 1 件ずつ確認 (§2)。
3. **quiz / challenge_questions** (quiz 計 6 枠、challenge 4 題 = 2017h29a-q025 / 2018h30h-q034 / 2020r02o-q026 / 2021r03-q052、うち本文で未引用 1 題): 2020r02o-q026 (本社全壊を想定した BCP として適切なもの = 代替拠点を決め重要業務に絞って手順を整える; 誤答 = 防火品への交換と点検 / 全支社停止で待機 / 建物保険と移転) は BCP の one (止めないか早く再開)・detail (影響の大きい業務の選定・目標復旧時間・代わりの手段・手順) で解け、全業務停止は one と矛盾、防火・保険は BCP の中身に一切書かれていない (保険はリスクアセスメントの analogy 内のみ、かつ mix 考点が「BCP そのものではない」と切り分け) → 誤答肢を支持しない。
4. **D-198 写し**: validate の copy guard = 0 件、`warn choice-echo` 出力 0 行。独立照合として単元の JP 文字列 142 本 (派生除く) を topic 内全 62 題の `stem_jp_clean` + 選択肢と 12 字連続照合 (句読点・記号・空白除去) を **(a) カタカナ 4 字以上と英数を □ に遮蔽 (遮蔽後の実字 6 未満の窓は除外) / (b) 遮蔽なし** の 2 通りで実施 → **(a)(b) とも 0 件**。照合器の動作確認として 8 字窓で再実行 → 16 件、全て見出し語 (リスクアセスメン… / BCP事業継続計…) か定型句 (を実現するために / を達成するために) か標準定義の部品 (信念や価値観を社 / の実行状況をKP) で、表現の写しではない (§3 L5)。近似一致 (14 字窓 vs 題の全 14 字部分列、編集距離 1〜2 = 1〜2 字置換): **0 件**。カタカナの多い文 (PDCA / OODA の one・図ラベル、BCP / BCM の hook) を目視 → 題の語句の流用なし (Plan/Do/Check/Act・Observe/Orient/Decide/Act は用語の構成名そのもの)。
5. **D-208 (iii) 選択肢・判断項目のなぞり** (§2 と §4 で各考点を個別判定): 組合せ題 2015h27a-q007 (対策 a・b に当たる用語の組) と全項目正解型 2021r03-q052 (BCP に基づくマネジメント活動 a〜d) は題文側に判断項目があり warn では見えないため、考点・goals・pairs・図と項目を突き合わせた (§4)。
6. **D-195**: one = 1 文 × 7 (太字あり)、detail 2 文 × 7、比喩・フック (語源 [BCP / BCM / アセスメント]・旗・登山・料理・サッカー・停電メモ・旅行保険) が定義の言い換えでないこと、定義前使用 (経営戦略・経営計画 = 経営目標の図ラベルが detail より先 → L10、KPI = PDCA detail の括弧注、重要業務 = BCP one、目標復旧時間 = BCP detail [図 step 0 は語を使わず「いつまでに再開するかの目標」と書く])、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → 「重要」13 件は全て見出し語「重要業務」「重要業績評価指標」の一部、「選ぶ」3 件は OODA の Decide (行動を選ぶ) と key_points[4] (対応を選ぶ) の通常の動詞、「とされる」2 件は `terms[6].detail_jp` (+派生) の「JIS Q 31000:2019 では…プロセスとされる」で出典を明示した帰属表現 → 定型締め句 0。図の型 (経営目標 = flow static、財務等 = table static、PDCA / OODA / BCP / BCM / リスクアセスメント = flow steps 4/4/4/4/3; 全て登録内)、pair 配置 (PDCA→OODA は OODA の後、BCP→BCM は BCM の後、各組 key 行あり)。
7. **D-200**: 考点数 2/0/1/1/1/1/2 (≤3 ✓)、各 JP 文数 1〜2・字数 48〜98 (≤100 ✓、最大はリスクアセスメント `points[1]` の 98 字・2 文)。**framing 件数** (validateV2 `pointFraming` を直接呼出し、全考点): jp 0 / zh 0 / en 0 (上限 2)。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の範囲照合; 特に BCM の範囲 [策定を含むか]、リスクアセスメントの役割 [優先度を「判断する」か「材料」か]) → §4、不整合 1 (M1、en のみ)。書き方 8 (対比の出現欄の列挙) → §3 末尾。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → L1。§9 言い直し → L6。
9. **D-205 / D-210**: 改訂のある文書の構成数は `terms[6].detail_*` の「例えば JIS Q 31000:2019 では…特定・分析・評価の 3 段階」のみ — 版 (2019) と「例えば」の両方あり ✓。PDCA 4 段階・OODA 4 段階・4 経営資源は改訂文書の構成ではない。引用題に法令・規格の改正前の文言に依拠するものはない (D-210 該当なし)。
10. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 13 種 (経営目標 / 経営理念 / 経営戦略 / 経営計画 / 財務・資産・人事・情報管理 / OODAループ / 重要業務 / 目標復旧時間 / リスクアセスメント / リスク / 特定 / 分析 / 評価) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` = 漢字・カナ見出しの 4 用語で 4/4 あり (PDCA / BCP / BCM は三語同表記のため不要、validate も 0)、zh 訳語が `zh_terms.json` に従うこと (経营目标 / 经营理念 / 财务·资产·人事·信息管理 / OODA 循环 / 风险评估 / 风险 一致、B6 warn 0 / jp-origin warn 0)。loc-review #1 (PASS、low 9) の指摘の残存を確認 → L8 / L9。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 経営目標 | OK — exam 2 / 2 題: 経営理念 = 企業の信念・価値観を社内外に示すもの、具体的な到達点を示す経営目標とは役割が違う (2010h22h-q016 正答エ 経営理念; 誤答 = 経営課題 / 経営計画 / 経営戦略。考点の対比相手「経営目標」は選択肢に無く、選択肢の組・順のなぞりではない) / 経営戦略 = 目標達成のための資源配分の方針 (2017h29a-q025 正答イ 経営戦略; 題の事例 [不振事業からの撤退と別事業への資源投入] の主体・事業名は使わず、一般の定義として「どの事業に資源を重点的に振り向けるか」と述べる)。どちらも分類型で D-209 の例外 (正しい内容を見出し語の一般定義として述べる) に当たる。flow 理念→目標→戦略→計画は detail と一致 | OK (図ラベルが detail より先 = L10) | OK (zh「具体目标点」は L9) | L5, L6, L10 |
| 2 | 財務・資産・人事・情報管理 | 考点なし (freq 0)。カネ・モノ・ヒト・情報の 4 資源に対応する 4 領域、table の内容例 (資金の調達・運用 / 設備の取得・保全 / 採用・配置・評価・育成 / 情報の収集・保護・活用) は標準的で正しい | OK | OK | L7 (detail_jp のねじれ文) |
| 3 | PDCA | OK — exam 1 / 2 題: C = 計画の実行状況を KPI などの指標で測り評価する段階 (2011h23tokubetsu-q008 正答ウ 経営計画の実行状況; 誤答 = 中長期のありたい姿 / 技術ロードマップの要素 / 外部環境の分析結果 を支持しない / 2018h30h-q034 正答ウ C)。「KPI **など**」で q034 の KPI を例にとどめ、Check の指標を KPI に限らない。steps 4 (Plan で指標を決める → Check で測る → Act で次の Plan へ) は考点と一致 | OK | OK | L5, L6 |
| 4 | OODAループ | 考点 mix 1: 観察から始まり、事前の計画を起点にする PDCA より短い間隔で判断を切り替えるのに向く — 標準的な説明で正しい (引用題なし)。detail の提唱者 (米空軍のジョン・ボイド、空中戦の意思決定) は事実。pairs[0] (起点 = Plan / Observe) と一致 | OK | OK (zh「间隔转得越短」は L9) | なし |
| 5 | BCP | OK — exam 1 / 2 題: 目的は、使える人・設備・情報が限られた状況でも優先度の高い重要業務を続けること (2016h28a-q007 正答ア 経営資源が縮減された状況での重要事業の継続; 誤答 = 資産の保全 / 被災地の連絡手段の確保 / 労働災害リスクの低減 を支持しない。BCP 図 step 1 の「連絡と判断の体制」は計画の中身の一つで、目的として述べていない / 2011h23tokubetsu-q024 正答ア BCP; 誤答 BPR・ERP・RFP)。限定条件: q024 の「災害**など**」「情報システムに障害」→ one「災害や事故、システム障害**など**」、q007 の「大規模な自然災害を想定」→ 考点「被災**など**で」で保持。考点は one の「止めないか早く再開」のうち「続ける」側だけを言うが「だけ」とは限らず正答と一致 (L6)。steps 4 (平常時の取決め → 初動 → 継続・再開 → 全面復旧) は one・detail と一致 | OK | zh「失去部分经营资源」= L8 | L4, L5, L6, L8 |
| 6 | BCM | OK — exam 1 / 2 題: BCM は BCP を作る段階だけでなく、作った後も平常時から訓練などで計画が働くかを確かめ、改め続ける段階までを含む管理の活動 (2015h27a-q007 正答ア a:BCP b:BCM / 2021r03-q052 正答イ a〜d 全部)。D-208 (iii) は §4 (a)(c) で個別判定 → 該当なし。q052 の a〜c (備えを使える状態に保つ) は考点ではなく one・図 step 1・pairs[1].rows[1] が支える (L3)。steps 4 (分析・BCP の策定 → 備えの維持 → 教育・訓練 → 点検・見直し) は one・pairs と一致。analogy (停電メモを書いて終わりにせず、電池確認・年 1 回の試行・書き直し) は図の 4 段と同じ範囲 (書く = 策定を含む) で D-204 の食い違いなし | OK | caption_en / pairs.b_en の軽微な欠落 = L8 | L3, L4, L8 |
| 7 | リスクアセスメント | OK — exam 1 / 1 題: 起こる可能性と事業への影響の大きさの両方を分析・評価する (2018h30a-q021 正答エ; 誤答 = ABC 分析 / SWOT 分析 / 環境アセスメント を支持しない。題の主体・新商品・発売遅れの場面は使わない) / mix: リスクの大きさを評価して対応の優先度を判断する取組みで、重要業務の継続・再開の計画である BCP そのものではなく、評価結果は BCP を作るときの判断材料の**一つ** — 正しく、§4 (b) のとおり jp 全欄と整合。detail の JIS Q 31000:2019 の 3 段階・対応 4 種 (「といった」で開いている) は正しい。steps 3 (特定 → 分析 → 評価 = 優先度の判断) は one と一致 | OK | **en の総表補足列で「優先度」が落ち、取組みが備えの中身・量を決めると読める = M1** | **M1**, L1, L5, L6 |

**単元レベル**: goals 3 点・overview_cols 2 (種類 / 主な使いどころ)・overview_rows 7 行・pairs 2 組 (PDCA / OODA 3 行 key 1、BCP / BCM 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge_questions 4 件 (§1-3)。pairs[1] の BCM 側 (rows[0] = BCP を作り・保ち・改め続ける活動全体、rows[1] = 策定・備えの維持・教育訓練・点検見直し) は BCM の one・図・考点と一致。事実誤りなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 10 (うち 建议修 4: L1 / L2 / L7 / L8)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| **M1** | **MEDIUM** (観点 7 欄同士の不整合 / D-208 既知型 (5) 先の回で直した主張の zh・en での再発) | `overview_rows[6].extra_en[1]` | jp「何にどれだけ備えるかの**優先度の判断**」・zh「判断针对什么、准备到什么程度的**优先顺序**」に対し、en は "Deciding what to prepare for, and how much" で「優先度」が落ち、リスクアセスメント自体が「何に・どれだけ備えるか」(= 備えの中身と量) を決めると言い切る。同じ en の `terms[6].points[1].text_en` は "Its results are **one input** to decisions when drawing up a BCP"、`detail_en` は評価結果が対応の選択に "lead to" とし、決めるのは後続の対応・計画側と位置付けている。これは a1 jp-review #1 の MEDIUM (`terms[6].points[1]` が取組み自体に「どのリスクにどれだけ備えるかを決める」役を持たせ、detail の「材料」と食い違う) と同じ軸の食い違いが en の表セルで残ったもの。LOW にしない理由: 欄が総表の補足セルでも、en 読者には「優先度の判断」(one_en / fig step 2 / one_line_en) と「備えの決定」(本セル) の 2 つの役割が並んで見え、a1〜a3 で 3 回往復した論点そのものである | en のみ: "Deciding what to prepare for, and how much" → "**Judging priorities: what to prepare for, and how much**" (jp・zh は変更不要) |
| L1 | LOW **建议修** (§6 / D-204、M1 と同じ軸の比喩側) | `terms[6].analogy_jp` / `analogy_zh` / `analogy_en` | 比喩の結論「どれに保険をかけるかを決める」は、対応手段 (保険 = 移転) の選択まで比喩に入れており、detail が評価の**後**に置く「対応の選択」に一歩踏み込む。ただし「どれに」= 複数のリスクからどれに手を打つかの選択で、one の「対応の優先度を判断する」の範囲と読め、量 (どれだけ) は言わないので M1 より弱く LOW。保険は 2020r02o-q026 の誤答エ (BCP として保険を組み込む) の像とも近いが、比喩はリスクアセスメント側で BCP とは切り分けられており誤答は支持しない | jp「…起きやすさと困る度合いで並べて、どれに保険をかけるかを決めるのに近い。」→「…起きやすさと困る度合いで並べて、**どれから備えるかを決める**のに近い。」/ zh「…按容易发生的程度和困扰的程度排好，再决定给哪些买保险。」→「…按容易发生的程度和困扰的程度排好，**再决定先为哪些做准备。**」/ en "…ranking it by how likely and how bad each would be, and deciding which to buy insurance for." → "…ranking it by how likely and how bad each would be, and **deciding which to prepare for first.**" |
| L2 | LOW **建议修** (観点 7 軽微 / a1 から継承した唯一の二分の行) | `pairs[1].rows[2].a_jp` / `a_zh` / `a_en` | 「時間の軸」行の BCP「非常時に発動する」/ BCM「平常時から続ける」は a1 `jp.r0` から無変更の唯一の行。発動は非常時で事実だが、BCP 自身の図 step 0 は「平常時の取決め」、one は「前もって定めておく」で、行だけ読むと「BCP は非常時だけのもの・平常時は BCM」という排他の二分に読める (a4 jp-review も low)。BCM 側の「平常時**から**」は非常時を除かないので BCM の範囲とは矛盾しない | jp「非常時に発動する」→「**平常時に定め、非常時に発動する**」/ zh「在非常时期启动」→「**平时制定，在非常时期启动**」/ en "Activated in an emergency" → "**Drawn up in normal times, activated in an emergency**" |
| L3 | LOW | `terms[5].points[0].text_jp/zh/en` × qid 2021r03-q052 | 考点の後半は「訓練**など**で確かめ、改め続ける」(検証・見直し) で、q052 の判断項目 a〜c (データのバックアップ取得 / 非常用電源と燃料 / 複数の通信網 = 備えを使える状態に保つこと) が BCM の活動であることは考点ではなく `terms[5].one_jp`「決めた備えの維持」・図 step 1・`pairs[1].rows[0..1]` の BCM 側が支える。「など」で開いており限定ではなく、単元全体で正答 (全部) に届く | 記録のみ (考点に備えの維持を足すと a1 の「〜も〜も」の全項目正解の形に戻る危険があるため改稿しない方が安全) |
| L4 | LOW | `terms[4].hook_jp/zh/en`「計画書」、`terms[4].analogy_*`「メモ」、`pairs[1].rows[0].a_*`「(成果物)」 | BCP を「計画書」「書いておくメモ」「成果物」として描き、文書の像に寄る。ただし「だけ」の限定はなく、`pairs[1].rows[1].a_jp` が BCP の中身に「代わりの手段」を入れるので、2015h27a-q007 の対策 a (相互バックアップのプロセスを用意 = BCP) は単元から BCP と判定でき、a3 の MEDIUM (「計画の文書そのものは BCP」と BCM 考点で対比し a→b をなぞった) は再発していない。「(成果物)」は a3 jp-review #2 の fix が示した書き方。a2 low の緊張 (BCM が策定を含むので対策 a も BCM の範囲に見える) は残るが、q007 に a:BCM の選択肢は無く誤答に届かない | 記録のみ |
| L5 | LOW | `terms[0].points[0..1]`、`terms[2].points[0]`、`terms[4].points[0]`、`terms[6].points[0]` (各 `text_jp`) | 分類型・定義型の題で、考点の文の骨組みが題文または正答肢に近い: 経営理念 (2010h22h-q016 の題文の「信念や価値観を…示す」)、経営戦略 (2017h29a-q025 の事例を一般化)、Check (2018h30h-q034 の題文 + 2011h23tokubetsu-q008 の正答)、BCP の目的 (2016h28a-q007 の正答肢「資源が縮減された状況での重要事業の継続」の言い換え)、リスクアセスメント (2018h30a-q021 の題文の「可能性と…場合の影響の大きさを分析・評価」)。いずれも正規化 12 字一致 0・近似一致 0、題の主体名・数値・場面 (新商品・撤退した事業) を使わず、見出し語の標準定義を述べた文で D-209 の例外。誤答肢の組・順のなぞりもない | 記録のみ |
| L6 | LOW (D-203 §9 / 書き方 8) | `goals_jp[2]` / `terms[6].points[1]` / `key_points_jp[4]`; `terms[4].detail_jp` / `terms[4].fig.steps[0].caption_jp` / `pairs[1].rows[1].a_jp`; `terms[2].detail_jp` / `fig.steps[3]` / `key_points_jp[2]`; `terms[0].detail_jp` / `points[0..1]` / `key_points_jp[0]`; `terms[4].points[0]` ↔ `one_jp` | 同じ内容の言い直し: 「リスクアセスメントの結果 = BCP を作るときの判断材料」が 3 欄、BCP の中身 (重要業務・再開目標・代わりの手段・手順) が 3 欄、PDCA の Act → 次の Plan が 3 欄、経営理念 / 経営戦略の定義が detail・考点・要点で 3 回。BCP 考点は one の「止めないか早く再開」の「続ける」側だけを言う (「だけ」ではなく正答とも一致) | 記録のみ |
| L7 | LOW **建议修** (文体) | `terms[1].detail_jp` 1 文目 | 主語「4 つの領域は」と述語「管理が行われる」がねじれている (a4 jp-review low、未修) | jp「4 つの領域は別々に動くのではなく、どれも経営目標の達成に向けて計画・実行・確認の管理が行われる。」→「4 つの領域は別々に動くのではなく、**どの領域でも**経営目標の達成に向けて計画・実行・確認の管理が行われる。」(zh・en は既に自然な文で変更不要) |
| L8 | LOW **建议修** (訳の軽微な付加・不統一・欠落; loc-review #1 の low の未修分) | `terms[4].one_zh`、`overview_rows[5].one_line_zh`、`terms[5].fig.steps[1].caption_en`、`pairs[1].rows[1].b_en` | (i) zh「失去部分经营资源」は jp「経営資源が損なわれても」に「一部を失う」の限定を足す (2016h28a-q007 の「縮減」とは合うが jp より狭い)。(ii) BCM の「訓練」を総表 one_line_zh だけ「培训」、他欄 (detail / key_points / extra) は「演练」。(iii) caption_en で BCM の要点「平常時から」が欠落 (zh にはある)。(iv) pairs b_en で「教育」「点検」が欠落 | (i) zh「…系统故障等失去部分经营资源，也能让…」→「…系统故障等**导致经营资源受损**，也能让…」/ (ii) zh「制定 BCP，并在维持既定准备的同时反复培训和修订的管理活动」→「制定 BCP，并在维持既定准备的同时反复**演练**和修订的管理活动」/ (iii) en "Keep preparations: maintain the alternatives set in the BCP so they can be used when needed." → "Keep preparations: **from normal times on,** maintain the alternatives set in the BCP so they can be used when needed." / (iv) en "Repeated drafting, keeping preparations, training, and review" → "Repeated drafting, keeping preparations, **education and training, and inspection and review**" |
| L9 | LOW | zh 本文の「」(`terms[0].analogy_zh` / `hook_zh`、`terms[4..6].hook_zh`)、`terms[3].detail_zh`「间隔转得越短」、`pairs[1].rows[0].a_zh`「（成果物）」、`terms[5].points[0].text_en` "BCM covers…"、`overview_rows[0].one_line_zh` ほか「具体目标点」 | loc-review #1 の low (大陸式引用符 “”、直訳調、日式借用語、「管理活動である」の位置付けの脱落、造語調) が未修のまま残る。意味の誤りはなく、引用題の誤答肢に寄る語でもない (既知型 (6) 該当なし) | 記録のみ (loc-review #1 の fix 案どおりで可) |
| L10 | LOW (観点 3 定義してから使う) | `terms[0].fig.data.nodes[2..3]` | 骨格順 (one → 図 → detail) で、図ラベル「経営戦略」「経営計画」が detail の定義より先に出る。一般語で直後に定義されるため影響は小さい (a1〜a4 jp-review low) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① BCP = 計画 (成果物) / BCM = それを作り・保ち・改める活動全体: `pairs[1].rows[0]` (key)、`terms[5].points[0]` (BCM 側を正の定義で述べ BCP 側は「作る段階」として包含)、BCM の one・analogy (定義そのもの・比喩) → pairs + 考点の 2 箇所で許容、hook 2 つ (P / M の語源) は D-195 §6 の手がかりで数えない。② 時間の軸 (非常時に発動 / 平常時から続ける): `pairs[1].rows[2]` のみ (L2)。③ PDCA (計画起点) / OODA (観察起点): `pairs[0].rows[0]`、`terms[3].points[0]` (mix) → 2 箇所で許容。④ リスクアセスメント ≠ BCP: `terms[6].points[1]` (mix) のみ、関係 (判断材料) の反復は L6。`goals_jp` は観点の予告で内容を述べない。

## 4. 重点確認 (依頼の 4 点 + a1 の枠組みの継承)

| # | 確認点 | a4 の該当文言 (要旨) | 判定 |
|---|---|---|---|
| (a) | BCM 考点 × 2021r03-q052 (全項目正解型): 判断項目の組・順、「〜も〜も」の全部正解の形を再現していないか (D-209 但し書き) | `terms[5].points[0].text_jp`「**BCM**は、BCP を作る段階だけでなく、作った後も平常時から訓練などで計画が働くかを確かめ、改め続ける段階までを含む管理の活動である。」 | **該当なし**。q052 の項目 a〜c (バックアップ / 電源と燃料 / 通信網) の語も組も一切出ず、d (復旧手順の訓練) は「訓練など」に一般化され単独。「〜だけでなく〜まで含む」の対は「BCP を作る段階 / 作った後の検証・見直し」で、q052 の項目 (全て BCP に基づく作成後の活動) の並びに対応しない → a1 #2 の MEDIUM (対策群→訓練の順 + 「〜も〜も含まれる」) は解消。考点が q052 の a〜c の要点を担わない点は L3 |
| (b) | リスクアセスメント mix 考点 (a2 では `terms[6].points[1]`): 優先度を「判断する」か「判断の材料を出す」か、そこから作る計画を = BCP と言い過ぎていないか | `terms[6].points[1].text_jp`「…リスクの大きさを評価して対応の優先度を判断する取組みで、重要業務の継続・再開のための計画である**BCP**そのものではない。その評価結果は、BCP を作るときの判断材料の一つになる。」 | **jp は解消**。「対応の優先度を判断する」が `one_jp`・`fig.steps[2].caption_jp`・`overview_rows[6].one_line_jp`・`extra_jp[1]`・考点で一致 (a2 #1 の割れは解消)、BCP との関係は「判断材料の一つ」で `goals_jp[2]`・`key_points_jp[4]` と一致し、「その結果で備えを定めた計画 = BCP」の言い切り (a2 #2) は消えた。BCP の範囲は one と同じ「重要業務の継続・再開」に限られる。**残り = en の総表セル (M1)** と比喩の結論 (L1) |
| (c) | `terms[5]` (BCM) の BCP / BCM 境界: BCP を文書だけに限り 2015h27a-q007 の a→b をなぞっていないか; BCM が BCP の策定を含むかが goals / pairs / one / detail / 図で一致するか | 考点は BCP を「作る段階」として BCM に包含し、BCP 側の作業内容 (代わりの手段・切り替え方) を述べない。策定の包含: `one_jp`「BCP の策定から…まで」、`fig.steps[0]`「分析・BCP の策定」、`pairs[1].rows[0].b_jp`「BCP を作り、使える状態に保ち、改め続ける管理の活動全体」、`rows[1].b_jp`「策定、…」、`overview_rows[5].one_line_jp`「BCP を策定し、…」、`points[0]` | **該当なし / 一致**。考点から「文書」の語と a 側 (用意する代わりの手段) の作業内容が消え、q007 の対策 a・b を両側に振り分けて a→b の順に言い直す形 (a3 #2 MEDIUM) は解消。策定を BCM に含むことは 6 欄で一致し、`goals_jp[2]`「BCM が平常時から続ける活動」・`key_points_jp[3]`・`detail_jp` (訓練・見直しの話) は策定に触れないが外してもいない (「だけ」なし) → a3 #2 の範囲の食い違いは解消。三語も同じ (zh「制定 BCP」、en "drawing up the BCP")。文書の像は L4 |
| (d) | a4 が種から a1 の goals / pairs の排他二分 (「計画そのものか、計画を保ち続ける活動かで分け」) を継承していないか | `goals_jp[2]`「**BCP**に定める内容と、**BCM**が平常時から続ける活動を説明でき、…」、`pairs[1].rows[0]` (上記)、`rows[1]` (a3 から)、`rows[2]`「非常時に発動する / 平常時から続ける」 | **goals・key 行は継承なし** (「〜か〜かで分け」の二分が消え、key 行は包含関係)。a1 `jp.r0` から無変更で残るのは `pairs[1].rows[2]` の時間軸の 1 行だけで、範囲の排他ではなく時期の対比だが BCP = 非常時だけと読める余地 → L2 |

## 5. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **10** (建议修 4: L1 / L2 / L7 / L8 / 記録のみ 6: L3〜L6・L9・L10) |

## 6. 判定

**不合格 (REVISE、B3 補丁で可)** (D-199: MEDIUM 1)。全 7 用語・考点 8 件 (qid 付き 6 件)・引用 9 題 + 未引用の challenge 1 題で、jp の考点の主張は正答と一致し、誤答肢を支持する記述も限定条件の落ちも無い。依頼の重点 (a)〜(d) のうち a1〜a3 の MEDIUM 4 系統 (q052 の全項目正解形 / リスクアセスメントの役割 / BCP=文書と q007 の a→b なぞり / BCM の範囲) は jp・zh で全て解消。残る MEDIUM は en の総表セル 1 件 (M1: 「優先度」の脱落で a1 と同じ役割の食い違いが en で再発) で、1 欄の文字列置換で直る。M1 を補丁すれば HIGH 0 / MEDIUM 0 で PASS 相当。LOW 建议修 4 件 (L1 / L2 / L7 / L8) は同じ B3 補丁で修正推奨、記録のみ 6 件はバッチ証拠の「未修 LOW」表へ。

## 7. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-01-u04
✓ strategy-01-01-u04 unit: 0 issues (data/ip/textbook/units/strategy-01-01-u04.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-01-u04
✓ strategy-01-01-u04 parity: 37 locations, 0 diff
EXIT=0
```
