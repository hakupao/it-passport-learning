# b40 B3 patch re-review — technology-17-47 u01 (オフィスツール, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audit, and I share no context with them (Rule D)
- Date: 2026-11-07 (Session 148 続)
- Scope: B3 wording patches for technology-17-47-u01, p01–p09 — **9 `active`, 0 retired** (`patches/technology-17-47-u01.json`).
  Each patch was checked against the Rule A prescriptions (`technology-17-47-u01.ruleA.md`, 建議修 L1 / L2 / L3 / L8). Nothing left out.
  Coverage: L1 p01–p02 (jp / zh only, as prescribed; en already says "column and row") / L2 p03 (en only, as prescribed) / L3 p04–p06 (三語, + derived `memory_hook_*` / `summary.memory_hooks_*`) / L8 p07–p09 (三語).
  The Rule A file reports HIGH 0 / MEDIUM 0 / LOW 8 (建議修 4). L4–L7 are record only and are not re-ruled here.
- Merged unit `data/ip/textbook/units/technology-17-47-u01.json` sha256 `92b0cf0f3f1865ff…`. The Rule A file names the pre-patch merge `591ae30f69c865b7…`. The difference is exactly the 9 patched fields (+ derived copies) plus the removed `stage` meta key (§1).
- Pre-patch base, located by sha256 = `base_sha256`. All 9 patches share one base, and it matches the **loc r1** part (not r0):
  `data/ip/textbook/.planning/v2/technology-17-47-u01/parts/b40-u01-a1/technology-17-47-u01.loc.r1.json` (`f70d3c7bd4b3280b…`).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208 (+ S143 addendum), D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below (qid + paraphrase only). Strings shown are unit text, patch text or term names. Matched fragments are ≤12 chars.

## 0. Method

Same as `b38_patch_rereview.md` §0 (no `unit.*` patch here). Topic technology-17-47 has 36 questions, 180 source strings per language.

