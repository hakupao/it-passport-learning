# Rule A 全数抽検 — management-09-26-u01 (設計・分析の手法とモデリング)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S148 第 32 批 b32)、repo HEAD `b789756e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b32-u01-a1` merge 結果、sha256 先頭 `55e00354bd6954e4`)。journal `journal.b32-u01-a1.jsonl` (jp r0 → jp-review r1 REVISE [medium 1] → jp r1 → jp-review r2 PASS → loc r0 → loc-review r1 PASS)。
- **対象**: `data/ip/textbook/units/management-09-26-u01.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (構造化手法 / オブジェクト指向 / ユースケース / UML / リバースエンジニアリング) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、D-208〜D-210、S147 追加型 (8)〜(10)、`PLAN_stage7_phase3.md` §0-11 (図種 = FIGURE_KINDS 6 種)。比較: `v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (tree node label・step caption・table cell・flow node・svg のテキスト) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールドは validate の「去標記 == 兼容字段」断言で一致 (0 issues)。`summary.memory_hooks_en` も読んだ (→ M1)。
2. **考点 × 引用題 (考点 9 件 = exam 5 + mix 4、引用 qid 延べ 7 = 異なり 7 題、全題 topic management-09-26)**: `questions.json` から題文 (`stem_jp_clean` 優先)・選択肢・`correct_answer` を再読し、考点の主張が正答と一致し、誤答肢を支持せず、限定条件を外さないことを 1 件ずつ確認 (§2)。計算題なし。
3. **quiz / challenge_questions** (quiz 計 8 枠 + challenge 4 題、本文で未引用 = 2010h22a-q045 / 2023r05-q039 / 2018h30a-q039 / 2023r05-q049 / 2021r03-q048): 2010h22a-q045 (a 処理手順に着目 = プロセス中心 / b データの関連 = データ中心 / c データと処理のまとまり = OO、正答エ) は 構造化 one「機能 (処理) の単位」と OO one で c が決まり解ける (プロセス中心アプローチ・データ中心アプローチ の語は本単元に無いが、誤った対応を教える記述も無い)。2023r05-q039 (仕様書の無い運用中ソフトのソース解析 → 仕様書作成 = RE、誤答 コードレビュー / デザインレビュー / リファクタリング) は RE one・図 step 2〜4・points[1] で解ける。2018h30a-q039 (保守用文書のための既存プログラム解析 = RE、誤答 ウォータフォール / スパイラル / プロトタイピング) は detail「保守…の資料」と一致。2023r05-q049 (リファクタリング = 機能仕様を変えず内部構造を改善、正答ア; 誤答イ = 解析して仕様を明らかにする = RE 的記述) と 2021r03-q048 (外から見た動きを変えず内部構造を改善 = リファクタリング、誤答ウ RE) は RE points[1] の対比で解ける。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合: 単元の JP 文字列 121 本 (派生除く) を topic 全 41 題の stem + 選択肢 計 205 本と 12 字窓で照合 (記号・空白・`**`・`[[jp:]]` 除去)。① 遮蔽なし完全一致 49 窓 → **全て見出し語「リバースエンジニアリング」(12 字) そのもの** (goals[2] / overview_rows[4] / one / points / key_points[4]) → 偽陽性。② 遮蔽なし 1〜2 字置換の近似 20 窓 → 見出し語 + 助詞 (リバースエンジニアリング は/を/で/と、オブジェクト指向 は ↔ 選択肢の「オブジェクト指向 b/c」の記号境界) と、「利用者とシステムのやり取り ~ ユーザとシステムのやり取り」(overview_rows[2] / pairs[1].rows[0].a ↔ 2016h28h-q049 ウ・2017h29h-q054 エ; ユースケースの標準定義の句)、「ままプログラムの内部構造 ~ ずにプログラムの内部構造」(RE points[1] ↔ 2022r04-q038 ウ; リファクタリングの標準定義)、「構造や振る舞いを図にする ~ 構造や振る舞いを記述する」(pairs[1].rows[0].b ↔ 2017h29h-q054 ウ = UML の正しい記述が誤答肢に使われたもの; 見出し語 UML の正の定義) → 標準定義の一般表現で写しではない。③ カタカナ 4 字以上・英数を □ 遮蔽 + 実字 6 未満除外 → 0 件。**文単位の近似** (正答肢・題文との編集距離比 ed / bigram Dice; 校正 HIGH 例 ed 0.14 / Dice 0.52): RE points[0] 1 文目 ↔ 2020r02o-q051 エ ed 0.50 / Dice 0.55、同 2 文目 ↔ 2014h26h-q047 イ 0.74 / 0.39、UC points[0] ↔ 2017h29h-q054 エ 0.55 / 0.39、RE points[1] (リファクタリング側) ↔ 2021r03-q048 題文 0.68 / 0.34、OO points[0] ↔ 2009h21a-q047 イ 0.93 / 0.25、OO points[1] ↔ 2021r03-q041 題文 0.85 / 0.20 → いずれも ed が校正例より遥かに大きく、正答 = 見出し語の標準定義の言い換えで写しではない (L6・L7・L8 に記録)。カタカナの多い文 (OO points[0]、UC one / points、UML one、RE 全欄) を目視: 題の場面・数値・主体名の流用なし。
5. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 2 文 × 5、定義前使用 (機能 (処理) = 構造化 one、DFD = detail の括弧注、オブジェクト = OO one、クラス・カプセル化・継承・多態性 = OO detail、アクター = UC one の括弧注、構造 / 振る舞い = UML one、フォワードエンジニアリング = RE detail の括弧注、リファクタリング = RE points[1] 内で定義; メッセージ・ユースケース図の記法は先出し → L9)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `freq_badge`「頻出」のみ。「と覚える」0 (hook 2 件は「〜と字から / 名前から思い出す」、同型の結びは 5 中 2 で記録なし)。zh / en 相当語 (必须 / must / exam / always) → 「for example」内の exam 4 件のみ (偽陽性)。図の型: 構造化 = tree steps 3、OO = svg static (v1 資産 t01)、UC = table static、UML = table static、RE = flow steps 4 — 全て FIGURE_KINDS 内。pair 配置: 構造化 / OO (3 行 key 1)、ユースケース / UML (2 行 key 1)。
6. **D-200**: 考点数 1/3/1/2/2 (≤3 ✓)、各 JP 1〜2 文・46〜80 字 (≤100 ✓、最大 RE points[1] 80 字)。**framing 件数** (`validateV2.pointFraming`、全考点、tsx で実行): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 / D-204 / D-205 単元全体点検**: 書き方 7 (欄同士): 構造化 = 機能単位・トップダウン は one / detail / analogy / hook / tree 図 / overview / pairs[0] / key_points[0] で一致 (jp-review r1 low の hook「組み上げる」= ボトムアップ像は「骨組みを決め、細部へ下りていく」に直り解消)。OO: analogy (リモコン = 中身を包み操作の窓口だけ見せる) は points[0] カプセル化の効果と一致、detail の 3 性質は標準定義どおり (多態性 = 同じ指示にオブジェクトごとに違う動き)。UC: アクターに外部システムを含む (detail・表 rows[0]) で一致。UML: 構造図と振る舞い図 (one・points[0]・表・key_points[3]) で一致。RE: 向き = 完成品 → 設計 (detail・hook・analogy・flow) で一致、図 step 0 の「動いている」→ L2。**D-205**: UML は改訂される標準だが、図の種類の数・全種名を閉じた列挙で述べる欄は無い (表の列見出しは「図の例」、pairs[1].rows[1].b は「多くの図」、detail は「用途ごとに用意」) → 該当なし。書き方 8 (対比の出現欄): ① 構造化 = 機能 / OO = データと操作のまとまり: `pairs[0].rows[0]`、OO `points[2]` (mix)、各 one (定義そのもの)、goals[0] (予告) → 許容。② ユースケース ⊂ UML: `pairs[1].rows[1]`、UML `points[1]` (mix) → 許容。③ RE / リファクタリング: RE `points[1]` のみ → 許容。書き方 9 (限定条件): §2 表に記載、落ち 0。
8. **既知失敗型 (D-208 / S147) の個別確認**:
   - (1) 選択肢なぞり: validate の `warn choice-echo` 0 行。誤答肢だけを否定する考点は無い。2012h24a-q045 (OO の基本概念 a〜d から適切なもの = a クラス・b 継承) の判断項目の組 (クラス・継承・正規化・ホワイトボックステスト) を並べる欄は無い (detail はクラス + 3 性質を定義として述べ、c・d に触れない)。RE points[1] は RE / リファクタリングを両側とも正の定義で対比 (D-209 免除)、2021r03-q048 / 2023r05-q049 の 4 肢の集合・順序は再現しない → 0。
   - (2) 「など」落ち: 2009h21a-q047 イ「内部構造や動作原理の詳細」→ OO points[0]「内部のデータの持ち方や処理の作り」で範囲同等。RE detail「保守や作り直し、製品の技術調査など」・図 node 4「保守など」で範囲を残す → OK。
   - (3) 別名を別物として教える: 多態性 (= ポリモーフィズム) は 1 名のみで別物扱い無し。フォワードエンジニアリングは RE の対語として正しく提示。
   - (4) 比喩・図の範囲: OO svg (クラス → オブジェクト / カプセル化 / 継承 / 多態性 を同列の矢印) は生成関係と性質が混ざって見えるが、one / detail が否定する内容は運ばない → L8。
   - (5) 前回修正の zh / en 回帰: jp-review r1 MEDIUM (RE 旧 points[1] / detail の 2023r05-q039 + 2018h30a-q039 題文場面の同順なぞり) は旧考点の削除・detail の一般化 (「既存システムの保守や作り直し、製品の技術調査などの資料」) で解消し、zh / en にも旧場面 (仕様書が無い → ソース解析 → 文書作成 → 保守、長年使用) は残っていない。jp-review r1 low (RE 対比の「解析によって仕様を明らかにする」= 2023r05-q049 誤答イの語) も「仕様や設計情報を取り出す」に直り、zh「提取规格和设计信息」・en "recovers specifications and design information" も同じ → 回帰なし。
   - (6) zh / en の語が誤答肢寄り: **en `hook_en` が主語「カプセル化」を落とし、`summary.memory_hooks_en[1]` で "Object orientation: The word comes from a capsule…" = 見出し語の語源がカプセルだと読める (jp は「カプセル化の『カプセル』」で正しい) → M1**。他: RE detail_zh「重新开发」/ en "rebuilding" はリエンジニアリング (2014h26h-q047 誤答ウ = 業務の根本的見直し) と同一視せず、RE の成果の用途として述べる → OK。
   - (7) D-210 改正前の版: 法令・規格の改正をまたぐ引用題なし → 該当なし。
   - (8) 比喩・フックの鍵語が他の見出し語の語幹: 構造化 hook「構造 = 建物の骨組み」は UML の「構造 (図)」と語が重なるが、UML 側の「構造」= 静的な構成で、hook の「骨組み = 全体構成」と矛盾せず、引用・quiz 題の誤答へ導かない → OK。UC analogy「役者」は「アクター」と重なるが同義 (利用者 = 演じ手) で整合。
   - (9) フックを題の場面に当てると誤答: 構造化 hook を 2010h22a-q045 / 2021r03-q041 に当てても誤答 (イ 構造化 / ウ プロセス中心) へは導かない (両題ともクラス・データと処理のまとまりで OO と決まる)。UC hook (場面ごとに書く) を 2017h29h-q054 に当てると正答エ (シナリオに基づくやり取り) を選ぶ。RE hook (後ろ向きにたどる) を 2020r02o-q051 に当てても誤答ウ (上流から下流へ順番) を選ばない → OK。
   - (10) 法令・規格カテゴリの閉じた列挙: UML 図の種類は「図の例」で閉じていない (§1-7) → 該当なし。
