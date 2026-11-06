# Rule A 全数抽検 — management-09-26-u05 (継続的な改善と開発・運用の自動化)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S148 第 32 批 b32)、repo HEAD `b789756e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b32-u05-a1` merge 結果、sha256 先頭 `2626b51fd512e2a2`)。journal `data/ip/textbook/.planning/v2/management-09-26-u05/journal.b32-u05-a1.jsonl`。
- **対象**: `data/ip/textbook/units/management-09-26-u05.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (ふりかえり / レトロスペクティブ / CI / 継続的インテグレーション / DevOps / MLOps) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8、テンプレート既知失敗型 (1)〜(10)。比較: `v1-original.json` (用語 6 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち・写し / MEDIUM = 誤解を招く・欄同士の不整合・観点 7 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 8 件 = exam 2 + mix 6、qid 付き 2 件、引用 qid 延べ 7 件 = 異なり 5 題、全題 topic `management-09-26`)**: `data/ip/quiz/questions.json` から各題の題文・選択肢・`correct_answer` を再読。DevOps 以外の 5 用語は topic 内・全問題集とも出題 0 (全問 grep: MLOps / 継続的インテグレーション / レトロスペクティブ / ふりかえり / 継続的デリバリー のヒット 0、「CI」ヒットは CIA の偽陽性のみ、「振り返り」1 件は strategy-04-13 の別文脈) → 5 用語は一般知識 (Scrum Guide 2020 / CI・CD の標準定義) で事実確認。
3. **quiz / challenge_questions** (DevOps quiz 2 + challenge 4、うち本文で未引用 1 題 = 2026r08-q043): 本文と矛盾しないことを確認 (§2 #5、L4)。
4. **D-198 写し**: validate の copy guard = 0 件、`choice-echo` warn 0 行。独立照合: 単元の JP 文字列 112 本 (派生除く) を topic 内全 41 題の題文 + 選択肢と 12 字窓で照合 — (a) カタカナ 4 字以上・英数を □ に遮蔽 (実字 6 未満の窓除外)、(b) 遮蔽なし、各々 1〜2 字置換の近似一致も → **(a) 完全 0 / 近似 0、(b) 完全 0 / 近似 0**。文単位の ed / Dice (較正 HIGH ed 0.14 / Dice 0.52) で Dice ≥0.40 は 1 件のみ (`overview_rows[4].extra_jp[0]` ↔ 2015h27a-q043 エ、Dice 0.45 / ed 0.80、「ソフトウェア」の共有だけで偽陽性)。カタカナの多い文 (DevOps 考点・CI 考点・レトロスペクティブ one / detail) を目視: DevOps `points[0]` は 5 題の正答肢 (開発側と運用側の連携 + 自動化ツール等 + 迅速な導入・更新) と同じ要素を持つが語は全て別 (協力 / 自動化の仕組み / 機能の追加や変更 / 素早く利用者へ届ける) で、DevOps の標準定義の一般表現 → D-198 の例外 (L6)。(iii) 選択肢なぞり: 考点に誤答肢の否定・選択肢の組・順序の再現なし。DevOps `points[2]` (アジャイル / DevOps の対比) は 2019r01a-q055 エ・2024r06-q047 エ (反復開発の記述) と近い内容を持つが、両側を正の定義で述べ、選択肢の語句 (分割・固定した期間・順次追加) を使わない → D-209 の対比例外 (L5)。
5. **D-195**: 結論先行 (one = 1 文 × 6、太字あり)、展開 2〜3 文 (3/2/2/2/3/2 文)、比喩・フック (§6: 料理のメモ / 文集の通し読み / 厨房とホール / 天気予報 = 別場面; hook は字形 1・語源 3・略語 2 で定義の言い換えではない)、定義前使用 (共有リポジトリ・ビルド = CI one の括弧注 [jp-review r1 low 解消]、モデル = MLOps one の括弧注 [r1 medium 解消]、スプリント = レトロスペクティブ one の括弧注、スプリントレビュー = 同 detail、継続的デリバリー = CI 考点内で定義、反復 = 前提単元 u03/u04)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → `freq_badge`「頻出」と `terms[0].fig.steps[2].caption_jp`「挙がった問題から」[通常の用法] のみ = 定型締め句 0; zh / en 相当語 grep は en `examines` の偽陽性 1 件のみ)、図の型 (ふりかえり・CI・DevOps・MLOps = flow steps 4 × 4、レトロスペクティブ・継続的インテグレーション = 図なし; 全て登録内)。**段階図 caption の 1 文規則 (§2)**: 16 本中 jp 2 本・en 1 本が 2 文 → L2。pair 配置 (CI→DevOps は DevOps の後、DevOps→MLOps は MLOps の後、各組 key 行 1)。
6. **D-200**: 考点数 1/1/1/1/3/1 (≤3 ✓)、各 JP 文数 1〜2・字数 47〜86 (≤100 ✓、最大は CI `points[0]` 86 字)。**framing 件数** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 / D-204 / D-205 単元全体点検**: 書き方 7 (CI `points[0]`「毎回自動で行われるのはビルドとテストまで」は one・図 step 2〜3 [統合は開発者、自動はビルド・テスト] と一致 = r1 medium 解消; `pairs[0].rows[0]` の CI 範囲「開発の中での統合とテスト」と一致; DevOps `points[1]`「自動化は運用側の作業 [本番反映] にも及ぶ」は図 `nodes[1]`「テストと本番反映を自動化」・`pairs[0].rows[0].b` と一致; MLOps の「開発から運用・更新まで」は `pairs[1]` と一致) → 不整合 0。書き方 8 → 下の列挙。書き方 9 (限定条件) → §2 表、落ち 0。D-205: スクラムのイベント名・順序 (スプリントの最後 / スプリントレビューの後) は Scrum Guide の全版で不変で数も言い切らないが、検査対象の列挙「人・やり方・道具」は 2020 年版 (個人・相互作用・プロセス・ツール・完成の定義) より狭い閉じた列挙 → L1。
8. **三語**: zh・en が jp と同じ事実か、図ラベル・caption・比較行の三語一致、`[[jp:…]]` 原語 9 種 (ふりかえり / レトロスペクティブ / 振り返り / スプリントレトロスペクティブ / スプリントレビュー / 継続的デリバリー / 継続的インテグレーション / インテグレーション / アジャイル) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` は かな・漢字見出し 3 用語 (ふりかえり / レトロスペクティブ / 継続的インテグレーション) にあり、ラテン文字見出し 3 用語 (CI / DevOps / MLOps) は三語同形で不要 (validate 0)、zh 訳語 (`zh_terms.unit.json`: 回顾 / Retrospective(回顾) / CI / 持续集成 / DevOps / MLOps / 敏捷 / Scrum / 冲刺 / 机器学习 / 开发者 / CD) 一致 (B6 warn 0)。既知失敗型 (6): zh DevOps を「持续交付」とした loc r1 low は「不断交付」に修正済みで CD の定訳との衝突なし、en も "keep delivering" で continuous delivery と重ならない。
9. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | ふりかえり | OK — 出題 0。一定期間ごとにチームで進め方を見直し次に試す改善を決める (アジャイルのふりかえりの標準定義)、KPT は「例えば」付きの一例 (Keep / Problem / Try)。mix: 目的は個人を責めることでなくチームのやり方の改善 (Retrospective Prime Directive と一致)。flow steps 4 (終える → 出し合う → 決める → 次で実行) は one・detail と一致 | OK | OK | L6 / L7 (analogy) |
| 2 | レトロスペクティブ | OK — 出題 0。ふりかえりの英語名で同一概念 (別物として教えない = 既知失敗型 (3) 該当なし)。Scrum のスプリントレトロスペクティブはスプリントの最後、スプリントレビューの後 (Scrum Guide 2020 と一致)。mix: レビュー = 成果物、レトロ = 進め方 (両側正の定義)。hook (retro + spective = 後ろを見る) は語源として正しい | OK (図なし = 定義型) | OK | L1 (detail の列挙) / L10 |
| 3 | CI | OK — 出題 0。小さな変更を頻繁に共有リポジトリへ統合し、そのたびにビルドとテストを自動実行 (標準定義)。mix: CI の自動はビルド・テストまで、本番へ出せる状態まで運ぶのは継続的デリバリー (CD) — CI / CD の境界として正しい (CD を「本番へ自動で出す」= continuous deployment と取り違えていない)。flow steps 4 一致 | OK | en caption 2 文 (L2) | L2 / L9 |
| 4 | 継続的インテグレーション | OK — CI の正式名称で同一概念 (既知失敗型 (3) 該当なし)。detail・mix (最後に 1 回でなく変更のたびに繰り返す) 正しい。hook (integrate / integer 同源 = 欠けのない全体) は語源として正しい | OK (図なし) | OK | L6 |
| 5 | DevOps | OK — exam 2 / 5 題: 開発と運用の担当が協力し、自動化の仕組みで機能の追加・変更を素早く利用者へ届ける (2019r01a-q055 正答イ / 2020r02o-q046 正答ア / 2022r04-q042 正答ア / 2023r05-q040 正答ウ / 2024r06-q047 正答ウ; 誤答 = プロトタイピング・ウォーターフォール・反復開発・ペアプログラミング・WBS・RAD・オブジェクト指向・TDD のどれも支持しない; 題の「自動化ツールなど」「仕様変更要求など」の「など」は、考点が「自動化の仕組み」と広く言い範囲を閉じないので落ちに当たらない) / 自動化は本番反映など運用側の作業にも及ぶ (2020r02o-q046 の本番移行の自動化 / 2022r04-q042 の運用・本番移行の自動化)。mix: アジャイル = 短い反復の開発の進め方、DevOps = 開発と運用の協力体制 (L5)。detail「特定の道具の名前ではなく協力体制と仕組みづくりを含む考え方」で DevOps = 道具という誤解を明示的に否定 (依頼の観点 ✓)。flow steps 4 (開発 → 自動化 → 運用 → 戻す) 一致。challenge 2026r08-q043 (正答アジャイル、DevOps は誤答) → L4 | OK | OK | L2 (caption) / L4 / L5 / L6 |
| 6 | MLOps | OK — 出題 0。DevOps の考え方を機械学習システムに応用し、モデルの開発から運用・更新までを継続的に回す (標準定義; 範囲は「モデルだけ」「運用だけ」に狭めず、データ準備〜監視の一続きの流れ、データ分析・開発・運用の担当の協力を detail で明示)。mix: 本番組込みで終わらず、データの傾向変化で精度が落ちるので監視・再学習を繰り返す (データドリフトの標準説明)。`pairs[1]` (管理対象 = プログラム + 学習データ・モデル [key]、更新契機 = 機能追加・修正 + 精度低下) 正しい | OK | OK | L6 / L8 (hook) |

