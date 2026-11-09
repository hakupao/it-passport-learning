# b73 B3 patch re-review — technology-14-38 u01〜u03 (代表的なプログラム言語の種類、コーディング規約と構造化、ライブラリ・API と低コード開発)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the three Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b73rv/`: `check.mjs` / `same.mjs` / `d198.mjs` / `raverb.mjs` copied from `b68rv/` with only the unit map changed (3 units; all bases attempt `a1`, round `r0`: `b73-u01-a1` / `b73-u02-a1` / `b73-u03-a1`). `same.mjs` reads the 34 Rule A before / after pairs from `b73rv/ra.json`, copied by hand from the three Rule A "修正案" cells (`b73rv/mkra.mjs` writes it). `raverb.mjs` confirms all 68 strings verbatim in the Rule A files (miss 0). Unit-wide greps, `[[jp:]]` origin, the cited-question lookups and the cross-unit grep (§X) were run as one-off `node -e` commands (not saved). `extra.mjs` / `tgt_run.mjs` / `xgrep.mjs` were copied but not used (their unit maps are b68-specific; the same checks were run inline). No scratch files in the repo.
- Date: 2026-11-08 (Session 151, b73)
- Scope: the B3 wording patches for 3 units. **34 are `active`, 0 retired**, all part-level:

| Unit | Rule A | Patches | Mapping to Rule A prescriptions | Shortened |
|---|---|---|---|---|
| u01 (代表的なプログラム言語の種類) | **FAIL M1 / M2**, 建議修 L1 / L2 | p01–p11 | M1 → p01–p03 (`terms[0](C).detail_*`, compiler gloss); M2 → p04–p06 (`overview_rows[2](Java).extra_*[0]`); L1 → p07–p09 (`terms[2](Java).detail_*` applet sentence); L2 → p10–p11 (`terms[2].hook_zh/en`) | 8/11 (p01–p03, p07–p11) |
| u02 (コーディング規約と構造化) | **FAIL M1**, 建議修 L1–L3 | p01–p16 | M1 → p01–p02 (`terms[2](ネストの深さ).points[0].text_zh/en`, mix); L1 → p03 (`terms[4](モジュール分割).points[0].text_zh`, exam 2013h25h-q060); L2 → p04–p15 (`terms[5](メインルーチン).detail_*`, `fig.data.nodes[2..3].label.*`, `fig.steps[3].caption_*`); L3 → p16 (`terms[4].points[0].text_en`) | 6/16 (p01, p02, p04–p06, p16) |
| u03 (ライブラリ・API と低コード開発) | PASS, 建議修 L1 / L2 | p01–p07 | L1 → p01–p03 (`terms[2](WebAPI).one_*`); L2 → p04 (`terms[2].detail_en`), p05–p06 (`terms[2].fig.steps[0] / [2].caption_en`), p07 (`terms[4](ノーコード).detail_zh`) | 1/7 (p07) |

  Every MEDIUM and every 建議修 is covered. 記録のみ LOWs (u01 L3–L11, u02 L4–L8, u03 L3–L7) and O-items are not patched and not re-ruled here.
  - **Shortened strings**: **15 of 34** (`before` / `after` are phrases inside the Rule A strings; counted by script as patch `before` ≠ `ra.json` before). `same.mjs` confirms that base.replace(Rule A before, Rule A after) = unit field for **34/34**, so all shortened patches give the same result as the Rule A strings.
- Pre-patch bases, located by sha256 = `base_sha256` (validate --part prints the same sha):
  - u01 `data/ip/textbook/.planning/v2/technology-14-38-u01/parts/b73-u01-a1/technology-14-38-u01.loc.r0.json` `77c0065a478ded8a…`
  - u02 `.../technology-14-38-u02/parts/b73-u02-a1/technology-14-38-u02.loc.r0.json` `edbee24bb27991ec…`
  - u03 `.../technology-14-38-u03/parts/b73-u03-a1/technology-14-38-u03.loc.r0.json` `ccc69a41677a2254…`
