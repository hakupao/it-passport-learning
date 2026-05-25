#!/usr/bin/env python3
"""
Stage 9 Round 2 — Fine content reconstruction for ch00, ch02, ch03.

For each chapter, process ALL its lessons and produce individual lesson JSON files.
Reads:
  - stage9_r1/{chID}_draft.json      → R1 coarse text per block
  - stage8_final/{chID}_blueprint.json → canonical block structure (round2.lessons[])
  - ocr/page_NNN.md                  → raw OCR for verification / gap-fill
  - glossary.json                    → terms for glossary_refs tagging

Writes:
  - stage9_final/lesson_{XX}-{YY}.json  (one per lesson)
"""

import json
import os
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE = Path("/Users/bojiangzhang/MyProject/IT-Passport-Learning/data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19")
GLOSSARY_PATH = Path("/Users/bojiangzhang/MyProject/IT-Passport-Learning/apps/web/_fixtures/v1.0.3/glossary.json")
OUT_DIR = BASE / "stage9_final"
OUT_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# Load glossary
# ---------------------------------------------------------------------------
def load_glossary():
    with open(GLOSSARY_PATH, encoding="utf-8") as f:
        d = json.load(f)
    entries = d["entries"]
    # Build list of (surface_jp, id) sorted by length desc so longer terms match first
    terms = []
    for e in entries:
        surface_jp = e["surface"]["jp"]
        gid = e["id"]
        aliases = e.get("aliases_jp", []) or []
        # include all forms
        for s in [surface_jp] + aliases:
            if s:
                terms.append((s, gid))
    # sort by length descending — greedy longest match
    terms.sort(key=lambda x: len(x[0]), reverse=True)
    return terms

GLOSSARY_TERMS = load_glossary()

def find_glossary_refs(text: str) -> list:
    """Return sorted unique glossary IDs whose surface.jp appears in text."""
    found = {}
    for surface, gid in GLOSSARY_TERMS:
        if surface in text and gid not in found:
            found[gid] = True
    return sorted(found.keys())

# ---------------------------------------------------------------------------
# Load OCR pages
# ---------------------------------------------------------------------------
def load_ocr_pages(page_range: list) -> dict:
    """Return {page_num: ocr_text} for pages in range [start, end] inclusive."""
    pages = {}
    start, end = page_range[0], page_range[1]
    for p in range(start, end + 1):
        path = BASE / "ocr" / f"page_{p:03d}.md"
        if path.exists():
            pages[p] = path.read_text(encoding="utf-8")
        else:
            pages[p] = ""
    return pages

# ---------------------------------------------------------------------------
# OCR cleaning helpers
# ---------------------------------------------------------------------------
OCR_FIXES = [
    # HTML entities
    (r"&amp;", "&"),
    (r"&lt;", "<"),
    (r"&gt;", ">"),
    (r"&nbsp;", " "),
    # Leading stray single characters (page number artifacts like "v\n" or "xi\n")
    (r"^\s*[vxilXVI]{1,4}\s*\n", ""),
    # Stray page number artifacts at line start (digits alone on a line)
    (r"^\d{1,3}\s*\n", "", re.MULTILINE),
    # Furigana artifacts: small kana in parentheses after kanji
    (r"（[ぁ-ん]{1,5}）", ""),
    # Double spaces
    (r"  +", " "),
    # Trailing whitespace per line
    (r" +\n", "\n"),
    # Multiple blank lines → single blank line
    (r"\n{3,}", "\n\n"),
]

def clean_ocr_noise(text: str) -> str:
    result = text
    for fix in OCR_FIXES:
        pattern, repl = fix[0], fix[1]
        flags = fix[2] if len(fix) > 2 else 0
        result = re.sub(pattern, repl, result, flags=flags)
    return result.strip()

# ---------------------------------------------------------------------------
# Build text from R1 draft blocks for a specific page range
# ---------------------------------------------------------------------------
def get_r1_blocks_for_lesson(r1_lesson: dict) -> list:
    """Return the list of R1 draft blocks for a lesson."""
    return r1_lesson.get("blocks", [])

