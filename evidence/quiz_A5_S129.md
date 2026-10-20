# A5 — A3 後続の文字是正 (S129、data lane)

入力: A3 Rule D の MINOR / NIT (`evidence/quiz_A3_S128.md` §10 / Rule D 節)、B3 ⑨ (`evidence/quiz_B3_2014h26a_S128.md` §4c / §4e)、A4 残 (`2014h26h-q085`)。
是正器: `scripts/quiz-fix-S129-a5.mjs` (既定 dry-run、`--apply` で書込み)。3 回に分けて apply (2 回目 = 全庫走査で見つけた D-158 同型 4 題、3 回目 = 主 context 追加の `2013h25h-q061` raw)。apply 後の dry-run は書込み 0 (skipped 167) = 冪等。
correct_answer は 2900 題とも不変 (是正器内で assert、crosscheck A/B 全 PASS)。key_guard (note / round1) は不触。

## 1. 件数

| 項目 | 置換数 (全層計) | 題 | 内容 |
|---|---:|---:|---|
| 1a expl D-157 | 3 | 2 | `2011h23tokubetsu-q090` jp `[RFP の概要]` `[X 社からの提案]` → 〔〕、`2012h24a-q090` zh `[系统导入研讨会备忘录]` → 〔〕 |
| 1b expl D-159 | 84 | 8 | §2 |
| 2 擬似言語の見出し | 14 | 2 | `2023r05-q060` zh `[程序]`→`〔程序〕` (源 p28「〔プログラム〕」)。`2022r04-q096` clean + raw 3 層 `［プログラム1/2］`→`〔プログラム 1/2〕`、zh `［程序 1/2］`→`〔程序 1/2〕` (源 p43「〔プログラム 1〕」、空白あり)。en `[Program]` は D-157 どおり不変 |
| 3 D-158 漏れ | 58 | 14 | §3 |
| 4 `2014h26a-q094` expl zh | 5 | 1 | 〔平均（B53～G53）〕→“平均(B53～G53)” 等 5 式。stem zh (B3 是正後) と同じ “…” 形・ASCII 演算子 (D-162) |
| 5 `2014h26h-q085` 設問文 | 6 | 1 | §4 |
| 6 en キャプション全角空白 | 43 | 30 field | `Figure 1　` / `Figure 2　` / `Table 1　` / `Table　` / `Fig. 3　` → ASCII 空白 (sidecar + .phase1 の en) |
| 7 記号・NIT | 38 | 2 | §5 |
| 8 raw hygiene | 12 | 3 | `2012h24h-q005` stem_jp `| 売上高 | 4,800 |`→`4,000` (源 p03)、`2022r04-q096` stem_jp「関数calcXをcalcY(1)」→「関数calcYを」(源 p43)、**主 context 追加依頼** `2013h25h-q061` 売上表 `| H002 | K02 | 60 |`→`80`・`| H006 | K01 | 30 |`→`| H006 | K02 | 50 |` (源 p26 原寸で H002 K02 80 / H006 K02 50 を確認。H006 は顧客コードも K01→K02。答え イ 佐藤太郎 = 80+50 の導出は表示層で元から成立)。questions.json (tracked) / question_bank / by_year の 3 層を揃えた (clean は元から正、表示層は不触) |
| D-159 表示層の残り | 12 | 4 | `2015h27h-q085〜q088` 前文 (A4 埋め込み) の 退室 `“－1”` → `“−1”` (clean / zh / en、源 p32)。raw に同文なし |

## 2. explanations の D-159 (1b)

対象は表示 field (`correct_jp` / `distractors_jp[].why_wrong_jp` / `points_jp`、tr の zh / en) のみ。負数リテラルだけを U+2212 に。

