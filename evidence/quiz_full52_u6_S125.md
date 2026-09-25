# ⑤-2 全量保真掃引 U6 — 2021r03 の集計と是正 (S125)

⑤-2 全量核験の **U6** (`docs/phase5/PLAN_52_units.md` §2、D-146 第 8 unit)。母数は
`evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json` の 2021r03 = **88 問**
(総 100 問 − excluded 12)。**Sonnet 5 単 pass** の 5 回目の本番 unit。

---

## 1. 入力と実行

- run: `wf_180a2db0-a1b` (label `u6`、pass `sn`、model = **Sonnet 5**)
- マニフェスト: `data/ip/quiz/.phase2/u6_fidelity_input_2021r03.json` (`--precrop` 版、crop **85/88**)
  - skip 3 ページ: `page-13` (q027) / `page-23` (q051) / `page-25` (q054) — いずれも page_mismatch。
    **page-23 / page-25 の skip は §4n の source ページ 1 頁ずれが原因**だった (是正後の再 prep で消えた、§8a)
  - precrop calib: `head=150`
- 結果 JSON: `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u6_2021r03_sn.json`
- **覆盖 88/88 / CLEAN 76 / DISCREPANT 11 / UNREADABLE 1 (q053)**、差分 14 {semantic 12, cosmetic 2}、正解肢上 2
- 是正器: `scripts/quiz-pagefix-apply.mjs --decisions evidence/phase5/stage_06_quiz_fidelity/pagefix_S125_u6_decisions.json`
  (前段、source ページ) → `scripts/quiz-fidfix-S125-u6.mjs` (本文。既定 dry-run、`--apply` で書込み)

### Sonnet 単 pass の実測

| 項目 | U3b (2019h31h 87) | U4 (2019r01a 52) | U5 (2020r02o 60) | **U6 (2021r03 88)** |
|---|---|---|---|---|
| token | 5,167,455 | 3,120,259 | 3,877,830 | **5,572,875** |
| token / 問 | 59,396 | 60,005 | 64,631 | **63,328** |
| 時間 | 16.2 分 | 8.8 分 | 9.3 分 | **11.9 分** |
| tool 呼び出し | 698 (8.0) | 430 (8.3) | 561 (9.4) | **685 (7.8 回/問)** |
| UNREADABLE | 0 | 0 | 0 | **1** (q053、入力側のページ誤り — §4n) |

---

## 2. 率

| exam | n | agent DISCREPANT | +machdiff | 計上 (率) | **是正** (率) | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|---|---|
| 2021r03 | 88 | **11** | **+2** (q070 / q100) | 13 (**14.8%**) | **13 (14.8%)** | **2** | **0** |

- agent の 11 題 / 14 差分は**全件採用**。machdiff 実残差 2 件 (いずれも agent CLEAN 題) を追加 → **13 題 / 16 論理差分**。非採用 0。
- **q053 (UNREADABLE)** は fixer が page-25 を 2 倍で実読し **CLEAN** と判定 (§4n)。**この 1 件だけは CLEAN 判定が agent でなく writer 由来** (Rule D 要確認)。
- **severity 再分類 (fixer、16 論理差分)**: semantic **8** / cosmetic **8** / answer_affecting **0**。
  規則 (U5 §2 と同一): 完結した文の後ろのごみ・記号の混入や脱落、見出し混入 → cosmetic、語の内部で字が入る / 落ちる / 置き換わる → semantic。
  - agent {semantic 12, cosmetic 2} から **4 件を cosmetic に移した**: `q010 エ`「= 呈」/ `q016 イ`「␣␣␣'」/ `q016 エ`「ーg 一」/ `q060 エ`「ー弟一」
    (文末の後ろのごみ、または行送り位置の記号混入 [`q016 イ` は後者、U5 `q054 イ` 同型] — Rule D NIT-1 で訂正。U5 `q023`「一 ll 一」precedent)。machdiff 由来の `q070` (読点脱落、U5 `q045` precedent) / `q100` (見出し混入、U3b `q001`) も cosmetic。
  - semantic 8 = `q008` stem (与える→及ぼす) / `q011 ア` (文末「している。」脱落) / `q013 エ`「ど」/ `q024 ア`「和」/ `q051 イ`「す」/ `q051 ウ`「toT」/ `q065 ウ`「で」/ `q072 ウ`「ア」脱落。
- **正解肢上 2** = `q010` エ (末尾ごみ、cosmetic) / `q024` ア (「和」挿入、semantic)。**`correct_answer` はいずれも不変**。
- `correct_answer` 変更 **0 / 2900**、`data/ip/exams/answer_keys.json` **バイト不変** (md5 `6802bb0bc13004da78ad3c4e5117d997` 前後同一)。

### 既往波との比較

| | 標本 | 計上 | 率 | 正解肢上 | answer_affecting | 抄写 model |
|---|---|---|---|---|---|---|
| 波 1–3 (Opus 双 pass) | 462 | 40 | 8.7% | 6 | 2 | Opus 双 pass |
| U3a (2018h30h) | 70 | 8 | 11.4% | 2 | 1 | Sonnet 単 pass |
| U3b (2019h31h) | 87 | 9 | 10.3% | 1 | 0 | Sonnet 単 pass |
| U4 (2019r01a) | 52 | 4 | 7.7% | 1 | 0 | Sonnet 単 pass |
| U5 (2020r02o) | 60 | 15 | 25.0% | 4 | 0 | Sonnet 単 pass |
| **U6 (2021r03)** | **88** | **13** | **14.8%** | **2** | **0** | **Sonnet 単 pass** |
| **累計 (波 1–3 + U3a〜U6)** | **819** | **89** | **10.9%** | **16** | **3** | — |

U6 の支配型は **選択肢末尾のごみ** (`「` / `= 呈` / `ーg 一` / `ー弟一` — 後二者はノンブル「— 8 —」「— 28 —」の混入と見られる) と
**1 字の挿入・脱落** (ど / 和 / す / で / ア / 行送りでの「している。」)。U5 の slashed zero 型は本 unit の対象問には無かった
(ただし母集団外の `q050` 図説明に同型 — §11)。

---

## 3. 機械 diff (machdiff) — **AGENT_MISSED 2 = 実残差 2**

```
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u6_fidelity_input_2021r03.json \
  evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u6_2021r03_sn.json
✗ AGENT_MISSED 2021r03-q070 stem verdict=CLEAN: @87 disp「印(a→b)は,aとbが1対多の関係…」 src「…aとbが,1対多の関係…」
✗ AGENT_MISSED 2021r03-q100 stem verdict=CLEAN: @0 disp「問100システムの経済性の評価におい」 src「システムの経済性の評価において,TC」
machdiff: fields same=433 | AGENT_MISSED=2 | VERDICT_CONFLICT=0 | UNREADABLE skipped=1 | coverage 88/88
```

主 context の「2 件とも実残差」判定を**源実読で独立に確認した — 一致**。

| id.field | 源実読 | 判定 |
|---|---|---|
| `q070` stem (clean) | p33 crop 原寸: 〔表記法〕の図の右「a と b が**，** 1 対多の関係であることを表す。」。clean は「a と b が 1 対多」で読点が落ちていた。raw は「a とb が, 1対多」で読点あり | **実残差 (読点脱落、clean のみ)** |
| `q100` stem (raw) | p45 crop: 見出し「問100」の後に題幹。dataset の stem_jp は先頭に「問100　」(U+3000) を含む。q100 は clean を持たず raw が出荷層 | **実残差 (見出し混入、U3b `q001` 型)**。agent は crop の見出しと同語のため見逃した |

---

## 4. 裁定 (fixer が源を原寸〜2 倍で独立実読)

