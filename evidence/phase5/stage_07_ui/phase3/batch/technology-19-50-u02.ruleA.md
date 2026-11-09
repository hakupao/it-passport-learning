# Rule A 全数抽検 — technology-19-50-u02 (UX手法・認知と視覚表現)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b75)、repo HEAD `afb67ad0` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b75-u02-a2` merge 結果 [a1 の jp r1 を seed]、sha256 先頭 `a484189e27bcd9ab`)。
- **対象**: `data/ip/textbook/units/technology-19-50-u02.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (シグニファイア / 構造化シナリオ法 / UXデザイン / アクセシビリティ / ピクトグラム / インフォグラフィック) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、D-208 / D-209 / D-210 (既知の失敗型 (1)〜(10))、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/technology-19-50-u02/v1-original.json` (用語 6 語・`term_zh`・`term_en` とも v1 と一致)。先行指摘: `journal.b75-u02-a1.jsonl` (jp-review r1 / r2 = REVISE)、`journal.b75-u02-a2.jsonl` (jp-review r1 PASS、loc-review r1 PASS)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題** (考点 全 8 件 = exam 3 + mix 5、引用 qid 延べ 6 = 異なり 6 題): `data/ip/quiz/questions.json` + `translations/<exam>.json` (stem_jp_clean / zh / en) から各題の題文・選択肢・`correct_answer` を再読 (topic `technology-19-50` 全 8 題; 2025r07-q072 は u01 のデザイン四原則で本単元の対象外)。主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化・限定をしていないこと、限定条件を保持していることを 1 件ずつ確認。
3. **quiz / challenge_questions** (quiz 計 6 枠 + challenge 4 題 = 2024r06-q068 / 2026r08-q058 / 2015h27a-q061 / 2025r07-q018): 本文と矛盾しないこと、本文で解けることを確認。2026r08-q058 (三つのシナリオ = アクティビティ・インタラクション・バリュー; 誤答はペルソナを含む組) は 構造化シナリオ法 の one / detail / 図 (3 段) で解け、本文はペルソナをシナリオとして述べない。2025r07-q018 (正答 = 多様な人が等しく使えるよう配慮した製品の設計; 誤答ウ = 使用で得られる感じ方・反応 = UX の定義) は アクセシビリティ points[0] 第 2 文で解け、pairs[0] (UX / アクセシビリティ) が誤答ウとの取り違えを防ぐ。2015h27a-q061 (正答 = ユニバーサルデザイン; 誤答ア = バリアフリーデザイン) は points[1]・points[2] で解ける。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合として単元の JP 文字列 111 本 (派生フィールド除く; goals / overview_rows.extra / key_points / 図セル・ラベル・caption 含む) を topic 内全 8 題の題文 (stem_jp_clean) + 選択肢 40 本と 12 字連続照合 (句読点・記号・空白除去) を **カタカナ 4 字以上・英数遮蔽あり / 遮蔽なし** の 2 通りで実施 → **0 件**。1〜2 字置換の近似照合 (遮蔽なし、12 字窓・差 ≤2) → 9 窓、全て見出し語 (ユニバーサルデザイン / 構造化シナリオ法) + 助詞の連なりで偽陽性 (`goals_jp[2]`・`terms[3].detail_jp`・`points[1]`・`points[2]`・`key_points_jp[2]`・`overview.intro_jp` ↔ 2010h22a-q071 題文、`terms[1].detail_jp` ↔ 2026r08-q058 題文)。カタカナの多い文 (構造化シナリオ法 detail / points[0]、アクセシビリティ points[0]) は目視でも題文・選択肢の言い回しを写していない。validate の `warn choice-echo` は出ていない。
   - 挿入・脱落を含む近似 (置換照合では見えない形) の目視: `terms[3].points[0].text_jp` 第 2 文「その度合いに配慮した製品の設計そのものを指して使うこともある」と 2025r07-q018 正答アの末尾 (配慮した + カタカナ語 + 製品の設計) は、遮蔽後 9 字に □ 1 字が挿入された形で近い。ただし 12 字未満で、q018 は記述を選ぶ題 (分類型ではないので D-209 の分類型除外には頼らない) だが、正答アはアクセシビリティの標準的定義で、「配慮した…製品の設計」は D-198「標準的な定義・原則の一般表現は写しではない」に当たる。主語・対象 (ソフトウェア)・対象者の列挙 (高齢者や障害者など) を残しておらず、zh「有时也用来指照顾到这种程度的产品设计本身」/ en "product design that takes this degree into account" も同様 → 写しではない (L5 に併記)。
   - (iii) 選択肢なぞり: 2026r08-q058 の正答の組 (3 シナリオ) は分類型の題で、単元は方法の順 (価値→行動→操作) で各段の内容を定義として述べ、選択肢の並び (アクティビティ, インタラクション, バリュー) も誤答のペルソナも再現しない → D-209 の除外。アクセシビリティ points[2] (バリアフリー / ユニバーサルデザイン) は 2015h27a-q061 の誤答肢と正答の 2 語の対比だが、両側を正の定義で述べ選択肢の組 (4 語) や順序を再現しない → D-209 の除外。シグニファイア points[0] / アクセシビリティ points[0] は用語を答える題の題文 (定義) と同じ要素順の言い換え → L5 (記録のみ)。
