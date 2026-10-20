# ⑤-2 全量保真掃引 U11 — 2026r08 の集計と是正 (S127)

⑤-2 全量核験の **U11** (`docs/phase5/PLAN_52_units.md` §2、D-146)。母数は
`evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json` の 2026r08 = **71 問**。
**Sonnet 5 単 pass** の 10 回目の本番 unit (U4〜U11 の最終 exam)。

---

## 1. 入力と実行

- run: `wf_326d0bb2-9e3` (label `u11`、pass `sn`、model = **Sonnet 5**、gp)
- マニフェスト: `data/ip/quiz/.phase2/u11_fidelity_input_2026r08.json` (`--precrop` 版、crop **61/71**、skip 10 = page_mismatch 9 (page-13 / 14 / 34 / 42 の題) + merged_preamble 1 (`q074`) → この 10 題は源ページ全体で読む)
- 結果 JSON: `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u11_2026r08_sn.json`
- **覆盖 71/71 / CLEAN 60 / DISCREPANT 11 / UNREADABLE 0**、差分 17 {cosmetic 11, semantic 6}、正解肢上 3 (`q032 ウ` / `q041 ウ` / `q082 ア`)
- 是正器: `scripts/quiz-fidfix-S127-u11.mjs` (既定 dry-run、`--apply` で書込み)

### Sonnet 単 pass の実測

| 項目 | U8 (2023r05 91) | U9 (2024r06 72) | U10 (2025r07 80) | **U11 (2026r08 71)** |
|---|---|---|---|---|
| token | 5,933,780 | 4,642,332 | 4,322,067 | **3,908,996** |
| token / 問 | 65,206 | 64,477 | 54,026 | **55,056** |
| 時間 | 13.7 分 | 9.7 分 | 3.4 分 | **2.3 分** |
| tool 呼び出し | 851 (9.4) | 648 (9.0) | 328 (4.1) | **298 (4.2 回/問)** |
| UNREADABLE | 0 | 0 | 0 | **0** |

(token・時間・tool 数は主 context 申告の workflow ログ値。)

---

## 2. 率

| exam | n | agent DISCREPANT | +machdiff | +fixer 走査 | **計上 = 是正** (率) | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|---|---|
| 2026r08 | 71 | **11** | **+1 題** (`q078`、AGENT_MISSED 3 のうち実残差 1、§3) | **+2 題** (`q025` / `q084`、agent CLEAN・machdiff 不可視、§4f) | **14 (19.7%)** | **4** (agent 3 + fixer 1) | **0** |

- 題数 14 = q025 q032 q040 q041 q049 q066 q070 q072 q078 q082 q084 q090 q091 q094。
  内訳 = agent DISCREPANT 11 (q032 q040 q041 q049 q066 q070 q072 q082 q090 q091 q094) + machdiff 実残差 1 (q078) + fixer 走査 2 (q025 q084)。
- **計上の定義 (Rule D 確認点)**: U9 の定義 (agent DISCREPANT 題 + machdiff 実残差) なら **12 題 (16.9%)**。
  本 unit は fixer の走査で見つけた**学習者に見えていた**残差 2 題 (引用符の字種、machdiff は引用符を正規化するため構造的に検出不能、§3d) を計上に含めた。
  U10 の `q078` (raw のみ = 学習者不可視) を計上外にしたのとは条件が違う (出荷層の残差) ため含める判断。どちらの数字も以下の累計に併記する。
