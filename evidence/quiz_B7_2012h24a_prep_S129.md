# B track B7 — 2012h24a 準備 (S129、L3 data lane)

D-150 §3 (母数外 1,692 題の全量再抄写) の 7 本目。手順は B6 (`evidence/quiz_B6_2012h24h_prep_S129.md`) / B5 (`evidence/quiz_B5_2013h25a_prep_S129.md`) と同一。本書は**起動前の準備のみ**で、workflow は未起動。D-152 の data lock は別 lane が保持中なので、`data/ip/quiz/` の本体 (questions / translations / explanations / chumon_groups) には書いていない。書いたのは `.phase2/b7_*` の manifest、precrop (`precrop/2012h24a/`)、それに新規 evidence 2 件だけ。git add / commit はしていない。

---

## 1. 母数

- `question_bank.json` の 2012h24a = **100 問 (q001〜q100)**。13 exam なので全問が母数外 → **B7 母数 = 100 / 100、除外 0**。
- 中問 member も核験の対象に含める (precrop の対象外であって核験の対象内。B1〜B6 と同じ規則)。
- **源の中問**: A = q085-088 / B = q089-092 / C = q093-096 / D = q097-100 の 4 組。
- **`chumon_groups.json` の登録: 4 組すべて登録済**。

  | key | member | 由来 | 前文の頁 |
  |---|---|---|---|
  | `2012h24a-mqA` | q085〜q088 | A4 (S128 a4 batch1)。L2f では unregistered | page-33 |
  | `2012h24a-mqB` | q089〜q092 | S117 batch2 | page-38 |
  | `2012h24a-mqC` | q093〜q096 | A4 (S128 a4 batch1)。L2f では unregistered | page-41 |
  | `2012h24a-q098-copy` | q097〜q100 | S117 lightweight COPY (probe_source q098)。q100 は A4 が追加 (A4 / L2f の表記は `2012h24a-D`) | page-45 |

- **前文表示の確認**: 16 member すべてで、manifest の `displayed_stem_jp` と translations の `stem_jp_clean` に registry の probe.jp が含まれる。translations の zh / en stem にも probe.zh / probe.en が含まれる (**16/16 × 3 層**、脚本で確認。probe_rule どおり空白除去後に includes)。
- 申し送り:
  - mqA の図1 (売上分析ワークシート A1〜F6) は前文 text に再現せず、共有図 (q085 / q087 / q088 の figure = 図1) で担保する (D-141 §2)。fixer はこれを STEM 欠陥にしない。
  - q098-copy の前文の段落改行 (「…取り扱っている。⏎B さんが…」) は 1 段落に結合されている。A4 §6 が体裁差と判定済み。
  - q090 / q099 の見出し参照の〔〕は A3 で是正済み。本 prep で表示層を確認した。
- B7 fixer の規則 (B4〜B6 と同じ): 前文の是正が要る場合でも、stem 冒頭を単独で変えない。registry の probe との整合を lead に上げる。設問文以降を是正するときは、設問文側の部分一致で patch を当て、stem 全体は置換しない。

## 2. manifest + precrop (L1b 改修版、main tree の脚本を改修せずに使用)

```
node scripts/quiz-fidelity-prep-any.mjs 2012h24a b7 all --precrop
```

- manifest: `data/ip/quiz/.phase2/b7_fidelity_input_2012h24a.json`。100 samples、`prev_page_png` 100/100。
  - 健全性の不良は 0 (stem 非空・correct_answer ∈ {ア,イ,ウ,エ})。
  - `displayed_stem_jp` は表示層 (translations の `stem_jp_clean` || `stem_jp`) で、A2a / A2b / A3 / A4 適用後の現 data から作った。
- crop: `data/ip/quiz/.phase2/precrop/2012h24a/` に **81 / 100** (manifest の `question_crop_png` 81、ファイル実在 81)。
  - 既存の `2012h24a-q042.png` (今日 13:05、S127 A2a の時刻) が残っている。q042 は今回の crop 対象なので同じ名前で**上書きされた** (サイズは 119,628 B で同じ)。削除はしていない。
- prep 実行時、working tree では別 lane (data lock の保持者) による `questions.json` / `explanations/*.json` (2012h24a を含む) の未 commit 変更が進行中だった。manifest はその時点の表示層から作ったので、起動直前に作り直す (§4)。
- **calib** (L1b のパリティ別較正): 全体 / odd / even とも **head=150 / body=210**。
  - 全体の得票は 150=41p / 170=10p / 160=2p。範囲は 42 ページ。
