# b72 B3 patch re-review — strategy-06-21-u01 (システム活用の促進と評価)

- Reviewer: verifier (Opus 5.5). I did not write the patch or the Rule A audit, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b72rv/`: `check.mjs` / `d198.mjs` / `same.mjs` / `raverb.mjs` copied from `b71rv/` with only the unit map changed (1 unit, topic strategy-06-21; base attempt `b72-u01-a2`, round `r0`) and `ra.json` replaced by the one Rule A before / after pair, copied by hand from the Rule A L1 "修正案" cell. **One fix beyond the map** (flagged by the b71 reviewer): `d198.mjs` `sources()` used to push `JSON.stringify({zh, en})` for each translation choice; it now takes `t.choices[k][lang]` per language (and throws on any other shape), and choice ids carry the kana key (`c ア` …). Extra scratchpad script: `b72tools/extra.mjs` (derived summary copy, old-wording / a1-MEDIUM greps, a1-MEDIUM field identity vs base, a q030 translation-shape sample). No scratch files in the repo.
- Date: 2026-11-08 (Session 151, b72)
- Scope: the B3 wording patch for 1 unit. **1 is `active`, 0 retired**, part-level:

| Unit | Rule A | Patches | Mapping to Rule A prescriptions | Shortened |
|---|---|---|---|---|
| u01 (システム活用の促進と評価) | **PASS**, 建議修 L1 only (L2–L10 記録のみ) | p01 | L1 → p01 (`key_points_en[0]`, "motivating devices" → "motivational techniques") | 1/1 (p01: `before` / `after` are the clause "and by … such as **gamification**." inside the Rule A full sentence) |

  The only 建議修 is covered. 記録のみ LOWs L2–L10 (including the optional L2 / L4 wording offers) and O1 are not patched and not re-ruled here.
  - **Shortened string**: `same.mjs` confirms base.replace(Rule A before, Rule A after) = unit field (1/1), so the shortened patch gives the same result as the Rule A string.
- Pre-patch base, located by sha256 = `base_sha256` (validate --part prints the same sha): `data/ip/textbook/.planning/v2/strategy-06-21-u01/parts/b72-u01-a2/strategy-06-21-u01.loc.r0.json` `cd355268939a44ff…`
- Merged unit (current) `data/ip/textbook/units/strategy-06-21-u01.json` sha256 `9b9e0610ff7a0d49…`. It differs from the base only by `key_points_en[0]` (+ derived `summary.key_points_en[0]`) and the removed `stage` meta key (§1). Reverting the patch text in the unit file (2 occurrences: body + summary) gives sha256 `f419acac240a5f0b…` = the unit sha the Rule A audit states, so the Rule A subject is exactly this file minus p01.
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below beyond matched fragments and one-word choice names (qid + paraphrase only).

## 0. Method

Same as `b71_patch_rereview.md` §0 (no unit-level patches). Topic strategy-06-21 has 14 questions, so there are 70 source strings per language (14 stems + 56 choices).

1. **Application check** (`b72rv/check.mjs`): base sha256; `before` once in the base field; replay = unit field; every changed base-present path explained; net `before` remnant count; before / after verbatim (substring) in the Rule A file. Plus `b72rv/same.mjs`: Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field. `b72rv/raverb.mjs`: both Rule A strings verbatim in the Rule A file.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b72rv/d198.mjs`, with the per-language choice fix): whole-field LCS before → after and LCS of the `after` span against the 70 en sources (stems + per-language choices).
4. **Cited-question check**: 2013h25h-q030 (正答エ 代表事例・分析用テンプレート; 誤答ア = 高機能 PC を各部署に配置, the hardware reading L1 is about) in `data/ip/quiz/questions.json` + `translations/2013h25h.json`; 2019h31h-q033 (ゲーミフィケーション, 正答イ).
5. **a1 MEDIUM regression check**: the five a1 MEDIUM fields (`terms[0].points[1]`, `terms[0].points[2]`, `terms[1].points[0]`, `terms[2].points[0]`, `terms[4].detail`) × 三語 compared with the base, plus unit-wide greps for the a1 wording (TCO / 总拥有成本 / total cost of ownership, q015 作業列挙, q027 2 要素, q033 主体の組, q002 / q016 列挙語).
6. **Manual reading** of the patched field in context (三語) and of the sibling fields it must agree with (§U1.3), plus a unit-wide grep for "device(s)".
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b71): the unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patch is present and correct in context, and that nothing but the patch changed in base-present paths. Unit-only paths (146) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-06-21-u01
  → ✓ 0 issues, 2 warnings (choice-echo terms[1](デジタルディバイド).points[0].text_jp: 2009h21a-q024 エ / 2018h30h-q002 イ・エ)   EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-06-21-u01   → ✓ 30 locations, 0 diff   EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part <base>
  loc#0 counts {"terms":8,"figs":2,"steps":4,"points":12,"pairs":2,"key_points":4,"goals":3}
  sha256 cd355268939a44ff9467f3c87bf98c0521bdb357e93633a1a6331f0bb69bd069 (= base_sha256 of p01)   ✓ 0 issues   EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  active 1 ok 1 | issues [] | changed base-present = ['stage', 'key_points_en[0]'] | unexplained besides 'stage' 0
  base-only top keys: stage / round / jp_round (part metadata) | unit-only paths 146
  derived 81, mismatch 0 | memory_hooks 24 checked, bad 0, lens 7/7/7 (8 terms, terms[5] has no hook)
  net before remnant: p01 raw 0 / stripped 0
  key_points_en[0]: bold 1 → 1, [[jp:]] 0 → 0
  ruleA verbatim miss: []
