# Stage 3 — 知識マッピング 実施証拠 (G3, Session 76, D-126)

> 過去問 2,900 題 → シラバス Ver.6.5（63 小分類 / 1,413 用語）へ `syllabus_refs` 充填。
> 設計: D-126（二層粒度 primary+用語tags / 基数 primary+secondary[] / 検証 双盲+coverage）。

## 手法（D-126 §手法の実装）

| # | 段階 | スクリプト / workflow | 主体 (subagent_type) |
|---|------|----------------------|---------------------|
| 1 | syllabus index 準備 | `stage03-build-index.mjs` | （確定性） |
| 1 | batch 分割 | `stage03-build-batches.mjs`（25題/batch ×116） | （確定性） |
| 2 | double-pass マッピング | `stage03-map.workflow.mjs` | A=`general-purpose` / B=`explore`（異 type, Rule D, Opus） |
| – | harvest | `stage03-harvest.mjs`（journal→master, id 検証） | （確定性） |
| 3 | reconcile（一致判定） | `stage03-reconcile.mjs` | （確定性） |
| 3 | tie-break（3rd pass 裁決） | `stage03-tiebreak.workflow.mjs` | `analyst`（A/B/auditor と異, Rule D, Opus） |
| 3 | final merge | `stage03-reconcile3.mjs` | （確定性） |
| 4 | coverage 分析 | `stage03-coverage.mjs` | （確定性） |
| 5 | Rule A 監査 | `stage03-audit.workflow.mjs` + `-build-audit` + `-audit-harvest` | `code-reviewer`（A/B/analyst と異, Rule D, Opus） |
| 6 | apply（充填+invariants） | `stage03-apply.mjs`（`.pre-s03` backup） | （確定性） |

3 つの LLM 段階（map A/B・tiebreak・audit）は全て異なる subagent_type → Rule D を全段で充足。

## 結果

### double-pass + reconcile
- 232 agent（116 batch × 2 pass）、5,799 mappings、16.6M tok。
- **primary 一致率 95.9%（2,782/2,900）**。escalate 117 + only_one_pass 1 = 118。
- 機械検証: invalid_primary 1（`strategy-12-32`、カテゴリ接頭辞誤り→tiebreak で解決）/ invalid_secondary 0 / primary_in_secondary 0 / unknown_terms 39（0.67%、索引照合で自動除去）。

### tie-break（3rd pass, analyst）
- 118 contested を裁決（106 + redo 12、Rule B 失敗アーカイブ参照）。valid id 強制選択で invalid も解消。
- final: agreed 2,782（status=agree）+ reconciled 118（status=reconciled）= **2,900**、invalid decisions 0。

### coverage（gap 分析）
- **gap node 0/63**（全小分類に最低 1 題）。
- 分布: strategy 1,028 (35.4%) / management 587 (20.2%) / technology 1,285 (44.3%)。
- IPA 公式 domain_composition（strategy 35 / management 20 / technology 45）とほぼ一致 → マッピングの妥当性を裏付ける独立シグナル。

### Rule A 監査（N=20, code-reviewer, 第3 type）
- 層化: strategy 7 / management 4 / technology 9。
- **primary: correct 18 / acceptable 2 / wrong 0 → 妥当率 100%**。
- terms: ok 14 / partial 5 / bad 1。
- pilot（N=10）も correct 9 / acceptable 1 / wrong 0 = 100%。証拠 `stage_03_pilot_audit.md`。
- 詳細 `stage_03_mapping_audit.md`。

### confidence 分布（最終）
- high 2,280 (78.6%) / medium 561 (19.3%) / low 59 (2.0%)。

## 既知の限界（非ブロック）
- **syllabus 語彙ギャップ**: knowledge_tree の terms に一部の出題語（スタンドアロン / ワイルドカード / HRM / 保守の「移行」/ システム管理基準 等）が未収録 → 該当題の `terms` が partial 化（全 audit 36% が partial/bad、ただし**全て terms のみ、primary は全件正しい**）。マッピング誤りではなくシラバス収録の限界。適用 terms は索引照合済で正規語のみ。
- 専用の「ソフトウェア保守」小分類が 63 分類に無く、management-08-25（システム開発技術）が受け皿（acceptable）。
- Stage 4 への含意: low confidence 59 題 + terms partial 題は教科書生成時に用語補完の候補。

## invariants（apply で検証済）
`correct_answer` / `answer_keys.json` / `figure_*` / `group_id` / `source` / `stem_jp` / `choices_jp` 全て不変（backup `.pre-s03` 比較で violation 0）。
