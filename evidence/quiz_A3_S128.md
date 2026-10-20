# A3 — D-156〜D-160 の文字是正 (S128、data lane)

D-157〜D-160 (S128 log §6) と D-156 (§5) のデータ是正。入力 = L2b `evidence/S128_L2b_scans.md/.json`、L2e `evidence/S128_L2e_textbook_numbers.md`。
是正器: `scripts/quiz-fix-S128-a3.mjs` (既定 dry-run、`--apply` で書込み)。apply 後の dry-run は全 0 (skipped 219) = 冪等。
correct_answer は 2900 題とも不変 (是正器内で assert、crosscheck A/B 全 PASS)。

## 1. 件数

| 決定 | 置換数 (全層計) | 題 | 内容 |
|---|---:|---:|---|
| D-157 節見出し 〔〕 | 63 | 21 題 (jp 7 題はすべて zh 対象 21 題に含まれる) | 下記 §2 |
| D-158 AI 図ラベル | 34 | 9 | キャプション化 2 題 / 行削除 7 題 (§3) |
| D-159 負号 U+2212 | 92 | 8 | jp 10 箇所 → 実数は §4 |
| D-160 figure_description | 31 | 7 | bank / by_year 14 + textbook 複写 17 (§5) |
| D-156 en 「」→“” | 2,690 対 | sidecar・.phase1 49 field + expl_tr 581 題 | 除外 77 対 (§6) |
| key_guard final note | 2 | 2 | 正解肢の字形のみ変更: `2011h23tokubetsu-q095` イ / `2012h24h-q052` ウ。round1 不可触 |

## 2. D-157 (節見出しの括弧)

