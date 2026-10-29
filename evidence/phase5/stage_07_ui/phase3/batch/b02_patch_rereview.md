# b02 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer; Rule D)
- Date: 2026-10-29 (Session 137)
- Scope: 28 B3 wording patches replayed at merge for technology-23-63-u06..u10
  (`patches/technology-23-63-u{06,07,08,09,10}.json`), checked against the Rule A findings
  (`technology-23-63-u{06..10}.ruleA.md` §3) and the merged units `data/ip/textbook/units/technology-23-63-u{06..10}.json`.
- Severities: D-195 / D-199 / D-202 / D-203 (critic recalibration in session-137: rule 8 / §6 / §9 restatement = low; rule 7 = medium; rule 9 = high).

## 0. Method

1. Application check (script): every string field in the unit is walked. For each patch, `after` (raw and notation-stripped: `**` and `([[jp:…]])` removed) must appear, and `before` must not survive anywhere (outside a field that already contains `after`).
2. Derived-field check: the same walk lists every location of `after`, so derived compat fields (`memory_hook_*`, `summary.memory_hooks_*`, `explanation_*`, `overview.intro_*`, `summary.key_points_*`) are confirmed to follow.
3. D-198 check: longest common substring (normalized, punctuation/whitespace removed) between each new/changed exam-point or analogy sentence and the full JSON (stem + choices) of every cited qid in `data/ip/quiz/questions.json`.
4. D-200: char count (whitespace removed) and sentence count for changed `points[].text_jp`.
5. Manual reading of each patched field in context (one / detail / points / pairs / other analogies of the same unit) for rule 7, rule 9, trilingual parity, §9 phrases, naturalness.
6. `scripts/textbook-v2-validate.mjs --unit <id>` and `scripts/textbook-v2-parity.mjs --unit <id>` for the 5 units.

## 1. Script results (fresh, 2026-10-29)

```
✓ technology-23-63-u06 unit: 0 issues        (exit 0)   ✓ parity: 31 locations, 0 diff (exit 0)
✓ technology-23-63-u07 unit: 0 issues        (exit 0)   ✓ parity: 30 locations, 0 diff (exit 0)
✓ technology-23-63-u08 unit: 0 issues        (exit 0)   ✓ parity: 33 locations, 0 diff (exit 0)
✓ technology-23-63-u09 unit: 0 issues        (exit 0)   ✓ parity: 27 locations, 0 diff (exit 0)
✓ technology-23-63-u10 unit: 0 issues        (exit 0)   ✓ parity: 32 locations, 0 diff (exit 0)
```

Application check: 28/28 `after` present, 0/28 `before` remnants. Derived locations found:

| Patch | `after` found at |
|---|---|
| u06 p01–p03 | `terms[3].hook_*`, `terms[3].memory_hook_*`, `summary.memory_hooks_*[3]` |
| u07 p01–p03 | `terms[0].analogy_*` (no derived analogy field exists) |
| u07 p04 | `terms[6].hook_en`, `terms[6].memory_hook_en`, `summary.memory_hooks_en[1]` |
| u08 p01 | `overview_rows[4].extra_en[1]` |
| u08 p02 | `terms[5].points[0].text_jp` |
| u08 p03–p05 | `terms[6].hook_*`, `terms[6].memory_hook_*`, `summary.memory_hooks_*[5]` |
| u08 p06–p08 | `terms[6].detail_*`, `terms[6].explanation_*` |
| u09 p01–p03 | `terms[2].points[0].text_*` |
| u10 p01–p03 | `goals_*[0]`, `overview.intro_*` |
| u10 p04–p06 | `key_points_*[1]`, `summary.key_points_*[1]` |
| u10 p07–p09 | `terms[1].analogy_*` |
| u10 p10 | `terms[5].points[1].text_en` |

D-198 longest common substring with cited qids (normalized):

