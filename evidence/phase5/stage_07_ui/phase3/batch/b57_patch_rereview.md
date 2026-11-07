# b57 B3 patch re-review — management-11-30-u01 (ファシリティマネジメント:電源対策と省エネ, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audit, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b57rv/` (`check.mjs` = `b53rv/check.mjs` with only the unit map changed; `d198.mjs` new for b57, derived from `b53rv/d198.mjs` with whole-field LCS, masked windows and wDice added; `same.mjs` new — replays the full Rule A before → after on the base field).
- Date: 2026-11-08 (Session 150 続)
- Scope: the B3 wording patches for management-11-30-u01. **11 are `active`, 0 retired**: p01–p11 (`patches/management-11-30-u01.json`), all part-level.
  - Mapping to Rule A prescriptions (Rule A PASS, 建議修 L1–L4):
    - L1 → p01–p03 (`terms[0](無停電電源装置).one_jp/zh/en`)
    - L2 → p04–p06 (`terms[1](UPS).points[0].text_jp/zh/en`, D-198 near-copy of 2017h29a-q074)
    - L3 → p07–p09 (`overview_rows[3](サージ防護).extra_jp/zh/en[1]`)
    - L4 → p10–p11 (`goals_zh[1]`, `pairs[1].rows[1].b_zh`)
  Every 建議修 is covered. L5–L7 (記録のみ) and O1–O3 are not patched and not re-ruled here.
  - **Shortened strings**: p01–p06 carry a shortened `before` / `after` (a sentence tail instead of the whole Rule A sentence); p07–p11 are the whole Rule A strings. For all 11, replaying the **full** Rule A before → after on the base field gives exactly the unit field (§1 `same.mjs`), so each shortened patch is the same edit as prescribed.
- Pre-patch base, located by sha256 = `base_sha256`: `data/ip/textbook/.planning/v2/management-11-30-u01/parts/b57-u01-a1/management-11-30-u01.loc.r0.json` `2c511b2181832a6e…`.
- Merged unit (current) `data/ip/textbook/units/management-11-30-u01.json` sha256 `95bd94ca04ca189d…`. It differs from the base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b49_patch_rereview.md` §0 (no unit-level patches in this batch). Topic management-11-30 has 27 questions, so there are 135 source strings per language.

1. **Application check** (`b57rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b57rv/same.mjs`: full Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`, `overview.intro_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b57rv/d198.mjs`, all 11 patches): whole-field LCS before → after and LCS of the `after` span against the 135 sources per language; jp 12-char windows (≤2 substitutions) unmasked / masked (カタカナ 4+ and 英数 → □, windows with < 6 real chars skipped) + wDice (char-bigram Dice, whole field vs best source); plus a unit-wide jp window scan against 2017h29a-q074.
4. **Cited-question checks** in `data/ip/quiz/questions.json` + translations (stem_jp_clean): 2017h29a-q074 (outage / voltage abnormality → notify + keep power for a set time + shut down safely; answer ウ UPS), 2011h23a-q043 (use of a UPS; answer ウ temporary supply / momentary drop; wrong イ long outage).
5. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (§3).
6. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b53): the unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (102) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit management-11-30-u01
✓ management-11-30-u01 unit: 0 issues (data/ip/textbook/units/management-11-30-u01.json), 1 warning(s)
  warn  zh-term  terms[3](サージ防護).detail_zh  タップ → 轻点 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit management-11-30-u01
✓ management-11-30-u01 parity: 24 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part data/ip/textbook/.planning/v2/management-11-30-u01/parts/b57-u01-a1/management-11-30-u01.loc.r0.json
sha256 2c511b2181832a6e145b93b3e0fe0ce4a4e055674af64bd862b50f3c851ad82c   (= base_sha256)
✓ management-11-30-u01 part loc#0: 0 issues, 1 warning(s) — the same タップ warn
EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  active 11 ok 11 | issues []
  base sha = base_sha256 for all 11; before count in base = 1 for all 11; replay mismatch 0
  changed base-present paths = 11 patched fields + 'stage'; unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata); unit-only paths 102
  derived checked 51, mismatch 0 (terms[0].definition_jp/zh/en follow p01–p03: true)
  bold counts unchanged in all 11; [[jp:]] counts unchanged in all 11
  memory_hooks hooked-terms pairing: 4/4 per language (15 checked), bad 0
  net before remnant: 0 for all 11 (raw and stripped)
  ruleA verbatim miss: []
