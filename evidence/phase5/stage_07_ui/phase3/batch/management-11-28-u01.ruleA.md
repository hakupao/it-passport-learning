# Rule A 全数抽検 — management-11-28-u01 (サービスマネジメントの基礎とサービスレベル管理)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (S149 b44)、repo HEAD `5bc59532` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b44-u01-a2` loc r1 merge 結果、sha256 先頭 `4fd52474b9b69710`)。
- **対象**: `data/ip/textbook/units/management-11-28-u01.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (サービス / ITIL / SLA / SLO / SLI) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **経緯**: a1 は jp-review r1 (MEDIUM: terms[0].fig が SLM 循環図) → r1 改稿 → jp-review r2 (MEDIUM: overview_rows[0] がサービスを「価値」と定義) で REVISE、a2 は a1 jp.r1 + review #2 を種に再生成 → jp-review r1 (MEDIUM: SLO 考点の qid 2022r04-q051 不適) → r1 → jp-review r2 PASS → loc r0 → loc-review r1 (MEDIUM: zh「利用者」4 箇所) → loc r1 → loc-review r2 PASS。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `.planning/v2/management-11-28-u01/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (cols・cells・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題** (考点 10 件 = exam 7 + mix 3、引用 qid 延べ 13 = 異なり 13 題、全題 topic `management-11-28`): `questions.json` + `translations/<exam>.json` の stem_jp_clean で題文・選択肢・正解を再読し、正解との一致・誤答肢を支持しないこと・限定条件の保持を 1 件ずつ確認 (§2)。
3. **quiz / challenge_questions** (quiz 計 12 枠 + challenge 5、本文で未引用 5 題 = 2021r03-q045 / 2018h30h-q039 / 2012h24a-q039 / 2014h26h-q048 / 2015h27a-q033) と、topic 内の未使用題 (2009h21a-q035 / 2009h21h-q046 / 2011h23a-q046 / 2011h23tokubetsu-q038 / 2012h24h-q030 / 2017h29h-q035 / 2017h29h-q042 / 2018h30a-q040 / 2018h30h-q038 / 2019h31h-q052 / 2020r02o-q039 / 2022r04-q051 / 2023r05-q044 ほか) の正解と本文が矛盾しないことを確認。2021r03-q045 (ITIL = IT サービスの提供とサポートのベストプラクティス; 誤答 = 共通フレーム・成熟度モデル・PM 知識体系の説明) は ITIL detail と一致。2018h30h-q039 (SLA の連絡・復旧期限を守った行動を選ぶ) は SLA が数値の取決めであるという one / detail / 表で解け、矛盾なし。2012h24a-q039 は SLA points[2] (mix)、2014h26h-q048 (共通認識) は SLA detail 2 文目、2015h27a-q033 (運用効率化・可用性など品質向上 = ITSM) はサービス detail / points[0] で解ける。2011h23a-q046 (可用性 = サービス時間) はサービス points[1] の可用性の注と整合。2022r04-q051 (SLA = 顧客と供給者の合意、供給者が測定・評価・改善) は SLA one・SLI detail と整合 (a2 で SLO 考点から外され、今は未引用)。2020r02o-q039 / 2023r05-q044 (SLA と SLM の区別) は SLA hook (A = Agreement) と points[2] で正解側に導く。
4. **D-198 写し**: validate の copy guard = 0 件、`warn choice-echo` 行なし。独立照合 (scratchpad `u01audit/copy2.mjs`・`lcs.mjs`・`semi.mjs`): 単元の JP 文字列 86 本 (派生除く、goals / extra / key_points の配列要素・図セル・caption を含む) を topic 内全 34 題の stem_jp_clean + 選択肢と照合。
   - 12 字連続 (カタカナ 4 字以上・英数を □ 遮蔽、実字 6 未満の窓除外) → **0 件**。
   - 遮蔽なし → 80 件ヒット、うち 77 件は見出し語「ITサービスマネジメント」(12 字) そのもの。残り: `terms[1].points[0].text_jp` ↔ 2017h29h-q035 / 2019r01a-q050「ITサービスマネジメントのフレームワーク」(用語名 2 つ + の、名前当て題の正解と同じ標準定義 → 偽陽性)、**`key_points_jp[1]` ↔ 2012h24h-q042: 題文 (名前当て題) の定義句「ITサービスマネジメントのベストプラクティスを集めたフレームワーク」と正規化 32 字一致**。中身の語は用語名 3 つ (ITSM / ベストプラクティス / フレームワーク) と「の…を集めた」だけで、D-198 運用補足の遮蔽後は一致にならず、ITIL の標準定義 (正解が同じ原則を述べても可) に当たるので写しとはしない。ただし題文 1 文の丸ごと一致で、one_jp (「体系的に集めた」) と表現をそろえれば外れるため **L1 建議修**。
   - 近似 (12 字窓 × 題文の任意部分列、編集距離 ≤ 2; 用語名を 1 字に畳む) → 10 件: いずれも「サービスの提供者と顧(客)」「ITサービスの提供(と/や)サ」「ITサービスの運用管(理)」「ITサービスの品質を」「…を体系的に集めたフレームワーク」など 1〜2 字違いの一般句。最も近い `terms[2].points[0].text_jp` ↔ 2011h23tokubetsu-q047 正解ウ (「提供者と顧客が/間で合意した事項」) も全文で ed 0.60 / Dice 0.43 (HIGH 校正 ed 0.14 / Dice 0.52 から遠い)、SLA の標準定義で写しではない (L4 に含めて記録)。主要考点の全文比較: ITIL p0 × q040 正解 0.70 / 0.25、ITIL p1 × q038 題文 0.67 / 0.31、サービス p0 × q052 題文 0.78 / 0.35、SLA p1 × q041 0.67 / 0.40、SLA p2 × q039 正解 0.76 / 0.25、サービス p1 × q039 題文 0.90 / 0.29。
   - カタカナの多い文の目視 (ITIL one / points、key_points[1]、サービス detail): 上記以外の一致なし。
   - (iii) 具体例の流用: SLA 表 (99.9% / 4 時間 / 平日 8:00〜20:00)・SLO・SLI の数値 (99.9% / 2 秒 / 99.95% / 1.4 秒) は topic 内のどの題 (9:00〜19:00・9 時間・3 時間・20 分 / 2 時間・60 分 等) とも異なる。SLA の例「利用時間帯と復旧時間」の組は 2013h25h-q091 の正解の組と同じ項目・順序だが、数値・場面 (F 社 / G 社) を使わず、2009h21a-q035・2018h30a-q040 などに独立に出る SLA の最標準項目 → L8 記録。比喩 (タクシー・囲碁定石・宴会場予約・マラソン目標 / 記録) はいずれも題に無い場面。
   - D-208 (1) 選択肢なぞり: 誤答肢だけを否定する考点なし。サービス points[1] は分類型 (2022r04-q039: どれが保証か) の正解を「いつでも使える状態は保証側」と役割の区別で述べ、誤答 (連携・無料・アイコン) の組・順を再現しない (D-209 免除)。SLA points[2] は 2012h24a-q039 正解の両側を正の定義で述べる対比 (D-209 免除、選択肢の語句は再現しない: Dice 0.25)。SLA points[1] は「誰か」型 2015h27a-q041 の正解を一般の役割として述べる (誤答の組なし)。ITIL points[1] は名前当て題 2020r02o-q038 の題文の記述順を同義語でなぞる (a1 r1・a1 r2・a2 r1・a2 r2 で LOW 記録の継続) → L5 記録のみ。
5. **D-195**: one = 1 文 × 5 (太字あり)、detail 2〜3 文、定義前使用 (成果 = one 内、ITSM = サービス detail、ベストプラクティス = ITIL one の括弧注、可用性 = 考点の括弧注、保証 = 考点内で機能・価格と並べて説明、SLM = SLA detail、水準・目標値・指標 = 各 one)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が / 注意) → 「出る」1 件 (`terms[3].analogy_jp`「マラソンに出る前に」= 通常の用法、偽陽性) のみ。zh / en (必须 / 考试 / 重要 / 一定要 / 注意 / must / exam / always / remember / important) → `"kind": "exam"` 18 件のみ。図の型: SLA = static table、SLI = tree steps (3 段) 、他 3 用語は図なし (定義型) — 全て登録内。a1 r1 MEDIUM の「サービスの SLM 循環図」は削除済み。pair 配置: SLA→SLO は SLO の後、SLO→SLI は SLI の後、各組 key 行あり。
6. **D-200**: 考点数 2/2/3/2/1 (≤3 ✓)、各 JP 1〜2 文・35〜92 字 (≤100 ✓、最大はサービス points[1] の 92 字)。**framing 件数** (validateV2 `POINT_FRAMING` の語を考点 zh / en にも grep): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士): サービス = 「価値を届ける仕組み」で one / overview_rows[0] / key_points[0] 一致 (a1 r2 MEDIUM 解消)、「設備の」限定は除去済み (a1 r2 LOW 解消)。SLA = 提供者と顧客 (one / points[0] / overview / key_points[2]) と points[1]「利用する組織の責任者」は顧客側の代表者として整合。SLO ⊂ SLA (SLO detail・pairs[0]・図) と SLI = 実測 (one・pairs[1]・図) 一致。ITIL の「文書」(goals_jp[1]) と「フレームワーク」(one / overview) の呼び分けは書籍群が起源で誤りでない → L9。書き方 8 → L7。書き方 9 → §2 表に記載、落ち 0。§6: 比喩は定義の言い換えでなく別場面 (タクシー = 所有せず結果を受け取る、定石集 = 手本を選んで使う、宴会場予約 = 事前の書面取決め、マラソン目標タイム / 実記録 = 事前目標と実測) — SLO / SLI の比喩は同じ場面の前後で対比の手がかりとして機能。§9 言い直し → L4。
8. **D-204 / D-208 (4)(8)(9)**: タクシーの比喩は「料金と引き換えに結果」で、サービス points[1] の価格要素と整合し、保証 (可用性) を否定しない。定石集の「場面に合わせて選んで使う」は ITIL detail「状況に合わせて取り入れる」と一致 (ITIL を規格・強制規則とする誤答 [2011h23a-q040 ア ソフトウェア / ウ 取引適正化の作業項目] 側に読ませない)。hook を題に当てはめる検査: A = Agreement → 2017h29a-q036 / 2017h29h-q042 / 2020r02o-q039 / 2023r05-q044 で SLA (正解) を選び、SLM (誤答) を選ばない。O = Objective・I = Indicator は題の選択肢に SLO / SLI が並ぶ題がなく、誤答誘導なし。「コーチ」型の他用語語幹の流用なし。
9. **D-205 / D-210 (版)**: 本文は ITIL・JIS Q 20000 / ISO/IEC 20000 のプロセス・プラクティス・段階の **件数・名称を一切挙げない** (ITIL について述べるのは「英国の政府機関がまとめた書籍群が始まり」「Library = 本の集まり」「ベストプラクティスの枠組みで、組織が状況に合わせて取り入れる」「提供者と顧客の両方の立場から品質を測り続け改善する」のみ)。一次情報の確認: ITIL は 1980 年代末に英国政府機関 CCTA が書籍群として作成 (後に OGC → AXELOS [2013〜] → PeopleCert [2021〜]、2026 に ITIL 5 公表の報あり) — 「始まり」と過去の起源として述べており版・所有者の変遷に影響されない。ITIL points[1] の性格記述は 2020r02o-q038 の題文 (ITIL v2 / v3 期の公式の自己記述 "continual measurement and improvement of the quality of IT services … from both a business and a customer perspective" に由来) に基づくが、ITIL 4 以降も continual improvement は中核 (指導原則・プラクティス) であり、改訂で内容が否定されていない → D-210 の「旧版の規定」には当たらない。サービス points[1] の「機能・保証 (+価格) の兼ね合い」は ITIL v3 の utility / warranty に近い枠組みだが、本文は ITIL の規定として名指ししておらず、題 2022r04-q039 の前提 (IPA の記述) どおりに述べる → 版の明記対象外 (L6 記録)。サービス・SLA の定義は JIS Q 20000-1 (ISO/IEC 20000-1:2018) の「サービスレベル合意書 = サービス提供者と顧客との間の文書化した合意」と矛盾しない。SLO / SLI の語は SRE 由来で IT パスポート題の直接の出題対象ではない (SLO は 2013h25h-q091 の terms のみ) が、本文の階層 (SLA の中に項目ごとの目標値) は経産省 SaaS 向け SLA ガイドライン等の国内用法と整合。
10. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 9 種 (サービス / ITサービスマネジメント / 可用性 / 保証 / ベストプラクティス / サービスレベル合意書 / サービスレベル管理 / サービスレベル目標 / サービスレベル指標) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 5 用語に見出し語の `[[jp:]]` か見出し語そのもの (英字略語 ITIL / SLA / SLO / SLI は略語 + 正式名の `[[jp:]]`) あり、zh 訳語 (服务 / IT服务管理 / 可用性 / 服务级别管理 / 可用率 / 应答时间) は `zh_terms.json` に従う (validate B6 / jp-origin warn 0)。loc-review r1 MEDIUM の zh「利用者」4 箇所は「用户」に置換済み (one_zh / detail_zh / overview_rows[0].one_line_zh / key_points_zh[0])。(6) zh / en の語選びが誤答肢に寄る箇所なし (SLA points[1] en "the person responsible at the organization that uses the service" は 2015h27a-q041 誤答 [サービスデスク責任者・開発発注先・Web 利用者] のどれにも読めない)。
11. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | サービス | OK — exam 2 / 4 題: ITSM = 顧客の要求に合う IT サービスを届け続けるため運用を管理し継続的に改善する取組み (2009h21a-q042 正答ア = 顧客要求を満たすため運営管理されたサービスを効果的に提供 / 2017h29a-q052 正答イ ITSM / 2024r06-q044 正答ア ITSM [事業ニーズ・継続的改善]; 誤答 = 実現可能性検証・ナレッジ共有・PPM・IT ガバナンス・サービスデスク・PM・監査・FM のどれも支持しない) / 価値は機能と可用性などを保つ保証に価格を加えた兼ね合い、いつでも使えることは保証側 (2022r04-q039 正答ア = 24 時間 365 日利用可能; 誤答 イ・エ = 機能、ウ = 価格 に寄せる記述なし)。限定条件: 題の「可用性などを維持する」の「など」を「可用性 … などを保つ」で保持。「決まる」は題の「バランスを考慮する必要がある」より一歩強い (L6)。図なし (定義型) で a1 r1 MEDIUM 解消 | OK | OK (zh「用户」修正確認) | L4, L6 |
| 2 | ITIL | OK — exam 2 / 4 題: IT サービスの運用管理の進め方を成功事例として体系立ててまとめた ITSM のフレームワーク (2011h23a-q040 正答イ / 2012h24h-q042 正答ウ / 2019r01a-q050 正答エ; 誤答 = ソフトウェアパッケージ・共通フレーム・開発モデル・ISO 14001 / 27001・JIS Q 15001・IEEE / IETF / ISMS をどれも支持しない) / 提供者と顧客の両方の立場から品質を測り続け改善することに重きを置く (2020r02o-q038 正答ア ITIL; 誤答 共通フレーム・システム管理基準・内部統制)。detail (英国政府機関の書籍群が起源・Library = 本の集まり・状況に合わせて取り入れる) は一次情報と一致、版に依存しない (§1-9) | key_points[1] の題文 32 字一致 → L1 / points[1] の題文順なぞり → L5 | points[0] zh / en の `[[jp:サービス]]` が複合語「ITサービス」の一部に付く → L2 | L1, L2, L4, L5, L9 |
| 3 | SLA | OK — exam 2 / 4 題 + mix 1: SLA = 内容と品質の水準について提供者と顧客が合意した事項の文書 (2011h23tokubetsu-q047 正答ウ / 2017h29a-q036 正答イ / 2013h25a-q033 正答ウ サービスレベル合意書; 誤答 = 窓口・ベストプラクティス文書・CMDB・SCM / SLM / SFA・サービスカタログ / 要件) / 結ぶ相手 = 使う側の組織の責任者 (2015h27a-q041 正答ア; 不特定多数の Web 利用者・サービスデスク責任者を支持しない) / mix: SLA = 文書、SLM = 合意水準を維持し高める活動 (2012h24a-q039 正答イと一致、誤答エの狙いの入替えを支持しない)。表 (稼働率・復旧・問い合わせ窓口) は 2011h23a-q046 (可用性・性能等の分類)・2019h31h-q052 (サービスデスク項目) と整合、数値は自作 | OK (例の組 → L8) | 図 root label en "SLA agreement" 冗語 → L3 | L3, L4, L7, L8 |
| 4 | SLO | OK — exam 1 / 1 題 + mix 1: 定量的な数値で表すので達成を客観的に判定できる (2013h25h-q091 正答エ = 時刻・時間を定量的に定義した (c)(d); 題は定量定義を「適切」とする前提で考点を支持)。a2 jp-review r1 MEDIUM の 2022r04-q051 は qids から除去済み、他欄にも残存なし / mix: SLA = 合意全体の文書、SLO = その中の項目ごとの目標値 (a2 r1 LOW「単位」の曖昧さは除去済み) | OK | en "which the provider aims to achieve" の主体補い → L10 | L4, L7, L10 |
| 5 | SLI | OK — mix 1: SLO = 前もって決めた目指す値、SLI = 提供中に実測した値、SLI が SLO に届くかで達成判断。引用題なし (SLI は topic の題に出ない語、manifest freq 0) で事実は一般用法どおり。tree steps 3 段 (合意書 → 項目ごとの目標値 → 実測して比べる) は one / detail / pairs[1] と一致 | OK | en points[0] の文末がやや硬い → L10 | L7, L10 |

