# b12 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer; Rule D)
- Date: 2026-11-05 (Session 142)
- Scope: B3 wording patches for strategy-01-03-u01 (p01–p07), u02 (p01–p05, p08–p16; p06 / p07 retired), u03 (p01–p16), u04 (p01–p13), u05 (p01–p15)
  — 65 `active`, 2 retired (`patches/strategy-01-03-u01.json` … `-u05.json`), checked against the Rule A findings
  (`strategy-01-03-u01.ruleA.md` L1–L2; `-u02` L1–L6; `-u03` M1, L1–L4; `-u04` L1–L5; `-u05` L1–L5) and the merged units
  `data/ip/textbook/units/strategy-01-03-u0{1..5}.json` (sha256 u01 `1e159c284eaf225b…`, u02 `1c9f9b418ec5e466…`, u03 `6e0a98ca379576dd…`,
  u04 `a2812a82308b85d9…`, u05 `ad660870cd9c37e2…`).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, and the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names).

## 0. Method

Same as `b10_patch_rereview.md` §0, topic strategy-01-03:

1. Application check (script): every string field is walked; each `after` (raw and notation-stripped) must appear, and `before` must not survive outside a field that already contains `after`. Retired `after` texts must be absent.
2. Derived-field check from the same walk (`definition_*`, `explanation_*`, `memory_hook_*`, `overview.intro_*`, `summary.*`).
3. D-198: normalized LCS, 12-char window with ≤2 substitutions, with and without katakana / alnum masking, for each changed jp text (fragment and whole field) against stem + choices of every qid cited in the unit, and against all questions of topic strategy-01-03. Semi-global edit distance (ed) and best same-length-window bigram Dice (wDice). Stems are `stem_jp_clean`, falling back to `stem_jp` where absent (e.g. 2024r06-q030, 2011h23a-q023, 2009h21h-q016, 2016h28a-q017). Normalization differs from the Rule A scripts, so absolute values differ from the Rule A files; before → after is measured here with one script.
4. D-195 / D-200 via validate.
5. Manual reading of each patched field in context; meaning judged against the cited question and its `correct_answer`.
6. Cross-unit zh / en, u01–u05: counts of the patched words and alternatives.
7. `scripts/textbook-v2-validate.mjs` / `scripts/textbook-v2-parity.mjs` per unit; `npx vitest run src/lib/textbook`.

Not established: the unit files carry the whole uncommitted v1 → v2 rewrite (`git diff --stat` 829 / 1023 / 927 / 1055 / 848 lines), so this review shows the patches are present and correct in context, not that nothing else changed since `base_sha256`.

## 1. Script results (fresh, 2026-11-05)

