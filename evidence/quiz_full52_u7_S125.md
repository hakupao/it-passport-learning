# ⑤-2 全量保真掃引 U7 — 2022r04 の集計と是正 (S125)

⑤-2 全量核験の **U7** (`docs/phase5/PLAN_52_units.md` §2、D-146 第 9 unit)。母数は
`evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json` の 2022r04 = **75 問**。
**Sonnet 5 単 pass** の 6 回目の本番 unit。

---

## 1. 入力と実行

- run: `wf_9220b31c-fa2` (label `u7`、pass `sn`、model = **Sonnet 5**)
- マニフェスト: `data/ip/quiz/.phase2/u7_fidelity_input_2022r04.json` (`--precrop` 版、crop **46/75**)
  - skip 15 ページ / 29 問 (すべて page_mismatch)。**うち 14 ページが偶数ページ** — 頁パリティによる見出し検出失敗 (§11 ⑨)
  - precrop calib: `head=150 body=230` (head votes `150=21p/1206r 160=18p/924r 210=17p/2861r`)
- 結果 JSON: `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u7_2022r04_sn.json`
- **覆盖 75/75 / CLEAN 57 / DISCREPANT 18 / UNREADABLE 0**、差分 32 {semantic 19, cosmetic 10, answer_affecting 3}、正解肢上 9
- 是正器: `scripts/quiz-fidfix-S125-u7.mjs` (本文。既定 dry-run、`--apply` で書込み)
  + `scripts/quiz-choicefig-D144s2.mjs --only 2022r04-q032` (D-144 段 2、SPEC に 1 行追加)

### Sonnet 単 pass の実測

| 項目 | U4 (2019r01a 52) | U5 (2020r02o 60) | U6 (2021r03 88) | **U7 (2022r04 75)** |
|---|---|---|---|---|
| token | 3,120,259 | 3,877,830 | 5,572,875 | **4,944,550** |
| token / 問 | 60,005 | 64,631 | 63,328 | **65,927** |
| 時間 | 8.8 分 | 9.3 分 | 11.9 分 | **13.4 分** |
| tool 呼び出し | 430 (8.3) | 561 (9.4) | 685 (7.8) | **740 (9.9 回/問)** |
| UNREADABLE | 0 | 0 | 1 | **0** |

(token・時間・tool 数は主 context 申告の workflow ログ値。crop 無しが 29 問と多く、源ページ直読が増えたぶん tool 数/問が高い。)

---

## 2. 率

| exam | n | agent DISCREPANT | +machdiff | 計上 (率) | **是正** (率) | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|---|---|
| 2022r04 | 75 | **18** | **+1 題** (q001) / +4 差分 | 19 (**25.3%**) | **19 (25.3%)** | **9** | **3** |

- agent の 18 題 / 32 差分は**全件採用**。machdiff 実残差 4 件 (q001 stem — agent CLEAN 題 / q017 イ・q018 ウ・q018 エ — agent DISCREPANT 題の見落とし肢) を追加 → **19 題 / 36 論理差分**。非採用 0。
- **severity 再分類 (fixer、36 論理差分)**: cosmetic **13** / semantic **20** / answer_affecting **3**。
  規則 (U6 §2 と同一): 完結した文の後ろのごみ・記号の混入や脱落、行送り位置の記号混入、見出し混入、読点・句点・引用符字種 → cosmetic、語の内部で字が入る / 落ちる / 置き換わる → semantic。
  - agent {semantic 19, cosmetic 10, aa 3} から **2 件を cosmetic に移した**: `q014 エ`「ー 以m␣×33」」/ `q077 エ`「間」(いずれも完結した文「…。」の後ろのごみ。U6 `q010 エ`「= 呈」precedent)。
  - machdiff 由来 4 件: `q001` stem 見出し → cosmetic / `q017 イ`「業務に→業務で」/ `q018 ウ` / `q018 エ` → semantic。
  - cosmetic 13 = `q001` stem / `q012` stem 読点 / `q014 エ` / `q015 エ` / `q022 ウ` 読点 / `q023 ウ` 読点 / `q027` stem 引用符 / `q032 ア` / `q077 エ` / `q100 ア〜エ` 句点 4。
  - semantic 20 = `q014 ウ` / `q017 ア・イ・エ` / `q018 ア・ウ・エ` / `q036 ア` / `q040 イ` / `q047 エ` / `q066` stem・ア・イ / `q071 イ` / `q073 ア〜エ` / `q077 ア` / `q089 ウ`。
  - **answer_affecting 3 = `q032 イ・ウ・エ`** (agent 判定のまま、§4a)。`q032 ア`「（直列）」は注記が図の内容と一致しており agent どおり cosmetic。
- **正解肢上 9** = `q015 エ` (cosmetic) / `q018 ア` (semantic) / `q032 エ` (**aa**) / `q036 ア` / `q066 ア` / `q071 イ` / `q073 ウ` / `q089 ウ` (semantic) / `q100 ウ` (cosmetic)。**`correct_answer` はいずれも不変**。
- `correct_answer` 変更 **0 / 2900**、`data/ip/exams/answer_keys.json` **バイト不変** (md5 `6802bb0bc13004da78ad3c4e5117d997` 前後同一)。

### 既往波との比較

| | 標本 | 計上 | 率 | 正解肢上 | answer_affecting | 抄写 model |
|---|---|---|---|---|---|---|
| 波 1–3 (Opus 双 pass) | 462 | 40 | 8.7% | 6 | 2 | Opus 双 pass |
| U3a (2018h30h) | 70 | 8 | 11.4% | 2 | 1 | Sonnet 単 pass |
| U3b (2019h31h) | 87 | 9 | 10.3% | 1 | 0 | Sonnet 単 pass |
| U4 (2019r01a) | 52 | 4 | 7.7% | 1 | 0 | Sonnet 単 pass |
| U5 (2020r02o) | 60 | 15 | 25.0% | 4 | 0 | Sonnet 単 pass |
| U6 (2021r03) | 88 | 13 | 14.8% | 2 | 0 | Sonnet 単 pass |
| **U7 (2022r04)** | **75** | **19** | **25.3%** | **9** | **3** | **Sonnet 単 pass** |
| **累計 (波 1–3 + U3a〜U7)** | **894** | **108** | **12.1%** | **25** | **6** | — |

U7 の支配型は **1 字の挿入・置換** (リ / 中 / む / - / 其 / 名 / T×4 / 素 / 別) と **slashed zero の 0→9 誤読** (q066 の 3 field、U5 以来の再発)、
加えて **句読点の脱落** (q012 / q022 / q023 読点、q100 句点 ×4)。正解肢上 9 は unit 最多で、うち 6 が語の内部の誤字 (正解肢の本文が学習者に誤表示されていた)。
**q018 ウ は 1 肢の後半が別の文に言い換えられていた** (「大量生産品の更なる低コストでの製造」→「大量生産の更なる低コストの生産への移行」) — 単純 OCR では説明しにくい型で、
zh / en もこの言い換え文を訳していた。

---

## 3. 機械 diff (machdiff) — **AGENT_MISSED 9 = 実残差 4 + 偽陽性 5**

```
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u7_fidelity_input_2022r04.json \
  evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u7_2022r04_sn.json
✗ AGENT_MISSED 2022r04-q001 stem verdict=CLEAN: @0 disp(after agent fixes)「問1著作権及び特許権に関する記述a~」 src「著作権及び特許権に関する記述a~cの」
✗ AGENT_MISSED 2022r04-q006 stem verdict=CLEAN: @67 disp(after agent fixes)「全て挙げたものはどれか.a当該技術に関連した他社とのアライア」 src「全て挙げたものはどれか.」
✗ AGENT_MISSED 2022r04-q017 choice.イ verdict=DISCREPANT: @19 disp「れたスマ-トフォンを業務に使用する.」 src「れたスマ-トフォンを業務で使用する.」
✗ AGENT_MISSED 2022r04-q018 choice.ウ verdict=DISCREPANT: @28 disp「く自動化による,大量生産の更なる低コストの生産への移行」 src「く自動化による,大量生産品の更なる低コストでの製造」
✗ AGENT_MISSED 2022r04-q018 choice.エ verdict=DISCREPANT: @2 disp「動力を電力や石油への移行とともに,統計的」 src「動力の電力や石油への移行とともに,統計的」
✗ AGENT_MISSED 2022r04-q032 choice.ア〜エ verdict=DISCREPANT: @0 disp「仕様→製作図→工程図→製作」 src「[図]仕様→製作図→工程図→製作」 (×4)
machdiff: fields same=366 | AGENT_MISSED=9 | VERDICT_CONFLICT=0 | audits w/o transcript=0 | UNREADABLE skipped=0 | coverage 75/75
```

主 context の見立てを**源実読で独立に確認した — 全件一致**。

