# b53 B3 patch re-review — strategy-02-08 u01–u03 (標準の種類とコード体系 / 標準化団体 / 主要な国際・国内規格, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b53rv/` (`check.mjs` and `d198.mjs` derived from `b51rv/`; only the topic, the base parts and the unit list changed, plus the d198 language regex now also reads `….jp / .zh / .en` figure-cell paths).
- Date: 2026-11-08 (Session 150)
- Scope: the B3 wording patches for strategy-02-08 u01–u03. **33 are `active`, 0 retired**: u01 p01–p11 / u02 p01–p12 / u03 p01–p10 (`patches/strategy-02-08-u0{1,2,3}.json`). All are part-level (no `unit.*` patch).
  - Mapping to Rule A prescriptions:
    - u01 (PASS, a3 after the D-207 stop rule; 建議修 L1–L4 + optional L9): L1 → p01–p03 (fig cell, current name GS1事業者コード); L2 → p04–p06; L3 → p07–p08; L4 → p09–p10; L9 → p11
    - u02 (**FAIL**, MEDIUM M1; 建議修 L1 / L2 / L3 / L5 / L8): M1 → p01; L1 → p02–p04; L2 → p05–p06; L3 → p07–p08; L5 → p09–p11; L8 → p12
    - u03 (**FAIL**, MEDIUM M1; 建議修 L1 / L8 (a_zh)): M1 → p01–p06 (pairs + hook only; **detail part not applied**, §3.1); L1 → p07–p09 (optional `terms[4].one` note not applied); L8 → p10
  Every 建議修 and both MEDIUMs are covered (u03 M1 partially by prescription text, fully by requirement, §3.1). LOWs marked 記録のみ (u01 L5–L8 / L10–L11, u02 L4 / L6 / L7, u03 L2–L7 / L9) are not patched and not re-ruled here.
- Pre-patch bases, located by sha256 = `base_sha256`:
  - u01 `data/ip/textbook/.planning/v2/strategy-02-08-u01/parts/b53-u01-a3/strategy-02-08-u01.loc.r0.json` `a86845f2ebb5e3eb…`
  - u02 `…/strategy-02-08-u02/parts/b53-u02-a1/strategy-02-08-u02.loc.r0.json` `22e62aab5f9080a0…`
  - u03 `…/strategy-02-08-u03/parts/b53-u03-a2/strategy-02-08-u03.loc.r0.json` `7ded84617ab9e2b7…`
- Merged units (current) `data/ip/textbook/units/strategy-02-08-u0N.json` sha256: u01 `4fdccadbce3b9a3a…` / u02 `d88c6b4690219a11…` / u03 `f2d4d61db5a24b74…`. They differ from their bases only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b49_patch_rereview.md` §0 (no unit-level patches in this batch). Topic strategy-02-08 has 29 questions, so there are 145 source strings per language.

1. **Application check** (`b53rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim in the Rule A file.
2. **Same edit as prescribed**: most `before` / `after` strings were shortened by the main session to the changed clause. For each patched field I printed the whole base field and the whole unit field and compared them with the Rule A full-sentence before → after (§3.2).
3. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`, `overview.intro_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
4. **D-198** (`b53rv/d198.mjs`, all 33 patches): LCS of the `before` span and of the `after` span against the 145 sources per language; jp 12-char windows (≤2 substitutions).
5. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with; for u03 M1 a scan of every unit string that mentions 評価 / 指示 / モニタ / EDM / 38500 / 2015 / 2026 / ステークホルダ (三語) (§3.1).
6. **Gates** (each on all 3 units): `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b52): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 129 / u02 115 / u03 123) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-02-08-u01
✓ strategy-02-08-u01 unit: 0 issues (data/ip/textbook/units/strategy-02-08-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-02-08-u01
✓ strategy-02-08-u01 parity: 28 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-02-08-u02
✓ strategy-02-08-u02 unit: 0 issues (data/ip/textbook/units/strategy-02-08-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-02-08-u02
✓ strategy-02-08-u02 parity: 24 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-02-08-u03
✓ strategy-02-08-u03 unit: 0 issues (data/ip/textbook/units/strategy-02-08-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-02-08-u03
✓ strategy-02-08-u03 parity: 30 locations, 0 diff
EXIT=0
validate --part (base): u01 loc#0 0 issues (sha256 a86845f2… = base_sha256) EXIT=0
                        u02 loc#0 0 issues (sha256 22e62aab… = base_sha256) EXIT=0
                        u03 loc#0 0 issues (sha256 7ded8461… = base_sha256) EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  u01 active 11 ok 11 | u02 active 12 ok 12 | u03 active 10 ok 10 | issues [] for all 3
  base sha = base_sha256 for all 33; before count in base = 1 for all 33; replay mismatch 0
  changed base-present paths = patched fields + 'stage' (u01 11+1 / u02 12+1 / u03 10+1); unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata)
  derived checked 66 / 60 / 60, mismatch 0 (u01 terms[4].definition_jp, u02 terms[0]/[3]/[4].explanation_*, terms[0].memory_hook_*, u03 terms[6].memory_hook_*: true)
  overview.intro_jp (u01) contains the p09 goals_jp[3] text: yes
  bold counts unchanged in all 33; [[jp:]] counts unchanged except u01 p07 / p08 (terms[4].points[2].text_zh/en 0→1) — intended (L3)
  memory_hooks hooked-terms pairing: u01 6/6, u02 5/5, u03 3/3 per language, bad 0
  net before remnant: 0 for 32; u03 p02 = 2 (§3.1: terms[6].detail_zh + explanation_zh, already edition-marked 「JIS Q 38500:2015 给出了…」)
  ruleA verbatim miss: [] for all 3 (shortened strings are substrings of the Rule A text; full-field identity checked in §3.2)
```

