# A track A2b: 訳層照合 (段 3) の是正 + D-151 zh 引用符統一 (S127)

D-150 §4 段 3 (方式 D、訳層 pilot)。⑤-2 / A2a で源照合済の jp (= 正) と zh / en を意味照合した 226 題の結果を是正し、あわせて D-151 (zh 訳層の ASCII `"` → 全角 “”) を機械変換で適用した。
対象リストは `data/ip/quiz/.phase2/a2b_targets_S127.json` (= `evidence/phase5/stage_06_quiz_fidelity/a2b_targets_S127.json`)。

**集計の扱い: ⑤-2 の累計 (1208 / 157) には入れない (別枠)。**

---

## 1. 入力と実行

- run: `wf_78b23338-93c` (Sonnet、batch 5 = 46 agent、画像なし、226 題、2,671,352 token = 11.8k/題)
- マニフェスト: `data/ip/quiz/.phase2/a2b_tr_input.json` (226 題)。**適用前の sidecar と zh / en 2,260 field すべて一致** (fixer が機械照合。CLEAN 判定が古い訳文に対するものではないことの確認)
- 結果 JSON: `evidence/phase5/stage_06_quiz_fidelity/a2b_tr_fidelity_sn.json`
- 是正器: `scripts/quiz-fidfix-S127-a2b.mjs` (既定は dry-run、`--apply` で書き込む)

## 2. A2b の命中率

| | 題 | 差分 (field × 言語) |
|---|---:|---:|
| 対象 | 226 | — |
| CLEAN | 222 | — |
| DISCREPANT | **4 (1.8%)** | 9 (semantic 3 / cosmetic 6、正解肢上 1 = `2016h28h-q009 ア`) |
| 採用 | **4** | 9 (全件採用) |
| CLEAN 抽検の見落とし (§5) | +1 | +1 (cosmetic) |
| 対象外の同型 (lead 振り分けで追加、§4b) | +2 | +2 (semantic、en) |

⑤-2 の fixer が jp 是正のとき zh / en も直していたので、収量が低いのは想定どおり。agent の判定はすべて fixer の裁定と一致した (FP 0)。

## 3. 型

| 題 | kind (agent) | 層 | 判定 |
|---|---|---|---|
| `2016h28h-q009` | proper_noun ×5 (cosmetic) | zh stem + ア〜エ | 採用 |
| `2015h27a-q042 イ` | meaning_shift (semantic) | en | 採用 |
| `2021r03-q024 ウ` | addition ×2 (semantic) | zh / en | 採用 |
| `2023r05-q094` | addition (cosmetic) | en stem | 採用 |

## 4. 採用した差分

| id | 層 | before → after | 根拠 |
|---|---|---|---|
| `2016h28h-q009` | zh stem / ア / イ / ウ / エ (+ 解説 correct ×2・points[1] ×1) | 「甲公司」→「A公司」 | jp は「A社」「B社」。zh だけが A を「甲公司」、B を「B公司」にしていて不揃い。corpus の zh を実測すると「X公司」(英字ラベル) は 732 箇所 / 206 題、「甲乙丙丁公司」は本題の 5 箇所 / 1 題だけ。多数派と jp に合わせた。**アは正解肢** (変わるのは社名ラベルだけ) |
| `2015h27a-q042 イ` | en (+ 解説 distractor イ en) | "integration test" → "system test" | IT パスポートの用語では、総合テスト = システムテスト (system test)、結合テスト = integration test。corpus の en 実測: 結合テスト → integration 全件、システムテスト → system 全件、`2021r03-q043` は同じ文の中で 総合テスト → system testing / 結合テスト → integration testing と訳し分けている。zh「综合测试」は正しいので変えていない。誤答肢 |
| `2021r03-q024 ウ` | zh / en | 「（BYOD，自带设备办公）」/ " (BYOD)" を除去 | 題幹は「テレワークに関する記述」で、正解はア。ウは BYOD の定義を書いた誤答肢。jp に無い用語名を付けると、ウが別概念 (= テレワークではない) と分かり、**消去法の手掛かり (答えの示唆) になる**ので除去した。解説の BYOD (4 箇所) は、答えた後に読む説明なので据え置いた。題幹 zh の「（telework）」は題の主題そのもので、手掛かりにならないので据え置いた。D-142 は訳語の固定であって括弧注を義務づけていない (確認済) |
| `2023r05-q094` | en stem | "the Information Security Basic Policy in an ISMS" → "the information security policy in an ISMS" | jp は「情報セキュリティ方針」で、「基本」は無い。小文字化は corpus の en stem の多数派 ("information security policy" 16 箇所、大文字表記 0) に合わせた。解説 en の "Information Security Basic Policy" ×4 は据え置いた。解説は 基本方針 / 対策基準 / 実施手順 の階層を説明していて、そこでの呼び名だからである (zh 解説は「信息安全方针（信息安全基本方针）」と同一視を明記している)。ただし、是正前は stem と解説が "Basic Policy" で揃っていたのを、本 unit が不揃いにした。§11 で reviewer の裁定を求めた。→ **Rule D の MINOR を受けて、解説 correct.en の初出を "The information security policy (Information Security Basic Policy) sits at the top…" に直した** (jp / zh 解説と同じく、両者が同じものだと分かる形にした。cosmetic なので note は付けていない)。残り 3 箇所はこの同一視の後に出てくるので据え置いた |
| `2023r05-q044` | en stem | "A Company's IT department" → "Company A's IT department" | **CLEAN 抽検で見つけた見落とし** (§5)。同じ stem の中の他の箇所は "Company A" / "Company B" で、q009 と同じ社名ラベルの不揃い (cosmetic) |

