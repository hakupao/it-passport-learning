# ⑤-2 全量保真掃引 U5 — 2020r02o の集計と是正 (S125)

⑤-2 全量核験の **U5** (`docs/phase5/PLAN_52_units.md` §2、D-146 第 7 unit)。母数は
`evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json` の 2020r02o
(総 100 問 − excluded 40 [stage5_3_stratified 18 / s7x_A 20 / 両方 2]) = **60 問**。
**Sonnet 5 単 pass** (U1 で PASS、U3a / U3b / U4 で本番適用済) を継続適用した 4 回目の本番 unit。

> **母数の訂正**: PLAN §0 の「73 問」は誤り (S125 log §0)。population の実数は **60 問**。

---

## 1. 入力と実行

- run: `wf_4c528418-96c` (label `u5`、pass `sn`、model = **Sonnet 5**、agent_type general-purpose)
- マニフェスト: `data/ip/quiz/.phase2/u5_fidelity_input_2020r02o.json` (`--precrop` 版、crop **59/60**、`prev_page_png` 60/60)
  - `page-03` のみ `detected 1 / expected 2` で安全側 skip → **`q004` は crop 無し = 源ページ直読**
  - precrop calib: `head=140` (votes 140=44p / 180=2p / 170=1p)
- 結果 JSON: `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u5_2020r02o_sn.json`
- **覆盖 60/60 / UNREADABLE 0 / agents_error 0**、merge-parts `--journal`: journal 60 / part 壊れ 0
- 是正器: `scripts/quiz-fidfix-S125-u5.mjs` (assert-once / 冪等 / **既定 = dry-run、`--apply` で書込み**)

### Sonnet 単 pass の実測 (U1 / U3a / U3b / U4 との対照)

| 項目 | U1 (2015h27a 68 問) | U3a (2018h30h 70 問) | U3b (2019h31h 87 問) | U4 (2019r01a 52 問) | **U5 (2020r02o 60 問)** |
|---|---|---|---|---|---|
| token | 4,030,000 | 4,249,378 | 5,167,455 | 3,120,259 | **3,877,830** |
| token / 問 | 59,265 | 60,705 | 59,396 | 60,005 | **64,631** |
| 時間 | 15 分 | 26.2 分 | 16.2 分 | 8.8 分 | **9.3 分** |
| tool 呼び出し | — | 601 (8.6 回/問) | 698 (8.0 回/問) | 430 (8.3 回/問) | **561 (9.4 回/問)** |
| part 壊れ | 2/68 → journal 復元 | 2/70 → journal 復元 | 1/87 → journal 復元 | 0/52 | **0/60** |
| UNREADABLE | 0 | 0 | 0 | 0 | **0** |

> token/問 が初めて 60k 帯を外れた (+7.7%、U4 比)。tool/問も 9.4 で最多。DISCREPANT 15 (25%) と差分が多く、
> agent が差分ごとに crop を再拡大した分と見るのが自然 (差分 24 件 = U4 の 6 倍)。申告 ≈ 360 万はやや超過。

---

## 2. 率

| exam | n | agent DISCREPANT | 率 | +machdiff | 計上 (率) | **是正** (率) | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|---|---|---|
| 2020r02o | 60 | **15** | 25.0% | **+0** | 15 (**25.0%**) | **15 (25.0%)** | **4** | **0** |

- agent DISCREPANT 15 題 / 24 差分は**全件採用**。非採用 0 / machdiff 由来の追加 0 → **計上 15 = 是正 15**。
- **severity 内訳 (fixer 再分類、24 論理差分)**: semantic **14** / cosmetic **10** / answer_affecting **0**。
  agent の `bySeverity` {semantic 18, cosmetic 6} から、**記号のみの差分 4 件を cosmetic に移した**
  (`q045` 読点脱落 = S124 U4 precedent / `q054 イ`「_ 」混入 / `q026 エ`「、 」混入 / `q023 エ` 末尾ノンブル混入)。
  字・数字が変わるものはすべて semantic に残した (`q054 ウ`「テストエ工程」は字の挿入で U3b `q037`「な」と同型)。
- **正解肢上 4** = `q006` ア (引用符字種、cosmetic) / `q054` イ (記号混入、cosmetic) / `q089` ア (ピリオド混入、cosmetic) /
  `q100` ア (「相手方」→「相手」、semantic)。**`correct_answer` はいずれも不変**。
- `correct_answer` 変更 **0 / 2900**、`data/ip/exams/answer_keys.json` **バイト不変** (md5 `6802bb0b…` 前後同一)。

### 既往波との比較

| | 標本 | 計上 | 率 | 正解肢上 | answer_affecting | 抄写 model |
|---|---|---|---|---|---|---|
| ⑤-3 (層化抽検 4 exam × 20) | 80 | 14 | 17.5% | 5 | 1 | Opus 双 pass |
| 波 1 (2015h27a + 2016h28a) | 152 | 13 | 8.6% | 3 | 1 | Opus 双 pass |
| 波 2 (2016h28h + 2017h29a) | 158 | 15 | 9.5% | 3 | 0 | Opus 双 pass |
| 波 3 (2017h29h + 2018h30a) | 152 | 12 | 7.9% | 0 | 1 | Opus 双 pass |
| U3a (2018h30h) | 70 | 8 | 11.4% | 2 | 1 | Sonnet 単 pass |
| U3b (2019h31h) | 87 | 9 | 10.3% | 1 | 0 | Sonnet 単 pass |
| U4 (2019r01a) | 52 | 4 | 7.7% | 1 | 0 | Sonnet 単 pass |
| **U5 (2020r02o)** | **60** | **15** | **25.0%** | **4** | **0** | **Sonnet 単 pass** |
| **累計 (波 1–3 + U3a + U3b + U4 + U5)** | **731** | **76** | **10.4%** | **14** | **3** | — |

**U5 の 25.0% は全 unit で最高** (⑤-3 の 17.5% も超える)。内訳は **OCR 誤字が支配的**で、
`部→都` / `頻→問` / `炎→災` / `盗→読` / 染み→濁点 / ノンブル混入 / ラベル字「エ」の混入、そして
**斜線入りゼロ (slashed zero) の 9・6 誤読** (`q004` / `q075`) が並ぶ。U4 の「区切り脱落 3 + 誤字 1」とは型が違い、
U4 §2 の所見「exam ごとに支配的な腐敗型が違う」を強く再確認した。2020r02o の源 PDF は他 exam より
スキャンの染み・かすれが多く (page-11 / page-35 など紙面全体に斑点)、OCR 誤りの母地が大きいと見られる。

---

## 3. 機械 diff (machdiff) — **AGENT_MISSED 7 = 既知型偽陽性 7 / 実残差 0**

```
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u5_fidelity_input_2020r02o.json \
  evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u5_2020r02o_sn.json
machdiff: fields same=293 | AGENT_MISSED=7 | VERDICT_CONFLICT=0 | audits w/o transcript=0 | UNREADABLE skipped=0 | coverage 60/60
```

主 context の「MISSED 7 は偽陽性」判定を**源実読で独立に確認した — 一致**。

| id.field | 件数 | machdiff の差 | 源実読 | 判定 |
|---|---|---|---|---|
| `q001` ア〜エ | 4 | disp `a：RFI　b：RFP` が a/b 組に分解できず `a=RFIb:RFP / b=∅` | 源は a / b 2 列の**表** (p02 crop)。dataset の「a：RFI　b：RFP」は 4 行とも表の内容と一致 | **表型選択肢の一行化 = 既知型偽陽性** (U3b §3 と同型) |
| `q011` ア・ウ・エ | 3 | 括弧内の言い換え (「単方向,双方向矢印なし」vs「単方向の矢印,…」等) と矢印の列挙順 | 源の選択肢は **DFD 図 4 枚** (p06 crop)。dataset は図を矢印の列で文章化 (D-141 型)。**4 肢とも矢印の向き・端点が図と一致**することを 1 本ずつ確認 (ア: 来店客リスト→受付 / 受付→座席案内 / 座席案内→空席状況 …) | **図の言語化の言い換え = 偽陽性**。ただし ⑨ に別件登記 (§11: エの括弧書きが答えを示唆) |

- **実残差 0** → PLAN §2 の停止条件「machdiff 残差 > 3 (既知型偽陽性除外)」に非該当。
- machdiff 由来の新規是正 **0 件**。

---

## 4. 裁定 (fixer が源を原寸〜16 倍で独立実読)

