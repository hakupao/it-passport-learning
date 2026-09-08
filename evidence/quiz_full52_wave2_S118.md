# Quiz ⑤-2 全量保真核験 — 波 2 (2016h28h / 2017h29a) — S118

> Rule A 証跡。writer = `wave2-fixer` (executor opus)。reviewer は別 `subagent_type` (Rule D)。
> 波 1 (2015h27a / 2016h28a) は `wave1-fixer` が並行して処置。両 lane は exam が排他で、共有ファイルは
> `data/ip/quiz/questions.json` と `data/ip/exams/question_bank.json` の 2 本のみ (後述 §8 で無害を実証)。

---

## §1 入力と率

| exam | n (母数) | gp DISCREPANT | cr DISCREPANT | agent union (題) | machdiff 追加 (題) | 採用 (題) | 率 |
|---|---|---|---|---|---|---|---|
| 2016h28h | 66 | 4 | 4 | 5 | 2 | **7** | 10.6 % |
| 2017h29a | 92 | 5 | 6 | 6 | 3 (うち 1 見送り) | **8** | 8.7 % |
| 合計 | **158** | 9 | 10 | 11 (7.0 %) | 5 | **15** | **9.5 %** |

- 正解肢上 = **3** (`2016h28h-q089` エ / `2017h29a-q012` ア / `2017h29a-q098` イ)。
  agent 側の `onCorrectChoiceCount` は 2016h28h 0 / 2017h29a 2 で、q089 は **machdiff だけが捕捉**。
- **answer_affecting = 0**。全件、腐敗の有無にかかわらず stored key が唯一解として成立する
  (q022 の ウ は「暴風」でも「曇り」でも損害保険/天候デリバティブでクラウドファンディングではない、等)。
- 参考: ⑤-3 層化抽検 (S118 §26) は 17.5 % / 正解肢 5 / aff 1、S117 B-sample は 7.5 % / 0 / 0。
  波 2 はその中間で、**⑤-2 全量発火の前提 (残は軽微欠陥だけではない) を再確認**した。

結果 JSON (4 本、本 commit で追加):

```
evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_S118_2016h28h_gp.json   (66 agent)
evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_S118_2016h28h_cr.json   (66 agent)
evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_S118_2017h29a_gp.json   (92 agent)
evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_S118_2017h29a_cr.json   (92 agent)
```

manifest = `data/ip/quiz/.phase2/full52_fidelity_input_<exam>.json` (R8 削除後のスナップショット、gitignored)。

---

## §2 machdiff (是正前)

```
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/full52_fidelity_input_<exam>.json \
     evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_S118_<exam>_<gp|cr>.json
```

| run | fields same | AGENT_MISSED | coverage |
|---|---|---|---|
| 2016h28h gp | 325 | 5 | 66/66 |
| 2016h28h cr | 323 | 7 | 66/66 |
| 2017h29a gp | 456 | 4 | 92/92 |
| 2017h29a cr | 457 | 3 | 92/92 |

去重すると **6 題 / 12 field**:

| id | 内容 | 判定 |
|---|---|---|
| `2016h28h-q051` stem | 節見出し `[条件]` vs 源 `〔条件〕` | **真** (双 pass 齊漏) → 採用 |
| `2016h28h-q089` ア〜エ | 4 肢すべてで第 1 節後の読点と文末句点が脱落 | **真** (双 pass 齊漏、正解肢エ含む) → 採用 |
| `2016h28h-q040` stem | 節見出し `[報告ルール]` | 真 (cr agent も cosmetic で計上済) → 採用 |
| `2017h29a-q079` stem | 節見出し `[送信先]` | **真** (双 pass 齊漏) → 採用 |
| `2017h29a-q096` stem | 節見出し `[事例]` | **真** (双 pass 齊漏) → 採用 |
| `2017h29a-q001` stem | 表 1 行目 `単位:万円/日` vs 源 `単位　万円／日` | 真 (cr agent も計上済) → 採用 |
| `2017h29a-q020` stem | `-20` (U+002D) vs 源のタイポグラフィックなマイナス | **見送り** (§5) |
| `2016h28h-q060` stem (cr) | agent が `source_text` に散文注記を書いたため差し戻し比較が破綻 | **偽陽性** (§6) |

**machdiff の寄与**: 双 pass が齊漏した 4 題 / 7 field (q051・q089 ×4・q079・q096) を捕捉。
うち q089 は**正解肢エ を含む**。⑤-3 (§26) に続き machdiff 常設の有効性を再確認。

---

