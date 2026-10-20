# X track X3 — 母数外 88 題 準備 (S130、x3-prep lane)

X track = ⑤-2 母数 (`evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json`) で `exams[].excluded[]` に入った題の IPA 源再核験。X3 = 2019r01a / 2020r02o の excluded 全数。手順は X1 (`evidence/quiz_X1_prep_S130.md`) / X2 (`evidence/quiz_X2_prep_S130.md`) と同一。本書は**起動前の準備のみ**で、workflow は未起動。data lock は持たないので、`data/ip/quiz/` 本体・bank (`data/ip/exams/`) には書いていない。書いたのは `.phase2/x3_*` の targets / manifest / args、precrop 出力、本 evidence 1 件だけ。git 操作なし。

---

## 0. 結論 (lead 向け要約)

- **起動阻害要因: なし**。page pointer の誤り 0、manifest の不良 0、答え漏洩 0、answer_affecting 疑い 0。manifest はそのまま起動できる。
- 母数 **88 題** (2019r01a 48 / 2020r02o 40)。中問 member **0** (§2)。
- precrop **82 / 88** (93%)。crop 82 枚すべてで先頭の 問NN が自題と一致することを目視で確かめた (誤帯 0)。skip 6 題は頁を目視し、題がすべて記録頁内で完結していることを確認した。
- `next_page_png` **88 / 88**、`prev_page_png` **88 / 88**。
- fixer に名指しで渡す候補 (§5): **表示の行分割残骸 (語中空白) 4 題** (2019r01a-q058「適 切」、2020r02o-q021「戦 略」、2020r02o-q083「投 影」、2020r02o-q070 ウ「データ を」)、**引用符の字形 5 題** (源は “ ” だが表示は「」: 2019r01a-q070 / q082 / q099、2020r02o-q057 / q071)。semantic 候補は 0。

## 1. 母数・targets

- targets: `data/ip/quiz/.phase2/x3_targets_S130.json` (schema `x3_targets/1`、x2 と同形 + `reasons` 集計)。

| exam | 題数 | qnums |
|---|---:|---|
| 2019r01a | 48 | 1,2,5,9,10,13,17,21,22,25,26,27,31,33,34,35,37,40,42,44,45,47,49,50,53,55,58,59,60,63,64,65,69,70,71,72,76,77,79,81,82,83,87,89,91,93,96,99 |
| 2020r02o | 40 | 3,7,9,10,13,14,18,20,21,25,27,28,30,31,33,34,37,41,46,47,48,55,57,62,66,70,71,72,73,76,77,79,81,83,87,92,94,95,96,99 |
| 計 | **88** | |

- 除外理由 (全題、過去に二重 pass 済み): s7x_A_scope 43 / pilot_B_sample 20 / stage5_3_stratified 18 / note_scan_B 3 / s7x_A+note_scan_B 2 / s7x_A+stage5_3 2。X1 / X2 と同じく命中率は B track より低い前提。

## 2. 中問 (chumon) の所属

- `chumon_groups.json` に 2019r01a / 2020r02o の登録 **0 件**。L2f (`evidence/S128_L2f_chumon.md`) の no_chumon 範囲 (2016h28a〜) に入る。bank の stem にも「中問」は無い。前文 probe 照合・前文頁確認・chumon skip は対象外 (skip chumon = 0)。
- 見出しの残存: 表示 3 層 (jp 表示 stem / zh / en の stem・選択肢、88 題) を X2 と同じ正規表現 (問NN / 问NN / QNN / 中問 / 中问 / Medium question / 分野見出し) で走査し **0 件**。raw (stem_jp_clean がある題の bank stem) にも 0 件。

## 3. manifest + precrop

```
node scripts/quiz-fidelity-prep-multi.mjs x3 data/ip/quiz/.phase2/x3_targets_S130.json --precrop --model sonnet --pass sn
```

