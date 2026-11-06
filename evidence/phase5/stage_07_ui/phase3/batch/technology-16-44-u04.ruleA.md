# Rule A 全数抽検 — technology-16-44-u04 (経済性評価)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S148 b29)、repo HEAD `a7987a84` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b29-u04-a1` merge 結果、sha256 先頭 `c450b5939f51544a`)。
- **対象**: `data/ip/textbook/units/technology-16-44-u04.json` (textbook-unit-v2)、用語 **3 / 3 = 全数** (初期コスト / 運用コスト / TCO) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-210、テンプレ既知失敗型 (1)〜(10)。比較: `data/ip/textbook/.planning/v2/technology-16-44-u04/v1-original.json` (用語 3 語・`term_zh`・`term_en` とも v1 と一致)。journal `journal.b29-u04-a1.jsonl` の result 行 (jp r0 / jp-review r1 PASS / loc r0 / loc-review r1 REVISE / loc r1 / loc-review r2 PASS)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・手がかりが引用題の誤答肢を選ばせる / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 3 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (cols・cells)/ quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 6 件 = exam 5 + mix 1、引用 qid 5 題 = topic 内の TCO 関連全 5 題)**: `data/ip/quiz/questions.json` (+ translations の stem_jp_clean: 2015h27a-q053 は OCR 欠損「TC0」「ac」を clean 版で判断、2016h28h-q022 は表の列見出し・「記載のない条件」を clean 版で判断) から題文・選択肢・`correct_answer` を再読。
   - **計算の再計算 (2016h28h-q022、正答ウ)**: 10 年総額 A = 4 億 + (500 万 + 200 万) × 10 = 4.7 億 / B = 2 億 + (2 億 × 15%) × 10 = 5.0 億 / C = 5,000 万 + (4,000 人 × 1 万 + 300 万) × 10 = 4.8 億 → B > C > A = ウ、一致。初期費用最安の C が総額最安ではなく、初期費用最高の A が総額最安 → 考点「初期の費用が最も安い案が、総額でも最も安いとは限らない」と式「初期 + 年間 × 年数」を支持。
   - **図の再計算 (`terms[2].fig`)**: X = 100 + 60 × 5 = 400 万円、Y = 250 + 20 × 5 = 350 万円 → Y が安い (key 行 = Y、正)。en 1 + 0.6 × 5 = 4 / 2.5 + 0.2 × 5 = 3.5 million yen、zh 同値。損益分岐 100 + 60n = 250 + 20n → n = 3.75 年 (5 年なら Y 有利、detail の「年数の中で総額が逆転」と整合)。数値・案の数・年数とも q022 と異なり自作 (B 案の「初期費用の 15% (運用・保守合算)」も再現していない)。
3. **quiz / challenge_questions**: 本文の quiz 計 5 枠 (重複込み) と challenge 5 題は全て引用題と同一で、未引用の題なし。本文と矛盾しないことを §2 で確認。
4. **D-198 写し**: validate の copy guard = 0 件 (choice-echo warn 0)。独立照合として単元の JP 文字列 64 本 (派生除く) を topic 内全 46 題の題文 + 選択肢と 12 字連続照合 (句読点・記号・空白除去): カタカナ 4 字以上・英数遮蔽ありで **0 件**、遮蔽なしで **1 件** = `terms[2].one_jp` ↔ 2010h22h-q084 の略語展開「TCO (Total Cost」(用語名の正式名称で表現ではない → 偽陽性)。近似照合 (文単位 SequenceMatcher ≥0.5): 上記の展開 1 件 (0.53) のみ。カタカナの多い文 (hook 3 本、one 2 本の別名) を目視 — 題の文言ではない。(iii) 判定は §2 / L4・L5。
5. **D-195**: one = 1 文 × 3 (太字あり)、展開 2 文 × 3、比喩 (家具代 / 光熱費・修繕費 / 家電の電気代込み比較) とフック (initial / running / Ownership の語源) は定義の言い換えでなく別の手がかり、定義前使用 (TCO は u04 冒頭の総表で一行定義済み、運用コスト points[0] で用語節前に使用 — jp-review L 記録済み、実害小)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が): `freq_badge`「頻出」と `terms[1].hook_jp`「と覚える」(+ 派生 2) のみ — 記憶フックの言い方 (前例どおり記録なし)。zh / en の grep ヒット (exam = points.kind、Examples = 列名) は偽陽性。図の型: TCO = static table (登録内)、初期 / 運用 = 図なし。pair 配置: 初期コスト↔運用コスト は運用コストの後、key 行あり。
6. **D-200**: 考点数 1 / 2 / 3 (≤3 ✓)、JP 文数 1〜2、字数 48〜79 (≤100 ✓、最大 `terms[2].points[1]` 79 字)。framing 件数 (validate `pointFraming`): jp 0 / zh 0 / en 0 (validate 0 issues)。
7. **D-202 / D-203 単元全体**: 書き方 7 → M1 / L2。書き方 8 (対比の出現欄) → 下記列挙。書き方 9 (限定条件) → §2、落ち 0。D-205: 改訂文書の構成要素数の記述なし。D-210: 法令・規格改正に関わる引用題なし。
8. **三語**: zh / en が jp と同じ事実か、図セル・比較行の三語一致、`[[jp:]]` 原語 5 種 (初期コスト / イニシャルコスト / 運用コスト / ランニングコスト / 総所有コスト) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 3 用語とも見出し語の `[[jp:]]` あり、zh 訳語は `zh_terms.json` (初期コスト→初期成本、運用コスト→运行成本、TCO→TCO) に一致 (B6 warn 0)。
9. **前回指摘の解消**: loc-review r1 MEDIUM (図 en の単位不統一) → 現行 `1 + 0.6 × 5 = 4 million yen` / `2.5 + 0.2 × 5 = 3.5 million yen` で **解消**、回帰なし。r1 LOW: zh mix 考点の併記 (解消)、zh points[0] の [[jp:総所有コスト]] (削除済)、key_points_zh[3]「角度」(解消)、key_points_zh[1]「使用期」(解消)、en points[0]「adding to it」(解消)、detail_zh「负责运维的人员」(解消)。r2 LOW のうち残存: detail_zh「被反超」(→ L1 建議修)、points[0]/[1] の [[jp:運用コスト]] 二重併記・one_zh「运营成本」・key_points_en[3]「Cost-effectiveness」(→ L6 記録のみ)。jp-review r1 LOW 7 件は全て記録のみの性質で、本監査で L2 / L3 / L5 として扱う。
10. **機械ゲート**: §6。

