# b50 B3 patch re-review — technology-13-34 u06–u07 (グラフ理論の基礎 / 離散数学の応用(待ち行列と最適化), Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audits, and I share no context with them (Rule D). My scripts are my own, under scratchpad `b50rv/`: `check.mjs` is adapted from `rr/check.mjs` (unit map changed; base sha256, unit-level replay against `manifest.v1`, net remnant and Rule A verbatim checks added), and `d198.mjs` is new (LCS + jp 12-char windows against the topic sources).
- Date: 2026-11-08 (Session 150)
- Scope: the B3 wording patches for technology-13-34 u06–u07. **12 are `active`, 0 retired**: u06 p01–p07 / u07 p01–p05 (`patches/technology-13-34-u0{6,7}.json`).
  - Mapping to Rule A prescriptions:
    - u06 (PASS, 建議修 L1 / L5 / L8): L1 → p01–p03 (`terms[2](辺).analogy_jp/zh/en`); L5 → p04–p06 (`terms[3](エッジ).detail_jp/zh/en`); L8 → p07 (`terms[2].hook_en`)
    - u07 (PASS, 建議修 L1–L3): L1 → p03–p05 (`unit.unit_summary_jp/zh/en`, unit-level); L2 → p01 (`terms[0].one_en`); L3 → p02 (`overview_rows[0].extra_en[1]`)
  Every 建議修 is covered. LOWs marked 記録のみ (u06 L2–L4 / L6 / L7, u07 L4–L9) are not patched and not re-ruled here.
- Pre-patch bases, located by sha256 = `base_sha256`:
  - u06 `data/ip/textbook/.planning/v2/technology-13-34-u06/parts/b50-u06-a1/technology-13-34-u06.loc.r1.json` `a075d680dad6f037…`
  - u07 `…/technology-13-34-u07/parts/b50-u07-a1/technology-13-34-u07.loc.r0.json` `ebbfa39ab7b75f1c…`
  - u07 unit-level (p03–p05): `v1Sha256(manifest)` of `…/technology-13-34-u07/manifest.json` = `df09d86928b2439a…` = `base_sha256` (computed with `scripts/textbook-v2-patch.mjs` `v1Sha256`).
- Merged units (current) `data/ip/textbook/units/technology-13-34-u0N.json` sha256: u06 `714b598b4d535e03…` / u07 `603f08875a3a6a1b…`. They differ from their bases only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b49_patch_rereview.md` §0. Unit-level patches (`unit.*`) are replayed on `manifest.v1` and their base is checked against `v1Sha256(manifest)`. Topic technology-13-34 has 32 questions, so there are 160 source strings per language.

1. **Application check** (`b50rv/check.mjs`): base sha256; `before` once in the base field (and once at its replay step); replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted), raw and marker-stripped; before / after verbatim in the Rule A file.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b50rv/d198.mjs`, all 12 active patches): longest common substring of the `before` span and of the `after` span against the 160 sources per language (stem_jp_clean / translated stem + choices); jp 12-char windows (≤2 substitutions, punctuation and whitespace removed) for the jp patches.
4. **Cited-question checks**: none of the patched fields carries a qid or a 考点. The nearest cited questions (u06: 2010h22a-q066 directed edges, 2016h28h-q033 route times; u07: none for 待ち行列) were checked only for wrong-option support (§2).
5. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (§3).
6. **Gates** (each on both units): `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b49): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u06 156 / u07 82) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-34-u06
✓ technology-13-34-u06 unit: 0 issues (data/ip/textbook/units/technology-13-34-u06.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-34-u06
✓ technology-13-34-u06 parity: 25 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-34-u07
✓ technology-13-34-u07 unit: 0 issues (data/ip/textbook/units/technology-13-34-u07.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-34-u07
✓ technology-13-34-u07 parity: 18 locations, 0 diff
EXIT=0
validate --part (base): u06 loc#1 0 issues (sha256 a075d680… = base_sha256) EXIT=0
                        u07 loc#0 0 issues (sha256 ebbfa39a… = base_sha256) EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  u06 active 7 ok 7 | u07 active 5 ok 5 | issues [] for both
  part-level: base sha = base_sha256 for all 9; before count in base = 1 and at replay = 1 for all 9; replay mismatch 0
  unit-level (u07 p03/p04/p05): base_sha256 = v1Sha256(manifest) df09d869…; before count in manifest.v1 = 1; replay = unit.unit_summary_jp/zh/en
  changed base-present paths = patched fields + 'stage' (u06 7+1 / u07 2+1); unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata)
  derived checked 69 / 30, mismatch 0 (u06 terms[3].explanation_jp/zh/en, terms[2].memory_hook_en; u07 terms[0].definition_en: true)
  bold counts unchanged in all 12; [[jp:]] counts unchanged except u06 p05 (terms[3].detail_zh 0→1) / p06 (terms[3].detail_en 2→3) — intended (§3.2)
  memory_hooks hooked-terms pairing: u06 6/6, u07 2/2 per language, bad 0
  net before remnant (marker-stripped): 0 for all 12; raw: 0 except u06 p05 / p06 = 1 each (see below)
  ruleA verbatim miss: u06 [] | u07 []
```

