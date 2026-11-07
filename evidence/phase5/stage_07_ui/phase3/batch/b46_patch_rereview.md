# b46 B3 patch re-review — strategy-05-15 u01–u02 (設計・開発を支える工学技術 / 生産管理の方式とシステム, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b46rv/` (derived from `b45rv/`, topic and base parts changed only).
- Date: 2026-11-07 (Session 149)
- Scope: the B3 wording patches for strategy-05-15 u01–u02. **5 are `active` and 0 retired**: u01 p01–p03 / u02 p01–p02 (`patches/strategy-05-15-u0{1,2}.json`).
  I checked each patch against the Rule A prescriptions in `strategy-05-15-u0N.ruleA.md`:
  - u01 (Rule A PASS, 建议修 L3; L5 optional "任意"): L3 → p01 (zh) / p02 (en), L5 → p03 (en, optional, adopted by the main session)
  - u02 (Rule A PASS, 建議修 L1 / L2): L1 → p01 (jp only), L2 → p02 (zh only)
  Every 建議修 in u01–u02 is covered. LOWs marked 記録のみ and not patched are not re-ruled here.
- Pre-patch bases, located by sha256 = `base_sha256` (one base per unit, shared by all its patches):
  - u01 `data/ip/textbook/.planning/v2/strategy-05-15-u01/parts/b46-u01-a1/strategy-05-15-u01.loc.r0.json` `559e59cd06d710d9…`
  - u02 `data/ip/textbook/.planning/v2/strategy-05-15-u02/parts/b46-u02-a2/strategy-05-15-u02.loc.r1.json` `ada5275bcddf7f5c…`
- Merged units (current) `data/ip/textbook/units/strategy-05-15-u0N.json` sha256: u01 `ae53464c1d427eb8…` / u02 `2c26d220b00ee172…`. They differ from their bases only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only). Strings shown are unit text, patch text or term names.

## 0. Method

Same as `b45_patch_rereview.md` §0. No `unit.*` patch and no multi-patch field in this batch. Topic strategy-05-15 has 34 questions, so there are 170 source strings per language.

