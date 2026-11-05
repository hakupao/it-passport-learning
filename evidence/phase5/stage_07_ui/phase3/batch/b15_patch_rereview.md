# b15 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditor's context; Rule D)
- Date: 2026-11-05 (Session 142)
- Scope: B3 wording patches for technology-23-61-u06 (p01–p10), u07 (p01–p11), u08 (p01–p06), u09 (p01–p07), u10 (p01–p18)
  — 52 `active`, 0 retired (`patches/technology-23-61-u06.json` … `-u10.json`), checked against the Rule A findings
  (`technology-23-61-u06.ruleA.md` **M1**, L1, L11, L12; `-u07` **M1**, L1–L4; `-u08` L1–L3; `-u09` L1, L2, L13; `-u10` **M1**, L1, L7) and the merged units
  `data/ip/textbook/units/technology-23-61-u{06..10}.json` (sha256 u06 `565e8c1d3f0561aa…`, u07 `ea4f8560b5f0d6d1…`, u08 `9f46236a0bbb144b…`,
  u09 `77cf27a41d6071cf…`, u10 `c10e4b6f94aafde1…`).
- Pre-patch bases located by sha256 = `base_sha256`: `.planning/v2/<U>/parts/b15-u06-a1/…loc.r1.json`, `b15-u07-a1/…loc.r1.json`, `b15-u08-a2/…loc.r0.json`, `b15-u09-a3/…loc.r0.json`, `b15-u10-a1/…loc.r0.json` (all 5 match).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, and the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names).

## 0. Method

Same as `b14_patch_rereview.md` §0:

