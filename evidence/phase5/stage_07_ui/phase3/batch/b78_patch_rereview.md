# b78 B3 patch re-review — technology-21-54-u01 (データベースと DBMS の基礎・NoSQL の種類)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audit, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b78rv/`: `check.mjs` / `d198.mjs` / `same.mjs` / `raverb.mjs` copied from `b76rv/` with only the unit map changed (1 unit, topic technology-21-54; base attempt `b78-u01-a1`, round `r0`) and `ra.json` replaced by the 14 Rule A before / after pairs, copied by hand from the Rule A L1 / L2 / L3 / L4 "修正案" cells (`#1` / `#2` keys for the two pairs on each `terms[1].detail_*` field, applied in order). Extra one-off `node -e` checks (topic question dump, unit-wide 関係 / relation / 关系 / backup / wait greps, cross-unit greps on 21-55 u01 / u02 and 21-57 u01 / u02, unit revert + sha, `unit_minutes.json` comparison) were run from the shell; no scratch files in the repo.
- Date: 2026-11-09 (Session 152, b78)
- Scope: the B3 wording patches for 1 unit. **14 are `active`, 0 retired**, part-level:

| Unit | Rule A | Patches | Mapping to Rule A prescriptions | Shortened |
|---|---|---|---|---|
| u01 (データベース方式) | **PASS** (HIGH 0 / MEDIUM 0 / LOW 10), 建議修 L1–L4 (L5–L10 記録のみ) | p01–p14 | L1 → p01–p03 (`terms[2].hook_jp/zh/en`, RDBMS hook: 「関係」= the table itself) + p04 (`terms[7].points[0].text_jp`, 「関係を表し」→「つながりを表し」); L2 → p05–p07 (`terms[3].hook_jp/zh/en`, NoSQL "Not only" hedged); L3 → p08 / p09 (`terms[1].detail_jp`), p10 / p11 (`terms[1].detail_zh`), p12 / p13 (`terms[1].detail_en`) (同時実行制御 "make others wait", 障害回復 "from backups and the like"); L4 → p14 (`goals_zh[0]`, 管理数据 → 管理数据库) | 8/14 (p04, p08–p14: `before` / `after` are the clause inside the field; the Rule A 修正案 itself is written as this same clause). p01–p03, p05–p07 are whole-field strings |

  All four 建議修 are covered (L1 hook × 三語 + jp points, L2 × 三語, L3 two clauses × 三語, L4 zh). 記録のみ LOWs L5–L10 and O1 / O2 are not patched and not re-ruled here.
  - **Shortened strings**: `same.mjs` confirms that each Rule A before occurs exactly once in its base field and base.replace(Rule A before, Rule A after) (in order, for the two pairs per `detail_*`) = unit field for all 11 fields / 14 pairs, so the shortened patches give the same result as the Rule A strings.