1. **Application check** (`b46rv/check.mjs`): `after` present; `before` once in base; replay in file order = unit field; every changed base-present path explained; before / after verbatim in the Rule A file. Plus `b46rv/extra.mjs`: net `before` remnant count.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` with the hooked-terms pairing (u02: 6 terms, 5 hooks — 生産方式 has none).
3. **D-198** (`b46rv/d198b.mjs`, + `win.mjs` / `near.mjs` for u02 p01): whole-field LCS before → after and LCS of the `after` span against the 170 sources per language; jp 12-char windows (≤2 substitutions) unmasked / masked + wDice; semi-global ed ≤2 per 12-char window + whole-field ed / Dice against every string of 2013h25h-q015.
4. **Cited-question checks.** Re-read in `data/ip/quiz/questions.json` + translations: 2013h25h-q015 (BTO description; answer イ = keep as parts, assemble after order; wrong ア OEM / ウ JIT / エ one-worker assembly), 2021r03-q035 (kanban; answer ア), 2012h24a-q028 / 2014h26h-q028 / 2026r08-q018 (CE purpose = shorter development period; answer ア).
5. **Manual reading** of each patched field in context: u01 センシング技術 detail (三語, all three sentences), CE points[0] (jp / en) + every `development time` occurrence; u02 JIT points[1] (三語), かんばん方式 points[0] (三語) + `pairs[1].rows[1]` (プル型 / プッシュ型, 三語).
6. **Gates** (each on both units): `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b45): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 74 / u02 128) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-07)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-15-u01
✓ strategy-05-15-u01 unit: 0 issues (data/ip/textbook/units/strategy-05-15-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-05-15-u01
✓ strategy-05-15-u01 parity: 21 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-15-u02
✓ strategy-05-15-u02 unit: 0 issues (data/ip/textbook/units/strategy-05-15-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-05-15-u02
✓ strategy-05-15-u02 parity: 30 locations, 0 diff
EXIT=0
validate --part (base): u01 loc#0 0 issues (sha256 559e59cd… = base_sha256) EXIT=0
                        u02 loc#1 0 issues (sha256 ada5275b… = base_sha256) EXIT=0
vitest src/lib/textbook: Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  u01 active 3 ok 3 issues 0 | u02 active 2 ok 2 issues 0 | replay mismatch 0
  changed base-present paths = patched fields + 'stage' (u01 3+1 / u02 2+1); unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata)
  derived checked 36 / 66, mismatch 0 (u01 terms[2].explanation_zh / _en follow p01 / p02)
  bold / [[jp:]] counts unchanged in all 5 patched fields
  memory_hooks suffix (index pairing): u01 0 bad, u02 12 bad ([1]..[4] ×3 — index shift, 生産方式 has no hook)
  memory_hooks (hooked-terms pairing): u01 3/3, u02 5/5 in each of jp/zh/en, bad 0
  ruleA verbatim miss: u01 [] | u02 []
extra.mjs: net before remnant 0 for all 5
```

**Application.** All 5 `before` strings occur exactly once in their base field, all 5 `after` strings are present, replay reproduces every patched field. The patches use the sub-span from the first changed word of the Rule A full-sentence before / after (u01 L3, u02 L1 / L2) — the same edit; verbatim check passes. u02 index-paired hook "bad" is the known false positive (the corrected pairing is clean); no patch touches a hook.

**Term remnants.** `development period` 0 left in u01 (7 × `development time`: overview_rows[0] ×2, one_en / definition_en, points[0], key_points_en[0] / summary). `拉动式` 0 left in u02; `拉式` ×2 (terms[2].points[0].text_zh, pairs[1].rows[1].a_zh) and `推式` ×1 (pairs[1].rows[1].b_zh) = zh_terms `プル型 → 拉式` / `プッシュ型 → 推式`. `它是` 0 left in u01.

D-198, before → after (`d198b.mjs`, 170 sources per language):

| Patch | Lang | LCS before → after (nearest source) | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|
| u01 p01 | zh | 7 → 7 (unchanged sentence 1, 转换为电信号的, 2019r01a-q014 ウ) | 的技术 (3) | — |
| u01 p02 | en | 24 → 24 (unchanged sentence 1, " into electrical signals") | "ing technology " (15, term name) | — |
| u01 p03 | en | 32 → 32 (unchanged part, " adopting concurrent engineering", 2026r08-q018 stem) | "development t" (13) | — |
| u02 p01 | **jp** | 5 → 5 (組み立てる, unchanged part) | 部品の (3) | 0 / 0 → 0 / 0; 0.17 → 0.15 |
| u02 p02 | zh | 6 → 6 (JIT准时制, unchanged part / zh_terms) | 生产的 (3) | — |

No patch adds any overlap. u02 p01 vs 2013h25h-q015 (`near.mjs`): semi-global ed ≤2 windows 0 (raw and folded) both before and after; whole-field ed / Dice vs イ (correct) 0.89 / 0.16 → 0.88 / 0.15, vs ウ (JIT) 0.86 / 0.10 → 0.85 / 0.10, stem / ア / エ ≤ 0.09. Sentence 1 alone vs イ: bigram Dice 0.21 (before) → 0.20 (after); the rejected alternative 「製品を」 would give 0.25 (Rule A L1 avoided it for this reason; confirmed). Far from the HIGH calibration (ed 0.14 / Dice 0.52).

## 2. Per-patch verdict

| Unit / IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| u01 p01 | `terms[2](センシング技術).detail_zh` (+ `explanation_zh`) | L3 | Yes: sentence 3 「传感技术是把现实情况以数值形式采集进来的技术，…」 now names its subject; it can no longer be read as 得到的数据. 传感技术 = zh_terms センシング技術 ✓ | No (style: 传感技术是…的技术 repeats 技术, obs. 1) | OK |
| u01 p02 | `terms[2].detail_en` (+ `explanation_en`) | L3 | Yes: "Sensing technology is what brings the real world in as numbers, …" — subject explicit, no longer "The resulting data" | No | OK |
| u01 p03 | `terms[0](CE).points[0].text_en` | L5 (optional) | Yes: "development time" = one_en / overview / key_points_en (0 "development period" left). Claim unchanged (purpose = shorten 開発期間); `[[jp:開発期間]]` kept. 2012h24a-q028 / 2014h26h-q028 / 2026r08-q018 ア still supported; no wrong option touched | No | OK |
| u02 p01 | `terms[1](JIT).points[1].text_jp` | L1 | Yes: 「**BTO** は在庫を部品の状態で持っておき、…」 restores the object; jp now matches zh 以零部件形态备货 / en "keeps stock as parts". Factually correct (BTO holds parts inventory, assembles after the order). 2013h25h-q015 イ still the supported answer; the point does not lean toward ウ (JIT is still described separately as not piling stock between processes). D-200: 2 sentences, **77 chars** (markup / whitespace removed) ≤ 100 ✓ (validate `points` 0 issues). D-198: 0 windows, Dice down (above) | No | OK |
| u02 p02 | `terms[2](かんばん方式).points[0].text_zh` | L2 | Yes: 拉动式 → 拉式 = zh_terms プル型 and `pairs[1].rows[1].a_zh` 「后工序领取的拉式」; the pull concept now has one zh name in the unit (D-208 (3) seed removed). `[[jp:引取り型]]`, bold and the JIT link kept; jp / en untouched (en pull-type already one form). 2021r03-q035 ア unaffected | No | OK |

## 3. Focused checks

### 3.1 u02 p01 (L1): 「在庫を部品の状態で」 vs 2013h25h-q015

- The new word is 在庫を (3 chars). It is not in q015's correct option イ, which uses 製品を…部品の形で保存. The phrase 「部品の状態で持っておき」 was already in the base (0 windows then and now).
- Wrong option ウ (JIT: procure at the needed time, hold little stock between processes) gets no support: the point keeps BTO = 受注生産の一種 and JIT = 工程の間に在庫をためない考え方 as two different focuses. 「在庫を」 on the BTO side does not contradict JIT's "no stock between processes" — the BTO stock is parts held before the order, and the second sentence states the focuses differ.
- Trilingual parity: zh / en already had the object; the patch closes the jp-only gap. Parity tool 0 diff (30 locations).
- **Resolved.**

### 3.2 u02 p02 (L2): 拉式 consistency

- zh_terms.json: `プル型 → 拉式`, `プッシュ型 → 推式`. After the patch the unit uses 拉式 in both places where the pull concept appears in zh (かんばん points[0], pairs[1].rows[1].a_zh) and 推式 for the push side. jp joins 引取り型 and プル型 in pairs[1] (「後工程が引き取るプル型」), so the zh reader now gets the same single name.
- **Resolved.**

### 3.3 u01 p01–p03

- p01 / p02: jp sentence 3 has an omitted subject (= センシング技術). zh / en now make it explicit with the term name. Facts unchanged; the data-vs-technology boundary (sensing stops at data, judgement is downstream — Rule A L2) still reads the same.
- p03: wording-only unification; the cited CE-purpose questions are answered by one / points[0] exactly as before.
- **Resolved.**

## 4. F-fix

None. No patch introduces a HIGH, MEDIUM or LOW defect that needs a change before commit.

## 5. Observations (record only)

1. LOW (style), u01 p01: 「传感技术是把…采集进来的技术」 repeats 技术 (subject + predicate noun). It mirrors jp 「…取り込む…技術である」 with the subject restored and reads naturally enough; an optional tighter form is 「传感技术就是把现实情况以数值形式采集进来的手段」, not required.
2. Script notes:
   - The index-paired memory_hooks check misreports u02 (生産方式 has no hook). The corrected check is clean.
   - `stage` meta is removed in both units (as in b19–b45).

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope; **0 introduced**
- LOW introduced: 0 that need a fix. Recorded: obs. 1. Obs. 2 is script notes.
- **Application:** 5/5 exact (replay). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (102 checked, 0 mismatch), all 5 match the Rule A text. Every 建議修 (u01 L3, u02 L1 / L2) is covered; u01 L5 (optional) adopted.
- **D-198:** no patch adds an overlap; u02 p01 0 jp windows before / after, Dice vs q015 イ 0.16 → 0.15.
- **D-200:** u02 p01 2 sentences / 77 chars ≤ 100.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 ×2
  - validate --part: 0 issues ×2 (sha256 = base_sha256)
  - parity: 0 diff ×2 (21 / 30 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 5 active patches of strategy-05-15 u01–u02 are applied exactly. Each resolves its Rule A finding, and none introduces a HIGH, MEDIUM or LOW that needs a fix. No F-fix.
