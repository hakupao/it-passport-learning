# b44 B3 patch re-review — management-11-28-u01 (サービスマネジメントの基礎とサービスレベル管理, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audit, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b44rv/` (derived from `b43rv/`), not the main session's `b44rr/`.
- Date: 2026-11-07 (Session 149)
- Scope: the B3 wording patches for management-11-28-u01. **6 are `active` and 0 retired**: p01–p06 (`patches/management-11-28-u01.json`).
  I checked each patch against the Rule A prescriptions in `management-11-28-u01.ruleA.md` (Rule A PASS, HIGH 0 / MEDIUM 0, 建議修 L1–L3):
  - L1 → p01 (jp, 建議修) + p02 / p03 (zh / en, Rule A 任意 to align with one_zh / one_en)
  - L2 → p04 (zh), p05 (en)
  - L3 → p06 (en)
  Every 建議修 is covered. L4–L10 are 記録のみ and not patched; they are not re-ruled here.
- Pre-patch base, located by sha256 = `base_sha256` (shared by all 6 patches): `data/ip/textbook/.planning/v2/management-11-28-u01/parts/b44-u01-a2/management-11-28-u01.loc.r1.json` `6cbe87154c257cf3…` (`loc.r0` `915da5b6…` is not the base).
- Merged unit (current) `data/ip/textbook/units/management-11-28-u01.json` sha256 `69db886be40743fa…`. It differs from the base only by the 6 patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted beyond ≤12-char fragments and term names (qid + paraphrase otherwise). Strings shown are unit text, patch text or term names.

## 0. Method

Same as `b43_patch_rereview.md` §0. No `unit.*` patch is in this batch. Topic management-11-28 has 34 questions, so there are 170 source strings per language (stem_jp_clean + 4 choices; zh / en from translations).

1. **Application check** (`b44rv/check.mjs`): `after` present; `before` once in base; replay in file order = unit field; every changed base-present path explained; before / after verbatim in the Rule A file. Plus `b44rv/extra.mjs`: net `before` remnant count (p01–p03 are insertions whose `before` is not a substring of `after`, so raw = net here).
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` with both the b42 index pairing and the corrected hooked-terms pairing (this unit: 5 terms, hooks on terms[2..4] only).
3. **D-198** (`b44rv/d198b.mjs`, `b44rv/win.mjs`): whole-field LCS before → after, and LCS of the `after` span against the 170 sources per language. jp: 12-char windows (≤2 substitutions), unmasked / masked, + wDice. New for this batch, `b44rv/near.mjs`: **near-match** = semi-global edit distance (insert / delete / substitute) ≤2 of every 12-char window of `key_points_jp[1]` against every topic source, raw and with term names folded to 1 char (ITサービスマネジメント / ベストプラクティス / フレームワーク / ITIL), plus whole-field ed / Dice against the 2012h24h-q042 stem. Run on base and unit.
4. **Cited-question checks.** Re-read in `data/ip/quiz/questions.json` + `translations/<exam>.json` (stem_jp_clean): 2012h24h-q042 (name-the-framework, answer ウ ITIL; wrong = ISO 14001 / ISO 27001 / JIS Q 15001), 2011h23a-q040 (ITIL description, answer イ = best-practice collection systematically compiling IT service operation methods; wrong ア software package / ウ 共通フレーム-type work items / エ development model), 2021r03-q045 (answer ア; エ = PM body of knowledge), 2019r01a-q050 (answer エ ITIL), 2011h23tokubetsu-q047 (SLA description, answer ウ; wrong イ = ITSM best-practice document).
5. **Manual reading** of each patched field in context: ITIL one / points / key_points[1] / summary in three languages; SLI fig (root + children labels, step captions) and every en string containing "agreement"; all `[[jp:サービス]]` occurrences in the unit.
6. **Gates**: `textbook-v2-validate.mjs --unit` and `--part <base>`; `textbook-v2-parity.mjs --unit`; `npx vitest run src/lib/textbook`; `node --test scripts/textbook-v2-patch.test.mjs`. Plus a read of `validateV2.ts` `jpOriginWarnings` / `wordAt` for the new warnings (§3.2).

**Not established** (same as b14–b43): the unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patched fields (+ derived) and `stage` differs from the base.

## 1. Script results (fresh, 2026-11-07)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit management-11-28-u01
✓ management-11-28-u01 unit: 0 issues (data/ip/textbook/units/management-11-28-u01.json), 2 warning(s)
  warn  jp-origin  terms[1](ITIL).points[0].text_zh  サービス: headword named in text_jp without [[jp:サービス]] at its first 考点 occurrence (D-202)
  warn  jp-origin  terms[1](ITIL).points[0].text_en  サービス: headword named in text_jp without [[jp:サービス]] at its first 考点 occurrence (D-202)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit management-11-28-u01
✓ management-11-28-u01 parity: 24 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part …/b44-u01-a2/management-11-28-u01.loc.r1.json
counts {"terms":5,"figs":2,"steps":3,"points":10,"pairs":2,"key_points":4,"goals":3}
sha256 6cbe87154c257cf306a395a71777d107af7d4448b291908476a1f33ecb1cb131   (= base_sha256)
✓ management-11-28-u01 part loc#1: 0 issues (…loc.r1.json)            (no warnings)
EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  active 6 ok 6 issues 0
  changed base-present paths 7 = 6 patched fields + 'stage'; unexplained besides 'stage': 0
  base-only top keys stage / round / jp_round (part metadata)
  derived checked 51, mismatch 0
  notation: key_points_*[1] bold 1→1 [[jp:]] 0→0; terms[1].points[0].text_zh/en bold 1→1 [[jp:]] 2→1 (intended removal); fig root label en 0→0
  memory_hooks suffix (b42 index pairing): 9 checked, bad jp[2] zh[2] en[2]
  memory_hooks (hooked-terms pairing): jp 3/3, zh 3/3, en 3/3, bad 0
  ruleA verbatim miss: []
extra.mjs: p01–p06 net remnant 0; Rule A has before and after verbatim for all 6
```

