# Rule A 全数抽検 — strategy-01-01-u05 (人材育成の手法)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / jp-review / localiser / tr-review) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 照合スクリプトは scratchpad)。
- **Date**: 2026-11-06 (S146/S147 第 21 批 b21)、repo HEAD `1e197f46` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b21-u05-a1` merge 結果、`merged.json` と同一 [cmp 一致]、sha256 先頭 `f8f8555480b270a0`)。
- **対象**: `data/ip/textbook/units/strategy-01-01-u05.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (OJT / Off-JT / e-ラーニング / アダプティブラーニング / コーチング / メンタリング) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。topic = strategy-01-01。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205、D-208 (失敗型の明示点検)、D-209 ((iii) の免除 2 型)、D-210。比較: `data/ip/textbook/.planning/v2/strategy-01-01-u05/v1-original.json` (用語 6 語・`term_zh`・`term_en` とも v1 と一致、`prerequisites` 一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 (比喩の像が考点の否定する内容を運ぶ = 観点 7)・D-198 (iii)・zh / en の語が誤答肢の読みに寄る (b18 u05 型) / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え; 一致断片は 12 字以内)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ (Off-JT は hook 空 = 三語とも空で validate 許容)。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 6 件 = exam 2 + mix 4、qid 付き 2 件、引用 qid 延べ 4 件 = 異なり 4 題)**: `data/ip/quiz/questions.json` + `translations/<exam>.json` の `stem_jp_clean` から題文・選択肢・`correct_answer` を再読 (全題 topic `strategy-01-01`)。manifest の関連題 11 題のうち本単元の用語を問う 7 題 (2011h23a-q001 / 2012h24a-q006 / 2014h26h-q020 / 2014h26h-q025 / 2015h27h-q003 / 2016h28h-q024 / 2022r04-q004) を全て読んだ。残り 4 題 (CSR / 株主総会 / グリーン IT / 経営理念) は v1 の challenge に入っていた別単元の題で、v2 は外して本単元の題に差し替えた (改善、指摘ではない)。
3. **quiz / challenge_questions** (quiz 計 7 枠 + challenge 5 題、全 7 題が考点 qid か quiz に出る): 本文と矛盾しないことを確認 (§2)。題 bank 全体を `コーチング|メンタリング|メンター|アダプティブ|e-ラーニング|Off-JT|OJT|ティーチング` で grep → コーチング・メンタリングを正答とする題は 0 (コーチングは 2012h24a-q006 の誤答エとしてのみ出る)。よって `terms[5].quiz = []` は題が存在しないため妥当。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合: 単元の JP 文字列 98 本 (派生除く [`overview.intro_jp` のみ goals 由来で含む]、図ラベル・caption・総表 `overview_rows` / `overview_cols`・対比表を含む) を topic 内全 62 題の題文 (`stem_jp_clean` と raw 両方) + 選択肢と 12 字連続照合 (句読点・記号・空白・長音除去、NFKC) を **カタカナ 4 字以上 + 英数遮蔽あり / 遮蔽なし** の 2 通りで実施 → **0 / 0 件**。近似一致 (1〜2 字差し替え) 照合: 題の各文 (14 字以上) × 単元各文の長さ ±3 の窓で正規化編集距離と bigram Dice → 最近接は `terms[0].one_jp` ↔ 2012h24a-q006 ウ (ed 0.65 / Dice 0.31)、次いで `terms[1].one_jp` ↔ 同 イ (ed 0.67 / Dice 0.22)、`terms[2].analogy_jp` ↔ 2014h26h-q020 イ (ed 0.70 / Dice 0.22)。較正の HIGH 例 (ed 0.14 / Dice 0.52) から遠く、いずれも用語の標準定義 / 比喩で写しではない。2022r04-q004 の題文全体 × `terms[3].one_jp` = Dice 0.13、× one+detail = 0.16、× `overview_rows[3].one_line_jp` = 0.08。
   - **カタカナの多い文の目視**: アダプティブラーニングの one / detail / mix 考点 / 図 caption × 2022r04-q004 題文、コーチング・メンタリングの one / detail / mix 考点 / 図 caption × 2012h24a-q006 エ、e-ラーニングの one / detail / 考点 × 2014h26h-q020 全選択肢と 2015h27h-q003 → 写し 0。
