# Rule A 全数抽検 — technology-23-62-u05 (セキュリティ推進の組織体制)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 修正案の検証は scratchpad の複製で実施)。
- **Date**: 2026-10-29 (S138 第 4 批 b04)、repo HEAD `0b3bc55` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b04-u05-a1` merge 結果、`.planning/v2/technology-23-62-u05/merged.json` とバイト一致、sha256 先頭 `835dab291383584d`)。
- **対象**: `data/ip/textbook/units/technology-23-62-u05.json` (textbook-unit-v2)、用語 **3 / 3 = 全数** (情報セキュリティ委員会 / CSIRT / SOC) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、S135 補足 D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 (one_zh / one_en の `[[jp:]]` 見出し語、書き方 7 欄同士の整合・8 同じ対比 ≤2 箇所・9 引用題の限定条件)、D-203 (観点 8 対比反復・§6 比喩が定義の言い換え・§9 考点が one / detail の言い直し = low、観点 7 = medium [事実誤りなら high]、観点 9 限定条件落ち = high)、D-204 (S138 §2-3: 比喩・hook の像や結論が、同じ用語の考点・detail が否定する内容を運べば medium)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `data/ip/textbook/.planning/v2/technology-23-62-u05/v1-original.json` (用語 3 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 3 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_* / overview.intro_*`) が本体の記法除去版 (`**` 除去、`[[jp:X]]` → X) であることをスクリプトで確認 (45 組、不一致 0)。情報セキュリティ委員会 (terms[0]) には `hook_*` が無い (JP 審査 r1 low「会 = 会議の会」は定義の言い直し → 削除済み; 派生 `memory_hook_*` は空文字、`summary.memory_hooks_*` は 2 件) — schema 上任意で validate 0、指摘しない。
2. **考点 × 引用題 (考点 全 4 件 = exam 1 + mix 3、qid 付き 2 件、引用 qid 延べ 5 件 = 異なり 3 題)**: `data/ip/quiz/questions.json` から各題の題文・選択肢・`correct_answer` を再読 (全題 topic `technology-23-62`)。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化をしていないこと、題の場面・前提 (限定条件) を外していないことを 1 件ずつ確認。**題の母集団**: topic 内 135 題 + 全題を「委員会 / SOC / CSIRT / シーサート」で検索 → CSIRT の 3 題 (2017h29h-q067 / 2018h30a-q098 / 2025r07-q068) のみ。情報セキュリティ委員会・SOC を直接問う題は 0 (「変更管理委員会」2 題は management-10-27 で無関係)。manifest の `term_questions` (委員会 0 / CSIRT 3 / SOC 0) と一致。
3. **役割の境界 (委員会 = 方針の決定 / CSIRT = 起きたインシデントへの対応・窓口 / SOC = 常時監視・検知) の横断点検** (呼出元の注意点): 三者の役割は one / overview_rows / pairs[0..1] / key_points / 図 / 考点で入れ替わり 0。CSIRT の one・考点・図・比喩はいずれも「事後の対応」で、SOC 側の「常時監視」を CSIRT に、CSIRT 側の「対応」を SOC に帰す欄は無い (SOC の考点「主に受け持つのは CSIRT」の「主に」、detail「CSIRT **など**の対応組織へ」で限定)。組織形態の必須化 0: CSIRT detail 3 文目「常設する形のほか、事故のたびに…編成する形もある」、SOC detail「24 時間体制…**ことが多い**」「外部の専門事業者に委託する**場合もある**」、委員会 detail「委員長は…**ことが多く**」。境界の揺れ 2 件 (pairs[1].rows[1] の「CSIRT = 知らせを受けて動く / SOC = 平常時から動き続ける」が CSIRT を平常時に何もしない組織と読ませる → L2; overview_rows[2] / pairs[0].rows[2] / pairs[1].rows[2] の範囲の言い切り → L8)。
4. **委員会と「情報セキュリティ方針」の確立者 (単元をまたぐ点検)**: one_jp は委員会が「組織全体の**情報セキュリティ方針**や重要な対策を審議して決める」とする。前提単元 u04 の 情報セキュリティ方針 exam 考点は「方針は経営トップ (トップマネジメント) が自ら確立する」(2015h27a-q062 / 2017h29a-q068 / 2018h30h-q093)。topic 内の方針の題 25 題を再読し、誤答肢 (部門ごとに策定・各職場の管理者が承認・CISO や IT 部門に全て任せる 等 = 2017h29a-q068 エ / 2018h30h-q093 エ / 2025r07-q084 エ / 2026r08-q079 ア・イ) を u05 の欄が支持するか確認 → **支持なし** (one は構成員に経営層を含め「組織全体の」方針と言い、detail は委員長 = 経営者 / CISO)。ただし「経営トップが確立・承認する」が単元内に無く、委員会 = 部門責任者の合議で方針が決まる、と読む余地が残る (比喩の「先生たちが集まって…決める」もこの像を強める) → 単元内欄同士の不整合ではないので観点 7 の medium には当たらず、**L1 (建議修)**。修正の追加句「経営トップの承認を経て」は topic 内の正答 2011h23a-q083 イ (組織のトップが承認)・2011h23tokubetsu-q063 イ (経営層が承認) が支持し、one の「審議して決める」(委員会で決め、トップの承認を経て伝達) と衝突しない。
5. **quiz / challenge_questions** (quiz 計 3 枠 [CSIRT のみ] + challenge 3 題、全て本文で引用済み): v1 の challenge 5 題 (2009h21a-q056 方針 / 2009h21h-q039 CIA / 2010h22a-q053 / 2010h22h-q061 ポリシー階層 / 2011h23a-q013) は本単元の用語と無関係で、v2 は CSIRT の 3 題 (= CONFIRM.min 3) に置換 — 単元に合う。v1 の inline_quiz の誤配 (委員会に q098・SOC に q068) も CSIRT に集約済み。**未引用の関連題** 2021r03-q081 (J-CRAT の説明; 正答エ = 標的型攻撃の被害低減・連鎖遮断の支援、誤答ア = 24 時間体制の監視サービス [SOC 型]、イ = 自ら主体となって対応方針を策定): u05 の SOC = 監視・CSIRT = 組織内の対応、の記述は J-CRAT に触れず、エへの到達を妨げない (アを SOC 型の説明と見抜く助けにはなる)。
6. **D-198 写し**: validate の copy guard (本文 + 図ラベル・caption・総表・対比表) = 0 件。独立照合として単元の JP 文字列 61 本 (派生フィールド・source_figures 除く) を topic 内全 135 題の題文 + 選択肢と 12 字連続照合 (句読点・記号・空白・長音除去、カタカナ 4 字以上と英数を □ 1 字に遮蔽、遮蔽後の実字 6 未満の窓は除外):
   - 見出し語を遮蔽しない (validate より厳しい) → **0 件**。見出し語を遮蔽 → 0 件。
   - **近似一致 (12 字窓で 1〜2 字の置換、遮蔽なし)** → 22 件 (異なり 3 型)、**全て偽陽性**: ① `terms[0].one_jp`「(組織)全体の情報セキュリティ方針」↔ 11 題 (2015h27a-q062 / 2017h29a-q068 / 2021r03-q096 等) — 一致部は用語「情報セキュリティ方針」(u04 の見出し語、zh_terms 収載) + 前後 1〜2 字の助詞。② `terms[1].points[1].text_jp`「ISMS は情報セキュリテ(ィ)」↔ 2015h27a-q062 / 2020r02o-q084「ISMS の情報セキュリテ(ィ)」— 用語の連なり。③ 同考点「(仕)組みマネジメントシステム」↔ 9 題 (情報セキュリティマネジメントシステム 等) — 用語名。同考点「を継続的に管理するための」↔ 2015h27h-q075「を継続的に改善するための」(1 字置換、PDCA の A を問う題) は ISMS の標準定義の言い方で、u04 の detail も「情報セキュリティを組織として継続的に管理する仕組み」と同じ表現 → D-198「標準的な定義・原則の一般表現は写しではない」。
   - **カタカナの多い文の目視** (遮蔽で窓が切れる箇所): `terms[1].points[0]`「影響の範囲を調べ、被害の広がりを抑える」/ `fig.steps[1..2].caption_jp`「どこまで影響が及んでいるか」「被害が広がらないよう封じ込め」/ `overview_rows[1].one_line_jp` ↔ 2017h29h-q067 (被害の拡大を防止する活動)・2025r07-q068 ウ (影響範囲を調査・被害拡大を防止する対策実施を支援) — 語を「範囲を調べ / 広がりを抑える」に置き換え、題の「対策実施を支援する」の連なりを使わない (JP 審査 r1 low「調査 → 対策 → 支援の順序をなぞる」は r1 改稿で「支援」を外し解消)。CSIRT の定義の一般表現で写しではない。`terms[2].detail_jp`「24 時間体制で監視を続ける」↔ 2021r03-q081 ア (24 時間体制でネットワーク・デバイスを監視するサービス) — 共通部は「24時間体制で」+「監視」の定型句、12 字窓なし。`terms[1].detail_jp`「不正アクセスやマルウェア感染など」は topic 内の題に同じ連なりなし。
   - (iii) 具体例の流用: 引用 3 題は場面を持たない (定義・活動例を問う) ため流用の対象になる具体例は無い。誤答肢の語 (MVNO / ISP / ディジタルフォレンジックス / パッチの定期適用 / BCP / 入退室の監査) は本文に不使用。比喩 (学校の職員会議・病院の救急チーム・気象台) はいずれも引用題に無い場面。