1. Application check (script): every string field of base and merged unit is walked. Each `after` (raw and notation-stripped) must appear; `before` must not survive anywhere; every string that differs between base and unit (for paths present in the base) must be explained by a patch.
2. Derived-field check from the same walk (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.*`, `overview.intro_*`).
3. D-198 (jp patches): LCS, 12-char window with ≤2 substitutions with and without masking (katakana runs ≥4 and alnum masked), semi-global edit distance normalised by unit-text length (ed), best same-length-window bigram Dice (wDice), against stem (`stem_jp_clean`, fallback `stem_jp`) + all choices of every technology-23-61 question. No cited question of the patched terms is a fill-in-the-blank stem (2019r01a-q063 / 2014h26h-q061 / 2018h30a-q077 are item-list / combination stems whose items are in the stem and therefore already in the source set). Normalisation differs from the Rule A scripts; before → after is measured with one script.
4. D-195 / D-200 via validate.
5. Manual reading of each patched field in context (whole term + overview row + pairs + key_points + goals / overview.intro); meaning judged against the cited question's `correct_answer`.
6. `scripts/textbook-v2-validate.mjs` / `scripts/textbook-v2-parity.mjs` per unit; `npx vitest run src/lib/textbook`.

Not established: as in b14, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta, 93–137 per unit) were checked only for the patched texts.

## 1. Script results (fresh, 2026-11-05)

```
✓ technology-23-61-u06 unit: 0 issues                 validate exit 0 | parity: 30 locations, 0 diff  exit 0
✓ technology-23-61-u07 unit: 0 issues, 3 warning(s)   validate exit 0 | parity: 27 locations, 0 diff  exit 0
✓ technology-23-61-u08 unit: 0 issues                 validate exit 0 | parity: 22 locations, 0 diff  exit 0
✓ technology-23-61-u09 unit: 0 issues, 1 warning(s)   validate exit 0 | parity: 39 locations, 0 diff  exit 0
✓ technology-23-61-u10 unit: 0 issues                 validate exit 0 | parity: 37 locations, 0 diff  exit 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

The 4 warnings are pre-existing and in unpatched fields: u07 zh-term ファイル ×3 (`terms[4].detail_zh`, `pairs[0].rows[1].b_zh`, `key_points_zh[3]` = 添付ファイル → 附件; u07 Rule A L10); u09 zh-term スイッチ at `terms[2].analogy_zh` (physical switch in the analogy, 开关 correct; u09 Rule A L15).

Application: 52/52 `after` present. `before` remnants anywhere in the units (raw or stripped): 0. Unexplained base → unit diffs in base-present paths: 0 per unit (only the `stage` meta key removed).

Derived fields follow: u06 p07 → `terms[4].definition_zh`, p10 → `summary.key_points_en[0]`; u07 p11 → `terms[3].explanation_zh`; u08 p02–p04 → `terms[1].explanation_*`, p05 / p06 → `summary.key_points_en[1] / [2]`; u09 p01–p03 → `terms[1].memory_hook_*` + `summary.memory_hooks_*[1]`; u10 p01–p03 → `terms[3].definition_*`, p07–p09 → `overview.intro_*`, p17 → `terms[0].explanation_en`. No stale derived copy holds a `before`. `points[*]`, `analogy_*`, `fig.*`, `pairs`, `overview_rows` have no derived copy.

D-198, before → after (one script; jp patches only; topic-wide):

| Patch | Nearest source | LCS | ed | wDice | 12-char windows unmasked / masked | Longest overlap after patch |
|---|---|---|---|---|---|---|
| **u07 p01** (M1) | 2024r06-q087 stem → 2013h25a-q074 ウ | **15 → 7** | 0.72 → 0.78 | 0.28 → 0.22 | **8 / 0 → 0 / 0** | `のソフトウェア` (particle + loanword) |
| u06 p01 (M1) | — | 4 → 4 | 0.85 → 0.83 | 0.12 → 0.10 | 0 / 0 → 0 / 0 | `のような` |
| u06 p04 (L1) | 2018h30h-q067 エ | 6 → 6 | 0.52 → 0.62 | 0.37 → 0.33 | 0 / 0 → 0 / 0 | term バックドア + を |
| u07 p04 (L1) | 2019r01a-q063 stem | 7 → 7 | 0.73 → 0.75 | 0.30 → 0.18 | 0 / 0 | term チェーンメール |
| u07 p07 (L2) | short cell (8 → 15 chars) | 6 → 6 | 0.25 → 0.33 | 0.71 → 0.57 | 0 / 0 | `電子メールで` (short-cell artefact) |
| u08 p01 (L1) | 2017h29h-q095 stem | **14 → 8** | **0.06 → 0.21** | 0.88 → 0.67 | **5 / 0 → 2 / 0** | `IDとパスワード` (§4 obs. 6) |
| u08 p02 (L2) | — | 3 → 4 | 0.65 → 0.70 | 0.13 → 0.16 | 0 / 0 | — |
| u09 p01 / p04 | — | 5 / 4 | ≥ 0.67 | ≤ 0.27 | 0 / 0 | term リクエスト / 情報など |
| **u10 p04** (M1) | — | 5 → 5 | 0.81 → 0.84 | 0.17 → 0.16 | 0 / 0 | `メールを送` |
| u10 p01 / p07 / p10 (M1) | — | ≤ 5 | ≥ 0.60 | ≤ 0.14 | 0 / 0 | — |
| u10 p13 (L1) | 2017h29a-q091 ウ | **14 → 8** | 0.59 → 0.69 | 0.49 → 0.23 | **5 / 0 → 0 / 0** | `れるおそれがある` |

The calibration HIGH (ed 0.14 / Dice 0.52) is not reached by any patched text after patching except the u08 p01 19-char node label (wDice 0.67, short-label artefact; ed 0.21 > calibration; masked 0; §4 obs. 6). Four patches reduce a pre-existing overlap (u07 p01 with q087's stem phrase, u08 p01 with q095's premise clause, u10 p13 with q091 correct ウ's phrase, u06 p04 with q067 エ's scene).

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u06 | p01–p03 | `terms[5].analogy_*` | **M1** | **Yes** (§3.1) | No | OK |
| u06 | p04–p06 | `terms[2].points[1].text_*` | L1 | Yes: q067's wrong-choice scene (other person's PC + remote operation) removed; still states backdoor use = cyberattack, consistent with q067 correct ア (non-cyber dumpster diving) and with `points[0]` / `key_points_*[1]` (re-entry). Bold 2 / `[[jp:]]` 1 in zh / en unchanged | No | OK |
| u06 | p07, p08 | `terms[4].one_zh`, `overview_rows[4].one_line_zh` | L11 | Yes: 滥用 = jp 悪用 / en "abuses" | No | OK |
| u06 | p09, p10 | fig `steps[2].caption_en`, `key_points_en[0]` | L12 | Yes: "again and again" = jp 繰り返し; "continually" = jp 持ち出し続ける | No | OK |
| u07 | p01–p03 | `terms[2].points[1].text_*` | **M1** | **Yes** (§3.2) | No | OK |
| u07 | p04–p06 | `terms[5].points[1].text_*` | L1 | Yes: no longer lines up q063's correct pair {b, d} in one sentence; the point now gives load caused by successive forwarding. q063 correct エ (b + d) still supported (b here; d stays in `terms[5].detail_jp` 2nd sentence); does not support a / c. Consistent with `points[2]` (spreads by recipients' forwarding) | No | OK |
| u07 | p07–p09 | `overview_rows[5].extra_*[0]` | L2 | Yes: scope now "in email" = `key_points_*[4]` (電子メールのスパム = 迷惑メール) and `terms[5].detail_*` (SNS / board posts also called spam) | No | OK |
| u07 | p10 | fig `steps[2].caption_en` | L3 | Yes: "puts" = jp 置く / zh 放进 | No | OK |
| u07 | p11 | `terms[3].detail_zh` (+ explanation) | L4 | Yes: 在这类软件上 = jp 流れているファイル (scope = file-sharing software) | No | OK |
| u08 | p01 | fig `nodes[0].label.jp` | L1 | Yes: jp uses 「組」 (U+7D44; U+7EC4 组 absent, checked by codepoint); the 12-char exact window on q095's premise clause is gone | No (§4 obs. 6) | OK |
| u08 | p02–p05 | `terms[1].detail_*` (+ explanation), `key_points_en[1]` (+ summary) | L2 | Yes: n を k 個掛け合わせた / n 的 k 次方（k 个 n 相乘） / "n to the power k" — all = n^k, no n^(k+1) reading; key_points_en[1] = jp 種類の数を桁数の回数だけ掛け合わせた. Consistent with `points[0]` (2014h26h-q051 / 2019r01a-q080: ×n per digit, ×n² for 2 digits) | No | OK |
| u08 | p06 | `key_points_en[2]` (+ summary) | L3 | Yes: subject is the pair (user reuse), = jp 別のサイトと同じ組を使っていれば; consistent with `terms[2].points[0]` (2017h29h-q095 correct イ, reuse) | No | OK |
| u09 | p01–p03 | `terms[1].hook_*` (+ memory_hook, summary) | L1 | Yes: the "not documents" negation is gone; hook states what is forged (request). zh / en same claim | No (obs. 7) | OK |
| u09 | p04–p06 | fig `nodes[3].label.*` | L2 | Yes: ログイン状態の情報 = `points[1]` (Cookie = ログイン状態を保つ情報; 2017h29a-q091 correct ウ) — no longer implies the password itself leaks | No | OK |
| u09 | p07 | `pairs[1].rows[1].a_zh` | L13 | Yes: 对输入不做无害化处理就直接输出 = jp 入力を無害化せずに出力すること | No | OK |
| u10 | p01–p12 | `terms[3].one_*`, `terms[3].points[0].text_*`, `goals_*[1]`, `pairs[1].rows[0].label_*` (+ definition, overview.intro) | **M1** | **Yes** (§3.3) | LOW 建議修 F1 (goals_en nuance), records obs. 4–5 | OK, fix advised |
| u10 | p13–p15 | `terms[6].points[0].text_*` | L1 | Yes: jp grammar fixed (攻撃者**が**本人として扱われ); q091 correct ウ's phrase (Web サービスのアカウント) no longer echoed, ウ still supported ("the user's account is misused"); zh / en same | No | OK |
| u10 | p16 | `pairs[2].rows[2].a_zh` | L7 | Yes: 隐藏攻击来源 = jp 発信元を隠す (IP spoofing; 发件源 was mail-specific) / en "hiding the source" | No | OK |
| u10 | p17, p18 | `terms[0].detail_en` (+ explanation), `terms[1].points[1].text_en` | L7 | Yes: "their" agrees with "The attacker" (singular they); "protection against malware" = jp 端末のマルウェア対策; `[[jp:マルウェア]]` kept | No | OK |

