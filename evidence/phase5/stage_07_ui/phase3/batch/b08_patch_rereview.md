# b08 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer; Rule D)
- Date: 2026-10-30 (Session 138)
- Scope: B3 wording patches replayed at merge for strategy-01-02-u06 (p01), u07 (p01–p06), u08 (p01–p03), u09 (p01–p05), u10 (p01–p06)
  — 21 patches, all `active`, none retired (`patches/strategy-01-02-u06.json` … `-u10.json`), checked against the Rule A findings
  (`strategy-01-02-u06.ruleA.md` L1; `-u07` L1 / L2; `-u08` L1 / L3; `-u09` L6 / L7; `-u10` L3 / L4 / L5) and the merged units
  `data/ip/textbook/units/strategy-01-02-u{06..10}.json` (sha256 u06 `62bd7ee2f76ce660…`, u07 `860c644db913498c…`, u08 `bfc506541cf4c822…`,
  u09 `62084516bbd70be8…`, u10 `e8453413263822e4…`).
- Severities: D-195 / D-198 / D-202 / D-203 (session-137), D-204 (session-138 §2), D-205 (session-138 §6).
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text or term names).

## 0. Method

Same as `b07_patch_rereview.md` §0 (= `b06_patch_rereview.md` §0):

1. Application check (script): every string field of the unit is walked; each patch's `after` (raw and notation-stripped) must appear, and
   `before` (raw and stripped) must not survive anywhere outside a field that already contains `after`.
2. Derived-field check from the same walk (`explanation_*`, `definition_*`, `memory_hook_*`, `summary.*`).
3. D-198: normalized LCS, 12-char window with ≤2 substitutions, both **with and without** katakana / alnum masking, between each changed jp text
   (patch fragment and the whole patched field) and stem + choices of every qid cited anywhere in the unit; LCS and masked near-match also
   against all 98 questions of topic strategy-01-02. Semi-global edit distance (per patch char) and character-bigram Dice against each stem / choice.
4. D-195 展開 2〜3 文 / D-200 考点 JP ≤2 文・≤100 字 (validate) + manual count.
5. Manual reading of each patched field in context (one / detail / points / pairs / fig / overview / key_points / hook), rule 7 (inter-field
   consistency within the unit, trilingual parity), D-203 §6, D-204, D-205. For u08 L3 additionally a corpus-wide grep of the zh rendering of
   帯グラフ across all production units (§3.3).
6. `scripts/textbook-v2-validate.mjs --unit <id>` / `scripts/textbook-v2-parity.mjs --unit <id>`; regression `npx vitest run src/lib/textbook`.

## 1. Script results (fresh, 2026-10-30)

