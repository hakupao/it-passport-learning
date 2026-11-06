# b33 B3 patch re-review — strategy-05-14 u01–u05 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the per-unit Rule A audits, and I share no context with them (Rule D)
- Date: 2026-11-06 (Session 148/149)
- Scope: B3 wording patches for strategy-05-14-u01 (p01–p10), u02 (p01–p19), u03 (p01–p04), u04 (p01–p03) and u05 (p01–p02)
  — **38 `active`, 0 retired** (`patches/strategy-05-14-u0{1,2,3,4,5}.json`). Each patch was checked against the Rule A prescriptions:
  `-u01` L1・L2・L3・L4・L5・L10a・L10b・L10c 建議修; `-u02` L1〜L5 建議修; `-u03` L1・L2 建議修; `-u04` L1〜L3 建議修; `-u05` L2 建議修 (**L1 建議修 deliberately not applied**, §3.6).
  The 5 Rule A files report MEDIUM 0 / HIGH 0. Coverage: u01 10 = L1 p01 / L2 p02 / L3 p03 / L4 p04 / L5 p05–p07 / L10a p08 / L10b p09 / L10c p10; u02 19 = L1 p01 / L2 p02–p07 / L3 p08–p13 / L4 p14–p16 / L5 p17–p19; u03 4 = L1 p01–p03 / L2 p04; u04 3 = L1 p01 / L2 p02 / L3 p03; u05 2 = L2 p01–p02.
  Also checked against the merged units `data/ip/textbook/units/strategy-05-14-u0{1..5}.json` (sha256 u01 `ba14cad54cc0d0dc…`, u02 `bfc3932dfcfe609d…`, u03 `9c66de2f672c86cb…`, u04 `e0d9bccc259b5a74…`, u05 `dc050287b130607a…`).
- Pre-patch bases, located by sha256 = `base_sha256`. All patches of a unit share one base, and all match:
  u01 `b33-u01-a2/…loc.r0.json` (`b9b5aa5e…`), u02 `b33-u02-a1/…loc.r0.json` (`f6e46038…`), u03 `b33-u03-a1/…loc.r0.json` (`08834c6d…`), u04 `b33-u04-a1/…loc.r0.json` (`65d0b8a0…`), u05 `b33-u05-a3/…loc.r0.json` (`dcfdf5c6…`).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files; S147 additional types (8)(9)(10) (`docs/templates/ruleA_unit_audit.md`).
- No past-question text is quoted below (qid + paraphrase only). Strings shown are unit text, patch text or term names. Matched fragments are ≤12 chars, except en sidecar overlaps, which are project translations.

## 0. Method

Same as `b32_patch_rereview.md` §0. Topic strategy-05-14 has 39 questions; 2019h31h-q093 (topic technology-15-42) is added as the u02 L5 trigger. That gives 40 questions and 200 source strings per language.

1. **Application check** (script `check.mjs`):
   - every string field of the base and of the merged unit is walked;
   - each `after` must appear in its field;
   - `before` (raw and notation-stripped) must not survive anywhere in the unit, derived copies included;
   - every base-present path that differs must be explained by a patch;
   - replaying the patches in file order on the base must reproduce the unit's field exactly;
   - each patch's `before` / `after` (bold stripped) is searched verbatim in its unit's Rule A file.
