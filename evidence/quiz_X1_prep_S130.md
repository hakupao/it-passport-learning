# X track X1 — 母数外 excluded 105 題 準備 (S130、prep lane)

X track は、⑤-2 母数 (`full52_population_S118.json`) から**除外されていた** 392 題 (`exams[].excluded[].id`) を IPA 源と再照合する工程。X1 はその 1 本目で、対象は 5 exam の excluded 105 題。手順は B13 (`evidence/quiz_B13_2009h21a_prep_S129.md`) / B5 と同じで、複数 exam にまたがるため `quiz-fidelity-prep-multi.mjs` を使った。

本書は**起動前の準備だけ**で、workflow はまだ起動していない。data lock は持っていない。
- 書いたもの: `.phase2/x1_*` (targets / manifest / workflow args)、precrop の出力、evidence 2 件 (本書 + named JSON)。
- 書いていないもの: `data/ip/quiz/` の本体 (questions / translations / explanations / chumon_groups)、bank (`data/ip/exams/`)。
- git add / commit はしていない。

**X track の前提**: 105 題はすべて、除外の時点で既に double pass を通っている。内訳は s7x_A_scope 62 / stage5_3_stratified 17 / note_scan_B 22 / 複合 4。このため、命中率は B track (母数外の初回全量) より低いと見込む。fixer は命中率をこの前提で評価する。

---

## 0. 起動前の注意 (阻害要因ではない)

- **`2015h27a-q086` は並行 lane と衝突する**。
  - recheck-fixer が、S130 recheck の S1 (stem 本文) と S2 (埋込表) を是正している最中。
  - manifest は本 prep の時点の表示層から作った。translations の `stem_jp_clean` には、作業中の S1 是正形がすでに入っている。
  - **起動直前に manifest を再生成する** (§4 の手順 1。冪等)。
  - apply が終わっていない状態で走ると、agent は S1 / S2 を再報告しうる。その場合、X1 fixer は**既知の重複**として扱う。
  - q086 の選択肢は p38 上部にある (S130 recheck で確定)。今回の manifest では `next_page_png` に p38 が入っている。
- **precrop の副作用**。
  - 5 exam の `precrop/<exam>/_precrop_report.json` を、X1 の範囲の内容で**上書き**した。
  - dir は a2a / a2c 等の lane が作った既存のもの (B13 とは違い、新規ではない)。PNG は追加しただけで、削除していない。
  - 上書き前の 5 dir は `/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/38b9b286-d572-4355-b63d-7392c68f7a4f/scratchpad/x1_precrop_backup/` に退避した。

## 1. 母数

| exam | excluded = X1 | 主な除外理由 |
|---|---:|---|
| 2015h27a | 32 | stage5_3 / s7x_A |
| 2016h28a | 16 | s7x_A / note_scan_B |
| 2016h28h | 34 | s7x_A / note_scan_B |
| 2017h29a | 8 | s7x_A |
| 2017h29h | 15 | s7x_A |
| **計** | **105** | |

- targets: `data/ip/quiz/.phase2/x1_targets_S130.json`。形は `{ exams: { exam: [qnums] }, reasons }`。
- **中問**: X1 の中問 member は 2015h27a の 8 題 (q085 / q086 / q089 / q090 / q095 / q096 / q098 / q100) だけ。2016h28a 以降は no_chumon_exams (S128 L2f)。
- **registry 登録**: 該当する 4 組 (mqA / mqB / mqC / mqD) はすべて登録済み。
  - 照合方法: probe を空白除去したうえで、次の 4 層を確認した。**8/8 × 4 層で一致**。
    - manifest の `displayed_stem_jp` と translations の `stem_jp_clean` が、probe.jp で始まる。
    - translations の `stem.zh` / `stem.en` に、probe.zh / probe.en が含まれる。
  - origin: mqA / mqB / mqC は `chumon_preamble_S128_a4_batch2.json`、mqD は `chumon_preamble_S117_batch2.json`。
