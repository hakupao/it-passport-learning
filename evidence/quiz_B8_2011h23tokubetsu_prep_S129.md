# B track B8 — 2011h23tokubetsu 準備 (S129、L3 data lane)

D-150 §3 (母数外 1,692 題の全量再抄写) の 8 本目。手順は B7 (`evidence/quiz_B7_2012h24a_prep_S129.md`) / B6 (`evidence/quiz_B6_2012h24h_prep_S129.md`) と同一。本書は**起動前の準備のみ**で、workflow は未起動。D-152 の data lock は別 lane が保持中なので、`data/ip/quiz/` の本体 (questions / translations / explanations / chumon_groups) には書いていない。書いたのは `.phase2/b8_*` の manifest、precrop (`precrop/2011h23tokubetsu/`)、それに新規 evidence 2 件だけ。git add / commit はしていない。

---

## 1. 母数

- `question_bank.json` の 2011h23tokubetsu = **100 問 (q001〜q100)**。特別試験でも通常回と同じ 100 問。13 exam なので全問が母数外 → **B8 母数 = 100 / 100、除外 0**。
- 中問 member も核験の対象に含める (precrop の対象外であって核験の対象内。B1〜B7 と同じ規則)。
- **源の中問は 3 組** (2012h24a 以降の 4 組と違う): page-32 冒頭「中問Aから中問Cまでは，それぞれ四つの問いを解答してください。」。A = q089-092 / B = q093-096 / C = q097-100。q085〜q088 は小問 (page-30 / page-31)。
- **`chumon_groups.json` の登録: 3 組すべて登録済** (L2f でも 3 組とも R)。

  | key | member | 由来 | 前文の頁 |
  |---|---|---|---|
  | `2011h23tokubetsu-A` | q089〜q092 | S114 | page-32 |
  | `2011h23tokubetsu-B` | q093〜q096 | S114 | page-35 |
  | `2011h23tokubetsu-C` | q097〜q100 | S114。q097 は S118 A7 で追加 | page-39 |

- **前文表示の確認**: 12 member すべてで、manifest の `displayed_stem_jp` と translations の `stem_jp_clean` に registry の probe.jp が含まれる (先頭一致)。translations の `stem.zh` / `stem.en` にも probe.zh / probe.en が含まれる (**12/12 × 3 層**、脚本で確認。probe_rule どおり空白除去後に includes)。
- 申し送り:
  - 源では各中問 member の前に分野見出し〔ストラテジ〕〔マネジメント〕〔テクノロジ〕がある。表示では除去済み (S117 normalize)。fixer はこれを欠落にしない。
  - C の表示前文で 図1 (懸賞ページ案) の言語化を持つのは q097 だけ。q098〜q100 は 図1 の段を省いている。図1 は q097 / q098 の共有図で担保 (L2d OK)。q099 / q100 は 図1 を使わずに解ける。fixer はこれを STEM 欠陥にしない。
- B8 fixer の規則 (B4〜B7 と同じ): 前文の是正が要る場合でも、stem 冒頭を単独で変えない。registry の probe との整合を lead に上げる。設問文以降を是正するときは、設問文側の部分一致で patch を当て、stem 全体は置換しない。

## 2. manifest + precrop (L1b 改修版、main tree の脚本を改修せずに使用)

```
node scripts/quiz-fidelity-prep-any.mjs 2011h23tokubetsu b8 all --precrop
```

- manifest: `data/ip/quiz/.phase2/b8_fidelity_input_2011h23tokubetsu.json`。100 samples、`prev_page_png` 100/100。
  - 健全性の不良は 0 (stem 非空・correct_answer ∈ {ア,イ,ウ,エ})。
  - `displayed_stem_jp` は表示層 (translations の `stem_jp_clean` || `stem_jp`) で、working tree 上の現 data から作った。このとき A5 の未 commit 変更 (2011h23tokubetsu の translations と questions.json の q094 を含む) が review 中だった。
