# tb-jp-unmarked — D-221 marks on 18 textbook fields (S155)

Follow-up of S154 L5 (`scripts/fixtures/lang-allow.json` category `tb-jp-unmarked`, 24 entries / 19 fields / 11 units).
18 fields in 10 units get `[[jp:…]]` (round a). Round b (a main-session minor decision) changes 2 more zh cells of technology-13-34-u02 to the Japanese form, which renders `<span lang="ja" data-inline="jp">`. 1 field (`technology-21-55-u01 terms[4].term_en`) cannot take the mark. Its entry stays, moved to a permanent category.

## 1. Rendering support (Step 1)

| Field type | Parsed by | Precedent (`[[jp:` in units/, before) | Verdict |
|---|---|---|---|
| `terms[].one_* / detail_*` | `TermBlock` `rich()` → `parseInline` (v2) | 2435 / 766 fields | supported |
| `goals_*[]` (with `**bold**`) | `UnitHeader` V2Overview `parseInline` | 93 | supported |
| `pairs[].rows[].a_* / b_*` | `PairBlock` `rich()` on `<td>` | 2 + 2 | supported |
| `term_zh / term_en` | **plain string**: `TermBlock` h3 `termGloss` = `pick(term.gloss)`, `PairBlock` gloss/title, `lib/glossary/dictionary.ts` `termEn` and search string. Assembled from `manifest.v1_terms`; B3 refuses term keys | 0 | **not supported**: the mark would print literally |

Derived fields: `definition_* / explanation_*` = `compatText(one_* / detail_*)`, `overview.intro_*` = `introOf(goals_*)`. No new mark sits right after a `**keyword**`, so `compatText` strips them and the derived values stay byte-identical. This was confirmed: the merge diff covered the target paths only. `overview_rows`, `summary.*`, `unit_index.json` and glossary data are unchanged.

## 2. Fields (before → after, the changed span only)

| Unit | Field | Before | After |
|---|---|---|---|
| strategy-03-09-u04 | terms[2].detail_en | `"public" (公開) in` | `"public" ([[jp:公開]]) in` |
| strategy-03-09-u05 | terms[3].detail_zh | `“共食い”（同类相食）` | `“[[jp:共食い]]”（同类相食）` |
| strategy-03-10-u07 | pairs[0].rows[3].a_zh | `上澄み吸収価格戦略（撇取上层定价策略）` | `[[jp:上澄み吸収価格戦略]]（撇取上层定价策略）` |
| strategy-03-10-u07 | pairs[0].rows[3].a_en | `上澄み吸収価格戦略 (skimming the top layer)` | `[[jp:上澄み吸収価格戦略]] (skimming the top layer)` |
| strategy-03-10-u07 | pairs[0].rows[3].b_zh | `市場浸透価格戦略（市场渗透定价策略）` | `[[jp:市場浸透価格戦略]]（市场渗透定价策略）` |
| strategy-03-10-u07 | pairs[0].rows[3].b_en | `市場浸透価格戦略 (market penetration pricing)` | `[[jp:市場浸透価格戦略]] (market penetration pricing)` |
| technology-13-34-u02 | pairs[1].rows[0].a_en | `中央値 (median)` | `[[jp:中央値]] (median)` |
| technology-13-34-u02 | pairs[1].rows[0].b_en | `最頻値 (mode)` | `[[jp:最頻値]] (mode)` |
| technology-13-34-u02 | pairs[1].rows[0].a_zh **(round b, text change)** | `中央值（中位数）` | `[[jp:中央値]]（中位数）` |
| technology-13-34-u02 | pairs[1].rows[0].b_zh **(round b, text change)** | `最频值（众数）` | `[[jp:最頻値]]（众数）` |
| technology-13-34-u06 | goals_en[1] | `**edge** (エッジ) to vertex and edge (辺).` | `**edge** ([[jp:エッジ]]) to vertex and edge ([[jp:辺]]).` |
| technology-13-34-u06 | terms[3].detail_en | `the term 辺 is` | `the term [[jp:辺]] is` |
| technology-14-37-u03 | terms[1].detail_en | `The Japanese word 手続 can` | `The Japanese word [[jp:手続]] can` |
| technology-14-37-u03 | terms[1].detail_zh | `日语的“手続”一词` | `日语的“[[jp:手続]]”一词` |
| technology-20-53-u03 | terms[3].detail_zh | `“拡張”意为扩展` | `“[[jp:拡張]]”意为扩展` |
| technology-20-53-u03 | terms[5].detail_zh | `日语名称“複合”上` | `日语名称“[[jp:複合]]”上` |
| technology-22-60-u06 | terms[0].detail_zh | `日语读作“マイモ”` | `日语读作“[[jp:マイモ]]”` |
| technology-23-62-u05 | terms[1].one_zh | `日语读作“シーサート”` | `日语读作“[[jp:シーサート]]”` |
| technology-23-62-u05 | terms[2].one_zh | `日语读作“ソック”` | `日语读作“[[jp:ソック]]”` |
| technology-23-63-u10 | terms[6].detail_en | `either 本人拒否率 or FRR` | `either [[jp:本人拒否率]] or FRR` |

