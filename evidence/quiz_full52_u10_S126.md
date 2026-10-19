# ⑤-2 全量保真掃引 U10 — 2025r07 の集計と是正 (S126)

⑤-2 全量核験の **U10** (`docs/phase5/PLAN_52_units.md` §2、D-146)。母数は
`evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json` の 2025r07 = **80 問**。
**Sonnet 5 単 pass** の 9 回目の本番 unit。

---

## 1. 入力と実行

- run: `wf_5a64e0c3-6dc` (label `u10`、pass `sn`、model = **Sonnet 5**、gp)
- マニフェスト: `data/ip/quiz/.phase2/u10_fidelity_input_2025r07.json` (`--precrop` 版、crop **80/80**、page_mismatch 0)
- 結果 JSON: `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u10_2025r07_sn.json`
- **覆盖 80/80 / CLEAN 67 / DISCREPANT 13 / UNREADABLE 0**、差分 15 {cosmetic 10, semantic 4, answer_affecting 1}、正解肢上 2 (`q091 エ` / `q095 ウ`)
- 是正器: `scripts/quiz-fidfix-S126-u10.mjs` (既定 dry-run、`--apply` で書込み)

### Sonnet 単 pass の実測

| 項目 | U7 (2022r04 75) | U8 (2023r05 91) | U9 (2024r06 72) | **U10 (2025r07 80)** |
|---|---|---|---|---|
| token | 4,944,550 | 5,933,780 | 4,642,332 | **4,322,067** |
| token / 問 | 65,927 | 65,206 | 64,477 | **54,026** |
| 時間 | 13.4 分 | 13.7 分 | 9.7 分 | **3.4 分** |
| tool 呼び出し | 740 (9.9) | 851 (9.4) | 648 (9.0) | **328 (4.1 回/問)** |
| UNREADABLE | 0 | 0 | 0 | **0** |

(token・時間・tool 数は主 context 申告の workflow ログ値。U10 は precrop 80/80 で tool 数が半減。)

---

## 2. 率

| exam | n | agent DISCREPANT | +machdiff | 計上 (率) | **是正** (率) | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|---|---|
| 2025r07 | 80 | **13** | **+0 題** (AGENT_MISSED 2 = いずれも既知型の偽陽性、§3) | 13 (**16.3%**) | **13 (16.3%)** + 指示名指し 1 題 (q078、raw のみ) | **2** | **0** (agent 1 → 再分類、§4b) |

- 題数 13 = q005 q009 q014 q024 q033 q052 q070 q072 q085 q088 q091 q095 q098 (agent DISCREPANT 13 題と同一)。
- 是正題は 14 = 上記 13 + **`q078`** (指示で名指し、raw stem のみの括弧字種で clean は既に〔〕= 学習者不可視)。**q078 は計上に入れない** (U9 の計上 = agent DISCREPANT 題 + machdiff 実残差、の定義どおり)。
- agent の 15 差分は**全件採用**、加えて指示の q078 1 件 → **16 論理差分**。非採用 **0**。
- **severity 再分類 (fixer、16 論理差分)**: cosmetic **10** / semantic **6** / answer_affecting **0**。
  規則 (U6〜U9 §2 と同一): 読点・句点・引用符・括弧の字種、見出し、空白、文末残渣 → cosmetic、語の内部で字が入る / 落ちる / 置き換わる → semantic。
  answer_affecting は波 1 `2015h27a-q044` の判定軸 (**表示テキストだけから stored key を導出できない、または別肢が正解化する**) で判定。
  - agent {cosmetic 10, semantic 4, answer_affecting 1} から **2 件を入れ替えた**:
    - `q024 イ` cosmetic → **semantic** (「搬送**か**など」= 語への字の挿入、U9 `q082 サービスヘへ` と同型)
    - `q085` stem answer_affecting → **semantic** (§4b。表示の 89% / 90% でも導出字母はイで一意、他肢は正解化しない。ただし数値そのものが源と違う重大な語義腐敗で、解説全面に波及)
  - cosmetic 10 = `q005` 引用符 1 / `q033` 引用符 2 / `q052 イ` 残渣 1 / `q072` 括弧 1 / `q078` 括弧 1 (指示) / `q088` 引用符 1 (×4 字) / `q091 ア` 残渣 1 / `q091 エ` 残渣 1 / `q098` 括弧 1
  - semantic 6 = `q009 ア` 育定→肯定 / `q014` 強み→俯瞰 / `q024 イ` 搬送か→搬送 / `q070` 修正→是正 / `q085` 89・90→30・35 / `q095 ウ` 項目問→項目間
- **正解肢上 2 差分** = `q091 エ` (cosmetic、文末残渣「に」) / `q095 ウ` (semantic)。**`correct_answer` は不変**。
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
| **U10 (2025r07)** | **80** | **13** | **16.3%** | **2** | **0** | **Sonnet 単 pass** |
| **累計 (波 1–3 + U3a〜U10)** | **1137** | **142** | **12.5%** | **32** | **6** | — |

(正解肢上は従来どおり**差分数**で数える。)

U10 の支配型は 2 つ:
1. **s975 再構成 (`stem_reconstructed_s975 = true`) による推測語・推測数値** — raw の OCR 崩れを clean 化の段で「それらしい」語に置き換えていた:
   `q014`「佑典」→ clean「強み」(源「俯瞰」)、`q070`「量正」→「修正」(源「是正」)、`q085`「399%%」「359%」→「89%」「90%」(源「30%」「35%」)。
   いずれも raw は崩れていて clean だけを見ると自然な文になっているため、clean 層の自己整合性検査では検出できない型。**⑨ 新規 (§11)**。
