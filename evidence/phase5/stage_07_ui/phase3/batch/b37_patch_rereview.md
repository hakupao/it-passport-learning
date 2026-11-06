# b37 B3 patch re-review — technology-16-43 u01–u04 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the per-unit Rule A audits, and I share no context with them (Rule D)
- Date: 2026-11-07 (Session 149)
- Scope: B3 wording patches for technology-16-43-u01 (p01–p03), u03 (p01–p04) and u04 (p01–p06)
  — **13 `active`, 0 retired** (`patches/technology-16-43-u0{1,3,4}.json`). u02 has no patch file: its Rule A file reports 建議修 0.
  Each patch was checked against the Rule A prescriptions: `-u01` L1 建議修; `-u03` L1・L5 建議修; `-u04` L1・L2・L10・L11 建議修. Nothing left out.
  The 4 Rule A files report MEDIUM 0 / HIGH 0. Coverage: u01 3 = L1 p01–p03; u03 4 = L1 p01–p03 / L5 p04; u04 6 = L1 p01 (en only, as prescribed) / L2 p02–p04 / L10 p05 / L11 p06.
  Also checked against the merged units `data/ip/textbook/units/technology-16-43-u0{1..4}.json` (sha256 u01 `a6519ba803263889…`, u02 `2eb90e6491ba9f6c…` = the sha in the u02 Rule A file, so it has not changed since the audit; u03 `8e377dc173286d04…`, u04 `4e1846b4c93626ab…`).
- Pre-patch bases, located by sha256 = `base_sha256`. All patches of a unit share one base, and all match:
  u01 `b37-u01-a2/…loc.r0.json` (`8f3b9fe4…`), u03 `b37-u03-a2/…loc.r0.json` (`0cc8a7ac…`), u04 `b37-u04-a2/…loc.r0.json` (`b30320cf…`).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only). Strings shown are unit text, patch text or term names. Matched fragments are ≤12 chars.

## 0. Method

Same as `b35_patch_rereview.md` §0, without the unit-level step (no `unit.*` patch in b37). Topic technology-16-43 has 38 questions, 190 source strings per language.

1. **Application check** (`b37rr/check.mjs`, run unchanged): `after` present; `before` once in base; replay in file order = unit field; no `before` remnant (raw and stripped) anywhere in the unit; every changed base-present path explained; before / after verbatim in the Rule A file.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) and `summary.memory_hooks_*` (suffix match, in check.mjs).
3. **D-198** (`b37rr/d198b.mjs`): whole-field LCS before → after and `after`-span LCS vs 190 sources per language; jp 12-char windows (≤2 substitutions) unmasked / masked + wDice. Per-choice reading against the questions named in the Rule A findings: 2022r04-q099, 2010h22h-q086, 2011h23a-q054 (u03); 2011h23a-q086, 2013h25h-q059, 2010h22a-q081, 2018h30a-q094, 2019r01a-q057 (u04); 2015h27h-q067 (u01).
4. **Manual reading** of each patched field in context (whole term; overview_rows; pairs; key_points; summary.memory_hooks; whole-unit string walks for the replaced wording).
5. **u02 independent rulings** on Rule A L2 (RAID table vs 2019h31h-q062 / 2011h23a-q082) and L1 (capacity formulas). I re-read both questions in `data/ip/quiz/questions.json`, `terms[4]` of u02 (fig table, one, detail, hook, points, key_points), the D-198 lock (S135 log), D-208 + its addendum (S143 log), D-209 (S144 log) and `docs/decisions/D-211-truefalse-general-principle-quiz-only.md`. D-198 / D-208 / D-209 have no standalone ADR file; their lock text lives in those session logs.
6. **Gates**: `scripts/textbook-v2-validate.mjs --unit` ×4 / `--part <base>` ×3, `scripts/textbook-v2-parity.mjs --unit` ×4, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

Not established (as in b14–b36): the unit files carry the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 124, u03 117, u04 141) were checked for derived copies and `before` remnants. No law text is touched.

