# B9 (2011h23a) Rule D 独立審査 — S129

- Reviewer: `b9-reviewer` (`oh-my-claudecode:verifier`, opus)。Writer = `b9-fixer` (executor)。subagent_type も context も別。
- 対象: 未 commit の `data/ip/quiz/{questions.json, translations/2011h23a.json, explanations/2011h23a.json, chumon_groups.json}`、`scripts/quiz-chumon-groups-build.mjs` / `scripts/quiz-chumon-lightweight-D144s3.mjs` (D-165 cut marker)、`scripts/quiz-fidelity-machdiff.mjs` (allowlist 1 行)、記録 `evidence/quiz_B9_2011h23a_S129.md`、是正器 `scripts/quiz-fidfix-S129-b9.mjs`。
- read-only で審査した (データ・スクリプト・git は変更していない)。HEAD 版を scratchpad に退避し、自作スクリプトで leaf 単位・文字単位の差分を取った。源は `data/ip/exams/pages/2011h23a/page-NN.png` を sharp で上下に切り出して原寸で実読した (writer の precrop は使っていない)。

## 判定: **PASS-with-notes** (MAJOR 0 / MINOR 0 / NIT 3)

## 1. git diff の説明可能性

| 検査 | 結果 |
|---|---|
| `questions.json` の変化 leaf | **20**、すべて 2011h23a (q014ア q021 q030イ・エ q032 q033 q034 q036ア q046 q051エ q057ア〜エ q084 q093ア〜エ q096)。他 exam の変化 **0** |
| `translations/2011h23a.json` の変化 leaf | **52** (stem_jp_clean 19 + zh / en 33)。文字単位の差分は全件が記録 §6 の 35 論理差分 (q057 ラベル ×4 を含む) とその訳層追随に対応。説明できない変化 0 |
| `explanations/2011h23a.json` | final `note_jp` 15 件は**すべて純粋後置** (`startsWith` 検証、MARK `fidfix-S129-b9`)。`round1` 新設 11 題は `.phase2/generate_result_2011h23a.json` の `key_guard_round1` と **11/11 一致** (D-143、B8 NIT-3 と同型)。他は q019 correct.jp (ベルトコンベア 1 字) と q093 correct / distractors ア・イ・エ の ①〜⑤ → (1)〜(5) (jp / zh / en) のみ。q093 の残る ①〜⑤ は key_guard note と round1 note の中だけ (D-143 で書き換えない、後置 note で説明済み) |
| `correct_answer` | `git diff -U0 data \| grep -c '"correct_answer"'` = **0** (0/2900) |
| `chumon_groups.json` | 変化は `2011h23a-q089-copy.probe.jp` の **1 行のみ**。zh / en probe とほかの 49 組は不変 |
| COPY 表 2 脚本 | 2011h23a-q089 行の `cut` 3 言語から「問 89 」/「问 89 」/「Q89 」を除いただけ。`strip` も他の COPY 行も不変。新 marker は 3 層とも q089 の設問文の先頭に一度だけ現れ、前文 (4 題で byte 同一、jp 1032 / zh 977 / en 1895 字) の中には現れない。build と lightweight の 2 脚本は同じ内容 |
| machdiff allowlist | `2011h23a-q032\|stem` の 1 行を追加しただけ。他の項目は不変 |

## 2. 源 PNG との照合

