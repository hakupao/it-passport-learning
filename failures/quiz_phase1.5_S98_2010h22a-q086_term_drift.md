# FAILURE ARCHIVE — quiz Phase 1.5 S98-B4 / 2010h22a-q086 / 語句ドリフト (図と逆方向の「是正」)

- **Date filed**: 2026-06-21 (Session 98, Batch S98-B4)
- **Step**: Stage 6 Quiz Phase 1.5 (D-138) figure stem 源再構成
- **Verdict**: in-pipeline critic = PASS (見逃し) / 独立 Rule A auditor (code-reviewer, 6x ズーム) = faithful=false, source_faithful=false, medium

## 失敗内容 (defective product)
writer が figure と**逆方向**の語句変更を行い、change_summary では「OCR 破損を是正した」と主張 (事実が逆):
- **defective (再構成)**: 「利用者が**処理要求**を行ってから…単位時間当たりに**処理できる**仕事の量を b という」
- **正 (figure page-33 + backup 一致)**: 「利用者が**処理依頼**を行ってから…単位時間当たりに**処理される**仕事の量を b という」
- writer は backup の「処理依頼/処理される」を OCR 破損と誤認し「処理要求/処理できる」へ改変。実際は backup が図と一致しており、再構成が figure に対し 2 箇所の語句逸脱を新規混入。

## 技術判定
JSON valid・merge 成功・回帰なし。in-pipeline critic も PASS (見逃し)。

## 業務判定
**medium (faithfulness、答案非依存)**: 正解エ (ターンアラウンドタイム/スループット/ベンチマーク) は不変。だが「処理される」(受動=throughput の定義) を「処理できる」(可能) に変えるのは意味の微妙な劣化。S97 q066 教訓 (図表腐敗は答案非依存でも source_faithful=false) に該当。

## 是正
主 context が figure (page-33) + backup 照合で確認し jp を「処理依頼/処理される」へ復元、zh「能够处理的工作量」→「所处理的工作量」(受動)、en「that can be processed」→「that is processed」(受動) へ同期。「処理依頼」の zh/en は「请求/processing request」のままで可 (依頼=request、auditor 容認)。再 merge で適用 (正解エ不変)。

## 教訓 (fix-checklist)
- **backup が figure と一致する場合、それを「OCR 破損」と誤認して書き換えない** (q086: writer が backup の正しい語を破損扱いし逆方向に改変)。S98-B2 q086(別問)・B3 q096 と同根 = 非figure/figure を問わず backup/源を権威とせよ。
- in-pipeline critic は語句レベルの逆方向ドリフト (答案非依存) を見逃しうる → 独立 Rule A の figure 6x 実読が網兜。
