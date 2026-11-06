# Rule A 全数抽検 — strategy-01-01-u03 (企業の社会的責任と環境対応)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / jp-review / localiser / tr-review) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 照合スクリプト・補丁の試し適用は scratchpad)。
- **Date**: 2026-11-06 (S146/S147 第 21 批 b21)、repo HEAD `1e197f46` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b21-u03-a1` merge 結果、`merged.json` と同一、sha256 先頭 `bb4e2c10a31390b5`)。workflow = D-208 + D-209 + D-210。journal `data/ip/textbook/.planning/v2/strategy-01-01-u03/journal.b21-u03-a1.jsonl` = write r0 → jp-review r1 PASS (low 12) → loc r0 → tr-review r1 PASS (low 7)。過去の HIGH / MEDIUM 指摘なし (a1 で一発 PASS)。
- **対象**: `data/ip/textbook/units/strategy-01-01-u03.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (CSR / 社会的責任投資 / SRI / ステークホルダ / SDGs / グリーンIT / カーボンフットプリント) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。topic = strategy-01-01 経営・組織論。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205、D-208 (失敗型の明示点検)、D-209 ((iii) の免除 2 型)、D-210 (改正前の文言の引用題)。比較: `data/ip/textbook/.planning/v2/strategy-01-01-u03/v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致、`unit_summary_*` は v1 と同文)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・D-198 (iii)・zh / en の語が誤答肢の読みに寄る (b18 u05 型) / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え; 一致断片は 12 字以内)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・cell・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版 (`**` 除去、`[[jp:X]]` → 括弧の原語) であることをスクリプトで確認 (実質の不一致 0)。`terms[1](社会的責任投資).hook_*` は欄なし、`terms[2](SRI).analogy_*` は空 (validate 許容; SRI は points も 0 件)。
2. **考点 × 引用題 (考点 全 10 件 = exam 7 + mix 3、qid 付き 7 件、引用 qid 延べ 9 件 = 異なり 9 題)**: `data/ip/quiz/questions.json` (+ `translations/<exam>.json` の `stem_jp_clean` と zh / en 訳) から題文・選択肢・`correct_answer` を再読 (全題 topic `strategy-01-01`)。正答との一致、誤答肢を支持しないこと、支持外の一般化・限定、限定語の保持、(iii) を 1 件ずつ確認 (§2、D-209 は §4)。計算題なし。
3. **quiz / challenge_questions** (用語内 quiz 計 6 枠 + challenge 3 題 = 異なり 7 題、全て本文の引用題で未引用 0 題): 本文と矛盾なし (§2)。challenge は v1 の 5 題 (2020r02o-q009 / 2026r08-q014 / 2009h21a-q009 / 2009h21h-q013 / 2010h22a-q017) から 3 題 (2026r08-q014 / 2020r02o-q009 / 2009h21a-q003) に変わったが、3 題とも本単元の用語の題で本文で解ける。
4. **D-198 写し**: validate の copy guard = 0 件、`choice-echo` warn = 0 件。独立照合: 単元の JP 文字列 118 本 (派生除く; 本文・考点・図ラベル / セル / caption・総表・対比表・goals・key_points・unit_summary) × topic 内全 62 題の題文 (`stem_jp_clean` 優先) + 選択肢 (計 310 本)、12 字連続照合 (句読点・記号・空白・記法除去):
   - **カタカナ 4 字以上と英数を □ に遮蔽** (遮蔽後の実字 6 未満の窓は除外) → **0 件** / **遮蔽なし** → **0 件**。
   - **近似一致 (12 字窓で 1〜2 字置換)**: 3 件 — `key_points_jp[0]` ↔ 2010h22a-q022 正答イ (「…責任を果たすことが企…」、2 字差)、`key_points_jp[2]` ↔ 2020r02o-q009 題文 (「…17のゴールから成」、2 字差)、`terms[0].one_jp` ↔ 2015h27a-q021 題文 (「利益を追う/の追求だけでなく社会」、2 字差)。いずれも CSR / SDGs の標準定義の定型句 (利益だけでなく社会…・責任を果たす・17 のゴールから成る) で、題固有の場面・数値を含まない → 偽陽性 (L3 / L5 で記録)。
   - **文の類似度 (考点 × 引用題の題文・全選択肢、bigram Dice / 正規化 ed)**: 最大 `terms[0].points[2]` ↔ 2026r08-q014 題文 **Dice 0.38 / ed 0.77**、次いで `terms[4].points[1]` ↔ 2020r02o-q009 題文 0.31 / 0.90、`terms[0].points[0]` ↔ 2010h22a-q022 正答イ 0.26 / 0.79。全単元文字列 × topic 全文でも最大 `overview_rows[4].one_line_jp` ↔ 2019r01a-q035 題文 0.41 / 0.75、`key_points_jp[0]` ↔ q022 イ 0.39 / 0.84 → **全て HIGH 較正 (ed 0.14 / Dice 0.52) に届かない**。
   - **カタカナの多い文の目視**: ステークホルダ・グリーンIT・カーボンフットプリントの one / detail / 考点、グリーンIT の表、カーボンフットプリントの段階図 caption — 題文・選択肢の語順をなぞる箇所なし (q020 正答エ の「印刷を制限・ディスプレイで閲覧」は「紙の消費を抑えるペーパーレス化」と一般化、q003 正答ア の「原材料の使用量・消費電力」は「環境に配慮した製品づくり」と一般化)。
5. **D-195**: one = 1 文 × 7 (太字あり)、detail 2 文 × 7、図 = CSR tree static (4 節) / ステークホルダ tree static (6 節) / SDGs tree static (3 枝 7 葉) / グリーンIT table static (2 行 3 列) / カーボンフットプリント flow steps 4 / 社会的責任投資・SRI は図なし → 全て登録図種。定義前使用: 利害関係者 (ステークホルダ one 内の同格)、ライフサイクル (CFP one の括弧注)、環境負荷 (グリーンIT one 太字・detail で中身)、ストックホルダ (mix 考点内の括弧で株主と併記)、ISO 26000 (考点内で「…国際規格」と説明)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が / 务必 / 考试 / 必须 / must / important / always / exam): `freq_badge`「頻出」、`"kind":"exam"`、「出る」8 件 (温室効果ガスが出る / 後に出る = 通常の用法)、「選ぶ」11 件 (投資先を選ぶ = 定義の語)、en "Examples" 4 件 → 定型締め句 0。近接形「担い手とされ」1 件 → L11。
6. **D-200**: 考点数 3/1/0/1/2/2/1 (≤3 ✓)、各 JP 1 文・35〜75 字 (≤100 ✓、最大 CSR `points[2]` 75 字)。**framing 件数** (`validateV2.ts` の `pointFraming`、全考点): jp 0 / zh 0 / en 0 (上限 2)。D-197 羅列: validate 0。
7. **D-202 / D-203 単元全体点検**: 書き方 7: CSR「利益だけでなく社会・環境への責任」(one・pt0・fig・key_points[0]・総表) 一致; CSR の相手 = ステークホルダ全体 (CSR detail・ステークホルダ detail・key_points[0]・総表) 一致; SRI = 社会的責任投資と同一 (one・detail・総表・key_points[1]) 一致; 主体の違い (社会的責任投資 mix 考点・pairs[0].rows[0..2]) 一致; SDGs 2015 採択・2030 期限・17 ゴール (one・detail・pt0・pt1・hook・key_points[2]・総表) 一致; グリーンIT の 2 面 — `one_*`・`key_points_*[3]` は第 2 面を「社会全体の省エネ」(kp は第 1 面も省エネのみ) とし、`detail`・`points[1]`・表は第 2 面に紙などの消費 (資源の節約) を含める → L1; CFP = 指標 / グリーンIT = 取組み (mix 考点・pairs[1].rows[0]・総表) 一致。書き方 8: CSR / 社会的責任投資の主体の対比 = `pairs[0]` + mix 考点 の 2 箇所 (総表は構造) → 許容。グリーンIT / CFP = `pairs[1]` + CFP mix 考点 の 2 箇所 → 許容。株主 / ステークホルダ = mix 考点のみ (detail は列挙) → 許容。書き方 9: §2 に記載。
8. **D-205 / D-210 (改訂される文書の構成数・名称 / 改正前の文言)**: 単元が数・構成要素を述べる文書は ISO 26000 (構成の数・中核主題名は述べない) と SDGs (17 ゴール) のみ → §5。法令・改正前の文言を引く引用題なし。
9. **三語**: zh・en が jp と同じ事実 (追加・欠落なし; en SDGs detail の "agenda" のみ jp にない語 → L2)、図ラベル・表セル・caption・pairs・総表の三語一致、`[[jp:]]` 原語 8 種 (企業の社会的責任 / 社会的責任投資 / ステークホルダ / ストックホルダ / 持続可能な開発目標 / グリーンIT / ペーパーレス化 / カーボンフットプリント) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語併記 7/7、zh 訳語 (validate B6 warn 0; 企业社会责任（CSR） / 社会责任投资（SRI） / 利益相关者 / 利害关系者 / 可持续发展目标（SDGs） / 绿色 IT / 碳足迹 / 服务器 — `zh_terms.unit.json` どおり)。
10. **zh / en が誤答肢の読みに寄る型 (b18 u05)**: 引用 9 題の誤答肢 zh / en 訳と本文 zh / en を突き合わせ (§6-6)。該当なし。
11. **機械ゲート**: §9 に出力全文 (補丁案の試し適用後も 0 issues / 0 diff、独立 copy 照合の新規ヒット 0 を確認)。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | CSR | OK — exam 3 / 5 題: ① 利益の追求に加えて社会・環境の要請に応えることが企業価値を高める考え方 (2010h22a-q022 正答イ; 誤答ア ベンチマーキング・ウ ガバナンス・エ コアコンピタンス の要素なし / 2015h27a-q021 正答イ CSR = 分類型; 題の「社会への貢献や地球環境の保護**など**」は考点で「社会や環境が企業に求めること」と一般化され範囲を閉じない) / ② 寄付に限らず本業を通じた活動 (環境配慮の製品づくり・事業の知識を地域に役立てる) も含む (2009h21a-q003 正答ア = 原材料・消費電力を減らした製品; 誤答イ 差別化・ウ セル生産・エ 買収 を支持しない / 2018h30a-q008 正答ア CSR = 分類型、主体名・業種・相手 [小売業・小学校・流通] は使わない) / ③ ISO 26000 = 組織の社会的責任の手引きの国際規格、企業の社会的責任を指す語 = CSR (2026r08-q014 正答ア; 誤答 SDGs・コーポレートガバナンス・ソーシャルメディアポリシー の要素なし; 「手引き (guidance)」は ISO 26000 の性格どおり、ISO 26000 が「CSR」を定義するとは言わない)。tree 図 4 節は detail の列挙と一致 | OK (近似一致は標準定義の定型 L3、pt2 は L4) | OK (zh「地区」L10) | L3, L4, L7 |
| 2 | 社会的責任投資 | OK — mix 1 (qid なし): 投資家が投資先を選ぶ方法、CSR とは主体が異なる — 標準どおり。one「業績や財務に加えて社会・環境への責任の果たし方も評価」= SRI の一般定義。quiz 2015h27a-q021 は CSR を答える題で社会的責任投資を直接は問わない (L8) が、本文 (CSR one・本用語 mix 考点) で解け矛盾なし | OK | OK | L8 |
| 3 | SRI | OK — 考点なし: Socially Responsible Investment の頭字語で社会的責任投資と同一 (シラバスの別名を同一物として扱う = D-208 型 3 に該当しない)。hook「SR は CSR と共通、I = Investment」正しい | OK | en one の重複 L10 | L7, L10 |
| 4 | ステークホルダ | OK — mix 1 (qid なし): 株主 (ストックホルダ) はステークホルダの一部。one「影響を受けたり与えたりする利害関係者の総称」・detail の列挙 (株主・従業員・顧客・取引先・地域社会・行政) は標準。topic 外 (management-10-27) のプロジェクトのステークホルダ題 (2016h28h-q054 正答 = チームメンバも含む / 2018h30h-q036) とも「〜だけ」の限定が無く矛盾しない (O2) | OK | OK (zh「地区社会」L10) | L7 |
| 5 | SDGs | OK — exam 2 / 2 題: ① 国連で採択、期限 2030 年 (2019r01a-q035 正答ア; 誤答 SDK・SGA・SGML の要素なし) / ② 17 のゴールで構成、持続可能な世界の実現を目指す (2020r02o-q009 正答イ; 誤答 COP21・UNESCO・WHO の要素なし)。one「2015 年に採択」は国連総会決議 (2015-09) どおり。両考点は分類型の題の題文 (= 定義) を一般定義として述べる (D-209 B、§4)。tree 図は「例」と明記 | OK (L5) | zh one 循環 / en "agenda" L2・L10 | L2, L5, L6 |
| 6 | グリーンIT | OK — exam 2 / 2 題: ① 機器の省エネにとどまらず IT を活用した社会全体の省エネ・環境保護も含む (2010h22a-q005 正答ウ = 分類型; 誤答 エコファーム・環境アセスメント・ゼロエミッション の要素なし) / ② ペーパーレス化のように IT の使い方を変えて資源を節約するのもグリーンIT (2014h26a-q020 正答エ; 誤答ア ブルーライト軽減・イ エアシャワー・ウ 災害バックアップ を再演しない)。table 2 行は detail と一致。**one / key_points[3] の第 2 面の範囲が考点 ② ・detail・表より狭い** → L1 | OK | OK (zh「活用」L10) | **L1**, L7 |
| 7 | カーボンフットプリント | OK — mix 1 (qid なし): 排出量を量って示す指標で、取組みであるグリーンIT とは役割が異なる — 標準どおり。one「原材料の調達から廃棄までのライフサイクルの温室効果ガスを CO2 に換算」= CFP の一般定義 (CO2 換算量)。flow 4 step (調達 → 生産 → 流通・使用 → 廃棄・リサイクル) は one と一致。引用題なし | OK | en "printing" / "customers" L10 | L7, L10 |

**単元レベル**: goals 3・overview_cols 2 (種類 / 誰が・何のために)・overview_rows 7・pairs 2 組 (CSR / 社会的責任投資 3 行 key 1、グリーンIT / CFP 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge 3 題 (2026r08-q014 / 2020r02o-q009 / 2009h21a-q003 — 本文と矛盾なし)。`source_figures` 空。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 11 (うち 建議修 2)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[5](グリーンIT).one_jp/zh/en` (+ 派生 `definition_*`)、`key_points_jp/zh/en[3]` (+ 派生 `summary.key_points_*[3]`) | one は第 2 面を「IT を使った社会全体の**省エネ**」に、key_points[3] は両面とも「省エネ」に絞るが、同用語の `detail` (後者 = 人や物の移動、紙などの消費を減らす)・`points[1]` (ペーパーレス化で資源を節約するのもグリーンIT; 2014h26a-q020 正答エ)・表 2 行目 (紙などの消費) は第 2 面に資源の節約を含め、2010h22a-q005 の題文も第 1 面に「資源の有効利用」を含む。「〜だけ」の語は無く矛盾ではない (jp-review low の未修) が、要点だけ読むと紙の節約 = グリーンIT と結びにくい。観点 7 の範囲ずれ (措辞級) | one: jp「…IT を使った社会全体の省エネの両面から…」→「…IT を使った社会全体の省エネや資源の節約の両面から…」/ zh「…以及利用 IT 推动整个社会节能这两方面…」→「…以及利用 IT 推动整个社会节能和节约资源这两方面…」/ en "…and using IT to save energy across society as a whole." → "…and using IT to save energy and resources across society as a whole." ・ key_points[3]: jp「IT 自体の省エネと IT を使った社会の省エネの両面から」→「IT 自体の省エネ・省資源と IT を使った社会の省エネ・省資源の両面から」/ zh「从 IT 本身的节能和利用 IT 推动社会节能两方面」→「从 IT 本身的节能与节约资源、以及利用 IT 推动社会节能与节约资源两方面」/ en "saving energy in IT itself and using IT to save energy across society." → "saving energy and resources in IT itself and using IT to save energy and resources across society." (scratch で試し適用: validate 0 issues・parity 0 diff・独立 copy 照合の新規ヒット 0) |
| L2 | LOW **建議修** | `terms[4](SDGs).detail_en` (+ 派生 `explanation_en`) | "The agenda is divided into 17 goals" の agenda は jp にない語で、本文のどこにも定義されない。SDGs は 2030 アジェンダの一部なので「agenda = SDGs」と読まれるおそれ (tr-review low の未修)。jp「目標は 17 のゴールに分かれ」/ zh「整体目标分为 17 项」は正しい | en "The agenda is divided into 17 goals" → "The SDGs are divided into 17 goals" (試し適用で validate / parity 0) |
| L3 | LOW | `terms[0].points[0].text_jp`、`key_points_jp[0]`、`overview_rows[0].one_line_jp`、`terms[0].one_jp` | 2010h22a-q022 正答イ (経済的成長だけでなく / 環境や社会の要請に責任を果たす / 企業価値の向上) を句ごとに同義語へ置き換え同じ順で述べる (jp-review low 記録済)。Dice 0.26 (pt0)・0.39 (kp[0])・0.35 (ov0)、近似一致 2 件 (§1-4) で、いずれも HIGH 較正に届かない。正答が述べるのは CSR の標準定義で、誤答肢のなぞりでも題固有の場面・数値の流用でもない | 記録のみ |
| L4 | LOW | `terms[0].points[2].text_jp` | 2026r08-q014 (分類型) の題文の 2 部構成 (ISO 26000 = 組織の社会的責任の国際規格 → 企業の社会的責任を表す語) を一般定義として述べる (Dice 0.38)。D-209 B (分類型の正解を見出し語の定義として述べる) に当たり、誤答 3 肢の語・組・順序は出さない → (iii) でない | 記録のみ |
| L5 | LOW | `terms[4].points[0]` / `points[1]` / `one_jp` / `detail_jp` / `key_points_jp[2]` | SDGs の 2 考点は分類型 2 題の題文 (国連採択・2030 年 / 17 ゴール・持続可能な世界) を定義として述べ、同じ 3 属性が one・detail・hook・考点・要点・総表で繰り返される (§9 同義の言い直し; jp-review low)。「17 のゴール」は D-205 の構成数だが、SDGs は 2015 採択・2030 年までの固定の目標で改訂版が存在しない (§5) → 版の明記は不要 | 記録のみ |
| L6 | LOW | `terms[4].fig.data.root.children[0].children[0]` / `children[2].children[1]`、`terms[4].analogy_*` | 図の「貧困や飢餓をなくす」「海と陸の豊かさを守る」は 2 ゴールを 1 節にまとめる (根に「例」あり、jp-review low)。比喩「クラス全員で決めた目標表」は企業・個人も決めた側に読める余地があるが、one / detail は「国連で採択」「企業や個人も担い手」と明記し、比喩の結論 (同じ項目を各自の立場で) は detail と一致 (D-204 の矛盾には至らない) | 記録のみ |
| L7 | LOW | `terms[0].hook_*` / `terms[2].hook_*`、`terms[0].detail_jp` / `terms[3].detail_jp` / `key_points_jp[0]`、`terms[5]` の 2 面 (one・図・detail・考点・比喩・要点)、`terms[6].detail_jp` / `fig.steps[3]` / `analogy_jp` | D-203 §6 / §9 の low 類 (jp-review low 5 件の未修): CSR / SRI の hook が略称展開の言い直しで「SR を共有」が二重、「CSR の相手 = ステークホルダ全体」が 3 箇所、グリーンIT の 2 面が 6 箇所、CFP の「足し合わせて CO2 換算」が caption と detail で重複・比喩後半が定義の言い直し。図 (CSR 4 節・ステークホルダ 6 節) が detail の列挙と同順 (飾りに近いが静的図として許容) | 記録のみ |
| L8 | LOW | `terms[1](社会的責任投資).quiz` | quiz 2015h27a-q021 は CSR を答える題 (選択肢 BCP / CSR / M&A / MBO) で社会的責任投資を問わない (jp-review low)。題バンクに社会的責任投資 / SRI を直接問う題は無く (全題 grep 0)、CSR との対比の確認にはなる。`hook` 欄なし・SRI の `analogy` 空は validate 許容 | 記録のみ |
| L9 | LOW | `pairs[1].rows[2]`、`overview_rows[2].extra_jp[1]` / `overview_rows[5].extra_jp[1]` | 「表し方」行のグリーンIT 側「取組みの内容で示す」は対比として薄い。総表「誰が・何のために」列で SRI は「社会的責任投資と同じ」、グリーンIT は主体なし (jp-review low) | 記録のみ |
| L10 | LOW | `terms[4].one_zh`、zh「地区」8 箇所 (`terms[0].detail_zh`・`points[1].text_zh`・`fig` 根の子 [3].label.zh、`terms[3].detail_zh`・`points[0].text_zh`・`fig` 子 [4].label.zh 等)、`terms[5].detail_zh` / `points[0].text_zh`「活用」、`terms[2].one_en`、`terms[6].detail_en`、`terms[6].fig.steps[2].caption_en` | tr-review low の未修: zh SDGs one の「可持续发展目标（SDGs）…是…可持续发展目标」の循環読み (jp も同構造の略称展開文)、「地区社会 / 回馈地区」(自然には「当地社区」)、「活用 IT」(やや和製)、en SRI one の正式名 2 回、en "by printing it on the product" (jp「表示するなど」より狭い)、en "use by customers" (jp「利用者」)。いずれも意味のずれ・誤答肢への寄りなし | 記録のみ (B3 で併せて直すなら tr-review の fix_jp どおり) |
| L11 | LOW | `terms[4].detail_jp` 2 文目 | 「企業や個人も担い手**とされ**」は §9 の「とされる」の近接形。2030 アジェンダ自体が企業・個人を担い手として挙げる事実の帰属で、ぼかしの定型句ではない | 記録のみ (任意: 「担い手とされ、」→「担い手であり、」) |

