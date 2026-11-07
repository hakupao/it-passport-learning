# b60 B3 patch re-review — strategy-06-18-u01 (情報システム戦略の枠組みと情報システムの分類, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audit, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b58rv/` (shared with b58 / b59: `check.mjs` = `b53rv/check.mjs` with only the unit map changed; `d198.mjs` derived from `b57rv/d198.mjs`, multi-unit; `same.mjs` replays the full Rule A before → after on the base field).
- Date: 2026-11-08 (Session 150 続)
- Scope: the B3 wording patches for strategy-06-18-u01. **4 are `active`, 0 retired**: p01–p04 (`patches/strategy-06-18-u01.json`), all part-level, all zh.
  - Mapping to Rule A prescriptions (Rule A PASS, 建議修 L1 / L2 / L6; Rule A numbers its third 建議修 **L6**, listed between L4 and L5 in its table):
    - L1 → p01–p02 (`terms[1](エンタープライズサーチ).detail_zh`, `terms[1].points[1].text_zh`)
    - L2 → p03 (`terms[1].points[2].text_zh`)
    - L6 → p04 (`terms[2](SoR).points[0].text_zh`)
  Every 建議修 is covered. L3–L5 (記録のみ) and O1–O2 are not patched and not re-ruled here. L4 (record only) concerns the same SoR 考点 that p04 edits; it is re-measured in §3.3 only for regression.
  - **Shortened strings**: none. p01–p04 are the Rule A strings as given (each a phrase inside the field). `same.mjs` confirms base.replace(Rule A before, Rule A after) = unit field for all 4.
- Pre-patch base, located by sha256 = `base_sha256`: `data/ip/textbook/.planning/v2/strategy-06-18-u01/parts/b60-u01-a1/strategy-06-18-u01.loc.r0.json` `f03debc959eb65e3…`.
- Merged unit (current) `data/ip/textbook/units/strategy-06-18-u01.json` sha256 `52c7abcda73d22ee…`. It differs from the base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b49_patch_rereview.md` §0 (no unit-level patches in this batch), with the `same.mjs` replay of b57. Topic strategy-06-18 has 25 questions, so there are 125 source strings per language.

1. **Application check** (`b58rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b58rv/same.mjs`: full Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b58rv/d198.mjs`, all 4 patches): whole-field LCS before → after and LCS of the `after` span against the 125 zh sources.
4. **Cited-question checks** in `data/ip/quiz/questions.json` + translations: 2016h28a-q086 (software that crawls and collects pages for a full-text search DB; answer イ クローラ; wrong CGI / XSS / backdoor), 2021r03-q004 (enterprise search; answer ア; wrong エ = the EA description), 2024r06-q031 (the concept for in-house, high-reliability, stable systems as opposed to SNS-type; answer エ SoR; wrong IoT / PoC / SoE).
5. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (§3).
6. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b59): the unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (88) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-06-18-u01
✓ strategy-06-18-u01 unit: 0 issues (data/ip/textbook/units/strategy-06-18-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-06-18-u01
✓ strategy-06-18-u01 parity: 20 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part data/ip/textbook/.planning/v2/strategy-06-18-u01/parts/b60-u01-a1/strategy-06-18-u01.loc.r0.json
sha256 f03debc959eb65e378ddb3274cb6886c6670fd13c0fb93d19bc8e2fdb3145069   (= base_sha256)
✓ strategy-06-18-u01 part loc#0: 0 issues
EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  active 4 ok 4 | issues []
  base sha = base_sha256 for all 4; before count in base = 1 for all 4; replay mismatch 0
  changed base-present paths = 4 patched fields + 'stage'; unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata); unit-only paths 88
  derived checked 45, mismatch 0 (terms[1].explanation_zh follows p01: true)
  bold counts unchanged in all 4 (3/1/2/1); [[jp:]] counts unchanged in all 4 (3/1/0/0)
  memory_hooks hooked-terms pairing: 4/4 per language (12 checked), bad 0
  net before remnant: 0 for all 4 (raw and stripped); grep 巡访 / 完全不同 / 被强烈要求 in the unit: 0
  ruleA verbatim miss: []
same.mjs (full Rule A before → after on the base field):
  Rule A before occurs once in the base field: 4/4
  base.replace(Rule A before, Rule A after) == unit field: 4/4 true
