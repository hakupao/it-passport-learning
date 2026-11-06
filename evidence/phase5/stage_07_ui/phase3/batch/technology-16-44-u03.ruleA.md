# Rule A 全数抽検 — technology-16-44-u03 (信頼性設計)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S148 b29)、repo HEAD `a7987a84` + 作業ツリー (単元 JSON は未コミットの `b29-u03-a1` merge 結果、sha256 先頭 `62593cf44c703b2f`)。
- **対象**: `data/ip/textbook/units/technology-16-44-u03.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (デュアルシステム / デュプレックスシステム / ホットスタンバイ / コールドスタンバイ / フォールトトレラント / フェールセーフ / フールプルーフ) + 単元レベル (goals / overview_rows / pairs 4 組 / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-210、既知失敗型 (1)〜(10)。比較: `v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・限定条件落ち・写し / MEDIUM = 誤解を招く・題の支持しない限定・欄同士の不整合 / LOW = 文体・D-203 の low 類。題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (definition / explanation / memory_hook / summary / overview.intro) は本体の記法除去版で一致。
2. **考点 × 引用題 (考点 13 件 = exam 10 + mix 3、引用 qid 延べ 14 = 異なり 12 題、全て topic technology-16-44)**: 各題の stem_jp_clean・選択肢・正答を再読し、主張が正答と一致・誤答肢を支持しない・限定条件を保つことを 1 件ずつ確認 (§2)。並べ替え題 2015h27a-q082 (停止時間の短い順) を再導出: デュアル (片系故障でも残りが処理中) < ホット (起動済みへ即切替) < コールド (起動から) → 正答ア と一致。単元内に他の数値例なし。
3. **関連題の照合 (topic 外)**: 見出し語を含む全 2900 題を grep。**2017h29a-q087** (technology-16-43、正答 = デュプレックス: 従系は待機しつつ**他の処理を実行**) と 2016h28h-q075 (選択肢ウ = デュプレックスの記述: 待機系は別の処理をしながら待つ) が本単元の「待機系は処理をしない」記述と食い違う → M1。
4. **D-198 写し**: validate の copy guard 0 件。独立照合 = 単元 JP 文字列 151 本 (派生除く) × topic 46 題の題文 (stem_jp_clean) + 選択肢、12 字連続窓 (記号除去): **カタカナ 4 字以上・英数を遮蔽した版 0 件 / 遮蔽しない版 0 件**。近似照合 (文単位 Dice ≥0.4): 見出し語名同士 (フォールトトレラント↔フォールトトレランス、題の a〜c 項目名) のみ = 偽陽性。正答肢と構造が近い文を個別計測: ホット points[0]↔2014h26h-q056 ウ Dice 0.25 / ed 0.80、デュアル one↔2009h21a-q086 イ 0.37 / 0.85、フェールセーフ points[0]↔2009h21h-q065 ア 0.31 / 0.66、フールプルーフ one↔2015h27h-q064 エ 0.33 / 0.90、コールド one↔2014h26h-q056 エ 0.17 / 0.90 — 全て較正値 (HIGH 例 ed 0.14 / Dice 0.52) から遠く、標準定義の一般表現。カタカナの多い文 (見出し語の対比文) は目視で題文の言い回しなし。
5. **D-208 (iii) 選択肢なぞり**: validate の `warn choice-echo` 0 行。2016h28a-q067 (判断項目 ①〜④、正解 ①④) は「代表的な手段はハードウェアの多重化」とだけ述べ、項目の組・順をなぞらない (jp-review r1 の MEDIUM が解消済み)。2015h27h-q064 (名称を取り違えた 4 記述) は正答ウの内容のみ。2015h27a-q082 の並びは 3 つの考点に理由付きの一般原則として分かれ、題の記号・組を使わない → (iii) に当たらない。
6. **D-195 / D-200**: §9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `freq_badge`「頻出」と デュアル hook の「と覚える」1 件 (+派生 2) のみ。en の always / very、zh の 记住 は通常用法。考点数 2/2/1/2/2/2/2 (≤3)、各 JP 1 文・46〜67 字 (≤100)。**framing** (validateV2 `POINT_FRAMING`): jp 0 / zh 0 / en 0。図 = flow static ×3 (デュアル / フォールトトレラント / フェールセーフ)、flow steps ×2 (デュプレックス / コールド)、table static ×1 (フールプルーフ)、ホットは図なし — 全て登録内。
7. **三語**: zh・en が jp と同事実、図ラベル・表セル・比較行・caption 一致。`[[jp:]]` 原語 12 種全て jp 本文に実在、one_zh / one_en 7/7 に見出し語併記、zh 訳語は `zh_terms.json` どおり (容错 / 故障安全 / 防误操作 / 热备用 / 冷备用 / 可靠性 / 误操作)。デュアル=双工系统 / デュプレックス=双重系统 は OQ-15 の既知入替え (zh_terms `excluded`、v1 不変量) → 範囲外 O1。
8. **前回指摘の解消確認** (`journal.b29-u03-a1.jsonl`): jp-review r1 の MEDIUM 4 件 (FT detail の多重化対象を q067 の順で列挙 / pairs[3]「前提」行と key_points がフェールセーフから人の誤りを外す / フールプルーフ考点の「実行前に止める」限定 / key_points の系統数の規則) → 全て解消、退行なし。loc-review r1 の MEDIUM (多重化 = multiplexing) → redundancy 系に修正済み、zh 冗余化・hook_en failure・pairs b_en Not performed・[[jp:待機系]] 削除も反映。
9. **D-205 / D-210 / (10)**: 改訂される文書の構成数・法改正前の題・法定カテゴリの閉じた列挙は本単元に無い (該当なし)。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195〜D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | デュアルシステム | OK — 2 系統が同一処理を並行し結果を突き合わせる (2009h21a-q086 正答イ / 2012h24a-q057 正答エ; 誤答の多重プロセッサ・待機系切替・直列分担を支持しない) / 両系統が処理中なので片方故障でも続き、待機系へ移す構成より停止が短い (2015h27a-q082 正答ア、再導出一致) | OK | OK (en「in duplicate」は L6) | L5 / M1 (hook は任意修正) |
| 2 | デュプレックスシステム | 考点の事実は OK — 停止時間は待機系の状態で変わる (q082)。**ただし** one / caption / mix 考点 / pairs が「平常時は主系だけが処理、待機系は処理をしない」と限定し、2017h29a-q087 の正答 (従系は待機しつつ他の処理を実行) と食い違う | OK | OK | **M1** |
| 3 | ホットスタンバイ | OK — 待機系はいつでも処理できる状態で待ち、障害時に直ちに引き継ぐ (2014h26h-q056 正答ウ; 誤答イ [2 台同時稼働・相互チェック] = デュアルの記述を支持しない、hook「温まっている → すぐ動ける」はウを選ぶ) | OK | OK | なし |
| 4 | コールドスタンバイ | OK — 起動から始めるので停止時間はホットより長い (q082) / mix: 待機系が動いているか止まっているかが速さと費用の差。one「障害後に起動してから切り替える」は q056 の誤答エ (= コールドの記述) と一致するが、これはコールド自身の正しい定義で q056 の誤答を支持しない | OK | OK (en「at least」は L6) | L4 |
| 5 | フォールトトレラント | OK — 障害後も処理を続ける目的、単一故障が全体停止につながらない備え (2009h21h-q033 正答エ / 2015h27h-q064 正答ウ) / 代表手段 = ハードウェアの多重化 (2013h25a-q047 正答エ / 2016h28a-q067 正答イ ①④)。限定条件「一部」「単一の故障」保持 | OK | OK | L1 / L2 |
| 6 | フェールセーフ | OK — 機器の故障に限らず操作の誤りでも安全な状態を保つ (2009h21h-q065 正答ア; 誤答イ [正常部分だけ動作 = フェールソフト] を支持しない) / mix: FT は継続優先、FS は止めてでも安全優先。遮断機の比喩・hook は q064 の誤答ア (安全化をフールプルーフと呼ぶ)・イ (故障確率を下げる = フォールトアボイダンスをフェールセーフと呼ぶ) をどちらも退ける | OK | OK (zh「倒向」は L6) | L3 |
| 7 | フールプルーフ | OK — 人の誤操作に備え、間違えても危険な状態・誤った結果に至らない (2009h21a-q067 正答エ; 誤答ア = フェールセーフ、イ = FT、ウ = 故障確率ゼロ化 を支持しない) / 物理的に不能にするもののほか、例えば画面表示で見直させる (2019h31h-q090 正答ア / 2023r05-q093 正答エ)。「例えば」で例示に留め限定しない | OK | OK | L3 |

