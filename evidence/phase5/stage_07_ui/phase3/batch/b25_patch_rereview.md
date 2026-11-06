# b25 B3 patch re-review — management-12-31 u01–u02 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditors' context; Rule D)
- Date: 2026-11-06 (Session 147)
- Scope: B3 wording patches for management-12-31-u01 (p01–p04) and u02 (p01–p06)
  — **10 `active`, 0 retired** (`patches/management-12-31-u0{1,2}.json`), checked against the Rule A prescriptions
  (`management-12-31-u01.ruleA.md` L1・L2 建議修; `-u02` L1・L2 建議修 — every 建議修 of the 2 files, none left unapplied; no MEDIUM in this batch)
  and the merged units `data/ip/textbook/units/management-12-31-u0{1,2}.json` (sha256 u01 `93159e4f46990310…`, u02 `8077726624afd89f…`).
- Pre-patch bases located by sha256 = `base_sha256` (all patches of a unit share one base; all match):
  u01 `b25-u01-a1/…loc.r0.json` (`2cfa374f…`), u02 `b25-u02-a2/…loc.r1.json` (`40dd0633…`; a2 loc.r0 = `76d4bdb7…` and a1 parts are not the base).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210 and the HIGH / MEDIUM / LOW definitions in the Rule A files; S147 additional types (8)(9)(10) (scratchpad `ruleA_template.md`).
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names; matched fragments ≤12 chars except en sidecar overlaps, which are project translations and are quoted as the unit's own after-span).

## 0. Method

Same as `b24_patch_rereview.md` §0 (= b22 / b21 / b20 §0), topic management-12-31 (58 questions; 290 source strings per language):

1. Application check (script): every string field of base and merged unit is walked. Each `after` must appear in its field; `before` (raw and notation-stripped) must not survive anywhere; every string that differs between base and unit (for paths present in the base) must be explained by a patch; the patches replayed in file order on the base must reproduce the unit's field exactly. Additionally each patch's `before` / `after` (bold stripped) was found verbatim in its unit's Rule A file (10/10).
2. Derived-field check from the same walk (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`) for every term and key point of the 2 units; `summary.memory_hooks_*` by suffix match.
3. D-198 (jp patches: u01 p01; u02 p01, p04): LCS, 12-char window with ≤2 substitutions with and without masking (katakana runs ≥4 and alnum masked; masked windows with <6 real chars excluded), best same-length-window bigram Dice (wDice). Sources: stem (`stem_jp_clean`, fallback `stem_jp`) + all choices of every management-12-31 question. zh / en patches: LCS against the zh / en translation sidecars of all 58 topic questions, whole patched field before → after and the `after` span alone. Plus a per-choice + stem LCS (before → after) of the patches against the focus questions: u01 p01–p03 × 2012h24a-q051, 2012h24h-q037, 2010h22a-q039, 2018h30a-q053, 2025r07-q052, 2025r07-q051, 2017h29h-q046, 2018h30h-q045; u01 p04 × 2012h24h-q037, 2018h30h-q042; u02 p01–p03 × 2013h25a-q038, 2024r06-q042; u02 p04–p06 × 2021r03-q038, 2026r08-q051, 2019h31h-q055, 2011h23tokubetsu-q042.
4. D-195 / D-200 via validate; `validate --part <base>` for comparison.
5. Manual reading of each patched field in context (whole term: one / detail / analogy / hook / points / fig nodes + captions; overview rows; key_points); meaning judged against the cited / quiz questions' `correct_answer` and their zh / en sidecars (b18 u05 M1 type) and the S147 types (8) analogy key word = another term's role, (9) cue applied to a cited scenario picks a wrong option, (10) closed enumeration dropping members.
6. `scripts/textbook-v2-validate.mjs --unit` / `scripts/textbook-v2-parity.mjs --unit` per unit; `npx vitest run src/lib/textbook`.
7. D-205 primary source re-probe for u02 p04–p06: `curl -sI https://www.meti.go.jp/policy/netsecurity/downloadfiles/sys-kansa-2023r.pdf` → `HTTP/2 403` (text/html), 2026-11-06 — same as the auditor's O2.

Scripts: scratchpad `b25rr/check.mjs`, `b25rr/d198.mjs`, `b25rr/focus2.mjs` (adapted from the b24 re-review scripts; only unit IDs / part paths / topic / focus questions changed), `b24rr/q.cjs` (question reader, unchanged).

Not established: as in b14–b24, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: u01 138, u02 133) were checked for the derived copies (step 2) and for the patched texts.

