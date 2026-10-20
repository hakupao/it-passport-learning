# S130 D-172 読点・範囲記号走査 (R1 + R3) — Rule D reviewer + Rule A 独立抽検

- reviewer: punct-reviewer (verifier 型、writer = executor punct-scope とは別 agent / 別 subagent_type)。READ-ONLY (本 file のみ作成)。
- 対象: 未 commit diff `data/ip/quiz/questions.json` + `translations/*.json` ×29 (HEAD = 13a6b22)。script `scripts/quiz-punct-sweep-S130.mjs --tier=r1r3`。
- 補助 script (scratchpad、非 commit): `diffcheck.mjs` (HEAD ↔ 作業木の JSON 全 string leaf 比較)、`prot.mjs` (変化位置の保護区間を独立判定)、`sample.mjs` (seed 4040 の層別抽出)。

## 1. diff の字形検査 (全数)

HEAD と作業木の 30 file を JSON で全走査し、変化した string を 1 字ずつ比較 (長さ不変・差分字は許可表だけ)。

| 項目 | 結果 |
|---|---|
| 変化 string | 740 (questions.json `stem_jp` 237 / `choices_jp.<L>` 175、translations `stem_jp_clean` 328) |
| 許可外の差分 (長さ変化・他字形・非 string) | **0** |
| 差分字種 | `、→，` 1,506 / `〜→～` 439 / `~→～` 25 のみ |
| zh / en / 解説 / その他 key の変化 | **0** (変化 key は上の 3 種だけ) |
| 変化位置の保護区間判定 (独立 heuristic) | code-line / backtick / fence / ASCII 引用内の変化 0。式内 (括弧+セル番地) は 〜→～ 9 件 = writer 差分 apply の 2013h25h-q093 エ・q096 題幹/エ・2014h26a-q093 ア〜エ (D-172 delta、源で波形を確認済) と、heuristic の誤検出 1 (2017h29h-q091 散文「（晴れ，曇り，雨）」) |
| probe 窓 8 題 (2012h24h-q089〜092・2015h27a-q089〜092) + COPY marker 2011h23a-q093 の `stem_jp_clean` | 9/9 HEAD と同一 |

## 2. ゲート (fresh 実行)

| check | 結果 |
|---|---|
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✓ 登記簿は生成結果と一致 (exit 0) |
| `node scripts/quiz-keys-crosscheck.mjs --require-raw` | ✓ all invariants hold (A1–A7, B1–B7) |
| `node apps/web/node_modules/vitest/vitest.mjs run --root scripts --globals quiz-fidelity-machdiff` | 42 passed (S128_L1a の起動法。`npx vitest --root scripts` は root に vitest が無く起動不可) |
| `apps/web` vitest | 38 files passed / 1 skipped、563 passed / 2 skipped |
| `git diff -U0 data \| grep -cE '^[+-]\s*"correct_answer"'` | **0** |
| `node scripts/quiz-punct-sweep-S130.mjs --tier=r1r3` (dry-run) | fields changed 0, layer writes 0 (冪等) |

## 3. Rule A 独立抽検 N=40

母集団 = 変化 field 602 (表示層単位: 題幹は clean 層があれば clean、無ければ raw / 選択肢は choices_jp; 加えて clean 不変で raw だけ変わった題幹)。seed 4040 LCG、exam 重複を後回しにする非復元抽出。層 = 保護区間境界 12 (kept 理由あり or 引用・数値区切り・セル番地・←を含む) / R3 13 / R1 15。23 exam。源 = `data/ip/exams/pages/<exam>/page-NN.png` (bank `source.page_number`、中問は前文頁も確認) を原寸で実読。

