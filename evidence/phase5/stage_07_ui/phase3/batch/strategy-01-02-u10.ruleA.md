# Rule A 全数抽検 — strategy-01-02-u10 (仮説検定の枠組み)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser / loc-reviewer) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成、照合スクリプトは scratchpad)。
- **Date**: 2026-10-30 (S138 第 8 批 b08)、repo HEAD `ae614bf` + 作業ツリー (単元 JSON は未コミットの書き直し版 = run `b08-u10-a1` merge 結果、sha256 先頭 `bcd9ad101b839169`)。
- **対象**: `data/ip/textbook/units/strategy-01-02-u10.json` (textbook-unit-v2)、用語 **4 / 4 = 全数** (仮説検定 / 有意水準 / 第1種の誤り / 第2種の誤り) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 (one_zh / one_en の `[[jp:]]` 見出し語、書き方 7・8・9)、D-203 (S137)、D-204 / D-205 (S138 §2・§6)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `data/ip/textbook/.planning/v2/strategy-01-02-u10/v1-original.json` (用語 4 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 誤った事実を学ぶ・過去問を誤答させる・限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。
- **本単元の特殊事情**: manifest `term_questions` は 4 用語とも空。`data/ip/quiz/questions.json` 全体を「仮説|有意水準|帰無|検定|第1種|第2種」で検索 → 2 件ヒット (2023r05-q001 = MVP の「仮説に基づいて」、2026r08-q084 = 推論の「仮説形成」) で、いずれも統計的仮説検定と無関係。よって考点は qid 無しの mix 3 件のみで、考点 × 引用題の照合対象は 0 件。事実照合は統計学の標準定義に対して行った (§1-2)。

## 1. 方法

1. **全文読み取り**: 4 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (nodes・label・caption・cols・cells)` と単元レベル全フィールドを三語とも読んだ (`quiz` は 4 用語とも空配列 = 引用可能な題が無いため)。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **統計の事実照合 (重点)**:
   - 帰無仮説 / 対立仮説の役割: 帰無仮説 = 退けられるかを確かめる仮説 (例「差はない」)、対立仮説 = その反対、棄却時に対立仮説を採る — 正しい (`terms[0].detail`・fig steps[0]・steps[3])。hook「帰無 = 無に帰す、退けられることを見込んで立てる」は標準の語源説明。
   - 判定規則: 「帰無仮説が正しいとしたら標本の結果がどれほど起こりにくいかを確率で表し、有意水準を下回れば棄却」= p < α 規約。p ≤ α 規約との差は IT パスポート水準で問題にならず、どちらかを誤りとする記述も無い。`terms[1].detail` の「標本の結果が起こる確率」のみ p 値の定義 (観測値と同じかそれ以上に極端な結果の確率) として不正確 → L3。
   - 「棄却できない ≠ 帰無仮説が正しいと証明」: `terms[0].detail` 3 文目 (「差があるとは言えない」にとどまる)、`terms[0].analogy` 2 文目、`key_points[2]` — 正しい。帰無仮説を「採択」「証明」とする記述は単元内に 0。
   - 有意水準 = 第1種の誤りの確率の上限: `terms[1].detail` 2 文目、`terms[2].detail` 2 文目 (「有意水準を超えないように抑えられている」— 離散分布の検定でも成り立つ「≤ α」の言い方で正確)、`key_points[1]` — 正しい。有意水準を「帰無仮説が正しい確率」とする記述は無く、むしろ `terms[1].points[0]` がこの誤解を明示的に否定 — 正しい。
   - 第1種の誤り = 正しい帰無仮説を棄却 (「差がないのに差があると結論」、広告の例: 効果なし・偶然の売上増で「効果あり」) / 第2種の誤り = 誤った帰無仮説を棄却しない (「差があるのに差があるとは言えない」、教材の例: 効果ありだが標本が小さく見逃す) — 向き・例とも正しい。
   - 2×2 表 (`terms[3].fig`): 棄却しない × 正しい = 正しい判断 / 棄却しない × 誤り = 第2種 / 棄却する × 正しい = 第1種 / 棄却する × 誤り = 正しい判断 — 正しい。
   - α と β のトレードオフ: `pairs[0].rows[2]` は「標本の大きさが同じまま有意水準を小さくすると 第1種 起こりにくく / 第2種 起こりやすく」、`key_points[3]` は「標本の大きさが同じなら」— 固定標本サイズの限定条件を両方で保持 (D-203 観点 9 に相当する限定は落ちていない)。`terms[3].detail` 3 文目「ほかの条件が同じなら、標本を大きくするほど第2種の誤りは起こりにくくなる」も ceteris paribus の限定付きで正しい。
   - 検出力 (1−β) と β の記号は単元に出ないが、manifest の 4 用語の範囲外で、言及が無いことは誤りではない。
   - 比喩の向き: 刑事裁判 (無罪推定 = 帰無仮説、強い証拠で有罪 = 棄却、有罪にできなくても無実の証明ではない) / 健康診断で健康な人が「要精密検査」= 第1種 (偽陽性) / 病気が始まっている人が「異常なし」= 第2種 (偽陰性) — いずれも帰無仮説 =「異常なし・無罪」に対応し、誤りの向きが正しい。有意水準の比喩「前もって引く線、結果を見てから動かすと判断が都合よく変わる」は事前設定の理由として正しい。
   - 別名「あわてものの誤り」(第1種) /「ぼんやりものの誤り」(第2種) — 日本の統計教育での通称どおり、対応も正しい。
3. **quiz / challenge_questions**: quiz 4 枠とも空 (引用可能な題 0 のため)。challenge 4 題 (2010h22a-q009 データウェアハウス / 2010h22h-q002 複合グラフの読み取り / 2011h23a-q014 パレート図 / 2011h23tokubetsu-q009 データマイニング) は v1 の 5 題から中問組員 2009h21h-q095 を除いたもの。どれも本単元の 4 用語を問わないが、topic 内に該当題が存在しない以上 topic 単位の題で埋めるしかなく、本文と矛盾もしない → O1 (範囲外観察、JP review の low と同じ判断)。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合として単元の JP 文字列 71 本 (派生フィールド・summary・overview.intro・source_figures 除く) を topic 内全 98 題の題文 + 選択肢と 12 字連続照合 (句読点・記号・空白・記法除去) — (a) カタカナ 4 字以上と英数を □ 1 字に遮蔽 (遮蔽後の実字 6 未満の窓は除外) → **0 件**、(b) 遮蔽なし → **0 件**、(c) 近似一致 (12 字窓 × 題の全 12 字窓、bigram 予選 + 編集距離 ≤2 = 1〜2 字置換) → **0 件**。カタカナの多い文は単元内にほぼ無く (「データ」のみ)、目視でも題文由来の表現は無い。例 (売り場の平均購入額 / 新しい広告 / 新しい教材 / 刑事裁判 / 健康診断) はいずれも自作。
5. **D-195**: 結論先行 (one = 1 文 × 4、太字あり)、展開 3/3/3/3 文、比喩・フックが定義の言い換えでないこと (裁判・合格線・健康診断の別場面、語源と通称の別の手がかり)、定義前使用 (標本・母集団 = 前提単元 u09; 帰無仮説・対立仮説・棄却・有意水準 = `terms[0].detail` 内で括弧注または同格で定義。図 steps[1] の「棄却の境目」は detail より先に出るが、step 0 の「退けられるか」で意味が取れる [JP review low と同判断、記録不要の水準])、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh 必须・务必・重要・一定・考试 + en must・exam・important・always・essential・tested) → ヒットは `terms[3].analogy_jp`「「異常なし」とされる」(受け身の通常用法) と `overview.freq_badge`「頻出」のみ = 定型句 0。図の型 (仮説検定 = flow steps 4、第2種の誤り = static table、有意水準・第1種の誤り = 図なし; 全て登録内)、pair 配置 (第1種 / 第2種 は第2種の後、key 行 = rows[1] あり)。
6. **D-200**: 考点数 1/1/0/1 (≤3 ✓; 第1種の誤りの 0 件は validate も許容)、各 JP 文数 1〜2・字数 49 / 51 / 60 (≤100 ✓)。**framing 件数** (全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の照合: `terms[3].points[0]`「棄却したかどうかで見分ける」は 2 種の誤りの間の見分けで、`goals[2]`「実際と判断の組合せ」と同じ前提 [誤りが起きている] の下で一致; `pairs[0].rows[2]` と `key_points[3]` の増減一致; 「有意水準 = 第1種の誤りの確率の上限」が 3 欄で一致; 比喩 3 つの帰無仮説の対応が一致) → 不整合 0。書き方 8 → L1。書き方 9 (限定条件) → 引用題 0 件のため照合対象なし、統計上の限定 (固定標本サイズ・ほかの条件が同じなら・帰無仮説が正しいとしたら) は全て保持。§6 → 比喩・フックとも別の手がかりで指摘なし。§9 言い直し → L2。D-205: 改訂される文書の構成数・名称の記述なし (5% / 1% は「例えば」付き)。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、図ラベル・表セル・比較行・caption の三語一致 (parity 0 diff)、`[[jp:…]]` 原語 11 種 (仮説検定 / 帰無 / 有意水準 / 有意 / 有意な差 / 帰無仮説 / 第1種の誤り / あわてものの誤り / 第2種の誤り / ぼんやりものの誤り / 棄却) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 4 用語に見出し語の `[[jp:]]` あり、zh 訳語が `zh_terms.json` に従う (假设检验 / 显著性水平 / 第一类错误 / 第二类错误 / 总体 一致; 原假设・备择假设・拒绝 は表に無いが単元内で一貫、validate B6 / jp-origin warn 0)。loc review の LOW 7 件は未適用のまま残る (いずれも LOW、本監査で L4・L5 に一部を建议修として再掲)。
9. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (4 / 4)

| # | 用語 | 事実 (考点、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 仮説検定 | OK — 引用題 0。mix 1: 結論は標本にもとづく確率的判断なので手順どおりでも誤ることがある — 正しい (第1種・第2種の誤りの前提)。detail: 帰無仮説 / 対立仮説の役割、p < α で棄却、棄却できなくても証明ではない — 正しい。flow steps 4 (仮説 → 有意水準 → 起こりにくさ → 判断) は detail と一致し、有意水準を「データを見る前に」決める順序も正しい。裁判の比喩の向き正しい | OK | OK (loc L: zh「卖场」) | L2 |
| 2 | 有意水準 | OK — 引用題 0。mix 1: 有意水準は帰無仮説が正しい確率ではない、棄却判断の事前の境目 — 正しい (典型的誤解の否定)。detail: 5% / 1% は「例えば」付き、α = 正しい帰無仮説を棄却する確率の許容上限、小さいほど棄却条件が厳しい — 正しい。ただし 1 文目「標本の結果が起こる確率」は p 値の定義として不正確 | OK | OK | L3 (建议修) |
| 3 | 第1種の誤り | OK — 考点 0 件。one・detail・比喩 (健康な人が要精密検査 = 偽陽性)・通称 (あわてもの) すべて「正しい帰無仮説を棄却」の向き。「確率は有意水準を超えない」— 正しい | OK | hook_en の通称が英語の通称に読める | L4 (建议修) |
| 4 | 第2種の誤り | OK — 引用題 0。mix 1: 第1種 = 正しい帰無仮説を棄却、第2種 = 誤った帰無仮説を棄却しない、棄却の有無で見分ける — 正しい。detail: 標本が小さいと見逃す、ほかの条件が同じなら標本を大きくすると起こりにくい — 正しい (限定付き)。比喩 (発病している人が異常なし = 偽陰性)・通称 (ぼんやりもの) 正しい。2×2 表正しい | OK | hook_en 同上、detail_en の "too few samples" | L1, L4・L5 (建议修) |

**単元レベル**: goals 3 点・overview_cols 1 (帰無仮説との関係)・overview_rows 4 行 (第1種「実際は正しいのに棄却」/ 第2種「実際は誤りなのに棄却しない」正しい)・pairs 1 組 (4 行 key 1、rows[2] は「標本の大きさが同じまま」の限定付き)・key_points 4 (いずれも正しく、[3] は固定標本サイズの限定付き)・summary (記法除去版と一致)・challenge_questions 4 件 (O1)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 5 (うち 建议修 3)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW | `pairs[0].rows[0..1]`、`terms[3].fig` (2×2 表)、`terms[3].points[0]` | 「実際の帰無仮説 × 判断」の同じ対比が 3 箇所に出る (書き方 8: 2 箇所まで)。ただし 2×2 表は第2種の誤りの登録図種として標準の表し方で、mix 考点は「棄却の有無で見分ける」という判別点を加えている。JP review の low と同判断 | 記録のみ (どれを削っても学習上の損失の方が大きい) |
| L2 | LOW | `terms[1].detail_jp` 2 文目 / `terms[2].detail_jp` 2 文目 / `key_points_jp[1]`; `terms[0].detail_jp` 3 文目 / `terms[0].analogy_jp` 2 文目 / `key_points_jp[2]` (三語とも) | 「有意水準 = 正しい帰無仮説を棄却する確率の上限」と「棄却できなくても証明ではない」がそれぞれ 3 欄で言い直される (D-203 §9 同義反復)。key_points は単元のまとめで、比喩側は別の場面で述べるため誤学習には至らない | 記録のみ |
| L3 | LOW **建议修** | `terms[1].detail_jp` / `detail_zh` / `detail_en` 1 文目 (派生 `explanation_*` 追従) | 「標本の結果が起こる確率」は p 値 (観測された結果と同じかそれ以上に極端な結果が起こる確率) の説明として不正確。連続量では特定の結果が起こる確率自体はほぼ 0 になり、「確率が小さい = その値が珍しい」と誤解させうる。同単元の `terms[0].detail` と fig caption は「どれほど起こりにくいか」と書いており矛盾はしない | jp「標本の結果が起こる確率がこれを下回ると」→「標本の結果**かそれ以上に偏った結果**が起こる確率がこれを下回ると」/ zh「样本结果出现的概率低于这个值时」→「样本结果**或更极端的结果**出现的概率低于这个值时」/ en "when the probability of the sample result under a true null hypothesis drops below this value" → "when the probability of the sample result **or a more extreme one** under a true null hypothesis drops below this value" |
| L4 | LOW **建议修** | `terms[2].hook_en`、`terms[3].hook_en` (+ 派生 `memory_hook_en`, `summary.memory_hooks_en[2..3]`) | "Its nickname is the “hasty person's error”" は英語圏にもある通称のように読めるが、実際は日本語の通称 (英語では false positive / false negative が通り名)。loc review low の再掲。`[[jp:]]` は付いているので事実誤りには至らない | `terms[2].hook_en`: "Its nickname is the “hasty person's error”" → "In Japanese it is nicknamed the “hasty person's error”" / `terms[3].hook_en`: "Its nickname is the “absent-minded person's error”" → "In Japanese it is nicknamed the “absent-minded person's error”" (jp・zh は変更なし) |
| L5 | LOW **建议修** | `terms[3].detail_en` 2 文目 (派生 `explanation_en` 追従) | "too few samples were collected" は統計用語として「標本の数 (標本が何組か)」と読め、jp「集めた標本が少なくて」(= 標本の大きさが小さい) と、同 detail 3 文目 "a larger sample" ・`pairs[0].rows[2]` の「標本の大きさ」とずれる。loc review low の再掲 | "but too few samples were collected for the difference to show" → "but the sample was too small for the difference to show" |

**対比の出現欄 (書き方 8 の列挙)**: ① 第1種 = 正しい帰無仮説を棄却 / 第2種 = 誤った帰無仮説を棄却しない: `pairs[0].rows[0..1]`、`terms[3].fig`、`terms[3].points[0]`、各 one (定義そのもの)、overview 総表 (D-195 §3 の構造)、`goals[2]` (予告) → L1。② 有意水準を小さくしたときの増減: `pairs[0].rows[2]`、`key_points[3]` → 2 箇所で許容。③ 通称 あわてもの / ぼんやりもの: `pairs[0].rows[3]`、各 hook (記憶の手がかり、反復に数えない) → 許容。

**範囲外の観察** (書き直し対象外):
- O1 `challenge_questions` 4 題はいずれも本単元の用語を問わない (topic 内に仮説検定の題が存在しない; validate が 3〜5 題を求めるため topic 単位の題で充当)。本文とは矛盾しない。単元側では直せず、確認題の設計 (該当題 0 の単元の扱い) の問題として記録。
- O2 loc review の残り LOW (zh「两个卖场」/ zh・en `terms[1].detail` 2 文目の語順 / zh `terms[1].analogy`「随心所欲」/ en「pass line」/ en `terms[3].one_en`「letting slip」の語順) は意味の誤りに至らず、本監査では記録のみ。`overview.est_minutes` 22 (v1 13) は `unit_minutes.json` の範囲で本監査対象外。

確認済みで問題なし: 帰無仮説 / 対立仮説の役割、第1種 = 正しい帰無仮説の棄却 (確率 ≤ 有意水準)、第2種 = 誤った帰無仮説の不棄却、「棄却しない ≠ 証明」、有意水準を帰無仮説が正しい確率とする記述 0 (むしろ否定)、α と第2種の誤りのトレードオフは固定標本サイズの限定付き (2 欄とも)、比喩 3 つの誤りの向き、§9 禁止句 grep (定型句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤60 字)、D-198 写し (validate 0、独立照合 遮蔽あり 0 / 遮蔽なし 0 / 近似 0)、`[[jp:]]` 原語 (11 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (4/4)、zh 訳語表、図種 (flow steps ×1 / static table ×1 / 図なし ×2 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、JP review / loc review の指摘は全て low で HIGH・MEDIUM の未解決なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **5** (建议修 3: L3・L4・L5 / 記録のみ 2: L1・L2) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 4 用語・考点 3 件 (全て mix、引用題 0 = topic 内に該当題なし) で、統計の事実 (帰無仮説・対立仮説の役割、2 種の誤りの向きと確率、棄却しないことの意味、有意水準の意味、固定標本サイズでのトレードオフ) に誤りは無く、比喩の向きも正しい。LOW 建议修 3 件 (L3 p 値の言い方、L4 英語の通称の言い方、L5 "samples") は補丁 (B3) で修正推奨、L1・L2 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-02-u10
✓ strategy-01-02-u10 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u10.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-02-u10
✓ strategy-01-02-u10 parity: 21 locations, 0 diff
EXIT=0
```