**単元レベル**: goals 3・overview_rows 7・pairs 4 組 (各 key 行 1)・key_points 3・challenge 4 題 (2015h27a-q082 / 2019h31h-q090 / 2023r05-q093 / 2009h21h-q033 — 全て本文で引用済み、矛盾なし)。quiz 欄は各用語の引用題の部分集合。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 7 (うち 建議修 1)** + 範囲外観察 2

### M1 (MEDIUM) — デュプレックスの待機系を「処理をしない」に限定 (題の支持しない限定 + 識別の手がかりが誤答を選ぶ、失敗型 (9) 類)

本単元は デュアル / デュプレックス を「平常時に 2 系統とも処理するか、主系だけが処理するか」で分け (terms[1].points[0])、手順図は「待機系は処理をせずに控えている」/ "the standby system does no work" と言い切る。IPA の 2017h29a-q087 (technology-16-43) の正答は、従系が**待機しつつ他の処理を実行している**構成をデュプレックスとし、2016h28h-q075 の選択肢ウもデュプレックスを「待機系は別の処理をしながら待つ」と記述する。本単元の物差しを q087 の場面に当てると「2 系統とも処理している」→ 誤答イ (デュアル) を選ぶ。引用題 (q082) とは矛盾しないので HIGH ではなく、題の支持しない限定 = MEDIUM。正しい区別点は「**同じ処理**をして結果を照合するか」(pairs[0].rows[0].a・rows[2] と一致)。

