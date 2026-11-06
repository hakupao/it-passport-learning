# b34 B3 patch re-review — strategy-05-14 u06–u09 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the per-unit Rule A audits, and I share no context with them (Rule D)
- Date: 2026-11-07 (Session 149)
- Scope: B3 wording patches for strategy-05-14-u06 (p01–p07), u07 (p01–p09), u08 (p01–p08) and u09 (p01–p07)
  — **31 `active`, 0 retired** (`patches/strategy-05-14-u0{6,7,8,9}.json`). Each patch was checked against the Rule A prescriptions:
  `-u06` L1〜L3 建議修; `-u07` L1・L2・L4 建議修; `-u08` L1〜L4 建議修; `-u09` L1〜L3 建議修. Nothing deliberately left out.
  The 4 Rule A files report MEDIUM 0 / HIGH 0. Coverage: u06 7 = L1 p01–p03 / L2 p04–p06 / L3 p07; u07 9 = L1 p01–p03 / L2 p04–p06 / L4 p07–p09; u08 8 = L1 p01–p03 / L2 p04 / L3 p05–p07 / L4 p08; u09 7 = L1 p01–p03 / L2 p04–p06 / L3 p07.
  Also checked against the merged units `data/ip/textbook/units/strategy-05-14-u0{6..9}.json` (sha256 u06 `922c73cfa28e2083…`, u07 `449f2064b1e793f4…`, u08 `625e6658476bdf09…`, u09 `d4774b57a5b6ed79…`).
- Pre-patch bases, located by sha256 = `base_sha256`. All patches of a unit share one base, and all match:
  u06 `b34-u06-a2/…loc.r0.json` (`74b3a7b4…`; B5 = JP from a1, loc a2), u07 `b34-u07-a2/…loc.r0.json` (`88ed6f6e…`), u08 `b34-u08-a1/…loc.r0.json` (`6787baba…`), u09 `b34-u09-a2/…loc.r0.json` (`7333dc81…`).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only). Strings shown are unit text, patch text, term names or primary-source text. Matched fragments are ≤12 chars, except en sidecar overlaps, which are project translations.

## 0. Method

Same as `b33_patch_rereview.md` §0. Topic strategy-05-14 has 39 questions; 2019h31h-q093 stays in the source set (script unchanged), so 40 questions and 200 source strings per language.

1. **Application check** (`b34rr/check.mjs`, run unchanged): `after` present; `before` once in base; replay in file order = unit field; no `before` remnant (raw and stripped) anywhere in the unit; every changed base-present path explained; before / after verbatim in the Rule A file.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`); `summary.memory_hooks_*` matched in order over hooked terms (`b34rr/focus.mjs` inline check).
3. **D-198** (`b34rr/d198b.mjs`): whole-field LCS before → after and `after`-span LCS vs 200 sources per language; jp 12-char windows (≤2 substitutions) unmasked / masked + wDice. Per-choice + stem LCS before → after (`b34rr/focus.mjs pc`) against the qids the focused patches touch (2026r08-q027, 2020r02o-q032, 2025r07-q008, 2024r06-q012, 2026r08-q017); new masked windows listed (`focus.mjs win`).
4. **Primary sources (fresh)**: 「人間中心のAI社会原則」(平成 31 年 3 月 29 日 統合イノベーション戦略推進会議決定; mhlw.go.jp/content/10601000/000502283.pdf, pdftotext) and 人工知能学会倫理指針 (2017-02, ai-gakkai.or.jp PDF, pdftotext). Downloads kept in scratchpad `b34rr/dl/`.
5. **Manual reading** of each patched field in context (whole term; overview_rows; pairs; key_points; summary; quiz qids).
6. **Gates**: `scripts/textbook-v2-validate.mjs --unit` / `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`.

Not established (as in b14–b33): the unit files carry the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u06 100, u07 123, u08 98, u09 115) were checked for derived copies and `before` remnants. No law text is touched.

## 1. Script results (fresh, 2026-11-07)

```
✓ strategy-05-14-u06 unit: 0 issues   validate EXIT=0 | ✓ parity: 25 locations, 0 diff
✓ strategy-05-14-u07 unit: 0 issues   validate EXIT=0 | ✓ parity: 27 locations, 0 diff
✓ strategy-05-14-u08 unit: 0 issues   validate EXIT=0 | ✓ parity: 26 locations, 0 diff
✓ strategy-05-14-u09 unit: 0 issues   validate EXIT=0 | ✓ parity: 28 locations, 0 diff
validate --part (bases): ✓ u06 / u07 / u08 / u09 loc#0: 0 issues (sha256 = base_sha256 ×4)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
check.mjs: active 7/9/8/7, ok 7/9/8/7, issues 0 ×4
```

**Application.**
- All 31 `before` strings occur exactly once in their base field; all 31 `after` present; replay reproduces every patched field (4/4 units). Each field carries one patch.
- Changed base-present paths: u06 7, u07 9, u08 8, u09 7 = exactly the patched fields, plus the removed `stage` meta key (as in b19–b33). Unexplained diffs: 0.
- `before` remnants: 0 in all four units (no false positives this batch).
- `check.mjs` "ruleA verbatim miss": u06 / u07 / u09 []; **u08 [p03] is a script artifact**: the Rule A file writes the en hook with markdown-escaped quotes (`comes from \"Explainable.\"` / `\"eXplainable.\"`); both escaped strings are present (checked: true / true). 31/31 = Rule A prescribed text.

