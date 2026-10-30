# Rule A 全数抽検 — strategy-01-02-u15 (アイデア発想の技法)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-10-30 (S139 b09)、repo HEAD `8b67ce1` + 作業ツリー (単元 JSON は未コミット = `b09-u15-a1` merge 結果 [jp#1 + loc#0]、`merged.json` とバイト一致、sha256 先頭 `569c3c9cac19bc70`)。
- **対象**: `data/ip/textbook/units/strategy-01-02-u15.json` (textbook-unit-v2)、用語 **3 / 3 = 全数** (ブレーンストーミング / ブレーンライティング / 親和図法) + 単元レベル。
- **基準**: D-195、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205。比較: `.planning/v2/strategy-01-02-u15/v1-original.json` (用語 3 語・`term_zh`・`term_en` とも v1 と一致、`unit_summary_jp`・`prerequisites` も v1 と同一)。
- **重大度**: 雛形どおり。過去問の題文・選択肢は、近似一致の該当語句を除き引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 3 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig / quiz` と単元レベル全フィールドを三語とも読んだ。派生 `definition_* / explanation_* / memory_hook_* / summary.key_points_*` の記法除去一致をスクリプトで確認 (不一致 0)。
2. **考点 × 引用題**: 考点 全 5 件 (exam 4 + mix 1)、qid 付き 4 件、引用延べ 6 = 異なり 5 題 (2016h28a-q015 / 2010h22h-q003 / 2026r08-q010 / 2018h30h-q020 / 2020r02o-q053)。全題 topic `strategy-01-02`。`data/ip/quiz/questions.json` の題文・選択肢・`correct_answer` を再読し 1 件ずつ照合 (§2)。
3. **quiz / challenge_questions**: quiz 計 3 枠 (用語 2 件)、challenge 3 題 (q015 / q020 / q010)。未引用は 2012h24h-q050 のみ (関係者が集まり思いつくリスクを自由に出し合う手法 = ブレーンストーミング、正答エ) で、one「思いつきを声に出し合い」で解ける。manifest の該当 6 題は全て使用。ブレーンライティングは全題の題文・選択肢に語の出現なし → 考点 mix のみは妥当。
4. **D-198 写し**: validate の copy guard = 0。独立照合: 単元の JP 文字列 72 本 (派生・summary・overview 除く、図ラベル・セル・caption・対比表を含む) × topic 全 98 題の題文 + 選択肢。
   - (a) 12 字連続・カタカナ 4 字以上と英数を遮蔽 (実字 6 未満の窓は除外): **0 件**。
   - (b) 12 字連続・遮蔽なし: **0 件**。
   - (c) 近似一致 (12 字窓・ハミング 1〜2): 遮蔽あり **0 件**、遮蔽なし 18 件 = 全て「ブレーンストーミング + 助詞 + 1 字」(用語名、偽陽性)。
   - (d) 文単位の最近接 (半大域 ed / bigram Dice): `terms[0].points[0]` ↔ 2018h30h-q020 題文 0.68 / 0.30、↔ 用語名のみの選択肢 0.73 / 0.40 (語の共有のみ)、`goals_jp[0]` ↔ 2010h22h-q003 題文 0.63 / 0.33、`key_points_jp[0]` ↔ 同 0.67 / 0.33。いずれも用語名の共有で、較正 (HIGH 例 ed 0.14 / Dice 0.52) から遠い。
   - (e) **構文の追従 = 1 件**: `terms[2].points[0].text_jp` ↔ 2020r02o-q053 題文。文全体 ed 0.68 / Dice 0.35、対応句 (「集団で…出し合った…をグループ…整理する手法」) だけなら ed 0.43 / Dice 0.51。語の並びが題の定義句と同順で、「アイディア → 案」「結果 → 削除」等の語替えで成り立つ。文全体は較正から遠く、題固有の場面 (目標の検討) を含まないので写し (HIGH) ではないが、**L1 建議修**。修正案は再測定済み (最近接 0.81 / 0.02、近似 12 字窓 0 件)。
   - (f) 目視 (カタカナの多い文 + 考点): `terms[0].points[1]` の「突飛」「歓迎」は 2010h22h-q003 正答と語を共有するが節の構成が異なり ed 0.79 / Dice 0.16。`points[2]`「案に乗った改良案」は 2018h30h-q020 正答の「便乗した改善案」と語順が近い短句 (ed 0.67 / Dice 0.19)、文の主張は別の言い方。問題なし。(iii) 具体例: 商品名の候補・催事の企画・「それは無理」・リレー小説・写真の山はいずれも引用題に無い自作。635 法の数値は引用題に無い一般知識。
5. **D-195**: one = 1 文 × 3 (太字あり)、detail 2〜3 文 (2/3/2)。定義前使用: 発散・収束は detail で定義、635 法はその場で説明。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が、zh・en 相当語): `freq_badge`「頻出」、`terms[0].hook_jp`「と覚える」1 件 (+ 派生 2)、en の every 内の very のみ → 定型句 0。図種: table static ×1 / flow steps ×2 = 登録内。pair 配置・各組 key 行 1 あり。
6. **D-200**: 考点数 3/1/1 (≤3 ✓)、各 JP 1〜2 文・31〜61 字 (≤100 ✓)。**framing 件数** (`validateV2.pointFraming` を実行、全考点): jp 0 / zh 0 / en 0。
7. **D-202 / D-203 / D-204 単元全体点検**: 書き方 7・観点 7: 「同時に書ける」(detail・pairs[0].rows[2]・図 step 1「各自が自分の用紙に」・analogy) は全て一致、「枠を先に決めない」(detail・図 step 2) も一致、「後に回す」(detail・fig 行 1・hook) も一致 → 不整合 0。比喩・hook が考点を否定する箇所なし。書き方 8 → §3 に列挙。書き方 9 → §2、落ち 0。§6 → 3 比喩とも別の場面 (蛇口 / リレー小説 / 写真)、定義の言い換えでない。§9 言い直し → L1、L6。
8. **D-205**: 改正される文書の構成・数は本単元に無い。ブレーンストーミングの「4 つのルール」は改正される文書の構成ではなく、635 法は「例えば」で提示。**該当なし**。
9. **三語**: zh・en が jp と同じ事実か、図ラベル・セル・行・caption の一致を確認。`[[jp:]]` 原語 8 種全て jp 本文に実在 (スクリプト)。one_zh / one_en の見出し語併記 = 3/3。zh 訳語は `zh_terms.unit.json` と一致 (头脑风暴 / 头脑写作 / 亲和图法)、発散・収束は表に無く 发散 / 收敛 (標準語) を使う。
10. **過去審査の解消**: JP #1 MEDIUM 1 (回覧板の比喩が「順番待ち」を運び「同時に書ける」と矛盾) = 解消・退行なし (リレー小説を人数分同時に、に変更)。#1 low のうち 4 ルール列挙の反復・図 step の言い直し・KJ 法 / 新 QC 七つ道具の未定義語・考点の「分類」語の近接 = 解消。#2 low 3 件のうち 考点の言い直しは L1、範囲の揺れは L1 で同時に解消、detail 1 文目は L6。訳 #0 low 7 件は未反映 → L3 / L4 / L5。
11. **関連単元 (u01〜u12)**: 「ブレーンストーミング / ブレーンライティング / 親和図 / 発散 / 収束」の語は u01〜u12 に出現なし、用語間の矛盾 0。u03 `terms[3].detail_jp` は新 QC 七つ道具に触れるが親和図法には言及せず衝突なし (→ O1)。他 topic: management-10-27-u03 `terms[0].points[1]` (リスク特定にブレーンストーミング等) は本単元の one・2012h24h-q050 と整合。
12. **機械ゲート**: §6。

## 2. 用語別判定 (3 / 3)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | ブレーンストーミング | OK — exam 3 / 4 題: その場で評価せず、質より量 (2016h28a-q015 正答ア; 2018h30h-q020 誤答エ・2010h22h-q003 誤答ア を否定) / 突飛な案を歓迎し実現性で絞らない (2010h22h-q003 正答エ / 2026r08-q010 正答エ = b のみ、a を否定) / 他者の案への便乗・改良を認める (2018h30h-q020 正答イ / q010 の b; 2010h22h-q003 誤答ウを否定)。q010 の c・q020 ウ (テーマに合うものを選びながら進める) は detail「評価や選別を後に回す」で否定。表 4 行は考点・key_points[0] と一致。限定条件は題の場面に依存しない一般則で落ちなし | OK | OK (太字 L4、訳 low L5) | L2, L4, L5 |
| 2 | ブレーンライティング | OK — mix 1 (qid なし): 声で出すか黙って紙に書くかの別、どちらも案を増やす手法。635 法 (6 人・5 分・3 案) は標準的事実で「例えば」付き。flow 4 段は one・detail と一致 | OK | OK (太字 L4、訳 low L5) | L4, L5, L6 |
| 3 | 親和図法 | OK — exam 1 / 1 題: 集団で出した案を後からグループ分けして整理 (2020r02o-q053 正答イ、誤答ウ ブレーンストーミングと段階を分ける)。「案」は題の前提どおり、one の「案や意見」と矛盾せず「だけ」と限らない。flow 4 段 (カード化→寄せる→見出し→関係図) は標準手順で one・detail・pairs[1] と一致 | L1 構文の追従 | OK (太字 L4、訳 low L3 / L5) | L1, L3, L4, L5, L7 |

**単元レベル**: goals 3・overview_rows 3・pairs 2 組 (各 3 行、key 1)・key_points 3・summary (記法除去版と一致)・challenge 3。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 7 (うち 建議修 3)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[2].points[0].text_jp` / `text_zh` / `text_en` | 2020r02o-q053 題文の定義句と語順が同じで語替えに近い (§1-4 (e)、句 ed 0.43 / Dice 0.51、文 ed 0.68 / Dice 0.35)。あわせて `one_jp` の言い直しで判断材料が増えない (JP #2 low)。主張は正答と一致 | jp「親和図法は、集団で出し合った案を後からグループに分け、整理する手法である。」→「親和図法が受け持つのは、複数人で出し終えた案の仕分けと整理で、案を出す作業そのものではない。」/ zh「**亲和图法**（[[jp:親和図法]]）是事后把集体提出的点子分组整理的方法。」→「**亲和图法**（[[jp:親和図法]]）负责的是把几个人已经提出的点子分门别类、加以整理，而不是提出点子本身。」/ en "The **affinity diagram method** ([[jp:親和図法]]) takes ideas a group has already produced and afterward sorts them into groups to organize them." → "The **affinity diagram method** ([[jp:親和図法]]) handles sorting and organizing ideas a group has already produced, not coming up with them in the first place." |
| L2 | LOW **建議修** | `terms[0].points[0].text_jp` | jp のみ「質より数」で、同用語の図・`key_points_jp[0]`・zh / en の `[[jp:質より量]]` はルール名「質より量」。考点が併記する原語が同じ考点の jp に無く、用語が揺れる。4 字のルール名で写しではない (修正後 最近接 0.68 / 0.30、近似窓 0) | jp「ブレーンストーミングでは、発言の良し悪しをその場で評価せず、質より数を優先する。」→「ブレーンストーミングでは、発言の良し悪しをその場で評価せず、質より量を優先する。」/ zh・en 変更なし |
| L3 | LOW **建議修** | `overview_rows[0].extra_zh[0]`、`overview_rows[1].extra_zh[0]`、`overview_rows[2].extra_zh[0]`、`goals_zh[2]` (+ 派生 `overview.intro_zh`) | jp の平易語「広げる / まとめる」に対し、zh は「发散 / 归纳」で術語と平易語が混ざり、pairs[1] の対「发散 / 收敛」(説明語 铺开 / 归拢) ともずれる。「归纳」は帰納の語感もある (訳 #0 low の残り) | `extra_zh[0]`: 「发散」→「铺开」(行 0・1)、「归纳」→「归拢」(行 2) / `goals_zh[2]`: 「知道发散点子和归纳点子这两个阶段，各该用哪种方法。」→「知道把点子铺开和把点子归拢这两个阶段，各该用哪种方法。」 |
| L4 | LOW | `terms[0].points[0..2].text_zh/en`、`terms[1].points[0].text_zh/en`、`terms[2].points[0].text_zh/en` | jp に無い `**` が zh / en の見出し語にあり (訳 #0 low)、`terms[1].points[0]` は片方の見出し語だけ太字。意味は変わらず validate も 0 | 記録のみ |
| L5 | LOW | `terms[0].detail_zh`「什么样的点子都能收集到」(jp「幅広く」より強い)、`terms[1].fig.steps[3].caption_en` "full of ideas"、`terms[2].detail_zh/en`・`pairs[1].rows[1].b_zh/en`「出齐」/ "finished set"、`terms[0].analogy_zh`「马上」、`terms[0].fig` 行 3・`key_points_zh[0]`「搭便车」(語感) | 訳 #0 low の残り。事実誤りなし | 記録のみ |
| L6 | LOW | `terms[1].detail_*` 1 文目 ↔ `fig.steps[1]`、`terms[1].detail_*` 3 文目 ↔ `pairs[0].rows[2].b_*`、`key_points_*[1..2]` ↔ 各 one | §9 同義の言い換え・対比の再掲。要点と対比表の役割の範囲で、対比は声 / 紙が pairs[0].rows[0] と mix 考点の 2 箇所 + 総表の列 (D-195 §3 の構造) = 許容 | 記録のみ |
| L7 | LOW | `terms[2].analogy_*`「似た雰囲気」/ `terms[1].hook_*` | 比喩の「雰囲気」は one の「内容の近さ」より感覚寄りだが否定はしない。hook は jp (writing の語) と zh / en (storming との差) で切り口が異なるが同じ結論 (localise の範囲) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 声 / 紙: `pairs[0].rows[0]`、`terms[1].points[0]` (mix)、総表 extra 列、`goals_jp[1]` は予告のみ → 許容。② 発散 / 収束: `pairs[1].rows[0]`、各 detail の定義、総表 extra 列 → 許容。

**範囲外の観察**:
- O1 v1 の「親和図法は新 QC 七つ道具の一つ」は本文から削除 (JP #1 low 由来)。全 question の題文・選択肢に「新QC」の語なし、u03 の系統の記述と矛盾もしない。事実誤りではなく学習上の欠落も小さい。
- O2 `2010h22h-q029` (management-09-26) の誤答に親和図法があるが、業務の流れを図にする手段ではないという判断は本単元の one で支えられ矛盾しない。

確認済みで問題なし: 限定条件 (考点 4 件全て、§2)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤61 字)、図の文字列の写し (独立照合 0)、`[[jp:]]` 原語 (8 種全て実在)、one_zh / one_en の見出し語併記 (3/3)、zh 訳語表、図種 (table static ×1 / flow steps ×2 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **7** (建議修 3: L1〜L3 / 記録のみ 4: L4〜L7) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 3 用語・考点 5 件 (qid 付き 4 件)・引用 5 題 + 未引用の quiz 1 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。LOW 建議修 3 件 (L1〜L3) は補丁 (B3) で修正推奨、L4〜L7 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node scripts/textbook-v2-validate.mjs --unit strategy-01-02-u15
✓ strategy-01-02-u15 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u15.json)
EXIT=0
$ node scripts/textbook-v2-parity.mjs --unit strategy-01-02-u15
✓ strategy-01-02-u15 parity: 22 locations, 0 diff
EXIT=0
```
