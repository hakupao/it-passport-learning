# D-077 — Stage 6 Audit Reviewer LLM design (two-pass + two-tier verdict + repair_stage)

| 字段 | 值 |
|---|---|
| **Status** | Locked (Session 10, 2026-05-07) |
| **Decision Maker** | Claude per "你来定" (D-019), user framing: "不考虑成本和时间，要优质，安全，质量高的做法和选择" |
| **Source** | `docs/discussion/2026-05-07-session-10.md` §2 |
| **Related** | 规则 A (>50% rewrite N-sample audit), 规则 D (writer/reviewer 分离), D-008 (pipeline), D-019 (slow-pace), D-029 (重大决定独立 ADR), D-055 (UNTRANSLATED), D-056 (Discriminated Union), D-058 (envelope), D-059 (N 公式), D-060, D-061 (reviewer mapping), D-062 (evidence fields), D-063 (audit failure handling), D-071 (budget cap), D-073 (Stage A→B), D-074 (Stage 5 wrapper clause), D-075 (jp preservation), D-076 (Stage 4 answer-line) |

---

## 1. Context

Stage 6 audit reviewer is the next-and-only automated gate between Stage 5 trilingual translate output and Stage 7 export. Plan-B (Session 09b) made it concrete that:

- **Claude self-audit on Stage 5 missed 2 architectural bugs** (D-076 Stage 4 `answer_index` silent `0` default; D-075 Stage 5 `_glossary_lookup` jp-mutation). User retro caught both in <30 min.
- **Audit dimension list matters more than the audit verdict mechanic.** The Stage 5 self-audit returned PASS because everything that *was checked* passed; the architectural bugs were in dimensions Claude self-audit didn't include (e.g. "translated.jp == structured.jp", "question.answer_index against vision_full ground truth").
- Glossary, content fidelity, and structural invariants need different detection mechanisms (deterministic vs semantic).
- Stage 6 must produce **machine-readable issue records** (per D-061) so D-063 retry routing knows which upstream stage to re-run, not only Stage 6 itself.

User worksheet `docs/discussion/2026-05-07-stage5-user-retro-worksheet.md` §D pre-locked:
- 14-catch list (FAIL/WARN/INFO labels filled per item)
- Reviewer model tier = `opus`
- Two-tier verdict idea: `translation_fidelity_verdict` + `learner_data_verdict`
- `repair_stage` tagging (4 / 4.5 / 5 / 7) on every issue
- F-CHOICE-MARKER policy: A+B (Stage 6 reviewer flags WARN; Stage 7 export normalizes; jp keeps `ア/イ/ウ/エ`; zh/en → `A/B/C/D`)
- Stage 7 may apply display-only fixes without rewriting `translated/`

Session 10 §2 framed 4 design questions (Q1 input granularity / Q2 verdict schema / Q3 repair_stage / Q4 dry-run scope + halt). User invoked D-019 §"你来定" with the framing "quality + safety > cost". This ADR locks the answers.

---

## 2. Decision

### 2.1 Two-pass architecture: deterministic Phase 1 + LLM Phase 2

Stage 6 runs in two ordered passes per page. Phase 1 is deterministic Python; Phase 2 is opus LLM. Both passes emit `Stage6Issue` records into the same per-page review.

**Phase 1 — deterministic detectors** (run unconditionally, no LLM cost):

