# b67 B3 patch re-review — strategy-06-20 u01〜u03 (クラウドのサービスモデル(○aaS)、クラウドの配置形態と運用形態、古典的ソリューション・データセンターサービス)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the three Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b67rv/`: `check.mjs` / `d198.mjs` / `same.mjs` copied from `b66rv/` with only the unit map changed (3 units; u01 base attempt `a1` round `r0`, u02 `a2` / `r0`, u03 `a2` / `r1`). `same.mjs` reads the 33 Rule A before / after pairs from `b67rv/ra.json`: the 18 u01 M1 pairs were extracted by script from the Rule A "M1 修正表", the other 15 were copied by hand; all 66 strings are confirmed verbatim in the Rule A files by script. Extra scratchpad scripts: `extra.mjs` (shortened count, old-wording greps, `[[jp:]]` origin, D-200), `mask_run.mjs` (masked 12-char windows / Dice / ed for 4 u01 fields), `tgt_run.mjs` (before → after LCS / Dice / ed / win12 against one cited question per field). `qcite.mjs` / `q099b.mjs` were copied but not used (every cited question here is in topic strategy-06-20, so `d198.mjs` covers them). No scratch files in the repo.
- Date: 2026-11-08 (Session 151, b67)
- Scope: the B3 wording patches for 3 units. **33 are `active`, 0 retired**, all part-level:

| Unit | Rule A | Patches | Mapping to Rule A prescriptions | Shortened |
|---|---|---|---|---|
| u01 (クラウドのサービスモデル(○aaS)) | FAIL M1, 建議修 L1–L4 / L11 | p01–p27 | M1 → p01–p03 (`terms[0].one_*`), p04–p06 (`terms[0].points[2].text_*`), p07–p09 (`terms[0].fig.data.b.jp/zh/en`), p10–p12 (`key_points_*[0]`), p13–p15 (`overview_rows[0].one_line_*`), p16–p18 (`goals_*[0]`); L1 → p19–p21 (`pairs[1].rows[0].a_*`); L2 → p22–p24 (`terms[3](IaaS).analogy_*`); L3 → p25 (`terms[2](PaaS).hook_zh`); L4 → p26 (`terms[0].detail_en`); L11 → p27 (`pairs[0].rows[2].a_zh`) | 12/27 (p01–p06, p10–p12, p16–p18) |
| u02 (クラウドの配置形態と運用形態) | PASS, 建議修 L1 | p01–p03 | L1 → p01–p03 (`terms[0](パブリッククラウド).points[0].text_*`) | 1/3 (p02) |
| u03 (古典的ソリューション・データセンターサービス) | PASS, 建議修 L1 | p01–p03 | L1 → p01–p03 (`pairs[0].rows[1].b_*`) | 0/3 |

  Every MEDIUM and every 建議修 is covered. 記録のみ LOWs (u01 L5–L10 / L12 / L13, u02 L2–L8, u03 L2–L9) and O-items are not patched and not re-ruled here.
  - **Shortened strings**: **13 of 33** (`before` / `after` are phrases inside the Rule A strings; counted by script as patch `before` ≠ Rule A `before`). `same.mjs` confirms that base.replace(Rule A before, Rule A after) = unit field for **33/33**, so all shortened patches give the same result as the Rule A strings.
- Pre-patch bases, located by sha256 = `base_sha256` (validate --part prints the same sha):
  - u01 `data/ip/textbook/.planning/v2/strategy-06-20-u01/parts/b67-u01-a1/strategy-06-20-u01.loc.r0.json` `6a039d9e1d278bb1…`
  - u02 `.../strategy-06-20-u02/parts/b67-u02-a2/strategy-06-20-u02.loc.r0.json` `a74183c6da2492c5…`
  - u03 `.../strategy-06-20-u03/parts/b67-u03-a2/strategy-06-20-u03.loc.r1.json` `2518ba8d06d08102…`
