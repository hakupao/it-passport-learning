# SDD ledger — plan: docs/phase5/PLAN_stage6_learning.md
Spec: docs/decisions/D-179-learning-features-redesign.md (+ D-180 = plan §0)
Scope of this run: Phase 1 = Task 1–6 (D-180: 1 Phase = 1 unit). Phase 2+ not in this run.
Branch: stage6-phase1 (from main 8619f87). Ruling: implement on a local branch in place (not a worktree) and fast-forward main at Phase end, then push — the repo's practice is commits on main + push per unit (user-approved), and gitignored data/ip trees needed by dev/build live only in this checkout — cost if wrong: none beyond a branch to delete.
Ruling: all subagents run model=opus — user memory "All subagents on opus, never inherit Fable" overrides the skill's cheap-model guidance — cost if wrong: higher token spend.
Ruling: Rule D mapping — implementer = oh-my-claudecode:executor; task reviewer = feature-dev:code-reviewer; final whole-branch review (= Phase 1 Rule D) = pr-review-toolkit:code-reviewer — writer ≠ reviewer types — cost if wrong: none.

## Pre-flight scan
| Pair / task | Produces → consumes | Finding |
|---|---|---|
| T1 ↔ T4 | T1 deletes glossary/page.tsx + GlossaryList ns → T4 recreates page + `Glossary` ns | consistent (404 between commits is acceptable; was 500) |
| T1 ↔ T6 | T1 deletes e2e/glossary.spec.ts → T6 writes new one | consistent |
| T2 → T3 | buildDictionary(index, units, Pick<QuizQuestion,…>[]) ← loadBaseQuestions(): QuizQuestion[] | compatible |
| T2 → T4 | buildListGroups / DictListGroup ← GlossaryList | consistent |
| T2 → T5 | DictSense.term: UnitTerm (figure.svg_path) ← TermDetail | consistent |
| T3 → T4/T5 | loadDictionary() | consistent |
| T4 ↔ T5 | both add next.config trace for both glossary routes (T4 does both) | consistent |
| T1 self | keeps escalation/historyStore/tutorHistoryStore; deletes src/lib/ai whole | consistent with D-180 (escalation is in lib/tutor) |
| T2 self | tests use measured values (機能要件 units) | ok |
| T3 self | 1395 / 22 / 999 match main-context measurement | ok |
| T4 self | filterItems exported from client component file | ok |
| T5 self | `isValidTermId` location unspecified | Ruling: export it from src/lib/glossary/termId.ts next to termId — one home for the id format — cost if wrong: trivial move |
| T6 self | push + prod e2e + cold-start are controller/user-gated side effects | Ruling: T6 implementer writes e2e spec + runs local gates only; controller runs final review, ff-merge, push, prod checks — cost if wrong: none |

