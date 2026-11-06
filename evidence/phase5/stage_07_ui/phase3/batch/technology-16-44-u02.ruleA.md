# Rule A 全数抽検 — technology-16-44-u02 (信頼性の指標)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S148 第 29 批 b29)、repo HEAD `a7987a84` + 作業ツリー (単元 JSON は未コミットの書き直し版 = JP `b29-u02-a1` + 訳 `b29-u02-a2` (B5 loc-only) の merge 結果、sha256 先頭 `bf8d523d22e2b1d5`)。
- **対象**: `data/ip/textbook/units/technology-16-44-u02.json` (textbook-unit-v2)、用語 **4 / 4 = 全数** (故障率 / MTBF / MTTR / 稼働率) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `v1-original.json` (用語 4 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 4 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (nodes・caption・cols・cells) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.*`) は本体の記法除去版 (`[[jp:X]]` → 括弧内原語) で内容差 0。
2. **考点 × 引用題 (考点 7 件 = exam 6 + mix 1、qid 付き 6 件、引用 qid 延べ 14 = 異なり 12 題)**: `questions.json` の正答と `translations/<exam>.json` の `stem_jp_clean` (2018h30h-q080 / 2025r07-q094 / 2024r06-q067 は raw stem の数値が OCR 破損 [9.9 / 0.98・0.99] のため clean 版 [0.9 / 0.999 / 0.8・0.9] で判定) を再読し、**全計算題を独立に再計算**:
   - 2009h21h-q061: MTBF = (5,000 − 2,000) / 20 = 150、MTTR = 2,000 / 20 = 100、稼働率 = 150 / 250 = 60 % → 正答エ ✓
   - 2014h26h-q069: (60,000 − 100 × 60) / 100 = 540 → 正答イ ✓ (誤答 600 = 修復を引かない誤り; 考点はこれを正の手順で防ぐ)
   - 2010h22h-q057: 区間 A の稼働 300 + 200 + 100 = 600、故障 3 回 → 200 → 正答ウ ✓
   - 2011h23a-q067: 修理 15 + 20 + 10 = 45、3 回 → 15 → 正答イ ✓
   - 2012h24h-q070: 600 / 612 = 0.980 → 正答エ ✓
   - 2011h23tokubetsu-q071: 1.5B / (1.5B + 1.5R) = B / (B + R) → 正答エ (変わらない) ✓
   - 2009h21h-q070: 0.9 × 0.9 = 0.81 → 正答ア ✓ (前提「故障に因果関係なし」↔ 考点「故障が互いに無関係なとき」)
   - 2018h30h-q080: 0.9³ / 0.9² = 0.9 → 10 % 低下 → 正答ウ ✓
   - 2024r06-q067: (1 − 0.2²) × 0.9 = 0.864 → 0.86 → 正答ウ ✓ (前提「ランダムに故障」保持)
   - 2025r07-q094: 1 − 0.1ⁿ ≥ 0.999 → n = 3 → 正答イ ✓
   - 2011h23tokubetsu-q070: 停止確率最小 = 並列 3 台 → 正答エ ✓ (考点「並列は増えるほど上がる」)
   - 2013h25h-q083 正答ウ (総時間に対する稼働の割合) ✓ / 2018h30a-q058 正答ウ (バスタブ曲線) ✓
   - challenge 2013h25a-q052 (本文未引用): 図1 (1 − 0.1²) × 0.8 = 0.792 → 0.79、図2 0.9 × 0.8 = 0.72、差 0.07 → 正答ア ✓ (本文の並列 → 直列の規則で解ける)
   - 単元内の数値: 故障率 detail MTBF 400 h → 1 / 400 = 0.0025 回/h ✓、稼働率 table 0.7 → 直列 0.49 ✓・並列 1 − 0.09 = 0.91 ✓。
   - topic 内の未引用関連題 (2010h22a-q064: エ 0.9975 が最大 / 2010h22h-q077: 直列は常に装置単体より低い / 2014h26a-q084: c = 0.5 / 2024r06-q038: 75 h × 0.02 = 1.5 h / 2014h26h-q041・2011h23tokubetsu-q066 の可用性・信頼性・保守性) も本文の規則・定義で正答に至り、矛盾 0。
3. **quiz / challenge_questions**: quiz 計 8 枠 (全て考点の引用題)、challenge 5 題 (2011h23tokubetsu-q071 / 2013h25h-q083 / 2013h25a-q052 / 2024r06-q067 / 2018h30h-q080) — 本文と矛盾なし。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合: 単元の JP 文字列 93 本 (派生・source_figures 除く) を topic 内全 46 題の `stem_jp_clean` + 選択肢と 12 字窓で照合 — カタカナ 4 字以上・英数遮蔽あり **0 件** / 遮蔽なし **3 件** (`terms[3].one_jp`・`terms[3].fig.data.rows[0].cells[2].jp`・`key_points_jp[2]` ↔ 2013h25h-q083 の式 MTBF ÷ (MTBF + MTTR)) = 標準の定義式で写しではない。1〜2 字置換の近似一致 4 件: 上記の式 2 件、`terms[0].one_jp`「装置やシステムが単位時間あたり…」↔ 2009h21a-q061 (スループットの題; 「〜が単位時間当たりに」の汎用句のみ一致、内容無関係)、`terms[2].points[1]`「MTBFとMTTRはどちらも」↔ 2011h23tokubetsu-q071 (見出し語 2 つ + 汎用副詞; 続きは「故障回数で割る」で題の「1.5 倍」と無関係) → 全て偽陽性。カタカナ文 (バスタブ曲線 caption、hook の英語展開) は目視で題文の言い回しと不一致。**(iii) option tracing**: validate の `choice-echo` warn 0 行。2018h30a-q058 (which-term 型) は考点・図とも曲線の一般定義 (3 期の推移は標準定義、図 caption は原因を自前で追加) で誤答肢 (ガントチャート等) に触れない → D-209 免除。2011h23tokubetsu-q070 の選択肢 (直列 / 並列 × 2 / 3 台) は考点では「直列は台数が増えるほど下がり、並列は上がる」の一般規則としてのみ述べ、組の列挙・順序の再現なし。2014h26h-q069 / 2009h21h-q061 の数値 (60,000・100・60 / 5,000・20・2,000) は単元に無い。表の 0.7・例の 400 時間は自作。
5. **D-195**: one 1 文 × 4 (太字あり)、detail 2〜3 文、定義前使用 (MTBF = 故障率 detail で「次の用語の」+ 日本語名注、信頼性・保守性・可用性 = 括弧注、直列・並列 = detail で条件を定義)。§9 禁止句 grep: `hook_jp`「単位で覚える」1 件 (+ 派生 2) と `freq_badge`「頻出」のみ (記憶フックの言い方、前例どおり記録なし)。zh / en の相当語ヒットは `kind: exam` のみ。図: 故障率 = flow steps 3、MTTR = flow steps 4、稼働率 = static table、MTBF = 図なし → 全て登録内。pair (MTBF / MTTR、5 行 key 1) は MTTR の後。
6. **D-200**: 考点数 1 / 1 / 2 / 3 (≤3 ✓)、JP 文数 1〜2・字数 43〜87 (≤100 ✓; 最大 `terms[3].points[2]` 87 字 2 文)。**framing** (validateV2 `pointFraming`): jp 0 / zh 0 / en 0。
7. **D-202 / D-203 / D-204 / D-208**: 書き方 7 (「〜だけ」「〜とき」照合: 故障率 = MTBF の逆数は detail・key_points[0] とも「一定とみなせるとき」付き、hook のみ無条件 → L3) → MEDIUM 級不整合 0。書き方 9 (限定条件) → §2 に考点ごと記載、落ち 0。(1)〜(10) の既知型を個別確認: (2) 「など」落ちなし、(3) 平均故障間隔 = MTBF・平均修復時間 = MTTR は別名として同一扱い ✓、(4) 自転車の比喩は各 one の区間と一致、(5) a1 で直した記法 (Between = 修復後〜次の停止の動いている区間) は jp/zh/en とも保持、(6) zh の「运行时间」揺れ → L1 (誤答肢方向には読めない、下記)、(7) 法・規格なし、(8) 比喩の鍵語は他見出し語の語幹でない、(9) hook を引用題に当てる: MTBF hook → q057 で 200 (誤答 220 にならない)、稼働率 hook → q083 ウ・q061 エ、MTTR hook → q067 15 ✓、(10) 法定列挙なし。D-205 (改訂文書の構成数) 該当なし。D-210 (改正前文言) 該当なし。
8. **三語**: zh・en が jp と同じ事実 (追加・欠落なし)、図ラベル・表セル・比較行・caption 一致、`[[jp:]]` 原語 8 種 (故障率 / バスタブ曲線 / 信頼性 / 保守性 / 稼働率 / 可用性 / 直列 / 並列) が jp 本文に実在、one_zh / one_en の見出し語併記 (故障率・稼働率は `[[jp:]]`、MTBF・MTTR はラテン略語そのもの; validate 0)、zh 訳語 `zh_terms.json` 準拠 (可用率 / 可用性 / 可靠性 / 故障率 / MTBF（平均故障间隔）/ MTTR（平均修复时间）; B6 warn 0)。
9. **a1 失敗 (`failures/.../technology-16-44-u02_attempt_1.md`) の解消確認**: ① jp-review #1 medium `terms[1].hook_jp` (故障と故障の間 = ずっと動いている) → 現 hook は「止まっている区間と区間の間、つまり修復を終えてから次に止まるまでの動いている区間」で jp/zh/en とも解消 ✓。② loc-review #1 medium `pairs[0].rows[0]` (en「Japanese name」欄に英語展開) → `label_zh`「中文全称」/ `label_en`「Full name」に現地化、値 (平均故障间隔 / Mean time between failures) と整合 ✓。③ loc-review #2 medium `terms[3].points[0].text_zh` (运行时间 が全运行时间に占める割合 = 同語反復) → 「在总时间（运行时间 + 修复时间）中系统正常运行的时间所占的比例」で分母・分子が区別され解消 ✓。a1 loc の low (zh「小时」単位・「优劣方向」・「示例：2 台…」・「单位 / 取值范围」・“” 括弧・「下一个术语」・全角括弧セル・en "from the moment a failure stops") も全て反映済み、回帰なし。a2 loc-review #1 PASS (low 2) の 2 件は L1 / L4 として本監査でも確認。
10. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (4 / 4)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 故障率 | OK — exam 1 / 1 題: バスタブ曲線 = 故障率の時間変化、下がる → 横ばい → 上がる (2018h30a-q058 正答ウ; 題の 3 期の推移と一致、誤答肢に触れない)。detail の逆数関係は「時間によらずほぼ一定とみなせるとき」に限定 ✓、0.0025 再計算一致。flow steps 3 (初期 / 偶発 / 摩耗) は考点と一致 | OK | OK | L3 (hook) |
| 2 | MTBF | OK — exam 1 / 3 題: 運用時間に修復が含まれる記録では修復合計を引いてから故障回数で割る (2009h21h-q061 エ 150 / 2014h26h-q069 イ 540 / 2010h22h-q057 ウ 200、全て再計算一致; 限定条件「運用時間に修復時間も含まれている記録では」保持)。one・hook (修復後〜次の停止) と一致 | OK | zh「运行时间」揺れ | L1 |
| 3 | MTTR | OK — exam 1 / 2 題: 修復区間の長さを足して回数で割る (2011h23a-q067 イ 15 / 2009h21h-q061 MTTR 100、再計算一致) / mix: 両者とも故障回数で割り、足す区間と良い向きが逆 — 正しい (points[0]「修復した回数」と mix「故障回数」は全故障が修復される記録で同値)。flow steps 4 一致 | OK | OK | L2 (points[0] §9) / L5 |
| 4 | 稼働率 | OK — exam 3 / 9 題: 式 = 稼働時間の平均 / (稼働 + 修復の平均) = 運用時間全体に占める稼働の割合 (2013h25h-q083 ウ / 2012h24h-q070 エ 0.98 / 2009h21h-q061 エ 60 %) / MTBF と MTTR の比で決まり同倍率では不変 (2011h23tokubetsu-q071 エ) / 独立のとき直列 = 積、並列 = 1 − 全台停止確率、直列は台数増で低下・並列は上昇 (2009h21h-q070 ア 0.81 / 2018h30h-q080 ウ / 2024r06-q067 ウ 0.86 / 2025r07-q094 イ 3 台 / 2011h23tokubetsu-q070 エ; 限定条件「故障が互いに無関係なとき」保持)。table 0.49 / 0.91 再計算一致 | OK | en「available」太字 | L2 / L4 / L6 |

**単元レベル**: goals 3・overview_cols 2 (単位・値の範囲 / 良い向き)・overview_rows 4 (単位・良い向き全て正しい)・pairs 1 組 (5 行 key 1)・key_points 4・summary (派生一致)・challenge 5 (§1-3)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 6 (うち 建議修 1)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1].points[0].text_zh` | 運用時間 (修復込みの全体) を「运行时间」と訳す。同じ zh 単元では「运行时间」が 稼働時間 の意味 (`terms[3].points[0].text_zh`「运行时间 + 修复时间」、`pairs[0].rows[2].a_zh`「运行时间合计 ÷ 故障次数」) で、運用時間 は `terms[3].one_zh`・`overview_rows[3].one_line_zh`・`key_points_zh[2]` で「总运用时间」。文中で「减去修复时间」「只留下正常运行时间」と区別しているので誤答肢 (2014h26h-q069 の 600) 方向には読めないが、a1 の medium と同じ 運用 / 稼働 の語の揺れ (a2 loc-review low) | zh before「如果记录中的运行时间也包含了修复时间，就要先从运行时间中减去修复时间的合计，只留下正常运行时间，再除以故障次数，这样得到的才是**MTBF**。」→ after「如果记录中的总运用时间也包含了修复时间，就要先从总运用时间中减去修复时间的合计，只留下正常运行时间，再除以故障次数，这样得到的才是**MTBF**。」(jp / en 変更なし) |
| L2 | LOW | `terms[2].points[0]`、`terms[3].points[0]` (三語) | §9 言い直し: MTTR 考点 = 同 detail 1 文目、稼働率 points[0] = one + hook (a1 jp-review の low と同じ)。事実は引用題と一致 | 記録のみ |
| L3 | LOW | `terms[0].hook_jp/zh/en` | 「分母と分子を入れ替えた関係」は単位の話としては正しいが、detail の「一定とみなせるとき」の条件を付けずに逆数関係と読める (書き方 7 の措辞級) | 記録のみ |
| L4 | LOW | `terms[3].hook_*`、`terms[3].analogy_*` | §6: hook は式を文字に置き換えた形、analogy は定義の言い換えに近い (誤学習なし) | 記録のみ |
| L5 | LOW | 書き方 8 | ① MTBF / MTTR の区間・求め方・良い向き: `pairs[0].rows[1..3]` + mix `terms[2].points[1]` に加え `key_points[1]`・`terms[2].fig.steps[0,2]` caption。② 直列 / 並列 (pairs なし): `terms[3].detail`・`fig` 表・`points[2]`・`key_points[3]` の 4 欄 | 記録のみ (表と key_points は構造上の要約) |
| L6 | LOW | `terms[3].detail_en` | 可用性 を形容詞 **available** に太字、原文にない "in the broader sense" を付加 (見出し語 Availability との衝突回避; 意味ずれなし、a2 loc-review low) | 記録のみ |

範囲外の観察: O1 図・key_points[3] は独立の条件を書かず考点 3 にのみ記載 (a1 jp-review low、同単元内に条件があり軽微)。O2 `zh_terms.json` の 平均値 → 均值 は技術語義でなく「平均值」維持で可 (B6 warn 0)。O3 `source_figures[0].figure_description` の「選択肢」はメタデータで本文外。

確認済みで問題なし: 全計算題 13 + 単元内数値 3 の再計算一致、限定条件 (考点 6 件全て保持)、§9 禁止句、framing 0/0/0、D-197 (validate 0)、D-200、D-198 (独立照合は標準式・汎用句の偽陽性のみ、choice-echo 0)、`[[jp:]]` 原語 8 種実在、zh 訳語表、図種 (flow steps ×2 / static table ×1 / 図なし ×1)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、a1 medium 3 件の解消。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **6** (建議修 1: L1 / 記録のみ 5: L2〜L6) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 4 用語・考点 7 件・引用 12 題 + challenge / 関連題で、考点の主張は正答 (全計算を独立に再計算) と一致し、誤答肢を支持する記述・限定条件の落ち・写しは無い。a1 の失敗 3 件 (jp hook / pairs en / 稼働率 zh) は解消済み。LOW 建議修 L1 は B3 補丁で修正推奨。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-16-44-u02
✓ technology-16-44-u02 unit: 0 issues (data/ip/textbook/units/technology-16-44-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-16-44-u02
✓ technology-16-44-u02 parity: 23 locations, 0 diff
EXIT=0
```