## 3. Focused checks

### 3.1 u06 M1 — resolved

- The analogy now reads 「侵入先の家にある工具**も**使い、自分の道具は一つも**置いていかない**」 / 也借用…自己的工具一件也不留下 / "also uses the tools lying around the house and leaves none of their own behind". The 「だけ」/「持ち込まず」/ only / brings no tools image is gone in all three languages.
- Field agreement: `one_*` (メモリ上の処理**や** OS に標準で備わるツール), `detail_*` (処理の中身をメモリに読み込んで直接動かす = brings its own code, does not store it), `fig.data.rows[1].b` (OS に備わるツール**も**利用する), `overview_rows[5].extra_*[1]` (メモリ上の処理や OS に備わるツールを使う) all agree with "also uses house tools, leaves none of its own". 2nd sentence 「家に残る物が**ほとんど**無い」 / 几乎没有 / "almost nothing" matches the degree words in `detail_*` (消えやすい) and fig row 3 (残りにくい) and `points[0]` (逃れやすい); `key_points_*[4]` (ディスクに本体を残さない) is the literal counterpart of "leaves none of their own".
- D-204: no field now denies what the image carries. No cited question for this term (freq 0), so no correct answer to contradict. D-198: LCS 4 / wDice 0.10 / windows 0.

### 3.2 u07 M1 — resolved; the new claim is supported