- Merged units (current) `data/ip/textbook/units/strategy-06-20-u0N.json` sha256: u01 `be6873ed83ec3901…`, u02 `58cb8460a01cedeb…`, u03 `cc0fe4ef51ab55dc…`. Each differs from its base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b66_patch_rereview.md` §0 (no unit-level patches in this batch). All 3 units share topic strategy-06-20 (21 questions), so there are 105 source strings per language.

1. **Application check** (`b67rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b67rv/same.mjs`: Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`, `overview.intro_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b67rv/d198.mjs`, all 33 patches): whole-field LCS before → after and LCS of the `after` span against the 105 sources per language; jp also 12-char windows (unmasked / masked) and Dice. Plus `b67rv/mask_run.mjs` (u01 `one_jp` / `points[2]` / `key_points_jp[0]` / `goals_jp[0]`: masked windows, best Dice, best-window ed) and `b67rv/tgt_run.mjs` (before → after against one named question: u01 L1 cell vs 2017h29a-q011 ウ, u01 `points[2]` vs 2019h31h-q030 stem, u01 `one_jp` vs 2021r03-q005 ウ, u03 L1 cell vs 2013h25h-q004 stem).
4. **Cited-question checks** in `data/ip/quiz/questions.json` + `translations/<exam>.json` (stem_jp_clean): 2018h30a-q009 (イ: computer-resource provision as a service model), 2021r03-q005 (ウ: resources over the network, on demand, scalable), 2019h31h-q030 (イ オンプレミス: own system in facilities the company manages, run by itself; wrong ウ クラウドコンピューティング), 2015h27h-q020 (ア SaaS), 2017h29a-q011 (エ; ウ = PaaS description, the L1 near-copy target), 2015h27a-q005 (ア), 2009h21h-q006 (ウ), 2013h25h-q004 (ア オフショアアウトソーシング; for u03 L1).
5. **Cross-unit checks (key check of this batch)**: after u01 M1, read u01 / u02 / u03 together in three languages on the cloud-form axes — location, dedicated vs shared, owner, who operates — and look for any field that still contradicts another (§X).
6. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (per-unit §3), plus unit-wide greps for old wording and a unit-wide `[[jp:]]` origin check (space-normalized, all jp strings).
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit` (per unit), `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b66): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 114 / u02 126 / u03 125) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-06-20-u01   → ✓ 0 issues               EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs   --unit strategy-06-20-u01   → ✓ 23 locations, 0 diff   EXIT=0
$ ... validate --unit strategy-06-20-u02 → ✓ 0 issues  EXIT=0 | parity → ✓ 25 locations, 0 diff  EXIT=0
$ ... validate --unit strategy-06-20-u03 → ✓ 0 issues  EXIT=0 | parity → ✓ 28 locations, 0 diff  EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part <base>   (one per unit)
  u01 loc#0 counts {"terms":5,"figs":2,"steps":0,"points":6,"pairs":2,"key_points":3,"goals":3}   sha256 6a039d9e1d278bb1…  ✓ 0 issues  EXIT=0
  u02 loc#0 counts {"terms":6,"figs":2,"steps":0,"points":6,"pairs":2,"key_points":3,"goals":3}   sha256 a74183c6da2492c5…  ✓ 0 issues  EXIT=0
  u03 loc#1 counts {"terms":5,"figs":5,"steps":8,"points":11,"pairs":2,"key_points":4,"goals":3}  sha256 2518ba8d06d08102…  ✓ 0 issues  EXIT=0
  (all 3 sha256 = base_sha256 of every patch in that unit)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs (per unit):
  u01 active 27 ok 27 | issues [] | changed base-present = 27 patched + 'stage' | unexplained besides 'stage' 0 | derived 54, mismatch 0 | memory_hooks 15 bad 0, lens 5/5/5
  u02 active 3 ok 3   | issues [] | changed base-present = 3 patched + 'stage'  | unexplained 0 | derived 63, mismatch 0 | memory_hooks 18 bad 0, lens 6/6/6
  u03 active 3 ok 3   | issues [] | changed base-present = 3 patched + 'stage'  | unexplained 0 | derived 57, mismatch 0 | memory_hooks 15 bad 0, lens 5/5/5
  base sha = base_sha256 for all 33; before count in base = 1 for all 33; replay mismatch 0
  base-only top keys (all 3): stage / round / jp_round (part metadata)
  net before remnant: 0 for 30/33; u01 p07 / p08 / p09 = 25 / 10 / 3 (see below)
  bold counts unchanged in all 33; [[jp:]] counts unchanged in all 33
  derived followers (all true): u01 definition_jp/zh/en of terms[0] (p01–p03), memory_hook_zh of terms[2] (p25) + summary.memory_hooks_zh pairing,
      explanation_en of terms[0] (p26); summary.key_points_*[0] (p10–p12) and overview.intro_* (goals p16–p18, now 「事業者から借りる
      クラウドコンピューティング」/「向服务商租用的云计算」/ "cloud computing … rented from a provider") follow
  ruleA verbatim miss: [] in all 3 units
