# Phase 3 PLAN — 教科书阅读体 (B 学习站) on top of Phase 2 components

> Derived from **D-101** (Phase 3 形态锁) + round-2 4Q LD-1~LD-4 (Session 49 Turn 5 close).
>
> Phase 3 builds a continuous reading trunk at `/[locale]/book` on top of the frozen Phase 2 α-private app. Zero API/middleware/AI-prompt changes; all backend infrastructure reused. Composition-level work only.

---

## 0. Round-2 4Q LDs (Session 49 Turn 5 LOCKED)

In-source LD pattern per D-094 §2.1 + D-080 v1.1 §8. NOT D-NNN-worthy individually — implementation patterns of locked D-101.

| LD | Decision | Rationale |
|---|---|---|
| **LD-1** | NavTabs 保留 4-tab (Book + Chat + Quiz + Glossary + LocaleSwitcher) — chat/quiz/glossary "视觉降级" (smaller / 二级色调) | OQ-A choice; preserves Phase 2 routes as escape-hatch + book-internal jump targets; doesn't break existing user habit; Book tab visually 主体 per "book is the main body" requirement |
| **LD-2** | Inline trigger UI = **章末固定区** (chat + quiz scoped to chapter) + **selection toolbar** (translate-only ja → zh/en) | OQ-B + sub-clarification: 章末区 is always-visible main interaction surface (问本章 + 测本章); selection toolbar is opt-in helper (select text → inline toolbar with 「译中」「译英」 buttons only, NO chat/quiz buttons there). Matches "Notion / Safari" selection mental model. |
| **LD-3** | 章节完成 criterion = **scroll-to-end gate + 「我看完了」按钮 commit** | OQ-C choice. progressStore.chapters[NN].completedAt 写入时机 = 用户主动 click. scroll-to-end is gate (button disabled until scrollY hits bottom; prevents "挑快滚下去就算"). Manual commit avoids false-positive completion. |
| **LD-4** | 3-step plan granularity: Step 1 Reader / Step 2 Inline triggers / Step 3 Progress + Phase 3 close & RETROSPECTIVE_phase3.md | OQ-D choice. Total wall ~7-12h. 比 Phase 2 (15 step) ceremony 轻很多；但 Tier 3 evidence 每 step 仍 ~30 min. Risk: Step 1 + Step 2 单步较重，Rule B 中途 abort 时 incomplete state 较大 — mitigated by 每 step 内有 commit checkpoint. |

---

## 1. Step 路线 (3 step / ~7-12h)

| Step | Topic | Output | Evidence | Wall (est) |
|---|---|---|---|---|
| **1** Reader 壳 | NavTabs 重构 (LD-1) + chapter 路由 (`/[locale]/book/chapter/NN`) + `ChapterReader` 组件 (章内连续 page 渲染) + `BookIndex` (16-chapter TOC) + `/[locale]` redirect → `/[locale]/book` | `apps/web/src/app/[locale]/book/{page.tsx, chapter/[nn]/page.tsx}` + `apps/web/src/components/{NavTabs.tsx (refactor), BookIndex.tsx, ChapterReader.tsx}` + `apps/web/messages/{ja,zh,en}.json` (+Book.* keys) + vitest cases for new components | `step_01_reader/{tree_outline.md, build_log.txt, test_results.txt, design_notes.md, deploy_log.txt, smoke_ui_<ts>.md, screenshots/*.png}` | ~3-5h |
| **2** Inline triggers | 章末区 (LD-2 chat + quiz buttons scoped to current chapter — reuse existing `<QuizExplain />` modal + `<Chat />` UI / wrap as smaller modal) + selection toolbar (new `<SelectionToolbar.tsx>` listening for `selectionchange` → buttons 「译中」「译英」 → opens `<ParagraphTranslate.tsx>` modal calling `/api/chat` with translate prompt) | `apps/web/src/components/{ChapterEndPanel.tsx, SelectionToolbar.tsx, ParagraphTranslate.tsx}` + `apps/web/src/lib/book/translatePrompt.ts` (compose translate prompt for /api/chat) + vitest cases | `step_02_triggers/{...}` | ~2-4h |
| **3** Progress + Phase 3 close | `progressStore.ts` (LD-3 schema: chapters[NN].{scrollY, completedAt} + quiz[qid].{lastAnswered, correct}) + 「我看完了」 button on ChapterReader (LD-3 gate via scroll observer) + progress visualization on `BookIndex` (X/16 章完成度 + per-chapter % bar) + Vercel prod deploy + Playwright e2e smoke + `RETROSPECTIVE_phase3.md` per Rule C + Phase 3 tag candidate (`phase3-α-ship-YYYY-MM-DD` if user gates "freeze and tag") | `apps/web/src/lib/book/progressStore.ts` + `progressStore.test.ts` + `BookIndex.tsx` updates + `ChapterReader.tsx` "我看完了" button + Vercel deploy + Playwright + RETROSPECTIVE | `step_03_progress/{...}` + RETROSPECTIVE_phase3.md | ~2-3h |

**Phase 3 total adjusted**: ~7-12h. Range driven by selection toolbar UX complexity (Step 2) + Playwright e2e re-validation (Step 3).

---

## 2. Evidence 落点 (Tier 3, Phase 1+2 同构)

