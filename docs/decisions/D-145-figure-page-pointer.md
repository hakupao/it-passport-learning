# D-145 — `source` に **図ページの独立ポインタ** を追加する (`figure_page_image` / `figure_page_number`)

- **Status**: Locked (Session 118, 2026-09-07)
- **ユーザー gate**: S118 §15。ユーザーが backlog ⑦ の閉じ方として **⑦-2 (フィールド追加) + ⑦-1 (12 件実読定案) 同時**を選択。
  ⑦-3 / ⑦-4 は却下 (下表)。本 ADR は ⑦-2 の schema と消費規則を固定する。
- **Supersedes / relates**: S115 の `quiz-pagefix-S115-*` (単一ポインタのままページを是正 → `2009h21h-q097` で回退)、
  `quiz-fidfix-S115f-ruleA.mjs:77` (その回退)、D-120 `groups.json` の `shared_figure` (図ページを独立に持つ先行モデル)。

---

## 背景 — `source.page_image` が「設問ページ」と「図ページ」を兼ねる単一ポインタ

`scripts/map-questions-to-pages.mjs:~220` が書く `source` は

```json
{ "page_image": "pages/<exam>/page-NN.png", "page_number": NN, "question_bbox_pct": {…} }
```

の 1 組しかない (S118 実測: 2900/2900 が `page_image` + `page_number` の 2 キーのみ。
`question_bbox_pct` は現データに 0 件 — `crop-and-update.mjs:125,150` が後から `source` を 2 キーで上書きするため)。
この 1 個のポインタを**二派の消費者が別々の意味で読んでいる**:

| 派 | 何として読むか | 消費者 (S118 実測) |
|---|---|---|
| 設問ページ派 | 設問文・選択肢が印刷されたページ | `quiz-s7x-fidelity-prep.mjs:47`・`audit-stem-manifest.mjs:58`・`quiz-fidelity-prep-any.mjs:29`・`stage027-build-manifest.mjs:34`・`stage027-blind-diff.mjs:64`・`quiz-ocr-cleanup-S101.fixes.mjs:226` |
| 図ページ派 | `figure_bbox_pct` の基準ページ / vision に渡す図の全景 | `quiz-phase2-prep.mjs:62,113`・`repair-figures-prep.mjs:40`・`stage026-fig-prep.mjs:40`・`audit-figkey-manifest.mjs:51`・`quiz-phase1-prep.mjs:55`・`quiz-phase1.5-prep.mjs:81`・`quiz-phase1.5-ruleA-prep.mjs:109`・`quiz-phase2-ruleA-prep.mjs:55`・`quiz-keyaudit-prep.mjs:44`・`quiz-figfix-apply.mjs:54` (sharp 実裁断) |

`figure_bbox_pct` は `page_image` 相対の比率なので、**設問ページを直すと図の裁断がずれる**。
これが S115 の回退の原因である (`docs/discussion/2026-09-04-session-115.md` ~L640 / ~L723、S118 log §2):

- `2009h21h-q097` は **設問文が page-43、図 (表 通販業務の平均作業時間) が page-42**。
- `quiz-pagefix-S115-2009h21h.mjs` が 42→43 に是正 → `figure_bbox_pct {0.25,0.39,0.75,0.6}` が page-43 の何も無い領域を指し、
  さらに `quiz-phase2-prep.mjs:113` が page-43 (= 問98 のグラフページ) を `figure_page_png` として vision に渡す状態になった。
- `quiz-fidfix-S115f-ruleA.mjs:77` が **42 に差し戻し**。以来「設問 43 / 図 42」は**表現不能**のまま。

同型の書き手側の欠陥も実測された: `repair-figures-finalize.mjs:78-81` / `stage026-fig-finalize.mjs:87-92` は
コメントに「cross-page specials: the figure lives on a different page than originally mapped」と書きながら、
図の実ページで `q.source` を**丸ごと上書き**する (= 設問ページを潰す)。この経路で書かれた `figure_source_corrected`
は S118 実測 **5 問** (`2009h21a-q093` / `2009h21h-q097` / `2014h26a-q099` / `2014h26h-q061` / `2015h27h-q089`) で、
これらの `page_image` は現在**図ページ**を指している (= 設問ページの記録が失われている)。

