# Rule A 全数抽検 — strategy-01-02-u02 (原因分析・管理・系統の構造化図)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-10-29 (S138 第 7 批 b07)、repo HEAD `d9e6216` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b07-u02-a2` merge 結果、`merged.json` と完全一致、sha256 先頭 `107b6300b3d770e9`)。
- **対象**: `data/ip/textbook/units/strategy-01-02-u02.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (フィッシュボーンチャート / 管理図 / 系統図 / ロジックツリー / コンセプトマップ) + 単元レベル (goals / overview_rows / pairs 3 組 / key_points / summary / challenge_questions)。前単元 `strategy-01-02-u01.json` の 特性要因図・パレート図 と突き合わせ。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 (session-138 §2・§6)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `.planning/v2/strategy-01-02-u02/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`memory_hook_*` / `summary.memory_hooks_*` / `summary.key_points_*` / `overview.intro_*`) は本体の記法除去版 (目視一致)。
2. **考点 × 引用題 (考点 全 9 件 = exam 4 + mix 5、qid 付き 7 件、引用 qid 延べ 10 件 = 異なり 9 題)**: `data/ip/quiz/questions.json` から各題の題文・選択肢・`correct_answer` を再読 (全題 topic `strategy-01-02`)。主張が正答と一致、誤答肢を支持しない、引用題が支持しない一般化・限定をしない、題の前提 (限定条件) を外さないことを 1 件ずつ確認 (§2)。
3. **a1 の誤りの再発確認** (failures/…/strategy-01-02-u02_attempt_1.md):
   - (a) 「系統図と特性要因図は分解の向きが逆」: 全 JSON で 逆 / 向き / 反対 / opposite / reverse / 相反 = **0 件**。旧 `terms[2].points[1]` (mix) は削除済み。系統図 (目的 → 手段) とロジックツリー (問題 → 原因/要素) は どちらも「達成したい・起きている側 → それを生む側」へ下ろす同じ向きで書かれ、違いは `pairs[1].rows[1..2]` と `terms[3].points[1]` で対象・用途として述べる → **再発なし**。
   - (b) 引用題の記法の持ち込み: 考点 9 件に → (矢印) 0 件、題の約束 ((a)(b) の記法) 0 件。`terms[2].points[0]` (2011h23a-q099) と `terms[3].points[0]` (2013h25a-q090) は用語の事実 (下位の手段 → 上位の目的、問題を根・原因を下位の枝) として言い切る → **再発なし**。
   - (c) 管理図の比喩が「線の外だけ調べればよい」: `terms[1].analogy_jp/zh/en` に だけ / のみ / 只 / only = 0 件、「外れる日が出たら…調べる」で止め、片側への連続を否定しない。detail・`fig.steps[3]`・`key_points[1]` は「限界線の外の点 + 中心線の片側に続く点」を兆しとする → **再発なし**。
   - 管理限界線と規格限界の混同: `fig.steps[1]`「普段のばらつきの幅から…上下の限界の線を決める」、analogy「いつもの幅を上下の線で示す」= 工程自身のばらつきから決める管理限界で、規格 (顧客要求の許容範囲) の語は一切出ない → **混同なし**。