**単元レベル**: goals 3 点・overview_cols 1 (主な対象)・overview_rows 6 行 (別名 2 組は extra 欄を同一にして同一概念を示す)・pairs 2 組 (CI / DevOps 3 行 key 1、DevOps / MLOps 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 4 件 (2022r04-q042 / 2023r05-q040 / 2024r06-q047 / 2026r08-q043 — 本文と矛盾なし)。事実誤りなし、三語一致。

**前回 HIGH / MEDIUM の解消確認** (journal `b32-u05-a1`): jp-review r1 medium 2 (MLOps のモデル定義前使用 → one に括弧注 / CI 考点の自動化範囲に「統合」を含めた不整合 → 「統合された変更のビルドとテストまで」) = **解消**、zh / en も同内容 (回帰なし、既知失敗型 (5) 該当なし)。loc-review r1 medium 1 (goals_en[0] で 2 語が同じ retrospective になる) = **解消** ([[jp:]] 併記)。loc r1 low (zh「持续交付」衝突 / zh 3 つの観点の数 / hook_en の同語反復 / Main players) も適用済み。loc r2 low のうち未適用 4 件 → L2 (en caption)・L3 (katakana)・L10。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 10 (うち 建議修 3)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1].detail_jp` / `detail_zh` / `detail_en` (+ 派生 `explanation_*`) | スプリントレトロスペクティブで見直す対象を「人・やり方・道具の使い方」と閉じて列挙。Scrum Guide 2020 年版は個人・相互作用・プロセス・ツール・完成の定義を挙げ、改訂される文書の構成要素の列挙で版も「など」も無い (D-205 / 既知失敗型 (10) の形。ただし出題 0 で誤答を招く題は無いため LOW) | jp「直前のスプリントでの人・やり方・道具の使い方を見直し」→「直前のスプリントでの人・やり方・道具の使い方などを見直し」/ zh「审视上一个冲刺中的人员、做法和工具的使用，」→「审视上一个冲刺中的人员、做法和工具的使用等，」/ en "the team looks back at people, methods and tool use in the sprint just finished" → "the team looks back at people, methods, tool use and the like in the sprint just finished" |
| L2 | LOW **建議修** | `terms[2].fig.steps[1].caption_jp`、`terms[4].fig.steps[3].caption_jp`、`terms[2].fig.steps[0].caption_en` | 段階図 caption が 2 文 (D-195 §2「各 step に 1 文の説明」; validate は文数を見ない; en は loc r2 low の未適用)。内容は正しく、zh・他言語は 1 文 | jp「変更をチーム共用の保管場所へ取り込む。これを 1 日に何度も行う。」→「変更をチーム共用の保管場所へ、1 日に何度も取り込む。」/ jp「運用で分かった課題を開発へ伝え、次の改善に生かす。この輪を回し続ける。」→「運用で分かった課題を開発へ伝えて次の改善に生かし、この輪を回し続ける。」/ en "Developers do not pile up large batches of work. They split it into small changes." → "Instead of piling up large batches of work, developers split it into small changes." |
| L3 | LOW **建議修** | `goals_en[0]`、`key_points_en[0]` (+ 派生 `overview.intro_en`、`summary.key_points_en[0]`) | ラテン文字の Retrospective を "katakana name" / "in katakana" と呼ぶ (カタカナなのは [[jp:]] の表記)。jp は「英語名」、同単元の `one_en`・`overview_rows[1].one_line_en` は "English-derived name" で呼び方も不揃い (loc r2 low の未適用) | en "state how it relates to the katakana name **Retrospective** ([[jp:レトロスペクティブ]])" → "state how it relates to the English-derived name **Retrospective** ([[jp:レトロスペクティブ]])" / en "([[jp:ふりかえり]]; in katakana, **Retrospective**, [[jp:レトロスペクティブ]])" → "([[jp:ふりかえり]]; English-derived name **Retrospective**, [[jp:レトロスペクティブ]])" |
| L4 | LOW | `terms[4].points[0]`・`detail_jp` 2 文目・`analogy_jp` ↔ challenge 2026r08-q043 | 既知失敗型 (9) 点検: 題の場面 (2 週間ごとに新機能・修正を繰り返しリリース、優先順位つき一覧で管理) に「機能の追加や変更を素早く利用者へ届ける」「仕様の変更にも短い間隔で」を当てると DevOps (誤答) に寄る余地がある。しかし DevOps の one・考点・hook・図は全て「開発と運用の担当の協力 + 自動化」を必須要素とし、場面にはどちらも無い。`points[2]` が「アジャイル = 短い反復で少しずつ作る開発の進め方」と正答側を正の定義で与える → 誤答を選ばせる手がかりではない | 記録のみ |
| L5 | LOW | `terms[4].points[2].text_*` | アジャイル / DevOps の対比が 2019r01a-q055 エ・2024r06-q047 エ (誤答 = 反復開発の記述) と近い内容を含む (jp-review r1 low と同判断)。両側を正の定義で述べ、誤答肢の語句・組・順序をなぞらない → D-209 の対比例外で (iii) に当たらない | 記録のみ |
| L6 | LOW | `terms[4].points[0]` ↔ `terms[4].one_jp`・`overview_rows[4]`・`key_points_jp[2]`、`terms[3].points[0]` ↔ `terms[3].detail_jp`・`terms[2].detail_jp` 1 文目、`terms[5].points[0]` ↔ `terms[5].fig.steps[3].caption_jp`・`pairs[1].rows[2].b_jp`、`terms[0].one_jp` ↔ `terms[1].detail_jp` 1 文目 | D-203 §9 同義の言い直し (jp-review r1・r2 low と同じ)。DevOps exam 考点は 5 題の正答と一致する標準定義 | 記録のみ |
| L7 | LOW | `terms[0].analogy_jp/zh/en` | 比喩が 1 人で料理してメモする像で、one・考点の「チームで」見直す要素を運ばない (D-204、jp-review r2 low)。考点が否定する内容 (個人を責める) を運ぶわけではない | 記録のみ |
| L8 | LOW | `terms[5].hook_jp/zh/en` | 「DevOps の Dev を ML に差し替えた形の名前」は名前の形の説明として正しいが、字面だけ取ると開発が抜けるようにも読める。one (開発から運用・更新まで)・detail (開発の担当も協力) が開発を含むと明示しており矛盾は生じない | 記録のみ |
| L9 | LOW | `terms[2].points[0].text_*` | 略号 CD は継続的デプロイ (continuous deployment) にも使われるが、単元は継続的デリバリーのみ定義。定義自体 (本番へ出せる状態まで自動で運ぶ) は正しく、デプロイと混同していない | 記録のみ |
| L10 | LOW | `terms[2].detail_zh`「矛盾」、`key_points_zh[0]` の (回顾) 重複、`terms[1].one_zh`「活动」、`terms[0].term_en` "Retrospective (Furikaeri)" ↔ 本文の小文字 retrospective | loc r2 / r1 low の未適用 (IT 用語の自然さ・冗長・Scrum 中文の定訳「事件」・v1 見出し訳との表記差)。意味は通じ、誤読なし | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① スプリントレビュー = 成果物 / レトロ = 進め方: `terms[1].points[0]` (mix)・`terms[1].detail_jp` 2 文目 (レビューの説明として順序を述べる) → 2 箇所で許容 (jp-review r1 は 3 箇所としたが、現版の `terms[0].detail` には対比なし)。② 最後に 1 回統合 / 変更のたびに統合: `terms[2].detail` 1 文目・`terms[3].detail` 2 文目・`terms[3].points[0]` → 3 箇所 (pairs になし) → L6 に含む。③ CI = 開発内 / DevOps = 開発〜運用: `pairs[0].rows[0]` (key)・`terms[4].points[1]` → 2 箇所で許容。④ CI / CD の境界: `terms[2].points[0]` のみ。⑤ DevOps / MLOps (対象・管理物・更新契機): `pairs[1]` のみ (one・detail は MLOps 側を正の定義で述べる) → 許容。⑥ アジャイル / DevOps: `terms[4].points[2]` のみ。

確認済みで問題なし: 前回 MEDIUM 3 件の解消と zh / en 回帰なし (§2 末)、限定条件 (qid 付き考点 2 件とも保持、「など」は閉じない)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤3・≤2 文・≤86 字)、写し (validate 0、独立照合 遮蔽あり / なし とも完全・近似 0、文単位 Dice ≥0.40 は偽陽性 1)、`[[jp:]]` 原語 (9 種全て jp 本文に実在)、zh 訳語表 (B6 warn 0)、図種 (flow steps ×4 / 図なし ×2 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、依頼の重点 (CI と CD の区別 ✓ / DevOps = 開発と運用の協調で道具名ではない ✓ / MLOps の範囲 = データ・モデルを含む開発〜運用〜再学習 ✓ / 比喩・フックの型 (8)(9) → L4・L8、MEDIUM 該当なし)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **10** (建議修 3: L1〜L3 / 記録のみ 7: L4〜L10) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 6 用語・考点 8 件 (qid 付き 2 件)・引用 5 題 + 未引用の challenge 1 題で、考点の主張は正答と一致し、誤答肢を支持する記述・選択肢のなぞりは無く、引用題の限定条件の落ちも無い。出題 0 の 5 用語も標準定義と一致。LOW 建議修 3 件 (L1 Scrum の列挙に「など」、L2 caption 1 文化 ×3、L3 en の "katakana" 呼称) は補丁 (B3) で修正推奨、L4〜L10 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit management-09-26-u05
✓ management-09-26-u05 unit: 0 issues (data/ip/textbook/units/management-09-26-u05.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit management-09-26-u05
✓ management-09-26-u05 parity: 31 locations, 0 diff
EXIT=0
```