**Derived fields.**
- Patched-field derivations: u06 `explanation_*` t0 ×3 / t4 ×3; u08 `memory_hook_*` t2 ×3 / t3 zh; u09 `explanation_*` t3 ×3; u09 `summary.key_points_en[3]` — all true. Full walk 51 + 66 + 54 + 63 = 234 derived strings, 0 mismatch.
- `summary.memory_hooks_*`: index-matched check reports `bad` jp/zh/en[4] for u07. **Confirmed index shift**: u07 terms[3] (AIによる自動化) has no hook, so the summary holds 5 entries for hooked terms 0,1,2,4,5. Matched in order: u06 9 / u07 15 / u08 12 / u09 12 = 48 entries, **0 bad**, lengths equal.

**Notation.** bold / `[[jp:]]` counts unchanged in 30 of 31 fields. u08 p08 adds one `[[jp:ヒューマンインザループ]]` in `terms[3].hook_zh` (prescribed text): the 原語 is the jp headword, `memory_hook_zh` strips it correctly, parity 0 diff.

D-198, before → after (`d198b.mjs`):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| u06 p01 | **jp** | 2026r08-q017 stem | 7 → 7 (プライバシーの, unchanged part) | 社会の (3) | 0 / 0 → 0 / 0; 0.13 → 0.13 |
| u06 p02 | zh | 2023r05-q034 stem | 4 → 4 (AI本身) | same (4) | — |
| u06 p03 | en | 2024r06-q012 stem | 15 → 15 (" guidelines con", unchanged) | " states that " (13, generic) | — |
| u06 p04 | **jp** | 2022r04-q021 stem | 11 → 11 (document name 人間中心のAI社会原則) | が留意すべき事 (7, 2023r05-q034 stem) | **6 / 6 → 8 / 8**; 0.27 → 0.28 (obs. 1) |
| u06 p05 | zh | 2022r04-q021 stem | 7 → 7 (document name) | 注意的事项 (5) | — |
| u06 p06 | en | 2022r04-q021 stem | 37 → 37 (document name, unchanged) | " should keep in mind" (20, 2023r05-q034 stem; obs. 1) | — |
| u06 p07 | en | 2024r06-q012 stem | 23 → 23 (principle name) | " together with a" (16, generic) | — |
| u07 p01 | **jp** | 2026r08-q027 stem → q027 ア | 6 → 6 | 判断すること (6, generic) | **1 / 1 → 0 / 0**; 0.31 → 0.17 |
| u07 p02 | zh | 2023r05-q034 stem | 4 → 4 (进行判断) | same | — |
| u07 p03 | en | **2026r08-q027 stem** → 2017h29h-q024 ウ | **42 → 16** | " the field of ta" (16, generic) | — |
| u07 p04 | **jp** | 2019r01a-q022 ウ | 4 → 4 (のような) | same | 0 / 0 → 0 / 0; 0.14 → 0.14 |
| u07 p05 / p06 | zh / en | — | 2 → 2 / 11 → 9 | 别的 (2) / "s like a " (9) | — |
| u07 p07–p09 | jp / zh / en | 2023r05-q014 stem | 7 / 7 / 29 → same (自然言語処理, unchanged term) | ≤5 / 2 / 13 (generic) | jp 0 / 0 → 0 / 0 |
| u08 p01–p03 | jp / zh / en | — | 3 / 2 / 8 → same | ≤8 (generic) | jp 0 / 0 → 0 / 0 |
| u08 p04 | **jp** | 2025r07-q028 ウ | 5 → 5 (に基づいて) | ごとに (3) | 0 / 0 → 0 / 0 |
| u08 p05–p07 | jp / zh / en | 2023r05-q034 stem (after) | 2 / 2 / 8 → 4 / 2 / 11 | 受け入れ (4) / 决定 (2) / " and decide" (11, generic) | jp 0 / 0 → 0 / 0; 0.17 → 0.24 |
| u08 p08 | zh | — | 2 → 2 | — | — |
| u09 p01 | **jp** | **2025r07-q008 stem** → 2013h25a-q100 stem | **7 → 4** | データの (4) | **1 / 1 → 0 / 0**; 0.29 → 0.25 |
| u09 p02 | zh | 2025r07-q008 stem | 6 → 4 (数据质量) | same | — |
| u09 p03 | en | 2025r07-q008 stem | **26 → 16** ("ing data quality") | same | — |
| u09 p04 | **jp** | 2012h24a-q030 stem | 5 → 5 | 責任を負う (5, 2024r06-q012 イ) | 0 / 0 → 0 / 0; 0.17 → 0.16 |
| u09 p05 / p06 | zh / en | — | 4 → 4 / 15 → 15 (unchanged parts) | 2 / 10 | — |
| u09 p07 | en | 2024r06-q012 イ | 10 → 18 ("re responsibility ") | same (obs. 3) | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52). Masked 12-char windows: 0 → 0 in 7 of 10 jp patches, 1 → 0 in u07 p01 and u09 p01 (the two targeted removals), and 6 → 8 in u06 p04 (obs. 1).

