# A track A2a: A1 名指し候補の源照合と是正 (S127)

D-150 §4 段 1 の続き。A1 (`evidence/backlog_scan_A1_S127.md`) が決定的走査で名指しした候補のうち §5 推奨の **85 題 / 162 field / 24 exam** を源と照合し、是正した。
対象リストは `data/ip/quiz/.phase2/a2a_targets_S127.json` (= `evidence/phase5/stage_06_quiz_fidelity/a2a_targets_S127.json`、byte 一致)。

**集計の扱い: ⑤-2 の累計 (1208 / 157) には入れない (別枠)。**

---

## 1. 入力と実行

- run: `wf_6a20e0f8-cee` (Sonnet 5 gp 単 pass、85 題、4,765,816 token)
- マニフェスト: `data/ip/quiz/.phase2/a2a_fidelity_input_multi.json` (多 exam、precrop 72/85、`scripts/quiz-fidelity-prep-multi.mjs`)
- 結果 JSON (merge 済): `evidence/phase5/stage_06_quiz_fidelity/a2a_fidelity_multi_sn.json`
- 覆盖 85/85。CLEAN 76 / DISCREPANT 8 / **UNREADABLE 1** (`2014h26a-q090`)。差分 13 件、すべて cosmetic。正解肢上 0
- 是正器: `scripts/quiz-fidfix-S127-a2a.mjs` (既定は dry-run、`--apply` で書き込む)

核験 agent が源と比べたのは **jp だけ**。zh / en 層の候補 (0b 全部、見出しの zh / en、0q の zh、0c の zh / en) は、fixer が**源で確認した jp** と照合して判定した。

---

## 2. 型別の命中率 (A2b / A2c の判断材料)

field = 題 × 層 × field。1 field に複数の型が当たる場合は、型ごとに数えた (A1 の counts と同じ数え方)。
分類は次の 5 つ。
- **採用**: 源で欠陥を確認し、是正した。
- **見送り**: 欠陥は確認したが、本 unit では当てない (§6)。
- **N5**: 欠陥はあるが raw 層にしか無く、学習者には見えない。
- **方針**: ⑨-c の zh / en 引用符体裁で、U8〜U11 の precedent どおり据え置き。
- **FP**: 欠陥なし。

| 型 (A1 group) | 候補 field | 欠陥 (源で確認) | 採用 | 見送り | N5 | 方針 (⑨-c) | FP | **欠陥率** | 内訳・所見 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **0b** 訳層の数字・略語 | 35 | 6 | **6** | 0 | 0 | 0 | 29 | **17%** | 実欠陥は 2 題: `2014h26a-q045` ア/イ zh・en (4 field)、`2020r02o-q096` ウ zh・en (2 field)。FP は「2人→together」「6割→Sixty percent」「1割→10%」「半年→six months」「HDD→硬盘」「5百万→500万」などの訳し方の差。`2019r01a-q047` の 8 field も FP (§4a) |
| **1** 見出し混入 (表示層) | 9 | 9 | **6** | 3 | 0 | 0 | 0 | **100%** | A1 の見込みどおり FP 0。`2011h23a-q089` の 3 field は中問 COPY 組のマーカーを兼ねるため見送り (§6) |
| **0c** jp 異常字 + 訳 (pop) | 57 | 4 | **4** | 0 | 0 | 0 | 53 | **7%** | 欠陥は R3 (引用符の開閉不整合) の jp 4 field だけで、いずれも 0q と同じ ASCII `"` の欠陥。isolated_kanji 11 題 (者増 / 室名 / 大盛 / 脳内 / 防炎 / 案間 / 重電 / 等幅 / 何杯 / 知財 / 会等) は**すべて正当な語** (jp 11 + zh/en 22 = FP 33)。R3 の zh / en 8 field は正しい訳 (en の ASCII は ⑨-c) |
| **7** 散文の空白 (prose / kanji / particle) | 35 | 30 | **30** | 0 | 0 | 0 | 5 | **86%** (読点脱落は **0%**) | **読点脱落は 0 件**。30 field (= 30 題 33 箇所。うち `2016h28a-q034` は 0c / 0q と重複) はすべて源の**行折返し位置の語中空白**で、源には空白も読点も無い (`資源 配分` `設 置` `データ を` 等)。FP 5 = `2015h27a-q097` 4 肢 (AND 検索の検索文字列で空白が正当)、`2019h31h-q053` (〔前提〕の箇条の区切り) |
| **0q** ASCII `"` (pop、jp / zh) | 27 | 12 | **12** | 0 | 0 | 15 | 0 | jp **100%** / zh — | jp 12 field は源がすべて “…” (agent は 4 題を「字形差として許容」で CLEAN にしていた、§3c)。zh 15 field は ⑨-c で方針据置 |
| **T** 表の数値 (pop) | 4 | 3 | **1** | 0 | 2 | 0 | 1 | 25% (数値は 0%) | `T.num_raw_clean` 2 件 (`2017h29h-q032` / `q091`) は raw だけが源と違い、clean (出荷層) の数値は源どおり → N5。`2017h29h-q032` の T.table は、数値は正しいが表見出しの欠陥を machdiff 経由で採用 (§3)。`q091` の T.table は FP |
| **計 (型別延べ)** | 167 | 64 | **59** | 3 | 2 | 15 | 88 | | |
| **計 (distinct field)** | **162** | 59 | **54** | 3 | 2 | 15 | 88 | | 54 = 採用 25 + 行折返し空白 29 |

