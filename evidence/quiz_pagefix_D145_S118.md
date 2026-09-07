# evidence — D-145 `source.figure_page_image` 実装 (Session 118, 2026-09-07)

- **決定**: `docs/decisions/D-145-figure-page-pointer.md` (Locked S118, ユーザー gate = S118 log §15 の ⑦-2)
- **writer**: d145-writer / Rule D reviewer は別 `subagent_type` で後追い
- **射程**: raw 層 (`data/ip/exams/question_bank.json` + `by_year/*.json`) と pipeline script のみ。
  `data/ip/quiz/questions.json` / web app / TS 型は**無変更** (§4 参照)

---

## 1. 何を変えたか

| 種別 | ファイル | 行 | 内容 |
|---|---|---|---|
| 新規 | `docs/decisions/D-145-figure-page-pointer.md` | — | ADR (背景 / 決定 §1–§7 / 理由 / 却下 5 案) |
| 新規 | `scripts/quiz-pagefix-apply.mjs` | — | 判定 JSON → raw 2 層への冪等・assert-once 適用器 (`--dry-run` / `--self-test` / `--only`) |
| 新規 | `scripts/quiz-pagefix-derive-groups.mjs` | — | 中問共有図から図ページ判定を決定的に導出 (`--check` / `--assert-clean` / `--print`) |
| 新規 | `evidence/phase5/stage_06_quiz_fidelity/pagefix_S118_groups_derived.json` | — | その導出結果 (35 件、適用時点の記録) |
| 新規 | `evidence/quiz_pagefix_D145_S118.md` | — | 本ファイル |

### 図側消費 — `figure_page_image ?? page_image` に変更 (10 script)

| ファイル | 行 | 変更 |
|---|---|---|
| `scripts/quiz-phase2-prep.mjs` | 58–68 / 103–107 / 124 | `figPageById` / `qPageById` の 2 map。`figure_page_png` = 図ページ、`question_page_png` 併記 |
| `scripts/quiz-phase1-prep.mjs` | 51–61 / 101–105 / 118 | 同上 |
| `scripts/quiz-phase2-ruleA-prep.mjs` | 51–64 / 111–112 | 同上 (`questionPagePngOf()`) |
| `scripts/quiz-phase1.5-prep.mjs` | 81–88 / 106 | `figPageRel` / `questionPagePng` |
| `scripts/quiz-phase1.5-ruleA-prep.mjs` | 109–113 / 125 | 同上 |
| `scripts/quiz-keyaudit-prep.mjs` | 44–52 / 62 | 同上 (盲導出に題幹ページも渡す) |
| `scripts/repair-figures-prep.mjs` | 39–45 | `page_path` / `page_number` を図ページ基準に |
| `scripts/stage026-fig-prep.mjs` | 39–47 | 同上 |
| `scripts/audit-figkey-manifest.mjs` | 50–51 | `resolvePaths()` の `pageRel` を図ページ基準に |
| `scripts/quiz-figfix-apply.mjs` | 24–29 / 58 | sharp 裁断元を `figurePageRel()` に (`PAGE_OVERRIDE` は最優先のまま) |
| `scripts/stage026-build-worklist.mjs` | 20–22 | 図の作業票なので `page_image` / `page_number` を図ページ基準に |

### 書き手側 — 設問ページを潰さない (2 script)

| ファイル | 行 | 変更 |
|---|---|---|
| `scripts/repair-figures-finalize.mjs` | 76–92 | 旧: `q.source = {page_image: 図ページ, …}` で**丸ごと上書き**。新: `source.figure_page_*` に書き、`page_image` は不変。図ページ == 設問ページなら `figure_page_*` を削除 |
| `scripts/stage026-fig-finalize.mjs` | 86–100 | 同型の欠陥。同じ形に是正 |

この経路で `page_image` が図ページに置き換わった既存 5 問 (`figure_source_corrected` = `2009h21a-q093` /
`2009h21h-q097` / `2014h26a-q099` / `2014h26h-q061` / `2015h27h-q089`) は D-145 §6 のとおり遡及せず、⑦-1 の実読定案に回した。