### 4b. 対象外の同型 2 件 (lead の振り分けで本 unit に追加)

`2015h27a-q042` と同じ型 (総合テスト → "integration test") で、A2b の 226 題の外にあったもの。2011h23a / 2012h24h は 13 exam 群で、jp の源照合が済んでいないため、**先に源ページを fixer が原寸で実読し、jp が「総合テスト」であることを確認した**。

| id | 源 | 層 | before → after | 備考 |
|---|---|---|---|---|
| `2011h23a-q051` | p19 問51 記述 c「総合テストの開始までに発注先から成果物が納品されることを確認する。」 | en stem (記述 c) + 解説 correct en | "before the integration test begins" → "before the system test begins" | c は**正解 (エ = c, d) に含まれる記述**。zh「综合测试」は正しいので変えていない |
| `2012h24h-q035 エ` | p12 問35 エ「…設計から総合テストまで同じ基準値を使用する。」 | en | "from design through integration testing" → "from design through system testing" | 誤答肢 (正解イ)。解説 エ en は既に「integration testing (結合) / overall system testing (総合)」と訳し分けているので触っていない |

D-143 note は 2 題とも追記した (q051 は正解に含まれる記述、q035 は誤答肢の語義是正)。

- jp 3 層 (questions / question_bank / by_year) には触れていない (是正器はこれらを読み込みも書き込みもしない。note の page 番号を出すため question_bank を読むだけ)。
- `.phase1/tr_` には sidecar と同じ置換を当てた (再 merge 禁止の方針)。解説は `.phase2/expl_tr_` を直し、`quiz-phase2-merge` で再生成した。

### D-143 (final note 追記、round1 不可触)

追記した 5 題: `2016h28h-q009` (正解肢に当たる) / `2015h27a-q042` (誤答肢の語義是正) / `2021r03-q024` (誤答肢に jp に無い情報が付いていた) / `2011h23a-q051` (正解に含まれる記述 c) / `2012h24h-q035` (誤答肢の語義是正) (後の 2 題は §4b)。
追記しなかった題: `2023r05-q094` と `q044` (en の cosmetic で正解肢外)、および D-151 (字種だけの機械変換。§6d)。
`2015h27a-q042` は今回が初めての追記で、final と round1 が分かれたため、explanations に `round1` ブロックが現れた。これは A2a の `2014h26a-q045` と同じ挙動。

## 5. CLEAN 抽検 (バッチ化で recall が落ちていないかの検査)

### 5a. 無作為標本 (fixer が jp と zh / en を自分で読み比べた)

- 母集団: CLEAN 222 題 (id 昇順)。xorshift32 で Fisher–Yates、**seed 20261020**、先頭 12 題
- 標本: `2016h28a-q007` `2016h28h-q081` `2017h29h-q019` `2017h29h-q043` `2019h31h-q067` `2021r03-q065` `2022r04-q022` `2022r04-q023` `2023r05-q044` `2023r05-q060` `2024r06-q059` `2026r08-q089`
- **見落とし 1 / 12** (cosmetic): `2023r05-q044` en stem "A Company's IT department" (§4 で是正)。semantic の見落としは 0
- 所見 (欠陥とは判定しない): `2016h28h-q081` zh は ア / イ / エ に英語原語の括弧注 (archiver / installer / middleware) を付けているが、**正解肢ウ (设备驱动程序) にだけ付いていない**。カタカナ語の原語なので jp に無い情報ではない。ただし非対称で、正解肢が目立つ。⑨ に記録 (未是正)
- そのほかの括弧注 (`q007` BCP（业务连续性计划）、`q043` 项目范围（工作范围）、`q065` 影子IT（Shadow IT）、`q023` 选择退出（opt-out）) は、jp の語や同じ stem 内の定義を訳しただけで、手掛かりにはならない