1. **Application check** (`b40rr/check.mjs`, run unchanged): `after` present; `before` once in base; replay in file order = unit field; no `before` remnant anywhere in the unit; every changed base-present path explained; before / after verbatim in the Rule A file.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`, `overview.intro_*`) and `summary.memory_hooks_*` (suffix match, in check.mjs).
3. **D-198** (`b40rr/d198b.mjs`): whole-field LCS before → after and `after`-span LCS vs 180 sources per language; jp 12-char windows (≤2 substitutions) unmasked / masked + wDice.
4. **L1 term check against the cited reference questions.** `data/ip/quiz/questions.json` stems / choices and the translation sidecars were searched for 絶対参照 / 複合参照 / 相対参照 (hits 0 / 0). Then the generated explanations (`data/ip/quiz/explanations/*.json`) of 2025r07-q076, 2010h22h-q055, 2017h29h-q091, 2011h23a-q069 and challenge 2018h30a-q080, 2019r01a-q076, 2020r02o-q071 were read for how they name a one-sided `$`.
5. **Manual reading** of each patched field in context (whole term: one / detail / hook / points / fig; goals; key_points; summary).
6. **Gates**: `scripts/textbook-v2-validate.mjs --unit` / `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

Not established (as in b14–b39): the unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (136) were checked for derived copies and `before` remnants. No law text is touched.

## 1. Script results (fresh, 2026-11-07)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-17-47-u01
✓ technology-17-47-u01 unit: 0 issues (data/ip/textbook/units/technology-17-47-u01.json)
EXIT=0
parity --unit: ✓ 24 locations, 0 diff   EXIT=0
validate --part (loc r1): ✓ part loc#1: 0 issues (sha256 f70d3c7b… = base_sha256)   EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: pass 14, fail 0
check.mjs: active 9 ok 9 issues 0; changed base-present paths 10 (9 patched + stage); derived checked 60 mismatch []; memory_hooks suffix 15 bad []; ruleA verbatim miss []
```

**Application.**
- All 9 `before` strings occur exactly once in their base field; all 9 `after` present; replay in file order reproduces every patched field (one patch per field).
- Changed base-present paths: 9 patched fields + the removed `stage` meta key (as in b19–b39; base-only top keys `stage / round / jp_round` are part metadata). Unexplained content diffs: 0.
- `before` remnants: 0. Whole-unit walks: 「列や行を動かさない」0, 「让行或列不动」0, 「差し出して見せる」0, 「递到听众面前」0, "handing material" 0, 「役割が反対」0, 「正好相反」0, "opposite role" 0, ", where they automate" 0. After strings: 「列と行を動かさない」2 (detail + explanation), 「让行和列都不动」2, 「掲げて見せる」/「摆到听众眼前」/ "held up in front" 3 each (hook + 2 derived), 「役割を分担」/「分工合作」/ "sharing the work" / "in both they automate" 1 each.
- No new validate warning (Rule A: warn 0; now still 0), so the revert step of b38 §0-5 is not needed.

**Derived fields.** 60 checked, 0 mismatch. p01 / p02 → `terms[1].explanation_jp / _zh` follow. p04–p06 → `terms[3].memory_hook_*` follow and `summary.memory_hooks_*` suffix-consistent (15, bad 0). p03 / p07–p09 feed no derived field.

**Notation.** bold / `[[jp:]]` counts unchanged in all 9 fields (detail_jp 6/0, detail_zh 6/4, points[1].text_en 1/3, hooks 0/0, browser point jp 2/0, zh 2/2, en 2/2).

D-198, before → after (`d198b.mjs`):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| p01 | **jp** | 2017h29h-q091 stem | 6 → 6 (unchanged part) | を付け (3) | 0 / 0 → 0 / 0; 0.10 → 0.10 |
| p02 | zh | 2009h21a-q093 stem | 4 → 4 | 加上 (2) | — |
| p03 | en | 2024r06-q058 stem | 27 → 27 ("in word processing software", term name, unchanged) | " procedure" (10) | — |
| p04 | **jp** | 2025r07-q022 ウ (correct) | 5 → 4 | て見せる (4, generic) | 0 / 0 → 0 / 0; 0.13 → 0.10 |
| p05 | zh | 2025r07-q022 ウ (correct) | 3 → 3 | 展示的 (3) | — |
| p06 | en | 2012h24a-q088 → 2015h27a-q085 stem | 10 → 10 | "nt of the " (10, generic) | — |
| p07 | **jp** | 2015h27a-q085 stem | 5 → 5 (を表示する, unchanged part) | している (4) | 0 / 0 → 0 / 0; 0.14 → 0.15 |
| p08 | zh | 2025r07-q022 イ | 3 → 3 | 分 (1) | — |
| p09 | en | 2015h27a-q085 stem | 15 → 15 (" that displays ", unchanged) | "ing the work" (12, generic) | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52). Every after-span overlap is ≤12 chars and generic. None leans toward a wrong option (2025r07-q022 ウ is the correct option and the overlap is the generic 「て見せる」/「展示的」).

## 2. Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p02 | `terms[1](表計算ソフト).detail_jp / _zh` (+ `explanation_*`) | L1 | Yes (§3.1) | No (obs. 1 = pre-existing, outside unit) | OK |
| p03 | `terms[2](文書作成ソフト).points[1].text_en` | L2 | Yes: "and in both they automate" covers both software kinds, = jp「…にも備わり、…自動化する」/ zh「…中也有，用来…自动化」 | No | OK |
| p04–p06 | `terms[3](プレゼンテーションソフト).hook_*` (+ `memory_hook_*`, `summary.memory_hooks_*`) | L3 | Yes (§3.2) | No (obs. 2 LOW) | OK |
| p07–p09 | `terms[4](Webブラウザ).points[0].text_*` | L8 | Yes (§3.3) | No | OK |

## 3. Focused checks

### 3.1 p01–p02 (L1) — 絶対参照「列と行」

- After: jp「**$** を付けて列と行を動かさない書き方を**絶対参照**といい、列と行の片方だけに $ を付ける**複合参照**もある。」/ zh「加上 **$** 让行和列都不动的写法叫**绝对引用**…，只在行或列其中一方加 $ 的叫**混合引用**」. en (unchanged) "locked with $ so its column and row stay put … $ on only the column or only the row is a mixed reference".
- **Correct as a definition.** Absolute = `$` on both (`$B$2`), mixed = one side (`$B2` / `B$2`). This is the standard division, and the same sentence already defines 複合参照 as one side only. The base 「列や行」 could be read as "either", which overlaps 複合参照; the patch removes that overlap. It now matches the fig cell 「$B$2 (列と行の前に $)」 and en.
- **Cited questions — nothing becomes false.** No question stem or choice in `questions.json` (or in the translation sidecars) uses the words 絶対参照 / 複合参照 / 相対参照 (hits 0). All cited questions ask "which formula" or "which value", so every answer is reached by where the `$` sits, which the fig and points[0] (「$ を付けた側はそのまま残る … ずらしたくない側にだけ $」) teach unchanged. Re-read answers: q076 ウ uses `B$1` (row only), q055 ウ `$B4` / `D$2`, q091 イ `B$2…`, q069 ウ `B$2～B$100` / `=$A102`, challenge q080 `$D$2`, q076 (2019r01a) `B$3`. None of them depends on the name, and none calls a one-sided `$` the whole reference type in its stem or choices.
- **Unchanged related lines stay right.** points[0]「$ の付いていない列や行は移動した分だけずれ、$ を付けた側はそのまま残る」 and `key_points_jp[1]` / `summary.key_points_jp[1]`「$ を付けた列や行だけが固定される」 speak of the parts (each column or row part with `$`), not of the reference type, so 「列や行」 is correct there and does not conflict with the patched definition.
- **Explanation layer (outside the unit).** The generated explanations of q091 and q069 say a row part is "made an absolute reference" (行を絶対参照にした B$2 / 行は絶対参照 ($2)). That is part-level usage. The q055, q076 and q069 points use the same division as the unit (q055: `$B4`, `D$2` = 複合参照; q076: 絶対 (複合) 参照; q069: 列と行に別々に $ = 複合参照). The tension was already there before the patch (base had 複合参照 = one side), and it is in the explanation files, not the unit → LOW, record only (obs. 1).
- **Resolved.**

### 3.2 p04–p06 (L3) — hook「掲げて見せる」

- After: jp「present は「目の前に差し出す」。聞き手の目の前に資料を掲げて見せる場面を思い出す。」/ zh「present 的意思是“递到眼前”。想象把资料摆到听众眼前展示的场景。」/ en ""Present" means to hold something out in front of someone. Picture material held up in front of the audience for them to see."
- **The hand-out image is gone from the scene sentence.** 掲げて / 摆到眼前 / held up show material to the audience, and nothing is handed over. This now fits `one` (聞き手の前で 1 枚ずつ映しながら説明する) and the mix point (読み手が手元で読む資料なら文書作成ソフト), and no longer leans toward the 文書作成 side.
- The gloss sentence (差し出す / 递到眼前 / hold out) was not in the prescription and is unchanged. It glosses the word "present" and says "in front of the eyes", not "into the hands" (obs. 2).
- No question asks hand-out material vs slides (Rule A L3). No wrong option involved. Derived copies follow ×3 per language.
- **Resolved.**

### 3.3 p07–p09 (L8) — browser and server「役割を分担」

- After: jp「**Webブラウザ**は利用者の端末でページを表示する側のソフトであり、ページのデータを保管して送り出す**Webサーバ**と役割を分担している。」/ zh「…与保存页面数据并把它发送出去的 **Web 服务器**…分工合作。」/ en "…displays pages on the user's device, sharing the work with a **web server** (…), which stores page data and sends it out."
- **Client vs server stays sharp.** The sentence still gives each side its own role (browser = displays on the user's device; server = stores and sends out). 「分担」 says that the roles differ and fit together. It does not say the two do the same work. The flow fig (browser requests → server sends back → browser interprets and displays) and goals_jp[3]「Webサーバとの役割分担」/ goals_en "a division of roles" now use the same word.
- "sharing the work with" in en is a little looser than "division of roles", but the relative clause names the server's part, so it cannot be read as "doing the same thing". zh「分工合作」 = division of labour.
- No cited question on browsers (topic 出題 0). No wrong option involved.
- **Resolved.**

## 4. Observations

No F-fix from this re-review. Records only:

1. LOW, pre-existing, outside the unit: the generated explanations of 2017h29h-q091 and 2011h23a-q069 call a single row part "絶対参照" (part-level), while the unit (and the q055 / q076 / q069 points) name a one-sided `$` 複合参照. No question stem or choice uses these names, and every answer is a formula or a value, so no learner answers wrongly. The patch did not create this; it makes the unit's own wording consistent (detail = fig = en). A later explanation pass could write 「行を固定 (複合参照)」 there; not part of b40.
2. LOW, unpatched (not prescribed): the hook's gloss sentence keeps 「目の前に差し出す」/ zh「递到眼前」/ en "hold something out in front of someone". It is a gloss of the word, with "in front of the eyes", and the scene sentence now shows the image clearly. Record only.
3. Script notes (no content issue): `stage` meta removed (as in b19–b39); the base is loc **r1** (`f70d3c7b…`); the Rule A file's unit sha `591ae30f…` is the pre-patch merge, and the current `92b0cf0f…` differs only by the 9 patched fields (+ derived) + `stage`.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope (Rule A file MEDIUM 0); **0 introduced**
- LOW introduced: 0. Recorded: obs. 1 (explanation layer, pre-existing), obs. 2 (unprescribed gloss), script notes obs. 3.
- **Application:** 9/9 exact (replay), 9/9 = Rule A prescribed text. Every 建議修 covered (L1 / L2 / L3 / L8). Derived fields follow (60, 0 mismatch). 0 unexplained diffs, 0 `before` remnants.
- **D-198:** jp windows 0 / 0 before and after in all jp patches; after-span overlaps generic and ≤12 chars; nothing leans toward a wrong option.
- **Gates:** validate --unit 0 issues / 0 warnings / EXIT 0, parity 24 locations 0 diff, validate --part (loc r1) 0 issues (sha256 = base_sha256), vitest textbook 162/162, patch tests 14/14.

**PASS.** All 9 active patches of technology-17-47-u01 are applied exactly. No patch introduces a MEDIUM or HIGH, and every 建議修 is applied.
- L1: 絶対参照 = `$` on both column and row, separate from 複合参照 in the same sentence and = fig = en. No cited question (q076 / q055 / q091 / q069, challenge q080 / q076) becomes false; none names a reference type in stem or choices.
- L2: en macro sentence now covers both kinds of software.
- L3: the scene shows material held up, not handed out, in all three languages.
- L8: 「役割を分担」 matches goals and fig and keeps each side's role (display vs store / send).
