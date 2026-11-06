# Rule A 全数抽検 — strategy-02-06-u02 (契約形態と消費者取引法規)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (b39)、repo HEAD `8dc176d6` + 作業ツリー (単元 JSON = `b39-u02-a3` merge 結果、`merged.json` とバイト一致、sha256 先頭 `8c492a33a75e3f83`)。最終 run `b39-u02-a3` (停止規則で a2 jp.r1 + 審査 #2 を種に、ユーザー承認「seed a3 + rewrite the point」)。journal `journal.b39-u02-a3.jsonl`: jp-review #1 REVISE (medium 1 = 雇用契約の「指示を出すのは使用者」一般則と派遣の図の食い違い) → jp.r1 → jp-review #2 PASS (low 10) → loc → loc-review PASS (low 10)。
- **対象**: `data/ip/textbook/units/strategy-02-06-u02.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (委任契約 / 準委任契約 / 雇用契約 / 特定商取引法 / 特定デジタルプラットフォームの透明性及び公正性の向上に関する法律 / 景品表示法) + 単元レベル (goals / overview_rows / pairs 3 / key_points 4 / summary / challenge_questions 4)。用語・`term_zh`・`term_en` は v1 と一致。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210 / D-211、`docs/templates/ruleA_unit_audit.md` の既知失敗型 (1)〜(10)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・cell・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。`terms[2]` (雇用契約) は hook が null (summary.memory_hooks も 5 件) — validate 0 で許容。
2. **考点 × 引用題 (考点 11 件 = exam 8 + mix 3、引用 qid 延べ 11 = 異なり 11 題、全て topic strategy-02-06)**: `questions.json` + `translations/<exam>.json` の `stem_jp_clean` で題文・選択肢・正答を再読、主張が正答と一致し誤答肢を支持せず、限定条件を落としていないことを 1 件ずつ確認 (§2)。本文で未引用の topic 題 (manifest term_questions) のうち 2026r08-q029 (請負の再委託に注文者の承諾は不要 = ア誤り) と 2015h27a-q003 (請負元が請負先の社員に直接作業指示 = 禁止、常駐自体は合意の上なら可) も本文と照合し矛盾なし (準委任 points[0] は作業場所を判断基準にしない)。
3. **quiz / challenge**: challenge 4 題 (2011h23a-q030 / 2012h24h-q009 / 2024r06-q032 / 2014h26a-q005) は全て本文で引用済みで矛盾なし。
4. **D-198 写し**: validate の copy guard = 0。独立照合: 単元 JP 文字列 113 本 (派生除く) × topic 全 36 題 (題文 + 選択肢、stem_jp_clean 優先) を 12 字連続照合 — カタカナ 4 字以上・英数遮蔽あり **0 件**、遮蔽なし **0 件**。1〜2 字置換の近接照合 → 4 件:
   - `terms[3].one_jp` / `overview_rows[3].one_line_jp` / `key_points_jp[1]` ↔ 2014h26a-q005 題文「トラブルが生じやすい取引」(本文「起きやすい」、1 字差)。一文全体では ed 0.68 / Dice 0.43 (HIGH 較正 ed 0.14 / Dice 0.52 から遠い)。消費者庁の特商法の説明 (消費者トラブルを生じやすい取引類型を対象に事業者が守るべきルール) と同じ標準定義で、題は「どの法律か」の分類型 → D-198 標準定義 + D-209 分類型の例外。写しではない (L9 で記録)。
   - `terms[2].points[1].text_jp` ↔ 2017h29a-q031 (本文未引用) 「…の指揮命令の下で…社」: 一般句、偽陽性。
   - カタカナの多い文 (クーリング・オフ / デジタルプラットフォーム / オーケストラ / ショッピングモール) を目視 — 題の表現の流用なし。
5. **D-208 既知失敗型 (1)〜(10)**: (1) (iii) — validate の choice-echo warn 0。題側判断項目を目視: 2025r07-q001 (a・b・c = 作業場所 × 指揮命令者) → 考点は「誰が指揮命令するか」の一般基準のみで場所軸を再現しない (a1 medium 解消)。2012h24h-q009 → 考点は労働者派遣の法定義 (派遣法 2 条 1 号相当) で、駐在・要員・ヘルプデスク・PL の場面要素なし (a1 medium 解消)。2015h27h-q009 (分類型) → §2 #3・L1・L10。2023r05-q025 (正誤選択型、正答 b・c) → 考点は c の一般原則 (原産国の誤認表示 = 不当表示) のみで、a〜c の組・順序・場面 (フランス国旗のタグ等) を再現しない = D-211 (ii)。2019h31h-q032 → 「契約で制限されていなければ再委託できる」は一般則、正答ウの二段構成 (原則可 → 制限は契約で) をなぞらず委任との対比 (両側とも正の定義、D-209) に置換 (a1 medium 解消)。(2) など落ち → L3・L4 (いずれも単元自身の「など」で引用題の限定ではない)。(3) 別名を別物として教える — なし (取引透明化法 = 通称と明記)。(4) 比喩 — 弁護士 (訴訟委任 = 法律行為の委任)、家庭教師 (事実行為)、オーケストラ (指揮者は楽団側の者で派遣の分離を示唆しない)、交通ルール、モール運営会社、審判 — いずれも考点と矛盾しない。(5) zh / en 退行 — a1/a2 の指摘点 (景品の取引付随条件・雇用関係の条件・図の前提定義) は三語とも解消 (§3)。(6) zh/en が誤答肢寄り — なし (2009h21a-q052 エ「派遣でも発注元は直接指示しない」側に読める訳語なし)。(7) D-210 — 下記 §1-7。(8) 他見出し語の語幹 — なし。(9) hook を引用題に当てて誤答 — なし (特商法 hook「名指しした取引の型だけ」→ 2014h26a-q005 正答ウと一致)。(10) 法定カテゴリの閉じた列挙 — 特商法の取引類型は「例えば」+ 図 root「取引の型の例」で開いている (法定 7 類型のうち 3)、不当表示は「代表は…ほかにも国が指定した」で 5 条 1〜3 号を網羅、景品の上限は総付 = 最高額 / 懸賞 = 最高額・総額で消費者庁の区分と一致。
6. **D-195 / D-197 / D-200**: §9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → jp 本文ヒット 0 (`freq_badge` = 標準)。framing は validate `pointFraming` 0 (issue 0)。考点数 2/1/3/2/1/2 (≤3)、各 JP 1〜2 文・45〜74 字 (≤100)。図種: table static ×1 (雇用)、tree static ×2 (特商法・景表法)、flow steps ×1 (取引透明化法、4 段) — 全て登録内。定義前使用: 法律行為 (委任 detail 1 文目)、善管注意義務 (同)、事実行為 (準委任 one)、偽装請負 (準委任 detail)、指揮命令 (雇用 detail; 準委任 points[0] で先に使用 — 日常語に近い、jp-review #2 low と同判断で記録なし)、労働者派遣・派遣元・派遣先 (雇用 detail; 図のセルで「派遣会社」「受け入れた会社」と説明済み = a1 medium 解消)、クーリング・オフ (図の葉で括弧注 = a2 medium 解消)、請負契約 (委任 points[0] で完成義務として定義)。D-197: 特商法 detail の 3 型並列は「例えば」付きで validate 0。
7. **D-205 / D-210 と一次確認** (2026-11-07):
   - 消費者庁「景品規制の概要」: 景品類 = 取引に付随して提供する経済上の利益、一般懸賞 最高額 20 倍 (5,000 円以上は 10 万円)・総額 2%、共同懸賞 30 万円・3%、総付 200 円 / 取引価額の 2/10。取引に付随しないオープン懸賞は景品規制の対象外 (平成 18 年に上限撤廃)。→ 本文 (detail・図の葉「商品の購入などの取引に付けて…おまけや懸賞の金額に上限」) と一致、2023r05-q025 の a (誰でも応募できる懸賞) を問題なしとする正答と整合。本文は数値を述べない (D-205 該当なし)。
   - 消費者庁 特商法ガイド (通信販売): クーリング・オフ制度はなく、返品特約を広告に表示 (表示がなければ引渡しから 8 日以内の撤回・解除、送料は消費者負担)。→ 図の葉「クーリング・オフなし (返品の条件は広告に表示)」・mix 考点と一致。日数は本文に無い。
   - 取引透明化法: 令和 2 年法律第 38 号、2021-02-01 施行、経済産業大臣が指定 (2021-04-01 に初指定)、取引条件等の開示・体制整備・毎年度の報告 → 経産省の評価・公表 (経産省 web は 403 のため報道・公式説明の検索結果で確認)。→ detail「2021 年に施行」・図 4 段と一致。
   - 民法 (e-Gov 現行): 643 (委任 = 法律行為の委託)、644 (善管注意義務)、644 条の 2 (復受任者は許諾 / やむを得ない事由が要る、2020 改正で明文化 — 旧法下も同旨の解釈で版依存の食い違いなし)、656 (準委任 = 準用)、632 (請負 = 完成)。
   - 2024 景表法改正 (確約手続・直罰・課徴金見直し) と 2023-10 ステマ告示は本文に記述がなく、引用題 2023r05-q025 の正答 (b・c) を本文が否定しない → D-210 の版明記は不要。2011h23a-q030 の a (瑕疵の期間限定責任) は 2020 改正で契約不適合責任に変わったが、本文は a を述べないため版明記不要。
8. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行・caption の三語一致、`[[jp:]]` 原語が jp 本文に実在、one_zh / one_en 全 6 用語に見出し語の `[[jp:]]` あり、zh 訳語は `zh_terms.unit.json` どおり (委托合同 / 准委托合同 / 雇佣合同 / 特定商业交易法 / 关于提升特定数字平台透明性与公正性的法律 / 不当赠品与不当表示防止法（景品表示法） / 劳动基准法)。指摘は L3〜L8。
9. **機械ゲート**: §6。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195〜D-211 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 委任契約 | OK — points[0]: 請負人は完成義務、受任者は完成を約束せず注意を尽くす (2010h22a-q028 正答ア = 完成 / 2011h23a-q030 正答イ = a・b; b を支持、a・c に反しない)。points[1]: 委任の受任者は許諾かやむを得ない事由がなければ他人に任せられない (民法 644 条の 2)、請負人は契約で制限されていなければ再委託できる (2019h31h-q032 正答ウ; 2010h22a-q028 イ・2011h23a-q030 c「全て自ら行う」を否定、2026r08-q029 ア「事前承諾が必要」も否定)。限定条件「契約で制限されていなければ」保持。 | OK (図なし = 定義型) | OK | L10 |
| 2 | 準委任契約 | OK — points[0]: 偽装請負かは誰が指揮命令するかで決まり、請負などの形でも委託側が直接指揮命令すれば偽装請負 (2025r07-q001 正答ウ = a・c / 2009h21a-q052 正答ウ; 誤答ア・イ「発注元が直接指示」を否定)。作業場所の軸は使わない (a1 medium 解消、2015h27a-q003 イ「常駐は可」とも整合)。 | OK | en「など」落ち L3 / 三語「そのまま (準用)」L5 | L3, L5 |
| 3 | 雇用契約 | OK — points[0]: 派遣労働者の雇用主は派遣元、派遣先は指揮命令関係 (2024r06-q032 正答イ / 2019r01a-q001 正答エ; 同題イ「A社-Y氏 = 派遣契約」は points[1]「その他社と労働者派遣契約」で否定側)。points[1]: 自社の指揮命令下で他社が雇う労働者を働かせる = 労働者派遣、その他社と派遣契約 (2012h24h-q009 正答エ)。points[2]: 正社員か・勤務時間の長短は雇用関係を左右せず、直接雇い入れ賃金を払う会社と雇用関係 (2015h27h-q009 正答イ = a・b・d; c 派遣社員は「直接雇い入れ」から外れ、points[0] と合わせて判別可)。a1「直接契約だけを条件」→「直接雇い入れ」(準委任の受託者は雇い入れでない) で解消、a2「循環文」→ 事実 (呼び名・時間は無関係 / 直接雇用 + 賃金) を述べる形で解消。jp-review #1 (a3) medium (使用者一般則 vs 派遣の図) は overview_rows[2]「直接雇われる場合」・pairs[1].rows[0].b「直接雇用では」・detail「派遣元に代わって派遣先が指揮命令」で解消。 | OK (D-209 分類型の一般定義; 判断項目の語・組・順序は再現しない) | OK | L1, L11 |
| 4 | 特定商取引法 | OK — points[0]: 勧誘・契約の仕方で消費者が不利になりやすい取引で事業者の行為を規制 (2014h26a-q005 正答ウ)。mix: クーリング・オフは訪問販売・電話勧誘販売など、通信販売には適用なし — 一次確認一致。図 tree (訪問 / 電話 = あり、通販 = なし + 返品条件は広告) は detail・考点と一致、クーリング・オフの意味は図の葉で括弧注 (a2 medium 解消)。 | near-match 1 字 (L9) | zh 図ラベル L6 | L6, L9, L12 |
| 5 | 取引透明化法 | OK (引用題なし) — 2021 年施行・経済産業大臣が指定・開示と体制整備・毎年度報告・国が評価公表、一次確認一致。mix: 守る相手は出店事業者で特商法と異なる — 主目的として正しい (一般利用者向け開示も一部あり → L13)。hook「取引透明化法」は経産省の通称どおり。 | OK | OK | L13 |
| 6 | 景品表示法 | OK — points[1]: 原産国を誤認させる表示も不当表示 (2023r05-q025 正答エ = b・c の c)。a (取引に付随しない懸賞) を規制対象と読ませる記述は detail・図の葉から消えた (a1 図 / a2 detail の medium 解消、三語とも「取引に付けて」が懸賞にも掛かる)。mix points[0] 優良誤認 = 中身 / 有利誤認 = 取引条件 — 法 5 条 1・2 号どおり。 | OK (D-211 (ii)) | en 図の葉「purchases」のみ L4、en detail 正式名 L8 | L2, L4, L8, L14 |

**単元レベル**: goals 3、overview_rows 6 (extra は直接雇用に限定済み)、pairs 3 組 (委任 / 準委任、準委任 / 雇用、特商法 / 景表法; 各 key 行あり)、key_points 4、summary 派生一致、challenge 4 題 (全て本文引用済み、v1 の 2011h23tokubetsu-q091・2013h25h-q035 は外れたが前者は NDA、後者は瑕疵担保で本単元の見出し語外)。事実誤りなし。

## 3. a1 / a2 停止規則の再発確認

| 由来 | 指摘 | 現状 (jp / zh / en) |
|---|---|---|
| a1 #1 | 景品の図の葉に取引付随の条件なし | 解消 / 解消 (随购买商品等交易提供的赠品或抽奖) / 解消 (offered with purchases — 「など」落ちは L4) |
| a1 #1, #2 | 雇用 points[2] 直接契約だけが条件 + 判断項目 (短時間・期間の定め) の組の言い直し | 解消: 「直接雇い入れ」、期間の定めは消え「正社員かどうか」(一般次元) に (L1 で残る緊張を、L11 で残余を記録) / zh・en 同 |
| a1 #1 | 雇用 points[1] 2012h24h-q009 場面 (要員・駐在・常駐) の流用 | 解消 (三語とも場面要素なし) |
| a1 #1 | 準委任 points[0] 作業場所 × 指揮命令者の組 | 解消 (三語とも作業場所なし) |
| a1 #1 | 委任 points[1] 請負の規則だけ | 解消 (委任の復受任制限 + 請負との対比) |
| a1 #1 | 雇用の図が派遣を定義前に使う | 解消 (セルで説明) |
| a2 #1 | 雇用 points[2] 循環文 | 解消 |
| a2 #2 | 景品 detail の条件が「おまけ」だけに掛かる | 解消 (「…取引に付けて提供する場合に、おまけの最高額や懸賞の最高額・総額に上限」) / zh 解消 / en 解消 |
| a2 #2 | 特商法の図がクーリング・オフ定義前 | 解消 (葉の括弧注、三語) |
| a3 #1 | 「指示を出すのは使用者」一般則 vs 派遣の図 | 解消 (三語) |

## 4. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 14 (うち 建議修 8)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 (before → after) |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[2].points[2].text_jp/zh/en` | 2 文目「自ら指揮命令して」が雇用関係の要件のように読め、同用語の detail・図・points[0] (派遣元は指揮命令しないが雇用主) と緊張する (十分条件なので誤りではない; jp-review #2 low の未修) | jp「その会社が直接雇い入れ、自ら指揮命令して賃金を払う働き手は」→「その会社が直接雇い入れ、賃金を払う働き手は」/ zh「由公司直接雇用、亲自进行指挥命令并支付工资的人员」→「由公司直接雇用并支付工资的人员」/ en「A worker whom a company hires directly, directs itself and pays wages to」→「A worker whom a company hires directly and pays wages to」 |
| L2 | LOW **建議修** | `pairs[2].rows[1].b_jp/zh/en` | 「景品額の上限」に取引付随の条件がなく、2023r05-q025 a (取引に付随しない懸賞) を上限の対象と読める余地 (detail・図の葉は条件付き、jp-review #2 low の未修) | jp「優良誤認・有利誤認の禁止、景品額の上限」→「優良誤認・有利誤認の禁止、取引に付ける景品額の上限」/ zh「禁止优良误认和有利误认、赠品金额上限」→「禁止优良误认和有利误认、随交易提供的赠品金额上限」/ en「Bans on misrepresenting quality or terms, caps on premium value」→「Bans on misrepresenting quality or terms, caps on the value of premiums offered with transactions」 |
| L3 | LOW **建議修** | `terms[1].points[0].text_en` | jp「請負などの形」の「など」が en で落ち、準委任の見出し語の下で請負だけに閉じる (zh は「承揽等形式」で保持) | en「Even under the form of a work-completion contract,」→「Even under the form of a work-completion contract or similar,」 |
| L4 | LOW **建議修** | `terms[5].fig.data.root.children[1].children[0].label.en` | jp「商品の購入などの取引に付けて」の「など」が落ち purchases に閉じる (来店者懸賞なども取引付随) | en「Caps on the value of giveaways and prize draws offered with purchases」→「Caps on the value of giveaways and prize draws offered with purchases or other transactions」 |
| L5 | LOW **建議修** | `terms[1].detail_jp/zh/en` 2 文目 | 「そのまま当てはめられ (準用)」は準用 (必要な読み替えをして当てはめる) と食い違い、zh「直接适用」は準用と逆の語 | jp「民法の委任の規定がそのまま当てはめられ (準用)、」→「民法の委任の規定が準用され (読み替えて当てはめられ)、」/ zh「民法中关于委托的规定直接适用于它（准用），」→「民法中关于委托的规定准用于它（比照适用），」/ en「The Civil Code provisions on mandate are applied to it as they are,」→「The Civil Code provisions on mandate apply to it mutatis mutandis,」 |
| L6 | LOW **建議修** | `terms[3].fig.data.root.children[0..2]` zh ラベル | 「可冷静期解约」「无冷静期解约」は不自然、「邮购・网购」に日本式中黒 (loc-review low の未修) | `children[0].children[0].label.zh`「可冷静期解约（签约后一定期间内可无理由解除）」→「适用冷静期（签约后一定期间内可无理由解约）」/ `children[1].children[0].label.zh`「可冷静期解约」→「适用冷静期」/ `children[2].children[0].label.zh`「无冷静期解约（退货条件在广告中标明）」→「不适用冷静期（退货条件在广告中标明）」/ `children[2].label.zh`「邮购・网购（通信销售）」→「邮购、网购（通信销售）」 |
| L7 | LOW **建議修** | `pairs[1].rows[0].a_en` | en で client が 2 義 (図・雇用 points[0] では派遣先、ここでは準委任の委託側; terms[1] は outsourcing company) | en「The mandatary's side (the client does not instruct directly)」→「The mandatary's side (the outsourcing company does not instruct directly)」 |
| L8 | LOW **建議修** | `terms[5].detail_en` 1 文目 | 見出し語が既に正式名の英訳のため「Its full title is …」が見出しの繰り返しで、jp の「略称 ↔ 正式名」の情報が消える | en「Its full title is the Act against Unjustifiable Premiums and Misleading Representations, and the Consumer Affairs Agency is in charge of it.」→「In Japanese it is usually shortened to Keihin Hyōji Hō (its full title is Futō Keihinrui oyobi Futō Hyōji Bōshi Hō), and the Consumer Affairs Agency is in charge of it.」 |
| L9 | LOW | `terms[3].one_jp`、`overview_rows[3].one_line_jp`、`key_points_jp[1]` | 2014h26a-q005 題文と「トラブルが起き/生じやすい取引」1 字差の近接一致。消費者庁の標準定義で、文全体 ed 0.68 / Dice 0.43 | 記録のみ |
| L10 | LOW | `terms[0].points[1].text_jp/zh/en` 1 文目 | 委任の復受任制限 (民法 644 条の 2、正しい) は引用題 2019h31h-q032 (請負の再委託のみ) が支えない | 記録のみ (対比で請負側を誤読させない効果がある) |
| L11 | LOW | `terms[2].points[2].text_jp/zh/en` 1 文目 | 「正社員かどうかや勤務時間の長短」は 2015h27h-q009 の正答項目 (アルバイト・契約社員・パートタイマ) の属性に近いが、語・組・順序を再現せず、期間の定め (契約社員) の軸も消え、雇用形態に関係しない一般原則 → (iii) に当たらない | 記録のみ |
| L12 | LOW | 単元全体 | 書き方 8 の対比反復: 「完成を約束しない」(委任 detail・points[0]・overview_rows[0..1]・pairs[0].rows[1]・key_points[0])、「雇用主 = 派遣元 / 指示 = 派遣先」(雇用 detail・図 key 行・points[0])、「クーリング・オフあり / なし」(図・mix・detail・analogy)。pairs[0].rows[1] は両側同値 | 記録のみ |
| L13 | LOW | `overview_rows[4].extra_jp`、`terms[4].points[0]` | 「守る相手は場を利用する事業者」は主目的として正しいが、法は一般利用者向けの一部開示 (検索順位の主要事項等) も求める | 記録のみ (簡略化の範囲) |
| L14 | LOW | `terms[5].hook_jp`、`overview_rows[5].extra_jp`; `key_points_jp` | hook「2 本の柱」は総表 extra・図の 2 枝と同内容 (§6 言い換え寄り)。key_points 4 点に派遣 (雇用関係と指揮命令関係の分離) がない (goals[1] にはある) | 記録のみ |

**範囲外の観察**:
- O1 2023r05-q025 の正答 b (広告であることを隠した記事) は本文で扱わない (図「国が指定する表示 (例: 原産国)」の範囲。2023-10 のステマ告示の追記は D-205 書き方 10 / D-210 により任意、本文はこれを否定しない)。
- O2 `terms[2]` hook null (validate 0、summary.memory_hooks 5 件)。
- O3 en 図 `terms[5].fig...yuryo.label.en`「Misrepresentation of quality (quality, specifications, etc.)」の括弧内 quality 重複、zh `pairs[1].rows[0].b_zh`「作为雇主的使用者」の日式借語 (loc-review low の未修、意味は正しい)。

確認済みで問題なし: 限定条件 (考点 11 件全て保持)、§9 禁止句 0、framing 0、D-197 (validate 0)、D-200、copy 独立照合 (完全一致 0 / 0、近接は標準定義と一般句のみ)、`[[jp:]]` 原語、one_zh / one_en の見出し語併記 6/6、zh 訳語表、図種 (登録内)、派生フィールド一致、用語・term_zh・term_en の v1 不変量、一次確認 (消費者庁 景品規制・特商法通販、取引透明化法、民法)。

## 5. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **14** (建議修 8: L1〜L8 / 記録のみ 6: L9〜L14) |

## 6. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 6 用語・考点 11 件・引用 11 題 + 未引用 topic 題 2 題で、考点の主張は正答と一致し、誤答肢を支持せず、限定条件の落ちもない。a1 / a2 の停止規則指摘 (雇用 points[2] の直接契約条件・判断項目の言い直し・循環文、景品上限の取引付随条件、図の定義前使用、場面・判断軸の流用) は三語とも解消。建議修 8 件は B3 補丁で修正推奨。

## 7. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-02-06-u02
✓ strategy-02-06-u02 unit: 0 issues (data/ip/textbook/units/strategy-02-06-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-02-06-u02
✓ strategy-02-06-u02 parity: 29 locations, 0 diff
EXIT=0
```