| id.field | 源実読 | 判定 |
|---|---|---|
| `q001` stem | p02 crop: 見出し「問1」は左の独立した見出し。dataset は raw・clean とも先頭が「問1 著作権…」。**zh「问1 」/ en「Q1 」にも混入** | **実残差 (見出し混入)** — U3b `2019h31h-q001` 型。zh / en まで及んでいたのは U6 `q100` との違い |
| `q006` stem | p03 crop: 題幹 2 行の後に a / b / c の 3 行が**源にある**。agent の `source_transcript.stem` は題幹 1 文目で切れていた | **偽陽性** (transcript 截断、U3a `q096` 型)。表示は源どおり |
| `q017` イ | p09 crop: イ「会社から貸与されたスマートフォンを業務**で**使用する。」 | **実残差** (agent は ア・エ の「中」脱落のみ計上し、イ を見落とし) |
| `q018` ウ | p09 crop: ウ「…自動化による，大量生産**品**の更なる低コスト**での製造**」 | **実残差** (後半が別文に置換) |
| `q018` エ | p09 crop: エ「動力**の**電力や石油への移行とともに，…」 | **実残差** |
| `q032` ア〜エ | transcript の「[図]」接頭辞 (agent が「肢は図」と明示した記法) | **偽陽性** (U3a `q005` と同型)。差分自体は agent が計上済 (§4a) |

---

## 4. 裁定 (fixer が源を原寸〜2 倍で独立実読)

実読した源: `data/ip/quiz/.phase2/precrop/2022r04/` の **q001 / q006 / q012 / q014 / q017 / q018 / q022 / q023 / q027 / q036 / q047 / q066 / q071 / q073 / q100** (crop)、
crop を持たない `q015` (page-08) / `q040` (page-19) / `q077` (page-34) / `q089` (page-40) は**源ページ直読**、`q032` は **page-15 と複合図 `figures/2022r04-q032.png`**。
agent の `source_text` は候補として扱い、すべて自分の目で読んでから from/to を決めた。**採用 36 / 非採用 0**。

### 4a. **`q032` — D-144 段 2 ②-a (choice_figures 化)** (answer_affecting、U3a `2018h30h-q005` と同型)

**源 (page-15 実読)**: 問32 の 4 肢は**図のみ**。2×2 配置で ア=左上 / イ=右上 / ウ=左下 / エ=右下。
各図は 4 本の矢印 (上に作業名「仕様 / 製作図 / 工程図 / 製作」) から成る:

| 肢 | 源の図 | dataset のテキスト (是正前) | 問題 |
|---|---|---|---|
| ア | 4 本が一直線 (直列) | `仕様→製作図→工程図→製作（直列）` | 注記「（直列）」は源に無い (内容は図と一致) |
| イ | 一直線 + **製作の矢印の途中から下へ降り、左へ折れて工程図の矢印の途中へ上向きに戻る箱形の帰還矢印** (手戻りループ) | `仕様→[製作図→工程図]→製作（一部並行）` | ループを「一部並行」と**取り違え**、源に無い `[ ]` も挿入 |
| ウ | 一直線 + **製作の終端から仕様の始端へ戻る全体の帰還矢印** (全工程の反復) | `[仕様→製作図→工程図→製作]（全工程並行）` | 反復ループを「全工程並行」と**取り違え** — 設問 (コンカレント = 並行) の正解に見える |
| エ (**正解**) | 4 本が**右下がりの階段状にずれて重なる** (後続が前の完了前に開始) | `仕様↓製作図↓工程図↓製作（縦列）` | 源に無い「↓」の連結と「（縦列）」注記で、重複 (並行) を**縦一列の逐次**に見せていた |

**判断**: (a) テキスト忠実化は不可 — 源に文字としての肢は無く、どう文章化しても「並行 / 反復 / 直列」の**解釈を書くこと**になり、
正解肢エの特徴 (重複) を書けば答えを書くことになる (D-144「②-a を全テキスト化すると失真か答え漏らしが避けられない」)。
実際 zh / en の選択肢は構造を文章で説明しており、エ en「…each subsequent task begins before the previous one finishes, so they proceed in parallel (overlapping)」は**答えを書いていた**
(イ zh / en「仅工序图与制作之间有部分并行 / partial parallelism」は図の誤読)。
→ **(b) D-144 段 2 choice_figures 化**を採用 (U3a q005 / 波 1 `2016h28a-q050` と同じ機構、機構追加なし)。

**処置**:
- `scripts/quiz-choicefig-D144s2.mjs` の SPEC に `"2022r04-q032": { topCut: 240, bottomCut: 150 }` を追加 (冒頭コメントにも追記)。
  複合図 `data/ip/exams/figures/2022r04-q032.png` (1432×892) の行インク帯 (grey<160) は
  `90-117 / 145-172 / 201-227` (題幹 3 行) / `298-404` (上段 ア・イ) / `455-678` (下段 ウ・エ、エの階段 4 段を含む) / `815-841 / 870-892` (次問 問33 の 2 行)。
  → topCut 240 は題幹末 (227) と図の上端 (298) の間、bottomCut 150 (= 残り下端 742) は図の下端 (678) と問33 (815) の間。
- **切り出しは先に scratchpad で同じロジックを複製して生成し目視確認してから本適用した** (象限→字母・切れ・残渣):

  | 肢 | 産物 | px | 内容 (目視) |
  |---|---|---|---|
  | ア | `figures/2022r04-q032-cA.png` | 507×91 | 字母「ア」+ 直列 4 矢印 |
  | イ | `figures/2022r04-q032-cB.png` | 502×136 | 字母「イ」+ 4 矢印 + 工程図付近の箱形帰還矢印 (ループ底辺まで含む) |
  | ウ | `figures/2022r04-q032-cC.png` | 501×133 | 字母「ウ」+ 4 矢印 + 全体の帰還矢印 (左端の上向き矢頭まで含む) |
  | エ | `figures/2022r04-q032-cD.png` | 407×247 | 字母「エ」+ 階段状 4 矢印 (最下段「製作」まで含む) |

  列の空白帯は ア/ウ の右端 (x≈690) と イ/エ の字母 (x≈740) の間、行の空白帯は イ のループ底辺 (y≈404) と ウ/エ 行 (y≈455) の間で、
  いずれも脚本の探索窓 (列 30–70% / 行 25–75%) に入る。題幹・問33 の残渣なし。
- 脚本の既定動作どおり: raw (bank / by_year) に `choice_figure_paths`、`figure_path`→null (旧値は `composite_figure_path_retired`)、
  旧テキストは `choices_text_retired` に退避、`choices_jp` = `図ア`〜`図エ`、sidecar / `.phase1` の zh = `图ア`〜 / en = `Figure ア`〜。
  **applied 30 field** (U3a q005 と同数)。`build-quiz-corpus` → `build-quiz-figures` で `apps/web/public/quiz-figures/2022r04-q032-c{A,B,C,D}.webp` 生成、
  複合図 `2022r04-q032.webp` は削除 (既存 5 題と同じ挙動)。複合 PNG `figures/2022r04-q032.png` は残置 (retired パスの実体)。
- **解説の書換は 0 件**。`expl_jp_2022r04-q032.json` / `expl_tr_…` を jp/zh/en 全文精査: 正解理由は「図エは…階段状にずらして描き、各後続作業が前の作業の途中から開始」、
  誤答ア〜ウも「1本の矢印上に一列」「工程図と製作の間に矢印が下へ折り返す戻りループ」「末尾（製作）から先頭（仕様）へ大きく戻る矢印」と**図の内容**を論拠にしており、
  旧テキストの注記「（一部並行）」「（全工程並行）」「（縦列）」は 0 回 (grep)。ア の解説の「直列」は解説者の語で旧注記の引用ではない。→ U3a q005 と同じく書換不要。
- key_guard final note に D-144 段 2 化の一文を追記 (U3a q005 precedent、§7)。`correct_answer` は **エ のまま不変**。

### 4b. `q066` — slashed zero の 0→9 誤読 (semantic ×3、**ア は正解肢**)

p30 crop を 2 倍で実読: stem「“**100**mAh” の意味として」、ア「**100**mA の電流を1時間放電できる。」、イ「**100**分間の充電で，…」、ウ「1A の電流を100分間放電できる。」、エ「1時間の充電で，電流を100分間放電できる。」。
源の 0 は斜線入りゼロ (U5 `q004` / `q075` と同じ書体)。dataset は **raw stem「199mAh」/ clean stem「109mAh」/ ア「109mA」/ イ「190分間」**で、ウ・エの「100分間」だけが正しかった。
- 全層追随: raw 3 層 + clean (sidecar・.phase1)、zh / en の stem・ア・イ (いずれも 109 / 190 を訳していた)。
- **解説 (jp・zh・en)**: correct の「109mAh」「109mA」×2 → 100、派生値「半分の約55mA / 2倍の218mA」→ **50mA / 200mA** (100 の半分・2 倍; 「約」は不要になるので外した)。
  distractor ウ「109mAh とは大きく異なる」→ 100mAh (1667mAh との比は 16.7 倍で「一桁以上」は是正後も成立)。
  **distractor イ は置換でなく論拠の書換**: 旧「190 という数値も109mAh から導けない」は是正後に両方 100 となり**偽になる** →
  「「100分間の充電で」という記述は容量の定義に含まれていない。100mAh の「100」は電流 (mA) の値であり、充電時間 (分) を表すものではない。」に改めた (zh / en 同義)。
  **Rule D 確認点**: 書換後の論拠の妥当性。
