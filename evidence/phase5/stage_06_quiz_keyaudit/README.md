# Quiz Phase 1.6 (D-139-B) — key + choices 完整性 盲推審計

> Session 98 (2026-06-21) / D-139-B。Phase 1.5 (stem 源再構成) 完了後、Phase 2 前に key/choices の上流欠陥を網羅検出する。
> 方式: 図題の答案を figure + 忠実 stem から**盲推** (stored key 非開示=writer の key 追従バイアス回避、S98 q092 教訓) → 別途 questions.json の key と比対 → mismatch を独立 critic + 主 context 高倍率実読で裁決 (写審分離 Rule D)。choices↔figure 忠実度も同時照合。

## パイプライン (scripts)
1. `quiz-keyaudit-prep.mjs <exam>` — 図題の blind 入力 (faithful stem + choices + figure、**correct_answer は意図的に除外**) → `.keyaudit/input_<exam>.json`。
2. `quiz-keyaudit-batch.mjs <label> <exam...>` — バッチ結合 (skip-existing で result 済を除外)。
3. Workflow `quiz-keyaudit.workflow.mjs` (args={input_path, items:[{id}]}) — deriver=general-purpose(opus) が figure 両読で盲推 + choices 照合 → `.keyaudit/result_<id>.json` 落盘 + StructuredOutput。
4. `quiz-keyaudit-compare.mjs [exam]` — result vs questions.json key 比対 → bad-key 候補 / choices 腐敗 / underivable を報告。

## パイロット (2009h21a + 2024r06、図題 34) — 方法検証成功
- **盲推 34/34** (high 33 / medium 1、underivable 0)。
- **正控 (Phase 1.6-A で修正済の key) 一致**: `2009h21a-q091`→イ ✓ / `2009h21a-q100`→ウ ✓ (修正の正しさ + 誤報なしを実証)。
- **新 bad key 候補 1**: **`2009h21a-q012`** (盲推=ウ、stored key=ア)。図 (page-06) は ①②③④ 全空欄→実行計画策定。規範順序 ①ビジョン設定→②環境分析→③CSF抽出(ア)→④戦略立案(ウ) で ④=**ウ**。**Phase 1.5 の derived_answer 零成本筛査はこれを漏らした** (当時 writer が key=ア に追従して ア を産出) → **盲推審計のみが捕捉=本審計の価値**。顺序题は算術ほど確定的でないため次 session で独立 critic 再導出 + 主 context 実読で確証してから是正。
- **choices 腐敗 3**: `2009h21a-q036` (choices イ「2.000」→正「2,000」、区切り記号腐敗)・`2024r06-q057` (ア〜エ全て c/d 逆転、図と不一致=既知 q057)・`2024r06-q081` (選択肢の表列構成腐敗: 発注者名重複/商品番号↔商品名取り違え)。

## 結論
- 方法は有効 (正控一致・choices 検出・盲審計のみの bad key 捕捉)。**全量 (図題 467) へ scale 価値あり** (廉価筛査が漏らす bad key を捕捉)。
- pilot_result.json に 34 題の盲推結果。`.keyaudit/result_*.json` (gitignored) に per-id 落盘。