9. **三語**: `[[jp:]]` 原語 9 種 (構造化手法 / オブジェクト指向 / カプセル化 / 継承 / ユースケース / シナリオ / アクティビティ図 / リバースエンジニアリング / リファクタリング) が jp 本文に実在 (スクリプト、全 ok)。one_zh / one_en の見出し語 `[[jp:]]` は 4 / 5 (UML は jp と同綴りで不要、validate 0)。zh 訳語は `zh_terms.unit.json` に一致 (结构化方法 / 面向对象 / 用例 / UML / 逆向工程 / 重构 / DFD; validate の B6 warn 0)。parity 28 箇所 0 diff。loc-review r1 の low 9 件は未適用 (→ L1・L3・L4・L5・L10)。
10. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 構造化手法 | OK — exam 0 + mix 1 (quiz 1 題)。mix: 構造化手法 = 設計の進め方、DFD = その分析で処理とデータの流れを描く図法 — 正しい。one「機能 (処理) の単位でとらえ、上位から下位へ段階的に」は 2010h22a-q045 の a (処理手順に着目) と整合し、b・c を構造化側に寄せない。detail「例えば DFD」= 例示で閉じない | OK (tree steps 3、図書館 → 貸出 / 返却 → 細かな処理、one と一致) | detail_zh「常用的是」が jp の例示より頻度主張寄り (L4)、tree label en 不完全 (L3) | L3, L4 |
| 2 | オブジェクト指向 | OK — exam 2 / 3 題 + mix 1: 利用側は依頼を送るだけで内部を知らずに使える = カプセル化の効果 (2009h21a-q047 正答イ; 誤答ア 再利用性・生産性は上がらない / ウ 大規模に使わない / エ 処理手順で設計しデータを関連付けない を支持しない — エ相当の「データを分けて扱う」は pairs[0].rows[1] で構造化側としてのみ述べる) / 継承 = 上位クラスのデータと操作を下位が引き継ぎ、部品として再利用、生産性が上がる (2012h24a-q045 正答ア = クラス・継承 / 2021r03-q041 正答ア OO; 誤答 構造化・プロセス中心・プロトタイピング を支持しない) / mix: 構造化 = 機能単位、OO = データと操作のまとまり単位 (D-209 正の定義の対比) | OK (svg static = 登録内、v1 資産 → L8) | **hook_en が主語を落とす (M1)**、hook_zh の論理 (L1) | **M1**, L1, L8, L10 |
| 3 | ユースケース | OK — exam 1 / 1 題: シナリオをもとに利用者の行為とシステムの応答を記述 (2017h29h-q054 正答エ; 誤答ア データ定義から開始 = データ中心 / イ データと操作のまとまり = OO / ウ 構造や振る舞いの複数表記法 = UML を支持しない — ウの内容は UML の定義として別見出し語で述べ、pairs[1] で区別)。detail「アクターは外部システムも含む」「内部の処理でなく外から見て何ができるか」は標準どおり。表 (人の形 / 楕円 / 四角い枠) は UML ユースケース図の記法として正しい | OK (table static) | 図セル zh「人形」(L5)、points[0].text_zh の「场景」衝突 (L10) | L5, L6, L9, L10 |
| 4 | UML | OK — exam 1 / 1 題 + mix 1: UML には振る舞い図もあり、例えばアクティビティ図で業務手順の流れを描ける (2010h22h-q029 正答イ UML; 誤答 E-R 図・親和図法・ロジックツリー を支持しない; 「例えば」で図種を閉じない) / mix: ユースケース図は UML が定める図の一つ — 正しい。one「図の種類と描き方を定めた標準の表記法」、detail「特定の言語・製品に縛られない」、hook (複数の表記法の統合) とも事実どおり。表 4 行 (クラス図 / ユースケース図 / シーケンス図 / アクティビティ図) は列見出し「図の例」で閉じた列挙ではない (D-205 ✓) | OK (table static) | OK | L9 |
| 5 | リバースエンジニアリング | OK — exam 1 / 2 題 + mix 1: プログラムを解析して仕様を調べ設計情報を抜き出す (2020r02o-q051 正答エ; 誤答ア 短期反復 = アジャイル / イ 試作評価 = プロトタイピング / ウ 上流から下流へ順番 = ウォータフォール を支持しない) / 対象はソフトウェアに限らず製品の分解・構造解明も含む (2014h26h-q047 正答イ; 誤答ア 実験計画 / ウ 業務の根本的見直し = リエンジニアリング / エ 並行作業で期間短縮 を支持しない — detail の「作り直し」は RE の成果の用途で、業務改革とは結び付けない) / mix: リファクタリング (外から見た動作を保ち内部構造を整える) とは目的が違う (2023r05-q049 / 2021r03-q048 と整合)。detail「フォワードエンジニアリングとは向きが逆」正しい。図 step 0「すでに動いている完成品」は引用題に無い限定 (L2) | OK (flow steps 4) | OK | L2, L6, L7 |

