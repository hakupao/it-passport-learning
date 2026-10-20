# T2: 訳層照合 (段 3、方式 D) の是正 — ⑤-2 population 16 exam (S130)

D-150 §4 段 3。⑤-2 で jp を源照合した population のうち、A2b の照合済を除いた 985 題について、jp 表示層 (= 正) と zh / en を照合した T2 run の結果を是正する。手順は T1 (`evidence/quiz_T1_tr_fix_S130.md`) / A2b と同じ。入力準備は `evidence/quiz_T2_tr_prep_S130.md`。

PHASE 1 (lock なし、dry-run) → lead 判断 D-171 による拡張 (§12) → PHASE 2 (D-152 lock 付与後、HEAD `dd49f9e` で適用) の順に行った。

---

## 1. 入力と実行

- 結果 JSON: `evidence/phase5/stage_06_quiz_fidelity/t2_tr_fidelity_sn.json` (Sonnet、batch 5、画像なし、985 題)
- マニフェスト: `data/ip/quiz/.phase2/t2_tr_input.json`。**作業ツリーの sidecar と zh / en 9,850 field がすべて一致** (PHASE 1 時点で機械照合。作業ツリーには X lane の未 commit 変更 (2015h27a / 2016h28a / 2016h28h / 2017h29a ほか) があるが、対象 5 題の sidecar は HEAD と同一であることも確認した)
- 是正器: `scripts/quiz-fidfix-S130-t2.mjs` (T1 と同じ構造。既定は dry-run)
- dry-run (PHASE 1、§12 D-171 拡張後): **applied 535 / skipped 0**、書き込み予定 212 files (translations 27、`.phase1/tr_` 157、`.phase2/expl_tr_` 3、generate_result 25)。§4 の仕事 1 だけなら applied 31

## 2. 命中率

| | 題 | 差分 (field × 言語) |
|---|---:|---:|
| 対象 | 985 | — |
| CLEAN | 980 | — |
| DISCREPANT | **5 (0.5%)** | 8 (semantic 4 / cosmetic 4、正解肢上 3) |
| 採用 | **5** | **8 (全件)** |
| 同じ題で見落とされていた差分 (fixer が追加) | (+0 題) | +2 (`2015h27a-q021 イ` 正解肢 CSR の展開、zh / en) |

agent の判定はすべて fixer の裁定と一致した (FP 0)。ただし、略語の選択肢に展開を付けるパターンは corpus 全体に系統的にあり、agent はその大半を CLEAN と判定している (§6b、§8-1)。

## 3. 選択肢の展開 (gloss) の裁定規則

A2b の `2021r03-q024 ウ` (BYOD) の前例に従う。**jp に無い展開・用語名が選択肢に付いていて、それが消去法または答えの手掛かりになり得るなら除去する。** 解説の展開は、答えた後に読む説明なので据え置く。

- 略語だけの選択肢群 (jp が略語のみ) で、題が「どの略語がこの説明に当たるか」を問う場合:
  - 正解肢に付いた展開は、題幹の説明と字面で直結することが多い。例: "Corporate **Social** Responsibility" と題幹「**社会**に対する貢献」、"**Remote** Access Trojan" と題幹「**遠隔**から操作」。これは答えの手掛かりになる
  - 誤答肢に付いた展開は、その選択肢が別概念であることを明かすので、消去法の手掛かりになる
- 一方、jp のカタカナ語に原語を添える括弧注 (例: 「容错（Fault tolerance）」) は jp の情報を訳しただけなので、対象外とする

## 4. 採用した差分

