# Phase 3b 試点 u02 — 生成 attempt 1 (JP 審査で停止)

- 日期: 2026-10-27 (S135)
- 输入: `scripts/textbook-v2.workflow.mjs` (commit `2bcc4c3` + fixture `4c5b82e`)、args `{unit: management-10-27-u02, run_tag: s135u02a}`、Workflow run `wf_8159b4c0-48e`。manifest `data/ip/textbook/.planning/v2/management-10-27-u02/manifest.json` (361,103 B、関連過去問 105、中問組員 27、用語 4: プロジェクトスコープマネジメント / WBS / アローダイアグラム / ガントチャート)。
- 产物 (gitignored、題文を含むため evidence に複製しない):
  - `.../parts/s135u02a/management-10-27-u02.jp.r0.json` sha256 `46513f44…44b1` (terms 4 / figs 4 / steps 8 / points 16 / pairs 2 / key_points 5 / goals 3)
  - `.../parts/s135u02a/management-10-27-u02.jp.r1.json` sha256 `6bd077fa…a87` (points 17)
  - journal 退避 `.../management-10-27-u02/journal.s135u02a.jsonl` (審査意見の全文はここ)
- 技术判定: status `jp-rejected`。validate 0 issue (両 round)、copy 機械検査 0 (20 字未満)。JP 審査 (critic opus) round 1 = REVISE (high 5 / medium 5 / low 6)、round 2 = REVISE (high 0 / medium 5 / low 8)。訳段階には進まず。
- 业务判定: 審査は妥当 (緩めない)。指摘は 3 型に集約:
  1. **過去問の文への寄りかかり** — 題文・選択肢・解説の語順や文型をなぞり語句だけ置換 (r0 high 5 件、r1 でも medium 2 件)。20 字閾値の機械検査では捕まらない言い換え型。
  2. **考点が引用 qid の正解と矛盾 / 根拠のない規則** — 例: スコープに入る事項の列挙が引用題の正解と合わない、「WBS の分け方の観点は段ごとに 1 つ」は出題データに反する、考点の「誤答に並ぶ図」が引用題と不一致。
  3. **未定義語の先行使用** — 結合点・矢線・最遅結合点時刻を定義前に使用。
  他: JP 本文での `[[jp:…]]` 使用 (zh/en 専用記法)、語源の言い過ぎ、hook が記法説明になっている等 (low)。
- 下一 attempt 的输入: (a) writer prompt: 用語ごとにシラバス目標と見出し語から先に書き、過去問は事実確認と qid 付けにだけ開く / 文型・語順が過去問と重なったら事実から書き直す / exam 考点は引用題の正解と一致を確認 / 用語は定義してから使う / `[[jp:]]` は JP 禁止 (validateV2 で機械検査も)。(b) round 0 を r1 + round-2 審査を種にした改稿から始める (`seed_part` / `seed_review`、journal に seed sha256)、新 run_tag `s135u02b`。(c) attempt 2 も停止したら、manifest を薄く (題文 + 正解 + 1 行事実、解説文なし) して再実行、D-195 に「出題文の構文をなぞらない」規則追加を検討。
