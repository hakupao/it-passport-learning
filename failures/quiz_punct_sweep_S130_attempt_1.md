# failures — S130 ⑨ 読点・範囲記号の全庫走査 (D-172 r1r3) attempt 1 (式内 〜 の取り残し = field 内混在)

- **入力**: D-172 (R1 `、`→`，` + R3 範囲 `〜` / `~`→`～`、R2 見送り)。D-152 data lock、HEAD `13a6b22`。`node scripts/quiz-punct-sweep-S130.mjs --tier=r1r3 --apply` (attempt 1 時点の script = 表計算の式を保護区間として **〜 も含め** 丸ごと据え置く版)。範囲設計 `evidence/quiz_punct_sweep_scope_S130.md` §1〜§6。
- **産物**: 545 field / 1,763 層書込み / 276 file (questions.json・question_bank.json・by_year 29・translations 29・`.phase1/tr_*`)。
  - apply log: `data/ip/quiz/.phase2/punct_sweep_S130_r1r3_apply.log`
  - field 単位の before/after: `data/ip/quiz/.phase2/punct_sweep_S130_r1r3_applied_report.json`
  - apply 前の全層の退避: `data/ip/quiz/.phase2/punct_sweep_S130_pre_apply/` (bank・by_year・`.phase1/tr_*`・questions.json・translations、gitignored)
- **技術判定 (writer)**: PASS 相当 — 正規化 assert・parseStemBlocks / parseChoice(WithHint) の構造不変・raw 3 層一致・A7 相当 / COPY marker assert・build-quiz-corpus・keys-crosscheck --require-raw・chumon --check・assert-clean・tsc / eslint / vitest / build すべて GREEN、再 dry-run 0 件、correct_answer 0。機械ゲートはこの欠陥を検出できない (machdiff の normStr・script の canon はいずれも 〜 / ～ を同一視する)。
- **業務判定 (writer の源照合 30 field、§8)**: **FAIL (1 件)**。`2013h25h-q096` 題幹で散文の範囲は ～ になったが、式「“合計(D2〜D13)”」の 〜 は formula 保護で据え置かれ、**同一 field 内で 〜 / ～ が混在** (D-170 の混在禁止に反する)。同型で式内 〜 が残ったのは 2013h25h-q093 エ「合計(B4〜B13)+合計(C2〜C3)」・q096 エ「合計(F2〜F13)」・2014h26a-q093 ア〜エ「条件付個数(B$2〜B$36，＝A$40)」(題内の別 field と字形不一致)。源は式内の範囲記号も散文と同じ波形 (2013h25h p43「合計(B4～B13)＋合計(C2～C3)」、2014h26a p43「条件付個数(B$2 ～ B$36，＝A$40)」)、D-162 も「範囲記号は原典どおり」。
- **原因**: 保護区間の設計で「式は ASCII の型を保つ」(D-162 の演算子・区切り) を範囲記号にまで広げた。範囲記号は D-162 で ASCII 化の対象外 = 原典字形に従う側であり、R3 の対象から外す理由が無かった。scope 段階の dry-run では「formula 115 件据置」を件数で報告しただけで、**据置字形と同 field の変更字形の混在**を検査していなかった。
- **教訓**: 保護区間を設けるときは「保護区間内に残る対象字形」と「同 field の保護区間外で変わる字形」の組合せ (field 内混在) を dry-run の assert に入れる。件数の報告は混在の検出にならない。
- **次 attempt の入力 (= 実施済の差分 apply)**: script 修正 = 保護区間の判定で `formula` かつ字形が 〜 / ~ の場合は R3 を当てる (区切りの , は式の ASCII 型のまま)。`--tier=r1r3 --apply` 再実行 → 7 field / 23 層書込み / 6 file (`data/ip/quiz/.phase2/punct_sweep_S130_r1r3_apply_delta.log`、`…_delta_formula_report.json`)。全ゲート再実行 GREEN、再 dry-run 0 件、表示 jp の field 内 〜 / ～ 混在 0 (残る 〜 は 2011h23a-q093 COPY marker と probe 据置 7 題のみ)。記録は `evidence/quiz_punct_sweep_scope_S130.md` §7・§8。
