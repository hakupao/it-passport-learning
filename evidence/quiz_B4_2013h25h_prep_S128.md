# B track B4 — 2013h25h 準備 (S128、L3 data lane)

D-150 §3 (母数外 1,692 題の全量再抄写) の 4 本目。手順は B3 (`evidence/quiz_B3_2014h26a_prep_S128.md`) と同一。本書は**起動前の準備のみ**で、workflow は未起動。D-152 の data lock は B3 が保持中なので、`data/ip/quiz/` の本体 (questions / translations / explanations / chumon_groups) には書いていない。書いたのは `.phase2/b4_*` の manifest、precrop (`precrop/2013h25h/`)、それに新規 evidence 2 件だけ。git add / commit はしていない。

---

## 1. 母数

- `question_bank.json` の 2013h25h = **100 問 (q001〜q100)**。13 exam なので全問が母数外 → **B4 母数 = 100 / 100、除外 0**。
- 中問 member も核験の対象に含める (precrop の対象外であって核験の対象内。B1〜B3 と同じ規則)。
- **源の中問**: A = q085-088 / B = q089-092 / C = q093-096 / D = q097-100 の 4 組。
- **`chumon_groups.json` の登録: 4 組すべて登録済**。
  - `2013h25h-mqA` / `mqB` / `mqD` は S117 batch2 から。
  - `2013h25h-mqC` (q093〜q096) は L2f の時点では unregistered だった。A4 (commit 5bac5f9、`chumon_preamble_S128_a4_batch1.json`) が登録し、stem に埋め込んだ。前文は page-42 (「A さんは，製品 N の売上の動向を分析するため，…図1のワークシートを作成した。」)。
- **前文表示の確認**: 16 member すべてで、manifest の `displayed_stem_jp` に registry の probe.jp が含まれる。translations の zh / en stem にも probe.zh / probe.en が含まれる (16/16 × 3 層)。B3 にあった「未登録中問の stem 冒頭に触らない」制約は B4 には無い。
- B4 fixer の規則: 前文の是正が要る場合でも、stem 冒頭を単独で変えない。registry の probe との整合を lead に上げる。設問文以降を是正するときは、設問文側の部分一致で patch を当て、stem 全体は置換しない。

## 2. manifest + precrop (L1b 改修版、main tree の脚本を改修せずに使用)

```
node scripts/quiz-fidelity-prep-any.mjs 2013h25h b4 all --precrop
```

- manifest: `data/ip/quiz/.phase2/b4_fidelity_input_2013h25h.json`。100 samples、`prev_page_png` 100/100。
  - 健全性の不良は 0 (stem 非空・ア〜エ 非空・correct_answer ∈ {ア,イ,ウ,エ})。
  - `displayed_stem_jp` は表示層 (stem_jp_clean || stem_jp) で、A4 適用後の現 data から作った。
- crop: `data/ip/quiz/.phase2/precrop/2013h25h/` に **83 / 100** (manifest の `question_crop_png` 83、ファイル実在 83)。
  - 既存の `2013h25h-q059.png` (13:05 作成、作成者不明) は同名で上書きされた。precrop の出力なので影響は無い (B3 の q045 と同じ型)。
- **calib** (L1b のパリティ別較正): 全体 / odd / even の 3 系統とも head=150 / body=210 で一致。
  - 全体の得票は 150=44p / 170=11p / 160=2p。範囲は 44 ページ。
- **`_precrop_report.json`** (tesseract 5.5.2、jpn モデルあり、ocr=true):
  - 44 ページの内訳: ok 42 / page_mismatch 2 / qnum_mismatch 0。
  - ok ページの見出しは 96 本。verified 96、unconfirmed 0、期待外の番号 0。
  - **confusable_only 4 頁**。どれも書体由来の数字誤読 (0↔6 / 0↔9) で、期待番号と整合する:

    | 頁 | 期待 | OCR |
    |---|---|---|
    | page-08 | 19 / 20 / 21 | `問19` / `間26` / `問21` |
    | page-16 | 39 / 40 | `問39` / `間46` |
    | page-30 | 69 / 70 / 71 | `間69` / `間79` / `間71` |
    | page-40 | 89 / 90 / 91 | `間89` / `間99` / `間91` |

    page-40 は mqB の題なので、crop は配っていない。
