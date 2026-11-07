# Rule A 全数抽検 — technology-13-34-u07 (離散数学の応用(待ち行列と最適化))

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S149 b50)、repo HEAD `be49bdf9` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b50-u07-a1` merge 結果、sha256 先頭 `47d1696afbb9f343`)。
- **対象**: `data/ip/textbook/units/technology-13-34-u07.json` (textbook-unit-v2)、用語 **2 / 2 = 全数** (待ち行列 / 最適化問題) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-210、共通指示 (既知失敗型 (1)〜(10))。比較: `data/ip/textbook/.planning/v2/technology-13-34-u07/v1-original.json` (用語 2 語・`term_zh`・`term_en` とも v1 と一致、`unit_summary_*` は v1 と同文)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・前回修正の zh / en 回帰 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 2 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (nodes・steps caption) / quiz / inline_quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版 (`[[jp:X]]` → X) であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題**: 考点 全 5 件 (exam 3 + mix 2)、qid 付き 3 件 (2014h26h-q087 / 2016h28h-q033 / 2018h30a-q005)。`questions.json` + `translations/<exam>.json` の stem_jp_clean で題文・選択肢・`correct_answer` を再読。**計算の再計算** (全て自分でスクリプト):
   - **2016h28h-q033** (X 発、A・B・C を任意の順で全て経由して Y、経路表に「不可」区間): 6 順を全列挙 — X→A→B→C→Y = 140 / **X→A→C→B→Y = 130** / X→B→A→C→Y = 150 / X→C→A→B→Y = 170 / A を最後に置く 2 順は A→Y 不可で除外 → 最小 130 = 正答イ 一致。raw OCR は B→A を「−」とするが、clean (40) でも raw でも最小は 130 で答えは不変。考点 `terms[1].points[1]` の手順 (順ごとに合計 → 最小、通れない区間を含む順は除外) をそのまま当てると正答に至る。
   - **2018h30a-q005** (2 機械 X→Y の順、A(8,10)・B(10,5)・C(6,8)、総所要時間最小): 6 順の総所要時間 ABC 32 / ACB 31 / BAC 36 / BCA 34 / **CAB 29** / CBA 34 → 最小 C→A→B = 正答ウ 一致。考点 `terms[1].points[2]` のジョンソン法: 最短 5 分は B の後の機械 → B を最後、残り最短 6 分は C の前の機械 → C を先頭 → C→A→B で一致。raw OCR の B の X 時間 7 分でも CAB 29 が唯一最小で答えは不変。
   - **2014h26h-q087** (オペレータ費用最小化に「考慮すべき条件として適切でないもの」、記号のみで数値なし): 正答イ = 前提にない合計人数の大小条件。P1〜P4 ≥ 1 は前提 (3) 由来の制約、費用総和の最小化は目的関数、時間帯ごとの最低必要人数の充足は制約 → 3 肢は適切で、イだけが前提から導けない条件 (勤務パターンが複数時間帯をまたぐため、最適解で P の合計が Q の合計以下になり得る) → 考点 `terms[1].points[0]` (制約条件は前提から導き、前提にない条件を足すと本来の最適解が外れ得る) と一致。
   - **2009h21h-q007** (challenge のみ、期待値): A 15 / **B 21** / C 16 / D 18 → B = 正答イ 一致 (本単元の内容では解けない → L4)。
   - **単元内の数値・式**: 利用率 = 平均処理時間 ÷ 平均到着間隔 (= λ/μ、窓口 1 つ) ✓ (`terms[0].detail` jp/zh/en「平均处理时间除以平均到达间隔」/ "average service time divided by the average interarrival time"、`key_points[1]` 三語とも同じ向きの割り算で「窓口が 1 つの場合」を保持)。利用率 → 1 で待ち時間が急増: M/M/1 の平均待ち時間 = ρ/(1−ρ) × 平均処理時間 (ρ = 0.5 → 1 倍、0.8 → 4 倍、0.9 → 9 倍、0.95 → 19 倍) で「比例して少しずつではなく急に長くなる」✓ (三語同じ)。最適化の図 (2 製品の生産量・材料 ≤ 在庫・利益合計 → 最大) は数値なしの標準的な線形計画の型で、one / detail と一致 ✓。
   - **事実**: 待ち行列 = 到着と処理のばらつきから平均待ち時間・列の長さを確率と統計で見積もる、基本形 = 窓口 1 つ・先着順 ✓。hook (電話交換機の回線の混み具合の研究が起源 = Erlang) ✓。最適化問題 = 制約条件を満たす解のうち目的関数が最良の解 ✓、候補が少なければ全列挙、多ければ線形計画法など (「のように」で開いた例示) ✓、スケジューリング・巡回順も最適化問題の例 ✓。hook (optimization ← ラテン語 optimus「最良の」) ✓。ジョンソン法は 2 機械フローショップの総所要時間 (makespan) 最小化を保証する規則で、考点はその目的を明記 ✓。
3. **quiz / challenge_questions**: quiz = `terms[1].quiz` / `inline_quiz` = q033 / q005。challenge = q033 / q005 / 2009h21h-q007。q087 は中問 (chumon) の小問のため quiz に入れていない (manifest `chumon_members`)。本文はどの題の誤答肢も支持しない (q033: 110 / 140 / 150 を誘う記述なし — 140・150 は「最小を選ぶ」で退く; q005: A→B→C・A→C→B・C→B→A を誘う記述なし; q087: 合計人数の条件を支持しない)。待ち行列には引用題が無い (manifest `term_questions.待ち行列 = []`、topic 32 題・全 questions.json の grep でも待ち行列 / 利用率の計算題なし)。q007 は期待値の題で本単元の用語では解けない → L4。
4. **D-198 写し**: validate の copy guard = 0 件 (`warn  choice-echo` 行の出力なし)。独立照合: 単元の JP 文字列 58 本 (派生フィールド・`source_figures` 除く) を topic 内全 32 題の stem_jp_clean + 選択肢と 12 字連続照合 (句読点・記号・空白・記法除去) — **カタカナ 4 字以上と英数を □ に遮蔽: 0 件 / 遮蔽なし: 0 件 / 1〜2 字置換の近似一致: 0 件**。カタカナの多い文 (ジョンソン法・キュー・データ構造) を目視 — 題文に該当句なし。(iii) 選択肢なぞり: `terms[1].points[0]` は q087 の 4 肢 (≥1・合計人数の大小・費用総和最小・最低人数の充足) の語句・組・順序を再現せず、制約条件 / 目的関数 / 前提にない条件 という見出し語の役割の区別と正答の原理を述べる (D-209 の除外に当たる、L6)。`terms[1].points[1]` は q033 の前提 (順番は任意・「不可」区間) を一般の言い方で述べるが、地点名・所要時間・候補の列挙・答え 130 は使わない (L6)。`terms[1].points[2]` は q005 の作業名・時間 (8/10/5/6 分)・選択肢の順序を使わない。`source_figures[].figure_description` に題の数値があるが本文外。
5. **D-195**: 結論先行 (one = 1 文 × 2、太字あり)、detail 3 文 × 2、比喩 (病院の受付・番号札 / 旅行かばんの詰め物 = ナップサック型) は別場面で用語の言い換えではない、hook は起源・語源 (§6 OK)。定義前使用: 利用率 = detail で太字定義、制約条件・目的関数・最適解 = one の括弧注、線形計画法 = detail で「式に表して解く手法」と注、ジョンソン法 = 考点内で手順を述べる、キュー = 考点内で「入れた順に取り出すデータ構造」と注。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が): 「選ぶ」1 件 = `terms[1].analogy_jp`「詰める物を選ぶこと」(通常語、偽陽性)。zh / en (考试 / 必须 / 重要 / 记住 / exam / must / always / every / important / remember / option): 「必须遵守 / 必须满足」「must hold」「Example / for example」内の exam、「every constraint / everything / every candidate」— 全て通常の用法で偽陽性。`freq_badge` = 標準。図種: 待ち行列 = flow steps 4 (到着→列で待つ→窓口で処理→退去)、最適化問題 = flow steps 4 (決めるもの→制約条件→目的関数→最適解) — 登録内。pair 配置: 待ち行列 / 最適化問題 の 1 組 (2 行、key 1)。
6. **D-200**: 考点数 2 / 3 (≤3 ✓)、各 JP 1〜2 文、字数 57 / 57 / 90 / 75 / 92 (≤100 ✓、最大は `terms[1].points[2]`)。**framing 件数** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0。
7. **D-202 / D-203 / D-204**: 書き方 7 (欄同士の照合: 利用率の式は detail「基本の形は窓口が 1 つ」の直後、key_points[1]「窓口が 1 つの場合」で限定 [r1 LOW 解消]; 最適化 detail「候補が少なければ全列挙」と points[1]・key_points[3] 一致; 図の「利益の合計が最も大きい」と one「利益の最大や費用の最小」一致; 比喩「混む曜日ほど待つ時間も増える」は points[0] の非線形性を否定しない) → jp・zh・en の不整合 0。v1 未改稿の `unit_summary_*` だけが「グラフ理論を応用した待ち行列モデル」とし本文 (確率と統計) と食い違う → L1。書き方 8 → L5 / L8。書き方 9 (限定条件): q005 の「いずれの作業も X→Y の順」→「2 台の機械を同じ順に使う」、「総所要時間が最小」→「全部が終わるまでの時間が最短」(r1 MEDIUM の修正、三語とも保持); q033 の「どのような順番で経由してもよい」→「経由する順番を自由に選べる」; q087 の「費用を最小化するために」→ 目的関数の最小化 — 落ち 0。q005 の「各機械は同時に 2 作業不可」は明記しないが、「機械を使う」の通常の意味かつジョンソン法の前提で、主張の範囲を変えない。
8. **D-205 / D-210**: 改訂される規格・法令・知識体系の構成要素の数・名称なし → 対象外。
9. **三語**: zh・en が jp と同じ事実か、図ラベル・caption・総表・対比行の三語一致 (parity 0 diff)、`[[jp:…]]` 原語 8 種 (待ち行列 / 利用率 / キュー / 最適化問題 / 制約条件 / 目的関数 / 最適解 / ジョンソン法) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 2 用語に見出し語の `[[jp:]]` あり、zh 訳語は `zh_terms.json` (待ち行列 = 排队（队列）、最適化問題 = 最优化问题、キュー = 队列) に一致。
10. **前回指摘の解消確認** (journal `b50-u07-a1` type:"result"): jp-review r1 MEDIUM 1 (ジョンソン法の考点が何を最小にするかを欠く) → 「全部が終わるまでの時間が最短になるよう」を jp に追加、zh「排成全部完成时间最短的顺序」/ en "so that everything finishes soonest" にも回帰なし ✓。r1 LOW: key_points[1] の窓口 1 つの限定 → jp「窓口が 1 つの場合」/ zh「只有一个窗口时」/ en "With a single counter" ✓、他 (pairs の必然性・q007・q033 / q087 の写し判定・反復) は r2 PASS で LOW 継承。loc-review r1 PASS の LOW 4 件 (one_en の queue 表記・extra_en の lines・zh「利用率 [[jp:利用率]]」・one_zh の語順) は未修 → §3 で再判定 (L2 / L3 / L9)。
11. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (2 / 2)

| # | 用語 | 事実 (考点 × 引用題、限定条件、計算) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 待ち行列 | 引用題なし (mix 2 件)。points[0] 利用率 → 1 で待ち時間が急増 (M/M/1 の ρ/(1−ρ) で確認) ✓ / points[1] 待ち行列のモデル (混み具合の見積もり) とデータ構造のキュー (FIFO) は目的が違う ✓。detail の利用率 = 平均処理時間 ÷ 平均到着間隔 (窓口 1 つ) ✓。flow 4 段 (到着→待つ→処理→退去、先着順) は detail の基本形と一致。hook (電話交換機の回線) ✓ | OK | one_en が見出し語を "queue" とし、points[1] のデータ構造 "queue" と同語 (L2); zh term_zh「排队（队列）」と キュー = 队列 (L9) | L2 / L3 / L8 / L9 |
| 2 | 最適化問題 | exam 3 件 / 3 題: points[0] 制約と目的関数を分け、前提にない条件を足すと最適解が外れ得る (2014h26h-q087 正答イ ✓) / points[1] 順番任意の経路は全候補の合計の最小、不可区間を含む順は除外 (2016h28h-q033 正答イ 130、再計算一致) / points[2] ジョンソン法 (2018h30a-q005 正答ウ C→A→B、全 6 順の総所要時間を再計算し 29 分が唯一最小)。限定条件 3 題とも保持 | OK (D-198 (iii) 該当なし、L6 で記録) | OK | L6 / L7 |

**単元レベル**: goals 3 点・overview_cols 2 (求めるもの / 使う場面の例)・overview_rows 2 行・pairs 1 組 (2 行 key 1)・key_points 4 (待ち行列の定義、利用率の式と急増 [窓口 1 つ]、最適化問題の定義、少数候補は全列挙 — 全て本文と一致)・summary (記法除去版と一致)・challenge_questions 3 件 (q033 / q005 / q007 — 本文と矛盾なし、q007 は本文で解けない → L4)。事実誤りなし (v1 未改稿の unit_summary を除く → L1)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 3)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `unit_summary_jp` / `unit_summary_zh` / `unit_summary_en` (v1 未改稿; 同文が `data/ip/textbook/unit_index.json` にもある) | 「グラフ理論を応用した待ち行列モデル」とするが、本文は待ち行列を到着と処理のばらつきを**確率と統計**で扱うモデルと定義し (`terms[0].detail`、`pairs[0].rows[1].a`)、グラフ理論は使わない。欄同士の食い違い。どの題も誤答させないため LOW (前例: 他単元の v1 unit_summary 不整合 = LOW 建議修) | jp「グラフ理論を応用した待ち行列モデルと、」→「確率と統計を応用した待ち行列モデルと、」/ zh「学习应用图论的排队模型，」→「学习应用概率与统计的排队模型，」/ en "Learn queuing models that apply graph theory, and" → "Learn queuing models that apply probability and statistics, and" (unit_index.json の同文も同じ置換) |
| L2 | LOW **建議修** | `terms[0].one_en` (+ 派生 `definition_en`) | 見出し語を "A **queue** (…) is a model" とし、同用語 `points[1].text_en` の「データ構造の queue (キュー) とは目的が違う」と英語では同じ語になる。goals_en・key_points_en は "queuing" で区別しており、one だけが衝突 (loc-review r1 LOW の未修)。jp は待ち行列 / キューで区別できており事実誤りなし | en "A **queue** ([[jp:待ち行列]]) is a model that treats" → "A **queue** ([[jp:待ち行列]]), in the sense of a waiting line, is a model that treats" |
| L3 | LOW **建議修** | `overview_rows[0].extra_en[1]` | 「回線」を "lines" とし、単元内で多用する line = 待ち行列 (line length / waiting line) と読み分けられない (loc-review r1 LOW の未修) | en "Forecasting how busy counters or lines get" → "Forecasting how busy counters or communication lines get" |
| L4 | LOW | `challenge_questions[2]` (2009h21h-q007) | 期待値の題 (terms = 確率) で、本単元の見出し語では解けない (再計算: B 21 が最大、正答イ)。最適化以外の非中問題が 2 題しかないための補充 (jp-review r1 / r2 LOW の継承)。本文と矛盾はない | 記録のみ |
| L5 | LOW | `pairs[0]` | 待ち行列と最適化問題は取り違えやすい組ではなく、rows[0]「求めるもの」は総表 `overview_rows[*].one_line / extra` の、rows[1] の b 側は goals[2]・`terms[1].points[0]`・key_points[2] の再掲 (D-195 §4 / 書き方 8、jp-review LOW の継承) | 記録のみ |
| L6 | LOW | `terms[1].points[0].text_*` (q087)、`terms[1].points[1].text_*` (q033) | D-198 (iii) の確認: points[0] は q087 の肢の語句・組・順序を再現せず、見出し語 (制約条件 / 目的関数) の役割の区別と正答の原理を述べる (D-209 の除外); points[1] は q033 の前提 (順番任意・不可区間) を一般化して述べ、地点名・時間・候補・答えは使わない → 写しに当たらない。points[0] 1 文目は one の言い直しに近い (§9) | 記録のみ |
| L7 | LOW | `terms[1].points[2].text_*` | ジョンソン法を繰り返すときの「先頭」「最後」は「まだ空いている最も前 / 最も後」の意味で、字面だけでは分かりにくい (jp-review r2 LOW の継承)。q005 では 1 回目で B が最後、2 回目で C が先頭に決まり、残りの A が中央で正答に至るため誤答はしない | 記録のみ (字数 92 字で追記の余地が小さい) |
| L8 | LOW | `terms[0].points[0]` / `key_points_*[1]` | 「利用率が 1 に近づくと待ち時間が急に伸びる」が考点と要点で 2 回 (要点のまとめ直しとして許容、書き方 8 / §9) | 記録のみ |
| L9 | LOW | `terms[1].one_zh`、`terms[0].points[0].text_zh`、`terms[0].term_zh` | ① one_zh の「例如利润最大或成本最小」が文末に置かれ、jp の「目的関数」の例示から問題全体の例に係りが移る (意味は大きくずれない) ② 「利用率 [[jp:利用率]]」は同字形の併記で冗長に見えるが規則上は正しい ③ v1 の term_zh「排队（队列）」(zh_terms.json 準拠) の括弧内 队列 が、points[1] の キュー = 队列 と同じ字になる。いずれも loc-review LOW 継承 / v1 不変量で、本文の対比 (排队模型 vs 数据结构“队列”) は読み取れる | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 待ち行列のモデル / データ構造のキュー: `terms[0].points[1]` のみ → 許容。② 待ち行列 = 見積もり / 最適化 = 最良の解: `pairs[0].rows[0]` と総表 `overview_rows` の列 (D-195 §3 の構造) → L5。③ 候補が少ない = 全列挙 / 多い = 線形計画法など: `terms[1].detail` のみ (key_points[3] は片側だけ) → 許容。

**範囲外の観察**:
- O1 `source_figures[].figure_description` (q005 / q007 / q067) は題の数値を含むが本文外 (copy 照合の対象外、前例どおり)。`source_figures[4]` の 2010h22h-q067 は本単元の引用・quiz・challenge のいずれにも使われていない (v1 継承)。
- O2 q033 / q005 の raw OCR は clean と数値が 1 か所ずつ異なる (q033 B→A、q005 B の X 時間) が、どちらでも正答は不変 (§1-2)。判定は clean による。

確認済みで問題なし: 計算題 3 題 + challenge 1 題の再計算 (全て正答と一致)、利用率の式と急増 (三語)、限定条件 (exam 考点 3 件全て保持、r1 MEDIUM 解消・zh/en 回帰なし)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤92 字)、図の文字列の写し (validate 0、独立照合 遮蔽あり / なし / 近似 とも 0)、`[[jp:]]` 原語 (8 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (2/2)、zh 訳語表、図種 (flow steps ×2 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。既知失敗型 (1)〜(10): (1) 上記 L6 で該当なし / (2) 「など」等の限定語を持つ引用題の語なし、落ち 0 / (3) 別名を別物として教える箇所なし / (4) 比喩・図は one / detail と矛盾なし / (5) zh / en 回帰なし / (6) zh / en が誤答肢寄りの語を使う箇所なし / (7) 法令・規格の改正対象外 / (8) 比喩の鍵語が他見出し語と衝突しない (番号札・かばん) / (9) points[1]・points[2]・比喩を q033 / q005 / q087 / q007 に当てても誤答を選ばない / (10) 法令・規格の閉じた列挙なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 3: L1 / L2 / L3、記録のみ 6: L4〜L9) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 2 用語・考点 5 件 (qid 付き 3 件)・引用 3 題 + challenge の未引用 1 題で、考点の主張は正答と一致し (計算は全て再計算で一致)、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。LOW 建議修 3 件 (L1 / L2 / L3) は補丁 (B3) で修正推奨、L4〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-34-u07
✓ technology-13-34-u07 unit: 0 issues (data/ip/textbook/units/technology-13-34-u07.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-34-u07
✓ technology-13-34-u07 parity: 18 locations, 0 diff
EXIT=0
```
