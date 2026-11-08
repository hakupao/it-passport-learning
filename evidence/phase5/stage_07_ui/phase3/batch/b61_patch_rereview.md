# b61 B3 patch re-review — strategy-07-22-u01 (システム化計画の構成要素, Rule A FAIL MEDIUM 1, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audit, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b61rv/`: `check.mjs` / `d198.mjs` / `same.mjs` copied from `b63rv/` with only the unit map changed (same.mjs: the 8 Rule A full before / after pairs). No scratch files in the repo.
- Date: 2026-11-08 (Session 151, b61)
- Scope: the B3 wording patches for strategy-07-22-u01. **8 are `active`, 0 retired**: p01–p08 (`patches/strategy-07-22-u01.json`), all part-level.
  - Mapping to Rule A prescriptions (Rule A FAIL: MEDIUM 1 = M1; 建議修 L1 / L2 / L3):
    - M1 → p01 (`terms[0](企画プロセス).points[0].text_en`)
    - L1 → p02–p03 (`terms[0].detail_en` 1st sentence / `terms[0].fig.steps[1].caption_en`)
    - L2 → p04–p05 (`terms[0].hook_zh` / `terms[4].hook_zh`)
    - L3 → p06–p08 (`key_points_jp[3]` / `key_points_zh[3]` / `key_points_en[3]`)
  M1 and every 建議修 are covered. L4–L8 (記録のみ) and O1–O2 are not patched and not re-ruled here. L8 (zh-term warn on `terms[0].detail_zh`, false positive) is in a field next to p02 and is re-read in §1 only for regression.
  - **Shortened strings**: **2 of 8** (p01, p03): each `before` / `after` is a phrase inside the Rule A before / after string (p01 drops " the concept and plan for systemization.", p03 drops " for solving them with IT."). p02 and p04–p08 use the Rule A strings verbatim. `same.mjs` confirms that base.replace(Rule A before, Rule A after) = unit field for all 8, so the shortened patches give the same result as the Rule A full strings.
- Pre-patch base, located by sha256 = `base_sha256`: `data/ip/textbook/.planning/v2/strategy-07-22-u01/parts/b61-u01-a1/strategy-07-22-u01.loc.r0.json` `cb713204fcd1b9ec…`.
- Merged unit (current) `data/ip/textbook/units/strategy-07-22-u01.json` sha256 `34c66433bd98953d…`. It differs from the base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b63_patch_rereview.md` §0 (no unit-level patches in this batch). Topic strategy-07-22 has 25 questions, so there are 125 source strings per language.

1. **Application check** (`b61rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b61rv/same.mjs`: full Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b61rv/d198.mjs`, all 8 patches): whole-field LCS before → after and LCS of the `after` span against the 125 sources per language; jp also 12-char windows and Dice.
4. **Cited-question checks** in `data/ip/quiz/questions.json` + `translations/<exam>.json` (en / zh choice wording): 2009h21a-q025 (answer ウ; wrong ア = 経営要求と課題の確認, en "Confirming business requirements and issues"), 2010h22h-q012 (answer イ; wrong ア en "Clarify the business requirements of the target business…"), 2013h25h-q005 (answer エ; wrong イ en "…constraints and business requirements for the system"), 2011h23a-q029 (answer イ en "Confirmation of management needs and issues"), 2019h31h-q006 (answer ウ = problems of the targeted business operations; wrong エ en "management-level issues and needs"), and for L3 2022r04-q086 (answer ア = determine each risk's level for comparison with the acceptance criteria; wrong エ = determine whether the risk is acceptable).
5. **Cross-unit check** for L3: `data/ip/textbook/units/technology-23-62-u01.json` (リスクアセスメント / リスク分析 / リスク評価 `one_*`).
6. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (§3).
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b63): the unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (126) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-07-22-u01
✓ strategy-07-22-u01 unit: 0 issues (data/ip/textbook/units/strategy-07-22-u01.json), 1 warning(s)
  warn  zh-term  terms[0](企画プロセス).detail_zh  フレーム → 帧 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-07-22-u01