### crosscheck (`scripts/quiz-keys-crosscheck.mjs`)

- 頭注 L34–41 を更新 (B6 拡張 + B7 新設の根拠)。
- **B6** (L259–268): `source` 丸ごと比較に加え `source.figure_page_image` / `source.figure_page_number` を**名指しでも** bank == by_year 比較。
- **B7** (L269–288、新設): `page_image` は `pages/<exam>/page-NN.png` 形・exam が id と一致・`NN == page_number`・PNG 実在。
  `figure_page_image` があれば (a) `page_image` と異なる (b) `figure_page_number` と対 (c) 同じ形式検査 (d) 図を持つ問であること。片肺も fail。
- 最終行 `✓ all invariants hold (A1–A7, B1–B7)` (raw 有時)。`--committed-only` は `(A1–A7)` のまま = vitest の期待文字列不変。

### 設問側 — 意図的に無変更 (実測で確認)

`quiz-s7x-fidelity-prep.mjs:47` / `audit-stem-manifest.mjs:58` / `quiz-fidelity-prep-any.mjs:29` /
`stage027-build-manifest.mjs:34` / `stage027-blind-diff.mjs:64` / `quiz-ocr-cleanup-S101.fixes.mjs:226` は
`source.page_image` (= 設問ページ) のまま。`grep -rn "source?\.page_image"` の残存はこの 6 件 +
既実行済の history script (`quiz-pagefix-S115-*.mjs` / `quiz-fidfix-S115f-ruleA.mjs`、Rule B により不変) のみ。

---

## 2. 消費者一覧 (D-145 §背景の表を実装後の状態で再掲)

| 派 | 読む先 | script |
|---|---|---|
| 設問ページ | `source.page_image` | s7x-fidelity-prep / audit-stem-manifest / fidelity-prep-any / stage027-build-manifest / stage027-blind-diff / ocr-cleanup-S101 |
| 図ページ | `source.figure_page_image ?? page_image` | phase2-prep / phase1-prep / phase2-ruleA-prep / phase1.5-prep / phase1.5-ruleA-prep / keyaudit-prep / repair-figures-prep / stage026-fig-prep / audit-figkey-manifest / figfix-apply / stage026-build-worklist |
| 書き手 | `source.figure_page_*` (page_image は不変) | repair-figures-finalize / stage026-fig-finalize / **quiz-pagefix-apply (新)** |

---

## 3. 適用 — 2 批・計 70 件

### 3-0. 批 1 — ⑦-1 の実読判定 (35 件)

入力: `evidence/phase5/stage_06_quiz_fidelity/pagefix_S118_decisions.json` (⑦-1 scout 産出、最終版 35 件 =
SPLIT_FIGURE 15 / KEEP 20 / MOVE_QUESTION 0、各件に `bbox_check {verdict, proposed_bbox_pct, issue}`)。

`--dry-run` → 実行 → 冪等再実行、いずれも例外ゼロ:

| 相 | dry-run | 実行 | 2 回目 (冪等) |
|---|---|---|---|
| source (ポインタ) | 適用 14 / 既適用 1 / KEEP・no-op 20 | 同左 | 適用 0 / **既適用 15** / no-op 20 |
| bbox (裁断枠) | 適用 11 / 既適用 0 / 据置 24 | 同左 | 適用 0 / **既適用 11** / 据置 24 |

書込層: `question_bank.json` + `by_year/{2009h21h, 2011h23tokubetsu, 2012h24a, 2012h24h, 2013h25h, 2014h26a, 2014h26h, 2015h27h, 2017h29a}.json`。

### 3a. `figure_page_*` を持つ 15 問 (2900 問中 = D-145 §3「跨ページだけ」)

```
2009h21h-q097  2012h24a-q093/094/095/096  2013h25h-q097/098/100
2014h26a-q089/090/091  2014h26h-q089  2015h27h-q089/090/092
```

うち**設問ページも同時に是正**した 3 問: `2009h21h-q097` (42→43 / 図 42)・`2014h26h-q089` (38→39 / 図 38)・
`2015h27h-q089` (38→39 / 図 38)。

