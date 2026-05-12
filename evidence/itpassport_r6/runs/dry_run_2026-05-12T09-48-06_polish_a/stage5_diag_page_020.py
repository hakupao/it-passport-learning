"""Stage 5 diagnostic — capture raw LLM response on page_020 with chunk=1.

Purpose: identify why the Stage 5 thinking-disabled re-baseline produced
206 UNTRANSLATED leaves across 40 pages (vs 0 in the v1 baseline). Page
020 is the smallest failing sample (3 figure entities, 6 leaves).

Outputs (beside this script):
- stage5_diag_page_020_responses.json  : per-leaf request + raw response
- stage5_diag_page_020_summary.md       : human-readable result
"""
from __future__ import annotations

import json
from pathlib import Path

from cert_extractor.llm.claude_client import ClaudeClient
from cert_extractor.pipeline.stage5_translate import (
    TRANSLATE_SYSTEM_PROMPT_TEMPLATE,
    USER_PROMPT_TEMPLATE,
    TranslationEngine,
    TranslationRequest,
    _glossary_lookup,
    _glossary_to_prompt_subset,
    _walk_for_paths,
    parse_translation_response,
)
from cert_extractor.schema.glossary import Glossary

RUN_DIR = Path("data/itpassport_r6/runs/dry_run_2026-05-12T09-48-06_polish_a")
PAGE = 20
EVIDENCE_DIR = Path(
    "evidence/itpassport_r6/runs/dry_run_2026-05-12T09-48-06_polish_a"
)


def main() -> int:
    structured = json.loads(
        (RUN_DIR / "structured" / f"page_{PAGE:03d}.json").read_text(
            encoding="utf-8"
        )
    )
    glossary = Glossary.model_validate_json(
        (RUN_DIR / "glossary" / "glossary.json").read_text(encoding="utf-8")
    )
    lookup = glossary.by_jp_surface()

    requests = _walk_for_paths(structured)
    unresolved = [r for r in requests if _glossary_lookup(r.jp, lookup) is None]
    print(f"page_{PAGE:03d}: total requests={len(requests)}, unresolved={len(unresolved)}")

    system = TRANSLATE_SYSTEM_PROMPT_TEMPLATE.format(
        glossary_json=_glossary_to_prompt_subset(lookup)
    )
    client = ClaudeClient()

    captures: list[dict] = []
    for i, req in enumerate(unresolved):
        batch_json = json.dumps([req.jp], ensure_ascii=False)
        user = USER_PROMPT_TEMPLATE.format(page_number=PAGE, n=1, batch_json=batch_json)
        print(f"--- call {i+1}/{len(unresolved)}: jp={req.jp!r}")
        response = client.call(system=system, user=user, tier="sonnet")
        parsed = parse_translation_response(response.text, n=1)
        capture = {
            "i": i,
            "jp": req.jp,
            "path": str(req.path),
            "response_text": response.text,
            "response_text_len": len(response.text),
            "tokens_input": response.tokens_input,
            "tokens_output": response.tokens_output,
            "cost_usd": response.cost_usd,
            "stop_reason": response.stop_reason,
            "parsed_items": parsed,
            "parsed_zh": parsed[0].get("zh") if parsed else None,
            "parsed_en": parsed[0].get("en") if parsed else None,
        }
        captures.append(capture)
        print(f"    response_text_len={len(response.text)}")
        print(f"    response_text={response.text[:200]!r}")
        print(f"    parsed={parsed}")
        print()

    out_path = EVIDENCE_DIR / "stage5_diag_page_020_responses.json"
    out_path.write_text(
        json.dumps(
            {
                "page": PAGE,
                "system_prompt_excerpt": system[:400],
                "captures": captures,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"\nDump → {out_path}")

    md_path = EVIDENCE_DIR / "stage5_diag_page_020_summary.md"
    rows = ["| # | jp | resp len | zh | en | stop |", "|---|---|---|---|---|---|"]
    for cap in captures:
        zh = (cap["parsed_zh"] or "").replace("|", "/")[:30]
        en = (cap["parsed_en"] or "").replace("|", "/")[:30]
        rows.append(
            f"| {cap['i']} | {cap['jp'][:30]} | {cap['response_text_len']} | "
            f"{zh or '∅'} | {en or '∅'} | {cap['stop_reason']} |"
        )
    md_path.write_text("\n".join(rows), encoding="utf-8")
    print(f"Summary → {md_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
