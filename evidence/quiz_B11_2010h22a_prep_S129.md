# B track B11 — 2010h22a 準備 (S129、L3 data lane)

D-150 §3 (母数外 1,692 題の全量再抄写) の 11 本目。手順は B10 (`evidence/quiz_B10_2010h22h_prep_S129.md`) / B9 (`evidence/quiz_B9_2011h23a_prep_S129.md`) と同一。本書は**起動前の準備のみ**で、workflow は未起動。D-152 の data lock は別 lane が保持中なので、`data/ip/quiz/` の本体 (questions / translations / explanations / chumon_groups) にも bank (`data/ip/exams/`) にも書いていない。書いたのは `.phase2/b11_*` の manifest、precrop (`precrop/2010h22a/`)、それに新規 evidence 2 件だけ。git add / commit はしていない。

---

## 0. 起動前の阻害要因 (新規、lead 判断)

**`q062` / `q063` の bank page pointer が誤り**:
- bank の `source.page_image` は page-23。だが源の page-23 には 問60 / 問61 しか無い。問62 / 問63 / 問64 は page-24 にある。
- 根拠は 3 つあり、互いに一致する。
  - 本 prep で page-23 / page-24 を目視した。
  - precrop report: page-23 は expected 4 / detected 2、page-24 は expected 1 / detected 3 (x=124〜126 で窓内、OI-1 ではない)。
  - S115 caveat (`caveat_fidelity_S115_2010h22a.json`) の q063 も page-24 を引用している。
- manifest は q062 / q063 に source=page-23 / prev=page-22 を渡す。agent には**設問も選択肢も見えない**。B10 q095 型 (選択肢だけ次頁) より重い。
- **推奨**: D-152 lock 保持者が `data/ip/exams/question_bank.json` の q062 / q063 の `source.page_image` を `pages/2010h22a/page-24.png` に直す。そのあと §4 のコマンドで manifest を再生成する (page-23 / 24 の precrop も正しくなる)。
- **代替** (bank を直さない場合): manifest を再生成した**後に**、次の patch を当てる。再生成すると消えるので、起動直前に毎回当てる。
  ```
  node -e 'const f="data/ip/quiz/.phase2/b11_fidelity_input_2010h22a.json",fs=require("fs"),m=JSON.parse(fs.readFileSync(f));for(const s of m.samples)if(["2010h22a-q062","2010h22a-q063"].includes(s.id)){s.source_page_png=s.source_page_png.replace("page-23","page-24");s.prev_page_png=s.prev_page_png.replace("page-22","page-23");}fs.writeFileSync(f,JSON.stringify(m,null,2)+"\n")'
  ```
- L2d の `q092` page-pointer 不一致 (located page-36 / bank page-37) は別件。manifest は source=page-37 / prev=page-36 なので、表2 は agent に見える。

## 1. 母数

- `questions.json` の 2010h22a = **100 問 (q001〜q100)**。13 exam なので全問が母数外 → **B11 母数 = 100 / 100、除外 0**。
- 中問 member も核験の対象に含める (precrop の対象外であって核験の対象内。B1〜B10 と同じ規則)。
- **源の中問は 3 組**: page-35 冒頭「中問Aから中問Cまでは，それぞれ四つの問いを解答してください。」。A = q089-092 / B = q093-096 / C = q097-100。q085〜q088 は小問。
- **`chumon_groups.json` の登録: 3 組すべて登録済** (L2f でも 3 組とも R)。3 組とも抽出組 (`chumon_preamble_S115.json`) で、COPY 組は無い。

  | key | member | 前文の頁 | 共通接頭 jp |
  |---|---|---|---|
  | `2010h22a-mqA` | q089〜q092 | page-35 → page-36 上端 (表2 出力結果表) | 1,202 字 |
  | `2010h22a-mqB` | q093〜q096 | page-38 (完結) | 759 字 |
  | `2010h22a-mqC` | q097〜q100 | page-43 (完結) | 439 字 |