Per-choice check (LCS before → after; `focus.mjs pc`):
- **2026r08-q027** (weak AI; correct イ) × u07 p01–p03: jp stem 6 → 4, ア 3 → 6 (判断すること), イ* 3 → 4, ウ 3 → 3, エ 5 → 4; zh flat ≤3; en stem **42 → 9**, ア 16 → 5, イ* 9 → 9, ウ 9 → 10, エ 12 → 8. × u07 p04–p06: ≤3 jp, ≤1 zh, ≤9 en, flat. §3.3.
- **2020r02o-q032** (AI assistant; correct ア) × u07 p07–p09: flat (jp ≤4 stem 利用者の, ア* 2 → 2; en ≤11 " responses ").
- **2025r07-q008** (correct イ = all 4) × u09 p01–p03: stem jp 7 → 4 / zh 6 → 4 / en 26 → 16; choices (item-letter sets) 0–2 flat.
- **2024r06-q012 / 2026r08-q017** × u09 p04–p07: flat except en key_points p07 vs q012 イ 10 → 18 (obs. 3); q017 ≤9.

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u06 | p01–p03 | `terms[4](人工知能学会倫理指針).detail_*` (+ explanation) | L1 | Yes (§3.2): condition form = 第 9 条「となるためには」 | No | OK |
| u06 | p04–p06 | `terms[0](AI社会原則).detail_*` (+ explanation) | L2 | Yes (§3.1): addressee = primary text | LOW record (obs. 1 window; obs. 2 overview/pairs readers wording, pre-existing) | OK |
| u06 | p07 | `terms[0].points[2].text_en` | L3 | Yes: "build an environment" = jp 環境を整える / zh | No | OK |
| u07 | p01–p03 | `terms[1](汎用AI).points[0].text_*` | L1 | Yes (§3.3) | No | OK |
| u07 | p04–p06 | `terms[0](特化型AI).analogy_*` | L2 | Yes (§3.4) | No | OK |
| u07 | p07–p09 | `terms[4](AIアシスタント).points[0].text_*` | L4 | Yes: 問いかけ / 提问 / "request" cover typed and spoken input = one「話し掛けたり文字で尋ねたり」, q032 (text chat) | No | OK |
| u08 | p01–p03 | `terms[2](XAI).hook_*` (+ memory_hook, summary) | L1 | Yes (§3.5) | No | OK |
| u08 | p04 | `overview_rows[1].one_line_jp` | L2 | Yes: 変わりうる = one_jp / key_points_jp[1] / zh 可能 / en "can" | No | OK |
| u08 | p05–p07 | `terms[2].fig.data.nodes[3].label.*` | L3 | Yes (§3.5) | No | OK |
| u08 | p08 | `terms[3](ヒューマンインザループ).hook_zh` (+ memory_hook, summary) | L4 | Yes: the hook now names the jp term explicitly, so it no longer reads as if 人在回路 (`term_zh`) were the katakana word; = jp「片仮名にした語」/ en "The Japanese term" | No | OK |
| u09 | p01–p03 | `terms[0](アルゴリズムのバイアス).points[0].text_*` | L1 | Yes (§3.6) | No | OK |
| u09 | p04–p06 | `terms[3](AIサービスの責任論).detail_*` (+ explanation) | L2 | Yes (§3.7) | No | OK |
| u09 | p07 | `key_points_en[3]` (+ summary) | L3 | Yes: debated / debate repetition gone; "where responsibility lies" = detail_en "who is responsible" / jp 責任の所在 | LOW record (obs. 3) | OK |

