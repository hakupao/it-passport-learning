# Rule A 全数抽検 — strategy-03-09-u04 (M&A と企業再編)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とも JP / loc 審査者とも別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成、検証用スクリプトは scratchpad)。
- **Date**: 2026-11-06 (S147 第 24 批 b24)、repo HEAD `1df38f1f` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b24-u04-a2` merge 結果、sha256 先頭 `432e83031aa5f366`)。
- **対象**: `data/ip/textbook/units/strategy-03-09-u04.json` (textbook-unit-v2)、用語 **4 / 4 = 全数** (M&A / MBO / TOB / 垂直統合) + 単元レベル (goals / overview_cols・rows / pairs / key_points / summary / challenge_questions)。
- **前回までの審査**: a1 (`journal.b24-u04-a1.jsonl`、Rule B `failures/phase5/stage_07_ui/phase3/batch/strategy-03-09-u04_attempt_1.md`) jp-review #1 medium 4 / #2 medium 2。a2 (`journal.b24-u04-a2.jsonl`、a1 jp.r1 + jp-review #2 を種) jp r1 REVISE medium 2 → r2 PASS、loc r1 REVISE medium 1 → r2 PASS。§3 の表で全 9 件を現行テキストで照合。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `data/ip/textbook/.planning/v2/strategy-03-09-u04/v1-original.json` (term / term_zh / term_en とも v1 と一致、スクリプトで確認)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・D-208 型 (1)〜(10) の MEDIUM 類 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え、写し判定に要る数字句のみ最小限)。

## 1. 方法

1. **全文読み取り**: 4 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption)/ quiz / inline_quiz` と単元レベル全フィールドを三語とも読んだ (派生フィールド除き 364 行に平坦化して通読)。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0; M&A は hook なしで `memory_hook_*` = 空文字)。
2. **考点 × 引用題**: 考点 全 10 件 = exam 6 + mix 4、qid 付き 6 件、引用 qid 延べ 9 = 異なり 9 題 (2017h29a-q021 / 2018h30a-q011 / 2012h24a-q018 / 2013h25h-q006 / 2010h22h-q017 / 2014h26a-q008 / 2023r05-q028 / 2017h29h-q008 + quiz・challenge のみ 2010h22h-q001 / 2016h28a-q012 / 2009h21a-q008 / 2013h25a-q026 / 2014h26a-q004 = 本単元で参照する 13 題)。`data/ip/quiz/questions.json` から各題の題文・選択肢・`correct_answer` を再読 (全 13 題 topic `strategy-03-09`、図付きは 2014h26a-q004 のみで表は選択肢の組)。一般化・限定・誤答肢支持・限定条件を 1 件ずつ確認。
3. **quiz / challenge**: quiz 計 9 枠 (M&A 3 / MBO 2 / TOB 2 / 垂直統合 2) + challenge 4 題 (2013h25a-q026 / 2017h29a-q021 / 2023r05-q028 / 2014h26a-q004)。2010h22h-q001 (他社の技術・人材を自社固有の資源として取り込む戦略 = M&A; 誤答 R&D・アライアンス・技術提携) は M&A one・detail・points[0] (経営権の取得が軸) で解ける。2016h28a-q012 (M&A = 不足機能を買収等で取り込み事業展開を速める; 誤答 = バリューチェーン分析・カンパニー制・BPR) は detail 3 文目と整合。2009h21a-q008 (ファブレス = 工場を持たず企画、生産委託; 誤答ウ = 垂直統合した製造小売) は垂直統合 points[2] と整合 (ファブレスと垂直統合を両側正の定義で対比)。2013h25a-q026 (TOB = 期間・株数・価格などを公表し市場外で特定企業の株式を買付け; 誤答 = 持合い提携・MBO・LBO) は TOB one と整合 (下記 L4 参照)。2014h26a-q004 (出資先への経営の支配力を高める行為 = 株式の追加取得) は M&A detail「株式の取得などによって経営権を得る」と整合。
4. **D-198 写し**: validate の copy guard = 0 件、`warn  choice-echo` 出力 0 行。独立照合として単元の JP 文字列 79 本 (派生・summary・overview.intro 除く) を topic 内全 60 題の題文 + 選択肢と照合:
   - 12 字連続 (句読点・記号・空白除去、カタカナ 4 字以上と英数を □ 1 字に遮蔽、実字 6 未満の窓は除外): **0 件**。
   - 同上、**遮蔽なし**: **0 件**。
   - **1〜2 字置換の近似一致** (12 字窓・置換 ≤2): 実質 2 件 + 英字略語の偽陽性 4 件 (`Merger/Acquisition`・`Management` の英字綴りが別 topic 外の題の英字と重なるもの) → §3 L5。
   - 文単位の類似度 (bigram Dice / 正規化編集距離): 最大 Dice 0.38 / ed 0.72 (terms[0].one_jp ↔ 2011h23tokubetsu-q013 ア、英語原語の展開)、引用題では最大 0.36 / 0.62 (overview_rows[1].one_line_jp ↔ 2013h25h-q006 ウ)。較正値 HIGH 例 (ed 0.14 / Dice 0.52) から大きく離れる。
   - カタカナ多い文の目視 (ジョイントベンチャ・ファブレス・アライアンス・TOB 公告の文): 題文・選択肢の語順の再現なし。
   - **(iii) 選択肢なぞり (D-208 (1))**: 誤答肢の打ち消しだけの考点 0。各候補は §2 と §3 L2〜L4 で引用語句を示して判定。
