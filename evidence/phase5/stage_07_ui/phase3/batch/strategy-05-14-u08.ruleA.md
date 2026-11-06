# Rule A 全数抽検 — strategy-05-14-u08 (AIの仕組みと透明性・人間の関与)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S148〜S149 b34)、repo HEAD `387e7a33` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b34-u08-a1` merge 結果、sha256 先頭 `36da5bbcd2cf2c97`)。
- **対象**: `data/ip/textbook/units/strategy-05-14-u08.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (マルチモーダルAI / ランダム性 / XAI / ヒューマンインザループ / HITL) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197〜D-200、D-202、D-203、D-204 / D-205、D-208 (既知の型 1〜10)、D-209、D-210、D-211、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/strategy-05-14-u08/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_*` = one の記法除去版、`explanation_*` = detail、`memory_hook_*` = hook、`summary.key_points_* / memory_hooks_*`) が本体と一致することをスクリプトで確認 (不一致 0)。terms[3] の図は既存 SVG (`figures/strategy-05-14-u08-t02.svg`、ラベル jp 4 つ: AIが処理・提案 / 人間が確認・修正 / 承認して実行 / 差戻し) を読み、detail「承認して実行・修正して戻す」と一致。
2. **考点 × 引用題**: manifest `term_questions` は 5 用語とも空、topic `strategy-05-14` 39 題に本単元の用語 (マルチモーダル / ランダム性 / XAI・説明可能 / ヒューマンインザループ / HITL) を扱う題は無い (全 questions.json を grep しても該当 0)。考点 4 件は全て `mix` で qid なし、`quiz` は 5 用語とも空。よって exam 考点 × 正答照合・限定条件 (書き方 9)・D-210・D-211 (正誤選択型の一般原則 quiz-only 経路) の対象は **0 件 (N/A)**。代わりに 4 考点・定義・図を一般的な事実 (IT パスポートのシラバス水準の AI 用語) と照合し、topic 内の生成 AI 系の題 (2025r07-q010 ハルシネーション / 2025r07-q028 生成 AI の記述; いずれも本単元の非引用・他単元の範囲) の正答と矛盾しないことを確認。
3. **quiz / challenge_questions**: quiz 0 枠。challenge 5 題 (2015h27a-q011 / 2015h27h-q013 / 2016h28a-q018 / 2017h29h-q022 / 2018h30a-q034) は v1 から継承した SFA・POS・IC タグの題で、本単元の内容とは無関係 (矛盾もしない)。prep 仕様 (同 topic の題で 3 題以上を埋める) によるもので執筆側では直せない — 範囲外観察 O1 (JP review r1 / r2 で LOW 記録済み)。型 (9) (hook / 手がかりを確認題に当てると誤答肢を選ぶ) は該当題が無く N/A。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合: 単元 JP 文字列 93 本 (派生フィールド除く、図ラベル・セル・caption 含む) × topic 39 題 (題文は `stem_jp_clean` がある 20 題はそれを、他は raw stem_jp) + 選択肢、12 字連続窓 (句読点・記号・空白除去) を **カタカナ 4 字以上と英数を □ に遮蔽 / 遮蔽なし** の両方で照合 → **0 件 / 0 件**。1〜2 字置換の近似照合 (12 字窓、ハミング距離 1〜2) → **0 件**。カタカナの多い文 (マルチモーダル・シングルモーダル・ヒューマンインザループ・ブラックボックス) を目視 — 対応する題が無く写しの余地なし。D-198 (iii) 選択肢なぞり: 引用題 0 のため対象なし、validate の `warn  choice-echo` も 0 行。
5. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 (2/3/2/2/2 文)、比喩・フックが定義の言い換えでないこと (マルチモーダル = 感覚をつなぐ人、ランダム性 = おまかせ料理の日ごとの違い、XAI = 途中式のある答案、HITL = 社内決裁; hook は語構成・日常語義との対比・頭文字・カタカナ語源で別の手がかり; HITL は analogy 空・hook なし = D-203 (b) の許容形)、定義前使用 (モダリティ = one の括弧、シングルモーダル = detail で定義、ブラックボックス・透明性 = XAI detail で説明、再現 = ランダム性 detail)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → 「選ぶ」3 件 [ランダム性 detail_jp・派生 explanation_jp・図 nodes[2] の「確率に応じて語を選ぶ」] のみ = 仕組みの記述で定型締め句ではなく偽陽性。zh 考试 / 必须 / 重要 / 记住 / 选项 → 0; en exam / must / important / always / remember / option → example 内の exam 7 件と caption の "does not always take" 1 件 = 通常の用法で偽陽性)。図の型 (マルチモーダル = static table 3 行、ランダム性・XAI = flow steps 4、HITL = 既存 SVG、HITL = 図なし; §0-8 の登録内 / 既存 SVG)。pair 配置 (XAI / ヒューマンインザループ、key 行 rows[0] あり)。
6. **D-200**: 考点数 1/1/1/1/0 (≤3 ✓)、各 JP 1 文・50〜62 字 (≤100 ✓)。**framing 件数** (`POINT_FRAMING` の型で全考点を確認): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の照合): JP review r1 の MEDIUM (ランダム性の one / key_points が生成 AI 全般を主語に「次の語を確率で選ぶ」仕組みへ限定) は **解消** — one_jp・key_points_jp[1] は「出力が確率に基づいて作られる」の一般形、語の選択は detail「例えば文章を生成する AI は」と図 steps[0]「文章を生成する AI を例にとる」の例に移っており、zh / en も同じ範囲 (回帰なし、型 5 なし)。残る小さな不整合 = L2・L3。XAI ↔ HITL の対比 (書き方 8): `goals_*[2]` と `pairs[0].rows[0]` の 2 箇所 (総表の列は D-195 §3 の構造) → 許容。D-209: pairs は両側とも肯定の定義で (iii) に当たらない。HITL ↔ 完全自動化の境界: terms[3].points[0]「人を処理の流れに加える仕組みで…完全自動化とは向きが逆」、one「任せきりにせず」、detail の承認・差戻し、SVG の差戻しループが一致。HITL = ヒューマンインザループの略語 (型 3: 別名を別物として教えていないか) → one・detail・overview_rows[4]・key_points[3] とも「同じ仕組み」と明示、OK。ランダム性の過度の一般化 (temperature / sampling): 本文は temperature 等の具体名を出さず、「ばらつきの大きさは、例えば生成時の設定で小さくも大きくもできる」と「例えば」付きで述べ、caption steps[2]「最も確率の高い語に限らず」も「限らず」(常に最尤ではない) で、貪欲選択の設定を否定しない → 過度の一般化なし。XAI の範囲: one「根拠を人に分かる形で示す技術や考え方」、points[0]「精度を上げる技術そのものではない」、detail (ブラックボックス・透明性・検証・説明責任) は標準的定義で正しい。比喩 × 型 (4)(8)(9): 4 比喩とも他用語の見出し語や別定義の役割名を含まず (上司 / 部下 は単元内で定義された語ではない)、one / detail が否定する内容を運ばない (XAI 比喩の範囲は L5 で記録)。D-205: 改訂される文書 (規格・法令・ガイドライン) の構成要素の数・名称の記述なし。型 (10): 法令・規格の範疇列挙なし。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落なし; 型 6: 引用題・quiz が無く誤答肢の読みも生じない)、図ラベル・表セル・比較行・caption の三語一致 (parity 26 箇所 0 diff)、`[[jp:…]]` 原語 8 種 (マルチモーダルAI / モダリティ / シングルモーダル / ランダム性 / 説明可能なAI / ブラックボックス / 透明性 / ヒューマンインザループ) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` (マルチモーダルAI・ランダム性・XAI [説明可能なAI]・ヒューマンインザループ あり; HITL は jp と同綴りのため不要)。zh 訳語は `zh_terms.json` に従う (多模态 AI / 随机性 / XAI（可解释 AI） / 人在回路 / HITL / 生成式 AI; validate の B6 warn 0)。loc-review r1 の LOW 5 件のうち `terms[3].hook_zh` の指示対象 (这个词 = 人在回路 と読める) は未対応 → L4。
9. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | マルチモーダルAI | OK — 引用題なし。one (形式の異なるデータ = モダリティを組み合わせて扱う)、detail (シングルモーダルとの対、組み合わせ入力・別形式での出力)、mix 考点 (「マルチ」は形式の数で台数・利用者数ではない) は標準的定義と一致。table 3 行 (画像+文章→文章 / 文章→画像 / 動画→文章) は one・detail と一致 (v1 の例とも同じ範囲) | OK | OK | L6 (mix 考点の対比相手) |
| 2 | ランダム性 | OK — 引用題なし。one は生成 AI 全般の一般形 (確率に基づく出力 → 同じ指示でも変わりうる)、文章生成の語選択は「例えば」の例として detail・図に限定 (JP r1 MEDIUM 解消)。設定でばらつきを増減できる旨を「例えば」付きで記載、temperature 等の過度な一般化なし。hook は日常語義 (でたらめ) との対比で別の手がかり。mix 考点 (故障ではない) は正しい | OK (flow steps 4) | OK | L2 / L6 / L7 |
| 3 | XAI | OK — 引用題なし。one「根拠を人に分かる形で示す技術や考え方」、detail (ブラックボックス・透明性・検証・説明責任)、mix 考点 (精度向上の技術そのものではない) は標準的定義と一致。flow 4 段 (入力→判断→結果と根拠→人が確かめる) は概ね一致 | OK (flow steps 4) | OK | L1 (hook) / L3 (図 nodes[3]) / L5 (analogy) / L7 |
| 4 | ヒューマンインザループ | OK — 引用題なし。one「任せきりにせず処理の流れに人の確認や判断を組み込む」、detail (承認・修正して戻す、誤りや偏りを実行前に止める、責任の所在)、mix 考点 (完全自動化とは向きが逆) は標準的定義と一致。既存 SVG (処理・提案→確認・修正→承認して実行 / 差戻し→戻る) 一致。analogy (上司の決裁) は承認の流れで型 (8) なし | OK (既存 SVG) | hook_zh L4 | L4 / L8 |
| 5 | HITL | OK — one (Human In The Loop の頭文字、同じ仕組み)、detail (表記の違いだけ、意味に差なし)。別名を別物として教えていない (型 3 なし)。考点・hook・analogy なし (D-203 許容) | OK (図なし = 略語) | OK | なし |

**単元レベル**: goals 3 点・overview_cols 2 (分類 / 主な狙い・特徴)・overview_rows 5 行・pairs 1 組 (XAI / ヒューマンインザループ 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 5 件 (範囲外 O1)。pairs[0] の 3 行 (何を加えるか / 主に高めるもの / 分類) は両用語の one・detail と一致。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 8 (うち 建議修 4: L1〜L4)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[2].hook_jp` / `hook_zh` / `hook_en` (+ 派生 `memory_hook_*`, `summary.memory_hooks_*[2]`) | 「頭の X は Explainable の X」だが Explainable の頭文字は E。X が eXplainable の 2 文字目から取られることが表記に出ず、初学者には手がかりとして働きにくい (JP review r2 LOW、未対応)。事実誤りではない | jp「頭の X は Explainable (説明できる) の X。」→「頭の X は eXplainable (説明できる) の X。」/ zh「开头的 X 取自 Explainable（可解释）。」→「开头的 X 取自 eXplainable（可解释）。」/ en "The X at the front comes from \"Explainable.\"" → "The X at the front comes from \"eXplainable.\"" |
| L2 | LOW **建議修** | `overview_rows[1].one_line_jp` | 「回ごとに変わる性質」と言い切り、one_jp・key_points_jp[1]「変わりうる」、detail (設定でばらつきを小さくできる) と範囲が合わない (観点 7 の措辞級、JP review r2 LOW 未対応)。zh「每次都可能不同」・en "can differ each time" は既に可能形 | jp「生成AIの出力が確率に基づいて回ごとに変わる性質」→「生成AIの出力が確率に基づいて回ごとに変わりうる性質」(zh / en 変更なし) |
| L3 | LOW **建議修** | `terms[2].fig.data.nodes[3].label.jp/zh/en` | ノード「人が根拠を確かめて納得する」は受け入れを前提にするが、同じ図の caption steps[3] は「結果を受け入れるかを決める」(受け入れない場合もある)。図内の小さな食い違い | jp「人が根拠を確かめて納得する」→「人が根拠を確かめて受け入れるか決める」/ zh「人确认依据后接受」→「人确认依据后决定是否接受」/ en "A person checks the grounds and is convinced" → "A person checks the grounds and decides whether to accept" |
| L4 | LOW **建議修** | `terms[3].hook_zh` (+ 派生 `memory_hook_zh`, `summary.memory_hooks_zh[3]`) | 「这个词」が zh 見出し語「人在回路」を指すように読め、「人在回路」を片仮名に音訳した語と誤読しうる (jp は「片仮名にした語」、en は "The Japanese term" と明示)。loc-review r1 LOW、未対応 | zh「这个词是把英语 Human in the loop 直接音译成片假名。」→「日语名称[[jp:ヒューマンインザループ]]是把英语 Human in the loop 直接用片假名写出的词。」(jp / en 変更なし) |
| L5 | LOW | `terms[2].analogy_jp/zh/en` | 「途中の式も書かれた答案…どこで考え違いをしたかも確かめられる」は、XAI が推論の全過程を示すように読める。図 steps[2] は「どの要素が判断に効いたか」を示す (要因の提示) 程度で、比喩の像がやや広い。one / detail が否定する内容ではない (型 4 の MEDIUM には当たらない) | 記録のみ |
| L6 | LOW | `terms[0].points[0]` / `terms[1].points[0]` | mix 考点の対比相手 (AI の台数・利用者数 / 故障) が実際には取り違えにくく学習価値が小さい (JP review r1・r2 LOW)。事実は正しい | 記録のみ |
| L7 | LOW | `terms[1].fig.steps[0].caption_*`、`terms[2].fig.steps[1].caption_*`、`terms[1].fig.data.nodes[3].label.*` | caption 2 文の step が 2 つ (D-195 §2 の各 step 1 文、JP review r2 LOW)。ランダム性 nodes[3]「回ごとに異なる文ができる」は caption steps[3]「変わりうる」より強いが、ノード見出しの短縮表現で caption が補う | 記録のみ |
| L8 | LOW | `terms[3].detail_jp/zh/en` 2 文目、`overview_rows[3].extra_*[1]` | 「AI の誤りや偏りを実行前に止め」/ "are stopped before anything is executed" は HITL が誤りを必ず止めるかのような言い切り (止めやすくなる、が正確)。引用題が無く誤答肢の支持にもならない | 記録のみ (任意: jp「AI の誤りや偏りを実行前に止め、」→「AI の誤りや偏りを実行前に止めやすくなり、」) |