## 1. Script results (fresh, 2026-11-07)

```
✓ technology-16-43-u01 unit: 0 issues   validate EXIT=0 | ✓ parity: 30 locations, 0 diff
✓ technology-16-43-u02 unit: 0 issues   validate EXIT=0 | ✓ parity: 29 locations, 0 diff
✓ technology-16-43-u03 unit: 0 issues   validate EXIT=0 | ✓ parity: 27 locations, 0 diff
✓ technology-16-43-u04 unit: 0 issues   validate EXIT=0 | ✓ parity: 33 locations, 0 diff
validate --part (loc r0): ✓ u01 / u03 / u04 loc#0: 0 issues (sha256 8f3b9fe4… / 0cc8a7ac… / b30320cf… = base_sha256)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: 14 pass, 0 fail
check.mjs: active 3/4/6, ok 3/4/6, issues 3 / 0 / 0 (u01 = remnant script artifact, below); ruleA verbatim miss [] ×3
```

**Application.**
- All 13 `before` strings occur exactly once in their base field; all 13 `after` present; replay reproduces every patched field. Each field carries one patch.
- Changed base-present paths: u01 3, u03 4, u04 6 = exactly the patched fields, plus the removed `stage` meta key (as in b19–b36). Unexplained diffs: 0.
- `before` remnants: u03 / u04 0. **u01 p01 3 'remnant' hits are a script artifact** (confirmed): `before`「サーバを置かず、」is a suffix of `after`「専用のサーバを置かず、」, and the other two hits (`terms[4].one_jp` and its derived `definition_jp`) read「専用のサーバを置かず、」, the wording the patch copies. A whole-unit walk for「サーバを置かず」not preceded by「専用の」= 0, zh「不设服务器」= 0, en "with no server" = 0. Real remnants: 0. u03: 「本物の機械」0, "real machine" 0, "get in and out" 0. u04: 「负载分散」0.
- `check.mjs` "ruleA verbatim miss": [] for all three units. 13/13 = Rule A prescribed text exactly.

**Derived fields.** Full walk 54 + 63 + 75 = 192 derived strings, 0 mismatch. u03 p01–p03 → `terms[0].memory_hook_*` true ×3; u04 p02–p04 → `terms[0].memory_hook_*` true ×3; u04 p06 → `terms[6].explanation_zh` true; u04 p05 → `summary.key_points_zh[2]` carries「负载均衡」(2 hits in unit = field + summary). `summary.memory_hooks_*` suffix check 9 / 12 / 21 = 42, 0 bad.

**Notation.** bold / `[[jp:]]` counts unchanged in all 13 fields.

D-198, before → after (`d198b.mjs`):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| u01 p01 | **jp** | 2010h22h-q086 ア | 4 → 4 (サーバを) | サーバを (4) | 0 / 0 → 0 / 0; 0.20 → 0.21 |
| u01 p02 | zh | 2010h22h-q086 stem | 3 → 3 (服务器) | 服务器 (3) | — |
| u01 p03 | en | 2016h28h-q075 ウ | 16 → 16 ("a configuration ", unchanged part) | same (16, generic) | — |
| u03 p01 | **jp** | 2009h21h-q073 stem | 4 → 4 (のように, unchanged 1st sentence) | である (3) | 0 / 0 → 0 / 0; 0.08 → 0.13 |
| u03 p02 | zh | 2016h28h-q075 stem → 2010h22h-q086 エ | 3 → 3 | 存储器 (3, term word) | — |
| u03 p03 | en | 2010h22h-q086 イ | 14 → 14 (" as if it were", unchanged 1st sentence) | " the virtual " (13) vs 2022r04-q099 stem (obs. 2) | — |
| u03 p04 | en | 2014h26a-q048 ア → 2013h25h-q057 stem | 8 → 9 | " of each " (9) | — |
| u04 p01 | en | 2013h25h-q059 イ | 23 → 23 ("interactive processing ", term name, unchanged) | " data is " (9) | — |
| u04 p02 | **jp** | 2014h26a-q048 ア | 7 → 7 (クライアントと, unchanged 2nd sentence) | 能の (2) | 0 / 0 → 0 / 0; 0.20 → 0.16 |
| u04 p03 | zh | 2011h23a-q086 stem | 4 → 4 ("thin", headword) | thin (4) | — |
| u04 p04 | en | 2016h28h-q075 ア | 16 → 16 (" processing and ", unchanged) | " the terminal" (13) vs 2010h22a-q081 ア | — |
| u04 p05 | zh | 2019r01a-q057 stem | 6 → 6 (服务器在不停, unchanged) | 负载 (2) | — |
| u04 p06 | zh | 2010h22h-q086 ア | 4 → 4 | 行的处理 (4) | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52 for full-field copy). Masked jp 12-char windows 0 → 0 in all 3 jp patches. Every whole-field nearest source is set by an unchanged part of the field or by a term name.