- crop: `data/ip/quiz/.phase2/precrop/2011h23tokubetsu/` に **69 / 100** (manifest の `question_crop_png` 69、ファイル実在 69)。
  - 事前の dir は空だった (13:05 作成、中身 0)。上書きしたファイルは無い。
  - S128 L1b §5 の表 (69 / 31) と同じ値。
- **calib** (L1b のパリティ別較正):
  - 全体: head=160 / body=220。得票は 160=17p / 150=17p / 200=7p。範囲は 37 頁。
  - odd: head=160 / body=220。
  - even: head=150 / body=210。
- **`_precrop_report.json`** (tesseract 5.5.2、ocr=true):
  - 37 頁の内訳: **ok 23** / **page_mismatch 14** / qnum_mismatch 0。
  - 見出しは 80 本検出。ok 頁の 69 本はすべて verified、unconfirmed 0。confusable_only 0。
  - 間 / 問 の読み違いはどれも verified 扱い。
- **OI-1** (旧 exam は頁ごとに見出しの x 位置がずれる。S128 で 2009〜2011 の前に再評価するとした件):
  - ok 頁の見出し x は **144〜167** で、頁ごとにずれる (例: page-20 は 144〜149、page-23 は 164〜167)。
  - **page-26** は見出し x≈170〜172 (墨の左端を実測) で窓の外に出て、検出 0。OI-1 の実例。
  - 中問頁 (33 / 34 / 36 / 37 / 38 / 40 / 41 / 42) は〔分野〕見出し行の下に問NN が x≈180 で入り、すべて検出 0。
  - どれも page_mismatch で skip になる。**誤帯は 0** (ok 頁は全見出しを OCR で照合済み)。skip した題は、manifest の source に指定した源ページ全体で読める。**skip は安全側の動作**。
- **page_mismatch 14 頁**は全頁を目視した。各問は頁内で完結し、頁跨ぎは無い:

  | 頁 | 期待 | 検出 | 原因 |
  |---|---|---|---|
  | page-04 | q004 / q005 | 1 | 頁上端の問4 (x≈169) が漏れ |
  | page-05 | q006〜q009 | 3 | 問7 (y≈666) が漏れ |
  | page-12 | q030〜q032 | 2 | 頁上端の問30 が漏れ |
  | page-16 | q042〜q045 | 3 | 問45 (y≈1466) が漏れ |
  | page-26 | q073〜q075 | 0 | 見出し x≈170〜172 (OI-1) |
  | page-29 | q082〜q084 | 2 | 頁上端の問82 が漏れ |
  | 中問 8 頁 | q089〜q100 | 0 | 〔分野〕見出し + x≈180 |

- **skip 31 題**: 内訳は page_mismatch 31 (小問 19 + 中問 12)。chumon 0 / merged_preamble 0 / thin_band 0。中問 12 題は chumon の判定より先に page 検査で落ちた。
- crop 率は 69%。B3〜B7 (81〜84%) より低い。L1b が 2011h23tokubetsu を skip の多い 5 exam の 1 つに挙げていたとおり。
- **前文の頁が source / prev に無い member** (fixer が実読する頁)。本 prep で前文の頁 page-32 / 35 / 39 を全頁目視し、前文の範囲を確定した:
  - A の前文は page-32 で完結。
  - B の前文は page-35 で完結。
  - C の前文は page-39 で完結。
  - 次の頁はどれも〔分野〕問NN から始まる。

  | 題 | 見えない前文の頁 | manifest の source / prev |
  |---|---|---|
  | q091 | page-32 | 34 / 33 |
  | q092 | page-32 | 34 / 33 |
  | q094 | page-35 | 37 / 36 |
  | q095 | page-35 | 38 / 37 |
  | q096 | page-35 | 38 / 37 |
  | q099 | page-39 | 41 / 40 |
  | q100 | page-39 | 42 / 41 |

  - 計 7 member。前文は表示 stem にあるので、agent は前文を「源に無い挿入」と誤報告しうる。既知型 (B4〜B7 と同じ型) として扱う。
  - q089 / q090 / q093 / q097 / q098 は prev に前文の頁があるので、前文が見える。