- **A2b / A2c への示唆**
  - (i) **1 / 0q-jp は確度ほぼ 100%** (源を見るのは字形の確認だけでよい)。
  - (ii) **0b は 17%** で、実欠陥は「jp が後から是正されたのに訳層が追随していない」(q045、jp は S109b で是正済) と「訳層が誤答肢を『正して』訳した」(q096 ISO→OSI、U11 q070 型) の 2 型。訳し方の差 (数詞・単位換算) を除外ルールに足せば精度は上がる。
  - (iii) **0c isolated_kanji は pop で 0/11 題**。⑤-2 済みの pop では弱い信号で、13exam / excluded は B track に任せてよい。
  - (iv) **7 の読点脱落は 0/30**。⑤-2 済みの pop では読点脱落はもう残っていない。残っていたのは行折返しの語中空白だけ。
  - (v) **0q-zh** は方針事項 (⑨-c) なので、源照合の対象から外してよい。

---

## 3. machdiff と UNREADABLE の裁定

```
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/a2a_fidelity_input_multi.json \
  evidence/phase5/stage_06_quiz_fidelity/a2a_fidelity_multi_sn.json
machdiff: fields same=410 | AGENT_MISSED=6 | VERDICT_CONFLICT=0 | audits w/o transcript=0 | UNREADABLE skipped=1 | coverage 85/85
```

| id | machdiff の指摘 | 裁定 |
|---|---|---|
| `2009h21h-q099` | row 0: 表示側は前文、transcript は問 99 の問文から始まる | **偽陽性** (前文の範囲外)。agent は隔離規則で page-42 を読めなかった。fixer が page-42 を実読し、前文 (F 社の通販業務、表 A 36 / B 45、1/36、1/36＋1/45) が表示テキストと一致することを確認した |
| `2014h26a-q091` | row 0: 同上 (前文が page-37) | **偽陽性** (同型)。fixer が page-37 を実読し、前文 (現 PC / 旧 PC、6 割、2M バイト、200 ファイル/月、2,000 ファイル、ESSID・IP アドレス) が一致することを確認した |
| `2011h23a-q089` | row 2: 表示の 7×7 表 vs 源の本文 / choices transcript missing | **偽陽性** (図 1 は源では画像で、表示の表はその文字化 = 描画補助。選択肢 ア〜エ は源でも数字 2 / 5 / 6 / 9 の画像だけ)。同題の stem 途中の「問 89」と引用符は実欠陥だが見送り (§6) |
| `2015h27a-q089` | stem 先頭「問89」 | **実残差 → 採用** (jp clean / zh / en の 3 field、型 1) |
| `2017h29h-q032` | 表見出し `平均単価(円)` `合計(円)` vs 源 `在庫平均単価` `在庫合計` | **実残差 → 採用** (cosmetic)。源 p14 の表は群見出し「入庫 / 出庫 / 在庫」の下に「数量・単価・合計」がある。clean は入庫・出庫と在庫数量だけ群名を付けて展開し、在庫の平均単価・合計だけ群名が落ちていた → `在庫平均単価（円）` `在庫合計（円）` に揃えた (zh `库存…` / en `Stock …` 追随)。表の数値はすべて源どおり |
| `2021r03-q001` | stem 先頭「問1」 | **実残差 → 採用** (raw stem = 出荷層。⑤-2 U6 の取りこぼし) |

**UNREADABLE `2014h26a-q090`**: agent は page-37 (前文の前半) を読めなかったため UNREADABLE にした。fixer が page-37 / 38 / 39 を実読した。
前文、表 1、問 90 の問文、選択肢 ア 10 / イ 40 / ウ 80 / エ 133 はすべて表示テキストと一致する → **CLEAN と裁定** (0b 候補 en `6` は "Sixty percent" で FP)。

**事後 machdiff** (是正後の表示テキストで manifest を作り直し、`--precrop` なしで prep し、crop は書き換えていない。生成した `a2apost_*` は削除済):
```
machdiff: fields same=413 | AGENT_MISSED=3 | VERDICT_CONFLICT=0 | audits w/o transcript=0 | UNREADABLE skipped=1 | coverage 85/85
```
残った 3 件は `2009h21h-q099` / `2014h26a-q091` (前文の偽陽性) と `2011h23a-q089` (図の文字化、見出しは見送り) で、いずれも上記の既知型。**新規の残差は 0**。

### 3c. agent の判定揺れ (記録)

同じ「源が “…” で表示が ASCII `"`」という差を、agent は 6 題で DISCREPANT (`2016h28a-q034` `2016h28h-q097` `2018h30a-q009` `2018h30a-q020` `2022r04-q021` ほか) にし、4 題で「字形差として許容」の CLEAN (`2019h31h-q066` `2019h31h-q097` `2019r01a-q061` `2025r07-q053`) にした。fixer は U11 の precedent (jp 出荷層の ASCII `"` → 源の “”) に揃え、10 題すべて採用した。
行折返しの語中空白は、agent が 30 題すべてで「改行由来で許容」と書いていた。

---

## 4. 名指し候補 162 field の処置

分類は §2 と同じ。「jp 確認」は、fixer が源 crop か源ページで jp を確かめたことを示す。

### 4a. 0b 訳層の数字・略語 (35 field)