実読した源: `data/ip/quiz/.phase2/precrop/2020r02o/` の **q006 / q016 / q022 / q023 / q026 / q045 / q049 / q054 / q068 /
q075 / q078 / q085 / q089 / q100** (+ 偽陽性確認の q001 / q011)、および **crop を持たない `q004` は
源ページ `data/ip/exams/pages/2020r02o/page-03.png` (1432×2026) を直読**。拡大は PIL lanczos (scratchpad、repo 外)。
agent の `source_text` は候補として扱い、**すべて自分の目で読んでから** from/to を決めた。**採用 24 / 非採用 0**。

### 4a. `q004` stem — 「過去19年間」×2 → 源「過去10年間」×2 (**semantic・数値、crop 無し → 源ページ直読**)

- page-03 を原寸で全面確認後、該当 2 箇所 (1 行目末「過去10年間にわたる」/ 3 行目頭「10年間の気象データ」) を **4 倍**で実読。
  **源の「0」は斜線入りゼロ** (楕円の中に斜線) で、OCR が 9 と読んだ。2 箇所とも「10」で確定。
- 腐敗は **raw 3 層・clean 2 層・zh / en stem・解説 (correct / distractor エ の jp・zh・en)** まで全層に「19」が伝播していた。
  → 全層を 10 に是正 (§6)。解説の論旨 (大量データの相関分析 → AI) は期間に依存せず不変。
- 同じ slashed zero 型が `q075` にもある (§4j)。**⑨ に横断走査を提起** (§11)。

### 4b. `q006` choice.ア・イ — ASCII 直引用符 → 源 `“ ”` (**cosmetic、ア は正解肢**)

- p04 crop 原寸で ア の 4 対 (`“財務の視点”` `“顧客の視点”` `“業務プロセスの視点”` `“成長と学習の視点”`) と イ の `“価値”` を確認。
  いずれも開き 66 形 / 閉じ 99 形の欧文二重引用符。dataset は ASCII `"` (U+0022)。
- **採用根拠と S115 との関係 (Rule D 向け)**: S115 `quiz-fidfix-S115-2010h22a.mjs:29` は ASCII 引用符を
  「corpus に 139 問分布する横断的な正規化課題、本 exam だけ直すと不整合が増える」として見送った。
  一方で S119 以降の抄写 prompt は「引用符字種置換も計上」と規定し、U3a `2018h30h-q001` / U3b `2019h31h-q007` は
  「agent 計上 + 源で字形確定 → 是正」、S114 `2011h23tokubetsu-q003` は ASCII → 全角を是正している。**ASCII → `“ ”` の直接の precedent はこの S114 q003 (clean 層) のみ**で (U3a q001 / U3b q007 は `「」`→`“ ”`)、本件は ⑤-2 で初の raw 選択肢層 ASCII 是正にあたる (Rule D NIT-3)。
  本 unit は **agent が計上し、源で字形が原寸確定する**ので後者の線引き (S118 §41) に従った。
  corpus 実測 (`questions.json` の stem_jp + choices_jp) は ASCII `"` を含む field が是正前 **174** → 是正後 **172**、
  `“”` を含む field が **108** → **110** (q006 ア・イ の 2 field が移った)。横断正規化は引き続き ⑨ 課題。
- 同一肢に ASCII `"` が 8 個あるので**対ごとに置換** (assert-once)。zh / en の ASCII 引用符は ⑨-c 保留で不変。

### 4c. `q016` stem — clean 層「斬新な発想」→ 源「斬新的な発想」 (**semantic、clean のみ**)

- 指示の要注意点「agent の読み違いの可能性」を高倍率で確認: p09 crop の b 行を **5 倍**で実読 →
  「斬新**的**な発想で創作されたデザイン」。**agent の読みが正しい** (「的」は明瞭)。
- **raw `stem_jp` は既に「斬新的な」**で正。腐敗は clean 層 (sidecar + `.phase1`) のみ → raw 3 層は assert-once の n=0 で skip。
  zh「新颖构思」/ en "novel idea" は「的」の有無で訳が変わらず不変。

### 4d. `q022` choice.ア — 「上顔」「解除ずる」 (**semantic × 2**)

- p11 crop を原寸 → 5 倍: 「カメラの前に立っている人の**顔**を認識し, ドアのロックを解除**す**る。」源に「上」は無い。
- **「ず」の判定 (S123 `q084` 型の画素計測)**: 5 倍では「す」の右肩に濁点様の印が見える。二値化画素マップで確認すると、
  印は **y 283〜286 / x 469〜471 の単一の 3×4px 塊**。同 crop の実在濁点 (選択肢ア 1 行目末「ド」、y 231〜236) は
  **斜めの 2 画が並ぶ**形で、塊の数も形も違う → **紙面の染み**と判定。源は「解除する」。
- 2 差分は同一 field の別箇所で、**重複計上ではない** (`q023` エも同様)。zh「识别…脸部，解除门锁」/ en は既に忠実。

### 4e. `q023` choice.エ — 「経営企画都門」+ 末尾「一 ll 一」 (**semantic + cosmetic**)

- p11 crop を 5 倍: 「経営企画**部門**の戦略である。」。末尾の「一 ll 一」(実バイト: U+4E00 / ASCII 空白 / `ll` / ASCII 空白 / U+4E00) は
  **同ページ下端のノンブル「— 11 —」の混入** (crop 下端に「— 11 —」が写っている)。1 置換で両方を是正。
- zh「经营企划部门」/ en "corporate planning department" は既に源の語義。

### 4f. `q026` choice.ア・エ — 「防災品」→ 源「防炎品」/ 「建、 物」→ 源「建物」

- p13 crop を 5 倍: 「燃えやすいものを**防炎**品に取り替え」。「炎」の火 2 つ重ねが明瞭。語義も「燃えにくい加工品」で文脈と整合。
- **zh / en が 防災 を引き継いでいた**: zh「更换为防灾用品」/ en "with fire-resistant disaster-prevention products" →
  zh「更换为阻燃用品」/ en "with flame-retardant products" に追随 (sidecar + `.phase1`)。
- エ: 源は「同規模の建」で行が折れ、次行頭が「物への移転」。**読点は無い** (行送りを読点と誤認した挿入)。
- 解説 distractor ア の「防災 (被害の抑止)」は解説者の**分類語**で、選択肢の語の写しではない → 不変 (§10)。

### 4g. `q045` choice.エ — 読点の脱落 (**cosmetic、S124 §11 で事前登記済の候補**)

- p21 crop 原寸: 「技術的**，**物理的**，**人的**，**組織的な視点」。dataset は 2 個目が空白に落ちていた。
  同一肢の他の 3 読点は `, ` を保持 → 同じ ASCII `", "` (D-147 §1) に揃えた。
- **S124 §11 の「読点脱落型 未監査候補」`2020r02o-q045.エ` はこれで閉じる** (§8d の走査で 2020r02o 残 0)。

### 4h. `q049` choice.ウ — 「問繁」→ 源「頻繁」 (**semantic**)

- p22 crop 原寸: 「**頻繁**に寄せられる質問」。zh「常被问到」/ en "frequently asked" は既に源の語義。

### 4i. `q054` choice.イ・ウ — 「プロジェクト_ 」/「テストエ工程」 (**イ は正解肢**)

- p25 crop 原寸: イ は「…プロジェクト」で行が折れ、次行頭が「に予備の期間を設ける。」。**記号は無い**。
  ウ は「テスト工程の遅延防止対策…」で、「エ」は源に無い (選択肢ラベル字の混入)。
- raw `stem_jp` にも「テストエ程」があるが、stem の出荷層 clean は「テスト工程」で正 → N5 (§10)。

### 4j. `q075` choice.ア・イ・エ — 数字列 + URL 内空白

- p35 crop を 3 倍: ア「**00**.00.11.aa.bb.cc」/ イ「**0**50-1234-5678」/ エ「http://www.example.co.jp/」(空白なし)。
  **ここでも源の 0 は斜線入りゼロ**で、OCR が「609」「950」と読んでいた (`q004` と同型)。
- ア / イ は **zh / en choices と解説 distractor (jp・zh・en) が腐敗値をそのまま引用**していた → 全層追随。
  ア の解説の論拠「数値のかたまりが 6 つ」「aa / bb / cc を含む」は源の値でもそのまま成立する。
- エ の zh / en は既に空白なし。

### 4k. `q078` choice.ア — 「TIP 電話」→ 源「IP 電話」 (**semantic**)

- p35 crop 原寸: 「IP 電話を用いた音声通話」。zh「使用 IP 电话」/ en "IP phones" は既に源どおり。
- **解説 distractor ア の末尾「(選択肢の「TIP 電話」は「IP 電話」の表記誤り)」は是正後に偽になる**ため、jp・zh・en の 3 言語から除去。

### 4l. `q068` / `q085` stem — 括弧・引用符の字種 (clean のみ)

