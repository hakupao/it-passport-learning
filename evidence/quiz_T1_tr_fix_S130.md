# T1: 訳層照合 (段 3、方式 D) の是正 — B track 13 exam (S130)

D-150 §4 段 3。B track (S128〜S129) で源照合した 13 exam の jp 表示層 (= 正) と zh / en を意味照合した T1 run の結果を是正した。手順は A2b (`evidence/quiz_A2b_S127.md`) と同じ。
入力準備は `evidence/quiz_T1_tr_prep_S130.md`。

**集計の扱い: ⑤-2 の累計には入れない (A2b と同じく別枠)。**

---

## 1. 入力と実行

- 結果 JSON: `evidence/phase5/stage_06_quiz_fidelity/t1_tr_fidelity_sn.json` (Sonnet、batch 5、画像なし、1298 題)
- マニフェスト: `data/ip/quiz/.phase2/t1_tr_input.json`。**適用前の sidecar と zh / en 12,980 field (1298 題 × 2 言語 × stem + ア〜エ) がすべて一致** (fixer が機械照合。CLEAN 判定が古い訳文に対するものではないことの確認)
- 是正器: `scripts/quiz-fidfix-S130-t1.mjs` (既定は dry-run、`--apply` で書き込む。`quiz-fidfix-S127-a2b.mjs` と同じ構造: subN で出現数を厳密に要求 / sidecar と `.phase1/tr_` の両方に同じ置換 / 解説は `.phase2/expl_tr_` を直して `quiz-phase2-merge` で再生成 / D-143 note は final に純粋後置)

## 2. 命中率

| | 題 | 差分 (field × 言語) |
|---|---:|---:|
| 対象 | 1298 | — |
| CLEAN | 1282 | — |
| DISCREPANT | **16 (1.2%)** | 32 (semantic 15 / cosmetic 17、正解肢上 3) |
| 採用 | **15 題** | **31** |
| 不採用 | 1 題 | 1 (`2010h22h-q063 ア` en、§5) |
| 同型の見落とし (fixer が追加) | +2 題 (+1 field) | `2009h21a-q096` 表 zh / en、`2013h25h-q090` zh、`2009h21a-q098` zh (題は DISCREPANT 内、zh 側を追加) |

- 精度: 31 / 32 = 96.9%。不採用の 1 件も訳の意味は正しく、表記規約 (⑨-c) の判断で据え置いたもの。意味の FP は 0
- 中問B (`2009h21a` q093〜q095) は agent が題ごとに cosmetic / semantic を付け分けたが、根は 1 つ (前文の表のラベル) なので 1 欠陥として扱った

## 3. 中問B (2009h21a-mqB、⑨ 高) — 表の商品名ラベル

### 3a. 所在の調査 (override 機構は不要と判断)

- 前文 (表を含む) は **translations sidecar の `stem.zh` / `stem.en` に直書き**されている (A4 の前置)。
- `scripts/quiz-chumon-groups-build.mjs` が evidence (`chumon_preamble_S116.json` 等) から取るのは **probe = 空白除去後の先頭 40 字だけ**。生成物 `chumon_groups.json` の 2009h21a-mqB の probe は「N社の営業部では，今年度の…」/「N公司的营业部为制定…」/ "ThesalesdepartmentofCompanyNdecidedtoana" で、表には掛からない。
- `chumon_augmented_S116.json` (`.phase2`) には `商品甲` が残っているが、`scripts/` のどこからも参照されていない (grep 0 件)。
- `.phase1/tr_2009h21a-q093〜q096` は前文を持たない (A2b §8 と同じ状態)。
- 結論: 表のラベルは sidecar のデータそのもの。sidecar を直接直せばよく、**build 側の override は不要**。evidence (`chumon_preamble_S114.json` ほか) は書き換えていない (D-167)。`chumon --check` は是正後も「生成結果と一致」、crosscheck A7 は hold (§7)。

### 3b. ラベル方式の決定: jp の kana ラベルに揃える (zh「商品あ〜こ」/ en「Product あ〜こ」)

