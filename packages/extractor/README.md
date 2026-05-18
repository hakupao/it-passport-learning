# cert-extractor

The Phase 1 pipeline that turns a single Japanese certification textbook into a trilingual (jp / zh / en) structured dataset, shipped as a GitHub Release.

> Built and validated on **IT パスポート Reiwa 6 (FY 2024)** → published as `itpassport-r6-v1.0.0` and `itpassport-r6-v1.0.2`. Designed cert-agnostic from day one (D-010).

---

## What it is

A Python package (uv workspace member, `requires-python = ">=3.11"`) that implements an 8-stage pipeline:

```
0. Unpack EPUB → raw/pages/page_NNN.jpg
1. OCR (Mistral)
2. Page classify (Claude Sonnet)
3. Hard-page re-OCR (Claude Vision, conditional)
4. Structure (Claude → entities)
4.5 Glossary extraction + lock
5. Trilingual translation (Claude, glossary-constrained)
6. Audit (deterministic + LLM reviewer per D-077)
7. Export (JSON + Markdown + dual-gate per D-078)
   → release publish (per D-081)
```

4-axis plugin architecture (D-021):

| Axis | v1 built-in | Reserved for v2+ |
|---|---|---|
| Source reader | `epub_image` | `pdf` / `txt` / `html` / `docx` / `markdown` |
| OCR engine | `mistral` | `claude_vision` / `paddle` / `olmocr` / `tesseract` |
| Translator | `claude_sonnet_46` | `gpt` / `gemini` / `deepl` |
| Exporter | `json` / `markdown` / `sqlite` | `anki` / `notion` / `csv` |

---

## Reusing for other certifications

cert-extractor is **cert-agnostic**: pipeline behavior is configured via `pipelines/<cert_id>.yaml`, and every artifact path is keyed by `cert_id`. To onboard a second certification:

1. Pick a `cert_id` (e.g., `aws_clf_c02`).
2. Drop the source into `.source/` (gitignored per D-082).
3. Write `pipelines/<cert_id>.yaml` (copy `itpassport-r6.yaml` as template — does not exist yet, see Phase 2 backlog).
4. Run the same `cert-extractor` CLI; runtime data lands at `data/<cert_id>/runs/<run_id>/<stage>/`.
5. Publish via `release.publish()` → `<cert_id>-v<semver>` GitHub Release tag.

No Phase 1 code change required; the abstraction was the whole point.

---

## Internal layout

```
packages/extractor/
├── pyproject.toml                # name="cert-extractor"
├── src/cert_extractor/
│   ├── pipeline/                 # 8 stages + dispatch + checkpoints
│   ├── plugins/                  # source / ocr / translator / exporter
│   ├── release/                  # tag_name + notes + publish (D-081)
│   └── ...
└── tests/                        # unit / integration / e2e (D-040/042)
    ├── unit/
    ├── integration/
    ├── e2e/
    └── _fixtures/                # underscore-prefixed (D-043)
```

Authoritative architecture: see `docs/decisions/` (D-005 / D-008 / D-021 / D-023 / D-025 / D-077 / D-078 / D-079 / D-080 / D-081).

---

## Status

- **Test suite**: 492 unit + integration tests (last green run logged Session 21).
- **Lint**: ruff clean.
- **Phase 1**: ✅ DONE. Two GitHub Releases shipped, no open Phase 1 work.
- **Phase 2**: brainstorm stage; design discoveries from iter-5..8 (15 systemic patterns, see `RETROSPECTIVE.md` §8 + §9) are the input.

---

## Where to read next

- New here? → root [`README.md`](../../README.md)
- Need pipeline details? → [`docs/STATE.md`](../../docs/STATE.md) §2 architecture
- Need a specific ADR? → [`docs/decisions/`](../../docs/decisions/)
- Want to see how a real run went? → [`evidence/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/`](../../evidence/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/)
