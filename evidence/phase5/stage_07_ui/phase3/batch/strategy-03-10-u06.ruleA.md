# Rule A 全数抽検 — strategy-03-10-u06 (検索最適化・効果測定・配信技術)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S148 b31)、repo HEAD `bfb9fa71` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b31-u06-a2` merge 結果、`merged.json` とバイト一致、sha256 先頭 `a55cc6cc6abfb8f6`)。
- **対象**: `data/ip/textbook/units/strategy-03-10-u06.json` (textbook-unit-v2)、用語 **4 / 4 = 全数** (SEO / A/Bテスト / レコメンデーション / デジタルサイネージ) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。用語・`term_zh`・`term_en` は v1 (manifest `v1_terms`) と一致。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。前回 attempt `failures/phase5/stage_07_ui/phase3/batch/strategy-03-10-u06_attempt_1.md` の medium 3 件の解消を三語で確認。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 4 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 6 件 = exam 4 + mix 2、引用 qid 延べ 7 = 異なり 7 題、全題 topic `strategy-03-10`)**: `data/ip/quiz/questions.json` の正答・選択肢と translations の `stem_jp_clean` を再読し、1 件ずつ照合。manifest `term_questions` の SEO 7 題のうち未引用 3 題 (2009h21a-q026 = challenge、2013h25h-q097 = コンバージョン率の計算題で SEO の記述と無関係、2016h28h-q017 = SNS 活用事例で SEO は誤答肢) も矛盾なしを確認。関連題 2026r08-q023 (リスティング広告 = 検索語句に連動、誤答ア = 行動履歴を基に表示) と u05 のリスティング広告・アフィリエイト定義とも照合。
3. **quiz / challenge_questions** (quiz 5 枠 + challenge 3 題 2017h29h-q011 / 2019r01a-q029 / 2009h21a-q026): 本文と矛盾なし。2017h29h-q011 (キーワード・HTML・リンクの工夫の総称 = SEO; 誤答 BPO / LPO / MBO) は SEO detail・key_points[0] で解ける。2009h21a-q026 (アフィリエイト = 誘導実績に応じた報酬) は レコメンデーション mix 考点の前文で解け、誤答ウ (検索上位) は SEO の one で SEO と判別できる → L8。
4. **D-198 写し**: validate copy guard 0、`warn choice-echo` 行なし。独立照合: 単元の JP 文字列 72 本 (派生除く) × topic 内 43 題 (stem_jp_clean + 選択肢) の 12 字連続一致 — (a) 記号除去 + カタカナ 4 字以上・英数を □ 遮蔽 (実字 6 未満の窓除外): **0 件**、(b) 遮蔽なし: **0 件**、(c) 14 字窓・編集距離 1〜2 の近似一致: **0 件**。目視: カタカナ多めの文 (SEO exam 考点「キーワードで検索されたときに…」、レコメンデーション one「閲覧履歴や購入履歴などから」、アフィリエイト mix 前文、サイネージ exam 考点) は引用題の語を一般化した言い方で、文の流れ・語順は題と別。(iii): SEO exam 考点は 2015h27h-q019 / 2019r01a-q029 の正答の定義を一般的に述べたもの (分類・定義題、誤答の否定なし)。A/B exam 考点の「並行して」「成果の数値」は 2022r04-q034 の場面語 (新旧デザイン・有料申込み) を使わず標準定義の範囲 (jp-review L 判定に同意)。レコメンデーション mix (アフィリエイト対比) は 2016h28h-q003 の誤答肢アとの対比だが両側を正の定義で述べ D-209 により (iii) でない。デジタルサイネージの紙ポスター対比表は自作。
5. **D-195**: one = 1 文 × 4 (太字あり)、detail 3 文 × 4、定義前使用 (自然検索 = SEO detail 1 文目、閲覧履歴・購入履歴 = レコメンデーション detail 1 文目、リスティング広告・アフィリエイト = mix 考点内で定義)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → `freq_badge`「頻出」、レコメンデーション analogy「覚えていて」(通常用法)、「良い方を選ぶ」3 (one・definition の定義文、通常用法) のみ = 定型締め句 0)、図種 (SEO・A/B・レコメンデーション = flow steps 4/4/3、サイネージ = compare static; 全て登録内)。
6. **D-200**: 考点数 2/1/2/1 (≤3)、各 JP 1〜2 文・54〜95 字 (最大 レコメンデーション mix 95 字)。framing (validateV2 `pointFraming`): jp 0 / zh 0 / en 0。
7. **D-202 / D-203 単元全体点検**: 書き方 7 → L2・L3 (いずれも措辞級)。書き方 8 (対比の出現欄): ① A/B = 無作為の組 / レコメンデーション = その人の記録: `pairs[0]` 3 行、`goals_jp[1]` (観点の予告)、key_points[1]・[2] は各側を単独で述べる → 許容。② SEO = 自然検索 / リスティング広告 = 有料の広告枠: SEO detail 1 文目 (広告枠を除いた) と mix 考点 → 2 箇所で許容。③ 紙 / サイネージ: 図 compare のみ (+ analogy の掲示板→画面は像) → 許容。書き方 9 → §2 表、落ち 0。§6 → L1。§9 言い直し → L4。
8. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行・caption の三語一致、`[[jp:]]` 原語 (SEO / 自然検索 / A/Bテスト / レコメンデーション / デジタルサイネージ / リスティング広告 / アフィリエイト) は jp 本文に実在、one_zh / one_en 全 4 用語に見出し語の `[[jp:]]` あり、zh 訳語は `zh_terms.json` 準拠 (SEO（搜索引擎优化） / A/B 测试 / 推荐 / 数字标牌 / 关键词检索广告 / 联盟营销; validate B6 warn 0)。
9. **D-205 / D-210 / 観点 (10)**: 改訂される文書・法令・法定区分の列挙なし → 対象外。
10. **機械ゲート**: §6 に出力全文。

