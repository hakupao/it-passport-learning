#!/usr/bin/env python3
"""R13: remaining surgical fixes + MD regeneration for R11-touched pages.

Fixes:
  F13 — p200 ハウジングサービス surface zh disambig (same as F12 was for p561)
        '主机托管服务' → '服务器代管服务'; en stays 'Housing Service'
  F14 — p566 entity[1] バックドア definition restore
        wrong: "システムに不正に侵入されたあとのアクセス経路"
        right (OCR): "システムに意図的に設けられた秘密のアクセス経路"
  F15 — p566 entity[15] ショルダーハック definition fix
        wrong: "のぞき見防止フィルムを貼ること" (this is the COUNTERMEASURE)
        right: write proper attack definition

  REGEN — regenerate output/pages/page_NNN.md from output/pages/page_NNN.json
         for the 5 pages touched by R11/R13: 124, 200, 445, 561, 566
         (R11 only modified JSON; MD was stale.)
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
LOG = ROOT / "validation/deep_validation_2026-05-17/iter_3/r13_fixes_log.json"
LOG.parent.mkdir(parents=True, exist_ok=True)

# Make sure cert_extractor is importable
sys.path.insert(0, str(ROOT / "packages/extractor/src"))
from cert_extractor.pipeline.stage7_export.emitters import emit_page_md  # noqa: E402
from cert_extractor.pipeline.stage7_export.schema import ExportEnvelope  # noqa: E402


def load_json(p: Path) -> dict:
    return json.loads(p.read_text(encoding="utf-8"))


def save_json(p: Path, d: dict) -> None:
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


# ---- F13: p200 ハウジング zh disambig ----
def f13_p200_housing() -> dict:
    edits = []
    for stage_subdir in ["structured", "translated", "output/pages"]:
        f = RUN / stage_subdir / "page_200.json"
        if not f.exists():
            continue
        d = load_json(f)
        ents = d.get("entities", []) if isinstance(d, dict) else d
        local = 0
        for e in ents:
            if not isinstance(e, dict):
                continue
            surf = e.get("surface", {}) or {}
            if surf.get("jp") == "ハウジングサービス":
                if surf.get("zh") == "主机托管服务":
                    surf["zh"] = "服务器代管服务"
                    local += 1
                if surf.get("en") == "Hosting Service":
                    surf["en"] = "Housing Service"
                    local += 1
        if local:
            save_json(f, d)
            edits.append({"file": str(f.relative_to(RUN)), "edits": local})
    return {"description": "p200 ハウジング zh disambig (collision with ホスティング)", "edits": edits}


# ---- F14: p566 entity[1] バックドア def ----
P566_E1_DEF = {
    "jp": "システムに意図的に設けられた秘密のアクセス経路",
    "zh": "在系统中有意设置的秘密访问通道",
    "en": "A secret access path intentionally placed in the system",
}


def f14_p566_backdoor() -> dict:
    edits = []
    for stage_subdir in ["structured", "translated", "output/pages"]:
        f = RUN / stage_subdir / "page_566.json"
        if not f.exists():
            continue
        d = load_json(f)
        ents = d.get("entities", []) if isinstance(d, dict) else d
        local = 0
        if len(ents) > 1 and isinstance(ents[1], dict) and ents[1].get("surface", {}).get("jp") == "バックドア":
            defn = ents[1].setdefault("definition", {})
            for k, v in P566_E1_DEF.items():
                if defn.get(k) != v:
                    defn[k] = v
                    local += 1
        if local:
            save_json(f, d)
            edits.append({"file": str(f.relative_to(RUN)), "edits": local})
    return {"description": "p566 entity[1] バックドア definition restore", "edits": edits}


# ---- F15: p566 entity[15] ショルダーハック def ----
P566_E15_DEF = {
    "jp": "他人のパスワード入力などを肩越しにのぞき見て情報を盗む行為。防止策はのぞき見防止フィルムを貼ること",
    "zh": "从他人肩后偷窥其密码输入等行为以窃取信息的攻击。防止对策是粘贴防窥膜",
    "en": "An attack that steals information by peering over someone's shoulder to observe their password input; the countermeasure is to attach a privacy filter",
}


def f15_p566_shoulder() -> dict:
    edits = []
    for stage_subdir in ["structured", "translated", "output/pages"]:
        f = RUN / stage_subdir / "page_566.json"
        if not f.exists():
            continue
        d = load_json(f)
        ents = d.get("entities", []) if isinstance(d, dict) else d
        local = 0
        if len(ents) > 15 and isinstance(ents[15], dict) and ents[15].get("surface", {}).get("jp") == "ショルダーハック":
            defn = ents[15].setdefault("definition", {})
            for k, v in P566_E15_DEF.items():
                if defn.get(k) != v:
                    defn[k] = v
                    local += 1
        if local:
            save_json(f, d)
            edits.append({"file": str(f.relative_to(RUN)), "edits": local})
    return {"description": "p566 entity[15] ショルダーハック definition fix", "edits": edits}


# ---- REGEN: regenerate MD from JSON for R11+R13 touched pages ----
REGEN_PAGES = [124, 200, 445, 561, 566]


def regen_md() -> dict:
    edits = []
    for page in REGEN_PAGES:
        json_path = RUN / "output/pages" / f"page_{page:03d}.json"
        md_path = RUN / "output/pages" / f"page_{page:03d}.md"
        if not json_path.exists():
            continue
        env_data = load_json(json_path)
        # ExportEnvelope expects: schema_version, cert_id, run_id, stage, page, exported_at, stage6_verdict, leaf_count, entities, polish_items_ref(optional)
        envelope = ExportEnvelope(**env_data)
        new_md = emit_page_md(envelope)
        md_path.write_text(new_md, encoding="utf-8")
        edits.append({"file": f"output/pages/page_{page:03d}.md", "regenerated": True})
    return {"description": "Regenerate MD from JSON for R11/R13-touched pages", "edits": edits}


def main() -> None:
    log = {"round": "R13", "date": "2026-05-17", "fixes": {}}
    log["fixes"]["F13_p200_housing"] = f13_p200_housing()
    log["fixes"]["F14_p566_backdoor"] = f14_p566_backdoor()
    log["fixes"]["F15_p566_shoulder"] = f15_p566_shoulder()
    log["fixes"]["REGEN_md_5pages"] = regen_md()
    LOG.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")
    print("R13 fixes + MD regen applied:")
    for k, v in log["fixes"].items():
        n = sum(e.get("edits", 0) if isinstance(e.get("edits"), int) else 1 for e in v.get("edits", []))
        print(f"  {k}: {n} units")
    print(f"Log: {LOG.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
