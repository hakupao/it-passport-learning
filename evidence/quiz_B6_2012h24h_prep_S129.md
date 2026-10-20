# B track B6 — 2012h24h 準備 (S129、L3 data lane)

D-150 §3 (母数外 1,692 題の全量再抄写) の 6 本目。手順は B5 (`evidence/quiz_B5_2013h25a_prep_S129.md`) / B4 (`evidence/quiz_B4_2013h25h_prep_S128.md`) と同一。本書は**起動前の準備のみ**で、workflow は未起動。D-152 の data lock は別 lane が保持中なので、`data/ip/quiz/` の本体 (questions / translations / explanations / chumon_groups) には書いていない。書いたのは `.phase2/b6_*` の manifest、precrop (`precrop/2012h24h/`)、それに新規 evidence 2 件だけ。git add / commit はしていない。

---

## 1. 母数

- `question_bank.json` の 2012h24h = **100 問 (q001〜q100)**。13 exam なので全問が母数外 → **B6 母数 = 100 / 100、除外 0**。
- 中問 member も核験の対象に含める (precrop の対象外であって核験の対象内。B1〜B5 と同じ規則)。
- **源の中問**: A = q085-088 / B = q089-092 / C = q093-096 / D = q097-100 の 4 組。
- **`chumon_groups.json` の登録: 4 組すべて登録済**。

  | key | member | 由来 | 前文の頁 |
  |---|---|---|---|
  | `2012h24h-mqA` | q085〜q088 | A4 (commit 5bac5f9)。L2f では unregistered (旧解答不能 q088) | page-31 |
  | `2012h24h-mqB` | q089〜q092 | S117 batch2 | page-36 + page-37 上部 (表1) |
  | `2012h24h-mqC` | q093〜q096 | S117 batch2 | page-41 |
  | `2012h24h-mqD` | q097〜q100 | A4。L2f では unregistered (旧解答不能 q097 / q100) | page-44 |

- **前文表示の確認**: 16 member すべてで、manifest の `displayed_stem_jp` に registry の probe.jp が含まれる。translations の zh / en stem にも probe.zh / probe.en が含まれる (**16/16 × 3 層**、脚本で確認。probe_rule どおり空白除去後に includes)。
- **L2f の解答不能 3 題** (`q088` / `q097` / `q100`) は前文表示で解答可能になった。本 prep で表示層から再導出し、3 題とも correct_answer と一致 (§3)。
- 申し送り:
  - mqB 前文の jp 句読点は「、」(源は「，」)。registry probe.jp も「、」で取っている。B6 fixer は前文の句読点を単独で変えない。変えるなら probe との整合を lead に上げる。
  - mqD の図1 (ISBN コードの構成) は前文に再現しない (D-141 §2、A4 §3)。fixer はこれを STEM 欠陥にしない。
  - q094 の［事務所統合プロジェクトのメンバ］と、q093 / q095 / q096 の zh 見出しは A3 で〔〕に是正済。
- B6 fixer の規則 (B4 / B5 と同じ): 前文の是正が要る場合でも、stem 冒頭を単独で変えない。registry の probe との整合を lead に上げる。設問文以降を是正するときは、設問文側の部分一致で patch を当て、stem 全体は置換しない。

## 2. manifest + precrop (L1b 改修版、main tree の脚本を改修せずに使用)

```
node scripts/quiz-fidelity-prep-any.mjs 2012h24h b6 all --precrop
```

- manifest: `data/ip/quiz/.phase2/b6_fidelity_input_2012h24h.json`。100 samples、`prev_page_png` 100/100。
  - 健全性の不良は 0 (stem 非空・correct_answer ∈ {ア,イ,ウ,エ})。
  - `displayed_stem_jp` は表示層 (translations の `stem_jp_clean` || `stem_jp`) で、A3 / A4 適用後の現 data から作った。