**Application.** All 33 `before` strings occur exactly once in their base field, all 33 `after` strings are present, replay reproduces every patched field. All 33 are the Rule A text (verbatim or a substring of it), and every whole field equals the Rule A full-sentence after (§3.2).

D-198, before → after (`d198.mjs`, 145 sources per language; jp fields only carry the window columns):

| Patch | Lang | LCS before-span → after-span (nearest source) | jp 12-char windows before / after |
|---|---|---|---|
| u01 p01 | **jp** | 7 → 7 (メーカコード, component name, 2010h22a-q015 option) | 0 / 0 |
| u01 p02 / p03 | zh / en | 4 → 6 (" Japan") / 18 → 18 ("Manufacturer code ", term, unchanged part) | — |
| u01 p04 | **jp** | 4 → 4 (のように / るように) | 0 / 0 |
| u01 p05 / p06 | zh / en | 2 → 2 / 9 → 11 ("d procedure", generic) | — |
| u01 p07 / p08 | zh / en | 7 → 6 (JAN 码) / 14 → 14 (" the JAN code ", term) | — |
| u01 p09 | **jp** | **15 → 5** (2009h21h-q008 stem: バーコードとして商品に印刷され → バーコード) | **7 / 0** |
| u01 p10 | **jp** | **15 → 6** (same stem phrase → はバーコード) | **5 / 0** |
| u01 p11 | zh | 2 → 2 | — |
| u02 p01 | en | 8 → 10 (" range of ", generic) | — |
| u02 p02 / p09 | **jp** | 3 → 4 / 2 → 1 | 0 / 0 |
| u02 p03 / p05 / p07 / p08 / p10 | zh | 4 → 4 / 5 → 5 / 2 → 3 / 2 → 2 / 3 → 3 | — |
| u02 p04 / p06 / p11 / p12 | en | 10 → 10 / 14 → 20 (" example of standard", 2020r02o-q005 stem, generic) / 10 → 10 / 10 → 10 | — |
| u03 p01 / p04 / p07 | **jp** | 2 → 2 / 3 → 3 / 4 → 5 (の国際規格) | 0 / 0 |
| u03 p02 / p05 / p08 / p10 | zh | 1 → 2 / 5 → 5 / 3 → 5 (的国际标准) / 2 → 2 | — |
| u03 p03 / p06 / p09 | en | 6 → 6 / 7 → 7 / 14 → 22 ("nternational standard ", 2017h29a-q010 stem, generic) | — |

No patch adds a copy-level overlap; 0 jp windows after in every jp field. u01 p09 / p10 remove the 15-char 2009h21h-q008 stem phrase that made Rule A u01 L4 (windows 7 / 5 → 0 / 0). The longest new after-span hits (u02 p06 20, u03 p09 22) are generic English ("example of standard(s)", "international standard") in question stems, not choices, and support no wrong option.

## 2. Per-patch verdict