2. **Derived-field check** (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`) for every term and key point. `summary.memory_hooks_*` is matched in order over the hooked terms.
3. **D-198** (`d198b.mjs`):
   - jp patches (u01 p01, p02, p04, p05; u02 p08, p11, p14, p17; u03 p01; u04 p01): LCS, 12-char window ≤2 substitutions with and without masking, and wDice, against the stem and all choices of the 40 questions.
   - zh / en patches: LCS against the zh / en sidecars, for the whole field before → after and for the `after` span.
   - Per-choice + stem LCS before → after (`focus2b.mjs`) against the patched term's cited / quiz qids, plus the trigger pair u02 p17–p19 × 2019h31h-q093.
   - Terms with no cited / quiz qid get no per-choice rows: u02 金融情報システム / ITS, and all of u03 (mix only).
4. **D-195 / D-200** via validate; `validate --part <base>` for comparison. Sentence count of the patched step captions (u01 p10, u05 p02).
5. **Manual reading** of each patched field in context (whole term; overview rows; pairs; key_points; summary). First-hand checks:
   - u01 `terms[3]` (RFID) vs 2019r01a-q031, and `terms[2].points[1]` vs 2023r05-q012;
   - u02 `terms[4]` (ETC) analogy / detail vs 2019h31h-q093 (and 2009h21h-q018);
   - u02 `terms[3]` (ITS) fig root ×3, `term_zh`, `one_*`, `summary.memory_hooks_zh[3]`;
   - u02 `terms[0]` detail ×3 + `key_points_*[0]` + `summary.key_points_*[0]`, plus a walk of every u02 string for the old wording (社会全体 / 整个社会 / across society; 信息系统 / information systems for 情報系);
   - u04 `key_points_*[2]` vs 2012h24h-q013;
   - u03 `terms[3]` hook ×3, and a walk for 定制开发;
   - u05 a walk for zh 画面; u05 `terms[3]` (マイナンバー) one / detail / points / key_points for §3.6.
6. **Gates**: `scripts/textbook-v2-validate.mjs --unit` / `scripts/textbook-v2-parity.mjs --unit` per unit, and `npx vitest run src/lib/textbook`.

Scripts (scratchpad):
- `b33rr/check.mjs` (pre-adapted, run unchanged);
- `b33rr/d198b.mjs` = copy of `b32rr/d198b.mjs`; only the topic (+ 2019h31h-q093) and the unit-part list changed;
- `b33rr/focus2b.mjs` = copy of `b32rr/focus2b.mjs`; topic changed, extra = u02 p17–p19 × 2019h31h-q093;
- `b33rr/extra.mjs` / `extra2.mjs` (order-matched memory_hooks, `term_zh`, walks, residual masked window, L1 dry check);
- `b24rr/q.cjs` (question reader, unchanged).

Not established (as in b14–b32): the unit files carry the whole uncommitted v1 → v2 rewrite. This review shows two things only: the patches are present and correct in context, and relative to the loc base nothing but the patches changed in base-present paths.
- Paths that exist only in the merged unit (derived / meta / v1 invariants: u01 152, u02 131, u03 114, u04 114, u05 133) were checked for the derived copies (step 2) and for `before` remnants (step 1).
- No law text is touched by an applied patch. The only law question is u05 L1 (§3.6).

## 1. Script results (fresh, 2026-11-06)

```
✓ strategy-05-14-u01 unit: 0 issues   validate EXIT=0 | ✓ parity: 34 locations, 0 diff
✓ strategy-05-14-u02 unit: 0 issues   validate EXIT=0 | ✓ parity: 36 locations, 0 diff
✓ strategy-05-14-u03 unit: 0 issues   validate EXIT=0 | ✓ parity: 29 locations, 0 diff
✓ strategy-05-14-u04 unit: 0 issues   validate EXIT=0 | ✓ parity: 26 locations, 0 diff
✓ strategy-05-14-u05 unit: 0 issues   validate EXIT=0 | ✓ parity: 38 locations, 0 diff
validate --part (bases): ✓ u01 / u02 / u03 / u04 / u05 loc#0: 0 issues, 0 warnings (sha256 = base_sha256 ×5)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

**Application.**
- All 38 `before` strings occur exactly once in their base field, and all 38 `after` strings are present.
- Replaying the patches in file order reproduces every patched field exactly (5/5 units).
- Changed base-present paths: u01 10, u02 17, u03 4, u04 3, u05 2. These are exactly the patched fields, plus the `stage` meta key, which was removed (as in b19–b32; `round` / `jp_round` are non-string part meta).
- Two fields carry 2 patches each, both replayed in order: u02 `terms[0].detail_zh` (p02 + p09) and `terms[0].detail_en` (p05 + p10).
- Unexplained diffs: 0.

**`before` remnants.** u01 / u03 / u04 / u05 0. u02: `check.mjs` reports 10 hits, and **all are false positives**:
- p14 at `terms[3].one_jp` / `definition_jp`; p15 at `terms[3].term_zh` / `summary.memory_hooks_zh[3]`. The `before` is the bare headword with its full name (ITS (高度道路交通システム) / ITS（智能交通系统）). Those fields hold the headword itself, not a figure label.
- p14 / p15 / p16 at their own `fig.data.root.label.{jp,zh,en}`. The before is a substring of the after: jp / zh append "に含まれるシステム (例)" / "包含的系统（示例）"; en wraps it as "Systems within … (examples)".
- p17 / p18 / p19 at their own `analogy_*`. These are append-only patches, so the before is a prefix of the after. Same class as b32 u01 p06.

Other u02 walks: the old impact wording (社会全体のお金 / 整个社会的资金 / across society) has 0 hits. "信息系统" survives only inside the headword 金融信息系统 (term / one / definition / overview_rows[0]) and GIS 地理信息系统, both correct. en "information systems ([[jp:情報系]]" has 0 hits.

**`term_zh` (u02 L4 check).** `terms[3].term_zh` = 「ITS（智能交通系统）」, identical to `v1-original.json`. It is not a base-present path (the loc base carries no `term_zh`), so no patch could have reached it, and p15 targets only `fig.data.root.label.zh`. **term_zh unchanged.**

`check.mjs` "ruleA verbatim miss": [] for all 5 units (38/38 before and after found verbatim in the Rule A files).

**Derived fields.**
- `hook_*` → `memory_hook_*`: u01 t1 jp, u03 t3 ×3, u04 t3 zh — true ×5.
- `detail_*` → `explanation_*`: u01 t2 zh, u02 t0 ×3, u04 t4 en — true ×5.
- `one_en` → `definition_en`: u02 t3 — true.
- `key_points_*[0]` → `summary.key_points_*[0]` (u02 ×3) and `key_points_jp[2]` → summary (u04): follow.
- Full walk: u01 84, u02 78, u03 66, u04 66, u05 72 = 366 derived strings, 0 mismatch.
- `summary.memory_hooks_*`: the index-matched suffix check reports `bad` for u01 [1]–[6] and u05 [2]–[3]. This is a script artifact: u01 t0 and u05 t0 / t1 / t4 / t6 have no hook, so the summary array holds one entry per hooked term. Matched in order over hooked terms, 21 + 21 + 18 + 18 + 12 = 90 entries, **0 bad**, lengths equal.

**Notation and captions.** Notation counts (bold, `[[jp:]]`) are unchanged before → after in 38 of 38 patched fields; parity 0 diff. The patched captions u01 p10 (`terms[5].fig.steps[1].caption_zh`) and u05 p02 (`terms[0].fig.steps[0].caption_zh`) are 1 sentence each (D-195 §2).

**Old wording gone.** u03 zh 定制开发: 0 hits (定制 remains only for customisation: detail_zh 追加开发（定制）, key_points_zh[2] + derived — the intended split). u05 zh 画面: 0 hits.

D-198, before → after (`d198b.mjs`):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest overlap of the `after` span | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| u01 p01 | **jp** | 2025r07-q008 stem → 2018h30a-q035 stem | 5 → 5 | 在庫管理に (5, standard term = zh/en 原語) | 0 / 0 → 0 / 0; 0.19 → 0.23 |
| u01 p02 | **jp** | **2023r05-q012 stem** → 2020r02o-q091 stem | **12 → 7** | スマートフォン (7, term) | **3 / 2 → 0 / 0**; 0.41 → 0.34 |
| u01 p03 | en | 2023r05-q012 stem | 25 → 25 (" built into a smartphone ", unpatched part — obs. 1) | " serve as a " (12) | — |
| u01 p04 | **jp** | 2013h25a-q100 stem | 5 → 5 (unchanged) | その (2) | 0 / 0 → 0 / 0; 0.21 → 0.21 |
| u01 p05 | **jp** | **2019r01a-q031 エ (correct)** → 2013h25a-q097 stem | **6 → 4** (まとめて処理 → RFID) | 読み取 (3) | 0 / 0 → 0 / 0; 0.21 → 0.11 |
| u01 p06 | zh | 2013h25a-q097 stem | 4 → 4 (RFID) | 的标签 (3) | — |
| u01 p07 | en | 2013h25a-q097 stem | 12 → 12 (" radio waves", unchanged part) | "s can be rea" (12, generic) | — |
| u01 p08 | zh | 2010h22h-q008 stem → 2015h27a-q011 stem | 2 → 4 | 销售部门 (4, generic dept. name) | — |
| u01 p09 | zh | 2013h25a-q097 stem | 5 → 5 (的RFID, unchanged) | 能通过 (3) | — |
| u01 p10 | zh | 2009h21a-q020 イ | 2 → 2 | 生产 (2) | — |
| u02 p01 | en | 2015h27a-q011 stem | 17 → 17 (unchanged) | "to improve " (11) | — |
| u02 p02–p04 | zh | 2010h22h-q008 stem | 5 / 5 / 4 → 3 / 3 / 3 | 信息 / 数据用 (≤3) | — |
| u02 p05–p07 | en | 2010h22h-q008 stem | 20 / 20 / 18 → 17 / 19 / 14 | "information " (12) / "e transaction " (14, 2011h23a-q031 ア — generic) | — |
| u02 p08 | **jp** | 2019r01a-q031 イ | 8 → 8 (安全性を確保する, unchanged part) | するため (4) | 0 / 0 → 0 / 0; 0.11 → 0.11 |
| u02 p09 / p12 | zh | 2010h22h-q008 stem | 5 / 4 → 3 / 4 | 用户和 (3) | — |
| u02 p10 / p13 | en | 2010h22h-q008 stem | 20 / 19 → 17 / 19 | " customers and " (15, generic) | — |
| u02 p11 | **jp** | 2010h22h-q008 stem | 6 → 6 (情報システム, headword) | の利用者 (4) | 0 / 0 → 0 / 0; 0.22 → 0.21 |
| u02 p14 | **jp** | 2010h22h-q008 → 2013h25a-q097 stem | 4 → 5 | システムに (5) | 0 / 0 → 0 / 0; 0.33 → 0.27 |
| u02 p15 | zh | 2013h25a-q097 stem | 2 → 3 | 的系统 (3) | — |
| u02 p16 | en | 2015h27a-q013 エ | 11 → 11 (" transport ", headword part) | same (11) | — |
| u02 p17 | **jp** | 2009h21a-q020 stem | 5 → 6 | ICカードと (6, term) | 0 / 0 → 0 / 0; 0.18 → 0.17 |
| u02 p18 | zh | 2009h21a-q020 ア | 3 → 3 | 卡通过 (3) | — |
| u02 p19 | en | **2019h31h-q093 エ (correct)** | 14 → 14 ("ing a transit ", first sentence, unchanged) | same (14) — §3.3 | — |
| u03 p01 | **jp** | 2019r01a-q022 ウ → 2013h25a-q098 stem | 4 → 4 | のように (4) | 0 / 0 → 0 / 0; 0.09 → 0.09 |
| u03 p02 | zh | 2010h22h-q008 stem | 3 → 3 | 部门的 (3) | — |
| u03 p03 | en | 2016h28a-q018 エ | 13 → 13 (" the product ", unchanged) | "the product " (12) | — |
| u03 p04 | zh | 2013h25a-q097 stem | 3 → 3 | 开发 (2) | — |
| u04 p01 | **jp** | 2012h24h-q013 stem | 16 → 16 (headword 住民基本台帳ネットワークシステム) | ることを (4) | **10 / 7 → 7 / 1**; 0.33 → 0.30 |
| u04 p02 | zh | 2012h24a-q030 ウ | 6 → 4 (基本台帐, term) | same | — |
| u04 p03 | en | 2015h27a-q013 エ | 19 → 19 (unchanged) | "public " (7) | — |
| u05 p01 | zh | 2012h24a-q030 stem | 2 → 2 | 申请 (2) | — |
| u05 p02 | zh | 2023r05-q014 stem | 3 → 3 | 上输入 (3) | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52).
- Masked 12-char windows are 0 → 0 in 9 of 10 jp patches. u04 p01 drops 7 → 1, and the one remaining window is the headword (住民基本台帳 + masked katakana) vs the q013 stem — a term name, not phrasing.
- u01 p02 removes the only non-headword unmasked window in u01 (3 → 0).
- Longest after-span overlaps: jp ≤6 (term names), zh ≤4, en ≤15 (generic). u02 p19 and u01 p07 / u02 p16 reach 11–14 only through the unchanged first sentence or a headword.