- **skip 17 題**の内訳:
  - **page_mismatch 4 題 / 2 頁**:
    - page-43 (q093〜q095、検出 1 / 期待 3)
    - page-44 (q096、検出 2 / 期待 1)
    - 源を目視した (本 prep で page-43 / 44 を Read)。2 頁とも bank の page 割当は正しい。page-43 は 問93〜問95 の 3 問を収め、page-44 は 問96 の 1 問を収める。
    - page-43 では 問94 / 問95 の見出しが x≈178 にあり、許容窓から外れている。page-44 では表の左罫線 (x≈147) を見出しと誤検出している。L1b OI-1 (頁ごとの位置ずれ) の型で、skip は安全側に働いている。
    - この 4 題は mqC (登録済中問) なので、page_mismatch が無くても chumon skip になる。
  - **chumon 12 題**: q085〜q092 (mqA / mqB)、q097〜q100 (mqD)。
  - **merged_preamble 1 題**: `q082` (displayed 172 字 vs bank 82 字)。clean が真理値表を stem に入れたため、表示 stem が bank より大きく膨らんでいる。中問ではない。源ページ全体で読む。
  - qnum_mismatch 0 / thin_band 0。
- 中問の前文が見えない題 (`prev_page_png` が 1 頁だけのため):
  - **q096**: `prev_page_png` が page-43 なので、前文の page-42 は agent に見えない。前文は表示 stem にあるので、agent は前文を「源に無い挿入」と誤報告しうる。既知型 (S127 A2a q090 と同じ型) として扱い、fixer が page-42 を実読する。
  - q093〜q095 は `prev_page_png` が page-42 で、前文が見える。
  - mqA / mqB / mqD も、前文の頁が source / prev 以外に掛かる member は同じ扱い。
- crop 率は 83%。B3 (84%) とほぼ同じ。登録中問が 4 組 (16 題) あるのに加え、merged_preamble が 1 題出た。

## 3. 名指し項目 → `evidence/quiz_B4_2013h25h_named_S128.json`

核験 agent の prompt には入れない。読むのは fixer と reviewer。

**A1 backlog**: 候補 158 件 / 39 題。B2 / B3 の priority 規則を当てると、high は 86 件 / 26 題。このうち 2 件は処置済みで、未処置の high は **84 件 / 25 題**。
- 分類器の確認: 同じ分類器を 2014h26a に当てると、B3 named の priority と 270/270 一致した (high 163)。
- 処置済み 2 件:
  - `q059` zh エ 0b: S127 A2a で FP。
  - `q099` fd 2.nine_six cross「860」: A3 D-160 で fd を全面書換え済み。現 fd に 860 は 0 件 (脚本で assert)。
- 主な項目:
  - **`q061`**: raw「H002 K02 60 / H006 K01 30」→ clean・fd「80 / K02 50」。**answer_affecting の可能性がある**。clean の値なら K02=130 で現 correct_answer イ と整合する。源 page-26 で 6 行を全数照合する。
  - **`q037` ウ**:「上限値を399 kg, 下限値を599 g」。9↔0 誤読の型。現 data でも残っている。誤答肢なので答えには影響しない。
  - **`q043`**: 表示 stem の表はリスク1 = 6,000万円、fd は 5,000万円 (L2b FIG_ONLY_NUM + A1 T.num_vs_fig)。6,000 なら同順位 → 期限で判定、となり但し書きと整合する。fd が誤りの見込み。
  - `q067`: 表は鉛筆 50 円、fd は 80 円。答えには影響しない。
  - `q056` イ:「電子式」(0c.isolated_kanji)。jp / zh / en とも同じ字。源 page-24 で確定する。
  - `q055`: clean が列名だけの「社員」「部署」表を挿入している。`q074`: clean が構成図を言語化している。`q076`: clean が raw の「[図] 完全グラフ」記述を削除している。
  - mqB (`q089`〜`q092`): 9:00〜18:00 / 19:00 / 9時間 が 2.nine_six ends96 で多数出ている (前文の重複計上)。
  - 7.space: `q069`「直接 埋め込む」、`q084`「メールプロトコル はどれか」、`q028` / `q096` の表内。

**照合は表示層で行う (lesson)**: stem↔図 / stem↔源 の照合は必ず表示層 (`stem_jp_clean || stem_jp`) で行う。
- 例 `q096` (L2c): raw stem_jp の表は崩れている (3,200 / 3,300、60,400、4月行の欠落、E2 "D2/D14"→E3〜E13)。しかし出荷層は源 page-44 と一致する (SOURCE_MATCHES_SHIPPED、route none)。本 prep でも page-44 を目視し、B2=3,000 / B14=60,600 / "D2/D$14" を確認した。
- A1 の q096 0a.num / T.num_raw_clean と、q061 / q067 / q096 の jp_raw 0q.prose ("…") は raw だけの差で、学習者には見えない。