| field path | before → after |
|---|---|
| `terms[1].points[0].text_jp` | 「**デュアルシステム**と**デュプレックスシステム**は、平常時に 2 系統とも処理するか、主系だけが処理するかで分かれる。」→「**デュアルシステム**と**デュプレックスシステム**は、平常時に 2 系統とも同じ処理をして結果を照合するか、主系だけがその処理をするかで分かれる。」 |
| `terms[1].points[0].text_zh` | 「…的区别在于，平时是两套系统都处理，还是只有主系统（[[jp:主系]]）处理。」→「…的区别在于，平时是两套系统执行相同处理并核对结果，还是只有主系统（[[jp:主系]]）执行该处理。」 |
| `terms[1].points[0].text_en` | "…differ in whether both systems process in normal operation or only the primary system ([[jp:主系]]) does." → "…differ in whether, in normal operation, both systems run the same processing and compare the results, or only the primary system ([[jp:主系]]) runs it." |
| `terms[1].fig.steps[0].caption_jp` | 「平常時は主系だけが処理し、待機系は処理をせずに控えている。」→「平常時は主系だけが本来の処理を受け持ち、待機系はその処理をせずに控えている。」 |
| `terms[1].fig.steps[0].caption_zh` | 「平时只有主系统处理，备用系统不做处理，只是待命。」→「平时只有主系统承担本来的处理，备用系统不执行这项处理，只是待命。」 |
| `terms[1].fig.steps[0].caption_en` | "In normal operation only the primary system processes; the standby system does no work and simply waits." → "In normal operation only the primary system handles the main processing; the standby system does not run it and simply waits." |
| `terms[1].detail_jp` | 「主系は現用系とも呼ばれ、待機系は主系が故障したときに処理を引き継ぐ。」→「主系は現用系とも呼ばれ、待機系は主系が故障したときに処理を引き継ぐ。控えている間の待機系が、別の処理を受け持つこともある。」 |
| `terms[1].detail_zh` | 「主系统也叫在用系统，备用系统在主系统发生故障时接手处理。」→「主系统也叫在用系统，备用系统在主系统发生故障时接手处理。备用系统在待命期间也可能承担别的处理。」 |
| `terms[1].detail_en` | "The primary system is also called the active system, and the standby system takes over processing when the primary fails." → "The primary system is also called the active system, and the standby system takes over processing when the primary fails. While waiting, the standby system may also be given other work." |
| `pairs[0].rows[0].b_jp` / `b_zh` / `b_en` | 「主系だけが処理する」→「主系だけがその処理をする」/「只有主系统处理」→「只有主系统执行该处理」/ "Only the primary system processes" → "Only the primary system runs it" |
| 任意 (同じ向き) `terms[0].hook_jp/zh/en` | 「両方の系統がいつも働いている、と覚える。」→「両方の系統がいつも同じ処理をしている、と覚える。」/「记住：两套系统一直都在工作。」→「记住：两套系统一直都在执行相同的处理。」/ "both systems are always at work." → "both systems are always running the same processing." |