same.mjs: Rule A before occ in base 1; base.replace(Rule A before, Rule A after) == unit field: true
raverb.mjs: 2 Rule A strings, verbatim miss 0
d198.mjs (per-language choices): topic qs 14, sources jp 70 / zh 70 / en 70
  p01 en field LCS 17 " devices such as " (2018h30h-q002 stem) → 13 " gamification" (2019h31h-q033 stem) | after-span 13 " gamification" (term name)
extra.mjs:
  summary.key_points_en[0] = "Use of a system is promoted both by educating users and by motivational techniques such as gamification."  (= stripInline(key_points_en[0]))
  "motivating" 0 fields | "motivational" 2 fields (key_points_en[0] + summary copy)
  "device(s)" 4 fields: terms[0].detail_en (+ explanation_en) "operating devices", terms[1].detail_en (+ explanation_en) "devices and network connections are hard to obtain" / "operating devices" — all hardware sense, unpatched, correct
  a1 MEDIUM fields (15 = 5 × 三語): all byte-identical to base (==base true)
  a1 wording greps (all 0 fields): TCO / 总拥有成本 / total cost of ownership / 抽出 / 加工 / 統計 / ツールの使用 / 顧客や従業員 / 目標 / 動機付け / 情報の質 / 量や収入 / 待遇 / 収入
  translations 2013h25h-q030 choices shape = {ア: {zh, en}, …} (confirms the per-language fix is needed and now applied)
