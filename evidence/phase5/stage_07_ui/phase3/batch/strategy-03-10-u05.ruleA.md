# Rule A 全数抽検 — strategy-03-10-u05 (インターネット広告(課金・出稿型))

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S148 b30)、repo HEAD `b250aaee` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b30-u05-a1` merge 結果、sha256 先頭 `abe758e886f13a47`)。
- **対象**: `data/ip/textbook/units/strategy-03-10-u05.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (インターネット広告 / オプトインメール広告 / バナー広告 / リスティング広告 / アフィリエイト) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-210、テンプレ既知失敗型 (1)〜(10)。比較: `v1-original.json` / `manifest.json` (用語・`term_zh`・`term_en` とも v1_terms と一致、スクリプト True)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・欄同士の不整合 (観点 7)・比喩の範囲が考点/detail と矛盾 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (tree label・flow label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生 (`definition_* / explanation_* / memory_hook_* / summary.*` / `overview.intro_*`) は本体の記法除去版 (目視 + 抜き取り一致)。
2. **考点 × 引用題 (考点 7 件 = exam 5 + mix 2、引用 qid 延べ 6 件 = 異なり 4 題)** + quiz / challenge で未引用の 2 題 (2016h28h-q003、2009h21a-q026 のバナー側): `data/ip/quiz/questions.json` (translations に stem_jp_clean がある 2011h23tokubetsu-q029 / 2016h28h-q003 は clean 版) で題文・選択肢・`correct_answer` を再読、全題 topic `strategy-03-10`。数値例は本単元に無い (再計算対象なし; source_figures の 2013h25h-q098/q099 経路図は本文で使われていない)。
3. **課金方式の言い切り点検** (依頼の重点): 引用題 4 題はいずれも課金方式 (表示課金 / クリック課金 / 成果報酬) を問わない。本文の課金記述は全てヘッジ付き — バナー detail「〜方式がよく使われる」、リスティング detail「〜方式が一般的」、key_points[3]「クリック課金が一般的」、pairs[0].rows[2] の行名「主な課金の例」。排他・閉じた言い切り無し。アフィリエイト = 成果報酬は定義そのもの (2009h21a-q026 正答イ「誘導実績に応じた報酬」) で、detail は成果を「例えば購入や会員登録」と開いた列挙で述べる → ただし analogy が購入時だけに閉じる (M1)。
4. **opt-in / opt-out と特定電子メール法**: `terms[1].detail_jp`「2008 年の改正以降、広告・宣伝メールの送信には原則として受信者の事前の同意を求めている」は事実 (平成 20 年改正でオプトイン規制導入) で「原則として」を保持し、`strategy-02-05-u04` (原則はオプトイン、法が定める例外もある / 拒否されたら止める後追いはオプトアウトの考え方) と整合。`terms[1].points[1]` (オプトアウト = 拒否が伝わるまで送ってよいとする考え方) も u04 と同じ向きで、合法とは言っていない。引用題は法改正前後に依存しない → D-210 対象外。D-205 (改訂文書の構成数) 該当なし。
5. **D-198 写し**: validate copy guard 0 件 (`warn choice-echo` 出力なし)。独立照合: 単元の JP 文字列 57 本 (派生除く、図ラベル・caption・表セル込み) × topic 内全 43 題の題文 + 選択肢 (215 本) の 12 字連続照合を、カタカナ 4 字以上・英数を □ に遮蔽 (実字 6 未満の窓除外) / 遮蔽なし の両方で実施 → **0 / 0 件**。近似照合 (見出し語除去後の正規化編集距離 ed / bigram Dice / 最長共通連続 LCS、文全体 + 定義節単位) の最接近: `terms[2].points[0].text_jp` ↔ 2011h23tokubetsu-q029 正答ウ **ed 0.36 / Dice 0.60 / LCS 10 (「クリックすると広告主」)** — 較正 HIGH 例 (ed 0.14 / Dice 0.52) にも LOW 建議修の前例 (ed 0.19〜0.20) にも届かない → L3。次いで `terms[4].points[0]` ↔ 2009h21a-q026 正答イ ed 0.78 / Dice 0.40 (LCS「へのリンクを」)、`terms[1].points[0]` ↔ 2013h25a-q009 題文の定義節 ed 0.72 / Dice 0.33 (LCS「広告をメールで」)、`terms[3].one_jp` / `points[0]` ↔ 2026r08-q023 正答イ ed 0.82〜0.87 / Dice 0.11〜0.42。カタカナの多い文 (オプトイン / オプトアウト / アフィリエイト の各文) は目視で選択肢の言い回しの写しなし。
6. **D-198 (iii) / D-209**: 2013h25a-q009 (分類題、誤答肢 = アフィリエイト広告 / オーバーレイ広告 / オプトアウトメール広告) に対し、`terms[1].points[1]` (mix) はオプトアウトを正の定義で述べ許可の向きで対比 = D-209 の「紛らわしい 2 語の正の定義の対比」で (iii) 非該当。誤答肢の集合・順序の再現なし。2026r08-q023 の誤答肢 (行動履歴ターゲティング / 許諾メール / メルマガ広告) と 2011h23tokubetsu-q029 の誤答肢 (別ウィンドウ / 中間ページ / 検索連動) を打ち消す考点なし。
7. **D-195**: one = 1 文 × 5 (太字あり)、detail 2〜3 文、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が; zh 必须 / en must・exam・always) → `出る` 6 (「検索結果に出る」等の通常用法)、`頻出` 1 (freq_badge)、`覚え` 12 (hook 4 + 派生 4 + summary 4、L5)、`exam` 7 (points.kind) のみ。図 = tree static (インターネット広告、子に「その他の手法」あり = 閉じた列挙でない) / flow steps 4 (アフィリエイト) = 登録内。pair 1 組 (バナー / リスティング、key 行 = 表示のきっかけ) はリスティングの後。
8. **D-200**: 考点数 1/2/1/2/1 (≤3)、各 JP 1 文・49〜68 字 (≤100)。**framing 件数** (`validateV2.pointFraming`、tsx で全考点に適用): jp 0 / zh 0 / en 0。
9. **三語**: zh / en が jp と同じ事実か、図ラベル・caption・比較行の三語一致、`[[jp:]]` 原語 9 種 (インターネット広告 / オプトインメール広告 / オプトイン / オプトアウト / 特定電子メール法 / バナー広告 / リスティング広告 / 検索連動型広告 / アフィリエイト) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 5/5 に見出し語 `[[jp:]]`、zh 訳語は `zh_terms.unit.json` どおり (横幅广告 / 关键词检索广告 / 联盟营销 / 选择加入（opt-in） / 选择退出（opt-out） / 特定电子邮件法、validate B6 warn 0)。
10. **前ラウンド指摘の回収**: jp-review r1 (PASS、low 8) / loc-review r1 (PASS、low 4) とも HIGH / MEDIUM なし。low は未修のまま残るが回帰なし (L6・L7 に記録)。
11. **機械ゲート**: §6。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | インターネット広告 | OK — exam 1 / 2 題: 総称で、検索結果の広告・ページの画像広告はその中の一手法 (2026r08-q023 / 2011h23tokubetsu-q029 の題文前提「インターネット広告の(手法の)一つ」と一致; 両題は個別手法を問う題で総称性は前提側)。detail「数値で測定しやすい」「属性や行動で絞り込める手法も多い」は事実、「も多い」で閉じない。tree 図は「その他の手法」付き | OK (detail 末文は §9 案内文 L2) | OK | L2 / L6 |
| 2 | オプトインメール広告 | OK — exam 1 / 1 題: 事前の同意を前提に関心に合う広告をメールで (2013h25a-q009 正答エ; 「あらかじめ」→「事前の」で限定条件保持) / mix: オプトアウト = 拒否まで送ってよいとする考え方、許可の向きが逆 (誤答ウの語だが正の定義の対比、D-209)。detail の法改正記述は §1-4 のとおり正確・u04 と整合 | OK | zh points[1] の括弧連続 (L7) | L7 |
| 3 | バナー広告 | OK — exam 1 / 1 題: ページの一部の広告画像、クリックで広告主の用意したページ (2011h23tokubetsu-q029 正答ウ)。誤答 (別ウィンドウ自動表示 / 中間ページ / 検索連動) を支持しない。quiz 2009h21a-q026 では誤答エ (ポータルの入口画像) がバナーの記述で、本文から判別可。課金はヘッジ付き | OK (正答ウの近い言い換え L3) | one「画像や動画」vs overview / key_points「画像」(L7) | L3 / L7 |
| 4 | リスティング広告 | OK — exam 1 / 1 題: 検索者の入れた語句に応じて検索結果に出る (2026r08-q023 正答イ) / mix: 検索がきっかけ vs バナーは検索と無関係に広告枠のあるページで表示 — 正の定義の対比。クリック課金は「一般的」で閉じない | OK | one_zh 太字範囲・one_en と term_en の表記差 (L7) | L6 / L7 |
| 5 | アフィリエイト | 考点 OK — exam 1 / 1 題: 提携サイトがリンクを載せ、誘導や購入の実績に応じ掲載側が報酬 (2009h21a-q026 正答イ「誘導実績」を保持、「個人のホームページなど」→「個人や企業のサイト」は広げる向きで誤答を支持しない)。quiz 2016h28h-q003 (正答 = レコメンデーション、アフィリエイトは誤答肢) は本文の定義 (提携リンク) から誤答と判別可。**analogy は購入時「だけ」に閉じ、考点の「誘導」と detail の「会員登録」を締め出す (M1)**。hook「売上の分け前」も購入寄り (L1) | OK | OK | **M1** / L1 / L4 / L8 |