2. **引用符・括弧の字種** (q005 / q033 / q088 / q072 / q098) と **選択肢末尾の OCR 残渣** (q052 / q091)。

---

## 3. 機械 diff (machdiff) — AGENT_MISSED 2 (いずれも既知型の偽陽性)

```
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u10_fidelity_input_2025r07.json \
  evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u10_2025r07_sn.json
✗ AGENT_MISSED 2025r07-q005 stem verdict=DISCREPANT: @0 disp(after agent fixes)「当該期の売上原価を"期首棚卸高+当期」 src「A社ではB商品の仕入れと販売を行って」
✗ AGENT_MISSED 2025r07-q072 stem verdict=DISCREPANT: @91 disp(after agent fixes)「近づけてグル-プにする.[a]:要素を意図したル-ルに基づき」 src「近づけてグル-プにする.a:要素を意図したル-ルに基づき配置」
machdiff: fields same=398 | AGENT_MISSED=2 | VERDICT_CONFLICT=0 | audits w/o transcript=0 | UNREADABLE skipped=0 | coverage 80/80
```

- **(a) `q005` = agent の差分記述による整列ずれ (実残差ではない)**。agent の差分 1 件は `current_text` に**題幹全文**、`source_text` に**該当句だけ**
  (「当該期の売上原価を“期首棚卸高＋当期商品仕入高－期末棚卸高”で計算するとき」) を入れていた。machdiff は表示に agent の修正
  (current → source) を当ててから transcript と比べるため、題幹が断片に置き換わり、先頭から食い違う。源 (p03 crop) を全文実読すると、
  文の順序・脱落とも無く、表示との差は**引用符「」→“” の 1 点のみ** (§4a)。是正後の事後 machdiff ではこの残差は消えた (§8a)。
- **(b) `q072` `[a]` vs `a` = 空欄枠の描画補助 (既知型)**。源は罫線で囲んだ空欄「a」「b」。clean は `[ a ]` `[ b ]` で枠を表している
  (U9 `q085`「［ a ］」と同じ扱い。agent も非計上)。字種の規約を決める問題ではなく描画補助 → 不変。事後 machdiff にも残る (既知の偽陽性)。

→ **実残差 0**。停止条件 (説明できない machdiff 実残差) には当たらない。

---

## 4. 裁定 (fixer が源を原寸〜4 倍で独立実読)

実読した源: `data/ip/quiz/.phase2/precrop/2025r07/` の **q005 / q009 / q014 / q024 / q033 / q052 / q070 / q072 / q085 / q088 / q091 / q095 / q098** (crop、原寸)、
`q078` は crop が無い (母数外) ので **page-37 直読**。数字・引用符・字形の判断が要る `q085` (30% / 35%)・`q088` (閉じ引用符)・`q095` (間 / 問) は
apps/web の sharp で **4 倍 nearest 拡大** して確認した (scratchpad `u10/q85.png` / `q88.png` / `q95.png`)。
agent の `source_text` は候補として扱い、すべて自分の目で読んでから from/to を決めた。**採用 16 / 非採用 0**。

### 4a. `q005` stem (p03) — 引用符「」→“” (cosmetic) + machdiff (a) の裁定

源:「…当該期の売上原価を“期首棚卸高＋当期商品仕入高－期末棚卸高”で計算するとき，…」。66/99 の “”。
clean「「期首棚卸高＋当期商品仕入高－期末棚卸高」」→ “…”。clean の他の部分 (読点を「、」に正規化) は許容表記揺れ (U9 14f `q054` と同じ)。
raw は `"期首棚卸高十当期商品 仕入高一期末棚卸高"` (ASCII 引用符 + 「十」「一」+ 行末空白 + 末尾「「」) と崩れが同居 → **N5 据置** (clean が出荷層)。
zh「「期初存货金额＋…」」/ en `"beginning inventory + …"` は各言語の体裁で不変 (U8 `q004` / `q034` の ⑨-c precedent)。
解説 correct_jp の「「期首棚卸高＋当期商品仕入高－期末棚卸高」で求める」は解説者の地の文の引用 → 不変 (U9 §4b の線引き)。

### 4b. **`q085` stem (p40) — s975 再構成の捏造数値「89% / 90%」→ 源「30% / 35%」(semantic、agent: answer_affecting)**

- 源 (crop 原寸 + 4 倍):「…誤り率が5%低下する（前回の誤り率の95%になる）。現在の正解率が**30%**であるとき，正解率が**35%**を超えるためには，少なくともあと何回の学習の過程が必要か。」
  0 は斜線無しの通常字形。4 肢 1 / 2 / 3 / 4。
- dataset: raw「誤り率が596 低下」「現在の正解率が399%%」「359%を超える」(OCR 崩れ)、clean / sidecar zh・en / `.phase1` はすべて **89% / 90%**。
  `translations/2025r07.json` に `stem_reconstructed_s975: true` があり (`scripts/quiz-phase1.5-merge.mjs:66`)、clean の数値は再構成時の推測とみられる。
  generate_result の final note も「生 stem_jp は…数値が壊れているが、stem_jp_clean (…現在89%/90%を超える) で内部整合し答えは一意」と述べていた。
- **答えの再計算 (源の数値)**: 誤り率 70% (0.70)、目標は誤り率 65% 未満。
  1 回後 0.70×0.95 = **0.665** (正解率 33.5%、35% を超えない) / 2 回後 0.70×0.9025 = **0.63175** (正解率 36.825%、35% 超) → **2 回 = イ**。
  表示の 89% / 90% でも 0.11 → 0.1045 → 0.0993 で 2 回 = イ。**correct_answer=イ は不変** (偶然一致)。
