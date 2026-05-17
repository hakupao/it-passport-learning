# V2 Translation Worker Brief — Phase 1 Deep Validation

You are an independent trilingual-translation reviewer for the Phase 1 learning-content pipeline. **Rule D 隔离**: you must NOT consult prior Stage 6 audit verdicts, Stage 5 prompt details, or any in-pipeline reviewer judgments. Your verdict is blind.

## Your task

For each assigned leaf (a `{jp, zh, en}` triple with context), you will:

1. **Read your batch list**: a JSON file containing 20 leaf entries with full provenance (leaf_id, entity_type, page, path, jp, zh, en).
2. **Optionally read the glossary**: `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/glossary/glossary.json` (908 trilingual term entries). Use this to check consistency — if a katakana term appears in the leaf and is also in glossary, verify the translation matches the glossary's `zh` / `en`.
3. **Evaluate four dimensions per leaf** for each of `zh` and `en` translations:
   - **faithfulness**: does the translation preserve the meaning of the Japanese?
   - **fluency**: is the target-language rendering natural and grammatical?
   - **glossary_consistency**: do terms match the glossary; are technical terms (英略語, IT jargon) rendered consistently?
   - **kana_helper**: for katakana foreign-loanword terms, does the rendering preserve the English/Latin form when appropriate (e.g., FinTech, HRTech), and is the source kana surface still understandable in the target?
4. **Write your batch verdict array** to: `validation/deep_validation_2026-05-17/v2_translation/batch_NN.json` (your assigned batch_id, NN = 2-digit zero-padded).

## Output schema (strict JSON, array of 20 leaf verdicts)

```json
[
  {
    "leaf_id": "itpassport_r6::question::p043::0::stem",
    "page": 43,
    "entity_type": "question",
    "jp": "...",
    "zh": "...",
    "en": "...",
    "zh_verdict": "PASS" | "WARN" | "FAIL",
    "en_verdict": "PASS" | "WARN" | "FAIL",
    "zh_findings": ["faithfulness: ...", "fluency: ..."],
    "en_findings": ["..."],
    "overall_severity": "clean" | "polish" | "defect"
  },
  ...
]
```

### Verdict rubric per language

- **PASS**: faithful + fluent + glossary-consistent. Findings empty or `low` cosmetic only.
- **WARN**: minor faithfulness drift OR fluency awkward OR glossary inconsistency. Meaning preserved.
- **FAIL**: meaning materially wrong (mistranslation, omission, hallucination), OR translation is missing/empty, OR <UNTRANSLATED> placeholder leaked through.

### overall_severity rubric

- `clean`: both zh and en = PASS, or one PASS one WARN with cosmetic finding
- `polish`: at least one WARN with substantive issue, no FAIL
- `defect`: any FAIL on either zh or en

### Finding format

Each string in `zh_findings` / `en_findings` starts with one of these categories then a colon:
- `faithfulness: <quote + what's wrong>`
- `fluency: <quote + what's awkward>`
- `glossary: <term + expected vs actual>`
- `kana_helper: <surface vs rendering>`
- `other: <description>`

Keep each finding ≤ 200 chars.

## Common defect patterns to watch for

(From Phase 1 documented polish items — don't bias your judgment but be alert):

- **Tautology**: e.g., `ストラテジ → Strategy` rendered as `战略策略（Strategy）` (redundant).
- **Circular definitions**: e.g., `グリーンIT → 绿色IT` then explanation also says "Green IT".
- **Hallucination**: target language contains content not in source (added clauses, made-up examples).
- **Glossary drift**: same Japanese term rendered differently in different leaves than in glossary.
- **Kana → wrong English**: e.g., `クルー → 机组人员` (this was a known defect, hopefully fixed).
- **K computer**: `京 (computer name)` should NOT be translated to literal `京` in en; should preserve as `K computer (京)`.
- **Numeric / era issues**: `平成30年度 / 令和2年度` should be either preserved literally or converted to FY/Gregorian consistently.
- **Choice marker**: zh choices should use `A/B/C/D` (NOT chinese 甲乙丙丁); en uses `A/B/C/D`; jp keeps `ア/イ/ウ/エ`.

## Important guardrails

- The batch JSON file is your only source for jp/zh/en triples. Read it once and process all 20 in your verdict array.
- Output must be a JSON ARRAY of 20 verdicts (or however many are in the batch — usually 20).
- Each verdict must be parseable. Use double-quoted strings, no comments, no trailing commas.
- Privacy: do not mention textbook title or author. Generic terms only.

## Final return

After writing the batch JSON, return a short summary (max 6 lines): batch_id, leaves processed, clean/polish/defect counts, top finding category, any errors.

Do NOT print verdict JSON inline.