same.mjs (full Rule A before → after on the base field):
  Rule A before occurs once in the base field: 11/11
  base.replace(Rule A before, Rule A after) == unit field: 11/11 true
  overview.intro_zh contains the p10 text (过大电压、电流): yes
```

The タップ → 轻点 `zh-term` warn is in `terms[3].detail_zh`, which no patch touches, and appears identically on the base part, so it predates the patches (Rule A O1: false positive, 电源插排 = power strip is the right zh).

**Application.** All 11 `before` strings occur exactly once in their base field, all 11 `after` strings are present, replay reproduces every patched field. All 11 are the Rule A text (p01–p06 as shortened tails, p07–p11 whole), and the shortened ones make exactly the Rule A edit (same.mjs 11/11).

D-198, before → after (`d198.mjs`, 135 sources per language; jp fields only carry the window columns):

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|
| p01 | **jp** | 7 → 7 (無停電電源装置, term) | である。(4) | 0 / 0 → 0 / 0; 0.18 → 0.17 |
| p02 | zh | 7 → 7 (不间断电源装置, term) | 时间内 (3) | — |
| p03 | en | 37 → 37 ("n uninterruptible power supply (UPS) ", term + abbreviation, unchanged part; 2022r04-q046 stem) | "ing equipment " (14) | — |
| p04 | **jp** | **8 → 5** (システムを安全に, 2017h29a-q074 stem → システムを, generic) | システムを (5) | **2 / 2 → 0 / 0**; 0.15 (2017h29a-q074) → 0.11 |
| p05 | zh | 4 → 5 ("UPS " → 关闭系统。, 2017h29a-q074 zh stem) | 关闭系统。(5) | — |
| p06 | en | 16 → 16 (" supplies power ", 2023r05-q048 stem, unchanged part) | " the system " (12, 2017h29a-q074 en stem) | — |
| p07 | **jp** | 4 → 3 (の異常を, 2017h29a-q074 → に入れ) | に入れ (3) | 0 / 0 → 0 / 0; 0.13 → 0.15 |
| p08 | zh | 2 → 2 | 设备 (2) | — |
| p09 | en | 11 → 13 (" abnormalit" → " of equipment", generic) | " of equipment" (13) | — |
| p10 | zh | 4 → 4 (停电对策, unchanged part) | 雷击等 (3) | — |
| p11 | zh | 2 → 2 | 设备 (2) | — |

No patch adds a copy-level overlap. wDice ≤ 0.18 in every jp field, far from the HIGH calibration (ed 0.14 / Dice 0.52). The p05 zh rise (4 → 5) and p06 en span (12) are the generic phrase "shut down the system" (关闭系统 / the system … shut down), the action the question is about; not a copy (§3.2).

## 2. Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[0](無停電電源装置).one_jp/zh/en` (+ definition_*) | L1 | Yes (§3.1): しばらくの間は / 在一段时间内 / for a while put a time limit into the definition itself, so `one` alone (glossary) no longer leans to 2011h23a-q043 誤答イ (long outage). Agrees with detail (数分から数十分程度), pairs[0].rows[1] (短時間), overview_rows[0].extra[0], and with 2017h29a-q074 (一定期間). Still 1 sentence; bold / [[jp:]] unchanged | No | OK |
| p04–p06 | `terms[1](UPS).points[0].text_jp/zh/en` | L2 (D-198) | Yes (§3.2): 「安全に停止させる」 is gone; jp field LCS with 2017h29a-q074 stem 9 → 5 (システムを), 12-char windows (≤2 subs) 2 → 0, unit-wide jp scan vs q074 = 0 windows. Claim unchanged (power lasts only while the battery holds → shut down within that time) = q074 ウ UPS; DMZ / GPU / VPN not supported. D-200: 1 sentence / 45 chars. 三語 same meaning | No | OK |
| p07–p09 | `overview_rows[3](サージ防護).extra_jp/zh/en[1]` | L3 | Yes (§3.3): 「異常な電気を機器に入れない」 = key_points[1] wording and terms[3].one (逃がして機器の故障を防ぐ); no longer overlaps the UPS rows (電源を止めない), whose 備える相手 includes 瞬時の電圧低下. zh 不让异常电压、电流进入设备 / en "Keeping abnormal electricity out of equipment" parallel to the other rows' 不让电源中断 / "Keeping power from stopping" | No | OK |
| p10–p11 | `goals_zh[1]` (+ overview.intro_zh), `pairs[1].rows[1].b_zh` | L4 | Yes (§3.4): 过大电压、电流 = jp 過大な電気 and = one_zh / overview_rows[3].one_line_zh / terms[3].points[0].text_zh (电压或电流). 在到达设备之前 = jp 機器の手前で / en before it reaches the equipment (前方 gone). No 过大(的)电流-only phrase left in zh | No | OK |