✓ strategy-07-22-u01 parity: 27 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part data/ip/textbook/.planning/v2/strategy-07-22-u01/parts/b61-u01-a1/strategy-07-22-u01.loc.r0.json
counts {"terms":6,"figs":3,"steps":7,"points":12,"pairs":1,"key_points":4,"goals":3}
sha256 cb713204fcd1b9ece874ae2293741df9cd7aa33fcb23af0c18b8d08f8871ea89   (= base_sha256)
✓ strategy-07-22-u01 part loc#0: 0 issues, 1 warning(s)
  warn  zh-term  terms[0](企画プロセス).detail_zh  フレーム → 帧 not in the zh text
EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  active 8 ok 8 | issues []
  base sha = base_sha256 for all 8; before count in base = 1 for all 8; replay mismatch 0
  changed base-present paths = 8 patched fields + 'stage'; unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata); unit-only paths 126
  derived checked 63, mismatch 0 (explanation_en of terms[0] follows p02; memory_hook_zh of terms[0] / terms[4] follow p04 / p05; summary.key_points_jp/zh/en[3] follow p06–p08: all true)
  bold counts unchanged in all 8 (0/3/0/0/0/0/0/0); [[jp:]] counts unchanged in 6, +1 in p04 / p05 (0→1, the Rule A L2 after adds [[jp:企画]] / [[jp:費用対効果]])
  memory_hooks hooked-terms pairing: 6/6 per language (18 checked), bad 0; lens 5/5/5
  net before remnant: 0 for all 8 (raw and stripped)
  grep in the unit: business requirement 0 / Business requirement 0 / business issues 0 / 据说“企”字 (line start) 0 / “对”是相对 0 / 備える順番を決める。 0 / 以此决定 0 / and uses that to decide 0; management's needs 1 (p01), management issues 3 (p02 + derived explanation_en + p03)
  ruleA verbatim miss: []
same.mjs (full Rule A before → after on the base field):
  Rule A before occurs once in the base field: 8/8
  base.replace(Rule A before, Rule A after) == unit field: 8/8 true
```

The one validate warn (zh-term フレーム → 帧 on `terms[0].detail_zh`) is the same warn the Rule A file recorded as a false positive (L8; 共通フレーム is a proper name). It appears on the base part too, so it is not caused by the patches (p01–p03 touch only `_en`; p04 touches `hook_zh`, not `detail_zh`).

**Application.** All 8 `before` strings occur exactly once in their base field, all 8 `after` strings are present, and replay reproduces every patched field. 2 are shortened phrases of the Rule A strings, and all 8 give exactly the Rule A after text (same.mjs 8/8).

D-198, before → after (`d198.mjs`, 125 sources per language):

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | en | **33 → 19** (" business requirements and issues", **2009h21a-q025 c0 = wrong ア** → "he planning process", 2010h22h-q012 stem, process name) | " needs and issues" (17, 2011h23a-q029 c1 = correct イ) |
| p02 | en | 28 → 28 ("ting the systemization plan ", process name, unchanged text) | " the management " (16, generic) |
| p03 | en | 15 → 16 ("n the business " 2019h31h-q006 c0 → " the management " 2013h25a-q019 c0, generic) | " the management " (16) |
| p04 | zh | 3 → 3 (计划的, unchanged text) | 中的 (2) |
| p05 | zh | 2 → 2 (费用, word) | 中的 (2) |
| p06 | jp | 3 → 4 (たとき → にする。, function words) | にする。 (4); win12 0/0 → 0/0; Dice 0.05 → 0.07 |
| p07 | zh | 3 → 3 (发生的 → ，作为, function words) | 作为 (2) |
| p08 | en | 10 → 10 ("t would be", unchanged text) | " the basi" (9) |

p01 removes the one notable overlap (the en of the cited wrong option 2009h21a-q025 ア); the new nearest span is a process name. The `after` span's best match " needs and issues" is in the **correct** option 2011h23a-q029 イ, as Rule A intended. p03 / p06 rise by 1 char on generic words. No patch adds a meaningful overlap.

## 2. Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[0](企画プロセス).points[0].text_en` | M1 | Yes (§3.1): "…and after confirming management's needs and issues, it draws up the concept and plan for systemization." The 業務要件 term "business requirements" is gone; = jp 経営上の要求や課題 / zh 经营上的要求和课题 | No | OK |
| p02 | `terms[0].detail_en` (+ explanation_en) | L1 | Yes: "the concept settles the management issues and the direction of a solution" = jp 経営上の課題 / zh 经营课题; now distinct from the plan stage's "the issues of the target operations" (fig step 3) | No | OK |
| p03 | `terms[0].fig.steps[1].caption_en` | L1 | Yes: "The concept stage pins down the management issues and the direction for solving them with IT." = p02, = jp caption 経営上の課題 | No | OK |
| p04 | `terms[0].hook_zh` (+ memory_hook_zh, summary) | L2 | Yes: 「日语[[jp:企画]]中的“企”字，据说…」 — the hook now says which word the character comes from (the zh head 规划流程 has no 企). = en "The character 企 in [[jp:企画]]" | No | OK |
| p05 | `terms[4](費用対効果).hook_zh` (+ memory_hook_zh, summary) | L2 | Yes: 「日语[[jp:費用対効果]]中的“対”是相对、面对面的意思。」 — names the word and now shows the Japanese form 対 (was simplified 对, which is not in 成本效益 either). = en "The 対 in [[jp:費用対効果]]" | No | OK |
| p06 | `key_points_jp[3]` (+ summary) | L3 | Yes (§3.3): 「…両方を見て、備える順番を決める材料にする。」 | No | OK |
| p07 | `key_points_zh[3]` (+ summary) | L3 | Yes: 「…作为决定应对先后顺序的依据。」 = jp | No | OK |
| p08 | `key_points_en[3]` (+ summary) | L3 | Yes: "…which gives the basis for deciding what to prepare for first." = jp | No | OK |