| id | jp | zh | en | 内容 |
|---|---:|---:|---:|---|
| `2011h23tokubetsu-q093` | 8 | 8 | 8 | `L＝－1` / `－1 を代入` / `J＝－30` / `J＝－5` (A3 是正題の引用) |
| `2011h23tokubetsu-q094` | 0 | 9 | 9 | `赋值－1` / `Assign －1` 等 (jp は元から U+2212)。「＝－」の記号は数字が続かないので不触 |
| `2009h21h-q007` | 5 | 5 | 5 | `(-10)` / `D (-10円)` / `-10 yen` (A3 是正題)。`16+4-2` の減算は不触 |
| `2012h24h-q100` | 2 | 2 | 2 | `－10〜－1` / `=－2` (`8－10` の減算子は不触) |
| `2010h22h-q021` | 3 | 3 | 3 | `=-50` / `-50` (`650-700` は不触) |
| `2010h22h-q082` | — | — | 1 | `+10 and -1` (jp / zh は元から `−1`) |
| `2011h23a-q092` | — | — | 2 | `= -17` / `is -17` (jp / zh は元から `−17`) |
| `2015h27h-q087` | 3 | 3 | 3 | 退室 `“-1”` / `×(-1)` / `+1 / -1` (源 p32 “−1”) |

除外 (理由つき、不触): 減算子 (`2011h23a-q100` `10.8－7`、`2015h27h-q099` `55＋60－30`、`2018h30a-q048` `200万円－180万円`、`2023r05-q004/q055`、`2026r08-q044`、`2012h24a-q095/q096` `m－2`、`2014h26h-q089`、`2016h28h-q098`、`2009h21h-q061`、`2020r02o-q043` `100%-76%`)、指数のキャレット記法 (`10^-9` `2^-1` `n^-1`: `2010h22a-q057` `2010h22h-q052` `2011h23a-q078`)、項目番号のハイフン (`2012h24h-q085` `価格-3` 等、A3 の stem 除外と同じ)、`2012h24a-q029` `(－25 ＋20)` (在庫調整の符号付きの加減、＋と対の演算子として扱う)。事後走査で上記以外の残り 0。

D-157 の補足: A3 §10-5 の `[S社の状況]` / `[システム導入検討会のメモ]` / `【要望事項】` は、explanations では **key_guard.note_jp (final / round1) にしか無い** (非表示、round1 は D-143 で不可触、final は当時の判定記録)。表示 field の旧字形は 1a の 3 箇所だけ。

## 3. D-158 漏れ (3)

源 page 原寸で 14 題ともラベル・キャプションが無いことを確認 (図本体と問題文のみ)。
- 依頼の 3 題: `2014h26a-q031` (p12) / `-q042` (p17) の単独行「［図］」を削除。`-q048` (p19) は「[図] 処理方式の分類（ツリー）:」を行ごと削除 (後ろは AI の題名。A3 `2010h22h-q050` と同じ扱い)。
- 全庫走査で見つけた同型 11 題 (表示 jp の行頭が［図…］/[図…]/〔図…〕):
  - 行ごと削除 (ラベル + AI の題名、内容は次行以降): `2009h21h-q037` (p15、「アローダイアグラム」。凡例行は残る) / `2009h21h-q092` (p37) / `2014h26h-q068` (p27) / `2016h28a-q075` (p28) / `2016h28h-q010` (p05) / `2022r04-q090` (p41) / `2022r04-q097` (p44) / `2009h21a-q069` (p26)
  - 接頭辞だけ削除 (ラベルの後が図の言語化本文): `2010h22h-q057` (p24) / `2015h27a-q048` (p20) / `2019h31h-q026` (p11)
- 各題 jp clean / zh / en (+ .phase1 にある場合) を同時に。前後が空行なら空行 1 つに詰める。raw の「[図]」系 (不可視の言語化層) は不触 (A3 と同じ)。
- 未確認・不触: `2021r03-q074`「〔流れ図X〕〔流れ図Y〕」、`2011h23a-q057` / `2021r03-q070`「〔表記法〕」(見出し形で、源の見出しと推定されるが原寸は未読)。`〔图像…〕`「〔图例〕」は図ラベルではない (画像 / 凡例)。

## 4. `2014h26h-q085` 設問文 (5)