## 2. 用語別判定 (3 / 3)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 初期コスト | OK — exam 1 / 1 題: 初期コストは TCO の一部で、TCO = 初期 + 導入後の運用・管理の費用 (2010h22h-q084 正答ウ = 導入時の費用と導入後の運用・管理費の総額; 誤答 = 導入後のみ / 障害対応費のみ / 導入時のみ を支持しない)。正答内容を見出し語の定義として述べる型で (iii) に当たらない。detail の例 (機器・ソフト購入、開発、設置・初期設定) は標準 | OK | OK | L3 (hook) |
| 2 | 運用コスト | exam 1 / 1 題 + mix 1: TCO が重視されるようになった理由 = 総コストに占める稼働後の費用の比重の増大 (2021r03-q100 正答イ、誤答ア [逆向き] を支持しない)。ただし考点は「導入時の費用**より大きくなった**」と水準の逆転まで言い、題の正答は「初期費用に比べて割合が**増大した**」(変化) のみ → L4。mix: 同じ機器でも購入代金 = 初期、保守契約料 = 運用、軸は一度きりか継続か — 正しい。**定義の範囲**: one / overview / goals / pairs / mix 考点がいずれも時期・回数だけで運用コストを規定し、「システムの運用・維持のための費用」という限定を欠く → 2019r01a-q096 (quiz にも入る) の誤答項目 (システムで扱う商品の仕入高・配送費 = 稼働中に継続発生) が運用コストに読め、TCO detail「初期 + 運用の合計」と結ぶと TCO に入る → **M1** | OK | one_zh「运营成本」 L6 | **M1**, L4, L6 |
| 3 | TCO | exam 3 / 3 題: (a) 直接支出だけでなく利用者教育のような付随費用も含む (2015h27a-q053 正答イ = a・b・c 全部; 全正解型。項目の組・順序は再現せず、c の語「利用者教育」を「利用者の教育」としてほぼそのまま 1 項目だけ例に使う → L5) / (b) 導入・稼働維持のための費用かで決まり、システムで行う業務の取引そのものの費用は含まない (2019r01a-q096 正答エ = ③④ 保守費; 誤答項目 ①② [仕入高・配送費] の語・組・順序は再現せず、正の基準を一般原則として先に述べる → (iii) に当たらない。jp-review と同判断) / (c) 総額 = 初期 + 年間 × 年数、初期最安 ≠ 総額最安 (2016h28h-q022 正答ウ、§1-2 再計算一致)。限定条件: q022 の「記載のない条件 (除却費・更改費用等) は考慮しない」は考点 (c) の式の前提と矛盾せず。「導入から廃棄まで」と算出「初期 + 運用」の範囲差 (廃棄費用の帰属が不明) → L2。図 table 再計算一致 | OK | detail_zh「被反超」 L1 | L1, L2, L5 |

