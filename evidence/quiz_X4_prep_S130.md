# X track X4 — 母数外 102 題 準備 (S130、x4-prep lane)

X track = ⑤-2 母数 (`evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json`) で `exams[].excluded[]` に入った題の IPA 源再核験。X4 (X track の最後) = 2022r04 / 2024r06 / 2025r07 / 2026r08 の excluded 全数。手順は X2 (`evidence/quiz_X2_prep_S130.md`) / X3 (`evidence/quiz_X3_prep_S130.md`) と同一。本書は**起動前の準備のみ**で、workflow は未起動。data lock は持たないので、`data/ip/quiz/` 本体・bank (`data/ip/exams/`) には書いていない。書いたのは `.phase2/x4_*` の targets / manifest / args、precrop 出力、本 evidence 1 件だけ。git 操作なし。

---

## 0. 結論 (lead 向け要約)

- **起動阻害要因: なし**。page pointer の誤り 0、manifest の不良 0、答え漏洩 0、answer_affecting 疑い 0。manifest はそのまま起動できる。
- 母数 **102 題** (2022r04 25 / 2024r06 28 / 2025r07 20 / 2026r08 29)。中問 member **0** (§2)。
- precrop **101 / 102** (99%)。crop 101 枚すべてで先頭の 問NN が自題と一致することを目視で確かめた (誤帯 0)。skip 1 題 (2022r04-q042) は頁を目視し、題が記録頁内で完結していることを確認した。
- `next_page_png` **102 / 102**、`prev_page_png` **102 / 102**。
- `2024r06-q058` (S130 で page 26→25 に是正) は X4 の母数に**入っていない** (2024r06 の excluded は q057 / q061 で q058 は無い)。bank は page 25 のまま。
- 既知の残差 `2026r08-q057` (U11 Rule D NIT-2) は X4 に入っている。表示 jp の選択肢 ア〜エ 4 肢が ASCII `"学生"` 等のまま (源 p27 は “ ”) で、未是正を確認した (§5.3)。
- fixer に名指しで渡す候補 (§5): **表示の行分割残骸 4 題** (2025r07-q002「ガ⏎イドライン」改行、2022r04-q080「情報システム と」、2024r06-q061 イ「ハードディスク に」、2024r06-q005 ウ「学術機関 他の企業」= 源「学術機関，他の企業」の読点欠落)。**引用符の字形 6 題** (源は “ ” / ‘ ’、表示は「」または ASCII `"`)。**表示書式 2 題** (2022r04-q059 選択肢に表の見出し行が混入、2026r08-q057 主キーの下線が表から落ちている)。semantic 候補は 0。

## 1. 母数・targets

- targets: `data/ip/quiz/.phase2/x4_targets_S130.json` (schema `x4_targets/1`、x3 と同形 + `reasons` 集計)。

| exam | 題数 | qnums |
|---|---:|---|
| 2022r04 | 25 | 11,28,30,33,42,46,50,53,57,59,60,63,64,65,72,78,79,80,82,90,93,96,97,98,99 |
| 2024r06 | 28 | 1,5,8,11,15,20,25,26,30,35,39,44,46,49,51,55,57,61,65,70,75,79,81,83,86,90,93,96 |
| 2025r07 | 20 | 2,17,23,26,30,31,34,35,37,45,54,59,62,66,69,71,76,77,78,99 |
| 2026r08 | 29 | 1,3,7,9,13,14,23,26,36,37,39,43,44,45,46,50,56,57,58,61,62,65,68,80,85,92,93,96,99 |
| 計 | **102** | |

- 除外理由 (どれも過去に二重 pass 済み): s7x_A_scope 59 / pilot_B_sample 20 / stage5_3_stratified 18 / note_scan_B 3 / s7x_A+stage5_3 2。X1〜X3 と同じく、命中率は B track より低いと見込む。

## 2. 中問 (chumon) の所属