**対比の出現欄 (書き方 8 の列挙)**: ① XAI = AI 側に説明の働き / HITL = 流れに人の確認: `goals_*[2]`、`pairs[0].rows[0]` → 2 箇所で許容 (`overview_rows` の列は D-195 §3 の構造)。② マルチモーダル / シングルモーダル: `terms[0].detail` のみ。③ HITL / 完全自動化: `terms[3].points[0]` のみ (one の「任せきりにせず」は定義の一部)。

**範囲外の観察**:
- O1 `challenge_questions` 5 題 (SFA・POS・IC タグ) は v1 継承で本単元の内容と無関係。本単元用語の過去問が存在せず (questions.json 全体で 0)、validate の最低 3 題を同 topic の題で埋める prep 仕様による。執筆側では直せない (JP review r1・r2 で記録済み)。単元・確認題の選定ルールの課題として批間候補に回すかは判断を委ねる。
- O2 HITL の既存 SVG はラベルが jp のみ (既存 SVG 図の共通仕様、他 20 単元と同じ)。内容は三語の detail と一致。

確認済みで問題なし: JP review r1 MEDIUM 1 件の解消と zh / en の回帰なし、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤62 字)、D-198 写し (copy guard 0、独立照合 遮蔽あり / なし / 近似 とも 0)、`[[jp:]]` 原語 (8 種全て jp 本文に実在)、zh 訳語表 (B6 warn 0)、図種 (static table / flow steps ×2 / 既存 SVG / 図なし)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、D-205 / D-210 / D-211 / 型 (10) 対象なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **8** (建議修 4: L1〜L4 / 記録のみ 4: L5〜L8、L8 は任意の修正案あり) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 4 件 (全て mix、qid なし)・引用題 0 (本単元用語の過去問が存在しない) で、定義・考点・図・比喩は標準的事実と一致し、JP review r1 の MEDIUM (ランダム性の範囲) は解消済み、三語とも回帰なし。LOW 建議修 4 件 (L1〜L4) は補丁 (B3) で修正推奨、L5〜L8 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-14-u08
✓ strategy-05-14-u08 unit: 0 issues (data/ip/textbook/units/strategy-05-14-u08.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-05-14-u08
✓ strategy-05-14-u08 parity: 26 locations, 0 diff
EXIT=0
```