| # | Detector | Logic | Severity | Dimension | repair_stage | issue_type |
|---|---|---|---|---|---|---|
| D1 | jp preservation | each leaf: `translated.jp == structured.jp` | FAIL | learner_data | 5 | `jp_mutation` |
| D2 | Trilingual completeness | each leaf has non-empty `{jp, zh, en}`, no `UNTRANSLATED` sentinel | FAIL | learner_data | 5 | `untranslated_residue` |
| D3 | Schema validity | Pydantic validate `translated/page_*.json` against current Trilingual + Entity + Question models | FAIL | learner_data | 5 | `schema_invalid` |
| D4 | answer_index range | for each Question: `0 ≤ ai < len(choices)` (-1 already blocked by envelope per D-076; this catches future regressions) | FAIL | learner_data | 4 | `answer_index_out_of_range` |
| D5 | answer_index ground truth | parse the **same Markdown source Stage 4 consumed** for this page (`cleaned/page_*.md` if Stage 3 promoted it; else `ocr/page_*.md` from Mistral) for the answer line pattern `問題N-M\s*[アイウエ]`; compare 0-based index against `question.answer_index`. If no answer line is parseable, this detector emits no issue (parse failure already routed to D-076 envelope `-1` rejection at Stage 4, which D4 then catches). | FAIL | learner_data | 4 | `answer_index_mismatch` |
| D6 | Choice marker consistency | jp choices keep `ア/イ/ウ/エ` verbatim; for each language inside one question all 4 choices use the *same* marker scheme | WARN | learner_data | 7 | `choice_marker_inconsistent` |
| D7 | Numeric / year / percent consistency | regex `\d+(?:\.\d+)?%?年?` extracted from jp must match the set extracted from zh and from en (after kana → ASCII normalization on jp) | FAIL | fidelity | 5 | `numeric_inconsistent` |
| D8 | Glossary lock — Term surface | for `Term` entities whose `structured.surface.jp` exactly matches a glossary key, `translated.surface.zh / .en` must equal the glossary lock verbatim | FAIL | learner_data | 5 | `glossary_lock_violated` |
| D9 | Glossary lock — substring presence | for any leaf whose jp contains a glossary key as substring, the corresponding zh / en should contain the locked translation as substring | WARN | learner_data | 5 | `glossary_lock_missed` |
| D10 | Redundant nested parens | regex `\([^()]*\([^()]*\)[^()]*\)` in en (or zh) | WARN | fidelity | 7 | `redundant_nested_parens` |
| D11 | kana_helper required iff katakana | for Term entities with all-katakana `surface.jp`, `kana_helper` must be non-null; else null | INFO | learner_data | 4.5 | `kana_helper_missing` / `kana_helper_unexpected` |
| D12 | kana_helper romaji shape | `kana_helper.reading` matches `^[a-z]+(?:\s[a-z]+)*$` (lowercase Hepburn-ish) | INFO | learner_data | 4.5 | `kana_helper_format` |
| D13 | glossary surface vs concept consistency | for any glossary entry where `surface.zh` and `kana_helper.zh_concept` are both populated, log INFO if they're not substring-related (per user worksheet A.4.4 — accept-as-is but mark) | INFO | learner_data | 4.5 | `glossary_surface_concept_split` |

**Phase 2 — LLM reviewer detectors** (opus, sub-batched, run after Phase 1 short-circuits on `D2`/`D3` if either fails — no point asking opus to grade a malformed page):

| # | Detector | LLM judgment | Severity | Dimension | repair_stage | issue_type |
|---|---|---|---|---|---|---|
| L1 | Hallucination (zh/en says X not in jp) | semantic comparison | FAIL | fidelity | 5 | `translation_hallucination` |
| L2 | Omission (jp says X, zh/en silent) — esp. negation, number, condition, answer-key term | semantic comparison | FAIL | fidelity | 5 | `translation_omission` |
| L3 | Unfaithful tone or wording | semantic + idiomaticity | WARN | fidelity | 5 | `translation_unfaithful` |
| L4 | Term translation not idiomatic for IT教材 audience | LLM judgment with glossary as anchor | INFO | fidelity | 4.5 | `term_translation_idiomatic` |

LLM input granularity: **one entity at a time** with `chunk_size = 4` (sub-batched like Stage 5). Each call sees: the entity's full Trilingual leaves + the glossary entries whose key occurs in the entity (filtered slice, not full glossary) + the source `cleaned/page_*.md` text range for the entity's `block_id` (or full page if block_id is null).

**Why two passes, not one LLM-only pass**:

- Deterministic detectors are **100% recall + 100% precision** for invariants (jp preservation, schema, range checks). Asking the LLM to verify these is wasteful and error-prone; Plan-B already showed the LLM (Stage 5) writer can violate them silently.
- LLM is the only mechanism that can judge cross-language semantic faithfulness and idiomaticity.
- Detectors run first so a page that fails `D1` / `D3` short-circuits, saving the opus call cost.
- Both pass results merge into one `Stage6PageReview` so the verdict + halt logic is uniform.

