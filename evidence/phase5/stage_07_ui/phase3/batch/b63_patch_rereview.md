# b63 B3 patch re-review — technology-17-48-u01 (オープンソースソフトウェア(OSS)とライセンス, Rule A FAIL MEDIUM 1, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audit, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b63rv/`: `check.mjs` / `d198.mjs` / `same.mjs` copied from `b58rv/` with only the unit map changed. `d198.mjs` also strips the `(term)` label from the field path before the lookup, because these patches use labelled paths (`terms[1](GPL).detail_jp`). The patch tool accepts this form (`parseField` checks the label against `terms[i].term`).
- Date: 2026-11-08 (Session 151, b63)
- Scope: the B3 wording patches for technology-17-48-u01. **7 are `active`, 0 retired**: p01–p07 (`patches/technology-17-48-u01.json`), all part-level.
  - Mapping to Rule A prescriptions (Rule A FAIL: MEDIUM 1 = M1; 建議修 L1 / L2 / L3):
    - M1 → p01–p03 (`terms[1](GPL).detail_jp / detail_zh / detail_en`, 2nd sentence)
    - L1 → p04–p05 (`terms[2](コピーレフト).hook_jp / hook_zh`)
    - L2 → p06 (`key_points_zh[0]`)
    - L3 → p07 (`terms[1](GPL).hook_zh`)
  M1 and every 建議修 are covered. L4–L8 (記録のみ) and O1–O3 are not patched and not re-ruled here. L5 / L7 (record only) concern GPL fields next to p01–p03, so they are re-read in §3.1 only for regression.
  - **Shortened strings**: **all 7** (the brief named p01–p03 and p05–p07; p04 is shortened too: its `before` is a phrase of the Rule A L1 jp sentence, not the whole sentence). Each patch `before` / `after` is a phrase inside the Rule A before / after sentence. `same.mjs` confirms that base.replace(Rule A before, Rule A after) = unit field for all 7, so the shortened patches give the same result as the Rule A full sentences.
- Pre-patch base, located by sha256 = `base_sha256`: `data/ip/textbook/.planning/v2/technology-17-48-u01/parts/b63-u01-a1/technology-17-48-u01.loc.r0.json` `dab3cf00b3570b27…`.
- Merged unit (current) `data/ip/textbook/units/technology-17-48-u01.json` sha256 `3bb8c9104f90fa11…`. It differs from the base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b60_patch_rereview.md` §0 (no unit-level patches in this batch). Topic technology-17-48 has 25 questions, so there are 125 source strings per language.

1. **Application check** (`b63rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b63rv/same.mjs`: full Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b63rv/d198.mjs`, all 7 patches): whole-field LCS before → after and LCS of the `after` span against the 125 sources per language; jp also 12-char windows and Dice.
4. **Cited-question checks** in `data/ip/quiz/questions.json`: 2026r08-q073 (copyleft; answer エ = a distributed derivative must use the same license as the original; wrong ア 著作権放棄 / イ 対価要求必須 / ウ 改変部分ソース非公開で配布可), 2017h29h-q093 (the inappropriate act; answer イ = adding a ban on competitors to the license; ウ = selling DVD copies of collected OSS is appropriate), 2024r06-q080 and 2026r08-q097 (selling / paid media is allowed).
5. **Primary source** for M1: GNU GPL FAQ (https://www.gnu.org/licenses/gpl-faq.html, fetched 2026-11-08).
6. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (§3).
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b60): the unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (78) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-17-48-u01
✓ technology-17-48-u01 unit: 0 issues (data/ip/textbook/units/technology-17-48-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-17-48-u01
✓ technology-17-48-u01 parity: 19 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part data/ip/textbook/.planning/v2/technology-17-48-u01/parts/b63-u01-a1/technology-17-48-u01.loc.r0.json
counts {"terms":3,"figs":2,"steps":4,"points":6,"pairs":1,"key_points":4,"goals":3}
sha256 dab3cf00b3570b27ef264e41f6a83cfccea635ffbaee8b607aed694b2314b78f   (= base_sha256)
✓ technology-17-48-u01 part loc#0: 0 issues
EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  active 7 ok 7 | issues []
  base sha = base_sha256 for all 7; before count in base = 1 for all 7; replay mismatch 0
  changed base-present paths = 7 patched fields + 'stage'; unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata); unit-only paths 78
  derived checked 36, mismatch 0 (explanation_jp/zh/en follow p01–p03; memory_hook_jp/zh of terms[2] follow p04/p05; memory_hook_zh of terms[1] follows p07: all true)
  bold counts unchanged in all 7 (0/0/0/0/0/1/0); [[jp:]] counts unchanged in all 7 (all 0)
  memory_hooks hooked-terms pairing: 3/3 per language (9 checked), bad 0; lens 2/2/2
  net before remnant: 0 for all 7 (raw and stripped); grep 改変したものを配るときは / distributes a modified version must / right (右) / right（右） / 源代码公开、使用 / 首字母缩写 / 自己又重复 in the unit: 0
  ruleA verbatim miss: []
