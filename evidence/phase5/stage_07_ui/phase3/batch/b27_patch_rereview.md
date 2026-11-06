# b27 B3 patch re-review — strategy-02-05 u01–u04 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditors' context; Rule D)
- Date: 2026-11-06 (Session 147)
- Scope: B3 wording patches for strategy-02-05-u01 (p01–p06), u02 (p01), u03 (p01–p10) and u04 (p01–p13)
  — **30 `active`, 0 retired** (`patches/strategy-02-05-u0{1,2,3,4}.json`; the session-log figure "33 / u04 16" is a miscount — the u04 Rule A file prescribes M1 ×3 + L1 ×2 + L2 ×3 + L3 ×3 + L12 ×1 + L13 ×1 = 13 fields), checked against the Rule A prescriptions
  (`strategy-02-05-u01.ruleA.md` **M1** + L2 建議修; `-u02` L2 建議修; `-u03` **M1** + L1〜L4 建議修; `-u04` **M1** + L1・L2・L3・L12・L13 建議修 — every MEDIUM and 建議修 of the 4 files, none left unapplied; the optional, non-建議修 proposals u02 L1 and u04 L15 are not applied, as intended)
  and the merged units `data/ip/textbook/units/strategy-02-05-u0{1,2,3,4}.json` (sha256 u01 `15c9d4ed792b4f8a…`, u02 `222964e2ca9942ee…`, u03 `4a71cf40c19225db…`, u04 `b52be69609a96b67…`).
- Pre-patch bases located by sha256 = `base_sha256` (all patches of a unit share one base; all match):
  u01 `b27-u01-a2/…loc.r0.json` (`bf827756…`), u02 `b27-u02-a2/…loc.r0.json` (`54accb65…`), u03 `b27-u03-a1/…loc.r0.json` (`e5b97037…`), u04 `b27-u04-a2/…loc.r0.json` (`e07c467a…`); a1 parts of u01 / u02 / u04 are not the base.
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210 and the HIGH / MEDIUM / LOW definitions in the Rule A files; S147 additional types (8)(9)(10) (`docs/templates/ruleA_unit_audit.md`). Per the u04 Rule A note, the M1 replacement image is an intentional swap; §6 (concrete-example analogy) issues on it are treated as LOW only.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names; matched fragments ≤12 chars except en sidecar overlaps, which are project translations and are quoted as the unit's own after-span).

## 0. Method

Same as `b26_patch_rereview.md` §0 (= b25 / b24 / b22 / b21 / b20 §0), topic strategy-02-05 (54 questions; 270 source strings per language):

