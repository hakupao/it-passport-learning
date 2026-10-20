# T3: 訳層照合 (段 3、方式 D) の是正 — ⑤-2 excluded 392 題 (S130)

D-150 §4 段 3。⑤-2 の excluded 392 題 (S130 の X track X1〜X4 で jp 層を源照合した題) について、jp 表示層 (= 正) と zh / en を照合した T3 run の結果を是正した。手順は T1 / T2 (`evidence/quiz_T1_tr_fix_S130.md` / `evidence/quiz_T2_tr_fix_S130.md`) と同じ。入力準備は `evidence/quiz_T3_tr_prep_S130.md`。

---

## 1. 入力と実行

- 結果 JSON: `evidence/phase5/stage_06_quiz_fidelity/t3_tr_fidelity_sn.json` (Sonnet、batch 5、画像なし、392 題、jp_history あり 16 題)
- マニフェスト: `data/ip/quiz/.phase2/t3_tr_input.json`。**適用前の sidecar と zh / en 3,920 field がすべて一致** (fixer が機械照合)
- 是正器: `scripts/quiz-fidfix-S130-t3.mjs` (T1 / T2 と同じ構造。既定は dry-run)
- HEAD `cb7678c` (T2 commit 後)。作業ツリーの data は clean の状態から始めた (他 lane の書き込みなし、D-152 lock 保持)
- D-171 (略語の展開除去) は T2 で corpus 全体に適用済み。本 unit の対象には D-171 の残りが無い (T2 §7 の残存 0)

## 2. 命中率

| | 題 | 差分 (field × 言語) |
|---|---:|---:|
| 対象 | 392 | — |
| CLEAN | 389 | — |
| DISCREPANT | **3 (0.8%)** | 19 (すべて cosmetic、正解肢上 2 = `2023r05-q059 エ` zh / en) |
| 採用 | **3 題** | **11** (q059 のラベル 8、q002 の 2、q072 の 1) |
| 不採用 | — | **8** (q059 の主キー注記 ×8、§5) |

X track が jp を直すときに、多くの題で zh / en も揃えていたので、収量は低い (A2b と同じ傾向)。

## 3. `2023r05-q059` の表名ラベル — X2 の jp 是正に揃える

- X2 (`evidence/quiz_X2_S130.md` §4a) は jp 選択肢 ア〜エ から表名ラベル「会員 |」を除いた。源 (p27) の選択肢は枠だけで表名が無く、parseChoice がラベルを偽の列「会員」として描画していたためである (エ = 正解肢)。X2 は zh / en の生 HTML `<u>` を除き、主キー注記「（主键）」/ "(PK)" は描画補助として残した。
- 訳層には「会员：| …」/ "Member: | …" が残っていた。現行の描画 (`parseChoiceWithHint`) では、これは偽の列ではなく **caption「会员」/ "Member"** として出る。jp には caption が無い。
  - 是正前の zh: `{"kind":"tables","tables":[{"caption":"会员","header":[…4 列]}]}` / jp: `{"kind":"tables","tables":[{"caption":null,"header":[…4 列]}]}`
- 源にも jp にも表名は無いので、zh / en のラベルも除く (X2 と一貫させる)。除去後の形は「会员编号（主键） | … |」(行頭の `|` を付けない)。**描画は jp と同じ `tables` 1 枚・caption なし・列数一致** (ア 2 / イ 3 / ウ 3 / エ 4)。`apps/web/src/lib/quiz/quizRichText.ts` の `parseChoiceWithHint` を jiti で直接呼び、4 肢 × 2 言語を確認した。
  - 行頭に `|` を付ける形 (`| 会员编号（主键） | …`) にすると、描画は `table` (rows 0) になり jp の形 (`tables`) と変わる。そのため採らなかった。
- 置換は「会员：| 会员编号」→「会员编号」/ "Member: | Member Number" → "Member Number" (4 肢とも第 1 列が会員番号)。是正器の subN は空文字への置換を事後確認できないので、第 1 列まで含めた形にした。

## 4. 採用した差分