**単元レベル**: goals 3 点・overview_cols 2・overview_rows 3 行・pairs 1 組 (4 行、key 1)・key_points 4 (派生 summary と一致)・challenge 5 題 (全て本文引用題)。key_points[1]「期間が長いほど年間の費用の差が総額に効く」は図 (n = 3.75 年で逆転) と整合。key_points[2]「導入や維持のために生じた費用かどうか」は terms[2].points[1] と同じ基準 (L2 の対象)。key_points[3] 経済性 = 性能・信頼性と並ぶ観点 は topic objective (性能・信頼性・経済性) と一致。事実誤りなし。

**対比の出現欄 (書き方 8)**: ① 一度だけ / 継続: `goals_jp[0]` (予告)、overview_rows[0..1] (総表の構造)、各 one (定義)、`pairs[0].rows[0]`、`terms[1].points[1]` (mix) → pairs + mix の 2 箇所で許容。② 期間が延びると 初期 = 不変 / 運用 = 累計増: `pairs[0].rows[3]`、`terms[1].detail` 2 文目 → 運用側の片側のみ detail、許容。③ 初期が安くても総額で逆転: `terms[2].detail_jp` 2 文目、`terms[2].points[2]` 2 文目、`key_points_jp[1]` 2 文目の 3 箇所 → L7 (jp-review と同判断)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 7 (うち 建議修 2)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[1](運用コスト).one_jp` / `one_zh` / `one_en` (派生 `definition_*` は自動追従) | 既知失敗型 (9) / (10) / 書き方 7: 運用コストを「稼働している間、継続して発生する費用」と時期・回数だけで定義し、同じ軸が goals[0]・overview_rows[1]・pairs[0].rows[0]・mix 考点「分ける軸は、一度きりか継続するか」で繰り返される。この手がかりを 2019r01a-q096 (運用コストの quiz 枠) の誤答項目 (販売管理システムで扱う商品の仕入高・配送費 = 稼働中に継続して発生) に当てると運用コストに分類され、TCO detail「初期コストと運用コストを合計」と結んで TCO に含める誤答 (①を含む ア / イ) に向く。正すのは `terms[2].points[1]` の 1 欄のみ。v1 定義にあった「維持や運用にかかる」の限定が v2 で落ちた | jp「**運用コスト**は、システムが稼働している間、継続して発生する費用で、**ランニングコスト**とも呼ぶ。」→「**運用コスト**は、システムが稼働している間、その運用や維持のために継続して発生する費用で、**ランニングコスト**とも呼ぶ。」/ zh「**运行成本** [[jp:運用コスト]] 是系统运行期间持续发生的费用，也叫**运营成本** [[jp:ランニングコスト]]。」→「**运行成本** [[jp:運用コスト]] 是系统运行期间为运行和维护系统而持续发生的费用，也叫**运营成本** [[jp:ランニングコスト]]。」/ en "**Operating cost** [[jp:運用コスト]] is money that keeps being spent for as long as a system is running; it is also called **running cost** [[jp:ランニングコスト]]." → "**Operating cost** [[jp:運用コスト]] is money that keeps being spent to run and maintain a system for as long as it is in use; it is also called **running cost** [[jp:ランニングコスト]]." (overview_rows[1].one_line_* は総表の一行要約で、M1 修正後の one が直後に来るため変更不要) |
| L1 | LOW **建議修** | `terms[2](TCO).detail_zh` | 既知失敗型 (6) 寄り: 「导入价格便宜的方案…总额也可能被反超」は、主語 (安い案) が他案に「追い越される」= 総額で上回られる (= 安いまま) とも読め、jp「総額が逆転する」(安い案の総額がかえって高くなる) と逆向きに取れる。en "can end up costing more" は明確。loc-review r2 の LOW が未反映 | zh「导入价格便宜的方案，如果每年的费用较高，在使用年限内总额也可能被反超，因此多个方案要按总额来比较。」→「导入价格便宜的方案，如果每年的费用较高，在使用年限内总额也可能反而更高，因此多个方案要按总额来比较。」 |
| L4 | LOW **建議修** | `terms[1](運用コスト).points[0].text_jp` / `text_zh` / `text_en` | 引用題の支持を超える一般化: 2021r03-q100 正答イは「初期費用に比べて運用費の割合が増大した」(変化) で、考点の「導入時の費用より大きくなった」/「超过了导入时的费用」/ "grew larger than the share paid at introduction" (運用費 > 初期費の水準逆転) までは言っていない。一般論としては誤りではないため LOW | jp「システムの総コストの中で、稼働後に払い続ける費用の比重が導入時の費用より大きくなったことが、TCO で総額を見るようになった理由である。」→「システムの総コストの中で、稼働後に払い続ける費用の比重が導入時の費用に比べて増したことが、TCO で総額を見るようになった理由である。」/ zh「在系统总成本中，运行后持续支付的费用 [[jp:運用コスト]] 所占比重超过了导入时的费用，这正是人们开始用 TCO 看总额的原因。」→「在系统总成本中，运行后持续支付的费用 [[jp:運用コスト]] 所占比重相对导入时的费用有所上升，这正是人们开始用 TCO 看总额的原因。」/ en "Within a system's total cost, the share paid continuously after it goes live [[jp:運用コスト]] grew larger than the share paid at introduction, and that is why people began looking at the total through TCO." → "Within a system's total cost, the share paid continuously after it goes live [[jp:運用コスト]] grew relative to the share paid at introduction, and that is why people began looking at the total through TCO." |
| L2 | LOW | `terms[2].one_jp` ↔ `terms[2].detail_jp` / `terms[2].points[1]` / `key_points_jp[2]` / `overview_rows[2].extra_jp[1]` | 範囲「導入から廃棄まで」に対し、算出「初期 + 運用」と判定基準「導入や稼働の維持のため」は廃棄時の費用の帰属を書かない。`pairs[0].rows[1].b_jp`「稼働開始から廃棄まで」で期間は覆われ、2010h22h-q084 正答ウ (導入時 + 導入後の運用・管理費) と一致し、廃棄費用そのものを問う題は topic 内に無い → 不整合ではなく欠落 (jp-review と同判断) | 記録のみ (任意: points[1]「導入や稼働の維持のために」→「導入・稼働の維持・廃棄のために」、zh「为了导入系统或维持系统运行」→「为了导入、维持运行或报废系统」、en "to introduce the system or keep it running" → "to introduce, keep running, or dispose of the system") |
| L3 | LOW | `terms[0].hook_jp/zh/en` | initial = 名前の頭文字 (initials) と同じ語、は英語の知識を前提にし、「初期コストの頭文字」と誤読されうる (jp-review 観点 3) | 記録のみ |
| L5 | LOW | `terms[2].points[0].text_jp/zh/en` | (iii) 判定: 全正解型 2015h27a-q053 の項目 c「利用者教育に関わる費用」の語を「利用者の教育のように」としてほぼそのまま 1 項目例示。項目の組 (a 消耗品費・b 初期費用・c 利用者教育) と順序は再現せず、直接支出 / 付随費用という一般的範囲説明 (D-209 免除内)。1 項目の語の再現は LOW | 記録のみ (任意: 「利用者の教育」→「操作の問い合わせ対応」等の題に無い例。ただし付随費用の代表例として利用者教育は標準的) |
| L6 | LOW | `terms[1].points[0].text_zh/en` と `points[1]` の [[jp:運用コスト]] 二重併記、`terms[1].one_zh`「运营成本」、`key_points_en[3]` "Cost-effectiveness (economy)" | loc-review r2 の LOW 残存。いずれも誤学習には至らない | 記録のみ |
| L7 | LOW | `terms[2].detail_jp` 2 文目 / `terms[2].points[2]` 2 文目 / `key_points_jp[1]` 2 文目 | 「初期が安くても総額で逆転しうる」の同義反復 3 箇所 (D-203 §9 / 書き方 8) | 記録のみ |

確認済みで問題なし: 計算 (q022 再計算 A 4.7 億 / B 5.0 億 / C 4.8 億 → ウ、図 400 / 350 万円)、限定条件 (考点 6 件、落ち 0)、§9 禁止句 (定型締め句 0)、framing 0/0/0、D-197 (validate 0)、D-200 (≤2 文・≤79 字)、copy (validate 0、独立照合は略語展開の偽陽性 1 件のみ)、`[[jp:]]` 原語 5 種実在、one_zh / one_en 併記 3/3、zh 訳語表一致、図種登録内、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、前回 MEDIUM (図 en 単位) 解消・回帰なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **7** (建議修 2: L1 / L4、記録のみ 5: L2 / L3 / L5 / L6 / L7) |

## 5. 判定

**FAIL → B3 補丁で解消可能** (D-199: MEDIUM 1)。M1 (運用コスト one の「運用や維持のために」の限定落ち) を三語で補丁し、L1 / L4 を同時に適用すれば、構造変更なしで HIGH 0 / MEDIUM 0 になる見込み。補丁後は validate / parity を再実行すること。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-16-44-u04
✓ technology-16-44-u04 unit: 0 issues (data/ip/textbook/units/technology-16-44-u04.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-16-44-u04
✓ technology-16-44-u04 parity: 17 locations, 0 diff
EXIT=0
```
