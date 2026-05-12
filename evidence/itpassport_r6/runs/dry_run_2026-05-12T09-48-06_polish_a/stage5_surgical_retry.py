"""Stage 5 surgical retry — re-translate only the leaves that still carry
the UNTRANSLATED sentinel after attempt #4 chunk=1 run.

Per D-080 §2.3 acceptance: 0 UNTRANSLATED leaves required so Stage 6 D2
doesn't FAIL the run. Attempt #4 left 44 occurrences on 13 pages
(13 distinct Term/definition fields, each contributes 2 UNT = zh+en
counts). All failures are long Japanese definition strings with embedded
`「」` quotes — likely a stochastic LLM JSON-formatting issue at chunk=1.

Strategy: for each affected page, re-walk requests, call the translation
engine on the residual UNTRANSLATED leaves only (max-items-per-call=1,
sonnet, thinking off), patch the translated/page_NNN.json in place.

Output:
- updates translated/page_NNN.json in place (only the failed leaves)
- writes surgical_retry_log.json beside this script
- prints per-leaf success/fail with response excerpts
"""
from __future__ import annotations

import json
from pathlib import Path

from cert_extractor import UNTRANSLATED
from cert_extractor.llm.claude_client import ClaudeClient
from cert_extractor.pipeline.stage5_translate import (
    TRANSLATE_SYSTEM_PROMPT_TEMPLATE,
    USER_PROMPT_TEMPLATE,
    _glossary_to_prompt_subset,
    parse_translation_response,
)
from cert_extractor.schema.glossary import Glossary

RUN_DIR = Path("data/itpassport_r6/runs/dry_run_2026-05-12T09-48-06_polish_a")
EVIDENCE_DIR = Path(
    "evidence/itpassport_r6/runs/dry_run_2026-05-12T09-48-06_polish_a"
)


def _walk_failures(obj, _path=""):
    """Yield (parent_dict, key_jp, jp) for every Trilingual dict whose
    zh/en still carries the sentinel."""
    if isinstance(obj, dict):
        jp = obj.get("jp")
        zh = obj.get("zh")
        en = obj.get("en")
        if (
            isinstance(jp, str)
            and (zh == UNTRANSLATED or en == UNTRANSLATED)
        ):
            yield obj
        for value in obj.values():
            yield from _walk_failures(value, _path)
    elif isinstance(obj, list):
        for item in obj:
            yield from _walk_failures(item, _path)


def main() -> int:
    glossary = Glossary.model_validate_json(
        (RUN_DIR / "glossary" / "glossary.json").read_text(encoding="utf-8")
    )
    system = TRANSLATE_SYSTEM_PROMPT_TEMPLATE.format(
        glossary_json=_glossary_to_prompt_subset(glossary.by_jp_surface())
    )
    client = ClaudeClient()

    log: list[dict] = []
    pages_touched = 0
    leaves_fixed = 0
    leaves_failed = 0

    for page_path in sorted((RUN_DIR / "translated").glob("page_*.json")):
        data = json.loads(page_path.read_text(encoding="utf-8"))
        failures = list(_walk_failures(data))
        if not failures:
            continue
        page = int(page_path.stem.replace("page_", ""))
        print(f"=== page_{page:03d}: {len(failures)} leaves to retry")
        page_changed = False
        for trilingual in failures:
            jp = trilingual["jp"]
            user = USER_PROMPT_TEMPLATE.format(
                page_number=page,
                n=1,
                batch_json=json.dumps([jp], ensure_ascii=False),
            )
            response = client.call(system=system, user=user, tier="opus")
            parsed = parse_translation_response(response.text, n=1)
            zh = (parsed[0].get("zh") if parsed else "") or ""
            en = (parsed[0].get("en") if parsed else "") or ""
            ok = bool(zh) and bool(en)
            if ok:
                trilingual["zh"] = zh
                trilingual["en"] = en
                page_changed = True
                leaves_fixed += 1
                print(f"  PASS jp={jp[:40]!r}...")
            else:
                leaves_failed += 1
                print(
                    f"  FAIL jp={jp[:40]!r}... "
                    f"response_text_len={len(response.text)}"
                )
            log.append(
                {
                    "page": page,
                    "jp": jp,
                    "passed": ok,
                    "zh": zh,
                    "en": en,
                    "response_text_len": len(response.text),
                    "response_text_excerpt": response.text[:200],
                    "cost_usd": response.cost_usd,
                }
            )
        if page_changed:
            page_path.write_text(
                json.dumps(data, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            pages_touched += 1

    summary = {
        "pages_touched": pages_touched,
        "leaves_fixed": leaves_fixed,
        "leaves_failed": leaves_failed,
        "total_retries": leaves_fixed + leaves_failed,
        "log": log,
    }
    out = EVIDENCE_DIR / "stage5_surgical_retry_log.json"
    out.write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\nSummary: pages_touched={pages_touched}, fixed={leaves_fixed}, failed={leaves_failed}")
    print(f"Log → {out}")
    return 0 if leaves_failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