- **見出しの残存は 0**。表示 jp / zh / en の stem・選択肢 (105 題) を走査し、「問NN」「问NN」「QNN」「中問」「中问」「Medium question」と分野見出しを探した。
  - A1 backlog の `1.head` (2015h27a-q089 jp/zh/en) は、現表示層には残っていない (A2a / A4 で処置済み)。
  - `2016h28a-q074` の 1.head は raw にだけ残っている。
- **前文の頁が source / prev に無い member** (agent が前文を「源に無い挿入」と誤報告しうる。既知型として扱う):
  - q086: 前文 p35。manifest は src 37 / prev 36 (図1) / next 38 (選択肢)。
  - q096: 前文 + 図1 p42。manifest は src 44 / prev 43。
  - q100: 前文 p45。manifest は src 47 / prev 46。
  - 他の 5 member (q085 / q089 / q090 / q095 / q098) は、前文頁が src か prev として見える。
- fixer の規則 (B4〜B13 と同じ): 前文 (probe 範囲) は単独で変えない。設問文側の部分一致で patch する。mqB の probe.jp の「、」は前文の字形の問題なので、D-167 に従って停止し、報告する。

## 2. manifest + precrop

```
node scripts/quiz-fidelity-prep-multi.mjs x1 data/ip/quiz/.phase2/x1_targets_S130.json --precrop --model sonnet --pass sn
```

- manifest: `data/ip/quiz/.phase2/x1_fidelity_input_multi.json` (105 samples / 5 exam)。exam 別の `x1_fidelity_input_<exam>.json` も同時に作った。
- 脚本で確認した項目 (不良は**すべて 0**):
  - stem 非空 / key ∈ ア〜エ / key = questions.json
  - `displayed_stem_jp` = 表示層 (`stem_jp_clean || stem_jp`)
  - `displayed_choices_jp` = questions.json の choices_jp
  - キー順 ア〜エ
  - bank の page_image = manifest の source
- **`next_page_png` 105/105**: S130 から prep-any が出力する。最終頁の題は無い。`prev_page_png` も 105/105。
- **precrop 93 / 105**

  | exam | crop | skip |
  |---|---|---|
  | 2015h27a | 24/32 | chumon 8 |
  | 2016h28a | 15/16 | merged_preamble q025 |
  | 2016h28h | 34/34 | — |
  | 2017h29a | 6/8 | merged_preamble q018 / q097 |
  | 2017h29h | 14/15 | page_mismatch page-25 → q057 |

  - calib (head / body): 2015h27a 150/210、2016h28a 150/210、2016h28h 140/210 (odd body 200)、2017h29a 140/200、2017h29h 140/200。
  - ok 頁は 90 頁で、すべて verified、unconfirmed 0。
  - **merged_preamble の 3 題は中問ではない**。表示 stem に、AI による図の言語化 (組織図 / ロードマップ表 / マトリクス表) が付いている題。skip は安全側の動き。
  - **2017h29h page-25**: 見出し 3 本 (問57〜59) がすべて x≈134 に左寄りで、検出できたのは 2 本。目視の結果、問57 の stem と選択肢は page-25 にある。
  - **数字の OCR 誤読を sameQnum が許容した頁が 11 頁**ある (30→36、60→69、20→26、50→59、100→109 等)。自分の見出しが誤読された crop は `2016h28a-q060` / `2016h28h-q020` / `2017h29h-q050` の 3 つで、目視の結果どれも正しい帯だった。