same.mjs (full Rule A before → after on the base field):
  Rule A before occurs once in the base field: 7/7
  base.replace(Rule A before, Rule A after) == unit field: 7/7 true
```

No validate warns on the unit or on the base part.

**Application.** All 7 `before` strings occur exactly once in their base field, all 7 `after` strings are present, and replay reproduces every patched field. All 7 are shortened phrases of the Rule A sentences, and each gives exactly the Rule A after text (same.mjs 7/7).

D-198, before → after (`d198.mjs`, 125 sources per language):

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap | jp win12 (unmasked/masked) |
|---|---|---|---|---|
| p01 | jp | 8 → 8 (のソフトウェアの, 2016h28h-q059 stem, unchanged 1st sentence) | できるが (4) | 1/6 → 1/6 (the 1 hit is unchanged ソースコードを入手できる ~ 2017h29a-q064 c3 ソースコードを改変できる, d2, generic); Dice 0.21 → 0.21 |
| p02 | zh | 6 → 6 (Linux, name) | 分发时 (3) | — |
| p03 | en | 17 → 17 (" for the software", unchanged 1st sentence) | " distribute" (11) | — |
| p04 | jp | 4 → 4 (著作権を) | ) に (3) | 0/0 → 0/0; Dice 0.09 → 0.08 |
| p05 | zh | 11 → 11 (" copyright ", word) | copyright (10) | — |
| p06 | zh | 9 → 9 (开源软件(OSS), term) | 源代码 (3) | — |
| p07 | zh | 3 → 3 ("ot ") | "ot " (3) | — |

No patch adds an overlap. All nearest spans are terms, names or unchanged text.

## 2. Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[1](GPL).detail_jp` (+ explanation_jp) | M1 | Yes (§3.1): 「…再配布できるが、配るときは改変したものも含めて、受け手がそのソースコードを入手できるようにし、配布物にも同じ GPL を付ける必要がある。」 The obligation now applies to any distribution | No | OK |
| p02 | `terms[1](GPL).detail_zh` (+ explanation_zh) | M1 | Yes: 「但分发时（包括分发修改后的版本），必须让接收者能够获取其源代码…」 = jp | No | OK |
| p03 | `terms[1](GPL).detail_en` (+ explanation_en) | M1 | Yes: "but anyone who distributes it, modified or not, must let the recipients obtain its source code and attach the same GPL to it." = jp | No | OK |
| p04 | `terms[2](コピーレフト).hook_jp` (+ memory_hook_jp, summary) | L1 | Yes: 「right (権利) を方向の「右」に見立て」 — the hook now says right means "rights" and the pun treats it as the direction | No | OK |
| p05 | `terms[2](コピーレフト).hook_zh` (+ memory_hook_zh, summary) | L1 | Yes: 「right（权利）当作方向的“右”」 = p04. en hook unchanged (Rule A: en did not need it) | No | OK |
| p06 | `key_points_zh[0]` (+ summary.key_points_zh[0]) | L2 | Yes: 「源代码公开，且使用、修改、再分发的自由由许可证明确允许」 — 源代码公开 is now a separate clause, not one item in the list of freedoms. = jp 公開され、…自由がライセンスで認められた | No | OK |
| p07 | `terms[1](GPL).hook_zh` (+ memory_hook_zh, summary) | L3 | Yes: 「GNU 是“GNU's Not Unix”的递归缩写，名字本身又出现在展开式里」 — 递归缩写 is the standard zh term; the literal 自己又重复出现在自己里面 is gone. = jp 再帰的頭字語 / en | No | OK |

## 3. Focused checks

### 3.1 p01–p03: M1 (GPL obligations apply to any distribution)