Per-choice check (LCS before → after vs each choice; `focus2b.mjs`):
- **2019r01a-q031** (RFID; correct エ = batch handling of items at lending / return) × u01 p05–p07: the correct choice moves **away** in all three languages (jp エ* 6 → 3, zh 2 → 1, en 8 → 3). Wrong choices: jp ア / イ / ウ 1 → 2 (single characters), zh ≤1, en ≤6 (" in on" / "the " generic). None of the wrong choices (GPS position / encryption / biometrics) is approached. §3.1.
- **2023r05-q012** (correct ウ = b only) × u01 p02–p03: the choices are item-letter sets, so all are 0 → 0 (jp). Stem jp 12 → 7 (スマートフォン). en stem 6 → 6.
- **2018h30a-q035 / 2016h28a-q018** × u01 p01 / p04 / p08:
  - p01 vs q018 エ* 2 → 4 (在庫管理). This is the standard compound, = the zh / en 原語 `[[jp:在庫管理]]`. The correct choice's set and order (品ぞろえ・発注・在庫管理) is not reproduced (obs. 2).
  - p08 zh vs q018 ア 2 → 4 (销售部门). The field is the SFA side of `pairs[0]` (department supported = sales), which separates SFA from POS. It does not support ア as a POS goal.
  - p04 flat.
