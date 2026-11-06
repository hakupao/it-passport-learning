# Rule A 全数抽検 — technology-13-35-u07 (生成モデルと大規模言語モデル)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (S148 続、b42)、repo HEAD `434fe80f` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b42-u07-a1` merge 結果、sha256 先頭 `c072b135d2d8f00d`)。
- **対象**: `data/ip/textbook/units/technology-13-35-u07.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (GAN / 敵対的生成ネットワーク / LLM / 大規模言語モデル / プロンプトエンジニアリング) + 単元レベル (goals / overview_rows / pairs / key_points / summary / overview / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210 / D-211、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/technology-13-35-u07/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 6 件 = exam 2 + mix 4、引用 qid 2 題)**: `questions.json` + translations の `stem_jp_clean` を再読 (両題 topic `technology-13-35`)。
   - `terms[2].points[0]` ↔ 2025r07-q080 (広範なデータで訓練し、ファインチューニング等で多用途に適応できるもの = 正答ウ 基盤モデル; 誤答 = アノテーション・エキスパートシステム・CNN)。考点「LLM は基盤モデルのうち言語を扱う代表例」は正答と一致、誤答肢を支持しない。題の「など」(適応手段はファインチューニングに限らない) は考点「追加の学習で多くの用途に転用できる」では明示されないが、「だけ」と閉じておらず範囲を狭めない (L5 記録)。
   - `terms[4].points[0]` ↔ 2026r08-q098 (プロンプトエンジニアリング = 意図した回答のために質問・指示の内容等を工夫 = 正答ウ; 誤答 = 帰納的な知識獲得・入力待ちを画面に示す記号・神経回路を模した計算モデル)。考点は標準定義の一般表現で正答と一致。正答肢の列挙 (内容・情報の提供・出力形式の指定) の組を再現せず順序も変えており、**D-211 (ii)** (正誤選択型で正解肢が一般原則 → 列挙を落とした一般表現は (b) に当たらない) に該当、写しではない (JP review L も同判断)。
   - mix 4 件 (識別器は生成器を鍛える部品 / 「敵対的」は競い合う学習 / 「大規模」はデータ量・パラメータ数 / ファインチューニングはパラメータを変えるがプロンプトはモデルを変えない) はいずれも技術的に正しい。`terms[1].points[0]` は他単元 technology-23-61-u12 の **敵対的サンプル** (攻撃のための入力) との関係で主語の範囲が広い → L1。
3. **技術的正確さ (依頼の観点)**: GAN = 生成器 (乱数から偽データ) vs 識別器 (本物と見比べて判定) が競い、双方が学び直す — one / detail / fig 3 段 / analogy (贋作画家と鑑定士) / pairs[0].rows[0] とも正しく整合。LLM = 大量の文章で学び次の語を確率で予測する言語モデルを大規模化、事前学習 → ファインチューニング、基盤モデルの一種 — 正しく、u06 (事前学習・ファインチューニングの one) と一致。「次の語」は厳密にはトークン単位だが IT パスポートの水準で許容 (L6 記録)。プロンプトエンジニアリング = 指示文 (プロンプト) を工夫してモデルに手を加えず出力を引き出す、試行の反復 — 範囲は正しく、ファインチューニングとの境界 (`points[1]`) も正しい。
4. **速く変わる事実 (D-205)**: 具体的な製品名・モデル名・パラメータ数・学習データ量の数値・年次の主張は 0 件 (grep: GPT / ChatGPT / Claude / Gemini / 億 / 兆 / 年 → 該当なし)。「規模を大きくしたことで回答・要約・翻訳など幅広い作業をこなせる」は一般的性質で版表記不要。改訂文書の構成要素の列挙もなし。
5. **ハルシネーションとの重なり (strategy-05-14-u09)**: 本単元にハルシネーションの記述はなく重複なし。u09 の detail「次に続きそうな語を確率で選んで文を作る」は本単元 LLM の detail・fig と同じ説明で矛盾なし。生成AI・深層学習・事前学習・ファインチューニングは前提単元 u06 等で既出 (本単元でも detail で括弧注)。
6. **D-198 写し**: validate copy guard = 0。独立照合: 単元 JP 文字列 83 本 (派生除く) を topic 全 35 題の題文 (`stem_jp_clean` + raw) + 選択肢と 12 字連続照合 (句読点・記号・空白除去)。カタカナ 4 字以上・英数遮蔽版 = **0 件**。遮蔽なし版 = 7 件、全て見出し語「プロンプトエンジニアリン(グ)」の連なり (2026r08-q098 題文) で偽陽性。1〜2 字置換の近似一致 = 48 件、全て見出し語 (プロンプトエンジニアリング / ファインチューニング) を含む窓で偽陽性。カタカナの多い文 (`terms[4].detail_jp`、`terms[2].detail_jp`) を目視 — 引用題の語句・組の流用なし。`terms[2].detail_jp` の基盤モデル定義は 2025r07-q080 題文と同じ論理順 (大量データで学習 → 追加学習で用途へ) だが、定義そのものの順で語句は別 (幅広い分野 / 追加の学習 / 土台)、D-209 の見出し語定義の免除に当たる。validate の `warn choice-echo` 出力なし。
7. **D-195**: one = 1 文 × 5 (太字あり)、detail 2〜3 文、比喩 (GAN・LLM・PE の 3 つ、名称用語 2 つは空) は別場面のたとえ、hook は頭字語・語順・L サイズ・語源で別の手がかり。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `非常に` 2 件 (`terms[2].detail_jp`「非常に大きな規模」、`terms[3].detail_jp`「非常に多い」) のみ、程度の副詞の通常用法で定型強調ではない (L7 記録)。図: flow steps ×3 (GAN 3 段 / LLM 3 段 / PE 3 段)、名称用語 2 つは図なし — 全て登録内。pair 1 組 (GAN / LLM、3 行、key 1)。
8. **D-200**: 考点数 1/1/1/1/2 (≤3 ✓)、各 JP 1〜2 文・49〜70 字 (≤100 ✓)。**framing** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0。
9. **D-202 / D-203 単元全体**: 書き方 7 (欄同士) — 不整合 0 (PE の「モデルに手を加えない」と LLM detail のファインチューニング、「大規模」の定義と terms[3].detail が一致)。書き方 8 — 略称 ↔ 正式名称の対応が overview_rows[1][3]・pairs[0].rows[2]・名称用語 one・key_points[3] に出る (JP review L 記録済み、L8)。書き方 9 — §2 に記載、落ち 0。
10. **三語**: zh・en が jp と同事実、図ラベル・caption・pairs 行の三語一致、`[[jp:]]` 原語 9 種 (識別器 / 敵対的生成ネットワーク / 敵対的 / 基盤モデル / 事前学習 / 大規模言語モデル / 大規模 / プロンプトエンジニアリング / ファインチューニング) 全て jp 本文に実在、one_zh / one_en の見出し語併記 (GAN・LLM は term_zh 括弧で、他 3 つは `[[jp:]]`)、zh 訳語は unit 表 (生成式 AI / 微调 / 提示工程 / 大语言模型 / 生成对抗网络) に一致。loc review の LOW 4 件のうち 2 件 (hook_zh「敌对的」/ detail_zh「条目」) は未修 → L3 / L2。
11. **前回指摘の解消**: journal `journal.b42-u07-a1.jsonl` の JP review (PASS, LOW 4) / loc review (PASS, LOW 4) — HIGH / MEDIUM なし、退行なし。未修 LOW は本書 L2・L3・L8・O1 に引継ぎ。
12. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | GAN | OK — 引用題なし (mix 1)。生成器 / 識別器の役割・競争・反復学習・目的 = 生成、全て正しい。fig 3 段は detail と一致 | OK | OK | なし |
| 2 | 敵対的生成ネットワーク | OK — mix 1。名称の語順 hook (英 Generative 先 / 日「敵対的」先) 正しい | OK | hook_zh の訳ぶれ L3 | L1 / L3 |
| 3 | LLM | OK — exam 1 / 1 題: 2025r07-q080 正答ウ 基盤モデル。限定条件「など」は閉じていない (L5)。detail の言語モデル・事前学習・ファインチューニング・基盤モデルは u06 と一致。fig (確率付け → 1 語選ぶ → 反復) 正しい | OK (写しなし、D-209 免除) | OK | L5 / L6 / L7 |
| 4 | 大規模言語モデル | OK — mix 1 (「大規模」= データ量・パラメータ数、言語数ではない) 正しい | OK | detail_zh「大规模」の見え方 (loc L、記録) | L4 / L7 |
| 5 | プロンプトエンジニアリング | OK — exam 1 / 1 題: 2026r08-q098 正答ウ (D-211 (ii) で写しでない)。mix: ファインチューニングとの区別正しい | OK | detail_zh「条目」L2 | L2 / L9 |

**単元レベル**: goals 3・overview_rows 5 行・pairs 1 組・key_points 4・summary (記法除去版と一致)・challenge 4 題 (2025r07-q080 / 2026r08-q098 + 2018h30h-q075 / 2013h25a-q076)。後 2 題は文字コードのビット数の題で本単元と無関係 (O1)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 4)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1].points[0].text_jp/zh/en` | 主語が裸の「敵対的」で「外部からの攻撃…とは関係がない」と言い切る。GAN の名称の中では正しいが、technology-23-61-u12 の **敵対的サンプル** (AI を誤認させる攻撃用の入力) では「敵対的」が攻撃側を指すため、範囲を名称に限定しておく (過去問の誤答誘導は現状なし) | jp「「敵対的」は 2 つのネットワークが競い合う学習のしかたを指す。外部からの攻撃や不正アクセスとは関係がない。」→「この名称の「敵対的」は、GAN の中の 2 つのネットワークが競い合う学習のしかたを指す。外部からの攻撃や不正アクセスを表す語ではない。」/ zh「“对抗”（[[jp:敵対的]]）指的是两个网络相互竞争的学习方式，与外部攻击或非法访问无关。」→「这个名称中的“对抗”（[[jp:敵対的]]）指的是 GAN 内部两个网络相互竞争的学习方式，并不是表示外部攻击或非法访问的词。」/ en `"Adversarial" ([[jp:敵対的]]) refers to a learning method in which two networks compete. It has nothing to do with outside attacks or unauthorized access.` → `In this name, "adversarial" ([[jp:敵対的]]) refers to the way the two networks inside a GAN learn by competing. It does not mean outside attacks or unauthorized access.` |
| L2 | LOW **建議修** | `terms[4].detail_jp` / `detail_zh` | jp「形でと決める」助詞が重なる (JP review L 未修)、zh「条目的形式」不自然 (loc review L 未修) | jp「答えを表や箇条書きの形でと決める」→「答えを表や箇条書きの形で出すよう指定する」/ zh「指定用表格或条目的形式作答」→「指定用表格或分条列表的形式作答」/ en 変更なし |
| L3 | LOW **建議修** | `terms[1].hook_zh` | 「敵対的」を hook_zh だけ「敌对的」と訳し、detail_zh / points[0] / term_zh の「对抗」とぶれる (loc review L 未修) | zh「日语译名则是“敌对的”（[[jp:敵対的]]）在前」→「日语译名则是“对抗”（[[jp:敵対的]]，字面意为“敌对的”）在前」 |
| L9 | LOW **建議修** | `terms[4].hook_jp/zh/en` | 「きっかけの言葉を渡す」は向き (誰が誰に) が無く、2026r08-q098 の誤答イ (入力待ちを画面に記号で示す = 機械が人にきっかけを示す) にも当てはめうる (観点 (9) の手前、one / detail が明確なので誤答誘導には至らない) | jp「同じ語で、きっかけの言葉を渡すという意味を持つ。」→「同じ語で、ここでは人が AI に、書き出すきっかけの言葉を渡すという意味を持つ。」/ zh「同源，意思是递上一句引出下文的话。」→「同源，在这里指人向 AI 递上一句引出下文的话。」/ en "and it carries the sense of handing over a cue." → "and here it means a person handing the AI a cue to start writing." |
| L4 | LOW | `terms[3].detail_zh` | zh 訳名「大语言模型」に「大规模」の字面が無いまま「“大规模”指…」と分解する (loc review L) | 記録のみ (大规模语言模型は zh でも通用の展開形で誤解なし) |
| L5 | LOW | `terms[2].points[0].text_jp/zh/en` | 2025r07-q080 の「ファインチューニングなど」の「など」(適応手段の開放) を明示しない。範囲は閉じていない | 記録のみ |
| L6 | LOW | `terms[2].detail_*`、`terms[2].fig`、`terms[3].hook_*` | 「次の語」(厳密にはトークン)、「新しさは「大規模」の側にある」(Transformer 等の仕組みの進歩を捨象) は単純化。IT パスポート水準で誤りではない | 記録のみ |
| L7 | LOW | `terms[2].detail_jp`、`terms[3].detail_jp` | §9 grep の「非常に」2 件。程度の副詞の通常用法 | 記録のみ |
| L8 | LOW | `key_points_jp/zh/en[3]` | 略称 ↔ 正式名称の対応の再掲 (JP review L、D-203 §9 / 書き方 8) | 記録のみ (名称用語 2 つを含む単元で要点に 1 行置くのは許容) |

