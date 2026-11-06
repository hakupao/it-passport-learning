# b36 B3 patch re-review — strategy-07-24 u01 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audit, and I share no context with them (Rule D)
- Date: 2026-11-07 (Session 149)
- Scope: B3 wording patches for strategy-07-24-u01 p01–p04. That is **4 `active`, 0 retired** (`patches/strategy-07-24-u01.json`), all zh / en and no jp.
  Each patch was checked against the Rule A prescriptions in `strategy-07-24-u01.ruleA.md`: L1 建議修 (p01 zh, p02 en) and L2 建議修 (p03 fig label zh, p04 caption zh). Nothing was left out.
  The Rule A file reports HIGH 0 / MEDIUM 0 / LOW 6 (建議修 2).
  The patches were also checked against the merged unit `data/ip/textbook/units/strategy-07-24-u01.json` (sha256 `aefa6633982286ae…`).
- Pre-patch base: `b36-u01-a2/strategy-07-24-u01.loc.r0.json`. Its sha256 `9aa749f4da246f66…` = `base_sha256` for all 4 patches (recomputed).
- Severities: D-195 / D-198 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210 / D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below; questions are given as qid + paraphrase. Strings shown are unit text, patch text or term names. Matched fragments are ≤12 chars; the zh ones are project translations.

## 0. Method

Same as `b35_patch_rereview.md` §0, for loc-part patches only (no unit-level patch). Topic strategy-07-24 has 38 questions and 190 source strings per language.

1. **Application check** (`b36rr/check.mjs`, run unchanged): `after` present; `before` occurs once in the base; replay in file order = unit field; no `before` remnant anywhere in the unit (raw and stripped); every changed base-present path is explained; before / after appear verbatim in the Rule A file.
2. **Derived fields and `summary.memory_hooks_*`** (in check.mjs).
3. **D-198** (`b36rr/d198b.mjs`): whole-field LCS before → after, and `after`-span LCS against the 190 sources per language.
   Per-choice and stem LCS before → after (`b36rr/focus.mjs`, new) against:
   - p01 / p02: 2019r01a-q016, 2016h28a-q014, 2011h23a-q025
   - p03 / p04: 2009h21h-q003, 2013h25a-q017, 2010h22a-q020, 2011h23a-q025, 2017h29h-q018
4. **Manual reading** of each patched field in context. For RFI: the whole term, `pairs[0].rows[3]`, `detail_*` and the qids. For RFP: the whole fig, plus every zh use of 提出 / 发出 in the unit.
5. **Gates**:
   - `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`
   - `scripts/textbook-v2-parity.mjs --unit`
   - `scripts/textbook-v2-patch.mjs --unit … --list`
   - `npx vitest run src/lib/textbook`
   - `node --test scripts/textbook-v2-patch.test.mjs`

**Not established** (as in b14–b35): the unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only two things: the patches are present and correct in context, and nothing but the patches changed in base-present paths. The 100 unit-only paths were checked for derived copies and `before` remnants. No law text is touched.

## 1. Script results (fresh, 2026-11-07)

```
sha256 loc.r0 = 9aa749f4da246f66951beff83e20dd3e9219b10654aaa02652c069ab318ba0f8 = base_sha256 ×4
✓ strategy-07-24-u01 unit: 0 issues   validate EXIT=0 | ✓ parity: 22 locations, 0 diff  EXIT=0
✓ strategy-07-24-u01 part loc#0: 0 issues (validate --part, EXIT=0)
patch --list: p01–p04 active, base 9aa749f4da24…
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: 14 pass, 0 fail
check.mjs: active 4 ok 4 issues 0; derived 39 mismatch 0; memory_hooks suffix 3 bad 0; ruleA verbatim miss []
```