- `evidence/phase3/step_NN_*/` per step with: tree_outline.md / build_log.txt / test_results.txt / design_notes.md / smoke_ui_<ts>.md / screenshots/*.png / cache_audit_YYYY-MM-DD.md (if 真 LLM smoke)
- `evidence/phase3/tripwire_log.md` Phase 2 同名文件 carry forward — Phase 3 append-only
- `failures/step_NN_attempt_X.md` per Rule B (only when failed attempt occurs)
- `RETROSPECTIVE_phase3.md` at repo root per Rule C, at Phase 3 close
- Per-step Vercel deploy log if deploy happens

---

## 3. 节奏 / 评审 (per Q4=d 自适应)

- **D-019 §3a slow-pace** continues for any new design sub-topic during 实施阶段 (e.g., if Step 2 surfaces a new architectural decision)
- **Per-step Tier 3 evidence** mandatory: tree_outline + build_log + test_results + design_notes minimum
- **D-094 §2.1 mid-step amendment** preserved — in-source LD pattern for non-architectural decisions
- **Module retrospect at Phase 3 close** per Rule C (RETROSPECTIVE_phase3.md, ~45-60 min write)
- **Writer ≠ Reviewer** per Rule D — Playwright + axe-core + Lighthouse (Phase 2 toolchain reuse) act as reviewers

---

## 4. 锁定关联 ADR

| ADR | Phase 3 disposition |
|---|---|
| **D-085 §2.1** (Chat surface) | Reused; Chat behavior unchanged; just composition / placement varies |
| **D-085 §2.2** (localStorage Resume) | Pattern extended via new `progressStore.ts` (separate file from `historyStore.ts`) |
| **D-085 §2.4** (3 surfaces locked) | Phase 3 honours D-085 §2.4 — chat/quiz/glossary stay as locked surfaces, gain new book-context entry points |
| **D-088 §2.3 + D-095 §2.3** (stable-prefix invariant) | Preserved — Phase 3 reuses /api/chat for paragraph-translate; AI prompts append translation request but SYSTEM_INSTRUCTION stays byte-identical |
| **D-088 §2.4** (1-retry + per-locale error) | Preserved untouched |
| **D-091 §2.5(β)** (cache-hit tripwire) | Preserved; Phase 3 fresh β data on paragraph-translate calls |
| **D-094 §2.1** (in-source LD amendment) | This PLAN uses §0 LD-1~LD-4 pattern |
| **D-097** (Basic Auth firewall) | Untouched — Phase 3 routes inherit |
| **D-099** (next-intl chrome) | Untouched — LocaleSwitcher decoupled from content body per D-101 §2.3 |
| **D-100 + LD-11** (Upstash cap counter) | Untouched — paragraph-translate calls go through same cap.ts |
| **D-101** (Phase 3 form 锁) | This PLAN derives from |

---

## 5. Amendment / Tripwire (per D-091 §2.5 cascade)

- **γ wall-drift tripwire**: 16 data points carried from Phase 2 close. Phase 3 will add 3 (one per step). D-094 §2.4 mid-retro pattern continues: PLAN.md inline `actual ~N min` amend per step; Module-level re-estimate only if N=3 data points show >50% drift consistently.
- **β cache-hit tripwire**: N=14 cumulative final from Phase 2. Phase 3 fresh data on paragraph-translate (new surface; prompt body varies per paragraph so cache hit may be lower than Phase 2 96-99% baseline; corpus + SYSTEM prefix still cached). Expect ≥50% hit (threshold) given prefix reuse.
- **δ runtime detector**: LIVE on prod via `apps/web/src/lib/ai/tripwire.ts` from Phase 2 — preserved.
- **ε model release / pricing change**: no DeepSeek / Anthropic announcement on radar.
- **α model deprecation**: D-095 §2.5 mirror tripwire — no fire.

---

## 6. Out of scope (推 Phase 4 / 后续 backlog)

- **Phase 4 (AI 学习助手)** — 形态 deferred until Phase 3 实施反馈; per D-101 §2.6 顺序 = 先 3 再 4
- **Custom domain** — D-092 §3 backlog
- **β graduation queue** from `RETROSPECTIVE_phase2.md` §2.1-§2.6: R1 empty-delta hard fix / `[cap-wall]` real-prod / `meta-description` SEO 1-line / Vercel logs CLI workaround / PHASE2_CAP_MODE β choice / custom domain — all still β-deferred
- **Adaptive recommendation** (错题再来 / 薄弱章节加强) — D-101 rejected alternative #11; Phase 4 territory
- **Phase 5 (cert-extractor 通用化)** — D-083 §3.1 unchanged
- **Phase 6+ (multi-user + monetization)** — D-083 §3.5 unchanged

---

## 7. STATUS

- ✅ 设计阶段 round-1 4Q ✅ LOCKED Session 49 Turn 3 → D-101 LOCKED Turn 4
- ✅ 设计阶段 round-2 4Q ✅ LOCKED Session 49 Turn 5 → LD-1~LD-4 in §0
- ⏸ **实施阶段 gate pending user explicit "开始 Phase 3 Step 1" signal** per CLAUDE.md "Phase/stage signaling" (no executable code until user opens 实施阶段)
- 0 step DONE / 3 step pending
- Phase 1 + Phase 2 ✅ FROZEN unchanged — tags immutable; D-101 additive
