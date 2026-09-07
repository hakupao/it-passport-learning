# evidence — crosscheck A7 (中問共有前文の常設不変式) / S118

- 対象: D-144 段 5、Session 118
- 実装: `scripts/quiz-chumon-groups-build.mjs` (レジストリ生成) / `data/ip/quiz/chumon_groups.json` (レジストリ) /
  `scripts/quiz-keys-crosscheck.mjs` A7 (ゲート) / `scripts/quiz-chumon-fix-q086zh-S118.mjs` /
  `scripts/quiz-chumon-fix-q099-S118.mjs` (データ是正 2 件)
- 役割分離 (Rule D): 本文書は **writer** 側の記録。承認は別 subagent の reviewer が行う (自己承認しない)。
- 本版は S118 reviewer 指摘 (HIGH×2 / MEDIUM×3 / LOW×1) を反映した第 2 版。

## 1. A7 は何を検査するか

S117 §28h の教訓は「linkage-gap scanner には偽陰性がある (参照表記の揺れを拾えない)」だった。
真の不変式は scanner ではなく **登記簿ベース**である:

> 登録済み中問組の **全メンバー**の表示 stem が、**3 言語とも**その組の前文 probe を含む。

A7 (Layer A = committed data のみ、vitest からも走る) の検査項目:

| # | 検査 | 失敗メッセージ例 |
|---|---|---|
| 1 | 表示 stem (`translations/<exam>.json` の `stem_jp_clean` / `stem.zh` / `stem.en`) が空白除去後に組の probe を含む | `[A7] 2014h26a-q086: zh stem lacks group 2014h26a-mqA preamble probe (前文欠落 or 訳文ずれ)` |
| 2 | member が `questions.json` に実在し `exam_id` が一致 | `[A7] 2010h22h-q999: group 2010h22h-A のメンバーが questions.json に無い` |
| 3 | member が組をまたいで重複しない | `[A7] 2010h22h-q089: registry で 2010h22h-A と 2010h22h-B に二重所属` |
| 4 | translations にエントリがある / probe が 40 字以上 | `[A7] <id>: translations にエントリが無い` |
| 5 | `counts.groups` / `counts.members` が実数と一致 | `[A7] counts.members=137 vs 138` |
| 6 | **床** (MEDIUM-1): 組 ≥ 35・member ≥ 137。空/縮んだ登記簿で無条件 GREEN になるのを防ぐ | `[A7] registry の組が 3 組しかない (床 35 — 組が消えている?)` |
| 7 | **exceptions は reason 必須** (MEDIUM-2)。空文字/空白のみは免除しない | `[A7] 2010h22h-A/2010h22h-q089: exceptions.reason が空 — 理由の無い免除は禁止` |

- **probe = 前文を空白除去した先頭 40 字**。probe の下限も 40 に統一した (LOW: A7 側が 20 だったのを生成器の
  `PROBE_LEN` に揃えた。短い probe は誤命中しやすい)。床と `PROBE_LEN` は A7 内の名前付き定数
  (`A7_MIN_GROUPS` / `A7_MIN_MEMBERS` / `A7_PROBE_LEN`) で、組を増やしたら床も上げる旨をコメントに明記した。
- 前文全文一致にしないのは、メンバーによって前文末尾の 1 文が正当に欠けるため。例: `2014h26a-q086` は
  「図1は，表1に基づいて作成したアローダイアグラムである。」を jp/zh/en の 3 言語とも持たない (設問固有の正しい姿)。
- probe は **evidence の draft 前文**から取る (表示層から取ると壊れた表示を正として焼き付けてしまう)。
  偽 RED リスク: 将来 normalize (句読点・全半角・空白) が前文の先頭 40 字に触れると、データは正しいのに A7 が落ちる。
  その場合は normalize を先に走らせてからレジストリを再生成する (probe は再生成で追随する)。生成器コメントに明記。
