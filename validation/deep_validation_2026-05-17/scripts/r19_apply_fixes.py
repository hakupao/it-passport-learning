#!/usr/bin/env python3
"""R19 iter_5 surgical fixes for 8 R18 release-impacting defects (F1-F8).

Inputs: validation/deep_validation_2026-05-17/iter_5/r18_release_impacting_fixes.json
        validation/deep_validation_2026-05-17/iter_5/r18_triage.md

Targets all under data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/:
- translated/page_NNN.json (pre-Stage-7)
- output/pages/page_NNN.json (post-Stage-7, what releases)
- output/pages/page_NNN.md  (regenerated)
- output/glossary.json (F5 g_161, F6 g_538)

F1: p249 entities[1].rows[1][2] White-Box demerit, jp+zh+en (semantic inversion)
F2: p249 entities[1].rows[2][2] Black-Box demerit, jp+zh+en (grammar + nested paren)
F3: p363 entities[3] surface.{jp,zh,en} (sentence-as-term -> noun phrase)
F4: p392 entities[6] surface.{jp,zh,en} (sentence-as-term -> noun phrase)
F5: p225 entities[4].surface.zh + glossary g_161.surface.zh (within-page RFP drift)
F6: glossary g_538.surface.zh ホスティングサービス zh fix
F7: p432 entities[0,1].definition.{jp,zh,en} (added or modified, not only added)
F8: p327 entities[0,1,2,3].definition.zh (truth-table semantics, not 日语名称 framing)

Glossary-only fixes (F5 glossary half + F6): only output/glossary.json — no page MD regen
required for F5 glossary half (page 225 entity::4 surface fix gets MD regen anyway).

NO LLM CALLS. NO source-textbook changes. Pure str-match-and-replace.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
LOG = ROOT / "validation/deep_validation_2026-05-17/iter_5/r19_fixes_log.json"
LOG.parent.mkdir(parents=True, exist_ok=True)

sys.path.insert(0, str(ROOT / "packages/extractor/src"))
from cert_extractor.pipeline.stage7_export.emitters import emit_page_md  # noqa: E402
from cert_extractor.pipeline.stage7_export.schema import ExportEnvelope  # noqa: E402


def load_json(p: Path) -> dict | list:
    return json.loads(p.read_text(encoding="utf-8"))


def save_json(p: Path, d: dict | list) -> None:
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


# --- helpers ---

def _entities(d: dict | list) -> list[dict]:
    if isinstance(d, dict):
        return d["entities"]
    return d  # translated/*.json sometimes is a bare list of entities


def _patch_leaf(d: dict, path: list[str | int], expected: str, new: str) -> tuple[str, str | None]:
    """Walk d[path[0]][path[1]]... and replace; return (old_value, error_or_None)."""
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


# ---- F1: p249 White-Box demerit row inversion (jp+zh+en) ----
F1_REPLACEMENTS = {
    "jp": ("プログラムの誤りを見つけられない",
           "仕様自体の誤りや要求漏れは検出できない"),
    "zh": ("无法发现程序的错误",
           "无法发现规格说明书本身的错误或需求遗漏"),
    "en": ("Cannot find errors in the program",
           "Cannot detect specification errors or missing functionality (errors of omission)"),
}

# ---- F2: p249 Black-Box demerit row grammar + nested paren ----
F2_REPLACEMENTS = {
    "jp": ("すべての複雑なテストしないので、発生頻度が低い不具合（バグ）が見つけられない可能性がある",
           "すべての分岐や条件を網羅的にテストするわけではないので、発生頻度が低い不具合（バグ）が見つけられない可能性がある"),
    "zh": ("由于不进行所有复杂的测试，可能无法发现发生频率较低的缺陷（程序错误（Bug））",
           "由于无法穷举所有代码路径，可能漏掉低频触发的缺陷（Bug）"),
    "en": ("Since not all complex tests are performed, there is a possibility that low-frequency defects (Bug) may not be found",
           "Because it does not exercise every internal execution path, rarely triggered defects (bugs) may go undetected"),
}


def fix_page_249() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_249.json", "output/pages/page_249.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        # entities[1] is the table (index 1 in array, id=table::p249::2)
        table = ents[1]
        # F1: rows[1][2] (white-box demerit)
        for lang, (old, new) in F1_REPLACEMENTS.items():
            cur_old, err = _patch_leaf(table, ["rows", 1, 2, lang], old, new)
            edits.append(_edit(path.relative_to(ROOT),
                               ["entities[1].rows[1][2]", lang], cur_old, new, err))
        # F2: rows[2][2] (black-box demerit)
        for lang, (old, new) in F2_REPLACEMENTS.items():
            cur_old, err = _patch_leaf(table, ["rows", 2, 2, lang], old, new)
            edits.append(_edit(path.relative_to(ROOT),
                               ["entities[1].rows[2][2]", lang], cur_old, new, err))
        save_json(path, d)
    return edits


# ---- F3: p363 entity[3] surface (sentence-as-term -> noun phrase) ----
F3_REPLACEMENTS = {
    "jp": ("関数の呼び出し時に引数を指定すると、その引数が関数に渡されます。",
           "関数呼び出しでの引数の受け渡し"),
    "zh": ("调用函数时指定参数，该参数会被传递给函数。",
           "函数调用中的参数传递"),
    "en": ("When you specify an argument when calling a function, that argument is passed to the function.",
           "Argument Passing in Function Calls"),
}


def fix_page_363() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_363.json", "output/pages/page_363.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        e3 = ents[3]
        for lang, (old, new) in F3_REPLACEMENTS.items():
            cur_old, err = _patch_leaf(e3, ["surface", lang], old, new)
            edits.append(_edit(path.relative_to(ROOT),
                               ["entities[3].surface", lang], cur_old, new, err))
        save_json(path, d)
    return edits


# ---- F4: p392 entity[6] surface (sentence-as-term -> noun phrase) ----
F4_REPLACEMENTS = {
    "jp": ("コンピュータを区別する境界線が曖昧になっている",
           "コンピュータ分類境界の曖昧化"),
    "zh": ("区分计算机的边界正在变得模糊",
           "计算机分类边界的模糊化"),
    "en": ("The Boundaries That Distinguish Computers Are Becoming Blurry",
           "Blurring of Computer-Category Boundaries"),
}


def fix_page_392() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_392.json", "output/pages/page_392.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        e6 = ents[6]
        for lang, (old, new) in F4_REPLACEMENTS.items():
            cur_old, err = _patch_leaf(e6, ["surface", lang], old, new)
            edits.append(_edit(path.relative_to(ROOT),
                               ["entities[6].surface", lang], cur_old, new, err))
        save_json(path, d)
    return edits


# ---- F5: p225 entity[4] surface.zh (within-page RFP drift) ----
F5_PAGE_OLD = "提案请求书（RFP）"
F5_PAGE_NEW = "提案邀请书（RFP）"


def fix_page_225() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_225.json", "output/pages/page_225.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        e4 = ents[4]
        cur_old, err = _patch_leaf(e4, ["surface", "zh"], F5_PAGE_OLD, F5_PAGE_NEW)
        edits.append(_edit(path.relative_to(ROOT),
                           ["entities[4].surface", "zh"], cur_old, F5_PAGE_NEW, err))
        save_json(path, d)
    return edits


# ---- F7: p432 entities[0,1] definition.{jp,zh,en} (added or modified) ----
F7_REPLACEMENTS = {
    0: {  # 差分バックアップ
        "jp": ("フルバックアップ以降、新たに追加されたデータをバックアップすることです。",
               "前回のフルバックアップ以降に変更（追加・修正）されたすべてのデータをバックアップする方式。"),
        "zh": ("对完全备份之后新增的数据进行备份。",
               "备份自上次完全备份以来发生变化（新增或修改）的所有数据。"),
        "en": ("Backing up data that has been newly added since the full backup.",
               "Backing up all data that has changed (added or modified) since the last full backup."),
    },
    1: {  # 増分バックアップ
        "jp": ("前回のバックアップから新たに追加されたデータのみをバックアップすることです。",
               "前回のバックアップ（フル・差分・増分のいずれも含む）以降に変更（追加・修正）されたデータのみをバックアップする方式。"),
        "zh": ("仅备份自上次备份以来新增的数据。",
               "仅备份自上次备份（无论完全、差异或增量）以来发生变化（新增或修改）的数据。"),
        "en": ("Backing up only the data that has been newly added since the previous backup.",
               "Backing up only the data that has changed (added or modified) since the previous backup (full, differential, or incremental)."),
    },
}


def fix_page_432() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_432.json", "output/pages/page_432.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        for ent_idx, lang_map in F7_REPLACEMENTS.items():
            e = ents[ent_idx]
            for lang, (old, new) in lang_map.items():
                cur_old, err = _patch_leaf(e, ["definition", lang], old, new)
                edits.append(_edit(path.relative_to(ROOT),
                                   [f"entities[{ent_idx}].definition", lang],
                                   cur_old, new, err))
        save_json(path, d)
    return edits


# ---- F8: p327 entities[0,1,2,3] definition.zh truth-table semantics ----
F8_ZH_REPLACEMENTS = {
    0: ("逻辑与（AND）运算的日语名称。",
        "两个布尔输入都为真（1）时输出真（1），否则输出假（0）的逻辑运算。日语称为「論理積」。"),
    1: ("逻辑或（OR）运算的日语名称。",
        "两个布尔输入中至少有一个为真（1）时输出真（1），仅当两者都为假时输出假（0）的逻辑运算。日语称为「論理和」。"),
    2: ("异或（XOR）运算的日语名称。",
        "两个布尔输入不同（一真一假）时输出真（1），相同时输出假（0）的逻辑运算（XOR）。日语称为「排他的論理和」。"),
    3: ("逻辑非（NOT）运算的日语名称。",
        "将单个布尔输入反转的一元运算（0→1，1→0）。日语称为「否定」。"),
}


def fix_page_327() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_327.json", "output/pages/page_327.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        for ent_idx, (old, new) in F8_ZH_REPLACEMENTS.items():
            e = ents[ent_idx]
            cur_old, err = _patch_leaf(e, ["definition", "zh"], old, new)
            edits.append(_edit(path.relative_to(ROOT),
                               [f"entities[{ent_idx}].definition", "zh"],
                               cur_old, new, err))
        save_json(path, d)
    return edits


# ---- F5 (glossary half) + F6 glossary fixes ----
GLOSSARY_FIXES = [
    # F5 glossary half — RFP zh align with page-225 normalized surface
    {"fix_id": "F5-glossary",
     "id": "g_161",
     "match": {"surface": {"jp": "RFP", "zh": "提案请求书（RFP）", "en": "RFP (Request for Proposal)"}},
     "set": {"surface.zh": "提案邀请书（RFP）"}},
    # F6 — ホスティングサービス zh
    {"fix_id": "F6",
     "id": "g_538",
     "match": {"surface": {"jp": "ホスティングサービス", "zh": "主机托管服务", "en": "Hosting Service"}},
     "set": {"surface.zh": "主机租用服务"}},
]


def fix_glossary() -> list[dict]:
    edits: list[dict] = []
    path = RUN / "output/glossary.json"
    d = load_json(path)
    entries = d["entries"]
    by_id = {e.get("id"): (i, e) for i, e in enumerate(entries) if isinstance(e, dict)}
    for fix in GLOSSARY_FIXES:
        gid = fix["id"]
        if gid not in by_id:
            edits.append({"fix_id": fix["fix_id"], "id": gid,
                          "skip_reason": "glossary entry id not found"})
            continue
        _, entry = by_id[gid]
        surf = entry.get("surface") or {}
        expected = fix["match"]["surface"]
        if any(surf.get(k) != v for k, v in expected.items()):
            edits.append({"fix_id": fix["fix_id"], "id": gid,
                          "skip_reason": f"surface mismatch: got {surf!r}, expected {expected!r}"})
            continue
        before_snapshot = dict(surf)
        for k, v in fix["set"].items():
            sec, sub = k.split(".", 1) if "." in k else (k, None)
            if sub:
                entry[sec][sub] = v
            else:
                entry[sec] = v
        edits.append({"fix_id": fix["fix_id"], "id": gid,
                      "before": before_snapshot, "after": dict(entry.get("surface") or {})})
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
        "round": "R19",
        "iter": 5,
        "f1_f2_page_249": [],
        "f3_page_363": [],
        "f4_page_392": [],
        "f5_page_225_surface": [],
        "f7_page_432": [],
        "f8_page_327": [],
        "f5_f6_glossary": [],
        "md_regen": [],
    }
    log["f1_f2_page_249"] = fix_page_249()
    log["f3_page_363"] = fix_page_363()
    log["f4_page_392"] = fix_page_392()
    log["f5_page_225_surface"] = fix_page_225()
    log["f7_page_432"] = fix_page_432()
    log["f8_page_327"] = fix_page_327()
    log["f5_f6_glossary"] = fix_glossary()
    log["md_regen"] = md_regen([225, 249, 327, 363, 392, 432])

    # Summary counters
    total_edits = sum(len([e for e in log[k] if "skip_reason" not in e])
                      for k in ("f1_f2_page_249", "f3_page_363", "f4_page_392",
                                "f5_page_225_surface", "f7_page_432", "f8_page_327",
                                "f5_f6_glossary"))
    total_skips = sum(len([e for e in log[k] if "skip_reason" in e])
                      for k in ("f1_f2_page_249", "f3_page_363", "f4_page_392",
                                "f5_page_225_surface", "f7_page_432", "f8_page_327",
                                "f5_f6_glossary"))
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
