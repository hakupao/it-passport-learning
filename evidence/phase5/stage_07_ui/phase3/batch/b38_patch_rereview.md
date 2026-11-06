# b38 B3 patch re-review — strategy-07-23 u01 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audit, and I share no context with them (Rule D)
- Date: 2026-11-07 (Session 149)
- Scope: B3 wording patches for strategy-07-23-u01, p01–p15 — **15 `active`, 0 retired** (`patches/strategy-07-23-u01.json`).
  Each patch was checked against the Rule A prescriptions (`strategy-07-23-u01.ruleA.md`, 建議修 L1〜L6). Nothing left out.
  Coverage: L1 p01–p03 / L2 p04–p07 (jp = p04 + p05, two patches on the same field) / L3 p08–p10 / L4 p11–p13 / L5 p14 (en only, as prescribed; `overview.intro_en` is derived) / L6 p15 (en only, as prescribed).
  The Rule A file reports HIGH 0 / MEDIUM 0 / LOW 12 (建議修 6). Also ruled here: Rule A L7 (record only), as asked (§4).
- Merged unit `data/ip/textbook/units/strategy-07-23-u01.json` sha256 `d8cfdef952ba9596…`. The Rule A file names the pre-patch merge `6e2fed52f9dff751…`. The difference is exactly the 15 patched fields plus the removed `stage` meta key (§1).
- Pre-patch base, located by sha256 = `base_sha256`. All 15 patches share one base, and it matches:
  `data/ip/textbook/.planning/v2/strategy-07-23-u01/parts/b38-u01-a2/strategy-07-23-u01.loc.r0.json` (`45750dc1bdeab2c2…`).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208 (+ S143 addendum), D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below (qid + paraphrase only). Strings shown are unit text, patch text or term names. Matched fragments are ≤12 chars.

## 0. Method

Same as `b37_patch_rereview.md` §0 (no `unit.*` patch here). Topic strategy-07-23 has 37 questions, 185 source strings per language.

1. **Application check** (`b38rr/check.mjs`, run unchanged): `after` present; `before` once in base; replay in file order = unit field; no `before` remnant (raw and stripped) anywhere in the unit; every changed base-present path explained; before / after verbatim in the Rule A file.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`, `overview.intro_*`) and `summary.memory_hooks_*` (suffix match, in check.mjs).
3. **D-198** (`b38rr/d198b.mjs`): whole-field LCS before → after and `after`-span LCS vs 185 sources per language; jp 12-char windows (≤2 substitutions) unmasked / masked + wDice. Per-choice reading against the questions named in the Rule A findings: 2016h28h-q055 (L1); 2019h31h-q017, 2013h25a-q002, 2010h22h-q018 (L2 / L4); 2015h27a-q025, 2018h30a-q017, 2012h24h-q043, 2017h29a-q019, plus the uncited 2009h21h-q025 / 2021r03-q014 (L3); 2013h25a-q043 (L7). All re-read in `data/ip/quiz/questions.json`.
4. **Manual reading** of each patched field in context (whole term: one / detail / hook / points / fig; overview_rows; key_points; summary).
5. **New in b38 — validate warnings before / after.** The patched unit prints 3 non-blocking warnings (§1). To find their source I built scratch copies of the unit with the patches reverted (`b38rr/revert.mjs`: all 15, or one patch at a time) and ran `validate --file` on each.
6. **L7 independent ruling**: D-198 lock (S135 log l.64), D-208 + addendum (S143 log l.51 / l.57), D-209 (S144 log l.25), `docs/decisions/D-211-truefalse-general-principle-quiz-only.md`, and the precedent `strategy-07-24-u01.ruleA.md` L3 / §3.
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` / `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

Not established (as in b14–b37): the unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (91) were checked for derived copies and `before` remnants. No law text is touched.

## 1. Script results (fresh, 2026-11-07)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-07-23-u01
✓ strategy-07-23-u01 unit: 0 issues (data/ip/textbook/units/strategy-07-23-u01.json), 3 warning(s)
  warn  zh-term  terms[3](要件の合意).points[0].text_zh  要件の合意 → 需求的达成共识 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  choice-echo  terms[3](要件の合意).points[0].text_jp  2015h27a-q025 ア・イ・ウ — a negation echoing wrong option(s) of a cited question: …
  warn  choice-echo  terms[3](要件の合意).points[0].text_jp  2012h24h-q043 ア・ウ — a negation echoing wrong option(s) of a cited question: …
EXIT=0
parity --unit: ✓ 23 locations, 0 diff   EXIT=0
validate --part (loc r0): ✓ loc#0: 0 issues (sha256 45750dc1… = base_sha256)   EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: 14 pass, 0 fail
check.mjs: active 15 ok 15 issues 0; derived checked 39 mismatch []; memory_hooks suffix 3 bad []; ruleA verbatim miss []
revert (scratch): all 15 reverted → validate --file: 0 issues, 0 warnings; only p08 reverted → 0 issues, 0 warnings; only p09 or only p10 reverted → 3 warnings
```