- **`_precrop_report.json`** (tesseract 5.5.2、jpn モデルあり、ocr=true):
  - 42 ページの内訳: **ok 40** / **page_mismatch 2** / qnum_mismatch 0。
  - 見出しは 98 本検出。verified 96、unconfirmed 0 (page_mismatch の 2 頁は OCR しない)。期待外の番号 5 本は、すべて下表の confusable。
  - **confusable_only 5 頁**。どれも書体由来の数字誤読 (0→9) で、期待番号と整合する:

    | 頁 | 期待 | OCR |
    |---|---|---|
    | page-11 | 28 / 29 / 30 | `問28` / `問29` / `問39` |
    | page-19 | 50 / 51 / 52 | `問59` / `間51` / `問52` |
    | page-22 | 58 / 59 / 60 | `問58` / `間59` / `問69` |
    | page-39 | 89 / 90 / 91 | `間89` / `問99` / `問91` |
    | page-48 | 99 / 100 | `問99` / `間109` |

  - confusable 頁の crop を 2 枚目視した (q030 / q060)。どちらも問番号から次の問の手前までが正しく入っている。
- **OI-1** (旧 exam は頁ごとに見出しの x 位置がずれる): 2012h24a の見出し x は **152〜159** に揃っている (2012h24h は 173〜179)。page_mismatch の 2 頁は x のずれが原因ではない。2 頁とも全頁を目視した:
  - **page-30** (期待 q079 / q080 / q081、検出 2): 3 問とも頁内に完全にある。検出漏れは頁上端の問79 (y≈205) で、検出された 2 本は問80 (y≈482) と問81 (y≈1429)。skip は安全側の動作で、3 題は源ページ全体 (manifest の source=page-30) で読める。
  - **page-37** (期待 q088、検出 0): q088 の**選択肢だけ**の頁 (ア〜エの IF 式 4 行)。q088 の見出し・設問文・ワークシートは page-36 にあり、manifest の prev_page_png=page-36 で見える。
- **skip 19 題**の内訳:
  - **chumon 15 題**: q085〜q087、q089〜q100。
  - **page_mismatch 4 題**: q079 / q080 / q081 (page-30) と q088 (page-37。chumon member だが page 検査が先に落ちた)。
  - qnum_mismatch 0 / merged_preamble 0 / thin_band 0。
- crop 率は 81%。B3 (84%) / B4 (83%) / B5 (82%) / B6 (84%) とほぼ同じ。
- **前文の頁が source / prev に無い member** (fixer が実読する頁)。本 prep で前文の頁 page-33 / 38 / 41 / 45 を全頁目視し、前文の範囲を確定した:
  - mqA の前文は page-33 で完結。
  - mqB の前文は page-38 で完結し、page-39 は〔ストラテジ〕の見出しから始まる (問89 の見出しが y≈257 と低いのはこの見出し行のため)。
  - mqC の前文は page-41 で完結 (図1 / 図2 を含む)。
  - D の前文は page-45 で完結。段落改行は A4 §6 の記述どおり。

  | 題 | 見えない前文の頁 | manifest の source / prev |
  |---|---|---|
  | q087 | page-33 | 35 / 34 |
  | q088 | page-33 | 37 / 36 |
  | q092 | page-38 | 40 / 39 |
  | q094 | page-41 | 43 / 42 |
  | q095 | page-41 | 43 / 42 |
  | q096 | page-41 | 44 / 43 |
  | q098 | page-45 | 47 / 46 |
  | q099 | page-45 | 48 / 47 |
  | q100 | page-45 | 48 / 47 |

  - 計 9 member。前文は表示 stem にあるので、agent は前文を「源に無い挿入」と誤報告しうる。既知型 (S127 A2a q090 / B4 q096 / B5 / B6 と同じ型) として扱う。
  - q085 / q086 / q089 / q090 / q091 / q093 / q097 は prev に前文の頁があるので、前文が見える。

## 3. 名指し項目 → `evidence/quiz_B7_2012h24a_named_S129.json`

核験 agent の prompt には入れない。読むのは fixer と reviewer。

**A1 backlog**: 候補 233 件 / 37 題。high は 154 件 / 30 題。このうち 44 件を resolved にした (処置済み 1 件 + raw だけで不可視 43 件)。**未処置の high は 110 件 / 26 題**。
- raw だけの 43 件は処置したのではなく、学習者に見えないもの。この解決規則は B3〜B6 が使っていない、B7 で新設したもの。lead が採否を決める (採らない場合、未処置の high は 153 件)。
- **分類器 = B3 規則** (lead 決定)。B6 prep の再実装 (B3 named と 270/270、B5 named と 174/174 一致) を流用。B4 の rare_kanji high 変種との差は 2012h24a では 0 件。
- resolved 44 件の内訳:
  - `q042` en 0b.abbr_missing: S127 A2a で FP (jp clean / zh は A2a で源どおりに是正済)。
  - 0q.prose の jp_raw 43 件 (q013 / q063 / q065 / q071 / q072 / q080 / q092 / q096): 表示 jp に ASCII `"` が無い。raw だけの差で学習者には見えない (既知型 FP)。