## 3. 名指し項目 → `evidence/quiz_B8_2011h23tokubetsu_named_S129.json`

核験 agent の prompt には入れない。読むのは fixer と reviewer。

**A1 backlog**: 候補 241 件 / 43 題。high は 142 件 / 35 題。このうち 40 件を resolved にした。**未処置の high は 102 件 / 31 題**。
- resolved の内訳:
  - raw だけの 0q.prose 36 件 (q006 / q058 / q059 / q062 / q073 / q100): 表示 jp に ASCII `"` が 0。学習者には見えない (B7 の規則)。
  - zh 0q.prose 4 件 (q003 / q084): 現 zh は “ ” で、処置済み。
- lead が B7 の規則を採らない場合、未処置の high は 138 件。
- **分類器 = B3 規則** (B6 / B7 prep の再実装を流用)。B4 の rare_kanji high 変種との差は 4 件 (q032 エ / q059 stem の zh / en、FP 見込み)。
- 未処置 high の内訳: `q015` 12 / `q090` 9 / `q099` 8 / `q093` 7 / `q094` 7 / `q029` 5 / `q091` 5 / `q096` 5 / その他 44。
  - 大半は FP: 中問の 0a.* は raw→clean で前文が入った分。2.nine_six は表の値・日付・前文の「6 か月」。q015 / q099 は図の言語化文の語。

**answer_affecting の疑い: なし**。表示層で correct_answer と矛盾する題は 0。以下 30 題を表示層 (図の題は源の図) から再導出し、すべて一致した:
- 小問: `q004` イ / `q010` 60 ア / `q015` イ / `q018` イ (源のグラフで再計算) / `q022` 4 エ / `q026` イ / `q041` 5 イ / `q048` E ウ (源の図) / `q056` 141 イ / `q058` 27 イ / `q059` イ / `q060` 4億 ウ / `q062` IPA301 ウ / `q070` エ / `q071` エ / `q073` ア / `q083` エ / `q086` エ
- 中問: `q089`〜`q092` ウ / `q093` ア / `q094` ア (b=X, c=X) / `q095` イ / `q096` 63,000 ウ / `q097` ウ / `q098` 100dpi イ / `q099` ウ / `q100` ア
- 式は named の `answer_affecting_suspects` にある。

**A3 / A5 が触った題の現状** (manifest 作成時点の表示 jp。A5 は working tree 上で未 commit、review 中):
- **q090**: A5 は expl の見出しだけを〔〕に変えた。表示 stem はもともと〔〕。
- **q093**: A3 で U+2212 に統一。表示 jp は U+2212 ×2 (前文 (1) と図1 の「L＝−1」)。
- **q094**: 表示 jp は U+FF0D ×8 / U+2212 ×2 / U+2013 ×0。
  - A3: 前文の −1 を U+2212 に統一。記号「－」は保持。
  - A5: 決定表のセルを U+2013 から U+FF0D に変えた。
  - key ア は A5 の前後どちらでも変わらない。
- **q100**: A3 はコード片の `<img src=「…」>` を意図的に触っていない。表示 jp は「」×12、ASCII `"` は 0。