- `q068` p31 crop 原寸: 見出しは「**〔**対応**〕**」(亀甲括弧、単独行)。clean は「【対応】」→「〔対応〕」。
  raw は「【対応〕」(左右が不一致) で from と一致せず n=0 skip。zh「【应对措施】」/ en "[Measure]" は ⑨-c 保留。
- `q085` p38 crop 原寸: 「“権限がないので保存できません”」。clean は「「…」」→ `“ ”`。
  raw は「"…”」(開きが ASCII) で n=0 skip。zh / en の「」は ⑨-c 保留 (波 2 `2016h28h-q094` と同じ既知事項)。

### 4m. `q089` choice.ア — 「について.,見直し」 (**正解肢**)

- p40 crop 原寸: 行末「について**，**」のみで、ピリオドは無い → ASCII `", "` に是正。

### 4n. `q100` choice.ア・イ — 「相手方」→ 源「相手」/「読み見」→ 源「盗み見」 (**ア は正解肢**)

- p45 crop 原寸: ア「電子メールが正しい**相手**から送られてきたか」/ イ「途中で**盗み見**られている」。
- イ の解説 jp「途中で読み見られる危険性」も追随して「盗み見られる」に是正。zh「被窃看」/ en "being read" は源の語義。
- ア の解説 correct_jp「本当に正しい相手方から送られたものか」は**解説者自身の文**で選択肢の引用ではない → 不変 (§10)。

### 4o. CLEAN 標本の無作為抽検 (見落としの有無)

CLEAN 判定 45 問から **seed 125 の LCG で 3 問を無作為抽出** (`q029` / `q067` / `q017`) して源と逐字照合した。

| id | 実読結果 |
|---|---|
| `q029` (p14) | 題幹 (3 行) と 4 肢 `ROA` / `RPA` / `SFA` / `SOA` が一致。読点 2 個も健在 |
| `q067` (p30) | 題幹と 4 肢 (長文 3 + 短文 1) が一致。差は英数字周囲の空白のみ (許容揺れ) |
| `q017` (p09) | 題幹 2 行 (改行位置も一致) と 4 肢 `M&A` / `クロスライセンス` / `ジョイントベンチャ` / `スピンオフ` が一致 |

→ **見落とし 0**。

---

## 5. SOURCE_TYPOS

本 unit では**該当なし** (源が誤っていて dataset が正しい型は 0 件)。

---

## 6. 採用した差分 (15 題 / 24 論理差分)

| id (page) | field | 差分 | severity | 由来 |
|---|---|---|---|---|
| q004 (p03) | stem | `過去19年間` ×2 → 源 `過去10年間` ×2 (slashed zero)。**crop 無し = 源ページ直読** | **semantic** | agent |
| q006 (p04) | choice.ア | ASCII `"…"` ×4 対 → 源 `“…”`。**ア は正解肢** | cosmetic | agent |
| q006 (p04) | choice.イ | ASCII `"価値"` → 源 `“価値”` | cosmetic | agent |
| q016 (p09) | stem (clean) | `斬新な発想` → 源 `斬新的な発想` | **semantic** | agent |
| q022 (p11) | choice.ア | `人の上顔` → 源 `人の顔` | **semantic** | agent |
| q022 (p11) | choice.ア | `解除ずる` → 源 `解除する` (染みを濁点と誤読) | **semantic** | agent |
| q023 (p11) | choice.エ | `経営企画都門` → 源 `経営企画部門` | **semantic** | agent |
| q023 (p11) | choice.エ | 末尾 `一 ll 一` (ノンブル混入) → 除去 | cosmetic | agent |
| q026 (p13) | choice.ア | `防災品` → 源 `防炎品` (zh / en も追随) | **semantic** | agent |
| q026 (p13) | choice.エ | `建、 物` → 源 `建物` | cosmetic | agent |
| q045 (p21) | choice.エ | `物理的␣人的` → 源 `物理的，人的` (読点脱落) | cosmetic | agent |
| q049 (p22) | choice.ウ | `問繁` → 源 `頻繁` | **semantic** | agent |
| q054 (p25) | choice.イ | `プロジェクト_␣に` → 源 `プロジェクトに`。**イ は正解肢** | cosmetic | agent |
| q054 (p25) | choice.ウ | `テストエ工程` → 源 `テスト工程` | **semantic** | agent |
| q068 (p31) | stem (clean) | `【対応】` → 源 `〔対応〕` | cosmetic | agent |
| q075 (p35) | choice.ア | `609.00.11.aa.bb.cc` → 源 `00.00.11.aa.bb.cc` (zh / en / 解説も追随) | **semantic** | agent |
| q075 (p35) | choice.イ | `950-1234-5678` → 源 `050-1234-5678` (zh / en / 解説も追随) | **semantic** | agent |
| q075 (p35) | choice.エ | `http://www.␣example.co.jp/` → 空白除去 | cosmetic | agent |
| q078 (p35) | choice.ア | `TIP 電話` → 源 `IP 電話` (解説の「表記誤り」注記を除去) | **semantic** | agent |
| q085 (p38) | stem (clean) | `「権限…」` → 源 `“権限…”` | cosmetic | agent |
| q089 (p40) | choice.ア | `について.,見直し` → 源 `について，見直し`。**ア は正解肢** | cosmetic | agent |
| q100 (p45) | choice.ア | `相手方` → 源 `相手`。**ア は正解肢** | **semantic** | agent |
| q100 (p45) | choice.イ | `読み見られている` → 源 `盗み見られている` (解説 jp も追随) | **semantic** | agent |

(`q004` は 2 箇所を 1 行にまとめている。論理差分としては 2 件で、合計 24。)

- jp 読点の字種は house rule の ASCII `", "` (D-147 §1)。

### zh / en の追随

| id | zh | en | 判定 |
|---|---|---|---|
| q004 stem | 「过去 **19** 年间」「过去 **19** 年的气象」 | "past **19** years" ×2 | **追随** (→ 10) |
| q026 ア | 「更换为**防灾**用品」 | "fire-resistant **disaster-prevention** products" | **追随** (→「阻燃用品」/ "flame-retardant products") |
| q075 ア / イ | `609…` / `950…` | 同左 | **追随** (→ 源の値) |
| q022 ア / q023 エ / q049 ウ / q078 ア / q100 ア・イ / q054 / q045 / q089 / q016 | 既に源の語義 (「脸部」「经营企划部门」「常被问到」「IP 电话」「正确的发件方」「被窃看」…) | 同左 | 不変 |
| q006 / q068 / q085 | 引用符・括弧 | 同左 | ⑨-c 保留で不変 |

### 解説の追随 (`.phase2` → merge 再生成)

| id | 箇所 | jp | zh | en |
|---|---|---|---|---|
| q004 | correct / distractor エ | 「19年分」×2 → 10 | 「19 年间」×2 → 10 | "19 years" ×2 → 10 |
| q075 | distractor ア / イ | 腐敗値の引用 ×2 → 源の値 | 同 | 同 |
| q078 | distractor ア | 「(選択肢の「TIP 電話」は…表記誤り)」除去 | 「（选项中的「TIP 电话」…）」除去 | "(the «TIP phone» … )" 除去 |
| q100 | distractor イ | 「読み見られる」→「盗み見られる」 | — (既に「被窃看」) | — |

### 指示から外した点

**なし。** 主 context の要注意 11 項目と結果 JSON の 24 件をすべて源実読で確認し、全件採用した。
指示された「`q016` は agent の読み違いの可能性」は**確認の結果 agent が正しかった** (§4c)。
「`q022` ア / `q023` エ の重複計上」は**重複ではなく同一 field 内の別箇所**だった (§4d / §4e)。
severity の再分類 (§2) は判定の記録であって、是正内容には影響しない。
是正器の既定を `--dry-run` から **dry-run (既定) / `--apply`** に変えたのは S125 指示に従ったもので、適用ループ本体は無変更。

---

## 7. 層と局所性

| 層 | 置換操作数 | 備考 |
|---|---|---|
| raw (`questions.json` / `question_bank.json` / `by_year/2020r02o.json`) | **69** | stem: q004 2 × 3 = 6 / choices: 21 置換 × 3 = 63 |
| sidecar (`translations/2020r02o.json`) | **15** | `stem_jp_clean` 5 (q004 ×2 / q016 / q068 / q085) + zh/en 10 (q004 4 / q075 4 / q026 2) |
| `.phase1/tr_<id>.json` | **15** | sidecar と同一の置換 |
| 解説 `.phase2/expl_{jp,tr}_*.json` | **16** | q004 6 / q075 6 / q078 3 / q100 1 |
| key_guard final note (`.phase2/generate_result_2020r02o.json`) | **12** | D-143: **final のみ**、round1 不可触 |
| **fidfix 合計** | **127** | `quiz-fidfix-S125-u5.mjs` の `applied` と一致 |
| skip (想定どおり) | **9** | q016 / q068 / q085 の raw 3 層 (from と一致しない = clean のみの腐敗)。**無言 guard skip 0** |