| 要素 | 是正前 jp | 是正前 zh | 是正前 en |
|---|---|---|---|
| 前文の表 (4 題共有) | 商品あ〜こ | **商品甲〜癸** | **Product A〜J** |
| q094 選択肢 ア〜エ | “商品え” “商品か” “商品く” “商品こ” | 商品え / か / く / こ | Product え / か / く / こ |
| q094 図 (バブルチャート) | jp 源画像 `data/ip/exams/figures/2009h21a-q094.png` のラベル「商品く」「商品こ」「商品え」「商品か」(fixer が画像を見て確認) | (図は jp 画像のまま) | (同左) |
| 解説 | kana | q093 / q096 は甲〜癸、q094 は kana | q093 / q096 は A〜J、q094 は kana |

- 図は翻訳されない jp 画像で、ラベルは kana。選択肢 (正解肢ウ = 商品く を含む) も zh / en とも既に kana。表だけを kana に揃えると、**表 + 選択肢 + 図 + 解説の 4 つが 1 つの体系になる**。選択肢と図を甲〜癸 / A〜J に合わせる案は、図 (画像) を直せないので採らなかった。
- 表の行ラベルは `| 商品甲 |` / `| Product A |` の形 (前後のセル区切りを含む) でだけ置換した。列名の `I` / `J`、mqC の "Company I" 等には触れない。
- **q096 は agent の見落とし** (同じ表を持つが CLEAN 判定だった)。同じ置換を当てた。
- 解説の追随: q093 (zh「商品甲」4 箇所、en "Product A" 4 箇所) と q096 (「丁 → 丙 → 甲 → 癸」「商品丁、商品丙、商品甲」/ "D → C → A → J"、"Product D, Product C, and Product A" ほか) を kana に直した。q096 の解説は**答えの根拠そのもの** (累計 70% 以内 = え・う・あ、そのうち回転率 10 回以下 = え) なので、表と食い違うと解説が読めなくなる。q094 の解説は既に kana で触っていない。
- 是正後の残存: sidecar 2009h21a の zh / en に「商品[甲〜癸]」「Product [A-J]」は 0。explanations 2009h21a には D-143 note の文中 (「Product A〜J」を是正前の記述として引用) の 1 箇所だけ。
- q094 の「正解肢上」2 件 (ウ zh / en) は、選択肢の文字列は変えずに表側を直すことで解消した。

### 3c. 未是正 (⑨)

- jp の q094 選択肢は B13 (S129) で源の引用符 “商品え” 等が補われたが、zh / en の選択肢には引用符が無い。意味は変わらないので未是正 (⑨ 観察)。

## 4. 採用した差分 (中問B 以外)