### 5b. 決定的プローブ (226 題全件、0 token)

zh / en にあって jp (NFKC、桁区切り除去) に無い ASCII 大文字 2 字以上の語 (zh のみ) と数字列、および zh の「甲乙丙丁公司」を走査した。

- 14 hit: DISCREPANT 側 6 (`q009` 甲 ×5 / `q024` BYOD) はすべて agent が検出済み
- CLEAN 側 8 はすべて FP: zh の略語注 (`2015h27a-q097` 显像管（CRT）/ `2018h30a-q079` 逻辑与（AND）/ `2019h31h-q015` 准时制（JIT）/ `2020r02o-q100` 认证中心(CA) / `2021r03-q013` PIN 码 = 暗証番号) は、jp の語を訳したもので手掛かりにならない。en の数字 (`2019h31h-q053` 40,000 / `2023r05-q004` 5,000,000 / `2023r05-q025` 100,000) は万単位を換算したもの
- プローブでの見落としは 0

## 6. D-151: zh 訳層の ASCII `"` → “”

### 6a. 件数

| 層 | ASCII `"` を含む zh field | 変換 | 除外 | 不触 |
|---|---:|---:|---:|---:|
| translations sidecar (出荷層) | 56 field / 207 個 | **40 field / 136 個 → 68 対** | **16 field / 71 個** | — |
| `.phase1/tr_` (merge 入力) | 102 field | **40 field** (sidecar と同じ field、同じ変換) | 16 (sidecar と同じ) | **46 field** (§6c) |
| 解説 zh (`.phase2/expl_tr_` / explanations) | **0** (実測) | — | — | — |

- 適用後、sidecar の zh に残る ASCII `"` は **16 field = 除外分だけ**。
- en は対象外 (⑨-c に残る)。jp は触っていない。
- 変換は対象 field を列挙しない決定的な変換 (`quoteZh`)。field 内の `"` を出現順に “ / ” と交互に置く。偶数個であること、開きの直後と閉じの直前が空白でないことを検査し、事後に `"` が 0 個で “ と ” がそれぞれ n/2 個増えたことを確認した。違反は 0 件 (奇数個の 1 field は除外対象)。
- 変換した 40 field と仕事 1 の sidecar 12 field の before / after (全文) は `evidence/phase5/stage_06_quiz_fidelity/a2b_before_after_S127.json` にある (git HEAD と作業ツリーの差分から生成。`.phase1/tr_` は gitignored で、sidecar と同じ置換)。変換した 40 field の中身は、prose の引用 (用語・表名・列名・入出力の文・値) だけ。

### 6b. 除外 (sidecar 16 field)

| id | field | 理由 | jp の表記 |
|---|---|---|---|
| `2010h22h-q063` | ア | `“"”で囲む`: `"` という文字そのものを指している (`"` が奇数個) | jp も `“"”` |
| `2012h24h-q069` | ア〜エ | 検索式 `("札幌" AND "函馆") OR "日本料理"` | jp も ASCII |
| `2013h25a-q095` | ア〜エ | 文字列連結の式 `"关联_" + n + "报告_" + …` | jp も ASCII |
| `2016h28h-q096` | ア / イ / エ | SQL LIKE のパターン `"%子"` / `"子%"` / `"%子%"` | jp も ASCII |
| `2023r05-q075` | ア〜エ | 表計算の式 `IF(…, "合格", "不合格")` | jp も ASCII |

規則: `"` が式・検索式・パターン・プログラムの中にある (`+` / `=` / `IF(` / `AND`・`OR` / SQL の `%`) か、`"` という文字そのものを指しているなら除外する。これは ⑨(8) (擬似言語の文字列リテラル、規約未定) を、式やクエリのリテラルまで含めて解釈したもの。
**D-151 の除外は、擬似言語のリテラルから、式・検索式・LIKE パターン・`"` という文字そのものへと拡張して解釈した**。拡張した箇所は、いずれも jp も ASCII `"` を使っている箇所に限られる (Rule D NIT-3)。
変換した側にある `2022r04-q065` (列名 "员工编号") / `2012h24a-q088` (表示値 "○" "×") / `2026r08-q084` (生成 AI への入力文) / `2014h26h-q051` ("0" 到 "9") は、どれも prose の中の引用で、式ではない。