- Old point only negated 2024r06-q087's wrong choice イ (SEO). New point: 「ダークウェブは接続した先にある情報の集まりを指す語であり、接続に使われることがある専用のソフトウェアそのものの名前ではない」 — none of q087's choices (RSS / SEO / XSS / ダークウェブ) is mentioned; the SEO wording is gone in all three languages (grep SEO / 搜索引擎优化 in `terms[2]`: 0).
- Factual check of the new claim: "dark web" names the content (sites / information reached over anonymising overlay networks), while the software used to reach it (e.g. a dedicated anonymising browser) is a separate thing with its own name; conflating the two is a real learner confusion and the point corrects it in the right direction. Correct.
- Against the cited question's correct answer: q087 (correct エ) = name-the-term stem, keywords: content (総称) + not found by ordinary search + anonymity + special software *may* be needed. The new point agrees on both relevant elements: the term denotes the content (情報の集まり / 信息集合 / body of content), and the software is something "sometimes used" to reach it (使われることがある / 有时 / sometimes) — the qualifier matches the stem's may-qualifier and `one_*`'s 場合もある / 有时 / some of it (D-204 scope alignment). It does not say software is always needed, nor that it is never needed.
- Against other fields: `one_*` (情報の集まり; 専用のソフトウェアを使わないと接続できない場合もある), `points[0]` (not in search results, anonymity → sometimes abused), `detail_*`, `overview_rows[2]`, `key_points_*[1]`, analogy (back-alley market = a place, not a tool) — no conflict; "information collection" vs "content" is consistent across jp / zh / en.
- Trilingual: zh 指的是连接之后所到达的信息集合，而不是有时用来连接的专用软件本身的名称 / en "the body of content you reach, not the name of the special software that is sometimes used to reach it" = jp. Bold 1 each, `[[jp:]]` 0 in zh / en (unchanged from before). en "special software" also appears in q087's en sidecar and in `one_en`; it is the plain 2-word term for the thing, not a copied frame (zh sidecar wording 特殊的软件 / 访问 not used; unit zh uses 专用软件 / 连接).
- D-198: vs q087 stem LCS 15 → (topic-wide nearest) 7, unmasked windows 8 → 0, masked 0; the pre-existing 遮蔽なし window (Rule A §1) is gone. D-200: 1 sentence, 60 normalised chars.

