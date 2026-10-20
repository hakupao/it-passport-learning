# B track B13 — 2009h21a 準備 (S129、L3 data lane)

D-150 §3 (母数外 1,692 題の全量再抄写) の 13 本目 (最終 exam)。手順は B12 (`evidence/quiz_B12_2009h21h_prep_S129.md`) / B11 §0 と同一。本書は**起動前の準備のみ**で、workflow は未起動。D-152 の data lock は別 lane が保持中なので、`data/ip/quiz/` の本体 (questions / translations / explanations / chumon_groups) にも bank (`data/ip/exams/`) にも書いていない。書いたのは `.phase2/b13_*` の manifest、precrop (`precrop/2009h21a/`)、それに新規 evidence 2 件だけ。git add / commit はしていない。

---

## 0. 起動前の阻害要因 (新規、lead 判断): `q093` の bank page pointer が誤り

- bank の `source.page_image` は page-36。だが源の page-36 は**中問B の前文 + 図 (商品別販売分析ワークシート) だけ**で、問93 の stem と選択肢 ア〜エ は page-37 にある (本 prep で page-36 / 37 を目視)。
- 根拠は 3 つあり、互いに一致する。
  - 目視: page-37 = 〔ストラテジ〕問93「図のセル E2 に入力されている計算式…」+ ア C2／B2 / イ D2／B2 / ウ D12／B12＊B2 / エ D2／D12。
  - precrop report: page-36 は expected [93] / detected 0。page-37 を指す sample は 1 つも無く、report に page-37 の行も無い。
  - L2d (`S128_L2d_figblind.json`) の q093 は bank_page=page-36。これは図 (ワークシート) の位置で、設問の位置ではない。
- manifest は q093 に source=page-36 / prev=page-35 を渡す。agent には前文の図は見えるが、**設問も選択肢も見えない**。B11 q062 / q063 と同じ重さ。
- q094 (source=38 / prev=37) は影響なし。他 99 題の pointer は正しい (§2)。
- **推奨**: D-152 lock 保持者が `data/ip/exams/question_bank.json` の q093 の `source.page_image` を `pages/2009h21a/page-37.png` に直す。そのあと §4 のコマンドで manifest を再生成する。
- **代替** (bank を直さない場合): manifest を再生成した**後に**次の patch を当てる。再生成すると消えるので、起動直前に毎回当てる。patch 後は prev=page-36 になり、前文の図も見える。
  ```
  node -e 'const f="data/ip/quiz/.phase2/b13_fidelity_input_2009h21a.json",fs=require("fs"),m=JSON.parse(fs.readFileSync(f));for(const s of m.samples)if(s.id==="2009h21a-q093"){s.source_page_png=s.source_page_png.replace("page-36","page-37");s.prev_page_png=s.prev_page_png.replace("page-35","page-36");}fs.writeFileSync(f,JSON.stringify(m,null,2)+"\n")'
  ```

## 1. 母数

- `questions.json` の 2009h21a = **100 問 (q001〜q100)**。13 exam なので全問が母数外 → **B13 母数 = 100 / 100、除外 0**。
- 中問 member も核験の対象に含める (precrop の対象外であって核験の対象内。B1〜B12 と同じ規則)。
- **源の中問は 3 組**: page-32 冒頭「中問Aから中問Cまでは，それぞれ四つの問いを解答してください。」。A = q089-092 / B = q093-096 / C = q097-100。
- **`chumon_groups.json` の登録: 3 組すべて登録済** (L2f でも 3 組とも R)。3 組とも抽出組 (`chumon_preamble_S116.json`) で、COPY 組は無い。working tree の `chumon_groups.json` の未 commit 差分 (1 行) は `2011h23a-q089-copy` で、2009h21a には関係しない。

  | key | member | 前文の頁 | 共通接頭 jp |
  |---|---|---|---|
  | `2009h21a-mqA` | q089〜q092 | page-32 (完結、概要 (1)〜(3) + システム概要) | 466 字 |
  | `2009h21a-mqB` | q093〜q096 | page-36 (完結、ワークシート図) | 1,006 字 |
  | `2009h21a-mqC` | q097〜q100 | page-40 (完結、図1 DB 構造 + 図2 請求書) | 921 字 |

- **前文表示の確認**: 12 member すべてで次を脚本で確かめた (**12/12 × 3 層**、probe_rule どおり空白除去後に照合)。
  - manifest の `displayed_stem_jp` と translations の `stem_jp_clean` が、registry の probe.jp で始まる。
  - translations の `stem.zh` / `stem.en` に probe.zh / probe.en が含まれる。
