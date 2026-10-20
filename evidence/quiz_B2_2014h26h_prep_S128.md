# B track B2 — 2014h26h 準備 (S128、L3 data lane)

D-150 §3 (母数外 1,692 題の全量再抄写) の 2 本目。手順は B1 (`evidence/quiz_B1_2015h27h_prep_S128.md`) と同一。本書は**起動前の準備のみ**で、workflow は未起動。D-152 の data lock は B1 が保持中なので、`data/ip/quiz/` の本体 (questions / translations / explanations / chumon_groups) には書いていない。書いたのは `.phase2/b2_*` の manifest、precrop、それに新規 evidence だけ。

---

## 1. 母数

- `question_bank.json` の 2014h26h = **100 問 (q001〜q100)**。13 exam なので全問が母数外 → **B2 母数 = 100 / 100、除外 0**。
- 中問 member も核験の対象に含める (precrop の対象外であって核験の対象内。B1 §1 と同じ規則)。
- **源の中問** (page-33 の「中問Aから中問Dまでは，それぞれ四つの問いを解答してください。」): A = q085-088 / B = q089-092 / C = q093-096 / D = q097-100 の 4 組。
- **`chumon_groups.json` の登録**: `2014h26h-q089-copy` (q089-092)、`2014h26h-mqC` (q093-096)、`2014h26h-mqD` (q097-100) の 3 組。
- **未登録の中問 = 中問A (q085 / q086 / q087 / q088)**。中問A の共有前文は page-33 の全面を占める (M社の通信販売・電話受付センタ集約・〔効果予測する項目〕①②・〔データ管理要領〕)。この前文が**表示 stem に無い**。
  - q085 の displayed_stem は 71 字で、設問文しか無い。設問文は前文中の〔データ管理要領〕を参照しているのに、その前文が表示されていない。
  - q086 / q087 / q088 (1339 / 958 / 453 字) は、それぞれの題に固有の前置きと図表を持つ。ただし共有前文は含まない。
  - B1 で見つかった「未登録中問の前文欠落」と同じ型。⑨ の名指し項目として named JSON の `unregistered_chumon` に記載した。

## 2. manifest + precrop (main tree の脚本を改修せずに使用)

```
node scripts/quiz-fidelity-prep-any.mjs 2014h26h b2 all --precrop
```

- manifest: `data/ip/quiz/.phase2/b2_fidelity_input_2014h26h.json`。100 samples、`prev_page_png` 100/100。健全性の不良 0 (stem 非空・ア〜エ 非空・correct_answer ∈ {ア,イ,ウ,エ})。
- crop: `data/ip/quiz/.phase2/precrop/2014h26h/` に **86 / 100** (ファイル実在 86)。calib は head=150 / body=210 (43 ページ、head 投票 150=36p / 160=27p / 170=8p)。
- skip **14** の内訳:
  - page_mismatch **2**: page-26 (検出 0 / 期待 1 → `q067`)、page-35 (検出 2 / 期待 1 → `q086`)
  - chumon **12**: q089〜q100 (登録 3 組)
  - merged_preamble 0、thin_band 0
- skip した題は源ページ全体で読む。
- 未登録の中問A (q085 / q087 / q088) には帯 crop が配られる。`prev_page_png` = page-33 に前文があるので、agent は前文を見られる。
- crop の目視は `q087` の 1 枚: 問87〜〔前提〕〜図2〜表1〜エ まで欠けなし。B1 (93%) と比べて crop 率が下がったのは、登録中問が 3 組あるため。

## 3. 名指し項目 → `evidence/quiz_B2_2014h26h_named_S128.json`

核験 agent の prompt には入れない。読むのは fixer と reviewer。

**A1 backlog**: 候補 407 件 / 40 題。B1 の priority 規則を当てると、high は **203 件 / 33 題**。