**Application.**
- All 15 `before` strings occur exactly once in their base field; all 15 `after` present; replay in file order reproduces every patched field (the jp field of L2 carries p04 then p05, and both apply; the other 13 fields carry one patch each).
- Changed base-present paths: 14 patched fields + the removed `stage` meta key (as in b19–b37). Unexplained diffs: 0.
- `before` remnants: 0 (check.mjs `issues 0`). Whole-unit walks: 「システムが受け取り、返す」0, 「システムに組み込む」0, 「誤って解釈」0, 「合意を得る相手」0, 「就业务需求达成共识的对象」0, "is obtained from" 0, "who confirms" 0 (goals_en and intro_en).
- `check.mjs` "ruleA verbatim miss": []. 15/15 = Rule A prescribed text exactly.

**Derived fields.** 39 derived strings, 0 mismatch. p11–p13 → `terms[0].definition_*` follow ×3 (「業務ルールなど」/「业务规则等」/ "business rules, and so on"); p15 → `terms[1].definition_en` follows; p14 → `overview.intro_en` carries "whom requirements are confirmed with" (and "who confirms" = 0). `summary.memory_hooks_*` (3, one per language, only `terms[3]` has a hook) unchanged and suffix-consistent. No patched point feeds `summary.key_points_*` (they are their own text), so nothing else to follow.

**Notation.** bold / `[[jp:]]` counts unchanged in all 14 fields (check.mjs per-field lines).

**The 3 new warnings (patch-introduced, all from p08).** Rule A §1-4 reported "choice-echo warn 0" and B6 warn 0. That was right for the pre-patch unit (the full revert prints 0 warnings). p08 alone causes all three:
- **choice-echo ×2** (q025 ア・イ・ウ, q043 ア・ウ). The detector's negation token is the 「ない」 of 「欠かせない」 (indispensable), and the echoed material is the shared tail 「の責任者」 / 「部門」 that the correct option carries too. Per the D-208 addendum (each warned 考点 judged one by one) and D-209 (c) (name the traced wording, set and order, or it is low): the sentence names the correct party positively. It mentions no vendor, project lead, operator or auditor, does not refute any wrong option, and reproduces no option set or order. Nothing can be named as traced → **LOW, not (iii)**. Record only (obs. 1).
- **zh-term ×1.** B6 fires because the jp now contains the string 要件の合意 inside 「業務要件の合意で」. Here it is a phrase ("the agreement on business requirements"), not the headword used as a name, and the zh renders it naturally (「就业务需求达成共识时」). Forcing 需求的达成共识 into this clause would read worse. **LOW**, record only (obs. 2).
Both are warnings by lock text (D-208 addendum: non-blocking, exit code unchanged). They do not block this review, but they must be on record because the Rule A file's "warn 0" no longer describes the merged unit.

