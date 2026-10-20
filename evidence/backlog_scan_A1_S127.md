# A1 — ⑨ backlog 決定的走査 (D-150 §4 段 1、0 token) — S127

- 脚本: `scripts/quiz-backlog-scan-A1.mjs` (読み取り専用、冪等)。候補 JSON: `evidence/phase5/stage_06_quiz_fidelity/backlog_scan_A1_S127.json`
- 母数: 2900 題 = pop (⑤-2 母数内) 1208 / excluded (母数 excluded) 392 / 13exam 1300。figure_description は question_bank.json (gitignored) の 265 題
- ICU 78.3 / Unicode 17.0 (0c.isolated_kanji は Intl.Segmenter の辞書に依存)。**再実行で byte 一致するのは、同じ入力 sha と同じ ICU 版の環境に限る** — とくに question_bank.json は gitignored で、無い環境では fig 層・2 の cross・T.num_vs_fig が変わる
- 入力 sha256 (先頭 16): questions.json `57cc7bfdf1cd623b`、question_bank.json `8961728d731395ad`
- 走査層: jp = 表示層 (stem は stem_jp_clean があればそれ、無ければ questions.json の stem_jp。選択肢は choices_jp = raw がそのまま表示、quizModel.ts:120 と同じ規則) / jp_raw = clean を持つ題の raw stem_jp (学習者不可視) / zh・en = translations sidecar / fig = figure_description (型 2 と T の sub-flag だけ)。**射程外**: explanations 本文 (0c の語頻度表にだけ使用)、by_year・question_bank の stem / choices、`.phase1`。
- 区分: `full52_population_S118.json` の excluded id → excluded、population に無い exam → 13exam、それ以外 → pop。
- **件数は源照合 (A2) に回す候補であり、欠陥数ではない。** 1 題に複数ルールが当たる。表の数は「題数 (distinct question)」、hits は出現数。

## 0. 要約

- 候補のある題 991 / 2900。型別の題数は §1 の各「計」行。
- recall — 非 T 型の recall: **45 / 50**
- recall — T 型 (fig_stem_mismatch 17 題) を数値不一致 sub-flag (T.num_raw_clean / num_vs_fig / num_vs_tr のいずれか) で判定した recall: **12 / 17** (うち T.num_raw_clean だけで 9 / 17。num_vs_fig は §4 のとおり FP が大半なので、確度の高い値は後者)。
- recall — 参考: fig_stem_mismatch 17 題のうち stem に表がある (T.table) のは 14 / 17 だが、T.table は表を持つ 289 題すべてに当たる構造ルールなので recall には数えない
- recall — **注意: 既知実例の多くはルール設計時に参照したので、この recall は楽観側の値である** (未知の同型に対する recall ではない)
- 漏れの理由は §3 の後。**方式 A では原理的に見えない型** (流暢な実在語への置換・言い換え) が実例で確認された: `2026r08-q066` 煩雑→複雑、`2026r08-q041 ウ` その他理的 (本命未検出)、`2016h28h-q009` 4社←A社、`2022r04-q018 ウ` 言い換え。
- A2 (源照合) の推奨対象は §5 (§5 の表は field 数、ここの括弧内の区分別は題数)。規模の目安: 0a 優先 386 field / 386 題 (pop 105 / excluded 77 / 13exam 204)、0b 35 field / 23 題 (pop 5 / excluded 5 / 13exam 13)、0c (jp 異常、rare_kanji 除く) 71 field / 53 題 (pop 15 / excluded 7 / 13exam 31)、7 (散文類) 66 field / 59 題 (pop 32 / excluded 7 / 13exam 20)、2 cross 23 field / 23 題 (pop 10 / excluded 7 / 13exam 6)。
- 本走査は**候補の抽出だけ**を行う。どの候補も源画像とは照合していない。FP 所見 (§4) は sub-tag の比率と、候補抜粋の目視 (源を見ない) による印象であり、源照合の結果ではない。

## 1. 型 × ルール × 区分の件数

区分列は**題数**。fields = (題, 層, field) の distinct 数。

### 型 0a — s975 / clean 推測補完 (raw↔clean)

計: hits 1676 / fields 515 / 題 515 (pop 132 / excluded 95 / 13exam 288)

| ルール @ 層 | hits | fields | 題 | pop | excluded | 13exam |
|---|---:|---:|---:|---:|---:|---:|
| 0a.char @ jp_raw→jp | 190 | 140 | 140 | 43 | 28 | 69 |
| 0a.ins @ jp_raw→jp | 344 | 140 | 140 | 17 | 30 | 93 |
| 0a.num @ jp_raw→jp | 908 | 351 | 351 | 77 | 57 | 217 |
| 0a.region @ jp_raw→jp | 14 | 12 | 12 | 0 | 2 | 10 |
| 0a.word @ jp_raw→jp | 220 | 103 | 103 | 13 | 37 | 53 |

| ルール / sub | hits | fields | 題 | pop | excluded | 13exam |
|---|---:|---:|---:|---:|---:|---:|
| 0a.char / char/prose/raw_fluent | 117 | 98 | 98 | 31 | 19 | 48 |
| 0a.char / char/prose/raw_garbled | 39 | 34 | 34 | 13 | 2 | 19 |
| 0a.char / char/struct/raw_fluent | 17 | 11 | 11 | 0 | 4 | 7 |
| 0a.char / char/struct/raw_garbled | 17 | 13 | 13 | 3 | 6 | 4 |
| 0a.ins / ins/prose/raw_fluent | 182 | 82 | 82 | 6 | 20 | 56 |
| 0a.ins / ins/prose/raw_garbled | 59 | 42 | 42 | 1 | 10 | 31 |
| 0a.ins / ins/struct/raw_fluent | 73 | 36 | 36 | 9 | 6 | 21 |
| 0a.ins / ins/struct/raw_garbled | 30 | 23 | 23 | 2 | 6 | 15 |
| 0a.num / num/prose/raw_fluent | 297 | 185 | 185 | 44 | 32 | 109 |
| 0a.num / num/prose/raw_garbled | 128 | 85 | 85 | 18 | 10 | 57 |
| 0a.num / num/struct/raw_fluent | 359 | 128 | 128 | 16 | 26 | 86 |
| 0a.num / num/struct/raw_garbled | 124 | 70 | 70 | 11 | 12 | 47 |
| 0a.region / region/prose/raw_fluent | 5 | 4 | 4 | 0 | 1 | 3 |
| 0a.region / region/prose/raw_garbled | 8 | 7 | 7 | 0 | 0 | 7 |
| 0a.region / region/struct/raw_garbled | 1 | 1 | 1 | 0 | 1 | 0 |
| 0a.word / word/prose/raw_fluent | 121 | 74 | 74 | 7 | 31 | 36 |
| 0a.word / word/prose/raw_garbled | 37 | 22 | 22 | 3 | 5 | 14 |
| 0a.word / word/struct/raw_fluent | 37 | 21 | 21 | 1 | 9 | 11 |
| 0a.word / word/struct/raw_garbled | 25 | 19 | 19 | 2 | 5 | 12 |

代表例 (ルールごとに先頭 3 件、id 順):