```
✓ strategy-01-02-u06 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u06.json)   exit 0
✓ strategy-01-02-u06 parity: 32 locations, 0 diff                                       exit 0
✓ strategy-01-02-u07 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u07.json)   exit 0
✓ strategy-01-02-u07 parity: 36 locations, 0 diff                                       exit 0
✓ strategy-01-02-u08 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u08.json)   exit 0
✓ strategy-01-02-u08 parity: 33 locations, 0 diff                                       exit 0
✓ strategy-01-02-u09 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u09.json)   exit 0
✓ strategy-01-02-u09 parity: 33 locations, 0 diff                                       exit 0
✓ strategy-01-02-u10 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u10.json)   exit 0
✓ strategy-01-02-u10 parity: 21 locations, 0 diff                                       exit 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

Application check: 21/21 `after` present (raw), 0 `before` remnants.

| Patch | `after` found at |
|---|---|
| u06 p01 | `terms[6].points[0].text_en` |
| u07 p01–p03 | `overview_cols_jp/zh/en[0]` |
| u07 p04–p06 | `terms[5].hook_jp/zh/en`, `terms[5].memory_hook_jp/zh/en`, `summary.memory_hooks_jp/zh/en[5]` |
| u08 p01 | `terms[6].hook_zh`, `terms[6].memory_hook_zh`, `summary.memory_hooks_zh[3]` |
| u08 p02 / p03 | `terms[1].detail_zh`, `terms[1].explanation_zh` / `pairs[0].rows[3].b_zh` |
| u09 p01–p03 | `terms[2].points[0].text_jp/zh/en` |
| u09 p04 / p05 | `terms[4].hook_zh`, `memory_hook_zh`, `summary.memory_hooks_zh[4]` / `overview_rows[3].extra_zh[1]` |
| u10 p01–p03 | `terms[1].detail_jp/zh/en`, `terms[1].explanation_jp/zh/en` |
| u10 p04 / p05 | `terms[2].hook_en`, `memory_hook_en`, `summary.memory_hooks_en[2]` / `terms[3].hook_en`, `memory_hook_en`, `summary.memory_hooks_en[3]` |
| u10 p06 | `terms[3].detail_en`, `terms[3].explanation_en` |

Residual grep (authored fields): u06 `baseline` 0; u07 `分ける軸` / `分类维度` / `Axis of classification` / `もとは航海日誌` / `原本指` /
`was originally` 0; u08 `带状图` 0 (in u08; see §3.3 for u06), `「元（meta）」源自` 0; u09 `国内の全員に配る` / `发给国内所有人` /
`everyone in the country` 0, `悉皆调查` 0, `多数只询问` 0; u10 `標本の結果が起こる確率` / `Its nickname is` / `too few samples` 0.

D-198 (jp texts; zh/en-only patches touch no question wording, questions are jp-only):

| Text | Cited qids | max LCS (unmasked / masked) | 12-char ≤2 near-match unmasked / masked | min ed / max Dice | Judgement |
|---|---|---|---|---|---|
| u07 p01 `overview_cols_jp[0]` 位置づけ | 7 | 1 / 1 | 0 / 0 | 0.75 / 0.00 | no copying |
| u07 p04 `terms[5].hook_jp` (frag / field) | 7 | 2 / 2, 2 / 2 | 0 / 0 | 0.88 / 0.06, 0.82 / 0.05 | no copying |
| u09 p01 `terms[2].points[0].text_jp` (frag / field) | 8 | 2 / 2, 2 / 2 | 0 / 0 | 0.86 / 0.03, 0.89 / 0.04 | no copying |
| u10 p01 `terms[1].detail_jp` (frag / field) | 6 | 2 / 2, 3 / 3 | 0 / 0 | 0.87 / 0.05, 0.91 / 0.06 | no copying |

Topic-wide (98 questions): max LCS ≤ 9 (u09 field; ≤ 4 for every patch fragment), masked 12-char near-match 0 for every text above.

D-195 / D-200: validate 0 issues on all five units. Patched 考点: u09 t2.p0 jp 1 文 / 64 字 (≤2 文・≤100 字). u10 `terms[1].detail_jp` still
3 sentences (patch lengthens sentence 1 only). u06 t6.p0 / u10 t3.detail patched en only (D-200 counts JP).

## 2. Per-patch verdict

| Unit | ID | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u06 | p01 | `terms[6].points[0].text_en` | L1 | Yes: "axes use separate scales" = jp 目盛は基準が別 (whole scale, not just zero point) | No (§3.1) | OK |
| u07 | p01–p03 | `overview_cols_jp/zh/en[0]` | L1 | Yes: 位置づけ / 定位 / "Where it fits" fits all 8 rows (§3.2) | No (LOW-cosmetic zh §4 obs. 2) | OK |
| u07 | p04–p06 | `terms[5].hook_*` (+ memory_hook, summary) | L2 | Yes: 由来する / 一词来自 / "comes from" — no longer claims log *originally meant* logbook (§3.2) | No | OK |
| u08 | p01 | `terms[6].hook_zh` (+ memory_hook, summary) | L1 | Yes: 「元」 is now only the zh equivalent of meta; Greek origin attached to meta | No (LOW-cosmetic §4 obs. 3) | OK |
| u08 | p02 / p03 | `terms[1].detail_zh` (+ expl) / `pairs[0].rows[3].b_zh` | L3 | Yes: 百分比堆积条形图 = en "100% stacked bar chart"; intra-unit consistent | No within unit; **cross-unit divergence with u06** (§3.3, LOW 建議修) | OK (companion fix needed) |
| u09 | p01–p03 | `terms[2].points[0].text_*` | L6 | Yes: すべての世帯に配る / 发给国内所有家庭 / "every household" (§3.4) | No | OK |
| u09 | p04 | `terms[4].hook_zh` (+ memory_hook, summary) | L7① | Yes: 悉皆調査 (jp glyphs) = one_zh `[[jp:悉皆調査]]` | No | OK |
| u09 | p05 | `overview_rows[3].extra_zh[1]` | L7② | Yes: 通常只询问一部分人 = jp 多くは一部に尋ねる = en "Usually asks only part" | No | OK |
| u10 | p01–p03 | `terms[1].detail_*` (+ expl) | L3 | Yes: p-value now "result or more extreme" in all three (§3.5) | No | OK |
| u10 | p04 / p05 | `terms[2/3].hook_en` (+ memory_hook, summary) | L4 | Yes: "In Japanese it is nicknamed …" — no longer reads as an English nickname; `[[jp:]]` kept | No | OK |
| u10 | p06 | `terms[3].detail_en` (+ expl) | L5 | Yes: "the sample was too small" = jp 標本が少なくて = same detail's "a larger sample" = `pairs[0].rows[2]` sample size | No | OK |

## 3. Focused checks

### 3.1 u06 L1 — 2軸グラフ 考点 en

- "The left and right axes use separate scales, so when a left-axis line crosses a right-axis line, it does not mean the two values are equal at that point."
- Facts correct (crossing on a dual-axis chart carries no equality meaning because the scales differ). Rule 7: en "scale" vocabulary now matches
  `terms[6].one_en` ("vertical axis with its own scale"), `overview_rows[6].one_line_en` ("differently scaled"), fig row "Scale" / "on the scale of its own axis",
  `pairs[2].rows[1].b_en` ("different scales"), `key_points_en[4]` ("separate scales"). jp / zh unchanged and equivalent. Natural English.

### 3.2 u07 L1 / L2 — overview column name and log hook

- Column 0 values (from `overview_rows[*].extra_*[0]`): 保存の形式 ×2 / 位置情報の有無 / 発生源 ×4 / 見せ方の注意. 「位置づけ」「定位」"Where it fits"
  cover a classification axis and a presentation caveat alike; the チャートジャンク row no longer contradicts the header. `goals_*[0]` /
  `overview.intro_*` 「2 つの軸 / 两个维度 / two axes」 remain correct for the two real axes (保存の形式・発生源) and no longer collide with the header.
- log hook: the word *log* (record) is the shortened form of *logbook*, the ship's book in which chip-log speed readings were recorded; 「航海日誌
  (logbook) に由来する」/「一词来自航海日志（logbook）」/ "comes from a ship's logbook" is correct and drops the false "originally meant" claim
  (original sense = 丸太). Mnemonic function (行動 の日誌) kept. Derived `memory_hook_*` and `summary.memory_hooks_*[5]` carry the new text.

### 3.3 u08 L3 — 帯グラフ zh, and the u06 divergence

- Within u08: `terms[1].detail_zh` / `explanation_zh` / `pairs[0].rows[3].b_zh` all 百分比堆积条形图; en "100% stacked bar chart" in both places;
  jp 帯グラフ. 百分比堆积条形图 is the standard mainland name (Excel zh-CN 「百分比堆积条形图」) and conveys the composition-ratio meaning. Correct.
- **Cross-unit (new, introduced by this patch):** `strategy-01-02-u06.json` `terms[2](モザイク図).points[0].text_zh` still renders 帯グラフ as
  「**带状图**（[[jp:帯グラフ]]）」 (en there = "100% stacked bar chart"). Before the patch u06 and u08 agreed (both 带状图); after it, a zh reader
  meets two names for the same chart in consecutive units of one topic. The Rule A u08 premise 「本番単元に他の使用例なし」 was false for this
  batch (u06 is merged in the same b08). `zh_terms.json` has no entry; a grep of all production units finds 带状图 only in u06.
  Not a within-unit rule-7 break (u08 itself is consistent and u06 keeps the `[[jp:帯グラフ]]` tag), so **LOW 建議修**, but the batch should not
  merge u06 unchanged next to u08. Companion fix (u06, one string, 考点 → no derived fields):
  `terms[2].points[0].text_zh`: 「**带状图**（[[jp:帯グラフ]]）把长度相同的带子按内部比例切分，」→「**百分比堆积条形图**（[[jp:帯グラフ]]）把长度相同的带子按内部比例切分，」
  (rest unchanged; the 带子 imagery still matches en "bands").
- u08 p01: 「「元」对应英语 meta，meta 源自希腊语，意思是「超越……、高一层的」。」 — correct (元数据's 元 renders meta; meta is Greek μετά). jp / en unchanged.

### 3.4 u09 L6 — 国勢調査 distribution unit

- 考点 now: 調査票は 回答者を選ばず 国内のすべての世帯 に配る (= census forms are distributed per household; correct). Rule 7: `one_*`
  「すべての人と世帯 / 所有人和所有家庭 / every person and household」, `overview_rows[2]` 「全員と全世帯」, `hook_*` 「全員が対象 / 全体居民都是对象 /
  everyone has to be counted」 speak of the *target* (all people), the 考点 of the *distribution unit* (households) — compatible, not contradictory.
  Elsewhere in the unit 世帯 / 家庭 / household is used consistently (多段抽出 fig / one). zh 家庭 = jp 世帯 rendering already used in `one_zh` /
  `detail_zh`. The contrast with アンケート調査 (回答者を選んで) is preserved.
- u09 L7①: hook_zh now quotes the Japanese alias in Japanese glyphs 「悉皆調査」, same as `one_zh` `[[jp:悉皆調査]]`; the explanation of 悉
  (汉语里也是「全、都」、如「悉数」) unchanged and correct. Matches the unit's existing convention of quoting Japanese words in 「」 inside zh hooks
  (`terms[2].hook_zh` 日语「国勢」).

### 3.5 u10 L3 — p-value phrasing

- jp 「帰無仮説が正しいとしたときに標本の結果かそれ以上に偏った結果が起こる確率がこれを下回ると」, zh 「样本结果或更极端的结果出现的概率」,
  en "the probability of the sample result or a more extreme one under a true null hypothesis" — the standard p-value definition. Compatible with
  `terms[0].detail_*` (どれほど起こりにくいか) and `terms[1].points[0]` (有意水準 ≠ 帰無仮説が正しい確率; untouched). jp 「偏った」 is the
  natural word in a 差の検定 context (zh / en "极端 / extreme" equivalent).
- u10 L4 / L5: en hooks now attribute the nicknames to Japanese; zh hooks (unpatched) keep `[[jp:]]` tags. detail_en "the sample was too small"
  aligns with jp 集めた標本が少なくて and with "a larger sample" two sentences later.

## 4. Observations

1. **LOW 建議修 (new, cross-unit, from u08 p02/p03)**: u06 `terms[2].points[0].text_zh` 「**带状图**（[[jp:帯グラフ]]）」→「**百分比堆积条形图**（[[jp:帯グラフ]]）」
   (§3.3). Does not block the 21 patches; should be applied before b08 is committed as a set so u06 / u08 use one zh name.
2. LOW-cosmetic, u07 p02 `overview_cols_zh[0]` 「定位」: in mainland usage also means GPS location, and it sits above the GIS row value 「有无位置信息」,
   so a momentary "location" reading is possible. Optional: 「定位」→「所属角度」 (or leave; meaning is recoverable from the other rows).
3. LOW-cosmetic, u08 p01 `terms[6].hook_zh` (+ derived): 「meta」 repeated. Optional:
   「「元」对应英语 meta，meta 源自希腊语，意思是…」→「「元」对应英语的 meta，它源自希腊语，意思是…」.
4. Out of patch scope (pre-existing, record only): u10 `terms[2/3].hook_zh` 别名“慌张者的错误” / “迷糊者的错误” could likewise be read as zh
   nicknames (the ambiguity Rule A L4 fixed in en); `[[jp:]]` tags present, Rule A did not flag zh.

## 5. Overall verdict

- HIGH introduced or remaining from patched findings: 0
- MEDIUM introduced or remaining: 0
- LOW introduced: 1 建議修, cross-unit (§4 obs. 1: u06 带状图 vs u08 百分比堆积条形图, companion one-string fix given) + cosmetic (§4 obs. 2–3)
- D-205 N/A for all 21: no patch adds a version-bound count / structure claim or a qid-tied restriction (u09 L6 corrects a distribution unit;
  the rest are wording / fact / translation fixes)
- D-198: no copying (max LCS 3 vs cited qids, 12-char ≤2 near-match 0 masked and unmasked, Dice ≤ 0.06)
- validate 5/5 = 0 issues, parity 5/5 = 0 diff (32 / 36 / 33 / 33 / 21 locations), vitest textbook 162/162

**PASS** — all 21 patches applied with derived fields following; each resolves its named finding faithfully across ja/zh/en; no new HIGH/MEDIUM.
Condition for committing b08 as a set: apply the u06 companion fix in §4 obs. 1.