実読した源: `data/ip/quiz/.phase2/precrop/2021r03/` の **q004 / q008 / q010 / q011 / q013 / q016 / q024 / q060 / q065 / q070 / q072 / q100**、
crop を持たない `q051` は **源ページ `pages/2021r03/page-24.png` 直読**、`q053` は **page-25 直読 (2 倍、lanczos)**、
あわせて page-23 (問50 のみ) を確認。agent の `source_text` は候補として扱い、すべて自分の目で読んでから from/to を決めた。**採用 16 / 非採用 0**。

### 4a. `q004` choice.イ・ウ — 末尾「␣×14「」/「␣×15「」(cosmetic)
p03 crop: イ「…大量の例文デ / ータベース」、ウ「…画像入力 / 装置」で終わり、後続の記号は無い。

### 4b. `q008` stem (clean) — 「影響を及ぼす」→ 源「影響を与える」(semantic)
p04 crop 原寸: 5 行目「残る大半の消費者に影響を**与える**グループはどれか。」。clean 層は語句が置換されていた
(raw は「影響をほ与.るる」で OCR 崩れ — N5、n=0 skip)。語義は同じだが S119 規準で語句置換は計上。
解説 correct_jp の「設問の三条件「2番目に早い」「自ら価値を評価」「残る大半に影響を及ぼす」」は**鉤括弧で設問を引いている**ので
「与える」に追随。地の文の「及ぼす」は出荷解説に 3 箇所 (correct.jp 1 + distractor イ 2、Rule D NIT-3 で実測に訂正) あり不変 (§10)。非出荷 key_guard note にも別に 2 箇所。zh「产生影响」/ en "influences" は中立で不変。

### 4c. `q010` choice.エ — 末尾「= 呈」(cosmetic、**エ は正解肢**)
p05 crop: 「…時間軸とともに示した / もの」で終わる。correct_answer=エ 不変。

### 4d. `q011` choice.ア — 「…作業に適」→ 源「…作業に適している。」(semantic)
p06 crop: 1 行目末「作業に適」、2 行目頭「している。」。dataset は 2 行目を落としていた (文が途中で切れた表示)。zh / en は既に完全文。

### 4e. `q013` choice.エ — 「契約者ごどとに」→ 源「契約者ごとに」(semantic)
p07 crop 原寸: 2 行目「…自動車保険の契約者ごとに，1年間の…」。

### 4f. `q016` choice.イ・エ — 「全体␣␣␣'を」/ 末尾「ーg 一」(cosmetic × 2)
p08 crop: イ「…物流チャネル全体 / を効果的に管理すること」(行送りのみ、記号なし)。エ「…店舗展開を行うこと」で終わる。
「ーg 一」は page-08 下端のノンブル「— 8 —」の混入と見られる (U5 `q023` と同型)。

### 4g. `q024` choice.ア — 「とらわれない和柔軟な」→ 源「とらわれない柔軟な」(semantic、**ア は正解肢**)
p12 crop 原寸: 「IT を活用した，場所や時間にとらわれない柔軟な働き方のこと」。語義不変で correct_answer=ア 不変。

### 4h. `q051` choice.イ・ウ — 「保有すする」/「toT」(semantic × 2、**page-24 直読**)
page-24 上段 (問51): イ「…技術を保有する**ベンダ**に開発を委託する。」、ウ「**IoT** を採用した大規模システムの開発を…」。
agent も manifest の page-23 に問51 が無いことを自分で検出し page-24 を読んでいた (S115 `2010h22a-q091` と同じ自己修復)。

### 4i. `q060` choice.エ — 末尾「ー弟一」(cosmetic)
p28 crop: 「…パスワードを入力することによってログインできる。」で終わる。「ー弟一」はノンブル「— 28 —」の混入と見られる。
agent の source_text「利用者IDの」(空白なし) は英数字周囲の空白の表記揺れで、**是正しない** (過去 unit の方針どおり)。

### 4j. `q065` choice.ウ — 「のぞでかれない」→ 源「のぞかれない」(semantic)
p30 crop 原寸: 「他の社員に PC の画面をのぞかれないように，…」。
なお源紙面の見出し「問65」と「シャドー」の間に小さな汚れがあり、raw stem 先頭の「'」はこれの転写 (clean は正、N5)。

### 4k. `q070` stem (clean) — 読点の脱落 (cosmetic、machdiff 由来) — §3

### 4l. `q072` choice.ウ — 「キャリアグリゲーション」→ 源「キャリアアグリゲーション」(semantic)
p34 crop 原寸: 「ウ　キャリアアグリゲーション」。**zh「载波聚合」/ en "Carrier aggregation" / 解説 jp「キャリアアグリゲーションは…」(×3) / zh / en は既に正しい用語**
(`grep -c キャリアグリゲーション` = expl_jp 0 / explanations 0)。選択肢 jp のみ是正。

### 4m. `q100` stem — 見出し「問100　」混入 (cosmetic、machdiff 由来) — §3
q100 は stem・choices とも全角「，」で、2021r03 の他問 (house rule の ASCII「, 」) と由来が違う。字種は表記揺れ扱いで不変 (§11)。

### 4n. **`q053` UNREADABLE の解消と source ページ 1 頁ずれ (q051 / q053)**

**(a) q053 の本文照合 — CLEAN (fixer 判定)**
page-25 上段を 2 倍 (lanczos) で実読: 「問53　IT サービスにおける SLM に関する説明のうち，適切なものはどれか。」+ ア〜エ。
dataset の stem / ア / イ / ウ / エ は**逐字一致** (差は読点字種「，」↔「, 」のみ = 許容揺れ)。是正対象なし。
是正後の再 prep で生成された新 crop `precrop/2021r03/2021r03-q053.png` も「問53」の帯であることを目視確認した。

**(b) データ側の page 記録 — 2 問が 1 頁手前を指していた**

| page | 実際の掲載 (実読) | 是正前の記録 |
|---|---|---|
| page-23 | **問50 のみ** (図+表 2 つで 1 頁を占有) | q050 **+ q051** |
| page-24 | **問51・問52** (下半分空白) | q052 **+ q053** |
| page-25 | **問53・問54** | q054 |

- 誤り 2 件: `q051` 23 → **24**、`q053` 24 → **25**。どちらも図なし (`has_figure=false`)。q050 / q052 / q054 は正しい。
- 層: `question_bank.json` / `by_year/2021r03.json` の `source.page_image` / `source.page_number` (2 層とも同値で誤り)。
  **`questions.json` は page を持たず `source_label` (「令和3年度 ITパスポート試験 問51」等) のみ**で、ここは正しい。
- 是正: D-145 §4 の一本道 `quiz-pagefix-apply.mjs` に判定 JSON
  `evidence/phase5/stage_06_quiz_fidelity/pagefix_S125_u6_decisions.json` (2 件、`MOVE_QUESTION`、`figure_page_number: null`) を与えて
  `--self-test` (24 assertions ✅) → `--dry-run` → `--no-recrop` で適用。**図なしのため `figure_page_*` は書かれない** (`planTarget` の「設問 N へ移動 (図なし)」分岐)。
  crosscheck **B6 (2 層一致) / B7 (ページポインタ健全性) を通過** (§9)。
- 原因の推定: マッパーが問50 の 1 問ページを「2 問ページ」とみなして q051 を同居させ、以後 1 頁ずつ繰り上がった。
  page-25 に q054 だけが割り当てられたところで再同期し、q054 以降は正しい。

**(c) exam 全体の機械的確認 — ずれは q051 / q053 の 2 件のみ**
全 100 問の `stem_jp` 先頭 60 字 + 選択肢先頭 80 字の文字 bigram 集合と、page-01〜45 の全頁 tesseract (jpn、2 倍) 全文の bigram 集合を照合し、
最良一致ページと記録ページを比べた。**不一致は q051 (best 24 = 0.96 / 記録 23 = 0.05) と q053 (best 25 = 1.00 / 記録 24 = 0.23) の 2 件のみ**、
他 98 問は記録ページが最良一致で一致率も 0.5 以上。是正後は 100/100 一致。
(見出し「問NN」を tesseract で直接拾う方法は slashed zero で「問50→59」「問70→79」等に化けるため不採用。)