## Progress
Task 1: dispatched (BASE 8619f87, implementer oh-my-claudecode:executor opus)
Task 1: implementer DONE_WITH_CONCERNS (9145779); Ruling: historical comments mentioning _fixtures/ThemedPage and middleware.test sample paths (/chat, /api/chat) stay — comments describe history, middleware is prefix-generic so sample paths still test real behavior — cost if wrong: cosmetic
Task 1: minor (deferred): middleware.test.ts:55,57 sample paths /chat etc. — covered by earlier Ruling (kept)
Task 1: minor (deferred): RetroMenuBar.tsx:25 stale key cast lists chat/tutor — Ruling: fold into Task 4 dispatch (Task 4 already edits messages/nav-adjacent i18n) — cost if wrong: trivial
Task 1: minor (deferred): lib/chat/historyStore.ts:25 duplicate StorageLike — Ruling: fold into Task 9 (learning record uses StorageLike) — cost if wrong: two identical interfaces for a while
Task 1: minor (deferred): messages Nav.chat/tutor/book/bookLockedTooltip unused — Ruling: fold into Task 4 dispatch — cost if wrong: dead i18n keys
Task 1: complete (commits 8619f87..9145779, review clean)
Task 2: dispatched (BASE 9145779)
Task 2: implementer DONE_WITH_CONCERNS (0756226). Ruling: dictionary.ts imports reader.ts values (node:fs) → client components may only `import type` from dictionary.ts; any client-side pure helper (e.g. filterItems) lives in the component file — carry into Task 4/7 dispatch — cost if wrong: client bundle error caught by build.
Ruling: empty zh/en fields fall back to JP — same as reader.ts localized() — cost if wrong: JP shown where blank.
Task 2: minor (deferred): DictEntry.term stores first-seen form, not NFC key — Ruling: fold into Task 3 (set term to NFC key) — cost if wrong: none
Task 2: minor (deferred): buildListGroups drops entries whose topic is absent from buildNav — Ruling: Task 3 corpus test asserts sum(list items) === entries.length on the real corpus — cost if wrong: an unlisted entry only reachable by URL
Task 2: minor (deferred): termId multibyte not cross-checked vs reference fnv — Ruling: fold into Task 3 — cost if wrong: none
Task 2: minor (deferred): same headword twice in one unit → duplicate sense — Ruling: parked; real corpus has none (Task 3 corpus count 22 multi-sense pins it) — cost if wrong: duplicate block on one page
Task 2: complete (commits 9145779..0756226, review clean)
Task 3: dispatched (BASE 0756226)
Task 3: implementer DONE (a95dafd); extra: loadAllQuestions now reuses loadBaseQuestions (reviewer to judge)
Task 3: minor (deferred): ??= memo caches rejected promises (pre-existing quizReader pattern) — Ruling: parked, consistent with existing loaders; final review may triage — cost if wrong: a transient fs error sticks for one lambda lifetime
Task 3: minor (deferred): loadReaderIndex called twice inside loadDictionary — parked (dictionary memoized)
Task 3: minor (deferred): loadBaseQuestions shares objects with loadAllQuestions; JSDoc "do not mutate" suggested — parked for final review
Task 3: complete (commits 0756226..a95dafd, review clean)
Task 4: dispatched (BASE a95dafd)
Task 4: implementer DONE (e8fc739); extras: NFKC in filterItems, no metadata description
Task 4: minor (deferred): GlossaryList.ssr.test.ts:2 header cites QuizFeedback test instead of QuizRichText — cosmetic, parked
Task 4: minor (deferred): GlossaryList passes locale to Link explicitly while TextbookToc doesn't — both correct, parked
Task 4: complete (commits a95dafd..e8fc739, review clean)
Task 5: dispatched (BASE e8fc739)
Task 5: implementer DONE_WITH_CONCERNS (b4a5d02). Ruling: anchors #termId / #questionId have no targets until Phase 2 Task 7/8 — planned order, links still open the right page — cost if wrong: no scroll until Phase 2
Task 5: minor (deferred): TermDetail per-sense fields lack JP fallback that list card has — Ruling: fold into Task 6 (export dictionary field() and use it) — cost if wrong: none (corpus has 0 empty fields today)
Task 5: minor (deferred): no automated 404/200 test for the [termId] route (Review Focus #2) — Ruling: fold into Task 6 — page-level test for notFound on ../x + unknown id, and e2e covers special-char term 200 + invalid 404
Task 5: minor (deferred): fullwidth （） around count on en page — parked, same as UnitReader
Task 5: complete (commits e8fc739..b4a5d02, review clean)
Task 6: dispatched (BASE b4a5d02) — code part only (e2e + Task 5 follow-ups + local gates); controller owns Rule D, push, prod checks, STATE
Task 6: implementer DONE (638aa46); gates all green locally, e2e 9/9 local prod build; note: /[locale]/glossary builds as SSG (layout generateStaticParams), [termId] is dynamic
Task 6: minor (deferred): e2e click once hung on first Chromium launch; retries:1 masks it — parked, watch on prod run
Task 6: minor (deferred): /[locale]/glossary is SSG (layout generateStaticParams overrides force-dynamic) — Ruling: accept (data is static; SSG is faster); cold-start measurement uses dynamic [termId] route — cost if wrong: list page needs a redeploy to pick up data changes (same as every data change today)
Task 6: minor (deferred): e2e hard-codes 2 senses for 機能要件 — intentional snapshot, parked
Task 6: complete (commits b4a5d02..638aa46, review clean)
Final review: dispatched (8619f87..638aa46, pr-review-toolkit:code-reviewer opus = Phase 1 Rule D)
Final review: With fixes — 0 Critical, 1 Important (SSG ruling false: list page is force-dynamic, re-renders per request), 6 Minor.
Ruling (supersedes the Task 6 SSG ruling, which was wrong): make /[locale]/glossary truly static (drop force-dynamic on the list page only; verify in prerender-manifest) and memoize loadReaderIndex; cold-start 3b then measures the dynamic [termId] route + confirms list is static — data is immutable per deploy — cost if wrong: list needs redeploy for data changes (already true)
Ruling: fold in Minors 1 (en plural), 2 (search all senses' zh/en), 3 (delete dead Common ns), 4 (exclude quiz sidecars from glossary traces + fix comment), 5 (delete orphans useFocusTrap, Markdown.tsx, TerminalPrompt.tsx and react-markdown dep — D-180 keeps only escalation/historyStore/tutorHistoryStore; Phase 4 restores from git), 6 (stale comments), plus e2e toBeVisible before click and corpus assertion "sense unitIds unique per entry" — one fix dispatch — cost if wrong: Phase 4 re-adds a markdown renderer
Final fix wave: dispatched (FIX_BASE 638aa46)
Final fix wave: 6aec7a4 (items 1-4,6-9) + 2715c88 (item 5). Finding: next build --turbopack ignores all per-route tracing config (incl. pre-existing textbook/quiz entries); IPA leak gate is the only real guard.
Ruling: accept quiz sidecars in glossary traces (committed public D-134 data, not IPA) and revert 2715c88 (inert config would mislead); record turbopack finding as ⑨ in session log; D-179 §9 "add per-route trace" is effectively moot under turbopack — cost if wrong: slightly larger lambda bundle
Final re-review: all 9 findings addressed (5 by ruling). Residual Minor: next.config.ts comments claim per-route tracing works — Ruling: parked; fold a comment-only correction into Phase 2 Task 7 (which edits next.config.ts) and record in session log ⑨ — cost if wrong: misleading comments for one more phase
Residual: DictListItem.termZh/termEn unused on client (RSC payload) — parked for Phase 2