- **見出しの残存は 0**: 表示 jp / zh / en の stem・選択肢 (全 100 題) を走査した。
  - 「問 NN」「问 NN」「QNN」「中問」「中问」「Medium question」は残っていない。
  - 〔テクノロジ〕/ [Technology] 等の分野見出しも残っていない。
  - raw にだけ q095 先頭の〔ストラテジ〕等が残っている (表示されない)。
  - 抽出組なので、B9 q089 型の Rule B は該当しない。
- **probe との結合**: A「S社の販売管理業務は，…」、B「N社の営業部では，…」、C「I社は，企業に対してPC関連機器の…」。源は「S 社」「N 社」「I 社」(空白あり) だが、空白除去後に一致する。全角英字は無い。
- B13 fixer の規則 (B4〜B12 と同じ):
  - 前文の是正が要る場合でも、stem 冒頭を単独で変えない。registry の probe との整合を lead に上げる。
  - 設問文以降を是正するときは、設問文側の部分一致で patch を当てる。stem 全体は置換しない。

## 2. manifest + precrop (main tree の脚本を改修せずに使用)

```
node scripts/quiz-fidelity-prep-any.mjs 2009h21a b13 all --precrop
```

- manifest: `data/ip/quiz/.phase2/b13_fidelity_input_2009h21a.json`。100 samples、`prev_page_png` 100/100。
  - stem 非空・correct_answer ∈ {ア,イ,ウ,エ} の不良は 0。
  - `displayed_stem_jp` は表示層 (`stem_jp_clean || stem_jp`) と 100/100 一致。`displayed_choices_jp` は bank の `choices_jp` で、`questions.json` の `choices_jp` と値が 100/100 一致。
  - 選択肢のキー順が違うのは **3 題**: q025 ア/ウ/イ/エ、q042 イ/ウ/エ/ア、q051 ア/ウ/エ/イ (bank の 2 段組の抽出順)。値はキーごとに源 (page-10 / q042 crop / page-19) と一致する。quiz 本体は ア〜エ の順なので、学習者の表示には影響しない。
  - working tree の未 commit 変更は他 exam (2011h23a 等) だけで、`questions.json` の diff に 2009h21a は 0 行。
- crop: `data/ip/quiz/.phase2/precrop/2009h21a/` に **56 / 100** (ファイル 56 + `_precrop_report.json`)。dir は本 prep で新規に作った。
- **calib**:

  | 対象 | head | body | 窓 (head −14 〜 +18) |
  |---|---|---|---|
  | 全体 | 160 | 230 | — |
  | odd | 170 | 230 | x∈[156,188] |
  | even | 160 | 230 | x∈[146,178] (fallback: 全体 160 が 9p、150 が 10p で僅差) |

- **`_precrop_report.json`** (tesseract、ocr=true): 38 頁の内訳は **ok 19** / **page_mismatch 18** / **qnum_mismatch 1** (page-39)。ok 頁の見出し 56 本はすべて verified で、unconfirmed 0、confusable_only 0。ok 頁の見出し x は 146〜188 で、窓の両端に張り付いた頁がある (even page-28 = 146〜149、odd page-27 = 186〜188)。
- **skip 44 題** (page_mismatch 42 / qnum_mismatch 2、merged_preamble 0 / chumon 0 / thin_band 0)。帯幅を広げた再走査 + tesseract と目視で、原因を頁ごとに確定した:

  | 型 | 頁 (落ちた見出し) | 題数 |
  |---|---|---|
  | **真の OI-1** (見出し x が窓下端 156 の外) | odd page-03 (問1〜3 が x=149〜151)、odd page-05 (問8 = 155、問9 = 154) | 6 |
  | **左余白ノイズ** (B11 page-13 型。見出し本体は窓内) | page-06 問10 / 08 問17 / 10 問24・25 / 14 問37 / 17 問45 / 19 問51・52 / 26 問70 / 30 問82 | 26 |
  | **中問頁の型** (〔分野〕行の下で見出し x≈180〜193 は両窓の上端の外。page-39 は〔ストラテジ〕行 2 本を見出しと誤認) | page-33〜36 / 38 / 39 / 41〜43 | 12 |

  - B12 の短見出し型 (`MIN_RIGHT_FRAC`) で落ちた題は **0** (見出し行の右端の最小は page-05 問8 の 47.7%)。
  - 真の OI-1 は page-03 / 05 の **5 見出し**。odd 頁なのに見出しが even 側の位置にある (走査の配準の揺れ)。page-39 問96 も x=144 (左余白の点)。
  - **誤帯は 0**。skip 題は manifest の source 頁全体で読める (q093 は §0)。
  - crop 率 56% は B10〜B12 (74〜81%) より大幅に低い。
