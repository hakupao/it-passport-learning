# B track B10 — 2010h22h 準備 (S129、L3 data lane)

D-150 §3 (母数外 1,692 題の全量再抄写) の 10 本目。手順は B9 (`evidence/quiz_B9_2011h23a_prep_S129.md`) / B8 (`evidence/quiz_B8_2011h23tokubetsu_prep_S129.md`) と同一。本書は**起動前の準備のみ**で、workflow は未起動。D-152 の data lock は別 lane が保持中なので、`data/ip/quiz/` の本体 (questions / translations / explanations / chumon_groups) には書いていない。書いたのは `.phase2/b10_*` の manifest、precrop (`precrop/2010h22h/`)、それに新規 evidence 2 件だけ。git add / commit はしていない。

---

## 1. 母数

- `questions.json` の 2010h22h = **100 問 (q001〜q100)**。13 exam なので全問が母数外 → **B10 母数 = 100 / 100、除外 0**。
- 中問 member も核験の対象に含める (precrop の対象外であって核験の対象内。B1〜B9 と同じ規則)。
- **源の中問は 3 組**: page-37 冒頭「中問Aから中問Cまでは，それぞれ四つの問いを解答してください。」。A = q089-092 / B = q093-096 / C = q097-100。q085〜q088 は小問。
- **`chumon_groups.json` の登録: 3 組すべて登録済** (L2f でも 3 組とも R)。3 組とも抽出組 (`chumon_preamble_S114.json`) で、COPY 組は無い。

  | key | member | 由来 | 前文の頁 |
  |---|---|---|---|
  | `2010h22h-A` | q089〜q092 | chumon_preamble_S114 (EXPAND q089) | page-37 → page-38 上端 (共有 WBS 図) |
  | `2010h22h-B` | q093〜q096 | chumon_preamble_S114 (EXPAND q093) | page-41 → page-42 上端 (〔貸出処理〕〔返却処理〕) |
  | `2010h22h-C` | q097〜q100 | chumon_preamble_S114 | page-46 |

- **前文表示の確認**: 12 member すべてで、manifest の `displayed_stem_jp` と translations の `stem_jp_clean` が registry の probe.jp で始まる。translations の `stem.zh` / `stem.en` にも probe.zh / probe.en が含まれる (**12/12 × 3 層**、脚本で確認。probe_rule どおり空白除去後に照合)。
- **見出しの残存は 0**: 表示 jp / zh / en の stem・選択肢 (全 100 題) を走査した。「問 NN」「问 NN」「QNN」も〔分野〕見出しも残っていない。en の「Company Q 25%」は社名で FP。抽出組なので、B9 q089 型の Rule B (COPY 表の cut marker) は該当しない。
- **probe との結合** (B9 q089 と原因は違うが、同じく注意が要る): A 組の probe.jp は「Ｓさんは，在庫管理システム（以下，…」で、全角の Ｓ と全角括弧を含む。源は半角の「S さん」。前文の Ｓ→S などの正規化は、registry の再生成と同時でないと A7 が落ちる。B / C の probe は源どおりの字形。
- **A 組の WBS 図の言語化** (前文の一部である page-38 の共有図):
  - registry の前文 (4 題の共通接頭 jp 429 字) は page-37 の本文まで。
  - 図の言語化は q089 と q090 にだけあり、表記も位置も食い違う。q089 は前文の後・設問文の前で「（網掛け：表示していない）」表記。q090 は設問文の後に「図 WBS…」+「「網掛け」」表記 + 注。
  - q091 / q092 には無い (解くのに不要)。図は q089 / q090 に添付済み。
  - 去就は fixer が判断する (B1〜B9 の『源に無い挿入』の扱い)。
- B10 fixer の規則 (B4〜B9 と同じ): 前文の是正が要る場合でも、stem 冒頭を単独で変えない。registry の probe との整合を lead に上げる。設問文以降を是正するときは、設問文側の部分一致で patch を当て、stem 全体は置換しない。

## 2. manifest + precrop (L1b 改修版、main tree の脚本を改修せずに使用)

```
node scripts/quiz-fidelity-prep-any.mjs 2010h22h b10 all --precrop
```

