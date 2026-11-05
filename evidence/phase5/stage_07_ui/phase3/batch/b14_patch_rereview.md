# b14 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditor's context; Rule D)
- Date: 2026-11-05 (Session 142)
- Scope: B3 wording patches for technology-23-61-u01 (p01–p07), u02 (p01–p14), u03 (p01–p05), u04 (p01–p04), u05 (p01–p03)
  — 33 `active`, 0 retired (`patches/technology-23-61-u01.json` … `-u05.json`), checked against the Rule A findings
  (`technology-23-61-u01.ruleA.md` L1, L2, L4; `-u02` M1, M2, L1, L9a, L9b; `-u03` L1–L4; `-u04` L1, L2; `-u05` **H1**) and the merged units
  `data/ip/textbook/units/technology-23-61-u0{1..5}.json` (sha256 u01 `5f5292fb435eba2d…`, u02 `319b350aba1f6941…`, u03 `5d934a7f32230d9f…`,
  u04 `096a177d0077c084…`, u05 `2aa1d2c212608338…`).
- Pre-patch bases located by sha256 = `base_sha256`: `.planning/v2/<U>/parts/b14-u01-a2/…loc.r0.json`, `b14-u02-a1/…loc.r0.json`, `b14-u03-a2/…loc.r0.json`, `b14-u04-a2/…loc.r0.json`, `b14-u05-a1/…loc.r1.json` (all 5 match).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, and the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names).

## 0. Method

Same as `b12_patch_rereview.md` §0, topic technology-23-61:

1. Application check (script): every string field of base and merged unit is walked. Each `after` (raw and notation-stripped) must appear; `before` must not survive anywhere; every string that differs between base and unit (for paths present in the base) must be explained by a patch.
2. Derived-field check from the same walk (`explanation_*`, `memory_hook_*`, `summary.*`).
3. D-198: longest common substring (LCS), 12-char window with ≤2 substitutions with and without masking (katakana runs ≥4 and alnum masked), semi-global edit distance normalised by unit-text length (ed), best same-length-window bigram Dice (wDice). Sources: stem (`stem_jp_clean`, fallback `stem_jp`) + all choices of every question of topic technology-23-61 (cited ones counted separately), plus for u05 the 2015h27a-q075 stem **with the blanks filled by the correct answer ウ**. Normalisation differs from the Rule A scripts, so absolute values differ from the Rule A files; before → after is measured with one script.
4. D-195 / D-200 via validate.
5. Manual reading of each patched field in context (whole term + overview row + pairs + key_points + unit_summary); meaning judged against the cited question's `correct_answer`.
6. `scripts/textbook-v2-validate.mjs` / `scripts/textbook-v2-parity.mjs` per unit; `npx vitest run src/lib/textbook`.

Not established: the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows that the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths (the only other diff is the dropped `stage: "loc"` meta key). Paths that exist only in the merged unit (derived / meta, 101–137 per unit) were checked only for the patched texts.

## 1. Script results (fresh, 2026-11-05)

