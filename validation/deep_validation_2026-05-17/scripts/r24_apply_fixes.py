#!/usr/bin/env python3
"""R24 iter_7 surgical fixes for 25 R23 release-impacting findings F12-F36.

Inputs : validation/deep_validation_2026-05-17/iter_7/r23_release_impacting_fixes.json
Outputs: validation/deep_validation_2026-05-17/iter_7/r24_fixes_log.json
Edits  : data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/{translated,output/pages,output/glossary.json}
MD     : regenerated for every page touched, via emit_page_md

Pattern follows r21_apply_fixes.py:
  - _patch_leaf walks a path, requires expected==current, returns (old, err)
  - _edit builds a log dict (with intended_after on skip)
  - For each page-level fix: edit BOTH translated/page_NNN.json AND output/pages/page_NNN.json
  - translated/ is bare list[entity]; output/pages/ is ExportEnvelope dict
  - _entities(d) returns the entity list regardless of wrapper

Per-fix notes (see r23_triage.md and r23_release_impacting_fixes.json):
  F12 p015 figure[1] RAID caption (only RAID-1 mirroring described; rewrite to family-of-techniques)
  F13 p033 table[7] row[4][0].jp 'エステイジーズ' OCR garble -> 'エスディージーズ'
  F14 p039 term[3] 職能別組織 definition wrong (describes 個人企業); rewrite all 3 langs
  F15 p056 term[2] 貸借対照表 EN/ZH only mentions assets; extend to assets/liabilities/equity
  F16 p060 table rows containing '売上総利益': replace EN 'gross margin' -> 'gross profit'
  F17 p072 term プロトコル definition wrong (programming-language convention); rewrite all 3 langs
  F18 p190 term 業務モデル surface.en 'Business Model' -> 'Business Process Model'
  F19 housing/hosting zh disambiguation
        - page 198 entities (term ハウジング and ホスティング) + figure caption collision
        - page 200 ホスティング (page-200 ハウジング already 服务器代管服务)
        - page 561 term[22] ホスティング
        - glossary g_453 surface.zh + kana_helper.zh_concept -> '服务器托管服务'
        (glossary g_538 already at '主机租用服务' per iter-6 R21 F10; verify only)
  F20 p219 table 'システム化計画の立案プロセス' rows: rewrite EN ('embody the Process' -> realize/formulate)
  F21 JP-kanji-in-zh on pp.238/241/353/354/361/530 — currently NO hits found in zh fields
        (was likely fixed by earlier iters). We still walk every zh string and apply
        replacements 確→确 発→发 開→开 択→择 処→处 対→对; expected to be a no-op
        but defensively applied. Result logs the count, not skips.
  F22 p270 table[0] row[3][1] PMBOK Stakeholder: subject-confusion JP
        'プロジェクトが効率的にプロジェクトに参加できる' -> 'ステークホルダーが...'
  F23 zh surface 'デュアルシステム' -> '双重系统' on p374, p375, p444 (in question.choices),
        p563 (and table rows on p374/p375 where present); デュプレックス left as '双联系统' per triage
  F24 p433 entities[2] 差分バックアップ + entities[3] 増分バックアップ: extend defs all 3 langs
  F25 p433 entity[4] レプリケーション surface.zh '复制' -> '数据复制（实时同步）'
        (no 複写 entity present on p433; logged as skipped with reason)
  F26 p491 entity[1] IPv6 definition body currently describes IPv4: rewrite all 3 langs
  F27 p501 entity[1] クラウドコンピューティング definition framing: rewrite all 3 langs
  F28 p508 entity[?] 情報セキュリティ definition.en 'ensuring safety' -> 'ensuring security'
  F29 p509 entity[3] surface.en 'Shoulder Hacking' -> 'Shoulder Surfing'
        p538 entity[2] 'のぞき見防止フィルム' references 'shoulder hacking' in EN def + zh '肩窥攻击'
        We change p509 surface; for p538 update the EN definition body reference too (so name is
        consistent across all pages).
  F30 p511 entity[?] RAT: surface.en 'RAT (Remote Access Trojan)' -> 'RAT (Remote Access Tool)';
        surface.zh '远程访问木马（RAT）' -> '远程访问工具（RAT）'
  F31 p539 entity 技術的セキュリティ対策 definition semantically inverted: rewrite all 3 langs
  F32 p544 entity[3] surface.jp + definition.jp: 'ベネトレーション' -> 'ペネトレーション'
  F33 p546 entity[0] セキュアブート definition.zh: replace katakana 'セキュア'/'ブート' with chinese,
        and JP-corner-brackets 「」 with chinese double quotes "" (or remove)
  F34 p562 entity[21] DevOps definition: remove contaminating sentence about whitebox testing
        in jp, zh, en (all 3 langs)
  F35 p562 entity[2] 要件定義プロセス definition.jp: 'さな目的' -> '主な目的'
  F36 p566 entity[27] セキュリティ・バイ・デフォルト definition.jp: 'お初期化' -> '初期化',
        'COSの' -> 'OSの'
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
LOG = ROOT / "validation/deep_validation_2026-05-17/iter_7/r24_fixes_log.json"
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


# ---------- F12 p015 figure[1] RAID caption ----------
F12_OLD = {
    "jp": (
        "『出る順！ 過去問＆完全解説』のサンプル誌面。左ページは過去問の例題（複数のハードディスクに"
        "同じ内容を書きこませることで信頼性を高めるRAIDの方式、デュアルシステム、シンクライアントなどに関する"
        "選択問題）、右ページはRAIDの構成例の図と「解答・解説」欄に解説が並んでおり、❼問題、❽解答、"
        "❾解説の番号で各エリアが示されている。"
    ),
    "zh": (
        "『按出题频率排序！历年真题与完整解析』的示例版面。左页是真题例题（涉及通过让多块硬盘写入相同内容"
        "来提升可靠性的RAID方式、双系统、瘦客户端等内容的选择题），右页则展示RAID的结构示意图，"
        "并在「解答・解析」栏中排列各项解析；❼问题、❽解答、❾解析的编号分别标示着各个区域。"
    ),
    "en": (
        "Sample layout of \"Past Questions Ranked by Frequency & Full Explanations.\" The left-hand page"
        " shows example past questions (multiple-choice items on the RAID method that improves"
        " reliability by writing the same content to multiple hard disks, dual systems, thin clients,"
        " and so on), while the right-hand page shows a diagram of an example RAID configuration"
        " and a row of explanations in the \"Answer & Explanation\" area. The areas are marked by the"
        " numbers 7. Question, 8. Answer, and 9. Explanation."
    ),
}
F12_NEW = {
    "jp": (
        "『出る順！ 過去問＆完全解説』のサンプル誌面。左ページは過去問の例題（複数のハードディスクを"
        "組み合わせて信頼性または性能を高めるRAIDの仕組み（RAID 0=ストライピング、RAID 1=ミラーリング、"
        "RAID 5=パリティ分散など複数の方式がある）、デュアルシステム、シンクライアントなどに関する"
        "選択問題）、右ページはRAIDの構成例の図と「解答・解説」欄に解説が並んでおり、❼問題、❽解答、"
        "❾解説の番号で各エリアが示されている。"
    ),
    "zh": (
        "『按出题频率排序！历年真题与完整解析』的示例版面。左页是真题例题（涉及通过组合多块硬盘以提升"
        "可靠性或性能的RAID技术（包含RAID 0条带化、RAID 1镜像、RAID 5分布式校验等多种方式）、双系统、"
        "瘦客户端等内容的选择题），右页则展示RAID的结构示意图，并在「解答・解析」栏中排列各项解析；"
        "❼问题、❽解答、❾解析的编号分别标示着各个区域。"
    ),
    "en": (
        "Sample layout of \"Past Questions Ranked by Frequency & Full Explanations.\" The left-hand page"
        " shows example past questions (multiple-choice items on RAID — a family of techniques that"
        " combine multiple hard disks to improve reliability or performance (including RAID 0 striping,"
        " RAID 1 mirroring, and RAID 5 distributed parity) — dual systems, thin clients, and so on),"
        " while the right-hand page shows a diagram of an example RAID configuration and a row of"
        " explanations in the \"Answer & Explanation\" area. The areas are marked by the numbers"
        " 7. Question, 8. Answer, and 9. Explanation."
    ),
}


def fix_f12_p015_raid_caption() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_015.json", "output/pages/page_015.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        fig = ents[1]  # figure caption
        for lang in ("jp", "zh", "en"):
            cur_old, err = _patch_leaf(fig, ["caption", lang], F12_OLD[lang], F12_NEW[lang])
            edits.append(_edit(
                path.relative_to(ROOT), [f"entities[1].caption", lang],
                cur_old, F12_NEW[lang], err,
            ))
        save_json(path, d)
    return edits


# ---------- F13 p033 table[7] row[4][0].jp OCR garble ----------
F13_OLD = "エステイジーズ SDGs"
F13_NEW = "エスディージーズ SDGs"


def fix_f13_p033_sdgs() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_033.json", "output/pages/page_033.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        # table is entity index 7 per current data
        tbl = ents[7]
        cur_old, err = _patch_leaf(tbl, ["rows", 4, 0, "jp"], F13_OLD, F13_NEW)
        edits.append(_edit(
            path.relative_to(ROOT), ["entities[7].rows[4][0]", "jp"],
            cur_old, F13_NEW, err,
        ))
        save_json(path, d)
    return edits


# ---------- F14 p039 entity[3] 職能別組織 definition rewrite ----------
F14_OLD = {
    "jp": "事業が1つしかなく、経営者が意思決定を行う組織形態。",
    "zh": "只有单一业务，由经营者进行决策的组织形态。",
    "en": "An organizational form with only one business, where the manager makes decisions.",
}
F14_NEW = {
    "jp": (
        "業務内容ごとに営業部・開発部・経理部などの専門部門に分けて編成する組織形態。"
        "各部門が機能ごとに専門化される一方、部門間の連携が課題となる。"
    ),
    "zh": (
        "按职能（销售部、研发部、财务部等）划分专业部门进行编制的组织形态。"
        "各部门按职能专业化，但部门间协作可能成为挑战。"
    ),
    "en": (
        "An organizational structure that groups departments by specialized function "
        "(sales, engineering, accounting, etc.). Each department specializes in its function, "
        "though inter-department coordination can become a challenge."
    ),
}


def fix_f14_p039_functional_org() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_039.json", "output/pages/page_039.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        e = ents[3]
        for lang in ("jp", "zh", "en"):
            cur_old, err = _patch_leaf(e, ["definition", lang], F14_OLD[lang], F14_NEW[lang])
            edits.append(_edit(
                path.relative_to(ROOT), [f"entities[3].definition", lang],
                cur_old, F14_NEW[lang], err,
            ))
        save_json(path, d)
    return edits


# ---------- F15 p056 entity[2] 貸借対照表 def extend ----------
F15_OLD = {
    "zh": "记载公司全部财产的表。",
    "en": "A table that lists all of a company's assets.",
}
F15_NEW = {
    "zh": (
        "记录企业在某一时点的资产、负债和净资产（所有者权益）三大类目的财务报表，"
        "满足资产=负债+净资产的会计恒等式。"
    ),
    "en": (
        "A financial statement that lists a company's assets, liabilities, and equity at "
        "a specific point in time, satisfying the fundamental accounting equation: "
        "assets = liabilities + equity."
    ),
}


def fix_f15_p056_balance_sheet() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_056.json", "output/pages/page_056.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        e = ents[2]
        for lang in ("zh", "en"):
            cur_old, err = _patch_leaf(e, ["definition", lang], F15_OLD[lang], F15_NEW[lang])
            edits.append(_edit(
                path.relative_to(ROOT), [f"entities[2].definition", lang],
                cur_old, F15_NEW[lang], err,
            ))
        save_json(path, d)
    return edits


# ---------- F16 p060 EN 'gross margin' -> 'gross profit' ----------
def fix_f16_p060_gross_profit() -> list[dict]:
    """Replace 'gross margin' with 'gross profit' in any en string under entities."""
    edits: list[dict] = []
    for sub in ("translated/page_060.json", "output/pages/page_060.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)

        def walk(node, p):
            if isinstance(node, dict):
                for k, v in list(node.items()):
                    if k == "en" and isinstance(v, str) and "gross margin" in v:
                        new_v = v.replace("gross margin", "gross profit")
                        node[k] = new_v
                        edits.append(_edit(
                            path.relative_to(ROOT), p + [k], v, new_v, None,
                        ))
                    else:
                        walk(v, p + [k])
            elif isinstance(node, list):
                for i, v in enumerate(node):
                    walk(v, p + [i])

        walk(ents, ["entities"])
        save_json(path, d)
    return edits


# ---------- F17 p072 プロトコル definition rewrite ----------
F17_OLD = {
    "jp": "プログラム言語を使うときの特別な約束",
    "zh": None,  # may already be different; detect generically
    "en": None,
}
F17_NEW = {
    "jp": (
        "コンピュータ同士がデータをやり取りするときに従う取り決め（通信規約）。"
        "TCP/IP や HTTP などが代表例。"
    ),
    "zh": "计算机之间进行数据交换时所遵循的约定（通信协议），例如 TCP/IP、HTTP 等。",
    "en": (
        "A set of agreed rules (a communication standard) that computers follow when "
        "exchanging data, such as TCP/IP or HTTP."
    ),
}


def fix_f17_p072_protocol() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_072.json", "output/pages/page_072.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        # Locate term with surface.jp == "プロトコル"
        target_idx = None
        for i, e in enumerate(ents):
            if isinstance(e, dict) and e.get("surface", {}).get("jp") == "プロトコル":
                target_idx = i
                break
        if target_idx is None:
            edits.append({
                "file": str(path.relative_to(ROOT)),
                "path": ["entities[?].(surface.jp=プロトコル)"],
                "skip_reason": "entity not found",
            })
            save_json(path, d)
            continue
        e = ents[target_idx]
        # JP — must match expected
        cur_old, err = _patch_leaf(e, ["definition", "jp"], F17_OLD["jp"], F17_NEW["jp"])
        edits.append(_edit(
            path.relative_to(ROOT),
            [f"entities[{target_idx}].definition", "jp"],
            cur_old, F17_NEW["jp"], err,
        ))
        # ZH and EN — overwrite unconditionally (warn if absent)
        for lang in ("zh", "en"):
            cur = e.get("definition", {}).get(lang)
            if cur is None:
                edits.append({
                    "file": str(path.relative_to(ROOT)),
                    "path": [f"entities[{target_idx}].definition", lang],
                    "skip_reason": "lang missing",
                })
                continue
            e["definition"][lang] = F17_NEW[lang]
            edits.append(_edit(
                path.relative_to(ROOT),
                [f"entities[{target_idx}].definition", lang],
                cur, F17_NEW[lang], None,
            ))
        save_json(path, d)
    return edits


# ---------- F18 p190 業務モデル surface.en rewrite ----------
F18_OLD_EN = "Business Model"
F18_NEW_EN = "Business Process Model"


def fix_f18_p190_business_process_model() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_190.json", "output/pages/page_190.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        target_idx = None
        for i, e in enumerate(ents):
            if isinstance(e, dict) and e.get("surface", {}).get("jp") == "業務モデル":
                target_idx = i
                break
        if target_idx is None:
            edits.append({
                "file": str(path.relative_to(ROOT)),
                "path": ["entities[?].(surface.jp=業務モデル)"],
                "skip_reason": "entity not found",
            })
            save_json(path, d)
            continue
        e = ents[target_idx]
        cur_old, err = _patch_leaf(e, ["surface", "en"], F18_OLD_EN, F18_NEW_EN)
        edits.append(_edit(
            path.relative_to(ROOT),
            [f"entities[{target_idx}].surface", "en"],
            cur_old, F18_NEW_EN, err,
        ))
        save_json(path, d)
    return edits


# ---------- F19 housing/hosting zh disambiguation ----------
def fix_f19_housing_hosting() -> list[dict]:
    edits: list[dict] = []

    # ---- 19a p198 entity[1] ハウジング + entity[2] ホスティング + figure caption ----
    for sub in ("translated/page_198.json", "output/pages/page_198.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)

        # entity[1]: ハウジングサービス surface.zh '主机托管服务' -> '服务器托管服务'
        cur_old, err = _patch_leaf(ents[1], ["surface", "zh"], "主机托管服务", "服务器托管服务")
        edits.append(_edit(
            path.relative_to(ROOT), ["entities[1].surface", "zh"],
            cur_old, "服务器托管服务", err,
        ))
        # entity[1].definition.zh begins with "主机托管服务是指..." -> rewrite head
        e1_def_old_zh = ents[1]["definition"]["zh"]
        if e1_def_old_zh.startswith("主机托管服务是指"):
            new_zh = "服务器托管服务是指" + e1_def_old_zh[len("主机托管服务是指"):]
            ents[1]["definition"]["zh"] = new_zh
            edits.append(_edit(
                path.relative_to(ROOT), ["entities[1].definition", "zh"],
                e1_def_old_zh, new_zh, None,
            ))
        else:
            edits.append({
                "file": str(path.relative_to(ROOT)),
                "path": ["entities[1].definition", "zh"],
                "before": e1_def_old_zh,
                "intended_after": "服务器托管服务是指...",
                "skip_reason": "definition.zh does not start with expected prefix",
            })

        # entity[2]: ホスティングサービス surface.zh '主机托管服务' -> '主机租用服务'
        cur_old, err = _patch_leaf(ents[2], ["surface", "zh"], "主机托管服务", "主机租用服务")
        edits.append(_edit(
            path.relative_to(ROOT), ["entities[2].surface", "zh"],
            cur_old, "主机租用服务", err,
        ))
        # entity[2].definition.zh: rewrite head '主机托管服务是指...' -> '主机租用服务是指...'
        e2_def_old_zh = ents[2]["definition"]["zh"]
        if e2_def_old_zh.startswith("主机托管服务是指"):
            new_zh = "主机租用服务是指" + e2_def_old_zh[len("主机托管服务是指"):]
            ents[2]["definition"]["zh"] = new_zh
            edits.append(_edit(
                path.relative_to(ROOT), ["entities[2].definition", "zh"],
                e2_def_old_zh, new_zh, None,
            ))
        else:
            edits.append({
                "file": str(path.relative_to(ROOT)),
                "path": ["entities[2].definition", "zh"],
                "before": e2_def_old_zh,
                "intended_after": "主机租用服务是指...",
                "skip_reason": "definition.zh does not start with expected prefix",
            })

        # entity[3] figure caption.zh: '主机托管服务与主机托管服务' -> '服务器托管服务与主机租用服务'
        cur_old, err = _patch_leaf(
            ents[3], ["caption", "zh"],
            "主机托管服务与主机托管服务", "服务器托管服务与主机租用服务",
        )
        edits.append(_edit(
            path.relative_to(ROOT), ["entities[3].caption", "zh"],
            cur_old, "服务器托管服务与主机租用服务", err,
        ))
        save_json(path, d)

    # ---- 19b p200 entity[2] ホスティング surface.zh -> '主机租用服务' ----
    # (p200 entity[1] ハウジング already at '服务器代管服务' — leave per triage; ホスティング at 主机托管服务)
    for sub in ("translated/page_200.json", "output/pages/page_200.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        cur_old, err = _patch_leaf(ents[2], ["surface", "zh"], "主机托管服务", "主机租用服务")
        edits.append(_edit(
            path.relative_to(ROOT), ["entities[2].surface", "zh"],
            cur_old, "主机租用服务", err,
        ))
        save_json(path, d)

    # ---- 19c p561 entity[21] ハウジング (already 服务器代管服务) + entity[22] ホスティング ----
    # Per triage we standardize ハウジング zh -> '服务器托管服务' (different wording than p561 currently uses
    # '服务器代管服务'). To preserve evidence of intent, we apply the standardization.
    for sub in ("translated/page_561.json", "output/pages/page_561.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        # entity[21]: surface.zh
        cur_old, err = _patch_leaf(ents[21], ["surface", "zh"], "服务器代管服务", "服务器托管服务")
        edits.append(_edit(
            path.relative_to(ROOT), ["entities[21].surface", "zh"],
            cur_old, "服务器托管服务", err,
        ))
        # entity[22]: surface.zh
        cur_old, err = _patch_leaf(ents[22], ["surface", "zh"], "主机托管服务", "主机租用服务")
        edits.append(_edit(
            path.relative_to(ROOT), ["entities[22].surface", "zh"],
            cur_old, "主机租用服务", err,
        ))
        save_json(path, d)

    # ---- 19d glossary g_453 (ハウジング) surface.zh + kana_helper.zh_concept ----
    gpath = RUN / "output/glossary.json"
    g = load_json(gpath)
    entries = g["entries"]
    for entry in entries:
        if entry.get("id") == "g_453":
            cur_old, err = _patch_leaf(entry, ["surface", "zh"], "主机托管服务", "服务器托管服务")
            edits.append(_edit(
                gpath.relative_to(ROOT), ["entries[id=g_453].surface", "zh"],
                cur_old, "服务器托管服务", err,
            ))
            cur_old, err = _patch_leaf(
                entry, ["kana_helper", "zh_concept"],
                "主机托管服务", "服务器托管服务",
            )
            edits.append(_edit(
                gpath.relative_to(ROOT),
                ["entries[id=g_453].kana_helper", "zh_concept"],
                cur_old, "服务器托管服务", err,
            ))
            break
    else:
        edits.append({
            "file": str(gpath.relative_to(ROOT)),
            "path": ["entries[id=g_453]"],
            "skip_reason": "entry not found",
        })
    # g_538 verify only (was fixed in iter-6); no edit expected
    for entry in entries:
        if entry.get("id") == "g_538":
            zh = entry.get("surface", {}).get("zh")
            khz = entry.get("kana_helper", {}).get("zh_concept")
            if zh == "主机租用服务" and khz == "主机租用服务":
                edits.append({
                    "file": str(gpath.relative_to(ROOT)),
                    "path": ["entries[id=g_538]"],
                    "action": "verified_no_change_needed",
                    "value": {"surface.zh": zh, "kana_helper.zh_concept": khz},
                })
            else:
                edits.append({
                    "file": str(gpath.relative_to(ROOT)),
                    "path": ["entries[id=g_538]"],
                    "skip_reason": (
                        f"expected '主机租用服务' on both surface.zh and "
                        f"kana_helper.zh_concept; got surface.zh={zh!r}, "
                        f"kana_helper.zh_concept={khz!r}"
                    ),
                })
            break
    save_json(gpath, g)

    return edits


# ---------- F20 p219 システム化計画 EN definition rewrite ----------
F20_OLD_EN = (
    "The process of concretizing the system planning to embody the System Conception "
    "Planning Process, and concretizing the project plan to obtain stakeholder agreement. "
    "Specific tasks include confirmation of basic requirements of the system planning, "
    "analysis of the target system, and Cost and System Investment Effect Forecast."
)
F20_NEW_EN = (
    "The process of formulating a concrete system development plan that realizes the system "
    "conception, and detailing the project plan to obtain stakeholder agreement. Specific "
    "tasks include confirming the basic requirements of the system plan, analyzing the target "
    "system, and forecasting development cost and system investment effect."
)


def fix_f20_p219_system_plan() -> list[dict]:
    """p219 has two occurrences (table row and dedicated term) — apply to all."""
    edits: list[dict] = []
    for sub in ("translated/page_219.json", "output/pages/page_219.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)

        def walk(node, p):
            if isinstance(node, dict):
                for k, v in list(node.items()):
                    if k == "en" and isinstance(v, str) and v == F20_OLD_EN:
                        node[k] = F20_NEW_EN
                        edits.append(_edit(
                            path.relative_to(ROOT), p + [k], v, F20_NEW_EN, None,
                        ))
                    else:
                        walk(v, p + [k])
            elif isinstance(node, list):
                for i, v in enumerate(node):
                    walk(v, p + [i])

        walk(ents, ["entities"])
        save_json(path, d)
    return edits


# ---------- F21 JP-kanji-in-zh systematic replacements ----------
F21_PAGES = (238, 241, 353, 354, 361, 530)
F21_SUBS = {
    "確": "确",
    "発": "发",
    "開": "开",
    "択": "择",
    "処": "处",
    "対": "对",
}


def fix_f21_jp_kanji_in_zh() -> list[dict]:
    edits: list[dict] = []
    for pg in F21_PAGES:
        for sub in (f"translated/page_{pg:03d}.json", f"output/pages/page_{pg:03d}.json"):
            path = RUN / sub
            d = load_json(path)
            ents = _entities(d)

            def walk(node, p):
                if isinstance(node, dict):
                    for k, v in list(node.items()):
                        if k == "zh" and isinstance(v, str):
                            new_v = v
                            hits = []
                            for jp_c, zh_c in F21_SUBS.items():
                                if jp_c in new_v:
                                    hits.append(jp_c)
                                    new_v = new_v.replace(jp_c, zh_c)
                            if hits:
                                node[k] = new_v
                                edits.append({
                                    **_edit(path.relative_to(ROOT),
                                            p + [k], v, new_v, None),
                                    "chars_replaced": hits,
                                })
                        else:
                            walk(v, p + [k])
                elif isinstance(node, list):
                    for i, v in enumerate(node):
                        walk(v, p + [i])

            walk(ents, [f"entities(p{pg})"])
            save_json(path, d)
    return edits


# ---------- F22 p270 table[0] row[3][1] PMBOK Stakeholder subject confusion ----------
F22_OLD_JP = (
    "ステークホルダ(利害関係者)を特定し、プロジェクトが効率的にプロジェクトに参加できるように調整する"
)
F22_NEW_JP = (
    "ステークホルダ(利害関係者)を特定し、彼らがプロジェクトに効率的に参加できるように調整する"
)


def fix_f22_p270_stakeholder() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_270.json", "output/pages/page_270.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        tbl = ents[0]
        cur_old, err = _patch_leaf(tbl, ["rows", 3, 1, "jp"], F22_OLD_JP, F22_NEW_JP)
        edits.append(_edit(
            path.relative_to(ROOT), ["entities[0].rows[3][1]", "jp"],
            cur_old, F22_NEW_JP, err,
        ))
        save_json(path, d)
    return edits


# ---------- F23 デュアルシステム zh -> '双重系统' ----------
def fix_f23_dual_system_zh() -> list[dict]:
    edits: list[dict] = []
    # Pages 374, 375, 444, 563
    targets = (374, 375, 444, 563)
    for pg in targets:
        for sub in (f"translated/page_{pg:03d}.json", f"output/pages/page_{pg:03d}.json"):
            path = RUN / sub
            d = load_json(path)
            ents = _entities(d)
            count = 0

            def walk(node, p):
                nonlocal count
                if isinstance(node, dict):
                    # Only update zh strings whose adjacent jp is exactly 'デュアルシステム'
                    # Detect by examining sibling values
                    siblings = node
                    jp_val = siblings.get("jp") if isinstance(siblings.get("jp"), str) else None
                    en_val = siblings.get("en") if isinstance(siblings.get("en"), str) else None
                    if jp_val and "デュアルシステム" in jp_val and "zh" in node:
                        zh_old = node["zh"]
                        # Replace ZH content that contains the wrong term '双工系统'
                        if "双工系统" in zh_old:
                            zh_new = zh_old.replace("双工系统", "双重系统")
                            node["zh"] = zh_new
                            edits.append(_edit(
                                path.relative_to(ROOT),
                                p + ["zh"], zh_old, zh_new, None,
                            ))
                            count += 1
                    # Recurse
                    for k, v in list(node.items()):
                        if k == "zh":
                            continue
                        walk(v, p + [k])
                elif isinstance(node, list):
                    for i, v in enumerate(node):
                        walk(v, p + [i])

            walk(ents, [f"entities(p{pg})"])
            if count == 0:
                edits.append({
                    "file": str(path.relative_to(ROOT)),
                    "path": [f"entities(p{pg})"],
                    "action": "no_dual_system_zh_match",
                })
            save_json(path, d)
    return edits


# ---------- F24 p433 differential + incremental backup defs extend ----------
F24_DIFF_OLD = {
    "jp": "フルバックアップ以降、新たに追加されたデータをバックアップすること",
    "zh": "备份完全备份以后新增的数据",
    "en": "Back up data newly added since the full backup",
}
F24_DIFF_NEW = {
    "jp": "前回のフルバックアップ以降に変更（追加・修正）されたすべてのデータをバックアップする方式。",
    "zh": "备份自上次完全备份以来发生变化（新增或修改）的所有数据。",
    "en": "Backing up all data that has changed (added or modified) since the last full backup.",
}
F24_INCR_OLD = {
    "jp": "前回のバックアップから新たに追加されたデータのみをバックアップすること",
    "zh": "仅备份自上次备份以来新增的数据",
    "en": "Back up only the data newly added since the previous backup",
}
F24_INCR_NEW = {
    "jp": (
        "前回のバックアップ（フル・差分・増分のいずれも含む）以降に変更（追加・修正）された"
        "データのみをバックアップする方式。"
    ),
    "zh": "仅备份自上次备份（无论完全、差异或增量）以来发生变化（新增或修改）的数据。",
    "en": (
        "Backing up only the data that has changed (added or modified) since the previous "
        "backup (full, differential, or incremental)."
    ),
}


def fix_f24_p433_backup_defs() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_433.json", "output/pages/page_433.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        # differential (index 2) + incremental (index 3)
        for idx, (old, new) in (
            (2, (F24_DIFF_OLD, F24_DIFF_NEW)),
            (3, (F24_INCR_OLD, F24_INCR_NEW)),
        ):
            e = ents[idx]
            for lang in ("jp", "zh", "en"):
                cur_old, err = _patch_leaf(e, ["definition", lang], old[lang], new[lang])
                edits.append(_edit(
                    path.relative_to(ROOT),
                    [f"entities[{idx}].definition", lang],
                    cur_old, new[lang], err,
                ))
        save_json(path, d)
    return edits


# ---------- F25 p433 entity[4] レプリケーション zh surface ----------
def fix_f25_p433_replication() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_433.json", "output/pages/page_433.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        cur_old, err = _patch_leaf(ents[4], ["surface", "zh"], "复制", "数据复制（实时同步）")
        edits.append(_edit(
            path.relative_to(ROOT), ["entities[4].surface", "zh"],
            cur_old, "数据复制（实时同步）", err,
        ))
        save_json(path, d)
    # 複写 entity not present on p433 — log skip with reason for traceability
    edits.append({
        "file": "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/output/pages/page_433.json",
        "path": ["entities[?](surface.jp=複写)"],
        "skip_reason": (
            "no 複写 entity present on p433 (entities are フル/差分/増分バックアップ/"
            "レプリケーション/アーカイブ only). Triage referenced 複写 generically; "
            "no action needed."
        ),
    })
    return edits


# ---------- F26 p491 IPv6 definition rewrite ----------
F26_OLD = {
    "jp": (
        "現在私たちが使っているIPアドレスは、「IPv4」と呼ばれるIPアドレスです。"
        "このIPアドレスは32桁の2進数（32ビット）で構成されているので、"
        "アドレスの総数は約43億個（2の32乗）になります。"
    ),
    "zh": (
        "我们现在使用的IP地址称为\"IPv4\"。该IP地址由32位二进制数（32比特）构成，"
        "因此地址总数约为43亿个（2的32次方）。"
    ),
    "en": (
        "The IP address we currently use is called \"IPv4\". Since this IP address consists "
        "of a 32-digit binary number (32 bits), the total number of addresses is approximately "
        "4.3 billion (2 to the 32nd power)."
    ),
}
F26_NEW = {
    "jp": (
        "IPアドレスを128ビットで表現する次世代のインターネットプロトコル。"
        "約3.4×10^38（340澗）個のアドレスを割り当てられ、IPv4枯渇問題への対応として設計された。"
    ),
    "zh": (
        "采用128位地址的下一代互联网协议，可分配约3.4×10^38（340涧）个地址，"
        "旨在解决IPv4地址枯竭问题。"
    ),
    "en": (
        "The next-generation Internet Protocol using 128-bit addresses, providing approximately "
        "3.4×10^38 (340 undecillion) addresses; designed to address IPv4 address exhaustion."
    ),
}


def fix_f26_p491_ipv6() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_491.json", "output/pages/page_491.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        e = ents[1]
        for lang in ("jp", "zh", "en"):
            cur_old, err = _patch_leaf(e, ["definition", lang], F26_OLD[lang], F26_NEW[lang])
            edits.append(_edit(
                path.relative_to(ROOT),
                [f"entities[1].definition", lang],
                cur_old, F26_NEW[lang], err,
            ))
        save_json(path, d)
    return edits


# ---------- F27 p501 クラウドコンピューティング definition rewrite ----------
F27_OLD = {
    "jp": "サーバはユーザーから離れた場所にあるので通信に時間がかかっていた従来の方式。",
    "zh": "传统方式中，服务器位于远离用户的位置，因此通信耗时较长。",
    "en": (
        "The conventional method in which servers are located far from users, "
        "resulting in time-consuming communication."
    ),
}
F27_NEW = {
    "jp": (
        "サーバなどのコンピュータ資源をインターネット経由で必要なときに必要な分だけ利用できる"
        "サービス形態。柔軟性と拡張性が高く、初期投資を抑えられる利点がある。"
    ),
    "zh": (
        "通过互联网按需获取服务器等计算资源的服务模式，具有灵活性、可扩展性高且能降低前期"
        "投资成本的优点。"
    ),
    "en": (
        "A service model that provides on-demand access to computing resources (servers, "
        "storage, applications) over the Internet, offering flexibility, scalability, and "
        "reduced upfront investment."
    ),
}


def fix_f27_p501_cloud() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_501.json", "output/pages/page_501.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        e = ents[1]
        for lang in ("jp", "zh", "en"):
            cur_old, err = _patch_leaf(e, ["definition", lang], F27_OLD[lang], F27_NEW[lang])
            edits.append(_edit(
                path.relative_to(ROOT),
                [f"entities[1].definition", lang],
                cur_old, F27_NEW[lang], err,
            ))
        save_json(path, d)
    return edits


# ---------- F28 p508 情報セキュリティ definition.en safety -> security ----------
F28_OLD_EN = (
    "Protecting information assets and ensuring safety against new risks arising from the "
    "spread of the Internet"
)
F28_NEW_EN = (
    "Protecting information assets and ensuring security against new risks arising from the "
    "spread of the Internet"
)


def fix_f28_p508_info_security() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_508.json", "output/pages/page_508.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        # Locate term with surface.jp == 情報セキュリティ (NOT 情報セキュリティの脅威)
        target_idx = None
        for i, e in enumerate(ents):
            if isinstance(e, dict) and e.get("surface", {}).get("jp") == "情報セキュリティ":
                target_idx = i
                break
        if target_idx is None:
            edits.append({
                "file": str(path.relative_to(ROOT)),
                "path": ["entities[?].(surface.jp=情報セキュリティ)"],
                "skip_reason": "entity not found",
            })
            save_json(path, d)
            continue
        e = ents[target_idx]
        cur_old, err = _patch_leaf(e, ["definition", "en"], F28_OLD_EN, F28_NEW_EN)
        edits.append(_edit(
            path.relative_to(ROOT),
            [f"entities[{target_idx}].definition", "en"],
            cur_old, F28_NEW_EN, err,
        ))
        save_json(path, d)
    return edits


# ---------- F29 Shoulder Hacking -> Shoulder Surfing on p509 + p538 ----------
def fix_f29_shoulder_surfing() -> list[dict]:
    edits: list[dict] = []
    # p509 surface.en + surface.zh + definition references
    for sub in ("translated/page_509.json", "output/pages/page_509.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        target_idx = None
        for i, e in enumerate(ents):
            if isinstance(e, dict) and e.get("surface", {}).get("jp") == "ショルダーハック":
                target_idx = i
                break
        if target_idx is None:
            edits.append({
                "file": str(path.relative_to(ROOT)),
                "path": ["entities[?].(surface.jp=ショルダーハック)"],
                "skip_reason": "entity not found",
            })
            save_json(path, d)
            continue
        e = ents[target_idx]
        cur_old, err = _patch_leaf(e, ["surface", "en"], "Shoulder Hacking", "Shoulder Surfing")
        edits.append(_edit(
            path.relative_to(ROOT),
            [f"entities[{target_idx}].surface", "en"],
            cur_old, "Shoulder Surfing", err,
        ))
        save_json(path, d)
    # p538 EN definition reference to "shoulder hacking" -> "shoulder surfing"
    for sub in ("translated/page_538.json", "output/pages/page_538.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        for i, e in enumerate(ents):
            if not isinstance(e, dict):
                continue
            d_en = e.get("definition", {}).get("en")
            if isinstance(d_en, str) and "shoulder hacking" in d_en.lower():
                new_en = d_en.replace("shoulder hacking", "shoulder surfing").replace(
                    "Shoulder hacking", "Shoulder surfing",
                ).replace("Shoulder Hacking", "Shoulder Surfing")
                e["definition"]["en"] = new_en
                edits.append(_edit(
                    path.relative_to(ROOT),
                    [f"entities[{i}].definition", "en"],
                    d_en, new_en, None,
                ))
        save_json(path, d)
    return edits


# ---------- F30 p511 RAT remove Trojan framing ----------
F30_OLD_EN = "RAT (Remote Access Trojan)"
F30_NEW_EN = "RAT (Remote Access Tool)"
F30_OLD_ZH = "远程访问木马（RAT）"
F30_NEW_ZH = "远程访问工具（RAT）"


def fix_f30_p511_rat() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_511.json", "output/pages/page_511.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        target_idx = None
        for i, e in enumerate(ents):
            if isinstance(e, dict) and e.get("surface", {}).get("jp") == "RAT":
                target_idx = i
                break
        if target_idx is None:
            edits.append({
                "file": str(path.relative_to(ROOT)),
                "path": ["entities[?].(surface.jp=RAT)"],
                "skip_reason": "entity not found",
            })
            save_json(path, d)
            continue
        e = ents[target_idx]
        # surface.en
        cur_old, err = _patch_leaf(e, ["surface", "en"], F30_OLD_EN, F30_NEW_EN)
        edits.append(_edit(
            path.relative_to(ROOT),
            [f"entities[{target_idx}].surface", "en"],
            cur_old, F30_NEW_EN, err,
        ))
        # surface.zh
        cur_old, err = _patch_leaf(e, ["surface", "zh"], F30_OLD_ZH, F30_NEW_ZH)
        edits.append(_edit(
            path.relative_to(ROOT),
            [f"entities[{target_idx}].surface", "zh"],
            cur_old, F30_NEW_ZH, err,
        ))
        # definition.en also says 'RAT (Remote Access Trojan)' at the start — fix
        d_en = e.get("definition", {}).get("en")
        if isinstance(d_en, str) and F30_OLD_EN in d_en:
            new_en = d_en.replace(F30_OLD_EN, F30_NEW_EN)
            e["definition"]["en"] = new_en
            edits.append(_edit(
                path.relative_to(ROOT),
                [f"entities[{target_idx}].definition", "en"],
                d_en, new_en, None,
            ))
        # definition.zh likewise
        d_zh = e.get("definition", {}).get("zh")
        if isinstance(d_zh, str) and F30_OLD_ZH in d_zh:
            new_zh = d_zh.replace(F30_OLD_ZH, F30_NEW_ZH)
            e["definition"]["zh"] = new_zh
            edits.append(_edit(
                path.relative_to(ROOT),
                [f"entities[{target_idx}].definition", "zh"],
                d_zh, new_zh, None,
            ))
        save_json(path, d)
    return edits


# ---------- F31 p539 技術的セキュリティ対策 definition rewrite ----------
F31_OLD = {
    "jp": "技術的な手段によって引き起こされる脅威への対策です。",
    "zh": "针对由技术手段引发的威胁所采取的对策。",
    "en": "Countermeasures against threats caused by technical means.",
}
F31_NEW = {
    "jp": (
        "ファイアウォール、暗号化、アクセス制御などの技術的な手段を用いて実施するセキュリティ対策。"
    ),
    "zh": "通过防火墙、加密、访问控制等技术手段实施的安全对策。",
    "en": (
        "Security countermeasures implemented through technical means such as firewalls, "
        "encryption, and access control."
    ),
}


def fix_f31_p539_tech_security() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_539.json", "output/pages/page_539.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        target_idx = None
        for i, e in enumerate(ents):
            if isinstance(e, dict) and e.get("surface", {}).get("jp") == "技術的セキュリティ対策":
                target_idx = i
                break
        if target_idx is None:
            edits.append({
                "file": str(path.relative_to(ROOT)),
                "path": ["entities[?].(surface.jp=技術的セキュリティ対策)"],
                "skip_reason": "entity not found",
            })
            save_json(path, d)
            continue
        e = ents[target_idx]
        for lang in ("jp", "zh", "en"):
            cur_old, err = _patch_leaf(e, ["definition", lang], F31_OLD[lang], F31_NEW[lang])
            edits.append(_edit(
                path.relative_to(ROOT),
                [f"entities[{target_idx}].definition", lang],
                cur_old, F31_NEW[lang], err,
            ))
        save_json(path, d)
    return edits


# ---------- F32 p544 ベネトレーション -> ペネトレーション ----------
def fix_f32_p544_penetration() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_544.json", "output/pages/page_544.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        e = ents[3]
        # surface.jp
        sj_old = e.get("surface", {}).get("jp")
        if isinstance(sj_old, str) and "ベネトレーション" in sj_old:
            new = sj_old.replace("ベネトレーション", "ペネトレーション")
            e["surface"]["jp"] = new
            edits.append(_edit(
                path.relative_to(ROOT), ["entities[3].surface", "jp"],
                sj_old, new, None,
            ))
        else:
            edits.append({
                "file": str(path.relative_to(ROOT)),
                "path": ["entities[3].surface", "jp"],
                "before": sj_old,
                "intended_after": "ペネトレーションテスト",
                "skip_reason": "no ベネトレーション in surface.jp",
            })
        # definition.jp
        dj_old = e.get("definition", {}).get("jp")
        if isinstance(dj_old, str) and "ベネトレーション" in dj_old:
            new = dj_old.replace("ベネトレーション", "ペネトレーション")
            e["definition"]["jp"] = new
            edits.append(_edit(
                path.relative_to(ROOT), ["entities[3].definition", "jp"],
                dj_old, new, None,
            ))
        else:
            edits.append({
                "file": str(path.relative_to(ROOT)),
                "path": ["entities[3].definition", "jp"],
                "before": dj_old,
                "intended_after": "ペネトレーション...",
                "skip_reason": "no ベネトレーション in definition.jp",
            })
        save_json(path, d)
    return edits


# ---------- F33 p546 セキュアブート zh: katakana + 「」brackets ----------
def fix_f33_p546_secure_boot() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_546.json", "output/pages/page_546.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        e = ents[0]
        d_zh_old = e.get("definition", {}).get("zh")
        if not isinstance(d_zh_old, str):
            edits.append({
                "file": str(path.relative_to(ROOT)),
                "path": ["entities[0].definition", "zh"],
                "skip_reason": "no definition.zh",
            })
            save_json(path, d)
            continue
        new_zh = d_zh_old
        # Replace katakana with chinese equivalents
        # Original line: 「セキュア」意为「安全」，「ブート」意为「启动」。
        new_zh = new_zh.replace("「セキュア」", "\"Secure\"")
        new_zh = new_zh.replace("「ブート」", "\"Boot\"")
        # Replace remaining 「」 with chinese double quotes
        new_zh = new_zh.replace("「", "\"").replace("」", "\"")
        if new_zh != d_zh_old:
            e["definition"]["zh"] = new_zh
            edits.append(_edit(
                path.relative_to(ROOT), ["entities[0].definition", "zh"],
                d_zh_old, new_zh, None,
            ))
        else:
            edits.append({
                "file": str(path.relative_to(ROOT)),
                "path": ["entities[0].definition", "zh"],
                "before": d_zh_old,
                "intended_after": "katakana + brackets normalized",
                "skip_reason": "no changes needed",
            })
        save_json(path, d)
    return edits


# ---------- F34 p562 entity[21] DevOps contaminating sentence removal ----------
F34_OLD_JP = (
    "DevOpsとは、開発側と運用側が連携してシステム化を実現する考え方。"
    "プロトタイピング、プログラムの構造仕様書などで、内部構造を見ることである。"
)
F34_NEW_JP = "DevOpsとは、開発側と運用側が連携してシステム化を実現する考え方である。"
F34_OLD_ZH = (
    "DevOps 是一种开发方与运维方紧密协作以实现系统化的思想，常借助原型设计和程序结构"
    "说明文档来掌握内部结构。"
)
F34_NEW_ZH = "DevOps 是一种开发方与运维方紧密协作以实现系统化的思想。"
F34_OLD_EN = (
    "DevOps is a philosophy in which development and operations cooperate to deliver "
    "systems, often using prototyping and structural specifications to understand the "
    "internals."
)
F34_NEW_EN = (
    "DevOps is a philosophy in which development and operations cooperate to deliver "
    "systems faster and more reliably."
)


def fix_f34_p562_devops() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_562.json", "output/pages/page_562.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        e = ents[21]
        for lang, (old, new) in (
            ("jp", (F34_OLD_JP, F34_NEW_JP)),
            ("zh", (F34_OLD_ZH, F34_NEW_ZH)),
            ("en", (F34_OLD_EN, F34_NEW_EN)),
        ):
            cur_old, err = _patch_leaf(e, ["definition", lang], old, new)
            edits.append(_edit(
                path.relative_to(ROOT), [f"entities[21].definition", lang],
                cur_old, new, err,
            ))
        save_json(path, d)
    return edits


# ---------- F35 p562 entity[2] さな目的 -> 主な目的 ----------
F35_OLD_JP = (
    "要件定義プロセスの主な目的は、業務要件を決めるプロセスである。"
    "要件定義プロセスのさな目的はユーザーのニーズを知ること。"
)
F35_NEW_JP = (
    "要件定義プロセスの主な目的は、業務要件を決めるプロセスである。"
    "要件定義プロセスの主な目的はユーザーのニーズを知ること。"
)


def fix_f35_p562_requirements() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_562.json", "output/pages/page_562.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        e = ents[2]
        cur_old, err = _patch_leaf(e, ["definition", "jp"], F35_OLD_JP, F35_NEW_JP)
        edits.append(_edit(
            path.relative_to(ROOT), ["entities[2].definition", "jp"],
            cur_old, F35_NEW_JP, err,
        ))
        save_json(path, d)
    return edits


# ---------- F36 p566 entity[27] お初期化/COSの ----------
F36_OLD_JP = (
    "PCのお初期化やCOSの組み合わせを最初から考慮して、出荷時にOSのセキュリティの設定を行うこと"
)
F36_NEW_JP = (
    "PCの初期化やOSの組み合わせを最初から考慮して、出荷時にOSのセキュリティの設定を行うこと"
)


def fix_f36_p566_security_by_default() -> list[dict]:
    edits: list[dict] = []
    for sub in ("translated/page_566.json", "output/pages/page_566.json"):
        path = RUN / sub
        d = load_json(path)
        ents = _entities(d)
        e = ents[27]
        cur_old, err = _patch_leaf(e, ["definition", "jp"], F36_OLD_JP, F36_NEW_JP)
        edits.append(_edit(
            path.relative_to(ROOT), ["entities[27].definition", "jp"],
            cur_old, F36_NEW_JP, err,
        ))
        save_json(path, d)
    return edits


# ---------- MD regen for all affected pages ----------
def md_regen(pages: list[int]) -> list[dict]:
    edits: list[dict] = []
    for pg in pages:
        json_path = RUN / f"output/pages/page_{pg:03d}.json"
        md_path = RUN / f"output/pages/page_{pg:03d}.md"
        if not json_path.exists():
            edits.append({
                "file": str(md_path.relative_to(ROOT)),
                "skip_reason": "json not found",
            })
            continue
        env = ExportEnvelope.model_validate_json(json_path.read_text(encoding="utf-8"))
        md = emit_page_md(env)
        md_path.write_text(md, encoding="utf-8")
        edits.append({
            "file": str(md_path.relative_to(ROOT)),
            "action": "regenerated_from_json",
        })
    return edits


AFFECTED_PAGES = sorted({
    15, 33, 39, 56, 60, 72, 190, 198, 200, 219,
    238, 241, 270, 353, 354, 361, 374, 375, 433, 444,
    491, 501, 508, 509, 511, 530, 538, 539, 544, 546,
    561, 562, 563, 566,
})


def main() -> None:
    log: dict = {
        "round": "R24",
        "iter": 7,
        "fixes": {},
    }
    log["fixes"]["f12_p015_raid_caption"] = fix_f12_p015_raid_caption()
    log["fixes"]["f13_p033_sdgs"] = fix_f13_p033_sdgs()
    log["fixes"]["f14_p039_functional_org"] = fix_f14_p039_functional_org()
    log["fixes"]["f15_p056_balance_sheet"] = fix_f15_p056_balance_sheet()
    log["fixes"]["f16_p060_gross_profit"] = fix_f16_p060_gross_profit()
    log["fixes"]["f17_p072_protocol"] = fix_f17_p072_protocol()
    log["fixes"]["f18_p190_business_process_model"] = fix_f18_p190_business_process_model()
    log["fixes"]["f19_housing_hosting"] = fix_f19_housing_hosting()
    log["fixes"]["f20_p219_system_plan"] = fix_f20_p219_system_plan()
    log["fixes"]["f21_jp_kanji_in_zh"] = fix_f21_jp_kanji_in_zh()
    log["fixes"]["f22_p270_stakeholder"] = fix_f22_p270_stakeholder()
    log["fixes"]["f23_dual_system_zh"] = fix_f23_dual_system_zh()
    log["fixes"]["f24_p433_backup_defs"] = fix_f24_p433_backup_defs()
    log["fixes"]["f25_p433_replication"] = fix_f25_p433_replication()
    log["fixes"]["f26_p491_ipv6"] = fix_f26_p491_ipv6()
    log["fixes"]["f27_p501_cloud"] = fix_f27_p501_cloud()
    log["fixes"]["f28_p508_info_security"] = fix_f28_p508_info_security()
    log["fixes"]["f29_shoulder_surfing"] = fix_f29_shoulder_surfing()
    log["fixes"]["f30_p511_rat"] = fix_f30_p511_rat()
    log["fixes"]["f31_p539_tech_security"] = fix_f31_p539_tech_security()
    log["fixes"]["f32_p544_penetration"] = fix_f32_p544_penetration()
    log["fixes"]["f33_p546_secure_boot"] = fix_f33_p546_secure_boot()
    log["fixes"]["f34_p562_devops"] = fix_f34_p562_devops()
    log["fixes"]["f35_p562_requirements"] = fix_f35_p562_requirements()
    log["fixes"]["f36_p566_security_by_default"] = fix_f36_p566_security_by_default()
    log["md_regen"] = md_regen(AFFECTED_PAGES)

    def is_real_edit(e: dict) -> bool:
        return (
            "skip_reason" not in e
            and "action" not in e
            and "after" in e
        )

    total_edits = 0
    total_skips = 0
    fix_summary = {}
    for fix_name, items in log["fixes"].items():
        applied = sum(1 for e in items if is_real_edit(e))
        skipped = sum(1 for e in items if "skip_reason" in e)
        fix_summary[fix_name] = {"applied": applied, "skipped": skipped, "total": len(items)}
        total_edits += applied
        total_skips += skipped
    md_count = sum(1 for e in log["md_regen"] if e.get("action") == "regenerated_from_json")
    log["summary"] = {
        "fixes_count": len(log["fixes"]),
        "json_edits_applied": total_edits,
        "json_edits_skipped": total_skips,
        "md_regenerated": md_count,
        "per_fix": fix_summary,
    }

    LOG.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote log: {LOG}")
    print(f"  Fixes attempted: {len(log['fixes'])} (F12-F36)")
    print(f"  JSON edits applied: {total_edits}")
    print(f"  JSON edits skipped: {total_skips}")
    print(f"  MD pages regenerated: {md_count}")
    if total_skips:
        print("  -- skipped edits --")
        for fix_name, items in log["fixes"].items():
            for e in items:
                if "skip_reason" in e:
                    print(f"    [{fix_name}] {json.dumps(e, ensure_ascii=False)}")


if __name__ == "__main__":
    main()