- `2009h21a-q009` jp_raw→jp stem [0a.char / char/prose/raw_garbled] (13exam) 「資」→「責」 raw「職能部門の職能的資任との調和を図る」→ clean「職能部門の職能的責任との調和を図る」
- `2009h21a-q014` jp_raw→jp stem [0a.char / char/prose/raw_fluent] (13exam) 「問」→「間」 raw「ィとエンティティ問の関係をE-R図」→ clean「ィとエンティティ間の関係をE-R図」
- `2009h21a-q017` jp_raw→jp stem [0a.char / char/struct/raw_fluent] (13exam) 「タ」→「ケ」 raw「箇する梨馬アプリタ-ション\|\|O.」→ clean「働する業務アプリケ-ション\|\|〇\|」
- `2009h21a-q036` jp_raw→jp stem [0a.ins / ins/prose/raw_fluent] (13exam) 「」→「,縦軸」 raw「%)人見積80""コス.に"収ま」→ clean「コスト(万円)",縦軸"見積りコストに」
- `2009h21a-q044` jp_raw→jp stem [0a.ins / ins/prose/raw_fluent] (13exam) 「」→「手順は次の流れになっている.[]→[A]→[]→[]」 raw「るものはどれか.」→ clean「るものはどれか.手順は次の流れになっている.[]→[A]→[]→[]」
- `2009h21a-q089` jp_raw→jp stem [0a.ins / ins/prose/raw_fluent] (13exam) 「」→「.図(DFD):-"顧客"→(注文依頼)→処理(プロセス)-その処理→デ-タスト…」 raw「の組合せはどれか.」→ clean「の組合せはどれか.図(DFD):-"顧客"→(注文依頼)→処理(プロセス)-その処理→デ-タストア"[a]"-デ-タスト…」
- `2009h21a-q012` jp_raw→jp stem [0a.num / num/struct/raw_garbled] (13exam) 「[図](1)→(2)→(3)→(4)→実行計画策定」→「」 raw「うものはどれか.[図](1)→(2)→(3)→(4)→実行計画策定」→ clean「うものはどれか.」
- `2009h21a-q017` jp_raw→jp stem [0a.num / num/prose/raw_fluent] (13exam) 「4」→「A」 raw「ビスを行っている4社は,B社に対し」→ clean「ビスを行っているA社は,B社に対し」
- `2009h21a-q030` jp_raw→jp stem [0a.num / num/prose/raw_fluent] (13exam) 「--アァュ-イ3ウ4エ5"」→「」 raw「ないものとする.--アァュ-イ3ウ4エ5"」→ clean「ないものとする.」
- `2009h21a-q095` jp_raw→jp stem [0a.region / region/prose/raw_garbled] (13exam) 「〔ス」→「N社の営業部では,今年度の販売戦略立案に向けて,前年度の商品売上実績を売上総利益…」 raw「〔ストラテジ〕N社で」→ clean「N社の営業部では,今年度の販売戦略立案に向けて,前年度の商品売上実績を売上総利益率,商品回転率及び売上構成比率の視点で分…」
- `2010h22h-q094` jp_raw→jp stem [0a.region / region/prose/raw_garbled] (13exam) 「jp」→「デ-タの源泉・吸収)から"a処理"へ,および"社員"から"c処理"へデ-タが流れ…」 raw「合せはどれか.(jp処理下記ロコ=吾」→ clean「D〕-"社員"(デ-タの源泉・吸収)から"a処理"へ,および"社員"から"c処理"へデ-タが流れる.-"a処理"と"b表…
- `2011h23a-q096` jp_raw→jp stem [0a.region / region/prose/raw_garbled] (13exam) 「〔マ」→「M社は装飾品販売会社である.M社では新たな事業として,一般消費者に対するインタ-」 raw「〔マネジメント〕M社」→ clean「M社は装飾品販売会社である.M社では新たな事業として,一般消費者に対するインタ-ネットを用いたア」
- `2009h21a-q017` jp_raw→jp stem [0a.word / word/prose/raw_garbled] (13exam) 「梨馬」→「業務」 raw「-タ上で電箇する梨馬アプリタ-ション」→ clean「-タ上で稼働する業務アプリケ-ション」
- `2009h21a-q036` jp_raw→jp stem [0a.word / word/prose/raw_fluent] (13exam) 「%)人」→「図:横軸"」 raw「ことが妥当か.(%)人見積80""コス」→ clean「ことが妥当か.(図:横軸"見積りコスト(万」
- `2009h21a-q041` jp_raw→jp stem [0a.word / word/prose/raw_garbled] (13exam) 「意斉」→「憲章」 raw「に,プロジェクト意斉を定める.プロジ」→ clean「に,プロジェクト憲章を定める.プロジ」

0a 不計上の内訳 (clean 保有 1677 題、hunk 計 3220): 削除のみ 450 / 記号のみ 935 / 同形字 1 字置換 2 / 1 字挿入 157 / LCS 上限超 0 題

### 型 0b — 訳層の数字・英字の不対応

計: hits 47 / fields 35 / 題 23 (pop 5 / excluded 5 / 13exam 13)

| ルール @ 層 | hits | fields | 題 | pop | excluded | 13exam |
|---|---:|---:|---:|---:|---:|---:|
| 0b.abbr_missing @ en | 7 | 7 | 4 | 0 | 2 | 2 |
| 0b.abbr_missing @ zh | 7 | 7 | 4 | 2 | 2 | 0 |
| 0b.label_extra @ zh | 1 | 1 | 1 | 1 | 0 | 0 |
| 0b.num_extra @ en | 6 | 6 | 5 | 0 | 2 | 3 |
| 0b.num_extra @ zh | 4 | 4 | 3 | 0 | 1 | 2 |
| 0b.num_missing @ en | 16 | 16 | 12 | 2 | 2 | 8 |
| 0b.num_missing @ zh | 6 | 6 | 2 | 0 | 1 | 1 |

代表例 (ルールごとに先頭 3 件、id 順):

- `2011h23a-q065` en stem [0b.abbr_missing] (13exam) jp 略語 {OA} が en に無い｜jp「関係データベースの A 表，B 表がある。A 表，B 表に対して(A∪B)，(A∩B)を行った結果は…」｜en「There is a table A and a table B in a relational database. F……
- `2012h24a-q042` en stem [0b.abbr_missing] (13exam) jp 略語 {BC} が en に無い｜jp「プロジェクトメンバ A, B, C の3者間で直接一対一でコミュニケーションをする場合には, AB …」｜en「When project members A, B, and C communicate directly one-to……
- `2019r01a-q047` en choice.ア [0b.abbr_missing] (excluded) jp 略語 {KS} が en に無い｜jp「[表] 機能1：開発規模(KS) 10／A工程の不良件数(件) 6／B工程の不良件数(件) 3」｜en「Function 1」
- `2024r06-q041` zh stem [0b.label_extra] (pop) zh 単字ラベル {C,D} が jp に無い｜jp「あるプロジェクトの作業間の関係と所要時間がアローダイアグラムで示されている。このアローダイアグラムの…」｜zh「某项目各项作业之间的关系和所需时间用箭线图（Arrow Diagram）表示。在该箭线图的 B、C、D、E 这四个…
- `2011h23tokubetsu-q093` en stem [0b.num_extra] (13exam) en 数字 {10} が jp に無い｜jp「Q社のRさんは，チケット販売システムの開発で使用する関数のプログラミングとテストを実施しようとしてい…」｜en「Mr. R of Company Q is about to carry out the programming and……
- `2011h23tokubetsu-q094` en stem [0b.num_extra] (13exam) en 数字 {10} が jp に無い｜jp「Q社のRさんは，チケット販売システムの開発で使用する関数のプログラミングとテストを実施しようとしてい…」｜en「Mr. R of Company Q is about to carry out the programming and……
- `2013h25h-q059` zh choice.エ [0b.num_extra] (13exam) zh 数字 {2} が jp に無い｜jp「ピアツーピアシステム」｜zh「对等网络（P2P）系统」
- `2009h21h-q098` en stem [0b.num_missing] (13exam) jp 数字 {2} が en に無い｜jp「通信販売を行っているF社には，毎週ほぼ一定の注文が届く。届いた注文は，1週間分をまとめておいて，その…」｜en「Company F, which conducts mail-order sales, receives a rough…」
- `2009h21h-q099` en stem [0b.num_missing] (13exam) jp 数字 {2} が en に無い｜jp「通信販売を行っているF社には，毎週ほぼ一定の注文が届く。届いた注文は，1週間分をまとめておいて，その…」｜en「Company F, which conducts mail-order sales, receives a rough…」
- `2012h24h-q087` en stem [0b.num_missing] (13exam) jp 数字 {2} が en に無い｜jp「Fさんは，価格，性能，サービスのそれぞれについて，機種A～Dの2機種ごとに，全ての組合せで優劣を比較…」｜en「For each of price, performance, and service, Mr. F compared …」

### 型 0c — jp 異常字 + その訳

計: hits 430 / fields 402 / 題 95 (pop 36 / excluded 12 / 13exam 47)

| ルール @ 層 | hits | fields | 題 | pop | excluded | 13exam |
|---|---:|---:|---:|---:|---:|---:|
| 0c.R3 @ jp | 21 | 21 | 12 | 4 | 0 | 8 |
| 0c.isolated_kanji @ jp | 62 | 53 | 43 | 11 | 7 | 25 |
| 0c.rare_kanji @ jp | 75 | 66 | 47 | 22 | 7 | 18 |
| 0c.symbol @ jp | 4 | 4 | 1 | 0 | 0 | 1 |
| 0c.tr_of_anomaly @ en | 134 | 134 | 95 | 36 | 12 | 47 |
| 0c.tr_of_anomaly @ zh | 134 | 134 | 95 | 36 | 12 | 47 |

| ルール / sub | hits | fields | 題 | pop | excluded | 13exam |
|---|---:|---:|---:|---:|---:|---:|
| 0c.R3 | 21 | 21 | 12 | 4 | 0 | 8 |
| 0c.isolated_kanji | 62 | 53 | 43 | 11 | 7 | 25 |
| 0c.rare_kanji | 75 | 66 | 47 | 22 | 7 | 18 |
| 0c.symbol | 4 | 4 | 1 | 0 | 0 | 1 |
| 0c.tr_of_anomaly / R3 | 28 | 28 | 11 | 4 | 0 | 7 |
| 0c.tr_of_anomaly / R3,symbol | 8 | 8 | 1 | 0 | 0 | 1 |
| 0c.tr_of_anomaly / isolated_kanji | 96 | 96 | 39 | 11 | 5 | 23 |
| 0c.tr_of_anomaly / isolated_kanji,R3 | 4 | 4 | 2 | 0 | 0 | 2 |
| 0c.tr_of_anomaly / isolated_kanji,rare_kanji | 4 | 4 | 2 | 0 | 2 | 0 |
| 0c.tr_of_anomaly / isolated_kanji,rare_kanji,R3 | 2 | 2 | 1 | 0 | 0 | 1 |
| 0c.tr_of_anomaly / rare_kanji | 126 | 126 | 44 | 22 | 5 | 17 |

代表例 (ルールごとに先頭 3 件、id 順):

- `2009h21a-q018` jp choice.ア [0c.R3] (13exam) 「」 が 1/0｜…。                   「-                   …
- `2010h22h-q008` jp stem [0c.R3] (13exam) “” が 1/0｜経営戦略が策定され, その戦略の一つに “営業部門の組織力強化"が掲げられた。⏎こ…
- `2010h22h-q040` jp choice.ア [0c.R3] (13exam) “” が 2/0｜ワークシート “上半期" , ワークシート “下半期" …
- `2009h21a-q018` jp choice.ア [0c.isolated_kanji] (13exam) 了表｜一会肝期間ごとに決算を行い, 貸借対了表や損益計算書などの財務諸表の作成が …
- `2009h21a-q062` jp stem [0c.isolated_kanji] (13exam) 次表｜…英字からなる文字列の暗号化を考える。次表で英字を文字番号に変換し，変換後の文…
- `2009h21h-q031` jp choice.ウ [0c.isolated_kanji] (13exam) 相次｜…期では, 他社からのマーケット参入が相次ぎ, 競争が激しくなる。
- `2009h21a-q018` jp choice.ウ [0c.rare_kanji] (13exam) 賭｜凡務賭表規則や企業会計原則, 各種会計基準…
- `2009h21a-q060` jp choice.ア [0c.rare_kanji] (13exam) 酸｜…\| 甘味 \| うま味 \| 塩味 \| 酸味 \| 苦味 \|⏎\| ア \| 000…
- `2009h21h-q041` jp choice.ウ [0c.rare_kanji] (13exam) 悲｜見積担当者の経験から楽観値や悲観値を割り出してソフトウェアの規模を…
- `2015h27h-q100` jp choice.ア [0c.symbol] (13exam) [] が 0/3｜件数表示（［性能=0] and ［価格=1] and ［デ…
- `2009h21a-q018` en choice.ア [0c.tr_of_anomaly / isolated_kanji,R3] (13exam) jp「一会肝期間ごとに決算を行い, 貸借対了表や損益計算書などの財務諸表の作成が   ーー強制される。  …」｜en「Settlement is performed each accounting period, and the preparation of financial……
- `2009h21a-q060` en choice.ア [0c.tr_of_anomaly / rare_kanji] (13exam) jp「[表] 味覚符号表（行ア）:⏎\| \| 甘味 \| うま味 \| 塩味 \| 酸味 \| 苦味 \|⏎\| ア \|…」｜en「\| \| Sweetness \| Umami \| Saltiness \| Sourness \| Bitterness \|⏎\| A \| 000000 \| 00000……
- `2009h21a-q062` en stem [0c.tr_of_anomaly / isolated_kanji] (13exam) jp「小文字の英字からなる文字列の暗号化を考える。次表で英字を文字番号に変換し，変換後の文字番号について1…」｜en「Consider encrypting a string consisting of lowercase letters. Using the table be……

