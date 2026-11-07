# Rule A 全数抽検 — technology-13-34-u03 (統計的分析と推測)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 作業用スクリプトは scratchpad `b49u03ra/` のみ)。
- **Date**: 2026-11-08 (S149 b49)、repo HEAD `69504337` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b49-u03-a2` merge 結果、sha256 先頭 `952f2e31e8041258`)。
- **経緯**: a1 = jp r0 → jp-review #1 REVISE (MEDIUM 1: 散布図の定義前使用) → jp r1 → jp-review #2 REVISE (MEDIUM 1: 相関係数の比喩「二人三脚に点数」) で棄却。a2 = a1 の jp.r1 + review #2 を seed に jp r0 → jp-review PASS (LOW 6) → loc r0 (parity 0) → loc-review PASS (LOW 5)。
- **対象**: `data/ip/textbook/units/technology-13-34-u03.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (相関係数 / 説明変数 / 目的変数 / 推定 / 仮説検定 / 回帰分析 / 相関分析) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-210、`ruleA_unit_audit.md` の既知失敗型 (1)〜(10)。比較: `.planning/v2/technology-13-34-u03/v1-original.json` (用語 7 語・`term_zh`・`term_en` とも manifest `v1_terms` と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (cols・cells・a/b・rows・nodes label・steps caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題**: 本単元は **引用題 0**。manifest `term_questions` は 7 用語とも空、考点 10 件は全て `kind: mix` (qid なし)、quiz 枠 0。中問組員 3 題 (2014h26a-q095 / -q096 / 2014h26h-q087) は平均点・標準偏差 (u02 の内容) で本単元の見出し語を問わない。したがって本手順は (a) 統計の事実としての正しさ、(b) topic 外の関連題 (全 2900 題を 相関 / 回帰 / 検定 / 母集団 / 標本 / 散布図 / 有意 で grep) との整合、に置き換えて実施した:
   - 2011h23tokubetsu-q015 (負の相関 = 点群が左上から右下へ、正答イ) → 相関係数 fig rows[2]「右下がりの直線に沿って集まる」と一致。
   - 2015h27a-q088 (相関係数が 1 に近い正の値ほど関連が強い、という題の前提) → one・detail・fig と一致。題の前提は「影響が強い」と因果寄りに言うが、本単元 points[0] / key_points[1] (相関 ≠ 因果) は同題の正答 (評価平均と関連性の象限で判断) に影響しない。
   - 2024r06-q014 (気温から販売量を一次式で予測 = 回帰分析、正答ア) → 回帰分析 one と一致。説明変数 detail の例 (気温 → 飲み物の売れ行き) は教科書の定番例で、同題の文言とは 10 字連続一致 0 (topic 外のため D-198 の対象外、念のため照合)。
   - 2023r05-q006 (説明パラメータを少数に絞る = 主成分分析、相関分析は誤答エ) → 本単元の相関分析は「2 変数の関係の強さを調べる」で、次元削減を示唆しない。誤答肢を支持しない。
   - 2024r06-q065 (教師あり学習の 回帰 = データの関係性を見つける) / 2025r07-q041 (回帰分析はスケジュール作成技法ではない) / 2012h24a-q008・2023r05-q038 (2 種類のデータの関係 = 散布図) → いずれも矛盾なし。
3. **計算題 (challenge 3 題) を自分で再計算**: 2009h21h-q080 (度数分布 2 系列の分散: 黒 n=22 平均 5.45 分散 2.79 / グレー n=28 平均 4.64 分散 2.02 → グレーが小さい → 正答イ と一致)、2009h21a-q070 (X, Y 独立一様 → 対称性で P(Y<X)=1/2 → 600 × 0.5 = 300 → 正答ウ と一致)、2009h21h-q007 (確率 0.4/0.4/0.2 の期待値: A 15 / B 21 / C 16 / D 18 → B → 正答イ と一致)。本文中の数値例 (−0.8 と +0.3 の強さ比較、点推定 52 点 ⊂ 区間 48〜56 点の中央、有意水準 5%・1%、信頼度 95%) も整合。
4. **統計的主張の一般化チェック (本監査の重点)**: 相関 ≠ 因果 (points[0]「原因だとは限らない」「…ことがある」で第 3 の要因を断定せず提示、key_points[1]「証明にはならない」) — 正しく、言い過ぎなし。相関係数 = 直線的関係のみ (one・fig rows[1]「直線的な関係がほとんどない」・相関分析 points[0] の曲線関係) — 「0 = 無関係」と誤らない。回帰 (単/重の区別、最小二乗の直線、外挿の注意 points[1]、Galton の命名由来 hook) — 正しい。推定 (標本大 → 区間狭、信頼度高 → 区間広) — 正しい。仮説検定 (棄却できない ≠ 正しい、有意水準は事前に決める、α 小 → 棄却されにくい、裁判の比喩は points[0] と同じ向き) — 正しい。帰無仮説を「否定したい仮説」とする枠付けは IP 水準の標準的説明で one / hook / fig caption で一貫。標本抽出の偏り (無作為抽出) には触れないが、本単元の見出し語外で欠落扱いにしない。唯一の精度不足 = 正 / 負の相関を「一方が増えると他方も増える」と決定的に言う点 → L1。
5. **D-198 写し**: validate の copy guard = 0 件 (choice-echo warn も 0、引用題なし)。独立照合: 単元の JP 文字列 135 本 (派生フィールド・summary・overview.intro・source_figures を除く) を topic 内全 32 題の題文 (`translations/<exam>.json` の stem_jp_clean 優先) + 選択肢と 12 字連続照合 — (a) カタカナ 4 字以上と英数を □ に遮蔽 (遮蔽後の実字 6 未満の窓は除外) / (b) 遮蔽なし の両方で **0 件**。近似照合 (12 字窓で 1〜2 字置換) も **0 件**。topic 外の関連題 10 題とも 10 字窓で 0 件。カタカナの多い文は本単元にほぼ無く (見出し語・本文とも漢字語中心)、目視でも写しなし。(iii) 選択肢なぞり: 引用題が無く、challenge 3 題 (分散 / 期待値) の場面・数値は本文に一切出ない。
6. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 2 文 × 7、図の型 (相関係数 = static table、推定 = static compare、仮説検定・回帰分析 = flow steps 4/4、説明変数・目的変数・相関分析 = 図なし; 全て登録内)、定義前使用 (散布図 = 相関係数 detail で定義後に fig と回帰 detail が使う; 母集団・標本 = 推定 one の括弧注; 帰無仮説 = 仮説検定 one; 有意水準・棄却・対立仮説 = 仮説検定 detail [ただし fig steps[3] caption の「棄却」が先行 → L6]; 信頼度・点推定・区間推定 = 推定 detail; 回帰式 = 回帰分析 one; 独立変数・従属変数 = 各 detail)、§6 比喩・フック (相関係数・説明変数・相関分析は analogy 空 = D-203 (b) 準拠; 目的変数 = 宝箱、推定 = スープの味見、仮説検定 = 裁判、回帰 = 足跡の道 — いずれも用語自身の操作の言い換えではない)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → **「覚え」6 件のみ** = 推定・仮説検定の hook「と字で覚える」2 + 派生 memory_hook 2 + summary.memory_hooks 2 → L9 に記録)。pair 配置 (説明/目的 は目的変数の後、推定/仮説検定 は仮説検定の後、回帰/相関 は相関分析の後、各組 key 行 1)。
7. **D-200**: 考点数 2/1/1/1/2/2/1 (≤3 ✓)、各 JP 文数 1〜2・字数 35〜65 (≤100 ✓、最大は相関係数 points[0] と仮説検定 points[0] の 65 字)。**framing 件数** (`validateV2.pointFraming`、全考点、記法除去後): jp 0 / zh 0 / en 0 (上限 2)。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (「〜だけ」「〜ではない」の照合: 相関分析 points[0]「直線的な関係だけ」は相関係数 one・fig と一致; 目的変数 points[0]「1 つの式で…1 つ」は回帰 one と一致; 仮説検定 points[0] と key_points[4] 一致; 回帰 points[1] の外挿注意と analogy「次の一歩」→ L8) → 不整合 0。書き方 8 (対比の出現欄) → 下記列挙、上限超過なし。書き方 9 (限定条件) → 引用題なし、本文内の限定 (「同じ信頼度なら」「同じ標本で」「単回帰では」「例えば 5% や 1%」「…ことがある」) 保持。
9. **D-205 / D-210**: 改訂のある文書 (規格・法令・ガイドライン・知識体系) の構成要素の数・名前は本単元に無し → 対象外。既知失敗型 (7)(10) も対象外 (法令・規格カテゴリの列挙なし。点推定 / 区間推定、単回帰 / 重回帰 の 2 分は統計の定義上の区分)。
10. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 22 種 (相関係数 / 散布図 / 説明変数 / 独立変数 / 目的変数 / 従属変数 / 推定 / 母集団 / 標本 / 点推定 / 区間推定 / 信頼度 / 仮説検定 / 帰無仮説 / 有意水準 / 棄却 / 対立仮説 / 回帰分析 / 回帰式 / 単回帰分析 / 重回帰分析 / 相関分析) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 7 用語に見出し語の `[[jp:]]` あり (D-202)、zh 訳語が `zh_terms.json` (+ `zh_terms.unit.json`) に従うこと (相关系数 / 说明变量 / 目标变量 / 估计 / 假设检验 / 回归分析 / 相关分析 / 散点图 / 总体 / 显著性水平 一致; validate の B6 warn 0 / jp-origin warn 0)。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

### 1-A. 先行 review 指摘の解消確認 (a1 #1・#2、a2 jp・loc)

| 出所 | 重大度 | 指摘 | 現状 |
|---|---|---|---|
| a1 #1 | **MEDIUM** | 散布図を定義前に使用 (相関係数 fig・detail、回帰 detail) | **解消**: 相関係数 `detail_jp` 2 文目で散布図を定義 (値の組を縦軸・横軸の平面に点で打った図)、`fig.data.cols[2]` は「値の組を点で打ったときの並び」で語を使わない、相関分析 detail は定義を繰り返さない |
| a1 #2 | **MEDIUM** | 相関係数の比喩「二人三脚に点数」が −1 を弱い関係と読ませる (points[1] と食い違い) | **解消**: `terms[0].analogy_*` 空 (zh / en も空、退行なし) |
| a1 #1 / #2 | low | 有意水準・棄却 が fig ノード名で先行 | ノード名は「前もって決めた基準と比べる」「帰無仮説を退けるかを決める」に変更済み。`steps[3].caption` の「棄却」は残る → L6 (a2 low と同じ) |
| a1 #1 / #2 | low | 「推測統計」が総表・要点で未定義 | 解消 (overview_rows extra = 「標本からの推測」、key_points[3] にも無し) |
| a1 #1 | low | 総表列見出しと中身の不一致 | 解消 (列見出し「結果・位置づけ」) |
| a1 #1 | low | 目的変数考点が単回帰 / 重回帰を先取り | 解消 (現 points[0] は 1 式 1 目的変数のみ) |
| a1 #1 | low | 回帰 fig step 1 が 2 変数に限定 | 解消 (「説明変数と目的変数の値をそろえた過去のデータ」) |
| a1 #1 / #2 | low | 相関係数 points[0] が絶対値で言っていない / 必ず大きくなると読める | 解消 (「絶対値が大きくても」「…ことがある」、zh「可能」、en "can be enough") |
| a1 #1 | low | 相関係数 hook 2 文目が定義の言い直し | 解消 (現 hook は記号 r のみ) |
| a1 #1 | low | 相関分析 analogy が散布図の手順そのもの | 解消 (analogy 空) |
| a1 #1 | low | 推定考点 1 文目が図・detail の繰り返し | 解消 (現 points[0] は標本の大きさ・信頼度と幅の関係のみ) |
| a1 #1 | low | 回帰 / 相関 の「対等」対比が 3 箇所 | 解消 (pairs[2].rows[1] + 回帰 points[0] の 2 箇所、相関分析 detail から削除) |
| a1 #2 | low | 母集団 =「調べ尽くせない全体」 | 解消 (「調べたい集団全体」) |
| a1 #2 | low | 説明変数 hook / 目的変数 hook の言い換え反復 | 解消 (両用語とも hook 欄なし) |
| a1 #2 | low | 説明変数の つまみ 比喩・goals[1]「結果を左右する側」が因果を示唆 | 解消 (analogy 空、goals[1] は「予測に使う側と予測される側」) |
| a2 jp | low ×6 | challenge 不適合 / 原因側 / 推定 hook 後半 / 棄却 caption / 信頼度の解釈 / key_points の反復 | 未修 (いずれも low のまま) → L10 / L4 / L9 / L6 / L5 / L9 |
| a2 loc | low ×5 | [[jp:]] 併記不足 / hook「通常・usually」/ zh の「・」「〜」/ "a range with a width" | 未適用 → L2 (建議修) / L3 (記録のみ) |

zh / en での退行 (失敗型 (5)): a1 で直した内容 (散布図の定義位置、比喩削除、絶対値表現、母集団の定義) を zh / en で確認 → 全て jp と同じ形で反映、退行なし。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (統計の正しさ、関連題との整合) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 相関係数 | OK — −1〜+1、符号 = 向き・絶対値 = 強さ、絶対値 1 に近いほど直線に並ぶ、散布図の定義 / mix: 絶対値が大きくても因果とは限らず第 3 の要因でも大きくなりうる (正しい、断定なし) / 強さは絶対値で比較 (−0.8 > +0.3、正しい)。fig table 3 行 (+1 付近 = 右上がり / 0 付近 = 直線的関係ほぼなし / −1 付近 = 右下がり) は 2011h23tokubetsu-q015 と整合。正 / 負の相関の言い方が決定的 → L1 | OK (analogy 空、hook = 記号) | hook zh / en の程度 → L2 | L1 建議修 / L2 建議修 |
| 2 | 説明変数 | OK — 原因側 (入力側)、独立変数、回帰で式に入れる側、気温 → 売れ行きの例 / mix: 役割は分析の目的で決まる (正しい)。「原因側」は慣用 → L4 | OK | OK | L4 |
| 3 | 目的変数 | OK — 結果側 (出力側)、従属変数、式から求める側 / mix: 1 つの式で求める目的変数は 1 つ (重回帰でも成立、正しい)。宝箱の比喩は「手がかり (説明変数) をたどった先」で one と同じ向き、因果を主張しない | OK | OK | なし |
| 4 | 推定 | OK — 標本から母集団の値を見積もる、点推定 / 区間推定、信頼度 / mix: 同じ信頼度なら標本大 → 幅狭、同じ標本で信頼度高 → 幅広 (正しい)。fig compare (52 点 / 48〜56 点 / 95%) 整合。スープの比喩 (ひとさじ = 標本) は one と一致。信頼度の言い方は入門の近似 → L5 | OK | loc polish → L3 | L3 / L5 / L9 |
| 5 | 仮説検定 | OK — 帰無仮説を立て、そのもとでのデータの起こりにくさを見て棄却を判断、有意水準 (例えば 5%・1%) を事前に決め、下回れば棄却して対立仮説を採る / mix: 棄却できない ≠ 正しい (正しい) / α を小さくするほど棄却されにくい (正しい)。裁判の比喩は「無罪を前提、説明できないほどの証拠で有罪」= points[0] と同じ向き。fig flow 4 段は one・detail と一致 | OK (caption の棄却先行 L6) | en の比喩の格言 → L7、[[jp:帰無仮説]] → L3 | L3 / L6 / L7 / L9 |
| 6 | 回帰分析 | OK — 回帰式で説明変数から目的変数を予測、単回帰 (1 つ) / 重回帰 (2 つ以上)、単回帰は最もよく合う直線 y = ax + b / mix: 相関分析と目的が違う (式を作る vs 対等に強さを測る) / 外挿は当てにしにくい (正しい)。hook (Galton の親子身長、平均への回帰) は史実どおり。2024r06-q014・2024r06-q065 と整合 | OK | OK | L8 |
| 7 | 相関分析 | OK — 相関係数・散布図で 2 変数の関係の程度を調べる、散布図 → 相関係数の順、同一対象から 2 値を 1 組で集める / mix: r が 0 付近でも曲線関係がありうる、r は直線的関係だけを測る (正しい)。2023r05-q006 の誤答肢 (相関分析 = パラメータ削減) を支持しない | OK (analogy 空) | OK | なし |

**単元レベル**: goals 3 点・overview_cols 2 (分類 / 結果・位置づけ)・overview_rows 7 行・pairs 3 組 (説明/目的 3 行 key 1、推定/仮説検定 3 行 key 1、回帰/相関 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge_questions 3 件 (2009h21h-q080 / 2009h21a-q070 / 2009h21h-q007 — 本文と矛盾なし、本単元の用語は問わない → L10)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 10 (うち 建議修 2)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[0].detail_jp/zh/en` (+ 派生 `explanation_*`)、`terms[0].fig.data.rows[0].cells[1].jp/zh/en`、`terms[0].fig.data.rows[2].cells[1].jp/zh/en` | 正の相関を「一方が増えると他方も増える」、負の相関を「一方が増えると他方が減る」と決定的に言う。相関は傾向であり、同じ用語の points[1] が例示する +0.3 程度の弱い正の相関では、一方が増えても他方が減る組が多数ある (統計的主張の一般化しすぎ、措辞級。引用題なし・誤答誘導なし) | detail_jp「値が正なら一方が増えると他方も増える **正の相関**、負なら一方が増えると他方が減る **負の相関** を表し」→「値が正なら一方が増えると他方も増える傾向にある **正の相関**、負なら一方が増えると他方が減る傾向にある **負の相関** を表し」/ detail_zh「值为正表示一方增加时另一方也增加的**正相关**，值为负表示一方增加时另一方减少的**负相关**」→「值为正表示一方增加时另一方也有增加倾向的**正相关**，值为负表示一方增加时另一方有减少倾向的**负相关**」/ detail_en "where one variable rises as the other rises, and a negative value means **negative correlation**, where one rises as the other falls" → "where one variable tends to rise as the other rises, and a negative value means **negative correlation**, where one tends to rise as the other falls" / rows[0].cells[1]: jp「正の相関 (一方が増えると他方も増える)」→「正の相関 (一方が増えると他方も増える傾向)」、zh「正相关（一方增加，另一方也增加）」→「正相关（一方增加，另一方也倾向于增加）」、en "Positive correlation (as one rises, the other rises too)" → "Positive correlation (as one rises, the other tends to rise too)" / rows[2].cells[1]: jp「負の相関 (一方が増えると他方は減る)」→「負の相関 (一方が増えると他方は減る傾向)」、zh「负相关（一方增加，另一方减少）」→「负相关（一方增加，另一方倾向于减少）」、en "Negative correlation (as one rises, the other falls)" → "Negative correlation (as one rises, the other tends to fall)" |
| L2 | LOW **建議修** | `terms[0].hook_zh` / `hook_en` (+ 派生 `memory_hook_zh/en`、`summary.memory_hooks_zh/en[0]`) | jp「書かれることが多い」に対し zh「通常」/ en "usually" で程度が強い (a2 loc-review low、未適用) | zh「通常用符号 **r** 表示。」→「常用符号 **r** 表示。」/ en "It is usually written with the symbol **r**." → "It is often written with the symbol **r**." |
| L3 | LOW | `terms[4].points[1].text_zh/en`、`terms[3].points[0].text_zh/en`、`overview_cols_zh[1]`・`overview_rows[0].one_line_zh`・`terms[3].fig.data.rows[1].b.zh`・`key_points_zh[0]`、`overview_rows[3].extra_en[1]`・`terms[3].fig.data.rows[0].b.en`・`pairs[1].rows[1].a_en` | loc polish (a2 loc-review low、未適用): 考点初出の `[[jp:帰無仮説]]` / `[[jp:信頼度]]` / `[[jp:標本]]` 併記なし、zh に日本式「・」「〜」、en "a range with a width" の直訳調。意味の誤りなし | 記録のみ (任意: loc-review の fix_jp どおり) |
| L4 | LOW | `terms[1].one_jp/zh/en`、`overview_rows[1].one_line_*`、`pairs[0].rows[0].a_*` | 説明変数を「原因側」と定義。回帰の説明変数は因果の原因とは限らず、key_points[1] (相関 ≠ 因果) と緊張がある。ただし「(入力側)」併記と points[0] (役割は分析の目的で決まる) で緩和され、本単元は回帰で因果が示されるとは書かない (a2 jp-review low) | 記録のみ (教科書・シラバスの慣用表現) |
| L5 | LOW | `terms[3].detail_jp/zh/en` 2 文目 | 「その範囲に母集団の値が入る確からしさを信頼度として添える」は、厳密には同じ手順を繰り返したとき区間が真値を含む割合 (頻度論の解釈)。IP 水準の一般的説明で、引用題なし (a2 jp-review low) | 記録のみ |
| L6 | LOW | `terms[4].fig.steps[3].caption_jp/zh/en` | 「棄却」が、太字で定義する detail より前の図 caption に出る。one の「退ける」・nodes[3]「退けるかを決める」から意味は取れる (a2 jp-review low) | 記録のみ |
| L7 | LOW | `terms[4].analogy_en` | jp「疑わしきは罰せず」(in dubio pro reo) を en は "innocent until proven guilty" (推定無罪) とし、格言が別のもの。続く文の内容 (無罪を前提、強い証拠で有罪) は jp と同じで、比喩の向きは points[0] と一致 | 記録のみ (英語圏で通じる近い格言への置換として許容) |
| L8 | LOW | `terms[5].analogy_jp/zh/en` vs `terms[5].points[1]` | 比喩「足跡の間に道を引き、次の一歩がどこに着くかを見積もる」はデータのすぐ外側への予測の像で、points[1]「データの範囲から大きく外れた値を入れた予測は当てにしにくい」と衝突はしない (一歩 = 隣接)。時系列予測にも読めるが、回帰の「線を引いて予測に使う」核は正しい | 記録のみ |
| L9 | LOW | `terms[3].hook_jp`・`terms[4].hook_jp` (+ 派生・summary)、`key_points_jp[1]`・`[4]` | §9 / D-203 の反復: 2 フックが「と字で覚える」で結ぶ、推定 hook 後半「手元の一部から全体の値を決めにいく」は one の言い換え、key_points[1] / [4] は相関係数 points[0] / 仮説検定 points[0] とほぼ同文 (要点欄なので許容; a2 jp-review low) | 記録のみ |
| L10 | LOW | `challenge_questions` | 3 題 (分散の比較 / 一様乱数の期待値 / 株式の期待値) はいずれも本単元の用語を問わない。term_questions が全用語で空、中問組員を除くと topic 内に該当題が無いため選択の余地なし (a1・a2 jp-review low) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 説明変数 = 原因側・入力 x / 目的変数 = 結果側・出力 y: `pairs[0].rows[0..2]`、各 one (定義そのもの)、overview 総表の行 (D-195 §3 の構造)、各 detail は自分の側だけ → 許容。② 推定 = 値を見積もる / 仮説検定 = 退けるか判断: `pairs[1].rows[0]`、`goals_jp[2]` (観点の予告)、overview 総表 → 許容 (key_points[3] は両者の共通点で対比ではない)。③ 信頼度 / 有意水準: `pairs[1].rows[2]` のみ → 許容。④ 回帰 = 式で予測・変数を分ける / 相関 = 強さを測る・対等: `pairs[2].rows[0..1]`、`terms[5].points[0]` の 2 箇所 → 上限内 (a1 で 3 箇所 → 解消)。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。事実は正しい。
- O2 `source_figures` は v1 から継承の 6 件で、challenge 外の 2010h22h-q067 / 2011h23tokubetsu-q056 / 2014h26a-q095 / 2018h30a-q005 を含む (本文に図の内容は使われない)。表示上の影響は本監査の範囲外。
- O3 説明変数 detail の例 (気温 → 飲み物の売れ行き) は topic 外の 2024r06-q014 (気温 → 販売量、回帰分析) と同じ定番の場面。topic 外・文言一致 0 で D-198 の対象外だが、記録しておく。

確認済みで問題なし: 統計的主張 (相関 ≠ 因果、直線的関係のみ、外挿注意、区間幅と標本・信頼度、棄却できない ≠ 正しい、α と棄却されにくさ、Galton 由来) は全て正しい、§9 禁止句 grep (定型締め句 0; 「覚え」は L9)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤65 字)、D-198 写し (validate 0、独立照合 遮蔽あり / なし / 近似とも 0)、`[[jp:]]` 原語 (22 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (7/7)、zh 訳語表 (B6 warn 0)、図種 (static table / static compare / flow steps ×2 / 図なし ×3 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、a1 の MEDIUM 2 件の解消と zh / en 非退行。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **10** (建議修 2: L1・L2 / 記録のみ 8: L3〜L10) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 7 用語・考点 10 件 (全て mix、引用題なし) + challenge 3 題 (全て再計算一致) で、統計の事実誤り・誤答肢の支持・言い過ぎ (因果・一般化) は無く、a1 で棄却理由となった MEDIUM 2 件 (散布図の定義前使用、二人三脚の比喩) は三語とも解消済み。LOW 建議修 2 件 (L1 相関の「傾向」、L2 zh / en の程度) は補丁 (B3) で修正推奨、L3〜L10 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-34-u03
✓ technology-13-34-u03 unit: 0 issues (data/ip/textbook/units/technology-13-34-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-34-u03
✓ technology-13-34-u03 parity: 32 locations, 0 diff
EXIT=0
```