**単元レベル**: goals 3 点・overview_cols 2 (種類 / 例)・overview_rows 5 行・pairs 2 組 (SLA / SLO 2 行 key 1、SLO / SLI 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 5 件 (2012h24a-q039 / 2014h26h-q048 / 2013h25a-q033 / 2015h27a-q033 / 2020r02o-q038 — 本文と矛盾なし、§1-3)。事実誤りなし、三語一致。

**前回までの指摘の解消確認 (a1 / a2 jp-review・loc-review の HIGH / MEDIUM)**:

| 出所 | 重大度 | 指摘 | 現状 |
|---|---|---|---|
| a1 jp-review r1 | MEDIUM | `terms[0].fig` = SLM 循環の段階図 (定義型の用語に過程図、SLI 図・key_points[3] と三重) | **解消** — `terms[0].fig: null`。循環は key_points[3] と SLI 図に 1 回ずつ |
| a1 jp-review r2 | MEDIUM | `overview_rows[0].one_line_jp` がサービスを「価値」そのものと定義 | **解消** — 「…成果を受け取れる形で価値を届ける仕組み」で one_jp / key_points[0] と同じ範疇、zh / en も「方式 / A way of delivering value」 |
| a2 jp-review r1 | MEDIUM | `terms[3].points[0].qids` に設問対象が別の 2022r04-q051 | **解消** — qids = [2013h25h-q091] のみ |
| a2 loc-review r1 | MEDIUM | zh「利用者」4 箇所 | **解消** — 全て「用户」、他欄に「利用者」なし (zh 全文 grep 0) |
| a1 r2 / a2 r1 の LOW (「設備の」限定・「単位」・SLA 99.5% と 99.9% の不一致・pairs[0] 例の行が正式名称) | LOW | — | 全て解消 (one_jp から「設備の」除去、SLO mix 書換え、SLA 表 99.9% に統一、pairs[0].rows[1].a = 「利用時間帯や復旧時間などを取り決めた合意書」) |
| a2 loc-review r2 の LOW (`[[jp:サービス]]` 併記・"SLA agreement"・SLO one_en 主体・SLI en 文末) | LOW | — | 未修のまま → L2 / L3 (建議修)、L10 (記録のみ) |

退行 (D-208 (5)): zh / en で、jp で直した事項 (サービス = 仕組み・SLO の qid・単位) が旧形に戻っている箇所なし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 10 (うち 建議修 3)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `key_points_jp[1]` (+ 派生 `summary.key_points_jp[1]`) | 「ITサービスマネジメントのベストプラクティスを集めたフレームワーク」が 2012h24h-q042 (名前当て題) の題文の定義句と正規化 32 字一致。中身は用語名 3 つ + 「の…を集めた」で D-198 遮蔽後は一致せず、ITIL の標準定義 (写しではない) だが、題文 1 文の丸ごと一致は避けられる (one_jp は「体系的に集めた」) | jp `**ITIL** は、ITサービスマネジメントのベストプラクティスを集めたフレームワークで、組織が状況に合わせて取り入れる手本である。` → `**ITIL** は、ITサービスマネジメントのベストプラクティスを体系的に集めたフレームワークで、組織が状況に合わせて取り入れる手本である。` / zh (任意、one_zh とそろえる) `**ITIL** 是汇集IT服务管理最佳实践的框架，是各组织根据自身情况采用的范本。` → `**ITIL** 是系统地汇集IT服务管理最佳实践的框架，是各组织根据自身情况采用的范本。` / en (任意) `**ITIL** is a framework gathering best practices for IT service management, a model that each organization adopts to fit its own situation.` → `**ITIL** is a framework systematically gathering best practices for IT service management, a model that each organization adopts to fit its own situation.` |
| L2 | LOW **建議修** | `terms[1].points[0].text_zh` / `text_en` | `[[jp:サービス]]` が jp の複合語「ITサービス」の一部にだけ付き、併記した原語が本文の語と 1 対 1 で対応しない (loc-review r2 LOW の未修)。この考点はサービスの語義を扱わない | zh `运维管理IT服务（[[jp:サービス]]）的做法` → `运维管理IT服务的做法` / en `running and managing IT services ([[jp:サービス]]).` → `running and managing IT services.` |
| L3 | LOW **建議修** | `terms[4].fig.data.root.label.en` | "SLA agreement" は Agreement が二重になる冗語 (loc-review r2 LOW の未修) | `SLA agreement` → `SLA document` |
| L4 | LOW | `terms[0].points[0].text_jp` (detail 2 文目・key_points[0] の言い直し)、`terms[1].points[0].text_jp` (one の言い直し)、`terms[2].points[0].text_jp` (one の言い直し; 2011h23tokubetsu-q047 正解の定義句と 1〜2 字違いの一般句)、`terms[3].points[0].text_jp` (detail 1 文目の言い直し) | D-203 §9 同義の言い換えの反復 (各 jp-review で LOW 記録の継続)。事実は各引用題の正解と一致 | 記録のみ |
| L5 | LOW | `terms[1].points[1].text_jp/zh/en` | 2020r02o-q038 (名前当て題) の題文の記述順 (双方の観点 → 品質の継続的測定と改善 → 焦点) を同義語でなぞる。選択肢・判断項目の再現ではなく (D-209 免除)、ITIL の定番の自己記述で全文 ed 0.67 / Dice 0.31。同題が challenge_questions にあり本文から即答できる | 記録のみ |
| L6 | LOW | `terms[0].points[1].text_jp/zh/en` | 「兼ね合いで決まる」は題前提「バランスを考慮する必要がある」より一歩強い言い切り。機能 / 保証による価値の捉え方は ITIL v3 (utility / warranty) 系で ITIL 4 では表し方が違うが、本文は ITIL の規定として名指しせず、件数・名称の列挙もないので D-205 の版明記対象外 | 記録のみ |
| L7 | LOW | `terms[3].detail_jp` 2 文目 (SLA⇔SLO)、`terms[4].one_jp` 後半・`detail_jp` 2 文目・`fig.steps[2]` (SLO⇔SLI)、`terms[2].detail_jp` 3 文目 (SLA⇔SLM) | 書き方 8: 対比が pairs + mix 考点に加えて detail / one でも繰り返される (各 jp-review で LOW 記録の継続)。SLO⇔SLI は SLI の定義の中核 (何のための指標か) で、削ると定義が欠ける | 記録のみ |
| L8 | LOW | `terms[2].detail_jp` 1 文目、`overview_rows[2].extra_jp[1]`、`pairs[0].rows[1].a_jp` | SLA の例「利用時間帯 + 復旧時間」が 2013h25h-q091 の正解の組と同じ項目・順序。数値・場面を使わず、複数題に独立して出る最標準項目なので (iii) に当たらない | 記録のみ |
| L9 | LOW | `goals_jp[1]` (ITIL を「文書」)、`overview_rows[1].extra_jp[1]` (「例」列に性格の説明)、`overview_rows[0].extra_jp[0]` (「種類」列の「考え方」) | 呼び分け・総表列の揃い (書籍群が起源なので誤りではない) | 記録のみ |
| L10 | LOW | `terms[3].one_en` ("which the provider aims to achieve")、`terms[4].points[0].text_en` ("whether the SLI reaches the SLO decides achievement")、zh「应答时间」 | en の主体補い・直訳調、zh は訳語表 (応答時間 → 应答时间) どおりで単元内一貫 (loc-review r2 LOW の未修)。SLO は提供者が達成を目指す値で事実誤りではない | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① SLA = 合意全体の文書 / SLO = 項目ごとの目標値: `pairs[0].rows[0]`、`terms[3].points[1]` (mix)、`terms[3].detail_jp` 2 文目、図 steps[0..1] → L7。② SLO = 前もって決める目標 / SLI = 実測: `pairs[1].rows[0..1]`、`terms[4].points[0]` (mix)、`terms[4].one_jp` 後半・`detail_jp` 2 文目・図 steps[2] → L7。③ SLA = 文書 / SLM = 活動: `terms[2].points[2]` (mix)、`terms[2].detail_jp` 3 文目 (pairs になし、計 2 箇所 = 上限内) → L7 に付記。④ 総表 (種類 / 例) は D-195 §3 の構造 → 許容。`goals_jp[2]` は観点の予告。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿、B2 審査済み)。事実は正しい。
- O2 独立 copy 照合の遮蔽なしヒット 80 件は見出し語「ITサービスマネジメント」と用語名の連なり (§1-4)。L1 以外に表現の一致なし。
- O3 SLI は topic 内の題に一度も出ない (manifest freq 0)。v1 からの用語継承で、SLO と対で置くことは単元の流れとして妥当。ITIL 5 (2026 公表の報) 以降も本文の ITIL 記述は版に依存しない形で、件数・名称を足す改稿をする場合は D-205 により版を明記すること。

