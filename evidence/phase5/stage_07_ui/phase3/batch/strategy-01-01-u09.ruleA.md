# Rule A 全数抽検 — strategy-01-01-u09 (経営層と役職)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / jp-review / localiser / tr-review) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 照合スクリプトは scratchpad)。
- **Date**: 2026-11-06 (S147 第 22 批 b22)、repo HEAD `eb783aa6` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b22-u09-a1` merge 結果、`merged.json` と同一 [cmp 一致]、sha256 先頭 `5fd15d5a5b4b5dad`)。
- **対象**: `data/ip/textbook/units/strategy-01-01-u09.json` (textbook-unit-v2)、用語 **3 / 3 = 全数** (CxO / CEO / CIO) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。topic = strategy-01-01。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205、D-208 (失敗型の明示点検)、D-209 ((iii) の免除 2 型)、D-210。追加点検 (b21 u05 M1 型): 比喩・フックの鍵語が他の見出し語の語幹か、単元内で別に定義される役職名を指していないか → 引用題・quiz の誤答肢の読みに寄るなら MEDIUM。zh 役職名 (CEO / CIO / CFO / COO / CISO、取締役・執行役員) を `zh_terms.json` と quiz zh sidecar に照合。比較: `data/ip/textbook/.planning/v2/strategy-01-01-u09/v1-original.json` (用語 3 語・`term_zh`・`term_en` とも v1 と一致、`unit_summary_*` は v1 と同文)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 (比喩の像が考点の否定する内容を運ぶ = 観点 7)・D-198 (iii)・zh / en の語が誤答肢の読みに寄る (b18 u05 型) / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え; 一致断片は 12 字以内)。

## 1. 方法

1. **全文読み取り**: 3 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 4 件 = exam 2 + mix 2、qid 付き 2 件、引用 qid 延べ 4 件 = 異なり 4 題)**: `data/ip/quiz/questions.json` + `translations/<exam>.json` (`stem_jp_clean` のある題はそれで判断) から題文・選択肢・`correct_answer` を再読 (全題 topic `strategy-01-01`)。manifest の関連題 8 題のうち役職を問う 4 題 (2010h22a-q017 / 2011h23a-q002 / 2014h26h-q008 / 2017h29a-q023) を全て読み、残り 4 題 (2009h21a-q003 CSR / 2009h21h-q013 株主総会 / 2010h22a-q005 グリーン IT / 2010h22h-q016 経営理念) は本単元の用語を問わないことを確認。さらに題 bank 全体を `CEO|COO|CIO|CFO|CISO|CxO|CTO|取締役|執行役員|最高.{0,4}責任者|社長` で grep (29 題) し、他 topic の役職題 (2024r06-q006 CTO / 2017h29h-q003・2012h24a-q003・2023r05-q007 CIO / 2026r08-q079 CISO / 2013h25h-q026・2015h27a-q019・2025r07-q023 執行) と本文が矛盾しないことも見た。
3. **quiz / challenge_questions** (quiz 計 4 枠 + challenge 4 題、全 4 題が考点 qid か quiz に出る): 本文と矛盾しないことを確認 (§2)。CEO を正答とする題は bank に 0 (CEO は 2014h26h-q008 / 2024r06-q006 の誤答肢としてのみ出る) → `terms[1].quiz = [2014h26h-q008]` は代替なし (jp-review r2 の low と同判断)。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合: 単元の JP 文字列 52 本 (派生除く、図ラベル・総表 `overview_rows` / `overview_cols`・対比表・goals・key_points を含む) を topic 内全 62 題の題文 (`stem_jp_clean` 優先) + 選択肢と 12 字連続照合 (句読点・記号・空白・記法除去) を **カタカナ 4 字以上 + 英数遮蔽あり (遮蔽後の実字 6 未満の窓は除外) / 遮蔽なし** の 2 通りで実施 → **0 / 0 件**。近似一致 (1〜2 字差し替え) 照合: 単元各文 × 題の各文 (8 字以上) で bigram Dice と正規化編集距離 → Dice ≥ 0.35 は 2 件のみ、最大 = `overview_rows[2].one_line_jp` × 2014h26h-q008 題文 (Dice 0.40 / ed 0.67)、次 = `terms[2].points[0].text_jp` 1 文目 × 2011h23a-q002 正答イ (Dice 0.38 / ed 0.57)。いずれも HIGH の較正例 (ed 0.14 / Dice 0.52) から遠い (L4 で記録)。
   - **カタカナ・英字の多い文の目視**: CxO の detail (Chief ＋ 担当 ＋ Officer、CFO / COO) × 2017h29a-q023・2014h26h-q008・2010h22a-q017 の選択肢 (英字 4 文字の役職名のみ)、CISO mix × 2026r08-q079 → 写し 0。
5. **D-208 失敗型の明示点検 (§4)**: validate は **`warn choice-echo` 行 0 件**。warn が見えない題文側 (判断項目・空欄) は本単元の引用題に無い (全題が「どれか」型の単一選択、穴埋め無し)。4 題全てで (iii) を 1 件ずつ判定。
6. **D-195**: 結論先行 (one = 1 文 × 3、太字あり)、展開 3 / 3 / 2 文 (detail)、比喩・フック (§6: フック 3 = 字形 [C と O の固定] / 語義 [executive] / 頭文字 [I]、比喩 3 = 部活動の部長 / 登山隊の隊長 / 建築家、いずれも定義の言い換えではない; 但し CEO hook は L1)、定義前使用 (CFO・COO = CxO detail の括弧注、情報戦略 = CIO detail の括弧注 [図ラベルが先に出る点は L7]、CISO = mix 考点内の括弧注、役員・経営幹部 = 一般語)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → `freq_badge`「頻出」と **「IT の I と重ねて覚えても外れない」1 件 × 3 欄** [`terms[2].hook_jp` + 派生 `memory_hook_jp` + `summary.memory_hooks_jp[2]`] のみ。記憶フックの言い方で定型締め句ではない (L6 記録のみ)。zh・en 相当語 [必须 / 考试 / 记住 / must / exam / always / remember] は `kind: "exam"` キー 2 件のみで本文ヒット 0)、図の型 (CxO = static tree、CIO = static flow 3 節点、CEO = 図なし; 全て登録内)、pair 配置 (CEO → CIO は CIO の後、key 行 1 = 責任の範囲)。
7. **D-200**: 考点数 1 / 1 / 2 (≤3 ✓)、各 JP 文数 1〜2・字数 57〜74 (≤100 ✓、最大は CEO `points[0]` の 2 文 74 字)。**framing 件数** (`validateV2.ts` の `pointFraming` を直接呼び出し、全考点): jp 0 / zh 0 / en 0 (上限 2)。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (「〜だけ」「〜ではない」の照合: CxO one「経営全体や財務・情報などの分野」と CEO detail「CxO の中でも…会社全体を見る」と tree 図 [CEO を CxO の子] が一致 = r1 の MEDIUM 解消; CISO mix「情報セキュリティに絞って」と CIO one「情報システムと IT の活用」が範囲で衝突しない; CEO mix「方針そのものに最終責任を負うのは CEO」と pairs[0].rows[2].a「最終的に決める」一致) → 不整合 0、ただし CEO hook の像は L1。書き方 8 (対比の出現欄) → §3 末尾に列挙。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → L1 (像の向き)、他は定義の言い直しではない。§9 言い直し → L5。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・総表・対比表の三語一致 (parity 18 箇所 0 diff)、`[[jp:…]]` 原語 6 種 (総称 / 最高経営責任者 / 最高執行責任者 / 最高情報責任者 / 情報戦略 / 最高情報セキュリティ責任者) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 = 英字 3 語で原語 = 表記同一 (CEO・CIO は日本語正式名の `[[jp:]]` あり、CxO は `[[jp:総称]]`)、zh 訳語が `zh_terms.json` に従うこと (validate の B6 warn 0 / jp-origin warn 0)。**zh 役職名の照合** (§5 に表): 単元内の `首席…官` 出現を全数集計 — CxO（首席某某官）8、CEO = 首席执行官 10、CIO = 首席信息官 11、CFO = 首席财务官 2、COO = 首席运营官 3、CISO = 首席信息安全官 1、他の訳名 0 → 単元内で揺れなし、`zh_terms.json` (CxO / CEO / CIO の 3 語) と一致、quiz sidecar で訳名が出る CISO (2026r08-q079 = 首席信息安全官) とも一致。tr-review (loc-review r1) の MEDIUM (`terms[2].points[0].text_zh` の「立场」) は r1 で「这一职务也负责统管…」に直り解消、退行なし。ただし loc-review r1 の low 提案を採った CxO analogy_zh の「社长」が新たに L2 を生んだ。
10. **前回審査の HIGH / MEDIUM 解消**: jp-review r1 (REVISE) の MEDIUM 1 件 — CxO の one と mix 考点が「特定の分野」に限り、CEO detail (会社全体) と tree 図 (CEO を CxO の子) と食い違う — は r1 で one が「経営全体や財務・情報などの分野」に広がり、限定付きの mix 考点は削除 (考点 5 → 4)、解消。zh「整体经营或财务、信息等领域」/ en "the whole business or for an area such as finance or information" も追随、退行なし。loc-review r1 の MEDIUM 1 件 (立场) も上記のとおり解消。jp-review r2 の low のうち CEO hook (実行 = CEO の像が COO の「執行」と取り違えられるおそれ) は未修のまま残り、本審査の追加点検で L1 (建議修) とした。
11. **D-205 / D-210**: 改訂される文書 (規格・法・ガイドライン・知識体系) の構成要素の数・名称、改正前の文言で書かれた引用題とも本単元には無い → N/A。
12. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§7 に出力全文)。

## 2. 用語別判定 (3 / 3)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | CxO | OK — exam 1 / 1 題: CFO の F は Finance、CFO は財務の最高責任者 (2017h29a-q023 正答イ = 財務; 誤答 技術・情報・人事を取り上げない)。one「経営全体や財務・情報**など**の分野」は例示を開いたまま、detail「CxO という名前の役職があるわけではない」「どの役職を置くかは企業ごとに決まる」は正しい。COO の O を「業務の執行」と説明するのは Operating の意訳で IT パスポートの水準で正しい。tree 図 (CEO / CIO / CFO / COO) は one・detail と一致 | OK (考点は detail の言い直し = L5) | en hook の "middle letter" 単数 = L3 | L2 (zh analogy), L3, L5, O1 |
| 2 | CEO | OK — mix 1: COO は CEO の決めた方針に沿って日々の業務の執行を指揮し、方針そのものの最終責任は CEO — 標準的な役割分担で正しい。2014h26h-q008 / 2010h22a-q017 の誤答肢 COO を支持しない (両題とも情報システム [戦略] の責任者 = CIO を問う)。detail「社長や代表取締役が CEO を兼ねる**ことがある**」は可能性の表現で正しい。quiz 2014h26h-q008 (正答 CIO) は CIO の one・CxO 図で解ける | OK | OK (zh「代表董事」は u02 と一致) | **L1 (hook)**, O2 |
| 3 | CIO | OK — exam 1 / 3 題: CIO は経営戦略を IT の面から実現するため情報戦略を立て実行まで率い、社内の情報システム全体を束ねる (2010h22a-q017 正答ウ = IS 戦略を策定し実現する責任者 / 2011h23a-q002 正答イ = 情報戦略を立て実施を率いる / 2014h26h-q008 正答ウ = 情報システムの統括)。q002 の誤答肢 (監査 / 人事制度・管理運営全般 / 資金効率・財務会計) を取り上げて否定していない。mix: CISO は情報セキュリティに絞り、CIO は情報システムと IT 活用全般 — 正しく、2026r08-q079 (他 topic; 誤答イ = CISO に全て任せる) を支持する記述もない。限定条件: 題に範囲を閉じる語なし | OK (考点 1 文目 ≈ q002 正答の骨格 = L4 記録; 4 欄の言い直し = L5; 図 = L7) | OK | L4, L5, L6, L7 |

**単元レベル**: goals 3 点・overview_cols 2 (正式名称 / 責任を負う範囲)・overview_rows 3 行・pairs 1 組 (CEO / CIO 3 行 key 1)・key_points 3・summary (記法除去版と一致)・challenge_questions 4 件 (2010h22a-q017 / 2011h23a-q002 / 2014h26h-q008 / 2017h29a-q023 — 全て考点 qid か quiz、本文と矛盾なし)。`overview_rows[0].extra_jp[1]`「役職ごとに異なる」は「責任を負う範囲」列の値で正しい。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 7 (うち 建議修 3: L1 / L2 / L3)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** (追加点検の型 = 鍵語が単元内で別に定義される役職を指す; 誤答肢には寄らないので MEDIUM に届かない) | `terms[1](CEO).hook_jp` / `hook_zh` / `hook_en` (+ 派生 `memory_hook_*`, `summary.memory_hooks_*[1]`) | hook の鍵語「『実行する』を意味する execute」/「表示“执行”的 execute」は、同じ用語の mix 考点 `terms[1].points[0]` が **COO** (最高執行責任者 / 首席运营官、「日々の業務の執行を指揮」/「指挥日常业务执行」) に割り当て、CEO については「方針そのものに最終責任」と分けた働きを指す。hook の結論 (経営幹部 = executive の長が CEO) は正しく考点と矛盾しないが、像として「実行 / 执行 = CEO」が残り、**jp が主因**で COO の正式名「最高**執行**責任者」と字が重なる (jp-review r2 も low で同旨を指摘、未修)。本単元の引用題・quiz (2014h26h-q008 / 2010h22a-q017 は COO・CEO を誤答肢に含むが、問うのは情報システム [戦略] の責任者 = CIO) の誤答肢の読みには寄らないため MEDIUM ではない。語源節を外せば語義の手がかりは残る。zh は CEO の標準訳名「首席执行官」自体が「执行」を含むため独立の問題ではなく、zh / en の修正は jp に合わせる parity の追随 | jp「Executive は「実行する」を意味する execute から来た語で、英語では企業の経営幹部を executive と呼ぶ。その Chief (長) が CEO である。」→「英語では企業の経営幹部を executive と呼ぶ。その Chief (長) が CEO である。」/ zh「Executive 源自表示“执行”的 execute，英语里把企业的经营高管称为 executive。他们的 Chief（首席，即最高领导）就是 CEO。」→「英语里把企业的经营高管称为 executive。他们的 Chief（首席，即最高领导）就是 CEO。」/ en "Executive comes from execute, meaning to carry out, and in English a company's senior managers are called executives. Their Chief is the CEO." → "In English, a company's senior managers are called executives. Their Chief is the CEO." |
| L2 | LOW **建議修** (追加点検の型 + b18 u05 型 (6) の zh 版; 誤答肢には寄らない) | `terms[0](CxO).analogy_zh` | zh 比喩は「社团的“社长”」を **各社团の長を指す共通の呼び方** (= CxO の総称の側) にたとえるが、同単元 `terms[1].detail_zh`「在日本企业中，**社长**或代表董事有时兼任 CEO」では「社长」が会社の一つの具体的な役職 (社長) として CEO と結び付く。zh 読者には「社长 ≒ CxO ≒ CEO」の連想が生じ、CxO detail の「并不存在名为 CxO 的具体职务」と逆向きの像になる。jp は「部長」/ en は "captain" で会社の役職名 (社長 / president) とは重ならず、zh だけの問題 (loc-review r1 の low 提案「社长」を採った結果)。quiz 2017h29a-q023 の誤答肢 (技術・情報・人事) には寄らない | zh「这和学校社团的“社长”很像。足球社社长、美术社社长，前面的名称表示是哪个社团，而“社长”则是各社团带头人的称呼。」→「这和学校兴趣小组的“组长”很像。足球小组组长、美术小组组长，前面的名称表示是哪个小组，而“组长”则是各小组带头人的称呼。」(jp「サッカー部・美術部」と同じ組; 「组长 / 小组」は本単元の他の欄に出ない [grep 0]。「队长」は CEO analogy_zh「登山队的队长」= CEO の像と衝突するので不可; jp / en は変更なし) |
| L3 | LOW **建議修** (r0 low の en 退行に近い措辞) | `terms[0](CxO).hook_en` (+ 派生 `memory_hook_en`, `summary.memory_hooks_en[0]`) | jp は r0 の「真ん中の英字だけ」(CISO のように複数字の役職がある — jp-review r1 low) を r1 で「真ん中の部分」に直したが、en は "Read the middle **letter**" と単数のままで、同単元の CISO (中央 = IS) と食い違う。zh「看中间的字母」は単複を区別しないので問題なし | en "The C at the start and the O at the end never change; only the middle swaps out. Read the middle letter and you know the area." → "The C at the start and the O at the end never change; only the middle swaps out. Read the middle letters and you know the area." |
| L4 | LOW (D-198 / D-209 記録のみ) | `terms[2](CIO).points[0].text_jp/zh/en` 1 文目 | 「経営戦略を IT の面から実現するため、情報戦略を立てて実行までを率いる」は 2011h23a-q002 正答イ (情報戦略を立て実施を率いる) の骨格を 立案→立てて / 実施→実行 / 主導→率いる と言い換えた形 (Dice 0.38 / ed 0.57、12 字一致 0)。CIO の役割を問う題の正答を見出し語の一般的な役割として述べる D-209 の免除に当たり、誤答肢の語句・組・順は使わない。jp-review r2 も同判断 (low) | 記録のみ (CIO の標準定義で、これ以上離すと定義が崩れる) |
| L5 | LOW (D-203 §9 記録のみ) | `terms[2].detail_jp` / `terms[2].points[0]` / `pairs[0].rows[2].b_jp` / `key_points_jp[2]` / `terms[2].fig`、および `terms[0].points[0]` | CIO の「経営戦略 → 情報戦略 → 投資・活用・実行の指揮」が 5 欄で言い直される。CxO の exam 考点 (CFO の F = Finance) も detail と図ラベル「CFO: 財務」の言い直し (jp-review r2 low 2 件と同旨) | 記録のみ (3 語の小単元で、引用題 4 題がいずれもこの定義そのものを問う) |
| L6 | LOW (§9 grep 記録のみ) | `terms[2](CIO).hook_jp` (+ 派生 2 欄) | 「IT の I と重ねて覚えても外れない」の「覚え」が §9 grep に当たる。記憶フックの言い方で定型締め句ではない。IT = Information Technology の I も Information なので事実として外れない | 記録のみ |
| L7 | LOW (D-195 §2 記録のみ) | `terms[2](CIO).fig` | 3 節点の static flow が detail 1 文目を節点に分けただけで、ラベル「情報戦略を立てる」が detail の定義 (括弧注) より先に出る (jp-review r2 low と同旨)。図種は登録内 | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① CEO = 会社全体 / CIO = 情報システムと IT: `pairs[0].rows[1]` (key)、`overview_rows[1..2]` (総表の列 = D-195 §3 の構造)、CxO tree 図ラベル、CEO detail 2 文目「受け持ちを一つの分野に区切らず」(CIO を名指ししない) → 許容。② CEO = 方針を決める / COO = 執行: CEO mix 考点のみ (+ CxO detail の COO 括弧注は定義) → 許容。③ CIO = IT 全般 / CISO = セキュリティ: CIO mix 考点のみ → 許容。`goals_jp[1..2]` は観点の予告で内容を述べない。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 CxO tree 図の子 4 つ (CEO / CIO / CFO / COO) は 2014h26h-q008 の選択肢の組 {CEO, CFO, CIO, COO} と集合が一致する (順は異なる: 図 CEO→CIO→CFO→COO / 題 ア CEO・イ CFO・ウ CIO・エ COO)。図は考点ではなく、見出し語 2 つ + detail で定義した 2 つを正の定義で並べた最も一般的な CxO の例で、誤答肢を否定する形でもないので D-198 (iii) には当たらないと判断。
- O2 quiz zh sidecar 側の訳語の揺れ (単元外): 代表取締役 = 2009h21h-q013「法人代表董事」 vs 本単元・u02「代表董事」; 社長 = 2011h23a-q016「总经理」 vs 2016h28a / 2015h27a / 2011h23tokubetsu・u08「社长」; 執行役員 = 2025r07-q023「执行官（执行役员）」 vs 2018h30a-q010「高级管理人员」。本単元は 代表董事・社长 を使い、取締役単独・執行役員は使わない (`zh_terms.json` にはいずれも登録なし) ので単元の不整合ではない。sidecar 側の統一は別作業。
- O3 「CEO / CIO は…**役員**である」の「役員」は会社法上の役員 (取締役・会計参与・監査役) より広い一般用法 (CxO は執行役員のこともある)。zh「高层管理者」/ en "executive" は会社法上の語に寄せておらず、引用題も「企業経営に携わる役職」「経営幹部の役職」と一般語で問うため、誤学習には当たらない。`unit_summary_*` は v1 と同文 (未改稿、B2 審査済み)。

確認済みで問題なし: 限定条件 (考点 4 件全て、§2)、§9 禁止句 grep (定型締め句 0; 「覚え」は L6)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤74 字)、図の文字列の写し (validate 0、独立照合 0)、`[[jp:]]` 原語 (6 種全て jp 本文に実在)、zh 訳語表 (B6 warn 0) と zh 役職名の全数一致 (§5)、図種 (static tree / static flow / 図なし = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。

## 4. D-208 失敗型の明示点検

| 型 | 判定 | 根拠 |
|---|---|---|
| (1) D-198 (iii) 選択肢・判断項目のなぞり | **該当なし** | validate の `warn choice-echo` 0 行。各題で確認: **2017h29a-q023** — CxO 考点は CFO の F の意味と CFO の担当を正の定義で述べ、誤答肢 (技術・情報・人事) を取り上げない。**2010h22a-q017 / 2014h26h-q008** — CIO 考点は CIO の役割の正の定義で、選択肢の役職名の組 (CCO / CFO / CIO / COO、CEO / CFO / CIO / COO) を考点で再現しない (図の集合一致は O1)。**2011h23a-q002** — L4 (正答の一般的な役割としての言い換え、D-209 免除)。誤答肢の場面 (監査・人事制度・資金効率) を再現・否定しない |
| (2) 引用題の限定語 (「など」等) の落ち | なし | 引用題に範囲を閉じる限定語は無い。単元側は「財務・情報などの分野」「社長や代表取締役が…ことがある」と開いたまま |
| (3) シラバス上の別名を別物として教える | なし | CEO = 最高経営責任者、CIO = 最高情報責任者、CxO = 総称を同一物として扱う |
| (4) 比喩・図の範囲が one / detail と矛盾 (D-204) | なし (L1・L2 は LOW) | 比喩 3 つ (部長 / 登山隊の隊長 / 建築家) と図 2 つは one・detail と整合。CEO hook の「実行」像 (L1) と zh 比喩の「社长」(L2) は結論が考点・detail と矛盾せず、誤答肢にも寄らないので LOW |
| (5) 前回修正の zh / en での退行 | L3 (措辞級) | jp-review r1 の MEDIUM (CxO の範囲) と loc-review r1 の MEDIUM (立场) は三語とも解消。r1 low (「英字だけ」) の jp 修正が en hook の "middle letter" 単数に残る (L3) |
| (6) zh / en の語が引用題・quiz の誤答肢の読みに寄る | なし (L2 は zh の欄間の連想で誤答肢ではない) | zh「社长」は quiz 2017h29a-q023 の誤答肢 (技術 / 信息 / 人事) とも、2014h26h-q008 / 2010h22a-q017 の誤答肢 (CEO / CFO / COO / CCO = sidecar でも英字のまま) とも結び付かない。en "directs day-to-day operations" (COO) も CIO 題の誤答肢を支持しない |
| (7) D-210 改正前の文言の題 | N/A | 法・規格の題なし |

## 5. zh 役職名の照合 (追加点検)

| 役職 (jp) | 単元 zh | 出現数 (単元) | `zh_terms.json` | quiz zh sidecar | 判定 |
|---|---|---|---|---|---|
| CxO (総称) | CxO（首席某某官） | 8 | CxO（首席某某官） | — (sidecar に出ない) | 一致 |
| CEO / 最高経営責任者 | CEO（首席执行官） | 10 | CEO（首席执行官） | 英字のまま (2014h26h-q008 / 2024r06-q006) | 一致 |
| CIO / 最高情報責任者 | CIO（首席信息官） | 11 | CIO（首席信息官） | 英字のまま (2010h22a-q017 / 2011h23a-q002 / 2014h26h-q008 / 2017h29h-q003) | 一致 |
| CFO / 最高財務責任者 | 首席财务官 | 2 | 登録なし | 英字のまま (2017h29a-q023 等) | 揺れなし |
| COO / 最高執行責任者 | 首席运营官 | 3 | 登録なし | 英字のまま | 揺れなし |
| CISO / 最高情報セキュリティ責任者 | 首席信息安全官 | 1 | 登録なし | 2026r08-q079「CISO（首席信息安全官）」 | 一致 |
| 代表取締役 | 代表董事 | 1 (+ 派生) | 登録なし | 2009h21h-q013「法人代表董事」 | 単元は u02 と一致、sidecar 側の揺れ (O2) |
| 社長 | 社长 (CEO detail) / 社长 (CxO analogy_zh、別義) | 1 欄 (+ 派生) + 1 欄 | 登録なし | 「社长」多数 / 2011h23a-q016「总经理」 | 単元内の別義衝突 = L2 |
| 取締役 (単独) / 執行役員 | 使用なし | 0 | 登録なし | 董事 / 执行官（执行役员）・高级管理人员 | N/A (O2) |

## 6. 合計 / 判定

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **7** (建議修 3: L1 / L2 / L3、記録のみ 4: L4〜L7) |

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 3 用語・考点 4 件 (qid 付き 2 件、引用 4 題)・quiz / challenge の全 4 題で、考点の主張は正答と一致し、誤答肢を支持する記述・限定条件の落ち・D-198 写し ((i)(ii)(iii)) は無い。追加点検 (b21 u05 M1 型) では CEO hook の「execute = 実行 / 执行」(L1) と zh CxO 比喩の「社长」(L2) が単元内で別に定義される役職を指す型に当たるが、どちらも結論は考点・detail と矛盾せず、引用題・quiz の誤答肢の読みに寄らないので LOW 建議修とした。zh 役職名は単元内・`zh_terms.json`・sidecar とも揺れなし。L1〜L3 は補丁 (B3) で修正推奨、L4〜L7 はバッチ証拠の「未修 LOW」表へ。

補丁の試し適用 (scratchpad の写しに L1 + L2 + L3 を当て、派生 `memory_hook_*` / `summary.memory_hooks_*` も追随させた版、repo の単元は未変更): `node --no-warnings scripts/textbook-v2-validate.mjs --file <scratchpad>/ra09/patched.json --manifest data/ip/textbook/.planning/v2/strategy-01-01-u09/manifest.json` → `✓ strategy-01-01-u09 unit: 0 issues`、EXIT=0。`node --no-warnings scripts/textbook-v2-parity.mjs --file <scratchpad>/ra09/patched.json` → `✓ strategy-01-01-u09 parity: 18 locations, 0 diff`、EXIT=0。

## 7. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-01-u09
✓ strategy-01-01-u09 unit: 0 issues (data/ip/textbook/units/strategy-01-01-u09.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-01-u09
✓ strategy-01-01-u09 parity: 18 locations, 0 diff
EXIT=0
```