- `chumon_groups.json` に 4 exam の登録は **0 件**。L2f の no_chumon 範囲 (2016h28a 以降) に入る。前文 probe の照合・前文頁の確認・chumon skip はいずれも対象外 (skip chumon = 0)。
- 見出しの残存: 表示 3 層 (jp 表示 stem / zh / en の stem・選択肢、102 題) を X2 / X3 と同じ正規表現 (問NN / 问NN / QNN / 中問 / 中问 / Medium question / 分野見出し) で走査し **0 件**。raw だけに 2 件ある (2022r04-q057「問57」、2025r07-q099「問99」)。どちらも stem_jp_clean を持つ題で、raw は学習者に見えない。

## 3. manifest + precrop

```
node scripts/quiz-fidelity-prep-multi.mjs x4 data/ip/quiz/.phase2/x4_targets_S130.json --precrop --model sonnet --pass sn
```

- 脚本は改修せずに使った。exit 0。
- 出力: `data/ip/quiz/.phase2/x4_fidelity_input_multi.json` (102 samples)、exam 別 `x4_fidelity_input_<exam>.json` × 4、`data/ip/quiz/.phase2/x4_workflow_args_multi.json`。
- **manifest の検査** (脚本で確認、102 / 102):
  - stem が空の題 0。`correct_answer` ∉ {ア,イ,ウ,エ} の題 0。questions.json の correct_answer との不一致 0。
  - `displayed_stem_jp` は表示層 (`translations/<exam>.json` `.questions[id].stem_jp_clean` が非空ならそれ、無ければ questions.json `stem_jp`) と **102 / 102 一致**。stem_jp_clean を持つ題は 70。
  - `displayed_choices_jp` は questions.json `choices_jp` とキーごとに 102 / 102 一致。キー順が ア〜エ でない題 0。
  - 参照ファイル (source / prev / next / crop) の欠落 0。bank `source.page_number` は manifest の source 頁と 102 / 102 一致。
- **crop 101 / 102**。skip 1 題は頁を目視して確認した。

  | 題 | 理由 | 確認 |
  |---|---|---|
  | 2022r04-q042 | page-19 page_mismatch (検出 2、期待 3) | page-19 を目視。問40・41・42 が同頁にあり、問42 の stem・選択肢 (2 列) も同頁で完結 |

- **calib**: 2022r04 head 150 / body 230 (21 頁。odd 150/210、even 160/230 で偶奇差あり)、2024r06 150 / 210 (27 頁。odd body 220)、2025r07 140 / 200 (18 頁、偶奇同値)、2026r08 150 / 210 (26 頁、偶奇同値)。
- **`_precrop_report.json`**: 4 exam とも今回の新規作成 (既存 dir に report は無かった)。
  - ok 91 頁 (20 / 27 / 18 / 26)、page_mismatch 1 頁。ok 頁の見出し 203 本はすべて OCR verified で、unconfirmed 0。
  - confusable_only 頁 10 (2022r04 page-22/41、2024r06 page-06/17/22/40、2025r07 page-28、2026r08 page-18/23/29)。該当 crop は下の目視で見出しが正しいことを確認した。
- **crop 先頭の目視** (全 101 枚): contact sheet 5 枚で各 crop 上端の 問NN を読み、**101 / 101 が自題の番号**だった。choices_next 候補 5 題 (§4) は crop 全体を見て、選択肢が帯内にあることを確認した。
- **既存 crop との衝突と退避**: 上書き前の precrop dir 4 本 (2022r04 46 / 2024r06 69 / 2025r07 80 / 2026r08 62 = 257 枚、report なし) を `/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/38b9b286-d572-4355-b63d-7392c68f7a4f/scratchpad/x4/precrop_backup/` に退避した。X4 の id と重なる既存 crop は `2024r06-q020.png` / `2026r08-q044.png` の 2 枚で、再生成後も **byte 一致**だった (退避した 257 枚の全数を cmp、差分 0)。他の既存 crop には触れていない。

## 4. page pointer の確認

