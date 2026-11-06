# Rule A 全数抽検 — strategy-07-24-u01 (調達計画と実施 — RFI・RFP と調達方針)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (S149 b36)、repo HEAD `15bdbc57` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b36-u01-a2` (種付き: a1 jp.r1 + jp-review #2) の merge 結果、sha256 先頭 `52e4242cb962b069`)。
- **対象**: `data/ip/textbook/units/strategy-07-24-u01.json` (textbook-unit-v2)、用語 **4 / 4 = 全数** (RFI / RFP / グリーン調達 / AI・データの利用に関する契約ガイドライン) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。用語・`term_zh`・`term_en` は v1 と一致。
- **基準**: D-195、D-197〜D-200、D-202〜D-205、D-208 (既知の不合格型 1〜10)、D-209、D-210、D-211 (quiz のみの出口)。比較: `.planning/v2/strategy-07-24-u01/v1-original.json`、前 attempt `failures/phase5/stage_07_ui/phase3/batch/strategy-07-24-u01_attempt_1.md`、journal `journal.b36-u01-a2.jsonl` (jp-review #1 PASS low 8 / loc-review #1 PASS low 8)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 4 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.*`) は本体から記法 (`**`・`[[jp:…]]` の括り) を外したもの (スクリプト照合、内容差 0)。
2. **考点 × 引用題 (考点 7 件 = exam 5 + mix 2、引用 qid 延べ 16 = 異なり 16 題、全て topic `strategy-07-24`)**: `questions.json` + `translations/<exam>.json` の `stem_jp_clean` で題文・選択肢・正答を再読し、正答一致・誤答肢を支持しないこと・限定条件を 1 件ずつ確認。計算題 2015h27a-q009 (A 33 / B 30 / C 32 / D 30 → A) と 2018h30a-q015 (A 23 / B 25 / C 22 / D 20 → B) を再計算し正答と一致 (本文は数値を使わず「例えば重みを掛けて合計」とだけ述べる)。グリーン調達・契約ガイドラインは topic 内の出題 0 (manifest freq 0) で mix 考点のみ・quiz なし。
3. **quiz / challenge** (quiz 6 枠 + challenge 5 題、うち本文で未引用 2 題 = 2020r02o-q001・2014h26a-q024): 2020r02o-q001 (RFP = 概要・提案依頼事項・調達条件を示し提案書を求める / RFI = 目的・業務概要を示し情報提供を求める) は RFP one・RFI detail・pairs[0].rows[1] で解け、矛盾なし。2014h26a-q024 (委託先選定の手順の並べ替え、正答 a→d→c→b) は §4 の D-211 経路。topic 内未引用題 (2011h23a-q025 RFP の目的 = 提案から最適な依頼先、誤答 = 技術情報・候補の絞り込み [= RFI 側] / 2015h27h-q016 / 2019h31h-q016 / 2010h22h-q004 / 2011h23tokubetsu-q004 / 2017h29h-q009 [ベンダが提案するのは実施体制]) とも矛盾なし。
4. **D-198 写し**: validate copy guard 0 件、`warn choice-echo` 0 件。独立照合: 単元の JP 文字列 73 本 (派生除く、図ラベル・caption・総表・対比表を含む) × topic 全 38 題の題文 + 選択肢を 12 字窓で照合 (句読点・記号・空白除去)。カタカナ 4 字以上・英数・見出し語を遮蔽 → 0 件、**遮蔽なし → 0 件**。近似一致 (編集距離 1〜2): `terms[0].hook_jp`「R・F は Request For」↔ 2009h21h-q003 の略語展開 (見出し語の正式名、偽陽性) / `terms[1].one_jp`「システムの要件や調達条件」↔ 2018h30h-q033「導入システムの概要や調達条件」(ed 2/12 = 0.17; RFP の標準定義の定型句で 2019h31h-q016・2026r08-q020 も同じ要素を挙げる。前後の文脈・構文は別で、D-198「標準的な定義の一般表現」に当たる → 偽陽性、O1)。カタカナの多い文 (RFI / RFP の one・hook、契約ガイドライン detail・fig) を目視、題の表現の流用なし。
5. **D-195**: one 1 文 ×4 (太字あり)、detail 2〜3 文、比喩は別場面 (不動産会社の資料 / 工務店への依頼書 / 家電の省エネ表示 / 新メニューの試作)、hook は RFI のみ (頭字語の展開、定義の言い換えではない)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh・en 相当語) → ヒットは全て通常用法 (「選ぶ」= 発注先を選ぶ、「選択肢」= RFI analogy の物件の選択肢、「出る」= 性能が出る、zh「必须遵守」= 義務の否定文、en exam は `kind` 値と "examples"、"test" = 検証) で定型締め句 0。図: RFP = flow steps 4、契約ガイドライン = flow steps 4 (登録内)。pair 1 組 (RFI / RFP 4 行、key 1 行)。
6. **D-200**: 考点数 2/3/1/1 (≤3)、各 JP 1〜2 文・50〜76 字 (≤100)。framing (validateV2 `pointFraming`): jp 0 / zh 0 / en 0。
7. **三語**: zh・en の事実の追加・欠落なし、図ラベル・caption・比較行の三語一致 (parity 0 diff)、`[[jp:…]]` 原語 12 種 (RFI / 情報 / RFP / 提案書 / 評価基準 / グリーン調達 / 環境への負荷 / グリーン購入法 / 環境配慮設計 / AI・データの利用に関する契約ガイドライン / 経済産業省 / 探索的段階型) が jp 本文に実在 (全 ok)、one_zh / one_en 4/4 に見出し語の `[[jp:]]` (RFI / RFP は英字略語で zh 側に `[[jp:RFI]]`・`[[jp:RFP]]`)。zh 訳語: validate B6 warn 0。
8. **D-205 / D-210 一次確認** (§3)。
9. **機械ゲート**: §7 に出力全文。

