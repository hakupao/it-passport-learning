# b13 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the Rule A auditor's context; Rule D)
- Date: 2026-11-05 (Session 142)
- Scope: B3 wording patches for strategy-01-03-u06, p01–p07 (7 `active`, 0 retired; `patches/strategy-01-03-u06.json`), checked against the Rule A findings
  (`strategy-01-03-u06.ruleA.md` L1–L3) and the merged unit `data/ip/textbook/units/strategy-01-03-u06.json`
  (sha256 `d808829680c7260f…`, identical to `.planning/v2/strategy-01-03-u06/merged.json`).
  Patch base `base_sha256` `c4fb95d80304fdc7…` = `.planning/v2/strategy-01-03-u06/parts/b13-u06-a1/strategy-01-03-u06.loc.r0.json`.
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, and the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names).

## 0. Method

Same as `b12_patch_rereview.md` §0, unit strategy-01-03-u06:

1. Application check (script): every string field of the unit is walked; each `after` must appear, and `before` must not survive anywhere.
2. Base → unit diff (script): every string field present in the patch base (`loc.r0.json`) is compared with the merged unit, so any change other than the 7 patches would show.
3. Derived-field check: `definition_* / explanation_* / memory_hook_*` = notation-stripped `one_* / detail_* / hook_*`, `summary.key_points_*` = notation-stripped `key_points_*`.
4. D-198: normalized LCS and 12-char windows (exact; ≤2 substitutions; ≤2 substitutions with katakana ≥4 / alnum masked, windows with <6 real chars skipped) for each changed jp text (fragment and whole field) against stem (`stem_jp_clean`, fallback `stem_jp`) + choices of all 90 questions of topic strategy-01-03; LCS also against all 2900 questions. Normalization differs from the Rule A script, so absolute values are this script's.
5. D-195 / D-200 via validate.
6. Manual reading of each patched field in context: qualifier scope, cross-field consistency (`terms[3].detail_*`, `terms[3].analogy_*`, `pairs[0].rows[2]`), the analogy against `terms[0].fig` and `terms[0].points` (D-204), D-205.
7. `scripts/textbook-v2-validate.mjs` / `scripts/textbook-v2-parity.mjs`; `npx vitest run src/lib/textbook`.

Not established: the unit file carries the whole uncommitted v1 → v2 rewrite (`git diff --stat` 806 lines); this review covers the patches (and shows the merged unit differs from the patch base only by them), not the rewrite itself, which is the Rule A file's scope. The two other modified files (`apps/web/src/lib/textbook/__fixtures__/v2-units.v1terms.json` +22 = the unit's 4 v1 term names; `data/ip/textbook/unit_minutes.json` u06 13 → 26) are outside the patch scope and were only looked at, not reviewed.

