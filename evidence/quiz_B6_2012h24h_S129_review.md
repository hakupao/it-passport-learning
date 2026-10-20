# B6 (2012h24h) Rule D 独立審査 — S129

- Reviewer: `b6-reviewer` (code-reviewer 系 subagent_type, opus)。Writer = `b6-fixer` (executor)。subagent_type も context も別。
- 対象: 未 commit の `data/ip/quiz/{questions.json, translations/2012h24h.json, explanations/2012h24h.json}`、記録 `evidence/quiz_B6_2012h24h_S129.md`、是正器 `scripts/quiz-fidfix-S129-b6.mjs`。
- read-only で審査した (データ・スクリプト・git は変更していない)。HEAD 版を scratchpad に退避し、自作スクリプトで field 単位の差分を取った。

## 判定: **PASS-with-notes** (MAJOR 0 / MINOR 0 / NIT 3)

## 1. git diff の説明可能性

| 検査 | 結果 |
|---|---|
| `questions.json` の変化 field | **14** (7 題: q001 stem / q017 ア〜エ / q037 stem / q048 ア / q058 stem / q069 stem + ア〜エ / q075 イ)。2012h24h 以外の変化 **0**、題数も不変 |
| `translations/2012h24h.json` の変化 field | **22**。内訳は stem_jp_clean 6 (q058 q081 q086 q087 q089 q092) と zh/en 16 (q058 ×2、q069 ×8、q086 ×2、q087 ×2、q092 ×2) |
| `explanations/2012h24h.json` | final `note_jp` 9 件 (q001 q017 q048 q058 q069 q075 q081 q086 q092) は**すべて純粋後置** (prefix 一致で検証、MARK `fidfix-S129-b6`)。加えて `round1` の publish が 7 題 (null → object、D-143、B5 と同型)、q075 `correct.jp` の引用 1 件。これ以外の変化は 0 |
| `correct_answer` | `git diff -U0 data \| grep -c correct_answer` = **0** |
| 中問前文 (mqA〜mqD の 16 member × jp clean / zh / en) | 変化した 10 field はすべて、各組の共通 prefix (前文) より後で変化が始まる (`firstDiff ≥ commonPrefix`)。mqB 前文の「、」は不変。`chumon_groups.json` も不変 |
| 19 論理差分との対応 | q001 1 / q017 4 / q037 1 / q048 1 / q058 1 / q069 5 / q075 1 / q081 1 / q086 1 / q087 1 / q089 1 / q092 1 = **19**。全 hunk がこの 19 件か、その訳層・解説への追随に対応する。説明できない変化は 0 |
| 作業木のその他の変更 | session-129 log の +3 行は主 context の進捗記録で、data とは無関係 |

## 2. 源 PNG との照合 (19 論理差分すべて、源ページを全頁で実読)

- **q075 イ** (p26、正解肢): 源は「定型に**従って**記述できるフォーマットの総称」で、是正は正しい。解説 `correct.jp` の引用も「従って」に揃っている ✓
- **q069** (p24): 4 肢とも源は “札幌” “函館” “日本料理” (全角の “”)。ASCII `"` → “” の是正は正しく、ウ (正解肢) も字種だけの変更。源の題幹は「検索条」で改行して「件」に続くので、空白の除去も正しい ✓。zh/en の “” 追随は D-151 に合う (2012h24h の zh ASCII `"` は是正後 **0**)
- **q086** (p33): 表3 の省略記号は源でも縦の ⋮ (価格の 3 行目 3 セルと、性能・サービス行の各 3 セル) ✓。3 行目の列 0 も ⋮ にしたが、源ではここは結合セル「価格」(→ NIT-1)
- **q087** (p34、apply 中に追加): 表4 の源は、価格 1 行・性能の 4 行目・サービス 1 行が ⋮ で、表示の 3 行 × 3 セルと**完全に一致** ✓。性能の 3 比較 (A＞B、A＞C、A＜D) と表5 も源と一致。zh/en は同じ位置の字形だけを変えている ✓
- **q092** (p40): 源の注記は「網掛けをしている日が休日である」だけで、括弧書きの削除は正しい ✓。`public/quiz-figures/2012h24h-q092.webp` を実際に開き、網掛け (6,7,13,14,15,20,21,23,27,28)・注記・図題が描かれていることを確かめた。q092 は `has_figure=true` なので、学習者は図で休日を読める ✓
- **q017** (p07): 4 肢とも源は「，」、エは「保有することによって」✓ / **q058** (p20): 源は “商品” “A 社” “B 社”。表の左上に表題「商品」がある ✓ / **q048 ア** (p16): 源は「自身では制御できない」✓
- **q001** (p02): 源は表の右肩に「単位　万円」、セルは 1,000 / 3 / 2,000 / 2 ✓ / **q081** (p29): 源は「データをサーバの」「障害時には障害が」で、読点は無い ✓ / **q089** (p37): 源は “Y”，“N” ✓ / **q037** (p13): 源の「依頼した。監査終了後」に空白は無い ✓

## 3. severity の再分類

writer は 3 件を cosmetic → semantic に入れ替えた。いずれも B3 規則 (語・字が入る / 落ちる / 置き換わる = semantic) どおりで、**同意する**。
- `q017 エ`: 衍字「すす」
- `q058`: 表題「商品」の脱落
- `q092`: 源に無い注記の挿入 (D-158 型)

## 4. 独立した見落とし抽検

writer の標本・名指しのどちらにも入っていない CLEAN 8 題を選び、表示 jp を源と逐字で照合した: q002 q003 (p02)、q016 q018 (p07)、q036 q039 (p13)、q059 (p20)、q076 (p26)。

→ **見落とし 0 / 8**。読点の字種 (「, 」/「，」) は exam 全体の型 (⑨) なので除外した。

## 5. ゲート (reviewer が再実行)

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran、all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `tsc --noEmit` (apps/web) | ✅ exit 0 |
| vitest (apps/web) | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped tests |
| fidfix の dry-run 冪等性 | ✅ applied 0 / skipped 142、files to write 0。3 ファイルの md5 は実行の前後で同一 |

## 6. Notes

- **NIT-1** `q086` 表3 の 3 行目の列 0「⋮」: 源ではここは結合セル「価格」で、⋮ は無い。もとの「…」の字形を変えただけで、主 context の裁定 (D-161 minor、S113「結合セルを展開しない」) どおりなので、据え置きは妥当。なお `q087` の表4 は「性能」を各行に展開した形のままで、両表の表現が揃っていない (どちらも既存の状態で、本 unit の範囲外)。
- **NIT-2** 記録の訳層の field 数が箇所ごとに食い違う: §4d「計 12 field」、§6 見出し「訳層 18 field」。実数は zh/en が 16 (q087 を含む)、stem_jp_clean を含めると 22。§7 の操作数 (sidecar 21 + 9) は置換の回数で、field 数ではない。データには影響しない。
- **NIT-3** `q058` の源は “A 社” (半角空白あり)、表示は “A社”。これは corpus 全体の空白正規化の型 (q001「A案」も同じ) なので、指摘にとどめる。

MAJOR・MINOR は無い。commit してよい。
