# b11 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer; Rule D)
- Date: 2026-11-02 (Session 141)
- Scope: B3 wording patches for technology-22-60-u06 (p01–p09), 9 `active`, 0 retired (`patches/technology-22-60-u06.json`), checked against the Rule A findings (`technology-22-60-u06.ruleA.md` L1–L4, L11) and the merged unit `data/ip/textbook/units/technology-22-60-u06.json` (sha256 `e440084c3346c6e8…`, 59881 bytes, hash unchanged at the end of this review).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, and the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names).
- Out of scope, not touched: `data/ip/textbook/unit_minutes.json`, `apps/web/src/lib/textbook/__fixtures__/v2-units.v1terms.json`.
- Saved by the main context from the reviewer's report (the reviewer has no Write tool). The closing section "主 context 処置" was added by the main context and is not part of the review.

## 0. Method

Same as `b10_patch_rereview.md` §0, topic technology-22-60:

1. Application check (script): every string field is walked; each `after` (raw and notation-stripped) must appear, and `before` must not survive.
2. Derived-field check: `definition_* / explanation_* / memory_hook_*` and `summary.key_points_*` = the notation-stripped source.
3. Provenance: reverse-apply the 9 patches and hash; compare the unit with `.planning/v2/technology-22-60-u06/merged.json`; match `base_sha256` against the a2 parts.
4. D-198: normalized LCS, 12-char window with ≤2 substitutions, with and without katakana / alnum masking, for each changed jp text (fragment and whole field) against stem + choices of all 97 questions of the topic (485 strings). Semi-global edit distance (normalized by the shorter string) and bigram Dice; wDice = best same-length window. Stems are `stem_jp_clean`; 58 of the 97 have none and use `stem_jp`.
   Masked counts require at least 8 real characters in the 12-char window. A first pass without this gave 128 / 222 ≤2-sub hits made purely of mask matching mask (e.g. two masked katakana words against one long masked word), which are artifacts. The masked 0 below is under this rule; unmasked hits are listed separately.
   Normalization differs slightly from the Rule A scripts, so absolute values differ from the Rule A file; before → after is measured here with one script.
5. Framing: `pointFraming` from `validateV2.ts` run directly over all 12 points.
6. Manual reading of each patched field in context; meaning judged against the cited question and its `correct_answer` (2022r04-q080, 2016h28a-q070, 2015h27h-q058, 2018h30h-q099, 2026r08-q064, 2021r03-q071).
7. `scripts/textbook-v2-validate.mjs` / `scripts/textbook-v2-parity.mjs`; `npx vitest run src/lib/textbook`.

## 1. Script results (fresh, 2026-11-02)

```
✓ technology-22-60-u06 unit: 0 issues, 2 warning(s)   validate exit 0
  warn zh-term terms[0](MIMO).points[0].text_zh  ファイル → 文件 (Rule A L7)
  warn zh-term terms[2](テザリング).points[2].text_zh  携帯電話 → 手机 (Rule A L7)
✓ technology-22-60-u06 parity: 33 locations, 0 diff   exit 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
pointFraming, 12 points: jp 0 / zh 0 / en 0
```

Parity compares per-language counts of items, not meaning. It therefore does not answer the 電波 question; §3.3 judges that by reading.

Application: 9/9 `after` present in the named field. `before` remaining: 0 (raw and stripped).

Derived fields: 78 pairs checked, 0 mismatches. p08 follows into `terms[1].definition_jp`. `points[*]` have no derived copy.

Provenance, which `b10_patch_rereview.md` §0 left "not established", is established here for this unit:
- `base_sha256` `f653edd9…` = `parts/b11-u06-a2/technology-22-60-u06.loc.r1.json`. It hashes the final loc part, not the unit, which is why reverse-applying to the unit does not reproduce it.
- Reverse-applying the 9 patches to the unit reproduces `66b42284abbeb847`, the hash audited in `technology-22-60-u06.ruleA.md`.
- The unit and `merged.json` have 0 differing fields, and their raw sha256 values match.

So nothing except these 9 patches changed since the Rule A audit.

D-198, named near-matches, before → after (one script):