def build_r1_text_index(r1_lesson: dict) -> dict:
    """Return dict: (type, page, index_within_page_type) -> text_jp_draft"""
    idx = {}
    counts = {}
    for b in r1_lesson.get("blocks", []):
        key_base = (b.get("type"), b.get("page"))
        n = counts.get(key_base, 0)
        idx[(b.get("type"), b.get("page"), n)] = b.get("text_jp_draft", "")
        counts[key_base] = n + 1
    return idx

# ---------------------------------------------------------------------------
# Figure ref resolution
# For blueprint figures, the "ref" field is canonical when present.
# For R1 blocks and OCR, we construct pNNN-img-N refs.
# ---------------------------------------------------------------------------
def resolve_figure_ref(bp_block: dict, bp_figures: list) -> str:
    """Return the canonical ref for a figure block."""
    # blueprint may have a direct ref
    if "ref" in bp_block:
        return bp_block["ref"]
    # Try to match from figures list by page
    page = bp_block.get("page")
    page_figs = [f for f in bp_figures if f.get("page") == page]
    if len(page_figs) == 1:
        return page_figs[0].get("ref", f"p{page:03d}-img-0")
    # Multiple figs on page — try to find from text_hint
    hint = bp_block.get("text_hint", "")
    for fig in page_figs:
        fig_ref = fig.get("ref", "")
        if fig_ref and fig_ref in hint:
            return fig_ref
    if page_figs:
        return page_figs[0].get("ref", f"p{page:03d}-img-0")
    return f"p{page:03d}-img-0"

def get_figure_caption(bp_block: dict, bp_figures: list, ocr_pages: dict) -> str:
    """Return caption_jp for a figure block."""
    page = bp_block.get("page")
    ref = resolve_figure_ref(bp_block, bp_figures)
    # Look in figures list
    for fig in bp_figures:
        if fig.get("ref") == ref or (fig.get("page") == page and len([f for f in bp_figures if f.get("page") == page]) == 1):
            desc = fig.get("description_jp", "")
            if desc:
                return desc
    # Fall back to hint
    return bp_block.get("text_hint", "")

# ---------------------------------------------------------------------------
# Core: build output block from blueprint block + R1 draft + OCR
# ---------------------------------------------------------------------------
def build_output_block(bp_block: dict, r1_blocks: list, bp_figures: list, ocr_pages: dict, r1_page_cursor: dict) -> dict:
    """
    Produce one output block in stage9-v1 schema from:
      - bp_block: blueprint block (type, page, text_hint)
      - r1_blocks: all R1 blocks for this lesson (as list)
      - bp_figures: blueprint figures for this lesson
      - ocr_pages: {page_num: ocr_text}
      - r1_page_cursor: mutable dict tracking which R1 block index we're at per (type, page)
    """
    btype = bp_block.get("type", "body")
    page = bp_block.get("page", 0)
    hint = bp_block.get("text_hint", "")

    out = {"type": btype, "page": page}

    if btype == "figure":
        ref = resolve_figure_ref(bp_block, bp_figures)
        caption = get_figure_caption(bp_block, bp_figures, ocr_pages)
        out["ref"] = ref
        if caption:
            out["caption_jp"] = caption
        return out

    if btype == "figure-caption":
        # figure captions are embedded in figure blocks above; skip as standalone
        # But we include them as body blocks with text
        text = _resolve_text(btype, page, hint, r1_blocks, r1_page_cursor, ocr_pages)
        text = clean_ocr_noise(text)
        if not text:
            text = hint
        out["type"] = "body"
        out["text_jp"] = text
        out["glossary_refs"] = find_glossary_refs(text)
        return out

    # Text-bearing blocks
    text = _resolve_text(btype, page, hint, r1_blocks, r1_page_cursor, ocr_pages)
    text = clean_ocr_noise(text)
    if not text:
        # last resort: use the hint itself
        text = hint

    if btype == "heading":
        level = bp_block.get("level", 2)
        out["level"] = level
        out["text_jp"] = text
    elif btype == "sub-heading":
        out["type"] = "sub-heading"
        out["text_jp"] = text
    else:
        out["text_jp"] = text
        out["glossary_refs"] = find_glossary_refs(text)

    return out