- Pre-patch base, located by sha256 = `base_sha256` (validate --part prints the same sha): `data/ip/textbook/.planning/v2/technology-21-54-u01/parts/b78-u01-a1/technology-21-54-u01.loc.r0.json` `75467c2c408beb5f…`
- Merged unit (current) `data/ip/textbook/units/technology-21-54-u01.json` sha256 `e61c15956e60eea5…` (= `.planning/v2/technology-21-54-u01/merged.json`, deep-equal). It differs from the base only by the 11 patched fields (14 patches) and the removed `stage` meta key (§1). Reverting the 14 patch texts in the unit file (in every location: field, `memory_hook_*`, `summary.memory_hooks_*`, `explanation_*` stripped form, `overview.intro_zh`) gives sha `1c9b77a6…` with `est_minutes` 39; with `overview.est_minutes` put back from 39 to 38 it gives `21aa8f2817703731` = the unit sha the Rule A audit states. So the Rule A subject is exactly this file minus p01–p14, and the only other change is `est_minutes` 38 → 39, recomputed by the patch tool from the longer text. **`unit_minutes.json` still says 38** (§1 G1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b76_patch_rereview.md` §0 (no unit-level patches). Topic technology-21-54 has 7 questions, so there are 35 source strings per language (7 stems + 28 choices).

1. **Application check** (`b78rv/check.mjs`): base sha256; `before` once in the base field; replay = unit field; every changed base-present path explained; net `before` remnant count; before / after verbatim (substring) in the Rule A file. Plus `b78rv/same.mjs`: Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field. `b78rv/raverb.mjs`: all 28 Rule A strings verbatim in the Rule A file.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing), plus `overview.intro_zh` (= `introOf(goals_zh)`). p01–p03 / p05–p07 have `memory_hook_*` and `summary.memory_hooks_*` copies; p08–p13 have `explanation_*` copies; p14 has `overview.intro_zh`. p04 (points) has none.
3. **D-198** (`b78rv/d198.mjs`, per-language choices): whole-field LCS before → after and LCS of the `after` span against the 35 sources of the patch language; for jp also 12-char windows and Dice.
4. **Cited-question check**: RDBMS `terms[2]` quiz = 2014h26a-q074 (正答エ = data as tables; 誤答イ = net-like links, ウ = tree) / 2022r04-q083 (正答ウ = 関係モデル for row-column tables); DBMS `terms[1]` quiz = 2009h21h-q058 / 2020r02o-q064 (正答ア = only a: consistency under concurrent access; b = DBMS orders by priority for shorter response time is wrong) / 2021r03-q075 (アクセス権管理・障害回復・同時実行制御 are DBMS functions, ファイアウォール is not); データベース `terms[0]` quiz = 2011h23a-q053 (正答エ = shared use with consistency; 誤答イ = makes backups unnecessary); challenge also 2016h28a-q077 (データ検索・更新 / 同時実行制御). NoSQL `terms[3]` and グラフ指向 `terms[7]` have no cited questions.
5. **Fact check** of the new wording: relational model terminology (relation = table), concurrency control by making other operations wait (locking), failure recovery from backups, NoSQL name reading.
6. **Remnant / wording greps** unit-wide: 「表で関係を表す」/ 表示关系 / "expresses relations", 「関係を表し」, 「Not only の略」/ 缩写 / "short for", 「処理の順番」/ 先后顺序 / "ordering operations", 「管理数据的软件」, and all 関係 / リレーション / 关系 / relation, バックアップ / 备份 / backup, 待た / 等待 / wait uses.
7. **Cross-unit**: technology-21-57 u01 (排他制御 / ロック / 待たせる), 21-57 u02 (障害回復: バックアップ + ログ), 21-55 u01 (関係データベース / テーブル / 共通のフィールド) and 21-55 u02 (E-R 図 リレーションシップ) scanned in all three languages.
8. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`. Plus (because `est_minutes` changed) `node scripts/textbook-unit-minutes-build.mjs --check` and `npx vitest run src/lib/practice/__tests__/practiceReader.test.ts`.

**Not established** (same as b14–b76): the unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches (and the recomputed `est_minutes`) changed relative to the Rule A subject. Unit-only paths (148 string paths) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-09)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-21-54-u01
  → ✓ 0 issues, 1 warning (zh-term terms[4](キーバリューストア).one_zh バリュー → 价值观 = Rule A L5 false positive)   EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-21-54-u01   → ✓ 35 locations, 0 diff   EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part <base>
  counts {"terms":8,"figs":6,"steps":3,"points":8,"pairs":3,"key_points":4,"goals":3}
  sha256 75467c2c408beb5f620d9e65a7b63679ef93b163f493efe902bf36c54ae2b4cd (= base_sha256 of p01–p14)   ✓ 0 issues, 1 warning (same zh-term)   EXIT=0
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node scripts/textbook-unit-minutes-build.mjs --check:
  ✗ data/ip/textbook/unit_minutes.json が生成結果と不一致 (内容差)   EXIT=1
  only difference: technology-21-54-u01  38 (file) → 39 (unit overview.est_minutes)
