# B11 (2010h22a) Rule D 独立審査 — S129

- Reviewer: `b11-reviewer` (`oh-my-claudecode:verifier`, opus)。Writer = `b11-fixer` (executor)。subagent_type・context とも別。
- 対象: 未 commit の `data/ip/quiz/{questions.json, translations/2010h22a.json, explanations/2010h22a.json}`、gitignore 層の `data/ip/exams/question_bank.json` / `by_year/2010h22a.json`、記録 `evidence/quiz_B11_2010h22a_S129.md`、是正器 `scripts/quiz-fidfix-S129-b11.mjs`。
- read-only (データ・スクリプト・git 不変)。HEAD 版を scratchpad に退避し、自作スクリプトで leaf 単位・文字単位 (LCS) の差分を取った。源は `data/ip/exams/pages/2010h22a/page-NN.png` を原寸で実読 (writer の precrop は不使用)。

## 判定: **PASS-with-notes** (MAJOR 0 / MINOR 0 / NIT 2)

## 1. git diff の説明可能性

| 検査 | 結果 |
|---|---|
| `questions.json` | 変化 leaf **21**、すべて 2010h22a (q010 イ / q031 ア〜エ / q033 ウ・エ / q061 ア〜エ / q066 ア〜エ / q078 ア / q079 ア〜エ / q086 raw stem)。他 exam 0 |
| `translations/2010h22a.json` | 変化 leaf **41** (stem_jp_clean 19 + zh / en 22)。文字単位の全 hunk が記録 §6 の 37 論理差分 (sem 10 / cos 27) と訳層追随に対応。説明できない hunk 0 |
| `explanations/2010h22a.json` | final `note_jp` 10 件 (q003 q016 q018 q021 q031 q061 q066 q079 q092 q094) は**すべて純粋後置** (`startsWith` + MARK `fidfix-S129-b11`、10/10)。`round1` 新設 7 題は `.phase2/generate_result_2010h22a.json` の `key_guard_round1` と **7/7 一致**、既存 round1 の書換え 0。本文変化は q003 (オフショア**ア**ウトソーシング 3 箇所) / q061 (演算子 ASCII 化、列挙の「370／549…」区切りは不変) / q079 correct の “” のみ |
| `correct_answer` | `"correct_answer"` を含む diff 行 0 (0/2900)。note 内の「correct_answer=X は不変」19 行は文字列 |
| 中問 registry | `quiz-chumon-groups-build.mjs --check` 一致 (変更は前文 1,000 字以降、probe 不変) |
| page pointer (disk) | bank / by_year とも q062 / q063 = `pages/2010h22a/page-24.png` / 24。page-24 を実読: 問62 (シングルサインオン)・問63 (正規化)・問64 が載る ✓ |

## 2. 源 PNG との照合

- **q003 (p03)**: 「オフショアアウトソーシングの事例として，」✓ (stem + 解説本文 3 箇所追随 ✓)
- **q066 (p25 / `quiz-figures/2010h22a-q066.webp`)**: webp に ア〜エ のラベル付き有向グラフ 4 図が判別可能に載る (ア {A→B, C→A, D→B} / イ {A→B, A→C, D→B} / ウ {B→A, A→C, B→D} / エ {A→B, A→C, B→D})。key エ を再導出一致。**拡張は正当**: 旧選択肢の辺集合書き下しは「(X, Y) を図の矢印として読む」という題の技能を文字列照合 (A→B, A→C, B→D を探すだけ) に置き換えるので、判定文の削除だけでは答えの先取りが残る。B10 q088 と同じ原則で、主 context も S129 log で採用済み。3 層とも 図ア / 图ア / Figure ア ✓、解説は選択肢を引用しない
- **q089〜q092 (p36)**: 源の b / c は表外の矢印で列 5 / 列 6 を指し、a は予想出力行の列 3 の枠内。是正後の表 (jp / zh / en) を `parseStemBlocks` に通すと 10 列 × 12 行、予想出力行 idx4 = a (列 3)、矢印行 idx6 / idx7 = 「↑ b」「↑ c」(列 5 / 6) ✓。agent の「a の列ずれ」を不採用としたのも正しい
- **q094 (p40)**: 源の問94 は「…最低何行必要か。」+ 表 + 選択肢で、「ここで，表は…“×” で示す。」は無い → 3 層削除 ✓ (前文側の 1 回は残存)
- **q031 (p13、正解ア)**: 源は 2 列表 (業務プロセスモデル / データモデル)。是正後 4 肢を `parseChoice` に通すと全て `kind:"table"`, header 2 列 + 1 行、値 DFD / E-R 図 等 源一致 ✓
- **q061 (p23、正解ウ)**: 源「は 3 けた…最下位の 1 けた…上位 2 けた…1 の位」「，」×5 ✓。選択肢は D-162 で - + / (源 －＋／)、区切り「，」は源どおり ✓
- **q079 (p30、正解イ)**: 源 ““業者”表，“仕入明細”表及び“商品”表” と選択肢 “…”表 → “…”表 ✓。q078 ア「a, b」も源「a，b」の field 字種で ✓
- **q018 (p08)**: 評価基準セル「2%以上ならば，110 点」等 6 箇所 ✓ / **q016・q021 (p08 / p09)**: “” と区切り ✓
- **q010 (p06)**: 源は「派遣先 A 社」。イを他 3 肢と同じ「派遣先A 社」に揃えた (→ NIT-1)

## 3. 独立した見落とし抽検

writer の標本・名指し・実読リストに無い CLEAN/未変更題 **q001 q002 (p03)、q009 q012 (p06)、q013 (p07)、q020 (p09)、q026 q027 (p12)** の 8 題を、表示 jp (clean||raw + 選択肢) と源で逐字照合 → **見落とし 0 / 8** (読点の字種「, 」「，」混在は exam 全体の型 ⑨ として除外)。

## 4. ゲート (reviewer が再実行)

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran、all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `tsc --noEmit` (apps/web) | ✅ exit 0 |
| vitest (apps/web) | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped tests |
| machdiff vitest | ✅ 42/42 |
| fidfix dry-run 冪等 | ✅ applied 0 / skipped 323、files to write 0 |

## 5. Notes

- **NIT-1** `q010` 4 肢とも「派遣先A 社」「派遣元B 社」(前だけ空白なし) で、源は「派遣先 A 社」。肢間は揃い意味差なし (空白は exam 全体の型 ⑨)。将来の空白正規化時に一括でよい。
- **NIT-2** q062 / q063 の page pointer 是正は gitignore 層 (bank / by_year) のみで commit に出ない。bank 再生成で巻き戻るリスクは S129 log の ⑨ に記録済み — tracked な page pointer 記録 (または B13 q093 と合わせた生成側修正) を backlog 化すること。

MAJOR / MINOR なし。commit してよい (データ修正不要)。