- Merged units (current) `data/ip/textbook/units/technology-14-38-u0N.json` sha256: u01 `77320fa6b3849f79…`, u02 `23d17680527e7daf…`, u03 `83c4123eb0b36bc1…`. Each differs from its base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b68_patch_rereview.md` §0 (no unit-level patches in this batch). All 3 units share topic technology-14-38 (13 questions), so there are 65 source strings per language.

1. **Application check** (`b73rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b73rv/same.mjs`: Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b73rv/d198.mjs`, all 34 patches): whole-field LCS before → after and LCS of the `after` span against the 65 sources per language; jp also 12-char windows (unmasked / masked) and Dice.
4. **Cited-question checks** in `data/ip/quiz/questions.json` + `translations/<exam>.json`: 2010h22a-q054 (正答 ウ: 機種や OS に依存しないオブジェクト指向型; wrong ア markup / イ 科学技術計算向け / エ 事務処理計算向け), 2013h25h-q060 (正答 エ ロードモジュール; zh 装入模块 / en Load module), 2013h25a-q055 (compiler / interpreter figure; u01 O1).
5. **Cross-unit checks (key check of this batch)**: read u01〜u03 together with technology-14-37 u01 (擬似言語) / u03 (手続・関数), already v2, in jp (all fields) and in zh / en for the patched fields, on (a) compiler / interpreter, (b) subroutine / main routine / 手続 and "returns a result", (c) indentation / 字下げ and Python block scope, (d) module / load module terminology (§X).
6. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (per-unit §3), plus unit-wide greps for old wording and a unit-wide `[[jp:]]` origin check (space-normalized, all jp strings).
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit` (per unit), `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b68): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 135 / u02 134 / u03 103) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-38-u01   → ✓ 0 issues               EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs   --unit technology-14-38-u01   → ✓ 28 locations, 0 diff   EXIT=0
$ ... validate --unit technology-14-38-u02 → ✓ 0 issues  EXIT=0 | parity → ✓ 32 locations, 0 diff  EXIT=0
$ ... validate --unit technology-14-38-u03 → ✓ 0 issues  EXIT=0 | parity → ✓ 24 locations, 0 diff  EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part <base>   (one per unit)
  u01 loc#0 counts {"terms":7,"figs":1,"steps":4,"points":8,"pairs":3,"key_points":4,"goals":3}  sha256 77c0065a478ded8a…  ✓ 0 issues  EXIT=0
  u02 loc#0 counts {"terms":7,"figs":5,"steps":7,"points":5,"pairs":2,"key_points":5,"goals":3}  sha256 edbee24bb27991ec…  ✓ 0 issues  EXIT=0
  u03 loc#0 counts {"terms":5,"figs":2,"steps":4,"points":4,"pairs":2,"key_points":4,"goals":3}  sha256 ccc69a41677a2254…  ✓ 0 issues  EXIT=0
  (all 3 sha256 = base_sha256 of every patch in that unit; warn lines 0 in all 6 validate runs)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs (per unit):
  u01 active 11 ok 11 | issues [] | changed base-present = 11 patched + 'stage' | unexplained besides 'stage' 0 | derived 72, mismatch 0 | memory_hooks 21 bad 0, lens 6/6/6
  u02 active 16 ok 16 | issues [] | changed base-present = 16 patched + 'stage' | unexplained 0 | derived 72, mismatch 0 | memory_hooks 21 bad 0, lens 5/5/5
  u03 active 7 ok 7   | issues [] | changed base-present = 7 patched + 'stage'  | unexplained 0 | derived 57, mismatch 0 | memory_hooks 15 bad 0, lens 5/5/5
  base sha = base_sha256 for all 34; before count in base = 1 for all 34; replay mismatch 0
  base-only top keys (all 3): stage / round / jp_round (part metadata)
  net before remnant: 0 for 34/34 (raw and inline-stripped)
  bold counts unchanged in all 34; [[jp:]] counts unchanged in all 34
  derived followers (all true): u01 explanation_jp/zh/en of terms[0] (p01–p03) and terms[2] (p07–p09), memory_hook_zh/en of terms[2] (p10–p11);
      u02 explanation_jp/zh/en of terms[5] (p04–p06); u03 definition_jp/zh/en of terms[2] (p01–p03), explanation_en of terms[2] (p04), explanation_zh of terms[4] (p07)
  ruleA verbatim miss: [] in all 3 units
same.mjs (Rule A before → after on the base field):
  Rule A before occurs once in the base field: 34/34 (u01 11/11, u02 16/16, u03 7/7)
  base.replace(Rule A before, Rule A after) == unit field: 34/34 true
