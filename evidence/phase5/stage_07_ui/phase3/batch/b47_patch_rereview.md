# b47 B3 patch re-review — technology-22-59 u01–u03 (OSI基本参照モデルと7階層 / TCP/IPとWebプロトコル / メール・ファイル・運用プロトコル, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b47rv/` (derived from `b46rv/`; only the topic, the base parts and the unit list changed).
- Date: 2026-11-08 (Session 149 続)
- Scope: the B3 wording patches for technology-22-59 u01–u03. **18 are `active` and 0 retired**: u01 p01–p03 / u02 p01–p12 / u03 p01–p03 (`patches/technology-22-59-u0{1,2,3}.json`).
  I checked each patch against the Rule A prescriptions in `technology-22-59-u0N.ruleA.md`:
  - u01 (Rule A PASS, 建議修 L1): L1 → p01 (jp) / p02 (zh) / p03 (en)
  - u02 (Rule A PASS, 建議修 L1 / L2 / L3): L1 → p01–p03 (HTTPS analogy, 三語), L2 → p04–p06 (HTTP detail, version stated per D-210, 三語), L3 → p07–p12 (HTTP fig steps[1] / steps[2] captions, 三語)
  - u03 (Rule A PASS, 建議修 L1): L1 → p01–p03 (IMAP analogy, 三語)
  Every 建議修 in u01–u03 is covered. LOWs marked 記録のみ (u01 L2–L9, u02 L4–L9, u03 L2–L11) are not patched and not re-ruled here.
- Pre-patch bases, located by sha256 = `base_sha256` (one base per unit, shared by all its patches):
  - u01 `data/ip/textbook/.planning/v2/technology-22-59-u01/parts/b47-u01-a1/technology-22-59-u01.loc.r1.json` `c1d14ae822966521…`
  - u02 `data/ip/textbook/.planning/v2/technology-22-59-u02/parts/b47-u02-a1/technology-22-59-u02.loc.r0.json` `483d3cbfcfd4dd8b…`
  - u03 `data/ip/textbook/.planning/v2/technology-22-59-u03/parts/b47-u03-a1/technology-22-59-u03.loc.r1.json` `d72ff29654940f20…`
- Merged units (current) `data/ip/textbook/units/technology-22-59-u0N.json` sha256: u01 `b30c8a4c4aea45b8…` / u02 `480470abad128d84…` / u03 `9b3a5657e617dba1…`. They differ from their bases only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only). Strings shown are unit text, patch text or term names.

## 0. Method

Same as `b46_patch_rereview.md` §0. No `unit.*` patch and no multi-patch field in this batch. Topic technology-22-59 has 34 questions, so there are 170 source strings per language.