- `exceptions: [{id, reason}]` は member 単位の文書化済み例外。**現状 0 件** (データ側を直す方針)。

## 2. レジストリ `data/ip/quiz/chumon_groups.json`

`scripts/quiz-chumon-groups-build.mjs` が決定的・冪等に再生成する (`--check` で差分検出、差分ありなら exit 1)。

- **35 組 / 137 問** (第 1 版の 133 問から HIGH-1 で +4)
- 出所別:

| origin | 組 | 問 |
|---|---|---|
| `chumon_preamble_S114.json` | 6 | 24 |
| `chumon_preamble_S115.json` | 6 | 24 |
| `chumon_preamble_S116.json` | 3 | 12 |
| `chumon_preamble_S117_batch1.json` | 3 | 12 |
| `chumon_preamble_S117_batch2.json` | 11 | 44 |
| `chumon_preamble_S117_batch3.json` | 1 | 4 |
| `lightweight-copy D144s3` | 5 | 17 |
| 合計 | **35** | **137** |

- 抽出組 30 組 (全 `verification.verdict = PASS`。PASS 以外があれば生成器が throw)。
- lightweight COPY 6 件のうち **`2014h26a-q085 → q086` は登録しない**: 両メンバーとも抽出組 `2014h26a-mqA`
  (q085〜q088) に含まれるため、抽出組を優先し理由をレジストリ `notes` に残した。部分重複なら生成器が throw。
- COPY 組の probe は `quiz-chumon-lightweight-D144s3.mjs` と同じ `cut` / `section` / `strip` を再現して
  源設問の現 stem から切り出す。marker が消えていれば throw = COPY 表 drift の検出。

## 3. HIGH-1 — evidence の `member_ids` が源設問を落としていた (133 → 137)

S114 の 4 組は `member_ids` に「前文の出所となった設問」を含まない (前置の対象外だったため)。
`member_ids` を鵜呑みにすると組が実際より小さくなり、A7 の射程に穴が空く。

- 生成器に **EXPAND パス**を追加: 抽出組ごとに、同一 exam の中問レンジ **q085〜q100** のうち
  「3 言語とも probe を **先頭 (idx 0)** に持つ」設問を member に併合する。前文を先頭に持つ = その組の本文を
  共有している、という決定的な判定 (既に他組に所属する id はスキップ)。追加は必ずログに出す。
- 追加は **ちょうど 4 件**で、reviewer の指摘と完全一致:

```
note: EXPAND: 2010h22h-q089 → 2010h22h-A
note: EXPAND: 2010h22h-q093 → 2010h22h-B
note: EXPAND: 2011h23tokubetsu-q089 → 2011h23tokubetsu-A
note: EXPAND: 2011h23tokubetsu-q097 → 2011h23tokubetsu-C
```

### D-120 `data/ip/exams/groups.json` との突き合わせ (報告のみ、fail しない)

`groups.json` は raw (gitignored) なので**任意**。無ければ `skipped` と出して続行する。key は `-mq` を除いて正規化。

- **一致 8 組** (member 完全一致): `2011h23tokubetsu-C ↔ 2011h23tokubetsu-mqC` (4 問、q097 追加後に一致)、
  `2009h21h-mqA` / `2009h21h-mqB` / `2009h21a-mqC` / `2013h25h-mqD` / `2014h26a-mqA` / `2014h26a-mqB` / `2014h26h-mqD`。
- **不一致 0 組**。
- **registry に対応の無い groups.json の組 11 件** (`2012h24a-mqA` `2012h24a-mqC` `2013h25a-mqB` `2013h25a-mqC`
  `2013h25h-mqC` `2015h27a-mqC` `2015h27a-mqTech1` `2015h27a-mqTech2` `2015h27h-mqA` `2015h27h-mqC` `2015h27h-mqD`)。
  これらは共有**図**の組定義で、共有前文の抽出対象になっていない設問群 (例 `2013h25a-mqB`=q085〜088 に対し
  registry の `2013h25a-mqB2`=q089〜092 は別の組)。**A7 の欠陥ではなく今後の被覆候補**として記録する。

