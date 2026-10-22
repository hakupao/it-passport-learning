# SDD ledger — plan: docs/phase5/PLAN_stage6_ai_sensei.md
Spec: docs/decisions/D-179-learning-features-redesign.md (+ D-181 = plan §0). Branch stage6-sensei-a from main bc57a2a.
Roles: implementer oh-my-claudecode:executor (opus); task reviewer feature-dev:code-reviewer (opus); Phase-end Rule D pr-review-toolkit:code-reviewer (opus).
Task A1: complete (71ab7c3, spike PASS, evidence spike_S131.md §3).

## Pre-flight scan (Phase A)
| pair / task | produces → consumes | finding | ruling |
|---|---|---|---|
| A2 → A4/A5 | KeySettings, keyStore → panel, /sensei page | consistent | — |
| A2 csp.spec vs A5 | A2 e2e lists `/sensei`, page only exists after A5 | conflict | Ruling: A2's csp.spec covers existing pages; A5 appends `/sensei` to the list — cost if wrong: none |
| A3 errors | `toSenseiError(e)` must scrub the key but has no key param | self-inconsistent | Ruling: `toSenseiError(e: unknown, apiKey?: string)` — cost: signature tweak |
| A3 transport header test | header lives in createAnthropic, test injects fake model | self-inconsistent | Ruling: `createSenseiModel(apiKey, fetchImpl?)` tested with a fake fetch capturing headers; transport takes optional `deps: { streamText?, createModel? }` for tests — cost: small |
| A3 → A4 | useSensei, questionAnchor, threadStore → QuizSet entry | consistent | — |
| A4/A5 | both edit messages/*.json Sensei ns | sequential, fine | — |
| A4 e2e fake stream | cross-origin fetch to api.anthropic.com under page.route | fulfill must answer OPTIONS preflight and send CORS headers (access-control-allow-origin/headers) | told to implementer |
| A5 "测试 / e2e" | vitest is node env (no DOM) | UI assertions only possible in e2e | Ruling: A5 tests are e2e; navItems gets a unit test — cost: none |
| A2 nextConfig test | importing next.config.ts in vitest | should be fine (plain object export) | implementer verifies |
| A6 | prod e2e + real-key check | real key via D-182 file-driven script, not user | — |
Task A2: dispatched (BASE bc57a2a, implementer executor opus).
Task A2: implementer DONE_WITH_CONCERNS 0558036 (concerns = observations: delete btn only when saved; onChange fires on mount; KeySettings e2e deferred to A5; csp.spec fails on prod until deploy — expected). Task review dispatched (feature-dev:code-reviewer opus).
Task A2: review Approved (0 Critical / 0 Important / 6 Minor).
Ruling: park A2 Minors M1 (React.FormEvent deprecated → SyntheticEvent), M3 (mask keys < 8 chars as "…"), M4 (saveSenseiKey returns boolean; keep draft + show failure on write error) into the Task A5 dispatch, which mounts KeySettings and adds its e2e — why: same file, A5 adds the interaction e2e that covers them — cost if wrong: small UX polish lands one task later.
Ruling: M2 (Next TS 71007 onChange on "use client" entry) = noise as long as callers are client components; A5 must pass onChange only from client components — cost: none.
Ruling: M5 csp coverage (ja only / post-networkidle) + M6 (csp.spec fails on prod until deployed) → A6 runs prod e2e AFTER the deploy completes — cost: none.
Task A2: complete (0558036).
Task A3: dispatched (BASE 0558036).
Task A3: implementer DONE_WITH_CONCERNS f935fc9.
Ruling: A3 concerns 1 (no saveFailed surface) + 2 (hasKey not refreshed after same-tab save) → Task A4 extends useSensei with `saveFailed: boolean` and `refreshKey(): void` (A4 owns the panel that needs them) — cost if wrong: A3 interface grows one task later.
Ruling: concern 3 (missing key reported as kind "auth") acceptable; A4 distinguishes via hasKey. Concern 4 (locale helpers from quizModel, not reader.ts which imports node:fs) correct — reader.ts cannot enter a client bundle.
Task A3: review Needs fixes — I1 in-flight reply saved into wrong thread after anchor switch (useChat recreates Chat without stopping old; onFinish via latest closure). Minors M2 streamed error objects, M3 save-on-error, M4 choice not in thread identity, M5 orphan msg keys, M6 slow retry tests; cost note: 「なぜ」 escalates first turn to high.
Ruling: escalation ignored on the first user turn of a thread (always low); shouldEscalate decides from the 2nd user turn — why: §0-1 「平时 low」 + A1 cost basis; the 「なぜ」 entry is the default first turn — cost if wrong: weaker first answer for a confused learner, one follow-up away from high.
Ruling: M3 keep (preserves the learner's question, RF3). M4 → A4 builds anchorId `<qid>:<choice|"reveal">` (§0-4 new anchor = new thread). M2/M5/M6 fixed in round 1.
Task A3: fix round 1 dispatched (resume implementer).
Task A3: fix round 1 2b4a679; scoped re-review: All addressed (1 new Minor: openThread writeIndex quota failure never evicts → new threads silently unsaved; OOS: clear() during streaming may be resurrected by the aborted onFinish; A→B→A fast round-trip edge race).
Ruling: carry into A4 — openThread evict-oldest + retry on writeIndex failure; clear() must not be resurrected by an aborted onFinish (guard + e2e); A→B→A race accepted (tiny, partial reply only) — cost if wrong: one lost partial reply.
Task A3: complete (f935fc9, 2b4a679).
Task A4: dispatched (BASE 2b4a679).
Task A4: implementer DONE_WITH_CONCERNS 71ac617 (local prod e2e 33/33; found + fixed prod CSP `script-src eval` violation from zod's Function probe inside the AI SDK via zod's internal global).
Ruling: add remark-gfm (tables render; §0-7's own rationale names tables; react-markdown w/o gfm prints raw pipes) — amends Global Constraint deps to react-markdown + remark-gfm + zod(direct) — cost: one small, standard dep.
Ruling: zod jitless via public `z.config({ jitless: true })` with zod as a direct dep at the SDK-resolved version (single instance), not the internal `globalThis.__zod_globalConfig` write — why: public API survives zod updates — cost: one direct dep already present transitively.
Ruling: route.fulfill can't stream (race covered by unit test), owner-only learning-body check, Stop not clicked → accepted; Rule D at Phase end may flag coverage.
Task A4: rulings follow-up dispatched (resume implementer) before task review.
Task A4: follow-up 4b5573d (remark-gfm, zod direct + z.config). Task review dispatched (BASE 2b4a679..4b5573d).
Task A4: review Approved (0 C / 0 I / 5 Minor).
Ruling (supersedes A3 R8): do NOT persist errored turns — threadChat onFinish returns early on isError (abort still saves, as the switch e2e asserts); the question already returns to the input box in-session (RF3) — why: a stored failed turn reappears after reload as an unanswered turn and is re-sent as context (tokens, confusion) — cost if wrong: the typed question is lost on reload after an error.
Ruling: A4 M2 (afterEach reads stale `fake`), M3 (openThread double-failure test name/assert), M4 (spec comment overclaims the clear race) → fixed in A5 dispatch. M5: /sensei must not load the AI SDK without zodJitless first — A5 page loads no AI SDK in Phase A (thread rows link back to their source page; no panel on /sensei until Phase C).
Task A4: complete (71ac617, 4b5573d).
Task A5: dispatched (BASE 4b5573d).
Task A5: implementer DONE 44ef58d (local e2e 36/36, /sensei JS has no AI SDK chunk).
Ruling: en name = "AI Tutor" everywhere (nav already; page/buttons said "AI Sensei") — cost: string churn only.
Ruling: refusal turns not persisted (same as error turns; a stored refusal is re-sent as context and can re-trigger refusals) — cost if wrong: refused question lost on reload.
Ruling: gamified nav horizontal scroll on phones (4th item off-screen) accepted for now; Phase-end review may revisit. Double index-write failure + rows-link-back accepted.
Task A5: rulings follow-up dispatched (resume implementer).
Task A5: follow-up b2e89d3. Task review dispatched (4b5573d..b2e89d3).
Task A5: review Approved (0 C / 0 I / 4 Minor: terminal shell nav at 390px unverified; threadsNote hardcodes 30; hash not encoded (regex-safe); how-to hint flash).
Ruling: terminal-shell 390px nav → Phase-end Rule D focus + main-context screenshot check; M2 `{max}` param and M3 comment → Phase-end fix wave if the final review agrees; M4 accepted.
Task A5: complete (44ef58d, b2e89d3).
Task A6: started — main-context gates + Phase A whole-branch Rule D (bc57a2a..b2e89d3).
Task A6: main-context gates PASS (tsc 0 / lint 0 / vitest 484 / build 0 / nft 0 / prerender ja|zh|en glossary+sensei). Main-context check: terminal shell @390px en → page scrollWidth 610 > 390 (switchers pushed off-screen) = real defect → fix wave. gamified/retro 390 OK.
Phase A Rule D (pr-review-toolkit:code-reviewer): With fixes — I1 aborted reply saved with the new question's title (reproduced), I2 terminal nav overflow @390; M1 CSP comment overclaims, M2 toSenseiError w/o key, M3 hardcoded 30, M4 e2e robustness, M5 empty "length" finish; R1 rulings not in repo, R2 tail cache breakpoint, R3 duplicate ai.
Final fix wave: d35ea04 (ai 6.0.185 single), e9afae0 (I1, I2, M1–M5, R2). Local prod e2e 45/45, unit 493.
Ruling: accept RetroMenuBar change (the new 390px e2e found the retro locale switcher at 455px — a real defect) — cost: one more file in the fix wave.
Ruling: empty "length" turn not persisted (same as error/refusal), question returns to input — cost if wrong: lost on reload.
R1: plan §0 改訂 section written by main context (docs/phase5/PLAN_stage6_ai_sensei.md) — commit after the wave.
Scoped re-review dispatched (b2e89d3..e9afae0).
Phase A re-review: All 9 addressed; NEW Important from the I2 CSS — at 390px terminal/retro nav hides the active tab (and later tabs) with no scroll hint; focus ring clipped. Retro regressed.
Ruling (deviation from the skill's one-fix-wave rule, same as Phase 3): one more small fix (scroll active link into view, scroll hint below sm, inset focus ring, e2e on active-link containment) by the same fixer; verified by main-context 390px measurement + the new e2e instead of another full re-review — why: mechanical CSS/DOM fix with its own e2e — cost if wrong: a phone-only nav glitch in non-default themes.
Main-context check 88f267e @390: 3 themes × (/en/sensei,/ja/glossary,/zh/quiz) active tab inside nav, page scrollWidth 390. Phase A code complete.

## Phase B (branch stage6-sensei-b from main fb1a420) — user go-ahead「继续」 after the D-176 pre-report
Pre-flight scan:
| pair / task | finding | ruling |
|---|---|---|
| B1 → B2 | weakTopics consumed by ReviewCard; B1 is a ~30-line pure fn | Ruling: dispatch B1+B2 to ONE implementer (two commits), one task review — why: B1 has no independent review surface — cost: none |
| B2 anchor size | 10 wrong questions × full trilingual explanation ≈ 16k tokens/anchor | Ruling: per wrong question include stem, choices, current correct answer, learner's choice (re-judged), explanation.correct + the distractor note for the learner's choice + points only (JP + UI locale) ≈ 7k tokens — cost: less detail on unrelated distractors |
| B2 anchor stability | set page record changes as the learner answers → anchor text drifts mid-thread | Ruling: review anchor is snapshotted once when the review panel opens (component state); a reopened thread later gets a fresh snapshot — cost: cache miss on reopen only |
| B2 review-specific instructions | system instruction must stay byte-stable (§0-4/5) | Ruling: review task lines (summarise tendencies, explain key terms, recommend 2–3 ONLY from listed ids with `#qid` links) live in the anchor block |
| B2 thread identity | kind "review" | Ruling: anchorId `<topic_id>:<YYYY-MM-DD local>` (one review thread per topic per day) — cost: same-day re-reviews share a thread |
| B2 auto-send once | `?review=1` | Ruling: consume the flag, then `router.replace` without it so reload never re-sends; auto-send only when the thread is empty |
| B2 topic set URL | `/[locale]/quiz?mode=topic&id=<topic_id>` | verified in quiz/page.tsx |
| B2 /sensei rows | review threads need a link back | Ruling: threadLinks gains review → topic set URL (without `review=1`) |
| B3 | gates + Rule D + push + prod e2e + real-key prod check (D-182) | — |
Task B1+B2: dispatched (BASE fb1a420).
Task B1+B2: implementer DONE_WITH_CONCERNS 48c8c8b (B1) + 5d80438 (B2); local e2e 44/44, 1 POST per click, landing loads no AI SDK.
Ruling: accept history.replaceState over router.replace (force-dynamic set page would refetch up to 217 questions).
Ruling: review anchor wrong questions capped at 5 most recent (measured ~20k tokens / ~$0.05 first turn with 10 on technology-23-63 en) — cost: fewer error patterns visible to the AI.
Ruling: accept extras (topic-set header 「AI 先生と復習する」 button w/o auto-send; in-panel #id links close panel; topicLabel param). 600 vs 300 字 → judged in the B3 real-key check.
Rulings follow-up dispatched (resume implementer).
Task B1+B2: follow-up 95fd865 (cap 5; technology-23-63 ≈8.6k ja / ≈14.8k en tokens worst case, typical 4–6k). Ruling: accept worst case (~$0.04 first turn). Task review dispatched (fb1a420..95fd865).
Task B1+B2: review Approved (0 C / 0 I / 6 Minor). Task B1+B2: complete (48c8c8b, 5d80438, 95fd865).
Ruling: park for the Phase B fix wave — M1 ReviewCard link text separator ({" "} + e2e/SSR regex), M2 ReviewLauncher disabled until `loaded`, M3 past-day review thread unreachable from its /sensei row (row link carries the thread date, e.g. `&thread=<YYYY-MM-DD>`, set page opens that thread without auto-send), M4 panel #id interception limited to question-id shape, M5 comment pinning effect order. M6 (cross-tab edge cases) documented, not fixed.
Task B3: main-context gates + Phase B whole-branch Rule D (fb1a420..95fd865).
Task B3: main-context gates PASS (tsc 0 / lint 0 / vitest 518 / build 0 / nft 0 / prerender glossary+sensei ×3).
Phase B Rule D (pr-review-toolkit:code-reviewer): With fixes — I1 unanswered pool = oldest exams by file order, id+source only (AI recommends 2009–2010 questions it knows nothing about); m1 ?review=1 auto-sends on any arrival (bookmark/copied link); m2 landing empty/intro copy misleading (ja/zh lack "per topic"; all-correct case); m3 focus after #qid lands on choice ア (accidental answer); m4 daily review threads crowd the 30 cap.
Ruling I1: rank unanswered by shared terms with the wrong questions desc → exam recency desc → id; each line carries its terms; anchor task line forbids guessing unseen content — cost: none (deterministic).
Ruling m1: click intent in sessionStorage (≤30 s) required for auto-send; without it the opener is only a suggestion chip — cost: small code.
Ruling m2: ja reviewEmpty → 「1 つの分野で 5 題以上…」 (amends the plan's verbatim string), separate all-correct string, hide intro when empty.
Ruling m3: focus the question article (tabIndex -1). Ruling m4: eviction prefers the oldest review thread.
Parked M1–M5 included. Final fix wave dispatched (fresh executor).
Phase B fix wave: 45ab5af (I1), ce69ea7 (m4), 67b2ba8 (m1–m3, M1–M5); unit 533, local e2e 53/53. Ruling: accept (a) quota path also evicts review first, (b) thread= removed from URL, (c) zh 同一领域, (e) unparseable exam ids last. Scoped re-review dispatched (95fd865..67b2ba8).
Phase B re-review: All addressed (13/13). New Minors accepted: intro now appears after load (extra ~2-line layout shift on the landing card); `thread=` accepts future dates (opens an empty thread; no send, no security impact). OOS: review-first eviction may evict a live review thread when another tab creates question threads at the cap (save then shows the failure notice) — accepted, revisit if seen.
Phase B code complete (HEAD 67b2ba8).