vitest practiceReader.test.ts: Tests 1 failed | 3 passed (4)
  FAIL "unit_minutes.json は生成器の出力と一致する (--check)"
check.mjs:
  active 14 ok 14 | issues [] | changed base-present = stage + the 11 patched fields | unexplained besides 'stage' 0
  base-only top keys: stage / round / jp_round (part metadata) | unit-only paths 148
  derived 84, mismatch 0 | memory_hooks 24 checked, bad 0, lens 8/8/8
  net before remnant: p01–p14 raw 0 / stripped 0
  bold: terms[1].detail_jp/zh/en 3→3, goals_zh[0] 2→2; all others 0→0 | [[jp:]]: terms[1].detail_zh/en 3→3; all others 0→0
  derived: terms[2].memory_hook_jp/zh/en, terms[3].memory_hook_jp/zh/en, terms[1].explanation_jp/zh/en = patched text (true ×9)
  ruleA verbatim miss: []
same.mjs: Rule A before occ in base 1 (14/14); base.replace(Rule A before, Rule A after) == unit field: true (11/11 fields)
raverb.mjs: 28 Rule A strings, verbatim miss 0
d198.mjs (per-language choices): topic qs 7, sources jp 35 / zh 35 / en 35
  p01 jp 5 → 8 ("関係データモデル", q074 stem) win12 0/0 → 0/0, Dice 0.07 → 0.18 | p02 zh 5 → 6 ("关系数据模型", q074 stem)
  p03 en 10 → 26 (" the relational data model", q074 stem)
  p04 jp 6 → 6 (after-span 3) win12 0/0 | p05 jp 3 → 4 ("になる。") win12 0/0 | p06 zh 2 → 2 | p07 en 9 → 9
  p08 / p09 jp 8 → 8 (after-span 6: 同時実行制御 q077 stem / バックアップ q053 cイ) win12 0/0 | p10 / p11 zh 6 → 6 (after-span 4)
  p12 / p13 en 19 → 19 (after-span 10: " consisten" q053 cエ / " backups a" q053 cイ) | p14 zh 5 → 5 (after-span 3)
unit revert: p01–p14 after → before in all locations → sha 1c9b77a6…; + est_minutes 39 → 38 → sha 21aa8f2817703731 (= Rule A stated sha)
  reverted unit vs base: base-present diff 0