**正典事例 `2009h21h-q097` — S115 が表現できなかったものが表現できた**:

| レーン | 見るページ | 中身 |
|---|---|---|
| 図側 (`figure_page_png`: phase2-prep / keyaudit-prep) | **page-42** | 中問C 前文 + 表 平均作業時間 = `figure_bbox_pct` の基準ページ |
| 設問側 (`source.page_image`: s7x-fidelity-prep 等) | **page-43** | 問97 の題幹と選択肢 (1/8, 5/36, 1/6, 2/9) |
| 新 `question_page_png` (跨ページ時のみ) | **page-43** | 図レーンにも題幹ページを渡す |

### 3b. bbox 是正 11 問 → 再裁断 → WebP

裁断は provenance に合わせて 2 系統。**単独図 7 件**は素の extract
(`box = (trunc(x1·w), trunc(y1·h), trunc(x2·w), trunc(y2·h))` — この式が既存 crop **7/7** の寸法を逐一再現することを
事前実測。旧 `crop-and-update.mjs` の PIL `int()` 式と同値、D-110 に従い sharp で実装)。
**中問共有図 1 組**は `groups.json` の `shared_figure` を再裁断 (trim + 16px pad) して全メンバーに複製し、
`shared_figure.bbox_pct` を更新 (D-120 の単一真相源を保つ)。旧 PNG は `*.pre-D145.bak` に退避 (Rule B)。

```
単独図 7:
  2009h21h-q097          page-42  718x423   → 876x288
  2011h23tokubetsu-q093  page-36  1208x1314 → 1138x657
  2012h24h-q089          page-37  1247x1053 → 917x278
  2014h26h-q089          page-38  1261x1216 → 688x942
  2017h29a-q097          page-38  1160x1053 → 1146x409
  2013h25h-q099          page-48  1045x709  → 1059x486
  2014h26h-q090          page-39  1318x1418 → 1090x797
中問共有図 1 組:
  2012h24a-mqC           page-41  → 1052x454 (trim+pad) → q093/q094/q095/q096 に複製
```

`node scripts/build-quiz-figures.mjs` 実行後、`apps/web/public/quiz-figures/` **521 件中ちょうど 11 件が変化**
(消滅 0 / 新規 0)。変化したのは上記 11 問と完全に一致:

```
2009h21h-q097.webp 5516B          2011h23tokubetsu-q093.webp 30060B
2012h24a-q093/094/095/096.webp 64302B (共有図なので 4 件同値)
2012h24h-q089.webp 78618B         2013h25h-q099.webp 54916B
2014h26h-q089.webp 104890B        2014h26h-q090.webp 60324B
2017h29a-q097.webp 89014B
```

**ポインタだけ動いた 14 問の WebP は不変** — 「図の実体はもともと正しいページから切られていた」ことの機械的裏づけ
(主 context の予測どおり)。**目視確認は Rule D reviewer に委ねる**。対象パス:
`apps/web/public/quiz-figures/{2009h21h-q097, 2011h23tokubetsu-q093, 2012h24a-q093, 2012h24a-q094, 2012h24a-q095,
2012h24a-q096, 2012h24h-q089, 2013h25h-q099, 2014h26h-q089, 2014h26h-q090, 2017h29a-q097}.webp`
(旧版は `data/ip/exams/figures/<id>.png.pre-D145.bak` / `figures/_groups/2012h24a-mqC.png.pre-D145.bak`)。

### 3c. 批 2 — 中問の共有図を **実読なしで決定的に**導出して適用 (35 件)

`quiz-chumon-recrop-D144s3ii.mjs` は共有図を組のページから裁断してメンバーに複製し、メンバーの
`figure_bbox_pct` にも組のページ基準の bbox を書く。一方メンバーの `source.page_image` は各自の設問ページ。
「そのメンバーの図が組の共有図そのもの」は `figure_type === "shared"` かつ `figure_bbox_pct` が
`shared_figure.bbox_pct` と**逐字一致**することで機械的に確認でき、そこから図ページが決定的に従う。

新規 `scripts/quiz-pagefix-derive-groups.mjs` がこの導出を行い、
`evidence/phase5/stage_06_quiz_fidelity/pagefix_S118_groups_derived.json` を書く。抽出結果:

| 区分 | 件数 | 備考 |
|---|---|---|
| **SPLIT_FIGURE として出力** | **35** | 10 exam (2009h21a 2 / 2009h21h 2 / 2011h23tokubetsu 2 / 2012h24a 3 / 2013h25a 5 / 2013h25h 3 / 2014h26a 3 / 2014h26h 1 / 2015h27a 6 / 2015h27h 8) |
| 既に整合 | 12 | 批 1 で適用済 or 元から同ページ |
| `type != shared` で除外 | **0** | 曖昧例なし |
| bbox 不一致で除外 | **0** | 曖昧例なし |
| group 未解決 | 2 | `2015h27h-q090/q092` の `figure_group: "sibling:2015h27h-q089"` は疑似 id。批 1 で処理済 |

適用 (dry-run → 実行 → 冪等):

```
(dry-run) source 相: 適用 35 / 既適用 0 / KEEP・no-op 0 ; bbox 相: 適用 0 / 据置 35
(実行)    同上 ; 層 = question_bank.json + by_year/{10 exam}.json
(2 回目)  source 相: 適用 0 / 既適用 35        ← 冪等
```

bbox は組の値のまま据置なので、**図 PNG も WebP も 1 件も変わらない** (`git status` の WebP 差分は批 1 の 11 件のみ)。
ポインタだけが真実に合った。**合計 50 問 / 2900** が `figure_page_*` を持つ。

**常設ゲート `--assert-clean`**: 未整合の中問メンバーが 1 件でもあれば exit 1。
反向核験 — `2009h21a-q098` の `figure_page_*` を削除 → `✗ 図ページが未整合の中問メンバーが 1 件ある` / exit 1、
復元 → `✓ 中問の共有図メンバーは全員 figure_page が組のページと整合 (D-145)` / exit 0。
(`--check` は**適用前専用**。適用後は導出 0 件になるため 35 件の記録ファイルとは一致しない — 想定どおり。)

### 3d. 検証 — 新ポインタは裁断の実際の出所と一致する (7/7 md5 逐字一致)

適用済メンバー 7 件について、`figure_page_image` + `figure_bbox_pct` から chumon-recrop 式
(round extract → `trim(40)` → 16px 白パディング) で裁断し直し、既存の図 PNG と比較した。
対照として同じ bbox を**旧ポインタ (設問ページ)** に当てた結果も出す。

| id | 設問頁 / 図頁 | 新ポインタで裁断 | 旧ポインタで裁断 |
|---|---|---|---|
| `2009h21a-q098` | 41 / 40 | **md5 一致** 1099x1140 | 寸法違い 1129x1134 |
| `2009h21h-q089` | 35 / 34 | **md5 一致** 437x354 | 寸法違い 564x397 |
| `2011h23tokubetsu-q097` | 40 / 39 | **md5 一致** 1092x683 | 寸法違い 1130x699 |
| `2012h24a-q085` | 34 / 33 | **md5 一致** 881x376 | 寸法違い 963x280 |
| `2013h25a-q093` | 40 / 39 | **md5 一致** 997x461 | 寸法違い 1063x448 |
| `2015h27a-q094` | 43 / 42 | **md5 一致** 1040x559 | 寸法違い 1119x448 |
| `2015h27h-q093` | 42 / 41 | **md5 一致** 687x785 | 寸法違い 748x503 |

**7/7 が「新ポインタでのみ既存図を再現」**。画素単位でも完全一致 (raw バッファ全走査で差 0)。
`figure_page_image` が裁断の実際の出所であることの、これ以上ない機械的裏づけ。

**この md5 照合が及ぶ射程 (Rule D 批 2 LOW-5 の訂正)**: 上の再現式は `quiz-chumon-recrop-D144s3ii.mjs` の
後処理 (trim + 16px pad) を前提にしている。批 2 の 35 問のうち **25 問**は同 script の SPEC に載る 12 組の
メンバーなのでこの式が当たるが、**残る 10 問 (5 組)** の PNG は `stage026-group-crop.mjs` 系の別の後処理で
作られており、**md5 は原理的に一致しえない**。この 10 問の裏づけは md5 ではなく **Rule D reviewer による
組ページの実読**である (指し先のページに当該の図が実在することを確認済):

