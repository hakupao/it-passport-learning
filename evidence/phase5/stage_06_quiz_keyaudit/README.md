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

## パイロット結論
- 方法は有効 (正控一致・choices 検出・盲審計のみの bad key 捕捉)。**全量 (図題 467) へ scale 価値あり** (廉価筛査が漏らす bad key を捕捉)。
- pilot_result.json に 34 題の盲推結果。`.keyaudit/result_*.json` (gitignored) に per-id 落盘。

---

## 全量 (Session 99、路由词「Phase 1.6 全量」) — 467/467 完了

詳細 = `rule_a_audit_S99_fullsweep.md`。compare 全文 = `full_sweep_compare.txt`。Phase B critic 生出力 = `phaseB_verify_raw.txt`。

- **盲推 467/467** (Phase A: pilot 34 + run1 383 [session limit 中断→部分確定] + run2 45)。bad-key 候補 **5** / choices_faithful=false **28** / underivable **3**。
- **Phase B 検証** (verifier=critic ×3/候補, blind): 5 候補裁決。**写審分離 (deriver≠critic≠主 context)** で deriver 偽陽性 3 件を是正回避。
- **確定 bad key = 2 件 (5/5 独立一致、ユーザー承認後是正済)**:
  - `2009h21a-q012` ア→**ウ** (④実行計画策定直前=戦略立案; pilot 発見を全量で確証)。
  - `2010h22a-q091` ア→**エ** (表2=4×3×3=36 全組合せ穷举=網羅; **全量 net-new** 発見、S97 抽様外)。
- **deriver 偽陽性 3 件 (key 正、不修正)**: `2014h26h-q090` (=D-139 事前「疑い1」→ ウ 同截距+急傾き正、deriver 低解像度誤読) / `2012h24h-q091` (c=2; No.4 コースR はテキスト代請求なし→欠席検証不能) / `2009h21h-q096` (ア・イ 双方 figure-true の曖昧問、critic 全 unique=false)。
- **是正 (drift-proof)**: `quiz-keyaudit-fix-S99.mjs` (現値 assert) → raw bank → `build-quiz-corpus.mjs` 再生成。**questions.json diff = correct_answer 2 件のみ (2+/2−)**、stem/choices/quiz_index/translations 不変 (git diff 確証)。
- **検証 GREEN**: tsc 0 / eslint 0err (既存 warning 1=tTerm) / **vitest 463 passed** / build exit 0 / nft (code/file-set 不変、前回 IPA leak 0 継続)。
- **backlog (key と別軸、ユーザー指示「choices-fidelity 別 track」)**: choices_faithful=false **28 件** (値/区切り腐敗・選択肢 swap・別問混入、含 2024r06-q057 字母取り違え危険) + underivable **3 件** (`2010h22a-q094`/`2012h24h-q087`/`2015h27a-q100`、incomplete-source)。全リスト `rule_a_audit_S99_fullsweep.md` / `full_sweep_compare.txt`。

## 総括 (figkey 全数化の意義)
- S97 figkey 抽様 40/247 (strict 坏键率 0/40) が見逃した bad key を、全数 sweep が **2 件**捕捉 (q012 は pilot、q091-2010h22a は全量 net-new)。**抽様の限界を全数で克服**。
- 盲推 (key 非開示) は writer の key 追従バイアスを排し、Phase 1.5 零成本筛査 (writer が key 産出) が漏らした bad key を捕捉。
- 写審分離 (deriver=general-purpose / verifier=critic×3 / 裁決=主 context 高倍率) が deriver の低解像度誤読 (over-flag 3 件) を網兜 = **是正前の 5 独立パスで偽陽性是正を完全回避**。