### 前回 attempt 1 の medium 3 件 (三語で解消を確認)

| attempt 1 指摘 | 現行 jp | zh / en | 判定 |
|---|---|---|---|
| A/B を「一部だけを変えた 2 案」に限定 (one / 図 n1 / step 1) — 2022r04-q034 は新旧デザインの全体比較 | one「2 つの案を用意して利用者に出し分け」、n1「A 案と B 案を作る」、step 1「比べたい A 案と B 案を用意する」。detail は「変える箇所を絞ると…判断しやすい」と任意の工夫 | zh「准备两个方案」「制作 A 方案和 B 方案」「如果只改动…就更容易判断」/ en "prepares two versions", "Make versions A and B", "Changing only a few elements makes it easier…" — 限定なし | 解消 |
| レコメンデーション hook「おすすめと同じ根」(語源誤り)・「レコメン」 | hook「英語の recommend (薦める) から来た語。」 | zh「来自英语 recommend（推荐）一词。」/ en "Comes from the English verb recommend." | 解消 |
| サイネージ one にネットワークがなく、detail が「つなぐと〜できる」と条件化 | one「…**ネットワーク**でつないだ画面 (**ディスプレイ**) に…」、detail「表示機器がネットワークでつながっているので」 | zh「通过**网络**连接的屏幕」「由于显示设备通过网络相连」/ en "linked by a **network**", "Because the screens are networked" | 解消 |

a2 の jp-review #1 (PASS, low 7) / loc-review #1 (PASS, low 10) に high / medium なし。回帰なし。

