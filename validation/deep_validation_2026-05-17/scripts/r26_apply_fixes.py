#!/usr/bin/env python3
"""R26 iter-8 surgical corrections for the 2 R25-FRESH-RESCAN findings.

F37 — page_522 entity[3].rows[1][0].en (CIA table, Confidentiality row)
       Current: "Confidentiality\n(Confidentiality)"   (English label + redundant parenthetical)
       Fix:     "Confidentiality"                       (drop tautological parenthetical)
       Row 2 (Integrity) and Row 3 (Availability) already correct — no fix needed.

F38 — page_200 entity[1].surface.zh (ハウジングサービス)
       Current: "服务器代管服务"
       Fix:     "服务器托管服务"   (F19 canonical; matches g_453 glossary after R24 normalization)
       R19/R24 F19 missed this entity because the search criteria expected the iter-5 default.

NB: p083 R25-FRESH-RESCAN finding (jp 契約 → zh kanji leak) is a FALSE POSITIVE.
The actual zh text uses simplified 约 (U+7EA6). Within-zh term drift between
surface (合同) and definition (合同书/契约) is a Phase 2 polish item, not release-impacting.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
LOG = ROOT / "validation/deep_validation_2026-05-17/iter_8/r26_fixes_log.json"
LOG.parent.mkdir(parents=True, exist_ok=True)

sys.path.insert(0, str(ROOT / "packages/extractor/src"))
from cert_extractor.pipeline.stage7_export.emitters import emit_page_md  # noqa: E402
from cert_extractor.pipeline.stage7_export.schema import ExportEnvelope  # noqa: E402


def load_json(p):
    return json.loads(p.read_text(encoding="utf-8"))


def save_json(p, d):
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _entities(d):
    return d["entities"] if isinstance(d, dict) else d


def _patch_leaf(d, path, expected, new):
    cur = d
    for k in path[:-1]:
        try:
            cur = cur[k]
        except (KeyError, IndexError, TypeError) as e:
            return ("<navigation-failed>", f"{e!r} at key {k}")
    last = path[-1]
    try:
        old = cur[last]
    except (KeyError, IndexError, TypeError) as e:
        return ("<navigation-failed>", f"{e!r} at key {last}")
    if old != expected:
        return (old, f"mismatch: expected {expected!r}")
    cur[last] = new
    return (old, None)


def _edit(file_rel, path, before, after, err):
    e = {"file": str(file_rel), "path": path, "before": before}
    if err:
        e["intended_after"] = after
        e["skip_reason"] = err
    else:
        e["after"] = after
    return e


def fix_p522_cia_en() -> list:
    """F37: drop tautological '(Confidentiality)' parenthetical from EN cell."""
    edits = []
    for sub in ("translated/page_522.json", "output/pages/page_522.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        # entity 3 is the CIA characteristics table
        table = ents[3]
        # row 1, col 0 — Confidentiality
        cur_old, err = _patch_leaf(
            table, ["rows", 1, 0, "en"],
            "Confidentiality\n(Confidentiality)",
            "Confidentiality",
        )
        edits.append(_edit(path.relative_to(ROOT),
                           ["entities[3].rows[1][0]", "en"],
                           cur_old, "Confidentiality", err))
        save_json(path, d)
    return edits


def fix_p200_housing_zh() -> list:
    """F38: normalize p200 ハウジング surface.zh to canonical 服务器托管服务."""
    edits = []
    for sub in ("translated/page_200.json", "output/pages/page_200.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        # find entity whose surface.jp == ハウジングサービス
        idx = None
        for i, e in enumerate(ents):
            if isinstance(e, dict) and (e.get("surface") or {}).get("jp") == "ハウジングサービス":
                idx = i
                break
        if idx is None:
            edits.append({"file": str(path.relative_to(ROOT)),
                          "path": ["entities[?].surface.jp=ハウジングサービス"],
                          "skip_reason": "no entity with surface.jp=ハウジングサービス on p200"})
            save_json(path, d)
            continue
        cur_old, err = _patch_leaf(
            ents[idx], ["surface", "zh"],
            "服务器代管服务",
            "服务器托管服务",
        )
        edits.append(_edit(path.relative_to(ROOT),
                           [f"entities[{idx}].surface", "zh"],
                           cur_old, "服务器托管服务", err))
        save_json(path, d)
    return edits


def md_regen(pages):
    edits = []
    for pg in pages:
        json_path = RUN / f"output/pages/page_{pg:03d}.json"
        md_path = RUN / f"output/pages/page_{pg:03d}.md"
        if not json_path.exists():
            edits.append({"file": str(md_path.relative_to(ROOT)),
                          "skip_reason": "json not found"})
            continue
        env = ExportEnvelope.model_validate_json(json_path.read_text(encoding="utf-8"))
        md = emit_page_md(env)
        md_path.write_text(md, encoding="utf-8")
        edits.append({"file": str(md_path.relative_to(ROOT)),
                      "action": "regenerated_from_json"})
    return edits


def main():
    log = {
        "round": "R26",
        "iter": 8,
        "f37_p522_cia_en": fix_p522_cia_en(),
        "f38_p200_housing_zh": fix_p200_housing_zh(),
        "md_regen": md_regen([200, 522]),
        "false_positive_filtered": {
            "fix_id": "R25-F001_p083_kanji_leak",
            "claim": "JP kanji 契約 (U+7D04 約) leaks into ZH on p083",
            "reality": "zh uses 约 (U+7EA6 simplified) — no kanji leak. Within-zh term drift 合同/合同书/契约 is Phase 2 polish.",
            "action": "no fix applied; documented as false-positive"
        }
    }
    applied = sum(1 for k in ("f37_p522_cia_en", "f38_p200_housing_zh") for e in log[k] if "skip_reason" not in e)
    skipped = sum(1 for k in ("f37_p522_cia_en", "f38_p200_housing_zh") for e in log[k] if "skip_reason" in e)
    md_count = sum(1 for e in log["md_regen"] if "skip_reason" not in e)
    log["summary"] = {
        "json_edits_applied": applied,
        "json_edits_skipped": skipped,
        "md_regenerated": md_count,
        "false_positives_documented": 1,
    }
    LOG.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote log: {LOG}")
    print(f"  JSON edits applied: {applied}")
    print(f"  JSON edits skipped: {skipped}")
    print(f"  MD pages regenerated: {md_count}")


if __name__ == "__main__":
    main()