Quotes stay outside the mark (zh `“[[jp:…]]”`, en `([[jp:…]])`). In the pair rows the whole Japanese name is marked and the gloss in brackets stays outside.

**Not marked**: technology-21-55-u01 `terms[4].term_en` `Table (Japanese term 表)`. The allow entry is kept and its category is now `jp-explained`, with a specific reason (built from the `l5-build-allowlist.ts` class). **Minor decision (main session, S155, accepted)**: headwords (`term_zh / term_en`) are plain strings, so intended Japanese in them stays unmarked and allow-listed. Marking would need the reader / glossary / search to parse `term_*` (an apps/web change).

## 3. Siblings

The sweep covered every non-jp, non-derived string field of the 11 units for the target words, outside existing marks. It found **no other unmarked intended Japanese in content fields**. Decided:

| Where | Text | Decision | Reason |
|---|---|---|---|
| technology-13-34-u02 pairs[1].rows[0].a_zh / b_zh (row label 日语名称) | `中央值（中位数）` / `最频值（众数）` | **changed in round b** (main-session minor decision, S155) | The row is the Japanese-name row, so zh shows the Japanese form as en does. Simplified 值 / 频 → 値 / 頻 inside the mark: a text change, not mark-only, checked as an exact after-value. |
| technology-21-55-u01 terms[4].term_zh | `表` | left | Ordinary Chinese headword, plain-string field |
| technology-21-55-u01 terms[4].detail_zh | `加上“表”来称呼…例如“学生”表（[[jp:“生徒”表]]）` | left | The zh sentence describes the naming in Chinese ("学生"表), and the Japanese example is already marked. 表 here is ordinary Chinese. |
| strategy-03-09-u04 terms[2].detail_zh | `「公开」` | left | Chinese (simplified 开) |
| strategy-03-09-u05 / 20-53-u03 / 22-60-u06 / 23-62-u05 detail_en / one_en | "eating one's own kind", "extend", "compound", "maimo", "see-sert", "sock" | left | English or romanised, no Japanese |
| technology-23-63-u10 terms[6].detail_zh | `拒真率`, `日文名称` | left | Chinese, no Japanese |
| technology-13-34-u06 goals_zh[1], terms[3].detail_zh | `边（edge）`, `edge` | left | Chinese / English |
| `pairs[].a/b`, `fig.*.jp`, `figure.mermaid`, `source_figures` | JP keys / JP cells / v1 data | out of scope | Not zh/en prose |

## 4. Method (B3, as S154 L4 round 2)