- **2009h21a-q020** × u01 p02–p03 / p09: jp 4 → 3 for every choice (カードの generic), en ≤5 (" and "), zh flat.
- **2017h29h-q022 / 2015h27a-q013 / 2019r01a-q028 / 2010h22h-q008 / 2011h23a-q031 / 2015h27h-q013 / 2014h26h-q005** × u01 p08 / p10: ≤2 per choice, flat.
- **2019h31h-q093** (NFC; correct エ = transit IC ticket gate; ア = ETC onboard-unit radio) × u02 p17–p19: jp ア 1 → 2, エ* 3 → 3; zh ア 1 → 3, エ* 2 → 2; en ア 6 → 6 ("ation "), エ* 14 → 14 (unchanged first sentence); stem en 6 → 8 (" method "). §3.3.
- **2020r02o-q091 / 2024r06-q099** × u02 p11–p13 (key_points[0], whole-unit qids): jp ≤1, zh ≤1, en ≤6 per choice (generic " and t").
- **2012h24h-q013** (correct イ = resident services + administrative efficiency) × u04 p01: **イ* 10 → 2**; ア 1 → 2, ウ 2 → 3, エ 2 → 2; stem 2 → 2. §3.5.
- **2012h24a-q030** × u04 p01–p02 / u05 p01–p02: ≤2 jp; zh ウ* 6 → 4 (基本台帐 = 住民基本台帳カード term).

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01 | `terms[1](POS).points[0].text_jp` | L1 | Yes: jp 在庫管理 = zh / en `[[jp:在庫管理]]` 原語 | LOW record only (obs. 2) | OK |
| u01 | p02 | `terms[2](ICカード).points[1].text_jp` | L2 (D-198 window) | Yes (§3.2) | No | OK |
| u01 | p03 | `terms[2].points[1].text_en` | L3 | Yes: "and in similar roles" = jp など / zh 等 | No (obs. 1: unpatched en " built into a smartphone ") | OK |
| u01 | p04 | `terms[1].hook_jp` (+ memory_hook, summary) | L4 | Yes: 時点 = 販売時点情報管理 / one 「売れたその時点」 | No | OK |
| u01 | p05–p07 | `terms[3](RFID).points[0].text_*` | L5 | Yes (§3.1) | No | OK |
| u01 | p08 | `pairs[0].rows[0].b_zh` | L10a | Yes: 销售部门 = a department name (en "Sales force") | No | OK |
| u01 | p09 | `terms[2].detail_zh` (+ explanation) | L10b | Yes: 靠近读写器 = points[1] zh | No | OK |
| u01 | p10 | `terms[5].fig.steps[1].caption_zh` | L10c | Yes: 单件或批次 = jp 製造した単位 / points[0] zh; 1 sentence | No | OK |
| u02 | p01 | `terms[3](ITS).one_en` (+ definition) | L1 | Yes: "and more" = jp など / zh 等 / pairs[1] en | No | OK |
| u02 | p02–p07 | `terms[0](金融情報システム).detail_{zh,en}`, `points[0].text_{zh,en}`, `fig…children[1].label.{zh,en}` | L2 | Yes: 信息类系统 / "information (analytics) systems" no longer coincide with the headword 金融信息系统 / financial information system; 6/6 places, 0 survivors | No | OK |
| u02 | p08–p13 | `terms[0].detail_*` (+ explanation), `key_points_*[0]` (+ summary) | L3 | Yes (§3.4) | No | OK |
| u02 | p14–p16 | `terms[3].fig.data.root.label.*` | L4 | Yes (§3.4) | LOW cosmetic only (obs. 3) | OK |
| u02 | p17–p19 | `terms[4](ETC).analogy_*` | L5 (type 9 form) | Yes (§3.3) | No | OK |
| u03 | p01–p03 | `terms[3](業務別ソフトウェアパッケージ).hook_*` (+ memory_hook, summary) | L1 (type 9 form) | Yes: the criterion 「どの業界の会社にもある」/ 任何行业的公司都有 / "found in companies of every industry" is back in the hook = one 「業種を問わず共通」 | LOW cosmetic only (obs. 4) | OK |
| u03 | p04 | `terms[3].points[0].text_zh` | L2 | Yes: スクラッチ開発 = 全新开发 ≠ customisation 定制; 定制开发 0 in the unit | No | OK |
| u04 | p01 | `key_points_jp[2]` (+ summary) | L1 (D-198 word order) | Yes (§3.5) | No | OK |
| u04 | p02 | `terms[3].hook_zh` (+ memory_hook, summary) | L2 | Yes: 「取“住（民）”和“基（本台帐）”各自的首字」 = the first character of each part, no 「first two characters」 reading | No | OK |
| u04 | p03 | `terms[4](e-Gov).detail_en` (+ explanation) | L3 | Yes: "Public comments … are also accepted here" = jp 意見公募の受付 | No | OK |
| u05 | p01–p02 | `terms[0](電子申請).fig.data.nodes[0].label.zh`, `fig.steps[0].caption_zh` | L2 | Yes: 页面 (zh UI term); 画面 0 in zh; node / caption still agree (填写 / 输入 the application data); 1 sentence | No | OK |
| u05 | — | `terms[3](マイナンバー).detail_*` | L1 **not applied** | — | No false / misleading statement (§3.6) | Deferral tolerable; stated reason corrected |