same.mjs (Rule A before → after on the base field):
  Rule A before occurs once in the base field: 33/33 (u01 27/27, u02 3/3, u03 3/3)
  base.replace(Rule A before, Rule A after) == unit field: 33/33 true
[[jp:]] origin (all tags vs all jp strings, space-normalized): u01 8 kinds miss 0 | u02 6 miss 0 | u03 6 miss 0
D-200 (patched 考点, jp chars without spaces / sentences): u01 terms[0].points[2] (p04, mix, qid 2019h31h-q030) 63 / 1; u02 terms[0].points[0] (p01, mix, no qid) 60 / 2. Both ≤100 / ≤2.
grep in the units (old wording, expect 0):
  u01 "不自己持有" 0 / "without owning" 0 / "クラウドコンピューティングとは設備" 0 / "的云计算，区别" 0 / "from cloud computing, which" 0 / "需要时按需取用" 0 /
      "空き地" 0 / "通了水电" 0 / "bare plot" 0 / "站台」是同一个词" 0 / "keeps the up-front" 0 / "业务负责人员" 0 / "ハードウェアに加えて" 0 / "硬件之外" 0 / "Hardware plus" 0;
      "自社で持たず" 2 (= key_points_jp[0] + summary copy, the new conditional 「事業者から借りる場合は機器を自社で持たずに済み」, not a remnant)
  u02 "他社" 0 / "其他公司" 0 / "other companies" 0
  u03 "システム運用の委託" 0 / "代算工资" 0 / "outsourced system operation" 0
