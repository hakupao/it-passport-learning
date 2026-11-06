# b23 B3 patch re-review — strategy-01-01 u11 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the u11 Rule A auditor's context; Rule D)
- Date: 2026-11-06 (Session 147)
- Scope: B3 wording patches for strategy-01-01-u11 (p01–p12) — **12 `active`, 0 retired** (`patches/strategy-01-01-u11.json`), checked against the Rule A prescriptions (`strategy-01-01-u11.ruleA.md` **M1** + L1・L2 建議修; L3〜L10 記録のみ, not applied) and the merged unit `data/ip/textbook/units/strategy-01-01-u11.json` (sha256 `a6e9848213b4a578…`).
- Pre-patch base located by sha256 = `base_sha256` (all 12 patches share one base; match): `b23-u11-a1/strategy-01-01-u11.loc.r0.json` (`cdbd6a45…`; the jp part `…jp.r0.json` = `34b98a11…` is not the base).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210 and the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text, law text or term names; matched fragments ≤12 chars except en sidecar overlaps, which are project translations and are quoted as the unit's own after-span).

## 0. Method

Same as `b22_patch_rereview.md` §0 (= b21 / b20 / b19 §0), topic strategy-01-01 (62 questions; 310 source strings per language):

1. Application check (script): every string field of base and merged unit is walked. Each `after` must appear in its field; `before` (raw and notation-stripped) must not survive anywhere; every string that differs between base and unit (for paths present in the base) must be explained by a patch; the patches replayed in file order on the base must reproduce the unit's field exactly. Additionally each patch's `before` / `after` (bold stripped on both sides) was found verbatim in the Rule A file (12/12).
2. Derived-field check from the same walk (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`) for every term and key point; `summary.memory_hooks_*` by suffix match.
3. D-198 (jp patches: p01, p04, p07): LCS, 12-char window with ≤2 substitutions with and without masking (katakana runs ≥4 and alnum masked; masked windows with <6 real chars excluded), best same-length-window bigram Dice (wDice). Sources: stem (`stem_jp_clean`, fallback `stem_jp`) + all choices of every strategy-01-01 question. zh / en patches: LCS against the zh / en translation sidecars of all 62 topic questions, whole patched field before → after and the `after` span alone. Plus a per-choice + stem LCS (before → after) of p01–p12 against the cited / quiz / challenge questions 2025r07-q003, 2010h22a-q005, 2009h21a-q003.
4. D-195 / D-200 via validate; `validate --part <base>` for comparison.
5. Manual reading of each patched field in context (whole term + overview row + pairs + key_points + fig labels / captions + hook); meaning judged against 2025r07-q003's `correct_answer` and its zh / en sidecars (b18 u05 M1 / b22 u08 M1 type: apply the patched lists to the four organization items of q003).
6. Primary-source re-check of the amended-law content added by L1 (S138 §6) — fetched fresh by this reviewer (scratchpad `egov_rr/`, not the auditor's `egov/`), see §3.2.
7. `scripts/textbook-v2-validate.mjs --unit` / `scripts/textbook-v2-parity.mjs --unit`; `npx vitest run src/lib/textbook`.

Scripts: scratchpad `b23rr/check.mjs`, `b23rr/d198.mjs`, `b23rr/focus2.mjs` (adapted from the b22 re-review scripts; only unit ID / part path / focus questions changed, plus the language regex of `focus2.mjs` extended to `….label.zh` paths), `b23rr/win.mjs` (lists the jp windows).

Not established: as in b14–b22, the unit file carries the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: 102) were checked for the derived copies (step 2) and for the patched texts. The as-enacted 2013 text of 国家戦略特別区域法 is not served by e-Gov (oldest revision 2017-04-01); "制定時はなかった" is established by the absence in every pre-2020-amendment revision available (§3.2).

## 1. Script results (fresh, 2026-11-06)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-01-u11
✓ strategy-01-01-u11 unit: 0 issues (data/ip/textbook/units/strategy-01-01-u11.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-01-u11
✓ strategy-01-01-u11 parity: 26 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part …/b23-u11-a1/strategy-01-01-u11.loc.r0.json
counts {"terms":5,"figs":4,"steps":3,"points":6,"pairs":2,"key_points":4,"goals":3}
sha256 cdbd6a45d4103f5e801856af6992b9bd460bcfc0cc95225aa544c4610824057e
✓ strategy-01-01-u11 part loc#0: 0 issues
EXIT=0
$ (apps/web) npx vitest run src/lib/textbook
 Test Files  13 passed (13)
      Tests  162 passed (162)
```

Application: 12/12 `before` occur exactly once in the base field; 12/12 `after` present in their fields; replay of the patches in file order on the base reproduces every patched field exactly. Unexplained base → unit diffs in base-present paths: 0 (changed paths 12 = exactly the patched fields; only the `stage` meta key removed, as in b19–b22; `round` / `jp_round` are non-string meta keys of the part). `before` remnants: 0 (also by grep in the unit: 吸收· 0, ·清除 0, 由修正加入 0, (改正で加わった) 0).

Derived fields follow: p01–p03 → `terms[3].definition_*` (3/3 = stripped `one_*`), p04–p06 → `summary.key_points_*[2]` (3/3), p12 → `terms[2].explanation_zh`. Full walk: `definition / explanation / memory_hook` = notation-stripped `one / detail / hook`, and `summary.key_points_*` = stripped `key_points_*` — 57 checked, 0 mismatches; `summary.memory_hooks_*` suffix check 15, 0 bad (no hook was patched). 独立行政法人 occurs 8× in the unit = one_jp / one_zh / definition_jp / definition_zh / key_points_jp・zh[2] / summary.key_points_jp・zh[2]; "incorporated administrative" 4× = one_en / definition_en / key_points_en[2] / summary — nowhere else (not in `points[0]`, as prescribed).

Notation counts (bold, `[[jp:]]`), before → after, every patched field: unchanged in 12 of 12 (`terms[3].one_*` bold 5 → 5, `[[jp:]]` zh / en 1 → 1; `key_points_*[2]` bold 1 → 1; `terms[2].detail_zh` bold 1 → 1, `[[jp:データ連携基盤]]` kept; pairs cells / fig labels 0 → 0). Parity 0 diff.

D-198, before → after (one script):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest overlap of the `after` span | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| p01 | **jp** | 2025r07-q003 stem | 12 → 12 (官民データ活用推進基本法 = term) | 独立行政法人 (6, law's word = q003 item d) | 3 / 3 → 3 / 3 (all = term name, below); 0.30 → 0.27 |
| p02 | zh | 2025r07-q003 stem | 11 → 11 (term) | 独立行政法人 (6, same) | — |
| p03 | en | 2025r07-q003 stem | 78 → 78 (term name in en) | " incorporated administrative agenc" (34, = the sidecar's rendering of 独立行政法人) | — |
| p04 | **jp** | 2010h22a-q005 stem → 2025r07-q003 stem | 5 (だけでなく) → 6 (独立行政法人) | 独立行政法人 (6) | 0 / 0 → 0 / 0; 0.20 → 0.24 |
| p05 | zh | 2025r07-q003 stem | 4 (官民数据, term) → 6 (独立行政法人) | 独立行政法人 (6) | — |
| p06 | en | 2025r07-q003 stem | 31 ("public and private sector data ", term) → 34 | " incorporated administrative agenc" (34) | — |
| p07 | **jp** | 2012h24h-q028 ア → 2009h21a-q003 エ | 3 → 4 | なかった (4, generic) | 0 / 0 → 0 / 0; 0.16 → 0.10 |
| p08 | zh | 2026r08-q006 stem | 3 → 3 | 关于数 (3) | — |
| p09 | en | 2012h24a-q021 stem | 10 → 10 | "ed by the " (10, generic) | — |
| p10 | zh | 2009h21h-q029 ア | 2 → 2 | 部分 (2) | — |
| p11 | zh | 2010h22a-q005 エ | 2 → 2 | 排放 (2) | — |
| p12 | zh | 2010h22a-q005 stem | 3 → 3 (unchanged part) | 同时 (2) | — |

p01's three jp windows (`win.mjs`): offsets 0–2 of `one_jp`, all inside the term name 官民データ活用推進基本法 (12 chars) vs the law name in the q003 stem, d = 0 / 1 / 2 — the same false positive the auditor recorded (Rule A §1-3 (a)(b)(c)), present before and after; the patched span adds no window. The only new overlap anywhere is the law's own word 独立行政法人 / "incorporated administrative agency" (6 / 34), which is also q003's item d: a single legal-category word placed in the law's definition order (国・地方公共団体・独立行政法人・その他の事業者), not q003's item set / order / scene (its other three items are not named) — the D-209 all-correct exemption that the auditor pre-cleared (Rule A §4 row 2) still holds. No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52).

Per-choice check (LCS before → after vs each choice; `focus2.mjs`):
- 2025r07-q003 (correct イ = all four; wrong ア / ウ / エ = three-item combos): choices are letter combos — p01–p12 vs every choice jp / zh 0 → 0, en 2 → 2 (", "); vs stem: p01 / p02 / p04 / p05 3 → 6, p03 / p06 13 / 9 → 34 = 独立行政法人 (item d, see above); p07–p12 ≤ 6 unchanged.
- 2010h22a-q005 (グリーン IT, challenge; other unit's term): ≤ 5 before and after (generic en fragments "nment" / "sses" / "ment" / "sion"), stem ≤ 7 → ≤ 5.
- 2009h21a-q003 (CSR, challenge): ≤ 7 unchanged except p07 vs エ 2 → 4 (なかった, generic verb ending) and p03 vs エ 5 → 6 (" other").

## 2. Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[3](官民データ活用推進基本法).one_jp / _zh / _en` (+ definition) | **M1 (MEDIUM)** | **Yes** (§3.1) | No (obs. 1, 2) | OK |
| p04–p06 | `key_points_jp / _zh / _en[2]` (+ summary) | **M1** | **Yes** (§3.1) | No | OK |
| p07–p09 | `pairs[0].rows[2].a_jp / _zh / _en` | L1 建議修 | **Yes** (§3.2, primary source re-checked) | No | OK |
| p10 | `terms[0](カーボンニュートラル).fig.data.nodes[2].label.zh` | L2 建議修 | Yes: 吸收·清除 → 吸收和清除 (= `key_points_zh` 吸收和清除) | No | OK |
| p11 | `terms[0].fig.steps[2].caption_zh` | L2 建議修 | Yes: 中黒 → 顿号 吸收、清除 (= steps[1] caption 吸收和清除 in meaning; jp 吸収・除去) | No | OK |
| p12 | `terms[2](スーパーシティ法).detail_zh` (+ explanation_zh) | L2 建議修 | Yes: 「…等领域可以跨越领域，同时、整体地使用规制特例」→「…等多个领域的规制特例能够跨领域同时、整体地使用」— subject / object now clear; = jp 分野をまたいで、規制の特例を同時にまとめて使える and `pairs[0].rows[1].b_zh` 同时、整体地使用多个领域的规制特例; sentences 3 → 3 | No | OK |

Not applied (記録のみ by the auditor): L3〜L10 — no patch expected.

## 3. Focused checks

### 3.1 p01–p06 (M1) — 官民データの保有主体 vs 2025r07-q003

- After: one_jp「国や自治体、独立行政法人、民間の事業者などが持つ**官民データ**」/ zh「国家、地方政府、独立行政法人和民间企业等所持有的」/ en "held by the state, local governments, incorporated administrative agencies, private businesses and others"; key_points_jp[2]「行政機関のデータだけでなく、独立行政法人や民間の事業者などが事業で扱う電子データも含まれる」/ zh「…也包括独立行政法人、民间企业等在业务中处理的…」/ en "…electronic data that incorporated administrative agencies, private businesses and others handle…" (= auditor's M1 text verbatim, 6/6).
- Law (e-Gov current text, fetched fresh: 官民データ活用推進基本法 428AC1000000103 第二条第一項): holders = 国若しくは地方公共団体又は独立行政法人（通則法第二条第一項）若しくはその他の事業者. The patched lists follow that order and both now end open (など / 等 / "and others"); key_points[2] separates 独立行政法人 from 行政機関, matching the law (独立行政法人 is named as its own category). Nothing the law includes is excluded.
- Applied by hand to q003's four items (a prefectural office, b a university, c an electric power company, d an incorporated administrative agency; correct イ = all four):
  - a → 自治体 / 行政機関; c → 民間の事業者; d → now **named** (独立行政法人) in one and key_points → wrong ア (the combo without d) loses the reading the old closed two-class text gave it.
  - b (university) → not named; private universities fall under 民間の事業者, national / public university corporations under the law's その他の事業者 = the unit's 「など」. Before the patch key_points[2] was closed (民間の事業者が, no など) and the university fit neither class → lean to wrong エ (the combo without b); after, both one and key_points end in など and the list visibly goes beyond 官 / 民 (独立行政法人 is neither), so the text no longer supplies a reason to drop b. Naming 大学 would have imported q003's item set (D-198 (iii)), which the auditor deliberately avoided — the right call.
  - zh / en sidecars of q003 render d as 独立行政法人 / "Incorporated administrative agency" — identical to the patched zh / en, so a zh / en reader maps d directly; zh 民间企业等 / en "private businesses and others" are open as jp. No zh / en after-span moves toward ア / ウ / エ (choices are letter combos; per-choice LCS 0–2).
- Consistency: `points[0]` (行政機関に限らず民間の事業者など…, unchanged, qid q003) agrees and stays free of item words; hook (官 = 役所 / 民 = 民間 → 両方のデータが対象) unchanged as prescribed — read next to the patched one it is a name clue, not a closed list (obs. 2); overview_rows[3] / fig (施策の例) do not state holders. **M1 resolved.**

### 3.2 p07–p09 (L1) — 国家戦略特区法 制定時 2013 / 2020 年改正: independent primary-source re-check (S138 §6)

What I fetched (this reviewer, 2026-11-06, scratchpad `egov_rr/`):
- `GET https://laws.e-gov.go.jp/api/1/lawdata/425AC0000000107` (current text, LawNum 平成二十五年法律第百七号, Promulgate 2013-12-13).
- `GET https://laws.e-gov.go.jp/api/2/law_revisions/425AC0000000107` (75 revisions; oldest served = `…_20170401_426AC0000000051`; the entry for 令和二年法律第三十四号 = 「国家戦略特別区域法の一部を改正する法律」, promulgated 2020-06-03, enforced 2020-09-01).
- `GET https://laws.e-gov.go.jp/api/2/laws?law_num=令和二年法律第三十四号` → `total_count: 0` (the amending act is not served as a standalone law); 令和2年法律第34号 was therefore verified via its `law_revisions` entry (title / promulgation / enforcement above) and the `law_data` of that revision (next line).
- `GET https://laws.e-gov.go.jp/api/2/law_data/<revision>` for three revisions: 2017-04-01 (H26 法 51), the revision immediately before R2 法 34 (`…_20200901_501AC0000000063`), and R2 法 34 (`…_20200901_502AC0000000034`).

Results:
- 「データ連携基盤」 count: 2017 revision **0**, pre-R2/34 revision **0**, R2/34 revision **7**, current **7** → the data linkage platform provisions enter with 令和2年法律第34号 (2020).
- Current 第二条第二項 (「特定事業」の定義) contains the item defining 「国家戦略特別区域データ連携基盤整備事業」 (区域データを収集・整理し先端的区域データ活用事業活動の実施主体に提供する事業); 第三十七条の八 (基盤の規格整備・互換性確保の援助) also present → the auditor's "現行本文に対しては『定めはない』は誤り" holds, so the version qualifier is needed.
- 「制定時 (2013 年)」: law number 平成二十五年法律第百七号, promulgated 2013-12-13 = `pairs[0].rows[0].a`「2013 年に制定」. The as-enacted text itself is not served (oldest = 2017); absence in all served pre-2020 revisions + first appearance in the R2/34 revision supports "as enacted, none" (an add-then-delete-then-re-add history is not indicated by any revision title). 「2020 年の改正」 = R2 法 34 (other 2020 amendments R2 法 36 / 61 / 72 do not add it: the pre-R2/34 revision timestamped 2020-09-01 has 0) and = `pairs[0].rows[0].b`「その法律を 2020 年に改正した内容」 and `terms[2].detail`「2020 年の法改正で設けられた」.
- Patched cells: jp「制定時 (2013 年) はデータ連携基盤の定めがなかった (2020 年の改正で加わった)」/ zh「制定时（2013 年）没有…（2020 年修正后加入）」/ en "As enacted (2013), no provisions on a data linkage platform (added by the 2020 amendment)" (= auditor's L1 text verbatim, 3/3); past tense + version + year now state a true, version-bound claim (D-205 / D-210 type satisfied). Same years as the row above; no new number beyond what rows[0] already states. **L1 resolved; amended-law content verified.**

### 3.3 Other requested checks

- Dropped qualifiers / new restrictions: none — p01–p06 open a closed list (add the law's category + など), p07–p09 add a version qualifier, p10–p12 are zh punctuation / syntax only (meaning = jp).
- D-204: one ↔ key_points[2] ↔ points[0] now give the same open range; pairs a-column consistent with rows[0] and with スーパーシティ detail.
- D-205 / D-210: the only version-bound additions are 2013 / 2020, verified (§3.2). q003 (令和 7 年度) relies on the current 第二条 — unaffected.
- D-200 / D-195: validate 0 issues; sentence counts unchanged in every patched field; key_points_jp[2] is one sentence.

## 4. Observations

No F-fix (no 建議修) from this re-review.

Records only, no fix:

1. LOW, p03: en one now has "…private businesses and others, along with the roles of the state and others" — "and others" twice in one sentence (style; the first renders など of the holder list, the second 国など of the roles; meaning correct). Auditor's prescribed text.
2. LOW, pre-existing / not in scope: `terms[3].hook_*` still frames the coverage as 役所 + 民間 (両方). With the patched one / key_points it no longer closes the range; the auditor kept it on purpose (Rule A M1 修正案). A later pass could add a など-type hedge if hooks are revisited.
3. LOW, p01–p06: 独立行政法人 / "incorporated administrative agency" coincides with q003 item d (6 / 34 chars). It is the law's own category word in the law's definition order, a single word, not q003's item set or order → D-209 all-correct exemption kept (as pre-cleared in Rule A §4).
4. LOW, method: the as-enacted 2013 text of 国家戦略特別区域法 is not served by e-Gov (revisions from 2017-04-01); "制定時はなかった" rests on the served pre-2020 revisions (0 occurrences) and the R2 法 34 revision (first 7 occurrences).
5. LOW, p11: caption_zh uses 吸收、清除 while label.zh / key_points_zh use 吸收和清除 — both natural zh; auditor's prescribed text.
6. Open from Rule A, unchanged: L3〜L10 (記録のみ) — not part of B3.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: in-scope **1 resolved** (M1 by p01–p06); **0 introduced**
- LOW introduced: 建議修 0; 記録のみ 5 (obs. 1–5; obs. 2 pre-existing, obs. 4 a method limit)
- Application 12/12 exact (replay), 12/12 = the Rule A prescribed text, derived fields follow (57 checked, 0 mismatch), 0 unexplained base → unit diffs
- D-198: jp windows 3 / 3 → 3 / 3 for p01 (all inside the term name, unchanged), 0 / 0 → 0 / 0 for p04 / p07; only new overlap = the law's word 独立行政法人 (q003 item d, exempt); zh after-spans ≤ 6, en ≤ 34 (that word) or generic
- Primary source: 国家戦略特別区域法 第二条第二項 (現行) and 令和2年法律第34号 re-checked on e-Gov by this reviewer; 官民データ活用推進基本法 第二条第一項 re-read
- validate 0 issues, parity 26 locations 0 diff, vitest textbook 162/162

**PASS** — all 12 active patches of strategy-01-01-u11 are applied exactly (replay reproduces every patched field, derived fields follow, no other base-present path changed) and each is the auditor's prescribed text. The MEDIUM is resolved: one and key_points[2] now list 国・自治体・独立行政法人・民間の事業者 in the order of 第二条第一項 and end open (など / 等 / "and others"), so applied to 2025r07-q003 the text names item d and no longer gives a reason to drop d (wrong ア) or the university (wrong エ, now covered by the open など instead of a closed 官 / 民 pair); nothing the law includes is excluded and no zh / en rendering leans to a wrong combo. The L1 version qualifier (制定時 2013 / 2020 年改正) is true per e-Gov: データ連携基盤 is absent from every served pre-2020 revision and first appears with 令和2年法律第34号, and the current 第二条第二項 defines 国家戦略特別区域データ連携基盤整備事業. The L2 zh fixes match jp. No new HIGH / MEDIUM.