## 3. Focused checks

### 3.1 p01: M1 (en no longer uses the 業務要件 term)

- en (after): "The planning process starts from the business strategy ([[jp:経営戦略]]), and after confirming management's needs and issues, it draws up the concept and plan for systemization." jp 「経営上の要求や課題を確かめたうえで」 and zh 「在确认经营上的要求和课题之后」 are unchanged and were already correct (Rule A).
- **Wrong-option wording** (translations en, re-read): 2009h21a-q025 ア "Confirming business requirements and issues", 2010h22h-q012 ア "Clarify the business requirements of the target business…", 2013h25h-q005 イ "…constraints and business requirements for the system". All three use "business requirements". The unit now has **0** occurrences of "business requirement(s)" (grep, case-insensitive variants), so no en sentence points the reader to these wrong options. D-198 confirms it: the field's nearest source was 2009h21a-q025 ア (LCS 33) before and is a process name (LCS 19) after.
- **Correct-option wording**: the new "management's needs and issues" follows 2011h23a-q029 イ en "Confirmation of management needs and issues" (the correct answer this 考点 cites). This is the standard term for 経営上のニーズ・課題, not a copy of the option's form (no "Confirmation of", possessive form, inside a longer sentence).
- **Other questions**: 2019h31h-q006 エ (wrong, en "management-level issues and needs aligned with the information system strategy") is the concept-stage side; the question asks for the work of the planning (計画) step. The 考点 talks about the whole 企画プロセス (concept + plan), and fig step 2 / 3 put the management issues in the concept stage and the target-operations issues in the plan stage, as before. So the new wording does not push the reader to q006 エ more than the jp did. Rule A already judged the jp at this level fine.
- **Sibling fields**: `terms[0].points[2].text_en` (requirements definition = "conditions the business and the system must meet") and `terms[0].detail_en` 3rd sentence are unchanged and still keep requirements on the 要件定義 side. Parity 0 diff. qids kept (2015h27a-q004 / 2011h23a-q029 / 2014h26h-q021). Bold 0 → 0, [[jp:]] 1 → 1. **M1 resolved.**

### 3.2 p02–p05

- p02 / p03: the concept stage now has "management issues" in both detail_en and caption_en, and the plan stage keeps "the issues of the target operations" (caption step 3). The 2019h31h-q006 split (concept = management-level = wrong エ; plan = problems of targeted business operations = correct ウ) is now clear in en, as in jp / zh. Derived explanation_en follows. **L1 resolved.**
- p04 / p05: both zh hooks now say 日语[[jp:…]]中的 + the character, so a zh reader knows the character is from the Japanese term. The added [[jp:企画]] / [[jp:費用対効果]] are the term names and occur in the jp text (D-202; validate 0 issues). summary.memory_hooks_zh[0] / [3] carry the new text (derived = stripped form "日语企画中的…", pairing 6/6). The rest of each hook (预见未来、制定计划 / 天平两端的托盘) is unchanged and still matches jp / en. **L2 resolved.**

