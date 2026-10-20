# B track B9 — 2011h23a 準備 (S129、L3 data lane)

D-150 §3 (母数外 1,692 題の全量再抄写) の 9 本目。手順は B8 (`evidence/quiz_B8_2011h23tokubetsu_prep_S129.md`) / B7 (`evidence/quiz_B7_2012h24a_prep_S129.md`) と同一。本書は**起動前の準備のみ**で、workflow は未起動。D-152 の data lock は別 lane が保持中なので、`data/ip/quiz/` の本体 (questions / translations / explanations / chumon_groups) には書いていない。書いたのは `.phase2/b9_*` の manifest、precrop (`precrop/2011h23a/`)、それに新規 evidence 2 件だけ。git add / commit はしていない。

---

## 1. 母数

- `questions.json` の 2011h23a = **100 問 (q001〜q100)**。13 exam なので全問が母数外 → **B9 母数 = 100 / 100、除外 0**。
- 中問 member も核験の対象に含める (precrop の対象外であって核験の対象内。B1〜B8 と同じ規則)。
- **源の中問は 3 組**: page-33 冒頭「中問Aから中問Cまでは，それぞれ四つの問いを解答してください。」。A = q089-092 / B = q093-096 / C = q097-100。q085〜q088 は小問 (page-31 / page-32)。
- **`chumon_groups.json` の登録: 3 組すべて登録済** (L2f でも 3 組とも R)。

  | key | member | 由来 | 前文の頁 |
  |---|---|---|---|
  | `2011h23a-q089-copy` | q089〜q092 | lightweight-copy D144s3 (probe_source q089) | page-33 → page-34 上端 |
  | `2011h23a-q093-copy` | q093〜q096 | lightweight-copy D144s3 (probe_source q093) | page-37 |
  | `2011h23a-mqC` | q097〜q100 | chumon_preamble_S117_batch1 | page-41 → page-42 上端 |

- **前文表示の確認**: 12 member すべてで、manifest の `displayed_stem_jp` と translations の `stem_jp_clean` に registry の probe.jp が含まれる (先頭一致)。translations の `stem.zh` / `stem.en` にも probe.zh / probe.en が含まれる (**12/12 × 3 層**、脚本で確認。probe_rule どおり空白除去後に includes)。
- **S127 A2a の Rule B (`2011h23a-q089`) は未解消** (`failures/quiz_A2a_S127_2011h23a-q089_attempt_1.md`):
  - 表示 jp / zh / en の stem 途中に「問 89 」「问 89 」「Q89 」が残っている (jp は index 1041)。
  - `scripts/quiz-chumon-groups-build.mjs:70` の COPY 表 (と元の `quiz-chumon-lightweight-D144s3.mjs`) は、今もこの見出しを cut marker に使っている。見出しを消すと組の生成が throw する。
  - 追加の注意: A 組の probe.jp は「、」と「「0」」を含む。前文の「、」→「，」や「」→ “ ” の是正は、registry の再生成と同時でないと A7 が落ちる。B / C の probe は源どおりの「，」なので壊れにくい。
  - **B9 fixer は単独で q089〜q092 の stem を変えない。lead 判断** (failures の 3 段: cut の変更 → 4 題の同時是正 → registry 再生成 + `--check` + A7)。
- 申し送り:
  - 源では各中問 member の前に分野見出し〔テクノロジ〕〔マネジメント〕〔ストラテジ〕がある。表示では除去済み (S117 normalize)。fixer はこれを欠落にしない。
  - A の表示前文の図1 は 7×7 の表に文字化され、凡例「（■＝黒、□＝白）」が付く。源の図は画像で、凡例は無い。描画補助として扱う (A2a で FP 判定済み)。
- B9 fixer の規則 (B4〜B8 と同じ): 前文の是正が要る場合でも、stem 冒頭を単独で変えない。registry の probe との整合を lead に上げる。設問文以降を是正するときは、設問文側の部分一致で patch を当て、stem 全体は置換しない。

