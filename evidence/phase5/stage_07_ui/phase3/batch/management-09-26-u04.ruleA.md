# Rule A 全数抽検 — management-09-26-u04 (スクラムの構成要素)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S148 b32)、repo HEAD `b789756e` + 作業ツリー (単元 JSON = `b32-u04-a1` merge 結果、`merged.json` と同一 [cmp]、sha256 先頭 `afc125051e81905b`)。journal `data/ip/textbook/.planning/v2/management-09-26-u04/journal.b32-u04-a1.jsonl`。
- **対象**: `data/ip/textbook/units/management-09-26-u04.json` (textbook-unit-v2)、用語 **8 / 8 = 全数** (スクラム / スクラムチーム / プロダクトオーナー / 開発者 / スクラムマスター / スプリント / プロダクトバックログ / スプリントバックログ) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205、D-208 (失敗型 (1)〜(7))、D-209、D-210、S147 追加 (8)〜(10)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・裏付けのない限定・D-198 (iii)・zh / en が誤答肢寄り・D-205 版なしの言い切り・(8)(9)(10) / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 8 用語の `one / detail / analogy / hook / points[] / fig (label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ (派生 `definition_* / explanation_* / memory_hook_* / summary.*` は本体の記法除去版 [`[[jp:X]]` → `(X)`] であることをスクリプトで確認、不一致 0)。
2. **考点 × 引用題**: 考点 12 件 (exam 4 / mix 8)、引用 qid 延べ 5 = 異なり 5 題 (2019r01a-q040 / 2019h31h-q047 / 2024r06-q040 / 2021r03-q051 / 2019r01a-q052)、未引用の quiz / challenge 2 題 (2025r07-q039 / 2026r08-q043)。各題の stem_jp_clean・選択肢・`correct_answer` を再読 (全題 topic `management-09-26`)。topic 41 題中スクラム関連語を含む題はこの 7 題 + 2015h27a-q038 (プロトタイピング) / 2023r05-q040 (DevOps) のみで、**スクラムの役割名・人数・版に触れる題は 0**。
3. **D-198 写し**: validate copy guard 0、`choice-echo` warn 0。独立照合 = 単元 JP 文字列 114 本 (派生除く) × topic 41 題 (題文 + 選択肢) の 12 字連続一致 — カタカナ 4 字以上・英数遮蔽あり **0 件** / **遮蔽なし 0 件**。近似一致 (文単位 SequenceMatcher ≥ 0.6) **0 件**。カタカナの多い文 (スプリント points[1]・各 one) を目視: 2019r01a-q052 の選択肢は語名のみで、考点はイテレーション / スクラムの名を使うだけ。(iii) 判定: スクラム points[0] (2019r01a-q040 正答ウ) と スプリント points[0] (2021r03-q051 正答エ) は正答肢を概念順に言い換えた形だが、前者はスクラムガイド自身の定義 (複雑な問題・反復的かつ漸進的) = 標準定義の一般表現、後者は題の場面 (分析システム・精度向上) を使わない一般表現で、いずれも「最も適切なもの」型の正答内容を見出し語の定義として述べる D-209 免除内 (誤答肢の打ち消し・組・順序の再現なし)。スクラム points[2] (2019h31h-q047 エ + 2024r06-q040 ア) も 2 題の正答を一般化して結合したもので、誤答肢 (大規模向き・文書重視・契約重視 / 共通フレーム・逐次型・プロトタイプ) を再演しない。
4. **D-195**: one = 1 文 × 8 (太字あり)、detail 2〜3 文、比喩空 2 (開発者・スプリント、hook あり)、hook 空 3 (スクラムチーム・スクラムマスター・スプリントバックログ、analogy あり)。定義前使用: アジャイル開発 = u03 前提 (prerequisites)、フレームワーク = スクラム one、スクラムガイド = スクラムチーム detail で初出 (説明なし、JP review r2 low と同見解 → L6)。**§9 禁止句 grep**: 「覚え」3 (hook_jp スクラム / スプリント / プロダクトバックログ) → L5、「とされる」2 (`terms[1].detail_jp`「10 人以下が目安とされる」、`terms[5].detail_jp`「毎回同じにそろえるとされる」) はどちらも「2020 年版のスクラムガイドでは…」の出典帰属の述語で §9 のぼかし締め句ではない → 指摘なし、「選ぶ」1 (`terms[1].analogy_jp`「演目を選ぶ人」) は通常語で偽陽性。図: tree static (スクラム) / flow steps 4 (スプリント) — 登録 6 種 (`validateV2.test.ts:87` compare / flow / network / svg / table / tree) 内。
5. **D-200**: 考点数 3/1/1/1/1/3/1/1 (≤3 ✓)、各 JP 1 文・40〜68 字 (≤100 ✓)。**framing 件数** (`validateV2.ts` `pointFraming` を tsx で実行): jp 0 / zh 0 / en 0。
6. **前歴の解消確認 (journal)**: JP review r1 の唯一の MEDIUM (`terms[0].points[1]` が 2025r07-q039 に結ばれていた) → 現行は kind `mix`・qids なしで解消、三語とも退行なし。r1 の LOW (tree ラベル「作業の一覧」→「バックログ (一覧)」、PO 比喩「旅のリーダー」→「係」、開発者 points を職種名でない旨に変更、イテレーション考点の書き方、スプリント points[2]「次に扱うかは並べ替えで改めて決める」、サーバントリーダーシップ → 2020 年版「仕えるリーダー」、PO 1 人の反復削減) も全て現行で解消。loc review r1 LOW のうち `terms[5].points[1]` zh / en の循環表現は未修 → L1 で建議修。
7. **D-202 / D-203 / 書き方 7 (役割の境界)**: `terms[1].detail_jp`「誰が何をいつどう進めるかはチーム自身が決める」と `terms[2].points[0]` / `pairs[0].rows[0]`「何を・どの順で作るか = PO、どう作るか = 開発者」は、どちらも 2020 年版スクラムガイドの記述 (自己管理 = チーム内で誰が何をいつどう行うかを決める / PO = プロダクトバックログの並び順 / 開発者 = スプリントバックログ・どう作るか) で、PO はチームの一員 (`terms[1].points[0]`) なので矛盾しない。SM は上司でない (`terms[4].points[0]`) ↔ detail「仕えるリーダー」・analogy「登山のガイド (代わりに登らない)」・劇団 analogy「稽古が滞らないよう支える人」→ 整合。PO analogy「行き先と順番を決める係、段取りは仲間」↔ points[0] 整合 (上位者の像は r1 で除去済)。書き方 8: PB / SB の「続く期間」は `pairs[1].rows[2]` と `terms[7].points[0]` の 2 箇所 → L4。
8. **D-205 / D-210 (スクラムガイドは改訂される文書)**: 版で変わる数・名称は版付き — `terms[1].detail`「2020 年版…PO と SM は各 1 人、開発者は複数人…10 人以下が目安」、`pairs[0].rows[2]` ラベル「人数 (2020 年版スクラムガイド)」、`terms[3].hook`「2017 年版までは開発チーム、2020 年版で開発者」、`terms[4].detail`「2020 年版…仕えるリーダー」、`terms[5].detail`「2020 年版…1 か月以内」、`terms[7].detail`「2020 年版…スプリントゴールも含まれる」。いずれも 2020 年版の内容と一致 (本監査の知識による照合; 原文は未取得)。版なしの「3 つの役割」(`terms[1].one_jp`・`goals_jp[1]`・`overview_rows[1].one_line_jp`・`terms[1].points[0]`・`key_points_jp[1]`) は 2010〜2020 の全版で 3 と不変、名称「開発者」は 2020 年版名で改称は hook に版付きで記載 → MEDIUM に当たらず L3。D-210: 引用・quiz・challenge 7 題はどれも役割名・人数・版に依拠しない (アジャイル一般 / スクラムの定義 / イテレーション) → 版の明記を要する旧版文言なし。**ただし構成の言い切り** (スクラムが定める決まりごと = 役割・スプリント・バックログ) は M1。
9. **三語**: zh・en が jp と同じ事実か、図ラベル・caption・pairs 行の三語一致 (parity 0 diff)、`[[jp:]]` 原語 11 種 (スクラム / スクラムチーム / プロダクトオーナー / 開発者 / スクラムマスター / スプリント / プロダクトバックログ / スプリントバックログ / アジャイル開発 / フレームワーク / イテレーション) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 8 用語に見出し語の `[[jp:]]` あり。zh 訳語は `zh_terms.json` どおり (validate の warn 1 件は §1-10)。
10. **validate warn `zh-term terms[5](スプリント).hook_zh スプリント → 冲刺`**: hook の「スプリント」は陸上の短距離走の意で見出し語の訳語の誤りではない (偽陽性、loc review r1 と同見解)。ただし zh で陸上の sprint にあたる語がまさに「冲刺」なので、hook に入れると warn が消え、見出し語 (冲刺) との結び付きも生まれる → L2 (建議修)。

## 2. 用語別判定 (8 / 8)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | スクラム | OK — exam 2 / 3 題: 複雑で予測しにくい課題のための反復・漸進の枠組み (2019r01a-q040 正答ウ; 誤答 = 成熟度モデル・共通フレーム・知識体系 を支持しない) / 機能を小さく区切り価値の高い順に作るので要求変更を次の反復に取り込める (2019h31h-q047 正答エ / 2024r06-q040 正答ア; 「優先度の高い」→「価値の高い」は同趣旨)。mix: アジャイルは総称でスクラムはその 1 つ (r1 MEDIUM 解消)。detail の決まりごとの列挙が閉じている → M1。quiz 2025r07-q039: 空欄 b (変更への迅速な対応) は points[1][2] で解けるが空欄 a (従来の逐次型モデルとの関係 = その問題点を改める立場で提唱された、という趣旨) は本文に無く u03 依存 → L7。型 (9): 2019r01a-q052 の誤答イ (スクラム) に one の「短い期間の反復」が引き寄せうるが、`terms[5].points[1]` が反復周期の名 = イテレーション、スクラム = 枠組みと区別しており誤答に導かない。analogy (壁画を 1 区画ずつ仕上げて見せる) は 2024r06-q040 誤答エ (プロトタイプで評価) に寄りうるが「仕上げて」で完成品の積み上げとして描き、points[2] が正答アを直接支える → 指摘なし | OK (tree static) | OK | M1 / L5 / L7 |
| 2 | スクラムチーム | OK — 引用題なし。PO・SM 各 1、開発者複数、階層・下位チームなし、自己管理、10 人以下 (2020 年版明記)。points[0] 役割は上下でなく責任の分担、SM もチームの一員 = 2020 年版と一致。analogy (劇団) は 3 役割と対応し上位者の像なし | OK (図なし) | OK | L3 / L6 |
| 3 | プロダクトオーナー | OK — 価値の最大化に責任、何をどの順で作るか、PB の並び順の判断はこの役割 = 2020 年版と一致。points[0] PO = 何・順、開発者 = どう | OK | OK | なし |
| 4 | 開発者 | OK — 各スプリントで使えるインクリメントを作る / スプリントバックログを作り日々適応 / 品質基準 (完成の定義) を守る = 2020 年版。hook の改称の版も正しい。points[0] 職種名でなく役割名 | OK | zh「成果物」「职种」は loc low (未修) → 記録のみ (L8) | L8 |
| 5 | スクラムマスター | OK — スクラムの効果に責任・障害物の除去の手助け・イベントが目的どおり行われるよう促す・仕えるリーダー (2020 年版明記)。points[0] 作業を割り当て進捗を管理する上司ではない (型 (8): 比喩「ガイド」は他の見出し語の語幹でも、別定義の役割名でもない) | OK | OK | なし |
| 6 | スプリント | OK — exam 2 / 2 題: 長さ固定の期間で繰り返すたびに動く機能が加わる (2021r03-q051 正答エ; 誤答 = 着手前のトライアル・委託・逐次承認 を支持しない) / 反復周期の一般名 = イテレーション、スクラムではスプリント (2019r01a-q052 正答ア; 誤答イ スクラムを支持しない)。mix: 期間は延ばさず未完の項目は PB に戻す = 2020 年版。flow 4 段 (プランニング → デイリー → レビュー → レトロ) = detail・key_points[3] と一致 | OK (flow steps 4) | points[1] zh / en 循環 → L1、hook_zh → L2 | L1 / L2 / L5 / L9 |
| 7 | プロダクトバックログ | OK — 引用題なし。PO が内容と並び順に責任、追加・並べ替えが続く、上位ほど具体化。one「価値の高い順」は 2020 年版の「順序付けられた」より狭い簡略化 (JP review r2 low と同見解、2026r08-q043「優先順位をつけて」と矛盾なし) → L10。points[0] 工程表ではない | OK | OK | L5 / L10 |
| 8 | スプリントバックログ | OK — プランニングで作成、開発者が自分たちのために持ち日々更新、2020 年版でスプリントゴールを含む = 2020 年版。analogy (候補リストから今日の分 + 回る順) は PB の analogy と対で、one と一致 | OK | zh「由开发者为自己而持有」直訳調 (loc low 未修) → L8 | L4 / L8 |

**単元レベル**: goals 3・overview_cols 2・overview_rows 8 行・pairs 2 組 (PO / 開発者 3 行 key 1、PB / SB 3 行 key 1)・key_points 5 (key_points[3] の 4 イベントは 2020 年版のスプリント内イベントと一致し閉じた列挙として正しい)・summary (記法除去版と一致)・challenge 3 題 (2019h31h-q047 / 2024r06-q040 / 2026r08-q043 — 本文と矛盾なし; 2026r08-q043 [2 週間ごとのリリース・候補と不具合を一覧で優先順位管理 → アジャイル、誤答 DevOps] は スクラム one・PB one で解ける)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 10 (うち 建議修 2)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[0](スクラム).detail_jp` / `detail_zh` / `detail_en` 1 文目 (+ 派生 `explanation_*`)、関連 `terms[0].fig` (tree) | スクラムが定める決まりごとを「チームの役割、繰り返す期間 (スプリント)、作業を管理する一覧 (バックログ) **という**決まりごとを最小限**だけ**定め」と閉じた列挙で言い切り、tree 図も スクラム → チーム / スプリント / バックログ の 3 分岐だけを示す。スクラムガイド (2020 年版) が定める構成はチーム・イベント・作成物 (プロダクトバックログ / スプリントバックログ / **インクリメント**) で、インクリメントは単元のどこにも出ない (grep 0)。改訂文書の構成を版なし・閉じた形で述べ、出典の構成員を落としている (S147 型 (10) / D-205)。図はノード追加 = 構造変更になるため本補丁では扱わず、本文の閉じを開けば図は「単元で扱う要素」の図として読める | jp: `という決まりごとを最小限だけ定め` → `などの決まりごとを最小限だけ定め`<br>zh: `Scrum 只规定最低限度的规则，即团队的角色` → `Scrum 只规定最低限度的规则，例如团队的角色`<br>en: `fixes only a minimal set of rules: the team's roles` → `fixes only a minimal set of rules, such as the team's roles` |
| L1 | LOW **建議修** | `terms[5](スプリント).points[1].text_zh` / `text_en` | jp「1 回分の反復周期を一般に**イテレーション**と呼び」を zh「迭代周期…称为**迭代**」/ en "One iteration cycle … is generally called an **iteration**" と訳し、「迭代を迭代と呼ぶ」循環文になっている (loc review r1 low の未修)。jp は正しく、`[[jp:]]` で答えは伝わる | zh: `以短期间为单位的开发中一次的迭代周期一般称为**迭代**` → `以短期间为单位的开发中，一次反复的开发周期一般称为**迭代**`<br>en: `One iteration cycle in development built on short periods is generally called an **iteration**` → `One repeated development cycle built on short periods is generally called an **iteration**` |
| L2 | LOW **建議修** | `terms[5](スプリント).hook_zh` (+ 派生 `memory_hook_zh`、`summary.memory_hooks_zh` の該当項) | validate warn `zh-term … スプリント → 冲刺` は偽陽性 (陸上の短距離走の意) だが、zh の陸上用語「冲刺」を入れれば warn が消え、見出し語 冲刺 と hook が結び付く | zh: `和田径的短跑（sprint）一样` → `和田径的短跑冲刺（sprint）一样` |
| L3 | LOW | `terms[1].one_jp`・`goals_jp[1]`・`overview_rows[1].one_line_jp`・`terms[1].points[0].text_jp`・`key_points_jp[1]` (三語) | 「3 つの役割」とその名称を版なしで言う。数は全版で 3、名称の改称は `terms[3].hook` に版付き、人数は 2020 年版明記 → D-205 の medium に当たらない (JP review r2 low と同見解)。2020 年版は「役割」でなく「責任 (accountabilities)」と呼ぶ点も同様 | 記録のみ |
| L4 | LOW | `terms[7].points[0]` ↔ `pairs[1].rows[2]` | SB はスプリント終了で役目を終える、が対比表と考点の 2 箇所 (書き方 8 の上限内、D-203 §9 の言い直し寄り) | 記録のみ |
| L5 | LOW | `terms[0].hook_jp`・`terms[5].hook_jp`・`terms[6].hook_jp` (+ 派生) | 「〜と覚える」「〜姿で覚える」の結びが 3 件 (§9 同型の結び、記憶フックとして許容; u06 L2 の前例) | 記録のみ |
| L6 | LOW | `terms[1].detail_jp` (三語) | 「スクラムガイド」が初出で説明なし (JP review r2 low と同見解)。以降 4 用語が版の根拠に使う | 記録のみ |
| L7 | LOW | `terms[0].quiz[1]` / `inline_quiz[1]` = 2025r07-q039 | 空欄 a (従来の逐次型モデルとの関係 = その問題点を改める立場で提唱された、という趣旨) は本単元本文に無く u03 依存。空欄 b は points で解ける | 記録のみ |
| L8 | LOW | `terms[3].one_zh` 等「成果物」、`terms[3].points[0].text_zh`「职种」、`terms[7].detail_zh`「由开发者为自己而持有」、`terms[4].one_zh` 太字 2 分割、`goals_zh[0]`、`overview_cols_zh[1]`「・」、`terms[2].hook_zh`「」、zh「期间」単独用法 | loc review r1 の low (未修) を確認、意味の誤りなし | 記録のみ |
| L9 | LOW | `terms[5].hook_en` | jp「走り切れる短い区間」に en "at full speed" が加わり、全力疾走の像が足される (アジャイルの持続可能なペースとはやや逆向き)。引用題に関わらず | 記録のみ (任意: `you can finish at full speed` → `you can run all the way through`) |
| L10 | LOW | `terms[6].one_jp` / `overview_rows[6].one_line_jp` (三語) | PB を「価値の高い順」と定義。2020 年版は「順序付けられた」一覧で基準を価値に限らない。PO = 価値の最大化に責任のため一般的な簡略化として通り、引用・challenge と矛盾なし (JP review r2 low と同見解) | 記録のみ |

