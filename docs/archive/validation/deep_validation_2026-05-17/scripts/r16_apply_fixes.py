#!/usr/bin/env python3
"""R16 iter_4 surgical fixes for the 2 R15 release-impacting defects.

F1 — page_087 entity[4].choices[3].en
   Current (output):     "D. Option D. Worker Dispatch Contract"
   Current (translated): "Option D. Worker Dispatch Contract"
   Fix:                  drop the embedded 'Option D.' fragment so post-Stage-7
                         marker is single-prefix.
                         translated → "Worker Dispatch Contract"
                         output     → "D. Worker Dispatch Contract"

F2 — page_422 entity[2] surface.zh (term プロセス)
   Current:   "流程" (workflow / business process)
   Fix:       "进程" (OS process — matches definition "OSがCPUに出す命令... 与タスク同义"
              and sibling シングルタスク definition which already uses 进程)
   Scope:     page-level override ONLY. Do NOT touch glossary g_524 (which
              correctly maps プロセス→流程 for the ITIL/business-process pages,
              e.g. p294 service-management context). Do NOT touch page_294.

MD regeneration: re-render output/pages/page_087.md and page_422.md from the
corrected JSON via the canonical emit_page_md.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
LOG = ROOT / "validation/deep_validation_2026-05-17/iter_4/r16_fixes_log.json"
LOG.parent.mkdir(parents=True, exist_ok=True)

sys.path.insert(0, str(ROOT / "packages/extractor/src"))
from cert_extractor.pipeline.stage7_export.emitters import emit_page_md  # noqa: E402
from cert_extractor.pipeline.stage7_export.schema import ExportEnvelope  # noqa: E402


def load_json(p: Path) -> dict:
    return json.loads(p.read_text(encoding="utf-8"))


def save_json(p: Path, d: dict) -> None:
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


# ---- F1 page_087 entity[4].choices[3].en ----
def f1_page_087_en_duplicate() -> list[dict]:
    edits: list[dict] = []

    # translated/page_087.json
    t = RUN / "translated/page_087.json"
    d = load_json(t)
    ents = d.get("entities", []) if isinstance(d, dict) else d
    e4 = ents[4]
    old = e4["choices"][3].get("en")
    if old == "Option D. Worker Dispatch Contract":
        e4["choices"][3]["en"] = "Worker Dispatch Contract"
        save_json(t, d if isinstance(d, dict) else ents)
        edits.append({"file": str(t.relative_to(ROOT)), "path": "entities[4].choices[3].en",
                      "before": old, "after": "Worker Dispatch Contract"})
    else:
        edits.append({"file": str(t.relative_to(ROOT)), "path": "entities[4].choices[3].en",
                      "skip_reason": f"unexpected value {old!r}"})

    # output/pages/page_087.json
    o = RUN / "output/pages/page_087.json"
    d = load_json(o)
    e4 = d["entities"][4]
    old = e4["choices"][3].get("en")
    if old == "D. Option D. Worker Dispatch Contract":
        e4["choices"][3]["en"] = "D. Worker Dispatch Contract"
        save_json(o, d)
        edits.append({"file": str(o.relative_to(ROOT)), "path": "entities[4].choices[3].en",
                      "before": old, "after": "D. Worker Dispatch Contract"})
    else:
        edits.append({"file": str(o.relative_to(ROOT)), "path": "entities[4].choices[3].en",
                      "skip_reason": f"unexpected value {old!r}"})

    return edits


# ---- F2 page_422 entity[2] surface.zh ----
def f2_page_422_process_zh() -> list[dict]:
    edits: list[dict] = []

    # translated/page_422.json
    t = RUN / "translated/page_422.json"
    d = load_json(t)
    ents = d.get("entities", []) if isinstance(d, dict) else d
    e2 = ents[2]
    surf = e2.get("surface", {}) or {}
    if surf.get("jp") == "プロセス" and surf.get("zh") == "流程":
        surf["zh"] = "进程"
        save_json(t, d if isinstance(d, dict) else ents)
        edits.append({"file": str(t.relative_to(ROOT)), "path": "entities[2].surface.zh",
                      "before": "流程", "after": "进程"})
    else:
        edits.append({"file": str(t.relative_to(ROOT)), "path": "entities[2].surface.zh",
                      "skip_reason": f"unexpected surface {surf!r}"})

    # output/pages/page_422.json
    o = RUN / "output/pages/page_422.json"
    d = load_json(o)
    e2 = d["entities"][2]
    surf = e2["surface"]
    if surf.get("jp") == "プロセス" and surf.get("zh") == "流程":
        surf["zh"] = "进程"
        save_json(o, d)
        edits.append({"file": str(o.relative_to(ROOT)), "path": "entities[2].surface.zh",
                      "before": "流程", "after": "进程"})
    else:
        edits.append({"file": str(o.relative_to(ROOT)), "path": "entities[2].surface.zh",
                      "skip_reason": f"unexpected surface {surf!r}"})

    return edits


# ---- MD regen ----
def md_regen(pages: list[int]) -> list[dict]:
    edits: list[dict] = []
    for pg in pages:
        json_path = RUN / f"output/pages/page_{pg:03d}.json"
        md_path = RUN / f"output/pages/page_{pg:03d}.md"
        if not json_path.exists():
            edits.append({"file": str(md_path.relative_to(ROOT)), "skip_reason": "json not found"})
            continue
        env = ExportEnvelope.model_validate_json(json_path.read_text(encoding="utf-8"))
        md = emit_page_md(env)
        md_path.write_text(md, encoding="utf-8")
        edits.append({"file": str(md_path.relative_to(ROOT)), "action": "regenerated_from_json"})
    return edits


def main() -> None:
    log = {"round": "R16", "iter": 4, "f1": [], "f2": [], "md_regen": []}
    log["f1"] = f1_page_087_en_duplicate()
    log["f2"] = f2_page_422_process_zh()
    log["md_regen"] = md_regen([87, 422])
    LOG.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote log: {LOG}")
    for section in ("f1", "f2", "md_regen"):
        print(f"--- {section} ---")
        for e in log[section]:
            print(f"  {json.dumps(e, ensure_ascii=False)}")


if __name__ == "__main__":
    main()