## 2. manifest + precrop (L1b 改修版、main tree の脚本を改修せずに使用)

```
node scripts/quiz-fidelity-prep-any.mjs 2011h23a b9 all --precrop
```

- manifest: `data/ip/quiz/.phase2/b9_fidelity_input_2011h23a.json`。100 samples、`prev_page_png` 100/100。
  - 健全性の不良は 0 (stem 非空・correct_answer ∈ {ア,イ,ウ,エ})。
  - `displayed_stem_jp` は表示層 (translations の `stem_jp_clean` || `stem_jp`) で、working tree 上の現 data から作った。working tree の未 commit 変更は他 exam (作成時は 2013h25a、確認時は 2012h24a) だけで、2011h23a には差分が無い (questions.json の diff にも 2011h23a は 0 行)。
- crop: `data/ip/quiz/.phase2/precrop/2011h23a/` に **86 / 100** (manifest の `question_crop_png` 86、ファイル実在 86)。
  - 事前の dir は空ではなかった。13:05 作成の `2011h23a-q065.png` が 1 件あった。再生成の後も md5 `9812cdcd…` で byte 一致 (内容は不変)。scratchpad に退避済み。
- **calib** (L1b のパリティ別較正):
  - 全体: head=160 / body=220。得票は 160=19p / 150=17p / 180=7p。範囲は 38 頁。
  - odd: head=160 / body=220。
  - even: fallback で全体値 (160 が 8p、150 が 9p)。
- **`_precrop_report.json`** (tesseract 5.5.2、ocr=true):
  - 38 頁の内訳: **ok 30** / **page_mismatch 8** / qnum_mismatch 0。
  - 見出しは 88 本検出。すべて verified、unconfirmed 0。confusable_only 0。
- **OI-1** (旧 exam は頁ごとに見出しの x 位置がずれる):
  - 小問頁の見出し x は **147〜167** (例: page-24 は 147、page-23 は 165〜167) で、すべて窓内。**小問頁の OI-1 skip は 0** (B8 は page-26 が窓外だった)。
  - skip した 8 頁はすべて中問頁 (34 / 35 / 36 / 38 / 39 / 40 / 42 / 43) で、〔分野〕見出し行の下に問NN が入る型。どれも検出 0 で page_mismatch。
  - **誤帯は 0** (ok 頁は全見出しを OCR で照合済み)。skip 題は manifest の source に指定した源ページ全体で読める。skip は安全側の動作。
- **skip 14 題**: 内訳は page_mismatch 12 (中問 member 全員) + merged_preamble 2。chumon 0 / thin_band 0。
  - **merged_preamble の 2 題は前文ではない**。図の言語化で表示が長くなり、長さの判定に掛かった:
    - q007: 表示 484 字 (ASCII 図 + 手順 ①〜⑥ の箇条)。
    - q045: 表示 615 字 (組織図の説明文 + ASCII 図)。
    - 源 page-05 / page-17 を目視した。どちらも頁内で完結している。
- crop 率は 86%。B8 (69%) より高く、B3〜B7 (81〜84%) と同程度。
- **前文の頁が source / prev に無い member** (fixer が実読する頁)。本 prep で中問頁 33〜43 を全頁目視し、前文の範囲を確定した:
  - **A の前文は page-33 から page-34 上端に跨る** (page-34 の上端は〔圧縮する処理の概要〕(2) 64 文字の圧縮結果)。
  - **B の前文は page-37 で完結**。
  - **C の前文は page-41 から page-42 上端に跨る** (page-42 の上端は「慮した上で，…判断を行うことにした。」)。

  | 題 | 見えない前文の頁 | manifest の source / prev |
  |---|---|---|
  | q091 | page-33 (page-34 の前文末尾は見える) | 35 / 34 |
  | q092 | page-33 / page-34 | 36 / 35 |
  | q095 | page-37 | 39 / 38 |
  | q096 | page-37 | 40 / 39 |
  | q099 | page-41 (page-42 の前文末尾は見える) | 43 / 42 |
  | q100 | page-41 (同上) | 43 / 42 |

  - 計 6 member。前文は表示 stem にあるので、agent は前文を「源に無い挿入」と誤報告しうる。既知型 (B4〜B8 と同じ型) として扱う。
  - q089 / q090 / q093 / q094 / q097 / q098 は前文が全部見える。

