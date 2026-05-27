# Stage 2 AI Review Independent Audit (Rule D)

> Reviewer: code-reviewer agent (independent from executor agents that performed the review)
> Date: 2026-05-27
> Sample size: N=15

## Methodology

For each sample question, the reviewer:
1. Extracted the question data from the post-review JSON file
2. Located and read the corresponding PDF page image
3. Compared stem_jp, choices_jp, has_figure, and figure_description against the PDF source
4. Verified mathematical/logical consistency where applicable (e.g., binary arithmetic)
5. Rendered a per-question verdict: PASS or FAIL

## Results

| # | Exam | Q# | Type | Verdict | Notes |
|---|------|----|------|---------|-------|
| 1 | 2009h21a | Q20 | missing | PASS | Stem and all 4 choices match PDF exactly. has_figure=false correct (no figure in PDF). correct_answer=null is expected for missing questions added without answer key. |
| 2 | 2012h24a | Q2 | choices-swap | PASS | Stem matches. has_figure=true correct (4 diagram choices). Choices use text descriptions "(図：...)" to represent diagrams, which is an acceptable convention. figure_description accurately summarizes the 4 diagrams. |
| 3 | 2013h25a | Q52 | digit-fix | PASS | Stem matches PDF. Choices ア 0.07, イ 0.09, ウ 0.16, エ 0.45 match PDF (verified by visual inspection and mathematical proof: (1-(1-0.9)^2)*0.8 - 0.9*0.8 = 0.072 ≈ 0.07). has_figure=true correct (2 system diagrams). |
| 4 | 2015h27a | Q15 | digit-fix | PASS | Stem matches PDF: A原料10kg, B原料5kg, A=60kg, B=49kg. Choices ア4, イ6, ウ8, エ10 match. Math: min(60/10, 49/5)=min(6,9)=6 → correct_answer イ verified. |
| 5 | 2016h28a | Q89 | kanji-fix | PASS | Stem and all 4 choices match PDF exactly. Risk acceptance (リスクの受容) scenario correctly transcribed. |
| 6 | 2017h29h | Q72 | binary-fix | **FAIL** | **Over-correction.** JSON stem has binary numbers 01101010 and 01111011, but PDF clearly shows 01011010 and 01101011. Mathematical verification: PDF version 01011010+01101011=11000101=choice エ (consistent). JSON version 01101010+01111011=11100101 (matches NO choice). The AI review corrupted the binary digits. |
| 7 | 2019h31h | Q77 | digit-fix | PASS | Stem matches PDF: 5Mバイト, 100Mビット/秒, 実効20%. Choices ア0.05, イ0.25, ウ0.5, エ2 match. Math: 5*8/(100*0.2)=2 → correct_answer エ verified. |
| 8 | 2022r04 | Q18 | missing | PASS | Stem and all 4 choices match PDF exactly. Industry 4.0 question correctly transcribed. |
| 9 | 2024r06 | Q1 | stem-fix | **FAIL** | **Under-correction.** Choice ウ contains OCR error "なむど" which should be "など" (PDF clearly shows "など"). Also, stem_jp redundantly includes "問1" prefix. The AI review failed to catch the kana OCR error. |
| 10 | 2024r06 | Q11 | iso-fix | PASS | Stem and all 4 choices match PDF exactly. ISO 9001 question correctly transcribed. |
| 11 | 2025r07 | Q26 | figure | **FAIL** | **Under-correction (severe).** (a) stem_jp contains heavily garbled OCR text: "809" → should be 800, "860" → 800, "4月36日" → 4月30日, "売正短寺" → 売上計上, "1,390" → 1,300, "間還間" → garbled. (b) choices_jp has errors: ア "1,009" → 1,000, イ "1,409" → 1,400, エ "2.700" → 2,700 (period vs comma). (c) figure_description omits 取引⑤ data (PDF shows 5月29日受注400万円). The AI review did not fix the garbled table OCR. |
| 12 | 2026r08 | Q30 | missing | PASS | Stem and all 4 choices match PDF. 事業部制組織 question correctly transcribed. correct_answer=null expected for missing questions. |
| 13 | 2023r05 | Q40 | devops-fix | PASS | Stem and all 4 choices match PDF exactly. DevOps definition correctly transcribed. |
| 14 | 2018h30h | Q6 | missing | PASS | Stem (including items a/b/c) and all 4 choices match PDF. Non-functional requirements question correctly transcribed. |
| 15 | 2009h21h | Q42 | stem-fix | PASS | Stem and all 4 choices match PDF. Black-box testing question correctly transcribed. |