| 組 | 図ページ (実読で確認) | メンバー |
|---|---|---|
| `2013h25a-mqB` | `pages/2013h25a/page-31.png` | q088 |
| `2015h27a-mqTech1` | `pages/2015h27a/page-36.png` | q087 |
| `2015h27a-mqTech2` | `pages/2015h27a/page-40.png` | q091, q092 |
| `2015h27h-mqA` | `pages/2015h27h/page-33.png` | q085, q086, q088 |
| `2015h27h-mqD` | `pages/2015h27h/page-44.png` | q097, q099, q100 |

つまり批 2 の 35 問は「md5 逐字一致 25 問 (うち 7 問を標本として実測) + 実読確認 10 問」で担保されている。
「md5 7/7」を 35 問全体の担保と読んではいけない。

### 3e. 適用しなかったもの (ADR §8)

- **多図参照 3 問** (`2014h26h-q090` / `2015h27h-q091` / `2014h26h-q091`): 自分の図は自ページだが題幹が別ページの図も引用。
  1 本のポインタでは表現できず、多図モデルは導入しない (ユーザー裁定)。`figure_page_*` は書かず backlog へ。
  ※ `2014h26h-q090` は bbox のみ BAD だったので裁断枠だけ是正した。
- **中問メンバー 5 問** (`2013h25h-q098/q100` / `2014h26a-q091` / `2015h27h-q090/q092`): scout は
  「題幹が図を引用しないので `has_figure=true` は過剰付与の疑い」と報告したが、**共有図を全メンバーに挂けるのは
  D-144 段 3 の意図的な設計**。`has_figure` は変更せず、組の他メンバーと同じく `figure_page_*` だけ書いた。

---

## 4. app / corpus への波及ゼロ (実測)

- `scripts/build-quiz-corpus.mjs` に `q.source` へのアクセスは **0 件** (`grep -n "\.source\b"` = ヒット無し)。
  `source_label` は `question_number` から作る別物。
- `data/ip/quiz/questions.json` のキー = `id, exam_id, topic_id, category, source_label, stem_jp, choices_jp,
  correct_answer, has_figure, figure, figure_type, terms` — `source` は**射影されていない** (`"source" in q` = false / 2900)。
- `apps/web/src` 全走査 (`*.ts` / `*.tsx`) で `page_image` / `page_number` / `figure_page` / `.source` のヒットは
  `textbook/validate.ts:182` の `source_figures` (教科書側、無関係) のみ。
- → **TS 型は追加不要**。app・questions.json・Layer A 不変式はいずれも無変更。

---

## 5. 変異試験 (Rule A — 「GREEN が本当に検出できる GREEN か」)

`question_bank.json` + `by_year/2009h21h.json` を scratch に退避 → 変異 → crosscheck → 復元 (md5 一致)。
**適用後の実データ**に対する 3 件 (適用前にも同型 6 件を実施し全て exit 1):

| # | 変異 | 期待 | 実測 |
|---|---|---|---|
| M1 | `figure_page_image` を `page_image` と同値に | B7(a) | `[B7] 2009h21h-q097: source.figure_page_image == page_image (pages/2009h21h/page-43.png) — 既定 (欠如) と同義で雑音。D-145 §1` / exit 1 |
| M2 | `figure_page_image` を存在しない `page-99.png` に | B7(b) | `[B7] … の PNG が存在しない` / exit 1 |
| M3 | bank だけ `figure_page_*` を削除 (2 層ずれ) | B6 | `[B6] source differs …` + `[B6] source.figure_page_image differs — by_year="…page-42.png" question_bank=null` + 同 `figure_page_number` / exit 1 |

適用前に実施した追加 3 件: `figure_page_number` を filename と不整合に → B7(c) exit 1 /
図を持たない問に `figure_page_image` → B7(d) exit 1 / `figure_page_number` だけ片肺 → B7 exit 1。

