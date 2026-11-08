# b65 B3 patch re-review — technology-21-57 u01〜u02 (トランザクションの基礎と並行制御 / 障害回復(リカバリ))

- Reviewer: verifier (Opus 5.5). I did not write the patches or the two Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b65rv/`: `check.mjs` / `d198.mjs` / `d198m.mjs` / `same.mjs` copied from `b62rv/` with only the unit map changed (now 2 units). `same.mjs` reads the 6 Rule A full before / after pairs from `b65rv/ra.json`, which I copied by hand from the Rule A files (each string checked verbatim against the Rule A file: 6/6 before, 6/6 after). No scratch files in the repo.
- Date: 2026-11-08 (Session 151, b65)
- Scope: the B3 wording patches for 2 units. **6 are `active`, 0 retired**, all part-level:

| Unit | Rule A | Patches | Mapping to Rule A prescriptions | Shortened |
|---|---|---|---|---|
| u01 (トランザクションの基礎と並行制御) | PASS, 建議修 L1–L3 | p01–p03 | L1 → p01 (`terms[0].points[2].text_en`); L2 → p02 (`overview_rows[0].extra_jp[0]`); L3 → p03 (`terms[2].points[2].text_jp`) | 2/3 (p01, p03) |
| u02 (障害回復(リカバリ)) | PASS, 建議修 L1 | p01–p03 | L1 → p01–p03 (`terms[0](チェックポイント).detail_jp/zh/en` 3rd sentence) | 0/3 |

  Every 建議修 is covered. 記録のみ LOWs (u01 L4–L7, u02 L2–L9, incl. the u02 L1 related `key_points_*[0]` and the optional L8 en wording) and O-items are not patched and not re-ruled here.
  - **Shortened strings**: **2 of 6**. u01 p01 `before` / `after` are the middle phrase of the Rule A en sentence; u01 p03 drops the `**排他制御** は` prefix and `であり、` suffix of the Rule A strings. `same.mjs` confirms that base.replace(Rule A before, Rule A after) = unit field for **6/6**, so the shortened patches give the same result as the Rule A full strings.
- Pre-patch bases, located by sha256 = `base_sha256` (validate --part prints the same sha):
  - u01 `data/ip/textbook/.planning/v2/technology-21-57-u01/parts/b65-u01-a1/technology-21-57-u01.loc.r0.json` `e36cff716f97bc8b…`
  - u02 `.../technology-21-57-u02/parts/b65-u02-a1/technology-21-57-u02.loc.r0.json` `001a38509dac1e41…`
- Merged units (current) `data/ip/textbook/units/technology-21-57-u0N.json` sha256: u01 `fc8a32da23590903…`, u02 `b5b77e25ecf6b430…`. Each differs from its base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b62_patch_rereview.md` §0 (no unit-level patches in this batch). Both units share topic technology-21-57 (24 questions), so there are 120 source strings per language.