- **誤りは 0**。根拠:
  1. `quiz-pageoffset-scan-S129.mjs` を現 bank に対して再走査した (OCR cache = S129 `/private/tmp/claude-501/s129-l2a/ocr`、出力 scratchpad `x4/pageoffset_live.json`)。4 exam とも MISMATCH 0 / LOW_CONF 0 / OK 100。X4 の候補行 10 件はすべて OK で、記録頁 = manifest の source 頁。
  2. `S129_L2a_pageoffset_candidates.json` の recall override の対象は 0。`S130_pageoffset_recheck.md` の対象にも X4 の id は無い。
  3. crop 101 題は OCR verified の見出しと目視で、skip 1 題は頁の目視で確認した (§3)。

| id | 再走査 | 本 prep の判定 |
|---|---|---|
| 2024r06-q093 / q096、2025r07-q054 / q078 / q099 | OK、choices_next=true (choices_best が 36 / 47 / 31 / 12 / 31 頁 = 短い選択肢 (数字・(1),(3) 等) の bigram が偶然一致したもの) | crop を目視。選択肢 ア〜エ は記録頁の crop 内にある → **FP** |
| 2022r04-q090、2024r06-q001 / q020、2026r08-q001 / q050 | OK、map_disagree (heading map と vision が 1 頁ずれ) | crop の先頭が自題の 問NN (記録頁) → 正しい |

- 頁をまたぐ題: CHOICES_NEXT の真陽性 0。どの題も `next_page_png` (102 / 102) で次頁を読める (S130 規約: page_number = 題幹頁)。

## 5. 名指し項目 (fixer / reviewer 向け。核験 agent の prompt には入れない)

### 5.1 答え漏洩 (D-163 / D-168)

- **語の走査: 真陽性 0**。表示 3 層を X2 / X3 と同じ語で走査し、5 件当たった。すべて題意の語で、漏洩ではない:
  - 2022r04-q082 zh「密保问题的答案」(秘密の質問の答え = 選択肢 b の内容)
  - 2024r06-q065 jp / zh / en「正解を付けた学習データ」(源の文言。教師あり学習の定義)
  - 2026r08-q058 en「is correct?」(設問文)
- **AI による言語化の目視**: 図を持つ 40 題の表示 jp を全文読み、言語化のある題は源と照合した。

  | 題 | 言語化 | 源との照合 | 漏洩 |
  |---|---|---|---|
  | 2022r04-q090 | 木構造の箇条書き (根 / 葉 / 節) | p41 の図のラベル (根・葉・節) と配置に一致 | なし (ディレクトリ / ファイルの対応は書いていない) |
  | 2022r04-q097 | IoT 構成図の矢印列 | p44 と一致 (水位→a→通信機能部→サーバ、サーバ→通信機能部→b→水門、凡例) | なし (センサ / アクチュエータは書いていない) |
  | 2022r04-q079 | 流れ図の手順列 | p36 と一致 (98 / 42、繰返し x = y (注)、分岐 ＞ / ≦、注記) | なし |
  | 2026r08-q044 | 導入前 / 半年後の表 | p20 と一致 (90% 0 分 / うち 5% 4 分 / 10% 2 分。「うち」の入れ子は全角空白の字下げで保たれている) | なし |
  | 2022r04-q011 / q028 / q050 / q059、2024r06-q008 / q081 / q093、2025r07-q026 / q054 / q066 / q076、2026r08-q003 / q026 / q050 / q057 (15 題) | 表 | crop を目視してセルを全数照合し、源と一致した (q066 は 12 行の日時・従業員番号・部署番号・結果すべて、q050 は設計 6.0 / 製造 4.0 の 2 行で源も 2 行)。書式の差は §5.3 | なし |
  | 上記以外の図を持つ題 (a/b 組合せ表の選択肢・擬似コード等) | 選択肢表・プログラム | 2022r04-q078 / q096、2025r07-q078 / q099、2026r08-q085 は表示値から key を再導出し一致 (§5.2)。2025r07-q078 / q099 は crop も目視。それ以外のセルの全数照合は workflow に委ねる | なし |

### 5.2 answer_affecting の疑い: **なし**

