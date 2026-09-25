# ⑤-2 全量保真掃引 U9 — 2024r06 の集計と是正 (S125)

⑤-2 全量核験の **U9** (`docs/phase5/PLAN_52_units.md` §2、D-146 第 11 unit)。母数は
`evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json` の 2024r06 = **72 問**。
**Sonnet 5 単 pass** の 8 回目の本番 unit。

---

## 1. 入力と実行

- run: `wf_35e2fa62-0ea` (label `u9`、pass `sn`、model = **Sonnet 5**)
- マニフェスト: `data/ip/quiz/.phase2/u9_fidelity_input_2024r06.json` (`--precrop` 版、crop **68/72**)
  - skip 4 問: **page_mismatch 4** (2 ページ)。`q059` (page-26) は crop 無し → agent も fixer も源ページ直読
- 結果 JSON: `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u9_2024r06_sn.json`
- **覆盖 72/72 / CLEAN 67 / DISCREPANT 5 / UNREADABLE 0**、差分 10 {semantic 2, cosmetic 8}、正解肢上 1 (`q012 ア`)
- 是正器: `scripts/quiz-fidfix-S125-u9.mjs` (既定 dry-run、`--apply` で書込み)

### Sonnet 単 pass の実測

| 項目 | U6 (2021r03 88) | U7 (2022r04 75) | U8 (2023r05 91) | **U9 (2024r06 72)** |
|---|---|---|---|---|
| token | 5,572,875 | 4,944,550 | 5,933,780 | **4,642,332** |
| token / 問 | 63,328 | 65,927 | 65,206 | **64,477** |
| 時間 | 11.9 分 | 13.4 分 | 13.7 分 | **9.7 分** |
| tool 呼び出し | 685 (7.8) | 740 (9.9) | 851 (9.4) | **648 (9.0 回/問)** |
| UNREADABLE | 1 | 0 | 0 | **0** |

(token・時間・tool 数は主 context 申告の workflow ログ値。)

---

## 2. 率

| exam | n | agent DISCREPANT | +machdiff | 計上 (率) | **是正** (率) | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|---|---|
| 2024r06 | 72 | **5** | **+0 題** (AGENT_MISSED 0) | 5 (**6.9%**) | **5 (6.9%)** | **1** | **0** |

- 題数 5 = q012 q059 q062 q082 q085 (agent DISCREPANT 5 題と同一)。
- agent の 10 差分は**全件採用**。加えて指示で名指しされた `q062`「convert(arrayInput) として」の空白 1 件を採用 → **11 論理差分**。非採用 **0**。
- **severity 再分類 (fixer、11 論理差分)**: cosmetic **9** / semantic **2** / answer_affecting **0**。
  規則 (U6〜U8 §2 と同一): 読点・句点・引用符・括弧の字種、見出し、空白 → cosmetic、語の内部で字が入る / 落ちる / 置き換わる → semantic。
  - agent {semantic 2, cosmetic 8} から **2 件を入れ替えた**: `q012 ア` (読点脱落のみ → cosmetic) / `q082 エ` (語の内部に「ヘ」挿入 → semantic、U8 `定義むする` と同型)。
  - cosmetic 9 = `q012 ア` 読点 1 + `q062` stem (括弧 1 + 引用符 4 [AABAB / 空文字列 / A / B] + 空白 1 = 6) + `q085` stem 引用符 2。
  - semantic 2 = `q059 ア` 10cm / `q082 エ` へ。
- **正解肢上 1 差分** = `q012 ア` (cosmetic)。**`correct_answer` は不変**。
- `correct_answer` 変更 **0 / 2900**、`data/ip/exams/answer_keys.json` **バイト不変** (md5 `6802bb0bc13004da78ad3c4e5117d997`、mtime `1788586696` 前後同一)。

### 既往波との比較

| | 標本 | 計上 | 率 | 正解肢上 | answer_affecting | 抄写 model |
|---|---|---|---|---|---|---|
| 波 1–3 (Opus 双 pass) | 462 | 40 | 8.7% | 6 | 2 | Opus 双 pass |
| U3a (2018h30h) | 70 | 8 | 11.4% | 2 | 1 | Sonnet 単 pass |
| U3b (2019h31h) | 87 | 9 | 10.3% | 1 | 0 | Sonnet 単 pass |
| U4 (2019r01a) | 52 | 4 | 7.7% | 1 | 0 | Sonnet 単 pass |
| U5 (2020r02o) | 60 | 15 | 25.0% | 4 | 0 | Sonnet 単 pass |
| U6 (2021r03) | 88 | 13 | 14.8% | 2 | 0 | Sonnet 単 pass |
| U7 (2022r04) | 75 | 19 | 25.3% | 9 | 3 | Sonnet 単 pass |
| U8 (2023r05) | 91 | 16 | 17.6% | 4 | 0 | Sonnet 単 pass |
| **U9 (2024r06)** | **72** | **5** | **6.9%** | **1** | **0** | **Sonnet 単 pass** |
| **累計 (波 1–3 + U3a〜U9)** | **1057** | **129** | **12.2%** | **30** | **6** | — |

(正解肢上は従来どおり**差分数**で数える。)

U9 の支配型は **擬似言語の引用符・括弧字種** (q062 / q085 — clean 化で “” が「」に、〔〕が [] に正規化されていた) と、
**slashed zero の 0→9 誤読** (`q059`「10cm→19cnm」、U5・U7・U8 に続く **4 unit 目**、exam 数では 5 exam 連続)。
率 6.9% は Sonnet 単 pass unit で最低。DISCREPANT が少ないため §4f の CLEAN 抽検を重視した。

---

## 3. 機械 diff (machdiff) — **AGENT_MISSED 0**

```
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u9_fidelity_input_2024r06.json \
  evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u9_2024r06_sn.json
machdiff: fields same=360 | AGENT_MISSED=0 | VERDICT_CONFLICT=0 | audits w/o transcript=0 | UNREADABLE skipped=0 | coverage 72/72
```

候補なし。偽陽性の判定作業も無し。

---

## 4. 裁定 (fixer が源を原寸〜8 倍で独立実読)