- **中問A (p33 / p34, D-165)**: 是正後の前文 (jp) は源と逐字一致した。「縦 7 画素，横 7 画素」「“0”」「“w”，…“b”」「1 行 1 列，…，7 行 7 列」「コンマ“,”」「“b,b,b”は“b3”」が該当する。図 1 キャプションは源「図1 数字の“0”のディジタル画像」と同じで、凡例が無いことも源どおり (D-158)。7×7 表の全セルは源の図と一致。4 題 × 3 層とも前文は byte 同一 (sha 一致)。jp 前文には「、」「「」が 0 で、“” 9 組。q089 設問文は源「画素データを圧縮せずに出力した場合，29 文字目から 41 文字目が，“w,b,w,w,w,b,w”…」と一致し、「問 89 」/「问 89 」/「Q89 」は 3 層とも 0。**key 再導出**: 画素 15〜21 は 3 行目 □■□□□■□ で、これは源の 4 つの選択肢図のうち エ (9) だけに当てはまる (ア 2 の 3 行目は □□□□■□□、ウ 6 は □■□□□□□) → エ (stored key と一致)
- **q045 (p17)**: 源は設問文 + 組織図だけで、削除された段落 (「位置 b は社長に直属する」等) は源に無い → 削除は正しい。**key 再導出**: b は社長から三部へ伸びる幹の途中から分岐する = 社長直属で業務部門から独立 → イ (一致)。ASCII 図は b を社長の箱の横から出しており幹の分岐点がわずかにずれるが、直属という関係は保たれている (描画補助、既存)。webp も添付あり (`has_figure` true)
- **q057 (p21)**: ラベルを削除した後の「社員―部署 / 社員→部署 / 社員←部署 / 社員←→部署」は、源の 4 図の矢印の向き (ア 無印、イ 部署側、ウ 社員側、エ 両側) と一致し、図を正しく表している。題幹の “社員” “部署” も源どおり。key ウ (多対1) は不変
- **q091 (p35)**: 源は設問文 + 回転前後の図 + 図3 だけで、削除された 1 文は源に無い。key エ ((i, j) → (j, 8−i)) を再導出して一致
- **q093 (p38)**: 選択肢は源「(1)〜(4)」と一致 (3 層)。注記は源「網掛けの部分は，表示していない。→は順序を表している。」と同じで、「（「□」）」は源に無い。key ウ ((1)→(3)→(2)→(4)→(5) の 2 番目) は一致。解説の (1)〜(5) 置換は jp / zh / en で漏れが無い
- **q094 (p38)**: 源「(1) 作業者は 1 日当たり 8 ページ」→ 衍字「1 」の除去は正しい。en の "A worker" も妥当。key イ (5 人なら 6 頁 × 5 人 × 10 日 = 300) は一致
- **q096 (p40)**: 表2 のメモ欄「(2)」は 2 行の結合セル → 2 行目を空セルにしたのは正しい (3 層)。key エ (b = ⑤、c = ④) は一致
- **q081 (p30)** 源 c「パスワードは定期的に」✓ / **q080** “可用性” ✓ / **q019 (p08)** ベルトコンベア ✓ (解説 correct の題幹引用も是正済み) / **q030 (p12)** イ「a，b」・エ「a，c」✓ (字種は同題ウの「, 」に揃えてある) / **q100 (p43)** 設問文の「，」10 箇所と「販売促進策はどれか」✓、key ウ (電子メール 7.5 − 3 = 4.5) は一致 / **q036・q051** は diff (区切りのみ) だけを確認した

## 3. 独立した見落とし抽検

writer の標本・名指し・実読リストのどれにも入っていない 8 題を、表示 jp (clean||raw + 選択肢) と源で逐字照合: **q002 q003 (p03)、q010 (p06)、q017 q018 q020 (p08)、q024 (p10、表 8 行と結合セルの平坦化を含む)、q029 (p12)**。追加で q025 (p10) も照合。
→ **見落とし 0 / 9**。読点の字種 (「, 」) は exam 全体の型 (⑨) として除外。q024 は key イ (9) も再導出して一致。

## 4. ゲート (reviewer が再実行)

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran、all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 50 組 / 200 問、probe 命中 **600/600**、生成結果と一致 |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `tsc --noEmit` (apps/web) | ✅ exit 0 |
| vitest (apps/web) | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped tests |
| machdiff vitest (`--root scripts quiz-fidelity-machdiff`) | ✅ 42/42 |
| fidfix dry-run 冪等性 | ✅ applied 0 / skipped 308、files to write 0 |
| 残存語走査 (translations 2011h23a) | ✅ 問 89 / 问 89 / Q89 / 凡例 3 種 / 流れ図は次のとおり / 直属段落 / 意味ラベル / ベルトコンベヤ / (1) 1 作業者 = 0。ヒットは 1 件で、q057 en〔表記法〕の正当な "many-to-1" |
| 事後 machdiff | 未再実行 (writer は事後 manifest を削除済み)。記録 §8(a) の writer 値 (REPORTED 0、新規の実残差 0) を、上記の leaf 差分と源の実読で間接的に裏付けた |

## 5. Notes

- **NIT-1** 記録の件数と実データが合わない。データは正しい。(a) `q100` の「、」→「，」は記録 §4b / §6 と追記した note_jp で「×6」と書いているが、実際は設問文の **10 箇所** (源も 10 箇所) と「は、どれか」の 1 箇所。(b) §4b の「jp 前文「、」18」は、前文 17 + q089 設問文 1 の合計。記録 §6 の q100 行の訂正を推奨する。note_jp の「×6」は D-143 により書き換えないので、記録に注記すれば足りる。
- **NIT-2** `q057` 題幹の〔表記法〕は ▶ / ◀ を使い、選択肢は → / ← を使っている (字形が不統一、B9 以前から)。向きは源と一致しており意味への影響はない。⑨ (choice_figures 未整備) の行に追記しておくとよい。
- **NIT-3** `q093` 解説 correct の書き出しが、jp「正解は「ウ」(3) です」/ en "ウ, (3)" とやや不自然な形になった。内容は正しい。

MAJOR / MINOR は無い。NIT-1 を記録に注記すれば commit してよい (データ修正は不要)。