**復元確認**: `md5 -q question_bank.json by_year/2009h21h.json` が変異前と逐字一致、復元後 crosscheck GREEN。

## 5b. 回帰の否定 — 旧実装との逐語比較

`git show HEAD:scripts/quiz-phase2-prep.mjs` を一時復元し、**同一データ**で新旧の出力を比較 (2013h25h, 100 問):

```
OLD(HEAD) vs NEW 同一データ: 旧キー差分 0/100
figure_page_png 差分: 0
question_page_png 非 null: 0
```

理由: 適用前は 2900/2900 が `figure_page_image` 欠如のため `?? page_image` が恒等写像。
`quiz-phase1-prep` / `quiz-phase1.5-prep` / `quiz-keyaudit-prep` / `quiz-phase2-ruleA-prep` も実走し、
`question_page_png` は全件キー有・全件 null (100 / 23 / 22 / 32 問)。
`quiz-figfix-apply.mjs --dry` も実走 (recrop 25 / copy 1 / remove_figure 2 / skip 2、裁断元解決は正常)。

**正の証明** (図ページを注入して図側が本当に切り替わるか): q097 に `figure_page_image=page-41` を仮注入 →
`figure_page_png = page-41.png` / `question_page_png = page-42.png` / 設問側 `source.page_image = page-42.png`
と分離し、crosscheck も GREEN。復元後 md5 一致。

## 5c. 適用器の単体試験

`node scripts/quiz-pagefix-apply.mjs --self-test` = **24 assertions PASS** (実データ・実ファイル未参照)。
(A) source 相 14 件: MOVE_QUESTION (図あり / 図なし / `figure_bbox_rebased`)・SPLIT_FIGURE (設問ページ据置 / 同時移動)・KEEP・
KEEP なのに設問/図ページが動く判定の拒否・図==設問ページの拒否・図なし問への SPLIT_FIGURE 拒否・
`figure_page_number` 欠落拒否・旧ページ導出不能の拒否・未知 verdict の拒否・`question_page_number` 型検査。
(B) bbox 相 10 件: `bbox_check` 無し / OK / n\a は据置・BAD は `status` / `verdict` 両表記で proposed 採用・
proposed 欠落の拒否・`x1>=x2` の拒否・1 超過の拒否・未知 `bbox_check` 値の拒否・現在 bbox 不在の拒否。

---

