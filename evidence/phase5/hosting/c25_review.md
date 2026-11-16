# C25 Rule D review（S159）— zh 太字の縁の CJK 間空白 (D-231)

- Reviewer: oh-my-claudecode:verifier (opus)。Writer (main session) とは別の agent / context で、Rule D に従う。
- 対象: HEAD `64b07d4e` に対する未コミット変更。
  - units 75・patches 75
  - `scripts/c25-edits.ts`・`scripts/tbjp-apply.ts --round c25`
  - `cleanup-pins.test.ts`
  - `c25_edits*.json`・`c25_apply_{canary,rest}.json`・`c25_keep_formula.json`
- 判定: **条件付き PASS** (HIGH 0 / MEDIUM 0 / LOW 4、confidence high)。条件 = L1 の数の訂正。
- reviewer の helper script と出力は scratchpad の `c25/review/` にある (`rdiff.mjs`・`rscan.mjs`・`rpatch.mjs`・`rmerge.mjs`・`rsample{,2}.mjs`・`rpin.mjs`・`rextra.mjs`)。

## 検査結果 (reviewer 報告の要約、数値は報告のまま)

| 検査 | 結果 |
|---|---|
| 全件の機械 diff (244 単元) | 変化は 75 単元・1,238 leaf (content 709 + 派生 529) で、全て zh。変化は U+0020 の削除だけで、問題 0 |
| 削除した空白 (content) | 計 1,299。内訳は 開き H–H 784、閉じ H–H 481、閉じ「》** 汉」1、`**X** [[jp:` 32、標識なし 1 (u06「” 来管理」) |
| 削除した空白 (派生) | 計 1,153 (H–H 1,150・P–H 3) |
| 派生と content の対応 | zh 派生 6,726 欄で「値 = derive(同じ版の content)」が HEAD・WT の両方で成立 (`compatText`・`introOf`・`hookLines` で再導出)。不一致 0 |
| 維持すべき空白 | 全て Δ0 (下記) |
| edits と実 diff | `c25_edits.json` の 709 件と content の変更 leaf 709 件で集合が一致。before = HEAD 値、after = WT 値 |
| patch | 既存の変更は active → retired (31 件) だけ。新規 709 (単純 680 + composite 29)。retire した 31 件はどれも composite ちょうど 1 本に吸収されている |
| merge dry-run | 75 / 75 単元で記録の baseline_diff・exit と一致。exit 1 の単元は施工前から 1 |
| baseline による隠れ | 0 |
| pin 試験 | 現データ 12 passed。HEAD のデータでは試験の判定の写しで bad 1,298、WT で 0、kept 8 は KEEP と一致 |
| unit 試験・tsc | 1,437 passed・exit 0 |
| 旧値の残り | 他の tracked file に 0 (`git grep -F -f probes.txt`、1,294 本) |

維持すべき空白 (HEAD → WT、全て Δ0):

| 空白の位置 | 件数 |
|---|---|
| 漢字–欧文「汉 **LAT」 | 544 |
| 欧文–漢字「LAT** 汉」 | 662 |
| 式キーワードの縁 | 8 |
| 裸 `[[jp:]]` の隣 | 97 |
| `→` `/` `$` `'` の隣 | 17 |
| 標識なし CJK␣CJK | H–H 44・H–P 13 |
| 標識なし P–H | 11 → 10 (減った 1 は u06「” 来管理」で、意図した例外) |

派生欄の式の空白は残っている。例: strategy-01-03-u02 `terms[4].definition_zh`「…是用 变动成本 ÷ 销售额 求出的…」。

読み取り標本:
- content は seed 20261116 で 24 件 (開き 9・閉じ 8・P–H 1・gloss 5・例外 1)、派生は seed 20261117 で 8 件。加えて名詞に接する縁 49 件を全件読んだ。
- 可読性・意味を損なう例は 0。中国語は本来ベタ組みなので、空白が消えて新しく曖昧になる連結はない。
- 派生の平文にあった「以 手机号码 为」型の隙間は消えた。
- 片端が欧文のキーワード (strategy-05-14-u08「能举例说明**多模态 AI** 所处理」) は、欧文側の空白だけ残る。これは ADR の意図どおり。

規則 (D-231) の妥当性:
- コーパスの多数形、`compatText` の挙動、C25b の分離のどれとも整合しており、妥当と判定。
- clreq の引用は、reviewer が原文を取り直して照合はしていない。

## 指摘と処置

| ID | 指摘 | 処置 |
|---|---|---|
| L1 (条件) | ADR・STATE・session log の初出に古い数 (式 9 / 対象 1,298) が残る。実際は式の縁 8、対象 1,298 + 1 = 1,299 | ADR と STATE を 8 / 1,299 に訂正。session log は追記で訂正 |
| L2 | ADR の文言 (両隣が漢字・仮名・約物) が実装より広い。実装はキーワード側の字に漢字・仮名を求める | ADR の規則文を実装に合わせた。キーワード側が約物の形は HEAD で 0 件 |
| L3 | pin の穴。(a)「**汉** **汉**」の単独空白、(b) L2 の約物側、(c) 標識なしの例外を pin していない、(d) 演算子の class に全角 `＝＋－` が無い | (c) を pin に追加、(d) は generator と同じ class に修正。(a)(b) は現在 0 件なので記録のみ |
| L4 (情報) | 新規 patch 709 のうち 206 件は before が空白 1 文字。窓が短いので、将来の上流の変更で黙って skip される可能性が少し高い | 既存の仕組みどおりで、今は 75 単元とも merge で再現できている。記録のみ。再生成時の注意として What's Next に書く |

## Playwright
reviewer の範囲外。Writer が別に実行し、試点 3 + 変更 75 単元で 459 passed / 0 failed / 2 skipped。