- **前文表示の確認**: 12 member すべてで、manifest の `displayed_stem_jp` と translations の `stem_jp_clean` が registry の probe.jp で始まる。translations の `stem.zh` / `stem.en` にも probe.zh / probe.en が含まれる (**12/12 × 3 層**、脚本で確認。probe_rule どおり空白除去後に照合)。
- **見出しの残存は 0**: 表示 jp / zh / en の stem・選択肢 (全 100 題) を走査した。「問 NN」「问 NN」「QNN」も、〔分野〕/ [Technology] 等の見出しも残っていない。抽出組なので、B9 q089 型の Rule B (COPY 表の cut marker) は該当しない。
- **probe との結合**: A「Mさんは，総務課のNさんから…」(源は「M さん」で、空白除去後に一致)、B「S社のT営業所では，…」、C「E社の情報システム部では，…」。3 組とも全角英字は無い (B10 A 組の全角 Ｓ のような結合は無い)。
- B11 fixer の規則 (B4〜B10 と同じ): 前文の是正が要る場合でも、stem 冒頭を単独で変えない。registry の probe との整合を lead に上げる。設問文以降を是正するときは、設問文側の部分一致で patch を当て、stem 全体は置換しない。

## 2. manifest + precrop (L1b 改修版、main tree の脚本を改修せずに使用)

```
node scripts/quiz-fidelity-prep-any.mjs 2010h22a b11 all --precrop
```

- manifest: `data/ip/quiz/.phase2/b11_fidelity_input_2010h22a.json`。100 samples、`prev_page_png` 100/100。
  - 健全性の不良は 0 (stem 非空・correct_answer ∈ {ア,イ,ウ,エ})。選択肢のキー順は 100 題ともア / イ / ウ / エ。
  - `displayed_stem_jp` は表示層 (translations の `stem_jp_clean` || `stem_jp`) で、working tree 上の現 data から作った。working tree の未 commit 変更は他 exam (2011h23tokubetsu) だけで、`questions.json` の diff に 2010h22a は 0 行。
- crop: `data/ip/quiz/.phase2/precrop/2010h22a/` に **74 / 100** (manifest の `question_crop_png` 74、ファイル実在 74 + `_precrop_report.json`)。dir は本 prep の前には存在しなかった (新規作成)。
- **calib**: 全体は head=130 / body=190 (得票 130=22p / 140=11p / 150=7p、40 頁)。odd は 130 / 200、even は 130 / 190。
- **`_precrop_report.json`** (tesseract 5.5.2、ocr=true):
  - 40 頁の内訳: **ok 28** / **page_mismatch 11** / **qnum_mismatch 1**。
  - ok 頁の見出しは 76 本。すべて verified で、unconfirmed 0、confusable_only 0。
- **OI-1**: 窓は x∈[116,148] (head 130 − 14 〜 +18)。ok 頁の見出し x は 118〜147 (page-30 は 118 / 122、page-27 / 29 は 145〜147 で、窓の両端に近い)。
- **skip 26 題**: page_mismatch 23 / qnum_mismatch 1 / merged_preamble 2 (chumon 0 / thin_band 0)。原因は頁ごとに目視で確定した:

  | 頁 | 期待 | 検出 | 原因 |
  |---|---|---|---|
  | page-13 | q029〜q032 | 3 | 4 題とも頁内。問30 の行の左余白に走査ノイズ (x≈61) があり、検出が漏れた。**OI-1 ではない** |
  | page-23 | q060〜q063 | 2 | §0 の page pointer 誤り |
  | page-24 | q064 | 3 | §0 と同じ原因 (問62〜64 は窓内) |
  | page-28 | q072〜q074 | 2 | **真の OI-1**。問72 は x=115 で、窓の下端の 1px 外 (B8 page-26 / B10 page-24 型) |
  | page-36 / 37 / 39〜42 / 44 | 中問 member | 0〜2 | 中問頁の型。page-36 は表2 の行 (x≈146) を誤検出 |
  | page-43 | q097 | qnum_mismatch | 「中問C」の帯 (x=139) を見出しと誤検出 (OCR は空) |

  - **merged_preamble (B10 には無かった区分)**: q048 (displayed 436 字 vs bank 175 字) と q087 (334 字 vs 156 字)。図の言語化で displayed が膨らんだ小問で、中問ではない。源 page-19 / page-34 は頁内で完結している。
  - **誤帯は 0**。skip 題は manifest の source に指定した源ページ全体で読める (q062 / q063 は §0 の処置が前提)。
  - crop 率は 74%。B10 (81%) / B9 (86%) より低い。§0 の pointer 誤りで 2 頁分が落ちたのが一因。