```

No validate warns in any of the 3 units (unit or part). `stage` meta is removed in all 3 units (as in b19–b66).

**Application.** All 33 `before` strings occur exactly once in their base field, all 33 `after` strings are present, and replay reproduces every patched field. 13 are shortened phrases of the Rule A strings; all 33 give exactly the Rule A after text (same.mjs 33/33). **u01 p07–p09 remnants**: their `before` is the whole fig column label, which is the headword itself (クラウドコンピューティング / 云计算 / Cloud computing). The 25 / 10 / 3 occurrences are the headword in other fields (term, one, detail, points, goals, key_points, derived copies); none is in `terms[0].fig` (fig hits 0 in all three languages), and the label now reads 「事業者のクラウドを借りる」/「租用服务商的云」/ "Renting a provider's cloud". So the count-1 check is meaningful (before occurs once in its own field), and the remnant count is headword use, not an unapplied patch. No other `after` contains its own `before`.

## U1. strategy-06-20-u01 (Rule A FAIL M1, 建議修 L1–L4 / L11)

### U1.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 13 → 13 (クラウドコンピューティング, headword) | ネットワーク (6); win12 **18/6 → 18/3** (unmasked = headword windows; the 3 masked left are the unchanged 「サーバやソフトウェアなど」 ~ 2017h29h-q023 stem / 2021r03-q005 ウ, generic); Dice 0.31 → 0.29 |
| p02 | zh | 4 → **6** (服务商的设施, 2011h23a-q005 stem) | 6 (same) |
| p03 | en | 30 → 22 (" servers and software ", 2017h29h-q023 stem) | 22 (same, unchanged text) |
| p04 | jp | 13 → 7 (情報システムを, unchanged) | 事業者の (4); win12 **17/0 → 0/0**; Dice 0.30 → 0.28 |
| p05 | zh | 4 → 4 (信息系统, unchanged) | 租用服务 (4) |
| p06 | en | 21 → 21 (" information systems ", unchanged) | " the equipment" (14) |
| p07 | jp | 13 → 5 (のクラウド) | 5; win12 9/0 → 0/0; Dice **1.00 → 0.26** (the old label was the headword = 2019h31h-q030 ウ) |
| p08 | zh | 3 → 4 (租用服务) | 4 |
| p09 | en | 14 → 13 (" provider's c") | 13 |
| p10 | jp | 13 → 13 (headword) | をネットワーク (7); win12 15/0 → 15/0 (headword windows); Dice 0.42 → 0.31 |
| p11 | zh | 4 → **6** (通过网络使用, 2011h23a-q005 stem) | 6 (same) |
| p12 | en | 17 → 17 (" cloud computing ", headword) | " equipment, and " (16) |
| p13 | jp | 5 → **7** (をネットワーク, 2017h29a-q011 ウ) | 7; win12 0/0 → 0/0; Dice 0.15 → 0.25 |
| p14 | zh | 4 → 4 (通过网络) | 4 |
| p15 | en | 11 → 12 (" the network") | 12 |
| p16 | jp | 13 → 13 (headword) | 13 (headword); win12 **15/0 → 17/0** (2 new unmasked windows = headword + 「と」, masked 0); Dice 0.46 → 0.40 |
| p17 | zh | 4 → 4 (本地部署, term) | 服务商 (3) |
| p18 | en | 17 → 17 (" cloud computing ", headword) | 17 (headword) |
| p19 | jp | 6 → 6 (ハードウェア) | 6; win12 0/0 → 0/0; Dice **0.29 → 0.20** (vs 2017h29a-q011 ウ) |
| p20 | zh | 4 → 4 (操作系统) | 4 |
| p21 | en | 13 → 12 (" the OS and ") | 12 |
| p22 | jp | 3 → 3 (なもの) | 3; win12 0/0 → 0/0; Dice 0.08 → 0.08 |
| p23 | zh | 2 → 2 | 2 |
| p24 | en | 10 → 12 ("e only the f", 2015h27a-q005 ア, accidental) | 12 |
| p25 | zh | 7 → 8 ("platform", 2017h29a-q011 ウ) | 8 |
| p26 | en | 22 → 22 (unchanged text) | " equipment " (11) |
| p27 | zh | 2 → 2 (业务) | 2 |

- **Rises**: p02 / p11 +2 are generic noun phrases (服务商的设施 / 通过网络使用) in a stem from another subject (2011h23a-q005); p13 +2 is the particle + 「ネットワーク」; p15 / p25 +1 (" the network", the English word "platform" that L3 adds on purpose); p24 +2 is a letter-boundary coincidence ("…like renting a building wher**e only the f**rame" vs an unrelated choice). None carries a question's frame or element order.
- **Targeted** (`mask_run.mjs` / `tgt_run.mjs`): `one_jp` vs 2021r03-q005 ウ LCS 6 → 6, Dice 0.19 → 0.19, ed 0.82 → 0.87; best-window ed over all sources 0.78. `points[2].text_jp` vs 2019h31h-q030 stem LCS 7 → 7, Dice 0.26 → 0.28, ed 0.79 → 0.75, win12 0/0 (far from the HIGH calibration Dice 0.52 / ed 0.14). `key_points_jp[0]` masked 0, best Dice 0.31, ed 0.76. `goals_jp[0]` masked 0, best Dice 0.40 (vs q030 ウ, which is the bare headword), ed 0.67.
- **L1 (p19–p21)**: the cell vs 2017h29a-q011 ウ (wrong option = PaaS description): LCS 6 (ハードウェア) → 6, Dice 0.29 → 0.20, ed 0.44 → 0.60; the 「…に加えて，」 skeleton is gone (Rule A measured ed 0.48 / Dice 0.53 with its own normalisation; same direction). This is the purpose of L1 and it is achieved.

### U1.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[0](クラウドコンピューティング).one_*` (+ definition_*) | M1 | Yes (§U1.3) | No | OK |
| p04–p06 | `terms[0].points[2].text_*` (mix, 2019h31h-q030) | M1 | Yes (§U1.3) | No | OK |
| p07–p09 | `terms[0].fig.data.b.jp/zh/en` | M1 | Yes (§U1.3) | No | OK |
| p10–p12 | `key_points_*[0]` (+ summary.key_points_*[0]) | M1 | Yes (§U1.3) | No | OK |
| p13–p15 | `overview_rows[0].one_line_*` | M1 | Yes (§U1.3) | No | OK |
| p16–p18 | `goals_*[0]` (+ overview.intro_*) | M1 | Yes (§U1.3) | No | OK |
| p19–p21 | `pairs[1].rows[0].a_*` | L1 | Yes: 「ハードウェアと OS・ミドルウェア」/「硬件以及操作系统、中间件」/ "Hardware, the OS and middleware" = `overview_rows[2].extra_jp[0]` 「ハードウェアと OS などの実行基盤」; content unchanged (PaaS: hardware + OS + middleware by the provider), and it still agrees with the IaaS layer table (rows[1] OS・ミドルウェア: PaaS 事業者) | No | OK |
| p22–p24 | `terms[3](IaaS).analogy_*` | L2 | Yes: 「柱と壁だけが仕上がった建物を借り、内装や家具は自分でそろえる」 — the building (= hardware resources) belongs to the lessor and the tenant fits the interior (= OS and above), matching `one` / fig (サーバ・ストレージ・回線 = 事業者, OS から上 = 利用者). The "rent land + power / water, bring your own building" image of u03 ハウジング is gone (grep 空き地 / 通了水电 / bare plot 0) | No | OK |
| p25 | `terms[2](PaaS).hook_zh` (+ memory_hook_zh, summary.memory_hooks_zh[2]) | L3 | Yes: 「在英语里和车站的「站台」（platform）是同一个词」 — now says the identity holds for the English word, so it no longer reads as 平台 = 站台 in Chinese. The rest of the hook (站台由铁路公司修好…) is unchanged; pairing 0 bad | No | OK |
| p26 | `terms[0].detail_en` (+ explanation_en) | L4 | Yes: "which makes it easier to keep the up-front cost … low" = jp 「抑えやすい」 (tendency) / zh 「容易压低」 | No | OK |
| p27 | `pairs[0].rows[2].a_zh` | L11 | Yes: 「业务人员」 = jp 「業務の担当者」 (people doing the work), no longer a manager reading; b cell 「应用程序的开发者」 parallel | No | OK |

