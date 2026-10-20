# B track B5 — 2013h25a 準備 (S129、L3 data lane)

D-150 §3 (母数外 1,692 題の全量再抄写) の 5 本目。手順は B4 (`evidence/quiz_B4_2013h25h_prep_S128.md`) / B3 (`evidence/quiz_B3_2014h26a_prep_S128.md`) と同一。本書は**起動前の準備のみ**で、workflow は未起動。D-152 の data lock は別 lane が保持中なので、`data/ip/quiz/` の本体 (questions / translations / explanations / chumon_groups) には書いていない。書いたのは `.phase2/b5_*` の manifest、precrop (`precrop/2013h25a/`)、それに新規 evidence 2 件だけ。git add / commit はしていない。

---

## 1. 母数

- `question_bank.json` の 2013h25a = **100 問 (q001〜q100)**。13 exam なので全問が母数外 → **B5 母数 = 100 / 100、除外 0**。
- 中問 member も核験の対象に含める (precrop の対象外であって核験の対象内。B1〜B4 と同じ規則)。
- **源の中問**: A = q085-088 / B = q089-092 / C = q093-096 / D = q097-100 の 4 組。
- **`chumon_groups.json` の登録: 4 組すべて登録済**。

  | key | member | 由来 | 前文の頁 |
  |---|---|---|---|
  | `2013h25a-mqA` | q085〜q088 | A4 (commit 5bac5f9)。L2f では unregistered | page-30〜31 |
  | `2013h25a-mqB2` | q089〜q092 | S117 batch1 (key 名が `mqB2`) | page-34〜35 |
  | `2013h25a-mqC` | q093〜q096 | A4。L2f では unregistered (旧解答不能 q094 / q096) | page-39 |
  | `2013h25a-mqD` | q097〜q100 | A4。L2f では partial | page-42〜43 |

- **前文表示の確認**: 16 member すべてで、manifest の `displayed_stem_jp` に registry の probe.jp が含まれる。translations の zh / en stem にも probe.zh / probe.en が含まれる (**16/16 × 3 層**、脚本で確認)。
- S128 A4 の申し送り:
  - `q097` の旧節選 (〔要望事項〕のみ、原典と 2 箇所相違) は完全前文に置換済み。現表示は「貸出しの」「元の棚」で、〔要望事項〕の重複は無い。`q099` の section COPY は退役済み。
  - `q085`〜`q087` のガント図の懸念は解消扱い。図1 は前文に再現せず、q088 のみに挂図する (D-141 §2)。
  - mqC の表1 は md 化のときに見出し行「項目/内容」を補った (原典に見出し行は無い、A4 で体裁差として許容)。fixer はこれを STEM 欠陥にしない。
- B5 fixer の規則 (B4 と同じ): 前文の是正が要る場合でも、stem 冒頭を単独で変えない。registry の probe との整合を lead に上げる。設問文以降を是正するときは、設問文側の部分一致で patch を当て、stem 全体は置換しない。

## 2. manifest + precrop (L1b 改修版、main tree の脚本を改修せずに使用)

```
node scripts/quiz-fidelity-prep-any.mjs 2013h25a b5 all --precrop
```

- manifest: `data/ip/quiz/.phase2/b5_fidelity_input_2013h25a.json`。100 samples、`prev_page_png` 100/100。
  - 健全性の不良は 0 (stem 非空・correct_answer ∈ {ア,イ,ウ,エ})。
  - `displayed_stem_jp` は表示層 (translations の `stem_jp_clean` || `stem_jp`) で、A4 適用後の現 data から作った。
- crop: `data/ip/quiz/.phase2/precrop/2013h25a/` に **82 / 100** (manifest の `question_crop_png` 82、ファイル実在 82)。
  - 既存の `2013h25a-q004.png` (作成者不明) は同名で上書きされた。precrop の出力なので影響は無い (B3 q045 / B4 q059 と同じ型)。
- **calib** (L1b のパリティ別較正): 全体 / odd / even の 3 系統とも **head=160 / body=220** で一致。B3 / B4 (150 / 210) より 10px 右にある。
  - 全体の得票は 160=38p / 150=26p / 170=10p。範囲は 38 ページ。
- **`_precrop_report.json`** (tesseract 5.5.2、jpn モデルあり、ocr=true):
  - 38 ページの内訳: ok 37 / page_mismatch 1 / qnum_mismatch 0。
  - ok ページの見出しは 99 本。verified 99、unconfirmed 0。期待外の番号 7 本は、すべて下表の confusable。
  - **confusable_only 7 頁**。どれも書体由来の数字誤読 (0↔9 / 0↔6) で、期待番号と整合する:

    | 頁 | 期待 | OCR |
    |---|---|---|
    | page-05 | 10 / 11 / 12 | `問19` / `問11` / `問12` |
    | page-11 | 28 / 29 / 30 | `間28` / `問29` / `間39` |
    | page-18 | 50 / 51 / 52 | `問59` / `問51` / `間52` |
    | page-21 | 60 / 61 / 62 | `問69` / `間61` / `問62` |
    | page-24 | 68 / 69 / 70 | `間68` / `間69` / `間79` |
    | page-36 | 89 / 90 | `問89` / `間96` |
    | page-46 | 100 | `間106` |

    page-36 / page-46 は chumon 題なので、crop は配っていない。
