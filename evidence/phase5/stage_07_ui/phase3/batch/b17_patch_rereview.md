# b17 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditors' context; Rule D)
- Date: 2026-11-05 (Session 143)
- Scope: B3 wording patches for technology-22-58-u01 (p01–p25), u02 (p01–p08), u03 (p01–p14), u04 (p01–p12), u05 (p01–p19)
  — 78 `active`, 0 retired (`patches/technology-22-58-u01.json` … `-u05.json`), checked against the Rule A findings
  (`technology-22-58-u01.ruleA.md` **M1**–**M4**, L1–L4; `-u02` L1–L4; `-u03` **M1**–**M3**, L1, L2; `-u04` **M1**, L1–L4; `-u05` **M1**, **M2**, L1–L6) and the merged units
  `data/ip/textbook/units/technology-22-58-u0{1..5}.json` (sha256 u01 `85bfb78f26dae248…`, u02 `3b18336b10e54445…`, u03 `6cf3fc2226d46968…`,
  u04 `f48c5e86a31ff4a2…`, u05 `c1488108700ab919…`).
- Pre-patch bases located by sha256 = `base_sha256`: `.planning/v2/<U>/parts/b17-u01-a1/…loc.r1.json` (`2ea51930…`), `b17-u02-a3/…loc.r0.json` (`ebcafca1…`), `b17-u03-a2/…loc.r1.json` (`21597615…`), `b17-u04-a2/…loc.r0.json` (`f807d51c…`), `b17-u05-a1/…loc.r0.json` (`6ee4dda4…`) (all 5 match).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, and the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names).

## 0. Method

Same as `b16_patch_rereview.md` §0 (= b14 / b15 §0), topic technology-22-58:

1. Application check (script): every string field of base and merged unit is walked. Each `after` (raw and notation-stripped) must appear in its field; `before` must not survive anywhere; every string that differs between base and unit (for paths present in the base) must be explained by a patch.
2. Derived-field check from the same walk (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`, `summary.memory_hooks_*`) — every term and key point of the 5 units, not only the patched ones.
3. D-198 (jp patches): LCS, 12-char window with ≤2 substitutions with and without masking (katakana runs ≥4 and alnum masked), semi-global edit distance normalised by unit-text length (ed), best same-length-window bigram Dice (wDice). Sources: stem (`stem_jp_clean`, fallback `stem_jp`) + all choices of every technology-22-58 question (87; 438 source strings), plus the three fill-in-the-blank stems of the topic **with the blanks filled by the correct answer** (2019h31h-q061 a=LAN / b=WAN / c=プライベートIPアドレス, 2019h31h-q086 遅く / 少ない, 2026r08-q076 広く / 少ない). 2014h26a-q056, 2018h30h-q072 and 2020r02o-q098 are item-list combination stems (items already in the stem). Normalisation differs from the Rule A scripts (this script counts ≤2-substitution windows), so absolute values differ from the Rule A files; before → after is measured with one script. zh / en patches: LCS against the zh / en translation sidecars of all topic questions.
4. D-195 / D-200 via validate.
5. Manual reading of each patched field in context (whole term + overview row + pairs + key_points + goals); meaning judged against the cited questions' `correct_answer`.
6. `scripts/textbook-v2-validate.mjs` / `scripts/textbook-v2-parity.mjs` per unit; `npx vitest run src/lib/textbook`.

Not established: as in b14–b16, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: u01 147, u02 142, u03 136, u04 115, u05 117) were checked for the derived copies (step 2) and for the patched texts.

## 1. Script results (fresh, 2026-11-05)

```
✓ technology-22-58-u01 unit: 0 issues   validate exit 0 | parity: 32 locations, 0 diff  exit 0
✓ technology-22-58-u02 unit: 0 issues   validate exit 0 | parity: 34 locations, 0 diff  exit 0
✓ technology-22-58-u03 unit: 0 issues   validate exit 0 | parity: 29 locations, 0 diff  exit 0
✓ technology-22-58-u04 unit: 0 issues   validate exit 0 | parity: 23 locations, 0 diff  exit 0
✓ technology-22-58-u05 unit: 0 issues   validate exit 0 | parity: 24 locations, 0 diff  exit 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

No warnings in any of the 5 units.

Application: 78/78 `after` present in their fields. `before` remnants anywhere in the units (raw or stripped): 0. Unexplained base → unit diffs in base-present paths: 0 per unit (only the `stage` meta key removed).

Derived fields follow: u01 p13 / p14 → `key_points_jp/zh[1]` + `summary.key_points_*[1]` carry the same remaining sentence, p22 / p23 → `terms[2].definition_zh / _en`; u02 p06 → `terms[1].memory_hook_en` + `summary.memory_hooks_en[1]`; u03 p12–p14 → `terms[5].explanation_*`; u05 p17 → `terms[3].definition_en`. Full walk of all terms: `definition / explanation / memory_hook` = notation-stripped `one / detail / hook` — 0 mismatches in all 5 units; `summary.key_points_*` = stripped `key_points_*` — 0 mismatches. `points[*]`, `fig.*`, `pairs`, `overview_rows`, `overview_cols` have no derived copy.

Notation counts, before → after, every patched field: bold and `[[jp:]]` unchanged except the intended changes, and after patching every patched location has equal bold counts in jp / zh / en and equal `[[jp:]]` counts in zh / en:
- u02 p04 / p05 `[[jp:ゲスト用の接続機能]]` 1 → 0 in zh and en (L2); u02 p07 / p08 bold 1 → 2 in zh and en (= jp 2, L4).
- u04 p05 / p06 `[[jp:無線LAN]]` 1 → 0 in zh and en (L1, 無線 LAN no longer named).
- u05 p05 `[[jp:Bluetooth]]` 1 → 0 in zh (M2; en had 0 before, so zh / en are now 0 / 0); u05 p18 `[[jp:PLC]]` 1 → 0 in zh (L6; en had 0, now 0 / 0).

D-198, before → after (one script; jp patches only; topic-wide + filled stems):

| Patch | Nearest source | LCS | ed | wDice | 12-char windows unmasked / masked | Longest overlap after patch |
|---|---|---|---|---|---|---|
| **u01 p01** (M1) | 2014h26a-q056 stem | 8 → 6 | 0.64 → 0.70 | 0.37 → 0.26 | **2 / 0 → 0 / 0** | `通信事業者と` |
| **u01 p04** (M2) | 2017h29h-q084 ア → 2019h31h-q061 filled | 7 → 4 | 0.74 → 0.78 | 0.31 → 0.20 | 0 / 0 → 0 / 0 | `く離れた` |
| **u01 p07** (M3) | 2017h29h-q096 ウ | 7 → 7 | 0.76 → 0.65 | 0.21 → 0.26 | 0 / 0 → 0 / 0 | `ネットワークが` (remaining 1st sentence, unchanged) |
| **u01 p10** (M4) | 2017h29h-q085 ウ / 2019h31h-q058 stem | 12 → 12 | 0.72 → 0.74 | 0.27 → 0.23 | 11 / 0 → 11 / 0 | term デフォルトゲートウェイ + particle (obs. 6) |
| u01 p13 (L1) | 2013h25a-q071 エ / 2014h26h-q052 stem | 6 → 6 | 0.78 → 0.64 | 0.30 → 0.41 | 0 / 0 → 0 / 0 | `通信事業者の` (unchanged 1st sentence) |
| u01 p16 (L2) | 2016h28h-q071 ア (correct) | 7 → 8 | **0.49 → 0.67** | **0.47 → 0.32** | 0 / 0 → 0 / 0 | `回線交換方式では` |
| u01 p19 (L3) | 2009h21a-q082 / 2020r02o-q095 stem | 4 → 4 | 0.81 → 0.83 | 0.17 → 0.12 | 0 / 0 → 0 / 0 | `伝送速度` |
| u02 p01 (L1) | 2015h27a-q066 stem | **14 → 6** | 0.66 → 0.67 | 0.37 → 0.38 | **7 / 0 → 0 / 0** | `リンクランプ` |
| **u03 p01** (M1) | 2019r01a-q077 エ → 2018h30a-q096 stem | **12 → 9** | **0.60 → 0.78** | **0.45 → 0.27** | **3 / 1 → 0 / 0** | `無線LANの規格は` (2011h23tokubetsu-q082 stem) |
| **u03 p04** (M2) | 2024r06-q070 ウ (correct) | **12 → 6** | 0.65 → 0.81 | 0.38 → 0.19 | **6 / 0 → 0 / 0** | `ESSIDは` |
| u03 p09 (L1) | 2023r05-q065 ア | 7 → 7 | 0.77 → 0.76 | 0.23 → 0.27 | 0 / 0 → 0 / 0 | `パスフレーズで` |
| u03 p12 (L2) | 2011h23tokubetsu-q061 stem | 11 → 11 | 0.74 → 0.77 | 0.24 → 0.24 | 14 / 0 → 14 / 0 | `複数のアクセスポイント` (unpatched 2nd / 3rd sentences) |
| **u04 p01** (M1) | 2013h25a-q071 エ | 5 → 5 | 0.79 → 0.83 | 0.17 → 0.14 | 0 / 0 → 0 / 0 | `サービスを` |
| u04 p04 (L1) | 2026r08-q076 filled / stem | 5 → 6 | 0.75 → 0.77 | 0.27 → 0.19 | 0 / 0 → 0 / 0 | `少ない電力で` (2019r01a-q071 エ) |
| u04 p07 (L2) | — (2-char column head) | 2 → 1 | — | 0.20 → 0.00 | 0 / 0 → 0 / 0 | — |
| u04 p08 (L3) | 2017h29h-q096 ウ | 4 → 8 | 0.79 → 0.71 | 0.13 → 0.24 | 0 / 0 → 0 / 0 | `してネットワーク` |
| **u05 p01** (M1) | 2026r08-q076 **filled** | 6 → 9 | **0.56 → 0.72** | **0.43 → 0.30** | 0 / 0 → 4 / 0 | `は無線LANと比べ` (2019h31h-q086 stem; obs. 3) |
| **u05 p04** (M2) | 2022r04-q092 ウ / stem | 10 → 7 | 0.69 → 0.81 | 0.33 → 0.18 | **4 / 0 → 0 / 0** | `ことを繰り返し` |
| u05 p07 (L1) | 2019h31h-q086 **filled** | 6 → 6 | 0.57 → 0.72 | **0.54 → 0.33** | 0 / 0 → 0 / 0 | `は無線LAN` |
| u05 p10 (L2) | 2023r05-q071 ウ → 2021r03-q086 ウ | 9 → 12 | 0.75 → 0.77 | 0.35 → 0.28 | 0 / 0 → 11 / 0 | term エッジコンピューティング + particle (obs. 4) |
| u05 p13 (L3) | 2015h27h-q050 stem | 4 → 4 | 0.73 → 0.79 | 0.21 → 0.17 | 0 / 0 → 0 / 0 | `建物の中` |
| u05 p14 (L4) | 2026r08-q081 stem | **16 → 10** | **0.16 → 0.41** | **0.83 → 0.57** | **7 / 0 → 1 / 0** | `Bluetoothの` (22-char cell; obs. 5) |

Masked windows after patching: 0 on every patched jp text (u03 p01 had 1 before). The calibration HIGH (ed 0.14 / Dice 0.52) is not reached by any patched text after patching except the u05 p14 22-char pairs cell (wDice 0.57 vs 2025r07-q056 stem, short-cell artefact, ed 0.41, masked 0; obs. 5). New unmasked windows (u05 p01, p10, p14) are term names + particles or the generic comparison phrase 「無線 LAN と比べた」; no sentence frame of any stem or choice. Patches reduce pre-existing overlaps: u01 p01 (q056 stem windows 2 → 0), u01 p16 (q071 correct ア, wDice 0.47 → 0.32), u02 p01 (q066 stem LCS 14 → 6, windows 7 → 0), u03 p01 (q077 エ, LCS 12 → 9, masked 1 → 0), u03 p04 (q070 ウ, LCS 12 → 6), u05 p04 (q092 stem windows 4 → 0), u05 p07 (q086 filled wDice 0.54 → 0.33), u05 p14 (q081 stem LCS 16 → 10, ed 0.16 → 0.41). The D-198 (iii) choice-set reproductions behind u01 M1–M4, u03 M1 / M2, u04 M1, u05 M1 / M2 are gone (§3).

zh / en after-spans: longest overlaps with the sidecars are generic phrases or term names (u01 p03 " a contract with a " 19 chars vs 2014h26a-q056 stem en; u01 p12 " the default gateway " = the term; u01 p21 " transmission efficiency " = the term; u03 p03 " each wireless lan standard " 27 chars vs 2015h27a-q076 stem en, about a different statement; u05 p03 "…th-generation mobile " vs 2026r08-q076 stem en = the name of 4G). One answer-content phrase: u03 p06 " the risk of unauthorized connections " (37 chars) = 2024r06-q070 correct ウ en — the standard phrase for the stealth feature's effect, shortened by the patch (before: "…the risk of unauthorized connections to an access point"); obs. 7.

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01–p03 | `terms[0](LAN).points[0].text_*` | **M1** | **Yes** (§3.1) | LOW 建議修 F1 (jp comma) | OK, fix advised |
| u01 | p04–p06 | `terms[1](WAN).points[2].text_*` | **M2** | **Yes** (§3.2) | No | OK |
| u01 | p07–p09 | `terms[2](通信回線).points[2].text_*` | **M3** | **Yes** (§3.3) | No | OK |
| u01 | p10–p12 | `terms[6](NIC).points[1].text_*` | **M4** | **Yes** (§3.4) | No (obs. 6) | OK |
| u01 | p13–p15 | `terms[1](WAN).points[0].text_*` | L1 | Yes: the q091 wrong-choice negation (domestic sites / not only international) is gone in all three; the remaining 1st sentence supports q071 / q091 correct answers | No | OK |
| u01 | p16–p18 | `terms[2](通信回線).points[1].text_*` | L2 | Yes: parallel with q071 correct ア broken (wDice 0.47 → 0.32); 経路を他の利用者と分け合わない = dedicated route; 速さや品質を一定に保ちやすい still answers q071 ア; links to fig compare row (混み具合) | No | OK |
| u01 | p19–p21 | `terms[3](伝送路).analogy_*` | L3 | Yes: trucks carrying cargo = user data, escort vehicles = control data — same image as `detail_*` (制御用のデータなども流れる); the congestion image is gone (D-204 agrees) | No | OK |
| u01 | p22, p23 | `terms[2].one_zh / _en` (+ definition) | L4 | Yes: 相隔两地 / "in separate locations" = jp 離れた | No | OK |
| u01 | p24 | `terms[0].points[1].text_zh` | L4 | Yes: 以集线器（[[jp:ハブ]]）这种集线设备为中心 — apposition resolved | No | OK |
| u01 | p25 | `terms[4].points[0].text_en` | L4 | Yes: "link light … comes on" natural en; `[[jp:リンクランプ]]` kept | No | OK |
| u02 | p01–p03 | `terms[0](ハブ).points[2].text_*` | L1 | Yes: q066 wrong-choice scenes (other LAN devices / internet) gone; stem phrase broken (LCS 14 → 6, windows 7 → 0); q066 correct エ (physical wiring to the hub) still supported; zh 线缆 per zh_terms | No | OK |
| u02 | p04, p05 | `terms[2](ルーター).points[2].text_zh / _en` | L2 | Yes: descriptive `[[jp:]]` removed in zh and en (0 / 0) | No | OK |
| u02 | p06 | `terms[1](スイッチ).hook_en` (+ memory_hook, summary) | L3 | Yes: = jp「切り替える」, added clause gone | No | OK |
| u02 | p07, p08 | `terms[0](ハブ).points[1].text_zh / _en` | L4 | Yes: bold 2 / 2 / 2 | No | OK |
| u03 | p01–p03 | `terms[1](Wi-Fi).points[1].text_*` | **M1** | **Yes** (§3.5) | No | OK |
| u03 | p04–p06 | `terms[5](ESSID).points[1].text_*` | **M2** | **Yes** (§3.6) | No (obs. 7) | OK |
| u03 | p07, p08 | `terms[6](MACアドレス).points[0].text_zh / _en` | **M3** | **Yes** (§3.7) | No | OK |
| u03 | p09–p11 | `terms[1](Wi-Fi).points[2].text_*` | L1 | Yes: the negation of q065 ウ / エ's premise (PSK = network name) gone in all three; the remaining sentence supports q065 correct ア; ESSID ≠ encryption stays in `terms[5].points[0]` | No | OK |
| u03 | p12–p14 | `terms[5](ESSID).detail_*` (+ explanation) | L2 | Yes: the negation of challenge 2015h27a-q076 item a (fixed value) is gone; ESSID = SSID alias added (needed for 2022r04-q068's ゲスト SSID); 32 文字以内で自由に付けられる still contradicts item a; detail stays 3 sentences | No | OK |
| u04 | p01–p03 | `terms[2](5G).points[1].text_*` | **M1** | **Yes** (§3.8) | No | OK |
| u04 | p04–p06 | `terms[2](5G).points[2].text_*` | L1 | Yes: the q076 comparison-partner pair (無線 LAN / 4G) is gone; 少ない電力で広い範囲をカバー still lets q076 (広く / 少ない) be answered; en now 1 sentence; zh / en `[[jp:無線LAN]]` 1 → 0 each (parity 0) | No | OK |
| u04 | p07 | `overview_cols_jp[1]` | L2 | Yes: 要点 = zh 要点 / en "Key point"; §9 phrase gone | No | OK |
| u04 | p08–p10 | `terms[3](伝送速度).points[1].text_*` | L3 | Yes: ネットワーク / 网络 / network = q096 correct ウ's scope (no longer narrowed to the line); zh subject 使用量 | No | OK |
| u04 | p11 | `terms[3].points[0].text_zh` | L4 | Yes: divisor (实际速率) named first, = jp 伝送速度に伝送効率を掛けた実効速度で割って; `[[jp:]]` 3 → 3 | No | OK |
| u04 | p12 | `terms[2].points[0].text_en` | L4 | Yes: `[[jp:高速大容量]]` now annotates "higher speed and capacity", not LTE | No | OK |
| u05 | p01–p03 | `terms[1](LPWA).points[1].text_*` | **M1** | **Yes** (§3.9) | No (obs. 3) | OK |
| u05 | p04–p06 | `terms[2](BLE).points[0].text_*` | **M2** | **Yes** (§3.10) | No (obs. 2) | OK |
| u05 | p07–p09 | `terms[1](LPWA).points[0].text_*` | L1 | Yes: q086 filled-stem phrase parallel broken (wDice 0.54 → 0.33); the reason (power and reach before speed) comes first and agrees with `one` / `hook`; q086 correct ウ (遅く / 少ない) and 2020r02o-q070 correct イ (slower than mobile) still supported | No | OK |
| u05 | p10–p12 | `terms[4](エッジ).points[2].text_*` | L2 | Yes: both sides stated positively on one axis (where processing is placed); q071 wrong ウ's sentence form gone (wDice 0.35 → 0.28); 2023r05-q071 correct ア / 2019r01a-q071 correct イ / 2021r03-q086 correct ウ still supported | No (obs. 4) | OK |
| u05 | p13 | `pairs[0].rows[0].b_jp` | L3 | Yes: 建物の中に収まる程度 = zh 同一房间或建筑物内 / en "within a room or building" | No | OK |
| u05 | p14–p16 | `pairs[0].rows[2].b_*` | L4 | Yes: q081 stem phrase broken (LCS 16 → 10, ed 0.16 → 0.41); same meaning (BLE is a spec of Bluetooth) = `one_*` (Bluetooth に追加された…仕様) | No (obs. 5) | OK |
| u05 | p17 | `terms[3](ビーコン).one_en` (+ definition) | L5 | Yes: "near the beacon" = jp その装置の近く; "it" ambiguity gone | No | OK |
| u05 | p18, p19 | `terms[0].points[0].text_zh`, `terms[2].points[1].text_zh` | L6 | Yes: PLC no longer doubled (zh / en `[[jp:]]` 0 / 0); 附近的 natural zh | No | OK |

## 3. Focused checks

### 3.1 u01 M1 — resolved; the new claim is supported

- Old point restated q056 items ①②③ as a set (② negated, ① and ③ restated). New: 「LAN は範囲が限られるので、通信事業者と契約しなくても使う組織や家庭が自分で構築できる。LAN かどうかはつなぐ範囲で決まり、ケーブルか無線かでは決まらない。」 / zh / en same. Item ① (TV / game consoles, "not limited to PCs") is gone in all three languages; ② and ③ are now consequences of the definition rather than a restatement of the item list (q056 stem windows 2 → 0, wDice 0.37 → 0.26).
- 「LAN かどうかはつなぐ範囲で決まり」: this is the definition already taught in `one_*` (限られた範囲にある機器どうしをつなぐ), `hook` (Local) and `terms[1].points[2]` / `hook` (L か W かで範囲が分かれる) — not a new generalisation; it restricts nothing beyond the definition. 「ケーブルか無線かでは決まらない」 supports q056 ③ (cable or wireless both used) without re-staging the item's wording. 「範囲が限られるので…自分で構築できる」 = `detail_*` (範囲が限られるため、利用する組織や家庭が自分で…構築し). q056 correct ウ (①③) remains answerable; ① now rests on `one_*` (機器どうし, no device restriction) — the auditor's design (「① には触れない」); no wrong choice (②-containing ア / イ / エ) supported.
- F1 (LOW 建議修, §4): jp lacks the comma after 契約しなくても, so 「契約しなくても使う組織」 can be parsed as a relative clause; the same sentence in `key_points_jp[0]` has the comma.

### 3.2 u01 M2 — resolved

- The q084 wrong-choice ア scene (own lines / same site / several buildings → "not a WAN") is gone in all three languages. New: the criterion stated positively (建物をいくつまたぐかではなく、離れた地域の拠点どうしを結ぶかどうか). Supported by q084 correct ウ (headquarters and a branch in another prefecture) and agrees with `one_*` (離れた場所にある拠点どうし), `points[1]`. 「通信事業者の回線で」 is deliberately not made the criterion (would be stronger than `detail`'s 一般的) — no new restriction. Overlap with `points[1]` 1st sentence recorded by Rule A L7.

### 3.3 u01 M3 — resolved

- The 2nd sentence (negating q096 wrong ア / イ and over-generalising "packet loss is a different phenomenon") is deleted in all three languages; the remaining sentence = q096 correct ウ's standard definition (zh / en full sentences checked: 拥塞（[[jp:輻輳]]）…而使通信停滞的状态。 / "…and communication stalls."). The unsupported generalisation (congestion never loses packets) is gone.

### 3.4 u01 M4 — resolved; the NIC / default-gateway claim is supported

- Old point = q049's scene + correct answer + "NIC is not that role's name" (wrong イ negation). New: NIC's scope stated positively (自分の機器を LAN につなぐところまで = `one_*` LAN につないで通信できるようにする部品, `points[0]` from 2011h23a-q058) and the default gateway defined positively in u02's own wording (u02 `terms[3].one_jp`: 宛先が自分のネットワークの外にあるとき、端末がまずパケットを渡す出口にあたる機器の役割で、通常はルーターが担う). 「別の機器が担う」 = u02's ルーター; ルーター is not named (u02 term), as prescribed. q049 correct ア still supported; no "NIC ≠ name" negation remains in any language.
- Not an unsupported restriction: q049's stem frames it as "no specific route information"; 「宛先が LAN の外にあるとき」 is the default-gateway definition used across the topic (u02 one, 2019h31h-q058). The 11 unmasked windows are the term デフォルトゲートウェイ + particle, same count before and after (obs. 6).

### 3.5 u03 M1 — resolved; the 802.11a / b band claim is correct

- Old point reused q077 wrong エ's opening (無線LANの規格は複数あ…) and negated it. New: 「無線LANの規格は使う周波数帯が規格ごとに決まっていて、例えば5GHz帯だけを使う 802.11a の機器と2.4GHz帯だけを使う 802.11b の機器は互いに通信できない。」 — エ's opening and construction are gone (LCS 12 → 9, masked window 1 → 0, wDice 0.45 → 0.27).
- Facts: 802.11a = 5 GHz band only, 802.11b = 2.4 GHz band only, so a- and b-only devices cannot interoperate — correct (IEEE 802.11a-1999 / 802.11b-1999). 「規格ごとに決まっていて」 also holds for dual-band standards (802.11n / ac / ax define their bands) and is presented with 例えば, so it does not claim all different standards are incompatible (802.11g ↔ b compatibility is not contradicted). Not a version-bound count / structure claim (D-205 n/a). Agrees with 2018h30a-q096 (the 2.4 / 5 GHz bands) and 2011h23tokubetsu-q082 (802.11n is a wireless LAN standard, `points[0]`). zh / en = jp (只用 5GHz 频段的 802.11a 设备… / "an 802.11a device, which uses only the 5 GHz band, cannot talk to an 802.11b device…").

### 3.6 u03 M2 — resolved; the stealth claim is correct

- Old point = q070 correct ウ paraphrase + negation of wrong ア (encryption) and イ (authentication) in order. New: 「ステルス機能は名前を一覧に出さず接続先として見つかりにくくするだけで、やり取りの電波を拾えば ESSID は分かるため、不正接続のリスクを下げる対策にとどまる。」 — no 暗号 / 認証 / 加密 / 认证 / encrypt / authenticat in `terms[5].points[1]` in any language (grep 0). q070 correct ウ, 2015h27a-q056 correct ア (stealth as a security measure) and 2016h28h-q074 correct エ (stops sending ESSID; = `detail_*` 3rd sentence) supported; LCS with q070 ウ 12 → 6, windows 6 → 0.
- Mechanism: with stealth the AP stops advertising the ESSID, but the ESSID still travels in clear in client probe / association traffic, so it can be captured — a plain general fact, and the reason the effect is only risk reduction. Not an unsupported generalisation; it does not claim stealth is useless (にとどまる keeps q056 ア true).

### 3.7 u03 M3 — resolved

- zh 以此按全世界不重复的原则来分配编号 / en "MAC addresses are allocated so that no two in the world are the same" now express the allocation principle, = jp 世界中で重複のない番号として割り当てる仕組み and 2016h28h-q068 correct ア (allocated so that only one exists); the existence claim ("is unique worldwide") is gone. jp unchanged.

### 3.8 u04 M1 — resolved; 「MVNO も 5G で提供できる」 is supported

- Old point's positive content was the definition of q073 wrong イ (MVNO) + "different from 5G". New: both sides stated positively on two axes (5G = name of a generation of communication method = `one_*` / `hook`; MVNO = operator form) plus their compatibility. q073 イ's scene (MVNO as the name of a mobile communication system) is not re-staged; correct エ (5G) supported; wrong ア / ウ not mentioned.
- 「自社の設備を持つ事業者も、他社の回線を借りる MVNO も、5G の回線でサービスを提供できる」: plain general fact — MVNOs provide service over a host MNO's network, including its 5G network. It is a "can" statement (no count / structure, D-205 n/a), not cited to a question, and the auditor added it deliberately (u01 M4 pattern). MVNO is glossed in zh at first mention (MVNO（虚拟移动网络运营商）). zh / en = jp.

### 3.9 u05 M1 — resolved with the writer's deviation (no numbers)

- The writer used 「LPWA は近距離向けの無線 LAN よりずっと広い範囲に届く。電力が少ないのは無線 LAN と比べたときだけでなく、第 4 世代の携帯電話の通信 (4G) と比べても同じである。」 instead of the auditor's 「数 km 以上 / 数十〜百 m 程度」. The Rule A file explicitly allows this: 「B3 で採らない場合は「近距離向けの無線 LAN」に置き換えても可」. Not adopting numbers that no cited question carries is the safer choice (D-205 / unsupported-figure risk avoided).
- Does it still break q076's construction? q076 pairs range ↔ 無線 LAN and power ↔ 4G. The new text keeps range ↔ 無線 LAN (as the auditor's own text did) but states power against **both** 無線 LAN and 4G, so the stem's exclusive pairing is gone and the point carries information beyond the two blanks (無線 LAN is short-range; LPWA beats 無線 LAN on power too, extending `points[0]`). Measured against the filled stem: wDice 0.43 → 0.30, ed 0.56 → 0.72, LCS 6 → 9 (`は無線LANと比べ`, against q086's stem, not q076), 12-char windows vs q076 filled 0 / 0 — the same distance the auditor reported for his numeric version (Dice 0.30 / ed 0.75). Not a copy of the filled stem.
- Correctness: wider range than 無線 LAN (q076 a = 広く), less power than 4G (q076 b = 少ない) and than 無線 LAN (2019h31h-q086 b = 少ない) — all supported by the cited correct answers; 「近距離向けの無線 LAN」 is a general fact and consistent with `pairs[0]` / `overview_rows`. q076 correct エ supported, ア〜ウ (狭く / 多い) not supported. zh / en = jp (远大于近距离使用的无线局域网… / "far beyond short-range wireless LAN…"). Residual phrase order (range first, 4G last) recorded as obs. 3.
- u04 L1 (same q076) now names neither comparison partner (少ない電力で広い範囲をカバーできる) — consistent with u05 M1; the two units no longer both restate the filled stem.

### 3.10 u05 M2 — resolved; the BLE power mechanism is correct

- Old point = q092's stem premise (added in 4.0) + correct イ (coin cell, long time) + negation of wrong ウ (compatible with 3.0) in the question's order. New: 「BLE は少量のデータを短く送っては休むことを繰り返して電力を抑えるので、ボタン電池でも長期間動き続けられる。」 — the 4.0 premise and the compatibility negation are gone in all three languages (4.0 remains in `detail_*`); q092 windows 4 → 0, wDice 0.33 → 0.18.
- Mechanism: BLE saves power by short, infrequent transmissions (connection / advertising events) with the radio asleep in between — plain general fact; agrees with `detail_*` (少量のデータをときどき送る), the analogy (用があるときだけ小声で一言; D-204 agrees) and `pairs[0].rows[1]`. q092 correct イ supported; ア / ウ / エ not touched.
- zh drops `[[jp:Bluetooth]]` (Bluetooth no longer mentioned in the sentence); zh / en `[[jp:]]` now 0 / 0, `one_zh` still carries 蓝牙（Bluetooth）, validate 0 / parity 0 diff — acceptable as stated in the scope.

### 3.11 Other requested checks

- Dropped qualifiers / new restrictions: none found. u01 p04 keeps 「一般的」 out of the criterion; u04 p08 widens 回線 → ネットワーク to the cited answer's scope; u03 p01 uses 例えば; u05 p01 keeps 無線 LAN and 4G.
- D-204: no analogy / hook now carries content the patched points deny (LAN water pipes, WAN railway, 伝送路 trucks / escort vehicles, NIC front door, BLE quiet word — all agree).
- D-205: no patch adds a version-bound count / structure claim (802.11a / b bands are fixed properties of those amendments).
- D-200: validate 0 issues in all 5 units (patched jp points 35–86 chars; u03 ESSID detail 135 chars / 3 sentences, unchanged count).

## 4. Observations

**F1 — LOW 建議修, u01 `terms[0](LAN).points[0].text_jp` punctuation.** 「通信事業者と契約しなくても使う組織や家庭が自分で構築できる」 can be read as 「契約しなくても使う組織」 (organisations that use it even without a contract) because the concessive clause has no comma; the intended reading (= zh 所以不必与…签约，使用它的组织或家庭自己就能搭建 / en "…by the organization or household that uses it, without a contract…") and the same sentence in `key_points_jp[0]` (契約しなくても、利用する組織や家庭が) have the comma. Not MEDIUM: no fact changes, both readings are true. The text is Rule A M1's prescribed jp verbatim, so this is a refinement of the auditor's text. Fix (no derived copy; bold 0 / `[[jp:]]` 0 unchanged; zh / en unchanged; D-198 unchanged — punctuation is normalised away):

- `terms[0](LAN).points[0].text_jp`: 「LAN は範囲が限られるので、通信事業者と契約しなくても使う組織や家庭が自分で構築できる。LAN かどうかはつなぐ範囲で決まり、ケーブルか無線かでは決まらない。」 → 「LAN は範囲が限られるので、通信事業者と契約しなくても、使う組織や家庭が自分で構築できる。LAN かどうかはつなぐ範囲で決まり、ケーブルか無線かでは決まらない。」
  Patch form: the F1 span lies inside p01's replaced text, and `scripts/textbook-v2-patch.mjs` refuses a `before` that overlaps an earlier active patch's replaced text in the same field. So: **retire p01** and register a replacement on the same base (`2ea51930…`), field `terms[0](LAN).points[0].text_jp`, before = p01's `before` (`LAN は通信事業者と契約しなくても自分たちで構築できる。つなぐ機器は PC に限られず、接続にはケーブルも無線も使える。`) → after = the corrected string above, reason "Rule A M1 + b17 re-review F1". zh / en (p02 / p03) stay as they are.

Records only, no fix:

1. LOW, u01 M1: q056 item ① (non-PC devices) is no longer stated in the cited point; it rests on `one_*` (機器どうし). Auditor's design; q056 remains answerable (① is the true item and nothing in the unit denies it).
2. LOW, u05 BLE `points[0]` vs `detail_*`: ボタン電池でも長期間動き続けられる is repeated from `detail` 1st sentence (書き方 8 / §9 class); the point's new information is the mechanism.
3. LOW, u05 M1 residual order: range ↔ 無線 LAN still comes first and 4G last, as in q076; the exclusive pairing is broken by "power vs both", which is the auditor's own construction. The 4 new unmasked windows are the generic phrase 「無線 LAN と比べたとき」 against 2019h31h-q086's stem (masked 0).
4. LOW, u05 p10: the 11 new unmasked windows are the term エッジコンピューティング + particle (2019r01a-q071 / 2023r05-q071 stems, 2021r03-q086 correct ウ); masked 0, no sentence frame.
5. LOW, u05 p14: the 22-char pairs cell has wDice 0.57 vs 2025r07-q056 stem and 1 unmasked window (Bluetoothの一部) vs 2026r08-q081 stem — BLE's standard positioning in the shortest wording; masked 0, ed 0.41 (> calibration). Same treatment as b16 obs. 5 / b15 u08 p01 short label. Strongly reduced from before (ed 0.16 / wDice 0.83, which was near the calibration HIGH).
6. LOW, u01 p10: 11 unmasked windows = the term デフォルトゲートウェイ + particle against 2016h28h-q078 / 2017h29h-q085 ウ / 2019h31h-q058 stems, same count before and after; masked 0.
7. LOW, u03 p06 en: " the risk of unauthorized connections " (37 chars) = 2024r06-q070 correct ウ en — the answer's content in its standard phrasing (jp 不正接続のリスクを下げる is accepted by Rule A M2), shortened by the patch.
8. LOW, u03 p01 spacing: 「例えば5GHz帯だけを使う 802.11a の機器」 mixes no-space (5GHz帯) and spaced (802.11a) alnum runs; matches the unit's existing 「2.4GHz帯は5G…」 style, validate silent.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM introduced or remaining from patched findings: **0** (u01 M1 §3.1, M2 §3.2, M3 §3.3, M4 §3.4; u03 M1 §3.5, M2 §3.6, M3 §3.7; u04 M1 §3.8; u05 M1 §3.9, M2 §3.10 resolved)
- LOW introduced: 建議修 1 (F1, u01 LAN points[0].text_jp comma); 記録のみ 8 (obs. 1–8)
- D-198: no copying in patched texts (masked windows 0 on all patched jp texts topic-wide incl. the three filled stems; remaining unmasked windows are term names + particles or a generic comparison phrase); the q056 / q084 / q096 / q049 / q077 / q070 / q073 / q076 / q092 choice-set or scene reproductions are removed
- validate 5/5 = 0 issues (0 warnings), parity 5/5 = 0 diff (32 / 34 / 29 / 23 / 24 locations), vitest textbook 162/162

**PASS** — all 78 active patches are applied with derived fields following, the 10 MEDIUM findings (u01 M1–M4, u03 M1–M3, u04 M1, u05 M1–M2) are resolved, the new claims (LAN decided by area, not by cable / wireless; NIC's scope vs the default gateway; 802.11a / b band incompatibility; stealth hides the name but the ESSID can be captured; MVNOs can also offer 5G; LPWA wider than short-range 無線 LAN and lower power than both 無線 LAN and 4G; BLE's intermittent transmission) are supported by the cited questions' correct answers or are plain general facts without unsupported generalisation or restriction, no patched text copies a question (including the filled stems), trilingual parity and `[[jp:]]` / bold counts are consistent, and no new HIGH / MEDIUM is introduced. The u05 M1 deviation from the auditor's numbers is allowed by the Rule A file and still resolves M1. F1 is advised, not required by the PASS condition. If applied, re-run validate / parity and record it as a patch.