## 3. Focused checks

### 3.1 u01 p05–p07 (L5) — RFID point vs 2019r01a-q031

- After: jp 「…複数の品物のタグを一括して読み取れる。」/ zh 「就能一并读取多件物品的标签。」/ en "the tags on several items can be read in one pass".
- The point now states the mechanism (one reader pass reads many tags by radio). Before, it stated the outcome "process several items together", which is the correct choice's wording.
- Distance to the correct choice falls in all three languages (jp 6 → 3, zh 2 → 1, en 8 → 3). The library / book / lending scene is not used.
- The learner still reaches エ by the headword's general principle (batch reading → batch handling; D-211 (ii)).
- The wrong choices (real-time position / encryption / biometrics) are not approached (≤2 jp, ≤1 zh, ≤6 en generic), and the point gives no cue toward them.
- In-unit consistency: = RFID detail (電波で読む), the flow steps (電波 → 受電 → 応答 → 照合), ICタグ points[1] (電波・チップ). `key_points` are not affected. **The new wording does not move closer to the correct option; it moves away.**

### 3.2 u01 p02 (L2) — IC card point vs 2023r05-q012 stem

- After: 「非接触型の IC チップは、カードの形でも、スマートフォンの中にあっても、リーダーにかざすと電波で交信し、乗車券などとして働く。」
- The 12-char unmasked match with the q012 stem's set-up noun phrase is gone: windows 3 / 2 → 0 / 0, LCS 12 → 7 (スマートフォン = the term), wDice 0.41 → 0.34.
- Meaning is unchanged: a contactless chip in a card or in a phone, plus a reader, works by radio as a ticket, etc.
- The stem's judged item (commuter pass at a gate) is still only paraphrased as 乗車券など. The wrong items (base-station handover / roaming / QR reading) are neither named nor denied, so q012 → ウ is unaffected.
- en (p03) "and in similar roles" opens the use list that jp など / zh 等 already opened.
- The en sentence keeps " built into a smartphone " (25), which matches the q012 en stem. That part was not prescribed for change by Rule A L2 ("zh / en は写しでなく不変"). It is the stem's set-up phrase (not a choice) in a project translation → obs. 1.

