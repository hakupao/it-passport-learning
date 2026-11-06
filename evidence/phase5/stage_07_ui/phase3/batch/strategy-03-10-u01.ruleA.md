# Rule A 全数抽検 — strategy-03-10-u01 (マーケティングの基礎と顧客理解)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S148 第 30 批 b30)、repo HEAD `b250aaee` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b30-u01-a2` (seeded: a1 `jp.r1` + jp-review #2) の merge 結果、sha256 先頭 `79f3ddf29a5ba48c`)。
- **対象**: `data/ip/textbook/units/strategy-03-10-u01.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (市場調査 / 販売・製品・仕入計画 / 顧客満足 / UX / CX / カスタマージャーニーマップ / RFM分析) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`docs/templates/ruleA_unit_audit.md` の既知失敗型 (1)〜(10)。比較: `.planning/v2/strategy-03-10-u01/v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。`summary.key_points_* / memory_hooks_*` も本体と一致。
2. **考点 × 引用題** (考点 4 件 = exam 3 + mix 1、引用 qid 延べ 4 = 異なり 4 題; quiz 枠のみ 2020r02o-q018): `questions.json` + translations `stem_jp_clean` で題文・選択肢・正答を再読 (全題 topic `strategy-03-10`)。
   - 2016h28a-q030 (正答ウ MD; 誤答 ターゲティング / ドミナント戦略 / ロジスティクス)、2021r03-q016 (正答ウ = 店舗など・購入者ニーズに合う形で提供する一連の活動; 誤答 = 市場細分化・標的化 / 物流チャネル管理 / 同一エリア高密度出店) → `terms[1].points[0]` (選定・価格・売り場での見せ方を組み合わせ、買い手の需要に沿った形で提供) は正答と一致。a1 で指摘された「届ける」(物流に読める) は「提供する」に修正済で、誤答 (ロジスティクス) を支持しない。
   - 2015h27h-q024 (正答イ Recency; 誤答 R 始まりの別語 3 つ) → `terms[6].points[0]` は正答の 1 語だけを述べ、誤答の語を並べない。
   - 2016h28a-q032 (分類型「顧客情報で優良顧客を抽出する方法はどれか」、正答イ RFM; 誤答 3C / SWOT / バリューチェーン) → `terms[6].points[1]` は用途の一般定義 (D-209 の分類型免除)。
   - 2020r02o-q018 (正答エ = 利用場面の想定 + 実際の利用で得られる感じ方・反応; 誤答 = アクセシビリティ設計 / CRM / ユーザビリティ [効率よく利用できる能力]) → UX `one_*` と一致。UX `detail` は「使いやすさだけでなく」と明記し誤答ウ (ユーザビリティ) を支持しない。CX の hook「企業との関係」は q018 の誤答イ (CRM) の語に近いが、q018 は UX を問い CX の hook はその場面に当てはめる対象ではない → 型 (8)(9) 非該当。
   - **RFM の数値・例の再検算**: 単元に数値例はない (表は R = 最終購入日 / F = 一定期間の購入回数 / M = 一定期間の購入金額の合計、評価が高い顧客 = 最近 / 何度も / 多く)。`detail` の例「以前は頻繁に多く買っていたのに最近の購入がない = 離れかけ」= F 高・M 高・R 低の解釈で正しい。