- **severity**: agent は answer_affecting。波 1 `q044` の判定軸 (表示テキストだけで stored key を導出できるか / 別肢が正解化するか) では
  表示 89% / 90% から導出字母はイで一意、他肢も正解化しない → **semantic** に再分類した。
  ただし (i) 題の数値条件そのものが源と違い、(ii) 解説の導出は全面的に偽の数値に基づいていた点で、通常の semantic より重い。
  **Rule D 確認点**: 「数値の全置換で答えが偶然一致」を answer_affecting と見るか (agent 読み) semantic と見るか (house rule 読み)。
- **是正範囲**:
  - stem: clean (sidecar + `.phase1`) を「30%…35%」に。zh「当前正确率为 30% 时，为使正确率超过 35%」/ en "…is 30%, … exceed 35%?" (sidecar + `.phase1`)。
    raw の崩れ「596」「399%%」「359%」は clean が出荷層なので **N5 据置** (誤り方が clean と別物で、同一差分の層追随ではない)。
  - **解説 (jp / zh / en)**: correct 全文、ア 全文、ウ の数値句、points[0] / [1] の数値句を源の数値で書き直した (15 置換、§7)。エ は数値を含まず不変。
    - 置換表: 89%→30% / 90%→35% / 11% (0.11)→70% (0.70) / 10%→65% / 0.1045 (10.45%)→0.665 (66.5%) / 89.55%→33.5% / 0.0993 (≒9.93%)→0.63175 (63.175%) / 約 90.07%→36.825%
      (0.70×0.9025 は割り切れるので「≒」「約」を外した)。
    - **ア の誤解説明を書き換えた** (**Rule D 確認点**): 旧「誤り率5%低下を『11%-5%=6%』のような単純な引き算と誤解すると1回で足りると見える」は、
      源の数値では成り立たない (70%−5%=65% → 正解率ちょうど 35% で「超える」を満たさず、引き算でも 1 回では足りない)。
      新「誤り率5%低下を『正解率が5ポイント上がる(30%→35%)』と誤解すると1回で届くように見えるが、それでもちょうど35%で『超える』を満たさない。
      実際は前回の95%を掛ける比例的な減少で、1回後の正解率は33.5%にとどまる」(zh / en も同旨)。
    - 置換前後の全文は `scripts/quiz-fidfix-S126-u10.mjs` の `EXPL` に [旧, 新] の対で記載 (assert-once で旧全文の一致を要求)。
  - key_guard: final note に是正記述を後置 (D-143)。旧 note の 89% 導出は残るが、後置文で「上記の 89% / 90% は再構成の推測で源と違う」と明示。
  - 非出荷の `expl_jp_*.json` 内 key_guard.note_jp (89% 導出) は不変 (⑨ 継続)。

### 4c. `q014` stem (p07) — s975 再構成の推測語「現状の強み」→ 源「現状の俯瞰」(semantic)

源:「事業，経営情報に知財情報を組み込んで分析し，現状の俯瞰や将来展望などの分析結果を…」(「瞰」にルビの痕跡あり)。
raw「現状の佑典や」(OCR 崩れ、N5 据置)、clean「現状の強みや」は推測語。zh「现状的优势」/ en "current strengths" はその推測語を訳していた → 追随:
zh「并将对现状的俯瞰和未来展望等分析结果」/ en "such as a bird's-eye view of the current situation and future outlook"。
「強み」は誤答肢エ (SWOT 分析 = 強み/弱み/機会/脅威) の語で、**誤答肢への手掛かりを題幹に置いていた** (U8 `q011`「変革」の en と同型、ただし正解肢でなく誤答肢側)。
表示でも導出はイ (IP ランドスケープ) で一意 → semantic。解説本文は「強み」を題幹引用として使っていない (エ の SWOT 説明の「強み」は正当) → 不変。
final note の「clean では『強み』に是正済み」は誤りなので、後置文で訂正した。

### 4d. `q070` stem (p33) — 「修正する」→ 源「是正する」(semantic)

源:「…脆弱性を是正するセキュリティパッチをソフトウェアに適用することが…」。raw「量正」(OCR、N5)、clean「修正」は推測語 (同義寄りだが源と違う語)。
zh「修复漏洞」/ en "fix vulnerabilities" は「是正」の語義としても正 → 不変 (U9「既に正」と同じ扱い)。解説の「修正」は解説者自身の語で題幹の引用ではない → 不変。
final note の「clean で『修正』に是正済」を後置文で訂正。

### 4e. 選択肢 (raw = 出荷層)

| id | 源 (crop) | dataset | 判定 |
|---|---|---|---|
| `q009 ア` (p05) | 「…肯定派と否定派といった…」 | 「育定派」 | semantic。zh「肯定方」/ en "affirmative" は正 |
| `q024 イ` (p11) | 「組立てや搬送などに…」 | 「搬送かなどに」 | **semantic** (agent: cosmetic)。zh / en は正 |
| `q052 イ` (p24) | 「…A社のプロジェクトマネージャ」で終わる | 末尾に ASCII 空白 ×11 +「「」 | cosmetic (残渣)。zh / en は正 |
| `q091 ア` (p42) | 「…リスク保有の順番で進める。」で終わる | 末尾に ASCII 空白 ×12 +「「」 | cosmetic (残渣) |
| `q091 エ` (p42) **正解肢** | 「…リスク低減に該当する。」で終わる | 末尾に「に」 | cosmetic (文末の後ろの残渣で語の内部ではない)。zh / en は正。key_guard note 追記 (U9 `q012` precedent) |
| `q095 ウ` (p44) **正解肢** | 「…洗い出し，項目間の関連を整理する。」(4 倍で「間」の門構え内は「日」) | 「項目問」 | semantic。zh「各数据项之间」/ en "among the items" は正、解説も「項目間」で正 |