- 未処置 high の内訳: `q088` 18 / `q092` 9 / `q086` 8 / `q090` 8 / `q091` 7 / `q063` 6 / その他 54。
  - 大半は FP: q089〜q092 / q097〜q099 の 0a.* は raw→clean で前文が入った分。2.nine_six (ends96) は表の値・選択肢の数値・式中のセル番号。q069「局間」/ q086「別粗」の isolated_kanji も FP。

**answer_affecting の疑い: なし**。表示層で correct_answer と矛盾する題は 0。以下 25 題を表示層から再導出し、すべて一致した:
- `q025` 25% エ / `q029` 90 ア / `q042` 21 ウ / `q063` エ / `q065` 0003 ウ / `q066` 0.5 エ / `q078` 6.6 イ / `q079` 163 ウ / `q080` 150 エ
- 中問: `q085` ア / `q086` ウ / `q087` 1,600 ウ / `q088` ウ / `q089` イ / `q090` ウ / `q091` イ / `q092` エ / `q093` C ウ / `q094` 40 ウ / `q095` 24 エ / `q096` 27 ア / `q097` イ / `q098` イ / `q099` ウ / `q100` イ
- 式は named の `answer_affecting_suspects` にある。

**`q088` (図 lane の項目、現状を記録)**:
- 表示 stem (前文 + 設問文) は「次のワークシートを作成した」と言うが、表示層に表が無い。
- 添付図 `figures/2012h24a-q088.png` (881×376) は前文の図1 (A1〜F6) で、自問のワークシートは入っていない。自問のワークシートは A〜H 列 × 1〜18 行で、次を含む:
  - G 列の粗利益比率
  - サラダ / 玉子の単価・原価 (B8:C9)
  - 数量軸 (C12:H12 / B13:B18)
  - ○× の表 (C13:H18)