## 1. Script results (fresh, 2026-11-06)

```
✓ management-12-31-u01 unit: 0 issues   validate EXIT=0 | ✓ parity: 31 locations, 0 diff  EXIT=0
✓ management-12-31-u02 unit: 0 issues   validate EXIT=0 | ✓ parity: 28 locations, 0 diff  EXIT=0
validate --part (bases): ✓ u01 part loc#0: 0 issues | ✓ u02 part loc#1: 0 issues
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

Application: 10/10 `before` occur exactly once in the base field; 10/10 `after` present in their fields; replay of the patches in file order on the base reproduces every patched field exactly (2/2 units). Unexplained base → unit diffs in base-present paths: 0 per unit (changed paths u01 4, u02 6 = exactly the patched fields, one patch per field; only the `stage` meta key removed, as in b19–b24; `round` / `jp_round` are non-string meta keys of the part). `before` remnants: 0. `check.mjs` "ruleA verbatim miss": [] for both units.

Derived fields follow: u01 p04 → `terms[4].explanation_en` (= stripped detail_en: "…how far the audited department 被監査部門 has progressed…", as the Rule A L2 prescribed); u02 p04–p06 → `terms[0].explanation_jp / _zh / _en`. The analogies (u01 p01–p03) and the 考点 text (u02 p01–p03) have no derived copy. Full walk: `definition / explanation / memory_hook` = notation-stripped `one / detail / hook`, and `summary.key_points_*` = stripped `key_points_*` — u01 60, u02 69 checked (129), 0 mismatches. `summary.memory_hooks_*`: u01 2 / u02 5 entries per language for the terms that have a hook (u01 terms[4], [6]; u02 terms[0], [2], [3], [5], [6]) — every entry ends with one term's `memory_hook_*` and every hook appears, 3 languages (the index-aligned check of the script reports u02 [2]/[3] only because terms[1] has no hook; no hook was patched). en `auditee` left in u01: 0.

Notation counts (bold, `[[jp:]]`), before → after, every patched field: unchanged in 10 of 10 (u01 `terms[4].detail_en` bold 3 → 3 / `[[jp:]]` 3 → 3 — `[[jp:被監査部門]]` kept on the new **audited department**; u02 `terms[6].points[0].text_zh / _en` `[[jp:フォローアップ]]` 1 → 1; u02 `terms[0].detail_*` bold 3 → 3). Parity 0 diff.

D-198, before → after (one script):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest overlap of the `after` span | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| u01 p01 | **jp** | 2012h24h-q037 エ (wrong) | 5 → 5 (関係のない, unchanged part 関係のない別の先生) | される (3) | 0 / 0 → 0 / 0; 0.11 → 0.15 |
| u01 p02 | zh | 2010h22a-q039 ア (correct) → 2012h24h-q037 エ (wrong) | 3 → **6** | **没有利害关系 (6)** (obs. 1) | — |
| u01 p03 | en | 2018h30h-q042 stem | 16 → 16 (unchanged part " the evaluation ") | " the evaluation " (16, unchanged words) | — |
| u01 p04 | en | 2015h27h-q039 イ (correct) | 28 → 28 (unchanged part " based on the audit evidence") | " the audited department " (24, term translation; obs. 2) | — |
| u02 p01 | **jp** | **2013h25a-q038 エ (correct) → 2019h31h-q055 stem** | **8 (実施状況を把握し) → 7 (フォローアップ = term)** | フォローアップ (7, term) | 0 / 0 → 0 / 0; **0.57 → 0.27** |
| u02 p02 | zh | **2013h25a-q038 エ (correct) → 2009h21h-q044 stem** | **8 → 4** | 审计人员 (4, term) | — |
| u02 p03 | en | 2012h24h-q047 stem | 19 → 15 | "ed and evaluate" (15, generic) | — |
| u02 p04 | **jp** | 2011h23tokubetsu-q042 エ (correct) | 4 → 4 (予備調査 = term) | 予備調査 (4, term) | 0 / 0 → 0 / 0; 0.21 → 0.22 |
| u02 p05 | zh | 2022r04-q053 stem | 6 → 6 (unchanged part 的评价与结论) | 实施 (2) | — |
| u02 p06 | en | 2022r04-q053 stem | 27 → 27 (unchanged part, term "evaluation and conclusion") | " the preliminary " (17, term) | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52) as a sentence-frame copy; jp 12-char windows: 0 / 0 before and after in all 3 jp patches. u02 p01–p03 do what L1 asked: the follow-up 考点 no longer restates 2013h25a-q038 correct エ (jp wDice 0.57 → 0.27, field LCS vs エ jp 8 → 6 / zh 8 → 4; Rule A predicted Dice 0.27 max — reproduced).

Per-choice check (LCS before → after vs each choice; `focus2.mjs`):
- 2012h24a-q051 (correct ウ = own-department auditor violates independence; エ internal audit department is not a violation): u01 p01–p03 ≤1 jp / ≤1 zh vs every choice; en ≤6 ("ation ", generic) alike for all four — the analogy's wording moves toward no choice.
- 2012h24h-q037 (report recipient, correct ウ = the requester; wrong エ = a third party with no interest in the auditee): u01 p01 jp vs エ 2 → 3; **p02 zh vs エ 0 → 6 (没有利害关系)**; p03 en vs エ 5 → 5 (" the ") — en "has no stake" avoids the sidecar's "no interest" (obs. 1). u01 p04 en vs イ / エ 12 → 24 / 11 → 23 (" the audited department", the term translation; obs. 2).
- 2010h22a-q039 (correct ア not involved), 2018h30a-q053 (correct イ accounting-dept member), 2025r07-q052 (correct ア uninvolved administrative leader), 2025r07-q051 (correct エ organisation under top management), 2017h29h-q046 (correct エ internal audit department), 2018h30h-q045 (correct ア independence): u01 p01–p03 ≤3 jp / ≤1 zh vs every choice; en ≤12 (" evaluation " vs q046 wrong ウ 12 → 12 and correct エ 11 → 11 — unchanged word).
- 2018h30h-q042 (correct ア improvement plan by the audited department): u01 p04 en vs stem 12 → 24 (" the audited department " = the sidecar's own rendering of 被監査部門) — now the same term as the stem and as the unit's fig.
- 2013h25a-q038 (correct エ = ascertain improvement status and evaluate results; wrong ア carry out / イ approve / ウ decide and plan): u02 p01 jp vs エ 8 → 6 (果を評価する), vs ア / イ / ウ 2 → 2; zh vs エ 8 → 4, others 2 → 2; en vs エ 13 → 13 (" and evaluate", generic), vs ア 14 → 14 / イ・ウ 12 → 12 (" improvement(s)" — unchanged word).
- 2024r06-q042 (correct イ = a, d; c instructing the department is wrong): u02 p01–p03 vs the item stem 8 → 3 jp / 7 → 4 zh / 14 → 14 en (" improvements ").
- 2021r03-q038 / 2026r08-q051 / 2019h31h-q055 / 2011h23tokubetsu-q042: u02 p04–p06 overlaps are the stage names (予備調査 4, 評価結論 4, " preliminary " 12–13) and " the audit " (en 11, from the new opening "Carrying out the audit" — generic); no choice's frame.

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01–p03 | `terms[4](システム監査人).analogy_jp / _zh / _en` (2nd clause) | L1 建議修 | **Yes** (§3.1) | No (obs. 1) | OK |
| u01 | p04 | `terms[4].detail_en` (+ explanation_en) | L2 建議修 | Yes: "the department that was audited (the **auditee** …)" → "the **audited department** [[jp:被監査部門]]" = fig node "Audited department makes improvements" / step 3 caption "audited department"; 0 "auditee" left in the unit | No (obs. 2) | OK |
| u02 | p01–p03 | `terms[6](フォローアップ).points[0].text_jp / _zh / _en` | L1 建議修 (D-198 near-restatement) | **Yes** (§3.2) | No | OK |
| u02 | p04–p06 | `terms[0](システム監査計画).detail_jp / _zh / _en` 2nd sentence (+ explanation) | L2 建議修 (D-205) | **Yes** (§3.3) | No (obs. 3, 4) | OK |

## 3. Focused checks

### 3.1 u01 p01–p03 (L1) — auditor independence analogy

- After (whole field): 「自分のクラスのテストを自分で採点せず、関係のない別の先生に採点してもらうのと同じで、採点される側と利害のない人だからこそ公正に評価できます。」 / zh 「…而是请一位无关的其他老师来批改一样，正因为与被评分的一方没有利害关系，才能公正地评估。」 / en "It is like having your class's test graded not by you but by an unrelated teacher; because the grader has no stake in the results, the evaluation can be fair." (= auditor's L1 text verbatim, 3/3; 1 sentence each, unchanged).
- Outsider vs no-stake: the closing reason is now "no interest in the side being graded / no stake in the results" — independence from the audit target, not membership outside the organisation. The image (another teacher of the same school) and the reason now say the same thing: inside the organisation is allowed, involvement is not. This agrees with `one_jp` (監査対象から独立した立場), `points[0]` (監査対象の業務から離れた立場の者を充てる), `hook` (自分の仕事を自分で見張っても監査にならない) and `terms[3].points[1]` (内部監査でも監査対象の業務から独立した部署が担う).
- Internal auditors remain possible — type (9) on every independence question: 2012h24a-q051 → the own information-systems department's auditor has a stake (is the graded side) → ウ (correct); the internal audit department's auditor (エ) has none → not a violation; external CPA / consultant (ア / イ) also not violations. 2018h30a-q053 → the development-team member and the QA member who evaluates that system have a stake → excluded; the accounting-department member → イ (correct). 2025r07-q052 → the uninvolved administrative leader ア (correct), not the PM or the contractor's staff. 2025r07-q051 → エ (correct), not the operator, the developer-contractor or the user. 2010h22a-q039 → ア (correct); the consultant guiding the operation (エ) has a stake. 2017h29h-q046 → エ (correct, internal audit). Before the patch the en "outsider" could read toward excluding internal auditors (q051 エ side); after it, no question is answered differently except in the right direction.
- Type (8): 利害 / stake is no headword of u01 and names no role another term defines (u01 headwords: 会計監査・業務監査・情報セキュリティ監査・システム監査・システム監査人・システム監査基準・リスクアプローチ). Type (9) on 2012h24h-q037: the analogy describes who grades (= the auditor), q037 asks who receives the report; `points[1]` states the report goes to the requester (経営者) → ウ. The zh wording shares 没有利害关系 with q037's wrong エ (a third party as recipient) — obs. 1, LOW record. **L1 resolved.**

### 3.2 u02 p01–p03 (L1) — follow-up 考点 vs 2013h25a-q038

- After: 「フォローアップでは、提案した改善がどこまで進んだかを監査人が確かめ、成果を評価する。」 / zh 「在跟进（[[jp:フォローアップ]]）中，审计人员确认所提出的改善进展到了什么程度，并评价其成效。」 / en "In the follow-up ([[jp:フォローアップ]]), the auditor checks how far the proposed improvements have progressed and evaluates what they have achieved." (= auditor's text verbatim, 3/3).
- D-198: the 3-char-difference restatement of q038 correct エ is gone (jp LCS 8 → 6, wDice 0.57 → 0.27; zh 8 → 4; 12-char windows 0 / 0).
- Meaning vs q038 (internal audit; which improvement activity the auditor carries out): the point still says the auditor confirms progress and evaluates the outcome → correct エ. 「提案した改善」 makes clear that the auditor proposed, not that the auditor carries out (ア), approves (イ) or decides / plans (ウ) — those stay with the audited department (`key_points_jp[3]`, `terms[4]` fig step 3 in u01). 成果を評価する keeps エ's evaluation of results. vs 2024r06-q042: supports d (monitoring the status of improvements); 確かめ is not instructing (c, wrong). Consistent with `one_jp` (どこまで実行されたかを監査人が確かめ), `detail_jp` 2nd sentence (改善の進み具合を把握し…評価) and u01 `terms[4].fig` step 4 (改善がどこまで進んだかを確かめ). zh 成效 / en "what they have achieved" = 成果. Sentence count 1 → 1; qids kept. **L1 resolved.**

### 3.3 u02 p04–p06 (L2, D-205) — 「例えば」 on the audit-phase enumeration

- After: 「実施の段階は、例えば、対象の概要をつかむ**予備調査**、証拠を本格的に集める**本調査**、その結果から意見を固める**評価・結論**に分けて進める。」 / zh 「实施阶段例如可以分为把握对象概况的**预备调查**、…」 / en "Carrying out the audit can be split, for example, into the **preliminary investigation**, …" (= auditor's text verbatim, 3/3; patch spans are the changed fragments, the replay reproduces the whole field).
- Correct: the closed claim 「に分かれる」 / 分为 / "is divided into" is replaced by an example of how the fieldwork can be split, in all three languages. This matches the conditional framing of the newest cited question 2026r08-q051 (R8: "when the audit is split into plan / preliminary / main / evaluation-conclusion") and does not contradict 2019h31h-q055, which uses a different division (plan / evidence / procedures / report / follow-up) — with 「例えば」 both are possible. 2021r03-q038 (correct イ = plan + preliminary / main / evaluation-conclusion) and 2011h23tokubetsu-q042 (preliminary before main) are still answered by the unchanged stage names, `points[1]` and the fig. en "fieldwork" (which hardly includes evaluation-conclusion) is gone ("Carrying out the audit").
- Sufficient: D-205 asks not to assert the structure of a revised document without a version. The unit never names the standard for this division; the only sentence that asserted a closed division is now open. Adding the current (R5-revision) structure would need the primary source, which is still 403 (re-probed 2026-11-06, §0-7), so not adding content is the right call under the S138 §6 division of labour; the secondary-source chapter list cannot be written in as fact. The remaining sequence statements — `terms[0].fig` (計画 → 予備調査 → 本調査 → 評価・結論 → 報告 → フォローアップ), `key_points_jp[0]` and `terms[0].points[1]` — describe the flow of an audit in the words the IT Passport questions use (R8 included), do not claim "the standard divides into", and are not closed membership lists of a legal / standard category (type (10) n/a) → obs. 3, LOW record only. Type (9): applied to 2026r08-q051 the detail still picks エ (評価・結論 = forming the opinion from the results). **L2 resolved.**

## 4. Observations

No F-fix (no 建議修) from this re-review.

Records only, no fix:

1. LOW, u01 p02 (zh): the new reason clause 与被评分的一方没有利害关系 shares 没有利害关系 (6) with the zh sidecar of 2012h24h-q037 wrong エ (a third party with no interest in the auditee, as report recipient); jp 利害のない (vs 利害関係のない, LCS 3) and en "has no stake" (vs the sidecar's "no interest") do not. The phrase is the standard wording of independence, used for the grader (the auditor), not for a report recipient, and `points[1]` names the requester as recipient → q037 ウ; no move toward a wrong choice in the questions the analogy is about (§3.1). Auditor's prescribed text.
2. LOW, u01 p04 (en): " the audited department " (24) equals the sidecar rendering of 被監査部門 in 2012h24h-q037 イ / エ and 2018h30h-q042 stem — it is the term's translation, now identical to the unit's own fig node and caption (the purpose of L2).
3. LOW, u02 p04–p06 (D-205 residual): the 4-stage fieldwork sequence still appears without a hedge as the fig flow, `key_points_jp[0]` and `terms[0].points[1]`; these are process descriptions in the questions' own terms (consistent with 2021r03-q038 / 2026r08-q051 correct answers), not statements about the standard's structure. If the METI primary source becomes reachable, a later pass can check the R5-revision wording; no change now.
4. LOW, u02 p04 (jp style): 「実施の段階は、例えば、…に分けて進める」 — the topic 段階 is not the agent of 分けて進める (reads slightly loose); zh 可以分为 / en "can be split" are clean. Meaning unaffected. Auditor's prescribed text.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: none in scope; **0 introduced**
- LOW introduced: 建議修 0; 記録のみ 4 (obs. 1–4)
- Application 10/10 exact (replay), 10/10 = the Rule A prescribed text, derived fields follow (129 checked + summary.memory_hooks suffix 21, 0 mismatch), 0 unexplained base → unit diffs
- D-198: 0 jp windows before / after in all 3 jp patches; u02 p01–p03 break the 2013h25a-q038 エ restatement (jp wDice 0.57 → 0.27, LCS 8 → 6; zh 8 → 4); zh after-spans ≤6 chars (obs. 1 generic phrase), en after-spans ≤24 chars, all unchanged words, term translations or generic phrases, none from a wrong choice's frame
- validate 2/2 = 0 issues, parity 2/2 = 0 diff (31 / 28 locations), vitest textbook 162/162

**PASS** — all 10 active patches of management-12-31 u01–u02 are applied exactly (replay reproduces every patched field, derived fields follow, no other base-present path changed) and each is the auditor's prescribed text. The システム監査人 analogy now grounds fairness in having no stake in the graded side rather than in being an outsider, so internal auditors stay eligible and every independence question (2012h24a-q051, 2018h30a-q053, 2025r07-q051 / q052, 2010h22a-q039, 2017h29h-q046) is answered correctly by the image; the follow-up 考点 no longer restates 2013h25a-q038 エ yet still selects it; the audit-phase division is opened with 「例えば」 in three languages, which is correct and sufficient under D-205 given that the METI primary source is still 403 and no unverified current-standard content may be added. No new HIGH / MEDIUM.