### 3.3 u02 p17–p19 (L5) — ETC analogy vs 2019h31h-q093; facts

- After (appended sentence): jp 「ただし無線の方式は改札にかざす IC カードとは別で、離れたアンテナと走りながら通信する。」/ zh 「不过无线方式与在闸机上轻触的交通卡不同，是边行驶边与远处的天线通信。」/ en "The radio method differs from a tap card, though: the car talks to an antenna some distance away while moving." (= L5 text verbatim 3/3).
- **Facts:**
  - ETC uses DSRC (dedicated short-range communication, 5.8 GHz band) between the on-board unit and a roadside antenna over the toll lane, and it communicates while the car passes. That is "an antenna some distance away, while moving".
  - Transit IC cards use proximity contactless communication (13.56 MHz, FeliCa / NFC-F class) when held over the gate reader. That is "a tap card".
  - The sentence is correct and does not name a frequency or standard, so there is no version risk.
  - It agrees with ETC `detail_*` (車載器 + IC カード, exchange while passing the gate, billed later) and `one_*` (無線で通信).
- **2019h31h-q093** (asks which one uses an NFC-conformant method; correct = transit IC ticket gate; ア = ETC onboard-unit radio):
  - Before, the analogy equated ETC with a transit IC card. Applied to q093, that pulled toward ア.
  - The appended sentence now says that ETC's radio method is *not* the tap-card method, so the analogy separates ア from エ. This is the intended direction.
  - The en overlap with エ (14, "ing a transit ") lies in the unchanged first sentence and is the analogy's image (tapping a transit card), not a choice frame. The new sentence adds no overlap (ア 6 → 6 "ation ", stem 6 → 8 " method ").
  - 2009h21h-q018 (ETC card = wrong choice for real-time debit) is unaffected.
- The analogy is now 2 sentences. D-195 sets no sentence limit for analogies, and validate is 0. The second sentence marks the analogy's range (D-204: the analogy no longer contradicts one / detail). **L5 resolved, no new issue.**

### 3.4 u02 p08–p13 (L3) financial outage impact; p14–p16 (L4) ITS tree root

- **L3:**
  - detail jp 「わずかな誤りや停止が多くの利用者や取引に影響するため、機器の二重化などで高い信頼性と安全性を確保する。」/ zh 「哪怕一点差错或停机都可能影响大量用户和交易，…」/ en "Even a small error or outage can affect a great many customers and transactions, so …".
  - key_points[0] jp 「止まると多くの利用者や取引に影響が及ぶため、二重化などで高い信頼性を確保する。」 with matching zh / en.
  - The hyperbole (a single institution's outage halting society's money flow) is gone. jp and zh are now equally strong (zh 可能 ≈ jp 影響する, a possibility of impact).
  - The causal link to 二重化 / 高い信頼性 is kept, `explanation_*` and `summary.key_points_*[0]` follow, and 0 old-wording hits remain in the unit.
  - Questions: 2020r02o-q091 / 2024r06-q099 (GPS, the only whole-unit qids) ≤6 en generic. No question asks about financial outage impact, and 2021r03-q013 (other topic) is not touched.