## 2. 用語別判定 (4 / 4)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | RFI | OK — exam 1 / 5 題: ベンダから技術・製品・事例などの情報を得て、実現の見通しや依頼先を見極める材料にする (2019r01a-q016 正答 = 情報収集で技術的課題・実現性を把握、誤答 = 詳細見積で契約確定・提案書で発注先決定 / 2016h28a-q014 正答 = 依頼してよいベンダかの判断材料、誤答 = 開発計画・体制、正式見積、NDA / 2025r07-q013 正答 RFI = 活用事例・技術情報 / 2022r04-q008 正答 = 適用可能な技術と動向、誤答 = 現行概要・狙い・要件 [発注側が出すもの; pairs[0].rows[1] の発注側が示すもの「実現したいことや業務のあらまし」と整合] / 2014h26h-q007 正答 = RFI→技術動向調査書・RFP→提案書)。「など」保持 / mix: 具体的な提案と見積りは RFP (2016h28a-q014 ウ・2019r01a-q016 ア の誤答と整合)。**attempt 1 の MEDIUM (RFI を必須段階と言い切り) は解消**: RFP 図 n1「必要に応じて RFI で情報を集める」/ zh「必要时先用 RFI」/ en "if needed"、steps[0] caption 三語とも「必要に応じて / 必要时 / If needed」、key_points から手順の言い切りが消えた。pairs[0].rows[0]「調達の初め、発注内容を固める前」は出す場合の時期で必須とは言わない | OK | zh/en の「依頼先を見極める」の訳 → L1 | L1 |
| 2 | RFP | OK — exam 3 / 11 題: 発注側が作ってベンダに渡し、ベンダが応えて返すのが提案書 (2009h21h-q003 正答 情シス→ベンダ / 2013h25a-q017 正答 依頼元が作成 / 2026r08-q020 正答 発注者が調達条件などを示す / 2018h30h-q033 正答 RFP) — 2 文目は RFP と提案書の正の定義の対比 (D-209 の二語対比、誤答の場面の再演ではない) / 中心は実現してほしい機能などの要件と調達条件、実現方法はベンダが提案書で示す (2017h29a-q034 正答 = 実現すべき機能 / 2017h29h-q018 正答 = 発注側が概要を示す / 2023r05-q032 正答 = 導入目的・機能概要を示し提案書を求める)。「中心」で「だけ」と限らず、q034 の誤答肢 4 つの組は再現しない / 提案書はあらかじめ決めた評価基準で比べて選ぶ、例えば重み付き合計 (2010h22a-q004 正答 = 事前設定の評価基準、誤答 = 最安・SWOT・FP 法 / 2017h29h-q041 正答 評価基準 / 2015h27a-q009・2018h30a-q015 再計算一致)。限定条件「前もって決めた」保持。flow steps 4 は 2010h22h-q004・2011h23tokubetsu-q004 の手順図とも一致 | OK (図の並び → L3) | zh 図ラベル「提出」→ L2 | L2, L3, L4 |
| 3 | グリーン調達 | OK (引用題なし) — 価格・品質に加えて環境負荷の小ささを購入の基準に入れる (標準定義)、mix: 購入側の選定基準 / 作る側の環境配慮設計 (エコデザイン) との区別は正しい。detail のグリーン購入法 = 国の機関などに環境に配慮した物品の調達を求める法律: 一次確認 (§3) と一致 | OK | OK | なし |
| 4 | AI・データの利用に関する契約ガイドライン | OK (引用題なし) — 経済産業省、2018 年公表、データ編と AI 編、AI 編の探索的段階型 (アセスメント → PoC → 開発 → 追加学習、段階ごとに契約)、法的拘束力なし: 一次確認 (§3) と一致。D-205: 構成・段階は版 (2018 年公表) を明記しており、1.1 版 (2019 年 12 月) でも同じ構成・段階 → 言い切りに当たらない。データ編の契約類型の数 (3 類型) は書いておらず、数の言い切りなし。図の 4 段階は AI 編の段階の全部 (閉じた列挙の欠落なし、型 10 非該当) | OK | OK | なし |