7. **D-195**: 結論先行 (one = 1 文 × 3、太字あり)、展開 2〜3 文 (2/3/3 文)、比喩・フックが定義の言い換えでないこと (比喩 3 つは別場面; hook 2 つは頭字語の展開 [IRT = Incident Response Team / O = Operation] で別の手がかり)、定義前使用 (CISO = 委員会 detail の括弧注、インシデント = CSIRT detail 1 文目 [前提 u04 の見出し語でもあり、overview / goals での先出しは許容]、ISMS / マネジメントシステム = CSIRT points[1] 内で定義 [u04 でも定義済み]、SOC の「ログ」は一般語)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → `freq_badge`「頻出」と「**重要な対策**」12 件 [overview_rows[0].one_line_jp・terms[0].one_jp・pairs[0].rows[0].a_jp・key_points_jp[0] + 派生・zh 対応語] のみ。後者は「key measures」の内容語で定型締め句「重要である」ではない → 偽陽性。zh・en 相当語 [必须 / 考试 / 一定 / 务必 / must / always / exam / important / never] のヒットは `"kind": "exam"` のキーのみ → 0)、図の型 (CSIRT = flow steps 4 [受付 → 分析 → 封じ込め・復旧 → 再発防止]、委員会・SOC = 図なし; 登録内。SOC の static flow 図は JP 審査 r1 medium で削除済み、§0-8 により欠如は指摘しない)、pair 配置 (委員会 / CSIRT は CSIRT の後、CSIRT / SOC は SOC の後、各組 key 行 1)。
8. **D-200**: 考点数 1/2/1 (≤3 ✓)、各 JP 文数 1〜2・字数 59〜62 (≤100 ✓、最大は CSIRT points[0] と SOC points[0] の 62 字)。**framing 件数** (validateV2 `pointFraming` を tsx で直接実行、全考点): jp 0 / zh 0 / en 0 (上限 2)。
9. **D-202 / D-203 / D-204 単元全体点検**: 書き方 7 (欄同士の「〜だけ」「〜ではない」「主に」の照合: SOC points[0]「主に受け持つのは CSIRT」と SOC detail「CSIRT などの対応組織へ知らせる」・pairs[1].rows[2] (言い切り、L8)・key_points[2]「対応組織へ」一致; CSIRT points[1]「ISMS は…組織の名前ではない」と他欄に ISMS = 組織とする記述なし; 委員会 points[0]「調査や復旧にあたる組織は CSIRT」と CSIRT one / 図 一致) → 単元内の不整合 0 (範囲の言い方のずれは L8)。D-204 比喩・hook 点検: 3 比喩・2 hook の像・結論を同じ用語の考点・detail と照合 — 否定内容の運搬 0 (職員会議の像の不正確さは L4、考点・detail が否定する内容ではない; 救急チームの「落ち着いた後で原因を調べ…助言」は図 step 4 と一致; 気象台の「警報を出して自治体の対応につなげる」は SOC → CSIRT の引き渡しと一致し、SOC が自ら対応するとは言わない)。書き方 8 (対比の出現欄を列挙) → L7。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → 比喩はいずれも別場面で定義の言い換えでない (0 件)。§9 言い直し → L6。
10. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 3 種 (情報セキュリティ委員会 / インシデント / マネジメントシステム) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語併記 (D-202): 委員会 = `[[jp:情報セキュリティ委員会]]` あり、CSIRT / SOC = かな・漢字を含まない見出し語で本文中の同表記が原語を兼ねる (validateV2 `hasJpOrigin` の規定どおり、validate 0)。zh 訳語が `zh_terms.json` (単元抽出 `zh_terms.unit.json`) に従うこと (信息安全委员会 / CSIRT（计算机安全事件响应组） / SOC（安全运营中心） / 信息安全方针 / 恶意软件 一致; インシデント は収載外で「事件」[u04 の 信息安全事件 と整合]; validate の B6 warn 0 / jp-origin warn 0)。loc 審査 r1 の low 5 件は全て未適用 → L3 (en の不自然な語順、建議修) / L9 (残り、記録のみ)。
11. **前回 JP 審査の指摘の解消確認** (`journal.b04-u05-a1.jsonl` の result 行): r1 medium (SOC の static flow 図) → `terms[2].fig = null` で解消。r1 low (CSIRT の列挙 3 回反復) → detail 2 文目は「窓口・対応の中心」に改稿、図 4 段と key_points[1] の順序列挙の反復は解消 (窓口の 3 回反復は r2 low として残る → L6)。r1 low (考点が正答の項目順をなぞる) → 「支援」を外し解消 (§1-6)。r1 low (委員会 hook が定義の言い直し) → hook 削除で解消。r1 low (職員会議の決定権) → 未修正 → L4。r1 low (u04 インシデント図と同型) → caption に「CSIRT が窓口」「監視部門からの知らせ」を入れて本単元固有の点を出した。r2 low 4 件 → L5 / L6 / L8 に吸収。

