# b16 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditors' context; Rule D)
- Date: 2026-11-05 (Session 143)
- Scope: B3 wording patches for technology-23-61-u11 (p01–p11), u12 (p01–p19), u13 (p01)
  — 31 `active`, 0 retired (`patches/technology-23-61-u11.json` … `-u13.json`), checked against the Rule A findings
  (`technology-23-61-u11.ruleA.md` **M1**, L1–L5; `-u12` **M1**, **M2**, **M3**, L5, L6, L10, L11; `-u13` L1) and the merged units
  `data/ip/textbook/units/technology-23-61-u1{1,2,3}.json` (sha256 u11 `4cbe4077a5cc0c98…`, u12 `08de1289268ba448…`, u13 `a072ad7e027c368a…`).
- Pre-patch bases located by sha256 = `base_sha256`: `.planning/v2/<U>/parts/b16-u11-a2/…loc.r0.json` (`abf9d527…`), `b16-u12-a2/…loc.r0.json` (`95a33041…`), `b16-u13-a1/…loc.r0.json` (`6c0a12b3…`) (all 3 match).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, and the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names).

## 0. Method

Same as `b14_patch_rereview.md` §0 / `b15_patch_rereview.md` §0:

1. Application check (script): every string field of base and merged unit is walked. Each `after` (raw and notation-stripped) must appear in its field; `before` must not survive anywhere; every string that differs between base and unit (for paths present in the base) must be explained by a patch.
2. Derived-field check from the same walk (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`, `summary.memory_hooks_*`) — every term and key point of the 3 units, not only the patched ones.
3. D-198 (jp patches): LCS, 12-char window with ≤2 substitutions with and without masking (katakana runs ≥4 and alnum masked), semi-global edit distance normalised by unit-text length (ed), best same-length-window bigram Dice (wDice). Sources: stem (`stem_jp_clean`, fallback `stem_jp`) + all choices of every technology-23-61 question (89), plus the two fill-in-the-blank stems of the topic **with the blanks filled by the correct answer** (2012h24h-q068, 2015h27a-q075), plus — because u12 M2 introduces 「可用性」 — the three pool questions outside the topic that pair DoS with 可用性 (2016h28h-q083, 2022r04-q072, 2025r07-q097). 2025r07-q073 is an item-list combination stem (items already in the stem). Normalisation differs from the Rule A scripts (e.g. this script counts ≤2-substitution windows, where Rule A u12 M2 / u11 L1 report exact 12-char matches), so absolute values differ from the Rule A files; before → after is measured with one script. zh / en patches: LCS against the zh / en translation sidecars of all topic questions.
4. D-195 / D-200 via validate.
5. Manual reading of each patched field in context (whole term + overview row + pairs + key_points + goals); meaning judged against the cited questions' `correct_answer`.
6. `scripts/textbook-v2-validate.mjs` / `scripts/textbook-v2-parity.mjs` per unit; `npx vitest run src/lib/textbook`.

Not established: as in b14 / b15, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: u11 152, u12 126, u13 60) were checked for the derived copies (step 2) and for the patched texts.

## 1. Script results (fresh, 2026-11-05)

```
✓ technology-23-61-u11 unit: 0 issues   validate exit 0 | parity: 37 locations, 0 diff  exit 0
✓ technology-23-61-u12 unit: 0 issues   validate exit 0 | parity: 29 locations, 0 diff  exit 0
✓ technology-23-61-u13 unit: 0 issues   validate exit 0 | parity: 17 locations, 0 diff  exit 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

No warnings in any of the 3 units.

Application: 31/31 `after` present in their fields. `before` remnants anywhere in the units (raw or stripped): 0. Unexplained base → unit diffs in base-present paths: 0 per unit (only the `stage` meta key removed).

Derived fields follow: u11 p07 / p08 → `terms[5].definition_zh` (and the shared phrase in `overview_rows[5].one_line_zh`), p09 → `terms[4].definition_en`, p11 → `terms[5].explanation_zh`; u12 p07–p09 → `summary.key_points_*[0]`, p13–p15 → `terms[5].definition_*`, p16 / p17 → `terms[1].explanation_zh / _en`, p18 → `terms[0].memory_hook_en` + `summary.memory_hooks_en[0]`. Full walk of all terms: `definition / explanation / memory_hook` = notation-stripped `one / detail / hook` — 0 mismatches in all 3 units; `summary.key_points_*` = stripped `key_points_*` — 0 mismatches. `points[*]`, `fig.*`, `pairs`, `overview_rows` have no derived copy.

Notation counts, before → after, every patched field: bold and `[[jp:]]` unchanged in all 31 (e.g. u12 p11 / p12 `[[jp:]]` 3 → 3, u12 p02 / p03 1 → 1, u13 p01 bold 1 / `[[jp:]]` 2 unchanged).

D-198, before → after (one script; jp patches only; topic-wide + filled stems + the 3 可用性 questions):

| Patch | Nearest source | LCS | ed | wDice | 12-char windows unmasked / masked | Longest overlap after patch |
|---|---|---|---|---|---|---|
| **u11 p01** (M1) | 2026r08-q096 stem (wDice) / 2016h28h-q086 ア (LCS) | 5 → 5 | 0.76 → 0.78 | 0.22 → 0.23 | 0 / 0 → 0 / 0 | `機密情報を` |
| u11 p04 (L1) | 2019h31h-q089 ウ | **14 → 10** | **0.13 → 0.31** | 0.87 → 0.60 | **5 / 1 → 1 / 0** | term のぞき見防止フィルム (obs. 5) |
| **u12 p01** (M1) | 2013h25a-q074 ウ | 7 → 8 | 0.80 → 0.77 | 0.17 → 0.25 | 0 / 0 → 0 / 0 | `修正プログラムが` |
| **u12 p04** (M2) | 2009h21h-q068 stem | 10 → 10 | 0.81 → 0.79 | 0.26 → 0.32 (2025r07-q097 stem) | 1 / 0 → 1 / 0 | `DoS攻撃のねらいは` (unpatched part, obs. 6) |
| **u12 p07** (M2) | 2009h21h-q068 stem | 10 → 10 | 0.71 → 0.67 | 0.38 → 0.39 | 1 / 0 → 1 / 0 | `DoS攻撃のねらいは` (unpatched part, obs. 6) |
| **u12 p10** (M3) | 2018h30h-q067 stem | 7 → 7 | 0.77 → 0.77 | 0.19 → 0.19 | 0 / 0 → 0 / 0 | `サイバー攻撃の` |
| u12 p13 (L5) | 2012h24h-q077 ア | 5 → 5 | 0.84 → 0.83 | 0.11 → 0.12 | 0 / 0 → 0 / 0 | `入力データ` |

Against 2009h21a-q066 (M3's source) the new u12 p10 text has no window and wDice ≤0.19; the scene of the correct choice (a natural cause stops equipment) is gone. The new 可用性 sentences (p04 / p07) do not approach the three out-of-topic 可用性 questions (best wDice 0.32, ed ≥0.79, windows 0). zh / en after-spans: longest overlaps with the sidecars are generic phrases (u12 p02 `修复程序发布之前` 8 chars vs 2025r07-q073 zh stem; u11 p03 " confidential information and " vs 2017h29a-q065 en stem; u11 p06 " a privacy filter" = the product name; u12 p05 / p06 / p08 / p09 after-spans ≤24 chars, "in information security"). The calibration HIGH (ed 0.14 / Dice 0.52) is not reached by any patched text after patching except the u11 p04 16-char table cell (wDice 0.60, short-cell artefact, ed 0.31 > calibration, masked 0; obs. 5). u11 p04 reduces a pre-existing numeric overlap (with q089 correct ウ); u12 p01 / p04 / p07 / p10 remove the q087 / q068 / q066 choice-set negations (D-198 (iii); numeric metrics essentially unchanged).

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u11 | p01–p03 | `terms[2](APT).points[0].text_*` | **M1** | **Yes** (§3.1) | LOW 建議修 F1 (en coordination) | OK, fix advised |
| u11 | p04–p06 | `terms[0].fig.data.rows[1].cells[2].*` | L1 | Yes: the correct-choice sentence frame (screen + 貼る) is gone; the cell keeps the product name as the countermeasure, consistent with `points[2]` (のぞき見防止フィルムが対策になる; 2019h31h-q089 correct ウ still supported). zh 用防窥膜盖住屏幕 / en "Cover the screen with a privacy filter" = jp | No (obs. 5) | OK |
| u11 | p07, p08 | `terms[5].one_zh`, `overview_rows[5].one_line_zh` | L2 | Yes: 卡号 = jp カード番号 / en "card numbers" (credit cards no longer excluded) | No | OK |
| u11 | p09 | `terms[4].one_en` (+ definition) | L3 | Yes: "or similar" = jp ファイル**など** / zh 文件等 | No | OK |
| u11 | p10 | `terms[0].points[0].text_en` | L4 | Yes: "people's lapses" = jp **人の**心の隙 | No | OK |
| u11 | p11 | `terms[5].detail_zh` (+ explanation) | L5 | Yes: 收藏 = bookmark = en "a bookmark saved in advance"; no longer readable as account registration | No | OK |
| u12 | p01–p03 | `terms[2](ゼロデイ攻撃).points[1].text_*` | **M1** | **Yes** (§3.2) | No (obs. 1–2) | OK |
| u12 | p04–p09 | `terms[0](DoS攻撃).points[0].text_*`, `key_points_*[0]` (+ summary) | **M2** | **Yes** (§3.3) | No (obs. 3, 6) | OK |
| u12 | p10–p12 | `terms[0](DoS攻撃).points[1].text_*` | **M3** | **Yes** (§3.4) | No | OK |
| u12 | p13–p15 | `terms[5](敵対的サンプル).one_*` (+ definition) | L5 | Yes: 人には / 人 / people — no longer limited to sight; = `detail_jp` (人には元と同じに見えても), `overview_rows[5].extra_*[1]` (人には分からない程度 / 人察觉不到 / too faint for people) | No | OK |
| u12 | p16, p17 | `terms[1](DDoS攻撃).detail_zh / _en` (+ explanation) | L6 | Yes: the added "(C&C server)" gloss is gone; zh / en = jp 指令サーバ | No | OK |
| u12 | p18 | `terms[0].hook_en` (+ memory_hook, summary) | L10 | Yes: two independent statements (lowercase o ← "of"; a different word from DOS) = jp; the causal reading is gone | No | OK |
| u12 | p19 | `pairs[0].rows[0].a_zh` | L11 | Yes: 单台设备 (natural zh) = jp 1 台の機器 / en "a single device" | No | OK |
| u13 | p01 | `terms[1](ポートスキャン).points[0].text_zh` | L1 | Yes: 预留的后门 is the usual zh collocation (no machine-trick nuance); still = jp 再び入るための仕掛けを残す / en "left behind … so the attacker can get back in". Bold 1 / `[[jp:]]` 2 unchanged | No (obs. 4) | OK |

## 3. Focused checks

### 3.1 u11 M1 — resolved

- 「機密情報を**盗むなど**の目的で」 / 为了窃取机密信息**等**目的 / "for ends **such as** stealing confidential information": the purpose is open again in all three languages, matching 2026r08-q096's stem (取得**など**を目的). 盗む vs 取得: for an attacker, obtaining confidential information = stealing it; same meaning, and the auditor chose 盗む to avoid a 12-char match with the stem (measured: windows 0 / 0, LCS 5).
- Other qualifiers of q096 kept: 特定の相手 (one / overview 特定の組織や個人), 複数の手口, 長い期間. Correct ア (APT) still supported; wrong choices (DDoS / zero-day / password list) not supported.
- Agreement with other fields: `one_*`, `overview_rows[2]`, `detail_*` (機密情報を何か月も持ち出し続けることがある), analogy (貴重品を持ち出すスパイ) — none closes the purpose; the point now agrees with the `detail`'s ことがある. (terms[1] 標的型攻撃 `one` still says 情報を盗み出す攻撃 — Rule A L11, record only, outside scope.)
- F1 (LOW 建議修, §4): the en sentence's coordination.

### 3.2 u12 M1 — resolved; the new claim is supported and not a copy

- Old point negated q087's wrong ア (time since attack start) and イ (virus latency) in the question's order. New point: 「「ゼロデイ」かどうかは、修正プログラムが出る前か後かで決まり、突かれる脆弱性や使われるプログラムの種類は問わない。」 — neither the 24-hour / attack-start time axis nor latency / virus is mentioned in any language (zh 是否算“零日”…与被利用的漏洞或所用程序的种类无关 / en "depends on whether it comes before or after the fix is released, not on the kind of vulnerability or program involved").
- Support for the first half (before / after the fix decides it): q087 correct ウ (exploit before the countermeasure is published), 2013h25a-q074 correct ウ and 2025r07-q073 item a (before the vendor's 修正プログラム is provided) — the two other cited questions of `points[0]` use 修正プログラム literally, so the axis wording is the cited questions' own concept, and it agrees with `one_*` (修正プログラムが出回る前), fig steps (修正プログラムがない期間 → 提供), `overview_rows[2]`, hook (日数ゼロ). After the fix is released an attack on the same hole is not zero-day — correct (and is what fig step 4 / mix `points[2]` say about patching).
- Support for the second half (type of vulnerability / program does not matter): not stated by any choice, but it is the definition's own scope — every cited correct answer defines zero-day by timing relative to the fix for "a vulnerability of software", with no restriction on which vulnerability or which software (q074 ウ generic ソフトウェア, q073 a Web service software, q087 ウ ソフトウェアの脆弱性). It restricts nothing (it is a "does not depend on" statement), so it is not an unsupported limitation (観点 9) and does not contradict `points[2]` (buffer overflow = one kind of vulnerability-attack) — rather it generalises it correctly. Not an unsupported generalisation.
- D-198 (iii): no choice of q087 (or of q074 / q073) is reproduced or negated in order; 「使われるプログラムの種類」 is abstract and does not re-stage イ's virus scene (obs. 1). Topic-wide: windows 0 / 0, LCS 8 (`修正プログラムが`, q074 ウ), wDice 0.25, ed 0.77.
- D-200: 1 sentence, 52 normalised chars.

### 3.3 u12 M2 — resolved; 「可用性」 is supported

- Old point / key point negated q068's wrong ア (admin rights) + エ (steal data) (and key point エ + ウ) in order. New: 「…ねらいはサービスの妨害で、損なわれるのは情報セキュリティの可用性である。」 / key point 「…損なわれるのは可用性である。」; zh 受损的是(信息安全中的)可用性 / en "what it damages is availability (in information security)". No wrong choice of q068 / 2013h25h-q052 / 2014h26h-q053 is mentioned in any language (grep 管理者 / 盗 / 改ざん / 管理员 / 窃取 / 篡改 / privileges / steal / alter in `terms[0].points[0]` and `key_points_*[0]`: 0).
- Support: the three cited correct answers all describe loss of the service (q068 イ service disruption, q052 ウ service made unavailable by mass requests, q053 エ provision of the service obstructed) = loss of availability; the unit already teaches this in `detail_*` 1st sentence (DoS攻撃が損なうのは…**可用性**, with the gloss 必要なときにシステムを使える性質), `overview_rows[0..1].extra_*[0]` (サービスの可用性) and `pairs[0].rows[1]` (損なうもの: 可用性). Out-of-topic pool questions that pair DoS with 可用性 (technology-23-62: 2016h28h-q083, 2022r04-q072, 2025r07-q097) count DoS as an availability loss — consistent, and the new text does not approach them (§1). 可用性 = zh 可用性 per the term table.
- The point still supports q053 correct エ in its unchanged 2nd sentence (サーバが直接受ける被害 = サービスを提供できなくなる).
- Repetition (書き方 8 / §9): 可用性 now appears in detail, points[0], key_points[0], overview extras and pairs rows[1] → record (obs. 3).

### 3.4 u12 M3 — resolved

- 「地震や火災**などの災害**のような物理的脅威」 / 地震、火灾等灾害那样的物理威胁 / "a disaster like an earthquake or fire": the correct-choice frame of 2009h21a-q066 (a natural cause stopping equipment) is gone in all three; the classification principle (network attack = cyberattack, disaster = physical threat), supported by q066 ア and 2018h30h-q067 (DoS-type choice is a cyberattack), stays. Same wording as the b14 u02 M1 fix that passed. zh rewords the clause (通过网络发动 → 经由网络实施); 网络 still occurs twice (经由网络 / 网络攻击) because 网络攻击 is the term itself — the loc.r1 LOW is softened, not removed (no fix needed). `[[jp:]]` 3 / 3 in zh / en, bold 1.

### 3.5 Other requested checks

- Dropped qualifiers: all qid-carrying patched points keep their scope words (u11 p01 など restored; u12 p01 does not narrow; u12 p04 keeps the 2nd sentence; u12 p10 keeps ネットワーク越し / サイバー攻撃の一つ). No new restriction found.
- D-204: no analogy / hook carries content the patched points now deny (APT analogy 持ち出す, zero-day analogy before the locksmith comes, DoS analogy counter blocking — all agree).
- D-205: no patch adds a version-bound count / structure claim.

## 4. Observations

**F1 — LOW 建議修, u11 `terms[2](APT).points[0].text_en` coordination.** After p03 the sentence reads "…marked by aiming at a specific target for ends such as stealing confidential information and not letting up, using several methods over a long period." — "and not letting up" can now be parsed as a second item of "ends such as …" (purpose = stealing information and not letting up), while jp / zh have two parallel features (目的で…狙い、…長い期間攻撃をやめない点 / 盯住…，…长期不停地攻击). Not MEDIUM: the intended reading is recoverable and no fact is wrong; but the en point is the field M1 was about. Fix (no derived copy; bold 1 kept, no `[[jp:]]` before or after; jp / zh unchanged):

- `terms[2](APT).points[0].text_en`: "**APT** is marked by aiming at a specific target for ends such as stealing confidential information and not letting up, using several methods over a long period." → "**APT** is marked by aiming at a specific target for ends such as stealing confidential information, and by not letting up, using several methods over a long period."
  Patch form: the F1 span lies inside p03's replaced text, and `scripts/textbook-v2-patch.mjs` refuses a `before` that overlaps an earlier active patch's replaced text in the same field (L3, "retire + register"). So: **retire p03** and register a replacement on the same base (`abf9d527…`), field `terms[2](APT).points[0].text_en`, before `to obtain confidential information and not letting up` → after `for ends such as stealing confidential information, and by not letting up`, reason "Rule A M1 + b16 re-review F1". jp / zh (p01 / p02) stay as they are.

Note: the current en wording is the text prescribed verbatim by Rule A u11 M1, so F1 is a refinement of the auditor's text, not a writer slip.

Records only, no fix:

1. LOW, u12 `terms[2].points[1]`: 「使われるプログラム」 / 所用程序 / "program involved" can be read as the attacked software or the attacking program; both readings are true for zero-day, three languages carry the same ambiguity. It does not re-stage q087 イ (no virus, no latency).
2. LOW, u12 `terms[2].points[1]` vs `points[0]`: q087 correct ウ speaks of the 対策 being published, `points[0]` of 修正プログラムや対策, the new `points[1]` of 修正プログラム only. q074 / q073 (cited) use 修正プログラム, and `one` / fig / overview do too; q087 is still answered correctly. Also the first half of `points[1]` re-states the timing of `points[0]` (§9 言い直し, low) — its new information is the type-independence.
3. LOW, u12 可用性 repetition (detail 1st sentence, points[0], key_points[0], overview_rows[0..1].extra[0], pairs[0].rows[1]) — 書き方 8 / §9 class; the point states it as the exam fact, the detail carries the definition.
4. LOW, u13 p01: 预留 can also mean "reserved in advance" (e.g. a backdoor built in by a developer); with 入侵后为了再次进入 in the same clause the reading "left in place after the break-in for re-entry" is the natural one and matches jp / en.
5. LOW, u11 p04: the 16-char cell still has LCS 10 = the product name のぞき見防止フィルム and 1 unmasked ≤2-substitution window / wDice 0.60 against 2019h31h-q089 correct ウ — the countermeasure's name only, no sentence frame; masked 0, ed 0.31 (> calibration). Same treatment as the b15 u08 p01 short label.
6. LOW, pre-existing, unpatched clause: u12 `terms[0].points[0].text_jp` / `key_points_jp[0]` begin 「**DoS攻撃** のねらいはサービスの妨害」, which is 2009h21h-q068's stem + correct イ restated as a statement (1 unmasked window, masked 0). This is the exam fact itself in the shortest wording, present before the patches and not flagged by Rule A; M2's patches did not change it.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM introduced or remaining from patched findings: **0** (u11 M1 §3.1, u12 M1 §3.2, M2 §3.3, M3 §3.4 resolved)
- LOW introduced: 建議修 1 (F1, u11 APT points[0].text_en coordination); 記録のみ 6 (obs. 1–6)
- D-198: no copying in patched texts (masked windows 0 on all patched jp texts topic-wide incl. filled stems and the out-of-topic 可用性 questions; remaining unmasked windows are the product name in u11 p04 and the unpatched q068 stem phrase); the u11 p04 overlap and the q087 / q068 / q066 choice-set negations are removed
- validate 3/3 = 0 issues (0 warnings), parity 3/3 = 0 diff (37 / 29 / 17 locations), vitest textbook 162/162

**PASS** — all 31 active patches are applied with derived fields following, u11 M1 and u12 M1 / M2 / M3 are resolved, the new u12 claims (zero-day decided by fix timing, independent of vulnerability / program type; DoS damages availability) are supported by the cited questions' correct answers and every other field and copy no question, trilingual parity and `[[jp:]]` / bold counts are preserved, and no new HIGH / MEDIUM is introduced. F1 is advised, not required by the PASS condition. If applied, re-run validate / parity and record it as a patch.
