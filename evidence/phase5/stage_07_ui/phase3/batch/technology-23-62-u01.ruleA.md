# Rule A 全数抽検 — technology-23-62-u01 (リスクアセスメントの工程)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-10-29 (S138 第 4 批 b04)、repo HEAD `0b3bc55` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b04-u01-a2` merge 結果、`.planning/v2/technology-23-62-u01/merged.json` とバイト一致、sha256 先頭 `43e031a7c8361f52`)。
- **対象**: `data/ip/textbook/units/technology-23-62-u01.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (情報セキュリティリスク / リスクアセスメント / リスク特定 / リスク分析 / リスク評価) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、S135 補足 D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 (one_zh / one_en の `[[jp:]]` 見出し語、書き方 7 欄同士の整合・8 同じ対比 ≤2 箇所・9 引用題の限定条件)、D-203 (観点 8 対比反復・§6 比喩が定義の言い換え・§9 考点が one / detail の言い直し = low、観点 7 = medium [事実誤りなら high]、観点 9 限定条件落ち = high)、**D-204** (S138 §2-3: 比喩・hook の像や結論が、同じ用語の考点・detail が否定する内容を運べば medium)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `data/ip/textbook/.planning/v2/technology-23-62-u01/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_* / overview.intro_*`) が本体の記法除去版 (`**` 除去、`[[jp:X]]` → X) であることをスクリプトで確認 (51 組 + intro 3 語、不一致 0)。リスクアセスメント (terms[1]) には `hook_*` が無い (派生 `memory_hook_*` は空文字、`summary.memory_hooks_*` は 4 件) — schema 上任意で validate 0、指摘しない。
2. **考点 × 引用題 (考点 全 12 件 = exam 10 + mix 2、qid 付き 10 件、引用 qid 延べ 16 件 = 異なり 14 題)**: `data/ip/quiz/questions.json` から各題の題文・選択肢・`correct_answer` を再読 (全題 topic `technology-23-62`)。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化をしていないこと、題の場面・前提 (限定条件) を外していないことを 1 件ずつ確認。計算題 2019h31h-q068 (資産価値 × 脅威 × 脆弱性、重み付けなし) を再計算: A = 5×2×3 = 30、B = 6×1×2 = 12、C = 2×2×5 = 20、D = 1×5×3 = 15 → 正答ア (A) と一致。積の算出は分析、最大値を最優先とするのは評価 (題の「〜と評価される」) で、分析の考点 points[1] は「3 つが大きさを左右する」のみを言い、積を最優先とする判断は述べない → 工程の境界を越えない。
3. **工程の境界 (特定 → 分析 → 評価 | 対応) の横断点検** (呼出元の注意点 1): 評価が「受け入れる / 保有する」を決めると読める欄は **0**。`terms[4].detail` の「どの程度のリスクなら受け入れてよいかなどを示す物差し」はリスク基準 (受容基準) の説明で、評価の行為ではない (a1-r1 の MEDIUM「基準内はそのまま受け入れ…」は削除済み)。評価の成果は one / overview_rows[4] / pairs[1].rows[2] / fig steps[2] / points[0] / analogy (補習が要る科目と順番) とも「対応の要否と優先順位」で一致し、対応方法の選択は terms[1].points[0]・fig steps[3] / node n4・analogy (点検業者は報告まで) で全てリスク対応側 → 2021r03-q091 (優先順位 d は内、対応方法 c は外) / 2017h29h-q063 (対処方法の選択と管理策の計画 = 対応、受容基準との比較で必要性判断 = 評価) と整合。唯一の揺れは分析の比喩 en の "deciding" (L2)。
4. **「発生可能性 × 影響」と「資産価値・脅威・脆弱性」の関係** (注意点 2): one / fig (2 × 2 表) / overview_rows[3] / pairs[1].rows[0] は前者、points[1] / key_points[2] は後者。`terms[3].detail` 2 文目が「資産価値は影響の大きさに、脅威と脆弱性は起こりやすさに関わる」で橋渡し (a1-r2 MEDIUM 解消、JIS Q 27005 系の標準的な対応で正しい)。この橋渡し文の動詞「評価して」/ zh「评估」が L1。
5. **quiz / challenge_questions** (quiz 計 10 枠 + challenge 5 題、うち本文で未引用 2 題): 2018h30a-q068 (リスクアセスメントの説明 = 識別された資産のリスクを分析・評価し基準に照らして対応要否を判断; 誤答 = ウイルス駆除・本人確認・費用対効果) は terms[1].one と一致。2017h29h-q063 (対応に含まれる作業; 誤答 = 洗い出し・基準比較で必要性判断・発生確率と影響度から大きさ算定) は terms[2..4].one と terms[1].points[0] で各選択肢を工程に振り分けて解ける。challenge の残り 4 題 (2013h25a-q056 / 2021r03-q091 / 2014h26h-q072 / 2018h30a-q067) と quiz の残り 9 枠は本文の考点で引用済みで §2 表で確認済み。
6. **D-198 写し**: validate の copy guard (本文 + 図ラベル・caption・総表・対比表) = 0 件。独立照合として単元の JP 文字列 105 本 (派生フィールド・source_figures 除く) を topic 内全 135 題の題文 + 選択肢と 12 字連続照合 (句読点・記号・空白除去、カタカナ 4 字以上と英数を □ 1 字に遮蔽、遮蔽後の実字 6 未満の窓は除外):
   - 見出し語を遮蔽しない (validate より厳しい) → **6 件、全て偽陽性**: `terms[1].one_jp` / `terms[1].points[0].text_jp` ↔ 2013h25a-q056 / 2017h29h-q063 / 2022r04-q086、一致部はいずれも「リスク特定・リスク分析・リス(ク評価)」= 見出し語 3 つの連なり。用語名は表現ではない。
   - 見出し語を遮蔽 → 0 件。
   - **カタカナの多い文の目視** (遮蔽で窓が切れる箇所): `terms[1].points[0]` ↔ 2019r01a-q056 / 2021r03-q091 — 共通部は「リスクアセスメントに含まれる」(見出し語 + 4 字) の題の問い方で、考点は「3 つで、リスク対応は含まれない」と自分の文で言い切る → 写しではない。`terms[4].points[0]` ↔ 2014h26a-q047 — 算定された → 分析で算出した、与えられた基準 → 前もって決めた基準、重大さを決定 → 重大さ…を決める と語を置き換えた近い言い換えだが、題の文はリスク評価の JIS 定義 (JIS Q 0073 / 27000) そのもので、D-198「標準的な定義・原則の一般表現は写しではない」に当たる (同考点は one の言い直しで L5)。`terms[2].points[1]` ↔ 2017h29h-q083 — 「適用範囲の中の情報について、機密性・完全性・可用性の 3 つが失われることに伴うリスクを洗い出す」は JIS Q 27001 6.1.2 c) 1) の条文の言い換え (最長共通 7 字「に伴うリスクを」) で同じく標準原則の表現。`terms[3].points[0]` ↔ 2022r04-q086 ア — 「基準と比べられる形で」「リスクレベルを決める」と語順・語を変えており写しではない。
   - (iii) 具体例の流用: 脅威・脆弱性の例 (図: なりすまし / 機器の故障 / 洪水 / パスワードの使い回し; 考点: 自然現象・機器の不調 / 設定の不備・利用者教育の不足) は 2018h30a-q067 の選択肢 (落雷による停電・暗号化しない通信・文書取扱いの不統一・施錠できないドア) を使っていない (a1-r2 L「手順のばらつき」は削除済み)。分析の表 (起こりやすい / にくい × 影響 小 / 大) は 2019h31h-q068 の資産 A〜D・数値を使わない。比喩 (空き巣と壊れた裏口・住宅点検・旅行前の書き出し・台風・テストの合格点) はいずれも引用題に無い場面。
7. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 2〜3 文 (3/2/3/2/2 文)、比喩・フックが定義の言い換えでないこと (字形 脆・析、英語 identification / evaluation、ラテン語 vulnus、ギリシア語 analysis で別の手がかり)、定義前使用 (脅威・脆弱性・情報資産 = terms[0].one/detail、リスクマネジメント = terms[1].detail の括弧注、ISMS = terms[2].detail の括弧注、適用範囲 = 同 detail、リスクレベル = terms[3].one の括弧注、定量的 / 定性的 = 同 detail、リスク基準 = terms[4].detail; 機密性・完全性・可用性は未定義 → L7、リスクレベルは総表で先に出る → L7)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → `freq_badge`「頻出」、「出る」4 件 [overview_rows[0].one_line_jp・terms[0].analogy_jp・key_points_jp[0]・summary.key_points_jp[0] = 「損害が出る」の通常用法]、「選ぶ」1 件 [terms[1].fig.steps[3].caption_jp「具体的な対策を選ぶ」= 型「として選ぶ」ではない]、「覚え」1 件 [terms[3].hook_jp「〜と覚えられる」+ 派生 2; 1 単元 1 件は u02/u04/u05 の前例どおり記録なし]。zh・en 相当語のヒット [zh 必须 = points[0]「并没有规定…必须」の否定、考试 = analogy_zh「考试分数」、en must = "no rule says … must"、never = "Evaluation never comes before analysis"、exam = kind 値・"example"] は全て通常の用法で偽陽性)、validateV2 `BANNED_PHRASES` / `EXAM_FRAMING` 0。図の型 (情報セキュリティリスク = static table 3 行、リスクアセスメント = flow steps 4、リスク分析 = static table 2 × 2、リスク特定・リスク評価 = 図なし; 全て登録内)、pair 配置 (特定→分析 は分析の後、分析→評価 は評価の後、各組 key 行あり: pairs[0].rows[0] / pairs[1].rows[1])。
8. **D-200**: 考点数 2/2/2/3/3 (≤3 ✓)、各 JP 文数 1〜2・字数 45〜89 (≤100 ✓、最大は terms[1].points[0] の 89 字)。**framing 件数** (validateV2 `pointFraming` を tsx で直接実行、全考点): jp 0 / zh 0 / en 0 (上限 2)。
9. **D-202 / D-203 / D-204 単元全体点検**: 書き方 7 (欄同士の「〜だけ」「〜ではない」の照合: terms[1].points[0]「リスク対応は含まれない」と fig node n4「アセスメントの後」・key_points[1]・goals[1] 一致; terms[3].points[0]「全リスクで同じ技法にそろえる決まりはない」と detail の定量 / 定性 一致; terms[4].points[1]「基準を作る作業は評価の中身ではない」と detail「評価を始める前に組織が決めておく」・key_points[3] 一致; pairs[1].rows[1] 分析 = 基準と比較しない と terms[3].points[0]「比べられる形で決める」は衝突しない) → 不整合 0。D-204 比喩・hook 点検: 5 比喩・4 hook の像・結論を同じ用語の考点・detail と照合 — 否定内容の運搬 0 (分析の比喩 en の動詞の揺れは L2、jp / zh は「見積もる / 估量」で分析の範囲内)。書き方 8 (対比の出現欄を列挙) → L6。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → 比喩はいずれも別場面で定義の言い換えでない (0 件)。§9 言い直し → L5。
10. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 14 種 (情報セキュリティリスク / 脅威 / 情報資産 / 脆弱性 / リスクアセスメント / リスクマネジメント / リスク特定 / リスク分析 / リスク評価 / リスク対応 / 適用範囲 / リスクレベル / 資産価値 / リスク基準) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 5 用語に見出し語の `[[jp:]]` あり (D-202)、zh 訳語が `zh_terms.json` (単元抽出 `zh_terms.unit.json`) に従うこと (信息安全风险 / 风险评估 / 风险识别 / 风险分析 / 风险评价 / 风险应对 / 信息资产 / 适用范围 / 机密性 / 完整性 / 可用性 一致; validate の B6 warn 0 / jp-origin warn 0)。zh の用語衝突 1 件 (detail_zh の「评估」= リスクアセスメントの訳語を分析の下位作業の動詞に使用) → L1。
11. **前回 JP 審査の指摘の解消確認** (`journal.b04-u01-a{1,2}.jsonl` の result 行): a1-r1 MEDIUM (評価 detail の「受け入れ」) → 削除済み・再発なし。a1-r2 MEDIUM ① (評価 points[0] の qid 2017h29h-q063) → qids は 2014h26a-q047 / 2018h30a-q099 のみ、q063 は challenge にのみ残る。a1-r2 MEDIUM ② (2 つのリスクの大きさの見方の橋渡し) → terms[3].detail 2 文目で解消 (ただし動詞が L1)。a1-r1 low (特定 points[0] の qid 過多) → 2021r03-q088 のみに整理済み。a1-r1 low (評価 hook「中に value を含む」) → jp・zh は語源に修正済み、**en は未修正** → L3。loc-review r1 low 6 件 → 全て未適用 (en "natural disasters" は L4、残り 5 件は L7)。a2-r1 low 7 件 → L5 / L6 / L7 に吸収。
12. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 情報セキュリティリスク | OK — exam 2 / 3 題: 脆弱性を脅威が突いて組織が損害を受ける可能性 = リスク、役割の入れ替えは不成立 (2016h28a-q096 正答イ = a 脆弱性・b 脅威・c リスク、誤答は 3 語の入れ替え / 2026r08-q089 正答イ = 原因 = 脅威・弱点 = 脆弱性、誤答 インシデント・リスクとの混同) / 脅威には意図しない自然現象・機器の不調も入り、設定の不備・教育不足は脆弱性 (2018h30a-q067 正答エ 落雷などによる停電 = 脅威、誤答 ア〜ウ は全て守る側の弱点)。「機器の不調」「設定の不備」「教育不足」は題の選択肢より一般化しているが、JIS Q 27000 の脅威 (意図的・偶発的・環境的) / 脆弱性の標準的な区分で正しく、どの誤答肢も支持しない。detail「両方がそろったときにリスクが高まる」・analogy (空き巣 + 壊れた裏口) は one と一致。fig table 3 行 (資産 / 脅威 / 脆弱性) は one・detail と一致 | OK (L5: detail 3 文目) | en "natural disasters" 1 件 | L4, L5 |
| 2 | リスクアセスメント | OK — exam 2 / 5 題: 含まれるのは特定・分析・評価の 3 つで対応は含まれない、優先順位の決定までがアセスメントで対応方法の決定は対応 (2019r01a-q056 正答イ = a・b・c / 2019h31h-q001 正答エ 分析、誤答は 移転・回避・低減 = 対応の手段 / 2021r03-q091 正答イ = a レベル決定・b 要因特定・d 優先順位、c 対応方法の決定は外) / 順序は 特定 → 分析 → 評価 → 対応 (2013h25a-q056 正答イ / 2017h29a-q057 正答エ 分析 → 評価 → 対応; 題の「ISMS の … 対処する活動」の枠は順序の主張に影響しない)。flow steps 4 (特定 → 分析 → 評価 [ここまで] → 対応) は考点と一致。analogy (点検業者は補修の目安と比べ急ぐものを報告するまで) は境界を守る | OK | OK | L6 |
| 3 | リスク特定 | OK — exam 2 / 2 題: アセスメントの最初はリスク特定 (2021r03-q088 正答イ、題の「ISMS の」は考点で外れるが JIS Q 31000 系でも同じ順序で一般化として正しい) / ISMS のリスク特定は適用範囲内の情報の機密性・完全性・可用性の喪失に伴うリスクを洗い出す (2017h29h-q083 正答ウ = 範囲内・完全性; 誤答の「範囲外」「脆弱性」を否定; 限定条件「ISMS の」保持)。detail「ここで漏れたリスクは後の工程でも扱われない」は標準の説明で正しい | OK (図なし = 定義型) | OK | L5 (points[0]), L7 (C/I/A 未定義) |
| 4 | リスク分析 | OK — exam 2 / 4 題 + mix 1: 各リスクのリスクレベルを基準と比べられる形で決め、手法は組織に合うものを選び全リスクで同一技法にそろえる決まりはない (2022r04-q086 正答ア、誤答ウ 同一技法・エ 受容可能か決定 [= 評価] を否定 / 2018h30h-q070 正答エ 組織に適した手法、誤答イ 全リスクを詳細分析も支持しない) / 資産価値・脅威・脆弱性の 3 つが大きさを左右し、他の条件が同じなら資産価値が高いほどリスクも大きい (2014h26h-q072 正答エ が直接支持 / 2019h31h-q068 正答ア、再計算一致 = 3 要素の積; 最大資産価値の B が最優先でないことは限定条件「ほかの条件が同じなら」で正しく扱われ、この限定条件は保持 / 2018h30h-q070 は正答エではなく **誤答ア (資産価値が小さいほどリスク値が大きい) の否定** として支える = 誤答消去の根拠で、正答の主張ではない) / mix: 一覧にする = 特定、大きさを付ける = 分析。fig 2 × 2 (起こりやすさ × 影響 → 低 / 中 / 高) は one と一致、detail が 3 要素との対応を橋渡し | OK | detail_zh 用語 1 件・analogy_en 動詞 1 件 | L1, L2, L6 |
| 5 | リスク評価 | OK — exam 2 / 2 題 + mix 1: 分析で算出した大きさを前もって決めた基準と比べ重大さと優先順位を決める (2014h26a-q047 正答ウ 評価、誤答 対応・特定・分析; 限定条件「算定された」「与えられた基準」保持 / 2018h30a-q099 正答ア = a 事前基準による優先順位付け、b 洗い出し = 特定・c 基準を定める は外) / 基準そのものを作るのは評価の中身ではなく事前に用意 (2018h30a-q099 c を否定) / mix: 見積もりまで = 分析、基準に照らして要否 = 評価。detail「受け入れてよいかなどを示す物差し」はリスク基準の説明で、評価が受容を決めるとは言わない。analogy (合格点と比べ補習の要否と順番) は対応方法を選ばず境界内 | OK | hook_en 1 件 | L3, L5, L6 |

**単元レベル**: goals 3 点・overview_cols 2 (工程での位置 / 主な成果)・overview_rows 5 行・pairs 2 組 (特定 / 分析 3 行 key 1、分析 / 評価 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 5 件 (2013h25a-q056 / 2021r03-q091 / 2017h29h-q063 / 2014h26h-q072 / 2018h30a-q067 — 本文と矛盾なし、§1-5)。key_points[2]「資産価値・脅威・脆弱性の 3 つがリスクの大きさを左右する」は terms[3].points[1] と一致し、terms[3].detail の橋渡しで分析の one (起こりやすさ × 影響) と矛盾しない。ISMS / JIS Q 27000 系の語 (適用範囲・C/I/A の喪失に伴うリスク) は terms[2] の「ISMS の / ISMS では」の下でのみ述べ、一般のリスク特定へ広げていない。事実誤りなし、三語一致 (L2・L3・L4 を除く)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 7 (うち 建議修 4)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[3].detail_jp` / `terms[3].detail_zh` 2 文目 (+ 派生 `explanation_jp/zh`) | a1-r2 MEDIUM の橋渡しとして加えた文が、分析の下位作業を「評価して」と書く。工程「リスク評価」を分析と区別させる単元で、分析の中の作業に「評価」の語を当てるのは用語の混線。zh の「评估」は zh_terms の **リスクアセスメント** の訳語で、混線がより強い (en "rates" は問題なし)。事実誤りではない (a1-r2 修正による新規の措辞級回帰) | jp「資産ごとに資産価値・脅威・脆弱性を**評価して**大きさを求める方法もあり、」→「資産ごとに資産価値・脅威・脆弱性を**見積もって**大きさを求める方法もあり、」/ zh「也有按资产分别**评估**资产价值、威胁和脆弱性来求出风险大小的方法，」→「也有按资产分别**估算**资产价值、威胁和脆弱性来求出风险大小的方法，」/ en 変更なし |
| L2 | LOW **建議修** | `terms[3].analogy_jp/zh/en` | en が jp「見積もる」/ zh「估量」を "deciding how seriously to prepare" (どれだけ備えるかを **決める**) と訳し、分析の比喩が判断 (評価 / 対応の領域) に読める。同じ en の terms[4].points[2] "Estimating the size is as far as risk analysis goes" と食い違う。jp / zh の「備えの重さ」も対応の程度に寄る像なので、出力を「台風の危なさ (= リスクの大きさ)」に絞る。同じ用語の考点・detail が否定する内容ではないため D-204 の medium には当たらない | jp「…を合わせて、**備えの重さを見積もる作業に似ている。**」→「…を合わせて、**その台風がどれほど危ないかを見積もる作業に似ている。**」/ zh「…结合起来，**估量需要做多大程度的防备。**」→「…结合起来，**估量这场台风有多危险。**」/ en "It resembles **deciding how seriously to prepare for an approaching typhoon** by weighing whether it is likely to make landfall together with how much damage it would do if it did." → "It resembles **sizing up how dangerous an approaching typhoon is** by weighing whether it is likely to make landfall together with how much damage it would do if it did." |
| L3 | LOW **建議修** | `terms[4].hook_en` (+ 派生 `memory_hook_en`, `summary.memory_hooks_en[3]`) | a1-r1 low (「中に value を含む」は字面として不正確: e-valu-ation) は jp・zh で語源の言い方に直されたが en が未修正。jp「同じ語源を持つ」と en "has value inside it" の三語不一致 | en "Evaluation **has value inside it**. Link it to …" → "Evaluation **shares its root with value**. Link it to …" |
| L4 | LOW **建議修** | `terms[0].points[1].text_en` | jp「自然現象」を en "natural disasters" (自然災害) と狭めた (loc-review r1 low の未適用)。2018h30a-q067 の正答 (落雷による停電) は含まれるので考点は崩れない | en "…but also unintended events such as **natural disasters** and equipment malfunctions." → "…but also unintended events such as **natural phenomena** and equipment malfunctions." |
| L5 | LOW | `terms[2].points[0]`、`terms[4].points[0]`、`terms[4].detail_jp` 1 文目 / `points[1]` 2 文目 / `key_points_jp[3]`、`terms[0].detail_jp` 3 文目、`terms[0].points[0]` / `terms[1].points[1]` 2 文目 | §9 言い直し (D-203 low): 特定 points[0] と評価 points[0] は各 one の言い直し、「基準は評価前に組織が決める」は detail・points[0]「前もって決めた」・points[1]・key_points の 4 箇所、terms[0].detail 3 文目は terms[1].one の先取り、2 考点の 2 文目は誤答の裏返し (a2-r1 low と同じ)。いずれも引用題と一致し事実は正しい | 記録のみ (考点は qid 付きの事実、削ると引用題の根拠が one だけになる) |
| L6 | LOW | 対比 (a) / (b) の出現欄 (下記列挙) | 書き方 8 (pairs + mix の 2 箇所まで): (a) アセスメント / 対応 の境界、(b) 分析 / 評価 (基準と比べるか) がそれぞれ 2 箇所を超えて述べられる | 記録のみ (各出現の多くは qid 付き exam 考点で、単元の主題そのもの) |
| L7 | LOW | `terms[0].points[1].text_zh`「设置上的疏漏」、`terms[2].analogy_zh`「电车停运」、`pairs[0].rows[0].label_zh`「回答的问题」、`terms[3].one_en` "size of impact"、`terms[3].fig.data.cols[0].en` 全角「＼」、`overview_rows[0].extra_jp/zh/en` (列「主な成果」に「特定の工程で一覧に載る」)、`terms[2].points[1]` の 機密性・完全性・可用性 (単元内未定義)、`overview_rows[3..4]` のリスクレベル (定義は terms[3].one) | loc-review r1 / a2-r1 の low の未適用分 (現地化の自然さ・列見出しとの不一致・定義前使用)。意味の誤りなし | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**:
- (a) アセスメント (評価まで) / リスク対応 (方法の選択): `terms[1].points[0]` (exam, q056/q091)、`terms[1].points[1]` 1 文目 (exam, 順序)、`terms[1].detail` (手を打つ前の段階)、`terms[1].fig.nodes[3]` + `steps[2..3]`、`terms[4].detail` 2 文目 (対応への入力)、`terms[0].detail` 3 文目; 構造欄 `goals_jp[1]`・`overview_rows[1].extra[0]`・`key_points_jp[1]` は u06 の読みどおり数えない → pairs に無い対比が 5 欄超 → L6。
- (b) 分析 (見積もり・基準と比べない) / 評価 (基準と比べて決める): `pairs[1].rows[0..2]`、`terms[4].points[2]` (mix)、`terms[4].one` (「分析で求めた」)、`terms[4].points[0]`、`terms[3].points[0]` (「比べられる形で」、q086 の事実)、`terms[1].fig.nodes[1..2]` → L6。
- (c) 特定 (一覧) / 分析 (大きさ): `pairs[0].rows[0..2]`、`terms[3].points[2]` (mix); 総表 overview_rows[2..3] は D-195 §3 の構造 → 許容。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿、B2 審査済み)。事実は正しい。
- O2 2019h31h-q068 は資産 A〜D の積の比較で「最優先でリスク対応すべき」と結論する題で、分析 (積) と評価 (順位付け) をまたぐ。terms[3].points[1] は 3 要素が大きさを左右する部分だけを主張しており、評価の考点 terms[4].points[0] (優先順位) と合わせて解ける → 引用は妥当。
- O3 独立 copy 照合の 6 ヒットは見出し語 3 つの連なりの偽陽性、目視の近接 3 件 (q047 / q083 / q056・q091) は JIS の定義・条文の標準表現または題の問い方の共有で写しではない (§1-6)。

