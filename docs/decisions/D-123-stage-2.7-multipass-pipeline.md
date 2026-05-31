# D-123 — Stage 2.7 を「多段パイプライン（検出→転写→敵対的検証→適用）」に改める + scan 先行ゲート

**状態**: Locked
**日付**: 2026-05-29 (Session 74)
**文脈**: Stage 2.7 のパイロット（2015h27h, 100題, read-only `explore`×40）を主ループで実ページ裁定した直後

---

## 背景（パイロット実測）

STAGE_2.7_PLAN の当初設計は「全量 vision 照合で検出**と同時に** true_stem/choices を再転写して適用」する**単一パス**だった。パイロットで主ループが実ページ（page-05/06/34）を直接視認して裁定した結果:

1. **全量照合は妥当**: sampling（Phase C）が見逃した実データ破損を検出。q10/q11/q14/q85/q86 を実ページで破損確認（content_mismatch / choices 破損が実在）。→ D-122 の全量照合要件は正しい。
2. **この回の critical 率 = 22/100**（content_mismatch 11含む）。Phase C 母集団推定 ≈12% / sample 17% を**上回る**。content_mismatch は heuristic にも sampling にも不可視のため、母集団率は従来推定より高い可能性。
3. **agent の classification（検出）は正確**だが、**transcription（true_stem/true_choices）は不可信**:
   - ハルシネーション（q10 の true_stem が実物と異なる）
   - 桁誤り（q11 choice エ=「1,900」だが実物「1,000」）
   - **プレースホルダ捏造**（q14 true_choices = `"[Full text JIS-related choice from page]"`）
4. **group/中問 問題で見逃し（false negative）**: page-34 agent が q85（既知 content_mismatch シード）と q86 を clean 扱い。共有トピック（ICカード/DB）に引きずられ実質比較を怠った。
5. **confidence は当てにならない**（誤答も "high"）。

→ **単一パス検出＋即適用は成立しない**（転写を信じて適用すると逆にデータを汚染する）。

## 決定

**Stage 2.7 を多段パイプラインに改める**（ユーザー選択: 「全量scan先行→欠陥率実測→修復ゲート」）:

### パイプライン
1. **改良 scan（全1208ページ・read-only `explore`、Rule D）**: 各題で**印刷された stem+4択を先に逐語転写**させ（`printed_stem`/`printed_choices`、プレースホルダ厳禁・読めなければ confidence=low）、**その後** stored と比較して分類。実質比較（問われている課題・各選択肢のテキスト）を強制し、トピック一致での誤判定（group 見逃し）を抑止。
2. **scan 先行ゲート（本決定の新ゲート）**: 全量 scan 完了後、**真の母集団欠陥率＋欠陥リストをユーザーに報告**してから修復スコープを確定（修復前チェックポイント）。scan は修復方式に関わらず全量必須なので無駄がない。
3. **欠陥のみ専用検証**: 各欠陥につき独立 agent が再視認して `printed_*` を確認/訂正（敵対的、Rule D = scan とは別 lane）。
4. **検証済のみ適用**: backup + `*_corrupted_backup` 温存 + `stem_resourced_s7x` フラグ。**answer_keys / correct_answer / figure_path / group_id は不変**。
5. **再サンプル CI → Stage 3 ゲート**（D-122 条件5）。

### Rule D 配置
- scan = `explore`（read-only, 検出＋転写）
- 検証 = 別 subagent（`code-reviewer`/`explore` 別 lane, 敵対的）
- 適用 = `executor`（writer）
- Rule A = 適用後 N サンプル独立監査（`code-reviewer`）

## 却下した代替案
- **STAGE_2.7_PLAN の単一パス（検出＋即転写適用）**: パイロットで転写不可信・捏造を実証。却下。
- **agent の confidence で足切り**: 誤答も high。信頼不可。却下。
- **heuristic で修復対象を絞る**: content_mismatch（最重要・最多）が heuristic 不可視。却下（D-122 既決）。

## 影響
- STAGE_2.7_PLAN の Step 2/3 を本パイプラインで置換。Step 1（heuristic）はクロスチェック用に保持。
- コストは D-122 単一パス見積りを上回る（scan で全題逐語転写）。ユーザー受容済（option 1 選択）。
- D-122 ゲート条件5は本パイプライン完了に読み替え。
- 失敗 attempt（単一パス・パイロット）は `failures/stage_027_pilot_singlepass.md` に archive（Rule B）。
