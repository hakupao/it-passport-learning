# b45 B3 patch re-review — strategy-03-12 u01–u02 (経営資源を統合する情報システム / 品質・プロセス改善, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b45rv/` (derived from `b44rv/`).
- Date: 2026-11-07 (Session 149)
- Scope: the B3 wording patches for strategy-03-12 u01–u02. **22 are `active` and 0 retired**: u01 p01–p16 / u02 p01–p06 (`patches/strategy-03-12-u0{1,2}.json`).
  I checked each patch against the Rule A prescriptions in `strategy-03-12-u0N.ruleA.md`:
  - u01 (Rule A PASS, 建議修 L1 / L2 / L7 / L8): L1 → p01–p03 (三語), L2 → p04–p06 (三語), L7 → p07–p12 (zh ×5 / en ×1), L8 → p13–p16 (zh / en ×2)
  - u02 (Rule A PASS, 建議修 L1 / L2 / L3 / L10a): L1 → p01–p03 (三語), L2 → p04 (jp only), L3 → p05 (zh), L10a → p06 (zh)
  Every 建議修 in u01–u02 is covered. LOWs marked 記録のみ and not patched are not re-ruled here.
- Pre-patch bases, located by sha256 = `base_sha256` (one base per unit, shared by all its patches):
  - u01 `data/ip/textbook/.planning/v2/strategy-03-12-u01/parts/b45-u01-a2/strategy-03-12-u01.loc.r0.json` `88fa21df19e69542…`
  - u02 `data/ip/textbook/.planning/v2/strategy-03-12-u02/parts/b45-u02-a1/strategy-03-12-u02.loc.r0.json` `32574ea788d4f177…`
- Merged units (current) `data/ip/textbook/units/strategy-03-12-u0N.json` sha256: u01 `61358728faebf5b6…` / u02 `fe1424b0408ea8d9…`. They differ from their bases only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only). Strings shown are unit text, patch text or term names. Matched jp fragments are ≤13 chars. en / zh fragments come from the project's own translation layer (not IPA text) and are quoted up to 38 chars where the D-198 table needs them.

## 0. Method

Same as `b43_patch_rereview.md` §0. No `unit.*` patch is in this batch. Topic strategy-03-12 has 34 questions, so there are 170 source strings per language.

1. **Application check** (`b45rv/check.mjs`): `after` present; `before` once in base; replay in file order = unit field; every changed base-present path explained; before / after verbatim in the Rule A file. Plus `b45rv/extra.mjs`: **net** `before` remnant count.
   u02 `terms[3].detail_zh` carries two patches (p02 = sentence 2, p06 = sentence 3). The replay applies them in file order on the same field and compares the result with the unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*`, with the corrected hooked-terms pairing (u02: 4 terms, 3 hooks).
3. **D-198** (`b45rv/d198b.mjs`, + `b45rv/win.mjs` and `b45rv/near.mjs` to print the matching windows): whole-field LCS before → after, and LCS of the `after` span against the 170 sources per language. For jp: 12-char windows (≤2 substitutions), unmasked / masked, + wDice; `near.mjs` = semi-global edit distance ≤2 per 12-char window (no katakana masking, and a folded run with katakana ≥4 masked), + whole-sentence ed / Dice against named sources.
4. **Cited-question checks.** Re-read in `data/ip/quiz/questions.json` + `translations/<exam>.json` (stem_jp_clean, zh / en layers): 2010h22h-q009 (value chain concept; answer イ; wrong コアコンピタンス / PPM / PLC), 2018h30h-q012 (value chain description; answer ア; wrong = core competence / PLC / PPM), 2014h26h-q016 (system aiming to maximise customer lifetime value, defined in the stem as the *expected* profit; answer ア CRM), 2019h31h-q022 (system used for support activities; answer ウ HRM; wrong CAD/CAM, CRM, SFA), 2015h27a-q006 (SCM description; answer ウ; イ = ERP description), 2013h25h-q014 (方針管理 as a technique of 総合的品質管理 (TQM 又は TQC); answer ウ), 2017h29h-q006 (TOC; answer エ).
5. **Manual reading** of each patched field in context: u01 the whole of バリューチェーンマネジメント (one / detail / points[0..1] / fig support branch), CRM detail (all three sentences), ERP detail / points[0..2] / fig root, `overview_rows[0]`, `key_points_zh` / `key_points_en`; u02 TQC / TQM one (三語) + TQC points[0], シックスシグマ detail, TOC detail + fig steps (三語).
6. **Gates** (each run on both units):
   - `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`
   - `scripts/textbook-v2-parity.mjs --unit`
   - `npx vitest run src/lib/textbook`
   - `node --test scripts/textbook-v2-patch.test.mjs`

**Not established** (same as b14–b44): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 127 / u02 86) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-07)

```
validate --unit: u01 0 issues | u02 0 issues | EXIT 0 ×2
validate --part (base): u01 loc#0 0 issues (sha256 88fa21df… = base_sha256)
                        u02 loc#0 0 issues (sha256 32574ea7… = base_sha256)
