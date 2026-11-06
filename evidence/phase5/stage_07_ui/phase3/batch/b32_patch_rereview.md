# b32 B3 patch re-review — management-09-26 u01–u05 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditors' context; Rule D)
- Date: 2026-11-06 (Session 148)
- Scope: B3 wording patches for management-09-26-u01 (p01–p08), u02 (p01–p03), u03 (p01–p02), u04 (p01–p06) and u05 (p01–p08)
  — **27 `active`, 0 retired** (`patches/management-09-26-u0{1,2,3,4,5}.json`), checked against the Rule A prescriptions
  (`management-09-26-u01.ruleA.md` **M1** + L1・L2・L3・L4・L5 建議修; `-u02` L1 建議修; `-u03` L1・L7 建議修; `-u04` **M1** + L1・L2 建議修; `-u05` L1・L2・L3 建議修 — every MEDIUM and 建議修 of the 5 files, none left unapplied; u01 8 = 1 + 1 + 3 + 1 + 1 + 1, u02 3, u03 2 = 1 + 1, u04 6 = 3 + 2 + 1, u05 8 = 3 + 3 + 2)
  and the merged units `data/ip/textbook/units/management-09-26-u0{1..5}.json` (sha256 u01 `a80c8b8e8f4dd1b6…`, u02 `7382483601d82c87…`, u03 `6b453b9d87e853b7…`, u04 `3c178ac2d64d4aa9…`, u05 `8b4a19411340ba23…`).
- Pre-patch bases located by sha256 = `base_sha256` (all patches of a unit share one base; all match):
  u01 `b32-u01-a1/…loc.r0.json` (`b6037a26…`), u02 `b32-u02-a2/…loc.r0.json` (`a66a9cae…`), u03 `b32-u03-a1/…loc.r0.json` (`f52089fc…`), u04 `b32-u04-a1/…loc.r0.json` (`cf940a6e…`), u05 `b32-u05-a1/…loc.r1.json` (`83193289…`).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211 and the HIGH / MEDIUM / LOW definitions in the Rule A files; S147 additional types (8)(9)(10) (`docs/templates/ruleA_unit_audit.md`).
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names; matched fragments ≤12 chars except en sidecar overlaps, which are project translations and are quoted as the unit's own after-span).

## 0. Method

Same as `b30_patch_rereview.md` §0 (= b26 / b27 / b29 §0), topic management-09-26 (41 questions, 205 source strings per language; the u02 trigger question 2014h26a-q042 is in-topic):

