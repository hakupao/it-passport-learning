# b77 B3 patch re-review — technology-14-39-u01 (データ記述言語: HTML / タグ / XML / SGML / JSON)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audit, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b77rv/`: `check.mjs` / `d198.mjs` / `same.mjs` / `raverb.mjs` copied from `b76rv/` with only the unit map changed (1 unit, topic technology-14-39; base attempt `b77-u01-a2`, round `r0`) and `ra.json` replaced by the 7 Rule A before / after pairs, copied by hand from the Rule A L2 / L4 / L7 "修正案" cells. One change in `raverb.mjs`: a string also counts as verbatim when its `"` appear as `\"` in the Rule A Markdown (the L7 cell writes the en quotes escaped). Extra one-off checks (merge dry-run into a scratch data root, wording greps, field context dump, topic question dump) were run from the shell; no scratch files in the repo.
- Date: 2026-11-09 (Session 152, b77)
- Scope: the B3 wording patches for 1 unit. **7 are `active`, 0 retired**, part-level:

| Unit | Rule A | Patches | Mapping to Rule A prescriptions | Shortened |
|---|---|---|---|---|
| u01 (データ記述言語) | **PASS** (HIGH 0 / MEDIUM 0 / LOW 7), 建議修 L2 / L4 / L7 (L3 B3 範囲外; L1 / L5 / L6 記録のみ・任意) | p01–p07 | L2 → p01–p03 (`terms[4].one_jp/zh/en`, JSON not limited to curly braces: 「囲んで表す」→「囲むなどして表す」/ 加「例如」/ "as pairs" → "mainly as pairs"); L4 → p04–p06 (`terms[1].detail_jp/zh/en` 3rd sentence, 「ブラウザで表示すると、」/「在浏览器中显示时，」/ "When a browser displays the page, " prefixed); L7 → p07 (`terms[3].analogy_en`, forms → formats) | 1/7 (p01: `before` / `after` start at 「の組を…」; the Rule A cell writes the same strings with a leading 「…」, i.e. the elided part is the unchanged prefix 「**JSON** は、**キー** (項目名) と **値** 」). p02–p07 are the exact Rule A strings (p02–p06 one sentence of the field, p07 the whole field) |

  All three 建議修 are covered (L2 × 三語, L4 × 三語, L7 en). L3 (figure t01 SVG / mermaid 全角 〈p〉) is outside B3 and left record-only by the batch owner; it is not re-ruled here. L1 / L5 / L6 and O1–O4 of the Rule A file are not patched and not re-ruled.
  - **Shortened strings**: `same.mjs` confirms that each Rule A before (with the 「…」 elision treated as the unchanged prefix) occurs exactly once in its base field and base.replace(Rule A before, Rule A after) = unit field for all 7 fields.
