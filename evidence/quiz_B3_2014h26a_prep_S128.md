# B track B3 — 2014h26a 準備 (S128、L3 data lane)

D-150 §3 (母数外 1,692 題の全量再抄写) の 3 本目。手順は B2 (`evidence/quiz_B2_2014h26h_prep_S128.md`) と同一。本書は**起動前の準備のみ**で、workflow は未起動。D-152 の data lock は B2 が保持中 (C3 / A4 が後ろに並ぶ) なので、`data/ip/quiz/` の本体 (questions / translations / explanations / chumon_groups) には書いていない。書いたのは `.phase2/b3_*` の manifest、precrop (`precrop/2014h26a/`)、それに新規 evidence だけ。git add / commit はしていない。

---

## 1. 母数

- `question_bank.json` の 2014h26a = **100 問 (q001〜q100)**。13 exam なので全問が母数外 → **B3 母数 = 100 / 100、除外 0**。
- 中問 member も核験の対象に含める (precrop の対象外であって核験の対象内。B1 / B2 と同じ規則)。
- **源の中問**: A = q085-088 / B = q089-092 / C = q093-096 / D = q097-100 の 4 組。
- **`chumon_groups.json` の登録**: `2014h26a-mqA` (q085-088)、`2014h26a-mqB` (q089-092)、`2014h26a-mqD` (q097-100) の 3 組。
- **未登録の中問 = 中問C (`2014h26a-mqC`、q093〜q096)** (L2f)。前文は page-41〜42 (「F 教育機関では，P，Q，R，S，T，U の六つの組がある。」、図1 ワークシート、表1 分布例と標準偏差)。4 題とも前文は表示 stem に無い。dependency は 4 題とも CONTEXT_ONLY (L2f)。
  - **A4 batch2 が前文を起草済み** (`evidence/phase5/stage_06_quiz_fidelity/chumon_preamble_S128_a4_batch2.json`)。data lock が空いた後、A4 が registry に登録し、stem に埋め込む。
  - **B3 fixer は q093〜q096 の stem 冒頭 (前文領域) を触らない。** 是正は設問文以降 (図2〜図4・表2・選択肢) に限る。A4 の後で stem 冒頭が変わるので、patch は設問文側の部分一致で当て、stem 全体の置換はしない。named JSON の `unregistered_chumon_L2f` に記載。

## 2. manifest + precrop (L1b 改修版、main tree の脚本を改修せずに使用)

```
node scripts/quiz-fidelity-prep-any.mjs 2014h26a b3 all --precrop
```

- manifest: `data/ip/quiz/.phase2/b3_fidelity_input_2014h26a.json`。100 samples、`prev_page_png` 100/100。健全性の不良は 0 (stem 非空・ア〜エ 非空・correct_answer ∈ {ア,イ,ウ,エ})。`displayed_stem_jp` は表示層 (stem_jp_clean || stem_jp)。
- crop: `data/ip/quiz/.phase2/precrop/2014h26a/` に **84 / 100** (manifest の `question_crop_png` 84、ファイル実在 84)。
  - 既存の `2014h26a-q045.png` (13:05 作成、作成者不明) は同名で上書きされた。precrop の出力なので影響は無い。
- **calib** (L1b のパリティ別較正): 全体 / odd / even の 3 系統とも head=150 / body=210 で一致。
  - 全体の得票は 150=44p / 160=13p / 170=12p。範囲は 45 ページ。
- **`_precrop_report.json`** (tesseract 5.5.2、jpn モデルあり、ocr=true):
  - 45 ページの内訳: ok 43 / page_mismatch 2 / qnum_mismatch 0。
  - ok ページの見出しは 96 本。verified 96、unconfirmed 0、期待外の番号 0。
  - **confusable_only 5 頁**。どれも書体由来の数字誤読 (0↔9 / 0↔6) で、期待番号と整合する:

    | 頁 | 期待 | OCR |
    |---|---|---|
    | page-08 | 19 / 20 / 21 | `間19` / `問29` / `問21` |
    | page-11 | 28 / 29 / 30 | `問28` / `問29` / `問39` |
    | page-20 | 49 / 50 | `間49` / `問56` |
    | page-39 | 90 / 91 | `問99` / `問91` |
    | page-51 | 100 | `問109` |

    page-39 / page-51 は chumon 題なので、crop は配っていない。
- **skip 16 題**の内訳:
  - **page_mismatch 4 題 / 2 頁**: page-16 (q039 / q040、検出 1 / 期待 2)、page-30 (q075 / q076、検出 1 / 期待 2)。
    - 源を目視した。2 頁とも bank の page 割当は正しく、2 問ともその頁に収まっている。問40 (x≈148) と問76 (x≈143) の見出しが許容窓から外れている。L1b OI-1 (頁ごとの位置ずれ) の型で、skip は安全側に働いている。この 4 題は源ページ全体で読む。
  - **chumon 12 題**: q085〜q092 (mqA / mqB)、q097〜q100 (mqD)。
  - qnum_mismatch 0 / merged_preamble 0 / thin_band 0。
- 未登録の中問C (q093〜q096) には帯 crop が配られる (chumon skip に入らない)。
  - q093 の `prev_page_png` は page-42。前文の前半 (page-41) は agent に見えない。前文は表示 stem に無いので、核験の対象外。
  - mqB (q089〜q092) は前文が page-37〜39 に跨る。S127 A2a では q090 が UNREADABLE になった (page-37 を読めなかったため)。B3 でも同じ型が出たら既知型として扱い、fixer が page-37 / 38 / 39 を実読する。
- B1 (93%) / B2 (86%) より crop 率が低い (84%)。登録中問が 3 組 (12 題) あり、page_mismatch が 2 頁出たため。

