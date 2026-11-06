# b20 B3 patch re-review — part 1 (u01, u03) (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditors' context; Rule D)
- Date: 2026-11-06 (Session 146)
- Scope (part 1): B3 wording patches for strategy-02-04-u01 (p01–p14) and u03 (p01–p14)
  — 28 `active`, 0 retired (`patches/strategy-02-04-u01.json`, `-u03.json`), checked against the Rule A findings
  (`strategy-02-04-u01.ruleA.md` L1–L4 建議修; `-u03` L1, L2, L3, L8 建議修; both units PASS, no MEDIUM) and the merged units
  `data/ip/textbook/units/strategy-02-04-u0{1,3}.json` (sha256 u01 `2b7ffaebb815200d…`, u03 `5072f65ea5743f0f…`).
  **u02 is not covered here**; it is reviewed later in a separate part 2 section / file.
- Pre-patch bases located by sha256 = `base_sha256`: `.planning/v2/<U>/parts/b20-u01-a2/…loc.r0.json` (`ea389a71…`), `b20-u03-a1/…loc.r0.json` (`53fad56e…`) (both match).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, and the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names; matched fragments ≤12 chars, except the two en sidecar overlaps in §1 which are project translations, quoted as the unit's own after-span).

## 0. Method

Same as `b19_patch_rereview.md` §0 (= `b18` / `b17` / `b16` §0), topic strategy-02-04:

1. Application check (script): every string field of base and merged unit is walked. Each `after` must appear in its field; `before` (raw and notation-stripped) must not survive anywhere; every string that differs between base and unit (for paths present in the base) must be explained by a patch; the patches replayed in file order on the base must reproduce the unit's field exactly.
2. Derived-field check from the same walk (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`) — every term and key point of the 2 units, not only the patched ones.
3. D-198 (jp patches: u01 p09, p12; u03 p01, p04, p07, p10): LCS, 12-char window with ≤2 substitutions with and without masking (katakana runs ≥4 and alnum masked; masked windows with <6 real chars excluded), best same-length-window bigram Dice (wDice). Sources: stem (`stem_jp_clean`, fallback `stem_jp`) + all choices of every strategy-02-04 question (69; 345 source strings). zh / en patches: LCS against the zh / en translation sidecars of all 69 topic questions (345 strings each), for the whole patched field before → after and for the `after` span alone. Normalisation differs from the Rule A scripts, so absolute values differ from the Rule A files; before → after is measured with one script.
4. D-195 / D-200 via validate; zh-term warnings compared with `validate --part <base>`.
5. Manual reading of each patched field in context (whole term + overview row + pairs + key_points + fig); meaning judged against the cited / quiz questions' `correct_answer` and their zh / en sidecars (b18 u05 M1 type: does a zh / en rewrite move toward a wrong choice's wording?). Focus points requested for this batch: u01 p09–p11 (copyright analogy), p01–p06 (zh 考案), p12–p14 (「原則として」); u03 p04–p09 (プロダクトキー), p01–p03 (「など」).
6. `scripts/textbook-v2-validate.mjs --unit` / `scripts/textbook-v2-parity.mjs --unit` per unit; `npx vitest run src/lib/textbook`.

Rule A files read in full for the prescriptions (u01 §3 L1–L13 + §6–§9 tail: 建議修 = L1–L4 only; u03 §3 L1–L10: 建議修 = L1–L3, L8 only); no other 建議修 exists for these two units.

Not established: as in b14–b19, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: u01 159, u03 105) were checked for the derived copies (step 2) and for the patched texts. Legal facts (著作権法 17 条 2 項 無方式主義 / 30 条 1 項 例外 / 32 条 引用) judged from the Rule A u01 §5 table and general knowledge; no primary statute text consulted (the patches remove or soften claims rather than adding new ones). Product-key practice judged from general knowledge.

## 1. Script results (fresh, 2026-11-06)

```
✓ strategy-02-04-u01 unit: 0 issues        validate exit 0 | parity: 30 locations, 0 diff  exit 0
✓ strategy-02-04-u03 unit: 0 issues        validate exit 0 | parity: 25 locations, 0 diff  exit 0
validate --part b20-u01-a2/…loc.r0.json: 0 issues | validate --part b20-u03-a1/…loc.r0.json: 0 issues
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

No warnings in either unit (base parts: none either) — no patch-introduced zh-term warning.

Application: 28/28 `before` occur exactly once in the base field; 28/28 `after` present in their fields; replay of the patches in file order on the base reproduces every patched field exactly (2/2 units). `before` remnants anywhere in the units (raw or stripped): 0. Unexplained base → unit diffs in base-present paths: 0 per unit (u01 14 changed paths, u03 14 = the patched fields; only the `stage` meta key removed, as in b19; `round` / `jp_round` are non-string meta keys of the part).

Derived fields follow: u01 p01 → `terms[3].definition_zh`, p02 → `terms[3].explanation_zh`, p12–p14 → `terms[0].explanation_jp / _zh / _en`; u03 p04–p06 → `terms[3].explanation_jp / _zh / _en`. Full walk of all terms: `definition / explanation / memory_hook` = notation-stripped `one / detail / hook`, and `summary.key_points_*` = stripped `key_points_*` — u01 84, u03 57 checked, 0 mismatches. `analogy_*`, `points[*]`, `fig.*`, `overview_rows`, `pairs` have no derived copy.

Notation counts (bold, `[[jp:]]`), before → after, every patched field: unchanged in 28 of 28 (e.g. u01 `terms[3].one_zh` bold 2 → 2 / `[[jp:]]` 2 → 2 [`[[jp:考案]]` kept]; `terms[3].points[0].text_zh` `[[jp:]]` 2 → 2; u03 `terms[3].detail_zh` bold 1 / `[[jp:プロダクトキー]]` 1 kept). Parity 0 diff.

D-198, before → after (one script):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest overlap of the `after` span |
|---|---|---|---|---|
| u01 p01 | zh | 2014h26h-q024 ア | 5 → 5 (实用新型法 = term, unchanged part) | 实用新型 (4 = term; 2009h21h-q015 イ) |
| u01 p02 | zh | 2016h28a-q021 ア → 2009h21h-q015 イ | 4 → 4 | 实用新型 (4, term) |
| u01 p03 | zh | 2014h26h-q024 ア | 5 → 5 (term) | 实用新型 (4, term) |
| u01 p04 | zh | 2010h22h-q007 stem → 2009h21h-q015 イ | 3 → 4 | 实用新型 (4, term) |
| u01 p05 | zh | 2009h21a-q021 ア → 2009h21h-q015 イ | 2 → 4 | 实用新型 (4, term) |
| u01 p06 | zh | 2009h21a-q021 ウ → 2009h21h-q015 イ | 3 → 4 | 实用新型 (4, term) |
| u01 p07 | en | 2009h21a-q021 エ → **2025r07-q012 stem** | 10 → **29** | " mark under the trademark act" (29; obs. 1) |
| u01 p08 | en | same | 10 → **29** | same (29; obs. 1) |
| u01 p09 | **jp** | 2022r04-q001 stem | 5 → 5 (ようなもの) | windows unmasked / masked 0 / 0 → 0 / 0; wDice 0.17 → 0.16 |
| u01 p10 | zh | 2010h22h-q025 ア → 2010h22a-q012 イ | 3 → 3 | 的作品 (3) |
| u01 p11 | en | 2018h30h-q010 ウ | 12 → 12 (" government ", unchanged part) | " writing" (8) |
| u01 p12 | **jp** | 2017h29a-q028 ア | 12 → 12 (コンピュータのプログラム, unchanged sentence 2 = Rule A L13) | windows 16 / 0 → 16 / 0 (all = the L13 phrase, unmasked only); wDice 0.16 → 0.16; after-span して認められる (7) |
| u01 p13 | zh | 2011h23a-q004 stem | 5 → 5 (计算机程序, unchanged) | 正当 (2) |
| u01 p14 | en | 2018h30h-q010 イ (correct) | 20 → 20 ("ting someone else's ", unchanged part) | " the source " (12) |
| u03 p01 | **jp** | 2017h29a-q089 ア (correct = term name) | 9 → 9 (アクティベーション = term) | などを目的 (5, q089 stem); windows 0 / 0 → 0 / 0; wDice 0.21 → 0.25 |
| u03 p02 | zh | 2017h29a-q089 stem | 4 → 5 | 非法使用等 (5) |
| u03 p03 | en | 2017h29a-q089 stem | 17 → **49** | " for purposes such as preventing unauthorized use" (49; obs. 2) |
| u03 p04 | **jp** | 2011h23tokubetsu-q090 stem | 6 → 6 (のライセンス) | ライセンス (5); windows 0 / 0 → 0 / **1** (obs. 3, false positive); wDice 0.14 → 0.13 |
| u03 p05 | zh | 2011h23a-q020 stem | 3 → 3 | 许可证 (3) |
| u03 p06 | en | 2017h29a-q089 stem | 16 → 16 (" authentication ", unchanged) | " purchased " (11) |
| u03 p07 | **jp** | 2011h23a-q010 stem | 5 → 5 (ライセンス) | ライセンス (5); windows 0 / 0 → 0 / 0; wDice 0.23 → 0.34 (short caption vs short stem window; no window hit) |
| u03 p08 | zh | 2018h30a-q032 stem | 5 → 5 (购买许可证, unchanged part) | 许可证 (3) |
| u03 p09 | en | 2011h23tokubetsu-q090 stem | 12 → 12 (" and receive", unchanged) | "e to that " (10) |
| u03 p10 | **jp** | 2010h22h-q025 イ | 4 → 4 | るように (4); windows 0 / 0 → 0 / 0; wDice 0.15 → 0.18 |
| u03 p11 | zh | 2009h21a-q021 ア → 2010h22a-q012 ア | 2 → 2 | 完成 (2) |
| u03 p12 | en | 2017h29a-q089 stem | 17 → 17 ("e authentication ", unchanged) | 17 (the field minus the deleted clause) |
| u03 p13 / p14 | zh | 2010h22h-q025 ウ | 2 → 2 | 分发 (2) |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52); jp 12-char windows: 0 new real-text windows in any jp patch (u03 p04's 1 masked hit is a mask artefact, obs. 3; u01 p12's 16 unmasked windows are the pre-existing L13 phrase in an unpatched sentence). No answer-choice sentence frame in any `after`. The two long en overlaps (obs. 1, 2) are with **stems** of term-answer questions (D-209 B type) in the project's own en sidecar, not with any choice.

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01–p06 | `terms[3](実用新案法).one_zh` (+ definition), `.detail_zh` (+ explanation), `.points[0].text_zh`, `overview_rows[3].one_line_zh`, `overview_rows[3].extra_zh[1]`, `pairs[1].rows[0].b_zh` | L1 建議修 | **Yes** (§3.2) | No (obs. 4) | OK |
| u01 | p07, p08 | `overview_rows[6].extra_en[0]`, `overview_rows[7].extra_en[0]` | L2 建議修 | Yes: "A kind of trademark" (トレードマーク as a kind of trademark) → "A kind of mark under the Trademark Act" for both トレードマーク / サービスマーク; the en circularity is gone; category column now parallels the other rows ("Industrial property right", "Copyright"); = auditor's text verbatim | No (obs. 1) | OK |
| u01 | p09–p11 | `terms[0](著作権法).analogy_jp / _zh / _en` | L3 建議修 | **Yes** (§3.1) | No | OK |
| u01 | p12–p14 | `terms[0](著作権法).detail_jp / _zh / _en` (+ explanation) | L4 建議修 | **Yes** (§3.3) | No | OK |
| u03 | p01–p03 | `terms[3](アクティベーション).points[0].text_jp / _zh / _en` | L1 建議修 | **Yes** (§3.5) | No (obs. 2) | OK |
| u03 | p04–p09 | `terms[3].detail_jp / _zh / _en` (+ explanation), `terms[3].fig.steps[0].caption_jp / _zh / _en` | L2 建議修 | **Yes** (§3.4) | No (obs. 3, 5) | OK |
| u03 | p10–p12 | `terms[3].fig.steps[3].caption_jp / _zh / _en` | L3 建議修 | Yes: 「機能の制限が解けて」/ 功能限制解除 / "the feature limits are lifted" removed in all three; the caption no longer presupposes a pre-activation feature limit, so it agrees with detail 2nd sentence (製品によっては…制限されたり起動できなかったり); still 1 sentence each; = auditor's text verbatim | No (obs. 6, pre-existing hook) | OK |
| u03 | p13, p14 | `terms[2](PDS).fig.data.cols[2].zh`, `pairs[1].rows[1].label_zh` | L8 建議修 | Yes: Japanese 中黒 gone (修改・再分发 → 修改与再分发; 0 中黒 remnants in the unit's zh); = auditor's text verbatim | No (obs. 7) | OK |

## 3. Focused checks

### 3.1 u01 p09–p11 — copyright analogy: rights at creation, no registration, no fixation / publication implied

- Before: rights start the moment one *records* a hummed tune on a smartphone — Rule A L3: recording is a form of 複製 (2 条 1 項 13 号), and Japanese law has no fixation requirement, so the analogy tied the starting point to a different act. After: 「ノートに詩を書いたその瞬間から、役所の受付を待たずに「自分の作品」として扱われるようなもの。」 / 「就像在笔记本上写下一首诗的那一刻起，不必等政府窗口受理，它就已经算作“自己的作品”。」 / "It is like writing a poem in your notebook: from that moment it counts as your own work, with no need to wait for a government office to process anything." — = auditor's text verbatim, three languages equal in content.
- Rights at creation: writing the poem *is* the act of creating (composing and expressing) the work, not a second act performed on an existing work — it now coincides with `one_*` (作品を作った時点 / 在作品完成时 / "the moment a work is created"), `points[0]` (著作物を創作した時点), `key_points_jp[0]` and the hook (作品を表したその瞬間に権利が付く). No registration: 「役所の受付を待たずに」 kept in all three (= detail 無方式主義).
- Fixation / publication: the analogy names no recording, copying, showing, posting or publishing step; the notebook is private (no publication implied — the a1 #1 HIGH type, "publication = start", is not reintroduced). It does not say the rights arise *because* the poem was written down; the sentence form is "from the moment of creating, without waiting for an office", whose contrast is the office, not oral vs written. A reader could at most infer "writing down suffices", which is true; nothing implies "writing down is required". Not a D-204 range conflict.
- Questions: 2009h21h-q015 / 2015h27a-q001 / 2019r01a-q024 (copyright arises at creation): the new image supports the correct answers; q001's wrong choices (譲渡・複製・登録 as the starting point) — the old 録音 was the only element near 複製, and it is gone. No overlap with any choice (jp LCS 5 = ようなもの; windows 0 / 0).
- zh / en natural: 写下一首诗 / "writing a poem in your notebook"; "自己的作品" / "your own work" matches the generalised 自分の作品 (the old 曲 / song was tied to the music image).

### 3.2 u01 p01–p06 — zh 考案 → 实用新型构思

- All 6 occurrences replaced (the unit's zh now has 0 × 设计构思; 实用新型构思 × 8 incl. derived copies). Remaining 构思 in the unit = 技术构思 for 発明 (特許法 one / goals / overview / pairs) and 构思 for 思いつき (key_points[1]) — distinct, as intended. 外观设计 / 设计巧思 (意匠) now no longer share 设计 with 実用新案's object; the a2 loc-review / Rule A L1 confusion is gone.
- Natural zh? 实用新型 is the standard mainland term for utility model (专利法 第 2 条); its object is formally 新的技术方案, and the auditor rejected 技术方案 because it collides with 発明 = 技术构思 in this unit (L1 修正案). 实用新型构思 is a coined but transparent rendering ("the idea / device protected as a utility model"), reads naturally in each context (巧思（**实用新型构思**，[[jp:考案]]）; 实用新型构思不必像专利的发明那样高度先进; 也可能构成实用新型构思（[[jp:考案]]）; table cell 实用新型构思), and keeps `[[jp:考案]]` where it was (one_zh, points[0]), so the jp term is visible.
- zh_terms consistency: `zh_terms.unit.json` maps 実用新案法 → 实用新型法 (matched by the unit) and has no entry for 考案; validate B6 / jp-origin warnings 0 before and after. 实用新型构思 is built on the table's own 实用新型, so it is consistent with the term table.
- b18 u05 M1 type: no zh choice of the cited / quiz / challenge questions uses 实用新型构思 or 设计构思; the after-span's longest overlap is the term 实用新型 (2009h21h-q015 イ, a wrong choice that *names* the utility model law as the copyright-free alternative — a term-name overlap, not a reading drift).
- Minor: one_zh now reads 巧思（**实用新型构思**…）, i.e. "巧思" glossed by a longer noun phrase; overview_rows[3].one_line_zh likewise — slightly heavy, not wrong (obs. 4).

### 3.3 u01 p12–p14 — 「原則として」 on private copying / quotation

- After: 「私的に使うための複製や、出所を示した正当な引用は**原則として**認められるが、他人の作品を無断で公開したり配布したりすると侵害になりうる。」 / 为私人使用而复制、注明出处的正当引用原则上是允许的，… / "Copying for private use and proper quotation with the source cited are allowed in principle, …". The qualifier sits on the shared predicate, so it scopes over both private copying and quotation in all three languages (= auditor's L4 text; the patch registered only the changed clause, the replay reproduces the full prescribed sentence).
- Correct vs current law: 30 条 1 項 2〜4 号 exceptions (circumvention, knowingly downloaded infringing uploads incl. 令和 2 年改正) and the requirements of 32 条 (正当な範囲・主従・明瞭区別) are now not closed off; "in principle" makes no new claim about them (D-205: no version-bound count / structure).
- Questions: 2010h22h-q025 (quiz; correct = copying a purchased CD to one's own PC to listen privately) is still answered by the sentence (原則として認められる covers the ordinary case; the wrong choices — distribution / upload / copies for customers — remain the 無断で公開・配布 = 侵害 side). 2018h30h-q010 correct イ unaffected (en LCS 20 in the unchanged second clause, "…ting someone else's ").
- Notation: detail_jp bold 2 → 2, zh / en `[[jp:無方式主義]]` 1 → 1; still 3 sentences (D-195).

### 3.4 u03 p04–p09 — プロダクトキー 「製品ごと」 → 「(購入した)ライセンスごと」

- After: detail 「**プロダクトキー** (購入したライセンスごとの識別番号)」 / 每份所购许可证各自的识别号码 / "an identification number unique to each purchased license"; caption step 0 「ライセンスを購入し、ライセンスごとの識別番号であるプロダクトキーを受け取る。」 / 购买许可证，取得每份许可证各自的识别号码，即产品密钥。 / "Buy a license and receive a product key, the identification number unique to that license." — = auditor's L2 text verbatim (6/6).
- Correctness: a product key identifies the purchased licence, not the product type (one product sold to many buyers has many keys). The new wording now meshes with detail 3rd sentence (1 つのライセンスを決められた台数より多くの機器で使うといった不正を防ぐ) and with `points[0]` / step 2 (正規のライセンスかが確かめられる): the key → licence → device-count check chain is coherent. Volume licences (one key for an agreement covering many seats) are still "one key per licence", so the wording is not falsified by them.
- Cited questions: 2017h29a-q089 (only question in the topic mentioning a product ID; correct ア アクティベーション, a term-answer type) says licence authentication uses the product ID + hardware info — consistent; it states nothing about "per product". 2024r06-q021 (quiz; wrong エ = ボリュームライセンス): "per purchased licence" does not describe or lean toward volume licensing (which is about one licence covering multiple machines, not about key granularity); wrong ア アクティベーション there is the term itself. No zh / en choice uses 每份许可证 / "each purchased license" (after-span overlaps ≤5 / 11 chars: 许可证 / " purchased ").
- jp caption repeats ライセンス twice (購入し / ごと) — the auditor dropped 購入した here because the clause already says ライセンスを購入し; en "unique to that license" = the bought one. Equivalent across languages; slightly repetitive in jp (obs. 5).

### 3.5 u03 p01–p03 — 「など」 restored (q089)

- After: 「…ライセンスが正規かを確かめる手続きで、不正な利用を防ぐことなどを目的に行う。」 / 目的是防止非法使用等。 / ", done for purposes such as preventing unauthorized use." — the non-exhaustive purpose of q089's stem (不正利用防止など) is restored in all three (D-208 (2) resolved); consistent with detail 「…を防ぐのが主な目的である」. = auditor's L1 text verbatim; point still 1 sentence, 74 jp chars (≤100, D-200 via validate 0).
- D-209 B (term-answer classification question): the point states the stem's content as the term's definition; the jp after-span shares only などを目的 (5) with the stem, element order still 情報 → 確認 → 目的 (stem: 目的 → 情報 → 認証), no wrong choice (クラウドコンピューティング / ストリーミング / フラグメンテーション) named. The en after-span equals 49 chars of q089's en sidecar stem (obs. 2) — it is the natural English for the same qualifier.

### 3.6 Other requested checks

- Dropped qualifiers / new restrictions: none. p12–p14 and p01–p03 *add* the qualifiers the auditors asked for; p10–p12 remove an over-narrow presupposition; p09–p11 replace an image without narrowing the rule.
- D-204: the copyright analogy now agrees with one / points / hook (§3.1). u03 hook 「認証が済んで初めてソフトウェアが動き出す」 still carries the strong reading that p10–p12 removed from the caption — outside every patched field, not flagged by Rule A (obs. 6).
- D-205: no patch adds a version-bound count / structure claim.
- D-200 / D-195: validate 0 issues in both units; sentence counts unchanged.
- b18 u05 M1 type: 0 — u01 p01–p06 remove the only zh-side 意匠 / 実用新案 blur; no zh / en after-span reproduces a wrong choice's wording (longest choice overlaps: 实用新型 [term], 的作品 / " writing" [generic]).

## 4. Observations

No F-fix (no 建議修) from this re-review.

Records only, no fix:

1. LOW, u01 p07 / p08: "A kind of mark under the Trademark Act" shares 29 chars (" mark under the trademark act") with the en sidecar *stem* of 2025r07-q012 (quiz for トレードマーク / サービスマーク; a classification question — which statement describes a service mark). It is the plain English for 商標法上の商標 (law name + "mark"), in a category cell, with no choice wording; jp unchanged; the choices (all "A trademark displayed to distinguish …") are not echoed.
2. LOW, u03 p03: the en after-span " for purposes such as preventing unauthorized use" (49 chars) equals the q089 en sidecar stem's rendering of 不正利用防止など — the qualifier the patch exists to restore, in the natural English form. q089 is a term-answer question (D-209 B), the stem is the project's own translation (not IPA text), the jp after-span overlap is 5 chars (などを目的), and no choice is echoed (b17 obs. 7 precedent: a standard phrase coinciding with a sidecar). An alternative such as "mainly to prevent unauthorized use, among other purposes" would be less faithful; not changed.
3. LOW, u03 p04: one masked 12-char window (0 → 1) against 2018h30a-q032 stem item b — a mask artefact: the katakana runs after 購入した (unit ライセンス vs q032 ソフトウェアパッケージ, and before it プロダクトキー vs ライセンス) collapse to □, and the real shared text is only 購入した (4); word order differs (購入したライセンス vs ライセンス購入した). Unmasked windows 0, wDice 0.14 → 0.13. q032 is a 不正競争防止法 item-list question whose correct ア = a only, i.e. item b is not the act regulated by that law; the unit sentence does not address it.
4. LOW, u01 p01 / p04: 巧思（实用新型构思）— a short noun glossed by a longer coined noun phrase; transparent and consistent with zh_terms 实用新型法, chosen by the auditor over 技术方案 to avoid the 発明 = 技术构思 clash.
5. LOW, u03 p07: caption_jp 「ライセンスを購入し、ライセンスごとの識別番号…」 repeats ライセンス; zh / en equivalent; auditor's prescribed text.
6. LOW, pre-existing: u03 `terms[3].hook_jp / _zh / _en` (認証が済んで初めてソフトウェアが動き出す / "comes to life only after authentication") presupposes the software does not run before activation, the same scope as the caption reading removed by p10–p12 (detail: 製品によっては). Mnemonic, not cited to a question, outside every patched field and not raised by Rule A; candidate for a later wording pass only.
7. LOW, u03 p13 / p14: the two label cells use 修改与再分发 while the 10 other zh occurrences use 修改和再分发 (sentences / cells). Both natural; 与 in a column label is idiomatic; auditor's prescribed text.

## 5. Overall verdict (part 1)

- HIGH introduced: **0**
- MEDIUM introduced: **0** (none in scope: both units PASS at Rule A with MEDIUM 0)
- LOW introduced: 建議修 0; 記録のみ 7 (obs. 1–7, of which obs. 6 pre-existing)
- D-198: no copying in patched texts (jp windows: 0 new real-text windows; zh after-spans ≤5 chars, term or generic; en after-spans ≤12 chars except obs. 1 / 2 = stem-sidecar overlaps of a law name and of the restored qualifier, no choice frame)
- validate 2/2 = 0 issues, 0 warnings (base parts 0 / 0), parity 2/2 = 0 diff (30 / 25 locations), vitest textbook 162/162

**PASS (part 1)** — all 28 active patches of u01 and u03 are applied exactly (replay reproduces every patched field, derived fields follow, no other base-present path changed), the 8 Rule A 建議修 findings (u01 L1–L4, u03 L1–L3, L8) are resolved with the auditors' wording, the copyright analogy now places the start of the right at the act of creation with no registration and implies neither fixation nor publication, the zh 考案 rendering no longer overlaps 意匠's 设计 and is consistent with zh_terms, 「原則として」 scopes over both private copying and quotation, the product key is correctly tied to the purchased licence (consistent with q089 and the unit's device-count purpose), q089's 「など」 is restored in all three languages, and no new HIGH / MEDIUM is introduced. u02 (p01–…) is outside this part and will be reviewed in part 2.

---

# Part 2 — u02 (strategy-02-04-u02, p01–p05)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the u02 Rule A auditor; Rule D)
- Date: 2026-11-06 (Session 146)
- Scope: 5 `active`, 0 retired (`patches/strategy-02-04-u02.json`), checked against `strategy-02-04-u02.ruleA.md` (PASS, HIGH 0 / MEDIUM 0, 建議修 = L1, L2 only; L3–L10 記録のみ) and the merged unit `data/ip/textbook/units/strategy-02-04-u02.json` (sha256 `7ff757675a26ae1a…`).
- Base: `.planning/v2/strategy-02-04-u02/parts/b20-u02-a4/strategy-02-04-u02.loc.r0.json`, sha256 `dbf71c63…` = `base_sha256` of all 5 patches (match).
- No past-question text quoted (qid + paraphrase; matched fragments ≤ 12 chars except en term-name overlaps listed below). Statute text quoted from e-Gov (public law text).

## 2.0 Method

Same as part 1 §0 steps 1–6 (same scripts, re-pointed at u02). Additionally, the legal fact added by p01–p03 was checked against the primary source: e-Gov 法令 API `https://laws.e-gov.go.jp/api/1/lawdata/405AC0000000047` (fetched 2026-11-06, 250 KB XML).

## 2.1 Script results (fresh, 2026-11-06)

```
✓ strategy-02-04-u02 unit: 0 issues, 1 warning   validate exit 0 | parity: 24 locations, 0 diff  exit 0
validate --part b20-u02-a4/…loc.r0.json: 0 issues (sha256 dbf71c63… printed by validate)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

The 1 warning is `choice-echo` on `terms[0].points[2].text_jp` (2024r06-q010) — an unpatched field, = Rule A L3 / §4 (judged non-(iii); the 除外条件 that D-210 requires to be kept). Not introduced by p01–p05.

Application: 5/5 `before` occur exactly once in the base field; 5/5 `after` present; replay in file order on the base reproduces all 5 patched fields exactly. Unexplained base → unit diffs in base-present paths: 0 (5 changed paths = the patched fields; only the `stage` meta key removed, as in part 1; 107 unit-only derived / meta paths). `before` "remnants" found only in `terms[0].explanation_*` — expected, since p01–p03 append (the `before` is a prefix of the `after`).

Derived fields: `terms[0].explanation_jp / _zh / _en` = notation-stripped new `detail_*` (the new sentence is present; `[[jp:限定提供データ]]` → 限定提供データ). Full walk: 51 definition / explanation / memory_hook pairs + key_points, 0 mismatches (term 0 has no `hook_*`, so its memory_hook is not derived — pre-existing, unchanged).

Notation: p02 / p03 add one `[[jp:限定提供データ]]` each; the origin 限定提供データ occurs in `detail_jp` (the new jp sentence) and `points[2].text_jp` → jp-origin check ok (validate 0). Bold unchanged (1 → 1 per field). Parity 0 diff.

D-198 (one script, 69 topic questions, 345 strings per language):

| Patch | Lang | Field LCS before → after (nearest) | Longest overlap of the `after` span | jp windows unmasked / masked; wDice |
|---|---|---|---|---|
| p01 | **jp** | 6 (q010 ア 営業上の情報) → 8 (q010 stem) | る限定提供データ (8 = term + 1 kana) | 0 / 0 → 0 / 0; 0.17 → 0.21 |
| p02 | zh | 5 → 7 (q010 stem) | 的限定提供数据 (7 = term + 的) | — |
| p03 | en | 34 → 34 (q010 ア "technical or business information ", unchanged sentence 2) | " trade secrets" (14, 2012h24a-q001 stem; term) | — |
| p04 / p05 | en | 19 → 19 (2022r04-q014 stem "e license agreement") | "e license agreement" (19 = term 使用許諾契約) | — |

No new real-text jp window; all after-span overlaps are term names. No choice frame reproduced.

## 2.2 Primary-source check (p01–p03)

- 現行 不正競争防止法 2 条 7 項 (e-Gov, current text): 「この法律において「限定提供データ」とは、業として特定の者に提供する情報として電磁的方法…により相当量蓄積され、及び管理されている技術上又は営業上の情報（**営業秘密を除く。**）をいう。」 — confirmed.
- The same XML carries the 附則 of **令和五年六月一四日法律第五一号** (施行期日 = 公布の日から 1 年以内の政令で定める日). The amendment was enacted / promulgated in **2023** (令和 5 年 = 2023), so "令和 5 年（2023 年）修订" / "Reiwa 5 (2023) amendment" correctly names the amending act's year; it is the same convention already used in `points[2]` zh / en ("令和 5 年（2023 年）修订前" / "before the Reiwa 5 (2023) amendment"). The 2024-04-01 effective date is (correctly) not stated, so no unverified claim is added.
- Pre-amendment exclusion (平成 30 年改正で新設) = 「秘密として管理されているものを除く」 (Rule A §5, secondary). "対象から除く範囲が営業秘密に改められた" = the exclusion changed from "secret-managed information" to "trade secrets" — correct, and it makes no claim beyond the primary text.

## 2.3 Manual reading

### p01–p03 — current-law sentence in `terms[0].detail_*`

- jp: 「なお、特定の相手に提供するデータを保護する限定提供データの規定は、令和 5 年改正で、対象から除く範囲が営業秘密に改められた。」 / zh: 「此外，保护向特定对象提供的数据的限定提供数据（[[jp:限定提供データ]]）规定，在令和 5 年（2023 年）修订中，将排除在对象之外的范围改为了商业秘密。」 / en: "The rules on shared data with limited access ([[jp:限定提供データ]]), which protect data provided to specific parties, were revised by the Reiwa 5 (2023) amendment so that what is excluded from their scope is now trade secrets." = the auditor's L1 text verbatim (3/3). Same fact in all three (subject = the 限定提供データ provisions, change = the excluded range is now 営業秘密 / 商业秘密 / trade secrets; zh_terms 限定提供数据 / 商业秘密 match the unit). en "shared data with limited access" = METI's English name and = `points[2]` en.
- vs `points[2]` (「令和 5 年改正前の規定では … 秘密管理されていないものを**限定提供データ**という」): no contradiction — points[2] is explicitly version-bound to the old text, the detail sentence gives the current text; read together they say the exclusion moved from 秘密管理されているもの to 営業秘密 (D-210 satisfied: the quoted question's condition is kept, the current rule is added outside the 考点).
- vs 2024r06-q010 (correct イ = the pre-amendment wording incl. the exclusion; wrong エ equates trade secrets with 限定提供データ): the new sentence says trade secrets are *excluded* from 限定提供データ, so it does not lean toward エ; イ remains supported by points[2]. zh / en likewise ("排除在对象之外" / "excluded from their scope") — no b18 u05 M1-type drift.
- The sentence glosses the term in place (特定の相手に提供するデータを保護する), so a1 r1 M (use before definition) does not recur.
- D-195: detail 2 → 3 sentences in each language (jp 45 / 65 / 63 chars; within 2〜3); 考点 untouched (D-200 n/a). validate 0 issues.
- D-205: no version-bound count / structure claim beyond the cited act; the amendment is named.

### p04–p05 — en `pairs[0].rows[2]` (共通点)

- "A Use License Agreement bundled for use on many machines" → "…bundled for large-scale use" in both cells = auditor's L2 text. Now matches jp 多数の利用向け / zh 面向大量使用 and no longer frames the site licence by machine count (contrary to its one / rows[0] "Scope of the organization or facility" / rows[1] "No extra contract needed within the scope"). The two remaining "how many machines" in the unit (`terms[1]` fig caption / explanation) concern the 使用許諾契約's install-count terms, correct and out of scope.

## 2.4 Observations (part 2)

No F-fix (no 建議修) from this re-review.

Records only, no fix:

8. LOW, p03: jp / zh open the added sentence with なお / 此外, en has no connector ("The rules on …"). Reads acceptably as a new sentence; an "In addition," would mirror jp more closely. Auditor's prescribed text; not changed.
9. LOW, p03: en sentence 3 is 220 chars (one relative clause + one result clause). Clear, but the longest sentence in the detail; validate imposes no en length issue.
10. LOW, pre-existing: `choice-echo` warning on `terms[0].points[2].text_jp` (= Rule A L3, unpatched).

## 2.5 Overall verdict (part 2)

- HIGH introduced: **0**; MEDIUM introduced: **0**; LOW: 建議修 0, 記録のみ 3 (obs. 8–10, of which obs. 10 pre-existing)
- Application 5/5 exact (replay), derived fields follow, 0 unexplained diffs
- D-198: 0 new jp windows; all after-span overlaps = term names
- validate 0 issues (1 pre-existing warning), parity 0 diff (24 locations), vitest textbook 162/162
- Primary source: current 2 条 7 項「営業秘密を除く」 and 令和 5 年法律第 51 号 confirmed on e-Gov; "(2023)" correct

**PASS (part 2)** — p01–p05 are applied exactly; the current-law sentence is correct against e-Gov, consistent with `points[2]` (改正前) and with q010's correct answer, equivalent in jp / zh / en with a valid `[[jp:限定提供データ]]` origin, within D-195; the en サイトライセンス wording now follows jp 多数の利用向け. With part 1, all 33 b20 patches (u01 14, u02 5, u03 14) are PASS.