## 3. Focused checks

### 3.1 p01–p03: time limit in `one`

- After: jp 「停電や一瞬の電圧の落ち込みが起きても、しばらくの間は機器へ電力を送り続ける装置である。」/ zh 「…也能在一段时间内持续向设备供电。」/ en "…to keep feeding equipment for a while even when an outage or a momentary voltage dip occurs."
- 2011h23a-q043: ウ (temporary supply during an outage / prevent momentary voltage drop) — both halves now in `one`. イ (keep supplying during a long outage at a computer centre) — contradicted by しばらくの間 / for a while. ア / エ (phone battery, outdoor use) not supported.
- Derived definition_jp/zh/en = stripInline(one_*) (check.mjs true). The unit's other mentions (detail 数分から数十分, pairs[0].rows[1], overview_rows[0]) already said "short", so the change removes a field-alone reading and adds no contradiction.
- **Resolved.**

### 3.2 p04–p06: D-198 near-copy of 2017h29a-q074

- Before: jp 「…その時間を使ってシステムを安全に停止させる。」. q074 stem ends its purpose clause with システムを安全に終了させたい. My windows: 「てシステムを安全に停止さ」~「てシステムを安全に終了さ」 and 「システムを安全に停止させ」~「システムを安全に終了させ」 (2 substitutions each, 停止 / 終了; Rule A counted the overlap as hamming 1 on its own window — same overlap). Whole-field LCS 9 (てシステムを安全に).
- After: 「…その時間のうちに正しい手順でシステムを止める。」. LCS with the q074 stem 5 (システムを, a bare noun + particle); 0 windows unmasked and masked; wDice 0.15 → 0.11 and the nearest source is no longer q074. A scan of every jp string in the unit finds 0 windows (≤2 subs) against any q074 string. **The overlap is gone and no new jp overlap appears.**
- zh / en: q074 zh stem 安全地关闭系统 / en "the system can be shut down safely". Before: 让系统安全关闭 / "shut the system down safely". After: 按正确的步骤关闭系统 / "the system is shut down by the proper procedure within that time". The shared part is 关闭系统 (4 + 。) / "the system … shut down" — the verb-object the question asks about; "safely" / 安全 (the q074 qualifier) is gone from both. Not a copy; the zh rise 4 → 5 is a common phrase (no LOW).
- Accuracy: 「正しい手順で止める」 = orderly shutdown, which is what a UPS buys time for; no new claim (no notification, no 一定期間 echo). Supports q074 ウ; does not support DMZ / GPU / VPN.
- en reads slightly formal ("is shut down by the proper procedure") but is grammatical and = jp (obs. 1).
- **Resolved.**

### 3.3 p07–p09: overview_rows[3] 対策の系統

| Row | extra[1] jp / zh / en (current) |
|---|---|
| 無停電電源装置 / UPS / 自家発電装置 | 電源を止めない / 不让电源中断 / Keeping power from stopping |
| サージ防護 (patched) | 異常な電気を機器に入れない / 不让异常电压、电流进入设备 / Keeping abnormal electricity out of equipment |
| グリーンIT | 環境に配慮する / 顾及环境 / Caring for the environment |

