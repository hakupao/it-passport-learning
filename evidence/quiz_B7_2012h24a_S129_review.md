# B7 (2012h24a) Rule D 独立審査 — S129

- Reviewer: `b7-reviewer` (`oh-my-claudecode:verifier`, opus)。Writer = `b7-fixer` (executor)。subagent_type も context も別。
- 対象: 未 commit の `data/ip/quiz/{questions.json, translations/2012h24a.json, explanations/2012h24a.json}`、記録 `evidence/quiz_B7_2012h24a_S129.md`、是正器 `scripts/quiz-fidfix-S129-b7.mjs`。
- read-only で審査した (データ・スクリプト・git は変更していない)。HEAD 版を scratchpad に退避し、自作スクリプトで leaf 単位の差分を取った。源は `data/ip/exams/pages/2012h24a/page-NN.png` を全頁で実読 (writer の precrop は使っていない)。

## 判定: **PASS-with-notes** (MAJOR 0 / MINOR 1 / NIT 2)

## 1. git diff の説明可能性

| 検査 | 結果 |
|---|---|
| `questions.json` の変化 leaf | **24** (16 題: q004 q010×2 q020 q025 q040 q058 q070 q072 q074 q085 q086×4 q088×5 q091 q093 q094 q096)。2012h24a 以外の変化 **0** |
| `translations/2012h24a.json` の変化 leaf | **40** (stem_jp_clean 11: q024 q025 q063 q065 q071 q072 q080 q088 q091 q093 q094 q096 / zh・en 29) |
| `explanations/2012h24a.json` | final `note_jp` 15 件 (q004 q020 q040 q058 q063 q070 q071 q072 q074 q080 q085 q086 q088 q094 q096) は**すべて純粋後置** (`startsWith` で検証)。`round1` publish 11 題 (undefined → object) は `.phase2/generate_result_2012h24a.json` の round1 と **11/11 完全一致** (D-143、B6 と同型)。その他は q020 ウ jp 1、q085 エ jp/zh/en 3、q086 correct + ア/イ/エ (jp/zh/en) 12 の式引用のみ |
| 29 論理差分との対応 | q004 1 / q010 2 / q020 1 / q024 1 / q025 1 / q040 1 / q058 1 / q063 1 / q065 1 / q070 1 / q071 1 / q072 1 / q074 1 / q080 1 / q085 1 / q086 4 / q088 5 / q091 1 / q093 1 / q094 1 / q096 1 = **29**。全 hunk がこの 29 件かその訳層・解説追随に対応、説明できない変化 0 |
| `correct_answer` | `git diff -U0 data \| grep -c '"correct_answer"'` = **0** (0/2900) |
| 中問前文 | 中問 member (q085 q086 q088 q091 q093 q094 q096) の変化はすべて設問文以降・選択肢の中で、前文部分は不変。`chumon-groups-build --check` 一致 |

## 2. 源 PNG との照合 (29 論理差分すべて)

