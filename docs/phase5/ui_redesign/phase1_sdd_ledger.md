# SDD ledger — plan: docs/phase5/PLAN_stage7_ui.md
Spec: docs/phase5/ui_redesign/DESIGN.md (+ ADR D-189). Branch: stage7-ui (from main f37666c; docs commit 032ae93).
Ruling: work on branch `stage7-ui` in the main working tree (no separate worktree) — keeps node_modules/.env.local for build+e2e; checkpoints merge to main + push only with user consent — cost if wrong: a later branch rename/rebase, nothing lost.

## Pre-flight scan
| Pair / task | Produces → consumes | Finding |
|---|---|---|
| T1 → T8 | fidelityBaseline.ts helpers → fidelity.test | T8 needs image-hash rule too → Ruling R1 |
| T1 ↔ T13 | capture test uses QuizRichText only | T1 must not import QuizSet (T13 deletes it) → consistent with plan; carry in T1 dispatch |
| T2 → T3 → T4 | recordV1 repoint; T3 rewrites syncStore/route to v2; T4 restores client imports + deletes unused v1 fns | consistent |
| T2 → T5/T6/T9 | hash.ts fnv1a32/mulberry32 | consistent |
| T5 ↔ T6 | QuestionPool ← poolFromIndex(TodayIndex) | consistent |
| T6 → T9/T10/T11/T12 | TodayIndex, loadTodayIndex, resolveScope, loadQuestionsByIds | consistent |
| T7 ↔ T14 | ui/*.tsx re-themed in T7; T14 tokensOnly test scans components/**/*.tsx incl. ui/* | T7 must leave ui/* free of rounded-md/lg/xl/full, shadow-, dark:, hex → Ruling R2 |
| T8 ↔ T13 | T8 CSS white-space assertion on practice.module.css; QuizRichText imports quiz.module.css until T13 moves classes | assertion would fail before T13 → Ruling R3 |
| T8 ↔ T13 | ExplanationPane uses QuizFeedback (Quiz ns) until T13 moves keys to Practice | consistent |
| T7 ↔ T12 | AppShell settings link → /settings page created in T12 | temporary 404 between T7–T12, acceptable (branch only) |
| T7 ↔ T11 | APP_NAV "/" = today; root still redirects to /quiz until T11 | acceptable (branch only) |
| T9 ↔ T10 | practice/page.tsx | sequential, consistent |
| T10/T11 ↔ T13 | ReviewLauncher on topic page; reviewThreadHref → browse page; ReviewCard deleted | consistent |
| T7 messages | Shell/Nav namespaces used only by shells (grep) | consistent |
| Each task self-consistency | T1 regex vs letter indexes OK; T6 21/21/21 vs floor(rank*3/63) OK; T8 84 suspect / 22 three-point verified S132; T9/T10/T11/T12 tests vs files OK | clean |

Ruling R1: T1 exports `fieldText`, `textHash`, `imageHash`, `BaselineRow` from fidelityBaseline.ts; T8 imports them — one hashing implementation — cost if wrong: none.
Ruling R2: T7 strips `rounded-md|lg|xl|full`, `shadow-*`, `dark:*`, hex literals from all src/components/ui/*.tsx (radius → rounded-[4px] / rounded-none) so T14's tokensOnly test only has to cover the remaining components — cost if wrong: T14 finds leftovers, small.
Ruling R3: T8's white-space assertion reads the CSS module that QuizRichText actually imports (resolved from its import line), so it holds before and after T13 moves the classes — cost if wrong: none.
Task 1: implementer DONE_WITH_CONCERNS (3ae84e5); Ruling: concerns 1–3 fixed pre-review — text-node whitespace verbatim + non-stacking boundary newlines; question figure hash = basename only — cost if wrong: Task 8 false positives from wrapper whitespace, fixable in fieldText
Task 1: review Approved (0 Critical/0 Important, 8 Minor)
Task 1: minor (deferred → carry to Task 8): export plainHash + renderedImageHash from fidelityBaseline.ts and reuse them; assert pre-wrap container (plan already requires); pair choices (nested spans) have no separator in fieldText; displayed correct answer not in BaselineRow — Task 8 asserts the 解答栏 letter = correct_answer directly
Task 1: minor (deferred): &nbsp; → U+0020; fromCodePoint >0x10FFFF guard; whole-field trim hides first-line indent (per ruling); README provenance should say hashing code cf4f7a2 / renderer 032ae93
Task 1: complete (commits 032ae93..cf4f7a2, review clean)
Task 2: implementer DONE_WITH_CONCERNS (cea5d54); Ruling: accept setSetting at>=prev+1 stamping (mirrors recordAttempt; local re-set wins under clock skew) and normalized parse output — cost if wrong: one-line removal
Task 2: review Approved (0 Critical/0 Important, 7 Minor)
Task 2: complete (commits cf4f7a2..cea5d54, review clean)
Ruling: carry Task 2 minors 1/2/3/5 (cap at ≤ 8.64e15 in isTime+assertFiniteAt; examDate must be a real calendar date; numeric settings integers via Math.round in clamp + reject non-integers at parse; recordAttempt runtime src check) into Task 3 — Task 3 is the first to expose parseRecord to network input — cost if wrong: small scope creep in Task 3
Task 2: minor (deferred): TopicStat declared twice (re-export when v1 retired, Task 4); -0 vs 0 in LWW; coverage guard lacks crossSrcCollisions > 20 assertion
Task 3: implementer DONE_WITH_CONCERNS (7f32a45); Ruling: accept parseAnyRecord rejecting v1 records whose upgrade is invalid (time > 8.64e15) — fail closed instead of storing a doc that 500s later — cost if wrong: one corrupt old tab gets 400
Task 3: review Approved (0 Critical/0 HIGH, 2 MEDIUM plan/ops, 4 LOW)
Ruling: MEDIUM-1 (Checkpoint 1A e2e is mocked, never hits the new route) → fix round 1 on Task 3: vitest integration test old v1 client (syncClient + recordV1) × route handlers + fake Redis — cost if wrong: one extra test file
Ruling: MEDIUM-2 (no rollback path once v1 key stops updating) → accept per §0-3 (v1 key = frozen safety copy); rollback procedure documented in session log + told to user at the push checkpoint: before reverting, write downgradeToV1(learn:owner:v2) to learn:owner:v1; after re-deploy, merge both — cost if wrong: answers made during a rollback window invisible until a manual merge
Ruling: do NOT run a local server against the real Upstash Redis for checks — .env.local points at the production store; integration tests use the fake — cost if wrong: none
Task 3: minor (deferred): 1MB cap vs Upstash request size (log byte count?); unknown ?v silently → v1; pre-migration GET ?v=2 since varies per call (tell Task 4)
Task 3: fix round 1/5 (2 addressed, 0 open; commits 7f32a45..2185835)
Task 3: complete (commits cea5d54..2185835, review clean)
Checkpoint 1A gates: tsc 0 / lint 0 / vitest 58 files 698 tests / build exit 0 / nft IPA leak 0; local e2e quiz+learning+sensei 45/45, learning-owner 3/3 (isolated server :3100, empty Redis env)
Ruling: Checkpoint 1A Rule D = the per-task reviews of Tasks 2–3 (oh-my-claudecode:code-reviewer ≠ general-purpose implementer), no extra combined review — cost if wrong: one more review pass
Checkpoint 1A: waiting for user consent to merge stage7-ui → main and push
Checkpoint 1A: user consented; main ff to 00ec6e4 pushed; deploy success; prod anon 403 (both); prod e2e 60/60; owner 2-device check pending with user
Task 4: implementer DONE (3cd8088)
Ruling: e2e quiz.spec / learning.spec read itp:learn:v1 and fail at runtime until Task 15 rewrites them — accepted, branch-only, no push before Checkpoint 1C — cost if wrong: none (Task 15 gate)
Note for Task 5: absent v2Since for new users; page-hide flush on v1-only server may briefly store later since (self-heals on next full PUT)
Task 4: review Approved (0 Critical/0 Important, 6 Minor)
Ruling: Minor 1 (page-hide delta omits v2Since → server can store a later since) is load-bearing for Task 5's v1 migration spread → fix round 1 with Minors 2–4 (storage-event compat case, freeze v1Client literals, learning-owner.spec asserts outside route handler) — cost if wrong: one small extra round
Task 4: minor (deferred): syncClient.ts:27 long line; learning-owner.spec never run (controller runs it before Checkpoint 1C)
Note for Task 5: v2 store with no since + first stale v1 write → since = now at that event; those v1 answers get the migration spread rule
Task 4: learning-owner.spec (v2 rewrite) run by controller on isolated :3100 build of 1e014f1 → 3/3 pass (--retries=0)
Task 4: fix round 1/5 (4 addressed, 0 open; commits 3cd8088..1e014f1)
Task 4: complete (commits 00ec6e4..1e014f1, review clean)
Task 5: implementer DONE_WITH_CONCERNS (7cff757)
Ruling: dailyPlan.mistakes/due hold only their own class (classes stay exclusive, cap 30 counts class members); chumon siblings are added when Task 11 builds hrefs via expandGroups — same overflow tolerance as §0-8 — cost if wrong: a review row can show up to +3 group siblings beyond the cap
Ruling: isLeech is a flag only (no Anki-style suspension); UI shows 顽固 only where the question is listed as a mistake — cost if wrong: one-line change to isMistake && wrongInWindow >= 4
Ruling: weak-topic fill tops each topic up to 5 answered (answered + picked) before the 35/20/45 weighted draw — reading of §0-9 — cost if wrong: new-question mix shifts slightly
Ruling: TDD order (draft before tests) accepted — RED shown by removing the module + 7 mutations each caught — cost if wrong: none
Carry to Task 11: new-user baseline must call pickNew(..., { fillWeakTopics: false })
Task 5: review Approved (0 Critical, 1 Important, 7 Minor)
Ruling: I-1 (fresh list reshuffles after partial completion) violates §0-9 → fix round 1 option (a): pick from start-of-day view, n = newTarget, drop answered-today; plus M-2 (skip out-of-pool qids), M-4 (v1 spread due ≥ firstDay+1), M-5 (redundant check) — cost if wrong: none
Task 5: minor (deferred): exclusivity test recomputes only isMistake; category from topic-id prefix (implicit coupling); dailyPlan does not do the new-user baseline (Task 11 calls pickNew with fillWeakTopics:false)
For user at Checkpoint 1C: (a) with a large v1 mistake backlog the 30 cap goes entirely to mistakes, due reviews wait ~weeks; (b) same-day correct-then-wrong does not enter the mistakes book (only first daily attempt counts, DESIGN §5.4)
Task 5: fix round 1/5 (4 addressed, 0 open; commits 7cff757..b5f50a7)
Task 5: complete (commits 1e014f1..b5f50a7, review clean)
Task 6: implementer DONE_WITH_CONCERNS (d3417a3)
Ruling: buildTodayIndex takes prebuilt termCards (practiceReader calls buildTermCards) so practiceIndex.ts stays browser-safe (no node:fs via glossary→textbook reader) — cost if wrong: none
Note: TodayIndex payload ja 142.9 KB / zh 136.6 KB / en 145.7 KB vs 160 KB guard (≈18 KB headroom)
Carry to Task 9: parseScope must enforce ≤100 ids and reject a filter with neither topics nor exam (resolveScope does neither)
Task 6: review Approved (0 Critical, 1 Important, 7 Minor)
Ruling: I-1 today-page cold start parses ~32 MB for group ids → fix round 1: loadChumonRegistry (chumon_groups.json only) + loadBaseQuestions; plus narrow topicTerms to {id, term, gloss, definition} (mockup shows term → one-line definition), lcp whitespace-only → null, clamp n, server-only import, topics↔units assertion — cost if wrong: none
Task 6: minor (deferred): topicTerms counts per spelling not per card id; memo closure uses first raw locale (equivalent via toDataLang); exported quizDataRoot/textbookRoot (nft re-checked at Checkpoint 1C)
Task 6: controller build of 366068e exit 0 (server-only resolves under turbopack), nft IPA leak 0; note: no prior real server-only import existed (dictionaryReader only mentions it in a comment)
Task 6: fix round 1/5 (6 addressed, 0 open; commits d3417a3..366068e)
Task 6: complete (commits b5f50a7..366068e, review clean)
Task 6: minor (deferred): groupMap now test-only; server-only not a direct dependency (Next alias)
Task 7: implementer DONE (4b877e7); controller viewed task7-glossary.png — header matches A4 mockup (4px ink rule, site name, nav with spot underline, 日/中/EN + 設定); page bodies still old (Task 14)
Carry to Task 14: AppShell wraps content in <div id="main-content">; /sensei and /quiz lack a <main> landmark — add; metadata title still "IT パスポート 三語学習" → "ITパスポート 過去問ノート" (Task 11 or 14)
Carry to Task 15: e2e/sensei.spec.ts theme-shell tests fail until rewritten
Task 7: review Needs fixes (1 Important: BIZ UDPGothic never applies — font var classes on <body>, vars resolved on :root; 6 Minor)
Task 7: fix round 1 dispatched — classes on <html> + browser-verified computed font + e2e/fonts.spec.ts; skip-link outline ink; drop data-locale
Carry to Task 14: SenseiPanel dark: classes (follow prefers-color-scheme); recheck body 15px/1.75 on page bodies; /sensei reachable only after Task 12 settings link
Task 7: minor (deferred): locale link accessible names "English"/"中文" vs visible EN/中
Task 7: fix round 1/5 (3 addressed, 0 open; commits 4b877e7..b8df4df)
Task 7: complete (commits 366068e..b8df4df, review clean)
Task 8: implementer DONE_WITH_CONCERNS (e05cc65): fidelity 8700 renders / 243600 fields / 0 diffs; chumon 200 / 0; row4 1225 / grid2 10 / list 1665; controller viewed task8-suspect.png — book look OK
Ruling: book labels (問 N, 解説, 解答, ここがポイント, 出典) stay Japanese in all locales as in the approved A4 mockup; other UI strings localized — cost if wrong: messages-only change
Ruling: AnswerBar.tsx (解答栏) as its own component accepted (Task 9 footer) — cost if wrong: none
Carry to Task 9: mount ExplanationPane with key={q.id} if explLocale should reset per question (decide: reset to UI locale per question)
Carry to Task 13: table/code/pairs inner colours still from quiz.module.css (hex) until moved
Task 8: review Needs fixes (2 Important: book labels localized in zh/en; × rows lack sr-only result; 9 Minor)
Ruling: 共通前文 / 用語 / 正解 / 頻出度 also stay Japanese in all locales (DESIGN §3.3 / §6.2 fixed parts) — cost if wrong: messages-only
Ruling: drop PracticeQuestion `number` prop; 問 N always = sourceNumber(q) (single source; brief interface deviation) — cost if wrong: re-add a prop
Task 8: fix round 1 dispatched (I-1, I-2, M1 expand hint, M3, M5, M9, optional M2)
Task 8: minor (deferred → Task 16 N=30 audit): table cells wrap per character in narrow face; ○/× stamp may overlap first-line glyph; translation as grey 13px text; explanationTitle without 「。」 returns whole sentence when ≤30 (deviation from §0-16 literal, no corpus effect)
Task 8: fix round 1/5 (7 addressed, 0 open; commits e05cc65..70978b7)
Task 8: complete (commits b8df4df..70978b7, review clean)
Carry to Task 9: add lang="ja" on the Japanese book-label spans in zh/en; ExplanationPane aria-label should be localized (new key explanationAria); PracticeQuestion/AnswerBar take no `number` prop (sourceNumber(q)); mount ExplanationPane with key={q.id} (explLocale resets to UI locale per question)
Task 9: implementer DONE_WITH_CONCERNS (7c993ea); controller viewed task9-answered-zh.png — layout matches A4; TermChip renders as rounded pills (anti-goal) → Task 14 re-skin must fix TermChip
Ruling: interface extensions accepted (SessionAction goto, KeyContext modifier/activatable, sessionKey returns full key, SessionSummary nextHref/topics) — cost if wrong: none
Ruling: from=today kind inference accepted for now; Task 11 adds `kind=` to today hrefs and the session prefers it — cost if wrong: small
Ruling: summary must survive a reload (finished state kept in sessionStorage; summary offers 「もう一度」 to restart) instead of restarting at question 1 → fix round with review findings
Ruling: isolate the 1 s timer into its own component so the question/explanation don't re-render every second → fix round
Ruling: order=rand without seed → redirect with a random seed accepted; topic path / 分野 tag JP in all locales accepted (OQ-03, mockup)
Task 9: review Needs fixes (R-a summary lost on reload, R-b timer re-renders face; 6 Minor)
Ruling: summary score = correct / answered + 「共 N 题，已答 M 题」 line on early end (DESIGN says 正答数/题数; answered is the meaningful denominator after 終了) — cost if wrong: one string
Task 9: fix round 1 dispatched (R-a w/ run nonce + start over, R-b SessionTimer, focus to summary h1, pure applyAction, prettier, status line after loaded)
Task 9: minor (deferred): out-of-group #qid links → /practice/q (404 until Task 10); keyOf Map built twice
Task 9: fix round 1/5 (6 addressed, 0 open; commits 7c993ea..ea289d4)
Task 9: complete (commits 70978b7..ea289d4, review clean)
Task 9: minor (deferred): compile-time no-time-prop assertion only fails if both props return; same-run retry reopens previous retry group (もう一度 covers); finished groups accumulate in sessionStorage (tab-scoped)
Carry to Task 11: today hrefs add `kind=<mistakes|due|new>` (session prefers it) and `run=<dateKey>`-style nonce only if needed; links without run reopen a stored finished summary for identical ids
Task 10: implementer DONE_WITH_CONCERNS (ed4efa6); controller viewed task10-setup.png — book-like setup, no card grid
Ruling: optional props PracticeQuestion readOnly / ExplanationPane reveal accepted (anchor <qid>:reveal when unanswered) — cost if wrong: none
Ruling: run=<now> nonce on setup start / FreshLink accepted; exams newest-first; 分野 order strategy→management→technology (exam booklet order) — cost if wrong: ordering tweak
Carry to Task 14: ReviewLauncher outline/rounded Button vs square ink buttons; TermChip pill
Note: leftover local next-server PID 20816 on :3000 (controller's Checkpoint 1A server) — kill denied by auto-mode classifier; told user; use other ports
Task 10: review Approved (0 Critical/0 Important, 9 Minor)
Ruling: fix minors 1,3,4,5,6,7,8 now (setup fallback must not 500; seq order = qid; exams by gregorian; Start disabled until loaded; key on PracticeSetup; dead code; shared practiceLabels module) — cost if wrong: one small round
Ruling: topic-page payload (≤217 full questions ≈1.3 MB, same as old QuizSet) deferred — candidate for final review / Phase 4 (slim anchor input or server-built anchor) — cost if wrong: slower topic page on cold load
Ruling: mistakes/due seq = take the n most overdue, then order by question number (not oldest exams first) — cost if wrong: none
Task 10: fix round 1/5 (7 addressed, 0 open; commits ed4efa6..9637679)
Task 10: complete (commits ea289d4..9637679, review clean)
Task 10: minor (deferred): PracticeSession private CATEGORY_KEYS duplicates PRACTICE_CATEGORY_LABEL_KEYS; PracticeSetup gets both index.exams and exams
Task 11: implementer DONE_WITH_CONCERNS (7e7f4b2); controller viewed task11-seeded.png — matches A4-Home; weak-table 分野 tag looks cramped/small
Ruling: TodayTask optional fields (others, startCount, unit) + todayTasks 5th arg startPlan accepted; model "new" ↔ URL kind=fresh accepted; row count may understate group-expanded chunk (7 → 10) accepted — cost if wrong: label mismatch
Task 11: review Approved (0 Critical/0 Important, 9 Minor)
Ruling: fix M2 catTag inline-block, M5 countdown title flash + empty box, M6 catch log wording, M7 shared answered helper + Set dedupe, M8 empty href for done rows — user-visible polish, cheap — cost if wrong: none
Ruling: exam date in the past → countdown hidden, 設定 link remains (reading of "past → hidden") — cost if wrong: small UI change
Ruling: a partial baseline ends "new user" status at the first attempt (DESIGN: 新用户 = 无记录); remaining baseline not resumed — cost if wrong: user may want to finish the 20 — mention at Checkpoint 1C
Task 11: minor (deferred → Phase 5 mobile): 390px weak table squeeze; midnight-open page keeps yesterday's plan; th weight 400 vs mockup bold; PracticeSession key excludes kind
Task 11: fix round 1/5 (5 addressed, 0 open; commits 7e7f4b2..0f510bf)
Task 11: complete (commits 9637679..0f510bf, review clean)
Task 12: implementer DONE_WITH_CONCERNS (42d411b)
Ruling: mistakes book entry points = 「一覧」 link on the today page's mistakes row + next to the setup panel's 間違えた問題 scope (nav stays fixed per DESIGN §3.4) → include in fix round — cost if wrong: link placement tweak
Ruling: exam date cannot be cleared (no unset in LWW settings); clearing keeps the old date with a hint — accepted for Phase 1; candidate: add an explicit "unset" LwwValue later — cost if wrong: user can't remove a date
Ruling: settings writes only changed keys (protects other devices' newer values) — accepted
Task 12: review Needs fixes (I-1 no mistakes-book entry points [binding]; I-2 save can revert a newer synced untouched field; 7 Minor)
Task 12: fix round 1 dispatched (I-1, I-2 baseline-based change detection, M3 numberKept hint, M4 re-announce, M5 labelOf skip, M9 guards)
Ruling: overdue mistakes show the localized "today" word; future dates M/D (same as practice rows) — cost if wrong: string tweak
Task 12: minor (deferred): page open past midnight keeps old day
Task 12: fix round 1/5 (6 addressed, 0 open; commits 42d411b..41b1f6a)
Task 12: complete (commits 0f510bf..41b1f6a, review clean)
Task 12: minor (deferred): edit() doesn't cancel the 50 ms announce timer; half-typed date can be replaced by a remote sync; resync text vs save numeric compare; console.warn per recompute; 50 ms may be short for some screen readers
Task 13: implementer DONE_WITH_CONCERNS (be6b2ac)
Ruling: richText.module.css + feedback.module.css next to QuizRichText/QuizFeedback (practice.module.css must stay white-space-free per R3 test) accepted; brief's grep needs `| grep -v quiz-figures` (static image dir) accepted; removed 5 ReviewCard-only Sensei keys + updated stale Sensei copy accepted; no-JS fallback link → /practice/browse accepted — cost if wrong: none
Carry to Task 14: tokenised table/code/feedback colours changed look (th tint, code bg white, report button no red/green) — check visually
Task 13: review Approved (0 Critical/0 Important, 7 Minor)
Task 13: complete (commits 41b1f6a..be6b2ac, review clean)
Ruling: carry Task 13 minors into Task 14 (re-skin + cleanup): .dataTable td paper bg so th tint shows on the tint face; delete orphans (weakness.ts+test, quizReader QuizSet/loadQuestionSet, quizModel buildTopicNav/buildExamNav/isValidMode if test-only, splitQuestionAnchor examId, DictEntry.questions examId if unread); refresh stale comments; single exported QUESTION_ID regex used by legacyLinks/threadLinks/q page; LegacyQuizRedirect own tiny CSS; @/ import style — cost if wrong: small extra scope
Task 13: minor (deferred): well-shaped unknown topic with review/thread → 404 instead of fallback
Task 14: implementer DONE_WITH_CONCERNS (335a7a7, cf9ba1a, 7122379); controller viewed glossary-list + sensei-panel screenshots — book look, TermChip now underlined spot text, square outline buttons
Ruling: removed practice.module.css th override; .termsRow position:relative (pre-existing popover anchoring bug); filterByTopic/filterByExam deleted as test-only — accepted — cost if wrong: none
Task 14: minor (deferred): Mermaid SVG figures carry their own pale-purple fills (data, Phase 3); term popover can cover the footer answer bar near page bottom; disabled ink button at 50% opacity looks grey
Task 14: review Approved (0 Critical/0 Important, 7 Minor)
Ruling: fix round 1 for M1 (extend tokensOnly additively), M2 (hex regex anchor-safe), M4 (disabled button token states, no alpha colours), M5 (KeySettings class) — cost if wrong: none
Ruling: panel sm buttons 32px vs practice nav 44px accepted
Carry to Task 15: e2e/quiz.spec.ts still describes deleted QuizBrowser/QuizSet — rewrite as practice.spec
Task 14: minor (deferred): prose kbd shadows var unmapped (raw <kbd> not rendered); SenseiHome max-w-3xl vs 760px; long comment lines
Task 14: fix round 1/5 (4 addressed, 0 open; commits 7122379..3f7e134)
Task 14: complete (commits be6b2ac..3f7e134, review clean)
Task 14: minor (deferred): tokensOnly misses rounded-4xl / rounded-[8px], oklch/color-mix, ring/outline/fill red-green, `6px !important` false positive; ghost/link disabled still opacity-50 (unused)
Task 16 prep: Rule A audit ids selected by controller (seed 20261023, mulberry32, 5 per category × 6 = 30: figure/table/chumon[2nd+ members]/choice_figures/suspect/points3) → .superpowers/sdd/PLAN_stage7_ui/audit_ids.json
Task 15: implementer DONE (f20ad17): local main suite 74/74 ×2 (--retries=0), owner set 4 + sensei owner 1, keyed full run 79; no app bugs
Ruling: Checkpoint 1C runs the keyed full suite (79) locally; prod expected 74 (owner-only cases excluded by config) — cost if wrong: none
Ruling: "v1 client PUT to the real route" stays covered by v1ClientCompat.test.ts (e2e can't be hermetic with empty Redis) — accepted
Task 15: minor (deferred): no e2e for 390px overflow (mobile later, D-183); today.spec request.get("/ja") lacks a 200 assertion
Task 15: review Approved (0 Critical, 1 Important: legacy "nothing sent" assertions vacuous; 8 Minor); reviewer reproduced 72 non-owner + fonts locally
Ruling: fix round 1 for I-1 + M1 (guards everywhere), M2 (390px no-hscroll check; failures reported not fixed), M3 (keys in AI input don't answer), M4 (/practice/q records nothing), M5 (key 3), M6 (en smoke), M8 (helpers) — cost if wrong: none
Ruling: M7 midnight edge accepted
Note: DESIGN §4 text still says review=1 → today page; deviation (a) approved in D-190 — controller adds a pointer in DESIGN at closeout
Ruling: a mid-authoring selector mistake in a new test (fixed before commit) is not a step-level failed attempt → no failures/ archive needed — cost if wrong: none
Task 16 Step 1: Rule A audit attempt 1 FAIL (q059 ja/zh row4 overflow) — archived failures/phase5/stage_07_ui/task16_audit_attempt_1.md (730e621); OQ-08 registered (2024r06-q081 two tables merged, pre-existing)
Ruling: fix = row4 requires no non-CJK unbreakable run ≥ 6 code points + CSS min-width:0/overflow-wrap:anywhere safety net; evidence = full 2900×ja/zh browser overflow scan (stronger than re-sampling) + q059 re-shot — dispatched to the Task 8 implementer — cost if wrong: some short-ASCII choices move from row4 to list
Task 15: fix round 1/5 (7 addressed, 1 open — M3 test vacuous: keys after answering Q1 are no-ops and ←→ returns to Q1; fix: press [ArrowRight, 1, 4] so a leak would land on unanswered Q2, verify by temporarily removing the guard; commits f20ad17..d3a2388) — round 2 queued until the Task 8 overflow fix (which rebuilds .next) finishes
Task 16 Rule A attempt 2 fix: ffccf12 (row4 1225→1140, list 1665→1750; 5800-page scan 0 overflowing choice cells, negative control flags q059; 21 questions with horizontally scrolling stem tables) — scoped review dispatched
Task 15: fix round 2/5 (1 addressed, 0 open; commits ffccf12..85bedda)
Task 15: complete (commits 3f7e134..85bedda excl. ffccf12 which is the Rule A fix, review clean)
Task 16 Rule A attempt 2: review says NOT PASS (scan ran with the overflow-wrap safety net on → can't detect; 7 row4 questions break mid-word with it off; ~300 chumon faces not actually rendered) — archived failures/phase5/stage_07_ui/task16_audit_attempt_2.md
Ruling: attempt 3 = width-estimate row4 rule (ASCII .55em, other non-CJK 1em, pair key badge width, U+FFE0–FFEE non-CJK, kinsoku punctuation joins runs) + list layout whenever the translation is shown; criterion = safety-net-OFF full scan row4 overflow 0 incl. paged chumon members — cost if wrong: more questions fall back to list (acceptable, book-like)
Task 16 Rule A attempt 3: 30d65ca (width-estimate row4 ≤3.55em, list while translation shown; row4 1101 / list 1789 / grid2 10; net-off scan ja/zh/zh-tr/en-tr × 2900 faces, overflow 0; negative control positive) — independent review dispatched
Task 16 Step 1: Rule A attempt 3 PASS (independent reviewer net-off rescan); evidence committed; OQ-09 registered. Deferred to final-review fix wave: estimator ASCII kinsoku (, . ) ! ? %), threshold test precision toBe(3.55)
Task 16 Step 2: final whole-branch review dispatched (oh-my-claudecode:code-reviewer opus, package review-00ec6e4..de57a91.diff, triage of deferred minors). Next after it: ONE fix wave (incl. estimator ASCII kinsoku + threshold test precision) → one scoped re-review → gates → ask user consent to merge stage7-ui → main + push (Checkpoint 1C) → prod e2e (expect 81) → user trial → STATE/log → RETROSPECTIVE_stage7_ui draft
Final review: With fixes (0 Critical; Important: topic page payload 2.32 MB raw / 706 KB gzip [ledger's 1.3 MB was wrong] → Phase 2 first item; OQ-09 cheap fix; summary nextHref before load). Deferred-minor triage recorded in the review.
Ruling: one fix wave per final-fix-brief.md (items 1–7); OQ-09 implemented as an isolated revertible commit, user asked to confirm closing it at the push checkpoint; topic payload deferred to Phase 2 — cost if wrong: OQ-09 layout reverts with one commit
Final fix wave: b30dc15 (items 1,2,3,5,6,7) + 2e7f293 (isolated OQ-09: row4 1101→751, list 1789→2139); unit 982, e2e 81 / keyed 86, ports freed; scoped re-review dispatched incl. ≤2-line measurement of the 751 row4
Final fix wave re-review: all 7 items ADDRESSED (tsc 0 / 982 unit / lint 0 / build 0 / nft 0; e2e 81/86 from implementer). OQ-09 measurement on 751 row4 (839 faces rendered): >2 lines 10 questions, orphan last line 122 questions (16%); text-wrap: balance experiment → orphans 200→1 choices
Ruling: OQ-09 stays OPEN (not proposed for closing); follow-up = glyph-count line capacity + text-wrap: balance, offered to the user (before push or after trial); final fix wave closed per SDD (no second wave) — residual LOWs (Date.now() per render, pairs total-width semantics) deferred — cost if wrong: orphans visible on 16% of row4 screens until the follow-up
Checkpoint 1C: waiting for user consent to merge stage7-ui → main and push
