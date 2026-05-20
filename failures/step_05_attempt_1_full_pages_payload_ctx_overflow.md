# Failure archive — Step 5 attempt #1 — full-pages whole-book payload would exceed DeepSeek context

> Rule B 临界 path archive. Per Session 37 `cache_audit_2026-05-20.md` §6 sign-off note: the original assembleWholeBook full-pages design was caught **pre-deploy** via local node measurement; no deployed artifact actually failed. Archiving anyway for traceability + posterity.

| 字段 | 值 |
|---|---|
| Date | 2026-05-20 |
| Session | 37 (Step 5 batch E pre-flight) |
| Attempt | #1 — full-pages whole-book corpus + DeepSeek-chat |
| Outcome | **PREDICTED-FAIL caught pre-deploy** (no prod attempt; no $ burned) |
| Replacement | D-098 LOCKED + B-fix: assembleWholeBook → lean payload (chapters + glossary, no pages) |

---

## 1. Input

`apps/web/src/lib/data/assembleScope.ts` `assembleWholeBook` (pre-B-fix):

```ts
const pages = await ds.loadWholeBook();
const payload = {
  scope: "whole-book",
  cert_id: idx.cert_id,
  run_id: idx.run_id,
  totals: idx.totals,
  pages,           // ← Page[] = 554 pages, ~3 MB JSON
};
```

`apps/web/src/app/api/chat/route.ts` calls `assembleWholeBook(ds)` and feeds output to `streamText({ model: getModel("chat") })` where chat → DeepSeek `deepseek-chat` per D-095 §2.1 default.

---

## 2. Predicted failure

### 2.1 Local measurement (Session 37 batch E pre-flight, 2026-05-20)

```
raw pages dir bytes  : 2,605,502
index.json bytes     : 114,123
glossary.json bytes  : 317,921
sum raw bytes        : 3,037,546
approx pretty stringified bytes (×1.27): 3,857,684
chars/4 (conservative): 964,421 tokens
chars/9 (CJK measured): 428,632 tokens
```

### 2.2 Provider context limits (as known at pre-deploy)

- DeepSeek-chat (V3): 64K input per platform.deepseek.com (as understood by D-088/D-095 lock turns; Session 37 batch E post-deploy empirics suggest V3.2 deployed has 128K, but neither fits 429K-964K)
- Anthropic claude-opus-4-7 standard: 200K input (also exceeded)
- Anthropic claude-opus-4-7 1M-ctx tier: 1M input (only this fits)

### 2.3 Expected runtime outcome

3 calls of `POST /api/chat` would each hit DeepSeek with ~429K-964K token corpus → DeepSeek API returns HTTP 400 (or 413 / 422 per docs) context-exceeded error → `streamText` throws → my `buildChatSseResponse` catches via `controller.enqueue(errFrame)` and emits a single error frame.

User-facing result: SSE response with `data: {"type":"error","message":"...context exceeded..."}` then [DONE]. No money burned (request rejected pre-LLM tokenization on DeepSeek end). But $0 in vs $0 useful = wasted deploy + curl roundtrips.

---

## 3. Technical judgement