### 2.2 Reviewer LLM configuration

| Knob | Value | Why |
|---|---|---|
| `tier` | `opus` (`claude-opus-4-7`) | User worksheet §D.3 explicit choice. Opus is the only tier proven on long-context exam content + complex rule-following (Stage 5 attempts 002-005 ruled out sonnet/haiku). |
| Mechanism | `tools=[submit_review_tool]` + `tool_choice={"type":"tool","name":"submit_review"}` | Forces JSON output via Anthropic's classic tool_use pattern. Matches Stage 4/5 engines (proven Tier 3 path). Rejected `output_config.format = json_schema` (still beta). |
| `chunk_size` | `4` entities/call | Smaller than Stage 5's `8` because the reviewer prompt + per-entity context (cleaned/ slice + glossary slice) is heavier. Empirical re-tune allowed. |
| `max_retries` | `3` (transient JSON / API errors only) | Per D-063 default. Content-level FAIL never auto-retries — that's user retro territory. |
| `system prompt version` | `v1.0` | Versioned per D-061 §reviewer_prompt_version. Bump on prompt change. Captured in evidence (D-062 field 10). |
| `temperature` | `0.0` | Reviewer should be deterministic; it's a judgment task with low creativity tolerance. |

### 2.3 Output schema

```python
class Stage6IssueDimension(str, Enum):
    fidelity = "fidelity"
    learner_data = "learner_data"

class Stage6IssueSeverity(str, Enum):
    FAIL = "FAIL"
    WARN = "WARN"
    INFO = "INFO"

class Stage6IssueDetector(str, Enum):
    deterministic = "deterministic"
    llm = "llm"

class Stage6Issue(BaseModel):
    id: str                       # auto-generated, e.g. "D1-page_014-001"
    issue_type: str               # closed enum, mapped via REPAIR_STAGE_BY_ISSUE_TYPE
    severity: Stage6IssueSeverity
    dimension: Stage6IssueDimension
    repair_stage: Literal[4, 4.5, 5, 7]
    detector: Stage6IssueDetector
    entity_path: str              # e.g. "page_043.entities[0].choices[2].zh"
    evidence: dict[str, str]      # {"jp": "...", "zh": "...", "en": "...", "expected": "..."}
    rationale: str
    proposed_fix: Optional[str] = None
    detector_confidence: Optional[float] = None  # llm only, [0, 1]

class Stage6Verdict(str, Enum):
    PASS = "PASS"
    WARN = "WARN"
    FAIL = "FAIL"

class Stage6PageReview(BaseModel):
    cert_id: str
    run_id: str
    stage: Literal[6] = 6
    page: int
    leaves_audited: int
    leaves_total: int
    translation_fidelity_verdict: Stage6Verdict
    learner_data_verdict: Stage6Verdict
    overall_verdict: Stage6Verdict
    most_severe_repair_stage: Optional[Literal[4, 4.5, 5, 7]] = None
    issues: list[Stage6Issue]
    reviewer_model: str           # "claude-opus-4-7"
    reviewer_prompt_version: str  # "v1.0"
    started_at: str               # ISO-8601
    finished_at: str              # ISO-8601
    cost_usd_shadow: float
    safety_field_failed: list[str] = []  # D-063 safety set hits

class Stage6RunSummary(BaseModel):
    cert_id: str
    run_id: str
    stage: Literal[6] = 6
    pages: list[Stage6PageReview]
    total_pages: int
    pass_pages: int
    warn_pages: int
    fail_pages: int
    pass_rate: float              # pass_pages / total_pages
    overall_verdict: Stage6Verdict
    safety_failed: bool           # any safety_field_failed across all pages
    most_severe_repair_stage: Optional[Literal[4, 4.5, 5, 7]] = None
    started_at: str
    finished_at: str
    cost_usd_shadow_total: float
```

Both `Stage6PageReview` and `Stage6RunSummary` are wrapped in the standard envelope (D-058) when persisted.

### 2.4 `repair_stage` tagging — hybrid LLM hint + Python validate

Per Q3 candidate (iii). Mechanism:

1. **Deterministic detectors** set `repair_stage` directly from a hardcoded table `REPAIR_STAGE_BY_ISSUE_TYPE` (Python source, single point of truth).
2. **LLM reviewer** is asked for `issue_type` only (closed enum, listed in tool schema). Python looks up the `repair_stage` from the same table. The LLM does not write `repair_stage`; that field is non-LLM-trustable.
3. The mapping table is locked here:

```python
REPAIR_STAGE_BY_ISSUE_TYPE: dict[str, Literal[4, 4.5, 5, 7]] = {
    # learner_data
    "jp_mutation": 5,
    "untranslated_residue": 5,
    "schema_invalid": 5,
    "answer_index_out_of_range": 4,
    "answer_index_mismatch": 4,
    "choice_marker_inconsistent": 7,
    "glossary_lock_violated": 5,
    "glossary_lock_missed": 5,
    "kana_helper_missing": 4.5,
    "kana_helper_unexpected": 4.5,
    "kana_helper_format": 4.5,
    "glossary_surface_concept_split": 4.5,
    # fidelity
    "numeric_inconsistent": 5,
    "redundant_nested_parens": 7,
    "translation_hallucination": 5,
    "translation_omission": 5,
    "translation_unfaithful": 5,
    "term_translation_idiomatic": 4.5,
}
```

Adding a new `issue_type` requires (a) extending this table, (b) extending the LLM tool-schema enum, (c) bumping `reviewer_prompt_version` if user-facing.

**Why hybrid not pure LLM**: per Plan-B lessons, LLM-emitted metadata cannot be trusted for routing decisions. `repair_stage` drives whether D-063 retries Stage 4 / 4.5 / 5 / 7 — wrong tag = wrong stage rerun = wasted cost + missed bug. Determinism wins.

### 2.5 Two-tier verdict composition

Per Q2 candidate (α). Per page:

1. Group all issues (Phase 1 + Phase 2) by `dimension`.
2. For each dimension, the dimension verdict is `max(severity ∈ that dimension)` mapped FAIL > WARN > PASS (no issues = PASS).
3. **Safety-field override**: any issue whose `entity_path` resolves to a D-063 safety field (`Question.answer_index`, `Term.surface.jp`, `Entity.type`, `Envelope.cert_id`, `Envelope.schema_version`) and whose severity is FAIL → forces `learner_data_verdict = FAIL` and adds to `safety_field_failed`.
4. `overall_verdict = max(translation_fidelity_verdict, learner_data_verdict)` with `safety_field_failed` non-empty → `overall_verdict = FAIL` (no override possible).
5. `most_severe_repair_stage` = `repair_stage` of the most severe issue. Tie-break = smallest stage number (earliest in pipeline gets fixed first; e.g. an answer_index FAIL routes to Stage 4 rerun, not Stage 7).

**Ship gate** (Stage 6 → Stage 7): `overall_verdict ∈ {PASS, WARN}` AND `safety_failed == False`.

WARN at the run level still **halts and surfaces to user** per D-063 §2.1. User explicitly OKs WARN to continue, or routes back to repair_stage.

### 2.6 Composition with D-063 (and the "重跑哪个 stage" question)

D-063 §2.1 says "FAIL → 强制全 stage 重跑". Read literally that meant "Stage 6 itself reruns". Plan-B exposed that the actually-needed action when Stage 6 finds a FAIL is **rerun the upstream stage that introduced the bug**. This ADR resolves the ambiguity:

> **D-063 amendment via D-077**: when Stage 6 emits FAIL with at least one issue having `repair_stage ≠ 6`, the retry target is `most_severe_repair_stage` from the run summary, not Stage 6 itself. Re-running Stage 6 only makes sense if every FAIL issue has `repair_stage == 6` (e.g. reviewer prompt bug). The `audit.max_retries` limit (default 3 per D-063) applies per-stage to the retry target, not to Stage 6.

The Stage 6 implementation will respect this in the runner's halt → surface → user-decision flow, but **Stage 6 itself does not auto-trigger upstream reruns**. User authorizes each rerun explicitly (per CLAUDE.md "What you should NOT do without explicit user approval — Run any LLM API call that costs money").