1. Application check (script): every string field of base and merged unit is walked. Each `after` must appear in its field; `before` (raw and notation-stripped) must not survive anywhere in the unit (derived copies included); every string that differs between base and unit (for paths present in the base) must be explained by a patch; the patches replayed in file order on the base must reproduce the unit's field exactly. Additionally each patch's `before` / `after` (bold stripped) was found verbatim in its unit's Rule A file (30/30).
2. Derived-field check from the same walk (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`) for every term and key point of the 4 units; `summary.memory_hooks_*` by suffix match.
3. D-198 (jp patches: u01 p01, p04; u03 p01, p04, p07; u04 p01, p06, p09): LCS, 12-char window with ≤2 substitutions with and without masking (katakana runs ≥4 and alnum masked; masked windows with <6 real chars excluded), best same-length-window bigram Dice (wDice). Sources: stem (`stem_jp_clean`, fallback `stem_jp`) + all choices of every strategy-02-05 question. zh / en patches: LCS against the zh / en translation sidecars of all 54 topic questions, whole patched field before → after and the `after` span alone. Plus a per-choice + stem LCS (before → after) of the patches against the focus questions (cited / quiz / challenge qids of the patched term or unit): u01 p01–p03 × 2014h26h-q010, 2012h24a-q020, 2024r06-q027, 2018h30h-q014; p04–p06 × 2022r04-q027; u02 p01 × 2022r04-q023, 2025r07-q006; u03 p01–p03, p06–p10 × 2023r05-q018; p04–p05 × 2018h30h-q008, 2017h29a-q013; **u04 p01–p03 × every 不正アクセス禁止法 question of the unit** (2018h30a-q001, 2011h23a-q027, 2013h25a-q027, 2014h26h-q013, 2020r02o-q013, 2010h22h-q030, 2021r03-q030, 2025r07-q016, 2014h26a-q023) + 2018h30h-q021 (D-198 nearest); p04–p05 × 2025r07-q006, 2016h28a-q003, 2013h25h-q001; p06–p08 × 2013h25h-q001, 2025r07-q006; p09–p11 × 2021r03-q032, 2026r08-q021, 2024r06-q002, 2017h29a-q013, 2020r02o-q025; p12 × 2015h27a-q028; p13 × 2019h31h-q024, 2017h29h-q015.
4. D-195 / D-200 via validate; `validate --part <base>` for comparison.
5. Manual reading of each patched field in context (whole term: one / detail / analogy / hook / points / fig; overview rows; pairs; key_points); meaning judged against the cited / quiz / challenge questions' `correct_answer` and their zh / en sidecars (b18 u05 M1 type) and the S147 types (8) analogy key word = another term's role, (9) cue applied to a cited / challenge scenario picks a wrong option, (10) closed enumeration dropping members.
6. `scripts/textbook-v2-validate.mjs --unit` / `scripts/textbook-v2-parity.mjs --unit` per unit; `npx vitest run src/lib/textbook`.

Scripts: scratchpad `b27rr/check.mjs`, `b27rr/d198.mjs`, `b27rr/focus2.mjs` (adapted from the b26 re-review scripts; only unit IDs / part paths / topic / focus questions changed), `b24rr/q.cjs` (question reader, unchanged).

Not established: as in b14–b26, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: u01 109, u02 105, u03 89, u04 110) were checked for the derived copies (step 2) and for `before` remnants (step 1). D-210 / legal facts: the Rule A u01 / u03 / u04 files did the e-Gov / GDPR primary checks; no patch asserts anything outside those checks (u03 p04–p05 住民票 = 番号法 2 条 5 項・7 条 1 項 per u03 L1; u04 p06–p08 = 特定電子メール法 4 条 per u04 L2; p09–p11 = 基本法 8 条 per u04 L3; p12 = 不正アクセス禁止法 8 条 努力義務 per u04 L12), so no new primary-source check was needed.

## 1. Script results (fresh, 2026-11-06)

```
✓ strategy-02-05-u01 unit: 0 issues   validate EXIT=0 | ✓ parity: 26 locations, 0 diff  EXIT=0
✓ strategy-02-05-u02 unit: 0 issues   validate EXIT=0 | ✓ parity: 28 locations, 0 diff  EXIT=0
✓ strategy-02-05-u03 unit: 0 issues   validate EXIT=0 | ✓ parity: 21 locations, 0 diff  EXIT=0
✓ strategy-02-05-u04 unit: 0 issues   validate EXIT=0 | ✓ parity: 25 locations, 0 diff  EXIT=0
validate --part (bases): ✓ u01 / u02 / u03 / u04 part loc#0: 0 issues
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

Application: 30/30 `after` present in their fields; replay of the patches in file order on the base reproduces every patched field exactly (4/4 units, `issues` 0 for u01–u03). Unexplained base → unit diffs in base-present paths: 0 per unit (changed paths u01 6, u02 1, u03 10, u04 13 = exactly the patched fields, one patch per field; only the `stage` meta key removed, as in b19–b26; `round` / `jp_round` are non-string meta keys of the part). `check.mjs` "ruleA verbatim miss": [] for all 4 units.

`before` remnants: the script reports 3 for u04 (`remnant p09 / p10 / p11 at pairs[0].rows[1].a_*`). These are false positives of the substring test: the p09–p11 patches only append など / 等 / " and others", so `before` is a prefix of `after`. Counted over the whole unit, each of these `before` strings occurs exactly once, inside its own `after` (occurrence count before 1 = after 1); every other patch's `before` occurs 0 times (raw and stripped). Real remnants: 0. Also 0 hits in u04 for ロッカー / 储物柜 / locker (old M1 image gone everywhere) and 0 for the singular "command electromagnetic" (p13; "Commands Electromagnetic" 11 = term_en and the other uses); u03 0 hits for 据点 / 国民 (zh now 机构 in both p02 and p10; one_en "each resident" 2 = one_en + definition_en, now = jp / zh).

Derived fields follow: u01 p01–p03 have no derived copy (points); u02 p01 → `terms[1].explanation_en` = stripped detail (true); u03 p04–p05 → `terms[0].definition_jp / _zh` (true ×2), p07–p09 → `summary.key_points_*[3]` (3/3); u04 p06–p08 → `terms[2].explanation_*` (true ×3), p13 → `terms[3].explanation_en` (true). Analogy / pairs / overview / point fields have no derived copy. Full walk: `definition / explanation / memory_hook` = notation-stripped `one / detail / hook`, and `summary.key_points_*` = stripped `key_points_*` — u01 60, u02 54, u03 48, u04 57 checked (219), 0 mismatches.

`summary.memory_hooks_*` suffix check: u01 15 / u03 12 / u04 12 entries, 0 bad. **u02 reports `bad jp[3] / zh[3] / en[3]`: a script artifact, pre-existing and unrelated to the patch.** u02 `terms[2]`(第三者提供) has no `hook_*` in the base (base term keys: one / fig / detail / analogy / points / quiz) nor in the unit (`memory_hook_*` = ""), so `summary.memory_hooks_*` has 4 entries for the 4 hooked terms (オプトイン / オプトアウト / 仮名化 / 匿名化) while the script compares by term index: index 2 compares the 仮名化 entry against an empty hook (passes trivially), index 3 compares the 匿名化 entry against 仮名化's hook (fails), index 4 has no entry (skipped). Matched by order over hooked terms only, all 4 entries end with their term's `memory_hook_*` in 3 languages (true ×3). The only u02 patch (p01, `terms[1].detail_en`) touches no hook. No derived-copy defect; validate 0 issues. (A hookless term is a pre-existing content property of the a2 base, outside this patch review.)

Notation counts (bold, `[[jp:]]`), before → after, every patched field: unchanged in 30 of 30 (e.g. u01 `terms[0].points[1].text_*` bold 1 → 1, zh / en `[[jp:]]` 1 → 1; u03 `terms[0].one_*` bold 2 → 2, zh `[[jp:]]` 2 → 2; u03 `terms[2].points[0].text_en` 2 → 2 / 2 → 2; u04 `terms[2].detail_*` bold 1 → 1, zh / en `[[jp:]]` 1 → 1; u04 `terms[3].detail_en` 2 → 2 / 2 → 2; all others 0 → 0). Parity 0 diff. u01 p01 jp = 100 chars (≤100, D-200; validate 0), u03 p04 jp 79.

D-198, before → after (one script):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest overlap of the `after` span | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| u01 p01 | **jp** | 2012h24a-q020 stem | 7 → 7 (て本人の同意が, unchanged) | 同意を得 (4) | 0 / 0 → 0 / 0; 0.17 → 0.17 |
| u01 p02 | zh | 2016h28a-q003 stem | 5 → 5 (unchanged) | 利用目的 (4) | — |
| u01 p03 | en | 2016h28h-q002 stem | 23 → 23 (" the person's consent. ", unchanged) | "ses such as " (12, generic) | — |
| u01 p04 | **jp** | 2009h21a-q011 ア → 2014h26h-q010 ウ | 3 → 3 | を受け (3) | 0 / 0 → 0 / 0; 0.10 → 0.08 |
| u01 p05 | zh | 2018h30a-q025 ア → 2009h21a-q011 ア | 3 → 2 | 本人 (2) | — |
| u01 p06 | en | 2009h21h-q024 イ | 20 → 20 (" without permission.", unchanged) | " the person " (12, generic) | — |
| u02 p01 | en | 2013h25h-q027 stem | 57 → 57 (the act's name, unchanged) | " notifying the " (15, unchanged word + article) | — |
| u03 p01 | **jp** | 2024r06-q027 stem | 5 → 5 (個人データ) | 個人データ (5, term) | 0 / 0 → 0 / 0; 0.45 → 0.32 |
| u03 p02 | zh | 2023r05-q018 stem → 2024r06-q027 stem | 4 → 5 | 相关的个人 (5) | — |
| u03 p03 | en | 2024r06-q027 stem | 14 → 14 ("personal data ", term) | same (14) | — |
| u03 p04 | **jp** | 2020r02o-q025 stem | 9 → 9 (を定めた法律である, unchanged) | 住民 (2) | 0 / 0 → 0 / 0; 0.23 → 0.21 |
| u03 p05 | zh | 2016h28a-q031 エ | 5 → 5 (我的编号法 = term) | 针对 (2) | — |
| u03 p06 | en | 2023r05-q015 → 2016h28a-q031 stem | 11 → 11 | "ses in the " (11, generic) | — |
| u03 p07 | **jp** | 2012h24a-q097 ア | 4 → 4 (ではない, unchanged) | ではない (4) | 0 / 0 → 0 / 0; 0.10 → 0.09 |
| u03 p08 | zh | 2009h21h-q024 ア | 2 → 2 | 义务 (2) | — |
| u03 p09 | en | 2017h29a-q013 → 2012h24a-q097 stem | 11 → 10 | "ance with " (10) | — |
| u03 p10 | zh | 2023r05-q018 stem | **10 → 7** (在欧盟境内设有; 据点 removed) | 在欧盟境内设有 (7) | — |
| u04 p01 | **jp** | 2009h21a-q011 ア | 5 → 5 (教えること, unchanged) | すること (4) | 0 / 0 → 0 / 0; 0.19 → 0.18 |
| u04 p02 | zh | 2011h23a-q027 ウ | 4 → 4 (密码告诉, unchanged) | 的密码 (3) | — |
| u04 p03 | en | 2009h21h-q024 イ | 20 → 20 (unchanged) | "ing someone else's p" (20; obs. 2) | — |
| u04 p04 | zh | 2024r06-q027 stem | 3 → 3 | 的人 (2) | — |
| u04 p05 | en | 2019h31h-q024 イ | 13 → 13 (" people who a", unchanged) | same (13) | — |
| u04 p06 | **jp** | 2024r06-q027 stem | 6 → 6 (の同意を得て, unchanged) | 送信者の (4) | 0 / 0 → 0 / 0; 0.19 → 0.20 |
| u04 p07 | zh | 2016h28a-q003 ウ (correct) | 9 → 9 (选择加入optin = term, unchanged) | 人的姓名 (4) | — |
| u04 p08 | en | 2025r07-q006 ア | 19 → 19 (" advertising email ", unchanged) | " and other " (11, generic) | — |
| u04 p09 | **jp** | 2009h21h-q024 ア | 3 → 3 (事業者) | 事業者 (3) | 0 / 0 → 0 / 0; 0.25 → 0.30 (14-char field) |
| u04 p10 | zh | 2009h21h-q002 ア | 2 → 2 | 企业 (2) | — |
| u04 p11 | en | 2026r08-q021 ウ (correct) | 20 → 20 (" local governments, ", unchanged) | same (20) | — |
| u04 p12 | en | 2015h27a-q028 stem | 20 → 21 (" access administrator" = legal term) | same (21) | — |
| u04 p13 | en | 2019h31h-q024 stem | 27 → 45 | "unauthorized commands electromagnetic records" (45 = the headword's own en form, term_en) | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52) as a sentence-frame copy; masked 12-char windows 0 / 0 before and after in all 8 jp patches. u04 p13's 45-char overlap is the official term name (= `term_en` "Crime Concerning Unauthorized Commands Electromagnetic Records", which is what L13 asked to align); u03 p10 lowers the overlap with the 2023r05-q018 zh stem (10 → 7).

Per-choice check (LCS before → after vs each choice; `focus2.mjs`):
- **2014h26h-q010** (correct ウ = HQ request, consent needed; wrong イ = child-abuse info sharing, 27 条 1 項 3 号): u01 p01 jp ≤3 vs every choice; p02 zh ≤2; p03 en ≤5 except エ 3 → 11 ("es such as ", generic; obs. 5). No move toward a wrong choice.
- 2012h24a-q020 / 2024r06-q027 / 2018h30h-q014: u01 p01–p03 ≤2 jp / zh, ≤5 en alike across choices; stem 2024r06-q027 en 7 → 11 (generic "such as").
- 2022r04-q027 (correct エ 信条): u01 p04–p06 0 → 0 jp / zh; en イ 5 → 6 ("nation" ⊂ discrimination / nationality — letters, not the word; obs. 4).
- 2022r04-q023 / 2025r07-q006: u02 p01 en ≤7 alike (" steps ", " only ", unchanged words).
- **2023r05-q018** (correct ウ = a, c): u03 p01–p03 0 / 0 / ≤2 vs every choice (choices are item letters); p06–p10 ≤2; stem jp 4 → 4 (EU域内, unchanged), zh 4 → 4, en 9 → 9.
- 2018h30h-q008 / 2017h29a-q013: u03 p04–p05 ≤1.
- **不正アクセス禁止法 questions**: u04 p01 jp ≤4 vs every choice (すること / に他人の, generic; 2018h30a-q001 1 → 0 all choices); p02 zh ≤2; p03 en: 2014h26h-q013 ウ (correct, telling a third party) 16 → 16 and 2018h30h-q021 ア (correct) 16 → 16 (" someone else's ", unchanged); q021 イ / ウ 16 → 20 (obs. 2); all other choices ≤9, falling or unchanged.
- u04 p04–p05 vs 2025r07-q006 / 2016h28a-q003 / 2013h25h-q001: ≤6, falling or unchanged (removing 只 / only).
- u04 p06–p08 vs 2013h25h-q001 / 2025r07-q006: ≤4 jp, ≤2 zh, ≤8 en alike.
- u04 p09–p11 vs 2021r03-q032 / 2026r08-q021 / 2024r06-q002 / 2017h29a-q013 / 2020r02o-q025: ≤2 jp / zh; en 2026r08-q021 イ 4 → 11 / エ 9 → 12 ("s and other(s)", generic; obs. 3), correct ウ 20 → 20 (unchanged " local governments, ").
- u04 p12 vs 2015h27a-q028: 7 → 8 (" access ") alike for ア (correct) / イ / ウ.
- u04 p13 vs 2019h31h-q024 / 2017h29h-q015: ≤4 vs every choice.

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01–p03 | `terms[0](個人情報取扱事業者).points[1].text_jp / _zh / _en` | **M1** (MEDIUM, types 6 / 10) | **Yes** (§3.1) | No (obs. 5) | OK |
| u01 | p04–p06 | `terms[3](要配慮個人情報).analogy_jp / _zh / _en` | L2 建議修 | Yes: 暮らしや評判 / 生活和名声 / "life and reputation" → 差別や偏見を受けかねない / 遭受歧视或偏见 / "discrimination or prejudice" = `one` (不当な差別や偏見) and `points[0]`; 2022r04-q027 ア 学歴 / ウ 資産額 no longer fit the image | No (obs. 4) | OK |
| u02 | p01 | `terms[1](オプトアウト).detail_en` (+ explanation_en) | L2 建議修 | Yes: "notifying the person or taking similar steps" = jp 通知など / zh 通知本人等 (27 条 2 項 通知又は容易に知り得る状態) | No | OK |
| u03 | p01–p03 | `overview_rows[1](GDPR).extra_jp / _zh / _en[1]` | **M1** (MEDIUM, type 9) | **Yes** (§3.2) | No | OK |
| u03 | p04–p05 | `terms[0](マイナンバー法).one_jp / _zh` (+ definition) | L1 建議修 | Yes: 国民一人ひとり / 每位国民 → 住民票を持つ一人ひとり / 每位持有住民票者 = one_en "each resident"; 3 languages now agree; 2018h30h-q008 / 2017h29a-q013 unaffected | No | OK |
| u03 | p06 | `terms[2](忘れられる権利).points[0].text_en` | L2 建議修 | Yes: "next to the article" → "in the heading of the article" (Art. 17 heading) | No | OK |
| u03 | p07–p09 | `key_points_jp / _zh / _en[3]` (+ summary.key_points[3]) | L3 建議修 | Yes: press freedom = balancing (兼ね合い / 相权衡 / balance), retention duties = exceptions (保存義務などがある / 等例外 / exceptions such as) — 17 条 3 項 (a)(b) distinguished; conclusion "not always granted" kept | No | OK |
| u03 | p10 | `terms[1](GDPR).points[0].text_zh` | L4 建議修 | Yes: 设有据点 → 设有机构; matches p02 (机构) | No | OK |
| u04 | p01–p03 | `terms[1](不正アクセス禁止法).analogy_jp / _zh / _en` | **M1** (MEDIUM, types 4 / 9) | **Yes** (§3.3) | LOW only (obs. 1, 2) | OK |
| u04 | p04–p05 | `terms[2](特定電子メール法).analogy_zh / _en` | L1 建議修 | Yes: 只 / only removed; now = jp 配るのを基本とし; 原则上 / as a rule kept | No | OK |
| u04 | p06–p08 | `terms[2].detail_jp / _zh / _en` 2nd sentence (+ explanation) | L2 建議修 | Yes: 表示事項 opened (など / 等信息 / "and other required details", 4 条 3 号); 2013h25h-q001 a (拒否連絡先「など」) consistent, correct ア unchanged | No | OK |
| u04 | p09–p11 | `pairs[0].rows[1].a_jp / _zh / _en` | L3 建議修 | Yes: など / 等 / "and others" opens the list (8 条 教育研究機関); 2021r03-q032 (a 国・自治体, b 国民) → イ unchanged | No (obs. 3) | OK |
| u04 | p12 | `pairs[0].rows[2].b_en` | L12 建議修 | Yes: "A duty for access administrators to try to defend" = jp 防御に努める / zh 应努力 (8 条 努力義務); 2015h27a-q028 (努力義務 of the access administrator) aligned | No | OK |
| u04 | p13 | `terms[3].detail_en` 1st sentence (+ explanation_en) | L13 建議修 | Yes: "command" → "commands" = term_en; no singular form left in the unit | No | OK |

## 3. Focused checks

### 3.1 u01 p01–p03 (M1) — consent exceptions as an open list

- After: jp 「法令に基づく場合や、人の生命・身体・財産の保護に必要で同意を得にくい場合**など**のほか、利用目的の達成に必要な範囲で取扱いを委託する場合も同意は要らない。」/ zh 「…委托处理的情况**等**，都不需要同意。」/ en "Consent is not needed **in cases such as** when the law requires it, …, or when handling is outsourced …" (= auditor's M1 text verbatim, 3/3). jp attaches など to the 27 条 1 項 group (法令 / 生命・身体・財産 → also 3 号 公衆衛生・児童, 4 号, 学術研究) and keeps 委託 (27 条 5 項) as a separate case — matches the law's structure; zh / en open the whole list. None of the three now reads as closed.
- Type (9) / (10) on **2014h26h-q010** (which transfer needs consent): ア (法令 = warrant) and エ (sharing info on anti-social forces = 財産 protection) are named exceptions; イ (child-abuse information shared with 児童相談所 / police / school) is no longer forced into "consent needed" because the list is open ("など / 等 / such as"); ウ (handing franchisees' customer data to HQ at HQ's request) is neither a named exception nor 委託 → consent needed → **ウ (correct)**. 2012h24a-q020 (correct ア) / 2018h30h-q014 / 2024r06-q027 (correct イ, two exceptions) are answered as before: the two named examples remain. The unit does not newly suggest any other transfer is exempt. jp 100 chars (validate D-200 0 issues). **M1 resolved.**

### 3.2 u03 p01–p03 (M1) — GDPR overview row "what it mainly protects"

- After: jp 「EU 域内の拠点や EU 域内の人に関わる個人データ」/ zh 「与欧盟境内机构或欧盟境内人员相关的个人数据」/ en "Personal data handled by EU-based businesses or about people in the EU" (= M1 text verbatim, 3/3).
- Type (9) on **2023r05-q018** (which of a–d are appropriate): cue → applies when an EU establishment is involved *or* the data concerns people in the EU. a (EU establishment, serving inside the EU) → applies → appropriate; **b** (EU establishment, serving only outside the EU, says "not applicable") → the EU-establishment branch applies → b inappropriate (the old row "data of people in the EU" had made b look appropriate → イ a, b, c); c (no establishment, serving only outside) → neither branch → not applicable → appropriate; d (no establishment, serving into the EU, says "not applicable") → people-in-the-EU branch → d inappropriate → {a, c} = **ウ (correct)**. Consistent with `terms[1].points[0]` (applies to businesses with an EU 机构/拠点 and possibly to outside businesses serving people in the EU — Art. 3 (1)(2)) and the analogy (L7, Art. 3 (2) side). The row is wider than Art. 3 (2)'s exact trigger (offering goods / services or monitoring), but it is a "mainly protects" summary cell, not an applicability rule, and no topic question turns on that detail. Type (8): 拠点 / 机构 / establishment is no headword of u03 (マイナンバー法・GDPR・忘れられる権利・消去権). New jp has no 12-char window with q018 (0 / 0). **M1 resolved.**

### 3.3 u04 p01–p03 (M1) — 不正アクセス禁止法 analogy

- After: jp 「電話越しに他人の暗証番号を告げて口座の手続きをすることと、その番号を勝手に別の人へ教えることの両方を禁じる決まりに近い。」/ zh 「…在电话里报出别人的密码来办理账户手续，以及擅自把那串密码告诉第三方。」/ en "…bans both giving someone else's PIN over the phone to handle their bank account and telling that PIN to a third person without permission." (= M1 text verbatim, 3/3). The locker image (no network) is gone from the unit (0 hits in all fields).
- Type (9), image applied to every 不正アクセス禁止法 question of the unit: the image is remote (over a line) + someone else's code against a code-protected account. **2018h30a-q001** → only a (network + access control) fits; c (access control, no network) no longer has an image → **ア (correct)**, ウ no longer suggested. 2021r03-q030 → a (someone else's ID/password, login over the network) fits; b (reading a colleague's unlocked screen) and c (USB taken and read on one's own PC) involve no code over a line → **ア (correct)**; 2020r02o-q013 → a (use) + b (obtaining and recording the code — `points[1]`) → イ (correct), c not suggested. 2018h30h-q021 → a = someone else's credentials, b = telling them to a third party → **ア (correct)**; the old on-the-spot locker image had been closer to the wrong "operate the PC directly at its keyboard" option, the new remote image is not. 2014h26h-q013 / 2013h25a-q027 / 2011h23a-q027 (telling a third party = prohibited) → second half of the image → ウ / エ / イ (correct; q027 ウ "merely telling is not a violation" contradicted). 2010h22h-q030 → エ (network login with someone else's ID); 2014h26a-q023 (security-hole intrusion) / 2025r07-q016 (b malware) → answered by `hook` / `points` as before, image neutral. No question is answered differently except q001 / q030 in the right direction; per-choice LCS shows no move toward any wrong choice.
- Type (8): 暗証番号 / 口座 / 電話 name no role another headword defines (u04 headwords: サイバーセキュリティ基本法・不正アクセス禁止法・特定電子メール法・不正指令電磁的記録に関する罪・ウイルス作成罪). Consistent with `one` (ネットワークを通じて), `points[0]`, `hook` (制御を破る; L6) and the fig. Sentence count 1 → 1. **M1 resolved.**
- §6 (accepted swap, LOW only): see obs. 1.

## 4. Observations

No F-fix from this re-review (all 30 patches are the auditors' prescribed texts, applied exactly, and correct in context).

Records only, no fix:

1. LOW, u04 p01–p03 (D-203 §6, the accepted swap): the new image is a concrete near-instance of the regulated act rather than a distant analogy, and both halves are speech acts (告げて / 報出 / "giving … over the phone" for *use*, 教える / 告诉 / "telling" for *provision*); the distinction is carried by 口座の手続きをする / 办理账户手续 / "to handle their bank account". A phone call to a human operator is not strictly input to a 特定電子計算機, but the sentence is framed as 決まりに近い / 就像 / "It is like", and §3.3 shows no question is pushed toward a wrong option. Treated as LOW per the u04 Rule A note.
2. LOW, u04 p03 (en): after-span "ing someone else's p" (20) vs the en sidecar of 2018h30h-q021 wrong イ / ウ arises from " someone else's " (16, unchanged) + the first letter of PIN vs PC; the image (phone, remote) is the opposite of those options' at-the-keyboard scene.
3. LOW, u04 p11 (en): "s and other(s)" (11–12) vs the en sidecars of 2026r08-q021 イ / エ — generic list-closing words; the correct ウ overlap (" local governments, ", 20) is the unchanged part of the row.
4. LOW, u01 p04–p06: the narrowed image (差別や偏見 / discrimination or prejudice) could also be read onto 2022r04-q027 wrong イ (国籍, not a 要配慮 item). Not type (9): the old image also covered it, `points[0]` restricts the class to 法令が挙げた事項 with 信条 named as representative → エ, and detail lists 人種 (not 国籍). The patch narrows the image (学歴 / 資産額 no longer fit).
5. LOW, u01 p03 (en): "es such as " (11–12) also occurs in the en sidecars of 2014h26h-q010 エ and the 2024r06-q027 / 2013h25h-q001 stems — generic connective; it is the very opening M1 asked for.
6. Script notes (no content issue): `check.mjs` u04 "remnant p09–p11" = before ⊂ after (each occurs once, inside its after); u02 `memory_hooks suffix check bad jp[3] / zh[3] / en[3]` = index misalignment caused by the hookless `terms[2]`(第三者提供), pre-existing in the a2 base, unrelated to p01; order-matched check over the 4 hooked terms passes in 3 languages (§1).

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 3 in scope (u01 M1, u03 M1, u04 M1) — **all resolved**; **0 introduced**
- LOW introduced: 建議修 0; 記録のみ 5 (obs. 1–5) + script notes (obs. 6)
- Application 30/30 exact (replay), 30/30 = the Rule A prescribed text, every MEDIUM and 建議修 of the 4 Rule A files covered (u01 6 / u02 1 / u03 10 / u04 13), derived fields follow (219 checked + summary.memory_hooks suffix 51, 0 real mismatch), 0 unexplained base → unit diffs, 0 real `before` remnants
- D-198: masked 12-char windows 0 / 0 before and after in all 8 jp patches; zh after-spans ≤7 chars, en after-spans ≤21 chars except u04 p13 (45 = the headword's term_en), all unchanged words, term names or generic phrases, none from a wrong choice's frame
- validate 4/4 = 0 issues, parity 4/4 = 0 diff (26 / 28 / 21 / 25 locations), validate --part bases 4/4 = 0 issues, vitest textbook 162/162

**PASS** — all 30 active patches of strategy-02-05 u01–u04 are applied exactly (replay reproduces every patched field, derived fields follow, no other base-present path changed) and each is the auditor's prescribed text. u01 M1: the consent exceptions for third-party provision are now an open list in jp / zh / en, so 2014h26h-q010 イ (child-welfare sharing) is no longer forced to "consent needed" and ウ remains the only consent-needed case. u03 M1: the GDPR overview row now covers data tied to an EU establishment as well as people in the EU, so applied to 2023r05-q018 it rejects b and d → ウ. u04 M1: the 不正アクセス禁止法 analogy now depicts a remote, code-protected access, so 2018h30a-q001 c and 2021r03-q030 b / c are no longer evoked → ア / ア. The LOW fixes (差別や偏見, 通知など in en, 住民票, Art. 17 heading, balance vs exceptions, 机构, 只 / only removed, 表示事項など, 責務の相手など, en 努力義務, Commands) close their field / language mismatches without new issues. No new HIGH / MEDIUM.