実読した源: `data/ip/quiz/.phase2/precrop/2024r06/` の **q012 / q062 / q082 / q085** (crop)、crop を持たない **`q059` は page-26 直読** (4 倍拡大)。
引用符の字形は **sharp で 8 倍**に拡大して開き・閉じの形 (66 形 / 99 形) を確認した (画像は scratchpad `u9/q62*.png` / `q85*.png` / `q59.png`)。
agent の `source_text` は候補として扱い、すべて自分の目で読んでから from/to を決めた。**採用 11 / 非採用 0**。

### 4a. `q012 ア` (**正解肢**) — 読点脱落 (cosmetic)

返却の先頭 40 字では同一に見えるが、差は後半: dataset「…推進し, 大学,研究機関企業など, 官民…」/ 源 (p07 crop)「…推進し，大学，/ 研究機関，企業など，官民…」。
「研究機関」と「企業」の間の読点が脱落して 1 語に見えていた。同じ from 内の「大学,研究」も house rule「, 」に揃えた (U8 q094 precedent)。
zh「大学、研究机构、企业等」/ en "universities, research institutions, and companies" は既に正。解説は語の引用なし → 不変。
**正解肢**だが区切り記号のみで答え (ア) の導出は不変。key_guard final note を追記 (U8 q035 ア precedent)。

### 4b. `q062` stem — 擬似言語の括弧・引用符・空白 (cosmetic ×5)

源 (p28 crop):
- 見出し「〔プログラム〕」(亀甲括弧)。clean「[プログラム]」→ 是正。raw は崩れた「[プログラム】〕」で、同じく「〔プログラム〕」に是正 (**U8 reviewer が残存 ID として名指し**)。
- 題幹「…convert(arrayInput)として呼び出したときの戻り値が“AABAB”になる…」: “AABAB” は 66 形の開き + 99 形の閉じ (q62f 8 倍)。
  clean「「AABAB」」→ “AABAB”。raw の ASCII `"AABAB"` も “AABAB” に。
  「convert(arrayInput) として」の空白は**指示で名指し**されたため採用 (源 q62d は ) と「と」の間に空白なし。均等割付の行で字間は広いが語間空白ではない)。raw は既に空白無し。
- 擬似言語本文の文字列リテラル `stringOutput ← ""` / `に "A" を` / `に "B" を`:
  **源の字形は開き・閉じとも 99 形** (q62e / q62g / q62h を 8 倍、等幅書体 — 同行の斜線入りゼロと同じ書体) — ASCII `"` の等幅書体表示とみられ、題幹の “AABAB” (66/99) とは字形が違う。
  dataset clean は「」「A」「B」。**“” に統一した** (Rule D 確認点 ①):
  - 採った理由: 指示 (「」→“”)、agent の transcript、同じ unit の `q085` 注釈行 “1” (66/99、q85a)、題幹 “AABAB” との一貫性。jp 出荷層には ASCII `"` を置かない運用 (U8 q004 / q092)。
  - 退けた案: ”A” (99+99 の字形そのまま、学習者には誤植に見える) / ASCII "A" (字形からの推定で確証なし、PDF はテキスト層なし — `pdftotext` 出力 52 byte)。