- 答え (ア = X mAh は X mA を 1 時間) は不変。

### 4c. `q018` — ア / ウ / エ (semantic ×3、**ア は正解肢**)

p09 crop 原寸: ア「…多様な IT によるコスト低減と**短納期**での提供」、ウ「…自動化による，大量生産**品**の更なる低コスト**での製造**」、エ「動力**の**電力や石油への移行とともに，…」。
- ア: 短期間 → **短納期** (納期 = 発注から納品までのリードタイム)。zh「短周期」/ en "in a short time" は「期間」の訳で源の語義とずれる → zh「**短交期**」/ en "**with short delivery times**" に追随
  (解説 correct の zh「短交付周期」/ en "short delivery time"、jp「短納期」と揃う)。
- ウ: zh「从而使大规模生产**转向**成本更低的生产」/ en "**The shift of** mass production to even lower-cost production" は腐敗文の「への移行」を訳していた →
  zh「从而以更低的成本制造大批量生产的产品。」/ en "Manufacturing mass-produced goods at even lower cost through …" に追随 (U5 `q026` precedent)。
  解説 (第3次産業革命の説明) は源の語義で書かれており不変。
- エ: zh / en は既に「动力转向电力和石油 / shift of power to electricity and petroleum」で源の語義 → 不変。

### 4d. `q015` エ — 末尾「 .」(cosmetic、**エ は正解肢**) — 画素計測で染みと確定

page-08 直読: エ「業務で必要となる人の役割」の約 20px 右下に微小な点がある。grey<170 の 8 近傍連結成分で計測すると
**2×3px・5 画素・平均輝度 150**。同ページの実在の句点 (問16 ア「…付与される。」の「。」、同じ閾値で x999–1006 / y1361–1367) は**8×7px・37 画素・平均輝度 90**。
形 (中空の円でない)・大きさ・濃さのいずれも活字ではなく紙面の染み → dataset の「 .」(空白 + ASCII ピリオド) は源に無い → 除去。
ア〜ウ も末尾に句読点が無く体裁が揃う。correct_answer=エ 不変 (U3b `q084` の画素計測 precedent を適用、ただし向きは逆: あちらは agent 主張の記号を棄却、こちらは dataset 側の記号を棄却)。

### 4e. `q001` — 見出し「問1 」混入 (cosmetic、machdiff 由来) — §3

raw 3 層 + clean 2 層 + **zh「问1 」/ en「Q1 」 (sidecar・.phase1)** から除去。

### 4f. `q014` ウ・エ
p07 crop: ウ「…購入から一定期間**ソフトウェア**の利用を開始しなければ，契約は無効になる。」(semantic)、エ「…と，契約は成立する。」で終わる (末尾の「ー 以m␣×33」」を除去、cosmetic)。
解説 distractor ウ 末尾の「(なお選択肢中の「リフトウェア」は「ソフトウェア」の OCR 誤読)」は是正後に偽 → jp・zh・en から除去 (U5 `2020r02o-q078`「TIP 電話」precedent)。

### 4g. `q017` ア・イ・エ (semantic ×3)
p09 crop: ア「…スマートフォンを業務**中**に私的に使用する。」/ イ「…業務**で**使用する。」/ エ「私物の…業務**中**に私的に使用する。」。
zh ア・エ「在工作中」/ en "during work"、イ「用于业务」/ "for work" は既に源の語義。

### 4h. 1 字の誤字 (semantic)
| id | 源 | dataset | 備考 |
|---|---|---|---|
| `q036 ア` (p17 crop) | 成果物を定義するので | 定義**む**する | **正解肢** |
| `q040 イ` (p19 直読) | 作業項目の**一**つ一つ | の**-**つ一つ | |
| `q047 エ` (p21 crop) | 開発**期**間中 | 開発**其**間中 | |
| `q071 イ` (p32 crop) | 行頭に置こうとした**句**読点 | **名**読点 | **正解肢**。zh「标点符号」/ en "punctuation mark" は正 |
| `q073 ア〜エ` (p33 crop) | IPv4 / IPv5 / IPv6 / IPv8 | **T**IPv4 / **T**IPv5 / **T**IPv6 / **T**IPv8 | ウ は**正解肢**。zh / en は正。U5 `q078`「TIP 電話」と同じ「T」挿入 |
| `q077 ア` (p34 直読) | **索**引を用意する | **素**引 | |
| `q089 ウ` (p40 直読) | 任意の文字**列**に | 文字**別**に | **正解肢**。「ハイパリンク」は**源どおり** (不変) |

### 4i. 句読点・引用符 (cosmetic)
- `q012` stem (clean): 源「…違いによって，/ 貸付型，…」(行末の読点)。clean は「違いによって貸付型」→ 読点復元。raw は「違いによって 貸付型」で n=0 skip (N5)。
- `q022 ウ`: 源「調達，開発，製造，販売，サービス」。dataset「調達 開発,製造,販売, サービス」の脱落 1 を復元し、同じ列挙の字種・空白を house rule「, 」で揃えた (1 置換)。
- `q023 ウ`: 源「…進めていたが，/ 決済の手続が…」→ 読点復元。
- `q027` stem (clean): 源「“要配慮個人情報”」(欧文二重引用符)。clean「「要配慮個人情報」」→ 源の字形へ (U3a `q001` / U5 `q085` precedent)。raw「“…"」は n=0 skip (N5)。zh / en の引用符は ⑨-c 保留。
- `q077 エ`: 源「…防ぐことができる。」で終わる → 末尾「間」除去 (次問見出し「問」の断片ではなく、p34 では問77 が最下段なので単なるごみ)。
- `q100 ア〜エ`: p45 crop で 4 肢とも「…する。」で終わる → 句点復元 (波 2 `2016h28h-q089` precedent)。ウ は**正解肢**。zh / en は各言語の体裁で不変。

### 4j. CLEAN 標本の無作為抽検

CLEAN 55 問 (machdiff 対象の q001 / q006 を除く) から **seed 127 の LCG で 3 問を無作為抽出** (`q025` / `q075` / `q002`) して源と逐字照合した。

| id | 実読結果 |
|---|---|
| `q025` (p12 源ページ直読、crop 無し) | 題幹「a〜d のうち，業務プロセスの改善に当たり，…」、a DFD / b アクティビティ図 / c パレート図 / d レーダチャート、4 肢 a,b / a,c / b,d / c,d が一致 (a〜d の 2×2 配置が 1 行に並ぶのは表示上の体裁) |
| `q075` (p34 源ページ直読、crop 無し) | 題幹「バイオメトリクス認証に関する記述として，…」と 4 肢 (ア「…ショルダーハックなどののぞき見行為によって容易に認証情報が漏えいする。」ほか) が一致 |
| `q002` (p02 crop) | 題幹「年齢，性別，家族構成などによって…」と 4 肢 (サービス / セグメント / ソーシャル / マス マーケティング) が一致 |

→ **見落とし 0**。

---

## 5. SOURCE_TYPOS

本 unit では**該当なし** (`q089`「ハイパリンク」は源の表記どおりで、dataset も同じ。是正対象外)。

---

## 6. 採用した差分 (19 題 / 36 論理差分)