確認済みで問題なし: 限定条件 (考点 7 件全て保持、§2)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤92 字)、図の文字列の写し (validate 0、独立照合は L1 以外偽陽性)、`[[jp:]]` 原語 (9 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (5/5)、zh 訳語表 (B6 warn 0)、図種 (static table ×1 / tree steps ×1 / 図なし ×3 = 登録内)、派生フィールド一致 (不一致 0)、用語・`term_zh`・`term_en` の v1 不変量、前回 MEDIUM 4 件の解消と zh / en 退行なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **10** (建議修 3: L1 / L2 / L3、記録のみ 7: L4〜L10) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 10 件 (exam 7 / mix 3)・引用 13 題 + 未引用の quiz / challenge 5 題と topic 内の残り題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。a1 / a2 の jp-review・loc-review の MEDIUM 4 件は全て解消し、zh / en の退行なし。D-205 / D-210: 本文は ITIL / JIS Q 20000 の件数・名称を挙げず、版依存の記述なし。LOW 建議修 3 件 (L1〜L3) は補丁 (B3) で修正推奨、L4〜L10 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit management-11-28-u01
✓ management-11-28-u01 unit: 0 issues (data/ip/textbook/units/management-11-28-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit management-11-28-u01
✓ management-11-28-u01 parity: 24 locations, 0 diff
EXIT=0
```