### U1.3 Focused checks — M1 (cloud no longer limited to provider-owned facilities)

- **After (三語)**:
  - one: 「…IT 資源を、ネットワークの向こう側 (多くは事業者の設備) に用意されたものから**必要なときに必要な量だけ**使う利用形態」/「服务器、软件等 IT 资源准备在网络另一端（多数是服务商的设施），使用者**在需要时只取用所需的量**」/ "IT resources … that are set up across the network (usually in a provider's facilities), drawing on them **only when you need them and only as much as you need**". The exclusive 「自社で持たず」/「不自己持有」/ "without owning them" is gone; the provider's facilities are now the usual case, not the definition. zh also fixes the time / amount ambiguity of 「需要时按需取用」 (Rule A table note).
  - points[2]: on-premises is separated from 「事業者の資源を借りて使う形態」/「租用服务商资源的使用形态」/ "renting a provider's resources" by the owner of the equipment. The subject is no longer クラウドコンピューティング, so the 考点 does not say that every cloud differs from on-premises by owner.
  - fig column b: 「事業者のクラウドを借りる」/「租用服务商的云」/ "Renting a provider's cloud". The 4 rows (owner サービス事業者 / no equipment purchase to start / pay by amount or period / change by contract or setting) hold for public cloud and also for a private section rented in a provider's facility (u02 `terms[1].detail`), so the column is accurate for everything it now covers.
  - key_points[0]: 「IT 資源をネットワーク越しに使い、事業者から借りる場合は機器を自社で持たずに済み…」 — "need not own" is now conditional on renting from a provider, in all three languages.
  - overview_rows[0].one_line: 「ネットワーク越しに必要な分だけ使う」 — provider dropped; the row's columns (事業者が用意する範囲 = サービスモデルによって異なる) still apply to service models.
  - goals[0] (+ overview.intro): 「事業者から借りる**クラウドコンピューティング**と**オンプレミス**を、資源の持ち主と料金の払い方で見分けられる」 — the owner comparison is now scoped to the rented cloud, like u02's own compare fig (オンプレミス vs **パブリッククラウド**, 設備を用意し管理する者 = 自社 / クラウド事業者).
- **vs cited questions** (re-read):
  - 2018h30a-q009 (イ: provision of computer resources as a service model): `points[0]` unchanged and still states it; no field supports ア / ウ / エ (protocol, development method, EDI standard).
  - 2021r03-q005 (ウ: resources over the network, on demand, scalable): `points[1]` unchanged; the new one / key_points / one_line (ネットワーク越し, 必要なときに必要な量だけ, 後から増減) say the same. ア (centralized mainframe), イ (EUC), エ (distributed processing) stay unsupported.
  - 2019h31h-q030 (イ オンプレミス: own system in facilities the company manages, run by itself): detail 3rd sentence and `points[2]` still define on-premises as 自社の設備 + 自ら運用 (limit condition kept). ウ クラウドコンピューティング stays excludable: the new one places cloud resources 「ネットワークの向こう側」 and drawn on demand, and the fig / points[2] contrast on-premises with renting from a provider.
  - 2015h27h-q020 (ア SaaS), 2017h29a-q011 (エ), 2015h27a-q005 (ア), 2009h21h-q006 (ウ): SaaS fields untouched; the L1 patch moved `pairs[1].rows[0]` away from q011 ウ (Dice 0.29 → 0.20).