### 6c. `.phase1` だけが ASCII `"` を持つ 46 field (触っていない)

`2009h21a-q062` `2010h22a-q079` `2010h22a-q084` `2010h22a-q085` `2010h22a-q095` `2010h22h-q088` `2010h22h-q095` `2011h23a-q057` `2011h23a-q089` `2011h23tokubetsu-q073` `2011h23tokubetsu-q100` `2012h24a-q063` `2012h24a-q065` `2012h24a-q072` `2012h24a-q096` `2012h24h-q089` `2013h25h-q061` `2013h25h-q067` `2013h25h-q096` `2014h26a-q075` `2014h26a-q099` `2014h26h-q087` `2015h27a-q048` `2015h27a-q064` `2015h27a-q072` `2015h27a-q087` `2015h27h-q098` `2016h28a-q074` `2016h28a-q075` `2016h28h-q096` `2017h29a-q092` `2018h30a-q085` `2019h31h-q026` `2019h31h-q078` `2019h31h-q098` `2019r01a-q070` `2019r01a-q076` `2019r01a-q099` `2020r02o-q057` `2021r03-q095` `2022r04-q065` `2024r06-q062` `2024r06-q085` `2024r06-q093` `2025r07-q066` `2026r08-q057` (いずれも stem)

- これらの field では sidecar が既に「」等になっていて、ASCII `"` を持たない。`.phase1` は旧版のまま sidecar と乖離している。
- `.phase1` を変換しても sidecar (「」) とは揃わない。また、この中にはプログラム・式・パスのリテラル (`2024r06-q062` `output ← ""`、`2011h23tokubetsu-q100` `src="文件名"`、`2013h25h-q096` 計算式、`2024r06-q093` `"%葉_"`、`"目录名￥文件名"` のパス表記 等) が多く、裁定の手間に見合う出荷上の効果が無い。そのため **sidecar と同じ field だけ** `.phase1` に当てた。
- `2011h23a-q089` (中問 COPY 組、A2a の Rule B) はこの 46 field に入っているので、触っていない。
- `.phase1/input_<exam>.json` は対象外。

### 6d. 正解肢に当たる D-151 field (D-143 note は追記しない)

`2010h22a-q079 イ` / `2019h31h-q097 ア` / `2020r02o-q006 ア` / `2022r04-q065 ア` / `2026r08-q057 ウ` / `2026r08-q084 エ`。
変わるのは字種だけで、correct_answer は変わらない (§7)。D-151 は決定レベルの一括機械変換なので、題ごとの note は付けず、この一覧を記録とする。

### 6e. 中問組

D-151 の対象のうち、中問組のメンバーは `2012h24a-q090` (組 `2012h24a-mqB`) と `2013h25a-q091` (組 `2013h25a-mqB2`) の 2 題。どちらも引用は設問固有の部分にあり、共有前文 (probe = 先頭 40 字) には掛かっていない。`chumon --check` と crosscheck A7 は GREEN (§7)。

## 7. ゲート

| ゲート | 結果 |
|---|---|
| 適用前: `quiz-phase2-merge.mjs` を note / 解説を変える 3 exam (2015h27a / 2016h28h / 2021r03) で先に実行 | ✅ `git diff data` **0 行**、`git status data/` も clean |
| 適用後: `quiz-phase2-merge.mjs` を translations を変えた残り 11 exam (2009h21h 2010h22a 2011h23tokubetsu 2012h24a 2013h25a 2014h26h 2019h31h 2020r02o 2022r04 2023r05 2026r08) でも実行 | ✅ explanations の変更は 3 exam だけのまま (= 14 exam すべてで merge は冪等、drift 0) |
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ `chumon_groups.json は生成結果と一致` (`?` 情報行は既存) |
| `pnpm --config.verify-deps-before-run=false -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm … -C apps/web test` (vitest) | ✅ **38 passed / 1 skipped (39 files)、562 passed / 2 skipped (564 tests)** |
| `pnpm … -C apps/web build` | ✅ exit 0 |
| `node --check scripts/quiz-fidfix-S127-a2b.mjs` | ✅ |
| fidfix dry-run 再実行 | ✅ **applied 0 / skipped 33、files to write 0** (§4b 追加後) |
| `correct_answer` 差分 | ✅ **0** (`git diff -U0 data \| grep -c '"correct_answer"'` = 0) |
| `answer_keys.json` | ✅ md5 `6802bb0bc13004da78ad3c4e5117d997` / mtime `1788586696` (A2a 記録値と同一 = 不変) |
| D-143 MARK | ✅ final note 5 件 (純粋後置)、round1 変更 0、explanations 内 MARK 各 1 (2011h23a / 2012h24h / 2015h27a / 2016h28h / 2021r03) |
| D-151 残存 | ✅ sidecar zh の ASCII `"` = 16 field (= 除外のみ) |
| e2e (Playwright) | **未実行** (A2a と同じ理由。文字列置換だけ) |