raverb.mjs: 68 Rule A strings, verbatim miss 0
[[jp:]] origin (all tags vs all jp strings, space-normalized): u01 7 kinds miss 0 | u02 9 | u03 6 — miss 0 in all
D-200 (patched 考点, jp chars without spaces / sentences; jp text not patched in either): u02 terms[2].points[0] (p01–p02, mix) jp 64 / 1;
  u02 terms[4].points[0] (p03 / p16, exam, qids [2013h25h-q060]) jp 53 / 1. All ≤100 / ≤2.
grep in the units (old wording, expect 0):
  u01 "機械語に翻訳するプログラム" 0 / "翻译成机器语言的程序" 0 / "into machine code in one go" 0 / "業務システム" 0 / "业务系统" 0 / "Business systems" 0 / "usiness" 0 /
      "現在は使われていない" 0 / "如今已不再使用" 0 / "no longer used" 0 / "所以它的标志" 0 / "which is why" 0 / "steaming" 0
  u02 "只是" 0 / "is only a way" 0 / "载入模块" 0 / "Translated programs" 0 / "戻ってきた結果" 0 / "結果とともに" 0 / "結果を使" 0 / "返回的结果" 0 / "带着结果" 0 /
      "用结果" 0 / "returned result" 0 / "returns a result" 0 / "Use the result" 0; "only" 3 (= terms[6].points[0].text_en "runs only when called",
      key_points_en[4] "needed in only one place" + summary copy; not the M1 field, both match jp)
  u03 "インターネット上のサービス" 0 / "互联网上服务" 0 / "on the internet" 0 / "the user" 0 / "using app" 0 / "业务负责人" 0;
      "インターネット" 1 (= terms[2].fig.steps[1].caption_jp, kept on purpose per Rule A L1); "calling app" 4 (3 patched fields + explanation_en)
  topic-wide (14-37 u01〜u05 + 14-38 u01〜u03): "载入模块" 0 / "装入模块" 1 (u02 p03) / "load module" 1 (u02 p16)
```

No validate warns in any of the 3 units (unit or part). `stage` meta is removed in all 3 units (as in b19–b68).

**Application.** All 34 `before` strings occur exactly once in their base field, all 34 `after` strings are present, and replay reproduces every patched field. Net `before` remnants are 0 for all 34. 15 are shortened phrases of the Rule A strings; all 34 give exactly the Rule A after text (same.mjs 34/34).

## U1. technology-14-38-u01 (Rule A FAIL M1 / M2, 建議修 L1 / L2)

### U1.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 7 → 7 (するプログラム, 2013h25a-q055 stem, unchanged text) | 7 (same); win12 0/0 → 0/0; Dice 0.16 → 0.16 |
| p02 | zh | 5 → 5 (成机器语言, 2011h23tokubetsu-q081 stem, unchanged main clause) | 的程序 (3) |
| p03 | en | 17 → 17 (" a program as a s", 2017h29h-q070 ウ, unchanged text) | "a program that t" (16, q055 stem) |
| p04 | jp | 1 → **2** (開発, 2010h22a-q054 イ) | 2 (same); win12 0/0 → 0/0; Dice 0.00 → 0.07 |
| p05 | zh | 2 → 2 (系统 → 开发, q054 イ) | 2 |
| p06 | en | 8 → 8 ("usiness " q054 エ → " develop" q054 イ) | 8 |
| p07 | jp | 9 → 9 (Web サーバから, 2012h24a-q073 stem, unchanged text) | れてい (3); win12 0/0 → 0/0; Dice 0.17 → 0.17 |
| p08 | zh | 11 → 11 (从 Web 服务器下载, unchanged) | 1 |
| p09 | en | 37 → 37 (" downloaded from a web server and run", q073 stem, unchanged text) | "ts are " (7) |
| p10 | zh | 2 → 2 (的标) | 2 |
| p11 | en | 8 → 8 ("he name " → "e, and i") | 8 |

- **Rise**: p04 +1 (開発, Dice 0.00 → 0.07 vs 2010h22a-q054 イ「科学技術計算向けに**開発**された言語」). The shared token is the generic verb 開発 (イ's "developed for" vs the cell's "system development"); the cell does not take イ's frame (科学技術計算向け). p06 shifts its 8-char nearest from エ "business" (the M2 problem) to イ " develop" — the same generic word. p07–p09 LCS is the unchanged applet definition (q073 is the applet question; the definition is the correct content). No patch adds a question's frame or element order.

### U1.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[0](C).detail_*` (+ explanation_*) | M1 | Yes (§U1.3) | No | OK |
| p04–p06 | `overview_rows[2](Java).extra_*[0]` | M2 | Yes (§U1.3) | No | OK |
| p07–p09 | `terms[2](Java).detail_*` 3rd sentence (+ explanation_*) | L1 | Yes: 「現在は**ほとんど**使われていない」/「如今基本上已不再使用」/ "are hardly used any more" — the universal claim is now a tendency; the reason clause (主要なブラウザが対応を終えた) is unchanged | No | OK |
| p10–p11 | `terms[2].hook_zh/en` (+ memory_hook_*, summary.memory_hooks_*) | L2 | Yes: zh「…爪哇岛，它的标志也是一只咖啡杯」/ en "…famous for coffee, and its logo is a coffee cup" = jp 並列「ちなむとされ、ロゴもコーヒーカップ」; the causal 所以 / which is why and the added "steaming" are gone. Pairing in summary.memory_hooks 21 / 0 bad | No | OK |