unit sha with p01 reverted (2 occurrences) = f419acac240a5f0b… = Rule A stated sha
```

The 2 validate warns are the `choice-echo` warns on `terms[1].points[0].text_jp`, which the Rule A audit printed on the same pre-patch unit and ruled false positives (§2 #2: positive definition, no negation, no wrong-option word; "デジタル" common prefix). That field is byte-identical to the base and is not touched by the patch. `validate --part` does not print them (it runs without the cited-question context). `stage` meta is removed in the unit (as in b19–b71).

**Application.** The `before` string occurs exactly once in the base field, the `after` string is present, replay reproduces the patched field, net `before` remnant 0. The patch is a shortened phrase of the Rule A string and gives exactly the Rule A after text (same.mjs true).

## U1. strategy-06-21-u01 (Rule A PASS, 建議修 L1)

### U1.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | en | **17 → 13** (" devices such as ", 2018h30h-q002 stem → " gamification", 2019h31h-q033 stem = term name) | 13 (" gamification", the headword) |

- **No rise.** The patch removes the field's longest overlap (a 3-word phrase shared with a q002 stem) and leaves only the headword. The en `key_points` line is not a 考点, so D-200 / qid checks do not apply.
- With the old stringified choices this LCS would have run on a `{"zh":…,"en":…}` string; with the per-language fix the 56 en choice strings are compared as plain English (q030 ア en = "Install one high-performance PC…" is not the nearest source in either state).

### U1.2 Per-patch verdict

| ID | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `key_points_en[0]` (+ summary.key_points_en[0]) | L1 | Yes (§U1.3) | No | OK |

### U1.3 Focused checks — L1 (en "devices") and a1 MEDIUM regression

- **After (三語)**: jp 「システムの活用は、利用者の教育と、**ゲーミフィケーション**のような意欲を高める工夫の両方で促す。」 / zh 「系统的利用，要从用户教育和**游戏化**这类提高积极性的方法两方面来促进。」 / en "Use of a system is promoted both by educating users and by motivational techniques such as **gamification**." — en now says "techniques" (= jp 工夫 / zh 方法), so the three languages state the same thing: two ways of promoting use, education and motivation methods.
- **Hardware reading gone**: "devices" in this line could read as equipment, the direction of 2013h25h-q030 誤答ア (put a high-performance PC in each department). "motivational techniques" has no hardware sense. The 4 remaining "devices" in the unit (terms[0] / terms[1] detail_en + explanation_en) are the literal hardware sense (operating devices; devices and connections hard to obtain) and are correct there, so the word now has one sense in the unit. q030 正答エ (examples and templates) is still supported by `terms[0].detail` (training and examples to follow) and `terms[0].points[1]`; q033 正答イ is still supported by `terms[2].points[0]` / one ("to motivate people"), which agrees with "motivational".
- **Derived field follows**: `summary.key_points_en[0]` = the stripped body (bold `gamification` → plain), check.mjs derived mismatch 0; key_points_jp/zh and their summary copies unchanged. Bold 1 → 1, `[[jp:]]` 0 → 0.
- **a1 MEDIUMs stay resolved**: the patch touches no other base-present path, and the five a1 MEDIUM fields (EUC 考点 `terms[0].points[2]`, リテラシー向上策 `terms[0].points[1]`, ゲーミフィケーション 考点 `terms[2].points[0]`, デジタルディバイド 考点 `terms[1].points[0]`, メンテナンスコスト `terms[4].detail`) are byte-identical to the base in jp / zh / en. Greps: TCO / 总拥有成本 / total cost of ownership 0 fields (TCO sentence still deleted); the q015 作業列挙 (抽出・加工・統計), q027 2 要素 (ツールの使用方法), q033 主体の組 / 目標 / 動機付け, q002 / q016 列挙語 (情報の質・量や収入・待遇・収入) all 0 fields. So the four option-tracing MEDIUMs (D-198 (iii)) and the TCO MEDIUM remain resolved, and the Rule A finding of "a1 MEDIUM 5 件 解消" holds for the current file.
- Parity 30 / 0 diff. **u01: L1 resolved; a1 MEDIUMs unchanged and resolved.**

## 4. F-fix

No required F-fix. The patch introduces no HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - `d198.mjs` `sources()` fixed in `b72rv/` to take `t.choices[k][lang]` per language (translations shape `choices.ア.{zh,en}`, confirmed on 2013h25h-q030); zh / en choice LCS now runs on single-language strings. Future re-reviews should copy from `b72rv/`, not `b71rv/`.
   - validate: the only warns are the 2 known `choice-echo` false positives on `terms[1].points[0].text_jp` (Rule A §2 #2, field unpatched). `--part` prints 0 warns.
   - `stage` meta removed (as in b19–b71). Base is `b72-u01-a2` / `loc.r0` (a1 archived per Rule B).
   - Reverting p01 in the unit file reproduces the Rule A unit sha `f419acac240a5f0b…`.
2. Rule A L2 (zh 「投资的投资回收期」 duplication, `terms[3].one_en` "brings in money") and L4 (「主に金額で比べ」) carry optional wording offers; they were not adopted, which is consistent with their 記録のみ rating. Not re-ruled.
3. O1 (`term_en` "Cost-effectiveness analysis" vs cost-benefit analysis) stays out of scope (v1 invariant).

## 6. Overall verdict

| Unit | Rule A | Applied | MEDIUM in scope | HIGH / MEDIUM / LOW introduced | Verdict |
|---|---|---|---|---|---|
| strategy-06-21-u01 | PASS | **1/1** | — (a1 MEDIUM 5 件 remain resolved, fields identical to base) | 0 / 0 / 0 | **PASS** |

- **Application:** 1/1 exact (replay, part-level). 0 unexplained diffs, net `before` remnant 0, derived fields follow (81 checked, 0 mismatch; summary.key_points_en[0] = stripped body), memory_hooks pairing 0 bad. Shortened, and gives the same field as the Rule A string (same.mjs).
- **D-198:** LCS 17 → 13, the remaining overlap is the headword. **D-202:** bold / tag counts unchanged. **D-204 / 書き方 7:** en key_points now = jp 工夫 / zh 方法, "devices" keeps one (hardware) sense in the unit. **D-205 / D-210:** no new claim.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 (2 known false-positive choice-echo warns, field unpatched)
  - validate --part: 0 issues, sha256 = base_sha256
  - parity: 30 locations, 0 diff
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** The single active patch is applied exactly; L1 is resolved in context in all three languages (en "motivational techniques" = jp 意欲を高める工夫 / zh 提高积极性的方法, no hardware reading toward q030 ア), the summary copy follows, and the a1 MEDIUMs (option tracing ×4, TCO) remain resolved. No required F-fix.
