# X track X2 — 母数外 97 題 準備 (S130、x2-prep lane)

X track = ⑤-2 母数 (`evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json`) で `exams[].excluded[]` に入った題の IPA 源再核験。X2 = 2018h30a / 2018h30h / 2019h31h / 2021r03 / 2023r05 の excluded 全数。手順は S129 B track prep (`evidence/quiz_B13_2009h21a_prep_S129.md` ほか) と同一。本書は**起動前の準備のみ**で、workflow は未起動。data lock は持たないので、`data/ip/quiz/` 本体・bank (`data/ip/exams/`) には書いていない。書いたのは `.phase2/x2_*` の targets / manifest / args、precrop 出力、本 evidence 1 件だけ。git 操作なし。

---

## 0. 結論 (lead 向け要約)

- **起動阻害要因: なし**。page pointer の誤り 0、manifest の不良 0、答え漏洩 0、answer_affecting 疑い 0。manifest は再生成も patch も不要で、そのまま起動できる。
- 母数 **97 題** (2018h30a 33 / 2018h30h 30 / 2019h31h 13 / 2021r03 12 / 2023r05 9)。中問 member は **0** (5 exam とも中問なし、§2)。
- precrop **93 / 97** (96%)。crop 93 枚すべてで、先頭の 問NN 見出しが自題と一致することを目視で確かめた (誤帯 0)。
- `next_page_png` **97 / 97**、`prev_page_png` **97 / 97**。
- fixer に名指しで渡す候補 (§5): **semantic 候補 2** (2023r05-q059 / 2018h30a-q085 の下線 = 主キー表示の欠落)、**表記候補 2** (2023r05-q075 選択肢の ASCII `"` と `>=` (源は ’ ’ と ≧)、2019h31h-q025 題幹の ASCII `"`)。

## 1. 母数・targets

- targets: `data/ip/quiz/.phase2/x2_targets_S130.json` (schema `x2_targets/1`、x1 と同形)。

| exam | 題数 | qnums |
|---|---:|---|
| 2018h30a | 33 | 1,2,4,5,6,7,15,19,21,25,27,28,33,36,41,46,53,54,57,58,62,66,70,75,80,84,85,86,88,89,91,93,96 |
| 2018h30h | 30 | 7,11,16,17,19,20,21,26,27,31,39,48,49,52,54,55,60,64,70,72,73,77,80,81,90,91,95,97,99,100 |
| 2019h31h | 13 | 12,13,16,25,26,29,35,58,61,68,78,86,98 |
| 2021r03 | 12 | 17,28,29,36,38,46,50,67,74,83,95,99 |
| 2023r05 | 9 | 14,37,56,59,61,75,77,81,86 |
| 計 | **97** | |

- excluded の理由はどれも、過去に二重 pass を受けたこと (`s7x_A_scope_double_pass` / `stage5_3_stratified_double_pass` / `note_scan_B_double_pass`)。今回、源と再照合する。

## 2. 中問 (chumon) の所属

- `chumon_groups.json` は 50 組を登録している。その member に X2 の id は **0 件**。
- 登録組がある exam は 2009h21a〜2015h27h の 14 本だけ。L2f (`evidence/S128_L2f_chumon.md` l.12) によれば、「2016h28a〜2026r08 の 15 exam は q85〜100 も小問だけで、『中問』見出しは 0」。X2 の 5 exam はすべてこの範囲にある。bank の stem_jp にも「中問」「それぞれ四つの問い」は 0 件。
- したがって、前文の probe 照合、前文が manifest の頁に無い member の確認、chumon による precrop skip は、どれも対象外 (skip chumon = 0)。
- 見出しの残存: 表示 3 層 (jp 表示 stem / zh / en の stem・選択肢、計 97 題) を走査し、「問NN」「问NN」「QNN」「中問」「中问」「Medium question」「〔分野〕」「[Technology]」等は **0 件**。raw にだけ `2021r03-q074` の「問74 …」が残っている。表示層には stem_jp_clean があるので、学習者には見えない。

## 3. manifest + precrop

```
node scripts/quiz-fidelity-prep-multi.mjs x2 data/ip/quiz/.phase2/x2_targets_S130.json --precrop --model sonnet --pass sn
```