### 選択肢に clean 層は無い = **腐敗は学習者に見えていた**

- 2020r02o の sidecar / `.phase1` のキーは `stem` / `choices` / `stem_jp_clean` (一部の題) のみで、
  **`choices_jp_clean` は存在しない** (実測: sidecar 全 100 問のキー集合 = {`stem`, `choices`, `stem_jp_clean`})。
- → **選択肢の 21 置換 (17 field) はすべて出荷層の腐敗**で、学習者に見えていた。
  stem は `q004` (raw + clean の両方が腐敗) / `q016` / `q068` / `q085` (clean のみ) で、いずれも clean が表示層。

### 適用ループの由来 (Rule D 向け)

`quiz-fidfix-S125-u5.mjs` の適用ループ本体・`sub()` は **S122〜S124 で Rule D PASS 済のものを逐字そのまま流用**した
(変更は冒頭の `DRY` 判定 1 行のみ)。本 unit では **stem 分岐 / zh・en 分岐 (stem・choices の両方) / EXPL の distSub・correctSub** が
すべて実行された。**pointSub のみ未実行** (points の書換対象なし)。

### key_guard final note

- **2020r02o の generate_result は final note が 97/100 問で空文字** (非空は q015 / q024 / q025 のみ。本 unit の 15 問はすべて空)。
  U4 の 2019r01a (100/100 が非空) とは状態が違う。
- 対象 **12 件** = 語義・数値 (`q004` `q016` `q022` `q023` `q026` `q049` `q075` `q078` `q100`) + 正解肢命中 (`q006` `q054` `q089`、
  `q100` は両方)。方針は波 2 / 波 3 / U3a / U3b / U4 と同一。**追記しない 3 件** = `q045` (誤答肢の読点のみ) /
  `q068` / `q085` (stem の括弧・引用符のみ)。
- **12 件とも純粋な後置**: 追記前 prefix は空文字 = `key_guard_round1.note_jp` (空文字) と一致。`final.startsWith(round1)` → 12/12 `true`。
  round1 への MARK 混入 **0**、round1 は全 100 問で byte 不変、対象外 88 問の result は byte 不変 (いずれも機械照合)。
- **NOTE_SUB は本 unit では該当なし** (既存 final note が空で、腐敗を現在形で主張する文が無い)。
- merge は final ≠ round1 のため **12 問に `round1` ブロック (note_jp = "") を新規 publish** した。D-143 の設計どおりで、
  U4 §7 の「final note 書換 → round1 併記」と同じ挙動。
- `--apply` 再実行 2 回: **applied 0 / skipped 136** (完全冪等)。

### 出荷されない key_guard note (Rule D 向けの注記)

`.phase2/expl_jp_*.json` の中にも `key_guard.note_jp` があり、`q004`「過去19年間…」/ `q023`「経営企画都門…OCR 由来の字化けがある」/
`q049`「問繁」/ `q054`「プロジェクト_」/ `q078`「TIP 電話」などが**腐敗を現在形で記述**している。
しかし `quiz-phase2-merge.mjs:40-52` は **generate_result の key_guard を権威とし、expl_jp 側の key_guard を読まない**ため、
これらは出荷されない (`explanations/2020r02o.json` の note は merge 前 15 問すべて空文字だった)。**本 unit では触らない** (§11 ⑨)。

### tracked データの差分

| ファイル | 差分 | 内訳 |
|---|---|---|
| `data/ip/quiz/questions.json` | 36 行 (+18/−18) | 18 field = q004 stem + choices 17 (§6 の 15 題) |
| `data/ip/quiz/translations/2020r02o.json` | 24 行 (+12/−12) | 12 field = `stem_jp_clean` 4 題 + zh/en 8 (q004 stem 2 / q075 ア・イ 4 / q026 ア 2) |
| `data/ip/quiz/explanations/2020r02o.json` | +112 / −28 (Rule D NIT-1 で訂正、`git diff --numstat` 実測) | 解説本文 4 題 (q004 / q075 / q078 / q100) + final `note_jp` 12 + **`round1` ブロック 12 の新規 publish** |
| `data/ip/quiz/translations/*.json` の他 28 exam | **0** | 再 merge なし |

`derived_answer` / `matches_key` / `figure_derivable` / `stem_corruption_suspected` / `suspect` は**全問不変** (機械照合)。

---

## 8. 事後核験 (Rule A 相当の自証)

**(a) 是正後 manifest を再構成して machdiff を再実行**

```
node scripts/quiz-fidelity-prep-any.mjs 2020r02o u5post "1,2,4,...,100" --precrop   # 60/60、crop 59/60 (事前と同一)
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u5post_fidelity_input_2020r02o.json <同じ結果 JSON>
machdiff: fields same=293 | AGENT_MISSED=7 | VERDICT_CONFLICT=0 | coverage 60/60
```

- **事前と完全に同一** (MISSED 7 は同じ偽陽性 7 件)。**新規残差 0**。
- **precrop 回帰**: 再 prep 前後で `precrop/2020r02o/` の crop PNG 集合 md5 が **`feac9d54…` で同一** (byte 不変)。
  生成した `u5post` manifest は削除済。

#### 事前の `same` は 17 field が「空虚な一致」だった — 是正でそれが**真の一致**に変わった

U4 §8a と同じ分析を 21 field (24 差分の field 単位) に当てた (`normStr` は machdiff から逐字複製):

| 区分 | field 数 | patch 適用可 (事前→事後) | `norm(事前 disp)==norm(src)` | `norm(事後 disp)==norm(src)` |
|---|---|---|---|---|
| 空虚な一致 → 真の一致 | **17** | true → false | **false** | **true** ✅ |
| machdiff が原理的に見えない型 | **4** (`q006` ア・イ / `q085` stem / `q075` エ) | true → false | true | true |

- 17 field は、事前は agent の patch で比較が自明に成立していただけで、素の比較は不一致だった。
  事後は patch が当たらない (current_text が消えた) にもかかわらず素で一致する = **是正が効いている**。
- 残る 4 field は `normStr` が引用符 (`"` `“”` `「」`) と空白を同一視するため、**事前も事後も norm 一致**。
  これらの是正の効果は machdiff では観測できず、§8b の字種を潰さない照合で確認した。
- `q004` / `q016` / `q068` / `q085` は current_text が field の部分文字列 (full=false)、他 17 field は field 全文だった。

**(b) 採用 24 件の `source_text` と是正後表示テキストの直接照合**
(許容表記揺れ = NFKC / 読点字種 `、，,` / 空白 のみ潰し、**引用符・括弧の字種は潰さない**):

| 判定 | 件数 |
|---|---|
| EXACT (逐字一致) | **6** |
| TOLERANT (許容表記揺れのみ差) | **18** |
| RESIDUAL | **0** |

TOLERANT 18 件の残差は jp 読点の字種 (源 `，` / dataset は house rule の ASCII `", "`) と空白・改行 (q068 の見出し後改行) のみ。
**`q006` / `q068` / `q085` は引用符・括弧の字種まで一致**。→ **実残差 0**。

**(c) 波及ゼロの機械証明** (HEAD 比較)

| 検査 | 結果 |
|---|---|
| `questions.json` 2900 問の jp テキスト変更 field | **18** = §6 の 15 題のみ (他 key の変更 0) |
| `correct_answer` 変更 | **0 / 2900** |
| `question_bank` vs `by_year` vs `questions` 全量照合 | crosscheck A1–A7 / B1–B7 全成立 (§9) |
| `translations/` 追跡下 29 exam | **2020r02o の 12 field のみ** (再 merge 事故なし) |
| `explanations/2020r02o.json` | 解説本文は q004 / q075 / q078 / q100 のみ、note 12、round1 新規 12。key_guard の判定 field は全問不変 |
| `answer_keys.json` | **md5 `6802bb0bc13004da78ad3c4e5117d997` 前後同一 (byte 不変)** |

**(d) 読点脱落型の走査** (S124 §14j の正規表現を `choices_jp` 全 2900 問に適用)

- 是正後 **2020r02o の読点脱落候補は 0** (唯一の命中 `q070.ウ`「データ␣を」は助詞前の空白型 = 別クラスで、
  q070 は母集団 excluded [stage5_3_stratified_double_pass])。
- corpus 全体 **26 field** (S124 reviewer 版の 27 から `2020r02o-q045.エ` の 1 件減)。

---