## 2. 用語別判定 (4 / 4)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | SEO | OK — exam 1 / 4 題: キーワード検索時に自社サイトの表示順位を上げる工夫の総称 (2015h27h-q019 正答エ / 2017h29h-q011 正答エ / 2018h30a-q003 正答ウ「総称」/ 2019r01a-q029 正答ウ; 誤答 SSL・SNS・SIS / BPO・LPO・MBO / DNS・RSS・SNS / 検索結果のコミュニティ表示・ログ解析・検索エンジン開発 はどれも支持しない)。「総称」(まとめて指す言葉) 保持 / mix: リスティング広告 = 有料の広告枠、SEO = 枠を買わず自然検索の順位 → u05 のリスティング広告 (検索語句に連動して検索結果に出る広告) と矛盾せず、2026r08-q023 の誤答ア (行動履歴を基に表示) も支持しない。detail「対策の例としては…」・key_points[0]「といった」は開いた列挙で 2017h29h-q011 (キーワード・HTML・リンク) と一致。「広告費をかけずに」は広告料が要らない意で正しい。analogy (観光案内所が独自基準で紹介) は有料掲載を含意せず、リスティング広告側へ読ませない | OK | OK (en の natural search / Listing ads は L5) | L2 (図 n3)、L4 (points[0]・key_points[0])、L5 |
| 2 | A/Bテスト | OK — exam 1 / 1 題: 2 案を実際の利用者に並行して試し、成果の数値で優劣判断 (2022r04-q034 正答ア; 誤答 ABC 分析・クラスタ分析・リグレッションテスト を支持しない)。題の「並行稼働」は detail・図 step 2「同じ期間に」で保持。案の差を「一部」に限定しない (attempt 1 解消)。多変量テストへの言及はなく、A/B を多変量と混同させる記述なし。pairs[0] 3 行は one・detail・図と一致 | OK | OK | L1 (analogy)、L3 (goals[1])、L4 (points[0]) |
| 3 | レコメンデーション | OK — exam 1 / 1 題: 利用者ごとの記録に基づき表示する商品を個別に変え購買を後押しする手法 (2016h28h-q003 正答エ; 誤答 アフィリエイト・オークション・フラッシュマーケティング を支持しない)。題の「閲覧履歴や購入履歴」は one で「など」付きで保持 / mix: アフィリエイト (他者サイトに広告・リンク → 成果報酬) は u05 定義・2009h21a-q026 正答イと一致。推薦の方式 (協調フィルタリング等) を閉じた列挙で述べる箇所はない (→ L7 記録) | OK | OK | L5 (mix の `[[jp:]]` 重複)、L7 |
| 4 | デジタルサイネージ | OK — exam 1 / 1 題: 人の行き交う場所の表示機器へネットワーク経由で内容を届ける (2019r01a-q090 正答ウ; 誤答 cookie・RSS・ディジタルデバイド を支持しない)。題の「交通機関・店頭・公共施設などの場所」→ 人の集まる / 行き交う場所、「ネットワークに接続した」→ one・detail・考点で保持 (attempt 1 解消)。hook が試験表記ディジタルサイネージを別名として示し、別物として教えない (観点 3 OK); ディジタルデバイドとも signage = 看板 で判別できる (観点 9 OK)。compare 表 3 行は detail と一致 | OK | zh「向导和运行信息」は L5 | L5、L6 |

