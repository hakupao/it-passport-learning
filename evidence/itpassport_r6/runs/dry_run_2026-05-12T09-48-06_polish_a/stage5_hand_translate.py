"""Hand-translate the 4 stubborn leaves where both Sonnet 4.6 and Opus 4.7
produced JSON-broken output (ASCII double quotes inside zh without escaping).

Per Session 09b precedent (v1 baseline post Plan-B also hand-translated 2
leaves). Same Rule B traceability: this script is the single source of
truth for the hand-edits applied.

After running this script the new run's `translated/` should have 0
UNTRANSLATED occurrences.
"""
from __future__ import annotations

import json
from pathlib import Path

from cert_extractor import UNTRANSLATED

RUN_DIR = Path("data/itpassport_r6/runs/dry_run_2026-05-12T09-48-06_polish_a")

HAND_TRANSLATIONS = [
    # (page, jp, zh, en)
    (
        30,
        "会社の運営方針を決定するための「最も基本的、かつ大切な指針」。会社に関するあらゆることは経営理念に沿って決められ、「会社の存在意義」と表現されることもある。",
        "决定公司运营方针的「最基本且最重要的指针」。公司相关的一切事项都依据经营理念来决定，有时也被表述为「公司存在的意义」。",
        "The 'most fundamental and important guideline' for determining a company's operational policy. Everything related to the company is decided according to the management philosophy, and it is sometimes described as 'the company's reason for being'.",
    ),
    (
        31,
        "企業の存在意義。経営者や社員が日々の業務で迷った際の「判断基準」となる指針。",
        "企业的存在意义。是经营者和员工在日常业务中遇到困惑时作为「判断标准」的指导方针。",
        "A company's reason for being. Guidelines that serve as a 'judgment criterion' when management and employees face uncertainty in their daily work.",
    ),
    (
        32,
        "株主が集まる会議。株主とは「会社にお金を出資している人」のこと。",
        "股东聚集召开的会议。股东是指「向公司出资的人」。",
        "A meeting where shareholders gather. A shareholder is 'a person who invests money in the company'.",
    ),
    (
        33,
        "CSRの1つ。人種、性別、年齢、国籍などの「多様性」を受け入れて、さまざまな人材を活用することで生産性を高めようとする考え方。一例として「女性の活躍の場を広げる」などが挙げられる",
        "企业社会责任的一种。接纳人种、性别、年龄、国籍等方面的「多样性」，通过活用多样化的人才来提高生产率的理念。一个典型例子是「扩大女性的活跃领域」。",
        "One form of CSR. The concept of accepting 'diversity' in race, gender, age, nationality, and other dimensions, and improving productivity by leveraging a wide range of human resources. One example is 'expanding the spheres in which women can thrive'.",
    ),
]


def _find_and_patch(node, jp, zh, en) -> bool:
    if isinstance(node, dict):
        if node.get("jp") == jp and node.get("zh") == UNTRANSLATED:
            node["zh"] = zh
            node["en"] = en
            return True
        for v in node.values():
            if _find_and_patch(v, jp, zh, en):
                return True
    elif isinstance(node, list):
        for item in node:
            if _find_and_patch(item, jp, zh, en):
                return True
    return False


def main() -> int:
    patched_total = 0
    for page, jp, zh, en in HAND_TRANSLATIONS:
        path = RUN_DIR / "translated" / f"page_{page:03d}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        patched = 0
        # Iterate until no more occurrences of this jp/UNTRANSLATED pair remain;
        # some entities have duplicates (e.g. dup definitions on page_033).
        while _find_and_patch(data, jp, zh, en):
            patched += 1
        path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"page_{page:03d}: patched {patched} occurrence(s) of jp[:30]={jp[:30]!r}")
        patched_total += patched

    total_unt = sum(
        p.read_text(encoding="utf-8").count("UNTRANSLATED")
        for p in (RUN_DIR / "translated").glob("page_*.json")
    )
    print(f"\nHand-translated {patched_total} leaf occurrence(s) across 4 jp surfaces")
    print(f"Remaining UNTRANSLATED across 40 pages: {total_unt}")
    return 0 if total_unt == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