- crop: `data/ip/quiz/.phase2/precrop/2012h24h/` に **84 / 100** (manifest の `question_crop_png` 84、ファイル実在 84)。
  - 既存の `2012h24h-q087.png` (今日 13:05、作成者不明) が残っている。q087 は chumon skip なので**上書きされず**、manifest からも参照されない。削除はしていない (agent には渡らない)。
- **calib** (L1b のパリティ別較正): 全体 / odd は **head=170 / body=230**、even は head=170 / body=240。B5 (160 / 220) よりさらに 10px 右。
  - 全体の得票は 170=41p / 190=10p / 180=4p。範囲は 42 ページ。
- **`_precrop_report.json`** (tesseract 5.5.2、jpn モデルあり、ocr=true):
  - 42 ページの内訳: **ok 42** / page_mismatch 0 / qnum_mismatch 0。
  - 見出しは 100 本。verified 100、unconfirmed 0。期待外の番号 6 本は、すべて下表の confusable。
  - **confusable_only 6 頁**。どれも書体由来の数字誤読 (0→9) で、期待番号と整合する:

    | 頁 | 期待 | OCR |
    |---|---|---|
    | page-11 | 30 / 31 / 32 | `問39` / `問31` / `問32` |
    | page-14 | 40 / 41 / 42 | `間49` / `間41` / `間42` |
    | page-17 | 50 | `問59` |
    | page-21 | 60 / 61 / 62 | `間69` / `間61` / `間62` |
    | page-24 | 68 / 69 / 70 | `問68` / `問69` / `間79` |
    | page-28 | 80 | `問89` |

  - confusable 頁の crop を 2 枚目視した (q030 / q070)。どちらも問番号から次の問の手前までが正しく入っている。
- **OI-1** (旧 exam は頁ごとに見出しの x 位置がずれる): 2012h24h の見出し x は **173〜179** に揃っており、2013h25a (158〜163) よりさらにずれが小さい。page_mismatch / qnum_mismatch の頁が 0 なので、skip した頁は無い (目視すべき skip 頁も無い)。
- **skip 16 題**の内訳:
  - **chumon 16 題**: q085〜q100。
  - page_mismatch 0 / qnum_mismatch 0 / merged_preamble 0 / thin_band 0。
- crop 率は 84%。B3 (84%) / B4 (83%) / B5 (82%) とほぼ同じ。
- **前文の頁が source / prev に無い member** (fixer が実読する頁、本 prep で page-31 / 32 / 36 / 37 / 41 / 44 を目視して前文の範囲を確定):

  | 題 | 見えない前文の頁 | manifest の source / prev |
  |---|---|---|
  | q086 | page-31 | 33 / 32 |
  | q087 | page-31 | 34 / 33 |
  | q088 | page-31 | 35 / 34 |
  | q090 | page-36 (表1 の page-37 は prev で見える) | 38 / 37 |
  | q091 | page-36・37 | 39 / 38 |
  | q092 | page-36・37 | 40 / 39 |
  | q095 / q096 | page-41 | 43 / 42 |
  | q099 | page-44 | 46 / 45 |
  | q100 | page-44 | 47 / 46 |

  - 計 10 member。前文は表示 stem にあるので、agent は前文を「源に無い挿入」と誤報告しうる。既知型 (S127 A2a q090 / B4 q096 / B5 と同じ型) として扱う。
  - q085 / q089 / q093 / q094 / q097 / q098 は prev (または source) に前文の頁があるので、前文が見える。

## 3. 名指し項目 → `evidence/quiz_B6_2012h24h_named_S129.json`

核験 agent の prompt には入れない。読むのは fixer と reviewer。

**A1 backlog**: 候補 368 件 / 32 題。high は 228 件 / 22 題。このうち 1 件は処置済みで、**未処置の high は 227 件 / 22 題**。
- **分類器 = B3 規則** (lead 決定。B4 の rare_kanji high 変種は採らない)。本 prep で再実装し、B3 named と 270/270、B5 named と 174/174 一致、B4 named とは 156/158 (差は 2013h25h-q045 の rare_kanji 2 件) を確認。
  - B4 の規則なら、q017「擦」/ q030「甲」/ q069「函」の 20 件 (FP) が high に上がり、high は 248 件 / 23 題 (新規の題は q030 だけ)。
