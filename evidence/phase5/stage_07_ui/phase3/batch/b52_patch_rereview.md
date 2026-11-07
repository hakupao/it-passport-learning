# b52 B3 patch re-review — technology-21-56-u01 (データ操作の基本(挿入・更新と抽出の関係演算), Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audit, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b52rv/` (`check.mjs` adapted from `rr/check.mjs` (b49), only the unit map and topic prefix changed, plus a sha / context dump; `d198.mjs` adapted from `b50rv/d198.mjs`, topic / unit list changed, plus a whole-field pass; `extra.mjs` new: case-insensitive en LCS, uppercase AND / OR scan of the topic sources, jp bigram containment).
- Date: 2026-11-08 (Session 150)
- Scope: the B3 wording patches for technology-21-56-u01. **3 are `active`, 0 retired**: p01–p03 (`patches/technology-21-56-u01.json`), all part-level.
  - Mapping to Rule A prescriptions (Rule A u01 PASS, 建議修 L1–L2):
    - L1 → p01 (`terms[0](挿入).analogy_jp`) / p02 (`terms[0](挿入).analogy_zh`); en unchanged, as Rule A prescribes
    - L2 → p03 (`key_points_en[0]`, + derived `summary.key_points_en[0]`)
  - The main session shortened each before / after to the changed clause. Each shortened pair is a substring of the Rule A before / after text, and replaying it on the base field gives exactly the Rule A after text (§1). Same edit as prescribed.
  Every 建議修 is covered. LOWs L3–L9 are 記録のみ, not patched and not re-ruled here.
- Pre-patch base, located by sha256 = `base_sha256`: `data/ip/textbook/.planning/v2/technology-21-56-u01/parts/b52-u01-a2/technology-21-56-u01.loc.r1.json` `685eb7cbba696105…`
- Merged unit (current) `data/ip/textbook/units/technology-21-56-u01.json` sha256 `7a90be73aeab4207…`. It differs from its base only by the 3 patched fields (+ derived copy) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b49_patch_rereview.md` §0 (no unit-level patches here). Topic technology-21-56 has 31 questions, so there are 155 source strings per language.

1. **Application check** (`b52rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (also over stripped text); before / after verbatim in the Rule A file.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b52rv/d198.mjs` + `extra.mjs`, all 3 patches): span and whole-field LCS before → after against the 155 sources per language; jp 12-char windows (≤2 substitutions); jp bigram containment (my approximation of the wDice column); en case-insensitive LCS and a scan for uppercase AND / OR in the topic sources.
4. **Cited-question checks**: none needed. No patch touches a point, fig value or quiz; the two analogy fields and key_points_en[0] carry no qid. The questions behind key_points[0] (2011h23tokubetsu-q059, 2016h28a-q074 and/or rules; 2024r06-q093 / 2016h28h-q096 / 2017h29h-q090 wildcards) are unaffected by a change of letter case.
5. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (§3).
6. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b51): the unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (168) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-21-56-u01
✓ technology-21-56-u01 unit: 0 issues (data/ip/textbook/units/technology-21-56-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-21-56-u01
✓ technology-21-56-u01 parity: 27 locations, 0 diff
EXIT=0
validate --part (base): u01 loc#1 0 issues (sha256 685eb7cb… = base_sha256) EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  u01 active 3 ok 3 | issues []
  part-level: base sha = base_sha256 for all 3; before count in base = 1 for all 3; replay mismatch 0
  changed base-present paths = patched fields + 'stage' (3+1); unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata)
  derived checked 57, mismatch 0 (summary.key_points_en[0] = stripInline(key_points_en[0]): true)
  bold counts unchanged in all 3 (0→0); [[jp:]] counts unchanged (0→0 / 0→0 / 1→1)
  memory_hooks hooked-terms pairing: 5/5 per language (15), bad 0
  net before remnant: 0 for all 3
  ruleA verbatim miss: []
grep (data/ip/textbook, apps/web/src, *.json) for the 3 before strings: only .planning part files (pre-patch history), none in units/
```

**Application.** All 3 `before` strings occur exactly once in their base field, all 3 `after` strings are present, replay reproduces every patched field. All 3 before / after pairs are the Rule A text verbatim (as substrings: the main session shortened them to the changed clause; the full field after replay equals the Rule A after text:
- jp 「来店客の名簿に、初めて来た客の分を 1 行書き足すこと。」
- zh 「就像在到店顾客名册上，为第一次来的客人补写一行。」
- en "Selection ([[jp:選択]]) conditions can be combined with AND, OR, and parentheses, and strings can also be specified with patterns that use % and _.").

D-198, before → after (`d198.mjs` / `extra.mjs`, 155 sources per language; jp fields only carry the window columns):

| Patch | Lang | LCS before → after (whole field, nearest source) | Longest `after`-span overlap | jp windows before / after; bigram containment |
|---|---|---|---|---|
| p01 | **jp** | 3 → 4 (すこと → 「を 1 」, generic) | 「を 1 」 (4, 2009h21h-q093 stem, generic) | 0 / 0; 0.14 → 0.13 |
| p02 | zh | 2 → 2 (一次, generic) | 一次 (2) | — |
| p03 | en | 12 → 12 (" conditions ", unchanged part, 2009h21h-q093 stem) | "can be c" (8; case-insensitive 8, " with an") | — |

