# b21 B3 patch re-review — strategy-01-01 u01–u05 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditors' context; Rule D)
- Date: 2026-11-06 (Session 147)
- Scope: B3 wording patches for strategy-01-01-u01 (p01–p12), u02 (p01–p04), u03 (p01–p07), u04 (p01–p12), u05 (p01–p05)
  — **40 `active`, 0 retired** (`patches/strategy-01-01-u0{1..5}.json`), checked against the Rule A prescriptions
  (`strategy-01-01-u01.ruleA.md` L1・L2・L3・L11・L12 建議修; `-u02` L1・L2; `-u03` L1・L2; `-u04` **M1** + L1・L2・L7・L8; `-u05` **M1** + L1・L2)
  and the merged units `data/ip/textbook/units/strategy-01-01-u0{1..5}.json` (sha256 u01 `cb8dd2421949441d…`, u02 `50fa4d91bcb9096d…`, u03 `f03eb812b640f129…`, u04 `c1b1cb24715b3cb5…`, u05 `8f2604cac5168538…`).
- Pre-patch bases located by sha256 = `base_sha256` (all patches of a unit share one base; all match):
  u01 `b21-u01-a1/…loc.r0.json` (`fd437dbd…`), u02 `b21-u02-a1/…loc.r1.json` (`9e5a3743…`), u03 `b21-u03-a1/…loc.r0.json` (`f428aa94…`), u04 `b21-u04-a4/…loc.r0.json` (`89f8702b…`), u05 `b21-u05-a1/…loc.r0.json` (`adbcb798…`).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210 and the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names; matched fragments ≤12 chars except en sidecar overlaps, which are project translations and are quoted as the unit's own after-span).

## 0. Method

Same as `b20_patch_rereview.md` §0 (= `b19` / `b18` §0), topic strategy-01-01 (62 questions; 310 source strings per language):