```
✓ technology-23-61-u01 unit: 0 issues                 validate exit 0 | parity: 26 locations, 0 diff  exit 0
✓ technology-23-61-u02 unit: 0 issues                 validate exit 0 | parity: 27 locations, 0 diff  exit 0
✓ technology-23-61-u03 unit: 0 issues, 1 warning(s)   validate exit 0 | parity: 27 locations, 0 diff  exit 0
✓ technology-23-61-u04 unit: 0 issues                 validate exit 0 | parity: 24 locations, 0 diff  exit 0
✓ technology-23-61-u05 unit: 0 issues, 2 warning(s)   validate exit 0 | parity: 34 locations, 0 diff  exit 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

The 3 warnings are pre-existing and in unpatched fields: u03 zh-term PC at `terms[5].detail_zh` (u03 Rule A O1); u05 zh-term ファイル ×2 at `terms[5].fig.steps[0].caption_zh` / `key_points_zh[2]` (u05 Rule A L7: 邮件附件, no fix).

Application: 33/33 `after` present. `before` remnants anywhere in the units (raw or stripped): 0. Unexplained base → unit diffs in base-present paths: 0 per unit (only `stage` removed).

Derived fields follow: u01 p01 → `summary.key_points_en[2]`; u01 p02–p06 → `terms[2..6].memory_hook_zh` + `summary.memory_hooks_zh[1..5]`; u02 p13 / p14 → `terms[6] / terms[0].explanation_zh`; u03 p01 / p02 → `explanation_en` / `explanation_zh`. `points[*]`, `analogy_*`, `pairs` have no derived copy.

D-198, before → after (one script; jp patches only; "topic" = all technology-23-61 questions):

| Patch | Nearest source | LCS | ed | wDice | 12-char windows unmasked / masked (cited) | Longest overlap after patch |
|---|---|---|---|---|---|---|
| **u05 p01** (H1) vs q075 stem filled with ウ | 2015h27a-q075 | **18 → 9** | **0.52 → 0.66** | **0.58 → 0.37** | **26 / 1 → 6 / 0** | term セキュリティパッチ |
| u05 p01 vs q075 stem with blanks | 2015h27a-q075 | → 7 | — | — | — | `定義ファイルを` (term + particle) |
| u05 p01, topic-wide | same (no other question nearer) | 9 | 0.66 | 0.37 | 6 / 0 (all on q075) | — |
| u02 p01 (M1) | 2009h21a-q066 stem / エ | 5 → 5 | 0.80 → 0.79 | 0.20 (エ) → 0.18 (stem) | 0 / 0 → 0 / 0 | particle phrase |
| u02 p04 (M2) | 2019h31h-q089 stem / 2010h22h-q087 ウ | 13 → 14 | 0.70 → 0.66 | 0.36 → 0.39 | 54 / 0 → 58 / 0 | term ソーシャルエンジニアリング + に |
| u02 p07 (M2, pairs cell) | 2022r04-q091 stem / 2010h22h-q087 ウ | 5 → 14 | 0.55 → 0.25 | 0.40 → 0.77 | 0 / 0 → 50 / 0 | term ソーシャルエンジニアリング + に (20-char cell, 13 of them the term) |
| u02 p10 (L1) | 2019h31h-q089 ウ | 9 → 9 | 0.73 → 0.74 | 0.28 → 0.27 | 0 / 0 | term のぞき見防止フィル(タ) |
| u04 p01 (L1) | q075 filled / topic | 3 → 3 | 0.76 → 0.76 | 0.25 → 0.25 | 0 / 0 | — |

u05 p01 remaining unmasked windows: only the term セキュリティパッチ + verb 当て (2 substitutions against the choice's particle + kana spelling); masked 0. The question's preface phrase (OS / application + 脆弱性 + 突く + ウイルス) and the two-measure frame no longer appear in this field (§3.1). u02 p07: the high wDice / low ed are an artefact of a 20-char cell that is 13 chars of term name + a negation; masked windows 0, no scene or choice wording → not copying. The calibration HIGH (ed 0.14 / Dice 0.52) is not reached by any patched text after patching.

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01 | `key_points_en[2]` (+ summary) | L1 | Yes: "damaged file content harms integrity" is grammatical, = jp ファイルの内容が壊れれば | No | OK |
| u01 | p02–p06 | `terms[2..6].hook_zh` (+ memory_hook, summary) | L2 | Yes: u01 zh 「 0 / “ 18 / ” 18 (balanced); jp keeps 「」 | No (cross-unit: §4 F3, u04 pre-existing) | OK |
| u01 | p07 | `terms[1].analogy_en` | L4 | Yes: restriction now on "the ones that arrive over communication lines", = jp 通信回線を通って届くもの / zh 经由通信线路找上门来的那些 | No | OK |
| u02 | p01–p03 | `terms[6].points[0].text_*` | **M1** | **Yes** (§3.2) | No | OK |
| u02 | p04–p09 | `terms[1].points[0].text_*`, `pairs[0].rows[2].b_*` | **M2** | **Yes** (§3.3) | **LOW 建議修 F1** (§4) | OK, fix advised |
| u02 | p10–p12 | `terms[0].points[1].text_*` | L1 | Yes: 備えには…がある / 之一 / "One direct safeguard" = `overview_rows[0].extra_*[1]` and `pairs[0].rows[3].a_*` (filter + screen lock); 2019h31h-q089 correct ウ (filter) still supported | No | OK |
| u02 | p13 | `terms[6].detail_zh` (+ explanation) | L9a | Yes: 等类别 = jp 例えば…分けられ (no count), en "for example" | No | OK |
| u02 | p14 | `terms[0].detail_zh` (+ explanation) | L9b | Yes: `[[jp:ショルダーハック]]` and `[[jp:ショルダーハッキング]]` both present in `terms[0].detail_jp` (「**ショルダーハック** (ショルダーハッキング)」); validate jp-origin 0 | No | OK |
| u03 | p01 | `terms[2].detail_en` (+ explanation) | L1 | Yes: "entirely" = jp 完全に / zh 完全 | No | OK |
| u03 | p02 | `terms[0].detail_zh` (+ explanation) | L2 | Yes: 侵占（挪用）资金者 = jp 横領をした人々 / en "people who had embezzled money" | No | OK |
| u03 | p03, p04 | `terms[3].points[0].text_zh/en` | L3 | Yes: `[[jp:動機]]` added (origin in jp text: 動機), zh no longer a nested attributive; still 1 sentence, same claim as jp | No | OK |
| u03 | p05 | `terms[1].points[0].text_zh` | L4 | Yes: parallel with p03 structure, `[[jp:機会]]` / `[[jp:動機]]` both kept; claim = jp | No | OK |
| u04 | p01–p03 | `terms[1].analogy_*` | L1 | Yes: 基本の備え / 基本的防范 / "basic defense" = `key_points_*[0]` (基本の備え / 基本防范 / "the basic defense") and `terms[1].detail_*` (基本の対策); the zero-day caveat in both is not contradicted | No | OK |
| u04 | p04 | `pairs[1].rows[0].a_en` | L2 | Yes: "they" = `overview_rows[3].one_line_en`, `terms[3].one_en` | No | OK |
| u05 | p01–p03 | `terms[1].points[0].text_*` | **H1** | **Yes** (§3.1) | No in the field; residual pattern in an unpatched field → **LOW 建議修 F2** (§4) | OK |

## 3. Focused checks

### 3.1 u05 H1 — resolved

- Structure: the patched point no longer follows 2015h27a-q075's stem clause by clause. The question's subject frame (OS / application → 脆弱性 → 突く → ウイルス → 予防には → 定義ファイル最新 → や → パッチ) is gone; the point now states a reason (updating definition files does not remove the weakness itself), then the measure (patch as well). Numbers in §1: vs stem filled with ウ, LCS 18 → 9 (= term セキュリティパッチ), ed 0.52 → 0.66, wDice 0.58 → 0.37 (below calibration 0.52), masked 12-char windows 1 → 0, unmasked 26 → 6 (all on term + verb). vs stem with blanks, longest overlap = 定義ファイルを (term + particle). Topic-wide, no other question is nearer.
- Fact vs cited answers: q075 correct ウ (vulnerability / apply security patches). The point names 脆弱性 as the thing exploited and the patch as the measure, and says "also" (も / 还要 / also), so the definition-file measure stays as in the question; it does not support 脅威 for blank a nor hard-disk encryption for blank b. Qualifier 「脆弱性を突くウイルス」 kept in all three languages. 2019h31h-q088 / 2009h21h-q081 (other points of the term) untouched. Consistent with `terms[1].detail_*` (some viruses exploit OS / application vulnerabilities; patch prevents) and `key_points_*[1]`.
- Trilingual: zh 即使更新了…本身依然存在。要防范…还要打上…安全补丁 / en "Updating definition files does not remove … To block viruses that exploit one, you also apply …" = jp; bold 2 / `[[jp:]]` 2 in zh / en, origins 脆弱性 / セキュリティパッチ present in jp. zh / en no longer carry the q075 sidecar phrasing (operating system + application / keep up to date): grep 0.
- D-200: 2 sentences, 61 normalised chars (≤100).

### 3.2 u02 M1 — resolved

- 2009h21a-q066 (correct ア, flood → equipment stops = physical): wrong エ's scene (an employee's mis-operation destroying data) is no longer reproduced; the point states only the classification rule (mis-operation is caused by human error → human threat) against disasters as the physical example. The correct ア's pattern (cause → equipment stops) is no longer mirrored either. LCS 5, wDice 0.18, windows 0.
- 「地震や火災などの災害のような」 is an example (のような / 等…那样的 / "such as"), so physical threats are not narrowed to disasters; consistent with `terms[6].detail_*` (human / physical / technical as "for example") and q066's correct answer (a disaster). zh / en same claim.

### 3.3 u02 M2 — resolved

- `terms[1].points[0]` and `pairs[0].rows[2].b_*` no longer say 技術的 / technical in any language; walk of u02 for 技術 / 技术 / technical: only `terms[6].detail_*` (the generic three-way example) remains. Eavesdropping is therefore no longer placed in the technical bucket, consistent with `unit_summary_*` (盗聴 listed among human threats) and the syllabus grouping cited in Rule A M2. Pairs row 「攻撃の型」: a = SE の一つ / b = SE には当たらない — symmetric, three languages agree (社会工程学的一种 / 不属于社会工程学; "A form of social engineering" / "Not social engineering").
- 2016h28h-q086 (correct ア, phone pretext to elicit secrets): the point supports "eavesdropping is not SE", so wrong ウ (sniffing packets for passwords) is rejected; 「パスワードなどを得る」 (wrong ウ's content) is removed.
- New wording check → F1 (LOW): the SE gloss 「人をだまして情報を聞き出す」 is narrower than the unit's own SE scope and echoes the correct choice's verb phrase.

### 3.4 Other requested checks

- u02 L9b: origin ショルダーハック exists in `terms[0].detail_jp` (bold) and `terms[0].points[0].text_jp`; ショルダーハッキング in the jp parenthesis. validate jp-origin 0.
- u04 L1: 「基本の備え」 equals `key_points_jp[0]` (基本の備え) and is compatible with `terms[1].detail_jp` (基本の対策) and the zero-day limit there; no field now says the patch is the best defence for holes in general (`terms[1].points[1]`'s 最も効果的 stays scoped to buffer overflow, Rule A a1 r2).
- u01 L2: u01 zh 「 0, “ 18 = ” 18; the 字 itself kept as Japanese 紛 inside “” (p04), as Rule A specified.

## 4. Observations

**F1 — LOW 建議修, u02 p04–p06 SE gloss is narrower than the unit's SE scope.** 「人をだまして情報を聞き出す」 / 欺骗人以套取信息 / "deceives people into giving information away" describes pretexting only, while the same unit counts shoulder hacking as SE (`terms[0].points[0]`, 2019h31h-q089 stem premise, 2022r04-q091 correct イ) and defines SE as exploiting carelessness or psychological gaps (`terms[0].points[0]`, `key_points_*[0]`). Shoulder hacking neither deceives nor elicits, so read restrictively the gloss would exclude it. Not MEDIUM: the gloss is a descriptive modifier, the broad scope is stated explicitly twice in the same unit, and the pre-patch text already had 人をだます; no cited answer is reversed. Fragment 「人をだまして情報を聞き出す」 also echoes q086 correct ア's verb phrase (fragment ed 0.46 / wDice 0.50 / LCS 7; whole field 0.66 / 0.39 — standard SE wording, not copying). Fix (reuses the unit's own wording from `terms[0].points[0]`; new fragment vs topic: ed 0.68 / wDice 0.22 / LCS 4, masked windows 0; whole field ed 0.71 / wDice 0.36):

- `terms[1].points[0].text_jp`: 通信を傍受して中身を読み取る盗聴は、人をだまして情報を聞き出す **ソーシャルエンジニアリング** には当たらない。 → 通信を傍受して中身を読み取る盗聴は、人の不注意や心理の隙を突いて情報を得る **ソーシャルエンジニアリング** には当たらない。
- `terms[1].points[0].text_zh`: …不属于欺骗人以套取信息的**社会工程学**（[[jp:ソーシャルエンジニアリング]]）。 → …不属于利用人的疏忽或心理漏洞获取信息的**社会工程学**（[[jp:ソーシャルエンジニアリング]]）。
- `terms[1].points[0].text_en`: …is not **social engineering** ([[jp:ソーシャルエンジニアリング]]), which deceives people into giving information away. → …is not **social engineering** ([[jp:ソーシャルエンジニアリング]]), which obtains information by exploiting carelessness or psychological gaps in people.

**F2 — LOW 建議修, u05 `key_points_*[1]` (unpatched) keeps a softer form of the H1 pattern.** 対策の基本は、…定義ファイルを更新し続けることと、OS やアプリケーションにセキュリティパッチを当てて脆弱性をふさぐこと lists the same two measures in the same order as 2015h27a-q075 and reuses choice ウ's b phrasing (OS / application + patch). vs the filled stem: LCS 19 (アプリケーションにセキュリティパッチを), ed 0.48, wDice 0.49 (ウ), unmasked windows 51, masked 0. Not HIGH: ed is ≈3.4× the calibration, the question's subject frame (脆弱性を突くウイルス / 予防には) is absent, the field is a unit summary that is not followed by the quiz, the two basic measures are the standard general statement and the overlap is with the correct choice (D-198 allows agreement with a correct answer in standard wording). Rule A u05 did not list it under D-198 (only L2 restating). Recommended because the fix is cheap and removes the last q075-shaped sentence (after: LCS 9 = term, ed 0.69, wDice 0.36, windows 0 / 0):

- `key_points_jp[1]` (+ `summary.key_points_jp[1]`): 対策の基本は、対策ソフトの**定義ファイル**を更新し続けることと、OS やアプリケーションに**セキュリティパッチ**を当てて脆弱性をふさぐことである。 → 対策の基本は、対策ソフトの**定義ファイル**を更新し続けることと、ソフトの脆弱性を**セキュリティパッチ**でふさぐことである。
- `key_points_zh[1]` (+ summary): …，并给操作系统和应用程序打上**安全补丁**以堵住漏洞。 → …，并用**安全补丁**堵住软件的漏洞。
- `key_points_en[1]` (+ summary): …and applying **security patches** to the OS and applications to close vulnerabilities. → …and closing software vulnerabilities with **security patches**.

**F3 — LOW 建議修, pre-existing, cross-unit: u04 zh still uses 「」** (21 occurrences, 0 “”) while u01 (after p02–p06), u02, u03, u05 use “” only — the inconsistency u01 L2 was raised to remove now sits inside this batch. Not introduced by any patch; u04 Rule A did not list it. Base fields (derived copies follow): `terms[0].hook_zh` 「虫子」→“虫子”; `terms[1].hook_zh` 「洞」/「补丁布」→“洞”/“补丁布”; `terms[2].hook_zh` 「災」「巛」「火」→“災”“巛”“火”; `terms[3].points[0].text_zh` 「坏了」→“坏了”; `key_points_zh[2]` 「需要时能够使用」→“需要时能够使用” (+ `memory_hook_zh` ×3, `summary.memory_hooks_zh[0..2]`, `summary.key_points_zh[2]`).

Records only, no fix:

4. LOW, u05 `terms[1].points[0]` says 弱点を直す while `detail_*` says 弱点をふさぐ — same meaning, wording varies.
5. LOW, u02 `pairs[0].rows[2]` cell 「ソーシャルエンジニアリングには当たらない」 has wDice 0.77 / ed 0.25 against short term-name sources (§1) — artefact of a short cell made of the term name; masked 0.

## 5. Overall verdict

- HIGH introduced or remaining from patched findings: **0** (u05 H1 resolved, §3.1; D-201 §0-3 stop condition not triggered)
- MEDIUM introduced or remaining: **0** (u02 M1, M2 resolved, §3.2 / §3.3)
- LOW introduced: 建議修 1 (F1); pre-existing 建議修 2 (F2 residual q075 pattern in an unpatched summary field, F3 cross-unit zh quotes); 記録のみ 2 (obs. 4–5)
- D-205: no patch adds a version-bound count / structure claim (u02 p13 removes one: 三类 → 等类别)
- D-198: no copying in patched texts (masked windows 0 on all patched jp texts, cited and topic-wide; unmasked windows only on term names + particle / verb)
- validate 5/5 = 0 issues (3 pre-existing warnings), parity 5/5 = 0 diff (26 / 27 / 27 / 24 / 34 locations), vitest textbook 162/162

**PASS** — all 33 active patches are applied with derived fields following, H1 / M1 / M2 are resolved, and no new HIGH / MEDIUM is introduced. F1–F3 are advised, not required by the PASS condition. If applied, re-run validate / parity and record them as patches.
