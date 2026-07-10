# Quiz Phase 2 — Session 105 adjudication (2019h31h + 2018h30a)

> Session 105 (2026-07-10) / D-137 / D-140 scale batch 4. Effort: ultracode.
> Batch = **2019h31h + 2018h30a** (最新優先, serial). Pipeline hardening: deterministic Persist (S104 What's Next #3).
> Rules: A (independent N-sample audit), B (failure archive), D (writer ≠ in-pipeline reviewer ≠ Rule A critic ≠ 主 context).
> Agent 三互異: writer=`general-purpose` / in-pipeline reviewer=`feature-dev:code-reviewer` / Rule A critic=`pr-review-toolkit:code-reviewer`.

---

## §0. Persist 恒久硬化 (LLM Persist → 決定的書込)

**Root cause (S104, Rule B)**: the generate workflow's `Persist` phase used an LLM agent to Write
`generate_result_<exam>.json` "verbatim". A resumed run's agent instead paraphrased it — emptied every
`note_jp`, dropped `jp_verdict` — a structurally valid but semantically gutted file that the (then
structure-only) verify-result passed, and merge consumed lossily.

**Fix (S105)** — remove the LLM from the serialization path:
- **Probe** (`wf_a4fcf490-9b6`): confirmed the harness writes a background workflow's script `return`
  value verbatim into the task output file's top-level `.result` (the same artifact S104 recovered 151KB
  from).
- **`quiz-phase2-generate.workflow.mjs`**: dropped the `phase('Persist')` + LLM agent block; the workflow
  now returns the FULL per-question results (untrimmed `key_guard` + round-1 + notes + verdicts) as the
  authoritative generate_result. Removed the dead `resultPath` helper + `Persist` meta phase.
- **New `quiz-phase2-persist.mjs`** `<task_output_file> <exam_id>`: reads the output file's `.result`,
  writes `generate_result_<exam>.json = {exam_id,total,done,results}` deterministically (zero LLM).
  Guards: `.result` not an object (truncated/wrong file) / exam_id mismatch / empty results → hard fail.
- **Safety**: `note_jp` is internal-only — `localizeExplanation` (quizModel.ts:297) exposes only
  `suspect`, never `note_jp` — so shipping full notes in the merged sidecar is safe and already the
  committed convention (2019r01a, S104-recovered).
- **Unit tests**: persist.mjs negative (exam_id-mismatch guard fires on probe output) + positive
  (synthetic output → correct generate_result). `verify-result` is the downstream deterministic gate.
- **First real deployment (2019h31h)**: 981KB task output → 100 results, **empty-note 0 / missing
  jp_verdict 0** = S104 lossy-mode symptoms absent. verify-result PASS.

**ruleA-prep hardening (S105)**: the old `take(figures, ~N/2)` silently dropped figures when
figures > N/2 (18 figures at N=24 audited only 12). Now forces **ALL figures + ALL stem-corruptions**
(N is a floor for the plain top-up, not a cap on the forced sets) + a new `forceNums` CLI arg to force
extra ids (e.g. tr-CONCERNS to re-check).

---

## §1. 2019h31h (平成31年度 春期) — ✅ 完了

**generate** `wf_53ae6509-f39`: **100/100 · jp PASS 100 · tr PASS 94 / CONCERNS 6 · suspect 0**.
416 agent / 12.5M tok / ~53 min, error 0, one-shot (no session-limit hit).

**persist (deterministic) → verify-result 100/100 PASS → merge**: explained 100/100, missing 0,
**SUSPECT 0**, **STEM-CORRUPTION 1 → q100**.

### q100 裁決 (主 context source read, page-41, q052 protocol)
generate key-guard flagged 2 cosmetic OCR corruptions in `choices_jp` (answer ウ=ディジタル署名 unaffected):
| letter | raw (corrupt) | source page-41 | fix |
|---|---|---|---|
| ア | 「…PC には，**05** のログインパスワード…」 | 「…**OS** のログインパスワード…」 | 05→OS |
| エ | 「…送ってもらう。**> 渦一**」 | 「…送ってもらう。」 | strip 頁脚 junk |

- Fix layer = **raw bank `choices_jp` only** (`quiz-phase2-stemfix-S105.mjs`, 2 CHOICE_FIXES, assert-once)
  → `build-quiz-corpus` → re-merge. **No trfix / explfix**: zh/en (ア=OS, エ clean) and the explanation
  distractors already carried the correct text; the `05`/`渦` survive only in the internal
  `key_guard.note_jp` audit trail (non-UI, the correct record of *why* the flag fired).
- **Invariants (git)**: questions.json diff = **2 lines** (q100 ア/エ choice values), correct_answer
  **0 changes**, quiz_index unchanged, translations unchanged.

### Rule A `wf_09ab0606-e6d` — N=28 (all 18 figures + q100 + tr-CONCERNS 5 + plain 4)
**accurate 28/28 · severity none 21 / low 7 · 0 medium/high · keyGuardMismatch 0 · independent_answer ==
stored key 28/28 (bad key 0)**.

- The 5 tr-CONCERNS re-checked (q024/q038/q063/q090/q094) all came back accurate → the CONCERNS were
  benign (validated the decision to force-audit them).
- **7 low findings — all non-answer-affecting → backlog / 不動**:
  - zh 本土 polish: q026 (成长率→增长率, BCG), q072 (妥当性 untranslated), q090 (耐障碍→耐故障),
    q094 (rootkit「内核级隐藏工具」over-qualified) → **zh-polish backlog** (S102–S105 累積).
  - q071 [en]: CJK 「」 brackets in English (from the JSON_SAFE quoting guidance, systematic) →
    **en-style backlog**.
  - q052 [both]: エ distractor calls it an "a↔c swap" but it is a cyclic shift; the per-value wrong
    points and the wrong-verdict are substantively correct (critic confirmed) → **backlog** (nuance).
  - q078 [jp]: `key_guard.note_jp` meta-description references a non-existent stem_jp_clean; internal,
    non-UI, no derivation impact → **不動** (note artifact, S104 q095 同型).

### 検証 (GREEN)
tsc 0 / eslint 0 err (既存 warning 1=tTerm) / **vitest 463** / build exit 0 /
**nft IPA-source leak 0** (exams/sources/question_bank/syllabus=0; explanations sidecars traced = 9).

**証拠**: `ruleA_result_S105_2019h31h.json`.

---

## §2. 2018h30a (平成30年度 秋期) — (進行中 / 追記予定)