## 3. 名指し項目 → `evidence/quiz_B3_2014h26a_named_S128.json`

核験 agent の prompt には入れない。読むのは fixer と reviewer。

**A1 backlog**: 候補 270 件 / 37 題。B2 の priority 規則を当てると high は 163 件 / 32 題。このうち 11 件は S127 A2a で処置済みで、未処置の high は **152 件 / 31 題**。
- 処置済み 11 件の内訳:
  - `q045` zh / en の ISO 9091 / 149661 (0b、8 件): 是正済み。現 translations に 9091 / 149661 は 0 件。
  - `q089`〜`q091` en の「6割」(0b、3 件): FP。
- 主な項目:
  - **`q052` ア**: 末尾残渣「…生じなくなる。<空白 31 字>に」(10.tail_residue)。現 data でも残っている。
  - **`q063` ウ**: 「伝科」(0c.isolated_kanji)。jp のみ。zh / en は「传达 / conveying」で正しい。
  - `q084`: clean が「装置A(1台のみ)…装置Bと装置C」と書き換えている。推測補完の疑いがある。
  - `q042`: clean が「評価から分析へ戻る:」を挿入している。
  - `q071`: raw の流れ図の残渣を clean が削除している。
  - `q011` / `q093` / `q099`: 表内の空白 (7.space)。
  - 中問の大量書き換え: `q086`、`q089`〜`q094`、`q097`〜`q100` (0a.ins / num / word)。

**照合は表示層で行う (lesson)**: stem↔図 / stem↔源 の照合は必ず表示層 (`stem_jp_clean || stem_jp`) で行う。
- 例 `q099` (L2c): raw stem_jp の図1 は崩れている (社員名・000001・次郎)。しかし出荷層は源 page-50 と一致する (SOURCE_MATCHES_SHIPPED、route none)。raw だけを見て STEM_WRONG と判定しないこと。

**L2b**
- 表示 jp の見出しは 〔〕 が 32 件で、他の字形は 0。括弧の是正候補は 0。
- **マイナス 0、AI 図ラベル 0、figure_description 0**。
- raw だけにある字形のずれ (不可視、low):
  - `q075`「[ディレクトリ及びファイルの指定方法〕」
  - `q091`「【バックアップ方法】」(§7 #16、JP_ALREADY_FIXED)
- 表の構造 (⑨ #22):
  - `q093` / `q094`: SPAN_ROW
  - `q099`: COL0_REPEAT
  - `q001`: ABOVE_UNIT
  - en の PREFIX_EXPANDED: `q011` / `q092` / `q096`

**L2d**
- **`q001`**: 図が切れている (medium)。「単位 円」と上罫線が crop 外で、crop が下方へずれている。修復は C3 が担当する。B3 は図に触らず、stem 側の表と「単位 円」を源 page-02 と照合する。
- **`q051`**: minor。注釈の末字「が」が右縁で切れている。情報は欠けていないので、記録のみ。
- **`q086-cA`〜`cD`**: 頁ポインタのずれ。bank の figure_page_image は page-34 だが、実際の出典は page-35。crop 自体は OK。
  - `quiz-figfix-apply.mjs` で再裁断すると誤った頁から切り出すので、再裁断は禁止。§7 #23 の choicefig `--only` throw とも関係する。
  - manifest の `source_page_png` は page-35 で正しい。
- `q048` / `q097` は EXTRA で、情報のみ。

**summary §7**
- **#16** `q091`: 対処不要。
- **#23** `q086`: 脚本側の課題 (L1b で guard 済み)。B3 は図と figure_path に触らない。
- **#4**: 本 prep で L1b 改修版を使って実行済み。
- **#12**: B3 の全量再抄写で被覆される。
- 「ヘへ」型 (#6) は 2014h26a に 0 件。

## 4. Workflow 起動引数

```json
{"input_path":"/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/.phase2/b3_fidelity_input_2014h26a.json","exam_id":"2014h26a","qnums":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100],"label":"b3","pass":"sn","model":"sonnet","agent_type":"general-purpose"}
```

- 出力先の既定値は次の 2 つ。どちらもまだ存在しないことを確認済み。
  - out = `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b3_2014h26a_sn.json`
  - parts = `data/ip/quiz/.phase2/fidparts/b3_2014h26a_sn/`
- run の後:
  1. `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/b3_2014h26a_sn <input_path> 2014h26a <out> --journal <journal.jsonl>`
  2. `node scripts/quiz-fidelity-machdiff.mjs <input_path> <out>`
- **A4 (mqC 前文の埋め込み) が B3 の起動より先に適用された場合**、manifest の `displayed_stem_jp` (q093〜q096) は古くなる。起動の直前に同じコマンドで作り直すこと (冪等、0 token)。C3 (q001 の図) は manifest に影響しない。

## 5. 見積もり

| 項目 | 値 | 根拠 |
|---|---|---|
| agent | 100 (Sonnet 5、1 題 1 体) | B1 / B2 と同形 |
| token | ≈ 610 万 (540〜660 万) | 61k/問 × 100 |
| 後段 | fixer opus 1 + reviewer opus 1 (別 type) | S122 §0 |

上振れの要因:
- crop の無い 16 題 (中問 12 + page_mismatch 4) は源ページ全体で読む。
- mqB / mqD は前文が複数頁に跨る。
- q097 / q099 は長文 (0a が多数)。

## 6. 阻害要因

- 脚本のエラーは 0。出た警告は skip だけ。
- 中問C の前文と registry 登録は A4 の担当。B unit の fixer が単独で変えてはいけない。
- B3 の apply は D-152 の data lock の順番 (B2 → C3 / A4 → …) に従う。
