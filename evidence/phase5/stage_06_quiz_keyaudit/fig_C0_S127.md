# C track C0 (S127, D-150 §2) — 図縁辺走査の脚本化 + sweep 準備

データ (questions.json / figures / question_bank / webp) は不変。脚本と manifest のみ。C0 Rule D (pr-review-toolkit:code-reviewer opus) = PASS-with-notes (MAJOR 0 / MINOR 3 / NIT 3)。指摘は §6 で処置した。

## 1. 縁辺走査 `scripts/quiz-fig-edgescan.mjs`

- 対象: 配信 webp `apps/web/public/quiz-figures/*.webp` 全数。
- 設定 (S126 の一回限り scratchpad 脚本 `edge.mjs` を S126 transcript `eabc24bd` から復元し、同一値で固定):
  - sharp `greyscale().raw()`、輝度 **< 128** を暗画素
  - 各辺の外周 **2 本** (行/列) それぞれの暗画素率の **max**
  - 率 **> 0.02** の辺が 1 つ以上で候補
- 出力: `evidence/phase5/stage_06_quiz_keyaudit/fig_edgescan_S127.json` (params / 総数・種別内訳 / 候補ごとに webp パス・key・question_id・図種別・flag 辺・4 辺の率)。
- 図種別: `choice` = questions.json `choice_figures` の図 / `shared` = question_bank `figure_group` に自分以外の member がいる題の図 (`shared_with` に共有先) / `main` = それ以外の `figure`。

### 再現結果

| | S126 | S127 |
|---|---|---|
| 総 webp | 530 | 530 (main 459 / shared 47 / choice 24、未対応 0) |
| 候補 | 267 | **267** (main 264 / shared 3 / choice 0) |
| 候補集合の差 | — | **0** (S126 scratchpad `edge.txt` の 267 id と完全一致) |

閾値の調整はしていない。S126 の既知欠損 2 題 (D-149 背景に記載) はどちらも候補に入る。

## 2. 盲検対照 (6 = 既知欠損 2 + 陰性 4)

- 出典: S126 で目視した 6 枚。S126 transcript の png Read 呼び出しと、scratchpad の `bot.txt` (bottom 率で 2〜7 位) から特定した。陰性 4 の判定は S126 のものをそのまま使い、S127 では目視し直していない (S126 の記録は「上下の文字混入/罫線接触」とまとめただけで、1 枚ずつの所見は残っていない)。
- **対照の id と各対照の内訳は sweep 後に公開する。** 対照ファイルは sweep 中に agent から見えないよう repo の外 (session scratchpad) に置いた。
- 6 件ともに edgescan 候補に含まれるので、items に重複追加はしていない。items は id 昇順で、対照を見分けるフィールドはない。

### 合否基準 (sweep 前に固定)

| 区分 | 合格 | 不合格・扱い |
|---|---|---|
| 既知欠損 2 | `matches_question=false` **かつ** `issue=partial_crop_missing_content` | それ以外の issue/判定は不合格 → opus で全量を再走 |
| 陰性 4 | `matches_question=true` **または** `issue=extra_neighbor_content` (S126 の所見どおり、軽微な隣接混入は許容) | `partial_crop_missing_content` が出ても即不合格にはせず、C2 critic で個別に確認 |

prompt は対照に合わせて変えていない (対照への誘導を避けるため)。

## 3. sweep manifest

- `data/ip/quiz/.keyaudit/figsweep_input_S127.json`: `{batch, source, count, by_kind, questions[]}`。**webp 単位**で、id = webp key。各項目は `question_id` / `question_number` / `figure_kind` / `stem_jp` / `choices_jp` (出荷層 questions.json) / `figure_png` (`data/ip/exams/figures/<key>.png`、webp の元) / `figure_webp` / `figure_page_png` (D-145 `figure_page_image ?? page_image`) を持つ。choice は `choice` + `choice_text_jp`、shared は `shared_with[] {id, question_number, stem_jp}`。
- `data/ip/quiz/.keyaudit/figsweep_items_S127.json`: `[{id}]` × 267。
- 件数: **267** = main 264 / shared 3 (`2015h27h-q097` / `q099` / `q100`、同じ figure_group) / choice 0。
- 整合: 267 項目すべてで png / webp / 全頁 png が存在。png と webp の縦横比も一致 (差 ≤ 0.01)。
- **C1 の集計**: `2015h27h-q097` / `q099` / `q100` は同じ共有図の 3 枚なので、group (`2015h27h` の figure_group) 単位で 1 件にまとめて数える (3 件と数えると、同じ図の判定が 3 重に計上される)。

## 4. 脚本変更