---

## 決定

### §1 schema — `source` に 2 つの任意フィールドを足す

```json
"source": {
  "page_image": "pages/<exam>/page-43.png",         // 設問ページ (必須、既存のまま)
  "page_number": 43,
  "figure_page_image": "pages/<exam>/page-42.png",  // 図ページ (任意)
  "figure_page_number": 42
}
```

- **欠如 = `page_image` と同じ**。既定値であって「不明」ではない。
- `figure_bbox_pct` の意味を **図ページ相対**に固定する (これまでは「`page_image` 相対」= 兼用ポインタ相対だった)。
  図ページが省略されていれば両者は同一なので、既存 2900 問の解釈は 1 ビットも変わらない。
- `figure_page_*` は**図を持つ問にだけ**置く。図の無い問に置くのは雑音 (§5 の B7 が落とす)。

### §2 消費規則 — 派ごとに読む先を固定

- **図側**: `source.figure_page_image ?? source.page_image` / `source.figure_page_number ?? source.page_number`。
  §1 の背景表の「図ページ派」10 script を全部この形にする。`figure_bbox_pct` を sharp に渡す経路 (`quiz-figfix-apply.mjs`) も同じ。
- **設問側**: `source.page_image` のまま。変更しない。
- vision に page PNG を渡す prep 系 (`figure_page_png` を出す 6 script) は、**図ページが設問ページと異なるときに限り**
  付加キー `question_page_png` を併記する。同一のとき (S118 時点で 2900/2900) は `null` なので出力は逐字不変。
  「図は figure_page_png、題幹は question_page_png」を prep 層で明示するのが、跨ページ問で
  「stem 復元レーンが図ページだけ見る / 図レーンが設問ページだけ見る」事故を防ぐ唯一の場所である。
- **書き手側**: 図の実ページを学習した finalizer (`repair-figures-finalize` / `stage026-fig-finalize`) は
  `page_image` を上書きせず `figure_page_image` / `figure_page_number` を書く。`source` の他キーも破壊しない。

### §3 大量移行しない

2900 問に既定値を書き込むことは**しない**。`figure_page_*` は **設問ページ ≠ 図ページ の問にだけ**現れる。
理由: 既定 = 欠如なので冗長であり、2900 行の diff は退行検知を潰す。「フィールドがある = 跨ページ」が読んで分かる形を保つ。

### §4 適用は `scripts/quiz-pagefix-apply.mjs` の一本道

判定 JSON (`evidence/phase5/stage_06_quiz_fidelity/pagefix_S118_decisions.json`、⑦-1 の実読で生成)
`[{id, question_page_number, figure_page_number|null, verdict, …}]` を読み、**冪等・assert-once**で
`data/ip/exams/by_year/<exam>.json` と `data/ip/exams/question_bank.json` の **2 層同時**に適用する。

| verdict | 意味 | 効果 |
|---|---|---|
| `MOVE_QUESTION` | 記録ページが前文ページ等を指しており、設問は別ページ | `page_*` ← 設問ページ。図を持つ問は `figure_page_*` ← **旧ページ** (bbox は旧ページ実測なので裁断が生き残る) |
| `SPLIT_FIGURE` | 設問ページの記録は正しく、図だけ別ページ | `page_*` は据置 (必要なら設問ページに合わせる)、`figure_page_*` ← 図ページ |
| `KEEP` | 偽陽性 (前文と設問が同ページ等) | no-op |

`--dry-run` で書かずに before/after を全件印字。`--self-test` は実データに触れずインライン標本で計画関数を検証する。
stem / choices / correct_answer / has_figure / figure_type は一切触らない。

**bbox 相 (S118 追補)**: 判定 JSON の `bbox_check.verdict` (= `status`) が `"BAD"` のエントリだけ、
`figure_bbox_pct ← bbox_check.proposed_bbox_pct` を **verdict と独立に**適用する (`KEEP` でもポインタは正しいが
裁断枠だけ悪い問がある)。適用後に図を再裁断して WebP を作り直す。裁断は 2 系統に分かれる:

- **単独図**: 図ページから素の extract。`box = (trunc(x1·w), trunc(y1·h), trunc(x2·w), trunc(y2·h))`。
  この trunc 式が既存 crop 7/7 の寸法を逐一再現することを S118 で実測した (旧 `crop-and-update.mjs` の PIL
  `int()` 式と同値。D-110 により Python は使わず sharp で実装)。
- **中問の共有図**: D-120 の単一真相源である `groups.json` の `shared_figure` を再裁断 (trim + 16px pad、
  `quiz-chumon-recrop-D144s3ii.mjs` と同じ後処理) し、`figures/_groups/<gid>.png` を全メンバーに複製、
  `shared_figure.bbox_pct` を更新する。メンバーごとに個別裁断すると組の単一真相源が壊れる。

### §5 crosscheck — B6 拡張 + B7 新設 (`scripts/quiz-keys-crosscheck.mjs`)

- **B6**: `source` は既に丸ごと bank == by_year 比較の対象だが、`source.figure_page_image` /
  `source.figure_page_number` を**名指しでも**比較する (差分の指し先が読める失敗メッセージにする。将来 `source` の
  比較を絞っても跨ページ情報が漏れない)。
- **B7 (新)**: ページポインタの健全性。
  1. `page_image` は `pages/<exam>/page-NN.png` 形で、`<exam>` が id と一致、`NN == page_number`、実在する。
  2. `figure_page_image` があるとき: `page_image` と**異なる** (同じなら雑音 — fail)、`figure_page_number` と対で存在、
     形・exam・番号一致・実在、かつ**図を持つ問である** (`has_figure` / `figure_bbox_pct`)。
  3. `figure_page_number` だけがあって `figure_page_image` が無い、も fail。

### §6 既存 5 問の遡及は ⑦-1 でやる

`figure_source_corrected` の 5 問 (背景節) は `page_image` が図ページを指している。
本 ADR では**遡及是正しない** — 設問ページの実値は実読しないと分からないため、⑦-1 (S115 の 12 件候補 + この 5 件) の
実読定案の成果として `quiz-pagefix-apply.mjs` 経由で入れる。Rule B の記録としてここに残す。

### §7 下流への波及はゼロ

`data/ip/quiz/questions.json` に `source` は**射影されていない** (S118 実測: `build-quiz-corpus.mjs` は
`source_label` [出典文字列] を作るだけで `source` を通さない。questions.json のキーは
`id, exam_id, topic_id, category, source_label, stem_jp, choices_jp, correct_answer, has_figure, figure, figure_type, terms`)。
web app (`apps/web/src/lib/quiz/*.ts`) はページ系フィールドを 1 つも読まない。
よって **TS 型・app・questions.json・Layer A 不変式は無変更**。D-145 は raw 層 (bank / by_year) と pipeline script に閉じる。

### §7b 中問の共有図は **実読なしで決定的に**導出する

`quiz-chumon-recrop-D144s3ii.mjs` は共有図を**組のページ**から裁断してメンバーに複製し、メンバーの
`figure_bbox_pct` にも**組のページ基準の bbox** を書く。一方メンバーの `source.page_image` は各自の設問ページなので、
D-145 以前はこの型が全部「bbox の基準ページ ≠ 記録ページ」だった (S118 実測)。

これは**実読を要さない**。「そのメンバーの図が組の共有図そのものである」ことが
`figure_type === "shared"` かつ `figure_bbox_pct == shared_figure.bbox_pct` (逐字一致) で機械的に確認でき、
そこから図ページ = `shared_figure.page_image` が決定的に従うからである。
`scripts/quiz-pagefix-derive-groups.mjs` がこの導出を行い、`quiz-pagefix-apply.mjs` が読む判定 JSON
(`evidence/phase5/stage_06_quiz_fidelity/pagefix_S118_groups_derived.json`) を書く。
条件を満たさない問 (`type != shared` / bbox 不一致) は**判定に含めず** stderr に「要確認」として出す。

同 script の `--assert-clean` は**常設ゲート**であり、2 本立てで `figure_page_*` を持つ **50 問全部**を守る:
**(A)** 中問の共有図メンバーが組のページと整合していること (`figure_group` が `sibling:<id>` の問は兄弟問の図ページを継承)。
**(B)** 委託済の判定 JSON 2 本に載る全 SPLIT_FIGURE id が、今も **bank と by_year の両層**で判定どおりの
`figure_page_image` / `figure_page_number` を持つこと。
(B) が要るのは、散題と `sibling:` 組が (A) の射程外だからである。**欠如は合法な既定値なので crosscheck B7 は
消失を捕まえられない** — このゲートが唯一の砦であり、`source` を書く script を触ったら必ず回すこと。