No patch adds a copy-level overlap; 0 jp windows before and after; containment far from the HIGH calibration (ed 0.14 / Dice 0.52). One topic source uses uppercase OR in en (2025r07-q066 stem, a login condition); p03's after shares no span longer than 8 chars with it or any other source.

## 2. Per-patch verdict

| Unit / IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[0](挿入).analogy_jp` | L1 | Yes (§3.1): 「欄」→「分を 1 行」. The analogy now adds a row, matching one_jp (新しい **行** を書き加える), the insert fig (B03 = one added row) and en "adding a line". 欄 is left only in terms[1](更新).analogy (番号欄 = a column item), so the row / column split is now clean | No | OK |
| p02 | `terms[0](挿入).analogy_zh` | L1 | Yes: 补写一栏 → 补写一行 = jp 1 行 / en a line. 栏 is left only in terms[1].analogy_zh (号码栏 = column item) | No | OK |
| p03 | `key_points_en[0]` (+ `summary.key_points_en[0]`) | L2 | Yes (§3.2): operators AND / OR now differ from the conjunction "and", and match `terms[2].points[0].text_en`. Derived copy updated. jp / zh keep and・or / and、or (no ambiguity there; same as their terms[2].points[0]) | No | OK |

## 3. Focused checks

### 3.1 p01 / p02: 挿入 analogy 「1 行」

- Agreement with the 挿入 definition and figure:
  - one_jp / zh / en: 新しい **行** を書き加える / 写入新**行** / writes a new **row** — the analogy now names a row, not a column.
  - detail_jp: 表 = 列 (フィールド) + 行 (レコード, 1 件分のデータ). 「初めて来た客の分を 1 行」 = one customer's record = one row, the detail's own definition of 行.
  - fig (static table): B01 / B02 もとからある行, B03 挿入で加えた行 (key) — exactly one row added, as in the analogy.
- Count restriction (a1 jp-review r1 MEDIUM 「1 件増える」, resolved earlier): the 1 here is per customer inside the analogy (one first-time customer → one row). It does not say an INSERT adds only one row; one / pairs / overview keep 行が増える / More rows with no count. Not a regression.
- D-204 (analogy scope): the analogy covers what it should (a new entry added to an existing list; existing entries unchanged) and does not claim more (no column added, no rewrite of existing rows, which belongs to 更新's analogy). The two analogies now contrast cleanly: 挿入 = add a row (行), 更新 = rewrite one item (番号欄 / 号码栏 / "just the phone number").
- 三語: jp 分を 1 行書き足す / zh 补写一行 / en "adding a line for a first-time customer" — same image, one row per customer. en needed no change and still matches the new jp / zh (a line = 1 行 = 一行).
- D-198: no question in the topic has a visitor list; overlap 4 / 2 chars, generic.
- **Resolved, accurate.**

### 3.2 p03: AND / OR in key_points_en[0]

- After: "…can be combined with AND, OR, and parentheses, and strings…" — the operators are now visually separate from the list conjunction "and" and the following clause "and strings".
- Matches `terms[2].points[0].text_en` (Conditions linked with AND … OR …) — the term-level wording and the unit summary now use the same case (loc-review r2 LOW closed).
- Meaning unchanged: and = all, or = at least one, parentheses = grouping. The questions behind it (q059 イ, q074 エ) are unaffected.
- jp / zh keep lowercase and・or / and、or, as in their own terms[2].points[0]. Letter case does not change the fact, so parity is kept (parity 27 locations, 0 diff).
- [[jp:選択]] count 1 → 1; derived `summary.key_points_en[0]` = stripped form (Selection (選択) … AND, OR …).
- **Resolved, accurate.**

## 4. F-fix

No required F-fix. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Style, p03: en key_points / points use AND / OR, while jp / zh use lowercase and / or. This follows Rule A L2 (en only) and does not need a fix.
2. Script notes:
   - `stage` meta is removed in the unit (as in b19–b51).
   - The bigram-containment column is my approximation of b49's wDice (I did not have `d198b.mjs`); numbers are only for before → after comparison.
   - The 3 `before` strings remain only in `.planning/v2/technology-21-56-u01/parts/` (pre-patch rounds); none in `units/`.

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope; **0 introduced**
- LOW introduced: 0 that need a fix. Obs. 1 is style, obs. 2 is script notes.
- **Application:** 3/3 exact (replay, part-level). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (57 checked, 0 mismatch). 3/3 match the Rule A text (shortened to the changed clause; the replayed field equals the Rule A after text). Every 建議修 (L1, L2) is covered.
- **D-198:** no patch adds a copy-level overlap; 0 jp windows before and after.
- **D-204:** the 挿入 analogy now agrees with one / detail / fig (one row added) and contrasts with 更新's 番号欄; en analogy_en still matches the new jp / zh.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0
  - validate --part: 0 issues (sha256 = base_sha256)
  - parity: 0 diff (27 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 3 active patches of technology-21-56-u01 are applied exactly. Each resolves its Rule A 建議修 (L1 jp / zh, L2 en), and none introduces a HIGH, MEDIUM or LOW that needs a fix. No required F-fix.
