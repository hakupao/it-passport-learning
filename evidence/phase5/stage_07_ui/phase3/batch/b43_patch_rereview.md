# b43 B3 patch re-review — technology-15-41 u01–u04 (記憶装置 1/2, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b43rv/` (derived from `b42rr/`), not the main session's `b43rr/`.
- Date: 2026-11-07 (Session 149)
- Scope: the B3 wording patches for technology-15-41 u01–u04. **46 are `active` and 0 retired**: u01 p01–p12 / u02 p01–p06 / u03 p01–p20 / u04 p01–p08 (`patches/technology-15-41-u0{1,2,3,4}.json`).
  I checked each patch against the Rule A prescriptions in `technology-15-41-u0N.ruleA.md`:
  - u01 (Rule A PASS, 建議修 L1–L4): L1 → p01–p03 (三語), L2 → p04–p06 (三語), L3 → p07–p09 (三語), L4 → p10–p12 (en / zh / zh)
  - u02 (Rule A FAIL, **M1** + 建議修 L1–L2): **M1** → p01–p03 (三語), L1 → p04–p05 (zh ×2), L2 → p06 (en, + `explanation_en`)
  - u03 (Rule A FAIL, **M1** + 建議修 L1–L4, L8, L9): **M1** → p01–p03 (三語), L1 → p04–p09 (detail 三語 + pairs b 三語), L2 → p10–p12 (三語), L3 → p13 (zh), L4 → p14–p15 (zh), L8 → p16–p19 (zh ×4), L9 → p20 (en)
  - u04 (Rule A PASS, **0 建議修**; all LOW 記録のみ / 任意): optional L2 → p01–p03, optional L8 → p04–p07, + p08 (extension of L8, not in Rule A)
  Every 建議修 in u01–u03 is covered. LOWs marked 記録のみ and not patched are not re-ruled here.
- Pre-patch bases, located by sha256 = `base_sha256` (one base per unit, shared by all its patches), under `data/ip/textbook/.planning/v2/technology-15-41-u0N/parts/`:
  - u01 `b43-u01-a1/…loc.r0.json` `fd63b694df5c48e2…`
  - u02 `b43-u02-a2/…loc.r0.json` `b881a9407e770ccd…`
  - u03 `b43-u03-a1/…loc.r0.json` `42e99514c472ff87…`
  - u04 `b43-u04-a1/…loc.r1.json` `f8d012e157eb98fe…` (`loc.r0` `965edd3e…` is not the base)
- Merged units (current) `data/ip/textbook/units/technology-15-41-u0N.json` sha256: u01 `46a69fe897f31b65…` / u02 `8113831273255b91…` / u03 `57371d76d1e8d904…` / u04 `2d5981b94c74f5c3…`. They differ from their bases only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only). Strings shown are unit text, patch text or term names. Matched fragments are ≤12 chars.

## 0. Method

Same as `b42_patch_rereview.md` §0. No `unit.*` patch is in this batch. Topic technology-15-41 has 35 questions, so there are 175 source strings per language.