4. **quiz / challenge_questions** (term quiz 6 枠 = 異なり 6 題、challenge 4 題 = 2022r04-q048 / 2021r03-q040 / 2014h26h-q004 / 2023r05-q038): 本文と矛盾なし。2017h29a-q008 (系統図 quiz、正答 パレート図、系統図は誤答肢) は `terms[1].points[1]` で解け、系統図の one とも衝突しない。2014h26h-q014 (ABC 分析 → パレート図) / 2016h28h-q032 (度数の棒 → ヒストグラム) / 2023r05-q038 (2 量の関係 → 散布図) は 管理図 points[1]・[2] と一致。ロジックツリー・コンセプトマップは quiz なし (前者の引用題 2013h25a-q090 は長文の事例題)。
5. **D-198 写し**: validate の copy guard = 0 件。独立照合: 単元の JP 文字列 108 本 (派生除く) × topic 内全 98 題の題文 + 選択肢を 12 字連続照合 — (i) カタカナ 4 字以上と英数を遮蔽 (遮蔽後の実字 6 未満の窓は除外) **0 件**、(ii) 遮蔽なし **0 件**、(iii) 1〜2 字置換の近似 (12 字窓の編集距離 ≤2) **0 件**。文単位の bigram Dice 最大 0.30 (`overview_rows[0].one_line_jp` ↔ 2022r04-q048 正答肢、「魚の骨…形」の標準用語のみ共有; 較正 HIGH = 0.52) → 写しなし。目視: カタカナの多い文 (フィッシュボーンチャート one・points、ロジックツリー one、コンセプトマップ one・points) は題文の言い回しを使わない。比喩・図 (料理の焦げ / 通勤時間 / 英会話の目標 / 部屋の散らかり / 人物相関図 / 会議短縮の系統図 / 問い合わせ減のロジックツリー) はいずれも引用題に無い場面 (a1 で指摘の「プログラム」単位も `fig.steps[0]` から除去済み)。
6. **D-195 / D-197 / D-200**: 結論先行 (one = 1 文 × 5、太字あり)、展開 2〜3 文、定義前使用 (特性 = detail の括弧注、CL/UCL/LCL = detail で導入 [a1 LOW 解消]、MECE = detail で「漏れも重複もない分け方」と注、目的・手段・概念 = one で太字)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh/en 相当) → `freq_badge`「頻出」と `kind:"exam"`・英文の every 内 very のみ (偽陽性)。D-197 羅列: validate `listingRun` は**単元の見出し語どうし**の ・/、連結のみ数える → 0。「人・設備・材料・方法」(detail、例えば付き)・「火加減・道具・材料・手順」(analogy)・「CL・UCL・LCL」(hook) は見出し語ではない 3〜4 項の列で D-197 の対象外。図の型 (管理図 = flow steps 4、系統図 = tree steps 3、ロジックツリー = tree static、フィッシュボーン・コンセプトマップ = 図なし; 全て登録内)。D-200: 考点数 2/3/1/2/1 (≤3)、JP 文数 1〜2・字数 45〜73 (≤100、最大は フィッシュボーン points[0])。**framing** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0。
7. **D-205**: 改訂のある文書 (規格・法令・ガイドライン・知識体系) の構成要素数・名称は本単元に出ない → N/A。大骨の分類 (人・設備・材料・方法) は「例えば」付き。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (「〜だけ」「〜ではない」の照合) → MEDIUM 1 件 (M1、hook と detail の略号の食い違い)。書き方 8 (対比の出現欄) → 下記列挙、全て ≤2。書き方 9 (限定条件) → §2 表、落ち 0。§6 → L4。§9 言い直し → L5。
9. **三語**: zh・en が jp と同じ事実か、図ラベル・caption・比較行の三語一致、one_zh / one_en 全 5 用語に見出し語の `[[jp:]]` あり (D-202)、zh 訳語が `zh_terms.json` に一致 (鱼骨图 / 控制图 / 系统图 / 逻辑树 / 概念图 / 因果图 / 帕累托图 / 散点图 / 直方图 / ABC 分析)。`[[jp:]]` 原語 12 種中 11 種は jp 本文に同表記で実在、`[[jp:ABC分析]]` のみ jp 本文が「ABC 分析」(空白入り) — 同一語で表記の空白差 (validate の jp-origin 検査は zh/en 側のラベル有無のみを見る) → O2。loc-review の LOW 8 件のうち未反映が 7 件 → L6〜L8。
10. **前単元 u01 との整合**: u01 特性要因図 one「大きな分類から細かな要因へ枝分かれさせて魚の骨の形」↔ u02 detail「大骨に大分類、小骨ほど具体的」一致。u01 hook「形から『フィッシュボーンチャート』」↔ u02 one・goals「別名・同じ図」・hook (fish + bone) 一致。結果 (特性) = 頭 は両単元の図・本文で一致、u01 図の分類 (人 / 方法 / 設備) は u02 detail の例と整合。u01 points[1]「件数は数えない」↔ u02 `pairs[0].rows[2]`「言葉で書いた原因の候補」一致。**矛盾なし**。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6)。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | フィッシュボーンチャート | OK — exam 1 / 2 題: 特性要因図と同じ図の 2 つの呼び名、結果に効く要因を骨に沿って書き出し大もとの原因を探る (2014h26h-q004 正答イ 特性要因図 [魚の骨の形の図] / 2022r04-q048 正答ウ [原因候補を魚の骨の形で整理し根本原因を検討]) / mix: 件数の多い順に優先度を決めるのはパレート図で役割が違う (2022r04-q048 誤答エ を正しく否定)。限定条件: q004 の「品質に影響する事項の関係を整理」は「結果に効いている要因」で保持。detail「右端の頭に結果 (特性)」・大骨 = 大分類・小骨ほど具体は標準 | OK (図なし) | en 冠詞欠け L6 | L4 (analogy) / L6 |
| 2 | 管理図 | OK — exam 1 / 1 題: 上下の管理限界線を基準に、はみ出した値を異常として見つける (2021r03-q040 正答ア; 題の前提 = プログラムごとの値で時系列ではない → detail「横軸に時間の順**やサンプルの番号**」で保持)。「〜だけ」を言わず、detail・図・key_points の「片側に続く点」と両立 / mix: 大きい順の棒 + 累積比率の折れ線 = パレート図、ABC 分析もこの図、管理限界線なし (2017h29a-q008 正答ウ / 2022r04-q031 正答エ / 2014h26h-q014 正答エ) / mix: 2 量の関係 = 散布図、区間ごとの度数 = ヒストグラム、いずれも限界線で判定しない (2023r05-q038 正答イ / 2016h28h-q032 正答エ)。CL = 平均、UCL/LCL の間で不規則なら偶然のばらつき = 安定、限界外・片側連続 = 偶然では説明しにくい原因の兆し → 正しい。flow steps 4 (測定 → CL・限界線を決める → 打点 → 限界外・偏りを調べる) は本文と一致、限界は「普段のばらつきの幅から」決める = 規格限界と混同なし | OK | en 指示語 L7 | **M1** (hook) / L3 (図) |
| 3 | 系統図 | OK — exam 1 / 1 題: 下の段の手段の実現が すぐ上の段の目的の達成につながる (2011h23a-q099 正答イ: 解決が別の要望の解決を促す連鎖の順序 — 手段 → 目的の連鎖と矛盾なし、題の記法は持ち込まない)。one・detail・tree steps 3 (目的 → 一次手段 → 二次手段) と同じ向き。detail「ある段の手段は下の段から見ると目的」「担当・期限を決めて着手できる具体策で止める」は標準。points[0] 2 文目「上から下へ段を重ねて並ぶ」は配置の向きを言い切る (L1) | OK | zh 付加 L8 / hook_en L8 | L1 / L2 (qid 間接) / L4 / L5 |
| 4 | ロジックツリー | OK — exam 1 / 1 題: 原因分析に使うときは問題を根に、それを生む原因を下位の枝に (2013h25a-q090 正答イ: 原因 → 問題 → その先の問題の順 — 原因が下位という主張と矛盾なし、矢印記法は持ち込まない) / mix: 系統図と同じ樹形だが、系統図は目的 → 手段、ロジックツリーは原因分析にも対策整理にも使う (向きの対立を言わず対象・用途で区別、a1 (a) 解消)。detail「なぜ → 原因の掘り下げ / どうやって → 対策の整理」、MECE の説明 正しい。static tree (問い合わせ減 → 訪問者減・問い合わせまで進まない → 下位原因) は「なぜ」の木で points[0] と一致 | OK | OK | L2 (qid 間接) / L4 |
| 5 | コンセプトマップ | OK — mix 1 (qid なし): ロジックツリーは上位を下位へ分ける一方向の構造、コンセプトマップは概念どうしを結ぶ網の目 — IT パスポートの水準で正しい (概念 = 点、線に関係語 [「原因となる」「一部である」]、2 概念 + 線で 1 文、の説明も標準)。analogy (人物相関図) は線にラベルを書く点を別場面で示す | OK (図なし) | zh「父子」L8 | L8 |