| id | field | 判定 | 理由 |
|---|---|---|---|
| `2014h26a-q045` | ア zh / ア en / イ zh / イ en | **採用 (semantic)** | 源 p18 (crop) と jp は「ISO 9001」「ISO 14001」。zh / en は「ISO 9091」「ISO 149661」のまま。jp は S109b で OCR 是正済みだったのに、訳層が追随していなかった (key_guard の note がこの是正を記録している) |
| `2020r02o-q096` | ウ zh / ウ en | **採用 (semantic)** | 源 p44 (crop) と jp は「ISO で定められたオープンソースライセンス」。zh / en は「OSI（Open Source Initiative）」に訳し替えていた。誤答肢の誤りを訳層が「正した」型で、U11 q070 と同型。非出荷の key_guard note も「tr は OSI を指しており OCR 差異が疑われる」と書いていたが、OCR の誤りではなく源どおりの ISO |
| `2019r01a-q047` | ア〜エ zh / en (8) | FP | 源 p20 は選択肢が表の行 (ア 機能1 …)。zh「功能1」/ en「Function 1」は正しい。jp `[表] 機能1：…` は jp 側の一行化表現で、欠陥ではない。**欠陥の向き = 訳層は正しく、jp の一行化は体裁** |
| `2009h21h-q098` `q099` | en stem | FP | 「2人」→ "Mr. A and Mr. B … together" |
| `2011h23a-q065` | en stem | FP | OA チェア → "Office chair" |
| `2011h23tokubetsu-q093` `q094` | en stem | FP | 1割 → "10%" |
| `2012h24a-q042` | en stem | FP | en の "between A and B" は源の「A〜B 間」どおり (jp clean 側は §5 で是正) |
| `2012h24h-q087` | en stem | FP | 2機種ごと → "pairwise" |
| `2013h25a-q004` | en ア | FP | 50音 → "gojuon" |
| `2013h25h-q059` | zh エ | FP | 「对等网络（P2P）」は訳注 |
| `2014h26a-q089` `q090` `q091` | en stem | FP | 6割 → "Sixty percent" |
| `2017h29a-q040` | en stem | FP | 2人 → "persons A and B" |
| `2018h30h-q019` | en ウ | FP | 2倍 → "doubled" |
| `2019h31h-q097` | en ア | FP | 10億回 → "one billion times" |
| `2019r01a-q086` / `2024r06-q064` | zh エ | FP | HDD → 硬盘 |
| `2024r06-q020` | en / zh stem | FP | 1千万円 → 10 million / 1000万、5百万 → 500万 (単位換算) |
| `2024r06-q041` | zh stem | FP | 「BからE」→「B、C、D、E」(列挙) |
| `2026r08-q044` | en stem | FP | 半年 → "six months" (jp clean の 90% / 10% / 「このたび」は源 p20 どおり。raw は 98% / 18% / 「このため」で N5) |

### 4b. 1 見出し混入 (9 field)
- `2015h27a-q089` jp clean / zh / en → **採用** (「問89 」「问89 」「Q89 」を除去)。raw の「〔テクノロジ〕\n問89」は学習者に見えない層なので触らない (`stem_clean` 指定)。
- `2019h31h-q001` zh / en → **採用** (U3b は jp だけ是正していた)。
- `2021r03-q001` jp (raw = 出荷層) → **採用** (raw 3 層の「問1 」を除去)。
- `2011h23a-q089` jp / zh / en (stem 途中の「問 89 」) → **見送り** (§6)。

### 4c. 0c jp 異常字 + 訳 (57 field)
- R3 の jp 4 field (`2016h28a-q034` “金のなる木" / `2016h28h-q097` “avi" / `2018h30a-q009` “クラウドコンピューティング" / `2018h30a-q020` "調達から…”) → **採用** (源 crop はいずれも “…”)。対応する zh / en 8 field は正しい訳 → FP。
- isolated_kanji 11 題 → **全 45 field が FP** (10 題 × jp / zh / en 1 field ずつ = 30、`2026r08-q041` は stem + 4 肢 × 3 層 = 15、計 45。これに R3 の zh / en 8 と合わせ FP 53 = 57 − 採用 4)。
  `2016h28h-q017` 訪問者増 / `2016h28h-q089` 室名表示 / `2017h29h-q090` 大盛 / `2020r02o-q019` 脳内 / `2020r02o-q026` 防炎品 / `2020r02o-q040` 代替案間 / `2021r03-q081` 重工・重電 / `2021r03-q087` 等幅フォント / `2023r05-q021` 何杯 / `2025r07-q014` 知財 / `2026r08-q041` 取締役会等。いずれも正当な語で、zh / en も正しく訳している (重電 → 重型电机 / heavy electrical machinery 等)。
  (`2017h29h-q090` en の「「products」」は ⑨-c の en「」NIT、U11 §11 既登記。)

### 4d. 7 散文の空白 (35 field)
- **採用 30 field** (30 題 33 箇所。`2016h28a-q034` は 0c / 0q の引用符是正と同じ field)。いずれも raw = 出荷層で、源は行末の改行だけ (空白も読点も無い)。読点脱落は 0 件。
  `2016h28a` q008 システム␣について / q022 業者の␣サービス / q034 資源␣配分 / q057 ように␣セキュリティ、`2016h28h` q046 プロジェクトの␣コスト / q048 設␣置・消␣失 / q074 発␣信、`2017h29a-q032` 対␣応、`2017h29h-q039` ブレークダウン␣する、`2018h30a` q061 サーバ␣の / q071 プロトコル␣は、`2019h31h-q006` プロセス␣で、`2019r01a` q011 業␣績 / q084 適␣切、`2020r02o` q008 電力␣メータ / q084 管␣理策、`2021r03` q004 ア データ␣を (**正解肢**) / q006 運␣転 / q033 請負契␣約 / q073 イ データ␣を (**正解肢**) / q082 仮␣想的、`2022r04-q031` 累積百␣分率、`2024r06` q029 モデルを␣デジタル / q038 何時␣間、`2025r07` q013 ソリューション␣の / q015 企␣業 / q020 企␣業 / q022 担当␣者・問␣題 / q044 確認␣用 / q052 品␣質・適␣切
  (源は crop で確認。`2016h28h-q048` は p22、`2022r04-q031` は p14 の源ページで確認。)