| ファイル | 変更 |
|---|---|
| `scripts/quiz-fig-edgescan.mjs` | 新規 (上記 §1) |
| `scripts/quiz-figsweep-manifest-S127.mjs` | 新規。edgescan JSON → §3 の 2 ファイルを生成。`--controls <path>` を渡すと、対照の id が items に含まれることを検証する (候補外なら停止)。対照の id は脚本に持たず、出力にも対照の印を残さない。再実行で md5 が同一になることを確認 |
| `scripts/quiz-figcrop.workflow.mjs` | `args.model` (既定 `opus`) / `args.agent_type` (既定 `general-purpose`) を追加。prompt に `figure_kind` (main/choice/shared) の説明と、手順 4「**図の完全性**」(下記) を追加。SCHEMA と既存の判定は変更なし。ROOT の直書きは元から無い |
| `scripts/quiz-figfix-apply.mjs` | sharp を `createRequire(apps/web/package.json)("sharp")` に変更。引数化 (§6 M1) |
| `scripts/quiz-figcrop.run.generated.mjs` / `quiz-figfix.run.generated.mjs` / `quiz-figreverify.run.generated.mjs` / `quiz-figreverify2.run.generated.mjs` | inputPath の旧 ROOT `/Users/bojiangzhang/MyProject/IT-Passport-Learning` → `/Volumes/DevSSD/Project/IT-Passport-Learning` |

`quiz-figfix.workflow.mjs` には旧パスが無いので変更なし。

手順 4 の文面: 「全頁の当該図と比べ、図・表の外周の罫線/枠が閉じているか、表なら見出し行から最終行・最終列まで、図ならすべての要素とラベル・凡例・注記が crop 内にあるか、四辺のどこかで切断されていないかを確認。1 つでも欠けていれば partial_crop_missing_content」。

**注意 (recall の主張について)**: 例示は個別の欠損所見から一般化した。ただし、この checklist を書いた者は既知欠損 2 題の所見を知っていた。そのため、既知欠損 2 題が検出されても、それは checklist が当該の型に合わせて書かれた結果である可能性がある。未知の欠損型に対する recall の根拠としては弱いものとして扱う。

### 確認

- `node --check`: edgescan / manifest / figfix-apply は OK。workflow 系 6 本は top-level `return` を含むので async 関数で包んで `--check` → すべて OK。
- figfix-apply (すべて `--dry`、`question_bank.json` の md5 は前後で同じ、S99 `figfix_backup/` は 26 枚のまま):
  - 引数なし → `✗ --results … is required`、exit 1
  - `--results figfix_results.json` (S99) → `recrop 26 / copy 0 / remove_figure 2 / skip 2`。`COPY_FROM` を外したので、S99 では copy だった 1 件が recrop として数えられる。既定の退避先 `figfix_backup_S127/` は dry では作られない
  - `--backup-dir data/ip/quiz/.keyaudit/figfix_backup` (S99 の退避先) → 同名ファイルの衝突を列挙して停止、exit 1
  - 結果 JSON 側の `copy_from` / `figure_page_override` → `copy … ← … (shared figure)` / `recrop … page=pages/2010h22h/page-38.png` と表示される

## 5. 注意点

- 縁辺走査は「縁に内容が接している」ことしか検出できない。余白を残したまま行ごと欠けている裁断 (縁は白い) は原理的に検出できない。choice 図 24 枚を含む候補外 263 枚は今回の sweep の対象外で、別途の手当てが要る。
- run.generated 4 本の inputPath は新パスに直したが、参照先の S99 入力 (`input_batch_FULL.json` / `input_figfix.json` / `input_figreverify*.json`、gitignored データ) の中の `figure_png` / `figure_page_png` はまだ旧パスのまま。データなので触っていない。つまり S99 の run を最後まで再実行することはできない。C track は S127 の新しい manifest を使う。

## 6. C0 Rule D 指摘の処置

- **M1** `quiz-figfix-apply.mjs`:
  - (a) `--results <path>` を必須にした。既定値は無く、未指定なら exit 1。
  - (b) 退避先を `--backup-dir` (既定 `data/ip/quiz/.keyaudit/figfix_backup_S127/`) にした。退避対象と同名の png が退避先に 1 つでもあれば、何も書かずに停止する。dry ではディレクトリを作らない。
  - (c) S99 固定の `COPY_FROM` / `PAGE_OVERRIDE` 表を外した。代わりに結果 JSON の各項目の任意 field `copy_from` / `figure_page_override` で指定する。
  - **`2010h22h-q090` の page override は D-145 の表現に入っていない**。question_bank の `source` は `{page_image: pages/2010h22h/page-39.png}` だけで、`figure_page_image` が無い。S99 の override 先は page-38。このため figfix-apply は現在 page-39 から裁断する。この題を再裁断するときは、先に `quiz-pagefix-apply.mjs` で `source.figure_page_image` を入れるか、結果 JSON に `figure_page_override` を書くこと (今回は記録のみで、データは変更していない)。
- **M2** 手順 4 の例示を一般化した (§4)。recall の主張は控えめにする (§4 注意)。
- **M3** 対照の合否基準を固定した (§2)。対照ファイルにも同じ基準を書いた。prompt は変更なし。
- **N1** 対照ファイルを repo の外 (session scratchpad) に移した。`.keyaudit/` には置かない。manifest 脚本は対照を `--controls` で受け取るだけ。本書には sweep 後に公開とだけ書く。
- **N2** `2015h27h-q097` / `q099` / `q100` は C1 の集計で group 単位にまとめる (§3)。

