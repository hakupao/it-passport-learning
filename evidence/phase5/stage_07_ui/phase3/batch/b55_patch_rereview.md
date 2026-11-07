# b55 B3 patch re-review — strategy-05-16 u01–u04 (EC のビジネスモデル / 取引プラットフォーム / 電子決済とデータ交換 / FinTech・本人確認, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b55rv/` (`check.mjs` and `d198.mjs` derived from `b53rv/`, only the topic, the base parts and the unit list changed; `d198.mjs` adds a whole-field pass with masked jp windows and wDice; `w.mjs` lists the jp near-windows of u01 p03).
- Date: 2026-11-08 (S150 b55)
- Scope: the B3 wording patches for strategy-05-16 u01–u04. **40 are `active`, 0 retired**: u01 p01–p03 / u02 p01–p17 / u03 p01–p07 / u04 p01–p13 (`patches/strategy-05-16-u0{1..4}.json`). All are part-level; no `unit.*` patch.
  - Mapping to Rule A prescriptions (brief confirmed, no correction):
    - u01 (PASS, 建議修 L1–L3): L1 → p01; L2 → p02; L3 → p03
    - u02 (**FAIL**, MEDIUM M1 + 建議修 L1–L6): M1 → p01–p05 (analogy_zh p02 + p03 and analogy_en p04 + p05 are two replacements in one field); L1 → p06–p08; L2 → p09; L3 → p10; L4 → p11–p14 (hook_zh p12 + p13); L5 → p15; L6 → p16–p17
    - u03 (**FAIL**, MEDIUM M1 + 建議修 L1–L2): M1 → p01–p03; L1 → p04–p06; L2 → p07
    - u04 (PASS, attempt a3, D-211 (i); 建議修 L1–L6): L1 → p01–p03; L2 → p04–p06; L3 → p07–p09; L4 → p10; L5 → p11 (one replacement for the en restructure); L6 → p12–p13
  Every 建議修 and both MEDIUMs are covered. LOWs marked 記録のみ (including the optional texts for u02 L9 / L11 and u04 L7) are not patched and not re-ruled here.
- Pre-patch bases, located by sha256 = `base_sha256` (part-level; one base per unit):
  - u01 `data/ip/textbook/.planning/v2/strategy-05-16-u01/parts/b55-u01-a2/strategy-05-16-u01.loc.r0.json` `5837d9dc9de3bc75…`
  - u02 `…/strategy-05-16-u02/parts/b55-u02-a1/strategy-05-16-u02.loc.r0.json` `ae29ac2389f06156…`
  - u03 `…/strategy-05-16-u03/parts/b55-u03-a1/strategy-05-16-u03.loc.r1.json` `7801d0027d1a6444…`
  - u04 `…/strategy-05-16-u04/parts/b55-u04-a3/strategy-05-16-u04.loc.r1.json` `66a04959a2e0cdf1…`