- 脚本は main tree のものを改修せずに使った。exit 0。
- 出力:
  - `data/ip/quiz/.phase2/x2_fidelity_input_multi.json` (97 samples)
  - exam ごとの `x2_fidelity_input_<exam>.json` × 5
  - `data/ip/quiz/.phase2/x2_workflow_args_multi.json`
- **manifest の検査** (脚本で確認、97 / 97):
  - stem が空の題 0。`correct_answer` ∉ {ア,イ,ウ,エ} の題 0。questions.json の correct_answer との不一致 0。
  - `displayed_stem_jp` は、表示層 (`translations/<exam>.json` `.questions[id].stem_jp_clean` が非空ならそれ、無ければ questions.json の `stem_jp`。quizModel.ts:120 と同じ規則) と **97 / 97 一致**。stem_jp_clean を持つ題は 75。
  - `displayed_choices_jp` は questions.json の `choices_jp` と、キーごとに値が 97 / 97 一致。キー順が ア〜エ でない題は 0。
  - 参照先のファイル (source / prev / next / crop) の欠落は 0。
- **`next_page_png` 97 / 97、`prev_page_png` 97 / 97**。全題の source 頁に、前頁と次頁が存在する (最後の X2 題でも 2021r03-q099 は page-45、2018h30h-q100 は page-43 で、次頁がある)。
- **crop 93 / 97**。skip は 4 題。

  | 題 | 理由 | 確認 |
  |---|---|---|
  | 2018h30a-q015 | merged_preamble (表示 262 字 vs bank 120 字。表を埋め込んだ clean) | page-07 を目視。問15 の stem・表・選択肢はすべて page-07 にある |
  | 2021r03-q028 / q029 | page-13 page_mismatch (見出しの検出 2、期待 3) | page-13 を目視。問27〜29 がすべて同頁にある |
  | 2023r05-q086 | page-40 page_mismatch (検出 3、期待 2。図中の「(2)」を見出しと誤検出) | page-40 を目視。問86 の stem・図・選択肢表はすべて同頁にある |

- **calib** (exam ごと):

  | exam | 範囲の頁 | head / body | odd / even |
  |---|---:|---|---|
  | 2018h30a | 23 | 140 / 200 | 同値 |
  | 2018h30h | 25 | 140 / 210 | even は fallback (全体 140 = 16p vs 150 = 17p で僅差) |
  | 2019h31h | 13 | 150 / 210 | 同値 |
  | 2021r03 | 11 | 150 / 220 | 同値 |
  | 2023r05 | 9 | 150 / 210 | 同値 |

- **`_precrop_report.json`**: 5 exam とも今回新規に作られた (以前の precrop dir に report は無かった)。
  - 頁の内訳は ok 78 / page_mismatch 2。
  - ok 頁の見出し 185 本は、すべて OCR verified で、unconfirmed は 0。
  - confusable_only の頁は 12 頁 (2018h30a 4 頁 / 2018h30h 8 頁)。OCR が 0↔9 を取り違えたもの (例: 問70 → 「問79」、問100 → 「問199」) で、照合は通っている。
  - 該当頁の crop (2018h30a-q019 / 021 / 028 / 070 / 091、2018h30h-q011 / 019 / 020 / 031 / 039 / 060 / 070 / 090 / 100) は、下の目視で見出しが正しいことを確認した。
- **crop 先頭の目視** (全 93 枚): contact sheet で各 crop 上端の 問NN を読んだ。**93 / 93 が自題の番号**で、誤帯は 0。
  - choices_next の疑いがある 4 題 (§4) と 2018h30h-q007 は、crop 全体を見て、選択肢 ア〜エ が crop 内にあることを確認した。
- 既存の crop との衝突: 既存の precrop dir には過去 unit の crop がある。X2 の id と重なるのは `2018h30h-q019.png` の 1 枚だけで、再生成後も **byte 一致** (cmp で確認)。他の既存 crop には触れていない。

## 4. page pointer の確認

- bank の `source.page_image` と、manifest の source 頁を全 97 題で突き合わせた (一覧は §7 の脚本出力)。
- **誤りは 0**。根拠は 3 つ。
  - 1. crop 93 題: ok 頁の OCR verified 見出しに、目視で crop 先頭の 問NN を足して確定した。
  - 2. skip 4 題: 頁を目視した (§3)。
  - 3. `S129_L2a_pageoffset_candidates.json` と照合した。live candidates のうち X2 の id は 9 件で、MISMATCH は 0。recall override の対象に X2 の id は無い。`S130_pageoffset_recheck.md` の 9 題にも X2 の id は無い。