**単元レベル**: goals 3・overview_cols 2 (形 / 主な使い道)・overview_rows 5・pairs 3 組 (フィッシュボーン / 管理図 3 行 key 1、系統図 / ロジックツリー 3 行 key 1、ロジックツリー / コンセプトマップ 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge 4 (§1-4)。key_points[1] は管理図 detail と一致 (限界外 + 片側連続)。事実誤りなし (M1 を除く)。

**対比の出現欄 (書き方 8)**: ① 系統図 / ロジックツリー: `pairs[1]`、`terms[3].points[1]` = 2 → 許容 (overview の「樹形 (目的から手段へ)」「樹形 (問題から要素へ)」は D-195 §3 総表の構造)。② ロジックツリー / コンセプトマップ: `pairs[2]`、`terms[4].points[0]` = 2 → 許容 (a1 で指摘の コンセプトマップ detail の反復は解消)。③ フィッシュボーン / パレート図: `terms[0].points[1]` のみ (単元内 1)、ただし u01 `特性要因図.points[1]` と同じ対比・同じ qid (2022r04-q048) → O1。④ 管理図 / パレート・散布図・ヒストグラム: `terms[1].points[1..2]` のみ、ただし u01 `パレート図.points[0]・[2]` とほぼ同内容 → O1。⑤ フィッシュボーン / 管理図: `pairs[0]` のみ。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 8 (うち 建議修 3)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** (書き方 7、hook が detail と食い違う; **a2 の修正で新規発生**) | `terms[1](管理図).hook_jp` / `hook_zh` / `hook_en` (派生 `memory_hook_*`、`summary.memory_hooks_*[1]` は自動追従) | 「C は Center、U は Upper、L は Lower の頭文字」と 1 文字ずつの対応で略号全体を説明するため、UCL・LCL に当てはめると「Upper **Center** **Lower**」と読める。実際は CL = Center **Line**、UCL / LCL = Upper / Lower **Control Limit** で、UCL の C は Control、末尾の L は Limit / Line。同じ用語の detail は UCL を「上方**管理限界線**」と呼んでおり、hook がこの名称と食い違う誤った展開を運ぶ。a1 jp-review #1 の LOW「CL 未定義・C の由来未説明」への対応として書かれた文 (改稿の退行)。試験で略号の展開は問われにくいため HIGH とはしない | jp「3 本の線は CL・UCL・LCL。C は Center (中心)、U は Upper (上)、L は Lower (下) の頭文字。」→「3 本の線は CL・UCL・LCL。CL は Center Line (中心線)、UCL と LCL は Upper / Lower Control Limit (上方 / 下方の管理限界線) の頭文字。」/ zh「3 条线是 CL、UCL、LCL。C 取自 Center（中心），U 取自 Upper（上），L 取自 Lower（下）。」→「3 条线是 CL、UCL、LCL。CL 取自 Center Line（中心线），UCL 和 LCL 取自 Upper / Lower Control Limit（上 / 下控制界限）的首字母。」/ en "The three lines are CL, UCL and LCL: C for Center, U for Upper, L for Lower." → "The three lines are CL, UCL and LCL: CL stands for Center Line, and UCL and LCL for Upper and Lower Control Limit." |
| L1 | LOW **建議修** | `terms[2](系統図).points[0].text_jp/zh/en` 2 文目 | 「目的と手段のこの連鎖が、上から下へ段を重ねて並ぶ」は図の配置の向きを言い切る。系統図は目的を左・手段を右へ展開する横向きで描かれることも多く (新 QC 七つ道具の通例)、引用題 2011h23a-q099 は図の配置を何も言わない。単元内の「上の段 / 下の段」は階層の上下 (detail・key_points・tree 図と整合) と読めるため誤学習には至らず MEDIUM (限定の追加) とはしないが、a1 で 2 回書き直された欄のため向きを外すのが安全 | jp「目的と手段のこの連鎖が、上から下へ段を重ねて並ぶ。」→「目的と手段のこの連鎖が、段を重ねて続いていく。」/ zh「目的与手段（[[jp:手段]]）的这种连锁，从上到下逐层排列。」→「目的与手段（[[jp:手段]]）的这种连锁，一层层延续下去。」/ en "This chain of objectives and means ([[jp:手段]]) is stacked level by level from top to bottom." → "This chain of objectives and means ([[jp:手段]]) continues level by level." |
| L2 | LOW | `terms[2].points[0].qids` (2011h23a-q099)、`terms[3].points[0].qids` (2013h25a-q090) | 引用題は因果の連鎖の順序を選ぶ事例題で、系統図・ロジックツリーの図そのものは問わない (a2 jp-review でも low)。正答と矛盾はなく、記法も持ち込んでいない | 記録のみ |
| L3 | LOW | `terms[1].fig`、`terms[2].quiz` | 管理図の図は作成手順 (flow steps) で、CL / UCL / LCL と点の位置関係そのものは図に出ない (§0-8 により最大 low)。系統図の quiz は正答がパレート図の 1 題のみ | 記録のみ |
| L4 | LOW | `terms[0].analogy_*`、`terms[2].analogy_*`、`terms[3].analogy_*` | 比喩が別場面でその図を実際に作った用例 (料理の焦げを骨に分ける / 英会話の目標分解 / 部屋の散らかりの理由の分解) で、定義と別の手がかりというより用例 (D-203 §6) | 記録のみ |
| L5 | LOW | `terms[2].points[0].text_*` 1 文目 | 「下の段の手段の実現が上の段の目的の達成につながる」は detail 1 文目と key_points[2] の言い直しに近い (D-203 §9) | 記録のみ (L1 の修正後も 1 文目は残してよい) |
| L6 | LOW (loc-review 未反映) | `terms[0].points[0].text_en`、`terms[0].detail_zh` | en 文頭が無冠詞 "**Fishbone chart** (…) and **cause-and-effect diagram** (…) are two names for one diagram."。detail_zh は 2・3 文目を「；」でつなぎ 2 文 (jp・en は 3 文) | 記録のみ (任意: en "A **fishbone chart** ([[jp:フィッシュボーンチャート]]) and a **cause-and-effect diagram** ([[jp:特性要因図]]) are two names for the same diagram.") |
| L7 | LOW **建議修** (loc-review 未反映、意味の曖昧さ) | `terms[1](管理図).points[1].text_en` | "ABC analysis … also uses this chart, and it has no control limits." の it が ABC analysis を指すとも読め、jp「(パレート図は) 管理限界線は持たない」の主語がずれる | en "ABC analysis ([[jp:ABC分析]]) also uses this chart, and it has no control limits." → "ABC analysis ([[jp:ABC分析]]) also uses this chart. A Pareto chart has no control limits." |
| L8 | LOW (loc-review 未反映) — 「父子」のみ **建議修** | `terms[4](コンセプトマップ).analogy_zh`、`terms[2].detail_zh`、`terms[2].hook_en`、`terms[2].points[0].text_zh/en` の `[[jp:目的]]`/`[[jp:手段]]` | (a) analogy_zh「父子」は jp「親子」(親と子一般) を父と息子に狭める (意味ずれ) → **建議修**。(b) detail_zh「马上着手」は jp に無い「すぐ」の付加。(c) hook_en "In English it is a tree diagram" は term_en 自体が tree diagram で手がかりにならない。(d) jp が見出し語扱いしない 目的・手段 に zh/en で `[[jp:]]` 併記 | (a) zh「就像电视剧的人物关系图，把登场人物排开，在线上写明“父子”“同事”等关系。」→「就像电视剧的人物关系图，把登场人物排开，在线上写明“亲子”“同事”等关系。」/ (b)〜(d) 記録のみ (任意: (b)「马上着手」→「可以着手」) |

**範囲外の観察**:
- O1 u01 との単元またぎの重複: フィッシュボーン / パレート図の対比 (2022r04-q048) が u01 `特性要因図.points[1]` と u02 `terms[0].points[1]` に、パレート図の形・散布図 / ヒストグラムの区別が u01 `パレート図.points[0]・[2]` と u02 `terms[1].points[1..2]` にほぼ同内容で出る。事実は両単元で一致し矛盾なし。管理図との区別という u02 側の目的があるため記録のみ。
- O2 `[[jp:ABC分析]]` の原語は jp 本文で「ABC 分析」(空白入り) と表記。同一語の表記差で validate (jp-origin は zh/en 側のラベルの有無のみ検査) も 0。
- O3 `unit_summary_*` は v1 と同文 (未改稿)。ロジックツリー・コンセプトマップは term quiz なし (validate の confirm 数 3〜5 は challenge 4 で充足)。

確認済みで問題なし: a1 の誤り (a)(b)(c) 再発なし (§1-3)、管理限界と規格限界の混同なし、u01 との矛盾なし、限定条件 (考点 7 件で保持)、§9 禁止句 0、framing 0/0/0、D-197 (validate 0、見出し語以外の列は対象外)、D-200 (≤2 文・≤73 字)、D-205 N/A、写し (validate 0 / 独立照合 遮蔽あり 0・遮蔽なし 0・近似 0、Dice 最大 0.30)、one_zh / one_en 見出し語併記 5/5、zh 訳語表一致、図種 (flow steps / tree steps / tree static / 図なし ×2 = 登録内)、用語・`term_zh`・`term_en` の v1 不変量、unit = merged.json。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1 管理図 hook の略号展開) |
| LOW | **8** (建議修 3: L1 / L7 / L8(a)、M1 と同じ補丁で推奨; 記録のみ: L2〜L6、L8(b)〜(d)) |

## 5. 判定

**FAIL** (D-199: MEDIUM 1 件)。全 5 用語・考点 9 件 (qid 付き 7 件)・引用 9 題 + 未引用の quiz / challenge で、考点の主張は正答と一致し、誤答肢を支持する記述も限定条件の落ちも無い。a1 の誤り 3 類型は再発していない。阻止は M1 のみ (a2 で新規に書かれた管理図 hook が UCL / LCL を誤って展開できる)。M1 を B3 補丁 (hook_jp/zh/en の文字列置換、派生は自動追従) で直せば HIGH 0 / MEDIUM 0 で PASS 相当。L1・L7・L8(a) を同じ補丁で直すことを推奨。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-02-u02
✓ strategy-01-02-u02 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-02-u02
✓ strategy-01-02-u02 parity: 27 locations, 0 diff
EXIT=0
```