- manifest: `data/ip/quiz/.phase2/b10_fidelity_input_2010h22h.json`。100 samples、`prev_page_png` 100/100。
  - 健全性の不良は 0 (stem 非空・correct_answer ∈ {ア,イ,ウ,エ})。選択肢のキー順は 100 題ともア / イ / ウ / エ。
  - `displayed_stem_jp` は表示層 (translations の `stem_jp_clean` || `stem_jp`) で、working tree 上の現 data から作った。working tree の未 commit 変更は他 exam (2012h24a) だけで、`questions.json` の diff に 2010h22h は 0 行。
- crop: `data/ip/quiz/.phase2/precrop/2010h22h/` に **81 / 100** (manifest の `question_crop_png` 81、ファイル実在 81 + `_precrop_report.json`)。dir は本 prep の前には存在しなかった (新規作成)。
- **calib**: 全体・odd・even とも head=140 / body=210。得票は 140=18p / 190=13p / 150=12p。範囲は 42 頁。
- **`_precrop_report.json`** (tesseract 5.5.2、ocr=true):
  - 42 頁の内訳: **ok 30** / **page_mismatch 12** / qnum_mismatch 0。
  - ok 頁の見出しは 81 本。すべて verified で、unconfirmed 0、confusable_only 0。
- **OI-1** (旧 exam は頁ごとに見出しの x 位置がずれる):
  - 窓は x∈[126,158] (head 140 − 14 〜 +18)。ok 頁の見出し x は 126〜155。page-31 / page-33 は 126〜128 で、窓の下端にかかっている。
  - **小問頁の OI-1 skip は 3 頁 7 題** (B8 page-26 と同じ型)。いずれも見出しが窓外で、検出 0 だった:
    - page-24 (q055 / q056): 見出し x=166。
    - page-30 (q072〜q074): 見出し x=159〜160。
    - page-32 (q077 / q078): 見出し x=159〜160。
  - 3 頁とも目視した。各問は頁内で完結している。
  - 中問頁の skip は 9 頁 (38 / 39 / 40 / 42 / 43 / 44 / 45 / 47 / 48)。〔分野〕見出し行の下に問NN が入る型 (B8 / B9 と同じ)。
    - page-40 は表の行 (x≈149〜151) を 4 本誤検出し、page-44 は流れ図の枠を 2 本誤検出した。どちらも個数の不一致で弾かれた。
  - **誤帯は 0**。skip 題は manifest の source に指定した源ページ全体で読める。skip は安全側の動作。
- **skip 19 題**: page_mismatch 19 (小問 7 + 中問 member 12)。merged_preamble 0 / chumon 0 / thin_band 0。
- crop 率は 81%。B9 (86%) より低く、B3〜B7 (81〜84%) と同程度。
- **前文の頁が source / prev に無い member** (fixer が実読する頁)。本 prep で中問頁 37〜48 を全頁目視し、前文の範囲を確定した:

  | 題 | 見えない前文の頁 | manifest の source / prev |
  |---|---|---|
  | q090 | page-37 (page-38 の WBS 図は見える) | 39 / 38 |
  | q091 | page-37 (同上) | 39 / 38 |
  | q092 | page-37 / page-38 | 40 / 39 |
  | q094 | page-41 (page-42 の前文末尾は見える) | 43 / 42 |
  | q095 | page-41 / page-42 | 44 / 43 |
  | q096 | page-41 / page-42 | 45 / 44 |
  | q099 | page-46 | 48 / 47 |
  | q100 | page-46 | 48 / 47 |

  - 計 8 member。前文は表示 stem にあるので、agent は前文を「源に無い挿入」と誤報告しうる。既知型 (B4〜B9 と同じ型) として扱う。
  - q089 / q093 / q097 / q098 は前文が全部見える。
- **新しい型: `q095` の選択肢は次の頁にある**。①〜④ と選択肢表 (d / e / f) は page-45 (問96 の頁) の上部にあり、manifest の source=page-44 / prev=page-43 には無い。agent は選択肢を「源で確認できない」「源に無い」と報告しうる。fixer は page-45 で照合する。
- L2d の `q090` page-pointer 不一致 (located page-38 / bank page-39) は既知。manifest は source=page-39 / prev=page-38 なので、図の頁は agent に見える。