| id | 層 | before → after | 根拠 | 種別 / 正解 |
|---|---|---|---|---|
| `2023r05-q059 ア〜エ` | zh / en | 「会员：\| 会员编号（主键） \| …」→「会员编号（主键） \| …」/ "Member: \| Member Number (PK) \| …" → "Member Number (PK) \| …" | §3。源・jp に無い表名 (描画では caption) | cosmetic / **エ = 正解肢** |
| `2019r01a-q002` | zh / en stem (+ 解説 correct・points[1] の zh / en) | 「持有股票的应收股利」×2 →「持有股票的股利收入」/ "the dividends receivable on (its) held shares" ×2 → "the dividend income from (its) held shares" | jp「受取配当金」は受け取った配当で、営業外収益に入る。訳の「应收股利」/ "dividends receivable" は未収の債権 (資産) で、勘定の性質が違う。計算 (経常利益 = 営業利益 + 営業外収益 − 営業外費用) の前提と食い違う語なので直した。解説も同じ語で「营业外收益に含まれる」と説明していたので追随させた | cosmetic (agent) / 題幹 |
| `2015h27a-q072` | zh stem (+ 解説 correct zh の引用) | 「最近 1 个月按商品（单品）的销售额排行榜」→「最近 1 个月按商品的销售额排行榜」 | jp「商品別」に無い補足「（单品）」(SKU 単位)。答え (c は作成できる) には影響しないが、jp に無い限定を加えている | cosmetic / 題幹 |

- `.phase1/tr_` の 3 題すべてに同じ置換が当たった (skip 0)。
- jp 3 層には触れていない (是正器はこれらを読み込みも書き込みもしない。note の page 番号を出すため question_bank を読むだけ)。

### D-143 (final note 追記、round1 不可触)

追記した 1 題: `2023r05-q059` (正解肢エの文字列が変わる。ラベルの除去だけで導出・correct_answer=エ は不変。marker `fidfix-S130-t3`)。
追記しなかった題: `2019r01a-q002` / `2015h27a-q072` (題幹の cosmetic で、選択肢は不変)。

## 5. 不採用

| id | 層 | 理由 |
|---|---|---|
| `2023r05-q059 ア〜エ` の主キー注記「（主键）」/ "(PK)" (8 field) | zh / en | 源 (p27) は選択肢の主キーに**下線**を引いている。題幹も「表中の下線は主キーを表し」と言っている。jp 表示は下線を表現できず落としているが、zh / en の注記は源の情報を訳層で表したもので、jp に無い追加情報ではない。X2 も「描画補助として保持」と判断していて、それと一貫させる。jp 側の下線欠落は X2 の ⑨ (stem の表を含む) に残っている |

## 6. CLEAN 抽検 (Rule A、10 題)

- 母集団: CLEAN 389 題。jp_history ありの CLEAN 15 題から 3 題、それ以外 374 題から 7 題を選んだ。いずれも id 昇順の xorshift32 Fisher–Yates (**seed 20261021**) の先頭
- jp_history あり: `2022r04-q059` (X4 の表見出し) / `2023r05-q075` (X2 の ≧・'…') / `2016h28h-q022` (X1 の表)
- それ以外: `2025r07-q062` `2016h28a-q060` `2018h30h-q091` `2017h29h-q003` `2018h30h-q100` `2019r01a-q045` `2019r01a-q069`
- **semantic の見落とし 0 / 10、cosmetic 0 / 10**
- 所見 (欠陥としない):
  - `2022r04-q059`: X4 で jp 選択肢が「| | 平均値 | 中央値 |」+ 行ラベル「ア」の 3 列表になった。zh / en は「均值 / 中位数」(Mean / Median) の 2 列表で、行ラベルが無い。描画を確認すると、どちらも見出しと値が正しく対応していて、行ラベルの有無だけが違う (選択肢記号と同じなので情報は欠けていない)
  - `2023r05-q075`: X2 で jp を ≧・'…' に直した。zh / en も同じ形になっている (en は '合格' を 'Pass' に訳しているが、題幹の表の C2「Pass」と一致する)
  - `2019r01a-q069 ウ` zh「社交网络服务（SNS）」: 散文の選択肢の中の略語注で、D-171 の対象 (jp が略語だけの選択肢) ではない。誤答肢で手掛かりにならない

## 7. ゲート