**単元レベル**: goals 3・overview_cols 2・overview_rows 4・pairs 1 組 4 行 (key = rows[2] 受け取るもの)・key_points 4・summary (派生、本体と一致)・challenge 5 題 (§1-3)。key_points[0] は「示すのも選ぶのも発注側、ベンダは応えて提案」= 役割の要約で、attempt 1 の「RFP 提示 → 提案書評価 → 決定と契約」の並びは消えた (三語とも)。goals[1] も「評価基準で比べて発注先を選ぶ」のみで手順の並びを持たない (三語とも)。事実誤りなし。

## 3. D-205 / D-210 一次確認・D-211

- **契約ガイドライン**: 経済産業省の改訂履歴 (1.1 版 PDF の目次・改訂履歴、検索結果から) = 平成 30 年 6 月 初版、令和元年 12 月 1.1 版 (データ編の限定提供データ対応の改訂)。初版はデータ編・AI 編の 2 編構成。AI 編は法的拘束力なし (AI 編の位置づけ)。探索的段階型 = アセスメント段階・PoC 段階・開発段階・追加学習段階 (解説記事 monolith.law、ガイドラインに沿う段階区分と各段階の契約)。METI の PDF 本体は 403 で直接取得できず、改訂履歴・目次の検索スニペットと二次資料での確認 (確信度: 年・構成・法的拘束力 = 高、段階名 = 中〜高、IT パスポート シラバス水準の標準記述と一致)。本文の「2018 年に公表」「データ編と AI 編」「段階ごとに契約」「法律で義務づけるものではない」は全て一致。D-205 の版の明記あり。
- **グリーン購入法** (国等による環境物品等の調達の推進等に関する法律、平成 12 年法律第 100 号; 環境省資料): 国・独立行政法人等に環境物品等の調達推進を義務づけ (地方公共団体は努力義務)。本文「国の機関などに…調達を求める」は一致 (「など」で独法を含む、地方公共団体を義務主体と言わない)。対象は「物品等 (物品及び役務)」で本文の「物品」はやや狭いが、IT パスポート水準の説明として誤りではない (記録不要の水準)。
- **D-210**: 改正前の文言に基づく引用題なし (グリーン調達・ガイドラインとも引用題 0)。
- **D-211 (並べ替え題)**: 2014h26a-q024 は exam 考点の qids に置かれず challenge のみ (quiz のみの出口どおり)。exam 考点を外しても、学習目標「調達の基本的な流れ」は RFP 図 (steps 4) と考点 3 (評価基準で選ぶ) が担い、欠落なし。図 n2〜n4 の並びが同題の正答順と重なる点は L3 (記録のみ)。