**単元レベル**: goals 3・overview_cols 1 (主な目的)・overview_rows 4・pairs 1 組 (A/B / レコメンデーション 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge 3 題 (§1-3)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 8 (うち 建議修 2)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1].analogy_jp` / `analogy_zh` / `analogy_en` | 「2 種類のチラシを交互に置き」は時間をずらして順に試すと読め、detail・図 step 2 の「同じ期間に並行・無作為に振り分け」と像がずれる (D-204 の措辞級。結論 [多い方を採用] は合い、2022r04-q034 に当てても誤答肢を選ばせない [観点 9 非該当] ので MEDIUM に至らない) | jp: before「店先にデザインの違う 2 種類のチラシを交互に置き、どちらが多く持ち帰られたかを数えて、次から多い方を刷るようなもの。」→ after「同じ期間に、道行く人へデザインの違う 2 種類のチラシを 1 人 1 枚ずつ交互に配り、どちらのチラシを持って来店した人が多いかを数えて、次から多い方を刷るようなもの。」/ zh: before「就像在店门口轮流摆放两种设计不同的传单，数一数哪种被拿走得多，下次就多印那一种。」→ after「就像在同一时期把两种设计不同的传单轮流发给路人、每人一张，数一数拿着哪种传单来店的人更多，下次就多印那一种。」/ en: before "It is like alternating two flyer designs at a shop entrance, counting which one more people take, and printing that design from then on." → after "It is like handing out two flyer designs in turn, one per passerby, over the same period, counting which flyer brings more people into the shop, and printing that design from then on." |
| L2 | LOW **建議修** | `terms[0].fig.data.nodes[2].label.jp` / `.zh` / `.en` | ノード「対策したページが上位に並ぶ」は対策すれば必ず上位と読める言い切りで、同 step の caption「上位に並びやすくなる」より強い (観点 7 措辞級、jp-review L と同意) | jp: before「対策したページが上位に並ぶ」→ after「対策したページは上位に並びやすい」/ zh: before「做过优化的页面排在前面」→ after「做过优化的页面更易排在前面」/ en: before "Optimized page ranks high" → after "Optimized page tends to rank high" |
| L3 | LOW | `goals_jp[1]` (+ zh / en、`overview.intro_*`) | A/B と レコメンデーションを「利用者ごとに表示を変える」と括るが、A/B は無作為の組ごと。区別の観点 (目的と基準) は示しており pairs の key 行で解消される | 記録のみ |
| L4 | LOW | `terms[0].points[0].text_*`、`key_points_*[0]`、`terms[1].points[0].text_*` | one / detail の言い直し (D-203 §9)。事実は引用題と一致 | 記録のみ |
| L5 | LOW | loc-review low 10 件 (`terms[3].detail_zh`「向导和运行信息」、`terms[0].one_en` 等 natural search、`terms[0].points[1].text_en` Listing ads、同 zh/en の太字 自然搜索 / natural search、`terms[0].points[0].text_zh` の（[[jp:SEO]]）、`terms[2].points[1].text_zh/en` の `[[jp:]]` 重複、`terms[0].hook_en`、`terms[3].fig.data.rows[1].label.en` Expression、`pairs[0].rows[2].label_zh` 用法、`overview_rows[1].extra_en[0]`) | 全て語の選択・表記の揃えで意味は jp と一致、誤答肢へ読ませる訳語なし (観点 6 非該当)。`[[jp:リスティング広告]]` で試験表記は示されている | 記録のみ (任意: loc-review の fix_jp どおり) |
| L6 | LOW | `terms[3].one_jp` (+ zh / en) | 2019r01a-q090 の「ディスプレイ**など**の電子的な表示機器」に対し one は「画面 (ディスプレイ)」。ただし exam 考点・detail は「表示機器」で開いており、範囲を閉じる読みにならない (観点 2 の MEDIUM 要件 [範囲を閉じる] に当たらない) | 記録のみ |
| L7 | LOW | `pairs[0].rows[1].b_*`、`terms[2].points[0].text_*` | 表示の基準を「その人の閲覧・購入の記録」とする。協調フィルタリング等の方式名・閉じた列挙はなく、one は「閲覧履歴や購入履歴など」と開き、引用題 2016h28h-q003 の前提 (個人の閲覧・購入履歴の分析) と一致 → 閉じた方式列挙の問題なし | 記録のみ |
| L8 | LOW | `challenge_questions[2]` (2009h21a-q026) | アフィリエイトを問う題で単元の主題から外れ気味 (jp-review L と同意)。mix 考点で解け、本文と矛盾なし | 記録のみ |

確認済みで問題なし: 限定条件 (考点 6 件全て保持)、§9 禁止句 (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200、D-198 独立照合 0 / 0 / 近似 0、choice-echo warn なし、`[[jp:]]` 原語実在、one_zh / one_en の見出し語併記 4/4、zh 訳語表 (B6 warn 0)、図種登録内、派生フィールド一致、v1 不変量、attempt 1 medium 3 件の三語解消、SEO と リスティング広告 (u05) の有料 / 自然の区別、A/B と多変量の混同なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **8** (建議修 2: L1・L2 / 記録のみ 6: L3〜L8) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 4 用語・考点 6 件・引用 7 題 + 未引用の関連題 4 題で、考点の主張は正答と一致し、誤答肢を支持する記述・限定条件の落ち・写しはない。LOW 建議修 2 件 (L1・L2) は補丁 (B3) で修正推奨、L3〜L8 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-03-10-u06
✓ strategy-03-10-u06 unit: 0 issues (data/ip/textbook/units/strategy-03-10-u06.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-03-10-u06
✓ strategy-03-10-u06 parity: 25 locations, 0 diff
EXIT=0
```