## Summary

- **Total: 12/15 PASS** (80%)
- **Over-corrections: 1** (Sample 6: binary digits corrupted by AI review)
- **Under-corrections: 2** (Sample 9: "なむど" OCR error missed; Sample 11: severely garbled table stem + choice digit errors unaddressed)
- **Missing data: 0**
- **Figure accuracy issues: 1** (Sample 11: figure_description incomplete, omits 取引⑤)

## Detailed Failure Analysis

### FAIL #1 — Sample 6 (2017h29h Q72): Over-correction

| Field | PDF (ground truth) | JSON (current) | Delta |
|-------|-------------------|----------------|-------|
| Operand 1 | 01011010 | 01101010 | Digits 3-4 swapped (0→1, 1→0) |
| Operand 2 | 01101011 | 01111011 | Digit 4 changed (0→1) |

**Impact**: HIGH. The question becomes unsolvable — no choice matches the sum of the JSON operands (11100101). correct_answer エ (11000101) is only valid with the PDF operands.

**Root cause**: The AI review "binary-fix" likely attempted to correct perceived OCR errors in the binary digits but introduced new errors instead.

**Remediation**: Revert operands to PDF values: `01011010` and `01101011`.

### FAIL #2 — Sample 9 (2024r06 Q1): Under-correction

| Field | PDF (ground truth) | JSON (current) | Delta |
|-------|-------------------|----------------|-------|
| Choice ウ | "...AI や機械学習**など**を取り入れた..." | "...AI や機械学習**なむど**を取り入れた..." | "など" → "なむど" |
| Stem prefix | "マーケティング..." | "問1 マーケティング..." | Redundant "問1" prefix |

**Impact**: MEDIUM. "なむど" is a nonsensical kana sequence that would confuse learners. The redundant "問1" is cosmetic.

**Root cause**: OCR misread "など" as "なむど" (む inserted); the AI review did not detect this common OCR artifact.

**Remediation**: Fix choice ウ: replace "なむど" with "など". Remove "問1 " prefix from stem_jp.

### FAIL #3 — Sample 11 (2025r07 Q26): Under-correction (severe)

The stem_jp is a garbled OCR dump of a table that was not cleaned up. Key errors:

| Error location | PDF (ground truth) | JSON (current) |
|---------------|-------------------|----------------|
| stem: 取引① amount | 800 | 809 |
| stem: 取引① 売上計上 | 800 | 860 |
| stem: 取引① 現金回収日 | 4月30日 | 4月36日 |
| stem: 取引② 売上計上 | 売上計上 | 売正短寺 |
| stem: 取引③ amount | 1,300 | 1,390 |
| stem: tail | (structured table) | 間還間 \| 6 \| 5有29日... (garbled) |
| choice ア | 1,000 | 1,009 |
| choice イ | 1,400 | 1,409 |
| choice エ | 2,700 | 2.700 (period) |
| figure_description | 取引⑤: 5月29日受注400万円 | 取引⑤: (データなし) |

**Impact**: HIGH. Multiple digit errors in both stem and choices make the question unusable for learning. The figure_description, which should compensate for the garbled table, itself contains omissions.

**Root cause**: Table OCR is inherently error-prone; the AI review detected has_figure=true and added a figure_description, but did not verify/correct the stem digits or choice values.

**Remediation**: (1) Clean the stem_jp to remove garbled table text, keeping only the prose portion. (2) Fix choice digits: ア→1,000, イ→1,400, エ→2,700. (3) Complete figure_description with 取引⑤ data.

## Conclusion

**CONDITIONAL PASS** — The AI review process is fundamentally sound (80% accuracy on a random sample), but 3 failures warrant targeted remediation before the data is used for learning content:

1. **Mandatory fix**: 2017h29h Q72 binary digits (over-correction, question unsolvable)
2. **Mandatory fix**: 2025r07 Q26 garbled table and choice digits (multiple errors)
3. **Should fix**: 2024r06 Q1 "なむど" typo (minor but visible to learners)

After these 3 fixes are applied, a spot-check of other `binary-fix` and `figure`-type corrections across the full dataset is recommended, as these two categories showed the highest error rates in this sample.