- **前文の頁が source / prev に無い member** (fixer が実読する頁)。本 prep で中問頁 35〜44 を全頁目視し、前文の範囲を確定した:

  | 題 | 見えない前文の頁 | manifest の source / prev |
  |---|---|---|
  | q090 | page-35 (page-36 の表2 は見える) | 37 / 36 |
  | q091 | page-35 (同上) | 37 / 36 |
  | q092 | page-35 (同上) | 37 / 36 |
  | q094 | page-38 | 40 / 39 |
  | q095 | page-38 | 41 / 40 |
  | q096 | page-38 | 42 / 41 |

  - 計 6 member。前文は表示 stem にあるので、agent は前文を「源に無い挿入」と誤報告しうる。既知型 (B4〜B10 と同じ型) として扱う。
  - q089 / q093 / q097〜q100 は前文が全部見える (C 組の前文 page-43 は、q097 の source で q098〜q100 の prev)。
- **選択肢が manifest の頁に無い題 (B10 q095 型) は 0**。代わりに §0 の q062 / q063 (設問ごと見えない) がある。

## 3. 名指し項目 → `evidence/quiz_B11_2010h22a_named_S129.json`

核験 agent の prompt には入れない。読むのは fixer と reviewer。

**A1 backlog**: 候補 361 件 / 48 題。high は 209 件 / 35 題。このうち 52 件を resolved にした。**未処置の high は 157 件 / 31 題**。
- resolved の内訳: raw だけの 0q.prose 28 件 (B7 の規則) と、zh の規則 (B8) によるもの 24 件。
- D-166 (コード片の `"` は対象外) に該当する候補は 0。表示 jp の ASCII `"` は q079 の散文だけ。
- **分類器 = B3 規則** (B6〜B10 prep の再実装を流用)。
- 未処置 high の内訳: `q079` 30 / `q084` 16 / `q085` 14 / `q097` 10 / `q018` 10 / その他 77。
  - 大半は FP: 2.nine_six ends96 は表の値・選択肢の値。7.space table は markdown 表と図の言語化。0a.* は raw→clean の差で、表示は源どおり。
  - 真の欠陥は q079 で、源で照合済み。

**answer_affecting の疑い: key との矛盾は無し** (表示層で correct_answer と矛盾する題は 0)。以下 33 題を表示層 (図の題は源の図) から再導出し、すべて一致した:
- 小問: `q008` イ / `q014` 5 イ / `q018` 85 ウ / `q019` ウ / `q023` 35 エ / `q046` G エ / `q048` イ / `q057` 2.5 ウ / `q061` ウ / `q064` エ / `q066` エ / `q068` エ / `q069` 5 イ / `q072` 9 イ / `q079` イ / `q082` 48 ウ / `q083` 336 ウ / `q084` 商品B イ / `q085` 52.0 イ / `q087` エ / `q088` エ
- 中問: `q089` エ / `q090` 2,000 ウ / `q091` ア / `q092` イ / `q093` エ / `q094` 5 イ / `q095` ① ア / `q096` イ / `q097` ウ / `q098` イ / `q099` 10.5 イ / `q100` イ
- 表は源の crop と照合した (q008 / q018 / q084 / q046 進捗表)。
- `q095` は L2d が「出荷 stem_jp の転記誤り多数」と指摘した題。転記誤りは raw だけで、表示は源どおり (①〜④、会議室 × ○ ○)。key ア は、課長の行を特別会議室の DENY 行 (営業課員，技術課員) より前に置く ① で一致する。

**答え漏洩 (最優先)**:
- **`q066`**: 選択肢が図の言語化になっており、末尾に判定が付いている。ア〜ウは「…不正解図。」、エは「…を正しく示す正解図。」。
  - zh (错误图 / 正解图) と en (Incorrect figure / Correct figure) も同じで、**3 層とも学習者に答えが見える**。
  - B4 q068 と同じ型 (D-163 答え漏洩削除)。グラフの辺は源と一致し、key エとも一致する。

**源で確定した是正** (本 prep で目視。key には影響しない):
- **`q079`** (正解肢イを含む): 源の選択肢ア〜エは “業者”表 等。表示 jp は ASCII `"業者"` (開閉とも)。
  - A2b §6d の D-151 正解肢 field。散文の引用なので D-166 の対象外。
  - stem の「業者」表は D-155 (原典の字形に題ごとに従う) で fixer が判断する。