| id | 層 | before → after | 根拠 | 種別 |
|---|---|---|---|---|
| `2009h21a-q009 ウ` | zh (+ 解説 ウ・points[1]) | 「职务制组织」→「职能制组织」 | jp「職能別組織」。职务 = 職務・役職で語義がずれる。corpus の zh 選択肢で 職能別 / 機能別組織 は「职能制组织」3 題 (`2012h24h-q018` / `2016h28a-q025` / `2025r07-q015`)、「职能型组织」1 題 (`2012h24a-q021`)、「职务制组织」は本題だけ。解説 corpus も「职能制组织」が多数 (2009h21h / 2012h24h / 2013h25h / 2015h27h / 2016h28a / 2025r07 / 2026r08)。D-142 系の訳語固定・glossary に該当語なし (確認済)。誤答肢 | semantic |
| `2009h21a-q098` | zh / en stem | zh「客户负责人表（取引先担当者表）」→「客户负责人表」/ en "the client contact (取引先担当者) table" → "the customer contact person table" | jp 原語の混入。en は図 1 (前文内の表) の表名 "Customer contact person table" に合わせた。**zh も同じ混入があり fixer が追加** (agent は en だけ指摘)。選択肢は変えていない (§8 ⑨) | cosmetic |
| `2009h21a-q099` | zh stem | 「交易方代码、名称、部门名」→「交易方代码、姓名、部门名」 | jp「名前」= 担当者の名前。図 1 の列名は「姓名」で、「名称」は商品名称・客户名称と紛れる | cosmetic |
| `2009h21h-q091` | zh stem | 2 文を補う:「M 先生决定把确定故障原因的步骤画成流程图来思考。此时，下图中 X 处应填入的适当字句是哪一个？」 | jp「M さんは…流れ図に書いて考えてみることにした。このとき，次の図の X に入る適切な字句はどれか。」が zh だけ欠落し、**設問文そのものが無かった**。`.phase1/tr_` には 2 文があり、A4 の前文前置の際に落ちたもの。文言は `.phase1` の訳をそのまま戻した (`.phase1` は既に持っているので不触) | semantic |
| `2009h21h-q098` | zh stem | 「网购业务」→「邮购业务」×6 | jp「通販業務」。前文 (probe 含む) は「经营邮购业务的 F 公司」「邮购业务」で、この段落だけ网购 (オンライン購入) になり別業務に見えた。网购 は q098 にだけあり、前文に掛からない | semantic |
| `2010h22a-q100 ア〜エ` | en | "operation 2 / 4 / 5 / 6" → "operation ② / ④ / ⑤ / ⑥" | jp「作業②」等。en の表は "Task No." ①〜⑧、解説 en も "Operation ④" 等の丸数字、同じ中問の q097 / q098 の en 選択肢も丸数字。本題の選択肢だけ算用数字だった。**イは正解肢** (番号表記のみ) | cosmetic |
| `2010h22h-q016` | zh stem | 「展示企业经营理念与价值观的事物」→「展示企业对经营的信念与价值观的事物」 | jp「経営に対する信念や価値観」。zh が「经营理念」と訳し、**正解肢エ「经营理念」の語が題幹に出て答えが漏れていた**。解説の「经营理念」は答えた後に読む説明なので据え置いた | semantic |
| `2012h24a-q096` | en stem | 形式のラベル "(1) Digit-count information / (2) Separator information / (3) Run-length information" (表見出し・定義行・例文中の "(1) is (5-2)") → ①②③ | jp は ①②③。en では手順番号 (1)〜(3) (〔画像データの表現方法〕) と衝突していた。手順番号 "(1)  Represent…" / "(3)  Connect…" は触っていない。解説 en は既に ① を使っている | cosmetic |
| `2013h25a-q099` | en stem (+ 解説 correct / ア / イ / エ) | 施策 "(1)〜(3)" と "measures (1) to (3)" → ①〜③ | jp は施策 ①〜③。en では〔要望事項〕(1)〜(4) と衝突し、**選択肢 ア〜エ = (1)〜(4) は要望事項を指す**ので、どちらの番号か紛れる。解説の "Requirement (1)" 等 (要望事項) は触っていない | semantic |
| `2013h25h-q092` | zh stem (+ 解説 correct) | 「财务部」→「会计部」 | jp「経理部」。前文 (probe「F公司的会计部…」を含む) は「会计部」。前文に合わせる (逆方向にすると probe が変わる) | cosmetic |
| `2013h25h-q090` | zh stem (+ 解説 correct) | 同上 | **agent の見落とし** (CLEAN 判定)。同じ中問・同型 | cosmetic |
| `2014h26a-q100` | zh / en stem | zh「…作业缩短时间，最合适的是哪一个？…每天的申请处理件数为 10 次」→「…作业缩短时间是多少小时？…A 公司每天的平均申请次数为 10 次」/ en "which is the most appropriate value for … ? … the number of applications processed per day is 10" → "how many hours is … ? … its average number of applications per day is 10" | jp「何時間になるか」「1日の平均申請回数は10回」。選択肢は数値だけなので、単位 (時間) が無いと答えの単位が分からない。「平均」も補った | cosmetic |
| `2014h26h-q048 ア` | zh / en (+ 解説 ア zh / en の引用) | 「实际内容」→「实施内容」/ "the actual content of the service" → "the services actually performed" | jp は B2 で OCR「実効内容」→ 源どおり「実施内容」に是正済。訳は旧 jp 寄りだった。解説 ア は選択肢文を引用しているので追随 | cosmetic |

- jp 3 層 (questions / question_bank / by_year) は変えていない: `questions.json` md5 `559b5229…`、`question_bank.json` md5 `1ed392d8…` は適用前後で同じ。
- `.phase1/tr_` には sidecar と同じ置換を当てた (12 ファイル、再 merge 禁止の方針)。文字列が `.phase1` に無いもの (前文内の表、q091 の挿入点) は skip。

### D-143 (final note 追記、round1 不可触)

