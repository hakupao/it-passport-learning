# Quiz Phase 2 (解析預生成) — pilot 2025r07 evidence

> Session 97 (2026-06-20) / D-137. Pilot = exam `2025r07` (100 questions, 16 figure).
> Pipeline mirrors Phase 1 (D-136): prep → generate.workflow → merge → ruleA.workflow.

## Pipeline run

| step | tool | result |
|---|---|---|
| prep | `scripts/quiz-phase2-prep.mjs 2025r07` | 100 Q (16 figure), all 100 carry existing Phase 1 translation (term consistency), glossary avg 2.5/q |
| generate | Workflow `quiz-phase2-generate.workflow.mjs` (`wf_89b6ad0d-52e`, 406 agents / 15.6M tok / ~46 min) | **100/100 done. JP PASS 99 / null 1 · TR PASS 100.** 3 suspects (key-guard) |
| merge | `scripts/quiz-phase2-merge.mjs 2025r07` | 100/100 explained, 0 missing, key_guard 100/100 complete, **suspect 3** |
| ruleA | Workflow `quiz-phase2-ruleA.workflow.mjs` (`wf_1b972648-89b`, N=14) | _(see Rule A section)_ |

- **JP null 1** = `q002` in-pipeline reviewer tool-call parse fail (infra, not content) — same harmless class as Phase 1 S92 q017 / S94 q028. JP content well-formed; TR PASS.
- Sidecar: `data/ip/quiz/explanations/2025r07.json` (schema `quiz-expl-v1`).

## key-guard (D-137-C) — embedded answer re-derivation

3 suspects flagged (the writer re-derived the answer from the figure/stem and could not confirm the keyed answer, OR the answer is not figure-derivable):

| id | figure_derivable | derived | matches_key | verdict |
|---|---|---|---|---|
| `q030` | false | エ | **true** | concept Q (著作権法); figure is just the choices table → not figure-derivable, but key correct. NOT a bad key. |
| `q071` | false | エ | **true** | concept Q (電波/プラチナバンド); same — key correct. NOT a bad key. |
| `q034` | true | **ウ** | **false** | **GENUINE BAD-KEY suspect.** see below. |

### q034 — likely bad key (non-figure computational)
Stem: 「ある商品を5,000個販売したところ、売上6,000万円・利益400万円。変動費7,000円/個。利益を1,000万円以上にするには、**少なくともいくつ販売すればよいか**。」 choices ア500/イ1,200/ウ6,200/エ7,500. stored key = **イ**.
- 単価 6,000万/5,000 = 12,000円。限界利益 12,000−7,000 = 5,000円/個。固定費 = 6,000万 − 3,500万 − 400万 = 2,100万。
- 総販売量 n: 5,000n − 2,100万 ≥ 1,000万 → **n ≥ 6,200 = ウ** (6,200 で利益ちょうど1,000万)。
- stored **イ(1,200)** = 「現状5,000個からの**追加**販売数」(差額600万/5,000) の読み。だが stem は「少なくともいくつ販売すればよいか」=**総数**を問い、「追加で/あと」の語が無い。
- **stem-faithful な正解は ウ(6,200)。stored key イ は誤りの疑いが濃厚** (key-guard が捕捉)。**q034 は非figure問** = S97 figure-key 体検 (figure問のみ) が構造的にカバーできなかったクラス → key-guard 内蔵 (D-137-C) の価値を pilot 初回で実証。
- **対応**: 主 context 裁決 = ウ 妥当。ただし answer key 改変はユーザー判断 (D-137-C/規則)。**ユーザー gate に re-key 提案として上申** (イ→ウ。re-key 後は q034 の解説を ウ 前提で再生成)。Rule A critic の独立 independent_answer でも裏取り (下記)。

## Rule A (independent critic N=14, 全 suspect 強制 + figure + plain) — `wf_1b972648-89b`

**accurate 11/14、severity: none 8 / low 3 / high 3。** key_guard_invalid: q026/q034/q066。
**重要: high 3 件すべて critic の independent_answer == stored key → 答案KEY は 0 件不良 (S97 figure-key 体検と整合)。** 問題は stem/解説の品質。

| id | severity | 実体 | 答案KEY |
|---|---|---|---|
| **q034** | high | **非figure問の stem が公式の核心語「あと」を脱落** ("少なくとも**あと**何個…"→"少なくともいくつ…")。公式正解=イ(追加1,200)、ウ(総数6,200)は引っかけ。corpus stem 破損のため generator が ウ を導出し **false-positive suspect** + 解説が「本来はウ」と誤誘導。**key イ は正しい**。choices 設計 (1,200と6,200併存) が「追加」設問を裏付け。**主 context の初回裁決 (ウ) は破損 stem に騙された誤り → critic が是正 (写審分離+独立検証の複利、S94 q052 と同型)**。 | イ ✅ (要 stem 「あと」復元 + 解説再生成) |
| **q066** | high | **figure問の raw stem 表が figure と乖離** (figure: 09:32:19=10005/001/失敗・10008/003 が存在 / corpus stem: 09:32:19=10002/002/失敗・10001/003)。**Phase 1 が clean stem 未生成**のため破損表が表示され、generator が破損 stem で解説 (誤日時・捏造データ)。**主 context が figure (page-31 crop) 実読で corpus stem 破損を確認** (critic の主張を裏取り、ただし critic 自身も小誤りあり=単一読みの限界)。**key イ は robust で正しい**。 | イ ✅ (要 figure から stem 再構成 + 解説再生成) |
| **q026** | high | **audit artifact**: ruleA-prep が raw garbled stem を渡したため critic が「stem≠figure」と誤検出。実際は **stem_jp_clean (Phase 1 figure 再構成) が表示され figure 忠実、解説も figure 忠実**。→ **ruleA-prep を clean stem 監査に修正済**。 | ウ ✅ (解説 OK、artifact) |
| q030/q054 | low | upstream raw-stem garble (q030 表セル「a」→「』」化け / q054 「何%短縮」→「何分」化け+セル garble)。解説は figure 値を正用。 | OK (stem corpus 品質) |

