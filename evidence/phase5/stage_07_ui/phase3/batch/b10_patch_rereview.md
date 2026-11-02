# b10 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer; Rule D)
- Date: 2026-11-02 (Session 140)
- Scope: B3 wording patches for technology-22-60-u01 (p01–p06), u02 (p01–p16), u03 (p01–p15), u04 (p01–p15), u05 (p01–p16)
  — 68 `active`, 0 retired (`patches/technology-22-60-u01.json` … `-u05.json`), checked against the Rule A findings
  (`technology-22-60-u01.ruleA.md` L1–L2; `-u02` L1–L7; `-u03` M1, L1–L6, L11, L12; `-u04` L1–L6; `-u05` L1–L6) and the merged units
  `data/ip/textbook/units/technology-22-60-u0{1..5}.json` (sha256 u01 `6746f91245afaa1c…`, u02 `2dcff95b4b97aee5…`, u03 `35d65fb68461f541…`,
  u04 `40f47ebce12b9915…`, u05 `fcb8fae5f40abbd0…`). u04 contains its patches (merged file 15:38; hash unchanged at the end of this review).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, and the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names).

## 0. Method

Same as `b09_patch_rereview.md` §0, topic technology-22-60:

1. Application check (script): every string field is walked; each `after` (raw and notation-stripped) must appear, and `before` must not survive outside a field that already contains `after`.
2. Derived-field check from the same walk.
3. D-198: normalized LCS, 12-char window with ≤2 substitutions, with and without katakana / alnum masking, for each changed jp text (fragment and whole field) against stem + choices of every qid cited in the unit, and against all 97 questions of the topic. Semi-global edit distance and bigram Dice; for named near-matches also Dice against the best same-length window of the source text.
   Stems are `stem_jp_clean`; 58 of the 97 have none and use `stem_jp` (display-layer fallback), including 2025r07-q058, 2014h26h-q071, 2023r05-q092, 2017h29a-q012, 2014h26h-q074, 2017h29h-q068, 2018h30h-q031, 2017h29a-q093.
   Normalization differs slightly from the Rule A scripts, so absolute ed / Dice values differ from the figures in the Rule A files; before → after is measured here with one script.
4. D-195 / D-200 via validate.
5. Manual reading of each patched field in context; meaning judged against the cited question and its `correct_answer`.
6. Cross-unit zh, u01–u05: zh word preceding `[[jp:X]]`, and per-unit counts of the patched words and alternatives.
7. `scripts/textbook-v2-validate.mjs` / `scripts/textbook-v2-parity.mjs` per unit; `npx vitest run src/lib/textbook`.