**L2b**
- 表示 jp の見出しは 〔〕 が 10 件。[ ] の 1 件は `q074` の箱ラベル (図の言語化) で、節見出しではない。括弧の是正候補は 0。
- マイナス 0、AI 図ラベル 0。
- figure_description: `q043` (上記) / `q067` (A1 側) / `q028` (UNIT_COLON_DRIFT、low) / `q068` (「4種類」、FP) / `q099` (A3 で解消済み)。
- 表の構造 (⑨ #22):
  - `q082`: COL0_REPEAT。真理値表の A 列は実値の可能性が高い。
  - `q096`: SPAN_ROW (⋮ 行)
  - `q055` / `q061` / `q067`: ABOVE_CAPTION。q055 は nrow 0。
  - `q028`: ABOVE_UNIT
  - en / zh の PREFIX_EXPANDED: `q043` / `q057`

**L2d** (2 題とも C3 で修復済み。commit 1b74910、staging とバイト一致、Rule D PASS)
- **`q007`** (major、top): 旧 crop は工程表の見出し行と上罫線が外れ、下に問8 が混入していた。B4 は図と figure_path に触らない。stem 側の表を源 page-04 と照合する。
- **`q055`** (medium → C3 では major): 旧 crop は選択肢表の見出しが切れていた。C3 は「社員」「部署」スキーマ表も crop に含めた。
  - C3 は「stem に表が文字で無い」として B track へ名指ししていた。しかし現表示 stem には列名だけの 2 表がある。
  - B4 は列名を源 page-23 と照合する。図と stem が重複していても削らない。
- `q041` / `q082` / `q083` は EXTRA で、情報のみ。

**L2c**:
- `q096`: SOURCE_MATCHES_SHIPPED、route none (lesson の例)。
- `q019`: crop の付記のみで、stem の不一致は無い。

**L2e / A3**: `q099` の figure_description は A3 D-160 で全面書換え済み (源 page-48 の矢印 12/12)。B4 は fd を再編集しない。

**summary §7**
- **#4**: 本 prep で L1b 改修版を使って実行済み (qnum_mismatch 0、confusable_only 4 頁)。
- **#12**: B4 の全量再抄写で被覆される。
- **#16**: §7.1 の残リストに 2013h25h は無い。
- 「ヘへ」型 (#6) は 2013h25h に 0 件。
- **#22**: q082 / q096 (L2b)。
- #23 (choicefig の頁ポインタ) に該当する題は無い。

## 4. Workflow 起動引数

```json
{"input_path":"/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/.phase2/b4_fidelity_input_2013h25h.json","exam_id":"2013h25h","qnums":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100],"label":"b4","pass":"sn","model":"sonnet","agent_type":"general-purpose"}
```

- 出力先の既定値は次の 2 つ。どちらもまだ存在しないことを確認済み。
  - out = `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b4_2013h25h_sn.json`
  - parts = `data/ip/quiz/.phase2/fidparts/b4_2013h25h_sn/`
- run の後:
  1. `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/b4_2013h25h_sn <input_path> 2013h25h <out> --journal <journal.jsonl>`
  2. `node scripts/quiz-fidelity-machdiff.mjs <input_path> <out>`
- **B3 の apply が B4 の起動より先に入った場合**: B3 は 2014h26a だけを変えるので、2013h25h の manifest には影響しない。それでも、起動直前に同じコマンドで作り直すのが安全 (冪等、0 token)。

## 5. 見積もり

| 項目 | 値 | 根拠 |
|---|---|---|
| agent | 100 (Sonnet 5、1 題 1 体) | B1〜B3 と同形 |
| token | ≈ 610 万 (540〜660 万) | 61k/問 × 100 |
| 後段 | fixer opus 1 + reviewer opus 1 (別 type) | S122 §0 |

上振れの要因:
- crop の無い 17 題 (中問 16 + merged_preamble 1) は源ページ全体で読む。
- mqB / mqD は前文が複数頁に跨る。
- q096 / q099 は長文。

## 6. 阻害要因

- 脚本のエラーは 0。出た警告は skip だけ。
- B4 の apply は D-152 の data lock の順番 (B3 → … → B4) に従う。