### 2.7 Dry-run plan — Stage A (5 pages) → Stage B (40 pages)

Per Q4 candidate (II) + (Q) + (R-modified-by-2.6).

**Stage A — 5 pages**:

| Page | Role | Why this page |
|---|---|---|
| `page_014` | Clean baseline (no known issue) | Validates reviewer doesn't false-flag clean translation. Stage 5 audit had it at clean PASS. |
| `page_043` | 5 questions + answer-line ground-truth probe | Validates `D5 answer_index_mismatch` (post Plan-B fix; should now report MATCH on all 5 questions); validates `D6 choice_marker_inconsistent` flags the F-CHOICE-MARKER pattern as WARN. |
| `page_045` | Term-heavy + F-COP21 source page | Validates `D10 redundant_nested_parens` regex hits the COP21 entry; validates `D8/D9 glossary lock` compliance after the 13 glossary patches. |
| `page_030` | Hand-translated `経営理念` definition | Validates reviewer grades human-quality content as PASS; sanity-check that it doesn't penalize hand-writes for being LLM-unlike. |
| `page_038` | Hand-translated `職能別組織` definition | Same as above. |

After Stage A, halt and present results to user. Required user decisions: (a) precision check on flagged issues; (b) recall check by inspecting at least one "PASS" page sample; (c) authorize Stage B. If any safety field FAIL is detected on Stage A, halt immediately for upstream-stage decision (do not continue Stage A pages).

**Stage B — full 40 pages**: only after Stage A user PASS. Stage B halts after all 40 pages reviewed; results aggregated and surfaced for user retro.

### 2.8 Halt strategy

| Trigger | Behavior |
|---|---|
| Transient JSON parse / API error | Auto-retry up to 3× per call (per D-063). On exhaustion, archive partial output to `failures/stage6_audit_review/...` and continue next page. |
| Phase 1 detector raises FAIL on safety field | Halt entire run after current page completes; surface immediately. |
| Phase 2 LLM reports FAIL on non-safety field | Continue. Issue logged. |
| Run completes (Stage A or Stage B) | Halt. Aggregate. User retro. |
| Any FAIL at run-level overall_verdict | Halt + propose `most_severe_repair_stage` rerun (user must authorize). |

### 2.9 Budget for Stage 6 dry-run

Per the new `feedback_quality_over_cost.md` memory locked 2026-05-07: shadow cost is not a Stage 6 design constraint. Implementation:

- Stage 6 runner reuses the existing `BudgetMonitor` (D-071) but is invoked with `--anthropic-soft-usd 999 --anthropic-hard-usd 999` for Phase 1 dry-run. This is per-stage YAML override territory (D-071 §2.4), not an ADR amendment.
- Cumulative shadow currently $47.44; expected Stage 6 shadow ≈ $5-15 for Stage A + Stage B combined (estimate, not commitment).
- Real billing remains $0 (max-plan OAuth, D-069). Mistral $0.05 unchanged.

### 2.10 Evidence + failure handling per 规则 A / B / D

- Pre-run scaffold: `evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/step_06_audit.md` (created before any LLM call, per Tier 3 discipline).
- Per-call failures (Phase 2 only) archived to `failures/stage6_audit_review/stage6-2026-05-07-NNN.md` per D-032 template.
- Reviewer prompt version + LLM model captured in `Stage6PageReview.reviewer_prompt_version` + `.reviewer_model` per D-062 fields 9 + 10.
- Writer (Stage 5 outputs) ≠ Reviewer (Stage 6 + user retro) per 规则 D — auto-satisfied because Stage 5 writer = Anthropic Opus via `engine.py` while Stage 6 reviewer = separate `reviewer.py` module + new system prompt + ultimately user retro.

---

## 3. Rationale

### 3.1 Why two-pass (deterministic + LLM) instead of LLM-only

Plan-B made it concrete that **invariants must be checked deterministically**. The 2 architectural bugs (jp-mutation, answer_index silent default) were both invariant violations. An LLM-only audit gave PASS because it didn't model the invariants explicitly. Deterministic Phase 1 makes those invariants impossible to skip.

LLM Phase 2 is needed for the genuinely judgmental cases (hallucination, idiomaticity), which deterministic code can't approximate.