## 1. Script results (fresh, 2026-11-05)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-03-u06
✓ strategy-01-03-u06 unit: 0 issues (data/ip/textbook/units/strategy-01-03-u06.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-03-u06
✓ strategy-01-03-u06 parity: 24 locations, 0 diff
EXIT=0
$ (apps/web) npx vitest run src/lib/textbook
 Test Files  13 passed (13)
      Tests  162 passed (162)
```

Application: 7/7 `after` present; `before` remnants anywhere in the unit: 0.

| Patch | `after` found in | `before` found |
|---|---|---|
| p01 | `terms[2].detail_zh`, `terms[2].explanation_zh` | 0 |
| p02 | `key_points_jp[3]`, `summary.key_points_jp[3]` | 0 |
| p03 | `key_points_zh[3]`, `summary.key_points_zh[3]` | 0 |
| p04 | `key_points_en[3]`, `summary.key_points_en[3]` | 0 |
| p05 | `terms[0].analogy_jp` | 0 |
| p06 | `terms[0].analogy_zh` | 0 |
| p07 | `terms[0].analogy_en` | 0 |

Base → unit: exactly 7 string fields changed (the 7 patched fields); 98 strings exist only in the unit (merge-generated derived fields), 1 only in the base (`.stage` = `loc`, workflow marker). Structure otherwise equal.

Derived fields follow: 48 derived strings checked (12 term-level × 3 languages + 4 key_points × 3), mismatch 0. `explanation_zh` of `terms[2]` (p01) and `summary.key_points_*[3]` (p02–p04) carry the new wording. `analogy_*` has no derived copy.

D-198 (topic = 90 questions; all = 2900):

| Patch | Text | Topic LCS (nearest) | Topic 12-char windows exact / near / masked-near | All-2900 LCS |
|---|---|---|---|---|
| p02 | fragment | 4 `を受ける` (2009h21a-q092) | 0 / 0 / 0 | 6 `は原則として` (2019h31h-q032, other topic) |
| p02 | whole `key_points_jp[3]` | 4 (same) | 0 / 0 / 0 | 6 (same) |
| p05 | fragment | 2 `ころ` (2011h23a-q006) | 0 / 0 / 0 | 4 `は最後の` |
| p05 | whole `analogy_jp` | 4 `のような` (2019r01a-q034) | 0 / 0 / 0 | 6 `のようなもの` |

No copying: the longest overlaps are particles and a common adverb phrase. p01 / p03 / p04 / p06 / p07 are zh / en only (no jp source to copy).

## 2. Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[2].detail_zh` (+ explanation) | L1 (D-205) | Yes: zh now marks the listed items as examples (例如…等), = jp 例えば…など / en "items such as" / figure column「（示例）」 | LOW 記録のみ, §4 obs. 2 (例如 + 等 slightly redundant, standard collocation) | OK |
| p02–p04 | `key_points_*[3]` (+ summary) | L2 | Yes (§3.1) | LOW-cosmetic 記録のみ, §4 obs. 3 (en adverb position) | OK |
| p05–p07 | `terms[0].analogy_*` | L3 | Yes (§3.2) | No | OK |

## 3. Focused checks

### 3.1 L2 — 原則として in three languages

- Scope: jp 仕入税額控除を受けるには、原則として、…適格請求書の保存が要る — the qualifier governs the requirement (保存が要る), not the name clause before it (通称がインボイス制度 stays categorical, correctly). zh 原则上需要保存 (必须 removed; the only 必须 hits in the unit were this field and its summary copy → now 0). en "in principle requires keeping" — same scope. Three languages match.
- Consistency with `terms[3].detail_*` sentence 3 (purchases from unregistered businesses: 原則として / 原则上 / "in principle" no credit): key point and detail now carry the same strength; the key point states the positive rule, the detail its negative side, same qualifier. Consistent also with `terms[3].one_*` (receiving and keeping a qualified invoice lets the buyer claim the credit — sufficient-condition form) and `terms[2].points` / `terms[3].points` (issuer = registered business; seller issues, buyer keeps).
- Factual check (D-205): 原則として is correct and adds no version-bound content — exceptions exist where the credit is allowed without keeping a qualified invoice (book-only retention for specified small transactions) and the time-limited transitional relief for purchases from unregistered businesses; the patch names neither (writer does not add amended contents, D-205 分工). No new restriction, no generalisation, no dropped qualifier.
- 2013h25a-q006 / 2010h22a-q019: both are cited on `terms[1].points[0]` (法人税: tax is deducted after extraordinary items, the remainder is net income) and back `key_points_*[2]` / `pairs[0].rows[2]`; none of these fields was changed (base → unit diff = 7 fields only). `key_points_*[3]` concerns the invoice system and cites no question; no question in topic strategy-01-03 asks about consumption tax / invoices (Rule A §1-2). The other 原則として in the unit (`pairs[0].rows[2].b_*`: no income → corporate tax in principle not arising) is a different rule and does not interact with the patched text. No conflict.
- `terms[3].analogy_*` (coupon accepted only with an official stamp; only an invoice with a registration number lets you subtract the tax) still states the rule without 原則として. Rule A L2 recorded this as acceptable (an image of the principle, carries nothing a 考点 / detail denies); with the key point now qualified, the unqualified wording is confined to the analogy. Unchanged, record only (§4 obs. 1).

### 3.2 L3 — analogy time order vs the figure (D-195 §6 / D-204)

- Before: 水を最初に注いだのは最後の買い手 / 最先往桶里倒水的 / "was poured in by the final buyer" put the final buyer first in time, against `terms[0].fig` (rows: manufacturer sells → retailer sells → consumer; manufacturer remits 200, retailer 300, total 500 = consumer's burden).
- After: 水の出どころは最後の買い手 / 水的来源是 / "comes from" — names the source, not a time. Gone in all three; no time word remains in the analogy. Present tense in en now matches sentence 1.
- Order check: the money actually moves consumer → retailer (500) → manufacturer (200 of it, via the purchase price), and each shop hands its own share to the state (analogy sentence 1, unchanged) — the brigade from the buyer through the shops is consistent with the figure's amounts; the figure's row order is the transaction order, which the analogy no longer contradicts.
- D-204: `terms[0].points[0]` (the business files and pays; the consumer bears but never pays it) — the image says the buyer is the source and the shops carry it to the state, i.e. the consumer bears and does not hand it over; the point is reinforced, not denied. `points[1]` (pay the difference, not the collected tax) matches "only its own share". `detail_*` sentence 3 (sum of payments = consumer's burden) matches "the water comes from the final buyer". No image a 考点 denies.
- zh / en: 来源 / "comes from" = jp 出どころ; second clause (店は運び役 / 商家只是搬运的人 / "the shops are just the carriers") unchanged and equal across languages.

### 3.3 L1 — zh 例如

- `terms[2].detail_zh` sentence 2 now reads 要记载例如开具方经营者的登记号码、适用税率、按税率区分的消费税额等事项; explanation_zh follows. jp / en unchanged and already exemplary. Three languages now match on D-205 (the list is not a closed, version-bound list). Validate B6 / zh-term warnings: 0.

## 4. Observations

Records only, no fix:

1. LOW, pre-existing (Rule A L2 record): `terms[3].analogy_*` keeps the unqualified 初めて / 才能 / "Only … lets you". An image of the principle; the qualified key point and detail now carry the exception. No D-204 conflict.
2. LOW-cosmetic, p01 zh: 例如 … 等事项 marks the example twice (例如 + 等). This is a standard zh collocation and reads naturally; it matches jp 例えば … など, which has the same double marking.
3. LOW-cosmetic, p04 en: "claiming the input tax credit in principle requires keeping" — the adverb after the noun phrase could momentarily attach to "credit"; the reading "in principle requires" is the natural one and the meaning is unchanged. Optional alternative if desired: "… and, in principle, claiming the input tax credit requires keeping …" (not required).
4. Pre-existing Rule A L4–L10 are untouched by the patches and remain as recorded there.

## 5. Overall verdict

- HIGH introduced or remaining from patched findings: 0
- MEDIUM introduced or remaining: 0
- LOW introduced: 建議修 0; 記録のみ / cosmetic 2 (obs. 2, 3); pre-existing recorded 1 (obs. 1)
- L1, L2, L3: resolved in all patched fields and their derived copies (§3)
- D-205: p01 restores the 例示 marker in zh; p02–p04 add a correct qualifier without version-bound contents
- D-198: no copying (topic-wide 12-char windows 0 / 0 / 0 on all patched jp texts; LCS ≤ 4 topic-wide, ≤ 6 over 2900)
- validate 0 issues / 0 warnings, parity 24 locations 0 diff, vitest textbook 162/162

**PASS** — all 7 active patches are applied, derived fields follow, the merged unit differs from the patch base only by these 7 fields, L1–L3 are resolved, and no new HIGH / MEDIUM is introduced. No fix is required.