- Merged units (current) `data/ip/textbook/units/strategy-05-16-u0N.json` sha256: u01 `c2bde2e3fe628469…` / u02 `921977db1cae345b…` / u03 `535faf1602712239…` / u04 `72da1eb116a6004b…`. They differ from their bases only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b49_patch_rereview.md` §0 (no unit-level patches in this batch). Topic strategy-05-16 has 29 questions, so there are 145 source strings per language.

1. **Application check** (`b55rv/check.mjs`): base sha256; `before` once in the base field (and once at its point in the replay, for the two-replacement fields); replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted), raw and inline-stripped; before / after verbatim in the Rule A file.
   - The main session shortened most before / after strings to the changed clause. For every patched field I compared the **whole replayed field** with the whole after-text Rule A prescribes (u02 M1 三語, u03 M1 三語, u04 L2 / L4 / L5 are the whole-sentence prescriptions): all equal (§2, §3).
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b55rv/d198.mjs`, all 40 active patches): LCS of the `before` / `after` span and of the whole field before → after against the 145 sources per language; jp 12-char windows (≤2 substitutions) unmasked / masked (katakana ≥4 and alphanumerics → □) + wDice.
4. **Cited-question checks** in `data/ip/quiz/questions.json` + translations (stem_jp_clean): 2024r06-q013 (名寄せ, answer エ; wrong ア = アカウントアグリゲーション), 2018h30h-q022 (受発注や決済など, answer ウ EDI), 2021r03-q013 (FinTech 事例, answer ウ; wrong エ = internet car insurance grades), 2026r08-q028 (escrow 低減, answer イ), 2022r04-q012 / 2017h29a-q022 (CF types), 2015h27a-q017 / 2013h25h-q017 (BtoC / BtoE).
5. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with, plus a remnant grep over every string of each unit (§3).
6. **Gates** (each on all 4 units): `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b54): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 119 / u02 135 / u03 127 / u04 140) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-16-u01
✓ strategy-05-16-u01 unit: 0 issues (data/ip/textbook/units/strategy-05-16-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-05-16-u01
✓ strategy-05-16-u01 parity: 31 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-16-u02
✓ strategy-05-16-u02 unit: 0 issues (data/ip/textbook/units/strategy-05-16-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-05-16-u02
✓ strategy-05-16-u02 parity: 30 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-16-u03
✓ strategy-05-16-u03 unit: 0 issues (data/ip/textbook/units/strategy-05-16-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-05-16-u03
✓ strategy-05-16-u03 parity: 26 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-16-u04
✓ strategy-05-16-u04 unit: 0 issues (data/ip/textbook/units/strategy-05-16-u04.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-05-16-u04
✓ strategy-05-16-u04 parity: 35 locations, 0 diff
EXIT=0
validate --part (base): u01 loc#0 0 issues (sha256 5837d9dc… = base_sha256) EXIT=0
                        u02 loc#0 0 issues (sha256 ae29ac23… = base_sha256) EXIT=0
                        u03 loc#1 0 issues (sha256 7801d002… = base_sha256) EXIT=0
                        u04 loc#1 0 issues (sha256 66a04959… = base_sha256) EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  u01 active 3 ok 3 | u02 active 17 ok 17 | u03 active 7 ok 7 | u04 active 13 ok 13 | issues [] for all 4
  base sha = base_sha256 for all 40; before count in base = 1 and at replay = 1 for all 40; replay mismatch 0
  changed base-present paths = patched fields + 'stage' (u01 3+1 / u02 14+1 / u03 7+1 / u04 13+1); unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata)
  derived checked 60 / 75 / 66 / 75, mismatch 0 (u01 terms[5].explanation_zh; u02 terms[3].explanation_jp/zh/en, terms[4].memory_hook_jp/zh/en, terms[4].explanation_zh/en; u03 terms[5].memory_hook_jp/zh/en, terms[2].explanation_zh; u04 terms[1].explanation_jp/zh/en, terms[2].memory_hook_zh, terms[0].explanation_zh: true)
  bold counts unchanged in all 40; [[jp:]] counts unchanged except u02 p16 / p17 (terms[4].detail_zh / detail_en 0→1) — intended (§3.4)
  memory_hooks hooked-terms pairing: u01 5/5, u02 7/7, u03 5/5, u04 6/6 per language, bad 0
  net before remnant: 0 for all 40 (raw and stripped)
  ruleA verbatim miss: u01 [] | u02 [] | u03 [] | u04 []
```

**Application.** All 40 `before` strings occur exactly once in their base field, all 40 `after` strings are present, replay reproduces every patched field. All 40 before / after pairs are verbatim substrings of the Rule A text, and every whole patched field equals the Rule A after-text (shortening is the same edit as prescribed).

D-198, whole field before → after (`d198.mjs`, 145 sources per language; jp fields also carry the window columns):