## 2. 用語別判定 (3 / 3)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 情報セキュリティ委員会 | OK — 引用題なし (mix 1、qid なし): 委員会は方針・対策を決める会議体、インシデントの現場で調査・復旧にあたる組織は CSIRT — CSIRT の one・図・2017h29h-q067 / 2025r07-q068 の正答と整合。one「経営層と各部門の責任者が集まり…組織全体の方針…を審議して決める会議体」は標準的な説明で、組織形態を必須とする言い方は無い (委員長「ことが多く」)。方針の確立者 (u04 の「経営トップが確立」) との関係が単元内で明示されない → L1 | OK (図なし = 定義型、hook なし) | OK (zh「经营层」は L9) | L1 (建議修) / L4 (analogy) / L6 (points[0] 1 文目) |
| 2 | CSIRT | OK — exam 1 / 3 題: インシデントが起きた後の対応を受け持ち、影響範囲の調査と被害拡大の抑止が活動の中心 (2017h29h-q067 正答ア CSIRT = 被害の拡大を防止する活動 / 2018h30a-q098 正答ア CSIRT = セキュリティ事故の対応が目的 / 2025r07-q068 正答ウ = 影響範囲の調査と被害拡大防止の対策実施の支援; 誤答ア パッチの定期適用 [平常時の運用]・イ 自然災害の BCP・エ 入退室記録の監査 を「事後の対応」で全て否定)。q068 の「支援」は正答の言い方で題の前提 (場面・条件) ではなく、q067 は CSIRT 自身が被害拡大防止の活動を行うと直接言うため、考点の「抑えることが活動の中心」は限定条件落ちに当たらない (one / 図 step 3 の「復旧を担う / 元の状態に戻す」のニュアンスは L5) / mix: ISMS は管理の仕組みで事故対応組織の名前ではない (2017h29h-q067・2018h30a-q098 の誤答イ ISMS を否定)。flow steps 4 (受付 → 分析 → 封じ込め・復旧 → 再発防止) は one・detail・goals[1] と一致 | OK | OK (one_zh の `[[jp:インシデント]]` 欠落は L9) | L5 / L6 / L7 / L8 / L10 |
| 3 | SOC | OK — 引用題なし (mix 1、qid なし): SOC は平常時から監視して異常を見つけ、見つかったインシデントへの対応を**主に**受け持つのは CSIRT — 限定「主に」あり、detail「CSIRT などの対応組織へ知らせる」と整合。one「通信・ログを常時監視し、攻撃の兆候を検知・分析する組織」・detail の「24 時間体制…ことが多い」「委託する場合もある」は一般に正しく、形態を必須化しない。未引用の 2021r03-q081 (誤答アが SOC 型サービス) とも矛盾なし | OK (図なし) | 総表 extra_en の語順 → L3 | L2 (pairs) / L3 / L6 / L8 |