1. **Application check** (`b47rv/check.mjs`): `after` present; `before` once in base; replay in file order = unit field; every changed base-present path explained; before / after verbatim in the Rule A file. Plus `b47rv/extra.mjs`: net `before` remnant count (subtracting occurrences inside `after`, since u01 p01 / p02 and u02 p05 prepend text and keep `before` as a substring). Plus a search for every copy of each `after` string in the unit.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (index pairing and hooked-terms pairing).
3. **D-198** (`b47rv/d198b.mjs` windows for all 6 patched jp fields, + `win.mjs` and `near.mjs` on each of the 6 patched jp fields; win.mjs prints 0 windows for the 5 u02 / u03 fields and only the 3 pre-existing アプリケーション層の… windows for u01): whole-field LCS before → after and LCS of the `after` span against the 170 sources per language; jp 12-char windows (≤2 substitutions) unmasked / masked + wDice; semi-global ed ≤2 per 12-char window (raw and katakana-folded) + whole-field ed / Dice against every string of the closest cited question (u01 → 2023r05-q068; u02 → 2010h22a-q065 and 2012h24h-q080; u03 → 2013h25h-q084).
4. **Cited-question checks.** Re-read in `data/ip/quiz/questions.json` + translations: 2023r05-q068 (lower common protocol under application protocols; answer エ TCP/IP; wrong ア FTP / イ POP / ウ SMTP), 2010h22a-q065 (a = HTTP / b = TCP; answer イ), 2012h24h-q080 (HTTPS purpose; answer イ = server authentication + encryption; wrong ア = all data of one screen incl. images in one connection), 2013h25a-q073 (HTTPS = encryption with SSL; ウ), 2015h27h-q083 (https:// encrypts both directions; ウ; wrong ア / イ = one direction only), 2016h28h-q056 (confidentiality; ウ), IMAP: 2013h25h-q084 イ / 2017h29a-q083 ア / 2022r04-q087 ア / 2016h28a-q085 ア / 2016h28h-q062 ウ / 2026r08-q068 エ.
5. **Manual reading** of each patched field in context: u01 アプリケーション層 one + points[0] (三語); u02 HTTP one / detail / analogy / fig steps[0..2] (三語) + HTTP points[0..1], HTTPS one / detail / analogy / points[0..2] (三語) + pairs[0] + every HTTP–TCP sentence in the topic's 3 units; u03 IMAP one / detail / analogy (三語).
6. **Gates** (each on all 3 units): `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b46): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 152 / u02 113 / u03 136) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-22-59-u01
✓ technology-22-59-u01 unit: 0 issues (data/ip/textbook/units/technology-22-59-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-22-59-u01
✓ technology-22-59-u01 parity: 29 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-22-59-u02
✓ technology-22-59-u02 unit: 0 issues (data/ip/textbook/units/technology-22-59-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-22-59-u02
✓ technology-22-59-u02 parity: 26 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-22-59-u03
✓ technology-22-59-u03 unit: 0 issues (data/ip/textbook/units/technology-22-59-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-22-59-u03
✓ technology-22-59-u03 parity: 30 locations, 0 diff
EXIT=0
validate --part (base): u01 loc#1 0 issues (sha256 c1d14ae8… = base_sha256) EXIT=0
                        u02 loc#0 0 issues (sha256 483d3cbf… = base_sha256) EXIT=0
                        u03 loc#1 0 issues (sha256 d72ff296… = base_sha256) EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  u01 active 3 ok 3 | u02 active 12 ok 12 | u03 active 3 ok 3 | replay mismatch 0 | before count in base = 1 for all 18
  changed base-present paths = patched fields + 'stage' (u01 3+1 / u02 12+1 / u03 3+1); unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata)
  derived checked 84 / 60 / 66, mismatch 0 (u02 terms[3].explanation_jp/zh/en follow p04–p06)
  bold / [[jp:]] counts unchanged in all 18 patched fields
  memory_hooks: index pairing 24 / 15 / 18 bad 0; hooked-terms pairing 8/8, 5/5, 6/6 per language, bad 0
  ruleA verbatim miss: u01 [] | u02 [] | u03 []
  "remnant" flags u01 p01/p02, u02 p05 = after contains before (prefix added) — false positive, see extra.mjs
extra.mjs: net before remnant 0 for all 18
after-copy search: each after occurs only in its own field (+ explanation_* for p04–p06)
```

**Application.** All 18 `before` strings occur exactly once in their base field, all 18 `after` strings are present, replay reproduces every patched field. Each patch's before / after is the sub-span of the Rule A full-sentence before / after (u01 L1, u02 L1 / L2 / L3, u03 L1) — same edit; verbatim check passes.

D-198, before → after (`d198b.mjs`, 170 sources per language):

| Patch | Lang | LCS before → after (nearest source) | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|
| u01 p01 | **jp** | 10 → 10 (unchanged アプリケーション層の, 2023r05-q068 stem) | インターネットで (8, 2010h22a-q065 stem; generic) | 3 / 0 → 3 / 0 (all 3 = pre-existing アプリケーション層の… windows); 0.34 → 0.31 |
| u01 p02 | zh | 7 → 7 (TCP/IP的, unchanged) | 电子邮件发送 (6, unchanged part) | — |
| u01 p03 | en | 21 → 21 ("or transferring files", unchanged) | " on the internet" (16) | — |
| u02 p01 | **jp** | 4 → 5 (サーバから) | サーバから (5) | 0 / 0 → 0 / 0; 0.10 → 0.14 |
| u02 p02 | zh | 2 → 3 (服务器) | 服务器 (3) | — |
| u02 p03 | en | 9 → 11 ("the browser") | "the browser" (11) | — |
| u02 p04 | **jp** | 6 → 6 (のポート番号, unchanged) | HTTP/ (5) | 0 / 0 → 0 / 0; 0.14 → 0.16 |
| u02 p05 | zh | 4 → 5 (HTTP/) | HTTP/ (5) | — |
| u02 p06 | en | 20 → 20 (unchanged part) | " the data " (10) | — |
| u02 p07 | **jp** | 4 → 4 (サーバは) | サーバは (4) | 0 / 0 → 0 / 0; 0.19 → 0.19 |
| u02 p08 | zh | 4 → 4 (HTML) | HTML (4) | — |
| u02 p09 | en | 11 → 11 ("the server ") | "the server " (11) | — |
| u02 p10 | **jp** | 4 → 4 (ブラウザ) | ブラウザ (4) | 0 / 0 → 0 / 0; 0.19 → 0.14 |
| u02 p11 | zh | 3 → 3 (浏览器) | 浏览器 (3) | — |
| u02 p12 | en | 13 → 12 ("the browser") | "the browser " (12) | — |
| u03 p01 | **jp** | 5 → 5 (ネット上の, unchanged) | ネット上の (5) | 0 / 0 → 0 / 0; 0.15 → 0.12 |
| u03 p02 | zh | 3 → 3 (下载到, unchanged) | 下载到 (3) | — |
| u03 p03 | en | 8 → 8 (" device ", unchanged) | " device " (8) | — |

No patch adds a copy-level overlap; every increase is a 1–2 char generic term (サーバ / 服务器 / browser / HTTP/).
`near.mjs` whole-field vs the closest cited question (after): u01 p01 vs 2023r05-q068 stem ed 0.81 → 0.75 / Dice 0.22 → 0.30 (the added インターネットで使われる shares the scene word with the stem; semi-global ≤2 windows raw 6 → 6, folded 7 → 7, all on the unchanged アプリケーション層のプロトコル span), vs エ (correct) 0.92 / 0.12; u02 analogy_jp vs 2012h24h-q080 イ 0.90 / 0.08, vs 2010h22a-q065 ≤ 0.10; u02 detail_jp vs 2010h22a-q065 イ 0.93 / 0.10; steps captions ≤ 0.15; u03 analogy_jp vs 2013h25h-q084 ≤ 0.02. 0 semi-global windows in every u02 / u03 patched jp field. All far from the HIGH calibration (ed 0.14 / Dice 0.52). The Rule A L1 note for u01 (do not paste the stem's opening phrase) is respected: the patch says インターネットで使われる, not the stem's インターネット上のコンピュータでは.

## 2. Per-patch verdict

| Unit / IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| u01 p01–p03 | `terms[7](アプリケーション層).points[0].text_jp/zh/en` | L1 | Yes: 「インターネットで使われる…用途ごとのアプリケーション層のプロトコルは…TCP/IP の機能を使って通信する」 / 互联网上使用的… / "protocols used on the Internet for each purpose" — the claim is now scoped to Internet protocols, which is the scope of 2023r05-q068. エ (TCP/IP) still the supported answer; FTP / POP / SMTP stay on the upper side (no wrong option supported). D-200: 1 sentence, **80 chars** ≤ 100 ✓. zh 互联网 = unit usage (no standalone zh_terms entry for インターネット; compound entries use 互联网). bold / `[[jp:]]` kept | No | OK |
| u02 p01–p03 | `terms[4](HTTPS).analogy_jp/zh/en` | L1 | Yes: the seal is now on the shop's (server's) envelopes and the customer (browser) checks the shop is genuine = one「通信相手のサーバが本物かを確かめられる」, detail「電子証明書を使ったサーバの認証」, pairs[0].rows[1], 2012h24h-q080 イ. 公の証明印 / 公认的证明印章 / officially certified seal carry the third-party certificate. The envelope now goes both ways (やり取り / 往来), which also fits 2015h27h-q083 ウ (both directions encrypted) and points[2]; ア / イ (one direction only) get no support. 店 / 客 matches the HTTP restaurant analogy (客 = browser). No new client-authentication reading | No (en "sealed" + "seal" double sense, obs. 1) | OK |
| u02 p04–p06 | `terms[3](HTTP).detail_jp/zh/en` (+ `explanation_*`) | L2 (D-210) | Yes: 「データを確実に運ぶ部分は、HTTP/1.1 や HTTP/2 ではトランスポート層の TCP に任せ」 / 在 HTTP/1.1 和 HTTP/2 中 / "In HTTP/1.1 and HTTP/2" — a scoping condition on the TCP clause only; it does not say HTTP needs or has a mandatory version, and one / points / overview still define HTTP without a version. Consistent with RFC 9110 §1.2 (HTTP/3 over QUIC/UDP) as cited in Rule A; HTTP/3 itself is not added (D-205 書き方 10). 2010h22a-q065 (b = TCP) still resolves to イ (the other pairs Ethernet / POP3 / HTML stay wrong); 2023r05-q068 エ unaffected. Port 80 clause unchanged and still true under the stated versions. jp や (non-exhaustive, also covers HTTP/1.0) vs zh 和 / en "and" — both true, no parity defect. No other HTTP-over-TCP sentence in u01–u03 left unqualified (u02 terms[2].detail = ports handled by TCP/UDP, not a version claim) | No | OK |
| u02 p07–p12 | `terms[3].fig.steps[1].caption_*`, `steps[2].caption_*` | L3 | Yes: step1 = server returns the requested page's HTML; step2 = browser displays, one round trip ends, images etc. fetched by repeating the same round trip. Steps now chain consistently (step0 欲しいページを指定 → step1 指定されたページの HTML → step2 表示 + 追加の往復) and match the analogy 1 回の注文に対して 1 回の提供. The new step2 sentence counters 2012h24h-q080 ア (all data incl. images in one go) rather than supporting it. 三語 parity: 指定された / 所指定 / requested; 画像など / 图片等内容 / Images and other files ✓. 服务器 / 浏览器 = zh_terms サーバ / Webブラウザ | No | OK |
| u03 p01–p03 | `terms[2](IMAP).analogy_jp/zh/en` | L1 | Yes: 共有アルバム → 自分のアルバム (one user's mailbox, not shared), and 眺めたり整理したり / 浏览和整理 / "view and sort" adds the server-side organizing of one 「読み、整理する」. Matches 2013h25h-q084 イ / 2017h29a-q083 ア / 2022r04-q087 ア / 2016h28a-q085 ア (multiple devices, one account); POP3 (download) stays the contrast (手元に移さず / 不下载到本地 / leaving … online). No wrong option supported | No | OK |

## 3. Focused checks

### 3.1 u02 p04–p06 (L2, D-210): HTTP/1.1・HTTP/2 で TCP

- Reading: the version phrase sits inside sentence 2 as 「…は、HTTP/1.1 や HTTP/2 では…TCP に任せ」. It limits which HTTP uses TCP; it is not a statement that HTTP must be a particular version, and HTTP's one / points[0] (application-layer protocol between browser and server) stay version-free.
- The unit does not explain what HTTP/3 uses. That is correct under D-205 書き方 10 (do not add the newer version's content unless a cited question asks); 34 questions in the topic, none about HTTP/3 / QUIC.
- Cited 2010h22a-q065: a learner reading "HTTP/1.1・HTTP/2 → TCP" still fills b = TCP (イ); none of ア / ウ / エ becomes plausible. 2023r05-q068 (TCP/IP under application protocols) unaffected.
- **Resolved.**

### 3.2 u02 p01–p03 (L1): HTTPS analogy direction

- Before: 「差出人の印…受け取った側は相手を確かめられる」 — with the HTTP fig (browser sends first) this read as the server checking the browser. After: the stamp is on the shop's (server's) envelopes, and the customer (browser) checks the shop. The direction now matches server authentication in one / detail / pairs[0].rows[1] / goals.
- HTTPS / SSL questions in the topic: 2012h24h-q080 イ (server authentication + encryption) supported; 2013h25a-q073 ウ (SSL encryption) — the analogy keeps the sealed envelope = encryption; 2015h27h-q083 ウ — やり取り / 往来 make the envelope two-way (the old 送る was one-way), en "moving messages … into sealed envelopes. People handling them … cannot see inside" applies to all messages; 2016h28h-q056 ウ (confidentiality) supported. No wrong option (speed, virus prevention, transaction guarantee, one-direction encryption, client authentication) is supported. The 店 / 客 frame does not lean toward 2013h25a-q073 エ (guaranteeing that a Web transaction is concluded): 確かめられる is identity checking of the shop, not a guarantee that any deal is made.
- **Resolved.**

### 3.3 u02 p07–p12 (L3): fig captions

- Steps: step0 (request naming the page) → step1 (HTML of the requested page) → step2 (display; one round trip ends; images etc. by repeated round trips). No step contradicts another; step labels untouched (validate `fig` 0 issues).
- The simplification "display, then images by more round trips" is a teaching order, not a protocol claim; it does not reintroduce the one-response-for-everything image.
- **Resolved.**

### 3.4 u01 p01–p03 and u03 p01–p03

- u01: the added scope (インターネットで使われる) only narrows the claim to what 2023r05-q068 states; Rule A §2 found no question it would mislead and none appears now. The OSI-unit framing of TCP/IP (Rule A L2, 記録のみ) is unchanged.
- u03: 自分のアルバム removes the "shared with others" reading; 整理 aligns the image with one. The photo image existed before the patch (2016h28h-q062 ア pairs IMAP4 with image conversion; the analogy is about where photos are kept, not encoding — not new, not re-ruled).
- **Resolved.**

## 4. F-fix

None. No patch introduces a HIGH, MEDIUM or LOW defect that needs a change before commit.

## 5. Observations (record only)

1. LOW (style), u02 p03: en uses "sealed envelopes" and "an officially certified seal" in one sentence — two senses of seal (closure vs stamp). The meaning is clear from context, and the old text already used "seal". An optional form is "carry an officially certified stamp"; not required.
2. LOW (style), u03 p03: en "view and sort them" vs one_en "organizing" — near-synonyms, no meaning shift.
3. Script notes:
   - check.mjs flags u01 p01 / p02 and u02 p05 as remnants because their `after` keeps `before` as a substring (prefix added). extra.mjs (net count) gives 0 — false positive.
   - `stage` meta is removed in all 3 units (as in b19–b46).

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope; **0 introduced**
- LOW introduced: 0 that need a fix. Recorded: obs. 1–2. Obs. 3 is script notes.
- **Application:** 18/18 exact (replay). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (210 checked, 0 mismatch), all 18 match the Rule A text. Every 建議修 (u01 L1, u02 L1 / L2 / L3, u03 L1) is covered.
- **D-198:** no patch adds a copy-level overlap; 0 new jp windows; whole-field Dice ≤ 0.30 vs every cited question.
- **D-200:** u01 p01 1 sentence / 80 chars ≤ 100 (only patched `points` field).
- **D-210:** u02 p04–p06 state the version (HTTP/1.1・HTTP/2) for the TCP claim; cited 2010h22a-q065 still resolves to イ.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 ×3
  - validate --part: 0 issues ×3 (sha256 = base_sha256)
  - parity: 0 diff ×3 (29 / 26 / 30 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 18 active patches of technology-22-59 u01–u03 are applied exactly. Each resolves its Rule A finding, and none introduces a HIGH, MEDIUM or LOW that needs a fix. No F-fix.