### U1.3 Focused checks — M1 (compiler gloss) and M2 (Java 主な用途)

- **M1 after (三語)**: 「**コンパイラ** (ソースをまとめて翻訳するプログラム) で機械語にしてから動かす」/「先经**编译器**（把源代码整体进行翻译的程序）转成机器语言再运行」/ "turned into machine code by a **compiler** (a program that translates the whole source in one go) before it runs". The gloss no longer fixes the output to machine code, so it now covers `terms[2].detail_jp`「コンパイラでバイトコードという中間形式に変換」 and `terms[2].fig.steps[1].caption_jp`「コンパイラが…中間形式のバイトコードに変換する」. The C fact stays in the main clause (で機械語にしてから動かす / 转成机器语言 / turned into machine code), and `terms[0].points[0]` (exam, unchanged) still says C → 機械語. The pair with the Python gloss 「**インタプリタ** (ソースを 1 文ずつ解釈しながら実行するプログラム)」 reads as a clean contrast (まとめて翻訳 / 1 文ずつ解釈しながら実行). 2013h25a-q055 (u01 O1, compiler / interpreter figure) is still solved from these two glosses.
- `goals_jp[1]` / `overview.intro_jp`「**コンパイラ** で機械語に翻訳してから動かす言語と、**JVM** やブラウザの上で動く言語」 and `overview_rows[0/1/3].extra_jp[1]`「コンパイラで機械語に翻訳」 (C / Fortran / C++) are unchanged. They describe the languages compiled **to machine code** vs languages run on a JVM / browser; after M1 they no longer read as "Java does not use a compiler", because the definition of コンパイラ itself is no longer machine-code-only (Obs. 2).
- **M2 after**: 「大規模なシステム開発」/「大型系统开发」/ "Large-scale system development" = `pairs[1].rows[1].a_*`「大規模な開発にも向く汎用言語」/「也适合大型开发的通用语言」/ "…suited even to large-scale development". vs **2010h22a-q054**: 正答 ウ (機種や OS に依存しないオブジェクト指向型) is still supported by `one_line`「JVM があれば機種や OS を問わず動くオブジェクト指向言語」 and `extra[1]`「バイトコードを JVM が実行」; wrong エ (事務処理計算向け / en "business data processing") now gets no support (「業務」/ "Business" 0 in the unit); wrong イ (科学技術計算向け) gets none either (the shared 開発 is not a purpose); ア (markup) none. Fortran keeps 科学技術計算 as its own row, so the purposes in the table stay disjoint.
- Parity 28 / 0 diff. **u01: M1 / M2 / L1 / L2 resolved.**

## U2. technology-14-38-u02 (Rule A FAIL M1, 建議修 L1–L3)

