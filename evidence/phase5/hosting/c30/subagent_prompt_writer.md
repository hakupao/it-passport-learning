# C30 writer prompt (S164) — en possessive gaps in quiz translations/explanations

You are the writer for item C30 in repo /Volumes/DevSSD/Project/IT-Passport-Learning (IT Passport exam app; the quiz has en translations of Japanese questions and explanations). Do not edit any data file. Your only output is one JSON file.

Input: `evidence/phase5/hosting/c30/input_{BATCH}.json`.
- `candidates[]`: {id, where, layer, match, ctx}. `ctx` is an exact substring of the en field `where` of question `id` (where = stem | c:<letter> | correct | d:<letter> | p:<n>). They come from a regex scan with heavy false positives.
- `audit_questions[]` (batch b1 only): 13 questions where past auditors noted a missing possessive apostrophe. Each has the audit notes (Japanese) and the full en fields; find and fix every case the note names, plus any other possessive gap in those fields.

Task: for each candidate, decide if the English is a real possessive gap, i.e. a native editor would add 's or s' (e.g. "the company own capital" → "the company's own capital", "that predecessor finish time" → "that predecessor's finish time", "the provider facilities" → "the provider's facilities", "S Company strengths" → "S Company's strengths", "the shareholders meeting" → "the shareholders' meeting").
NOT gaps (keep as is): normal noun compounds and attributive nouns ("customer data", "system requirements", "market share", "user side", "employee name", "department server", "bank account", "Company A sales" as a table header or a label of a figure), "its own" / "your own" / "their own", and anything where the fix would need rewording beyond adding the apostrophe. If a noun compound is acceptable English, keep it: only fix what is clearly ungrammatical or clearly reads as a dropped possessive. When in doubt, keep.
Also keep the labels that copy a stem label verbatim (e.g. a bracketed 〔…〕 label) in mind: if you fix a bracket label like "〔S Company situation〕", check whether the en stem of the same question uses a different label and say so in the note (don't invent a new label).
Use the curly apostrophe ’ if the surrounding field already uses ’ for possessives, else the straight '. Check this per field from the ctx; when the field has no possessive at all, use ’ (the quiz en majority).

Output `evidence/phase5/hosting/c30/writer_{BATCH}.json`:
{"batch":"{BATCH}","patches":[{"id","where","lang":"en","from","to","note"}],"kept_count":N,"kept_examples":[up to 15 short strings]}
- `from` must be an exact substring of the field (take it from ctx or the audit full field), long enough to occur exactly once in that field (include 2–4 surrounding words); `to` = `from` with only the apostrophe change(s).
- One patch per occurrence; if several candidates point to the same occurrence, emit it once.
- `note`: one short English reason.
Validate before finishing: re-read the input and confirm every `from` is a substring of the given ctx / field and `to` differs only by apostrophes (a quick node script is fine). Report the patch count and kept count.
