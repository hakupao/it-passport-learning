# Rule A 全数抽検 — strategy-03-10-u02 (マーケティング戦略の基本フレームワーク)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S148 b30)、repo HEAD `b250aaee` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b30-u02-a1` merge 結果、`merged.json` と同一、sha256 先頭 `5f5e5911afb3c81a`)。
- **対象**: `data/ip/textbook/units/strategy-03-10-u02.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (4P / 4C / セグメントマーケティング / ポジショニング / アンゾフの成長マトリクス / プロダクトライフサイクル) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210 / D-211 (正誤選択型で正解が一般原則の引用題)、`ruleA_unit_audit.md` の既知失敗型 (1)〜(10)。比較: `.planning/v2/strategy-03-10-u02/v1-original.json` (用語 6 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版 (memory_hooks は「見出し語: 」前置) であることをスクリプトで確認 (84 組、不一致 0)。
2. **考点 × 引用題** (考点 全 14 件 = exam 10 + mix 4、qid 付き 11 件、引用 qid 延べ 18 = 異なり 18 題、全題 topic `strategy-03-10`): `questions.json` の選択肢・`correct_answer` と `translations/<exam>.json` の `stem_jp_clean` を再読し、1 件ずつ正答一致・誤答肢非支持・一般化/限定の過不足・限定条件を確認。計算題 2016h28a-q020 は自分で再計算 (A = 68 + 2x、B = 79、C = 83 → x ≥ 8 = 正答ウ) し一致。
3. **quiz / challenge_questions**: quiz 13 枠 (全て本文の考点で引用済み) + challenge 5 題 (2014h26h-q030 / 2011h23tokubetsu-q023 / 2012h24a-q026 / 2013h25a-q022 / 2016h28h-q029、全て本文引用済み)。2017h29h-q002 (売り手側の分類 = 4P; 誤答 = 4C・PPM・SWOT) は `pairs[0].rows[0]`・4P one「売り手が決める」と整合、4C hook も 4P 側を選ばせる方向で誤答を誘わない。
4. **D-198 写し**: validate の copy guard = 0。独立照合: 単元 JP 文字列 131 本 (派生除く) × topic 内全 43 題の stem_jp_clean + 選択肢、12 字連続 (句読点・記号除去)。
   - カタカナ 4 字以上・英数遮蔽あり: **0 件**。
   - 遮蔽なし: 14 件、**全て見出し語そのもの** (プロダクトライフサイクル / マーケティングミックス / セグメントマーケティング / ワントゥワンマーケティング) → 偽陽性。
   - 近似 (12 字窓で 10 字以上一致 = 1〜2 字置換): 42 件、見出し語 + 助詞の差が大半。内容語を含むのは (a) `overview_rows[0].one_line_jp` / `terms[0].points[0].text_jp`「製品・価格・流通・販売促進」↔ 2014h26h-q030 の題文 (4 要素の列挙) — 4P の定義そのもので、名称を問う分類題の正答内容を一般定義として述べたもの (D-209 適用除外; 順序も 4P の標準順 Product→Price→Place→Promotion)。(b) `terms[4].one_jp`「製品と市場をそれぞれ既存と新規に」↔ 2018h30h-q001 の題文 — アンゾフの定義の標準表現。(c) `terms[3].points[1]`「ポジショニングの分析では」↔ 2016h28a-q020 (見出し語 + 汎用語)。(d) `key_points_jp[0]`「プッシュ戦略やプル戦略」↔ 2012h24a-q026 (用語名の並び)。文単位の類似度は全て HIGH 校正点 (ed 0.14 / Dice 0.52) から遠い: Ansoff one ed 0.67 / Dice 0.28、セグメント points[0] 0.87 / 0.09、ポジショニング points[0] 0.66 / 0.22、one 0.80 / 0.34、PLC points[0] 0.75 / 0.23、オピニオンリーダー 0.80 / 0.11、プル戦略 0.95 / 0.14、市場浸透 0.86 / 0.05、4P points[0] 0.74 / 0.52 (Dice は 4 要素名の一致による、定義そのもの)。
   - カタカナの多い文の目視: セグメント detail (区分軸 = 居住地域・所得・新商品をいつ買うか — 2022r04-q002 の年齢・性別・家族構成は使わない)、4P / 4C 表、STP 図 → 写しなし。
5. **D-208 (iii) 選択肢なぞり** (枠組み題を重点に): validate の `choice-echo` warn は 0 行。
   - **4P ↔ 4C 対応** (`pairs[0]` rows[1..4]、4C detail): 2017h29a-q032 は名称を問う分類題 (正答 4C、誤答 4S・AIDMA・SWOT) で、本文は誤答の名を出さない。対応表は 4C の一般定義 → 非該当。
   - **アンゾフ分類** (2018h30h-q001 / 2019h31h-q005): `terms[4].fig` は 既存/新しい市場 × 既存/新しい製品 の 2×2 で、2019h31h-q005 の図と同じ向きだが、行 = 市場・列 = 製品はアンゾフ原典の標準配置で、セル名の別名 (製品開発・市場開発) を括弧で併記 (同一物の別名として扱い、型 (3) の逆にもならない)。分類題の正答内容を一般定義で述べる形 → 非該当。detail の市場浸透の例 (買い替え特典で既存客の購入回数を増やす) と analogy (ラーメン店: 常連 / 新しい味 / 隣県出店 / 別業態) は自作の場面で、q001 の正答 (販売員増員) も誤答 3 肢 (新種の花・ビジネススーツ・販売エリア全国化) も再演しない。「隣の県に出店」は誤答ウと同じ象限の自作の正例で、否定のための再演ではない。4 戦略名の並び (浸透・新製品開発・開拓・多角化) は q001 題文と同順だが枠組みの構成要素そのものの標準順。
   - **PLC 段階記述** (2009h21h-q031、正答イ = 成長期の改良・差別化): `terms[5].points[0]` は正答内容を成長期の定義として述べ、誤答 3 肢 (導入期のキャッシュフロー・成熟期の参入相次ぐ・衰退期の広告費増大) の語を使わない。図の 4 caption は各段階の標準的特徴 (導入期 = 費用が先行、成熟期 = 伸び停止・シェア維持・費用抑制、衰退期 = 絞り込み・撤退) で、キャッシュフロー・参入・広告費増大の語も否定形もない → 非該当。D-211 (ii): 本題は正誤選択型で正解肢が成長期の一般原則、考点は肢の列挙・順序を落として同じ原則を一般表現で述べる = D-198 の「写しでない」側 (D-209 は当てない)。考点の「参入する競合も増える」は誤答ウ (成熟期に参入相次ぐ) と「参入」の 1 語が重なるが、成長期の標準的定義の一部で、誤答を打ち消すためだけの文ではない (主張の中心は正答イ) → 非該当。2012h24a-q015・2013h25a-q022 (説明として適切なもの) も同じく D-211 (ii) 側。成熟期 caption は「競争が激しくない」とは言わず、誤答ウの裏返しにもなっていない。
   - **プル / プッシュ** (2012h24a-q026、正答エ = 客を店へ誘導する広告): 4P detail のプッシュ戦略は「販売店や販売員に働きかけて勧めてもらう」の一般定義で、誤答 3 肢の具体策 (販売員教育・応援販売・販売奨励金) を使わない → 非該当 (易混 2 語の肯定定義対比)。
   - **オピニオンリーダー** (2015h27a-q018): 「早い時期に買って周囲に評判を広める」は正答エの一般定義、誤答 (普及後に伝える / 評判を参考にする / 先駆けて入手に意欲) を並べない。
   - **STP / ポジショニング** (2018h30a-q002・2025r07-q035 の誤答にセグメンテーション・ターゲティング・プロモーション): STP 図・`pairs[1]`・mix 考点は易混語の肯定定義対比 (D-209)、選択肢 4 つの組・順序 (プロモーション入り) は再現しない → 非該当。
   - **ワントゥワン** (2016h28h-q029、誤答にマスマーケティング): mix 考点と detail のマスマーケティングはいずれも肯定定義 → 非該当。
6. **閉じた列挙 (型 10)**: 4P 4 要素・4C 4 要素・PLC 4 段階・アンゾフ 4 戦略はいずれも完全。Promotion の手法は「〜がある」/ key_points「など」で閉じていない。法令・規格の区分の列挙なし。
7. **D-195**: 結論先行 (one = 1 文 × 6)、展開 2〜3 文、比喩・フックが定義の言い換えでないこと (4P hook は detail の言い直し → L5)、定義前使用 (マーケティングミックス = 4P one、セグメント / セグメンテーション / ターゲティング = セグメント one・detail、差別化 = ポジショニング one、4 段階 = PLC one; 4C one の「4P」は前用語で定義済み)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が / ポイント / 注意 → `freq_badge`「頻出」のほか、「選ぶ」6 件 (detail・analogy・図 caption・mix 考点・key_points の通常動詞)、「と覚える」1 件 (セグメント hook = 6 フック中 1 件、記録なし)、「費用が先に出る」(PLC caption、通常用法)、「とされる」1 件 (アンゾフ detail「一般に…危険が大きいとされる」= 通説の帰属表現で定型締め句ではない) → 定型締め句 0。zh grep [考试 / 必须 / 务必 / 被问 / 考到 / 重要 / 一定] ヒット 0、en grep の exam / option は example・exam candidates・options (ラーメン店の選択肢) の通常語)、図の型 (4P = table static、STP = flow steps 3、アンゾフ = table static、PLC = flow steps 4、4C・ポジショニング = 図なし; 全て登録内)、pair 配置 (4P/4C は 4C の後、セグメント/ポジショニングはポジショニングの後、各組 key 行あり)。
8. **D-200**: 考点数 3/1/3/3/2/2 (≤3 ✓)、各 JP 1 文・46〜77 字 (≤100 ✓)。**framing 件数** (`validateV2.pointFraming`、全考点): jp 0 / zh 0 / en 0 (上限 2)。
9. **D-202 / D-203 単元全体**: 書き方 7 (「〜だけ」「〜でなく」の照合: 4P detail「別々に決めるのではなく」と key_points[0] 一致、4C detail「企業が何を売りたいかでなく」と pairs[0].rows[0] 一致、アンゾフ hook「どちらも変えないのが市場浸透」と points[0]・key_points[2]・図一致、ポジショニング「狙う層を決めた後」と pairs[1].rows[2]・STP 図一致) → 不整合 0。書き方 8 → L3。書き方 9 (限定条件) → §2 表、落ち 0。§6 → L1 (4C hook)、L5。§9 言い直し → L5・L6。
10. **D-205 / D-210**: 改訂される文書 (規格・法令・知識体系) の構成要素数・名称なし、改正前文言の引用題なし → 対象外。
11. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 22 種 (マーケティングミックス / プッシュ戦略 / プル戦略 / セグメントマーケティング / セグメント / セグメンテーション / ターゲティング / マスマーケティング / オピニオンリーダー / ワントゥワンマーケティング / ポジショニング / 差別化 / アンゾフの成長マトリクス / 市場浸透 / 新製品開発 / 市場開拓 / 多角化 / プロダクトライフサイクル / 導入期 / 成長期 / 成熟期 / 衰退期) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` (4P / 4C は zh・en・jp 同形のため不要、他 4 用語あり)、zh 訳語 (`zh_terms.unit.json`: 细分营销 / 定位 / 安索夫成长矩阵 / 产品生命周期 / 推动战略 / 拉动战略 / 销售促进 一致、validate B6 warn 0)。型 (6) (zh / en の語が誤答肢に読める) → 該当なし。型 (5) (前回修正の退行) → 本 run は r0 のみで前回 HIGH/MEDIUM なし、対象なし。
12. **前段レビューの指摘** (`journal.b30-u02-a1.jsonl` type:"result"): jp-review r1 PASS (low 6)、loc-review r1 PASS (low 3)、HIGH / MEDIUM 0。low は全て未修のまま本文に残る → 本監査で再判定 (L1〜L7)。
13. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 4P | OK — exam 3 / 7 題: マーケティングミックス = 売り手が決める 4 要素を整合させて設計 (2011h23tokubetsu-q023 正答ウ / 2012h24a-q015 正答ウ / 2013h25h-q010 正答イ = 利益を含まない 4 要素 / 2014h26h-q030 正答エ / 2017h29h-q002 正答イ = 売り手側は 4P) / Place = 届ける経路・売り場、販売チャネルの変更は Place (2009h21a-q022 正答ウ = 代理店販売から EC 直販へ; 誤答 = EC 専用商品 [Product]・検索連動広告 [Promotion]・値下げ [Price] を支持しない) / プル戦略 = 広告で消費者に直接働きかけ来店させる (2012h24a-q026 正答エ)。表 4 行は one と一致 | OK | OK | L5 |
| 2 | 4C | OK — exam 1 / 1 題: 4C = マーケティングミックスを買い手から見た要素 (2017h29a-q032 正答ア)。4 要素名・4P との対応 (Product→Customer Value、Price→Cost、Place→Convenience、Promotion→Communication) は標準 (Lauterborn) どおり | OK | OK | **L1 建議修** (hook) |
| 3 | セグメントマーケティング | OK — exam 2 / 3 題 + mix 1: 属性・行動で区分し、区分ごとの買い方の違いを踏まえ少数の層に絞る (2022r04-q002 正答イ / 2013h25a-q022 正答ウ = 少数のセグメントに絞る [題の名称はターゲットマーケティング → L7]) / 購買態度の区分でオピニオンリーダー = 早期購入 + 評判を広める (2015h27a-q018 正答エ; 限定条件「購買の態度で区分したとき」保持) / mix: ワントゥワン = 一人一人、セグメント = 集団 (2016h28h-q029 正答エ)。STP 図 3 段は one・detail・pairs[1] と一致 | OK | zh 図ラベルの揺れ **L2 建議修**、en detail の主語 **L4 建議修** | L2, L3, L4, L7 |
| 4 | ポジショニング | OK — exam 2 / 3 題 + mix 1: 競合と比べ差をつける点を明確にする工程 (2018h30a-q002 正答ウ / 2025r07-q035 正答エ) / 評価項目の点数に重みを掛けた合計で比べることがある (2016h28a-q020 正答ウ 8、再計算一致; 「ことがある」で限定) / mix: ターゲティングが先 (STP の標準順)。誤答肢 (ターゲティング・セグメンテーション・プロモーション等) を支持しない | OK | OK | L3, L6 |
| 5 | アンゾフの成長マトリクス | OK — exam 1 / 2 題 + mix 1: 市場浸透 = 既存製品 × 既存市場のセル (2018h30h-q001 正答エ = 既存品の販売員増員 / 2019h31h-q005 正答ア = セル A [既存市場 × 既存製品]; 本文図の配置も同じで A と一致) / mix: 新製品開発 = 製品だけ新、市場開拓 = 市場だけ新。detail「多角化ほど危険が大きいとされる」は通説で正しい | OK | zh「新增」**L2 建議修** | L2 |
| 6 | プロダクトライフサイクル | OK — exam 1 / 1 題 + mix 1: 成長期 = 市場急拡大・競合参入増、改良で差別化 (2009h21h-q031 正答イ; 誤答ウ [成熟期に参入相次ぐ] を支持しない — 参入増は成長期に置く) / mix: PLC は 1 製品の時間変化、アンゾフは製品 × 市場の組で軸が異なる。図 4 段の caption は標準的特徴で、誤答ア (導入期 CF プラス)・エ (衰退期の広告費増大) と矛盾し誤答を支持しない | OK | OK | L6 |