1. Application check (script): every string field of base and merged unit is walked; each `after` must appear in its field; `before` (raw and notation-stripped) must not survive anywhere in the unit (derived copies included); every base-present path that differs must be explained by a patch; patches replayed in file order on the base must reproduce the unit's field exactly. Each patch's `before` / `after` (bold stripped) searched verbatim in its unit's Rule A file.
2. Derived-field check (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`) for every term and key point; `summary.memory_hooks_*` order-matched over hooked terms.
3. D-198 (jp patches: u01 p03; u02 p01; u03 p01; u04 p01; u05 p01, p04, p05): LCS, 12-char window ≤2 substitutions with / without masking, wDice, vs stem + all choices of the 41 questions. zh / en: LCS vs the zh / en sidecars, whole field before → after and the `after` span. Per-choice + stem LCS (before → after) vs the patched term's cited / quiz qids (collected from `points[].qids` + `quiz`; whole-unit qids for non-term fields) plus the trigger question u02 p01–p03 × 2014h26a-q042.
4. D-195 / D-200 via validate; `validate --part <base>` for comparison; D-195 §2 caption sentence count (jp 。 / zh 。！？ / en terminal punctuation) over every step caption of u01 and u05 in all 3 languages.
5. Manual reading of each patched field in context (whole term; overview rows; pairs; key_points; summary). First-hand: u01 `terms[1].hook_*` and `summary.memory_hooks_{en,zh}[1]`; u02 `terms[2]` (one / detail / hook / fig flow nodes + 4 step captions / points) vs 2014h26a-q042 (figure: analysis → … → evaluation, loop back with improvement / added functions; correct ウ); u04 `terms[0]` (one / detail ×3 / explanation ×3 / fig tree / points) and a walk of every u04 string for rules / minimal / closed lists (決まり / 規則 / 规则 / rules / 最小限 / 最低限度 / minimal) and for インクリメント / increment / 增量; u05 the 3 merged captions and the goals / key_points / overview.intro / summary en.
6. `scripts/textbook-v2-validate.mjs --unit` / `scripts/textbook-v2-parity.mjs --unit` per unit; `npx vitest run src/lib/textbook`.

Scripts: scratchpad `b32rr/check.mjs` (pre-adapted), `b32rr/d198b.mjs` (copy of `b30rr/d198b.mjs`, only topic / unit-part list changed, no extra qids), `b32rr/focus2b.mjs` (copy of `b30rr/focus2b.mjs`, topic / parts changed, extra = u02 p01–p03 × 2014h26a-q042), `b24rr/q.cjs` (question reader, unchanged).

Not established: as in b14–b31, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: u01 115, u02 102, u03 139, u04 144, u05 115) were checked for the derived copies (step 2) and for `before` remnants (step 1). No law is touched; the only revised standard touched is the Scrum Guide (u04 M1 / u05 L1, see §3.2).

## 1. Script results (fresh, 2026-11-06)

```
✓ management-09-26-u01 unit: 0 issues   validate EXIT=0 | ✓ parity: 28 locations, 0 diff
✓ management-09-26-u02 unit: 0 issues   validate EXIT=0 | ✓ parity: 25 locations, 0 diff
✓ management-09-26-u03 unit: 0 issues   validate EXIT=0 | ✓ parity: 33 locations, 0 diff
✓ management-09-26-u04 unit: 0 issues   validate EXIT=0 | ✓ parity: 30 locations, 0 diff
✓ management-09-26-u05 unit: 0 issues   validate EXIT=0 | ✓ parity: 31 locations, 0 diff
validate --part (bases): ✓ u01 / u02 / u03 / u05 loc#0|#1: 0 issues; u04 loc#0: 0 issues, 1 warning
  (zh-term terms[5](スプリント).hook_zh スプリント → 冲刺 — the one Rule A u04 L2 fixes; gone in the unit) (sha256 = base_sha256 ×5)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

Application: 27/27 `before` occur exactly once in the base field; 27/27 `after` present; replay in file order reproduces every patched field exactly (5/5 units). Changed base-present paths u01 8, u02 3, u03 2, u04 6, u05 8 = exactly the patched fields (one patch per field) + the `stage` meta key removed (as in b19–b31; `round` / `jp_round` are non-string part meta). Unexplained diffs 0.

`before` remnants: 1 hit reported, **u01 p06** at its own field `terms[0].fig.data.root.children[1].children[1].label.en` — **false positive**: before `Check for overdue` is a prefix of after `Check for overdue items` (append-only patch); the field now reads exactly the after string and no other path in the unit contains the before. All other patches 0. `check.mjs` "ruleA verbatim miss": [] for all 5 units (27/27 before and after found verbatim in the Rule A files).

Derived fields: patched `hook_*` → `memory_hook_*` (u01 t1 en / zh, u02 t2 ×3, u04 t5 zh: true ×6), `detail_*` → `explanation_*` (u01 t0 zh, u03 t3 jp, u04 t0 ×3, u05 t1 ×3: true ×8); `key_points_en[0]` → `summary.key_points_en[0]` and `goals_en[0]` → `overview.intro_en` (u05) read: follow. Full walk: u01 60, u02 48, u03 78, u04 78, u05 66 = 330 derived strings, 0 mismatch. `summary.memory_hooks_*`: index-matched suffix check reports `bad` for u04 [2]–[3] only — script artifact (u04 `terms[1]` / `terms[4]` / `terms[7]` have no hook, so the summary array is one per hooked term); order-matched over hooked terms 5 + 4 + 7 + 5 + 6 = 27 terms × 3 languages = 81 entries, **0 bad**, lengths equal.

Notation counts (bold, `[[jp:]]`) before → after unchanged in 27 of 27 patched fields; parity 0 diff. Captions (D-195 §2): every step caption of u01 and u05 is 1 sentence in jp / zh / en (0 exceptions), including u05 p04–p06 (jp ×2, en ×1 merged from 2 sentences) and u01 p03–p05.

D-198, before → after (`d198b.mjs`):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest overlap of the `after` span | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| u01 p01 | en | 2025r07-q039 stem | 9 → 9 | "ents are " (9, generic) | — |
| u01 p02 | zh | 2014h26h-q047 ウ | 2 → 2 | 内容 (2) | — |
| u01 p03 | **jp** | 2009h21h-q038 イ | 3 → 3 | である (3) | 0 / 0 → 0 / 0; 0.17 → 0.11 |
| u01 p04 | zh | 2023r05-q039 stem → 2014h26h-q047 イ | 4 → 3 | 已有的 (3) | — |
| u01 p05 | en | 2019h31h-q047 イ | 16 → 16 (" design document", unchanged) | same (16) | — |
| u01 p06 | en | 2019h31h-q048 stem → 2012h24a-q045 stem | 7 → 7 | "e items" (7) | — |
| u01 p07 | zh | 2017h29h-q054 stem | 3 → 3 | 使用 (2) | — |
| u01 p08 | zh | 2010h22h-q029 stem | 1 → 2 | 图形 (2) | — |
| u02 p01 | **jp** | 2009h21a-q047 イ → 2014h26a-q042 stem | 3 → 4 | 評価から (4) | 0 / 0 → 0 / 0; 0.09 → 0.09 |
| u02 p02 | zh | 2022r04-q038 イ → 2010h22a-q034 イ | 3 → 2 | 从评 (2) | — |
| u02 p03 | en | 2009h21a-q047 エ → **2014h26a-q042 stem** | 8 → **30** | "loops back from evaluation to " (30; en sidecar of the q042 figure's loop annotation — obs. 1) | — |
| u03 p01 | **jp** | 2019r01a-q040 ウ | 5 → 5 (手法として, unchanged) | いる開発 (4) | 0 / 0 → 0 / 0; 0.10 → 0.10 |
| u03 p02 | en | 2014h26h-q047 イ | 25 → 25 (unchanged prefix) | " refactoring" (12, headword) | — |
| u04 p01 | **jp** | 2009h21a-q047 イ | 4 → 4 (unchanged) | などの (3) | 0 / 0 → 0 / 0; 0.11 → 0.11 |
| u04 p02 | zh | 2019r01a-q040 stem | 5 → 5 (Scrum, headword) | same | — |
| u04 p03 | en | 2019r01a-q052 stem | 16 → 16 (unchanged) | " such as " (9) | — |
| u04 p04 | zh | 2019r01a-q040 stem | 5 → 5 (Scrum) | 的开发中 (4) | — |
| u04 p05 | en | 2015h27a-q038 stem → 2019r01a-q052 stem | 14 → 18 | " development cycle" (18, generic) | — |
| u04 p06 | zh | 2023r05-q040 ア | 3 → 3 | 2 | — |
| u05 p01 | **jp** | 2009h21h-q038 ウ | 5 → 5 (unchanged) | などを (3) | 0 / 0 → 0 / 0; 0.07 → 0.07 |
| u05 p02 | zh | 2019r01a-q040 stem | 5 → 5 (Scrum) | 的人员 (3) | — |
| u05 p03 | en | 2014h26a-q042 stem | 14 → 14 (unchanged) | " and the like " (14, connective) | — |
| u05 p04 | **jp** | 2015h27a-q038 stem → 2019h31h-q047 ア | 3 → 3 | チーム (3) | 0 / 0 → 0 / 0; 0.11 → 0.09 |
| u05 p05 | **jp** | 2017h29h-q054 イ | 3 → 3 | を開発 (3) | 0 / 0 → 0 / 0; 0.17 → 0.17 |
| u05 p06 | en | 2019r01a-q055 エ → 2015h27a-q038 stem | 12 → 12 | " developers " (12) | — |
| u05 p07 | en | 2020r02o-q051 ウ | 10 → 10 (unchanged) | same | — |
| u05 p08 | en | 2014h26a-q042 stem | 12 → 12 (unchanged) | "ective" (6) | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52); masked 12-char windows 0 → 0 in all 7 jp patches. Longest jp after-span overlap ≤4, zh ≤4, en ≤18 except u02 p03 (30, obs. 1).

Per-choice check (LCS before → after vs each choice; `focus2b.mjs`):
- **2014h26a-q042** (correct ウ スパイラル) × u02 p01–p03: all four choices are model names; jp 0 → 0 for every choice, zh 0 → 0, en ウ* 6 → 6 (spiral = the headword), エ 4 → 2, ア / イ 2 → 2. The rise is in the stem only (jp 2 → 4 評価から; zh 2 → 2; en 5 → 30 = the figure annotation) — obs. 1.
- u01 p01–p02 × 2009h21a-q047 / 2012h24a-q045 / 2021r03-q041 (OO): jp —, zh ≤1, en ≤7 per choice, flat before → after (2021r03-q041 ア* 3 → 5 "ation" = word ending of encapsulation / orientation); no choice frame traced.
- u01 p03–p05 × 2020r02o-q051 / 2014h26h-q047 / 2023r05-q039 (RE): jp ≤2, zh ≤3 (2014h26h-q047 イ* 1 → 3 已有的, the correct option's "existing product" — the D-211 (ii) general principle, = `one` / points[0]), en ≤10, stem en flat; the "already running" restriction (L2) is gone (zh 2023r05-q039 stem 4 → 1 在运行的 removed).
- u04 p01–p03 × 2019r01a-q040 / 2019h31h-q047 / 2024r06-q040 / 2025r07-q039 (Scrum): jp 1 → 1 for every choice (2024r06-q040 イ 1 → 3 = などの connective), zh ≤2, en ≤9 (" such as " vs 2024r06-q040 イ, a connective).
- u04 p04–p06 × 2021r03-q051 / 2019r01a-q052 (sprint / iteration): unchanged per choice; en stem 13 → 18 " development cycle" (generic).
- u05 p05 / p07 / p08 × 2019r01a-q055 / 2020r02o-q046 / 2022r04-q042 / 2023r05-q040 / 2024r06-q047: ≤3 jp, ≤8 en per choice, flat (generic " to the ").

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01 | `terms[1](オブジェクト指向).hook_en` (+ memory_hook, summary) | **M1** (MEDIUM, types (5)(6)) | **Yes** (§3.1) | No | OK |
| u01 | p02 | `terms[1].hook_zh` (+ memory_hook, summary) | L1 建議修 | Yes: 封 ≠ capsule mix-up gone; now = jp (カプセル化 → 薬のカプセル → 殻で包む) | LOW only (obs. 2) | OK |
| u01 | p03–p05 | `terms[4](リバースエンジニアリング).fig.steps[0].caption_*` | L2 建議修 | Yes: "already running" → "already existing" ×3, matches `one` / detail / points[0] (2014h26h-q047: product disassembly); 1 sentence ×3 | No | OK |
| u01 | p06 | `terms[0](構造化手法).fig…children[1].children[1].label.en` | L3 建議修 | Yes: "Check for overdue items" complete, = jp 延滞の有無を調べる | No (remnant hit = prefix, §1) | OK |
| u01 | p07 | `terms[0].detail_zh` (+ explanation) | L4 建議修 | Yes: 常用的是 → 例如可以使用 = jp 例えば | No | OK |
| u01 | p08 | `terms[2](ユースケース).fig.data.rows[0].cells[1].zh` | L5 建議修 | Yes: 小人图形 = en "Stick figure"; no doll reading | No | OK |
| u02 | p01–p03 | `terms[2](スパイラルモデル).hook_*` (+ memory_hook, summary) | L1 建議修 (type 9) | Yes (§3.3) | LOW only (obs. 1) | OK |
| u03 | p01 | `terms[3](エクストリームプログラミング).detail_jp` (+ explanation) | L1 建議修 (§9 とされる) | Yes: 良いと分かっている = zh 公认良好的 / en "good"; とされる 0 in the field | No | OK |
| u03 | p02 | `terms[6](リファクタリング).points[1].text_en` | L7 建議修 | Yes: "opposite" → "different direction" = jp 向きが違う / zh 方向不同 | No | OK |
| u04 | p01–p03 | `terms[0](スクラム).detail_*` (+ explanation) | **M1** (MEDIUM, type (10) / D-205) | **Yes** (§3.2) | LOW only (obs. 3) | OK |
| u04 | p04–p05 | `terms[5](スプリント).points[1].text_{zh,en}` | L1 建議修 | Yes: circular "iteration … called iteration" gone; "one repeated development cycle … called an **iteration**" = jp | No | OK |
| u04 | p06 | `terms[5].hook_zh` (+ memory_hook, summary) | L2 建議修 | Yes: 短跑冲刺 ties the hook to the zh headword 冲刺; base warn gone (unit 0 warnings) | No | OK |
| u05 | p01–p03 | `terms[1](レトロスペクティブ).detail_*` (+ explanation) | L1 建議修 (type (10) form) | Yes: など / 等 / "and the like" opens the list (§3.2) | No | OK |
| u05 | p04–p06 | `terms[2](CI).fig.steps[1].caption_jp`, `terms[4](DevOps).fig.steps[3].caption_jp`, `terms[2].fig.steps[0].caption_en` | L2 建議修 (D-195 §2) | Yes (§3.4) | No | OK |
| u05 | p07–p08 | `goals_en[0]` (+ overview.intro), `key_points_en[0]` (+ summary) | L3 建議修 | Yes: "katakana name" → "English-derived name" = `one_en` / `overview_rows[1].one_line_en` wording | No | OK |

## 3. Focused checks

### 3.1 u01 p01 (M1) — encapsulation hook subject restored

- After: hook_en "The word encapsulation comes from a capsule, like a medicine capsule: the contents are sealed inside a shell." (= M1 after verbatim). `memory_hook_en` follows; **`summary.memory_hooks_en[1]` now reads "Object orientation: The word encapsulation comes from a capsule, …"** — exactly the check Rule A §5 set. The subject of "comes from a capsule" is encapsulation, not the headword object orientation, so the false etymology is gone. jp (カプセル化の「カプセル」は…) unchanged; zh (p02) "封装在日语里叫“カプセル化”（胶囊化）：就像药品胶囊一样…" also names カプセル化 as the subject → the three languages now say the same thing.
- Consistency: encapsulation is defined in `terms[1].detail` (クラス・カプセル化・継承・多態性) and illustrated by the remote-control analogy / points[0] (hide the inside, use via the request window); the hook adds no other headword's role (type 8) and does not touch 2009h21a-q047 / 2012h24a-q045 / 2021r03-q041 choices (≤7 en per choice, flat). **M1 resolved.**

### 3.2 u04 p01–p03 (M1) — Scrum's rules opened; fig (tree) and D-205

- After: jp 「チームの役割、繰り返す期間 (**スプリント**)、作業を管理する一覧 (**バックログ**) **など**の決まりごとを最小限だけ定め」/ zh 「只规定最低限度的规则，**例如**团队的角色、…（**冲刺**）和…（**待办列表**）」/ en "fixes only a minimal set of rules, **such as** the team's roles, a repeating time box (the **Sprint**), and lists for managing the work (the **backlogs**)". `explanation_*` follows ×3. The closed という / 即 / ":" list is gone in all three languages, so Increment (and the events other than the Sprint) are no longer denied (type (10) / D-205: the revised Scrum Guide's structure is not stated as complete). 
- Rest of the unit: a walk of every u04 string for rules / minimal / closed lists finds only `terms[0].detail_*` / `explanation_*` (now open) and `key_points_*[0]` / `summary.key_points_*[0]` ("決まりごとは最小限 / 规则保持在最低限度 / keeping rules to a minimum" — no enumeration) → no other closed list of Scrum's components. インクリメント / increment / 增量: 0 hits (unchanged; with an open list, not naming it is no longer a denial).
- Fig (tree, unpatched, `kind: tree`, `mode: static`): スクラム → スクラムチーム (役割) [PO / 開発者 / SM] / スプリント (反復の期間) / バックログ (一覧) [PB / SB]. It has no caption, title or count claiming the tree is the whole of Scrum, every node is consistent with the unit's roles wording (roles vs the 2020 edition's accountabilities = Rule A L3, LOW), and it now matches the detail's examples one to one → it reads as the elements the unit treats. Rule A M1 explicitly put the node addition out of B3 scope (structure change). Residual = obs. 3 (LOW record). No version-sensitive wording is introduced by the patches (the roles' count / names stay as Rule A L3 recorded).
- Questions: 2019r01a-q040 (Scrum = framework for complex problems; correct ウ), 2019h31h-q047 / 2024r06-q040 (agile features), 2025r07-q039 (fill-in on Scrum): jp LCS 1 → 1 for every choice, zh ≤2; no choice is about the list of Scrum's components, so the opening changes no answer. **M1 resolved, no D-205 issue remains in the unit's text.**
- u05 p01–p03 (L1, same pattern for the Retrospective's review targets): 人・やり方・道具の使い方**など** / 等 / "and the like" — the closed list of what is reviewed is open in 3 languages; `explanation_*` follows. No question in the topic asks the targets.

### 3.3 u02 p01–p03 (L1) — spiral hook vs 2014h26a-q042

- After: jp 「spiral は「らせん」。評価から次の計画へ戻って回るたびに、外へ一回り広がっていく形を思い浮かべる。」/ zh 想象每次从评估绕回下一圈的计划时，都向外扩一圈的形状 / en "Picture a spiral: each time the work loops back from evaluation to the next plan, it reaches a little further out." (= L1 text verbatim 3/3). The old "not going round the same circle" contrast is gone.
- Type (9) with 2014h26a-q042 (the only exam citation; the figure is a closed loop from evaluation back to analysis with improvement / added functions; correct ウ スパイラル): the hook now says a lap *returns* from evaluation and grows outward each time, so the q042 figure (loop back + improvement / added functions = growth) maps onto the hook → ウ; the earlier risk ("the figure goes round the same loop, so it is not a spiral") is removed. Wrong choices: ア ウォータフォール (no return), イ 再利用, エ リエンジニアリング — none has a loop or growth cue, and the hook does not point to any.
- In-unit consistency: 評価 → 次の計画 = fig node e1 (評価を次の計画に生かす), step 1 caption, detail (評価の結果を次の周の計画に生かす), points[0] (評価を次の周の改良や機能の追加へ); "外へ一回り広がる" = detail / step 2–3 (範囲が広がる). vs prototyping (pairs[1] / points[1]): the hook's growth image keeps spiral distinct from prototyping's repeat-to-confirm cycle. No other headword's role (type 8).
- D-198: jp after-span 評価から (4), masked windows 0 → 0, wDice 0.09; zh 2. en after-span 30 "loops back from evaluation to " = the en sidecar's rendering of the q042 figure annotation (project translation); the hook's target is "the next plan" (the unit's own cycle), not the stem's analysis phase, and no choice is traced → obs. 1 (LOW record, D-211 (ii): general principle of the headword). **L1 resolved, no new MEDIUM.**

### 3.4 u05 p04–p06 (L2) — caption merges keep D-195 §2 in all languages

- After: `terms[2].fig.steps[1].caption_jp` 「変更をチーム共用の保管場所へ、1 日に何度も取り込む。」(1 sentence; zh / en of the same step were already 1 sentence: 一天之内要这样做很多次 is a clause of the one zh sentence; en "Each change is brought into the team's shared store, many times a day.") / `terms[4].fig.steps[3].caption_jp` 「運用で分かった課題を開発へ伝えて次の改善に生かし、この輪を回し続ける。」(1; zh / en 1) / `terms[2].fig.steps[0].caption_en` "Instead of piling up large batches of work, developers split it into small changes." (1; jp / zh 1). Meaning preserved (many times a day / feed back and keep the loop turning / small changes instead of batches); the three languages of each step still say the same.
- Sentence count over all u05 (and u01) step captions in jp / zh / en: 0 captions with ≠1 sentence. **L2 resolved.**

## 4. Observations

No F-fix from this re-review (all 27 patches are the auditors' prescribed texts, applied exactly, and correct in context).

Records only, no fix:

1. LOW, u02 p03 (hook_en, D-198 note): the after-span "loops back from evaluation to " (30) coincides with the en sidecar of 2014h26a-q042's figure annotation (stem, not a choice; project translation). jp overlap 評価から (4), masked windows 0, zh 2; the hook's target "the next plan" is the unit's own cycle (fig e1 / detail), not the stem's analysis phase; all four choices are model names (≤6 = headword spiral) → the general principle of the headword, not an option frame (D-211 (ii)).
2. LOW, u01 p02 (hook_zh, prescribed text): in `summary.memory_hooks_zh[1]` the derived prefix gives two full-width colons in a row (面向对象：封装在日语里叫“カプセル化”（胶囊化）：就像…). Readable, meaning correct; the same pattern can be avoided in future prescriptions by using ，instead of the inner ：.
3. LOW, u04 M1 residual (fig): the Scrum tree still shows only team / Sprint / backlogs (no Increment, no events besides the Sprint). With the detail opened and no caption / count on the tree, it reads as the elements the unit treats; adding nodes is a structure change outside B3 (as Rule A M1 stated). Candidate for the batch "未修 LOW" table.
4. Script notes (no content issue): `check.mjs` remnant u01 p06 = before is a prefix of after (append-only patch, same field only); `memory_hooks suffix check` bad u04 [2]–[3] = index misalignment from hookless terms (u04 t1 / t4 / t7), order-matched 81/81 pass; base u04 validate warn zh-term = the L2 target, absent in the unit.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 2 in scope (u01 M1, u04 M1) — **all resolved**; **0 introduced**
- LOW introduced: 建議修 0; 記録のみ obs. 1–3 (D-198 note / prescribed-text punctuation / out-of-scope fig residual); script notes obs. 4
- Application 27/27 exact (replay), 27/27 = the Rule A prescribed text (before and after found verbatim), every MEDIUM and 建議修 of the 5 Rule A files covered (u01 8 / u02 3 / u03 2 / u04 6 / u05 8), derived fields follow (330 checked + summary.memory_hooks 81 order-matched, 0 mismatch), 0 unexplained base → unit diffs, 0 real `before` remnants (1 prefix false positive)
- D-198: masked 12-char windows 0 → 0 in 7 of 7 jp patches; after-span overlaps jp ≤4 / zh ≤4 / en ≤18 except u02 p03 en 30 (figure annotation of the stem, obs. 1), none from a wrong choice's frame
- validate 5/5 = 0 issues (0 warnings), parity 5/5 = 0 diff (28 / 25 / 33 / 30 / 31 locations), validate --part bases 5/5 = 0 issues (u04 1 warning = L2 target), vitest textbook 162/162

**PASS** — all 27 active patches of management-09-26 u01–u05 are applied exactly (replay reproduces every patched field, derived fields follow, no other base-present path changed) and each is the auditor's prescribed text. u01 M1: the en hook names encapsulation as the word from "capsule", so `summary.memory_hooks_en[1]` ("Object orientation: The word encapsulation comes from a capsule, …") no longer gives the headword a false etymology, and jp / zh / en now agree. u04 M1: Scrum's minimal rules are an open list (など / 例如 / such as) in all three languages with no other closed list of Scrum's components left in the unit; the unpatched tree has no completeness claim and matches the detail's examples (residual recorded, obs. 3). u02 L1: the spiral hook's "loop back from evaluation and grow outward" fits 2014h26a-q042's figure → ウ without supporting any wrong choice; u05 L2: every step caption is one sentence in all three languages. The LOW fixes close their field / language mismatches without new HIGH / MEDIUM.
