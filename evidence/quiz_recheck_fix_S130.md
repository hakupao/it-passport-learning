# S130 頁ずれ再核験 17 件の是正 (recheck-fixer lane、D-152 data lock 保持)

- 入力: `evidence/S130_pageoffset_recheck.md` (S1〜S17、5 題: 2015h27a-q086 / 2015h27a-q088 / 2011h23a-q024 / 2014h26a-q099 / 2019r01a-q061)
- HEAD: `a400233`
- **結論: 17/17 とも学習者表示層では既に源どおり。データ変更 0、correct_answer 変更 0。**

## 0. 核験側の前提誤り (要点)

核験は「9 題とも `stem_jp_clean` 無し → 表示 = `stem_jp`」としたが、`stem_jp_clean` は `question_bank.json` ではなく
**translations sidecar** (`data/ip/quiz/translations/<exam>.json`) にある。表示側は `apps/web/src/lib/quiz/quizModel.ts:120`
`stem_jp: entry.stem_jp_clean?.trim() ? entry.stem_jp_clean : q.stem_jp` で、5 題とも sidecar に空でない `stem_jp_clean` がある。
したがって S1〜S17 は raw `stem_jp` (questions / question_bank / by_year = OCR 記録層、D-136-C) だけにある残渣で、
学習者には表示されていない。zh / en も 5 題とも源どおり。

raw は書き換えない。理由:
1. D-136-C: raw は OCR 記録層であり、表示は `stem_jp_clean` が上書きする設計。
2. S129 の前例: raw だけにある腐敗は是正対象にしていない。是正器の `sub()` は n===0 で skip し、B13 q017 は raw を意図的に skip させる `from` を組んでいる。
3. 既存の `key_guard.note_jp` (2015h27a-q088「stem_jp_clean は元 stem_jp の OCR 誤り(基準値 9.5/3.6)を 0.5/3.0 に是正済」、2019r01a-q061「stem_jp には OCR ノイズ (適切かもの…挙げけた) があるが stem_jp_clean が正」) は raw / clean の分担を前提に書かれている。raw を書き換えるとこの記述が事実と合わなくなる。

raw の残渣がほかの出荷物に漏れていないことも確認した: `鈴木次郎` / `相関係数は9.5` / `〔テクノロジ〕\n問99` / `| 値引きする | 値引きする | 値引きする | 9` は
`quiz_index.json` / `chumon_groups.json` / translations / explanations / `apps/web/public` で 0 件。`適切かもの` は explanations の `key_guard.note_jp` に 8 件あるが、いずれも raw の OCR 崩れを説明する記述。

## 1. 項目別 (源頁は fixer が原寸で再読)

| ID | 題 / field | raw `stem_jp` (表示されない) | 表示層 `stem_jp_clean` | 源の読み | 判定 |
|---|---|---|---|---|---|
| S1 | 2015h27a-q086 stem | `質問項目の評価が2以下だったアンケートの内容を行ごとに抽出し` | `その質問項目の評価が2以下だったアンケートの内容をアンケート集計表から抽出し` | p37 = clean と同じ | 表示は正。raw 不変 |
| S2 | 2015h27a-q086 埋込表 | 抽出表 row3 (通番1) = 3,5,2,3,4,4、列 H〜O が 1 列ずれ、左表 row202 = `200｜3｜…｜2` | 抽出表 row3 = 通番1 で空、row4 = 通番2 `3｜5｜2｜3｜4｜4`、row202 = `200｜2｜3｜2｜3｜3｜3`、H は空列、I 通番〜O 総合評価。左表 `A 通番｜B 店舗｜…｜G 総合評価`、row202 = `200｜2｜…｜3` | p37 図2 = clean と同じ (webp `quiz-figures/2015h27a-q086.webp` も図2 と一致) | 表示は正。下の §2 を参照 |
| S3 | 2015h27a-q088 stem | `相関係数は9.5を` | `相関係数は0.5を` | p38 `0.5` | 表示は正 |
| S4 | 同 | `評価平均は3.6 を` | `評価平均は3.0を` | p38 `3.0` | 表示は正 |
| S5 | 同 | `座標で.。 アンケート集` | `座標で, アンケート集計表` | p38 `座標で，` | 表示は正 (読点は field の字種 `, `、⑨) |
| S6 | 同 | 末尾にグラフ軸の OCR 残骸行 | 残骸なし | p38 (図3 は p39 の画像) | 表示は正 |
| S7 | 2011h23a-q024 表 3手目列 | `値引きする／広告する` ×4 | `広告する／広告しない` ×4 | p10 = clean と同じ (値 9,2,15,8,0,−6,10,4) | 表示は正。zh `做广告/不做广告`、en `Advertise/Do not advertise` も正 |
| S8 | 2014h26a-q099 stem 冒頭 | `〔テクノロジ〕\n問99 ` | 見出しなし (中問の前文 + 設問文) | p50 の見出しは問題番号の欄 | 表示は正。zh / en にも `问99` / `Q99` は無い |
| S9 | 同 手順(1) | `申請月が前月` | `申請日が前月` | p50 `申請日` | 表示は正 (zh 申请日 / en application date) |
| S10 | 同 手順(4) | `顧客番号と社員名を取得` | `顧客名と社員名を取得` | p50 `顧客名と社員名` | 表示は正 (zh 客户名 / en customer name) |
| S11 | 同 図1 見出し | `顧客番号｜社員名｜社員名｜金額` | `顧客番号｜顧客名｜社員番号｜社員名｜金額` | p50 = clean と同じ | 表示は正 |
| S12 | 同 図1 1 行目 | `000001` | `000100` | p50 `000100` | 表示は正 |
| S13 | 同 図1 2 行目 | `鈴木次郎` | `鈴木太郎` | p50 `鈴木太郎` | 表示は正 (zh 铃木太郎 / en Taro Suzuki) |
| S14 | 同 明細表 | `利用区分` | `利用区間` | p50 `利用区間` | 表示は正 (zh 使用区间 / en Use Section) |
| S15 | 同 顧客表 | `顧客番号｜社員名｜住所｜電話番号` | `顧客番号｜顧客名｜住所｜電話番号` | p50 = clean と同じ | 表示は正 |
| S16 | 2019r01a-q061 stem | `適切かもの` | `適切なもの` | p26 `適切なもの` | 表示は正 |
| S17 | 同 | `挙げけた` | `挙げた` | p26 `挙げた` | 表示は正 |

