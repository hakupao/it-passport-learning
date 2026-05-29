#!/usr/bin/env python3
"""Phase 1: Build question-to-page mapping using Tesseract OCR.

For each exam's page images, runs Tesseract to find 問N patterns,
producing a mapping JSON per exam under data/ip/exams/mappings/.
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed

PAGES_DIR = Path("data/ip/exams/pages")
MAPPING_DIR = Path("data/ip/exams/mappings")


def ocr_page(page_path: str) -> str:
    result = subprocess.run(
        ["tesseract", page_path, "stdout", "-l", "jpn", "--psm", "6"],
        capture_output=True, text=True, timeout=30
    )
    return result.stdout


def find_questions_on_page(text: str) -> list[int]:
    matches = re.findall(r'[問間]\s*(\d{1,3})\b', text)
    seen = set()
    result = []
    for m in matches:
        n = int(m)
        if 1 <= n <= 100 and n not in seen:
            seen.add(n)
            result.append(n)
    return sorted(result)


def process_page(args):
    exam_id, page_file, pages_dir = args
    page_path = os.path.join(pages_dir, page_file)
    page_num = int(re.search(r'\d+', page_file).group())

    text = ocr_page(page_path)
    questions = find_questions_on_page(text)

    return {
        "page": page_file,
        "page_number": page_num,
        "questions_detected": questions
    }


def process_exam(exam_id: str):
    mapping_file = MAPPING_DIR / f"{exam_id}_pages.json"

    if mapping_file.exists():
        print(f"  [skip] {exam_id}")
        return json.loads(mapping_file.read_text())

    pages_dir = PAGES_DIR / exam_id
    page_files = sorted(
        [f for f in os.listdir(pages_dir) if f.endswith(".png")],
        key=lambda f: int(re.search(r'\d+', f).group())
    )

    print(f"\n[{exam_id}] {len(page_files)} pages")

    tasks = [(exam_id, pf, str(pages_dir)) for pf in page_files]

    with ProcessPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(process_page, t): t for t in tasks}
        page_results = []
        for future in as_completed(futures):
            page_results.append(future.result())

    page_results.sort(key=lambda r: r["page_number"])

    # Build question → page mapping with sliding window filter
    # Reject false positives: question numbers that jump too far from expected
    MAX_JUMP = 5  # max questions per page

    q_to_page = {}
    expected_next = 1
    for pr in page_results:
        page_qs = sorted(pr["questions_detected"])
        accepted = [q for q in page_qs if expected_next - 2 <= q <= expected_next + MAX_JUMP]
        if not accepted and page_qs:
            # No candidates in window — check if all are ahead (skip page) or behind (ignore)
            closest = min(page_qs, key=lambda q: abs(q - expected_next))
            if abs(closest - expected_next) <= MAX_JUMP + 2:
                accepted = [closest]
        for q in accepted:
            if q not in q_to_page:
                q_to_page[q] = pr["page_number"]
        if accepted:
            expected_next = max(accepted) + 1

    # Fill gaps via linear interpolation between confirmed anchors
    all_detected = sorted(q_to_page.keys())
    missing = [q for q in range(1, 101) if q not in q_to_page]

    for mq in missing:
        before = [q for q in all_detected if q < mq]
        after = [q for q in all_detected if q > mq]

        if before and after:
            bq, aq = before[-1], after[0]
            bp, ap = q_to_page[bq], q_to_page[aq]
            frac = (mq - bq) / (aq - bq)
            q_to_page[mq] = round(bp + frac * (ap - bp))
        elif before:
            q_to_page[mq] = q_to_page[before[-1]]
        elif after:
            q_to_page[mq] = q_to_page[after[0]]

    mapping = {
        "exam_id": exam_id,
        "total_pages": len(page_files),
        "detected_questions": len(all_detected),
        "interpolated_questions": len(missing),
        "question_pages": {str(q): q_to_page[q] for q in sorted(q_to_page.keys())},
        "page_details": page_results
    }

    mapping_file.write_text(json.dumps(mapping, ensure_ascii=False, indent=2) + "\n")
    print(f"  [saved] {exam_id}: {len(all_detected)} detected, {len(missing)} interpolated")
    return mapping


def main():
    MAPPING_DIR.mkdir(parents=True, exist_ok=True)

    exam_dirs = sorted([
        d for d in os.listdir(PAGES_DIR)
        if not d.startswith(".") and (PAGES_DIR / d).is_dir()
    ])

    target = sys.argv[1] if len(sys.argv) > 1 else None
    exams = [target] if target else exam_dirs

    print(f"=== Page Mapping via Tesseract OCR ===")
    print(f"Exams: {len(exams)} | Pages dir: {PAGES_DIR}\n")

    total_detected = 0
    total_missing = 0

    for exam_id in exams:
        if exam_id not in exam_dirs:
            print(f"  [error] {exam_id} not found")
            continue
        m = process_exam(exam_id)
        total_detected += m["detected_questions"]
        total_missing += m["interpolated_questions"]

    print(f"\n=== Done ===")
    print(f"Detected: {total_detected} | Interpolated: {total_missing}")
    print(f"Total: {total_detected + total_missing} questions mapped")


if __name__ == "__main__":
    main()