| Patch | Lang | LCS before → after (nearest source) | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|
| u01 p01 | en | 14 → 14 (" the customer ", generic) | " customers " (11) | — |
| u01 p02 | zh | 4 → 4 (之间共享, unchanged part) | 商品 (2) | — |
| u01 p03 | **jp** | 11 → 11 (サービスなどを提供する, unchanged part, 2015h27a-q017 ウ) | の企業 (3) | 5 / 5 → 4 / 4; 0.39 → 0.26 (2013h25h-q017 イ) — see note |
| u02 p01 | **jp** | 3 → 3 | なもの (3) | 0 / 0 → 0 / 0; 0.09 → 0.09 |
| u02 p02–p03 | zh | 2 → 2 | 一个 (2) | — |
| u02 p04–p05 | en | 9 → 8 (" collecti" gone) | " put up " (8) | — |
| u02 p06 | **jp** | 5 → 4 | くなる (3) | 0 / 0 → 0 / 0; 0.16 → 0.16 |
| u02 p07 / p08 | zh / en | 3 / 13 → same (" third party ", term) | 的情况 / "e is the " | — |
| u02 p09 | zh | 7 → 7 (第三方托管服务, term) | 的风险 (3) | — |
| u02 p10 | en | 10 → 10 | " goods or " (10) | — |
| u02 p11 | **jp** | 7 → 7 (unchanged part) | ing (3) | 0 / 0 → 0 / 0; 0.16 → 0.17 |
| u02 p12–p14 | zh / en | 8 / 19 → same ("trading " / " financial products", terms) | 金融商品 / " and sell" | — |
| u02 p15 | zh | 1 → 3 | " lo" (3) | — |
| u02 p16 / p17 | zh / en | 4 / 15 → 11 / 16 | "online trad" / " online trading " (2015h27a-q017 イ, the alias — see note) | — |
| u03 p01 | **jp** | 3 → 4 | の情報を (4) | 0 / 0 → 0 / 0; 0.10 → 0.09 |
| u03 p02 / p03 | zh / en | 8 / 15 → same ("account " / " a bank account", generic) | 3 / 14 | — |
| u03 p04 | **jp** | 6 → 9 | 受発注や決済などの (9, 2018h30h-q022 stem — see note) | 0 / 0 → 0 / 0; 0.27 → 0.31 |
| u03 p05 / p06 | zh / en | 5 / 25 → same (unchanged part) | 、结算等 (4) / "transaction information " (24) | — |
| u03 p07 | zh | 3 → 3 | 上的 (2) | — |
| u04 p01 | **jp** | 2 → 5 ( AI が) | 5 | 0 / 0 → 0 / 0; 0.08 → 0.15 |
| u04 p02 / p03 | zh / en | 2 / 9 → 5 / 9 ("nsurance ", 2021r03-q013 エ, single word) | 5 / 9 | — |
| u04 p04 | **jp** | 4 → 4 | として (3) | 0 / 0 → 0 / 0; 0.14 → 0.12 |
| u04 p05 / p06 | zh / en | 4 / 14 → same (加密资产 / " crypto-asset ", term) | 3 / 12 | — |
| u04 p07 | **jp** | 6 → 6 (フィンテック, term) | によって (4) | 0 / 0 → 0 / 0; 0.13 → 0.14 |
| u04 p08 / p09 | zh / en | 5 / 15 → 5 / 15 | 1 / 10 | — |
| u04 p10 | zh | 3 → 3 | 的加密 (3) | — |
| u04 p11 | en | 25 → 25 (" against money laundering", unchanged part) | 25 | — |
| u04 p12 / p13 | zh | 2 / 4 → same | 2 | — |