**範囲外の観察**:
- O1 `unit_summary_*` は v1 と同文 (未改稿)。「CSR・SRI・SDGs・グリーンITなど」は見出し語の連なりで D-197 の形に近いが、validate の D-197 対象外フィールドで事実は正しい。
- O2 ステークホルダは topic 外 (management-10-27 プロジェクトマネジメント) で 8 題に出る (manifest `freq_global` 8)。本単元は企業の文脈で定義し、プロジェクトのステークホルダ題の正答 (チームメンバも含む / 関わる個人や組織) と矛盾せず、誤答 (恩恵を受ける人だけ / スポンサだけ) を支持する「〜だけ」の限定も無い。
- O3 manifest `term_questions` は社会的責任投資に CSR と同じ 5 題を割り当てている (タグ付けの別名扱いの名残)。本文は両者を主体の異なる別概念として正しく教え、SRI = 社会的責任投資を同一物として扱う → D-208 型 3 の誤りは本文側に無い。

確認済みで問題なし: 限定条件 (考点 7 件の qid 付き全て保持; q021 の「など」は一般化され範囲を閉じない)、§9 禁止句 (定型締め句 0)、framing 0/0/0、D-197 (validate 0)、D-200 (≤75 字・1 文)、図の文字列の写し (validate 0、独立照合は 12 字一致 0・近似 3 件は定型の偽陽性)、`[[jp:]]` 原語 8 種実在、one_zh / one_en 併記 7/7、zh 訳語表 (B6 warn 0)、図種 (tree ×3 / table / flow steps 4 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。

## 4. 観察: D-209 / D-210 の適用 (JP 審査の判定の点検)

| 考点 | 引用題の型 | 免除 | 語句・組・順序の再現 | 判定 |
|---|---|---|---|---|
| `terms[0].points[0]` | 2010h22a-q022 記述選択型 (正答イ) / 2015h27a-q021 分類型 | B (正答 = 見出し語の一般定義) | 正答イの 3 句を同義語で同順に述べる (L3)。誤答ア・ウ・エ (ベンチマーキング / 経営者の牽制 / 中核能力) の要素・組・順序は出さない。q021 の題の例示 (社会への貢献・地球環境の保護) は「社会や環境が企業に求めること」と一般化 | (iii) でない (jp-review の判定どおり; 近接度は L3 記録) |
| `terms[0].points[1]` | 2009h21a-q003 記述選択型 (正答ア) / 2018h30a-q008 分類型 | B | 正答アを「環境に配慮した製品づくり」と一般化、q008 の場面 (小売業 A 社・流通センタ・小学校・食料品の流通) は主体・場所・題材とも使わず「事業で培った知識を地域に役立てる活動」と一般化。q003 誤答 (差別化・セル生産・買収) の再演・否定なし。「寄付に限らず」は誤答肢に無い対比 | (iii) でない (jp-review の判定どおり) |
| `terms[0].points[2]` | 2026r08-q014 分類型 (正答ア) | B | 題文の構成を一般定義として述べる (L4)。誤答 3 肢 (SDGs・ガバナンス・SNS ポリシー) は出さず、穴埋め型の「答え + 比較相手」の組の再現もない | (iii) でない |
| `terms[4].points[0]` / `[1]` | 2019r01a-q035 / 2020r02o-q009 分類型 | B | 題文 = SDGs の定義を述べる。誤答 (SDK・SGA・SGML / COP21・UNESCO・WHO) は出さない | (iii) でない (L5 は §9 反復の記録) |
| `terms[5].points[0]` | 2010h22a-q005 分類型 | B | 題文の定義 (機器の省エネだけでなく社会の省エネ・環境保護) を述べる (Dice 0.22)。誤答 3 語は出さない | (iii) でない |
| `terms[5].points[1]` | 2014h26a-q020 事例選択型 (正答エ) | — | 正答エを「ペーパーレス化」と一般化。誤答ア・イ・ウ の場面 (ブルーライト・エアシャワー・バックアップ) を再演・否定しない | (iii) でない |
| `terms[1].points[0]`、`terms[3].points[0]`、`terms[6].points[0]` (mix、qid なし) | — | A (取り違えやすい 2 語を両側とも正の定義) | 両側とも正の定義 | (iii) でない |

**D-209 の適用 (r1 jp-review)**: CSR points[0] を「正解選択肢が述べる原則を一般的な定義として書いた」= B、points[1] を「分類型の正解を CSR の取組みの範囲として一般的に」= B と判定し、主体名・業種・相手の流用なしも点検している。独立照合 (Dice ≤0.38、12 字一致 0) でも裏付けられ、適用は正しい。

**D-210**: 法令・改正前の文言を引く引用題なし → 対象外。

## 5. D-205: 改訂される文書の構成数・名称

| 記述 | 版の扱い | 判定 |
|---|---|---|
| `terms[0].points[2]` ISO 26000 | 版なし | 構成要素の数・名称 (原則・中核主題など) を述べず、「組織の社会的責任の手引きとなる国際規格」という性格のみ → D-205 の対象外 |
| `terms[4]` SDGs「17 のゴール」(one 以外の detail・pt1・hook・key_points[2]) | 版なし | SDGs は 2015 年国連総会採択の 2030 アジェンダの目標で、2030 年まで改訂版が存在しない固定の構成 → 版の明記は不要 (L5 記録のみ)。引用題 2020r02o-q009 と一致 |
| `terms[0].detail` / fig、`terms[3].detail` / fig の列挙 | 「など」「例」付き | 文書の構成ではなく例示 → 対象外 |

## 6. D-208 失敗型の明示点検

1. **D-198 (iii) 選択肢のなぞり**: §4 のとおり 0 件。validate の `choice-echo` warn 0。題の場面側の判断項目・穴埋めも無い (全 9 題が記述選択型・分類型・事例選択型)。
2. **限定語の落ち**: q021 の「…など」は考点で一般化され範囲を閉じない。q005 の「だけでなく」は「にとどまらず」で保持。q035 の「2030 年までに」は「期限は 2030 年」で保持。範囲を閉じる落ち 0 (one / kp の第 2 面の狭さは考点の限定語ではなく欄の範囲 → L1)。
3. **シラバスの別名を別物として教える**: SRI / 社会的責任投資 = 同一物 (SRI detail「まったく同じで呼び方が違うだけ」)、ステークホルダ / 利害関係者 = 同格。CSR と社会的責任投資は別概念 (主体が異なる) で正しい (O3)。該当なし。
4. **比喩・図の範囲が one / detail と矛盾 (D-204)**: パン屋 (本業 + 店前の掃除・売れ残り削減 = 本業を通じた CSR) = pt1 と整合。就職先選び = 業績以外も評価。町内の祭り = 影響を受ける人すべて (one の双方向の影響と整合)。学期の目標表 = L6 (矛盾には至らない)。家電の買い替え + 使い方 = 2 面 (第 2 面の「家全体の電気やガス」は one の省エネの面)。栄養成分表示 = 数値で示す指標。CFP 段階図 = one のライフサイクル。該当なし。
5. **前回修正の zh / en での回帰**: 本 attempt は a1、jp-review / tr-review とも PASS (low のみ) で修正ラウンドが無く、回帰の対象なし。
6. **zh / en が誤答肢の読みに寄る (b18 u05 型)**: q005 — 誤答イ 環境アセスメント (zh「环境影响评价」/ en "Environmental assessment") に対し本文は zh「减轻环境负荷」/ en "reducing environmental impact" で評価・アセスメントの語なし; 誤答エ ゼロエミッション (zh「零排放」/ en "Zero emission") に対し CFP en "emissions" は「排出量を量る」の意味で排出ゼロの語なし。q022 — zh / en「提升企业价值 / raises the company's value」は正答イの訳と同義で、誤答ア (benchmarking)・ウ (keeps managers in check)・エ (core competence) の語なし。q003 — zh「环保产品」/ en "environmentally friendly products" は正答アの方向で差別化・セル生産・買収の語なし。q020 — en "going paperless" は正答エ。q014 — en "the term for the social responsibility that a company in particular bears" に governance / social media policy の語なし。q035 / q009 — en "adopted by the United Nations" に COP21 / UNESCO / WHO の語なし。**該当なし**。
7. **D-210 (改正前の文言の引用題)**: 対象の引用題なし。

## 7. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **11** (建議修 2: L1 / L2、記録のみ 9: L3〜L11) |

## 8. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 7 用語・考点 10 件 (qid 付き 7 件)・引用 9 題 (quiz / challenge は全て引用題内) で、考点は正答と一致し、誤答肢を支持せず、限定条件の落ちも無い。D-198 は 12 字一致 0・近似 3 件 (定型)・最大 Dice 0.41 で写しなし。LOW 建議修 2 件 (L1 = グリーンIT の one / 要点の第 2 面に資源の節約を足す、L2 = en "agenda" → "SDGs") を B3 補丁で推奨。

## 9. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-01-u03
✓ strategy-01-01-u03 unit: 0 issues (data/ip/textbook/units/strategy-01-01-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-01-u03
✓ strategy-01-01-u03 parity: 31 locations, 0 diff
EXIT=0

# L1 + L2 を scratch コピーに試し適用 (repo の単元ファイルは未変更; 本体 + 派生 definition_* / explanation_en / summary.key_points_* を同時置換、11 箇所)
$ node --no-warnings scripts/textbook-v2-validate.mjs --file <scratchpad>/u03b21/patched.json
✓ strategy-01-01-u03 unit: 0 issues (...patched.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --file <scratchpad>/u03b21/patched.json
✓ strategy-01-01-u03 parity: 31 locations, 0 diff
EXIT=0
# 独立 copy 照合 (patched): 12 字一致 0 / 近似 3 件 (補丁前と同じ)
```
