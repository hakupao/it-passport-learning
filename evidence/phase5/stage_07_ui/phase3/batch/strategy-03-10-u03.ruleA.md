# Rule A 全数抽検 — strategy-03-10-u03 (ブランド戦略とチャネル・プッシュプル戦略)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S148 b30)、repo HEAD `b250aaee` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b30-u03-a2` [種 = a1 `jp.r1` + jp-review #2] merge 結果、sha256 先頭 `f7ddd3389ef98043`)。
- **対象**: `data/ip/textbook/units/strategy-03-10-u03.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (ブランド戦略 / オピニオンリーダー / オムニチャネル / プッシュ戦略 / プル戦略 / ダイレクトマーケティング) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8、Rule A 共通指示の既知失敗型 (1)〜(10)。比較: `.planning/v2/strategy-03-10-u03/v1-original.json` (用語 6 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・既知失敗型 (8)(9)(10) / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (nodes・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題** (考点 10 件 = exam 6 + mix 4、引用 qid 延べ 7 = 異なり 6 題 [2011h23a-q008 / 2015h27a-q018 / 2012h24a-q026 ×2 / 2016h28h-q029 / 2019r01a-q015 / 2024r06-q001]): `questions.json` + `translations/<exam>.json` の stem_jp_clean で題文・選択肢・正答を再読 (全題 topic `strategy-03-10`)。topic 外の関連題 2021r03-q008 (アーリーアダプタ = オピニオンリーダ層) と 2014h26a-q038 (PM のプッシュ型コミュニケーション = 特定の人へ送信) も参照。
3. **quiz / challenge_questions**: quiz 7 枠 (異なり 6 題、本文引用と同じ) + challenge 5 題 (2012h24a-q026 / 2015h27a-q018 / 2019r01a-q015 / 2009h21a-q022 / 2013h25a-q009)。q022 (Place = 代理店経由から EC 直販へ) はダイレクトマーケティング one「流通業者を介さず」と整合。q009 (オプトインメール広告) は本単元の語ではないが v1 challenge からの継承 (v1 は q022・q009 を含む) で、ダイレクトマーケティング one「電子メールなどで個々の顧客に」と矛盾しない (O2)。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合として単元 JP 文字列 103 本 (派生・summary 除く、図ラベル・caption・pairs・overview 含む) を topic 内全 43 題の題文 + 選択肢と 12 字連続照合 (句読点・記号・空白除去): カタカナ 4 字以上・英数を □ 遮蔽 → **0 件**。**遮蔽なし** → 18 件、全て見出し語そのもの (ダイレクトマーケティング ×17 [2014h26h-q030 / 2019r01a-q015 の選択肢]、ワントゥワンマーケティング ×1、マーケティングオートメーションMA ×1) で偽陽性。**近似一致** (14 字窓・編集距離 ≤2) → 1 件 (`terms[5].points[2]` ↔ 2024r06-q001 = 見出し語「マーケティングオートメーショ」のみ) で偽陽性。a1 jp-review #2 が記録した 11 字一致「の営業活動を効率化する」は a2 で「の営業活動をソフトウェアで効率化する」となり分断済み。カタカナの多い文 (`terms[1].detail` / `points[1]` / `fig.nodes`、`terms[5].points[0..2]`) は目視: 2021r03-q008 / 2026r08-q015 の層名の列挙はイノベーター理論の標準名で、題の文の写しではない。
   - **(iii) 選択肢なぞり (D-208 / D-209)**: `terms[1].one_jp` は 2011h23a-q008 正答ウの要素順 (比較的早期 → 自らの価値判断 → 購入 → 後続の消費者層に影響) と同順で「早い時期に → 自分の判断で → 採用し → 後に続く消費者の購買に影響」と述べ、`terms[1].points[0]` は 2015h27a-q018 正答エ (販売初期に購入 → 情報を友人・知人に伝える) と同順で「普及の初期に手に入れ → 感想や情報を身近な人に広める」と述べる。どちらも分類型の題の正答内容を見出し語の一般定義として述べたもの (D-209 の免除)、語句は一致せず、誤答肢の打ち消し・選択肢の組の再現はない → L4 記録。`terms[3].points[0]`「流通業者の販売意欲や販売力を高める」は 2012h24a-q026 の誤答 3 肢 (販売員教育 / 応援販売 / 販売奨励金) の共通のねらいをまとめたが、語句・組・順序を再現せず、プッシュ戦略を正の定義で述べる (D-209) → L4 記録。`terms[5].points[1]` (2019r01a-q015) はダイレクト (誤答ウ) とインバウンド (正答イ) を両側正の定義で対比、題文の手段列挙 (SNS・ブログ・検索エンジン) を使わない → 写しでない。validate の `choice-echo` warn は出ていない。
5. **D-195**: 結論先行 (one = 1 文 × 6、太字あり)、展開 2 文 × 6、比喩・フック (§6: 語源 4 [brand / omni / push 通知 / direct]、日常感覚 1、ドア表示 1)、定義前使用 (ブランド価値 = ブランド戦略 one・detail、イノベーター / アーリーアダプター = detail、マルチチャネル = mix 考点内、ワントゥワン / インバウンド / MA = 各考点内で定義)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `freq_badge`「頻出」、`terms[1].hook_jp` の「結び付けて覚える」(+ 派生)、`terms[3].detail_jp`「説明を聞いてから選ぶ商品」(通常の用法) のみ。zh / en 相当語 (必须 / 考试 / must / exam / always / remember) は `kind = "exam"` と通常語のみで偽陽性。図種: オピニオンリーダー flow static 5 節点、プッシュ・プル・ダイレクト flow steps 3、オムニチャネル svg (v1 継承、O1)、ブランド戦略 図なし → 登録内。pair 配置 (プッシュ / プル はプル戦略の後、key 行 1)。
6. **D-200**: 考点数 1/2/1/1/2/3 (≤3 ✓)、各 JP 文数 1〜2・字数 45〜100 (validateV2 の数え方 = 記法除去・空白除く; ≤100 ✓、最大は `terms[5].points[2]` の 100 字 2 文 = 上限ちょうど、空白込み 102)。**framing 件数** (validateV2 `pointFraming` を tsx で全考点に適用): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士) → M1 (hook ↔ 引用題誤答)、L1 (hook ↔ 考点)、L3 (en 比喩内の食い違い) 以外は不整合 0。プッシュ / プル の排他の言い方 (`terms[4].points[1]`「流通業者に / 消費者に働きかける点で分かれ、実際には組み合わせることも多い」、goals[2]、pairs[0].rows[0]) は 2012h24a-q026 (プロモーション策の分類) の範囲で正しく、組み合わせの但し書きもあり、引用題が支持しない排他の分割は無い。オムニ / マルチ の対比 (`terms[2].points[0]`) は「複数持つだけで情報が分かれた状態」vs「在庫・顧客情報を統合」で標準定義どおり (topic 内に引用題なし)。書き方 8 → L7。書き方 9 (限定条件) → §2、MA の「など」→ L5。D-205: 改訂文書の構成要素数なし。D-210: 法令・規格の改正前文言の題なし。既知失敗型 (10): 法定・規格の閉じた列挙なし。
8. **三語**: zh・en が jp と同じ事実か、図ラベル・caption・比較行の三語一致、`[[jp:…]]` 原語 (ブランド戦略 / ブランド価値 / オピニオンリーダー / イノベーター理論 / イノベーター / アーリーアダプター / オムニチャネル / マルチチャネル / プッシュ戦略 / プル戦略 / ダイレクトマーケティング / ワントゥワンマーケティング / インバウンドマーケティング / マーケティングオートメーション) は全て jp 本文に実在。zh 訳語は `zh_terms.json` (品牌战略 / 意见领袖 / 全渠道 / 推动战略 / 拉动战略 / 直复营销 / 集客式营销（入站营销）) と一致。one_zh / one_en の見出し語併記 6/6。parity 0 diff。
9. **前回 attempt の解消確認** (`failures/.../strategy-03-10-u03_attempt_1.md`): ① a1 jp-review #1 MEDIUM `terms[5].points[2]` (MA の定義だけで見出し語に触れない) → a2 で 2 文目「ダイレクトマーケティングで行う顧客ごとの働きかけや反応の記録も自動化する」/ zh「它也会把直复营销中按顾客进行的接触和反应记录自动化。」/ en "It also automates the per-customer outreach and response logging done in direct marketing." が入り、三語とも解消。② a1 jp-review #2 MEDIUM `terms[1].analogy` (「一番乗りした友人」= イノベーター像) → a2 は「新しく出た調理器具について、料理好きで知られる友人が使ってみた感想を聞いてから周りが買うか決める」/ zh・en 同旨で、「最初」「一番乗り」の像は三語とも無く解消、detail・mix 考点 (イノベーター → アーリーアダプター) と食い違わない。a1 の low (酒屋の比喩、brand hook「もともと焼き印」) も a2 で通信販売の比喩・「焼き印という意味もあり」に直り、zh / en に退行なし。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | ブランド戦略 | OK — 考点 mix 1 (qid なし): ブランド = 印だけでなく顧客の信頼・評判を含めた価値。one (名前・ロゴ・品質の評判で見分けてもらい、繰り返し選ばれる価値を育てる) は topic 外 2019h31h-q021 正答イ (企業名から品質イメージを連想させ競争優位) と整合。detail「値下げだけに頼らない競争」は正しい | OK (図なし = 定義型) | en analogy → L3 | L3 / L7 |
| 2 | オピニオンリーダー | OK — exam 1 / 2 題 + mix 1: 普及初期に入手し感想・情報を身近な人に広め後続の判断を左右 (2011h23a-q008 正答ウ / 2015h27a-q018 正答エ; 限定条件「自らの価値判断で」は one の「自分の判断で」で保持、q018 の「販売初期の段階で」は「普及の初期に」で保持)。誤答 (q008 ア 多くの人の利用を確認してから / イ 早期購入者に相談して追随 / エ 冒険的に率先 = イノベーター; q018 ア 普及後に伝える / イ 友人の評価を参考にする / ウ 先駆けて入手に意欲 = イノベーター) を本文は支持しない — ただし **hook が q008 イ・q018 イ の像を運ぶ (M1)**。mix: イノベーター = 最初の少数、オピニオンリーダー = アーリーアダプター (topic 外 2021r03-q008 正答ア と一致)。flow 5 層は標準順 | OK (L4 記録) | OK | **M1** / L4 / L7 / L8 |
| 3 | オムニチャネル | OK — 考点 mix 1 (qid なし): マルチチャネル (複数あるだけで情報が分かれる) との違い = 在庫・顧客情報の統合で体験をつなぐ。one・detail (ネット注文 → 店舗受取 など) は標準定義どおり | OK (svg 図 = O1) | OK | L2 |
| 4 | プッシュ戦略 | OK — exam 1 / 1 題: 施策は流通業者の販売意欲・販売力を高めるねらい (2012h24a-q026 = プル戦略の題、誤答ア・イ・ウ がプッシュ施策; 正答エ 広告宣伝をプッシュとはしない)。detail (棚の交渉・販促物、知名度の低い商品や説明の要る商品で効果) は一般的な説明で正しい。flow steps (メーカー → 流通業者 → 店頭で勧める → 購入) は one と一致 | OK (L4 記録) | OK | L1 / L11 |
| 5 | プル戦略 | OK — exam 1 / 1 題 + mix 1: 代表的施策 = 消費者向け広告で関心を高め来店を促す (2012h24a-q026 正答エ; 限定条件「メーカの販売促進策のうち」は one「メーカーが広告などで」で保持) / mix: 働きかけ先で分かれ、組み合わせも多い。flow steps (広告 → 名指しで求める → 店が仕入れ増 → 注文がさかのぼる) は detail と一致 | OK | OK | L7 / L10 |
| 6 | ダイレクトマーケティング | OK — exam 3 / 3 題: ワントゥワンの定義 (2016h28h-q029 正答エ) + その実現手段としてよく使われる / 企業側から働きかける vs インバウンド = 情報発信で見込み客に見つけてもらう (2019r01a-q015 正答イ、ダイレクト = 誤答ウ を正答とする記述なし) / MA = 見込み客の発掘から育成・商談化までの営業活動を効率化 (2024r06-q001 正答エ; 誤答ア BI・イ POS・ウ RPA を支持しない) + 顧客ごとの働きかけと反応記録も自動化。後半の関係文は引用題の支持外だが一般知識として正しい (L6) | OK (100 字ちょうど) | zh 营销活动 → L5 | L5 / L6 / L7 |

**単元レベル**: goals 4 点・overview_cols 2 (種類 / 主に向き合う相手)・overview_rows 6 行・pairs 1 組 (プッシュ / プル 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge 5 題 (§1-3)。pairs[0] の 3 行は両用語の one・考点と一致。事実誤りなし、三語一致。overview_rows[0].extra[1]「顧客の認識」は列名「主に向き合う相手」と軸がずれる → L9。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 11 (うち 建議修 3)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** (既知失敗型 (9): フックを引用題の場面に当てると誤答肢を選ぶ) | `terms[1](オピニオンリーダー).hook_jp` / `hook_zh` / `hook_en` (+ 派生 `memory_hook_jp/zh/en`, `summary.memory_hooks_jp/zh/en[1]`) | フックが結び付ける感覚「売り場の宣伝より身近な人の意見のほうが信じられる」は、意見を**受け取って頼る側**の態度で、オピニオンリーダー自身 (意見を出す側) を描いていない。これを 2015h27a-q018 (オピニオンリーダの購入態度を選ぶ) に当てると誤答イ (購入を決めるとき友人の評価や世間の評判を参考にする) に一致し、2011h23a-q008 の誤答イ (早期購入者に相談してから追随購入する層) にも寄る。本文 one / points は正しいが、記憶の手がかりだけが誤答肢の人物像を指す | jp「オピニオン (opinion) は「意見」。売り場の宣伝より身近な人の意見のほうが信じられる、という日常の感覚と結び付けて覚える。」→「オピニオン (opinion) は「意見」。売り場の宣伝より信じられる「身近な人の意見」を、早い時期に自分で試して周りに発信する側の人、と結び付けて覚える。」/ zh「opinion 是“意见”的意思。和“比起卖场的宣传，更相信身边人的意见”这种日常感受联系起来记。」→「opinion 是“意见”的意思。记成：人们比起卖场宣传更相信的那份“身边人的意见”，正是由较早亲自试用并向周围传播的这个人发出的。」/ en "Opinion means a view someone holds. Tie it to the everyday feeling that a friend's view is more believable than a store's advertising." → "Opinion means a view someone holds. A friend's view is more believable than a store's advertising, and the opinion leader is the one who tries the product early and gives that view to others." |
| L1 | LOW **建議修** (型 (9) の弱い形、`terms[4].points[0]` が打ち消すため LOW) | `terms[3](プッシュ戦略).hook_jp/zh/en` (+ 派生) | フック「プッシュ通知が利用者から求めなくても届くように、売り手の側から送り込む」の像は、売り手が**最終利用者 (消費者) へ**直接届ける場面で、プッシュ戦略の相手 (流通業者) と食い違う。2012h24a-q026 に当てると、消費者向け広告 (正答エ = プル) も「求めなくても届く」ためプッシュに見える。PM の「プッシュ型コミュニケーション」(2014h26a-q038) とも混同しやすい。修正案は §6 の言い直し・analogy (舟を押す) 寄りだが、型 (9) の像を消す方を優先 (再指摘不要) | jp「スマートフォンのプッシュ通知が利用者から求めなくても届くように、売り手の側から商品を送り込む向き。」→「push は「押す」。メーカーが卸売業者や小売店を後ろから押し、押された店が客に勧める。押す相手は消費者ではなく流通業者である。」/ zh「就像智能手机的推送通知不用用户请求也会送达一样，这是由卖方主动把商品送出去的方向。」→「push 就是“推”。厂商从后面推动批发商和零售店，被推动的店铺再向顾客推荐。被推的对象是流通业者，而不是消费者。」/ en "Just as a phone's push notification arrives without the user asking for it, this is the direction in which the seller sends the product out." → "Push means to shove from behind: the manufacturer pushes wholesalers and retailers, and those stores then recommend the product to shoppers. What gets pushed is the distributor, not the consumer." |
| L2 | LOW **建議修** (D-204 比喩の範囲) | `terms[2](オムニチャネル).analogy_jp/zh/en` | 「どの支店の窓口でも前回の続き」は同じ種類の接点 (店舗窓口) 同士の情報共有で、one の「実店舗・EC・アプリなど**すべての接点**」をまたぐ像になっていない。マルチチャネルとの対比 (`points[0]`) の核心 (異なるチャネル間の統合) を比喩が示さない。誤答には至らない | jp「どの支店の窓口に行っても、前回の相談の続きから話を聞いてもらえる銀行のようなもの。」→「窓口で始めた相談の続きを、その夜にアプリやネットからでも続けられる銀行のようなもの。」/ zh「就像一家银行，无论去哪个分行的窗口，工作人员都能接着上次的咨询继续谈。」→「就像一家银行，在分行窗口开始的咨询，当天晚上也能在应用程序或网上接着办。」/ en "It is like a bank where any branch counter can pick up your conversation exactly where the last visit left off." → "It is like a bank where a consultation you began at a branch counter can be continued that evening in the app or online." |
| L3 | LOW **建議修** (三語、en のみ) | `terms[0](ブランド戦略).analogy_en` | jp「これまでの信頼が積み重なっている」に対し en "built up over past visits" は、初めて訪れた町という設定と食い違う (その店に来たことがあるように読める; loc-review low と同旨) | en "because that sign carries the trust built up over past visits." → "because that sign carries the trust it has built up over time." |
| L4 | LOW | `terms[1].one_jp`・`terms[1].points[0].text_jp`、`terms[3].points[0].text_jp` | (iii) の境界: §1-4 のとおり正答の要素順と同順 (q008 ウ「比較的早期 → 自らの価値判断 → 購入 → 後続に影響」/ q018 エ「販売初期に購入 → 友人・知人に伝える」)、q026 の誤答 3 肢の共通のねらいの要約。語句一致なし、D-209 の分類型免除 | 記録のみ |
| L5 | LOW | `terms[5].points[2].text_jp/zh` | 正答エ「見込み顧客の抽出, 獲得, 育成**など**の営業活動」を「発掘から育成、商談化までの営業活動」と範囲で言い換え (「など」は落ちるが「から…まで」の範囲で閉じ方は標準の MA 範囲と一致、誤答を支持しない)。「ソフトウェアで」「自動化」は誤答ウ (RPA) と語を共有するが、判別点「見込み客・営業活動」が残る。zh「营销活动」は jp 営業活動 / en sales work とずれる (loc-review low) | 記録のみ |
| L6 | LOW | `terms[5].points[0]` 後半・`points[2]` 2 文目 | 見出し語との関係文 (ワントゥワンの実現手段 / MA が DM の記録も自動化) は引用題の支持外 (一般知識として正しい; a2 jp-review low) | 記録のみ |
| L7 | LOW (書き方 8 / §9) | `terms[4].detail`・`fig.steps[2]`・`key_points[3]`・`pairs[0].rows[2]`; `terms[5].detail`・`fig.steps[2]`・`key_points[4]`; `terms[0].points[0]`・`detail`・`key_points[0]`; `terms[1].detail`・`points[1]`・`fig` | 同じ因果・対比の言い直し (プルの注文がさかのぼる ×4、DM の反応記録 ×3、ブランド価値 ×3、イノベーター / アーリーアダプター ×3)。プッシュ / プル の働きかけ先対比は pairs + mix 考点の 2 箇所で上限内 | 記録のみ |
| L8 | LOW | `terms[1].fig.data.nodes[2..4]` | アーリーマジョリティ / レイトマジョリティ / ラガードは未定義 (図の目的 = オピニオンリーダーの位置は読める) | 記録のみ |
| L9 | LOW | `overview_rows[0].extra_jp/zh/en[1]` | 列「主に向き合う相手」に「顧客の認識」(相手でない) | 記録のみ |
| L10 | LOW | `terms[4].one_jp`・`terms[5].one_jp` | プルの「消費者に直接働きかけて」と DM の「個々の顧客に直接働きかけ」が同じ「直接」で、マス広告 vs 個別の違いがぼやける (矛盾ではない) | 記録のみ |
| L11 | LOW (zh 文体) | `terms[3]`・`terms[4]` の zh 各所、`terms[3].fig.data.nodes[1].label.zh`・`terms[5].fig.data.nodes[0].label.zh` | 「流通业者」「施加作用」「店头」の直訳調、zh ラベルの中黒「・」(loc-review low) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① プッシュ = 流通業者 / プル = 消費者: `pairs[0].rows[0..2]`、`terms[4].points[1]` (mix)、goals[2]・overview_rows[3..4] (予告・総表の構造) → 許容。② イノベーター / アーリーアダプター: `terms[1].detail`、`points[1]`、fig → L7。③ オムニ / マルチ: `terms[2].points[0]` のみ → 許容。④ ダイレクト / インバウンド: `terms[5].points[1]` のみ → 許容。

**範囲外の観察**:
- O1 `terms[2].fig` は kind `svg` (v1 継承 `figures/strategy-03-10-u03-t01.svg`、mermaid 由来、ラベル 実店舗 / ECサイト / アプリ / SNS / 統合された顧客体験 が jp のみ)。validate は svg を扱い 0 issues、内容は one と一致。zh / en 画面で jp ラベルのままになる点は v1 図の共通事情として記録。
- O2 challenge 2009h21a-q022 / 2013h25a-q009 は v1 challenge から継承、本文と矛盾なし。本単元の語を直接問う 2011h23a-q008 / 2016h28h-q029 / 2024r06-q001 は inline_quiz にある。

確認済みで問題なし: 限定条件 (考点 6 件の exam 全て保持、§2)、§9 禁止句 (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (≤3 個・≤2 文・≤100 字)、copy (validate 0、独立照合は見出し語の偽陽性のみ)、`[[jp:]]` 原語、zh 訳語表、図種、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、前回 MEDIUM 2 件の三語解消。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **11** (建議修 3: L1 / L2 / L3、記録のみ 8: L4〜L11) |

## 5. 判定

**FAIL** (D-199: MEDIUM 1)。全 6 用語・考点 10 件・引用 6 題 + challenge 未引用 2 題で、考点の主張は正答と一致し、限定条件の落ち・写しは無い。M1 (オピニオンリーダー hook が引用 2 題の誤答イの人物像を運ぶ) は `hook_jp/zh/en` の 1 欄置換で直り、L1〜L3 も同時に補丁推奨。補丁 (B3) 適用 + 範囲限定の再審 (validate / parity 再実行、置換後の hook が q018 正答エ側 [初期に入手して伝える] を指すことの確認) で PASS に戻せる見込み。L4〜L11 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-03-10-u03
✓ strategy-03-10-u03 unit: 0 issues (data/ip/textbook/units/strategy-03-10-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-03-10-u03
✓ strategy-03-10-u03 parity: 30 locations, 0 diff
EXIT=0
```