D-198, before → after (`d198b.mjs`):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| p01 | **jp** | 2016h28h-q055 ア (correct) | 9 → 9 (入出力データの種類, headword) | 入出力データの種類 (9, headword) | **2 / 2 → 0 / 0**; 0.45 → 0.32 |
| p02 | zh | 2016h28h-q055 ア | 10 → 9 | 输入输出数据的种类 (9, headword) | — |
| p03 | en | 2016h28h-q055 stem | 26 → 26 ("to functional requirements", unchanged part) | "the types of input" (18, headword) | — |
| p04 | **jp** | 2010h22h-q018 stem | 7 → 7 (業務要件の定義, unchanged part) | システムが (5) | **3 / 3 → 0 / 0**; 0.29 → 0.27 |
| p05 | **jp** | (same field as p04) | 7 → 7 | ルールを (4) | (same field) |
| p06 | zh | 2019h31h-q017 エ (correct) → 2012h24h-q008 stem | 8 → 7 | 的业务规则 (5, headword) | — |
| p07 | en | 2012h24h-q008 stem | 31 → 31 (" defining business requirements", unchanged) | " that the system " (17, generic) | — |
| p08 | **jp** | 2015h27a-q025 エ (correct) | 8 → 8 (利用部門の責任者, headword) | 業務要件の (5) | 0 / 0 → 0 / 0; 0.41 → 0.41 |
| p09 | zh | 2012h24h-q043 エ | 5 → 5 (部门负责人) | 达成共识 (4) | — |
| p10 | en | 2012h24h-q043 エ | 28 → 28 (" head of the user department", headword, unchanged) | same (28, headword) | — |
| p11 | **jp** | 2009h21a-q019 ウ | 6 → 6 | 業務ルール (5, headword) | 0 / 0 → 0 / 0; 0.23 → 0.25 |
| p12 | zh | 2010h22h-q018 stem | 6 → 6 | 业务流程 (4) | — |
| p13 | en | 2018h30a-q017 stem | 33 → 33 ("business requirements definition ", term name) | "es and authorit" (15) vs 2010h22h-q018 エ (unchanged list items) | — |
| p14 | en | 2016h28a-q004 stem → 2009h21h-q025 ウ | 19 → 16 | "m requirements a" (16, generic) | — |
| p15 | en | 2012h24h-q043 stem | 28 → 27 | "t the business requirements" (27, term name) | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52). The two near-copies Rule A flagged are gone: masked jp windows 2 → 0 (L1) and 3 → 0 (L2). Every remaining longest overlap is a headword or term name (入出力データの種類 / 業務ルール / 利用部門の責任者 / head of the user department) or an unchanged part of the field.

Per-choice reading:
- **2016h28h-q055** (classification: which is a functional requirement; correct ア = I/O data types; wrong イ allowable recovery time, ウ migration procedure, エ target quality + dev cost) × p01–p03: the new wording breaks the option's verb frame (システムが取り扱う…) into a question form (どんなデータを受け付け、どんなデータを返すか) and keeps only the headword. It adds nothing about recovery, migration, quality or cost, so it moves away from ア's wording without moving toward any wrong option. The reason clause (処理の中身を決める情報なので) is unchanged. D-209 (b): the classification is now stated as the headword's general role, with no option wording → not (iii).
- **2019h31h-q017** (true/false: which problem comes from a weak requirements-definition process; correct エ = misreading the business rules built into the system; wrong ア cost-benefit, イ priority, ウ vendor selection) × p04–p07: 「システムが従う」 replaces the option's 「盛り込む / 組み込む」 frame, and 「取り違えたまま」 replaces 「誤って解釈」. The principle (unclear rules → system built on a misreading) is stated in general words, D-211 (ii) / D-198 side. No wrong option is touched. zh 「误解规则」 in the 2nd sentence is unpatched and was not prescribed (zh LCS vs エ 8 → 7 overall). Flat. 2013h25a-q002 (which stage should have clarified the rule; correct ア = business-requirements definition): still answered by 「業務要件の定義の段階で」 (unchanged).
- **2015h27a-q025 / 2018h30a-q017 / 2012h24h-q043** × p08–p10: see §3.2.
- **2010h22h-q018** (quiz; correct エ = procedures, responsibility, authority, etc.) × p11–p13: 「など / 等 / and so on」 restores the open list. The three items are unchanged and the wrong options (dev structure, system overview, software behaviour) are not touched.
- **p14 / p15** (en only): no question content involved. p14 fixes the subject/object of "confirm", and p15 moves the bracket so it explains "what the system does". jp / zh unchanged.

