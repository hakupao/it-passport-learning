# X track X2 — 母数外 97 題の集計と是正 (S130、L3 data lane)

D-150 §3 の X track (⑤-2 母数 `full52_population_S118.json` の excluded 題の再核験) の **X2** = 2018h30a 33 / 2018h30h 30 / 2019h31h 13 / 2021r03 12 / 2023r05 9 = **97 題** (中問 member 0)。準備は `evidence/quiz_X2_prep_S130.md`。**Sonnet 5 単 pass**。手順の雛形 = B13 (`evidence/quiz_B13_2009h21a_S129.md`) / S122 log §1〜§7。

**状態: PHASE 2 (apply・再生成・ゲート・事後核験) 完了** (記録は §12、commit は主 context)。§1〜§10 は PHASE 1 (lock なし) の記録で、§2 / §7 / §8 は D-170 反映後の数。

---

## 1. 入力と実行

- run: `wf_0adc0580-57f` (label `x2`、pass `sn`、Sonnet 5)、97/97
- マニフェスト: `data/ip/quiz/.phase2/x2_fidelity_input_multi.json` (precrop 93/97)
- 結果: `evidence/phase5/stage_06_quiz_fidelity/x2_fidelity_multi_sn.json` — **CLEAN 85 / DISCREPANT 12 / UNREADABLE 0**、差分 27 {semantic 8, cosmetic 19}、正解肢上 3 (agent 申告: 2023r05-q059 エ / q075 ウ / q086 ア)

## 2. 率

| 母数 | agent DISCREPANT (採用あり) | +machdiff | +fixer 走査 | **計上 = 是正** | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|---|
| 97 | 12 (**10 題採用**、2018h30a-q027 / 2018h30h-q054 は不変) | **+1** (`2019h31h-q025` QUOTE_ASCII) | **+4** (`2018h30h-q017` 空白、`2021r03-q038` 読点混在、`2018h30a-q057` `2018h30h-q072` ～) | **15 (15.5%)** | **3** (`2023r05-q059 エ` `q075 ウ` `q086 ア`) | **0** |

- 計上 15 題: 2018h30a-q057 q085 / 2018h30h-q017 q060 q072 / 2019h31h-q025 q058 q078 q098 / 2021r03-q038 q074 q095 / 2023r05-q059 q075 q086。
- **D-170 (主 context) で外した「、」→「，」**: field 全体が「、」の型 (源は「，」) で、その field を他に書き換えない 6 field / 5 題 — `2018h30h-q073` stem (×2)、`2019h31h-q012` stem (×3)、`2021r03-q029 エ` (×1)、`2021r03-q099 ア〜エ` (×13)、`2023r05-q077` stem (×2)、`2023r05-q086` stem (×4、選択肢は採用のまま)。源はいずれも「，」(crop / transcript で確認済み) → コーパス全体の決定的走査 (⑨) に回す。残した「、」→「，」は D-170 の条件を満たす 5 題: q078 / q059 / q075 (同 field の「」→“” を書き換える)、q074 (〔注〕を書き換え + 「，」2 と混在)、q038 (「a, b」と混在)。
- **U9 定義の計上**: agent 採用 10 + machdiff 実残差 1 = **11 題 (11.3%)**。
- **論理差分** (題 × field、jp): **25** = semantic **4** / cosmetic **21** / answer_affecting **0** (D-170 前は 34 / cos 30)
  - semantic 4: `2023r05-q059 ア〜エ` 表名ラベル「会員 |」(表示では偽の列「会員」として描画される。エ = **正解肢**)
  - cosmetic 21: 「」→“” 8 題 stem (q085 q060 q058 q078 q098 q095 q059 q075、うち q078 q059 q075 は同 field の「、」も) / q025 ASCII " / q038 stem (読点混在) / q074 stem (〔注〕+「、」) / q075 ア〜エ (≧・'…'、ウ = **正解肢**) / q086 ア〜エ (「鍵」、ア = **正解肢**) / q017 空白 / q057 q072 ～
  - agent semantic 8 → 採用 semantic 0 + 不変 (q054 2・q058 1・q074 3 は描画補助、q059 stem 表の下線は ⑨) / agent cosmetic の q059 エ (下線 + ラベル) は **semantic に格上げ** (ラベル分のみ)