5. **D-208 失敗型の明示点検 (§4)**: validate は **`warn choice-echo` 行 0 件**。warn が見えない題文側 (判断項目・空欄) は本単元の引用題に無い (全題が「どれか」型の単一選択、穴埋め無し)。7 題全てで (iii) を 1 件ずつ判定。
6. **D-195**: 結論先行 (one = 1 文 × 6、太字あり)、展開 2 文 × 6 (detail)、比喩・フック (§6: フック 5 = 全て語源 [on / e / adaptive / coach / Mentor]、比喩 6、いずれも定義の言い換えではない; Off-JT は hook なし)、定義前使用 (メンター・メンティ = メンタリング one の括弧注、ティーチング = コーチング考点の括弧注、学習履歴 = e-ラーニング detail の「誰がどこまで進んだか」、IT 機器 = one の例示)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → `freq_badge`「頻出」と **「on と覚える」1 件 × 3 欄** [`terms[0].hook_jp` + 派生 `memory_hook_jp` + `summary.memory_hooks_jp[0]`] のみ。記憶フックの言い方で定型締め句ではない [前例 u06 と同扱い、5 フック中 1 件なので記録しない]。zh / en の grep [必须 = e-ラーニング analogy_zh「不像必须按时去教室」、exam = `kind:"exam"` と example] は通常の用法で偽陽性)、図の型 (アダプティブラーニング = flow steps 4、コーチング = flow steps 3、他 4 用語 = 図なし; 全て登録内)、pair 配置 (OJT→Off-JT、e-ラーニング→アダプティブ、コーチング→メンタリング、各組 key 行 1)。
7. **D-200**: 考点数 1/1/1/1/1/1 (≤3 ✓)、各 JP 文数 1〜2・字数 52〜87 (≤100 ✓、最大は Off-JT `points[0]` の 2 文 87 字)。**framing 件数** (`validateV2.ts` の `pointFraming` を直接呼び出し、全考点): jp 0 / zh 0 / en 0 (上限 2)。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (「〜ではなく」「〜だけ」の照合) → M1 (Off-JT analogy × コーチング考点) 1 件、他は L 級 (L5, L6)。書き方 8 (対比の出現欄) → §3 末尾に列挙。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → 比喩・フックが定義の言い直しのものは無し。§9 言い直し → L3, L4, L7。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・caption・総表・対比表の三語一致 (parity 28 箇所 0 diff)、`[[jp:…]]` 原語 7 種 (e-ラーニング / アダプティブラーニング / コーチング / ティーチング / メンタリング / メンター / メンティ) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` = 片仮名 4 用語は 4/4 あり (OJT / Off-JT は英字見出しで原語 = 表記同一)、zh 訳語が `zh_terms.json` に従うこと (validate の B6 warn 0 / jp-origin warn 0; e-Learning（在线学习）/ 自适应学习 / 教练辅导 / 导师指导 一致)。tr-review (loc-review r1) の LOW 6 件の反映状況を確認 → 6 件とも未反映 (PASS 判定のため B3 に回っていない)。うち 2 件を L1・L2 (建议修) として再掲、残りは L8・L9 と記録のみ。
10. **前回審査の HIGH / MEDIUM 解消**: jp-review r1 (REVISE) の MEDIUM 3 件 — (a) `terms[3].points[0]` が 2022r04-q004 題文の要素の並びをなぞる、(b) `terms[1].points[0]` が 2012h24a-q006 正答イの文型をなぞる、(c) `terms[0].points[0]` が 2015h27h-q003 題文の並びをなぞる — は r1 書き直しで 3 件とも別の考点に置き換わり解消 (現 (a) = e-ラーニング / アダプティブの区別軸、(b) = 業務の中か外かという分け方の基準、(c) = 自作の場面例)。zh / en も新しい jp に追随 (parity 0 diff)、退行なし。r0 の「手早く進める」(効率と効果を速さに絞る限定) も消え、detail は「同じ時間でもより多くを身につけやすく」(量・質を含む) になった。
11. **D-205 / D-210**: 改訂される文書 (規格・法・ガイドライン・知識体系) の構成要素の数・名称、改正前の文言で書かれた引用題とも本単元には無い → N/A。
12. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§7 に出力全文)。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | OJT | OK — exam 1 / 3 題: 新人に顧客向け提案書を任せ先輩が仕上がりに助言 = 仕事そのものを通じて育てるので OJT (2014h26h-q025 正答エ = 部下に実務の計画立案を命じる / 2016h28h-q024 正答ウ = 新規開発プロジェクトに参加させる / 2011h23a-q001 正答ア = 参画プロジェクトで業務の一部を担当)。場面は自作 (提案書・顧客向け・先輩の手直し助言) で、エの販売計画・企画立案能力、ウの設計能力・新規開発、アのモデル化の具体は使っていない。誤答肢 (勉強会・説明会・外部講習・通信教育・自主的なキャリア計画) を取り上げて否定していない。「例えば」で例示と明示。quiz 2015h27h-q003 (定義 → 用語、誤答 CDP / eラーニング / Off-JT) は one で解ける | OK (図なし = 定義型) | OK (L2 は key_points_en) | L2 |
| 2 | Off-JT | OK — mix 1: OJT / Off-JT を分けるのは社内か社外かではなく業務の中か外か、社内の研修も業務を離れて受けるなら Off-JT。2016h28h-q024 の誤答イ (人事部主催 = 社内) と エ (外部主催 = 社外) がどちらも非 OJT、2014h26h-q025 の誤答ア・ウ (社内の勉強会・説明会) も非 OJT で、この基準と整合。quiz 2012h24a-q006 (正答イ = 仕事を離れた教育訓練) は one で解ける | OK | **analogy の「コーチ」/「教练」が M1** | **M1**, L4 |
| 3 | e-ラーニング | OK — exam 1 / 1 題: 勤務先や自宅などから、仕事の合間など都合のよい時間を選んで受講できる (2014h26h-q020 正答イ)。題の場面語 (全国の業務担当者) は r1 で除去。限定条件: 題は「研修に e-ラーニングを利用するメリット」で、考点は受講者側の利点として言い切り、誤答肢 (設計担当者から直接・その場で質疑 / 複数同席で意見交換 / 一堂に集めて一度で) を支持しない。detail の「教材を一度用意すれば多くの受講者に配信」は「同じ時刻・同じ場所にそろわなくても」の後に置かれ、誤答エ (一堂に集める) と読み違える余地なし | OK | OK | L5 |
| 4 | アダプティブラーニング | OK — mix 1 (qid なし): e-ラーニング = IT 機器とネットワークで教材を届ける方式 / アダプティブ = 届ける内容を人ごとに変える方式 (両側とも正の定義、D-209 の取り違えやすい組)。quiz 2022r04-q004 (定義 → 用語、正答ア、誤答 タレントマネジメント / ディープラーニング / ナレッジマネジメント) は one で解ける。flow steps 4 (解く → 記録をためて分析 → 得意・苦手を推定 → 次の教材) は one・detail と一致 | OK (one_jp × q004 題文は §4 で免除判定) | OK | L3, L6 |
| 5 | コーチング | OK — mix 1: 答えを渡さず本人に考えさせる関わり方で、知識ややり方をそのまま教える指導 (ティーチング) と働きかけの向きが逆 — 標準的な説明で正しい。quiz 2012h24a-q006 はコーチングが誤答エ (質問や簡単な助言で自ら行動するよう仕向ける) として出るだけ (jp-review r1 の LOW、未修)。one・detail・図はエの記述と矛盾しない (エはコーチングの正しい説明で、Off-JT ではない)。flow steps 3 一致。hook (coach = 馬車、行き先は乗る本人が決める) は語源として正しい | OK | OK | L7 |
| 6 | メンタリング | OK — mix 1 (qid なし): コーチング = 問いかけで本人の答えを引き出す / メンタリング = メンター自身の経験をもとに助言し長く相談に乗る。題 bank にメンタリングを問う題は 0。detail「直属の上司とは別の部署の先輩がメンターを務める場合もある」「キャリアの悩みや職場での不安の相談にも乗る」は標準的な説明で正しい。hook (Odyssey のメントール、テレマコスを導いた) は語源として正しい | OK | zh「学员」L1、「倾听烦恼」L8 | L1, L6, L8 |

**単元レベル**: goals 3 点 (各組の区別軸の予告)・overview_cols 2 (分類 / 中心となる働きかけ)・overview_rows 6 行・pairs 3 組 (OJT / Off-JT 3 行 key 1、e-ラーニング / アダプティブ 2 行 key 1、コーチング / メンタリング 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge_questions 5 件 (2011h23a-q001 / 2016h28h-q024 / 2012h24a-q006 / 2014h26h-q020 / 2022r04-q004 — 全て本単元の用語の題で本文と矛盾なし)。事実誤りなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 9 (うち 建议修 2)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 (B3: 1 欄内の文字列置換) |
|---|---|---|---|---|
| M1 | **MEDIUM** (観点 7: 比喩の像が考点の否定する内容を運ぶ; zh は b18 u05 型 (6) も該当) | `terms[1](Off-JT).analogy_jp` / `analogy_zh` / `analogy_en` | Off-JT の比喩「試合から離れた練習場で、**コーチから基本の型を順に習う**」/ zh「**跟着教练**一步步学习基本动作」/ en "**a coach walks you through** the basic moves one at a time" は、コーチ (= 同単元の見出し語コーチングの担い手、hook でも「コーチはそこへ運ぶ役」) が型をそのまま順に教える像。同単元の `terms[4].one_jp`「答えを教えるのではなく」と `terms[4].points[0]`「知識ややり方をそのまま教える指導 (ティーチング) とは働きかけの向きが逆」が否定する内容を、比喩の像が運んでいる。zh は「教练」が見出し語「教练辅导」の語幹そのもので結びつきが一層強い。しかも Off-JT の quiz 2012h24a-q006 は Off-JT (正答イ) とコーチング (誤答エ) の取り違えを問う題で、比喩がその取り違えを後押しする向きにある。事実誤りではない (スポーツのコーチの一般語義) ので HIGH ではない | jp「試合から離れた練習場で、**コーチから**基本の型を順に習うようなもの。」→「試合から離れた練習場で、**指導役から**基本の型を順に習うようなもの。」/ zh「就像离开比赛场，在训练场上**跟着教练**一步步学习基本动作。」→「就像离开比赛场，在训练场上**跟着指导老师**一步步学习基本动作。」/ en "Like stepping away from the game to a practice field, where **a coach walks you through** the basic moves one at a time." → "Like stepping away from the game to a practice field, where **an instructor walks you through** the basic moves one at a time." |
| L1 | LOW **建议修** | `terms[5](メンタリング).one_zh` | メンティの訳「**学员**」が、同単元の受講者の訳「学员」(`terms[1].detail_zh`「学员本人」、`terms[2].detail_zh`「学员不必与讲师…」「众多学员」、`terms[2].points[0].text_zh`) と同じ語になり、メンター制度の後輩と研修の受講者が区別できない (tr-review r1 LOW、未修)。v1 は「被指导者」 | 「（**学员**，[[jp:メンティ]]）」→「（**被指导者**，[[jp:メンティ]]）」(派生 `definition_zh` は自動追随) |
| L2 | LOW **建议修** | `key_points_en[0]` (+ 派生 `summary.key_points_en[0]`) | jp「左右されやすい」(傾向) を "depends heavily on" と訳し程度が強まる (tr-review r1 LOW、未修)。zh「容易受…影响」は jp どおり | "…and the quality of training depends heavily on the instructor's ability." → "…and the quality of training tends to depend on the instructor's ability." |
| L3 | LOW | `terms[3].detail_jp` / `terms[3].fig.steps[3].caption_jp` / `key_points_jp[3]` (三語) | 「苦手な部分を厚く (重点的に)、できている部分は短く」が 3 欄で繰り返される (D-195 §9 / D-203、jp-review r2 LOW)。事実の誤りは生まない | 記録のみ |
| L4 | LOW | `key_points_jp[1]` (三語) | Off-JT の要点「多くの人に同じ内容をまとめて教えやすい」が `terms[1].detail_jp` 1 文目とほぼ同文 (§9 言い直し、jp-review r2 LOW) | 記録のみ |
| L5 | LOW | `terms[2](e-ラーニング).points[0].text_jp` (三語) | 2014h26h-q020 正答イ (業務の合間に都合のよいときに受講できるという利点) と同じ内容の言い換え (「仕事の合間など各自に都合のよい時間を選んで受講できる」)。e-ラーニングの標準的な利点を一般的な表現で述べたもので、12 字一致 0・近似一致も閾値外、誤答肢の否定も無い (D-209 / D-198 標準原則) → 写しではない (jp-review r2 と同判定) | 記録のみ |
| L6 | LOW | `goals_jp[1]` / `pairs[1].rows[1].a_jp` (三語)、`pairs[2].rows[1].a_jp` (三語) | (a) goals[1]「教材の内容が学ぶ人ごとに変わるかどうかで区別」と対比表「用意された教材を各自のペースで進める」は e-ラーニングの教材は人ごとに変わらないと読める (実際はアダプティブは e-ラーニングの上で行われることが多い; mix 考点・pairs[1].rows[0] は「届け方 / 内容を変える」と別の軸で正しく述べる)。(b) コーチングの「扱う範囲」を「本人が決めた目標や課題に向けた行動」とし、キャリアはメンタリング側だけに書くため、コーチングはキャリアを扱わないと読める余地 (jp-review r2 LOW 2 件)。どの引用題の正答とも衝突せず、典型像の単純化 | 記録のみ |
| L7 | LOW | `terms[4](コーチング).points[0].text_jp` (三語)、`terms[5].points[0].text_jp` 前半 | 「答えを渡さずに本人に考えさせる」は同用語 one_jp (答えを教えるのではなく…考えさせ) の言い直し (§9; ティーチングとの向きの対比が新しい情報)。また mentoring 考点の「コーチングは問いかけで本人の答えを引き出す」は「主に」を欠き、2012h24a-q006 エがコーチングを「質問や簡単な助言」と書くこととの間でわずかに強い (goals[2]・pairs[2].rows[0] は「主な」を保持)。コーチングを正答とする題は bank に 0 で誤答には至らない | 記録のみ |
| L8 | LOW | `overview_rows[5].extra_zh[1]`「倾听烦恼」、`terms[5].points[0].text_zh`「长期倾听烦恼」 | jp「相談に乗る」(相談相手になり助言する) を「倾听烦恼」(悩みを聞く) と訳し狭まる (tr-review r1 LOW、未修)。同じ文の前半に「提供建议」があり誤学習には至らない。en "be someone to consult" と pairs[2].rows[1].b_zh「咨询」は広い | 記録のみ (任意: 「倾听烦恼」→「随时接受咨询」) |
| L9 | LOW | `overview_rows[3].extra_en[1]`、`terms[0].one_zh` / `terms[1].one_zh`、`terms[2].one_zh` | en "re-pick the next material" が不自然 / zh「**OJT（在岗培训）**（On-the-Job Training）」の全角括弧の連続 / パソコン =「个人计算机」が硬い (tr-review r1 LOW 3 件、未修)。いずれも事実に影響なし | 記録のみ (任意: "re-pick" → "choose the next material accordingly") |

**対比の出現欄 (書き方 8 の列挙)**: ① OJT = 業務の中 / Off-JT = 業務の外: `pairs[0].rows[0]` + `terms[1].points[0]` (mix) の 2 箇所、各 one は定義そのもの、goals[0] は予告、overview の extra は総表の構造 → 許容。② すぐ使う技能 / 体系立てた知識: `pairs[0].rows[2]` のみ (各 detail は自分の側だけを述べる) → 許容。③ e-ラーニング = 届け方 / アダプティブ = 内容を人ごとに変える: `pairs[1].rows[0]` + `terms[3].points[0]` (mix) の 2 箇所 (両者はほぼ同文だが上限内; rows[1] は「教材の中身」で別の観点) → 許容。④ コーチング = 問いかけ / メンタリング = 経験からの助言: `pairs[2].rows[0]` + `terms[5].points[0]` (mix) の 2 箇所、goals[2] は予告、overview の extra は総表 → 許容。⑤ コーチング / ティーチング: `terms[4].points[0]` のみ (one・analogy・図 step 0 は「答えを言わない」側だけ) → 許容 (L7 は §9)。

## 4. D-208 失敗型の明示点検

| 型 | 判定 | 根拠 |
|---|---|---|
| (1) D-198 (iii) 選択肢・判断項目のなぞり | **該当なし** | validate の `warn choice-echo` 0 行。各題で確認: **2014h26h-q025 / 2016h28h-q024 / 2011h23a-q001** (OJT 考点) — 自作の場面 1 つを正の例として述べ、誤答肢を取り上げない、選択肢の組・順を再現しない。**2012h24a-q006** — Off-JT mix 考点は「社内か社外かではなく業務の中か外か」という正の区別軸 (D-209 の取り違えやすい組の免除) で、q006 の 4 肢 (権限委譲 / 仕事を離れた教育訓練 / 実際の仕事を通じた指導 / 質問と助言で仕向ける) の語句・組・順はいずれも使わない (r0 で正答イの文型を写した考点は r1 で除去済み)。この考点は 2016h28h-q024 の誤答イ (人事部主催) / エ (外部主催) の「社内 / 社外」の軸にも触れるが、両肢の場面 (管理者養成コース・講習会の選定・進路) を再現せず、題に qid も付けていない — 軸を正の定義で述べたもので (iii) ではない。**2014h26h-q020** — L5 (正答の一般原則としての言い換え、免除)。**2022r04-q004** — `terms[3].one_jp` は題文の要素の順 (IT の活用 → 一人一人 → 進行度・理解度 → 応じて教材を変える) にほぼ沿うが、これはアダプティブラーニングの見出し語の標準定義そのもので、分類題 (どれがその仕組みか) の正答を見出し語の一般的な定義として述べる D-209 の免除に当たる。題文固有の語句 (「蓄積, 解析」「最適なコンテンツ」「効率と効果を高める仕組み」) は one には無く、学習履歴は detail に分けて置かれ、Dice 0.13・12 字一致 0、数値・場面の流用も無い → (iii) ではない。r0 で題文の並びをなぞった *考点* は r1 で区別軸の考点に置換済み。**2015h27h-q003** — 考点 qid から外れ quiz のみ |
| (2) 引用題の限定語 (「など」等) の落ち | なし | 引用題に範囲を閉じる限定語は無い。考点側は「例えば」「勤務先や自宅など」「仕事の合間など」と例示を開いたまま |
| (3) シラバス上の別名を別物として教える | なし | OJT = On-the-Job Training、Off-JT = Off-the-Job Training、e-ラーニング (題では「eラーニング」表記も) を同一物として扱う。メンター / メンティは役割名として定義 |
| (4) 比喩・図の範囲が one / detail と矛盾 (D-204) | **M1** | Off-JT の比喩の「コーチ」が、同単元のコーチング考点の否定する「型をそのまま順に教える」像を運ぶ。他の比喩 (大工の見習い / 動画配信 / 家庭教師 / 地図を持つ本人の同行者 / 先に歩いた先輩) と図 2 つは one・detail と整合 |
| (5) 前回修正の zh / en での退行 | なし | r1 の MEDIUM 3 件の修正は zh / en にも反映 (parity 0 diff、各考点の zh / en を目視) |
| (6) zh / en の語が引用題・quiz の誤答肢の読みに寄る | **M1 (zh)** | zh の「跟着教练」は quiz 2012h24a-q006 の誤答エ (コーチング = 教练辅导) の見出し語の語幹そのもの。他: e-ラーニング detail_en "deliver it to many learners" は「同じ時刻・同じ場所にそろわなくても」の後で、q020 誤答エ (一堂に集める) には寄らない |
| (7) D-210 改正前の文言の題 | N/A | 法・規格の題なし |

## 5. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **9** (建议修 2: L1・L2 / 記録のみ 7: L3〜L9) |

## 6. 判定

**FAIL** (D-199: MEDIUM 1)。全 6 用語・考点 6 件 (qid 付き 2 件、引用 4 題)・quiz / challenge の全 7 題で、考点の主張は正答と一致し、誤答肢を支持する記述・限定条件の落ち・D-198 写し ((i)(ii)(iii)) は無い。唯一の MEDIUM は Off-JT の比喩の「コーチ / 教练 / coach」が同単元のコーチング考点の否定する像を運ぶ点 (M1) で、`terms[1].analogy_jp/zh/en` の 1 語置換 (B3 補丁) で解消できる。補丁後は L1・L2 (建议修) も同時に当てることを推奨。

## 7. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-01-u05
✓ strategy-01-01-u05 unit: 0 issues (data/ip/textbook/units/strategy-01-01-u05.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-01-u05
✓ strategy-01-01-u05 parity: 28 locations, 0 diff
EXIT=0
```

独立照合 (scratchpad `ra05/check.mts`) の要約: framing jp 0 / zh 0 / en 0、D-200 考点 6 件 = 1〜2 文・52〜87 字、12 字連続一致 遮蔽なし 0 / カタカナ遮蔽 0 (JP 98 本 × topic 62 題)、近似一致の最近接 ed 0.65 / Dice 0.31、`[[jp:]]` 原語 7 種全て jp 本文に実在、派生フィールド不一致 0、用語・`term_zh`・`term_en` の v1 不変量 一致。

補丁の試し適用 (scratchpad の写しに M1 + L1 + L2 を当てた版、repo の単元は未変更): `node --no-warnings scripts/textbook-v2-validate.mjs --file <scratchpad>/ra05/patched.json --manifest data/ip/textbook/.planning/v2/strategy-01-01-u05/manifest.json` → `✓ strategy-01-01-u05 unit: 0 issues`、EXIT=0。