- **FP 5**: `2015h27a-q097` ア〜エ (「PC 回収 料金」等。題幹が「文字列と文字列の間にスペースを記述すると AND 検索」と定義する検索文字列で、空白は正当)、`2019h31h-q053` (〔前提〕の「A社　生産性: …　コスト: …」は源でも空白で区切られている)。

### 4e. 0q ASCII `"` (27 field)
- jp 12 field → **採用** (源はすべて “…”): `2016h28a-q034` / `2016h28h-q097` / `2018h30a-q009` / `2018h30a-q020` (0c と重複) / `2019h31h-q066` stem / `2019h31h-q097` ア〜エ (**アは正解肢**) / `2019r01a-q061` clean (2 組) / `2022r04-q021` clean / `2025r07-q053` clean。
- zh 15 field → **方針** (⑨-c: zh / en の引用符は各言語の体裁。U8〜U11 precedent): `2019h31h-q066` / `2019h31h-q097` ア〜エ / `2020r02o-q006` ア・イ / `2022r04-q069` ウ / `2023r05-q004` / `2026r08-q025` / `2026r08-q084` ア〜エ / `2026r08-q090` イ。

### 4f. T 表 (4 field)
- `2017h29h-q032` T.table → **採用** (数値は源どおり。表見出しの群名欠落を §3 で是正) / T.num_raw_clean → **N5** (raw だけが 160 / 2,240 で、源と clean は 100 / 1,400)。
- `2017h29h-q091` T.table → FP (crop で 0.5 / 0.3 / 0.2、商品 A〜C の 9 セルが clean と一致) / T.num_raw_clean → **N5** (raw の商品 B が 200,000 / 200,000 / 50,000 で、源と clean は 250,000 / 280,000 / 300,000)。
- 同じ組の `2019h31h-q053` (fig_stem_mismatch の「59本」) は clean (出荷層) が源どおり「50本」で、raw だけが 59本 → N5 (S123 §11 の既登記と同じ)。

---

## 5. 採用した差分 (候補外を含む)

| id (page) | field | 差分 | severity | 由来 |
|---|---|---|---|---|
| 2014h26a-q045 (p18) | ア / イ zh・en | ISO 9091 → 9001 / ISO 149661 → 14001 | **semantic** | 0b |
| 2020r02o-q096 (p44) | ウ zh・en | OSI（Open Source Initiative）→ ISO | **semantic** | 0b |
| 2015h27a-q089 (p40) | stem jp clean / zh / en | 先頭の見出し除去 | cosmetic | 1 + machdiff |
| 2019h31h-q001 (p02) | stem zh / en | 先頭の見出し除去 | cosmetic | 1 |
| 2021r03-q001 (p02) | stem jp (raw = 出荷層) | 先頭「問1 」除去 | cosmetic | 1 + machdiff |
| 2012h24a-q042 (p16) | stem jp clean + zh | `AB 間, BC 間, C-A 間` → 源 `A〜B 間, B〜C 間, C〜A 間` (zh `A～B 之间…`) | cosmetic | agent DISCREPANT (**候補外**) |
| 2019r01a-q047 (p20) | stem jp clean | `「不良密度」` → 源 `“不良密度”` (.phase1 の ASCII `"` も) | cosmetic | agent DISCREPANT (**候補外**) |
| 2017h29h-q032 (p14) | stem jp clean + zh + en | 表見出し `平均単価` `合計` → `在庫平均単価` `在庫合計` | cosmetic | machdiff |
| 2016h28a-q034 / 2016h28h-q097 / 2018h30a-q009 / 2018h30a-q020 | stem (raw = 出荷層) | 引用符の片側 ASCII → “ / ” | cosmetic | 0c R3 + 0q + agent |
| 2019h31h-q066 / 2019h31h-q097 ア〜エ | stem / 選択肢 (raw) | ASCII `"…"` → “…” (**q097 アは正解肢**) | cosmetic | 0q |
| 2019r01a-q061 / 2022r04-q021 / 2025r07-q053 | stem jp clean | ASCII `"…"` → “…” | cosmetic | 0q (+ agent) |
| 7 型 30 題 | stem / 選択肢 (raw) | 行折返しの語中空白 33 箇所を除去 (**2021r03-q004 ア / q073 イは正解肢**) | cosmetic | 7 |

- **題数 46** (= 是正器の対象 46 題): semantic 2 題 / cosmetic 44 題。うち学習者に見えない層だけの是正は無い (全件が出荷層)。
- **正解肢上 3** = `2019h31h-q097 ア` (引用符) / `2021r03-q004 ア` / `2021r03-q073 イ` (空白)。いずれも字種・空白だけの変更で、**`correct_answer` は不変**。
- `correct_answer` 変更 **0 / 2900**。`answer_keys.json` は **byte 不変** (md5 `6802bb0bc13004da78ad3c4e5117d997`、mtime `1788586696` 前後同一)。

### 学習者に見えていた是正 (主なもの)
1. `2014h26a-q045` 中国語・英語の選択肢 ア / イ が「ISO 9091」「ISO 149661」と存在しない規格番号を表示していた (jp は正)。
2. `2020r02o-q096` 中国語・英語の誤答肢 ウ が、源の「ISO」を「OSI」に置き換えていた (三言語で選択肢の中身が違っていた)。
3. `2021r03-q001` jp 題幹の先頭に「問1」、`2015h27a-q089` jp / zh / en、`2019h31h-q001` zh / en の先頭に見出しが出ていた。
4. `2017h29h-q032` 表の在庫欄の「平均単価」「合計」が群名を欠き、入庫・出庫の欄と区別しにくかった。
5. ASCII `"` 10 題と行折返し空白 30 題 (33 箇所) (「資源 配分」「設 置」「何時 間」等)。