| Patch | Compared with | LCS | ed | Dice | wDice | Longest overlap after patch |
|---|---|---|---|---|---|---|
| p01 | 2022r04-q080 stem | 9 → 7 | 0.48 → 0.76 | 0.36 → 0.21 | 0.49 → 0.30 | `情報システムと` |
| p04 | 2016h28a-q070 ア | 11 → 3 | 0.69 → 0.89 | 0.29 → 0.04 | 0.32 → 0.05 | `PCと` |
| p04 | 2016h28a-q070 エ | 7 → 5 | 0.72 → 0.79 | 0.33 → 0.24 | 0.36 → 0.29 | term プロトコル |
| p04 clause 1 | 2016h28a-q070 ア | 11 → 3 | 0.35 → 0.84 | 0.40 → 0.06 | 0.63 → 0.11 | `PCと` |
| p04 clause 2 | 2016h28a-q070 エ | 7 → 5 | 0.45 → 0.79 | 0.41 → 0.29 | 0.48 → 0.29 | term プロトコル |
| p07 | 2016h28a-q070 ウ | 7 → 7 | 0.50 → 0.64 | 0.38 → 0.30 | 0.43 → 0.34 | term スマートフォン |
| p07 | 2015h27h-q058 イ | 7 → 7 | 0.73 → 0.76 | 0.22 → 0.22 | 0.23 → 0.22 | term スマートフォン |
| p08 fragment | 2018h30h-q099 stem | 10 → 4 | 0.42 → 0.63 | 0.36 → 0.21 | 0.61 → 0.40 | term 周波数帯 |
| p08 fragment | 2026r08-q064 ウ | 6 → 3 | 0.47 → 0.63 | 0.35 → 0.21 | 0.50 → 0.33 | `複数の` |

All are far from the HIGH calibration (ed 0.14 / Dice 0.52). Masked 12-char windows after patching: 0 on all four changed jp fields (exact and ≤2 substitutions, topic-wide). Unmasked 12-char hits: only the term name キャリアアグリゲーション in `terms[1].one_jp` (2018h30h-q099 ウ, 2022r04-q080 イ, 2026r08-q064 stem), as Rule A §1-5(b) found. Unmasked ≤2-substitution windows on the changed fragments went from 3–4 to 0. Topic-wide lowest-ed rows other than those above are short strings sharing a term or part of one (e.g. a choice that is the term テレマティクス itself, リング); none is a copying signal.

## 2. Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[6].points[0].text_*` | L1 | Yes: near-match gone (§3.1) | LOW 記録のみ, obs. 1 | OK |
| p04–p06 | `terms[2].points[1].text_*` | L2 | Yes: reversed distractor order gone (§3.2) | **LOW 建議修 F1** | OK, fix advised |
| p07 | `terms[2].points[0].text_jp` | L3 | Yes (§3.4) | No (obs. 5 slightly closer) | OK |
| p08 | `terms[1].one_jp` (+ `definition_jp`) | L4 | Yes (§3.3) | LOW-cosmetic, obs. 2 | OK |
| p09 | `terms[4].points[0].text_en` | L11 | Yes (§3.5) | No | OK |

## 3. Focused checks

### 3.1 L1「特徴である」 — supported