### 3.3 u10 M1 — resolved

All fields that taught the two as different things now present them as aliases / two views, in all three languages:

| Field | jp / zh / en after | Status |
|---|---|---|
| `terms[3].one_*` (+ definition) | …**設定状態** のことで、**第三者中継** とも呼ばれる / 也称为**第三方中继** / "it is also called **third-party relay**" | alias stated ×3 |
| `terms[3].points[0]` (mix) | 同じ意味で使われることが多い; 前者 = 設定の弱点の側、後者 = 悪用して送る側から見た呼び方 / 常常作为同一个意思使用 / "often used to mean the same thing … names it from the side of …" | alias + two viewpoints ×3; "攻撃の行為そのものではない" gone |
| `goals_*[1]` (+ overview.intro) | (第三者中継、別名 オープンリレー) … 行為の面 と 設定状態の面 を分けて説明できる / （第三方中继，又称开放中继）…这一面…这一面分开说明 / "(third-party relay, also called open relay), explain … as two sides of the same thing" | alias ×3; en nuance → F1 |
| `pairs[1].rows[0].label_*` | 主に指す面 / 侧重的方面 / Main focus | "what it refers to" (= different referents) gone ×3 |

- Unpatched fields that still distinguish act / configuration, re-read under the alias framing:
  - `terms[2].one_*` (第三者中継 = …させ、送信に利用する**行為**) — the act-side view; it does not deny the alias, and `terms[3].one` / `points[0]` immediately state it. Record only (obs. 4).
  - `terms[3].detail_*` (オープンリレーのサーバは…第三者中継の踏み台として使われる) — act-side use of the name; consistent with `points[0]`'s viewpoint split.
  - `overview_rows[2]` (第三者中継: 無関係な人が他人のサーバを経由させて送らせる; extra 中継を制限しないメールサーバ / メールサーバ) and `overview_rows[3]` (オープンリレー: 設定状態; extra 設定そのもの / メールサーバ) — read as the act view and the configuration view of one phenomenon, and both name the same abused object (the mail server); no row says they are different things.
  - `pairs[1].rows[1]` (関係: a 弱点を突いた結果として起きる / b 悪用を許す原因になる) and `rows[2]` (誰の側の話か: 外部の人 / 悪用されるサーバ) — read consistently with `points[0]` (前者は設定の弱点の側から、後者は…送る側から): row 1 = the cause / result relation between the two sides, row 2 = whose side each view describes. Rule A M1 deliberately kept rows[1..2]; three languages agree (结果 / 原因; result / cause; 外部人员 / 被滥用的服务器). Record only (obs. 5).
- No cited question (term_questions empty for both terms); topic-wide the pool has no question on either term (grep 第三者中継 / オープンリレー over all stems + choices: 0), so no correct answer can be contradicted. Syllabus ver6.5 lists 「第三者中継（オープンリレー）」 as one item (Rule A M1) — now matched. "同じ意味で使われることが**多い**" in `points[0]` vs the definite 「とも呼ばれる」 in `one` is compatible (a name that is also used, and a usage note).
- D-200: `terms[3].points[0].text_jp` 2 sentences, 80 normalised chars (≤100). Bold 2 / `[[jp:]]` 2 in zh / en; origins オープンリレー / 第三者中継 present in jp. validate jp-origin 0.

### 3.4 Other requested checks