- **page pointer の確認** (全 100 題): ok 19 頁で 56 題を OCR で確定した。skip の小問頁 10 頁は、再走査の OCR で 32 題の 問NN が期待頁にあることを確認した (06 / 08 / 10 / 14 / 19 / 26 は目視でも確認)。中問頁 32〜44 は全頁を目視した。**誤りは q093 だけ** (§0)。
- **前文の頁が source / prev に無い member** (fixer が実読する頁): **8 member**。agent は表示 stem の前文を「源に無い挿入」と誤報告しうるので、既知型として扱う。

  | 題 | 見えない前文の頁 | manifest の source / prev |
  |---|---|---|
  | q090 | page-32 | 34 / 33 |
  | q091 / q092 | page-32 | 35 / 34 |
  | q094 | page-36 | 38 / 37 |
  | q095 / q096 | page-36 | 39 / 38 |
  | q099 | page-40 | 42 / 41 |
  | q100 | page-40 | 43 / 42 |

  - 前文頁が prev として見えるのは q089 / q097 / q098 と、§0 patch 後の q093。
- **選択肢が manifest の頁に無い題**: q093 だけ (設問ごと page-37、§0)。他の小問頁は、最初の見出しが y≈183〜208 にある (page-03 / 12 / 21 は区分枠の下で y≈333〜343)。頁頭に、前頁からの続きは無い。

## 3. 名指し項目 → `evidence/quiz_B13_2009h21a_named_S129.json`

核験 agent の prompt には入れない。読むのは fixer と reviewer。

**A1 backlog**: 候補 302 件 / 40 題。high は 168 件 / 32 題。このうち 27 件を resolved にした。**未処置の high は 141 件 / 31 題**。
- resolved の内訳: raw だけの 0q.prose 27 件 (B7 の規則)。zh の規則 (B8) による resolved は 0 件。
- **分類器 = B3 規則** (B6〜B12 prep の再実装を流用)。
- **D-166 に該当する候補は 0**。表示 jp に ASCII `"` は無い (q095 の `'A'` は IF 式の中の単引用符)。
- 未処置 high の内訳: `q062` 20 / `q018` 20 / `q094` 13 / `q036` 11 / その他 77。
  - 大半は FP。ends96 は表の値 (q062 の文字番号、q093〜q096 のワークシート)。0a.* は raw→clean の差で、表示は源どおり。0c の「次表」は正しい語。
  - 真の欠陥は q018 と q005 ア (下記)。

**源で確定した是正** (本 prep で目視。key には影響しない):
- **`q018`** (S116 の抽出外で未処置): 表示 jp の **4 肢すべてに OCR 残骸**がある。**正解肢エを含む**。zh / en は正しい。
  - ア: 「一会肝期間」→ 一会計期間、「貸借対了表」→ 貸借対照表。末尾の「ーー」「「-」「.」も残骸。
  - イ: 「・」「「」が残骸。
  - ウ: 「凡務賭表規則」→ 財務諸表規則。「「ーーー」が残骸。
  - エ: 「経営判断のため .の」→ 経営判断のための。末尾の「ここる ーー」が残骸。
- **`q005`**: ア (正解肢)「事業投資リスク    '」、イ「情報漏えいリスク .」の末尾が残骸。backlog が検出したのはアだけ。
- **`q086`**: イ (正解肢)「2 系続」→ 源「2 系統」。backlog 外。
- **`q073`**: イ「パックドア」→ 源「バックドア」。backlog 外。
- **`q094`**: 源の選択肢は “商品え” 等で “” 付き。表示 3 層とも引用符が無い。意味は変わらない (low)。
- S116 caveat の q006 / q032 / q053 / q058 / q063 / q070 / q078 / q085 / q096 は、**表示層で全て是正済**。追わなくてよい。

**answer_affecting の疑い: なし** (表示層で correct_answer と矛盾する題は 0)。以下 29 題を表示層 (図の題は源の図) から再導出し、すべて一致した:
- 小問: q007 480 ウ / q012 ア / q013 300 ウ / q017 エ / q030 5 エ / q036 1,000 ア / q039 B イ / q044 ア / q046 15 ウ / q048 ア / q054 2と1 イ / q060 ウ / q062 sky エ / q064 2D ア / q069 ウ / q070 300 ウ / q082 400 ウ
- 中問: q089 ウ / q090 イ / q091 14 ウ / q092 90,000 イ / q093 イ / q094 ウ / q095 ア / q096 1 ア / q097 1,800 ウ / q098 ウ / q099 イ / q100 ウ
- 照合した源: page-06 / 08 / 14 / 26 / 33〜43、crop q044 / q048 / q054。