### U2.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | zh | 3 → 3 (出来的, unchanged) | 3 |
| p02 | en | 7 → 7 ("es the ") | " is a " (6) |
| p03 | zh | 5 → 5 (的机器语言, 2013h25h-q060 stem, unchanged) | **装入模块 (4, 2013h25h-q060 エ zh = 正答)** |
| p04 | jp | 5 → 5 (プログラム, unchanged) | 処理 (2); win12 0/0 → 0/0; Dice 0.11 → 0.12 |
| p05 | zh | 3 → 3 (，就能, unchanged) | 处理 (2) |
| p06 | en | 12 → 12 (" processing ", 2009h21a-q068 エ, unchanged word) | 12 |
| p07 | jp | 2 → 2 (処理) | 2; win12 0/0 → 0/0; Dice 0.06 → 0.06 |
| p08 | zh | 2 → 2 (处理) | 2 |
| p09 | en | 10 → 10 ("rocessing ") | 10 |
| p10 | jp | 4 → 2 (を使って → たと) | 2; win12 0/0 → 0/0; Dice 0.13 → 0.06 |
| p11 | zh | 2 → 1 | 1 |
| p12 | en | 9 → 6 | 6 |
| p13 | jp | 3 → 2 (結果を → 処理) | 2; win12 0/0 → 0/0; Dice 0.07 → 0.08 |
| p14 | zh | 2 → 2 (结果 → 处理) | 2 |
| p15 | en | 8 → **12** (" processing ", q068 エ) | 12 |
| p16 | en | 16 → 14 (" the computer ", 2010h22a-q054 ウ) | 14 |

- **Rises**: p15 +4 is the single word " processing " (the same word as in p06 / p09, which were already 10–12). p04 Dice +0.01. p03 「装入模块」 is the zh name of 2013h25h-q060's correct answer エ ロードモジュール: that is the L1 point (term name aligned with the quiz translation), a term name, not a frame. Several patches lower overlap (p10–p12, p16).

### U2.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p02 | `terms[2](ネストの深さ).points[0].text_zh/en` (mix) | M1 | Yes (§U2.3) | No | OK |
| p03 | `terms[4](モジュール分割).points[0].text_zh` (exam, 2013h25h-q060) | L1 | Yes: 「**装入模块**（[[jp:ロードモジュール]]）」 = q060 エ zh 装入模块; 「载入模块」 0 topic-wide (14-37 u01〜u05 + 14-38 u01〜u03), so the reader sees one zh name. q060 エ still selected; ア オブジェクトモジュール / イ ソースコード / ウ テキストデータ get no support (the 考点 says linked + directly executable machine code) | No | OK |
| p04–p06 | `terms[5](メインルーチン).detail_*` 1st sentence (+ explanation_*) | L2 | Yes: 「処理が戻ってきたら次の手順へ進む」/「处理返回后再进入下一步」/ "once that processing returns" — no claim that every called process brings back a result | No | OK |
| p07–p12 | `terms[5].fig.data.nodes[2..3].label.*` | L2 | Yes: s3「処理が終わり呼び出し元へ戻る」/「处理结束，返回调用方」/ "Processing ends and returns to the caller"; s4「戻ったところから次の手順へ」/「从返回处进入下一步」/ "Continue with the next step". Agrees with `fig.steps[2]`「終わると呼び出し元の続きへ戻る」 and `pairs[1].rows[2].b`「呼び出し元の続きへ戻る」. en s4 drops "from where it returned" (jp 戻ったところから); the flow arrow s3 → s4 carries it, and the label is short like s1 / s2 | No (Obs. 4) | OK |
| p13–p15 | `terms[5].fig.steps[3].caption_*` | L2 | Yes: 「処理が戻ると、メインルーチンは次の手順へ進む。」/「处理返回后，主例程进入下一步。」/ "Once the processing returns, the main routine moves on to the next step." — same content as detail and s4 | No | OK |
| p16 | `terms[4].points[0].text_en` (exam, 2013h25h-q060) | L3 | Yes: "Machine code produced by linking translated programs, ready for the computer to run as is, is called a **load module**" — singular subject = singular complement; = jp 「翻訳したプログラムを結合し、コンピュータがそのまま実行できる形の機械語にしたもの」 and q060 en stem (machine-language program in executable form). Bold / `[[jp:]]` 1 / 1 unchanged | No | OK |

### U2.3 Focused checks — M1 (indentation no longer "only" visual)

