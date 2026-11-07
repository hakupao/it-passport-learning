# b59 B3 patch re-review — technology-17-46-u01 (ファイルシステムの基礎, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patch or the Rule A audit, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b58rv/` (shared with b58 / b60: `check.mjs` = `b53rv/check.mjs` with only the unit map changed; `d198.mjs` derived from `b57rv/d198.mjs`, multi-unit; `same.mjs` replays the full Rule A before → after on the base field).
- Date: 2026-11-08 (Session 150 続)
- Scope: the B3 wording patch for technology-17-46-u01. **1 is `active`, 0 retired**: p01 (`patches/technology-17-46-u01.json`), part-level.
  - Mapping to Rule A prescriptions (Rule A PASS, 建議修 L1 only): L1 → p01 (`terms[5](バックアップ).fig.data.rows[1].cells[2].en`). L2–L9 (記録のみ; L5 has an optional fix) are not patched and not re-ruled here.
  - **Shortened strings**: p01 drops the leading "The full backup plus " from the Rule A string. Replaying the **full** Rule A before → after on the base field gives exactly the unit field (§1 `same.mjs`), so it is the same edit as prescribed.
- Pre-patch base, located by sha256 = `base_sha256`: `data/ip/textbook/.planning/v2/technology-17-46-u01/parts/b59-u01-a2/technology-17-46-u01.loc.r0.json` `e0eef4ff06b98583…`.
- Merged unit (current) `data/ip/textbook/units/technology-17-46-u01.json` sha256 `b114e73290d6422b…`. It differs from the base only by the patched cell and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b49_patch_rereview.md` §0 (no unit-level patches in this batch), with the `same.mjs` replay of b57. Topic technology-17-46 has 26 questions, so there are 130 source strings per language.

1. **Application check** (`b58rv/check.mjs`): base sha256; `before` once in the base field; replay = unit field; every changed base-present path explained; net `before` remnant count; before / after verbatim (substring) in the Rule A file. Plus `b58rv/same.mjs`: full Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing). The patched cell has no derived copy.
3. **D-198** (`b58rv/d198.mjs`): whole-field LCS before → after and LCS of the `after` span against the 130 en sources.
4. **Cited-question check** in `data/ip/quiz/questions.json` + translations (stem_jp_clean): 2026r08-q086 (Saturday full, Sunday–Friday differential since the last full; restore to Tuesday end of day; answer エ = Saturday full + Tuesday differential; wrong ア = Sun–Tue differentials only, イ = Tuesday differential only, ウ = full + all of Sun–Tue).
5. **Manual reading** of the patched cell in context (三語, the same table row, and `terms[5].points[1]`) (§3).
6. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b58): the unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patch is present and correct in context, and that nothing but the patch changed in base-present paths. Unit-only paths (164) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-17-46-u01
✓ technology-17-46-u01 unit: 0 issues (data/ip/textbook/units/technology-17-46-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-17-46-u01
✓ technology-17-46-u01 parity: 30 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part data/ip/textbook/.planning/v2/technology-17-46-u01/parts/b59-u01-a2/technology-17-46-u01.loc.r0.json
sha256 e0eef4ff06b98583174b15333f52bedc9d77d6ab329b0abb28e1003bedd9b47a   (= base_sha256)
✓ technology-17-46-u01 part loc#0: 0 issues
EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  active 1 ok 1 | issues []
  base sha = base_sha256; before count in base = 1; replay mismatch 0
  changed base-present paths = 1 patched field + 'stage'; unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata); unit-only paths 164
  derived checked 66, mismatch 0
  bold 0 → 0, [[jp:]] 0 → 0
  memory_hooks hooked-terms pairing: 6/6 per language (18 checked), bad 0
  net before remnant: 0 (raw and stripped); grep "differential from the point" in the unit: 0
  ruleA verbatim miss: []
same.mjs (full Rule A before → after on the base field):
  Rule A before occurs once in the base field: 1/1
  base.replace(Rule A before, Rule A after) == unit field: 1/1 true
```

