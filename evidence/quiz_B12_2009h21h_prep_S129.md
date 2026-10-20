# B track B12 — 2009h21h 準備 (S129、L3 data lane)

D-150 §3 (母数外 1,692 題の全量再抄写) の 12 本目。手順は B11 (`evidence/quiz_B11_2010h22a_prep_S129.md`) / B10 (`evidence/quiz_B10_2010h22h_prep_S129.md`) と同一。本書は**起動前の準備のみ**で、workflow は未起動。D-152 の data lock は別 lane が保持中なので、`data/ip/quiz/` の本体 (questions / translations / explanations / chumon_groups) にも bank (`data/ip/exams/`) にも書いていない。書いたのは `.phase2/b12_*` の manifest、precrop (`precrop/2009h21h/`)、それに新規 evidence 2 件だけ。git add / commit はしていない。

---

## 0. 起動前の阻害要因: なし

**bank page pointer の誤りは 0** (B11 §0 型は無い):
- ok 28 頁では、OCR verified の見出し 79 本が期待 qnum と一致した。これで 77 題の `source.page_image` は正しいと確定。
- 残り 23 題は目視で確認した。各題の 問NN 見出しと選択肢が、bank の page_image 上にすべてある。
  - skip 11 頁: page-04 / 09 / 18、中問頁 35〜37 / 39〜41 / 43〜44。
  - merged_preamble の 2 題: q007 (page-05)、q048 (page-19)。
- 中問前文の頁 34 / 38 / 42 には設問が無い。page-45〜48 は「表計算ソフトの機能・用語」。
- **manifest patch は不要**。

## 1. 母数

- `questions.json` の 2009h21h = **100 問 (q001〜q100)**。13 exam なので全問が母数外 → **B12 母数 = 100 / 100、除外 0**。
- 中問 member も核験の対象に含める (precrop の対象外であって核験の対象内。B1〜B11 と同じ規則)。
- **源の中問は 3 組**: page-34 冒頭「中問Aから中問Cまでは，それぞれ四つの問いを解答してください。」。A = q089-092 / B = q093-096 / C = q097-100。
- **`chumon_groups.json` の登録: 3 組すべて登録済** (L2f でも 3 組とも R)。3 組とも抽出組 (`chumon_preamble_S115.json`) で、COPY 組は無い。working tree の `chumon_groups.json` の未 commit 差分 (1 行) は 2009h21h に関係しない。

  | key | member | 前文の頁 | 共通接頭 jp |
  |---|---|---|---|
  | `2009h21h-mqA` | q089〜q092 | page-34 (完結、図 LAN の構成) | 327 字 |
  | `2009h21h-mqB` | q093〜q096 | page-38 (完結、図1・図2・表) | 619 字 |
  | `2009h21h-mqC` | q097〜q100 | page-42 (完結、表 + 分数 2 段落) | 547 字 |

- **前文表示の確認**: 12 member すべてで次を脚本で確かめた (**12/12 × 3 層**、probe_rule どおり空白除去後に照合)。
  - manifest の `displayed_stem_jp` と translations の `stem_jp_clean` が、registry の probe.jp で始まる。
  - translations の `stem.zh` / `stem.en` に probe.zh / probe.en が含まれる。
- **見出しの残存は 0**: 表示 jp / zh / en の stem・選択肢 (全 100 題) を走査した。
  - 「問 NN」「问 NN」「QNN」「中問」「中问」「Medium question」は残っていない。
  - 〔テクノロジ〕/ [Technology] 等の分野見出しも残っていない。
  - raw にだけ〔テクノロジ〕問92 等が残っている (表示されない)。
  - 抽出組なので、B9 q089 型の Rule B は該当しない。
- **probe との結合**: A「Mさんの部署では，…」、B「フィットネスジムに勤めるAさんは，…」、C「通信販売を行っているF社には，…」。源は「M さん」「A さん」「F 社」(空白あり) だが、空白除去後に一致する。全角英字は無い。
- B12 fixer の規則 (B4〜B11 と同じ):
  - 前文の是正が要る場合でも、stem 冒頭を単独で変えない。registry の probe との整合を lead に上げる。
  - 設問文以降を是正するときは、設問文側の部分一致で patch を当てる。stem 全体は置換しない。