## 7. C1 sweep 後の公開: 盲検対照の正体と合否

C1 sweep (run `wf_a1380a30-8ad`、267/267) の結果は `fig_sweep_S127.json` に保存した。`matches_question=false` は 111 件 (partial_crop_missing_content 104 / extra_neighbor_content 6 / wrong_question_figure 1)。§2 の基準で判定した結果は次のとおり。

| 区分 | id | sweep 結果 | 判定 |
|---|---|---|---|
| 既知欠損 | 2016h28h-q033 | false / partial_crop_missing_content / high | 合格 |
| 既知欠損 | 2017h29a-q015 | false / partial_crop_missing_content / high | 合格 |
| 陰性 | 2010h22a-q048 | true / ok / high | 合格 |
| 陰性 | 2017h29h-q069 | true / extra_neighbor_content / high | 合格 |
| 陰性 | 2026r08-q003 | true / ok / high | 合格 |
| 陰性 | 2011h23tokubetsu-q078 | false / partial_crop_missing_content / medium | 即不合格にはしない → C2 critic で個別に確認 (figfix b1 に含まれる) |

対照ファイルは session scratchpad の `fig_controls_S127.json`。

## 8. C2 準備 (figfix 3 batch)

- 対象: sweep で陽性の 111 件に、共有図 group の陰性 member 2 件 (`2015h27h-q099` / `q100`、どちらも sweep は ok) を加えた **113 件**。共有図 group は `2015h27h-q097` が陽性なので 3 member を同じ batch に入れ、group として 1 件扱いにする (各項目の `group_note` に記載)。
- 分割: exam 昇順。exam 境界のうち、k×113/3 に最も近いところで切る (`scripts/quiz-figfix-manifest-S127.mjs`)。

| batch | 件数 | exam 範囲 | prior issue 内訳 |
|---|---|---|---|
| b1 | 39 | 2009h21a 〜 2012h24a (7 exam) | partial 35 / extra_neighbor 3 / wrong_question 1 |
| b2 | 35 | 2012h24h 〜 2017h29a (9 exam) | partial 32 / extra_neighbor 1 / ok 2 (group member) |
| b3 | 39 | 2017h29h 〜 2026r08 (11 exam) | partial 37 / extra_neighbor 2 |

- 入力: `data/ip/quiz/.keyaudit/figfix_{input,items}_S127_b{1,2,3}.json`。questions[] の各項目は `stem_jp` / `question_number` / `figure_png` / `figure_page_png` / `prior_finding` {matches_question, issue, crop_depicts, correct_region_desc, notes_jp, confidence} を持ち、共有図の項目は `shared_with` / `group_note` も持つ。
- 再検証の入力は apply 後に `--stage reverify --batch N [--figfix-results <path>]` で作る。既定の結果パスは `figfix_results_S127_b<N>.json`。recrop / copy_from の項目について、再裁断後の `figure_png`・全頁・stem・`prior_critic` (前回 critic の figure_desc / bbox / notes) を書く。

### 脚本変更 (C2 準備)

| ファイル | 変更 |
|---|---|
| `scripts/quiz-figfix-manifest-S127.mjs` | 新規 (上記)。`--stage fix\|reverify --batch 1..3` |
| `scripts/quiz-figfix.workflow.mjs` | `args.model` (既定 `opus`) / `args.agent_type` (既定 `oh-my-claudecode:critic`) を追加。入力の説明に `group_note` の一文を追加。SCHEMA と判定は変更なし |
| `scripts/quiz-figreverify.workflow.mjs` | 新規。S99 の `quiz-figreverify.run.generated.mjs` (figfix の prompt を流用し、agentType は critic だった) を汎用化した。prompt は再裁断図の検証用に書き直し、完全性チェック (§4 と同じ文面) を入れた。SCHEMA は figfix と同じなので、still-bad の結果をそのまま figfix-apply に渡せる。`args.model` 既定 `opus`、**`args.agent_type` 既定 `oh-my-claudecode:verifier`** (figfix critic とは別 type)。ROOT の直書きなし |
| `scripts/quiz-figfix-apply.mjs` | `--results` に workflow の戻り値 `{results:[…]}` と配列そのもの (journal 由来) のどちらも受けるようにした |

確認: workflow 2 本は async で包んで `node --check` → OK。manifest / apply も `node --check` → OK。偽の結果 (配列形式 / {results} 形式) を使った apply `--dry` は、どちらも `recrop 1 / skip 1` で同じ結果になった。偽の結果から reverify manifest を作れることも確認した (確認後に削除)。`question_bank.json` の md5 は不変。

## ⑨ 記録 (backlog)

- N3: figfix-apply は `byId.get(r.id)` で question id を前提にしている。choice 図 (webp key ≠ question_id) を将来 C track に入れると "not in raw bank" で skip される。今回は choice 0 件で実害なし。候補外 263 枚 (choice 24 を含む) の手当てと併せて検討。