- Code compiles + tests pass + lint green (full-pages payload at test level uses 5 fake pages = ~1 KB — never hits real DeepSeek)
- Build green (Next.js doesn't know about LLM provider ctx limits at compile time)
- Failure path only triggers on real LLM call with real corpus

→ This is a class of **scope-vs-provider compatibility latent fault**: code-level green / runtime fail at first real call.

---

## 4. Business judgement

If deployed without the local measurement gate:
- 3 wasted curl roundtrips → ~$0 真 cost (DeepSeek rejects pre-tokenize)
- Wasted prod deploy ~30s build wall + alias swap
- User-facing chat completely broken — Step 5 close gate fails on smoke
- Would have triggered D-091 §2.5(β) cache-hit-rate tripwire fire (0% hit on context-exceeded errors) → false-positive cascade

**Saved cost**: ~30 min wall + cognitive context-loss + retro disruption that catching pre-deploy gave us.

---

## 5. Next attempt input (= attempt #2 = B-fix LOCKED)

### 5.1 D-098 ADR LOCKED 2026-05-20

`docs/decisions/D-098-whole-book-lean-payload.md` per Session 37 4Q user ACK `B/Modify/锁D-098/Yes原计划`.

### 5.2 Code modification

`apps/web/src/lib/data/assembleScope.ts` `assembleWholeBook` replaced:

```ts
const [idx, glossary] = await Promise.all([
  ds.loadIndex(),
  ds.loadGlossary(),
]);
const payload = {
  scope: "whole-book",
  cert_id: idx.cert_id,
  run_id: idx.run_id,
  totals: idx.totals,
  chapters: idx.chapters,            // ← was pages; now chapters
  glossary_entries: glossary.entries,// ← new; glossary inline
};
```

### 5.3 Re-measurement

```
lean contextBlock bytes      : 293,919
chars/4 conservative tok     : 73,480 (12% over 64K, but...)
chars/9 CJK measured tok     : 32,658 (0.50× 64K, fits)
Real DeepSeek inputTokens    : 92,814 (per 3-call smoke 2026-05-20)
```

Real 92,814 tokens > assumed DeepSeek 64K limit, **but empirically the deployed DeepSeek-chat accepted it cleanly** — implying the deployed model has 128K context (V3.2 upgrade, per Session 37 batch E observation). **D-098 §2.2 prediction (~58-60K) was also wrong (+55% under)** — see `cache_audit_2026-05-20.md` §4.

→ Lean payload works because: (1) deployed DeepSeek has 128K ctx not 64K, AND (2) lean fits 128K with ~28% margin. **If DeepSeek were 64K, lean would have failed too** (chars/3.17 × 293K = 92K > 64K). The save was double-deep: lean shrinks 13× AND V3.2 stretched ctx 2× — both contributing.

---

## 6. Root cause + lesson

### 6.1 Root cause

D-095 (Session 35 Turn 3) partial supersede of D-088 §2.1+§2.3 changed default provider from Anthropic to DeepSeek **without cross-checking** that the assembleWholeBook payload shape (designed in D-089 §2.3 for Opus 4.7 1M ctx) was provider-compatible with the new default (DeepSeek 64K or 128K).

**This is the same pattern as D-097 §1 lesson** (D-096 §2.3 "Vercel Password Protection Hobby tier 也有" was a memory-only assumption not docs-verified) — **second instance of "partial supersede without cross-product compat check"** in Phase 2.

### 6.2 Lesson (candidate RETROSPECTIVE v2 rule)

> Any partial-supersede ADR that changes a leg of a multi-leg compatibility surface (provider × scope × runtime × tier × ctx-limit etc.) MUST include an explicit cross-product compat check section, with at minimum a fixture-or-poc demonstration that the other legs are still satisfied at the new leg's value.

Backlog item recorded in:
- `docs/decisions/D-098-whole-book-lean-payload.md` §4.4
- `evidence/phase2/step_05_chat/cache_audit_2026-05-20.md` §5.2

### 6.3 Why caught pre-deploy

Pre-Batch-E habit: "compute the actual sizes before burning real $" — this is the project's `feedback_quality_over_cost.md` memory hard rule in practice. The user authorized `batch E` (would have committed to wasted spend), but the writer paused to local-measure first — saving the deploy.

---

## 7. Status

- ✅ Caught pre-deploy
- ✅ D-098 LOCKED and amended D-085 + D-089 §2.3
- ✅ Code modified + tests + build + lint green
- ✅ Re-deploy succeeded (preview + prod)
- ✅ 3 real LLM calls returned HTTP 200 with coherent SSE
- ✅ Cache hit rate 99.98% × 2 calls
- ✅ Empirical revision: deployed DeepSeek handles 93K (V3.2 128K ctx) — D-098 §1 conservative concern resolved
- ⚠️ chars/N heuristic content-dependency surfaced — Step 6 entry follow-up

---

**END step_05_attempt_1 — failure caught pre-deploy by local measurement habit; D-098 LOCKED + B-fix applied + N=3 real smoke ratifies fix**