Raw remnant 1 for u06 p05 / p06: the `before` (看作边（edge）。 / "are sometimes treated as edges.") is a prefix of the `after`, and the derived `terms[3].explanation_zh/en` carry the marker-stripped `after`, which the raw `after` subtraction cannot match. The marker-stripped count is 0, so these are the patched text itself, not a remnant.

**Application.** All 12 `before` strings occur exactly once in their base field, all 12 `after` strings are present, replay reproduces every patched field. All 12 before / after pairs are the Rule A text verbatim (including the two `[[jp:エッジコンピューティング]]` markers, which the Rule A L5 text prescribes).

D-198, before → after (`d198.mjs`, 160 sources per language; jp fields also carry the window column):

| Patch | Lang | LCS `before` span (nearest source) | LCS `after` span (nearest source) | jp 12-char windows before / after |
|---|---|---|---|---|
| u06 p01 | **jp** | 3 (" 2 ") | 4 (つながり, 2010h22a-q066 stem, generic) | 0 / 0 |
| u06 p02 | zh | 1 | 2 (一起) | — |
| u06 p03 | en | 10 (" between t") | 8 (" connect", 2010h22a-q066 stem) | — |
| u06 p04 | **jp** | 4 (がある。) | 4 (がある。) | 0 / 0 |
| u06 p05 | zh | 2 | 4 (。另外，) | — |
| u06 p06 | en | 8 | 12 (" close to th", 2014h26a-q096 stem, generic) | — |
| u06 p07 | en | 4 ("The ") | 4 ("The ") | — |
| u07 p01 | en | 7 | 8 (" in the ") | — |
| u07 p02 | en | 11 ("Forecasting") | 15 (" communication ", 2009h21a-q046 stem, generic) | — |
| u07 p03 | **jp** (unit) | 3 (グラフ) | 3 (用した) | 0 / 0 |
| u07 p04 | zh (unit) | 2 | 2 (概率) | — |
| u07 p05 | en (unit) | 7 | 13 (" probability ", 2024r06-q083 stem, generic) | — |

No patch adds a copy-level overlap: every after-span hit is a single common word or function-word run (≤ 15 chars in en, ≤ 4 in jp / zh), 0 jp windows before and after in every jp field. None of the hits is with a wrong option of a cited question (the q066 hits are in the stem; q046 / q083 / q096 are not cited by these fields).

## 2. Per-patch verdict

