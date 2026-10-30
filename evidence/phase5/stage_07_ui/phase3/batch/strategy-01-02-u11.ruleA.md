# Rule A 全数抽検 — strategy-01-02-u11 (精度・偏りと各種バイアス)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser / loc-reviewer) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成、照合スクリプトは scratchpad)。
- **Date**: 2026-10-30 (S139 第 9 批 b09)、repo HEAD `8b67ce1` + 作業ツリー (単元 JSON は未コミットの書き直し版 = run `b09-u11-a1` merge 結果、sha256 先頭 `172df8957878ff5f`)。
- **対象**: `data/ip/textbook/units/strategy-01-02-u11.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (精度と偏り / 統計的バイアス / 選択バイアス / 情報バイアス / 認知バイアス) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 (one_zh / one_en の `[[jp:]]` 見出し語、書き方 7・8・9)、D-203 (S137)、D-204 / D-205 (S138 §2・§6)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `data/ip/textbook/.planning/v2/strategy-01-02-u11/v1-original.json` (用語 5 語・`term_zh`・`term_en`・challenge_questions・source_figures・unit_summary_jp とも v1 と一致、スクリプト確認)。
- **重大度**: HIGH = 誤った事実を学ぶ・過去問を誤答させる・限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。
- **本単元の特殊事情**: manifest `term_questions` は 5 用語とも空。`data/ip/quiz/questions.json` 全 2900 題を「バイアス|無作為|系統誤差|母集団」で検索 → 2 件のみ (2010h22h-q023 = ABC 分析の題の誤答肢に抜取検査の文脈で母集団の語が出るだけ / 2025r07-q008 = 別 topic strategy-05-14 の AI 原則の題で、アルゴリズムのバイアスは本単元の統計的バイアスの定義を問わない)。よって考点は qid 無しの mix 5 件のみで、考点 × 引用題の照合対象は 0 件。事実照合は統計学の標準定義に対して行った (§1-2)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (nodes・label・caption・cols・cells)` と単元レベル全フィールドを三語とも読んだ (`quiz` は 5 用語とも空配列 = 引用可能な題が無いため)。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_* / overview.intro_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 標準事実 (考点 全 5 件 = mix 5、qid 付き 0)**: 引用題が無いため、統計学の標準事実と照合。精度 (ばらつき) と偏り (系統誤差) は独立 → 考点 1 OK。偶然誤差は平均で相殺、系統誤差は標本数では消えない → 考点 2 OK (u09 `terms[1].points[0]` の「選び方に偏りがあると標本を増やしても近づかない」とも一致)。選択 = 標本の選び方、情報 = 得た値 → 考点 3 OK (疫学の標準分類)。情報バイアスは回答者の嘘に限らず器具でも起こる → 考点 4 OK。認知バイアスは良質なデータだけでは防げない → 考点 5 OK。図の表を再計算: (99,100,101) 平均 100 / (90,100,110) 平均 100 / (109,110,111) 平均 110 / (100,110,120) 平均 110、精度・偏りの判定 4 行とも一致。bias の語源 (仏語 biais = 斜め) は標準的語源と一致 (辞書未照合、監査者の知識による)。確証 / 正常性 / 後知恵バイアスの説明は標準的定義と一致。
3. **quiz / challenge_questions**: quiz 枠 0。challenge 5 題 (2010h22a-q009 / 2010h22h-q002 / 2011h23a-q014 / 2011h23tokubetsu-q009 / 2012h24a-q005) を再読: データ統合基盤・複合グラフの読取り・パレート図・データマイニング (2 題) で、本単元の用語を問わないが本文との矛盾もない。O1 に記録 (データ側の制約、JP 審査 #1 #2 と同認識、u10 と同型)。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合として単元の JP 文字列 104 本 (派生除く) を topic 内全 98 題の題文 + 選択肢と 12 字連続照合: カタカナ 4 字以上と英数を遮蔽 (実字 6 未満の窓は除外) → **0 件**、**遮蔽なし → 0 件**。近似一致: 16 字窓の編集距離比 ≤0.35 → **0 件**、文字列全体の bigram Dice ≥0.30 → **0 件** (校正例 HIGH ed 0.14 / Dice 0.52 に遠く及ばない)。カタカナの多い文 (Web 調査の例・バイアス名の表・選択 / 情報の対比) の目視: topic 内に同場面の題なし。具体例 (自社サイト会員の Web 調査、新機能の誘導質問、測定値の表、5 分進んだ時計、鍋、鏡、色眼鏡) はいずれも題に無い自作。
5. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 2 文 × 5、定義前使用なし (母集団・標本 = 統計的バイアス detail で定義 [u09 既習でもある]、選択 / 情報バイアスは one 以前に detail で一種と紹介)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が): 「選ぶ」4 件 (`overview_rows[2].extra_jp[0]`・`terms[1].fig.data.nodes[1]`・`terms[1].fig.steps[0].caption_jp`・`pairs[1].rows[0].a_jp`) は全て標本を選ぶ本来の意味で偽陽性、`freq_badge`「頻出」は記号欄。zh・en 相当語のヒット (`example` 内の exam、`every` 内の very) は全て偽陽性。図の型: 精度と偏り・認知バイアス = table/static、統計的バイアス = flow/steps 3、選択・情報 = 図なし、全て登録内。pair 配置 (選択 / 情報、統計 / 認知、各組 key 行 1) OK。
6. **D-200**: 考点数 1/1/1/1/1 (≤3 ✓)、各 JP 文数 1〜2・字数 43〜56 (≤100 ✓)。**framing 件数** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0。
7. **D-202 / D-203 単元全体点検**: 書き方 7: 「だけ」「ではない」の照合 (情報 points[0] の「嘘だけで起こるのではない」と detail の 3 原因は一致、認知 points[0]「データの質を高めるだけでは」と pairs[0] の減らし方は一致)。JP 審査 #1 の medium (情報バイアス考点の「認知の偏りが原因の情報バイアス」) は r1 で削除済みで再発なし。ただし detail に残る「回答者の記憶違い」と pairs[0] の原因行の境界 → L8。書き方 8 → 下記列挙。書き方 9: 引用題なしのため対象外。§6 → L9、L10。§9 → L11。D-204 (比喩の像): 否定内容を運ぶ比喩なし。情報の鏡の像は detail の一部を覆わないのみ → L10。D-205: 改正される文書 (規格・法令・ガイドライン等) の構成・数・名称の記述は本単元に無し → 対象外。
8. **topic 内整合 (u01〜u10)**: 母集団 / 总体 / population、標本 / 样本 / sample の訳語と定義は u09 と一致。標本を増やしても選び方の偏りは消えない (u09) と一致。無作為抽出の「等しい確率」の説明は u09 `terms[単純無作為抽出].points[0]` の無作為の説明と整合 (u09 の key_points は「偶然に任せて」と表現、矛盾なし)。u05 の「分布の偏り」(山の形の偏り)、u04 zh の「偏差」(残差の意味)、u02 の「ばらつき」は別語義で衝突なし。「偏差」は zh で u11 の偏り = 偏差 と u04 の deviation の意味が同形だが u11 の見出し語 `精度与偏差` は `zh_terms.json` どおりで、文脈で読める (O3)。
9. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 15 種が jp 本文に実在 (スクリプト全 ok)、one_zh / one_en 全 5 用語に見出し語の `[[jp:]]` あり。zh 訳語は `zh_terms.json` の登録語 (总体 / 选择偏倚 / 信息偏倚 / 认知偏差 / 统计偏倚 / 精度与偏差) に一致、確証バイアス等は未登録。loc-review の未適用 low を再評価 → L3〜L7、L12。
10. **機械ゲート**: §6 に出力全文。
11. **外部確認 (L1)**: Web 検索 (二次資料のみ、Wald の原メモは未確認)。結果は爆撃機とする記述が中心で、戦闘機とする記述は検索結果に無い。逸話自体の細部は後年の脚色があるという記述も複数。一次確認していないため事実誤りとは断定せず、機種を言い切らない修正案とする。