1. **Application check** (`b43rv/check.mjs`): `after` present; `before` once in base; replay in file order = unit field; every changed base-present path explained; before / after verbatim in the Rule A file. Plus `b43rv/extra.mjs`: **net** `before` remnant count (occurrences of `before` minus those inside an occurrence of `after`), because u01 p01 and u03 p07 are insertions whose `before` is a substring of `after`.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*`. The b42 suffix check pairs `memory_hooks_*[i]` with `terms[i]`, which is wrong when some terms have no hook (u02: 8 terms, 5 hooks). I added a corrected check that pairs the list with the hooked terms only.
3. **D-198** (`b43rv/d198b.mjs`, + `b43rv/win.mjs` to print the matching windows): whole-field LCS before → after, and LCS of the `after` span against the 175 sources per language. For jp: 12-char windows (≤2 substitutions), unmasked / masked, + wDice.
4. **Cited-question checks.** Re-read in `data/ip/quiz/questions.json` + `translations/<exam>.json` (stem_jp_clean): 2017h29h-q092 (cache; answer イ effective access time; wrong エ = user designates programs to keep resident), 2024r06-q063 (method to erase all SSD data unrecoverably; answer ア Secure Erase; wrong 磁気消去 / セキュアブート / データクレンジング), 2022r04-q084 (SSD vs HDD power / shock, answer エ), 2019h31h-q070 (shortest access time, answer ウ cache; wrong イ SSD), 2009h21a-q057, 2018h30h-q076, 2023r05-q088, 2015h27a-q100 (HDD overwrite software, unit-uncited).
5. **Manual reading** of each patched field in context: u01 flash points / pairs[0..1] / tree / overview_rows / RAM points; u02 the whole of キャッシュメモリ (one / detail / analogy / hook / points / fig), DDR5 table + overview, SO-DIMM detail; u03 the whole of SSD, HDD detail / points / fig, pairs[0..1], key_points + summary, USB / SD one_zh + hook_zh + points; u04 every zh field containing 删除 / 擦除 / 光驱 / 设备 and their jp / en counterparts, DVD-ROM detail.
6. **Gates** (each run on all four units):
   - `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`
   - `scripts/textbook-v2-parity.mjs --unit`
   - `npx vitest run src/lib/textbook`
   - `node --test scripts/textbook-v2-patch.test.mjs`

**Not established** (same as b14–b42): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 110 / u02 153 / u03 100 / u04 159) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-07)

```
validate --unit: u01 0 issues | u02 0 issues | u03 0 issues | u04 0 issues, 1 warning | EXIT 0 ×4
  u04 warn zh-term terms[0](CD).hook_zh レコード → 记录 (pre-existing, Rule A u04 L1 = false positive: vinyl record = 黑胶唱片; not a patched field)
validate --part (base): u01 loc#0 0 issues (sha256 fd63b694… = base_sha256)
                        u02 loc#0 0 issues (sha256 b881a940… = base_sha256)
                        u03 loc#0 0 issues (sha256 42e99514… = base_sha256)
                        u04 loc#1 0 issues, same 1 warning (sha256 f8d012e1… = base_sha256)
parity --unit: u01 22 / u02 32 / u03 21 / u04 34 locations, 0 diff
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  u01 active 12 ok 12 | u02 active 6 ok 6 | u03 active 20 ok 20 | u04 active 8 ok 8
  raw remnant flags: u01 p01, u03 p07 (insertion patches, before ⊂ after) → extra.mjs net remnant 0 for all 46
  changed base-present paths = patched fields + 'stage' (u01 12+1 / u02 6+1 / u03 20+1 / u04 8+1); unexplained besides 'stage': 0
  derived checked 54 / 78 / 48 / 84, mismatch 0
  memory_hooks suffix (b42 index pairing): u01 0 bad, u02 6 bad (jp/zh/en [2],[3]), u03 0, u04 0
  memory_hooks (hooked-terms pairing): u01 5/5, u02 5/5, u03 4/4, u04 8/8 in each of jp/zh/en, bad 0
  ruleA verbatim miss: u01 [] | u02 [p01,p02,p03] | u03 [] | u04 [p01..p06, p08]
