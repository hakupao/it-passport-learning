# B5 (2013h25a) Rule D 独立審査 — S129

- Reviewer: `b5-reviewer` (`oh-my-claudecode:verifier`, opus)。Writer = `b5-fixer` (executor)。別 subagent_type・別 context。
- 対象: 未 commit の `data/ip/quiz/{questions.json, translations/2013h25a.json, explanations/2013h25a.json}`、記録 `evidence/quiz_B5_2013h25a_S129.md`、是正器 `scripts/quiz-fidfix-S129-b5.mjs`。
- read-only (データ・スクリプト・git は変更していない)。HEAD 版を scratchpad に退避し、field 単位の差分を自作スクリプトで取った。

## 判定: **PASS-with-notes** (MAJOR 0 / MINOR 0 / NIT 3)

## 1. git diff の説明可能性

| 検査 | 結果 |
|---|---|
| `questions.json` 変化 field | **21** (12 題: q001 q014 q017 q018 q043 q066 q074 q075 q085 q094 q095 q100)。2013h25a 以外の変化 **0** |
| `translations/2013h25a.json` 変化 field | **21** (stem_jp_clean 5 [q014 q085 q091 q094 q095] + zh/en 16 [q066ウ q085 q095 stem・選択肢 q100ア]) |
| `explanations/2013h25a.json` | final `note_jp` 9 件すべて**純粋後置** (prefix 一致で検証) + `round1` publish 7 題 (D-143、B3/B4 と同型) + q100 correct jp/zh/en 3 + q075 distractors.ウ.jp 1。他の変化 0 |
| `correct_answer` | HEAD 比 **0 / 2900** (全題比較)、`git diff -U0 data \| grep -c correct_answer` = 0 |
| 中問前文 (q085 q091 q094 q095 × clean/zh/en) | 最後の `\n\n` より前は HEAD と **12/12 一致**。変化はすべて設問文本体 |
| 22 論理差分との対応 | 全 hunk が §6 の 22 論理差分 (cos 12 / sem 10) + 訳層・解説追随のいずれかに対応。説明できない変化 0 |
| 作業木の他変更 | `docs/discussion/2026-10-20-session-129.md` +1 行は主 context の進捗記録 (writer の範囲外、data と無関係) |

## 2. 源 PNG との照合 (22 論理差分すべて、page を原寸で実読)

- **q095** (p41): 4 肢をトークン単位で照合 — ア “関連_” ＋ n ＋ “_報告_” ＋ yymm ＋ w ＋ 作成者氏名 / イ 同 nn / ウ “報告_” ＋ yymm ＋ w ＋ 作成者氏名 ＋ “_関連_” ＋ n / エ 同 nn。是正後の表示と**完全一致** (先頭 _ 復元・余分な “_” 削除・全角 ＋ ・“” 区切り) ✓。設問文 “報告書” ✓。**答えの再導出**: 業務報告書と並ぶには先頭を “報告_”＋yymm＋w＋作成者氏名 にする → ウ/エ、上限 12 件 ((5)) で 2 桁 → **エ** = correct_answer ✓。D-164 (jp/zh ＋、en ASCII +、en 表1 も “+”) と整合 ✓
- **q100 ア** (p46、正解肢): 源「取り出された回数と取り出されていた時間を取得できる」、「平均」なし ✓。イは源も「平均時間」→ 不変妥当。解説 correct jp/zh/en は「〈戻した時刻−取り出した時刻〉から取り出されていた時間」に書換え、算術・論理とも正 ✓
- **q066 ウ** (p23): 源「…高くして高速処理を実現する。」✓ (zh/en 削除も正)
- **q085** (p32、設問文の頁): 源「A さんが参加した6月以降の，」✓。zh「A于6月加入之后」/ en "After person A joined in June" 意味一致 ✓
- **q075 ウ** (p26): 源「復旧」✓ / **q074 ア**: 源「変えながら」✓ / **q001** (p02): 源「A 社では」✓ / **q017 イ** (p07): 「ベンダ」✓
- **q043** (p15): 4 肢とも源は「，」区切り ✓ (アの字種統一も源どおり)
- **q014** (p06) / **q018** (p07) / **q091** (p37) / **q094** (p40 a〜c ×4): 源はすべて “” ✓
- **q052** (p18) 不変: 図1 = A 2 台並列→B 直列、図2 = A 1 台→B 直列で言語化と一致。答え 0.99×0.8=0.792→0.79、0.72 → 差 0.07 = ア ✓。A3 処置済み (D-158) の据え置きは妥当
- **q092** (p38、UNREADABLE): 設問文・表1 (1/5/5, 2/5/3, 5/1/1, 4/4/2)・注1)・評価基準・選択肢が表示と一致 ✓。重み 4:2:1 は表示前文 (3) で確認 → 19/21/23/26 → **エ** ✓

## 3. severity 再分類

q001 (助詞「で」脱落) / q074 (OCR 非語の置換) の cosmetic→semantic は B3 規則 (語・字の出入り/置換 = semantic) どおり。**同意**。

## 4. 独立見落とし抽検 (writer 標本・名指し外の CLEAN 9 題)

q002 q013 q015 q016 q019 q041 q042 q076 q086 (verdict=CLEAN) の表示 jp を源 (p02/p06/p07/p15/p26/p32) と逐字照合 → **見落とし 0 / 9** (読点「，」/「, 」/「、」の字種は exam 全体型として除外)。

## 5. ゲート (reviewer が再実行)

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran、all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `tsc --noEmit` (apps/web) | ✅ exit 0 |
| vitest (apps/web) | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped tests |
| fidfix dry-run 冪等 | ✅ applied 0 / skipped 120、files to write 0、実行後 `git status data` 不変 |

## 6. Notes

- **NIT-1** q095 zh 選択肢「作成者姓名」vs zh 表1「编制者姓名」、en "report_"/author name vs en 表1 “Hokoku_”/creator's name の訳語不一致 (記録 §11 ⑨ どおり、本 unit 範囲外)。
- **NIT-2** q092 の重み 4:2:1 は前文 p34〜35 (A4 範囲) の源ではなく表示前文で確認した。答え導出は表1 の源値で独立に一致。
- **NIT-3** 記録 §1 の「正解肢上 2」は agent 集計、§2 の「3」は fixer 集計 (q043 ア 追加) — 本文で説明済みだが一見矛盾する。

MAJOR / MINOR なし。commit 可。