### 3.3 p06–p08: L3 (risk-analysis scope)

- After (三語): jp 「リスク分析では、問題が起きる可能性と起きたときの影響の大きさの両方を見て、備える順番を決める材料にする。」 zh 「…作为决定应对先后顺序的依据。」 en "…which gives the basis for deciding what to prepare for first." The key point now says risk analysis gives the input for the order; it no longer says analysis itself decides the order.
- **technology-23-62-u01** (re-read): リスク分析 `one_jp` = 特定したリスクごとに発生可能性と影響の大きさを見積もり、リスクレベルを決める工程; リスク評価 `one_jp` = リスクレベルをリスク基準と比べ、対応が必要かどうかと、対応する順番を決める工程. The patched key point now fits this split (analysis = likelihood × impact → material; deciding the order = a later step). Same in en ("estimates the likelihood and size of impact… to set its risk level" / evaluation "decide whether each risk needs treatment and in what order").
- **2022r04-q086** (answer ア = determine each risk's level so it can be compared with the acceptance criteria; wrong エ = determine whether the risk is acceptable): the patched key point does not say analysis decides acceptability or the treatment order, so it does not support エ; "材料にする" matches ア's "so that it can be compared". **Consistent.**
- The unchanged `terms[5](リスク分析).one_*` (洗い出し + 可能性と影響を評価) and its fig (洗い出す → 可能性と影響を評価する → 対策を決める) keep the wider system-plan sense. Rule A judged them correct in the system-plan context and out of the patch scope; the patch does not make them worse, and the key point now no longer adds the order decision as analysis's own role. Recorded in §5 only.
- Derived summary.key_points_*[3] follow. Parity 0 diff. **L3 resolved.**

## 4. F-fix

No required F-fix. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - validate (unit and part): 1 warn each, the same zh-term false positive (L8, 共通フレーム), present in the base part too; not caused by the patches.
   - `stage` meta is removed in the unit (as in b19–b63).
   - ruleA verbatim miss = none. 2 of 8 patches use shortened phrases (p01, p03); same.mjs shows all 8 give the same field as the Rule A full strings.
   - p05 uses an unlabelled path (`terms[4].hook_zh`); the other 7 are labelled or top-level. Both forms resolve in check.mjs / d198.mjs.
   - [[jp:]] +1 in p04 / p05 is by design (Rule A L2 after).
2. `terms[5].one_*` / fig keep a wider sense of リスク分析 (洗い出し → 評価 → 対策) than technology-23-62-u01 (analysis = level only). Rule A judged this correct for the system-plan context; it is not a patch defect and not re-ruled here.

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: M1 in scope → **resolved** (en; jp / zh were already correct); **0 introduced**
- LOW introduced: 0. Obs. 1–2 are script notes / record only.
- **Application:** 8/8 exact (replay, part-level). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (63 checked, 0 mismatch). 2/8 shortened, and all 8 give the same field as the Rule A full string (same.mjs). M1 and every 建議修 (L1, L2, L3) are covered.
- **D-198:** p01 reduces the overlap with the cited wrong option 2009h21a-q025 ア (LCS 33 → 19, now a process name). No patch adds a meaningful overlap (others 28 / 15→16 / 3 / 2 / 3→4 / 3 / 10, all term, generic or unchanged spans).
- **D-200:** no 考点 claim changed (p01 is a translation fix of the same claim; qids kept). **D-202:** [[jp:]] +1 in p04 / p05, both are term names present in jp. **D-204 / D-205 / D-210:** no new law, standard or numeric claim.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0, 1 warn (L8 false positive, pre-existing)
  - validate --part: 0 issues (sha256 = base_sha256), same 1 warn
  - parity: 0 diff (27 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 8 active patches of strategy-07-22-u01 are applied exactly. p01 resolves M1: the en 考点 now says "management's needs and issues" (the correct option 2011h23a-q029 イ wording) and the unit has no "business requirements", the 業務要件 term used by the en of the wrong options 2009h21a-q025 ア / 2010h22h-q012 ア / 2013h25h-q005 イ. p02–p05 resolve L1–L2. p06–p08 resolve L3: the key point now has risk analysis give the basis for the order, which matches technology-23-62-u01 (analysis sets the level, evaluation decides the order) and 2022r04-q086 (ア). None introduces a HIGH, MEDIUM or LOW. No required F-fix.