| id (page) | field | 差分 | severity | 由来 |
|---|---|---|---|---|
| q001 (p02) | stem | 先頭 `問1 ` → 除去 (zh `问1 ` / en `Q1 ` も) | cosmetic | **machdiff** |
| q012 (p06) | stem (clean) | `違いによって貸付型` → `違いによって, 貸付型` | cosmetic | agent |
| q014 (p07) | choice.ウ | `リフトウェア` → 源 `ソフトウェア` (解説の注記も除去) | **semantic** | agent |
| q014 (p07) | choice.エ | 末尾 `ー 以m␣×33」` → 除去 | cosmetic (agent: semantic) | agent |
| q015 (p08) | choice.エ | 末尾 ` .` (紙面の染み) → 除去。**正解肢** | cosmetic | agent |
| q017 (p09) | choice.ア | `業務に私的に` → 源 `業務中に私的に` | **semantic** | agent |
| q017 (p09) | choice.イ | `業務に使用する` → 源 `業務で使用する` | **semantic** | **machdiff** |
| q017 (p09) | choice.エ | `業務に私的に` → 源 `業務中に私的に` | **semantic** | agent |
| q018 (p09) | choice.ア | `短期間` → 源 `短納期` (zh / en 追随)。**正解肢** | **semantic** | agent |
| q018 (p09) | choice.ウ | `大量生産の更なる低コストの生産への移行` → 源 `大量生産品の更なる低コストでの製造` (zh / en 追随) | **semantic** | **machdiff** |
| q018 (p09) | choice.エ | `動力を` → 源 `動力の` | **semantic** | **machdiff** |
| q022 (p11) | choice.ウ | `調達 開発,製造,販売, サービス` → `調達, 開発, 製造, 販売, サービス` | cosmetic | agent |
| q023 (p11) | choice.ウ | `進めていたが決済` → `進めていたが, 決済` | cosmetic | agent |
| q027 (p13) | stem (clean) | `「要配慮個人情報」` → 源 `“要配慮個人情報”` | cosmetic | agent |
| q032 (p15) | choice.ア | `…（直列）` → **choice_figures** (`図ア`) | cosmetic | agent |
| q032 (p15) | choice.イ | `…（一部並行）` → **choice_figures** (`図イ`) | **answer_affecting** | agent |
| q032 (p15) | choice.ウ | `…（全工程並行）` → **choice_figures** (`図ウ`) | **answer_affecting** | agent |
| q032 (p15) | choice.エ | `…（縦列）` → **choice_figures** (`図エ`)。**正解肢** | **answer_affecting** | agent |
| q036 (p17) | choice.ア | `定義むする` → 源 `定義する`。**正解肢** | **semantic** | agent |
| q040 (p19) | choice.イ | `の-つ一つ` → 源 `の一つ一つ` | **semantic** | agent |
| q047 (p21) | choice.エ | `其間` → 源 `期間` | **semantic** | agent |
| q066 (p30) | stem | raw `199mAh` / clean `109mAh` → 源 `100mAh` (zh / en・解説追随) | **semantic** | agent |
| q066 (p30) | choice.ア | `109mA` → 源 `100mA`。**正解肢** | **semantic** | agent |
| q066 (p30) | choice.イ | `190分間` → 源 `100分間` | **semantic** | agent |
| q071 (p32) | choice.イ | `名読点` → 源 `句読点`。**正解肢** | **semantic** | agent |
| q073 (p33) | choice.ア〜エ | `TIPv4/5/6/8` → 源 `IPv4/5/6/8`。ウ は**正解肢** | **semantic** ×4 | agent |
| q077 (p34) | choice.ア | `素引` → 源 `索引` | **semantic** | agent |
| q077 (p34) | choice.エ | 末尾 `間` → 除去 | cosmetic (agent: semantic) | agent |
| q089 (p40) | choice.ウ | `文字別` → 源 `文字列`。**正解肢** | **semantic** | agent |
| q100 (p45) | choice.ア〜エ | 文末句点 `。` 復元。ウ は**正解肢** | cosmetic ×4 | agent |

- jp 読点の字種は house rule の ASCII `", "` (D-147 §1)。

### zh / en / 解説の追随

| id | zh | en | 解説 | 判定 |
|---|---|---|---|---|
| q001 stem | `问1 ` 除去 | `Q1 ` 除去 | — | **追随** |
| q066 stem・ア・イ | 109 / 190 → 100 | 同左 | correct・イ・ウ を jp・zh・en で是正 (イ は論拠の書換) | **全層追随** |
| q018 ア・ウ | 短交期 / 以更低的成本制造 | with short delivery times / Manufacturing … | 源の語義で書かれており不変 | **選択肢のみ追随** |
| q014 ウ | 既に「软件」 | 既に "software" | distractor ウ の OCR 注記を jp・zh・en から除去 | **解説のみ追随** |
| q032 | `图ア`〜`图エ` | `Figure ア`〜`Figure エ` | 図ベースで不変 | D-144 段 2 |
| q017 / q018 エ / q036 / q040 / q047 / q071 / q073 / q077 / q089 / q015 / q012 / q022 / q023 / q027 / q100 | 既に源の語義 | 同左 | 不変 (出荷解説に腐敗語の引用なし — grep) | 不変 |

### 指示から外した点

**なし。** 要注意項目 (q032 / 正解肢上 9 / q066 数字 / q073 全肢 / q014・q017・q047・q077 / q100 句点 / q027 引用符) と machdiff 9 件をすべて源実読で確認した。
- 指示外で追加したもの (いずれも同じ差分の追随): q001 の zh / en 見出し除去、q018 ア・ウ の zh / en 追随、q014 解説の OCR 注記除去、q066 解説 イ の論拠書換。
- q022 ウ は脱落読点 1 箇所の復元に加え、同じ列挙内の既存読点の字種・空白を house rule で揃えた (1 field 内、語は不変)。

---

## 7. 層と局所性

| 層 | 置換操作数 | 備考 |
|---|---|---|
| raw (`questions.json` / `question_bank.json` / `by_year/2022r04.json`) | **90** | choices 28 置換 × 3 = 84 / stem q001・q066 × 3 = 6 |
| sidecar (`translations/2022r04.json`) | **16** | `stem_jp_clean` 4 (q001 / q012 / q027 / q066) + zh・en 12 (q001 stem 2 / q066 stem・ア・イ 6 / q018 ア・ウ 4) |
| `.phase1/tr_<id>.json` | **16** | sidecar と同一の置換 |
| 解説 `.phase2/expl_{jp,tr}_*.json` | **18** | q066 correct 9 + イ 3 + ウ 3 / q014 ウ 3 |
| key_guard final note (`.phase2/generate_result_2022r04.json`) | **14** | D-143: **final のみ**、round1 不可触 |
| **fidfix 合計** | **154** | `quiz-fidfix-S125-u7.mjs` の `applied` と一致 |
| skip (想定どおり) | **11** | q012 / q027 の raw 3 層 (clean のみの腐敗) 6 + q066 stem の 2 行のうち各層で当たらない側 5 (raw 3 は `109mAh` 行、clean 2 は `199mAh` 行)。**無言 guard skip 0** |
| D-144 段 2 (`quiz-choicefig-D144s2.mjs --only 2022r04-q032`) | **30** | bank 7 + by_year 7 (`choice_figure_paths` / `figure_path`→null / `choices_text_retired` / `choices_jp` ×4) + sidecar 8 + `.phase1` 8 |

### 選択肢に clean 層は無い = **腐敗は学習者に見えていた**

- 2022r04 の sidecar のキー集合 = {`stem`, `choices`, `stem_jp_clean`} (clean は 68 題)。**`choices_jp_clean` は存在しない** (実測)。
- → 選択肢の 28 置換 + q032 の 4 肢はすべて出荷層の腐敗。stem は q001 / q012 / q027 / q066 が clean を持つ (表示は clean 層)。

### 適用ループの由来 (Rule D 向け)

