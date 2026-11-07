# Rule A 全数抽検 — strategy-03-12-u02 (品質・プロセス改善のマネジメント技法: TQC・TQM・シックスシグマ・TOC)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / jp-review / localiser / loc-review) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成、作業用スクリプトは scratchpad)。
- **Date**: 2026-11-07 (S149 b45)、repo HEAD `e04a2a84` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b45-u02-a1` merge 結果、sha256 先頭 `16e47549023944cb`)。
- **対象**: `data/ip/textbook/units/strategy-03-12-u02.json` (textbook-unit-v2)、用語 **4 / 4 = 全数** (TQC / TQM / シックスシグマ / TOC) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204、D-205、D-208〜D-210、テンプレート既知失敗型 (1)〜(10)。比較: `data/ip/textbook/.planning/v2/strategy-03-12-u02/v1-original.json` (用語 4 語・`term_zh`・`term_en` とも v1 と一致)。先行審査: `journal.b45-u02-a1.jsonl` (jp-review r1 PASS = low 9 / loc-review r1 PASS = low 5、HIGH・MEDIUM なし)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 4 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (nodes label・steps caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版 (repo 規則 = `**`・`[[jp:`・`]]` の除去、内側の語は残す) であることをスクリプトで確認 (不一致 0)。TQM は `hook_*` 無し (`memory_hook_jp` = 空)、`summary.memory_hooks_*` は 3 件 (TQC / シックスシグマ / TOC) で整合、validate も受理。
2. **考点 × 引用題 (考点 全 5 件 = exam 3 + mix 2、qid 付き 3 件、引用 qid 3 題)**: `data/ip/quiz/questions.json` から題文・選択肢・`correct_answer` を再読 (全題 topic `strategy-03-12`、2017h29h-q006 は `stem_jp_clean` で判定)。
   - 2013h25h-q014 (方針管理の説明、正答ウ = トップの目標を下位組織へ順次展開し実施計画につなげて継続改善; 誤答 = BSC の 4 視点 / ベンチマーキング / 職場の小集団活動)。
   - 2012h24h-q024 (シックスシグマ活動の説明、正答ウ = 業務品質を数値化しばらつきを抑えて改善; 誤答 = リスク対応計画 / 職場グループの継続的問題解決 / 手順化・文書化による品質保証)。
   - 2017h29h-q006 (ボトルネックの解消などでプロセス全体の最適化を図る考え方、正答エ TOC; 誤答 CRM / HRM / SFA)。
3. **quiz / challenge_questions** (quiz 計 4 枠 = q014 ×2 [TQC・TQM]・q024・q006、challenge 3 題 = 同じ 3 題; 本文で未引用の題なし)。TQM の quiz は q014 (方針管理は「TQM 又は TQC」の手法) で、TQM 欄自体は方針管理を述べないが、TQC 欄 (detail・points[0]) と TQM mix 考点「TQC を土台に発展」で解ける (L7)。manifest の TQM 割当 q024 はシックスシグマ欄 + challenge で扱われる。TQC detail の「職場の小集団による改善活動」は TQC の普及の文脈で述べ、シックスシグマや方針管理の説明としては述べないため、q024 誤答イ・q014 誤答エ を支持しない。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合として単元の JP 文字列 72 本 (派生フィールド・summary 除く、図ラベル・caption・総表・対比表を含む) を topic 内全 34 題の題文 + 選択肢 (+ `stem_jp_clean`) と 12 字連続照合 (句読点・記号・空白除去)、**カタカナ遮蔽なし = 0 件 / 遮蔽あり (カタカナ 4 字以上と英数を □、実字 6 未満の窓除外) = 0 件**。近似一致 (文単位 bigram Dice / 正規化編集距離) の上位: `terms[0].points[0]` ↔ q014 題文 Dice 0.28・ed 0.94、`terms[2].one_jp` ↔ q024 ウ 0.27・0.66、`terms[2].points[0]` ↔ q024 ウ 0.26・0.73、`terms[3].one_jp` ↔ q006 題文 0.24・0.89 — 全て較正値 (HIGH 例 ed 0.14 / Dice 0.52) から遠い。カタカナの多い文 (シックスシグマ・ボトルネック・DMAIC 図ラベル) を目視、題の語句の再現なし。
   - **(iii) 選択肢なぞり (D-208 型 1)**: validate の `warn choice-echo` 出力なし。`terms[0].points[0]` は q014 正答ウと同じ内部順序 (トップの方針 → 上位から下位の組織へ目標として割り付け → 各組織の実施計画 → 改善) を持つが、これは方針管理という見出し語の一般定義そのもの (D-209 免除: 分類題で正答内容を見出し語の一般定義として述べる)。題の語句 (事業部・部・課の列挙、「順次展開」「継続的な改善を進めていく活動」) も選択肢の組・順序も再現しておらず、誤答肢 (BSC・ベンチマーキング・小集団) にも触れない → 写しでない (記録のみ、L6 の注)。`terms[2].points[0]` も q024 正答ウと「数値化 → ばらつき抑制 → 業務品質向上」の順が重なるが、シックスシグマの標準定義の一般表現 (語は 測定データで表し / 原因を突き止めて抑える / 高める と別) で、誤答肢を再演しない → 写しでない。
   - 図: TOC の 3 工程図 (12 / 5 / 9 個 → 完成 5 個) は自作の数値で、引用題に図・数値なし。再計算: min(12, 5, 9) = 5、一致。比喩 (厨房・店の経営方針・パンの重さ・4 人の手渡し) はいずれも引用題に無い場面。
5. **D-195**: 結論先行 (one = 1 文 × 4、太字あり)、展開 3/2/3/3 文、図の型 (シックスシグマ = flow steps 4 [DMAIC 5 ノード、測定・分析を 1 段にまとめる]、TOC = flow steps 4、TQC・TQM = 図なし; 全て登録 6 種内)、定義前使用 (方針管理 = TQC detail で定義してから考点、σ・ばらつき = detail で定義、ボトルネック・全体最適 = TOC detail で定義、PDCA は前提語、**仕掛品は定義なし** = L8)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → **0 件**; zh・en 相当語 [必须 / 考试 / 一定要 / must / exam / always / important] → `exam` 5 件 = `points[].kind:"exam"` 3 + en "for example" 2 [detail_en と派生 explanation_en]、全て偽陽性)。
6. **D-200**: 考点数 1/1/1/2 (≤3 ✓)、各 JP 1 文・字数 52〜71 (≤100 ✓、最大は TQM `points[0]` の 71 字)。**framing 件数** (`apps/web/src/lib/textbook/validateV2.ts` `pointFraming`、全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-205 (数・構成の版)**: 単元が依存する「構成要素の数・名称」は DMAIC の 5 段階のみ (TOC の 5 つの集中ステップ、ISO 9000 系の原則数などは本文に無い)。DMAIC は改正される文書 (規格・法令・指針) ではなく手法なので D-205 の厳密な対象外 (S138 §6 の Rule D 修正: PDCA・SWOT 等の枠組みは除外) だが、jp は「例えば **DMAIC**」、en は "for example" と例示に留めている。一次・準一次確認: en.wikipedia "Six Sigma" — DMAIC = Define・Measure・Analyze・Improve・Control の 5 段階、新規設計向けの別手法 DMADV あり、6σ = 3.4 DPMO (本文「100 万回の機会あたり数回」と一致)。ASQ (asq.org) は 403 で取得不可。**zh は「例えば」に当たる語が落ちている** (`terms[2].detail_zh`「改进可以按照名为DMAIC的…」) → L3。TOC hook の事実: ja.wikipedia「イスラエルの物理学者」、en.wikipedia "Theory of constraints" — 1984 年の『The Goal』で TOC を紹介 / 製造現場の立て直しを描くビジネス小説 → hook と一致。D-210 (改正前の版) — 引用題に法令・規格の改正依存なし。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の「〜だけ」「〜ではない」照合: TQC detail「検査で不良品をはじく後追いの管理ではなく」は TQC 自身の性格の対比で他欄と衝突しない; TOC detail「ほかの工程だけを速くしても仕掛品がたまるばかり」は自分の図 step 3 [工程 C は 9 個処理できるが届くのは 5 個 = 手待ち、仕掛品はたまらない] と機構が食い違う → L1; TOC mix 考点「流れを止めている」と one・detail・pairs の「出来高を抑えている」の揺れ → L5)。書き方 8 (対比の出現欄) → L9。書き方 9 (限定条件) → §2 表に記載、落ち 0。§6 → L4。§9 言い直し → L6。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・caption・総表・比較行の三語一致、`[[jp:…]]` 原語 3 種 (方針管理 / シックスシグマ / 制約) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語: シックスシグマは `[[jp:]]` 併記、TQC / TQM / TOC は略語がそのまま三語共通の見出し (validate warn 0)、zh 訳語が `zh_terms.json` に従うこと (全面质量控制（TQC）/ 全面质量管理（TQM）/ 六西格玛 / 约束理论（TOC）/ 标准差 / PDCA 一致、B6 warn 0)。loc-review の LOW 5 件は未反映 (L2・L10)。
10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (4 / 4)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | TQC | OK — exam 1 / 1 題: 方針管理 = トップの方針を上位から下位の組織へ目標として割り付け、各組織の実施計画と改善に結び付ける総合的品質管理の手法 (2013h25h-q014 正答ウと一致、誤答 BSC・ベンチマーキング・小集団活動を支持しない)。限定条件: 題は方針管理を「総合的品質管理 (TQM 又は TQC)」の手法とする。考点は「総合的品質管理の手法」と言い、TQC 専用とは言わない (「TQC で使われる代表的な手法」も排他でない) → 不支持の限定には当たらないが、単元が 総合的品質管理 = TQC の和名、TQM = 総合的品質経営 と割り当てるため、題の呼び方 (TQM も総合的品質管理) と対応しにくい → L2。one「製造部門だけでなく全部門・全員」は TQC の標準的な説明で正しい | OK (図なし = 定義型) | OK | L2 / L6 |
| 2 | TQM | OK — 考点 mix 1: TQC は全員参加の品質管理として広まり、TQM はそれを土台に経営全体の仕組みへ発展、対立しない — 正しい (日本では TQC → TQM へ呼称・範囲が移行)。one・detail (サービス・業務プロセス・経営判断の質、顧客視点、全社の PDCA) は TQM の一般的な説明と一致。quiz q014 は TQC 欄 + 本考点で解ける | OK (図なし、hook なし = validate 受理) | `one_en` に種別語なし (loc LOW) | L2 / L7 / L9 / L10 |
| 3 | シックスシグマ | OK — exam 1 / 1 題: 品質を測定データで表し、ばらつきの原因を突き止めて抑え、業務の品質を高める (2012h24h-q024 正答ウと一致; 誤答 リスク対応・小集団・文書化による品質保証 を支持しない)。detail の σ = 標準偏差、6σ = 100 万機会あたり数回 (3.4 DPMO)、DMAIC 5 段階 = 一次・準一次確認で一致 (§1-7)。flow 図 4 段 (定義 / 測定と分析 / 改善 / 管理) は detail の 5 段階と矛盾なし | OK | zh の「例えば」欠落 | L3 / L4 / L6 |
| 4 | TOC | OK — exam 1 / 1 題: 工程の流れを妨げている制約を特定して取り除き、プロセス全体の成果を高める (2017h29h-q006 正答エ; 題の「ボトルネックの解消**など**」は手段の例示で、考点は排他の「だけ」を言わず、one は「改善を集中させ」とより広く言う → 範囲を閉じない、限定条件落ちに当たらない) / mix: シックスシグマ = 結果のばらつき、TOC = 全体の流れを抑える工程 (pairs[1] と一致)。図 (12 / 5 / 9 → 5) 再計算一致。detail 2 文目の「ほかの工程だけを速くしても仕掛品がたまるばかり」は前工程にのみ当てはまる (後工程は手待ち) → L1。hook (ゴールドラット = 物理学者、『ザ・ゴール』で広めた) は §1-7 の確認と一致 | OK | zh detail の比較の強め・hook_zh「重建」・points[1] zh/en の「改善」欠落 (loc LOW) | L1 / L5 / L8 / L10 |

**単元レベル**: goals 3・overview_cols 1 (改善で着目する点)・overview_rows 4 行・pairs 2 組 (TQC / TQM 3 行 key 1、シックスシグマ / TOC 2 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 3 件 (q024 / q014 / q006 — 本文と矛盾なし)。`pairs[0].rows[0]` (Control / Management) は略語の展開で正しい。事実誤りなし、三語一致 (L3・L10 を除く)。

**hook / 比喩の当てはめ (既知失敗型 8・9)**: シックスシグマ hook (σ = 標準偏差 → データで品質を語る) を q024 に当てると正答ウ (数値化・ばらつき) を選ぶ。TOC hook・比喩 (一番遅い人で止まる) を q006 に当てると正答エ。TQC hook (T = Total) と厨房の比喩は q014 (方針管理) の判別には関わらず、誤答エ (現場チームの改善) へ誘導する語 (チーム・グループ) を含まない。TQM 比喩 (店全体の経営方針へ格上げ) は他見出し語の語幹を含まない → 問題なし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 10 ID (建議修 4 = L1・L2・L3・L10a / 記録のみ = L4〜L9・L10b〜d)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[3].detail_jp` / `detail_zh` / `detail_en` 2 文目 (+ 派生 `explanation_*`) | 「ほかの工程だけを速くしても仕掛品がたまるばかり」は、ボトルネックより前の工程にのみ当てはまる。後ろの工程を速めても仕掛品はたまらず手待ちが増えるだけで、単元自身の図 `terms[3].fig.steps[2]` (工程 C は 9 個処理できるが届くのは 5 個) とも機構が食い違う。結論「成果は増えない」は正しく、引用題の誤答肢を支持しないので MEDIUM にはしない (jp-review r1 の low が未反映) | jp before「全体の出来高はこの箇所の能力を超えられないため、ほかの工程だけを速くしても仕掛品がたまるばかりで成果は増えない。」→ after「全体の出来高はこの箇所の能力を超えられないため、ほかの工程だけを速くしても、手前に仕掛品がたまるか後ろの工程が手待ちになるだけで成果は増えない。」/ zh before「整体产出无法超过这个环节的能力，所以只加快其他工序，只会让在制品越积越多，成果并不会增加。」→ after「整体产出无法超过这个环节的能力，所以只加快其他工序，只会让瓶颈前的在制品越积越多，或让后面的工序空等，成果并不会增加。」/ en before "Total output cannot exceed that point's capacity, so speeding up only the other steps just piles up work in process without raising results." → after "Total output cannot exceed that point's capacity, so speeding up only the other steps just piles up work in process in front of it or leaves later steps waiting, without raising results." |
| L2 | LOW **建議修** | `terms[1].one_jp` | 引用題 2013h25h-q014 は「総合的品質管理」を TQM と TQC の両方の呼び名として使うが、単元は 総合的品質管理 を TQC の和名 (`terms[0].one_jp`) にだけ当て、TQM には「総合的品質経営」だけを示す。排他の記述は無く誤答には至らないが、題の呼び方と単元の対応が切れる (既知失敗型 3 の近縁)。zh 全面质量管理 / en は影響なし | jp before「**TQM** (Total Quality Management、総合的品質経営) は、」→ after「**TQM** (Total Quality Management、総合的品質経営。総合的品質管理と呼ぶこともある) は、」(zh / en 変更なし) |
| L3 | LOW **建議修** | `terms[2].detail_zh` 3 文目 (+ 派生 `explanation_zh`) | jp「改善は例えば **DMAIC** と…」・en "for example" の例示が zh で落ち、「改进可以按照名为DMAIC的…」は「可以」で排他は避けるが例示の明示がない (三語 parity、D-205 の趣旨; DMAIC 5 段階自体は §1-7 で確認済み、DMADV など別手法あり) | zh before「改进可以按照名为**DMAIC**的定义、测量、分析、改进、控制的顺序推进。」→ after「例如，改进可以按照名为**DMAIC**的定义、测量、分析、改进、控制的顺序推进。」 |
| L10a | LOW **建議修** | `terms[3].detail_zh` 3 文目 (+ 派生 `explanation_zh`) | jp「部分ごとの効率よりも、つながった全体の成果を最大にする」(比較) が zh「不追求各部分的效率」(部分の効率を追わない) と強まる (loc-review r1 low 未反映、既知失敗型 6 の近縁: 部分の効率を否定すると読める) | zh before「不追求各部分的效率，而是让相连整体的成果达到最大，这就叫整体最优。」→ after「比起各部分的效率，更重视让相连整体的成果达到最大，这就叫整体最优。」 |
| L4 | LOW | `terms[2].hook_jp/zh/en` | σ = 標準偏差 の手がかりが `detail_*` 1〜2 文目の繰り返し (D-203 §6)。誤学習なし | 記録のみ |
| L5 | LOW | `terms[3].points[1].text_jp/zh/en` | 「全体の流れを止めている一つの工程」は one・detail・pairs の「出来高を抑えている」と揺れる (ボトルネックは流れを止めず流量を制限する)。また TOC の制約は工程以外 (方針・市場) もあり得るが、単元は引用題 q006 のボトルネック枠に合わせて工程で述べる (en.wikipedia "Theory of constraints"、範囲外の補足で誤りではない) | 記録のみ (任意: jp「止めている」→「抑えている」) |
| L6 | LOW | `terms[0].detail_jp` 3 文目 ↔ `terms[0].points[0].text_jp`、`terms[2].one_jp` ↔ `terms[2].points[0].text_jp` | 考点が detail / one の言い直し (D-203 §9)。考点はいずれも引用題の正答と一致し、§1-4 のとおり (iii) なぞりではない (D-209 免除: 見出し語の一般定義、題の語句・選択肢の組・順序を再現しない) | 記録のみ |
| L7 | LOW | `terms[1]` (TQM) quiz = 2013h25h-q014 | TQM 欄自体は方針管理に触れず、TQC 欄と mix 考点経由で解く (jp-review r1 low)。矛盾なし | 記録のみ |
| L8 | LOW | `terms[3].detail_jp`、`terms[3].fig.steps[1].caption_jp` | 「仕掛品」が定義なしで使われる (業務用語として一般的) | 記録のみ (L1 修正後も同じ) |
| L9 | LOW | `overview_rows[1].one_line_*`、`terms[1].one_*`、`pairs[0].rows[2]`、`terms[1].points[0]`、`key_points_*[1]` | TQC → TQM の発展関係が 5 欄に出る (書き方 8: pairs と mix 考点の 2 箇所まで)。one・総表は定義そのもの、key_points は要約で、誤学習なし | 記録のみ |
| L10b〜d | LOW | `terms[3].hook_zh`「工厂重建」/ `terms[1].one_en` 種別語なし / `terms[3].points[1].text_zh/en`「改善する」欠落 | loc-review r1 low 未反映。意味の誤りには至らない | 記録のみ (loc-review の fix 案のまま使える) |