### 3.2 Why `repair_stage` is hybrid LLM-hint + Python-validate, not LLM-only

`repair_stage` is a routing decision. LLM-emitted routing metadata can't be trusted for irreversible actions (re-running Stage 4 burns minutes + dollars). Hardcoding the issue_type → repair_stage table makes the routing deterministic and auditable.

The LLM still gets to suggest semantic improvements (`proposed_fix` per issue), which is judgment territory.

### 3.3 Why two-tier verdict instead of single

Single `verdict` flattens two distinct concerns: (a) "is the translation faithful?" and (b) "is the data shippable to learners?". Plan-B showed those decouple — a page can be translation-faithful (zh/en accurately reflect jp) but data-broken (`answer_index = 0` when it should be 2). Two-tier surfaces the distinction so the user retro / repair routing knows which axis failed.

`overall_verdict` still exists for D-063 PASS-rate computation and for envelope ship-gate compatibility.

### 3.4 Why opus and not sonnet/haiku

Per user worksheet §D.3 explicit choice. Independently confirmed by Plan-B Stage 5 attempts 004-005 (sonnet regressed) and 006 (opus + new prompt = clean). Reviewer is harder than translator (more rules to apply, longer context with cleaned/ slice + glossary slice + structured input + translated output). Sonnet has a higher false-PASS risk for the very dimensions Plan-B exposed.

### 3.5 Why Stage A = 5 pages (not 1, not 40)

- 1 page (Q4 (I)) is too narrow — won't surface false-flag patterns on clean pages or false-PASS patterns on hand-translated pages.
- 40 pages straight (Q4 (III)) is too broad — if reviewer prompt is wrong, we waste 40× the cost before learning.
- 5 pages cover the 4 known-defect classes (answer_index, F-COP21, hand-translation precision, choice-marker WARN) + 1 clean control. Hits both precision and recall sides of the prompt validation.

### 3.6 Why halt-collect-all (Q4 (Q)) instead of halt-on-first-FAIL (P)

User retro is the actual gate. Surfacing 1 issue when there are 12 pages of patterns wastes user attention. Collecting all + halting once gives the user the full failure landscape in one pass, which is how Plan-B was actually fixed.

The exception is safety-field FAIL — that genuinely should halt early because the upstream stage is broken and the rest of the run will compound the bug.

### 3.7 Why amend D-063 retry semantics here

D-063 §2.1's "FAIL → 强制全 stage 重跑" was written before `repair_stage` existed as a concept. Now that we tag every issue with the stage that should be re-run, "全 stage 重跑" is ambiguous. This ADR resolves it without rewriting D-063: D-063 still describes the threshold + rerun mechanic; D-077 specifies *which* stage gets the rerun.

If this resolution is itself overturned later, that's a D-077 revision, not a D-063 revision. Keeps blast radius small.

---

## 4. Alternatives Considered

### 4.1 (Q1) Reviewer input shape — rejected alternatives

- **(a) Whole-page LLM prompt, no deterministic pass** — rejected. Plan-B already proved LLM can miss invariants when given everything at once; Stage 5 writer self-violated `translated.jp == structured.jp` and the reviewer model is no smarter at invariants.
- **(b) Two-pass LLM (page-level + per-entity)** — rejected. Two LLM passes for what Phase 1 deterministic can do in milliseconds. Would also prompt the LLM to "verify" things it could trivially get wrong (regex matches, equality checks).
- **(c) Single-prompt structured output** — rejected. Single long prompt re-introduces the long-context-decay risk that motivated Stage 5's sub-batching (D-074 + the user "上下文焦虑" feedback memory).

### 4.2 (Q2) Verdict schema — rejected alternatives

- **(β) Single verdict + `dimension` tag on each issue** — rejected. Loses the page-level signal of "fidelity layer ok but data layer broken" or vice versa. User retro relies on this distinction.
- **(γ) Three-tier verdict (fidelity + learner_data + overall)** — accepted as a middle ground; `overall_verdict` does exist. But the third tier is *derived*, not LLM-emitted.
- **(δ) Stage 6 as a binary go/no-go without WARN** — rejected. WARN exists per D-063 for the gray zone; flattening loses the user-pause checkpoint.