### 評価 (honest)
- **答案KEY = clean** (N=14 で独立 critic 0 件不良、全 high の independent_answer が stored key と一致)。S97 体検と一貫。
- **解説/stem 品質 = スケール前に要 hardening**。real high defect 2/14 (q034・q066、いずれも **破損 upstream stem が解説に伝播**)。q026 は artifact。
- **根因の主軸 = 上流 stem の OCR 破損** (非figure問の語脱落 q034 / figure問の clean stem 未生成 q066)。Phase 1 は figure問の garble stem を主対象に clean 化したが、**非figure問の語脱落と一部 figure問を取りこぼし**、S97 体検は figure問のみ対象だったため **q034 型 (非figure stem 破損) はどの既存ゲートも捕捉せず** → pilot で初捕捉。

### スケール前の hardening 提案
1. **ruleA-prep = displayed(clean) stem を監査** (修正済、q026 artifact 根絶)。
2. **generator/reviewer の figure-fidelity 強化**: figure問は stem 表が figure と食い違えば generator が figure から再構成 (Phase 1 同様) し、in-pipeline reviewer が解説の引用 figure データを figure と照合 (q066 を捕捉可能に)。
3. **suspect 解説は keyed answer 前提でクリーンに** (q034 のような「本来は別字母」誤誘導文を出さない。suspect は hold + 裁決へ回す)。
4. **upstream stem 品質**: q034 (「あと」復元)・q066 (figure から表再構成) は corpus stem 修正 (要ユーザー承認)。非figure問の stem 健全性を pre-Phase-2 で軽くサンプル監査する案も。
5. 修正後、q034/q066 を再生成し再 Rule A → クリーン確認 → スケール gate。

### 教訓 (fix-checklist 追記)
4. **写審分離+独立検証の複利を再実証**: generator・主 context (初回裁決) がともに破損 stem に騙され q034 を「bad key (ウ)」と誤判定 → 独立 Rule A critic が choices 設計+外部照合で「stem が あと 脱落・key イ 正」と是正。**単一の読み (generator も critic も) は figure/stem を誤読しうる → 多段独立 + 主 context 実読が網兜** (S94 q052 / S97 q052 と同型)。
5. **非figure問の stem も OCR 破損しうる** (語1つの脱落で正解解釈が反転=q034)。figure-only の clean 化 (Phase 1) と figure-only の体検 (S97) では捕捉不能。

## 検証 (全 GREEN)

- tsc 0 / eslint 0 err (既存 warning 1=tTerm) / **vitest 463 passed** (+8 = `quizExplanation.test.ts`) / build exit 0。
- **nft IPA leak = 0**: quiz route trace = quiz_index + questions + translations/29 + **explanations/1**。exams/sources/syllabus/question_bank = 0。

## 学び (fix-checklist 追記)

1. **key_guard の真相源は workflow の StructuredOutput 返却値** (schema 検証済)、free-form な expl_jp ファイル Write ではない (pilot で 21/100 がファイルに key_guard 脱落)。merge は `generate_result_<exam>.json` を必須入力として key_guard を読む (D-小: Phase1 の「ファイル真相源」前提を Phase2 では破る)。→ **スケール手順: generate WF 完了後、返却値を `.phase2/generate_result_<exam>.json` に永続化してから merge**。
2. **zh/en 文字列内の生 ASCII `"` が JSON Write を壊す** (S94 q091 / S97 q082 再演)。translator/generator prompt に JSON_SAFE (引用は「」/“”) を追加済。merge 前に `.phase2/expl_*.json` の parse 全数チェック推奨。
3. **merge は generate WF 直後の race に注意** (ファイル flush 途中だと一過性 parse error)。WF 完了通知後に実行。

## 成果物
- scripts×5 (`quiz-phase2-{prep,generate.workflow,merge,ruleA-prep,ruleA.workflow}.mjs`)。
- app: `quizModel.ts` (+QuizExplanationEntry/mergeExplanation/localizedExplanation)・`quizReader.ts`・`QuizSet.tsx`・i18n×3・`quiz.module.css`・`next.config.ts`・`quizExplanation.test.ts`。
- データ: `data/ip/quiz/explanations/2025r07.json` (100 解析、未 commit=ユーザー gate)。