- Bold and `[[jp:]]` counts unchanged in all 18 M1 fields. Parity 23 / 0 diff. **u01: M1 and L1–L4 / L11 resolved.**

## U2. strategy-06-20-u02 (Rule A PASS, 建議修 L1)

### U2.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 4 → 4 (事業者の, 2015h27a-q005 エ) | 4; win12 0/0 → 0/0; Dice 0.13 → 0.12 |
| p02 | zh | 5 → 5 (服务商的设, unchanged) | 5 |
| p03 | en | 20 → 20 ("e provider's facilit", unchanged) | 20 |

No patch adds any overlap.

### U2.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[0](パブリッククラウド).points[0].text_*` | L1 | Yes: 「事業者の設備を他の利用者と分け合う」/「与其他用户分享服务商的设备」/ "share the provider's facilities with other users" — the sharers are no longer narrowed to companies, matching `one` 「不特定多数の利用者」/「不特定多数用户」/ "many unspecified users" and `pairs[0].rows[0].a` 「不特定多数の利用者と共用」. The second sentence (dedicated environment = private cloud side) is unchanged | No | OK |

### U2.3 Focused checks

- mix 考点 without qid, 2 sentences, 60 chars (≤100). The en sentence now has "users" twice ("Users of a public cloud … with other users"); clear, not a defect. zh 「的用户要与其他用户」 likewise. grep 他社 / 其他公司 / other companies 0. Parity 25 / 0 diff. **u02: L1 resolved.**

## U3. strategy-06-20-u03 (Rule A PASS, 建議修 L1)

### U3.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 4 → **7** (システムの開発, 2013h25h-q004 stem) | 7 (same); win12 0/0 → 0/0; Dice 0.25 → 0.30 (vs 2009h21a-q017 イ) |
| p02 | zh | 3 → **5** (系统的开发, 2013h25h-q004 stem) | 5 (same) |
| p03 | en | 15 → **20** (" system development ", 2010h22a-q003 ウ) | 20 (same) |

- The rises are the noun phrase "system development", which is the content L1 adds on purpose (outsourcing includes development, per 2013h25h-q004). Targeted vs q004 stem (`tgt_run.mjs`): LCS 4 → 7, Dice 0.18 → 0.28, ed 0.82 → **0.90**, win12 0/0. q004 is a classification question (offshore outsourcing = development and operation entrusted to an overseas company / subsidiary); the cell does not name 海外 / 子会社 or the term and does not restate the stem's frame. Not a D-198 issue.

### U3.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `pairs[0].rows[1].b_*` (SI / アウトソーシング, 頼む対象の例) | L1 | Yes: 「給与計算の代行や、システムの開発・運用の委託」/「代为核算工资，或委托系统的开发与运维」/ "Payroll processing, or outsourcing system development and operation" — development is now in the outsourcing example, so the example row no longer reads as 構築 = SI / everything else = アウトソーシング. It agrees with the key row (rows[0].b 「開発・運用・事務などを含む業務の外部委託全般」) and with 2013h25h-q004. zh 「代算工资」 is replaced by 「代为核算工资」 (loc LOW also fixed) | No | OK |

### U3.3 Focused checks

- Not a 考点 (pairs cell). Row key=false; the key row is unchanged. a cell (新しい販売管理システムの構築) is unchanged; the example still shows SI as a package build while b now overlaps it on development, which is exactly the inclusion the key row states. Parity 28 / 0 diff. **u03: L1 resolved.**

## X. Cross-unit check — cloud-form axes after u01 M1 (u01 / u02 / u03, 三語)