- 処置済み 1 件: `q087` en 0b.num_missing (「2機種ごと」→「pairwise」)。S127 A2a で FP。
- 未処置 high の内訳: `q089` 52 / `q069` 49 / `q092` 30 / `q100` 17 / `q099` 16 / `q015` 11 / `q091` 10 / `q097` 9 / `q088` 7 / その他 26。
  - 大半は FP: q089 / q091 / q092 / q093〜q096 の 0a.* は raw→clean で前文が入った分。q092 / q097 / q099 / q100 / q088 の 2.nine_six は日付セル・桁番号・評価値。
  - q069 は選択肢の半角 " (0q.prose 48 件) と「検索条 件」の空白。

**answer_affecting の疑い: なし**。表示層で correct_answer と矛盾する題は 0。以下 13 題を表示層から再導出し、すべて一致した:
- `q005`: 800 ÷ (1 − 2,000/4,000) = 1,600 → ウ (L2c)。
- `q015`: 木曜までに在庫 9 → 出荷可能 60、金曜に 60 納品して +12 → 72 → ウ (raw の 69 でも同じ)。
- `q058`: チョコレート / リンゴ / コーヒー → ウ。
- `q085`: 3 / 3 / 1 → ウ。
- `q086`: 6 × 3 = 18 → ウ。
- `q087`: a ∈ {4, 5} → ウ。
- `q088`: A 31 / B 27 / C 24 / D 28 → ア。
- `q089`: 20 / 10 / 10 / 0 → エ。
- `q090`: 18,000 円・テキスト代なし → イ。
- `q091`: ウ (L2c)。
- `q092`: ア (L2c)。
- `q097`: S = 79 → X = 1 → ア。
- `q100`: S = 68 → X = 2、剰余(10−B6,10) → エ。

既知項目:
- **`q091` key ウ**: 公式 key のまま。S127 note の「原典どおりならエ」は誤推論 (No.4 はコースR でテキスト代の請求なし、L2c 補正)。fixer は key を変えない。
- **`q005`**: 表示層 (clean / zh / en) の 4,000 は源 page-03 と一致 (L2c / L2e)。fd は A3 で 4,000 に是正済み。raw stem_jp の 4,800 は **A5 の担当**なので、B6 fixer は raw に書かない (二重書きの防止)。