- 候補の多くは 0a.num の struct (103 件) と 2.nine_six (112 件)。
- 主な項目:
  - `q071 エ`: 末尾の残渣「ぜい」(10.R2b)
  - `q085`: 「一且」(isolated_kanji)
  - `q003` / `q020` / `q072`: 語中の空白 (7.space)
  - 中問A の `q086` / `q087` / `q088`、および `q090` / `q092`: raw と clean の間で大きく書き換わっている (0a.ins / word、raw_fluent)
  - `q068`: ツリー表記の書き換え

**L2b**

- 表示 jp の見出しは全て 〔〕。括弧の是正候補は 0、マイナスは 0、AI 図ラベルは 0。
- raw だけにある開閉不一致: `q085`「[データ管理要領〕」、`q092`「〔月間利益計画]」。学習者からは見えないので low。
- 表構造: `q087` の図2 (HDR_EMPTY_CELL、⑨ #22)。
- 情報のみ: `q057` / `q090` の FIG_ONLY_NUM。

**L2d**

- `q086`: 図が切れている (注記 2 行とキャプションが crop 外、medium)。修復は別途行うので、ここでは記録だけ。
- `q068`: stem の [図] 説明「＊印は左側 B 配下の B の下にある A」が図 (＊は B→A→A の下) と一致しない。源 page-27 で確定して是正する。
- `q007` / `q060` は EXTRA で、情報のみ。

**summary §7**

- #6「ヘへ」型の `q054`: raw は「サーバヘへ」だが、表示はすでに「サーバへ」。対処不要。
- #12: B2 の再抄写で被覆される。

**prep で気づいた点 (源 page-34 と照合)**: `q085` について、源は「運用管理部門，」だが表示は「運用管理部門が,」になっている (「が」挿入の疑い)。源の〔データ管理要領〕は、表示では「データ管理要領」(鉤括弧) になっている (⑨ #16 型)。L2b の 〔〕 走査では拾えない形。

**その他**: `q097` / `q100` は figure_group `2014h26h-mqD` に属する。図は B2 の対象外。

## 4. Workflow 起動引数

```json
{"input_path":"/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/.phase2/b2_fidelity_input_2014h26h.json","exam_id":"2014h26h","qnums":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100],"label":"b2","pass":"sn","model":"sonnet","agent_type":"general-purpose"}
```

- 出力先の既定値は次の 2 つ。どちらもまだ存在しないことを確認済み。
  - out = `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b2_2014h26h_sn.json`
  - parts = `data/ip/quiz/.phase2/fidparts/b2_2014h26h_sn/`
- run の後: `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/b2_2014h26h_sn <input_path> 2014h26h <out> --journal <journal.jsonl>` → `node scripts/quiz-fidelity-machdiff.mjs <input_path> <out>`。
- label `b2` は S127 C2 の figfix batch 2 と同じ文字列になる。log では「B2 (B track)」と書き分けること。

## 5. 見積もり

| 項目 | 値 | 根拠 |
|---|---|---|
| agent | 100 (Sonnet 5、1 題 1 体) | B1 / U11 と同形 |
| token | ≈ 610 万 (540〜650 万) | 61k/問 × 100 |
| 後段 | fixer opus 1 + reviewer opus 1 (別 type) | S122 §0 |

上振れの要因は 3 つ。中問 16 題 (うち crop の無い 12 題) と q067 / q086 は源ページ全体で読む。中問A は前文込みで読むことになる。A1 候補は 40 題あり、B1 の 30 題より多い。

## 6. 阻害要因

- 脚本のエラーは 0。出た警告は skip だけ。
- 中問A の前文欠落は、data 是正にするか、D-144 段 3 の設計で裁定するかを決める必要がある。chumon_groups.json への登録追加は ⑨ として主 context に上げる。B unit の fixer が単独で変えてはいけない。
- L1 の precrop 改修が main に入った場合、作り直すかどうかは主 context が判断する (同じコマンドで冪等、0 token)。
