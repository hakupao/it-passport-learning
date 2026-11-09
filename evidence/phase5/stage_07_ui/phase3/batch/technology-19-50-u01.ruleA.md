# Rule A 全数抽検 — technology-19-50-u01 (デザインの基本原則と情報整理)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b75)、repo HEAD `ca4b2748` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b75-u01-a1` merge 結果、sha256 先頭 `f2fabd2f7d27cb29`)。journal `data/ip/textbook/.planning/v2/technology-19-50-u01/journal.b75-u01-a1.jsonl` (jp r0 → jp-review r1 PASS [low 10] → loc r0 → loc-review r1 PASS [low 7])。
- **対象**: `data/ip/textbook/units/technology-19-50-u01.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (デザインの原則 / 近接 / 整列 / 反復 / 対比 / LATCH) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。用語・`term_zh`・`term_en` は v1 (`v1-original.json`) と一致。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較単元: 同 topic `technology-19-50-u02` (合併済)、`technology-19-51-u01〜u04` (インタフェース設計、合併済)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (tree label・table cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / memory_hook_* / summary.*`) は本体の記法除去版 (`**` 除去、`[[jp:X]]` → X) で一致。`terms[3]` (反復) は hook なし (validate 許容、派生 `memory_hook_*` も空で整合)。
2. **考点 × 引用題**: 考点 全 6 件 (各用語 1 件)、**全て mix・qid 付き 0 件**。topic `technology-19-50` の題は 8 題で、本単元の内容を問うのは 2025r07-q072 (四つの原則の穴埋め、正答イ = a 整列・b 対比; 誤答の相手は「操作」「価値」) の 1 題のみ。題の 4 原則の説明 (近接 = 関連要素を近づけてグループ / a = 意図したルールに基づき配置 / 反復 = デザインルールを繰り返す / b = 大小や強弱などの違いを明確に) と各用語の one・detail・考点を照合: 近接 one (関係の深い要素を寄せ、薄い要素を離す) は題の説明を含み一致 (離す側は Williams の原典どおりの補足)、反復 one (見た目の決まりを繰り返し使う) 一致、対比 one (大きさ・太さ・色などにはっきりした差) は題の「大小や強弱など」と一致し「など」も保持、整列 one (端・中心を基準線に揃える) は題の広い言い方 (意図したルールに基づく配置) より狭いが標準の定義で、detail の「揃える基準を一貫させる / 思いつきで混ぜない」が題の「意図したルール」を覆い、正答と矛盾しない (jp-review の low 記録と同判断 → L6)。デザインの原則 one (伝えたいことが読み手に届くようにする指針) は題の前提 (見る人に意図が伝わりやすいデザイン) と一致。誤答の相手 (操作・価値) を支持する記述は三語とも無い。
3. **quiz / challenge_questions**: quiz = 用語 0〜4 に 2025r07-q072 (§1-2 で整合、LATCH は quiz なし = freq 0)。challenge 3 題: 2025r07-q072 (整合)、2010h22a-q071 / 2015h27a-q061 (ユニバーサルデザイン、terms = アクセシビリティ; 正答は年齢・文化・能力・障害の有無によらず多くの人が使える設計)。後 2 題は v1 から継承で、本単元は UD を扱わない (矛盾はしないが本単元だけでは解けない; u02 アクセシビリティの detail・考点が UD を「利用者の違いを前提に多くの人が使えるよう設計」と定義しており topic 内では整合) → O1。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合として JP 文字列 102 本 (派生除く) を topic 内全 8 題の題文 (stem_jp_clean 優先) + 選択肢と 12 字連続照合 — (a) カタカナ 4 字以上・英数を □ 遮蔽 (遮蔽後実字 6 未満の窓は除外) **0 件**、(b) 遮蔽なし **0 件**、(c) 1〜2 字置換の近似一致 (12 字窓 Hamming ≤2) **0 件**。bigram Dice 最大は `terms[0].fig.data.root.children[2].label.jp` (反復: 決まりを繰り返す) ↔ 2025r07-q072 題文の反復の行 = 0.38 (短いラベルが見出し語 + 「繰り返す」を共有するだけ、校正値 HIGH 0.52 未満、原則名の定義語で写しではない)、次点 0.29 以下。カタカナの多い文 (`terms[0].hook_*` の CRAP、`terms[5].one/detail` の Location〜Hierarchy) は目視で引用題に無い表現。
   - **(iii) 選択肢なぞり (D-208 (1))**: 2025r07-q072 は穴埋め題。穴の答え (整列・対比) と比較の相手 (操作・価値) を並べた記述は無い (操作・価値は三語とも不出現)。`terms[0].detail` / fig tree / goals[0] / analogy の 4 原則の並び (近接・整列・反復・対比) は題の行順と同じだが、4 つとも本単元の見出し語で、原典 (Williams *The Non-Designer's Design Book* の章順) およびシラバス用語順 (manifest `order_reason_jp`) と同じ標準の並び。各原則は一般定義として述べられ、題の説明文の言い回しの再現も無い (§1-4 の照合 0) → (iii) 非該当。考点 6 件はいずれも引用題を持たない mix で、誤答肢の場面の再演も無い。
5. **D-195**: one = 1 文 × 6 (太字あり)、detail 3/3/3/3/2/3 文、§6 比喩・フック (L2・L3・L4・L5)、定義前使用 (`terms[0].points[0]` が後出の LATCH を比較相手に使う — goals[3] と総表 overview_rows[5] で先に一言定義済み、jp-review low と同判断 → 記録のみ、L 番号なし)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → 「重要」は 対比・LATCH H の定義語 [重要度・重要な要素]、「出る」は「一貫性が出る」、「選ぶ」は LATCH の軸を選ぶ動作、「選択肢」は `source_figures[0].figure_description` [本文外]、「覚え」は `terms[5].hook_jp`「〜と覚える」1 件のみ → 定型締め句 0。zh 必须 / 一定、en must / always / never / exam の grep 0)。図の型: デザインの原則 = static tree (総称 → 4 原則)、LATCH = static table (5 行 × 頭文字 / 軸 / 例)、他 4 語 = 図なし; 全て登録内。pair 配置: 近接→整列 は整列の後、反復→対比 は対比の後、各組 key 行 1。
6. **D-200**: 考点数 1/1/1/1/1/1 (≤3 ✓)、各 JP 文数 1〜2・字数 42〜67 (≤100 ✓、最大 LATCH `points[0]` 67 字)。**framing 件数** (validateV2 `POINT_FRAMING`): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-205 (規格・原則の事実)**: 「よく知られた原則には…4 つ」は「よく知られた」で限定され、4 原則の名と数は 2025r07-q072 (四つの原則) が直接支持。CRAP は「呼ぶことがある」で限定 (Williams の通称、事実として正しい)。LATCH (Wurman, *Information Anxiety* 1989) は改訂で構成要素の数・名が変わる文書ではなく、5 軸は頭字語そのもの; 「情報はこの 5 通りでしか整理できない」という原典の強い主張は書いていない。H = 大きさ・重要度などの程度 (Wurman の magnitude) は正しい。近接 detail「距離の近いものを一つのグループとして受け取る」はゲシュタルトの近接要因の標準事実。普遍主張: `terms[0].detail`「媒体を問わず当てはまる」/ key_points[0]「媒体を問わず使える」は原則一般の性格として許容範囲 (L7)。
8. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行の三語一致、`[[jp:…]]` 原語 5 種 (デザインの原則 / 近接 / 整列 / 反復 / 対比) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 6 用語に見出し語の `[[jp:]]` あり (LATCH は jp = en 表記で併記不要)、zh 訳語が `zh_terms.json` に一致 (设计原则 / 亲密性 / 对齐 / 重复 / 对比 / LATCH)。hook は zh・en で現地化 (近接 zh = 「亲密性」の字義、en = Latin proximus; 整列 en = wheel alignment; 対比 en = 写真の contrast) — いずれも jp と同じ方向の手がかりで、事実の追加・欠落なし (proximus = "nearest" は正しい)。(6) zh / en が 2025r07-q072 の誤答肢 (操作・価値) に読める訳語: 無し (`overview_rows[4].one_line_en` "what matters most" は jp「重要度」の訳で value の意ではない)。en の「関係の薄い」→ unrelated (loc-review low) は英語の原則説明の標準語で誤学習なし → 記録のみ。
9. **整合 (合併単元)**: u02 (シグニファイア / 構造化シナリオ法 / UXデザイン / アクセシビリティ / ピクトグラム / インフォグラフィック) と見出し語の重複なし。2025r07-q072 の誤答の相手「価値」「操作」は u02 構造化シナリオ法の段階名 (価値 → 行動 → 操作) で、本単元はこれらを原則として扱わず衝突なし。19-51-u04 CSS 考点「サイト全体の配色や配置をそろえやすい」は本単元 反復 (見た目の決まりを繰り返し統一感) と整合。u02 シグニファイア analogy (レジ前の床の足跡) と本単元 整列 analogy (行列が床の線に沿う) が似た場面 → L5。事実の食い違いは 0。
10. **機械ゲート**: §6 に出力全文。
11. **前段指摘の解消確認**: jp-review r1 (PASS、HIGH 0 / MEDIUM 0 / low 10) と loc-review r1 (PASS、HIGH 0 / MEDIUM 0 / low 7)。**解消を要する HIGH / MEDIUM は無し**。low は書き直しの対象外で現行本文に残る; そのうち LATCH 例の軸境界 (jp-review low 1) は本監査で LOW 建議修 (L1) として修正案を付す。退行 (zh / en で前段の指摘内容が再発) は無し。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | デザインの原則 | OK — 考点 mix 1 (見た目と配置を整える指針で、情報の並べ順を決める LATCH とは対象が違う) 正しい。detail の 4 原則は 2025r07-q072 (正答イ) の四つの原則と一致。tree 図 4 子ラベルは各 one と一致 | OK | OK | L2 (analogy) / L7 |
| 2 | 近接 | OK — 考点 mix 1 (薄い要素を離すことも含み、全部を詰めることではない) 正しい。題の「関連要素を近づけてグループ」を含む | OK | OK | L3 (hook 後半) |
| 3 | 整列 | OK — 考点 mix 1 (近接 = 距離、整列 = 基準線でつながり) 正しい。題の a (意図したルールに基づく配置) と矛盾せず | OK | OK | L4 (hook_en) / L6 |
| 4 | 反復 | OK — 考点 mix 1 (繰り返すのは見た目の決まりで、同じ内容を何度も載せることではない) 正しい。題の「デザインルールを繰り返す」と一致 | OK (hook なし) | OK | なし |
| 5 | 対比 | OK — 考点 mix 1 (反復 = 統一、対比 = 差で読む順序・重要度) 正しい。題の b (大小や強弱などの違いを明確に) と一致、「など」保持 | OK | OK | L8 |
| 6 | LATCH | OK — 引用題なし (freq 0)。考点 mix 1 (H = 程度の順、C = 種類で分ける、別の軸) は Wurman の定義どおり。table 5 行 (L 位置 / A 五十音・アルファベット / T 日付・時刻 / C 種類 / H 程度) 正しい | OK | OK | **L1 建議修** / L9 (hook) |