## 3. Focused checks

### 3.1 u06 p04–p06 (L2) — AI社会原則 addressee vs primary text

- Primary text (fresh pdftotext of the 統合イノベーション戦略推進会議決定): 「…AIが社会に受け入れられ適正に利用されるため、社会（特に、国などの立法・行政機関）が留意すべき『AI社会原則』と、AIの研究開発と社会実装に従事する開発・事業者側が留意すべき『AI開発利用原則』に体系化する。」
- After: jp 「…原則は 7 つで、社会 (特に国などの立法・行政機関) の側が留意すべき事柄としてまとめられている。」/ zh 「…社会（特别是国家等立法、行政机关）一方应注意的事项。」/ en "…framed as what society, especially legislative and administrative bodies such as the state, should keep in mind." The addressee, the 特に emphasis and the verb 留意 match the primary text in all three languages. The old 「政府・企業・研究者・利用者など立場を問わず」 (which merged the developer-side AI開発利用原則 into it) is gone; 0 remnants.
- Consistency with other fields:
  - `one_*` 「社会全体が共有すべき基本の原則」 and `terms[4].detail_*` 「政府の原則が社会全体に向けたもの」: compatible (社会 = whole society; 特に narrows the emphasis, not the scope).
  - `overview_rows[0].extra_*[1]` 「開発者・事業者・利用者など社会のあらゆる関係者」 and `pairs[0].rows[1]` 主な読み手「社会のあらゆる関係者」 (unpatched): these describe the document's readership, which Rule A L2 explicitly accepted. They do not contradict the new detail (the 「特に」 phrase keeps the whole of society in scope), but listing 開発者・事業者 first sits a little apart from the primary-text split → obs. 2, LOW, pre-existing, not introduced.
  - Cited questions: 2023r05-q034 frames the principles as what 社会 should keep in mind — the after agrees. 2022r04-q021 / 2024r06-q012 ask about 基本理念 / イノベーションの原則, not the addressee; unaffected. No topic question asks who the principles address (grep 社会原則: 3 questions, all checked).
- The after introduces a near-window with the 2023r05-q034 stem's set-up phrase (obs. 1). **L2 resolved; no MEDIUM / HIGH.**

### 3.2 u06 p01–p03 (L1) — 第 9 条

- Primary text (fresh): 「9（人工知能への倫理遵守の要請）人工知能が社会の構成員またはそれに準じるものとなるためには、上に定めた人工知能学会員と同等に倫理指針を遵守できなければならない。」
- After: jp 「…存在になるには、会員と同じようにこの指針を守れなければならない」/ zh 「AI 本身要成为…就必须能像会员一样遵守本准则」/ en "for AI itself to become … it must be able to follow these guidelines just as members do". All three now state a condition for becoming a member, not a duty after becoming one. 9 か条 count and the other cited articles in the same detail are unchanged and match the PDF. **Resolved.**