```

No validate warns on the unit or on the base part (no zh-term warn from 遍历 / 抓取 / 必须).

**Application.** All 4 `before` strings occur exactly once in their base field, all 4 `after` strings are present, replay reproduces every patched field. All 4 are the Rule A text verbatim.

D-198, before → after (`d198.mjs`, 125 zh sources):

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | zh | 6 → 6 (非结构化数据, 2021r03-q004 ア, term, unchanged part) | 自动 (2) |
| p02 | zh | 9 → 9 (全文检索型搜索引擎, 2016h28a-q086 zh stem, term, unchanged part) | 自动 (2) |
| p03 | zh | 10 → 10 (Enterprise, name) | 不同 (2) |
| p04 | zh | 4 → 4 (企业内部, 2024r06-q031 zh stem) | 企业内部 (4) |

No patch adds an overlap. p01 / p02 move further from the 2016h28a-q086 zh stem (its verb pair is 巡回 / 采集; the after uses 遍历 / 抓取, and the before 巡访 / 收集 was not that pair either).

## 2. Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[1](エンタープライズサーチ).detail_zh` (+ explanation_zh) | L1 | Yes (§3.1): 「自动遍历并抓取文档」 — 遍历 / 抓取 are the usual zh IT verbs for a crawler (爬虫), no 日本語引きずり 巡访 left. = jp 自動的に巡回して集め / en (detail) visits and gathers | No | OK |
| p02 | `terms[1].points[1].text_zh` | L1 | Yes: 「自动遍历、抓取文档并将其作为检索索引素材的软件是爬虫」 — same verbs as p01; = jp 自動で巡回して集め / en "automatically visits and gathers documents". 2016h28a-q086 イ supported; CGI / XSS / backdoor not | No | OK |
| p03 | `terms[1].points[2].text_zh` | L2 | Yes: 作用却不同 = jp 役割は別である / en "their roles are different"; 完全 (extra emphasis) gone. The mix contrast with EA is still clear, so it still separates 2021r03-q004 ア from wrong エ (EA) | No | OK |
| p04 | `terms[2](SoR).points[0].text_zh` | L6 | Yes (§3.3): 「指的是必须准确保存企业内部重要记录、并能不停机持续运行的系统」 — the passive calque 被强烈要求 is gone. 必须 … 并能 is natural zh for jp 強く求められる (a requirement on the system). 2024r06-q031 エ SoR supported; SoE / IoT / PoC not | No | OK |

## 3. Focused checks

### 3.1 p01 / p02: crawler verbs

- detail_zh (after): 「…很多搜索引擎会用一种叫**爬虫**（[[jp:クローラ]]）的软件自动遍历并抓取文档，预先建好索引，方便查找。」
- points[1].text_zh (after): 「在全文检索型搜索引擎中，自动遍历、抓取文档并将其作为检索索引素材的软件是**爬虫**（[[jp:クローラ]]）。」
- 遍历 (traverse) + 抓取 (fetch / crawl) is the standard zh description of what a 爬虫 does. 巡访 (visit on tour) is not used in zh IT writing. The two fields now use the same verbs, and the derived explanation_zh follows (check.mjs).
- Bold / [[jp:]] unchanged (爬虫 + [[jp:クローラ]] kept). **Resolved.**

### 3.2 p03: 作用却不同

- After: 「…两者名字里都有 Enterprise，作用却不同。」 = jp 「名前の Enterprise が共通でも、役割は別である。」 / en "They share the word enterprise, but their roles are different." Strength now matches jp / en. **Resolved.**

### 3.3 p04: SoR point and the L4 regression check

- After: 「**SoR** 指的是必须准确保存企业内部重要记录、并能不停机持续运行的系统。」
- jp 「社内の重要な記録を正確に保ち、止まらずに動き続けることが強く求められるシステムを指す概念である」 / en "systems that are strongly required to keep a company's important records accurate and to keep running without stopping". The zh 必须 governs both requirements (accurate records; keep running without stopping), matching jp's two-part 求められる. 必须 is a little firmer than 強く求められる, but it describes a requirement, not a claim that such systems never stop. No new fact.
- Rule A L4 (record only: the SoR / SoE points paraphrase the 2024r06-q031 stem pair) is not made worse. zh LCS with the q031 zh stem stays 4 (企业内部); the q031 zh wording 要求高可靠性和稳定运行 is not echoed (the after has neither 要求 nor 可靠性). jp is untouched.
- Consistency: one_zh 把可靠性和稳定运行放在首位, pairs[0] 重视的特性: 可靠性与稳定运行 — no contradiction. **Resolved.**

## 4. F-fix

No required F-fix. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - validate (unit and part): 0 warns.
   - `stage` meta is removed in the unit (as in b19–b59).
   - ruleA verbatim miss = none. No shortened strings in this batch.
   - Rule A's 建議修 IDs are L1 / L2 / **L6** (not L3). The mapping above follows the Rule A file.

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope; **0 introduced**
- LOW introduced: 0. Obs. 1 is script notes.
- **Application:** 4/4 exact (replay, part-level). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (45 checked, 0 mismatch). 4/4 are the Rule A text verbatim. Every 建議修 (L1, L2, L6) is covered.
- **D-198:** no patch adds an overlap (zh LCS unchanged in all 4: 6 / 9 / 10 / 4, all term or name spans). p01 / p02 move further from the 2016h28a-q086 zh stem verbs.
- **D-200:** jp of the patched points unchanged (≤ 2 sentences, ≤ 86 chars per Rule A). **D-202:** [[jp:]] counts unchanged. **D-204 / D-205 / D-210:** no law, standard or numeric claim added.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0, 0 warns
  - validate --part: 0 issues (sha256 = base_sha256)
  - parity: 0 diff (20 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 4 active patches of strategy-06-18-u01 are applied exactly. Each resolves its Rule A 建議修 (L1, L2, L6; zh only), and none introduces a HIGH, MEDIUM or LOW. No required F-fix.