## 9. ゲート

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ SPLIT_FIGURE **0 件 / 0 exam** / (A) 共有図メンバー全員がページ整合 / (B) 判定 JSON の SPLIT_FIGURE 50 件が両層で判定どおり |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ `chumon_groups.json は生成結果と一致` |
| `pnpm -C apps/web exec tsc --noEmit` | ✅ **0 error** (exit 0) |
| `pnpm -C apps/web exec vitest run` | ✅ **33 passed / 1 skipped (34 files)、501 passed / 2 skipped (503 tests)** (exit 0) |
| `node --check scripts/quiz-fidfix-S125-u5.mjs` | ✅ |
| `--apply` 再実行 × 2 | ✅ **applied 0 / skipped 136** (完全冪等) |
| `correct_answer` 差分 | ✅ **0 / 2900**。`git diff -U0 data \| grep -c '"correct_answer"'` = **0** |
| `answer_keys.json` | ✅ **byte 不変** (md5 前後同一) |
| 事後 machdiff (manifest 再生成 → 実行) | ✅ `same=293 / AGENT_MISSED=7 (同一の偽陽性) / VERDICT_CONFLICT=0 / coverage 60/60` = **事前と同一、新規残差 0** |
| D-143 (final のみ / round1 不可触) | ✅ MARK 付き final note **12**、12 件とも純粋後置、round1 への MARK 混入 **0**、`explanations` 内 MARK 出現も **12** |

適用前の前提検証: `node scripts/quiz-phase2-merge.mjs 2020r02o` を**先に実行して `git diff` 0** を確認 (merge 冪等 = `.phase2` は stale でない)。
gitignore 下の `.phase2` / `.phase1` の適用前状態は scratchpad に控えて事後照合に使った (repo 外)。

再生成: `build-quiz-corpus.mjs` (2900 問 / 63 topic / 29 exam / **with_fig 511**) →
`quiz-phase2-merge.mjs 2020r02o` (explained 100 / missing 0 / **STEM-CORRUPTION 0** /
SUSPECT 3 = `q015` / `q024` / `q025` — **適用前と同一**で本 unit の変更対象外)。

---

## 10. 見送り (クラス登記のみ、本 unit では是正しない)

| クラス | 該当 | 理由 |
|---|---|---|
| 解説者自身の文 | `q100` correct_jp「正しい**相手方**から送られた」/ `q026` distractor ア・points の「防災 (被害の抑止)」 | 選択肢の引用ではなく解説の地の文 (U3b `q015` precedent)。語義も正しい |
| 非出荷の key_guard note | `.phase2/expl_jp_*.json` の note (「過去19年間」「都門」「問繁」「プロジェクト_」「TIP」を現在形で記述) | merge が読まない (§7)。§11 ⑨ に登記 |
| **N5 (clean 保有題の raw 残存腐敗)** | `q054` raw stem「テストエ程」/ `q068` raw stem「【対応〕」「導 大 した」/ `q085` raw stem「"…”」「上 書き」/ `q016` raw stem「成果 ac」「保 護」/ `q022` raw stem「画像認識␣自然言語処理」(読点脱落) / `q026` raw stem 末尾「 ]」 | stem の出荷層は clean で正 → 学習者不可視。`q054`「エ程」/ `q068`「導大」は**字が変わる型**で N5 別ランク台帳の対象 (§11) |
| zh / en の引用符・括弧 | `q006` zh・en の ASCII `"`、`q068` zh「【应对措施】」/ en "[Measure]"、`q085` zh・en の `「」` | ⑨-c 保留 (波 2 precedent)。**en 本文の `「」` は不自然**という既知事項 (波 2 `2016h28h-q094`) の同型が再出。**`q085`: `.phase1` の `stem.en` は ASCII `"…"` で sidecar の `「…」` と非同期 (本 unit 以前からの既存 drift、Rule D NIT-2)** |
| 読点の字種・空白 | 採用 3 件の `, ` vs 源 `，`、英数字周囲の空白 | house rule (D-147 §1) どおり。許容表記揺れ |
| 表型選択肢・図の言語化 | `q001` (表)、`q011` (DFD 図) | machdiff 偽陽性の既知型 (§3) |

---

## 11. backlog (⑨ / 次 unit へ)

### ⑨ 新規: **斜線入りゼロ (slashed zero) の 9 / 6 誤読** — 数値型腐敗の横断走査

- `q004`「10年間」→「19年間」×2、`q075`「00.00…」→「609.00…」/「050-…」→「950-…」。2020r02o の源フォントは
  **0 に斜線が入る**等幅書体で、OCR が 9 (と 6) に読んでいる。
- 先例: `2021r03-q036` (S103「stem に 0→9 OCR 腐敗 ×3」)、U3a `2018h30h-q085`「9個以上」← 源「0個以上」、
  S123 `2019h31h-q053`「59本」← 源「50本」。**同じ型が 4 exam 目**になった。
- 数値の腐敗は semantic で、stem にあれば答えの導出を変えうる (計算問)。
- → **推奨**: 源フォントが slashed zero の exam を特定し、「9 を含む数字列」を源ページと突合する**的絞り走査**を検討する。
  文字列側だけでは判別できない (9 も正当な数字) ので、候補抽出 → 源直読の 2 段になる。

### ⑨ 新規: ノンブル混入 / 「.,」型の残存

- `q023` の末尾「一 ll 一」は**ページ下端のノンブル「— 11 —」**。corpus の末尾走査 (`[一ー—-]\s*[l1I|]{1,3}\s*[一ー—-]$`) では
  他 exam に**同型 0 件**。
- `q089` と同じ「源に無い `.,`」型は corpus の他に **2 件実在**: `2011h23tokubetsu-q033.ア`「場合**.,** クリティカルパス」/
  `2012h24h-q017.イ`「よって**.,**企業本来の」。どちらも ⑤-2 母集団外の 13 exam (U4 §11 の空白域) で、未監査と見られる。
  → U4 §11 推奨 (a) の「決定的走査で拾える型の軽量 lane」の対象に加えたい。

### ⑨ 新規: `q011` 図選択肢の言語化が**答えを示唆**する

- `q011` は 4 肢とも DFD 図で、dataset は図を「A→B, …」の列に言語化している (has_figure=true)。矢印の向きは 4 肢とも図と一致 (§3)。
- ただし**正解肢エの括弧書き「（座席案内は来店客リストと空席状況の両方を参照）」は題文「座席案内時に来店客リストと空席状況の両方を参照している」をそのままなぞっており**、
  言語化テキストだけで答えが割れる。他肢の括弧書き (ア「すべて単方向、双方向矢印なし」/ ウ「3本すべて受付から出る単方向」) は図の記述にとどまる。
- → **② 図/シナリオ track の候補** (図選択肢の言語化が答えを漏らしていないかの横断確認)。本 unit では保真の射程外として不変。

### ⑨ 新規: 2020r02o の key_guard note が generate_result で空 / expl_jp 側に非出荷 note

- generate_result の final note が 97/100 で空、round1 も空。一方 `expl_jp_*.json` の key_guard には note があり、
  一部は OCR 腐敗を現在形で記述している (§7)。merge は expl_jp 側を読まないので実害は無いが、
  **`.phase2` の 2 系統の key_guard が食い違っている**。他 exam (2021r03 も非空 5/100) に同じ状態があるか確認したい。
  本 unit の是正で generate_result の 12 問には note が入ったが、残り 85 問は空のまま。

### ⑨ (継続): **precrop page_mismatch — 3 unit 連続**

- U3b `page-37` (detected 3 / expected 4) → U4 `page-16` (1 / 2) → **U5 `page-03` (1 / 2)**。3 unit とも実害なし (源ページ直読で処理)。
- `page-03` は問3・問4 の 2 問で、問3 の見出し「問3」の左に**紙面の小さな点** (x≈105, y≈200) がある。見出し検出がこの点を含む行を
  見出しとして認識しなかった可能性がある (未検証の仮説)。**3 回連続なので検出条件を一度調べたい。**

### ⑨ (継続、U4 §11 から繰越)

- **N5 の「字が変わる型」の別ランク台帳化**: U3a `2018h30h-q085` / U3b `2019h31h-q053` / U4 `2019r01a-q016` に続き、
  本 unit で `2020r02o-q054`「テストエ程」/ `q068`「導 大 した」が加わった (**4 unit 連続**)。
- **machdiff の「agent 計上済 field は patch を外して評価」改修**: 本 unit では 21 field 中 **17 field が空虚な一致**だった (§8a)。
  U4 の 4/4 に続き 2 unit 連続で大半を占める。加えて**引用符・空白の字種差 4 field は machdiff で原理的に見えない**。
- **読点脱落型**: `2020r02o-q045.エ` を閉じた (corpus 27 → 26 field)。

---

## 12. Rule B (失敗記録)