| ゲート | 結果 |
|---|---|
| 適用前: `quiz-phase2-merge.mjs` を対象 3 exam (2015h27a / 2019r01a / 2023r05) で先に実行 | ✅ `git status data/` clean (drift 0) |
| fidfix dry-run → `--apply` | ✅ **applied 30 / skipped 0** (sidecar 12 置換 + `.phase1` 12 + 解説 5 + note 1)、files 9 |
| 再生成: `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs` ×3 exam | ✅ |
| fidfix dry-run 再実行 | ✅ **applied 0 / skipped 30** |
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / **all invariants hold (A1–A7, B1–B7)** |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ `chumon_groups.json は生成結果と一致` |
| `pnpm --config.verify-deps-before-run=false -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm … -C apps/web lint` (eslint) | ✅ exit 0 (0 errors、既存 warning 1 = `RetroGlossary.tsx` `tTerm`) |
| `pnpm … -C apps/web test` (vitest) | ✅ **38 passed / 1 skipped (39 files)、562 passed / 2 skipped (564 tests)** |
| `pnpm … -C apps/web build` | ✅ exit 0 (`Compiled successfully`) |
| `node --check scripts/quiz-fidfix-S130-t3.mjs` | ✅ |
| `correct_answer` 差分 | ✅ **0** (`git diff -U0 data \| grep -cE '^[+-]\s*"correct_answer"'` = 0) |
| jp 層 | ✅ `questions.json` md5 `24126cf7…` / `question_bank.json` md5 `72ee2ff4…` は適用前後で同一。by_year は変更なし |
| `answer_keys.json` | ✅ md5 `6802bb0bc13004da78ad3c4e5117d997` (不変) |
| D-143 MARK | ✅ explanations 内の `fidfix-S130-t3` は 1 (2023r05-q059)。純粋後置、round1 変更 0 |
| q059 の描画 | ✅ 4 肢 × zh / en とも jp と同じ `tables` 1 枚・caption なし・列数一致 (§3) |
| e2e (Playwright) | **未実行** (T1 / T2 と同じ理由。文字列置換だけ) |

### git status (本 unit の変更)

```
 M data/ip/quiz/explanations/{2015h27a,2019r01a,2023r05}.json
 M data/ip/quiz/translations/{2015h27a,2019r01a,2023r05}.json
?? scripts/quiz-fidfix-S130-t3.mjs
?? evidence/quiz_T3_tr_fix_S130.md
```

計 6 data files、17 insertions / 17 deletions。`.phase1` / `.phase2` は gitignored。
作業ツリーにあるその他の変更 (`docs/discussion/2026-10-20-session-130.md`、`scripts/quiz-tr-targets-S130.mjs`、`evidence/phase5/stage_06_quiz_fidelity/t3_*`、`evidence/quiz_T3_tr_prep_S130.md`) は lead / prep lane のもので、本 unit は触っていない。

## 8. ⑨

- `2023r05-q059` の jp 表示は、源の下線 (主キー) を題幹の表でも選択肢でも表していない (X2 の ⑨ に既にある)。zh / en は選択肢でだけ「（主键）」/ "(PK)" で表している。jp 側の表記規約が決まった時に、3 言語を揃え直す。

## 9. 逸脱 (Rule D 確認点)

1. q059 の主キー注記 8 field を不採用にした (§5)。agent の指摘は「jp に無い」で、源と照らすと情報の追加ではないため。
2. q059 のラベル除去の形 (行頭の `|` なし) は、描画の形を jp に一致させるために選んだ (§3)。

## 10. Rule B

- 是正器の dry-run 1 回目が、q059 で `to` を空文字にした置換の事後確認に失敗して abort した (空文字の出現数は数えられない)。書き込みは起きておらず、データの attempt ではないので `failures/` には起票していない。第 1 列まで含めた形 (§3) にして、2 回目で通った。

## 11. Rule D 待ち

Writer = `t1-fixer` (T3 を担当、`oh-my-claudecode:executor`)。Reviewer は別の subagent_type で行う。

審査の重点:
1. §3 / §5 の q059: ラベルは除去し主キー注記は保持する線引き、描画確認の方法
2. §4 の q002 (受取配当金 = dividend income / 股利收入) の訳語
3. §6 の CLEAN 抽検。fixer の標本と重ならない題での追加抽検を推奨する