- Pre-patch base, located by sha256 = `base_sha256` (validate --part prints the same sha): `data/ip/textbook/.planning/v2/technology-14-39-u01/parts/b77-u01-a2/technology-14-39-u01.loc.r0.json` `c5b298a9828d33e1…`
- Merged unit (current) `data/ip/textbook/units/technology-14-39-u01.json` sha256 `4c2607987cc49071…` (= `.planning/v2/technology-14-39-u01/merged.json`, byte-equal). **Link to the Rule A subject**: I copied the unit's planning dir into a scratch data root and ran `textbook-v2-merge.mjs --unit technology-14-39-u01 --journal journal.b77-u01-a2.jsonl --data-root <scratch> --batch-dir <empty>` (dry-run): merged sha `eeaf5aa8ad2547ac` = the unit sha the Rule A audit states. The same dry-run with `--batch-dir evidence/phase5/stage_07_ui/phase3/batch` gives `4c2607987cc49071`, byte-equal to the unit file. The two differ in exactly 13 paths: the 7 patched fields and their 6 derived copies (`terms[1].explanation_jp/zh/en`, `terms[4].definition_jp/zh/en`). `overview.est_minutes` is 25 in both (`unit_minutes.json` 25), so unlike b76 the patches did not change the estimate. (A plain text revert of the unit file does not reproduce the sha, because the zh / en derived copies are marker-stripped and do not contain the `**`-bearing patch strings; the merge replay is the exact check.)
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b76_patch_rereview.md` §0 (no unit-level patches). Topic technology-14-39 has 7 questions, so there are 35 source strings per language (7 stems + 28 choices).

1. **Application check** (`b77rv/check.mjs`): base sha256; `before` once in the base field; replay = unit field; every changed base-present path explained; net `before` remnant count; before / after verbatim (substring) in the Rule A file. Plus `b77rv/same.mjs`: Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field. `b77rv/raverb.mjs`: all 14 Rule A strings verbatim in the Rule A file. Plus the merge dry-run pair above (no patches → Rule A sha; patches → unit bytes).
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing). `terms[4].one_*` → `definition_*` and `terms[1].detail_*` → `explanation_*` are derived copies; `analogy_*` has none.
3. **D-198** (`b77rv/d198.mjs`, per-language choices): whole-field LCS before → after and LCS of the `after` span against the 35 sources of the patch language; for jp also 12-char windows and Dice.
4. **Cited-question / wrong-option check** against all 7 topic questions (re-read from `questions.json` + translations): 2009h21h-q083 (正答ウ = Web ページ記述言語・タグで論理構造; 誤答 FTP 転送 / HTML が SGML の基 / XML の縮小), 2010h22a-q056 (正答エ XML; 誤答 HTML 他), 2010h22h-q063 (正答ウ タグで囲む), 2012h24a-q059 (正答イ Web ページ), 2012h24h-q067 (正答ア; 誤答イ ブラウザで動くスクリプト言語・ウ ブラウザと Web サーバの通信プロトコル・エ 利用者定義タグ), 2013h25h-q069 (正答イ HTML), 2022r04-q088 (正答イ CSV / XML; JSON は b の誤答側).
5. **Technical check**: JSON per RFC 8259 §2 / ECMA-404 (a JSON text is any value: object `{}`, array `[]`, string, number, true / false / null); tag display in a browser for HTML vs XML; SGML → HTML / XML lineage direction.
6. **Remnant / wording greps** unit-wide: 波かっこ / 花括号 / curly, 角かっこ / 方括号, 画面に出 / 不显示 / appear on screen, ブラウザ / 浏览器 / browser, forms / form / format / 書式 / 格式, and the a1 / a2 MEDIUM markers 簡略化 / 简化 / simplif / 縮小 / 缩小 / shrink / フォント / 字体 / font.
7. **a1 / a2 MEDIUM regression**: the three resolved MEDIUMs (`terms[0].points[1]` q069 enumeration, `terms[4].points` q088 pairing, `terms[3].points` q083 イ → エ reversal) are on fields no patch touches; re-checked anyway.
8. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b76): the unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches (and their derived copies) changed relative to the Rule A subject. Unit-only paths (115 string paths) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-09)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-39-u01
  ✓ technology-14-39-u01 unit: 0 issues   EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-14-39-u01   → ✓ 24 locations, 0 diff   EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part <base>
  counts {"terms":5,"figs":3,"steps":0,"points":5,"pairs":2,"key_points":5,"goals":3}
  sha256 c5b298a9828d33e163b6d0ece5368e93688e83e228e2d6518392097d37b1108f (= base_sha256 of p01–p07)   ✓ 0 issues   EXIT=0
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
check.mjs:
  unit sha 4c2607987cc49071 | base sha c5b298a9828d33e1
  active 7 ok 7 | issues [] | changed base-present = stage + the 7 patched fields | unexplained besides 'stage' 0
  base-only top keys: stage / round / jp_round (part metadata) | unit-only paths 115
  derived 60, mismatch 0 | memory_hooks 15 checked, bad 0, lens 5/5/5
  net before remnant: p01–p07 raw 0 / stripped 0
  bold: terms[4].one_* 3→3, terms[1].detail_* 4→4, terms[3].analogy_en 0→0 | [[jp:]]: 0→0 in all 7
  ruleA verbatim miss: [p07] — Markdown escaping only: the Rule A L7 cell writes the quotes as \" (see raverb)
same.mjs: Rule A before occ in base 1 (7/7); base.replace(Rule A before, Rule A after) == unit field: true (7/7)
raverb.mjs (with \" accepted for "): 14 Rule A strings, verbatim miss 0
d198.mjs (per-language choices): topic qs 7, sources jp 35 / zh 35 / en 35
  p01 jp 6 → 6 ("形式である。", q088 stem) win12 0/0 → 0/0, Dice 0.17 → 0.19 (q067 cエ) | p02 zh 5 → 5 ("来表示数据", q088 stem)
  p03 en 13 → 13 (" enclosed in ", q056 stem)
  p04 jp 3 → 5 ("ブラウザで", q067 cイ) win12 0/0 → 0/0, Dice 0.08 → 0.12 | p05 zh 3 → 5 ("在浏览器中", q067 cイ)
  p06 en 13 → 13 ("en a browser ", q067 cウ)
  p07 en 8 → 11 (" format is ", 2022r04-q088 stem)
merge dry-run (scratch data root, journal b77-u01-a2):
  --batch-dir <empty>           → merged sha eeaf5aa8ad2547ac (= Rule A stated sha), est_minutes 25
  --batch-dir evidence/…/batch  → "patch p01 … p07 applied", merged sha 4c2607987cc49071, cmp = unit file (byte-equal), est_minutes 25
  unpatched vs unit: 13 diff paths = 7 patched fields + terms[1].explanation_jp/zh/en + terms[4].definition_jp/zh/en
```