```
✓ strategy-01-03-u01 unit: 0 issues, 3 warning(s)   validate exit 0 | parity: 23 locations, 0 diff  exit 0
✓ strategy-01-03-u02 unit: 0 issues                 validate exit 0 | parity: 26 locations, 0 diff  exit 0
✓ strategy-01-03-u03 unit: 0 issues                 validate exit 0 | parity: 24 locations, 0 diff  exit 0
✓ strategy-01-03-u04 unit: 0 issues, 2 warning(s)   validate exit 0 | parity: 32 locations, 0 diff  exit 0
✓ strategy-01-03-u05 unit: 0 issues                 validate exit 0 | parity: 23 locations, 0 diff  exit 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

The 5 warnings are pre-existing and in unpatched fields: u01 zh-term 利益→利润 at `terms[2].points[2].text_zh` and jp-origin 原価 ×2 at `terms[2].points[0]` (u01 Rule A L7: false positives, no fix); u04 jp-origin 固定資産 ×2 at `terms[2].points[1]` (u04 Rule A L7: false positive, no fix).

Application: 65/65 `after` present. `before` remnants anywhere in the units: 0. Retired u02 p06 / p07 `after` texts: 0 hits (the active p15 / p16 deliberately keep `[[jp:損益分岐点]]` at its existing position).

Derived fields follow: `explanation_*` (u03 p13–p15; u04 p10–p12 [p12 notation-stripped], p13), `overview.intro_*` (u04 p07–p09), `summary.key_points_*` (u02 p14; u03 p04–p06), `memory_hook_*` + `summary.memory_hooks_*[2]` (u05 p10–p12). Fields with a same-text twin follow too: u02 p01–p04 (`overview_rows[4].extra_*[0]` = `pairs[1].rows[1].b_*`, en already equal), u04 p03 (`pairs[0].rows[0].b_*` already carried the new wording in all three languages). `points[*]`, `analogy_*`, `fig`, `goals` other than intro have no derived copy.

D-198, before → after (one script):

| Patch | Nearest source | LCS | ed | wDice | Longest overlap after patch |
|---|---|---|---|---|---|
| u01 p01 | topic stem (not cited) | 3 → 3 | 0.73 → 0.82 | 0.20 → 0.13 | particle phrase |
| u01 p04 | topic stem (not cited) | 5 → 5 | 0.74 → 0.78 | 0.28 → 0.19 | `期の売上高` |
| u02 p01 / p03 | 2013h25h-q009 stem | 5 → 7 | 0.47 → 0.58 | 0.43 → 0.35 | `たりの変動費が` (1 個あたりの変動費) |
| u02 p05 | 2018h30a-q027 stem | 9 → 9 | 0.72 → 0.77 | 0.26 → 0.26 | term 損益分岐点売上高 + particle |
| u03 p01 | 2009h21a-q010 stem | 8 → 8 | 0.27 → 0.57 | 0.70 → 0.37 | term キャッシュフロー |
| u03 p04 | 2016h28a-q011 ア | 6 → 6 | 0.54 → 0.67 | 0.59 → 0.45 | `売掛金の増加` (the choice is this phrase only) |
| u03 p07 | 2010h22a-q021 stem | 4 → 4 | 0.89 → 0.86 | 0.07 → 0.09 | `に分けて` |
| u03 p10 | topic stem | 2 → 4 | 0.89 → 0.89 | 0.05 → 0.07 | `っている` |
| u03 p13 | 2010h22a-q021 ア | 9 → 11 | 0.59 → 0.80 | 0.42 → 0.31 | term キャッシュフロー計算書 |
| u04 p01 | topic stem | 3 → 3 | 0.67 → 0.80 | 0.18 → 0.11 | `を超え` |
| u04 p04 | topic stem | 8 → 4 | 0.78 → 0.81 | 0.16 → 0.06 | `のように` |
| u04 p07 | 2015h27a-q026 stem | 4 → 5 | 0.67 → 0.74 | 0.35 → 0.19 | `固定資産の` |
| u04 p10 | 2012h24h-q020 stem | 4 → 4 | 0.58 → 0.67 | 0.27 → 0.21 | term 減価償却 |
| u05 p01 | 2017h29a-q007 stem (item b) | 9 → 8 | 0.36 → 0.67 | 0.59 → 0.29 | `総資産の回転期間` |
| u05 p04 | topic stem | 3 → 4 | 0.86 → 0.87 | 0.11 → 0.08 | `それぞれ` |
| u05 p07 | 2011h23tokubetsu-q019 stem | 4 → 5 | 0.88 → 0.88 | 0.08 → 0.14 | `てどれだけ` |
| u05 p10 | 2014h26a-q029 stem | 3 → 4 | 0.80 → 0.75 | 0.14 → 0.16 | `するもの` |
| u05 p13 | 2024r06-q030 stem / topic stem | 7 → 8 | 0.83 → 0.84 | 0.28 → 0.13 | `当期の損益計算書` (general noun phrase) |

Masked 12-char windows are 0 on every changed jp text after patching, cited and topic-wide (fragment and whole field). Unmasked windows after patching: u03 p13 0 → 17 (15 cited), every one on the term name キャッシュフロー計算書 that the patch adds to the list of disclosed statements (masked 0); u02 p05 1 → 1, pre-existing and unchanged by the patch: unit side `損益分岐点売上高は下がる` against a stem that asks for a measure with that effect — the term name plus its standard direction verb. No `before → after` value moves towards copying except u02 p01 LCS +2 (1 個あたりの変動費, a standard phrase Rule A L1 asked for) and u03 p13 LCS +2 (term name). The calibration HIGH (ed 0.14 / Dice 0.52) is not approached by any patch; the largest wDice after patching is 0.45 (u03 p04, a two-word term phrase that equals the choice).

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01–p03 | `terms[0].points[1].text_*` | L1 | Yes: jp / zh now name the sales amount, not cash in; 2009h21h-q016 wrong イ (cash receipts) no longer echoed | **LOW 建議修 F1** (en, §4) | OK, fix advised |
| u01 | p04–p06 | `terms[3].fig.steps[0].caption_*` | L1 | Yes | **LOW 建議修 F1** (en, §4) | OK, fix advised |
| u01 | p07 | `terms[0].fig.data.rows[1].cells[3].zh` | L2 | Yes | No | OK |
| u02 | p01–p04 | `overview_rows[4].extra_*[0]`, `pairs[1].rows[1].b_*` | L1 | Yes (§3.2) | No | OK |
| u02 | p05, p15, p16 | `terms[1].points[0].text_*` | L2 | **Partial by design**: (a) premise resolved (§3.2); (b) loc alignment `[[jp:損益分岐点]]` → `[[jp:損益分岐点売上高]]` not applied (its carriers p06 / p07 retired, p15 / p16 keep the origin position) | No: origin present in jp text, validate 0 | OK |
| u02 | p08–p11 | `terms[0].points[0..1].text_zh/en` | L3 | Yes: bold removed, = jp (no bold) | No | OK |
| u02 | p12 | `terms[3].points[2].text_en` | L4 | Yes: origin now on the noun "sales volume" | No | OK |
| u02 | p13 | `terms[3].analogy_zh` | L5 | Yes: 文化节 / 摊位费 = jp 文化祭 / テント代 (stall fee for tent fee is a fair rendering) | No | OK |
| u02 | p14 | `key_points_en[1]` (+ summary) | L6 | Yes: = jp 数量で表すなら | No | OK |
| u03 | p01–p06 | `terms[1].points[2].text_*`, `key_points_*[2]` (+ summary) | **M1** | **Yes** (§3.1) | LOW 記録のみ, §4 obs. 4 | OK |
| u03 | p07–p09 | `terms[1].analogy_*` | L1 | Yes (§3.5) | No | OK |
| u03 | p10–p12 | `terms[2].analogy_*` | L2 | Yes (§3.5) | No | OK |
| u03 | p13–p15 | `terms[0].detail_*` (+ explanation) | L3 | Yes: 2014h26a-q018 correct ウ (CF, P/L, B/S) now readable from the text; 有価証券報告書 glossed | No (D-198: term name only) | OK |
| u03 | p16 | `terms[3].fig.data.cols[1].en` | L4 | Yes: = jp 金額 (万円) | No | OK |
| u04 | p01–p03 | `overview_rows[1].extra_*[0]` | L1 | Yes: = same row's `one_line_*`, = `pairs[0].rows[0].b_*`, parallel with `overview_rows[6].extra_*[0]` | No | OK |
| u04 | p04–p06 | `terms[5].analogy_*` | L2 | Yes (§3.4) | LOW 記録のみ, §4 obs. 5 | OK |
| u04 | p07–p09 | `goals_*[1]` (+ intro) | L3 | Yes: 長く使う資産 = 無形資産 row 「長く使える固定資産」; investments no longer pushed into 無形 | No | OK |
| u04 | p10–p12 | `terms[2].detail_*` (+ explanation) | L4 | Yes: 代表的な / 代表性 / "representative" removes the closed list | No | OK |
| u04 | p13 | `terms[0].detail_en` (+ explanation) | L5 | Yes: "later" now attaches to collect | No | OK |
| u05 | p01–p03 | `terms[2].points[1].text_*` | L1 | Yes (§3.3) | No | OK |
| u05 | p04–p06 | `terms[1].points[2].text_*` | L2 | Yes (§3.3) | LOW 記録のみ, §4 obs. 6 | OK |
| u05 | p07–p09 | `terms[4].analogy_*` | L3 | Yes: 1-year horizon, receivable and saleable items now inside the image | **LOW 建議修 F2** (§4) | OK, fix advised |
| u05 | p10–p12 | `terms[4].hook_*` (+ memory_hook, summary) | L3 | Yes: = `detail_*` 1 年以内に現金化 | LOW 記録のみ, §4 obs. 7 | OK |
| u05 | p13–p15 | `terms[0].points[0].text_*` | L4 (+ L5 zh) | Yes (§3.3); 损益表 → 利润表 | No | OK |

## 3. Focused checks

### 3.1 (a) u03 M1 — resolved in all 6 fields

- `terms[1].points[2]`: jp その分だけキャッシュフローは利益より少なくなる / zh 会比利润少相应的金额 / en "falls short of profit by that amount" — same scope in all three; `summary.key_points_*[2]` equal to `key_points_*[2]` (jp 資金を利益より少なくし / zh 使资金比利润少 / en "leaves cash short of profit").
- Old claims gone: no field in u03 now says a rise in receivables reduces cash (walk of every string containing 売掛 / 应收 / receivable: detail, explanation, 資産 detail / points[0], points[2], key_points; none states a reduction).
- Consistent with `terms[1].detail_*` / `explanation_*` (before payment arrives, cash on hand has not grown): the point now states the difference relative to profit, which is exactly that.
- 2016h28a-q011 (correct ア, rise in receivables as the factor reducing cash flow): the patched sentence explains why ア is the reducing factor when cash flow is derived from profit, and it is still the answer; q011 is also in `challenge_questions`, consistent. The question's own wording 減少要因 is not used (LCS 6 = the choice's two-word phrase only).
- Other cash claims in the same sentence: borrowings increase cash (absolute, true); the sentence mixes an absolute and a relative comparison (§4 obs. 4), no contradiction.

### 3.2 (b) u02 L1 / L2 premises against the overview table

- `overview_rows[4]` (変動費率, column 販売量が増えると) now reads: unchanged if the selling price and the variable cost per unit stay the same. This equals `terms[4].detail_*` sentence 1, the existing en, and `pairs[1].rows[1].b_*`. zh 销售单价和单位变动成本 = jp.
- `terms[1].points[0]`: 変動費率が同じまま固定費を減らすと…損益分岐点売上高は下がる. With BEP = 固定費 ÷ (1 − 変動費率), the variable cost ratio is exactly the one premise needed (no need to name unit price separately); matches `overview_rows[0].extra_*[1]` (formula), `terms[4].points[1]` (unit price down with fixed / unit variable cost unchanged raises the ratio and BEP), and `key_points_*[3]`. 2011h23tokubetsu-q021 correct イ (cutting personnel / overhead = fixed costs) is supported; distractors ウ (volume up at fixed price) and エ (price down) are not.
- `overview_rows[0].extra_*[0]` (損益分岐点, 単価と費用の条件が同じなら動かない) keeps the generic wording; it names both prices and costs, so the L1 ambiguity (price only?) does not arise there (§4 obs. 3).
- zh p15 / en p16: premise added in the same position as jp; origin `[[jp:変動費率]]` present in `text_jp`.

### 3.3 (c) u05 L1 / L2 / L4 against the cited questions

- L1 / 2017h29a-q007 (correct ア = item a only): turnover period = length of the period ÷ turnover ratio, so 反比例 and 2 倍 → 半分 are exact; consistent with `terms[2].fig` (回転期間 = days per turnover; higher ratio better, shorter period better) and `terms[2].detail` / `hook` / `key_points[2]`. Item b (larger ratio → longer period) is negated; c is negated by `terms[4].points[1]`; a by `key_points[3]`. The formula 売上高÷総資産 also lets 2016h28a-q017's wrong イ be recognised as the total-asset, not inventory, ratio. Near-match to item b gone (ed 0.36 → 0.67, wDice 0.59 → 0.29, masked windows 0).
- L2 / 2014h26a-q029 (correct イ 100.0): 10 years × annual profit 110 minus 10 years × maintenance 10 = 1,000 over invested 1,000 → 100 %. The new second sentence (total each over the evaluation period, then subtract) yields イ; the annual-only reading (10 %) that Rule A L2 worried about is no longer the natural one. The sentence is conditional (どちらも毎年生じるときは), not a redefinition of the numerator (§4 obs. 6). No scene / numbers of the question used (LCS 4).
- L4 / 2024r06-q030 (correct エ = b only, given only the current P/L): b (profit-to-sales) is allowed by sentence 1; a (sales growth rate) needs the previous period and c (ROE) needs the balance sheet, both excluded by sentence 2 → エ. The general rule is not over-broad: it is scoped to what the current P/L alone gives (jp / zh by 当期 / 本期 in sentence 1, en "current period's ... alone"). Items a–c are not listed (D-198 (iii) avoided); longest overlap with the stem is 8 chars `当期の損益計算書`, a general noun phrase.
- zh: 损益表 0 hits in u01–u05; 利润表 u01 12, u03 3, u05 1 — topic-wide one name (L5 resolved).

### 3.4 (e) u04 L2 — greengrocer paying for vegetables (D-204)

- The image is 買掛金 (pay later for goods bought for the business), the representative example in `terms[5].detail_*` and `pairs[2].rows[1]`. The 流動負債 考点 are the current-ratio formula (2022r04-q028) and the mix point 売掛金 = asset / 買掛金 = liability; the image is affirmed by the latter, denied by neither.
- The u04 流動資産 mix point (period alone does not decide) is not contradicted: the image carries both conditions (arises in running the business, paid soon) and claims neither that all current liabilities are trade debts nor that period alone decides; `terms[5].detail_*` sentence 2 still covers the one-year rule for non-trade items.
- It pairs with the 流動資産 greengrocer analogy (`terms[0].analogy_*`), as Rule A L2 intended. jp / zh / en carry the same image (§4 obs. 5 on an en attachment).

### 3.5 (f) u03 L1 / L2 analogies

- L1: the three household buckets map one-to-one to the sections — pay and living costs → 営業活動, buying or selling a car → 投資活動, taking out or repaying a loan → 財務活動 — matching `terms[1].points[0]` (2010h22a-q021: three activity sections, correct ア), `detail_*` and the fig. The date-ordered image is gone. No 考点 is contradicted (2011h23a-q023: sales receipts → operating, correct ア, unaffected).
- L2: 「いま持っている財産」 = `terms[2].one_*` 財産; the added money lent to a friend and expected back carries the receivable-type asset in `detail_*` (売掛金) without claiming to be 売掛金 itself. `terms[2].points[0]` (2025r07-q026: receivable arises at booking, not at order; correct ウ) is not touched by the image.

### 3.6 (g) Cross-unit zh / en, u01–u05

| Concept | Rendering after patching | Result |
|---|---|---|
| 損益計算書 (zh) | 利润表 u01 12 / u03 3 / u05 1; 损益表 0 | one name (u05 p14 removed the outlier) |
| 本業の流れ (zh) | 主营业务循环 u04 11 (only unit) | one form |
| 損益分岐点売上高 (zh) | 盈亏平衡点销售额 u02 9 (only unit) | one form |
| 回転期間 (zh) | 周转期间 u05 10 (only unit) | unchanged (u05 Rule A L13 pre-existing) |
| キャッシュフロー (zh) | 现金流 u03 14 (only unit) | one form |
| 売上高 (en) | "sales" throughout; u01 p03 / p06 gloss "amount of goods and services sold" | §4 F1 |

No patch introduces a new cross-unit divergence.

## 4. Observations

**F1 — LOW 建議修, u01 p03 / p06 en gloss reads as a quantity.** jp 売った金額 / zh 卖出…的金额 are a money amount; en "the amount of goods and services sold" most naturally reads as how much was sold (quantity), which is u02's 販売量 ("sales volume"), and u01 `terms[1].detail_en` already uses "the value of goods" for a money amount. No answer reversed (the sentence's point — sales is not profit — holds). Fix:

- `terms[0].points[1].text_en`: **Sales** ([[jp:売上高]]) is simply the amount of goods and services sold, not profit ([[jp:利益]]). → **Sales** ([[jp:売上高]]) is simply the value of goods and services sold, not profit ([[jp:利益]]).
- `terms[3].fig.steps[0].caption_en`: The starting point is the period's sales (the amount of goods and services sold). → The starting point is the period's sales (the value of goods and services sold).

**F2 — LOW 建議修, u05 p07–p09 「売れば現金になる物」 has no time limit.** In a household image, anything sellable (a house, a car) turns into cash when sold, while `terms[4].points[0]` (2022r04-q028, correct エ) states that fixed assets are not used in the current ratio. The rest of the sentence (この 1 年に, 近く返ってくる), `detail_*` and the hook frame it as within a year, and the intended referent is stock-like items, so this is not a D-204 MEDIUM (the image does not name a fixed asset); a near-boundary judgement. Fix (adds the horizon already used for the lent money; new jp phrase 14 chars, topic-wide LCS 3):

- `terms[4].analogy_jp`: …近く返ってくる貸したお金や売れば現金になる物まで含めて、… → …近く返ってくる貸したお金や近いうちに売って現金にする物まで含めて、…
- `terms[4].analogy_zh`: …很快能收回的借出款、卖掉就能变现的东西一起比较，… → …很快能收回的借出款、近期要卖掉变现的东西一起比较，…
- `terms[4].analogy_en`: …plus money a friend will soon pay back and things you could sell for cash. → …plus money a friend will soon pay back and things you will soon sell for cash.

Records only, no fix:

3. LOW, pre-existing: u02 `overview_rows[0].extra_*[0]` keeps 単価と費用の条件 (generic). It names both prices and costs, so no premise is missing; it is simply less specific than the patched row 4.
4. LOW, u03 `key_points_*[2]`: one sentence now joins a relative comparison (receivables leave cash below profit) with an absolute one (borrowings increase cash), after an opening clause that says cash is decided by money in and out. Each part is true and consistent with `terms[1].detail_*` / `points[2]`; slightly uneven frame.
5. LOW, u04 `terms[5].analogy_en`: "the vegetables it bought in one lump at the end of the month" lets "in one lump" attach to bought rather than to pay; jp まとめて払う is clear. Meaning of the image (a trade debt paid soon) is unaffected.
6. LOW, u05 `terms[1].points[2]`: どちらも毎年生じるときは is narrower than needed (summing over the period applies whenever either arises over several years). It denies nothing and fits 2014h26a-q029. The 預金の利率 analogy (`terms[1].analogy_*`, rate on principal) stays as an image of the ratio, not of the period; no conflict with the patched point.
7. LOW, u05 hook: 1 年以内に現金として出入りするもの simplifies 流動 to the one-year rule, consistent with this unit's `terms[4].detail_*`; the operating-cycle nuance lives in u04 (`terms[0].points[1]`). Pre-existing simplification, not introduced by the patch.
8. LOW-cosmetic, u05 `terms[4].analogy_en`: "money a friend will soon pay back" adds "a friend", jp 貸したお金 has no borrower; zh 借出款 neutral. Same meaning.

## 5. Overall verdict

- HIGH introduced or remaining from patched findings: 0
- MEDIUM introduced or remaining: 0 (M1 resolved in all 6 fields + 3 summary copies, §3.1)
- LOW introduced: 建議修 2 (F1, F2); 記録のみ / cosmetic 6 (obs. 3–8; obs. 3, 6 [analogy part] and 7 pre-existing)
- u02 L2: premise part resolved; loc-alignment part intentionally not applied (p06 / p07 retired) — recorded, not a blocker
- D-205: no patch adds a version-bound count / structure claim (u03 毎年出す describes the annual report, not a count of statements)
- D-198: no copying (masked windows 0 on all patched jp texts, cited and topic-wide; unmasked windows only on term names)
- validate 5/5 = 0 issues (5 pre-existing warnings, Rule A u01 L7 / u04 L7), parity 5/5 = 0 diff (23 / 26 / 24 / 32 / 23 locations), vitest textbook 162/162

**PASS** — all 65 active patches are applied with derived fields following, M1 is resolved, and no new HIGH / MEDIUM is introduced. F1 and F2 are advised, not required by the PASS condition. If applied, re-run validate / parity and record them as patches.
