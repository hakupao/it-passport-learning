# CLAUDE.md — IT Passport Learning project instructions

> Project-specific guidance for any Claude / Claude Code session working in this repo.
>
> This file does **not** repeat the maintainer's global `~/.claude/CLAUDE.md`. It only contains repo-local rules.

---

## Start here, every session

1. Read **`docs/STATE.md`** first. It is the live state truth source — current phase, locked decisions count, open questions, where to resume.
2. Read the most recent session log under `docs/discussion/YYYY-MM-DD-session-NN.md` § "What's Next".
3. Then proceed.

You will be lost without these. Don't skip them.

---

## What this project is

A trilingual learning content factory for the IT Passport (ITパスポート) certification exam. Phase 1 = `cert-extractor`, a pluggable OCR + LLM-driven content pipeline. See `README.md` for the user-facing story; see `docs/STATE.md` for current state.

---

## Workflow tier

**Tier 3** (multi-day, high-stakes, full traceability). Every step writes evidence:

- `docs/discussion/YYYY-MM-DD-session-NN.md` — session journal (append-only)
- `docs/STATE.md` — live state snapshot (rewritten end of every session)
- `docs/decisions/D-NNN-*.md` — ADRs for major decisions
- `evidence/step_NN_audit.md` — semantic audit (Rule A)
- `failures/step_NN_attempt_X.md` — failure archive (Rule B)
- `RETROSPECTIVE.md` — Phase retro (Rule C)

---

## Hard rules (mirrored from `~/.claude/CLAUDE.md` for visibility)

| Rule | One-liner |
|------|---|
| **A** | > 50% compression / rewrite ⇒ N-sample independent audit ⇒ evidence under `evidence/` |
| **B** | Failed attempts archived to `failures/`, never deleted |
| **C** | Phase ends with `RETROSPECTIVE.md` |
| **D** | Writer agent ≠ Reviewer agent (different `subagent_type`s, no self-review) |

---

## Discussion / decision protocol (D-027)

1. **Decision-on-lock writeback** — when a `D-NNN` is agreed, write to current session log **the same turn**.
2. **Open-question registration** — every unresolved item gets an `OQ-NN` ID and is filed immediately.
3. **State sync on change** — when an OQ closes / a D supersedes / phase status changes, update `docs/STATE.md` the **same turn**.
4. **Live state vs historical journal** — session logs are append-only history; `docs/STATE.md` is the live snapshot. Read STATE first.
5. **Pre-close self-check** — before a session ends, declare and demonstrate "all D / OQ / state changes are on disk".

---

## Discussion pace (D-019)

**Slow pace (3a)**. For each new topic, Claude poses 2-4 open questions to the user *before* proposing a solution. The user thinks, replies, and only then Claude proposes. This is non-negotiable for design topics.

When the user explicitly says "you decide" / "你来定" for a sub-question, Claude:

1. Consults authoritative docs (Context7 / official docs / RFC) — do **not** rely on memory alone.
2. Locks one or more `D-NNN` with explicit reasoning.
3. Lists rejected alternatives with reasons.
4. Writes back to session log + STATE.md the same turn.

---

## Phase / stage signaling

| If `docs/STATE.md` says... | Behavior |
|---|---|
| "**设计阶段**" | Do **not** write executable code. Only design docs / discussion / decisions. |
| "**实施阶段**" or has Phase 1 build artifacts | Code is allowed under TDD; respect Tier 3 evidence requirements. |

When in doubt, read STATE.md and ask the user.

---

## Decision IDs

- `D-NNN` is globally monotonic across sessions, **never reused**.
- Major decisions (Phase boundary / irreversible / high-stakes / architectural) get a standalone ADR in `docs/decisions/D-NNN-slug.md` (D-029).
- Minor decisions live as one-line entries in the session log only.

---

## Repo layout assumptions (locked D-034 ~ D-053)

- `pyproject.toml` at root = uv workspace umbrella (hatchling backend, `requires-python = ">=3.11,<4.0"`).
- `packages/extractor/` is Phase 1's only package; `apps/` is for Phase 2+ web/CLI apps (`apps/web/` = Phase 2 Next.js 15 app per D-093).
- Tests at `packages/extractor/tests/` with `unit/`, `integration/`, `e2e/` subdirs (D-040, D-042); `_fixtures/` for test data (D-043).
- All runtime pipeline data lives under **`/data/<cert_id>/runs/<run_id>/<stage>/`** with stages = `raw/ ocr/ classified/ cleaned/ structured/ glossary/ translated/ output/` (D-050, D-051, D-052, D-053). The whole `/data/` is **gitignored** (D-050 supersedes D-045's scattered entries).
- Final `output/` releases go via **GitHub Release + git tag**, not via git history (D-046).
- `evidence/`, `failures/`, `RETROSPECTIVE.md` are **committed** (Rules A / B / C).
- `uv.lock` is **committed** (reproducibility, per uv official).

---

## What you should NOT do without explicit user approval

- Run any LLM API call (Mistral / Anthropic) that costs money. Phase 1 implementation will need them, but the user opens that gate.
- Push, force-push, or rebase published history.
- Create / modify GitHub releases or issues without confirmation.
- Delete files under `failures/` or `evidence/` (Rules A + B forbid).
- Unilaterally close `OQ-NN` items — the user must agree.

---

## When you are confused

- If `docs/STATE.md` and a session log disagree, **STATE.md wins** (D-028). Then update the session log to match in a follow-up correction commit.
- If a memory tells you something but the file says otherwise, **trust the file**. Memory may be stale.
- If you cannot tell whether a decision is locked, search session logs for `D-NNN` mentions and read the chronologically latest occurrence.