- **After**: zh「**缩进**（[[jp:字下げ]]）是把层次在外观上表现出来的手段，所以把每一级的宽度统一加宽，深度也不会改变。」/ en "while **indentation** ([[jp:字下げ]]) is a way to show those levels visually, so widening every level uniformly leaves the depth unchanged." = jp「**字下げ** はその段を見た目に表す手段なので」 (no exclusive). 「只是」 0 / "is only a way" 0 in the unit.
- vs `terms[0](字下げ).detail_zh/en` (unchanged): 「也有像 Python 这样用缩进决定代码块范围的语言」/ "some languages such as Python use indentation to decide where a block begins and ends" — no longer contradicted. The 考点 still keeps its point (nesting depth = structure; widening every level uniformly leaves depth unchanged), which is true for Python too.
- vs u01 Python detail 「字下げ (インデント) で処理のまとまりを表す」 and 14-37-u01 擬似言語 「字下げで本体の範囲を示す」: consistent (§X (c)).
- L2 vs 14-37-u03 手続 (「結果の値を返さずに呼出し元へ戻る」) and its mix 考点 「手続 は値を返さないが 関数 は値を返す」: after p04–p15 no field in u02 says a called process returns a result (「結果」 left only in unrelated fields). The subroutine detail alias 「**関数** や **手続き**」 now fits both (§X (b)).
- Parity 32 / 0 diff. **u02: M1 / L1 / L2 / L3 resolved.**

## U3. technology-14-38-u03 (Rule A PASS, 建議修 L1 / L2)

### U3.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 6 → 6 (の Web , 2022r04-q061 stem, unchanged) | データを (4); win12 0/0 → 0/0; Dice 0.13 → 0.13 |
| p02 | zh | 5 → 5 (" Web ", unchanged) | 的功能 (3) |
| p03 | en | 14 → 13 (" the function", 2009h21h-q060 stem) | 13 |
| p04 | en | 11 → 11 ("cesses the ", unchanged) | " function" (9) |
| p05 | en | 9 → 9 (" request ", 2012h24h-q055 stem, unchanged) | " request" (8) |
| p06 | en | 12 → 10 | 10 |
| p07 | zh | 2 → 2 (应用, unchanged) | 编程 (2) |

- No rises.

### U3.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[2](WebAPI).one_*` (+ definition_*) | L1 | Yes: 「**ネットワーク上**のサービスの機能やデータを、HTTP などの Web の通信で呼び出せるように公開した API」/「把**网络上**服务的功能和数据公开出来…」/ "an API published so that the functions and data of a service on a network can be called over web communication such as **HTTP**" — matches `pairs[0].rows[0].b` / goals / overview (ネットワーク越し / HTTP など); en now makes the API the thing published, = jp 「公開した API」 and `overview_rows[2].one_line_en` "An API published so it can be called over web communication". `fig.steps[1].caption_*`「インターネットの向こうで」 stays as the typical scene (Rule A: inclusion, not a contradiction) | No | OK |
| p04–p06 | `terms[2].detail_en` (+ explanation_en), `fig.steps[0] / [2].caption_en` | L2 | Yes: "The calling app" ×3 = jp 「利用する側 (のアプリ)」; the end-user reading of "the user" / "The using app" is gone ("the user" 0). Steps 0–3 now read app → service → (hidden) → app, as in jp | No | OK |
| p07 | `terms[4](ノーコード).detail_zh` (+ explanation_zh) | L2 | Yes: 「业务人员」 = jp 「業務の担当者」 (no 管理職 sense) | No | OK |

### U3.3 Focused checks

- No 考点 touched. Bold 2 / `[[jp:]]` 0 / 0 / 1 in `one_*` unchanged. Parity 24 / 0 diff. **u03: L1 / L2 resolved.**

## X. Cross-unit check — compiler / interpreter, subroutine / 手続, indentation, module (14-38 u01〜u03 + 14-37 u01 / u03, 三語)