Notes on the output:
- **jp-origin warnings 0 → 2, introduced by p04 / p05.** The base part has none (the `--part` line has no warning suffix) and Rule A §1-10 / §6 recorded 0. They are not pre-existing. Ruled on in §3.2 (false positive of the compound-part kind, record only).
- **memory_hooks "bad"**: index shift only, the known false positive. Only terms[2..4] (SLA / SLO / SLI) have hooks, so `memory_hooks_*[2]` is SLI, not `terms[2]`. The corrected pairing is 3 / 3 clean in all three languages. No patch touches a hook.

**Application.**
- All 6 `before` strings occur exactly once in their base field, and all 6 `after` strings are present. Replay in file order reproduces every patched field (one patch per field).
- Changed base-present paths are the patched fields plus the removed `stage` meta key, as in b19–b43. Unexplained content diffs: 0. **Net `before` remnants: 0.**

**Derived fields.** 51 checked, 0 mismatch. Patched fields that feed derived copies: p01–p03 → `summary.key_points_*[1]` (all three follow: 「…を体系的に集めた…」 / 「是系统地汇集…」 / "…systematically gathering…"). `points[].text_*` and fig labels have no derived copies.

D-198, before → after (`d198b.mjs`, 170 sources per language):

| Patch | Lang | LCS before → after (nearest source) | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|
| p01 | **jp** | **33 (2012h24h-q042 stem) → 23** (2011h23tokubetsu-q047 イ; same run in q042 stem) | ベストプラクティスを (10, term + を) | 65 / 0 → 58 / 0; 0.68 → 0.63 |
| p02 | zh | 14 → 14 (2012h24h-q042 stem, unchanged part) | IT服务管理最佳实践的框架 (13, term chain, unchanged part) | — |
| p03 | en | 41 → 41 (2011h23tokubetsu-q047 イ, unchanged part " best practices for it service management") | " systematically " (16; 2011h23a-q040 イ correct) | — |
| p04 | zh | 8 → 9 (2011h23a-q040 イ correct) | 运维管理IT服务的 (9) | — |
| p05 | en | 28 → 29 (2011h23a-q040 イ correct) | "ing and managing it services." (29; +1 = the period) | — |
| p06 | en | 10 → 10 | "a document" (10, generic; 2011h23tokubetsu-q047 イ) | — |

## 2. Per-patch verdict