- agent の 17 差分は**全件採用**、加えて machdiff 1 + fixer 走査 5 (q025 stem 1 / q084 ア〜エ 4) → **23 論理差分**。非採用 **0**。
- **severity 再分類 (fixer、23 論理差分)**: cosmetic **15** / semantic **8** / answer_affecting **0**。
  規則 (U6〜U10 §2 と同一): 読点・句点・引用符・括弧の字種、見出し、空白、文末残渣 → cosmetic、語の内部で字が入る / 落ちる / 置き換わる → semantic。
  - agent {cosmetic 11, semantic 6} から **1 件を入れ替えた**:
    - `q032 ウ` cosmetic → **semantic** (「加**エ**メーカー」= 語の内部の字の置換 (片仮名エ ↔ 漢字工)。近似字形の OCR 誤りだが、U10 `q024 イ` 搬送か と同じく規則どおり機械的に適用。**Rule D 確認点**)
  - 追加分: `q078 ウ` semantic (「ア」の脱落) / `q025` cosmetic / `q084 ア〜エ` cosmetic ×4。
  - cosmetic 15 = `q025` 引用符 / `q040 ウ` 引用符 / `q041 ア` 中点挿入 / `q049 ウ`・`エ` 残渣 / `q072` 引用符 / `q082 ア`・`エ` 残渣 / `q084 ア〜エ` 引用符 ×4 / `q090 イ` 引用符 / `q091 イ` 残渣 / `q094` 引用符
  - semantic 8 = `q032 ア` 販売才とだ民Lた→販売することにした / `q032 イ` ( 社→C 社 / `q032 ウ` 加エ→加工 / `q041 ウ` その他理的→その倫理的 / `q049 イ` におからない→にならない / `q066` 複雑→煩雑 / `q070 イ` 模僚→模倣 / `q078 ウ` キャリアグリゲーション→キャリアアグリゲーション
- **正解肢上 4 差分** = `q032 ウ` (semantic) / `q041 ウ` (semantic) / `q082 ア` (cosmetic、文末残渣) / `q084 エ` (cosmetic、引用符、fixer 走査)。**`correct_answer` は不変**。
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
| U9 (2024r06) | 72 | 5 | 6.9% | 1 | 0 | Sonnet 単 pass |
| U10 (2025r07) | 80 | 13 | 16.3% | 2 | 0 | Sonnet 単 pass |
| **U11 (2026r08)** | **71** | **14** | **19.7%** | **4** | **0** | **Sonnet 単 pass** |
| **累計 (波 1–3 + U3a〜U11)** | **1208** | **156** | **12.9%** | **36** | **6** | — |

(正解肢上は従来どおり**差分数**で数える。U9 定義 (fixer 走査を除く) なら U11 = 12 題 / 16.9% / 正解肢上 3、累計 = **1208 / 154 / 12.7% / 正解肢上 35 / aa 6**。)

U11 の支配型は 3 つ:
1. **選択肢の OCR 字化け・残渣** (raw = 出荷層): `q032 ア`「販売才とだ民Lた」/ `q032 イ`「( 社」/ `q041 ウ`「その他理的」/ `q049 イ`「におからない」/ `q070 イ`「模僚」、末尾残渣 `q049` `q082` `q091` (空白連続 +「「」、`q082 エ` はページ番号「ー 39 一」+「“」)。
2. **引用符の字種** (`q025` `q040` `q072` `q084` `q090` `q094`)。うち `q025` / `q084` は agent CLEAN かつ machdiff 構造的不可視 (§3d)。
3. **訳層が OCR 誤りを「推測して」訳していた型** (s975 再構成の訳層版): `q070 イ`「模僚」→ zh「为防止再次发生」/ en "preventing recurrence" (= 再発。源は模倣)、`q032 イ`「( 社」→ zh / en とも C を落として訳出、`q066`「複雑」→ zh「复杂」/ en "complex"。**⑨ 新規 (§11)**。

---

## 3. 機械 diff (machdiff) — AGENT_MISSED 3 (実残差 1 / 既知型の偽陽性 2)

```
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u11_fidelity_input_2026r08.json \
  evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u11_2026r08_sn.json
✗ AGENT_MISSED 2026r08-q072 stem verdict=DISCREPANT: row 2: disp ["口座番号(主キ-)","口座種別","残高","顧客番号(外部キ-)"] src ["口座番号","口座種別","残高","顧客番号"]
✗ AGENT_MISSED 2026r08-q074 stem verdict=CLEAN: row 0: disp ["表計算ソフトを用いて,…が入力されている."] src ["表計算ソフトを用いて,…が入力されている.セルB5に入力する式はどれか."]
✗ AGENT_MISSED 2026r08-q078 choice.ウ verdict=CLEAN: @4 disp(after agent fixes)「キャリアグリゲ-ション」 src「キャリアアグリゲ-ション」
machdiff: fields same=352 | AGENT_MISSED=3 | VERDICT_CONFLICT=0 | audits w/o transcript=0 | UNREADABLE skipped=0 | coverage 71/71
```

- **(a) `q078 ウ` = 実残差 → 採用**。源 (p38 crop) は「キャリア**ア**グリゲーション」。dataset は「ア」が 1 字落ちている (semantic、§4e)。
  同じ崩れは `q064` の raw stem にもあるが、`q064` は clean (「キャリアアグリゲーション」、源どおり) が出荷層 → N5。
- **(b) `q072` 表見出しの「(主キー)」「(外部キー)」= 描画補助 (既知型の偽陽性)**。源 (p35 crop) は主キーを**実線の下線**、外部キーを**破線の下線**で示し、
  題幹自身が「下線のうち実線は主キーを，破線は外部キーを表す」と説明している。clean の Markdown 表は下線を描けないため注記で代替している。
  U10 §3b `q072`「[ a ]」(罫線枠の空欄) と同じ「視覚記号の文字化」で、不変。事後 machdiff にも残る。
- **(c) `q074` 問文「セルB5に入力する式はどれか。」= 文順の入替え (偽陽性、新しい型)**。表示層 (`stem_jp_clean`) には問文が**ある**:
  clean は「本文 → 表 → 問文」の順、源 (p36) は「本文 → 問文 → 表」の順。machdiff は表区切りの行単位で比べるため、行 0 (本文) に問文が無いと判定した。
  欠落字は 0、zh / en も同じ順序で問文を持つ。merged_preamble で precrop 対象外の題 (manifest の skip 理由どおり)。**不変**。Rule D で順序の扱いに異論があれば ⑨ へ。
  なお表の中身 (A1〜D5、「1の位からの繰上げ」等) は源と一致、正解アも再導出 (合計 <2 → 合計、=2 → 0、3 → 1) で一致。
- **(d) machdiff は引用符の字種を構造的に検出できない**: `scripts/quiz-fidelity-machdiff.mjs:25` が `[“”„"「」『』〝〟']` をすべて `"` に正規化してから比較する。
  このため agent が CLEAN とした `q025` (clean の ASCII `"ビッグデータ"`) / `q084` (4 肢の ASCII `"` ×6) は machdiff でも拾えない。fixer の出荷層走査 (§4f) で検出した。**⑨ 新規**。

→ **実残差 1 (q078)**。停止条件 (説明できない machdiff 実残差) には当たらない。

---

## 4. 裁定 (fixer が源を原寸で独立実読)

実読した源: `data/ip/quiz/.phase2/precrop/2026r08/` の crop = q025 q040 q041 q048 q049 q054 q064 q066 q067 q072 q073 q076 q078 q082 q083 q084 q088 q089 q090 q091 q094 q097 (+ §4h の CLEAN 抽検 6)、
crop の無い題は源ページ直読 = page-13 (q029 / q030)、page-14 (q031 / q032 / q033)、page-34 (q070 / q071)、page-36 (q074)、page-42 (q086 / q087)。
agent の `source_text` は候補として扱い、すべて自分の目で読んでから from/to を決めた。**採用 23 / 非採用 0**。

### 4a. 選択肢の字化け (semantic、raw = 出荷層)

| id (page) | 源 | dataset | 判定 / 追随 |
|---|---|---|---|
| `q032 ア` (p14) | 「…安価な商品を全国で販売することにした。」 | 「販売才とだ民Lた。」 | semantic。zh / en は文意どおり (正) |
| `q032 イ` (p14) | 「…業界3位の C 社と経営統合することにした。」 | 「業界3位の( 社と」 | semantic。**zh「与行业排名第3的公司」/ en "the third-largest company" は C を落として訳出 → 「C公司」/ "C, the third-largest company" に追随** |
| `q032 ウ` (p14) **正解肢** | 「金属加工メーカーD 社は…」 | 「金属加エメーカー」 | **semantic** (agent: cosmetic、§2)。zh「金属加工」/ en "Metal processing" は正 |
| `q041 ウ` (p19) **正解肢** | 「…組織体にその倫理的な行動が徹底されない。」 | 「その他理的な行動」 | semantic。zh「合乎伦理的行为」/ en "ethical conduct" は正 |
| `q049 イ` (p23) | 「議論が中途半端にならないように，…」 | 「におからないように」 | semantic。zh / en は正 |
| `q070 イ` (p34) | 「…知識は，模倣を防ぐために情報セキュリティの管理策の強化には用いない。」 | 「模僚を防ぐために」 | semantic。**zh「为防止再次发生」/ en "for the purpose of preventing recurrence" は「模僚」を「再発」と推測した訳 → 「为防止模仿」/ "preventing imitation" に追随** (§4c) |
| `q078 ウ` (p38) | 「キャリアアグリゲーション」 | 「キャリアグリゲーション」 | semantic (machdiff 実残差)。zh「载波聚合」/ en "Carrier aggregation" は正 |

いずれも答え (q032 ウ / q041 ウ / q049 ア / q070 エ / q078 エ) は不変。

### 4b. **`q066` stem (p31) — 「複雑な操作」→ 源「煩雑な操作」(semantic)**

- 源 (crop):「…質問に答えていく対話形式によって，**煩雑**な操作を簡単に行えるようにする機能はどれか。」
- dataset: clean 無し → **raw stem が出荷層**で、raw 3 層すべて「複雑」。zh「使复杂的操作」/ en "complex operations" もこれを訳していた → 「繁琐」/ "cumbersome" に追随 (sidecar + `.phase1`)。
- **解説**: `correct_jp` の「設問の「…複雑な操作を簡単に行えるようにする機能」という説明」は**題幹の直接引用**なので「煩雑」に追随。zh correct の「题目中「…使复杂的操作…」」、en correct の "The description in the question, namely a function that makes complex operations easy…" も同じく追随 (3 置換)。
  ウィザードの定義の「複雑な設定や操作」、ウ・エ の誤答説明、points の「複雑な設定・操作」は解説者自身の語 → 不変 (U9 §4b の線引き)。
  エ の誤答説明「対話形式で手順を案内して複雑な操作を簡単にする機能ではない」は題幹の言い換えに近いが引用符の無い地の文 → 不変 (**Rule D 確認点**)。
- 導出 (質問に答える対話形式で操作を簡単にする = ウィザード) と答えイは不変。

### 4c. `q070 イ` の訳層 — OCR 誤りを「再発」と推測して訳していた

- 非出荷の `.phase2/expl_jp_2026r08-q070.json` の key_guard.note_jp が「選択肢イの「模僚」は OCR ガーブル（中文訳より「再発」が正と推定）」と述べている。
  つまり生成時に zh 訳の推測 (再次发生) を逆に正として扱っていた。源は「模倣」。
- 誤答肢イの誤りの核心 (「管理策の強化には用いない」) は語の違いで変わらない。解説 イ「インシデントから得られた知識は、同種事象の再発を防ぐために…活用すべき」は
  題幹の引用ではなく、ISMS の正しい実務を述べる解説者の論証 → 不変 (**Rule D 確認点**: 選択肢の「模倣を防ぐ」と解説の「再発を防ぐ」が並ぶが、解説は選択肢の文言を否定する形で正しい実務を述べており矛盾しない、と判断)。
- 非出荷の expl_jp note の「再発が正と推定」は不変 (⑨ 継続、U10 §10 と同じ扱い)。

### 4d. 選択肢末尾の残渣・挿入記号 (cosmetic)

| id (page) | 源 (crop) | dataset | 判定 |
|---|---|---|---|
| `q041 ア` (p19) | 「…最終的な責任をもたせないと，…」(行末改行のみ) | 「をも・ たせないと」 | cosmetic (源に無い「・」+ 空白の挿入) |
| `q049 ウ` / `エ` (p23) | 「…常に参加する。」/「…募って確定する。」で終わる | 末尾 ASCII 空白 ×5 / ×7 +「「」 | cosmetic (残渣) |
| `q082 ア` (p39) **正解肢** | 「各ノードの重みを調整して，誤差を小さくする。」で終わる | 末尾 ASCII 空白 ×13 +「「」 | cosmetic (文末の後ろの残渣)。key_guard note 追記 (U10 `q091 エ` precedent) |
| `q082 エ` (p39) | 「ノードの数を変更して，処理速度を高める。」で終わる | 末尾「ー 39 一」(ページ番号 −39−) + 空白 ×5 +「“」 | cosmetic (残渣) |
| `q091 イ` (p45) | 「…ハッシュ値は全て同じになる。」で終わる | 末尾 ASCII 空白 ×16 +「「」 | cosmetic (残渣) |

いずれも zh / en は正。答え (q041 ウ / q049 ア / q082 ア / q091 ウ) は不変。

### 4e. 引用符 (cosmetic、agent 指摘分)

- `q040 ウ` (p18): 源「…リスクの全てを“回避”で対応する。」。dataset「全てを回避" で対応」(開き脱落 + 閉じ ASCII + 空白挿入) → 「全てを“回避”で対応」。
- `q072` stem (p35): 源「“口座”表，“顧客”表及び“取引明細”表」。clean「「口座」表，「顧客」表及び「取引明細」表」→ “”。
  raw は「“口座” 表, “顧客 表及び “取引明細" 表」と別の崩れ (閉じ脱落・ASCII) → **N5 据置**。`.phase1/tr_2026r08-q072.json` の clean は**既に “”** (sidecar だけが「」、n=0 skip)。
  zh「「账户」表」/ en「「Account」 table」は ⑨-c (各言語の体裁) で据置。ただし en の「」は英語の体裁ではない (§10、NIT 候補)。
- `q090 イ` (p44): 源「…信頼するという“信頼の輪”によって，…」(前後に空白なし)。dataset「という "信頼の輪"によって」→「という“信頼の輪”によって」。zh / en は各言語の体裁で据置。
- `q094` stem (p46): **clean 無し → raw stem が出荷層**。源は 4 組とも “…”。dataset は開き “ + 閉じ ASCII `"` ×4 (`対策"`) → `対策”` (STEMN、subN n=4、3 層。U10 `q088` と同型)。
  zh は既に “”、en ASCII は英語の体裁で据置。読点・「及び」前後の空白は許容表記揺れ。

### 4f. **fixer 走査で見つけた残差 (agent CLEAN、machdiff 構造的不可視)**

出荷層 (clean があれば clean、選択肢は raw) の 71 問全フィールドを `/"/`・`/ {3,}/`・`/[「“]\s*$/`・`/ー ?\d+ ?一/`・`/・ /` で機械走査し、ヒットを源と照合した。
agent 指摘済み以外で残差だったのは次の 2 題 (いずれも引用符の字種)。

- `q025` stem (p11、clean = 出荷層): 源「…情報資産を“ビッグデータ”と定義する…」。clean「情報資産を"ビッグデータ"と定義」→ “”。
  raw は「 "ビッグデー タ” 」(空白・語中空白・閉じ ” の混在) と別の崩れ → N5。zh / en ASCII は ⑨-c 据置。
- `q084 ア〜エ` (p40、raw = 出荷層): 源は 4 肢とも 3 組の “…” (計 12 組)。dataset は全て ASCII `"`。**エは正解肢**。
  開き / 閉じが同じ `"` なので subN は使えず、選択肢全文を from にした assert-once 置換 (to = `"…"` の対を `“…”` に変換、`"` が 6 個でなければ中断) で当てた。
  `HDD とSSD` 等の空白の揺れは許容。zh / en の ASCII は ⑨-c 据置。
- 他のヒット (`q067` / `q074` の空白連続) は擬似言語の字下げ・表の空セルで、源どおり。

### 4g. s975 再構成 (`stem_reconstructed_s975`) の推測語・推測数値の照合 — **stem 層は 0 件**

- 2026r08 の sidecar も `stem_reconstructed_s975: true`。clean を持つ標本 37 題 (71 題中) について raw と clean を**句読点・空白・引用符・括弧を除いて**文字 diff し、差のある 14 題を全件源と照合した:
  - `q033`「一連」/ `q048`「適切かもの」→「適切なもの」/ `q054`「拳げた」→「挙げた」/ `q064`「キャリアグリゲーション」→「キャリアアグリゲーション」/ `q073`「0pen」→「Open」/
    `q083`「a 二c」→「a〜c」・「0S」→「OS」/ `q097`「適切かもの」→「適切なもの」/ `q055` `q069`「|」除去 /
    `q076`「| 。 ]」→「[ a ]」・「(46)」→「(4G)」/ `q089`「層点」→「弱点」・空欄 a・b の補完 / `q067` 擬似言語 (〔プログラム〕全体、←・−・j 等の復元) / `q072` `q074` 表の追加
  - **すべて源どおりの正当な復元** (q076「4G」、q089「弱点」、q067 擬似言語は源の crop で逐字確認、q067 は答えイ (j=3 出力 1,2,3,5,4) も再導出で一致)。
- 数字を含む CLEAN 題 (q025 q030 q059 q067 q074 q076 q087 q088) も源と照合し、数字の誤り 0。
- → **U10 型 (clean が流暢な推測語・推測数値を持つ) は stem 層では 0 件**。ただし同じ「OCR 誤りを推測で埋める」型が**訳層**に 3 件あった (§2 支配型 3、§4a / §4b / §4c)。

### 4h. CLEAN 標本の無作為抽検

CLEAN 60 問 (id 昇順) から **seed 131 の LCG** (`s = (s·1103515245 + 12345) mod 2^31`、`c[s mod 60]`、重複は引き直し) で 6 問を抽出し、出荷層を源 crop と逐字照合した。

| id | 実読結果 |
|---|---|
| `q008` | 題幹「IoT を利用したシステムの事例として，最も適切なものはどれか。」と 4 肢 (クラウドファンディング型の仲介 / 感情分析 / センサー情報の監視 / オンラインストレージ) が一致 |
| `q053` | 題幹 (SLA の計画立案…測定などの活動を行うもの) と 4 肢 アウトソーシング / サービスレベル管理 / サービスレベル契約 / リエンジニアリング が一致 |
| `q095` | 題幹 (SQL インジェクションの対策…無害な文字列に置き換える) と 4 肢 MAC アドレスフィルタリング / サニタイジング / ストライピング / ソーシャルエンジニアリング が一致 |
| `q019` | 題幹 (サーバ上の…アプリケーションソフトウェアを…提供する事業者，又はそのサービス形態) と 4 肢 ASP / ISP / アウトソーシング / データウェアハウス が一致 |
| `q015` | 題幹 (イノベーター理論…五つのグループ…越えることが困難な隔たり) と 4 肢 カニバリゼーション / キャズム / 死の谷 / レッドオーシャン が一致 |
| `q069` | 題幹 + 空欄 a・b (罫線枠、clean は「a」「b」の地の文で表す = 描画補助) と 4 肢 (圧縮率を向上させる / 一貫性を保つ × 分割 / 統合) が一致 |

→ **見落とし 0 / 6**。この外に §4f / §4g と page 直読で CLEAN 題 20 問 (q025 q029 q030 q031 q033 q048 q054 q064 q067 q071 q073 q074 q076 q083 q084 q086 q087 q088 q089 q097) を源と照合し、見落としは `q025` / `q084` (引用符) の 2 題。
(q054 / q064 / q073 / q083 / q097 も crop 原寸で確認。源の等幅書体は O と 0 が近似字形で「0S」「0pen」に見えるが、文脈どおり OS / OSS / Open。
§4g のうち `q055` のみ crop 未読 — raw↔clean 差は表区切り「|」の除去 4 箇所だけで語の差は無い。)

---

## 5. SOURCE_TYPOS

本 unit では**該当なし**。

---

## 6. 採用した差分 (14 題 / 23 論理差分)

| id (page) | field | 差分 | severity | 由来 |
|---|---|---|---|---|
| q025 (p11) | stem (clean) | `"ビッグデータ"` → 源 `“ビッグデータ”` | cosmetic | **fixer 走査** |
| q032 (p14) | choice.ア | `販売才とだ民Lた` → 源 `販売することにした` | **semantic** | agent |
| q032 (p14) | choice.イ | `業界3位の( 社` → 源 `業界3位の C 社` (zh / en 追随) | **semantic** | agent |
| q032 (p14) | choice.ウ | `加エメーカー` → 源 `加工メーカー`。**正解肢** | **semantic** (agent: cosmetic) | agent |
| q040 (p18) | choice.ウ | `回避" で` → 源 `“回避”で` | cosmetic | agent |
| q041 (p19) | choice.ア | `をも・ たせない` → 源 `をもたせない` | cosmetic | agent |
| q041 (p19) | choice.ウ | `その他理的` → 源 `その倫理的`。**正解肢** | **semantic** | agent |
| q049 (p23) | choice.イ | `におからない` → 源 `にならない` | **semantic** | agent |
| q049 (p23) | choice.ウ | 末尾 `␠×5「` 除去 | cosmetic | agent |
| q049 (p23) | choice.エ | 末尾 `␠×7「` 除去 | cosmetic | agent |
| q066 (p31) | stem (raw = 出荷層) | `複雑な操作` → 源 `煩雑な操作` (zh / en・解説の題幹引用追随) | **semantic** | agent |
| q070 (p34) | choice.イ | `模僚` → 源 `模倣` (zh / en 追随) | **semantic** | agent |
| q072 (p35) | stem (clean) | `「口座」表，「顧客」表及び「取引明細」表` → 源 `“…”` | cosmetic | agent |
| q078 (p38) | choice.ウ | `キャリアグリゲーション` → 源 `キャリアアグリゲーション` | **semantic** | **machdiff** |
| q082 (p39) | choice.ア | 末尾 `␠×13「` 除去。**正解肢** | cosmetic | agent |
| q082 (p39) | choice.エ | 末尾 `ー 39 一␠×5“` 除去 | cosmetic | agent |
| q084 (p40) | choice.ア | ASCII `"` ×6 → 源 `“…”` ×3 | cosmetic | **fixer 走査** |
| q084 (p40) | choice.イ | 同上 | cosmetic | **fixer 走査** |
| q084 (p40) | choice.ウ | 同上 | cosmetic | **fixer 走査** |
| q084 (p40) | choice.エ | 同上。**正解肢** | cosmetic | **fixer 走査** |
| q090 (p44) | choice.イ | `という "信頼の輪"によって` → 源 `という“信頼の輪”によって` | cosmetic | agent |
| q091 (p45) | choice.イ | 末尾 `␠×16「` 除去 | cosmetic | agent |
| q094 (p46) | stem (raw = 出荷層) | 閉じ引用符 ASCII `"` ×4 → 源 `”` | cosmetic | agent |

### zh / en / 解説の追随

| id | zh | en | 解説 | 判定 |
|---|---|---|---|---|
| q066 stem | 使复杂的操作 → 使繁琐的操作 | complex operations → cumbersome operations | correct の題幹引用 (jp / zh / en、3 置換) | **全層追随** |
| q070 イ | 为防止再次发生 → 为防止模仿 | preventing recurrence → preventing imitation | 解説イは解説者の論証 → 不変 | **zh / en 追随** |
| q032 イ | 与行业排名第3的公司 → 与行业排名第3的C公司 | merge with the third-largest company → merge with C, the third-largest company, | 解説イは C を引用しない → 不変 | **zh / en 追随** |
| q025 / q072 / q094 stem | 各言語の体裁で不変 (q094 zh は既に “”) | ASCII / 「」 据置 | 不変 | ⑨-c |
| q084 / q090 / q040 選択肢 | ASCII / 無引用で据置 | ASCII 据置 | 不変 | ⑨-c |
| 他の選択肢 (q032 ア・ウ / q041 / q049 / q078 / q082 / q091) | 既に正 | 既に正 | 腐敗語の引用なし | 不変 |

### 指示から外した点 (逸脱)

1. **計上に fixer 走査の 2 題を含めた** (§2)。U9 定義なら 12 題 / 16.9%。**Rule D 確認点**。
2. **`q032 ウ` の severity** — agent cosmetic → semantic (近似字形だが語内置換の規則どおり)。**Rule D 確認点**。
3. **訳層の追随 3 件** (`q032 イ` / `q066` / `q070 イ`) — 指示は「s975 の推測語は zh / en まで追随」。本 unit は stem の s975 推測は 0 件だったが、訳層が OCR 誤りを推測して訳した 3 件を同じ扱いで追随した。訳語 (「C公司」"C, the third-largest company" / 「繁琐」"cumbersome" / 「模仿」"imitation") は fixer の選択 (**Rule D 確認点**)。
4. **`q084` の置換方式** — subN ではなく選択肢全文の assert-once (開き / 閉じが同じ `"` のため)。`Q84()` が `"` の個数 6 を要求する。
5. **`q074` を不変** (§3c)。表示順 (本文 → 表 → 問文) を源順 (本文 → 問文 → 表) に並べ替えることはしなかった。
6. **raw 層の扱い** — `q025` / `q072` の raw は clean と別の崩れ (N5)。`q066` / `q094` は clean 無しで raw が出荷層なので raw 3 層を是正。

---

## 7. 層と局所性

適用時の ✓ 行 (dry-run と同一) を層別に数えた実数:

| 層 | 置換操作数 | 備考 |
|---|---|---|
| raw (`questions.json` / `question_bank.json` / `by_year/2026r08.json`) | **63** | choices 19 置換 × 3 = 57 / stem q066 × 3 = 3 / q094 引用符 subN ×4 × 3 層 = 3 操作 |
| sidecar (`translations/2026r08.json`) | **8** | `stem_jp_clean` 2 (q025 / q072) + zh・en 6 (q066 stem / q032 イ / q070 イ) |
| `.phase1/tr_<id>.json` | **7** | q025 clean 1 / q066 zh・en 2 / q032 イ zh・en 2 / q070 イ zh・en 2 |
| 解説 `.phase2/expl_{jp,tr}_2026r08-q066.json` | **3** | correct jp / zh / en |
| key_guard final note (`.phase2/generate_result_2026r08.json`) | **8** | D-143: **final のみ**、round1 不可触 |
| **fidfix 合計** | **89** | `quiz-fidfix-S127-u11.mjs` の `applied` と一致 |
| skip (想定どおり) | **7** | q025 raw ×3・q072 raw ×3 (別の崩れで from 不在) + `.phase1` q072 clean (既に “”)。**無言 guard skip 0**、⚠ 行 0 |

### 7a. `.phase1` と sidecar の既存の乖離 (本 unit 起因ではない)

- `tr_2026r08-q072.json` の `stem_jp_clean` は**適用前から** “口座” 等の “” を持ち、sidecar (「」) と違っていた。本 unit の是正で sidecar が `.phase1` に揃った。
- 他の 4 本 (q025 / q032 / q066 / q070) は置換箇所について sidecar と同文。

### 選択肢に clean 層は無い = **腐敗は学習者に見えていた**

- 2026r08 の sidecar のキー集合 = {`stem`, `choices`, `stem_jp_clean`} (clean は 100 題中 54 題、標本 71 題中 41 題)。**`choices_jp_clean` は存在しない** (実測)。
- → 選択肢 19 置換はすべて出荷層の腐敗。`q066` / `q094` は stem_jp_clean も無く raw stem が出荷層 (脚本の STEMN は clean 有りなら throw する guard 付き)。

### 適用ループの由来 (Rule D 向け)

`sub()` / `subN()` / FIX ループ / STEMN ループ / `expl()` 単一読み / NOTE_APPEND の適用処理は **U10 から無変更で流用**。追加は `Q84()` (q084 の対置換の to を作るヘルパ、`"` 6 個を assert) のみ。
EXPL は U10 の `{correct, dist, points}` 形式で、本 unit は correct の部分文字列置換 (assert-once) のみ使用。

### key_guard final note

- 2026r08 の `generate_result` の final `note_jp` は **100 題中 98 題が空文字** (実測。非空は q001 / q058 のみで、いずれも本 unit の対象外)。
  したがって追記後の final note は MARK 文のみになり、final ≠ round1 → merge は round1 ブロック (note 空) を publish する (U5〜U10 と同じ D-143 の挙動)。
- 対象 **8 件** = 語義 (`q032` `q041` `q049` `q066` `q070` `q078`) + 正解肢命中 (`q082` ア残渣 / `q084` エ引用符、`q032` `q041` は重複)。
  **追記しない 6 件** = `q025` / `q040` / `q072` / `q090` / `q091` / `q094` (引用符・残渣のみ、非正解肢)。
- 機械照合 (適用前退避 `scratchpad/u11/pre/phase2/generate_result_2026r08.json` と比較): note 変化 **8 件、8/8 が純粋後置** (`final.startsWith(旧 final)`)、`key_guard_round1` の変更 **0 / 100**、note_jp 以外の変化 **0**。
- `explanations/2026r08.json` 内 MARK `fidfix-S127-u11` = **8**。
- 非出荷の `.phase2/expl_jp_2026r08-q070.json` の key_guard.note_jp (「再発が正と推定」) は merge が読まない → 不変 (⑨ 継続)。

### tracked データの差分 (`git diff --numstat`)

| ファイル | 差分 | 内訳 |
|---|---|---|
| `data/ip/quiz/questions.json` | +21 / −21 | choices 19 + stem_jp 2 (q066 / q094) |
| `data/ip/quiz/translations/2026r08.json` | +8 / −8 | clean 2 行 + zh・en 6 行 |
| `data/ip/quiz/explanations/2026r08.json` | +67 / −11 | q066 correct (jp / zh / en) + final `note_jp` 8 + round1 ブロックの publish |
| 他 28 exam の `translations/`・`explanations/` | **0** | 再 merge なし |

`question_bank.json` / `by_year/2026r08.json` / `.phase1` / `.phase2` は gitignore 下 (適用前状態は scratchpad `u11/pre/` に控えて照合)。
`.phase1` の変化は 4 本 (q025 / q032 / q066 / q070)、`.phase2` は `expl_{jp,tr}_2026r08-q066` + `generate_result_2026r08` の 3 本のみ (退避 208 本と `cmp`)。

---

## 8. 事後核験

**(a) 是正後 manifest を再構成して machdiff を再実行**

```
node scripts/quiz-fidelity-prep-any.mjs 2026r08 u11post "<71 問の番号カンマ区切り>" --precrop
  precrop: 61/71 questions cropped; skipped 10 questions (page_mismatch 9 / chumon 0 / merged_preamble 1 / thin_band 0), 4 pages (page_mismatch)
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u11post_fidelity_input_2026r08.json <同じ結果 JSON>
✗ AGENT_MISSED 2026r08-q072 stem … disp ["口座番号(主キ-)",…,"顧客番号(外部キ-)"] src ["口座番号",…,"顧客番号"]
✗ AGENT_MISSED 2026r08-q074 stem … (問文の位置)
machdiff: fields same=353 | AGENT_MISSED=2 | VERDICT_CONFLICT=0 | audits w/o transcript=0 | UNREADABLE skipped=0 | coverage 71/71
```

- 事前の 3 件のうち `q078` は消え、`q072` (描画補助) / `q074` (文順) の既知型 2 件のみ残る (§3b / §3c)。**新規残差 0**。
- precrop: 再 prep で 61 枚が再書込みされた (適用前の crop を退避していなかったため、適用前との byte 比較はできない)。
  代わりに再 prep 後の 61 枚を退避 → もう一度 prep → **61/61 byte 一致** (crop は源ページと bbox からの決定的生成) を確認した。split も 61/10 で同一。生成した `u11post` manifest は削除済。

**(b) 出荷層の残存語** (`questions.json` の 2026r08 + `translations/2026r08.json` + `explanations/2026r08.json`):
`販売才` `( 社` `加エ` `をも・` `その他理` `におからない` `模僚` `ー 39 一` は **key_guard final note (後置の是正記述) 内のみ**。
`复杂的操作能够` `为防止再次发生而` `回避"` `"信頼の輪` `「口座」表` (stem) は **0**。
`questions.json` の `"HDD` は **0**、`キャリアグリゲーション` は `q064` raw stem のみ (clean が出荷層、N5)、`q025` raw は別の崩れ「 "ビッグデー タ” 」のまま (N5)。`複雑な操作を簡単に行える` は 0。
解説の残存: `「口座」表` 4 は q072 解説の地の文 (解説者の引用) / q066 エ「複雑な操作を簡単にする機能ではない」/ en "complex operations" 1 (エ) は解説者の語 (§4b) / "preventing recurrence" 3 は q046 / q048 / q070 の解説者の論証。いずれも意図的に不変。
translations の `"HDD` 6 は q084 zh / en の ASCII 引用符 (⑨-c 据置)。

**(c) 波及ゼロの機械証明**

| 検査 | 結果 |
|---|---|
| `questions.json` 2900 問の変化 id | **12 題** = q032 q040 q041 q049 q066 q070 q078 q082 q084 q090 q091 q094 (raw に置換があった題、§6 と一致。q025 / q072 は clean のみ) |
| `question_bank.json` の変化 id | 同じ 12 題 |
| `correct_answer` 変更 | **0 / 2900** (bank・questions とも機械照合) / `git diff -U0 data \| grep -c '"correct_answer"'` = **0** |
| `translations/` 追跡下 29 exam | **2026r08 の 8 行のみ** |
| `generate_result_2026r08.json` | note 変化 8 (純粋後置 8/8)、round1 変化 0、他 path 変化 0 |
| `answer_keys.json` | **md5 `6802bb0bc13004da78ad3c4e5117d997`、mtime `1788586696` 前後同一** |

---

## 9. ゲート

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ SPLIT_FIGURE 0 件 / (A)(B) GREEN (判定 JSON 50 件) |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ `chumon_groups.json は生成結果と一致` (`?` 情報行は既存) |
| `pnpm --config.verify-deps-before-run=false -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm --config.verify-deps-before-run=false -C apps/web test` (vitest) | ✅ **38 passed / 1 skipped (39 files)、562 passed / 2 skipped (564 tests)** |
| `pnpm --config.verify-deps-before-run=false -C apps/web build` | ✅ exit 0 |
| `node --check scripts/quiz-fidfix-S127-u11.mjs` | ✅ |
| fidfix dry-run (既定) 再実行 | ✅ **applied 0 / skipped 96、files to write 0** (完全冪等。96 = 初回 applied 89 + skip 7) |
| `correct_answer` 差分 | ✅ **0 / 2900** |
| `answer_keys.json` | ✅ byte 不変 (md5 + mtime) |
| 事前 / 事後 machdiff | ✅ AGENT_MISSED 3 → 2、残 2 は既知型の偽陽性 (q072 描画補助 / q074 文順)、実残差 0 (§3・§8a) |
| D-143 | ✅ MARK 付き final note **8**、純粋後置 8/8、round1 変更 0、`explanations` 内 MARK **8** |
| e2e (Playwright) | **未実行** — U7〜U10 §9 と同じ理由 (prod 別名を叩く構成)。本 unit は文字列置換のみ |

適用前の前提検証: `quiz-phase2-merge.mjs 2026r08` を**先に実行して `git diff data` 0** (merge 冪等) を確認。
merge の報告 `SUSPECT 1 (q058)` / `STEM-CORRUPTION 1 (q001*)` は**適用前後で同一** (いずれも本 unit の標本外)。
再生成: `build-quiz-corpus.mjs` (2900 問 / with_fig 511) → `quiz-phase2-merge.mjs 2026r08`。図の変更は無いので `build-quiz-figures` は不要。

---

## 10. 見送り

| クラス | 該当 | 理由 |
|---|---|---|
| zh / en の引用符体裁 | `q025` / `q084` / `q090` zh・en ASCII、`q072` zh「」、`q094` en ASCII | 各言語の体裁 (⑨-c、U8〜U10 precedent) |
| en の「」 | `q072` en「「Account」 table」等 3 組 | ⑨-c で据置としたが、英語に日本語の鉤括弧は体裁として不自然 → **NIT 候補** (§11) |
| 描画補助 | `q072` 表見出しの「(主キー)」「(外部キー)」(源は実線 / 破線の下線)、`q069` `q089` の空欄 a・b の地の文表記 | 視覚記号の文字化。machdiff の既知偽陽性 |
| 文順 | `q074` 問文が表の後ろ (源は表の前) | 欠落 0、表示上の配置 (§3c) |
| 非出荷の key_guard note | `.phase2/expl_jp_2026r08-q070.json` の「再発が正と推定」 | merge が読まない。⑨ 継続 |
| N5 (raw の残存腐敗、clean が出荷層) | `q025` raw「 "ビッグデー タ” 」/ `q072` raw「“顧客 表及び “取引明細" 表」/ `q064` raw「キャリアグリゲーション」/ `q048` `q097`「適切かもの」/ `q054`「拳げた」/ `q089` raw「層点」(途中で切れる) ほか §4g の raw 側 | 学習者不可視 |
| 解説の地の文 | `q072` 解説の「口座」表、`q066` エ「複雑な操作を簡単にする」、`q070` イ「再発を防ぐ」 | 解説者の語・論証で題幹の文字列引用ではない |
| 読点・空白 | clean の「、」正規化 (`q025`)、`q084`「HDD とSSD」、`q094`「” 及び“」の空白 | 許容表記揺れ |

---

## 11. backlog (⑨ / 次 unit へ)

### ⑨ 新規: machdiff の引用符正規化による検出漏れ (**優先**)

- `scripts/quiz-fidelity-machdiff.mjs:25` が `“”„"「」『』〝〟'` をすべて `"` に畳むため、**引用符の字種の残差は machdiff では原理的に検出できない**。
  本 unit で agent も見落とした `q025` / `q084` (計 5 フィールド、うち正解肢 1) は fixer の走査でしか拾えなかった。U8〜U11 の引用符系差分 (U10 q005 / q033 / q088、U11 q040 / q072 / q090 / q094) は agent が拾った分だけ。
- 提起: (1) machdiff に「表示層の ASCII `"` と transcript の “” の不一致」だけを別判定する警告を追加、または (2) 出荷層の ASCII `"` を全庫で機械抽出 → 源照合 (既完了 unit を含む)。

### ⑨ 新規: 訳層が OCR 誤りを推測して訳す型 (s975 の訳層版)

- 本 unit で 3 件: `q070 イ`「模僚」→ zh / en「再発」、`q032 イ`「( 社」→ zh / en が C を落とす、`q066`「複雑」(raw の語置換) → zh / en「复杂 / complex」。
  `q070` は生成時の key_guard note が zh 訳を根拠に「再発が正」と**逆に推定**していた。jp を是正しても zh / en が追随しないと三言語で意味が割れる。
- 提起: 各 unit の fixer で、jp 側に OCR 置換を是正した選択肢・題幹は zh / en の該当句を必ず照合する (本 unit では実施)。全庫横断なら「jp に字化けが残る / 残っていた箇所の zh / en」を重点に。

### ⑨ 更新: s975 再構成の横断走査 (U10 新規の続き)

- 2026r08 では stem 層の推測語・推測数値は **0 件** (§4g、clean を持つ 37 題の raw↔clean 差 14 題を全件源照合)。U10 の 3 件 (2025r07) と合わせ、⑤-2 掃引済み exam の stem 層は概ね確認済み。
  `stem_reconstructed_s975` を持つ sidecar は 29 / 29 exam (fixer 実測 `grep -l`)。⑤-2 の掃引外 (中問 / 標本外) の題は未確認のまま。

### ⑨ 新規 (NIT 候補): en の「」

- `q072` en「A relational database manages an 「Account」 table, …」。⑨-c (各言語の体裁) は zh「」/ en ASCII を想定していたが、en に日本語の鉤括弧が入っている。全庫の en で `「` を機械抽出して規模を見る。

### ⑨ (継続)

- **選択肢末尾の OCR 残渣「 「」型**: 本 unit も `q049 ウ・エ` / `q082 ア` / `q091 イ` の 4 件 (+ `q082 エ` ページ番号「ー 39 一」型)。U10 の提起 (`/ {5,}「$/` の choices 全体機械走査) を継続。
- **非出荷の expl_jp key_guard note**: `q070` の「再発が正と推定」。将来 note を出荷層に上げるなら要是正。
- **語中の改行由来空白** (U10 Rule D NIT-2): 本 unit も raw に「テレワ ーク」「サー バ」等が多数あるが、いずれも clean が出荷層の題。raw 出荷層の題では `q041 ア`「をも・ たせない」(中点付き) を是正した。
- **旧 ROOT 直書きの過去 workflow 脚本** (U10 新規): 本 unit では未着手。

---

## 12. Rule B (失敗記録)

**本 unit の抄写 run・是正器に失敗 attempt は無し。** run は 1 回で完走 (71/71、UNREADABLE 0)。
是正器は dry-run → `--apply` の初回で assert 違反 0 (⚠ 行 0)。
`failures/` への新規追加は**なし**。

---

## 13. Rule D

Writer = `u11-fixer` (`oh-my-claudecode:executor` opus)。**Reviewer は別 `subagent_type` (opus) で本 evidence の後に別途実施すること**
(本ファイルは writer の自己申告であり、Rule D の審査は未了)。

審査時の重点:

1. **§4a / §4b / §4c 訳層の追随 3 件 (最重点)** — `q070 イ` zh「为防止模仿」/ en "preventing imitation"、`q032 イ` zh「C公司」/ en "merge with C, the third-largest company,"、`q066` zh「繁琐」/ en "cumbersome"。
   源 (p34 / p14 / p31) の実読と訳語の妥当性。`q066` 解説の題幹引用 3 置換と、エ の地の文を不変にした線引き。`q070` 解説イ (「再発を防ぐ」) を不変にした判断。
2. **§2 計上の定義** — fixer 走査 2 題 (`q025` / `q084`) を計上に含めた (14 題 / 19.7%) か、U9 定義 (12 題 / 16.9%) か。
3. **§3 machdiff 3 件の裁定** — `q078` 実残差 / `q072` 描画補助 / `q074` 文順 (新しい型の偽陽性)。
4. **§4f `q084` 正解肢エを含む 4 肢の引用符置換** — 源 p40 の 12 組と、`Q84()` の対置換の正しさ。
5. **§2 severity 入替** — `q032 ウ` cosmetic → semantic (加エ / 加工 の近似字形)。
6. **§4a 正解肢 3 件** — `q032 ウ` / `q041 ウ` / `q082 ア`。
7. **§4g s975 照合** — raw↔clean 差 14 題の源照合 (特に `q067` 擬似言語、`q076`「4G」、`q089`「弱点」)。
8. **§7 脚本** — U10 からの変更は `Q84()` のみ。
9. **§4h CLEAN 標本 6 問** (fixer とは重ならない標本での追加抽検を推奨)。

---

## Rule D (u11-reviewer、`pr-review-toolkit:code-reviewer` opus、fixer executor と別 type) — **PASS-with-notes**

- MAJOR 0 / MINOR 0 / NIT 3。採用 23 論理差分 (14 題) を源 crop / 源ページ (p14・p34・p36 は全ページ) で自分で読み、**23/23 支持**。
  `q078 ウ` は 4 倍に拡大して「キャリア**アア**グリゲーション」を確認。
- 正解肢上 4 件: `q032 ウ` 加工 / `q041 ウ` その倫理的 / `q082 ア` 文末残渣のみ / `q084 エ` “…” ×3 組 (p40 は 4 肢とも 3 組、計 12 組で `Q84()` の 6 個 assert と一致)。いずれも源どおりで、`correct_answer` は不変。
- 訳層の追随 3 件は承認: `q032 イ`「C公司」/ "merge with C, the third-largest company," は正しい。`q066`「繁琐」/ "cumbersome" は「煩雑」の訳として適切で、解説の題幹引用 3 置換も正しい。`q066` エ の地の文と `q070` 解説イ「再発を防ぐ」を据え置いた判断も承認 (解説者自身の論証で、選択肢を否定する論理は崩れていない)。`q070 イ` zh「为防止模仿而不用于…」は源の係り方どおり (NIT-1 は en のみ)。
- s975 は推測補完 0 件、という主張を独立に確認: `q067` (擬似言語は全行を逐字照合。答えイ 1,2,3,5,4 を再導出)、`q074` (表 A1〜D5 と式の答えア)、`q076`「(4G)」、`q083`「a〜c」「OS」、`q089`「弱点」・脆弱性。推測された語や数値は無い。
- machdiff: 事前 run を再実行すると申告どおり AGENT_MISSED 3 (q072 / q074 / q078)。`q072` 下線の文字化 = 描画補助 (偽陽性) で承認。`q074` 問文を表の後に置いた件は欠落字 0、表示上の配置だけの差なので**不変を承認** (新型の偽陽性として記録)。`q078` の採用も承認。
  事後 machdiff は gitignored の manifest / crop を再生成するため reviewer では回さず、fixer の §8a (crop 61/61 byte 一致の確認付き) に依拠した。
- 逸脱 6 件 (§6) はすべて承認。計上 14 題 / 19.7% は U9 定義の 12 題 / 16.9% を併記しているので可。`q032 ウ` を semantic とした再分類は規則どおり。
- D-143: 適用前の退避と機械照合し、note 変化 8 件はすべて純粋な後置、round1 変化 0、他の path の変化 0、`explanations` 内の MARK 8。bank / questions とも変化 id は 12 題で §8c と一致、`correct_answer` の変化 0 / 2900。`answer_keys.json` の md5 は `6802bb0b…` で不変。
- CLEAN の追加抽検 (fixer の標本と重ならない題): `q011` / `q021` / `q035` / `q051` / `q079` / `q098` → 漏れ 0/6。加えて 2026r08 の出荷層全 100 題 (`/"/`・末尾残渣・ページ番号・`・ `) を独立に走査し、標本内のヒットは 0。
- ゲート再実行: crosscheck (A1–A7, B1–B7) / assert-clean / chumon `--check` / fidfix dry-run **applied 0・skipped 96・files 0** / 事前 machdiff 3 件は再現 → すべて GREEN。vitest / build はコード変更が無いため fixer の結果 (562 passed) を採用。

### NIT
- **NIT-1** `q070 イ` en "…is not used to strengthen information security controls for the purpose of preventing imitation." — 目的句が否定の内側に読める (「模倣防止の目的では使わない」)。源と zh は「模倣を防ぐために、管理策の強化には用いない」(目的は「用いない」に係る)。答えと解説の論理には影響しない。推奨は任意: "In order to prevent imitation, knowledge gained from information security incidents is not used to strengthen information security controls."
- **NIT-2** (標本外) `q057` ア〜エ の出荷層に ASCII `"学生"表` 等が残る (2026r08 の 71 問標本外)。§11 ⑨「出荷層の ASCII `"` を全庫で機械抽出 → 源照合」の実例として backlog に追加。
- **NIT-3** `q088` raw stem (出荷層) の空欄が `| a |` `| b |` 表記で、`q076` の `[ a ]` と揃っていない。描画補助なので忠実度の誤りではない (CLEAN は妥当)。表記の統一は ⑨-c 扱い。