### 4.3 (Q3) repair_stage tagging — rejected alternatives

- **(i) Pure LLM-emit** — rejected. LLM can't be trusted with routing decisions for irreversible actions.
- **(ii) Pure Python deterministic table** — almost selected. Rejected only because LLM-emitted issues need *some* connection to the table; LLM emits `issue_type` (closed enum) and Python looks up `repair_stage`. So (iii) is structurally identical to (ii) but with LLM emitting a single discriminator field.
- **(iv) No repair_stage in schema** — rejected. Without it, D-063 retry routing is undefined; Plan-B already showed that "全 stage 重跑" is too coarse.

### 4.4 (Q4) Dry-run scope + halt — rejected alternatives

- **(I) Stage A = 1 page** — rejected (rationale 3.5).
- **(III) Skip Stage A** — rejected. Per D-073 sample-first contract.
- **(IV) Stage A = 5 + prompt-tune mid-run + Stage B** — rejected. Premature optimization; if reviewer prompt v1.0 needs tuning, that's Plan-B-style retro territory, not in-band.
- **(P) Halt on first FAIL** — rejected (rationale 3.6).
- **(R) Auto-retry max_retries=3 on content FAIL** — rejected. Content FAIL means the upstream stage produced bad output; retrying Stage 6 won't change that. Auto-retry only applies to transient API/JSON errors.

---

## 5. Consequences

### 5.1 Positive

- Architectural bugs of the Plan-B class (silent invariant violations) are **categorically caught** at audit time, not relying on user retro.
- Two-tier verdict gives user retro a structured handle on "which axis is broken".
- `repair_stage` tagging makes upstream-stage rerun routing explicit and machine-readable.
- D-063 retry semantics clarified without an ADR rewrite.
- Phase 1 detectors give 100% coverage on invariants for free; cost only pays for judgment work in Phase 2.
- Stage A → Stage B split tests reviewer prompt v1.0 before committing to full-sweep cost.

### 5.2 Negative / accepted costs

- 13 deterministic detectors + 4 LLM detector types = 17 issue_type enum values to maintain. New issue types require coordinated edits to the enum, the Python table, the LLM tool schema, and the system prompt.
- LLM-emitted `proposed_fix` is advisory only; user can't rely on it for unattended repair.
- Per-page wall-time = Phase 1 (ms) + Phase 2 (~10-20 sec @ chunk=4 over avg 9 entities ≈ 3 sub-batches). 40 pages → ~10-15 min wall + opus shadow cost.
- Reviewer prompt v1.0 is unproven; Stage A is the proof. If Stage A reveals systemic prompt issues, treat as Plan-B-style retro.

---

## 6. Implementation Notes

### 6.1 Module layout

```
packages/extractor/src/cert_extractor/pipeline/
  stage6_audit/
    __init__.py
    schema.py              # Stage6Issue, Stage6PageReview, Stage6RunSummary, REPAIR_STAGE_BY_ISSUE_TYPE
    detectors.py           # Phase 1 deterministic detectors (D1-D13)
    reviewer.py            # Phase 2 LLM engine (opus + tool_use submit_review_tool)
    runner.py              # orchestrates Phase 1 → Phase 2 → aggregate per page; aggregates pages → run summary
    prompts.py             # REVIEWER_SYSTEM_PROMPT_V1 + tool schema
packages/extractor/src/cert_extractor/cli.py
  + audit-trilingual subcommand (mirror translate-entities pattern)
```

### 6.2 Test coverage targets (TDD, per Tier 3)

Phase 1 detectors:
- Each of D1-D13 has at least 2 tests: one positive (issue raised correctly) + one negative (no issue when input is clean). 26+ tests.
- Cross-detector test: a page with multiple issues raises the union, not just one.

Phase 2 reviewer engine:
- LLM call mocked with realistic responses for each L1-L4 category.
- Sub-batching test: 9-entity page produces 3 calls @ chunk=4.
- Failure: LLM returns invalid JSON → archived to failures/, run continues.
- Failure: LLM returns issue_type not in enum → rejected, archived, run continues with the issue dropped.