**単元レベル**: goals 3・overview_cols 2 (表示・配信される場所 / 届く相手)・overview_rows 5・pairs 1 組 (3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge 4 題 (2009h21a-q026 / 2011h23tokubetsu-q029 / 2013h25a-q009 / 2026r08-q023、全て本文で引用・矛盾なし)。key_points[4]「成果の分だけ報酬を払う成果報酬型」は定義どおり (「だけ」は成果に対しての意で、成果の種類は閉じない)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 8 (うち 建議修 2)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[4].analogy_jp` / `analogy_zh` / `analogy_en` | 比喩が「紹介で来た客が実際に買い物をしたときにだけ紹介料」と購入時だけに閉じる。同用語の考点 `points[0]` は報酬の根拠を「誘導や購入の実績」(引用 2009h21a-q026 正答イ = 誘導実績に応じた報酬) とし、detail は成果を「例えば購入や会員登録」と開いて述べる → 比喩の範囲が考点・detail が認めるもの (誘導・会員登録) を否定する (D-204 / テンプレ (4)、rule-7 MEDIUM)。2009h21a-q026 の誤答を選ばせるまでには至らない (誤答肢に購入の語なし) ので HIGH ではない | jp「知人に店を紹介してもらい、その紹介で来た客の数や、実際の買い物といった実績に応じて、紹介料を渡すやり方。」/ zh「就像请熟人帮忙介绍自己的店，再按经介绍而来的客人数量或实际购买等实绩，付给对方介绍费。」/ en "It is like asking a friend to recommend your shop and paying them a referral fee based on what their referrals bring in, such as the number of customers they send or the purchases those customers make." |
| L1 | LOW **建議修** | `terms[4].hook_jp` / `hook_zh` / `hook_en` (+ 派生 `memory_hook_*`, `summary.memory_hooks_*[3]`) | 「売上の分け前」は M1 と同じく購入寄りの像 (分け前の像そのものは記憶の手がかりとして許容範囲で、閉じる語「だけ」は無いので LOW) | jp before「広告主と手を組んだサイトが、売上の分け前を受け取る関係と覚える。」→ after「広告主と手を組んだサイトが、紹介の成果に応じた分け前を受け取る関係と覚える。」/ zh before「记住这是与广告主联手的网站分得一份销售收益的关系。」→ after「记住这是与广告主联手的网站按推荐成果分得一份收益的关系。」/ en before "picture a site that joins forces with the advertiser and takes a share of the sales." → after "picture a site that joins forces with the advertiser and takes a share based on the results of its referrals." |
| L2 | LOW **建議修** | `terms[0].detail_jp` / `detail_zh` / `detail_en` 末文 | 「この単元では、その中の代表的な手法を順に見ていく。」は情報を持たない案内文 (§9 定型の締め、jp-review r1 low 未修)。削除後も detail 2 文で D-195 の範囲内 | jp before「利用者の属性や行動に合わせて、届ける相手を絞り込める手法も多い。この単元では、その中の代表的な手法を順に見ていく。」→ after「利用者の属性や行動に合わせて、届ける相手を絞り込める手法も多い。」/ zh before「很多手法还能按用户的属性和行为，缩小广告的投放对象。本单元会依次介绍其中有代表性的几种手法。」→ after「很多手法还能按用户的属性和行为，缩小广告的投放对象。」/ en before "Many of its methods can also narrow down who sees the ad, based on users' attributes and behavior. This unit walks through the main methods one at a time." → after "Many of its methods can also narrow down who sees the ad, based on users' attributes and behavior." |
| L3 | LOW | `terms[2].points[0].text_jp` | 2011h23tokubetsu-q029 正答ウと要素・順序が同じ近い言い換え (ページの一部 → 広告画像 → クリック → 広告主が用意したページ; ed 0.36 / Dice 0.60 / LCS 10)。分類題の正答内容を見出し語の一般定義として述べたもので D-209 の免除内、誤答肢をなぞらず、較正にも前例 (ed ≤0.20) にも届かない | 記録のみ |
| L4 | LOW | `terms[4].points[0].text_jp` | 2009h21a-q026 正答イと要素が対応する言い換え (ed 0.78 / Dice 0.40)、一般定義の範囲 | 記録のみ |
| L5 | LOW | `terms[1..4].hook_jp` (+ 派生) | 4 フック全てが「〜と覚える」で結ぶ (§9 同型の結びの反復、前例 technology-23-63-u06 L2 と同類) | 記録のみ |
| L6 | LOW | `terms[0].points[0]`、`terms[3].analogy_*` | 前者は引用 2 題の題文前提を述べる考点で、2 題が直接試す点ではない / 後者 (地図アプリで検索した人に案内) は検索連動広告の実例に近く別領域の比喩でない (D-203 §6)。いずれも jp-review r1 low | 記録のみ |
| L7 | LOW | `terms[1].points[1].text_zh` (「选择退出（opt-out）（オプトアウト）」「选择加入（opt-in）（オプトイン）」の括弧連続)、`terms[3].one_zh` (太字が節全体)、`terms[0].fig.data.root.children[3].label.en` ("Affiliate" だけ ads なし)、`terms[3].one_en` "Listing advertising" vs `term_en` "Listing (search) advertising"、`terms[2].one_jp`「画像や動画」vs `overview_rows[2]` / `key_points_jp[2]`「画像」 | loc-review r1 / jp-review r1 の low が未修で残る。意味のずれ・誤答誘導なし | 記録のみ |
| L8 | LOW | `terms[4].fig.data.nodes[2].label.*` | ノード「閲覧者がリンク経由で購入」は購入のみの像だが、対応 caption は「購入などの成果」とヘッジし、図は典型の 1 例 | 記録のみ (M1 修正後も整合) |

**対比の出現欄 (書き方 8)**: バナー / リスティング の表示のきっかけ = `pairs[0].rows[1]` と `terms[3].points[1]` (mix) の 2 箇所 + overview 列 (総表の構造) → 許容。オプトイン / オプトアウト = `terms[1].points[1]` のみ。

確認済みで問題なし: 課金方式の言い切り (全てヘッジ、§1-3)、オプトイン原則と例外の扱い (u04 と整合、§1-4)、限定条件 (考点 5 件全て保持)、D-198 (12 字照合 遮蔽あり/なし 0/0、近似は較正未満)、D-198 (iii) / D-209、§9 禁止句、framing 0/0/0、D-197 羅列 (validate 0)、D-200、閉じた列挙 (tree に「その他の手法」)、`[[jp:]]` 原語 9 種、zh 訳語、図種、v1 用語不変。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **8** (建議修 2: L1・L2 / 記録のみ 6: L3〜L8) |

## 5. 判定

**FAIL** (D-199: MEDIUM 1)。M1 (`terms[4].analogy_*` の「購入時だけ」) を B3 補丁で修正すれば PASS 相当 (他の考点・事実・写し・三語に問題なし)。L1・L2 は同じ補丁での修正推奨。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-03-10-u05
✓ strategy-03-10-u05 unit: 0 issues (data/ip/textbook/units/strategy-03-10-u05.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-03-10-u05
✓ strategy-03-10-u05 parity: 23 locations, 0 diff
EXIT=0
```