表示層 (図の題は源) から再導出し、すべて correct_answer と一致した:
- 2022r04: q011 与信 400−400+300+600+200 = 1,100 → 余力 1,900 イ / q028 3,000÷1,500 = 200% エ / q050 120/6+120/4 = 50 エ / q059 平均 2,700/9 = 300・中央値 40 エ / q060 エ / q065 ア / q072 ア / q078 j ← k+(j−10k) イ / q079 98,42 → 56 → 14 → 28 → 14 = 14 イ / q082 所持 + 生体 = a,c ウ / q090 ア / q093 √2 ≒ 1.41 ア / q096 num+2×i (1→3→7→13)、i = 2,4,6 (1→5→13→25) エ / q097 エ / q098 射影 イ
- 2024r06: q008 2,000−X+100+50−350 = 800 → X = 1,000 ウ / q020 1,000÷(1+2) = 3.33 → 3.3 イ / q030 P/L のみ = b エ / q039 c,d エ / q057 ウ / q065 ウ / q075 エ / q081 エ / q083 (5/6)^3 = 125/216 エ / q093 ‘%葉_’ → 千葉翔・鈴木葉子 = 2 イ / q096 Bcc → (2) のみ ウ
- 2025r07: q026 売掛金 1,300+1,000 = 2,300 ウ / q034 限界利益 5,000 円/個、不足 600 万 → 1,200 イ / q045 40/50 = 80%、1,000/800 = 125% ア / q054 0.6×0.5+0.4 = 0.7 → 30% ア / q062 ア / q066 失敗 (003, 001) + 09:00:00 以前の成功 (003, 002) → 3 部署 イ / q069 イ / q071 エ / q076 ウ / q078 3+6 = 9 エ / q099 2,000+1,000 = 3,000 ウ
- 2026r08: q003 maximin → b、好転 5 ウ / q026 300/1,000 = 30% ア / q044 (45×4+100×2)/2,000 = 19% → 81% イ / q050 A3 → B3 → C‖D 3 → E3 → F3 = 15 ウ / q057 ウ / q068 エ / q080 エ / q085 2 より小さい・より大きい エ / q099 イ

### 5.3 源で見た表示差分の候補 (key には影響しない)

| 題 | 種別 | 内容 |
|---|---|---|
| `2025r07-q002` | 表記 (行分割残骸・改行) | 表示 stem「…構築するためのガ⏎イドライン規格として…」と語中で改行している。源 (p2、crop を目視) は「ガイドライン」 |
| `2022r04-q080` | 表記 (行分割残骸) | 表示 stem「…情報システム と連動させて…」。源 (p36) は行末「情報システム」+ 行頭「と連動」で、空白は無い |
| `2024r06-q061` イ | 表記 (行分割残骸) | 表示「…PC のハードディスク に一時的に…」。源 (p27) は「ハードディ / スクに」 |
| `2024r06-q005` ウ | 表記 (読点欠落) | 表示「国や学術機関 他の企業など」。源 (p3) は「国や学術機関，他の企業など」。zh / en は読点ありで訳している |
| `2022r04-q065` | 表記 (引用符) | 源 p29 は “従業員” “部門” (stem)、“従業員番号” 等 (選択肢)。表示 stem は「」、選択肢 4 肢は ASCII `"` |
| `2026r08-q057` | 表記 (引用符、既知 NIT-2) | 源 p27 は “学生” 等。表示 stem は “ ” で正しく、選択肢 ア〜エ 4 肢だけが ASCII `"` |
| `2022r04-q098` | 表記 (引用符) | 源 p44 は “従業員”、表示は「従業員」 |
| `2024r06-q030` | 表記 (引用符) | 源 p13 は “我が社の収益性分析をしなさい”、表示は「」 |
| `2024r06-q093` | 表記 (引用符) | 源 p42 は “従業員”・‘%葉_’ (一重)・“_”・“%”、表示はすべて「」。en は “ ” |
| `2025r07-q066` | 表記 (引用符) | 源 p31 は “ログイン記録” “部署”、表示は「」 |
| `2022r04-q059` | 表示書式 | 選択肢 ア が「[表] \| \| 平均値 \| 中央値 \|⏎\|---\|---\|⏎\| ア \| 20 \| 40 \|」と表の見出し行を含み、イ〜エ も「[表] \| イ \| 40 \| 20 \|」と記号を重ねている。値は源 (p27) どおり |
| `2026r08-q057` | 表示書式 (情報欠落の候補) | stem に「表中の下線は主キーを表す」とあるが、表示の表には下線 (源: 学生番号・科目コード・成績表の学生番号+科目コード) が無い。外部キーの判定は下線なしでもできる (key ウ は不変) |