| Axis | u01 (after patch) | u02 | u03 | Contradiction? |
|---|---|---|---|---|
| Location | one: resources 「ネットワークの向こう側 (多くは事業者の設備)」; points[1] / hook: 置き場所を意識せず | private cloud detail: 自社のデータセンター or 事業者の設備の一部を専用区画; points[0]: 置き場所で決まらない; overview_rows[1]: 自社内、または事業者内の専用区画 | ホスティング / ハウジング = 事業者の施設 (no cloud claim) | No — u01 no longer implies that cloud is never in-house |
| Dedicated vs shared | no general claim (SaaS detail: 多くの利用企業が共同で使う = SaaS only) | public = 不特定多数で共用; private = 1 組織が専有 | — | No |
| Owner | owner contrast scoped to renting: points[2] 「事業者の資源を借りて使う形態」, fig b 「事業者のクラウドを借りる」 (owner サービス事業者), key_points[0] 「事業者から借りる場合は」, goals[0] 「事業者から借りる」 | on-prem fig: オンプレミス (自社) vs パブリッククラウド (クラウド事業者); on-prem points[1]: own site + own operation + cloud technology for one organization = may also be called private cloud | オンプレミス (u03 points[1]) = 自社で管理する設備 + 自ら運用 | No — u01's own vs provider contrast now covers only the rented cloud, the same scope as u02's fig; an in-house private cloud falls outside it. The exclusive wording (自社で持たず / 不自己持有 / without owning / 「クラウドコンピューティングとは設備の持ち主で分かれる」) is 0 in u01 |
| Who operates | on-prem = 自ら運用 (detail, points[2]); IaaS / PaaS / SaaS = who manages each layer | on-prem = 自社で運用; managed service = operation is a separate axis, 自社の設備、または事業者の設備 | on-prem = 自ら運用 (vs アウトソーシング) | No new conflict. Pre-existing tension (on-prem + outsourced operation) is u03 L2 記録のみ; not touched by these patches |

- On-premises wording on the owner axis: u01 detail 「自社で保有・管理する設備」 / points[2] 「自社の設備」, u02 one 「自社が管理する施設」, u03 points[1] 「自社で管理する設備」, 2019h31h-q030 「自社が管理する設備内」. Rule A u01 §2-3 judged these 一致; no patch touches them, and none is narrower than the q030 limit in a way that changes its answer.
- **Discriminating test**: does any u01 field still assert that cloud *excludes* own facilities? After the patches, none does in any language (greps above). The remaining provider-framed u01 text is `terms[0].points[0]` (exam 考点, 2018h30a-q009: 「コンピュータ資源を事業者が用意して利用者に使わせる…形態」 / zh 「由服务商准备计算机资源」 / en "a provider prepares computer resources"), `terms[0].detail` 2nd sentence (事業者がどの層まで用意するか → サービスモデル) and `overview_cols_jp[0]` 「事業者が用意する範囲」. These describe the provider role in the service-model frame. They do not say "only", do not say who owns the facilities or where they are, and Rule A reviewed `points[0]` (§2-2 "正答の内容を定義として述べる", D-209) and kept it out of M1 on purpose. So they do not contradict u02's in-house private cloud; not a new MEDIUM. Recorded in §5 Obs. 2.
- u02 / u03 were not changed on these axes (u02 p01–p03 only widen 他社 → 他の利用者; u03 p01–p03 only add development to an outsourcing example). u02 zh / en private cloud one / detail / points and the on-prem fig read the same as jp (三語 checked). u03 ASP detail (「u01 で学んだ SaaS と同じ系統」) still matches u01 SaaS (unchanged).

## 4. F-fix

No required F-fix in any of the 3 units. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - validate: 0 warns in all 3 units (unit and part).
   - `stage` meta is removed in all 3 units (as in b19–b66).
   - ruleA verbatim miss = none. 13 of 33 patches use shortened phrases; same.mjs shows all 33 give the same field as the Rule A strings.
   - u01 p07–p09 net remnant 25 / 10 / 3 = headword occurrences outside the fig (the `before` is the old column label, which was the bare headword); fig hits 0 (§1).
   - Bases: u01 `a1` / `loc.r0`, u02 `a2` / `loc.r0`, u03 `a2` / `loc.r1`. u02 patch paths carry a label (`terms[0](パブリッククラウド)…`); it resolves in check.mjs / d198.mjs / same.mjs.
