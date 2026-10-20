# B10 (2010h22h) Rule D 独立審査 — S129

- Reviewer: `b10-reviewer` (`pr-review-toolkit:code-reviewer`, opus)。Writer = `b10-fixer` (executor)。subagent_type・context とも別。
- 対象: 未 commit の `data/ip/quiz/{questions.json, translations/2010h22h.json, explanations/2010h22h.json}`、`scripts/quiz-fidelity-machdiff.mjs` (allowlist 3 行)、記録 `evidence/quiz_B10_2010h22h_S129.md`、是正器 `scripts/quiz-fidfix-S129-b10.mjs`。
- read-only で審査した (データ・スクリプト・git は変更していない)。HEAD 版を scratchpad に退避し、自作スクリプトで leaf 単位・文字単位の差分を取った。源は `data/ip/exams/pages/2010h22h/page-NN.png` を sharp で切り出して原寸で実読した (writer の precrop は使っていない)。

## 判定: **PASS-with-notes** (MAJOR 0 / MINOR 0 / NIT 1)

## 1. git diff の説明可能性

| 検査 | 結果 |
|---|---|
| `questions.json` の変化 leaf | **30**、すべて 2010h22h (index 302〜399)。変化した題は 16 題 (q003 q008 q015 q022 q023 q025 q040 q042 q054 q063 q064 q080 q088 q096 q099 q100)。他 exam の変化 **0** |
| `translations/2010h22h.json` の変化 leaf | **26** (stem_jp_clean 12 + zh / en 14)。題は q026 q038 q043 q053 q063 q067 q087 q088 q089 q096 q099 q100。文字単位の差分は全件が記録 §2 の 38 論理差分 (semantic 11 + cosmetic 27、内訳を数え直して一致) と訳層の追随に対応する。説明できない変化 0 |
| `explanations/2010h22h.json` | final `note_jp` 12 件は**すべて純粋後置** (`startsWith` 検証、MARK `fidfix-S129-b10` 12/12)。`round1` の新設 9 題 (undefined → object) は `.phase2/generate_result_2010h22h.json` の `key_guard_round1` と **9/9 一致** (D-143、B7〜B9 と同型)。ほかの変化は q088 correct jp / zh / en の例示図の 1 句 (「山は時刻 1 の少し手前」) だけ |
| `correct_answer` | 変化 leaf 0 (0/2900) |
| 中問前文 | 12 member × jp / zh / en の先頭 300 字が HEAD と **36/36 一致**。q089 / q099 / q100 の変化はどれも前文より後ろの位置にある。D-167 のとおり前文の「Ｓさん」と S114 evidence は未変更 |
| machdiff allowlist | `2010h22h-q057 / q061 / q090 \|stem` の 3 行を足しただけ。既存の項目は不変 |
| 2010h22h の外 | allowlist を除いて変化 0 (`docs/discussion` の 2 行は主 context の記録) |

## 2. 源 PNG との照合