- 脚本は改修せずに使った。exit 0。
- 出力: `data/ip/quiz/.phase2/x3_fidelity_input_multi.json` (88 samples)、exam 別 `x3_fidelity_input_<exam>.json` × 2、`data/ip/quiz/.phase2/x3_workflow_args_multi.json`。
- **manifest の検査** (脚本で確認、88 / 88):
  - stem が空 0。`correct_answer` ∉ {ア,イ,ウ,エ} 0。questions.json の correct_answer との不一致 0。
  - `displayed_stem_jp` = 表示層 (`translations/<exam>.json` `.questions[id].stem_jp_clean` が非空ならそれ、無ければ questions.json `stem_jp`) と **88 / 88 一致**。stem_jp_clean を持つ題は 56。bank raw とは比較していない。
  - `displayed_choices_jp` は questions.json `choices_jp` とキーごとに 88 / 88 一致。キー順が ア〜エ でない題 0。
  - 参照ファイル (source / prev / next / crop) の欠落 0。bank `source.page_number` = manifest の source 頁 88 / 88。
- **crop 82 / 88**。skip 6 題はすべて頁を目視して確認した。

  | 題 | 理由 | 確認 |
  |---|---|---|
  | 2019r01a-q037 | page-16 page_mismatch (検出 1、期待 2。分野見出し枠の直後の 問36 を取り逃し) | page-16 を目視。問37 の stem・選択肢は同頁 |
  | 2019r01a-q047 | merged_preamble (表示 367 字 vs bank 194 字。表を埋め込んだ clean) | page-20 を目視。問47 の stem・表 (選択肢 = 表の行) は同頁 |
  | 2019r01a-q064 / q065 | page-28 page_mismatch (検出 3、期待 2。q065 の空欄枠を見出しと誤検出) | page-28 を目視。問64・問65 (記述・a/b 表) とも同頁 |
  | 2020r02o-q003 | page-03 page_mismatch (検出 1、期待 2。問3 見出し左の汚れ点) | page-03 を目視。問3 の stem・選択肢は同頁 |
  | 2020r02o-q055 | merged_preamble (表示 201 字 vs bank 98 字。アローダイアグラムの言語化) | page-25 を目視。問55 の図・選択肢表は同頁 |

- **calib**: 2019r01a head 150 / body 210 (37 頁、odd/even 同値)、2020r02o head 140 / body 200 (30 頁、odd/even 同値)。
- **`_precrop_report.json`**: 2 exam とも今回新規 (既存 dir に report は無かった)。
  - ok 64 頁 (2019r01a 35 / 2020r02o 29)、page_mismatch 3 頁。ok 頁の見出し 155 本 (85 + 70) はすべて OCR verified、unconfirmed 0。
  - confusable_only 頁 8 (2019r01a page-06/18/26/30/34/38、2020r02o page-06/10)。OCR の 0↔9 / 1↔9 取り違え (例 問70→「問79」、問89→「間88」)。該当 crop (2019r01a-q010 / 040 / 060 / 069 / 070 / 079 / 089、2020r02o-q010 / 020 / 021) は下の目視で見出しが正しいことを確認。
- **crop 先頭の目視** (全 82 枚): contact sheet 4 枚で各 crop 上端の 問NN を読み、**82 / 82 が自題の番号**。choices_next 候補 4 題 (§4) は crop 全体を見て選択肢が帯内にあることを確認。
- **既存 crop との衝突 / 退避**: 上書き前の precrop dir 2 本 (2019r01a 51 枚 / 2020r02o 60 枚、report なし) を `/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/38b9b286-d572-4355-b63d-7392c68f7a4f/scratchpad/x3/precrop_backup/` に退避した。X3 の id と重なる既存 crop は `2020r02o-q096.png` の 1 枚だけで、再生成後も **byte 一致** (退避 111 枚全数を cmp、差分 0)。他の既存 crop には触れていない。

## 4. page pointer の確認