| Unit / IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| u01 p01–p03 | `terms[4](JANコード).fig.data.rows[0].cells[0].jp/zh/en` | L1 (D-205 名称) | Yes: old name メーカコード kept first (= cited 2010h22a-q015 / 2013h25h-q018 name, D-210), current GS1 Japan name added in the parenthesis; en "GS1 Company Prefix" is GS1's English name for GS1事業者コード. 三語 same content. Component count / order unchanged (GS1 Japan 3 elements) | No | OK |
| u01 p04–p06 | `terms[1](デジュレスタンダード).analogy_jp/zh/en` | L2 | Yes: image is now the procedure (審議して議決 / 审议、表决 / debating and voting), no promulgated law → no binding-force reading toward 2015h27h-q014 wrong option. Conclusion clause (決め方そのものが正式) unchanged. D-204: no analogy carries a term's own operation | No | OK |
| u01 p07–p08 | `terms[4].points[2].text_zh/en` | L3 (D-202) | Yes: `[[jp:JANコード]]` added; origin = the term itself, in jp text | No | OK |
| u01 p09–p10 | `goals_jp[3]`, `terms[4].one_jp` (+ `overview.intro_jp`, `definition_jp`) | L4 (D-198) | Yes: 15-char stem phrase gone (windows 7 / 5 → 0 / 0). Meaning unchanged (JAN = number rule, shown as a bar code). zh / en were not copies and were not touched (as prescribed) | No | OK |
| u01 p11 | `key_points_zh[3]` | L9 (optional) | Yes: 即使部分污损或缺失 = jp 汚れや欠けにも強い / detail_zh 即使部分被弄脏或缺损 | No | OK |
| u02 p01 | `terms[1](IEC).analogy_en` | **M1 (MEDIUM)** | Yes (§3.3): "covers a wide range of departments" = jp 幅広い診療科 / zh 设有各种科室; no longer closes ISO to "every other" field, so it no longer contradicts the fig label / pairs[0].rows[1] (電気通信 = ITU) | No | OK |
| u02 p02–p04 | `terms[4](JIS).detail_jp/zh/en` 1st sentence (+ explanation) | L1 (D-205) | Yes: のが原則である / 原则上 / as a rule leaves room for the 2019 認定産業標準作成機関 route. The fig (`steps[0]` 「流れの例」/ 流程示例) is an example flow, as Rule A ruled | No | OK |
| u02 p05–p06 | `terms[0](ISO).detail_zh/en` 2nd sentence | L2 | Yes: ISO 标准 / ISO standards (standards, not the body, are the de jure example); en number agreement fixed throughout ("standards … de jure standards") | No | OK |
| u02 p07–p08 | `terms[3](W3C).detail_zh`, `key_points_zh[3]` | L3 | Yes: 推荐标准 ×3 (bold kept on the first, `[[jp:勧告]]` kept). No 建议 left in u02 zh (grep 0) | No | OK |
| u02 p09–p11 | `terms[0].hook_jp/zh/en` (+ memory_hook, summary.memory_hooks[0]) | L5 (§9) | Yes: とされ / 一般认为 / is said to removed (ISO itself states the isos origin) | No | OK |
| u02 p12 | `key_points_en[1]` | L8 | Yes: "the two bodies' fields" has its referent inside the sentence (ISO and the IEC) | No | OK |
| u03 p01–p06 | `pairs[1].rows[2].b_jp/zh/en`, `terms[6](JIS Q 38500).hook_jp/zh/en` (+ memory_hook, summary.memory_hooks[2]) | **M1 (MEDIUM)** | Yes (§3.1): every field that names the model's components now carries an edition; detail part of the prescription not applied — deviation accepted | No | OK |
| u03 p07–p09 | `overview_rows[4](ISO 30414).one_line_jp/zh/en` | L1 | Yes: 国際規格 / 国际标准 / International standard holds for both 2018 (guidelines) and 2025 (requirements); the same row's extra (開示の指針 (2018 年版)) and terms[4].one (2018 年版は指針) keep the edition-marked character. Optional one note not applied (optional, §3.1 end) | No | OK |
| u03 p10 | `pairs[0].rows[2].a_zh` | L8 (a_zh) | Yes: 客户 = terms[0].points[1] 客户满意度 = zh_terms 顧客満足 | No | OK |

## 3. Focused checks

### 3.1 u03 M1 without the detail sentence (main-session deviation)