## 2. Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[1](機能要件).points[0].text_*` | L1 | Yes (§3.1) | No | OK |
| p04–p07 | `terms[0](業務要件定義).points[2].text_*` (jp = p04 + p05) | L2 | Yes (§1 per-choice): jp windows 3 → 0, verb frame of エ gone in all three languages | No | OK |
| p08–p10 | `terms[3](要件の合意).points[0].text_*` | L3 | Yes (§3.2) | Warnings (obs. 1, obs. 2) and en "The one party" (obs. 3), all LOW | OK |
| p11–p13 | `terms[0].one_*` (+ `definition_*`) | L4 | Yes: open list in all three languages; derived fields follow | No | OK |
| p14 | `goals_en[2]` (+ `overview.intro_en`) | L5 | Yes: "whom requirements are confirmed with" = jp 「誰と確認し」 = zh 「要与谁确认」; intro_en follows; "who confirms" 0 left | No | OK |
| p15 | `terms[1].one_en` (+ `definition_en`) | L6 | Yes (§3.3) | No | OK |

## 3. Focused checks

### 3.1 p01–p03 (L1) — 機能要件 point vs 2016h28h-q055

- After: jp「システムがどんなデータを受け付け、どんなデータを返すか、つまり**入出力データの種類**は、処理の中身を決める情報なので機能要件に入る。」/ zh「系统接收什么数据、返回什么数据，即**输入输出数据的种类**（…），决定了处理的内容，…」/ en "Which data the system accepts and which it returns, that is, the **types of input and output data** (…), determine what the processing does, …".
- **Away from ア, not toward a wrong option.** jp 12-char windows 2 / 2 → 0 / 0, wDice 0.45 → 0.32; the only overlap left is the headword. None of イ・ウ・エ (recovery time, migration, quality/cost) is mentioned. The classification still points to ア.
- **Consistent with the term.** 「受け付け」 matches `one_jp`「受け付けるデータ」. The en "accepts" matches `one_en` "the data it accepts". The en sentence is grammatical (plural subject "types … determine").
- 「つまり」 is plain explanatory wording, not a §9 phrase. D-200: the point is still 1 sentence and under 100 chars (jp 61).
- **Resolved.**

### 3.2 p08–p10 (L3) — 「業務要件の合意で欠かせない相手は、利用部門の責任者」

- After: jp「業務要件の合意で欠かせない相手は、新しいシステムを使う**利用部門の責任者**である。」/ zh「就业务需求达成共识时不可缺少的对象，是将要使用新系统的**用户部门负责人**（…）。」/ en "The one party whose agreement on business requirements cannot be left out is the **head of the user department** (…) that will use the new system."
- **2015h27a-q025** (the party whose agreement must be obtained; correct エ = head of the user department; wrong = old-project lead, maintenance vendor head, new dev-vendor head): 「欠かせない」 now carries the stem's "must have" (最低限欠かせない) sense, which is what Rule A asked for. It still selects エ and cues no wrong option.
- **2018h30a-q017** (correct イ = the members organise the needs heard from the sales head and staff, then agree with the sales head; wrong エ = the PM approves): the point names the user side's head. The hook (both sides bring the content together, then the users' head approves) and fig step 3 lead to イ, not エ. Unchanged by the patch.
- **2012h24h-q043** (who confirms the business requirements are met; correct エ = head of the user department): agrees.
- **one「双方が了承」/ hook / 2017h29a-q019** (requirements made clear by user side and developer side): 「欠かせない相手」 states who, from the builders' side, must agree. It does not say the builders do not agree, so it sits with 「双方が了承」 and with q019's two-sided clarification. Fig steps (users review → head approves → basis for development) and `key_points[2]` say the same.
- **New exclusive claim?** jp / zh: no. 「欠かせない / 不可缺少」 names an indispensable party and leaves others (the other stakeholders in `one`, the uncited 2009h21h-q025 / 2021r03-q014) open. This is weaker than the base's 「合意を得る相手は…である」, which Rule A rated LOW. en: "The one party … cannot be left out" says explicitly that this is the only indispensable party. jp leaves that implicit. It fits one_en, hook_en and the en fig (the head approves). It cues none of the en wrong options of q025 / q043 / q017 (all other parties), and it does not contradict 2009h21h-q025 / 2021r03-q014, whose answers are processes, not parties. So the en adds a small singular emphasis but misleads no reader → **LOW** (obs. 3), not MEDIUM. Optional follow-up: "The party whose agreement on business requirements cannot be left out is …" (drop "one").
- Validate warnings from p08: see §1 (2 choice-echo = LOW false positives on 「欠かせない」; 1 zh-term = LOW).
- **Resolved** (jp and zh fully. en carries the L3 meaning, with obs. 3).