| id | L2a | 本 prep の判定 |
|---|---|---|
| 2018h30a-q004 / q006 / q057、2019h31h-q078 | OK、choices_next=true (choices_best が 37 / 32 / 17 / 45 頁 = 短い選択肢が遠い頁に偶然一致したもの) | crop を目視。選択肢はすべて記録頁の crop 内にある → **FP** |
| 2018h30h-q007 | LOW_CONF (stem_best 22) | crop を目視。問7 の stem と選択肢は page-04 にある → **FP** |
| 2018h30a-q070、2018h30h-q080 / q090 / q100 | OK、map_disagree | crop の見出しは自題 (問70 / 80 / 90 / 100) → 正しい |

- 頁をまたぐ題: 頁の最後の題の crop は、帯が本文の下限 (tail 98px) まで切られる。2018h30a-q085 と 2019h31h-q098 は、crop を目視して頁内で完結していることを確かめた。他の題の頁またぎは全数を目視していない。L2a の choices_next の真陽性は X2 に 0 件。どの題でも agent は `next_page_png` (97 / 97) で次頁を読める (S130 規約: page_number = 題幹頁)。

## 5. 名指し項目 (fixer / reviewer 向け。核験 agent の prompt には入れない)

### 5.1 答え漏洩 (D-163 / D-168)

- **語の走査: 0 件**。表示 3 層 (jp 表示 stem・jp 選択肢・zh / en の stem・選択肢) を、次の語で走査した: 正解 / 不正解 / 正しい図 / 誤った図 / 错误图 / 正确图 / 答案 / correct answer / Correct figure / the answer is / 正しいもの[はが]。
- **AI 言語化の目視**: 図を持つ 36 題の表示 jp を全文読み、そのうち言語化がある題は源図とも照合した。

  | 題 | 言語化 | 源との照合 | 漏洩 |
  |---|---|---|---|
  | 2018h30h-q054 | 図 a〜d のグラフ形状を箇条書き | p24 と一致 (a 山型 / b 右肩上がり急増 / c 右肩下がり / d 水平) | なし。形状の記述だけで、どの工程量かのラベルは付いていない。D-163 の境界として注記: 図 lane で図の添付に置き換える候補 |
  | 2019h31h-q026 | PPM 2×2 表 + 軸の向き | p11 と一致 (縦 = 市場占有率で上が高、横 = 市場成長率で左が低) | なし (「金のなる木」等の象限名は付いていない) |
  | 2019h31h-q058 | ネットワーク構成の箇条書き | p23 と一致 | なし (「デフォルトゲートウェイ」相当の役割語は付いていない) |
  | 2021r03-q050 | 〔条件〕と 2 表 | p23 と一致 | なし |
  | 2021r03-q074 | 流れ図 X / Y の文章化 | p35 と一致 (ループ端の記号名「変換」は源のまま) | なし |
  | 2023r05-q086 | 手順図の箇条書き | p40 と一致 (a / b は空欄のまま) | なし |
  | 2018h30a-q005 | スケジュール図 1 行 + 図題 | 源の図は A→B→C の例 (図題どおり) | なし (正答は C→A→B) |
  | 2018h30h-q081 | 選択肢の表 (下線を「（主キー）」と言語化) | p36 と一致 | なし |

- 2019h31h-q098 / 2023r05-q075 の表 C2「合格」は、源のワークシートにある (p40 / p35)。AI が書き足したものではない。

### 5.2 answer_affecting の疑い: **なし**

- 表示層で correct_answer と矛盾する題は 0。表示層 (図の題は源図) から再導出し、すべて一致した:
  - 2018h30a: q001 a ア / q004 a,c ウ / q005 C→A→B (29 分) ウ / q006 385,000/500,000 = 77% ア / q015 A23 B25 C22 D20 → B イ / q019 1店舗売上 20→22→25・利益率 10→18→24% ウ / q027 100,000/(2/3) = 150,000 ア / q057 ②③ エ / q080 $B5*(1+$D$2) = 630 ウ / q093 b,c エ
  - 2018h30h: q007 ダイバーシティ イ / q011 240/600 = 40% ア / q019 経常 550→1,100 ウ / q027 変動費率 0.6 → 固定費 3,000 イ / q060 エ / q100 ウ
  - 2019h31h: q012 500 個×20g×0.6 = 6,000 ウ / q026 A ア / q058 ルータ ア / q068 A=30 ア / q078 H002・H003 → 2 イ / q098 ア
  - 2021r03: q028 3,000−1,500−500−15 = 985 ウ / q050 3+60+3+60 → 153 待ち +10+60 = 223 ア / q074 i+2k・k:2,2,6 エ / q095 B 24,000・C 21,000 (A 18,000 は未満) ウ
  - 2023r05: q059 エ / q077 数学 z = 2.17 ウ / q075 ウ / q086 共通・公開 ア

