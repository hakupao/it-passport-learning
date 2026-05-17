#!/usr/bin/env python3
"""Round 8 surgical fixes for minor jp surface errors in R6-fixed pages.

R8.1 — page_026 entity[3].title.jp: "消去法を戦略的の1つ" → "消去法も戦略の1つ"
R8.2 — page_278 entity[4].definition (jp+zh+en) — inverted negation in inappropriate
       communication example (2): should be "NOT sending to a person who SHOULD be informed"
"""
from __future__ import annotations

import json
from pathlib import Path

ITER2 = Path(__file__).resolve().parents[1] / "iter_2"


P278_NEW_DEFINITION = {
    "jp": "プロジェクトコミュニケーションマネジメントでは、誰が、誰に、いつ、どうやって、何を伝達するのかを管理します。プロジェクトを円滑に進めるためには適切なコミュニケーションが不可欠です。不適切なコミュニケーションの例としては、（1）情報の伝達が遅れたこと、（2）情報を知らせるべき人に送っていなかったこと、（3）情報を知らせてはいけない人に送ってしまったこと、などが挙げられます。プロジェクトで伝達する内容の例としては、プロジェクトの進捗や、会議の日程、議事録などがあります。また、コミュニケーションの手段には、口頭、電話、電子メール、テレビ電話、チャット、掲示板サイトなどがあります。",
    "zh": "项目沟通管理负责管理由谁、向谁、何时、以何种方式、传达何种内容。要顺利推进项目，适当的沟通必不可少。不适当的沟通示例包括：（1）信息传达延迟、（2）未将信息发送给本应被告知的人、（3）将信息发送给了不应被告知的人，等等。项目中需要传达的内容示例包括项目进度、会议日程、会议纪要等。沟通的手段包括口头、电话、电子邮件、电视电话、聊天、公告板网站等。",
    "en": "Project Communications Management governs who, to whom, when, how, and what is to be conveyed. Appropriate communication is essential for projects to progress smoothly. Examples of inappropriate communication include: (1) delayed transmission of information, (2) failing to send information to those who should have been informed, and (3) sending information to those who should not be informed. Examples of content to be communicated in a project include project progress, meeting schedules, and meeting minutes. Communication channels include verbal, telephone, e-mail, video calls, chat, and bulletin-board sites."
}


def fix_p026():
    """Replace 消去法を戦略的の1つ → 消去法も戦略の1つ in page_026 jp fields."""
    changes = []
    for stage in ["fixed_structured", "fixed_translated"]:
        f = ITER2 / stage / "page_026.json"
        d = json.loads(f.read_text(encoding="utf-8"))
        def walk(node):
            if isinstance(node, dict):
                for k, v in list(node.items()):
                    if k == "jp" and isinstance(v, str) and "消去法を戦略的の1つ" in v:
                        node[k] = v.replace("消去法を戦略的の1つ", "消去法も戦略の1つ")
                        changes.append((stage, "jp"))
                    else:
                        walk(v)
            elif isinstance(node, list):
                for v in node: walk(v)
        walk(d)
        f.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # output JSON + MD
    f = ITER2 / "fixed_output/pages/page_026.json"
    d = json.loads(f.read_text(encoding="utf-8"))
    def walk2(node):
        if isinstance(node, dict):
            for k, v in list(node.items()):
                if k == "jp" and isinstance(v, str) and "消去法を戦略的の1つ" in v:
                    node[k] = v.replace("消去法を戦略的の1つ", "消去法も戦略の1つ")
                    changes.append(("output", "jp"))
                else:
                    walk2(v)
        elif isinstance(node, list):
            for v in node: walk2(v)
    walk2(d)
    f.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    fmd = ITER2 / "fixed_output/pages/page_026.md"
    if fmd.exists():
        txt = fmd.read_text(encoding="utf-8")
        if "消去法を戦略的の1つ" in txt:
            fmd.write_text(txt.replace("消去法を戦略的の1つ", "消去法も戦略の1つ"), encoding="utf-8")
            changes.append(("output_md", "jp"))

    return changes


def fix_p278():
    """Replace p278 entity[4].definition jp/zh/en with corrected semantics."""
    changes = []
    for stage in ["fixed_translated", "fixed_output/pages"]:
        f = ITER2 / stage / "page_278.json"
        d = json.loads(f.read_text(encoding="utf-8"))
        # output wrapper: entities = d.entities
        if isinstance(d, dict) and "entities" in d:
            entities = d["entities"]
        else:
            entities = d
        if len(entities) > 4:
            e = entities[4]
            if isinstance(e.get("definition"), dict):
                for lang, new in P278_NEW_DEFINITION.items():
                    e["definition"][lang] = new
                changes.append((stage, "entity[4].definition"))
        f.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # structured (jp only; zh/en stay as <UNTRANSLATED>)
    f = ITER2 / "fixed_structured/page_278.json"
    d = json.loads(f.read_text(encoding="utf-8"))
    if len(d) > 4:
        e = d[4]
        if isinstance(e.get("definition"), dict) and "jp" in e["definition"]:
            e["definition"]["jp"] = P278_NEW_DEFINITION["jp"]
            changes.append(("fixed_structured", "entity[4].definition.jp"))
    f.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    return changes


def main():
    p026 = fix_p026()
    p278 = fix_p278()
    log = {
        "round": "R8",
        "date": "2026-05-17",
        "fix_R8.1_p026": {"changes": p026},
        "fix_R8.2_p278": {"changes": p278},
    }
    (ITER2 / "r8_fixes_log.json").write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"R8.1 p026 fix: {len(p026)} changes")
    print(f"R8.2 p278 fix: {len(p278)} changes")


if __name__ == "__main__":
    main()