| Unit / IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| u06 p01–p03 | `terms[2](辺).analogy_jp/zh/en` | L1 | Yes (§3.1): the conclusion is now つながり / 连在了一起 / connects, which is direction-neutral like `terms[2].one` (つながりや関係があること). It no longer asserts two-way travel, so it does not overlap the directed-graph scope (`terms[4]` 一方通行の道路網; 逆向きは成り立たない). 2010h22a-q066 wrong options (reversed arrows) not supported; 2016h28h-q033 (所要時間 on each road) still matches the second half. 三語 same image | No | OK |
| u06 p04–p06 | `terms[3](エッジ).detail_jp/zh/en` (+ explanation) | L5 | Yes (§3.2): adds the separate sense of エッジ in エッジコンピューティング (the network periphery, near users / devices), so 「ネットワーク分野のエッジ = 回線」 is no longer the only network reading. Fact correct. D-195: detail 2 → 3 sentences (≤ 3) in all three. D-202: the `[[jp:エッジコンピューティング]]` origin is in detail_jp (same field, sentence 3); zh 边缘计算 = zh_terms.json (`エッジコンピューティング: 边缘计算`) | No (obs. 2) | OK |
| u06 p07 | `terms[2](辺).hook_en` (+ memory_hook_en, summary.memory_hooks_en[2]) | L8 | Yes: "The kanji [[jp:辺]] is …" → derived "The kanji 辺 is …" and "Edge: The kanji 辺 is …"; the double 辺 辺 is gone. `[[jp:]]` count 1 → 1 (the plain 辺 was removed, the marker kept) | No | OK |
| u07 p01 | `terms[0](待ち行列).one_en` (+ definition_en) | L2 | Yes: "A **queue** ([[jp:待ち行列]]), in the sense of a waiting line, is a model …" — matches term_en "Queue (Waiting Line)" and separates it from the data-structure queue ([[jp:キュー]]) in `terms[0].points[1].text_en`. jp / zh unchanged (待ち行列 / 排队 already distinct) | No (obs. 3) | OK |
| u07 p02 | `overview_rows[0].extra_en[1]` | L3 | Yes: "communication lines" = jp 回線 / zh 线路; no longer readable as the waiting line (line length) used elsewhere in the unit | No | OK |
| u07 p03–p05 | `unit.unit_summary_jp/zh/en` | L1 | Yes (§3.3): 確率と統計 / 概率与统计 / probability and statistics = `terms[0].detail` (平均の待ち時間や列の長さを確率と統計で見積もる). 三語 parity ✓ | No (unit_index drift, obs. 1) | OK |

## 3. Focused checks

### 3.1 u06 p01–p03: 辺 analogy and the directed-graph scope (D-204)

- After: jp 「町と町を結ぶ道路のようなもの。道路があれば 2 つの町がつながり、道路ごとに所要時間を書き込んでおけば遠回りかどうかも分かる。」 / zh 「…有公路，两座城镇就连在了一起；…」 / en "Think of the roads between towns. A road connects two towns, and if you write the travel time on each road, you can tell whether a route is a detour."
- `terms[2].one` (三語) defines 辺 as a line showing that a つながり / 关联 / connection exists — the new analogy conclusion uses exactly that notion, with no direction. `terms[4]` (有向グラフ) introduces direction itself (一方通行の道路網), and `terms[5]` (無向) says one undirected edge = two opposite arrows; neither is contradicted.
- q066 (wrong options = some arrows reversed): the analogy says nothing about direction, so it gives no reason to reverse one. q033 (route time = sum of edge times) agrees with the second half (unchanged).
- **Resolved, D-204 scope consistent.**

### 3.2 u06 p04–p06: エッジコンピューティング sentence, D-202 markers

| Patch | Added marker | jp origin present | Context |
|---|---|---|---|
| p05 | `[[jp:エッジコンピューティング]]` (detail_zh) | Yes: terms[3].detail_jp sentence 3 (after p04) 「なお、エッジコンピューティングの「エッジ」は…」 | zh term 边缘计算 = zh_terms.json; same `term[[jp:X]]` (no space) form as one_zh 「**边**[[jp:辺]]」 |
| p06 | `[[jp:エッジコンピューティング]]` (detail_en) | Yes: same jp sentence | same "word [[jp:X]]" form as sentence 1 ("nodes [[jp:ノード]]", "edge [[jp:エッジ]]") |

- Fact: in edge computing, "edge" = the outer end of the network, close to users and devices, where processing is done near the data source. The added sentence states only that sense and that it differs from a graph edge (= 回線・接続). Correct.
- Derived explanation_zh / en strip to 「…边缘计算エッジコンピューティング中的…」 / "…edge computing エッジコンピューティング is…" (checked; same pattern as the existing node / edge markers).
- Rule A (u06 L5) checked a patched copy with validate 0 issues; the merged unit is also 0 issues and parity 0 diff.
- **Resolved.** No new MEDIUM: the sentence does not touch a 考点 or a cited question (no エッジコンピューティング question in topic technology-13-34; the Rule A file names 2019r01a-q071 / 2023r05-q071 in another topic, which the new sentence supports, not contradicts).

### 3.3 u07 p03–p05: unit_summary_* (待ち行列 = 確率と統計)