### 3.3 p15 (L6) — en bracket move

- After: "define **what the system does** (the data it accepts, the processing it performs, and the screens and reports it outputs) to meet the business requirements."
- The bracket now follows "what the system does", which is the jp structure (システムが**何をするか** (受け付けるデータ、…)). It can no longer be read as explaining "business requirements". `definition_en` follows. bold 2 → 2, `[[jp:]]` 1 → 1. zh was already in jp order.
- **Resolved.**

## 4. L7 independent ruling — 2013h25a-q043 order in `terms[0].points[0]` and the figure: **LOW (keep, record only). No F-fix.**

What the unit states: `terms[0].points[0]` (kind `exam`, qids = [2013h25a-q043]) says requirements are clarified in the order 業務要件 → システム要件 → ソフトウェア要件, starting from the side closest to the business. `terms[0].fig` (flow steps 4: 現状分析 → 業務要件の定義 → システム要件定義 → ソフトウェア要件定義) shows the same order. q043 is an ordering question (which sequence clarifies the requirements; correct ア = business → system → software; wrong = the other three permutations).

**Structural difference from the precedent.** In strategy-07-24-u01 L3, the ordering question 2014h26a-q024 was challenge-only (D-211 (i) exit applied, no exam point), and only the figure carried the order. Here q043 **is** the qid of an exam point that states the correct order. So "same treatment as 07-24 L3" (the Rule A wording) is not enough on its own. The ruling has to rest on the lock texts:

1. **D-198 (S135).** (iii) is the reuse of *a specific question's* concrete material (numbers, scene, a list of examples and its order). Stating standard definitions, rules or principles in general wording is not a copy, "even if the correct option states the same principle" (正解選択肢が同じ原則を述べていても可). Business → system → software is the standard layering of requirements in the software life cycle (SLCP / 共通フレーム), not an order q043 chose. Other topic questions use the same layering, e.g. 2009h21h-q025 ウ (system then software requirements), and any IT Passport text gives the same order.
2. **Wording.** The point does not take the option's wording. ア lists 「業務要件の定義 / システム要件定義 / ソフトウェア要件定義」 as procedures separated by commas. The point names the three requirement layers (業務要件 / システム要件 / ソフトウェア要件) with arrows and adds the reason (業務に近い側から). The 12-char windows are 0 (Rule A §1-4, my d198b on this field unchanged). The figure's node labels match the option items more closely, but they are the standard process names and come with captions that explain each step, which q043 does not have.
3. **D-209 (c) (S144).** Calling it (iii) requires naming the traced wording, set and order. Only the set and order can be named, and both are the field's standard layers (the order *is* the principle being taught). That is the D-198 standard-principle side, not choice tracing.
4. **D-208 (a) purpose.** The point does not refute the wrong permutations (no 「〜ではない」, no 「システム要件を先に…しない」) and does not list them. It states the one correct principle positively. Choice-echo did not fire on this field (pre- and post-patch).
5. **D-211 (i)** is an exit for a general-principle answer that *cannot* be written without reproducing the question's wording, set and order (ADR §決定 1; the ADR is scoped to 正誤選択型, and q043 is an ordering question, not that type). The point was written without the option wording, so the exit is not required. For an ordering question, any exam point necessarily states the order. Forbidding that would mean such a question can never be an exam point, which no lock says.
6. **Learning goal.** goals[0] (「要件を明確にしていく順番を説明できる」) makes this order a unit objective (D-195 §2 step figure). The goals / intro phrase near q043's stem (12-char window, 2 substitutions) is a general phrase, unpatched and unchanged.