再現用スクリプト (scratchpad、repo 外):

```python
# python3 (PIL + tesseract jpn)。cwd = repo root
from PIL import Image; import subprocess, glob, re, json
pages = {}
for f in sorted(glob.glob("data/ip/exams/pages/2021r03/page-*.png")):
    n = int(re.search(r"page-(\d+)", f).group(1))
    if n > 45: continue
    im = Image.open(f).convert("L"); w, h = im.size; im.resize((w*2, h*2)).save("/tmp/p.png")
    pages[n] = re.sub(r"\s", "", subprocess.run(["tesseract", "/tmp/p.png", "-", "-l", "jpn", "--psm", "4"],
                                                capture_output=True, text=True).stdout)
bg = lambda s: {s[i:i+2] for i in range(len(s)-1)}
for q in [q for q in json.load(open("data/ip/exams/question_bank.json"))["questions"] if q["id"].startswith("2021r03-")]:
    key = bg(re.sub(r"[\s,，、。．.]", "", q["stem_jp"])[:60]) | bg(re.sub(r"[\s,，、。．.]", "", "".join(q["choices_jp"].values()))[:80])
    sc = {n: len(key & bg(re.sub(r"[,，、。．.]", "", t))) / max(1, len(key)) for n, t in pages.items()}
    best = max(sc, key=sc.get)
    if best != q["source"]["page_number"] or sc[best] < 0.5: print(q["id"], q["source"]["page_number"], best, round(sc[best], 2))
```

**(d) precrop が題番号を検証せずに誤った帯を切った** → §11 ⑨ に記録 (脚本改修はしない)。
page-24 は「記録 2 問 (q052, q053) / 検出見出し 2 個 (問51, 問52)」で**個数が一致したため安全側 skip が発火せず**、
q052 に問51 の帯、q053 に問52 の帯が順に割り当てられた。是正後の再 prep で、**旧 q052 crop と新 q051 crop、旧 q053 crop と新 q052 crop が
md5 で一致** (`752c6ddd…` / `8703476b…`) したことがこの機構の直接の証拠 (§8a)。q052 の agent は crop の題番号違いを自分で検出して
page-24 から正しく読み CLEAN、q053 の agent は隔離規定に従い UNREADABLE とした。いずれも監査の振る舞いとしては正しい。

### 4o. CLEAN 標本の無作為抽検

CLEAN 76 問から **seed 126 の LCG で 3 問を無作為抽出** (`q078` / `q027` / `q021`) して源と逐字照合した。

| id | 実読結果 |
|---|---|
| `q078` (p37 crop) | 題幹「OSS (Open Source Software) に関する記述として，…」と 4 肢が一致 |
| `q027` (p13 源ページ直読、crop 無し) | 題幹「BYOD の事例として，…」と 4 肢 (ア 2 行 / イ 2 行 / ウ 2 行 / エ 1 行) が一致 |
| `q021` (p11 crop) | 題幹「ABC 分析の事例として，…」と 4 肢が一致 |

→ **見落とし 0**。

---

## 5. SOURCE_TYPOS

本 unit では**該当なし**。

---

## 6. 採用した差分 (13 題 / 16 論理差分)

| id (page) | field | 差分 | severity | 由来 |
|---|---|---|---|---|
| q004 (p03) | choice.イ | 末尾 `␣×14「` → 除去 | cosmetic | agent |
| q004 (p03) | choice.ウ | 末尾 `␣×15「` → 除去 | cosmetic | agent |
| q008 (p04) | stem (clean) | `影響を及ぼす` → 源 `影響を与える` (解説の設問引用も追随) | **semantic** | agent |
| q010 (p05) | choice.エ | 末尾 `= 呈` → 除去。**エ は正解肢** | cosmetic | agent |
| q011 (p06) | choice.ア | `…作業に適` → 源 `…作業に適している。` | **semantic** | agent |
| q013 (p07) | choice.エ | `契約者ごどとに` → 源 `契約者ごとに` | **semantic** | agent |
| q016 (p08) | choice.イ | `全体␣␣␣'を` → 源 `全体を` | cosmetic | agent |
| q016 (p08) | choice.エ | 末尾 `ーg 一` (ノンブル) → 除去 | cosmetic | agent |
| q024 (p12) | choice.ア | `とらわれない和柔軟な` → 源 `とらわれない柔軟な`。**ア は正解肢** | **semantic** | agent |
| q051 (p24) | choice.イ | `保有すする` → 源 `保有する` | **semantic** | agent |
| q051 (p24) | choice.ウ | `toT` → 源 `IoT` | **semantic** | agent |
| q060 (p28) | choice.エ | 末尾 `ー弟一` (ノンブル) → 除去 | cosmetic | agent |
| q065 (p30) | choice.ウ | `のぞでかれない` → 源 `のぞかれない` | **semantic** | agent |
| q070 (p33) | stem (clean) | `a と b が 1 対多` → `a と b が, 1 対多` (読点復元) | cosmetic | **machdiff** |
| q072 (p34) | choice.ウ | `キャリアグリゲーション` → 源 `キャリアアグリゲーション` | **semantic** | agent |
| q100 (p45) | stem | 先頭 `問100　` → 除去 | cosmetic | **machdiff** |

別件 (fidelity 差分の計上外): **source ページ是正 2 件** (`q051` 23→24 / `q053` 24→25、§4n)。

- jp 読点の字種は house rule の ASCII `", "` (D-147 §1)。

### zh / en / 解説の追随

| id | zh | en | 解説 | 判定 |
|---|---|---|---|---|
| q072 ウ | 「载波聚合」 | "Carrier aggregation" | jp・zh・en とも正しい用語 | 追随不要 |
| q011 ア | 完全文 | 完全文 | — | 追随不要 |
| q008 stem | 「产生影响」 | "influences" | jp correct_jp の設問引用 1 箇所 → 「与える」 | **jp 解説のみ追随** |
| q024 / q051 / q013 / q065 / q010 / q004 / q016 / q060 / q070 / q100 | 既に源の語義 (q100 zh / en に「問100」混入なし) | 同左 | 触れていない | 不変 |

### 指示から外した点

**なし。** 要注意 14 項目 + machdiff 2 件 + q053 をすべて源実読で確認した。
- 要注意の「`q060` エ『利用者 ID』空白」は指示どおり表記揺れ扱いで不変、末尾ごみのみ是正。
- 要注意の「`q072` の zh / en / 解説での用語表記」は確認の結果すべて正しく、選択肢 jp のみの腐敗だった。
- severity 再分類 (§2) は判定の記録であって、是正内容には影響しない。

---

## 7. 層と局所性

| 層 | 置換操作数 | 備考 |
|---|---|---|
| raw (`questions.json` / `question_bank.json` / `by_year/2021r03.json`) | **42** | choices 13 置換 × 3 = 39 / stem q100 × 3 = 3 |
| sidecar (`translations/2021r03.json`) | **2** | `stem_jp_clean` q008 / q070 |
| `.phase1/tr_<id>.json` | **2** | sidecar と同一の置換 |
| 解説 `.phase2/expl_jp_*.json` | **1** | q008 correct_jp の設問引用 |
| key_guard final note (`.phase2/generate_result_2021r03.json`) | **8** | D-143: **final のみ**、round1 不可触 |
| **fidfix 合計** | **55** | `quiz-fidfix-S125-u6.mjs` の `applied` と一致 |
| skip (想定どおり) | **6** | q008 / q070 の raw 3 層 (clean のみの腐敗)。**無言 guard skip 0** |
| source ページ (`question_bank` + `by_year`) | **2 問 × 2 層** | `quiz-pagefix-apply.mjs` (§4n) |