## 3. 名指し項目 → `evidence/quiz_B10_2010h22h_named_S129.json`

核験 agent の prompt には入れない。読むのは fixer と reviewer。

**A1 backlog**: 候補 379 件 / 48 題。high は 234 件 / 34 題。このうち 21 件を resolved にした。**未処置の high は 213 件 / 33 題**。
- resolved の内訳: raw だけの 0q.prose 20 件 (q009 / q050 / q053 / q088 / q095、B7 の規則) と、zh の規則 (B8) によるもの 1 件。
- q008 / q040 / q063 は表示 jp に ASCII `"` が残っているので resolved にならない。
- **分類器 = B3 規則** (B6〜B9 prep の再実装を流用)。
- 未処置 high の内訳: `q092` 49 / `q040` 32 / `q091` 21 / `q094` 14 / `q067` 9 / その他 88。
  - 大半は FP: 中問の 0a.* は raw→clean で前文・図の言語化が入った分。2.nine_six ends96 は表の値・カレンダ・作業日数。q088 の 0a.ins は図の言語化の語の差。
  - 真の欠陥は下記の q003 / q042 / q008 / q040 で、いずれも源で照合済み。

**answer_affecting の疑い: なし**。表示層で correct_answer と矛盾する題は 0。以下 27 題を表示層 (図の題は源の図) から再導出し、すべて一致した:
- 小問: `q002` イ / `q004` RFP ウ / `q005` 500 イ / `q011` B イ / `q021` A と B ア / `q031` 6 イ / `q035` 4 エ / `q055` ウ / `q067` 45 イ / `q070` 45 ウ / `q076` 9 ウ / `q077` イ / `q079` 10,000 イ / `q085` ウ / `q088` イ
- 中問: `q089` イ / `q090` ア / `q091` 10 ウ / `q092` イ / `q093` イ / `q094` ア / `q095` ア / `q096` ウ / `q097` ア / `q098` ウ / `q099` イ / `q100` エ
- 表は源の crop と照合した (q011 / q021 / q035 / q076 / q079)。式は named の `answer_affecting_suspects` にある。
- **選択肢が丸ごと図の言語化になっている題**: q077 (4 グラフ) と q088 (4 波形)。源の選択肢は画像だけ。B9 では同じ型 (q045) が answer_affecting に挙がった。本 prep では源の図と表示の言語化を照合し、key を再導出して一致を確かめた (q077 は p² が破線の下、q088 はイの曲線が 01 00 10 11 01)。
- **`q002`** は S96 の Rule B (イ↔ウ の誤 swap → REVERT) の題。表示は印刷版どおり (イ = 伸び率が低く利益率が高い)。fixer はイ / ウを入れ替えない。

**源で確定した是正** (本 prep で目視。key には影響しない):
- **`q003`** (正解肢エを含む): 源は「自由奔放」。表示 jp は「自由寿放」(OCR の誤字)。zh / en は正しい。
- **`q042`** エ: 源は「実地棚卸し」。表示 jp は「実地棚外し」。zh / en は正しい。
- **`q008`**: 源は “営業部門の組織力強化”。表示 jp は閉じ引用符が ASCII `"`。
- **`q040`** (正解肢ウを含む): 選択肢ア〜エの “上半期” “下半期” “年間” で、閉じ引用符が ASCII `"` になっている。エの `"下半期"` は開き引用符も ASCII。stem の (1)〜(3) は正しい。
- q008 / q040 / q063 は S118 ⑤-4 scope-out の R3 3 題そのもの。処置の場がこの B10 になる。