The verdict stays LOW, record only, the same as the Rule A file. The optional `kind` "exam" → "mix" in the Rule A file would only change the label and is not needed.

## 5. Observations

No F-fix from this re-review. Records only:

1. LOW (p08, new): 2 × `warn choice-echo` on `terms[3].points[0].text_jp` (2015h27a-q025 ア・イ・ウ; 2012h24h-q043 ア・ウ). Detector false positive: the negation token is the 「ない」 of 「欠かせない」, and the echo is the shared 「の責任者 / 部門」 that the correct option carries too. No wrong option is named, refuted, or listed as a set (D-208 addendum per-warn ruling, D-209 (c)). Rule A §1-4 "choice-echo warn 0" was true for the pre-patch unit and no longer describes the merged unit. The batch evidence should carry this.
2. LOW (p08, new): `warn zh-term` on `terms[3].points[0].text_zh` (要件の合意 → 需求的达成共识). B6 matches the substring inside 「業務要件の合意で」 (a phrase, not the headword used as a name). The zh 「就业务需求达成共识时」 renders it correctly. Record only.
3. LOW (p10): en "The one party … cannot be left out" makes the singular explicit, where jp 「欠かせない相手は」 leaves it implicit. It fits one_en, hook_en and the fig, and it cues no wrong option. Optional follow-up: drop "one" ("The party whose agreement on business requirements cannot be left out is …").
4. LOW, pre-existing (not patched): `overview_rows[0].extra_jp[0]`「業務の手順・役割・業務ルール」 (zh / en alike) has no 「など」. It is a short example cell in the 決めること column, not a definition bracket, and `one` now carries 「など」. Record only.
5. LOW, pre-existing (not patched, not prescribed): `terms[0].points[2].text_zh` 2nd sentence keeps 「误解规则」. Rule A L2 prescribed the zh change only for the 1st clause. The zh whole-field LCS vs q017 エ dropped 8 → 7 anyway. Record only.
6. Script notes (no content issue): `stage` meta removed (as in b19–b37); the Rule A file's unit sha `6e2fed52…` is the pre-patch merge, and the current `d8cfdef9…` differs only by the 14 patched fields + `stage`.

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope (Rule A file MEDIUM 0); **0 introduced**
- LOW introduced: obs. 1, obs. 2 (validate warnings from p08), obs. 3 (en "one"); pre-existing obs. 4, obs. 5; script notes obs. 6.
- **Application:** 15/15 exact (replay), 15/15 = Rule A prescribed text. Every 建議修 covered (L1〜L6). Derived fields follow (39, 0 mismatch; `overview.intro_en` follows p14). 0 unexplained diffs, 0 `before` remnants.
- **D-198:** masked jp windows 2 → 0 (L1) and 3 → 0 (L2); after-spans are headwords / term names only; no after-span leans toward a wrong option of q055 / q017 / q025 / q043 / q018.
- **L7 ruling:** LOW (keep, record only). D-198 standard-principle side + D-209 (c) + D-211 (i) not required. This is not the same structure as strategy-07-24-u01 L3 (exam point here, challenge-only there), but the lock texts give the same result.
- **Gates:** validate --unit 0 issues / EXIT 0 (3 non-blocking warnings, obs. 1–2), parity 23 locations 0 diff, validate --part 0 issues (sha256 = base_sha256), vitest textbook 162/162, patch tests 14/14.

**PASS.** All 15 active patches of strategy-07-23-u01 are applied exactly. No patch introduces a MEDIUM or HIGH, and every 建議修 is applied.
- L1: the I/O point keeps only the headword and moves away from q055 ア without nearing イ・ウ・エ. L2: エ's verb frame (盛り込む / 誤った解釈) is gone in all three languages.
- L3: 「欠かせない相手」 restores the "must have" sense of q025 and stays consistent with 「双方が了承」, the hook, q019, q017 and q043. jp / zh add no exclusive claim. en "The one" is a LOW singular emphasis (obs. 3).
- L4: open lists in all three languages. L5 / L6: en subject and bracket fixed, with derived fields following.
- p08's 3 validate warnings are LOW false positives and are recorded (obs. 1–2).