## §3 union 表 (源 PNG を原寸で全件実読して確定)

すべて `data/ip/exams/pages/<exam>/page-NN.png` (1432×2026) を主 context が直接読んで裁定した。

### 2016h28h

| id | field | 表示 (是正前) | 源 (page) | sev | 出所 | 処置 |
|---|---|---|---|---|---|---|
| q009 | stem | 大手システム開発会社**4社**から | **A社** (page-05) | semantic | gp+cr | jp 全層 + zh/en + 解説 |
| q009 | ch.エ | 対する **4 社**の検査 | **A 社** | semantic | gp+cr | 同上 |
| q040 | stem | `[報告ルール]` (raw は非対称 `[報告ルール〕`) | `〔報告ルール〕` (page-19) | cosmetic | gp/cr+md | jp 全層 |
| q051 | stem | `[条件]` | `〔条件〕` (page-24) | — | machdiff | jp 全層 |
| q060 | stem | 「（構成 a：装置 2 台を直列に接続。…）」 | **源本文に無し**、a/b/c は回路図 (page-28) | semantic(cr) | gp+cr | clean + zh + en から削除 |
| q067 | ch.ア | …どの PC からでもアクセス可能 | …アクセス可能**とする。** (page-31) | semantic | gp+cr | jp 全層 |
| q067 | ch.ウ | Web サーバの**メンデテナンス** | **メンテナンス** | semantic | gp+cr | jp 全層 |
| q089 | ch.ア〜エ | 読点と文末句点が 4 肢とも脱落 | 「…ために**，**…**。**」(page-40) | — | machdiff | jp 全層 (正解肢エ含む) |
| q094 | stem | **「**仕入一覧**」**「仕入」「商品」 | **“**仕入一覧**”** “仕入” “商品” (page-42) | cosmetic | cr | clean のみ |

### 2017h29a