**対比の出現欄 (書き方 8 の列挙)**: ① 選択 / 情報の段階: `pairs[1].rows[0..1]`、`terms[2].points[0]`、`terms[1].fig.steps[0..1]` (段階を順に述べるのみで対比形ではない)、overview 総表の列 (D-195 §3 の構造)、`goals_jp[1]` (予告) → 許容、L11 に記録。② 統計 / 認知: `pairs[0].rows[0..1]`、`terms[4].points[0]`、`goals_jp[2]` (予告) → 許容。③ 精度 / 偏り: 用語自体が対比で各欄は定義の展開 → 許容。④ 偶然 / 系統: `terms[1].points[0]` のみ → 許容。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 標準事実、引用題なし) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 精度と偏り | OK — mix 1: そろっていても正しいとは限らず、精度が高いまま偏りが大きい状態がある。表 4 行再計算一致 | OK (table static) | L6, L7, L12 | L13 (hook) |
| 2 | 統計的バイアス | OK — mix 1: 偶然のばらつきは平均で打ち消され、バイアスは同じ方法では残る。flow steps 3 は 3 段階の入り方と一致 | OK (flow steps) | L4 | L9, L11 |
| 3 | 選択バイアス | OK — mix 1: 原因が選び方なら選択、得た値なら情報。無作為抽出の説明は u09 と整合 | OK (図なし) | L2 | L1 |
| 4 | 情報バイアス | OK — mix 1: 嘘に限らず機械の測定でもずれる | OK (図なし) | OK | L8, L10, L11 |
| 5 | 認知バイアス | OK — mix 1: データの質だけでは防げない。表 3 行は標準的定義と一致 | OK (table static) | L3, L5, L12 | L11, L14 |