### 型 0q — ASCII "

計: hits 990 / fields 391 / 題 177 (pop 52 / excluded 29 / 13exam 96)

| ルール @ 層 | hits | fields | 題 | pop | excluded | 13exam |
|---|---:|---:|---:|---:|---:|---:|
| 0q.en @ en | 169 | 169 | 118 | 44 | 9 | 65 |
| 0q.literal @ jp_raw | 5 | 1 | 1 | 1 | 0 | 0 |
| 0q.prose @ jp | 188 | 60 | 33 | 9 | 5 | 19 |
| 0q.prose @ jp_raw | 421 | 105 | 105 | 24 | 25 | 56 |
| 0q.prose @ zh | 207 | 56 | 29 | 8 | 5 | 16 |

代表例 (ルールごとに先頭 3 件、id 順):

- `2009h21a-q008` en stem [0q.en] (13exam) " ×2｜…llowing describes "fabless"?
- `2009h21a-q097` en stem [0q.en] (13exam) " ×8｜…e-item table. The "Total" row carries…
- `2009h21a-q098` en stem [0q.en] (13exam) " ×8｜…e-item table. The "Total" row carries…
- `2024r06-q062` jp_raw stem [0q.literal] (pop) …: stringOutput で "" // 空文字列を格納 整数型: i…
- `2009h21a-q036` jp_raw stem [0q.prose] (13exam) …妥当か。⏎(%) 人 見 積 80 " 「 コ ス 。 に 「 収 ま 確…
- `2009h21a-q060` jp_raw stem [0q.prose] (13exam) "甘味"，"うま味"，"塩味"，"酸味"，"…
- `2009h21a-q062` jp_raw stem [0q.prose] (13exam) …gca⏎⏎この手続で暗号化した結果が"tmb"であるとき，元の文字列はどれ…

### 型 1 — 見出し混入

計: hits 44 / fields 44 / 題 37 (pop 3 / excluded 7 / 13exam 27)

| ルール @ 層 | hits | fields | 題 | pop | excluded | 13exam |
|---|---:|---:|---:|---:|---:|---:|
| 1.head @ en | 2 | 2 | 2 | 1 | 1 | 0 |
| 1.head @ jp | 2 | 2 | 2 | 1 | 1 | 0 |
| 1.head @ jp_raw | 7 | 7 | 7 | 1 | 4 | 2 |
| 1.head @ zh | 2 | 2 | 2 | 1 | 1 | 0 |
| 1.mid @ en | 1 | 1 | 1 | 0 | 0 | 1 |
| 1.mid @ jp | 1 | 1 | 1 | 0 | 0 | 1 |
| 1.mid @ jp_raw | 28 | 28 | 28 | 0 | 3 | 25 |
| 1.mid @ zh | 1 | 1 | 1 | 0 | 0 | 1 |

代表例 (ルールごとに先頭 3 件、id 順):

- `2010h22h-q035` jp_raw stem [1.head] (13exam) 問35　図のアローダイアグラムで，A から…
- `2010h22h-q092` jp_raw stem [1.head] (13exam) 問92 Sさんは、作業期間見積りを行い、作…
- `2015h27a-q089` en stem [1.head] (excluded) Q89 To calculate the …
- `2009h21h-q092` jp_raw stem [1.mid] (13exam) 〔テクノロジ〕⏎問92 Mさんは，今回の障害の原因を特定する…
- `2009h21h-q096` jp_raw stem [1.mid] (13exam) 〔ストラテジ〕⏎問96　女性会員について，年代別に各時間帯に…
- `2010h22a-q097` jp_raw stem [1.mid] (13exam) … 2 \| ⑦ \|⏎⏎〔ストラテジ〕⏎⏎問97 F さんは，全体の作業時間を求めるた…

### 型 7 — 読点脱落 / 行跨ぎ読点 / 語中空白

計: hits 334 / fields 228 / 題 209 (pop 81 / excluded 35 / 13exam 93)

| ルール @ 層 | hits | fields | 題 | pop | excluded | 13exam |
|---|---:|---:|---:|---:|---:|---:|
| 7.comma_nospace @ jp | 157 | 101 | 92 | 44 | 12 | 36 |
| 7.space @ jp | 177 | 128 | 118 | 37 | 24 | 57 |

| ルール / sub | hits | fields | 題 | pop | excluded | 13exam |
|---|---:|---:|---:|---:|---:|---:|
| 7.comma_nospace / mixed | 43 | 42 | 39 | 21 | 5 | 13 |
| 7.comma_nospace / plain | 114 | 59 | 55 | 24 | 7 | 24 |
| 7.space / kanji | 38 | 34 | 31 | 19 | 4 | 8 |
| 7.space / particle | 16 | 15 | 13 | 7 | 3 | 3 |
| 7.space / prose | 20 | 18 | 16 | 7 | 0 | 9 |
| 7.space / table | 103 | 62 | 59 | 5 | 17 | 37 |

代表例 (ルールごとに先頭 3 件、id 順):

- `2009h21a-q006` jp choice.イ [7.comma_nospace / mixed] (13exam) …報システムに関する企画や開発, 運用,管理, 保守業務を行うサービス
- `2009h21a-q046` jp stem [7.comma_nospace / plain] (13exam) …対1で情報の伝達を行う必要があるとき,情報の伝達を行うために必要な経路の数…
- `2009h21h-q006` jp choice.ウ [7.comma_nospace / plain] (13exam) …ターネット経由でサービスとして提供し,使用料を課金する。
- `2009h21a-q013` jp stem [7.space / table] (13exam) …百万円か。⏎⏎〔損益計算資料〕　単位 百万円⏎⏎\| 項目 \| 金額 \|⏎\|…
- `2009h21a-q018` jp choice.エ [7.space / prose] (13exam) …め .の内部報告書を作成する。ここる ーー
- `2009h21a-q036` jp stem [7.space / prose] (13exam) …の累積確率曲線。曲線上の主な対応点は 見積りコスト 4,000 万円で確率…

### 型 10 — 末尾残渣 / ノンブル / .,

計: hits 10 / fields 9 / 題 7 (pop 0 / excluded 0 / 13exam 7)

| ルール @ 層 | hits | fields | 題 | pop | excluded | 13exam |
|---|---:|---:|---:|---:|---:|---:|
| 10.R2a @ jp | 1 | 1 | 1 | 0 | 0 | 1 |
| 10.R2b @ jp | 3 | 3 | 3 | 0 | 0 | 3 |
| 10.dotcomma @ jp | 2 | 2 | 2 | 0 | 0 | 2 |
| 10.tail_residue @ jp | 4 | 4 | 3 | 0 | 0 | 3 |

代表例 (ルールごとに先頭 3 件、id 順):

- `2009h21a-q018` jp choice.エ [10.R2a] (13exam) 末尾の長音/ハイフン残渣｜…ため .の内部報告書を作成する。ここる ーー
- `2009h21a-q018` jp choice.エ [10.R2b] (13exam) 末尾断片「ここる ーー」｜…経営判断のため .の内部報告書を作成する。ここる ーー
- `2011h23tokubetsu-q029` jp choice.エ [10.R2b] (13exam) 末尾断片「「」｜…したキーワードに関連する広告が表示される。「
- `2014h26h-q071` jp choice.エ [10.R2b] (13exam) 末尾断片「ぜい」｜…ったホスト名の IP アドレスを回答する。ぜい
- `2011h23tokubetsu-q033` jp choice.ア [10.dotcomma] (13exam) …延を回復するために要員を追加する場合., クリティカルパス上の作業に影響を与…
- `2012h24h-q017` jp choice.イ [10.dotcomma] (13exam) …中核でない業務を委託することによって.,企業本来の業務に人員をシフトすること…
- `2009h21a-q005` jp choice.ア [10.tail_residue] (13exam) 事業投資リスク    '
- `2009h21a-q018` jp choice.ア [10.tail_residue] (13exam) …                「-                         .
- `2014h26a-q052` jp choice.ア [10.tail_residue] (13exam) …と重複しても, 問題が生じなくなる。                               に

### 型 2 — 斜線ゼロ候補

計: hits 1808 / fields 860 / 題 390 (pop 72 / excluded 82 / 13exam 236)

| ルール @ 層 | hits | fields | 題 | pop | excluded | 13exam |
|---|---:|---:|---:|---:|---:|---:|
| 2.nine_six @ fig | 113 | 62 | 62 | 6 | 19 | 37 |
| 2.nine_six @ jp | 1140 | 576 | 361 | 58 | 79 | 224 |
| 2.nine_six @ jp_raw | 555 | 222 | 222 | 39 | 60 | 123 |