Per-choice reading:
- **2022r04-q099** (VM effects a〜c, correct = a only) × u03 p01–p03: the removed 2nd sentence (「使う側からは本物の機械と同じように働く」) is the only text Rule A saw leaning toward b (same capacity as as many physical machines). It is gone in all three languages (0 hits). The new sentence makes no claim about capacity or performance, so it cues neither b nor c. a is still stated by `terms[5].points[0]`; `terms[5].detail` and `key_points[4]` still say the VMs share resources.
- **2010h22h-q086 / 2011h23a-q054** (server virtualization, wrong エ = virtual memory) × u03 p01–p03: the new hook names 仮想記憶 / 虚拟存储器 / virtual memory. That is the content of wrong option エ in both questions. It states only where the word comes from (both use "virtual"). It does not say virtual memory is server virtualization. The very next point (`terms[0].points[2]`, mix) defines both sides positively and separates them. Applying the hook to either question does not select エ, because the stem asks about サーバの仮想化. The other wrong options (VR / VPN / remote GUI) are untouched. Not type 9. Record only, obs. 1.
- **2011h23a-q086** (thin-client terminal, correct ア; wrong イ = thin, compact PC) × u04 p02–p04: the hook now closes the "thin = slim device" reading in all three languages (形ではなく受け持つ機能の薄さ / 不是机身薄，而是终端承担的功能少 / "how little the terminal does, not … its physical shape"). This points away from イ and toward ア (execution and data at the server, UI-only terminal). 2013h25h-q059 (correct ア, minimal function) agrees with "機能の薄さ". 2010h22a-q081 (leak countermeasure) is unaffected. Per-choice overlap with イ: jp 2 (能の), flat.
- **2018h30a-q094 / 2013h25h-q057** × u04 p01 / p06: "right away" now matches 「すぐ」 and is no longer the same phrase as the batch "all at once" (一括). p06 only adds the predicate (「都属于批处理」), and no source words. Flat.
- **2019r01a-q057** × u04 p05: 「负载均衡」 is the standard mainland-IT term. The qid's zh stem overlap is the unchanged 「服务器在不停」(6). Flat.
- **2015h27h-q067** (standalone vs P2P) × u01 p01–p03: 「専用の」 matches `terms[4].one` / `pairs[2].rows[1].b` and does not touch the standalone point. Flat.

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01–p03 | `overview_rows[4].one_line_*` (ピアツーピア) | L1 | Yes (§3.1) | No | OK |
| u03 | p01–p03 | `terms[0](仮想化).hook_*` (+ memory_hook, summary.memory_hooks[0]) | L1 | Yes (§3.2) | No (obs. 1, obs. 2) | OK |
| u03 | p04 | `terms[2](ハイパーバイザー型).analogy_en` | L5 | Yes: residents of each unit now come and go, so the units themselves no longer move; jp / zh unchanged and in agreement | No | OK |
| u04 | p01 | `goals_en[2]` | L1 | Yes: "handled right away or stored first" = jp すぐか ためてからか; no longer the same phrase as batch "all at once" | No (obs. 3 pre-existing) | OK |
| u04 | p02–p04 | `terms[0](シンクライアント).hook_*` (+ memory_hook, summary) | L2 | Yes (§3.3) | No | OK |
| u04 | p05 | `key_points_zh[2]` (+ summary) | L10 | Yes: 负载均衡 = load balancing (en); 负载分散 0 left in u04 | No (obs. 4) | OK |
| u04 | p06 | `terms[6](バッチ処理).detail_zh` (+ explanation_zh) | L11 | Yes: the example sentence now ends with the predicate 「都属于批处理」 = jp「〜が当たる」 | No | OK |