- **q085 エ** (p34): 源「牛丼の粗利益が最も多く，粗利益率も最も高い。」✓。zh「牛肉盖饭」/ en「Gyudon (beef rice bowl)」はア・イの en 形 (Oyakodon (…) / Katsudon (…)) と揃う ✓。削除後の解説エ (jp/zh/en) は「粗利益は牛丼 960,000 円が最多だが粗利益率は 50.0% でカレー 62.5% に及ばず 2 番目 → 後半が図1 と矛盾」で、数値 (200/400=50%、250/400=62.5%) も正しく、文として自立している ✓
- **q086** (p34): 源の選択肢は「F2／E2」「F2／F6」「F2／F$6」「F2／合計(E$2～E$5)」。/ への置換は D-162 どおり、他の字 (～・$・括弧) は不変 ✓。zh/en 8 field と解説の式引用 21 箇所が / に (q086 解説に残る ／ は追記 note 中の説明文 1 箇所のみ) ✓。題幹・ワークシート表は不変で、表は源と一致
- **q088** (p36/37): 源の題幹は “○”，… “×”を ✓。選択肢 4 肢は * + を ASCII、－ → - で D-162 ✓、'○' '×' と ≧ は源どおり ✓。zh/en も同一文字列 ✓ (→ MINOR-1)
- **q070 ウ** (p27): 源 “jpg” ✓ / **q071** “http://www.ipa.go.jp/” ✓ / **q072** “0110001010”・「，」×2 ✓
- **q004** (p03): 源「商店街のプロモーション」✓ (zh 商业街 / en the shopping district) / **q020 ウ** (p08): 源「身体に危害を及ぼす」✓、解説ウも追随 ✓ / **q058** (p22): 源「媒体①〜⑤のうち」✓ / **q074 ア** (p28): 源「ネットワークに接続」✓
- **q080** (p30): 図題は「在庫管理システム」(〔〕なし) ✓、処理文は “在庫数”・「，」✓。末尾の括弧書きは源に無く削除は正しい (D-158) ✓。zh/en も同じ扱い ✓
- **q065** (p25): 源の題文は “商品値引き”、表見出しは「**値引率**（%）」(「値引き率」ではない) → agent 報告の不採用は正しい ✓。変化は題文の引用符だけ ✓
- **「、」→「，」** q010 イ・ウ (p04) / q024 (p09) / q072 / q080: いずれも源は「，」✓
- **q096** (p44): 源は “0” “10100” “111” “0” “111010100” “000” ほか、(m－2) / (5－2) は半角括弧 ✓ (→ NIT-1)
- **q063** (p24): 源 “…” → 引用符だけ是正、￥ / ．の字幅は S129 主 context 裁定どおり据え置き ✓。表・選択肢は不変
- **q025** (p10): 源の表右肩「単位　百万円」✓ / **q040** (p15): 源は改行のみ ✓ / **q091** (p39)・**q093** (p42)・**q094** (p43): 源 “…” ✓

## 3. 独立した見落とし抽検

writer の標本・名指し・実読リストのどれにも入っていない CLEAN 8 題を、表示 jp (clean||raw + 選択肢) と源で逐字照合: **q005 q006 (p03)、q007 q009 (p04)、q023 (p09)、q026 (p10)、q039 (p15)、q073 (p28)**。
→ **見落とし 0 / 8**。読点の字種 (「, 」) と空白の正規化は exam 全体の型 (⑨) として除外。q023 の選択肢表は corpus の肢ごと表形式で値一致。

## 4. ゲート (reviewer が再実行)

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran、all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `tsc --noEmit` (apps/web) | ✅ exit 0 |
| vitest (apps/web) | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped tests |
| fidfix dry-run 冪等性 | ✅ applied 0 / skipped 356、files to write 0。`git status data` は 3 ファイルのまま |

## 5. Notes

- **MINOR-1** `q088` 解説の式引用が全角 － のまま: `correct.{jp,zh,en}` (正解ウの式「IF((($B$8－$C$8)*C$12+($B$9－$C$9)*$B13)…」) と `distractors.イ.{jp,zh,en}` に計 12 箇所。選択肢は D-162 で `-` にしたので、正解肢の式と解説の引用が字形で食い違う。同じ中問の q086 では解説引用 21 箇所まで揃えており、q088 だけ追随が漏れている。答え・導出には影響しない。commit 前に是正器へ 6 field の － → - を足すか、⑨ backlog に登記すること。
- **NIT-1** `q096` の raw `stem_jp` は (m－2) だけ半角括弧になり、(5－2) は全角括弧（）のまま残る。出荷層は clean (両方とも半角括弧) なので学習者には見えない (N5 型)。
- **NIT-2** 記録 §8(d) は explanations の round1 publish 11 題 (generate_result と完全一致、D-143) に触れていない。データには影響しない。

MAJOR は無い。MINOR-1 を是正するか backlog に登記すれば commit してよい。