| Patch | Field | Rule A item | (a) Applied / derived | (b) Resolves finding, no new HIGH / MEDIUM | Verdict |
|---|---|---|---|---|---|
| p01 | `key_points_jp[1]` | L1 建議修 (verbatim) | exact; summary follows | q042 stem whole-sentence match broken (§3.1); 体系的に = one_jp wording; supports q040 イ / q042 ウ / q050 エ / q045 ア | **Accept** |
| p02 | `key_points_zh[1]` | L1 任意 (verbatim) | exact; summary follows | parity with jp / one_zh 「系统地汇集」; zh overlap with q042 zh stem unchanged (term chain, §3.1) | **Accept** |
| p03 | `key_points_en[1]` | L1 任意 (verbatim) | exact; summary follows | parity with jp / one_en "systematically collects"; no lean | **Accept** |
| p04 | `terms[1].points[0].text_zh` | L2 建議修 (verbatim) | exact | compound mismatch removed; introduces 1 jp-origin warn = FP (§3.2) | **Accept** |
| p05 | `terms[1].points[0].text_en` | L2 建議修 (verbatim) | exact | same as p04 | **Accept** |
| p06 | `terms[4].fig.data.root.label.en` | L3 建議修 (verbatim) | exact (no derived) | redundancy removed; parity OK (§3.3) | **Accept** |

## 3. Focused checks

### 3.1 p01–p03 (L1): key_points[1] vs the 2012h24h-q042 stem

- **Before.** The base sentence contained the q042 stem's whole definition phrase (term name chain + 「の…を集めた」) as one 32-char normalized run: field LCS 33, near-match windows vs the q042 stem 26.
- **After.** The insertion 「体系的に」 splits that run. Fresh numbers (unit vs base):
  - field LCS vs any source 33 → 23. The 23-char run is ITサービスマネジメント + の + ベストプラクティス + を, i.e. the headword chain that Rule A §1-4 already classes as non-copy; it also occurs in q047 イ and is the standard ITIL definition.
  - semi-global near-match windows (ed ≤2) vs the q042 stem 26 → 19. The 15 ed-0 windows all lie inside that headword chain; the 3 tail windows (ed 2) cover 「…集めたフレームワーク」 (10 chars, term + 集めた). No window spans the full stem phrase any more.
  - masked 12-char windows: 0 → 0 (all hits are unmasked `U`). With term names folded: 0 hits before and after.
  - whole field vs q042 stem: ed/len 0.42 → 0.46, Dice 0.68 → 0.63.
  - Conclusion: the whole-stem-sentence identity is gone; what remains is term names + particles. L1 is resolved.
- **New content word 体系的に.** Its nearest topic source is 2011h23a-q040 イ (the **correct** ITIL description, 「体系的にまとめた」) — support, not a lean. 2021r03-q045 エ (「…を体系化」) is explicitly the PM body of knowledge; our sentence names ITSM best practices, and one_jp already said 「体系的に集めた」 before this patch, so there is no new lean toward エ. q042 answer ウ (ITIL) and q050 エ remain supported; none of q042's wrong options (ISO 14001 / 27001, JIS Q 15001) is touched.
- **zh (p02).** LCS vs the q042 zh stem stays 14 (「IT服务管理最佳实践的框架是」 after punctuation removal). The stem's 「汇集了」 already broke contiguity before the patch, so p02 is a parity edit only. The residual 13-char overlap = three term names (IT服务管理 / 最佳实践 / 框架) + 的, same class as the jp headword chain → record only (obs. 2).
- **en (p03).** LCS 41 → 41, unchanged part " best practices for it service management" (term chain shared by the q042 stem and q047 イ). "systematically" matches one_en and q040 イ (correct).
- **Trilingual parity.** jp 体系的に / zh 系统地 / en systematically; the rest of each sentence is unchanged and still parallel.
- **Side effect (record only).** key_points_jp[1] now repeats one_jp's clause 「ベストプラクティス…を体系的に集めたフレームワーク」 almost verbatim: D-203 §9 restatement, same type as Rule A L4 (record only). This is the convergence Rule A asked for.

### 3.2 p04 / p05 (L2): `[[jp:サービス]]` removal and the 2 new jp-origin warnings