1. **Application check** (`b65rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b65rv/same.mjs`: full Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b65rv/d198.mjs` + `d198m.mjs` for the masked window list, all 6 patches): whole-field LCS before → after and LCS of the `after` span against the 120 sources per language; jp also 12-char windows (≤2 substitutions; unmasked / masked) and Dice.
4. **Cited-question checks** (from the Rule A files, re-read against the patched text): 2025r07-q061 (answer ウ = a series of DB processing confirmed when all succeed, returned to before when one fails) for u01 L2; 2015h27h-q077 (answer ウ 排他制御; wrong イ デッドロック; the stem's wording 「同時アクセスによる矛盾」) for u01 L3 (the caller's brief wrote "2013h25a?-q077"; the Rule A file and the unit's qid are **2015h27h-q077**); the 4 lost-update questions (2009h21h-q082 / 2010h22h-q082 / 2012h24a-q080 / 2020r02o-q072) for u01 L1; 2026r08-q056 (answer エ = checkpoint) for u02 L1.
5. **Cross-unit / in-unit check** for u02 L1: u02 ロールフォワード `detail_*` + fig, フォワードリカバリ mix 考点, チェックポイント fig, `key_points_*[0]`, `pairs[0]`; and u01 (no checkpoint text; ACID 耐久性 / ログ).
6. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (per-unit §3), plus unit-wide greps for old wording.
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit` (per unit), `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b63): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 113 / u02 112) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-21-57-u01   → ✓ 0 issues, 1 warning(s)   EXIT=0
  warn  choice-echo  terms[1](ACID特性).points[1].text_jp  2009h21a-q088 イ
$ node --no-warnings scripts/textbook-v2-parity.mjs   --unit technology-21-57-u01   → ✓ 24 locations, 0 diff    EXIT=0
$ ... validate --unit technology-21-57-u02 → ✓ 0 issues   EXIT=0 | parity → ✓ 26 locations, 0 diff  EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part <base>   (one per unit)
  u01 counts {"terms":4,"figs":4,"steps":8,"points":11,"pairs":1,"key_points":5,"goals":4}  sha256 e36cff716f97bc8b…  ✓ 0 issues  EXIT=0
  u02 counts {"terms":5,"figs":3,"steps":12,"points":8,"pairs":1,"key_points":4,"goals":3}  sha256 001a38509dac1e41…  ✓ 0 issues  EXIT=0
  (both sha256 = base_sha256 of every patch in that unit)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs (per unit):
  u01 active 3 ok 3 | issues [] | changed base-present = 3 patched + 'stage' | unexplained besides 'stage' 0 | derived 51, mismatch 0 | memory_hooks 12 bad 0, lens 4/4/4
  u02 active 3 ok 3 | issues [] | changed base-present = 3 patched + 'stage' | unexplained 0 | derived 51, mismatch 0 | memory_hooks 15 bad 0, lens 3/3/3
  base sha = base_sha256 for all 6; before count in base = 1 for all 6; replay mismatch 0
  base-only top keys (both): stage / round / jp_round (part metadata)
  net before remnant: 0 for all 6 (raw and stripped)
  bold counts unchanged in all 6 (u01 p03 2→2, u02 p01–p03 2→2 each); [[jp:]] counts unchanged in all 6
  derived followers (all true): u02 explanation_jp/zh/en of terms[0] (p01–p03). u01 p01–p03 fields have no derived copy (points / overview_rows)
  ruleA verbatim miss: [] in both units
same.mjs (full Rule A before → after on the base field):
  Rule A before occurs once in the base field: 6/6 (u01 3/3, u02 3/3)
  base.replace(Rule A before, Rule A after) == unit field: 6/6 true
grep in the units (old wording, expect 0):
  u01 "データベースに対する" 0 / "同時アクセスによる" 0 / "both read the same value and then" 0
  u02 "障害が起きたときは" 0 / "After a failure, recovery" 0;  "发生故障时" 1 (= unit_summary_zh 「学习在发生故障时将数据库恢复…」, the unit's general framing, not the checkpoint sentence; out of scope)
```

The 1 validate warn on u01 (choice-echo, `terms[1](ACID特性).points[1].text_jp` ↔ 2009h21a-q088 イ) is the warn the Rule A file ruled on in §1-4 (d) (not (iii): positive definition of isolation + mechanism, no option set reproduced). No u01 patch touches `terms[1]`, so it is not caused by the patches. (`--part` mode prints 0 warns on both bases, because it does not run the cited-question checks; the unit warn is the same one the Rule A §6 gate output records.)

**Application.** All 6 `before` strings occur exactly once in their base field, all 6 `after` strings are present, and replay reproduces every patched field. 2 are shortened phrases of the Rule A strings, and all 6 give exactly the Rule A after text (same.mjs 6/6).

## U1. technology-21-57-u01 (Rule A PASS, 建議修 L1–L3)

### U1.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | en | 21 → 21 (" in parallel without ", 2013h25a-q067 stem, unchanged text) | " only the l" (11, 2014h26a-q071 stem, generic) |
| p02 | jp | **13 → 8** (データベースに対する一連の, 2025r07-q061 c2 = correct ウ → データベースへの, 2018h30a-q063 c1, generic) | データベースへの (8); win12 7/8 → 0/1; Dice 0.46 → 0.37 |
| p03 | jp | **11 → 6** (同時アクセスによる矛盾, 2015h27h-q077 stem → デッドロック, term name) | 同時アクセス (6, q077 stem, term-level noun); win12 4/4 → 0/0; Dice 0.20 → 0.17 |

- **p02 re-measured on the new string**: the q061 ウ run 「データベースに対する一連」 is gone (unmasked 12-char windows 7 → 0, incl. the two d0 windows on q061 ウ). The 1 remaining masked near-window (`2026r08-q056 c0`: 「□□□□□□への一連の更」~「□□□□□□□の一連の処」, d2) is mostly masked katakana + 「の一連の」 (a generic phrase) on a wrong option, not the q061 correct option. The new longest run is 8 (「データベースへの」), a generic DB phrase.
- **p03 re-measured on the new string**: the q077 stem run 「同時アクセスによる矛盾」 (11) is gone; the longest field run is now the term name デッドロック (6), and the `after` span's longest is 同時アクセス (6). 12-char windows 4/4 → 0/0. The new wording 「同時アクセスで起こる矛盾」 = `goals_jp[2]`, as Rule A L3 intended.
- p01: whole-field 21 is the unchanged opening (" in parallel without "), not the patched span; the patch does not raise it (21 → 21).

No patch adds a meaningful overlap; p02 / p03 remove the two overlaps Rule A L2 / L3 named.

### U1.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[0](トランザクション).points[2].text_en` | L1 | Yes: "If two processes update in parallel without locks and both read the same value before writing in turn, only the later write survives…" — "both read the same value" is now inside the condition, = jp 「…二つの処理が同じ値を読み込んでから順に書き込むと、」 / zh 「如果…两个处理读入同一个值后依次写入，」. The limiting condition (without locks) is kept; result clause unchanged | No | OK |
| p02 | `overview_rows[0].extra_jp[0]` | L2 | Yes: 「データベースへの一連の更新」 — same meaning, = zh 「对数据库的一系列更新」 / en "A series of updates to a database" (unchanged) | No | OK |
| p03 | `terms[2](デッドロック).points[2].text_jp` (mix, 2015h27h-q077) | L3 | Yes: 「**排他制御** は同時アクセスで起こる矛盾を防ぐための仕組みであり、」 — same claim, now worded like `goals_jp[2]`; the デッドロック side and the closing sentence (目的の仕組みか、生じる問題か) are unchanged; zh / en unchanged and still agree | No | OK |

### U1.3 Focused checks

- p01 vs the 4 cited lost-update questions (qids kept: 2009h21h-q082 / 2010h22h-q082 / 2012h24a-q080 / 2020r02o-q072): the en now states the same rule as jp (if both read the same value and then write, the later write survives). It no longer implies that every lock-free parallel update reads the same value. Rule A's recalculation of the 4 questions (§1-2) is about this rule, so it is unaffected. D-200: still 1 sentence.
- p03 vs 2015h27h-q077 (answer ウ 排他制御, wrong イ デッドロック): both sides still positive definitions (mechanism / stall it can cause), the D-209 confusable-pair exclusion still applies, and the question's stem phrasing is no longer reproduced. qid kept, kind mix.
- p02: overview cell only; the q061 distinguishing content (all succeed → confirm, fail → back) was never in the cell and is not added.
- Siblings: `terms[0].detail_jp` (排他制御 / ロック), `goals_jp[2]`, `terms[0].points[1]` unchanged and agree. Parity 24 / 0 diff.
- **u01: all L1–L3 resolved.**

## U2. technology-21-57-u02 (Rule A PASS, 建議修 L1)

### U2.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 8 → 8 (チェックポイント, term name, 2026r08-q056 stem) | システム (4, 2009h21a-q088 stem); win12 0/0 → 0/0; Dice 0.13 → 0.11 |
| p02 | zh | 5 → 5 ("DBMS ", 2015h27h-q077 stem) | 系统 (2) |
| p03 | en | 14 → 14 (" checkpoint in", 2026r08-q056 stem, unchanged text) | " the system " (12, 2012h24a-q067 c1, generic) |

No patch adds a meaningful overlap (all field maxima unchanged; the added phrase overlaps only generic words).

### U2.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[0](チェックポイント).detail_jp/zh/en` 3rd sentence (+ explanation_*) | L1 | Yes (§U2.3): jp 「システムが止まりディスクの内容は残っている障害では、…直近のチェックポイントから回復を始められる。」 / zh 「发生系统停止但磁盘内容仍保留的故障时，…从最近的检查点开始恢复即可。」 / en "After a failure that stops the system but leaves the disk intact, recovery can start from the latest checkpoint…" — the checkpoint start is now limited to failures that keep the disk; three languages say the same condition | No | OK |

### U2.3 Focused checks — L1 vs ロールフォワード / fig / u01

- **ロールフォワード (`terms[3]`)**: detail 「例えばディスクが壊れてデータが失われたときは、まず…バックアップを戻す…ログに記録された更新後の値を古いものから順に書き込み」 and fig (ディスクが壊れる → バックアップを戻す → 更新後の値を順に適用 → 障害直前) are unchanged. The checkpoint detail now covers the other case (system stops, disk intact), so the two terms no longer give two different start points for the same failure: disk broken → backup (ロールフォワード); system stop with disk intact → latest checkpoint (チェックポイント). **Consistent in all three languages.**
- **フォワードリカバリ mix 考点** (「ディスクの破損でデータそのものが失われたときに用いるのはフォワードリカバリ…バックワードリカバリは、今あるデータベースが失われずに使えることを前提」) and `pairs[0]` 出発点 (現在のデータベース / バックアップなど過去の時点) are unchanged and agree with the new limit (disk intact ↔ current DB usable).
- **チェックポイント fig** (unchanged): n3 「障害が起きる」 / step 3 「障害が起きると、メモリ上にあってまだ書き出していない更新は失われる」 — the step itself describes a memory-loss (system) failure, which is exactly the new detail's case, so detail and fig now agree more closely. The node label n3 and `key_points_*[0]` (「…回復はその時点から始められる」) remain unqualified; Rule A L1 marked `key_points[0]` 記録のみ and named only the detail. Recorded in §5.
- **Technical accuracy**: at IT パスポート level, system failure (DBMS / OS stop, disk content kept) → recover from the latest checkpoint using the log; media failure → restore backup + roll forward. The patched sentence matches this. It adds no number, standard or closed list (D-204 / D-205 / D-210). The O2 combination (rollforward committed / rollback uncommitted after the checkpoint) is still not stated; Rule A O2 judged it out of the cited-question range.
- **2026r08-q056** (answer エ = writing in-memory updates to external storage together / that moment): `terms[0].one_*` and `points[0]` (qid kept) are unchanged; the detail change does not affect the answer.
- **u01**: u01 has no checkpoint text. Its ACID 耐久性 (`terms[1]`: 障害が起きても失われない) and ログ (`terms[0].detail_jp`) are unchanged and do not conflict with the new limit.
- Derived `explanation_jp/zh/en` follow (check.mjs). Bold 2 → 2 (バッファ / ログ). Parity 26 / 0 diff. **u02: L1 resolved.**

## 4. F-fix

No required F-fix in either unit. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - validate: u01 has 1 choice-echo warn (`terms[1](ACID特性).points[1].text_jp` ↔ 2009h21a-q088 イ), the one Rule A §1-4 (d) ruled not (iii); it is outside every patched field. u02 has 0 warns. `--part` prints 0 warns on both bases.
   - `stage` meta is removed in both units (as in b19–b63).
   - ruleA verbatim miss = none. 2 of 6 patches use shortened phrases; same.mjs shows all 6 give the same field as the Rule A full strings.
   - u02 patches use labelled paths (`terms[0](チェックポイント)…`), u01 unlabelled. Both forms resolve in check.mjs / d198.mjs / same.mjs.
   - The caller's brief named the u01 L3 question as "2013h25a?-q077"; the Rule A file and the unit's qid are 2015h27h-q077. I measured against 2015h27h-q077.
2. u02 `key_points_jp/zh/en[0]` (+ summary copy) and the チェックポイント fig node n3 (「障害が起きる」) still state the checkpoint start without the failure type. Rule A L1 marked key_points 記録のみ, and the fig step 3 caption fixes the context to memory loss. If anyone touches them later, align them with p01–p03 (for example 「システム障害からの回復は…」).
3. u02 `unit_summary_zh` keeps 「发生故障时」 as the unit's general framing (all recovery methods), not a checkpoint claim. Not a remnant of p02.
4. u01 p02: one masked near-window remains (2026r08-q056 ア: 「□□□□□□への一連の更」 ~ 「□□□□□□□の一連の処」, d2). It is mostly masked katakana + 「の一連の」, on a wrong option's generic phrase. Not a D-198 concern.

## 6. Overall verdict

| Unit | Rule A | Applied | MEDIUM in scope | HIGH / MEDIUM / LOW introduced | Verdict |
|---|---|---|---|---|---|
| technology-21-57-u01 | PASS | **3/3** | — | 0 / 0 / 0 | **PASS** |
| technology-21-57-u02 | PASS | **3/3** | — | 0 / 0 / 0 | **PASS** |

- **Application:** 6/6 exact (replay, part-level). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (102 checked, 0 mismatch), memory_hooks pairing 0 bad. 2/6 shortened, and all 6 give the same field as the Rule A full string (same.mjs). Every 建議修 is covered.
- **D-198:** u01 p02 removes the 2025r07-q061 ウ overlap (field LCS 13 → 8, unmasked 12-char windows 7 → 0); u01 p03 removes the 2015h27h-q077 stem run (11 → 6, windows 4 → 0). u01 p01 and u02 p01–p03 leave every field maximum unchanged.
- **D-200:** no 考点 claim reversed; u01 p01 keeps the q082 / q080 / q072 rule with its condition; u01 p03 keeps the q077 contrast. **D-202:** [[jp:]] counts unchanged. **D-204 / D-205 / D-210:** no new law, standard, version or numeric claim.
- **Gates:**
  - validate --unit ×2: 0 issues / EXIT 0 (u01: 1 warn, pre-existing, ruled in Rule A)
  - validate --part ×2: 0 issues, sha256 = base_sha256 for each
  - parity ×2: 0 diff (24 / 26 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS for both units.** All 6 active patches are applied exactly. u01 L2 / L3 overlaps are gone on the new strings, and the u01 en lost-update sentence now states the condition like jp / zh. u02 p01–p03 limit the checkpoint start to failures that stop the system but keep the disk. This now agrees with the unit's ロールフォワード detail / fig (disk broken → backup) and the フォワードリカバリ 考点 in all three languages, and does not conflict with u01. None of the patches introduces a HIGH, MEDIUM or LOW. No required F-fix.