**源で確定した是正** (本 prep で目視。どれも正解肢ではなく、key に影響しない):
- **`q025` エ**: 源「**バ**リューチェーン分析」、表示 jp「**パ**リュー…」。A1 未検出。
- **`q027` イ**: 源「IT ガ**バ**ナンス」、表示 jp「ガ**パ**ナンス」。A1 未検出。
- **`q029` エ**: 源は「…表示される。」で終わる。表示 jp は末尾に「「」が残る。⑤-4 scope-out の R2b / R3。
- **`q033` ア**: 源「場合，」、表示 jp「場合., 」(summary §7 #10)。
- **`q032` ア**: 源「販売し，落札者から」。表示 jp は読点が欠落している。
- **`q054`**: 源「行う場合，システムテスト」。表示 jp は読点が空白になっている。
- **`q096`**: 源「〔処理内容〕の **(2)**」、表示 jp「の**②**」。源の見出し〔配列の値〕は表示に無い。文の順序は源どおり。
- **`q098` エ**: 源「1,200dpi」、表示 jp「1200dpi」。

**要確認** (fixer が源で確定する):
- `q052` / `q060`: 「最も適 切」「何回 実行」の空白 (R8b、⑤-4 scope-out)。
- `q035`: 句点の後の空白。
- `q059` / `q062` / `q073`: 引用括弧「」の源字形。
- `q100`: 源の散文は “ ”、コード片は ASCII `"`。A2b / A3 の不触判断に従う。

**図の言語化** (L2b の走査は 0 件。本 prep で確認した。図はすべて添付済みで、内容は源の図と一致):
- 選択肢が図の題: `q015` (散布図) / `q070` (直列・並列構成) / `q099` (ページ構成図)。選択肢 jp は図の説明文。
- 選択肢が表の題: `q018` / `q072` / `q090` は「[表] a: … / b: …」形式。
- `q004`: 調達手順図を表に起こしている。
- 去就は、B1〜B7 の扱い (源に無い挿入) に従って fixer が判断する。

**字形を変えない**:
- **ASCII 読点「, 」**: 表示 jp で 74 題 (うち「，」と混在 9 題)。旧 exam の型で、B4 §4e / B7 と同じく**不変・記録のみ** (⑨)。
- 「、」の題は q024 / q041 / q049 / q094 の 4 題。源は「，」の見込み。

**L2d** (どれも情報のみ):
- EXTRA: q004 / q010 / q015。
- OK: q026 / q070 / q073 / q090 / q093 / q097 / q098。

**L2c**: q069 / q072 / q095 で、いずれも key ✓。**L2e**: q094 は教科書参照なし。

## 4. Workflow 起動引数

```json
{"input_path":"/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/.phase2/b8_fidelity_input_2011h23tokubetsu.json","exam_id":"2011h23tokubetsu","qnums":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100],"label":"b8","pass":"sn","model":"sonnet","agent_type":"general-purpose"}
```

- 出力先の既定値は次の 2 つ。どちらもまだ存在しないことを確認済み。
  - out = `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b8_2011h23tokubetsu_sn.json`
  - parts = `data/ip/quiz/.phase2/fidparts/b8_2011h23tokubetsu_sn/`
- run の後:
  1. `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/b8_2011h23tokubetsu_sn <input_path> 2011h23tokubetsu <out> --journal <journal.jsonl>`
  2. `node scripts/quiz-fidelity-machdiff.mjs <input_path> <out>`
- **起動直前に、同じコマンドで manifest を作り直す** (冪等、0 token)。A5 の apply / revert で、2011h23tokubetsu の q094 (と translations) の表示層が変わりうるため。

## 5. 見積もり

| 項目 | 値 | 根拠 |
|---|---|---|
| agent | 100 (Sonnet 5、1 題 1 体) | B1〜B7 と同形 |
| token | ≈ 630 万 (560〜700 万) | 61k/問 × 100 に、crop 無し題の上振れを加算 |
| 後段 | fixer opus 1 + reviewer opus 1 (別 type) | S122 §0 |

- 上振れの要因:
  - crop の無い題が 31 題 (B7 は 19 題)。源ページ全体で読む。
  - 中問の前文が長い (A / B は約 700 字、C は図1 込み)。
  - 図の言語化が 7 題あり、agent が深読みしうる。
- 下振れの要因: merged_preamble は 0。

## 6. 阻害要因

- 脚本のエラーは 0。出た警告は page_mismatch 14 頁だけで、目視で原因を確定済み。
- B8 の apply は D-152 の data lock の順番に従う。A5 (q094 を含む) の commit / review の結果を待ってから、manifest を作り直して起動する。