| id | 層 | before → after | 根拠 | 種別 / 正解 |
|---|---|---|---|---|
| `2015h27a-q021 エ` | zh / en | 「MBO(目标管理)」/ "MBO (Management by Objectives)" → 「MBO」/ "MBO" | jp は略語だけ。誤答肢に展開を付けると、別概念 (人事の目標管理) と分かって消去法の手掛かりになる。しかも IT パスポートの経営戦略の文脈 (BCP / CSR / M&A と並ぶ) では、MBO は通常マネジメントバイアウトで、展開自体が試験の想定と食い違う | semantic / 誤答肢 |
| `2015h27a-q021 イ` | zh / en | 「企业社会责任（CSR）」/ "CSR (Corporate Social Responsibility)" → 「CSR」/ "CSR" | **agent の見落とし (fixer 追加)**。正解肢の展開が題幹「社会に対する貢献」と直結し、答えになる。同じ問の ア BCP / ウ M&A は展開なし (非対称) | semantic / **正解肢** |
| `2016h28a-q089` | zh / en stem (+ 解説 correct zh / en) | 「该河流在过去100年里仅泛滥过一次」→「该河流仅在100年前泛滥过一次」/ "has flooded only once in the past 100 years" → "has flooded only once, 100 years ago" | jp「100年前に1度氾濫したきり」= 100 年前の 1 回を最後に氾濫していない。訳は「直近 100 年の間に 1 回」と読め、最近の氾濫もあり得る意味になる。解説も同じ言い方をしていたので追随した | semantic / 題幹 |
| `2017h29a-q041 ア` | en (+ 解説 ア en ×2) | "conclude a contract (a subcontracting agreement)" → "conclude a contract for work" | jp「請負契約」。corpus の en で 請負契約 を含む field の訳は contract for work / contract-for-work が 22、subcontract(ing) が 10。subcontract は下請の含意が加わる。zh「承包合同」は正しいので触っていない | cosmetic / 誤答肢 |
| `2017h29h-q062 エ` | en (+ 解説 correct en ×3) | "Information Security Basic Policy" → "Information security policy" | jp「情報セキュリティ方針」に「基本」は無い。題幹 en の "basic principles" (基本原理) と "Basic" が呼応し、正解肢を目立たせる。A2b `2023r05-q094` (題幹の同じ語を是正) と同型。大小文字は、他の選択肢 (sentence case) と corpus の小文字表記に揃えた。解説は A2b の Rule D MINOR と同じく、初出を "The information security policy (information security basic policy) …" として基本方針との同一視を残し、"エ Information security policy" と結論の箇所を直した。階層の説明 "basic policy (information security basic policy) → …" と points[0] は、基本方針の呼び名の説明なので据え置いた | cosmetic (agent) → 手掛かり性ありと判断 / **正解肢** |
| `2021r03-q094 ア` | zh / en | 「RAT（远程访问木马）」/ "RAT (Remote Access Trojan)" → 「RAT」/ "RAT" | jp は略語だけ。正解肢の展開 "Remote Access" が題幹「遠隔から操作」と直結する。イ VPN は展開なし (非対称)。解説の展開は据え置いた | cosmetic (agent) → 答えの手掛かりと判断 / **正解肢** |

- `.phase1/tr_` の 5 題すべてに同じ置換が当たる (dry-run で確認、skip 0)。
- jp 3 層は読み込みも書き込みもしない (note の page 番号用に question_bank を読むだけ)。

### D-143 (final note 追記、round1 不可触)

追記する 4 題: `2015h27a-q021` (正解肢イ) / `2016h28a-q089` (題幹の意味) / `2017h29h-q062` (正解肢エ) / `2021r03-q094` (正解肢ア)。marker は `fidfix-S130-t2`。
追記しない題: `2017h29a-q041` (en の cosmetic、誤答肢)。

## 5. 不採用

なし。

## 6. CLEAN 抽検と決定的プローブ (Rule A)

### 6a. 無作為標本 (fixer が jp と zh / en を自分で読み比べた)

