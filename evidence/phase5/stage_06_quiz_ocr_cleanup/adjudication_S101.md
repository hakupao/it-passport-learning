# OCR-garble cleanup — adjudication (Session 101, D-140 scale 方針)

> Rule A semantic-audit evidence for the deterministic OCR-garble backlog cleanup.
> Basis: Session-100 deterministic detector (`scripts/quiz-ocr-garble-scan.mjs`) →
> backlog `evidence/phase5/stage_06_quiz_phase2/ocr_garble_backlog_S100.json`
> (74 candidate hits / 55 questions). Startup word: 「OCR 清理」.

## Method (writer ≠ reviewer, Rule D)

1. **主 context adjudication** (this doc): every one of the 74 detector hits was read against
   - the **zh/en translations** (Phase-1 translator read the clean source → authoritative for MEANING), and
   - the **IPA source page images** (`data/ip/exams/pages/<exam>/page-NN.png`) for any ambiguous case.
2. **Blind independent re-derivation** (`scripts/quiz-ocr-verify-S101.workflow.mjs`): 58 derive agents,
   each given ONLY the garbled JP + zh/en + source-page path (NOT the proposed fix), re-derive the clean
   Japanese independently; the workflow compares (punctuation/space-normalized) to the proposed `to` and
   surfaces only real content disagreements. 7 FP agents independently confirm the false positives.
3. **Apply**: drift-proof full-field assert-replace on the raw bank → `build-quiz-corpus.mjs` regenerates
   the committed `questions.json`. JP-only (zh/en already clean); `correct_answer`/`quiz_index`/stems untouched.

## Display-source note (decides the stem hits)

`apps/web/src/lib/quiz/quizModel.ts:117` — the app shows `stem_jp_clean` (translation sidecar) for the
stem when present; all 29 exams are translated, so **raw `stem_jp` is never displayed**. Choices have no
clean sidecar — `choices_jp` (raw bank) **is** displayed. Therefore every real fix is a `choices_jp` field,
and all stem hits are evaluated against the displayed `stem_jp_clean`.

## Outcome

| | count |
|---|---|
| detector hits | 74 |
| stem hits (all false positives — see below) | 7 |
| distinct choice fields flagged | 66 |
| → false-positive choice fields | 8 |
| → **real choice fields fixed** | **58** |

Fix classes (58): `zero_in_alpha` 33 · `ascii_period_in_jp` 15 · `trailing_junk` 5 · `page_marker` 4 · `period_comma` 1.

## False positives (flagged by detector, NOT changed)

| id | field(s) | pattern | why it is legitimate |
|---|---|---|---|
| `2023r05-q063` | stem + ア/イ/ウ/エ | zero_in_alpha | **RAID0 / RAID1** are real RAID levels (zh/en keep `RAID0`/`RAID1`). The detector caught `D0` in `RAID0`. |
| `2014h26a-q089` | ア/イ/ウ/エ | zero_in_alpha | **ESSID `A0B1C2D3E4`** is a real alphanumeric identifier (zh/en identical). Caught `A0`. |
| `2009h21a-q044` | stem | trailing_junk + interior_fw_space | `stem_jp_clean` flow-diagram boxes `[　　] → [ A ] → …` are legitimate (raw `stem_jp` has none; clean displays). |
| `2013h25h-q074` | stem | trailing_junk | `stem_jp_clean` diagram `[ブラウザ] ― … ― [Webサーバ]` ends in a legitimate `]`. |
| `2015h27h-q009` | stem | interior_fw_space | IPA option-list full-width spacing `a　アルバイト　　b　…` (legitimate formatting). |
| `2015h27h-q087` | stem | interior_fw_space | IPA list full-width spacing (legitimate). |
| `2016h28h-q010` | stem | trailing_junk | `stem_jp_clean` diagram box `[網掛け]` ends in a legitimate `]`; raw `stem_jp` `|・` junk is **not displayed**. |

## Source-image-verified adjudications (content removal / ambiguous endings)

- **`2014h26h-q095` エ** — page-43: choice エ is `…差戻しを行う際の処理`; immediately below is `〔マネジメント〕 問96`.
  The trailing `[マネジメント]` is the **leaked section header of the next question** → strip. (All 4 choices end `〜処理`; zh/en end at 処理/processing.)