確認済みで問題なし: 工程の境界 (評価が受容・保有を決めると読める欄 0)、限定条件 (考点 10 件全て保持、§2)、§9 禁止句 grep (定型締め句 0、ヒットは全て通常用法)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤89 字)、図の文字列の写し (validate 0、独立照合は偽陽性のみ)、`[[jp:]]` 原語 (14 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (5/5)、zh 訳語表 (B6 warn 0)、図種 (static table ×2 / flow steps ×1 / 図なし ×2 = 登録内)、派生フィールド一致 (54 組 0 不一致)、用語・`term_zh`・`term_en` の v1 不変量、前回 JP 審査 MEDIUM 3 件の解消。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **7** (建議修 4: L1〜L4 / 記録のみ 3: L5〜L7) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 12 件 (qid 付き 10 件)・引用 14 題 + 未引用の quiz / challenge 2 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。工程の境界 (特定 → 分析 → 評価 | 対応) は detail / fig / points / key_points / pairs / 比喩で一貫し、評価が受容を決めると読める欄は無い。LOW 建議修 4 件 (L1〜L4、いずれも 1 欄内の文字列置換) は補丁 (B3) で修正推奨、L5〜L7 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-62-u01
✓ technology-23-62-u01 unit: 0 issues (data/ip/textbook/units/technology-23-62-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-62-u01
✓ technology-23-62-u01 parity: 25 locations, 0 diff
EXIT=0
$ npx tsx (validateV2.pointFraming over all terms[].points[].text_*)
{ jp: 0, zh: 0, en: 0 }
```