```

**G1 — `unit_minutes.json` is stale (gate, not a text defect).** The patch tool recomputed `overview.est_minutes` 38 → 39 from the longer patched text (`textbook-v2-patch.mjs` header: "compat fields and est_minutes follow the patched text"), but `data/ip/textbook/unit_minutes.json` was not regenerated after the patches and still has `"technology-21-54-u01": 38`. It is the only unit out of step (all other 243 match). `textbook-unit-minutes-build.mjs --check` exits 1 and `practiceReader.test.ts` fails 1 test. In b76 the file was already regenerated (27 = unit). Fix: run `node scripts/textbook-unit-minutes-build.mjs` (minutes["technology-21-54-u01"] 38 → 39) before the b78 commit. It does not touch any patched text.

`stage` meta is removed in the unit (as in b19–b76). vitest `src/lib/textbook` is now 162/162 (the v1-snapshot test was adapted in the working tree; not in scope).

**Application.** Each `before` string occurs exactly once in its base field, each `after` string is present, replay reproduces all 11 patched fields (two patches each on `terms[1].detail_jp/zh/en`), net `before` remnant 0 for all 14. p04 and p08–p14 are shortened phrases equal to the Rule A strings and give exactly the Rule A after text (same.mjs true).

## U1. technology-21-54-u01 (Rule A PASS, 建議修 L1–L4)

### U1.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | **5 → 8** (「関係データモデル」, q074 stem), win12 0 → 0, Dice 0.07 → 0.18 | 8 |
| p02 | zh | 5 → 6 (「关系数据模型」, q074 stem zh) | 6 |
| p03 | en | **10 → 26** (" the relational data model", q074 stem en) | 26 |
| p04 | jp | 6 → 6 (unchanged part), win12 0 → 0 | 3 |
| p05 / p06 / p07 | jp / zh / en | 3 → 4 / 2 → 2 / 9 → 9 | 4 / 2 / 9 |
| p08 / p09 | jp | 8 → 8 (「アプリケーション」, unchanged part), win12 0 → 0 | 6 (同時実行制御 q077 stem / バックアップ q053 cイ) |
| p10 / p11 | zh | 6 → 6 | 4 |
| p12 / p13 | en | 19 → 19 ("oncurrency control ", unchanged part) | 10 (" consisten" q053 cエ / " backups a" q053 cイ) |
| p14 | zh | 5 → 5 | 3 |

- **Rises are a term name, not copying.** p01–p03 now contain the name 関係データモデル / 关系数据模型 / "the relational data model", which is also in the q074 stem. The name is already used in the same unit (`terms[2].one_*`, `terms[2].points[0]`, `overview_rows[2]`, `pairs[1].rows[0]`), it carries no option content, and the statement made with it (the table itself is the "relation") agrees with q074 正答エ and q083 正答ウ. Not D-198 (i)–(iii). jp 12-char windows are 0 before and after for every jp patch.
- p09 / p13 add "バックアップ" / "backups", which also appear in q053 誤答イ (DBMS makes backups unnecessary). The meaning is the opposite: recovery uses backups, so the new text argues against イ (§U1.4). p12 " consisten" is the unchanged "consistent" of the base sentence.

### U1.2 Per-patch verdict

| ID | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[2].hook_jp` | L1 | Yes (§U1.3) | No | OK |
| p02 | `terms[2].hook_zh` | L1 | Yes | No (see §U1.3 F1: zh `terms[7].points[0]` left unpatched) | OK |
| p03 | `terms[2].hook_en` | L1 | Yes | No (D-198 rise = term name, §U1.1) | OK |
| p04 | `terms[7].points[0].text_jp` | L1 | Yes | No | OK |
| p05 | `terms[3].hook_jp` | L2 | Yes (§U1.5) | No | OK |
| p06 | `terms[3].hook_zh` | L2 | Yes | No | OK |
| p07 | `terms[3].hook_en` | L2 | Yes | No | OK |
| p08 | `terms[1].detail_jp` (同時実行制御) | L3 | Yes (§U1.4) | No | OK |
| p09 | `terms[1].detail_jp` (障害回復) | L3 | Yes | No | OK |
| p10 | `terms[1].detail_zh` (并发控制) | L3 | Yes | No | OK |
| p11 | `terms[1].detail_zh` (故障恢复) | L3 | Yes | No | OK |
| p12 | `terms[1].detail_en` (concurrency control) | L3 | Yes | No | OK |
| p13 | `terms[1].detail_en` (failure recovery) | L3 | Yes | No | OK |
| p14 | `goals_zh[0]` | L4 | Yes (§U1.6) | No | OK |

### U1.3 Focused checks — L1 (RDBMS hook, 「関係」 = the table itself)