**対比の出現欄 (書き方 8)**: ① PO = 何・順 / 開発者 = どう: `pairs[0].rows[0]`、`terms[2].points[0]`、overview extra (総表の列 = D-195 §3 の構造) → 許容。② PB = 全体・PO / SB = 1 スプリント・開発者: `pairs[1].rows[0..1]`、各 one・detail (定義そのもの) → 許容。③ 続く期間: L4。④ 人数 1 / 複数: `pairs[0].rows[2]`・`terms[1].detail` の 2 箇所 → 許容。

確認済みで問題なし: 限定条件 (exam 考点 4 件全て保持、「最も適切」型の正答の一般化のみ)、D-198 (copy guard 0・独立照合 遮蔽あり / なし 0・近似一致 0・choice-echo 0)、D-197 羅列 (validate 0)、D-200 (≤3、1 文、≤68 字)、framing 0/0/0、§9 (定型締め句 0、「とされる」2 件は出典帰属)、図種 (tree / flow = 登録内)、`[[jp:]]` 原語 11 種実在、one_zh / one_en 見出し語併記 8/8、派生フィールド一致、parity 0 diff、型 (1) (iii) / (2) 「など」落ち / (3) 別名の別物扱い / (4) 比喩の範囲 / (5) 退行 / (6) zh・en の誤答肢寄り / (7) 旧版文言 / (8) 比喩の役割名 / (9) hook の誤答誘導 を各々点検し該当なし (型 (10) は M1)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **10** (建議修 2: L1・L2 / 記録のみ 8: L3〜L10) |

## 5. 判定

**FAIL** (D-199: MEDIUM 1)。考点 12 件・引用 5 題 + quiz / challenge 2 題で、考点の主張は正答と一致し、誤答肢の支持・限定条件の落ち・写しは無い。役割の境界 (PO = 並び順、SM ≠ 上司) と 2020 年版の数・名称は正しく版付き。M1 (スクラムの決まりごとの閉じた列挙でインクリメントを落とす) は三語とも 1 語の置換で解消でき、B3 補丁 (M1 + 建議修 L1・L2) 後に PASS 相当。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit management-09-26-u04
✓ management-09-26-u04 unit: 0 issues (data/ip/textbook/units/management-09-26-u04.json), 1 warning(s)
  warn  zh-term  terms[5](スプリント).hook_zh  スプリント → 冲刺 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit management-09-26-u04
✓ management-09-26-u04 parity: 30 locations, 0 diff
EXIT=0
```