## 2. manifest + precrop (main tree の脚本を改修せずに使用)

```
node scripts/quiz-fidelity-prep-any.mjs 2009h21h b12 all --precrop
```

- manifest: `data/ip/quiz/.phase2/b12_fidelity_input_2009h21h.json`。100 samples、`prev_page_png` 100/100。
  - stem 非空・correct_answer ∈ {ア,イ,ウ,エ} の不良は 0。
  - 選択肢のキー順は、**q057 だけが ア / ウ / イ / エ**。
    - `displayed_choices_jp` は bank の `choices_jp` から作られる。`question_bank.json` の q057 の `choices_jp` のキー順が アウイエ であることを確認した (2 段組の抽出順)。
    - 値はキーごとに源と一致する。
    - quiz 本体 (questions.json / translations) は ア〜エ の順で正常なので、学習者の表示には影響しない。
  - `displayed_stem_jp` は working tree 上の現 data から作った表示層。working tree の未 commit 変更は他 exam (2011h23a 等) だけで、`questions.json` の diff に 2009h21h は 0 行。
- crop: `data/ip/quiz/.phase2/precrop/2009h21h/` に **77 / 100** (`question_crop_png` 77、ファイル実在 77 + `_precrop_report.json`)。dir は本 prep の前から空で存在していた (13:05 作成、中身 0)。
- **calib**: B1〜B11 (head≈130) と違い、見出しが右寄り。

  | 対象 | head | body | 窓 (head −14 〜 +18) |
  |---|---|---|---|
  | 全体 | 170 | 230 | — |
  | odd | 170 | 240 | x∈[156,188] |
  | even | 160 | 220 | x∈[146,178] |

- **`_precrop_report.json`** (tesseract 5.5.2、ocr=true): 39 頁の内訳は **ok 28** / **page_mismatch 11** / qnum_mismatch 0。ok 頁の見出し 79 本はすべて verified で、unconfirmed 0、confusable_only 0。
- **OI-1**: ok 頁の見出し x は 149〜187。窓の両端に近い頁がある。
  - 下端寄り: even の page-28 = 149、page-26 = 150 (下端は 146)。
  - 上端寄り: odd の page-09 = 187、page-25 = 182〜187 (上端は 188)。
  - **真の OI-1 は 0**。
- **skip 23 題**: page_mismatch 21 / merged_preamble 2 (qnum_mismatch 0 / chumon 0 / thin_band 0)。原因は頁ごとに目視で確定した:

  | 頁 | 期待 | 検出 | 原因 |
  |---|---|---|---|
  | page-04 | q004〜q006 | 2 | 問6 (x=167 で窓内) の見出し行が短く、右端 43.1% < `MIN_RIGHT_FRAC` 45% で節見出し扱いになった。**短見出し型 (新区分)、OI-1 ではない** |
  | page-09 | q019 / q020 | 1 | 問20 (x=187 で窓内)、右端 44.4%。同じ短見出し型 |
  | page-18 | q044〜q047 | 3 | 問44 (x=153 で窓内)、右端 43.6%。同じ短見出し型 |
  | page-35〜37 / 39〜41 / 43〜44 | 中問 member | 0 | 中問頁の型 |

  - merged_preamble は q007 (displayed 315 字 vs bank 164 字) と q048 (230 字 vs 112 字)。どちらも表を markdown 化したもので、小問。源 page-05 / page-19 で頁内完結している。
  - **誤帯は 0**。skip 題は、manifest の source に指定した源ページ全体で読める。
  - crop 率は 77% (B11 74% / B10 81%)。
- **前文の頁が source / prev に無い member** (fixer が実読する頁)。本 prep で中問頁 34〜44 を全頁目視した。

  | 題 | 見えない前文の頁 | manifest の source / prev |
  |---|---|---|
  | q091 | page-34 | 36 / 35 |
  | q092 | page-34 | 37 / 36 |
  | q095 | page-38 | 40 / 39 |
  | q096 | page-38 | 41 / 40 |
  | q099 | page-42 | 44 / 43 |
  | q100 | page-42 | 44 / 43 |

  - 計 6 member。agent は表示 stem の前文を「源に無い挿入」と誤報告しうる。既知型として扱う。
  - q089 / q090 / q093 / q094 / q097 / q098 では、前文頁が prev として見える。