- **After (三語)**: jp 「R は Relational（関係）の頭文字。関係データモデルでは表そのものを「関係」（リレーション）と呼ぶので、「表でデータを管理する DBMS」と読める。」 / zh 「……在关系数据模型中，表本身就叫作“关系”（relation），所以可以读作“用表管理数据的 DBMS”。」 / en "R stands for Relational. In the relational data model a table itself is called a "relation," so read it as "a DBMS that manages data in tables.""
- **Fact**: in the relational data model a relation is a set of tuples presented as a table, and textbooks at IT Passport level say 「表を関係（リレーション）と呼ぶ」. The "R" therefore names the table form, not links between tables. Correct.
- **Cited questions**: q074 正答エ (collections of data in table form) is what the hook now says; 誤答イ (relationships among data as a net) is the reading the old 「表で関係を表す」 left open, and the new text excludes it (the "relation" is the table, not a link). q083 正答ウ (関係モデル = row-column tables) agrees. No wrong option of the 7 questions is supported.
- **In-unit consistency**: the hook's 「表でデータを管理する DBMS」/「用表管理数据的 DBMS」/ "manages data in tables" now equals `overview_rows[2].one_line_*` and `pairs[1].rows[2].a_zh`, and follows `terms[2].one_*` / `points[0]` (model that holds data as tables). p04 jp `terms[7].points[0]` 「RDBMS は表どうしを共通の項目で結び付けてつながりを表し、グラフ指向データベースはつながりをエッジとして直接持つ」 no longer uses 「関係」 for links, so the two senses do not collide in jp. Remnant 「表で関係を表す」 / "expresses relations" 0 fields; the remaining 関係 / relation uses are the model name, 関係データベース and the 相関図 analogy of `terms[7]` (「関係のある人同士」, everyday sense, no term claim).
- **F1 (LOW, recommended)**: the Rule A L1 cell kept zh `terms[7].points[0].text_zh` unchanged because it "says 表示联系", but the field actually reads 「RDBMS 用共同的项目把表与表关联起来表示**关系**，而图型数据库……则把联系作为边直接保存。」 So zh still uses 关系 for links between tables, right after p02 defines 关系 as the table itself — the same collision p04 removed in jp. Elsewhere in zh the link sense is 联系 (`terms[7].one_zh`, `overview_rows[7].one_line_zh`, the second half of the same sentence). Not a wrong fact and no cited question (`terms[7]` quiz `[]`), so LOW; not introduced by the patches (base text). en "expresses relationships" is fine (relationship ≠ relation in English). Suggested fix in §4.
- **Cross-unit**: 21-55 u01 `terms[1].points[1]` (records in separate tables are linked by a shared field) = p04 jp; 21-55 u01 `terms[3]` テーブル = 表形式 container of 関係データベース. 21-55 u02 E-R 図 uses 関連 (リレーションシップ) for links between entities, a different word from リレーション; the new hook uses 「関係」（リレーション） only for the table, so no conflict. zh 关系数据模型 / 关系数据库 match q074 / 21-55.

### U1.4 Focused checks — L3 (DBMS detail, 同時実行制御 / 障害回復)

- **After (jp)**: 「DBMS は、同じデータを何人もが同時に更新しても矛盾が出ないように、ほかの処理を待たせるなどして調整する**同時実行制御**を受け持つ。ほかにも、障害で壊れたデータをバックアップなどから元に戻す**障害回復**や、……**アクセス権管理**も DBMS の役割である。」 zh 「通过让其他处理等待等方式进行协调……」/「利用备份等把因故障而损坏的数据恢复原状的**故障恢复**」, en "coordinating operations, for example by making some wait, …" / "which restores data damaged by a failure from backups and the like". Three languages carry the same two additions; bold / `[[jp:]]` unchanged; `explanation_*` follow.
- **Fact**: concurrency control is mostly done by locking (排他制御), which makes other operations wait; 「など」/「等」/ "for example" leaves room for other methods. Failure recovery restores from backups and logs; 「など」/「等」/ "and the like" covers the log. Correct.
- **q064**: the wrong item b says the DBMS decides the processing order by transaction priority so that real-time response gets shorter. The old 「処理の順番を整える」/ 安排先后顺序 / "ordering operations" was close to b; the new text says "make others wait to keep consistency", which is item a (consistency under concurrent access, 正答ア) and contains no priority / order / response-time claim. b is not supported.
- **q053**: 誤答イ (DBMS makes backups for disk failure unnecessary). The new text says recovery works from backups, so the DBMS still needs them; イ is now contradicted rather than left open. 正答エ (shared use with consistency) = the 同時実行制御 sentence. **q075 / q077**: the 3 functions and their order are unchanged (Rule A L9 ruling stays the same); no firewall / virus check / normalization claim.
- **Cross-unit**: 21-57 u01 `terms[0].detail` / `points[1]` / `key_points[1]`: 排他制御 locks data and makes other processes wait (「他の処理を待たせる」/「让其他处理等待」/ "making other processes wait") = p08 / p10 / p12 wording. 21-57 u02: recovery restores the backup, then replays the log (`terms[3]`, `key_points[3]` "a backup alone cannot reproduce later updates"). p09 / p11 / p13 say "from backups and the like", which does not claim the backup alone is enough; consistent (O2).