- zh: 「[程序]」→「〔程序〕」(sidecar の多数形 7:2) と「AABAB」「」「A」「B」→ “”。en: 「AABAB」等 → “”。**en「[Program]」は不変** (corpus 9/9 が [Program]、英語の体裁)。
- raw の他の崩れ (「stringOutput で ""」「i†」「未尾」「"A”」) は N5 (clean が出荷層) で据置。
- **解説**: 設問の文字列リテラルを引く「AABAB」と、各肢から導いた戻り値「BBABA」「BABAA」「ABABB」、出力文字「A」「B」を jp / zh / en とも “” に揃えた (計 36 置換、field ごとの出現数を事前実測して assert — §7)。
  地の文の「」引用 (「要素が1と等しい」/ en「the element equals 1」) は文字列リテラルではないので不変。
- 答え (エ {1,1,2,1,0} → AABAB) は不変。key_guard note は追記しない (U8 q060 precedent)。

### 4c. `q085` stem — 引用符 (cosmetic ×2)

源 (p38 crop 5 倍): 題幹「引数として“100”を受け取ると」、注釈行「// 例: 文字“1”であれば」— いずれも 66/99 の “”。
clean「「100」」「「1」」→ “100” / “1”。raw の ASCII `"100"` / `"1"` も “” に、raw「[プログラム]」→「〔プログラム〕」(clean は既に〔〕、U8 reviewer NIT-3 で名指し)。
zh / en の「100」「1」→ “”、解説の「100」6 箇所 (jp / zh / en の correct・イ) も “” に。
`［ a ］` `［ b ］` (源は罫線囲みの空欄) は描画補助で agent も非計上 → 不変。答え (エ) 不変。

### 4d. `q059 ア` — slashed zero「19cnm」→ 源「10cm」(semantic)

page-26 を 4 倍: 「ア　10cm 程度の近距離にある機器間で無線通信する。」。0 は斜線入りゼロ (同頁「問60」の 0 と同じ書体)、「cm」の間に字は無い。
dataset「19cnm」は 0→9 誤読 + 「n」挿入。zh「约 10cm」/ en "about 10 cm" は既に正。
解説アの末尾 OCR 注記 (jp「(記載の「19cnm 程度」は OCR 化けで…)」/ zh「（原文所记的…）」/ en "(The stated 「19cnm」…)") は是正後に偽 → 除去 (U7 q014 / U8 q024 precedent)。答え (イ OCR) 不変。

### 4e. `q082 エ` — 「サービスヘへ」→ 源「サービスへ」(semantic)

p37 crop: 「利用者がクラウドサービスへログインするときの環境，IP アドレスなどに…」。dataset は片仮名「ヘ」(U+30D8) + 平仮名「へ」の 2 字。
agent は cosmetic としたが、語の内部への字の挿入なので U8 基準で semantic。zh / en は正。誤答肢で答え (イ) 不変。

### 4f. CLEAN 標本の無作為抽検

CLEAN 67 問 (id 昇順) から **seed 129 の LCG** (`s = (s·1103515245 + 12345) mod 2^31`、`c[s mod 67]`) で 3 問を抽出し、源 crop と逐字照合した。

| id | 実読結果 |
|---|---|
| `q006` (crop) | 題幹「技術戦略の策定や技術開発の推進といった技術経営に直接の責任をもつ役職はどれか。」、4 肢 CEO / CFO / COO / CTO が一致 |
| `q080` (crop) | 題幹「OSS (Open Source Software) に関する記述として，適切なものだけを全て挙げたものはどれか。」、a〜c 3 行、4 肢 a / a,b / b,c / c が一致 |
| `q091` (crop) | 題幹「職場で不要になった PC を廃棄する場合の情報漏えい対策として，最も適切なものはどれか。」と 4 肢 (ア…全て削除する / イ…アンインストールする / ウ…論理フォーマットする / エ…規定回数だけ上書きする) が一致 (読点字種・英数字周囲の空白のみ) |

→ **見落とし 0**。

---

## 5. SOURCE_TYPOS

本 unit では**該当なし**。

---

## 6. 採用した差分 (5 題 / 11 論理差分)

| id (page) | field | 差分 | severity | 由来 |
|---|---|---|---|---|
| q012 (p07) | choice.ア | `大学,研究機関企業など` → `大学, 研究機関, 企業など`。**正解肢** | cosmetic (agent: semantic) | agent |
| q059 (p26) | choice.ア | `19cnm` → 源 `10cm` (解説アの OCR 注記除去) | **semantic** | agent |
| q062 (p28) | stem | `[プログラム]` (raw `[プログラム】〕`) → 源 `〔プログラム〕` (zh `〔程序〕`) | cosmetic | agent |
| q062 (p28) | stem | `「AABAB」` (raw ASCII) → 源 `“AABAB”` (zh / en・解説追随) | cosmetic | agent |
| q062 (p28) | stem (clean) | `← 「」` → `← “”` (zh / en 追随) | cosmetic | agent |
| q062 (p28) | stem (clean) | `「A」` → `“A”` (zh / en・解説追随) | cosmetic | agent |
| q062 (p28) | stem (clean) | `「B」` → `“B”` (zh / en・解説追随) | cosmetic | agent |
| q062 (p28) | stem (clean) | `convert(arrayInput) として` → `convert(arrayInput)として` | cosmetic | 指示 (agent の差分 1 の current_text に含まれていた) |
| q082 (p37) | choice.エ | `サービスヘへ` → 源 `サービスへ` | **semantic** (agent: cosmetic) | agent |
| q085 (p38) | stem | `「100」` (raw ASCII) → 源 `“100”` (zh / en・解説追随) | cosmetic | agent |
| q085 (p38) | stem | `文字「1」` (raw ASCII) → 源 `文字“1”` (zh / en 追随) | cosmetic | agent |

- jp 読点の字種は house rule の ASCII `", "` (D-147 §1)。

### zh / en / 解説の追随

| id | zh | en | 解説 | 判定 |
|---|---|---|---|---|
| q062 stem | `[程序]`→`〔程序〕`、「」→“” ×4 | 「」→“” ×4 (`[Program]` は不変) | リテラル “” 化 36 置換 (jp / zh / en) | **全層追随** |
| q085 stem | 「」→“” ×2 | 「」→“” ×2 | “100” 化 6 置換 | **全層追随** |
| q059 ア | 既に正 (10cm) | 既に正 (10 cm) | OCR 注記を jp・zh・en から除去 | **解説のみ追随** |
| q012 ア / q082 エ | 既に正 | 既に正 | 腐敗語の引用なし | 不変 |

### 指示から外した点 (逸脱)

1. **q062 擬似言語リテラルの字種** — 指示は「源の字種どおりに」だが、源本文の字形は 99+99 (§4b)。字形そのまま (”A”) ではなく **“A” を採った**。理由と退けた案は §4b。**Rule D 確認点**。
2. **raw 層の追加是正** (指示外、同じ差分の層追随): q062 raw「[プログラム】〕」「"AABAB"」、q085 raw「"100"」「"1"」「[プログラム]」。raw の他の崩れは N5 据置。
3. **解説の戻り値文字列** (「BBABA」等) は設問の引用ではなく解説者の導出だが、同じ文字列リテラルとして “” に揃えた (同一解説内で「」と “” を混在させないため)。
4. **en「[Program]」は据置** — 指示は q062 を「全層で揃える」だが、en の見出しは corpus 9/9 が `[Program]` で英語の体裁として統一されているため、en だけ〔Program〕にすると corpus 内で孤立する。en は引用符のみ揃えた。**Rule D 確認点**。

---

## 7. 層と局所性

適用時の ✓ 行 (dry-run と同一) を層別に数えた実数:

| 層 | 置換操作数 | 備考 |
|---|---|---|
| raw (`questions.json` / `question_bank.json` / `by_year/2024r06.json`) | **24** | choices 3 置換 × 3 = 9 / stem 5 置換 (q062 見出し・AABAB、q085 100・1・見出し) × 3 = 15 |
| sidecar (`translations/2024r06.json`) | **21** | `stem_jp_clean` 8 (q062 ×6 / q085 ×2) + zh・en 13 (q062 zh 5・en 4 / q085 zh 2・en 2) |
| `.phase1/tr_<id>.json` | **4** | `tr_2024r06-q062` のみ: clean 3 (見出し・AABAB・空白) + zh 1 (`[程序]`)。§7a |
| 解説 `.phase2/expl_{jp,tr}_*.json` | **45** | q059 ア 3 / q062 リテラル 36 (subN) / q085 “100” 6 (subN) |
| key_guard final note (`.phase2/generate_result_2024r06.json`) | **3** | D-143: **final のみ**、round1 不可触 |
| **fidfix 合計** | **97** | `quiz-fidfix-S125-u9.mjs` の `applied` と一致 |
| skip (想定どおり) | **46** | 片層にしか無い腐敗の n=0 (raw ↔ clean の別行、clean のみのリテラル、.phase1 の差異 §7a)。**無言 guard skip 0**、⚠ 行 0 |

### 7a. `.phase1` と sidecar の既存の乖離 (本 unit 起因ではない)

- `tr_2024r06-q062.json` の `stem_jp_clean` / zh / en は ASCII `"AABAB"` `""` `"A"` `"B"` を持ち、sidecar (「」) と**適用前から**違う (sidecar 側が後段で「」に正規化されたとみられる)。
  置換は共通する見出し・空白・`"AABAB"` (clean の ASCII 行が raw 用の行に当たる) に当たり、ASCII のリテラルは残る。`.phase1` は非出荷。
- `tr_2024r06-q085.json` は `stem_jp_clean` キーを持たず (sidecar のみ、U8 q033 と同型)、zh / en も ASCII `"100"` で sidecar の行に当たらない → 変化なし。
- (U7 NIT-3 / U8 14i と同型の既存乖離。⑨ に記録。)

### 選択肢に clean 層は無い = **腐敗は学習者に見えていた**

- 2024r06 の sidecar のキー集合 = {`stem`, `choices`, `stem_jp_clean`} (clean は 50 題)。**`choices_jp_clean` は存在しない** (実測)。
- → 選択肢の 3 置換 (q012 ア / q059 ア / q082 エ) はすべて出荷層の腐敗。stem の q062 / q085 は clean を持つ (表示は clean 層)。

### 適用ループの由来と U8 からの変更 (Rule D 向け)

`quiz-fidfix-S125-u9.mjs` の `sub()` と適用ループ本体 (FIX / EXPL / NOTE) は U8 から逐字流用。変更は次の 3 点のみ:

1. **U8 NIT-1 反映**: `rj` が読込時の `JSON.stringify(d,null,2)` を Map に控え、`wj` は正規化文字列が変わったファイルだけを書く。
   結果: 書込み **12 本** (U8 型の無条件書込みなら `.phase1` の q085 等も整形だけ変わっていた)。`.phase1` は 2 space pretty 形式 (Rule D NIT-1 で「compact」を訂正)、直列化差を避けるためバイトでなく正規化文字列で比較。
2. **U8 NIT-2 反映**: pointSub の zh / en も `tr.points[idx][L]` が文字列でなければ throw (jp と対称)。本 unit では pointSub は**未実行**。
3. **`subN()` 追加**: 解説の文字列リテラルは 1 field 内に複数回出る (q062 correct の「AABAB」×2) ため、assert-once の `sub()` では書けない。
   `EXPECT` に field ごとの出現数を**適用前の実測値で固定**し、(a) 期待 0 の field に出現があれば throw、(b) 期待と違う数なら throw、(c) 置換後に to が n 回あることを肯定確認。0 回なら skip (冪等)。出荷 field (correct / distractors / points) のみ走査し、`key_guard` (非出荷) は触らない。

### key_guard final note

- 対象 **3 件** = 語義 (`q059` `q082`) + 正解肢命中 (`q012`)。**追記しない 2 件** = `q062` / `q085` (括弧・引用符・空白のみ)。
- 3 問とも final note・round1 とも空文字 (事前)。**3 件とも純粋な後置** (`final.startsWith(旧 final)` 3/3)、`key_guard_round1` の変更 **0 / 100**、note_jp 以外の変化 **0** (適用前退避との機械照合)。
- merge は final ≠ round1 のため **3 問に `round1` ブロック (note_jp = "") を新規 publish** (U5〜U8 と同じ D-143 の挙動)。`explanations` 内の MARK `fidfix-S125-u9` = **3**。

### tracked データの差分 (`git diff --numstat`)

| ファイル | 差分 | 内訳 |
|---|---|---|
| `data/ip/quiz/questions.json` | +5 / −5 | 5 key = choices 3 (q012 ア / q059 ア / q082 エ) + stem_jp 2 (q062 / q085) |
| `data/ip/quiz/translations/2024r06.json` | +6 / −6 | clean 2 行 (q062 / q085) + zh・en 4 行 |
| `data/ip/quiz/explanations/2024r06.json` | +51 / −30 | 解説本文 (q059 / q062 / q085) + final `note_jp` 3 + **`round1` ブロック 3 の新規 publish** |
| 他 28 exam の `translations/`・`explanations/` | **0** | 再 merge なし |

`question_bank.json` / `by_year/2024r06.json` / `.phase1` / `.phase2` は gitignore 下 (適用前状態は scratchpad `u9/pre/` に控えて照合)。
`.phase1` の変化は `tr_2024r06-q062` の 1 本、`.phase2` は `expl_{jp,tr}_q059 / q062 / q085` の 6 本 + `generate_result_2024r06` のみ。

---

## 8. 事後核験

**(a) 是正後 manifest を再構成して machdiff を再実行**

```
node scripts/quiz-fidelity-prep-any.mjs 2024r06 u9post "<72 問の番号>" --precrop
  precrop: 68/72 questions cropped; skipped 4 questions (page_mismatch 4 / chumon 0 / merged_preamble 0 / thin_band 0), 2 pages (page_mismatch)
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u9post_fidelity_input_2024r06.json <同じ結果 JSON>
machdiff: fields same=360 | AGENT_MISSED=0 | VERDICT_CONFLICT=0 | audits w/o transcript=0 | UNREADABLE skipped=0 | coverage 72/72
```

- precrop は再 prep で **68 枚すべて byte 不変** (適用前退避 `scratchpad/u9/pre/precrop/` と `cmp`)。生成した `u9post` manifest は削除済。

**(b) 出荷層の残存語** (`questions.json` + `translations/2024r06.json` + `explanations/2024r06.json`、2024r06 内):
`19cnm` / `サービスヘへ` / `研究機関企業` は **final note 内の是正記述のみ**。`「AABAB」` `「A」` `「B」` `「100」` `[程序]` `OCR 化け` `OCR 乱码` `OCR garble` は **0**。
(`[プログラム]` の残り 1 件は `2025r07-q078` の raw stem、`ヘへ` の残り 2 件は `2014h26h-q054` / `2020r02o-q064` の raw stem — いずれも他 exam・clean が出荷層で N5、§11。)

**(c) 波及ゼロの機械証明**

| 検査 | 結果 |
|---|---|
| `questions.json` 2900 問の変化 key | **5 key / 5 題** = §6 の 5 題 |
| `correct_answer` 変更 | **0 / 2900** (機械照合) / `git diff -U0 data \| grep -c '"correct_answer"'` = **0** |
| `translations/` 追跡下 29 exam | **2024r06 の 6 行のみ** |
| `generate_result_2024r06.json` | note 変化 3 (純粋後置 3/3)、round1 変化 0、他 path 変化 0 |
| `answer_keys.json` | **md5 `6802bb0bc13004da78ad3c4e5117d997`、mtime `1788586696` 前後同一** |

---

## 9. ゲート

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ SPLIT_FIGURE 0 件 / (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ `chumon_groups.json は生成結果と一致` (`?` 情報行は既存) |
| `pnpm -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm -C apps/web exec vitest run` | ✅ **33 passed / 1 skipped (34 files)、501 passed / 2 skipped (503 tests)** |
| `node --check scripts/quiz-fidfix-S125-u9.mjs` | ✅ |
| fidfix dry-run (既定) 再実行 | ✅ **applied 0 / skipped 143、files to write 0** (完全冪等) |
| `correct_answer` 差分 | ✅ **0 / 2900** |
| `answer_keys.json` | ✅ byte 不変 (md5 + mtime) |
| 事前 / 事後 machdiff | ✅ AGENT_MISSED 0 / 0 (§3・§8a) |
| D-143 | ✅ MARK 付き final note **3**、純粋後置 3/3、round1 変更 0、`explanations` 内 MARK **3** |
| e2e (Playwright) | **未実行** — U7 / U8 §9 と同じ理由 (prod 別名を叩く構成)。本 unit は文字列置換のみ |

適用前の前提検証: `quiz-phase2-merge.mjs 2024r06` を**先に実行して `git diff` 0** (merge 冪等) を確認。
merge の報告 `SUSPECT 1 (q097)` / `STEM-CORRUPTION 0` は**適用前後で同一**。
再生成: `build-quiz-corpus.mjs` (2900 問 / with_fig 511) → `quiz-phase2-merge.mjs 2024r06`。図の変更は無いので `build-quiz-figures` は不要。

---

## 10. 見送り

| クラス | 該当 | 理由 |
|---|---|---|
| en の見出し体裁 | `q062` / `q085` en「[Program]」 | corpus 9/9 が [Program]、英語の体裁 (⑨-c) |
| 描画補助 | `q085`「［ a ］」「［ b ］」(源は罫線囲みの空欄) | agent も非計上。空欄の位置を示す補助 |
| 非出荷の key_guard note | `.phase2/expl_jp_*.json` の note (`q059`「19cnm」/ `q062`「AABAB」/ `q085`「100」) | merge が読まない。⑨ 継続 |
| N5 (raw stem の残存腐敗、clean が出荷層) | `q062` raw「stringOutput で ""」「i†」「未尾」「"A”」「プログラムであ る」ほか | 学習者不可視 |
| `.phase1` の既存乖離 | `tr_q062` の ASCII リテラル、`tr_q085` の ASCII `"100"` | §7a。非出荷 |
| 解説の地の文の「」 | `q062`「要素が1と等しい」/ en「the element equals 1」ほか | 文字列リテラルではない |
| 読点の字種・空白 | 英数字周囲の空白 (CLEAN 標本 `q091`「PCに」ほか) | 許容表記揺れ |

---

## 11. backlog (⑨ / 次 unit へ)

### ⑨ 新規: 擬似言語の文字列リテラルの字種規約

- 源の擬似言語本文 (等幅書体) のリテラルは 99+99 の字形 (ASCII `"` の書体表示とみられる)、題幹・注釈行は 66/99 の “”。本 unit は “” に統一した (§4b)。
  corpus 内でリテラルを持つ擬似言語題は `2024r06-q062` / `q085` の 2 題のみ (実測) なので、規約として固定するかを決める。

### ⑨ 更新: `[プログラム]` の括弧字種 (U8 ⑨ の続き)

- sidecar clean の `[プログラム]` は **0** に (U8 q060 + U9 q062)。raw には `2025r07-q078`「[プログラム]」・`2023r05-q064`「[プログラム〕」が残る (clean は〔〕で N5)。
- zh `[程序]` は `2023r05-q060` の 1 題のみ残る (U8 で ⑨-c 保留、本 unit で q062 は〔程序〕へ)。横断で揃えるかを決める。

### ⑨ (継続)

- **slashed zero 型の横断走査**: U5 (q004 / q075)、U7 (q066)、U8 (q025) に続き **U9 q059**「10cm→19cnm」(4 unit で 6 件)。本文の数値に 9 を含む問の全量抽出 → 源照合を引き続き提起。
- **「ヘへ」型 (片仮名ヘ + 平仮名へ) の横断**: 本題の他、raw に `2014h26h-q054` / `2020r02o-q064` (いずれも clean は正、N5)。choices には他に無い (機械走査)。
- **非出荷の expl_jp key_guard note**: `q059` note は「19cnm」を腐敗として正しく述べているが、`q062` / `q085` note は「」表記のまま。将来 note を出荷層に上げるなら要是正。
- **`.phase1` ↔ sidecar の既存乖離**: U7 NIT-3 / U8 14i に `2024r06-q062` / `q085` (ASCII ↔ 「」) が加わる。
- **N5 の「字が変わる型」の別ランク台帳化**: 本 unit では該当の新規なし。
- **precrop の skip**: page_mismatch 4 問 / 2 ページ (U7 / U8 と同じ ⑨)。
- **脚本雛形の潜在不具合**: `EXPL` と `LITSUB` のループは expl ファイルをそれぞれ独立に `rj()` する。本 unit は id が重ならない (q059 は EXPL のみ、q062 / q085 は LITSUB のみ) ので影響なし。同一 id が両方に入ると dry-run で先のループの編集が表示上失われる → 次 unit で expl の読込を単一化する。

---

## 12. Rule B (失敗記録)

**本 unit の抄写 run・是正器に失敗 attempt は無し。** run は 1 回で完走 (72/72、UNREADABLE 0)。
是正器は dry-run → `--apply` の初回で assert 違反 0 (subN の `EXPECT` は dry-run 前に field ごとの実測で固定 — 事前の設計で、失敗 attempt ではない)。
`failures/` への新規追加は**なし**。

---

## 13. Rule D

Writer = `u9-fixer` (opus)。**Reviewer は別 `subagent_type` (opus) で本 evidence の後に別途実施すること**
(本ファイルは writer の自己申告であり、Rule D の審査は未了)。

審査時の重点:

1. **§4b q062 リテラルの字種** — 源本文の字形 99+99 (q62e/g/h、crop 座標: `”A”` ≈ (595,610) / `”B”` ≈ (590,715) / `””` ≈ (595,385)、いずれも `precrop/2024r06/2024r06-q062.png`) に対し “” を採った裁定。退けた案 (”A” / ASCII) との比較。
2. **§4b q062 空白** — 「convert(arrayInput) として」の空白除去 (均等割付行、英数字周囲の空白は通常は許容表記揺れ — 指示で名指しのため採用)。
3. **§4b / §4c 解説のリテラル “” 化** — 設問の引用 (AABAB / 100) に加え、解説者が導いた戻り値 (BBABA 等) も揃えた線引き。地の文の「」を残した線引き。
4. **§7 subN** — U8 からの 3 変更 (NIT-1 書込み判定 / NIT-2 対称 throw / subN の出現数 assert) のコードレビュー。
5. **§2 severity 入替** — `q012 ア` semantic→cosmetic、`q082 エ` cosmetic→semantic。
6. **§4a q012 ア** (正解肢) — 読点脱落の源確認 (p07 crop 2 行目冒頭「研究機関，企業など」)。
7. **§4d q059** — 斜線ゼロ「10cm」(page-26 直読、crop 無し) と解説 OCR 注記除去。
8. **§6 逸脱 2 / 4** — raw 層への追加是正 (q062 / q085 の見出し・引用符) の妥当性、en「[Program]」据置。
9. **§7a** — `.phase1` の既存乖離の扱い (ASCII リテラルを残した)。
10. §4f CLEAN 標本 3 問 (fixer とは重ならない標本での追加抽検を推奨)。

---

## 14. Rule D 独立審閲 (S125 U9、reviewer pr-review-toolkit:code-reviewer opus)

Writer = `u9-fixer` (`oh-my-claudecode:executor` opus) / Reviewer = `u9-reviewer` (`pr-review-toolkit:code-reviewer` opus、別 subagent_type・別 context)。
reviewer はデータを修正していない (本節の追記のみ)。一時画像は scratchpad `u9r/` に置き、repo 内には残していない。

**判定: PASS-with-notes** — MAJOR 0 / MINOR 0 / NIT 4。データ修正不要。

### 14a. 採用 11 差分の源独立実読

`data/ip/quiz/.phase2/precrop/2024r06/` の crop を原寸で、q062 の引用符・空白は apps/web の sharp で 8 倍 nearest 拡大して自分で切り出した
(q062 (560,600,120×50) / (200,110,200×50) / (700,55,260×50))。q059 は crop が無いので `data/ip/exams/pages/2024r06/page-26.png` を直読。

| id | 源 (reviewer 実読) | 判定 |
|---|---|---|
| `q012 ア` (正解肢) | 1 行目末「…推進し，大学，」/ 2 行目「研究機関，企業など，官民における連携と，…」 | **支持**。「研究機関」「企業」間の読点は源に在る。同 from 内の「大学,研究」→「大学, 研究」は行跨ぎ読点の house rule 化で妥当 |
| `q059 ア` | 「ア　10cm 程度の近距離にある機器間で無線通信する。」— 0 は同頁「問60」と同じ斜線ゼロ、c と m の間に字なし | **支持** (semantic)。解説アの OCR 注記 3 語除去も、是正後に偽となる注記なので妥当 |
| `q062` 見出し | 「〔プログラム〕」(亀甲) | **支持** |
| `q062` 題幹 AABAB | 「“AABAB”」— 8 倍で開き 66 形・閉じ 99 形 | **支持** |
| `q062` 空白 | 「convert(arrayInput)として呼び出したときの…」均等割付行。) と「と」の間隔は同行の字間と同じで語間空白ではない | **支持** |
| `q062` リテラル “” / “A” / “B” | 本文の等幅書体で「”A”」「”B”」「””」— 8 倍で**開閉とも 99 形**を確認 (fixer と同じ観察) | 逸脱 ① として 14b で判定 → **承認** |
| `q082 エ` | 「利用者がクラウドサービスへログインするときの環境，IP アドレスなどに…」— へは 1 字 | **支持** (semantic) |
| `q085` “100” / “1” / 〔プログラム〕 | 題幹「として“100”を受け取ると」、注釈行「// 例: 文字“1”であれば」— いずれも 66/99、見出し〔〕 | **支持** |

→ **11 / 11 支持、差し戻し 0**。

### 14b. fixer の逸脱 4 件

1. **① q062 擬似言語リテラルを “” に統一 — 承認**。
   - 現行規則は U7 q027 以降の「引用符・括弧の字種も源に揃える」(U8 §4e・U8 reviewer 14 で確認済)。ただし源本文の ”A” (99+99) は、IPA 擬似言語の文字列リテラル (仕様上は `"…"`) を等幅書体で組んだ字形であり、「開き引用符として 99 形を意図した」表記ではない。字形そのまま (`”A”`) を入れると学習者には閉じ引用符の誤植に見え、文字列の境界が読み取りにくい。
   - ASCII `"A"` は jp 出荷層に ASCII 二重引用符を置かない運用 (U8 q004 / q092、D-147 関連 ⑨ の ASCII 引用符 139 問) に反する。
   - “” は同一問題内の題幹 “AABAB”・q085 注釈 “1” と一致し、「文字列リテラルを “” で囲む」という読みを一意に与える。学習者に誤解を与える要素は無い (空文字列 “” も判別可能)。
   - corpus 内でリテラルを持つ擬似言語題は **2 題のみ** (reviewer 再走査: `2024r06-q062` “AABAB” “” “A” “B” / `q085` “100” “1”)。§11 の ⑨ 新規登録 (規約として固定するか) で十分。
2. **② raw 層への追加是正 — 承認**。同一差分の層追随であり、U8 q060 (3 層とも〔〕) と同型。raw の他の崩れ (「で ""」「i†」「未尾」) を N5 で据え置いた線引きも U5〜U8 と整合。
3. **③ 解説の肢由来の戻り値も “” 化 — 承認**。BBABA 等は解説者が導出した値だが同じ「convert の戻り値 = 文字列リテラル」であり、同一 field 内で「」と “” を混在させない方が読みやすい。地の文の条件引用「要素が1と等しい」/「1, 1, 1以外, 1, 1以外」/ b の式引用を「」のまま残した線引きも正しい (git diff で確認)。
4. **④ en「[Program]」据置 — 承認**。en の見出しは corpus 内 9/9 が `[Program]` で、各言語の体裁 (⑨-c) の既存方針どおり。zh は sidecar 多数形〔程序〕に寄せ、残存 `[程序]` は `2023r05` の 1 件のみ (reviewer 実測 `grep -oF`)。

### 14c. severity 入替 2 件 — 妥当

- `q012 ア` semantic → **cosmetic**: 変化は読点の追加と空白のみで、語の内部の字は不変。U6〜U8 §2 の規則どおり。
- `q082 エ` cosmetic → **semantic**: 「サービス**ヘ**へ」は語 (助詞の直前) への字の挿入で、U8 `定義むする` と同型。

### 14d. key_guard note 3 件 / zh・en 伝播

- 適用前退避 (`scratchpad/u9/pre/phase2/generate_result_2024r06.json`) と機械照合: note 変化 **3 件 (q012 / q059 / q082)、3/3 が純粋後置**、`key_guard_round1` 変化 **0**、note_jp 以外の変化 **0**、トップレベル不変。`explanations/2024r06.json` 内 MARK = **3**。
- note 文面 (page-07 / page-26 / page-37、正解肢・導出不変の記述) は 14a の源実読と一致。q062 / q085 に追記しない判断も U8 q060 precedent どおり。
- zh / en: q062 (zh 見出し + 引用符 4、en 引用符 4)、q085 (zh / en 引用符 2) が sidecar に反映。q012 / q059 / q082 の zh / en は適用前から正 (git diff に行なし、sidecar 目視)。

### 14e. 波及ゼロ

| 検査 | reviewer 再実測 |
|---|---|
| `git diff -U0 data \| grep -c '"correct_answer"'` | **0** |
| `answer_keys.json` | md5 `6802bb0bc13004da78ad3c4e5117d997`、mtime `1788586696` — §2 と一致 |
| `question_bank.json` の変化 id (退避と照合) | q012 / q059 / q062 / q082 / q085 の **5 題のみ** |
| `by_year/` で退避より新しいファイル | `2024r06.json` のみ |
| `translations/` `explanations/` の tracked 差分 | 2024r06 の 2 ファイルのみ (他 28 exam 0) |
| `.phase1` 変化 (100 本と cmp) | `tr_2024r06-q062.json` のみ |
| `.phase2` 変化 (201 本と cmp) | `expl_{jp,tr}_2024r06-q059 / q062 / q085` + `generate_result_2024r06` の 7 本のみ |
| 出荷層残存 (`grep -oF`) | `19cnm` 1 / `サービスヘへ` 1 / `研究機関企業` 2 = いずれも final note 内の是正記述。`「AABAB」` `「100」` `[程序]` `OCR 化け` = 0 |

→ 書込み 12 本 (raw 3 + sidecar 1 + `.phase1` 1 + `.phase2` 7) は §7 の宣言と一致し、すべて妥当。

### 14f. CLEAN 標本の追加抽検 (fixer と重ならない 5 問)

fixer の §4f (q006 / q080 / q091) および是正 5 題と重ならない 5 問を、分野・形式 (用語肢 / 図つき / a〜d 組合せ / 長文肢) が散るよう reviewer が選び、出荷層 (clean があれば clean、選択肢は raw) を源 crop と逐字照合した。

| id | 実読結果 |
|---|---|
| `q019` | 題幹 3 行と 4 肢 BPO / RPA / オープンAPI / 技術経営 が一致 |
| `q041` | 題幹 5 行 (アローダイアグラム、B〜E の四つの結合点…段取り時間は考えない) と 4 肢 B / C / D / E が一致 (図は別層) |
| `q054` | 題幹 (統制環境…IT への対応から構成される取組) と 4 肢 CMMI / ITIL / 内部統制 / リスク管理 が一致 (clean は読点を「、」に正規化 — 許容表記揺れ) |
| `q072` | 題幹と a〜d 4 行 (歪んだ文字列画像 / 打鍵 / 筆跡・筆圧・運筆速度 / 点をなぞる) と 4 肢 a,b / a,d / b,c / c,d が一致 (ルビ「ゆが」は非転記で可) |
| `q098` | 題幹と 4 肢 (侵入路 / 暗号化し…金銭を要求 / Web ブラウザを乗っ取り / まん延) が一致 |

→ **見落とし 0 / 5**。fixer 標本と合わせ CLEAN 8 / 67 を実読して見落とし 0。DISCREPANT 5 という低い計上は machdiff (AGENT_MISSED 0) と合わせて実態と整合と判断する。

### 14g. 是正脚本のコードレビュー (U8 NIT 反映と subN)

- **NIT-1 反映 (変更なしファイルは書かない)**: `rj` が `JSON.stringify(d,null,2)` を控え、`wj` は一致なら return — 正しく機能 (dry-run 再実行 `files to write (0)`)。`written` への push も差分時のみ。
- **NIT-2 反映 (zh/en 欠落で throw)**: `pointSub` の zh / en で `typeof tr.points?.[idx]?.[L] !== "string"` → throw、jp と対称。本 unit では未実行だが分岐は正しい。
- **subN**: (a) EXPECT 0 の field に出現があれば throw、(b) 出現数 ≠ 期待で throw、(c) 0 回は skip (冪等)、(d) `EXPECT` の slot 名が実 slot に無ければ throw — 誤爆・取りこぼしの両方に対する guard として十分。`「A」` は `「AABAB」` の部分文字列にならない (閉じ括弧を含むため) ので LIT62 の順序依存も無い。points_jp を box 経由で書き戻す処理も正しい。
- 適用ループ本体は U8 から逐字流用で変化なし。§11 末の「EXPL と LITSUB の独立 `rj()`」の潜在不具合指摘は正確 (同一 id が両方に入ると後勝ちで前の編集が消える — 本 unit は id 非重複で無害)。

### 14h. ゲート再実行 (reviewer)

```
node scripts/quiz-keys-crosscheck.mjs                         → questions=2900 exams=29 layerB=ran / ✓ all invariants hold (A1–A7, B1–B7)
node scripts/quiz-pagefix-derive-groups.mjs --assert-clean    → SPLIT_FIGURE 0 件 / ✓ D-145 図ページ常設ゲート (A)(B)
node scripts/quiz-chumon-groups-build.mjs --check             → = chumon_groups.json は生成結果と一致 (? 情報行は既存)
pnpm -C apps/web exec tsc --noEmit                            → exit 0
pnpm -C apps/web exec vitest run                              → 33 passed | 1 skipped (34) / 501 passed | 2 skipped (503)
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u9_fidelity_input_2024r06.json \
  evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u9_2024r06_sn.json
                                                              → same=360 | AGENT_MISSED=0 | VERDICT_CONFLICT=0 | coverage 72/72
node scripts/quiz-fidfix-S125-u9.mjs                          → files to write (0) / (dry-run) applied 0, skipped 143
```

すべて §9 と一致。skip 143 = 初回 apply の applied 97 + skip 46 (§7) と整合。

### 14i. 指摘 (MAJOR 0 / MINOR 0 / NIT 4)

- **NIT-1 (evidence・脚本コメントの記述)**: §7「`.phase1` は compact 直列化のため…正規化文字列で比較」、脚本 L20 も同旨。実際の `tr_2024r06-q062.json` は 2 space の pretty 形式 (退避 30 行 / 現 30 行、末尾 `\n}\n` 同一、diff は 2 行のみ)。比較方式は正しいが「compact」という理由付けが事実と違う → 「直列化の揺れに依存しないよう正規化文字列で比較」等に直す。
- **NIT-2 (脚本の可読性)**: 最上位の引用符変換ヘルパ `const q = (s) => …` (L162) と FIX ループ内の設問オブジェクト `const q = Qdoc.questions.find(…)` (L203) が同名。ブロックスコープで正しく動くが、次 unit の雛形流用時に取り違えやすい → `curly` 等に改名。
- **NIT-3 (subN の肯定確認の強度)**: 置換後の確認は `next.split(to).length - 1 < n` のみで、`to` が置換前から field に存在すると確認が甘くなる。本 unit では EXPECT と (a) の guard で実害なし。次 unit では「置換前の to 出現数 + n と一致」で確認する方が厳密。
- **NIT-4 (未言及の同問内表記揺れ)**: 是正した `q012` の同じ問の イ「開発, 提供,利用」/ ウ「使用方法,結果」も行跨ぎ読点の空白欠落が残る (源どおりの読点で、欠けているのは house rule の空白のみ)。corpus の選択肢で同型は 310 件あり U9 範囲外の横断課題 → §10 見送り表に一行加えるか ⑨ の読点字種の項に含める。

### 14j. evidence 記述精度

§1〜§9 の数値 (72 / CLEAN 67 / DISCREPANT 5 / 差分 10→11 / cosmetic 9・semantic 2 / 正解肢上 1 / 置換 97 / 書込み 12 / MARK 3 / answer_keys md5・mtime / vitest 件数) は reviewer 再実測と全て一致。上記 NIT-1 の記述のみ不正確。

### 14k. 再現コマンド (追加分)

```
# q062 引用符・空白の 8 倍拡大 (apps/web の sharp を使用)
cd apps/web && node -e 'const s=require("sharp");const f="../../data/ip/quiz/.phase2/precrop/2024r06/2024r06-q062.png";
  s(f).extract({left:560,top:600,width:120,height:50}).resize({width:960,kernel:"nearest"}).toFile("<scratch>/q62A.png")'
# key_guard: 退避と比較 (round1 / note 以外 / 純粋後置)
node -e '…A=<pre>/phase2/generate_result_2024r06.json, B=data/ip/quiz/.phase2/generate_result_2024r06.json … → {r1:0, other:0, notes:[q012,q059,q082 :true], top:true}'
# 出荷層残存 (固定文字列)
cat data/ip/quiz/questions.json data/ip/quiz/translations/2024r06.json data/ip/quiz/explanations/2024r06.json | grep -oF '[程序]' | wc -l   → 0
# 擬似言語リテラルの corpus 走査
node -e '… translations/*.json の stem_jp_clean で〔プログラム〕を含み引用符付き短文字列を持つ id を列挙' → 2024r06-q062 / q085 のみ
```

## 15. NIT 処置 (主 context、S125)
- NIT-1: §7 と脚本 L22 の「compact 直列化」→「2 space pretty 形式」に記述訂正 (比較方式・挙動は不変)。
- NIT-2: 最上位の引用符ヘルパ `q` とループ内の設問変数 `q` の同名 — 適用済み脚本は触らず、次 fidfix 雛形で改名 (⑨)。
- NIT-3: subN の事後確認を「置換前の to 出現数 + n と一致」に強化 — 次雛形で反映 (⑨)。本 unit は reviewer が全件の結果一致を確認済。
- NIT-4: q012 イ「提供,利用」/ ウ「使用方法,結果」の行跨ぎ読点後の空白欠落 — corpus 横断 310 件の課題として ⑨ 登記 (本 unit では是正しない)。
