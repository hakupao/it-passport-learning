#!/usr/bin/env python3
"""
D-089 β light PoC — v1.0.3 corpus measurement.

Measures:
  1. Per-file size distribution (bytes + chars)
  2. Per-scope token estimation (tiktoken cl100k_base as Anthropic proxy)
  3. FS parse latency (cold-ish + warm) for whole-book load
  4. Per-scope excerpt assembly characteristics

Output:
  - measurement.json (raw)
  - measurement.md (human-readable; rendered separately by orchestrator)

Run:
  python3 evidence/phase2_d089_poc_2026-05-19/measure_corpus.py

$0 LLM cost (no API calls). Deterministic. Re-runnable.
"""
from __future__ import annotations

import json
import statistics
import time
from pathlib import Path
from typing import Any

import tiktoken

ROOT = Path(__file__).resolve().parents[2]
CORPUS = ROOT / "data" / "itpassport_r6" / "runs" / "dry_run_2026-05-12T13-23-19" / "output"
PAGES = CORPUS / "pages"

# tiktoken cl100k_base is GPT-4 tokenizer; Anthropic tokenizer is similar but not identical.
# Used here as a proxy for Anthropic token counts; calibration note included in output.
ENC = tiktoken.get_encoding("cl100k_base")


def count_tokens(text: str) -> int:
    return len(ENC.encode(text))