## 3. 名指し項目 → `evidence/quiz_B9_2011h23a_named_S129.json`

核験 agent の prompt には入れない。読むのは fixer と reviewer。

**A1 backlog**: 候補 281 件 / 36 題。high は 139 件 / 29 題。このうち 10 件を resolved にした。**未処置の high は 129 件 / 26 題**。
- resolved の内訳: raw だけの 0q.prose 10 件 (q057 / q073 / q080 / q089)。表示 jp に ASCII `"` が 0 (表示 jp 全 100 題で 0)。学習者には見えない (B7 の規則)。zh 規則 (B8) で resolved になったものは 0。
- lead が B7 の規則を採らない場合、未処置の high は 139 件。
- **分類器 = B3 規則** (B6〜B8 prep の再実装を流用)。B4 の rare_kanji high 変種との差は 2 件 (q072 stem の zh / en、FP 見込み)。
- 未処置 high の内訳: `q100` 20 / `q089` 11 / `q065` 10 / `q091` 10 / `q026` 7 / `q099` 7 / その他 64。
  - 大半は FP: 中問の 0a.* は raw→clean で前文が入った分。2.nine_six ends96 は表の値・図の番号 ⑥・升目の列名・選択肢の数値。raw の誤り (q019 / q022 / q064 / q081 / q091 / q099 / q100) は表示層では源どおり。

**answer_affecting の疑い: なし**。表示層で correct_answer と矛盾する題は 0。以下 24 題を表示層 (図の題は源の図) から再導出し、すべて一致した:
- 小問: `q006` 80 イ / `q012` C ウ (表は源の crop と一致) / `q024` 9 イ (同) / `q026` 92 ウ / `q037` 60 ウ / `q045` b イ / `q057` 多対1 ウ / `q064` 4 エ (〔手順〕は源の crop と一致。raw の「そのままの状態にいる」だとウになる) / `q065` R・P ウ / `q067` 15 イ (表は源の crop と一致) / `q069` ウ / `q072` 24 ウ / `q073` ア
- 中問: `q089` 9 エ (3 行目) / `q090` 39 イ / `q091` j行(8−i)列 エ / `q092` ①③② イ / `q093` (3) ウ / `q094` 5 イ / `q095` 10 エ / `q096` ⑤④ エ / `q097` イ / `q099` イ / `q100` 4.5 ウ
- q090 / q092 は源の図を 7×7 に読み取り、行跨ぎの連結で圧縮字数を計算した (q092 の差は ① 17 / ② −17 / ③ 0)。同じ計算で前文の図1 の 97 字 / 64 字も再現する。式は named の `answer_affecting_suspects` にある。

**源で確定した是正** (本 prep で目視。key には影響しない):
- **`q030`** (正解肢イを含む): 源はイ「a，b」/ エ「a，c」。表示 jp はイ「ab」/ エ「a c」。区切りが欠落している。
- **`q093`** (正解肢ウを含む): 源の選択肢は「(1)」〜「(4)」(前文のメモ番号)。表示 jp は「①」〜「④」。前文の (1)〜(5) や図の「(5)」と記法が食い違う。
- **`q094`**: 源は〔条件〕(1)「作業者は1日当たり8ページ…」。表示 jp は「(1) 1 作業者は…」で、「1 」が余分 (raw の OCR 残渣)。
- **`q089`**: stem 途中の「問 89 」に加え、源の「41 文字目が，“w,b,w,w,w,b,w”」の読点が欠落し、引用符の字形も違う。上記 Rule B のとおり lead 判断。
- `q036` ア「a,b」/ `q051` エ「c,d」: 源は「a，b」「c，d」。空白の無い ASCII 読点。
- `q084`: 源では記述 a / b / c が 3 行。表示 jp は 1 行に連結されている。
- `q021`: 「電子商 取引」は源の行折返し (R8b、⑤-4 scope-out)。源の「B to C」は表示で「BtoC」。