- **page pointer: 誤り 0**。
  - 現 bank (S130 pagefix 後) に対して `quiz-pageoffset-scan-S129.mjs` を再走査した (OCR cache は S129 のものを流用)。5 exam とも MISMATCH 0 / LOW_CONF 0。
  - X1 の候補行 11 件はすべて verdict OK で、記録頁 = manifest の source 頁。
  - CHOICES_NEXT の扱い:
    - 真の陽性は q086 だけ (§0)。
    - 2015h27a-q015 / q095、2016h28a-q041 / q082、2016h28h-q052、2017h29h-q050 は、短い数値の選択肢による bigram の FP。このうち q041 / q082 / q052 / q050 は、crop を目視して選択肢が帯の中にあることを確認した。
  - MAP_DISAGREE 5 件 (2015h27a-q100、2016h28a-q060、2016h28h-q001 / q018、2017h29h-q050) は、stem の一致率 0.75〜0.98 から記録頁が正しい。
    - q018 (0.75 で最も低い) も、OCR verified の ok 頁 page-09 で crop 済み。

## 3. 名指し項目 → `evidence/quiz_X1_named_S130.json`

核験 agent の prompt には入れない。読むのは fixer と reviewer。

**A1 backlog**
- 件数: 候補 449 件 / 52 題。high は 189 件 / 36 題。resolved は 47 件。**未処置の high は 145 件 / 35 題**。
- resolved の内訳:
  - raw だけの 0q.prose: 44 件 (B7 の規則)
  - 表示層から見出しが消えた 1.head: 3 件 (X1 で追加した規則)
- 分類器は B 系の priority_rule をそのまま使った (named JSON に原文を収録)。
- `2016h28h-q096` の 0q.prose (選択肢の LIKE パターン `"%子"` 等、jp / zh 計 12 件) は、D-151 の式・検索式除外と同じ型とみて、**low に下げた**。同題の 7.space 5 件は、表の氏名の姓名間空白で、FP の公算が大きい。
- 未処置の high の上位: `2017h29a-q097` 16 / `2016h28a-q075` 16 / `2015h27a-q086` 14 / `q085` 9 / `2017h29h-q069` 9 / `2015h27a-q100` 9 / `q089` 8。
  - 大半は FP。ends96 は表の値 (マトリクス表やワークシートの数値)、0a.* は言語化 clean と raw の差。
  - 真の欠陥は q100 (下記)。

**源で確定した是正** (本 prep で目視。どれも key には影響しない):
- **`2015h27a-q100`** (high): 表示 jp / zh / en の stem に問題が 2 つある。
  1. 源に無い AI の挿入段落がある。「Aさんは,これまで使用していたPCを処分することにした。Aさんが処分する機器のうちHDDを内蔵するのは,次の2台である。・8Gバイト… ・40Gバイト… Aさんは,HDD内のデータを…処分する。」という内容で、HDD を内蔵する機器を特定してしまっている。これは学習者の読解を先取りするもので、D-168 の趣旨にも掛かる。
  2. stem の末尾に選択肢行「ア 120　　イ 140　　ウ 220　　エ 240」が重複している (en は a)〜d))。
  - 源 page-47 の問100 は「Aさんが処分するPCにおいて，専用ソフトの説明書によって…」から始まる。
  - 前文 (probe 範囲) には触れず、設問文の側で是正する。
- **`2017h29a-q097`** (medium):
  - マトリクス表の数値 64 セルは、源 page-38 と一致する。
  - ただし網掛け (記憶した位置) と矢印 (順序) が言語化されておらず、注記だけが残っている。図が添付される前提であれば可。
  - raw は「5825」だが、表示は源どおり「5025」。
- **`2016h28a-q075`** (low): パス “．．￥．．￥DIRB￥Fn.txt” 等が全角ピリオドになっている。源は半角の “..¥..¥DIRB¥Fn.txt”。木構造の言語化は crop と一致する。
- **`2016h28h-q020`** (low): 表の「法人税、住民税…」の「、」は、源では「，」。