### 3.3 u07 p01–p03 (L1) — 汎用AI point vs 2026r08-q027

- After: jp 「**強いAI**は**汎用AI**の別名で、扱う課題の分野を限らず、人のように幅広く判断することを目指すAIを指す。」(zh / en equal).
- Distance to the q027 stem's strong-AI premise falls: jp 6 → 4, windows 1 / 1 → 0 / 0, wDice 0.31 → 0.17; en **42 → 9**. **It moves away, not closer.**
- jp q027 ア 3 → 6 (判断すること, generic). ア describes human-equivalent intelligence, i.e. the strong-AI side; the patched point is on the strong-AI term, so it places 「人のように」 on the strong side and helps reject ア for weak AI. It does not support ア as a description of weak AI. en ア 16 → 5.
- Consistency: = `one_jp` 「人に近い柔軟さ」, `detail_jp` 「人と同じく考えて対応できる」, `pairs[0]` (分野を限らない / 未知の課題にも対応することを目指す / まだ実現していない研究の目標), `key_points_jp[0]`. The weak-AI exam point (「人間と同じように理解して考えているわけではない」) remains the contrast. quiz qids (t0: 2019h31h-q023, 2026r08-q027; t1: 2026r08-q027) still answerable: q027 → イ by the weak-AI point. "目指す" keeps the aim form (not achieved), = detail. **Resolved, no new issue.**

### 3.4 u07 p04–p06 (L2) — sushi analogy

- After: 「寿司だけを極めた専門店の職人のようなもの。寿司なら一流でも、ほかの料理は作れない。」(zh 师傅 / en "a chef at a sushi restaurant who has mastered sushi alone").
- Sushi is one cuisine (a category of many dishes), so the image is "one narrow domain", no longer "one single dish" = "one single task". This matches one 「特定の課題に絞って」, the mix point (範囲の狭さ, not low performance), hook (Narrow), and q027's 「特定の課題」 (no count). "ほかの料理は作れない" = detail (cannot extend to unlearned tasks). Type-correct: no type (8) mismatch; first-rate within the domain = detail 「人間を上回る性能を出しても」. D-198 flat. **Resolved.**

### 3.5 u08 p01–p03 (L1) and p05–p07 (L3) — XAI

- L1: 「eXplainable」 is the standard notation of the acronym source (X from the 2nd letter, as in DARPA "eXplainable AI"); the hook now shows where X comes from. Derived memory_hook ×3 and summary.memory_hooks_*[2] follow. Fact correct.
- L3: node label 「人が根拠を確かめて受け入れるか決める」/ 「人确认依据后决定是否接受」/ "A person checks the grounds and decides whether to accept" = caption steps[3] 「結果を受け入れるかを決める」/ en "decides whether to accept the result". The node no longer presumes acceptance. Node is a short label (jp 18 chars), validate 0. LCS to 2023r05-q034 stem 受け入れ (4) / " and decide" (11) generic. **Resolved.**

### 3.6 u09 p01–p03 (L1) — bias point vs 2025r07-q008

- After: jp 「バイアスを抑える対策はデータの質を保つ作業と重なり、学習に入る前のデータの準備全般が対策の対象になる。」(zh / en equal).
- Stem overlap falls: jp 7 → 4 (windows 1 / 1 → 0 / 0), zh 6 → 4, **en 26 → 16** (pre-check reported the same: en 26 → 16, zh 6 → 4). The residual en "ing data quality" / zh 数据质量 is the generic concept term.
- The unsupported 「切り離せない」 claim is softened to 「重なり」. The scope 「準備全般」 is kept, so q008 → イ (all four) is still supported and no subset choice is cued (choices 0–2). Consistent with detail (集めて整える段階) and key_points[0]. **Resolved.**

### 3.7 u09 p04–p06 (L2) — responsibility includes the maker