**範囲外の観察**:
- O1 `challenge_questions[2..3]` (2018h30h-q075 / 2013h25a-q076) と `source_figures[0..1]` (販売管理 DB / サンプリング表) は本単元と無関係。v1 由来 (challenge は v1 の 5 題から継承) で、確認題下限 3 を満たすため (JP review 記録済み)。
- O2 独立 copy 照合の遮蔽なし 7 件・近似 48 件は全て見出し語の連なりの偽陽性 (§1-6)。

確認済みで問題なし: 技術的正確さ (GAN / LLM / PE、§1-3)、D-205 (製品・規模の数値なし)、ハルシネーション重複なし・u09 と整合、D-211 (ii) 該当 (q098)、限定条件 (exam 2 件保持)、framing 0/0/0、D-197 (validate 0)、D-200、`[[jp:]]` 原語 9 種実在、zh 訳語表一致、図種登録内、派生フィールド一致、用語の v1 不変量、前回 review の退行なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 4: L1 / L2 / L3 / L9、記録のみ 5: L4〜L8) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 6 件 (qid 付き 2 件)・引用 2 題 + challenge 2 題で、考点の主張は正答と一致し、誤答肢を支持する記述・限定条件の落ち・写しは無い。LOW 建議修 4 件は補丁 (B3) で修正推奨。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-35-u07
✓ technology-13-35-u07 unit: 0 issues (data/ip/textbook/units/technology-13-35-u07.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-35-u07
✓ technology-13-35-u07 parity: 26 locations, 0 diff
EXIT=0
```