- **skip 18 題**の内訳:
  - **page_mismatch 1 題 / 1 頁**: page-38 (q092、検出 3 / 期待 1)。
    - 源を目視した (本 prep で page-38 を Read)。bank の page 割当は正しく、page-38 は 〔ストラテジ〕 見出し + 問92 の 1 問だけを収める。
    - 検出された 3 本は、問92 の見出し (top 260 / x 163) に加え、表1 左罫線 (top 752 / x 153) と注1) の行頭 (top 818 / x 160) の誤検出。
    - **OI-1** (旧 exam は頁ごとに見出しの x 位置がずれる): 2013h25a の見出し x は 158〜163 にほぼ揃っており、頁ごとのずれは小さい。page-38 の誤検出は罫線と注記によるもので、B4 page-44 (表の左罫線) と同じ型。skip は安全側に働いている。
    - q092 は mqB2 の member なので、page_mismatch が無くても chumon skip になる (集計上は page_mismatch 側に 1 題計上)。
  - **chumon 15 題**: q085〜q091、q093〜q100。
  - **merged_preamble 2 題**: どちらも中問ではない。源ページ全体で読む。
    - `q055`: displayed 266 字 vs bank 109 字。clean が方式a / b の図を stem に言語化している。
    - `q064`: displayed 123 字 vs bank 38 字。clean が真理値表を stem に入れている。
  - qnum_mismatch 0 / thin_band 0。
- crop 率は 82%。B3 (84%) / B4 (83%) とほぼ同じ。
- **前文の頁が source / prev に無い member** (fixer が実読する頁):

  | 題 | 見えない前文の頁 | manifest の source / prev |
  |---|---|---|
  | q085 / q086 | page-30 | 32 / 31 |
  | q087 / q088 | page-30・31 | 33 / 32 |
  | q089 / q090 | page-34 | 36 / 35 |
  | q091 | page-34・35 | 37 / 36 |
  | q092 | page-34・35 | 38 / 37 |
  | q095 / q096 | page-39 | 41 / 40 |
  | q097 / q098 | page-42 | 44 / 43 |
  | q099 / q100 | page-42・43 | 45 / 44 (q100 は 46 / 45) |

  - 前文は表示 stem にあるので、agent は前文を「源に無い挿入」と誤報告しうる。既知型 (S127 A2a q090 / B4 q096 と同じ型) として扱う。
  - q093 / q094 は prev が page-39 なので、前文が見える。

## 3. 名指し項目 → `evidence/quiz_B5_2013h25a_named_S129.json`

核験 agent の prompt には入れない。読むのは fixer と reviewer。

**A1 backlog**: 候補 174 件 / 32 題。high は 114 件 / 27 題。このうち 4 件は処置済みで、**未処置の high は 110 件 / 25 題**。
- **分類器の確認**: B3 の分類器 (`0c.*` は rule か sub が rare_kanji なら low) を再実行した。
  - 2014h26a では B3 named の priority と **270/270 一致** (high 163)。
  - 2013h25h では B4 named と 156/158 一致。差の 2 件は `2013h25h-q045` の `0c.tr_of_anomaly` sub=rare_kanji で、B4 はこれを high にしていた。
  - B5 は B3 の規則に従う。B4 の規則なら q054 の「歳」(FP) 10 件が high に上がり、high は 124 件 (題数は 27 で不変)。
- 処置済み 4 件:
  - `q004` en ア 0b: S127 A2a で FP (gojuon)。
  - `q097` / `q099` の 0a (〔要望事項〕節) 3 件: A4 で完全前文に置換済み。