| Text | qid | LCS | Judgement |
|---|---|---|---|
| u08 p02 (48 chars, 1 sentence) | 2025r07-q088 | 物理的セキュリティ対策に (12) | term name; identical tail existed in `before` → not introduced; validate D-198 0 |
| u09 p01 (81 chars, 2 sentences) | 2010h22a-q062 / 2011h23a-q085 / 2016h28h-q093 / 2018h30h-q091 | 利用者が使 / の認証で / 利用者が / 利便性が高 (≤5) | no copying |
| u08 p06 | 2014h26a-q051 | 毎回異なる (5) | the premise paraphrased (intended by L4), no copying |
| u07 p01 | 2013h25h-q080 | なもの (3) | none |

D-200: changed exam points u08 T5 p0 = 48 chars / 1 sentence; u09 T2 p0 = 81 chars / 2 sentences → within ≤2 sentences / ≤100 chars.

## 2. Per-patch verdict

| Unit | ID | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u06 | p01 | `terms[3].hook_jp` | L1 (asymmetric stated as the English name) | Yes: 「とも呼ぶ」= alias; also drops 「と覚える」(part of L2) | No | OK |
| u06 | p02 | `terms[3].hook_zh` | L1 | Yes: 「英语也叫」 | No | OK |
| u06 | p03 | `terms[3].hook_en` | L1 | Yes: "It is also called asymmetric cryptography", consistent with `term_en` Public-key cryptography | No | OK |
| u07 | p01 | `terms[0].analogy_jp` | **M1** (analogy depicted entrance lock = BIOS-password side) | Yes (see §3) | No | OK |
| u07 | p02 | `terms[0].analogy_zh` | M1 | Yes; 「即使连保险箱一起被搬走」natural | No | OK |
| u07 | p03 | `terms[0].analogy_en` | M1 | Yes | No | OK |
| u07 | p04 | `terms[6].hook_en` | L1 (en generalized to all "authority") | Yes: scoped to names containing "authority", matching jp 「「認証局」と付けば」/ zh; "always" (§9 exaggeration) removed | No | OK |
| u08 | p01 | `overview_rows[4].extra_en[1]` | L1 (blurs identification vs authentication) | Yes: wording now identical to `goals_en[0]` "confirming it is really that person"; jp/zh unchanged and consistent | No | OK |
| u08 | p02 | `terms[5].points[0].text_jp` | L2 (`[[jp:入退室管理]]` origin absent in jp) | Yes: 「ICカードによる入退室管理は」now contains 入退室管理 literally | No (D-198 see §1) | OK |
| u08 | p03 | `terms[6].hook_jp` | L3 (hook restated one; no name cue) | Yes: gives the literal meaning of one-time | No (the literal meaning overlaps `one_jp`「1回の認証にだけ使える」, but name-meaning hooks are accepted per D-195 §6; net reduction vs before) | OK |
| u08 | p04 | `terms[6].hook_zh` | L3 | Yes | No | OK |
| u08 | p05 | `terms[6].hook_en` | L3 (en "never the same twice" overstated) | Yes: overstatement removed | No | OK |
| u08 | p06 | `terms[6].detail_jp` | L4 (position "differs each time" implicit) | Yes: 「毎回異なる位置を指定され、その数字を入れる方式」makes the 2014h26a-q051 premise explicit | No; passive 「指定され」with implied user subject is natural | OK |
| u08 | p07 | `terms[6].detail_zh` | L4 | Yes: 「每次指定的不同位置上的数字」 | No | OK |
| u08 | p08 | `terms[6].detail_en` | L4 | Yes: "at positions, different each time, specified on…" | No | OK |
| u09 | p01 | `terms[2].points[0].text_jp` | L1 (rule-9 prevention: "permitted services only") | Yes: qualifier now explicit, consistent with `one_jp`「利用を認められた複数のサービス」 | No (81 chars / 2 sentences) | OK |
| u09 | p02 | `terms[2].points[0].text_zh` | L1 | Yes | No | OK |
| u09 | p03 | `terms[2].points[0].text_en` | L1 | Yes | No | OK |
| u10 | p01 | `goals_jp[0]` | L1 (5 methods read as exhaustive) | Yes: 「この単元で扱う」 | No; `overview.intro_jp` follows | OK |
| u10 | p02 | `goals_zh[0]` | L1 | Yes: 「本单元所讲」 | No | OK |
| u10 | p03 | `goals_en[0]` | L1 | Yes: "covered in this unit" | No | OK |
| u10 | p04 | `key_points_jp[1]` | L1 | Yes: 「この単元の 5 つの方式」; D-197 「5 つ」exception unaffected (validate 0) | No | OK |
| u10 | p05 | `key_points_zh[1]` | L1 | Yes | No | OK |
| u10 | p06 | `key_points_en[1]` | L1 | Yes | No | OK |
| u10 | p07 | `terms[1].analogy_jp` | L2 (kaleidoscope implies changing pattern) | Yes: 「世界に一枚しかない手織りの布の柄」= fixed and unique; no longer contradicts `detail_jp`「ほとんど変わらない」/ T4 points[0] | LOW-cosmetic only (§4 obs. 1) | OK |
| u10 | p08 | `terms[1].analogy_zh` | L2 | Yes | LOW-cosmetic: 「织着一块…手织布花纹」slightly redundant (§4 obs. 1) | OK |
| u10 | p09 | `terms[1].analogy_en` | L2 | Yes | LOW-cosmetic: "one-of-a-kind … that no one else shares" redundant (tail inherited from `before`) | OK |
| u10 | p10 | `terms[5].points[1].text_en` | L3 (FTE term too narrow) | Yes: "failure-to-recognize rate" matches existing quiz translations/explanations for 2021r03-q069 ("Failure to Recognize Rate") and jp definition | No | OK |