**Application.**
- All 4 `before` strings occur exactly once in their base field, and all 4 `after` strings are present. Replay reproduces every patched field. Each field carries one patch.
- Changed base-present paths: 5. Four are exactly the patched fields. The fifth is the removed `stage` meta key, as in b19–b35. Unexplained diffs: 0.
- `before` remnants: 0.
- Rule A verbatim: 4 / 4 match the prescribed text exactly.

**Derived fields.** 39 derived strings, 0 mismatch. None of the patched fields (points / fig label / caption) has a derived copy. The `summary.memory_hooks_*` suffix check is 3 / 3 ok.

**Notation.** bold / `[[jp:]]` counts are unchanged in all 4 fields: p01 keeps `[[jp:RFI]]`, and the others have 0.

D-198, before → after (`d198b.mjs`):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest `after`-span overlap |
|---|---|---|---|---|
| p01 | zh | 2016h28a-q014 stem | 6 → 6 (RFI的目的, unchanged part) | 委托对象 (4), 2011h23a-q025 ウ (correct, RFP); already in the before |
| p02 | en | 2013h25a-q017 ア | 16 → 16 ("the purpose of a", unchanged part) | " feasibility " (13), already in the before |
| p03 | zh | 2011h23a-q025 stem | 4 → 5 (发出RFP) | 发出RFP (5): the project zh stem's verb for issuing an RFP (obs. 2) |
| p04 | zh | 2009h21h-q003 イ* → 2010h22a-q020 エ | 6 → 6 | 向供应商发出 (6) = 2010h22a-q020 エ (wrong); §3.2 |

None of the after-spans approaches the calibration HIGH. No jp text is patched, so the jp 12-char windows are unchanged (Rule A: 0 masked / 0 unmasked).

Per-choice check (LCS before → after; `focus.mjs`):
- **2019r01a-q016** (RFI purpose; correct イ, wrong エ = decide the contractor from proposals) × p01 / p02:
  - zh: all ≤2, flat (エ 2 → 2).
  - en: エ 5 → 7 (" vendor", one common noun), イ* 13 → 13.
  - The patch moves the wording away from エ's meaning (§3.1) without adding any decision word.
- **2016h28a-q014** (RFI purpose; correct イ = judge whether a vendor can be entrusted) × p01 / p02:
  - zh: ≤2, flat.
  - en: every item 5 → 7 (" vendor"), the noun only.
- **2011h23a-q025** (RFP purpose; correct ウ = select the best contractor from proposals; wrong イ = narrow the candidates by vendor ability, which is the RFI side) × p01 / p02:
  - zh: ウ* 4 → 4 (委托对象, unchanged); イ 2 → 2.
  - en: イ 6 → 8 / ウ* 4 → 8 (" vendors").
  - "shortlisting" puts the narrowing on the RFI side, where it belongs (§3.1).
- **2009h21h-q003** (who gives the RFP to whom; correct イ = IS department → vendor) × p03 / p04:
  - zh イ* 6 → 4: 「向供应商提出」 is no longer reproduced, while the direction (to the vendor) is kept.