**単元レベル**: goals 3 点・overview_cols 2 (着目するもの / 主な使いどころ)・overview_rows 5 行・pairs 2 組・key_points 5・summary (派生、validate 一致)・challenge 4 件 (2021r03-q041 / 2018h30a-q039 / 2023r05-q049 / 2021r03-q048 — 本文と矛盾なし、§1-3)。key_points[1]「カプセル化で中身を隠し、継承で共通部分を引き継ぐことで部品の再利用を進める」は OO 考点と一致。overview_rows[4].extra「保守のための文書づくり、技術の調査」は RE detail と一致。事実誤りなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 10 (うち 建議修 5)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[1].hook_en` (+ 派生 `memory_hook_en`, `summary.memory_hooks_en[1]`) | jp「カプセル化の『カプセル』は、薬のカプセルと同じく中身を殻で包むという意味。」の主語「カプセル化」が en で落ち、"The word comes from a capsule…" となっている。hook は用語 Object orientation の欄にあり、`summary.memory_hooks_en[1]` では "Object orientation: The word comes from a capsule, …" と表示されるため、**見出し語 object orientation の語源がカプセルだという誤った事実**として読める (jp・zh は主語あり)。既知失敗型 (5)(6) = en だけの誤り | en: before `The word comes from a capsule, like a medicine capsule: the contents are sealed inside a shell.` → after `The word encapsulation comes from a capsule, like a medicine capsule: the contents are sealed inside a shell.` (jp・zh 変更なし) |
| L1 | LOW **建議修** | `terms[1].hook_zh` (+ 派生 `memory_hook_zh`, `summary.memory_hooks_zh[1]`) | 「封装的“封”和药品胶囊一样」は漢字「封」と薬のカプセルを同一視する言い方で論理がつながらない (jp の要点 = カプセル化のカプセル = 薬のカプセル)。loc-review r1 low 未適用 | zh: before `封装的“封”和药品胶囊一样，是把内容物包在外壳里的意思（日语叫“カプセル化”，即胶囊化）。` → after `封装在日语里叫“カプセル化”（胶囊化）：就像药品胶囊一样，把内容物包在外壳里。` |
| L2 | LOW **建議修** | `terms[4].fig.steps[0].caption_jp/zh/en` | 「すでに動いている完成品」は、one・detail・points[0] (2014h26h-q047: 製品の分解・解析) が含める「動作中でない製品」を外す、引用題に無い限定 (図 caption のため LOW、jp-review r2 low 未適用) | jp: before `出発点は、設計書ではなくすでに動いている完成品である。` → after `出発点は、設計書ではなくすでにある完成品である。` / zh: before `起点不是设计书，而是已经在运行的成品。` → after `起点不是设计书，而是已有的成品。` / en: before `The starting point is a finished product already in use, not a design document.` → after `The starting point is a finished product that already exists, not a design document.` |
| L3 | LOW **建議修** | `terms[0].fig.data.root.children[1].children[1].label.en` | "Check for overdue" は目的語を欠き英語として不完全 (loc-review r1 low 未適用) | en: before `Check for overdue` → after `Check for overdue items` |
| L4 | LOW **建議修** | `terms[0].detail_zh` 2 文目 | jp「例えば DFD が使われる」(例示) に対し zh「常用的是 DFD」は頻度の主張に寄る (三語の差、事実誤りではない; loc-review r1 low 未適用) | zh: before `把这种流动画成图时，常用的是 **DFD**（数据流图）。` → after `把这种流动画成图时，例如可以使用 **DFD**（数据流图）。` |
| L5 | LOW **建議修** | `terms[2].fig.data.rows[0].cells[1].zh` | 「人形」は人形 (doll) とも読める (loc-review r1 low 未適用) | zh: before `人形` → after `小人图形` |
| L6 | LOW | `terms[4].points[0].text_jp/zh/en`、`terms[2].points[0].text_jp/zh/en` | D-203 §9: 各 one の言い直し。かつ正答肢 (2020r02o-q051 エ / 2014h26h-q047 イ / 2017h29h-q054 エ) の順序を同義語でなぞる (ed 0.50〜0.74、Dice 0.39〜0.55; 校正 HIGH 例 ed 0.14 より遥かに遠い)。見出し語の標準定義の一般表現で写しではない (jp-review r1・r2 low と同判断) | 記録のみ |
| L7 | LOW | `terms[4].points[1].text_jp` 前半 | リファクタリングの定義「外から見た動作を保ったまま…内部構造を整える活動」が 2021r03-q048 の題文 (名称を当てる題) と同順 (ed 0.68 / Dice 0.34)。標準定義 + D-209 (取り違えやすい 2 語の正の定義の対比) で (iii) に当たらない | 記録のみ |
| L8 | LOW | `terms[1].fig` (svg t01、v1 資産) | クラスから オブジェクト / カプセル化 / 継承 / 多態性 へ同列の矢印で、生成関係と性質の列挙が混ざる。カプセル化ラベル「データと処理をまとめる」は detail「中身を外から隠す」と焦点が違う (矛盾ではない)。ラベルは JP のみで zh / en 読者にも JP 表示 (他単元の v1 SVG 再利用と同じ扱い) | 記録のみ (図の作り直しは文字列置換の範囲外) |
| L9 | LOW | `terms[3].fig.data.rows[2].cells[1]`、`terms[2].fig.data.cols` | 「メッセージ」が単元内で未定義 (OO points[0] は「依頼を送る」)。ユースケースの表がユースケース図の記法を UML 導入 (次の用語) 前に使う (jp-review r1・r2 low) | 記録のみ |
| L10 | LOW | `terms[2].points[0].text_zh`「情节（场景，[[jp:シナリオ]]）」、`goals_zh[2]` 等の「成果物」、`terms[1].points[1].text_zh` 等の「共通部分」、`terms[1].detail_zh`「继承上层类性质的**继承**」、`terms[3].hook_zh`「合而为一诞生」、`challenge_questions` | zh の訳語衝突 (シナリオ と 場面 がともに「场景」)・日式借词・同語連続・文法のぎこちなさ (loc-review r1 low 未適用、意味のずれなし)。challenge 4 題中 2 題が見出し語でないリファクタリングを答えさせ、構造化 / UC / UML の確認題が無い (jp-review low、manifest の範囲内) | 記録のみ |

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **10** (建議修 5: L1〜L5 / 記録のみ 5: L6〜L10) |

## 5. 判定

**FAIL → B3 補丁で PASS 可** (D-199: MEDIUM 1)。全 5 用語・考点 9 件 (qid 付き 5 件、引用 7 題) + 未引用の quiz / challenge 5 題で、考点の主張は正答と一致し、誤答肢を支持せず、限定条件の落ちも無い。jp-review r1 MEDIUM は解消・三語とも回帰なし。唯一の MEDIUM は en hook の主語落ち (M1) で、文字列置換 1 件で直る。M1 を当てた後に validate / parity を再実行し、`summary.memory_hooks_en[1]` が "Object orientation: The word encapsulation comes from a capsule, …" になることを確認すれば PASS (HIGH 0 かつ MEDIUM 0)。L1〜L5 も同じ補丁での適用を推奨。

## 6. 機械ゲート出力

```
$ node scripts/textbook-v2-validate.mjs --unit management-09-26-u01
✓ management-09-26-u01 unit: 0 issues (data/ip/textbook/units/management-09-26-u01.json)
$ node scripts/textbook-v2-parity.mjs --unit management-09-26-u01
✓ management-09-26-u01 parity: 28 locations, 0 diff
$ npx tsx (validateV2.pointFraming over all points)
{ jp: 0, zh: 0, en: 0 }
```