(detail の追加文は q087 / q075 の言い回し「待機しつつ他の処理を実行」「バッチ処理などを行いながら」を避けている。コールドの「電源を切った、または処理を始めていない状態」とは両立する。one_jp「主系だけが処理を受け持ち」・overview_rows[1]・goals[0] は上記で文脈が補われるため据え置き可。)

### LOW

| ID | 重大度 | 箇所 | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[4].detail_jp/zh/en` | 引用題 2015h27h-q064 と challenge 2019h31h-q090 は名詞形「フォールトトレランス」で出るが、jp 本文はこの形を一度も示さない (別名の未提示; 別物として教える (3) ではない) | jp「冗長構成は、この考え方を系統の単位で形にしたものといえる。」→「冗長構成は、この考え方を系統の単位で形にしたものといえる。名詞の形でフォールトトレランスとも呼ぶ。」/ zh「冗余结构可以说是在系统层面把这一思路落到实处的做法。」→「冗余结构可以说是在系统层面把这一思路落到实处的做法。名词形式写作[[jp:フォールトトレランス]]。」/ en "A redundant configuration can be seen as this idea put into practice at the level of whole systems." → "A redundant configuration can be seen as this idea put into practice at the level of whole systems. The noun form is fault tolerance ([[jp:フォールトトレランス]])." |
| L2 | LOW | `terms[4].analogy_*` | 片エンジン停止で飛び続ける旅客機は、性能を落として続ける像としてフェールソフト (本単元・topic で未定義) にも読める (失敗型 (8) 類)。ただし引用・challenge 題でフェールソフトが誤答となる q064 / q065 / q090 / q093 はいずれもこの像で誤答を選ばない | 記録のみ |
| L3 | LOW | `key_points_jp/zh/en[2]`、`pairs[3].rows[0]` | 「誤りが起きても安全な状態を保つ仕組み」がフールプルーフ (誤っても害にならない) とフェールセーフ (操作の誤りも対象) のどちらを指すか読めない (jp-review r2 の LOW 継続)。q065 / q067 の正答は単元の定義で取れる | 記録のみ |
| L4 | LOW | ホット/コールドの対比 `pairs[1]`・`terms[3].points[0]`・`terms[3].points[1]`; デュアル/デュプレックスの停止時間 `pairs[0].rows[1]`・`terms[0].points[1]` | 書き方 8 の対比反復 (exam 考点は q082 の正答の根拠なので削れない) | 記録のみ |
| L5 | LOW | `terms[0].points[0]` | one_jp の言い直し (D-203 §9)。正答肢と同じ原則の一般表現で写しではない | 記録のみ |
| L6 | LOW | `terms[0].detail_en` "in duplicate"、`terms[3].detail_en` "or at least"、`terms[5].detail_zh`「使系统倒向这种动作」、`terms[4].points[1].text_en` "duplicating hardware … that is, hardware redundancy" | loc-review r2 の LOW 継続 (2 重に狭める / 付加 / 直訳調) | 記録のみ |
| L7 | LOW | `terms[4..6].hook_jp` | 5 フック中 3 つが「〜と読める」で結ぶ同型の結び | 記録のみ |

**範囲外の観察**:
- O1 zh 見出し語 デュアル=双工系统 / デュプレックス=双重系统 は中国語の慣用と逆 (OQ-15、zh_terms `excluded`、v1 不変量)。本単元では [[jp:]] 併記で試験語は正しく伝わる。OQ-15 の一括修正で扱う。
- O2 フェールソフト・フォールトアボイダンスは topic 16-44 のどの単元にも見出し語が無いが、引用題の誤答肢 (q064 / q065 / q090 / q093) に現れる。本単元の記述はいずれの題でもそれらを選ばせない。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **7** (建議修 1: L1 / 記録のみ 6: L2〜L7) |

## 5. 判定

**FAIL** (D-199: MEDIUM 1)。考点 13 件・引用 12 題は全て正答と一致し、写し・限定条件落ち・選択肢なぞりは無い。M1 (デュプレックスの待機系を「処理をしない」に限定) を B3 補丁 (§3 の文字列置換、構造変更なし) で直せば PASS 相当。L1 は同じ補丁で修正推奨。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-16-44-u03
✓ technology-16-44-u03 unit: 0 issues (data/ip/textbook/units/technology-16-44-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-16-44-u03
✓ technology-16-44-u03 parity: 35 locations, 0 diff
EXIT=0
```