## 3. Focused checks

### 3.1 u01 p01–p03 (L1) — P2P 「専用のサーバ」

- After: jp「専用のサーバを置かず、対等な機器どうしが直接やり取りする構成。」/ zh「不设专用服务器、由地位对等的设备直接交换数据的构成。」/ en "A configuration with no dedicated server, where equal devices exchange data directly."
- Now matches `terms[4].one_*` (専用のサーバを置かず / 不设专用服务器 / no dedicated server) and `pairs[2].rows[1].b_*` (専用のサーバを置かない / 不设专用服务器 / No dedicated server). Together with the detail (each device can also act as provider), the overview row no longer reads as "no server function at all". The CS/P2P contrast (`pairs[2]`) is unchanged.
- The zh enumeration comma 「、」 between clauses is the base's punctuation and was not touched. Not a finding.
- **Resolved.** The remnant hits are the script artifact (§1).

### 3.2 u03 p01–p03 (L1) — 仮想化 hook 2nd sentence

- After: jp「仮想マシンや仮想記憶の「仮想」も、この virtual の訳語である。」/ zh「虚拟机、虚拟存储器中的“虚拟”，也是这个 virtual 的译词。」/ en "The same word gives the virtual in virtual machine and virtual memory."
- **Factual.** 仮想マシン = virtual machine and 仮想記憶 = virtual memory are the standard JIS / IPA renderings. 仮想 is the standard Japanese rendering of virtual, and 虚拟 is the standard Chinese one. The zh terms 虚拟机 / 虚拟存储器 are the ones the unit body uses (`zh_terms.json` 虚拟机 / 虚拟存储; the body uses 虚拟存储器, already accepted by Rule A §1-9).
- **Away from 2022r04-q099 b.** The sentence no longer claims anything about how the system behaves for the user, so it no longer leans toward "same processing capacity as N physical machines". It adds no performance claim. The first sentence (virtual = not real, but works as such in substance) is the word's meaning and was not part of the finding. Read with `terms[5].detail` (each VM runs within its share), it does not support b.
- **No longer restates one.** The hook now gives a cross-link between words (D-203 §6: a cue, not a re-definition). The one_jp claim (異なる構成に見せて使える) is not repeated.
- **q086 / q054 エ (virtual memory as the wrong answer).** See §1 per-choice and obs. 1: the hook links only the word. The mix point right after it separates virtual memory from server virtualization. Not MEDIUM.
- en wording: "gives the virtual in" is slightly loose English, but it is the Rule A prescribed text, and its meaning (same word source) is clear. Not a finding.
- **Resolved.**

### 3.3 u04 p02–p04 (L2) — シンクライアント hook「機能の薄さ」

- After: jp「thin (薄い) は機器の形ではなく受け持つ機能の薄さで、反対が fat (厚い)。」(+ unchanged ファットクライアント sentence) / zh / en as in the patch file, verbatim = Rule A.
- Closes failure type (9) for 2011h23a-q086 イ (a thin, compact PC). The hook now says thin refers to the function the terminal takes on, which is the axis of correct ア (execution and resource management at the server). The second sentence (fat = the terminal holds processing and data) still gives the contrast, and `terms[0].one` / `points[1]` say the same.
- Factual: "thin" in thin client refers to the minimal client-side function. Physical slimness is incidental. The hook says "not the shape", not "never slim", so it makes no false claim about devices.
- Patch metadata: the `reason` of p02 says "2016 q086". The question Rule A L2 cites is **2011h23a-q086** (in topic 16-43, 2016h28a-q086 is a strategy question and 2016h28h-q086 is a security question). Only the reason label is wrong, and it is not shown to readers. Record only, obs. 5.
- **Resolved.**

