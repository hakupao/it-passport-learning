# C30 Rule D review (S164)

- Reviewer: verifier (opus), read-only. Writers = executor opus × 2 (b1, b2). Verdict: **PASS** (HIGH 0, MEDIUM 0, LOW only).

## Reviewer evidence (re-run)
- difflib per field (apply_report before/after): 33/33 fields are pure inserts of ’ ' s; no deletion/replacement.
- HEAD vs working tree: 15 exam files, 33 paths, all `.../en`; jp/zh 0; matches apply report (33 fields / 21 questions). `phase1` = [] (no translations-layer field).
- Apostrophe style: 32 fields curly ’; 2012h24a-q010 correct and p:0 straight ' (field already had company's). No mixing within a field.
- jp check per field: every fix matches a jp 「の」 (predecessor’s, company’s own, provider’s, recipient’s, shareholders’, Company B’s shareholders’, users’, client’s, seller’s, sender’s, another company’s brand). Singular/plural placement correct.
- Recall: all 637 kept candidates read; no clear missed possessive. Independent grep for the fixed patterns outside the candidate set: none.
- 13 audit questions: every possessive issue named in the notes fixed (incl. 7× oclock → o’clock in 2025r07-q063).

## LOW (out of scope → C31 candidate)
- 2010h22h-q099 correct / d:ア / p:0 label 〔S Company’s situation〕 vs en stem "[Situation of Company S]"; 2010h22h-q097 correct.en "[situation of Company S]" (lower-case s).
- 2014h26a-q089 correct "that the own IP address set on each PC" (needs rewording, e.g. "each PC’s own IP address").
- 2020r02o-q032 correct.en "the keywords learning and inference" lacks quotes; 2010h22h-q099 d:ア.en drops「インターネットによる」; 2011h23tokubetsu-q065 jp 受信者/感染者 subject wobble (past audit).
- Optional: 2014h26a-q025 d:ア/d:イ "from the user/developer viewpoint", 2014h26h-q010 c:ウ "the customer personal information" (acceptable compounds).