- **選択肢が manifest の頁に無い題 (B10 q095 型) は 0**。各頁の最初の見出しは y≈171〜208 にある (page-03 / 14 / 21 は節見出し枠の下で y≈322〜331)。頁頭に、前頁からの続きは無い。

## 3. 名指し項目 → `evidence/quiz_B12_2009h21h_named_S129.json`

核験 agent の prompt には入れない。読むのは fixer と reviewer。

**A1 backlog**: 候補 258 件 / 35 題。high は 164 件 / 25 題。このうち 26 件を resolved にした。**未処置の high は 138 件 / 24 題**。
- resolved の内訳: raw だけの 0q.prose 24 件 (B7 の規則) と、zh の規則 (B8) によるもの 2 件。
- **分類器 = B3 規則** (B6〜B11 prep の再実装を流用)。
- **D-166 (コード片の `"` は対象外) に該当する候補は 0**。表示 jp の ASCII `"` は q002 の散文だけ。
- 未処置 high の内訳: `q087` 22 / `q072` 18 / `q098` 11 / `q095` 10 / `q090` 9 / その他 68。
  - 大半は FP: ends96 は表の値・丸数字。0a.* は raw→clean の差で、表示は源どおり。0c.isolated_kanji の「相次ぎ」「各棒」は正しい語。
  - 0b.num_missing (q098 / q099 en): en を確認した。jp の「2 人が一緒に」が en では together だけで、2 の語は無い。意味は保たれている。
  - 別件 (backlog 外): **q098 en** は 1 題の stem の中で敬称が混在している。前文は Mr. A / Mr. B、設問部は Ms. A / Ms. B。q097 / q099 / q100 は Mr. だけで、源は「A さん」(性別無し)。設問部を前文に揃えるかは fixer が判断する。

**answer_affecting の疑い: なし** (表示層で correct_answer と矛盾する題は 0)。以下 30 題を表示層 (図の題は源の図) から再導出し、すべて一致した:
- 小問: `q007` B イ / `q014` 400 ウ / `q021` エ / `q023` 25 イ / `q027` イ / `q037` 8 ウ / `q048` 53 ウ / `q057` イ / `q061` エ / `q062` 3・2 エ / `q064` ウ / `q070` 0.81 ア / `q071` ア / `q072` 3 イ / `q080` イ / `q082` 7 イ / `q085` D ウ / `q087` ア
- 中問: `q089` 4 エ / `q090` 1 イ / `q091` ア / `q092` ア / `q093` ア / `q094` ウ / `q095` 男性50代 エ / `q096` ア / `q097` 2/9 エ / `q098` ① ア / `q099` 20 イ / `q100` 30 ウ
- 照合した源: q007 / q048 / q080 / q087 / q062 の表・棒グラフ、q021 / q037 / q057 / q071 の図、中問の各頁。

**答え漏洩: 0**。
- 3 層の stem・選択肢を走査した。語は「正解」「不正解」「正解図」「正しい図」「错误图」「正确图」「Correct figure」「Incorrect figure」「correct answer」等。
- 図・表を言語化した選択肢 (q061 / q062 / q066 / q098) にも、判定語は無い。
- B11 q066 型は無い。

**源で確定した是正** (本 prep で目視。key には影響しない):
- **`q050`** イ: 源は「アローダイアグラム」(page-19)。誤りは 3 層ともで、backlog にも無い。
  - 表示 jp / raw / bank は「フローダイアグラム」。
  - zh は「流程图（flow diagram）」、en は「Flow diagram」。
  - 正解はウ (ガントチャート)。
- **`q002`** stem: 源は “個人情報”。表示 jp は ASCII `"個人情報"` (開閉とも)。
  - 散文の引用なので D-166 の対象外。
  - zh は “ ” で処置済み。en の ASCII `"` は英文の通常の引用。

**字形 (D-155 / D-162 で fixer が判断)**:
- 散文の半角「, 」(源は「，」) が 49 題にある。B1〜B11 と同じ型。
- 「、」と全角数字は 0。
- 式の全角演算子: q027 選択肢の「－」と、q087 の「＋」「－」(表 B 列と選択肢イ〜エ)。D-162 の対象。
- q087 の範囲記号は、源が「～」、表示が「〜」。
- q057 の “ ” は、表示で「」になっている。