### U1.5 Focused checks — L2 (NoSQL hook)

- **After (三語)**: jp 「No は「いいえ」ではなく Not only（〜だけではない）と読むのが一般的。……という意味になる。」 / zh 「No 一般不理解为“否定”，而是读作 Not only（不仅是）。这样读，……」 / en "No is usually read not as "no" but as "Not only." Read that way, …". The hook now has the same hedge as `terms[3].detail_*` (「とされ」/ 一般被解释为 / "usually read as"). Remnant 「の略」/ 缩写 / "short for" 0 in `terms[3]` (the remaining 略称 / 缩写 / "short for" are the KVS = Key-Value Store abbreviation, correct). The meaning (not rejecting SQL, allowing non-table forms) matches `terms[3].one` and O2 of Rule A. No cited question.

### U1.6 Focused checks — L4 (goals_zh[0])

- `goals_zh[0]` 「……与 **DBMS**（管理数据库的软件）。」 now matches jp 「それを管理するソフトウェア」 (それ = データベース), en "the software that manages it", `pairs[0].rows[0].b_zh` 「管理数据库的软件」 and `overview_rows[1].one_line_zh`. `overview.intro_zh` follows (= introOf(goals_zh), checked). Bold 2 → 2.
- Parity 35 / 0 diff. **u01: L1–L4 resolved; no new HIGH / MEDIUM. One pre-existing LOW (F1, zh) is now more visible next to p02.**

## 4. F-fix

No required text F-fix. The patches introduce no HIGH or MEDIUM defect.

- **F1 (LOW, recommended, not required)** — `terms[7].points[0].text_zh` (no derived copy):
  - jp: unchanged (already fixed by p04)
  - zh: 「RDBMS 用共同的项目把表与表关联起来表示关系，」→「RDBMS 用共同的项目把表与表关联起来表示联系，」(rest of the sentence unchanged; 「表示关系」 occurs once in the unit)
  - en: unchanged ("expresses relationships" is correct)
- **G1 (required gate, not text)** — regenerate `data/ip/textbook/unit_minutes.json` with `node scripts/textbook-unit-minutes-build.mjs`: `minutes["technology-21-54-u01"]` 38 → 39 (= unit `overview.est_minutes` after p01–p14). Needed before the b78 commit; `practiceReader.test.ts` fails until then.

## 5. Observations (record only)

1. G1 above: the patch step updated `est_minutes` but not `unit_minutes.json` (b76 had it regenerated). Worth checking that the patch / commit routine always reruns the minutes build.
2. O2: p09 / p11 / p13 name only backups as the recovery source (with など / 等 / "and the like"); 21-57 u02 adds the log. Consistent, no change needed at this unit's level.
3. O3: jp `terms[7].points[0]` now says つながり twice in one sentence (RDBMS side and graph side). It makes the contrast "how the link is held" clear; style only.
4. Script notes: copied from `b76rv/`; `ra.json` = 14 pairs (11 fields). `est_minutes` 38 → 39 is the patch tool's recompute (explains the Rule A sha difference). `stage` meta removed (as in b19–b76). Base is `b78-u01-a1` / `loc.r0`.
5. Rule A L5–L10 (zh-term warn false positive, 対比反復, §9 言い直し, name-expansion hooks, q075 D-209 record, ノード / エッジ order and zh 直訳調) and O1 / O2 stay 記録のみ, not re-ruled.

## 6. Overall verdict

| Unit | Rule A | Applied | MEDIUM in scope | HIGH / MEDIUM / LOW introduced | Verdict |
|---|---|---|---|---|---|
| technology-21-54-u01 | PASS | **14/14** | — (Rule A MEDIUM 0) | 0 / 0 / 0 (F1 = pre-existing LOW, recommended) | **PASS** |