## 4. HIGH-2 — section 型 probe の汚染と `2013h25a-q099` の内容欠陥

D-144 段 3 の内容欠陥 (S117 §28c の lightweight (a) 型)。A7 を先に固めていたら**欠陥を正として凍結**していた。

- `quiz-chumon-lightweight-D144s3.mjs` は section 型の前文を `text.indexOf("〔要望事項〕")` で切り出していた。
  源設問 `2013h25a-q097` の jp/zh は**設問文自体に見出しを含む** (「これで改善できる〔要望事項〕として, 適切なものはどれか。」)
  ため indexOf がそこに食いつき、前文が汚染された:
  `〔要望事項〕として,適切なものはどれか。〔要望事項〕(1)利用者カードの利用者番` (第 1 版の probe)。
- その汚染前文が `2013h25a-q099` に前置され、q099 の jp/zh は **q097 の設問文で始まっていた**。
  en は原文に角括弧見出しが無い ("Which of the following requirements…") ため無傷だった。

**(a) 生成器の修正**: section 型は「**行頭**に現れる見出しのうち**最後の**出現」に錨を打つ (`lastLineStart`)。
新 probe は見出し + 本文になった:

```
jp: 〔要望事項〕(1)利用者カードの利用者番号及び書籍の識別番号をバーコードリーダで
zh: 〔需求事项〕(1)由于用户卡的用户编号及书籍的识别编号是用条形码阅读器逐个读取的
en: [Requirements](1)Becausetheusernumberont
```

**(b) データの是正** (`scripts/quiz-chumon-fix-q099-S118.mjs`、冪等、逐字一致 + 出現 1 回 assert):

```
2013h25a-q099 jp: 先頭の孤立文を削除 (727 → 704 字)
  removed: "〔要望事項〕として, 適切なものはどれか。\n\n"
  now starts: "〔要望事項〕\n(1) 利用者カードの利用者番号及び書籍の識別"
2013h25a-q099 zh: 先頭の孤立文を削除 (581 → 563 字)
  removed: "〔需求事项〕中，恰当的是哪一项？\n\n"
  now starts: "〔需求事项〕\n(1) 由于用户卡的用户编号及书籍的识别编号是"
✓ quiz-chumon-fix-q099-S118: 2 言語を是正 / en 不変 (1980 字) / choices 不変
```

是正後の probe 命中位置 (nsp 後の index):

| id | jp | zh | en |
|---|---|---|---|
| `2013h25a-q099` (前置先) | 0 | 0 | 0 |
| `2013h25a-q097` (源設問) | 111 | 86 | 215 |

q099 は 3 言語とも **idx 0** で en と揃った。源設問 q097 が idx > 0 なのは section 型の定義どおり
(前文が源設問の**末尾**の〔要望事項〕節であるため)。A7 は `includes` 判定なので正しく PASS する。

## 5. `2014h26a-q086` zh の是正 (第 1 版から継続)

- 組 `2014h26a-mqA` / q085 / q087 / q088: 「机械制造商S公司**将**嵌入产品X中的软件（…」
- q086 の zh のみ: 「机械制造商S公司**，将**嵌入…」 — 読点 1 つ多く probe に命中しなかった。jp/en は一致済み。

```
2014h26a-q086 zh: 置換区間 = 先頭〜'当X软件的开发按照表1' の直前 (328 → 327 字)
  first diff @8 / before: "机械制造商S公司，将嵌入产品X中的软件（" / after: "机械制造商S公司将嵌入产品X中的软件（以"
✓ quiz-chumon-fix-q086zh-S118: jp/en 不変を確認 (jp 426 字 / en 908 字)
```

