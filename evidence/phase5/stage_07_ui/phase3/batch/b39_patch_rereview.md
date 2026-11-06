# b39 B3 patch re-review — strategy-02-06 u01〜u03 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the three Rule A audits, and I share no context with them (Rule D)
- Date: 2026-11-07 (Session 149)
- Scope: B3 wording patches for strategy-02-06-u01 / u02 / u03 — **39 `active`, 0 retired** (u01 p01–p03 = 3, u02 p01–p17 = 17, u03 p01–p19 = 19; `patches/strategy-02-06-u0{1..3}.json`).
  Each patch was checked against the Rule A prescriptions (`strategy-02-06-u0{1..3}.ruleA.md`). Nothing left out.
  Coverage:
  - u01 (Rule A PASS, LOW 5, 建議修 1): L1 p01–p03.
  - u02 (Rule A PASS, LOW 14, 建議修 8): L1 p01–p03 / L2 p04–p06 / L3 p07 (en only, as prescribed) / L4 p08 (en only) / L5 p09–p11 / L6 p12–p15 (zh only) / L7 p16 (en only) / L8 p17 (en only, **deviation**, §4).
  - u03 (Rule A **FAIL**, MEDIUM 1 + LOW 8, 建議修 3): **M1 p01–p09** / L1 p10–p12 / L2 p13–p15 / L3 p16–p19 (p16 + p17 are two patches on the same field `terms[1].detail_zh`).
- Pre-patch bases, located by sha256 = `base_sha256`; all patches of one unit share one base, and each matches:
  - u01 `data/ip/textbook/.planning/v2/strategy-02-06-u01/parts/b39-u01-a1/strategy-02-06-u01.loc.r0.json` (`645d5e0afaafa60a…`)
  - u02 `data/ip/textbook/.planning/v2/strategy-02-06-u02/parts/b39-u02-a3/strategy-02-06-u02.loc.r0.json` (`2f5cd33a39aa544c…`)
  - u03 `data/ip/textbook/.planning/v2/strategy-02-06-u03/parts/b39-u03-a1/strategy-02-06-u03.loc.r0.json` (`af026c4c61e244dc…`)
- Merged units (sha256): u01 `ada5b4965b10c6a2…`, u02 `3921ff41b4aba6b7…`, u03 `24b15791d6242f5e…`. Base → unit differs only in the patched fields plus the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202〜D-205 / D-208〜D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only). Strings shown are unit text, patch text or term names.

## 0. Method

Same as `b38_patch_rereview.md` §0 (no `unit.*` patch here). Topic strategy-02-06 has 36 questions, 180 source strings per language.

1. **Application check** (`b39rr/check.mjs`, run unchanged): `after` present; `before` once in base; replay in file order = unit field; no `before` remnant (raw and stripped) anywhere in the unit; every changed base-present path explained; before / after verbatim in the Rule A file.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*`.
3. **D-198** (`b39rr/d198b.mjs`): whole-field LCS before → after and `after`-span LCS vs 180 sources per language; jp 12-char windows (≤2 substitutions) unmasked / masked + wDice. Per-choice reading of 2023r05-q022, 2011h23a-q018, 2015h27h-q009, 2024r06-q032, 2019r01a-q001, 2012h24h-q009 in `data/ip/quiz/questions.json` (+ `stem_jp_clean`).
4. **M1 sweep**: every string field of the u03 unit (derived and summary excluded, they follow their sources) grepped for 暗号 / 加密 / crypto / 仮想通貨 / virtual currenc / 金融商品取引 / 金商 / 金融商品交易 / Financial Instruments, then each hit read in context.
5. **Primary source for M1**: FSA 第 221 回国会 法案要綱 (extracted text in the session scratchpad, `fsa221/youkou.txt`): 第一 1 (2) イ (イ) (l.31–36), 第二 1 (l.215–219), 第３ 施行期日 (l.225–231).
6. **Manual reading** of each patched field in context (whole term / pairs row / fig tree).
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` / `--part <base>`, `scripts/textbook-v2-parity.mjs --unit` (×3 each), `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

Not established (as in b14–b38): the unit files carry the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths.

## 1. Script results (fresh, 2026-11-07)

```
validate --unit strategy-02-06-u01: ✓ 0 issues  EXIT=0   parity: 30 locations, 0 diff  EXIT=0
validate --unit strategy-02-06-u02: ✓ 0 issues  EXIT=0   parity: 29 locations, 0 diff  EXIT=0
validate --unit strategy-02-06-u03: ✓ 0 issues  EXIT=0   parity: 27 locations, 0 diff  EXIT=0
  (no warning lines in any of the three)