追記した 7 題: `2009h21a-q094` (正解肢ウの参照先 = 表) / `2009h21a-q009` (誤答肢の語義是正) / `2010h22h-q016` (題幹の答え漏れ) / `2009h21h-q091` (設問文の欠落) / `2009h21h-q098` (題幹の語義) / `2013h25a-q099` (選択肢が指す番号の衝突) / `2010h22a-q100` (正解肢イ)。各 note に correct_answer 不変の導出を書いた。marker `fidfix-S130-t1`、explanations 内の MARK は 7。
追記しなかった題: cosmetic で正解肢外のもの (q093 / q095 / q096 / `2009h21a-q098` / `q099` / `2012h24a-q096` / `2013h25h-q090`・`q092` / `2014h26a-q100` / `2014h26h-q048`)。

## 5. 不採用

| id | 層 | 理由 |
|---|---|---|
| `2010h22h-q063 ア` | en "Enclose … in double quotation marks (\")" | 括弧内の `"` は引用符という**文字そのもの**を指す。A2b の D-151 でも zh の同じ field を「" という文字そのもの」として除外した (A2b §6b)。en の訳は「二重引用符で囲む」で意味は正確。en の ASCII `"` の扱いは ⑨-c (規約未定) に残す |

## 6. CLEAN 抽検と決定的プローブ (Rule A)

### 6a. 無作為標本 (fixer が jp と zh / en を自分で読み比べた)

- 母集団: CLEAN 1282 題 (id 昇順)。xorshift32 (`x^=x<<13; x^=x>>>17; x^=x<<5`) で Fisher–Yates、**seed 20261020**、先頭 12 題
- 標本: `2013h25a-q040` `2012h24a-q037` `2012h24h-q075` `2012h24a-q084` `2014h26a-q030` `2015h27h-q059` `2015h27h-q069` `2013h25h-q040` `2009h21h-q082` `2013h25a-q055` `2013h25h-q049` `2015h27h-q016`
- **semantic の見落とし 0 / 12、cosmetic 1 / 12**: `2013h25h-q040` zh「最恰当」(jp「適切な」に無い最上級) と en "(Common Frame / SLCP)" (jp に無い SLCP)。手掛かりにはならない。最上級の付加は A2b でも ⑨ 観察 (`2018h30h-q038`) で、corpus 横断の型なので本 unit では直していない (⑨)
- 所見: `2012h24a-q084` zh「路由器（Router）」、`2015h27h-q016` zh「RFP（提案邀请书）」はカタカナ語・略語の原語注で、手掛かりにはならない

### 6b. 決定的プローブ (1298 題全件、0 token)

1. **丸数字プローブ** (jp field に ①〜⑩ があり、zh / en の同じ field で丸数字が減っているもの): 53 hit、すべて en。
   - DISCREPANT 側: `2010h22a-q100` / `2012h24a-q096` / `2013h25a-q099` (3 題とも agent 検出済、§4 で是正)
   - CLEAN 側 (17 題): en は丸数字を (n) と書くのが corpus の慣行で、同じ問の中で (n) が他の番号と衝突しなければ実害は無い。一方、衝突の疑いがあるものもある (下の ⑨ リスト)。**本 unit では是正せず、lead へ渡す**
2. **ラベル・混入プローブ** (zh の甲乙丙丁ラベル / zh の jp に無い ASCII 大文字語 / en に残る CJK): 46 hit
   - DISCREPANT 側: 2009h21a q093〜q095 甲〜癸、q094 en え / か / く / こ (§3 で解消: 選択肢の kana は正しい)、q098 en 取引先担当者 (§4)
   - CLEAN 側で実害あり: **`2009h21a-q096` 表の甲〜癸** (§3 で是正)
   - CLEAN 側の FP: `2009h21a-q026` 「自己公司」(己公司に誤一致)、`2011h23a-q073` en のカタカナ (ワイルドカード一致を問う題で、選択肢は文字列そのもの = 正しい)、zh の略語注 (JIS / ISO / BBS / PPM / SCM / JIT / OSS / DBMS / CA / PL / NIC / DM / RFI / RFP / HDD / XSS / CSF / SLA / ISP / UPS。jp のカタカナ・漢字語の略語で手掛かりにならない)

## 7. ゲート

| ゲート | 結果 |
|---|---|
| 適用前: `quiz-phase2-merge.mjs` を対象 9 exam で先に実行 | ✅ `git status data/` clean・`git diff data` 0 行 (drift 0) |
| fidfix dry-run → `--apply` | ✅ 1 回目 (§4): **applied 162 / skipped 81**、files 33。2 回目 (§12・§13 拡張): **applied 84 / skipped 256**、files 22 |
| 再生成: `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs` | ✅ 1 回目 9 exam、2 回目 4 exam (2009h21a / 2010h22h / 2011h23a / 2013h25a)。2 回目の前に新規対象 2011h23a の merge を先に回して drift 0 を確認 |
| fidfix dry-run 再実行 | ✅ 最終 **applied 0 / skipped 340** |
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ `chumon_groups.json は生成結果と一致` (`?` 情報行 2 は既存) |
| `pnpm --config.verify-deps-before-run=false -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm … -C apps/web lint` (eslint) | ✅ exit 0 (0 errors、warning 1 = 既存の `RetroGlossary.tsx` `tTerm` 未使用) |
| `pnpm … -C apps/web test` (vitest) | ✅ **38 passed / 1 skipped (39 files)、562 passed / 2 skipped (564 tests)** |
| `pnpm … -C apps/web build` | ✅ exit 0 (`Compiled successfully`) |
| `node --check scripts/quiz-fidfix-S130-t1.mjs` | ✅ |
| `correct_answer` 差分 | ✅ **0** (`git diff -U0 data \| grep -c '"correct_answer"'` = 0) |
| jp 層 | ✅ `questions.json` / `question_bank.json` md5 適用前後で同一、by_year は `git status` に変更なし |
| `answer_keys.json` | ✅ md5 `6802bb0bc13004da78ad3c4e5117d997` (A2b 記録値と同一 = 不変) |
| D-143 MARK | ✅ final note 13 件 (§4 の 7 + §12 の 3 + §13 の 3、純粋後置)、round1 変更 0、explanations 内 MARK 13 |
| note 追補 (writer 自己点検) | `2009h21h-q098` の note に導出 (1/36＋1/45＝1/20 → 20 時間 → 線① = ア、`expl_jp` の key_guard で確認) を書き足すため、付けたばかりの追記句を外して NOTE_APPEND を直し再適用: dry-run **applied 1** → `--apply` → `quiz-phase2-merge 2009h21h` → 再 dry-run **applied 0 / skipped 243**、crosscheck hold、chumon `--check` 一致、correct_answer 0、answer_keys md5 不変 (変わったのは explanations 2009h21h の note 文字列だけなので tsc / vitest / build は再実行していない) |
| 残存語 | ✅ sidecar 2009h21a zh/en の「商品[甲〜癸]」「Product [A-J]」0、「职务制组织」0、2009h21h zh「网购」0、zh/en の「取引先担当者」0 (jp 層のみ) |
| 拡張後の全ゲート再実行 (§12・§13 適用後) | ✅ crosscheck A1–A7 / B1–B7 hold、assert-clean GREEN、chumon `--check` 一致 (probe 不変)、tsc 0、eslint 0 errors (既存 warning 1)、vitest 562 passed / 2 skipped、next build OK、correct_answer 差分 0、questions / question_bank / answer_keys の md5 不変 |
| e2e (Playwright) | **未実行** (A2b と同じ理由。文字列置換だけ) |

### git status (本 unit の変更)

```
 M data/ip/quiz/explanations/{2009h21a,2009h21h,2010h22a,2010h22h,2011h23a,2013h25a,2013h25h,2014h26h}.json   (8)
 M data/ip/quiz/translations/{2009h21a,2009h21h,2010h22a,2010h22h,2011h23a,2012h24a,2013h25a,2013h25h,2014h26a,2014h26h}.json   (10)
