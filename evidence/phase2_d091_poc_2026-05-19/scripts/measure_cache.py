#!/usr/bin/env python3
"""
Phase 2 D-091 γ heavy PoC: measure real cache hit rate + latency + cost.

Path: `claude --print --output-format json` (Claude Code CLI v2.1.144)
  - D-069 OAuth via macOS Keychain → max-plan 20× → $0 user-billed
  - Full usage metadata exposed in JSON output
  - Architecture caveat: wraps in Claude Code agent loop (adds ~56K
    system+tools overhead per call); not architecturally identical to
    D-087 Vercel AI SDK raw direct path. Documented in measurements.md §6.

Inputs (per D-085 §2.4 mode-dependent scope):
  Q1 question  : page_087 legal explain (不正アクセス禁止法)
  Q2 term      : glossary g_009 3Dプリンター term hover
  Q3 chapter   : strategy chapter pages 175-179 (5 pages, ~60K input vs full
                 98-page chapter to keep PoC wall budget reasonable)
  Q5 kana edge : page_181 レコメンデーション (D-012 signature kana_helper)

Per query: 2 rounds (round 1 = expected cache write, round 2 = expected
cache read), 10s sleep between rounds. All within Claude Code's default
ephemeral_1h cache window.

Outputs:
  measurements.json      : structured 8-call summary
  raw/<Q>_round<N>.json  : raw CLI JSON output per call
  raw/<Q>_input.txt      : input prompt per query for reproducibility
"""
from __future__ import annotations

import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# ----- Paths --------------------------------------------------------------
ROOT = Path(__file__).resolve().parents[3]
CORPUS = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/output"
OUT_DIR = ROOT / "evidence/phase2_d091_poc_2026-05-19"
RAW_DIR = OUT_DIR / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# ----- Constants ----------------------------------------------------------
MODEL = "claude-opus-4-7"
ROUNDS = [1, 2]
SLEEP_BETWEEN_ROUNDS_S = 10
PER_CALL_TIMEOUT_S = 600  # 10 min hard timeout per call
SHADOW_HARD_CAP_USD = 25.0  # L10 lock

# ----- System prompt (D-088 §2.3 cache 区块 part 1) ------------------------
SYSTEM = """你是 IT パスポート（ITパスポート / IT 通过考试 / Information Technology Passport Examination）三语学习助手。

任务: 帮助非母语技术学习者跨越日语片假名识读关，用中文为主回答，必要时附 JP / EN 原文 + 罗马音。

规则:
- 中文为主，必要时附 JP 原文 + reading（罗马音）+ EN 译
- 学习者视角：清楚解释概念，不只是给定义
- 片假名词必附 reading（kana_helper 模式）
- 不编造原文没有的内容
- 引用原文页码 / entity id 时，标明来源（如「per glossary g_009」「per page_087」）
"""

# ----- Build prefix (system + glossary; D-088 §2.3 锁的 cache 区块) ---------
glossary_text = (CORPUS / "glossary.json").read_text(encoding="utf-8")
PREFIX = f"""{SYSTEM}

=== GLOSSARY (D-088 §2.3 cache 区块；~98K tokens per D-089 measurement.md §2) ===
{glossary_text}
=== END GLOSSARY ===
"""

# ----- Per-query scope content (uncached variable) -------------------------
page_087 = (CORPUS / "pages/page_087.json").read_text(encoding="utf-8")
page_181 = (CORPUS / "pages/page_181.json").read_text(encoding="utf-8")
chapter_pages: list[str] = []
for i in range(175, 180):  # 5 pages (175-179) to keep PoC manageable
    fp = CORPUS / f"pages/page_{i:03d}.json"
    if fp.exists():
        chapter_pages.append(f"--- page_{i:03d} ---\n{fp.read_text(encoding='utf-8')}")
chapter_blob = "\n\n".join(chapter_pages)

