# b30 B3 patch re-review — strategy-03-10 u01–u05 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditors' context; Rule D)
- Date: 2026-11-06 (Session 148)
- Scope: B3 wording patches for strategy-03-10-u01 (p01), u02 (p01–p08), u03 (p01–p10), u04 (p01–p09) and u05 (p01–p09)
  — **37 `active`, 0 retired** (`patches/strategy-03-10-u0{1,2,3,4,5}.json`), checked against the Rule A prescriptions
  (`strategy-03-10-u01.ruleA.md` L7 建議修; `-u02` L1・L2 (a)(b)・L4 建議修; `-u03` **M1** + L1・L2・L3 建議修; `-u04` L1・L2・L4・L10・L11 建議修; `-u05` **M1** + L1・L2 建議修 — every MEDIUM and 建議修 of the 5 files, none left unapplied; u01 1, u02 8 = 3 + 4 + 1, u03 10 = 3 + 3 + 3 + 1, u04 9 = 1 + 3 + 3 + 1 + 1, u05 9 = 3 + 3 + 3)
  and the merged units `data/ip/textbook/units/strategy-03-10-u0{1..5}.json` (sha256 u01 `64469c7a911b7786…`, u02 `07a9a9976d17a306…`, u03 `9f84caf07137465a…`, u04 `409531ff74fb8e81…`, u05 `89589ddf02c3c45b…`).
- Pre-patch bases located by sha256 = `base_sha256` (all patches of a unit share one base; all match):
  u01 `b30-u01-a2/…loc.r0.json` (`5f440233…`), u02 `b30-u02-a1/…loc.r0.json` (`9f685170…`), u03 `b30-u03-a2/…loc.r0.json` (`bc8be5cf…`), u04 `b30-u04-a1/…loc.r0.json` (`4e9d6bdb…`), u05 `b30-u05-a1/…loc.r0.json` (`959e77db…`).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211 and the HIGH / MEDIUM / LOW definitions in the Rule A files; S147 additional types (8)(9)(10) (`docs/templates/ruleA_unit_audit.md`).
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names; matched fragments ≤12 chars except en sidecar overlaps, which are project translations and are quoted as the unit's own after-span).

## 0. Method

Same as `b29_patch_rereview.md` §0 (= b26 / b27 §0), topic strategy-03-10 (43 questions) **plus 2014h26a-q038 (PM push / pull communication), 2024r06-q004 (FinTech, omni-channel distractor), 2017h29a-q004 (escrow, affiliate distractor), 2009h21h-q004 (niche, push / pull distractors)** = 47 questions, 235 source strings per language:

1. Application check (script): every string field of base and merged unit is walked; each `after` must appear in its field; `before` (raw and notation-stripped) must not survive anywhere in the unit (derived copies included); every base-present path that differs must be explained by a patch; patches replayed in file order on the base must reproduce the unit's field exactly. Each patch's `before` / `after` (bold stripped) searched verbatim in its unit's Rule A file.
2. Derived-field check (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`) for every term and key point; `summary.memory_hooks_*` order-matched over hooked terms.
3. D-198 (jp patches: u02 p01; u03 p01, p04, p07; u04 p02, p05; u05 p01, p04, p07): LCS, 12-char window ≤2 substitutions with / without masking, wDice, vs stem + all choices of the 47 questions. zh / en: LCS vs the zh / en sidecars, whole field before → after and the `after` span. Per-choice + stem LCS (before → after) vs the patched term's cited / quiz qids (automatically collected from `points[].qids` + `quiz`; whole-unit qids for non-term fields) plus the trigger questions: u03 p01–p03 × 2015h27a-q018, 2011h23a-q008; p04–p06 × 2012h24a-q026, 2014h26a-q038; p07–p09 × 2024r06-q004; u05 p01–p03 × 2009h21a-q026, 2013h25a-q009, 2016h28h-q003, 2017h29a-q004.
4. D-195 / D-200 via validate; `validate --part <base>` for comparison.
5. Manual reading of each patched field in context (u02 additionally first-hand: `terms[1].one` (4C = buyer-side), `pairs[0].rows[0]` (seller / buyer key row), `terms[4].fig` zh labels 现有/新产品・新市场, `terms[2].fig` zh nodes; u01 sibling jp / zh cells) (whole term; overview rows; pairs; key_points); meaning judged against the cited / quiz / challenge questions' `correct_answer` and zh / en sidecars and the S147 types (8)(9)(10). For u03 L1 (push hook) the new "pushed party = distributors, not the consumer" reading was applied to every bank question naming プッシュ / プル (grep `/プッシュ|プル/` over the bank; in strategy-03-10 only 2012h24a-q026 hits; bank-wide: 2012h24a-q026, 2009h21h-q004, 2014h26a-q038, 2014h26h-q032 = push *button*, irrelevant). For u03 L2 / u04 cross-media every question naming オムニ / クロスメディア / マルチチャネル / メディアミックス / O2O was read (only 2024r06-q004, as a distractor). For u05 M1 every question naming アフィリエイト (2009h21a-q026, 2013h25a-q009, 2016h28h-q003, 2017h29a-q004). For u03 M1 every question naming オピニオンリーダ (2015h27a-q018, 2011h23a-q008).
6. `scripts/textbook-v2-validate.mjs --unit` / `scripts/textbook-v2-parity.mjs --unit` per unit; `npx vitest run src/lib/textbook`.

Scripts: scratchpad `b30rr/check.mjs` (pre-adapted), `b30rr/d198b.mjs` (copy of `b29rr/d198b.mjs`, only topic / extra qids / unit-part list changed), `b30rr/focus2b.mjs` (new; same per-choice LCS as `b29rr/focus2b.mjs`, focus qids collected from the unit instead of hard-coded), `b24rr/q.cjs` (question reader, unchanged).

Not established: as in b14–b29, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: u01 125, u02 131, u03 125, u04 105, u05 119) were checked for the derived copies (step 2) and for `before` remnants (step 1). No law / standard is touched (D-205 版 / D-210 not applicable).

## 1. Script results (fresh, 2026-11-06)

```
✓ strategy-03-10-u01 unit: 0 issues   validate EXIT=0 | ✓ parity: 30 locations, 0 diff
✓ strategy-03-10-u02 unit: 0 issues   validate EXIT=0 | ✓ parity: 29 locations, 0 diff
✓ strategy-03-10-u03 unit: 0 issues   validate EXIT=0 | ✓ parity: 30 locations, 0 diff
✓ strategy-03-10-u04 unit: 0 issues   validate EXIT=0 | ✓ parity: 26 locations, 0 diff
✓ strategy-03-10-u05 unit: 0 issues   validate EXIT=0 | ✓ parity: 23 locations, 0 diff
validate --part (bases): ✓ u01 / u02 / u03 / u04 / u05 loc#0: 0 issues (sha256 = base_sha256 ×5)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

Application: 37/37 `before` occur exactly once in the base field; 37/37 `after` present; replay in file order reproduces every patched field exactly (5/5 units). Changed base-present paths u01 1, u02 8, u03 10, u04 9, u05 9 = exactly the patched fields (one patch per field) + the `stage` meta key removed (as in b19–b29; `round` / `jp_round` are non-string part meta). Unexplained diffs 0. `before` remnants anywhere in the units (raw or stripped): **0** (no append-only patches this batch, so no before ⊂ after false positives).

`check.mjs` "ruleA verbatim miss": [] for u01–u04; **u05 [p01, p02, p03]** — explained, not a defect: Rule A u05 M1 prescribes only the *whole replacement sentence* per language (no `before` quoted), so the patch `before` (the base span その紹介で来た客が実際に…ときにだけ、… / 只有…才… / "only when someone they sent actually buys something") cannot be found in the Rule A file. The `after` fragments are substrings of the Rule A sentences, and the **full patched field equals the Rule A sentence verbatim in all three languages** (checked: `ruleA.includes(unit.terms[4].analogy_*)` = true ×3; the unchanged prefixes 知人に店を紹介してもらい、 / 就像请熟人帮忙介绍自己的店， / "It is like asking a friend to recommend your shop and " are identical in base, unit and Rule A, no punctuation difference). So 37/37 = the Rule A prescribed text.

Derived fields: patched `hook_*` → `memory_hook_*` (u02 t1, u03 t1 / t3, u04 t1 en, u05 t4: true ×13), `one_zh` → `definition_zh` (u02 t4: true), `detail_*` → `explanation_*` (u02 t2 en, u05 t0 ×3: true ×4). Full walk: u01 69, u02 66, u03 69, u04 57, u05 57 = 318 derived strings, 0 mismatch. `summary.memory_hooks_*`: index-matched suffix check reports `bad` for u01 [1]–[4] and u05 [1]–[3] — script artifact (u01 `terms[0]` / `terms[6]` and u05 `terms[0]` have no hook, so the summary array is one per hooked term); order-matched over hooked terms 5 + 6 + 6 + 5 + 4 = 26 terms × 3 languages = 78 entries, **0 bad**, lengths equal.

Notation counts (bold, `[[jp:]]`) before → after unchanged in 37 of 37 patched fields; parity 0 diff. u04 p02 points[1] jp 92 chars incl. bold markers (84 without), ≤100 (D-200); u05 detail 3 → 2 sentences (D-195 range).

D-198, before → after (`d198b.mjs`):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest overlap of the `after` span | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| u01 p01 | en | 2011h23tokubetsu-q023 stem → 2013h25h-q099 stem | 6 → 9 | "ted that " (9) | — |
| u02 p01 | **jp** | 2013h25h-q010 ア → 2017h29a-q032 stem | 5 → 4 | から見た (4) | 0 / 0 → 0 / 0; 0.14 → 0.13 |
| u02 p02 | zh | → 2009h21a-q022 stem | 5 → 3 | 的4P (3) | — |
| u02 p03 | en | 2013h25h-q099 エ → 2012h24a-q015 イ | 14 → 13 | " the customer" (13) | — |
| u02 p04 | zh | 2018h30a-q002 stem | 3 → 3 | 组合 (2) | — |
| u02 p05 | zh | 2018h30h-q001 stem | 5 → 5 (产品和市场, unchanged) | 2 | — |
| u02 p06 | zh | 2018h30h-q001 stem | 5 → 5 (unchanged) | 产品和市场 (5) | — |
| u02 p07 | zh | 2016h28a-q030 ア | 4 → 6 | 目标市场选择 (6 = zh term name of ターゲティング, the STP node's own headword) | — |
| u02 p08 | en | 2022r04-q002 stem | 20 → 20 (unchanged) | "segment marketing" (17, headword; q002 イ correct) | — |
| u03 p01 | **jp** | 2011h23a-q008 stem | 5 → 5 (オピニオン, term) | 発信する (4) | 0 / 0 → 0 / 0; 0.12 → 0.11 |
| u03 p02 | zh | — | 3 → 3 | 2 | — |
| u03 p03 | en | → 2011h23a-q008 stem | 13 → 19 | " opinion leader is " (19, headword) | — |
| u03 p04 | **jp** | 2009h21h-q004 イ → — | 4 → 3 | である (3) | 0 / 0 → 0 / 0; 0.12 → 0.11 |
| u03 p05 | zh | 2014h26a-q038 stem → 2012h24h-q012 ア | 3 → 4 | 顾客推荐 (4) | — |
| u03 p06 | en | → 2015h27a-q018 エ | 15 → 16 | " the product to " (16, generic) | — |
| u03 p07 | **jp** | — | 4 → 4 | けられる (4) | 0 / 0 → 0 / 0; 0.13 → 0.17 |
| u03 p08 | zh | — | 3 → 2 | 2 | — |
| u03 p09 | en | — | 8 → 8 | " in the " (8) | — |
| u03 p10 | en | 2013h25h-q098 イ | 11 → 11 (unchanged " because th") | 10 | — |
| u04 p01 | en | 2023r05-q003 stem | 18 → 18 (" foreign visitors ", unchanged) | same (18) | — |
| u04 p02 | **jp** | 2011h23tokubetsu-q023 エ | 10 → 10 (マーチャンダイジング, term, unchanged prefix) | の一つである (6) | 1 / 0 → 1 / 0 (term name); 0.22 → 0.21 |
| u04 p03 | zh | → 2012h24a-q026 stem | 4 → 5 | 的销售促进 (5) | — |
| u04 p04 | en | 2012h24a-q026 stem | 17 → 17 (" sales promotion ", term, unchanged) | same | — |
| u04 p05 | **jp** | 2014h26a-q038 ア | 4 → 4 (の掲示板, unchanged) | same (4) | 0 / 0 → 0 / 0; 0.11 → 0.09 |
| u04 p06 | zh | 2011h23a-q008 ア | 3 → 3 | 许多人 (3) | — |
| u04 p07 | en | 2014h26a-q038 ア | 15 → 16 | " bulletin board " (16, unchanged noun) | — |
| u04 p08 | zh | → 2014h26h-q030 stem | 5 → 6 | 渠道销售促进 (6) | — |
| u04 p09 | en | 2022r04-q002 stem | 14 → 14 (unchanged) | same | — |
| u05 p01 | **jp** | → 2009h21a-q026 イ (correct) | 5 → 5 | 実績に応じ (5) | 0 / 0 → 0 / 0; 0.11 → 0.09 |
| u05 p02 | zh | 2011h23a-q008 ウ | 3 → 3 | 或实际 (3) | — |
| u05 p03 | en | 2009h21a-q026 イ → 2013h25h-q097 stem | 10 → 16 | " the number of c" (16, generic) | — |
| u05 p04 | **jp** | → 2009h21a-q026 イ (correct) | 4 → 4 | に応じた (4) | 0 / 0 → 0 / 0; 0.12 → 0.13 |
| u05 p05 | zh | 2009h21a-q026 stem | 9 → 9 (affiliate, term) | 2 | — |
| u05 p06 | en | → 2013h25h-q097 stem | 20 → 20 | " the results of its " (20, generic) | — |
| u05 p07 | **jp** | 2011h23tokubetsu-q029 エ | 6 → 6 (deletion) | — | 0 / 0 → 0 / 0; 0.12 → 0.15 |
| u05 p08 | zh | 2011h23tokubetsu-q029 stem | 3 → 3 (deletion) | — | — |
| u05 p09 | en | 2022r04-q002 stem | 12 → 12 (deletion) | — | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52); masked 12-char windows 0 → 0 in all 9 jp patches (u04 p02 one unmasked window = the headword マーチャンダイジング, unchanged prefix). Longest jp after-span overlap ≤6, zh ≤6 (term names), en ≤20 (unchanged words / generic connectives / headwords).

Per-choice check (LCS before → after vs each choice; `focus2b.mjs`):
- **2015h27a-q018** (OL purchase attitude, correct エ) × u03 p01–p03: jp 2 → 2 for every choice alike, zh 1 → 1 alike, en rise to ≤13 on " the product " for all choices (エ* 13, ア 12, ウ 9, イ 8; generic noun); stem en → " opinion leader" (headword). No choice frame traced.
- **2011h23a-q008** (correct ウ) × u03 p01–p03: jp ≤3, zh ≤2; en " the product " 15 equal for ア / イ / ウ* (generic).
- **2012h24a-q026** (pull measure, correct エ) × u03 p04–p06: jp ≤2, zh ≤2, en ≤9 (" product " / " stores t" / " retail"); stem rise to " manufacturer" (13, role word).
- 2014h26a-q038 (PM pull communication) × u03 p04–p06: jp ≤2, zh stem → "push" (4, headword); the old notification image (push-type information sending, the q038 frame) is gone.
- 2024r06-q004 × u03 p07–p09: ≤1 jp / ≤1 zh / ≤3 en per choice, stem unchanged.
- **2009h21a-q026** (affiliate, correct イ) × u05 p01 / p04 / p06: rise toward **イ (correct) only** (jp 1 → 5 実績に応じ, 1 → 4 に応じた; en 5 → 16 " based on the re"); wrong choices ア / ウ / エ ≤1 jp, ≤8 en (generic). zh p02 / p05 flat. 2013h25a-q009 / 2016h28h-q003 / 2017h29a-q004: 0–3 per choice (affiliate is a distractor name there).
- u02 p01–p03 × 2017h29a-q032 / 2017h29h-q002: choices are framework names (≤2); stem rise to から見た (4) / " the seller" (11) = the 4P / 4C viewpoint words (the definition).
- u04 × 2012h24a-q015 / -q026 / 2016h28a-q030 / 2012h24h-q012 / 2019r01a-q015: unchanged or term names (販売促進 / 销售促进 / " promotion").

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01 | `terms[5](カスタマージャーニーマップ).fig.data.rows[1].cells[4].en` | L7 建議修 | Yes: en key cell now carries the emotion ("frustrated") = jp 不満 / zh 感到不满 | No | OK |
| u02 | p01–p03 | `terms[1](4C).hook_*` (+ memory_hook, summary) | L1 建議修 | Yes: P = Producer coinage removed; hook now: first C = Customer, all four from the customer side vs seller-side 4P — consistent with `one` / 4P / `pairs[0]`; 2017h29a-q032 → ア 4C, 2017h29h-q002 → イ 4P | No | OK |
| u02 | p04–p06 | `overview_rows[4].one_line_zh`, `terms[4](アンゾフ).one_zh` (+ definition), `key_points_zh[2]` (+ summary) | L2 (a) 建議修 | Yes: 新增 → 新 (existing vs new two-way), matches the zh figure 新产品 / 新市场 | No | OK |
| u02 | p07 | `terms[2].fig.data.nodes[1].label.zh` | L2 (b) 建議修 | Yes: 目标市场选择 = detail / points[2] / body | No | OK |
| u02 | p08 | `terms[2](セグメントマーケティング).detail_en` (+ explanation) | L4 建議修 | Yes: ambiguous "it" → "segment marketing" | No | OK |
| u03 | p01–p03 | `terms[1](オピニオンリーダー).hook_*` (+ memory_hook, summary) | **M1** (MEDIUM, type 9) | **Yes** (§3.1) | LOW only (obs. 1) | OK |
| u03 | p04–p06 | `terms[3](プッシュ戦略).hook_*` (+ memory_hook, summary) | L1 建議修 (weak type 9) | Yes: notification image removed; pushed party = distributors (§3.2) | LOW only (obs. 2) | OK |
| u03 | p07–p09 | `terms[2](オムニチャネル).analogy_*` | L2 建議修 (D-204 scope) | Yes: image now crosses channels (counter → app / web), matching `one` "すべての接点" and the multi-channel contrast in `points[0]` (§3.3) | LOW only (obs. 3) | OK |
| u03 | p10 | `terms[0](ブランド戦略).analogy_en` | L3 建議修 | Yes: "built up over past visits" → "built up over time" = jp これまでの信頼, no contradiction with 初めて訪れた町 | No | OK |
| u04 | p01 | `terms[1](インバウンドマーケティング).hook_en` (+ memory_hook, summary) | L1 建議修 | Yes: visitors-to-Japan sense no longer "toward the company"; 2023r05-q003 → エ (inbound demand) unchanged | No | OK |
| u04 | p02–p04 | `terms[4](販売促進).points[1].text_*` | L2 建議修 | Yes: 狭い意味の / 狭义的 / "in the narrow sense" ties the MD 考点 to `one`'s narrow SP and the narrow / broad distinction in points[0] / detail / key_points[3]; 2016h28a-q030 (MD) still → ウ; jp 84 chars | No | OK |
| u04 | p05–p07 | `terms[3](広告).analogy_*` | L4 建議修 | Yes: the image now carries "paying for the space" = `points[1]` (ad vs publicity: paid medium); no conflict with any field | No | OK |
| u04 | p08 | `terms[4].points[0].text_zh` | L10 建議修 | Yes: 流通（渠道） keeps the Japanese rendering and gives the zh 4P word | No | OK |
| u04 | p09 | `terms[1].fig.data.nodes[3].label.en` | L11 建議修 | Yes: verb-initial like sibling nodes | No | OK |
| u05 | p01–p03 | `terms[4](アフィリエイト).analogy_*` | **M1** (MEDIUM, D-204 / type 4) | **Yes** (§3.4) | No | OK |
| u05 | p04–p06 | `terms[4].hook_*` (+ memory_hook, summary) | L1 建議修 | Yes: 売上の分け前 → 紹介の成果に応じた分け前 / 按推荐成果 / "based on the results of its referrals" = `one` 成果に応じて報酬 | No | OK |
| u05 | p07–p09 | `terms[0](インターネット広告).detail_*` (+ explanation) | L2 建議修 | Yes: §9 signposting sentence removed in 3 languages; detail 2 sentences | No | OK |

## 3. Focused checks

### 3.1 u03 p01–p03 (M1) — opinion-leader hook moved to the issuing side

- After: jp 「オピニオン (opinion) は「意見」。売り場の宣伝より信じられる「身近な人の意見」を、**早い時期に自分で試して周りに発信する側の人**、と結び付けて覚える。」/ zh 记成：人们…更相信的那份“身边人的意见”，正是由较早亲自试用并向周围传播的这个人发出的 / en "…and the opinion leader is the one who tries the product early and gives that view to others." (= M1 text verbatim, 3/3).
- Type (9), applied to every OL question:
  - **2015h27a-q018** (correct エ, buys early and passes information on): the hook now names the OL as the *sender* of the trusted opinion → エ. イ (consults friends' / public evaluations before deciding = the receiver) — the trigger of M1 — is now the opposite role of the hook (the hook's receiving-side clause is the object, 「…を、…発信する側の人」); ア (tells only after the product has spread) excluded by 早い時期; ウ (eager to get it ahead of others, no passing-on) lacks 発信. → エ.
  - **2011h23a-q008** (correct ウ, early, own judgment, influences later consumers): 早い時期 + 自分で試して (= own judgment) + 発信 → ウ; イ (cautious follower who consults early buyers) is the consulting side → rejected; エ (adventurous first buyer = innovator) is separated by `terms[1].points[1]` (mix) / detail (innovator first, OL next), and the hook says 早い時期, not 最初.
- D-208 (b) / D-198 (iii): the hook is not a 考点; it does not trace q018 エ / q008 ウ wording, set or order (jp LCS ≤3 for every choice — q018 2 → 2 alike, q008 correct ウ 2 → 3 vs others 1 → 2; zh ≤2; en only the generic " the product " at similar length across choices). The elements (early / try oneself / pass on) are the headword's general definition already stated in `one` and `points[0]` (Rule A L4: D-209 classification exemption), so even read as a cue it carries the general principle, not an option frame (D-211 (ii) side).
- Definition restatement: the second sentence largely re-says `one` (early, own judgment, tell others) with the 意見 gloss — D-203 §6 restatement, **LOW** (obs. 1), not beyond. Type (8): no other headword's role used. **M1 resolved.**

### 3.2 u03 p04–p06 (L1) — push hook "pushed party = distributors, not the consumer"

- After: jp 「push は「押す」。メーカーが卸売業者や小売店を後ろから押し、押された店が客に勧める。押す相手は消費者ではなく流通業者である。」(zh / en same, = L1 text verbatim 3/3).
- Exclusive split (D-205 観点 9 / type 9), every push / pull question in the bank:
  - **2012h24a-q026** (the only in-topic push / pull question; which manufacturer measure is *pull*, correct エ consumer advertising that draws customers to stores): ア (sales-staff training), イ (dispatching sales staff to stores for support selling), ウ (sales incentives by volume) are all measures on / for the distributor → push by the hook; エ works on consumers → pull = `terms[4].points[0]` (exam) → **エ**. The old image (a notification that reaches the *user* unasked) had made consumer advertising look like push; that pull toward a wrong reading is gone.
  - The split is not new to the unit: `pairs[0].rows[0]` (key row: 働きかける相手 = 流通業者 / 消費者), `terms[3].one` (卸売業者や小売店に働きかけ), `terms[3].points[0]` (exam: 流通業者の販売意欲・販売力) and `terms[4].points[1]` (mix) already state it, and q026's own option set (all three push options aimed at the channel) supports it. So the hook adds no restriction the unit / cited question does not already carry → not an unsupported restriction (D-205 観点 9).
  - 2014h26a-q038 (management-10-27, PM push / pull communication, correct ア): the hook no longer uses the push-notification image, which reduced the confusion Rule A named; no cue toward q038's wrong options (エ = sending minutes by email, push-type) remains in u03.
  - 2009h21h-q004 (niche strategy; push / pull are distractor names) and 2014h26h-q032 (push *buttons* in screen design): not answered by this hook.
- Residual (obs. 2, LOW): q026 イ (support selling, manufacturer's staff serving shoppers in the store) could be misread by a strict "never the consumer" reader as working on consumers; the measure is still channel support (the store's selling), the hook says 押された店が客に勧める, and エ is the only advertising option, so the answer does not move. The hook now also overlaps `one` / pairs (D-203 §6), which Rule A accepted in prescribing it (「再指摘不要」). **L1 resolved, no new MEDIUM.**

### 3.3 u03 p07–p09 (L2) — omni-channel analogy vs cross-media (u04)

- After: jp 「窓口で始めた相談の続きを、その夜にアプリやネットからでも続けられる銀行のようなもの。」(zh / en same, = L2 text verbatim 3/3). The image now crosses channel *types* (branch counter → app / web) with one continuous customer record, = `one` (すべての接点をつなぎ…一続き) and `detail` (情報をチャネル間で共有); `points[0]` (multi-channel = channels with separate information; omni = integrated) is now illustrated.
- vs u04 `terms[0](クロスメディアマーケティング)` (link media of different nature and hand the *interest* from medium to medium toward purchase; analogy = relay sash): the omni analogy carries a continued *transaction / consultation* on shared customer information, not an advertising interest hand-off; the u04 unit does not mention shared inventory / customer data (Rule A u04 L3). No question in strategy-03-10 asks either term; the only bank question naming オムニチャネル is 2024r06-q004 (strategy-05-16; financial institutions adopting internet tech with startups → イ FinTech, omni-channel a distractor). The bank setting was already in the base analogy; the new "app / online" adds mobile channels, but nothing about new financial technology or startup partnerships, and LCS vs every q004 choice ≤1 jp / ≤3 en → not a type (9) cue (obs. 3, LOW record). Type (8): no other headword's role. **L2 resolved.**

### 3.4 u05 p01–p03 (M1) — affiliate analogy opened to "results" (number of customers sent or purchases)

- After (whole field = Rule A M1 sentence verbatim, 3/3): jp 「知人に店を紹介してもらい、その紹介で来た**客の数や、実際の買い物といった実績に応じて**、紹介料を渡すやり方。」/ zh 按经介绍而来的客人数量或实际购买等实绩 / en "based on what their referrals bring in, such as the number of customers they send or the purchases those customers make". The closing 「ときにだけ」/ 只有…才 / "only when" is gone (0 hits in the unit).
- Consistency: `points[0]` (exam, 2009h21a-q026: paid on 誘導や購入の実績) — "number of customers they send" = 誘導 (traffic), purchases = 購入 → the analogy now covers both; `detail` (成果 e.g. purchases or member sign-ups) — the analogy uses 「といった」/ 等 / "such as", an open list, so sign-ups are not denied; `one` 成果に応じて報酬; hook (p04–p06) 紹介の成果に応じた分け前; fig node 閲覧者がリンク経由で購入 (one typical example, caption 購入などの成果; Rule A L8) — no field contradicts another (D-204 / type (4) cleared).
- Type (9): **2009h21a-q026** → イ (link on personal pages, paid by referral results); the analogy's rise is toward イ only (jp 実績に応じ 5, en " based on the re" 16), ア (opt-in mail), ウ (SEO), エ (image entrance on portals, *no* results-based pay) not supported. Affiliate as distractor: 2013h25a-q009 (opt-in mail → エ), 2016h28h-q003 (recommendation from browsing / purchase history → エ), 2017h29a-q004 (escrow → イ) — the analogy (a friend recommending a shop for a referral fee) matches none of those scenes. D-198: 実績に応じ (5) / に応じた (4) is the correct option's principle in general form (D-211 (ii)), masked windows 0. **M1 resolved.**

## 4. Observations

No F-fix from this re-review (all 37 patches are the auditors' prescribed texts, applied exactly, and correct in context).

Records only, no fix:

1. LOW, u03 p01 (hook): the second sentence restates `one` / `points[0]` (early, own trial, pass on) with the 意見 gloss — D-203 §6 restatement class; necessary to fix the M1 role inversion, no option frame traced.
2. LOW, u03 p04–p06 (hook): (a) "消費者ではなく流通業者" duplicates `pairs[0].rows[0]` / `terms[4].points[1]` (rule 8 / §6, accepted by Rule A L1); (b) a strict reader might hesitate on 2012h24a-q026 イ (manufacturer staff serving shoppers in-store), but it is channel support and エ remains the only pull option.
3. LOW, u03 p07–p09 (analogy): bank + app / web setting vs 2024r06-q004 (omni-channel distractor in a FinTech question, other topic) — bank was in the base; no technology / startup element, LCS ≤1 jp / ≤3 en per choice; not a cue.
4. LOW, D-198 notes: u02 p07 目标市场选择 (6) = zh term name of ターゲティング (2016h28a-q030 ア is that term as a distractor; the label is the STP node's own name); u04 p02 unmasked window 1 = マーチャンダイジング (unchanged prefix); u05 実績に応じ / に応じた = correct option's principle in general form.
5. Script notes (no content issue): `check.mjs` "ruleA verbatim miss" u05 p01–p03 = Rule A M1 gives whole sentences without `before` (full field = Rule A sentence verbatim ×3); `memory_hooks suffix check` bad u01 [1]–[4] / u05 [1]–[3] = index misalignment from hookless terms (u01 t0 / t6, u05 t0), order-matched 78/78 pass.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 2 in scope (u03 M1, u05 M1) — **all resolved**; **0 introduced**
- LOW introduced: 建議修 0; 記録のみ obs. 1–3 (restatement / residual reading notes on prescribed texts); D-198 / script notes obs. 4–5
- Application 37/37 exact (replay), 37/37 = the Rule A prescribed text (u05 M1 checked as whole-field equality), every MEDIUM and 建議修 of the 5 Rule A files covered (u01 1 / u02 8 / u03 10 / u04 9 / u05 9), derived fields follow (318 checked + summary.memory_hooks 78 order-matched, 0 mismatch), 0 unexplained base → unit diffs, 0 `before` remnants
- D-198: masked 12-char windows 0 → 0 in 9 of 9 jp patches; after-span overlaps jp ≤6 / zh ≤6 / en ≤20, all unchanged words, term names or the correct principle in general form, none from a wrong choice's frame
- validate 5/5 = 0 issues (0 warnings), parity 5/5 = 0 diff (30 / 29 / 30 / 26 / 23 locations), validate --part bases 5/5 = 0 issues, vitest textbook 162/162

**PASS** — all 37 active patches of strategy-03-10 u01–u05 are applied exactly (replay reproduces every patched field, derived fields follow, no other base-present path changed) and each is the auditor's prescribed text. u03 M1: the opinion-leader hook now names the OL as the early sender of the trusted opinion, so 2015h27a-q018 → エ and 2011h23a-q008 → ウ (the receiver / follower options イ are the opposite role), without tracing either correct option. u05 M1: the affiliate analogy now pays by the number of customers sent or purchases (open list), matching `points[0]` (誘導や購入) / detail (sign-ups), so 2009h21a-q026 → イ. u03 L1's "distributors, not the consumer" is the split the unit's key pairs row, `one`, exam 考点 and 2012h24a-q026's option set already carry (→ エ), not an unsupported restriction; u03 L2's channel-crossing bank image stays distinct from u04's cross-media relay. The LOW fixes close their field / language mismatches without new HIGH / MEDIUM.