**単元レベル**: goals 3 点・overview_cols 2 (視点・軸 / 主な用途)・overview_rows 6 行・pairs 2 組 (4P / 4C 5 行 key 1、セグメント / ポジショニング 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge 5 題 (本文と矛盾なし、§1-3)。`unit_summary_*` は v1 と同文。事実誤りなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 7 (うち 建議修 3)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1].hook_jp` / `hook_zh` / `hook_en` (+ 派生 `memory_hook_*`, `summary.memory_hooks_*[1]`) | 「P は Producer (作り手) 側…の頭文字と結び付ける」は、4P の P が Product・Price・Place・Promotion の頭文字である (同用語 one・4P one・pairs[0]) ことと食い違う語呂 (jp-review r1 low の未修)。「結び付けると」で記憶の手がかりと読めるので事実誤りには至らず、引用題の誤答 (利益を含む 4 要素等) にも寄らない → 観点 7 の措辞級 | jp before「P は Producer (作り手) 側、C は Customer (顧客) 側の頭文字と結び付けると、どちらがどの視点か取り違えにくい。」→ after「4C は最初の C が Customer (顧客) で、4 語とも顧客の側から見た言葉だと思い出せば、売り手の側の 4P と取り違えにくい。」/ zh before「把 P 与 Producer（生产者）一侧、C 与 Customer（顾客）一侧的首字母联系起来，就不容易弄混哪个是哪种视角。」→ after「4C 的第一个 C 是 Customer（顾客），记住这 4 个词都是从顾客一侧来看的，就不容易和卖方一侧的 4P 弄混。」/ en before "Link the P to the Producer's side and the C to the Customer's side, and the two viewpoints become hard to mix up." → after "The first C in 4C is Customer: remember that all four words are seen from the customer's side, and you will not confuse them with the seller-side 4P." |
| L2 | LOW **建議修** | (a) `overview_rows[4].one_line_zh`、`terms[4].one_zh`、`key_points_zh[2]` (+ 派生 `summary.key_points_zh[2]`); (b) `terms[2].fig.data.nodes[1].label.zh` | (a) 「新增」は追加分の含みで、同単元の図 (新产品 / 新市场) と揺れる (loc-review low の未修)。(b) ターゲティングの zh が図ラベルだけ「选择目标市场」、detail・points[2]・本文は「目标市场选择」(loc-review low の未修) | (a) `overview_rows[4].one_line_zh`「按现有和新增组合」→「按现有与新两类组合」/ `terms[4].one_zh`「分别分为现有和新增并加以组合」→「分别分为现有与新两类并加以组合」/ `key_points_zh[2]`「按产品和市场的现有、新增组合」→「按产品和市场是现有还是新的组合」; (b) `terms[2].fig.data.nodes[1].label.zh`「选择目标市场」→「目标市场选择」 (zh のみ、jp / en 変更なし) |
| L3 | LOW | `pairs[1].rows[2]`、`terms[3].points[2]`、`terms[3].detail_*` 1 文目、`terms[2].fig.steps[2]` | 「ターゲティング (狙う層決定) の後にポジショニング」の順序対比が 4 箇所 (書き方 8: pairs と mix 考点の 2 箇所まで)。goals[1] が「順序で区別」を目標に掲げ、STP 図は 3 段の手順そのもの | 記録のみ (図と pairs は構造、detail の 1 文目は定義の文脈) |
| L4 | LOW **建議修** | `terms[2].detail_en` 3 文目 | "it makes it easier" の it が直前文の buying attitudes にも読める (jp は主語省略で文脈上セグメントマーケティング; loc-review low の未修) | en before "which applies the same plan to the whole market, it makes it easier to put a limited budget" → after "which applies the same plan to the whole market, segment marketing makes it easier to put a limited budget" (jp / zh 変更なし) |
| L5 | LOW | `terms[0].detail_jp/zh/en` 2 文目、`terms[0].hook_*`、`terms[0].points[1]`、`key_points_*[0]` | 「Place は場所でなく届ける経路」が 4 欄で反復 (§9 同義の言い直し)、hook は detail の言い直し (§6)。事実の食い違いなし (jp-review low の未修) | 記録のみ |
| L6 | LOW | `terms[3].points[1].text_*`; `terms[5].fig.steps[1].caption_*` / `terms[5].points[0].text_*` | (a) 重み付け合計の比較は 2016h28a-q020 の題の前提を一般化したもの (数値・社名なし、「ことがある」で限定、写しでも誤りでもない)。(b) 成長期 caption と exam 考点がほぼ同内容 (D-203 考点が図の言い直し) | 記録のみ |
| L7 | LOW | `terms[2].points[0].text_*` (qid 2013h25a-q022) | 引用題 2013h25a-q022 の問う名称はターゲットマーケティングで、本文はこの語を出さずに正答内容 (少数のセグメントに絞る) をセグメントマーケティングの考点として述べる。題は他の誤答 (価値連鎖・PPM・PLC) が明らかに別物で本文から解け、誤答も支持しない。別名を同一物として足すかは用語関係の一次確認が要る | 記録のみ (ターゲットマーケティングは `data/ip/syllabus` にも他単元にも無い。別名を足すなら一次資料確認の上で別途) |

**対比の出現欄 (書き方 8)**: ① 4P = 売り手 / 4C = 買い手: `pairs[0].rows[0]`、各 one・overview_rows (定義そのもの)、4C hook → 許容。② 4P ↔ 4C の要素対応: `pairs[0].rows[1..4]`、4C detail 1 文目 (4C の定義の展開) → 許容。③ セグメント → ポジショニングの順序 → L3。④ セグメント (集団) / ワントゥワン (個人): mix 考点のみ。⑤ 新製品開発 / 市場開拓: mix 考点、detail、hook、図 (図は構造、hook は「何を新しくするか」の手がかり) → 許容。⑥ PLC / アンゾフの軸: mix 考点、goals[2] (予告) → 許容。

確認済みで問題なし: 限定条件 (qid 付き考点 11 件全て保持)、D-208 選択肢なぞり (§1-5、全件非該当)、閉じた列挙 (§1-6)、§9 禁止句 (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤77 字)、D-198 写し (validate 0、独立照合は見出し語・定義の標準表現のみ)、`[[jp:]]` 原語 22 種実在、zh 訳語表 (B6 warn 0)、図種 (table static ×2 / flow steps ×2 / 図なし ×2 = 登録内)、用語・`term_zh`・`term_en` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **7** (建議修 3: L1 / L2 [(a)(b)] / L4; 記録のみ 4: L3 / L5 / L6 / L7) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 6 用語・考点 14 件 (qid 付き 11 件)・引用 18 題で、考点の主張は正答と一致し、誤答肢を支持・なぞる記述はなく、引用題の限定条件の落ちもない。LOW 建議修 (L1 / L2 / L4) は補丁 (B3) で修正推奨、L3 / L5 / L6 / L7 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-03-10-u02
✓ strategy-03-10-u02 unit: 0 issues (data/ip/textbook/units/strategy-03-10-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-03-10-u02
✓ strategy-03-10-u02 parity: 29 locations, 0 diff
EXIT=0
```