No validate warns on the unit or on the base part.

**Application.** The `before` string occurs exactly once in its base field, the `after` string is present, replay reproduces the cell. It is the Rule A text (shortened), and it makes exactly the Rule A edit (same.mjs 1/1).

D-198, before → after (`d198.mjs`, 130 en sources):

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | en | 18 → 18 (" the differential ", 2026r08-q086 en stem, term) | "the differential " (17, term) |

No copy-level overlap; the shared span is the term "differential (backup)".

## 2. Per-patch verdict

| ID | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[5](バックアップ).fig.data.rows[1].cells[2].en` (差分バックアップ row, 「復元に使うもの」 column) | L1 | Yes (§3): "The full backup plus the differential taken at the point you want to restore to" — "taken at" fixes the time point of the differential (no "from that point on" reading), = jp 「フルバックアップと、戻したい時点の差分」, = zh 「完全备份，加上要恢复到的时间点的差异备份」, = `points[1].text_en` "the differential backup taken at the point you want to restore to". 2026r08-q086 エ supported | No | OK |

## 3. Focused check: the differential row

| Column | jp | zh | en (current) |
|---|---|---|---|
| 方式 | 差分バックアップ | 差异备份 | Differential backup |
| 毎回複製する範囲 | 最後のフルバックアップ以降に変わった分 | 上次完全备份以后变化的部分 | Changes since the last full backup |
| 復元に使うもの (patched en) | フルバックアップと、戻したい時点の差分 | 完全备份，加上要恢复到的时间点的差异备份 | The full backup plus the differential **taken at** the point you want to restore to |

- Semantics: a differential holds all changes since the last full backup, so restoring to time T needs the full backup and the one differential taken at T. "taken at the point" says exactly that. The old "from the point" could be read as "changes from T onward", which is the wrong direction.
- 2026r08-q086 (restore to Tuesday end of day): Saturday full + Tuesday differential = エ ✓. ア (no full) and イ (Tuesday differential alone) are excluded because the cell names the full backup. ウ (all Sun–Tue differentials) is excluded because the cell names one differential.
- Consistency: `terms[5].points[1].text_en` "…the last full backup ([[jp:フルバックアップ]]) and the differential backup taken at the point you want to restore to" — same wording now. The incremental row ("every incremental up to the point you want to restore to") stays distinct (all incrementals vs one differential), = jp そこから戻したい時点までの増分すべて.
- 三語 parity ✓ (parity 0 diff, 30 locations). The table has no caption that mentions the old wording; grep finds 0 "differential from the point" left in the unit.
- **Resolved.**

## 4. F-fix

No required F-fix. The patch introduces no HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - validate (unit and part): 0 warns.
   - `stage` meta is removed in the unit (as in b19–b58).
   - ruleA verbatim miss = none. p01 is shortened; `same.mjs` confirms it equals the full Rule A edit.

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope; **0 introduced**
- LOW introduced: 0. Obs. 1 is script notes.
- **Application:** 1/1 exact (replay, part-level). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (66 checked, 0 mismatch). It is the Rule A text, and the shortened string makes exactly the Rule A edit. The one 建議修 (L1) is covered.
- **Hand check:** 2026r08-q086 エ (full + differential at the target point) is supported; ア / イ / ウ are excluded by the cell.
- **D-198:** en LCS 18 → 18 (the term "differential"); no copy-level overlap.
- **D-202:** [[jp:]] count unchanged (0). **D-204 / D-205 / D-210:** no law, standard or numeric claim added.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0, 0 warns
  - validate --part: 0 issues (sha256 = base_sha256)
  - parity: 0 diff (30 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** The 1 active patch of technology-17-46-u01 is applied exactly. It resolves Rule A L1 and makes the en cell agree with jp, zh and `points[1].text_en`. It introduces no HIGH, MEDIUM or LOW. No required F-fix.