Verdict composition:
- Page with only PASS-grade issues → overall PASS.
- Safety field FAIL → overall FAIL even if rate ≥ 90%.
- Two-tier composition: fidelity FAIL + learner_data PASS → overall FAIL.
- repair_stage routing: most severe issue's repair_stage wins; tie-breaks pick smallest stage number.

Runner:
- Stage A: 5 pages, halt at end, write Stage6RunSummary.
- Safety FAIL during Stage A halts after current page completes.
- Cost aggregation rolls up to cost.json under stage key `6`.

Target: at least 30 new unit tests; suite-wide must remain green.

### 6.3 CLI surface

```
uv run --project packages/extractor python -m cert_extractor.cli audit-trilingual \
    --translated-dir data/.../translated \
    --structured-dir data/.../structured \
    --cleaned-dir   data/.../cleaned \
    --glossary-path data/.../glossary/glossary.json \
    --output-path   data/.../audit/stage6_review.json \
    --tier opus \
    --chunk-size 4 \
    --page-limit 5  # Stage A; drop for Stage B
    --anthropic-soft-usd 999 \
    --anthropic-hard-usd 999 \
    --confirm
```

The `--confirm` flag (mirroring Stage 5) makes the dispatch explicit and forces user authorization in the call chain — no surprise LLM spend.

### 6.4 Scaffold first, dispatch later

Per Tier 3 discipline + CLAUDE.md "Run any LLM API call that costs money — user opens that gate":

1. Write Pydantic schemas + tests (no LLM).
2. Write Phase 1 detectors + tests (no LLM).
3. Write Phase 2 reviewer engine + tests (LLM mocked).
4. Write runner + CLI + tests (LLM mocked).
5. Scaffold `step_06_audit.md` with pre-run input snapshot.
6. **Pause for user gate.**
7. Dispatch Stage A on 5 pages.
8. User retro on Stage A output.
9. If Stage A user PASS, dispatch Stage B on 40 pages.
10. User retro on Stage B → Stage 6 sign-off → unblocks Step 6.10 Stage 7 export.

---

## 7. Related Decisions

| D / 规则 | Relationship |
|---|---|
| 规则 A | Phase 1 + Phase 2 + user retro = N-sample audit; coverage = 100% (every page reviewed). |
| 规则 D | Reviewer (this stage) ≠ Writer (Stage 5). Auto-satisfied. |
| D-008 | Stage 6 is the audit lane in the 8-stage pipeline. |
| D-019 | This ADR was locked under "你来定" with explicit reasoning + rejected alternatives. |
| D-029 | Stage 6 is architectural + Phase-boundary-affecting → standalone ADR per D-029. |
| D-055 | UNTRANSLATED sentinel detection → D2 detector. |
| D-056 | Discriminated Union schema validation → D3 detector. |
| D-058 | Stage6PageReview / Stage6RunSummary wrapped in standard envelope. |
| D-059 | N coverage = 100% (every page) for Stage 6 (vs sample-only earlier stages). |
| D-061 | Reviewer model tier mapping (default sonnet for stage 6); this ADR overrides to opus per worksheet §D.3 + quality-over-cost feedback. The override is recorded in evidence per D-061 §2.3. |
| D-062 | Evidence fields 7/8/9/10 (writer/reviewer agent + prompt version) recorded for Stage 6. |
| D-063 | Threshold + retry mechanism. **Amended by §2.6 here**: retry target = `most_severe_repair_stage`, not Stage 6 itself, when applicable. |
| D-071 | Budget cap; per-stage YAML override raises Stage 6 caps to functionally disabled for dry-run. |
| D-073 | Stage A → Stage B sample-first contract. |
| D-074 | Stage 5 wrapper-clause prompt fix; not directly used here, but Phase 2 reviewer's `translation_omission` detector validates D-074 effect. |
| D-075 | Stage 5 jp-preservation contract; D1 detector enforces continuously. |
| D-076 | Stage 4 answer-line parsing + envelope -1 rejection; D5 detector enforces. |

---

## 8. Revision History

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-07 | 1.0 | Initial — Session 10 §2 locked under D-019 "你来定". |

---

> Related session log: `docs/discussion/2026-05-07-session-10.md` §2 + §3.
