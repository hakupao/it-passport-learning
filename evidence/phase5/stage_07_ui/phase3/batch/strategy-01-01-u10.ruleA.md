# Rule A 全数抽検 — strategy-01-01-u10 (社会変革とDX・GX)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / reviewer / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 補丁の試し適用は scratchpad の複製で実施)。
- **Date**: 2026-11-06 (b22、run `b22-u10-a1`)、repo HEAD `eb783aa6` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `.planning/v2/strategy-01-01-u10/merged.json` と同一 [cmp]、sha256 先頭 `11f7f201feff3f27`)。
- **対象**: `data/ip/textbook/units/strategy-01-01-u10.json` (textbook-unit-v2)、用語 **8 / 8 = 全数** (第4次産業革命 / Society5.0 / 超スマート社会 / データ駆動型社会 / DX / デジタルトランスフォーメーション / GX / グリーントランスフォーメーション) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205、D-208 (失敗型の明示点検 (1)〜(7))、D-209 ((iii) の免除 2 型)、D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。追加点検 (依頼): b21 u05 M1 型 (比喩・フックの鍵語が他の見出し語の語幹 / 単元内で別に定義される役割を名指す → 引用・quiz 題の誤答肢へ読みが寄れば MEDIUM)、D-205 (DX / GX / Society 5.0 の政府文書由来の定義の構成要素の名称・数に版か「例えば」)。比較: `v1-original.json` (用語 8 語・`term_zh`・`term_en`・`title_*`・`unit_summary_*` が v1 と一致 [スクリプト]; challenge は v1 の 5 題 [2009h21h-q022 / 2010h22a-q005 / 2010h22h-q016 / 2011h23a-q001 / 2011h23tokubetsu-q008 = 他単元の用語] → 本単元の用語の題 5 題 [2022r04-q018 / 2023r05-q035 / 2023r05-q011 / 2026r08-q006 / 2024r06-q029]、u01 と同じ置換)。
- **過去の審査**: `journal.b22-u10-a1.jsonl` (jp r0 → jp-review #1 REVISE [medium 4 / low 9] → r1 → jp-review #2 PASS [low 10] → loc r0 → loc-review #1 PASS [low 5])。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・D-198 (iii)・zh / en の語が誤答肢の読みに寄る (b18 u05 型)・D-205 版なしの言い切り / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え; 一致断片は 12 字以内)。

## 1. 方法

1. **全文読み取り**: 8 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.*`) は validate の compat 検査で本体と一致 (0 issues)。
2. **考点 × 引用題 (考点 全 12 件 = exam 3 + mix 9、qid 付き 3 件、引用 qid 延べ 4 = 異なり 4 題)** + quiz / challenge の未引用 1 題 (2024r06-q029): `data/ip/quiz/questions.json` と translations sidecar (zh / en、2023r05-q011 は `stem_jp_clean`) から題文・選択肢・`correct_answer` を再読 (全題 topic `strategy-01-01`)。正答との一致・誤答肢の不支持・一般化 / 限定の有無・限定条件 (「など」) を 1 件ずつ確認 (§2)。
3. **D-198 写し**: validate copy guard = 0 (`warn  choice-echo` 行の出力なし)。独立照合: 単元 JP 文字列 123 本 (派生除く、図ラベル・caption・総表・対比表含む) × topic 内全 62 題の題文 (`stem_jp_clean` 優先) + 選択肢、句読点・記号除去後 12 字連続一致を (a) カタカナ 4 字以上・英数を □ に遮蔽 (遮蔽後の実字 6 未満の窓は除外) → **0 件**、(b) 遮蔽なし → 6 系列ヒット、**全て見出し語・題の選択肢語そのもの** (デジタルトランスフォーメーション ×5 欄 [`terms[5].one_jp`・`points[0]`・`terms[7]` の「トランスフォーメーション」・`key_points_jp[4]`]、デジタルディスラプション [`terms[4].points[1]`]) = 用語名で表現ではない → 偽陽性。(c) 1〜2 字置換の近似一致 (12 字窓、ハミング距離 ≤2) 30 件 = 全て「グリーン / デジタル + トランスフォーメーション」「〜ションは / 〜ションに」の用語名の変形 → 偽陽性。(d) 文単位の近さ (Dice / 正規化編集距離) — 校正値 HIGH 例 ed 0.14 / Dice 0.52 に対し、引用題に最も近い本文の文は `terms[4].points[0]` ↔ 2026r08-q006 正答 (ed 0.74 / Dice 0.29)・↔ 2023r05-q011 題文 (ed 0.72 / Dice 0.22)、`terms[0].points[0]` ↔ 2023r05-q035 正答 (ed 1.00 / Dice 0.03)、`terms[0].points[1]` ↔ 2022r04-q018 正答 (ed 0.91 / Dice 0.04)、`terms[4].points[1]` ↔ 2024r06-q029 題文 (ed 0.83 / Dice 0.17)、図 caption 第2次 ↔ q018 エ (ed 0.90 / Dice 0.13)・第3次 ↔ q018 ウ (ed 0.93 / Dice 0.24) → いずれも写しの水準に遠い。Dice ≥0.40 の文 5 件は全て用語名だけの選択肢 (「デジタルトランスフォーメーション」1 語) との一致。(e) カタカナの多い文 (デジタイゼーション / デジタライゼーション / マスカスタマイゼーション / デジタルディスラプション / サイバーフィジカルシステム を含む文) を目視 → 題の語句の流用なし。
4. **D-208 (iii) 選択肢の組の点検**: §4。
5. **D-195**: 結論先行 (one = 1 文 × 8、太字あり)、展開 2〜3 文 (2/3/2/2/3/2/3/2 文)、比喩・フック (§6 → L1・L3・L10)、定義前使用 (IoT・AI = 第4次 one; サイバー空間・フィジカル空間 = Society5.0 detail 1 文目; インダストリー4.0 = 第4次 detail; マスカスタマイゼーション = 考点内で同格説明; CPS = データ駆動型 detail; デジタイゼーション・デジタライゼーション = DX 図 caption; デジタルディスラプション = 考点内; カーボンニュートラル = GX detail [総表 `overview_rows[6].extra_jp[1]` が先に出る → L12])、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が / ポイント / 注意 → `overview.freq_badge`「頻出」と `terms[4].detail_jp` + 派生 `explanation_jp` の「始まりとされる」2 件のみ。後者は起源の帰属 [Stolterman 2004] を述べる通常の用法で定型締め句ではない → 0。「〜と覚える」0。zh grep [考 / 问 / 题 / 选 / 正确] ・en grep [exam / test / question / correct / answer / option / choice] → 考点の本文ヒット 0、"exam" 3 件は `points[].kind` の値)、図の型 (第4次 = flow steps 4、Society5.0 = flow static 5 ノード、データ駆動型 = flow steps 4、DX = flow steps 3; 他 4 用語 = 図なし [jp-review #1 M の GX 飾り図は r1 で削除済み]; 全て登録内)、pair 配置 (第4次↔Society5.0 は Society5.0 の後、DX↔GX は GX の後、各組 key 行 rows[0] あり)。D-197 羅列: validate 0。
6. **D-200**: 考点数 3/1/1/1/2/1/2/1 (≤3 ✓)、各 JP 1 文・45〜78 字 (≤100 ✓、最大 `terms[0].points[1]` 78 字)。**framing 件数** (validateV2 `POINT_FRAMING` の jp / zh / en パターンで全考点を照合): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 / D-204 単元全体点検**: 書き方 7 (「〜だけ」「〜ではない」の照合: GX `points[0]`「成長をあきらめることとは違う」・`points[1]`「完全になくすことではなく」は one・detail と一致; データ駆動型 `points[0]`「経験や勘だけに頼って」は one と整合; 第4次 `points[0]`「製造業に限らず」は `points[1]` [インダストリー4.0 = 工場の側] と両立) → 不整合 (MEDIUM 級) 0、措辞級 L2・L3・L8。書き方 8 → §3 末尾の列挙。書き方 9 → §2 表に考点ごとに記載、落ち 0。§6 / §9 → L10。D-204: 比喩の像と考点・detail → L1 (第4次)・L3 (グリーン) 以外は矛盾なし (写真店 = 商売そのものの作り変えで DX one と一致し、2024r06-q029 の「既存構造の破壊」の像を持たない; ガソリン車の町 = GX one の転換 + 成長と一致; エンジン = データ駆動型 one と一致; 章立て = Society5.0 detail の 5 番目と一致)。
8. **D-205 / D-210**: §5。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、図ラベル・caption・総表・対比表の三語一致、`[[jp:…]]` 原語 16 種 (第4次産業革命 / 第3次産業革命 / インダストリー4.0 / マスカスタマイゼーション / Society5.0 / サイバー空間 / フィジカル空間 / 超スマート社会 / データ駆動型社会 / サイバーフィジカルシステム / デジタイゼーション / デジタライゼーション / デジタルディスラプション / デジタルトランスフォーメーション / カーボンニュートラル / グリーントランスフォーメーション) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` 6/8 + DX・GX は仮名・漢字を含まない見出し語で平文を受け付ける規則 (`validateV2.ts` `hasJpOrigin`) により適合 = 8/8、zh 訳語が `zh_terms.unit.json` に従うこと (第四次工业革命 / 超智能社会 / 数据驱动型社会 / DX（数字化转型） / 数字化转型 / GX（绿色转型） / 绿色转型 / 网络空间 / 碳中和 / IoT（物联网） / 大数据 一致、B6 warn 0 / jp-origin warn 0)。D-208 (5) 退行: jp-review #1 の MEDIUM 4 件の修正 (第4次 `points[0]`・`points[1]`・detail、`pairs[0].rows[2].a`、GX 図削除) は zh / en とも r1 の内容で一致、退行なし。D-208 (6): 引用 5 題の誤答肢の zh / en 訳 (sidecar) と本文 zh / en を突き合わせ — 第3次の zh「用计算机实现工厂生产自动化」は q035 イ zh・q018 ウ zh を 3 次の正の定義として述べる側で第4次の読みに寄らない; DX 図 zh「数字化（信息）」は q006 ウ zh (模拟信号→数字信号) と同じ段を DX と別段として描く (jp と同型、L11) → 誤答肢寄りの訳 0。
10. **機械ゲート**: §9 に出力全文 (補丁案の試し適用後も 0 issues / 0 diff、独立 copy 照合の新規ヒット 0 を確認)。

## 2. 用語別判定 (8 / 8)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 第4次産業革命 | OK — exam 2 / 2 題: 中心はつながったモノのデータを AI が分析して生かすこと、影響は製造業に限らず社会全体 (2023r05-q035 正答ア = 生活の様々な領域でネットと AI によるサービスの自動化・質向上; 誤答イ・ウ・エ = 第3・2・1 次。考点は正答の分野例・手段・効果の並びを再現しない [jp-review #1 M 解消]) / インダストリー4.0 で工場がデータでつながりマスカスタマイゼーションが進む (2022r04-q018 正答ア = 顧客ごとの個別仕様品を IT で低コスト・短納期; 考点は題の枠組み「〜から顕著になった取組」と 3 要素の並びを使わず一般名称で述べる [#1 M 解消])。mix: 第3次 = コンピュータで工場自動化 / 第4次 = データと AI → 両側とも正の定義 (§4)。detail (ドイツ政府 2011 年のインダストリー4.0)・図 caption の世紀 (18 世紀後半 / 19 世紀後半 / 20 世紀後半) は標準的事実で正しい。限定条件: 引用題に「など」等なし | OK (図 steps 4) | OK | L1 / L7 / L10 |
| 2 | Society5.0 | OK — mix 1: 「5.0」は狩猟社会から数えて 5 番目、第4次の「4」とは数え方の起点が違う → 正しい。one (サイバー空間とフィジカル空間を高度に融合、経済発展と社会課題の解決の両立、人間中心) は内閣府の定義どおり、detail の第5期科学技術基本計画 (2016 年閣議決定) は正しい (§5)。quiz 2023r05-q035 は Society5.0 を問わない題 (L9) | OK (図 static 5 ノード = 1.0〜5.0 の順で detail 3 文目と一致) | OK | L9 / L10 |
| 3 | 超スマート社会 | OK — mix 1: Society5.0 と別の社会ではなく同じ未来社会の別の呼び方 → 正しい (D-208 (3) 別名を別物として教えない ✓)。one・detail (必要なモノ・サービスを必要な人に必要なときに必要なだけ / 年齢・性別・地域・言語「といった」違いを越えて) は第5期計画の記述と一致。ただし one の「Society5.0 が目指す社会」は Society5.0 を主体 (取組み) として扱い、Society5.0 one (社会そのもの) と呼び方が揺れる → L2 | OK (図なし) | OK | L2 / L9 / L10 |
| 4 | データ駆動型社会 | OK — mix 1: 判断の根拠は現実のデータの分析結果、経験や勘だけに頼るやり方と対比 → 正しい。CPS = サイバーフィジカルシステム、IoT 収集・AI 分析が前提、Society5.0 の土台 → 正しい。図 steps 4 (現実で集める → 仮想空間にためる → AI で分析 → 現実に返す) は one と一致。引用題なし | OK | en one のかかり方 → L6 | L6 / L10 |
| 5 | DX | OK — exam 1 / 2 題: 核心は変革、デジタル技術の広がりでビジネスモデルや生活のあり方が刷新され新しい価値が生まれる (2023r05-q011 正答ウ = 名称を問う分類型、題文「〜ことなど」; 2026r08-q006 正答エ = デジタル技術が生活・ビジネス等あらゆる面に変革をもたらす; 誤答 = デジタルディバイド / デジタルネイティブ / A/D 変換)。考点は見出し語の一般的定義で、q011 題文の「刷新」1 語と近いが語の並び・付加価値の語は再現しない (D-209 分類型の免除内、jp-review #1 low と同判断)。限定条件: q011 の「など」— 考点は「核心は」と述べ範囲を閉じない、q006 の「など」— one・考点とも「〜や」で列挙を閉じない → 落ちなし。mix: DX = 自らを作り変える取組み / デジタルディスラプション = 新サービスで業界の古い構造が崩れる現象 (2024r06-q029 正答イ、誤答エ = DX) → 両側とも正の定義、題の UX・駆逐の語なし (D-209 対比の免除内)。detail: Stolterman 2004 の起源・DX レポート 2 (2020) の 3 段階は正しい; METI 定義の構成要素の版 → L4 (§5)。図 steps 3 はデジタイゼーション (q006 ウの A/D 変換に当たる段) を DX と別の段として描き、ウを支持しない | OK (図 steps 3) | zh `[[jp:]]` 書式 → L5 | L4 / L5 / L8 / L11 |
| 6 | デジタルトランスフォーメーション | OK — mix 1: 略称と正式名称は同じ概念 → 正しい (D-208 (3) ✓)。detail: Trans- を X と略す英語の慣習 (cross ≒ X) は正しい。quiz 2026r08-q006 は正式名称で問う題で本文と整合 | OK (図なし) | OK | L10 |
| 7 | GX | OK — mix 2: 削減と経済成長の両立 (成長をあきらめるのとは違う) / カーボンニュートラル = 排出量と吸収量の差し引きゼロ → 正しい (環境省の定義と一致)。detail: 日本政府の 2020 年の 2050 年カーボンニュートラル宣言は正しい。one (化石燃料中心 → クリーンエネルギー中心への転換、削減と成長の両立) は GX 実現に向けた基本方針の趣旨と一致、構成要素の数・名称は述べない (§5)。引用題なし | OK (図なし、#1 M 解消) | OK | L3 / L10 / L12 |
| 8 | グリーントランスフォーメーション | OK — mix 1: 略称と正式名称は同じ取組み → 正しい (D-208 (3) ✓)。detail は DX と同じ X の作り | OK (図なし) | OK | L3 / L10 |

**単元レベル**: goals 3 点・overview_cols 2 (区分 / 手がかり)・overview_rows 8 行・pairs 2 組 (第4次 / Society5.0 3 行 key 1、DX / GX 3 行 key 1)・key_points 5・summary (派生、validate 一致)・challenge_questions 5 件 (全て本文で引用または quiz、本文と矛盾なし)。`pairs[0].rows[2]` は r1 で「技術がもたらす変化 (背景の側)」に直り、one・overview と一致 (#1 M 解消)。`pairs[1].rows[0].b` の「脱炭素」→ L3。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 12 (うち 建議修 6)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[0](第4次産業革命).analogy_jp/zh/en` | 依頼の追加点検 (b21 u05 M1 型) の該当: 比喩「社会を作り変えてきた大波の 4 回目」の鍵語「社会」は Society5.0 / 超スマート社会 / データ駆動型社会 の語幹で、「社会の大波を数えて 4 回目」は狩猟社会から数える Society の数え方 (1.0→5.0 の移行もちょうど 4 回) と同じ像になる。`terms[1].points[0]`・`pairs[0].rows[1]` は「数え方の起点が違う (第4次 = 蒸気機関による機械化から)」と教えており、比喩がこの区別をぼかす。ただし引用・quiz 題 (2023r05-q035 / 2022r04-q018) の誤答肢はいずれも第1〜3次の産業革命で Society の数え方を含まないため、誤答肢へ読みが寄る型ではなく MEDIUM に当たらない | jp「社会を作り変えてきた大波の 4 回目で」→「産業を作り変えてきた大波の 4 回目で」/ zh「这是重塑社会的第 4 波巨浪」→「这是重塑产业的第 4 波巨浪」/ en "the fourth great wave to reshape society" → "the fourth great wave to reshape industry" |
| L2 | LOW **建议修** | `terms[2](超スマート社会).one_jp/zh/en` (+ 派生 `definition_*`) | D-208 (3) 型の残り: 「Society5.0 が目指す社会の中身」は Society5.0 を「社会を目指す主体」として扱い、Society5.0 の one (社会そのもの) と呼び方が揺れ、両者を別物 (取組みと目標) と読む余地を残す (jp-review #2 low の未修)。`points[0]` は「別々の社会ではない」と明記しており誤学習には至らない。第5期計画自体は「超スマート社会」を未来社会の姿とし、その実現の取組みを「Society 5.0」と呼ぶ書き方もあるので事実誤りではない | jp「**Society5.0** が目指す社会の中身を言い表した呼び名である。」→「**Society5.0** と同じ社会を中身の側から言い表した呼び名である。」/ zh「这一名称描述的是 **Society 5.0** 所追求的社会的具体内容。」→「这一名称从具体内容的角度称呼与 **Society 5.0** 相同的社会。」/ en "the name describes what the society **Society 5.0** aims for actually looks like." → "the name refers to the same society as **Society 5.0**, described by what it actually looks like." |
| L3 | LOW **建议修** | `pairs[1].rows[0].b_jp/zh/en`、`terms[7](グリーントランスフォーメーション).analogy_jp/zh/en` | 追加点検 (役割の名指しの食い違い): 対比表「変革の原動力」の GX 欄が「脱炭素とクリーンエネルギー」で、脱炭素は次行「主なねらい」(温室効果ガスの削減) と同じ目標側の内容 (jp-review #2 low の未修)。さらに グリーン の比喩は原動力を「環境」と呼び、対比表と別の名指しになる。GX に引用・quiz 題はなく誤答肢へ寄る型ではない | pairs: jp「脱炭素とクリーンエネルギー」→「クリーンエネルギー」/ zh「脱碳与清洁能源」→「清洁能源」/ en "Decarbonization and clean energy" → "Clean energy"。analogy: jp「変革の原動力をデジタルから環境に置き換えた」→「変革の原動力をデジタルからクリーンエネルギーに置き換えた」/ zh「把变革的动力从数字换成了环境」→「把变革的动力从数字换成了清洁能源」/ en "switched from digital to the environment" → "switched from digital to clean energy" |
| L4 | LOW **建议修** | `terms[4](DX).detail_jp/zh/en` 2 文目 (+ 派生 `explanation_*`) | D-205: 経済産業省の DX の定義の構成要素 (製品・ビジネスモデル / 業務・組織・企業文化 / 競争上の優位) を、文書名・版なしで「求めている」と述べる。数は言わず「〜や」「〜まで」で列挙を閉じず、定義の文言は DX 推進ガイドライン (2018 年 12 月) からデジタルガバナンス・コード (2.0 / 3.0) に引き継がれて現行でも変わらない (二次資料で確認; 原典の列挙は製品やサービス・ビジネスモデル / 業務そのもの・組織・プロセス・企業文化・風土で、本文はその部分集合) → 版なしの言い切り (MEDIUM) には当たらないが、政府文書由来の構成要素なので版を付けるのが安全。補丁時に経済産業省の原典 (DX 推進ガイドライン Ver.1.0) で 1 行確認のこと | jp「日本では経済産業省が企業の取組みとして位置づけ、」→「日本では経済産業省が DX 推進ガイドライン (2018 年) で企業の取組みとして位置づけ、」/ zh「在日本，经济产业省把它定位为企业的举措，」→「在日本，经济产业省在《DX 推进指南》（2018 年）中把它定位为企业的举措，」/ en "In Japan, the Ministry of Economy, Trade and Industry treats DX as a corporate effort and calls on" → "In Japan, the Ministry of Economy, Trade and Industry's DX Promotion Guidelines (2018) treat DX as a corporate effort and call on" |
| L5 | LOW **建议修** | `terms[4](DX).detail_zh` (+ 派生 `explanation_zh`) | `[[jp:]]` が括弧なしで訳語の直後に続き、単元内の他の箇所の「訳语（[[jp:…]]）」と書式が違う (loc-review low の未修) | zh「经过数字化（信息）[[jp:デジタイゼーション]] 和数字化（流程）[[jp:デジタライゼーション]] 之后」→「经过数字化（信息，[[jp:デジタイゼーション]]）和数字化（流程，[[jp:デジタライゼーション]]）之后」 |
| L6 | LOW **建议修** | `terms[3](データ駆動型社会).one_en` (+ 派生 `definition_en`) | "data gathered from the real world in cyberspace" は in cyberspace が gathered にかかり「サイバー空間の中の現実世界から集めた」とも読める。jp は「サイバー空間で」が「分析し」にかかる (loc-review low の未修) | en "is one that analyzes data gathered from the real world in cyberspace and returns" → "is one that analyzes, in cyberspace, data gathered from the real world and returns" |
| L7 | LOW | `terms[0].fig.steps[0..2].caption_*`、`terms[0].points[2]`、`hook_*`、`overview_rows[0].extra_*[1]` | D-208 (iii) の点検 (§4): 第1〜3次の 3 段階は 2022r04-q018 の誤答肢 3 つ (イ・エ・ウ) と 2023r05-q035 の誤答肢 3 つ (エ・ウ・イ) が扱う段階と同じ組。語句の重なり: caption 第1次「蒸気機関を動力に / 手作業が機械に」↔ q018 イ (蒸気機関・動力・手作業 → 機械工業)、第2次「同じ製品を大量に」↔ q018 エ「同一規格の製品…大量生産」、第3次「コンピュータで…自動化」↔ q018 ウ「コンピュータ制御…自動化」・q035 イ「生産の自動化」。ただし見出し語の「第4次」を説明するための標準の歴史区分を年代順に正の定義で述べたもので、並び順は q018 (1・3・2 次) とも q035 (3・2・1 次) とも違い、題に固有の語句 (軽工業・織機・ベルトコンベア・統計的手法・石油・産業用ロボット・エレクトロニクス・人件費) は使わない。考点 `points[2]` も第3次 / 第4次を両側とも正の定義で述べる対比 (D-209)。文単位の近さ ed 0.90〜0.93 / Dice 0.12〜0.24 | 記録のみ (段階区分を削ると「第4次」の意味が本文から消える) |
| L8 | LOW | `terms[4].points[1]`、`terms[4].fig.steps[2].caption_*` | DX を `points[0]` (Stolterman の意味: デジタル技術の広がりで生活やビジネスが刷新されていくこと = 現象側) と `points[1]` (自らを作り変える「取組み」、ディスラプション = 「現象」) で別の面から述べ、図の DX 段は「会社全体」に絞る (jp-review #2 low)。detail が両方の起源 (Stolterman / 経済産業省・DX レポート 2) を示しており矛盾ではなく、2026r08-q006 正答エ (現象側の説明) を退ける読みにもならない (他の選択肢は DX でない) | 記録のみ |
| L9 | LOW | `terms[1](Society5.0).quiz`、`terms[2].points[0]` | quiz 2023r05-q035 は第4次産業革命の記述を選ぶ題で Society5.0 を問わない (jp-review #1 low、題バンクに Society5.0 を直接問う題なし)。超スマート社会の mix 考点「中身の説明と名前という別の面」はどちらがどちらか分かりにくい (L2 の補丁で one 側は解消) | 記録のみ |
| L10 | LOW | `terms[1].detail_jp` 3 文目 / `points[0]` / `pairs[0].rows[1]` / `overview_rows[1].extra_jp[1]`、`terms[0].hook_jp` / `analogy_jp` / `overview_rows[0].extra_jp[1]` / 図、`terms[5].points[0]` / `terms[7].points[0]` / `key_points_jp[4]`、`terms[6].points[0..1]`、`terms[3].hook_jp` / `analogy_jp`、`terms[2].analogy_jp`、`terms[7].hook_jp` / `analogy_jp` | D-203 §6 / §9 の low 類 (jp-review #2 low の未修): 「狩猟から 5 番目」が 4 欄、「蒸気・電力・コンピュータに続く 4 回目」が 4 欄; 正式名称 2 語の考点が one の言い直しで key_points で 3 度目; GX 考点 2 件が one・detail・pairs の言い直し; データ駆動型の hook と比喩が同じエンジンの像; 超スマート社会の比喩が one の言い換え; グリーン の hook と比喩がともに「DX と同じ作り」 | 記録のみ |
| L11 | LOW | `terms[4].fig.data.nodes[0..1].label.zh` / `steps[0..1].caption_zh`、`overview_rows[2].extra_en[1]`、`overview_rows[3].extra_en[0]` | loc-review low の未修: zh「数字化（信息）」「数字化（流程）」は同じ語の括弧違いで見分けにくい (意味は正しく、jp のデジタイゼーション / デジタライゼーションと同型で誤答肢 [q006 ウ] へ寄せる訳ではない); en の総表 2 セルの自然さ | 記録のみ (任意: zh を「信息数字化」「业务数字化」に統一) |
| L12 | LOW | `overview_rows[6].extra_jp/zh/en[1]` | 総表で「カーボンニュートラル」を GX の detail の定義より先に使う (jp-review #2 low) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 第4次 = 技術による変化 / Society5.0 = 目指す社会の姿: `pairs[0].rows[0]`・`rows[2]`、`goals_jp[0]`、`overview_rows[0..1].extra_jp[0]` (総表の区分列 = D-195 §3 の構造) → 許容。② 数え方の起点 (蒸気機関 / 狩猟社会): `pairs[0].rows[1]`、`terms[1].points[0]` の 2 箇所 → 上限内。③ DX = デジタル / GX = クリーンエネルギー: `pairs[1].rows[0]`、`goals_jp[2]`、総表区分列、グリーン analogy → 許容 (L3)。④ DX / デジタルディスラプション: `terms[4].points[1]` のみ。⑤ 第3次 / 第4次: `terms[0].points[2]` と図 (段階の構造) → 許容。⑥ 略称 / 正式名称: `terms[5..7]` の one・考点・`key_points_jp[4]` → L10。

**範囲外の観察**: O1 `unit_summary_*` は v1 と同文 (未改稿、B2 審査済み)。O2 topic 内の未引用関係題 8 題 (2009h21a-q003 等、manifest `questions`) は本単元の見出し語を問わない旧題で、本文と矛盾なし。

確認済みで問題なし: 限定条件 (引用 4 題の「など」の保持、§2)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤78 字)、写し (validate 0、独立照合は用語名の偽陽性のみ)、`[[jp:]]` 原語 (16 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (8/8)、zh 訳語表 (B6 warn 0)、図種 (flow steps ×3 / flow static ×1 / 図なし ×4 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、jp-review #1 MEDIUM 4 件の解消と zh / en 非退行。

## 4. D-208 (iii) 選択肢の組・誤答肢の打ち消しの点検

| 箇所 | 対応する題 | 判定 |
|---|---|---|
| `terms[0].points[0]` | 2023r05-q035 (記述選択、正答ア) | 正答の分野例 (医療・インフラ・交通) ・手段・効果の並びを使わない (#1 M 解消)。「製造業に限らず社会全体」は見出し語の一般的特徴で、誤答イ・ウ・エ (工場・軽工業の場面) を個別に打ち消さず、場面の再演もない → (iii) に当たらない |
| `terms[0].points[1]` | 2022r04-q018 (記述選択、正答ア) | 題の枠組み (〜から顕著になった取組) と正答 3 要素 (個別仕様・IT でコスト低減・短納期) の並びを再現せず、マスカスタマイゼーションの一般定義 → 該当なし |
| `terms[0].points[2]` / 図 caption 1〜3 | q018 誤答イ・ウ・エ、q035 誤答イ・ウ・エ | 誤答肢の扱う 3 段階と同じ組を年代順・正の定義で述べる (L7 に重なった語句を引用)。題の順でなく題固有の語句なし、見出し語の名の由来に必要な標準区分 → LOW (記録のみ) |
| `terms[4].points[0]` | 2023r05-q011 (分類型) / 2026r08-q006 (記述選択、正答エ) | 見出し語の一般定義 (D-209 分類型の免除)。q011 題文と共通は「ビジネスモデル」「刷新」の 2 語で、並び・付加価値・IoT や AI の語は再現しない; q006 誤答 (ディバイド / ネイティブ / A/D 変換) の組を述べない → 該当なし |
| `terms[4].points[1]` | 2024r06-q029 (分類型、正答イ、誤答エ = DX) | 取り違えやすい 2 語を両側とも正の定義で述べる対比 (D-209)。題文の UX・駆逐・既存の構造の破壊を使わず (「古い構造が崩れる」は一般表現)、選択肢の組 (サイネージ / ディスラプション / ディバイド / DX) を再現しない → 該当なし |
| `terms[4].fig` (デジタイゼーション段) | 2026r08-q006 誤答ウ (A/D 変換) | 誤答ウに当たる内容を DX と別の前段として正の定義で示す。題の場面 (マイクロフォン・音声・電子ファイル) なし → 該当なし、ウを支持しない |

## 5. D-205 / D-210: 政府文書由来の定義・改訂される文書の記述

| 対象 | 単元の記述 (field) | 判定 |
|---|---|---|
| Society 5.0 | `terms[1].detail_*`「2016 年に閣議決定した第5期科学技術基本計画で」、狩猟・農耕・工業・情報に続く 5 番目 | 版 (第5期・2016) あり ✓。5 段階は名称「5.0」に固定された数で改訂対象の構成ではない |
| 超スマート社会 | `terms[2].detail_*`「年齢・性別・地域・言語といった違い」「第5期科学技術基本計画では」 | 版あり、列挙は「といった」で例示 ✓ |
| DX (経済産業省の定義) | `terms[4].detail_*` 2 文目 | 文書名・版なし、数は述べず列挙は「〜や」「〜まで」で閉じない → MEDIUM 級ではないが版の付記を推奨 → **L4 建議修** |
| DX レポート 2 の 3 段階 | `terms[4].detail_*` 3 文目、`fig` steps 3 | 版 (DX レポート 2・2020 年) あり ✓。図 caption は版を繰り返さないが同一用語の detail が出典を示す |
| GX / カーボンニュートラル | `terms[6].one_*` / `detail_*`、`overview_rows[6]` | 構成要素の数・名称を述べない。「2020 年に…2050 年までに」の年は宣言の年で正しい。「太陽光や風力などの」は例示 ✓ |
| インダストリー4.0 | `terms[0].detail_*`「2011 年に打ち出した」 | 構成要素を述べない ✓ |
| D-210 | 引用 5 題 | 法令・規格の改正前の文言に依拠する題なし → 該当なし |

## 6. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **12** (建议修 6: L1〜L6 / 記録のみ 6: L7〜L12) |

## 7. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 8 用語・考点 12 件 (qid 付き 3 件)・引用 4 題 + quiz / challenge の未引用 1 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。jp-review #1 の MEDIUM 4 件は r1 で解消し三語で退行なし。追加点検 (比喩・フックの鍵語 / 役割の名指し) は L1 (第4次の比喩の「社会」) と L3 (GX の「原動力」) が該当したが、いずれも引用・quiz 題の誤答肢へ読みが寄る型ではなく LOW。D-205: DX の経済産業省定義に版なし → L4 (建議修)、Society 5.0・DX レポート 2 は版あり。LOW 建議修 6 件 (L1〜L6) は補丁 (B3) で修正推奨 (L4 は経済産業省原典で 1 行確認のうえ)、L7〜L12 はバッチ証拠の「未修 LOW」表へ。

## 8. 補丁案の試し適用

L1〜L6 の before 17 本が各欄にちょうど 1 回あることを確認し、scratchpad の複製に適用 (派生 `definition_* / explanation_*` も同置換) → validate 0 issues / parity 34 locations 0 diff、独立 copy 照合の新規ヒット 0 (§9)。

## 9. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-01-u10
✓ strategy-01-01-u10 unit: 0 issues (data/ip/textbook/units/strategy-01-01-u10.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-01-u10
✓ strategy-01-01-u10 parity: 34 locations, 0 diff
EXIT=0

# 補丁案 L1〜L6 適用後の複製 (scratchpad)
$ node --no-warnings scripts/textbook-v2-validate.mjs --file <scratchpad>/ra0101u10/patched.json --manifest data/ip/textbook/.planning/v2/strategy-01-01-u10/manifest.json
✓ strategy-01-01-u10 unit: 0 issues
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --file <scratchpad>/ra0101u10/patched.json
✓ strategy-01-01-u10 parity: 34 locations, 0 diff
EXIT=0
```