5. **D-195**: 結論先行 (one = 1 文 × 6、太字あり)、展開 2〜3 文 (3/3/2/2/2/2 文)、比喩・フック (§6 → L7)、定義前使用 (アフォーダンス = シグニファイア detail で定義、シナリオ・3 シナリオ = 構造化 detail、UX / UI = UXデザイン detail で略語展開、ユニバーサルデザイン = アクセシビリティ detail、バリアフリー = points[2] 内で定義)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh・en 相当語 → `hook_jp` の「と覚える」「覚えやすい」2 件 [+ 派生] は記憶フックの言い方で 6 中 2 件のみ (記録対象外)、図セル「選ぶと別のページへ移る」は UI 操作の意味、`source_figures` の「選択肢表」は v1 継承の図メタデータ、en の Example / exam (kind) は偽陽性)、図の型 (シグニファイア・アクセシビリティ = static table、構造化 = flow steps 3、UX = flow static、ピクトグラム・インフォグラフィック = 図なし; 全て登録内)、pair 配置 (UX / アクセシビリティ 3 行 key 1、ピクトグラム / インフォグラフィック 3 行 key 1)。
6. **D-200**: 考点数 2/1/1/3/0/1 (≤3 ✓)、各 JP 文数 1〜2・字数 46〜80 (≤100 ✓、最大はアクセシビリティ `points[0]` の 80 字)。**framing 件数** (validateV2 `pointFraming`、全考点、tsx で実測): jp 0 / zh 0 / en 0。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の照合: アクセシビリティ = 「度合い」[one / overview_rows / pairs / key_points / points[0]] と ユニバーサルデザイン = 「設計の考え方」[detail / points[1] / key_points[2]] が全欄で一貫; points[0] 第 2 文「度合いに配慮した製品の設計を指すこともある」は 2025r07-q018 正答に基づく用法の補足で、UD の「考え方」と別の言い回し; シグニファイア = 「知覚できる手がかり」[one / overview_rows / key_points] で視覚に限る記述なし) → 不整合 0。書き方 8 (対比の出現欄): UI / UX = UX detail + points[0] (2 箇所)、アフォーダンス / シグニファイア = detail + points[1]、アクセシビリティ / UD = detail + key_points[2] (+ goals は予告)、バリアフリー / UD = points[2] のみ、ピクトグラム / インフォグラフィック = points[0] + pairs[1] (2 箇所)、UX / アクセシビリティ = pairs[0] のみ → 全て ≤2、指摘なし。書き方 9 (限定条件) → §2 表、落ち 0。§6 → L7。§9 言い直し → L6。
8. **D-205**: 改訂のある文書 (JIS X 8341 / ISO 9241-210 / WCAG / JIS Z 8210 等) の名称・構成要素数は本文に一切出ない (grep 0)。UX の「使う前の期待〜使った後の満足」(ISO 9241-210 の注記と整合)、アクセシビリティの工夫の表 (代替テキスト・色以外の区別・字幕・キーボード操作) は「工夫の例」として示され、規格の要件として言い切っていない → 該当なし。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 15 種 (シグニファイア / アフォーダンス / 構造化シナリオ法 / シナリオ / バリューシナリオ / アクティビティシナリオ / インタラクションシナリオ / UXデザイン / ユーザーエクスペリエンス / ユーザーインタフェース / アクセシビリティ / ユニバーサルデザイン / バリアフリー / ピクトグラム / インフォグラフィック) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 6 用語に見出し語の `[[jp:]]` あり、zh 訳語 (`zh_terms.json`: 指示符（Signifier） / 结构化情景法 / UX 设计 / 无障碍设计（可访问性） / 象形图（图形符号） / 信息图 → 一致; アクセシビリティの本文主訳は L9)。
10. **隣接単元との整合**: `technology-19-50-u01` (デザインの原則 / 近接 / 整列 / 反復 / 対比 / LATCH) とは用語の重なりなし。`technology-19-51-u01` の ユーザビリティ points[2]「アクセシビリティ = 高齢者や障害のある人を含め誰もが利用できるかどうか」と本単元の定義 (多様な人が等しく使える度合い、`overview_rows[3].extra`「誰でも使えるかを問う」) は一致。19-51 の UI 系用語 (GUI 等) と本単元の UI の説明 (画面やボタンなど利用者と製品が接する部分) も矛盾なし。zh 主訳の差は L9。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | シグニファイア | OK — exam 1 / 1 題: 情報デザインの考え方の一つで、人を適切な行動へ導く手がかり (2024r06-q068 正答ウ; 誤答 = NUI・ウィザード・マルチタッチは本文に出ず支持しない)。**a1 r1 MEDIUM (手がかりを視覚に限定) は解消**: one_jp「知覚できる 手がかり」、detail_jp「例えば部品の形や色、表示の文字などで示される」(例示 + 「など」)、overview_rows・key_points も「知覚できる」。zh は「可被感知的线索」「…等来呈现」で解消。en は one_en "perceivable cue" で解消だが detail_en が例示の印を落とす → L1。mix: アフォーダンス = 行為の可能性そのもの / シグニファイア = それに気づかせる合図 (Norman の区別どおり)。題の例 (ドアノブ) は使わず、図 4 行 (浮き出たボタン・下線付き文字・点線枠・つまみ) と比喩 (床の足跡) は自作 | OK (L5: points[0] は題文と同じ要素順の言い換え) | L1 / L3 | L1, L3, L5, L6 |
| 2 | 構造化シナリオ法 | OK — mix 1 (qid なし): バリュー = 最も抽象的 (価値) / インタラクション = 最も具体的 (画面・操作の細部)。one / detail / 図 3 段の順 (価値→行動→操作、抽象→具体) は標準どおりで、2026r08-q058 (quiz・challenge) の正答の組と一致、誤答のペルソナをシナリオとして述べない。比喩 (家づくり: 暮らし方→一日の過ごし方→スイッチや棚の位置) は 3 段に対応し定義の言い換えでない | OK (L10: step 1 caption 2 文) | OK (L10: zh ノードラベルの括弧注の形) | L6, L10 |
| 3 | UXデザイン | OK — **a1 r1 MEDIUM (exam 考点が 2026r08-q058 を根拠に題が問わない主張 [構造化シナリオ法は UX の手法] を述べた) は解消**: 当該 exam 考点は削除され、points[0] は qid なしの mix (UI = 接点 / UX = 接点を通して得る体験全体) のみ。key_points からも「UX の進め方の一つ」の記述は消えた (r2 LOW も解消)。zh / en も同じ構成で回帰なし。2026r08-q058 は quiz 枠に残るだけで、題文が前提とする「UX デザインで用いられる」は本文で主張しない。detail の UX 範囲 (利用前〜利用後) は 2025r07-q018 誤答ウ (= UX の定義) とも矛盾しない | OK | OK | なし |
| 4 | アクセシビリティ | OK — exam 2 件: (a) 特性や条件の違いを問わず同じように操作し情報を得られる度合い + 配慮した製品の設計を指すこともある (2011h23a-q062 正答ウ / 2022r04-q033 正答ア / 2025r07-q018 正答ア; 誤答 = マーケティング手法・デザイン統一管理・動的生成 / スケーラビリティ等 / CRM・UX・アクセス制御 を支持しない)、(b) UD = 違いをはじめから前提に、できるだけ多くの人が使えるように設計する考え方 (2010h22a-q071 正答エ / 2015h27a-q061 正答エ; 「できるだけ多くの人」は題の「多くの人」「できる限り多くの人」を保持)。mix: バリアフリー = 特定の人の既存の障壁を除く / UD = 最初から多様な人を想定 (標準的区別)。**a1 r2 MEDIUM (「どれだけ多くの人が使えるか」が人数の量に読め、UD と区別が崩れる) は解消**: points[0] は「特性や条件の違いを問わず、同じように」の定義の核になり、UD の「できるだけ多くの人」と別の言い回し。zh「不论用户的特性或条件有何不同，都能同样地…的程度」/ en "regardless of differences in their characteristics or circumstances" も人数の読みなしで回帰なし。限定条件: q033 の「状態又は度合い」の「状態」、q062 の「受発信」の「発信」は本文で落ちる → L8 (主張を狭めるが誤答を支持しない)。図 (困りごと × 工夫の例 4 行) は「例」と明示 | OK (L5: points[0] は q033 題文と同じ要素順の言い換え、D-209 除外) | L9 | L5, L6, L8, L9 |
| 5 | ピクトグラム | OK — 考点なし (topic 内出題 0)。one (1 つの意味を単純化した絵記号で、言葉に頼らず伝える)、detail (案内表示・注意の標識、言語の違う人や文字を読みにくい人にも伝わる) は正しい。JIS Z 8210 等の規格名は出さない | OK | L2 | L2, L7 |
| 6 | インフォグラフィック | OK — mix 1 (qid なし): ピクトグラム = 1 意味 1 絵記号 / インフォグラフィック = 複数の情報を図に組み立てて全体像。pairs[1] (伝える単位 / 主な使い道 / 文字との関係) と一致。hook (information + graphic の縮約) は正しい | OK | L4 | L4, L7 |