- u08 p01: jp label 「サイト X で ID とパスワードの組が漏えい」 contains 組 U+7D44; 组 U+7EC4 not present (the verifier draft's simplified form was corrected as the patch reason states).
- Dropped qualifiers: all qid-carrying patched points keep their scope words (u06 p04 の一つ; u07 p04 余計な負担; u10 p13 おそれがある); no new restriction or generalisation found.
- D-205: no patch adds a version-bound count / structure claim.

## 4. Observations

**F1 — LOW 建議修, u10 `goals_en[1]` nuance differs from jp / zh.** jp 「…行為の面と…設定状態の面を**分けて説明できる**」 and zh 「…这一面与…这一面**分开说明**」 keep "explain separately (as two aspects)", while en says "explain … **as two sides of the same thing**" — it adds "same thing" and drops "separately". Not MEDIUM: all three state the alias in the parenthesis and describe two aspects, and none teaches them as different things; but the en goal no longer says the learner can distinguish the two aspects, which is what `pairs[1]` drills. Fix (derived `overview.intro_en` follows):

- `goals_en[1]`: For abuse of mail relaying (third-party relay, also called open relay), explain the **act** of abuse and the server **configuration** that allows it as two sides of the same thing. → For abuse of mail relaying (third-party relay, also called open relay), explain the **act** of abuse and the server **configuration** that allows it as two distinct aspects of the same thing.

Note: the current en wording is the text prescribed verbatim by Rule A u10 M1 (p09 = the auditor's `after`), so F1 is a refinement of the auditor's text, not a writer slip. Bold 2 kept; no `[[jp:]]` in this field before or after.

Records only, no fix:

4. LOW (checked, not missed), u10 `terms[2](第三者中継).one_*` still defines 第三者中継 as an 行為 while `terms[3].one_*` now says the 設定状態 is also called 第三者中継 — consistent under the viewpoint framing of `terms[3].points[0]`, and outside M1's scope by the auditor's explicit instruction. Also, `terms[2](第三者中継).one_*` / `overview_rows[2]` / `pairs[1]` never mention the alias on the 第三者中継 side; `terms[3].one` / `points[0]` / `goals` carry it. Adding "オープンリレーとも呼ばれる" to an act definition would itself conflict with オープンリレー = 設定状態, so leaving the alias on the オープンリレー side (as Rule A M1 prescribed) is the consistent choice.
5. LOW, u10 `pairs[1].rows[1]` (result / cause) is a cause–effect statement between the two viewpoints; it is consistent with `points[0]` and with the new label 主に指す面, kept as Rule A M1 specified.
6. LOW, u08 p01: the 19-char node label still has LCS 8 (IDとパスワード) and 2 unmasked ≤2-substitution windows / wDice 0.67 against q095's premise clause — the term's own premise (an ID / password pair leaks) in the shortest wording, no question frame or choice; masked 0, ed 0.21 (> calibration), exact 12-char match 0. zh / en (泄露了 ID 和密码 / "IDs and passwords leak") do not carry 组合 / pair; Rule A u08 L1 scoped the change to jp only and the meaning is the same.
7. LOW, u09 p03 en hook "'Forgery' here refers to a forged request to the server." is slightly circular and has no counterpart of jp's first sentence (フォージェリ = forgery (偽造)), which is redundant in English. Unchanged from before in that respect.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM introduced or remaining from patched findings: **0** (u06 M1 §3.1, u07 M1 §3.2, u10 M1 §3.3 resolved)
- LOW introduced: 建議修 1 (F1, u10 goals_en nuance); 記録のみ 4 (obs. 4–7)
- D-198: no copying in patched texts (masked windows 0 on all patched jp texts topic-wide; the only unmasked windows after patching are on the u08 p01 premise phrase); four patches reduce pre-existing overlaps
- validate 5/5 = 0 issues (4 pre-existing warnings in unpatched fields), parity 5/5 = 0 diff (30 / 27 / 22 / 39 / 37 locations), vitest textbook 162/162

**PASS** — all 52 active patches are applied with derived fields following, u06 M1 / u07 M1 / u10 M1 are resolved, the new u07 claim is factually correct and agrees with q087's correct answer and every other field, and no new HIGH / MEDIUM is introduced. F1 is advised, not required by the PASS condition. If applied, re-run validate / parity and record it as a patch.