### zh / en の追随
| id | zh | en | 判定 |
|---|---|---|---|
| 2012h24a-q042 | `AB 之间、BC 之间、C-A 之间` → `A～B 之间、B～C 之间、C～A 之间` | 既に "between A and B …" | zh 追随 |
| 2017h29h-q032 | `平均单价` `合计` → `库存平均单价` `库存合计` | `Average unit price` `Total` → `Stock average unit price` `Stock total` | 追随 |
| 0q / R3 の jp 是正 10 題 | 既に “” か ⑨-c | ASCII (⑨-c) | 不変 |
| 7 型 30 題 | 空白なし | — | 不変 |
| 解説 | 引用符・空白・見出しを引用する解説なし。q045 の解説本文は規格番号 9091 を含まない (key_guard note のみ)。q096 の `expl_tr` は OSI 0 件 (`grep -c`)、merge 後の `explanations/2020r02o.json` の OSI 1 件は本 unit の追記 note 内のみ | | 不変 |

---

## 6. 逸脱・見送り (Rule D 確認点)

1. **`2011h23a-q089` を見送り (Rule B、`failures/quiz_A2a_S127_2011h23a-q089_attempt_1.md`)**
   - 源 p33 / p34 では次の 3 点が実欠陥: stem 途中の「問 89 」(jp / zh / en、型 1)、jp clean の「」×10 (源は “”)、問文の読点脱落 (「41 文字目が，“…”」)。
   - 初回 `--apply` 後に `quiz-chumon-groups-build --check` が throw し、crosscheck A7 も落ちた。原因は 2 つ。
     - 「問 89 …」は中問 COPY 組 `2011h23a-q089-copy` の cut marker を兼ねている。
     - 前文 probe (「0」を含む) は q090〜q092 にも複写されている。
   - `translations/2011h23a.json` を `git checkout` で戻し、是正器から外した。ゲートは GREEN に復帰した。
   - 是正するには COPY 表と組の 4 題を同時に直す必要がある (次 attempt の入力は failures に記載)。
   - agent DISCREPANT 6 差分のうち「（■＝黒、□＝白）」の凡例は、図を表で文字化したための描画補助なので**非採用** (U11 q072「(主キー)」と同型)。
2. **型 7 の行折返し語中空白の除去 (30 題 33 箇所)**
   - U4 §11 は読点脱落だけを扱い、語中空白は U10 Rule D NIT-2 以降、⑨ に「全庫走査」として残っていた。
   - 本 unit は、源で空白が無いこと (行末の改行) を 1 件ずつ確認したうえで除去した。cosmetic で答えには影響しない。
   - 「据え置いて ⑨ に回す」のが妥当という判断なら、是正器の該当行を外して戻せる (sub は可逆)。
3. **`stem_clean` / `CLEANN` の追加** (U11 の適用ループは無変更)
   - `stem_clean` は jp を表示層 clean だけに当てる。raw にも同じ見出しがある `2015h27a-q089` で raw を変えないため。
   - `CLEANN` は clean 専用の subN (結果として空)。
   - `2019r01a-q047` は sidecar の「」と `.phase1` の ASCII `"` が適用前から乖離していたので、2 エントリで両方を “” に揃えた (片方は n=0 で skip)。
4. **`2017h29h-q032` 表見出しの採用**: 源の群見出し (在庫) の展開を揃える体裁上の是正。agent は CLEAN (「群見出しを展開した体裁差」) と判定していたが、machdiff の指摘どおり入庫・出庫と不揃いなので採用した。
5. **key_guard 追記の対象**
   - 対象は 5 題。語義 = q045 / q096 (訳層のみの semantic)。正解肢命中 = 2019h31h-q097 ア / 2021r03-q004 ア / 2021r03-q073 イ。
   - 見出し・引用符・空白だけの非正解肢題には追記していない。訳層だけの是正に jp の note を付けるのは U11 にない運用。

---

## 7. 層と局所性

`--apply` の applied は 182。ただしこのうち 6 操作は、§6-1 で戻した `2011h23a-q089` の分 (sidecar の jp clean 2 / zh 1 / en 1 / subN 2)。**有効な置換は 176**:

| 層 | 操作数 | 備考 |
|---|---|---|
| raw (`questions.json` / `question_bank.json` / `by_year/<exam>.json`) | **129** | 43 置換 × 3 層 (stem 33 field + 選択肢 6 field = 39 field。1 field に 2 置換 = 2016h28a-q034 / 2016h28h-q048 / 2025r07-q022 / 2025r07-q052) |
| sidecar (`translations/<exam>.json`) | **21** | 9 exam |
| `.phase1/tr_<id>.json` | **21** | 10 本。skip 2 = `2011h23a-q089` の zh / en (`.phase1` は既に見出しが無く、sidecar と乖離済) は §6-1 で対象外。`2019r01a-q047` は 2 エントリのうち片方が n=0 |
| key_guard final note (`.phase2/generate_result_<exam>.json`) | **5** | D-143: final のみ、round1 不可触 |

- 再 dry-run: **applied 0 / skipped 178、files to write 0** (完全冪等。178 = 有効 176 + 構造的 skip 2)
- `questions.json` / `question_bank.json` の変化 id は **36 題で一致** (raw に置換がある題。clean だけ・訳層だけの 10 題は raw 不変)。`correct_answer` 変化 0
- D-143 (退避 `scratchpad/a2a/pre/phase2/` と機械照合): note 変化 5 件、**5/5 が純粋な後置**、`key_guard_round1` の変化 0、note_jp 以外の変化 0。`explanations/*.json` の MARK `fidfix-S127-a2a` = **5** (2014h26a 1 / 2019h31h 1 / 2020r02o 1 / 2021r03 2)
- tracked の差分 (`git diff --numstat data`): `questions.json` +39/−39、`translations/` 9 exam (2012h24a 2 / 2014h26a 4 / 2015h27a 3 / 2017h29h 3 / 2019h31h 2 / 2019r01a 2 / 2020r02o 2 / 2022r04 1 / 2025r07 1 行)、`explanations/` 4 exam (final note + round1 ブロックの publish)。**他の exam の差分は 0** (`translations/2011h23a.json` も 0)