いずれも答え (q009 ウ / q024 エ / q052 ア / q091 エ / q095 ウ) は不変。

### 4f. 引用符・括弧 (cosmetic)

- `q033` stem (p15): 源「“レベル1”から“レベル5”に…。“条件付運転自動化”と呼ばれる“レベル3”が示す…」→ clean の「」4 組を “” に。
  raw は `“レベル1”" から“レベル5"” …"条 件付運転自動化” と呼ばれる"レベル3"` と ASCII 混在で崩れ → N5 据置。
  zh「级别1」等 / en `"Level 1"` 等は各言語の体裁で不変 (U8 `q004` / `q034` ⑨-c precedent)。
- `q088` stem (p41): **clean 無し → raw stem が出荷層**。源 (4 倍) は 4 組とも 66 形の開き + 99 形の閉じ。dataset は開き “ + 閉じ ASCII `"` ×4 → `”` に (subN n=4、3 層)。
  zh は既に “”、en `"…"` は英語の体裁で不変。
- `q072` stem (p34): 源の見出し「〔四つの原則〕」。clean「[四つの原則]」、raw「[四つの原則]〕」(崩れ、U9 q062 raw と同型) → いずれも〔〕。
  zh「[四个原则]」→「〔四个原则〕」(U9 q062 zh〔程序〕の precedent、同 exam `q098` zh〔步骤〕とも揃う)。en「[Four principles]」は据置 (U9 逸脱 ④)。
- `q098` stem (p45): 源「〔手順〕」。clean / raw「[手順]」→〔手順〕。zh は既に〔步骤〕、en「[Procedure]」据置。
- `q078` stem (p37、**指示で名指し**): 源「〔プログラム〕」。raw 3 層「[プログラム]」→〔プログラム〕。clean と sidecar zh は既に〔〕/〔程序〕(n=0 skip)。
  `.phase1/tr_2025r07-q078.json` の zh「[程序]」を sidecar に揃えて〔程序〕に。en「[Program]」据置 (U9 逸脱 ④)。
  q078 の raw は clean (出荷層) の陰で学習者不可視 → 計上外 (§2)。

### 4g. CLEAN 標本の無作為抽検

CLEAN 67 問 (id 昇順) から **seed 130 の LCG** (`s = (s·1103515245 + 12345) mod 2^31`、`c[s mod 67]`、重複は引き直し) で 5 問を抽出し、出荷層 (clean があれば clean、選択肢は raw) を源 crop と逐字照合した。

| id | 実読結果 |
|---|---|
| `q084` | 題幹「ISMS における情報セキュリティ方針に関する記述として，適切なものはどれか。」と 4 肢 (社内に限定 / 継続的に改善するコミットメント / 部門ごとに定める / 各職場の管理者によって承認) が一致 |
| `q027` | 題幹 4 行 (業務と情報システムを最適に…乖離を明確にし…移行計画として定義) と 4 肢 BI / EA / MOT / SOA (各英語正式名) が一致 (「乖離」のルビ「かい」は非転記で可) |
| `q082` | 題幹 (データベースの内容を他のコンピュータのデータベースに複製して…同期させる DBMS の機能) と 4 肢 アーカイブ / バックアップ / レプリケーション / ロールバック が一致 |
| `q046` | 題幹 (本番環境にインストールする手順を明確にし，それを実施する工程) と 4 肢 ソフトウェア統合 / ソフトウェア導入 / 妥当性確認 / 利用者教育 が一致 |
| `q048` | 題幹 + a〜c 3 行 (成果物 / 市販のスケジュール管理ツール / 要求事項を顧客が記載した文書) と 4 肢 a / a，b / b，c / c が一致 (選択肢の全角読点は既存の表記) |

→ **見落とし 0 / 5**。

---

## 5. SOURCE_TYPOS

本 unit では**該当なし**。

---

## 6. 採用した差分 (14 題 / 16 論理差分)

| id (page) | field | 差分 | severity | 由来 |
|---|---|---|---|---|
| q005 (p03) | stem (clean) | `「期首棚卸高＋当期商品仕入高－期末棚卸高」` → 源 `“…”` | cosmetic | agent |
| q009 (p05) | choice.ア | `育定派` → 源 `肯定派` | **semantic** | agent |
| q014 (p07) | stem (clean) | `現状の強み` → 源 `現状の俯瞰` (zh / en 追随) | **semantic** | agent |
| q024 (p11) | choice.イ | `搬送かなど` → 源 `搬送など` | **semantic** (agent: cosmetic) | agent |
| q033 (p15) | stem (clean) | `「レベル1」から「レベル5」` → 源 `“レベル1”から“レベル5”` | cosmetic | agent |
| q033 (p15) | stem (clean) | `「条件付運転自動化」…「レベル3」` → 源 `“…”…“…”` | cosmetic | agent |
| q052 (p24) | choice.イ | 末尾 `␠×11「` 除去 | cosmetic | agent |
| q070 (p33) | stem (clean) | `脆弱性を修正する` → 源 `脆弱性を是正する` | **semantic** | agent |
| q072 (p34) | stem | `[四つの原則]` (raw `[四つの原則]〕`) → 源 `〔四つの原則〕` (zh〔四个原则〕) | cosmetic | agent |
| q078 (p37) | stem (raw) | `[プログラム]` → 源 `〔プログラム〕` (.phase1 zh〔程序〕) | cosmetic | **指示** |
| q085 (p40) | stem (clean) | `現在の正解率が89%…90%を超える` → 源 `30%…35%` (zh / en・解説全面追随) | **semantic** (agent: answer_affecting) | agent |
| q088 (p41) | stem (raw = 出荷層) | 閉じ引用符 ASCII `"` ×4 → 源 `”` | cosmetic | agent |
| q091 (p42) | choice.ア | 末尾 `␠×12「` 除去 | cosmetic | agent |
| q091 (p42) | choice.エ | 末尾 `に` 除去。**正解肢** | cosmetic | agent |
| q095 (p44) | choice.ウ | `項目問` → 源 `項目間`。**正解肢** | **semantic** | agent |
| q098 (p45) | stem | `[手順]` → 源 `〔手順〕` | cosmetic | agent |