**answer_affecting の疑い: なし**。44 題を表示層 (図に依存する題は源 / crop) から再導出し、すべて一致した。導出の内容は named JSON の `answer_affecting_suspects.rederived` にある。
- 対象:
  - 計算題・表題・図題
  - 2015h27a の中問 8 題
  - 2016h28a-q041 / q060 / q074 / q075 / q082 / q093
  - 2016h28h の 11 題
  - 2017h29a の 5 題
  - 2017h29h の 6 題
- 2015h27a-q089 は、図1 の数値 20 セルも検算して一致した。

**答え漏洩: 0**。
- regex: 正解 / 不正解 / 正答 / 正しい図 / 正确图 / 错误图 / 答案 / correct answer / correct figure 等で、3 層の stem・選択肢を走査し、0 hit。
- D-163 / D-168 型: AI の言語化が、題の問う読解を代替していないかを 14 題で目視した。対象は図を言語化した選択肢 (2016h28a-q060、2016h28h-q080、2017h29a-q003 / q092、2017h29h-q069) と、図・流れ図・DFD を言語化した stem (2015h27a-q008 / q048、2016h28a-q025 / q075、2016h28h-q033 / q078、2017h29a-q018 / q097、2017h29h-q021)。
- **どれも漏洩なし**。題ごとの判定は named JSON の `answer_leak.reviewed` にある。q100 の AI 挿入は、上記の是正項目として扱う。

**字形 (D-155 / D-162 で fixer が判断)**:
- 散文の半角「, 」: 62 題。
- 全角数字: 0。
- 「、」: 36 field (named JSON に一覧)。
- ASCII `"`: 2016h28h-q096 の選択肢 3 件だけ (上記)。
- mqB の前文と q089 の設問文は「、」、q090 の設問文は「，」。前文は probe 範囲 (D-167)。
- 選択肢 jp の先頭の「[表] 」ラベル (q054 / q055 / q075 / q093 / q044 / q048 等) は既存の運用なので、追わなくてよい。

## 4. Workflow 起動引数

- args file: **`data/ip/quiz/.phase2/x1_workflow_args_multi.json`**
  - `input_path` = `data/ip/quiz/.phase2/x1_fidelity_input_multi.json`
  - `exam_id` = `"multi"`
  - `ids` = 105
  - `model` = `sonnet` / `pass` = `sn` / `label` = `x1`
  - `out_path` = `evidence/phase5/stage_06_quiz_fidelity/x1_fidelity_multi_sn.json`
  - `parts_dir` = `data/ip/quiz/.phase2/fidparts/x1_multi_sn`
- 起動直前の手順:
  1. 同じコマンドで manifest を作り直す (冪等、0 token)。q086 の並行是正と、先行 unit の apply に備える。
  2. `next_page_png` が 105/105 あることを確かめる。
- run の後:
  1. `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/x1_multi_sn data/ip/quiz/.phase2/x1_fidelity_input_multi.json multi <out> --journal <journal.jsonl>`
  2. `node scripts/quiz-fidelity-machdiff.mjs <input_path> <out>`

## 5. 見積もり

| 項目 | 値 | 根拠 |
|---|---|---|
| agent | 105 (Sonnet 5、1 題 1 体) | B 系と同じ形 |
| token | ≈ 600 万 (550〜650 万) | B13 の見積もり 640 万 (100 題、crop 無し 44 題) を基準にした。X1 は crop 無しが 12 題と少ないが、中問の stem が長い (q086 の jp は 2,039 字、q085 は 1,609 字) |
| 後段 | fixer opus 1 + reviewer opus 1 (別 type) | S122 §0 |

## 6. 阻害要因

- **なし**。§0 の manifest 再生成は通常の手順。
- 脚本のエラーは 0。警告は 2017h29h の page_mismatch 1 頁だけで、目視で原因を確定した。
- page pointer の誤り 0、見出しの残存 0、答え漏洩 0、key と矛盾する題 0。
- 源で確定した是正は、high 1 件 (2015h27a-q100) + 既知 1 件 (q086、並行 lane)。
