# Rule A 全数抽検 — strategy-07-23-u01 (業務要件定義 — 機能要件・非機能要件と合意)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (b38)、repo HEAD `339feaa6` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b38-u01-a2` (種付き: a1 jp.r1 + jp-review #2) の merge 結果、sha256 先頭 `6e2fed52f9dff751`)。
- **対象**: `data/ip/textbook/units/strategy-07-23-u01.json` (textbook-unit-v2)、用語 **4 / 4 = 全数** (業務要件定義 / 機能要件 / 非機能要件 / 要件の合意) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。用語・`term_zh`・`term_en` は v1 と一致。
- **基準**: D-195、D-197〜D-200、D-202〜D-205、D-208 (既知の不合格型 1〜10)、D-209、D-210、D-211。比較: `.planning/v2/strategy-07-23-u01/v1-original.json`、前 attempt `failures/phase5/stage_07_ui/phase3/batch/strategy-07-23-u01_attempt_1.md`、journal `journal.b38-u01-a2.jsonl` (jp-review #1 PASS low 9 / loc-review #1 PASS low 5)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 4 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / memory_hook_* / summary.*`) は本体から `**` と `[[jp:]]` の括りを外したもの (原語は括弧内の平文で残る形) で、内容差 0 (スクリプト照合 39 欄、不一致 0)。`terms[0..2]` は hook なし (空)、`terms[3]` のみ hook あり。
2. **考点 × 引用題 (考点 11 件 = 全て exam、引用 qid 延べ 20 = 異なり 20 題、全て topic `strategy-07-23`)**: `questions.json` (+ `translations/<exam>.json` の `stem_jp_clean`) で題文・選択肢・正答を再読し、正答一致・誤答肢を支持しないこと・限定条件を 1 件ずつ確認 (§2)。topic 37 題のうち未引用 17 題も題意を確認 (うち quiz / challenge のみ 5 題 = 2010h22h-q018 / 2012h24h-q008 / 2017h29a-q030 / 2019r01a-q045 / 2024r06-q033)。
3. **quiz / challenge**: quiz 12 枠 (各用語 3、2010h22h-q018 のみ考点外) + challenge 5 題。q018 (業務要件定義 = 業務手順・組織の責任・権限などを定義; 誤答 = 開発体制・システム全体像・ソフトウェアの動作) は `terms[0].one` と一致 (L4 参照)。q008 (目的 = 範囲と機能を具体化し利害関係者間で合意) は `terms[0].detail` 2 文目・`key_points[0]` と一致。q030 (機能について利害関係者の合意が要るのは要件定義) は `terms[0].detail` と `terms[1].points[1]` で解ける。q045 (処理時間の目標値 → システム要件定義) は `terms[0].fig.steps[2]` (システムに求める機能や性能を決める = システム要件定義) で解ける。2024r06-q033 (正答 c・d) は `terms[3].detail` 2 文目・`key_points[3]` (曖昧なまま進むと作り直し) が c を支え、企画プロセスが業務要件定義より前である (`terms[0].detail`) ため a を業務要件定義の曖昧さに帰さない読みと整合。
4. **D-198 写し**: validate の copy guard / choice-echo warn = 0 件。独立照合として単元の JP 文字列 87 本 (派生除く) を topic 37 題の題文 + 選択肢と 12 字連続照合: (a) カタカナ 4 字以上・英数遮蔽あり → 0 件; (b) 遮蔽なし → 1 件 (`terms[0].detail_jp` 「ソフトウェアライフサイクル」= 用語名、偽陽性); (c) 近似 (12 字窓・ハミング 1〜2、遮蔽なし) → 9 系統。偽陽性: `goals_jp[0]`・`overview.intro_jp` ↔ 2013h25a-q043 題文 (「要件を明確にしていく順」= 一般句、L7 に記録)、`goals_jp[1]` ↔ 2016h28h-q001 題文 (「機能要件と非機能要件」= 見出し語 2 つ)、`terms[0].detail_jp` (ライフサイクル)、`terms[0].points[0]` ↔ 2009h21h-q025 ウ (「システム要件…ソフトウェア」の語の連なり)、`terms[1].points[1]` ↔ 2012h24a-q091 題文 / 2014h26h-q026 題文 (「ためにシステムが持つ」「要件定義プロセスの」= 汎用連語)、`terms[3].points[1]` ↔ 2026r08-q052 題文 (前提の一般句「開発者がシステム要件を定義する場合」、主体名・数値なし; jp-review #1 と同判断、正答肢との ed 0.55)。**写しの近い 2 件**: `terms[1].points[0]` ↔ 2016h28h-q055 正答ア (ed 0.22 / 全文 Dice 0.45) → L1、`terms[0].points[2]` ↔ 2019h31h-q017 正答エ (ed 0.40 / Dice 0.29) → L2。較正 (HIGH = ed 0.14 / Dice 0.52、L1 建議修 = ed 0.40 / Dice 0.32; システムテスト定義の前例 ed 0.19 / Dice 0.70 も定義の核だけで L1 建議修) に照らし、どちらも題固有の場面・数値・主体を含まない分類語 / 一般原則なので HIGH にしない。カタカナの多い文 (ソフトウェアライフサイクル・システム要件・ソフトウェア要件・レビュー・セキュリティ) は目視で見出し語・一般語のみ。
5. **D-195**: 結論先行 (one = 1 文 × 4、太字あり)、展開 2 文 × 4、比喩は別領域の場面 (引っ越し / 自動販売機 ×2 / 注文住宅)、hook は `terms[3]` のみ (字の手がかり + 手順; L10)、定義前使用 (利害関係者 = `terms[0].detail` の括弧注、要件定義プロセス = 同 detail、ソフトウェアライフサイクル = 同括弧注、システム要件 = `terms[0].points[1]` で「性能や方式を表す」と注、応答時間 = 非機能 `points[0]`、要件定義書 = 合意 detail で太字導入、レビュー = 合意 `points[1]`)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `terms[2].analogy_jp`「商品が出る」(通常の用法) のみ = 0。zh・en 相当語 (必须 / 务必 / 考试 / 记住 / 重要 / must / exam / remember / important / always) → en "must" 3 件 (`one_en`・`definition_en`・`overview_rows[2].one_line_en` の "a system must meet" = 要件の内容) と `kind:"exam"` キーのみで偽陽性。図の型: 業務要件定義 = flow steps 4、非機能要件 = tree static (例 4 系統 × 2)、要件の合意 = flow steps 4、機能要件 = 図なし (対比は pairs[0]) — 全て登録内。pair 配置 (機能要件 / 非機能要件 = 非機能要件の後、key 行 rows[0] あり)。
6. **D-200**: 考点数 3/2/3/3 (≤3 ✓)、各 JP 1〜2 文・38〜68 字 (≤100 ✓)。**framing 件数** (`POINT_FRAMING` の型で全考点を照合): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 → §4 (attempt 1 の 3 件の解消を含む)。書き方 8 (対比の出現欄): 機能 = 何をするか / 非機能 = それ以外の条件 は `pairs[0].rows[0..2]` (定義・例・区分)、`overview_rows[1..2]` (総表の構造 = D-195 §3)、両用語の analogy (同じ自動販売機で「機械がする仕事」/「それ以外の条件」= §6 の対比の手がかり)、`terms[2].points[1]`「システムの働きではなく品質の条件」→ pairs + 考点 1 = 2 箇所まで、許容。書き方 9 → §2 表、L3 以外の落ち 0。§6 → L10。§9 言い直し → L9。
8. **三語**: zh・en が jp と同じ事実か、図ラベル・caption・総表・対比表の三語一致、`[[jp:…]]` 原語 17 種 (業務要件定義 / 要件定義プロセス / 業務要件 → システム要件 → ソフトウェア要件 / 業務要件 / システム要件 / 業務ルール / 機能要件 / 入出力データの種類 / 非機能要件 / 性能 / 応答時間 / 要件定義 / 要件の合意 / 要件定義書 / 合意 / 利用部門の責任者 / レビュー) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 4 用語に見出し語の `[[jp:]]` あり、zh 訳語表 (`応答時間` = 应答时间 を `points[0]`・図ラベルで遵守、利害関係者 = 利害关系者; validate の B6 / jp-origin warn 0)。
9. **機械ゲート**: §8 に出力。

## 2. 用語別判定 (4 / 4)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 業務要件定義 | OK — exam 3 / 4 題: 業務要件 → システム要件 → ソフトウェア要件の順 (2013h25a-q043 正答ア; 並べ替え題、L7) / 業務要件 = 業務上の目標とやり方、システムの性能・方式を表すシステム要件とは別層 (2016h28a-q004 正答エ = 物流コスト削減のための自動化率; 誤答 ア 稼働率・イ 暗号化・ウ ブラウザ はシステム側で「性能や方式」の「や」で例示、否定肢を並べ直していない) / 業務ルールは業務要件の定義で明らかにし、不十分なら誤った解釈のまま作られる (2013h25a-q002 正答ア 業務要件の定義 / 2019h31h-q017 正答エ; 場面 [証券会社・例外ルール・委託先] は使わない)。one の「業務の手順、役割と権限、業務ルール」は 2010h22h-q018 正答エ (quiz) と一致、ただし「など」なし (L4)。fig steps 4 は one・考点と一致 | OK (L1 なし、L2) | OK | L2, L4, L7, L12 |
| 2 | 機能要件 | OK — exam 2 / 3 題: 入出力データの種類は機能要件 (2016h28h-q055 正答ア; 誤答 イ 許容復旧時間・ウ 移行手順・エ 品質と開発コスト はいずれも本文で非機能側・または言及なし、支持しない) / 業務を支えるシステムの機能と範囲を具体的に示すのは要件定義プロセス (2017h29h-q004 正答イ / 2014h26a-q025 正答エ 要件定義)。分類の手がかりは定義 (何をするか) と analogy (機械がする仕事) のみで、**判定規則の形の hook は無い** (attempt 1 の「動詞で書けるなら機能要件」は削除、§4)。2016h28h-q001 の機能要件欄 (会計処理・確認・記録) と 2018h30h-q006 a (業務機能間のデータの流れ = 機能側) にこの定義を当てても誤分類しない | OK (L1 写しに近い) | en one の括弧位置 L6 | L1, L6 |
| 3 | 非機能要件 | OK — exam 3 / 7 題: 性能 = 処理の速さ、応答時間・処理時間で示す (2021r03-q046 正答ウ 照会の応答時間; 誤答 イ 稼働率・エ 復旧時間 は図で「信頼性」の枝に分けて置かれ、性能と取り違えない) / 年間停止時間の上限・復旧目標時間は非機能 (2016h28h-q001 正答ア / 2018h30h-q006 正答ウ b・c; 考点は c のみ正の分類として述べ、b [監視] は図の運用・保守に置く。組・順序のなぞりなし = D-209 分類型) / 応答時間目標・運用時間帯も要件定義の工程で決め利用部門と取り決める (2013h25a-q031・2011h23a-q033・2009h21a-q032 正答 = システム要件定義 / 2012h24h-q049 正答 = 要件定義; 「要件定義の工程」はどれとも矛盾しない、L8)。限定条件: 2009h21a-q032 の「利用部門と取決め」保持。one は「品質の水準や技術面・運用面の条件」で 2018h30h-q006 題文の定義 (技術要件・運用要件など) と一致 | OK | OK | L8, L9 |
| 4 | 要件の合意 | OK — exam 3 / 6 題: 業務要件の合意相手 = 利用部門の責任者 (2015h27a-q025 正答エ / 2018h30a-q017 正答イ 営業部門長と合意 / 2012h24h-q043 正答エ 利用部門の部門長; 誤答 [開発ベンダの責任者・PM の承認・オペレータ等] を支持しない。ただし q025 の「必ず」の含みが「相手は…である」で閉じる → L3) / 開発者がシステム要件を定義しても利用者はレビューに加わりニーズとの整合を確かめる (2026r08-q052 正答ア / 2014h26h-q043 正答イ 発注者のニーズとの整合性) / 合意した要件定義書が開発の対象範囲を決める (2014h26a-q037 正答ウ)。fig steps 4 (文書化 → 利用者レビュー → 利用部門責任者の承認 → 開発の基準) は考点と一致。hook・analogy を 2018h30a-q017 に当てると正答イ (両者で詰め、利用側の長と合意) を選び、誤答エ (作る側の PM が承認) を選ばない | OK | hook_en "users' manager" L10 | L3, L10 |

**単元レベル**: goals 3・overview_cols 2 (決めること / 例)・overview_rows 4・pairs 1 組 3 行 (key 1)・key_points 4・summary (派生、一致)・challenge 5 件 (§1-3、本文と矛盾なし)。`key_points[1]`「数値で書けるものが多く」は「多く」で限定 (監視の方法など数値でないものを排除しない)。事実誤りなし。

## 3. D-205 / D-210 / D-211

- **D-205**: 非機能要求グレード・共通フレーム・SLCP の版名・構成数は本文に出ない (grep 0)。非機能の区分は `pairs[0].rows[2]`「主な区分」、図 root「非機能要件の例」、`overview_rows[2].extra_jp[0]`「…など」で、閉じた列挙ではない → 対象外。ライフサイクルのプロセスは「企画の次に来る要件定義プロセス」と位置だけを言い、プロセス数を言わない。
- **D-210**: 法令・規格改正前の文言に基づく引用題なし。
- **D-211**: (i) quiz / challenge のみ = 2010h22h-q018 (quiz)・2012h24h-q008 / 2017h29a-q030 / 2019r01a-q045 / 2024r06-q033 (challenge)。いずれの題の内容も本文 (one / detail / fig / key_points) が担い、学習目標 3 点の欠落なし。(ii) 正誤選択型で正解肢が一般原則のもの (2016h28a-q004・2019h31h-q017・2026r08-q052・2014h26h-q043・2010h22h-q018) は、考点が一般表現で述べ選択肢の順序・組を再現しない (2019h31h-q017 の語句の近さは L2)。並べ替え題 2013h25a-q043 は exam 考点 `terms[0].points[0]` と図に正答順が出る → L7 (strategy-07-24-u01 L3 と同扱い)。

## 4. attempt 1 の MEDIUM 3 件の解消 (三語)

| a1 指摘 | a1 (jp.r1) | 現行 (a2) jp / zh / en | 判定 |
|---|---|---|---|
| `terms[1].hook_jp` 「動詞で書けるなら機能要件」= 偽の判定規則 | hook あり | hook_jp / hook_zh / hook_en とも空 (派生 memory_hook も空)。代わりの判定規則は他欄にもない; pairs[0].rows[1] は機能・非機能とも動詞で例示するが「書き方の例」で規則ではない | **解消** (三語) |
| `terms[3].hook_jp`「判を押すのは作る側ではなく使う側」/ analogy (施主が読んで署名) = 作る側の了承を否定 | 上記 | hook: jp「作る側と使う側が内容を合わせたうえで、使う側の責任者が承認して確定する」/ zh「开发方和使用方先把内容对齐，再由使用方的负责人批准确定」/ en "The builders and the users first bring the content together, and then the users' manager approves it"。analogy: jp「施主と工務店が打ち合わせを重ねて仕様書を詰め、最後に施主が…署名」/ zh「业主和施工方反复商谈、敲定规格书」/ en "the owner and the builder meet repeatedly to settle the specifications"。否定表現なし、双方で詰める像 = one「双方が了承」・2017h29a-q019 (利用者側と開発者側で明確に) と一致、承認者 = 利用側の長は 2015h27a-q025 / 2018h30a-q017 と一致 | **解消** (三語) |
| `terms[2].one_jp` / `overview_rows[2].one_line_jp` / `pairs[0].rows[0].b_jp` 「つまり機能をどの水準で提供するか」= detail・図・2018h30h-q006 と範囲ずれ | 「つまり機能を**どの水準で**提供するか」 | one: jp「(性能・信頼性・セキュリティといった**品質の水準**や、技術面・運用面の条件)」/ zh「（…等**质量水平**，以及技术和运维方面的条件）」/ en "(**quality levels** … plus technical and operational conditions)"。overview_rows[2]: jp「品質の水準や技術・運用面の条件」/ zh「质量水平及技术、运维方面条件」/ en "quality levels and technical or operational conditions"。pairs[0].rows[0].b: jp「(品質の水準、技術・運用面の条件)」/ zh「（质量水平、技术及运维方面的条件）」/ en "(quality levels, technical and operational conditions)"。図の「運用・保守 > 監視の方法」、2018h30h-q006 (監視のサイクル = 非機能) と範囲一致 | **解消** (三語、回帰なし) |

## 5. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 12 (うち 建議修 6)** + 範囲外観察 1

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 (before → after) |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1].points[0].text_jp` (+ zh / en を同趣旨に) | 2016h28h-q055 (分類型) 正答アの語句「システムが…入出力データの種類」を、動詞 1 か所の同義置換 (取り扱う → 受け取り、返す) で再現 (半大域 ed 0.22 / 全文 Dice 0.45)。HIGH 較正 (0.14 / 0.52) に届かず、題固有の場面・数値なし、分類語そのもの (D-198 標準表現側) なので HIGH にしない。D-209 の分類型免除は選択肢語句の再現で無効になるため、語句を崩す | jp「システムが受け取り、返す**入出力データの種類**は、」→「システムがどんなデータを受け付け、どんなデータを返すか、つまり**入出力データの種類**は、」(修正後 ed 0.44、topic 37 題との最長一致 9 字 = 見出し語「入出力データの種類」のみ、近似 0) / zh「系统接收和返回的**输入输出数据的种类**（[[jp:入出力データの種類]]）决定了」→「系统接收什么数据、返回什么数据，即**输入输出数据的种类**（[[jp:入出力データの種類]]），决定了」/ en "The **types of input and output data** ([[jp:入出力データの種類]]) the system receives and returns determine" → "Which data the system accepts and which it returns, that is, the **types of input and output data** ([[jp:入出力データの種類]]), determine" |
| L2 | LOW **建議修** | `terms[0].points[2].text_jp` (+ zh / en) | 2019h31h-q017 (正誤選択型) 正答エ「システムに盛り込む業務ルールの誤った解釈」を 1 字置換 (盛り → 組み) + 「誤って解釈」で再現 (ed 0.40 = L1 建議修の較正線)。一般原則で HIGH ではない (D-211 (ii) / D-198 側) | jp「システムに組み込む**業務ルール**は」→「システムが従う**業務ルール**は」、「ルールを誤って解釈したまま」→「ルールを取り違えたまま」(修正後 ed 0.55、最長一致 7 字「業務要件の定義」、近似 0) / zh「要嵌入系统的**业务规则**（[[jp:業務ルール]]）」→「系统要遵循的**业务规则**（[[jp:業務ルール]]）」/ en "**Business rules** ([[jp:業務ルール]]) to be built into the system are clarified" → "**Business rules** ([[jp:業務ルール]]) that the system follows are clarified" |
| L3 | LOW **建議修** | `terms[3].points[0].text_jp/zh/en` | 「合意を得る相手は…利用部門の責任者である」は 2015h27a-q025 の「必ず合意を得ておくべき」(最低限欠かせない相手) を、相手の同定 (それ 1 者) に寄せる。one_jp「利用部門などの利害関係者」、未引用の 2009h21h-q025 (取得者側の利害関係者間で合意)・2021r03-q014 (利用者及び他の利害関係者) と軽く食い違うが、引用 3 題とも同じ相手を正答とし、topic 内に「他の相手」を問う題はなく誤答に導かない → 型 (2) の範囲を閉じる強さには至らず LOW。§9 grep 語「必ず」を避けて含みを戻す | jp「業務要件について合意を得る相手は、」→「業務要件の合意で欠かせない相手は、」(最長一致 8 字 = 見出し語「利用部門の責任者」、近似 0) / zh「就业务需求达成共识的对象，是」→「就业务需求达成共识时不可缺少的对象，是」/ en "Agreement on business requirements is obtained from the **head of the user department** ([[jp:利用部門の責任者]]) that will use the new system." → "The one party whose agreement on business requirements cannot be left out is the **head of the user department** ([[jp:利用部門の責任者]]) that will use the new system." |
| L4 | LOW **建議修** | `terms[0].one_jp/zh/en` (派生 `definition_*` は自動追従) | あるべき姿の括弧注「業務の手順、役割と権限、業務ルール」は、quiz 2010h22h-q018 正答エ (業務手順や…責任、権限など) の「など」が無く、括弧の定義注として閉じた内訳に読める (q018 は考点 qid でないため rule-9 HIGH ではない) | jp「(業務の手順、役割と権限、業務ルール)」→「(業務の手順、役割と権限、業務ルールなど)」/ zh「（业务流程、角色与权限、业务规则）」→「（业务流程、角色与权限、业务规则等）」/ en "(procedures, roles and authority, business rules)" → "(procedures, roles and authority, business rules, and so on)" |
| L5 | LOW **建議修** | `goals_en[2]`、`overview.intro_en` (同文) | jp「要件を誰と確認し」(確認の相手) に対し en "who confirms" は確認する主体に読める (loc-review #1 未適用、zh は正しい) | goals_en[2] "Explain who confirms requirements and how they are finalized" → "Explain whom requirements are confirmed with and how they are finalized" / overview.intro_en の "Explain who confirms requirements and how they are finalized" → "Explain whom requirements are confirmed with and how they are finalized" (jp・zh 変更なし) |
| L6 | LOW **建議修** | `terms[1].one_en` (派生 `definition_en` 追従) | 括弧 (the data it accepts …) が "business requirements" の直後に置かれ、業務要件の説明に読める (jp は「何をするか」の内訳; loc-review #1 未適用) | "define **what the system does** to meet the business requirements (the data it accepts, the processing it performs, and the screens and reports it outputs)." → "define **what the system does** (the data it accepts, the processing it performs, and the screens and reports it outputs) to meet the business requirements." |
| L7 | LOW | `terms[0].points[0]` / `terms[0].fig` (三語)、`goals_jp[0]`・`overview.intro_jp` | 並べ替え題 2013h25a-q043 の正答順 (業務 → システム → ソフトウェア) を考点と図が述べる。ただし順序そのものが SLCP の標準原則で単元の学習目標 (D-195 §2 の段階図)、題の語 (「業務要件の定義」「…定義」) の並びは写さず「業務に近い側から」の理由を加えた一般表現 → D-198 標準原則側 (strategy-07-24-u01 L3 と同扱い)。goals / intro の「要件を明確にしていく順」は同題題文の一般句の近似 (12 字窓 2 字差) | 記録のみ (任意で `terms[0].points[0].kind` "exam" → "mix" で D-211 (i) に寄せられる) |
| L8 | LOW | `terms[2].points[2].text_*` | 「要件定義の工程」は引用 4 題中 3 題の正答「システム要件定義」より粒度が粗く、単元の図が業務要件の定義 / システム要件定義を分けるため段階が読み取りにくい (jp-review #1 low と同じ)。どの題とも矛盾せず、q045 (challenge) は図 steps[2] で解ける | 記録のみ |
| L9 | LOW | `terms[2].detail_jp` / `terms[2].points[1]` / `key_points_jp[1]` (止まってよい時間)、`terms[3].detail_jp` ↔ `key_points_jp[3]` (作り直し)、`terms[0].detail_jp` / `terms[1].points[1]` / `key_points_jp[0]` (範囲と機能の具体化)、`pairs[0].rows[1].a` ↔ `terms[1].detail` (例) | §9 同義の言い直し / 書き方 8 の例の反復 (D-203、jp-review #1 low と同じ) | 記録のみ |
| L10 | LOW | `terms[3].hook_jp/zh/en` | 2 文目が one・図 steps[2] の言い直し、1 文目の字の手がかりも弱い (§6、jp-review #1 low)。hook_en "the users' manager" は他欄の "head (of the user department)" と不統一 (loc-review low) | 記録のみ |
| L11 | LOW | zh: `terms[1].one_zh`・`pairs[0].rows[2].a_zh`・`terms[2].detail_zh` の「画面」、`overview_rows[2].extra_zh[1]`・`pairs[0].rows[1].b_zh`・`key_points_zh[1]` の「响应」 | 日式借词 / 応答時間 の訳語 (表は 应答时间) との混在 (loc-review low)。考点・図ラベルは表どおり、意味は通る | 記録のみ |
| L12 | LOW | `overview_rows[3].extra_jp[0]` (列「決めること」に承認者)、`terms[0].analogy_*` (引っ越しで「間取りの図面」) | 列見出しとの軽いずれ / 比喩の小さな不自然さ (jp-review low) | 記録のみ |

**範囲外の観察**:
- O1 `unit_summary_*` は v1 と同文 (未改稿、事実は正しい)。

確認済みで問題なし: attempt 1 の MEDIUM 3 件の解消と zh / en の回帰なし (§4)、限定条件 (考点 11 件、L3 以外の落ち 0)、§9 禁止句 0、framing 0/0/0、D-197 (validate 0)、D-200、写し (validate 0、独立照合 遮蔽あり 0 / なし 偽陽性 1、近似は L1・L2 以外偽陽性)、既知の不合格型 (1) 選択肢なぞり 0 (choice-echo warn 0; q006 は c のみ正の分類で組をなぞらない) / (3) 別名の別物扱い 0 / (4) 比喩・図の範囲 一致 / (5) zh・en 回帰 0 / (6) zh・en の誤答肢寄り訳 0 (L5 は主体の取り違えで誤答肢には寄らない) / (7) D-210 対象なし / (8) 比喩の語が他見出し語と衝突 0 / (9) hook・比喩を引用題に当てて誤答 0 (要件の合意 hook × 2018h30a-q017 → イ、自販機の二分 × 2016h28h-q001・2018h30h-q006 → 正答) / (10) 閉じた列挙 0 (D-205)、`[[jp:]]` 原語 17 種実在、zh 訳語表 (B6 warn 0)、図種 (flow ×2 / tree ×1 / 図なし ×1 = 登録内)、派生フィールド一致、v1 不変量。

## 6. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **12** (建議修 6: L1〜L6 / 記録のみ 6: L7〜L12) |

## 7. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 4 用語・考点 11 件・引用 20 題 + quiz / challenge のみ 5 題で、考点の主張は正答と一致し、誤答肢を支持する記述・判定規則型の誤った手がかりは無く、attempt 1 の MEDIUM 3 件は三語とも解消。LOW 建議修 6 件 (L1〜L6) は補丁 (B3) で修正推奨、L7〜L12 はバッチ証拠の「未修 LOW」表へ。

## 8. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-07-23-u01
✓ strategy-07-23-u01 unit: 0 issues (data/ip/textbook/units/strategy-07-23-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-07-23-u01
✓ strategy-07-23-u01 parity: 23 locations, 0 diff
EXIT=0
```