### zh / en / 解説の追随

| id | zh | en | 解説 | 判定 |
|---|---|---|---|---|
| q085 stem | 89%/90% → 30%/35% | 同 | correct・ア 全文、ウ・points[0]・[1] の数値句 (jp / zh / en、15 置換) | **全層追随** |
| q014 stem | 优势 → 对现状的俯瞰 | current strengths → a bird's-eye view of the current situation | 題幹引用なし → 不変 | **zh / en 追随** |
| q072 stem | [四个原则] → 〔四个原则〕 | [Four principles] 据置 | — | zh のみ |
| q078 stem | sidecar は既に〔程序〕、`.phase1` のみ [程序]→〔程序〕 | [Program] 据置 | — | `.phase1` zh のみ |
| q005 / q033 / q088 stem | 各言語の体裁で不変 (q088 zh は既に “”) | ASCII `"…"` 据置 | 不変 | ⑨-c |
| q070 stem | 修复 (語義上正) | fix (語義上正) | 解説の「修正」は解説者の語 | 不変 |
| 選択肢 6 件 / q098 | 既に正 | 既に正 | 腐敗語の引用なし | 不変 |

### 指示から外した点 (逸脱)

1. **q085 の severity** — agent / 指示メモの answer_affecting (指示メモは「、→，の誤分類か」と推測していたが、実際の差分は数値 89/90 vs 30/35) を **semantic** に再分類 (§4b)。**Rule D 確認点**。
2. **q085 解説の書き直し** — 文字列置換の範囲を超え、ア の誤解説明を源の数値で成り立つ内容に書き換えた (§4b)。著述的変更で Rule A の観点でも reviewer の独立検算を要する。**Rule D 確認点 (最重点)**。
3. **raw 層の扱い** — 括弧見出し (q072 / q078 / q098) は raw も是正 (U9 逸脱 ② precedent)。一方 q005 / q014 / q033 / q070 / q085 の raw は clean と**別の崩れ** (十・一 / 佑典 / ASCII 混在 / 量正 / 399%%) なので N5 据置。
4. **zh / en の引用符** — q005 / q033 の zh「」・en ASCII を据置 (U8 q004 / q034 ⑨-c)。U9 q062 / q085 で zh / en を “” にしたのは擬似言語の**文字列リテラル**に限った precedent と解釈した。
5. **q072 zh〔四个原则〕** — 指示外。U9 q062 zh〔程序〕と同 exam q098 zh〔步骤〕に揃えた。en は U9 逸脱 ④ どおり据置。

---

## 7. 層と局所性

適用時の ✓ 行 (dry-run と同一) を層別に数えた実数:

| 層 | 置換操作数 | 備考 |
|---|---|---|
| raw (`questions.json` / `question_bank.json` / `by_year/2025r07.json`) | **30** | choices 6 置換 × 3 = 18 / stem 見出し 3 (q072・q078・q098) × 3 = 9 / q088 引用符 subN ×4 × 3 層 = 3 操作 |
| sidecar (`translations/2025r07.json`) | **12** | `stem_jp_clean` 7 (q005 / q014 / q033 / q070 / q072 / q085 / q098) + zh・en 5 (q014 zh・en / q072 zh / q085 zh・en) |
| `.phase1/tr_<id>.json` | **13** | q005 1 / q014 3 / q033 1 / q070 1 / q072 2 / q078 1 (zh) / q085 3 / q098 1 |
| 解説 `.phase2/expl_{jp,tr}_2025r07-q085.json` | **15** | correct 3 / ア 3 / ウ 3 / points[0] 3 / points[1] 3 |
| key_guard final note (`.phase2/generate_result_2025r07.json`) | **7** | D-143: **final のみ**、round1 不可触 |
| **fidfix 合計** | **77** | `quiz-fidfix-S126-u10.mjs` の `applied` と一致 |
| skip (想定どおり) | **22** | 片層にしか無い腐敗の n=0 (raw ↔ clean、sidecar zh 既に〔程序〕ほか)。**無言 guard skip 0**、⚠ 行 0 |

### 7a. `.phase1` と sidecar の既存の乖離 (本 unit 起因ではない)

- `tr_2025r07-q072.json` は**適用前から** sidecar と違う: clean の空欄行が `a : 要素を…` / `b : …` (sidecar は `[ a ] ： …`)、zh / en も `[ a ]` `[ b ]` を持たず区切りの空白が違う。
  置換は共通部分 (見出し「[四つの原則]」・zh「[四个原则]」) に当たり、空欄行の差は残る。`.phase1` は非出荷。U7 NIT-3 / U8 14i / U9 §7a と同型 (⑨ 継続)。