## 4. u02 independent rulings (no patch)

### 4.1 u02 L2 — RAID table vs 2019h31h-q062 / 2011h23a-q082: **LOW (keep). No F-fix.**

What the table reproduces (`terms[4].fig.data`, 3 rows × cols 方式 / データの書き方 / 1 台が故障したとき / 使える容量):
- vs **2019h31h-q062** (select-all: which of ① RAID5 ② striping ③ mirroring survive one disk failure; correct ①③): the **set** of levels {0, 1, 5} and the **criterion** (one disk fails) are the same. The **order** is not (table 0 / 1 / 5, question 5 / striping / mirroring). The **wording** is not either: the question's items are bare names, and the table's verdict cells (データを失う / 残りの台で運用を続けられる / 残りのデータとパリティから計算で復元できる) have no question counterpart. Longest overlap with the q062 stem = 2 chars (複数 / データ).
- vs **2011h23a-q082** (RAID1 features, correct ア): the row texts for 0 / 1 / 5 cover options ウ / ア / エ, and イ (spanning) is absent. Longest common runs (my LCS, punctuation stripped): row 0 × ウ「に並行して書」(6), row 1 × ア「同じデータを」(6), row 5 × エ「に分散して書」(6); everything else ≤3. The 12-char windows are 0 / 0 (masked / unmasked), matching Rule A. The shared runs are the defining verb phrases of each level (split + write in parallel / write the same data / spread with parity), which are the definitions themselves.