- After: jp 「道具を使った人や作った人が責任を負うという従来の考え方だけでは割り切れない場面がある」 (zh / en equal).
- It is framed as 「従来の考え方」 (a traditional view), not as a legal rule: no statute (製造物責任法 etc.), no condition for liability, no allocation. The rest of the detail keeps the non-assertive form (関わる者が多く、責任の所在が定まりにくい); `one_*` 「誰が責任を負うかを問う議論」 and `pairs[1]` (社会・法の議論) unchanged. It adds the maker side that Rule A said was missing, and it does not contradict the detail's list (開発した企業 / 事業者 / 利用者). No cited question; D-198 flat. **Resolved; no legal assertion.**

## 4. Observations

No F-fix from this re-review: all 31 patches are the auditors' prescribed texts, applied exactly, and correct in context. Records only:

1. LOW (introduced by prescribed u06 p04, record only): jp after 「…の側が留意すべき事柄として…」 forms 2 masked 12-char windows (≤2 substitutions) with the 2023r05-q034 stem's set-up phrase (社会が留意すべき事項として), masked windows 6 → 8; en p06 " should keep in mind" (20) likewise matches the q034 en stem. The phrase is the primary document's own wording (社会…が留意すべき), quoted by the stem; it is a stem set-up, not a choice frame, and gives no cue to q034's items (b only). Not MEDIUM. Optional future touch: e.g. 「…の側が心に留める事柄として整理されている」.
2. LOW, pre-existing (not patched): u06 `overview_rows[0].extra_*[1]` 「開発者・事業者・利用者など社会のあらゆる関係者」 / `pairs[0].rows[1]` 主な読み手. Compatible with the new detail and accepted by Rule A L2, but developer-first listing sits apart from the primary text's split (developers → AI開発利用原則). Optional loc touch.
3. LOW (prescribed u09 p07): en key_points[3] "where responsibility lies" vs 2024r06-q012 イ en 10 → 18 ("re responsibility "). Generic wording; q012 is a u06-term question (innovation principle) and the key point does not describe イ's responsibility-sharing principle.
4. Script notes (no content issue): u07 `memory_hooks` bad [4] ×3 = index shift (terms[3] hookless; 48/48 pass in order); u08 `ruleA verbatim miss p03` = markdown-escaped quotes in the Rule A file (escaped before / after both found); `stage` meta removed (as in b19–b33).

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope (all 4 Rule A files MEDIUM 0); **0 introduced**
- LOW introduced: obs. 1 and obs. 3 (record only); pre-existing obs. 2; script notes obs. 4.
- **Application:** 31/31 exact (replay) and 31/31 = the Rule A prescribed text. Every 建議修 covered (u06 L1–L3, u07 L1/L2/L4, u08 L1–L4, u09 L1–L3); none left out. Derived fields follow (234 + memory_hooks 48 in order, 0 mismatch); 0 unexplained diffs; 0 `before` remnants.
- **D-198:** targeted overlaps fall (u07 q027 stem en 42 → 9, jp windows 1 → 0; u09 q008 stem jp 7 → 4 / zh 6 → 4 / en 26 → 16, jp windows 1 → 0). No after-span traces a choice frame. u06 p04 masked windows 6 → 8 (stem set-up = primary wording, obs. 1).
- **Primary sources:** u06 L2 addressee and u06 L1 第 9 条 wording match the fresh primary texts.
- **Gates:** validate 4/4 = 0 issues, parity 4/4 = 0 diff (25 / 27 / 26 / 28 locations), validate --part bases 4/4 = 0 issues (sha256 = base_sha256), vitest textbook 162/162.

**PASS.** All 31 active patches of strategy-05-14 u06–u09 are applied exactly and are the auditors' prescribed text; no patch introduces a MEDIUM or HIGH, and every 建議修 is applied.
- u06 L2: the AI社会原則 addressee now matches the 内閣府 decision (社会、特に国などの立法・行政機関) and does not contradict one / terms[4] / cited questions.
- u06 L1: 第 9 条 is now a condition (「となるためには」).
- u07 L1: the 汎用AI point moves away from the 2026r08-q027 stem premise and stays consistent with quiz / pairs; u07 L2: the sushi image is a narrow domain, not a single task.
- u08 L1 / L3: eXplainable notation; fig node = caption.
- u09 L1: overlap with 2025r07-q008 falls in all three languages with scope kept; u09 L2: adds the maker as a traditional view without asserting any legal liability rule.