### 5.3 源で見た表示差分の候補 (本 prep の目視。key には影響しない)

| 題 | 種別 | 内容 |
|---|---|---|
| `2023r05-q059` | semantic 候補 | 源 (p27) は、会員管理表 (店舗コード・会員番号) と、選択肢 ア〜エ の主キーに**下線**を引いている。表示 jp は表・選択肢とも下線 (主キー) の情報を落としている。題幹は「表中の下線は主キーを表し」と言うのに、表示には下線が無い。正答 エ は属性集合だけでも導けるので、aa ではない |
| `2018h30a-q085` | semantic 候補 (crop 目視済) | 源 (p34) は、表 (担当社員 / 地区 / A) と選択肢 ア〜エ の顧客コードに実線の下線 (主キー) を引き、イ / ウ / エ の社員コード・地区コードには破線の下線 (外部キー) を引いている。表示 jp は表・選択肢とも下線の区別を落としているが、題幹は「下線のうち実線は主キーを，破線は外部キーを表す」と言う。属性集合で エ は導けるので aa ではない |
| `2023r05-q075` | 表記 (D-166 関連) | 源 (p35) の選択肢は `≧`・`’合格’,’不合格’`。表示 jp 4 肢は `>=`・ASCII `"合格"`。D-166 (「源の ASCII " を保つ」) の逆向きの場合で、源は ’ ’。同型の 2019h31h-q098 は、表示も源どおり `≧`・`'合格'`。backlog 0q.prose @jp 16 / @zh 16 はこれに当たる |
| `2019h31h-q025` | 表記 | 題幹の `"利益÷資本"` が ASCII `"`。散文の引用符なので、源の “” 系と思われる (backlog 0q.prose @jp 2)。D-155 / D-162 の字形の判断に回す |
| `2018h30a-q093` | 表記 | 選択肢の読点が混在 (ア `a, b` / イ `a，c` / エ `b, c`) |

### 5.4 A1 backlog (`backlog_scan_A1_S127.json`、X2 の id で抽出)

- **候補 347 件 / 47 題**。high は **198 件 / 32 題**。このうち **resolved は 42 件**、未処置の high は **156 件 / 30 題**。
  - resolved の内訳は 2 つ。
    - raw だけの 0q.prose 40 件 (表示 jp に ASCII `"` が無く、学習者に見えない。B7 の規則)。
    - zh の 0q.prose 2 件 (現 zh に ASCII `"` が無い。B8 の規則)。
- **priority の規則**: B2 / B3 / B5〜B13 と同じ。
  - high = 0a.* (prose sub) / 0b.* / 0c.* (rare_kanji を除く) / 0q.prose / 1.mid@jp / 7.* (comma_nospace を除く) / 10.* / 2.nine_six (cross・ends96)。
  - それ以外は low。
- **rule 別の内訳** (全候補): 2.nine_six 103 / 0q.prose 76 / 0a.num 31 / 0a.word 30 / T.table 29 / 0a.ins 19 / 7.space 18 / 0c.tr_of_anomaly 8 / T.num_vs_fig 7 / 0c.rare_kanji 5 / 0q.en 5 / T.num_raw_clean 5 / 0a.char 4 / 7.comma_nospace 4 / 0b.num_missing 1 / 0c.isolated_kanji 1 / 1.head 1。
- **未処置 high の題別上位**: 2023r05-q075 33 / 2021r03-q095 12 / 2018h30h-q054 11 / 2021r03-q074 10 / 2023r05-q077 10 / 2019h31h-q078 9 / 2018h30a-q005 8 / 2019h31h-q058 8 / 2018h30h-q055 7 / 2018h30h-q060 6 / 2021r03-q050 6 / その他 36。
- **優先度** (本 prep の所見):

  | 優先 | 題 | 理由 |
  |---|---|---|
  | **P1** | 2023r05-q075 | 0q.prose 32 件は §5.3 の ASCII `"` (源は ’) で、学習者に見える。zh も同じ。0a.num (128→120) は表示が源どおり |
  | **P1** | 2023r05-q059 / 2018h30a-q085 | §5.3 の下線の欠落。backlog が出しているのは q059 の 7.space だけで、下線の欠落という型としては検出されていない |
  | P2 | 2019h31h-q025 | ASCII `"` が jp に 2 件 |
  | P3 (FP 見込み) | 0a.* @jp_raw→jp の大半 | 0a.* は raw→clean の差で、clean 側 (表示) が源どおり。crop / 頁で確認できた例: 2018h30h-q055 (1,800 万円 / 60 本 / 40 本)、q080 (0.9)、q026 (a〜c)、q052 (職務分掌)、2018h30a-q002 / q006、2019h31h-q026 / q058、2021r03-q050 (片道 60 秒) / q074、2023r05-q075 (120 点) / q077 (10,000 人) / q086。未確認は 2018h30a-q005「並行して」、2018h30h-q100「発生しやすい」、2019h31h-q013「また，」、2019h31h-q061、2023r05-q037「a 上の独立性が確保されている必要がある」の 5 件で、fixer が源で確かめる |
  | P3 (FP 見込み) | 2.nine_six (ends96) 全件 | 表の数値 (q095 の商品コード、q078 の社員 ID 等) |
  | P3 (FP 見込み) | 7.space (table) | 表中の氏名「伊藤 花子」等の空白は、源どおり |
  | P3 (FP) | 2018h30h-q019 0b.num_missing@en | 「2倍」→ “doubled” |

- 0c (isolated_kanji / tr_of_anomaly): 2018h30h-q054 の 1 組だけ (rare_kanji 系は low)。

### 5.5 字形 (D-155 / D-162 で fixer が判断)

散文の「、」(源は「，」) が多くの題にある (例: 2019h31h-q012 / q078、2021r03-q050 / q074、2023r05-q059 / q075 / q077 / q086)。表示 stem に半角 `, ` (源は「，」) の題もある (2018h30a-q005、2018h30h-q027 / q081、2019h31h-q025 / q086、2021r03-q067)。ここに挙げたのは例示で、全数ではない。

## 6. Workflow 起動引数

- args: **`data/ip/quiz/.phase2/x2_workflow_args_multi.json`**
  - `input_path` = `data/ip/quiz/.phase2/x2_fidelity_input_multi.json`
  - `exam_id` = `"multi"`
  - `ids` = 97 件
  - `model` = sonnet、`label` = x2、`pass` = sn
  - `out_path` = `evidence/phase5/stage_06_quiz_fidelity/x2_fidelity_multi_sn.json`
  - `parts_dir` = `data/ip/quiz/.phase2/fidparts/x2_multi_sn`
- 起動直前の手順: 同じコマンドで manifest を作り直す (冪等、0 token)。先行 unit (T1 / X1 等) の apply で表示層が変わった場合に備えるため。page patch は不要。
- run の後:
  1. `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/x2_multi_sn data/ip/quiz/.phase2/x2_fidelity_input_multi.json multi evidence/phase5/stage_06_quiz_fidelity/x2_fidelity_multi_sn.json --journal <journal.jsonl>`
  2. `node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/x2_fidelity_input_multi.json evidence/phase5/stage_06_quiz_fidelity/x2_fidelity_multi_sn.json`

## 7. 見積もりと所見

- agent は 97 体 (Sonnet 5、1 題 1 体)。token は ≈ 500〜560 万の見込み。
  - B9 の実績 5,707,937 / 100 題 (crop 無し 14 題) を基準にした。
  - X2 は crop 率 96% で、中問 (長い前文) が無い。そのため 1 題あたりは B 系より軽い見込み。
- 後段は fixer opus 1 + reviewer opus 1 (別 type、Rule D)。
- 脚本の警告は page_mismatch 2 頁 + merged_preamble 1 題だけで、どれも目視で原因を確定済み。
- 検査に使った脚本は scratchpad にある (repo には入れていない)。
  - analyze.cjs: manifest / chumon / L2a / backlog / 漏洩 / 見出しの検査
  - sheet.cjs: crop の contact sheet
