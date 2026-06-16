# Failure archive — Quiz Phase 1 S93 / `2014h26h-q086` attempt 1

> Rule B (失敗 attempt 不删). Batch S93 (Session 93). Figure question (表計算, page-35).
> Defective artifact: `quiz_phase1_S93_2014h26h-q086_attempt_1_defective.json` (pre-fix `tr_` output).

## 入力 (源)

- `data/ip/quiz/.phase1/input_batch_S93.json` の `id==="2014h26h-q086"`。
- raw `stem_jp` は OCR で全面崩壊（行4=`10/30/40/2/6/8/90/11`、設問対象を `a〜d`・行14に配置、合計 884 等、figure と全く別物）。
- 権威源: `data/ip/exams/figures/2014h26h-q086.png` (crop) + `data/ip/exams/pages/2014h26h/page-35.png` (フルページ)。
- correct_answer = `ウ` (=22)。

## 産物 (defective)

- translator (general-purpose, opus) は figure を読み `stem_jp_clean` で表を**大半正しく再構成**（`a` を単一・セル I15 に正置、参照を `セルI4〜I15` に是正、行4-11/13-16 は figure と一致）。
- **残存欠陥**: 表 **行12 (17:00〜) の現状 東/西 を転置** — `stem_jp_clean` = `88 | 86`、figure = `86 | 88`。zh/en にも伝播。
- in-pipeline reviewer (code-reviewer) は 2 ラウンドとも **FAIL**（表が raw と大きく異なる点を疑問視。ただし具体的欠陥セルは未特定）。repair でも未修正。

## 技術判定

- merge 構造検査は通過（id 一致・zh/en 非空・4 択完備）。**構造検査は表内部整合を見ない**ため落盘した。

## 業務判定 (Rule A 独立 critic)

- `accurate=false / severity=medium / clean_stem_faithful=false`。
- **footing 証明**: 行16 表示合計は 東=804・西=808。defective の行12 `88|86` では東列実セル和=806・西列和=806 となり **footing が破綻**。figure の `86|88` なら東和=804・西和=808 で自己整合。→ critic の指摘が正しい。
- **正解根拠は不変**: 設問が問う `a=I15` (20:00〜21:00 の施策後オペレータ数) は行12非依存。`a=ceil(158×8/60)=ceil(21.06)=22=ウ`。zh/en 選択肢 ア20/イ21/ウ22/エ23 と正解 ウ も三語保持。

## 次 attempt 入力 (=採用した是正)

- **surgical fix**: `stem_jp_clean` / `stem.zh` / `stem.en` の行12 `B|C` を `88 | 86` → `86 | 88` に転置是正（他セル・行・選択肢・正解は不変）。
- 検算: 是正後 東列和=804・西列和=808 で footing 一致（figure と完全一致）。
- 独立再検証 (Rule D, verifier ≠ fixer) で figure 照合 PASS を取得。

## 学び (fix-checklist)

- **figure 表の大規模再構成は footing/合計セルで内部整合を機械検算せよ**: 1 行の 2 セル転置は見た目では気付きにくいが、合計行との突き合わせ（列和 vs 表示合計）で機械的に検出できる。in-pipeline reviewer は「raw と違いすぎる」と FAIL したが欠陥セルを特定できず、**独立 Rule A critic の footing 分析が pinpoint**（写審分離 + 独立抽検の複利、S88 q072 と同系）。
- 構造検査（merge）≠ 意味検査（Rule A）。表の内部数値整合は Rule A 領域。