| ルール / sub | hits | fields | 題 | pop | excluded | 13exam |
|---|---:|---:|---:|---:|---:|---:|
| 2.nine_six / - | 778 | 442 | 217 | 34 | 56 | 127 |
| 2.nine_six / cross | 5 | 4 | 4 | 2 | 0 | 2 |
| 2.nine_six / ends96 | 992 | 489 | 250 | 42 | 44 | 164 |
| 2.nine_six / ends96+cross | 27 | 20 | 20 | 8 | 7 | 5 |
| 2.nine_six / year | 6 | 6 | 3 | 0 | 1 | 2 |

代表例 (ルールごとに先頭 3 件、id 順):

- `2009h21a-q013` fig figure_description [2.nine_six / -] (13exam) 60｜…注費100，製造固定費100，粗利益60，販売固定費20，営業利益40）
- `2009h21a-q030` jp stem [2.nine_six / ends96] (13exam) 6｜…いる要員の 70% とし, 最初の 6 人のグループの作業効率は残り 2 …
- `2009h21a-q036` jp choice.エ [2.nine_six / -] (13exam) 9,000｜9,000

数字を含む field 数と候補 field 数 (層 × 区分):

| 層 | 区分 | 数字を含む field | 9/6 候補 field | 比 | sub に ends96 | sub に cross |
|---|---|---:|---:|---:|---:|---:|
| jp | pop | 564 | 85 | 15.1% | 45 | 0 |
| jp | excluded | 588 | 123 | 20.9% | 52 | 0 |
| jp | 13exam | 1360 | 368 | 27.1% | 219 | 0 |
| jp_raw | pop | 139 | 39 | 28.1% | 30 | 10 |
| jp_raw | excluded | 132 | 60 | 45.5% | 34 | 5 |
| jp_raw | 13exam | 289 | 123 | 42.6% | 83 | 4 |
| fig | pop | 38 | 6 | 15.8% | 4 | 0 |
| fig | excluded | 63 | 19 | 30.2% | 12 | 2 |
| fig | 13exam | 114 | 37 | 32.5% | 23 | 2 |

### 型 T — stem 内 markdown 表

計: hits 410 / fields 410 / 題 289 (pop 28 / excluded 92 / 13exam 169)

| ルール @ 層 | hits | fields | 題 | pop | excluded | 13exam |
|---|---:|---:|---:|---:|---:|---:|
| T.num_raw_clean @ jp_raw↔jp | 38 | 38 | 38 | 2 | 17 | 19 |
| T.num_vs_fig @ jp↔fig | 75 | 75 | 75 | 3 | 25 | 47 |
| T.num_vs_tr @ jp↔zh/en | 8 | 8 | 8 | 1 | 0 | 7 |
| T.table @ jp | 274 | 274 | 274 | 26 | 81 | 167 |
| T.table @ jp_raw | 15 | 15 | 15 | 2 | 11 | 2 |

| ルール / sub | hits | fields | 題 | pop | excluded | 13exam |
|---|---:|---:|---:|---:|---:|---:|
| T.num_raw_clean | 38 | 38 | 38 | 2 | 17 | 19 |
| T.num_vs_fig | 75 | 75 | 75 | 3 | 25 | 47 |
| T.num_vs_tr | 8 | 8 | 8 | 1 | 0 | 7 |
| T.table / fig=0 num_cells=0 | 7 | 7 | 7 | 0 | 2 | 5 |
| T.table / fig=0 num_cells=1 | 4 | 4 | 4 | 0 | 0 | 4 |
| T.table / fig=0 num_cells=10 | 1 | 1 | 1 | 0 | 1 | 0 |
| T.table / fig=0 num_cells=11 | 1 | 1 | 1 | 0 | 0 | 1 |
| T.table / fig=0 num_cells=18 | 2 | 2 | 2 | 0 | 0 | 2 |
| T.table / fig=0 num_cells=2 | 2 | 2 | 2 | 0 | 0 | 2 |
| T.table / fig=0 num_cells=23 | 3 | 3 | 3 | 0 | 0 | 3 |
| T.table / fig=0 num_cells=3 | 3 | 3 | 3 | 2 | 1 | 0 |
| T.table / fig=0 num_cells=4 | 3 | 3 | 3 | 0 | 0 | 3 |
| T.table / fig=0 num_cells=5 | 1 | 1 | 1 | 0 | 0 | 1 |
| T.table / fig=0 num_cells=63 | 1 | 1 | 1 | 0 | 0 | 1 |
| T.table / fig=0 num_cells=65 | 1 | 1 | 1 | 0 | 0 | 1 |
| T.table / fig=0 num_cells=8 | 1 | 1 | 1 | 0 | 1 | 0 |
| T.table / fig=1 num_cells=0 | 48 | 48 | 48 | 7 | 16 | 25 |
| T.table / fig=1 num_cells=1 | 2 | 2 | 2 | 0 | 1 | 1 |
| T.table / fig=1 num_cells=10 | 9 | 9 | 9 | 0 | 2 | 7 |
| T.table / fig=1 num_cells=104 | 1 | 1 | 1 | 0 | 1 | 0 |
| T.table / fig=1 num_cells=11 | 2 | 2 | 2 | 0 | 1 | 1 |
| T.table / fig=1 num_cells=12 | 22 | 22 | 22 | 1 | 5 | 16 |
| T.table / fig=1 num_cells=13 | 6 | 6 | 6 | 0 | 4 | 2 |
| T.table / fig=1 num_cells=130 | 1 | 1 | 1 | 0 | 0 | 1 |
| T.table / fig=1 num_cells=14 | 4 | 4 | 4 | 0 | 0 | 4 |
| T.table / fig=1 num_cells=15 | 11 | 11 | 11 | 3 | 4 | 4 |
| T.table / fig=1 num_cells=16 | 11 | 11 | 11 | 0 | 4 | 7 |
| T.table / fig=1 num_cells=17 | 3 | 3 | 3 | 0 | 1 | 2 |
| T.table / fig=1 num_cells=18 | 4 | 4 | 4 | 1 | 1 | 2 |
| T.table / fig=1 num_cells=19 | 6 | 6 | 6 | 1 | 1 | 4 |
| T.table / fig=1 num_cells=2 | 7 | 7 | 7 | 1 | 1 | 5 |
| T.table / fig=1 num_cells=20 | 4 | 4 | 4 | 0 | 2 | 2 |
| T.table / fig=1 num_cells=21 | 3 | 3 | 3 | 1 | 0 | 2 |
| T.table / fig=1 num_cells=22 | 3 | 3 | 3 | 1 | 1 | 1 |
| T.table / fig=1 num_cells=23 | 1 | 1 | 1 | 0 | 0 | 1 |
| T.table / fig=1 num_cells=25 | 1 | 1 | 1 | 0 | 0 | 1 |
| T.table / fig=1 num_cells=26 | 2 | 2 | 2 | 0 | 0 | 2 |
| T.table / fig=1 num_cells=27 | 2 | 2 | 2 | 1 | 1 | 0 |
| T.table / fig=1 num_cells=28 | 3 | 3 | 3 | 1 | 2 | 0 |
| T.table / fig=1 num_cells=3 | 4 | 4 | 4 | 0 | 2 | 2 |
| T.table / fig=1 num_cells=30 | 3 | 3 | 3 | 0 | 0 | 3 |
| T.table / fig=1 num_cells=33 | 2 | 2 | 2 | 0 | 0 | 2 |
| T.table / fig=1 num_cells=34 | 1 | 1 | 1 | 0 | 0 | 1 |
| T.table / fig=1 num_cells=36 | 3 | 3 | 3 | 0 | 0 | 3 |
| T.table / fig=1 num_cells=37 | 1 | 1 | 1 | 0 | 0 | 1 |
| T.table / fig=1 num_cells=38 | 2 | 2 | 2 | 0 | 1 | 1 |
| T.table / fig=1 num_cells=39 | 2 | 2 | 2 | 0 | 2 | 0 |
| T.table / fig=1 num_cells=4 | 18 | 18 | 18 | 3 | 7 | 8 |
| T.table / fig=1 num_cells=41 | 1 | 1 | 1 | 0 | 0 | 1 |
| T.table / fig=1 num_cells=44 | 2 | 2 | 2 | 0 | 0 | 2 |
| T.table / fig=1 num_cells=48 | 1 | 1 | 1 | 0 | 1 | 0 |
| T.table / fig=1 num_cells=49 | 2 | 2 | 2 | 0 | 0 | 2 |
| T.table / fig=1 num_cells=5 | 12 | 12 | 12 | 0 | 7 | 5 |
| T.table / fig=1 num_cells=51 | 1 | 1 | 1 | 0 | 0 | 1 |
| T.table / fig=1 num_cells=53 | 1 | 1 | 1 | 0 | 0 | 1 |
| T.table / fig=1 num_cells=6 | 16 | 16 | 16 | 1 | 7 | 8 |
| T.table / fig=1 num_cells=63 | 2 | 2 | 2 | 0 | 0 | 2 |
| T.table / fig=1 num_cells=64 | 1 | 1 | 1 | 0 | 1 | 0 |
| T.table / fig=1 num_cells=7 | 7 | 7 | 7 | 1 | 2 | 4 |
| T.table / fig=1 num_cells=76 | 1 | 1 | 1 | 0 | 1 | 0 |
| T.table / fig=1 num_cells=8 | 10 | 10 | 10 | 0 | 6 | 4 |
| T.table / fig=1 num_cells=9 | 10 | 10 | 10 | 3 | 2 | 5 |

代表例 (ルールごとに先頭 3 件、id 順):