---

## 8. CLEAN 標本の無作為抽検

agent CLEAN 76 題 (id 昇順) から **seed 131 の LCG** (U11 §4h と同じ式) で 6 題を抽出し、出荷層を源と逐字照合した。

| id | 実読結果 |
|---|---|
| `2019h31h-q053` | 題幹「50本の…」・〔前提〕・選択肢表 (A社/B社) が一致 (raw の 59本 は N5) |
| `2023r05-q004` | 題幹 (“自社方式”)・〔条件〕4 項 (500 / 0 / 300 / 5 年 / 100 万円) と ア 500〜エ 2,000 が一致 |
| `2017h29h-q039` | 題幹と CMM / ITIL / PERT / WBS が一致 (行折返し空白は §4d で是正済) |
| `2009h21h-q098` | 前文 (p42) と問 98 (p43) の問文、選択肢 ①〜④ が一致 |
| `2011h23tokubetsu-q094` | 前文 (p35) と問 94 (p37) の問文、表 1 の Y/N/X/−・b・c、選択肢 b/c 表が一致 |
| `2025r07-q044` | 題幹とアジャイル〜プロトタイピングが一致 (確認␣用 は §4d で是正済) |

→ **見落とし 0 / 6** (§4d の行折返し空白を除く)。
このほか、§4 の候補照合で CLEAN 題 40 題超の crop / 源ページを読んだ。新たな欠陥は §3c の判定揺れ (ASCII `"` 4 題) と行折返し空白だけだった。

---

## 9. ゲート

| ゲート | 結果 |
|---|---|
| 適用前: `quiz-phase2-merge.mjs` を対象 16 exam で先に実行 | ✅ `git diff data` **0 行** (merge 冪等) |
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** (初回は A7 ✗ → §6-1 で復旧) |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ `chumon_groups.json は生成結果と一致` (初回は throw → §6-1 で復旧。`?` 情報行は既存) |
| `pnpm --config.verify-deps-before-run=false -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm … -C apps/web test` (vitest) | ✅ **38 passed / 1 skipped (39 files)、562 passed / 2 skipped (564 tests)** |
| `pnpm … -C apps/web build` | ✅ exit 0 |
| `node --check scripts/quiz-fidfix-S127-a2a.mjs` | ✅ |
| fidfix dry-run 再実行 | ✅ **applied 0 / skipped 178、files to write 0** |
| `correct_answer` 差分 | ✅ **0 / 2900** (`git diff -U0 data \| grep -c '"correct_answer"'` = 0、bank / questions とも機械照合) |
| `answer_keys.json` | ✅ md5 `6802bb0bc13004da78ad3c4e5117d997` / mtime `1788586696` 前後同一 |
| 事前 / 事後 machdiff | ✅ AGENT_MISSED 6 → 3、残 3 は既知型 (§3)、新規残差 0 |
| D-143 MARK | ✅ final note 5 件、純粋後置 5/5、round1 変更 0、explanations 内 MARK 5 |
| e2e (Playwright) | **未実行** (U7〜U11 と同じ理由。本 unit は文字列置換のみ) |

再生成は `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs` ×16 exam (2011h23a は §6-1 の復旧後にもう一度実行)。図の変更は無い。

---

## 10. ⑨ 新規 / 更新

- **⑨ 新規: 訳層が jp の是正に追随していない型** (`2014h26a-q045`)。S109b 等で jp だけを是正した過去の fix で、zh / en が古い OCR 値を保持している可能性がある。提起: 過去の jp 是正の差分 (fidfix 系の FIX 表) と訳層を機械照合する。
- **⑨ 新規: 訳層が誤答肢を「正して」訳す型** (`2020r02o-q096` ISO→OSI、U11 q070 と同型で 2 例目)。D-150 段 3 (方式 D の訳層照合) の pilot に優先投入する。
- **⑨ 新規: 中問 COPY 組の境界マーカーに表示層の見出しが使われている** (`2011h23a-q089`)。見出し除去・前文の体裁是正は COPY 表と組全員を同時に直す必要がある (failures 参照)。同様の cut marker を持つ組があるかを `quiz-chumon-groups-build.mjs` の COPY 表で棚卸しする。
- **⑨ 更新: 行折返しの語中空白** — pop の 7 型 (prose / kanji / particle) の候補 30 field は本 unit で是正済み。table / figure sub と excluded / 13exam は未了。
- **⑨ 観察 (未是正、候補外)**
  - `2009h21h-q098` en が Mr. と Ms. を混用し、zh が「邮购」と「网购」を混用している。
  - `2014h26a-q090` en は "the image file" (単数) だが、jp は画像ファイル (複数)。
  - `2022r04-q021` jp clean は a〜d の 4 項を 1 行に連結している (源は 4 行)。
  - `2020r02o-q096` の非出荷 key_guard note が「OCR 差異が疑われる」と書いている (jp は源どおり)。
- **N5 (raw だけの欠陥、学習者不可視)**: `2017h29h-q032` (160 / 2,240) / `2017h29h-q091` (商品 B 行) / `2019h31h-q053` (59本) / `2026r08-q044` (98% / 18% / このため) / `2019r01a-q047` raw の ASCII `"`。