## 6. ゲート

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` (full) | `questions=2900 exams=29 layerB=ran` / `✓ all invariants hold (A1–A7, B1–B7)` |
| `node scripts/quiz-keys-crosscheck.mjs --committed-only` | `✓ all invariants hold (A1–A7)` (vitest 期待文字列と一致) |
| `cd apps/web && pnpm vitest run` | **501 passed / 2 skipped** (基線どおり、増減なし) |
| `cd apps/web && pnpm tsc --noEmit` | 0 errors |
| `node --check` (変更 15 + 新規 2 = 17 script) | 全 OK |
| `node scripts/build-quiz-corpus.mjs` 後の `questions.json` | **逐字不変** (`source` / `figure_bbox_pct` は射影されない) |
| `quiz-pagefix-apply` 冪等再実行 (批 1 / 批 2) | 適用 0 / 既適用 15+11 / 既適用 35 |
| `quiz-pagefix-derive-groups --assert-clean` | `✓ 中問の共有図メンバーは全員 figure_page が組のページと整合` (反向核験で exit 1 も確認) |
| 再裁断 7 標本の md5 照合 | **7/7 新ポインタでのみ既存図を再現** (§3d) |
| `node scripts/quiz-pagefix-apply.mjs --self-test` | 24 assertions PASS |

---

## 7. 申し送り (Rule D reviewer へ)

1. **目視確認は未実施 — reviewer にお願いする**。再裁断した 11 図の新旧を並べて見てほしい。
   新: `apps/web/public/quiz-figures/<id>.webp` / 旧: `data/ip/exams/figures/<id>.png.pre-D145.bak`
   (中問組は `figures/_groups/2012h24a-mqC.png.pre-D145.bak`)。
   特に `2014h26h-q090` は旧枠 `{0.04,0.18,0.96,0.88}` が問89 の選択肢と問90 の題幹まで巻き込んでいた大幅な絞り込み。
2. **`question_page_png` は委託仕様外の付加**。`figure_page_png` を図ページに寄せると、跨ページ問で
   題幹ページを見る手段が prep 出力から消えるため足した。適用前は全件 null で出力逐字不変 (§5b で実証)、
   適用後は上記 15 問だけ非 null。不要と判断されれば 6 script から 1 行ずつ削れば戻せる。
3. **中問共有図の跨ページは全解消**。批 2 (§3c) で 35 件を決定的に導出・適用し、常設ゲート
   `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` が GREEN。新しい組を登録したり
   chumon-recrop を回した後は**このゲートを回すこと** (crosscheck には組み込んでいない — groups.json は
   raw 層で、`--committed-only` の CI では読めないため)。
4. **`figure_source_corrected` 5 問** (D-145 §6): `2009h21h-q097` は今回解消。残り 4 問
   (`2009h21a-q093` / `2014h26a-q099` / `2014h26h-q061` / `2015h27h-q089` のうち q089 も解消済 → 実質 3 問) は
   `page_image` が図ページを指したまま。実読で `question_page_number` を確定させ `quiz-pagefix-apply.mjs` に流す。
5. **ADR §8 の backlog 2 件**: 多図参照 3 問 (単一ポインタでは表現不能) と、中問メンバー 5 問の `has_figure`
   過剰付与疑い (D-144 段 3 の意図的設計として不変更)。どちらもユーザー裁定どおり触っていない。

---

## 8. Rule D 審閲 (別 subagent_type) → 条件付き PASS → 処置

| 級 | 指摘 | 処置 |
|---|---|---|
| **HIGH-1** | `2011h23tokubetsu-q093` の再裁断が 図1 冒頭の「開始」端子を落とした (新 y1=0.235 → 475px、端子は y≈368–412px) | **是正済**。判定 JSON の `proposed_bbox_pct.y1` を 0.235 → **0.175** (353px) に緩め (x1/x2/y2 据置)、`issue` に再訂正の経緯、`revision` フィールドを追記。`figure_bbox_pct_current` も適用済値に更新して assert-once を維持。`--only 2011h23tokubetsu-q093` で再適用 → 再裁断 1138x657 → **1138x779** → WebP 1 件のみ再生成。**新 WebP を Read で目視**: 「開始」端子・右端の `L＝−1`・`終了`・キャプション「図1 関数の処理の流れ図」まで全て在り、上端余白 15px で近傍本文の混入なし |
| **MEDIUM-2** | `crop-and-update.mjs:125,150` と `map-questions-to-pages.mjs:220,242` が `q.source` を丸ごと置換 → 再実行で 50 問の `figure_page_*` が**静かに全消**する (欠如が合法な既定値なので B7 でも捕まらない) | **是正済**。両 script に `setSource(q, next)` を追加し、既存キーを保って上書き (finalizer 2 本と同じ形)。さらに設問ページが図ページと同じになったら `figure_page_*` を既定 (欠如) に戻す (B7(a) の雑音を作らない)。4 サイト全て置換 |
| **LOW-4** | `repair-figures-finalize.mjs` / `stage026-fig-finalize.mjs` で図ページ == 設問ページ のとき `figure_page_*` は消すのに `figure_source_corrected` が残る | **是正済**。同じ枝で `delete q.figure_source_corrected` |
| LOW-3 | `2014h26h-q089` の裁断に 表1 と 図1 の間の前文 2 行 (切れた状態) が入る | **受容**。本問の union 枠 (表1 + 図1 の両方が解答に要る) の副作用で、間に挟まる行を除く枠は取れない。図の情報は欠けていない |

**MEDIUM-2 の証明** (実ファイル非改変、旧実装 = HEAD の丸ごと置換 / 新実装 = 現行 `setSource` を実データ標本に当てて比較):

```
✓ 2009h21h-q097   旧=消失 / 新=pages/2009h21h/page-42.png
✓ 2012h24a-q093   旧=消失 / 新=pages/2012h24a/page-41.png
✓ 2013h25a-q093   旧=消失 / 新=pages/2013h25a/page-39.png
✓ 2014h26h-q089   旧=消失 / 新=pages/2014h26h/page-38.png
✓ 2015h27h-q093   旧=消失 / 新=pages/2015h27h/page-41.png
✓ 図ページ == 設問ページ になったら figure_page_* を既定 (欠如) に戻す
判定: 6/6
```

**処置後のゲート** (全て再実行):

| ゲート | 結果 |
|---|---|
| `quiz-keys-crosscheck.mjs` (full) | `✓ all invariants hold (A1–A7, B1–B7)` |
| `quiz-pagefix-derive-groups --assert-clean` | `✓ 中問の共有図メンバーは全員 figure_page が組のページと整合` |
| `quiz-pagefix-apply` 全量再実行 | source 適用 0 / 既適用 15、bbox 適用 0 / 既適用 11 (**冪等**、y1 是正込み) |
| `quiz-pagefix-apply --self-test` | 24 assertions PASS |
| `pnpm vitest run` | **501 passed / 2 skipped** |
| `pnpm tsc --noEmit` | 0 errors |
| `node --check` (変更 17 + 新規 2 = 19 script) | 全 OK |

`2011h23tokubetsu-q093` 最終値: `source {page_image: page-36, page_number: 36}` (単独図、跨ページではない) /
`figure_bbox_pct {x1:0.13, y1:0.175, x2:0.93, y2:0.56}`。

---

## 9. Rule D 批 2 の指摘 → 処置

| 級 | 指摘 | 処置 |
|---|---|---|
| **ゲート欠落** | `--assert-clean` は中問の共有図メンバー 45 問しか守らず、散題 3 問 (`2009h21h-q097` / `2014h26h-q089` / `2015h27h-q089`) と `sibling:` 組 2 問には常設ゲートが無かった。`figure_page_*` を消しても crosscheck は GREEN のまま (欠如が合法な既定値なので B7 でも捕まらない) | **是正済**。`--assert-clean` を 2 本立てに拡張。**(A)** 中問の共有図メンバーが組のページと整合 + `sibling:<id>` は兄弟問の図ページを継承しているか (これで `group 未解決` が 2 → **0**)。**(B)** 委託済の判定 JSON 2 本 (`pagefix_S118_decisions.json` + `pagefix_S118_groups_derived.json`) の**全 SPLIT_FIGURE = 50 件**が、今も **bank と by_year の両層**で判定どおりの `figure_page_image` / `figure_page_number` を持つか。→ 射程 **50/50** |
| **LOW-5** | 「md5 7/7」が批 2 の 35 問全体の担保に読める。SPEC 外 5 組 10 問の PNG は別の後処理で作られており md5 は原理的に一致しない | **是正済**。§3d に射程を明記 (md5 担保 25 問 / 実読担保 10 問) + 5 組の図ページ表を追加 |

**拡張ゲートの変異試験** (scratch 退避 → 変異 → 復元 md5 一致):

| # | 変異 | 実測 |
|---|---|---|
| M1 | 散題 `2009h21h-q097` の `figure_page_*` を bank + by_year から削除 | `[B]` 2 件 / exit 1 |
| M2 | by_year 側だけ削除 (層ずれ) | `[B]` 1 件 / exit 1 |
| M3 | `sibling:` 組 `2015h27h-q090` の図ページを兄弟とずらす | `[A]` 1 件 + `[B]` 2 件 / exit 1 (兄弟継承則が効いている) |
| M4 | 散題 `2014h26h-q089` の `figure_page_number` を判定と違う値に | `[B]` 2 件 / exit 1 |

復元後: `✓ D-145 図ページ常設ゲート: (A) 中問の共有図メンバー全員が組のページと整合 / (B) 判定 JSON の SPLIT_FIGURE 50 件が bank・by_year 両層で判定どおり`

**処置後のゲート**: crosscheck full `A1–A7, B1–B7` GREEN / `--assert-clean` GREEN (射程 50/50) /
`pnpm vitest run` 501 passed 2 skipped / `pnpm tsc --noEmit` 0 errors / `node --check` 全 OK。