### §8 既知の限界 / backlog — 「1 問 1 図」を超えるものは D-145 では表現しない

`figure_page_*` は **1 本の任意ポインタ**であり、「この問の図はどのページにあるか」しか言えない。
⑦-1 の実読で、それを超える型が 2 つ見つかった。**どちらも D-145 では扱わず、ここに登記して次に回す** (ユーザー裁定, S118)。

**(a) 多図参照 — 自分の図は自ページ、だが題幹が別ページの図も引用する (3 問)**

| id | 記録された図 | 題幹が引用する未捕捉の図 |
|---|---|---|
| `2014h26h-q090` | page-39 の選択肢グラフ (ア〜エ そのもの) | 図1 @ page-38 |
| `2015h27h-q091` | page-40 の表 (遅延の予測日数 / 回避策の費用) | 図1 @ page-38 |
| `2014h26h-q091` | 無し (`has_figure=false`) | 表1 @ page-38 |

`figure_page_*` を 1 本足しても「自分の図」と「参照する別ページの図」は同時に持てない。
**多図モデル (配列化) は導入しない** — 消費者 11 script と `figure_bbox_pct` の意味を全部書き換える破壊的変更になり、
実測 3 問のために払う額ではない。この 3 問は `figure_page_*` を**書かず** (KEEP)、backlog として残す。

**(b) 中問メンバーへの図の付与は D-144 段 3 の設計どおり (5 問、変更しない)**

⑦-1 scout は `2013h25h-q098` / `2013h25h-q100` / `2014h26a-q091` / `2015h27h-q090` / `2015h27h-q092` について
「題幹が図を引用せず自己完結しているので `has_figure=true` は過剰付与の疑い」と報告した。
しかし**共有図を組の全メンバーに挂けるのは D-144 段 3 の意図的な設計**である (中問の各問を単独で解ける形にする)。
`has_figure` は**変えない**。これらにも組の他メンバーと同じく `figure_page_*` を書く。
scout の観察は記録として残すが、変更の根拠にはしない。

---

## なぜこの形か

- **単一ポインタでは真実が表現できない**。`2009h21h-q097` は「設問 43 / 図 42」であり、どちらを書いても片方が壊れる。
  S115 は是正 → 回退を往復して 1 session 分を失った。表現力が足りないことが原因で、運用では直らない。
- **既定 = 欠如**にすると移行が要らない。2900 問は今日の意味のまま正しく、跨ページの問だけが例外として目に見える。
- **先行モデルがある**: D-120 の `groups.json` `shared_figure` は既に `page_image` + `bbox_pct` を組で持つ
  (`stage026-group-finalize.mjs:60`)。中問の共有図で機能している設計を、散題にも使える形で `source` に一般化しただけ。
- **`figure_bbox_pct` の基準を明文化する**のが本質。今までどのドキュメントにも「何相対か」が書かれておらず、
  S115 の是正者も回退者も同じ場所で躓いた。

## 却下した代替案

| 案 | 却下理由 |
|---|---|
| ⑦-1 単独 (12 件を実読で定案、schema 不変) | `2009h21h-q097` 型 (設問と図が別ページ) が**依然表現不能**。実読しても書き込む先が無い。⑦-2 と**同時**にやる前提で採用 (S118 §15) |
| ⑦-3 中問は `groups.json` の `shared_figure` に図ページを寄せる | 中問 (組登録済) しか救えない。**散題の跨ページ図に解が無い** (`2009h21h-q097` は中問Cの一員だが、`2014h26h-q061` のような散題も実在) |
| ⑦-4 不変式「`page_image` のページに本題番号が実在」を先に入れて赤信号化 | ページ級 OCR が要りコスト過大。しかも**検出しかできない** — 直す先のフィールドが無いので止血にしかならない |
| `figure_bbox_pct` にページ番号を埋め込む (`{page, x1, …}`) | bbox を読む消費者が全部壊れる。`figure_bbox_pct` は 515 問が持つ既存フィールドで、破壊的変更のコストが `source` への付加より高い |
| 2900 問に `figure_page_* = page_*` を明示的に書く | 冗長。2900 行 diff が退行検知を潰し、「フィールドがある = 跨ページ」という読みやすさも失う (§3) |
| `figure_page_*` を配列にして多図参照を表現 | 消費者 11 script と `figure_bbox_pct` の意味を全部書き換える破壊的変更。実測 3 問 (§8a) に対して過剰 |
| §8b の 5 問の `has_figure` を false にする | D-144 段 3 の「中問メンバーは単独で解ける」設計を壊す。図の付与は意図的 |

