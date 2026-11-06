# Rule A 全数抽検 — technology-13-35-u03 (記号的AIと論理推論)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (S148 続 b41)、repo HEAD `a08306eb` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b41-u03-a2` (種付き、seed = `b41-u03-a1` jp.r1 + 審査 #2) merge 結果、sha256 先頭 `3687e3227675db38`)。
- **対象**: `data/ip/textbook/units/technology-13-35-u03.json` (textbook-unit-v2)、用語 **4 / 4 = 全数** (述語論理 / 演繹推論 / 帰納推論 / ルールベース) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197〜D-200、D-202、D-203、D-204、D-205、D-208、D-209、D-210、**D-211**、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `.planning/v2/technology-13-35-u03/v1-original.json` (用語 4 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 4 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (cols・cells・nodes・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。ルールベースは `hook_*` を持たない (validate 0 で許容)。
2. **考点 × 引用題** (考点 全 5 件 = exam 2 + mix 3、引用 qid 2 題: 2026r08-q084 / 2022r04-q057、いずれも topic `technology-13-35`): `data/ip/quiz/questions.json` (q057 は translations の `stem_jp_clean`) で題文・選択肢・正答を再読し 1 件ずつ照合。
3. **quiz / challenge_questions**: quiz = 述語論理 q084 / 演繹 q084 / 帰納 q057 / ルールベース なし (freq 0)。challenge 3 題 = q057 / q084 / 2022r04-q024。
4. **D-198 写し**: validate copy guard 0。独立照合: 単元 JP 文字列 97 本 (派生フィールド除く) × topic 全 35 題の題文 + 選択肢、12 字連続窓 (句読点・記号・空白除去) を **カタカナ 4 字以上・英数遮蔽あり / 遮蔽なし** の 2 通り → **0 / 0 件**。1〜2 字置換の近似一致 → 2 件 (`terms[3].detail_jp` / `key_points_jp[3]` ↔ 2025r07-q080、一致部は語「エキスパートシステム」のみ = 用語名で偽陽性)。カタカナの多い文 (ルールベース detail・図 nodes) を目視、題の場面 (HDD / SSD・記憶装置、教師あり学習の事例) の流用なし。比喩・例 (ミケ / タマ、全館禁煙、クジラ、白鳥、水曜定休の店、家電の対処表、室温 30 度) はいずれも引用題に無い自作。
5. **D-208 既知型 (1)〜(10) の個別点検**: §2 表と §3 に記載。(1) q084 は分類型 (どれが演繹の例か)、考点 `terms[1].points[0]` は正解の内容を見出し語の一般定義で述べ、選択肢の語句 (記憶装置 / HDD / 記憶容量)・組・順序を再現しない → D-209 免除内で (iii) に当たらない。q057 は穴埋め型、`terms[2].points[0]` は空欄の正解 (帰納推論 / 成立しないことがある) を定義として述べるが比較の相手 (演繹推論 / 常に成立する) と組にしていない。`pairs[0].rows[1]` は両側を正の定義で述べる二語対比で、演繹側は「常に成立する」でなく条件付き (前提が正しければ) → D-209 免除内。(9) q084 誤答イ (後件から前件を出す型) に考点だけを当てると「一般則 + 個別の事実 → 個別の結論」に見かけ上合うが、`one_jp`「当てはめて」と `fig.steps[2].caption_jp`「個別の事実が一般則の条件に合うので、一般則を当てはめる」がイを除外 → 誤答を選ばせない (L4 で記録)。(2)(3)(4)(5)(6)(7)(8)(10) 該当なし。
6. **D-211**: 正誤選択型で正解が一般原則の引用題はなし。述語論理は q084 を quiz のみに置き exam 考点を立てない (q084 は述語論理自体を問わない) — D-211 (i) の出口と同形で妥当。
7. **前回 attempt (`failures/.../technology-13-35-u03_attempt_1.md`) の medium 2 件**: ① ルールベース hook の「ルールをためておく所」(格納場所 = 知識ベースとの混同) → `terms[3].hook_jp/zh/en` は削除済み、派生 `summary.memory_hooks_*` も 3 件 (ルールベース無し)。単元 JSON 全体を grep (ため / 格納 / 入れ物 / 知識ベース / データベース / 存储 / 存放 / 知识库 / 数据库 / store / storage / knowledge base / database) → 0 件。one / overview / goals / key_points / detail の三語とも「ルールに事実を当てはめて判断する方式 / 方式 / approach・system」で一貫 → **解消、三語とも退行なし**。② challenge の情報量計算題 2010h22a-q083 → 単元から消えている (grep 0)。代わりの q024 は L3。**解消**。a2 jp-review #1 medium (challenge 下限割れ) も q024 補充で validate 0、#2 PASS。
8. **D-195 / §9**: one 1 文 × 4 (太字あり)、detail 2/3/2/2 文。禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh・en 相当語) → 「必ず」1 (`terms[1].detail_jp`「結論も必ず正しい」= 演繹の論理的性質の記述で定型締め句ではない)、「選ぶ」1 (ルールベース analogy の通常用法)、「〜で覚える」3 (`hook_jp` 3 / 派生 6 → L2)、en の exam / always は example / counterexample / always closed の部分一致で偽陽性。定義前使用: 量化子は detail で ∀・∃ を明示、図の → / ∧ はセル内に「→ = ならば、∧ = かつ」と注あり、三段論法・大前提・小前提は detail 内で定義、機械学習・エキスパートシステムは定義付きで導入。図種: table static ×1、flow steps ×3 (登録内)。
9. **D-200**: 考点数 1/2/1/1、各 JP 1〜2 文・47〜57 字 (≤100)。framing は validate の pointFraming ゲート 0。D-205 / D-210 は対象の規格・法令なし。
10. **三語**: zh・en が jp と同じ事実 (追加・欠落なし)、図 cell / node / caption / pairs の三語一致 (parity 0 diff)。`[[jp:…]]` 原語 7 種 (述語論理 / 命題論理 / 演繹推論 / 一般則 / 帰納推論 / ルールベース / 機械学習) 全て jp 本文に実在。one_zh / one_en は 4/4 で見出し語併記 (D-202)。zh 訳語は `zh_terms.json` (谓词逻辑 / 演绎推理 / 归纳推理 / 基于规则 / 机器学习) と一致。hook_en は jp の字形の手がかりを英語の語源・像に置き換える現地化 (述語論理 = 関数呼び出し、演繹 = Latin "lead down")。
11. **機械ゲート**: §6。

## 2. 用語別判定 (4 / 4)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 述語論理 | OK — exam 0、mix 1: 命題論理 = 文全体を真偽の単位、述語論理 = 対象と性質・関係まで分ける (標準事実)。図 4 行 (猫(ミケ) / 大きい(ミケ, タマ) / ∀x(猫(x)→動物(x)) / ∃x(猫(x)∧白い(x))) の記法・読みは全て正しい。detail「量化子で一般則を書け、記号的 AI の土台」正しい。quiz q084 (L5) | OK | OK | L2 (hook) / L5 |
| 2 | 演繹推論 | OK — exam 1 / 1 題: 一般則 + 個別の事実を前提に、その個別について成り立つ結論を導く (2026r08-q084 正答エ; 誤答ア = 類推、イ = 後件からの逆向き、ウ = 帰納 のいずれも支持しない、§1-5) / mix: 手順の妥当さと結論の正しさは別、前提に誤りがあれば結論は正しいとは限らない (標準事実)。detail「前提が正しく手順が論理の規則に従えば結論も必ず正しい」、overview / pairs「前提が正しければ結論も正しい」は整合。analogy (全館禁煙 → どの部屋も禁煙) は正しい演繹。flow 4 段 (哺乳類 → クジラ → 当てはめ → 結論) は正しい三段論法 | OK | OK | L2 (hook) / L4 |
| 3 | 帰納推論 | OK — exam 1 / 1 題: 結論は観察事例の一般化なので観察外の事例が一つでも合わなければ覆る (2022r04-q057 正答ウ = 帰納推論 / 成立しないことがある; 限定条件「ことがある」に対し考点は条件文「合わなければ覆る」で、常に不成立とは言わない → 保持)。detail「観察を増やすほど確からしさは高まるが観察していない事例は保証しない」= **帰納の結論は真と保証されない** を正しく述べる。機械学習が帰納の考え方に立つ — 標準的説明で正しい。analogy (水曜定休の店、開いていれば改める)・flow 5 node (白鳥 → 黒い白鳥で覆る) 正しい | OK | hook_en L1 | L1 / L2 (hook) / L7 |
| 4 | ルールベース | OK — exam 0 (freq 0)、mix 1: ルールベース = 判断基準を人が書く、機械学習 = データから自動獲得 (標準事実、2022r04-q024 の誤答イ [ルールベースのプログラム] を教師あり学習から除外できる)。detail (IF-THEN、エキスパートシステム、根拠を示しやすい / 保守の手間 / ルール外に対応できない) 正しい。flow (30 度・75% vs 28 度超かつ 70% 以上 → 適用) 再確認一致。analogy (取扱説明書の対処表) は方式の像で格納場所の像ではない。hook なし (前回 medium の解消、§1-7) | OK | zh 「开冷气」L6 | L6 |

**単元レベル**: goals 3・overview_cols 2 (役割 / 特徴)・overview_rows 4・pairs 1 組 (演繹 / 帰納 3 行 key 2)・key_points 4・summary (記法除去版と一致)・challenge 3 (q057 / q084 / q024)。key_points[1]「前提が正しい限り結論も正しい」・key_points[2] は one・pairs と一致。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 7 (うち 建議修 1)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[2].hook_en` (+ 派生 `memory_hook_en`, `summary.memory_hooks_en[2]`) | jp / zh は「納 = おさめる」という字形の手がかりだが、en「stack individual cases until they add up to one general rule」は定義 (個別事例 → 一般則) の言い換え (D-203 §6)。loc-review #1 low で指摘済み・未反映。演繹 hook_en (Latin "lead down") と対にできる | en のみ: before `Think of induction as building up: you stack individual cases until they add up to one general rule.` → after `Induction comes from Latin for "lead into": the individual cases lead you into one general rule.` |
| L2 | LOW | `terms[0..2].hook_jp` (+ 派生) / `terms[0].hook_jp` | 3 フック全てが「〜(字面・字形・字)で覚える」で結ぶ (§9 同型の結び、記憶フックの言い方として許容)。述語論理 hook は「述語を先頭、主語を括弧」= 定義の記法の説明し直しに近い (jp-review #2 low) | 記録のみ |
| L3 | LOW | `challenge_questions[2]` (2022r04-q024) | 題の terms は教師あり学習のみで、正答エには本単元外 (U04 以降) の知識が要る。ルールベースは誤答肢イに出るだけ。ただし本単元の用語を terms に持つ topic 内の題は q057 / q084 の 2 題しかなく下限 3 の補充、`terms[3].points[0]` (人が書く / データから獲得) でイは除外でき、単元と無関係ではない (前回の情報量計算題とは別物) | 記録のみ |
| L4 | LOW | `terms[1].points[0].text_jp/zh/en` | one_jp の言い直し (D-203 §9)。考点単体では q084 誤答イ (後件 → 前件) と見分けにくいが、one「当てはめて」と `fig.steps[2].caption`「条件に合うので当てはめる」で除外され、誤答を選ばせない (観点 9 に当たらない) | 記録のみ |
| L5 | LOW | `terms[0].quiz` / `inline_quiz` (2026r08-q084) | q084 は演繹の例の判別で述語論理そのものを問わない (データ上の terms に述語論理を含むので規則は満たす) | 記録のみ |
| L6 | LOW | `terms[3].fig.data.nodes[1].label.zh` / `nodes[3].label.zh`、`terms[1].points[0].text_zh/en` の `[[jp:一般則]]`、`terms[0].analogy_zh`「父母子女」 | zh「开冷气」は大陸では「开空调」が自然 / 一般則は見出し語・試験語でない併記 / 直訳調 (loc-review #1 low 3 件、未反映、意味は正しい) | 記録のみ |
| L7 | LOW | `terms[2]` (detail / points[0] / fig.steps[2]) / `pairs[0].rows[1]` / `overview_rows[1..2].extra_*` | 「帰納の一般則は反例で覆る」の言い換え反復 (§9) と、演繹 / 帰納の向き・確かさの対比が pairs と総表 extra で重なる (書き方 8; 総表は一覧欄で許容) | 記録のみ |

**対比の出現欄 (書き方 8)**: ① 演繹 = 一般 → 個別 / 帰納 = 個別 → 一般: `pairs[0].rows[0]`、各 one、overview extra[0] → 許容 (L7)。② 結論の確かさ: `pairs[0].rows[1]`、overview extra[1] → 許容 (L7)。③ ルールベース / 機械学習: `terms[3].points[0]` のみ (`terms[2].detail` は機械学習 = 帰納と述べるだけで対比しない) → 許容。④ 命題論理 / 述語論理: `terms[0].points[0]` のみ (a2 で detail から外れた) → 許容。

**範囲外の観察**:
- O1 `source_figures[1..2]` (2009h21a-q097 販売管理 DB、2009h21h-q066 サンプリング) は v1 から継承の本単元と無関係な図参照 (`source_figures` は書き直し対象外)。表示に使われるなら別途整理を推奨。
- O2 `unit_summary_*` は v1 と同文 (未改稿)、事実は正しい。

確認済みで問題なし: 前回 medium 2 件の解消 (三語)、限定条件 (q057「ことがある」保持)、§9 禁止句 (定型締め句 0)、D-197 (validate 0)、D-198 写し (独立照合 遮蔽あり / なし 0、近似 2 件偽陽性)、D-200、D-208 (1)〜(10)、D-209 / D-211 の判定、論理例 (∀ / ∃ 式、三段論法、白鳥、室温ルール) の正しさ、`[[jp:]]` 原語 7 種実在、zh 訳語表一致、図種登録内、用語・`term_zh`・`term_en` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **7** (建議修 1: L1 / 記録のみ 6: L2〜L7) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 4 用語・考点 5 件 (exam 2)・引用 2 題 + challenge q024 で、考点は正答と一致し誤答肢を支持せず、限定条件の落ちも無い。演繹 (前提が正しければ結論は必ず正しい) / 帰納 (観察外は保証されない、反例で覆る) の定義は三語とも正しい。前回 attempt の medium 2 件 (ルールベース hook の格納場所像、無関係な計算題) は三語とも解消。L1 は B3 補丁推奨。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-35-u03
✓ technology-13-35-u03 unit: 0 issues (data/ip/textbook/units/technology-13-35-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-35-u03
✓ technology-13-35-u03 parity: 25 locations, 0 diff
EXIT=0
```