- `2009h21a-q095` jp_raw↔jp stem [T.num_raw_clean] (13exam) raw のみ {} / clean のみ {1,2,1730,30.8,120,14.4,14.8,3,410,23.4,50,8.2,3.5,4,2630,22.7,220,12.0,22.5,5,3360,30.7,364,9.2,28.8,6,310,25.2,29,10.…
- `2009h21h-q096` jp_raw↔jp stem [T.num_raw_clean] (13exam) raw のみ {13} / clean のみ {56,114,227,295,692,100,215,348,890,15,25,35}
- `2010h22a-q018` jp_raw↔jp stem [T.num_raw_clean] (13exam) raw のみ {3,70} / clean のみ {4}
- `2009h21a-q054` jp↔fig stem [T.num_vs_fig] (13exam) 表のみ {2,3} (表 4 / fig 2)
- `2009h21a-q062` jp↔fig stem [T.num_vs_fig] (13exam) 表のみ {3,4,5,6,7,8,9,10,11,12,13,14,…} (表 26 / fig 3)
- `2009h21a-q091` jp↔fig stem [T.num_vs_fig] (13exam) 表のみ {80,11} (表 6 / fig 6)
- `2009h21a-q091` jp↔zh/en stem [T.num_vs_tr] (13exam) 訳に無い {0}
- `2010h22a-q097` jp↔zh/en stem [T.num_vs_tr] (13exam) 訳に無い {23,567}
- `2010h22a-q098` jp↔zh/en stem [T.num_vs_tr] (13exam) 訳に無い {23,567}
- `2009h21a-q013` jp stem [T.table / fig=1 num_cells=7] (13exam) \| 項目 \| 金額 \| \|---\|---\| \| 売上高 \| 400 \|
- `2009h21a-q017` jp stem [T.table / fig=1 num_cells=0] (13exam) \| 対象となる情報資産 \| A社 \| B社 \| \|---\|---\|---\| \| コンピュータや通信機器を設置する施設 \| 〇 \|  \|
- `2009h21a-q039` jp stem [T.table / fig=1 num_cells=12] (13exam) \| 担当者 \| 設計 \| プログラミング \| テスト \| \|--------\|------\|----------------\|--------\| \| A \| 3 \| 3 \| 6 \|

表を持つ題 289 (うち has_figure 259 / 図なし 30)。sub-flag: num_raw_clean 38 / num_vs_fig 75 / num_vs_tr 8

## 2. ルールの定義

| 型 | ルール | 層 | 定義 | 除外 |
|---|---|---|---|---|
| 0a | 0a.diff | jp_raw ↔ jp(clean) | clean を持つ題の raw stem_jp と stem_jp_clean を normStr (quiz-choice-defect-scan.mjs: ①→(1)、NFKC、空白削除、読点 `，、,`→`,`、句点、引用符 `“”"「」『』`→`"`、括弧・コロン・ダッシュ統一) で正規化し、文字単位の LCS で差分 hunk を取る。各 hunk を次の sub に分類 |  |
| 0a | 0a.num | jp_raw ↔ jp(clean) | hunk の raw 側または clean 側に数字 [0-9] がある (q085 型。**別フラグ**) |  |
| 0a | 0a.word | jp_raw ↔ jp(clean) | 置換 hunk (両側に内容字 = 仮名・漢字・英数字) で、raw 側または clean 側の内容字が 2 字以上 (q014 佑典→強み / q011 新→変革 型) | 同形字の対 (力↔カ 一↔ー 工↔エ 口↔ロ 二↔ニ 八↔ハ 夕↔タ 卜↔ト 千↔チ 才↔オ) だけからなる 1 字置換は 0a.glyph |
| 0a | 0a.char | jp_raw ↔ jp(clean) | 置換 hunk で両側とも内容字 1 字 (q070 量正→修正 型) | 同形字の対は 0a.glyph (候補に数えない) |
| 0a | 0a.ins | jp_raw ↔ jp(clean) | clean 側だけに内容字 2 字以上がある挿入 hunk (raw に無い語を clean が補った) | 1 字の挿入 (脱字の復元) は件数のみ |
| 0a | 0a.region | jp_raw ↔ jp(clean) | 置換 hunk のどちらかの側が 30 字超 (図の文字化け域・表の再構成)。候補には数えるが A2 の優先度は低 |  |
| 0a | (不計上) | jp_raw ↔ jp(clean) | 削除のみの hunk (clean が raw の崩れを落とした = D-136-C の図文字除去) / 記号のみの hunk / 同形字の 1 字置換 / 1 字挿入 は件数だけ数え、候補に入れない |  |
| 0b | 0b.num_missing | jp → zh / en | 表示 jp の数字トークン (NFKC、3 桁区切りの `,` を除去、`\d+(\.\d+)?`) の換算値がどれも zh / en の数字集合に無い。換算: jp の N万 / N億 / N千 → N×10^4 / 10^8 / 10^3、en の N million / billion / thousand / Nk → ×10^6 / 10^9 / 10^3。数字集合には en の数詞 (zero〜twenty、first〜twentieth、twice、half、double、single、once、hundred、thousand) と数を表す語 (hexadecimal 16 / decimal 10 / binary 2 / octal 8 / annual 等 1 / 月名と略称 1〜12)、zh / jp の漢数字列 (十六 = 16 と 1 字ずつの値)、jp の単位見出し「万」「千」「億」(→ 10^4 / 10^3 / 10^8) を加える | 見出し `問N` / `问N` / `QN` の数字 (型 1 が担当) と、値 1 (en の冠詞 a / per 等に訳され機械照合できない) は除く。`9:00` の `00` は全言語で除く |
| 0b | 0b.num_extra | zh / en → jp | zh / en の数字トークンの換算値がどれも表示 jp の数字集合 (上記の漢数字・単位見出しを含む) に無い | 見出しの数字、`9:00` の `00` (全言語) |
| 0b | 0b.abbr_missing | jp → zh / en | 表示 jp の ASCII 略語 (`[A-Z]{2,}[a-z]*` または `[A-Z][a-z]+[A-Z][A-Za-z]*` = ISMS / IoT / GHz / HRTech、PC3 は PC) が、英数字以外を除き小文字化した zh / en に部分文字列として無い | 慣用訳される略語: zh = OS / EC / PC / FAX / USB / EU / OA、en = EC |
| 0b | 0b.label_extra | zh → jp | zh に独立した大文字 1 字 (前後が英数字・`&`・`-` でない A〜Z) があり、表示 jp に同じ独立大文字が無い (2026r08-q032 イ「( 社」型の逆側) | M&A / P2P / L1 / A-GPS 型の複合、zh の「U 盘」。en は冠詞 A・代名詞 I と区別できないので対象外 |
| 0b | (射程外) |  | カタカナ語・固有語 → en の綴り対応は辞書が無いと機械判定できない (翻字表が要る) ので実装しない |  |
| 0c | 0c.isolated_kanji | jp | Intl.Segmenter("ja",word) が 1 漢字ずつに分割した隣接 2 語 X\|Y (= ICU 辞書に無い漢字 2 字並び) で、漢字 bigram XY の題単位文書頻度 (現行 corpus の stem / clean / 選択肢 / 解説 jp) が 1 以下 (模\|僚・佑\|典・量\|正 型) | 直前が数字 (1 日減 / 2手目 / 30 個買 = 数字 + 助数詞)。擬似言語ブロック以降 |
| 0c | 0c.rare_kanji | jp | 題単位文書頻度 1 の漢字 1 字 (corpus でこの題にしか出ない字)。**弱い信号** (津波・摩擦・函館 等の正当な稀字が大半) | 擬似言語ブロック以降 |
| 0c | 0c.latin_in_kana | jp | 空白を挟まず `[仮名漢字][A-Z][ひらがな]` (販売才とだ民Lた 型) | 直後の仮名が と は の を に が で や も へ か さ よ ま だ (製品Aと / Bさん = ラベル用法)。S118 R4b (仮名中の孤立英字) は数学変数で FP 20/20 → 大文字・前後無空白に限定 |
| 0c | 0c.R1a | jp | S118 R1a 再利用: 片仮名列の中に紛れた漢字 (力→カ / 一→ー 等)。両隣が漢字でなく少なくとも一方が片仮名のときだけ命中 |  |
| 0c | 0c.R1b | jp | S118 R1b 再利用: 長音符 ー が漢数字 一 の位置に来ている (「ーつ」「ー方」型)。前が仮名でなく後ろが仮名/漢字のときだけ |  |
| 0c | 0c.R1c | jp | S118 R1c 再利用: 漢字の位置に来た片仮名 (ロ座→口座 / ニ重→二重 型)。直後が漢字・直前が片仮名でないときだけ、カ月等は除外 |  |
| 0c | 0c.R3 | jp | S118 R3 再利用: 括弧・引用符の開閉数が合わない (S117 2017h29h-q034 の “強み”", "弱み" 型) | ASCII `"` の奇数は型 0q が担当するのでここでは数えない |
| 0c | 0c.R4a | jp | S118 R4a 再利用: 一つの英数字トークン内で全角と半角が混在 (「１0」「TCP/ＩP」型) |  |
| 0c | 0c.symbol | jp | 擬似言語ブロック外の `%%` / 半角カナ `[ｦ-ﾟ]` / 縦線 `\|` が 1 本だけの行の `\|` / ASCII `[` `]` の開閉数不一致 | markdown 表行、`[表]` を含む行、縦線 2 本以上の行 (選択肢の一行表) |
| 0c | → 訳層 | zh / en | 上記のいずれかが命中した jp field について、同じ field の zh / en を候補に併記する (U11 q070 イ 模僚→「再発」型の推測訳の照合対象) |  |
| 0q | 0q.prose | jp / jp_raw / zh | ASCII `"` (U+0022) の出現 | 下の literal に当たるものを除く |
| 0q | 0q.literal | jp / jp_raw / zh | 擬似言語ブロック (PROG_MARK 行以降) 内、または `"` の内側が ASCII 英数字 1〜20 字で、外側の直前・直後が `←=＝+,(（)）` のいずれか (文字列リテラル) |  |
| 0q | 0q.en | en | en の ASCII `"` (英文の通常組版。⑨ #11 の方針決定の対象であり源照合の対象ではない。件数のみ) |  |
| 1 | 1.head | jp / jp_raw / zh / en | field 先頭: jp `^\s*問\s*\d+` / zh `^\s*[问問]\s*\d+` / en `^\s*(Q\|Question)\s*\d+\b` |  |
| 1 | 1.mid | jp / jp_raw / zh / en | field 中途の行頭: jp `\n\s*問\s*\d+[\s　]` / zh `\n\s*问\s*\d+` / en `\n\s*Q\d+\b` |  |
| 7 | 7.space | jp | 表示 jp で `[仮名漢字ー] [仮名漢字ー]` (ASCII 空白ちょうど 1 個、U4 §11 の「日本語文字 + ASCII 空白 1 個 + 日本語文字」)。sub: prose (読点脱落の強い信号) / particle (空白の直後が助詞 は を に が の で と も へ や = U4 の「助詞前の空白型」) / kata (両側とも片仮名 = 語中改行空白、S118 R8a 型) / kanji (両側とも漢字 = 語中改行空白、R8b 型) | U4 の除外類 → 表型 (field に markdown 表行 / `[表]` / `=` を含む) と図の言語化 (field に `［図］` / `[図]` を含む) は sub=table / figure として件数だけ数える。擬似言語ブロック以降は対象外 |
| 7 | 7.comma_nospace | jp | `[仮名漢字ー],[仮名漢字ー]` (ASCII 読点の後に空白が無い = 行跨ぎ読点後の空白欠落、U9 NIT-4 の 310 件型)。同一 field に `, ` も併存するものは sub=mixed | 表型・擬似言語ブロックは対象外 |
| 7 | 7.newline | jp (選択肢) | 選択肢の `[仮名漢字ー]\n[仮名漢字ー]` (語中改行) | 表型は対象外 |
| 10 | 10.tail_residue | jp | `[ 　]{3,}[^\s]{0,4}$` (空白 3 個以上 + 0〜4 字の残渣で終わる、U11 q049「␠×5「」型) | 最終行が表行 (`\|` で始まるか終わる) の field |
| 10 | 10.nombre | jp | `[-－ー一—―−][ 　]+[0-9０-９lI]{1,3}[ 　]+[-－ー一—―−]` (ノンブル「- 39 -」「ー 39 一」「一 ll 一」型) |  |
| 10 | 10.dotcomma | jp | `\.,` または `,\.` (「.,」型) | 数字に挟まれたもの (`1.,2` 等) は除く |
| 10 | 10.R2a / R2b / R2e | jp | S118 再利用: R2a 末尾の長音符/ハイフン残り (「ーー」「-」)。直前が片仮名なら正当な長音として除外 / R2b 文末の 。 の後ろに 1〜6 字の断片が残っている (「する。ぜい」「増える。ー. 超過」型) / R2e 末尾の記号ノイズ (半角縦線・中黒・句読点の連続)。閉じ括弧と全角縦線 ｜ は正当用法が支配的なので対象外 | 最終行が表行の field (S118 と同じ) |
| 2 | 2.nine_six | jp / jp_raw / fig | 数字トークン (NFKC、`\d[\d,]*(\.\d+)?`) に 9 または 6 を含む。sub-flag: ends96 = 最下位桁が 9 / 6 (0 に置くと端数が消える: 19→10、59→50、109→100) / cross = 同じ題の他層 (jp / jp_raw / zh / en / fig) に 9・6 を 0 に置いた形があり元の形が無い / year = 4 桁 1950〜2035 で直後が 年 か年度 (sub-flag の候補から外す) |  |
| T | T.table | jp / jp_raw | stem に markdown 表行 `^\s*\\|.*\\|\s*$` が 2 行以上ある。has_figure・数値セル数 (`\d` を含むセル) を記録 |  |
| T | T.num_raw_clean | jp_raw ↔ jp(clean) | 表を両層に持つ題で、表セルの数字トークン集合が raw と clean で違う |  |
| T | T.num_vs_fig | jp ↔ fig | 表示 jp の表セルの数字トークンのうち figure_description に無いもの (figure_description が数字を含む題に限る) |  |
| T | T.num_vs_tr | jp ↔ zh / en | 表示 jp の表セルの数字トークンが zh・en の stem のどちらにも無い |  |

## 3. recall 検査 (既知実例)

snapshot が `<commit>^` の行は是正 commit の親の questions.json / translations を `git show` で読み、同じ走査関数に通した。

| id | snapshot | 型 | field | 期待ルール | 結果 | 当たったルール / 同型の他命中 | 備考 |
|---|---|---|---|---|---|---|---|
| `2023r05-q011` | 15d50bc^ | 0a | stem | 0a.word\|0a.char\|0a.ins 抜粋に「変革」 | **HIT** | jp_raw→jp:0a.word/word/prose/raw_fluent | clean 推測補完 刷新→変革 (raw「新」) |
| `2025r07-q014` | 7aa7af8^ | 0a | stem | 0a.word\|0a.char 抜粋に「強み」 | **HIT** | jp_raw→jp:0a.word/word/prose/raw_garbled | s975 俯瞰→強み (raw「佑典」) |
| `2025r07-q070` | 7aa7af8^ | 0a | stem | 0a.word\|0a.char 抜粋に「修」 | **HIT** | jp_raw→jp:0a.char/char/prose/raw_garbled | s975 是正→修正 (raw「量正」) |
| `2025r07-q085` | 7aa7af8^ | 0a | stem | 0a.num 抜粋に「89」 | **HIT** | jp_raw→jp:0a.num/num/prose/raw_fluent, jp_raw→jp:0a.num/num/prose/raw_garbled | s975 30% / 35%→89% / 90% |
| `2026r08-q070` | afbfcd0^ | 0c | choice.イ @jp | 0c.* 抜粋に「模僚」 | **HIT** | jp:0c.isolated_kanji | jp 模僚 → zh/en「再発」推測訳 (jp 異常の命中 = zh/en が候補に入る) |
| `2026r08-q032` | afbfcd0^ | 0c | choice.イ @jp | 0c.* 抜粋に「( 社」 | **HIT** | jp:0c.R3 | jp「( 社」→ zh/en C を落として訳出 |
| `2026r08-q032` | afbfcd0^ | 0c | choice.ア @jp | 0c.* 抜粋に「民L」 | **HIT** | jp:0c.rare_kanji, jp:0c.latin_in_kana | jp「販売才とだ民Lた」(同題の別肢) |
| `2026r08-q032` | afbfcd0^ | 0c | choice.ウ @jp | 0c.* 抜粋に「加エ」 | MISS | jp:0c.rare_kanji, zh:0c.tr_of_anomaly/rare_kanji, en:0c.tr_of_anomaly/rare_kanji | jp「加エ」(正解肢、同題の別肢) |
| `2026r08-q066` | afbfcd0^ | 0c | stem | 0c.*\|0b.num_missing\|0b.num_extra\|0b.abbr_missing | MISS | — | jp 煩雑→複雑 (流暢な誤り) → 复杂 / complex |
| `2026r08-q057` | current | 0q | * | 0q.prose\|0q.literal | **HIT** | jp_raw:0q.prose, jp:0q.prose, zh:0q.prose | ASCII " (母数 excluded) |
| `2026r08-q084` | afbfcd0^ | 0q | * | 0q.prose\|0q.literal | **HIT** | jp:0q.prose, zh:0q.prose | 4 肢 ASCII " (U11 是正済) |
| `2026r08-q025` | afbfcd0^ | 0q | stem | 0q.prose\|0q.literal | **HIT** | jp:0q.prose, jp_raw:0q.prose, zh:0q.prose | clean「"ビッグデータ"」(U11 是正済) |
| `2019h31h-q001` | current | 1 | stem @zh | 1.head | **HIT** | zh:1.head | zh「问1」 |
| `2019h31h-q001` | current | 1 | stem @en | 1.head | **HIT** | en:1.head | en「Q1」 |
| `2015h27a-q089` | current | 1 | * | 1.head\|1.mid | **HIT** | jp:1.head, jp_raw:1.mid, zh:1.head, en:1.head | 見出し混入 (母数 excluded、raw・clean・zh・en) |
| `2010h22h-q023` | current | 7 | choice.ウ | 7.space sub=prose\|kanji\|kata | **HIT** | jp:7.space/prose | 読点脱落「検査を行い␣サンプル中の」 |
| `2013h25a-q043` | current | 7 | choice.イ | 7.space sub=prose\|kanji\|kata | **HIT** | jp:7.space/prose | 読点脱落 (同一肢 2 箇所) |
| `2013h25a-q043` | current | 7 | choice.ウ | 7.space sub=prose\|kanji\|kata | **HIT** | jp:7.space/prose | 読点脱落 |
| `2013h25a-q043` | current | 7 | choice.エ | 7.space sub=prose\|kanji\|kata | **HIT** | jp:7.space/prose | 読点脱落 |
| `2024r06-q005` | current | 7 | choice.ウ | 7.space sub=prose\|kanji\|kata | **HIT** | jp:7.space/kanji | 読点脱落「国や学術機関␣他の企業など」(excluded) |
| `2024r06-q012` | current | 7 | choice.イ | 7.comma_nospace | **HIT** | jp:7.comma_nospace/mixed | 行跨ぎ読点後の空白欠落「開発, 提供,利用」(U9 NIT-4、**未是正** = 現行データに残存) |
| `2024r06-q012` | current | 7 | choice.ウ | 7.comma_nospace | **HIT** | jp:7.comma_nospace/mixed | 行跨ぎ読点後の空白欠落「使用方法,結果」(U9 NIT-4、未是正) |
| `2019r01a-q041` | current | 7 | choice.エ | 7.comma_nospace | **HIT** | jp:7.comma_nospace/mixed | 同一肢内で ASCII 読点の空白有無が割れる「リスクの識別,コントロール」(U4 §11、未是正) |
| `2019r01a-q016` | d697b6e^ | 7 | choice.イ | 7.space sub=prose\|kanji\|kata | **HIT** | jp:7.space/prose | 読点脱落「行い␣システム」(正解肢、U4 是正済) |
| `2011h23tokubetsu-q033` | current | 10 | choice.ア | 10.dotcomma | **HIT** | jp:10.dotcomma | 「.,」型 (13exam) |
| `2012h24h-q017` | current | 10 | choice.イ | 10.dotcomma | **HIT** | jp:10.dotcomma | 「.,」型 (13exam) |
| `2025r07-q091` | 7aa7af8^ | 10 | choice.ア | 10.tail_residue\|10.nombre\|10.R2a\|10.R2b\|10.R2e | **HIT** | jp:10.tail_residue | 末尾残渣 (U10 是正済) |
| `2025r07-q052` | 7aa7af8^ | 10 | choice.イ | 10.tail_residue\|10.nombre\|10.R2a\|10.R2b\|10.R2e | **HIT** | jp:10.tail_residue | 末尾残渣 (U10 是正済) |
| `2026r08-q049` | afbfcd0^ | 10 | choice.ウ | 10.tail_residue | **HIT** | jp:10.tail_residue | 末尾「␠×5「」(U11 是正済) |
| `2026r08-q049` | afbfcd0^ | 10 | choice.エ | 10.tail_residue | **HIT** | jp:10.tail_residue | 末尾「␠×7「」(U11 是正済) |
| `2026r08-q082` | afbfcd0^ | 10 | choice.エ | 10.nombre\|10.tail_residue | **HIT** | jp:10.tail_residue, jp:10.nombre | 「ー 39 一␠×5“」(U11 是正済) |
| `2026r08-q091` | afbfcd0^ | 10 | choice.イ | 10.tail_residue | **HIT** | jp:10.tail_residue | 末尾「␠×16「」(U11 是正済) |
| `2020r02o-q004` | dc03c27^ | 2 | stem | 2.nine_six 抜粋に「19」 | **HIT** | jp:2.nine_six/ends96, jp_raw:2.nine_six/ends96 | 斜線ゼロ 10年→19年 (U5 是正済) |
| `2023r05-q025` | 15d50bc^ | 2 | * | 2.nine_six 抜粋に「19万」 | **HIT** | jp:2.nine_six/ends96, jp_raw:2.nine_six/ends96 | 斜線ゼロ 10万円→19万円 (U8 是正済) |
| `2024r06-q059` | c698a79^ | 2 | choice.ア | 2.nine_six 抜粋に「19cnm」 | **HIT** | jp:2.nine_six/ends96+cross | 斜線ゼロ 10cm→19cnm (U9 是正済) |
| `2022r04-q066` | 33cf9be^ | 2 | * | 2.nine_six 抜粋に「109」 | **HIT** | jp:2.nine_six/ends96 | 斜線ゼロ 100 (U7 是正済) |
| `2018h30h-q085` | current | 2 | stem @jp_raw | 2.nine_six 抜粋に「9個」 | **HIT** | jp_raw:2.nine_six/ends96+cross | raw のみ 9個以上←0個以上 |
| `2019h31h-q053` | current | 2 | stem @jp_raw | 2.nine_six 抜粋に「59本」 | **HIT** | jp_raw:2.nine_six/ends96+cross | raw のみ 59本←50本 |
| `2020r02o-q075` | dc03c27^ | 2 | choice.ア | 2.nine_six 抜粋に「609」 | **HIT** | jp:2.nine_six/ends96 | 斜線ゼロ 100→609 型 (U5 是正済) |
| `2023r05-q004` | current | 2 | stem @jp_raw | 2.nine_six 抜粋に「306」 | **HIT** | jp_raw:2.nine_six/ends96+cross | raw のみの斜線ゼロ (表示層は clean) |
| `2017h29a-q012` | ce3e31e^ | 2 | choice.イ | 2.nine_six 抜粋に「19人」 | **HIT** | jp:2.nine_six/ends96 | 19人←10人 (波 2 是正済) |
| `2017h29h-q070` | ce3e31e^ | 2 | choice.ウ | 2.nine_six 抜粋に「16」 | **HIT** | jp:2.nine_six/ends96 | 16進数←10進数 (**aa**、波 3 是正済) |
| `2021r03-q100` | 818497d^ | 1 | stem | 1.head | **HIT** | jp:1.head | 見出し「問100」(U6 是正済) |
| `2022r04-q001` | 33cf9be^ | 1 | stem | 1.head | **HIT** | jp:1.head, jp_raw:1.head, zh:1.head, en:1.head | 見出し「問1」(U7 是正済) |
| `2020r02o-q023` | dc03c27^ | 10 | choice.エ | 10.nombre\|10.tail_residue\|10.R2a\|10.R2b\|10.R2e | **HIT** | jp:10.nombre, jp:10.R2b | ノンブル「一 ll 一」(U5 是正済) |
| `2015h27a-q062` | ce3e31e^ | 10 | choice.エ | 10.tail_residue\|10.nombre\|10.R2a\|10.R2b\|10.R2e | **HIT** | jp:10.tail_residue | 末尾「␠×25 .」(波 1 是正済) |
| `2026r08-q041` | afbfcd0^ | 0c | choice.ウ @jp | 0c.* 抜粋に「他理」 | MISS | jp:0c.isolated_kanji, zh:0c.tr_of_anomaly/isolated_kanji, en:0c.tr_of_anomaly/isolated_kanji | 「その他理的」→ その倫理的 (正解肢、U11 是正済) |
| `2016h28h-q009` | ce3e31e^ | 0c | * | 0c.*\|0b.num_missing\|0b.num_extra\|0b.label_extra 抜粋に「4」 | MISS | — | 4社←A社 (波 2 是正済) |
| `2022r04-q018` | 33cf9be^ | 0c | choice.ウ | 0c.*\|0b.num_missing\|0b.num_extra\|0b.abbr_missing | MISS | — | 肢後半が別文に言い換え (U7 是正済) |
| `2021r03-q050` | current | 2 | figure_description @fig | 2.nine_six | **HIT** | fig:2.nine_six/-, fig:2.nine_six/ends96+cross | figure_description の斜線ゼロ (母数外) |
| `2009h21h-q096` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | **HIT** | jp_raw↔jp:T.num_raw_clean, jp↔fig:T.num_vs_fig | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2010h22a-q018` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | **HIT** | jp_raw↔jp:T.num_raw_clean | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2010h22a-q097` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | **HIT** | jp_raw↔jp:T.num_raw_clean, jp↔zh/en:T.num_vs_tr | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2010h22h-q100` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | **HIT** | jp↔fig:T.num_vs_fig | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2011h23tokubetsu-q072` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | MISS | — | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2011h23tokubetsu-q069` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | MISS | — | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2011h23tokubetsu-q095` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | **HIT** | jp↔fig:T.num_vs_fig | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2012h24h-q005` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | **HIT** | jp_raw↔jp:T.num_raw_clean, jp↔fig:T.num_vs_fig | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2012h24h-q091` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | **HIT** | jp_raw↔jp:T.num_raw_clean, jp↔fig:T.num_vs_fig | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2012h24h-q092` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | **HIT** | jp_raw↔jp:T.num_raw_clean, jp↔fig:T.num_vs_fig | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2013h25h-q019` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | MISS | jp:T.table/fig=1 num_cells=5 | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2013h25h-q096` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | **HIT** | jp_raw↔jp:T.num_raw_clean, jp↔fig:T.num_vs_fig | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2014h26a-q099` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | **HIT** | jp_raw↔jp:T.num_raw_clean | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2019h31h-q053` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | MISS | — | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2019h31h-q098` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | **HIT** | jp_raw↔jp:T.num_raw_clean | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2019h31h-q078` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | **HIT** | jp↔fig:T.num_vs_fig | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |
| `2023r05-q075` | current | T | stem | T.num_raw_clean\|T.num_vs_fig\|T.num_vs_tr | MISS | jp:T.table/fig=1 num_cells=4 | fig_stem_mismatch_S127 (stem 転記表の原典不一致) |

- 非 T 型の recall: **45 / 50**
- T 型 (fig_stem_mismatch 17 題) を数値不一致 sub-flag (T.num_raw_clean / num_vs_fig / num_vs_tr のいずれか) で判定した recall: **12 / 17** (うち T.num_raw_clean だけで 9 / 17。num_vs_fig は §4 のとおり FP が大半なので、確度の高い値は後者)。
- 参考: fig_stem_mismatch 17 題のうち stem に表がある (T.table) のは 14 / 17 だが、T.table は表を持つ 289 題すべてに当たる構造ルールなので recall には数えない
- **注意: 既知実例の多くはルール設計時に参照したので、この recall は楽観側の値である** (未知の同型に対する recall ではない)

### recall の漏れと理由

- `2026r08-q032 ウ`「加エ」(正解肢): ICU は「加|エメーカー」と区切り、エ が後続の片仮名語に吸収されるので 0c.isolated_kanji に当たらない。S118 R1c (片仮名→漢字) は直後が漢字であることを要するが、ここは直後が片仮名「メ」で当たらない。同じ field は稀字「鍋」で 0c.rare_kanji に当たり zh / en が候補に入るが、これは**偶然**であり (抜粋に「加エ」を含まない)、recall には数えない。
- `2026r08-q066` 煩雑→複雑: raw 自体が流暢な実在語の誤りで、zh「复杂」/ en "complex" も jp と整合する。字種・数字・略語のいずれも崩れていないので方式 A では原理的に見えない (D-150 §4「A 単独」の却下理由どおり)。段 3 (方式 D) でも jp が源検証済でなければ見えない型。
- `2011h23tokubetsu-q069` / `q072`: stem に markdown 表が無い (表は図の中だけ。不一致の主体は崩れた本文)。T.table は stem の表しか見ないので対象外。両題とも 0a (raw↔clean) には候補がある (JSON の candidates.0a)。
- `2019h31h-q053`: 〔前提〕の箇条書きで表ではない。同題は 2.nine_six (raw「59本」cross) と 7.space で拾われている。
- `2026r08-q041 ウ`「その他理的」(正解肢): 「他|理」は ICU では「その他|理|的」と区切られ 1 漢字語が隣接しないので 0c.isolated_kanji に当たらない。同じ肢の「取締役|会|等」の「会等」に isolated_kanji が当たり zh / en も候補に入るが、これは**偶然**で本命は未検出 (recall には数えない)。「その他」と「理的」がどちらも実在の綴りに見える型で、方式 A では見えない。
- `2016h28h-q009` 4社←A社: 「4社」は字種・数字とも正常で、jp 内の他の数字と矛盾しない (zh / en も jp に従って 4 と訳す) ので 0b でも見えない。方式 A では見えない型 (段 2 の数字源照合の射程)。
- `2022r04-q018 ウ` 肢後半の言い換え: 流暢な別文で、異常字・数字差が無い。方式 A では見えない型 (U7 では machdiff が源 transcript との比較で拾った)。
- 補足 `2012h24h-q005`: fig_stem_mismatch の critic は「stem_jp の売上高 4,800」と書いたが、表示層 (stem_jp_clean) は既に 4,000 で、4,800 は raw 層 (学習者不可視) にだけある (T.num_raw_clean「raw のみ {4800} / clean のみ {4000}」)。critic は raw を読んだと考えられる。表示層の是正は不要の可能性が高い (源照合で確定させる)。

## 4. FP の所見 (源照合なし、sub-tag 比率 + 抜粋の目視)

- **0a** (515 field / 515 題 (pop 132 / excluded 95 / 13exam 288)): 表・図の域 (struct) が 211 field、raw 側に崩れのある hunk を含む field が 215。clean 層は D-138 で源画像から再構成されているので、raw↔clean の差の**大半は clean 側の正しい修復**と見込まれる (目視例: `2009h21a-q009` 資任→責任、`2019r01a-q056` 閥げた→挙げた、`2022r04-q007` ます→まず)。推測補完の疑いが濃いのは raw が流暢なまま clean が別語になった hunk (sub に `raw_fluent`) で、例は `2010h22a-q086` 要求→依頼、`2015h27h-q087` 近づく→並ぶ、`2016h28h-q001` 途中→過程、`2011h23a-q024` 表セル 値引き→広告。どちらが源どおりかは源を見ないと決まらない。0a.num は数字を含む hunk を全部拾うので表域の数値再構成が混ざる (struct 比が高い)。
- **0b** (35 field / 23 題 (pop 5 / excluded 5 / 13exam 13)): 母数が小さく精度は他型より高い印象。`2014h26a-q045` ア / イ の zh / en が「ISO 9091」「ISO 149661」(jp は 9001 / 14001) — 訳層の数字誤りの強い候補。その次に `2019r01a-q047` (16 hits / 1 題): 4 肢の zh / en が「功能1」/「Function 1」だけで jp 肢 `[表] 機能1：開発規模(KS) 10／…` の数字が無い。**候補であり欠陥の向きは未確定** — 三語の stem 表には数字があり、jp 選択肢側の `[表]` 一行化が特殊形式である可能性もある。残りは「半年→six months」型の訳し方の差や長い stem の数字で、FP が多いと見込む。値 1 は機械照合できないので除外した (取りこぼしうる)。
- **0c** (134 field / 95 題 (pop 36 / excluded 12 / 13exam 47) が jp 異常、その zh / en が tr_of_anomaly): isolated_kanji は OCR 起因に見えるもの (`2009h21a-q018` 対了表 / 凡務、`2014h26a-q063` 伝科、`2014h26h-q085` 一且) と正当な語 (次表 / 会兼 / 共創 / 人名) が混在し、目視の印象は半々。rare_kanji は大半が正当な稀字 (津波・摩擦・函館) で弱い信号 → §5 の規模からは除いた。R3 は引用符の開閉不整合 (“上半期" 型、0q と重なる) が主。
- **0q**: ASCII `"` の prose 命中 field は jp 60 / jp_raw 105 / zh 56。リテラル判定は 2024r06-q062 (jp_raw) だけ。en は英文組版の通常記号で 169 field (⑨ #11 の方針事項)。jp・zh の prose 命中は字種そのものが表記規約違反なので FP は少ないが、源の字形 (“” か「」か) は源を見ないと決まらない。
- **1**: 表示層 (jp / zh / en) の見出し混入は 9 field / 4 題 (pop 2 / excluded 1 / 13exam 1)、残りは jp_raw (学習者不可視)。正規表現が厳密なので FP はほぼ無いと見込む (1.mid は〔テクノロジ〕等の節見出しの後の「問N」)。**`2021r03-q001` は ⑤-2 母数内 (U6 完了済) なのに jp 表示 stem の先頭に「問1」が残っており、⑤-2 の取りこぼし** (U6 は同型の q100 だけを是正)。表示層の他は `2019h31h-q001` zh / en (U3b は jp のみ是正)、`2015h27a-q089` (excluded)、`2011h23a-q089` (13exam、stem 途中の「問 89」)。
- **7**: 7.space 128 field のうち U4 の除外類 (表型・図の言語化) が 62。残りの prose / kanji / kata / particle には読点脱落と行折返しの語中空白 (「電子 メール」「最も適 切」) と箇条書きの区切り (`2019h31h-q053`〔前提〕) が混ざり、機械では分けられない (U4 も目視で分類した)。7.comma_nospace は 157 hits (選択肢だけなら 68)。U9 NIT-4 の「310 件」は数え方が記録されておらず突合できない (選択肢の「, の後に空白なし」を数字区切りも含めて数えると 390)。7.newline は 0。
- **10**: 9 field / 7 題 (pop 0 / excluded 0 / 13exam 7)、全て 13exam。末尾残渣 (`2009h21a-q018` 4 肢、`2014h26h-q071`「ぜい」) は目視でほぼ実欠陥。ノンブル型は現行データに 0 (U11 で是正済)。
- **2**: 9 / 6 を含む数字は §1 の表のとおり数字を含む field の 15〜45%。ends96 は「最下位桁が 9 / 6」というだけなので弱い。cross (他層に 0 化形がある) は強いが、ほぼ jp_raw / fig 層 (表示層は 0) — 表示層の訳は誤った jp から作られているので層間比較では見えない。表示層の斜線ゼロは D-150 段 2 (数字を含む field の源照合) で拾うしかない。
- **T**: 表を持つ題 289。T.num_vs_fig は figure_description が要約文で数字を一部しか持たないため FP が大半。T.num_raw_clean (38 題) は raw と clean の表の数値が違う題で、どちらかが源と違う (fig_stem_mismatch の 17 題中 9 題がこれに当たる)。

## 5. A2 (源照合) の推奨対象と規模

数は field 数 (題 × 層 × field)。excluded / 13exam は B track (D-150 第 3 条) が jp を全量再抄写するので、jp 層の候補は**B の fixer に名指しで渡す**扱いにし、A2 では pop と訳層を先に回すことを推奨する。

| 対象 | pop | excluded | 13exam | 照合のしかた |
|---|---:|---:|---:|---|
| 0a 優先 (word / char / num / ins かつ prose) | 105 | 77 | 204 | pop: ⑤-2 で jp は源照合済 → 該当 hunk の zh / en を段 3 に回す。excluded / 13exam: B fixer に渡す |
| 0b 訳層の数字・略語 | 5 | 14 | 16 | jp を源で確認 → zh / en を是正。`2014h26a-q045` を最優先、次に `2019r01a-q047` (欠陥の向き未確定) |
| 0c jp 異常 (rare_kanji 除く) | 19 | 7 | 45 | pop の命中は ⑤-2 の後も残る異常 → 源で確認。zh / en は jp 確定後に照合 |
| 0q ASCII " (jp / zh の prose) | 27 | 32 | 57 | 源で引用符の字形を確認 → 置換 |
| 1 見出し (表示層) | 3 | 3 | 3 | 源照合不要 (機械削除)。pop の `2021r03-q001` jp は ⑤-2 (U6) の取りこぼし |
| 7 散文類 (prose / kanji / kata / particle) | 35 | 7 | 24 | 源で読点の有無を確認 |
| 7.comma_nospace | 48 | 14 | 39 | 源照合不要 (house rule の空白、方針確認のみ) |
| 10 末尾残渣 | 0 | 0 | 9 | 源照合は軽い確認のみ (残渣の削除) |
| 2 cross | 10 | 7 | 6 | 源で数字を確認 |
| 2 段 2 (表示 jp の数字を含む field 全数) | 564 | 588 | 1360 | D-150 段 2 = pop の数字含有 field を源照合 (斜線ゼロ ends96 はこの中に含まれる) |
| T (fig_stem_mismatch 17 ∪ T.num_raw_clean) | 3 題 | 19 題 | 24 題 | 表セルの数値を源で照合 (題単位) |

- **推奨の順序**: (1) 0b + 1 + 10 (小さく確度が高い) → (2) pop の 0c / 7 / 0q / 2 cross / T → (3) 段 2 (pop の数字含有 field) → (4) 0a 優先の pop 分を段 3 (訳層照合) の pilot に合流。excluded / 13exam の jp 候補は B track の各 unit 起動時に fixer へ渡す。
- 規模は field の重複を含む (同じ field が複数の型に当たる)。源照合の題数は型をまたいで dedupe すると上表の和より小さい。