- 2022r04-q080: the stem describes the term by exactly this linkage of a moving body's sensors and display equipment with communication and information systems, and the correct エ is テレマティクス. The claim is what the question uses to identify the term.
- Inside the unit: `terms[6].one_jp` says the same, and `detail_jp` sentence 2 generalises it (every service rests on communication between the car's equipment and an outside system). `fig` supplies both the sensor and the display side.
- 「や」 is non-exhaustive, so 自動通報 and 距離連動保険 (no driver screen needed) are not excluded.
- 「移動体の側」 keeps the limit that separates it from the smart meter in the next point, `terms[6].points[1]`: no conflict, and the two read naturally together.
- 連動 → つながる is weaker but correct, and matches `goals_jp[2]` (what connects to what). The driver-facing part stays in `one_jp`; the old sentence did not have it either, so nothing was dropped.
- 特徴 / 特点 are not exam framing: `pointFraming` 0 / 0 / 0.
- jp / zh / en carry the same claim. No new restriction.

### 3.2 L2「1 つに決まっておらず」 — consistent with 2016h28a-q070

- The correct ウ (smartphone as router, no separate router) is answered by `points[0]` and is not touched by this clause.
- Wrong ア claims the link is limited to one method. 「1 つに決まっておらず」 directly denies that. `detail_*` keeps the concrete cases (例えば無線 LAN、USB ケーブル、Bluetooth), so the broader wording has support one field above.
- Wrong エ claims a tethering-only protocol is required. The second clause denies that.
- The explicit 無線 LAN cue in this sentence is gone. That is the trade L2 asked for, and it does not reverse any answer.
- `[[jp:無線LAN]]` left zh / en along with the word; no `[[jp:]]` origin problem (validate warnings unchanged).
- Referent: 「PC とのつなぎ方」 and en "link the PC" rely on the smartphone of the preceding point, as the old sentence did. No shift.
- Rule A L5 stays true: the three points still map onto the four choices of q070. Recorded, obs. 4.
- Modality: see F1.

### 3.3 L4 and 電波 — not a parity issue

- JP now says it bundles 周波数帯; zh / en say the 电波 / radio waves of several 频段 / bands. Same fact at this level: a frequency band is a band of radio waves.
- 電波 remains in JP in `terms[1].detail_jp` and `hook_jp`, so hook_jp's 電波 (搬送波) has no dangling reference.
- JP `one_jp` now also matches `overview_rows[1].one_line_jp`, which has no 電波 in any language.
- 2018h30h-q099 and 2026r08-q064 (both speak of radio waves, correct = this term) are still answered.
- Precedent: `b10_patch_rereview.md` §4 obs. 7, meaning-identical wording divergence = LOW-cosmetic, record only. Same here, obs. 2. zh / en are left as Rule A L4 specified.

### 3.4 L3 — qualifiers kept

「テザリングなら」 = テザリング中, 「PC 用」 = PC のために, ルータの仕事を引き受ける = works as a router. 2016h28a-q070 ウ and 2015h27h-q058 イ still match. zh / en are unchanged and carry the same fact (另买 / buy a separate one = 買い足す).

### 3.5 L11

"mobile communication ([[jp:移動体通信]]) services, such as mobile phone service" = jp 携帯電話などの移動体通信 = zh 手机等移动通信. The gloss no longer splits the noun phrase. The origin is present in `text_jp`. 2021r03-q071 (correct MVNO) is unaffected. The a1 #2 limit is kept.

## 4. Observations

**F1 — LOW 建議修, p04 / p05 modality.** The old text said a dedicated protocol 要らない. p04's 「特別なものは使わない」 is a flat statement about what is used, slightly broader than what 2016h28a-q070 エ supports (nothing tethering-specific is required of the PC), and it differs from en "calls for no special protocol". zh 「也不用为网络共享准备特别的」 has the right modality but ends on an elided object after 的, the only patch whose fluency changed shape. No answer is reversed, so this is not MEDIUM. Fix (trial on a scratch copy: validate 0 issues with the same 2 warnings, parity 33 / 0 diff; JP vs q070 エ LCS 5 = term only, ed 0.76, masked windows 0):

- `terms[2].points[1].text_jp`: …テザリングのために特別なものは使わない。 → …テザリングのために特別なものは要らない。
- `terms[2].points[1].text_zh`: …也不用为网络共享准备特别的。 → …也不需要为网络共享特别准备。

Records only, no fix:

1. LOW-cosmetic, p01–p03: 表示機器 → 画面 / 显示设备 → 屏幕 / display → screens, while `terms[6].fig.steps[3].caption_*` keeps the old word. Same referent.
2. LOW-cosmetic, p08: JP one sentence without 電波, zh / en with it (§3.3).
3. LOW-cosmetic, p06: en "link the PC" leaves the other end implicit; the preceding point names the smartphone.
4. LOW, pre-existing (Rule A L5): `terms[2].points[0..2]` still map onto the choices of 2016h28a-q070. Rule A L1's 言い直し of `one` (D-203 §9) also remains after p01; the wording changed, the restatement did not.
5. LOW, pre-existing (Rule A L10): p07's 引き受ける now also appears in `key_points_jp[1]`, slightly closer repetition. No conflict.

## 5. Overall verdict

- HIGH introduced or remaining from patched findings: 0
- MEDIUM introduced or remaining: 0
- LOW introduced: 建議修 1 (F1, two languages of one field); 記録のみ / cosmetic 3 (obs. 1–3); obs. 4–5 carried forward from Rule A
- D-205: no patch adds a version-bound count / structure claim
- D-198: no copying (masked windows 0 on all patched jp fields, topic-wide; unmasked only the term name)
- validate 0 issues, parity 33 locations / 0 diff, vitest textbook 162/162, framing 0 / 0 / 0

**PASS** — all 9 active patches are applied with derived fields following, and nothing but these patches changed since the Rule A audit (reverse-apply = `66b42284abbeb847`). No new HIGH / MEDIUM. F1 is advised, not required by the PASS condition. If applied, re-run validate / parity and record it as patches.

## 主 context 処置 (レビュー本文ではない)

F1 採用: p04・p05 retired → p10・p11 (`要らない` / `也不需要为网络共享特别准备`)。active 9。適用後 validate 0 issue・parity 0 diff・gates・local e2e 146/146。再審の再実施はなし。