源 p34: 「運用管理部門，販売部門から受領したデータを〔データ管理要領〕に沿って取り扱うとき，データの取扱いに関する記述として，適切でないものはどれか。」
- jp clean: ASCII 読点 `,` ×3 → `，` (源どおり)。
- zh 旧「运营管理部门按照《数据管理要领》处理从销售部门接收到的数据时,…哪一项是不恰当的?」(運用管理部門が主語になっている誤訳 + 《》) → 「按照〔数据管理要领〕处理从运营管理部门、销售部门接收到的数据时，关于数据处理的描述，不恰当的是哪一项？」
- en も同じ誤訳だった → "When data received from the operations management department and the sales department is handled in accordance with the [Data Management Guidelines], which …"
- A4 の前文 (4 段落 + 〔効果予測する項目〕〔データ管理要領〕) は不触 (置換は設問文の 1 文だけ、sidecar n=1 で厳密)。

## 5. 記号・NIT (7)

- `2011h23tokubetsu-q094` 決定表のセル「–」(U+2013) ×3 → 「－」(U+FF0D)。源 p37 の表セル・注記2「－は処理を実行しない」・選択肢表は同一記号で、注記2 / 選択肢 (A3 で記号として保持) が「－」なので表をそれに揃えた (学習者には凡例と表の記号が別字に見えていた)。clean / raw 3 層 / zh / en (+ .phase1)、計 18。
- 同題 expl jp の記号 `1割引=−` `b:−` 等 17 箇所 (U+2212) → 「－」(zh / en は元から「－」)。負数「−1」は不触。
- `2021r03-q070` expl en の 「Author ← Book」「Publisher ← Author」「Publisher ← Author ← Book」 → “”。A3 の除外規則 (← を含む = 擬似言語の代入) に当たったが、ER の表記法でありコードではない。en に日本語約物が表示されていたので D-156 どおり変換し、`2009h21a-q099` “Product table > Unit price table” と揃えた。`2023r05-q064` の擬似言語 `calcX ← …` は除外のまま。
- `2011h23tokubetsu-q100` の混在は A3 で意図的 (コード片のみ保護) → 不触。

## 6. ゲート (最終状態。3 回目 apply 後に build-quiz-corpus / groups --check / crosscheck / assert-clean / tsc / vitest / build を再実行し同結果)

| コマンド | 結果 |
|---|---|
| `node scripts/build-quiz-corpus.mjs` | ✅ |
| `node scripts/quiz-phase2-merge.mjs` 2009h21h 2010h22h 2011h23a 2011h23tokubetsu 2012h24a 2012h24h 2014h26a 2015h27h 2021r03 | ✅ (apply 前に同 9 exam を流して既存差分 0 を確認済) |
| `node scripts/quiz-chumon-groups-build.mjs` / `--check` | ✅ 変更なし (冪等) / 生成結果と一致 |
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran / all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `pnpm --config.verify-deps-before-run=false -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm --config.verify-deps-before-run=false -C apps/web test` | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped |
| `pnpm --config.verify-deps-before-run=false -C apps/web build` | ✅ exit 0 |
| `node scripts/quiz-fix-S129-a5.mjs` (再 dry-run) | ✅ files to write 0 |

explanations の機械照合: 9 file、変更 field 71、すべて表示 field (correct / distractors / points の jp・zh・en)、字数は全 field で不変 (1 字 ↔ 1 字の置換のみ)、key_guard の差分 0。

## 7. 抽検 (源 page PNG 原寸、12 件)