- The new サージ防護 cell names what the measure does (block abnormal electricity at the equipment), matching terms[3].one_jp and key_points_jp[1] (「異常な電気を機器に入れない備え」 — same phrase). The old 電源の異常を防ぐ also fitted UPS (瞬時の電圧低下 is in its row's extra[0]); the new one does not, so the column separates the two directions.
- zh 异常电压、电流 = jp 異常な電気 (voltage and current), same choice as L4. 三語 parity ✓ (parity 0 diff).
- The remaining 電源の異常 / 电源异常 in terms[1].detail_* (UPS products that signal a power abnormality to the computer) is about UPS and correct; not in L3's scope.
- **Resolved.**

### 3.4 p10–p11: zh 过大电流 → 过大电压、电流

- goals_zh[1]: 「能够把保护设备免受雷击等侵入的过大电压、电流损害的浪涌防护…与停电对策区分开来。」 — = goals_jp[1] 過大な電気 / goals_en[1] excessive electricity. Derived overview.intro_zh carries the new text (same.mjs).
- pairs[1].rows[1].b_zh: 「在到达设备之前将过大的电压、电流导走」 — = b_jp 過大な電気を機器の手前で逃がす / b_en "Diverts excess electricity before it reaches the equipment"; 前方 (position) → 到达…之前 (before arrival).
- zh is now uniform: one_zh / overview_rows[3].one_line_zh 过大电压、电流, terms[3].points[0] 过大电压或电流, pairs[1].rows[0].b_zh 过电压、过电流. 2022r04-q041 (overcurrent / lightning → サージ防護 イ) still supported; its wrong options (UPS エ, グリーンIT ア) not supported.
- zh-term table: validate reports no new zh-term warn (the only warn is the pre-existing タップ one).
- **Resolved.**

## 4. F-fix

No required F-fix. No patch introduces a HIGH, MEDIUM or LOW defect that needs a fix.

## 5. Observations (record only)

1. LOW (style), p06: en "so the system is shut down by the proper procedure within that time" is a little stiff ("following the proper procedure" would read more naturally). It is the Rule A text verbatim and its meaning = jp / zh. Not required.
2. Script notes:
   - validate (unit and part): the 1 タップ → 轻点 zh-term warn predates the patches (same on base; Rule A O1 false positive).
   - `stage` meta is removed in the unit (as in b19–b53).
   - ruleA verbatim miss = none; p01–p06 are shortened tails, confirmed equal to the full Rule A edit by `same.mjs`.
   - My q074 window count is 2 substitutions (停止 / 終了) where Rule A said hamming 1; it is the same overlap measured on a different window, and it is 0 after the patch either way.

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope; **0 introduced**
- LOW introduced: 0 that need a fix. Recorded: obs. 1. Obs. 2 is script notes.
- **Application:** 11/11 exact (replay, part-level). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (51 checked, 0 mismatch; overview.intro_zh follows p10). 11/11 are the Rule A text; the 6 shortened ones (p01–p06) make exactly the Rule A edit. Every 建議修 (L1–L4) is covered.
- **D-198:** the L2 overlap with 2017h29a-q074 is gone (jp windows 2 → 0, LCS 9 → 5, nearest source no longer q074); no patch adds a copy-level overlap in any language; wDice ≤ 0.18.
- **D-200:** terms[1].points[0] 1 sentence / 45 chars. **D-195:** terms[0].one still 1 sentence (68 chars, bold kept).
- **D-202:** [[jp:]] counts unchanged in all 11 patched fields. **D-204 / D-205 / D-210:** no law, standard or numeric claim added.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 (1 pre-existing zh-term warn)
  - validate --part: 0 issues (sha256 = base_sha256), same warn
  - parity: 0 diff (24 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 11 active patches of management-11-30-u01 are applied exactly. Each resolves its Rule A 建議修 (L1–L4), including the D-198 near-copy of 2017h29a-q074 (overlap gone, no new overlap), and none introduces a HIGH, MEDIUM or LOW that needs a fix. No required F-fix.