## 3. u07 M1 focused check

- New image: 書庫を丸ごと大きな金庫にする / 金庫ごと運び出されても、開けられない人には読めない (zh/en equivalent).
- `terms[0].points[0]` (2013h25h-q080): entrance checks (startup / OS login password) stop working once the drive is removed; what protects the contents themselves is disk encryption. The new analogy has the protection travelling with the container: carrying the safe (= the drive) off does not make the documents readable. This is the same direction as points[0] ("取り出しても読めない") and no longer depicts the entrance-lock (BIOS password) side. **Conflict resolved.**
- Consistency with other fields: `detail_*` (key in a tamper-resistant chip; removing the drive alone cannot decrypt) — consistent. `pairs[0].rows[2]` (disk = unprotected once data leaves the disk / file = stays encrypted) and `terms[1].analogy_jp` (ファイル暗号化 = 鍵付きの小箱、小箱ごと渡しても開かない) — whole-room safe vs per-document box gives a coherent contrast; documents taken out of the safe being unprotected matches rows[2]. No rule-7 conflict.
- Guard (b): the analogy does not contain the term's own operation (暗号化). OK.
- Neighbour overlap: u06 L3's optional "金庫" analogy was NOT adopted (u06 analogies unchanged: 置き換え表 / 鍵付きの箱 / 南京錠 / トランク / 指紋), so no 金庫 overlap between adjacent units.

## 4. Observations (not blockers)

1. LOW-cosmetic, u10 p07–p09: 「手織りの布の柄」+「生まれつき身に着けている」mixes a made object with an innate trait; zh 「织着一块…手织布花纹」and en "one-of-a-kind … that no one else shares" are mildly redundant. Meaning is clear, no fact or cross-field conflict. 「生まれつき」vs `detail_jp`「幼いころに出来上がった」is inherited from the pre-patch text (not introduced). Optional future polish only.
2. u08 p03–p05: the new hook's literal meaning ("1回限り") overlaps `one_*` (「1回の認証にだけ使える」). This is the name-meaning cue the Rule A finding asked for; §6 restatement would be LOW at most and is smaller than before.
3. §9 phrase check on all `after` strings: no 「と覚える」/ 定型締め句 / "always" / "never" introduced (u06 and u07 patches remove one each).

## 5. Overall verdict

- HIGH introduced or remaining from patched findings: 0
- MEDIUM introduced or remaining: 0 (u07 M1 resolved)
- LOW introduced: cosmetic only (§4 obs. 1)
- validate 5/5 = 0 issues, parity 5/5 = 0 diff

**PASS** — all 28 patches applied with derived fields following; each resolves its named finding; no new HIGH/MEDIUM.
