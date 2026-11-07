# Rule A 全数抽検 — strategy-05-16-u02 (EC の取引プラットフォームとサービス)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (b55)、repo HEAD `1f4b6d5c` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b55-u02-a1` merge 結果、sha256 先頭 `75c02a3d955b54d5`)。
- **対象**: `data/ip/textbook/units/strategy-05-16-u02.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (電子オークション / eマーケットプレイス / オンラインモール / エスクローサービス / インターネットトレーディング / クラウドソーシング / クラウドファンディング) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 (one_zh / one_en の `[[jp:]]` 見出し語、書き方 7〜9)、D-203 (観点 8 対比反復・§6 比喩が定義の言い換え・§9 言い直し = low、観点 7 = medium [事実誤りなら high]、観点 9 限定条件落ち = high)、D-204 (比喩・hook の像や結論が考点・detail の否定する内容を運ぶ / 他欄と矛盾 = 観点 7 medium)、D-205 / D-210 (改訂される文書の構成要素の数・名前に版または「例えば」、改正前の題には版を明記)、D-208 / D-209 (既知の見落とし型 (1)〜(10))、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `data/ip/textbook/.planning/v2/strategy-05-16-u02/v1-original.json` (用語 7 語・`term_zh`・`term_en`・`title_*`・`unit_summary_*` とも v1 / manifest `v1_terms` と一致、スクリプトで差分 0)。過去の審査: `journal.b55-u02-a1.jsonl` の result 行 (jp-review r1 PASS = low 7、loc-review r1 PASS = low 8; HIGH / MEDIUM の前歴なし)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (node label・step caption・tree label) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_* / overview.intro_*`) が本体の記法除去版 (`**` 除去、`[[jp:X]]` → X) であることをスクリプトで確認 (78 箇所、不一致 0)。
2. **考点 × 引用題 (考点 全 9 件 = exam 7 + mix 2、qid 付き 7 件、引用 qid 7 題 = 異なり 7 題)**: `data/ip/quiz/questions.json` から各題の題文 (`translations/<exam>.json` の `stem_jp_clean`)・選択肢・`correct_answer` を再読 (全題 topic `strategy-05-16`)。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化・限定をしていないこと、題の限定条件 (など・主に・低減できる 等) を外していないことを 1 件ずつ確認 (§2)。topic 外も含め見出し語 (オークション / モール / 商店街 / エスクロー / トレード / クラウドファンディング 等) が出る全 25 題を走査し、本文と食い違う正答なし (例: 2013h25h-q017 BtoE の誤答 ア = オークション C to C・ウ = 部品調達 B to B、2017h29a-q005 SNS の誤答 ウ = 仲介で安全性向上 [エスクロー相当] はいずれも本文と整合)。
3. **quiz / challenge_questions** (quiz 計 8 枠 + challenge 5 題、うち本文で未引用 2 題): 2010h22h-q027 (オンラインモールの quiz; 正答 ウ = 販売数の少ない商品も売り続けられる = ロングテール) はロングテールを前提単元 `strategy-05-16-u01` が教えており (u01 `ロングテール` one) mix で解ける。オンラインモールは誤答 イ (複数の仮想商店のサイト + 出店料) の側に出るだけで、本単元 detail「出店料などを受け取る」はその誤答肢と同じ内容だが、見出し語自身の正の定義であり (D-209)、ロングテールの説明だとは一言も言わない → 観察 O1。2011h23a-q021 (challenge; 正答 イ = 一般消費者向けの通販サイト = B to C; 誤答 ア 消費者出品のオークション・ウ 企業間取引・エ 社内販売) はオンラインモール points[0] (B to C)・電子オークション points[0] (C to C)・eマーケットプレイス detail (B to B) で解ける。challenge の他 4 題は本文で引用済み。
4. **D-198 写し**: validate の copy guard = 0 件 (`warn  choice-echo` 行の出力なし)。独立照合として単元の JP 文字列 107 本 (派生フィールド除く) を topic 内全 29 題の題文 (clean) + 選択肢と 12 字連続照合 (句読点・記号・空白除去):
   - カタカナ 4 字以上と英数を □ に遮蔽 (遮蔽後の実字 6 未満の窓は除外) → **0 件**。
   - 遮蔽なし → **4 件、全て偽陽性**: `terms[5].points[0]` / `terms[6].one_jp` / `key_points_jp[3]` ↔ 2022r04-q012 題文、`terms[6].points[0]` ↔ 2017h29a-q022 題文。一致部はいずれも見出し語 + 助詞 1 字 (「クラウドファンディングは」「…の」) で、表現ではない。
   - 近似一致 (1〜2 字置換の検出; 単元文字列 × 各題文・選択肢の同長窓の最小編集距離比と bigram Dice): 最小 ed 0.40 (`terms[6].fig.data.root.label.jp` ↔ 2017h29a-q022 題文、Dice 0.43) で、校正値 (HIGH 例 ed 0.14 / Dice 0.52) より十分遠い。Dice の最大は **0.63** (`terms[6].fig.data.root.label.jp`「クラウドファンディング (見返りの形で分ける)」↔ 2022r04-q012 の選択肢 4 つ「〇〇型クラウドファンディング」) だが、共有部は見出し語「クラウドファンディング」そのものだけで (ed 0.60)、Dice の高さは短い文字列が同じ長い見出し語を含むことによる。写しではない。
   - 引用題の正答の言い換え: エスクロー points[0] は 2017h29a-q004 題文と同じ要素 (商品と代金 / 信用できる第三者 / 安全) を同じ順に並べるが、ed 0.81 で文言は別、エスクローの標準定義そのもの (D-198「標準的な定義の一般表現は写しではない」) → §9 言い直しとして L8。エスクロー points[1] は 2026r08-q028 正答 イ の言い換え (払った・届かない) で文言一致なし (ed 0.74 対題文)。インターネットトレーディング points[0] は 2015h27a-q017 正答 イ の言い換え (個人・株式・売買) で、題の「オンライントレードシステム」の語形は使わない。
   - (iii) 選択肢の組の流用: `terms[6].fig` の tree 4 区分と `key_points_jp[3]` の列挙は 2022r04-q012 の選択肢 4 つと同じ組 → L7 (§3 に順序の比較を引用)。電子オークション (C to C)・オンラインモール (B to C)・インターネットトレーディング (B to C)・eマーケットプレイス (B to B) の分類は 2015h27a-q017 / 2011h23a-q021 の選択肢の場面と対応するが、各用語の欄に分散した見出し語ごとの正の定義で、1 つの考点が組や順序を再現していない (D-209 の分類題の例外) → 指摘なし。誤答肢の場面を再現して否定する考点は 0。
   - カタカナの多い文 (overview_rows・pairs・各 one / hook) を目視: 題文・選択肢の言い回しの借用なし。比喩 (美術品の競売・卸売市場・ショッピングセンター・立会人・自宅の窓口・手を挙げた人・募金箱) はいずれも引用題に無い場面。
5. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 2 文 × 7、比喩・フックが定義の言い換えでないこと (例外は L9)、定義前使用 (入札・落札 = 電子オークション one の太字、電子市場 / 仮想商店街 = 各 one、電子商店街 = モール hook の別名、第三者 = エスクロー one、株式・金融商品 = トレーディング one、不特定多数 = クラウドソーシング one、寄付型・投資型 = 考点内で定義、C to C / B to C / B to B = 前提単元 u01; mix 考点 `terms[5].points[0]` のクラウドファンディングは考点内で「不特定多数から資金を募るしくみ」と定義してから対比)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → **JP 0 件**。zh・en 相当語 [必须 / 考试 / 重要 / must / exam / always / important / remember] の 3 ヒットは「example」内の exam で偽陽性)、図の型 (電子オークション・エスクロー = flow steps 3 / 4、クラウドファンディング = tree static、他 4 語 = 図なし; `types.ts` の登録 6 種 svg / table / compare / flow / tree / network の内)、pair 配置 (eマーケットプレイス→オンラインモールはオンラインモールの後、クラウドソーシング→クラウドファンディングはクラウドファンディングの後、各組 key 行 1)。
6. **D-200**: 考点数 1/0/2/2/1/1/2 (≤3 ✓; eマーケットプレイスは 0 → O2)、各 JP 1 文・字数 49〜71 (≤100 ✓、最大は `terms[5].points[0]` の 71 字)。**framing 件数** (`validateV2.ts` の `pointFraming`、全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 / D-204 単元全体点検**: 書き方 7 (欄同士の「〜だけ」「〜ではない」「主に」の照合) → **M1** (募金箱の比喩 vs 図・detail・考点 2)、L1 (エスクロー detail「避けられる」vs 考点・引用題の程度)。書き方 8 (対比の出現欄を列挙) → L10。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → L9。§9 言い直し → L8。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・caption・比較行の三語一致、`[[jp:…]]` 原語 20 種 (電子オークション / 入札 / 落札 / eマーケットプレイス / 電子市場 / オンラインモール / 仮想商店街 / 電子商店街 / エスクローサービス / 第三者 / インターネットトレーディング / 株式 / 金融商品 / クラウドソーシング / 不特定多数 / クラウドファンディング / 資金 / 寄付型 / 配当 / 投資型) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 7 用語に見出し語の `[[jp:]]` あり (D-202)、zh 訳語が `zh_terms.json` に従うこと (7 見出し語一致: 电子拍卖 / e市场（e-marketplace） / 在线商城 / 第三方托管服务（escrow） / 网络交易（在线证券交易） / 众包（crowdsourcing） / 众筹（crowdfunding）; validate の B6 warn 0 / jp-origin warn 0)。loc-review r1 の low 8 件はその後の改稿ラウンドが無く本文に未反映のため、自分で再判定した (L2・L3・L5・L6・L7 に取り込み、残りは L11)。
9. **法令・版 (D-205 / D-210、単元固有の指示)**: 本文に 資金決済法・特定商取引法・金融商品取引法 その他の法令名は一切出ない (「法」の grep ヒットはエスクロー hook の「古法语」のみ) → e-Gov の現行法照合は対象なし。引用題 7 題にも法令改正に依存する題は無い (D-210 対象なし)。クラウドファンディングの 4 区分は版を持つ文書の構成要素ではなく一般的な分類で、`key_points_*[3]` は「など」、detail は「いくつかの型」と開いている (D-205 対象外、型 (10) の閉じた列挙にも当たらない — 引用題 2022r04-q012 自身が同じ 4 区分 +「など」)。
10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 電子オークション | OK — exam 1 / 1 題: 個人が出した品物を個人が落札する取引は C to C の代表例 (2012h24h-q023 正答エ CtoC; 題は「オークションサイトでの取引など」と例示、考点も「代表例」で閉じない)。one「最高額の人が落札」・flow steps 3 (出品→競り上げ→締切時の最高額が落札) は一般の競り上げ式で、2017h29a-q004 の誤答 ウ 逆オークションを支持しない。detail「出品者も購入者も個人であることが多く」は限定「多く」を保持 | OK | OK | L9 (analogy) |
| 2 | eマーケットプレイス | 考点 0 (O2)。one「多数の売り手企業と買い手企業が 1 つの電子市場に集まる」、detail「主に企業間取引 (B to B)」は 2015h27a-q017 誤答 ア (企業間の電子調達 = B to B) / 2013h25h-q017 誤答 ウ (部品調達) と整合。quiz 2012h24h-q023 は C to C の題で本用語は選択肢に出ない (jp-review low、O1) | OK | OK | L9 (hook 後半) |
| 3 | オンラインモール | OK — exam 1 / 1 題 + mix 1: 消費者が電子商店街の出店企業から買う取引は B to C (2012h24a-q017 正答イ BtoC; 題の「個人向けの…電子商店街」と一致) / mix: eマーケットプレイス = 主に企業どうし、オンラインモール = 消費者向け (「主に」保持)。別名 仮想商店街 / 電子商店街 はシラバスの同一概念の別名として 1 用語の中で扱い、別物として教えていない (型 (3) なし) | OK | OK | L10 (対比) |
| 4 | エスクローサービス | OK — exam 2 / 2 題: 当事者以外の信用できる第三者が代金を預かって仲立ちし受け渡しを安全にする (2017h29a-q004 正答イ エスクロー; 誤答 アフィリエイト・逆オークション・SNS を支持しない) / 払ったのに届かない受け渡しの不履行が防ぎやすくなる (2026r08-q028 正答イ; 題の「低減できる」に対し jp「防ぎやすくなる」・「といった」で例示 → 限定保持。誤答 ア 誤入力の取消・ウ パスワード漏えい・エ 自己都合解約 を支持しない)。flow steps 4 (買い手→第三者へ支払 / 売り手発送 / 受取連絡 / 第三者→売り手) は one と一致 | OK | zh points[1] の程度 L2 | L1 / L2 / L8 |
| 5 | インターネットトレーディング | OK — exam 1 / 1 題: 個人投資家が証券会社のサイトで株を売買するのは B to C の例 (2015h27a-q017 正答イ; 誤答 ア 企業間電子調達 [B to B]・ウ 社内サービス [B to E]・エ 消費者同士のオークション [C to C] は本文の他用語の分類と整合)。detail「オンライントレードとも呼ばれる」は題の表記と同じ別名 | OK | zh / en の別名が見出し語訳と区別できない L6 | L4 (hook) / L6 / L9 (analogy) |
| 6 | クラウドソーシング | mix 1: 集めるもの = 仕事の担い手 / 資金 で クラウドファンディングと分かれる — 正しい (引用題なし; 2017h29a-q022 の誤答 ア 仮想記憶領域・ウ 天候の補償 は cloud との混同を誘うが、hook「雲の cloud ではなく群衆の crowd」は正しい方向に働く) | OK | zh pairs[1].rows[2].a_zh L5 | なし (L5 は訳) |
| 7 | クラウドファンディング | OK — exam 2 / 2 題: 見返りを求めない寄付を不特定多数からネットで集めるのも CF の一つで寄付型 (2017h29a-q022 正答イ; 題は「インターネットなどを通じて」だが考点は「…も CF の一つ」で範囲を閉じず、one の「ネットで公開し」も CF の標準定義 → 型 (2) の範囲を閉じる落ちには当たらない、O5) / 事業の利益を配当として分けるのは投資型 (2022r04-q012 正答エ; 題の A 社・匿名組合契約は使わない)。tree 4 区分 (購入 = 商品・サービス、寄付 = なし、投資 = 利益の分配、貸付 = 利息) は正しい。ただし analogy の「募金箱」は寄付型だけの像 → M1 | OK (tree の組は L7) | en tree label L3 | **M1** / L3 / L7 |

**単元レベル**: goals 3 点・overview_cols 2 (主な参加者 / やり取りするもの)・overview_rows 7 行・pairs 2 組 (eマーケットプレイス / オンラインモール 3 行 key 1、クラウドソーシング / クラウドファンディング 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 5 件 (2012h24a-q017 / 2011h23a-q021 / 2017h29a-q004 / 2015h27a-q017 / 2022r04-q012 — 本文と矛盾なし、§1-3)。`pairs[0].rows[0]` の a_jp「企業どうし (B to B)」/ b_jp「出店企業と消費者 (B to C)」は行ラベル「主な取引の相手」が「主な」を担うため、jp-review が挙げた「B to B だけと読める」low は解消していると判断 (指摘なし)。事実誤りなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 11 (うち 建議修 6)** + 範囲外観察 6

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 (B3 補丁、同一欄内の文字列置換) |
|---|---|---|---|---|
| M1 | **MEDIUM** (観点 7 / D-204、既知型 (4)) | `terms[6].analogy_jp` / `analogy_zh` / `analogy_en` | 比喩の像が「募金箱」= お金を出しても何も返らない寄付だけの姿。同じ用語の `detail_jp` 2 文目「資金を出した人に何を返すかによって、いくつかの型に分けられる」、`fig` の `children[0]` (購入型: 商品やサービスで返す)・`children[2]` (投資型: 事業の利益を分配する)・`children[3]` (貸付型: 利息を付けて返す)、`points[1]` (配当を分ける投資型) はいずれも「見返りがある型」を述べ、比喩の像 (見返りなし) はそれらと食い違う (D-204「他欄と矛盾」)。`points[0]` が寄付型を CF の一種と正しく教えるので「寄付型だけを描いた不足」とも言えるが、比喩は用語全体の像として読まれ、図の 4 区分のうち 3 つが否定する内容を運ぶため medium とする。型 (9) の当てはめ: 2022r04-q012 は題文に「配当金を支払う」と判別点があり、この像だけで誤答 イ 寄付型を選ぶとは言いにくい (型 (9) の medium 理由にはしない)。2017h29a-q022 (正答 = 寄付) では正答の方向に働く。 | jp: 「「この企画を実現したい」という呼びかけに、賛同した大勢が少しずつお金を出し合う募金箱のようなもの。」→「「この企画を実現したい」という呼びかけに、賛同した大勢が少しずつお金を出し合い、一人では出せない額を集めるようなもの。」/ zh: 「就像一个募捐箱：有人发出“想实现这个企划”的号召，许多赞同者各自出一点钱。」→「就像有人发出“想实现这个企划”的号召，许多赞同者各自出一点钱，凑出一个人拿不出的数额。」/ en: "Like a collection box for a call to “make this idea happen”, where many supporters each chip in a little." → "Like a call to “make this idea happen”, where many supporters each chip in a little to reach a sum no one could put up alone." |
| L1 | LOW **建議修** (観点 7 の程度) | `terms[3].detail_jp` / `detail_zh` / `detail_en` 2 文目 | 「どちらか一方だけが損をする事態を避けられる」と言い切るが、同用語 `points[1]` は「防ぎやすくなる」、引用題 2026r08-q028 は「低減できる」。損の範囲が「損をする事態」と広いため、言い切りのままだと誤入力の取消 (誤答 ア)・自己都合解約 (誤答 エ) まで防げるとも読める余地がある (前文の文脈で受け渡しの不履行に限られるので medium には至らない) | jp: 「どちらか一方だけが損をする事態を避けられる。」→「どちらか一方だけが損をする事態を避けやすくなる。」/ zh: 「就能避免只有某一方吃亏的情况。」→「就更容易避免只有某一方吃亏的情况。」/ en: "keeps either side from being the only one to lose out." → "makes it less likely that either side is the only one to lose out." |
| L2 | LOW **建議修** (訳: 程度の付加、loc-review low 未反映) | `terms[3].points[1].text_zh` | jp「防ぎやすくなる危険」(引用題「低減できる」) を zh「能够有效防范的风险」と強めている。en "helps prevent" は原文どおり | zh: 「能够有效防范的风险」→「更容易防范的风险」 |
| L3 | LOW **建議修** (訳: 語の選び、loc-review low 未反映) | `terms[6].fig.data.root.children[0].label.en` | 購入型を "repaid in goods or services" とし、貸付型 "repaid with interest" と同じ repaid (返済) で、購入型 = 返済と読める。2022r04-q012 の判別点 (配当 → 投資型) には効かないので型 (6) の medium には当たらない | en: "Purchase type: repaid in goods or services" → "Purchase type: rewarded with goods or services" |
| L4 | LOW **建議修** (§6、jp-review low 未反映) | `terms[4].hook_jp` / `hook_zh` / `hook_en` (+ 派生 `memory_hook_*`, `summary.memory_hooks_*[4]`) | 「trading は売り買いを繰り返すこと」は語義として不正確 (trade の基本義は売買・取引)。後半「名前の手がかり」は語そのものから金融商品は読めず定義の言い換えに近い (記録のみ)。zh「经营的对象」は営業・経営を思わせる (loc-review low) | jp: 「trading は「売り買いを繰り返すこと」。」→「trading は「売り買い・取引」の意味。」/ zh: 「trading 意为“反复买进卖出”。」→「trading 意为“买卖、交易”。」、同欄「经营的对象是金融商品」→「交易的对象是金融商品」/ en: "Trading means buying and selling again and again." → "Trading means buying and selling." |
| L5 | LOW **建議修** (訳: 直訳調・意味ずれ、loc-review low 未反映) | `pairs[1].rows[2].a_zh` | 「小额」は金額の小ささで、jp「小口発注」(仕事を小分けにする) と意味がずれ、語順も不自然 | zh: 「小额发包标志设计或翻译」→「把 logo 设计、翻译等工作拆成小单发包」 |
| L6 | LOW **建議修** (訳: 試験の表記、loc-review low 未反映) | `terms[4].detail_zh` / `detail_en` 2 文目 | jp「オンライントレードとも呼ばれる」は 2015h27a-q017 正答の表記と同じ別名だが、zh「也被称为在线交易」・en "also called online trading" は見出し語訳 (网络交易 / Internet trading) とほぼ同語で、別名を挙げる意味が無く原語も示さない | zh: 「也被称为在线交易。」→「也被称为“在线交易”（online trade）[[jp:オンライントレード]]。」/ en: "and it is also called online trading." → "and it is also called online trading ([[jp:オンライントレード]])." |
| L7 | LOW (D-198 (iii) 判定、jp-review low と同判断) | `terms[6].fig.data.root.children[0..3]`、`key_points_jp/zh/en[3]` | 4 区分の組が 2022r04-q012 の選択肢 4 つと同じ。順序の比較: 図・要点 = 購入型 → 寄付型 → 投資型 → 貸付型 / 題文の前提 = 貸付型 → 寄付型 → 購入型 → 投資型 / 選択肢 = ア 貸付型 → イ 寄付型 → ウ 購入型 → エ 投資型。組は同じだが順序は題と違い、各区分を見返りの形の正の定義で説明し、題文自身が前提知識として同じ分類を「など」付きで示している (CF の標準分類)。考点は投資型 1 区分のみを述べ、組を再現していない → 写しではなく記録 | 記録のみ |
| L8 | LOW (§9 言い直し) | `terms[3].points[0].text_jp/zh/en` | one_jp と key_points_jp[1] の言い直しで新しい事実を加えない (jp-review low)。2017h29a-q004 題文と同じ要素順だが文言は別 (ed 0.81) で標準定義 | 記録のみ (削ると qid 2017h29a-q004 の結び付き先が消える) |
| L9 | LOW (§6 比喩・hook が定義の言い換え) | `terms[0].analogy_*` (美術品の競売をネットで)、`terms[4].analogy_*` (自宅の画面から注文できる窓口)、`terms[1].hook_*` 後半 (1 社の店ではなく多くの会社が集まる場) | 用語自身の言い換えに近く、別の場面の手がかりになっていない。誤学習には至らない。`terms[4].analogy_en` は jp の「売買の注文を出せる」が抜けている (loc-review low) | 記録のみ (任意: `terms[4].analogy_en` "Like a service window you reach from a screen at home instead of walking to a securities firm's counter." → "Like a service window on your screen at home where you can place buy and sell orders, instead of walking to a securities firm's counter.") |
| L10 | LOW (書き方 8) | `pairs[0].rows[1]` ↔ `terms[1].detail_*` / `terms[2].detail_*` | 運営者の役割 (集めて引き合わせる / 出店の場と集客・決済の仕組み) が pairs 行と両用語の detail にほぼ同文で出る。B to B / B to C の対比は下記の出現欄 | 記録のみ |
| L11 | LOW (訳、loc-review low 未反映分の残り) | `pairs[0].rows[2].b_en` "Mail-order sales of daily goods and books"、`pairs[0].rows[1].b_en` "customer and payment systems"、`goals_en[0]` "online marketplaces" (+ 派生 `overview.intro_en`)、zh「不特定多数的人」の反復 | Mail-order はカタログ通販を思わせる / 集客が伝わりにくい / 場の総称が見出し語 e-Marketplace と同じ語に見える / 日本語の言い方を写した印象。いずれも事実や判別には効かない | 記録のみ (任意: "Mail-order sales of daily goods and books" → "Online sales of daily goods and books"; "Gives stores a place to open plus customer and payment systems" → "Gives stores a place to open plus systems for attracting customers and taking payment"; `goals_en[0]` "Tell apart online marketplaces by" → "Tell apart online trading venues by") |

**対比の出現欄 (書き方 8 の列挙)**: ① eマーケットプレイス = 主に B to B / オンラインモール = B to C: `pairs[0].rows[0]` (key)、mix 考点 `terms[2].points[1]` (2 箇所)、他は各用語の片側だけの記述 (`terms[1].detail` の「主に企業間取引」、`terms[2].one` の「消費者向け」、overview_rows の extra) で対比の繰り返しではない → 許容。運営者の役割は L10。② クラウドソーシング = 仕事の担い手 / クラウドファンディング = 資金: `pairs[1].rows[0]` (key)、mix 考点 `terms[5].points[0]` (2 箇所)、`goals_*[2]` は観点の予告、各 one は片側だけ → 許容。③ 取引の場 4 語の B to C / C to C の分類: 各用語の考点に分散 (各 1 側) → 許容。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 quiz の適合 (jp-review low): `terms[1].quiz` 2012h24h-q023 は C to C を答える題で eマーケットプレイスは選択肢にも出ない。`terms[2].quiz` 2010h22h-q027 はロングテールの題 (前提単元 u01 で既習) で、オンラインモールは誤答 イ の側にのみ出る。detail の「出店料などを受け取る」は誤答 イ と同じ内容だが見出し語の正の定義 (D-209) で、写しでも誤答の支持でもない。quiz の差し替えは本補丁の範囲外 (候補選定の段)。
- O2 `terms[1].points` が空 (考点 0)。validate は許容。eマーケットプレイスの判別点は mix 考点 `terms[2].points[1]` と `pairs[0]` が担っており、本文から欠けてはいない。
- O3 派生 zh で見出し語と原語が続けて書かれる (`definition_zh`「电子拍卖電子オークション…」、`memory_hook_zh` / `summary.memory_hooks_zh[2]`「电子商业街電子商店街」)。`[[jp:]]` → 原語の機械派生で全単元共通の仕様 (参照単元も同様)、本単元固有の誤りではない。
- O4 challenge 5 題のうち 3 題 (2017h29a-q004 / 2015h27a-q017 / 2022r04-q012) が用語内 quiz と重なる (jp-review low)。規則違反ではない。
- O5 2017h29a-q022 の正答は「インターネットなどを通じて」、考点 `terms[6].points[0]` は「ネットで」。考点は「…も CF の一つ」で範囲を閉じず、CF をネット経由と定義するのは標準定義 (one_jp) で、ネット以外の CF を問う題も無い → 型 (2) の「など」落ちには当たらない。同様に tree の投資型「事業の利益を分配する」は株式型 (株式を受け取る) を細かく分けないが、IT パスポートの水準と引用題 (配当) に合う。
- O6 `terms[2].hook_*`「mall はもともと並木の遊歩道」は、厳密には球技 pall-mall の打球路 (London の The Mall) → 並木の遊歩道 → 商店街の順で、「もともと」はやや粗い。誤学習には至らない。

確認済みで問題なし: 限定条件 (qid 付き考点 7 件全て保持、§2)、§9 禁止句 grep (JP 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤71 字)、D-198 写し (validate 0、遮蔽あり 12 字 0、遮蔽なし 4 件と近似最上位は見出し語のみの偽陽性、§1-4)、誤答肢の場面の再現 0、法令・版 (法令言及なし、D-205 / D-210 対象なし、§1-9)、`[[jp:]]` 原語 (20 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (7/7)、zh 訳語表 (7 語一致、warn 0)、図種 (flow steps ×2 / tree static ×1 / 図なし ×4 = 登録内)、派生フィールド一致 (78 箇所)、用語・`term_zh`・`term_en`・`title_*`・`unit_summary_*` の v1 不変量、過去審査に HIGH / MEDIUM の前歴なし (回帰対象なし)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **11** (建議修 6: L1〜L6 / 記録のみ 5: L7〜L11、うち L9・L11 は任意の修正案あり) |

## 5. 判定

**FAIL → 補丁で PASS 可** (D-199: MEDIUM 1 件)。全 7 用語・考点 9 件 (qid 付き 7 件)・引用 7 題 + 未引用の quiz / challenge 2 題で、考点の主張は正答と一致し、誤答肢を支持する記述・限定条件の落ち・写しは無い。MEDIUM は M1 (クラウドファンディングの比喩「募金箱」が図・detail・考点 2 の「見返りのある型」と食い違う) 1 件のみで、同一欄内の文字列置換 (三語) で解消できる。B3 補丁 = M1 + LOW 建議修 L1〜L6。補丁適用後に validate / parity を再実行し、M1 の 3 欄に「募金」「募捐」「collection box」が残らないことを確認すれば PASS。L7〜L11 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-16-u02
✓ strategy-05-16-u02 unit: 0 issues (data/ip/textbook/units/strategy-05-16-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-05-16-u02
✓ strategy-05-16-u02 parity: 30 locations, 0 diff
EXIT=0
```

補丁案の事前試行 (scratchpad の複製に M1 + L1〜L6 を適用、単元ファイルは不変): `textbook-v2-validate.mjs --file <複製>` = 派生フィールド未再生成による `compat` 11 件のみ (B3 適用時に派生は自動で追従する分) で、それ以外の issue 0 (L6 の `[[jp:オンライントレード]]` 追加も jp-origin・語彙表の問題なし)。`textbook-v2-parity.mjs --file <複製>` = 30 locations, 0 diff。M1 の置換後の比喩は one_jp にやや近い (再審なら D-203 §6 の LOW) ため、代わりに D-203 (b) どおり `analogy_jp/zh/en` を空にする選択肢もある。