1. Application check (script): every string field of base and merged unit is walked. Each `after` must appear in its field; `before` (raw and notation-stripped) must not survive anywhere; every string that differs between base and unit (for paths present in the base) must be explained by a patch; the patches replayed in file order on the base must reproduce the unit's field exactly. Additionally: each patch's `before` / `after` (bold stripped) was found verbatim in its unit's Rule A file (40/40), i.e. every patch is the auditor's prescribed text.
2. Derived-field check from the same walk (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`) — every term and key point of the 5 units, not only the patched ones; `summary.memory_hooks_*` for the 2 patched hooks by reading.
3. D-198 (jp patches: u01 p01, p04, p07; u02 p01; u03 p01, p04; u04 p02, p05, p08; u05 p01): LCS, 12-char window with ≤2 substitutions with and without masking (katakana runs ≥4 and alnum masked; masked windows with <6 real chars excluded), best same-length-window bigram Dice (wDice). Sources: stem (`stem_jp_clean`, fallback `stem_jp`) + all choices of every strategy-01-01 question. zh / en patches: LCS against the zh / en translation sidecars of all 62 topic questions, for the whole patched field before → after and for the `after` span alone. Plus a per-choice LCS of the focus patches against the focus questions (2025r07-q029, 2013h25a-q007, 2015h27a-q007, 2020r02o-q026, 2012h24a-q006).
4. D-195 / D-200 via validate; zh-term warnings compared with `validate --part <base>`.
5. Manual reading of each patched field in context (whole term + overview row + pairs + key_points + fig); meaning judged against the cited / quiz questions' `correct_answer` and their zh / en sidecars (b18 u05 M1 type: does a zh / en rewrite move toward a wrong choice's reading?). Focus points: u04 p01 (en priorities), p02–p04 (risk-assessment analogy), p05–p07 (BCP "drawn up in normal times" vs BCP / BCM boundary and 2015h27a-q007 a→b); u05 p01–p03 (Off-JT analogy coach → instructor vs コーチング / 2012h24a-q006); u01 p01–p03 (ミッション point vs 2025r07-q029 wrong ア); u02 p01–p03 (会計監査人 vs 監査役 on 計算書類).
6. `scripts/textbook-v2-validate.mjs --unit` / `scripts/textbook-v2-parity.mjs --unit` per unit; `npx vitest run src/lib/textbook`.

Scripts: scratchpad `b21rr/check.mjs`, `b21rr/d198.mjs`, `b21rr/q029.mjs` (adapted from the b20 re-review scripts; only unit IDs / part paths / topic changed).

Not established: as in b14–b20, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: u01 148, u02 106, u03 133, u04 132, u05 120) were checked for the derived copies (step 2) and for the patched texts. 会社法 436 条 (監査役 / 会計監査人 audit of 計算書類) and 337 条 (会計監査人 = 公認会計士 / 監査法人) judged from the u02 Rule A citation and general knowledge; no primary statute text fetched (p01–p03 remove an over-narrow claim rather than add a new one).

## 1. Script results (fresh, 2026-11-06)

```
✓ strategy-01-01-u01 unit: 0 issues                 validate EXIT=0 | parity: 32 locations, 0 diff  EXIT=0
✓ strategy-01-01-u02 unit: 0 issues, 2 warning(s)   validate EXIT=0 | parity: 25 locations, 0 diff  EXIT=0
  warn  zh-term  terms[0](株主総会).fig.data.root.children[1].label.zh  監査 → 审计 not in the zh text
  warn  zh-term  key_points_zh[0]  監査 → 审计 not in the zh text
✓ strategy-01-01-u03 unit: 0 issues                 validate EXIT=0 | parity: 31 locations, 0 diff  EXIT=0
✓ strategy-01-01-u04 unit: 0 issues                 validate EXIT=0 | parity: 37 locations, 0 diff  EXIT=0
✓ strategy-01-01-u05 unit: 0 issues                 validate EXIT=0 | parity: 28 locations, 0 diff  EXIT=0
validate --part (bases): u01 loc#0 0 issues | u02 loc#1 0 issues, 2 warning(s) (the same 2 zh-term warnings) | u03 loc#0 0 | u04 loc#0 0 | u05 loc#0 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

The 2 u02 warnings are present identically in the base part (unpatched fields: 監査役 → 监事 in a label and key_points_zh[0]) — not introduced by p01–p04.

Application: 40/40 `before` occur exactly once in the base field; 40/40 `after` present in their fields; replay of the patches in file order on the base reproduces every patched field exactly (5/5 units). Unexplained base → unit diffs in base-present paths: 0 per unit (changed paths u01 12, u02 4, u03 7, u04 12, u05 5 = exactly the patched fields; only the `stage` meta key removed, as in b19 / b20; `round` / `jp_round` are non-string meta keys of the part). `before` remnants: 0 except u04 p05 / p06, where the `before` (非常時に発動する / 在非常时期启动) is the tail of the `after` (the patch prepends 平常時に定め、/ 平时制定，) — expected, same pattern as b20 part 2 p01–p03.

Derived fields follow: u01 p07 → `terms[4].definition_jp`, p08 / p09 → `summary.key_points_zh[2]` / `[0]`, p12 → `terms[6].memory_hook_en` (+ `summary.memory_hooks_en[6]` with the "Human Capital Management: " prefix); u02 p01–p03 → `summary.key_points_*[2]`, p04 → `terms[0].memory_hook_zh` (+ `summary.memory_hooks_zh[0]`); u03 p01–p03 → `terms[5].definition_*`, p04–p06 → `summary.key_points_*[3]`, p07 → `terms[4].explanation_en`; u04 p08 → `terms[1].explanation_jp`, p09 → `terms[4].definition_zh`; u05 p04 → `terms[5].definition_zh`, p05 → `summary.key_points_en[0]`. Full walk: `definition / explanation / memory_hook` = notation-stripped `one / detail / hook`, and `summary.key_points_*` = stripped `key_points_*` — u01 84, u02 57, u03 75, u04 69, u05 66 checked (351), 0 mismatches.

Notation counts (bold, `[[jp:]]`), before → after, every patched field: unchanged in 40 of 40 (e.g. u01 `terms[1].points[0].text_zh` bold 1 → 1 / `[[jp:]]` 2 → 2; u05 `terms[5].one_zh` bold 3 → 3 / `[[jp:]]` 3 → 3 [`[[jp:メンティ]]` kept]; u04 `terms[4].one_zh` bold 2 → 2 / `[[jp:重要業務]]` kept). Parity 0 diff.

D-198, before → after (one script):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest overlap of the `after` span | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| u01 p01 | **jp** | 2009h21h-q022 ア (correct) → 2010h22a-q005 エ | 7 (企業の存在意義) → 5 (ミッション = term) | を受け (3) | **1 / 1 → 0 / 0**; 0.35 → 0.21 |
| u01 p02 | zh | 2025r07-q029 stem | 9 → 9 (使命Mission = term, unchanged part) | 存在理由 (4; 2019r01a-q012 ウ correct) | — |
| u01 p03 | en | 2009h21h-q022 ア (correct) | 26 → 22 | " the company's reason " (22; obs. 1) | — |
| u01 p04 | **jp** | 2009h21h-q022 stem | 4 → 4 (経営理念 = term) | 経営理念 (4) | 0 / 0 → 0 / 0; 0.14 → 0.14 |
| u01 p05 | zh | 2009h21h-q022 stem | 4 → 4 (term) | 基本 (2) | — |
| u01 p06 | en | 2013h25a-q011 stem | 23 → 23 (" management philosophy ", term) | " the same job " (14, generic) | — |
| u01 p07 | **jp** | 2010h22a-q005 エ | 5 → 5 (term) | ありたい姿 (5, = term's own wording, unchanged) | 0 / 0 → 0 / 0; 0.23 → 0.25 |
| u01 p08 | zh | 2010h22a-q022 イ (correct) | 4 → 4 (企业价值) | 企业价值 (4) | — |
| u01 p09 | zh | 2019r01a-q012 ウ (correct) | 11 → 11 (unchanged sentence 1 of kp[0]) | 理念的 (3) | — |
| u01 p10 | zh | 2009h21h-q029 イ | 2 → 2 | 支撑 (2) | — |
| u01 p11 | en | 2011h23a-q001 エ | 9 → 10 | "s business" (10) | — |
| u01 p12 | en | 2013h25a-q011 ア | 12 → 12 (unchanged part) | " to build " (10) | — |
| u02 p01 | **jp** | 2011h23a-q016 ア | 5 → 5 (会計監査人 = term) | 会計監査人 (5) | 0 / 0 → 0 / 0; 0.17 → 0.16 |
| u02 p02 | zh | 2013h25a-q007 ア (correct) | 5 → 5 (会计审计人) | 会计审计人 (5) | — |
| u02 p03 | en | 2013h25a-q007 stem | 22 → 23 | " financial statements a" (23; term 計算書類) | — |
| u02 p04 | zh | 2011h23tokubetsu-q008 ア | 3 → 3 | 面向全 (3) | — |
| u03 p01 | **jp** | 2010h22a-q005 stem | 8 → 8 (の省エネや資源の, pre-existing in the first half) | の省エネや資源の (8) | 0 / 0 → 0 / 0; 0.26 → 0.24 |
| u03 p02 | zh | 2010h22a-q005 stem | 6 → 6 | 推动整个社会 (6, unchanged part) | — |
| u03 p03 | en | 2010h22a-q005 stem | 17 → 17 | " across society a" (17, unchanged part) | — |
| u03 p04 | **jp** | 2010h22a-q005 stem | 6 → 6 | 社会の省エネ (6) | 0 / 0 → 0 / 0; 0.22 → 0.24 |
| u03 p05 | zh | 2010h22a-q005 stem | 4 → 5 | 身的节能与 (5) | — |
| u03 p06 | en | 2010h22a-q005 stem | 15 → 19 | "saving energy and " (18) | — |
| u03 p07 | en | 2026r08-q014 stem | 22 → 22 (unchanged part) | " 17 goals" (9) | — |
| u04 p01 | en | 2014h26a-q020 ウ | 15 → 15 (" to prepare for", unchanged part) | " to prepare for" (15, generic) | — |
| u04 p02 | **jp** | 2009h21a-q003 stem | 2 → 3 | どれか (3) | 0 / 0 → 0 / 0; 0.07 → 0.08 |
| u04 p03 | zh | 2020r02o-q026 ア / エ | 3 → 3 | 做准备 (3; obs. 2) | — |
| u04 p04 | en | 2020r02o-q026 エ → 2014h26a-q020 ウ | 11 (" insurance ") → 16 | " to prepare for " (16, generic) | — |
| u04 p05 | **jp** | 2009h21h-q022 ア | 3 → 3 | 動する (3) | 0 / 0 → 0 / 0; 0.43 → 0.23 |
| u04 p06 | zh | 2009h21h-q022 ウ | 1 → 2 | 制定 (2) | — |
| u04 p07 | en | 2021r03-q052 stem | 13 → 13 (" an emergency", unchanged part) | " an emergency" (13) | — |
| u04 p08 | **jp** | 2011h23tokubetsu-q008 stem | 4 → 4 | 経営目標 (4, term) | 0 / 0 → 0 / 0; 0.09 → 0.07 |
| u04 p09 | zh | 2021r03-q052 stem | 10 → 10 (BCP业务连续性计划 = term) | 经营资源 (4) | — |
| u04 p10 | zh | 2016h28a-q007 stem | 5 → 5 (制定BCP) | 的管理 (3) | — |
| u04 p11 | en | 2009h21h-q029 エ | 13 → 13 | " maintain" (9) | — |
| u04 p12 | en | 2015h27a-q007 stem → 2012h24a-q006 イ (correct) | 11 → 23 | " education and training" (23; obs. 3) | — |
| u05 p01 | **jp** | 2009h21a-q003 stem | 3 → 3 | から (2) | 0 / 0 → 0 / 0; 0.14 → 0.14 |
| u05 p02 | zh | 2009h21h-q022 ア | 2 → 2 | 学习 (2) | — |
| u05 p03 | en | 2012h24a-q006 イ (correct) | 15 → 15 (" away from the ", unchanged part) | " instruct" (9) | — |
| u05 p04 | zh | 2016h28h-q024 エ | 5 → 5 (unchanged part) | 指导 (2) | — |
| u05 p05 | en | 2015h27h-q003 stem | 17 → 17 (unchanged part) | "d on the " (9) | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52); jp 12-char windows: 0 new windows in any jp patch, and u01 p01 **removes** the only pre-existing window (1 / 1 → 0 / 0, the near-verbatim of 2025r07-q029 wrong ア that Rule A L1 targeted). No answer-choice sentence frame in any `after`. The longer en overlaps (obs. 1, 3) are generic noun phrases shared with **correct** choices.

Per-choice check of the focus patches (LCS before → after vs each choice, `q029.mjs`):
- 2025r07-q029 (ビジョン; wrong ア = mission-type wording): u01 p01 jp vs ア 7 → **2**; p02 zh vs ア 4 → **2**; p03 en vs ア 15 → 15 (" the company's ", unchanged opening). Correct イ: jp 7 → 2, zh 6 → 4, en 26 → 22.
- 2013h25a-q007 (who audits 計算書類; correct ア 会計監査人): u02 p01–p03 overlaps = the term 会計監査人 / 会计审计人 / "accounting auditor" only, unchanged; wrong イ (システム監査人) only 監査人 / auditor (3 / 8).
- 2015h27a-q007 (a:BCP b:BCM): u04 p07 en ≤2 chars with all choices; p05 / p06 (jp / zh): no row with a non-zero before-LCS surfaced (the choices are the code strings a:BCP b:BCM etc.).
- 2020r02o-q026 (BCP for a destroyed head office; correct ウ; wrong エ = insurance premiums + relocation): u04 p02–p04 vs エ: jp 保険 (2) → 備える (3), zh 保险 (2) → 做准备 (3), en " insurance " (11) → " prepare " (9) — the insurance image is gone, only a generic verb remains (obs. 2).
- 2012h24a-q006 (Off-JT; wrong エ = coaching-type description): u05 p01–p03 vs エ: jp 1 → 1, zh 1 → 1, en 3 → 3; vs correct イ zh 1 → 0, en 8 → 8 (" through").

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01–p03 | `terms[3](ミッション).points[0].text_jp / _zh / _en` | L1 建議修 | **Yes** (§3.4) | No (obs. 1) | OK |
| u01 | p04–p06 | `terms[1](企業理念).points[0].text_jp / _zh / _en` | L2 建議修 | Yes: 同じ働き → ほぼ同じ働き / 作用相同 → 作用基本相同 / "the same job" → "much the same job"; now matches one (ほぼ同じ意味 / 基本同义 / "nearly the same sense"), overview_rows[1] and key_points[0]; = auditor's text | No | OK |
| u01 | p07 | `terms[4](ビジョン).one_jp` (+ definition_jp) | L3 建議修 | Yes: 重言 なっていたい + ありたい → 目指す**ありたい姿**; zh / en already without 重言; meaning unchanged (desired state at a set future point) | No (obs. 8) | OK |
| u01 | p08–p10 | `key_points_zh[2]`, `key_points_zh[0]`, `terms[7](パーパス経営).analogy_zh` | L11 建議修 | Yes: 活用 (日式) → 人才培养与运用 (subject 人才 restored, = jp 育成や活用); 也几乎以相同的含义使用 → 的含义也与之基本相同 (natural, keeps ほぼ); 街角 / 这条街 → 镇上 / 这座小镇 (= jp 町 / en town) | No | OK |
| u01 | p11, p12 | `overview_rows[0].extra_en[0]`, `terms[6](人的資本経営).hook_en` | L12 建議修 | Yes: "Why we do business" → "Why it does business" (parallels "Why it exists" / "Why it exists for society" in the same column); "a stake to grow" → "capital to build up" (= jp 元手として増やすもの, zh 本钱; resonates with the term "human capital") | No | OK |
| u02 | p01–p03 | `key_points_jp / _zh / _en[2]` | L1 建議修 | **Yes** (§3.5) | No | OK |
| u02 | p04 | `terms[0](株主総会).hook_zh` | L2 建議修 | Yes: 全体成员到场 (all attend — factually wrong) → 面向全体成员召开 (held for all members) = jp すべてに開かれた; the next sentence 向公司所有股东开放 still follows, slightly repetitive but consistent | No (obs. 6) | OK |
| u03 | p01–p06 | `terms[5](グリーンIT).one_jp / _zh / _en` (+ definition), `key_points_*[3]` | L1 建議修 | Yes: second side now includes 資源の節約 / 节约资源 / "resources" in one and both sides in key_points[3]; agrees with detail (人や物の移動、紙などの消費), points[1] (2014h26a-q020 paperless = resource saving) and the fig table; no restriction removed; jp windows 0 / 0 | No | OK |
| u03 | p07 | `terms[4](SDGs).detail_en` (+ explanation_en) | L2 建議修 | Yes: the undefined "agenda" (would equate the 2030 Agenda with the SDGs) → "The SDGs"; jp 目標は 17 のゴールに分かれ / zh 整体目标分为 17 项 unchanged | No (obs. 7) | OK |
| u04 | p01 | `overview_rows[6].extra_en[1]` | **M1 (MEDIUM)** | **Yes** (§3.1) | No | OK |
| u04 | p02–p04 | `terms[6](リスクアセスメント).analogy_jp / _zh / _en` | L1 建議修 | **Yes** (§3.1) | No (obs. 2) | OK |
| u04 | p05–p07 | `pairs[1].rows[2].a_jp / _zh / _en` | L2 建議修 | **Yes** (§3.2) | No | OK |
| u04 | p08 | `terms[1](財務・資産・人事・情報管理).detail_jp` (+ explanation_jp) | L7 建議修 | Yes: どれも → どの領域でも; 「4 つの領域は」 is now a topic (主題) frame for 「どの領域でも…管理が行われる」, the subject–predicate ねじれ is gone; zh / en unchanged (already natural) | No (obs. 5) | OK |
| u04 | p09–p12 | `terms[4](BCP).one_zh`, `overview_rows[5].one_line_zh`, `terms[5](BCM).fig.steps[1].caption_en`, `pairs[1].rows[1].b_en` | L8 建議修 (i)–(iv) | Yes: (i) 失去部分经营资源 → 导致经营资源受损 (= jp 損なわれても, no added "partial"; still compatible with 2016h28a-q007 correct ア 縮減); (ii) 培训 → 演练 (now uniform with detail / key_points / extra); (iii) "from normal times on" added (= jp 平常時から / zh 从平时起); (iv) "education and training, and inspection and review" (= one_en wording exactly) | No (obs. 3) | OK |
| u05 | p01–p03 | `terms[1](Off-JT).analogy_jp / _zh / _en` | **M1 (MEDIUM)** | **Yes** (§3.3) | No (obs. 4) | OK |
| u05 | p04 | `terms[5](メンタリング).one_zh` (+ definition_zh) | L1 建議修 | Yes: メンティ 学员 → 被指导者 (= v1; no longer collides with 学员 = 受講者 in terms[1] / terms[2]; 学员 now 7 occurrences, all learner / participant senses; 被指导者 2 = one_zh + definition_zh); `[[jp:メンティ]]` kept | No | OK |
| u05 | p05 | `key_points_en[0]` (+ summary) | L2 建議修 | Yes: "depends heavily on" → "tends to depend on" (= jp 左右されやすい, zh 容易受…影响) | No | OK |

## 3. Focused checks

### 3.1 u04 p01 (M1) and p02–p04 (L1) — risk assessment = judging priorities, not deciding the preparations

- p01 after: "Judging priorities: what to prepare for, and how much" (= auditor's M1 text verbatim). "Priorities" is restored and is now the head of the cell; the colon makes "what to prepare for, and how much" the object of the priority judgement, matching jp 「何にどれだけ備えるかの**優先度の判断**」 and zh 「判断针对什么、准备到什么程度的**优先顺序**」. The en reader now sees one role in all en fields: one_en "decides the priority of responses", fig step 2 "decide which to address first", one_line_en "decides the priority of responses", points[1] "Its results are one input to decisions when drawing up a BCP", detail_en "results lead to choosing a response". The a1–a3 axis (assessment ≠ the response / BCP decision) is closed in en too. **M1 resolved.**
- p02–p04 after: 「どれから備えるかを決める」 / 「再决定先为哪些做准备」 / "deciding which to prepare for first" (= auditor's L1 text verbatim, 3/3). The analogy's conclusion is now an ordering (which first = priority), which is exactly one's 対応の優先度を判断する and fig step 2; the choice of a response means (保険 = 移転), which detail places *after* evaluation, is gone. 「決める」 remains, but its object is the order, i.e. the priority judgement itself — within one's scope (D-204 consistent).
- vs 2018h30a-q021 (correct エ リスクアセスメント; wrong ABC 分析 / SWOT / 環境アセスメント): unaffected; the analogy still shows identify (書き出し) → analyse (起きやすさと困る度合い) → evaluate (並べて、どれから), the three stages of detail.
- vs 2020r02o-q026 (BCP choice; wrong エ = insurance premiums for relocation): the old 保険 image (the only analogy element close to エ's substance) is removed; the remaining overlap is the generic verb 備える / 做准备 / prepare (obs. 2). The analogy belongs to リスクアセスメント, not BCP, and points[1] separates the two — no lean toward エ.
- zh / en: 先为哪些做准备 / "which to prepare for first" carry the "first" (= から) in all three; no drift toward a wrong choice.

### 3.2 u04 p05–p07 (L2) — BCP "drawn up in normal times", BCP / BCM boundary, 2015h27a-q007

- After: 「平常時に定め、非常時に発動する」 / 「平时制定，在非常时期启动」 / "Drawn up in normal times, activated in an emergency" (= auditor's L2 text verbatim). The 時間の軸 row no longer reads as an exclusive split (BCP = emergency only / BCM = normal times); it now agrees with BCP one 「前もって定めておく」 / fig step 0 「平常時: …決めておく」 and with BCM's 「平常時**から**続ける」.
- Boundary not re-opened: the row says *when* the BCP is set, not *who / which activity* sets it. BCM's inclusion of 策定 is unchanged in 6 fields (BCM one 「BCP の策定から…」, fig step 0 「分析・策定」, `pairs[1].rows[0].b_jp` 「BCP を作り、使える状態に保ち、改め続ける管理の活動全体」, `rows[1].b_jp` 「策定、…」, `overview_rows[5].one_line_jp` 「BCP を策定し…」, `terms[5].points[0]` 「BCP を作る段階だけでなく…」). Nothing says 策定 is outside BCM; the a3 #2 MEDIUM type (BCM scope excluding drafting) does not recur. zh 制定 / en "Drawn up" use the same verbs as BCM's 制定 BCP / "drawing up the BCP", so the reader sees the BCP as the object BCM draws up.
- 2015h27a-q007 (a = prepare a mutual-backup process → BCP; b = periodic trial operation and review → BCM; correct ア): the patched row is a pairs row, not a 考点, carries no qid, and names none of q007's items (backup process, switching, trial operation); per-choice LCS ≤2 in en (jp / zh: choices are code strings only). A reader who maps "content set in normal times = BCP, ongoing testing / review = BCM" reaches the correct ア; the BCM 考点 `terms[5].points[0]` (the a3 a→b tracing site) is untouched. No D-198 (iii) tracing, no a→b reordering added.
- 2021r03-q052 (BCP-based management activities a–d, correct all): unaffected (BCM side of the row and the BCM 考点 unchanged).
- jp wDice vs the nearest stem window dropped 0.43 → 0.23 (the short old cell vs a short choice; no window hit before or after).

### 3.3 u05 p01–p03 (M1) — Off-JT analogy coach → instructor, vs コーチング and 2012h24a-q006

- After: 「試合から離れた練習場で、**指導役から**基本の型を順に習うようなもの。」 / 「…在训练场上**跟着指导老师**一步步学习基本动作。」 / "…where **an instructor** walks you through the basic moves one at a time." (= auditor's M1 text verbatim, 3/3).
- The Off-JT analogy no longer contains コーチ / 教练 / coach (unit-wide: these now occur only in the コーチング term, its pair / overview / goals rows, the mentoring 考点's コーチング half, and unit_summary). The image "a teacher shows the forms in order" is now carried by a generic teaching role, which is what コーチング's one 「答えを教えるのではなく」 and points[0] 「知識ややり方をそのまま教える指導 (ティーチング) とは…逆」 contrast against — the analogy now sits on the ティーチング side, consistent with the 考点 instead of contradicting it. zh 指导老师 no longer shares the stem 教练 of the term name 教练辅导. **M1 resolved** (both the 観点 7 conflict and the zh (6) b18 u05 type).
- 2012h24a-q006 (Off-JT; correct イ = education and training away from work; wrong エ = questions and simple advice to prompt self-driven action = coaching): the analogy (away from the game, basic forms taught in order) supports イ and no longer evokes エ's coaching; per-choice LCS vs エ 1 / 1 / 3 (jp / zh / en), unchanged and trivial.
- Clash checks: 指導役 vs コーチング one 「指導する側」 — a generic role noun; the coaching definition's contrast is the *method* (questions vs teaching answers), and the Off-JT 指導役 teaches forms, i.e. the opposite method, so no confusion. zh 指导老师 vs メンタリング 导师: different word (指导老师 = teacher / supervisor in a training setting; the context 训练场 fixes the reading); vs Off-JT pairs `rows[1].b_zh` 讲师 — 指导老师 is the natural term for a sports-practice instructor, consistent in role (obs. 4). en "instructor" = `pairs[0].rows[1].b_en` "An instructor teaches in group training…" — now the Off-JT analogy and pair use the same role word.

### 3.4 u01 p01–p03 (L1) — ミッション point vs 2025r07-q029 wrong ア

- After: 「**ミッション**はMVVのうち、その企業が存在する理由を受け持つ要素である。」 / 「…是 MVV 中承担企业存在理由的要素。」 / "…the part of MVV that carries the company's reason to exist." (= auditor's text verbatim).
- The near-verbatim of wrong ア (企業の存在意義や使命; 12-char window hit) is gone in jp (LCS 7 → 2, windows 1 / 1 → 0 / 0) and zh (4 → 2); en keeps only the opening " the company's " (15, unchanged).
- Meaning preserved and consistent: = one_jp 「使命、つまりその企業が存在する理由」, overview_rows[3] 「存在する理由」, pairs[0] 「なぜ存在するか」, mix 考点 「企業が存在する理由そのもの」 (three languages: 存在理由 / "reason to exist" match one_zh / one_en). q029 is still answered: ミッション = reason to exist, so ア (存在意義・使命 — the mission) is recognisably not the vision; the vision 考点 (存在意義を踏まえた…将来の到達像) supports correct イ. The new point does not echo イ either (jp 2).
- The point no longer mentions 使命 / duty, but one (the definition) still glosses ミッション as 使命 / duty, so the link "mission = 使命" is not lost. "存在理由" coincides with 2019r01a-q012 correct ウ (経営理念の意義 = 存在理由や価値観; zh 4 chars) — pre-existing in one_jp, and q012 has no ミッション option; not a drift.

### 3.5 u02 p01–p03 (L1) — who audits 計算書類

- After: 「…計算書類を会計の専門家として監査するのは会計監査人である。」 / 「…以会计专家身份审计法定财务报表（计算书类）的是会计审计人。」 / "…the party that audits the statutory financial statements as an accounting expert is the accounting auditor." (= auditor's text verbatim).
- Correctness: under 会社法 436 条, in a company with 会計監査人 both 監査役 (等) and 会計監査人 audit the 計算書類; 会計監査人 is the auditor *as an accounting professional* (337 条: CPA or audit firm). The old unqualified 「計算書類の監査は会計監査人が行う」 implied exclusivity; the new restrictive 「会計の専門家として」 states only the true specific role and no longer excludes 監査役.
- Consistency: now identical in substance and wording with `terms[3].points[0]` (「…会計の専門家として監査するのは会計監査人であり、公認会計士または監査法人がこれを務める」) and compatible with 決算 `points[0]` 「会計監査人**など**による監査」, overview_rows[3].extra 「会計監査人、監査役などの監査する者」, and the fig (監査役 = 取締役の職務の執行). Three languages carry the same qualifier (以会计专家身份 / "as an accounting expert").
- 2013h25a-q007 (correct ア 会計監査人; wrong システム監査人 / 司法書士 / 税理士): still directly supported; no wrong choice gains support (wrong イ overlap = 監査人 / auditor only). 2011h23a-q016 (who elects 監査役, correct 株主総会): unaffected.

### 3.6 Other requested checks

- Dropped qualifiers / new restrictions: none. u01 p04–p06 and u05 p05 *soften* over-strong claims back to the jp; u02 p01–p03 remove an implied exclusivity; u03 p01–p06 widen one / key_points to the scope detail already had; u04 p05–p07 add the normal-time drafting the BCP's own one / fig state.
- D-204: u04 analogy now agrees with one / fig (priority); u05 Off-JT analogy no longer carries the image the コーチング 考点 negates.
- D-205: no patch adds a version-bound count / structure claim (u03 p07 keeps "17 goals", already in jp / zh).
- D-200 / D-195: validate 0 issues in all 5 units; sentence counts unchanged in every patched field.
- b18 u05 M1 type: 0 — u05 p02 removes the only zh-side drift (教练); no zh / en after-span reproduces a wrong choice's wording (longest wrong-choice overlaps: 備える / 做准备 / " prepare " vs 2020r02o-q026 エ, generic verbs).

## 4. Observations

No F-fix (no 建議修) from this re-review.

Records only, no fix:

1. LOW, u01 p03: en after-span " the company's reason " (22) equals part of the en sidecar of 2009h21h-q022 ア (correct, 経営理念) and 2025r07-q029 イ (correct, ビジョン) — a generic noun phrase for 存在理由; vs q029 wrong ア only " the company's " (15, unchanged). jp / zh overlaps fell (7 → 2 / 4 → 2).
2. LOW, u04 p02–p04: the after-spans share the generic verb 備える / 做准备 / prepare (3 / 3 / 9) with 2020r02o-q026 wrong エ (relocation preparations funded by insurance); the substantive 保険 / insurance overlap (en 11) is removed, the analogy is in リスクアセスメント (separated from BCP by points[1]) — net improvement.
3. LOW, u04 p12: "education and training" (23) equals part of 2012h24a-q006 correct イ's en sidecar (a different unit's question) — the standard English for 教育・訓練, and = BCM one_en already.
4. LOW, u05 p02: zh 指导老师 (analogy) vs 讲师 (Off-JT `pairs[0].rows[1].b_zh`) — different but both natural for their settings (sports practice / seminar); auditor's prescribed text.
5. LOW, u04 p08: 「4 つの領域は…どの領域でも…」 repeats 領域; grammatical (主題 + 全称), auditor's prescribed text.
6. LOW, u02 p04: hook_zh 「“大会”意味着面向全体成员召开。它是向公司所有股东开放的会议…」 — the two sentences now say nearly the same thing (open to all members); accurate, mnemonic field.
7. LOW, u03 p07: "The SDGs are divided into 17 goals" — the SDGs *are* the 17 goals, so "consist of 17 goals" would be smoother; jp 目標は 17 のゴールに分かれ is mirrored and nothing is wrong; auditor's prescribed text.
8. LOW, pre-existing: u01 `overview_rows[4].one_line_jp` 「…将来の一定の時点でなっていたい姿」 (zh / en equivalent) — not a 重言 (no ありたい), outside L3's scope; consistent with the patched one_jp in meaning.
9. LOW, pre-existing: u02 2 zh-term warnings (監査 → 审计 not in `terms[0].fig…children[1].label.zh` / `key_points_zh[0]`, where the text is about 监事 = 監査役); identical in the base part, unpatched.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: in-scope **2 resolved** (u04 M1 by p01; u05 M1 by p01–p03); **0 introduced**
- LOW introduced: 建議修 0; 記録のみ 9 (obs. 1–9, of which obs. 8–9 pre-existing)
- Application 40/40 exact (replay), 40/40 = the Rule A prescribed text, derived fields follow (351 checked, 0 mismatch), 0 unexplained base → unit diffs
- D-198: 0 new jp windows (u01 p01 removes 1); zh after-spans ≤5 chars (term or generic); en after-spans ≤23 chars, all term names or generic phrases, none from a wrong choice's frame
- validate 5/5 = 0 issues (u02: 2 pre-existing warnings, identical in base), parity 5/5 = 0 diff (32 / 25 / 31 / 37 / 28 locations), vitest textbook 162/162

**PASS** — all 40 active patches of strategy-01-01 u01–u05 are applied exactly (replay reproduces every patched field, derived fields follow, no other base-present path changed) and each is the auditor's prescribed text. Both MEDIUMs are resolved: u04's en table cell now says the assessment judges priorities (consistent with every other en field), and u05's Off-JT analogy no longer uses a coach, so it no longer contradicts the コーチング 考点 or points toward 2012h24a-q006's wrong エ. The risk-assessment analogy now picks *which first* (priority) instead of *what insurance* (response), the BCP time row adds normal-time drafting without narrowing BCM's scope or tracing 2015h27a-q007's a→b, the ミッション point drops the near-verbatim of 2025r07-q029 wrong ア while keeping the definition, and the 計算書類 key point no longer excludes 監査役 (会計監査人 = the accounting-expert auditor, as in `terms[3].points[0]`). No new HIGH / MEDIUM.