- **Application:** 14/14 exact (replay, part-level). 0 unexplained diffs, net `before` remnant 0, derived fields 84 checked 0 mismatch (memory_hook / explanation / intro_zh follow), memory_hooks pairing 24 / 0 bad. p04, p08–p14 are shortened and give the same field as the Rule A strings (same.mjs 14/14 pairs, 11/11 fields). Reverting p01–p14 plus the recomputed `est_minutes` reproduces the Rule A unit sha `21aa8f2817703731`.
- **D-198:** rises only from the term name 関係データモデル / "the relational data model" (p01–p03, q074 stem, no option content); all others flat; jp windows 0. **D-202:** bold / tag counts unchanged. **D-204:** RDBMS hook = table form, matching `one` / `points[0]` / overview / q074 エ / q083 ウ; NoSQL hook hedge = detail. **D-205 / D-210:** no new claim; L3 wording now argues against q064 b and q053 イ.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 (1 warn = known zh-term false positive)
  - validate --part: 0 issues, sha256 = base_sha256
  - parity: 35 locations, 0 diff
  - patch tests: 14/14
  - vitest textbook: **162/162**
  - unit_minutes --check: **EXIT 1** (G1, 21-54-u01 38 vs 39); practiceReader.test.ts 1 fail for the same reason

**PASS** (patch re-review). All 14 active patches are applied exactly. L1 (「関係」 = the table itself, factually right, agrees with q074 エ / q083 ウ and 21-55), L2 (Not only hedged), L3 (同時実行制御 = make others wait, as 21-57 u01; 障害回復 from backups, as 21-57 u02; supports neither q064 b nor q053 イ) and L4 (goals_zh) are resolved in context. No required text F-fix; F1 (zh `terms[7].points[0]` 表示关系 → 表示联系) recommended. Required before commit: G1, regenerate `unit_minutes.json` (21-54-u01 38 → 39).

## 7. F1 / G1 追記 (fresh, 2026-11-09)

The writer applied F1 as patch **p15** (`terms[7].points[0].text_zh`, 「把表与表关联起来表示关系，」→「把表与表关联起来表示联系，」, base_sha256 75467c2c…), re-merged the unit and rebuilt `unit_minutes.json` (G1). I re-ran the checks:

```
check.mjs: active 15 ok 15 | issues [] | changed base-present = stage + 12 patched fields (+ terms[7].points[0].text_zh) | unexplained besides 'stage' 0
  p15 remnant raw 0 / stripped 0 | bold 0→0, [[jp:]] 1→1 | derived 84 mismatch 0 | memory_hooks 24 bad 0
  ruleA verbatim miss [p15]  (expected: p15 comes from this re-review's F1, not from the Rule A file)
unit: sha256 d2e7af4ca1a0d90f… (= merged.json, deep-equal); text_zh = 「RDBMS 用共同的项目把表与表关联起来表示联系，而图型数据库……则把联系作为边直接保存。」; 「表示关系」 0 in unit
validate --unit: 0 issues, 1 warn (zh-term false positive, L5)  EXIT=0
parity: 35 locations, 0 diff  EXIT=0
unit_minutes --check: = 生成結果と一致  EXIT=0  (technology-21-54-u01: 39 = overview.est_minutes 39)
vitest src/lib/textbook + practiceReader.test.ts: Test Files 14 passed, Tests 166 passed
node --test scripts/textbook-v2-patch.test.mjs: pass 14, fail 0
```

- p15 is applied exactly (the `before` clause occurs once in the base field; replay = unit field). zh now uses 联系 for links between tables, as in the second half of the sentence, `terms[7].one_zh` and `overview_rows[7]`, and no longer collides with p02 (关系 = the table itself). jp / en unchanged. No new issue; p15 does not change `est_minutes`.
- G1 resolved: `unit_minutes.json` matches the generator; practiceReader passes.

**Updated verdict: PASS, 15/15 applied, 0 new HIGH / MEDIUM / LOW, no open F-fix or gate item.**