- jp (clean + .phase1、raw は崩れていない 2 題のみ): `2010h22h-q098` `2012h24a-q090` `2012h24a-q099` `2012h24h-q094` (raw も) `2013h25a-q099` (【→〔 ×2) `2015h27a-q071` (raw も) `2020r02o-q094`。源は L2b §1.3 が 8/8 原寸照合済 (本 lane で再読せず)。`2015h27h-q025` jp は B1 で是正済 → 確認のみ (clean `〔業務プロセス〕`)。
- raw 不触 (崩れ、不可視、N5): `2010h22h-q098`「(S社の状況]」/ `2012h24a-q090`「[…メモ]〕]」/ `2012h24a-q099`「[…仕組み〕」/ `2013h25a-q099`「【要望事項〕」「[要望事項】」/ `2020r02o-q094`「[インシデント]〕」(機械的に当てると「〔インシデント〕〕」になるため明示的に除外)。
- zh を jp に追随: L2b の 14 題のうち 13 (`2012h24h-q093/q095/q096` `2015h27a-q007` `2020r02o-q068` `2016h28h-q040/q051` `2017h29a-q079/q096` `2017h29h-q071/q090` `2019h31h-q053/q096`。`2009h21h-q091` は D-158 で行削除) + jp 是正 7 題の zh (`2012h24h-q094` は 2 見出し) + `2015h27h-q025` zh `[业务流程]` (B1 が残した分)。en は [ ] のまま。
- 事後: L2b 走査を再実行し、表示 jp の見出し役で 〔〕 以外 0、jp が 〔〕 の題で zh 見出しが 〔〕 以外 0。

## 3. D-158 (AI が付けた図ラベル)

解釈 (**Reviewer 確認点 1**): 「削除」を次のように適用した。
- 源に図のキャプション (図1 / 図2) があり、題文が「図1の…図2のように」と参照する 2 題 → 括弧だけ外して corpus のキャプション形 (`図1　…`、14 例) に揃えた。ラベルごと消すと 2 つの説明ブロックのどちらが図1 か分からなくなるため。
  - `2010h22a-q072` 【図1】【図2】→「図1　」「図2　」(zh 图1/图2、en `Figure 1　`)。源 page-28 キャプション「図1」「図2」(L2b)
  - `2013h25a-q052` [図1] [図2] → 同上。源 page-18 (本 lane 原寸): 図の下に「図 1」「図 2」
- 源に見出しもキャプションも無い 7 題 → ラベル行を削除 (直後の空行も詰め、空行 3 連は作らない)。本文は「図の…」「次の流れ図は…」で図を参照しており文は切れない。
  - `2010h22h-q035` (p16、〔凡例〕は源にあるので残す) / `2015h27a-q008` (L2b) / `2016h28h-q078` (p35) / `2023r05-q086` (p40) / `2009h21h-q091` (L2b) / `2010h22h-q050` (p22、en `[Part of the flowchart]` も) / `2022r04-q079` (L2b、en はラベル無し)
- raw の「[図] 流れ図:」型 (不可視の言語化層) は触らない。

## 4. D-159 (負号)

- 実数: 表示 jp の負号は L2b の 13 箇所 / 「6 題」(実際は 7 題) に、**L2b の規則が拾わない「合計金額に－1を代入する」(かな直後) 5 箇所** (`2011h23tokubetsu` 中問B 前文 q093〜q096 + q094 決定表) を加えた。源 page-35「合計金額に−1 を代入する」で負の 1。q093 の stem 内で字形が混在しないよう同時に当てた (**Reviewer 確認点 2**)。
- 是正した jp: `2009h21h-q007` (表 -10) / `2017h29a-q020` (表 -20 ×2) / `2011h23tokubetsu-q093` (前文 + 図1 L＝－1) / `-q094` (前文 + 決定表) / `-q095` (前文 + 選択肢イ・エ e:－1) / `-q096` (前文) / `2012h24h-q052` (選択肢ア〜エの下限)。既に U+2212: `2011h23a-q024` / `2026r08-q003`。zh / en は同じ位置の負数だけ (`赋值 －1` / `assign －1` / `Assign －1` 等)。raw は同じ文字列がある箇所のみ。
- 除外: `2012h24h-q085` 選択肢「価格-1」(項目番号のハイフン)、`2024r06-q085`「(2のi乗)−1」(減算)、`2011h23tokubetsu-q094`「－は処理を実行しない」「c:－」(記号)、決定表の `–` (U+2013)、`2022r04-q079`「x － y」(減算子)。
- 源: `2009h21h-q007` / `2026r08-q003` は L2b、`2017h29a-q020` p10 (営業外損益 −20 ×2)・`2011h23tokubetsu` p35 (前文) / p36 (図1 L＝−1) / p38 (q095 選択肢イ・エ e = −1)・`2012h24h` p18 は本 lane 原寸。

## 5. D-160 (figure_description)

| id | 源 (本 lane 原寸) | 是正 |
|---|---|---|
| `2019r01a-q002` | p03 | 788→780、138→130、「法人税等58」→「法人税，住民税及び事業税50」(項目名も源どおり) |
| `2026r08-q003` | p03 | 投資戦略b 悪化 8→0 |
| `2021r03-q050` | p23 | 68→60 (移動・F)、156→150、19→10、D ?→60、項目名 (B ログイン画面起動処理 / D ログイン後のアプリケーション起動処理 / F)、【条件】→〔条件〕、（起動開始）を補う |
| `2012h24h-q005` | p03 | 売上高 4,800→4,000 |
| `2013h25h-q099` | p48 | **全面書換え** (下記) |
| `2012h24a-q086` | p34 | 牛丼 39.9→30.9、カツ丼 28.3→25.8、カレー 16.6→28.3 (計 99.9 ≈ 100.0%) |
| `2015h27a-q088` | p38 (問題文) + **p39 (図3 本体、基準線 3.0)** | 評価平均 3.6→3.0 |

- `2013h25h-q099` (**Rule A: 書換え率 >50% の 1 題、源との全数対照**): 源の矢印 12 本 = C社サイト→トップ 3,000 / トップ→商品紹介 1,000 / 商品紹介→トップ 400 / トップ→キャンペーン 2,000 / キャンペーン→トップ 800 / キャンペーン→商品紹介 500 / 商品紹介→購入手続 100 / 購入手続→商品紹介 50 / キャンペーン→購入手続 300 / 購入手続→キャンペーン 20 / 購入手続→購入手続完了 180 / 購入手続完了→商品紹介 100。新 fd はこの 12 本をこの順で列挙 (12/12 一致)。旧 fd の「購入手続400→完了50→完了860」「キャンペーン→購入手続500→完了300」「離脱数あり」は源に無いので消えた。
- 複写の同期 (旧値と完全一致する `figure_description` だけを置換): question_bank 7 / by_year 7 / textbook units 6 本 (`strategy-01-02-u03` `-u04` `-u06` `strategy-01-03-u02` `strategy-03-10-u05` `technology-17-47-u01` = 5 題分) / `figure_index.json` 5 / `.planning/quiz_fixtures.json` 6 (gitignored)。L2e の「4 題」は実測 5 題 (`2021r03-q050` を含む)。事後: 非 group の source_figures と bank の差 0 (L2b 走査の再実行)。
- 不触 (範囲外、報告のみ): `2012h24h-q005` の raw `stem_jp` (不可視) に 4,800 が残る (表示層 clean は 4,000)。

## 6. D-156 (en「」→“”)

- 範囲: translations sidecar の en (stem / choices)、`.phase1` tr_ の en (sidecar の変換有無にかかわらず「」を含む field はすべて同じ規則で変換。A2b §6c の「.phase1 のみの field は不触」とは異なる。gitignored の merge 入力で、“” が目標状態のため)、`.phase2/expl_tr_*` の en 全 field (→ 29 exam を phase2-merge で再生成)。対 2,690 = sidecar・.phase1 49 field + expl_tr 581 題。en に残る「」は除外分だけ (sidecar 6 field / 24 字)。
- 除外 77 対 (中身で判定、対ごと): 関数式 (`IF(…)` `SUM(…)` `CountIf(…)` `COUNTIF(…)`) / セル式 (`(B2+C2)/2` `D2/D$14` `F$14*E2` `B$2*D$2` `C14*1.1` 等) / ワイルドカード・LIKE (`%udon%` `udon%` `%` `?` `*` `*data*` `*A*.te??` 等) / コード片 (`2011h23tokubetsu-q100` の `<img src=「 　　a　　 ￥s01.jpeg 」>`) / ← を含むもの (`2023r05-q064` 擬似言語の代入、`2021r03-q070` の `Author ← Book` 型の表記法)。sidecar の除外 field: `2011h23tokubetsu-q100` `2013h25h-q096` `2016h28a-q082` `2017h29h-q090` `2019r01a-q099` `2020r02o-q071` (同じ field の prose の引用は変換済、例 `2016h28a-q082`「Pass」→“Pass”)。全リストは是正器の dry-run 出力。`2011h23tokubetsu-q100` は prose の `src=「file name」` (構文の説明) を “file name” に変換し、コード行 `<img src=「…」>` は除外したため、同じ stem 内で字形が 2 種になる (意図: コード片だけを保護)。
- jp 側が ASCII `"` の箇所に当たる 「」 は無かった (jp もすべて「」)。
- explanations の差分は機械照合済: 29 file、変更 field 1,476 = en の「」→“” 1,474 + note 2 (+ `2012h24h-q052` の round1 公開 = note が round1 と異なると merge が round1 を出す既存の挙動)。それ以外の差分 0。apply 前に全 29 exam の phase2-merge を流して既存の差分 0 を確認済。

## 7. ゲート

| コマンド | 結果 |
|---|---|
| `node scripts/build-quiz-corpus.mjs` | ✅ |
| `node scripts/quiz-phase2-merge.mjs <29 exam>` | ✅ 全 exam |
| `node scripts/quiz-chumon-groups-build.mjs` / `--check` | ✅ 変更なし (冪等) / 生成結果と一致 |
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran / all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `pnpm … -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm … -C apps/web test` (vitest、textbook validate/reader/loader を含む) | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped |
| `pnpm … -C apps/web build` | ✅ exit 0 |
| textbook | 専用の検証脚本は無い。units の差分は `figure_description` の 1 行ずつだけ (構造不変)、末尾改行なしの元形式を保持 |

## 8. 抽検 (10 field、源 page PNG 原寸と照合)

全 10 一致: `2013h25h-q099` fd (p48) / `2021r03-q050` fd (p23) / `2012h24a-q086` fd (p34) / `2015h27a-q088` fd (p39) / `2012h24h-q005` fd (p03) / `2019r01a-q002` fd (p03) / `2013h25a-q052` キャプション (p18) / `2010h22h-q035` ラベル削除・凡例保持 (p16) / `2011h23tokubetsu-q093` −1 ×2 (p35/p36) / `2012h24h-q052` 4 肢 (p18)。追加で `2011h23tokubetsu-q095` イ・エ (p38) と `2017h29a-q020` (p10) も原寸で一致を確認。D-156 は en↔jp の照合 (PNG ではない): 除外 77 対は全数を dry-run 出力で目視。

## 9. tracked 変更 (64 file)

`data/ip/quiz/questions.json`、`data/ip/quiz/translations/*.json` 27、`data/ip/quiz/explanations/*.json` 29、`data/ip/textbook/units/*.json` 6、`data/ip/textbook/figure_index.json`、新規 `scripts/quiz-fix-S128-a3.mjs`、本書。gitignored: question_bank / by_year 15 / `.phase1` tr_ / `.phase2` expl_tr_ 581 + generate_result 2 / `.planning/quiz_fixtures.json`。

## 10. Reviewer 確認点

1. D-158 のキャプション化 2 題 (削除ではなく括弧除去) の解釈。
2. D-159 に L2b 走査外の 5 箇所 (かな直後の −1) を含めた判断。
3. D-156 の除外規則 (特に ← を含む `2021r03-q070` の表記法を除外側にした点、`2014h26h-q087`「hourly wage x working hours」等の言葉の式は変換側)。
4. D-160 `2013h25h-q099` の全面書換え (Rule A、§5 の 12 本対照)。
5. 範囲外の残り (未是正、後続へ): explanations の jp/zh が旧字形を引用 — `2010h22h` `[S社の状況]` / `2012h24a` `[システム導入検討会のメモ]` / `2013h25a` `【要望事項】` / `2011h23tokubetsu` `L＝－1`。`2012h24h-q005` raw stem の 4,800。
6. B2 fixer (`scripts/quiz-fidfix-S128-b2.mjs`、未 apply) は en の「」を from に持つなら A3 後の状態で dry-run を取り直す必要がある (B2 evidence §7 に記載あり)。

## Rule D (a3-reviewer、`oh-my-claudecode:verifier` opus) — PASS-with-notes / APPROVE
- gates 再実行 PASS、correct_answer 2900/2900 不変。D-157/158/159 源 PNG 18 頁原寸で照合一致 (キャプション化 2 題は正当、「に−1を」5 箇所は負号で正、2012h24h-q085「価格-1」除外は正)。D-160 7 題源一致、`2013h25h-q099` 矢印 12/12 (Rule A 独立照合)、textbook 旧値残存 0。D-156 開閉不均衡 0、残存「」77 = 全て式・コード、抽検 45 対誤変換 0。round1 公開は D-143 §7 設計どおり。
- MINOR (後続 A5): `2023r05-q060` zh [程序] / `2022r04-q096` jp+zh ［プログラム1/2］→〔プログラム 1〕。NIT: 表記法の除外不統一 (2021r03-q070 vs 2009h21a-q099)、en「Figure 1　」全角空格、tokubetsu-q094 U+2013 混在、tokubetsu-q100 混在 (意図的)。範囲外残: explanations jp/zh の旧字形引用 → A5。
