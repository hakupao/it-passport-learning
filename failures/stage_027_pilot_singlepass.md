# FAILURE ARCHIVE — Stage 2.7 single-pass (detect+transcribe+apply) pilot

> Rule B: failed attempts are archived, never deleted. This documents why the STAGE_2.7_PLAN
> single-pass design was abandoned in favour of the D-123 multi-pass pipeline.

## Attempt
- **What**: STAGE_2.7_PLAN Step 2 design — one read-only `explore` agent per page unit views the
  source page, classifies each question, AND (for criticals) transcribes `true_stem`/`true_choices`
  in the same pass; Step 3 applies those transcriptions directly.
- **Pilot scope**: exam `2015h27h` (40 page units, 100 questions). Workflow run `wf_4c72142c-41e`
  (task `wxgk8as5r`). 40/40 units, 100 verdicts, 2.9M subagent tokens, 156s.
- **Raw output**: `/private/tmp/.../tasks/wxgk8as5r.output` (truncated copy) + run journal preserved
  under the workflow transcript dir; harvested snapshot in `evidence/phase5/stage_027_pilot_2015h27h.md`.

## Result (main-loop adjudication against the real page images)
- **Detection (classification) = accurate.** Manually confirmed via page-05/06/34:
  - q10 stored stem (ライセンス管理) ≠ printed (ソフトウェアライフサイクル/要件定義プロセス) → real content_mismatch.
  - q11 stored (販売数量%増の数学) ≠ printed (部品Z原材料投入量kg＋表) → real content_mismatch.
  - q14 stored choices (a,b/a,c/b,d/c,d) ≠ printed (JIS 全文4択) → real choices defect.
  - q85 stored (社員番号S0003の所属部署名→結合列) ≠ printed (調べる表とその順番) → real content_mismatch.
- **Transcription (true_stem/true_choices) = UNRELIABLE.** This is the fatal flaw for a single pass:
  - q10 `true_stem` was a hallucination (did not match the printed stem).
  - q11 `true_choices` エ = "1,900" but the page prints "1,000".
  - q14 `true_choices` = literal placeholder `"[Full text JIS-related choice from page]"` (fabricated).
- **False negatives in group/中問 questions.** page-34 agent classified q85 (known content_mismatch
  seed from Phase C) AND q86 as clean — misled by shared topic keywords (ICカード/DB), did not compare
  the actual task being asked.
- **`confidence` field is not trustworthy** (the q14 placeholder verdict was marked "high").

## Technical verdict
Applying agent-provided `true_stem`/`true_choices` would have **further corrupted** the data
(hallucinated stems, wrong digits, literal placeholders). Single-pass is unsafe.

## Business verdict
Full collation is still REQUIRED (it found real defects sampling missed — D-122 validated). But the
method must split into detect → (independent) transcribe/verify → apply, and the scan must force
verbatim transcription FIRST to cut false negatives.

## Next attempt input → D-123 multi-pass pipeline
1. Improved scan: transcribe printed stem+4 choices VERBATIM first (no placeholders; illegible →
   confidence=low), then compare substance per-choice; explicit group-question warning.
2. scan-first gate: report true population defect rate before committing repair cost.
3. Per-defect independent verification (Rule D, adversarial) before apply.
4. Apply verified-only with backups; answer_keys/correct_answer untouched.