?? scripts/quiz-fidfix-S130-t1.mjs
?? evidence/quiz_T1_tr_fix_S130.md
```

計 18 data files (translations 10 + explanations 8)。`.phase1` / `.phase2` は gitignored。
作業ツリーにあるそれ以外の変更 (`docs/discussion/2026-10-20-session-130.md`、`evidence/phase5/stage_06_quiz_fidelity/{t1_tr_fidelity_sn,x1_fidelity_multi_sn,x2_fidelity_multi_sn}.json`、`evidence/quiz_X1_*` / `quiz_X2_*` / `quiz_X3_*`) は他 lane / lead のもので、本 unit は触っていない。

## 8. ⑨ 新規 / 更新 (未是正)

1. ~~2009h21a-mqC の 取引先 の訳語が 3 系統に割れている~~ → **lead 判断 (D-161) で組内統一を実施、§12**。
2. **en の丸数字 → (n)** → **lead 判断 (D-169) で衝突 4 件 (7 題) を是正、§13**。並記のみで衝突しないもの (cosmetic、⑨ 低で据置): `2009h21a-q069` / `2011h23tokubetsu-q059` / `2013h25a-q001` / `2014h26a-q060` / `2014h26h-q085〜q088` / `2009h21h-q037` / `2010h22h-q082` / `2011h23a-q007` / `2013h25a-q067` / `2015h27h-q054` / `2012h24a-q080` (一部だけ丸数字)。
3. **en「Job-function organization」** (`2009h21a-q009 ウ`、`2012h24a-q021 イ`) と「Functional organization」(3 題) の揺れ。zh「职能型组织」(`2012h24a-q021`) も 1 題だけ。本 unit は zh `2009h21a-q009` だけを直した。
4. 2009h21a q094 の zh / en 選択肢に、jp (B13 で補った) の引用符 “商品え” 等が無い (§3c)。
5. CLEAN 抽検の cosmetic 1 件: `2013h25h-q040` zh「最恰当」/ en "(Common Frame / SLCP)"。
6. `.phase2/chumon_augmented_S116.json` に旧ラベル (商品甲〜癸) が残っている。どの script も読んでいないので実害は無い (履歴物)。

## 9. 逸脱 (Rule D 確認点)

1. **同型の見落としを 3 箇所追加した**: `2009h21a-q096` 表 (zh / en)、`2013h25h-q090` zh、`2009h21a-q098` zh の jp 混入。いずれも flag された題と同じ中問・同じ型。
2. **中問B の是正は、選択肢ではなく表 (前文) の側を直した** (q094 の正解肢上 2 件を含む)。理由は §3b (図が jp 画像の kana)。
3. **解説の追随**: 表と食い違うと解説が読めない q093 / q096 のラベル、選択肢の引用 (`2014h26h-q048` ア)、番号 (`2013h25a-q099`)、用語 (`2009h21a-q009`、`2013h25h`) を直した。答えた後に読む説明で是正と矛盾しないもの (`2010h22h-q016` の 经营理念) は据え置いた。
4. ~~mqC の訳語統一はしていない~~ → §12 で実施 (lead D-161)。
5. **§12 / §13 は lead の追加指示 (D-161 / D-169) による拡張**。T1 の flag 外の題 (q097 / q100、2010h22h-q095、2013h25a-q087・q093〜q096、2011h23a-q092) を含む。

## 10. Rule B (失敗記録)

- 是正器の dry-run 1 回目が、`2009h21h-q091` の挿入 (to が from を含む形) で subN の事後確認に abort した。書き込みは起きておらずデータの attempt ではないので、`failures/` には起票していない。from に挿入点の前文を含めて to ⊅ from にし、文言を `.phase1` の訳に揃えて 2 回目の dry-run で通した。
- 照合 run に失敗 attempt は無い (1298/1298、UNREADABLE 0)。

## 11. Rule D 待ち

Writer = `t1-fixer` (`oh-my-claudecode:executor`)。**Reviewer は別の `subagent_type` で別途行う** (本ファイルは writer の自己申告で、審査はまだ)。

審査の重点:
1. §3 中問B: override 不要の判断 (probe の範囲、sidecar 直書き) と kana 方式。q096 解説の書き換え (答えの根拠)
2. §4 の各裁定。特に `2009h21h-q091` (設問文の復元)、`2010h22h-q016` (答え漏れ)、`2013h25a-q099` (番号衝突)、`2014h26a-q100` (単位)
3. §5 の不採用 (`2010h22h-q063`) と、§8-1 で mqC の訳語統一を見送ったこと
4. §6 の CLEAN 抽検。fixer の標本と重ならない題で追加抽検することを推奨する。あわせて §6b の丸数字プローブの振り分け (§8-2)
5. D-143 の追記 7 題 / 非追記の線引き
6. 脚本 `scripts/quiz-fidfix-S130-t1.mjs` (表の行ラベル置換の形、q096 解説の置換文字列)
7. §12 mqC: 訳語の選定 (corpus 実数)、規則の順序と "corporate customers" の除外、題ごとの置換数 MQC_EXPECT、統一後の文 (特に q098 解説・q099 選択肢)
8. §13 D-169: 4 件の衝突の判定と、解説の追随で概要側の (3) 等を残した線引き

---

## 12. 拡張 1 (lead 判断 D-161): 2009h21a-mqC「取引先」の組内統一

### 12a. 訳語の選定 (corpus 多数派)

jp に「取引先」を含む field (mqC の 4 題を除く 22 field / 20 題) の zh / en 実測:

| zh | field / 題 | en | field / 題 |
|---|---:|---|---:|
| **交易对象** | **8 / 7** | **business partner(s)** | **17 / 16** |
| 交易方 | 5 / 5 | client(s) | 3 / 2 (`2011h23a-q052` / `2024r06-q028`) |
| 交易伙伴 | 3 / 3 | counterparty | 1 / 1 |
| 客户 | 2 / 1 (`2011h23a-q052`。ほか 3 題 [`2015h27a-q007` `2016h28a-q013` `2025r07-q097`] の 客户 は同じ field の「顧客」の訳) | customer(s) | 取引先の訳としては 0 (出現 3 題はいずれも同じ field に「顧客」がある) |
| 往来企业 / 往来客户 | 各 1 | supplier | 1 (`2024r06-q028`、仕入先側) |

→ zh「交易对象」、en "business partner" (表名 "Business partner table" / "Business partner contact person table"、列名 "Business partner code" / "Business partner name")。en の表名は図 1 の "… contact person table" (担当者) に揃え、題幹・選択肢・解説の "contact table" も同じ名にした (指示「図の表名と題幹の語を一致」)。

### 12b. 是正前の組内の状態

- zh: 前文本文「业务往来方」(以下称为…) / 図 1・図 2「客户表」「客户代码」「客户名称」「客户负责人表」/ q097 題「业务往来方负责人表」/ q098 選択肢・解説「客户代码」/ q099・q100 の題・選択肢・解説「交易方…」
- en: 前文本文 "business partner" / 図 1・図 2 "Customer …" / q097 "business-partner contact table" / q098 選択肢 "Client code"・解説 "client" / q099 選択肢・解説 "Customer contact table"・"customer name" / q100 "Business-partner code"

### 12c. 方法 (scripts/quiz-fidfix-S130-t1.mjs 仕事 3)

- 組の 4 題の sidecar stem / choices、`.phase2/expl_tr_` の全 field (correct / distractors / points)、`.phase1/tr_` に同じ規則を順に当てる:
  - zh: 业务往来方 → 交易对象、交易方 → 交易对象、客户 → 交易对象 (組の zh で 客户 はすべて 取引先 の訳であることを確認。前文の「面向企业销售」に 客户 は無い)
  - en: business-partner → business partner (連字符を統一)、Customer contact (person) table / business partner contact table → Business partner contact person table、Customer → Business partner、customer(s) → business partner(s) (**"corporate customers" は除外**: 前文「企業に対して」= 顧客で取引先ではない)、Client / client(s) → Business partner / business partner(s)
- **assert-before-replace**: 題ごとの置換数 (sidecar + expl_tr) を事前に実測して `MQC_EXPECT` に固定 (q097 zh 16 / en 16、q098 30 / 27、q099 41 / 38、q100 21 / 18)。数が違えば中断、0 なら skip (冪等)。適用後に旧訳語 (业务往来方 / 交易方 / 客户 / Client / Customer / customer[s] (corporate を除く) / business-partner / contact table) が 4 題の全 field (`.phase1` 含む) に残っていないことを検査する
- probe: 組の probe (zh「I公司面向企业销售PC相关设备…」/ en "CompanyIsellsPC-relatedequipmenttocorpor") は先頭 40 字で、置換対象を含まない。`chumon --check` 一致、A7 hold
- あわせて q098 選択肢エ en "Name, position" → "Name, job title" (jp「役職」。図 1 の列名 "Job title"・解説の "job title" と一致させる)
- §4 の q098 / q099 の個別是正 (jp 混入除去、名称 → 姓名) はそのまま残り、その後に本規則が当たる (q098 題幹は "the business partner contact person table in Figure 1"、q099 は「交易对象代码、姓名、部门名」)

### 12d. 是正後 (抜粋)

- zh 前文:「进行交易的企业（以下称为交易对象）的负责人原则上为 1 人，但根据交易对象的不同…交易对象代码按交易对象逐一编号。」図 1「交易对象表 | 交易对象代码 | 交易对象名称 |」「交易对象负责人表」、図 2「［交易对象名称］」
- en 前文: "(hereafter called a business partner) … A business partner code is assigned to each business partner." 図 1 "Business partner table | Business partner code | Business partner name |" "Business partner contact person table"
- q098 選択肢: 交易对象代码 / 交易对象代码、姓名 / 交易对象代码、部门名 / 姓名、职务 ・ Business partner code / … , name / … , department name / Name, job title
- q099 選択肢: 「销售单价表 ＝ 商品表 ≧ 交易对象负责人表 ＝ 交易对象表」/ "Unit price table = Product table ≧ Business partner contact person table = Business partner table"
- q100 選択肢: 列名「交易对象代码」/ "Business partner code"

### 12e. D-143

note 追記 3 題: `2009h21a-q098` (正解肢ウ) / `q099` (正解肢イ) / `q100` (正解肢ウ)。いずれも訳語・表名だけの変更で導出・correct_answer は不変 (note に導出を記載)。q097 は選択肢が数値のみで正解肢に変化なし → 追記なし。

## 13. 拡張 2 (lead 判断 D-169): en の丸数字ラベル — 衝突する 4 件

規則 (D-169): jp の ①②… がラベルとして同じ問の中 (題幹 ↔ 選択肢 ↔ 解説、または図) で参照される、あるいは同じ問の別の (n) 列と衝突するときは、en も ①②… を使う。衝突しない (n) は据え置く (cosmetic、⑨ 低)。

| id | 衝突の確認 | 是正 | 正解 |
|---|---|---|---|
| `2010h22h-q095` | 候補 ①〜④ (流れ図の d / e / f に入れる字句、**選択肢 "d: (3) e: (1) f: (2)" が参照**) が、同じ en 題幹の〔条件〕(1)(2)・〔手続〕(1)〜(3)・〔貸出処理〕(1)〜(4)・〔返却処理〕(1)(2)・〔概要〕(1)〜(3) と同じ記法。「(3)」が 4 通りに読める → **衝突** | 題幹の候補 4 行、選択肢 ア〜エ、解説 en (correct / イ / ウ / エ の候補参照 11 箇所) を ①〜④ に。解説の "matches (3) of [Overview of the document search function]" は概要側の箇条なので据え置き | ア (正解肢上、note 追記) |
| `2013h25a-q087` | 契約項目 ①〜④ (**選択肢 "(1) and (3)" 等が参照**) が、状況説明 (1)〜(3) と同じ記法 → **衝突** | 題幹の項目行、選択肢 ア〜エ、解説 en (11 箇所) を ①〜④ に | イ (正解肢上、note 追記) |
| `2013h25a-q093〜q096` (中問C 共有前文) | 表 1 の表記ルール ①〜③ が、前文の箇条 (1)〜(6) と同じ記法。q094 解説 "rule (3)" "(3)(4)" や q095 解説 "creation rule (5)" は箇条側を指し、表記ルール (1)〜(3) と区別できない → **衝突** | 4 題の題幹の表記ルール行の 3 ラベルを ①〜③ に。解説が指すのは箇条側なので解説は不触。選択肢は参照なし。probe (先頭 40 字) に掛からない | 選択肢不変、note なし |
| `2011h23a-q092` | 図 4 (jp 画像) の 画像①〜③ を**選択肢が参照**。en だけ "Image (1)" で、図のラベル ① と一致せず、題幹の処理概要 (1)〜(4)・(1)(2) とも同じ記法 → **参照 + 衝突** | 選択肢 ア〜エ、解説 en (correct 18 / ア 6 / ウ 3 / エ 6 箇所) を "Image ①" 等に | イ (正解肢上、note 追記) |

- `.phase1/tr_` には同じ置換を当てた (文字列があるもののみ。q093〜q096 の前文は `.phase1` に無く skip)
- zh はいずれも元から丸数字で、変更なし
- 据え置いた非衝突の (n) は §8-2 のとおり

> S130 Rule D NIT-1 (t1-reviewer) 追記: merge が final≠round1 のとき自動生成した key_guard.round1 スナップショットが 5 題ある (内容 = 是正前の final と逐字一致、S127 先例と同型)。