**本 unit の抄写 run・是正器に失敗 attempt は無し。**
run は 1 回で完走 (60/60 / UNREADABLE 0 / agents_error 0)、part 壊れ 0/60。
是正器も dry-run → `--apply` の初回で assert-once 違反 0、全 136 操作 (applied 127 + 想定 skip 9) の from/to を dry-run で事前確認済。
`failures/` への新規追加は**なし**。

---

## 13. Rule D

Writer = `u5-fixer` (opus)。**Reviewer は別 `subagent_type` (opus) で本 evidence の後に別途実施すること**
(本ファイルは writer の自己申告であり、Rule D の審査は未了)。

審査時の重点:

1. **§4a `q004` の数値是正** (crop 無し → page-03 を reviewer も自前で切り出して「10」×2 を確認)。
   あわせて zh / en / 解説 6 箇所の追随が漏れなく、かつ過剰でないこと (points・key_guard 判定 field に 19 は無い)。
2. **§4d `q022`「する」の染み判定** — 3×4px 単一塊 vs 実在濁点 2 画の比較を独立に再現。
3. **§4b `q006` ASCII → `“ ”` の採用判断**が S115 の見送り方針と矛盾しないか (§4b の整理の当否)。
   ⑨ 横断課題 (174 field) として残す扱いで良いか。
4. **§4j / §4k の解説追随** — `q075` distractor の論拠が源の値で成立すること、`q078` の注記除去で解説文が壊れていないこと
   (jp「…ため誤り。」/ zh「…故错误。」/ en "…so it is incorrect.")。
5. **§4f `q026` の zh「阻燃用品」/ en "flame-retardant products"** の訳語の当否 (防炎品 = 燃えにくい加工の物品)。
6. **§7 key_guard note 12 件** — 対象選定 (語義・数値 + 正解肢命中、`q045` / `q068` / `q085` は追記しない) の方針適合と、
   空 note への追記で 12 問に `round1` ブロック (note "") が新規 publish された扱いの当否。
7. **§8a「17 field が空虚な一致 / 4 field が machdiff 不可視」**の再現。
8. **§2 severity 再分類** (agent 18/6 → fixer 14/10) の当否。
9. 適用ループが S124 から逐字流用 (DRY 判定 1 行のみ変更) であること。本 unit で stem / zh・en / EXPL 分岐が実行されたこと。

---

## 14. Rule D 独立審閲 (S125、reviewer `pr-review-toolkit:code-reviewer` opus、fixer `oh-my-claudecode:executor` opus と別 type)

**判定: PASS-with-notes** — MAJOR 0 / MINOR 0 / 誤是正 0 / 漏れ 0 / `correct_answer` 変更 0 / **データ・脚本の修正を要する指摘 0**。
NIT 3 件はすべて evidence の記述精度と ⑨ 登記に関するもので、**是正 24 件そのものは全件支持**する。

### 14a. 前提検証 — crop の無損失性 / 源の自前切り出し

- 源ページ PNG (1432×2026) を greyscale で読み、fixer が使った precrop が**画素完全な部分矩形**であることを確認:
  `q022` crop 1432×781 = page-11 の **x=0, y=182** に完全一致 / `q023` crop 1432×965 = page-11 の **x=0, y=963** に完全一致
  (→ `q023` crop は y 963〜1928 でページ下端のノンブル「— 11 —」(y≈1900) を含む。§4e の「crop 下端に写っている」は正)。
- 以降の実読は**すべて源ページ PNG から自前で切り出し** (PIL lanczos、0.6〜8 倍、scratchpad)、fixer の crop は使っていない。
  行位置は行投影 (grey<150 の画素数) で特定した。

### 14b. 採用 24 差分の独立実読 — **24/24 一致**

| id (page) | 差分 | reviewer の独立実読 | 判定 |
|---|---|---|---|
| **q004** (p03、crop 無し) | `19年間` ×2 → `10年間` | page-03 を原寸で全面確認 → 問4 1 行目末「過去**10**年間にわたる」(x990–1110, y685–725) と 3 行目頭「**10**年間の気象データ」(x190–310, y795–835) を **6 倍**で実読。**0 は楕円に斜線の slashed zero**、1 は明瞭 (同段落 4 行目「1週間先」の「1」と同字形)。2 箇所とも「10」 | **一致** |
| q006 (p04) ア・イ | ASCII `"` → `“ ”` | 行投影で ア 1 行目 = y912–939。**6 倍**で「“財務の視点”，“顧」: 開き 66 形・閉じ 99 形の欧文二重引用符。ア 2 行目・イ 4 行目「“価値”」も 1 倍で同形 | **一致** |
| **q016** (p09) stem | `斬新な` → `斬新的な` | b 行 = y412–438、**5 倍**「斬新**的**な発想で創作されたデザイン」。「的」明瞭 → agent 正、raw も既に正 | **一致** |
| q022 (p11) ア | `上顔` → `顔` / `解除ずる` → `解除する` | 1.3 倍で「人の**顔**を認識し」— 「上」相当の字形なし。「ず」は下記 14c | **一致** |
| q023 (p11) エ | `都門` → `部門` / 末尾 `一 ll 一` 除去 | 1.3 倍「経営企画**部門**の戦略であ / る。」。「る。」の後は空白、ノンブルは y≈1900 の別位置 | **一致** |
| **q026** (p13) ア・エ | `防災品` → `防炎品` / `建、 物` → `建物` | ア 2 行目 = y469–495、**6 倍**「のを防**炎**品に取り替え」(火 2 つ重ね、災の巛なし)。エ 1 行目末 3 倍「同規模の建」で**読点なし**、次行頭「物への移転」 | **一致** |
| q045 (p21) エ | `物理的␣人的` → `物理的, 人的` | y574–599、4 倍「技術的**，**物理的**，**人的**，**組織的な」— 読点 3 個同一グリフ | **一致** |
| q049 (p22) ウ | `問繁` → `頻繁` | y1024–1050、5 倍「**頻繁**に寄せられる質問」 | **一致** |
| q054 (p25) イ・ウ | `プロジェクト_␣` 除去 / `テストエ工程` → `テスト工程` | イ 1 行目末 (y524–549) 4 倍「うに，プロジェクト」で記号なし、次行頭「に予備の期間」。ウ 1.2 倍「テスト工程の遅延防止対策」 | **一致** |
| q068 (p31) stem | `【対応】` → `〔対応〕` | y355–380、6 倍: 細い**亀甲括弧**「〔対応〕」(墨付き括弧の太い黒塗りなし)、単独行 | **一致** |
| **q075** (p35) ア・イ・エ | `609.00…`→`00.00…` / `950-…`→`050-…` / URL 空白 | 1.4 倍で 4 肢、**5 倍**でア「**00**.**00**.11.aa.bb.cc」・イ「**0**50-1234-5678」— **ゼロ 5 個すべて斜線入り**、6・9 の字形 (尾・環) なし。エ「http://www.example.co.jp/」空白なし | **一致** |
| q078 (p35) ア | `TIP 電話` → `IP 電話` | 3 倍「ア　IP 電話を用いた音声通話」— 「I」の左に字形なし | **一致** |
| q085 (p38) stem | `「…」` → `“…”` | y966–994、3 倍「したら“権限がないので保存できません”という」 | **一致** |
| q089 (p40) ア | `について.,` → `について, ` | y968–994、6 倍「などについて**，**」行末。ピリオドなし | **一致** |
| **q100** (p45) ア・イ | `相手方` → `相手` / `読み見` → `盗み見` | 3 倍「電子メールが正しい**相手**から送られてきた」(方なし) /「途中で**盗**み見られている」 | **一致** |

(q022 / q023 / q026 / q054 / q075 / q100 は field 内の別箇所 = 論理差分 2〜3 件ずつ。計 24。)

### 14c. `q022`「す」の染み判定 — **独立に再現、fixer より強い根拠で支持**

page-11 を greyscale / grey<150 で二値化し、連結成分を自前で計算:

| 対象 | 成分 | 形 |
|---|---|---|
| 「す」周辺 (x445–480, y455–500) | **9px の単一塊 x469–471 / y465–468** (+ す本体 141px) | 3×4 の点。**「す」の縦画の真上右肩に接して座る** |
| 同 crop の実在濁点「ド」(ア 1 行目末) | y412–418、**x1238–1240 と x1241–1244 の 2 列** | **並んだ 2 画** (幅 7px × 高 6px) |

- 座標は fixer の crop 座標 (y283–286 / y231–236) に crop オフセット 182 を足した値と**完全一致**。
- 根拠は 3 本立つ: (1) 塊の**数** (1 vs 2)、(2) **位置** (濁点は字の右上に離れて付くが、この点は字の縦画頂部に接している)、
  (3) **言語** (「解除ずる」は日本語として成立しない)。→ 源は「解除する」。