- 他の 7 本 (q005 / q014 / q033 / q070 / q078 / q085 / q098) は置換箇所について sidecar と同文 (q078 は zh 見出しのみ sidecar〔程序〕に揃えた)。

### 選択肢に clean 層は無い = **腐敗は学習者に見えていた**

- 2025r07 の sidecar のキー集合 = {`stem`, `choices`, `stem_jp_clean`} (clean は 57 題)。**`choices_jp_clean` は存在しない** (実測)。
- → 選択肢 6 置換はすべて出荷層の腐敗。`q088` は stem_jp_clean も無く raw stem が出荷層 (脚本の STEMN は clean 有りなら throw する guard 付き)。

### 適用ループの由来と U9 からの変更 (Rule D 向け)

`sub()` と FIX ループ本体・NOTE_APPEND は U9 から流用。変更は次の 4 点:

1. **U9 NIT-2**: FIX ループの設問変数を `q` → `qq` に改名 (最上位の引用符ヘルパは本 unit で不要のため削除)。
2. **U9 NIT-3**: `subN` の事後確認を `next.split(to).length - 1 === before + n` (置換前の to 出現数 + n と完全一致) に強化。
3. **U9 ⑨ (EXPL / LITSUB の独立 rj)**: expl ファイルは `expl(id)` のキャッシュで **id ごとに 1 回だけ** 読み、全ループ共有のうえ最後にまとめて `wj`。
4. **STEMN 追加**: raw stem の多重出現 (q088 閉じ引用符 ×4) を 3 層に subN で当てる。対象 question が `stem_jp_clean` を持てば throw (出荷層取り違え防止)。
   EXPL は `{correct, dist, points}` の [旧, 新] 対で書く形に整理 (U9 の `distSub` / `correctSub` / `pointSub` と同じ適用処理)。

### key_guard final note

- 対象 **7 件** = 語義 (`q009` `q014` `q024` `q070` `q085` `q095`) + 正解肢命中 (`q091`、`q095` は重複)。**追記しない 7 件** = `q005` / `q033` / `q052` / `q072` / `q078` / `q088` / `q098` (括弧・引用符・残渣のみ、非正解肢)。
- `q014` / `q070` / `q085` の旧 final note は推測語・推測数値を「是正済み」「内部整合」と述べていたため、後置文で明示的に訂正した。
- 機械照合 (適用前退避 `scratchpad/u10/pre/phase2/generate_result_2025r07.json` と比較): note 変化 **7 件、7/7 が純粋後置** (`final.startsWith(旧 final)`)、`key_guard_round1` の変更 **0 / 100**、note_jp 以外の変化 **0**。
- `explanations/2025r07.json` 内 MARK `fidfix-S126-u10` = **7**。merge は final ≠ round1 のため round1 ブロックを publish (U5〜U9 と同じ D-143 の挙動)。

### tracked データの差分 (`git diff --numstat`)

| ファイル | 差分 | 内訳 |
|---|---|---|
| `data/ip/quiz/questions.json` | +10 / −10 | choices 6 (q009 ア / q024 イ / q052 イ / q091 ア・エ / q095 ウ) + stem_jp 4 (q072 / q078 / q088 / q098) |
| `data/ip/quiz/translations/2025r07.json` | +12 / −12 | clean 7 行 + zh・en 5 行 |
| `data/ip/quiz/explanations/2025r07.json` | +71 / −22 | q085 解説本文 (jp / zh / en) + final `note_jp` 7 + round1 ブロックの publish |
| 他 28 exam の `translations/`・`explanations/` | **0** | 再 merge なし |

`question_bank.json` / `by_year/2025r07.json` / `.phase1` / `.phase2` は gitignore 下 (適用前状態は scratchpad `u10/pre/` に控えて照合)。
`.phase1` の変化は 8 本 (q005 / q014 / q033 / q070 / q072 / q078 / q085 / q098)、`.phase2` は `expl_{jp,tr}_2025r07-q085` + `generate_result_2025r07` の 3 本のみ (210 本と cmp)。
`by_year/` で変化したのは `2025r07.json` のみ。

---

## 8. 事後核験

**(a) 是正後 manifest を再構成して machdiff を再実行**

```
node scripts/quiz-fidelity-prep-any.mjs 2025r07 u10post "<80 問の番号カンマ区切り>" --precrop
  precrop: 80/80 questions cropped; skipped 0 questions (page_mismatch 0 / …)
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/u10post_fidelity_input_2025r07.json <同じ結果 JSON>
✗ AGENT_MISSED 2025r07-q072 stem …「[a]:要素を…」 src「a:要素を…」
machdiff: fields same=399 | AGENT_MISSED=1 | VERDICT_CONFLICT=0 | audits w/o transcript=0 | UNREADABLE skipped=0 | coverage 80/80
```

- 事前の 2 件のうち `q005` は消え (表示の “” が transcript と一致)、`q072` の描画補助 `[ a ]` のみ残る (§3b、既知の偽陽性)。**新規残差 0**。
- precrop は再 prep で **80 枚すべて byte 不変** (適用前退避と `cmp`)。生成した `u10post` manifest は削除済。

**(b) 出荷層の残存語** (`questions.json` の 2025r07 + `translations/2025r07.json` + `explanations/2025r07.json`):
`育定派` / `搬送か` / `項目問` / `現状の強み` / `正解率が89%` / `0.1045` は **key_guard note (final の旧文・後置の是正記述、round1) 内のみ**。
`现状的优势` `current strengths` `正确率为 89%` `rate is 89%` `9.93%` `[四つの原則]` `[四个原则]` `[手順]` `[プログラム]` `[程序]` `対策"` `「レベル1」` `該当する。に` は **0**。
`「期首棚卸高` 1 は解説 correct_jp の地の文引用 (§4a、意図的に不変)。
(`[プログラム]` は corpus の `questions.json` 全体でも **0** になった。)