- 未処置 high の内訳: `q095` 48 件 (式中の半角 " / +) が最大で、その他は q014 6 / q091 6 / q067 5 / q090 5 / q012・q018・q043・q092 各 4 など。

**answer_affecting の疑い: なし**。表示層で correct_answer と矛盾する題は 0。q012 / q064 / q085 は表示層から答えを再導出し、一致した。
- **`q043` イ / ウ / エ** (high、§7 #7 の読点脱落候補): 要件名が空白だけで並ぶ (例 イ「業務要件の定義 ソフトウェア要件定義 システム要件定義」)。
  - 本 prep で源 page-15 (crop) を目視した。4 肢とも全角読点「，」区切り。
  - 表示 jp の欠落 4 箇所と、残っている ASCII「, 」を源の「，」に揃える。答えは語順で決まるので影響しない。
- **`q012`** (medium): A1 T.num_vs_fig / 0a.num ×4。
  - raw の表 (A 0/2/5/5/7、B 0/3/5/5/7) だと最大 11 = エ となり、correct_answer と矛盾する。
  - 表示層 (clean / zh / en) の表は A 0/2/5/7/8、B 0/1/3/5/7、C 0/3/4/6/8 で、最大 10 = ウ と整合する。
  - 源 page-05 で 15 セルを全数照合する。
- `q095` (low): 式中の半角 " と +。A4 の注記では原典は全角 “ ” と ＋ (源 page-41 で確定)。jp / zh で同じ字形。
- `q014` / `q018` / `q091` zh: 半角 "…" の引用 (0q.prose)。字形差のみ。
- `q087`: 前文末と設問文に「…6月末に請負契約の変更契約を締結した」が 2 回出る。源 page-33 の問87 本文にあるか確認する。
- `q055` / `q067` / `q052`: clean が図を言語化している (図は別に挂かる)。言語化そのものは削らず、源の図と食い違う箇所だけ是正する。
- `q099`「棚板」(0c.isolated_kanji) と `q096`「Da8e9」は FP 見込み。確認のみ。
- `q025` / `q049` / `q068` / `q070` / `q091`: 0a.char は raw の OCR 誤りを clean が直したもの。表示層は正しい。

**照合は表示層で行う (lesson)**: stem↔図 / stem↔源 の照合は必ず表示層で行う。例は `q012` (上記)。A1 の q067「(8)→(3)」「(9)→(d)」と q087「(1)(4)」も raw だけの差で、学習者には見えない。`questions.json` の `stem_jp` は raw なので、fixer / reviewer が直接読むときは注意する。

**L2b**
- 表示 jp の 【】 は 0 件。q099 の【要望事項】×2 (DEFECT_TORT) は A3 で是正済み。q052 の [図1] [図2] も A3 でキャプション化済み。括弧の是正候補は 0。
- explanations の【要望事項】引用 1 件は A3 §5 の範囲外の残り。B5 の対象外なので記録だけ。
- マイナス 0、AI 図ラベル 0、figure_description 0 件。
- 表の構造: `q012` ABOVE_UNIT、`q064` COL0_REPEAT (x 列は実値で FP 見込み)、`q092` ABOVE_FIGLABEL。源 page-38 の表1 は目視済み (案1 1/5/5、案2 2/5/3、案3 5/1/1、案4 4/4/2)。

**L2d**: 2013h25a の 10 図に major / medium は無い (C3 の対象外)。
- `q012` / `q064` は EXTRA で、情報のみ。
- `q037` は OK。表示 stem の列名だけの表 (行 0) は図と重複するが、削らない。

**L2c / L2e / C3**: 2013h25a は 0 件。

**summary §7**
- **#4**: 本 prep で L1b 改修版を使って実行済み (qnum_mismatch 0、confusable_only 7 頁)。
- **#7**: q043 (上記、源で確定)。
- **#12**: B5 の全量再抄写で被覆される。
- **#16**: q099 は A3 で是正済み。
- 「ヘへ」型 (#6) は 0 件。
- **#22**: q064。

## 4. Workflow 起動引数

```json
{"input_path":"/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/.phase2/b5_fidelity_input_2013h25a.json","exam_id":"2013h25a","qnums":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100],"label":"b5","pass":"sn","model":"sonnet","agent_type":"general-purpose"}
```

- 出力先の既定値は次の 2 つ。どちらもまだ存在しないことを確認済み。
  - out = `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b5_2013h25a_sn.json`
  - parts = `data/ip/quiz/.phase2/fidparts/b5_2013h25a_sn/`
- run の後:
  1. `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/b5_2013h25a_sn <input_path> 2013h25a <out> --journal <journal.jsonl>`
  2. `node scripts/quiz-fidelity-machdiff.mjs <input_path> <out>`
- 先行 unit の apply が B5 の起動より先に入った場合: 先行 unit は他の exam だけを変えるので、2013h25a の manifest には影響しない。それでも、起動直前に同じコマンドで作り直すのが安全 (冪等、0 token)。

## 5. 見積もり

| 項目 | 値 | 根拠 |
|---|---|---|
| agent | 100 (Sonnet 5、1 題 1 体) | B1〜B4 と同形 |
| token | ≈ 610 万 (540〜670 万) | 61k/問 × 100 |
| 後段 | fixer opus 1 + reviewer opus 1 (別 type) | S122 §0 |

上振れの要因:
- crop の無い 18 題 (中問 16 + merged_preamble 2) は源ページ全体で読む。
- mqA / mqB2 / mqD は前文が 2 頁に跨る。
- q095 / q099 は長文。

## 6. 阻害要因

- 脚本のエラーは 0。出た警告は skip だけ。
- B5 の apply は D-152 の data lock の順番に従う。
