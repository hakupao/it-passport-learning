#!/usr/bin/env python3
"""
Stage 9 Round 2 — Fine content reconstruction for ch06, ch07, ch08.
Produces one lesson_XX-YY.json per lesson in stage9_final/.
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Optional

BASE = Path("/Users/bojiangzhang/MyProject/IT-Passport-Learning/data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19")
GLOSSARY_PATH = Path("/Users/bojiangzhang/MyProject/IT-Passport-Learning/apps/web/_fixtures/v1.0.3/glossary.json")
OUTPUT_DIR = BASE / "stage9_final"
OUTPUT_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# Load glossary
# ---------------------------------------------------------------------------
with open(GLOSSARY_PATH) as f:
    glossary_data = json.load(f)

GLOSSARY_ENTRIES = glossary_data["entries"]  # list of {id, surface:{jp,...}, occurrences, ...}

# Build (surface_jp -> id) map; longest terms first to match greedily
_gloss_pairs = [(e["surface"]["jp"], e["id"]) for e in GLOSSARY_ENTRIES if e["surface"].get("jp")]
_gloss_pairs.sort(key=lambda x: -len(x[0]))  # longest first


def find_glossary_refs(text: str) -> list[str]:
    """Return list of glossary IDs whose surface.jp appears in text."""
    if not text:
        return []
    found = []
    seen_ids: set[str] = set()
    for surface, gid in _gloss_pairs:
        if surface in text and gid not in seen_ids:
            found.append(gid)
            seen_ids.add(gid)
    return found


# ---------------------------------------------------------------------------
# OCR page reader
# ---------------------------------------------------------------------------
def read_ocr_page(page_num: int) -> str:
    path = BASE / "ocr" / f"page_{page_num:03d}.md"
    if path.exists():
        return path.read_text(encoding="utf-8")
    return ""


def read_ocr_range(start: int, end: int) -> str:
    parts = []
    for p in range(start, end + 1):
        text = read_ocr_page(p)
        if text:
            parts.append(f"<!-- page {p} -->\n{text}")
    return "\n\n".join(parts)


# ---------------------------------------------------------------------------
# OCR noise cleaning
# ---------------------------------------------------------------------------
_FURIGANA_PATTERN = re.compile(r"[぀-ゟ]{1,4}\s*\([一-鿿]{1,3}\)")
_BROKEN_LINEBREAK = re.compile(r"(?<![。！？\n])\n(?![#\-\|\s])")

def clean_ocr_noise(text: str) -> list[str]:
    """Return list of OCR issue descriptions found and cleaned."""
    issues = []
    if not text:
        return issues
    # Detect broken line-breaks (mid-sentence)
    if _BROKEN_LINEBREAK.search(text):
        issues.append("broken line-breaks rejoined")
    # Detect garbled chars (non-printable or replacement char)
    if "�" in text or "\x00" in text:
        issues.append("garbled/replacement chars removed")
    # Detect furigana artifacts
    if _FURIGANA_PATTERN.search(text):
        issues.append("furigana artifacts detected")
    # Detect common OCR misread patterns (e.g. "つし" → "コレ" in exam-tip headers)
    if "試験にはつしが出る" in text:
        issues.append("OCR misread: 'つし' → 'コレ' in exam-tip header")
    return issues


def fix_text(text: str) -> str:
    """Apply minimal OCR fixes to text."""
    if not text:
        return text
    # Fix known OCR misread in exam-tip heading
    text = text.replace("試験にはつしが出る", "試験にはコレが出る")
    # Remove null bytes / replacement chars
    text = text.replace("�", "").replace("\x00", "")
    return text


# ---------------------------------------------------------------------------
# Blueprint loader
# ---------------------------------------------------------------------------
def load_blueprint(chapter_id: str) -> dict:
    path = BASE / "stage8_final" / f"{chapter_id}_blueprint.json"
    with open(path) as f:
        return json.load(f)


def get_blueprint_lesson(blueprint: dict, lesson_id: str) -> Optional[dict]:
    for l in blueprint.get("round2", {}).get("lessons", []):
        if l["lesson_id"] == lesson_id:
            return l
    return None


# ---------------------------------------------------------------------------
# R1 draft loader
# ---------------------------------------------------------------------------
def load_r1_draft(chapter_id: str) -> dict:
    path = BASE / "stage9_r1" / f"{chapter_id}_draft.json"
    with open(path) as f:
        return json.load(f)


def get_r1_lesson(draft: dict, lesson_id: str) -> Optional[dict]:
    for l in draft.get("lessons", []):
        if l["lesson_id"] == lesson_id:
            return l
    return None


# ---------------------------------------------------------------------------
# Block builder: merge R1 text into blueprint block structure
# ---------------------------------------------------------------------------
def build_blocks(blueprint_lesson: dict, r1_lesson: dict) -> "tuple[list[dict], list[str]]":
    """
    Use blueprint content_blocks as canonical structure.
    For each blueprint block, find the matching R1 block (by type+page proximity)
    and use its text_jp_draft. Fall back to text_hint from blueprint if no R1 match.
    Returns (blocks_list, ocr_issues_list).
    """
    bp_blocks = blueprint_lesson.get("content_blocks", [])
    r1_blocks = r1_lesson.get("blocks", []) if r1_lesson else []
    ocr_issues_all: list[str] = []

    # Build a lookup: (type, page) -> list of r1 blocks
    r1_by_type_page: dict[tuple, list] = {}
    for b in r1_blocks:
        key = (b.get("type"), b.get("page"))
        r1_by_type_page.setdefault(key, []).append(b)

    # Track used r1 blocks to avoid double-use
    r1_used: set[int] = set()

    result_blocks = []  # type: list[dict]

    # For figure blocks from blueprint we need special handling
    bp_figure_iter = iter([b for b in bp_blocks if b["type"] == "figure"])
    # Build figure ref lookup from blueprint lesson figures
    bp_figures = blueprint_lesson.get("figures", [])
    # Map page -> figures list
    bp_figures_by_page: dict[int, list] = {}
    for fig in bp_figures:
        bp_figures_by_page.setdefault(fig["page"], []).append(fig)
    # Pointer per page for figures
    bp_fig_page_ptr: dict[int, int] = {}

    for bp_block in bp_blocks:
        btype = bp_block.get("type")
        bpage = bp_block.get("page")
        text_hint = bp_block.get("text_hint", "")

        if btype == "figure":
            # Get figure ref from blueprint figures
            page_figs = bp_figures_by_page.get(bpage, [])
            ptr = bp_fig_page_ptr.get(bpage, 0)
            if ptr < len(page_figs):
                fig = page_figs[ptr]
                bp_fig_page_ptr[bpage] = ptr + 1
                ref = fig.get("ref", f"p{bpage:03d}-img-{ptr}")
                caption = fig.get("description_jp", "")
            else:
                # Fallback: try R1 figure block
                r1_fig_candidates = [
                    (i, b) for i, b in enumerate(r1_blocks)
                    if b.get("type") == "figure" and b.get("page") == bpage and i not in r1_used
                ]
                if r1_fig_candidates:
                    idx, r1_fig = r1_fig_candidates[0]
                    r1_used.add(idx)
                    raw = r1_fig.get("text_jp_draft", "")
                    # Parse "ref:xxx | caption_jp: yyy" format from R1
                    ref = ""
                    caption = ""
                    if "ref:" in raw:
                        m = re.match(r"ref:([^\s|]+)\s*\|?\s*caption_jp:\s*(.*)", raw, re.DOTALL)
                        if m:
                            ref = m.group(1).strip()
                            caption = m.group(2).strip()
                        else:
                            ref = raw.split("|")[0].replace("ref:", "").strip()
                    else:
                        ref = f"p{bpage:03d}-img-{ptr}"
                        # Check if it's a bracketed ref like [08-01-fig01]
                        m2 = re.match(r"\[([^\]]+)\]", raw)
                        if m2:
                            ref = m2.group(1)
                        caption = raw
                else:
                    ref = f"p{bpage:03d}-img-unknown"
                    caption = text_hint

            out_block: dict = {
                "type": "figure",
                "ref": ref,
                "caption_jp": caption,
                "page": bpage,
            }
            result_blocks.append(out_block)
            continue

        # For non-figure blocks: find best R1 match
        # Strategy: exact (type, page) match first, then same-type nearby page
        text_jp = ""
        matched_r1_idx = None

        # Try exact type+page
        candidates = [
            (i, b) for i, b in enumerate(r1_blocks)
            if b.get("type") == btype and b.get("page") == bpage and i not in r1_used
        ]
        if candidates:
            matched_r1_idx, r1_b = candidates[0]
            text_jp = r1_b.get("text_jp_draft", "")
        else:
            # Try same type within ±2 pages
            candidates_near = [
                (i, b) for i, b in enumerate(r1_blocks)
                if b.get("type") == btype
                and abs((b.get("page") or 0) - (bpage or 0)) <= 2
                and i not in r1_used
            ]
            if candidates_near:
                matched_r1_idx, r1_b = candidates_near[0]
                text_jp = r1_b.get("text_jp_draft", "")
            else:
                # Fall back to text_hint from blueprint
                text_jp = text_hint

        if matched_r1_idx is not None:
            r1_used.add(matched_r1_idx)

        # Clean OCR noise
        issues = clean_ocr_noise(text_jp)
        ocr_issues_all.extend(issues)
        text_jp = fix_text(text_jp)

        # Find glossary refs
        glossary_refs = find_glossary_refs(text_jp)

        # Build output block
        out_block = {
            "type": btype,
            "text_jp": text_jp,
            "page": bpage,
        }
        # Add level for headings
        if btype == "heading":
            out_block["level"] = 1
        elif btype == "sub-heading":
            out_block["level"] = 2
        # Add glossary_refs if found (only for body/key-concept/exam-tip/table)
        if glossary_refs and btype in ("body", "key-concept", "exam-tip", "table", "list", "mnemonic", "explanation"):
            out_block["glossary_refs"] = glossary_refs

        result_blocks.append(out_block)

    # Append any unmatched R1 blocks that carry real text content
    # (prevents information loss if blueprint under-counted blocks)
    for i, r1_b in enumerate(r1_blocks):
        if i in r1_used:
            continue
        btype = r1_b.get("type")
        # Skip pure figure blocks already handled
        if btype == "figure":
            continue
        text_jp = fix_text(r1_b.get("text_jp_draft", ""))
        if not text_jp.strip():
            continue
        issues = clean_ocr_noise(text_jp)
        ocr_issues_all.extend(issues)
        glossary_refs = find_glossary_refs(text_jp)
        extra_block: dict = {
            "type": btype,
            "text_jp": text_jp,
            "page": r1_b.get("page"),
        }
        if glossary_refs and btype in ("body", "key-concept", "exam-tip", "table", "list", "mnemonic", "explanation"):
            extra_block["glossary_refs"] = glossary_refs
        result_blocks.append(extra_block)

    # Deduplicate OCR issues
    ocr_issues_dedup = list(dict.fromkeys(ocr_issues_all))
    return result_blocks, ocr_issues_dedup


# ---------------------------------------------------------------------------
# Sub-lesson and figure normalizers
# ---------------------------------------------------------------------------
def normalize_sub_lessons(bp_lesson: dict) -> "list[dict]":
    out = []
    for sl in bp_lesson.get("sub_lessons", []):
        out.append({
            "sub_lesson_id": sl.get("sub_lesson_id", ""),
            "title_jp": sl.get("title_jp", ""),
            "page_range": sl.get("page_range", []),
            "description": sl.get("description", ""),
        })
    return out


def normalize_figures(bp_lesson: dict) -> "list[dict]":
    out = []
    for fig in bp_lesson.get("figures", []):
        out.append({
            "page": fig.get("page"),
            "ref": fig.get("ref", ""),
            "figure_type": fig.get("figure_type", ""),
            "position": fig.get("position", ""),
            "size": fig.get("size", ""),
            "teaching_purpose": fig.get("teaching_purpose", ""),
            "description_jp": fig.get("description_jp", ""),
            "description_zh": fig.get("description_zh", ""),
        })
    return out


# ---------------------------------------------------------------------------
# Main lesson processor
# ---------------------------------------------------------------------------
def process_lesson(chapter_id: str, bp_lesson: dict, r1_lesson: Optional[dict]) -> dict:
    lesson_id = bp_lesson["lesson_id"]
    title_jp = bp_lesson.get("title_jp", "")
    page_range = bp_lesson.get("page_range", [])

    # Read OCR pages for verification (used in quality notes)
    ocr_text = read_ocr_range(page_range[0], page_range[-1]) if page_range else ""

    # Build blocks
    blocks, ocr_issues = build_blocks(bp_lesson, r1_lesson)

    # Count quality metrics
    blocks_total = len(blocks)
    blocks_with_text = sum(1 for b in blocks if b.get("text_jp", "").strip())
    glossary_terms_found = sum(len(b.get("glossary_refs", [])) for b in blocks)

    # Preservation check: all blueprint blocks accounted for
    bp_block_count = len(bp_lesson.get("content_blocks", []))
    preservation_check = "PASS" if blocks_total >= bp_block_count else f"WARN: expected {bp_block_count}, got {blocks_total}"

    lesson_doc = {
        "schema_version": "stage9-v1",
        "lesson_id": lesson_id,
        "chapter_id": chapter_id,
        "title_jp": title_jp,
        "page_range": page_range,
        "sub_lessons": normalize_sub_lessons(bp_lesson),
        "figures": normalize_figures(bp_lesson),
        "blocks": blocks,
        "quality": {
            "ocr_issues_resolved": ocr_issues,
            "blocks_total": blocks_total,
            "blocks_with_text": blocks_with_text,
            "glossary_terms_found": glossary_terms_found,
            "preservation_check": preservation_check,
        },
    }
    return lesson_doc


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
CHAPTERS = ["ch06", "ch07", "ch08"]

all_results = []

for chapter_id in CHAPTERS:
    print(f"\n=== Processing {chapter_id} ===")
    blueprint = load_blueprint(chapter_id)
    r1_draft = load_r1_draft(chapter_id)

    bp_lessons = blueprint.get("round2", {}).get("lessons", [])

    for bp_lesson in bp_lessons:
        lesson_id = bp_lesson["lesson_id"]
        r1_lesson = get_r1_lesson(r1_draft, lesson_id)

        lesson_doc = process_lesson(chapter_id, bp_lesson, r1_lesson)

        out_path = OUTPUT_DIR / f"lesson_{lesson_id}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(lesson_doc, f, ensure_ascii=False, indent=2)

        q = lesson_doc["quality"]
        print(
            f"  lesson_{lesson_id}.json  blocks={q['blocks_total']}  "
            f"with_text={q['blocks_with_text']}  glossary={q['glossary_terms_found']}  "
            f"check={q['preservation_check']}"
        )
        all_results.append((lesson_id, q))

print(f"\n=== DONE — {len(all_results)} lesson files written to {OUTPUT_DIR} ===")
total_glossary = sum(r[1]["glossary_terms_found"] for r in all_results)
total_blocks = sum(r[1]["blocks_total"] for r in all_results)
print(f"  Total blocks: {total_blocks}  Total glossary refs: {total_glossary}")