Notes:
- u01 p03: before, the field had 5 near-windows: 1 vs 2013h25h-q017 イ (「企業が自社の従業員に向け」~「…に対し」, d 2) and 4 vs 2015h27a-q017 ウ (「…サービスなどを提供する…」). After, the q017 イ window is **gone** (L3's purpose); the 4 left are the generic 「サービスなどを提供する」 in the unchanged part, which Rule A §1-4 already ruled a false positive (ウ's content — 社内手続・連絡・福利厚生 — is not used).
- u02 p16 / p17: the 11 / 16-char overlap with 2015h27a-q017 イ (correct answer) is the alias オンライントレード / online trading itself, which Rule A L6 asked to show. A term name, not an expression.
- u03 p04: 「受発注や決済などの」 (9 chars) matches the 2018h30h-q022 stem by design (L1 restores the cited question's range); below the 12-char window, 0 windows.
- u04 p03 / u02 p05: overlaps are one word or generic phrases.

No patch adds a copy-level overlap; 0 jp windows after in every jp field except the 4 pre-existing false positives in u01 p03; wDice ≤ 0.31, far from the HIGH calibration (ed 0.14 / Dice 0.52). u01 p03 and u02 p04 lower the overlap.

## 2. Per-patch verdict

| Unit / IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| u01 p01 | `terms[5](OMO).points[0].text_en` | L1 | Yes: "sends customers from online to the store" = jp オンラインから店舗へ / zh 从线上送往门店; = pairs[1].rows[1] "from online to the store" | No | OK |
| u01 p02 | `terms[5].detail_zh` (+ explanation_zh) | L2 | Yes: 在哪个渠道售出 = en "which channel made the sale"; 0 窗口 left in the unit | No | OK |
| u01 p03 | `terms[0](EC).points[1].text_jp` | L3 | Yes: q017 イ near-window removed (§1 note); meaning unchanged (BtoE = 企業 → 自社の従業員). zh 本公司员工 / en its own staff already agree. D-200: 1 sentence / 67 chars | No | OK |
| u02 p01–p05 | `terms[6](クラウドファンディング).analogy_jp/zh/en` | **M1 (MEDIUM)** | Yes (§3.1): 募金箱 / 募捐箱 / collection box removed; new image (many put in a little to reach a sum one person could not) says nothing about the return, so it no longer contradicts detail / fig (購入・投資・貸付) / points[1]. 0 remnants in the unit | LOW §6 (obs. 1, record only) | OK |
| u02 p06–p08 | `terms[3](エスクロー).detail_jp/zh/en` (+ explanation) | L1 | Yes: 避けやすくなる / 更容易避免 / makes it less likely = points[1] 防ぎやすくなる and 2026r08-q028 低減できる; no longer over-claims (ア / エ not supported) | No | OK |
| u02 p09 | `terms[3].points[1].text_zh` | L2 | Yes: 更容易防范 = jp 防ぎやすくなる | No | OK |
| u02 p10 | `terms[6].fig.data.root.children[0].label.en` | L3 | Yes: "rewarded with" no longer shares "repaid" with the lending type; = jp 商品やサービスで返す | No | OK |
| u02 p11–p14 | `terms[4](インターネットトレーディング).hook_jp/zh/en` (+ memory_hook, summary) | L4 | Yes: 売り買い・取引 / 买卖、交易 / buying and selling (no "again and again"); zh 交易的对象 replaces 经营的对象 | No | OK |
| u02 p15 | `pairs[1].rows[2].a_zh` | L5 | Yes: 拆成小单发包 = jp 小口発注 (split into small jobs), no money sense; 等 keeps jp や open | No | OK |
| u02 p16–p17 | `terms[4].detail_zh/en` (+ explanation) | L6 | Yes: alias is now distinguishable from the headword translation and carries `[[jp:オンライントレード]]`; origin in detail_jp (§3.4) | No | OK |
| u03 p01–p03 | `terms[5](アカウントアグリゲーション).hook_jp/zh/en` (+ memory_hook, summary) | **M1 (MEDIUM)** | Yes (§3.2): the hook now keys on who looks and why (利用者本人 / 自分のお金の全体); applied to 2024r06-q013 it rejects ア | No | OK |
| u03 p04–p06 | `terms[0](EDI).points[0].text_jp/zh/en` | L1 | Yes: 決済 / 结算 / settlement details = 2018h30h-q022 range; など kept. D-200: 2 sentences / 92 chars | LOW (obs. 2, record only) | OK |
| u03 p07 | `terms[2](キャッシュレス決済).detail_zh` (+ explanation) | L2 | Yes: QR 码 = zh_terms; 0 二维码 left | No | OK |
| u04 p01–p03 | `terms[0](フィンテック).fig.data.root.children[3].label` (三語) | L1 | Yes (§3.3): new example (AI estimates damage from photos for a claim) is a real InsurTech use and has nothing in common with 2021r03-q013 エ (grade system) | No | OK |
| u04 p04–p06 | `terms[2](暗号資産).points[0].text_jp/zh/en` | L2 | Yes: 電子マネー no longer = 前払い only; (前払い型が代表的) = u03 terms[3].detail 「代表的なのは…前払い型」. Point (法定通貨建てか否か) unchanged. D-200: 1 sentence / 80 chars | No | OK |
| u04 p07–p09 | `terms[1](FinTech).detail_jp/zh/en` (+ explanation) | L3 | Yes: 問題文 / 题目 / exam questions removed (0 in unit) | No | OK |
| u04 p10 | `terms[2].hook_zh` (+ memory_hook_zh, summary) | L4 | Yes: names the Japanese name “暗号資産” and splits 暗号 / 資産 in jp script, = jp hook and en hook (暗号 (cipher) / 資産 (asset)); validate 0 | No | OK |
| u04 p11 | `terms[5](eKYC).points[0].text_en` | L5 | Yes: two clauses (measures … require an identity check …; eKYC lets that check be done …) = jp meaning; [[jp:]] markers 2 → 2 | No | OK |
| u04 p12–p13 | `terms[0].fig.data.root.children[2].label.zh`, `terms[0].detail_zh` (+ explanation_zh) | L6 | Yes: 贷款 = jp 融資 (lending) = en Lending. The 4 remaining 融资 are CFT 反恐怖主义融资 (term_zh, terrorist financing — correct) | No | OK |

## 3. Focused checks

### 3.1 u02 p01–p05: クラウドファンディング analogy (M1)

- After (whole field = Rule A M1 after, 三語):
  - jp: 「この企画を実現したい」という呼びかけに、賛同した大勢が少しずつお金を出し合い、一人では出せない額を集めるようなもの。
  - zh: 就像有人发出“想实现这个企划”的号召，许多赞同者各自出一点钱，凑出一个人拿不出的数额。
  - en: Like a call to “make this idea happen”, where many supporters each chip in a little to reach a sum no one could put up alone.
- D-204: the image no longer fixes the return (no 募金 = gift). It fits all 4 fig types (購入 / 寄付 / 投資 / 貸付) and does not deny detail 2nd sentence (types by what is returned) or points[1] (投資型 = 配当). Applied to 2022r04-q012 it does not push to イ 寄付型 (the stem's 配当 decides); to 2017h29a-q022 it is compatible with the correct イ. **MEDIUM resolved.**
- Grep over every string in u02: 募金 0 / 募捐 0 / collection box 0 (Rule A's PASS condition met).
- 三語 parity: same three elements (call / many give a little / reach a sum one person could not) in all three.
- D-203 §6 (Rule A §6 note): the new text shares 賛同・少しずつ・お金・集める with one_jp and has no separate scene (no vehicle like 募金箱). It is close to a restatement of the definition; the only new angle is pooling (一人では出せない額). This is the LOW §6 type that Rule A already records for other analogies in this unit (L9), not a D-204 MEDIUM. **Record only** (obs. 1). Emptying the analogy (D-203 (b)) would also be valid; not required.

### 3.2 u03 p01–p03: アカウントアグリゲーション hook vs 2024r06-q013 (M1)

- After (whole field = Rule A M1 after): aggregate = 寄せ集める, account = 口座; 寄せ集めた口座の情報を**見るのは利用者本人**で、**自分のお金の全体を見渡す**ために使う (zh 查看…的是用户本人，用来纵览自己资金的全貌 / en the one who looks … is the user, to see the whole picture of their own money).
- Re-application to 2024r06-q013: in the stem, the **financial institution** gathers one customer's accounts by name / birth date / phone / address and manages them per customer to know the total deposits. Who looks = the institution, for its own management, not the account holder looking at their own money → the hook says "not AA" → ア rejected. points[0] then gives 名寄せ = 金融機関が顧客単位に束ねて一元管理 → エ. The old hook (寄せ集めるのは利用者自身の口座の情報) matched the stem and led to ア; the new one does not. **MEDIUM resolved.**
- Agreement: one (利用者が…まとめて確認できるサービス), detail (利用者は…自分のお金の全体を把握), points[0] (利用者が自分の資産を見渡すため) all agree with the new hook; 0 remnants of 自身の口座 / 自己的账户 / own accounts in u03; summary.memory_hooks_*[4] carry the new text.
- D-198: after-span overlap ≤ 4 chars with any source; 0 jp windows.

### 3.3 u04 p01–p03: FinTech fig, insurance example

- 2021r03-q013 (FinTech example, answer ウ robo-advisor): エ is a car-insurance grade/premium rule (traditional). The old label (sign-up completed on a smartphone) could be read as "internet insurance = FinTech" and lean to エ's surface. The new label (AI estimates the damage from photos for a claim) is a typical InsurTech service ("新しい技術で従来にないサービス"), and shares nothing with エ except the word insurance; it also does not compete with ウ. 0 remnants of スマートフォンで完結 / 加入手続 / 投保.
- 三語 parity: 保険 (例: 写真から AI が損害額を見積もる保険金の請求) / 保险（例：由 AI 根据照片估算损失金额的理赔） / Insurance (e.g., claims where AI estimates the damage from photos) — same content. parity 35 locations 0 diff.

### 3.4 u02 p16 / p17: D-202 [[jp:]] markers

| Patch | Added marker | jp origin present | Context |
|---|---|---|---|
| p16 | `[[jp:オンライントレード]]` (terms[4].detail_zh) | Yes: terms[4].detail_jp 「…オンライントレードとも呼ばれる」 | zh “在线交易”（online trade）+ origin; derived explanation_zh 「…（online trade）オンライントレード。」 |
| p17 | `[[jp:オンライントレード]]` (terms[4].detail_en) | Yes (same) | "also called online trading (オンライントレード)" in explanation_en |

validate (jp-origin, zh-term): 0 issues. The alias is the exam's own form (2015h27a-q017 イ), as Rule A L6 intended.

### 3.5 Remnant grep (every string of each unit)

| Unit | Old wording | Left |
|---|---|---|
| u01 | 窗口 / "from one to the other" / 自社の従業員に向けて | 0 / 0 / 0 |
| u02 | 募金 / 募捐 / collection box / 反复 / again and again / 经营的对象 / repaid in goods / 避けられる / 能够有效 | all 0. 小额 1 = overview_rows[6].one_line_zh (CF: small sums of money — correct sense, not the L5 place) |
| u03 | 二维码 / 自身の口座 / 自己的账户 / own accounts | all 0. 請求 / 开票 / invoices remain in EDI one / detail / hook_en / overview_rows[0] / pairs[0] — outside L1's scope (obs. 2) |
| u04 | 前払いした / 预付的金额 / prepaid in / 問題文 / 题目 / exam question / スマートフォンで完結 / 投保 / “资产” | all 0. 融资 4 = CFT term_zh / one_zh / definition_zh / memory_hooks_zh (反恐怖主义融资, correct) |

## 4. F-fix

No required F-fix. No patch introduces a HIGH or MEDIUM defect.

Optional (not required): u02 `terms[6].analogy_jp/zh/en` could be emptied per D-203 (b) if the main session prefers no analogy to a near-restatement (obs. 1). The current text is acceptable.

## 5. Observations (record only)

1. LOW (D-203 §6), u02 p01–p05: the new CF analogy is close to a restatement of one_jp (shares 賛同・少しずつ・お金を集める, no separate scene). Rule A §6 anticipated this. Same type as Rule A u02 L9; not D-204 (no contradiction with any field).
2. LOW (書き方 7, style), u03 p04–p06: EDI examples now read 受発注や**決済**など (points[0], = 2018h30h-q022) but 受発注や**請求**など in one / overview_rows[0] / pairs[0] (and invoices in hook_en). Both lists are open (など / such as), and invoices and settlement data are both EDI messages, so the fields do not contradict each other. Not required.
3. Script notes:
   - `stage` meta is removed in all 4 units (as in b19–b54).
   - ruleA verbatim misses: none; whole patched fields = Rule A after-texts.
   - parity location counts (31 / 30 / 26 / 35) equal the Rule A gate outputs; the patches did not add or remove locations.

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 2 in scope (u02 M1, u03 M1) — **both resolved**; **0 introduced**
- LOW introduced: 0 that need a fix. Recorded: obs. 1–2. Obs. 3 is script notes.
- **Application:** 40/40 exact (replay, all part-level). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (276 checked, 0 mismatch). 40/40 match the Rule A text verbatim, and the shortened strings give the same whole-field result as prescribed. Every 建議修 and both MEDIUMs are covered.
- **Cited questions:** 2024r06-q013 — new hook rejects ア, points[0] gives エ; 2021r03-q013 — new insurance example no longer leans to エ; 2026r08-q028 — escrow detail now matches 低減できる; 2022r04-q012 / 2017h29a-q022 — new CF analogy neutral on the return type.
- **D-198:** no patch adds a copy-level overlap; 0 new jp windows. u01 p03 removes the near-window to 2013h25h-q017 イ (the 4 left are Rule A's pre-existing false positive vs 2015h27a-q017 ウ).
- **D-200:** u01 terms[0].points[1] 1 sentence / 67 chars; u03 terms[0].points[0] 2 sentences / 92 chars; u04 terms[2].points[0] 1 sentence / 80 chars (≤ 100); validate framing 0.
- **D-202:** both added `[[jp:]]` markers (u02 p16 / p17) have their origin in jp text.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 ×4
  - validate --part: 0 issues ×4 (sha256 = base_sha256)
  - parity: 0 diff ×4 (31 / 30 / 26 / 35 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 40 active patches of strategy-05-16 u01–u04 are applied exactly. Each resolves its Rule A finding (including the u02 and u03 MEDIUMs that made those Rule A audits FAIL), and none introduces a HIGH or MEDIUM. No required F-fix. Two LOWs are recorded (u02 analogy near-restatement, u03 EDI 請求 / 決済 example mix).