**(c) 波及ゼロの機械証明**

| 検査 | 結果 |
|---|---|
| `questions.json` 2900 問の変化 id | **9 題** = q009 q024 q052 q072 q078 q088 q091 q095 q098 (raw に置換があった題、§6 と一致) |
| `question_bank.json` の変化 id | 同じ 9 題 |
| `correct_answer` 変更 | **0 / 2900** (bank・questions とも機械照合) / `git diff -U0 data \| grep -c '"correct_answer"'` = **0** |
| `translations/` 追跡下 29 exam | **2025r07 の 12 行のみ** |
| `generate_result_2025r07.json` | note 変化 7 (純粋後置 7/7)、round1 変化 0、他 path 変化 0 |
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
| `node --check scripts/quiz-fidfix-S126-u10.mjs` | ✅ |
| fidfix dry-run (既定) 再実行 | ✅ **applied 0 / skipped 99、files to write 0** (完全冪等。99 = 初回 applied 77 + skip 22) |
| `correct_answer` 差分 | ✅ **0 / 2900** |
| `answer_keys.json` | ✅ byte 不変 (md5 + mtime) |
| 事前 / 事後 machdiff | ✅ AGENT_MISSED 2 → 1、いずれも既知型の偽陽性、実残差 0 (§3・§8a) |
| D-143 | ✅ MARK 付き final note **7**、純粋後置 7/7、round1 変更 0、`explanations` 内 MARK **7** |
| e2e (Playwright) | **未実行** — U7〜U9 §9 と同じ理由 (prod 別名を叩く構成)。本 unit は文字列置換のみ |

適用前の前提検証: `quiz-phase2-merge.mjs 2025r07` を**先に実行して `git diff data` 0** (merge 冪等) を確認。
merge の報告 `SUSPECT 6 (q006, q016, q040, q041, q058, q071)` / `STEM-CORRUPTION 0` は**適用前後で同一**。
再生成: `build-quiz-corpus.mjs` (2900 問 / with_fig 511) → `quiz-phase2-merge.mjs 2025r07`。図の変更は無いので `build-quiz-figures` は不要。

---

## 10. 見送り

| クラス | 該当 | 理由 |
|---|---|---|
| zh / en の引用符・見出し体裁 | `q005` / `q033` zh「」・en ASCII、`q088` en ASCII、en「[Four principles]」「[Procedure]」「[Program]」 | 各言語の体裁 (⑨-c、U8 / U9 precedent) |
| 描画補助 | `q072`「[ a ]」「[ b ]」(源は罫線囲みの空欄) | agent も非計上。machdiff の既知偽陽性 |
| 非出荷の key_guard note | `.phase2/expl_jp_*.json` の note (`q014`「強み」/ `q070`「修正」/ `q085` 89% 導出) | merge が読まない。⑨ 継続 |
| N5 (raw stem の残存腐敗、clean が出荷層) | `q005` raw `"…十…一…"` 末尾「「」/ `q014`「佑典」/ `q033` ASCII 混在 / `q070`「量正」/ `q085`「596」「399%%」「359%」/ `q098` raw「アァ 2 イ 3…」 | 学習者不可視 |
| 解説の地の文の「」 | `q005` correct_jp「「期首棚卸高＋…」で求める」 | 解説者の引用で、題幹の文字列リテラルではない |
| 読点の字種・空白 | clean の「、」正規化 (`q005` / `q085`「選ぶ、ある」) ・選択肢の全角読点 (`q048` ほか) | 許容表記揺れ |
| final note の旧文 | `q014` / `q070` / `q085` の旧 final note は推測語・推測数値を肯定的に述べたまま | D-143 で final は後置のみ。後置文で訂正済 |

---

## 11. backlog (⑨ / 次 unit へ)

### ⑨ 新規: s975 再構成 (`stem_reconstructed_s975`) の推測語・推測数値の横断走査 (**優先**)

- 本 unit で `2025r07` の clean 層に **3 件** (q014 強み / q070 修正 / q085 89%・90%) — raw の OCR 崩れを clean 化の段で「それらしい」語・数値に置き換えていた。
  clean だけ見ると自然な文で、clean 層の自己整合性検査・key_guard (q085 は「内部整合し答えは一意」と判定) では検出できない。q085 は数値条件そのものが別の問題になっていた。
- 規模: フラグは `translations/*.json` の **29 / 29 exam** が持つ (fixer 実測 `grep -l`)。既完了 unit の exam も対象。
- 提起: `stem_reconstructed_s975 = true` を持つ sidecar の全 exam について、raw と clean が**語・数値レベルで食い違う箇所** (raw が崩れ、clean が別の語) を機械抽出 → 源照合。
  ⑤-2 の残り unit で同 exam を掃引する場合は、fixer への申し送りとして「raw が崩れていて clean が流暢な箇所」を重点に。

### ⑨ 新規: 旧 ROOT 直書きの過去 workflow 脚本

- `/Users/bojiangzhang/MyProject/...` の旧パス直書き (repo は `/Volumes/DevSSD/Project/IT-Passport-Learning` へ移動済) が **過去の workflow 脚本 約 10 本に残存** (S126 §10 の申告)。
  本 session では `scripts/quiz-s7x-fidelity.workflow.mjs` のみ修正して U10 を起動した。残りを再利用する前に `path.resolve(import.meta …)` 型へ直すか、廃止を明記する。