**単元レベル**: goals 4 点・overview_cols 2 (扱うもの / 手がかり)・overview_rows 6 行・pairs 2 組 (近接 / 整列 3 行 key 1、反復 / 対比 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge 3 題 (§1-3)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 2: L1・L2)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[5](LATCH).detail_jp` / `detail_zh` / `detail_en` 3 文目 | 例「調理時間の短い順に並べる」は、直前の「どの軸で並べるか」を受けて読み手が T (Time) に当てはめやすいが、同じ用語の table は T を「日付や時刻の順」、H を「大きさや重要度などの程度の順」とし、所要時間の長短は量 = Wurman では H 側。本文は軸名を言っていないので誤りではないが、H と他の軸を分ける考点を持つ単元で境界例を置くと軸の取り違えを招く (jp-review low 1 と同じ指摘、未修のまま) | jp「調理時間の短い順に並べるか」→「料理名の五十音順に並べるか」/ zh「还是按烹饪时间由短到长排列」→「还是按菜名的读音顺序排列」/ en "or ordered from the shortest cooking time" → "or listed by dish name in alphabetical order" |
| L2 | LOW **建議修** | `terms[0](デザインの原則).analogy_jp` / `analogy_zh` / `analogy_en` | 4 原則の対応のうち近接に当たる「一皿の料理を寄せて盛り」/「把一盘菜聚拢着盛」/ "heap each dish neatly" は「寄せる」だけで「関係の薄いものを離す」側が無く、en は寄せる意味も消えている。`terms[1].points[0]` が否定する「すべてを寄せる」とまでは読めないが (皿単位の話)、近接の像として弱い (§6 / D-204 の像の範囲) | jp「一皿の料理を寄せて盛り」→「料理ごとに皿を分けて盛り」/ zh「把一盘菜聚拢着盛」→「按菜分盘盛放」/ en "heap each dish neatly" → "serve each dish on its own plate" |
| L3 | LOW | `terms[1].hook_jp` 後半 | 「距離そのものがグループの印になる」は one・detail の言い直し (D-203 §6、jp-review low と同) | 記録のみ (前半の字形の手がかりで役目は足りる; 削っても可) |
| L4 | LOW | `terms[2].hook_en` | wheel alignment の像は「1 本の線に沿う」の手がかりとして通じるが、車輪の角度調整で紙面の基準線とは別物。誤学習には至らない | 記録のみ |
| L5 | LOW | `terms[2].analogy_*` ↔ `technology-19-50-u02` シグニファイア analogy | 本単元 整列 (行列が床の線に沿って立つ) と u02 シグニファイア (レジ前の床の足跡で並ぶ場所が分かる) が同じ topic で似た場面。焦点 (列の形 / 並ぶ場所の手がかり) は異なり、2025r07-q072 の誤答肢とも無関係 (観点 (8) の MEDIUM 条件 = 誤答肢へ読める、に当たらない) | 記録のみ |
| L6 | LOW | `terms[2].one_jp` ↔ 2025r07-q072 | 題は整列を「意図したルールに基づく配置」と広く言い、one は「基準線に揃える」の標準定義。detail「揃える基準を一貫させる / 思いつきで混ぜない」が題の広さを覆い、正答と矛盾しない (限定条件落ちでも正答に反する制限でもない、jp-review low と同) | 記録のみ |
| L7 | LOW | `terms[0].detail_jp` 2〜3 文目、`key_points_jp[0]` (+ zh / en) | 「美的センスに頼らず誰でも使える」「媒体を問わず当てはまる」は原則一般の性格としての言い方で根拠題は無いが、事実に反しない。key_points 5 点がいずれも各 detail の 1 文の言い直し (D-203 §9、jp-review low と同) | 記録のみ |
| L8 | LOW | `goals_jp[1..2]`、`overview_rows[*].extra_*`、`pairs[0..1]`、`terms[2].points[0]`、`terms[4].points[0]` | 書き方 8: 近接 / 整列 (距離か基準線か) と 反復 / 対比 (共通点か差か) の対比が pairs + mix 考点の 2 箇所に加え goals・総表でも出る (goals は観点の予告で内容は短い)。`terms[4].points[0]` の「見た目をそろえて」は整列の「揃える」と同じ動詞だが、19-51-u04 CSS 考点でも統一の意で使う自然な語で、題の誤答肢には読めない | 記録のみ |
| L9 | LOW | `terms[5].hook_jp` / `hook_zh` / `hook_en` | latch = 掛け金の語義は正しいが、「情報を留めておく 5 本の掛け金」の像は「並べる軸を選ぶ」働きと結び付かない (D-204、jp-review low と同)。「〜と覚える」の結びは本単元でこの 1 件のみ | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 近接 = 距離・余白 / 整列 = 基準線: `pairs[0].rows[0]` (key)、`terms[2].points[0]`、`goals_jp[1]` (予告)、`overview_rows[1..2].extra[1]`、tree 図ラベル (各原則の一言) → L8。② 反復 = 共通点・統一 / 対比 = 差・強調: `pairs[1].rows[0]` (key)、`terms[4].points[0]`、`goals_jp[2]` (予告)、`overview_rows[3..4].extra` → L8。③ デザインの原則 (見た目・配置) / LATCH (並べ順): `terms[0].points[0]` と総表の行のみ → 許容。④ LATCH H / C: `terms[5].points[0]` と table 行 → 許容。

**範囲外の観察** (書き直し対象外):
- O1 `challenge_questions[1..2]` (2010h22a-q071 / 2015h27a-q061) はユニバーサルデザインの題で v1 から継承。本単元の内容を問う題は topic 内に 2025r07-q072 の 1 題しかなく、確認題 3 題を満たすための補充 (jp-review low と同)。本文と矛盾はせず、UD は u02 アクセシビリティで定義済み (u02 の challenge にも 2015h27a-q061 が入る)。配列の差し替えは構造変更のため B3 補丁の対象外 → 記録のみ。
- O2 `unit_summary_*` は v1 と同文 (未改稿)。「見た目を整えるデザインの4原則」は事実として正しい。

確認済みで問題なし: 限定条件 (2025r07-q072 の「など」保持、考点に引用題なし)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤67 字)、写し (validate 0、独立照合 遮蔽あり / なし / 近似 とも 0)、(iii) 選択肢なぞり 非該当 (§1-4)、`[[jp:]]` 原語 5 種実在、one_zh / one_en の見出し語併記、zh 訳語表一致、図種 (static tree ×1 / static table ×1 / 図なし ×4 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、前段 HIGH / MEDIUM 0 (解消対象なし・退行なし)、合併単元 u02 / 19-51 との事実整合。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 2: L1・L2 / 記録のみ 7: L3〜L9) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 6 用語・考点 6 件 (全て mix、qid 付き 0)・本単元内容の引用題 1 題 (2025r07-q072) + challenge 2 題で、記述は正答と一致し、誤答肢 (操作・価値) を支持する記述・穴埋めの答えと比較相手の並記・限定条件の落ちは無い。LOW 建議修 2 件 (L1 LATCH 例の軸境界、L2 総称 analogy の近接の像) は補丁 (B3) で修正推奨、L3〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-19-50-u01
✓ technology-19-50-u01 unit: 0 issues (data/ip/textbook/units/technology-19-50-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-19-50-u01
✓ technology-19-50-u01 parity: 25 locations, 0 diff
EXIT=0
```