**vitest**: 162 / 162 pass (the v1-snapshot test failure recorded in b76 §5 O1 no longer occurs; the test adaptation is not in this review's scope).

`validate --unit` prints 0 warns (no `choice-echo`), as the Rule A §7 states. `stage` meta is removed in the unit (as in b19–b76).

**Application.** Each `before` string occurs exactly once in its base field, each `after` string is present, replay reproduces all 7 patched fields, net `before` remnant 0 for all 7. p01 is a shortened phrase equal to the Rule A strings minus the 「…」 elision and gives exactly the Rule A after text (same.mjs true). The derived copies follow: `terms[4].definition_jp` 「JSON は、キー (項目名) と 値 の組を波かっこで囲むなどして表す、…」, `definition_zh` 「…，例如用花括号把键（项目名）和值的组合括起来表示数据。」, `definition_en` "… represents data mainly as pairs of a key …"; `terms[1].explanation_jp/zh/en` end with the new 「ブラウザで表示すると、…」/「在浏览器中显示时，…」/ "When a browser displays the page, …" sentence (check.mjs derived true × 6).

## U1. technology-14-39-u01 (Rule A PASS, 建議修 L2 / L4 / L7)

### U1.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 6 → 6 (「形式である。」, q088 stem), win12 0 → 0, Dice 0.17 → 0.19 | 6 |
| p02 | zh | 5 → 5 (「来表示数据」, q088 stem) | 5 |
| p03 | en | 13 → 13 (" enclosed in ", q056 stem; unchanged part of the sentence) | 13 |
| p04 / p05 | jp / zh | **3 → 5** (「ブラウザで」/「在浏览器中」, q067 choice イ) win12 0 → 0, Dice 0.08 → 0.12 | 5 |
| p06 | en | 13 → 13 ("en a browser ", q067 choice ウ) | 13 |
| p07 | en | **8 → 11** (" format is ", 2022r04-q088 stem) | 11 |

- **Two small rises, not copying.** p04 / p05 share only the word ブラウザ / 浏览器 (+ particle) with q067 イ (a script language that runs in the browser); p06 shares "…en a browser " with q067 ウ (a protocol between the browser and the Web server). The patch sentence is about rendering (tags are not shown on screen), not about running scripts or communication, so it carries no option content and supports neither wrong option (§U1.3). p07 " format is " is a common phrase in q088's "[a] format is …" (CSV / RSS), unrelated to SGML. Not D-198 (i)–(iii). jp 12-char windows are 0 before and after for p01 / p04.

### U1.2 Per-patch verdict

| ID | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[4].one_jp` | L2 | Yes (§U1.2a) | No | OK |
| p02 | `terms[4].one_zh` | L2 | Yes | No | OK |
| p03 | `terms[4].one_en` | L2 | Yes | No (§5 O1 nuance) | OK |
| p04 | `terms[1].detail_jp` | L4 | Yes (§U1.3) | No (§5 O2) | OK |
| p05 | `terms[1].detail_zh` | L4 | Yes | No | OK |
| p06 | `terms[1].detail_en` | L4 | Yes | No (D-198 flat) | OK |
| p07 | `terms[3].analogy_en` | L7 | Yes (§U1.4) | No | OK |

### U1.2a Focused checks — L2 (JSON one, RFC 8259 / ECMA-404)

- **After (三語)**: jp 「**JSON** は、**キー** (項目名) と **値** の組を波かっこで囲むなどして表す、タグを使わない軽いデータ記述形式である。」 / zh 「…轻量数据描述格式，例如用花括号把**键**（项目名）和**值**的组合括起来表示数据。」 / en "… represents data mainly as pairs of a **key** (item name) and a **value** enclosed in curly braces."
- **Technically correct now**: under RFC 8259 §2 / ECMA-404 a JSON text is any serialized value (object in `{}`, array in `[]`, or a string / number / literal). The base definition said JSON *is* key-value pairs in curly braces (object only). All three languages now hedge it (など / 例如 / mainly), so the definition no longer excludes arrays or single values, while keeping the object as the basic form the learner meets first (detail example `{"商品名": "ノート", "在庫数": 42}` stays a valid object, keys are double-quoted strings, colon / comma described correctly).
- **Questions**: JSON's only question is 2022r04-q088 (b = markup language using tags → XML; JSON is on the wrong-answer side). 「タグを使わない」/ "uses no tags" is unchanged in all three languages, so JSON is still ruled out for blank b; the hedge does not move JSON toward "markup language". No other topic question is about JSON.
- **Remaining object-only wordings** (not defects): `pairs[1].rows[0].b` 「キーと値の組を波かっこで囲む」 (contrast row against XML's start / end tags; Rule A explicitly keeps it), `overview_rows[4].one_line` and `key_points[4]` 「キーと値の組で書く」 (summary forms, no "only" claim). 角かっこ / 方括号 0 in the unit — arrays are not introduced, which is fine at this level. Bold 3 → 3.

### U1.3 Focused checks — L4 (tags not shown on screen)

- **After (三語)**: jp 「ブラウザで表示すると、タグそのものは画面に出ず、挟んだ中身に役割を与える。」 / zh 「在浏览器中显示时，标签本身不显示在屏幕上，而是为夹在中间的内容赋予作用。」 / en "When a browser displays the page, the tags themselves do not appear on screen; they give a role to the content they enclose."
- **Scope fixed**: `terms[1].one` covers 「文書やデータ」 (XML data included), so the unconditional "tags do not appear on screen" was too wide; the claim is now tied to browser rendering, the setting of the field's own `<p>` example. For HTML this is correct (the browser renders the content, tags are markup). For XML a browser may show the raw tree with tags when no stylesheet is attached; the field's example is `<p>` and the en says "the page", so the reading is HTML-like rendering. Record only (§5 O2), not a defect: the sentence no longer claims anything about XML data in general, and no question asks about it.
- **No wrong option supported**: q067 イ (browser-executed script language) and ウ (browser–server protocol) are not what the sentence says; q083 ア (FTP to transfer HTML to the browser) is not touched. The sentence also does not contradict 2013h25h-q069 / q067 ア (HTML can specify layout / display): giving the enclosed content a role is consistent with specifying how it looks (`terms[0].points[1]`).
- Derived `explanation_*` follow (§1). Bold 4 → 4. zh / en convey the same condition as jp (en adds "the page", a natural object for "displays"; no new fact).

### U1.4 Focused checks — L7 (SGML analogy en)

- **After**: "It is like a \"guide to designing formats\" that exists before any individual format is designed. Formats for each purpose branch off from that guide." = jp 「個々の書式を作る前にある「書式の作り方の手引き」…用途別の書式が分かれて生まれる。」 = zh 「格式制作指南…各种用途的格式都是从这本指南中分化出来的」. "forms" (fill-in forms) is gone (0 occurrences of "forms" / "form "), so en now matches 書式 / 格式.
- **Lineage direction**: the analogy still says only SGML (guide) → HTML / XML (formats), the positive direction of `one` / `detail` / fig t02 / `key_points[3]` / `pairs[1].rows[2]`. It does not reproduce or negate q083 イ (HTML as the basis of SGML) or エ (XML made by shrinking …); 簡略化 / 简化 / simplif / 縮小 / 缩小 / shrink are 0 unit-wide. Metalanguage idea (rules for making languages) is kept by "guide to designing formats".

### U1.5 a1 / a2 MEDIUMs stay resolved

- a1 jp-review #1 (q069 enumeration in `terms[0].points[1]`): field unchanged, 2 items only (structure + display); フォント / 字体 / font 0 unit-wide.
- a1 jp-review #2 (q088 pairing in JSON points): `terms[4].points` = [] (三語); p01–p03 change only `one`, which does not pair XML and JSON.
- a2 jp-review #1 (q083 イ → エ reversal in SGML points): `terms[3].points` = []; p07 only rewords the en analogy, lineage still positive only.
- Parity 24 / 0 diff. **u01: L2 / L4 / L7 resolved; no new HIGH / MEDIUM / LOW.**

## 4. F-fix

No required F-fix. The patches introduce no HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. O1: the three L2 hedges differ slightly in nuance — jp 「囲むなどして」 (among other ways), zh 「例如」 (for example), en "mainly" (mostly). All three remove the object-only claim and none is wrong (objects are the dominant top-level form in practice); these are the exact Rule A strings. Record only.
2. O2: jp / zh 「ブラウザで表示すると」/「在浏览器中显示时」 do not name the document type; an XML file opened in a browser without a stylesheet can show its tags. In the field's `<p>` context (and en "the page") the reading is HTML rendering, so not a defect. If the sentence is revisited, 「Web ページをブラウザで表示すると」 / 「网页在浏览器中显示时」 would match the en exactly.
3. O3: `pairs[1].rows[0].b`, `overview_rows[4]`, `key_points[4]` still describe JSON by its object form (contrast row / summaries, kept per Rule A L2).
4. Rule A L3 (t01 SVG / mermaid 全角 〈p〉 vs one's 「<」「>」) is outside B3 and left record-only by the batch owner; not re-ruled. L1 / L5 / L6 and Rule A O1–O4 stay 記録のみ.
5. Script notes: copied from `b76rv/`; `ra.json` = 7 pairs; `raverb.mjs` accepts `\"` for `"` (Markdown-escaped quotes in the L7 cell), and check.mjs's own verbatim test reports p07 for the same reason only. The unit ↔ Rule A sha link was made by a merge dry-run into a scratch data root (planning dir copied, quiz / figures symlinked), not by text revert (derived zh / en copies are marker-stripped). Base is `b77-u01-a2` / `loc.r0`; `est_minutes` 25 unchanged by the patches. `stage` meta removed (as in b19–b76).

## 6. Overall verdict

| Unit | Rule A | Applied | MEDIUM in scope | HIGH / MEDIUM / LOW introduced | Verdict |
|---|---|---|---|---|---|
| technology-14-39-u01 | PASS | **7/7** | — (Rule A MEDIUM 0; a1 / a2 MEDIUM 3 stay resolved) | 0 / 0 / 0 | **PASS** |

- **Application:** 7/7 exact (replay, part-level). 0 unexplained diffs, net `before` remnant 0, derived fields 60 checked 0 mismatch (incl. `terms[4].definition_*` and `terms[1].explanation_*` following the patches), memory_hooks pairing 0 bad. p01 is shortened (Rule A 「…」 elision = unchanged prefix) and gives the same field as the Rule A strings (same.mjs 7/7). Merge dry-run without patches reproduces the Rule A unit sha `eeaf5aa8ad2547ac`; with patches it reproduces the unit file byte for byte (`4c2607987cc49071`).
- **D-198:** two small rises (p04 / p05 jp / zh 3 → 5 = the word ブラウザ / 浏览器; p07 en 8 → 11 " format is "), common words with different meaning, no option content; others flat; jp windows 0. **D-202:** bold / tag counts unchanged. **D-204 / 技術:** JSON definition now agrees with RFC 8259 / ECMA-404 (not limited to curly braces); tag-display sentence now scoped to browser rendering; SGML analogy en matches 書式 / 格式. **D-205 / D-210:** no new claim. No patch supports a wrong option of the 7 topic questions.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 (0 warns)
  - validate --part: 0 issues, sha256 = base_sha256
  - parity: 24 locations, 0 diff
  - patch tests: 14/14
  - vitest textbook: 162/162

**PASS** (patch re-review). All 7 active patches are applied exactly. L2 (JSON one × 三語, RFC 8259-consistent, q088 still rules JSON out of blank b), L4 (タグ detail × 三語, display claim scoped to the browser, no q067 / q083 wrong option supported) and L7 (SGML analogy en forms → formats, lineage direction unchanged) are resolved in context; the a1 / a2 MEDIUMs stay resolved. No required F-fix.