`quiz-fidfix-S125-u7.mjs` の冒頭 (`import` 〜 `sub()`) は `quiz-fidfix-S125-u6.mjs:63-89` を、適用ループ (「// ── 適用」以降) は
`quiz-fidfix-S125-u6.mjs:154-末尾` を**機械的に連結**して作成し、差は最終 console.log のラベル 1 語 (`u6`→`u7`) のみ。
本 unit で実行された分岐: **stem 分岐 (raw + clean) / choices 分岐 / zh・en 分岐 (stem・choices) / EXPL の distSub・correctSub / NOTE_APPEND**。pointSub / NOTE_SUB は未実行。

### key_guard final note

- 本 unit の 19 問は generate_result の final note・round1 note とも**空文字**。
- 対象 **14 件** = 語義・数値 (`q014` `q017` `q018` `q040` `q047` `q066` `q077`) + 正解肢命中 (`q015` `q036` `q071` `q073` `q089` `q100`、q018 / q066 は両方) + D-144 段 2 (`q032`)。
  **追記しない 5 件** = `q001` (見出し) / `q012` / `q027` (stem の読点・引用符) / `q022` / `q023` (誤答肢の読点)。
- **14 件とも純粋な後置** (`final.startsWith(旧 final)` 14/14)、round1 の変更 **0 / 100**、変化 path は `key_guard.note_jp` のみ (機械照合)。
- merge は final ≠ round1 のため **14 問に `round1` ブロック (note_jp = "") を新規 publish** (U5 / U6 と同じ D-143 の挙動)。

### tracked データの差分 (`git diff --numstat`)

| ファイル | 差分 | 内訳 |
|---|---|---|
| `data/ip/quiz/questions.json` | +41 / −35 | 36 key 変化 = choices 32 (fidfix 28 + q032 4) + stem 2 (q001 / q066) + q032 `figure`→null + `choice_figures` 新設 |
| `data/ip/quiz/translations/2022r04.json` | +24 / −24 | clean 4 + zh・en 12 + q032 zh・en 8 |
| `data/ip/quiz/explanations/2022r04.json` | +124 / −26 | q066 / q014 解説本文 + final `note_jp` 14 + **`round1` ブロック 14 の新規 publish** |
| `apps/web/public/quiz-figures/` | −1 / +4 | `2022r04-q032.webp` 削除、`2022r04-q032-c{A,B,C,D}.webp` 新規 (**untracked — commit 時に add が必要**) |
| `translations/*.json` の他 28 exam・`explanations/` の他 28 exam | **0** | 再 merge なし |

`question_bank.json` / `by_year/2022r04.json` / `.phase1` / `.phase2` は gitignore 下 (適用前状態は scratchpad `u7/pre/` に控えて照合)。
`.phase1` の変化は `tr_q001 / q012 / q018 / q027 / q032 / q066` の 6 本、`.phase2` の expl は `expl_{jp,tr}_q014 / q066` の 4 本のみ (他は `cmp` で byte 同一)。
`questions.json` の key 変化は上記 36 のみ、他 2864 問は無変化 (HEAD との機械照合)。

---

## 8. 事後核験

**(a) 是正後 manifest を再構成して machdiff を再実行**

```
node scripts/quiz-fidelity-prep-any.mjs 2022r04 u7post "<75 問の番号>" --precrop
  precrop calib: head=150 body=230 (39 pages in scope; head votes 150=21p/1206r 160=18p/924r 210=17p/2861r)
  precrop: 46/75 questions cropped; skipped 29 questions (page_mismatch 29 …), 15 pages (page_mismatch)
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u7post_fidelity_input_2022r04.json <同じ結果 JSON>
✗ AGENT_MISSED 2022r04-q006 stem     … (事前と同一の偽陽性)
✗ AGENT_MISSED 2022r04-q032 choice.ア〜エ: disp「図ア」〜「図エ」 src「[図]仕様→…」
✗ AGENT_MISSED 2022r04-q100 choice.ア〜エ: disp「…再インスト-ルする..」 src「…する.」
machdiff: fields same=366 | AGENT_MISSED=9 | VERDICT_CONFLICT=0 | … | coverage 75/75
```

- **実残差 4 (q001 / q017 イ / q018 ウ / q018 エ) はすべて解消**。
- 残る 9 件は**すべて実残差でない**:
  - `q006` stem — 事前と同一の偽陽性 (transcript 截断、§3)。
  - `q032` ア〜エ — **意図的** (D-144 段 2 で肢が図になり、表示テキストは中立な「図L」)。U3a §8 の q005 ×4 と同じ。
  - `q100` ア〜エ — **machdiff の patch 再適用の人工物**: agent の `current_text`「…する」は是正後テキスト「…する。」の接頭辞なので、
    machdiff が patch (「…する」→「…する。」) を是正後にも当てて「。。」を作る (U6 §8a `q011` と同じ機構)。実テキストは源と逐字一致 (§8b)。
- precrop は再 prep で **46 枚すべて byte 不変** (適用前退避 `scratchpad/u7/pre/precrop_2022r04/` と `cmp`)。生成した `u7post` manifest は削除済。

**(b) 採用 36 件の `source_text` と是正後表示テキストの直接照合** (patch を使わない。許容表記揺れ = NFKC / 読点字種 / 空白 のみ潰す):

| 判定 | 件数 |
|---|---|
| EXACT | **15** |
| TOLERANT | **16** (読点字種・英数字周囲の空白のみ) |
| PREFIX (TOLERANT) | **1** (`q012` stem: agent の `source_text` が題幹 1 文目だけの截断引用。是正後表示の接頭辞として許容一致) |
| RESIDUAL | **4** — `q032` ア〜エ = **意図的** (D-144 段 2、表示は「図L」) |

**(c) 波及ゼロの機械証明**

| 検査 | 結果 |
|---|---|
| `questions.json` 2900 問の変化 key | **36** = §6 の 19 題中 17 題 (clean のみの q012 / q027 を除く) |
| `correct_answer` 変更 | **0 / 2900** |
| `translations/` 追跡下 29 exam | **2022r04 の 24 field のみ** |
| `explanations/2022r04.json` | 解説本文は q066 / q014 のみ、note 14、round1 新規 14。出荷解説中の `109` / `190` / `リフトウェア` は **note 内の是正記述のみ** (grep) |
| `answer_keys.json` | **md5 `6802bb0bc13004da78ad3c4e5117d997` 前後同一** |

---

## 9. ゲート

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** (A6 = D-144 段 2 の 4 肢揃い・WebP 実在・「図L」・图L / Figure L を q032 含む 6 題で通過) |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ SPLIT_FIGURE 0 件 / (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ `chumon_groups.json は生成結果と一致` (`? 2015h27h-mqC` / `mqD` は既存の情報行) |
| `pnpm -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm -C apps/web exec vitest run` | ✅ **33 passed / 1 skipped (34 files)、501 passed / 2 skipped (503 tests)** |
| `node --check scripts/quiz-fidfix-S125-u7.mjs` | ✅ |
| fidfix dry-run (既定) 再実行 | ✅ **applied 0 / skipped 165** (完全冪等) |
| `quiz-choicefig-D144s2.mjs --dry-run --only 2022r04-q032` | ✅ **applied 0** (冪等) |
| 同 脚本の既存 5 題 (SPEC 追加の非干渉) | ✅ `--only` 各題で `2014h26a-q046` / `2012h24a-q002` / `2016h28a-q050` / `2018h30h-q005` = **applied 0**。`2014h26a-q086` は「2×2 の空白帯が見つからない」で throw するが、**HEAD の脚本 (本 unit の編集前) でも同じ throw** を確認 = 既存の状態 (複合 PNG が S117 の crop 後に更新されている、mtime 15:47 > crop 14:26)。本 unit の編集とは無関係 (§11 ⑨) |
| `correct_answer` 差分 | ✅ **0 / 2900**。`git diff -U0 data \| grep -c '"correct_answer"'` = **0** |
| `answer_keys.json` | ✅ byte 不変 |
| 事後 machdiff | ✅ 実残差 0 (MISSED 9 = 偽陽性 1 + 意図的 4 + patch 再適用人工物 4、§8a) |
| 資産鮮度 (D-144 段 2) | ✅ `figures/2022r04-q032-c{A,B,C,D}.png` と `public/quiz-figures/…webp` の寸法一致 (507×91 / 502×136 / 501×133 / 407×247)。choice_figures 保有 6 問の全 24 WebP 実在。has_figure 511 / webp 530。`build-quiz-figures` は他 WebP を byte 不変で再生成 (git 上の変化は q032 のみ) |
| D-143 | ✅ MARK 付き final note **14**、純粋後置 14/14、round1 変更 0、`explanations` 内 MARK **14** |
| e2e (Playwright) | **未実行** — `apps/web/playwright.config.ts` は prod 別名 (`web-mu-sandy-78.vercel.app`) を叩く構成で、未 push のローカル変更は検証できない。表示経路 (`QuizSet.tsx` の `choice_figures` 描画) は既存 5 題で稼働中の同一経路で、SSR テスト (`QuizRichText.ssr.test.ts`) は vitest で通過。**push 後の確認を推奨** |

適用前の前提検証: `quiz-phase2-merge.mjs 2022r04` を**先に実行して `git diff` 0** (merge 冪等) を確認。
merge の報告 `SUSPECT 1 (q021)` / `STEM-CORRUPTION 3 (q039* / q091* / q092*)` は**適用前後で同一** (本 unit の変更対象外)。
再生成: `build-quiz-corpus.mjs` (2900 問 / with_fig 511) → `build-quiz-figures.mjs` (530/530、missing 0) → `quiz-phase2-merge.mjs 2022r04`。

---

## 10. 見送り

| クラス | 該当 | 理由 |
|---|---|---|
| 非出荷の key_guard note | `.phase2/expl_jp_*.json` の note (`q014`「リフトウェア」「ー 以m」/ `q036`「定義むする」/ `q066`「109mAh」「199mAh」/ `q071`「名読点」/ `q073`「TIPv4…」/ `q077`「素引」「間」) | merge が読まない (U5 §7)。⑨ 継続。**q066 の note は「clean「109mAh」を正とする」と誤った値を権威として述べている** (非出荷だが記述は偽) |
| N5 (raw stem の残存腐敗、clean が出荷層) | `q012` raw「違いによって 貸付型」「4A 社」/ `q027` raw「“要配慮個人情報"」/ `q001` raw「a 一 c」「適切かもの」/ `q006` raw「a ー c」「適切なかもの」/ `q073` raw の行送り空白 | 学習者不可視。`q001`「適切かもの」`q006`「適切なかもの」は字が変わる型で N5 別ランク台帳の対象 |
| 解説者自身の文 | `q027` 解説の「要配慮個人情報」の鉤括弧 | 法令用語を解説者が括った表記で、設問の引用ではない |
| zh / en の体裁 | `q100` zh / en の文末句点、`q027` zh / en の引用符 | 各言語の慣行 (⑨-c 保留) |
| 読点の字種・空白 | `q012`「A社」ほか英数字周囲の空白 | 許容表記揺れ |
| `q089`「ハイパリンク」 | 源の表記 | 源どおり (SOURCE_TYPOS でもなく、IPA の表記として不変) |

---

## 11. backlog (⑨ / 次 unit へ)

### ⑨ 新規: **precrop の頁パリティ — 偶数ページの見出しが左寄せ許容幅の外にある**

- calib `head=150 body=230`、head votes `150=21p/1206r  160=18p/924r  210=17p/2861r` (39 ページ)。
  **奇数ページ**の見出し「問NN」の最左インクは x≈150、**偶数ページ**は x≈**166〜175** (綴じ代で左余白が約 15〜20px 広い)。
- `findHeadings` は見出し run の最左インクが `[head−14, head+18] = [136, 168]` に入ることを要求する (`LEFT_TOL_LO/HI`)。
  偶数ページの見出しを grey<150 で実測すると (ページ: 見出し最左 x):
  `p08 169,169 / p10 168,169 / p12 169,168,168 / p14 168,168,169 / p16 171 / p18 170,169 / p20 170,170 / p22 175,174,174 / p24 170,170 / p26 169,170 / p28 174,173,173 / p34 169,169,169 / p40 169,169 / p42 170,169,170`
  → **169 以上の見出しを 1 本でも含む偶数ページが skip** (個数不一致)。すべて 168 以下の偶数ページ (`p02 / p04 / p06 / p30 / p32 / p36 / p38`) は通過。
  (上の列は簡易測定 [全幅・高さ≥15px の行 run の最左、grey<150] で、p02 に 172 が 1 本出るが、脚本と同じ定数 [strip x136–190 / INK 160 / MERGE_GAP 8 / 高さ 14–44] で
  測り直すと p02 の見出しは **168 / 167 / 167** の 3 本 (172 は見出しでない行)、p08 は **169 / 169** で 2 本とも棄却 = detected 0 — ログと一致。)
  skip 15 ページのうち **14 ページがこの型**。
- 残る 1 ページ `page-19` (奇数、detected 2 / expected 3) は別原因: 問40 の見出し行 (y≈209–232) の**左余白 x≈30 に小さな汚れ**があり、
  その行の最左インクが 30 になって許容幅外で棄却された (問41 / 問42 は x=154 で検出)。
- 実害: 29 問が crop 無し → agent は源ページ直読 (tool 数/問 9.9、U6 7.8 より高い)。誤帯の割当は無い (個数不一致で安全側 skip)。
- → **推奨**: calib をページパリティ別 (奇数 / 偶数で head モードを別に求める) にするか、`LEFT_TOL_HI` を 18 → 28 程度に広げる。
  左余白の孤立点は、見出し run の最左インクを「run 内の連結成分のうち一定面積以上のもの」から取れば避けられる。本 unit では脚本改修しない。
- 関連: precrop page_mismatch は U3b〜U7 で **5 unit 連続**。U6 ⑨ (題番号を検証しない) とあわせて precrop 改修の 1 件にまとめるのがよい。

### ⑨ 新規: **zh / en の見出し混入** — `2022r04-q001`

- stem 先頭の「問1 」が jp だけでなく zh「问1 」/ en「Q1 」にも訳されていた (U3b / U6 の見出し混入は jp のみ)。
  **翻訳が腐敗した jp stem から作られた痕跡**。他 exam の `问\d+ ` / `^Q\d+ ` 走査を提起 (sidecar 全量 grep で数秒)。

### ⑨ 新規: **zh / en が腐敗文を訳していた** — `q018 ウ` / `q066`

- `q018 ウ`「への移行」→ zh「转向」/ en "shift"、`q066`「109 / 190」→ zh / en も 109 / 190。U5 `q026`「防災品」と同型。
  jp の是正時に zh / en の同義確認を省けないことの再確認 (本 unit は全件確認済)。

### ⑨ 新規: `quiz-choicefig-D144s2.mjs` を `--only` 無しで再実行できない

- 既存題 `2014h26a-q086` の複合図 `figures/2014h26a-q086.png` が choice 図の切り出し後に更新されており、2×2 の空白帯検出が失敗して throw する
  (HEAD の脚本でも同じ)。産物 (`-c{A..D}.png` / WebP) と data は既に正しく、実害は「全題 dry-run で冪等性を一括確認できない」こと。
  → 題を追加するときは `--only` で走らせる運用を明記するか、切り出し済みの題は skip する guard を入れる。

### ⑨ (継続)

- **machdiff の「agent 計上済 field は patch を外して評価」改修**: 本 unit では `q100` ×4 (句点の付加 = `current_text` が是正後の接頭辞) で再発。U6 `q011` と同根。
- **非出荷の expl_jp key_guard note**: `q066` note は腐敗値「109mAh」を正と断定 (§10)。非出荷だが、将来 note を出荷層に上げるなら要是正。
- **N5 の「字が変わる型」の別ランク台帳化**: 本 unit で `q001`「適切かもの」/ `q006`「適切なかもの」が加わる (**6 unit 連続**)。
- **slashed zero 型の横断走査**: U5 (q004 / q075)、U6 (母集団外 q050 figure_description) に続き U7 q066。本文の数値に 9 を含む問の全量抽出 → 源照合を提起。

---

## 12. Rule B (失敗記録)

**本 unit の抄写 run・是正器に失敗 attempt は無し。** run は 1 回で完走 (75/75、UNREADABLE 0)。
是正器は fidfix dry-run → `--apply` の初回で assert-once 違反 0、choicefig は scratchpad での切り出し複製で目視確認 → `--dry-run` → 本適用の初回で成功。
`failures/` への新規追加は**なし**。precrop の頁パリティ skip (§11) は失敗 attempt ではなく入力側の欠陥として ⑨ に記録した。

---

## 13. Rule D

Writer = `u7-fixer` (opus)。**Reviewer は別 `subagent_type` (opus) で本 evidence の後に別途実施すること**
(本ファイルは writer の自己申告であり、Rule D の審査は未了)。

審査時の重点:

1. **§4a q032 の判断 (テキスト忠実化不可 → D-144 段 2)** と切り出し 4 枚の目視 (象限→字母、イ のループ底辺・ウ の左端矢頭・エ の最下段が切れていないこと、題幹・問33 の残渣なし)。
   SPEC `topCut 240 / bottomCut 150` を複合図の行インク帯と照合。WebP 4 枚の実在と A6 通過。解説の書換 0 の妥当性 (旧注記を論拠にした箇所が無いこと)。
2. **§4b q066** — 源の 3 箇所が 100 であること (slashed zero)、解説の派生値 50 / 200mA、**distractor イ の論拠書換** (置換でなく意味の書換) の妥当性と zh / en の同義性。
3. **§4c q018** — ウ の「大量生産品の更なる低コストでの製造」と zh / en の新訳、ア の zh「短交期」/ en "with short delivery times" の訳語選択。
4. **§4d q015** — 「 .」を染みとした画素計測 (2×3px / 5 画素 / 輝度 150 vs 実在の句点 8×7px / 37 画素 / 輝度 90)。
5. **§3 machdiff 実残差 4** (q001 / q017 イ / q018 ウ・エ) と偽陽性 5 (q006 の transcript 截断 / q032 の [図] 接頭辞) の線引き。
6. **§2 severity 再分類** (agent 19/10/3 → fixer 20/13/3、machdiff 4 件込み)、特に `q014 エ` / `q077 エ` を cosmetic に移した点と `q032 ア` を cosmetic のままとした点。
7. **§7 key_guard note 14 件** — 対象選定 (追記しない 5 件) と q032 の D-144 段 2 note。
8. **§4i q022 ウ** — 脱落 1 箇所の復元に合わせて同じ列挙内の読点字種・空白も揃えた点 (1 field 内)。
9. **§11 precrop 頁パリティ** の測定 (偶数ページ見出し x 166〜175、許容 [136,168]、page-19 の左余白の汚れ) の再現。
10. **§9 e2e 未実行** の扱い (prod 向け構成のため push 後に確認)。
11. 適用ループが U6 から逐字流用 (ラベル 1 語のみ差) であること。

---

## 14. Rule D 独立審閲 (S125 U7、reviewer pr-review-toolkit:code-reviewer opus)

Writer = `u7-fixer` (`oh-my-claudecode:executor` opus)、Reviewer = 本節 (`pr-review-toolkit:code-reviewer` opus、別 type・別 context)。
データ・資産・脚本は**一切変更していない** (本節の追記のみ)。書込みを伴う再生成 (build-quiz-corpus / phase2-merge / `--apply` / choicefig 本実行 / prep-any) は実行していない。
源は `data/ip/exams/pages/2022r04/page-NN.png` (1432×2026) から **reviewer 自身が sharp で切り出し** (scratchpad `rv/`、0.6 倍の全頁 + 要所 2〜3 倍) て実読した。fixer の precrop・scratchpad 画像は使っていない。

**判定: PASS-with-notes — MAJOR 0 / MINOR 0 / NIT 4。データ修正は不要。**

### 14a. 採用 36 差分の源実読 — 36/36 支持

| 頁 | 実読した field | 結果 |
|---|---|---|
| p02 | q001 stem (見出し「問1」は左の独立見出し、本文は「著作権及び特許権に関する記述 a〜c のうち，」) | 支持 |
| p06 | q012 stem「…違いによって，/ 貸付型，…」 | 支持 |
| p07 | q014 ウ「一定期間ソフトウェアの」/ エ「…と，契約は成立する。」で終わる | 支持 |
| p08 | q015 エ「業務で必要となる人の役割」+ 右下の微小点 (14b) | 支持 |
| p09 | q017 ア・エ「業務中に私的に」/ イ「業務で使用する」、q018 ア「短納期での / 提供」/ ウ「大量生産品の更なる低コス / トでの製造」/ エ「動力の電力や石油」 | 支持 |
| p11 | q022 ウ「調達，開発，製造，販売，サービス」、q023 ウ「進めていたが，/ 決済の」 | 支持 |
| p13 | q027 stem “要配慮個人情報” (欧文二重引用符) | 支持 |
| p15 | q032 (14c) | 支持 |
| p17 | q036 ア「成果物を定義するので」 | 支持 |
| p19 | q040 イ「作業項目の一つ一つを」 | 支持 |
| p21 | q047 エ「システム開発期 / 間中に」 | 支持 |
| p30 | q066 stem“100mAh” / ア 100mA / イ 100分間 / ウ・エ 100分間 (2 倍拡大で 0 はすべて斜線入り、9 ではない) | 支持 |
| p32 | q071 イ「句読点や閉じ括弧が」 | 支持 |
| p33 | q073 ア IPv4 / イ IPv5 / ウ IPv6 / エ IPv8 (「T」なし) | 支持 |
| p34 | q077 ア「索引を用意する」/ エ「…防ぐこと / ができる。」で終わる (問77 が頁最下段) | 支持 |
| p40 | q089 ウ「任意の文字列にハイパリンクを」(「ハイパリンク」は源どおり) | 支持 |
| p45 | q100 ア〜エ 4 肢とも「…する。」で終わる | 支持 |

機械照合 (patch を使わない): agent `source_transcript` と**是正後の表示テキスト** (stem は `stem_jp_clean` 優先、選択肢は raw) を NFKC + 空白除去 + 読点・句点字種統一で比較 → **36 中 EQ 32 / DIFF 4 (= q032 ア〜エ、意図的に「図L」)**。machdiff 由来 4 件 (q001 / q017 イ / q018 ウ・エ) も EQ。

### 14b. q015 エ の「 .」= 染み — 画素計測を再現

`node rv/cc.cjs page-08.png 600 1060 100 70 170` → 役割の右下に **(628,1091) 2×3px・5 画素・平均輝度 150**。
同頁の実在の句点 (問16 ア「付与される。」) を `cc.cjs page-08.png 960 1000 110 400 170` で取ると **(999,1361) 8×7px・37 画素・平均輝度 90**。
§4d の数値と**完全一致**。3 倍拡大でも活字の句点形状ではない → 除去は妥当 (正解肢だが記号の除去のみ)。

### 14c. q032 — D-144 段 2 の妥当性と切り出し画素検証

- **判断**: 源 p15 の 4 肢は図のみ (ア 直列 / イ 製作矢印の途中から下→左→工程図矢印の途中へ上向きに戻る手戻りループ / ウ 製作末端から仕様始端へ戻る全体ループ / エ 階段状の重複)。
  是正前テキストの「（一部並行）」「（全工程並行）」はループを並行と誤記、エ「↓ …（縦列）」は重複を逐次に見せており、en エ は「proceed in parallel (overlapping)」で答えを書いていた。
  テキストで忠実に書けば正解の特徴 (重複) を書くことになる → **テキスト忠実化不能・choice_figures 化は妥当** (U3a `2018h30h-q005` と同型)。
- **SPEC の根拠**: 複合図 1432×892 の行インク帯 (grey<160、`rv/comp.cjs`) = `[90-116][145-171][201-226]` (題幹 3 行) / `298-677` (図) / `[815-840][870-891]` (問33 2 行)。
  topCut 240・bottomCut 150 (残り 240..742) は図を全包含し題幹・問33 を 1 画素も含まない。脚本コメントの数値と一致。
- **過不足なし (画素保存)**: 切り出し帯 240..742 のインク画素 **18,813** = cA 4,000 + cB 4,663 + cC 5,892 + cD 4,258 = **18,813** (完全一致 → 失われたインク 0・余分 0)。
  各 crop の ink bbox は 14px 余白の内側 (`rv/edge.cjs`、辺接触 0)。4 枚を並べた目視 (`rv/webp4.png`) で cA=ア 直列 / cB=イ ループ底辺まで / cC=ウ 左端の上向き矢頭まで / cD=エ 最下段「製作」まで、字母も一致。
- WebP 4 枚の寸法 = PNG 寸法 (507×91 / 502×136 / 501×133 / 407×247)。旧 `2022r04-q032.webp` の削除は既存 5 題と同挙動。
- **データ**: questions.json は `figure: null` + `choice_figures {ア:…-cA … エ:…-cD}`、choices_jp「図L」。bank / by_year は `choice_figure_paths` / `figure_path: null` / `composite_figure_path_retired` / `choices_text_retired` (旧 4 肢保存) 揃い。sidecar・`.phase1` zh「图L」/ en「Figure L」。**zh / en の答え漏れは消滅** (stem zh / en は中立)。
- **UI パス**: `apps/web/src/components/quiz/QuizSet.tsx:100` → `QuizRichText.tsx:87` の `/quiz-figures/${figure}.webp` → `public/quiz-figures/2022r04-q032-c{A..D}.webp` が実在。middleware は `quiz-figures/` を除外済。
- **解説書換 0 は妥当**: correct「図エは…階段状にずらして…後続作業が前の作業の途中から開始」、イ「工程図と製作の間に…下へ折り返す戻りループ」、ウ「末尾（製作）から先頭（仕様）へ大きく戻る矢印」はいずれも図の実像と一致。旧注記 (一部並行 / 全工程並行 / 縦列) は出荷解説 (key_guard 以外) に 0 件。
- crosscheck A6 通過 (14h)。

### 14d. q066 — 数値と解説書換

- 源 3 箇所が 100 であることを 2 倍拡大で確認 (14a)。解説の派生値 50mA / 200mA (100 の半分・2 倍) は正しい。ウ「1667mAh は 100mAh と一桁以上違う」も是正後に成立。
- distractor イ の論拠書換: 旧「190 も 109mAh から導けない」は是正後に偽になるため書換は必要で、新論拠「100分間の充電は容量の定義に含まれない / 100 は充電時間ではない」は**正しく、答えの導出にも影響なし**。zh / en は jp と同義で、選択肢の zh「充电 100 分钟后」/ en "after charging for 100 minutes" と字句一致。
  → **NIT-1** (下記) のみ。

### 14e. zh / en

- q018 ア zh「短交期」/ en "with short delivery times": 納期 = 交期 / delivery time で源の語義に合い、解説 correct (「短交付周期」/ "short delivery time") とも整合。ウ zh「以更低的成本制造大批量生产的产品」/ en "Manufacturing mass-produced goods at even lower cost…" は源「大量生産品の更なる低コストでの製造」の忠実訳。
- q066 zh / en の stem・ア・イ は 100、解説 3 言語とも 109 / 190 / 199 / 55 / 218 の残存 0 (grep、key_guard 除く)。
- q001 zh / en の「问1 」「Q1 」除去を確認。

### 14f. q022 読点 / severity 再分類

- q022 ウ: 源は 4 読点の列挙。1 field 内で脱落 1 の復元と既存読点の house rule「, 」統一を同時に行ったのは D-147 §1 の範囲内で語は不変 → 受容。
- severity (cosmetic 13 / semantic 20 / aa 3): q014 エ・q077 エ を「完結文の後ろのごみ」として cosmetic に移したのは U6 `q010 エ` の規則と整合。q017 イ「に→で」を semantic としたのは「語の置換」規則どおり。q032 ア を cosmetic のまま (注記「（直列）」は図と一致) とした点は、4 肢一体で図化された経緯からは aa とも言えるが、規則上 fixer の判断を受容。

### 14g. key_guard note 14 件 (D-143)

`.phase2/generate_result_2022r04.json` を適用前控え (`scratchpad/u7/pre/phase2/`) と機械照合: final `note_jp` 変化 **14** (q014 q015 q017 q018 q032 q036 q040 q047 q066 q071 q073 q077 q089 q100)、**純粋後置 14/14**、`key_guard_round1` 変化 **0 / 100**、note 以外の key_guard・suspect 変化 0。
出荷 `explanations/2022r04.json` の `round1` ブロックは HEAD 0 → 14 (final ≠ round1 による D-143 の publish 挙動、U5 / U6 と同じ)。追記しない 5 件 (q001 / q012 / q027 / q022 / q023) の選定も妥当。note の文面は源実読と一致。

### 14h. 波及ゼロ

| 検査 | 結果 |
|---|---|
| `question_bank.json` / `by_year/2022r04.json` (適用前控えと全 2900 / 100 問照合) | 変化は**正確に 17 題** (§6 の 19 題 − clean のみの q012 / q027)、変化 key は choices_jp / stem_jp と q032 の図 5 key のみ |
| `.phase1` | 変化 6 本 (q001 / q012 / q018 / q027 / q032 / q066)、他は `cmp` 同一 |
| `.phase2` | 変化 = expl_{jp,tr}_{q014,q066} 4 本 + generate_result のみ |
| `correct_answer` | `git diff -U0 data \| grep -c '"correct_answer"'` = **0** |
| `answer_keys.json` | md5 `6802bb0bc13004da78ad3c4e5117d997` (§2 と一致)、mtime Sep 5 (本 session 以前)。**本ファイルは git 管理外**なので `git show HEAD:` では比較できない (NIT-4) |
| 他 exam の translations / explanations | `git diff --stat` 上 0 |
| 2022r04 `choices_jp_clean` | **0 題** (sidecar 全 100 題を走査) → 選択肢是正はすべて出荷層、§7 の記述どおり |
| choicefig 改修の非干渉 | 既存 4 題 `--dry-run --only` で applied 0。他題の `-c*.png` mtime は Sep 7 / Sep 8 のまま (本 session で再生成されていない)。`--only` 無し dry-run は **HEAD 版 (git show で一時複製して実行・即削除) でも現行版でも同じ箇所 (cropChoices) で throw** → 既存状態であり本 unit 起因ではない (§11 ⑨ 支持) |

### 14i. CLEAN 標本 (fixer の q025 / q075 / q002 と重ならない 4 問、うち crop 無し 2 問)

| id | 源 | 結果 |
|---|---|---|
| `q013` (p07、crop 有) | 題幹「情報公開法に基づいて公開請求…」+ 4 肢 立法 / 司法 / 社内 / 行政文書 | 一致 |
| `q016` (p08、**crop 無し**) | 題幹「マイナンバーに関する説明のうち，…」+ 4 肢 | 一致 |
| `q037` (p17、crop 有) | 題幹 + 処理記述 3 文 + 4 肢 | 一致 |
| `q041` (p19、**crop 無し**) | 題幹 3 行 + 4 肢 (グリーン IT / サージ防護 / 無線 LAN ルータ / 無停電電源装置) | 一致 (英字周囲の空白のみ) |

→ **見落とし 0**。

### 14j. §11 precrop 頁パリティの再現

`rv/cc.cjs` (grey<150、x120–200) で見出し最左インク: **偶数 p08 = 169**、奇数 p07 = 154 / p09 = 156 / p11 = 152。
page-19 の問40 行に **(30,217) 2×2px・4 画素** の孤立点、見出し「問40」は x=154。§11 の測定と整合。

### 14k. ゲート再実行 (reviewer 実行)

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran / all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ SPLIT_FIGURE 0 / (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 (`? 2015h27h-mqC / mqD` は既存情報行) |
| `pnpm -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm -C apps/web exec vitest run` | ✅ 33 passed / 1 skipped (34 files)、501 passed / 2 skipped (503) |
| machdiff (事前 manifest) | ✅ same=366 / AGENT_MISSED 9 / VERDICT_CONFLICT 0 / coverage 75/75 — §3 と逐一同一 |
| `node scripts/quiz-fidfix-S125-u7.mjs` (既定 dry-run) | ✅ applied 0 / skipped 165 |
| `node scripts/quiz-choicefig-D144s2.mjs --dry-run --only 2022r04-q032` | ✅ applied 0、4 crop 寸法一致 |
| 適用ループの由来 | ✅ `diff` で U6 の「── 適用」以降と U7 の同区間の差は最終 console.log のラベル `u6`→`u7` の 1 行のみ |

事後 machdiff (u7post manifest の再生成) は prep-any が `.phase2` に書くため**実行していない**。代わりに 14a の transcript↔是正後表示の直接照合 (EQ 32 / 意図的 DIFF 4) で代替した。

### 14l. 指摘

- **NIT-1 (q066 解説イの表現)**: 「100mAh の「100」は電流 (mA) の値であり」は簡略化で、厳密には 100 は容量 (mA×h) の数値 (1 時間放電なら 100mA に相当)。correct 解説が「100mA の電流を1時間流し続けられる容量」「電流と放電時間は反比例」と正しく述べているので学習上の誤導は小さく、**修正不要**。将来書き換える機会があれば「1 時間で放電する場合の電流値であり」とするのが正確。
- **NIT-2 (§11 ⑨「zh / en の見出し混入」の記述精度 + 走査結果)**: §11 の「U3b / U6 の見出し混入は jp のみ」は**不正確**。sidecar 全 29 exam を `"问\d+ ` / `"Q\d+ ` で走査すると
  **`2019h31h-q001` の zh「问1 …」/ en「Q1 …」が出荷層に残存** (U3b は jp のみ是正、zh / en 未追随) し、ほかに **`2015h27a-q089`** (raw・clean「問89 …」+ zh「问89」/ en「Q89」、未 sweep exam) がある。
  いずれも U7 の範囲外で本 unit のデータ修正は不要だが、⑨ の提起に上記 2 題を具体 ID として追加し、2019h31h-q001 zh / en は後続で是正するのがよい。
- **NIT-3 (sidecar ↔ `.phase1` の既存乖離)**: 2022r04 の sidecar と `.phase1` を全 100 題照合すると **21 field が不一致** (q011 / q015 / q043 / q057 / q060 / q065 / q072 / q078 / q079 / q088 / q090 / q092 / q097 / q098)。
  すべて**適用前から**の乖離で、U7 が触った 6 本には無い。うち `q043` .phase1 zh「29名」(sidecar「20名」)・`q092` ウ .phase1 zh / en「3.6」(sidecar「3.0」) は slashed zero 型の旧値が `.phase1` にだけ残っているもの。
  再 merge 禁止 (S117 §10a) の理由の再確認であり、§11 の「slashed zero 横断走査」に `.phase1` 側の残存として記録を推奨。
- **NIT-4 (evidence 記述精度)**: §2 / §9 の「`answer_keys.json` バイト不変」は git 管理外ファイルなので、根拠は md5 値と mtime (Sep 5) であって `git diff` ではない旨を 1 行添えるとよい。

### 14m. 再現コマンド

```
S=<scratchpad>/rv ; P=data/ip/exams/pages/2022r04
node $S/crop.cjs $P/page-NN.png out.png <left> <top> <w> <h> [scale]      # 源の自前切り出し
node $S/comp.cjs                                                           # q032 複合図の行インク帯・帯内インク 18,813
node $S/edge.cjs data/ip/exams/figures/2022r04-q032-c{A,B,C,D}.png         # crop のインク数・bbox・辺接触
node $S/cc.cjs $P/page-08.png 600 1060 100 70 170                          # q015 の点 2×3/5px/輝度150
node $S/cc.cjs $P/page-08.png 960 1000 110 400 170                         # 実在句点 8×7/37px/輝度90
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u7_fidelity_input_2022r04.json \
  evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u7_2022r04_sn.json
node scripts/quiz-keys-crosscheck.mjs ; node scripts/quiz-pagefix-derive-groups.mjs --assert-clean
node scripts/quiz-chumon-groups-build.mjs --check ; node scripts/quiz-fidfix-S125-u7.mjs
node scripts/quiz-choicefig-D144s2.mjs --dry-run --only 2022r04-q032
pnpm -C apps/web exec tsc --noEmit ; pnpm -C apps/web exec vitest run
grep -o '"\(zh\|en\)": "\(问[0-9]\+ \|Q[0-9]\+ \)[^"]\{0,20\}' data/ip/quiz/translations/*.json   # NIT-2
```

### 14n. 結論

採用 36 差分はすべて源どおり、q032 の D-144 段 2 化は判断・切り出し (画素保存 18,813 = 18,813)・データ・UI パス・解説とも妥当、
q066 の数値・解説書換は正しく、key_guard 14 件は D-143 準拠、波及ゼロとゲート全緑を独立に再現した。**MAJOR 0 / MINOR 0 / NIT 4、U7 のデータ修正は不要** — commit 可。
NIT-2 の `2019h31h-q001` zh / en 見出し残存は U3b の取りこぼしで、U7 とは別に後続で是正を推奨。

## 15. NIT 処置 (主 context、S125)
- NIT-1: q066 解説イ「100 は電流の値」の簡略表現 — 修正不要 (reviewer 判断に同意)、記録のみ。
- NIT-2: §11「U3b / U6 の見出し混入は jp のみ」は不正確 — **`2019h31h-q001` zh「问1」/ en「Q1」が出荷層に残存 (U3b で zh/en 未追随)、`2015h27a-q089` にも同型**。本 unit 範囲外のため ⑨ 優先項として登記 (session log §12、STATE 次セッション)。
- NIT-3: sidecar ↔ .phase1 乖離 21 field (全て適用前から既存)。うち q043「29名」/ q092「3.6」は斜線ゼロ旧値が .phase1 のみに残る — 出荷層 (sidecar) は正、⑨-c 登記。
- NIT-4: `answer_keys.json` は git 管理外。「バイト不変」の根拠は md5 + mtime 比較である。