## 4. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 6 (うち 建議修 2)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[0].points[0].text_zh` / `text_en` | jp「依頼先を見極める材料」(= 依頼してよいベンダかの見極め、2016h28a-q014 正答) に対し、zh「选择委托对象的依据」/ en "choosing whom to ask" は「依頼先を選ぶ」寄りに読め、同考点の引用題 2019r01a-q016 の誤答 (提案書で発注先を決定) や RFP 側の「选定发包对象」に近づく (型 6 の傾向; 「依据 / material for」で決定とまでは言わず、pairs[0].rows[3] は「候补」"shortlisting" と正しいので LOW) | zh「备齐判断能否实现以及选择委托对象的依据」→「备齐判断能否实现以及筛选候选委托对象的依据」/ en "material for judging feasibility and choosing whom to ask." → "material for judging feasibility and shortlisting vendors it could ask to do the work." (jp 変更なし) |
| L2 | LOW **建議修** | `terms[1].fig.data.nodes[1].label.zh` / `terms[1].fig.steps[1].caption_zh` | 「提出 RFP」の「提出」は「提出・提案する」の意にも読め、ベンダ側が出すようにも取れる (2009h21h-q003・2013h25a-q017・2017h29h-q018 の誤答 = ベンダ側が示す・作る)。caption は「向供应商」で向きが明確、RFP points[0] zh も正しいため LOW。loc-review #1 の指摘が未適用 | label.zh「提出 RFP」→「发出 RFP」/ caption_zh「向供应商提出汇总了需求和采购条件的 RFP。」→「向供应商发出汇总了需求和采购条件的 RFP。」 |
| L3 | LOW | `terms[1].fig.data.nodes[1..3]` / `fig.steps[1..3]` (三語) | 図の n2「RFP を示す」→ n3「提案書を評価する」→ n4「発注先を決めて契約する」が 2014h26a-q024 (challenge) の正答順 a→d→c→b と重なる。ただし (1) topic の objective が調達の流れで D-195 §2 の段階図、(2) 2010h22h-q004・2011h23tokubetsu-q004 の手順図にも同じ標準手順、(3) attempt 1 で問題になった goals・key_points での再掲は三語とも消え 1 箇所のみ、(4) c・b を 1 ノードに統合、(5) q024 は D-211 どおり exam 考点なし → (iii) に当てない (jp-review #1 と同判断) | 記録のみ |
| L4 | LOW | `terms[1].analogy_jp/zh/en` | 依頼書に「予算」を書く像は、未引用の topic 題 2015h27h-q016 の誤答 (RFP の目的 = 概算委託額の提示) に僅かに寄るが、目的ではなく記載事項の一例で、実務の RFP の調達条件に予算上限を含む例は普通。誤答を選ばせる強さはない | 記録のみ |
| L5 | LOW | `key_points_jp[0]` ↔ `terms[1].points[0]`、`key_points_jp[1]` ↔ `terms[1].points[2]`、`key_points_jp[3]` ↔ `terms[3].points[0]` (三語) | §9 同義の言い直し (D-203)。jp-review #1 の low と同じ | 記録のみ |
| L6 | LOW | `overview_rows[2].extra_jp[1]` / `terms[2].points[0]` ↔ `terms[2].detail_jp` 2 文目 | 総表・mix 考点は「何を買うか」の基準と書き、detail は取引先選定にも広げる。「だけ」で限らないので矛盾ではない (jp-review #1 と同じ) | 記録のみ |

**範囲外の観察**:
- O1 独立照合の近似一致 2 件は略語の正式名展開 / RFP の標準定義の定型句の偽陽性 (§1-4)。
- O2 `terms[3].fig.steps[2].caption_*` の「学習済みモデル」は未定義語 (AI の基本語、文脈で推測可; jp-review #1 low)。loc-review の他の zh 現地化 low (体制 / 追加学习 / 导入案例 / 的の重なり) と en の文数差は意味に影響せず、本監査では指摘しない。

確認済みで問題なし: attempt 1 の MEDIUM 2 件の解消 (RFI 必須の言い切り = 三語とも「必要に応じて / 必要时 / if needed」; key_points[0] の並べ替え題の順序再現 = 三語とも消滅、goals[1] も手順の並びなし)、限定条件 (考点 7 件全て保持)、§9 禁止句 0、framing 0/0/0、D-197 (validate 0)、D-200、写し (validate 0 + 独立照合 遮蔽あり・なし 0)、`[[jp:]]` 原語 12 種実在、zh 訳語表 (B6 warn 0)、図種 (flow steps ×2 = 登録内)、D-205 (版明記、一次確認一致)、D-210 (対象なし)、D-211 (q024 は challenge のみ)、派生フィールド一致、v1 不変量。

## 5. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **6** (建議修 2: L1・L2 / 記録のみ 4: L3〜L6) |

## 6. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 4 用語・考点 7 件・引用 16 題 + 未引用 challenge 2 題で、考点は正答と一致し誤答肢を支持せず、限定条件の落ちなし。attempt 1 の MEDIUM 2 件は三語とも解消。契約ガイドライン・グリーン購入法の記述は一次確認 (経済産業省改訂履歴・環境省資料) と一致。L1・L2 は補丁 (B3) で修正推奨。

## 7. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-07-24-u01
✓ strategy-07-24-u01 unit: 0 issues (data/ip/textbook/units/strategy-07-24-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-07-24-u01
✓ strategy-07-24-u01 parity: 22 locations, 0 diff
EXIT=0
```

出典: [経済産業省 契約ガイドライン 1.1 版 PDF](https://www.meti.go.jp/policy/mono_info_service/connected_industries/sharing_and_utilization/20200619002.pdf) (改訂履歴、検索経由)、[monolith.law 解説](https://monolith.law/corporate/ai-guidelines)、[BUSINESS LAWYERS](https://www.businesslawyers.jp/articles/449)、[環境省 グリーン購入法資料](https://www.env.go.jp/content/000067259.pdf)、[新潟県 解説](https://www.pref.niigata.lg.jp/sec/kankyoseisaku/1222970539207.html)。