| Axis | 14-38-u01 | 14-38-u02 | 14-38-u03 | 14-37-u01 | 14-37-u03 | Contradiction? |
|---|---|---|---|---|---|---|
| (a) compiler / interpreter | コンパイラ = ソースをまとめて翻訳するプログラム (p01–p03); C / Fortran / C++ → 機械語; Java → バイトコード (コンパイラ); Python / R / JavaScript 主にインタプリタ (= 1 文ずつ解釈しながら実行) | module detail 「ソースコードを翻訳・結合する段階」; ロードモジュール = 翻訳 + 結合 → 機械語 (jp 翻訳 / zh 编译 / en translated) | (2017h29h-q070 機械語 in challenge only, L6) | — | — | No — 翻訳 is now the general verb for compilers in u01 and u02; machine code is the C / Fortran / load-module result, bytecode the Java result. zh 编译 in u02 `points[0]` is narrower than jp 翻訳 (u02 L8, 記録のみ, untouched) |
| (b) subroutine / main routine / 手続 | — | main routine: 呼び出し → 処理が戻ったら次へ (p04–p15); subroutine: 終わると呼び出した側の続きへ戻る, 別名 **関数** / **手続き** | — | 擬似言語表: 戻り値の無い手続の宣言 / 戻り値を返して終わる | 手続 = 値を返さずに呼出し元へ戻る; 関数 = 結果を呼出し元へ返す; mix 「手続 は値を返さないが 関数 は値を返す」 | No — after L2 no u02 field says a called process always returns a result, so the 関数 / 手続き alias fits both 14-37-u03 senses. 手続き (u02) / 手続 (14-37) 送り仮名差 = u02 L8 (記録のみ); zh 过程 in both |
| (c) indentation / 字下げ | Python: 字下げ (インデント) で処理のまとまりを表す | 字下げ detail: 多くの言語では結果不変 / Python は範囲を決める; ネスト考点 (p01–p02): 段を見た目に表す手段 (no "only" in zh / en) | — | 擬似言語: 字下げで本体の範囲を示す; pairs: while / for … 字下げする | — | No — the only exclusive (zh 只是 / en only) is gone; every unit lets indentation mark block scope (Python, 擬似言語) and u02 keeps the depth-vs-appearance distinction |
| (d) module / load module | — | モジュール分割 = 役割ごとの部品; detail notes the other sense (翻訳・結合の段階のプログラム単位); ロードモジュール zh 装入模块 (p03) / en load module (p16) | ライブラリ = 部品 (plugin / library); O2 furniture images | — | 手続・関数 = 部品化 | No — 装入模块 1 / 载入模块 0 topic-wide, = q060 エ zh |

- **(a) 「コンパイラで機械語に翻訳」 vs Java**: `goals_jp[1]` and `overview_rows[0/1/3].extra[1]` (unchanged) still group C / Fortran / C++ as compiled to machine code and Java as JVM-run. With the gloss now neutral, Java's compiler-to-bytecode step (detail + fig) is a different output of the same tool, not a contradiction. The Rule A M1 cause (definition-level conflict) is removed; the goals wording is a contrast of execution paths and stays correct (Obs. 2).
- **(b)** The u02 subroutine `points[0]` en "runs only when called and then returns to its caller" (unchanged) has "only", but it = jp「呼び出されたときだけ動き」; it is a correct restriction, not the M1 type.
- u03 was not changed on axes (a)–(d) (its patches are WebAPI scope and "calling app"); its library / API wording does not touch compiler or subroutine terms.

## 4. F-fix

No required F-fix in any of the 3 units. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - validate: 0 warns in all 3 units (unit and part).
   - `stage` meta is removed in all 3 units (as in b19–b68).
   - ruleA verbatim miss = none. 15 of 34 patches use shortened phrases; same.mjs shows all 34 give the same field as the Rule A strings. No Rule A string in this batch starts with "…".
   - net remnant 0 for all 34.
   - Bases: all three `a1` / `loc.r0`. Patch paths in u01 / u02 carry labels (`terms[0](C)…`, `terms[5](メインルーチン)…`); they resolve in check.mjs / d198.mjs / same.mjs. u03 paths have no labels.