- **`correct_answer` 変更 0** (scratch 複製木の apply で questions.json の correct_answer 差 0)。key 誤りの疑い 0 (prep §5.2 の 30 題再導出 + §6)。

## 3. machdiff — same 462 / AGENT_MISSED 10 / REPORTED 13 / TRANSCRIPT_PREFIX 0 / QUOTE_ASCII 1 / VERDICT_CONFLICT 0 / UNREADABLE 0

```
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/x2_fidelity_input_multi.json evidence/phase5/stage_06_quiz_fidelity/x2_fidelity_multi_sn.json
```

全残差を源で裁定:
- **実残差 → 採用**: `2019h31h-q025` QUOTE_ASCII — 表示 `"利益÷資本"` (raw = 出荷層)、源 p10 は “利益÷資本”。
- `2023r05-q059 ア〜ウ` (AGENT_MISSED): agent がエでだけ報告した表名ラベル「会員 |」の同型 → 4 肢とも採用 (§4a)。
- `2021r03-q074 stem` (AGENT_MISSED @195): 「変換（ループ端）」の言語化 → 不変裁定 (§4b)。
- `2019h31h-q013 stem`: 表示は〔条件〕①〜④ を `| | 項目 | 金額 |` 表にしている (源は箇条)。見出し行は源に文字として無い表形式化の産物 → **不変** (S123 U3b q034 と同型、値・語は一致)。
- `2019h31h-q026 stem`: PPM の図言語化 1 段落 (描画補助、§4b)。
- `2019h31h-q061 ア〜エ`: 組合せ表の一行化 `a=LAN, b=WAN, …` vs transcript の列。値は 4/4 一致 (crop 実読) → layout FP。
- TRANSCRIPT_PREFIX 0 → **allowlist 追加は不要**。説明できない残差 0。

## 4. 裁定 (fixer が源を原寸で独立に実読)

実読した源: crop 2018h30a-q001 q005 q025 q057 q085 q086 q091、2018h30h-q016 q048 q054 q080、2019h31h-q016、2021r03-q046 q074 q099、2023r05-q037 q059 q075 / 頁 2023r05 p40 (q086)。添付図 `quiz-figures/2023r05-q059.webp` `2018h30a-q085.webp` (下線を含む源の図そのもの)。他の採用題 (読点・引用符) は agent transcript の該当字句 + IPA 本文の字種 (この 5 exam は散文「，」と “”) で確認。

### 4a. 選択肢 (raw = 出荷層)

| id (p) | 源 | dataset | 判定 / 追随 |
|---|---|---|---|
| 2023r05-q059 ア〜エ (p27) | 枠のみ (会員番号 / 会員名 …) | `[表] 会員 \| 会員番号 \| …` | **semantic**。parseChoice で列「会員」として描画 = 偽の属性。ラベル除去。**エ = 正解肢**。zh / en の生 HTML `<u></u>` (corpus 唯一、quizRichText は HTML を描かない → 学習者に見える) を除去、「（主键：…）」の描画補助は保持。描画形は 3 語とも `tables:1` のまま (確認済み) |
| 2023r05-q075 ア〜エ (p35) | `≧`・’合格’ | `>=`・ASCII `"合格"` | cosmetic。同型 2019h31h-q098 の表示 (3 層とも ≧ / ASCII '…') に揃える (corpus ≧ 35 / >= 4、'…' 41 / ’ 0)。zh / en・解説 (A2+B2)>=120 も ≧。**ウ = 正解肢**。D-162 は算術演算子のみで比較記号は原典どおり (→ §9 J-1) |
| 2023r05-q086 ア〜エ (p40) | 表の値 共通 / 公開 / 秘密 | 「共通鍵」「公開鍵」… | cosmetic。図の空欄は「[a] 鍵」「受信者の [b] 鍵」で、表示は「共通鍵 鍵」になる。zh 密钥・en key も除去。**ア = 正解肢**。解説の「a：共通鍵、b：公開鍵」は概念語 (共通鍵暗号) として正しく不変 |
| 2021r03-q029 エ (p13) | 法人税，住民税 | 「、」 | **D-170 で除外** (field 全体「、」、他の書換えなし → ⑨ 全庫走査) |
| 2021r03-q099 ア〜エ (p45) | 「，」 | 「、」 ×13 | **D-170 で除外** (同上) |