- **q003 エ (p05、正解肢)**: 「突飛なアイディアも含め，自由奔放な発言を歓迎する。」✓ / **q025 ア (p12、正解肢)**: 「…自分の PC にコピーし，PC で毎日聴いている。」✓ (衍字「レ」の除去は正しい)
- **q088 (p36 + `quiz-figures/2010h22h-q088.webp`)**: webp には例示図と、ア〜エのラベルが付いた 4 つの選択肢図が載っており、互いに判別できる (エだけが折れ線、ウは時刻 0 の 10 から下降、アは時刻 1.5 に小山、イは時刻 1 に小山)。題幹の言語化を是正した結果 (時刻 0 の 10 から上昇 → 時刻 1 の手前で 11 の山 → 時刻 3 の手前で 00 の谷 → 時刻 5 の手前で再び 11 の山) は図と一致し、推論の付記を除いたのも正しい。“11 01 00 10 11” “01 00 10 11 01” の “” は源どおり。選択肢は 3 層とも 図ア〜図エ / 图ア / Figure ア。解説の correct と distractors はもともと「図アの標本点…」の形で図を参照しており、選択肢を図参照に替えた後もそのまま筋が通る。各肢の読み (ウ: 時刻 1 は 01 をやや下回る → 01 00 10 11 10、ア: 01 01 00 10 11) も図と合う。**key を再導出**: イ = 01 00 10 11 01 で、記録と一致
- **q040 (p18)**: ア〜エの “上半期” “下半期” “年間” は源どおり (ア「“上半期”，」の形も含む)。ウ = 正解肢で、字種の変更だけ ✓
- **q063 ア (p27)**: 4 倍に拡大して実読した。源は「“”で囲む」で、“ と ” の間に字は無い → 間の " を除いたのは正しい (jp / zh)
- **誤字 4 件**: q015 ウ「ソフトウェア」(p09)、q042 エ「実地棚卸し」(p19)、q064 エ「データ蓄積」/ ア「読み込み，」(p27)、q080 エ「アクセスポイント」(p33) はすべて ✓
- **q026 (p13)**: 源の図には図題が無い → 単独行の「図 / 图 / Figure」を除去したのは正しい
- **q067 (p28)**: 表の省略記号は縦の ⋮ ✓ (3 層)
- **「、」→「，」**: q022 イ (p11)、q038 (p17)、q043 (p19)、q087 (p36)、q099 設問文とイ・ウ・エ (p48)、q100 設問文と表の「3 位以下だが，」とア〜エ (p48) はすべて源の「，」と一致する。q023 ウの補った読点 (p12)、q054 / q096 の空白除去 (p23 / p45)、q008 の閉じ ” (p07)、q053 の “x←y” (p23) も ✓
- **q089 (p38)**: 設問文「S さんは，作業分割の図において，…ようにと，先輩から指示を受けた。…として，適切なものはどれか。」は源と一致する。図題「WBS によるシステムの作業分割」と注「網掛けの部分は，表示していない。」に対する ＷＢＳ→WBS・「、」→「，」も ✓
- **allowlist**: 元の manifest と元の run 結果で machdiff を reviewer が再実行した。q057 / q061 / q090 は 3 件とも `adjudicated` と出た (字数・先頭 24 字・sha1 が一致)。3 つの field は是正していないので、apply 後も同じ値になる。それ以外の出力は記録 §3 と一致した (same 468 / AGENT_MISSED 10 / QUOTE_ASCII 4 = q040)

## 3. 独立した見落とし抽検

writer の標本・名指し・実読リストのどれにも入っていない題を、表示 jp (clean||raw + 選択肢) と源で照合した: **q007 q009 (p07)、q014 (p09)、q021 (p11、表と「A，B，C」を含む)、q024 (p12)、q036 q037 (p17)、q041 (p19)、q062 q065 (p27)、q068 (p28)、q079 q081 (p33、決定表を含む)** の 13 題、ほかに q039 (p18)。
→ **見落とし 0 / 14**。読点の字種「, 」は exam 全体の型 (⑨) なので対象から外した。

## 4. ゲート (reviewer が再実行)

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran、all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `tsc --noEmit` (apps/web) | ✅ exit 0 |
| vitest (apps/web) | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped tests |
| machdiff vitest | ✅ 42/42 |
| fidfix dry-run の冪等性 | ✅ applied 0 / skipped 200、files to write 0 |
| 事後 machdiff | 再実行していない (writer が事後 manifest を削除済み)。記録 §12(d) の値 (REPORTED 0) は、上の leaf 差分と源の実読で間接的に裏付けた |

## 5. Notes

- **NIT-1** `q100` の raw `stem_jp` (`questions.json`、出荷層ではない) には OCR 由来の語の崩れが残っている。「方針面で戦略2を進めた後」「必ず確保できる」「自社の強みで攻撃」「特定ニーズへの対応」「模倣による コスト」がそれで、源と表示層 (clean) はそれぞれ「方針案2を進めた場合」「ほぼ確保」「他社を攻撃」「適応」となっている。是正器はこの raw の読点だけを直している。表示層 (clean) は源と一致しているので出荷には影響しない。記録 §9 の N5 行に q100 raw を追記しておくとよい。

MAJOR / MINOR は無い。commit してよい (データの修正は不要)。
