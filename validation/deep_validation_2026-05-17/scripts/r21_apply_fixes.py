#!/usr/bin/env python3
"""R21 iter_6 surgical fixes for 3 R20 release-impacting + collateral findings.

F9  — page_309 entity[1].rows[2][0].en: 'Safety' → 'Security'
       (per R20-FRESH FAIL: 安全性 in システム監査 context = security pillar, not
        functional/operational safety. Row description in EN explicitly cites
        'Unauthorized Access' and 'acts of destruction' — security concepts.)

F10 — glossary g_538.kana_helper.zh_concept: '主机托管服务' → '主机租用服务'
       (per R20-VERIFY: R19 surgical fix on g_538.surface.zh introduced
        internal inconsistency with kana_helper.zh_concept. Sync both to
        the disambiguated mainland-PRC term '主机租用服务' already used on
        the canonical reference page p199.)

F11 — page_327 entities[0,1,2,3] definition.{jp,en} (truth-table semantics)
       (per R20-VERIFY WARN: zh side now has full truth-table semantics
        post-R19, but jp+en sides still say '〜演算の日本語名称' /
        'Japanese name for the ... operation'. AND/OR/XOR/NOT have NO truth
        tables on this page — only NAND/NOR do (entities 6/7). So jp+en
        learners get zero substantive content for those 4 fundamental
        operations. Elevated from WARN to RELEASE_IMPACTING for iter-6.)
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
LOG = ROOT / "validation/deep_validation_2026-05-17/iter_6/r21_fixes_log.json"
LOG.parent.mkdir(parents=True, exist_ok=True)

sys.path.insert(0, str(ROOT / "packages/extractor/src"))
from cert_extractor.pipeline.stage7_export.emitters import emit_page_md  # noqa: E402
from cert_extractor.pipeline.stage7_export.schema import ExportEnvelope  # noqa: E402


def load_json(p: Path) -> dict | list:
    return json.loads(p.read_text(encoding="utf-8"))


def save_json(p: Path, d: dict | list) -> None:
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _entities(d: dict | list) -> list[dict]:
    if isinstance(d, dict):
        return d["entities"]
    return d


def _patch_leaf(d: dict, path: list, expected: str, new: str) -> tuple[str, str | None]:
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


def _edit(file_rel: Path, path: list, before: str, after: str, err: str | None) -> dict:
    e: dict = {"file": str(file_rel), "path": path, "before": before}
    if err:
        e["intended_after"] = after
        e["skip_reason"] = err
    else:
        e["after"] = after
    return e


# ---- F9: p309 entity[1].rows[2][0].en Safety -> Security ----
def fix_page_309() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_309.json", "output/pages/page_309.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        table = ents[1]
        cur_old, err = _patch_leaf(table, ["rows", 2, 0, "en"], "Safety", "Security")
        edits.append(_edit(path.relative_to(ROOT),
                           ["entities[1].rows[2][0]", "en"], cur_old, "Security", err))
        save_json(path, d)
    return edits


# ---- F10: glossary g_538.kana_helper.zh_concept sync ----
def fix_glossary_g538() -> list[dict]:
    edits: list[dict] = []
    path = RUN / "output/glossary.json"
    d = load_json(path)
    entries = d["entries"]
    found = False
    for entry in entries:
        if isinstance(entry, dict) and entry.get("id") == "g_538":
            found = True
            if "kana_helper" not in entry or not isinstance(entry["kana_helper"], dict):
                edits.append({"file": str(path.relative_to(ROOT)),
                              "path": ["entries[id=g_538].kana_helper"],
                              "skip_reason": "kana_helper missing or not a dict"})
                break
            kh = entry["kana_helper"]
            old = kh.get("zh_concept")
            if old == "主机托管服务":
                kh["zh_concept"] = "主机租用服务"
                edits.append({"file": str(path.relative_to(ROOT)),
                              "path": ["entries[id=g_538].kana_helper", "zh_concept"],
                              "before": old, "after": "主机租用服务"})
            else:
                edits.append({"file": str(path.relative_to(ROOT)),
                              "path": ["entries[id=g_538].kana_helper", "zh_concept"],
                              "before": old, "intended_after": "主机租用服务",
                              "skip_reason": f"unexpected value {old!r}"})
            break
    if not found:
        edits.append({"file": str(path.relative_to(ROOT)),
                      "path": ["entries[id=g_538]"],
                      "skip_reason": "entry not found"})
    save_json(path, d)
    return edits


# ---- F11: p327 entities[0,1,2,3] definition.jp + .en truth-table semantics ----
F11_REPLACEMENTS = {
    0: {  # 論理積 / Logical AND
        "jp": ("AND演算の日本語名称。",
               "二つの真偽値入力がどちらも真（1）のときに真（1）を、それ以外のときに偽（0）を出力する論理演算（AND演算の日本語名称）。"),
        "en": ("Japanese name for the AND operation.",
               "A logical operation that outputs true (1) only when both Boolean inputs are true (1), and outputs false (0) otherwise. (Japanese name: 論理積)"),
    },
    1: {  # 論理和 / Logical OR
        "jp": ("OR演算の日本語名称。",
               "二つの真偽値入力の少なくとも一方が真（1）のときに真（1）を、両方とも偽のときだけ偽（0）を出力する論理演算（OR演算の日本語名称）。"),
        "en": ("Japanese name for the OR operation.",
               "A logical operation that outputs true (1) whenever at least one Boolean input is true (1), and outputs false (0) only when both inputs are false. (Japanese name: 論理和)"),
    },
    2: {  # 排他的論理和 / XOR
        "jp": ("XOR演算の日本語名称。",
               "二つの真偽値入力が異なる（一方が真で一方が偽）ときに真（1）を、同じ値のときに偽（0）を出力する論理演算（XOR演算の日本語名称）。"),
        "en": ("Japanese name for the XOR operation.",
               "A logical operation that outputs true (1) when the two Boolean inputs differ (one true, one false), and outputs false (0) when they match. (Japanese name: 排他的論理和)"),
    },
    3: {  # 否定 / NOT
        "jp": ("NOT演算の日本語名称。",
               "単一の真偽値入力を反転させる単項論理演算（0→1、1→0）。NOT演算の日本語名称。"),
        "en": ("Japanese name for the NOT operation.",
               "A unary logical operation that inverts a single Boolean input (0→1, 1→0). (Japanese name: 否定)"),
    },
}


def fix_page_327_jp_en() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_327.json", "output/pages/page_327.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        for ent_idx, lang_map in F11_REPLACEMENTS.items():
            e = ents[ent_idx]
            for lang, (old, new) in lang_map.items():
                cur_old, err = _patch_leaf(e, ["definition", lang], old, new)
                edits.append(_edit(path.relative_to(ROOT),
                                   [f"entities[{ent_idx}].definition", lang],
                                   cur_old, new, err))
        save_json(path, d)
    return edits


# ---- MD regen ----
def md_regen(pages: list[int]) -> list[dict]:
    edits: list[dict] = []
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


def main() -> None:
    log: dict = {
        "round": "R21",
        "iter": 6,
        "f9_page_309": [],
        "f10_glossary_g538": [],
        "f11_page_327_jp_en": [],
        "md_regen": [],
    }
    log["f9_page_309"] = fix_page_309()
    log["f10_glossary_g538"] = fix_glossary_g538()
    log["f11_page_327_jp_en"] = fix_page_327_jp_en()
    log["md_regen"] = md_regen([309, 327])

    total_edits = sum(len([e for e in log[k] if "skip_reason" not in e])
                      for k in ("f9_page_309", "f10_glossary_g538", "f11_page_327_jp_en"))
    total_skips = sum(len([e for e in log[k] if "skip_reason" in e])
                      for k in ("f9_page_309", "f10_glossary_g538", "f11_page_327_jp_en"))
    md_count = sum(1 for e in log["md_regen"] if "skip_reason" not in e)
    log["summary"] = {
        "json_edits_applied": total_edits,
        "json_edits_skipped": total_skips,
        "md_regenerated": md_count,
    }

    LOG.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote log: {LOG}")
    print(f"  JSON edits applied: {total_edits}")
    print(f"  JSON edits skipped: {total_skips}")
    print(f"  MD pages regenerated: {md_count}")
    if total_skips:
        print("  -- skipped edits --")
        for k in log:
            if k in ("round", "iter", "md_regen", "summary"):
                continue
            for e in log[k]:
                if "skip_reason" in e:
                    print(f"    [{k}] {json.dumps(e, ensure_ascii=False)}")


if __name__ == "__main__":
    main()