- **誤りは 0**。根拠:
  1. `quiz-pageoffset-scan-S129.mjs` を現 bank に対して再走査 (OCR cache = S129 `/private/tmp/claude-501/s129-l2a/ocr`)。2019r01a / 2020r02o とも MISMATCH 0 / LOW_CONF 0。X3 の候補行 5 件はすべて OK で、記録頁 = manifest の source 頁。
  2. `S129_L2a_pageoffset_candidates.json` の live candidates でも X3 は同じ 5 件、recall override の対象は 0。`S130_pageoffset_recheck.md` の対象にも X3 の id は無い。
  3. crop 82 題は OCR verified 見出し + 目視、skip 6 題は頁目視 (§3)。

| id | L2a / 再走査 | 本 prep の判定 |
|---|---|---|
| 2019r01a-q072 / q082 / q089、2020r02o-q071 | OK、choices_next=true (choices_best が 12 / 30 / 30 / 35 頁 = 短い選択肢 bigram の偶然一致) | crop を目視。選択肢 ア〜エ は記録頁の crop 内 → **FP** |
| 2019r01a-q001 | OK、map_disagree (heading map 1 / vision 2) | crop 先頭が 問1 (page-02) → 正しい |

- 頁をまたぐ題: CHOICES_NEXT の真陽性 0。どの題も `next_page_png` (88 / 88) で次頁を読める (S130 規約: page_number = 題幹頁)。

## 5. 名指し項目 (fixer / reviewer 向け。核験 agent の prompt には入れない)

### 5.1 答え漏洩 (D-163 / D-168)

- **語の走査: 0 件**。表示 3 層 (jp 表示 stem・jp 選択肢・zh / en の stem・選択肢) を X2 と同じ語 (正解 / 不正解 / 正しい図 / 誤った図 / 错误图 / 正确图 / 答案 / correct answer / Correct figure / the answer is / 正しいもの[はが] 等) で走査。
- **AI 言語化の目視**: 図を持つ 21 題の表示 jp を全文読み、言語化のある題は源と照合した。

  | 題 | 言語化 | 源との照合 | 漏洩 |
  |---|---|---|---|
  | 2020r02o-q055 | アローダイアグラムの箇条書き + 凡例 | p25 と一致 (A 30〜35 / B 50〜60 / C 70〜100、凡例) | なし (経路の和やクリティカルパスは書いていない) |
  | 2019r01a-q082 | 番号体系図の箇条書き | p35 と一致 (020 の後の先頭桁 1〜3・5〜9、以降 0〜9) | なし。括弧内注記「（「020」に続く先頭の□を除く，それ以降の各□）」は図の括弧の範囲を言葉にしたもので、桁数は書いていない |
  | 2020r02o-q072 | PC-A / PC-B の処理内容 | p33 と一致 (①読込 −5、③書込、②読込 +7、④書込) | なし (更新の喪失は書いていない) |
  | 2019r01a-q026 | 〔条件〕+ 表 + 注記「網掛けの部分は表示していない」 | p12 と一致 (網掛けセルは空欄) | なし |
  | 2019r01a-q070 | 手順表 + 英字↔番号表 | p30 と一致 | なし |
  | 2019r01a-q047 | 表 (選択肢 = 表の行) | p20 と一致 | なし |
  | 2019r01a-q002 / q034 / q076、2020r02o-q033 / q071 / q073 | 表・ワークシート | 源と一致 (q002 p2 売上原価 780 等、q033 p15 の表) | なし |

### 5.2 answer_affecting の疑い: **なし**