**対比の出現欄 (書き方 8 の列挙)**: ① TQC = 品質を生む仕事の進め方 / TQM = 経営全体の質: `pairs[0].rows[1]` (key)、総表 `overview_rows[0..1].extra`、各 one、goals[0] (予告) → 許容 (総表は D-195 §3 の構造)。② TQC → TQM の関係: L9。③ シックスシグマ = ばらつき / TOC = 制約: `pairs[1].rows[0..1]`、`terms[3].points[1]` (mix) の 2 箇所 + 総表 extra → 許容。

確認済みで問題なし: 限定条件 (考点 3 件の qid 付き全て保持、q006 の「など」は範囲を閉じない、§2)、§9 禁止句 grep (0、zh・en の偽陽性のみ)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤71 字)、D-198 (copy guard 0 / 独立照合 遮蔽なし 0・遮蔽あり 0 / 近似一致 最大 Dice 0.28)、`[[jp:]]` 原語 (3 種全て jp 本文に実在)、zh 訳語表 (B6 warn 0)、図種 (flow steps ×2 / 図なし ×2 = 登録内)、図の数値再計算、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、先行審査の HIGH / MEDIUM なし (回帰なし)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **10 ID** (建議修 4: L1 / L2 / L3 / L10a、記録のみ: L4〜L9 + L10b〜d) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 4 用語・考点 5 件 (qid 付き 3 件)・引用 3 題 (= quiz / challenge 全題) で、考点の主張は正答と一致し、誤答肢を支持する記述・引用題の限定条件の落ち・写しは無い。D-205 対象の構成数は DMAIC 5 段階のみで、外部確認と一致 (jp・en は例示、zh は L3)。LOW 建議修 4 件 (L1・L2・L3・L10a) は補丁 (B3) で修正推奨、残りはバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-03-12-u02
✓ strategy-03-12-u02 unit: 0 issues (data/ip/textbook/units/strategy-03-12-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-03-12-u02
✓ strategy-03-12-u02 parity: 23 locations, 0 diff
EXIT=0
```