Why LOW and not MEDIUM:
1. **D-198 (S135 lock).** (iii) is the reuse of *a specific question's* concrete material (numbers, scene, a list of examples and its order). Writing standard definitions in general wording is not a copy, "even if the correct option states the same principle". RAID 0 / 1 / 5 is the field's standard comparison, not a set q062 chose. In this topic alone, 2012h24a-q055, 2018h30h-q094, 2023r05-q063, 2013h25h-q073, 2018h30h-q077, 2024r06-q069 and 2009h21a-q078 all use these levels, and so does any IT Passport text. The fault-tolerance column is the defining axis of RAID (the R = Redundant that the hook uses).
2. **D-209 (b) (S144 lock).** For a classification-type question ("which of these is X", which is what q062's ①〜③ item form is), a sentence that states the correct content as each headword's general definition or role is not (iii). (iii) applies only when the question's item **wording, set and order** are reproduced (語句・組・順序まで). Here only the set and criterion match, while the order and wording do not. The "strict reading" in the Rule A file (set alone voids the exemption) goes further than the lock text.
3. **D-209 (c).** Calling it (iii) requires naming the traced wording, set and order. Only the set can be named, and the set is the standard one. By (c), the result is low.
4. **D-208 (iii) purpose.** The table states the positive property of each level side by side. It does not negate wrong options in the question's order, and it does not build the select-all answer pattern (no ①②③ labels, no "which can recover" framing as a selection). `terms[4].points[1]` cites q062 only for the RAID5 principle (D-211 (i) style). For q082, the three rows are correct definitions of three different levels. They are not a reworded RAID1 answer plus negated distractors.
5. **Cost of the alternative.** Adding RAID10 (a level no topic question uses) would widen the unit beyond its source material just to break a set match the rules do not forbid. Rewording the row verbs away from 並行して / 同じデータを / 分散して would make the definitions less exact (D-198 accepts the definitional core). Neither is warranted.

The verdict stays LOW, record only, the same as Rule A's own ruling and JP reviews r0 / r2. If a later rules change made "same set + criterion" alone a (iii) trigger, the minimal fix would be to change the 1 台が故障したとき column into a general redundancy description. That would be a rule change (D-209 amendment), not a b37 matter.

### 4.2 u02 L1 — capacity formulas lack the equal-capacity assumption: **LOW (keep, record only).**

- All four cited capacity questions state the disks are the same size, and the formulas give their correct answers (Rule A recomputed them; I checked `key_points_jp[3]` and the table cells n / 1 / n − 1 against the same set). No cited question uses mixed sizes, so no wrong answer is cued.
- The missing condition is a silent standard assumption at IT Passport level. Fixing it means editing 4 fields × 3 languages at once (table header, key_points[3], points[0], points[1]), or the conditions would differ between fields. I agree that recording it is the right call. Not a 建議修, so a missing patch is not a gap.

## 5. Observations

No F-fix from this re-review. Records only:

1. LOW (u03 p01–p03): the new hook names 仮想記憶 / virtual memory, which is the content of wrong option エ in 2010h22h-q086 and 2011h23a-q054. It only links the word, and `terms[0].points[2]` (mix) right after it separates virtual memory from server virtualization. It does not lead to エ. Not MEDIUM.
2. LOW (u03 p03): en after-span " the virtual " (13) vs 2022r04-q099 en stem. Common words, no claim carried. Not a copy.
3. LOW, pre-existing (not patched, not flagged by Rule A): u04 `terms[4].detail_en` ("changes the screen at once") and `terms[5].points[0].text_en` ("returns the results at once") still use "at once" for すぐ. The context (a screen change, returning a result) makes each unambiguous, and the goals sentence that Rule A flagged is fixed. Optional follow-up: "right away".
4. LOW, pre-existing (cross-unit): u01 `terms[1].points[0].text_zh` renders 水平負荷分散 as 「水平负载分散」. That is a translation of the term name for a classification, not the generic "load balancing", so it does not conflict with u04 p05. Record only.
5. Metadata: u04 p02 `reason` cites "2016 q086". It should read 2011h23a-q086. The reason is not shown to readers, and the content is correct.
6. Script notes (no content issue): u01 `remnant` p01 ×3 = `before` is a suffix of `after`, and the other two hits are the `terms[4].one_jp` / `definition_jp` source wording (§1); `stage` meta removed (as in b19–b36).

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope (all 4 Rule A files MEDIUM 0); **0 introduced**
- LOW introduced: obs. 1 and obs. 2 (record only); pre-existing obs. 3, obs. 4; metadata obs. 5; script notes obs. 6.
- **Application:** 13/13 exact (replay), 13/13 = Rule A prescribed text. Every 建議修 covered (u01 L1; u03 L1・L5; u04 L1・L2・L10・L11; u02 has none). Derived fields follow (192 + memory_hooks 42, 0 mismatch). 0 unexplained diffs, 0 real `before` remnants.
- **D-198:** masked jp windows 0 → 0 ×3; no after-span traces a choice frame; the u03 hook no longer carries the q099-b lean, and the u04 hook now steers away from q086 イ.
- **u02 rulings:** L2 = LOW (keep; D-198 standard-definition side + D-209 (b)/(c): only the standard set and criterion match, not order or wording); L1 = LOW (keep).
- **Gates:** validate 4/4 = 0 issues, parity 4/4 = 0 diff (30 / 29 / 27 / 33 locations), validate --part 3/3 = 0 issues (sha256 = base_sha256), vitest textbook 162/162, patch tests 14/14.

**PASS.** All 13 active patches of technology-16-43 u01–u04 are applied exactly. No patch introduces a MEDIUM or HIGH, and every 建議修 is applied.
- u01 L1: the overview row says 専用のサーバ, matching one and pairs.
- u03 L1: the hook's 2nd sentence is now a factual word link (仮想マシン / 仮想記憶 ← virtual) with no claim toward q099 b. u03 L5: en analogy subject fixed.
- u04 L1: "right away" removes the at-once double meaning. u04 L2: thin = function, not shape, which closes q086 イ. u04 L10 / L11: zh term and predicate fixed.
- u02: no patch is needed. L2 and L1 stay LOW.