引用符は 2026r08-q007 “バリューエンジニアリング” と 2026r08-q057 の stem が源どおり “ ” で、上の 6 題だけが「」/ ASCII に置き換わっている。D-151 / D-155 / D-162 / D-166 の字形判断に回す。2022r04-q079「＞」「≦」と 2022r04-q097「水田の水位」は AI 言語化部分の括りで、対象外。

### 5.4 A1 backlog (`backlog_scan_A1_S127.json`、X4 の id で抽出)

- **候補 336 件 / 51 題**。high **205 件 / 38 題**。resolved **53 件** (raw だけの 0q.prose = 表示 jp に ASCII `"` が無く学習者に見えない、または zh 是正済み。B7 / B8 の規則)。未処置 high **152 件 / 37 題**。
- priority の規則は X2 / X3 と同じ。
- **rule 別** (全候補): 2.nine_six 99 / 0q.prose 75 / 0a.num 36 / T.table 23 / 0a.word 18 / 0a.char 15 / 7.comma_nospace 12 / 0a.ins 12 / 0q.en 10 / T.num_vs_fig 7 / 7.space 6 / 0c.tr_of_anomaly 6 / 0c.isolated_kanji 4 / T.num_raw_clean 4 / 0b.num_extra 3 / 1.head 2 / 0a.region 2 / 0c.rare_kanji 2。
- **未処置 high の題別**: 2025r07-q066 23 / 2022r04-q078 13 / 2026r08-q057 13 / 2022r04-q065 10 / 2025r07-q026 9 / q076 9 / 2024r06-q093 8 / 2022r04-q090 8 / 2024r06-q083 5 / 2026r08-q050 4 / 2024r06-q005 4 / 他 26 題は各 1〜3。
- **優先度** (本 prep の所見):

  | 優先 | 題 | 理由 |
  |---|---|---|
  | **P1** | 2022r04-q080、2024r06-q061 イ、2024r06-q005 ウ (7.space)、2025r07-q002 (backlog 外、改行) | §5.3 の行分割残骸と読点欠落で、学習者に見える |
  | **P1** | 2022r04-q065 / 2026r08-q057 の 0q.prose jp (各 10 / 12 件) | 表示 jp の選択肢に ASCII `"` が見えている (D-166)。§5.3 |
  | P2 | §5.3 の「」引用符 4 題 (2022r04-q098、2024r06-q030 / q093、2025r07-q066)、2022r04-q059 の書式、2026r08-q057 の下線 | backlog 外。字形・書式の判断待ち |
  | P3 (FP) | 0a.* @jp_raw→jp 全件 | clean (表示) が源どおり: 2022r04-q011「受注分も与信に含める」、q053「a〜d」、q063 / q099「OS」「Open」、q072「打ち間違いによって」、q078「戻り値」、q096「calcY を calcY(1)」、q099「挙げた」、2024r06-q015「工程間」、q049「ソフトウェア規模」「乗ずる」、2025r07-q026「取引①から取引⑤」「表のとおり」、q037「遵守」、q054「システムに」、q066「4月10日」「部署名だけ」、q071「つながりやすい」、2026r08-q003「マクシミン」「予想される」、q044「このたび」、q046「適切な」、q050「要員数以上の要員」「複数要員が必要な」、q057「ここで」。2022r04-q090 / q097 は言語化 (§5.1) |
  | P3 (FP) | 0b.num_extra (2024r06-q020 zh / en、2026r08-q044 en) | 1千万円 → 1000万日元 / 10 million、5百万円 → 500万日元、半年 → 6 months の換算で、値は同じ |
  | P3 (FP) | 0c.* (2022r04-q093「短辺」、2024r06-q005「共創」、2024r06-q093「乙葉」「彩葉」) | 源の語 (q093 の氏名は表データ) |
  | P3 (FP) | 2.nine_six (ends96) 全件 | 表・選択肢の数値 (q066 日時、q078 配列、q083 確率など) |
  | P3 (FP) | 2.nine_six ends96+cross 2 件 | 2025r07-q066 jp_raw「09:00:16」: raw だけの OCR 誤りで、表示は源 (p31) どおり「09:00:15」。2024r06-q093 fig `figure_description`「福葉小春」: 図説明層だけの誤り (源 p42 は「稲葉小春」) で、表示 jp / zh / en の表は「稲葉小春」。図説明層を学習者に見せる経路があるなら fixer が確認する |
  | P3 (FP) | 7.space (table) 3 件 | 2024r06-q008 / 2025r07-q026 / 2026r08-q026 の「単位 百万円」「6月30日 回収予定」は源どおり |