- 母集団: CLEAN 980 題 (id 昇順)。xorshift32 で Fisher–Yates、**seed 20261021**、先頭 12 題
- 標本: `2018h30h-q010` `2022r04-q016` `2016h28a-q052` `2023r05-q001` `2025r07-q080` `2017h29a-q077` `2023r05-q023` `2016h28a-q033` `2018h30h-q006` `2022r04-q039` `2019h31h-q090` `2025r07-q068`
- **semantic の見落とし 0 / 12**。展開による手掛かり 1 / 12: `2025r07-q068` 題幹「CSIRT（计算机安全事件响应组）」/ "CSIRT (Computer Security Incident Response Team)" (jp は略語だけ)。"Incident Response" が正解肢ウ「セキュリティ事故の発生時に…」と直結する。§6b の系統パターンの題幹版
- 所見 (欠陥としない): `2016h28a-q052 ア`「提案邀请书（RFP）」は jp の語を略語にしたもので、手掛かりにならない。`2023r05-q001 ア` / `2019h31h-q090` の原語注 (cannibalization / Fool-proof 等) は jp のカタカナ語の原語で、全選択肢に対称に付いている

### 6b. 決定的プローブ: 略語だけの選択肢に付いた展開 (0 token)

jp の選択肢が略語だけ (`^[A-Za-z][A-Za-z0-9&-/. ]{1,12}$`) で、zh / en がそれと異なる field を数えた。

- **T2 の 985 題**: 116 field / 47 題。DISCREPANT 側は 2 題 (`2015h27a-q021` / `2021r03-q094`) で、CLEAN 側が 45 題
- **corpus 全体 (2900 題)**: **83 題 / 215 field、うち正解肢に展開が付いている題が 57**
- **非対称で正解肢にだけ展開が付いている (略語の選択肢のうち展開付きが一部で、その中に正解肢を含む) 題: 36** (corpus 全体)
  `2009h21a-q079` `2010h22a-q017` `2010h22h-q004` `2011h23a-q088` `2012h24a-q004` `2012h24h-q041` `2012h24h-q064` `2013h25a-q008` `2013h25a-q079` `2014h26h-q055` `2015h27a-q021` (本 unit で是正) `2015h27a-q045` `2015h27h-q045` `2015h27h-q050` `2016h28a-q090` `2017h29a-q046` `2017h29h-q006` `2017h29h-q011` `2017h29h-q039` `2018h30a-q003` `2018h30a-q034` `2018h30a-q054` `2018h30a-q098` `2018h30h-q022` `2018h30h-q028` `2018h30h-q033` `2018h30h-q095` `2019h31h-q014` `2019r01a-q018` `2020r02o-q008` `2020r02o-q009` `2020r02o-q028` `2021r03-q094` (本 unit で是正) `2022r04-q035` `2025r07-q007` `2025r07-q067`
- 対称 (全選択肢に展開) の題でも、展開が題幹の説明と直結すれば答えが分かる (例: `2017h29h-q067` CSIRT / ISMS / MVNO の展開)。題幹側の展開 (`2025r07-q068`) も同じ型
- **本 unit (PHASE 1) では flag された 2 題だけを是正の対象にした。系統パターンの扱いは lead の判断を求める (§8-1)。**

## 7. ゲート (PHASE 2、HEAD `dd49f9e` = X track 完了後)