- `scripts/tbjp-apply.ts` is the units half of `scripts/l4-r2-apply.ts`. For each field it registers one loc-part patch with the minimal unique window (`textbook-v2-patch.mjs --register --part <final loc part>`). Plan mode simulated the replay first: replay = after, no stray field.
- Composite: strategy-03-09-u05 `terms[3].detail_zh` overlapped active `p09` (`"共食"` → `“共食い”（同类相食）`). p09 was retired and p12 was registered as the composite (C17 pattern).
- Then a merge dry-run, never `--write` (C11: `--write` would revert strategy-03-10-u07 `challenge_questions` and technology-23-63-u10 `title_zh`). The merge diff after registration was exactly the target paths. Only those were written in place to units/*.json, and merged-vs-units after the write equals the baseline diff: u07 `challenge_questions[0..4]`, u10 `title_zh`, both pre-existing.
- No target unit is in `frozen_baseline.json`. No direct edit was needed.
- Run record: `tb_jp_unmarked_apply_run.json`. 10 units, 18 fields, 18 registrations, 1 retirement, 1 composite. `tbjp-apply.ts` is one-shot: a re-run refuses, because `before` no longer matches.
- Allow-list: `scripts/l5-build-allowlist.ts` lost `TB_UNMARKED_AT` and the `tb-jp-unmarked` category. One `jp-explained` class was added for the 表 headword. Then `l5-build-allowlist.ts --write` printed `new claims 0, dropped 23` with no `--accept-new`. The fixture went from 522 to 499 entries (one entry re-categorised, same allow key).
- **Round b** (main-session minor decision, after round a): `tbjp-apply.ts --round b` (plan, then `--apply`) handles technology-13-34-u02 `pairs[1].rows[0].a_zh / b_zh`. It registered 2 loc-part patches (`中央值` → `[[jp:中央値]]`, `最频值` → `[[jp:最頻値]]`). Merge dry-run exit 0; baseline diff empty; new diff = the 2 targets; written in place; after-write = baseline. Run record: `tb_jp_unmarked_apply_run_b.json`. Derived-field check: pair rows feed no compat field (`assemble`: definition / explanation / memory_hook / intro / summary come from terms / goals / key points). `est_minutes` reads pair rows `_jp` only, `overview_rows` is separate and `unit_index.json` holds titles only. The merge diff confirmed this: only the 2 targets. `tbjp-verify.ts` takes both reports and checks the 2 `exact` fields as exact after-values; the other 18 keep the marks-only rule.
- Slip (not a gate failure): the first builder edit was chained after `python3 - ||`. The empty python run exited 0, so the edit did not run, and the dry-run then showed only the data-driven drops. Found from the unchanged `byCat`, then the edit was re-run. No output was written from the slip.

## 5. Gates

| # | Check | Result |
|---|---|---|
| 1 | `node --no-warnings scripts/tbjp-verify.ts --report …_run.json --report …_run_b.json --html apps/web/out --out tb_jp_unmarked_apply.json`: full-field diff of 244 units vs `git show HEAD` | 10 files / 20 fields changed = 20 planned. The 18 round-a fields each equal the plan, `stripInline(new) = stripInline(old)`, and removing the added marks gives old. The 2 round-b fields (`exact`) equal their planned after-values exactly. `pass: true` |
| 2 | `node --no-warnings scripts/lang-leak-scan.ts --gate` (no `--accept-new`) | exit 0, `PASS` (499 entries, allowed 636, hits 7579); after round b: PASS, and `l5-build-allowlist.ts` dry-run gives `new claims 0, dropped 0` |
| 3 | `textbook-v2-validate.mjs --unit` × 244 (after round b: technology-13-34-u02 again, 0 issues, exit 0) | 243 exit 0 + technology-23-63-u05 exit 1 (existing jp-origin, as L4). For the 10 changed units, HEAD (`--file` on `git show HEAD:` copies) vs now: identical output (issues 0, the same warnings) |
| 3b | `textbook-unit-minutes-build.mjs --check` / `quiz-keys-crosscheck.mjs` | match / all invariants hold |
| 3c | `node --test scripts/lang-leak-scan.test.ts` / `node --test scripts/*.test.mjs` | 22/22 / 108 pass, 1 fail (`quiz-fidelity-machdiff`, existing, as L4) |
| 4 | `pnpm -C apps/web exec tsc --noEmit` / `lint` / `test` | exit 0 / exit 0 / 132 files, 1474 tests pass (vitest re-run after round b: same) |
| 5 | `pnpm -C apps/web build:cf` (run after round a and again after round b) (gate:content + build + `scan:out:ci`) | exit 0. 14281 pages; scan-out `pass: true` (a/b/d/e 0, c skipped by `--no-ipa-sources`) |
| 1b | `git diff --numstat -- data/ip/textbook/units` | insertions = deletions = fields per file (1,1,4,4,2,2,2,1,2,1 = 20/20, technology-13-34-u02 = 4): no re-serialisation |
| 5b | marks in `out/<zh|en>/textbook/<unit>.html` (rebuilt after round b) | 21/21 added marks render as `<span lang="ja" data-inline="jp">` between their own text before and after. A pair cell needs the tag end before it and the gloss after it (e.g. `>…中央値</span> (me`), so a mark elsewhere on the page cannot satisfy the check. Literal `[[jp:` in the whole `out/` = 0 (html/txt/json/js); 11 units × ja/zh/en = 0. ja pages are `<html lang="ja">` throughout |

No change under apps/web.