表示層 (図の題は源) から再導出し、すべて correct_answer と一致した:
- 2019r01a: q002 営業 1,000−780−130−5 = 85・経常 85+20+3−16 = 92 ア / q026 第2週末在庫 20、第3週必要 40+10 → 30 ア / q034 2,000n×300 ≥ 2,400 万 → 40 エ / q047 A 工程 0.6・0.7・0.2・0.4、B 0.3・0.5・0.8・0.1 → 機能4 エ / q060 SRAM・DRAM・SSD ウ / q065 イ / q070 EGE = 4,6,4 → 3,4,1 = DEB イ / q072 5×5 = 25 エ / q076 C5 = 1,000×18/3 = 6,000 イ / q079 Bcc の R のみ エ / q082 9×10^(n−4) ≥ 8×10^9 → 13 ウ / q083 ウ / q093 ウ / q099 エ
- 2020r02o: q033 200 人×(p−1,000) ≥ 200,000 → 2,000 エ / q055 最短 max(80,70) = 80・最長 max(95,100) = 100 エ / q062 155 = 10011011 ア / q066 ア / q071 E4 = 2 ウ / q072 ③5 → ④17 エ / q073 エ / q081 エ / q087 ア / q092 ア / q095 8,000 Mbit ÷ 16 Mbps = 500 エ

### 5.3 源で見た表示差分の候補 (key には影響しない)

| 題 | 種別 | 内容 |
|---|---|---|
| `2019r01a-q058` | 表記 (行分割残骸) | 表示 stem「…記述のうち, 適 切なものはどれか。」の語中空白。源 (p25、crop 目視) は「適切」 |
| `2020r02o-q021` | 表記 (行分割残骸) | 表示 stem「…事業の戦 略的位置付け…」。源は「戦略的」 |
| `2020r02o-q083` | 表記 (行分割残骸) | 表示 stem「…映像などを投 影し…」。源は「投影」 |
| `2020r02o-q070` ウ | 表記 (行分割残骸) | 表示「…まとめたデータ を順次作成し,直前の…」。語中空白に加え「,直前」の読点後空白が他と不揃い |
| `2019r01a-q070` | 表記 (引用符) | 源 p30 は “EGE” / “FAX”、表示は「EGE」「FAX」 |
| `2019r01a-q082` | 表記 (引用符) | 源 p35 は “020”、表示は「020」(題幹 1 箇所。他 2 箇所は AI 言語化部分) |
| `2019r01a-q099` | 表記 (引用符) | 源 p43 は “?” “*” “データ”、表示は「」 |
| `2020r02o-q057` | 表記 (引用符) | 源 p26 は “社員”、表示は「社員」 |
| `2020r02o-q071` | 表記 (引用符・記号) | 源 p32 は “条件付個数 (B2:D2,＞15000)”、表示は「条件付個数(B2:D2,>15000)」。式なので D-151 の扱いも併せて fixer が判断 |

引用符は 2019r01a-q047 “不良密度”、q076 の式、2020r02o-q030 “E” の 3 題が源どおり “ ” で、上の 5 題だけが「」に置き換わっている。D-155 / D-162 / D-166 の字形判断に回す。

### 5.4 A1 backlog (`backlog_scan_A1_S127.json`、X3 の id で抽出)