| # | 箇所 | 源 | 結果 |
|---|---|---|---|
| 1 | `2022r04-q096` 〔プログラム 1〕〔プログラム 2〕 | 2022r04 p43 | 一致 (〔〕・空白あり) |
| 2 | `2022r04-q096` raw「関数calcYをcalcY(1)」 | 2022r04 p43 | 一致 |
| 3 | `2023r05-q060` 〔プログラム〕 (zh 〔程序〕の根拠) | 2023r05 p28 | 一致 |
| 4 | `2014h26a-q031` ラベル無し | 2014h26a p12 | 一致 |
| 5 | `2014h26a-q042` ラベル無し | 2014h26a p17 | 一致 |
| 6 | `2014h26a-q048` ラベル・題名無し | 2014h26a p19 | 一致 |
| 7 | `2016h28h-q010` / `2022r04-q090` / `2022r04-q097` ラベル無し | 2016h28h p05 / 2022r04 p41 / p44 | 一致 |
| 8 | `2009h21h-q037` / `-q092`、`2014h26h-q068`、`2016h28a-q075` ラベル無し | 2009h21h p15 / p37、2014h26h p27、2016h28a p28 | 一致 |
| 9 | `2009h21a-q069` / `2010h22h-q057` / `2015h27a-q048` / `2019h31h-q026` ラベル無し | p26 / p24 / p20 / p11 | 一致 |
| 10 | `2014h26h-q085` 設問文 (両部門から受領・「，」) | 2014h26h p34 | 一致 |
| 11 | `2011h23tokubetsu-q094` 表セルと注記2 が同一記号「－」 | 2011h23tokubetsu p37 | 一致 |
| 12 | `2015h27h` 中問A 退室 “−1” / `2012h24h-q005` 売上高 4,000 | 2015h27h p32 / 2012h24h p03 | 一致 |
| 13 | `2013h25h-q061` 売上表 H002 K02 80 / H006 K02 50 | 2013h25h p26 | 一致 |

## 8. tracked 変更 (26 file + 新規 2)

`data/ip/quiz/questions.json`、`data/ip/quiz/explanations/*.json` 9、`data/ip/quiz/translations/*.json` 16 (2009h21a 2009h21h 2010h22a 2010h22h 2011h23tokubetsu 2012h24h 2013h25a 2014h26a 2014h26h 2015h27a 2015h27h 2016h28a 2016h28h 2019h31h 2022r04 2023r05)、新規 `scripts/quiz-fix-S129-a5.mjs`、本書。gitignored: question_bank / by_year (2011h23tokubetsu 2012h24h 2013h25h 2022r04)、`.phase1` tr_、`.phase2` expl_jp / expl_tr。B4 の `.phase2/b4_*` は不触。
- 主 context 追加依頼 (S129): `2013h25h-q061` raw stem_jp の売上表 `| H002 | K02 | 60 |`→`| H002 | K02 | 80 |`、`| H006 | K01 | 30 |`→`| H006 | K02 | 50 |` (源 p26 原寸一致、H006 は顧客コードも K01→K02)。question_bank / by_year (gitignored) と questions.json (tracked、raw stem_jp) の 3 層。表示層 (translations の stem_jp_clean / zh / en) は不触。適用後 keys-crosscheck all invariants hold / groups --check 一致 / assert-clean GREEN / tsc / vitest 562 / build exit 0。

## 9. 後続へ (未是正、理由)

- explanations jp の表計算式の演算子 (`2014h26a-q094` jp「B52＊B53」「H54／H52」等、引用符なしの地の文) を D-162 の ASCII にするか — 全庫の expl 式を走査する別 unit が要る。本 unit は区切りの食い違いがある zh だけを直した。
- `2014h26a-q094` expl en の `[average(B53 to G53)]` 型の角括弧 (stem en は “…”) — 依頼の範囲外、記録のみ。
- `2015h27a-q048` jp clean の「xか？」「yか？」(源は “xか?” と全角でない ?、“” 区切り) — 本 unit の範囲外 (源照合の fidelity lane へ登記)。
- `2021r03-q074` / `〔表記法〕` 2 題の源原寸確認 (§3 末尾)。
- en の他の全角空白 (枠の字下げ・`amount　＝` 等) は空欄や式の字下げで、キャプションではないので範囲外。

## 10. Reviewer 確認点

1. D-158 を依頼の 3 題から同型 14 題に広げた判断と、接頭辞だけ外した 3 題 / 行削除 11 題の区別 (§3)。
2. explanations の D-159 を A3 是正題 3 題から全庫の負数リテラル (8 題) に広げ、`2015h27h` 前文 stem 4 題も含めた点、除外一覧 (§2、特に `2012h24a-q029`)。
3. `2014h26h-q085` の zh / en 新訳 (§4)。en も同時に直した。
4. `2011h23tokubetsu-q094` の表セル・expl jp 記号を「－」に揃えた点 (§5)。
5. `2021r03-q070` expl en を A3 の除外から外した点 (A3 reviewer NIT は「文書化のみ」想定だったが、en に「」が見えていたため変換)。