**What was not applied.** Rule A u03 M1's prescription had three parts: (a) pairs[1].rows[2].b + 「(2015 年版)」, (b) terms[6].hook + 「2015 年版のモデルは」, (c) terms[6].detail + 「(2026 年の改正版では、このモデルにステークホルダへの対応が加わった)」. The main session applied (a) and (b) (p01–p06) and not (c). Separately it did not apply the optional L1 note on terms[4].one (2025 年版).

**Is M1's requirement met?** M1 is a D-205 観点 10 / 型 (10) finding: the model's components stated **with no edition** (medium). Rule A's own text: "版付きなのは detail の『JIS Q 38500:2015 では』だけ" and "detail と hook に版が付けば図は 2015 年版のモデルの図として読める". The detail was already edition-marked in the base; (c) adds the 2026 content, it does not add an edition. Scan of every u03 string (三語) that names 評価 / 指示 / モニタ / EDM / 38500:

| Field | Lists the model's components? | Edition after patches |
|---|---|---|
| `terms[6].detail_*` (+ `explanation_*`) | Yes (評価・指示・モニタ…モデル) | **JIS Q 38500:2015 では** (base, unchanged) |
| `terms[6].hook_*` (+ `memory_hook_*`, `summary.memory_hooks_*[2]`) | Yes (EDM) | **2015 年版のモデルは** / 2015 年版的模型 / For the 2015 model (p04–p06) |
| `pairs[1].rows[2].b_*` | Yes | **(2015 年版)** / （2015 年版） / (2015 edition) (p01–p03) |
| `terms[6].fig` (flow steps, 3 nodes + 3 step captions; no fig-level caption / title field) | Yes (image) | Belongs to terms[6]; read with the 2015-marked detail and hook — Rule A's own condition for leaving the fig untouched |
| `terms[6].points[0].text_*` | No: says who does E / D / M (top management, not front-line); not a closed list of the model | Not needed — true in both editions (EDM and the governing body remain in 2026), as Rule A ruled |
| `terms[6].one_*`, `overview_rows[6]`, `goals_*[2]`, `key_points_*[2]`, `unit_summary_*`, analogy | No component list (IT governance / principles and guidelines / top management / ISO/IEC 38500 origin) | — |

So no field still states the model's components without an edition. The p02 "remnant" (評估、指导、监督的模型 ×2) is detail_zh + explanation_zh, both inside 「JIS Q 38500:2015 给出了…」. Nothing says the 2015 model is current (no 観点 1 issue). **M1 is resolved without (c). No F-fix required.**

**On the stated reason.** The main session's first reason (D-205 書き方 10 「改正版の中身は引用題が問わない限り足さない」, precedent b33 u05 L1) is the same citation the b33 re-review corrected (S148 log): 書き方 10 binds the writer; Rule A may add amended content by patch after its own primary check (S138 §6 / D-210). So 書き方 10 does not forbid (c). Two reasons do hold: (1) (c) is not needed to clear 観点 10 (table above); (2) the JIS text itself is unread (JSA Webdesk maintenance to 2026-11-11). Rule A's sources are the drafting committee chair's note (ITSCJ NL111) and the ISO/IEC 38500:2024 table of contents; these are good secondary sources, but the exact JIS wording of the added element is unconfirmed. Correct record: **"(c) deferred by main-session judgment (not required for M1; JIS text unconfirmed)"**, not "barred by 書き方 10". Residual: a reader learns only the 2015 model and is not told what 2026 added. The hook's 「2015 年版のモデル」 signals a later edition exists. LOW (obs. 1), a candidate after JSA reopens, same handling as b33 u05 L1.

The optional terms[4].one 2025 note (L1 任意) is optional in Rule A. After p07–p09, one_line (国際規格) is true in both editions and one / extra keep 「2018 年版は指針」. Not applying it leaves no MEDIUM.

### 3.2 Shortened before / after = the prescribed edit

For each of the 33 patched fields (one patch per field) I compared the whole base field → whole unit field with the Rule A full-sentence before → after:

- u01: L1 three cells, L2 three analogies, L3 zh / en points[2], L4 goals_jp[3] / one_jp, L9 key_points_zh[3] — whole-field after = Rule A after, character for character (L3 / L4 / L9 Rule A gives the full sentence; the patch replaces only the clause, and the rest of the sentence is identical).
- u02: M1 analogy_en (Rule A gave the clause; the whole sentence = jp / zh image), L1 detail ×3 1st sentence, L2 detail_zh / en 2nd sentence, L3 detail_zh + key_points_zh[3], L5 hook ×3, L8 key_points_en[1] — all = Rule A after. For p05 the Rule A after 「因此 ISO 标准是通过正式程序制定的标准，」 is reproduced verbatim.
- u03: M1 (a) / (b) and L1 / L8 — all = Rule A after. M1 (c) not applied (§3.1).