- fixer の実測 (`grep -l` で文字列を含むファイル数、コメント・出力パス言及を含む): `scripts/*.workflow.mjs` **18** / `*.run.generated.mjs` **11** / その他 `scripts/*.mjs` **38** (計 67)。
  実行に効く ROOT 直書きかコメント中の言及かは未仕分け → ⑨ で仕分けてから修正範囲を決める。

### ⑨ 更新: `[プログラム]` の括弧字種 (U8 / U9 の続き)

- `questions.json` 全体で `[プログラム]` は **0** に (U8 q060 + U9 q062 / q085 + U10 q078)。raw 側で残るのは `2023r05-q064`「[プログラム〕」(崩れた対応、N5) のみ。
- zh `[程序]` は `2023r05-q060` の 1 題 (sidecar) が残る (U8 で ⑨-c 保留)。

### ⑨ (継続)

- **擬似言語の文字列リテラルの字種規約** (U9 新規): 本 unit は該当題なし。
- **slashed zero 型の横断走査**: 本 unit では新規なし (`q085` の 30% は通常の 0、崩れは「399%%」型)。
- **非出荷の expl_jp key_guard note**: `q014` / `q070` / `q085` の note は推測語・推測数値のまま。将来 note を出荷層に上げるなら要是正。
- **N5 の「字が変わる型」の別ランク台帳化**: `q014`「佑典」/ `q070`「量正」/ `q085`「399%%」は raw の字化け (clean は本 unit で源どおりに是正済)。
- **選択肢末尾の OCR 残渣「 「」型**: 本 unit で `q052 イ` / `q091 ア` (ASCII 空白連続 + 「「」)。choices 全体の機械走査を提起 (`/ {5,}「$/`)。

---

## 12. Rule B (失敗記録)

**本 unit の抄写 run・是正器に失敗 attempt は無し。** run は 1 回で完走 (80/80、UNREADABLE 0)。
是正器は dry-run → `--apply` の初回で assert 違反 0 (⚠ 行 0)。
`failures/` への新規追加は**なし**。

---

## 13. Rule D

Writer = `u10-fixer` (`oh-my-claudecode:executor` opus)。**Reviewer は別 `subagent_type` (opus) で本 evidence の後に別途実施すること**
(本ファイルは writer の自己申告であり、Rule D の審査は未了)。

審査時の重点:

1. **§4b q085 解説の書き直し (最重点)** — 源 30% / 35% の実読 (`precrop/2025r07/2025r07-q085.png`)、再計算 (0.665 → 0.63175、答えイ)、
   jp / zh / en の correct・ア・ウ・points の新文面 (脚本 `EXPL` の [旧, 新])。特に ア の誤解説明の書換えが源の数値で正しいこと。Rule A の観点で独立検算を。
2. **§4b q085 severity** — answer_affecting (agent) → semantic (house rule、波 1 q044 軸) の再分類。
3. **§4c q014** — 「俯瞰」の源確認と zh「对现状的俯瞰」/ en "a bird's-eye view of the current situation" の訳語。
4. **§2 severity 入替** — `q024 イ` cosmetic → semantic。
5. **§3 machdiff 2 件の偽陽性裁定** — q005 (agent の断片 source_text による整列ずれ、事後は消滅) / q072 (描画補助)。
6. **§6 逸脱 3〜5** — raw 層の線引き (見出しは是正・別の崩れは N5)、zh / en 引用符の据置、q072 zh〔四个原则〕。
7. **§7 脚本** — U9 からの 4 変更 (qq 改名 / subN 事後確認の強化 / expl 単一読込 / STEMN)。
8. **§4e 正解肢 2 件** — `q091 エ` 末尾「に」(cosmetic) / `q095 ウ` 項目間 (semantic)。
9. **§4g CLEAN 標本 5 問** (fixer とは重ならない標本での追加抽検を推奨)。

## Rule D (u10-reviewer、`pr-review-toolkit:code-reviewer` opus、fixer executor と別 type) — **PASS-with-notes**
- MAJOR 0 / MINOR 0 / NIT 3。採用 16 差分を源から自前切り出し (q085 / q014 / q070 / q095 / q088 は 4 倍 nearest) で **16/16 支持**。
- q085: 源「30%」「35%」判読余地なし。独立再計算 0.70×0.95=0.665 (33.5%) → 0.70×0.9025=0.63175 (36.825%) → 2 回 = イ = stored key。書換え解説 jp/zh/en の数値すべて正、旧数値 (89/90/0.11/11%/10%/9.93/≒/約) 残存 0。ア 書換え・severity 再分類とも承認。
- 逸脱 5 件すべて承認。correct_answer diff 0、answer_keys md5 `6802bb0b…` 不変、key_guard note 7/7 純粋後置・round1 = 旧 final と同文、MARK 7。
- CLEAN 追加抽検 q020 / q040 / q058 / q063 / q079 / q100 → 漏れ 0/6。ゲート再実行すべて GREEN (crosscheck / assert-clean / chumon / dry-run applied 0 / tsc / vitest 562)。
- NIT 処置: NIT-1 (q085 ア の論拠を「1 回後 33.5% で不足」の一点に絞る案) = 数学的に正しく任意のため**据置** / NIT-2 語中改行空白 (q020「ベンダー企 業」、q052「品 質管理」「適 切」) → ⑨ に追加 / NIT-3 workflow 変更は ROOT 1 行のみ (申告どおり)。

### ⑨ 追加 (Rule D NIT-2)
- 語中の改行由来空白 (「企 業」「品 質」「適 切」型) の全庫機械走査。CLEAN 判定でも出荷層に残っている。