- jp (after): 「GPL のプログラムは自由に利用・改変・再配布できるが、配るときは改変したものも含めて、受け手がそのソースコードを入手できるようにし、配布物にも同じ GPL を付ける必要がある。」 The condition is now 配るとき (any distribution), with 改変したものも含めて making clear that modified copies are covered too. The contrast 「が」 now sets the freedoms against the duties that come with distribution, and no longer suggests that an unmodified redistribution has no duty.
- zh: 「但分发时（包括分发修改后的版本），必须…」, en: "anyone who distributes it, modified or not, must…". Same scope in all three languages. Parity 0 diff.
- **Primary source** (GNU GPL FAQ, fetched 2026-11-08): "if you distribute binaries, you must distribute the complete corresponding source code too" (applies to unmodified copies as well); "You are free to make modifications and use them privately, without ever releasing them"; a released modified version must be released "as a whole, under the GPL". The patched sentence matches the first and third points. The unchanged 3rd sentence (「改変版を配らずに手元だけで使う場合には、この義務は生じない」 / zh 只在自己手头使用、不分发修改版时 / en "Someone who only uses a modified version themselves and does not distribute it") matches the second point and still reads correctly after the 2nd sentence: この義務 = the distribution duties.
- **Consistency with sibling fields:**
  - `terms[2].one_jp`「改変して配るとき**にも**…引き継がせる」 (zh 修改软件后再分发时，也要… / en "when software is modified and passed on, the recipients still receive…"). With "also", the unchanged sentence implies the rule applies to unmodified copies. It now agrees with the GPL detail; the mismatch Rule A recorded is gone.
  - `terms[2].detail_*`「配るときは同じ条件で配ること」 (general distribution) agrees.
  - `terms[1].one_*`, `terms[1].points[0]`, `terms[1].points[1]`, `key_points_*[2]`, `goals_*[1]`, `overview_cols_*[1]`, `overview_rows[1].extra_*[1]`, `pairs[0].rows[2]`, `terms[2].fig.steps[2]`, `terms[2].points[0]` are true conditionals about modified versions ("when you modify and distribute …"). They state a subset of the rule and do not exclude unmodified distribution. Rule A judged these as fine (only the detail's contrast narrowed the scope), and I agree. No new conflict.
  - L5 (record only; points[0] 対応するソースコード): unchanged, and now backed by the detail's wider statement. L7 (record only; repetition): not made worse (no field added).
- **Cited questions:** 2026r08-q073 エ (a distributed derivative must use the same license) is still supported, and ウ (distribute a derivative while keeping the source closed) is still denied. 2017h29h-q093 ウ (selling DVD copies of collected OSS) stays an appropriate act: the detail still says redistribution is free, and the duties (source + same GPL) do not forbid selling. 2024r06-q080 a and 2026r08-q097 a (selling / paid media allowed) are unaffected (OSS points[2] unchanged).
- Bold / [[jp:]] unchanged (0 / 0). Derived explanation_jp/zh/en follow. **M1 resolved in all three languages.**

### 3.2 p04 / p05: right (権利)

- jp: 「著作権を表す copyright の right (権利) を方向の「右」に見立て、left (左) に置き換えた言葉遊びの名前。」 zh: 「把表示著作权的 copyright 中的 right（权利）当作方向的“右”，换成 left（左）的文字游戏。」 Both now state the meaning of right first, then the pun on the direction. This is correct (the name copyleft plays on "right" in "copyright"), and en "swaps the "right" in copyright for "left"" stays consistent. summary.memory_hooks_jp/zh carry the new text (pairing 3/3). **Resolved.**

### 3.3 p06 / p07: zh wording

- p06: 「是源代码公开，且使用、修改、再分发的自由由许可证明确允许的软件」 — the comma + 且 separates the two properties, as in jp. Bold 1 → 1. **Resolved.**
- p07: 「G 是 GNU 的首字母，GNU 是“GNU's Not Unix”的递归缩写，名字本身又出现在展开式里。」 — factually correct (GNU is a recursive acronym), natural zh. **Resolved.**

## 4. F-fix

No required F-fix. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - validate (unit and part): 0 warns.
   - `stage` meta is removed in the unit (as in b19–b60).
   - ruleA verbatim miss = none. All 7 patches use shortened phrases (including p04, not only p01–p03 / p05–p07 as the brief listed), and same.mjs shows each gives the same field as the Rule A full sentence.
   - The patches use labelled field paths (`terms[1](GPL).…`). `d198.mjs` was given a label-strip for the lookup; check.mjs already normalised them.
   - The one jp win12 hit in p01 (ソースコードを入手できる ~ 2017h29a-q064 c3, distance 2) is in unchanged text and generic. It is the same before and after.

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: M1 in scope → **resolved** (三語); **0 introduced**
- LOW introduced: 0. Obs. 1 is script notes.
- **Application:** 7/7 exact (replay, part-level). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (36 checked, 0 mismatch). 7/7 shortened, and all 7 give the same field as the Rule A full sentence (same.mjs). M1 and every 建議修 (L1, L2, L3) are covered.
- **D-198:** no patch adds an overlap (LCS unchanged in all 7: 8 / 6 / 17 / 4 / 11 / 9 / 3, all term, name or unchanged spans).
- **D-200:** no 考点 edited. **D-202:** [[jp:]] counts unchanged. **D-204 / D-205 / D-210:** no new law, standard or numeric claim. The GPL statement is checked against the GNU GPL FAQ (§3.1).
- **Gates:**
  - validate --unit: 0 issues / EXIT 0, 0 warns
  - validate --part: 0 issues (sha256 = base_sha256)
  - parity: 0 diff (19 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 7 active patches of technology-17-48-u01 are applied exactly. p01–p03 resolve M1 in jp / zh / en: the GPL duties (make the source obtainable, attach the same GPL) now apply to any distribution, as the GNU GPL FAQ states and as `terms[2].one` (「改変して配るときにも」) implies. p04–p07 resolve L1–L3. None introduces a HIGH, MEDIUM or LOW. No required F-fix.