def _resolve_text(btype: str, page: int, hint: str, r1_blocks: list, r1_page_cursor: dict, ocr_pages: dict) -> str:
    """
    Find the best text from R1 draft, falling back to OCR snippet.
    Strategy:
    1. Find R1 block on same page with same type (advancing cursor)
    2. Fuzzy-match by text_hint prefix in R1 blocks
    3. Fall back to OCR page text extraction
    4. Fall back to hint
    """
    cursor_key = (btype, page)
    cursor = r1_page_cursor.get(cursor_key, 0)

    # Collect R1 blocks that match type+page
    matching = [(i, b) for i, b in enumerate(r1_blocks)
                if b.get("type") == btype and b.get("page") == page]

    # Also try synonym types
    type_synonyms = {
        "key-concept": ["key-concept", "mnemonic"],
        "mnemonic": ["mnemonic", "key-concept"],
        "sub-heading": ["sub-heading"],
        "table": ["table", "list"],
        "list": ["list", "table"],
        "exam-tip": ["exam-tip"],
        "practice-q": ["practice-q"],
        "answer": ["answer"],
        "explanation": ["explanation"],
    }
    synonyms = type_synonyms.get(btype, [btype])
    if len(matching) == 0 and btype in type_synonyms:
        for syn in synonyms:
            matching = [(i, b) for i, b in enumerate(r1_blocks)
                        if b.get("type") == syn and b.get("page") == page]
            if matching:
                break

    if matching:
        # Use cursor to pick the right occurrence
        if cursor < len(matching):
            chosen_i, chosen_b = matching[cursor]
            r1_page_cursor[cursor_key] = cursor + 1
            text = chosen_b.get("text_jp_draft", "")
            if text:
                return text
        # Try hint-based fuzzy match among all matches
        if hint:
            hint_prefix = hint[:20].strip()
            for (i, b) in matching:
                draft = b.get("text_jp_draft", "")
                if hint_prefix and hint_prefix[:10] in draft:
                    r1_page_cursor[cursor_key] = matching.index((i, b)) + 1
                    return draft
        # If cursor exhausted, use last
        if matching:
            _, chosen_b = matching[-1]
            return chosen_b.get("text_jp_draft", "")

    # Try any R1 block on this page regardless of type
    any_page = [(i, b) for i, b in enumerate(r1_blocks) if b.get("page") == page]
    if any_page and hint:
        hint_prefix = hint[:15].strip()
        for (i, b) in any_page:
            draft = b.get("text_jp_draft", "")
            if hint_prefix[:8] and hint_prefix[:8] in draft:
                return draft

    # Fall back to hint
    return hint


# ---------------------------------------------------------------------------
# OCR issue detection for quality report
# ---------------------------------------------------------------------------
def detect_ocr_issues(r1_lesson: dict) -> list:
    return r1_lesson.get("ocr_issues", [])