### 4b. 題幹

| id (p) | 層 | 源 | dataset | 判定 |
|---|---|---|---|---|
| 2018h30a-q085 (p34) | clean | “担当社員”表 … “顧客”表 | 「」×4 | cosmetic。zh「」⑨-c、en 既に “” |
| 2018h30h-q060 (p28) | clean | “評価” / 文字“×” / 文字“○” | 「」×3 | cosmetic (選択肢の式 '○' は源どおり) |
| 2019h31h-q058 (p23) | clean | “デフォルトゲートウェイ” | 「」 | cosmetic。〔ネットワーク構成〕言語化は不変 (下記) |
| 2019h31h-q078 (p31) | clean | “社員”表 / “部署”表、「，」 | 「」×4、「、」 | cosmetic |
| 2019h31h-q098 (p40) | clean | “合格” / “不合格” | 「」×2 | cosmetic |
| 2021r03-q095 (p43) | clean | “商品”表，“売上”表 | 「」×2 | cosmetic |
| 2023r05-q059 (p27) | clean | “” ×5、「，」 | 「」・「、」×6 | cosmetic |
| 2023r05-q075 (p35) | clean | “合格”・「，」(X，Y / A2，B2 …) | 「」×2・「、」×5 | cosmetic |
| 2019h31h-q025 (p10) | raw | “利益÷資本” | ASCII " | cosmetic (machdiff) |
| 2018h30h-q073 / 2019h31h-q012 / 2023r05-q077 | clean | 「，」 | 「、」 ×2 / ×3 / ×2 | **D-170 で除外** (⑨ 全庫走査) |
| 2021r03-q038 (p18) | clean | a，b / システム監査は， | 「a, b」+「、」×2 | cosmetic。field を源の「，」で一様に |
| 2021r03-q074 (p35) | clean (+zh) | 「，」、(注) | 「、」×9、〔注〕×3 | cosmetic。zh〔注〕→（注）、en 既に (Note) |
| 2023r05-q086 (p40) | clean | 設問文の「，」 | 「、」×4 | **D-170 で除外** (stem は他に書き換えない)。箇条書き (図言語化) の「」は不変 |
| 2018h30h-q017 (p09) | raw | 同一行 | 「行った。 分析」 | cosmetic (fixer 走査、B13 q007 型) |
| 2018h30a-q057 (p24) / 2018h30h-q072 (p33) | clean | ①～③ / ①～④ | ASCII `~` | cosmetic (D-162: 範囲記号は原典どおり、CLEAN 抽検で発見)。zh `~` は ⑨ |