5. **D-195**: 結論先行 (one = 1 文 × 4、太字あり)、展開 2〜3 文 (3/3/2/3)、比喩・フック (M&A は hook なし = a1 low「定義の言い換え」への対応で削除、validate 0)、定義前使用 (経営権 = M&A one 内で使用・detail で買収の定義、上流・下流 = 垂直統合 detail 1 文目、公告・市場の外 = TOB one、EBO / IPO / 水平統合 / ファブレス / ジョイントベンチャ = 各考点内で定義)、**§9 禁止句 grep** (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `freq_badge`「頻出」と TOB `hook_jp`「名乗り**出る**」(+ 派生 2) のみ = 偽陽性。zh / en (必须 / 一定要 / 考试 / 重要 / exam / must / always / important / test) → en の "example" 3 件・"Example purposes" 1 件のみ = 偽陽性。図種 (M&A = tree static、TOB = flow steps 4、垂直統合 = flow static 5 ノード、MBO = 図なし; 全て登録内)、pair 配置 (MBO / TOB は TOB の後、key 行 rows[0])。
6. **D-200**: 考点数 2 / 2 / 3 / 3 (≤3 ✓)、各 JP 文数 1〜2・字数 53〜81 (≤100 ✓、最大 TOB `points[1]` 81 字)。**framing 件数** (`validateV2.pointFraming` を直接呼び出し、全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (「〜だけ」「〜ではない」「限定されない」の照合: M&A overview extra「限定されない (経営権を取得する側全般)」と one「企業の経営権を取得したり…統合したりする手法の総称」と MBO ⊂ M&A [2013h25h-q006 題文の前提] が整合; TOB pairs rows[1].b「限定されない (企業やファンド、経営陣など)」と points[2]「経営陣が TOB の方法で…MBO を行うこともある」が整合; 垂直統合 points[2]「向きが逆」と one・detail が整合) → 不整合 0。書き方 8 → §3 の対比列挙。書き方 9 (限定条件) → §2。§6 → 比喩は全て別場面 (店の統合・雇われ店長・張り紙の買取り・製粉会社)、hook は語源 (Buyout / Take-Over Bid / 垂直 = 縦)。§9 言い直し → L6・L7。
8. **D-205 / D-210**: 改訂される文書 (規格・法令・ガイドライン・知識体系) の構成要素の数・名前を述べる箇所 = なし (TOB の公告事項は法定事項だが数を述べず、L1 で「など」を補う)。法改正前の文言に依る引用題 = なし (TOB / MBO の各題は制度の基本形のみを問い、改正で変わった要件に触れない)。
9. **三語**: zh・en が jp と同じ事実か、図ラベル・caption・総表・比較表の三語一致、`[[jp:…]]` 原語 8 種 (提携 / アライアンス / ジョイントベンチャ / 経営陣 / 株式公開買付け / 垂直統合 / 水平統合 / ファブレス) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` は TOB・垂直統合 あり、M&A・MBO は英字略語の見出し語がそのまま本文に出るため併記なし (validate 0、O2)。zh 訳語は `zh_terms.unit.json` (M&A 并购（M&A） / MBO 管理层收购（MBO） / TOB 要约收购（TOB） / アライアンス 联盟 / ファブレス 无厂模式 / 垂直統合 纵向整合) と一致、validate の B6 warn 0。
10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (4 / 4)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | M&A | OK — exam 1 / 2 題: M&A と提携を分ける軸 = 対象企業の経営権を取得するか、経営権を得た側は相手の資源の使い道を自ら決められる (2017h29a-q021 正答ウ アライアンス = 組織的統合なしで技術補完 / 2018h30a-q011 正答エ = b のみ [提携では相手の意思決定への関与が限定的]; 考点 2 文目は b を M&A 側から正の帰結として述べ、a・c [組織改革・大きな投資 = 買収側の負担] には触れず項目の組・順序を再現しない → D-209 の役割の区別、L3)。2017h29a-q021 の軸は「組織的統合」だが、detail「別の会社のまま子会社として残ることも多い」と経営権軸は矛盾しない (a1 low の指摘に沿い軸を経営権に寄せた結果)。mix: ジョイントベンチャでは出資企業がそれぞれ独立したまま残り経営権取得の M&A とは形が異なる — 正しい。tree (合併 [吸収・新設] / 買収 [株式の取得などによって経営権を得る]) は detail と一致、事業譲受けの「だけ」限定ノードは削除済み | OK (hook なし、validate 0) | OK | L3 / L6 (detail) |
| 2 | MBO | OK — exam 1 / 2 題: 買い手は経営陣自身、買収後は所有者と経営者が同じになる (2012h24a-q018 正答イ 経営者が自社株式の大半を買い経営権取得 / 2013h25h-q006 正答ウ 経営陣による自社の買収; 誤答 = 親会社・競合・子会社による買収、いずれも支持しない)。限定条件: 2013h25h-q006 題文の「M&A の手段の一つである MBO」は M&A one (主体を限らない) と overview extra で保持 (a2 medium #1 解消)。mix: 従業員が買えば EBO — 正しい | OK | zh 名牌・二重括弧 LOW | L7 / L8 (zh) |
| 3 | TOB | OK — exam 2 / 3 題: ねらい = 経営権の掌握や出資による資本関係、売り手は株主一般 (2010h22h-q017 正答ア 価格・期間を公表し不特定多数の株主から / 2014h26a-q008 正答ア 経営権取得や資本参加が目的・不特定多数の株主から市場外; 誤答 = 支配の一般論・自社株買い・MBO・IPO・CSR を支持しない) / IPO = 売り出す側、TOB = 買い集める側 (2023r05-q028 正答ア IPO、TOB は誤答肢; 両側を正の定義で対比 → L2)。mix: MBO = 誰が買うか、TOB = どう買うか、TOB で MBO を行うこともある — 正しい。flow steps 4 (公告→応募→市場外で買付け→経営権・資本参加) は one・考点と一致、caption の「必要な量が集まれば」は条件付きで過大でない。one の公告事項 3 つに「など」なし → L1 | OK | en 生の (公開)・zh 收集 LOW | **L1 建議修** / L2 / L4 / L5 |
| 4 | 垂直統合 | OK — exam 1 / 1 題: 取り込む相手の位置で決まる、部品メーカー→完成品メーカー買収 = 下流側、完成品メーカー→原料生産会社を子会社 = 上流側 (2017h29h-q008 正答イ 商社が小売を子会社化 = 下流; 考点の例は題の主体 [商社・小売] を使わない。誤答ア 検品の委託・ウ 同業銀行の買収・エ 特定部品の採用 を支持しない)。mix: 同じ段階の同業他社の取り込み = 水平統合 (誤答ウ の型を両側正の定義で区別 → L2) / ファブレス = 生産を外部に任せ、垂直統合と向きが逆 — 正しい (a1 medium「製造の工程を自社に抱える」限定は解消)。hook・比喩・図を 2017h29h-q008 の各肢に当てても正答イ以外を選ばせない (D-208 (9) ✓) | OK | en hook の「垂直」手がかり LOW | L2 |

**単元レベル**: goals 3 点 (goals_jp[0] は経営権軸、a1 medium「資本を伴わない提携」限定は解消)・overview_cols 2 (買い手・主体 / 語が表すもの)・overview_rows 4 行 (垂直統合の「語が表すもの」= 前後の工程の取り込み、a1 low 解消)・pairs 1 組 (MBO / TOB 4 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge 4 件 (本文と矛盾なし、§1-3)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 1)** + 範囲外観察 3

### 3-1. 前回 HIGH / MEDIUM の解消 (退行なし)

| 由来 | 箇所 | 前回の指摘 (要約) | 現行テキスト (jp) | zh / en の退行 | 判定 |
|---|---|---|---|---|---|
| a1 #1 | `terms[3].points[2]` | ファブレス対比で垂直統合を「製造の工程を自社に抱える」に限定 | 「工場を持たずに生産を外部に任せるファブレスは、前後の工程を内部に取り込む垂直統合とは向きが逆の形態である。」 | zh「把前后环节纳入内部的纵向整合方向相反」/ en "where adjacent stages are brought in-house" — 製造限定なし | 解消 |
| a1 #1 | `goals_jp[0]` | 提携を「資本を伴わない」ものに限定、軸の説明と食い違い | 「…提携 (アライアンス) を、対象となる企業の経営権を取得するかどうかで分けられる。」 | zh「以是否取得对象企业的经营权为标准」/ en "by whether the target company's management control is acquired" (overview.intro 三語も同文) | 解消 |
| a1 #1 | `terms[3].analogy_jp` | ラーメン店の比喩が同じ販売段階の拡大 (水平) を下流と描く | 製粉会社が小麦の農場 (前 = 原料の段階) とパンを売る店 (後ろ = 消費者に売る段階) を持つ、「自分とは別の段階を取り込む」 | zh / en 同じ像 (farm / bakery) | 解消 |
| a1 #1 | `terms[0].fig…children[1].children[1]` | 「事業の譲受け: 一部の事業だけ」の事実誤り | ノード削除。買収 = 「株式の取得などによって経営権を得る」(子なし) | zh / en も削除 (parity 22 locations 0 diff) | 解消 |
| a1 #2 | `terms[0].points[0]` | 2010h22h-q001 題文と 2016h28a-q012 正答エ の句の並びをなぞる | 考点は M&A / 提携の経営権軸に差し替え (qids 2017h29a-q021 / 2018h30a-q011)。2 題は quiz / inline_quiz にのみ残る。detail 3 文目「自社で一から育てるより短い期間で、販路や技術、人材といった経営資源を手に入れられる点が利点」は M&A の一般的な利点 (時間を買う) の記述で、販路が先頭に入り、題文の並び (他社が開発した→技術→人材→自社固有の資源として取り込む) も正答エの句の並び (不足機能→買収などで取り込み→事業展開を速める) も再現しない → L6 記録のみ | zh / en も同構成 (en "sooner"、a1 loc の "far sooner" 強調は解消) | 解消 |
| a1 #2 | `fig children[1]` / `one_jp` / `key_points_jp[0]` | 図の事業譲受け (経営権を得ない形) と「経営権ごと」限定の食い違い | one「企業の経営権を取得したり、複数の会社を 1 つに統合したりする手法の総称」、key_points[0]「企業の経営権を取得したり会社を統合したりする手段」、図の事業譲受けノード削除 | zh / en 同義 | 解消 |
| a2 jp r1 #1 | `terms[0].one_jp` / `overview_rows[0].extra_jp[0]` | 主体を「企業が他社を取り込む」に限定し MBO ⊂ M&A (2013h25h-q006 題文) と食い違い | one から「他社を」の限定が消え、extra「限定されない (経営権を取得する側全般)」。比喩「別々の店を 1 軒にまとめたり、よその店を丸ごと買い取ったり」は「〜たり」の例示で主体を限らず、one・extra と矛盾しない (O3) | zh「不限（泛指取得经营权的一方）」/ en "Not limited (any party gaining management control)" | 解消 |
| a2 jp r1 #2 | `terms[0].detail_jp` / fig | 買収を「株式を買い取って」に限定 | detail「株式の取得などによって対象企業の経営権を得る」、fig「株式の取得などによって経営権を得る」(2012h24a-q018 エ の「株式取得などの方法」と同じ開き方) | zh「通过取得股份等方式」/ en "for example by buying its shares"・"e.g. by buying shares" | 解消 |
| a2 loc r1 | `terms[0].fig…children[0].children[0].label.zh` | 「一方存续，并入另一方」で吸収の向きが逆に読める | zh「吸收合并：一方存续，吸收另一方」 | jp「一方が存続し、他方を取り込む」・en "one survives and takes in the other" と一致 | 解消 |

### 3-2. 今回の指摘

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[2].one_jp` / `one_zh` / `one_en` (+ 派生 `definition_*`)、`terms[2].fig.steps[0].caption_jp` / `caption_zh` / `caption_en` | TOB の公告事項を「株数・価格・期間」の 3 つで閉じ、引用題 2014h26a-q008 正答ア (株数, 価格, 期限など) と challenge 2013h25a-q026 正答ア (期間, 株数, 価格など) の「など」が落ちている。法定の公告事項はこの 3 つに限らない。**MEDIUM (型 (2)「範囲を閉じる」/ 型 (10)) にしない理由**: 3 つは引用題が名指しする項目と同じで、引用元が挙げる構成員を落としていない (型 (10) 不成立)。本単元の 13 題に 4 つ目の公告事項で正誤が分かれる肢はなく、閉じた列挙のまま読んでも正答肢を外さず誤答肢を選ばせない。考点ではなく定義文 (one) で、引用題の限定条件 (規則 9) の落ちにも当たらない。「など」の補足で 2014h26a-q008 ア と同じ 3 項目の並びも緩む (a2 jp r2 low) | jp one: 「買付けの株数・価格・期間をあらかじめ **公告** し」→「買付けの株数・価格・期間などをあらかじめ **公告** し」/ zh one: 「事先 **公告** 收购的股数、价格和期间，」→「事先 **公告** 收购的股数、价格、期间等条件，」/ en one: "first **publicly announces** the number of shares, the price and the period, then buys" → "first **publicly announces** the number of shares, the price, the period and other terms, then buys" / jp caption: 「買い手が、買い取る株数と価格、受け付ける期間を広く知らせる。」→「買い手が、買い取る株数と価格、受け付ける期間などの条件を広く知らせる。」/ zh caption: 「买方广泛公开要买入的股数、价格以及受理的期间。」→「买方广泛公开要买入的股数、价格以及受理的期间等条件。」/ en caption: "The buyer makes public how many shares it will buy, at what price, and for how long it will accept tenders from shareholders." → "The buyer makes public how many shares it will buy, at what price, for how long it will accept tenders from shareholders, and other terms." |
| L2 | LOW | `terms[2].points[1].text_jp/zh/en`、`terms[3].points[1].text_jp/zh/en` | (iii) 候補 (誤答肢の概念との対比)。TOB points[1]: 2023r05-q028 (正答 IPO、TOB は誤答肢) の題文と語が重なる — 単元「**未公開の株式**を**初めて**取引所に**上場**して**資金**を集めるのは IPO」↔ 題文の要素 (資金調達を目的に / 初めて上場 / 未公開の株式を新たに公開)。ただしこれは IPO の標準的な定義の構成要素 (D-198 の一般表現)、選択肢の組 (IPO / LBO / TOB / VC) は再現せず (IPO・TOB の 2 つのみ)、題の場面 (AI ベンチャー A 社) も使わない。「公開」で取り違えやすい 2 語を両側正の定義で対比 (D-209)。垂直統合 points[1]: 「**同業**他社を取り込んで**規模**を広げるのは水平統合」↔ 2017h29h-q008 誤答ウ (規模の拡大を目的に同業の銀行を買収) — 要素は 2 語のみ・順序逆・主体 (銀行) 不使用、垂直 / 水平を両側正の定義で対比 (D-209) | 記録のみ |
| L3 | LOW | `terms[0].points[0].text_jp/zh/en` 2 文目 | 「経営権を得た側は、相手の経営資源の使い道を自ら決められる」は 2018h30a-q011 の正答項目 b (提携では相手の意思決定への関与が限定的) を M&A 側から正の形で裏返したもの (経営資源の活用→使い道、意思決定→決められる)。1 項目のみ・項目の組 (a・b・c) と順序は再現せず、軸からの帰結を一般的な役割の区別として述べた文 (D-209)。a2 jp r1 / r2 とも low | 記録のみ |
| L4 | LOW | `terms[2].points[0].text_jp/zh/en` | 2014h26a-q008 正答ア の要素を同じ順 (目的 = 経営権の取得・資本参加 → 売り手 = 不特定多数の株主) で言い換える。分類題 (TOB の説明として最も適切) の正答内容を見出し語の一般的な定義として述べたもの (D-209)、語句は「経営権を握る」「出資して資本関係を持つ」「株主一般から募る」と置き換えられ 12 字連続・近似一致なし。なお「売り手は特定の相手に限らず」は challenge 2013h25a-q026 正答ア の「市場外で**特定企業の株式**を買い付ける」(対象企業が特定) と字面で衝突して見えるが、売り手 (株主) と対象企業の別であり、同題の他肢 (持合い提携・MBO・LBO) は明確に別概念なので正答を外させない (D-208 (9) 不成立) | 記録のみ |
| L5 | LOW | `overview_rows[2].one_line_jp`、`terms[1].one_jp` | 1〜2 字置換の近似一致: 「市場**の**外で株式を買い集める」↔ 2014h26a-q008 ア「株式市場外で株式を買い集める」(置換 2)、「(経営陣) が自社の株式の**多く**を買い (取り)」↔ 2012h24a-q018 イ「(経営者) が自社の株式の**大半**を買い (取る)」(置換 2)。いずれも TOB / MBO の標準的な定義の定型句 (D-198 の一般表現)、文単位は Dice 0.31〜0.36 / ed 0.63〜0.68 で較正 HIGH 例 (0.52 / 0.14) から遠い。MBO one は「自ら経営権を握る買収」と結びが異なり題の文の並びの再現ではない | 記録のみ |
| L6 | LOW | `terms[0].detail_jp/zh/en` 3 文目 | a1 #2 の名残の確認 (§3-1)。M&A の一般的な利点で写しではないが、2010h22h-q001 / 2016h28a-q012 の要素 (技術・人材・経営資源・速さ) を 1 文に集めている | 記録のみ |
| L7 | LOW | `terms[1].points[0].text_jp/zh/en` 2 文目 | 「買収の後は、会社を所有する人と経営する人が同じになる」は、detail 3 文目 (ファンドから資金を集めて行うことがある) と並べると、ファンドが出資者に加わる場合に言い切りがやや強い (a2 jp r2 low)。正答 (2012h24a-q018 イ・2013h25h-q006 ウ) とは矛盾せず、MBO の「所有と経営の一致」という標準的な説明。1 文目は one の言い直し (§9、D-203 low) | 記録のみ |
| L8 | LOW | zh / en 措辞 (a2 loc r2 low の残り、事実は保持) | (a) `terms[1].hook_zh`「买方的名牌」— 「名牌」は有名ブランドの語感 (+ 派生 `memory_hook_zh`, `summary.memory_hooks_zh[0]`); (b) `terms[2].points[2].text_zh`「收集本公司股份」・`terms[2].fig.steps[3].caption_zh`「收集到所需数量的股份后」— 「收购」が自然; (c) zh の和式中点「・」(`overview_cols_zh[0]` 买方・主体 / `overview_rows[0].extra_zh[1]` / `terms[2].fig.data.nodes[3].label.zh` / `terms[3].fig.data.nodes[0].label.zh`・`nodes[2].label.zh`); (d) `terms[1].one_zh`「**管理层收购（MBO）**（英文 Management Buyout）」の全角括弧連続; (e) `terms[2].detail_en` の生の「(公開)」が `[[jp:]]` 標記なし; (f) `terms[3].hook_en` "Vertical means up and down" で 垂直 の字との結び付きが薄い | 記録のみ (任意の修正例: (a) 「名牌」→「标签」、(b) 「收集」→「收购」、(e) "(公開)" → "([[jp:公開]])") |
| L9 | LOW | `key_points_jp[0..3]` (+ zh / en) | 要点 4 件が各用語の one をほぼそのまま短くした言い直しで、新しい整理の観点を加えない (a2 jp r2 low、§9 D-203 low) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① MBO = 誰が買うか / TOB = どう買うか: `pairs[0].rows[0]` (key)、`terms[2].points[2]` (mix) の 2 箇所 + `goals_jp[1]`・overview の「語が表すもの」列 (D-195 §3 の構造、観点の予告) → 上限内。② M&A / 提携 (経営権の取得): `terms[0].points[0]` + `goals_jp[0]` (予告) → 許容。③ M&A / ジョイントベンチャ: `terms[0].points[1]` のみ。④ IPO / TOB: `terms[2].points[1]` のみ。⑤ 垂直 / 水平統合: `terms[3].points[1]` のみ。⑥ 垂直統合 / ファブレス: `terms[3].points[2]` のみ。detail・key_points で対比の繰り返しなし。

**D-208 既知型の個別確認**: (1) 選択肢なぞり → L2〜L4 (語句を示して LOW)、HIGH / MEDIUM 0。(2) 「など」落ち → L1 (範囲を閉じず LOW)。(3) シラバスの別名を別物として教える → なし (提携 = アライアンスは zh「合作（[[jp:提携]]，即联盟 [[jp:アライアンス]]）」/ en "a tie-up or alliance" で 1 概念として扱う、a2 loc low 解消)。(4) 比喩・図と one / detail の範囲矛盾 → なし (店の統合・雇われ店長・張り紙・製粉会社、tree / flow とも one と一致)。(5) 前回修正の zh / en 退行 → なし (§3-1)。(6) zh / en が誤答肢寄りの措辞 → なし (MBO / TOB / 垂直統合の en・zh を各誤答肢と照合)。(7) 改正前の文言 → 該当題なし。(8) 比喩・hook の鍵語が他の見出し語の語幹・別定義の役割 → なし (TOB hook の「乗っ取る」は Take-Over の語義で、TOB のねらいに資本参加を含む points[0] と矛盾せず、2014h26a-q008 の誤答肢へ寄せない)。(9) hook・認識手がかりを引用題に当てると誤答肢を選ぶ → なし (MBO hook「M = 買い手の名札」→ 2013h25h-q006 ウ、垂直統合 hook / points[0] → 2017h29h-q008 イ)。(10) 法令・規格の範疇の閉じた列挙で構成員を落とす → L1 で検討、引用元の名指し項目は落としていない。

**範囲外の観察**:
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。「資本を通じた買収・統合」は資本を伴わない合併形態を想定しないが、validate 対象外の概要文で事実誤りではない。
- O2 M&A / MBO の `one_zh / one_en` に見出し語の `[[jp:]]` 併記なし。英字略語の見出し語が三語とも同じ綴りで本文に出るため D-202 の目的 (jp 見出し語の提示) は満たされ、validate も 0。
- O3 M&A `analogy_jp`「よその店を丸ごと買い取ったり」は買収の一例示で、MBO (自社を買う) を M&A の外に置くような主体の限定にはならない (one・overview extra が主体を限定しない)。

確認済みで問題なし: 限定条件 (考点 6 件全て保持、§2)、§9 禁止句 grep (定型締め句 0、hit は偽陽性のみ)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤81 字)、copy guard 0・choice-echo 0・独立 12 字照合 (遮蔽あり / なし) 0、`[[jp:]]` 原語 (8 種全て jp 本文に実在)、zh 訳語表 (`zh_terms.unit.json` 一致・B6 warn 0)、図種 (tree static / flow steps / flow static / 図なし = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 1: L1 / 記録のみ 8: L2〜L9) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 4 用語・考点 10 件 (qid 付き 6 件)・引用 8 題 + quiz / challenge のみの 5 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。a1 の medium 6 件・a2 の medium 3 件は全て解消し、zh / en の退行なし。LOW 建議修 1 件 (L1) は補丁 (B3) で修正推奨、L2〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-03-09-u04
✓ strategy-03-09-u04 unit: 0 issues (data/ip/textbook/units/strategy-03-09-u04.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-03-09-u04
✓ strategy-03-09-u04 parity: 22 locations, 0 diff
EXIT=0
```
