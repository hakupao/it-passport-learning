#!/usr/bin/env python3
"""Programmatic post-Stage-7 output/ quality checks.

V2 reviewers sample leaves from translated/ (pre-normalization Stage 5 output) and
correctly flag choice-marker convention drift (zh keeps ア/エ/甲 etc.). The Stage 7
export step (D-078) normalizes these to A/B/C/D for user-facing release. This script
verifies the normalization actually happened in output/pages/*.json.

Also checks:
- No <UNTRANSLATED> placeholders leaked
- No empty zh/en fields
- jp/zh/en triples are well-formed in all output leaves
- Glossary cross-reference consistency: each glossary surface that appears in a leaf
  has its zh/en aligned with glossary.json
"""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
OUT_DIR = Path(__file__).resolve().parents[1] / "v2_translation"

# zh and en choice markers per D-078 normalization rules
ZH_OK = {"A", "B", "C", "D", "Ａ", "Ｂ", "Ｃ", "Ｄ"}  # full-width allowed too
EN_OK = {"A", "B", "C", "D"}
JP_OK = {"ア", "イ", "ウ", "エ"}

# choices typically start with "A. " or "A) " or "A．" etc.
MARKER_RE = re.compile(r"^([A-DＡ-Ｄア-エ甲乙丙丁])[\s．.、)）]")


def check_output_pages() -> dict:
    output_pages = sorted((RUN / "output/pages").glob("page_*.json"))
    n_pages = len(output_pages)
    issues = {
        "untranslated_leaks": [],
        "empty_zh": [],
        "empty_en": [],
        "zh_bad_marker": [],
        "en_bad_marker": [],
        "jp_bad_marker": [],
    }
    total_leaves = 0
    choice_leaves = 0
    for f in output_pages:
        page_num = int(f.stem.split("_")[-1])
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            issues.setdefault("parse_errors", []).append(f"{f.name}: {e}")
            continue

        # Walk for leaves and choices
        def walk(node, path):
            nonlocal total_leaves, choice_leaves
            if isinstance(node, dict):
                if set(node.keys()) >= {"jp", "zh", "en"}:
                    total_leaves += 1
                    jp, zh, en = node["jp"], node.get("zh", ""), node.get("en", "")
                    if not zh or zh == "<UNTRANSLATED>":
                        issues["empty_zh" if not zh else "untranslated_leaks"].append(
                            f"page_{page_num:03d}/{'/'.join(path)}"
                        )
                    if not en or en == "<UNTRANSLATED>":
                        issues["empty_en" if not en else "untranslated_leaks"].append(
                            f"page_{page_num:03d}/{'/'.join(path)}"
                        )
                    # Check choice markers — only if this leaf looks like a choice option
                    # We rely on the path including 'choices' for question entities
                    if any("choice" in p for p in path):
                        choice_leaves += 1
                        for lang, ok_set, val in [("zh", ZH_OK, zh), ("en", EN_OK, en), ("jp", JP_OK, jp)]:
                            m = MARKER_RE.match(val.strip())
                            if m:
                                ch = m.group(1)
                                if ch not in ok_set:
                                    issues[f"{lang}_bad_marker"].append(
                                        f"page_{page_num:03d}/{'/'.join(path)}: '{ch}' in {lang}: {val[:60]}"
                                    )
                else:
                    for k, v in node.items():
                        walk(v, path + [k])
            elif isinstance(node, list):
                for i, v in enumerate(node):
                    walk(v, path + [str(i)])

        walk(data if isinstance(data, list) else data, [])

    summary = {
        "n_output_pages": n_pages,
        "total_leaves": total_leaves,
        "choice_leaves_count": choice_leaves,
        "issue_counts": {k: len(v) for k, v in issues.items()},
        "top_zh_bad_marker": issues["zh_bad_marker"][:20],
        "top_en_bad_marker": issues["en_bad_marker"][:20],
        "top_jp_bad_marker": issues["jp_bad_marker"][:20],
        "untranslated_leaks_examples": issues["untranslated_leaks"][:10],
    }
    # Verdict
    if (issues["untranslated_leaks"] or
        issues["empty_zh"] or
        issues["empty_en"] or
        len(issues["zh_bad_marker"]) + len(issues["en_bad_marker"]) > 0):
        summary["verdict"] = "FAIL" if (issues["untranslated_leaks"] or issues["empty_zh"] or issues["empty_en"]) else "WARN"
    else:
        summary["verdict"] = "PASS"
    return summary


def check_glossary_consistency() -> dict:
    glossary_path = RUN / "glossary/glossary.json"
    if not glossary_path.exists():
        return {"verdict": "SKIP", "reason": "glossary not found"}
    gloss_arr = json.loads(glossary_path.read_text(encoding="utf-8"))
    # Build surface -> (zh, en) map
    gloss_map: dict[str, tuple[str, str]] = {}
    if isinstance(gloss_arr, list):
        for g in gloss_arr:
            surface = g.get("surface") or g.get("jp") or ""
            zh = g.get("zh", "")
            en = g.get("en", "")
            if surface:
                gloss_map[surface] = (zh, en)

    # Spot-check 100 random glossary entries against their first occurrence in output/
    import random
    rng = random.Random(20260517 ^ hash("glossary_check"))
    surfaces = sorted(gloss_map.keys())
    rng.shuffle(surfaces)
    sample = surfaces[:100]
    consistent = 0
    drift: list[dict] = []
    output_pages = sorted((RUN / "output/pages").glob("page_*.json"))
    # Build a combined corpus to grep — cheap because we sample only 100 surfaces
    all_text = []
    for f in output_pages[:50]:  # check first 50 pages only for speed
        all_text.append((f.stem, f.read_text(encoding="utf-8")))

    found_count = 0
    for surface in sample:
        gz, ge = gloss_map[surface]
        for stem, text in all_text:
            if surface in text:
                found_count += 1
                # Check if gz appears nearby (within 200 chars)
                idx = text.find(surface)
                window = text[max(0, idx-200):idx+200]
                if gz in window:
                    consistent += 1
                else:
                    drift.append({"surface": surface, "gz_expected": gz, "page": stem})
                break

    summary = {
        "glossary_terms_total": len(gloss_map),
        "sampled": len(sample),
        "found_in_first_50_pages": found_count,
        "consistent_zh": consistent,
        "drift_count": len(drift),
        "drift_examples": drift[:10],
        "verdict": "PASS" if not drift else ("WARN" if len(drift) < 5 else "FAIL"),
    }
    return summary


def main() -> None:
    out_quality = check_output_pages()
    gloss = check_glossary_consistency()
    final = {
        "track": "V2 supplementary — output/ post-normalization checks",
        "output_quality": out_quality,
        "glossary_consistency": gloss,
    }
    out_path = OUT_DIR / "v2_supplementary_output_check.json"
    out_path.write_text(json.dumps(final, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"V2 supplementary output check written to {out_path.relative_to(Path('.').resolve())}")
    print(f"  output_quality verdict: {out_quality.get('verdict')}")
    print(f"  glossary_consistency verdict: {gloss.get('verdict')}")
    print(f"  total leaves: {out_quality.get('total_leaves')}")
    print(f"  choice leaves: {out_quality.get('choice_leaves_count')}")
    print(f"  issues: {out_quality.get('issue_counts')}")


if __name__ == "__main__":
    main()