```

Notes on the output:
- The vitest command was run in the background chained with a `grep "^# (pass|…)"` on the `node --test` output. The job exited 1 only because that grep did not match node's `ℹ pass 14` format. vitest itself printed 13 / 162 passed, and a separate `node --test` run printed 14 / 14. No test failed.
- **u02 memory_hooks "bad"**: index shift only. u02 has 8 terms and 5 hooks, so `memory_hooks_*[2..3]` belong to later hooked terms, not `terms[2..3]`. The corrected check is 5 / 5 clean in all three languages. No patch in this batch touches a u02 hook.
- **u02 p01–p03 verbatim miss** is a `before` miss only: Rule A M1 quotes a fragment of the analogy, while `before` is the whole base field (application check: `before` occurs once in the base field and the replay matches). All three `after` strings are Rule A's proposed text verbatim. No deviation.
- **u04 verbatim miss**: p01–p03 `before` = Rule A's clause + the sentence-final 「。」 / 「。」 / "." and `after` = that punctuation, which is the same edit as Rule A's "削る". p04–p06 apply Rule A's word-level 删除 → 擦除 inside longer phrases. p08 is not in Rule A. These are judged in §3.4.

**Application.**
- All 46 `before` strings occur exactly once in their base field, and all 46 `after` strings are present. Replay in file order reproduces every patched field (one patch per field in this batch).
- Changed base-present paths are the patched fields plus the removed `stage` meta key, as in b19–b42. Base-only top keys `stage / round / jp_round` are part metadata. Unexplained content diffs: 0.
- **Net `before` remnants: 0** for all 46.

**Derived fields.** 264 checked, 0 mismatch. Patched fields that feed derived copies: u02 p06 → `terms[7].explanation_en`; u03 p04–p06 → `terms[1].explanation_*`, p10–p12 → `summary.key_points_*[2]`, p14 → `terms[2].definition_zh`, p15 → `terms[3].definition_zh`, p16 → `terms[3].memory_hook_zh` (+ summary); u04 p01–p03 → `terms[4].explanation_*`, p04 → `terms[1].definition_zh`, p05 → `terms[5].explanation_zh`, p08 → `terms[2].explanation_zh`. All follow.

**Notation.** Bold and `[[jp:]]` counts are unchanged in every patched field except u03 p13 (`[[jp:]]` 1 → 2 = the intended added `[[jp:フラッシュメモリ]]`).

D-198, before → after (`d198b.mjs`, 175 sources per language):

| Patch | Lang | LCS before → after (nearest source) | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|
| u01 p01 | **jp** | 9 → 10 (2022r04-q084 stem) | 消費電力 (4) | **0 / 0 → 4 / 4** (q084 stem, §3.1); 0.22 → 0.21 |
| u01 p02 | zh | 6 → 6 | HDD (3) | — |
| u01 p03 | en | 16 → 16 (unchanged part) | "es less power " (14, generic) | — |
| u01 p04 | **jp** | 5 → 5 | プログラム (5, generic) | 0 / 0 → 0 / 0; 0.38 → 0.30 |
| u01 p05 | zh | 3 → 3 | 的数据 (3) | — |
| u01 p06 | en | 15 → 10 | ", such as " (10, generic) | — |
| u01 p07 | **jp** | 3 → 3 | 揮発性 (3, term) | 0 / 0 → 0 / 0; 0.50 → 1.00 (3-char label = the term itself) |
| u01 p08 | zh | 3 → 3 | 易失性 (3, term) | — |
| u01 p09 | en | 9 → 8 | "volatile" (8, term) | — |
| u01 p10 | en | 5 → 6 | "le, no" (6) | — |
| u01 p11 | zh | 4 → 4 | 保持存储 (4) | — |
| u01 p12 | zh | 5 → 5 | 图形存储器 (5, term; 2013h25a-q053 エ correct) | — |
| u02 p01 | **jp** | 4 → 4 | ていない (4, generic) | 0 / 0 → 0 / 0; 0.08 → 0.09 |
| u02 p02 | zh | 3 → 2 | 用的 (2) | — |
| u02 p03 | en | 10 → 13 | " the longest " (13, generic) | — |
| u02 p04 | zh | 2 → 2 | DR (2) | — |
| u02 p05 | zh | 2 → 2 | DR (2) | — |
| u02 p06 | en | 11 → 11 (unchanged part) | " desktop pc" (11, generic) | — |
| u03 p01 | **jp** | 11 → 11 (term) | SecureErase (11, term = q063 ア correct) | **4 / 4 → 0 / 0**; 0.45 → 0.23 |
| u03 p02 | zh | 11 → 11 (term) | SecureErase (11, term) | — |
| u03 p03 | en | **50 → 13** | " its storage " (13, generic) | — |
| u03 p04 | **jp** | 6 → 6 (unchanged part) | 読み書きする (6, generic) | 0 / 0 → 0 / 0; 0.17 → 0.16 |
| u03 p05 | zh | 5 → 5 (unchanged part) | 数据的 (3) | — |
| u03 p06 | en | 25 → 25 (unchanged part) | "it reads and writes " (20, unchanged part) | — |
| u03 p07 | **jp** | 3 → 3 | 時間が (3) | 0 / 0 → 0 / 0; 0.25 → 0.18 |
| u03 p08 | zh | 2 → 4 | 没有机械 (4, generic) | — |
| u03 p09 | en | 9 → 15 | " no mechanical " (15, generic; 2016h28h-q072 stem, answer エ SSD) | — |
| u03 p10 | **jp** | 5 → 9 | プログラムやデータ (9; 2018h30h-q076 エ, §3.3) | 0 / 0 → 0 / 0; 0.26 → 0.27 |
| u03 p11 | zh | 7 → 7 (unchanged part) | 程序和数据 (5) | — |
| u03 p12 | en | 25 → 25 (unchanged part) | " programs and data " (19) | — |
| u03 p13 | zh | 3 → 3 | 半导体 (3) | — |
| u03 p14 | zh | 4 → 4 | 存储介质 (4, generic) | — |
| u03 p15 | zh | 5 → 5 | 的存储介质 (5, generic) | — |
| u03 p16 | zh | 6 → 6 (unchanged part "Secure") | 功能 (2) | — |
| u03 p17 | zh | 2 → 2 | 冲击 (2) | — |
| u03 p18 | zh | 2 → 2 | 读取 (2) | — |
| u03 p19 | zh | 3 → 3 | 中记录 (3) | — |
| u03 p20 | en | 14 → 14 (unchanged part) | " the po" (7) | — |
| u04 p01 | **jp** | 7 → 7 (unchanged part) | — (deletion) | 0 / 3 → 0 / 3 (unchanged part: masked katakana 「容量の大きい□□□」 vs 2017h29h-q092 ウ, FP); 0.11 → 0.12 |
| u04 p02 | zh | 5 → 3 | — (deletion) | — |
| u04 p03 | en | 15 → 15 (unchanged part) | — (deletion) | — |
| u04 p04 | zh | 5 → 5 | 能写入 (3) | — |
| u04 p05 | zh | 4 → 4 | 无法 (2) | — |
| u04 p06 | zh | 2 → 2 | 无法 (2) | — |
| u04 p07 | zh | 3 → 3 | DVD (3, term) | — |
| u04 p08 | zh | 3 → 3 | 也不 (2) | — |

No patched text comes near the calibration HIGH (ed 0.14 / Dice 0.52). The only new jp window hits are u01 p01 (§3.1, LOW). u03 p01 removes the 4 / 4 windows behind u03 M1 and cuts the en LCS with the q063 stem from 50 to 13. All other after-span overlaps are term names, unchanged base parts or generic fragments. None leans toward a wrong option.

## 2. Per-patch verdict

| Unit / IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| u01 p01–p03 | `terms[4](フラッシュメモリ).points[0].text_*` | L1 | Yes: 「HDD より衝撃に強く消費電力も小さい」 / 「比 HDD 更抗冲击，功耗也更小」 / "resists shock better and uses less power than an HDD" restore q084's comparison. jp 77 chars, 2 sentences (D-200 ✓) | D-198 windows 0 → 4 (LOW, §3.1) | OK |
| u01 p04–p06 | `pairs[0].rows[2].b_*` | L2 | Yes: 「めったに変えないデータ」 = ROM detail 「めったに変えないデータ」 / en "Rarely changed data" = ROM detail_en "data that rarely changes"; row 0 「原則として」 kept | No | OK |
| u01 p07–p09 | `terms[3](不揮発性メモリ).fig.data.root.children[0].label.*` | L3 | Yes: branch is 「揮発性」 / 易失性 / Volatile, parallel to sibling 「不揮発性」; DRAM / SRAM children unchanged; the axes no longer mix (volatile mix point) | No | OK |
| u01 p10 | `overview_rows[1].extra_en[2]` | L4 | Yes: "In principle, no" = jp 「原則しない」 / zh 原则上不改写 | No | OK |
| u01 p11 | `pairs[1].rows[1].label_zh` | L4 | Yes: 「保持存储是否需要电力」 now fits the 需要 / 不需要 values (= jp 「記憶の保持に電力が」 要る / 要らない) | No | OK |
| u01 p12 | `terms[0](RAM).points[2].text_zh` | L4 | Yes: 「图形存储器，即显存」 matches the quiz zh layer of 2013h25a-q053 エ (correct) | No | OK |
| u02 p01–p03 | `terms[0](キャッシュメモリ).analogy_*` | **M1** | Yes (§3.2) | No | OK |
| u02 p04–p05 | `terms[5](DDR5).fig.data.rows[2].cells[2].zh`, `overview_rows[5].extra_zh[1]` | L1 | Yes: 「比 DDR4 进一步提速、电压更低」 = jp 「さらに」 / en "Even"; matches DDR5 detail_zh 「进一步提高了传输速度」 | No | OK |
| u02 p06 | `terms[7](SO-DIMM).detail_en` (+ `explanation_en`) | L2 | Yes: "machines meant for places with limited space" = jp 「設置場所の限られる」 / zh 「安装空间有限」 | No | OK |
| u03 p01–p03 | `terms[1](SSD).points[2].text_*` | **M1** | Yes (§3.3) | No | OK |
| u03 p04–p09 | `terms[1].detail_*` (+ `explanation_*`), `pairs[0].rows[2].b_*` | L1 | Yes: SSD now lacks only the HDD's head-movement / rotation wait (「機械の待ち時間がなく」 / 没有机械等待时间 / "no mechanical delay"), matching pairs a side 「機械の待ち時間があり」 and HDD detail 「機械的な待ち時間」. HDD points[1] (longer than semiconductor storage) and key_points[1] still rank SSD below cache, so q070 イ gets no support | No | OK |
| u03 p10–p12 | `key_points_*[2]` (+ summary) | L2 | Yes: 「プログラムやデータを長く保存する役目」 no longer narrows auxiliary storage to a main-memory backup. The 9-char 「プログラムやデータ」 overlap with 2018h30h-q076 エ is generic; the key point says nothing about flash memory being unchangeable, so エ gets no support | No | OK |
| u03 p13 | `terms[2](USBメモリ).points[0].text_zh` | L3 | Yes: `[[jp:フラッシュメモリ]]` now on zh as on en; same 「闪存[[jp:フラッシュメモリ]]」 form as SSD points[1].text_zh | No | OK |
| u03 p14–p15 | `terms[2].one_zh`, `terms[3].one_zh` (+ `definition_zh`) | L4 | Yes: 「U 盘[[jp:USBメモリ]]是…」 / 「SD 卡[[jp:SDカード]]是…」 = the 「X 是…」 form of HDD / SSD one_zh; bold 2 → 2 | No | OK |
| u03 p16–p19 | `terms[3].hook_zh` (+ `memory_hook_zh`), `pairs[0].rows[3].label_zh`, `terms[0].fig.steps[2].caption_zh`, `pairs[1].rows[2].b_zh` | L8 | Yes: 版权保护 / 冲击与振动 / 磁化方向 (= en "direction of magnetization") / 「在相机、智能手机中记录照片和视频」 (photos / videos = SD detail; jp 「カメラやスマートフォンの記録」 is terser, same use) | No | OK |
| u03 p20 | `terms[0](HDD).fig.steps[0].caption_en` | L9 | Yes: "reach the position where the target data sits" = jp 「目的のデータがある位置へ移る」; the added term "track" is gone | No | OK |
| u04 p01–p03 | `terms[4](DVD-ROM).detail_*` (+ `explanation_*`) | L2 (任意) | Yes, the CD-ROM comparison clause is removed in all three languages (§3.4) | **jp sentence end 「…約 4.7GB あり。」 (LOW, F1)** | OK with F1 |
| u04 p04–p06, p08 | `terms[1].one_zh`, `terms[5].detail_zh`, `pairs[2].rows[0].a_zh`, `terms[2](CD-R).detail_zh` | L8 (任意) + extension | Yes (§3.4) | No | OK |
| u04 p07 | `terms[3](DVD).points[0].text_zh` | L8 (任意) | Yes: 「DVD 光驱」 = en "drive" and the 光驱 already used in CD caption / CD-R detail and fig | No | OK |

## 3. Focused checks

### 3.1 u01 p01: new 12-char near-match windows with the cited 2022r04-q084 stem (LOW, record)

- After jp: 「SSD は HDD のような可動部品をもたないので、HDD より衝撃に強く消費電力も小さい。」
- `win.mjs` shows 4 unmasked and 4 masked windows with 2 substitutions, all against the q084 stem. Each window is the base connector 「(可動部品)をもたないので」 + the three characters `HDD` + 1–2 following chars, matched against the stem's 「(駆動機構)をもたないので」 + `HDD` + 「と比」.
- **Ruling: LOW (record), not D-208 (1).**
  - The 12-char exact guard is 0 (validate copy guard 0).
  - The windows exist only because `HDD` now follows 「もたないので」. That `HDD` is the comparison qualifier Rule A u01 L1 asked to restore so the point keeps q084's limiting condition (HDD との比較).
  - Content words differ: 可動部品 vs 駆動機構, 「より」 vs 「と比較して」. The two properties come in the opposite order to the stem (shock, then power).
  - Whole-field wDice 0.21. Compare the HIGH calibration (0.52) and the u03 M1 matched part (0.75).
  - The point gives the q084 answer (SSD) and leans toward no wrong option.
- I do not propose a reword. Any wording that puts `HDD` after 「もたないので」 recreates the window, and dropping `HDD` would undo L1.
- Process note: Rule A u01 proposed this text without re-running the window check on it. Rule A u03 did re-run it for its M1.

### 3.2 u02 p01–p03 (M1): キャッシュメモリ analogy vs 2017h29h-q092 エ

- After:
  - jp 「台所で、使った調味料はそのままコンロの脇に残り、脇が埋まると、いちばん長く使っていないものから奥の棚へ戻していくようなもの。」
  - zh 「就像在厨房里，用过的调料就留在灶台旁；灶台旁放满时，就把最久没用的调料先放回里面的柜子。」
  - en "Like a kitchen where any seasoning you just used stays next to the stove, and when that space fills up, the one left unused the longest goes back to the shelf at the back."
  - All three are Rule A's proposed text verbatim.
- **The static, user-chosen placement is gone.** The base picture had the cook choosing the 「よく使う」 seasonings and keeping them by the stove (= q092 エ: the user designates programs to keep resident). Now an item stays near because it was just used, and when the space is full the least recently used item goes back. That is automatic and recency-driven. No step has anyone pick what stays. エ no longer fits the analogy.
- **Matches the term's other fields:**
  - detail: hits, small capacity, and 「最後に使ってから最も時間がたったデータを追い出して入れ替える (LRU 方式)」 = 「いちばん長く使っていないものから奥の棚へ戻していく」
  - fig step 4: on a miss, read from main memory and also put a copy in the cache = 「使った調味料はそのままコンロの脇に残り」
  - one: 「高速・小容量」 = 「脇が埋まると」
- **Other q092 options:** answer イ (shorten the effective access time) is still stated by points[0]. ア (cache ≥ main memory) is contradicted by one / points[0] and by the 「脇が埋まる」 picture. ウ is not touched.
- **Factually correct.** Demand caching with LRU replacement is the standard textbook model. The detail already presents LRU as 「例えば」, and the analogy does not claim it is the only policy.
- The analogy moves the item itself, while a cache holds copies. That is the usual limit of a physical analogy, and one / fig say 「写し」. Not an issue.
- D-198: jp windows 0 / 0, LCS 4 (generic). en LCS 13 " the longest " (generic, from an unrelated stem).
- **Resolved.** M1 is fully closed.

### 3.3 u03 p01–p03 (M1): Secure Erase point vs 2024r06-q063

- After jp: 「**Secure Erase**は、SSDが内蔵する消去機能を命令で動かし、記憶領域をまとめて消す方法である。ファイルの削除や上書きでは残ることがある領域のデータまで消せる。」 (83 chars, 2 sentences, D-200 ✓). zh and en say the same. All three are Rule A's proposed text verbatim.
- **The copied wording is gone.** The base sentence was the q063 stem turned into a statement with the answer as subject: SSD + all data + erase + make unrecoverable + method, in the stem's order. The new text has no 「全データ」 / 「復元できなくする」. Dropping those phrases was the point, because they were the copied part.
  - jp windows 4 / 4 → 0 / 0, wDice 0.45 → 0.23.
  - en LCS with the q063 stem 50 → 13.
  - The only remaining overlap is the term name.
- **Factually correct.** Secure Erase (ATA SECURITY ERASE UNIT, and its NVMe counterparts) is a command the host sends; the drive's firmware then erases the user storage area as a whole. On SSDs, wear-levelling and spare / remapped blocks mean that deleting or overwriting files through the OS can leave data in areas the host cannot address. A firmware erase is meant to reach those areas. 「残ることがある」 is properly hedged.
- **q063 is still answerable.** The text conveys a thorough, whole-area erase: 「記憶領域をまとめて消す」 and 「残ることがある領域のデータまで消せる」. Secure Erase is the only SSD-specific erase method among the four options. No wrong option gets support:
  - 磁気消去: the text is about a built-in erase function triggered by command, not magnetism; SSD is flash (one).
  - セキュアブート and データクレンジング: not mentioned.
- **No conflict with 2015h27a-q100** (unit-uncited; it covers HDD overwrite software before disposal). The new point is specific to SSDs, and the HDD statements are untouched.
- **zh terms.** 擦除 (Secure Erase, medium erasure) vs 删除文件 (file deletion) is the right split. It is the same split as u04 after p04–p08. `zh_terms.json` has no entry for plain 消去 / 削除.
- **Resolved.** M1 is fully closed.

### 3.4 u04 p01–p08: deviations from Rule A's wording (Rule A had 0 建議修)

- **L2, p01–p03 (clause removal).**
  - Rule A suggested deleting 「、同じ読み出し専用の CD-ROM より大きい」 (zh 「，比同为只读的 CD-ROM 大」, en ", more than the equally read-only CD-ROM"). The patches delete the same clause and keep the sentence-final punctuation, so the edit is the same as Rule A's.
  - Removal is safe. The CD vs DVD capacity comparison is still in CD / DVD detail (「CD の約 7 倍」), the BD table and key_points. 4.7GB = Ecma-267, per Rule A §1-9.
  - zh 「容量符合 DVD 规格，单面单层约 4.7GB。」 and en "…it holds about 4.7GB on one side with one layer." read correctly.
  - **jp is broken.** The sentence now ends 「…片面 1 層で約 4.7GB あり。」. 「あり」 was the 連用中止 that led into the deleted clause. It cannot close a sentence in this register: every other sentence in the unit ends 「ある。」 / 「である。」, and DVD-R detail has 「約 4.7GB あり、…使われる。」. This is a LOW (文体) defect introduced by the patch. Rule A's own suggestion would have produced the same ending. → **F1**.
- **L8, p04–p06 + p08 (删除 → 擦除).**
  - CD-ROM one_zh 「既不能写入也不能擦除」, DVD-R detail_zh 「无法擦除」 and pairs[2].rows[0].a_zh 「无法擦除」 match jp 「消去 / 消せない」 and en "erase".
  - p08 extends the change to CD-R detail_zh 「既不能擦除也不能覆盖」 (jp 「消すことも上書きすることもできない」, en "neither erased nor overwritten"). This is correct and needed: without it the unit would use 擦除 for CD-ROM / DVD-R but 删除 for CD-R for the same act of erasing the medium.
  - DVD-RAM one_zh keeps 「可以多次添加、删除和覆盖文件」. That is file-level deletion, where 删除 is the natural word, so keeping it is right.
  - No other 删除 is left in u04's body fields. `zh_terms.json` has no 消去 entry (only 消去権 → 删除权, a legal term, unrelated).
- **L8, p07 (DVD 设备 → DVD 光驱).** Matches en "drive" and the 光驱 already used in CD fig step 0 and CD-R detail / fig. jp 「DVD の装置」 = the drive. q070 (answer: a DVD drive can use several kinds of disc) is still supported.
- **Accepted.** p01–p08 are each correct and introduce no MEDIUM / HIGH. p01's jp needs F1.

## 4. F-fix

| ID | Severity | Field | Before | After |
|---|---|---|---|---|
| **F1** | LOW (introduced by u04 p01; non-blocking) | `terms[4](DVD-ROM).detail_jp` (derived `explanation_jp` follows via the patch tool) | `4.7GB あり。` | `4.7GB ある。` |

`before` 「4.7GB あり。」 occurs exactly once in `detail_jp` (and once in `explanation_jp`). zh and en need no change.

## 5. Observations (record only)

1. LOW, u01 p01 D-198 windows (§3.1): record only. No reword is possible without undoing L1.
2. LOW, unpatched: u03 `terms[1].points[0]` (also cites q084) still says 「SSDの消費電力が小さいのは…」 in absolute form, while u01 flash points[0] now compares with HDD. Its reason clause (no disk motor, no head mechanism) implies the HDD contrast, so this is not a conflict and not a regression.
3. Script notes:
   - The b42 memory_hooks suffix check misreports u02 (index shift); the corrected check is clean.
   - The raw remnant check flags insertion patches (u01 p01, u03 p07); the net count is 0.
   - `stage` meta is removed in all four units (as in b19–b42).

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 2 in scope (u02 M1, u03 M1) → **both resolved**; **0 introduced**
- LOW introduced: 1 → **F1** (u04 DVD-ROM detail_jp sentence end), recommended before commit. Recorded: obs. 1–2. Obs. 3 is script notes.
- **Application:** 46/46 exact (replay). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (264 checked, 0 mismatch).
  - u01–u03: 38/38 match the Rule A text (u02 p01–p03: the `after` text is verbatim; Rule A quoted only part of the `before`). Every 建議修 is covered.
  - u04: 8 patches apply optional Rule A items. p08 extends L8 for consistency. Each was judged correct (§3.4).
- **D-198:** the only new jp window hits are u01 p01 (LOW, the required HDD qualifier). u03 p01 removes the M1 windows (4 → 0, en LCS 50 → 13). Nothing leans toward a wrong option.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 ×4 (u04's 1 warning is pre-existing and not in a patched field)
  - validate --part: 0 issues ×4 (sha256 = base_sha256)
  - parity: 0 diff ×4
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 46 active patches of technology-15-41 u01–u04 are applied exactly. u02 M1 and u03 M1 are fully resolved, and no patch introduces a MEDIUM or HIGH.
- u02 M1: the analogy is now recency / LRU-driven, with no user-chosen residency, so it no longer fits q092 エ. It agrees with detail (LRU) and fig step 4, and answer イ is still supported.
- u03 M1: the copied q063 stem wording is gone; the new text (firmware erase by command, reaching areas that overwriting misses) is factually correct; q063 still has one supported answer (ア).
- Apply F1 (「4.7GB あり。」→「4.7GB ある。」) before committing b43.
