# S128 L1a — machdiff 改修 (⑨ #6 / #25 / 0b)

- lane: L1a (D-152: 編集は `scripts/quiz-fidelity-machdiff.mjs` とそのテストのみ。data/・既存 evidence・failures/ は不変)
- 対象: `evidence/quiz_full52_summary.md` §7.1 の #6 (空虚な一致 / replay artifact / 描画補助・問文配置差の許容 / 表ブロック除外の散文連結比較) と #25 (`source_text` の截断引用)、0b (表示 ASCII `"` vs transcript “”)
- 変更ファイル:
  - `scripts/quiz-fidelity-machdiff.mjs` (改修)
  - `scripts/quiz-fidelity-machdiff.test.mjs` (新規、vitest 31 件)
  - `scripts/quiz-fidelity-machdiff.fixtures.json` (新規、19 題。main tree の `.phase2` manifest + 現行出荷層 + 結果 JSON の audit から機械抽出した実データ。題文は `evidence/phase5/stage_06_quiz_fidelity/*.json` に既にコミット済の範囲)

## 1. 判定順の変更 (field ごと)

| 段 | 内容 | 出力 | exit への影響 |
|---|---|---|---|
| 1 | **patch 無しで比較**。一致 → `same` (agent 計上 field なら内数 `same∩reported`) | — | なし |
| 2 | 不一致かつ agent 計上 field → patch を当てて比較。一致 → `REPORTED` (current_text が field 全文なら内数 `whole-field`)。字面で当たらなければ正規化空間で当てる。両端の「…」省略記法は外して当てる | — | なし |
| 3 | 題幹 markdown 表: 行×セル比較で不一致でも「表の行の順序付き比較 + 表以外の散文の連結比較」が一致 → `LAYOUT` | `~ LAYOUT` | なし |
| 4 | 既知偽陽性型 `FP_RULES` を外して一致 → `KNOWN_FP [規則名]` | `~ KNOWN_FP` | なし |
| 5a | 計上 field で current_text = field 全文 かつ source_text が transcript の真部分文字列 → `REPORTED_TRUNCATED_QUOTE` (⑨ #25) | `~ REPORTED_TRUNCATED_QUOTE` | なし |
| 5b | 未計上 field で norm(transcript) が norm(displayed) の真の接頭辞 かつ文末 (`.?!)"`) で終わる → `TRANSCRIPT_PREFIX` (⑨ #25) | `~ TRANSCRIPT_PREFIX` (続きの 24 字を表示) | なし |
| 6 | それ以外 → `AGENT_MISSED` (従来どおり) | `✗ AGENT_MISSED` | exit 1 |
| 0b | 表示に ASCII `"` があり transcript に ASCII `"` が無く “” / 「」 がある → `QUOTE_ASCII` (段 1〜5 と独立の別判定) | `! QUOTE_ASCII` | なし |

- **replay artifact (⑨-b)** は段 1 で原理的に消える: 是正後の表示が transcript と素で一致すれば patch を当てない (旧版は current_text が是正後テキストの接頭辞だと再置換して「。。」「している.している.」を作っていた)。
- **空虚な一致** は段 2 の `REPORTED (whole-field N)` として `same` から分離。U4 は `same 260 → 256 + REPORTED 4 (whole-field 4)` = U4 §8a が手作業で示した 4 件と一致。U5 は REPORTED 17 (whole-field 14)。
- 見出し混入 (displayed の頭に余計な語、`2022r04-q001` 型) と displayed が短い (末尾欠落) は接頭辞許容の**対象外**で `AGENT_MISSED` のまま。
- `FP_RULES` (各規則に裁定の出典をコメントで付けた):
  - `描画補助:キー注記` — disp の `（主キー）` `（外部キー）` (2026r08-q072、U11 §3b)
  - `描画補助:空欄セル` — disp の `（空欄のセル）` (2023r05-q033、U8 §3)
  - `agent記法:[図]` — src 先頭の `[図]` (2018h30h-q005 U3a / 2022r04-q032 U7 §3)
  - `体裁:肢の表を題幹に転記` — src 題幹中の `[表] … ア: … イ: …` 行 (2019h31h-q053、U3b §3)
- `kvParse` は表示層の一行化「a：X　b：Y」(全角空白区切り) もキー位置で区切る → `2019h31h-q052/q072/q082`、`2020r02o-q001` の表型選択肢偽陽性 (各 4 肢) が消える。a/b の値入替は引き続き MISSED (テストで確認)。
- **D-151**: machdiff は jp の displayed しか読まず zh は比較しない。`normStr` の引用符同一視 `[“”„"「」『』〝〟']` は**不変**。QUOTE_ASCII は表示側 ASCII のみを立て、表示 “” / transcript ASCII は立てない (テストで確認)。
- 出力契約: `✗ AGENT_MISSED <id> <field>` の行形式と summary 行の先頭 6 トークンの順序は旧版のまま。新しい計数は summary 行の末尾に追記。

## 2. テスト (TDD)

```
node apps/web/node_modules/vitest/vitest.mjs run --root scripts --globals quiz-fidelity-machdiff
  → Tests 31 passed (31)
MACHDIFF_SCRIPT=<旧版 (HEAD 3c65c3f) のコピー> 同上
  → Tests 20 failed | 10 passed (30)   ※旧版で計測した時点の 30 件。31 件目 (q072 事後) は後述の修正時に追加
```

- `apps/web/vitest.config.ts` の include は `src/**` 限定で、D-152 により変更不可。worktree root に node_modules が無いため main tree の vitest を `--root scripts --globals` で起動 (テストは `vitest` を import しない)。
- 旧版で通る 10 件 = 出力契約・実残差の盾 (`2022r04-q001` 見出し / `q017 イ` / `2026r08-q078 ウ` / 末尾欠落 / 文途中截断) と、旧版でも結果が同じになる否定系。
- 例 id の網羅: #6 = `2015h27a-q009` (LAYOUT)、`2019h31h-q034` (事前 whole-field REPORTED / 事後は MISSED が残る — §4)、`2021r03-q011` / `2022r04-q100` / `2023r05-q092` (replay)、`2026r08-q074` (LAYOUT)、`2019r01a-q016` (空虚な一致)。#25 = `2022r04-q006` (TRANSCRIPT_PREFIX)、`2022r04-q012` (事前 REPORTED / 事後 same)、`2018h30h-q096` 変形 (REPORTED_TRUNCATED_QUOTE)、`2025r07-q005`。0b = `2026r08-q025`。

## 3. 回帰 (旧版 vs 新版、main tree のデータは read-only)

対象: `evidence/phase5/stage_06_quiz_fidelity/` の結果 JSON と、`data/ip/quiz/.phase2/` に対応する manifest がある全 78 組 (full52 S118 gp/cr ×6 exam + full52post 2 exam、u1ab・u3a〜u11 + u3bpost、a2a / a2c multi、strat53 ×4 exam、s7x / kg)。`journal.jsonl` は main tree の data/ に無かったため、merge 済の結果 JSON を使った。

**(A) 事前 manifest (unit 実行時の状態)**: AGENT_MISSED 合計 **144 → 92**、**新規 MISSED (GAINED) 0**。

| unit | MISSED 旧→新 | same 旧→新 | REPORTED (whole) | LAYOUT | KNOWN_FP | TR_PREFIX | QUOTE_ASCII |
|---|---|---|---|---|---|---|---|
| u1ab 2015h27a | 1→1 | 339→329 | 10 (8) | 0 | 0 | 0 | 0 |
| u3a 2018h30h | 5→1 | 345→337 | 8 (7) | 0 | 4 | 0 | 0 |
| u3b 2019h31h | 18→5 | 417→416 | 13 (10) | 0 | 1 | 0 | 4 |
| u4 2019r01a | 0→0 | 260→256 | 4 (4) | 0 | 0 | 0 | 1 |
| u5 2020r02o | 7→3 | 293→280 | 17 (14) | 0 | 0 | 0 | 2 |
| u6 2021r03 | 2→2 | 433→419 | 14 (13) | 0 | 0 | 0 | 0 |
| u7 2022r04 | 9→4 | 366→339 | 27 (26) | 0 | 4 | 1 | 1 |
| u8 2023r05 | 3→1 | 452→437 | 16 (13) | 0 | 0 | 1 | 1 |
| u9 2024r06 | 0→0 | 360→356 | 4 (3) | 0 | 0 | 0 | 0 |
| u10 2025r07 | 2→1 | 398→389 | 10 (9) | 0 | 0 | 0 | 2 |
| u11 2026r08 | 3→1 | 352→338 | 14 (14) | 1 | 1 | 0 | 7 |
| a2a multi | 6→6 | 410→409 | 1 (0) | 0 | 0 | 0 | 11 |
| a2c multi | 2→1 | 298→292 | 6 (4) | 1 | 0 | 0 | 0 |

`same` の減少は計上 field が REPORTED に移った分 (想定どおり、退行ではない)。

**消えた MISSED 52 件 (全組の延べ) の内訳 — すべて evidence 既登記の偽陽性か機構上の人工物**:

| 型 | 件 | id (evidence) |
|---|---|---|
| 表型選択肢の一行化 | 16 | `2019h31h-q052/q072/q082` ア〜エ (U3b §3 偽陽性 12) ×2 組 (u3b / u3bpost)、`2020r02o-q001` ア〜エ (U5) |
| 問文配置差 (LAYOUT) | 4 | `2015h27a-q009` ×3 組 (波 1 §⑨ 3 型目)、`2026r08-q074` (U11 §3c) |
| KNOWN_FP | 12 | `2026r08-q072` (U11 §3b)、`2018h30h-q005` ×4 (U3a)、`2019h31h-q053` ×2 組 (U3b §3)、`2022r04-q032` ×4 (U7 §3) |
| TRANSCRIPT_PREFIX | 2 | `2022r04-q006` (U7 §3 transcript 截断)、`2023r05-q041` (U8 §3 図の文本化) |
| 正規化空間 patch / 「…」引用 | 4 | `2023r05-q092 ウ` (U8 §3 人工物)、`2020r02o-q018 エ` (strat53 gp)、`2026r08-q013 ウ` (strat53 cr / gp) — いずれも agent が当該差分を計上済 |
| 是正後 manifest の replay | 2 | `2016h28h-q067 ア` (full52post cr / gp) |
| 截断引用 (#25) で差が正規化で消える | 1 | `2025r07-q005` stem (agent 計上済、「」→“”) |
| 合計 | **52** (+ a2c `2019h31h-q082` 散文は旧新とも MISSED) | |

**実残差の盾** (evidence で実残差と裁定された MISSED が新版でも MISSED か): `2019h31h-q001` / `2022r04-q001` / `2022r04-q017 イ` / `2022r04-q018 ウ・エ` / `2026r08-q078 ウ` / `2016h28h-q051` / `2016h28h-q089 ア` / `2017h29a-q079` / `2017h29a-q096` / `2021r03-q001` / `2015h27a-q089` — **全件 MISSED のまま (blocker 0)**。

exit 1→0 になった組は 4: `full52post 2016h28h` × cr / gp (q067 replay のみだった)、`strat53 2020r02o gp` (q018 エ のみ)、`strat53 2026r08 cr` (q013 ウ のみ)。`a2c` は q082 が残るため exit 1 のまま。s7x / kg の 48 組は旧新とも MISSED 0・exit 1 (S117 以前の結果で `source_transcript` が無い = `audits w/o transcript`、一部 VERDICT_CONFLICT 1)。

**(B) 是正後の模擬 (displayed を現行出荷層に差し替えた manifest を scratchpad に生成、73 組)**: MISSED 合計 **81 → 46**、**GAINED 0**。消えた分は replay (`2021r03-q011 ア`、`2022r04-q100` ア〜エ、`2016h28h-q067 ア` ×2、`2018h30a-q070 イ` ×2、`2016h28a-q043` stem — 旧版でも patch を外せば一致することを個別に確認) と上表の既知偽陽性。是正後に残る MISSED は `2019h31h-q034` (表ヘッダ行)、`2019h31h-q059` ×4 (非採用)、`2018h30h-q005` / `2022r04-q032` ×4 (D-144 段 2 で表示が「図L」= 意図的)、ほか事前から残る既知の組。

## 4. 未解決 / 申し送り

1. **`2019h31h-q034` の markdown 表ヘッダ行** (`| 項目 | | 金額 |` が transcript に無い) は許容していない。事後 MISSED として残る (U3b §8a の既知残差)。ヘッダ行の許容は「表の 1 行目欠落」との区別が要るため見送り。
2. **TRANSCRIPT_PREFIX の盲点**: displayed の末尾に文単位の混入 (例: 次節見出しの付着) があると、transcript が直前の文末で終わっていれば TRANSCRIPT_PREFIX に入り exit に効かない。行は出すので主 context が読む前提。gate にするかはユーザー判断。
3. **QUOTE_ASCII は exit に影響させていない** (u4 / u9 など完了 unit の exit が 0→1 に変わるのを避けた)。事前 manifest で延べ 43 件 (a2a 11 / u11 7 / u3b 4 …)、是正後模擬では 0。gate 化は主 context / ユーザー判断。
4. a2c の `2019h31h-q082` stem と 2016h28h cr の `q060` stem (⑨-a 散文注記) は agent の source_text 自体が逐字でない型で、旧新とも MISSED。prompt 側で既に対処済 (⑨-a)。
5. `FP_RULES` は規則ごとに裁定出典を書く運用。新しい描画補助型 (例: U8 q042 組合せ表→選択肢の構造化) は本改修に入れていない。

## 5. 再現

- テスト: §2 のコマンド (worktree root で実行)。
- 回帰: scratchpad の `regress.mjs <old> <new> <out>` (78 組) と `regress_cur.mjs` (是正後模擬 73 組)。いずれも main tree を読むだけで、生成物は scratchpad (`cur/`) にのみ書く。prep-any / prep-multi は実行していない。
- fixture 生成: scratchpad の `genfix.mjs` (main tree read-only → `scripts/quiz-fidelity-machdiff.fixtures.json`)。