- **L4:**
  - root label jp 「ITS (高度道路交通システム) に含まれるシステム (例)」/ zh 「ITS（智能交通系统）包含的系统（示例）」/ en "Systems within ITS (Intelligent Transport Systems) (examples)".
  - Children unchanged (VICS / ETC / 安全運転支援).
  - The tree now reads as examples, the same form as the unit's own 金融 tree root (銀行のシステムの分け方 (例) / （示例） / (example)), and = detail 「例えば … など」, = one_en "and more" (p01).
  - The type (10) sign (a closed classification) is gone.
  - zh root label before = `term_zh` string. p15 replaced only the fig label path, and `term_zh` is unchanged (§1).
  - en has two consecutive parenthetical groups → obs. 3 (cosmetic).

### 3.5 u04 p01 (L1) — key_points_jp[2] vs 2012h24h-q013

- After: 「**住民基本台帳ネットワークシステム** は、住民の利便を高め、行政の事務を効率よく進めることをねらい、本人確認情報を全国で照会できるようにした。」
- Against the correct choice イ, LCS falls 10 → 2. The word order 「〜の向上と行政事務の効率〜」 is broken: verb phrases replace the noun phrase, and 利便 replaces サービス.
- The fact is unchanged (purpose = residents' convenience + administrative efficiency; Ministry of Internal Affairs wording 「住民の利便性の向上と…行政の合理化」, per Rule A §1-8), so the learner still reaches イ by the headword's role (D-209 / D-211 (ii)).
- The wrong choices (tax information / personal-information protection / disclosure to the private sector) stay ≤3 and are not cued.
- Masked windows 7 → 1; the one left is the headword.
- zh / en `key_points_*[2]` were deliberately unchanged ("意味が同じで変更不要"). Their sidecar overlap with イ's zh / en is pre-existing (obs. 5), not introduced.

### 3.6 u05 L1 — non-application ruling

Rule A u05 L1 prescribes adding to `terms[3](マイナンバー).detail_*` sentence 3 that the Reiwa 5 (2023) amendment extended usable tasks beyond 社会保障・税・災害対策. Rule A did the primary check: e-Gov law API, current revision `425AC0000000027_20261001_507AC0000000087`, 第 3 条 2 項 「…その他の行政分野」, 第 9 条 1 項 (準法定事務). The main session did not apply it, citing writer rule 10 (D-205: do not add revised-edition content unless a cited question asks for it) and the fact that the two D-210 cited statements already name their edition.

**Does leaving it out make any existing statement false or misleading for the current law?** No. I read every u05 string mentioning 番号法 / 分野 / 社会保障 / tax / disaster:
- `terms[3].points[0]` 「2016 年の利用開始時点の番号法では、…3 分野に限られていた」 (zh / en the same) is version-marked and past tense (D-210 form). It is true for that version and asserts nothing about the present.
- `detail_*` sentence 3 (使える事務は番号法で定められている) and `key_points_*[1]` are generic and true under the current Act (第 9 条 1・2 項).
- No present-tense statement in one / detail / overview_rows / pairs / hook / goals limits My Number to the 3 fields.
- 2022r04-q016 (number change) is unaffected.
- Leaving it out introduces no MEDIUM / HIGH and needs no F-fix.

**Is the stated reason right?** Not as stated. D-205 rule 10 binds the **writer**. The division of labour recorded with D-205 (S138 §6, Rule D record: 「改正版の中身は執筆者は足さない、Rule A は外部一次確認があれば補丁で足してよい」) and the D-210 lock (S146: 「改正後の中身は従来どおり執筆者は足さず、Rule A が一次確認のうえ補丁で足す (S138 §6)」) assign exactly this addition to Rule A after a primary-source check. The L1 prescription meets that condition. Versioned cited statements are the D-210 precondition for such a patch, not a reason against it. So the non-application is **tolerable on outcome (LOW, nothing false)**, but it is **not barred by the rules**.

Recommended disposition (not a blocker):
- **Preferred:** apply the three prescribed L1 strings as u05 p03–p05 (text verbatim in the Rule A file, primary-confirmed). Dry check of the jp after text against the 39 topic questions + choices: LCS 8 (マイナンバーを使, the 2017h29h-q024 stem), unmasked / masked 12-char windows 0 / 0, 2017h29h-q024 choices 4 each (flat; the 3-field names are the Act's standard wording already rated LOW L4 on points[0]).
- **Otherwise:** list L1 in the batch "未修 LOW" table with the reason "deferred by main-session decision (D-210 permits Rule A to add it)", not "barred by writer rule 10".

## 4. Observations

No F-fix from this re-review: all 38 patches are the auditors' prescribed texts, applied exactly, and correct in context. Records only, no fix:

1. LOW, u01 `terms[2].points[1].text_en` (unpatched part): " built into a smartphone " (25) coincides with the en sidecar of the 2023r05-q012 stem. Stem set-up, not a choice; project translation; jp window removed by p02; Rule A L2 left zh / en unchanged. Candidate for the batch "未修 LOW" table (e.g. "inside a smartphone").
2. LOW, u01 p01 (prescribed): 在庫管理 vs 2016h28a-q018 エ* 2 → 4. The standard compound, required for the jp 原語 (D-202). The correct choice's three-part set and order is not reproduced (POS points[0] holds only 売上の把握 + 在庫管理).
3. LOW cosmetic, u02 p16 (prescribed): en root label "Systems within ITS (Intelligent Transport Systems) (examples)" has two parenthetical groups in a row. Readable and correct. Future prescriptions could use "… Transport Systems): examples".
4. LOW cosmetic, u03 p02 (prescribed): zh hook 「这类任何行业的公司都有的部门的工作」 stacks three 的. Meaning correct, = jp / en.
5. LOW, pre-existing (not patched, not introduced): u04 `key_points_{zh,en}[2]` paraphrase 2012h24h-q013 イ's zh / en sidecar closely (提升居民服务 … 行政事务效率 / "improve services for residents and the efficiency of administrative work"). The fact is the term's own purpose (D-209 / D-211 (ii)), the sidecars are project translations, and the jp source text is now re-ordered. Optional future loc touch.
6. u05 L1 not applied — §3.6 (tolerable; corrected reason; apply as p03–p05 preferred).
7. Script notes (no content issue):
   - u02 `check.mjs` remnants ×10 = headword occurrences (p14 / p15) or before ⊂ after (p14–p19 own fields).
   - `memory_hooks suffix check` bad u01 [1]–[6] / u05 [2]–[3] = index misalignment from hookless terms; 90/90 pass when matched in order.
   - `term_zh` absent from loc bases (v1 invariant carried by merge).

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope (all 5 Rule A files MEDIUM 0); **0 introduced**
- LOW introduced: 建議修 0. Records only: obs. 1–5 (pre-existing en stem overlap / prescribed term compound / 2 cosmetic / pre-existing zh/en key_points overlap). Not applied: u05 L1 (obs. 6). Script notes: obs. 7.
- **Application:** 38/38 exact (replay) and 38/38 = the Rule A prescribed text (before and after found verbatim).
  - Every 建議修 of the 5 Rule A files is covered (u01 10 / u02 19 / u03 4 / u04 3 / u05 2) except u05 L1 (§3.6).
  - Derived fields follow (366 checked + summary.memory_hooks 90 in order, 0 mismatch).
  - 0 unexplained base → unit diffs; 0 real `before` remnants (10 u02 false positives classified); `term_zh` unchanged.
- **D-198:**
  - Masked 12-char windows 0 → 0 in 9 of 10 jp patches; u04 p01 7 → 1 (residual = headword).
  - u01 p02 unmasked windows 3 → 0.
  - The targeted correct-choice overlaps fall: q031 エ 6 → 3 / 2 → 1 / 8 → 3; q013 イ 10 → 2.
  - No after-span traces a wrong choice's frame.
- **Gates:** validate 5/5 = 0 issues, parity 5/5 = 0 diff (34 / 36 / 29 / 26 / 38 locations), validate --part bases 5/5 = 0 issues (sha256 = base_sha256), vitest textbook 162/162.

**PASS.** All 38 active patches of strategy-05-14 u01–u05 are applied exactly: replay reproduces every patched field, derived fields follow, and no other base-present path changed. Each patch is the auditor's prescribed text.
- u01 L5: the RFID point now states batch tag reading, and it moves away from 2019r01a-q031's correct option in all three languages.
- u01 L2: the 12-char window with the 2023r05-q012 stem is gone.
- u02 L5: the ETC analogy now marks that ETC's radio method (DSRC, roadside antenna, while moving) differs from a tap card. This is factually correct, and on 2019h31h-q093 it separates the ETC choice from the correct transit-gate choice.
- u02 L4: the ITS tree reads as examples (`term_zh` untouched).
- u02 L3: the outage impact is no longer exaggerated in detail and key_points ×3.
- u04 L1: 2012h24h-q013 イ's word order is broken (10 → 2) with the fact kept.
- u05 L1 non-application leaves no false or misleading statement (the 3-field limit is version-marked past tense; the generic statements hold under the current Act), so it does not block. But its stated reason does not hold under D-210 (rule 10 binds writers; Rule A adds primary-confirmed post-amendment content by patch). Applying the prescribed L1 strings as u05 p03–p05 is recommended; otherwise record it as a deferred LOW with the corrected reason.