Not established: reverse-applying the patches and re-serializing did not reproduce `base_sha256` on any unit (the hash's input form was not investigated). This review therefore shows the patches are present, not that nothing else changed since the base.

## 1. Script results (fresh, 2026-11-02)

```
✓ technology-22-60-u01 unit: 0 issues   validate exit 0 | parity: 26 locations, 0 diff  exit 0
✓ technology-22-60-u02 unit: 0 issues   validate exit 0 | parity: 31 locations, 0 diff  exit 0
✓ technology-22-60-u03 unit: 0 issues   validate exit 0 | parity: 30 locations, 0 diff  exit 0
✓ technology-22-60-u04 unit: 0 issues   validate exit 0 | parity: 31 locations, 0 diff  exit 0
✓ technology-22-60-u05 unit: 0 issues   validate exit 0 | parity: 33 locations, 0 diff  exit 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

Application: 68/68 `after` present. `before` remnants outside the patched field: 0. Where `before` still matches inside the patched field (u02 p11, u03 p08 / p09, u05 p11), it is a substring of `after`.

Derived fields follow: `explanation_*` (u02 p15; u03 p05–p10, p13; u04 p07, p11, p12; u05 p09, p14, p16), `definition_*` (u04 p08; u05 p01, p10, p15), `overview.intro_jp` (u03 p11), `summary.key_points_*` (u04 p13–p15; u05 p02). `points[*]`, `overview_rows`, `pairs`, `fig`, `analogy_*` have no derived copy.

D-198, named near-matches, before → after (one script; wDice = best same-length window):

| Patch | Compared with | LCS | ed | wDice | Longest overlap after patch |
|---|---|---|---|---|---|
| u01 p01 | 2025r07-q058 ウ | 12 → 7 | 0.54 → 0.68 | 0.60 → 0.59 | `とIPアドレス` |
| u01 p04 | 2017h29a-q084 ウ | 4 → 2 | 0.58 → 0.75 | 0.33 → 0.09 | `同じ` |
| u02 p01 | 2010h22a-q059 stem | 16 → 14 | 0.38 → 0.48 | 0.63 → 0.45 | term name クロスサイトスクリプティング |
| u02 p04 | 2014h26h-q074 ウ | 5 → 3 | 0.76 → 0.86 | 0.34 → 0.14 | `ブログ` |
| u03 p02 | 2018h30h-q059 stem / 2023r05-q092 エ | 9 → 10 | 0.56 → 0.54 | 0.49 → 0.35 | 1 kana + term メールボックス + particle |
| u04 p01 | 2017h29h-q068 エ | 5 → 5 | 0.67 → 0.84 | 0.40 → 0.27 | term 光ファイバ |
| u04 p01 | 2009h21a-q077 stem | 8 → 5 | 0.62 → 0.68 | 0.37 → 0.29 | term 光ファイバ |
| u04 p04 | 2018h30h-q031 stem | 8 → 7 | 0.69 → 0.66 | 0.40 → 0.36 | `インターネット` |
| u04 p07 | 2017h29a-q093 イ | 10 → 6 | 0.57 → 0.71 | 0.41 → 0.22 | `移動体通信網` |
| u05 p01 | 2025r07-q071 stem | 8 → 7 | 0.63 → 0.74 | 0.48 → 0.45 | term プラチナバンド |
| u05 p02 | 2025r07-q071 stem | 7 → 7 | 0.61 → 0.73 | 0.41 → 0.36 | term プラチナバンド |
| u05 p03 | 2026r08-q064 ア | 9 → 4 | 0.45 → 0.71 | 0.53 → 0.26 | `基地局を` |

Masked 12-char windows are 0 on every changed jp text after patching, cited and topic-wide (fragment and whole field). Unmasked windows after patching appear only on term names: u02 p01 (5), u03 p02 (4), u01 p04 whole field (2, unchanged text in sentence 1), u04 p04 topic-wide (2), u04 p13 (1). Masked windows before patching on u04 p04 (2) and u04 p07 (1) are gone.

Two values do not improve clearly: u01 p01 wDice stays 0.59 (the source is a short choice made almost entirely of the three terms, in another order, ed 0.68; a standard fact, the wording Rule A L1 asked for) and u03 p02 LCS rises by one (only the term). Neither is copying.

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01–p03 | `terms[0].points[1].text_*` | L1 | Yes (§3.2) | LOW 記録のみ, §4 obs. 3–4 | OK |
| u01 | p04–p06 | `terms[3].points[0].text_*` | L2 | Yes: near-match gone | **LOW 建議修 F1** (§4) | OK, fix advised |
| u02 | p01–p03 | `terms[3].points[1].text_*` | L1 | Yes: premise kept via `cookie の中の個人情報` | No | OK |
| u02 | p04–p06 | `terms[4].points[0].text_*` | L2 | Yes: 題名や概要 = `terms[4].one_jp`, 新着記事 = `detail_jp` | No | OK |
| u02 | p07–p09 | `terms[1].points[2].text_*` | L3 | Yes (§3.3) | No | OK |
| u02 | p10–p12 | `terms[2].points[1].text_*` | L4 | Yes | LOW 記録のみ, §4 obs. 5 | OK |
| u02 | p13 / p14 | `terms[3].points[0].text_zh/en` | L5 | Yes: 等 / "for example" = jp など | No | OK |
| u02 | p15 | `terms[1].detail_zh` | L6 | Yes: first zh PC in the unit; = `zh_terms.json` | No | OK |
| u02 | p16 | `terms[0].analogy_en` | L7 | Yes | No | OK |
| u03 | p01 | `terms[1].points[1].text_en` | **M1** | **Yes** (§3.1) | No | OK |
| u03 | p02–p04 | `terms[0].points[0].text_*` | L1 | Yes: 持っていても carries the own-addresses premise | No | OK |
| u03 | p05–p07 | `terms[3].detail_*` | L2 | Yes (§3.3) | No | OK |
| u03 | p08–p10 | `terms[5].detail_*` | L3 | Yes (§3.3) | No | OK |
| u03 | p11 | `goals_jp[3]` | L4 | Yes | No | OK |
| u03 | p12 / p13 / p15 | `terms[3].points[1].text_en`, `terms[1].detail_en`, `pairs[1].rows[0].b_en` | L5 / L6 / L12 | Yes, all = jp | No | OK |
| u03 | p14 | `terms[0].points[1].text_zh` | L11 | Yes (§3.6) | No | OK |
| u04 | p01–p03 | `terms[6].points[0].text_*` | L1 | Yes (§3.4) | No | OK |
| u04 | p04–p06 | `terms[3].points[0].text_*` | L2 | Yes (§3.4) | No | OK |
| u04 | p07 | `terms[4].detail_jp` | L3 | Yes: = zh 拥有 / en "owns" | No | OK |
| u04 | p08 | `terms[5].one_zh` | L4 | Yes (§3.5) | LOW 記録のみ, §4 obs. 6 | OK |
| u04 | p09–p12 | `terms[1].points[1].text_zh`, `overview_rows[6].extra_zh[1]`, `terms[6].detail_zh`, `terms[2].detail_en` | L5 | Yes | No | OK |
| u04 | p13–p15 | `key_points_*[0]` | L6 | Yes: IP ネットワーク = `terms[1].one_*` | No | OK |
| u05 | p01 | `terms[4].one_jp` | L1 | Yes (§3.4) | No | OK |
| u05 | p02 | `key_points_jp[2]` | L2 | Yes (§3.4) | LOW-cosmetic, §4 obs. 7 | OK |
| u05 | p03 | `overview_rows[5].one_line_jp` | L3 | Yes (§3.4) | No | OK |
| u05 | p04–p06 | `terms[0].analogy_*` | L4 | Yes (§3.4) | No | OK |
| u05 | p07–p11 | zh words | L5 | Yes: 电车 → 火车 fixes the meaning; 信号范围外 = `overview_rows[6].one_line_zh` | LOW-cosmetic, §4 obs. 8 | OK |
| u05 | p12, p13, p15, p16 | en words | L6 | Yes | No | OK |
| u05 | p14 | `terms[2].detail_en` | L6 | Yes: "device" now = client throughout the unit's en | **LOW 建議修 F2** (§4) | OK, fix advised |

## 3. Focused checks

### 3.1 (a) u03 M1 — resolved

- "reveals no new addresses" = jp 新たに知られるアドレスはない = zh 不会有新的地址被人知道: same scope in all three.
- 2017h29a-q012: the sentence stays within the question's roster case. The old claim that nothing new is revealed is gone (0 hits in the unit).
- cc 考点 `terms[3].points[2]` (2020r02o-q092: use bcc for people whose receipt others should not learn of): no longer contradicted, because the sentence now limits itself to addresses and does not deny that recipients learn who was sent the mail.
- `terms[3].points[0..1]` unchanged in meaning; p12 aligns en with jp as well.

### 3.2 (b) u01 ホスト名

- Supported: 2025r07-q058 and 2014h26h-q071 correct answers both name ホスト名. 2012h24h-q073 and 2019h31h-q057 remain covered by ドメイン名. といった / 这类 / "such as" is non-exhaustive, so no new limit.
- `[[jp:ホスト名]]` origin: jp ホスト名 is in the same field (`text_jp`). zh 主机名 = u02 `terms[2]` (`detail_zh`, `points[1]`, fig). No `zh_terms.json` entry to conflict with.
- u02: compatible. u02 `terms[2]` defines ホスト名, `terms[1].detail_*` speaks of 名前 in general. u02 `terms[1].one_*` names only ドメイン名, which is narrower wording but not a denial (§4 obs. 4).
- Definition-before-use: ホスト名 is undefined in u01 and defined in u02. 「といった名前」 tells the reader its category, the sentence's contrast (MAC, auto-assignment) does not depend on it. LOW 記録のみ, as Rule A L1 foresaw (§4 obs. 3).

### 3.3 (c) Qualifiers kept, no restriction added

- u02 L3 / 2017h29h-q066: 正しい名前を入力 (premise), IP 直接指定で接続可, 最も疑われる are all present in jp / zh / en. Correct answer unaffected. No window (LCS 7).
- u03 L2 / 2021r03-q059, 2017h29a-q079: 「cc でほかに誰へ」 limits what is read in cc, so the clash with bcc is gone and the To / cc mutual visibility stays in `points[0]`. It does not say To is hidden. zh 还抄送给了谁 / en "who else was copied" match.
- u03 L3 / 2010h22h-q058: 「これとは別に」 / 另外 / "Separately" separates the attachment function (correct) from body format (the distractor's type). It adds no claim about MIME's scope.

### 3.4 (d) Near-matches and meaning

- u04 L1: 「一般家庭の中まで光ファイバで引き込む」 is factually fine: FTTH brings fiber into the premises. 家庭向け (2017h29h-q068, 2012h24h-q082) stays as 一般家庭, 局から (2009h21a-q077) stays as 局からの線; compatible with `terms[2].detail_*`. Shared-building variants are beyond this exam's level and not contradicted by a statement about ordinary households.
- u04 L2: 2018h30h-q031 (correct ISP, stem speaks of providing the network) is still answered. `terms[3].detail_*` keeps ISP の通信網, `pairs[0].rows[0]` now reads cleaner. Merged into one contrast sentence with no loss.
- u04 L3: only the phrase overlapping wrong choice イ changed; ownership meaning unchanged.
- u05 L1: same definition, reordered; 700MHz / 900MHz, 通称, 日本の携帯電話 all kept. u05 L2: low frequency → bends → connects well, same causal claim; correct answer (低い / MHz) supported. u05 L3: same mechanism; the row is ハンドオーバー while the near-matched text is a wrong choice of 2026r08-q064.
- u05 L4: 「手元のコードだけ」 / 只…手边那根线 / "only the cord at your end" now agrees with `terms[0].detail_*` and the 基地局 mix 考点 (not all wireless).

### 3.5 (e) u04 L4 and 収容局

- p08 labels 数据包 as another name for 分组 while keeping `zh_terms.json` 分组通信. `definition_zh` follows. jp / en unaffected. u01's 数据包 is now bridged.
- p12 `[[jp:収容局]]`: origin present in `terms[2].detail_jp` (電話局 (収容局)); now parallel with `detail_zh` and follows into `explanation_en`.

### 3.6 (g) Cross-unit zh, u01–u05

| Concept | zh rendering | Result |
|---|---|---|
| ホスト名 | 主机名 (u01 / u02) | one name |
| ドメイン名 | 域名 (u01 / u02) | one name |
| 通信規約 / SMTP・POP3 | 协议 (u01 `terms[1].one_zh`, u02 `terms[0].points[0]`, `terms[2].points[0]`, u03 p14, u04 `terms[1].one_zh`); 规程 = 0 in u01–u05 | p14 removes the only outlier |
| パケット | 数据包 (u01), 分组 (u04), bridged by p08 | §4 obs. 6 |
| 基地局 / 無線 LAN | 基站 (u04 / u05) / 无线 LAN (u05) | one name |
| 収容局, 光ファイバ | 电话局（端局…）, 光纤 (u04 only) | one unit |

jp says 手順 and en "procedure" for u03 p14, where zh now says 协议. The meaning is the same at this level (the cited questions treat them as protocols), and Rule A L11 asked for this. u03 附件 / 附加文件 (L10) stays a pre-existing batch candidate; no patch touches it. No patch introduces a new cross-unit divergence.

## 4. Observations

**F1 — LOW 建議修, u01 p04–p06 drop the "at the same time" qualifier.** The target of 2017h29a-q084 ウ is simultaneous use. The same question's correct エ allows moving the value to a replacement server, and the next point `terms[3].points[1]` teaches exactly that. Read literally, especially en "given to several machines", p04–p06 forbid what the next point allows. Not MEDIUM: 割り当てて使う reads naturally as concurrent, `detail_*` (同じ番号が2か所) and `pairs[1]` frame it as uniqueness, and the following point resolves it, so no answer is reversed. This is a judgement near the boundary. Fix (`同時に` alone is 3 chars; against ウ LCS 3, ed 0.74, Dice 0.14, against the old 4 / 0.58 / 0.22):

- `terms[3].points[0].text_jp`: 同じ値を複数の機器に割り当てて使うこともできない。 → 同じ値を複数の機器に同時に割り当てて使うこともできない。
- `terms[3].points[0].text_zh`: 同一个值也不能分给多台设备使用。 → 同一个值也不能同时分给多台设备使用。
- `terms[3].points[0].text_en`: Nor can the same value be given to several machines. → Nor can the same value be given to several machines at once.

**F2 — LOW 建議修, u05 p14 leaves a dangling reference.** After "the equipment a device connects to first", the next sentence's "the device" now points at the client rather than the AP. jp 機能 and zh 它的功能 refer to the AP. Fix:

- `terms[2].detail_en` (+ `explanation_en`): The next term explains what the device does. → The next term explains what it does.

Records only, no fix:

3. LOW, u01: ホスト名 appears before its definition in u02 (§3.2). The next-unit link is direct (`prerequisites`).
4. LOW, pre-existing: u02 `terms[1].one_*` names only ドメイン名 while u01 now says ドメイン名やホスト名といった名前. Not a contradiction. A later pass could widen it.
5. LOW, pre-existing: u02 `terms[2].detail_*` keeps ドメイン名の左に (no すぐ), disambiguated by its www example.
6. LOW, u04 zh: 分组 is used in `goals_zh[2]`, `terms[1].detail_zh` (with a gloss) and `terms[1].points[2]` before the bridge at `terms[5].one_zh`. The definition is the natural place.
7. LOW-cosmetic, u05 `key_points_*[2]`: jp is now two sentences with 低い周波数の電波 while zh / en stay one comparative sentence. Same meaning.
8. LOW-cosmetic, u05 `pairs[0].rows[1].label_zh`: 部署 is slightly formal beside 家庭. Meaning clear.

## 5. Overall verdict

- HIGH introduced or remaining from patched findings: 0
- MEDIUM introduced or remaining: 0 (M1 resolved, §3.1)
- LOW introduced: 建議修 2 (F1, F2); 記録のみ / cosmetic 6 (obs. 3–8; obs. 4 and 5 pre-existing)
- D-205: no patch adds a version-bound count / structure claim
- D-198: no copying (masked windows 0 on all patched jp texts, cited and topic-wide)
- validate 5/5 = 0 issues, parity 5/5 = 0 diff (26 / 31 / 30 / 31 / 33 locations), vitest textbook 162/162

**PASS** — all 68 active patches are applied with derived fields following, and M1 is resolved with no new HIGH / MEDIUM. F1 and F2 are advised, not required by the PASS condition. If applied, re-run validate / parity and record them as patches.
