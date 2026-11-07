# Rule A 全数抽検 — management-11-30-u01 (ファシリティマネジメント:電源対策と省エネ)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S150 第 57 批 b57)、repo HEAD `1cf1dd1e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b57-u01-a1` merge 結果、sha256 先頭 `66bfc9a5991692e3`)。
- **対象**: `data/ip/textbook/units/management-11-30-u01.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (無停電電源装置 / UPS / 自家発電装置 / サージ防護 / グリーンIT) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205 (S138 §2・§6)、D-208 / D-209 (既知の失敗型 (1)〜(10))、D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/management-11-30-u01/v1-original.json` (用語 5 語・`term_zh`・`term_en`・`unit_summary_jp` とも v1 と一致)。前回指摘: `journal.b57-u01-a1.jsonl` の jp-review r1 (REVISE: MEDIUM 4) / r2 (PASS: LOW 6) / loc-review r1 (PASS: LOW 7)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生 `definition_*` が `one_*` の記法除去版であることをスクリプトで確認 (不一致 0)、`summary.*` / `overview.intro_*` も本体と一致。
2. **考点 × 引用題 (考点 全 6 件 = exam 5 + mix 1、qid 付き 5 件、引用 qid 延べ 9 = 異なり 9 題)**: `data/ip/quiz/questions.json` の各題 (全題 topic `management-11-30`) を `stem_jp_clean` で再読し、`correct_answer` と照合。考点の主張が正答と一致し、誤答肢を支持せず、限定条件を外していないことを 1 件ずつ確認 (§2)。
3. **quiz / challenge_questions** (quiz 計 10 枠 = 異なり 10 題、challenge 5 題、本文で未引用は 2011h23a-q043 / 2018h30h-q095 / 2023r05-q048 / 2013h25a-q049 / 2015h27h-q036): 2011h23a-q043 (正答 = 停電時の一時的な給電と瞬間的な電圧低下の防止; 誤答 = 長時間停電での継続・携帯の予備電池・野外での長時間使用) は detail「数分から数十分程度」・analogy「しばらく点き続ける」・pairs[0].rows[1]「短時間」で解ける (one 単独の読みは L1)。2018h30h-q095 (サーバの給電停止リスク低減 = UPS) / 2023r05-q048 (建物・設備を最善に保つ考え方 = FM、停電時に一定時間給電 = UPS) は terms[0] one・detail と一致。2013h25a-q049 / 2015h27h-q036 (FM = データセンタの冷却・電源・入退館など物理的環境 / 施設の管理) は terms[0].detail の FM 定義「建物や設備を良好な状態に保つ活動」で解ける (入退館の扱いは L6)。topic 内の未収録 12 題 (2009h21a-q040 / 2010h22h-q039 / 2012h24a-q040 / 2013h25h-q045 / 2015h27a-q040 / 2016h28a-q037 / 2024r06-q043 ほか) も読み、本文と矛盾しないことを確認 (例: 2013h25h-q045 は長期停止への備え = 遠隔地バックアップで UPS は誤答 — 本文は UPS を短時間用と限っており支持しない。2015h27a-q040 では省電力機器は「安全性」の施策ではない — 本文は省エネを安全性と結び付けていない)。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合として単元の JP 文字列 81 本 (派生除く) を topic 内全 27 題の題文 + 選択肢と 12 字連続照合 (句読点・記号・空白除去):
   - カタカナ 4 字以上・英数を □ に遮蔽 (実字 6 未満の窓は除外) → **0 件**。
   - 遮蔽なし → **6 件、全て偽陽性**: title / terms[0].detail / terms[0].points[0] / terms[2].points[1] / terms[4].points[0] / key_points[0] ↔ 2009h21a-q040 等で、一致部は全て語「ファシリティマネジメント」(12 字) そのもの。用語名で表現ではない。
   - 1〜2 字置換の近似 (12 字窓 hamming ≤2) → 7 件。6 件は上と同じ語の前後 1 字。残る 1 件 `terms[1].points[0].text_jp` ↔ 2017h29a-q074 題文: 窓「…システムを安全に停止さ(せる)」~「…安全に終了さ(せる)」(1 字置換)。jp-review r1 の MEDIUM (検知→通知→給電継続→安全な終了の順なぞり) の後継欄なので回帰として判定: 置き場所・検知・通知の連鎖は消え、残るのは「給電は蓄電池がもつ間だけ → その間に安全に止める」という UPS の一般的な役割 (D-198 の標準原則の一般表現)。写しには当たらないが、目的句の動詞 1 字違いが題文と重なるため L2 (LOW 建議修)。
   - 近似 (ed 比 / Dice): 最良 ed 0.30 (title_jp ↔ FM 題の題文、overview_rows[1].extra_jp[0] ↔ 2022r04-q041 エ「無停電電源装置の設置」— 一致部は見出し語のみ) で、校正値 (HIGH 例 ed 0.14 / Dice 0.52) より遠い。Dice 0.67 は 9 字の短い行 (無停電電源装置と同じ) が見出し語を共有するため。
   - カタカナの多い文の目視 (サージ防護 detail の「サージ防護デバイス(SPD)」、グリーンIT detail の Green of IT / Green by IT、fig ラベル): 題文・選択肢に同じ句なし。
   - (iii) 選択肢なぞり (D-208 (1)): validate の `choice-echo` warn は 0 件。題文側の判定項目も確認 — 2022r04-q046 (a〜d から FM を選ぶ全て選択型、正答 a・d) に対し terms[0].points[0] は d (UPS 設置) だけを「物理的な環境を整える施策 = FM」と一般の役割で述べ、a〜d の組・順・a の語句を再現しない → D-209 の除外。terms[2].points[1] は 3 題 (2014h26h-q045 ア / 2018h30h-q053 ア / 2018h30a-q047 イ) の正答を「設置・燃料の補給・点検による維持管理 = 設備面の対策 = FM」と役割の区別でまとめ、1 題の選択肢の組でも誤答肢でもない → D-209 除外。terms[4].points[0] (2017h29a-q051 イ / 2019h31h-q049 エ) も同様。terms[3].points[0] (mix、qid なし) は 2022r04-q041 の誤答エ (UPS) と対をなすが、両側を肯定の定義で述べる対比で、題の対象 (サテライトオフィス・PC・ネットワーク機器) も選択肢の語形も使わない → D-209 除外。terms[2].points[0] は 2010h22h-q043 の数値 (1 分) と場面 (業務用サーバ・導入予定) を使わない。
5. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 2 文 × 5、比喩・フックが定義の言い換えでないこと (非常灯 / 懐中電灯 + 発電機 / 放水路 / 家電の買い替え + ネット注文; フックは語源 Un+interrupt・字「自家」・surge の語義・前置詞 of/by。UPS は analogy 空)、定義前使用 (蓄電池 = one で使用、ファシリティマネジメント = terms[0].detail で定義、サージ = terms[3].one の括弧、SPD = 名称展開つき、商用電源 = fig caption の括弧注)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が / ポイント / 注意) → 「出る」1 = UPS analogy「外へ出る」(通常の用法)、「覚え」3 = グリーンIT hook「向きを覚える」+ 派生 2 (記憶フックの言い方、4 フック中 1 つで記録なし)。zh / en (考试 / 必须 / 重要 / 记住 / 选项 / exam / must / important / remember / always / option) → `exam` 8 = `kind:"exam"`、`remember` 3 = グリーンIT hook_en + 派生 → 偽陽性。図の型: 自家発電装置 = flow / steps (4 段)、グリーンIT = tree / static; 無停電電源装置・UPS・サージ防護 = 図なし (登録内、validate 0)。pair 配置: pairs[0] 無停電電源装置 / 自家発電装置 (3 行 key 1)、pairs[1] 無停電電源装置 / サージ防護 (2 行 key 1)。
6. **D-200**: 考点数 1/1/2/1/1 (≤3 ✓)、各 JP 1 文・45〜65 字 (≤100 ✓)。**framing 件数** (`validateV2.pointFraming`、全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 → L1・L3・L4 (いずれも LOW)、他に不整合 0 (UPS「短時間」と one/overview「停電の間も給電」、自家発電「長時間」と fig step 4、グリーンIT 2 面と fig 2 枝・key_points[2] は一致)。書き方 8 → L5。書き方 9 → §2 表、落ち 0。§6 → 比喩はいずれも別場面 (指摘なし)。§9 言い直し → L7。
8. **三語**: zh・en が jp と同じ事実か、図ラベル・caption・比較行の三語一致 (parity 0 diff)。`[[jp:…]]` 原語 6 種 (無停電電源装置 / 自家発電装置 / サージ防護 / グリーンIT / ファシリティマネジメント / サージ) は全て jp 本文に実在。one_zh / one_en の見出し語併記 4/4 (UPS はラテン文字の見出し語が三語同一のため併記不要、validate 0)。zh 訳語は `zh_terms.json` / `zh_terms.unit.json` の該当語 (無停電電源装置 / 自家発電装置 / サージ防護 / グリーンIT / 仮想化 / サーバ) が全て一致。validate の warn `terms[3](サージ防護).detail_zh タップ → 轻点` は **偽陽性**: jp は「サージ防護機能を持つ電源タップ」で 電源タップ = 延長コード付きの差込口 (power strip) の意、zh「带浪涌防护功能的电源插排」・en "power strips with built-in surge protection" は正しい。`轻点` はタッチ操作の「タップ」の訳で、unit 用 zh_terms の注 (見出し語の技術的な意味のときだけ使う) どおり適用しない。修正不要 (matcher が語義を区別しない点は範囲外、O1)。
9. **既知の失敗型 (D-208 (1)〜(10))**: (1) §1-4 で判定、該当なし (L2 は (iii) ではなく近似表現)。(2) など落ち: 引用題に「など」の限定は 2017h29a-q074「停電や落雷などによる」・2023r05-q048「建物や設備などの資源」で、本文は電圧異常の原因を限っていない・FM を「建物や設備」と開いた形で述べる → 落ちなし。(3) 別名を別物として教える: 無停電電源装置 / UPS は one・detail・overview_rows[1]「無停電電源装置と同じ」で同一物と明示 → なし。(4) 比喩・図の範囲矛盾: 自家発電 analogy の懐中電灯 = UPS のつなぎで fig と一致、UPS analogy の非常灯 = 一時的 → なし。(5) zh/en 回帰: r1 で消した 4 考点の内容が zh/en に残っていないことを確認 → なし。(6) zh/en の語が誤答肢寄り: one_zh/en も jp と同じ (L1 で三語とも修正案)、goals_zh[1] の「过大电流」は 2022r04-q041 題文の過電流と同方向で誤答寄りではない (L4)。(7) D-210 / (10) 法・規格の閉じた列挙: 単元は法令・規格・ガイドラインを一切名指ししない (grep: 法 / 改正 / JIS / ISO / IEC / 規格 / ガイドライン / 年版 = 0 件; 「省エネ」6 件は一般語)。省エネ法 (2023 年 4 月改正で題名「エネルギーの使用の合理化及び非化石エネルギーへの転換等に関する法律」) への言及も、それを要する引用題も無い → D-205 / D-210 対象外、補丁で追加する必要もない。Green of IT / Green by IT は経済産業省グリーン IT イニシアティブ (2007〜) 以来の一般的な区分で、改訂される文書の構成数ではない (「呼ばれることがある」と開いた書き方)。(8) 比喩の鍵語が他の見出し語: 自家発電 analogy の懐中電灯は UPS の役割を指し、定義と同じ向き → なし。(9) フックを引用題の場面に当てると誤答: 2022r04-q041 (落雷の過電流) に surge フック「押し寄せる波をわきへ流す」→ 正答イ、UPS の非常灯比喩では UPS を選ばない。2010h22h-q043 に自家発電 analogy (懐中電灯でつなぐ) → 正答ウ (UPS)。2011h23a-q043 に UPS analogy (しばらく) → 正答ウ → なし。
10. **前回指摘の解消**: jp-review r1 MEDIUM 4 件 — ① terms[1].points[0] の題文順なぞり → 1 文の一般役割に短縮 (残る近似は L2)、② terms[1].points[1] (2018h30h-q095 の語句の組) → 削除、③ terms[3].points[0] 旧 (2022r04-q041 の対象列挙 + 正答の形) → 削除し mix の肯定対比に置換、④ terms[0].points[0] 旧 (2011h23a-q043 正答ウの 2 項目の組) → 削除し FM 分類の考点に置換。いずれも解消、zh/en への回帰なし。r1 LOW (terms[3].detail 1 文目の対比前置き) → 削除済み。r2 LOW 6 件 → 未修正 (L5・L6・L7 として記録、他は本監査で問題なしと判断)。loc-review LOW 7 件 → 未適用 (zh の 过大电流 2 件は L4 で建議修、他は O2 で記録)。

## 2. 考点 × 引用題 (全数)

| 用語 | 考点 (要旨) と引用題の正答 | 事実 | 限定条件 | 指摘 |
|---|---|---|---|---|
| 無停電電源装置 | one: 蓄電池の電力で停電・瞬間的な電圧低下でも給電を続ける (2011h23a-q043 ウ と一致、時間の限定は detail にあり → L1)。detail: 数分〜数十分・FM の定義。exam: UPS 設置は物理的環境を整える施策で FM (2022r04-q046 イ = a・d の d / 2016h28h-q048 エ) | OK | OK (FM を電源だけに限らない) | L1, L6 |
| UPS | one: 頭文字の略称。detail: 同一物・異常を信号で知らせる製品もある。exam: 給電は蓄電池がもつ間だけ → その時間で安全に停止 (2017h29a-q074 ウ) | OK | OK (通知機能は「製品によっては」、r1 MEDIUM ① の範囲食い違いは解消) | L2, L7 |
| 自家発電装置 | one: 燃料で発電・長時間の停電にも給電。detail: 起動から安定まで時間・燃料備蓄と試運転。exam ①: 起動〜安定の空白を UPS で埋める (2010h22h-q043 ウ; 数値 1 分は不使用)。exam ②: 設置・燃料補給・点検 = 設備面の対策 = FM (2014h26h-q045 ア / 2018h30h-q053 ア / 2018h30a-q047 イ) | OK | OK | L5 |
| サージ防護 | one: 落雷などの瞬間的な過大電圧・電流を逃がし故障を防ぐ (2022r04-q041 イ と一致; 「落雷など」で原因を限らない)。detail: 通信回線経由もある・電源タップ / SPD (事実として正しい: SPD = JIS C 5381 / IEC 61643 系の名称)。mix: UPS = 途絶に備える / サージ防護 = 瞬間的な過大電気に備える (2022r04-q041 の誤答エを支持しない) | OK | OK | L3, L4 |
| グリーンIT | one: IT 機器自体の消費電力削減と IT による環境負荷低減の両方。detail: of / by の呼称・データセンタの冷却電力・まず計測。exam: 電力使用の把握 + 高効率機器への切替 = FM の施策にも当たる (2017h29a-q051 イ / 2019h31h-q049 エ) | OK | OK (「にも」で FM と同一視しない; 2022r04-q041 誤答ア [グリーン IT 対応機器で落雷対策] を支持する記述なし) | L7 (fig) |

**単元レベル**: goals 3 点・overview_cols 2 (備える相手・目的 / 対策の系統)・overview_rows 5 行・pairs 2 組・key_points 3・summary (記法除去版と一致)・challenge_questions 5 件 (2013h25a-q049 / 2014h26h-q045 / 2015h27h-q036 / 2016h28h-q048 / 2018h30a-q047 — 本文と矛盾なし、§1-3)。key_points[0] は FM の対象に電源設備・省エネが「も」入ると開いた形、key_points[1] は電源対策を 2 つの向きに整理、key_points[2] はグリーンIT と設備管理の関係。事実誤りなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 7 (うち 建议修 4)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建议修** | `terms[0](無停電電源装置).one_jp` / `one_zh` / `one_en` (+ 派生 `definition_*`) | one は「停電…が起きても機器へ電力を送り続ける」と時間の限りを言わない。同欄の detail・pairs[0].rows[1] が「短時間」と限るので単元内の矛盾ではないが、用語集など one (definition) 単独で表示される場面では、quiz 2011h23a-q043 の誤答イ (長時間停電でも供給を継続) の方向に読める (観点 7 の措辞級) | jp「停電や一瞬の電圧の落ち込みが起きても機器へ電力を送り続ける装置である。」→「停電や一瞬の電圧の落ち込みが起きても、しばらくの間は機器へ電力を送り続ける装置である。」/ zh「即使发生停电或电压瞬间跌落，也能持续向设备供电。」→「即使发生停电或电压瞬间跌落，也能在一段时间内持续向设备供电。」/ en "to keep feeding equipment even when an outage or a momentary voltage dip occurs." → "to keep feeding equipment for a while even when an outage or a momentary voltage dip occurs." |
| L2 | LOW **建议修** | `terms[1](UPS).points[0].text_jp` / `text_zh` / `text_en` | jp-review r1 MEDIUM ① の後継欄。題文順なぞりは解消したが、結びの「システムを安全に停止させる」が 2017h29a-q074 題文の目的句と動詞 1 字違い (12 字窓 hamming 1)。標準的な一般表現なので写しではないが、前回 MEDIUM の箇所なので題文との重なりを外しておく | jp「UPS の給電は蓄電池がもつ間に限られるので、その時間を使ってシステムを安全に停止させる。」→「UPS の給電は蓄電池がもつ間に限られるので、その時間のうちに正しい手順でシステムを止める。」/ zh「UPS 只能在蓄电池电量耗尽之前供电，因此要利用这段时间让系统安全关闭。」→「UPS 只能在蓄电池电量耗尽之前供电，因此要在这段时间内按正确的步骤关闭系统。」/ en "A UPS supplies power only while its battery lasts, so that time is used to shut the system down safely." → "A UPS supplies power only while its battery lasts, so the system is shut down by the proper procedure within that time." |
| L3 | LOW **建议修** | `overview_rows[3](サージ防護).extra_jp[1]` / `extra_zh[1]` / `extra_en[1]` | 系統列「電源の異常を防ぐ」は、サージ防護が電源側の異常そのものを防ぐように読め、one (逃がして機器の故障を防ぐ)・key_points[1] (異常な電気を機器に入れない備え) とずれる。また UPS も瞬間的な電圧低下 = 電源の異常に備える (one・2017h29a-q074 は電圧の異常 → UPS) ので、列の区別として不正確 (観点 7 の措辞級) | jp「電源の異常を防ぐ」→「異常な電気を機器に入れない」/ zh「防止电源异常」→「不让异常电压、电流进入设备」/ en "Preventing power abnormalities" → "Keeping abnormal electricity out of equipment" |
| L4 | LOW **建议修** | `goals_zh[1]` (+ 派生 `overview.intro_zh`)、`pairs[1].rows[1].b_zh` | jp「過大な電気」(電圧・電流) を zh が「过大电流」「过大的电流」と電流だけに絞る (loc-review r1 LOW の未適用分)。one_zh・mix 考点 zh は「电压、电流」で、zh 内の不一致。2022r04-q041 の題文 (過電流) と同方向なので誤答寄りではない。pairs の「前方」は位置の意味で「届く前に」が伝わりにくい | goals_zh[1]「免受雷击等侵入的过大电流损害的」→「免受雷击等侵入的过大电压、电流损害的」/ pairs[1].rows[1].b_zh「在设备前方将过大的电流导走」→「在到达设备之前将过大的电压、电流导走」 |
| L5 | LOW | `terms[2].detail_jp/zh/en` 1 文目、`terms[2].points[0]`、`terms[2].fig` (steps 2〜4)、`terms[2].analogy_*`、`pairs[0].rows[2]`; および `pairs[1]`・`terms[3].points[0]`・`key_points_*[1]` | 書き方 8: 「自家発電は起動に時間 → UPS がつなぐ」の連携が pairs・考点の 2 箇所を超えて detail・図・比喩にも出る。UPS / サージ防護の対比も pairs[1]・mix 考点に加え key_points[1] で 3 箇所目 (jp-review r2 LOW の未修正分)。事実は 2010h22h-q043 / 2022r04-q041 の正答と一致し、図はこの連携そのものを段階化したもの、key_points[1] は manifest の学習導線 (サージ防護を電源対策の流れで学ぶ理由) を担う | 記録のみ |
| L6 | LOW | `terms[0].detail_*` 2 文目 / `terms[0].points[0]` / `key_points_*[0]` | FM の対象として本文が示す例は電源設備・省エネだけ。引用題 2022r04-q046 (正答 a・d) と challenge 2013h25a-q049 は入退館管理も FM に含める。本文は「主要な対象の一つ」「も」と開いた形で限定はしていない (unsupported restriction ではない) ので、FM の定義「建物や設備を良好な状態に保つ」から a も選べる。入退館を足すと 2022r04-q046 の正答の組 (a・d) をなぞるおそれがあるため改稿しない方が安全 | 記録のみ |
| L7 | LOW | `terms[1].detail_jp/zh/en` 1 文目、`terms[4].fig.data.root.children[1].label` | §9 / D-203: UPS detail 1 文目 (略称なので指す装置は同じ) は one・overview_rows[1] の言い直し。グリーンIT 図の枝「IT による省エネ(Green by IT)」は one の「IT を活用した環境負荷の低減」より狭く、子ノード「書類の電子化で紙を減らす」は省エネより資源削減 (いずれも jp-review r2 LOW の未修正分、「IT による省エネ」は一般的な呼び方でもある) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① UPS = 短時間・即時 / 自家発電 = 長時間・起動に時間: `pairs[0].rows[1..2]`、`terms[2].points[0]`、`terms[2].detail`・fig・analogy (片側 + 連携) → L5。② UPS = 途絶に備える / サージ = 過大な電気に備える: `pairs[1].rows[0..1]`、`terms[3].points[0]` (mix)、`key_points[1]` → L5。overview_rows の 2 列は D-195 §3 の総表構造で反復に数えない。`goals_jp[0..1]` は観点の予告。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 validate warn `terms[3](サージ防護).detail_zh タップ → 轻点` は偽陽性 (§1-8)。電源タップ = power strip で、zh「电源插排」・en "power strips" が正しく、`轻点` (タッチ操作) を当てると誤訳になる。修正不要。zh-term matcher が「電源タップ」の複合語を区別しない点は単元外 (必要なら zh_terms の除外語として別途)。
- O2 loc-review r1 LOW の未適用分 (本監査では記録のみ): `terms[2].hook_zh` が「自家」が日本語名の字であることを示さない (en は明示)、`terms[1].hook_zh` が日本語名を簡体字「无停电」で引く、`overview_cols_zh[0]`「防范对象・目的」と `terms[2].fig.data.nodes[2].label.zh` の中黒「・」、`overview_rows[0..2].extra_en[1]` "Keeping power from stopping" の直訳調、`terms[1].one_en` "takes the initials of"。いずれも事実・判定には影響しない。
- O3 `pairs[0].rows[2].a_jp`「停電と同時に途切れず給電」: 常時商用給電方式の UPS では数 ms の切替時間があるが、IT パスポートの範囲 (無停電 = 途切れない) では正しい扱い。独立 copy 照合の偽陽性は全て語「ファシリティマネジメント」の一致 (§1-4)。

確認済みで問題なし: 限定条件 (考点 5 件全て保持、§2)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤65 字)、図の文字列の写し (validate 0、独立照合は偽陽性のみ)、`[[jp:]]` 原語 (6 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (4/4 + UPS は不要)、zh 訳語表 (タップ warn は偽陽性)、図種 (flow steps ×1 / tree static ×1 / 図なし ×3 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、D-205 / D-210 (法令・規格の名指しなし = 対象外)、前回 MEDIUM 4 件の解消と zh/en 無回帰。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **7** (建议修 4: L1〜L4 / 記録のみ 3: L5〜L7) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 6 件 (qid 付き 5 件)・引用 9 題 + 未引用の quiz / challenge 5 題 + topic 内未収録 12 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。法令・規格は名指しされず D-205 / D-210 は対象外。LOW 建议修 4 件 (L1〜L4) は補丁 (B3) で修正推奨、L5〜L7 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit management-11-30-u01
✓ management-11-30-u01 unit: 0 issues (data/ip/textbook/units/management-11-30-u01.json), 1 warning(s)
  warn  zh-term  terms[3](サージ防護).detail_zh  タップ → 轻点 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit management-11-30-u01
✓ management-11-30-u01 parity: 24 locations, 0 diff
EXIT=0
```
(warn は O1 のとおり偽陽性)