- **2013h25a-q017** (RFP made by the client; correct ウ) × p04: ウ* 5 → 3.
- **2017h29h-q018** × p04: flat ≤4.
- **2010h22a-q020** (検収 = 2010h22a-q020's correct イ) × p04:
  - エ 4 → 6 (向供应商发出).
  - Every other choice is flat ≤4 (correct イ 3 → 3).
  - §3.2.

## 2. Per-patch verdict

| ID | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[0](RFI).points[0].text_zh` | L1 | Yes (§3.1) | No | OK |
| p02 | `terms[0](RFI).points[0].text_en` | L1 | Yes (§3.1) | No | OK |
| p03 | `terms[1](RFP).fig.data.nodes[1].label.zh` | L2 | Yes (§3.2) | No | OK |
| p04 | `terms[1](RFP).fig.steps[1].caption_zh` | L2 | Yes (§3.2) | No (obs. 1 record) | OK |

## 3. Focused checks

### 3.1 p01 / p02 (L1): RFI 「依頼先を見極める」

**After.**
- zh: 「…备齐判断能否实现以及筛选候选委托对象的依据。」
- en: "…so the buyer has material for judging feasibility and shortlisting vendors it could ask to do the work."
- jp is unchanged: 「実現できるかの見通しや依頼先を見極める材料をそろえる」.

**Meaning.**
- jp 見極める here means judging which vendors are fit to be asked. That is 2016h28a-q014's correct イ (whether the vendor is one you can entrust). It does not mean picking the contractor.
- The before forms read as choosing the contractor: zh 选择委托对象 and en "choosing whom to ask". That pointed toward 2019r01a-q016 エ (get proposals and decide the contractor) and toward the RFP side's 选定发包对象.
- Both afters now describe narrowing to candidates:
  - zh 筛选候选 = screening candidates.
  - en "shortlisting vendors it could ask" = candidates, not the chosen one.
- Neither after contains a decide / contract / proposal word, so neither moves toward q016 エ or ア.
- Not narrowed:
  - 「材料 / 依据 / material for」 is kept, so the RFI still supplies grounds rather than making the decision.
  - The feasibility half is unchanged.
- Not expanded: no element is added (no estimates, no proposals).
- **Shortlisting vs. 見極める.** "Shortlisting" is a little more concrete than 見極める: it narrows to a list, while 見極める judges suitability. Two things decide this, and both support the after:
  - The unit's own `pairs[0].rows[3]` already uses the same reading in all three languages: a_jp 「依頼先候補の判断」, a_zh 「判断委托对象候选」, a_en "shortlisting vendors". The point now matches pairs.
  - The question set places candidate narrowing on the RFI side. 2011h23a-q025 イ (narrow the candidates by vendor ability) is wrong for an **RFP** question because it describes the RFI. The RFI point saying "shortlisting" therefore helps reject q025 イ. RFP stays "choose the contractor" in pairs b_*, fig n4 and key_points.
- `detail_en` "which vendors are fit to take on the work" and `detail_jp` 「仕事を任せるにふさわしいベンダかを見極める」 are consistent with the after.

**Answerability.** Every cited question stays answerable:
- 2019r01a-q016 → イ (feasibility / technical issues).
- 2016h28a-q014 → イ.
- 2025r07-q013, 2022r04-q008 and 2014h26h-q007 are not affected.

**Style.**
- zh 「筛选候选委托对象」 is slightly dense (screen candidate contractors) but natural.
- en "vendors it could ask to do the work" is longer than needed but clear.
- Neither is a finding.

**Result.** L1 resolved; no new issue.

### 3.2 p03 / p04 (L2): RFP fig zh 提出 → 发出

**After.**
- label.zh: 「发出 RFP」 (jp 「RFP を示す」, en "Issue the RFP").
- caption_zh: 「向供应商发出汇总了需求和采购条件的 RFP。…」 (en "The buyer sends vendors an RFP …").

**Direction is now unambiguous.**
- 发出 means the buyer sends it out. 提出 could read as a vendor submitting.
- The zh unit now has a clean split: the buyer **发出** the RFP, and the vendor **提出提案** (`key_points_zh[0]` / `summary.key_points_zh[0]`, 「供应商则针对该文书提出提案」, unchanged and correct).
- No zh field still uses 提出 for the buyer's RFP action. 发出 also matches `goals_zh[0]` / `pairs[0].rows[0].label_zh` 「发出时机」 and the project translation layer, which writes 发出 RFP / RFI in the 2011h23a-q025 and 2016h28a-q014 zh stems.
- The three wrong-direction options cited by Rule A (2009h21h-q003, 2013h25a-q017, 2017h29h-q018, where the vendor makes or shows the RFP) lose their cue. The right answers stay answerable: q003 → イ (IS → vendor, 向供应商 kept) and q017 → ウ (client creates it).

**The 6-char after-span 「向供应商发出」 = 2010h22a-q020 エ (zh).**
- Which option: q020 asks which statement describes 検収 (acceptance inspection) toward a vendor. The correct answer is イ, checking the deliverables against the specification. エ is a **wrong** option: it describes issuing an RFI (an information request) to the vendor. ウ (requesting a system proposal) is also wrong; it describes an RFP.
- Does it hint anything? No.
  - The shared span is the generic action "send to the vendor". It carries no 検収 content.
  - The caption uses it for the RFP step of the procurement flow. Reading the fig, a learner sees that "sending something to the vendor" is a request step (RFI / RFP). That is exactly why エ and ウ are wrong for 検収.
  - The patch therefore supports rejecting エ, not choosing it. Correct イ stays flat (3 → 3), and nothing in the unit cues ア.
  - q020 is not cited by this unit. 検収 / 验收 does not appear in the unit (grep 0), so there is no 検収 statement the overlap could distort.
- Copy check (D-198):
  - The length is unchanged (before 6 = 2009h21h-q003 イ* 「向供应商提出」, after 6), so no copy risk was added.
  - It is a 6-char verb phrase made of a standard term (供应商) and a standard verb (发出). It falls under D-198's 「標準的な一般表現」.
  - The rest of the caption (汇总了需求和采购条件的 RFP / 各家供应商都根据相同的条件提案) does not track q020 エ (RFI, information collection).
- **Not MEDIUM; record only (obs. 1).**

**Result.** L2 resolved in both fields; the label and the caption agree.

## 4. Observations

There is no F-fix from this re-review. Records only:

1. LOW (p04): zh after-span 「向供应商发出」 (6) = 2010h22a-q020 エ (wrong option; it describes an RFI). It is a generic action phrase, the same length as the before's overlap with 2009h21h-q003 イ*. It gives no cue toward エ for the 検収 question, since the fig places "sending to the vendor" in the request steps (§3.2).
2. LOW (p03): label.zh 「发出 RFP」 = 5-char span of the 2011h23a-q025 zh stem. That is the project's own zh rendering of 「RFP を出す」 on an RFP-purpose stem, and the answer is not a phrase. It is not a copy.
3. Script notes (no content issue): `stage` meta was removed (as in b19–b35). `focus.mjs` is new in the scratchpad (per-choice LCS for the 4 patches).

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope (the Rule A file has MEDIUM 0); **0 introduced**
- LOW introduced: obs. 1 and obs. 2 (record only).
- **Application:** 4/4 exact (replay against loc.r0, sha256 = base_sha256). 4/4 = Rule A prescribed text verbatim. Every 建議修 is covered (L1 zh / en, L2 label / caption). Derived fields follow (39, 0 mismatch). 0 unexplained diffs, 0 `before` remnants.
- **D-198:**
  - No after-span traces a choice frame.
  - The overlap with 2009h21h-q003 イ* falls (6 → 4).
  - The only rise is 2010h22a-q020 エ (4 → 6), a generic phrase on an uncited wrong option with no cue (§3.2).
  - jp is untouched.
- **Gates:**
  - validate 0 issues, parity 0 diff (22 locations).
  - validate --part 0 issues (sha256 = base_sha256).
  - vitest textbook 162/162, patch tests 14/14.

**PASS.** All 4 active patches of strategy-07-24 u01 are applied exactly. No patch introduces a MEDIUM or HIGH, and every 建議修 is applied.
- **L1:** RFI zh 筛选候选委托对象 / en "shortlisting vendors it could ask to do the work". This keeps jp 見極める as judging candidates. It moves away from 2019r01a-q016 エ (deciding the contractor) and matches `pairs[0].rows[3]`. The meaning is neither narrowed nor expanded.
- **L2:** the zh fig now says the buyer 发出 the RFP, which separates it from the vendor's 提出提案. The 2010h22a-q020 エ overlap is a generic phrase on a wrong option and gives no cue.