**答え漏洩: 0**。
- 3 層の stem・選択肢を走査した。語は「正解」「不正解」「正しい図」「错误图」「正确图」「答案」「correct answer」「Correct figure」等。
- hit 7 件は、すべて zh stem の「正确的是哪一项」(=「適切なものはどれか」の訳) で FP。
- 図を言語化した選択肢 (q048 / q054 / q060 / q100) にも、判定語は無い。

**字形 (D-155 / D-162 で fixer が判断)**:
- 散文の半角「, 」(源は「，」) が 53 題にある。
- 全角数字は 0。
- 「、」は q060 にある。q097〜q100 の「、」は図2 言語化の説明文。
- “” が表示で「」になっている: q044 / q060。
- 式の全角演算子: q093 選択肢の ／ ＊、q095〔条件〕の「I2＋H3」。
- **既知・不触**: `q099` の「商品表>販売単価表」は A3 NIT / D-157 の表記法除外 (lead 指定)。A5 で q069 のラベル行を削除済み。

**図・表の言語化**: q036 / q054 / q069 / q089 / q090 / q093 / q097 / q100 は源と一致する。q048 の選択肢 (グラフ 4 枚) は形状を言葉で記述しており、源と一致する。言語化されていない図は q012 と q094 (バブルチャート) で、agent は添付の図で照合する。

## 4. Workflow 起動引数

```json
{"input_path":"/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/.phase2/b13_fidelity_input_2009h21a.json","exam_id":"2009h21a","qnums":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100],"label":"b13","pass":"sn","model":"sonnet","agent_type":"general-purpose"}
```

- 出力先の既定値は次の 2 つ。どちらもまだ存在しないことを確認済み。
  - out = `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b13_2009h21a_sn.json`
  - parts = `data/ip/quiz/.phase2/fidparts/b13_2009h21a_sn/`
- 起動直前の手順:
  1. 同じコマンドで manifest を作り直す (冪等、0 token)。先行 unit の apply で 2009h21a の表示層が変わった場合に備える。
  2. **§0 を処置する** (bank を直してから再生成するか、再生成の後に patch を当てる)。
  3. q093 の `source_page_png` が page-37 になっていることを確かめる。
- run の後:
  1. `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/b13_2009h21a_sn <input_path> 2009h21a <out> --journal <journal.jsonl>`
  2. `node scripts/quiz-fidelity-machdiff.mjs <input_path> <out>`

## 5. 見積もり

| 項目 | 値 | 根拠 |
|---|---|---|
| agent | 100 (Sonnet 5、1 題 1 体) | B1〜B12 と同形 |
| token | ≈ 640 万 (600〜720 万) | B9 の実績 5,707,937 (crop 無し 14 題)、B7 の実績 5,721,538 (crop 無し 19 題) と、B12 の見積もり 590 万 (crop 無し 23 題) を基準にした |
| 後段 | fixer opus 1 + reviewer opus 1 (別 type) | S122 §0 |

- 上振れの要因:
  - crop の無い題が **44 題**ある (小問 32 + 中問 12)。B9 の約 3 倍。
  - 中問の前文が長い。jp は 1,006 字 / 921 字。en は最大 2,859 字 (q099) で、B12 の最大 2,145 字を超える。
  - q089 / q090 / q097 には図の言語化 (DFD・流れ図・請求書) があり、agent が図と深く照合しうる。
- 下振れの要因: skip の小問の大半は、短い文章題 (1 頁 3〜4 題)。

## 6. 阻害要因

- **q093 の page pointer の誤り (§0)**。起動前に bank を直すか、patch を当てる必要がある。lead が判断する。
- 脚本のエラーは 0。出た警告は page_mismatch 18 頁 + qnum_mismatch 1 頁だけで、どれも目視で原因を確定済み。
- 中問の見出しの残存は 0。probe の全角結合も無い。答え漏洩 0、key と矛盾する題 0。
- B13 の apply は D-152 の data lock の順番に従う。
- **L1b への所見** (本 lane では直さない):
  - 左余白の走査ノイズで、8 頁 26 題の crop が落ちた。B11 では 1 頁だった型が、この exam では最大要因になっている。対策の候補は、`minLeft` を strip 内の最左インクで測ること。
  - odd 頁の見出しが x=149〜155 にある頁が 2 枚あった (真の OI-1)。even の fallback も僅差だった (160 = 9p、150 = 10p)。この exam では、パリティ別の較正が安定しない。
  - どちらも安全側 (skip) の劣化なので、誤帯は出ない。