再生成: `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs` ×3 exam。§4b の追加は、適用前に 2011h23a / 2012h24h の merge を回して diff 0 を確認 → `--apply` (applied 7) → corpus → merge ×2。その後ゲートを全部やり直し、すべて GREEN だった (crosscheck / assert-clean / chumon --check / tsc / vitest / build / node --check / correct_answer 0 / answer_keys md5 不変)。git diff は 21 files (translations 16 + explanations 5)。Rule D MINOR の反映は、是正器 dry-run (applied 1) → `--apply` → 2023r05 の merge の順で行い、その後ゲートを再確認した: crosscheck A1–A7 / B1–B7 hold、assert-clean GREEN、chumon `--check` 一致、`node --check` OK、再 dry-run **applied 0 / skipped 34**、correct_answer 差分 0、answer_keys md5 `6802bb0b…` 不変。最終の git diff は **22 files (translations 16 + explanations 6)**。`.phase1` / `.phase2` は gitignored。

## 8. ⑨ 新規 / 更新

- **⑨-c (zh 部分) → D-151 で閉じた**。残るのは en の ASCII `"` と ⑨(8) (擬似言語・式のリテラル。§6b の除外 16 field はこの規約が決まった時に再訪する)。
- **総合テスト → "integration test" の誤訳 (A2b 対象外の 2 件)** → lead の振り分けで本 unit に追加し、是正済み (§4b)。sidecar の en に、総合テストを integration と訳した箇所はもう残っていない。`2024r06-q047 イ` "comprehensive test" は誤りではない (表記揺れ、⑨ 観察)。
- **⑨ 新規: en の "X Company" 語順** (corpus の多数派は "Company X")。sidecar en に 13 field: `2010h22h-q098` / `q100` (stem・ア) / `2012h24a-q025` / `q097` (stem・ア) / `2013h25h-q090` / `q091` / `2014h26a-q085`〜`q088` (中問組。直すなら probe に注意) / `2023r05-q044` (本 unit で是正済)。
- **⑨ 新規: `.phase1/tr_` と sidecar の乖離** (再 merge すると退行する): ASCII `"` の 46 field (§6c) のほか、`2023r05-q004` stem は `.phase1` が「306 万日元」、sidecar が「300 万日元」(jp clean「300万円」= sidecar が正)。`2012h24a-q090` / `2013h25a-q091` は `.phase1` に前文が無い (sidecar は前置済)。再 merge 禁止の方針で実害は無いが、棚卸しの候補。
- **⑨ 観察 (未是正)**
  - `2016h28h-q081` zh の英語括弧注が、正解肢ウにだけ無い (§5a)。
  - `2023r05-q094` 解説 en の "Information Security Basic Policy" (stem は是正後 "information security policy") → Rule D MINOR で初出に同一視を付け、解消した (§4)。
  - (Rule D NIT-2、reviewer の追加抽検) `2018h30h-q038` zh stem「最恰当」は、jp に無い最上級 (en は正しい)。CLEAN 抽検を fixer 12 + reviewer 10 で合算すると、**semantic 0/22・cosmetic 2/22** (`2023r05-q044` は是正済、`2018h30h-q038` は未是正)。
  - (Rule D NIT-2) `2021r03-q044` zh / en は、ア の FAQ にだけ展開注が付いている (非対称な訳注。`2016h28h-q081` と同じ型)。
  - (Rule D NIT-4) zh の総合テストの訳が「系统测试」と「综合测试」で揺れている (en は §4b で system に統一済)。
  - `2021r03-q024` raw stem_jp は「最も適功かもの」(OCR)。clean は「最も適切なもの」で、表示層は clean = N5。

