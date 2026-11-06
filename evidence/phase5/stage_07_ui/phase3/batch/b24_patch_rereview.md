# b24 B3 patch re-review — strategy-03-09 u01–u05 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditors' context; Rule D)
- Date: 2026-11-06 (Session 147)
- Scope: B3 wording patches for strategy-03-09-u01 (p01–p04), u02 (p01–p07), u03 (p01–p08), u04 (p01–p06), u05 (p01–p11)
  — **36 `active`, 0 retired** (`patches/strategy-03-09-u0{1..5}.json`), checked against the Rule A prescriptions
  (`strategy-03-09-u01.ruleA.md` L1・L2 建議修; `-u02` **M1** + L1・L2・L3; `-u03` L1・L2・L3・L4; `-u04` L1; `-u05` **M1** + L1・L2 — i.e. every 建議修 / MEDIUM of the 5 files, none left unapplied)
  and the merged units `data/ip/textbook/units/strategy-03-09-u0{1..5}.json` (sha256 u01 `ea88dc0f89480dd3…`, u02 `7cf74a4afdf10e4b…`, u03 `a840762443e77049…`, u04 `972dfcf53d715bf8…`, u05 `063b284f3d774c9e…`).
- Pre-patch bases located by sha256 = `base_sha256` (all patches of a unit share one base; all match):
  u01 `b24-u01-a1/…loc.r1.json` (`672ad408…`; r0 = `79f11117…` is not the base), u02 `b24-u02-a1/…loc.r0.json` (`66aa7649…`), u03 `b24-u03-a1/…loc.r0.json` (`81f5c79e…`), u04 `b24-u04-a2/…loc.r1.json` (`8db4cb7a…`; r0 = `94d72686…` is not the base), u05 `b24-u05-a1/…loc.r0.json` (`aeb2afad…`).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210 and the HIGH / MEDIUM / LOW definitions in the Rule A files; S147 additional types (8)(9)(10) (scratchpad `ruleA_template.md`).
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names; matched fragments ≤12 chars except en sidecar overlaps, which are project translations and are quoted as the unit's own after-span).

## 0. Method

Same as `b22_patch_rereview.md` §0 (= b21 / b20 §0), topic strategy-03-09 (60 questions; 300 source strings per language):