- 源では page-36 にワークシート全体がある (manifest の prev)。
- **復旧の手掛かり**: `figures/2012h24a-q088.png.pre-D144s3ii.bak` (S117 の D-144 段 3 で共有図に置き換わる前の図) はワークシート全体を含む。ただし上部に設問文の後半が入るので、使うなら再裁断が要る。
- 表示層だけでも解ける。セル位置は設問文にあり、$F$3 (親子丼の粗利益 462,000) は図1 にある。ウを再導出して一致した。○× 表も源で検算した。
- **B7 fixer は表を stem に起こさない** (図 lane の担当)。agent が「表が無い」と報告しても図 lane に回す。
- L2b の fd は旧図の記述で、「玉子 1,000〜5,000」は源 (0〜5,000) と食い違う。fd は quiz では不可視 (§7 #19)。

**`q086`**: fd は A3 で是正済み。表示 stem の表 (G 列込み) は源 page-34 と一致することを目視した。

源で確定した是正 (本 prep で目視):
- **`q085` エ (high、semantic、A1 は未検出)**:
  - 源 page-34 は「牛丼の粗利益が最も多く，粗利益率も最も高い。」。
  - 表示は jp「**和**牛丼」/ zh「和牛盖饭」/ en「Wagyu beef rice bowl」で、3 層とも語が置き換わっている。
  - 源どおり jp「牛丼」、zh「牛肉盖饭」、en「beef bowl」(q086 / q087 の訳語) に是正する。
  - 正解アには影響しない (エは「牛丼」でも偽)。
- **`q070` ウ**: 源 (crop) は「“jpg”」、表示 jp は「“jpg'"」(閉じ引用符の崩れ)。zh / en は正しい。正解肢で、字形のみの是正。
- **`q063`**:
  - 表示 stem の末尾に「（図：ルートの下に A と B が…矢印はルート直下の B を指している。）」がある。源 page-24 には無い文 (図の言語化、図は添付済)。内容は源の図と整合する。
  - 源の引用符は “ ” で、表示は「」。
- **`q080`**:
  - 源 page-30 は図。表示は図を表に起こしたうえ、末尾に「（入力A・入力B のいずれの処理も、共有の「在庫数」を参照・更新する。）」を付けている (源に無い文、図は添付済)。
  - 読点は「、」(源は「，」)。
- **`q021`**: 源 page-08 は組織図だけ (crop を目視)。表示 stem は図を箇条書きに言語化している (図は添付済)。
- q063 / q080 / q021 の言語化文をどうするかは、B1〜B6 の扱い (源に無い挿入) に従って fixer が判断する。
- **「、」の題**: q010 / q021 / q024 / q072 / q080 の 5 題。源は「，」で、q024 は crop で目視した。

要確認 (fixer が源で確定する):
- `q091` / `q093` / `q094` / `q088`: 表示 jp の ASCII `"` は源では “ ” の見込み。
- `q040`: 「当てはまる マネジメント」の空白。

字形を変えない:
- **ASCII 読点「, 」**: 表示 jp で 59 題 (うち「，」と混在 16 題)。旧 exam の raw 出荷層で OCR に由来する、exam 全体の型。B4 §4e と同じく**不変・記録のみ** (⑨)。
- **`q058`**: 「①, ②」は D-147 の規範形 (u3b §9a で統一済)。戻さない。

**照合は表示層で行う (lesson)**: raw だけの差は学習者には見えない。例:
- q065 raw「39個」(表示 30)
- q029 raw「翌月の目標在庫量」(表示 20)
- q080 raw「排他制御を」(表示「は」)
- q019 / q084 raw「適切かもの」
- q006 raw「0ff-JT」
- q096 raw 冒頭の「〔テクノロジ〕問96」

**L2b**
- 表示 jp の見出しで〔〕以外のものは 0 件 (q090 / q099 は A3 で是正済)。
- マイナス 0 件。AI 図ラベル 0 件 (ただし q063 / q080 の言語化文は上記のとおり)。
- 表の構造フラグ:
  - q025 BODY0_LOOKS_HEADER
  - q029 / q065 / q096 NO_SEP
  - q082 COL0_REPEAT
- 範囲外: explanations の旧字形 `[システム導入検討会のメモ]` は A3 §5 の残り (解説層)。

**L2d / C2**
- q080 / q065 / q098 は EXTRA で、情報のみ。
- q011 は S127 C2 b1 で remove_figure 済み。
- mqA (q085 / q087 / q088) と mqC (q093〜q096) の共有図は OK。

**L2c**: 2012h24a は 0 件。**L2e**: q086 fd (A3 済み)。

**summary §7**
- **#4**: 本 prep で実行済み。
- **#6**: 0 件。
- **#7**: 上記の ASCII 読点。
- **#10**: 0 件。
- **#12**: B7 の全量再抄写で被覆される。⑤-4 scope-out は q070 / q074。
- **#16**: A3 済み。
- **#22**: q082。

## 4. Workflow 起動引数

```json
{"input_path":"/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/.phase2/b7_fidelity_input_2012h24a.json","exam_id":"2012h24a","qnums":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100],"label":"b7","pass":"sn","model":"sonnet","agent_type":"general-purpose"}
```

- 出力先の既定値は次の 2 つ。どちらもまだ存在しないことを確認済み。
  - out = `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b7_2012h24a_sn.json`
  - parts = `data/ip/quiz/.phase2/fidparts/b7_2012h24a_sn/`
- run の後:
  1. `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/b7_2012h24a_sn <input_path> 2012h24a <out> --journal <journal.jsonl>`
  2. `node scripts/quiz-fidelity-machdiff.mjs <input_path> <out>`
- 先行 unit (B4〜B6 / A5) の apply が B7 の起動より先に入った場合: 先行 unit は他の exam だけを変えるので、2012h24a の manifest には影響しない。それでも、起動直前に同じコマンドで manifest を作り直すのが安全 (冪等、0 token)。

## 5. 見積もり

| 項目 | 値 | 根拠 |
|---|---|---|
| agent | 100 (Sonnet 5、1 題 1 体) | B1〜B6 と同形 |
| token | ≈ 610 万 (540〜670 万) | 61k/問 × 100 |
| 後段 | fixer opus 1 + reviewer opus 1 (別 type) | S122 §0 |

- 上振れの要因:
  - crop の無い題が 19 題 (中問 15、page-30 の 3、q088) あり、源ページ全体で読む。
  - mqB / mqC / q098-copy は前文が長い。
  - q063 / q080 / q021 は図の言語化があり、agent が深読みしうる。
- 下振れの要因: merged_preamble は 0。

## 6. 阻害要因

- 脚本のエラーは 0。出た警告は chumon skip と page_mismatch 2 頁だけ (目視で原因を確定済み)。
- B7 の apply は D-152 の data lock の順番に従う。q085 の是正は 3 層 (jp / zh / en) に触れる。q088 の表の欠落は図 lane の担当で、B7 は扱わない。