設問固有文「当X软件的开发按照表1の…」は逐字不変。組前文末尾の「图1是根据表1绘制的箭线图。」は
q086 に jp/en とも元から無いため足していない。2 回目実行は冪等 no-op。

## 6. Mutation test (A7 が本当に落ちること)

`data/` をバックアップ → 変異 → 実行 → 復元 (md5 一致まで確認)。3 系統とも発火:

| # | 変異 | A7 の反応 |
|---|---|---|
| M1 | q086 zh の読点を戻す (表示層 1 文字) | `[A7] 2014h26a-q086: zh stem lacks group 2014h26a-mqA preamble probe` / exit 1 |
| M2 | registry に実在しない `2010h22h-q999` 追加 + `2010h22h-q089` を 2 組に所属 | 実在なし / 二重所属 / `counts.members=137 vs 138` の 3 件 / exit 1 |
| M3 | registry を 3 組に切り詰め + `reason: "  "` の exceptions | reason 空 / 組の床 35 / member の床 137 の 3 件 / exit 1 |

復元後、`md5` が変異前と一致することを確認し、再実行で GREEN に戻った。
→ A7 は「表示層の訳文ずれ」「レジストリの破損」「登記簿の切り詰め・骨抜き例外」の 3 方向で発火する。

## 7. コマンド出力サマリ

| コマンド | 結果 |
|---|---|
| `node scripts/quiz-chumon-groups-build.mjs` | `35 組 / 137 問 — probe 命中 411/411` / 更新 |
| `node scripts/quiz-chumon-groups-build.mjs --check` | `= data/ip/quiz/chumon_groups.json は生成結果と一致` exit 0 |
| `node scripts/quiz-keys-crosscheck.mjs` (full, raw あり) | `questions=2900 exams=29 layerB=ran` / `✓ all invariants hold (A1–A7, B1–B6)` exit 0 |
| `node scripts/quiz-keys-crosscheck.mjs --committed-only` | `✓ all invariants hold (A1–A7)` exit 0 |
| `cd apps/web && pnpm vitest run` | `Test Files 33 passed \| 1 skipped (34)` / `Tests 501 passed \| 2 skipped (503)` |
| `cd apps/web && pnpm tsc --noEmit` | 出力なし / exit 0 |

- vitest 501 件 = S117 baseline 491 → 第 1 版 500 (並行レーン由来 +9) → 本版 **+1** (MEDIUM-3 で追加した
  `chumon_groups.json --check` ゲート)。skip 2 件は実行時条件付き skip で、`apps/web/src` に `.skip` リテラルは無い。
- `--check` を vitest に載せたので、登記簿の手編集や出所との乖離も CI で落ちる。

## 8. 本レーンで触れたファイル

| ファイル | 種別 |
|---|---|
| `data/ip/quiz/chumon_groups.json` | 新規 (レジストリ、committed。35 組 / 137 問) |
| `scripts/quiz-chumon-groups-build.mjs` | 新規 (生成器。EXPAND / section 行頭錨 / groups.json 突き合わせ / `--check`) |
| `scripts/quiz-chumon-fix-q086zh-S118.mjs` | 新規 (q086 zh 是正、冪等) |
| `scripts/quiz-chumon-fix-q099-S118.mjs` | 新規 (q099 jp/zh 孤立文除去、冪等) |
| `scripts/quiz-keys-crosscheck.mjs` | A7 追加 + ヘッダ + 最終行 `A1–A7` |
| `apps/web/src/lib/quiz/__tests__/quizCorpusInvariants.test.ts` | 期待値 `A1–A7` + `--check` テスト追加 |
| `data/ip/quiz/translations/2014h26a.json` | q086 `stem.zh` 1 文字 |
| `data/ip/quiz/translations/2013h25a.json` | q099 `stem_jp_clean` / `stem.zh` 先頭の孤立文 |

raw 層 (`data/ip/exams/*`) / `questions.json` / `explanations/*` は不変。commit はしていない。