QUERIES: dict[str, dict[str, str]] = {
    "Q1_question_p087": {
        "scope": "question",
        "scope_content": f"=== PAGE 087 (D-085 §2.4 Quiz Explain scope) ===\n{page_087}\n=== END PAGE ===\n",
        "user_q": "请详细解释 page_087 entities 上关于「不正アクセス禁止法」(Act on the Prohibition of Unauthorized Computer Access) 的题目，包括：(1) 法律定义 (2) 所有 4 个选项的逐条分析 (3) 正确答案的理由 (4) 错误选项的反例。中文为主，附 JP 关键术语 + reading。",
    },
    "Q2_term_g009_3dprinter": {
        "scope": "term",
        "scope_content": "(此 query 为 term hover，仅用 glossary 数据，不附 page 内容)",
        "user_q": "请基于 glossary 中 g_009 (3Dプリンター / 3D printer) 给我一个 hover tooltip：(1) 中文 1-2 句话定义 (2) JP 原文 + reading (3) EN 原文 (4) 一个真实使用场景。控制在 80 字内。",
    },
    "Q3_chapter_strategy_p175_184": {
        "scope": "chapter",
        "scope_content": f"=== CHAPTER pages 175-179 (5 pages，D-085 §2.4 Study chapter scope；为 PoC 时间 budget 限取 5 页代替完整 98 页 chapter) ===\n{chapter_blob}\n=== END CHAPTER ===\n",
        "user_q": "请总结上述 5 页 strategy 章节的核心内容：5 个 bullets，每个 bullet 附 1 个 JP 关键术语 + reading + 中文释义。",
    },
    "Q5_kana_edge_p181": {
        "scope": "kana_edge",
        "scope_content": f"=== PAGE 181 (D-085 §2.4 Study term hover + D-012 signature kana_helper case) ===\n{page_181}\n=== END PAGE ===\n",
        "user_q": "请解释 page_181 中的「レコメンデーション」(recommendation)：(1) 长音 ー 的处理规则 (2) 来源词 recommendation 的拆解 (3) 中文译 + EN 原文 (4) 一个记忆法（mnemonic）方便非母语学习者记住。",
    },
}


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def run_one_call(q_id: str, q: dict[str, str], round_n: int) -> dict:
    """Execute one claude --print call, capture metadata."""
    full_input = (
        f"{PREFIX}\n"
        f"{q['scope_content']}\n\n"
        f"=== USER QUERY ===\n{q['user_q']}\n"
    )

    if round_n == 1:
        (RAW_DIR / f"{q_id}_input.txt").write_text(full_input, encoding="utf-8")

    print(f"[{q_id}] Round {round_n} start at {now_iso()} | input ~{len(full_input):,} chars", flush=True)
    start_ts = time.time()
    try:
        proc = subprocess.run(
            [
                "claude",
                "--print",
                "--model", MODEL,
                "--output-format", "json",
                "--max-budget-usd", "10",
            ],
            input=full_input,
            capture_output=True,
            text=True,
            timeout=PER_CALL_TIMEOUT_S,
        )
    except subprocess.TimeoutExpired:
        wall_s = time.time() - start_ts
        print(f"  TIMEOUT after {wall_s:.1f}s", flush=True)
        return {
            "query": q_id, "round": round_n, "status": "timeout",
            "wall_s": round(wall_s, 2), "started_at": now_iso(),
        }

    wall_s = time.time() - start_ts

    if proc.returncode != 0:
        print(f"  FAIL rc={proc.returncode} stderr={proc.stderr[:300]}", flush=True)
        return {
            "query": q_id, "round": round_n, "status": "fail",
            "wall_s": round(wall_s, 2),
            "stderr": proc.stderr[:1000],
            "returncode": proc.returncode,
        }

    (RAW_DIR / f"{q_id}_round{round_n}.json").write_text(proc.stdout, encoding="utf-8")

    try:
        data = json.loads(proc.stdout)
    except Exception as e:
        print(f"  JSON parse fail: {e}", flush=True)
        return {
            "query": q_id, "round": round_n, "status": "parse_fail",
            "wall_s": round(wall_s, 2),
            "raw_head": proc.stdout[:500],
            "parse_error": str(e),
        }

    usage = data.get("usage", {}) or {}
    cache_create = usage.get("cache_creation_input_tokens", 0)
    cache_read = usage.get("cache_read_input_tokens", 0)
    input_t = usage.get("input_tokens", 0)
    output_t = usage.get("output_tokens", 0)
    total_input = cache_create + cache_read + input_t
    cache_hit_rate = (cache_read / total_input) if total_input > 0 else 0.0

    record = {
        "query": q_id,
        "round": round_n,
        "status": "ok",
        "wall_s": round(wall_s, 2),
        "duration_ms": data.get("duration_ms"),
        "duration_api_ms": data.get("duration_api_ms"),
        "ttft_ms": data.get("ttft_ms"),
        "total_cost_usd": data.get("total_cost_usd"),
        "stop_reason": data.get("stop_reason"),
        "num_turns": data.get("num_turns"),
        "result_chars": len(data.get("result") or ""),
        "usage": {
            "input_tokens": input_t,
            "output_tokens": output_t,
            "cache_creation_input_tokens": cache_create,
            "cache_read_input_tokens": cache_read,
            "total_input_tokens": total_input,
            "cache_hit_rate": round(cache_hit_rate, 4),
        },
    }
    print(
        f"  OK wall={record['wall_s']}s ttft={record['ttft_ms']}ms "
        f"cost=${record['total_cost_usd']} "
        f"in={input_t} cache_w={cache_create} cache_r={cache_read} out={output_t} "
        f"hit_rate={cache_hit_rate*100:.1f}%",
        flush=True,
    )
    return record


