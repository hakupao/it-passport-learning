# FAILURE ARCHIVE — Stage 2.7 vision agents on default (small) model

> Rule B: failed attempts archived, never deleted. Documents why Stage 2.7 vision agents MUST run
> on Opus, not the default `explore` model.

## Attempts (all on exam 2015h27h, 40 pages)
1. **Collate, stored shown, default explore model** (run `wf_4c72142c-41e`): agents ECHOED the stored
   stem into `printed_stem` and marked clean → false negatives on real content_mismatch (q10/q11).
   Also hallucinated `true_stem` and emitted literal placeholders (q14). → `stage_027_pilot_singlepass.md`.
2. **Blind transcription, default explore model** (run `wf_5f577e71-0bb`): with no stored text to copy,
   the agents could not actually read the 1432×2026 (~173 dpi) page text and HALLUCINATED:
   - q001 (clean, printed "組織が経営戦略と情報システム戦略に基づいて…実践規範はどれか") → invented
     "組織が情報セキュリティを確保…大要領にしていくこと" with fabricated choices.
   - q004 (printed "SNSを企業内に導入する目的") → invented a "DX戦略" question.
   Roughly half the page transcriptions were fabricated; the diff would be pure noise.

## Diagnosis
- Hypothesis 1 (resolution): page PNGs are 1432×2026 ≈173 dpi; Claude vision downsamples large images
  to ~1.15 MP, so dense Japanese exam text degrades. Re-rendering the PDF to 300 dpi does NOT help when
  the FULL page is fed (still downsampled to the same effective size); only per-question CROPS help.
- Hypothesis 2 (model): the default `explore` agent runs a smaller model than the Opus main loop. The
  main loop (Opus 4.8) had read q10/q11/q85 from the SAME images correctly.

## Decisive test (Opus agents, blind, page-05)
- Opus + existing 173 dpi full page → transcribed q10 AND q11 VERBATIM and correctly (q10 = software
  lifecycle / requirements-definition process; q11 = parts-yield kg problem, 225/250/900/1,000).
- Opus + 300 dpi crop → equally perfect.
→ **Root cause = MODEL.** The default explore model cannot OCR dense JP; Opus reads it accurately even
  at the existing resolution. Resolution was a red herring for prose (hi-dpi crops still help dense tables).

## Verdict
- Technical: small-model vision agents are unusable for this task (echo or hallucinate). Opus works.
- Business: blind transcription is correct ONLY with Opus. No PDF re-render needed for prose; reserve
  hi-dpi per-question crops for table/worksheet questions flagged low-confidence.

## Next attempt input → D-124
Blind transcription on `model:'opus'` (echo-proof + accurate) → mechanical NFKC+bigram diff vs stored →
candidates → independent Opus verification → apply verified-only. Reserve hi-dpi crop second pass for
table-heavy low-confidence cases.