### 選択肢に clean 層は無い = **腐敗は学習者に見えていた**

- 2021r03 の sidecar のキー集合 = {`stem`, `choices`, `stem_jp_clean`} (clean は 64 題)。**`choices_jp_clean` は存在しない** (実測)。
- → 選択肢の 13 置換 (13 field) はすべて出荷層の腐敗。stem は `q008` / `q070` (clean が表示層) と `q100` (clean なし、raw が表示層)。

### 適用ループの由来 (Rule D 向け)

`quiz-fidfix-S125-u6.mjs` の適用ループ本体 (「// ── 適用」以降) は `quiz-fidfix-S125-u5.mjs:243-309` と
**`diff` で最終 console.log のラベル 1 語 (`u5`→`u6`) のみ差** (機械確認)。冒頭の `sub()` / `DRY` 判定も U5 と同一。
本 unit で実行された分岐: **stem 分岐 (raw + clean) / choices 分岐 / EXPL の correctSub / NOTE_APPEND**。zh・en 分岐 / distSub / pointSub / NOTE_SUB は未実行。

### key_guard final note

- 本 unit の 13 問は generate_result の final note・round1 note とも**空文字**。
- 対象 **8 件** = 語義 (`q008` `q011` `q013` `q051` `q065` `q072`) + 正解肢命中 (`q010` `q024`、q024 は両方)。
  **追記しない 5 件** = `q004` / `q016` / `q060` (誤答肢の末尾ごみ・記号のみ) / `q070` / `q100` (stem の読点・見出しのみ)。
- **8 件とも純粋な後置** (`final.startsWith(round1)` 8/8 true)、round1 の変更 **0 / 100**、MARK なしの他 92 result は byte 不変 (機械照合)。
  key_guard の判定 field (`derived_answer` / `matches_key` / `suspect` / `stem_corruption_suspected` / `figure_derivable`) は 8 件とも不変。
- merge は final ≠ round1 のため **8 問に `round1` ブロック (note_jp = "") を新規 publish** (U5 §7 と同じ D-143 の挙動)。
- `q051` の note には source ページ是正 (23→24) も一文で記した。note 中のページ (`pg()`) は pagefix 適用後の値 (page-24) を読んでいる。
- `--apply` 再実行 2 回: **applied 0 / skipped 61** (完全冪等)。

### tracked データの差分 (`git diff --numstat`)

| ファイル | 差分 | 内訳 |
|---|---|---|
| `data/ip/quiz/questions.json` | +14 / −14 | 14 field = choices 13 + q100 stem (11 題) |
| `data/ip/quiz/translations/2021r03.json` | +2 / −2 | `stem_jp_clean` q008 / q070 |
| `data/ip/quiz/explanations/2021r03.json` | +65 / −9 | q008 correct_jp + final `note_jp` 8 + **`round1` ブロック 8 の新規 publish** |
| `translations/*.json` の他 28 exam | **0** | 再 merge なし |

`question_bank.json` / `by_year/2021r03.json` / `.phase1` / `.phase2` は gitignore 下 (適用前状態は scratchpad に控えて照合)。
`questions.json` で stem_jp / choices_jp 以外の key の変更 **0** (機械照合)。

---

## 8. 事後核験

**(a) 是正後 manifest を再構成して machdiff を再実行**

```
node scripts/quiz-fidelity-prep-any.mjs 2021r03 u6post "<88 問の番号>" --precrop
  precrop: 87/88 questions cropped; skipped 1 (page-13 page_mismatch: detected 2, expected 3)
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u6post_fidelity_input_2021r03.json <同じ結果 JSON>
✗ AGENT_MISSED 2021r03-q011 choice.ア verdict=DISCREPANT: disp(after agent fixes)「…作業に適している.している.」 src「…作業に適している.」
machdiff: fields same=434 | AGENT_MISSED=1 | VERDICT_CONFLICT=0 | UNREADABLE skipped=1 | coverage 88/88
```

- **q070 / q100 の MISSED 2 は解消**。
- **新たな MISSED 1 (`q011` ア) は machdiff の patch 再適用の人工物**: agent の `current_text`「…作業に適」は是正後テキスト「…作業に適している。」の**接頭辞**なので、
  machdiff が patch (「…適」→「…適している。」) を是正後にも当ててしまい「している。している。」を作る。実テキストは
  「新しく設計した部品を少ロットで試作するなど, 工場での非定型的な作業に適している。」で源と一致 (§8b)。**実残差 0**。
  (U4 / U5 §11 の「machdiff は agent 計上済 field を patch 越しに評価する」課題の新しい現れ方 — §11)
- **precrop の変化 (想定どおりの是正効果、回帰ではない)**: crop 85 → **87/88**、page-23 / page-25 の skip が消えた。
  crop PNG の md5 比較で、既存 83 枚は byte 不変。変化は **旧 `q052`(問51 帯) = 新 `q051`**、**旧 `q053`(問52 帯) = 新 `q052`** (md5 一致)、
  新規 `q053` (問53 帯、目視確認) / `q054`。適用前の precrop ディレクトリは scratchpad に退避した。生成した `u6post` manifest は削除済。
- **注意 (Rule D 向け)**: 結果 JSON の `q052` / `q053` の `notes_jp` が述べる crop 内容 (q052.png = 問51 帯 / q053.png = 問52 帯) は**是正前の precrop**。
  現ディスクの crop は再 prep 後で、`2021r03-q052.png` = 問52 帯、`2021r03-q053.png` = 問53 帯。
  是正前の md5: 旧 `q052.png` = `752c6ddd9538badddaac727e74bc7f66` (現 `q051.png` と同一) / 旧 `q053.png` = `8703476bb6e3c62b0cc326f7c713973e` (現 `q052.png` と同一)。
  `.phase2` は gitignore 下なので、この md5 が是正前状態の唯一の恒久記録。

**(b) 採用 16 件の `source_text` と是正後表示テキストの直接照合** (許容表記揺れ = NFKC / 読点字種 / 空白 のみ潰す):

| 判定 | 件数 |
|---|---|
| EXACT | **2** (`q072` ウ / `q100` stem) |
| TOLERANT | **14** (読点字種・英数字周囲の空白のみ) |
| RESIDUAL | **0** |

**(c) 波及ゼロの機械証明**

| 検査 | 結果 |
|---|---|
| `questions.json` 2900 問の jp テキスト変更 field | **14** = §6 の 11 題 (clean のみの q008 / q070 を除く) |
| `correct_answer` 変更 | **0 / 2900** |
| `translations/` 追跡下 29 exam | **2021r03 の 2 field のみ** |
| `explanations/2021r03.json` | 解説本文は q008 のみ、note 8、round1 新規 8 |
| `answer_keys.json` | **md5 `6802bb0bc13004da78ad3c4e5117d997` 前後同一** |

---

## 9. ゲート

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ SPLIT_FIGURE 0 件 / (A) 共有図メンバー整合 / (B) 判定 JSON 50 件が両層で判定どおり |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ `chumon_groups.json は生成結果と一致` (`? 2015h27h-mqC` / `mqD` は既存の情報行、NIT-4) |
| `pnpm -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm -C apps/web exec vitest run` | ✅ **33 passed / 1 skipped (34 files)、501 passed / 2 skipped (503 tests)** |
| `node --check scripts/quiz-fidfix-S125-u6.mjs` | ✅ |
| `quiz-pagefix-apply.mjs --self-test` | ✅ 24 assertions |
| fidfix `--apply` 再実行 × 2 | ✅ **applied 0 / skipped 61** |
| `correct_answer` 差分 | ✅ **0 / 2900**。`git diff -U0 data \| grep -c '"correct_answer"'` = **0** |
| `answer_keys.json` | ✅ byte 不変 |
| 事後 machdiff | ✅ 実残差 0 (MISSED 1 = patch 再適用の人工物、§8a) |
| D-143 | ✅ MARK 付き final note **8**、純粋後置 8/8、round1 変更 0、`explanations` 内 MARK **8** |

適用前の前提検証: `quiz-phase2-merge.mjs 2021r03` を**先に実行して `git diff` 0** (merge 冪等) を確認。
merge の報告 `SUSPECT 3 (q038 / q039 / q049)` / `STEM-CORRUPTION 1 (q036*)` は**適用前後で同一** (本 unit の変更対象外。q036 は S103 の slashed zero 既知件)。
再生成: `build-quiz-corpus.mjs` (2900 問 / with_fig 511) → `quiz-phase2-merge.mjs 2021r03` (explained 100)。

---

## 10. 見送り

| クラス | 該当 | 理由 |
|---|---|---|
| 解説者自身の文 | `q008` 解説の「影響を及ぼす」出荷解説 3 箇所 (correct.jp 1 + distractor イ 2、NIT-3)「影響を「及ぼす」側」 | 設問の引用ではない (U3b `q015` / U5 `q100` precedent)。語義も同じ |
| 非出荷の key_guard note | `.phase2/expl_jp_*.json` の note (`q004`「「」/ `q008`「ほ与.るる」/ `q010`「= 呈」/ `q016` / `q024`「和柔軟」/ `q060`「ー弟一」/ `q065`「のぞでかれ」) | merge が読まない (U5 §7)。⑨ 継続 |
| N5 (raw stem の残存腐敗、clean が出荷層) | `q008` raw「影響をほ与.るる」「関心 や」/ `q070` raw の崩れ (「条件① - ⑳④」「- ・ ? ー」) / `q065` raw 先頭「'」/ `q072` raw「サー バ」「。 IoT」/ `q024` raw「適功か」 | 学習者不可視。`q008`「ほ与.るる」`q024`「適功か」は字が変わる型で N5 別ランク台帳の対象 |
| 読点の字種・空白 | `q060`「利用者 ID」ほか英数字周囲の空白、`q004` ア「データ を」 | 許容表記揺れ |
| `q100` の全角「，」 | stem・choices 全体 | 由来の違い (§11)。字種のみ |
| sidecar と `.phase1` の既存 drift | `q070` `stem_jp_clean`:「〔表記法〕」の後が sidecar は改行、`.phase1` は空白 (**本 unit 以前からの差**、HEAD と退避コピーで確認) | 本 unit の置換は両方に当たった。drift 自体は触らない |

---

## 11. backlog (⑨ / 次 unit へ)

### ⑨ 新規: **precrop が題番号を検証しない — 個数一致で安全 skip をすり抜ける**

- page-24 は記録 2 問 (q052 / q053) と検出見出し 2 個 (問51 / 問52) で個数が一致 → skip せず、**q052 に問51、q053 に問52 の帯**を割り当てた。
  個数が合わない page-23 / page-25 だけが skip された。**1 頁ずれは「ずれた範囲の中で 1 問ページと 2 問ページが入れ替わる」ので、
  端 (23 / 25) は skip されても中間 (24) は個数が合ってしまう**。
- 実害: q052 は agent が題番号違いを検出して源ページで自己修復、q053 は UNREADABLE (本 unit で fixer が解消)。
- → **推奨**: precrop が見出しの題番号を OCR / 形状で読み、記録 question_number と照合する。少なくとも「帯の先頭見出しの題番号 ≠ 記録」を
  page_mismatch と同様に skip 扱いにする。本 unit では脚本改修しない。
- 関連: precrop page_mismatch は U3b / U4 / U5 に続き **4 unit 連続** (本 unit の page-13: detected 2 / expected 3。問27〜29 の 3 問ページで、
  source ページ記録は正しい)。

### ⑨ 新規: **source ページ記録の 1 頁ずれが 2021r03 にも実在**

- S115 `2010h22a` (中問A 4 問) に続く 2 例目。今回は中問ではなく、**図で 1 頁を占有する単独問 (問50)** の直後で起きた。
- 他 exam で同型 (図の大きい単独問の直後) の検出は未実施。本 unit の bigram 照合 (§4n c) は exam 単位で数分で回るので、
  **全 29 exam への横断走査**を推奨 (候補抽出 → 源直読の 2 段)。

### ⑨ 新規: **図説明 (`figure_description`) の slashed zero 腐敗** — `2021r03-q050`

- `question_bank` の `figure_description` が「移動：片道**68**秒 / B 起動処理（**156**秒）/ C ログイン操作（**19**秒）/ D（**?**秒）/ 起動処理（**68**秒）」。
  源 page-23 は **60 / 150 / 10 / 60 / 60 秒**。U5 §11 の slashed zero 型が**図説明のフィールド**に出た (新しい面)。
- q050 は母集団外 (`s7x_A_scope_double_pass`) で本 unit では触らない。解説 (correct.jp) は 150 / 10 / 60 の源の値で書かれ答え (ア 223) も正しい。
  **web 出荷層 (`questions.json`) の q050 は `has_figure` / `figure` / `figure_type` のみで `figure_description` を持たない (実測) → 学習者不可視**。
  `question_bank` を読む下流 (vision prompt / tutor context) の有無は未確認。**figure_description 全量の数値走査を提起**。

### ⑨ 新規: `q100` だけが全角「，」

- 2021r03 の他問は house rule の ASCII「, 」だが、q100 は stem・choices とも「，」で、stem 先頭に見出しも混入していた。
  別経路 (手入力 / 再抽出) で入った可能性。本 unit は見出し除去のみで、字種の統一は ⑨ の横断正規化課題に預ける。

### ⑨ (継続)

- **machdiff の「agent 計上済 field は patch を外して評価」改修**: 本 unit では **`current_text` が是正後テキストの接頭辞になる型**
  (`q011` ア、文末の脱落) で、是正後にも patch が当たり偽の MISSED を出した。U4 / U5 の「空虚な一致」と同根。
- **N5 の「字が変わる型」の別ランク台帳化**: 本 unit で `q008`「ほ与.るる」/ `q024`「適功か」が加わる (**5 unit 連続**)。
- **非出荷の expl_jp key_guard note**: 2021r03 でも腐敗を現在形で記述 (§10)。

---

## 12. Rule B (失敗記録)

**本 unit の抄写 run・是正器に失敗 attempt は無し。** run は 1 回で完走 (88/88、UNREADABLE 1 は入力側のページ誤りで、fixer 実読で解消)。
是正器は pagefix `--self-test` / `--dry-run` → 適用、fidfix dry-run → `--apply` の初回で assert-once 違反 0。
`failures/` への新規追加は**なし**。precrop の誤帯割当 (§4n d) は失敗 attempt ではなく入力の欠陥として ⑨ に記録した。

---

## 13. Rule D

Writer = `u6-fixer` (opus)。**Reviewer は別 `subagent_type` (opus) で本 evidence の後に別途実施すること**
(本ファイルは writer の自己申告であり、Rule D の審査は未了)。

審査時の重点:

1. **§4n q053 の CLEAN 判定** — agent の判定がなく **writer 単独の実読**。page-25 上段を reviewer も自前で切り出して 5 field を逐字照合すること。
2. **§4n source ページ是正** — page-23 = 問50 のみ / page-24 = 問51・52 / page-25 = 問53・54 を reviewer が目視。
   判定 JSON が図なし `MOVE_QUESTION` で `figure_page_*` を書いていないこと、`question_bank` と `by_year` の両層で q051=24 / q053=25 であること。
   bigram 照合 (§4n c のスクリプト) を再実行して他 98 問にずれが無いこと。
3. **§8a precrop の md5 移動** (旧 q052 = 新 q051、旧 q053 = 新 q052) の再現と、既存 83 枚の byte 不変。
   結果 JSON の q052 / q053 notes_jp は是正前の crop を述べており、現ディスクとは食い違う (§8a の注意)。
4. **§8a `q011` の事後 MISSED が人工物であること** — 是正後テキストを直接読み、patch 再適用で重複が生じる機構を確認。
5. **§4b `q008`** — clean「及ぼす」→「与える」と、解説の**設問引用 1 箇所のみ**追随 (地の文 4 箇所は不変) の線引き。
6. **§2 severity 再分類** (agent 12/2 → fixer 8/8、machdiff 2 件込み) の当否、特に `q010` エ「= 呈」(正解肢上、「呈」は漢字) を cosmetic とした点。
7. **§4f / §4i のノンブル混入推定** (「ーg 一」= — 8 —、「ー弟一」= — 28 —) は推定であり、是正内容 (末尾ごみ除去) はこの推定に依存しない。
8. **§7 key_guard note 8 件** — 対象選定 (追記しない 5 件) と、q051 note へのページ是正の併記。
   後者は D-143 の note の目的 (答えの導出) の外にある source メタデータの記述 (q053 note は無し)。削るなら 1 置換で戻せる — reviewer 判断に委ねる。
9. 適用ループが U5 から逐字流用 (ラベル 1 語のみ差) であること。
10. **§11 `q050` figure_description** の数値腐敗の確認 (page-23 と照合) と、その扱い (母集団外・不変・⑨ 登記) の当否。

---

## 14. Rule D 独立審閲 (S125 U6、reviewer `pr-review-toolkit:code-reviewer` opus、fixer `oh-my-claudecode:executor` opus と別 type)

**判定: PASS-with-notes** — MAJOR 0 / MINOR 0 / 誤是正 0 / 漏れ 0 / `correct_answer` 変更 0 / **データ・脚本の修正を要する指摘 0**。
NIT 4 件は evidence の記述精度と ⑨ 登記 (MOVE_QUESTION の恒久ゲート不在) に関するもので、**是正 16 件 + page 是正 2 件はすべて支持**する。
reviewer はデータを一切書いていない (`build-quiz-corpus` / `quiz-phase2-merge` / `--apply` は未実行、下記 14i の代替証拠で冪等性を確認)。

### 14a. 前提 — 源の自前切り出し / manifest の同一性

- 実読はすべて `data/ip/exams/pages/2021r03/page-NN.png` (1432×2026) から **reviewer が自前で切り出した画像** (PIL lanczos、0.5〜0.85 倍、scratchpad `u6r/`)。
  切り出し範囲は、左余白 x140–200 の墨の行ラン (= 見出し「問NN」の行) で設問境界を機械的に決めた (14c と同じ検出器)。fixer の precrop・fixer の切り出しは使っていない。
- **manifest は再生成されていない**: `u6_fidelity_input_2021r03.json` mtime 11:15:17 < 結果 JSON 11:28:04 < bank / by_year 11:37:51。
  中の `source_page_png` は q051 = page-23 / q052 = page-24 / q053 = page-24 (是正前のまま)。事前 machdiff も §3 と逐字同一
  (`same=433 / AGENT_MISSED=2 (q070 / q100) / VERDICT_CONFLICT=0 / UNREADABLE skipped=1 / coverage 88/88`)。
- 結果 JSON を独立再計数: `CLEAN 76 / DISCREPANT 11 / UNREADABLE 1`、discrepancies **14** (semantic 12 / cosmetic 2) = §1 と一致。

### 14b. 採用 16 差分の独立実読 — **16/16 一致**

| id (page) | 差分 | reviewer の独立実読 | 判定 |
|---|---|---|---|
| q004 (p03) イ・ウ | 末尾 `␣×14「` / `␣×15「` 除去 | イ「…大量の例文デ / ータベース」、ウ「…画像入 / 力装置」で行が終わり、後に記号なし | **一致** |
| **q008** (p04) stem (clean) | `及ぼす` → `与える` | 題幹 5 行目「の価値を自ら評価し，残る大半の消費者に影響を**与える**グループはどれか。」 | **一致** |
| **q010** (p05) エ (**正解肢**) | 末尾 `= 呈` 除去 | 「…技術を時間軸とともに示した / もの」で終わり、以降はページ下端のノンブル「— 5 —」まで空白 | **一致** |
| **q011** (p06) ア | `…作業に適` → `…作業に適している。` | ア 1 行目末「非定型的な作業に適」、2 行目「している。」(単独行) | **一致** |
| q013 (p07) エ | `ごどとに` → `ごとに` | エ 2 行目「インターネット自動車保険の契約者**ごと**に，1年間の…」 | **一致** |
| q016 (p08) イ・エ | `全体␣␣␣'を` → `全体を` / 末尾 `ーg 一` 除去 | イ 1 行目末「物流チャネル全体」、2 行目頭「を効果的に管理すること」(記号なし)。エ「…店舗展開を行うこと」で終わる | **一致** |
| **q024** (p12) ア (**正解肢**) | `和柔軟な` → `柔軟な` | 「IT を活用した，場所や時間にとらわれない**柔軟な**働き方のこと」— 「和」相当の字形なし | **一致** |
| **q051** (**p24**) イ・ウ | `保有すする` → `保有する` / `toT` → `IoT` | page-24 上段 問51: イ「技術を保有する**ベンダ**に開発を委託する。」、ウ「**IoT** を採用した大規模システムの開発を…」— ウの先頭は大文字 I + 小文字 o + T で、同肢イ冒頭の「IoT」と同字形 | **一致** |
| q060 (p28) エ | 末尾 `ー弟一` 除去 | 「…パスワードを入力することによってログインできる。」で終わる。「利用者 ID」は源でも ID の前後に空き (表記揺れ不変に同意) | **一致** |
| q065 (p30) ウ | `のぞでかれない` → `のぞかれない` | 「他の社員に PC の画面を**のぞかれない**ように，離席する際に…」。見出し「問65」と「シャドー」の間に小さな汚れを reviewer も視認 (§4j 注記どおり) | **一致** |
| q070 (p33) stem (clean) | 読点復元 `a と b が, 1 対多` | 〔表記法〕の図の右「a と b が**，** 1 対多の関係であることを表す。」— 読点明瞭 | **一致** |
| **q072** (p34) ウ | `キャリアグリゲーション` → `キャリアアグリゲーション` | 「ウ　キャリア**ア**グリゲーション」 | **一致** |
| q100 (p45) stem | 先頭 `問100　` 除去 | 見出し「問100」は左余白の独立した見出しで、題幹は「システムの経済性の評価において，TCO の…」から始まる | **一致** |

加えて、**patch を外した直接照合**: 是正後の表示テキスト (stem = clean 優先、choices = raw) を manifest 複製 (scratchpad) に差し込み、
machdiff の `normStr` を逐字流用して agent の `source_transcript` と比較 → **16/16 field が patch なしで一致**。
manifest 複製で表示値が変わった field は**ちょうど 16** (§6 の 16 field と同一集合) で、他の field は是正前後で不変。

### 14c. page ずれ (q051 / q053) — **fixer と独立の方法で確認、他にずれ 0**

fixer は tesseract 全文 + bigram 照合 (§4n c)。reviewer は **OCR を使わない別方式**で確認した:

1. **見出し行の検出**: page-02〜45 を grey<150 で二値化し、左余白 x140–200 (選択肢記号「ア」の x≈210 より左、題幹の継続行 x≈240 より左) に墨がある
   高さ 15–40px の行ランを見出し「問NN」とみなす。page-24 で y210 / y878 の 2 本 (問51 / 問52) を座標確認。
2. **ページごとの見出し数 vs 記録の問数**: 44 ページ全部で**一致 (不一致 0 ページ)**、合計 100。
3. **見出し画像の目視**: 検出した 100 個の見出し帯を 1 枚の一覧に並べて読んだ → **問1〜問100 がこの順で 1 つずつ**、ページ番号も記録と一致
   (p13 = 問27・28・29、p22 = 問49、**p23 = 問50 のみ**、**p24 = 問51・52**、**p25 = 問53・54**、p26 = 問55、p32 = 問69、p33 = 問70、p35 = 問74、p43 = 問95)。
   問は連番なので、「各ページの問数が一致 + 見出しが昇順に 1〜100」で問→ページの対応は一意に決まる → **是正後の 100/100 が正しく、残るずれ 0**。
- page-23〜25 を 0.5 倍全面で目視: page-23 = 問50 (図+表 2 つ)、page-24 = 問51・問52 (下半分空白)、page-25 = 問53・問54 — §4n (b) の表と一致。
- **q053 の CLEAN を独立照合**: page-25 上段「問53　IT サービスにおける SLM に関する説明のうち，適切なものはどれか。」+ ア〜エ (各 2 行) を
  dataset の stem / ア / イ / ウ / エ と逐字照合 → **一致** (差は読点字種「，」↔「, 」のみ)。**CLEAN に同意**。
- **pagefix の適用の流儀**: 判定 JSON は 2 件とも `MOVE_QUESTION` / `figure_page_number: null`。現データは bank・by_year 両層で
  q051 = `pages/2021r03/page-24.png` / 24、q053 = `page-25.png` / 25、`figure_page_*` なし、2021r03 全 100 問で bank と by_year の `source` 不一致 0。
  `quiz-pagefix-apply.mjs --dry-run` = 「source 既に目標状態」× 2 / 適用 0 (冪等)。
- **questions.json 側**: `source` / page 系キーを持つ問 **0 / 2900** (D-145 §7 どおり)。2021r03 100 問の `source_label` 末尾「問NN」は id と全件一致 → 齟齬なし。
- **precrop の md5 移動 (§8a) を再現**: fixer の退避 `scratchpad/u6/precrop_pre/` (85 枚) と現ディスク (87 枚) を比較 → byte 同一 **83**、差 2 (q052 / q053)、新規 2 (q051 / q054)。
  現 `q051.png` = `752c6ddd…` = 旧 `q052.png`、現 `q052.png` = `8703476b…` = 旧 `q053.png` — §8a と一致。
- **§11 `q050` figure_description**: bank の値「片道 68 秒 / B 156 秒 / C 19 秒 / D ? 秒 / 起動処理 68 秒」を page-23 の図・表 (60 / 150 / 10 / 60 / 60 秒) と照合 → **腐敗は実在**。
  questions.json は `figure_description` を持たない (学習者不可視) — 母集団外・不変・⑨ 登記に同意。

### 14d. `q011` 事後 MISSED 1 = patch 接頭辞再適用の人工物 — **機構を再現**

- 是正後の表示値を差し込んだ manifest 複製 (prep / precrop を走らせず、scratchpad 上で作成) で machdiff → `same=434 / AGENT_MISSED=1 (q011 choice.ア)`、
  detail「…作業に適している.している.」 = §8a と逐字同一。
- 機構: agent の `current_text`「…工場での非定型的な作業に適」は是正後テキスト「…作業に適している。」の**接頭辞**なので、
  machdiff の `patched.includes(current_text)` が是正後も真になり、`replace` が「している。」を二重に付ける (`quiz-fidelity-machdiff.mjs:64`)。
- patch を外すと q011 ア は source_transcript と一致 (14b の 16/16 に含む)。**実残差 0 に同意**。U4 / U5 の「agent 計上済 field は patch を外して評価」⑨ と同じ課題。

### 14e. 漏れ — CLEAN 標本から fixer と重ならない 3 問を追加実読、**見落とし 0**

fixer の `q078` / `q027` / `q021`、machdiff の `q070` / `q100` は使わず、型の異なる 3 問を選んだ:

| id (page) | 選定理由 | 実読結果 |
|---|---|---|
| `q042` (p19) | 題幹 6 行の長文 (行送り脱落型 = q011 の陰性対照) | 題幹 6 行・4 肢 (資源 / スコープ / スケジュール / 統合マネジメント) とも一致。行送りでの脱落なし |
| `q079` (p37) | 欧文引用符 `“SECURITY ACTION”` と英大文字略語 (IPA / ISMS) | 引用符字種 `“ ”` まで一致、4 肢一致 |
| `q091` (p41) | a〜d の列挙 + 組合せ肢 | a〜d 4 行と ア〜エ の組合せが一致 (「〜」は波ダッシュ許容、ルビ「ぜい」は非転写で正)。答え イ (a, b, d) とも整合 |

→ **漏れ 0**。累計も再計算: 462+70+87+52+60+88 = **819**、40+8+9+4+15+13 = **89**、89/819 = **10.9%**、正解肢上 **16**、aa **3** — §2 と一致。

### 14f. 層の網羅・波及ゼロ

| 検査 | 結果 |
|---|---|
| `git diff --name-only -- data/` | **3 本のみ** (`questions.json` / `translations/2021r03.json` / `explanations/2021r03.json`)。`--numstat` = +14/−14 / +2/−2 / +65/−9 で §7 の表と一致 ✅ |
| `questions.json` の差分 | 14 field (choices 13 + q100 stem)、`git diff -U0 data \| grep -c '"correct_answer"'` = **0** ✅ |
| 3 層の全量照合 (`stem_jp` + `choices_jp` + `correct_answer`) | questions 対 bank 不一致 **0 / 2900**、questions 対 by_year (2021r03) **0 / 100** ✅ |
| `answer_keys.json` | md5 **`6802bb0bc13004da78ad3c4e5117d997`** = §2 と一致 ✅ |
| **`choices_jp_clean` の不在** | 2021r03 sidecar 100 問のキー集合 = {`stem`, `choices`, `stem_jp_clean`}、clean **64** 題、q100 は clean なしを実測 → **§7「選択肢の腐敗は学習者に見えていた」は正** ✅ |
| `.phase1` / `.phase2` (fixer の適用前控え `scratchpad/u6/pre/` 129 本と `cmp`) | 変化は **`tr_q008` / `tr_q070` / `expl_jp_q008` の 3 本のみ**、他 (tr 98 本・expl 27 本) は byte 同一。`.phase1` の clean は sidecar と同値 (q008 一致、q070 に復元読点あり) ✅ |
| `generate_result_2021r03.json` (控えと比較) | top-level キー不変、変化 **8 問**、変化 path は **`key_guard.note_jp` のみ**、8/8 `startsWith(旧 note)`、`key_guard_round1` 変化 **0 / 100** ✅ |
| **D-143 note 8 件** | note 中の答え記号 = `correct_answer` = `derived_answer` を 8/8 機械照合 (q008 ア / q010 エ / q011 エ / q013 ウ / q024 ア / q051 エ / q065 エ / q072 ア)。答えの導出文 (q051「固定された短期間のサイクル」= page-24 エ) も源と整合。非追記 5 件 (`q004` / `q016` / `q060` 誤答肢の末尾ごみ・記号、`q070` / `q100` stem の読点・見出し) は U5 §14g と同一規則 ✅ |
| 他 exam | tracked は translations 他 28 exam・explanations 他 28 exam とも byte 不変。bank / by_year の他 exam は適用前控えが無いため、questions⇔bank 全量一致 0 / 2900 + crosscheck B6 (bank==by_year、29 exam) + pagefix が判定 2 id しか触らない構造、を根拠とする ✅ |

### 14g. 判断事項

- **q008 の線引き (審閲項目 1)** — **支持**。correct.jp の「設問の三条件「2番目に早い」「自ら価値を評価」「残る大半に影響を与える」」は鉤括弧で題文を引いているので追随が正しい。
  出荷解説に残る「及ぼ」は correct.jp の地の文 1 (「大きな影響を及ぼす」) と distractor イ の 2 (「影響を「及ぼす」側ではなく…「受ける」側」の対比 / 「2番目に早い・影響を及ぼすという条件」)。
  後者は題文の条件を要約しているが鉤括弧の引用ではなく、「受ける」との対比で解説者の語として成り立つ → 不変に同意。
  zh「对其余大多数产生影响」/ en "influences the remaining majority" は「与える」「及ぼす」どちらの訳としても正しく、追随不要に同意。
- **severity 再分類 (12/2 → 8/8)** — 結論に同意。`q010 エ`「= 呈」は完結した文「…示したもの」の後ろの混入で、「呈」が漢字でも語の内部に入っていない → cosmetic。
  ただし §2 の「いずれも文の外側のごみ」は `q016 イ`「全体␣␣␣'を」には当たらない (NIT-1)。
- **q051 note の pagefix 併記 (審閲項目 4)** — **残してよい**。事実どおり・MARK 付き・1 置換で戻せ、UI は `key_guard` の `suspect` しか読まない。
  非対称 (q053 は CLEAN で note を書く対象が無く、page 是正の記録は判定 JSON + 本 evidence のみ) は欠陥ではない。
- **脚本の流用** — `sub()` は U5 と `diff` 出力なし、適用ループ (`// ── 適用` 以降) は最終 `console.log` の `u5`→`u6` 1 語のみ差 — §7 の記述どおり。

### 14h. 指摘 (**MAJOR 0 / MINOR 0 = データ・脚本の修正は不要**)

| # | 内容 | 推奨処置 |
|---|---|---|
| NIT-1 | **§2 の「(いずれも文の外側のごみ…)」は `q016 イ` に当たらない。** `全体␣␣␣'を` は行送り位置の文中の記号混入 (U5 `q054 イ`「プロジェクト_␣」と同型)。記号のみで字が変わらないので cosmetic の結論は不変 | §2 の括弧書きを「文末の後ろのごみ、または行送り位置の記号混入」に修正 |
| NIT-2 | **本 unit は repo で初めて本番適用された `MOVE_QUESTION` (図なし分岐) だが、恒久ゲートが無い。** `pagefix_S118_decisions.json` は KEEP 20 / SPLIT_FIGURE 15、groups_derived は全件 SPLIT_FIGURE で、`--assert-clean` (B) は S118 の 2 本だけを読み `verdict !== "SPLIT_FIGURE"` を skip する。crosscheck B7 は `page_*` の形と実在しか見ず、判定値との一致は見ない。→ `source` を再生成・上書きする script が将来走ると q051 / q053 は**無言で 23 / 24 に戻りうる**。§9 の assert-clean 行「判定 JSON 50 件」も U6 の判定を含まない | ⑨ 登記: `DEC_FILES` に S125 判定 JSON を加え、(B) を `MOVE_QUESTION` の `page_number` / `page_image` の両層一致まで拡張。§4n / §9 に「U6 の page 是正は現状ゲート外」と 1 文 |
| NIT-3 | **q008「及ぼす」の箇所数の記述が節ごとに違う。** §4b「地の文の『及ぼす』4 箇所」、§10「地の文 3 箇所 + distractor イ」、脚本コメント「4 箇所」。出荷解説の実測は correct.jp 1 + distractor イ 2 = **3** (非出荷の expl_jp key_guard note に別に 2)。また非出荷 note は「stem_jp_clean で『影響を及ぼす』と正しく復元」と述べ、是正後は事実に反する (§10 の ⑨ 継続扱いで良い) | §4b / §10 の数を「出荷解説 3 (correct 1 + イ 2)」に統一し、§10 の非出荷 note 行に q008 の古い記述を 1 語添える |
| NIT-4 | **§9 chumon 行の情報行は `2015h27h-mqD` だけでなく `mqC` もある** (いずれも既存の「registry に対応する組が無い」情報行、判定は一致) | 表記の補足のみ |

補記 (指摘ではない): §1 の token 数・時間・tool 呼び出し数は workflow ログ由来で reviewer は独立検証できない (fixer 申告として扱う)。

### 14i. ゲート再実行 (すべて reviewer が自分で実行)

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ SPLIT_FIGURE 0 件 / (A)(B) GREEN (**U6 の MOVE_QUESTION は射程外** — NIT-2) |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 |
| `pnpm -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm -C apps/web exec vitest run` | ✅ **33 passed / 1 skipped (34 files)、501 passed / 2 skipped (503 tests)** |
| `node --check scripts/quiz-fidfix-S125-u6.mjs` | ✅ |
| fidfix dry-run (既定) | ✅ `(dry-run) applied 0, skipped 61` = 適用済 55 + 想定 skip 6 |
| pagefix `--dry-run` | ✅ source 相 適用 0 / 既適用 2 |
| machdiff (事前 manifest) | ✅ `same=433 / AGENT_MISSED=2 / VERDICT_CONFLICT=0 / coverage 88/88` (q070 / q100、§3 と同一) |
| machdiff (是正後値の manifest 複製、scratchpad) | ✅ `same=434 / AGENT_MISSED=1` (q011 人工物、14d) |
| 再生成の冪等性 | 書込みを伴うため**未実行**。代替証拠: 3 層全量一致 0 / 2900、merge 済 `explanations` の q008 correct.jp が `.phase2/expl_jp` と同文 (「与える」)、note 8 件が `generate_result` の final と同文、fidfix / pagefix の dry-run が適用 0 |

### 14j. 再現コマンド

```
# 源の自前切り出し (PIL lanczos、scratchpad/u6r/cr.py)
python3 cr.py <page> x0 y0 x1 y1 <scale> out.png          # data/ip/exams/pages/2021r03/page-NN.png から

# 見出し検出 (14c): 左余白 x140–200 の墨の行ラン = 「問NN」
python3 - <<'PY'
from PIL import Image; import numpy as np
for p in range(2,46):
    im=np.array(Image.open(f'data/ip/exams/pages/2021r03/page-{p:02d}.png').convert('L'))<150
    r=im[:,140:200].sum(1); runs=[]; s=None
    for y,v in enumerate(r):
        if v>0 and s is None: s=y
        if v==0 and s is not None: runs.append((s,y)); s=None
    print(p, [(a,b) for a,b in runs if 15<=b-a<=40 and a<1900])   # 個数を bank の page_number 別問数と比較、帯を並べて目視
PY

# machdiff 事前 / 事後 (事後は manifest を scratchpad に複製し displayed_* を現データで置換 — prep / precrop は走らせない)
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u6_fidelity_input_2021r03.json evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u6_2021r03_sn.json
node scripts/quiz-fidelity-machdiff.mjs <scratchpad>/u6r/post_manifest.json evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u6_2021r03_sn.json

# 冪等 (読取専用)
node scripts/quiz-fidfix-S125-u6.mjs
node scripts/quiz-pagefix-apply.mjs --decisions evidence/phase5/stage_06_quiz_fidelity/pagefix_S125_u6_decisions.json --dry-run

# ゲート
node scripts/quiz-keys-crosscheck.mjs && node scripts/quiz-pagefix-derive-groups.mjs --assert-clean && node scripts/quiz-chumon-groups-build.mjs --check
pnpm -C apps/web exec tsc --noEmit && pnpm -C apps/web exec vitest run
md5 -q data/ip/exams/answer_keys.json      # 6802bb0bc13004da78ad3c4e5117d997
```

## 15. NIT 処置 (主 context、S125)
- NIT-1: §2 括弧書きを「文末の後ろのごみ、または行送り位置の記号混入」に修正。
- NIT-2: MOVE_QUESTION の恒久ゲート不在 (assert-clean(B) は SPLIT_FIGURE のみ、B7 は値照合しない) → ⑨ 登記 (session log §9)。本 unit のデータ修正は不要。
- NIT-3: §4b / §10 の「及ぼす」箇所数を出荷実測 3 (correct.jp 1 + distractor イ 2) に統一。非出荷 note の記述ずれは ⑨ 継続。
- NIT-4: §9 chumon 行に mqC を併記。