| ゲート | 結果 |
|---|---|
| HEAD で再 dry-run | ✅ applied 535 / skipped 0。D-171 の件数 assert (選択肢 207 + 個別 2、題幹 119 項、note 54 題) が通過した。✓ 行は PHASE 1 (作業ツリー基準) と**完全一致** (diff 0)。X2〜X4 の commit が対象 field に触れていないので、衝突の個別裁定は 0 件 |
| 適用前: `quiz-phase2-merge.mjs` を対象 25 exam で先に実行 | ✅ `git status data/` clean (drift 0) |
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs` ×25 exam | ✅ applied 535 |
| fidfix dry-run 再実行 | ✅ **applied 0 / skipped 156** (§13 の再適用後は applied 0 / skipped 158) |
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ `chumon_groups.json は生成結果と一致` (probe 不変) |
| `pnpm --config.verify-deps-before-run=false -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm … -C apps/web lint` (eslint) | ✅ exit 0 (0 errors、既存 warning 1 = `RetroGlossary.tsx` `tTerm`) |
| `pnpm … -C apps/web test` (vitest) | ✅ **38 passed / 1 skipped (39 files)、562 passed / 2 skipped (564 tests)** |
| `pnpm … -C apps/web build` | ✅ exit 0 (`Compiled successfully`) |
| `node --check scripts/quiz-fidfix-S130-t2.mjs` | ✅ |
| `correct_answer` 差分 | ✅ **0** (`git diff -U0 data \| grep -cE '^[+-]\s*"correct_answer"'` = 0。Rule D NIT-2: 行頭の +/- で数える形を正しいゲートとする) |
| jp 層 | ✅ `questions.json` md5 `24126cf7…` / `question_bank.json` md5 `72ee2ff4…` は適用前後で同一。by_year は変更なし |
| `answer_keys.json` | ✅ md5 `6802bb0bc13004da78ad3c4e5117d997` (不変) |
| D-143 MARK | ✅ explanations 内で `fidfix-S130-t2` 5 題 (q021 / q089 / q062 / q094 / q026)、`fidfix-S130-t2-d171` 54 題。純粋後置、round1 変更 0 |
| 残存 | ✅ jp が略語だけの選択肢で zh / en が jp と異なる field: **0** (corpus 全体、適用前 215)。STEM_GLOSS 119 項目 (§13 後 120) の展開付き文字列の残存: **0** |
| e2e (Playwright) | **未実行** (A2b / T1 と同じ理由。文字列置換だけ) |

### git status (本 unit の変更)

```
 M data/ip/quiz/translations/*.json    (27 / 29 exam。2009h21h・2013h25h 以外)
 M data/ip/quiz/explanations/*.json    (25 exam。note 追記、および 2016h28a / 2017h29a / 2017h29h の解説 en・zh)
?? scripts/quiz-fidfix-S130-t2.mjs
?? evidence/quiz_T2_tr_fix_S130.md
?? evidence/phase5/stage_06_quiz_fidelity/t2_d171_targets_S130.json
```

計 52 data files (translations 27 + explanations 25)、794 insertions / 395 deletions。`.phase1` / `.phase2` は gitignored。
作業ツリーにあるその他の変更 (`scripts/quiz-tr-targets-S130.mjs`、`evidence/phase5/stage_06_quiz_fidelity/t3_targets_S130.json`) は他 lane のもので、本 unit は触っていない。

## 8. ⑨ 新規 / lead 判断を求める点

1. ~~略語の選択肢に付けた jp に無い展開~~ → **lead 判断 D-171 = (a) で是正、§12**。以下は判断前の記録 (§6b)。corpus で 83 題 / 215 field、正解肢にだけ付いた非対称のもの 36 題。A2b の規則 (手掛かりになるなら除去) をそのまま当てると、少なくとも非対称の 36 題、さらに対称でも題幹と直結する題が対象になる。方針案:
   - (a) 略語だけの jp 選択肢には、zh / en も略語だけにする (展開は解説へ回す。決定的な一括変換が可能。題幹の略語は、題幹が説明する概念そのものでなければ据え置く)
   - (b) 非対称の 36 題だけを是正する
   - (c) 現状維持 (⑨ 低)

   fixer の推奨は **(a)**。略語の意味を問う題で展開を見せると題として成り立たない。また選択肢の展開の有無は、jp と比べて訳層にだけ情報が多い状態である。
2. `2015h27a-q021` の解説 (jp / zh / en とも) が MBO を「目標による管理 (Management by Objectives)」として説明している。IT パスポートの経営戦略の文脈では、MBO は通常マネジメントバイアウトである。誤答肢の理由づけ「社会課題に取り組む理念ではない」はどちらの意味でも成り立つ。これは jp 解説の内容の問題で、訳層の問題ではない (未是正)。同じ population の `2017h29a-q021 イ` は zh「管理层收购（MBO）」(= マネジメントバイアウト) で、corpus 内でも揺れている。
3. `2025r07-q068` 題幹の CSIRT 展開 (§6a) → §12b で除去。

## 9. 逸脱 (Rule D 確認点)

1. `2015h27a-q021 イ` (正解肢の CSR 展開) を追加した。agent は エ だけを指摘していた。
2. `2017h29h-q062` と `2021r03-q094` は、agent の cosmetic 判定を「答えの手掛かり」として扱った (正解肢上なので D-143 note を付ける)。

## 10. Rule B

失敗 attempt なし。PHASE 2 の前に、merge の事前確認を zsh の未分割変数のまま回してしまい、25 exam が 1 引数になって merge が「fail」になった (書き込みなし)。exam ごとに分けて回し直し、drift 0 を確認した。データの attempt ではないので `failures/` には起票していない。

## 11. Rule D 待ち

Writer = `t1-fixer` (T2 を担当、`oh-my-claudecode:executor`)。Reviewer は別の subagent_type で、PHASE 2 の後に行う。

---

## 12. 拡張 (lead 判断 D-171): 略語の展開を corpus 全体で除去

D-171: jp の選択肢が略語だけ (展開・訳語なし) なら、zh / en の選択肢も略語だけにする。展開は解説に任せる (**解説は不変**)。題幹の展開は、題幹が説明している概念 = 問われている知識に直結する場合 (`2025r07-q068` CSIRT 型) だけ除去し、それ以外は据え置く。jp 側に展開がある選択肢は触らない。

是正器は `scripts/quiz-fidfix-S130-t2.mjs` の仕事 2。対象の全一覧 (題・field・before → after) は **`evidence/phase5/stage_06_quiz_fidelity/t2_d171_targets_S130.json`** にある。

### 12a. 選択肢 (決定的処理)

- 判定: jp の選択肢が `^[A-Za-z][A-Za-z0-9&-/. ]{1,12}$` (略語・英字の用語だけ) で、zh / en がそれと異なる field。corpus 全体で **215 field / 83 題**
- 自動処理の形は 3 つだけで、置換後は jp の文字列そのもの:
  - 「ABBR（展開）」「ABBR (展開)」: 196 field
  - 「展開（ABBR）」: 17 field (例「企业社会责任（CSR）」「约束理论（TOC）」「蓝牙（Bluetooth）」「局域网（LAN）」)
  - 3 形のどれにも当たらないもの: 2 field → 個別に裁定 (D171_MANUAL)。`2021r03-q026 ウ` (正解肢) は jp「HRTech」に対し、zh「HR 科技(HR Tech)」(訳語 + 原語)、en "HR Tech" (分かち書きだけの差)。どちらも jp どおり「HRTech」にした
- 内訳: 仕事 1 で先に処理する 6 field (`2015h27a-q021 イ・エ`、`2021r03-q094 ア`) + D-171 自動 **207 field / 81 題** + 個別 2 field = 215
- **略語の意味以外の情報を含む展開による除外: 0 件**。全 74 種の略語の展開を目で確認し、いずれも略語の展開か訳語だけで、単位・付加説明は無かった。是正器では、展開に数字が入るものを除外する検査 (`D171_SKIP_RE`) を残している
- 件数 assert: 自動分は 207 field に固定 (`D171_CHOICE_EXPECT`)。違えば中断、0 なら skip。3 形にも D171_MANUAL にも当たらない field が現れたら中断する
- `.phase1/tr_`: 選択肢の文字列が sidecar の before と一致するときだけ同じ置換を当てる (乖離していれば触らずに記録する。PHASE 1 では乖離 0)
- 正解肢に当たる field は 88 (自動分)。正解肢の文字列が変わる題には D-143 note を付ける: D-171 自動 **54 題** (marker `fidfix-S130-t2-d171`、定型文)、`2021r03-q026` (個別、T2 marker)。`2015h27a-q021` / `2021r03-q094` は §4 の note で扱う

### 12b. 題幹 (fixer が裁定)

- 候補: jp の題幹 (400 字以下) にある略語が jp では展開されておらず、zh / en で「ABBR（展開）」または「展開（ABBR）」になっているもの。**108 組 (題 × 略語)**
- 除去 (STEM_GLOSS): **76 組 / 72 題 / 119 項目 (題 × 言語 × 文字列)** (Rule D NIT-1 で 77 → 76 に訂正)。**Rule D MINOR-1 で 1 組追加 → 77 組 / 73 題 / 120 項目** (§13)。基準は「題がその略語の概念そのものを問う」こと: 〜の説明 / 役割 / 目的 / 事例 / 該当 / 分類 / 〜に関する記述 / 〜を導入・作成する目的 / 定義を使う計算 (MTBF・MTTR) / 空欄が略語の意味で決まる (`2014h26h-q007` RFI・RFP) など。例: `2025r07-q068` CSIRT、`2015h27h-q016` RFP、`2025r07-q087` CRL (掲載条件 = 失効で、"Revocation" が答え)、`2016h28h-q099` IrDA (「红外」が無線の答え)
- 据え置き: **32 組** (MINOR-1 で `2014h26h-q052` WAN が除去に移り 31 組)。略語が文脈として出るだけで、問われている知識ではないもの:
  `2009h21h-q089` LAN / `2010h22a-q004` RFP (選定方法を問う) / `2011h23a-q068` LAN / `2011h23tokubetsu-q004` RFP (手順表) / `2013h25a-q057` ISMS (PDCA の段階) / `2013h25h-q006` M&A (問われるのは MBO) / `2014h26a-q024` RFP (手順) / `2014h26h-q052` WAN・LAN (WAN は MINOR-1 で除去に変更、LAN は据え置き) / `2016h28a-q071` ISMS / `2016h28h-q081` OS / `2017h29a-q068` ISMS / `2017h29a-q069` LAN (WEP) / `2018h30a-q015` RFP (評価計算) / `2018h30a-q099` ISMS (リスク評価) / `2018h30h-q058` LAN (スター型) / `2020r02o-q032` EC / `2020r02o-q069` ISMS / `2021r03-q067` ISMS (CIA) / `2022r04-q064` DMZ (列挙の一項) / `2022r04-q068` SSID / `2022r04-q097` IoT (図) / `2023r05-q016` FAQ / `2025r07-q032` SNS / `2025r07-q049` FAQ / `2025r07-q087` PKI (問われるのは CRL) / `2026r08-q099` PC
  - 候補抽出の誤検出 (略語の展開ではない): `2012h24h-q060` (「anonymous FTP（匿名 FTP）」は英語の訳)、`2013h25h-q082` OR (jp 題幹自身が「ORは論理和」と説明)、`2018h30h-q096` (jp 自身が "First-In First-Out" を書いている)、`2021r03-q065` (シャドーIT の原語注)、`2021r03-q079` (SECURITY ACTION は固有名)
- 題幹だけの是正は正解肢の文字列を変えないので、D-143 note は付けない
- `.phase1/tr_` の題幹に同じ文字列があれば同じ置換を当てる (PHASE 1 で 119 項目すべてに存在)

### 12c. 抽検 (before → after、10 件)

| # | id | field | before | after | 正解肢 |
|---|---|---|---|---|---|
| 1 | `2017h29h-q006` | エ zh | 约束理论（TOC） | TOC | ✓ (非対称: 他の略語選択肢は展開なし) |
| 2 | `2016h28a-q090` | ア zh | 蓝牙（Bluetooth） | Bluetooth | |
| 3 | `2017h29a-q021` | イ zh | 管理层收购（MBO） | MBO | |
| 4 | `2018h30a-q008` | ア en | CSR (Corporate Social Responsibility) | CSR | ✓ |
| 5 | `2023r05-q028` | ウ en | TOB (Take-Over Bid) | TOB | |
| 6 | `2021r03-q026` | ウ zh / en | HR 科技(HR Tech) / HR Tech | HRTech / HRTech | ✓ (個別) |
| 7 | `2025r07-q068` | 題幹 en | … carried out as a CSIRT (Computer Security Incident Response Team)? | … carried out as a CSIRT? | — |
| 8 | `2009h21a-q003` | 題幹 zh | 作为基于企业社会责任（CSR）的活动 | 作为基于CSR的活动 | — |
| 9 | `2010h22a-q077` | 題幹 zh | OSS(开源软件) ×3 | OSS ×3 | — |
| 10 | `2014h26h-q069` | 題幹 en | MTTR (mean time to repair) / MTBF (mean time between failures) | MTTR / MTBF | — |

10 件とも、jp の該当箇所 (略語だけ) と一致する形になり、周辺の文は変わらない (dry-run の ✓ 行で確認)。

### 12d. X lane との衝突

- PHASE 1 時点で、本是正器の対象 157 題 (仕事 1 + D-171) のうち 31 題が、X lane が未 commit で変更中の exam (2018h30a / 2018h30h / 2019h31h / 2021r03 / 2023r05) にある。ただし、**対象題の zh / en (stem / choices) は作業ツリーと HEAD で同一** (機械照合、差 0)
- PHASE 2 では、X 各 unit の commit 後の HEAD で dry-run をやり直す。件数 assert (選択肢 207、各 subN の n) が通り、✓ 行が `t2_d171_targets_S130.json` と一致することを確かめてから適用する。X lane が対象 field を変えていれば assert で止まるので、その時は裁定し直す

### 12e. 未是正 (⑨)

- `2011h23tokubetsu-q004 ア`「RFP 説明」/ "RFP (Request For Proposal) briefing": jp が略語だけの選択肢ではない (D-171 の対象外) が、展開が付いている
- `2015h27a-q021` の解説が MBO を目標管理として説明している件 (§8-2)。`2013h25h-q006` (jp「M&Aの手段の一つである MBO」→ 経営陣による買収) から、試験の MBO はマネジメントバイアウトである

## 13. Rule D (PASS-with-notes) の指摘と処置

| 指摘 | 内容 | 処置 |
|---|---|---|
| **MINOR-1** | `2014h26h-q052` zh 題幹「利用自有的广域网（WAN）」の「广域网」が、正解肢エ「广域以太网」(広域イーサネット) と字面で直結し、答えの手掛かりになる (zh のみ。en は展開なし) | ✅ STEM_GLOSS に追加 (「广域网（WAN）」→「WAN」)。sidecar と `.phase1/tr_` の両方。題幹だけの是正なので D-143 note は付けない |
| **NIT-1** | §12b の除去数は 76 組 (77 ではない) | ✅ 訂正した。STEM_GLOSS を実測すると、MINOR-1 の追加前は 76 組 / 72 題 / 119 項目、追加後は 77 組 / 73 題 / 120 項目 |
| **NIT-2** | correct_answer ゲートは `grep -E '^[+-]\s*"correct_answer"'` で数える | ✅ その形で再確認し、0 件 (§7) |
| **NIT-3** | `2016h28a-q089` の jp 解説 (AI 生成で源の文ではない) が、題幹「100年前に1度氾濫したきり」を「100年に1度きり」と読み違えている | ✅ 是正器に EXPL_JP を追加し、`.phase2/expl_jp_2016h28a-q089.json` correct_jp の「氾濫は100年に1度きりで」を「氾濫は100年前に1度あったきりで」に最小限で直した。これで jp / zh / en の解説が題幹と同じ意味になった。note_jp は「100年」に触れていないので触っていない |

再適用の手順: dry-run (applied 3) → 適用前に 2014h26h の merge を回して drift 0 を確認 → `--apply` (applied 3) → `build-quiz-corpus` → `quiz-phase2-merge` を 2016h28a / 2014h26h で実行 → 再 dry-run **applied 0 / skipped 158**。
ゲートの再実行: crosscheck A1–A7 / B1–B7 hold、assert-clean GREEN、chumon `--check` 一致、tsc 0、vitest 562 passed / 2 skipped、next build OK、correct_answer 0 (NIT-2 の形)、questions / question_bank / answer_keys の md5 不変。
最終の git diff は 52 data files (translations 27 + explanations 25)、796 insertions / 397 deletions。
