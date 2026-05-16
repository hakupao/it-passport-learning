# Stage 6 Hand-Edit Checklist — Session 20 Q6-A

Run: `dry_run_2026-05-12T13-23-19`
Stage: 6 (audit reviewer LLM follow-up — selective fix for `translation_unfaithful` real-domain errors surfaced by Phase-2 LLM in Stage B rerun #2)
Author: Claude Opus 4.7 (writer agent)
Reviewer: user (this checklist + sidecar JSON before transactional apply)
Apply mechanism: `evidence/.../apply_stage6_hand_edits.py` (transactional, all-or-nothing)
Sidecar: `step_06_11_D_6_hand_edits.json` (6 entries — 5 from Q6-A drafts + 1 added per Q7-A after Stage B rerun #3 surfaced page_292 D7 FAIL)
Total fields touched: **6** (1 zh on page_129 + 2 en on page_393 + 2 zh on page_425 + 1 en on page_292)

Rule A check: not triggered (5 leaves of selective correction; no >50% compression/rewrite).
Rule D status: writer = Claude Opus 4.7 (this session); reviewer = user (this turn).
Rule B status: no failures to archive (no LLM dispatches in this sub-step).

---

## Entry 1 — page_129 entities[0].rows[4][2].zh (airline `クルー` mis-translation)

**Context**: page_129 entity[0] is a comparison table about Southwest Airlines (サウスウエスト航空) ownership / employee structure. Row 4 column 2 is a metric about flight crew shareholding.

| field | value |
|---|---|
| jp (unchanged, ground truth) | `クルーの持株比率70%以上` |
| en (unchanged) | `Crew shareholding ratio of 70% or more` |
| **zh BEFORE** | `船员持股比率70%以上` |
| **zh AFTER** | `机组人员持股比率70%以上` |

**Why this fix**:

- In airline industry context, jp `クルー` = English "Crew" = Chinese "机组人员" (flight deck + cabin crew).
- The pre-fix zh `船员` (ship crew / mariner) is a domain-misclassified translation — same word `クルー` would correctly translate to `船员` in a maritime context, but page_129 is explicitly about an airline.
- en `Crew` is general enough in English usage to remain unchanged; only zh requires the airline-specific term.

**Source**: Stage B rerun #2 review.json Phase-2 LLM issue (rationale at entities[0].rows[4][3] but actual location verified at rows[4][2] by direct grep of translated/page_129.json).

---

## Entry 2 — page_393 entities[9].definition.en (`京` supercomputer)

**Context**: page_393 entity[9] is a Term entity for "スーパーコンピュータ". The Japanese definition references `「京」` as a famous example. The pre-fix en uses "Kei" which is a phonetic transliteration, not the canonical international name.

| field | value |
|---|---|
| jp (unchanged) | `大量の計算を高速に行うコンピュータ。遺伝子の解析や地球規模の気象予測などに使われる。日本では「京」という名前のスーパーコンピュータが有名` |
| zh (unchanged) | `高速进行大量计算的计算机。用于基因分析、全球规模的气象预测等。在日本,名为"京"的超级计算机较为著名。` |
| **en BEFORE** | `A computer that performs vast numbers of calculations at high speed. Used for genome analysis, global-scale weather forecasting, etc. In Japan, a supercomputer named "Kei" is famous.` |
| **en AFTER** | `A computer that performs vast numbers of calculations at high speed. Used for genome analysis, global-scale weather forecasting, etc. In Japan, a supercomputer named "K computer" (京) is famous.` |

**Why this fix**:

- 「京」 (built jointly by RIKEN + Fujitsu, operational 2011) is conventionally called **"K computer"** in international English documentation — the K stands for "Kei" (京) and also (informally) for the Japanese counting unit 京 = 10^16, which was the design target peak performance (10 PFLOPS).
- "Kei" is a phonetic transliteration that English-language learners may not recognize. "K computer" is the official RIKEN-published name on academic publications and international supercomputing rankings (Top500).
- Keeping the Japanese character `(京)` in parentheses after the English name preserves the cross-language reference for IT Passport learners.

---

## Entry 3 — page_393 entities[10].rows[9][1].en (table recap of entity 9)

Identical content to Entry 2 — entity[10] is a summary table where row 9 column 1 recaps the スーパーコンピュータ Term. Apply the same fix for self-consistency.

| field | value |
|---|---|
| jp (unchanged) | same as entry 2 |
| zh (unchanged) | same as entry 2 |
| **en BEFORE** | `... a supercomputer named "Kei" is famous.` |
| **en AFTER** | `... a supercomputer named "K computer" (京) is famous.` |

---

## Entry 4 — page_425 entities[4].definition.zh (root directory)

**Context**: page_425 entity[4] is a Term entity for "ルートディレクトリ". The Japanese definition uses `ハードディスク直下` (location directly beneath the hard disk) to describe where the root directory sits. The pre-fix zh phrases this as `硬盘的根部` (literally "the root part of the hard disk") which is ambiguous — learners may misread "根部" as "bottom" or "deepest physical level".

| field | value |
|---|---|
| jp (unchanged) | `階層構造の最上位のディレクトリのこと。通常はハードディスク直下がルートディレクトリになる。` |
| en (unchanged) | `The topmost directory in the hierarchical structure. Normally, the location directly under the hard disk is the root directory.` |
| **zh BEFORE** | `层次结构中最顶层的目录。通常硬盘的根部即为根目录。` |
| **zh AFTER** | `层次结构中最顶层的目录。通常情况下，硬盘最顶层位置即为根目录。` |

**Why this fix**:

- jp `ハードディスク直下 = 硬盘正下方/最顶层位置 = directly under the hard disk header`. The point is the *top of the directory tree*, not anywhere physical.
- pre-fix zh `根部` is vague (could mean "bottom", "deepest", "stem", "root part") — clashes with the intended "top-of-tree" semantics.
- post-fix zh `最顶层位置` = "topmost location" — matches both the jp source AND the unchanged en's phrasing of "directly under the hard disk" (which means topmost-of-content, not literal-physical-bottom).
- This phrasing also matches the structural sense of "ルートディレクトリ" = "root directory" — in computing, "root" means "starting point of the tree", not "bottom".

---

## Entry 5 — page_425 entities[7].rows[1][1].zh (table recap of entity 4)

Identical fix to Entry 4 — entity[7] is a summary table where row 1 column 1 recaps the ルートディレクトリ Term. Apply same correction for self-consistency between the Term entity (#4) and its tabular recap (#5).

| field | value |
|---|---|
| jp (unchanged) | same as entry 4 (sans trailing period) |
| en (unchanged) | same as entry 4 (sans trailing period) |
| **zh BEFORE** | `层次结构中最顶层的目录。通常硬盘的根目录就是根目录` |
| **zh AFTER** | `层次结构中最顶层的目录。通常情况下，硬盘最顶层位置即为根目录` |

**Additional reason for #5**: pre-fix zh contains the tautology `硬盘的根目录就是根目录` (literally "the hard disk's root directory is the root directory") — circular reasoning that fails to define anything for the learner. The post-fix breaks the circularity by referencing the *position* (最顶层) rather than the *concept* (根目录).

---

## Entry 6 — page_292 entities[1].caption.en (Japanese era → Gregorian year)

**Context**: page_292 entity[1] is an SLA (Service Level Agreement) document caption. The jp / zh source uses the Japanese era format `令和2年6月28日` (Reiwa year 2, June 28). The en translation pre-fix kept "Reiwa 2" verbatim, which Stage B rerun #3 D7 detector flagged as a numeric_inconsistent FAIL (jp/zh numerics `{2.0,28,6}` vs en numerics `{2,2.0,28}` — the extra `2` in en came from "Reiwa 2" surviving past the D7 era-stripping pass).

**Trigger**: Stage 6 Stage B rerun #3 — surfaced after the Session 20 D7 patch (`114a1af`) that strips Japanese era markers + English `FY\d{4}` patterns. The patch did NOT cover English-romaji era prefixes (`Reiwa N`, `Heisei N`, etc.), which is a Phase 1 v2 detector candidate but not blocking for v1.0.0.

| field | value |
|---|---|
| jp (unchanged) | `新販売管理システム運用 サービスレベル合意書（Service Level Agreement） バージョン 2.0 令和2年6月28日 株式会社テクテク` |
| zh (unchanged) | `新销售管理系统运维 服务等级协议（SLA） 版本2.0 令和2年6月28日 株式会社TekuTeku` |
| **en BEFORE** | `New Sales Management System Operations Service Level Agreement (SLA) Version 2.0 June 28, Reiwa 2 TekuTeku Co., Ltd.` |
| **en AFTER** | `New Sales Management System Operations Service Level Agreement (SLA) Version 2.0 June 28, 2020 TekuTeku Co., Ltd.` |

**Why this fix**:

- 令和2年 = 2020 Gregorian (令和元年 = 2019, so 令和2 = 2020). The conversion is the standard SLA-document-in-English convention.
- "Reiwa 2" in English is awkward for an international audience — most English readers don't know the era → Gregorian mapping.
- jp/zh keep `令和2年` literally (matches Japanese SLA document convention for those audiences).
- This single edit resolves the D7 FAIL on page_292 (D7 will see jp/zh numerics `{2.0,28,6}` vs en numerics `{2.0,28}` — pairwise comparable subset, downgrades to WARN under Session 10 162aebb policy).
- Adding `Reiwa N / Heisei N` stripping to D7 detector is a Phase 1 v2 candidate (would also be useful for other docs that leak era-romaji into en), but does not block v1.0.0 release.

---

## Review trail (user gate)

| Step | Owner | Status |
|---|---|---|
| Author 5 drafts (zh/en text only, jp preserved per D-075) | Claude Opus 4.7 | ✅ |
| Build sidecar JSON + checklist + apply script | Claude Opus 4.7 | ✅ |
| Dry-run validation (path resolves + before matches current disk + after differs) | Claude Opus 4.7 | ⏳ pending |
| **User reviews this checklist + sample inline-rendered drafts** | **user** | **⏳ this turn** |
| User authorizes apply with "go apply" | user | ⏳ pending |
| Transactional apply via `apply_stage6_hand_edits.py` | Claude Opus 4.7 | ⏳ pending |
| Post-apply verification: 5/5 fields show new value, jp unchanged | Claude Opus 4.7 | ⏳ pending |
| Stage 6 closure narrative (`step_06_audit.md`) | Claude Opus 4.7 | ⏳ pending |
| Gate ⑤ checker + `gate_5_<ts>.json` checkpoint emit | Claude Opus 4.7 | ⏳ pending |

---

## Why not LLM-redrive (Q2-B alternative)

Considered: re-run Stage 5 translator with revised prompt on just these 5 leaves to let the LLM re-translate. Rejected:

- 5 leaves total — direct hand-fix is faster, lower-cost, more deterministic
- Session 09b precedent established this pattern at 13 leaves; Session 19 at 71 leaves
- Rule D Writer ≠ Reviewer is satisfied: Claude (writer) drafts → user (independent reviewer) approves → Stage 7 export user sample review will be a second independent check

## Why not defer to Phase 1 v2 (Q2-B alternative)

Considered: leave as known WARN, log as Phase 1 v2 candidate. Rejected:

- These 5 are real domain errors that learners would consume incorrectly (船员 vs 机组人员 = wrong industry; "Kei" vs "K computer" = wrong name; "根部" / "根目录就是根目录" = unclear/tautological)
- Project mission per CLAUDE.md is trilingual learning content for non-native technical learners — wrong domain terms defeat the purpose
- v1.0.0 GitHub Release will ship the output; these errors would propagate to users
- Hand-fix here costs ~5 min of Claude + user review; defer cost = degraded user experience