**単元レベル**: goals 3 点・overview_cols 2・overview_rows 5 行・pairs 2 組 (統計 / 認知 3 行 key 1、選択 / 情報 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge 5 件 (本文と矛盾なし、単元の内容は問わない)。事実誤りなし (L1 の機種のみ未確定)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 14 (うち 建議修 7)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[2].hook_jp/zh/en` | 逸話の機種を「戦闘機」と言い切るが、検索した二次資料は爆撃機とする記述が中心 (一次未確認)。機種は学習内容に不要 | jp「帰還した戦闘機の弾痕」→「帰還した軍用機の弾痕」/ zh「平安返航的战斗机上的弹孔」→「平安返航的军机上的弹孔」/ en "on fighter planes that made it back" → "on military planes that made it back" |
| L2 | LOW **建議修** | `terms[2].detail_en` | サイトの会員 (members) と母集団の要素 (every member of the population) で member が 2 義 (loc-review 指摘)。jp・zh の「等しい確率」は単純無作為抽出の定義に近いが、u09 `terms[単純無作為抽出].points[0]` も無作為を同確率で説明しており整合するため変更しない | en "which gives every member of the population an equal chance of being chosen," → "which gives everyone in the population an equal chance of being chosen," |
| L3 | LOW **建議修** | `overview_rows[4].extra_en[1]` | against の目的語が無く途中で切れて読める | "Checking the evidence against" → "Checking opposing evidence" |
| L4 | LOW **建議修** | `terms[1].detail_zh`, `terms[1].detail_en` | jp の「例えば」が zh・en で落ち、2 種だけに読める余地 | zh「，选择偏倚（[[jp:選択バイアス]]）和信息偏倚（[[jp:情報バイアス]]）都属于这一类」→「，例如选择偏倚（[[jp:選択バイアス]]）和信息偏倚（[[jp:情報バイアス]]）都属于这一类」/ en "and selection bias ([[jp:選択バイアス]]) and information bias ([[jp:情報バイアス]]) are both kinds of it." → "and selection bias ([[jp:選択バイアス]]) and information bias ([[jp:情報バイアス]]), for example, are kinds of it." |
| L5 | LOW **建議修** | `terms[4].points[0].text_zh`, `text_en` | 「偏りなく」が「均等に」にずれている。en は even の重複で読みにくい | zh「数据收集得再均衡，」→「即使数据收集得毫无偏差，」/ en "Even evenly collected data can lead" → "Even data collected without bias can lead" |
| L6 | LOW **建議修** | `terms[0].fig.data.cols[0].en` | sample は本単元で標本の訳語。「例」の意味と衝突 | "Sample measurements (true value 100)" → "Example measurements (true value 100)" |
| L7 | LOW **建議修** | `overview_rows[0].one_line_zh` | 「大小」は中立で、jp の「小ささ」・`one_zh` の「离散程度小」とずれる | 「离散程度的大小，以及相对真值的单向偏移」→「离散程度小，以及相对真值的单向偏移」 |
| L8 | LOW 記録のみ | `terms[3].detail_*` ↔ `pairs[0].rows[0]` | 「回答者の記憶違い」は人に原因があるが統計的バイアス側。pairs の原因行「人の思考のくせ」と境界が近い。goals_jp[2] の「データの側 / 判断する人の側」で区別でき、不整合には至らない。疫学の情報バイアスの標準例 | 記録のみ |
| L9 | LOW 記録のみ | `terms[1].hook_*` | 語源で手がかりは足り、傾いた台の像は analogy の時計と同じ内容 (§6)。2 文 | 記録のみ |
| L10 | LOW 記録のみ | `terms[3].analogy_*` | 「映す相手を替えても」は器具側の原因に合うが、回答者の記憶違いは覆わない。否定はしない | 記録のみ |
| L11 | LOW 記録のみ | `terms[1].analogy` / `points[0]` / `key_points[1]`、`terms[3].detail` / `points[0]` / `key_points[3]`、`terms[4].detail` / `pairs[0].rows[2]` / `key_points[4]` / `overview_rows[4].extra[1]`、`terms[2].points[0]` / `pairs[1].rows[0]` | §9 同趣旨の再述。mix 考点 1 件ずつの単元で考点が detail と重なりやすい | 記録のみ |
| L12 | LOW 記録のみ | en の skew / bias 使い分け、zh の「走样」「成见、先入之见」「离散」 | loc-review 指摘の語の選択。意味は読める | 記録のみ |
| L13 | LOW 記録のみ | `terms[0].hook_*`、`overview_rows[0].extra_jp[0]` | 「精」の字義に「そろう」を寄せた説明 / 列「問題が起きる場所」とセルの噛み合いが弱い | 記録のみ |
| L14 | LOW 記録のみ | `terms[4].fig.data.rows[0].key` | 確証バイアス行の key に出題の根拠なし (本文の対策とは対応) | 記録のみ |

**範囲外の観察**:
- O1 challenge 5 題は単元の用語を問わない (全 2900 題に該当題なし、u10 と同型、validate の確認題下限のためのデータ制約)。
- O2 `source_figures` 3 件・`freq_badge`「頻出」は v1 継承で、いずれも本単元の内容と対応しない (topic 単位の値)。
- O3 zh の「偏差」は u04 の deviation と同形だが、見出し語は `zh_terms.json` どおり。

確認済みで問題なし: 限定条件 (引用題なしのため対象外)、§9 禁止句 (偽陽性のみ)、framing 0/0/0、D-197 羅列 (validate 0)、D-200、D-198 (機械・独立照合・近似・目視すべて 0)、D-205 (対象外)、`[[jp:]]` 原語 15 種、見出し語併記 5/5、図種、派生フィールド一致、v1 不変量、JP 審査 medium の解消。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **14** (建議修 7: L1〜L7 / 記録のみ 7: L8〜L14) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 5 件 (qid 付き 0) で標準事実との矛盾なし、写しなし。LOW 建議修 7 件は補丁 (B3) で修正推奨、L8〜L14 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-02-u11
✓ strategy-01-02-u11 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u11.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-02-u11
✓ strategy-01-02-u11 parity: 25 locations, 0 diff
EXIT=0
```