源で確定した是正 (本 prep で crop を目視):
- **`q017`** (high、§7 #10): 源 page-07 は 4 肢とも全角読点「，」。表示 jp のア / ウ / エ は ASCII「, 」、イは「.,」。加えて、エの表示 jp は「保有す**す**ることによって」で、源は「保有することによって」(A1 は検出していない)。読点を「，」に揃え、「す」の重複を除く。正解ウには影響しない。
- `q015`: 表示の「60台分」は源 page-06 と一致 (raw の 69 は不可視)。表の見出しは源では 2 段 (今週 / 翌週 + 曜日) で、表示は平坦化している。体裁差なので STEM 欠陥にしない。

要確認 (fixer が源で確定する):
- `q069` (high): 「検索条 件」の空白を除く。選択肢の引用符の字形は源 page-24 で確定し、jp / zh を揃える。
- `q089`: 源 page-37 は “Y” “N”、表示 jp は「Y」「N」。字形差のみ。
- `q030`: 源の「瑕疵」に振り仮名「かし」がある。
- `q007` / `q035` / `q040`: 選択肢に ASCII「,」が混在。

字形を変えない (負号ではない):
- `q085`: 選択肢「価格-1」のハイフンは項目番号で、A3 が除外と判定。
- `q083`: 表と注記の「－」はアクセス権の記号。
- `q052`: A3 で U+2212 に統一済み。ウは正解肢で字形のみ変えたもの。

**照合は表示層で行う (lesson)**: raw だけの差は学習者には見えない。例:
- q005 raw 4,800 (表示 4,000)
- q015 raw 69 (表示 60)
- q058 raw 200 (表示 260 / 290)
- q091 raw「8月7日」(表示「9月2日」)
- q092 raw「1日=土・Ｓさん」(表示「9/1=月・Ｂさん」)
- q099 raw「B2〜N2」(表示「B2〜M2」)
- q100 raw「0〜12桁」(表示「1〜12桁」)

`questions.json` の `stem_jp` は raw なので、fixer / reviewer が直接読むときは注意する。

**L2b**
- 表示 jp の見出しで〔〕以外のものは 0 件 (q094 は A3 で是正済)。
- マイナス 4 件は q052 で、A3 済み。AI 図ラベル 0 件。
- fd: q005 は A3 で是正済み。q058 / q068 の FIG_ONLY_NUM は FP。
- 表の構造フラグ:
  - q005 ABOVE_UNIT
  - q015 NO_SEP (2 段見出し)
  - q085〜q087 COL0_REPEAT
  - q089 HDR_REPEAT_ADJ (源 page-37 の表2 を目視: Y Y N N / Y N Y N / a)
  - q099 / q100 SPAN_ROW

**L2d / C3**
- `q085` major は C3 で再 crop 済み。
- `q088` minor (表題「表6」が crop 外) は C3 の対象外で、情報のみ。
- `q058` / `q087` は EXTRA で、情報のみ。
- q015 / q086 / q089 / q097 は OK。

**L2c**: q005 / q091 / q092 の 3 件。いずれも表示層 = 原典で、fix は不要。

**L2e**: q005 fd (A3 済み)。

**summary §7**
- **#4**: 本 prep で実行済み (page_mismatch / qnum_mismatch 0)。
- **#10**: q017 イ (上記、源で確定)。
- **#12**: B6 の全量再抄写で被覆される。
- **#16**: q094 は A3 済み。
- 「ヘへ」型 (#6) は 0 件 (grep で確認)。
- **#22**: q085〜q087。

## 4. Workflow 起動引数

```json
{"input_path":"/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/.phase2/b6_fidelity_input_2012h24h.json","exam_id":"2012h24h","qnums":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100],"label":"b6","pass":"sn","model":"sonnet","agent_type":"general-purpose"}
```

- 出力先の既定値は次の 2 つ。どちらもまだ存在しないことを確認済み。
  - out = `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b6_2012h24h_sn.json`
  - parts = `data/ip/quiz/.phase2/fidparts/b6_2012h24h_sn/`
- run の後:
  1. `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/b6_2012h24h_sn <input_path> 2012h24h <out> --journal <journal.jsonl>`
  2. `node scripts/quiz-fidelity-machdiff.mjs <input_path> <out>`
- 先行 unit (B3〜B5 / A5) の apply が B6 の起動より先に入った場合: 先行 unit は他の exam だけを変えるので、2012h24h の manifest には影響しない。ただし **A5 は 2012h24h-q005 の raw を変える**。raw は manifest の表示層には入らないが、起動直前に同じコマンドで manifest を作り直すのが安全 (冪等、0 token)。

## 5. 見積もり

| 項目 | 値 | 根拠 |
|---|---|---|
| agent | 100 (Sonnet 5、1 題 1 体) | B1〜B5 と同形 |
| token | ≈ 610 万 (540〜670 万) | 61k/問 × 100 |
| 後段 | fixer opus 1 + reviewer opus 1 (別 type) | S122 §0 |

- 上振れの要因: crop の無い 16 題 (中問) は源ページ全体で読む。mqB は前文が 2 頁に跨り、q089〜q092 は表が多い。
- 下振れの要因: merged_preamble は 0 (B5 は 2)。

## 6. 阻害要因

- 脚本のエラーは 0。出た警告は chumon skip だけ。
- B6 の apply は D-152 の data lock の順番に従う。A5 (q005 raw) と同じ題に触れるので、A5 の後に apply する。