| # | 層 | field | 頁 | 規則 | 照合 |
|---:|---|---|---|---|---|
| 1 | 境界 | 2013h25h-q087 ア | p37 | R1 | 源「“メールの返信”を選択して，」「記述し，」と一致。“” 引用は不変 |
| 2 | 境界 | 2011h23tokubetsu-q056 stem (raw) | p20 | R1 | 源「規格は図のような相似形であり，」と一致。raw の図言語化「A3，右上がA4，」も ， |
| 3 | 境界 | 2025r07-q076 stem | p36 | R1 | 源「入力されており，セル B4～B6」「セル C5，C6に複写」と一致。式選択肢は対象外 |
| 4 | 境界 | 2009h21h-q087 stem | p33 | R3 | 源「セル A1 ～ A10」「B1 ～ B10」「C1 ～ C9」波形と一致 |
| 5 | 境界 | 2013h25a-q014 stem | p6 | R1 | 源「“販売の機会損失の低減”が設定されたとき，」と一致、引用不変 |
| 6 | 境界 | 2017h29h-q020 stem | p9 | R1 | 源「PC があり，」「最低1冊，」「場合，」と一致。表の 15,000 / 13,000 / 5,000 は digit,digit で不変 |
| 7 | 境界 | 2020r02o-q033 stem | p15 | R1 | 源「A 社は，」「広告は，」と一致。100,000 / 1,000 / 200,000 不変 |
| 8 | 境界 | 2016h28a-q085 ウ | p31 | R1 | 源「POP3 は，企業や学校に」と一致 |
| 9 | 境界 | 2010h22a-q089 stem | p35 (前文) | R3 | 源「発送先の地区（A～D）」波形と一致。料金表 1,300 等不変 |
| 10 | 境界 | 2014h26a-q093 エ | p43 | R3 (式内) | 源「条件付個数($B2 ～ $B36，＝$A40)」と一致。式区切り ， は既存 |
| 11 | 境界 | 2015h27a-q072 stem | p30 | R3 | 源「a ～ c のうち，」と一致、“売上” 表等の引用不変 |
| 12 | 境界 | 2022r04-q096 stem | p43 | R1 | 源「関数 calcY は，」「呼び出すと，」と一致。擬似言語行「整数型: num, i」は code-line で不変 (源も ASCII 風 ,) |
| 13 | R3 | 2013h25h-q092 stem | p39 (前文) | R3 | 源「平日9:00～19:00」「9:00～18:00」と一致 |
| 14 | R3 | 2024r06-q049 stem | p21 | R3 | 源「記述 a～c の」と一致 |
| 15 | R3 | 2014h26a-q056 stem | p23 | R3 | 源「記述①～③のうち」と一致 (同 field の ASCII「, 」は R2 対象外で残置) |
| 16 | R3 | 2013h25a-q044 stem (raw) | p16 | R3 | 源「① ～ ③のうち」と一致 |
| 17 | R3 | 2010h22a-q080 stem | p31 | R3 | 源「次の a～c のうち」と一致 |
| 18 | R3 | 2025r07-q001 stem | p2 | R1 R3 | 源「作業形態 a ～ c のうち，」「B 社の従業員が，A 社内において，」と一致 |
| 19 | R3 | 2015h27a-q052 stem | p21 | R3 | 源「a ～ c に分けて」と一致 (「作業を, 」ASCII は R2 対象外) |
| 20 | R3 | 2022r04-q082 stem | p37 | R3 | 源「認証機能 a ～ c のうち」と一致 |
| 21 | R3 | 2018h30h-q075 stem | p34 | R3 | 源「A ～ Z の26種類」と一致 |
| 22 | R3 | 2014h26h-q054 stem | p20 | R3 | 源「記述 a～d のうち」と一致 |
| 23 | R3 | 2011h23a-q074 stem | p28 | R3 | 源「説明 a～d の組合せ」と一致 |
| 24 | R3 | 2017h29h-q089 stem | p36 | R3 | 源「用語 a ～ d のうち」と一致 |
| 25 | R3 | 2012h24h-q066 stem | p23 | R3 | 源「a～c のうち」と一致 |
| 26 | R1 | 2016h28a-q089 stem (raw) | p33 | R1 | 源「A 社では，」「結果，」「検討したが，」「きりで，」と一致 |
| 27 | R1 | 2009h21h-q082 stem (raw) | p31 | R1 | 変化は raw の図言語化「①→③→②→④，時間は」。源本文の読点 ，と同字形 |
| 28 | R1 | 2015h27a-q018 ウ | p9 | R1 | 源「販売開始を待って，」と一致 |
| 29 | R1 | 2011h23a-q032 stem | p13 | R1 | 変化は AI 図言語化 (凡例・軸の説明) の読点。源本文は ，。D-172 で表示散文として対象 |
| 30 | R1 | 2019r01a-q016 stem | p8 | R1 | 源「目的として，最も」と一致 |
| 31 | R1 | 2009h21a-q089 stem | p33 | R1 | 変化は図言語化「図（DFD，」。源本文「a，b に入る」も ， |
| 32 | R1 | 2017h29h-q096 stem (raw) | p39 | R1 | 源「記述として，適切な」と一致 |
| 33 | R1 | 2010h22h-q089 stem (raw) | p38 (印字 37) | R1 | 源「S さんは，」「図において，」「作業として，」と一致 |
| 34 | R1 | 2026r08-q092 ウ | p45 | R1 | 源「発見されたときに，」と一致 |
| 35 | R1 | 2015h27h-q036 ア | p14 | R1 | 源「ために，スケジュール，予算，」と一致 |
| 36 | R1 | 2013h25h-q085 イ | p36 | R1 | 源「2日前に，」と一致 |
| 37 | R1 | 2025r07-q091 stem (raw) | p42 | R1 | 字形は ， で源の読点と同型だが、位置は raw OCR の行跨ぎ残骸「これ 、 らに」(源は「これらに」、句読点なし)。表示 clean は「これらに」で正しい → NIT (非表示 raw の既存ノイズ、本走査の誤りではない) |
| 38 | R1 | 2016h28h-q086 ウ | p38 | R1 | 源「盗聴し，パスワードなど」と一致 |
| 39 | R1 | 2011h23tokubetsu-q099 ウ | p41 | R1 | 選択肢は図。変化は図言語化「合流し，」の読点 (源本文は ，) |
| 40 | R1 | 2012h24h-q097 stem (raw) | p45 | R1 | 源「数字の場合，13桁目」と一致 |

**結果**: 40/40 で新字形 (， / ～) が源の字形と一致 (図言語化の散文 4 件は源本文の読点字形と一致、D-172 の対象規定どおり)。保護区間 (位取り 6 field 分・擬似言語 code-line・“”引用・式内の区切り) は抽検範囲で全て不変。40 field の after に 、 / 〜 / ~ の残存 0。#37 のみ raw 層の既存 OCR 残骸 (表示に出ない) を NIT として記録。

## 4. 判定 (Rule D)

**PASS-with-notes** — MAJOR 0 / MINOR 0 / NIT 2
- NIT-1: 2025r07-q091 raw `stem_jp` (questions/bank/by_year) の「これ ， らに」は OCR 行跨ぎ残骸 (源は句読点なし)。表示層は正しく、走査は字形を置換しただけ。raw の残骸除去は別項目。
- NIT-2: evidence §7 の `npx vitest run --root scripts` 相当は root に vitest が無いため、`node apps/web/node_modules/vitest/vitest.mjs run --root scripts --globals` で起動する (S128_L1a の手順)。evidence に起動法を明記すると再現しやすい。
