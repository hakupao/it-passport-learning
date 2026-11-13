# OQ-15 textbook side — apply (S155)

Two v1 `term_zh` mistranslations carried into v2 units, corrected:

| unit | before | after | basis |
|---|---|---|---|
| technology-16-44-u03 | デュアルシステム = 双工系统, デュプレックスシステム = 双重系统 (swapped, in every zh field) | デュアルシステム = **双重系统**, デュプレックスシステム = **双工系统** | D-175 (corpus-wide, quiz already), technology-16-43-u02 (already correct) |
| technology-23-63-u05 | アンチパスバック = 防尾随（Anti-passback） | アンチパスバック = **反潜回**（Anti-passback） | quiz layer S130 (2016h28a / 2021r03 / 2022r04 / 2025r07 notes) |

`尾随` = 共連れ (tailgating) is unchanged in u05 (verifier: count of 尾随 not preceded by 防 equal per field).

## Method

`scripts/oq15-apply.ts` (units half of `scripts/l4-r2-apply.ts`, same routes):

- planned fields = every non-derived zh string of the unit containing the old name; u03 fix = simultaneous swap 双工系统 ↔ 双重系统,
  u05 fix = 防尾随 → 反潜回 (every 防尾随 in u05 is the method name);
- loc-part fields → one B3 patch each (`textbook-v2-patch.mjs` CLI, minimal unique window), u05 `terms[3].points[1].text_zh`
  overlapped active p05 → p05 retired + composite registered (C17 pattern);
- `term_zh` (3) → `manifest.v1_terms` (gitignored; `manifest.v1` untouched) + `apps/web/src/lib/textbook/__fixtures__/v2-units.v1terms.json`
  + units via the merged value;
- merge dry-run only (never `--write`), then in-place write of the merged values of the target fields + their compat fields (COMPAT allow-list of l4-r2-apply);
  every derived field the old name reached must equal fix(before) (checked);
- `zh_terms.json`: アンチパスバック → 反潜回（Anti-passback）; デュアルシステム → 双重系统 / デュプレックスシステム → 双工系统 moved from `excluded`
  (OQ-15) into `terms` (= what `seedTable` now derives from the corrected units); `excluded` = {}.
- `scripts/textbook-v2-zh-terms.mjs`: the two dormant `CONFLICT_RULES` "excluded" entries removed (a re-swap now stops the seed);
  `scripts/textbook-v2-zh-terms.test.mjs`: 3 pinned tests updated for exactly this change (conflicts = MBO / E-R図 only, both units
  agree on 双重系统 / 双工系统; seed has the pair in terms and nothing excluded; `--conflicts` lists 2).

Run report: `oq15_apply_run.json` (plan → apply, merge exit u03 0/0, u05 1/1 = pre-existing jp-origin; baseline merged-vs-units diff [] both; after write = baseline).

### Fields (15 planned + 8 derived)

technology-16-44-u03 (planned 10): `goals_zh[0]`, `terms[0].term_zh`, `terms[0].one_zh`, `terms[0].detail_zh`, `terms[0].points[0].text_zh`,
`terms[0].points[1].text_zh`, `terms[1].term_zh`, `terms[1].one_zh`, `terms[1].points[0].text_zh`, `terms[1].points[1].text_zh`;
derived 5: `terms[0].definition_zh`, `terms[0].explanation_zh`, `terms[1].definition_zh`, `overview.intro_zh`, `summary.memory_hooks_zh[0]`
(「双重系统：英语 dual 意为“双方的”。…」).

technology-23-63-u05 (planned 5): `terms[3].term_zh`, `terms[3].one_zh`, `terms[3].points[1].text_zh` (composite, p05 retired),
`terms[3].points[2].text_zh`, `key_points_zh[2]`; derived 3: `terms[3].definition_zh`, `summary.key_points_zh[2]`, `summary.memory_hooks_zh[2]`.

Patches: u03 p19–p26 registered (8); u05 p24–p27 registered (4) + p05 retired.

## Gates

1. **Full-field diff** (`scripts/oq15-verify.ts` → `oq15_apply.json`): 244 units compared, 2 changed, 23 fields = 15 planned + 8 derived,
   all equal to plan, all zh (ja/en 0 changes), reverse(new) = old for all 23, 尾随 count kept; fixture 3 term_zh only; zh_terms only the
   5 planned paths, keys sorted; patch files: existing patches unchanged except u05 p05 (status/retired_reason), new ones appended active. **PASS**.
   gitignored manifests vs pre-apply backup: only `v1_terms[0,1].term_zh` (u03) / `v1_terms[3].term_zh` (u05).
2. `lang-leak-scan.ts --gate` exit 0 PASS (499 entries); `l5-build-allowlist.ts` dry run: unclaimed 0, new claims 0, dropped 0 (no regeneration).
3. validate: u03 exit 0 (0 issues), u05 exit 1 (17 jp-origin + 2 warn) — output byte-identical to HEAD for both. `--check-units` output identical to
   before (the pair now in `terms` adds no warning). `unit_minutes --check` match; `quiz-keys-crosscheck` all invariants hold;
   `node --test scripts/*.test.mjs` 108/109 (only the known quiz-fidelity-machdiff failure); `lang-leak-scan.test.ts` 22/22.
4. apps/web: `tsc --noEmit` 0, `lint` 0, `vitest` 132 files / 1474 tests pass.
5. `pnpm build:cf` exit 0 (gate:content + build + scan:out:ci pass: true); `pnpm scan:out` (rule c included) pass: true.
   out/zh/textbook/technology-16-44-u03.html: 双重系统+（デュアルシステム 4, 双工系统+（デュプレックスシステム 4, wrong pairing 0 (same as
   technology-16-43-u02); technology-23-63-u05.html: 反潜回 16, 防尾随 0, 尾随 (共連れ) 19; glossary: 双重系统 / 双工系统 / 反潜回（Anti-passback） pages, 防尾随 0.

## Other occurrences (not changed)

- Quiz 2022r04-q074 explanation zh: 「与物理出入室的防尾随无关」「物理防尾随的对策」 — generic "prevent tailgating" (共連れ防止), kept on purpose by the S130 note.
- Quiz explanations/translations: 双工系统 / 双重系统 already follow D-175 (dual = 双重系统, duplex = 双工系统).
- `apps/web/src/lib/textbook/__tests__/validateV2.test.ts:595` synthetic string 「正确答案是防尾随。」 (test input, not data).
- gitignored archives untouched: `.planning/v2/<unit>/{v1-original.json, journal*.jsonl, merged.json(dry-run output), zh_terms.unit.json}`,
  `.planning/translation_technology-23-63-u05.json`, `.planning/v2/technology-23-63-u0{2,3}/zh_terms.unit.json` (prep copies, still 防尾随),
  `manifest.v1` (v1 original, base of unit-level patches).
- No figure label / figure_index / apps/web/public / messages hit.