3. **quiz / challenge_questions** (quiz 5 枠、challenge 4 題 = 2021r03-q016 / 2020r02o-q018 / 2016h28a-q032 / 2015h27h-q024、全て本文で扱う題): 本文と矛盾なし。
4. **D-198 写し**: validate copy guard 0、`warn choice-echo` 出力なし。独立照合として JP 文字列 115 本 (派生除く) を topic 内 43 題の題文 (stem_jp_clean) + 選択肢と 12 字連続照合 (記号除去) — カタカナ 4 字以上・英数遮蔽ありで **0 件**、遮蔽なしで **2 件 = 全て偽陽性** (`terms[3].one_jp` / `terms[4].one_jp` ↔ 2020r02o-q018 の「UX (User Experience)」= 用語の展開名)。近似照合 (文単位 Dice ≥ 0.4) で本文 ↔ 題のヒットは title の「マーケティング…」のみ (偽陽性)。個別対: UX `one_jp` ↔ q018 エ Dice 0.35 / ed 0.73、MD 考点 ↔ q016 ウ 0.11 / 0.94、↔ q030 題文 0.19 / 0.86、RFM `points[1]` ↔ q032 題文 0.36 / 0.72、UX/CX mix ↔ q018 エ 0.18 / 0.78 — いずれも較正の HIGH 例 (ed 0.14 / Dice 0.52) から遠い。UX one は JIS Z 8530 / ISO 9241-210 の標準定義 (利用・利用の予測で生じる知覚と反応) の言い換えで写しではない。カタカナの多い文 (MD 考点・detail、CJM one・fig、ペルソナ) は目視でも題文の流用なし (q030 の例「陳列・販促キャンペーン」は不使用)。
5. **D-195**: one = 1 文 × 7 (太字あり)、detail 2 文 × 7。図 = 市場調査 flow steps 4 / 販売・製品・仕入計画 table / 顧客満足 table / CJM table (段階 × 行動・考え感情・接点) / RFM table、UX・CX 図なし = 登録内 6 種の範囲。定義前使用: ニーズ・一次/二次データ (市場調査内)、マーチャンダイジング (detail で定義後に考点)、UI (UX detail 内で定義)、接点 (CX detail で定義)、ペルソナ (CJM detail で定義)。§9 禁止句 grep (jp): `freq_badge`「頻出」と fig の「方法を選ぶ」(市場調査の手順の動詞、選択肢の話ではない) のみ → 偽陽性。zh/en 相当語の grep は `points[].kind` の exam / "for example" / "Example" のみ。
6. **D-200**: 考点数 1/1/2 (≤3 ✓)、各 JP 1 文・39〜68 字 (≤100 ✓)。**framing 件数** (`validateV2.pointFraming` を直接実行): jp 0 / zh 0 / en 0。
7. **D-202 / D-203 / D-204 単元全体**: 書き方 7 → UX/CX の範囲 (§3 前回指摘の確認) を含め不整合 0。書き方 8 (UX↔CX の対比): `pairs[0]` と `terms[4].points[0]` (mix) の 2 箇所 + overview 総表 (構造) + goals (予告) → 上限内。書き方 9 → §2。§6 → L3・L4。§9 言い直し → L2。
8. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行の三語一致、`[[jp:]]` 原語 7 種 (市場調査 / 顧客満足 / 販売・製品・仕入計画 / マーチャンダイジング / カスタマージャーニーマップ / ペルソナ / RFM分析) が jp 本文に実在 (全 ok)。UX / CX は見出し語自体がラテン文字で zh/en 本体に「UX」「CX」がそのまま出るため `[[jp:]]` なしで validate 0。zh 訳語は `zh_terms.unit.json` に従う (市场调查 / 销售·产品·采购计划 / 客户满意度 / 用户体验（UX） / 客户体验（CX） / 客户旅程地图 / RFM 分析 / 问卷 / 访谈)。
9. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 市場調査 | OK — 考点なし。一次データ (アンケート・インタビュー・観察) / 二次データ (官公庁統計・業界資料) の区別は標準どおり。flow 4 段 (目的→方法→収集→分析して計画へ) は detail・key_points[0] と一致 | OK (detail 2 文目と図は L2 級の重なり、記録対象外の軽微) | OK | なし |
| 2 | 販売・製品・仕入計画 | OK — exam 1 / 2 題: MD = 選定・価格・売り場での見せ方の組合せで需要に沿って提供 (q030 / q016 正答ウ)。誤答 (ターゲティング・物流・ドミナント) を支持しない。table (販売 = いつ何をどれだけ / 製品 / 仕入) は one と一致 | OK | `one_en` / `goals_en[0]` の "buy in" (loc 指摘済) | L5 |
| 3 | 顧客満足 | OK — 考点なし。期待と実際の価値の比較 (期待不一致モデル)、期待が高いほど満足しにくい、再購入・推奨・改善への利用、いずれも正しい。hook の語源 satis (十分に) は正しい (a2 r1 の「満たす」由来の誤りは修正済)。table 3 行 (上回る / どおり = 満足 / 下回る) は標準 | OK (analogy 空) | OK | なし |
| 4 | UX | OK — quiz 1 題 (q018 正答エ): one「実際に使ったり、使う場面を思い描いたりすることで生じる受け止め方や反応」が正答と一致、誤答ウ (ユーザビリティ) は detail「使いやすさだけでなく」で否定側。UI = UX を左右する要素の一つ、正しい。hook は X = Experience の表記のみで、利用者の時期による区別を含まない | OK | OK | L1・L6 |
| 5 | CX | OK — mix 1: UX = 利用 (想定を含む) / CX = 認知から購入後までの企業との全接点。one は「購入・利用を経て」で利用も含め、UX と排他にしない。detail の接点例は「など」付き (型 (10) 非該当)。analogy (ホテル: 部屋だけでなく予約・受付・事後連絡) は one と同じ範囲 | OK | OK | L2 (mix 言い直し)・L3 (hook) |
| 6 | カスタマージャーニーマップ | OK — 考点なし。one (段階ごとの行動・考え・感情と接点を時間順) に対し、図は段階 4 列 × 行動 / 考え・感情 (key) / 接点の 3 行の静的表で、定義の要素が全て見える (a1 jp-review #1 MEDIUM 解消)。ペルソナを一人決める・CX 改善の手掛かり、正しい | OK | en key 行セルが「不満」を落とす | L4・L7 (建議修) |
| 7 | RFM分析 | OK — exam 2 / 2 題: R = Recency・最近ほど高評価 (q024 正答イ)、購買データで優良顧客を見つける (q032 正答イ、分類型の一般定義)。表・detail の例を再検算し正しい。key_points[3]「優良顧客の抽出**など**」で用途を閉じない | OK | OK | L2 |

**単元レベル**: goals 3 (goals_jp[1] に「(想定を含む)」が入り a2 r1 の low も解消)・overview_cols 1・overview_rows 7・pairs 1 組 (UX / CX 2 行: 体験の範囲 [key] / 例)・key_points 4・summary (本体と一致)・challenge 4 (§1-3)。事実誤りなし、三語一致。

**前回 attempt の HIGH / MEDIUM の解消確認 (三語)**:
- a1 jp-review #1 MEDIUM `terms[5].fig` (CJM が段階の矢印だけの流れ図) → 現在は table、行 = 行動 / 考え・感情 / 接点、jp・zh・en の全 15 セル + 列見出し 5 が揃う → **解消**。
- a1 jp-review #2 MEDIUM `pairs[0].rows[1]` (「体験する人」行で UX = 利用者、購入前は CX だけ) → 当該行は削除、rows = 体験の範囲 / 例。`rows[0].a_*` = jp「(想定を含む)」/ zh「（含设想）」/ en "(including imagined use)"、mix 考点も zh「或设想使用场景」/ en "or imagining its use" で想定を保持 → **解消**。
- a2 jp-review #1 MEDIUM `terms[4].hook` / `terms[3].hook` (U = User / C = 利用者になる前から、で時期による区別) → 現 UX hook は X の表記のみ、CX hook は「企業との関係 → 全接点」で時期を手掛かりにしない。zh / en も同じ (en "You only become a customer through a relationship with a company") → **解消**、回帰なし。
- UX が実際の利用者に限られると読める箇所を全欄で再走査: `overview_rows[3]`「人が得る体験」、UX `one`「人に生じる」、`detail`「利用者が直接触れる部分は UI」は UI の定義で UX の範囲を限らない → 0 件。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 7 (うち 建議修 1)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW 記録のみ | `terms[3].one_jp/zh/en`、`overview_rows[3]`、`pairs[0].rows[0].a_*` | q018 正答・JIS 定義は「製品、システム、サービスなど」。単元は「製品やサービス」(jp の「や」は非網羅だが en "a product or service" / zh「产品或服务」は閉じた二択に読める)。システムは製品・サービスに含めて読め、どの誤答も支持しないので範囲を閉じる実害なし | 記録のみ |
| L2 | LOW 記録のみ | `terms[4].points[0]`、`terms[6].points[0]` | mix 考点は UX / CX の one と pairs rows[0] の言い直し、RFM `points[0]` は one・図 R 行の言い直し (D-203 §9)。事実は正答と一致 | 記録のみ |
| L3 | LOW 記録のみ | `terms[4].hook_*` | 「顧客という立場は企業との関係の中で生まれる → 全接点」は定義への結び付けで、語源・字形・対比の別の手掛かりになっていない (D-203 §6) | 記録のみ |
| L4 | LOW 記録のみ | `terms[5].analogy_*` / `terms[5].hook_*` | 比喩 (旅のしおり) と hook (journey = 旅、旅程表) が同じ旅の像を 2 回使う。「しおり」は通常出発前の予定表で、旅の間の気分を書き込む描写と少し噛み合わない | 記録のみ |
| L5 | LOW 記録のみ | `terms[1].one_en`、`goals_en[0]`、`overview.intro_en` | 「仕入れる」= "buy in" は "buy-in" (賛同) と紛れやすく、見出し語訳 procurement と揃わない (loc-review 指摘済) | 記録のみ |
| L6 | LOW 記録のみ | `pairs[0].rows[1].a_*` | UX の例「アプリの操作が快適で目的をすぐ果たせた」は効率面に寄り、q018 誤答ウ (ユーザビリティ) の像に近いが、jp「快適」zh「顺手」は体験側の語で、detail「使いやすさだけでなく」が範囲を示す → 型 (6)(9) の誤答誘導には至らない | 記録のみ |
| L7 | LOW **建議修** | `terms[5].fig.data.rows[1].cells[4].en` | key 行 (考え・感情) の jp「楽しいが、予約変更が面倒で不満」/ zh「上课开心，但改约麻烦，感到不满」は「不満」を明示するが、en は感情語を落とす。detail「不満を感じたりする接点が見え」に対応する図の要点 (loc-review 指摘) | en "Enjoys it, but changing bookings is a hassle" → "Enjoys it, but frustrated that changing bookings is a hassle" (jp・zh は変更なし) |

**対比の出現欄 (書き方 8)**: UX = 利用 (想定を含む) / CX = 全接点: `pairs[0].rows[0]` (key)、`terms[4].points[0]` (mix) → 2 箇所、上限内。overview 総表の extra 列は D-195 §3 の構造、`goals_jp[1]` は予告で数えない。UX hook の「CX の X も同じ」は表記の共通点で対比ではない。

確認済みで問題なし: 限定条件 (考点 4 件全て保持、key_points[3] の「など」保持)、§9 禁止句 (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200、D-198 (validate 0・独立照合は偽陽性 2 件のみ・近似照合で接近なし)、D-205 / D-210 (改訂文書の構成数・改正前提の題なし)、型 (1)〜(10) 該当 0、`[[jp:]]` 原語 7 種、zh 訳語表、図種 (登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、前回 MEDIUM 3 件の三語解消。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **7** (建議修 1: L7 / 記録のみ 6: L1〜L6) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 7 用語・考点 4 件・引用 4 題 + quiz のみ 1 題で、考点の主張は正答と一致し、誤答肢を支持する記述・写し・限定条件落ちは無い。前回 attempt (a1 ×2) と a2 r1 の MEDIUM は三語とも解消し回帰なし。LOW 建議修 1 件 (L7) は補丁 (B3) で修正推奨、L1〜L6 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-03-10-u01
✓ strategy-03-10-u01 unit: 0 issues (data/ip/textbook/units/strategy-03-10-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-03-10-u01
✓ strategy-03-10-u01 parity: 30 locations, 0 diff
EXIT=0
```