- **`2022r04-q010` エ** — page-05: choice エ ends `…相互に許諾すること` (no trailing `に`). OCR junk = `にーー 5 =三` → strip → ends `許諾すること`.
- **`2022r04-q069` エ** — page-31: choice エ ends `…次々と転送されること`; source shows `対象に，` (full-width comma). Fix `対象に.`→`対象に,` + strip trailing `こ 8`.

## Per-field fix table

See machine-readable `ocr_cleanup_fixes_S101.json` (`fixes[]` = `{id, letter, cls, from, to, zh, en, page, why}`).
Representative cases:

- **zero_in_alpha** — `0S`→`OS` (33 fields, systematic O→0 OCR; zh/en confirm OS), incl. multi-occurrence
  (`2013h25a-q070` ア/イ, `2014h26h-q078` ウ) and `BIO0S`→`BIOS` (`2013h25h-q066` ウ).
  Non-`0S` members: `ISO0`→`OSI` (`2020r02o-q096` ウ, zh/en = OSI) and `JIS 0Q`→`JIS Q` (`2025r07-q059` ア).
- **ascii_period_in_jp** — clause-boundary `X. `→`X, ` (OCR of 、, e.g. `仕様は.`→`仕様は,`) and word-internal
  spurious-period deletion (`見せかけ.る`→`見せかける`, `計.　画`→`計画`). `2010h22h-q047` イ also drops a
  spurious `む` (`定義むする`→`定義する`). ASCII `, ` chosen to match the corpus's existing punctuation style.
- **trailing_junk** — strip trailing spaces + `]`/`・`/`。` (e.g. `A   。`→`A`, `CVC (…)    ]`→`CVC (…)`).
- **page_marker** — strip leaked `ーー N …` (e.g. `…促進する。ーー 5 >`→`…促進する。`).
- **period_comma** — `2020r02o-q022` エ `編集 。する。…,`→`編集する。`.

## Verification workflow result (`wf_d188cc77-95b`, 65 agents / 2.00M tok / ~5min)

Blind re-derivation (derive agents never saw the proposed fix) + FP-confirm. Full raw output:
`verify_workflow_result_S101.json`.

| | result |
|---|---|
| derive total / live | 58 / 58 |
| **agree** (normalized match to proposed `to`) | **57** → **58 after q096 correction** |
| disagree | 1 → 0 |
| match-but-low-confidence / meaning-inconsistent | 0 |
| FP groups confirmed `false_positive` | **7 / 7** |
| FP disputed | 0 |

**The single disagreement caught a real 主 context error — `2020r02o-q096` ウ.**
- 主 context had proposed `ISO0`→**`OSI`** (anchoring on the zh/en translations, which say "OSI (Open Source Initiative)").
- The blind derive agent read `page-44.png` at high magnification and found the source literally prints **`ISO`** (+ a spurious trailing `0`); it refused to paraphrase the source to match the translation and returned `ISO`.
- **主 context re-read the source** (q052 protocol: high-mag crops `q96_acr2.png`) and confirmed the acronym is unambiguously **I-S-O** (serif I, S, round O). The whole page exhibits O→0 OCR noise (the stem itself OCR'd `Open`→`0pen`), and the letter order `ISO0` = I,S,O + phantom 0 (an `OSI` source would OCR to `0SI`, never `ISO0`).
- **Corrected fix: `ISO0`→`ISO`** (remove only the spurious `0`; preserve the source's `ISO`). The earlier `OSI` would have patched a translation-side semantic correction into the source transcription — a fidelity violation.
- **Translation backlog (out of scope here):** zh/en silently "corrected" the source `ISO`→`OSI`. The choice is a distractor (correct_answer = ア), so this does not affect correctness, but the zh/en deviate from the source acronym — flag for the translation-fidelity track, do NOT touch in this JP-only OCR cleanup.

After the q096 correction the proposed fix list equals the blind independent re-derivation for all 58 fields, and all 7 false-positive groups were independently confirmed not-garble. Writer (主 context) ≠ reviewer (workflow agents) ≠ final adjudicator (主 context source-read) — Rule D satisfied across three independent passes.