- **不変 (描画補助・既知型)**:
  - `2018h30h-q054` 図 a〜d の形状言語化 + 軸の一文 (agent semantic 2): 形だけで量の名 (要員 / コスト) を付けておらず、問う技能 (要員 = 山型、訂正コスト = 後工程で急増の知識) を代替しない。源 p24 と一致、添付図あり → D-163 / D-168 の漏洩に当たらない (§9 J-3)。
  - `2019h31h-q058` 〔ネットワーク構成〕言語化 (agent semantic): 源の図と一致、役割語なし (prep §5.1)。
  - `2021r03-q074`「変換（ループ端）」(agent semantic 3): 源の注自身が「ループ端」と書き、記号形 (六角形) を文字で示す描画補助。a / b の値を与えない → 不変 (格下げ)。
  - `2019h31h-q026` PPM 言語化の「、」「」(源に対応文なし、B8 q015 ウ型)。
  - `2018h30a-q027` / `2019h31h-q013` 表見出し行「項目 / 金額」(S123 U3b q034 型)。
  - 2023r05-q059 / 2018h30a-q085 の**下線 (主キー / 外部キー)** の文字化: 下線は corpus 全体の表記制約 (B3 q098 / B5 q099 / U8 q095)、添付図に下線が描かれ、属性集合だけでエが導ける → 不変 (§9 J-4)。
- **raw 層**: stem_jp_clean を持つ題は clean のみに当てる (raw は OCR 崩れの別文で非出荷)。.phase1 `tr_` は回数が違えば別文として skip (2021r03-q074 「、」7、2023r05-q086 「、」3)。sidecar が出荷層の正。

### 4c. 名指し / 走査