---

## 11. Rule B (失敗記録)

- **是正器 attempt 1**: `2011h23a-q089` が中問 COPY 組のゲートを壊した → `failures/quiz_A2a_S127_2011h23a-q089_attempt_1.md` (入力・産物・技術判定・業務判定・次 attempt の入力)。復旧は `git checkout` (1 file) と是正器からの除外で行い、削除はしていない。
- 抄写 run (`wf_6a20e0f8-cee`) には失敗 attempt が無い (1 回で完走、UNREADABLE 1 は §3 で fixer が裁定)。

---

## 12. Rule D

Writer = `a2a-fixer` (`oh-my-claudecode:executor` opus)。**Reviewer は別の `subagent_type` (opus) で、本 evidence の後に別途実施すること** (本ファイルは writer の自己申告で、Rule D の審査は未了)。

審査の重点:
1. **§4a 0b の 2 題 (semantic)**: `2014h26a-q045` zh / en の規格番号と、`2020r02o-q096` ウの ISO / OSI (源 p18 / p44)。`2019r01a-q047` を FP とした判断 (源 p20 の選択肢 = 表の行)。
2. **§6-2 行折返し語中空白の除去 (30 題 33 箇所)**: 方針として是正するか、⑨ に据え置くか。正解肢 2 件 (`2021r03-q004 ア` / `q073 イ`) を含む。
3. **§6-1 `2011h23a-q089` の見送り**と、failures に書いた次 attempt の方針。
4. **§3 machdiff 6 件と UNREADABLE 1 件の裁定**: 前文偽陽性 2 件は p42 / p37 を実読。`2017h29h-q032` 表見出しの採用。
5. **§2 命中率の分類**: 方針 / N5 / FP の切り分け。0c isolated_kanji を全件 FP とした判断。
6. **§4e 0q jp 10 題**: agent が CLEAN にした 4 題 (§3c) を含む引用符の是正。
7. **§7 脚本**: U11 からの変更は `stem_clean` / `CLEANN` / `SP()` / 多 exam の `.phase1` キャッシュだけ。
8. **§8 CLEAN 標本 6 題** (fixer の標本と重ならない題での追加抽検を推奨)。

---

## Rule D (a2a-reviewer、`pr-review-toolkit:code-reviewer` opus、fixer executor と別 type) — **PASS-with-notes**

- MAJOR 0 / MINOR 0 / NIT 3。採用差分を源 crop / 源ページで自分で読んだ (crop 30 枚 + 全ページ 4 枚 = p20 2019r01a / p22 2016h28h / p46 2015h27a ほか)。読んだ範囲の採用差分はすべて源で支持された。
- **正解肢上 3 件**: `2019h31h-q097 ア` (源 “1GHz”。イ〜エの “32” “64” / “一次” “二次” / “デュアル” “クアッド” も源どおり) / `2021r03-q004 ア` (源「データを，一元的」) / `2021r03-q073 イ` (源「データを，暗号鍵」)。いずれも字種・空白だけの変更で、`correct_answer` は不変。
- **型 7 の行折返し空白: 13 題 16 箇所を抽検**した。`2016h28a` q008 / q034、`2016h28h` q048 (設置・消失) / q074、`2017h29h-q039`、`2018h30a-q061`、`2019r01a-q084`、`2020r02o-q084`、`2021r03` q004 / q073 / q082、`2024r06` q029 / q038、`2025r07` q013 / q022 (担当者・問題) / q052 (品質・適切)。
  源には空白も読点も無いことを全件で確認した。読点脱落を空白と誤認した例は 0。`2025r07-q052` の「として, 適切」は読点の後の空白だけが残っていて正しい。
  方針 (§6-2) として是正を承認する。正解肢 2 件を含めても cosmetic で、sub は可逆。
- **型 7 の FP 5 件を承認**: `2015h27a-q097` (源 p46 は「PC 回収 料金」と空白入り。題幹が AND 検索の区切りと定義している) / `2019h31h-q053` (〔前提〕の項目区切り)。
- **訳層 (semantic)**:
  - `2014h26a-q045` ア / イ zh・en「ISO 9001」「ISO 14001」は源 p18 と一致し、訳文の他の部分も正しい。
  - `2020r02o-q096` ウ zh「依据 ISO 规定的开源许可证」/ en "defined by ISO." は源 p44 の「ISO で定められた」と一致する。誤答肢の誤り (OSI でなく ISO) を三言語で保つことが正しく、U11 q070 型の判断を承認する。
  - `2017h29h-q032` 表見出しは源 p14 の群見出し「在庫」の下の平均単価 / 合計に当たる。zh「库存平均单价 / 库存合计」と en "Stock average unit price / Stock total" は適切。表の数値はすべて源どおり。
- **見出し除去は他の文字を巻き込んでいない**:
  - `2021r03-q001` は raw (questions / question_bank / by_year) から「問1 E-R図」が 0 件になり、本文は「E-R図を使用して…」から始まる。
  - `2015h27a-q089` は sidecar と `.phase1` の jp clean / zh / en が「メニュー別の / 为了求出 / To calculate」から始まる。raw は「〔テクノロジ〕\n問89」のままで、`stem_clean` 指定どおり。
  - `2019h31h-q001` zh / en の残りの本文は完全に一致する。
- **候補外 3 件を承認**:
  - `2012h24a-q042` は源の「A〜B 間, B〜C 間, C〜A 間」どおり (zh「A～B 之间…」も追随)。
  - `2019r01a-q047` は源の “不良密度” どおりで、sidecar と `.phase1` が一致する。
  - `2017h29h-q032` (上述)。