- **候補 171 件 / 32 題**。high **111 件 / 20 題**。resolved **21 件** (raw だけの 0q.prose = 表示 jp に ASCII `"` が無く学習者に見えない。B7 の規則)。未処置 high **90 件 / 17 題**。
- priority 規則は X2 (B2 / B3 / B5〜B13) と同じ。
- **rule 別** (全候補): 2.nine_six 55 / 0q.prose 21 / 0a.num 16 / T.table 11 / 0b.abbr_missing 10 / 0a.word 8 / 0b.num_missing 8 / 7.comma_nospace 8 / 7.space 7 / 0a.char 7 / 0a.ins 6 / T.num_vs_fig 5 / 0c.tr_of_anomaly 4 / 0c.rare_kanji 2 / T.num_raw_clean 2 / 0q.en 1。
- **未処置 high の題別**: 2019r01a-q047 22 / q070 22 / 2020r02o-q055 12 / 2019r01a-q076 6 / q082 6 / q002 4 / 2020r02o-q033 3 / q096 3 / 2019r01a-q072 2 / q026 2 / 2020r02o-q071 2 / 他 6 題各 1。
- **優先度** (本 prep の所見):

  | 優先 | 題 | 理由 |
  |---|---|---|
  | **P1** | 2019r01a-q058、2020r02o-q021 / q083 / q070 | 7.space の語中空白。§5.3 の行分割残骸で、学習者に見える |
  | P2 | §5.3 の引用符 5 題 | backlog 外。字形判断待ち |
  | P3 (FP) | 2019r01a-q047 の 0b.* 16 件 | zh / en の選択肢は「功能1」「Function 1」だけだが、源の選択肢も「機能1」で、表は zh / en の stem に全行ある。jp 選択肢の「[表] …」は既存の運用 |
  | P3 (FP、解消済) | 2020r02o-q096 0b.abbr_missing@zh/en (ISO) | 現 zh / en は「ISO」で源 (p44「ISO で定められた」) どおり。backlog 時点の zh「OSI（开源促进会）」は既に是正済み |
  | P3 (FP) | 0a.* @jp_raw→jp 全件 | clean (表示) が源どおり: q002 780、q047 条件文、q070「n 文字目に n」、q079「Q さん」、q082、2020r02o-q033「購入者による」「マイナスとならない」、q055 言語化、q071「複写したとき」、q094「漏えいした」、q096「Open」 |
  | P3 (FP) | 2.nine_six (ends96) 全件 | 表の数値 (q070 の文字番号表、q002 金額、q076 ワークシート等) |
  | P3 (FP) | 7.space (table) 3 件 | q002「単位 億円」、q026「単位 個」「注記 網掛け」は源どおり |

- 0c は 2019r01a-q063 / 2020r02o-q003 の rare_kanji 系だけ (low)。

### 5.5 字形 (D-155 / D-162 で fixer が判断)

- 散文の半角「, 」(源は「，」): **60 題**。例示は省略 (X1 / X2 と同じ型)。
- 「、」(源は「，」): 16 field (2019r01a-q005 / q022 4 肢 / q035 / q058 4 肢、2020r02o-q033 / q037 / q048 イ / q055 / q071 / q095)。2020r02o-q033 は p15 で「，」を確認。
- 全角数字 0。

## 6. Workflow 起動引数

- args: **`data/ip/quiz/.phase2/x3_workflow_args_multi.json`**
  - `input_path` = `data/ip/quiz/.phase2/x3_fidelity_input_multi.json`
  - `exam_id` = `"multi"`、`ids` = 88 件
  - `model` = sonnet、`label` = x3、`pass` = sn
  - `out_path` = `evidence/phase5/stage_06_quiz_fidelity/x3_fidelity_multi_sn.json`
  - `parts_dir` = `data/ip/quiz/.phase2/fidparts/x3_multi_sn`
- 起動直前: 同じコマンドで manifest を作り直す (冪等、0 token。先行 unit の apply で表示層が変わった場合に備える)。page patch は不要。
- run の後:
  1. `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/x3_multi_sn data/ip/quiz/.phase2/x3_fidelity_input_multi.json multi evidence/phase5/stage_06_quiz_fidelity/x3_fidelity_multi_sn.json --journal <journal.jsonl>`
  2. `node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/x3_fidelity_input_multi.json evidence/phase5/stage_06_quiz_fidelity/x3_fidelity_multi_sn.json`

## 7. 見積もりと所見

- agent 88 体 (Sonnet 5、1 題 1 体)。token ≈ 450〜500 万の見込み (X2 の見積もり 500〜560 万 / 97 題と同型: crop 率 93%、中問なし、長い stem は q070 / q047 程度)。
- 後段は fixer opus 1 + reviewer opus 1 (別 type、Rule D)。
- 脚本の警告は page_mismatch 3 頁 + merged_preamble 2 題だけで、どれも目視で原因を確定済み。
- 検査に使った脚本は scratchpad `/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/38b9b286-d572-4355-b63d-7392c68f7a4f/scratchpad/x3/` (analyze.cjs / sheet.cjs / ocrtop.cjs、X2 版を x3 に置換したもの。repo には入れていない)。