**要確認** (fixer が源で確定する):
- `q034` / `q046`: 句点の後の改行・空白。
- `q057`: 源 “社員” “部署” → 表示「社員」「部署」(引用符の字形、記録のみ)。`q073` は源も表示も “ ” で一致している。

**図の言語化** (いずれも図は添付済みで、内容は源と一致することを本 prep で目視):
- q007 / q032 / q042 / q045 / q057 / q064 / q065 / q072 / q089 / q091 / q093 / q096。
- 去就は、B1〜B8 の扱い (源に無い挿入) に従って fixer が判断する。

**字形を変えない**:
- **ASCII 読点「, 」**: 表示 jp で 69 題 (うち「，」と混在 17 題)。旧 exam の型で、B4 §4e / B7 / B8 と同じく**不変・記録のみ** (⑨)。
- 「、」: q012 / q032 / q033 / q098 / q100 と、中問A の前文 (q089〜q092 で各 18〜19 個)。中問A の分は probe の制約 (§1) があるので、registry の再生成と同時でなければ直さない。

**L2d** (情報のみ):
- EXTRA: q005 / q026 / q042。
- TRUNCATED: q032 (minor、C3 の対象外) / q096 (major、**S128 C3 で再裁断済み**)。
- OK: q024 / q057 / q065 / q090 / q091 / q095。

**L2c / L2e**: 2011h23a は 0 件。

**既処置の題** (A2b: q051 の en「integration test」→「system test」/ A3: q024 は既に U+2212 / A5: q092 の en -17 → −17) は現状のまま。

## 4. Workflow 起動引数

```json
{"input_path":"/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/.phase2/b9_fidelity_input_2011h23a.json","exam_id":"2011h23a","qnums":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100],"label":"b9","pass":"sn","model":"sonnet","agent_type":"general-purpose"}
```

- 出力先の既定値は次の 2 つ。どちらもまだ存在しないことを確認済み。
  - out = `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b9_2011h23a_sn.json`
  - parts = `data/ip/quiz/.phase2/fidparts/b9_2011h23a_sn/`
- run の後:
  1. `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/b9_2011h23a_sn <input_path> 2011h23a <out> --journal <journal.jsonl>`
  2. `node scripts/quiz-fidelity-machdiff.mjs <input_path> <out>`
- **起動直前に、同じコマンドで manifest を作り直す** (冪等、0 token)。先行 unit の apply で 2011h23a の表示層が変わった場合に備える。

## 5. 見積もり

| 項目 | 値 | 根拠 |
|---|---|---|
| agent | 100 (Sonnet 5、1 題 1 体) | B1〜B8 と同形 |
| token | ≈ 600 万 (540〜670 万) | B7 の実績 5,721,538 (57k/問、crop 無し 19 題) を基準にした |
| 後段 | fixer opus 1 + reviewer opus 1 (別 type) | S122 §0 |

- 上振れの要因:
  - 中問の前文が長い。A は約 1,000 字 (7×7 表 1 つを含む)、C は約 750 字。
  - 中問 member 12 題は crop が無く、源ページ全体で読む。
  - q089〜q092 の図の題は、agent が計算で深読みしうる。
- 下振れの要因: crop の無い題は 14 題で、B7 (19 題) / B8 (31 題) より少ない。

## 6. 阻害要因

- 脚本のエラーは 0。出た警告は page_mismatch 8 頁 (すべて中問頁) と merged_preamble 2 題だけで、どちらも目視で原因を確定済み。
- q089 の Rule B (中問 COPY 組の cut marker) は B9 の核験を阻害しない。ただし是正 (見出しの除去・前文の句読点) は、lead が registry 再生成と同時に進めるかどうかを判断する必要がある。
- B9 の apply は D-152 の data lock の順番に従う。