2. u01 `terms[0].points[0]` (exam, 2018h30a-q009), `detail` 2nd sentence and `overview_cols_jp[0]` still frame cloud as resources a 事業者 prepares (service-model frame). They make no ownership / location / exclusivity claim and Rule A deliberately left them outside M1 (§X), so they do not contradict u02's in-house private cloud. If u01 is touched again, a hedge such as 「多くは事業者が用意し」 in `points[0]` would match the new `one`; nothing requires it.
3. u01 one_zh 「IT 资源准备在网络另一端（多数是服务商的设施）」 is slightly stiff (准备在 used as a passive). It is the text Rule A M1 prescribed and the meaning is clear (= jp 「用意されたもの」). Not re-ruled.
4. u01 fig column b now says 「事業者のクラウドを借りる」 while column a stays the term オンプレミス; mixing a term and a phrase as headers is acceptable for a compare fig and parity is 0 diff. All 4 rows also hold for a hosted private cloud (provider-owned, dedicated).
5. u02 p03 en "Users of a public cloud … with other users" repeats "users"; zh likewise. Clear; not a defect.
6. D-198 rises: u01 p02 / p11 +2 (generic zh noun phrases, 2011h23a-q005 stem), p13 +2 (をネットワーク), p15 / p25 +1, p24 +2 (letter-boundary coincidence), p16 +2 unmasked headword windows (masked 0); u03 p01–p03 +3 / +2 / +5 ("system development", the content L1 adds; vs q004 ed 0.82 → 0.90). All analysed in §U1.1 / §U3.1. Several patches lower overlap (p04 win12 17 → 0, p07 Dice 1.00 → 0.26, p19 Dice 0.29 → 0.20).

## 6. Overall verdict

| Unit | Rule A | Applied | MEDIUM in scope | HIGH / MEDIUM / LOW introduced | Verdict |
|---|---|---|---|---|---|
| strategy-06-20-u01 | FAIL (M1) | **27/27** | M1 resolved (cloud no longer limited to provider-owned facilities in one / points[2] / fig / key_points[0] / one_line / goals, 三語; owner contrast scoped to renting from a provider = u02 fig scope; q009 / q005 / q030 still answered correctly) | 0 / 0 / 0 | **PASS** |
| strategy-06-20-u02 | PASS | **3/3** | — | 0 / 0 / 0 | **PASS** |
| strategy-06-20-u03 | PASS | **3/3** | — | 0 / 0 / 0 | **PASS** |

- **Application:** 33/33 exact (replay, part-level). 0 unexplained diffs, net `before` remnants 0 except u01 p07–p09 (headword uses outside the fig, explained), derived fields follow (174 checked, 0 mismatch), memory_hooks pairing 0 bad. 13/33 shortened, and all 33 give the same field as the Rule A string (same.mjs). Every MEDIUM and 建議修 is covered.
- **D-198:** no patch adds a meaningful overlap. The rises are generic noun phrases (u01 p02 / p11 / p13 / p15 / p24 / p25) or the content the LOW adds on purpose (u03 "system development"; vs q004 ed 0.90). u01 L1 moves away from 2017h29a-q011 ウ (Dice 0.29 → 0.20, ed 0.44 → 0.60).
- **D-200:** patched 考点 u01 `terms[0].points[2]` (mix, qid kept) 1 sentence 63 chars; u02 `terms[0].points[0]` (mix) 2 sentences 60 chars; no 考点 claim reversed. **D-202:** `[[jp:]]` origin miss 0 in all 3 units; bold / tag counts unchanged in all 33. **D-204 / 書き方 7:** u01 ↔ u02 cloud-form axes no longer conflict (§X); u01 IaaS analogy no longer overlaps u03 ハウジング; u03 example row now agrees with its key row. **D-205 / D-210:** no new law, standard, version or numeric claim; u01 M1 removes an exclusive reading.
- **Gates:**
  - validate --unit ×3: 0 issues / EXIT 0 (0 warns)
  - validate --part ×3: 0 issues, sha256 = base_sha256 for each
  - parity ×3: 0 diff (23 / 25 / 28 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS for all 3 units.** All 33 active patches are applied exactly, and the MEDIUM and every 建議修 LOW are resolved in context in all three languages:
- u01 p01–p18: cloud is defined as resources used over the network, usually in a provider's facilities; the own-vs-provider owner contrast now applies only to renting from a provider (points[2], fig, key_points[0], goals[0]), which is the same scope as u02's on-premises vs public-cloud fig and leaves room for u02's in-house private cloud. 2018h30a-q009 / 2021r03-q005 / 2019h31h-q030 remain answerable from the unit.
- u01 p19–p27: PaaS cell no longer follows 2017h29a-q011 ウ; IaaS analogy is a shell building, not land + utilities; PaaS zh hook, en detail tendency and zh 业务人员 fixed.
- u02 p01–p03: public cloud sharers are 他の利用者 / 其他用户 / other users, matching `one`.
- u03 p01–p03: the outsourcing example includes system development, matching the key row and 2013h25h-q004.

None of the patches introduces a HIGH, MEDIUM or LOW. No required F-fix.