---

## 適用実績 (S118)

**批 1 — 実読判定** `evidence/phase5/stage_06_quiz_fidelity/pagefix_S118_decisions.json` = 35 件
(SPLIT_FIGURE 15 / KEEP 20、うち `bbox_check=BAD` 11):

- **source 相 15 問**に `figure_page_*` を付与。うち `2009h21h-q097` (42→43 / 図 42)・`2014h26h-q089` (38→39 / 図 38)・
  `2015h27h-q089` (38→39 / 図 38) は設問ページも同時に是正。S115 が往復した状態がようやく表現できた。
- **bbox 相 11 問**を再裁断 (単独図 7 + 中問組 `2012h24a-mqC` 1 組 4 問)。WebP は 521 件中**ちょうど 11 件**が変化。
  ポインタだけ動いた 14 問は WebP 不変 — 「図の実体はもともと正しいページから切られていた」ことの機械的裏づけ。

**批 2 — 決定的導出 (§7b)** `pagefix_S118_groups_derived.json` = 35 件 (全て SPLIT_FIGURE、bbox 据置):

- 中問の共有図メンバー **35 問**に `figure_page_*` を付与。除外の内訳は「既に整合 12 / `type != shared` **0** /
  bbox 不一致 **0** / group 未解決 2 (批 1 で処理済の `sibling:` 疑似 id)」— 曖昧例ゼロ。
- bbox は組の値のままなので**図 PNG も WebP も 1 件も変わらない**。ポインタだけが真実に合った。

**合計 50 問 / 2900** が `figure_page_*` を持つ (§3 の「跨ページだけ」に合致)。

**検証 (最強の形)**: 適用済メンバー 7 件について、`figure_page_image` + `figure_bbox_pct` から chumon-recrop 式で
裁断し直した画像が既存の図 PNG と **md5 逐字一致 (7/7)**。同じ bbox を旧ポインタ (設問ページ) に当てると
全件で寸法から違う。つまり `figure_page_image` は**裁断の実際の出所と一致している**。

詳細と全ゲート出力は `evidence/quiz_pagefix_D145_S118.md`。

---

## Rule D 審閲 (S118、別 subagent_type) — 条件付き PASS → 全件処置済

- **HIGH-1**: `2011h23tokubetsu-q093` の裁断枠が 図1 の「開始」端子を落としていた → `y1` 0.235 → 0.175 に是正、
  再裁断・WebP 再生成・目視確認済。
- **MEDIUM-2**: `crop-and-update.mjs` / `map-questions-to-pages.mjs` の 4 サイトが `q.source` を**丸ごと置換**しており、
  再実行すれば 50 問の `figure_page_*` が静かに全消する状態だった。**欠如が合法な既定値なので B7 では捕まらない**
  — これが §1 の設計 (既定 = 欠如) が背負う唯一のコスト。両 script に `setSource()` を入れ、既存キーを保つ形に統一した
  (finalizer 2 本と同じパターン)。**`source` を書く script は 6 本すべてこの形であること**が D-145 の維持条件である。
- **LOW-4**: 図ページ == 設問ページ に戻したとき `figure_source_corrected` も降ろす (finalizer 2 本)。
- **LOW-3** (`2014h26h-q089` の union 枠に前文 2 行が挟まる): 受容。表1 と 図1 の双方が解答に要る問で、
  間の行を除く枠は取れない。図の情報は欠けていない。

処置後、crosscheck full / `--assert-clean` / vitest 501 / tsc 0 / 全量冪等再実行 いずれも GREEN。
