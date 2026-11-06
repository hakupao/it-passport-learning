# Rule A 全数抽検 — strategy-05-14-u07 (AIの種類と基本能力)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (S148〜149 b34)、repo HEAD `387e7a33` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b34-u07-a2` (種付き: seed = a1 jp.r1 + review #2) merge 結果、sha256 先頭 `c20e7d8caa128e5c`)。
- **対象**: `data/ip/textbook/units/strategy-05-14-u07.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (特化型AI / 汎用AI / AIによる認識 / AIによる自動化 / AIアシスタント / 生成AI) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。用語・`term_zh`・`term_en` は v1 と一致。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210 / D-211、テンプレ既知型 (1)〜(10)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one / detail / analogy / hook / points / fig / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールドは `[[jp:X]]` → 括弧内 X の展開で本体と対応。
2. **考点 × 引用題**: 考点 全 11 件 (exam 8 + mix 3)、qid 付き 9 件、引用 qid 異なり 8 題 (2026r08-q027 ×2) + quiz のみ 1 題 (2019h31h-q023)。`questions.json` の題文 (stem_jp_clean 優先)・選択肢・`correct_answer` を再読し 1 件ずつ照合 (§2)。
3. **quiz / challenge**: quiz 計 11 枠 (重複込み)、challenge 4 題 (2026r08-q027 / 2024r06-q078 / 2024r06-q028 / 2025r07-q028、全て本文で引用済み)。2019h31h-q023 (将棋ソフトの能力向上の中核 = AI) は 特化型 detail「ある課題で人間を上回る性能を出しても」と整合。
4. **D-198 写し**: validate copy guard 0、`warn choice-echo` 0 行。独立照合: 単元 JP 文字列 107 本 (派生除く) × topic 内全 39 題 (題文 stem_jp_clean + 生 stem_jp + 選択肢) の 12 字連続一致 → **カタカナ遮蔽あり 0 / 遮蔽なし 0**。近似 (12 字窓、編集距離 ≤3、4-gram 候補絞り) → 17 窓:
   - ed 2 (0.17): `terms[1].points[0].text_jp`「…な課題について判断できる」↔ 2026r08-q027 題文の前提部 (強いAIの定義、「に対して」→「について」の置換)。較正 HIGH (ed 0.14 / Dice 0.52) より遠く、題が与える強いAIの定義 = 標準的な定義表現で D-198 上は写しでないが、前提文に近くかつ one の言い直し → **L1 建議修**。
   - ed 3 (0.25): `terms[0].points[0]`「…て考えているわけではない」↔ q027 正解イ (D-211 (ii): 正誤選択型の正解肢 = 弱いAIの一般原則を順序を入れ替えて一般表現で述べたもの、写しでない)、`terms[5].one_jp` / `pairs[1].rows[0].b_jp`「新しいコンテンツを作り出」↔ 2025r07-q028 正解エ (生成AIの標準定義語)、`terms[4].detail_jp`「スマートスピーカー」↔ 2023r05-q014 / 2024r06-q078 (製品名) → 全て偽陽性。
   - カタカナの多い文 (AIアシスタント detail、生成AI detail・fig) を目視 → 題の場面の流用なし。
5. **D-208 (iii) / D-209 / D-211**: 各考点で、誤答肢・判断項目の組・順序・場面の再現を確認 (§2)。前回 attempt の 4 件の (iii)/範囲指摘は §3 末尾で解消を確認。
6. **D-195**: 結論先行 (one 各 1 文、太字あり)、detail 各 2 文、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → 「問われ」1 (`terms[0].points[0]`「問われた内容の意味」= 題意の通常用法)、「とされる」(`terms[1].detail_jp`「研究の目標とされる段階」+ 派生) のみ、定型締め句 0。図種: 認識 = table static、自動化 = flow steps 3、生成AI = flow static (全て登録内)、他 3 語は図なし。pair 配置: 特化型/汎用 は汎用の後、認識/生成AI は生成AIの後、各組 key 行あり。
7. **D-200**: 考点数 2/1/2/2/1/3 (≤3)、JP 文数 1〜2、字数 39〜70 (≤100、最大 `terms[3].points[1]` 70 字)。framing (validate) 0。
8. **D-205 / 生成AI**: 生成AIの出力の誤りは「混じることがあり」「混じりうる」と可能性で限定、ハルシネーションは現象の定義として述べ常時とは言わない。改訂文書の構成数・名称の列挙なし。D-210 該当の改正前題なし。
9. **三語**: zh・en の事実一致、`[[jp:]]` 原語 14 種が jp 本文に全て実在 (スクリプト)、one_zh / one_en 6/6 に見出し語 `[[jp:]]`、zh 訳語 (特化型 AI（狭义 AI）/ 通用 AI（强 AI）/ AI 识别 / AI 自动化 / AI 助手 / 生成式 AI / 自动驾驶 / 幻觉 / 智能音箱 / 聊天机器人 / RPA) が `zh_terms.json` に一致。
10. **機械ゲート**: §6。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 特化型AI | OK — exam: 弱いAIは決められた課題の判断結果を出すが、意味を人のように理解して考えてはいない (2026r08-q027 正答イ; 誤答 ア 人間と同等の知能・ウ 人より賢く自ら判断力を高める・エ 自律的に柔軟に判断 = いずれも支持せず)。正誤選択型で正解肢の一般原則を順序を入れ替えて述べた形 = D-211 (ii)、写しでない。mix:「弱い」= 課題の幅の狭さで性能の低さではない (q027 題文の分類基準と一致)。detail「人間を上回っても学習していない課題へ自分で広げられない」は誤答ウ (自ら判断力を高める) を否定する側で、特化型の正の定義。「いま実用化されているAIはこの型」は IT パスポート水準の通説 | OK | en「a specific task / a set task」単数 (L3) | L2 (analogy) / L3 / L6 |
| 2 | 汎用AI | OK — exam: 強いAI = 汎用AIの別名、分野を限らず様々な課題で判断することを目指す (q027 題文の前提定義と一致)。detail「まだ実現しておらず、研究の目標」は overview_rows[1]「実現した例はまだない」・pairs[0].rows[3]・key_points[0] と一致 (a1 #1 の範囲ずれ解消) | 近似 ed 0.17 + §9 言い直し → L1 | OK | L1 |
| 3 | AIによる認識 | OK — exam: 音声認識 = 話し声 → 書き起こした文字データ (2024r06-q078 正答ア = (1); 分類型の正解を見出し語の定義として述べ、(2)〜(4) の項目・順序・「段階」の枠組みを持ち込まない = D-209 免除内) / exam: 自然言語処理 = 意味の解析、文字認識 = 画像から文字の形を読む (2023r05-q014 正答ア = a・b・c; d は文字認識処理の場面。両側を正の定義で述べた対比で、駐車場・ナンバープレート等の場面・a〜d の組は再現しない = D-209)。detail「翻訳や対話に使われる」は a・c と整合。table (画像/音声/文字認識 × 入力・出力) は one・detail と一致 | OK | OK | L5 (hook) / L7 |
| 4 | AIによる自動化 | OK — exam: 周囲を認識しシステムが運転を担う自動運転 = AI 自動化の代表例 (2019r01a-q022 正答ア; 分類型、選択肢の語句の再現なし) / mix: 基本的な RPA は人が決めた手順の再現、AI 自動化は認識・判断を AI が担う (2024r06-q028 正答ア = a・c; b の定型 PC 操作ツールを両側正の定義の対比で区別、「基本的な」の限定あり、場面・組の再現なし)。flow 3 段 (認識 → 判断 → 実行) は one と一致、外観検査の例は自作 | OK | caption_en 直訳 (L8) | L7 |
| 5 | AIアシスタント | OK — exam: 自然言語処理を中核に利用者の意図に合わせて応答を組み立てる AI の応用 (2020r02o-q032 正答ア AI; 分類型で見出し語の定義として述べ、題文の要素 [過去のチャットの学習 → 会話の流れ → 回答の推測] を同順でなぞらない = a1 #1 指摘解消)。「中核」は題の支持外の一般事実 (誤答 AR / CRM / ERP を支持せず)。「発話」は音声を連想させ、引用題は文字チャット → L4 | OK | OK | L4 |
| 6 | 生成AI | OK — exam: 出力は事前学習のデータ傾向を土台に自然言語のプロンプトに沿って組み立てる (2025r07-q028 正答エ; 誤答ア「学習不要」・イ 予測モデル・ウ RPA を支持せず。正誤選択型の正解肢の一般原則を順序を変えて述べた形 = D-211 (ii)) / exam: もっともらしいが事実と異なる出力 = ハルシネーション (2025r07-q010 正答エ) / mix: 認識 = 既存データの識別、生成 = 新しい内容。detail「事実と違う内容が本当らしく混じることがあり、人が確かめてから使う」は D-205 の限定付き | OK | OK | L7 |

**単元レベル**: goals 3・overview_cols 2 (区分 / 身近な例)・overview_rows 6・pairs 2 組 (特化型/汎用 4 行 key 1、認識/生成AI 3 行 key 1)・key_points 5・summary (派生、一致)・challenge 4。key_points[3]「複数のAIの能力を組み合わせ」は AIアシスタント detail (音声認識との組合せ) と整合。強いAI/弱いAI ↔ 汎用/特化型 の対応は全欄 (one・points・overview・pairs[0].rows[0]) で一貫し、q027 の題文の分類と一致 (別名として教え、別物として教えない = 既知型 (3) 該当なし)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 8 (うち 建議修 3: L1・L2・L4)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1].points[0].text_jp/zh/en` | 「…さまざまな課題について判断できることを目指す」が 2026r08-q027 題文の前提部 (強いAIの定義) と 12 字窓 ed 2 (「に対して」→「について」)。標準定義表現で写しではないが前提文に近く、one_jp の言い直し (§9、jp-review #1・#2 とも low) | jp「分野を限らずさまざまな課題について判断できることを目指すAIを指す。」→「扱う課題の分野を限らず、人のように幅広く判断することを目指すAIを指す。」/ zh「指以不限领域、能对各种问题进行判断为目标的 AI。」→「指以不限问题领域、像人一样广泛进行判断为目标的 AI。」/ en "meaning AI that aims to make judgments on a wide variety of tasks in any field." → "meaning AI that aims to judge broadly, as a person does, without limiting the field of tasks." |
| L2 | LOW **建議修** | `terms[0].analogy_jp/zh/en` | 「一つの料理だけ」/「一道菜」/ "a single dish" の像が、a1 #2 で考点から外した「課題を一つに限る」読みを比喩側で残す (q027 は「特定の課題」で数を限らない)。one・考点は否定していないので rule-7 には至らない | jp「一つの料理だけを極めた専門店の料理人のようなもの。看板の一品は一流でも、ほかの料理は作れない。」→「寿司だけを極めた専門店の職人のようなもの。寿司なら一流でも、ほかの料理は作れない。」/ zh「就像只钻研一道菜的专门店厨师。招牌菜做得一流，别的菜却做不了。」→「就像只钻研寿司的专门店师傅。寿司做得一流，别的菜却做不了。」/ en "It is like a chef at a specialty restaurant who has perfected a single dish. The signature dish is first-rate, but the chef cannot cook anything else." → "It is like a chef at a sushi restaurant who has mastered sushi alone. The sushi is first-rate, but the chef cannot cook anything else." |
| L3 | LOW | `terms[0].one_en` / `overview_rows[0].one_line_en` / `pairs[0].rows[1].a_en` / `terms[0].points[0].text_en` | en「a specific task / a set task」は単数だが英語の総称用法 (narrow AI の通常の定義文) で、hook_en・mix 考点 en は "range of tasks" と複数 | 記録のみ |
| L4 | LOW **建議修** | `terms[4].points[0].text_jp/zh/en` | 「発話」/「话语」/ "what the user said" が音声入力に寄って読め、one (文字で尋ねる場合を含む) と引用題 2020r02o-q032 (文字チャット) より狭く見える (jp-review #1・#2 low) | jp「利用者の発話の意図に合わせて」→「利用者の問いかけの意図に合わせて」/ zh「按照用户话语的意图组织应答」→「按照用户提问的意图组织应答」/ en "around the intent of what the user said" → "around the intent of the user's request" |
| L5 | LOW | `terms[2].hook_jp` (+ zh / en は別の手がかり) | 「認」の訓を示すだけで識別の働きと結ばない (§6 弱い手がかり、jp-review #2 low)。zh・en は各語独自の手がかりで事実に問題なし | 記録のみ |
| L6 | LOW | `terms[0].detail_zh/en` | jp「この型に当たる」に zh「都」・en "all" が付く (loc-review low)。key_points[0] と矛盾なし | 記録のみ |
| L7 | LOW | `terms[2].points[0]`・`terms[3].points[0]`・`terms[5].points[0]`・`terms[5].points[2]`・`key_points_jp[0]` | §9 / 書き方 8 の反復: 音声認識 = 表の行・detail の言い直し、自動運転 = detail 2 文目と重複、生成AI exam = one+detail のまとめ直し、認識/生成 対比は pairs[1].rows[0] と mix 考点の 2 箇所 (上限内)、特化型/汎用 の現状対比が detail・pairs・goals・key_points に出る | 記録のみ |
| L8 | LOW | `terms[2].fig.data.rows[0].cells[2].zh` / `rows[2].cells[1].zh`、`terms[3].fig.steps[2].caption_en`、`overview_rows[4].one_line_en` | loc-review low 3 件が未反映 (「拍」の直訳、"without human hands"、「代わりに」の欠落)。意味の誤りなし | 記録のみ (任意: "without human hands" → "without human intervention") |

**前回 attempt (`failures/.../strategy-05-14-u07_attempt_1.md`) の 4 件の解消確認 (三語)**:
1. 汎用AI「多くはこの型ではない」→ detail jp「現時点ではまだ実現しておらず」/ zh「目前它尚未实现」/ en "It has not been achieved yet" — overview_rows[1]・pairs[0].rows[3] と一致。**解消**。
2. 弱いAI「一つに絞られる」→ 考点 jp「決められた課題」/ zh「既定任务」/ en "a set task"、one「特定の課題」。考点も弱いAIの性質 (意味の理解なしに判断結果) を述べる形に変更。**解消** (比喩の残像は L2、en 単数は L3)。
3. チャットボット考点の題文なぞり → 題の要素 (過去チャット学習・会話の流れ・回答推測) を含まず見出し語の定義に変更、三語同じ。**解消**。
4. 音声認識考点の判断項目なぞり → (1) 相当のみを正の定義で述べ、(2) の相手側・「別の段階」なし、三語同じ。**解消**。
jp-review a2 #1 medium (`terms[2].points[1]`: 文字認識を画像認識の下位に置く) → 現行は「画像から文字の形を読み取ってテキストにする文字認識」で表・detail の並列 3 種と一致。**解消**、退行なし。

**範囲外の観察**:
- O1 `terms[4].points[0]` (NLP 中核・応答を組み立てる) と `terms[4].detail_jp` (音声認識と組み合わせる) を合わせると 2024r06-q078 の処理手順に近い流れになるが、別用語・別 qid の一般的な説明で項目の語句・順序を再現しない。むしろ q078 の (1) を選ぶ手がかりになる。
- O2 「いま実用化されているAIは特化型」に対し、幅広い出力をする生成AIも特化型かという初学者の疑問は残りうる (jp-review #2 low)。IT パスポート水準の通説で事実誤りではない。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **8** (建議修 3: L1・L2・L4 / 記録のみ 5: L3・L5〜L8) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 6 用語・考点 11 件 (qid 付き 9)・引用 8 題 + quiz のみ 1 題で、考点は正答と一致し誤答肢を支持せず、限定条件落ち・D-198 写し・(iii) なぞりなし。前回 attempt の 4 件と a2 #1 medium は三語とも解消。建議修 L1・L2・L4 は B3 補丁を推奨。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-14-u07
✓ strategy-05-14-u07 unit: 0 issues (data/ip/textbook/units/strategy-05-14-u07.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-05-14-u07
✓ strategy-05-14-u07 parity: 27 locations, 0 diff
EXIT=0
```