**図・表の言語化** (図は添付済):
- 言語化されている図: q021 / q037 / q057 / q072 / q080 / q091 / q092 / q096 / 中問 B の図1・図2・表。いずれも源と一致する。
- 言語化されていない図 (agent は添付の図で照合する): q071 (ベン図)、q095 (円グラフ)、中問 A の LAN 構成図、q098 (線分グラフ)。
- 去就は B1〜B11 の扱いに従って fixer が判断する。

**既知・不触**:
- `q062`: L2d は EXTRA (情報のみ)。stem 末尾の OCR 残骸「lu 5 | ュー | 5 | s | |エ| 3 | 2 |」は **raw だけ**で、表示・zh・en には無い。表示の stem と選択肢は源どおり。
- `q007`: −10 は A3 / A5 で 3 層とも是正済み (U+2212)。
- `q037`: A5 で「アローダイアグラム」ラベル行を削除済み (凡例行は残る)。D-158。
- `q091` / `q092`: A3 / A5 でラベル行を削除済み。
- S115 caveat の q009 秘密 / q022 ビジョン / q054 ポリシ は、表示で是正済み。
- L2c の q096 は、shipped が源どおり (raw だけ STEM_WRONG)。

## 4. Workflow 起動引数

```json
{"input_path":"/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/.phase2/b12_fidelity_input_2009h21h.json","exam_id":"2009h21h","qnums":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100],"label":"b12","pass":"sn","model":"sonnet","agent_type":"general-purpose"}
```

- 出力先の既定値は次の 2 つ。どちらもまだ存在しないことを確認済み。
  - out = `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b12_2009h21h_sn.json`
  - parts = `data/ip/quiz/.phase2/fidparts/b12_2009h21h_sn/`
- 起動直前に、同じコマンドで manifest を作り直す (冪等、0 token)。先行 unit の apply で 2009h21h の表示層が変わった場合に備える。§0 の patch は無い。
- run の後:
  1. `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/b12_2009h21h_sn <input_path> 2009h21h <out> --journal <journal.jsonl>`
  2. `node scripts/quiz-fidelity-machdiff.mjs <input_path> <out>`

## 5. 見積もり

| 項目 | 値 | 根拠 |
|---|---|---|
| agent | 100 (Sonnet 5、1 題 1 体) | B1〜B11 と同形 |
| token | ≈ 590 万 (560〜660 万) | B9 の実績 5,707,937 (crop 無し 14 題)、B7 の実績 5,721,538 (crop 無し 19 題) を基準にした。B12 は crop 無しが 23 題あるが、前文は B11 より短い |
| 後段 | fixer opus 1 + reviewer opus 1 (別 type) | S122 §0 |

- 上振れの要因:
  - crop の無い題が 23 題ある (中問 12 + 小問 11)。
  - 中問 B の前文は表付きで、en は最大 2,145 字 (q096)。
  - 中問 A / q091 / q092 は流れ図の言語化があり、agent が図と深く照合しうる。
- 下振れの要因: 小問の skip (page-04 / 09 / 18) はどれも短い文章題。

## 6. 阻害要因

- **なし**。page pointer の誤り 0、manifest patch 不要。
- 脚本のエラーは 0。出た警告は page_mismatch 11 頁 + merged_preamble 2 題だけで、どれも目視で原因を確定済み。
- 中問の見出しの残存は 0。probe の全角結合も無い。
- 答え漏洩 0、key と矛盾する題 0。
- B12 の apply は D-152 の data lock の順番に従う。
- **L1b への所見** (他 exam にも共通する。本 lane では直さない):
  - page-04 / 09 / 18 で 10 題分の crop が落ちた。原因は `MIN_RIGHT_FRAC = 0.45` の節見出しフィルタで、OI-1 の窓較正の問題ではない。
  - 落ちたのは「問6 SaaS を説明したものはどれか。」のような 1 行の短い stem で、右端は 43.1〜44.4%。
  - 短い stem がある exam では、どこでも再発する。安全側 (skip) の劣化なので、誤帯は出ない。