1. Application check (script): every string field of base and merged unit is walked. Each `after` must appear in its field; `before` (raw and notation-stripped) must not survive anywhere; every string that differs between base and unit (for paths present in the base) must be explained by a patch; the patches replayed in file order on the base must reproduce the unit's field exactly. Additionally each patch's `before` / `after` (bold stripped on both sides) was found verbatim in its unit's Rule A file (36/36).
2. Derived-field check from the same walk (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`) for every term and key point of the 5 units; `summary.memory_hooks_*` by suffix match.
3. D-198 (jp patches: u01 p01; u02 p01, p04; u03 p01, p05; u04 p01, p04; u05 p01, p04): LCS, 12-char window with ≤2 substitutions with and without masking (katakana runs ≥4 and alnum masked; masked windows with <6 real chars excluded), best same-length-window bigram Dice (wDice). Sources: stem (`stem_jp_clean`, fallback `stem_jp`) + all choices of every strategy-03-09 question. zh / en patches: LCS against the zh / en translation sidecars of all 60 topic questions, whole patched field before → after and the `after` span alone. Plus a per-choice + stem LCS (before → after) of the focus patches against the focus questions: u01 p01–p03 × 2012h24a-q011, 2016h28a-q034, 2014h26a-q019, 2009h21h-q010; u02 p01–p03, p06 × 2015h27a-q014; u03 p01–p03 × 2009h21a-q008; u04 p01–p06 × 2014h26a-q008, 2013h25a-q026, 2010h22h-q017; u05 p01–p03 × 2018h30h-q023, p04–p06 × 2019h31h-q010.
4. D-195 / D-200 via validate; `validate --part <base>` for comparison.
5. Manual reading of each patched field in context (whole term + overview row + pairs + key_points + fig labels / captions); meaning judged against the cited / quiz questions' `correct_answer` and their zh / en sidecars (b18 u05 M1 type) and the S147 types (8) analogy key word = another term's role, (9) cue applied to a cited scenario picks a wrong option, (10) closed enumeration dropping members. For u01 the new cash-cow cell was read against all 16 PPM-related questions of the topic.
6. `scripts/textbook-v2-validate.mjs --unit` / `scripts/textbook-v2-parity.mjs --unit` per unit; `npx vitest run src/lib/textbook`.

Scripts: scratchpad `b24rr/check.mjs`, `b24rr/d198.mjs`, `b24rr/focus2.mjs`, `b24rr/q.cjs` (adapted from the b23 re-review scripts; only unit IDs / part paths / topic / focus questions changed).

Not established: as in b14–b23, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: u01 131, u02 126, u03 123, u04 91, u05 135) were checked for the derived copies (step 2) and for the patched texts.

## 1. Script results (fresh, 2026-11-06)

```
✓ strategy-03-09-u01 unit: 0 issues   validate EXIT=0 | parity: 28 locations, 0 diff  EXIT=0
✓ strategy-03-09-u02 unit: 0 issues   validate EXIT=0 | parity: 26 locations, 0 diff  EXIT=0
✓ strategy-03-09-u03 unit: 0 issues   validate EXIT=0 | parity: 25 locations, 0 diff  EXIT=0
✓ strategy-03-09-u04 unit: 0 issues   validate EXIT=0 | parity: 22 locations, 0 diff  EXIT=0
✓ strategy-03-09-u05 unit: 0 issues   validate EXIT=0 | parity: 33 locations, 0 diff  EXIT=0
validate --part (bases): u01 loc#1 0 issues | u02 loc#0 0 | u03 loc#0 0 | u04 loc#1 0 | u05 loc#0 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

Application: 36/36 `before` occur exactly once in the base field; 36/36 `after` present in their fields; replay of the patches in file order on the base reproduces every patched field exactly (5/5 units). Unexplained base → unit diffs in base-present paths: 0 per unit (changed paths u01 4, u02 7, u03 8, u04 6, u05 11 = exactly the patched fields, one patch per field; only the `stage` meta key removed, as in b19–b23; `round` / `jp_round` are non-string meta keys of the part). `before` remnants: 0 (no patch's `before` is a substring of its `after`).

Derived fields follow: u02 p04 / p05 → `terms[4].explanation_jp / _en`, p06 → `terms[5].definition_en`, p07 → `terms[0].memory_hook_zh` (+ `summary.memory_hooks_zh[0]`); u03 p04 → `terms[0].explanation_en`, p05–p07 → `summary.key_points_*[1]`; u04 p01–p03 → `terms[2].definition_*`; u05 p09 → `terms[3].explanation_zh`, p10 → `terms[0].memory_hook_zh` (+ `summary.memory_hooks_zh[0]`), p11 → `terms[5].memory_hook_zh` (+ `summary.memory_hooks_zh[5]`). The u05 L2 zh quote fixes (p09–p11, ASCII `"…"` → `“…”`) therefore reach `explanation_zh` / `memory_hook_zh` / `summary.memory_hooks_zh`; a walk of all zh fields of the 5 units finds 0 ASCII `"` and 0 「他社」 remaining. Full walk: `definition / explanation / memory_hook` = notation-stripped `one / detail / hook`, and `summary.key_points_*` = stripped `key_points_*` — u01 63, u02 66, u03 69, u04 45, u05 78 checked (321), 0 mismatches. `summary.memory_hooks_*` suffix check: u01 12, u02 18, u03 18, u05 21 = 0 bad; u04 9 entries for 4 terms (terms[0] M&A has no hook, so summary index i = terms[i+1]) — all 9 match a term's `memory_hook_*`; no u04 hook was patched.

Notation counts (bold, `[[jp:]]`), before → after, every patched field: unchanged in 36 of 36 (e.g. u02 `terms[5].one_en` bold 2 → 2 / `[[jp:]]` 1 → 1; u03 `terms[0].detail_en` bold 2 → 2 / `[[jp:資本提携]]` kept; u04 `terms[2].one_*` bold 3 → 3, zh / en `[[jp:株式公開買付け]]` kept; u05 `terms[5].points[0].text_zh / _en` `[[jp:ロジスティクス]]` 1 → 1). Parity 0 diff.

D-198, before → after (one script):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest overlap of the `after` span | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| u01 p01 | **jp** | 2012h24a-q011 stem → 2009h21h-q010 ア (correct, term) | **6 (少ない投資で) → 5 (金のなる木 = term)** | 金のなる木 (5, term) | 0 / 0 → 0 / 0; 0.42 → 0.36 |
| u01 p02 | zh | 2016h28a-q034 stem → 2009h21h-q010 ア (term) | 4 → 3 | 现金牛 (3, term) | — |
| u01 p03 | en | 2012h24a-q011 stem → 2009h21h-q019 ア | **18 (" little investment") → 12** | "r businesses" (12, generic) | — |
| u01 p04 | en | 2012h24a-q019 ウ | 22 → 22 (unchanged part) | "management resources, " (22, unchanged) | — |
| u02 p01 | **jp** | 2009h21h-q004 stem → 2015h27h-q017 ウ | 4 → 4 | なかった (4) | 0 / 0 → 0 / 0; 0.11 → 0.13 |
| u02 p02 | zh | 2009h21a-q008 イ → 2017h29a-q021 stem | 2 → 3 | 没有的 (3) | — |
| u02 p03 | en | 2012h24a-q018 イ | 11 → 11 (unchanged part) | " so that " (9) | — |
| u02 p04 | **jp** | 2012h24a-q018 ア | 6 → 6 (unchanged part, や販売力など) | できる (3) | 0 / 0 → 0 / 0; 0.13 → 0.13 |
| u02 p05 | en | 2010h22h-q097 stem | 14 → 14 (unchanged part) | " challenger's " (14, unchanged word) | — |
| u02 p06 | en | 2015h27a-q014 stem | 20 → 20 (" blue ocean strategy", term) | " competitors." (13) | — |
| u02 p07 | zh | 2010h22h-q097 ア | 3 → 3 | 的位置 (3) | — |
| u03 p01 | **jp** | 2015h27h-q017 エ | 5 → 5 (ブランドの, unchanged) | ブランドの (5) | 0 / 0 → 0 / 0; 0.16 → 0.16 |
| u03 p02 | zh | 2009h21a-q008 ア | 2 → 2 | 品牌 (2) | — |
| u03 p03 | en | 2010h22a-q011 stem → 2013h25h-q024 ウ | 13 → 14 | " that designs " (14, generic) | — |
| u03 p04 | en | 2020r02o-q017 stem | 15 → 15 (unchanged part) | " partnership" (12) | — |
| u03 p05 | **jp** | 2010h22h-q097 stem | 4 → 4 | の価値 (3) | 0 / 0 → 0 / 0; 0.07 → 0.07 |
| u03 p06 | zh | 2013h25h-q024 ウ | 3 → 3 | 种价值 (3) | — |
| u03 p07 | en | 2013h25h-q024 ウ | 10 → 11 | "hat value t" (11, generic) | — |
| u03 p08 | zh | 2009h21a-q008 ア → 2014h26h-q009 エ | 2 → 3 | 持续运 (3) | — |
| u04 p01 | **jp** | 2014h26a-q008 ア (correct) | 7 → 7 (外で株式を買い, unchanged part) | 株数価格期 (5) | 0 / 0 → 0 / 0; 0.28 → 0.31 (obs. 1) |
| u04 p02 | zh | 2014h26a-q008 ア (correct) | 7 → 8 | 收购的股数价格期 (8) | — (obs. 1) |
| u04 p03 | en | 2014h26a-q008 ア (correct) | 21 → 21 (unchanged part) | " the number of shares" (21, unchanged) | — |
| u04 p04 | **jp** | 2012h24a-q018 イ | 4 → 4 | 買い取る (4, unchanged) | 0 / 0 → 0 / 0; 0.19 → 0.23 |
| u04 p05 | zh | 2014h26a-q008 ア (correct) | 5 → 5 | 的股数价格 (5, unchanged) | — |
| u04 p06 | en | 2010h22h-q017 ア (correct) | 14 → 13 | " shareholders" (13, unchanged) | — |
| u05 p01 | **jp** | 2018h30h-q023 エ (correct, term) | 7 → 7 (ロジスティクス = term) | 最適化する (5, 2017h29a-q029 stem) | 0 / 0 → 0 / 0; 0.21 → 0.18 |
| u05 p02 | zh | 2009h21h-q019 エ | 4 → 4 (unchanged part) | 相关的 (3) | — |
| u05 p03 | en | 2009h21a-q008 イ → 2015h27a-q014 イ | 12 → 15 | " wide range of " (15, generic) | — |
| u05 p04 | **jp** | 2009h21h-q019 エ → 2012h24a-q018 ア | 2 → 4 | 他社との (4) | 0 / 0 → 0 / 0; 0.20 → 0.40 (obs. 2) |
| u05 p05 | zh | 2010h22h-q100 stem → 2012h24a-q018 ア | 3 → 7 | 通过与其他公司 (7, generic) | — (obs. 2) |
| u05 p06 | en | 2016h28h-q031 イ → 2009h21a-q008 イ | 12 → 16 | " other companies" (16, generic) | — (obs. 2) |
| u05 p07 | zh | 2015h27a-q014 ウ → 2011h23tokubetsu-q007 ア | 4 → 5 | 公司产品的 (5) | — |
| u05 p08 | zh | 2009h21a-q008 ア → 2009h21h-q019 ア | 2 → 5 | 的其他公司 (5) | — |
| u05 p09 | zh | 2014h26a-q019 イ | 4 → 4 (unchanged part) | 同类 (2) | — |
| u05 p10 | zh | 2016h28h-q030 stem | 3 → 3 | 约的 (2) | — |
| u05 p11 | zh | 2010h22h-q097 stem | 2 → 2 | 为 (1) | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52) as a sentence-frame copy; jp 12-char windows: 0 / 0 before and after in all 9 jp patches. u01 p01–p03 do what L1 asked: the cash-cow cell no longer shares 少ない投資で with the 2012h24a-q011 stem (jp stem LCS 6 → 2, zh 3 → 1, en 18 → 3). The two wDice rises (u04 p01 0.31, u05 p04 0.40) are a 3-item list that the cited correct answer itself names (obs. 1) and a 10-char overview cell (obs. 2).

Per-choice check of the focus patches (LCS before → after vs each choice; `focus2.mjs`):
- 2012h24a-q011 (fill-in, correct イ 金のなる木 / 問題児; wrong ア pairs 金のなる木 with 負け犬): u01 p01–p03 vs ア / イ = term only (5 / 3 / 8, unchanged); stem 6 → 2 / 3 → 1 / 18 → 3.
- 2016h28a-q034 (correct エ low growth / high share), 2014h26a-q019 (correct エ 問題児), 2009h21h-q010 (correct ア 金のなる木): u01 p01–p03 ≤3 jp / ≤2 zh vs every choice; en " business" 9 vs all four q034 choices alike (generic); vs q019 the en overlap with correct エ drops 12 → 3 and with wrong ア (cash-cow description) 12 → 9 — no move toward a wrong choice.
- 2015h27a-q014 (correct ア new value → new market; wrong イ assortment / ウ differentiation from the top firm / エ cost): u02 p01–p03 ≤3 jp / ≤2 zh vs every choice; en vs ア 5 → 9 ("create a "), vs イ / ウ / エ ≤5. p06 en vs エ 13 → 12 (" competitors", word of the term's own definition).
- 2009h21a-q008 (correct イ fabless): u03 p01–p03 ≤4 (ア ブランド 4, unchanged; en " contract" 9 vs エ, unchanged).
- 2014h26a-q008 / 2013h25a-q026 / 2010h22h-q017 (TOB, correct ア each): u04 p01–p06 overlaps only with the correct ア (株数・価格 items, " the number of shares", " shareholders"); vs wrong choices ≤4 jp / ≤2 zh / en ≤9 (" shares", "sharehold" — generic, unchanged).
- 2018h30h-q023 (correct エ ロジスティクス; wrong トレーサビリティ / ベストプラクティス / ベンチマーキング are katakana names): u05 p01–p03 vs every choice ≤3; vs the stem jp 4 → 3, zh 4 → 2, en 11 → 6 — the patch does not bring the stem's 3-noun list (調達・生産・販売) back.
- 2019h31h-q010 (correct エ measure own products and compare with others' best; wrong ア PDCA, イ the best case itself, ウ own unique skill): u05 p04–p06 vs correct エ jp 1 → 2, zh 1 → 5 (与其他公司), en 3 → 16 (" other companies"); vs wrong ア en 8 → 6, イ en 12 → 12 (" comparison ", obs. 2), ウ ≤7.

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01–p03 | `terms[1](PPM).fig.data.rows[1].cells[1].jp / zh / en` | L1 建議修 | **Yes** (§3.4) | No | OK |
| u01 | p04 | `overview_rows[3](内部環境).extra_en[0]` | L2 建議修 | Yes: "Management resources, technical skill, brand, etc." = jp 「経営資源・技術力・ブランドなど」 / zh 「…品牌等」 — the list is open again | No | OK |
| u02 | p01–p03 | `terms[5](ブルーオーシャン戦略).analogy_jp / _zh / _en` | **M1 (MEDIUM)** | **Yes** (§3.1) | No | OK |
| u02 | p04–p05 | `terms[4](同質化戦略).detail_jp / _en` (+ explanation) | L1 建議修 | Yes: 追随 / "follow" (the follower's word, table row 3) → 対抗 / "match"; zh 跟进 kept as prescribed. en "match" also carries 同質化's own sense (make the offer the same) | No | OK |
| u02 | p06 | `terms[5].one_en` (+ definition_en) | L2 建議修 | Yes: "create, by itself, a **market with no competitors**" — "of its own" no longer attaches to competitors; = jp 自ら創り出す | No | OK |
| u02 | p07 | `terms[0](競争優位).hook_zh` (+ memory_hook_zh, summary.memory_hooks_zh[0]) | L3 建議修 | Yes: 写作 → 二字的字面意思是 (literal meaning, not spelling); 3 fields carry it | No | OK |
| u03 | p01–p03 | `terms[4](ファブレス).analogy_jp / _zh / _en` | L1 建議修 | **Yes** (§3.5) | No | OK |
| u03 | p04 | `terms[0](アライアンス).detail_en` (+ explanation_en) | L2 建議修 | Yes: "capital alliance" → "capital partnership" (= fig label "Capital partnership", `key_points_en[0]`); `[[jp:資本提携]]` kept; the unit's en now has 0 "capital alliance" | No | OK |
| u03 | p05–p07 | `key_points_jp / zh / en[1]` (+ summary) | L3 建議修 | Yes: 集める → 集めやすい / 会 → 容易 / "attracts" → "tends to attract" = エコシステム detail 「循環が生まれやすい」 | No | OK |
| u03 | p08 | `pairs[0].rows[2].a_zh` | L4 建議修 | Yes: 设备开工率 (utilisation rate) → 设备的持续运转 = jp 設備の稼働 / en "keeping equipment running" | No | OK |
| u04 | p01–p06 | `terms[2](TOB).one_jp / _zh / _en` (+ definition), `terms[2].fig.steps[0].caption_jp / _zh / _en` | L1 建議修 | **Yes** (§3.3) | No (obs. 1) | OK |
| u05 | p01–p03 | `terms[5](ロジスティクス).points[0].text_jp / _zh / _en` | **M1 (MEDIUM)** | **Yes** (§3.2) | No | OK |
| u05 | p04–p06 | `overview_rows[4](ベンチマーキング).extra_jp / _zh / _en[0]` | L1 建議修 | **Yes** (§3.2) | No (obs. 2) | OK |
| u05 | p07–p08 | `overview_rows[2].extra_zh[0]`, `pairs[1].rows[0].a_zh` | L2 建議修 | Yes: 他社 → 其他公司 (= the rest of the unit's zh); 0 他社 left in zh | No | OK |
| u05 | p09 | `terms[3](カニバリゼーション).detail_zh` (+ explanation_zh) | L2 建議修 | Yes: "共食" → “共食い”（同类相食） — the Japanese word now reads as a quoted jp word with its zh gloss, not as zh 共食 (eat together); full-width quotes | No (obs. 3) | OK |
| u05 | p10–p11 | `terms[0](規模の経済).hook_zh`, `terms[5].hook_zh` (+ memory_hook_zh, summary.memory_hooks_zh[0] / [5]) | L2 建議修 | Yes: ASCII `"…"` → `“…”`; derived copies follow (§1) | No | OK |

## 3. Focused checks

### 3.1 u02 p01–p03 (M1) — ブルーオーシャン analogy: create vs find a market

- After: 「混み合う釣り場で場所を取り合うのをやめ、何もなかった沖に魚の集まる魚礁を沈めて、誰もいない新しい漁場を自分で作り出すようなもの。」 / zh 「…而是在原本什么都没有的远海沉下聚鱼的鱼礁，亲手造出一片没有别人的新渔场。」 / en "…sinking an artificial reef in empty water offshore, so that you create a brand-new fishing ground with no one else on it." (= auditor's M1 text verbatim, 3/3).
- Create vs find: the image now has a place where there was nothing (何もなかった / 原本什么都没有 / "empty water"), an act of making (沈めて・作り出す / 造出 / "create") and a result that did not exist before (新しい漁場 / 新渔场 / "brand-new fishing ground"). The old 「見つける」 (discover an existing but unvisited ground) is gone in all three languages. The reef that draws fish = new value that generates demand, i.e. the same mechanism as `points[0]` (新しい価値で需要を生み出し) and `pairs[1].rows[2]` b (新しい価値で需要を生む).
- Against ニッチ戦略: `terms[3].analogy` is a small fish in an existing rock crack where big fish cannot enter (= an existing small part). Applied to the key row `pairs[1].rows[0]` (戦う市場: a 既にある市場の小さな一部 / b 新たに創り出す市場), the reef analogy now lands in column b, the crack analogy in column a — the two analogies carry the axis instead of being the same type. 「誰もいない」 agrees with row 2 b (まだ競合がいない) and with the mix 考点 `points[1]`. No contradiction with the niche term (the niche analogy and 考点 are unchanged).
- Against 2015h27a-q014 (cited / quiz, correct ア = new value → new market without competition): the analogy reads straight to ア; it carries no assortment (イ), differentiation from the top firm (ウ) or cost (エ) image. zh / en per-choice LCS ≤5 vs wrong choices (§1). Type (8): 魚礁 / reef is no headword of the unit and names no role another term defines; type (9): applied to q014 it selects ア. **M1 resolved.**

### 3.2 u05 p01–p06 (M1 + L1) — ロジスティクス point vs 2018h30h-q023; ベンチマーキング cell vs 2019h31h-q010

- p01–p03 after: 「ロジスティクスは輸送という一つの作業の改善ではなく、物の流れにかかわる幅広い業務を一続きとしてとらえ、全体で最適化する考え方である。」 / zh 「…而是把与物品流动相关的广泛业务视为一条连续的流程，进行整体优化的思路。」 / en "…but about treating the wide range of operations that move goods as one continuous flow and optimizing it as a whole." (= auditor's text verbatim, 3/3).
- 「など」 / scope: the closed interval 仕入れから生産・販売まで is gone; the object is open again (幅広い業務 / 广泛业务 / "the wide range of operations") and is again the flow of goods (物の流れ / 物品流动 / "move goods"), matching the q023 stem's broad-scope 物流の最適化 (correct エ). The point no longer stops at sales, so it no longer conflicts with `one_jp` (調達から顧客に届くまで), the fig (調達 → 生産 → 保管 → 配送 → 顧客), the analogy (up to delivery to the venue) or `key_points_jp[3]` (各段階をつないだ全体の効率で物の流れを評価). The drift toward an SCM-style "purchasing-to-sales whole" definition is gone (it now speaks of goods flow, not of the business chain). The patch does not reintroduce the q023 stem's 3-noun list (stem LCS jp 4 → 3, zh 4 → 2, en 11 → 6; 12-char windows 0 / 0). Type (10): the new wording is not an enumeration. Applied to q023 the point still picks エ and none of the three katakana distractors (traceability / best practice / benchmarking). qids `2018h30h-q023` kept; 1 sentence. **M1 resolved.**
- p04–p06 after: 「他社との比較による改善」 / 「通过与其他公司比较来改进」 / "Improving by comparison with other companies" (= goals_jp[2] 「比較による改善」 and the row's `one_line_jp` 優れた他社と自社の水準を比べて). Type (9) on 2019h31h-q010: the old cell (改善の進め方) fitted wrong ア (PDCA continuous improvement) as well as correct エ; the new cell carries the discriminator "comparison with other companies" → correct エ; ア (no comparison) and ウ (own unique skill) no longer fit. イ (the best case that is the object of comparison) shares the word "comparison" (en 12 → 12) but is a thing, not an improvement method — the cell reads as the method エ (obs. 2). **L1 resolved.**

### 3.3 u04 p01–p06 (L1) — TOB 「など」

- one_jp 「買付けの株数・価格・期間**など**をあらかじめ公告し」, one_zh 「股数、价格、期间**等条件**」, one_en "the number of shares, the price, the period **and other terms**"; caption_jp 「…受け付ける期間**などの条件**を広く知らせる。」, zh 「…受理的期间**等条件**。」, en "…for how long it will accept tenders from shareholders, **and other terms**." (= auditor's text verbatim, 6/6). The three named items stay (= the items 2014h26a-q008 ア and 2013h25a-q026 ア name), and the list is now open in both one and fig step 1 in all three languages; definition_* follow.
- Consistency: steps 2–4 (条件に納得した株主 / within the period / off-market purchase / control or capital tie) are unchanged and agree with the opened caption (「条件」 in step 2 now refers back to 「などの条件」 in step 1 — reads more naturally than before). `key_points_jp[2]` (条件を公告したうえで) already generic. `detail_jp` (「公開」 = 買付け条件の公表) agrees.
- Questions: q008 / q026 / 2010h22h-q017 correct ア each; per-choice overlaps only with the correct ア; vs wrong イ (MBO-type / cross-shareholding), ウ (IPO / own-shares MBO), エ (CSR / LBO) ≤4 jp, ≤2 zh. The 「など」 makes the one closer to q008 ア's 3-item list (jp after-span 株数価格期 5; wDice 0.28 → 0.31; 0 / 0 windows) — the items are the legal disclosure items and the order is the natural one; within D-198's standard-definition exemption (obs. 1). **L1 resolved.**

### 3.4 u01 p01–p03 (L1) — PPM cash-cow cell vs 2012h24a-q011 and the other PPM questions

- After: 「金のなる木 (稼いだ資金を他の事業に回せる)」 / 「现金牛（赚到的资金可以投到其他业务）」 / "Cash cow (its cash can fund other businesses)" (= auditor's text verbatim, 3/3).
- D-198: the 6-char overlap 少ない投資で with the q011 stem's cash-cow clause is gone (stem LCS jp 6 → 2, en 18 → 3, zh 3 → 1). q011 itself stays answerable: `points[1]` still says the cash cow earns without large additional investment (→ blank a = 金のなる木) and the 問題児 cell (育てるために多くの投資が要る) still matches blank b → correct イ, not ア (負け犬 cell = review / withdrawal).
- Meaning: the cell now gives the cash cow's role (source of funds for other businesses) = `points[1]` (他の事業を支える資金源) and 2016h28a-q034's framing (資金を生み出す事業, correct エ low growth / high share — the cell is in the low-growth / high-share position of the table). 2009h21h-q010 (correct ア), 2019h31h-q026 (chart, correct ア = high share / low growth), 2021r03-q023 (correct エ 問題児), 2014h26a-q019 (correct エ 問題児; its wrong ア is a cash-cow description): the cell sits in the same quadrant as before, so every position question is answered as before; "funds other businesses" is not a property of any wrong choice's quadrant (stars need investment to defend, question marks need investment, dogs are reviewed). The other three cells are unchanged. Type (9): applying the table to q019 / q034 / q026 picks the correct answer. **L1 resolved.**

### 3.5 u03 p01–p03 (L1) — ファブレス analogy

- After: 「自前の厨房を持たずに献立を考えて売り出し、調理は契約した厨房に任せる料理ブランドのようなもの。」 / zh 「…没有自己的厨房、自己设计菜单并负责售卖，烹饪交给签约厨房…」 / en "…a food brand with no kitchen of its own that designs and sells its menu while contracted kitchens do the cooking." (= auditor's text, 3/3).
- What the brand lacks is now the kitchen (= the factory, one_jp 工場を持たず), not the shop; it plans and sells (= `points[0]` 企画・設計と販売, `pairs[0].rows[2].b` 製品の企画・設計と販売). Type (9) on 2009h21a-q008 (correct イ: no factory, plans products, outsources production): selects イ; not ウ (vertical integration planning → manufacturing → sales — the cooking is outsourced), not ア (OEM = the contracted kitchen's side), not エ (one-stop contract manufacturing = contractor). No headword collision (厨房 is no term). **L1 resolved.**

### 3.6 Other requested checks

- Dropped qualifiers / new restrictions: none. u01 p04, u04 p01–p06 and u05 p01–p03 re-open lists; u03 p05–p07 soften to the tendency the detail states; u02 p06, u03 p04, u03 p08, u05 p07–p11 are wording / translation fixes with no change of claim.
- D-204: u02 analogies of ニッチ / ブルーオーシャン now carry the key-row axis (existing vs created); u03 analogy agrees with `points[0]` / pairs; u05 point agrees with one / fig / analogy / key_points scope.
- D-205: no patch adds a version-bound claim.
- D-200 / D-195: validate 0 issues in all 5 units; sentence counts unchanged in every patched field.
- b18 u05 M1 type: 0 — zh / en after-spans reproduce no wrong choice's wording (longest wrong-choice overlaps: " comparison " 12 vs 2019h31h-q010 イ (unchanged length), " competitors" 12 vs 2015h27a-q014 エ, " business" 9 vs q034 all choices — generic words).

## 4. Observations

No F-fix (no 建議修) from this re-review.

Records only, no fix:

1. LOW, u04 p01 / p02: with 「など」 / 等条件 the one's item list 株数・価格・期間 is one char closer to 2014h26a-q008 correct ア's list (jp after-span 5, zh 8; wDice 0.28 → 0.31; 12-char windows 0 / 0). These are the statutory disclosure items in their natural order (D-198 standard-definition exemption); the overlap is with the correct answer only. Auditor's prescribed text.
2. LOW, u05 p04–p06: the 10-char overview cell 他社との比較による改善 shares 他社との (4) with 2012h24a-q018 ア (not a benchmarking question) and lifts wDice 0.20 → 0.40 (short-cell effect, 0 / 0 windows); en "comparison" (12) is shared with 2019h31h-q010 wrong イ (the best case itself), but the cell names a method of improvement, which is エ, and the discriminator "with other companies" (16) comes from correct エ.
3. LOW, u05 p09: zh detail now contains the Japanese word 共食い in full-width quotes with a zh gloss (同类相食) rather than `[[jp:…]]` markup; this matches the unit's other zh etymology sentences (plain quoted jp words, e.g. u02 hook_zh 「優位」) and the auditor's prescription; parity 0 diff.
4. LOW, u02 p05: en "match" (jp 対抗 = counter) is slightly closer to "imitate"; for 同質化戦略 this is the term's own sense and does not read as the follower role; zh 跟进 unchanged as prescribed (Rule A L1: zh not a problem).

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: in-scope **2 resolved** (u02 M1 by p01–p03; u05 M1 by p01–p03); **0 introduced**
- LOW introduced: 建議修 0; 記録のみ 4 (obs. 1–4)
- Application 36/36 exact (replay), 36/36 = the Rule A prescribed text, derived fields follow (321 checked + summary.memory_hooks suffix 78, 0 mismatch; u05 L2 zh quote fixes reach explanation_zh / memory_hook_zh / summary.memory_hooks_zh), 0 unexplained base → unit diffs
- D-198: 0 jp windows before / after in all 9 jp patches; u01 p01–p03 break the 2012h24a-q011 stem overlap (jp 6 → 2, en 18 → 3); zh after-spans ≤8 chars (all toward correct answers or generic); en after-spans ≤21 chars, all unchanged parts, term names or generic phrases, none from a wrong choice's frame
- validate 5/5 = 0 issues, parity 5/5 = 0 diff (28 / 26 / 25 / 22 / 33 locations), vitest textbook 162/162

**PASS** — all 36 active patches of strategy-03-09 u01–u05 are applied exactly (replay reproduces every patched field, derived fields follow, no other base-present path changed) and each is the auditor's prescribed text. Both MEDIUMs are resolved: the ブルーオーシャン analogy now sinks a reef where there was nothing and creates a new fishing ground (column b of the ニッチ / ブルーオーシャン key row, contrasting with the niche rock-crack analogy, and reading straight to 2015h27a-q014 ア); the ロジスティクス 考点 no longer closes the 2018h30h-q023 scope to purchasing → sales but speaks of the broad range of operations in the flow of goods, consistent with one / fig / analogy. The LOW fixes open the TOB and 内部環境 lists, give the cash cow its funding role without echoing 2012h24a-q011, align the fabless analogy with plan + sell, and make the benchmarking cell discriminate 2019h31h-q010 エ from ア. No new HIGH / MEDIUM.
