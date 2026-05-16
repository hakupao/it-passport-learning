# Stage 7 Hand-Edit Checklist — Session 21 Q10-A

Run: `dry_run_2026-05-12T13-23-19`
Stage: 7 (export — pre-emit hand-edits to close out Stage 7 Gate A residuals)
Author: Claude Opus 4.7 (writer agent)
Reviewer: user (this checklist + sidecar JSON before transactional apply)
Apply mechanism: `evidence/.../apply_stage7_hand_edits.py` (transactional, all-or-nothing)
Sidecar: `step_06_11_D_7_hand_edits.json` (2 entries)
Total fields touched: **2** (1 en revise on page_292 + 1 int correction on page_445)

Rule A check: not triggered (2 leaves of selective correction).
Rule D status: writer = Claude Opus 4.7; reviewer = user.
Rule B status: no failures to archive (mid-flight detector patches are improvements; hand-edits address real defects + 1 documented detector edge case).

---

## Entry 1 — page_292 entities[1].caption.en (REVISE Session 20 #6 to numeric date format)

**Context**: Session 20 hand-edit #6 changed en from `June 28, Reiwa 2` to `June 28, 2020`, which addressed the Reiwa-romaji era prefix leakage but introduced a NEW D7 FP class: jp/zh `6月28日` extracts numerics `{6, 28}` while en `June 28, 2020` extracts `{28, 2020}` (month spelled out, year as Gregorian digit). Sets are pairwise incomparable (jp has `6` from `6月` that en doesn't; en has `2020` that jp doesn't) → D7 FAIL persisted.

Stage 7 Gate A re-surfaced this on the full 554-page run. The clean fix is to revise the en date format so jp's date numerics become a subset of en's — then D7 falls through to WARN (subset heuristic per Session 10 162aebb) rather than FAIL.

| field | value |
|---|---|
| jp (unchanged, ground truth) | `新販売管理システム運用 サービスレベル合意書（Service Level Agreement） バージョン 2.0 令和2年6月28日 株式会社テクテク` |
| zh (unchanged) | `新销售管理系统运维 服务等级协议（SLA） 版本2.0 令和2年6月28日 株式会社TekuTeku` |
| **en BEFORE** (Session 20 #6) | `New Sales Management System Operations Service Level Agreement (SLA) Version 2.0 June 28, 2020 TekuTeku Co., Ltd.` |
| **en AFTER** (Session 21 revise) | `New Sales Management System Operations Service Level Agreement (SLA) Version 2.0 6/28/2020 TekuTeku Co., Ltd.` |

**D7 numeric check** (post detector patches 114a1af + 2c3c66f + 8c68c2e + this revise):

- jp: strip `令和2年` → `バージョン 2.0 6月28日` → numerics `{2.0, 6, 28}`
- zh: strip `令和2年` → `版本2.0 6月28日` → numerics `{2.0, 6, 28}`
- en: comma + currency + spelled-out strips don't apply → `Version 2.0 6/28/2020` → numerics `{2.0, 6, 28, 2020}`
- jp/zh ⊆ en → subset relation → D7 emits WARN (not FAIL) per heuristic

**Why this fix**:

- en form `6/28/2020` is US-standard numeric date convention; acceptable in international SLA documents.
- Preserves the Gregorian year (2020) which a non-Japanese reader needs.
- Real D7 enhancement (recognize jp `N月N日` ↔ en `Month DD, YYYY` semantic equivalence) is a Phase 1 v2 candidate.
- Trade-off: en loses some readability (`June 28, 2020` reads more naturally than `6/28/2020`), but the cost of yet another detector patch outweighs the marginal readability loss for a single SLA caption.

---

## Entry 2 — page_445 entities[0].answer_index (REAL Stage 4 defect, integer correction)

**Context**: page_445 has 3 question entities (Chapter 12 questions 12-4, 12-5, 12-6). Stage 4 structure extraction stored `answer_index = [2, 3, 2]` but the source ground truth in `cleaned/page_445.md` answer line reads `問題12-4 **ア**　問題12-5 **エ**　問題12-6 **ウ**`, which maps to `answer_index = [0, 3, 2]`. Only `entities[0]` is wrong; `entities[1]` and `entities[2]` are already correct and untouched by this hand-edit.

This is the **first real Stage 4 defect** discovered in the 579-page run (Session 20's 71 hand-edits were all Stage 5 translator semantic stuck-leaves; Session 21's 6 hand-edits were Stage 5 / Stage 6 LLM accuracy issues). It belongs to the D-076 class established in Session 09b (page_043's `[0,0,0,0,0] → [2,2,2,3,2]` correction). Stage 6's 40-page sample did not include page_445, so Stage 6 missed it; Stage 7's Gate A full-554-page detector re-run caught it.

| field | value |
|---|---|
| jp stem 12-4 (unchanged) | `毎週日曜日の業務終了後にフルバックアップファイルを取得し、月曜日〜土曜日の業務終了後には増分バックアップファイルを取得し…` |
| zh / en (unchanged) | (corresponding translations) |
| source answer line (cleaned/page_445.md) | `問題12-4 **ア**　問題12-5 **エ**　問題12-6 **ウ**` |
| expected answer_index sequence | `[0, 3, 2]` (ア=0, エ=3, ウ=2) |
| **actual answer_index (BEFORE)** | `[2, 3, 2]` (entity[0] wrong; entities[1] and [2] correct) |
| **target answer_index (AFTER)** | `[0, 3, 2]` |
| **fix scope** | `entities[0].answer_index: 2 → 0` (single int field) |

**Why this is a real defect (not detector FP)**:

- Source ground truth is unambiguous: `**ア**` after `問題12-4 `, with answer-line pattern that D5 detector parses correctly after Session 20's c627e13 (markdown bold strip) and f7eecc7 (inline separator) patches.
- The mismatch is between Stage 4 output (answer_index = 2 = ウ) and source ground truth (ア = 0). Stage 4 selected the wrong choice when extracting the answer.
- Per D-076 Plan-B precedent, Stage 4 answer_index defects are first-class learner-data safety issues — the wrong answer in a study question is unambiguously harmful for the IT Passport learner audience.
- Hand-edit is the correct remediation per Session 09b pattern: fix the single integer, re-audit confirms PASS.

**Why hand-edit instead of Stage 4 re-extraction**:

- Single-field correction; full Stage 4 re-extraction would cost LLM ($) and risk regressing other entities on the same page.
- Session 09b established the precedent (page_043 hand-edit was 5 integer fields).
- Transactional apply with pre-validation + post-verify gives the same correctness guarantee as re-extraction would.

---

## Review trail (user gate)

| Step | Owner | Status |
|---|---|---|
| Author 2 drafts (1 en revise + 1 int correction) | Claude Opus 4.7 | ✅ |
| Build sidecar JSON + checklist + apply script | Claude Opus 4.7 | ✅ |
| Dry-run validation (path resolves + before matches current disk + after differs) | Claude Opus 4.7 | ⏳ pending |
| **User reviews this checklist** | **user** | **⏳ this turn** |
| User authorizes apply with "go apply" | user | ⏳ pending |
| Transactional apply via `apply_stage7_hand_edits.py` | Claude Opus 4.7 | ⏳ pending |
| Post-apply Stage 7 export re-dispatch | Claude Opus 4.7 | ⏳ pending |
| Expected outcome: Stage 7 Gate A passes, output/ emitted | — | ⏳ pending |