- **`q078`** ア: 源は「a, b」。表示 jp は「ab」で、区切りが欠けている。
- **`q031`**: 選択肢が表の行の断片になっている。ア「[表] | | 業務プロセスモデル | データモデル | | ア | DFD | E-R 図 |」は、見出し行と記号ア が混入している。イ〜エは「| イ | DFD | PERT |」のように記号が重複している。源 page-13 は 2 列の選択肢表 (key ア)。

**字形 (D-155 / D-162 で fixer が判断)**:
- 引用符が「」になっている (源は “ ”): q079 / q084 / q085 / q087 の stem、q095 の “課長”。
- q095 の「、」は前文 (probe) の外にある。
- `q061`:
  - stem に全角数字「３けた」「１けた」と「、」×3 がある (源は「3 けた」「，」)。
  - 式は「10−整数部(A2／100)＋…」で、D-162 (演算子は ASCII) の対象。式中に引用符は無い。
- 「、」は q003 / q086 にもある。q010 は「派遣先A 社」(空白あり) と「A社」が混在している。

**図・表の言語化** (図は添付済):
- 選択肢が丸ごと図の言語化: q064 (4 構成図) と q066 (4 有向グラフ)。どちらも源の図と照合して key を再導出した。
- 言語化されていない図 (agent は添付の図で照合する): q085 (図2 の 5×5) と q046 (アローダイアグラム)。
- q048 / q087 は二重に言語化されている (merged_preamble)。q072 / q023 / 中問の表1・表2・許可区分・作業計画の表は、いずれも源と一致する。
- 去就は B1〜B10 の扱いに従って fixer が判断する。

**既知・不触**:
- `q086` の「処理依頼」「処理される」は源どおり (S98 failure)。逆向きに直さない。
- `q072` の図ラベルは A3 で是正済み。
- L2d の TRUNCATED (`q008` / `q095`) は、C3 で再 crop 済み (`evidence/fig_C3_S128.md`)。
- L2c (q018 / q097) は、shipped が源どおり (raw だけ STEM_WRONG)。L2e は 0 件。

## 4. Workflow 起動引数

```json
{"input_path":"/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/.phase2/b11_fidelity_input_2010h22a.json","exam_id":"2010h22a","qnums":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100],"label":"b11","pass":"sn","model":"sonnet","agent_type":"general-purpose"}
```

- 出力先の既定値は次の 2 つ。どちらもまだ存在しないことを確認済み。
  - out = `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b11_2010h22a_sn.json`
  - parts = `data/ip/quiz/.phase2/fidparts/b11_2010h22a_sn/`
- 起動直前の手順:
  1. **§0 の処置** (bank を直すか、再生成後に patch を当てる)。
  2. 同じコマンドで manifest を作り直す (冪等、0 token)。先行 unit の apply で 2010h22a の表示層が変わった場合に備える。
  3. bank を直さなかった場合は、ここで §0 の patch を当てる。
- run の後:
  1. `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/b11_2010h22a_sn <input_path> 2010h22a <out> --journal <journal.jsonl>`
  2. `node scripts/quiz-fidelity-machdiff.mjs <input_path> <out>`

## 5. 見積もり

| 項目 | 値 | 根拠 |
|---|---|---|
| agent | 100 (Sonnet 5、1 題 1 体) | B1〜B10 と同形 |
| token | ≈ 620 万 (580〜700 万) | B9 の実績 5,707,937 (crop 無し 14 題)、B7 の実績 5,721,538 (crop 無し 19 題) を基準にした。crop 無しが 26 題あり、前文も長いので上寄りにした |
| 後段 | fixer opus 1 + reviewer opus 1 (別 type) | S122 §0 |

- 上振れの要因:
  - crop の無い題が 26 題ある (中問 12 + 小問 14)。
  - 中問の前文が長い。A は jp 約 1,200 字 / en 2,300〜2,600 字 (表1 + 表2)。B は en で最大 3,777 字 (q095)。
  - q064 / q066 は選択肢が図の言語化で、agent が図と深く照合しうる。
- 下振れの要因: 小問 skip の大半 (page-13 / 28) は頁内で完結した短い題。

## 6. 阻害要因

- **§0 (q062 / q063 の page pointer) は起動前に処置が要る**。処置しないと 2 題が UNREADABLE か誤報告になる。
- 脚本のエラーは 0。出た警告は page_mismatch 11 頁 + qnum_mismatch 1 頁 + merged_preamble 2 題だけで、どれも目視で原因を確定済み。
- 中問の見出しの残存は 0。probe の全角結合も無い。
- B11 の apply は D-152 の data lock の順番に従う。
