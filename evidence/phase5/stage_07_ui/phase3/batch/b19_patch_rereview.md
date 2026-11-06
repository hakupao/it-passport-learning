# b19 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditors' context; Rule D)
- Date: 2026-11-06 (Session 146)
- Scope: B3 wording patches for strategy-06-19-u01 (p01), u02 (p01–p10), u03 (p01–p02)
  — 13 `active`, 0 retired (`patches/strategy-06-19-u01.json` … `-u03.json`), checked against the Rule A findings
  (`strategy-06-19-u01.ruleA.md` L9 建議修; `-u02` L1, L2, L3 建議修; `-u03` L1, L2 建議修; all three units PASS, no MEDIUM) and the merged units
  `data/ip/textbook/units/strategy-06-19-u0{1,2,3}.json` (sha256 u01 `fdb608c252f81143…`, u02 `4b4eda504e8b336d…`, u03 `311263b4b41fa9a3…`).
- Pre-patch bases located by sha256 = `base_sha256`: `.planning/v2/<U>/parts/b19-u01-a2/…loc.r0.json` (`442179b2…`), `b19-u02-a3/…loc.r0.json` (`caf46c54…`), `b19-u03-a2/…loc.r0.json` (`054ca51d…`) (all 3 match).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, and the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names).

## 0. Method

Same as `b18_patch_rereview.md` §0 (= `b17` / `b16` §0), topic strategy-06-19:

1. Application check (script): every string field of base and merged unit is walked. Each `after` must appear in its field; `before` (raw and notation-stripped) must not survive anywhere; every string that differs between base and unit (for paths present in the base) must be explained by a patch; the patches replayed in file order on the base must reproduce the unit's field exactly.
2. Derived-field check from the same walk (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`) — every term and key point of the 3 units, not only the patched ones.
3. D-198 (one jp patch: u02 p08): LCS, 12-char window with ≤2 substitutions with and without masking (katakana runs ≥4 and alnum masked), best same-length-window bigram Dice (wDice). Sources: stem (`stem_jp_clean`, fallback `stem_jp`) + all choices of every strategy-06-19 question (71; 355 source strings). zh / en patches: LCS against the zh / en translation sidecars of all 71 topic questions (355 strings each), for the whole patched field before → after and for the `after` span alone. Normalisation differs from the Rule A scripts, so absolute values differ from the Rule A files; before → after is measured with one script.
4. D-195 / D-200 via validate; zh-term warnings compared with `validate --part <base>`.
5. Manual reading of each patched field in context (whole term + overview row + pairs + key_points + fig); meaning judged against the cited / quiz questions' `correct_answer` and their zh / en sidecars (b18 u05 M1 type: does a zh / en rewrite move toward a wrong choice's wording?). u02 L3: the mail-flow figure read as a whole (nodes + 3 captions + one / detail / analogy) and against the e-mail questions in the unit's manifest (2013h25h-q085 / q087 / q088).
6. `scripts/textbook-v2-validate.mjs --unit` / `scripts/textbook-v2-parity.mjs --unit` per unit; `npx vitest run src/lib/textbook`.

Not established: as in b14–b18, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: u01 167, u02 148, u03 118) were checked for the derived copies (step 2) and for the patched texts. Mail-protocol behaviour (POP / IMAP) judged from general knowledge; no primary RFC text consulted (not needed: the patch removes a claim rather than adding one).

## 1. Script results (fresh, 2026-11-06)

```
✓ strategy-06-19-u01 unit: 0 issues                validate exit 0 | parity: 34 locations, 0 diff  exit 0
✓ strategy-06-19-u02 unit: 0 issues, 3 warnings    validate exit 0 | parity: 34 locations, 0 diff  exit 0
✓ strategy-06-19-u03 unit: 0 issues                validate exit 0 | parity: 27 locations, 0 diff  exit 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

u02 warnings (all `zh-term`): `terms[0](BYOD).detail_zh PC → PC（个人计算机）`, `terms[3](Web会議).analogy_zh テーブル → 表（数据表）` — both present identically in the base (`validate --part b19-u02-a3/…loc.r0.json`: 0 issues, the same 2 warnings), in fields no patch touches; and **`terms[4](電子メール).detail_zh ファイル → 文件 not in the zh text` — new, introduced by p07** (the deleted 以文件形式 was the only 文件 in the field). It is a substring false positive: the jp source is 添付ファイル, whose standard mainland term is 附件 (kept, bold); 文件 is a translation of bare ファイル. Warning, not issue; no fix (obs. 1).

Application: 13/13 `before` occur exactly once in the base field; 13/13 `after` present in their fields; replay of the patches in file order on the base reproduces every patched field exactly (3/3 units). `before` remnants anywhere in the units (raw or stripped): 0. Unexplained base → unit diffs in base-present paths: 0 per unit (u01 1 changed path, u02 9, u03 2 = the patched fields; only the `stage` meta key removed).

u01 p01 registration note: the Rule A u01 L9 prescription quotes the word as `**决裁**`; the base text has no bold there (`terms[5].points[0].text_zh` bold 1 = **工作流** only, before and after). The patch was registered against the real text 「审批、决裁的手续传递」; the result 「公司内部从申请到审批、最终批准的手续传递实现电子化」 is the auditor's intended wording without the non-existent marker. Same situation for u03 p02 (auditor quoted `**据点**`; base has no bold there, bold 1 = SNS only before and after).

Derived fields follow: u02 p01 → `terms[3].definition_zh`, p04 / p05 → `terms[3].explanation_zh`, p06 → `terms[7].explanation_zh`, p07 → `terms[4].explanation_zh`; u03 p01 → `terms[5].definition_en`. Full walk of all terms: `definition / explanation / memory_hook` = notation-stripped `one / detail / hook`, and `summary.key_points_*` = stripped `key_points_*` — u01 78, u02 81, u03 66 checked, 0 mismatches. `points[*]`, `fig.*`, `overview_rows` have no derived copy.

Notation counts (bold, `[[jp:]]`), before → after, every patched field: unchanged in 12 of 13; the one change is the intended one — u03 p01 `terms[5].one_en` bold 4 → **3** = jp 3 (**PDS** / **自らの意思で蓄積・管理** / **本人が制御**) = zh 3; `[[jp:]]` 1 → 1. Parity 0 diff.

D-198, before → after (one script):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest overlap of the `after` span |
|---|---|---|---|---|
| u01 p01 | zh | 2013h25h-q012 stem | 4 → 4 (公司内部, unchanged part) | 的手续 (3) |
| u02 p01 | zh | 2013h25a-q091 stem | 5 → 5 (通过互联网, unchanged) | 和 (1) |
| u02 p02 | zh | 2010h22a-q006 ウ | 4 → 4 (通过网络, unchanged) | 和 (1) |
| u02 p03 | zh | 2014h26h-q095 stem → 2009h21h-q017 イ (correct) | 2 → 2 | 通过 (2) |
| u02 p04 | zh | 2019r01a-q033 ウ | 4 → 4 (unchanged sentence) | 和资料 (3; 2015h27h-q004 イ, obs. 2) |
| u02 p05 | zh | 2019r01a-q033 ウ | 4 → 4 | 的会议 (3; 2019h31h-q002 エ, obs. 2) |
| u02 p06 | zh | 2015h27h-q004 エ | 3 → 3 | 用的 (2) |
| u02 p07 | zh | 2013h25h-q085 stem | 4 → 4 (作为附件) | 作为附件 (4) |
| u02 p08 | **jp** | 2013h25h-q088 ア | 6 → 6 (メールは受信, unchanged part) | windows unmasked / masked 0 / 0 → 0 / 0; wDice 0.27 → 0.28 |
| u02 p09 | zh | 2013h25h-q085 stem | 3 → 3 | 的邮件 (3) |
| u02 p10 | en | 2013h25h-q087 エ | 15 → 15 ("t the recipient", unchanged part) | "is stored " (10) |
| u03 p01 | en | 2015h27a-q008 ア | 13 → 13 (" data store, ", unchanged part) | " themselves " (12) |
| u03 p02 | zh | 2017h29a-q005 stem | 9 → 9 (社交网络服务SNS = term) | 部门和 (3) |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52); 12-char windows 0 on the jp patch before and after. No answer-choice sentence frame in any `after`.

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01 | `terms[5](ワークフロー).points[0].text_zh` | L9 建議修 | Yes: 决裁 (Japanese-only business word) → 最终批准 = the term's own `detail_zh` (谁最终批准) and en "final sign-off"; = auditor's text (without the non-existent bold, §1) | No | OK |
| u02 | p01–p05 | Web会議 `one_zh` (+ definition), `overview_rows[3].one_line_zh`, `extra_zh[1]`, `detail_zh` ×2 (+ explanation) | L1 建議修 | **Yes** (§3.1) | No (obs. 2, 3) | OK |
| u02 | p06 | `terms[7](チャット).detail_zh` (+ explanation) | L2 建議修 | Yes: 业务用的聊天 → 工作用的聊天工具 (natural; matches the field's own first sentence 很多聊天工具 and en "Business chat") | No | OK |
| u02 | p07 | `terms[4](電子メール).detail_zh` (+ explanation) | L2 建議修 | Yes: redundant 以文件形式 removed; 作为**附件**随正文一起发送 = jp 添付ファイルとして本文と一緒に送れる; bold 4 → 4 | zh-term warning (false positive, obs. 1) | OK |
| u02 | p08–p10 | `terms[4](電子メール).fig.steps[1].caption_jp / _zh / _en` | L3 建議修 | **Yes** (§3.2) | No (obs. 4) | OK |
| u03 | p01 | `terms[5](PDS).one_en` (+ definition) | L1 建議修 | Yes: bold 4 → 3 aligned with jp / zh; "control themselves" (readable as self-restraint) → "**themselves control** whether it is provided" (unambiguous: the person is the one who controls); meaning = jp 第三者への提供を本人が制御 | No (obs. 5) | OK |
| u03 | p02 | `terms[1](SNS).points[1].text_zh` | L2 建議修 | Yes: 据点 → 办公地点 (= jp 拠点 in the office sense; en "sites"); also removes the zh-only word overlap with 2015h27h-q004 wrong イ zh (各据点…); correct ウ (business-useful network of contacts) still taught (扩大对工作有帮助的人脉) | No | OK |

## 3. Focused checks

### 3.1 u02 L1 — Web会議 zh (p01–p05): natural, meaning kept, no drift toward a wrong choice

- 视频和音频 (one_zh, one_line_zh) = jp 映像と音声 / en "video and audio" — the standard mainland IT pair for a web meeting; 共同查看屏幕和资料 (detail_zh) = jp 画面や資料を全員で見ながら / en "viewing the same screen or documents" — 屏幕 is the screen (画面 in Chinese means a picture / scene); 通过视频和语音同时交谈 (extra_zh[1]) = jp 顔と声で同時に話す / en "Face and voice, in real time"; 跨地区、跨分支机构的会议 = jp 拠点をまたぐ打ち合わせ / en "meetings that span multiple sites" (会商 / 据点 gone). All 5 replacements equal the auditor's §3 L1 prescriptions verbatim. Bold in one_zh 2 → 2, `[[jp:Web会議]]` kept.
- Cited / quiz questions of Web会議: 2016h28a-q026 (groupware; correct ア) and 2009h21h-q017 (purpose of groupware; correct イ = collaborative workplace → efficiency). No zh choice of either uses 视频 / 音频 / 屏幕 / 分支机构; wrong ア zh (嵌入…硬件) is not touched by the patched sentences (the 内置其中 clause is unchanged and jp-identical, Rule A u02 O3 (b)).
- Topic-wide overlaps with wrong choices: 2015h27h-q004 wrong イ (an SNS question; the distractor describes a remote video meeting with screen and materials) and 2019h31h-q002 wrong エ (a workflow question; the distractor describes an online head-office / branch meeting). Both distractors are *correct descriptions of a web meeting* that are wrong only for their own question's term (SNS / workflow). In the Web会議 field the shared content (屏幕和资料 / 分支机构的会议) is the true definition, jp says the same (画面や資料 / 拠点をまたぐ), and the after-span overlap is ≤3 chars (和资料 / 的会议). Not the b18 u05 M1 type (zh moving away from jp toward a wrong reading) — obs. 2.
- Minor: one_zh uses 音频 and extra_zh[1] uses 语音 for jp 音声 / 声 (both natural; extra is the shorter overview cell) — obs. 3.

### 3.2 u02 L3 — mail-flow caption 2: "stored there" is correct and consistent

- Before (jp / zh / en): the mail is held on the recipient-side server *until it is retrieved* — implies removal on retrieval (POP3 default behaviour); false for IMAP and web mail, where the message stays on the server after reading. After: 「メールは受信者側のメールサーバに届き、そこに保管される。」 / 「邮件到达收件方的邮件服务器，并保存在那里。」 / "…arrives at the recipient's mail server and is stored there." — true under every retrieval model; the three languages are now equal in content (equal to the auditor's §3 L3 prescription verbatim). Each caption is still 1 sentence (validate 0).
- Figure as a whole: node 2 label メールサーバが預かる / 邮件服务器代为保管 / "Mail server holds it" — consistent with 保管 / stored. Step 3 「受信者は自分の都合のよいときにサーバから受け取って読む」 — makes no deletion claim, so the sequence write → server stores → recipient reads at a convenient time still carries the unit's point (`one` 非同期, analogy 郵便受け: the recipient opens it when they come home). Nothing in one / detail / hook / points mentions POP / IMAP (grep 0).
- Questions: the unit's e-mail questions 2013h25h-q085 / q087 / q088 (survey-by-mail scenario: attachment handling, reply procedure, filing replies) do not concern server retrieval. q088's correct choice keeps the reply mails in a folder, its wrong ア adds deleting them from the inbox; the new caption (stored, no implied removal) is not closer to any wrong choice, and shares only 6 chars (メールは受信, unchanged part) with q088 ア. 2016h28a-q026 (groupware lists e-mail) unaffected.
- en step 3 says "downloads it from the server" (jp 受け取って, zh 接收) — slightly POP-flavoured in en only, but makes no removal claim and is outside the patch — obs. 4, records only.

### 3.3 Other requested checks

- Dropped qualifiers / new restrictions: none. p07 removes only a redundancy; p08–p10 remove an over-narrow implication; p05 跨地区、跨分支机构 widens 拠点 slightly toward "regions" but stays within "meetings between separate locations" (en "multiple sites").
- D-204: analogies / hooks unchanged; none now carries content the patched fields deny (郵便受け analogy agrees with "stored there").
- D-205: no patch adds a version-bound count / structure claim.
- D-200: validate 0 issues in all 3 units.
- b18 u05 M1 type (zh / en drifting toward a wrong choice): 0 — u03 p02 removes the only zh-only overlap (据点 with 2015h27h-q004 イ); u01 p01 最终批准 / u03 p01 "themselves control" appear in no wrong choice of the topic.

## 4. Observations

No F-fix (no 建議修) from this re-review.

Records only, no fix:

1. LOW, patch-introduced warning: u02 validate `zh-term terms[4](電子メール).detail_zh ファイル → 文件 not in the zh text` appears after p07 (base: 2 warnings, unit: 3). False positive — jp 添付ファイル = zh 附件 (kept, bold); 文件 renders bare ファイル. Validate 0 issues.
2. LOW, u02 p04 / p05: Web会議 detail_zh 屏幕和资料 / 分支机构的会议 share content with 2015h27h-q004 wrong イ and 2019h31h-q002 wrong エ (distractors of SNS / workflow questions that correctly describe a web meeting); jp has the same content; after-span overlap ≤3 chars.
3. LOW, u02 p01 / p03: 音频 (one_zh, one_line_zh) vs 语音 (extra_zh[1]) for 音声 / 声 — both natural, auditor's prescribed text.
4. LOW, pre-existing: u02 `terms[4].fig.steps[2].caption_en` "downloads it from the server" (jp 受け取って); no removal claim; outside every patched field.
5. LOW, u03 p01: "**themselves control** whether…" is slightly marked word order (auditor's prescribed text) but unambiguous; the earlier "control themselves" misreading is gone.
6. LOW, pre-existing: u02 validate warnings `terms[0].detail_zh` (PC → PC（个人计算机）) and `terms[3].analogy_zh` (テーブル → 表（数据表）) present identically in the base part; outside every patched field (Rule A u02: "warn 2 件は偽陽性").

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM introduced: **0** (none in scope: all 3 units PASS at Rule A with MEDIUM 0)
- LOW introduced: 建議修 0; 記録のみ 6 (obs. 1–6, of which obs. 4 and 6 pre-existing)
- D-198: no copying in patched texts (jp windows 0 / 0; zh / en after-spans ≤12 chars, generic or term words)
- validate 3/3 = 0 issues (u02 3 warnings: 2 pre-existing, 1 patch-introduced false positive), parity 3/3 = 0 diff (34 / 34 / 27 locations), vitest textbook 162/162

**PASS** — all 13 active patches are applied exactly (replay reproduces every patched field, derived fields follow, no other base-present path changed), the 6 Rule A 建議修 findings (u01 L9, u02 L1–L3, u03 L1–L2) are resolved with the auditors' wording (u01 p01 and u03 p02 correctly registered against the real, unbolded text), the mail-flow caption now states "stored there" in all three languages, which is true for every retrieval model and consistent with the figure, the unit and the e-mail questions, the zh rewrites read naturally and move toward no wrong choice of any cited / quiz question, and no new HIGH / MEDIUM is introduced.