- **0q / R3 の jp 10 題**: `2016h28a-q034` / `2018h30a-q020` / `2019h31h-q066` / `q097` / `2019r01a-q061` / `2025r07-q053` は源 crop の “…” と一致した。agent が CLEAN にしていた 4 題 (§3c) の扱いも承認する。
- **FP / N5 / 方針の抽検 (12 件)**: 結果はすべて妥当。
  - 0b: `2019r01a-q047` 8 field。zh / en の stem にも 4 行の表があり、選択肢「功能1」で十分。`2024r06-q020` (1000万 / 10 million、500万 / 5 million は源 p9 どおり)。`2013h25h-q059`。`2019r01a-q086` (硬盘)。
  - 0c isolated_kanji: `2021r03-q081` (源「重工，重電」)。`2020r02o-q040` (源「代替案間」)。
  - T: `2017h29h-q091` は clean の商品 B 行 250,000 / 280,000 / 300,000 が源と一致し FP。raw だけが違うので N5 とした判断も承認。
  - 0b「訳し方の差」29 件の判定 (数詞・単位換算・列挙) も、抽検の範囲で妥当。
- **型別命中率の数字は §4 と整合する**: 延べ 167 = 採用 59 + 見送り 3 + N5 2 + 方針 15 + FP 88。distinct 162 との差 5 は、`2016h28a-q034` が 3 型に重複 (+2)、`2016h28h-q097` / `2018h30a-q009` / `q020` が 2 型に重複 (+3) した分で、いずれも採用。よって採用 distinct は 59 − 5 = 54。0c の FP 53 = 45 + 8 も整合する。
- **`2011h23a-q089` の差し戻し**: `translations/2011h23a.json` の HEAD との差分は 0。`.phase1/tr_2011h23a-q089.json` は mtime が 9/7 で書き込まれていない。`generate_result_2011h23a.json` の MARK は 0。是正器にも残っていない (コメントのみ)。failures の入力・産物・判定・次 attempt (COPY 表の cut の変更、組 4 題の同時是正) は完全。
- **D-143**: 退避 (`scratchpad/a2a/pre/phase2/`) と自分で機械照合した。変化 5 件 (q045 / q096 / 2019h31h-q097 / 2021r03-q004 / q073) はすべて純粋な後置で、round1 の変化は 0、note 以外の変化も 0。`explanations` の round1 ブロックは merge による publish で、中身は退避の round1 と同じ。
- **ゲート再実行**:
  - crosscheck: `questions=2900` / all invariants hold (A1–A7, B1–B7)
  - assert-clean: (A)(B) GREEN
  - chumon `--check`: 一致
  - fidfix dry-run: **applied 0 / skipped 178 / files 0**
  - `answer_keys.json` (`data/ip/exams/`): md5 `6802bb0b…` で不変
  - `git diff data | grep -c correct_answer`: 0
  - 事前 machdiff: 再実行で申告どおり AGENT_MISSED 6 を再現した。
  - 事後 machdiff は gitignored の manifest を再生成する必要があるので reviewer は回していない。代わりに 3 件の実残差 (q001 / 2015h27a-q089 / 2017h29h-q032) が出荷層で消えていることを直接確かめた。
  - vitest / build はデータの文字列置換だけなので、fixer の結果を採用した。
- **脚本**:
  - `SP()` は ctx 内の最初の「かな・漢字␣かな・漢字」だけを消す。読点の後の空白 (`, 適`) は ASCII 読点が文字クラスに入らないので巻き込まない。33 箇所の結果を diff で全件確認した。
  - `sub()` / `subN()` / `stem_clean` の分岐は U11 と同じ安全策 (多重出現なら abort、事後確認) を保っている。
  - `quiz-s7x-fidelity.workflow.mjs` の `ids` 引数は後方互換で、id の形式も検査している。

### NIT
- **NIT-1** `2021r03-q004 ア` / `q073 イ` (正解肢) の空白は、源では**行折返しの位置ではない**。源 p3 の改行は「一元的 / に検索」、p34 は「暗 / 号化する」で、「データを」は行の途中にある。
  空白が源に無いので除去は正しい。ただし次の 3 か所の記述が不正確。
  - §4d「すべて源の行折返し位置の語中空白」
  - §2 の型 7 の所見
  - key_guard final note の「行折返し由来の空白」
  推奨: evidence を「30 題 33 箇所のうち 31 箇所は行折返し位置、正解肢 2 箇所は改行と無関係な抽出時の空白 (源は無空白)」と訂正する。note は D-143 の後置を重ねるほどの誤りではないので据え置きでよい。
- **NIT-2** A2b / A2c への示唆 (iv)「残っていたのは行折返しの語中空白だけ」は、NIT-1 の 2 例を踏まえて「語中空白 (大半は行折返し由来)」とするのが正確。走査の除外ルールを作るときは、改行位置の一致を条件にしない方がよい。
- **NIT-3** 事後 machdiff (AGENT_MISSED 3) は reviewer が再現していない (gitignored の manifest を再生成するため、U11 と同じ扱い)。3 件の実残差の解消は出荷層で直接確認した。

### Rule D NIT の処置 (主 context、S127)
- NIT-1: §2・§4d の「行折返し由来」は不正確 — **33 箇所中 31 箇所が源の改行位置、2021r03-q004 ア / q073 イ の 2 箇所は行中** (削除自体は源どおりで正しい)。key_guard note は据置。
- NIT-2: 示唆 (iv) は「語中空白 (大半は行折返し由来)」と読み替える。今後の走査ルールで改行位置を条件にしない。
- NIT-3: 事後 machdiff は fixer §8 の結果に依拠 (reviewer は出荷層で実残差 3 件の消滅を直接確認)。対処不要。
