# RETROSPECTIVE — Stage 2.7（全量 stem/choices 源照合・修復）

> Session 74。D-122/D-123/D-124。Tier 3。Rule C。
> 目的: question_bank 2,900 題の stem/choices を源ページと全量照合し、OCR garble + content_mismatch(別問題化) を除去（answer_keys は不変・100%健全）。

## 結果サマリ

| 指標 | 値 |
|---|---|
| 全量ブラインドスキャン | 2,900/2,900（カバレッジ100%、欠損0） |
| 候補（diff乖離） | 603（20.8% raw） |
| 確定修復・適用 | **521題**（419 double-blind + 102 escalate 3-way + 4 主ループ refix）。stem 303 / choices 364 |
| Rule A 監査（N=20, 独立lane） | match17 / minor2 / mismatch1 → **95%が正問・答え正しい** |
| 未解決（stored保持・フラグ） | 62 ambiguous（`s027_unresolved`）+ 8 choice-anomaly（`s027_choice_anomaly`） |
| 残存欠陥率 | **≈5%**（既知2.4% + subtle-choice FN ~2.5%、全て answer-key 保存。初期 ~12-15% critical から低減） |
| 再CI 偽陰性率（非候補N=40） | 機械乖離4/40だが主ループ裁定で**真FN=1/40=2.5%**（distractor語句・答え不変）。残3は再CIブラインド自身の誤り＝double-blindの方が正確 |
| answer_keys / correct_answer | **不変**（100%維持） |

## 保留・継続すべき做法（What worked）

1. **二独立読み（double-blind）＋機械的 reconcile**: stored 非開示でエコー不能、2読み一致で確証。Rule D を「異 subagent_type で別 lane」で厳格運用（blind=explore / verify=code-reviewer / 3rd=general-purpose / audit=general-purpose / apply=mechanical）。
2. **検出と転写と判定の分離**: scan(検出+ブラインド転写) → diff(機械) → reconcile(判定) → apply(機械)。各段が独立検証可能。
3. **自己修復ループ**: journal harvest → 残り再算出 → 再実行。session 使用上限/レート制限の中断に対し進捗を失わず完走。
4. **scan 先行ゲート**: 高コストの全量 scan を先に回し真の欠陥率を実測してから修復スコープをユーザー確認（D-123）。
5. **backup + フラグの徹底**（Rule B）: `*_corrupted_backup` / `*_resourced_s7x` / `s027_unresolved` / `s027_choice_anomaly`。可逆・追跡可能。answer_keys 完全不可侵。

## 必ず補うべき缺口（Gaps）

1. **モデル選定を最初に検証すべきだった**: 3度のパイロット（stored開示→エコー / 小モデル→ハルシネーション）を経てやっと「Opus + ブラインド」に到達。**dense 日本語 OCR は Opus 必須**を最初の1パイロットで確かめれば数時間節約できた（D-124）。
2. **並列度の事前見極め**: 2 workflow 並列（16 concurrent Opus）でレート制限事故。**Opus vision は単一 workflow + 内部バッチ6 が安定上限**。最初からバッチ化すべきだった。
3. **多ページ問題（choices が次ページ）への未対応**: q095/q099/q086 等、選択肢が次ページに跨る中問は page-unit 単位 scan で空 choices になる。**ページ単位でなく問題単位（前後ページ含む）でのマッピングが必要**。8 anomaly + 一部 escalate の主因。
4. **表画像 choices / IF式 choices の転写限界**: 173dpi では複雑な表・式の choices を信頼転写できず escalate/anomaly に残留。**hi-dpi per-question クロップ**の二次パスが必要（D-124 で予告した表系限定流用を実施すべき）。
5. **escalate 62 + anomaly 8 の残留**: 完全ゼロには未到達。次段（hi-dpi 主ループ）で潰す。

## 主要決策の複盤（Key decisions）

- **D-122（全量照合）**: 正しかった。content_mismatch は heuristic/sampling 不可視で、全量照合のみが検出可能だった（既知 q010/q011/q085 を実証）。母集団欠陥は想定通り実在。
- **D-123（多段パイプライン化）**: 単一パス検出＋即適用がパイロットで不可信（ハルシネーション/プレースホルダ）と実証され、分離が正解。
- **D-124（Opus ブラインド + 機械diff）**: 真因がモデルだったという発見が全体の鍵。再レンダ不要で既存173dpi画像が Opus で読めた。
- **escalate の AGREE 閾値 0.85→0.62 緩和**: 自由記述JPの再転写は同一印刷でも差が出るため。確証は「両読みが stored 否定 + 互いに一致」で担保し過剰 escalate を回避。妥当。
- **コスト**: Opus 約1億トークン超・複数日。Tier 3 のデータ品質ゲートとして許容範囲だが、上記 Gap 1/2 を最初に押さえれば 2-3 割削減できた。

## 次アクション

1. 多ページ問題 + 表/式 choices を hi-dpi per-question クロップで二次修復（escalate 62 + anomaly 8 + q099/q086）。
2. Stage 3（知識マッピング）へ: 確定修復済データで開始可（D-122 ゲート条件5 = 再CI 受容後）。
