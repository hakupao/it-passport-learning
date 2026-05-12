The first **trilingual edition** of the IT パスポート (Japan Information-Technology Engineers Examination — "IT Passport") study material for **Reiwa 6 (FY 2024)**, produced from the official Japanese textbook *「いちばんやさしい ITパスポート 絶対合格の教科書＋出る順問題集」* by Kyosuke Takahashi.

Every chapter, term, table, and practice question carries three parallel renderings — **Japanese (original)**, **Chinese (zh)**, and **English (en)** — with `kana_helper` annotations on every all-katakana technical term, pairing the kana surface with the writer's reading and a one-line Chinese concept gloss. That last field is the project's reason for existing: technical material in Japan renders foreign-origin terms in katakana, and a non-native reader's bottleneck is katakana scanning, not the underlying concept.

### What you get in this release

A full pipeline run over the 579-page source: a JSON index, a per-page directory of trilingual entities, a locked glossary, a polish-items audit, plus README + integrity checksums. The pipeline (Mistral OCR → Claude Sonnet/Opus structure & translation → deterministic + LLM cross-audit) is reproducible at the commit captured by this tag.

### Audience

- Bilingual / trilingual learners preparing for the IT Passport exam who want side-by-side reading without translation lag.
- Tool builders (web app, flashcard, SRS) wanting a curated JP-source dataset with stable schemas and kana annotations — `index.json` is the entry point.

Source: project repository at `hakupao/it-passport-learning`. Decisions and trade-offs are captured in the ADR set under `docs/decisions/` of the tagged tree; the most relevant for this Release are linked in the "Provenance and reproducibility" section below.