validate --part (loc r0) u01 / u02 / u03: ✓ 0 issues each; sha256 645d5e0a… / 2f5cd33a… / af026c4c… = base_sha256  EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: 14 pass, 0 fail
check.mjs:
  u01 active 3 ok 3; issues 3 = 'remnant' p01–p03 (append type, below); changed base-present 4 = 3 patched + stage; derived 66 mismatch []
  u02 active 17 ok 17; issues 1 = 'remnant' p08 (append type); changed 18 = 17 patched + stage; derived 63 mismatch []
  u03 active 19 ok 19; issues 3 = 'remnant' p04–p06 (append type); changed 19 = 18 patched (p16+p17 one field) + stage; derived 60 mismatch []
  memory_hooks suffix: u01 bad [jp/zh/en[3]], u02 bad [jp/zh/en[3], jp/zh/en[4]], u03 bad []  (index artefact, below)
  ruleA verbatim miss: u01 [], u02 [p17] (= L8 deviation, §4), u03 []
```

**Application.**
- All 39 `before` strings occur exactly once in their base field; all 39 `after` present; replay in file order reproduces every patched field (u03 `terms[1].detail_zh` carries p16 then p17, both apply).
- **'remnant' hits = append-type patches, confirmed.** u01 p01–p03, u02 p08, u03 p04–p06: in each, `before` is a strict prefix of `after` (the patch appends a clause: 「、8 時間を超えるときは 1 時間以上」 / "or other transactions" / 「 (2026 年改正で金商法へ移管)」 etc.), and the hit path is the patched field itself. No `before` survives anywhere else. Real remnants: 0.
- Changed base-present paths: patched fields + the removed `stage` meta key (as in b19–b38). Unexplained diffs: 0.
- **memory_hooks 'bad' = index artefact, confirmed.** check.mjs compares `summary.memory_hooks_*[i]` with `terms[i]`, but the summary list is compact (only terms with a hook). u01 terms without hook: [2] 労働者派遣法 / [5] / [6]; u02: [2] 雇用契約. Re-run with compact indexing (summary[i] vs i-th hooked term): u01 4/4 ×3 languages bad 0, u02 5/5 ×3 bad 0. No hook field was patched in u01 / u02. u03 `terms[3].hook_en` (p19) → `memory_hook_en` follows, summary suffix ok.
- **ruleA verbatim:** 38/39 = Rule A prescribed text exactly. u02 p17 differs by design (§4).

**Derived fields.** 189 derived strings, 0 mismatch. Follow-through of patched sources: u02 `terms[1].explanation_*` (p09–p11) and `terms[5].explanation_en` (p17, `[[jp:…]]` → plain jp, as the spec); u03 `terms[2].explanation_*` (p01–p03), `terms[1].explanation_zh` (p16–p17), `terms[0].explanation_zh` (p18), `terms[3].memory_hook_en` (p19). No patched field feeds `summary.key_points_*` or `overview.intro_*`.

**Notation.** bold counts unchanged in all 38 fields. `[[jp:]]` unchanged except +1 where prescribed or justified: u03 p16 `[[jp:親事業者]]` (親事業者 is in `terms[1].detail_jp` ✓), u02 p17 `[[jp:不当景品類及び不当表示防止法]]` (in `terms[5].detail_jp` 「正式名称は「不当景品類及び不当表示防止法」」 ✓).

**D-198, before → after** (`d198b.mjs`): every jp field 12-char windows **0 / 0 → 0 / 0**; wDice max after 0.35 (u03 p07, vs 2023r05-q022 stem; the shared span is the headword 前払式支払手段). Longest after-spans are headwords / term names (前払式支払手段, prepaid payment instrument, work-completion contract), legal stock phrases (「使い方をして」 vs 2011h23a-q018 ウ, 6 chars, unchanged by p10; 「から6か月以内」 vs 2011h23tokubetsu-q091 stem, an unrelated question) or generic fragments (≤17 chars en). u02 p16 LCS 20 → 17 and p17 17 → 12 (away from sources). u03 p01 / p04 after-span 暗号資産 (4) vs 2023r05-q022 イ = term name. Nothing approaches the calibration HIGH (ed 0.14 / Dice 0.52).

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01–p03 | `terms[1](労働基準法).fig…children[1].label.*` | L1 | Yes (§3.5) | No | OK |
| u02 | p01–p03 | `terms[2](雇用契約).points[2].text_*` | L1 | Yes (§3.3) | No | OK |
| u02 | p04–p06 | `pairs[2].rows[1].b_*` | L2 | Yes: 「取引に付ける / 随交易提供的 / offered with transactions」 now matches detail and fig; 2023r05-q025 a (non-transactional prize) no longer reads as capped | No | OK |
| u02 | p07 | `terms[1].points[0].text_en` | L3 | Yes: "or similar" = jp 「など」 / zh 「等」 | No | OK |
| u02 | p08 | `terms[5].fig…children[1].children[0].label.en` | L4 | Yes: "purchases or other transactions" = jp 「商品の購入などの取引」 | No | OK |
| u02 | p09–p11 | `terms[1](準委任契約).detail_*` | L5 | Yes (§3.4) | No | OK |
| u02 | p12–p15 | `terms[3](特定商取引法).fig` zh labels | L6 | Yes: 「适用冷静期 / 不适用冷静期」 natural; 「邮购、网购」 Chinese 顿号; jp / en unchanged and consistent | No | OK |
| u02 | p16 | `pairs[1].rows[0].a_en` | L7 | Yes: "outsourcing company" = `terms[1]` detail_en / points[0].text_en usage; "client" now only for 派遣先 | No | OK |
| u02 | p17 | `terms[5](景品表示法).detail_en` | L8 | Yes, by a justified deviation (§4) | LOW obs. 3 | OK |
| u03 | p01–p09 | `terms[2](資金決済法).detail_*`, `terms[2].fig…children[2].label.*`, `pairs[1].rows[0].a_*` | **M1** | **Yes (§3.1)** | LOW obs. 1 | OK |
| u03 | p10–p12 | `terms[4](PL法).points[2].text_*` | L1 | Yes (§3.6) | No | OK |
| u03 | p13–p15 | `terms[2].points[0].text_*` | L2 | Yes (§3.2) | No | OK |
| u03 | p16–p17 | `terms[1](中小受託取引適正化法).detail_zh` | L3 ①② | Yes: 「发包方经营者（[[jp:親事業者]]）」 (no capital-relation sense), 「不当减少价款」 = 減額 (not 買いたたき) | No | OK |
| u03 | p18 | `terms[0](独占禁止法).detail_zh` | L3 ③ | Yes: 「缴纳课征金命令」 = en "surcharge" | No | OK |
| u03 | p19 | `terms[3](金融商品取引法).hook_en` | L3 ④ | Yes: "the system is also called J-SOX" refers to the internal control reporting system, = jp hook | No | OK |

## 3. Focused checks

### 3.1 u03 M1 (p01–p09) — 暗号資産 and the 2026 金商法等改正: **fully resolved**

Primary source (FSA 法案要綱): 第一 1 (2) イ (イ) — 暗号資産の売買、特定暗号資産の募集・売出し、暗号資産の借入れ等を業として行うことを金融商品取引業に含める (第二条第八項関係); 第二 1 — 暗号資産取引に係る規制を資金決済法から削除; 第３ 1 — 原則として公布の日から 1 年を超えない範囲内で政令で定める日から施行. Enactment 2026-07-15 (FSA bill list, Rule A §1-3).

After:
- detail jp 「…**暗号資産交換業** などがある (暗号資産の取引の規制は、2026 年 7 月成立の改正法で金融商品取引法へ移される)。」 / zh 「…（根据 2026 年 7 月通过的修订法，加密资产交易的规制将移至金融商品交易法）。」 / en "(under an amendment enacted in July 2026, the regulation of crypto-asset trading is moving to the Financial Instruments and Exchange Act)".
- fig label jp 「暗号資産交換業: 暗号資産の売買や交換を扱う (2026 年改正で金商法へ移管)」 / zh 「（2026 年修订后移至金融商品交易法）」 / en "(moving to the Financial Instruments and Exchange Act under a 2026 amendment)".
- pairs[1].rows[0].a jp 「支払・送金の手段 (前払式支払手段、送金など)」 / zh 「（预付式支付手段、汇款等）」 / en "(prepaid payment instruments, remittance and more)": 暗号資産 gone in all three.

Checks:
- **Accuracy of the version note.** 「成立」 (enacted, 2026-07) and 「移される / 将移至 / is moving to」 (future) match the bill: enacted, not yet in force on 2026-11-07, in force within one year of promulgation. 「暗号資産の取引の規制」 = the bill's own heading 「暗号資産取引に係る規制」 (第一 1, 第二 1). The current-law statement (暗号資産交換業 under 資金決済法 today) stays true, and the edition is now explicit → D-205 satisfied.
- **Sweep of every other field (method 4).** The only remaining crypto mentions in the unit are the three patched detail fields and the three patched fig labels (plus the fig node id `crypto`, not displayed). `terms[2]` one / analogy / hook / points[0] / quiz, `overview_rows[2]` (one_line + extra), `key_points[2]`, `goals[1]`, `overview.intro_*`, `challenge_questions` — none mentions 暗号資産 / 加密资产 / crypto. **No field still asserts, without an edition, that crypto belongs to 資金決済法.**
- **金商法 side not contradictory.** `terms[3]` one (「株式や債券などの有価証券の取引」), detail (開示・インサイダー・内部統制報告制度), hook, points[0] (mix: 資金決済法 = 支払・送金の手段, 金商法 = 値動きのある有価証券への投資), `overview_rows[3]`, `key_points[3]`, `pairs[1].b` (「株式や債券などの有価証券」, 開示・インサイダー, 投資家) — none says crypto is outside 金商法 or that 金商法 covers only securities; all are open (「など」) or describe the main scope. The pair contrast now reads: payment means vs securities, with crypto sitting in neither row, and the transfer stated in `terms[2]`. After entry into force, the 金商法 side is incomplete but not wrong. No new contradiction.
- **2023r05-q022** (which is a 前払式支払手段; correct ウ = 使用期限のない商品券; wrong イ = 暗号資産): the unit never classes 暗号資産 as a 前払式支払手段 (it is a separate business in the tree), and the note moves it further away. Supports ウ, not イ.
- **D-198**: fig / detail windows 0 / 0; after-span 暗号資産 (4) = term name.
- Residual: the jp fig label 「(2026 年改正で金商法へ移管)」 uses the noun 移管 without tense; read alone it could suggest the transfer is already done. The detail (「移される」) and zh / en labels (「修订后移至」 / "moving to") give the timing. LOW (obs. 1). Optional: 「(2026 年成立の改正で金商法へ移る予定)」.
- **Resolved.** M1 = 0 left.

### 3.2 u03 L2 (p13–p15) — 6-month exemption vs 2023r05-q022

- After jp 「商品券やプリペイドカードが典型で、使用期間が発行から 6 か月以内のものなどは規制の対象外となる。」 (whole point 95 chars stripped, 2 sentences, ≤100 D-200) / zh 「…自发行起使用期限在 6 个月以内的等不在规制范围内。」 / en "…typical, though those usable for no more than six months from issue, among others, fall outside the regulation."
- 資金決済法 4 条 2 号 + 施行令 4 条 2 項 (Rule A §1-3, FSA FAQ): instruments usable only within 6 months of issue are excluded from the 前払式支払手段 chapter. 「規制の対象外」 matches 「この章の規定は…適用しない」; 「など」 keeps the other 4 条 exemptions open.
- q022: explains why the correct option carries 「使用期限のない」; it does not touch the wrong options (bank transfer service / 暗号資産 / store points). No option wording reproduced (windows 0). The definition sentence is unchanged.
- **Resolved.**

### 3.3 u02 L1 (p01–p03) — 雇用 point without 「自ら指揮命令」

- After: 「正社員かどうかや勤務時間の長短は、雇用関係の有無を左右しない。その会社が直接雇い入れ、賃金を払う働き手は、その会社と雇用関係にある。」 (zh / en same).
- **Tension gone.** The point no longer names 指揮命令 as part of employment, so it agrees with `terms[2]` detail (派遣元 = 雇い主, 派遣先 directs), points[0] and the fig.
- **Still distinguishes 派遣.** The criterion is 「直接雇い入れ、賃金を払う」. A 派遣社員 is hired and paid by the 派遣元, not by the company where they work, so:
  - 2015h27h-q009 (which workers have an employment relationship with the sales company; correct イ = a・b・d): アルバイト / 契約社員 / パートタイマ → yes; 派遣社員 → no. Still yields イ, not エ.
  - 2024r06-q032 (correct イ = with 派遣元 only) and 2019r01a-q001 (correct エ = B社–Y氏 指揮命令関係; wrong ウ = B社–Y氏 雇用関係): the 派遣先 does not hire or pay → no 雇用関係. Consistent with points[0].
  - 2012h24h-q009 (correct エ = 労働者派遣契約書): points[1] unchanged.
- Sufficient condition only, as Rule A noted; true. D-198 windows 0 / 0.
- **Resolved.**

### 3.4 u02 L5 (p09–p11) — 準用 wording

- After jp 「民法の委任の規定が準用され (読み替えて当てはめられ)、」 / zh 「民法中关于委托的规定准用于它（比照适用），」 / en "The Civil Code provisions on mandate apply to it mutatis mutandis,".
- 民法 656 条 (この節の規定は、法律行為でない事務の委託について準用する): 準用 = apply with the necessary changes. The jp gloss 「読み替えて当てはめられ」 says exactly that; zh 「准用 / 比照适用」 replaces the opposite 「直接适用」; en "mutatis mutandis" is the standard legal term. The rest of the sentence (善管注意義務 「委任と同じく」) still reads correctly: the duty is the same.
- **Resolved.**

### 3.5 u01 L1 (p01–p03) — 労基法 34 条 1 項

- After jp 「休憩: 6 時間を超えて働かせるときは 45 分以上、8 時間を超えるときは 1 時間以上」 / zh 「…超过 8 小时须给予 1 小时以上」 / en "…, and at least 1 hour when it exceeds 8 hours".
- 34 条 1 項 (e-Gov, Rule A §1-3): 労働時間が 6 時間を超える場合においては少くとも 45 分、8 時間を超える場合においては少くとも 1 時間. Both tiers now present, in all three languages. No topic question asks about breaks. Fig node count unchanged.
- **Resolved.**

### 3.6 u03 L1 (p10–p12) — PL法 「思わぬ危険」

- After jp 「表示どおりの通常の使い方をしても思わぬ危険が生じる製品は、通常備えるべき安全性を欠いており、…」 / zh 「意外危险」 / en "poses an unexpected danger".
- 「思わぬ」 removes the reading that products with an inherent, expected danger (a knife) are defective. It fits PL法 2 条 2 項 (通常有すべき安全性) and the 指示・警告上の欠陥 type in detail.
- 2011h23a-q018 (which case brings PL liability; correct ウ = overheating and burns even when used as instructed; wrong ア resale price maintenance, イ misleading advertising, エ export control): burns from overheating under normal use are an unexpected danger → still selects ウ; none of ア・イ・エ is touched. Shared span 「使い方をして」 (6) unchanged.
- **Resolved.**

## 4. u02 L8 deviation (p17) — **accepted (justified)**

- Rule A prescribed: "In Japanese it is usually shortened to Keihin Hyōji Hō (its full title is Futō Keihinrui oyobi Futō Hyōji Bōshi Hō), and …".
- Applied: "It is the short name of the [[jp:不当景品類及び不当表示防止法]] (Act against Unjustifiable Premiums and Misleading Representations), and the Consumer Affairs Agency is in charge of it."
- Ruling:
  1. **The finding is fixed.** Rule A's problem was that "Its full title is …" repeated the en headword and lost the jp 略称 ↔ 正式名 information. The new text states that the term is a short name and gives the full jp title. With `one_en` showing **Act against …** ([[jp:景品表示法]]), the en reader now sees both names: 景品表示法 (short) and 不当景品類及び不当表示防止法 (full).
  2. **Fits the project's notation.** zh / en name jp legal titles through `[[jp:…]]`, whose source must exist in the jp text. The full title is in `terms[5].detail_jp` (「正式名称は「不当景品類及び不当表示防止法」」), so the marker is valid. A Hepburn romanization with macrons would be a second, unchecked spelling path; the [[jp:]] marker shows the real title.
  3. **Gates.** validate 0 / parity 0; `explanation_en` follows (marker → plain jp); D-198 LCS 17 → 12 (away from 2016h28h-q009's en stem).
  4. Residual: "It is the short name of …" makes the Act itself the subject of "short name" (strictly, its jp name is the short name), and the bracketed en gloss repeats the headword. Meaning is clear and nothing is wrong. LOW (obs. 3). Optional: "Its Japanese name is short for [[jp:不当景品類及び不当表示防止法]], and …".
- Not an F-fix: the deviation keeps the prescribed meaning and uses a better-supported mechanism.

## 5. Observations

No F-fix from this re-review. Records only:

1. LOW (u03 p04, new): jp fig label 「(2026 年改正で金商法へ移管)」 has no tense; detail and zh / en labels give the future timing. Optional: 「(2026 年成立の改正で金商法へ移る予定)」.
2. LOW (u03, after entry into force, not now): `pairs[1].b_*` / `terms[3].one_*` describe 金商法 by 有価証券 only. Open (「など」) and not exclusive, so not contradictory; once the amendment is in force a later edition could add 暗号資産 to the 金商法 side. Record for the post-施行 refresh.
3. LOW (u02 p17): "It is the short name of …" subject slip + repeated en gloss (§4 item 4).
4. Script notes (no content issue): 'remnant' hits = 7 append-type patches (u01 p01–p03, u02 p08, u03 p04–p06), path = the patched field; memory_hooks 'bad' = check.mjs indexes `terms[i]` against the compact `summary.memory_hooks_*` (0 bad when indexed by hooked terms); `stage` meta removed (as in b19–b38); 'ruleA verbatim miss p17' = the L8 deviation (§4).

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 1 in scope (u03 M1) → **resolved**; **0 introduced**
- LOW introduced: obs. 1 (u03 fig tense), obs. 3 (u02 p17 wording); obs. 2 is a future-edition note.
- **Application:** 39/39 exact (replay), 38/39 = Rule A prescribed text, 1 justified deviation (u02 p17). Every 建議修 applied: u01 L1; u02 L1〜L8; u03 L1〜L3, plus M1. Derived fields follow (189, 0 mismatch). 0 unexplained diffs, 0 real `before` remnants.
- **M1:** detail + fig labels carry an edition note matching the FSA 要綱 (enacted 2026-07, transfer to 金融商品取引業, in force ≤1 year); pairs[1].a no longer lists 暗号資産; no other field asserts crypto ∈ 資金決済法 without edition; 金商法 side not contradicted; 2023r05-q022 still → ウ.
- **D-198:** all jp windows 0 / 0 after; after-spans are headwords / term names / stock phrases.
- **Gates:** validate --unit 0 issues ×3 (no warnings), parity 30 / 29 / 27 locations 0 diff, validate --part 0 issues ×3 (sha256 = base_sha256), vitest textbook 162/162, patch tests 14/14.

**PASS.** All 39 active patches of strategy-02-06 u01〜u03 are applied exactly. u03 M1 is fully resolved, no patch introduces a MEDIUM or HIGH, and every 建議修 is applied (u02 L8 by a justified deviation). u03 can move from FAIL to PASS (D-199: MEDIUM 0 after B3).