### 14d. 漏れ — CLEAN 標本から fixer と重ならない 4 問を追加実読、**見落とし 0**

fixer の `q017` / `q029` / `q067` と machdiff の `q001` / `q011` は使わず、本 unit の支配的腐敗型 (slashed zero の 9/6 誤読・部→都 型の誤字) に対する**陰性対照**として選んだ:

| id (page) | 選定理由 | 実読結果 |
|---|---|---|
| `q043` (p20) | CLEAN 45 問中、数字を最も多く含む計算問 (表付き) | 題幹 5 行 (「1,000件」×2) と表 (500件 / 全体の80% / 500件 / 全体の20% / 30%短縮 / 同じ時間)、4 肢 `15`/`16`/`20`/`24` が一致。答え エ = 0.8×0.3 = 24% とも整合 |
| `q097` (p44) | 数字肢 (`1`/`2`/`4`/`6`) と題幹の「4人」「8個」 | 逐字一致。答え ウ (秘密鍵 4) とも整合 |
| `q052` / `q053` (p24) | 当初 `q056` を狙ったが page-24 の描画は問52・53 だった → この 2 問で代替。`q052` は「部門」を 8 回含む (部→都 型の陰性対照) | 題幹・4 肢とも一致 (表示 clean の読点後空白の有無のみ = 許容揺れ)。「部門」8 箇所すべて正 |

→ **漏れ 0**。結果 JSON から計数を独立再計算: `n 60 / CLEAN 45 / DISCREPANT 15 / discrepancies 24 / bySeverity {semantic 18, cosmetic 6} / onCorrectChoice 4`
(q006 ア / q054 イ / q089 ア / q100 ア、4 件とも `correct_answer` と肢が一致) = **§1〜§2 と完全一致**。
累計も再計算: 152+158+152+70+87+52+60 = **731**、13+15+12+8+9+4+15 = **76**、76/731 = **10.4%**、正解肢上 **14**、aa **3** — §2 と一致。

### 14e. machdiff MISSED 7 の偽陽性判定 — **独立に確認、支持**

- `q001` (p02、0.7 倍): 選択肢は **a / b 2 列の表** (ア RFI/RFP、イ RFI/SLA、ウ RFP/RFI、エ RFP/SLA)。dataset の「a：RFI　b：RFP」等 4 行は表と一致。
  machdiff の `kvParse` が全角空白区切りを a/b に割れず `a=RFIb:RFP / b=∅` になった**表型の一行化** = 既知型偽陽性。
- `q011` (p06、0.7 倍): 選択肢は **DFD 図 4 枚**。dataset の矢印列を図と 1 本ずつ突合:
  ア 来店客リスト→受付 / 受付→座席案内 / 座席案内→空席状況、イ 座席案内→受付 / 受付→空席状況 / 来店客リスト→座席案内、
  ウ 受付→来店客リスト・座席案内・空席状況、エ 受付→来店客リスト / 空席状況→座席案内 / 来店客リスト→座席案内 — **12 本すべて向き・端点一致**。
  差は括弧内の言い換えのみ = 図の言語化の既知型偽陽性。
- **§11 の ⑨「エの括弧書きが答えを示唆」にも同意**: エの「（座席案内は来店客リストと空席状況の両方を参照）」は題文「座席案内時に来店客リストと空席状況の両方を参照している」の写しで、図を見ずに答えが割れる。

### 14f. §8a「17 field 空虚な一致 / 4 field machdiff 不可視」— **全段再現**

`normStr` を machdiff から逐字複製し、21 field (24 差分の field 単位) で patch を外した素の比較を行った:

| 区分 | field | norm(事前 disp)==norm(src) | norm(事後 disp)==norm(src) | patch 適用可 事前→事後 |
|---|---|---|---|---|
| 空虚な一致 → 真の一致 | **17** | false | **true** | true → false |
| machdiff 不可視 | **4** = `q006` ア・イ / `q075` エ / `q085` stem | true | true | true → false |

`current_text` が field の部分文字列 (full=false) なのは `q004` / `q016` / `q068` / `q085` の stem 4 件で、他 17 件は field 全文 — §8a の記述と一致。
事後 manifest を `u5rev` label で自前再生成 → `head=140` (votes **140=44p / 180=2p / 170=1p**)、crop **59/60**、`page-03` のみ `detected 1 / expected 2` で skip、
precrop PNG 集合 md5 **`feac9d54a49b2c41811a14712e5bbab1`** が再生成前後で同一 (§8a の `feac9d54…` と一致)。事後 machdiff も `same=293 / AGENT_MISSED=7 / VERDICT_CONFLICT=0 / coverage 60/60`。`u5rev` manifest は削除済。

### 14g. 層の網羅・波及ゼロ

| 検査 | 結果 |
|---|---|
| `git diff --name-only HEAD -- data/` | **3 本のみ** (`questions.json` / `translations/2020r02o.json` / `explanations/2020r02o.json`)。translations の他 28 exam は byte 不変 ✅ |
| `questions.json` HEAD 比 | 変更 field **18** (stem 1 + choices 17)、`stem_jp` / `choices_jp` 以外の key 変更 **0**、`correct_answer` 変更 **0 / 2900** ✅。`git diff -U0 data \| grep -c '"correct_answer"'` = **0** |
| 3 層の全量照合 (`stem_jp` + `choices_jp` + `correct_answer`、キー順不問) | questions 対 bank 不一致 **0 / 2900**、questions 対 by_year 不一致 **0 / 100** ✅ |
| `answer_keys.json` | md5 **`6802bb0bc13004da78ad3c4e5117d997`** = §2 と一致 ✅ |
| **`choices_jp_clean` の不在** | 2020r02o sidecar 100 問のキー集合 = {`stem`, `choices`(zh/en), `stem_jp_clean`} を実測。**§7「選択肢の腐敗は学習者に見えていた」は正** ✅ |
| 旧文字列の残存 | `19年間` / `609.` / `950-` / `TIP 電話` / `防災品` / `防灾用品` / `disaster-prevention` / `問繁` / `都門` / `上顔` / `解除ずる` / `テストエ工程` / `プロジェクト_` / `読み見` / `相手方から` / `について.,` / `建、 物` / `www. ex` / `斬新な発想` / `【対応】` / `一 ll 一` を 2020r02o の questions + sidecar で走査 → **0**。explanations の本文 (correct / distractors / points) も **0** (残るのは新 note が過去形で引用する箇所のみ) ✅ |
| `.phase1` / `.phase2` (fixer の適用前控え `scratchpad/pre/` 24 本と構造比較) | `.phase1 tr_` 15 本: 変更は **q004 3 / q016 1 / q026 2 / q068 1 / q075 4 / q085 1 field** のみ、他 9 本は byte 同一。`expl_jp_` 4 本 / `expl_tr_` 4 本: 変更 field は EXPL の意図どおり (q100 `expl_tr` は byte 同一) ✅ |
| `generate_result_2020r02o.json` | 変更 **12 問** (§7 の対象と一致)、変更 path は **`key_guard.note_jp` のみ**、`key_guard_round1` 変更 **0 / 100**、top-level 不変、12 件とも `final.startsWith(旧 final)`、MARK 出現 **12**、round1 への MARK **0** ✅ |
| `explanations/2020r02o.json` HEAD 比 | 変更 path = note_jp 12 / round1 新規 12 / q004 correct・エ (3 言語) / q075 ア・イ (3 言語) / q078 ア (3 言語) / q100 イ (jp のみ)。**key_guard の判定 field・top-level (count / suspect_count) は不変** ✅ |
| **D-143 note 12 件** | 12 件とも note 中の答え記号 = `correct_answer` = `derived_answer` を機械照合。`round1.note_jp` = "" = 旧 final note。追記対象 (語義・数値 9 + 正解肢命中 3、q100 重複) と非追記 3 件 (`q045` 誤答肢の読点 / `q068`・`q085` stem の括弧・引用符) は **S124 §14f と同一規則**で一貫 ✅ |
| 空 round1 ブロックの新規 publish | `apps/web/src` は `key_guard` のうち **`suspect` しか読まない** (`quizModel.ts:304`)。`round1` / `note_jp` は UI 非表示、型 (`QuizExplanationEntry`) にも `round1` なし → 表示上もデータ上も問題なし。U4 の round1 併記と同じ D-143 設計どおり ✅ |

### 14h. 判断事項