0 differences from the prescriptions other than the omission of u03 M1 (c) and the optional u03 L1 note.

### 3.3 u02 p01 M1 (IEC analogy en)

- jp 「幅広い診療科をそろえた総合病院」, zh 「设有各种科室的综合医院」, en now "a general hospital that covers a wide range of departments": same scope in all three, none closed.
- Agrees with the IEC fig label (ISO side = 電気・電子と電気通信を除く) and pairs[0].rows[1].a: "a wide range" does not claim telecommunications for ISO, and IEC points[0] keeps 電気通信 = ITU (2021r03-q002 answer).
- D-204: the analogy does not carry the negation of a point; no wrong option of the topic's 29 questions is supported. **MEDIUM resolved.**

### 3.4 Trilingual parity, zh terms, [[jp:]] origins

- parity 28 / 24 / 30 locations, 0 diff. validate 0 issues and 0 warnings on all 3 units (no zh-term warn).
- zh terms: 客户 (zh_terms 顧客満足 → 客户满意度), 推荐标准 for 勧告 (not in zh_terms; the W3C Recommendation zh name, with [[jp:勧告]] kept), GS1 事业者代码 (no zh_terms entry; validate silent).
- [[jp:]]: only u01 p07 / p08 add markers (JANコード, present in jp text). All other patches keep the [[jp:]] count.

## 4. F-fix

No required F-fix. No patch introduces a HIGH, MEDIUM or LOW defect.

Record correction (not a data fix): in the S150 log / batch evidence, record u03 M1 (c) and the u03 L1 optional note as "主 session 判断で延後 (M1 の要件 = 版明記は満たす; JIS 本文未確認)", not as barred by D-205 書き方 10 (§3.1; same correction as the b33 re-review).

## 5. Observations (record only)

1. LOW (content, deferred), u03 terms[6].detail: the 2026 addition (stakeholder engagement) is not mentioned anywhere. Not required by 観点 10 once the edition is marked. Candidate patch after JSA Webdesk reopens (2026-11-11) and the JIS wording is confirmed: Rule A u03 M1 (c) text.
2. LOW (content, deferred), u03 terms[4].one: optional 2025-edition note (Rule A L1 任意) not applied. one_line and one are already edition-consistent.
3. Script notes:
   - `stage` meta is removed in all 3 units (as in b19–b52).
   - u03 p02 net remnant 2 = edition-marked detail_zh / explanation_zh (§3.1), not a missed replacement.
   - The d198 zh / en source lists may include stringified choice objects; this only makes the LCS column conservative.

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 2 in scope (u02 M1, u03 M1) — **both resolved**; **0 introduced**
- LOW introduced: 0. Recorded: obs. 1–2 (deferred content, not defects). Obs. 3 is script notes.
- **Application:** 33/33 exact (replay against the part bases, sha256 = base_sha256). 0 unexplained diffs, 0 net `before` remnants except the explained u03 p02 (edition-marked detail). Derived fields follow (186 checked, 0 mismatch). Every whole patched field = the Rule A after. The only departures from the prescriptions are u03 M1 (c) and the optional u03 L1 note; both were judged not needed (§3.1). Every 建議修 and both MEDIUMs are covered.
- **D-198:** no patch adds a copy-level overlap; 0 jp windows after. u01 L4 removes the 15-char 2009h21h-q008 stem phrase (windows 7 / 5 → 0 / 0).
- **D-205 / D-210:** u01 keeps the cited name メーカコード and adds the current name; u03 now edition-marks every statement of the EDM model; u02 JIS enactment route is no longer closed.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 ×3
  - validate --part: 0 issues ×3 (sha256 = base_sha256)
  - parity: 0 diff ×3 (28 / 24 / 30 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 33 active patches of strategy-02-08 u01–u03 are applied exactly. Each resolves its Rule A finding, including the u02 and u03 MEDIUMs that made those Rule A audits FAIL. None introduces a HIGH, MEDIUM or LOW that needs a fix. The main-session deviation on u03 M1 is accepted: M1 is resolved without the detail sentence. Its stated 書き方 10 rationale should be recorded as "deferred", not "barred". No required F-fix.