choices_jp: 核験と同じく 5 題とも源どおり (choices は raw 3 層が出荷層で、差分 0)。

## 2. S2 (2015h27a-q086 の埋込「アンケート抽出表」) の判断

- `has_figure: true` で、表示される `quiz-figures/2015h27a-q086.webp` は源 p37 図2 そのもの (左表、抽出表、項目番号 3 の欄、評価集計表)。
- 表示層 `stem_jp_clean` の言語化された表は図2 と全セルで一致する (上表)。zh / en の表も同じ配置。
- D-168 / D-163 の観点: 表は源どおりで、答えも漏らしていない (正答ウは `表引き($B3:$G3, 1, $K$204) ≦ 2` という式の構造で決まり、表の値からは決まらない)。→ **不変 (残す)**。削除もしない。
- 細かい点: 左表の題「図1のワークシート（アンケート集計表）」は、源では図2 の左側にあたる (内容は図1 のワークシートと同じ)。誤りではなく、本文の「図1のワークシートに…追加して，図2」と矛盾しないので不変。

## 3. S8 と chumon / COPY の関係 (D-165)

- `scripts/quiz-chumon-groups-build.mjs` の `stems()` は `stem_jp_clean` / `stem.zh` / `stem.en` を読む。raw `stem_jp` は読まない。
- COPY 表 (`2011h23a-q093` / `2012h24a-q098` / `2011h23a-q089` / `2014h26h-q089` / `2014h26a-q085`) に 2014h26a-q099 は無い → cut marker への依存は無い。
- clean / zh / en には見出しがもともと無い → D-165 型の一体処置は不要。`--check` は一致 (下記)。

## 4. 訳・解説への波及

`data/ip/quiz/explanations/{2015h27a,2011h23a,2014h26a,2019r01a}.json` の 5 題を全 field 走査した (9.5 / 3.6 / 鈴木次郎 / 铃木次郎 / 申請月 / 顧客番号と社員名 / 000001 / 利用区分 / 適切かもの / 挙げけた / 行ごとに / 座標で. / 問99 / 问99 / Q99 ほか)。
- 波及 0。
- 引っかかったのは次の 2 種だけで、いずれも正当な記述:
  - q086 の `第3行` / `row 3`: `$B3:$G3` が 3 行目の 1 行範囲であることの説明。
  - q088 の `9.5` / `3.6` と q061 の `適切かもの` / `挙げけた`: `key_guard.note_jp` が raw の OCR 誤りを説明している句。
- zh / en の stem・choices も 5 題とも源どおり (§1)。

## 5. ゲート

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran、all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ `chumon_groups.json は生成結果と一致` (`2015h27a-mqTech1/2` の「registry に対応する組が無い」は既存の情報行) |
| machdiff | 対象外 (新規 transcription なし) |
| tsc / eslint / vitest / next build | 未実行。データ・コードとも変更 0 のため HEAD `a400233` のゲート結果がそのまま当てはまる |
| correct_answer 変更 | 0 |
| 是正器 | 作っていない (適用すべき差分 0) |

## 6. git status

```
 M docs/discussion/2026-10-20-session-130.md   (lane 開始前から M、本 lane は触れていない)
?? evidence/quiz_recheck_fix_S130.md            (本ファイル)
```
Rule B: 試行して取り下げたものは無い → `failures/` 追加なし。

## 7. 範囲外 (核験の付随所見、本 lane では未処置、lead へ引継ぎ)

- 2012h24a-q088: bank `source.figure_page_number` = 33 は誤り。本問の図 (○×ワークシート) は p36 (gitignore 層)。
- 2015h27a-q088: 図1 (p36) を参照するが `figure_page_number` が無い。
- 核験手順の改善: 表示層は `translations/<exam>.json` の `stem_jp_clean` を優先して比較すること (`quizModel.ts:120`)。