**単元レベル**: goals 3 点 (各用語 1 点、本文で全て説明可能)・overview_cols 2 (役割の中心 / 動き方)・overview_rows 3 行・pairs 2 組 (委員会 / CSIRT 3 行 key 1、CSIRT / SOC 3 行 key 1)・key_points 3・summary (記法除去版と一致)・challenge_questions 3 件 (= quiz の 3 題、§1-5)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 10 (うち 建議修 3)** + 範囲外観察 4

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[0].detail_jp/zh/en` 1 文目 (+ 派生 `terms[0].explanation_jp/zh/en`) | one が委員会を「経営層と各部門の責任者が集まり…**情報セキュリティ方針**…を審議して決める」とする一方、前提単元 u04 の頻出考点「方針は経営トップ (トップマネジメント) が確立する」(2015h27a-q062 / 2017h29a-q068 / 2018h30h-q093) との関係が本単元に無い。誤答肢 (部門ごとに策定・各職場の管理者が承認) を支持する欄は無い (経営層を含む・組織全体の方針) が、「部門責任者の合議で方針が決まる」と読む余地がある。単元をまたぐ食い違いで単元内欄同士の不整合ではない → low。追加句は topic 内正答 2011h23a-q083 イ・2011h23tokubetsu-q063 イ (トップ / 経営層が承認) が支持 | jp「…務めることが多く、決めた方針は各部門や実務を担う組織へ伝えられる。」→「…務めることが多く、決めた方針は**経営トップの承認を経て、**各部門や実務を担う組織へ伝えられる。」/ zh「…担任，决定的方针会传达给各部门和负责实务的组织。」→「…担任，决定的方针**经最高管理层批准后，**传达给各部门和负责实务的组织。」/ en "…, and the policies it agrees on are passed down to each department…" → "…, and the policies it agrees on are **approved by top management and then** passed down to each department…" (explanation_* は同じ置換、`**` なし) |
| L2 | LOW **建議修** | `pairs[1].rows[1].a_jp/zh/en`、`b_jp/zh/en` | 行「動く時」で CSIRT =「通報や検知の知らせを受けて動く」/ SOC =「平常時から絶えず動き続ける」と対置し、CSIRT は平常時に活動しない組織と読める (実際の CSIRT は平常時にも情報収集・共有・訓練などを行い、本単元の図 step 4 も再発防止策のとりまとめを含む)。役割の過度の一般化 (呼出元の注意点)。対比の軸を「対応の開始 / 監視の継続」に絞る。考点・detail が否定する内容ではないので medium には当たらない | a_jp「通報や検知の知らせを受けて動く」→「通報や検知の知らせを受けて**対応に入る**」/ b_jp「平常時から絶えず動き続ける」→「平常時から絶えず**監視を続ける**」/ a_zh「接到报告或检测通知后行动」→「接到报告或检测通知后**开始应对**」/ b_zh「平时就持续不断地运转」→「平时就持续不断地**监控**」/ a_en "Acts on reports or detection alerts" → "**Starts responding** on reports or detection alerts" / b_en "Runs constantly, even in normal times" → "**Keeps monitoring** constantly, even in normal times" |
| L3 | LOW **建議修** | `overview_rows[2].extra_en[1]` | "Keeps watch without a break in shifts" は語順が不自然で "without a break" と "in shifts" のつながりが読めない (loc 審査 r1 low の未適用) | en "Keeps watch without a break in shifts" → "Works in shifts to keep constant watch" |
| L4 | LOW | `terms[0].analogy_jp/zh/en` | 学校の職員会議は制度上は校長の補助機関で、「先生たちが集まって…決める」は決定権を持つ会議体という像と少しずれ、構成員も経営層を含まない (JP 審査 r1 low の未修正)。授業は担任 = 実務は現場、の対比は正しく、考点・detail が否定する内容は運ばない (D-204 非該当) | 記録のみ (L1 の修正で方針の承認者が本文に入れば、比喩のずれの害はさらに小さい) |
| L5 | LOW | `terms[1].one_jp/zh/en`「復旧を担う」、`terms[1].fig.steps[2].caption_*`「システムを元の状態に戻す」 | 2025r07-q068 の正答は対策実施の「支援」で、復旧作業そのものはシステム担当部門が行うことも多い (JP 審査 r2 low)。CSIRT が封じ込め・復旧を担うという説明は一般の教科書・NIST のインシデント対応の流れと一致し誤りではなく、誤答肢も支持しない。考点 points[0] は「抑えることが活動の中心」で q067 が直接支持 → 限定条件落ち (rule 9) ではない | 記録のみ |
| L6 | LOW | `terms[0].points[0]` 1 文目、`terms[1].points[0]` 1 文目、`terms[2].points[0]` 1 文目、「CSIRT が窓口」= `terms[1].fig.steps[0].caption_*` / `terms[1].detail_*` 2 文目 / `key_points_*[1]`、`terms[1].hook_*` の正式名 (detail 1 文目と重複) | §9 言い直し (D-203 low): 3 考点の 1 文目は各 one の言い直しで、判別点は 2 文目 (CSIRT / SOC との区別) にある。窓口の 3 回反復は JP 審査 r2 low | 記録のみ (1 文目を削ると考点が対比の片側だけになる) |
| L7 | LOW | 対比 (a) / (b) の出現欄 (下記列挙) | 書き方 8 (pairs + mix の 2 箇所まで): (a) CSIRT / SOC (対応 / 監視、SOC → CSIRT の引き渡し)、(b) 委員会 / CSIRT (決定 / 現場の対応) が 2 箇所を超えて述べられる | 記録のみ (単元の主題が三者の役割分担そのもの) |
| L8 | LOW | `overview_rows[2].extra_jp/zh/en[1]`「交代制で絶えず見張る」、`pairs[0].rows[2].b_*`「セキュリティの専門知識を持つ担当者」、`pairs[1].rows[2].a_*` / `b_*` (SOC ↔ CSIRT を言い切り) | 範囲の言い方のずれ: detail は「24 時間体制…ことが多い」「関係部門から人を集めて編成する形もある」「CSIRT **など**の対応組織」と幅を持たせるが、総表・対比表は無条件 (JP 審査 r2 low 2 件 + 同型 1 件)。表の簡約として許容範囲、誤答を招く場面なし | 記録のみ |
| L9 | LOW | `terms[1].one_zh` (`[[jp:インシデント]]` なし、en はあり)、`terms[0].one_zh` / `pairs[0].rows[2].a_zh`「经营层」・`terms[0].detail_zh`「经营者」、`terms[1].detail_zh` / `fig.steps[0].caption_zh` / `key_points_zh[1]`「窗口」、`terms[0].one_en` 等の小文字 "information security committee" | loc 審査 r1 low の未適用分 (三語の併記の揃え・日式借词・大文字小文字)。意味のずれなし、validate の jp-origin warn 0 | 記録のみ |
| L10 | LOW | `terms[1].detail_jp/zh/en` 1 文目 | 「インシデントとは…情報セキュリティを損なう事故や出来事」は、前提 u04 の定義 (情報セキュリティ事象のうち事業・情報の安全を損なう可能性が高いと評価されたもの) より広い言い方。CSIRT の説明としては十分で、u04 の事象 / インシデントの区別を否定はしない (単元をまたぐ措辞) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: (a) CSIRT = 対応 / SOC = 監視・引き渡し: `pairs[1].rows[0..2]`、`terms[2].points[0]` (mix)、`terms[2].detail` 2 文目、`terms[1].fig.steps[0].caption` (監視部門からの知らせ)、`key_points[2]`、`terms[2].analogy` (警報 → 自治体の対応)、`goals[2]` (観点の予告) → L7。(b) 委員会 = 決定 / CSIRT = 現場の対応: `pairs[0].rows[0..2]`、`terms[0].points[0]` (mix)、`terms[0].analogy` (会議 / 各教室の授業)、`terms[0].detail` 1 文目 (実務を担う組織へ伝える) → L7。overview 総表の列 (D-195 §3 の構造) は数えない。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。事実は正しく、D-197 対象外フィールド。
- O2 `source_figures[0]` = 2010h22h-q061 (ポリシー文書の階層図) は v1 からの継承で、本単元の 3 用語と無関係 (u04 の情報セキュリティポリシー考点の引用題)。本文の図には使われていない。B2 範囲外。
- O3 CSIRT の「外部との情報共有・連携」(他組織の CSIRT・調整機関との連絡) は本文で「社内外からの通報の窓口」までしか述べない。引用 3 題が問わない範囲の省略で誤りではない。
- O4 §9 grep の「重要」12 件は「重要な対策 / 重要对策」の内容語、近似一致 22 件は用語名 / 標準定義の偽陽性 (§1-6)。

確認済みで問題なし: 三者の役割の入れ替わり 0・組織形態の必須化 0 (§1-3)、限定条件 (qid 付き考点 2 件とも保持、§2)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤62 字)、写し (validate 0、独立照合 0、近似一致は偽陽性のみ)、`[[jp:]]` 原語 (3 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (3/3、CSIRT・SOC はラテン文字見出し語の規定)、zh 訳語表 (B6 warn 0)、図種 (flow steps ×1 / 図なし ×2 = 登録内)、派生フィールド一致 (45 組)、用語・`term_zh`・`term_en` の v1 不変量、JP 審査 r1 medium の解消。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **10** (建議修 3: L1〜L3 / 記録のみ 7: L4〜L10) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 3 用語・考点 4 件 (qid 付き 2 件)・引用 3 題 (= quiz / challenge の全題) + 未引用の関連題 2021r03-q081 と方針の題 25 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。委員会 / CSIRT / SOC の役割は全欄で入れ替わらず、組織形態を必須とする言い方も無い。LOW 建議修 3 件 (L1〜L3、いずれも 1 欄内の文字列置換; scratchpad の複製に 13 文字列を適用し `--file` で validate 0 issues / parity 19 locations 0 diff を確認済み) は補丁 (B3) で修正推奨、L4〜L10 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-62-u05
✓ technology-23-62-u05 unit: 0 issues (data/ip/textbook/units/technology-23-62-u05.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-62-u05
✓ technology-23-62-u05 parity: 19 locations, 0 diff
EXIT=0
# 修正案 L1〜L3 適用後の複製 (scratchpad、単元ファイルは不変)
$ node --no-warnings scripts/textbook-v2-validate.mjs --file <scratchpad>/patched.json --manifest data/ip/textbook/.planning/v2/technology-23-62-u05/manifest.json
✓ technology-23-62-u05 unit: 0 issues
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --file <scratchpad>/patched.json
✓ technology-23-62-u05 parity: 19 locations, 0 diff
EXIT=0
```