**単元レベル**: goals 4 点 (a1 r1 の goals_jp[2] の曖昧さは goals 4 点への分割で解消)・overview_cols 2・overview_rows 6・pairs 2 組・key_points 4 (a1 r1 の「UX デザイン」空白表記、key_points[3] の見出し語なしは解消)・summary (記法除去版と一致)・challenge_questions 4 件 (§1-3、全て本文で解ける)。`unit_summary_*` は v1 と同文 (未改稿)。`source_figures` (2025r07-q072 の選択肢表) は v1 継承のメタデータで本文には出ない。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 10 (うち 建議修 4)** + 範囲外観察 4

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[0](シグニファイア).detail_en` | jp「手がかりは、**例えば**部品の形や色、表示の文字**など**で示される」/ zh「…等来呈现」は例示だが、en "Cues can take the form of a part's shape or color, or the text on a display." は例示の印がなく、視覚的な形の列挙に読める (a1 r1 MEDIUM [視覚への限定] の修正点の en 側の弱まり、観点 (5))。"can" で排他ではなく one_en は "perceivable cue" のため誤答には至らない | en: `Cues can take the form of a part's shape or color, or the text on a display.` → `Cues can take the form of, for example, a part's shape or color, or the text on a display.` (jp / zh は変更なし) |
| L2 | LOW **建議修** | `terms[4](ピクトグラム).one_zh`、`overview_rows[4].one_line_zh`、`key_points_zh[3]` (+ 派生 `definition_zh`、`summary.key_points_zh[3]`) | jp「言葉に頼らず」(言語に頼らない) を zh「不依赖文字」(書かれた字に頼らない) と訳し意味が狭い (loc-review LOW)。key_points は「…因此也能把信息传递给使用不同语言的人」と言語の違いへつなぐため、因果も「语言」の方が通る。v1 zh も「不依赖语言」。en は without words で原文どおり | zh one: `不依赖文字来传达的视觉表达方式` → `不依赖语言来传达的视觉表达方式` / zh overview: `不依赖文字来传达的符号` → `不依赖语言来传达的符号` / zh key_points[3]: `**象形图**不依赖文字就能传达含义` → `**象形图**不依赖语言就能传达含义` (jp / en は変更なし) |
| L3 | LOW **建議修** | `terms[0](シグニファイア).one_zh` (+ 派生 `definition_zh`) | 「应当如何对待某个物体」の「对待」は人や事柄に使う語で、モノの扱い方には不自然 (loc-review LOW)。overview_rows[0].one_line_zh は「该如何操作」 | zh: `让人察觉到应当如何对待某个物体。` → `让人察觉到应当如何操作某个物体。` (jp / en は変更なし) |
| L4 | LOW **建議修** | `terms[5](インフォグラフィック).analogy_zh` | jp「案内ポスター」を「宣传海报」(宣伝・広告のポスター) と訳し、案内・説明の意味からずれる (loc-review LOW) | zh: `就像一张宣传海报，` → `就像一张说明海报，` (jp / en は変更なし) |
| L5 | LOW | `terms[0].points[0].text_jp/zh/en`、`terms[3].points[0].text_jp/zh/en` 第 1 文 | 用語を答える分類型の題 (2024r06-q068 / 2022r04-q033) の題文 = 標準的定義と同じ要素順の言い換え (情報デザインの考え方 → 適切な行動へ導く → 手がかり / 特性の違いを問わず → 同じように → 操作し情報を得る → 度合い)。12 字一致・近似一致なし、列挙の組 (操作,入手,利用) も残さず、題の例 (ドアノブ) も使わない → D-209 の除外に当たり (iii) ではない。同 points[0] 第 2 文 ↔ 2025r07-q018 正答アの近似は §1-4 のとおり標準的定義の一般表現 (D-198) で写しではない | 記録のみ |
| L6 | LOW | `terms[3].points[1].text_jp` ↔ `terms[3].detail_jp` 第 2 文、`terms[0].points[0]` ↔ `one_jp` / `key_points_jp[0]`、`terms[1].points[0]` ↔ `fig.steps[0..2].caption_jp` | 考点が detail / one / 図の言い直し (D-203 §9)。UD の定義は detail・points[1]・points[2] の 3 箇所に近い文で出る。事実は引用題と一致 | 記録のみ |
| L7 | LOW | `terms[4].analogy_jp/zh/en`、`terms[5].analogy_jp/zh/en` | ピクトグラムの比喩 (空港の絵の標識) とインフォグラフィックの比喩 (1 枚の図の案内ポスター) は用語そのものの使用例で、別の場面のたとえではない (D-203 §6)。誤学習には至らない | 記録のみ |
| L8 | LOW | `terms[3].one_jp`・`points[0].text_jp` (+ zh / en) | 2022r04-q033 の「状態又は度合い」のうち「度合い」だけを述べ、2011h23a-q062 の「情報を受発信できる」を「情報を得られる」(受信側) とする。主張を引用題より狭めるが、「だけ」「〜に限る」等の排他の言い方はなく (状態や発信を否定していない)、どの誤答肢も支持せず、用語を答える題の判別には影響しない (q062 正答・2 題とも「度合い」を含む) | 記録のみ (任意: points[0] `同じように操作し情報を得られる度合いを表す。` → `同じように操作し情報をやり取りできる状態や度合いを表す。` / zh `都能同样地操作并获取信息的程度。` → `都能同样地操作并收发信息的状态或程度。` / en `can operate something and obtain information in the same way` → `can operate something and send and receive information in the same way`、`expresses the degree` → `expresses the state or degree`) |
| L9 | LOW | `terms[3].one_zh` ほか アクセシビリティの zh 本文全般 | `zh_terms.json` / `term_zh` は「无障碍设计（可访问性）」で、`technology-19-51-u01` の ユーザビリティ points[2] も「无障碍设计[[jp:アクセシビリティ]]」を主訳とするが、本単元は「可访问性」を主訳にし one_zh で「也称无障碍设计」と補う。同単元でバリアフリーを「无障碍化」とするための区別で、`[[jp:]]` が両単元をつなぐため誤読には至らない (validate B6 warn 0)。単元間の主訳がずれる | 記録のみ (上流の衝突は O2) |
| L10 | LOW | `terms[1].fig.steps[0].caption_jp/zh/en`、`terms[1].fig.data.nodes[0].label.zh` | step 1 の caption が 2 文 (D-195 §2 は各 step 1 文、a2 jp-review LOW)。zh ノードラベルは 1 つ目だけ「价值情景（Value Scenario）」で、2・3 つ目の「（行动）」「（操作）」と括弧注の形が揃わない (loc-review LOW) | 記録のみ |

**範囲外の観察**:
- O1 **merge の `warn zh-term terms[1](構造化シナリオ法).analogy_zh スイッチ → 交换机（Switch）` は偽陽性**: analogy_jp の「スイッチや棚をどこに付けるか」は家の照明・電源のスイッチで、zh「开关」が文脈上正しい。`zh_terms.json` の「交换机」はネットワーク機器 (L2 スイッチ等) の訳語で当てはまらない。「交换机」に直すと誤訳になるため変更しない (loc-review も同判断)。
- O2 **zh の「无障碍设计」の衝突 (上流)**: クイズ訳では 2022r04-q033 正答ア・2011h23a-q062 題文・2025r07-q018 題文がアクセシビリティを「无障碍设计（可访问性）」とする一方、本単元の challenge 2015h27a-q061 の誤答ア (バリアフリーデザイン) も「无障碍设计（Barrier-free Design）」と訳されている。本単元は 可访问性 を主訳にし、バリアフリーを「无障碍化」、UD を「通用设计」とし、q061 は UD の定義 (points[1]) で正しく解けるので単元内の誤りではないが、zh 学習者には同じ語が正答側と誤答側の両方に出る。`zh_terms.json` のアクセシビリティ訳語またはクイズ訳 q061 ア の見直しを上流課題として記録する。
- O3 UXデザイン の quiz 枠 2026r08-q058 は、正答の内容が直前の 構造化シナリオ法 の本文にある (UX の本文には出ない)。題文が UX デザインに触れるための配置で、単元内で解けるため問題なし。
- O4 アクセシビリティの比喩 (低い位置のボタン + 点字のエレベーター) は特定の利用者向けの設備の例で バリアフリー の例にも読めるが、one の「高齢者や障害のある人を含む多様な人が…等しく使える度合い」の実例として矛盾せず、points[2] の否定 (UD ≠ バリアフリー) とも衝突しない (比喩は UD ではなくアクセシビリティの度合いの例)。

確認済みで問題なし: a1 の MEDIUM 3 件 (UX 考点の qid 根拠 / シグニファイアの視覚への限定 / アクセシビリティの人数読み・UD との区別) は jp / zh / en の三語とも解消 (en の例示の印のみ L1)、a1 / a2 の他の LOW のうち goals・key_points 表記・hook の語源 (access + ability → accessible + -ity) も修正済み、限定条件 (考点 3 件の qid 付き exam 全て保持、L8 は狭め方向の記録のみ)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤80 字)、D-198 写し (validate 0、独立照合 遮蔽あり / なし 0 件、近似 9 窓は見出し語の偽陽性)、D-205 (規格名・構成要素数の記述なし)、`[[jp:]]` 原語 (15 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (6/6)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、隣接単元 (19-50-u01 / 19-51) との事実の整合。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **10** (建議修 4: L1〜L4 / 記録のみ 6: L5〜L10、うち L8 は任意の修正案あり) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 6 用語・考点 8 件 (qid 付き exam 3 件、引用 6 題) + quiz / challenge の 2026r08-q058 で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。a1 の MEDIUM 3 件は三語とも回帰なく解消。LOW 建議修 4 件 (L1〜L4) は補丁 (B3) で修正推奨、L5〜L10 はバッチ証拠の「未修 LOW」表へ。O1 (zh-term warn) は偽陽性で変更不要、O2 は上流 (zh_terms / クイズ訳) の課題として記録。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-19-50-u02
✓ technology-19-50-u02 unit: 0 issues (data/ip/textbook/units/technology-19-50-u02.json), 1 warning(s)
  warn  zh-term  terms[1](構造化シナリオ法).analogy_zh  スイッチ → 交换机（Switch） not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-19-50-u02
✓ technology-19-50-u02 parity: 28 locations, 0 diff
EXIT=0
```