- prep §5.3 名指し: q059 下線 → ⑨ (上記) + ラベル採用 / q085 下線 → ⑨ + 引用符採用 / q075 → 採用 / q025 → 採用 / 2018h30a-q093 選択肢の読点混在 (イ `a，c` は源どおり、ア / エ ASCII は exam の型) → 不変。
- A1 backlog 未処置 high 156 件 / 30 題: prep §5.4 の FP 判定どおり。prep が未確認とした 5 件を実読 / transcript で確認: 2018h30a-q005「並行して」(crop ✓)、2023r05-q037「a 上の独立性が確保されている必要がある」(crop ✓)、2018h30h-q100「発生しやすい」「通信制限」、2019h31h-q013「また，」、2019h31h-q061「設置されている a 間」(transcript ✓) → いずれも表示が源どおり (0a は raw→clean 差)。
- fixer 走査 (表示 jp を transcript と字種計数で全 97 題比較: 「、」「，」「, 」「」“” ASCII " ' ’ ≧ >= 「。 」〔注〕~): 採用は §2 の +4 (D-170 で 5 題を除外、§2)。ASCII「, 」は 5 exam の型 (⑨)。表示が「，」で transcript が「, 」の題 (q093 q096 q090 q056 q086 選択肢) は transcript 側の正規化で表示が源どおり。2019h31h-q035 ウ / 2018h30h-q091 ア の「,」後の空白欠け (7.comma_nospace) は ⑨。

### 4d. CLEAN 無作為抽検

母集団 = CLEAN 85 − 本 unit で読んだ / 採用した CLEAN 13 = 72。seed 130 LCG (B8 §4f と同式) で 10 題: **2018h30a-q091 2021r03-q046 2019h31h-q016 2018h30h-q080 2018h30a-q025 2018h30h-q016 2018h30h-q048 2018h30a-q057 2018h30a-q086 2018h30a-q001** → crop を原寸で実読、語義の見落とし **0 / 10**。字種の見落とし 1 (q057「①~③」→ 採用)。q025 の強調下線「規制の対象にならないもの」・q080「もう 1 台」の空白は既知の表記制約 / ⑨。

## 5. 中問

X2 の 5 exam に中問なし (prep §2)。registry probe (D-167) の論点なし。

## 6. 採用した差分と D-143 NOTE_APPEND

**NOTE_APPEND (final のみ、6 題、q086 の追記文から「題幹の「、」」を削除済み)**: 2023r05-q059 q075 q086 (正解肢命中、q059 は語義も) / 2019h31h-q078 2021r03-q095 (note「stem_jp_clean は…と完全一致」) / 2018h30a-q057 (note「源と整合」)。再導出: q059 エ (会員番号は店舗ごと → 主キー {会員番号, 店舗コード} + 会員種別コード) / q075 ウ (論理和、真側 '合格') / q086 ア (本体 = 共通鍵、共通鍵は受信者の公開鍵で暗号化) / q078 イ (H002・H003) / q095 ウ (B 24,000・C 21,000) / q057 エ (②③)。追記しない: 字種・空白のみで note が是正対象に言及しない 9 題。MARK = `fidfix-S130-x2`。2021r03-q074 / 2023r05-q059 / q086 の既存 note は空 (追記で先頭になる)。

## 7. 層と局所性 (PHASE 1 dry-run 実数)

```
node scripts/quiz-fidfix-S130-x2.mjs
(dry-run) quiz-fidfix-S130-x2: applied 173, skipped 23   (⚠ 0、別文 skip 1)   ← D-170 反映後 (反映前 194 / 24)
files to write (22): .phase1/tr_{2018h30a-q057,2018h30h-q072,2021r03-q038,2023r05-q059,2023r05-q075,2023r05-q086}.json,
  questions.json, question_bank.json, by_year/{2018h30h,2019h31h,2023r05}.json, translations/{2018h30a,2018h30h,2019h31h,2021r03,2023r05}.json,
  .phase2/expl_{jp,tr}_2023r05-q075.json, .phase2/generate_result_{2018h30a,2019h31h,2021r03,2023r05}.json
```

- 基準: `evidence/phase5/stage_06_quiz_fidelity/x2_fidfix_dry_phase1.txt` (✓ 173 行、D-170 反映後に再取得)。取得時点: HEAD `170e767` + 作業木 (data/ip/quiz 未変更)。
- scratch 複製木 (`scratchpad/x2/tree`) で `--apply` → 再実行 **applied 0 / skipped 196 / files 0** (冪等、D-170 反映後に新しい複製木で再確認)。`questions.json` の変化 5 題 (2018h30h-q017 2019h31h-q025 2023r05-q059 q075 q086、他 10 題は sidecar のみ)、**correct_answer 変化 0**。
- 描画形: 複製木で `parseChoiceWithHint` を実行 — q059 ア〜エ 3 語とも `tables:1`、q086 3 語 `pairs:2`、q075 3 語 `text` (是正前と同形 → quizRichText.test の三語同形検査に影響なし)。

**PHASE 2 (lock 取得時)**: 現 HEAD で再 dry-run → ✓ 行を基準と diff (先行 lane = T1 訳層 / X1 が同 exam の translations を変えていれば差分を個別裁定) → `--apply` → `build-quiz-corpus` → `quiz-phase2-merge` × 5 exam → 事後 machdiff → 残存語・波及ゼロ・全ゲート (crosscheck / assert-clean / chumon --check / machdiff vitest / tsc / vitest / next build)。allowlist 追加なし。

## 8. ゲート (PHASE 1)

| ゲート | 結果 |
|---|---|
| `node --check scripts/quiz-fidfix-S130-x2.mjs` | ✅ |
| fidfix dry-run | ✅ applied 173 / skipped 23 / files 22 / ⚠ 0 (D-170 反映後) |
| scratch apply → 再実行 | ✅ applied 0 (冪等) |
| `correct_answer` 差分 | ✅ 0 |
| 描画形 (三語同形) | ✅ |
| crosscheck / assert-clean / chumon --check / tsc / vitest / build | PHASE 2 |

## 9. 主 context 判断を要する項目 (fixer の推奨つき)

- **J-1 2023r05-q075 の ≧ / '合格'** (正解肢ウを含む 4 肢 × 3 層 + 解説): D-162 は算術演算子 (* / + -) のみ ASCII 化で、比較記号と文字列リテラル引用符は範囲外。**推奨: 採用** (源 ≧ / ’…’、同型 2019h31h-q098 が 3 層とも ≧ / ASCII '…'、corpus 多数派も同じ)。却下案: >= / "…" のまま (源にも同型題にも合わない)。
- **J-2 2023r05-q086 選択肢の「鍵」除去** (正解肢ア): 源の表は「共通 / 公開 / 秘密」、図が「[a] 鍵」。**推奨: 採用** (3 層)。解説の「共通鍵」等は概念語として不変。
- **J-3 図言語化の漏洩判定 (D-163 / D-168)**: 2018h30h-q054 (図 a〜d 形状 + 軸の一文)、2019h31h-q058 (ネットワーク構成)、2021r03-q074 (「（ループ端）」)。**推奨: 3 題とも不変** (形・接続・記号形の事実記述で、問う知識を代替しない。添付図あり)。q054 は図 lane で「図 a〜d は添付図参照」への置換候補として ⑨。
- **J-4 下線 (主キー / 外部キー) の文字化** (2023r05-q059、2018h30a-q085): **推奨: 本 unit では不変** (corpus 全体の表記制約、添付図に下線あり、答えは属性集合から導ける)。ただし q059 は zh / en にだけ「（主键：…）」/ "(primary key: …)" の描画補助があり jp には無い (語間の情報差)。揃えるなら corpus 前例 `2018h30h-q081`「顧客番号（主キー）」/ `2015h27h-q086`「（下線：…）」の形で jp 追加 (3 語の描画形は tables:1 を保てる)。
- **J-5 2023r05-q059 zh / en の生 HTML `<u></u>` 除去**: corpus で唯一 (12 個)。quizRichText は HTML を描画しないので学習者に `<u>` が見える。**推奨: 採用** (本是正器に含めた)。

**主 context 裁定 (D-161)**: J-1 採用 / J-2 採用 / J-3 3 題とも不変 (q054 は ⑨ 図 lane) / J-4 不変 — jp に（主キー）は足さない、zh / en の「（主键：…）」描画補助は源の下線情報を運ぶので残す (語間の非対称は ⑨) / J-5 採用。是正器は裁定どおりの内容 (変更なし)。lock は待機 (順序 T1 → X1 → X2 → X3)。

## 10. Rule B / Rule D

- Rule B: run 1 回完走。dry-run 中の abort 2 回 (q074 の「、」想定数 8→9 の数え違い、.phase1 別文の回数不一致) は是正器の開発中の assert で、データ未変更 → 失敗 attempt ではない (`failures/` 追加なし)。
- Rule D: Writer = `x2-fixer` (executor opus)。Reviewer は別 subagent_type (opus) が apply 後に。重点: q059 ラベル除去 (正解肢エ) と `<u>` 除去後の描画形、q075 ≧ / '…' (正解肢ウ、解説追随)、q086「鍵」除去 (正解肢ア)、読点・引用符の個数 (想定数 assert)、J-3 の不変裁定、CLEAN 標本の別抽検。

---

## 12. PHASE 2 (D-152 lock 付与後、HEAD `a34c77a` = X1 commit 済)

**(a) rebase**
- HEAD で再 dry-run: applied 173 / skipped 23。基準 `x2_fidfix_dry_phase1.txt` (D-170 反映後) と `diff` → **全文一致** (T1 / X1 は X2 の field に触れていない)。
- apply 前に questions / question_bank / answer_keys / translations 5 本 / by_year 5 本 / .phase1 tr_ (5 exam 分) / generate_result 5 本 / 解説 .phase2 (q075) / explanations 5 本を scratchpad (`x2/backup/`) に退避。
- `--apply` → applied 173。

**(b) 再生成**
- `build-quiz-corpus` (2900 問)。
- `quiz-phase2-merge` を 2018h30a / 2018h30h / 2019h31h / 2021r03 / 2023r05 に実行。出た SUSPECT / STEM-CORRUPTION (2018h30a q007 / 2018h30h q009 q047 q051 q058 q067 / 2019h31h q100 / 2021r03 SUSPECT q038 q039 q049・STEM q036 / 2023r05 SUSPECT q056・STEM q004 q021 q023 q056) は既存。うち 2021r03-q038 は本 unit で題幹の読点を是正した題だが、apply 前に退避した generate_result で既に suspect=true (matches_key=true) → X2 由来ではない (初回記録では SUSPECT 行を取り漏らしていたので訂正)。

**(c) allowlist**: TRANSCRIPT_PREFIX 0 → 追加なし (machdiff 脚本は未変更)。

**(d) 事後 machdiff** (是正後 manifest `x2post` を precrop なしで再構成し、確認後に削除)
```
machdiff: fields same=474 | AGENT_MISSED=7 | VERDICT_CONFLICT=0 | REPORTED=4 (whole-field 1) | TRANSCRIPT_PREFIX=0 (adjudicated 0) | QUOTE_ASCII=0   (exit 0)
```
- same 462 → 474、same∩reported 7 → 16 (採用した報告差分が一致側へ)。
- 消えたもの: `2019h31h-q025` QUOTE_ASCII、`2023r05-q059 ア〜ウ` (表名ラベル)。
- 残る AGENT_MISSED 7 は §3 の裁定済み既知型のみ: 2019h31h-q013 (表見出し)、q026 (PPM 言語化)、q061 ア〜エ (組合せ表の一行化)、2021r03-q074 (「（ループ端）」、J-3 不変)。REPORTED 4 は不変裁定の報告 (q027 見出し行 / q054 言語化 / q058 言語化)。
- → **新規実残差 0**。

**(e) 残存語** (是正 field の表示 jp + zh / en 選択肢)
- q075 の `>=` と ASCII `"`: 0 (解説に残る `>=` 1 個は本 unit の D-143 note 内の是正内容の記述)。q059 の `<u>` `</u>` と「会員 |」: 0。q086 選択肢の「鍵 / 密钥 / key」: 0。q085 q060 q078 q098 q095 q059 q075 の jp 表示「」: 0。
- 残るのは ⑨ と裁定どおりのもの: D-170 で外した「、」6 field / 5 題、zh「」(⑨-c)、q054 / q058 / q026 / q074 の言語化、q059 の語間の主キー表示の非対称 (J-4)。

**(f) 波及ゼロ**

| 検査 | 結果 |
|---|---|
| `questions.json` の変化 (退避比) | **5 題** = 2018h30h-q017 / 2019h31h-q025 / 2023r05-q059 q075 q086 |
| `question_bank.json` | 同じ 5 題。他は変化 0 |
| `correct_answer` | `git diff -U0 data \| grep -c '"correct_answer"'` = **0** |
| translations | 5 exam で計 13 題 (2018h30a q057 q085 / 2018h30h q060 q072 / 2019h31h q058 q078 q098 / 2021r03 q038 q074 q095 / 2023r05 q059 q075 q086)。raw のみの 2 題 (2018h30h-q017・2019h31h-q025、clean なし) を足すと 15 = 計上と一致 (q059 q075 q086 は raw 選択肢と sidecar の両方) |
| generate_result (退避比) | 変化 6 = note の純粋後置 6/6 (MARK `fidfix-S130-x2`)、他 0 |
| explanations | 6 題が key_guard (note 後置 + round1 publish、D-143)。本文の変化は 2023r05-q075 correct の `(A2+B2)>=120` → `≧` (jp / zh / en) のみ |
| tracked の変化 | `questions.json`、translations 5 本、explanations 4 本 (2018h30h は note 対象なし)。新規ファイルは是正器・本書・基準 |
| `answer_keys.json` | md5 `6802bb0bc13004da78ad3c4e5117d997` (前後で同一) |

**(g) ゲート**

| ゲート | 結果 |
|---|---|
| `node --check` 是正器 | ✅ |
| `quiz-keys-crosscheck` | ✅ questions=2900 exams=29、all invariants hold (A1–A7, B1–B7) |
| `quiz-pagefix-derive-groups --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `quiz-chumon-groups-build --check` | ✅ 生成結果と一致 (mqTech2 の「registry 無し」は既存の情報行) |
| machdiff vitest | ✅ 42/42 |
| `tsc --noEmit` (apps/web) | ✅ exit 0 |
| eslint (apps/web) | ✅ 0 errors / 1 warning (`RetroGlossary.tsx:31` 未使用変数、既存) |
| vitest (apps/web) | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped |
| `next build` | ✅ Compiled successfully |
| 是正器の再実行 | ✅ applied 0 / skipped 196 (Rule D 是正後は 215、§12(i)) |
| 事後 machdiff | ✅ 新規実残差 0 |
| e2e | 未実行 (B / X 系と同じく文字列置換のみ) |

**(i) Rule D (PASS-with-notes) の是正** (lock 保持のまま、commit 前)
- **MINOR — 2023r05-q059 ア〜エ zh / en**: 末尾の「（主键：…）」/ "(primary key: …)" が `parseChoiceWithHint` で余分な見出しセル = 偽の列になっていた (jp の「会員」ラベルと同じ欠陥型)。表示形を試した: 注記を別行 (表の後) に出すと `text`、表の前に出すと `table` (caption) になり、jp の `tables:1` と三語同形が崩れて quizRichText.test を落とす → 採らない。**セル内の「（主键）」/ " (PK)」に移す** (corpus 前例 2018h30h-q081 の「顧客番号（主キー）」/ "Customer No. (PK)" と同形、下線情報は保持、J-4 の「zh / en の主キー描画補助は残す」とも整合)。列数は 3 語とも jp と一致 (ア 2 / イ 3 / ウ 3 / エ 4)、`tables:1` (確認済み)。jp には足さない (J-4)。
- **NIT-1 — 2021r03-q074 jp**: ループ端の「k：1, 1, 3」→「k：1，1，3」(同 field を既に書き換えており混在になっていたため、D-170)。zh は不変。
- D-143: q059 の既存追記句 (「主キーの括弧書きは保持」) は書き換えず、訂正句を後置 (marker `fidfix-S130-x2-corr`、B13 NOTE_CORR と同型)。
- 是正器に 3 項 (q074 jp 1 / q059 zh・en 各 4 の置換 + NOTE_CORR) を追加 → `--apply` (applied 17 + 1) → `build-quiz-corpus` → `quiz-phase2-merge` 2021r03 / 2023r05。
- 冪等: 再実行 **applied 0 / skipped 215**。apply 前の退避から複製木で全体を再適用 (applied 191 = 173 + 18) → questions / question_bank / translations 2021r03・2023r05 / .phase1 tr_ q059 / generate_result 4 本が live と**バイト一致**。
- ゲート再実行: crosscheck ✅ / assert-clean ✅ / chumon --check ✅ / tsc ✅ / eslint 0 errors (既存 warning 1) / vitest 562 passed / next build ✅ / 事後 machdiff same 474・MISSED 7・REPORTED 4・QUOTE_ASCII 0 (変化なし、新規実残差 0) / correct_answer 0 / answer_keys md5 不変。
- 論理差分 (jp) は不変 (q074 は同じ field)。訳層の変更は q059 zh / en 4 肢 (既に計上済みの題)。

**(h) 最終の計上**: **計上 15 / 97 (15.5%)**、U9 11 (11.3%)。論理差分 25 = semantic 4 + cosmetic 21、answer_affecting 0。正解肢上 3 (2023r05-q059 エ / q075 ウ / q086 ア)。`correct_answer` 変更 0。Rule B: 失敗 attempt なし。Rule D: PASS-with-notes (MINOR 1 / NIT 1 是正済み、§12(i))。lock は保持中。