- After: jp 「確率と統計を応用した待ち行列モデルと、最適解を求める最適化問題を学ぶ。」 / zh 「学习应用概率与统计的排队模型，以及求解最优解的最优化问题。」 / en "Learn queuing models that apply probability and statistics, and optimization problems that find the best solution."
- Agrees with `terms[0].detail` (三語, 確率と統計で見積もる / 用概率与统计来估算 / estimated with probability and statistics) and `key_points[0]` (variability of arrivals and service). No body field mentions グラフ理論 for queues.
- Where it shows: `unit_summary_*` is used by `apps/web/src/lib/sensei/textbookAnchors.ts` (AI 先生 anchor, reads the unit file = patched). `unit_index.json` `summary_jp` is only typed (`types.ts`), not rendered, as in b49 §3.4 — the stale index copy is a sync debt, not a visible defect (obs. 1).
- **Resolved, accurate.**

## 4. F-fix

No required F-fix. No patch introduces a HIGH, MEDIUM or LOW defect that needs a fix.

Optional F-fix 1 (LOW, sync only, not visible on the web): bring the index copies of the u07 summary in line with p03 (Rule A u07 L1 also names `unit_index.json`).
- `data/ip/textbook/unit_index.json` (u07 entry, `summary_jp`, line 8185) and `data/ip/textbook/.planning/v2/technology-13-34-u07/manifest.json` `index_unit.summary_jp`:
  「グラフ理論を応用した待ち行列モデルと、最適解を求める最適化問題を学ぶ。」→「確率と統計を応用した待ち行列モデルと、最適解を求める最適化問題を学ぶ。」
- Caution: `index_unit` is outside `manifest.v1`, so `v1Sha256(manifest)` (= p03–p05 base) does not change; still re-run `node --test scripts/textbook-v2-patch.test.mjs` and the u07 apply / validate after editing either file.

## 5. Observations (record only)

1. LOW (sync), u07 p03: `unit_index.json` / `manifest.index_unit.summary_jp` keep 「グラフ理論を応用した」 (patch reason = `UNIT_INDEX_NOTE`, known non-sync by design). The same entry's `rationale_jp` (planning metadata, not rendered) also says both terms presuppose graph theory (u06). Optional F-fix 1 covers summary_jp only.
2. LOW (style), u06 p05: zh contrasts 边（edge） with 边缘计算's “边缘”; in Chinese these are already different words, so the contrast is carried by the English edge / jp エッジ rather than the zh text itself. The sentence is accurate and still useful for a learner who meets エッジ in both senses. Not required.
3. LOW (style), u07 p01: "…, in the sense of a waiting line, is a model that treats a line waiting its turn…" repeats "line". Meaning clear, prescribed verbatim by Rule A. Not required.
4. Script notes:
   - u06 p05 / p06 raw remnant 1 = derived explanation_zh / en (stripped after contains before); stripped count 0 (§1).
   - `stage` meta is removed in both units (as in b19–b49).
   - ruleA verbatim misses: none.

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope (both Rule A files PASS); **0 introduced**
- LOW introduced: 0 that need a fix. Recorded: obs. 1–3. Obs. 4 is script notes.
- **Application:** 12/12 exact (replay; 9 part-level + 3 unit-level against `manifest.v1`). 0 unexplained diffs, 0 net `before` remnants (marker-stripped), derived fields follow (99 checked, 0 mismatch). 12/12 match the Rule A text verbatim. Every 建議修 (u06 L1 / L5 / L8, u07 L1 / L2 / L3) is covered.
- **D-198:** no patch adds a copy-level overlap; 0 jp windows before and after; no hit with a wrong option.
- **D-200:** no 考点 patched (not applicable). D-195: u06 terms[3].detail 3 sentences (≤ 3) in all three languages.
- **D-202:** both added `[[jp:エッジコンピューティング]]` markers (u06 p05 / p06) have their origin in jp text (terms[3].detail_jp, added by p04); zh 边缘计算 = zh_terms.json.
- **D-204:** u06 辺 analogy now direction-neutral, consistent with 有向グラフ.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 ×2
  - validate --part: 0 issues ×2 (sha256 = base_sha256)
  - parity: 0 diff ×2 (25 / 18 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 12 active patches of technology-13-34 u06–u07 are applied exactly. Each resolves its Rule A 建議修 finding, and none introduces a HIGH, MEDIUM or LOW that needs a fix. No required F-fix. One optional F-fix (sync of the u07 summary in unit_index / manifest index_unit) is available.