## 9. 逸脱 (Rule D 確認点)

1. **`2023r05-q044` を是正対象に加えた** (agent は CLEAN、fixer の抽検で見つけたもの)。A2a の「候補外を含む」採用と同じ扱い。
2. **`.phase1` の D-151 は sidecar と同じ field に限った** (§6c)。指示の範囲は「.phase1 tr_* を含む」だったが、46 field は出荷層に効かないので理由付きで触っていない。
3. **解説を是正対象に含めた** (`q009` zh 3 箇所、`q042` en 1 箇所)。題と解説の社名・用語を揃えるため。BYOD (`q024`) と Basic Policy (`q094`) の解説は据え置いた。
4. **総合テストの対象外 2 件を追加した** (lead の振り分け、§4b、源ページで確認済)。

## 10. Rule B (失敗記録)

- 是正器の dry-run 1 回目が、`subN` の事後確認の bug で abort した (`to` が `from` の部分列になる `q024` の除去で、to の出現数の期待値を誤算)。書き込みは起きておらずデータの attempt ではないので、`failures/` には起票していない。式を直して 2 回目の dry-run で通した。
- 抄写 run (`wf_78b23338-93c`) に失敗 attempt は無い (226/226 完走、UNREADABLE 0)。

## 11. Rule D 待ち

Writer = `a2b-fixer` (`oh-my-claudecode:executor` opus)。**Reviewer は別の `subagent_type` (opus) で別途行う** (本ファイルは writer の自己申告で、審査はまだ)。

審査の重点:
1. §4 の 5 題の判断。特に `2021r03-q024 ウ` の「答えの示唆」の解釈と、`2015h27a-q042` の用語体系
2. §6b の除外規則と 16 field、§6a の変換 40 field (dry-run 出力で before / after を確認)。§6c で `.phase1` の 46 field を触らなかった判断
3. §5 の CLEAN 抽検。fixer の標本 (seed 20261020 の 12 題、§5a に列挙) と重ならない題で追加抽検することを推奨する。あわせて §5b のプローブの FP 裁定
4. §6d で D-151 に note を付けない方針
5. `2023r05-q094`: stem の "Basic" を除いたため、解説 en ("Information Security Basic Policy" ×4) と不揃いになった。据え置くか (§4 の理由)、解説も直すか
6. 脚本 `scripts/quiz-fidfix-S127-a2b.mjs` (`subN` の事後確認式、`quoteZh` の検査)

---

## Rule D (verifier、`oh-my-claudecode:verifier` opus、fixer executor と別 type) — **PASS-with-notes**

- 判定: MAJOR 0 / MINOR 1 / NIT 4。
- 確認内容 (lead からの伝達による要約):
  - §4 / §4b の是正 7 題。
  - §6 D-151 の変換 40 field と除外 16 field。
  - §5 の CLEAN 抽検。reviewer が fixer の標本と重ならない 10 題を追加で抽検した。
  - ゲートと D-143。
- 指摘の詳細文は lead が保持している。

### 指摘と処置 (fixer、S127)

| 指摘 | 内容 | 処置 |
|---|---|---|
| **MINOR** | `2023r05-q094` 解説 correct.en の初出 "The Information Security Basic Policy sits at the top…" を、jp / zh 解説の同一視に揃えて "The information security policy (Information Security Basic Policy) sits at the top…" にする (cosmetic、note 不要) | ✅ 是正器の EXPL に追加。dry-run (applied 1) → `--apply` → 2023r05 merge → ゲート再確認 GREEN (§7)。note は付けていない |
| **NIT-1** | `scripts/quiz-fidfix-S127-a2b.mjs` 冒頭のコメントが、実際の置換 (小文字) と合っていない | ✅ コメントを「→「information security policy」(corpus の小文字表記に揃える)」に直し、解説 MINOR の行を追記した |
| **NIT-2** | ⑨ に `2018h30h-q038` zh「最恰当」(jp に無い最上級) と CLEAN 抽検の合算 (semantic 0/22・cosmetic 2/22) を追記。観察として `2021r03-q044` ア FAQ のみの展開注 | ✅ §8 ⑨ 観察に追記した (未是正) |
| **NIT-3** | §6b に、D-151 の除外を拡張解釈したことを一文で書く | ✅ §6b に追記した |
| **NIT-4** | ⑨ 観察: zh の総合テストの訳揺れ (系统测试 / 综合测试) | ✅ §8 ⑨ 観察に追記した |
