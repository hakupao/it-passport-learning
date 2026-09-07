# D-144 段 2 — 選択肢単位の図 (choice_figures) — 3 題全数核験 (規則 A、S117)

**対象** (②-a、S109/S112 登記): 2014h26a-q046 (正解肢テキスト「RAM（役割分担マトリクス）」が答えを書いていた) / 2014h26a-q086 (「費用累計グラフ（ア）」占位符) / 2012h24a-q002 (「（図：円と平行な二重線…）」が DFD の決め手を漏らす)。
**変更**: `scripts/quiz-choicefig-D144s2.mjs` (複合図 → 設問文残渣カット → 内容トリム → 列/行の最大空白帯で 2×2 分割 → 各象限トリム → `figures/<id>-c{A..D}.png`; raw に `choice_figure_paths`、複合 `figure_path` は `composite_figure_path_retired` へ退避; 選択肢テキストを jp「図L」/ zh「图L」/ en「Figure L」に、.phase1 含む) → `build-quiz-corpus.mjs` が `choice_figures` (basename) を投影 (4 肢必須、ファイル実在検査、has_figure 維持、複合図 null) → `build-quiz-figures.mjs` が同経路で lossless WebP 化 → `QuizQuestion.choice_figures?` → `ChoiceBody` が `<img>` (alt = 中立テキスト) → crosscheck **A6** (4 肢揃う / figure null / WebP 実在 / choices_jp=「図L」)。

## 全数核験 (N = 3 題 × 4 肢 = 12 図、主 context が源図と並べて実読)
| id | 分割 (trimmed WxH / 列帯 / 行帯) | 結果 |
|---|---|---|
| 2014h26a-q046 | 1046×505 / [395,526] / [214,260]、topCut 45 | 12/12 PASS: ア 週別バー表、イ フロー、ウ R/C マトリクス+凡例、エ 組織図。v1 で ア に設問文残渣「のはどれか。」が混入 → topCut で除去 |
| 2014h26a-q086 | 1019×831 / [487,525] / [392,437]、topCut 165 | PASS: 4 グラフとも軸ラベル・段差位置が源と一致。v1 は設問 2 行が ア に混入 + 列帯誤検出 → 設問文カット後に検出し直して解消 |
| 2012h24a-q002 | 917×556 / [395,528] / [241,288]、topCut 0 | PASS: ア アローダイアグラム、イ DFD、ウ 木、エ 特性要因図。v1 は下部の大きな余白を行帯と誤検出 → 内容トリム後に検出して解消 |
シート: `evidence/phase5/stage_06_quiz_choicefig/<id>-sheet.png`。App 描画: `q046_ja_cf.png` / `q086_en_cf.png` / `q002_zh_cf.png` (三語、alt=図ア/图ア/Figure ア、4 肢すべて img、複合図は非表示)。

## 副次発見 — `build-quiz-figures` 再実行で 2010h22a-q091 の WebP が変わった
S111 で q091 (問89 の複製で上書きされていた設問) を復元した際、源 PNG `figures/2010h22a-q091.png` は正しい「テストデータ / 出力結果」表に差し替えられたが **WebP は再生成されず**、S111 以降ずっと問89 用の「表2 出力結果表」が q091 の図として表示されていた (page-37 実読で確認: `q091_cmp.png` 左=旧 WebP、右=再生成)。今回の再生成で是正。**教訓: 源 PNG を直したら `build-quiz-figures` まで回す。crosscheck に「WebP が源 PNG より古い」検査は無い (raw が gitignored なので B 層候補) → ⑨ に登録。**

## ゲート
crosscheck A1–A6 + B1–B6 GREEN / vitest 491 (A6 を含む) / tsc 0 / eslint 0 / next build exit 0。

## Rule D (pr-review-toolkit:code-reviewer、別 agent) — PASS-with-followups → 全処置
評者の独立検証: questions.json 3 id のみ・correct_answer 変更 0・raw から `build-quiz-corpus` を再実行すると committed と byte 同一 / 4 象限のインク総和 = 元画像 (delta 0、3 題とも) / 12 図を源ページと逐枚照合 / q091 新 WebP が page-37 の問91 と一致 / build 護欄 4 種・A6 護欄 6 種の変異試験全検出 / 375px 幅で横溢れ無し。
| 級 | 指摘 | 処置 |
|---|---|---|
| MEDIUM-1 | A6 が jp しか守らず、.phase1 入力層に残る旧テキスト (「RAM（役割分担マトリクス）」等) が再 merge で zh/en に戻ると alt から答えが漏れる | A6 に translations の zh=图L / en=Figure L 検査を追加 |
| MEDIUM-2 | 2010h22a-q091 の by_year に問89 用の旧 bbox / page-36 が残存 (S111 は bank だけ修正)。bbox 再裁断で誤図が戻る | 全量実測 7 問 8 フィールド (q089〜q092 source、q091 bbox、q095/q097/q061 has_figure) を `quiz-byyear-figmeta-sync-S117.mjs` で bank に同期 + crosscheck **B6** (図メタ bank==by_year、変異試験検出) |
| MINOR-3 | v1 分割失敗の Rule B 記録が無い | `failures/quiz_choicefig_D144s2_attempt1_S117.md` |
| MINOR-4 | STATE の段 1/段 2 文が混線 | 書き分け |
| MINOR-5 | build 層が figure_path と choice_figure_paths の双掛けを通す (A6 で下流検出はされる) | build-quiz-corpus で fail に前倒し |
| MINOR-6 | 裁図内の字母 + App の字母チップで字母が二重表示 | 源の見え方を保つため据え置き (観感のみ)。段 4 の題面コンポーネント抽出時に再検討 |
| MINOR-7 | alt が中立ラベルで読み上げ利用者には無情報 | D-144 の取捨 (テキスト化は答え漏洩/失真)。段 4 前の a11y 宿題に追加 |
| NIT-8 | 象限→字母の対応が 2×2 固定で脚本は図内字母を読まない | header に前提と流用時の注意を明記 |
| NIT-9 | 旧選択肢テキストが raw で退避されず | `choices_text_retired` を raw に追加 (初回分は git HEAD から補填、脚本も以後は退避してから上書き) |
| NIT-10 | figure_type が残る | 運用時未消費、据え置き |
| NIT-11 | q091 は題幹の表 + 同じ表の図の二重表示 | §25 で登録済の「表 + 源図」二重表示クラス (段 2 以降で扱う) |