def main() -> int:
    started_at = now_iso()
    print(f"=== Phase 2 D-091 γ PoC start at {started_at} ===", flush=True)
    print(f"Model: {MODEL}", flush=True)
    print(f"Queries: {list(QUERIES.keys())}", flush=True)
    print(f"Prefix size: {len(PREFIX):,} chars (system + glossary)", flush=True)
    print(f"Shadow cap: ${SHADOW_HARD_CAP_USD}", flush=True)
    print("---", flush=True)

    results: list[dict] = []
    cumulative_cost = 0.0

    for q_id, q in QUERIES.items():
        for round_n in ROUNDS:
            record = run_one_call(q_id, q, round_n)
            results.append(record)

            cost = record.get("total_cost_usd") or 0
            cumulative_cost += cost
            if cumulative_cost > SHADOW_HARD_CAP_USD:
                print(f"!! SHADOW CAP HIT (${cumulative_cost:.2f} > ${SHADOW_HARD_CAP_USD}). Aborting.", flush=True)
                # Save what we have and exit
                _save(results, started_at, aborted=True, cumulative_cost=cumulative_cost)
                return 2

            if round_n == 1 and record.get("status") == "ok":
                print(f"  sleep {SLEEP_BETWEEN_ROUNDS_S}s (test cache window)...", flush=True)
                time.sleep(SLEEP_BETWEEN_ROUNDS_S)

    _save(results, started_at, aborted=False, cumulative_cost=cumulative_cost)
    print(f"=== Done. {len(results)} calls. Cumulative shadow cost: ${cumulative_cost:.4f} ===", flush=True)
    return 0


def _save(results: list[dict], started_at: str, aborted: bool, cumulative_cost: float) -> None:
    summary = {
        "poc_id": "phase2_d091_poc_2026-05-19",
        "model": MODEL,
        "path": "claude --print --output-format json (D-069 OAuth via Keychain, max-plan $0 billed)",
        "architecture_caveat": "wraps Claude Code agent loop (~56K system+tools overhead per call); not architecturally identical to D-087 Vercel AI SDK direct path",
        "started_at": started_at,
        "finished_at": now_iso(),
        "aborted": aborted,
        "cumulative_shadow_cost_usd": round(cumulative_cost, 4),
        "shadow_hard_cap_usd": SHADOW_HARD_CAP_USD,
        "queries_planned": list(QUERIES.keys()),
        "rounds_per_query": ROUNDS,
        "sleep_between_rounds_s": SLEEP_BETWEEN_ROUNDS_S,
        "prefix_chars": len(PREFIX),
        "calls": results,
    }
    (OUT_DIR / "measurements.json").write_text(
        json.dumps(summary, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    sys.exit(main())