- **`q006` ASCII → `“ ”` (審閲項目 3)** — **採用を支持**。S115 (`quiz-fidfix-S115-2010h22a.mjs:29`) の見送りは S118 §41 (`2026-09-07-session-118.md:302`) の判定基準改訂「引用符字種置換も計上」より**前**の判断であり、
  改訂後は「agent 計上 + 源で字形確定 → 是正」が運用規則になっている。ただし正確には、U3a `2018h30h-q001` / U3b `2019h31h-q007` の precedent は **`「」` → `“ ”`** で、
  **ASCII → `“ ”` の precedent は S114 `2011h23tokubetsu-q003` (clean 層) と S115 `q078` (混在問のみ)**。本件は ⑤-2 で**初の raw 選択肢層の ASCII → `“ ”`** にあたる (NIT-3)。
  是正後 2020r02o の jp 表示 (clean 優先 stem + choices) に ASCII `"` を含む field は **0** を実測 → exam 内の字種は統一された。corpus 横断 172 field は ⑨ のまま据え置きで良い。
- **`q026` 訳語 (審閲項目 5)** — zh「阻燃用品」/ en "flame-retardant products" は 防炎品 (燃えにくい加工の物品) の訳として適切。解説 distractor ア の地の文も「カーテンの不燃化」で語義整合。
  distractor ア / points[1] の「防災 (被害の抑止…)」は括弧で自ら定義を与える**分類ラベル**で、選択肢の語の写しではない → 不変に同意。
- **解説追随 (審閲項目 2)** — `q004`: correct / エ の jp・zh・en 6 箇所のみで過不足なし (points に年数の言及なし、実測 `\d+年` 0)。
  `q075`: ア の論拠「数値のかたまりが 6 つ」「aa bb cc を含む」は `00.00.11.aa.bb.cc` でも成立、イ の「ハイフン区切り・3 つのかたまり」も `050-1234-5678` で成立。
  `q078`: 注記除去後の文末は jp「…ため誤り。」/ zh「…故错误。」/ en "…so it is incorrect." で 3 言語整合、括弧の残骸なし。
  `q100`: イ jp のみ追随、zh「被窃看」/ en "being read" は源の語義で追随不要。correct_jp「相手方」は解説者の地の文 → 不変に同意。
- **severity 再分類 (18/6 → 14/10)** — 移した 4 件 (`q045` 読点 / `q054 イ` 記号 / `q026 エ` 読点挿入 / `q023 エ` ノンブル) はいずれも字・数字が変わらない記号差で、S124 U4 の読点脱落 = cosmetic と同じ線引き。同意。

### 14i. ゲート再実行 (すべて reviewer が自分で実行)

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** (再生成の前後 2 回) |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ SPLIT_FIGURE **0 件 / 0 exam** / (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 |
| `pnpm -C apps/web exec tsc --noEmit` | ✅ **exit 0** |
| `pnpm -C apps/web exec vitest run` | ✅ **33 passed / 1 skipped (34 files)、501 passed / 2 skipped (503 tests)** |
| `node --check scripts/quiz-fidfix-S125-u5.mjs` | ✅ |
| 脚本 dry-run (既定) | ✅ **`(dry-run) applied 0, skipped 136`** = 127 + 想定 skip 9 (§7 の内訳と一致)。`--apply` は実行していない |
| machdiff (事前 manifest) | ✅ `same=293 / AGENT_MISSED=7 / VERDICT_CONFLICT=0 / coverage 60/60` |
| **再生成の冪等性** | ✅ `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs 2020r02o` (SUSPECT 3 = `q015`,`q024`,`q025` / STEM-CORRUPTION 0) を自分で実行 (書込みを伴う)。`questions` / `quiz_index` / `explanations/2020r02o` / sidecar / `question_bank` / `by_year/2020r02o` の **md5 6 本が前後で不変**、`git diff --numstat` も不変 |
| **脚本の流用 (審閲項目 9)** | ✅ `sub()` は S124 と**逐字同一** (`diff` 出力なし)。適用ループ (`// ── 適用 ──` 〜 最終 `console.log`) は S124 と比べて**ログ文字列中の脚本名 1 箇所のみ**差。`DRY` 行は `process.argv.includes("--dry-run")` → `!includes("--apply") \|\| includes("--dry-run")` に変更 (既定 = 読取専用) — §6 末尾の記述どおり |
| 脚本の分岐実行 | ✅ FIX に stem (q004/q016/q068/q085) と zh・en (q004 stem / q026 ア / q075 ア・イ) があり、EXPL に distSub・correctSub がある → stem / zh・en / EXPL 分岐はすべて実行、pointSub のみ未実行 = §7 どおり |

### 14j. 指摘 (**MAJOR 0 / MINOR 0 = データ・脚本の修正は不要。すべて記述精度と ⑨ 登記**)

| # | 内容 | 推奨処置 |
|---|---|---|
| NIT-1 | **§7「tracked データの差分」の `explanations/2020r02o.json` 「+140 / −58」は誤り。** `git diff --numstat` の実測は **+112 / −28** (= note 12 行の置換 + round1 12 ブロック × 7 行 = 84 行の追加 + 解説本文 16 行の置換)。140 は `--stat` の当該ファイル変更行合計 (112+28)、58 は repo 全体の削除 59 から `STATE.md` の 1 を引いた値と見られる | 数値訂正 |
| NIT-2 | **`.phase1/tr_2020r02o-q085.json` の `stem.en` と sidecar が食い違っている (既存)**。`.phase1` は ASCII `"Cannot save …"`、sidecar (HEAD / 現行とも) は `「Cannot save …」`。fixer の適用前控えと比較して本 unit の変更 (`stem_jp_clean` のみ) とは無関係の**既存の drift**。S117 の「sidecar 再 merge 禁止」下では実害なし | ⑨-c (`q085` en の `「」`) の登記に「.phase1 は ASCII で sidecar と非同期」を 1 行添える |
| NIT-3 | **§4b の precedent 整理の精度。** U3a `2018h30h-q001` / U3b `2019h31h-q007` は `「」` → `“ ”` で、ASCII → `“ ”` の直接の precedent は S114 `2011h23tokubetsu-q003` (clean 層) のみ。本件は ⑤-2 で初の raw 選択肢層 ASCII 是正。結論 (採用) は不変 | §4b に 1 文補足 |

補記 (指摘ではない): §1 の token 数・時間・tool 呼び出し数は workflow のログ由来で、repo 内の成果物からは reviewer が独立検証できない (fixer 申告として扱う)。

### 14k. 再現コマンド

```
# 源の自前切り出し (PIL lanczos、scratchpad)
python3 cr.py <page> x0 y0 x1 y1 <scale> out.png      # data/ip/exams/pages/2020r02o/page-NN.png から
#   q004: page-03 (990,685)-(1110,725) / (190,795)-(310,835) ×6
#   q022 染み: page-11 を grey<150 で二値化 → x445–480, y455–500 の連結成分

# machdiff (事前)
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u5_fidelity_input_2020r02o.json \
  evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u5_2020r02o_sn.json
#   → same=293 | AGENT_MISSED=7 | VERDICT_CONFLICT=0 | coverage 60/60

# 事後 manifest 再生成 → machdiff (label は使い捨て、実行後に削除)
node scripts/quiz-fidelity-prep-any.mjs 2020r02o u5rev "<60 qnums>" --precrop
#   → head=140 (votes 140=44p/180=2p/170=1p) / crop 59/60 / page-03 のみ skip
#   → cat precrop/2020r02o/*.png | md5 = feac9d54a49b2c41811a14712e5bbab1 (前後同一)

# ゲート
node scripts/quiz-keys-crosscheck.mjs
node scripts/quiz-pagefix-derive-groups.mjs --assert-clean
node scripts/quiz-chumon-groups-build.mjs --check
pnpm -C apps/web exec tsc --noEmit
pnpm -C apps/web exec vitest run
node --check scripts/quiz-fidfix-S125-u5.mjs
node scripts/quiz-fidfix-S125-u5.mjs                  # dry-run 既定 → applied 0, skipped 136

# 再生成の冪等性 (md5 6 本が前後不変)
node scripts/build-quiz-corpus.mjs && node scripts/quiz-phase2-merge.mjs 2020r02o

# 脚本の流用確認
diff <(sed -n '/^function sub/,/^}/p' scripts/quiz-fidfix-S124-u4.mjs) <(sed -n '/^function sub/,/^}/p' scripts/quiz-fidfix-S125-u5.mjs)
diff <(sed -n '/^\/\/ ── 適用/,/^console.log(`/p' scripts/quiz-fidfix-S124-u4.mjs) <(sed -n '/^\/\/ ── 適用/,/^console.log(`/p' scripts/quiz-fidfix-S125-u5.mjs)

# 差分行数
git diff --numstat    # explanations/2020r02o.json 112/28、questions.json 18/18、translations/2020r02o.json 12/12
```