- **Edit.** zh 「运维管理IT服务（[[jp:サービス]]）的做法」 → 「运维管理IT服务的做法」, en "running and managing IT services ([[jp:サービス]])." → "running and managing IT services.". The jp point (「ITサービスの運用管理の進め方…」) is unchanged and its `[[jp:ITサービスマネジメント]]` stays in zh / en (count 2 → 1 = the intended removal).
- **Why the warnings fire.** `jpOriginWarnings` (validateV2.ts) finds other headwords in each 考点 text_jp with `wordAt`, whose edge test only blocks katakana-katakana and alnum-alnum contact. In 「ITサービス」 the edge is T | サ (Latin → katakana), so サービス counts as a word. terms[0]'s own points are skipped (own headword), so terms[1].points[0] becomes the "first 考点 occurrence", and its zh / en now lack the marker.
- **Ruling: false positive, record only, no F-fix.**
  - The jp word is the compound ITサービス, not the headword サービス. Rule A L2 and loc-review r2 both judged the marker on part of the compound to be a 1:1 mismatch. Same class as the b20 precedent (原価 inside 売上原価 → partial-match FP, no fix; `b20_patch_rereview.md` §1 / `strategy-01-03-u01.ruleA.md` L7).
  - D-202's purpose is met: zh / en readers already get 服务（[[jp:サービス]]） / service ([[jp:サービス]]) in goals_*[0], terms[0].one_zh / one_en and terms[0].points[1].text_zh / text_en, all earlier in unit order.
  - Re-adding the marker would undo Rule A L2.
- **Side effect (record only).** The validator's `seen` set is consumed at terms[1].points[0] whether or not it warns. So the first standalone 考点 mentions of サービス in another term (terms[2].points[0] 「サービスの内容と品質…」, points[1] 「サービスを使う側…」) carry no `[[jp:サービス]]` and will never be flagged. Given the earlier markers above, this is not a D-202 gap.
- **Facts.** q040 answer イ (systematically compiled IT service operation methods) is still supported; the patch only removes the label. D-198: the 9-char zh / 29-char en overlaps are with q040's **correct** option and differ from the base by one char / the period only.

### 3.3 p06 (L3): SLI fig root label "SLA agreement" → "SLA document"

- jp 「SLA 合意書」 / zh 「SLA 协议书」 / en "SLA document". "SLA" already expands to service level agreement (terms[2].one_en, hook_en "The final A stands for Agreement"), so "document" carries the 書 part without the redundancy. Matches terms[2].one_en "is a document…", terms[3].points[1].text_en "the document covering the whole agreement", pairs[0].rows[0].a_en and fig steps[0] caption_en "agreement document". Parity: 24 locations, 0 diff.
- D-198: nearest source for "a document" is 2011h23tokubetsu-q047 イ (a wrong option of a cited SLA question: ITSM best practices documented). The label is 2 generic words with no "best practices", and the SLA = document between provider and customer (q047 ウ correct) reading is unchanged. No lean.

## 4. F-fix

None. No patch introduces a HIGH, MEDIUM or LOW defect that needs a field change. The 2 jp-origin warnings (§3.2) are false positives and must not be "fixed" by restoring the marker.

## 5. Observations (record only)

1. LOW, validate: jp-origin warn 0 → 2 at `terms[1](ITIL).points[0].text_zh` / `text_en`, introduced by p04 / p05 (§3.2). Compound-part false positive; carry into the batch evidence's warning list as "patch-introduced, FP" rather than "pre-existing".
2. LOW, D-198 residual: key_points_zh[1] keeps a 13-char overlap with the q042 zh stem (three term names + 的), unchanged by p02; key_points_jp[1] keeps the 23-char headword chain and a 10-char tail 「集めたフレームワーク」. Masked / folded: 0. Not a copy (Rule A §1-4 class).
3. LOW, D-203 §9: key_points_jp[1] now restates one_jp's clause (§3.1). L4-type, record only.
4. Script notes: the b42 memory_hooks suffix check misreports this unit (index shift, hooks on terms[2..4]); the corrected check is clean. `stage` meta is removed (as in b19–b43).

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope (Rule A had none); **0 introduced**
- LOW introduced: 0 needing a fix. Recorded: obs. 1–3 (obs. 1 = 2 patch-introduced validate warnings, FP).
- **Application:** 6/6 exact (replay). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (51 checked, 0 mismatch). 6/6 match the Rule A text verbatim; every 建議修 (L1–L3) is covered.
- **D-198:** p01 breaks the q042 whole-stem match (LCS 33 → 23, near-match windows 26 → 19, masked 0 → 0); what remains is the headword chain. No patch leans toward a wrong option.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0, 2 warnings (jp-origin, patch-introduced FP)
  - validate --part (base, sha256 = base_sha256): 0 issues, 0 warnings
  - parity: 24 locations, 0 diff
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 6 active patches of management-11-28-u01 are applied exactly and resolve Rule A L1–L3 without introducing a MEDIUM or HIGH. No F-fix. Record the 2 new jp-origin warnings as patch-introduced false positives in the b44 batch evidence.