### 5.5 字形 (D-155 / D-162 で fixer が判断)

- 散文の半角「, 」(源は「，」): **55 題**。例示は省略する (X1〜X3 と同じ型)。
- 「、」(源は「，」): 20 field (2022r04-q042 / q065 / q078 / q090 / q096、2024r06-q008 / q044 / q057 / q083 / q093、2025r07-q034 / q045 / q066 / q076、2026r08-q007 / q044、2026r08-q092 の 4 肢)。2026r08-q044 は p20 で「，」を確認した。
- 全角数字 0。

## 6. Workflow 起動引数

- args: **`data/ip/quiz/.phase2/x4_workflow_args_multi.json`**
  - `input_path` = `data/ip/quiz/.phase2/x4_fidelity_input_multi.json`
  - `exam_id` = `"multi"`、`ids` = 102 件
  - `model` = sonnet、`label` = x4、`pass` = sn
  - `out_path` = `evidence/phase5/stage_06_quiz_fidelity/x4_fidelity_multi_sn.json`
  - `parts_dir` = `data/ip/quiz/.phase2/fidparts/x4_multi_sn`
- 起動の直前に、同じコマンドで manifest を作り直す (冪等で token 0。先行 unit の apply で表示層が変わった場合に備える)。page patch は不要。
- run の後:
  1. `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/x4_multi_sn data/ip/quiz/.phase2/x4_fidelity_input_multi.json multi evidence/phase5/stage_06_quiz_fidelity/x4_fidelity_multi_sn.json --journal <journal.jsonl>`
  2. `node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/x4_fidelity_input_multi.json evidence/phase5/stage_06_quiz_fidelity/x4_fidelity_multi_sn.json`

## 7. 見積もりと所見

- agent 102 体 (Sonnet 5、1 題 1 体)。token は 520〜580 万の見込み (X3 の見積もり 450〜500 万 / 88 題と同型。crop 率 99%、中問なし。長い stem は 2025r07-q066 / 2026r08-q057 / 2022r04-q078 程度)。
- 後段は fixer opus 1 + reviewer opus 1 (別 type、Rule D)。
- 脚本の警告は page_mismatch 1 頁だけで、目視で原因を確定済み。
- 検査に使った脚本は scratchpad `/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/38b9b286-d572-4355-b63d-7392c68f7a4f/scratchpad/x4/` に置いた (analyze.cjs / sheet.cjs / ocrtop.cjs。X3 版の x3 を x4 に置換したもので、repo には入れていない)。ocrtop.cjs の頭部 OCR は新しい exam で空振りが多く (OK 23 / 101)、見出しの判定は contact sheet の目視と `_precrop_report.json` の verified に拠った。