def file_stats(path: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    return {
        "path": str(path.relative_to(ROOT)),
        "bytes": path.stat().st_size,
        "chars": len(text),
        "tokens_cl100k": count_tokens(text),
    }


def measure_fs_latency(paths: list[Path], n_reads: int = 3) -> dict[str, Any]:
    """Measure cold-ish + warm FS read latency for a list of paths.
    Cold-ish = first iteration after best-effort OS cache flush attempt (not enforced — just first read in the process).
    Warm = subsequent reads with OS page cache likely populated.
    """
    timings: list[float] = []
    for i in range(n_reads):
        t0 = time.perf_counter()
        for p in paths:
            p.read_bytes()
        t1 = time.perf_counter()
        timings.append((t1 - t0) * 1000)  # ms
    return {
        "n_files": len(paths),
        "n_iterations": n_reads,
        "ms_per_iter": [round(t, 2) for t in timings],
        "ms_first": round(timings[0], 2),
        "ms_warm_mean": round(statistics.mean(timings[1:]), 2) if len(timings) > 1 else None,
    }


def measure_parse_latency(paths: list[Path], n_reads: int = 3) -> dict[str, Any]:
    """Measure FS read + json.loads latency."""
    timings: list[float] = []
    for _ in range(n_reads):
        t0 = time.perf_counter()
        for p in paths:
            json.loads(p.read_text(encoding="utf-8"))
        t1 = time.perf_counter()
        timings.append((t1 - t0) * 1000)
    return {
        "n_files": len(paths),
        "n_iterations": n_reads,
        "ms_per_iter": [round(t, 2) for t in timings],
        "ms_first": round(timings[0], 2),
        "ms_warm_mean": round(statistics.mean(timings[1:]), 2) if len(timings) > 1 else None,
    }


def main() -> None:
    out_dir = Path(__file__).resolve().parent
    result: dict[str, Any] = {
        "corpus_root": str(CORPUS.relative_to(ROOT)),
        "tokenizer_note": "tiktoken cl100k_base (GPT-4 BPE); Anthropic uses similar BPE-based encoding. Token counts here are proxy estimates; expect ±10-15% vs anthropic.count_tokens(). Calibration is left to D-088 §2.3 cache write measurement at Phase 2 实施 time.",
        "scopes": {},
        "page_distribution": {},
        "fs_latency": {},
        "parse_latency": {},
    }

    # ---- 1. Root-level files ----
    root_files = {
        "index.json": CORPUS / "index.json",
        "glossary.json": CORPUS / "glossary.json",
        "polish_items.json": CORPUS / "polish_items.json",
        "README.md": CORPUS / "README.md",
    }
    result["root_files"] = {name: file_stats(p) for name, p in root_files.items()}

    # ---- 2. Per-page (json + md) ----
    page_json_files = sorted(p for p in PAGES.glob("page_*.json") if not p.name.endswith(".bak"))
    page_md_files = sorted(PAGES.glob("page_*.md"))

    page_json_stats = [file_stats(p) for p in page_json_files]
    page_md_stats = [file_stats(p) for p in page_md_files]

    def aggregate(stats: list[dict[str, Any]]) -> dict[str, Any]:
        if not stats:
            return {"n": 0}
        token_list = [s["tokens_cl100k"] for s in stats]
        byte_list = [s["bytes"] for s in stats]
        return {
            "n": len(stats),
            "total_bytes": sum(byte_list),
            "total_tokens": sum(token_list),
            "tokens_min": min(token_list),
            "tokens_max": max(token_list),
            "tokens_median": int(statistics.median(token_list)),
            "tokens_mean": int(statistics.mean(token_list)),
            "tokens_stdev": int(statistics.stdev(token_list)) if len(token_list) > 1 else 0,
            "bytes_total_mb": round(sum(byte_list) / (1024 * 1024), 2),
        }

    result["page_distribution"]["json"] = aggregate(page_json_stats)
    result["page_distribution"]["md"] = aggregate(page_md_stats)

    # ---- 3. Per-scope token estimates ----
    # 3a. Whole-book (all JSON, all MD)
    all_json_text = "\n".join(p.read_text(encoding="utf-8") for p in page_json_files)
    all_md_text = "\n".join(p.read_text(encoding="utf-8") for p in page_md_files)
    glossary_text = (CORPUS / "glossary.json").read_text(encoding="utf-8")
    index_text = (CORPUS / "index.json").read_text(encoding="utf-8")

    result["scopes"]["whole_book_json"] = {
        "n_pages": len(page_json_files),
        "chars": len(all_json_text),
        "tokens_cl100k": count_tokens(all_json_text),
        "bytes_concat_approx": sum(p.stat().st_size for p in page_json_files),
    }
    result["scopes"]["whole_book_md"] = {
        "n_pages": len(page_md_files),
        "chars": len(all_md_text),
        "tokens_cl100k": count_tokens(all_md_text),
        "bytes_concat_approx": sum(p.stat().st_size for p in page_md_files),
    }
    result["scopes"]["glossary_only"] = {
        "chars": len(glossary_text),
        "tokens_cl100k": count_tokens(glossary_text),
    }
    result["scopes"]["index_only"] = {
        "chars": len(index_text),
        "tokens_cl100k": count_tokens(index_text),
    }

    # 3b. Single chapter (heuristic: pages 87-184 = first content cluster from STATE memory hot path)
    chapter_pages = [p for p in page_json_files if 87 <= int(p.stem.split("_")[1]) <= 184]
    chapter_text = "\n".join(p.read_text(encoding="utf-8") for p in chapter_pages)
    result["scopes"]["chapter_sample_p087_p184_json"] = {
        "n_pages": len(chapter_pages),
        "chars": len(chapter_text),
        "tokens_cl100k": count_tokens(chapter_text),
    }

    # 3c. Single page sample (page_087)
    p087_json = PAGES / "page_087.json"
    p087_md = PAGES / "page_087.md"
    if p087_json.exists():
        p087_data = json.loads(p087_json.read_text(encoding="utf-8"))
        result["scopes"]["page_087_json"] = file_stats(p087_json)
        result["scopes"]["page_087_md"] = file_stats(p087_md)
        # Single entity-level (question) sample
        entities = p087_data.get("entities", [])
        if entities:
            ent_text = json.dumps(entities[0], ensure_ascii=False)
            result["scopes"]["page_087_entity_0_json"] = {
                "chars": len(ent_text),
                "tokens_cl100k": count_tokens(ent_text),
                "entity_type": entities[0].get("type"),
            }

    # 3d. Single glossary term sample
    glossary_data = json.loads(glossary_text)
    if isinstance(glossary_data, list) and glossary_data:
        term_text = json.dumps(glossary_data[0], ensure_ascii=False)
        result["scopes"]["glossary_term_0_json"] = {
            "chars": len(term_text),
            "tokens_cl100k": count_tokens(term_text),
        }
    elif isinstance(glossary_data, dict):
        glossary_entries = glossary_data.get("entries") or list(glossary_data.values())[0] if glossary_data else []
        if isinstance(glossary_entries, list) and glossary_entries:
            term_text = json.dumps(glossary_entries[0], ensure_ascii=False)
            result["scopes"]["glossary_term_0_json"] = {
                "chars": len(term_text),
                "tokens_cl100k": count_tokens(term_text),
            }
        elif isinstance(glossary_entries, dict):
            first_key = next(iter(glossary_entries))
            term_text = json.dumps(glossary_entries[first_key], ensure_ascii=False)
            result["scopes"]["glossary_term_0_json"] = {
                "chars": len(term_text),
                "tokens_cl100k": count_tokens(term_text),
                "sample_key": first_key,
            }

    # ---- 4. FS latency ----
    result["fs_latency"]["whole_book_json_read"] = measure_fs_latency(page_json_files, n_reads=3)
    result["fs_latency"]["whole_book_md_read"] = measure_fs_latency(page_md_files, n_reads=3)
    result["fs_latency"]["root_files_read"] = measure_fs_latency(list(root_files.values()), n_reads=3)
    result["fs_latency"]["chapter_sample_read"] = measure_fs_latency(chapter_pages, n_reads=3)

    # ---- 5. Parse latency (JSON only — MD doesn't need parsing) ----
    result["parse_latency"]["whole_book_json_parse"] = measure_parse_latency(page_json_files, n_reads=3)
    result["parse_latency"]["glossary_parse"] = measure_parse_latency([CORPUS / "glossary.json"], n_reads=3)
    result["parse_latency"]["index_parse"] = measure_parse_latency([CORPUS / "index.json"], n_reads=3)
    result["parse_latency"]["chapter_sample_parse"] = measure_parse_latency(chapter_pages, n_reads=3)

    # ---- 6. Token-to-cost projection (D-088 + cost_table.md cross-reference) ----
    wb_json_tokens = result["scopes"]["whole_book_json"]["tokens_cl100k"]
    wb_md_tokens = result["scopes"]["whole_book_md"]["tokens_cl100k"]
    glossary_tokens = result["scopes"]["glossary_only"]["tokens_cl100k"]
    system_prompt_estimate = 500  # D-088 §2.3 estimate
    cache_block_tokens = system_prompt_estimate + glossary_tokens
    opus_4_7_input_per_1m = 15.00
    opus_4_7_cache_read_per_1m = 1.50
    opus_4_7_cache_write_per_1m = 18.75

    result["d088_cache_projection"] = {
        "system_prompt_tokens_estimate": system_prompt_estimate,
        "glossary_tokens": glossary_tokens,
        "cache_block_total_tokens": cache_block_tokens,
        "cache_write_cost_usd_opus_4_7": round(cache_block_tokens / 1_000_000 * opus_4_7_cache_write_per_1m, 4),
        "cache_read_cost_usd_per_subsequent_call_opus_4_7": round(cache_block_tokens / 1_000_000 * opus_4_7_cache_read_per_1m, 4),
        "uncached_cost_usd_per_call_opus_4_7": round(cache_block_tokens / 1_000_000 * opus_4_7_input_per_1m, 4),
    }
    result["whole_book_in_ctx_check"] = {
        "wb_json_tokens": wb_json_tokens,
        "wb_md_tokens": wb_md_tokens,
        "opus_4_7_ctx_limit_1m": 1_000_000,
        "wb_json_fits": wb_json_tokens < 1_000_000,
        "wb_md_fits": wb_md_tokens < 1_000_000,
        "wb_json_pct_of_ctx": round(wb_json_tokens / 1_000_000 * 100, 1),
        "wb_md_pct_of_ctx": round(wb_md_tokens / 1_000_000 * 100, 1),
    }

    # ---- Write outputs ----
    out_json = out_dir / "measurement.json"
    out_json.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"WROTE {out_json.relative_to(ROOT)}")

    # Inline summary print
    print("\n=== D-089 β LIGHT PoC SUMMARY ===")
    print(f"Whole-book JSON: {wb_json_tokens:,} tokens ({result['scopes']['whole_book_json']['bytes_concat_approx'] / 1024 / 1024:.2f} MB)")
    print(f"Whole-book MD:   {wb_md_tokens:,} tokens ({result['scopes']['whole_book_md']['bytes_concat_approx'] / 1024 / 1024:.2f} MB)")
    print(f"Glossary:        {glossary_tokens:,} tokens")
    print(f"Cache block (sys+gloss): {cache_block_tokens:,} tokens")
    print(f"Cache write cost (Opus 4.7): ${result['d088_cache_projection']['cache_write_cost_usd_opus_4_7']:.4f}")
    print(f"Cache read cost  (Opus 4.7): ${result['d088_cache_projection']['cache_read_cost_usd_per_subsequent_call_opus_4_7']:.4f}/call")
    print(f"WB-JSON fits 1M ctx: {result['whole_book_in_ctx_check']['wb_json_fits']} ({result['whole_book_in_ctx_check']['wb_json_pct_of_ctx']}%)")
    print(f"WB-MD   fits 1M ctx: {result['whole_book_in_ctx_check']['wb_md_fits']} ({result['whole_book_in_ctx_check']['wb_md_pct_of_ctx']}%)")
    print(f"\nFS latency (whole-book JSON, 554 files):")
    fs = result["fs_latency"]["whole_book_json_read"]
    print(f"  per-iter ms: {fs['ms_per_iter']}  warm-mean: {fs['ms_warm_mean']} ms")
    pl = result["parse_latency"]["whole_book_json_parse"]
    print(f"Parse latency (whole-book JSON): per-iter ms: {pl['ms_per_iter']}  warm-mean: {pl['ms_warm_mean']} ms")


if __name__ == "__main__":
    main()