parity --unit: u01 29 / u02 23 locations, 0 diff
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  u01 active 16 ok 16 | u02 active 6 ok 6 | replay mismatch 0 (incl. u02 terms[3].detail_zh = p02 + p06)
  raw remnant flags: u01 p12 (key_points_en[4] + summary copy), u02 p05 (terms[2].detail_zh + explanation_zh) → extra.mjs net remnant 0 for all 22
  changed base-present paths = patched fields + 'stage' (u01 16+1 / u02 5+1 [p02/p06 share a field]); unexplained besides 'stage': 0
  derived checked 69 / 45, mismatch 0
  memory_hooks suffix (index pairing): u01 0 bad, u02 3 bad (jp/zh/en [2])
  memory_hooks (hooked-terms pairing): u01 6/6, u02 3/3 in each of jp/zh/en, bad 0
  ruleA verbatim miss: u01 [] | u02 []
```

Notes on the output:
- **Raw remnant flags are false positives.** u01 p12 only moves `**`: the inline-stripped `before` "The SECI model shows" is also the stripped `after`. u02 p05 is an insertion whose `before` is a substring of `after` (「例如，」 + before). Net `before` remnants: 0.
- **u02 memory_hooks "bad"**: index shift only (known false positive). TQM (`terms[1]`) has no hook, so `memory_hooks_*[2]` belongs to TOC, not `terms[2]`. The corrected check is 3 / 3 clean in all three languages. No patch in this batch touches a hook.
- **Verbatim**: all 22 `before` / `after` strings occur in the Rule A files (Rule A u01 L1 / L8 quote whole sentences; the patches use the sub-span from the first changed word, which is the same edit).

**Application.**
- All 22 `before` strings occur exactly once in their base field, and all 22 `after` strings are present. Replay in file order reproduces every patched field.
- **u02 `terms[3].detail_zh` (p02 + p06): both applied cleanly.** The two `before` spans do not overlap (p02 = sentence 2 「只会让在制品越积越多，」, p06 = sentence 3 「不追求各部分的效率，而是…」), each occurs once in the base, and the replay of p02 then p06 equals the unit field. Current text: 「…只会让瓶颈前的在制品越积越多，或让后面的工序空等，成果并不会增加。比起各部分的效率，更重视让相连整体的成果达到最大，这就叫整体最优。」. `explanation_zh` = stripInline of it (derived check ok).
- Changed base-present paths are the patched fields plus the removed `stage` meta key, as in b19–b44. Base-only top keys `stage / round / jp_round` are part metadata. Unexplained content diffs: 0.

**Derived fields.** 114 checked, 0 mismatch. Patched fields that feed derived copies: u01 p04–p06 → `terms[0].explanation_*`, p08 → `terms[2].explanation_zh`, p09 → `summary.key_points_zh[2]`, p12 → `summary.key_points_en[4]`; u02 p01–p03 → `terms[3].explanation_*` (p02 + p06 for zh), p04 → `terms[1].definition_jp`, p05 → `terms[2].explanation_zh`. All follow. Points (u01 p01–p03, p13–p16), fig labels (p07, p10) and `overview_rows` (p11) have no derived copies.

**Notation.** Bold counts are unchanged in every patched field (u01 p12 moves the bold off "The": 2 → 2 markers). `[[jp:]]` counts are unchanged except the intended additions: u01 p13 / p14 0 → 2 (主活動 / 支援活動), p15 / p16 0 → 1 (基幹業務). All three origins occur in the jp text of the same point (VC points[1]「主活動全体」「支援活動」; ERP points[2]「基幹業務」), D-202 ✓.

D-198, before → after (`d198b.mjs`, 170 sources per language):

| Patch | Lang | LCS before → after (nearest source) | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|
| u01 p01 | **jp** | **13 → 8** (q009 stem 「製品やサービスの付加価値が」 → term 「バリューチェーン」 = q009 イ correct) | バリューチェーン (8, term) | **18 / 18 → 0 / 0**; 0.56 → 0.39 (§3.1) |
| u01 p02 | zh | **12 → 5** (q009 stem zh → q022 stem 为主要活动) | 为主要活动 (5, term) | — |
| u01 p03 | en | 38 → 38 (unchanged part, q009 stem en) | "s activities into primary activities (" (38, term names; §3.1) | — |
| u01 p04 | **jp** | 10 → 10 (unchanged part 「することを目標の一つ」, q016 stem) | れる利益の (5) | 4 / 4 → 4 / 4 (unchanged clause, Rule A L3 / §1-4(c)); 0.25 → 0.25 |
| u01 p05 | zh | 6 → 6 (unchanged part) | 企业带来的利 (6) | — |
| u01 p06 | en | 26 → 31 (q016 stem en) | " customer is expected to bring " (31, the restored qualifier; §3.2) | — |
| u01 p07 | zh | 3 → 3 | ERP (3, term) | — |
| u01 p08 | zh | 7 → 7 (unchanged part, term) | 数据库 (3) | — |
| u01 p09 | zh | 5 → 5 (unchanged part) | 数据库 (3) | — |
| u01 p10 | zh | 2 → 4 | 综合管理 (4, generic) | — |
| u01 p11 | zh | 4 → 4 (unchanged part) | 客户信息 (4, unchanged) | — |
| u01 p12 | en | 20 → 20 (unchanged part, term) | "the se" (6) | — |
| u01 p13 | zh | 6 → 6 (unchanged part) | 整个主要活动 (6, q022 stem; term + 整个) | — |
| u01 p14 | en | 42 → 32 (q022 stem en) | "support the primary activities " (31; q022 answer ウ HRM, §3.3) | — |
| u01 p15 | zh | 5 → 4 | 核心业务 (4, term) | — |
| u01 p16 | en | 16 → 26 (q006 イ en) | " core business operations " (26, term translation of 基幹業務; §3.3) | — |
| u02 p01 | **jp** | 6 → 6 (term ボトルネック, unchanged part) | だけで (3) | 0 / 0 → 0 / 0; 0.13 → 0.12 |
| u02 p02 | zh | 4 → 4 (unchanged part) | 加快 (2) | — |
| u02 p03 | en | 21 → 21 (unchanged part) | " process " (9) | — |
| u02 p04 | **jp** | 10 → 10 (Management) | Management (10, unchanged part) | 2 / 0 → 2 / 0 (unchanged English expansion, FP); 0.20 → 0.21 |
| u02 p05 | zh | 3 → 3 | 按照 (2) | — |
| u02 p06 | zh | 4 → 4 (unchanged part 整体最优) | 的效率 (3) | — |

No patched text comes near the calibration HIGH (ed 0.14 / Dice 0.52). u01 p01–p03 remove every jp window behind u01 L1 (18 / 18 → 0 / 0; semi-global 9 + 9 → 0) and cut the zh LCS with the q009 stem from 12 to 5. No patch adds a jp window. The en overlaps that grow (p06 31, p16 26) are a restored qualifier and a term translation (§3.2, §3.3). None leans toward a wrong option.

## 2. Per-patch verdict

| Unit / IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| u01 p01–p03 | `terms[3](バリューチェーンマネジメント).points[0].text_*` | L1 | Yes (§3.1): 「…主活動と支援活動に分けたうえで、付加価値を上乗せしている活動がどれかを突き止める分析の枠組みである。」 jp 62 chars (normalised), 1 sentence (D-200 ✓); 主活動 / 支援活動 qualifier kept in all three; q009 イ / q012 ア still supported | No | OK |
| u01 p04–p06 | `terms[0](CRM).detail_*` (+ `explanation_*`) | L2 | Yes: 「もたらすと見込まれる」 / 预计 / "is expected to bring" restore q016's 予想される; claim (CRM aims to grow it) and q016 ア unchanged | en 31-char overlap with q016 stem en (LOW record, §3.2) | OK |
| u01 p07–p09 | `terms[2](ERP).fig.data.root.label.zh`, `terms[2].detail_zh` (+ `explanation_zh`), `key_points_zh[2]` (+ summary) | L7 | Yes: 共享数据库 ×3 = en "shared database"; all three ERP occurrences now agree (no 共同数据库 / 共同的数据库 left in u01; the remaining 共同 is the SECI stage name 共同化, Rule A L9) | No | OK |
| u01 p10 | `terms[3].fig…children[1].children[0].label.zh` | L7 | Yes: 综合管理 = jp 全般管理 / en General management; no longer reads as 全面质量管理 | No | OK |
| u01 p11 | `overview_rows[0].extra_zh[0]` | L7 | Yes: 客户信息与服务记录 = jp 「顧客の情報と対応の履歴」 / en "interaction history"; the hospitality reading of 接待 is gone | No | OK |
| u01 p12 | `key_points_en[4]` (+ summary) | L7 | Yes: "The **SECI model** shows" = jp bold on SECIモデル only | No | OK |
| u01 p13–p14 | `terms[3].points[1].text_zh` / `text_en` | L8 | Yes: 主活動 / 支援活動 `[[jp:]]` on first use in the point, same form as points[0]; zh 「人力资源管理信息系统（HRM）」 removes the 人事管理 / 人力资源管理 overlap and the inline half-width glossary format; validate zh-term warn 0. q022 ウ HRM still the supported answer | No | OK |
| u01 p15–p16 | `terms[2].points[2].text_zh` / `text_en` | L8 | Yes: 基幹業務 `[[jp:]]` on first use in the mix point, same as points[1]; en "core business operations" = points[1].text_en / detail_en wording | No | OK |
| u02 p01–p03 | `terms[3](TOC).detail_*` (+ `explanation_*`) | L1 | Yes: 「手前に仕掛品がたまるか後ろの工程が手待ちになるだけ」 / 瓶颈前的在制品…或让后面的工序空等 / "in front of it or leaves later steps waiting" = fig steps[1] (WIP piles at B) and steps[2] (C gets only 5); conclusion 「成果は増えない」 kept; q006 エ unaffected | No | OK |
| u02 p04 | `terms[1](TQM).one_jp` (+ `definition_jp`) | L2 | Yes: TQM now also carries 総合的品質管理, so q014's 「総合的品質管理 (TQM 又は TQC)」 maps onto both terms; still 1 sentence (validate `sentences()` ignores 。 inside brackets); zh / en need no note (§3.4) | No (style note, obs. 2) | OK |
| u02 p05 | `terms[2](シックスシグマ).detail_zh` (+ `explanation_zh`) | L3 | Yes: 「例如，改进可以按照…」 = jp 「例えば」 / en "for example"; DMAIC no longer reads as the only sequence | No | OK |
| u02 p06 | `terms[3](TOC).detail_zh` (+ `explanation_zh`) | L10a | Yes: 「比起各部分的效率，更重视…」 is a comparison like jp 「部分ごとの効率よりも」 / en "rather than"; part efficiency is no longer negated | No | OK |

## 3. Focused checks

### 3.1 u01 p01–p03 (L1): value-chain point vs 2018h30h-q012 ア / 2010h22h-q009 stem

- After jp: 「バリューチェーンは、企業活動を主活動と支援活動に分けたうえで、付加価値を上乗せしている活動がどれかを突き止める分析の枠組みである。」 All three are Rule A's proposed text verbatim.
- **The re-phrased answer-option clause is gone.** Base had 「製品やサービスの付加価値が」 (13 chars exact with both q009 stem and q012 ア) + 「どの活動で生まれているかを分析する」 (a word-swap of the sources' 「事業活動のどの部分で生み出されているかを分析する」).
  - `win.mjs` jp windows 18 / 18 → 0 / 0; `near.mjs` semi-global ed ≤2 windows 9 (q009 stem) + 9 (q012 ア) → 0 + 0, both raw and with katakana masked. The longest jp overlap is now the term name バリューチェーン (8).
  - Whole sentence: vs q012 ア Dice 0.49 → 0.21 (ed 0.77 → 0.82); vs q009 stem Dice 0.47 → 0.28 (ed 0.61 → 0.80). Rule A's measured values (q009 0.28 / 0.79, q012 0.24) reproduce within method noise.
  - zh LCS with the q009 stem 12 → 5; the en `after` drops "the added value of a product or service" (the echo of the sources' "added value of the company's products or services").
- **en p03 remaining 38-char overlap** "…s activities into primary activities (" with the q009 stem en is in the unchanged part and consists of the two category names the point must state (the 主活動 / 支援活動 qualifier Rule A asked to keep). It is the same in the base and comes from our own translation layer. Record only (obs. 1).
- **Correct answers still supported, no wrong option.** "Divide into primary / support activities, then find which activities add value" is the value chain (q009 イ, q012 ア). コアコンピタンス (core strength), PPM (resource allocation across products) and PLC (stage-dependent strategy) get no support. 「上乗せしている」 = value being added along the chain, consistent with one (「価値が積み重なるつながり」 / 「どの活動が付加価値を生んでいるか」).
- D-200: 1 sentence, 62 chars normalised (Rule A: 65 chars), framing 0 (validate). D-202: バリューチェーン / 主活動 / 支援活動 occur in the jp sentence.
- **Resolved.**

### 3.2 u01 p04–p06 (L2): customer lifetime value qualifier vs 2014h26h-q016

- The q016 stem defines customer lifetime value as profit the customer is *expected* to bring. Base jp / zh / en stated it as a plain total. The patches add 「と見込まれる」 / 预计 / "is expected to".
- jp: the new span adds no window. The 4 / 4 jp windows in `detail_jp` (before = after) are all in the unchanged final clause 「…大きくすることを目標の一つにする」 vs the stem's 「…を最大化することを目標の一つとする」. Rule A §1-4(c) recorded this headword-anchored near-match. The patch does not touch it, and it is not re-ruled here.
- **en: LOW (record).** The new en overlaps the q016 stem en by 31 chars (" customer is expected to bring "); the whole sentence vs the stem's definitional sentence goes Dice 0.70 → 0.74. Ruling:
  - The overlap is the qualifier Rule A L2 asked to restore. Any faithful en for 予想される lands on "expected to".
  - The shared clause is the stem's own definition of the term, not an option. D-198 allows a standard definition: no scene, number or subject is taken, and wording differs ("total profit" vs "amount of profit", "the whole time they keep buying" vs "their lifetime").
  - The jp source of truth has a 5-char longest overlap in this sentence, and the en is our own translation layer.
  - zh Dice vs the stem zh 0.39 → 0.38.
  Same pattern as b43 §3.1 (overlap created by restoring a required qualifier). No reword proposed.
- **Resolved.**

### 3.3 u01 p13–p16 (L8): `[[jp:]]` additions and new en overlaps

- p13 / p14 add 主活動 / 支援活動 to VC points[1]. They already appear in VC points[0] and detail, but D-202 counts first use per point, and Rule A L8 cites the in-directory precedent (LOW-level 併記 fixes). That is consistent.
- p13 zh: 「人力资源管理信息系统（HRM）」. `zh_terms.json` has HRM → 「HRM(人力资源管理)」. The new form keeps the expansion and the key HRM, and validate gives zh-term warn 0. That agrees with Rule A's check of the LATIN_WORD branch.
- p14 en: LCS with the q022 stem en drops from 42 to 32. The stem defines support activities as supporting the primary activities as a whole (= the point's claim). This is the standard definition, the q022 answer is ウ HRM (the point names HRM), and no wrong option is touched.
- p16 en: the 26-char overlap " core business operations " with 2015h27a-q006 イ en (the ERP description, wrong for that SCM question). This is the unit's fixed en for 基幹業務 (also points[1].text_en and detail_en), now aligned in the mix point. The point contrasts ERP (own core operations) with SCM (across companies), which helps pick ウ over イ in q006. It does not lean toward イ.
- **Resolved.**

### 3.4 u02 p04 (L2): TQM alias 総合的品質管理 (jp only) — do zh / en need the same note?

- After jp: 「**TQM** (Total Quality Management、総合的品質経営。総合的品質管理と呼ぶこともある) は、…」. The jp gap was that the unit gave 総合的品質管理 only to TQC (`terms[0].one_jp`), while q014 uses 総合的品質管理 for both TQM and TQC. It is now closed: both terms carry the name. That is factually correct (総合的品質管理 is a common Japanese rendering of TQM, as q014 itself shows).
- **zh / en: no note needed.** The gap does not exist in those layers:
  - zh: TQM's own name is 全面质量管理 (zh_terms TQM → 全面质量管理（TQM）), which is exactly how the q014 zh layer renders 総合的品質管理 (「全面质量管理（TQM 或 TQC）」). TQC = 全面质量控制. A zh copy of the note would read 「全面质量管理，也称全面质量管理」 (tautology).
  - en: TQM's expansion is "Total Quality Management", and the q014 en layer names both expansions ("Total Quality Management (TQM) or Total Quality Control (TQC)"). A copy of the note would be tautological here too.
  - The note is a jp naming fact, like an original-language alias. Parity tool: 0 diff (23 locations).
- q014 is still solvable in all three languages. TQC points[0] (方針管理, jp 総合的品質管理の手法 / zh 全面质量控制方法 / en total quality control technique) + TQM mix point (TQM builds on TQC). Answer ウ is supported, and BSC / benchmarking / small-group activity get no support.
- Style (record, obs. 2): the alias is joined with a 句点 inside the parentheses. validate's `sentences()` does not split on 。 inside brackets, so one_jp is still 1 sentence (validate 0 issues). 「、総合的品質管理とも呼ぶ」 would read more smoothly, but this is not required.
- **Resolved.**

### 3.5 u02 p01–p03 + p06 (L1, L10a): TOC detail

- Mechanism: speeding up a step before the bottleneck piles WIP in front of it, and speeding up a step after it leaves that step idle. That matches fig steps[1] (「ここで仕掛品がたまる」 at B) and steps[2] (C can do 9 but gets 5), which were the conflict in Rule A L1. 「手前」 / 瓶颈前 / "in front of it" all refer back to the bottleneck named in the same sentence.
- zh sentence 3 (p06) now uses a comparison (比起…更重视…), not a negation, matching jp 「よりも」 / en "rather than". The term 整体最优 is kept.
- q006 (TOC = process-wide optimisation by removing bottlenecks etc.) is still answered by one / points; no wrong option (CRM / HRM / SFA) is touched.
- **Resolved.**

## 4. F-fix

None. No patch introduces a HIGH, MEDIUM or LOW defect that needs a change before commit.

## 5. Observations (record only)

1. LOW, u01 p03 / p06 / p14 / p16 en overlaps (§3.1–3.3): term names, the restored qualifier and a fixed term translation. No reword is possible without undoing L1 / L2 / L8. Note for the main session: Rule A u01 L2 measured jp only; the en whole-sentence Dice for CRM detail sentence 3 vs the q016 stem definition is 0.70 (base) → 0.74 (after). The HIGH calibration (Dice 0.52) was set on jp, so there is no en-layer convention yet. Consider fixing one for future batches.
2. LOW (style), u02 p04: 「総合的品質経営。総合的品質管理と呼ぶこともある」 joins the alias inside the parentheses with 。. It is valid (1 sentence per validate). The optional smoother form is 「総合的品質経営、総合的品質管理とも呼ぶ」.
3. Script notes:
   - The index-paired memory_hooks check misreports u02 (TQM has no hook). The corrected check is clean.
   - The raw remnant check flags u01 p12 (bold move) and u02 p05 (insertion). The net count is 0.
   - `stage` meta is removed in both units (as in b19–b44).

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope; **0 introduced**
- LOW introduced: 0 that need a fix. Recorded: obs. 1–2. Obs. 3 is script notes.
- **Application:** 22/22 exact (replay, incl. the two-patch field u02 `terms[3].detail_zh`). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (114 checked, 0 mismatch), and all 22 match the Rule A text. Every 建議修 (u01 L1 / L2 / L7 / L8, u02 L1 / L2 / L3 / L10a) is covered.
- **D-198:** u01 p01–p03 remove the L1 near-copy (jp windows 18 / 18 → 0 / 0, Dice 0.49 → 0.21 vs q012 ア, 0.47 → 0.28 vs q009 stem). No patch adds a jp window. The en overlaps that grow are a restored qualifier and a term translation (LOW record). Nothing leans toward a wrong option.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 ×2
  - validate --part: 0 issues ×2 (sha256 = base_sha256)
  - parity: 0 diff ×2 (29 / 23 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 22 active patches of strategy-03-12 u01–u02 are applied exactly. Each resolves its Rule A finding, and none introduces a HIGH, MEDIUM or LOW that needs a fix.
- u01 L1: the value-chain point no longer re-phrases q012 ア / the q009 stem, and the 主活動 / 支援活動 qualifier and the q009 イ / q012 ア answer are kept.
- u02 p04: the jp-only TQM alias is correct as jp-only, because zh / en already name TQM with the counterpart of 総合的品質管理.
- No F-fix.
