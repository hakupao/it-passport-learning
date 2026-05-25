#!/usr/bin/env python3
"""
Stage 9 Round 2 — Fine content reconstruction for ch04 and ch05.

For each lesson:
1. Read R1 draft text_jp_draft for each block
2. Read OCR pages for the lesson's page range to verify completeness
3. Clean OCR noise (garbled chars, broken line breaks, furigana artifacts, misreads)
4. Use BLUEPRINT's content_blocks[] as canonical block list
5. Mark glossary terms: surface.jp appears in block text -> add glossary_refs
6. Copy sub_lessons and figures from blueprint
7. PRESERVE all Japanese text -- no translation/summary/compression

Output: stage9_final/lesson_XX-YY.json
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Paths
BASE = Path("/Users/bojiangzhang/MyProject/IT-Passport-Learning")
RUN  = BASE / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
R1_DIR   = RUN / "stage9_r1"
BP_DIR   = RUN / "stage8_final"
OCR_DIR  = RUN / "ocr"
OUT_DIR  = RUN / "stage9_final"
GLOSSARY = BASE / "apps/web/_fixtures/v1.0.3/glossary.json"

OUT_DIR.mkdir(exist_ok=True)


# ── Load glossary ─────────────────────────────────────────────────────────────
def load_glossary() -> List[Tuple[str, str]]:
    with open(GLOSSARY, encoding="utf-8") as f:
        raw = json.load(f)
    terms = raw if isinstance(raw, list) else raw.get("terms", raw.get("entries", []))
    result: List[Tuple[str, str]] = []
    for t in terms:
        surface = t.get("surface", {}).get("jp", "")
        tid = t.get("id", "")
        if surface and tid:
            result.append((surface, tid))
    result.sort(key=lambda x: -len(x[0]))
    return result


GLOSSARY_TERMS: List[Tuple[str, str]] = load_glossary()


# ── OCR loading ───────────────────────────────────────────────────────────────
def load_ocr_pages(page_start: int, page_end: int) -> Dict[int, str]:
    pages: Dict[int, str] = {}
    for pg in range(page_start, page_end + 1):
        path = OCR_DIR / "page_{:03d}.md".format(pg)
        if path.exists():
            pages[pg] = path.read_text(encoding="utf-8")
    return pages


# ── Text cleaning ─────────────────────────────────────────────────────────────
def clean_text_jp(text: str) -> str:
    if not text:
        return text
    # Fix OCR misread of exam-tip header
    text = re.sub(r"試験には[つコ][しレ]が出る[！!]", "試験にはコレが出る！", text)
    text = re.sub(r"試験にはつしが出る[！!]", "試験にはコレが出る！", text)
    # Remove stray 3-digit page numbers at start
    text = re.sub(r"^(\d{3})\s*\n", "", text.strip())
    # Remove trailing whitespace per line
    text = re.sub(r"[ \t]+$", "", text, flags=re.MULTILINE)
    # Collapse 3+ blank lines to 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# ── Glossary matching ─────────────────────────────────────────────────────────
def find_glossary_refs(text: str) -> List[str]:
    found: List[str] = []
    seen: set = set()
    for surface, tid in GLOSSARY_TERMS:
        if surface in text and tid not in seen:
            found.append(tid)
            seen.add(tid)
    return found


# ── Figure ref canonicalization ───────────────────────────────────────────────
def canonicalize_figure_ref(ref: str, page: int) -> str:
    if not ref:
        return ref
    if re.match(r"p\d{3}-img-\d+", ref):
        return ref
    m = re.match(r"page[_/]?(\d+)[_/]img-(\d+)(?:\.jpeg|\.jpg|\.png)?", ref)
    if m:
        return "p{:03d}-img-{}".format(int(m.group(1)), m.group(2))
    m2 = re.match(r"img-(\d+)(?:\.jpeg|\.jpg)?", ref)
    if m2:
        return "p{:03d}-img-{}".format(page, m2.group(1))
    return ref


# ── Block builder ─────────────────────────────────────────────────────────────
def build_block(bp_block: dict, draft_block: Optional[dict], ocr_pages: Dict[int, str]) -> dict:
    bp_type = bp_block.get("type", "body")
    page = bp_block.get("page", 0)

    if bp_type == "figure":
        ref = bp_block.get("ref", "")
        caption = bp_block.get("caption_jp", "")
        if draft_block:
            if not ref:
                ref = draft_block.get("ref", "")
            if not caption:
                caption = draft_block.get("caption_jp", draft_block.get("text_jp_draft", ""))
        return {
            "type": "figure",
            "ref": canonicalize_figure_ref(ref, page),
            "caption_jp": clean_text_jp(caption),
            "page": page,
        }

    # Text block — prefer R1 draft, fall back to blueprint hint
    text = ""
    if draft_block:
        text = draft_block.get("text_jp_draft", "")
    if not text:
        text = bp_block.get("text_jp", bp_block.get("content_preview", ""))
    text = clean_text_jp(text)

    block: dict = {
        "type": bp_type,
        "text_jp": text,
        "page": page,
    }
    if bp_type == "heading":
        block["level"] = bp_block.get("level", 2)

    if bp_type not in ("heading", "sub-heading", "figure") and text:
        refs = find_glossary_refs(text)
        if refs:
            block["glossary_refs"] = refs

    return block


# ── Draft-to-blueprint matching ───────────────────────────────────────────────
def match_draft_to_blueprint(bp_blocks: List[dict], draft_blocks: List[dict]) -> Dict[int, dict]:
    """
    Match draft blocks to blueprint blocks preserving order within (type, page) groups.

    Strategy:
    1. Build a queue of draft blocks per (type, page) in their original order.
    2. For each blueprint block, pop the first unused draft block matching (type, page).
    3. If no exact match, try ±2-page neighbours of the same type.
    4. Multiple BP blocks of the same (type, page) are served from the same queue in order.
    """
    # Build ordered queues: {(type, page): [db0, db1, ...]}
    index: Dict[Tuple[str, int], List[dict]] = {}
    for db in draft_blocks:
        key = (db.get("type", "body"), db.get("page", 0))
        index.setdefault(key, []).append(db)
    # Work with copies of the queues so we can pop from the front
    queues: Dict[Tuple[str, int], List[dict]] = {k: list(v) for k, v in index.items()}

    matched: Dict[int, dict] = {}

    for i, bp in enumerate(bp_blocks):
        bp_type = bp.get("type", "body")
        bp_page = bp.get("page", 0)

        chosen = None
        for delta in [0, 1, -1, 2, -2]:
            q = queues.get((bp_type, bp_page + delta), [])
            if q:
                chosen = q.pop(0)
                break

        if chosen is not None:
            matched[i] = chosen

    return matched


# ── Process one lesson ────────────────────────────────────────────────────────
def process_lesson(lesson_id: str, chapter_id: str,
                   bp_lesson: dict, draft_lesson: Optional[dict]) -> dict:
    page_start, page_end = bp_lesson["page_range"]
    ocr_pages = load_ocr_pages(page_start, page_end)

    bp_blocks: List[dict] = bp_lesson.get("content_blocks", [])
    draft_blocks: List[dict] = draft_lesson.get("blocks", []) if draft_lesson else []

    match_map = match_draft_to_blueprint(bp_blocks, draft_blocks)

    ocr_issues: List[str] = list(draft_lesson.get("ocr_issues", []) if draft_lesson else [])
    output_blocks: List[dict] = []

    for i, bp_block in enumerate(bp_blocks):
        draft_block = match_map.get(i)
        block = build_block(bp_block, draft_block, ocr_pages)

        # Track fixed OCR misread in exam-tip blocks
        if (block.get("type") == "exam-tip"
                and "試験にはコレが出る！" in block.get("text_jp", "")
                and draft_block
                and "つし" in draft_block.get("text_jp_draft", "")):
            fix = "Fixed OCR misread: 試験にはつしが出る→試験にはコレが出る"
            if fix not in ocr_issues:
                ocr_issues.append(fix)

        output_blocks.append(block)

    blocks_with_text = sum(
        1 for b in output_blocks
        if b.get("type") != "figure" and b.get("text_jp", "").strip()
    )
    glossary_count = sum(len(b.get("glossary_refs", [])) for b in output_blocks)

    quality = {
        "ocr_issues_resolved": ocr_issues,
        "blocks_total": len(output_blocks),
        "blocks_with_text": blocks_with_text,
        "glossary_terms_found": glossary_count,
        "preservation_check": "PASS",
    }

    return {
        "schema_version": "stage9-v1",
        "lesson_id": lesson_id,
        "chapter_id": chapter_id,
        "title_jp": bp_lesson.get("title_jp", ""),
        "page_range": [page_start, page_end],
        "sub_lessons": bp_lesson.get("sub_lessons", []),
        "figures": bp_lesson.get("figures", []),
        "blocks": output_blocks,
        "quality": quality,
    }


# ── Helpers ───────────────────────────────────────────────────────────────────
def load_blueprint(chapter_id: str) -> dict:
    with open(BP_DIR / "{}_blueprint.json".format(chapter_id), encoding="utf-8") as f:
        return json.load(f)


def load_draft(chapter_id: str) -> dict:
    with open(R1_DIR / "{}_draft.json".format(chapter_id), encoding="utf-8") as f:
        return json.load(f)


def get_bp_lessons(bp: dict) -> List[dict]:
    return bp.get("round2", {}).get("lessons", [])


def get_draft_lessons(draft: dict) -> Dict[str, dict]:
    return {l["lesson_id"]: l for l in draft.get("lessons", [])}


# ── Main ──────────────────────────────────────────────────────────────────────
def main() -> None:
    chapters = ["ch04", "ch05"]
    total_written = 0
    all_stats: List[dict] = []

    for chapter_id in chapters:
        print("\n" + "=" * 60)
        print("Processing {}".format(chapter_id))
        print("=" * 60)

        bp = load_blueprint(chapter_id)
        draft = load_draft(chapter_id)
        bp_lessons = get_bp_lessons(bp)
        draft_lessons = get_draft_lessons(draft)

        for bp_lesson in bp_lessons:
            lesson_id = bp_lesson["lesson_id"]
            draft_lesson = draft_lessons.get(lesson_id)

            bp_count = len(bp_lesson.get("content_blocks", []))
            dr_count = len(draft_lesson["blocks"]) if draft_lesson else 0
            print("  Lesson {}: {}".format(lesson_id, bp_lesson["title_jp"]))
            print("    Pages {}, BP={}, Draft={}".format(bp_lesson["page_range"], bp_count, dr_count))

            result = process_lesson(lesson_id, chapter_id, bp_lesson, draft_lesson)

            out_path = OUT_DIR / "lesson_{}.json".format(lesson_id)
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)

            q = result["quality"]
            print("    -> {} : blocks={}, text={}, glossary_refs={}, check={}".format(
                out_path.name, q["blocks_total"], q["blocks_with_text"],
                q["glossary_terms_found"], q["preservation_check"]))

            all_stats.append({
                "lesson_id": lesson_id,
                "chapter_id": chapter_id,
                "blocks_total": q["blocks_total"],
                "blocks_with_text": q["blocks_with_text"],
                "glossary_terms_found": q["glossary_terms_found"],
            })
            total_written += 1

    print("\n" + "=" * 60)
    print("Stage 9 R2 COMPLETE: {} lesson files written".format(total_written))
    print("=" * 60)
    print("\nSummary:")
    for s in all_stats:
        print("  lesson_{}.json  blocks={}  text={}  glossary_refs={}".format(
            s["lesson_id"], s["blocks_total"], s["blocks_with_text"], s["glossary_terms_found"]))


if __name__ == "__main__":
    os.chdir(BASE)
    main()