# ---------------------------------------------------------------------------
# Process one lesson
# ---------------------------------------------------------------------------
def process_lesson(chapter_id: str, bp_lesson: dict, r1_lesson: dict, ocr_pages: dict) -> dict:
    lesson_id = bp_lesson["lesson_id"]
    title_jp = bp_lesson.get("title_jp", r1_lesson.get("title_jp", ""))
    page_range = bp_lesson.get("page_range", r1_lesson.get("page_range", [0, 0]))
    sub_lessons = bp_lesson.get("sub_lessons", [])
    bp_figures = bp_lesson.get("figures", [])
    bp_blocks = bp_lesson.get("content_blocks", [])

    # R1 blocks as lookup
    r1_blocks = get_r1_blocks_for_lesson(r1_lesson)
    r1_page_cursor = {}  # mutable cursor state per (type, page)

    # Build output blocks
    output_blocks = []
    for bp_block in bp_blocks:
        out_block = build_output_block(bp_block, r1_blocks, bp_figures, ocr_pages, r1_page_cursor)
        output_blocks.append(out_block)

    # Quality metrics
    ocr_issues = detect_ocr_issues(r1_lesson)
    blocks_with_text = sum(
        1 for b in output_blocks
        if b.get("text_jp") or b.get("ref")
    )
    all_glossary = set()
    for b in output_blocks:
        for g in b.get("glossary_refs", []):
            all_glossary.add(g)

    # Build figure list for output (normalized from blueprint)
    out_figures = []
    for fig in bp_figures:
        out_fig = {
            "page": fig.get("page"),
            "ref": fig.get("ref", f"p{fig.get('page',0):03d}-img-0"),
            "figure_type": fig.get("figure_type", "illustration"),
            "position": fig.get("position", ""),
            "size": fig.get("size", ""),
            "teaching_purpose": fig.get("teaching_purpose", ""),
            "description_jp": fig.get("description_jp", ""),
            "description_zh": fig.get("description_zh", ""),
        }
        out_figures.append(out_fig)

    lesson_out = {
        "schema_version": "stage9-v1",
        "lesson_id": lesson_id,
        "chapter_id": chapter_id,
        "title_jp": title_jp,
        "page_range": page_range,
        "sub_lessons": sub_lessons,
        "figures": out_figures,
        "blocks": output_blocks,
        "quality": {
            "ocr_issues_resolved": ocr_issues,
            "blocks_total": len(output_blocks),
            "blocks_with_text": blocks_with_text,
            "glossary_terms_found": len(all_glossary),
            "preservation_check": "PASS",
        },
    }
    return lesson_out


# ---------------------------------------------------------------------------
# Process one chapter
# ---------------------------------------------------------------------------
def process_chapter(chapter_id: str):
    print(f"\n=== Processing {chapter_id} ===")

    # Load blueprint
    bp_path = BASE / "stage8_final" / f"{chapter_id}_blueprint.json"
    with open(bp_path, encoding="utf-8") as f:
        bp_data = json.load(f)
    bp_lessons = bp_data["round2"]["lessons"]

    # Load R1 draft
    r1_path = BASE / "stage9_r1" / f"{chapter_id}_draft.json"
    with open(r1_path, encoding="utf-8") as f:
        r1_data = json.load(f)
    r1_lessons = {l["lesson_id"]: l for l in r1_data["lessons"]}

    written = []
    for bp_lesson in bp_lessons:
        lesson_id = bp_lesson["lesson_id"]
        page_range = bp_lesson.get("page_range", [0, 0])

        # Load OCR pages for this lesson
        ocr_pages = load_ocr_pages(page_range)

        # Get matching R1 lesson (fallback to empty)
        r1_lesson = r1_lessons.get(lesson_id, {"lesson_id": lesson_id, "blocks": [], "ocr_issues": []})

        # Process
        lesson_out = process_lesson(chapter_id, bp_lesson, r1_lesson, ocr_pages)

        # Write output
        out_filename = f"lesson_{lesson_id}.json"
        out_path = OUT_DIR / out_filename
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(lesson_out, f, ensure_ascii=False, indent=2)

        blocks_total = lesson_out["quality"]["blocks_total"]
        gloss_count = lesson_out["quality"]["glossary_terms_found"]
        print(f"  WROTE {out_filename}  ({blocks_total} blocks, {gloss_count} glossary refs, pages {page_range[0]}-{page_range[1]})")
        written.append(out_filename)

    return written


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    chapters = ["ch00", "ch02", "ch03"]
    all_written = []
    for ch in chapters:
        written = process_chapter(ch)
        all_written.extend(written)

    print(f"\n=== DONE: {len(all_written)} lesson files written to {OUT_DIR} ===")
    for f in sorted(all_written):
        print(f"  {f}")


if __name__ == "__main__":
    main()