**要確認** (fixer が源で確定する):
- `q063` ア: 源は「“”で囲む」に見える (中央の字形が見えない)。表示 jp は「“"”」。A2b は「`"` という文字そのもの」として除外した。fixer が原寸で確かめてから去就を決める。
- `q023` / `q054` / `q096`: prose 中の空白 (源の行折返しの見込み)。

**図・表の言語化** (図は添付済み):
- q002 / q004 / q026 / q035 / q050 / q055 / q061 / q067 / q079 / q088 (stem と選択肢) / q077 (選択肢) / q089・q090 (WBS) / q091 / q094 / q095。
- 去就は、B1〜B9 の扱いに従って fixer が判断する。

**字形を変えない・記録のみ**:
- **ASCII 読点「, 」**: 表示 jp で 65 題 (うち「，」と混在 8 題)。B4 §4e / B7〜B9 と同じく不変 (⑨)。
- 「、」: q022 / q038 / q043 / q077 / q087 / q089 (設問文) / q099 (×6) / q100 (×11)。q099 / q100 は源 (page-48) が「，」で、前文 (probe) の外にある。
- `q082`「【処理内容】」は L2b で CORRECT_LENT (源の図の枠内が隅付き括弧)。直さない。
- `q098` / `q100` の en「[S Company's Situation]」「S Company」語順は A2b ⑨ で据え置いたもの (中問の probe に注意)。jp は A3 で〔S社の状況〕に是正済み。
- `q088` stem の “11 01 00 10 11” は、表示では「」になっている (引用符の字形)。

**L2d** (情報のみ):
- EXTRA: q005 / q050 / q079 / q095。
- OK: q035 / q076 / q089 / q090 / q094。
- TRUNCATED は 0 で、C3 の対象外。

**L2c**: q100 の 1 件。shipped は源どおりで、raw だけが STEM_WRONG (表示層の教訓)。**L2e**: 0 件。

**既処置の題** (A3: q098 jp〔〕・q035 / q050 のラベル / A5: q021 expl の −50、q082 en の −1、q057 のラベル接頭辞) は現状のまま。A5 の negatives (q021 / q082) は不触。

## 4. Workflow 起動引数

```json
{"input_path":"/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/.phase2/b10_fidelity_input_2010h22h.json","exam_id":"2010h22h","qnums":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100],"label":"b10","pass":"sn","model":"sonnet","agent_type":"general-purpose"}
```

- 出力先の既定値は次の 2 つ。どちらもまだ存在しないことを確認済み。
  - out = `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b10_2010h22h_sn.json`
  - parts = `data/ip/quiz/.phase2/fidparts/b10_2010h22h_sn/`
- run の後:
  1. `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/b10_2010h22h_sn <input_path> 2010h22h <out> --journal <journal.jsonl>`
  2. `node scripts/quiz-fidelity-machdiff.mjs <input_path> <out>`
- **起動直前に、同じコマンドで manifest を作り直す** (冪等、0 token)。先行 unit の apply で 2010h22h の表示層が変わった場合に備える。

## 5. 見積もり

| 項目 | 値 | 根拠 |
|---|---|---|
| agent | 100 (Sonnet 5、1 題 1 体) | B1〜B9 と同形 |
| token | ≈ 600 万 (560〜680 万) | B9 の実績 5,707,937 (crop 無し 14 題)、B7 の実績 5,721,538 (crop 無し 19 題) を基準にした |
| 後段 | fixer opus 1 + reviewer opus 1 (別 type) | S122 §0 |

- 上振れの要因:
  - 中問の前文が長い。B 組は jp で約 900 字、en で約 2,400 字 (表 3 つ + 条件・手続・処理仕様)。q095 は en 3,772 字。
  - crop の無い題は 19 題 (中問 12 + 小問 7) で、源ページ全体で読む。
  - q077 / q088 は選択肢が図の言語化で、agent が図と深く照合しうる。
- 下振れの要因: 小問の skip 7 題はどれも頁内で完結した短い題 (q056 / q072〜q074 / q078 は文章だけ)。

## 6. 阻害要因

- 脚本のエラーは 0。出た警告は page_mismatch 12 頁 (中問頁 9 + 小問頁 3) だけで、どれも目視で原因を確定済み (OI-1 の窓外 / 中問頁の型 / 表・流れ図の誤検出)。
- 中問の見出しの残存は 0 で、B9 q089 のような registry 側の阻害は無い。A 組の probe の全角 Ｓ は、前文を正規化する場合にだけ registry 再生成と同時に行う必要がある。
- B10 の apply は D-152 の data lock の順番に従う。