2. u01 `goals_jp[1]` / `overview.intro_jp` keep 「コンパイラ で機械語に翻訳してから動かす言語と、JVM やブラウザの上で動く言語」. After M1 this is a contrast of execution paths, not a definition, and is correct. If u01 is touched again, 「コンパイラで機械語に翻訳してから動かす言語」 could stay as is; nothing requires a change.
3. u01 p04 (M2) shares the generic verb 開発 with 2010h22a-q054 イ (Dice 0.07, LCS 2); it does not carry イ's purpose (科学技術計算向け), and Fortran keeps that purpose in its own row. Not a defect.
4. u02 p12 en node s4 "Continue with the next step" omits jp 「戻ったところから」/ zh 「从返回处」; the flow arrow from s3 ("returns to the caller") supplies it and the caption p15 says "Once the processing returns". It is the Rule A L2 text. Not re-ruled.
5. u02 zh 「编译后的程序」 in the load-module 考点 (u02 L8, 記録のみ) is unchanged by p03; p03 changes only the term name.
6. D-198 rises: u01 p04 +1 (開発); u02 p15 +4 (" processing ", the same word as p06 / p09), p04 Dice +0.01; u02 p03 term name 装入模块 = q060 正答 (the L1 content). All analysed in the per-unit §.1. Several patches lower overlap (u02 p10–p12, p16; u03 p03, p06).

## 6. Overall verdict

| Unit | Rule A | Applied | MEDIUM in scope | HIGH / MEDIUM / LOW introduced | Verdict |
|---|---|---|---|---|---|
| technology-14-38-u01 | FAIL (M1 / M2) | **11/11** | M1 resolved (compiler gloss = ソースをまとめて翻訳するプログラム, covers Java bytecode; C still → 機械語 in the main clause); M2 resolved (Java 主な用途 = 大規模なシステム開発 = pairs[1]; no support for q054 エ) | 0 / 0 / 0 | **PASS** |
| technology-14-38-u02 | FAIL (M1) | **16/16** | M1 resolved (zh 只是 / en only removed; agrees with 字下げ detail on Python block scope) | 0 / 0 / 0 | **PASS** |
| technology-14-38-u03 | PASS | **7/7** | — | 0 / 0 / 0 | **PASS** |

- **Application:** 34/34 exact (replay, part-level). 0 unexplained diffs, net `before` remnants 0, derived fields follow (201 checked, 0 mismatch), memory_hooks pairing 0 bad. 15/34 shortened, and all 34 give the same field as the Rule A string (same.mjs). Every MEDIUM and 建議修 is covered.
- **D-198:** no patch adds a meaningful overlap. The rises are generic words (u01 p04 開発, u02 p15 " processing ") or the term name the fix aligns on purpose (u02 p03 装入模块 = q060 正答 zh); win12 0/0 in all jp patches.
- **D-200:** patched 考点 u02 `terms[2].points[0]` (zh / en only, mix) jp 64 / 1, `terms[4].points[0]` (zh / en only, exam, 2013h25h-q060) jp 53 / 1; qids kept; no 考点 claim reversed. **D-202:** `[[jp:]]` origin miss 0 in all 3 units; bold / tag counts unchanged in all 34. **D-204 / 書き方 7:** u01 compiler gloss ↔ Java bytecode, u02 indentation 考点 ↔ Python detail, u02 main routine ↔ 14-37-u03 手続 no longer conflict; load-module zh name = quiz (§X). **D-205 / D-210:** no new law, standard version or numeric claim; u01 L1 weakens one universal claim.
- **Gates:**
  - validate --unit ×3: 0 issues / EXIT 0 (0 warns)
  - validate --part ×3: 0 issues, sha256 = base_sha256 for each
  - parity ×3: 0 diff (28 / 32 / 24 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS for all 3 units.** All 34 active patches are applied exactly, and the three MEDIUMs and every 建議修 LOW are resolved in context in all three languages:
- u01 p01–p11: compiler gloss no longer machine-code-only (Java bytecode consistent); Java 主な用途 = 大規模なシステム開発 (q054 エ no longer supported); applets "hardly used"; zh / en hook causal link and "steaming" removed.
- u02 p01–p16: indentation 考点 without zh 只是 / en "only" (= Python block scope in 字下げ detail); 装入模块 = q060 zh; main routine detail / fig nodes / caption no longer "returns a result" (= 14-37-u03 手続); load-module en sentence agrees in number.
- u03 p01–p07: WebAPI one = ネットワーク上 / API published (= overview_rows[2]); "calling app" ×3; zh 业务人员.

None of the patches introduces a HIGH, MEDIUM or LOW. No required F-fix.