| id | field | 表示 (是正前) | 源 (page) | sev | 出所 | 処置 |
|---|---|---|---|---|---|---|
| q001 | stem | 表の結合ヘッダ「技術者」「製品」が消失 + `単位：` | 「技術者」が A/B/C を、「製品」が X/Y/Z を結合 + `単位　` (page-02) | cosmetic | cr+md | jp 全層 + zh/en |
| q012 | ch.ア | メールアドレスを**(**CC 欄に | `を CC 欄に` (page-06) | cosmetic | gp+cr | jp 全層 (**正解肢**) |
| q012 | ch.イ | 購入額上位**19**人 | 上位**10**人 | semantic | gp+cr | jp 全層 + zh/en + 解説 |
| q020 | stem | `単位：百万円` | `単位　百万円` (page-10) | — | 主 context 実読 | jp 全層 |
| q022 | ch.ウ | **暴風**や雨が多かったこと | **曇り**や雨 (page-11) | semantic | gp+cr | jp 全層 + zh/en + **解説全面書換** |
| q047 | ch.イ | 電話で内容を**代替した** | 電話で内容を**伝えた** (page-20) | semantic | gp+cr | jp 全層 + 解説 (zh/en は既に忠実) |
| q078 | ch.ウ | 光ファイバと**鋼線**ケーブル | **銅線**ケーブル (page-30) | semantic | gp+cr | jp 全層 + zh/en + 解説 |
| q079 | stem | `[送信先]` | `〔送信先〕` (page-30) | — | machdiff | jp 全層 |
| q096 | stem | `[事例]` | `〔事例〕` (page-37) | — | machdiff | jp 全層 |
| q098 | ch.ア〜エ | `(notA) and(BandC)` | `(not A ) and ( B and C )` (page-39) | semantic | gp+cr | jp/zh/en 全層 (**正解肢イ含む**) |

gp/cr 不一致は 2 件のみで、いずれも主 context の実読で裁定した:

- `2016h28h-q060`: gp=cosmetic / cr=semantic → **semantic** を採る (源本文に対応文言が存在せず、
  題幹に無い記述を学習者に見せているため)。
- `2017h29a-q001`: cr のみが結合ヘッダを差分計上。gp の transcript は markdown 化後の平坦なヘッダ
  `["A","B","C"]` を書き写しており、源 (page-02) を実読すると cr が正しい。

---

## §4 主要な判断

### (a) `2016h28h-q060` — 図の代替テキスト段落を削除

波 1 の `2015h27a-q066` と同一規則。`has_figure=true` / `figure_path=figures/2016h28h-q060.png` /
`apps/web/public/quiz-figures/2016h28h-q060.webp` が実在し、その WebP を実読すると
構成 a (2 台直列) / b (1 台直列 + 2 台並列) / c (3 台並列) の回路図と `a` `b` `c` のキャプション、
および選択肢 ア〜エ まで写っている。**図は学習者に表示される**ので代替テキストは冗長であり、
かつ源本文に無い文を題幹に混ぜている = 保真違反。3 言語 (clean / zh / en) から段落を削除した。
`.phase1` には元から段落が無く (sidecar 側だけで後付けされていた)、削除後に両層が一致する。

### (b) `2017h29a-q001` — 結合ヘッダの復元

源の表は左上が空セル、その右に **A/B/C を結合した「技術者」**、行側は **X/Y/Z を結合した「製品」** をもつ。
markdown に結合セルは書けないため、**各セルへ展開**する形で情報を復元した (`| 製品 X | 6 | 6 | 5 |` /
`|  | 技術者 A | 技術者 B | 技術者 C |`)。列数は 4 のまま、3 言語とも `|` 区切りが均一 (検証済)。
あわせて raw `stem_jp` の Z 行 `6|7|8` も源どおり `8|7|8` に是正した
(key_guard が既知としていた raw 側 OCR 誤り。源 page-02 は 8/7/8)。

### (c) 節見出しの括弧 `[…]` → `〔…〕` (4 題)

⑤-3 (S118 §26/§28) では横断クラス **N6-b** として見送られた族だが、本波では

1. lead が `q040` を明示的に処置対象として指定した、
2. 4 題すべて源 PNG を原寸で実読し、**亀甲括弧 `〔 〕` の字形を目視で確定**できた、
3. raw 層には `[報告ルール〕` `[送信先〕` という**非対称の壊れた括弧**が残っていた、

の 3 点から **本波の 2 exam に限って是正**した。corpus 全体の `[…]`↔`〔…〕` 正規化 (N6-b) は未了で、
波 1 以降の各波でも「源で字形が確定できたものだけ是正する」方針を採るべく §7 に登記した。

### (d) `2016h28h-q089` の読点字形

源は全角読点 `，` だが、本 exam の表示層は全ての読点を `, ` (ASCII + 空白) に正規化している
(例 `2016h28h-q040` ウ「担当者の報告を集約し, 進捗に…」)。§28 LOW-2 の
「新挿入 U+FF0C と同題内 ASCII 読点の混在」を再発させないため、**`, ` を挿入**した。
machdiff の正規化は両者を `,` に写すため核験上も等価。

### (e) `2017h29a-q098` の検索式空白を 3 言語に適用

S118 の「検索式・正規表現・URL は空白が構文」規則の対象。式は言語非依存の文字列なので、
jp だけ源どおりにして zh/en を別形にすると 3 語間で不一致が生じる。よって **3 言語とも
`(not A ) and ( B or C )` 形に揃えた**。解説本文の引用 `(not A) and (B or C)` は
腐敗由来ではなく正しい論理式の散文表記なので不変とした。

### (f) 腐敗を論拠にしていた解説の書換

- `2017h29a-q022` ウ: 腐敗版「暴風や雨」を前提に **損害保険** と論じていた。源の「曇りや雨が多かったこと」は
  **天候デリバティブ (天候保険)** の典型例なので、jp/zh/en を全文書換した
  (「あらかじめ定めた気象条件 (日照時間や降水量など) を指標に補償額が決まる金融商品・保険」)。
- `2016h28h-q009`: `correct_jp` と `points_jp[1]` が「大手4社が親事業者」「その1社である A社」と
  腐敗値を前提にしていた → 「発注元の大手システム開発会社 A社が親事業者」に三語で書換。
- `2017h29a-q012` イ / `2017h29a-q047` イ / `2017h29a-q078` ウ: 腐敗テキストの逐語引用を是正値に差し替え。
  q047 の zh/en (「改用电话传达了内容」/「conveyed the content by phone」) は**元から源に忠実**だったので不変。

---

## §5 見送り (backlog へ)

| 項目 | 理由 |
|---|---|
| `2017h29a-q020` 表の `-20` (U+002D) vs 源のマイナス記号 | 走査画像から U+2212 と U+FF0D を**判別できない**。ASCII `-` は語義的に等価で誤読を生まない。字形クラス **N6-b** に登記。「走査で字形が確定できるものだけ是正する」線引きに従う (括弧は確定できたので是正、マイナスは不可) |
| `2017h29a-q079` の `〔送信先〕` が 3 行 (To / Cc / Bcc) → 1 行に連結 | 改行・空白の正規化クラス。machdiff の既知盲点、双 pass とも CLEAN 判定。**N5/空白系列** |
| clean 保有題の raw `stem_jp` 残存腐敗 (`q060` の「as こ c」「-ローー」「ー a b C」/ `q094` の引用符崩れ/ `q051` の「a~ー d」/ `q020` の最終行欠落・「（利益）」) | §28 LOW-1 の **N5 系列** (学習者不可視)。今回 raw を触ったのは源で確定した括弧・`単位`・q001 の Z 行のみ |
| `2016h28h-q094` の zh 「进货一览」/ en 「Purchase List」 が日本語の鉤括弧 `「」` を使っている | 保真規則は jp と源の照合。zh/en の引用符慣行は別問題だが、**英語本文に `「」` は不自然**なので ⑨ に登記 |
| `2017h29a-q017` が merge で `SUSPECT (key-guard) 1` に出る | `figure_derivable=false` 由来の**既存**判定。HEAD の explanations と同一で本波の変更と無関係 |

---

## §6 偽陽性 (machdiff、⑨ 改善候補)

- **新型**: `2016h28h-q060` (cr) — agent が `source_text` に
  「(源ページの本文には対応する文言が存在しない。構成 a / b / c は文章ではなく…)」という**散文注記**を書いたため、
  machdiff が「agent の修正を当てて再 diff」する段で注記そのものが表示層に残り AGENT_MISSED になった。
  → workflow prompt に「`source_text` は源の逐字のみ。存在しない場合は空文字列」を追記すべき (⑨ に登記)。
- 是正後の再核験 (§7) では `2016h28h-q067` ア が同型の残差を出す
  (agent の fix `…アクセス可能` → `…アクセス可能とする。` を**既に是正済のテキスト**に当てて
  「とする。とする。」になる)。これは replay 由来の artifact で、実際の corpus は源と一致している。

---

## §7 是正後の再核験 (Rule A)

是正後の表示層でスナップショットを作り直し、**同じ agent transcript に対して machdiff を掛け直した**:

```
node scripts/quiz-fidelity-prep-any.mjs <exam> full52post "<同じ qnums>"
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/full52post_fidelity_input_<exam>.json \
     evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_S118_<exam>_<gp|cr>.json
```

| run | AGENT_MISSED 前 → 後 | 残差 |
|---|---|---|
| 2016h28h gp | 5 → **1** | q067 ア = §6 の replay artifact |
| 2016h28h cr | 7 → **1** | 同上 |
| 2017h29a gp | 4 → **2** | q001 stem = gp transcript が平坦ヘッダ (cr と源が正) / q020 = §5 見送り |
| 2017h29a cr | 3 → **1** | q020 = §5 見送り |

**実質残差 0** (見送り 1 + gp transcript の非忠実 1 + replay artifact 1)。

層の反映検証 (独立スクリプト、`scripts/quiz-fidfix-S118-wave2.mjs` とは別ロジック):

| 検証 | 結果 |
|---|---|
| 三層恒等 (`questions.json` == `question_bank.json` == `by_year`) 16 問 | **不一致 0** |
| sidecar / `.phase1` に是正値が両方入っているか (stem 34 検査 + 選択肢 43 検査) | **失敗 0** |
| `sidecar` と `.phase1` の残存差分 | `2016h28h-q094` en の引用符 / `2017h29a-q020` の「（網掛け）利益」/ `2017h29a-q098` は `.phase1` に `stem_jp_clean` キー無し — **いずれも是正前から存在する既知の乖離** (S117 §10a) |
| q001 の markdown 表 3 言語 | 5 行 × 4 列で均一 |
| dry-run 再実行 | **applied 0 / skipped 210** (冪等) |

---

## §8 層と局所性

| 層 | 変更 field 数 |
|---|---|
| raw 3 層 (`questions.json` / `question_bank.json` / `by_year`) | (stem 7 + choices 16) × 3 = **69** |
| `translations/<exam>.json` (clean 9 / stem.zh 3 / stem.en 3 / choices.zh 8 / choices.en 8) | **31** |
| `.phase1/tr_*.json` | **28** (q060 の 3 言語は元から段落が無いため差分なし) |
| 解説 `.phase2` (`expl_jp_*` / `expl_tr_*`、5 題) | **16** |
| `key_guard` final note (`generate_result_*.json`、10 題) | **10** |
| 合計 | **154 field** / `sub()` 適用 186 |

局所性:

- `data/ip/quiz/questions.json` の変更 id = **自 lane 14 件** (`2016h28h-q009/040/051/067/089`、
  `2017h29a-q001/012/020/022/047/078/079/096/098`)。`q060` と `q094` は clean 層のみの是正なので
  raw を保持する `questions.json` には現れない。
- **`correct_answer` の変更 0 件**。総問数 2900 で不変。
- 併走 lane (`wave1-fixer`) の id も同じ diff に現れる (**別 lane**、本波は不可触):
  `2015h27a-q042/044/059/062/081/093/097`、`2016h28a-q018/028/050/098` の 11 件。
- 共有ファイルの競合検証: 自波の書き込み後に `question_bank.json` と `by_year` を
  **4 exam / 400 問**で照合し **不一致 0**。波 1 の bank 編集を踏み潰していないことを実証した。
- `explanations/<exam>.json` の変更 id = 2016h28h 4 件 / 2017h29a 6 件 (すべて自波の対象)。
- D-143: **final note のみ追記** (10 題)。`key_guard_round1` は不可触で、merge が差分を検知して
  `round1` block を併記した (2016h28h 13 → 17 / 2017h29a 1 → 6 = 新規 9 + 既存 1)。
  追記は全件 append-only で、既存 note の全文が先頭に保存されていることを検証済。

---

## §9 ゲート

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | **GREEN** — `questions=2900 exams=29 layerB=ran` / `all invariants hold (A1–A7, B1–B7)` |
| `cd apps/web && pnpm vitest run` | **501 passed / 2 skipped** (33 files passed, 1 skipped) |
| `cd apps/web && npx tsc --noEmit` | **0 error** |
| `node scripts/quiz-chumon-groups-build.mjs --check` | **一致** (`chumon_groups.json は生成結果と一致`) |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | **GREEN** — (A) 共有図メンバー整合 / (B) SPLIT_FIGURE 50 件が bank・by_year 両層で判定どおり |
| `node scripts/build-quiz-corpus.mjs` | 2900 問 / 63 topic / 29 exam / with_fig 511 |
| `node scripts/quiz-phase2-merge.mjs 2016h28h` | explained 100 / missing 0 / SUSPECT 0 / STEM-CORRUPTION 0 |
| `node scripts/quiz-phase2-merge.mjs 2017h29a` | explained 100 / missing 0 / SUSPECT 1 (`q017`、既存) / STEM-CORRUPTION 0 |
| `node --check scripts/quiz-fidfix-S118-wave2.mjs` | OK |

---

## §10 backlog (⑨ / N 系列へ)

| 記号 | 内容 |
|---|---|
| N6-b | `[…]`↔`〔…〕` の corpus 横断正規化 (本波で 4 題を回収、残は未了)。**マイナス記号** `-`(U+002D)↔`−` の字形も本項に併合 (`2017h29a-q020`) |
| N5 | clean 保有題の raw `stem_jp` 残存腐敗 — 本波で新たに `2016h28h-q060` (「as こ c」「-ローー」「ー a b C」) / `2016h28h-q094` (引用符崩れ) / `2016h28h-q051` (「a~ー d」) / `2017h29a-q020` (最終行欠落・「（利益）」) を確認 |
| ⑨-a | machdiff 偽陽性 **新型**: agent が `source_text` に散文注記を書く (`2016h28h-q060` cr)。workflow prompt に「`source_text` は源の逐字のみ、無い場合は空文字列」を追記 |
| ⑨-b | 是正後の再 machdiff で出る replay artifact (agent の fix を是正済テキストに当てて重複する) を machdiff 側で識別できるようにする |
| ⑨-c | `2016h28h-q094` の zh/en が日本語の鉤括弧 `「」` を使っている (英文で不自然)。三語の引用符方針を決める |
| ⑨-d | 表の**結合セル**を markdown 化する際の既定 (本波は「各セルへ展開」を採用: `2017h29a-q001`)。波 1 の `2016h28a-q043`「進捗（月末時点）」も同族 — 波間で方針を揃える必要あり |
| ⑨-e | gp/cr の transcript 忠実度差: `2017h29a-q001` で gp が結合ヘッダを平坦化して書き写した。prompt に「表は源の結合構造どおりに書き起こす」を追記 |

---

## §11 成果物

| ファイル | 内容 |
|---|---|
| `scripts/quiz-fidfix-S118-wave2.mjs` | 是正器 (assert-once / 冪等 / `--dry-run`)。全判断を冒頭コメントに明記 |
| `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_S118_{2016h28h,2017h29a}_{gp,cr}.json` | workflow 生結果 4 本 |
| `evidence/quiz_full52_wave2_S118.md` | 本ファイル |
| `data/ip/quiz/questions.json` ほか | 語料 (§8) |
