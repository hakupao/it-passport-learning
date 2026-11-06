# Rule A 全数抽検 — strategy-01-01-u08 (組織形態)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / jp-review / localiser / loc-review) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 照合スクリプトは scratchpad)。
- **Date**: 2026-11-06 (S147 第 22 批 b22)、repo HEAD `eb783aa6` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b22-u08-a1` merge 結果、`merged.json` と同一 [cmp 一致]、sha256 先頭 `35314a148417b5bb`)。
- **対象**: `data/ip/textbook/units/strategy-01-01-u08.json` (textbook-unit-v2)、用語 **8 / 8 = 全数** (階層型組織 / 機能別組織 / 職能別組織 / 事業部制 / マトリックス組織 / プロジェクト組織 / カンパニー制 / 持株会社) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。topic = strategy-01-01。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205、D-208 (失敗型の明示点検)、D-209 ((iii) の免除 2 型)、D-210、+ 本批の追加点検 (b21 u05 M1 型: 比喩・フックの要語が他の見出し語の語幹 / 他用語が別に定義する役割を指し、引用題・quiz の誤答肢の読みに寄る → MEDIUM)。比較: `data/ip/textbook/.planning/v2/strategy-01-01-u08/v1-original.json` (用語 8 語・`term_zh`・`term_en` とも v1 と一致、`prerequisites` = [u07] 一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 (比喩・フックの像や結論が他欄の否定する内容を運ぶ = 観点 7)・D-198 (iii)・zh / en の語が誤答肢の読みに寄る (b18 u05 型) / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え; 一致断片は 12 字以内)。

## 1. 方法

1. **全文読み取り**: 8 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ (職能別組織は analogy 空 = 三語とも空で validate 許容)。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。svg 図 2 枚 (`figures/strategy-01-01-u08-t01.svg` / `-t02.svg`) は v1 継承の mermaid 描画で、ラベルは `figure.mermaid` の文字列 (社長 / 営業部・製造部・開発部・経理部、家電・自動車・食品事業部の下に 営業・製造・経理) を読んだ。
2. **考点 × 引用題 (考点 全 10 件 = exam 7 + mix 3、qid 付き 7 件、引用 qid 延べ 9 件 = 異なり 9 題)**: `data/ip/quiz/questions.json` + `translations/<exam>.json` の `stem_jp_clean` から題文・選択肢・`correct_answer` を再読 (全題 topic `strategy-01-01`)。図の題 2 問 (2016h28a-q025 / 2012h24a-q021) は `stem_jp_clean` の組織図記述 (階層・横並び) で判定。manifest の関連題のうち v1 challenge にあった別単元の題 4 問 (CSR / 株主総会 / グリーン IT / 経営理念) は v2 で外され、本単元の題に差し替え済み (改善、指摘ではない)。topic 内で本単元の見出し語を扱う全 11 題 (上記 9 題 + 2016h28h-q034 + 2016h28h-q026 職務分掌 [本単元外]) を読んだ。
3. **quiz / challenge_questions** (quiz 計 8 枠 + challenge 5 題、うち考点で未引用は 2016h28h-q034 の 1 題): 本文と矛盾しないことを確認 (§2)。2016h28h-q034 は L4。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合: 単元の JP 文字列 132 本 (派生除く、図ラベル・caption・table cell・総表 `overview_rows` / `overview_cols`・対比表を含む) を topic 内全 62 題の題文 (`stem_jp_clean` と raw 両方) + 選択肢と 12 字連続照合 (句読点・記号・空白・罫線除去、NFKC) を **カタカナ 4 字以上 + 英数遮蔽あり / 遮蔽なし** の 2 通りで実施 → **0 / 0 件**。近似一致 (1〜2 字差し替え) 照合: 題の各文 (14 字以上) × 単元各文の長さ ±3 の窓で正規化編集距離と bigram Dice → 最近接は `overview_rows[3].extra_jp[1]` ↔ 2015h27h-q026 ウ (ed 0.33 / Dice 0.40; 「利益に責任」の短句、窓が短い総表セル)、`terms[5].fig.data.nodes[1]` ↔ 2013h25h-q022 ウ (ed 0.33 / Dice 0.60; 「各部門から人を集める」10 字の図ラベル = 定義の一般表現)。疑いのある考点を文全体で直接比較: `terms[6].points[0]` × 2025r07-q015 題文 = ed 0.64 / Dice 0.34、`terms[2].points[0]` × 2015h27h-q026 イ = ed 0.57 / Dice 0.33、`terms[3].points[0]` × 2013h25h-q022 エ = ed 0.89 / Dice 0.15、`terms[4].points[0]` × 2009h21a-q009 題文 = ed 1.00 / Dice 0.26、`terms[2].points[1]` × 2012h24h-q018 題文 = ed 0.78 / Dice 0.25、`terms[5].one_jp` × 2013h25h-q022 ウ = ed 0.64 / Dice 0.36、`pairs[1].rows[1].a_jp` × 2013h25h-q022 ア = ed 0.67 / Dice 0.37。較正の HIGH 例 (ed 0.14 / Dice 0.52) から全て遠い → (i)(ii) の写しなし。
   - **カタカナの多い文の目視**: マトリックス組織の one / detail / exam 考点 / 対比表 × 2009h21a-q009 題文・2013h25h-q022 ア・2026r08-q030 ウ、プロジェクト組織の one / detail / mix 考点 / 図 caption × 2013h25h-q022 ウ・2015h27h-q026 ア・2026r08-q030 エ、カンパニー制の one / exam 考点 × 2025r07-q015 題文、持株会社の detail (純粋持株会社 / 事業持株会社 / ホールディングス) → 写し 0。
5. **D-208 失敗型の明示点検 (§4)**: validate は **`warn choice-echo` 行 0 件**。warn が見えない題文側の判断項目・空欄は本単元の引用題に無い (2016h28h-q034 の「・」2 項目は特徴列挙で正答はネットワーク組織、本単元の考点は引用しない)。9 題全てで (iii) を 1 件ずつ判定。
6. **追加点検 (b21 u05 M1 型)**: 8 用語の analogy / hook の要語を、他の見出し語の語幹・他用語の役割定義・引用題 / quiz の誤答肢と突き合わせた。さらに「部署名で見分ける」型の hook 2 つ (機能別 / 事業部制) を、本単元の引用図題 2 問 (2016h28a-q025 / 2012h24a-q021) の組織図、`terms[3].fig` (t02 svg)、`terms[4].fig` (table) に**実際に当てはめて**どちらが発火するかを確認 → **M1** (機能別 hook)、L1 (事業部制 hook)。
7. **D-195**: 結論先行 (one = 1 文 × 8、太字あり)、展開 2 文 × 8 (detail)、比喩 7 (職能別は空)・フック 8 (§6: 字形 2 [階 / 職]、語源 3 [matrix / project / holding]、名前の手がかり 3 [機能別 / 事業部制 / 社内カンパニー]; 定義の言い換えのみのものは無いが、カンパニー制 hook は「社内」の字義で one の言い直しに近い → L10 に含め記録)、定義前使用 (指揮命令系統 = 階層型 detail で定義、職能 = 職能別 one の括弧注、利益責任 / 独立採算 = 各 one の太字 + 文脈、子会社 = 持株会社 one、純粋 / 事業持株会社 = detail 内で定義)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → `freq_badge`「頻出」のみ。zh / en [必须 = 機能別 analogy_zh「必须配合」・key_points_zh[3]「必须协调」、never = 階層型 hook_en「never skipping a level」] は通常の用法で偽陽性)、図の型 (階層型・持株会社 = tree static、機能別・事業部制 = svg static [v1 図、`figure.svg_path` 一致]、マトリックス = table static、プロジェクト = flow steps 4、職能別・カンパニー制 = 図なし; 全て登録内)、pair 配置 (機能別→事業部制、マトリックス→プロジェクト、カンパニー制→持株会社、各組 key 行 1)。
8. **D-200**: 考点数 1/1/2/2/1/1/1/1 (≤3 ✓)、各 JP 文数 1〜2・字数 42〜70 (≤100 ✓、最大は階層型 `points[0]` の 2 文 70 字)。**framing 件数** (`validateV2.ts` の `pointFraming` を直接呼び出し、全考点): jp 0 / zh 0 / en 0 (上限 2)。
9. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の照合) → M1 (機能別 hook × 事業部制 考点[1]・t02 図)、L1・L2・L3、他は記録。書き方 8 (対比の出現欄) → §3 末尾に列挙。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → 比喩・フックが定義の言い直しのものは無し (カンパニー hook は境界、L10)。§9 言い直し → L10。
10. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・caption・table cell・総表・対比表の三語一致 (parity 35 箇所 0 diff)、`[[jp:…]]` 原語 15 種 (階層型組織 / 指揮命令系統 / マトリックス組織 / 機能別組織 / 職能別組織 / 職能 / 機能 / 事業部制 / プロジェクト組織 / カンパニー制 / 独立採算 / 持株会社 / 純粋持株会社 / 事業持株会社 / ホールディングス) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 8 用語に見出し語の `[[jp:]]` あり (D-202)、zh 訳語が `zh_terms.json` に従うこと (validate の B6 warn 0 / jp-origin warn 0; 层级型组织 / 职能制组织 / 职务制组织 / 事业部制 / 矩阵制组织 / 项目型组织 / 公司制（内部分公司制） / 控股公司 一致)。loc-review r1 の LOW 8 件の反映状況を確認 → **8 件とも未反映** (PASS 判定のため B3 に回っていない)。うち 2 件 (fidelity 系) を L5・L6 (建议修) として再掲、残りは L12 に記録。
11. **前回審査の HIGH / MEDIUM 解消**: journal `journal.b22-u08-a1.jsonl` の result 行 4 本 (jp r0 / jp-review r1 PASS / loc r0 / loc-review r1 PASS) に HIGH / MEDIUM は 0 件 → 解消確認の対象なし。jp-review の LOW 9 件は全て未反映で、うち 事業部制 analogy → L2、challenge q034 → L4、key_points_jp[0] → L8、プロジェクト quiz → L9、プロジェクト detail の因果 → L13、(iii) 非該当の記録 3 件 → L11 に再掲。
12. **D-205 / D-210**: 改訂される文書 (規格・法・ガイドライン・知識体系) の構成要素の数・名称、改正前の文言で書かれた引用題とも本単元には無い (持株会社の detail は純粋 / 事業持株会社の区別のみで、独占禁止法の解禁経緯などの法令記述なし) → N/A。
13. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§7 に出力全文)。
14. **補丁案の事前ゲート**: M1・L1〜L7 の after 文字列 (+ 派生フィールド再生成) を scratchpad の複製に当て `--file` で validate / parity → **0 issues / 35 locations 0 diff** (§7)。単元ファイル本体は未変更 (sha256 先頭不変)。

## 2. 用語別判定 (8 / 8)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 階層型組織 | OK — mix 1: 原則として直属の上司は 1 人、上司 2 人以上のマトリックスとは指揮命令系統の本数が違う — 「原則として」保持、マトリックス one / detail / pairs[1].rows[2] と整合。tree 図 (経営者→部長→課長→担当者) は one と一致 | OK | OK | L8 (key_points[0]) |
| 2 | 機能別組織 | OK — exam 1 / 1 題: 社長の直下に機能ごとの部門が横並びで事業ごとのまとまりが無い組織図 = 機能別 (職能別) (2016h28a-q025 正答ウ 職能別組織; 誤答 事業部制 / 社内ベンチャ / マトリックス を支持しない)。「事業ごとのまとまりが無い」が 2012h24a-q021 (社長直下にも総務・人事 / 経理・財務が並ぶが事業担当の下に機能が重なる) との判別点として正しく働く | OK (svg 図 = v1) | OK | **M1 (hook)** |
| 3 | 職能別組織 | OK — exam 2 / 2 題: 業務を専門の役割ごとに分け部門とする (2015h27h-q026 正答イ) / 事業が少なく環境が安定した企業に向く (2012h24h-q018 正答イ; 題は 規模小・単一事業・安定顧客 を「など」で例示、考点は 2 条件を一般化して述べ「だけ」と閉じない → 限定語落ちには当たらない; 誤答 カンパニ制 / プロジェクト / マトリックス を支持しない)。one「機能別組織と同じ形」= 別名を同一物として扱う (失敗型 (3) 非該当) | OK | zh detail の 职能 / 机能 が zh 見出し語と交差 L7 | L7, L11, L12 |
| 4 | 事業部制 | OK — exam 2 / 4 題: 各事業部が利益責任を持ち機能を内部にそろえ経営活動がほぼ完結 (2013h25h-q022 正答エ / 2009h21h-q029 正答ウ; 「ほぼ」は題の「自己完結的」に対し控えめで矛盾なし) / 事業ごとの責任者の下に機能別の部門が置かれる組織図 = 事業部制、同じ機能でも事業が違えば別の部門 (2012h24a-q021 正答ア / 2026r08-q030 正答ア; 誤答 イ = 複数事業の人事を 1 組織 → 機能別、ウ = 2 人の上司 → マトリックス、エ = 期間限定 → プロジェクト を支持しない)。「ひとそろい」は q021 の図 (総務・人事 / 経理・財務は本社側) より強い → L3 | OK (svg 図 = v1) | OK | L1 (hook), L2 (analogy), L3, L10 |
| 5 | マトリックス組織 | OK — exam 1 / 1 題: 事業側の目的に沿った管理と職能部門の専門の責任を 1 人の中で両立、上司 2 人以上 (2009h21a-q009 正答エ; 題の「プロジェクトの目的別管理」を one の「事業 (製品やプロジェクト)」で包含)。table 図 (開発 / 販売 × 製品 A / B) は one・detail と一致。2013h25h-q022 ア・2015h27h-q026 エ・2026r08-q030 ウ (いずれも本単元の事業部制 / 職能別の題の誤答肢 = マトリックスの説明) を正の定義で識別できる | OK | OK | L11, L12 |
| 6 | プロジェクト組織 | OK — mix 1: 目的を果たすと解散する一時的組織、常設の機能別・事業部制と存続のしかたが違う — 正しい。quiz 2026r08-q030 では誤答エ (横断的に人材を集め企画開発後に解散) がプロジェクト組織の説明で、one / flow 図で識別できる。flow steps 4 (目的・期限→各部門から集める→取り組む→解散) は one と一致 | OK | OK | L9, L13 |
| 7 | カンパニー制 | OK — exam 1 / 1 題: 意思決定の迅速化・独立採算の推進のため 1 企業の内部に事業分野ごとの独立性の高い組織を設ける (2025r07-q015 正答ア; 誤答 機能別 / プロジェクト / マトリックス を支持しない)。detail「事業部制より広い範囲…が多い」「法律上は 1 つの会社のまま」は正しく、pairs[2].rows[0] と一致 | OK | OK | L6, L11 |
| 8 | 持株会社 | OK — mix 1: 子会社は法律上も別の会社、法人 1 つのカンパニー制とは分ける深さが違う — 正しい。detail の純粋 / 事業持株会社の区別は標準的。tree 図 (持株会社→子会社 A/B/C 別法人) 一致。引用題なし (topic 内に持株会社を問う題 0) で `quiz = []` は妥当 | OK | OK | L12 |

**単元レベル**: goals 3 点・overview_cols 2 (部門・単位の分け方 / 指揮命令・責任)・overview_rows 8 行・pairs 3 組 (機能別 / 事業部制 4 行 key 1、マトリックス / プロジェクト 3 行 key 1、カンパニー制 / 持株会社 2 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge_questions 5 件 (2009h21h-q029 / 2015h27h-q026 / 2016h28h-q034 / 2025r07-q015 / 2026r08-q030 — 4 題は本文で解ける、q034 は L4)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 13 (うち 建议修 7)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** (観点 7: フックの結論が他欄・図と食い違い、引用題の誤答肢へ寄る = 本批の追加点検 [b21 u05 M1 型]) | `terms[1](機能別組織).hook_jp` / `hook_zh` / `hook_en` (+ 派生 `memory_hook_jp/zh/en`, `summary.memory_hooks_jp/zh/en[1]`) | フック「部署名を見て『何をする部か』が分かれば機能別。営業部、経理部などの名前が並ぶ」は、仕事の名前の部署があること自体を機能別の印にしている。ところが同単元の `terms[3].points[1]` は「事業ごとの責任者の下に、仕事の機能ごとの部門が置かれる組織図は事業部制」と述べ、`terms[3].fig` (t02 svg) は各事業部の下に 営業・製造・経理 を描く — 機能名の部署は事業部制にもある。引用図題 2012h24a-q021 (事業部制 考点[1] の qid・事業部制 quiz) の組織図には社長直下の 総務・人事 / 経理・財務 と各事業担当の下の 研究開発 / 販売 / 生産 があり、このフックは発火して誤答イ (職能別組織) へ導く。一方、事業部制 hook (製品名・地名) は q021 の「A 事業担当」には発火しない。判別点は機能別 `points[0]` が既に持つ「事業ごとのまとまりが無い」(= 同じ機能の部署が 1 つずつ) で、フックがそれを落としている。事実誤りではないので HIGH ではない | jp「部署名を見て「何をする部か」が分かれば機能別。営業部、経理部などの名前が並ぶ。」→「営業部・経理部のように「何をする部か」が分かる部署が会社に1つずつ並び、事業ごとのまとまりが無ければ機能別。」/ zh「看部门名称就知道“这个部门做什么”的，就是职能制，比如销售部、财务部。」→「像销售部、财务部这样一看就知道“做什么”的部门在公司里各只有一个、也没有按业务归组的，就是职能制。」/ en "If a department's name tells you what it does, such as Sales or Accounting, it is a functional organization." → "If departments named for what they do, such as Sales or Accounting, each appear only once and nothing is grouped by business, it is a functional organization." (q025 = 各 1 つ → 発火、q021 / t02 = 機能が事業ごとに重なる → 不発火、を確認) |
| L1 | LOW **建议修** | `terms[3](事業部制).hook_jp/zh/en` (+ 派生 `memory_hook_*`, `summary.memory_hooks_*[3]`) | 「部署名に製品名や地名が付いていれば事業部制の目印」は、同単元マトリックスの table 図の事業軸 (製品 A / B の責任者) にも、quiz・引用題 2026r08-q030 の誤答ウ (地域 M・製品 X の上司 2 人) にも当てはまる手がかり。「目印」と弱め、q030 ウは部署名でなく上司の担当範囲なので MEDIUM には至らないが、M1 と同じく判別点 (機能が事業ごとに重なる) を欠く | jp「部署名に製品名や地名が付いていれば事業部制の目印 (例えば「家電事業部」「関西事業部」)。」→「製品名や地名の付いた事業部 (例えば「家電事業部」「関西事業部」) ごとに、営業や製造の部署が繰り返し置かれていれば事業部制の目印。」/ zh「部门名称里带有产品名或地名，就是事业部制的标志（例如“家电事业部”“关西事业部”）。」→「在带有产品名或地名的事业部（例如“家电事业部”“关西事业部”）之下，各自重复设有销售、制造部门，就是事业部制的标志。」/ en "A product or place name in a department's title, such as Home Appliances Division or Kansai Division, marks a divisional structure." → "Divisions named for a product or place, such as Home Appliances Division or Kansai Division, each with their own sales and manufacturing departments, mark a divisional structure." |
| L2 | LOW **建议修** (jp-review LOW の再掲) | `terms[3](事業部制).analogy_jp/zh/en` | 商店街のパン屋・花屋 = 経営者も別の独立した店で、共通の上位 (社長) が無い像。単元は goals[2]・pairs[2] で「法人 1 つ / 別法人」を区別させ、カンパニー制 detail は事業部制をカンパニーより権限の狭い社内区分として扱うため、像が別会社 (持株会社の子会社) 側に寄る。引用題・quiz に別会社型の誤答肢は無いので LOW | jp「商店街で、パン屋や花屋がそれぞれ仕入れから会計までを自分の店の中で回しているのに似ている。」→「1人のオーナーが持つパン屋と花屋が、それぞれ仕入れから会計までを自分の店の中で回しているのに似ている。」/ zh「就像商业街上的面包店和花店，各自在店内完成从进货到结账的全部工作。」→「就像同一位老板名下的面包店和花店，各自在店内完成从进货到结账的全部工作。」/ en "It is like the bakery and the flower shop on a shopping street, each handling everything from buying stock to keeping the books inside its own store." → "It is like a bakery and a flower shop owned by the same person, each handling everything from buying stock to keeping the books inside its own store." |
| L3 | LOW **建议修** | `terms[3](事業部制).points[1].text_jp/zh/en` | 「仕事の機能ごとの部門が**ひとそろい**置かれる」は、引用図題 2012h24a-q021 の図 (総務・人事 / 経理・財務は社長直下の本社側、各事業担当の下は 研究開発 / 販売 / 生産 のみ) より強い条件。答え (事業部制) は他肢が当てはまらないので覆らない → 限定の付け過ぎ (LOW) | jp「事業ごとの責任者の下に、仕事の機能ごとの部門がひとそろい置かれる組織図は事業部制を表す。」→「事業ごとの責任者の下に、その事業を進める仕事の機能ごとの部門が置かれる組織図は事業部制を表す。」/ zh「在每项业务的负责人之下配置一整套按工作职能划分的部门，这样的组织图表示事业部制。」→「在每项业务的负责人之下配置开展该业务所需的、按工作职能划分的部门，这样的组织图表示事业部制。」/ en "An organization chart with a full set of function-based departments under the head of each business shows a divisional structure." → "An organization chart with the function-based departments that run each business placed under that business's head shows a divisional structure." |
| L4 | LOW **建议修** (jp-review LOW の再掲) | `challenge_questions[2]` | 2016h28h-q034 の正答はネットワーク組織で本単元に無い (v1 継承)。本文からはマトリックス (誤答エ) を消せるだけで正答を導けない (u06 の SSL 題のように本文で解ける場合と異なる) | `"2016h28h-q034"` → `"2012h24a-q021"` (事業部制の図題; M1 修正後のフックで解ける。あるいは `"2012h24h-q018"`) |
| L5 | LOW **建议修** (loc-review LOW の再掲) | `pairs[0].rows[3].b_en` | jp「無駄が出やすい」(傾向) が en "causing waste" で断定 | "The same functions are duplicated in each division, causing waste" → "The same functions are duplicated in each division, which tends to cause waste" |
| L6 | LOW **建议修** (loc-review LOW の再掲) | `key_points_en[4]` (+ 派生 `summary.key_points_en[4]`) | 独立採算の en 訳が one_en / overview_rows[6] "self-supporting unit"、points "self-supporting accounting"、key_points "self-supporting responsibility" と揺れる。最後の形は jp「独立採算の責任」の意味がぼやける | "A company system gives internal business areas broad authority and self-supporting responsibility, yet it remains one legal entity." → "A company system gives internal business areas broad authority and responsibility as self-supporting units, yet it remains one legal entity." |
| L7 | LOW **建议修** | `terms[2](職能別組織).detail_zh` (+ 派生 `explanation_zh`) | zh 見出し語は 機能別組織 = 职能制组织、職能別組織 = 职务制组织 (zh_terms.json どおり)。ところが detail_zh は「“职能”着眼于人所承担的专业角色，“机能”着眼于工作本身」と述べ、zh 読者には 职能 (= 职能制 = 機能別の訳語の語幹) が「人の役割」側に見え、jp の対応 (職能 → 職能別、機能 → 機能別) と逆に読める (見出し語の語幹が別の意味で定義される = 追加点検の型)。両語は同じ形を指し誤答肢も無いので LOW。en は "The Japanese word for…" と日本語の語であることを明示済み | zh「“职能”（[[jp:職能]]）着眼于人所承担的专业角色，“机能”（[[jp:機能]]）着眼于工作本身的作用。」→「日语的“职能”（[[jp:職能]]）着眼于人所承担的专业角色，“机能”（[[jp:機能]]）着眼于工作本身的作用。」(「日语的」の追加のみ、2 文目は不変) |
| L8 | LOW | `key_points_jp/zh/en[0]` | 「ほかの組織形態でも指揮命令系統の土台になる」は detail の「機能別組織や事業部制も」を全形態へ広げる (jp-review LOW)。マトリックスも上下の段は持つので矛盾ではない | 記録のみ (任意: 「機能別組織や事業部制でも」へ絞る) |
| L9 | LOW | `terms[5](プロジェクト組織).quiz` | 2026r08-q030 は事業部制の事例を問い、プロジェクト組織は誤答エとしてのみ出る (jp-review LOW)。topic 内にプロジェクト組織を正答とする題は 0 で、誤答エを識別する確認としては機能する | 記録のみ |
| L10 | LOW | `terms[3].one_jp` / `points[0]` / `key_points_jp[2]`; `terms[6].detail_jp` / `terms[7].points[0]` / `pairs[2].rows[0]` / `key_points_jp[4]`; `terms[6].hook_jp` | §9 同義の言い直し: 事業部制の「利益責任 + 機能を内部に」が one・考点[0]・key_points[2] の 3 箇所 (jp-review LOW)。「法人 1 つ / 別法人」が カンパニー detail・持株 mix 考点・pairs[2].rows[0]・key_points[4] の 4 箇所 (書き方 8 の上限 2 を超えるが、key_points は要約欄で、カンパニー detail は単独の事実記述)。カンパニー hook は「社内」の字義で one に近い | 記録のみ |
| L11 | LOW | `terms[6].points[0]`、`terms[2].points[0]`、`terms[2].points[1]`、`terms[4].points[0]` | D-198 (iii) 非該当の記録 (D-209 分類題の免除; 選択肢は組織名のみ or 正答肢のみ対応): ① カンパニー考点は 2025r07-q015 題文の要素を**同順** (目的 2 点 [意思決定の迅速化 → 独立採算の推進] → 1 企業の内部 → 事業分野ごと → 独立性の高い組織 → 形態) で言い換え (ed 0.64 / Dice 0.34) — 題文がカンパニー制の標準定義で、選択肢は名前だけ。② 職能別 考点[0] は 2015h27h-q026 正答イの構文 (業務を専門の〜に分け → 各〜を単位として構成) を「役割」に置換して踏襲 (ed 0.57 / Dice 0.33) — 正答の一般定義。③ 職能別 考点[1] は 2012h24h-q018 の条件 3 つ (規模小 / 単一事業 / 安定顧客) のうち 2 つを同順で一般化、「など」は閉じない。④ マトリックス考点は 2009h21a-q009 題文の要素 (上司 2 人以上 / 目的別管理 / 職能的責任 / 調和) を順を入れ替えて言い換え (ed 1.00 / Dice 0.26)。いずれも誤答肢の語句・組・順は使わない | 記録のみ (①は将来題文の順を崩す余地あり) |
| L12 | LOW | loc-review LOW の未反映分 | `terms[2].hook_zh` (职 ↔ 手艺人の字の結び付きが zh で弱い) / `terms[4].points[0].text_zh/en` (因此 / so で因果を付加、内容は誤りでない) / `terms[1].points[0].text_zh/en` (括弧の入れ子) / `terms[7].points[0].text_en` (所有格の後に原語) / `terms[5].points[0].text_en` (語順) / `overview_rows[7].extra_zh[0]` (按各个独立法人的子公司) / `overview_rows[6].extra_en[1]`・`terms[6].one_en` の self-supporting 揺れ (L6 で key_points のみ修正) | 記録のみ (loc-review の fix_jp を参照) |
| L13 | LOW | `terms[5].detail_jp/zh/en` 2 文目、`overview_rows[5].extra_jp/zh/en[1]` | detail「解散すると元の部門に戻るので、期限とゴールをはっきりさせて動く」は因果が逆向き気味 (jp-review LOW)。総表 extra「期間中はプロジェクトの責任者の下で動く」は pairs[1].rows[2].b_jp の「主に」を欠く (総表の短句、矛盾ではない) | 記録のみ |

**範囲外の観察** (書き直し対象外):
- O1 svg 図 2 枚 (`terms[1].fig` / `terms[3].fig`) は v1 継承の mermaid 描画で、ラベルは jp のみ (zh / en 読者にも jp で表示)。t01 は「製造部」、機能別 one_jp は「生産」と語が揺れるが同義。
- O2 v1 の challenge にあった別単元の題 4 問 (CSR / 株主総会 / グリーン IT / 経営理念) は v2 で外され本単元の題に差し替え済み (改善)。
- O3 2009h21a-q009 / 2016h28a-q025 の誤答「社内ベンチャ組織」、2009h21h-q029 の誤答ア (小集団)、2016h28h-q034 のネットワーク組織 / タスクフォースは本単元の見出し語外。本文はこれらを支持も否定もしない。

**対比の出現欄 (書き方 8 の列挙)**: ① 機能別 = 仕事の機能 / 事業部制 = 事業の単位: `pairs[0].rows[0]`、各 one (定義そのもの)、goals[0] (予告)、overview の extra (総表の構造) → 許容。② 利益責任 (会社全体 / 事業部ごと): `pairs[0].rows[1]`、事業部制 one・考点[0]・key_points[2] (片側の言い直し → L10) → 許容。③ 強み・弱み (専門性・重なり少 / 素早い・重なり無駄): `pairs[0].rows[2..3]`、各 detail は自分の側のみ → 許容。④ 常設 / 解散: `pairs[1].rows[0]` + プロジェクト mix 考点 の 2 箇所 → 許容。⑤ 上司 1 人 / 2 人以上: 階層型 mix 考点 + `pairs[1].rows[2]` (相手はプロジェクト) + マトリックス考点・key_points[3] (片側) → 許容。⑥ 法人 1 つ / 別法人: `pairs[2].rows[0]` + 持株 mix 考点 + カンパニー detail + key_points[4] → L10。⑦ 職能 / 機能 (呼び名の違い): 職能別 detail のみ (+ L7) → 許容。

## 4. D-208 失敗型の明示点検

| 型 | 判定 | 根拠 |
|---|---|---|
| (1) D-198 (iii) 選択肢・判断項目のなぞり | **該当なし** (L11 に記録) | validate の `warn choice-echo` 0 行。各題で確認: **2016h28a-q025** — 図の特徴 (社長直下の横並び・事業のまとまり無し) を正の判別点として述べ、選択肢 (名前 4 つ) を再現しない。**2015h27h-q026** — 職能別 考点[0] は正答イの構文に沿う (L11 ②; 分類題の正答を見出し語の一般定義として述べる D-209 免除、ed 0.57 で語句の写しではない)。誤答 ア / ウ / エ (プロジェクト / 事業部制 / マトリックス の説明) は各見出し語の one で正の定義として述べるのみ (D-209 第 1 型: 取り違えやすい語の正の定義)。**2012h24h-q018** — L11 ③。**2013h25h-q022 / 2009h21h-q029** — 事業部制 考点[0] は正答の要点 (利益責任 + 機能を内部に + 完結) を述べ、誤答肢の組・順を使わない (ed 0.89)。**2012h24a-q021 / 2026r08-q030** — 考点[1] は図の構造と事例の一般則 (同じ機能でも事業が違えば別部門) を述べ、q030 の人物 (A さん)・事業名 (X / Y)・購買の場面を使わない。誤答イ (複数事業の人事を 1 組織) の場面の再演なし。**2009h21a-q009** — L11 ④。**2025r07-q015** — L11 ① (同順の言い換え; 選択肢は名前だけで分類題の免除)。 |
| (2) 引用題の限定語 (「など」等) の落ち | なし | 2012h24h-q018 の「など」付き条件列挙を考点は「向く」(十分条件) として述べ「だけ」と閉じない。2013h25h-q022 エ の「製品別, 顧客別又は地域別」は one の「製品や地域など」で開いたまま。2009h21a-q009 の「2 人又はそれ以上」は「2人以上」で保持 |
| (3) シラバス上の別名を別物として教える | なし | 機能別組織 / 職能別組織は one・総表・key_points[1] で「同じ形を指す呼び名」と明記 (別用語として立項はするが、別物とは教えない)。事業部制 / 事業部制組織、カンパニー制 / カンパニー制組織も同一 |
| (4) 比喩・図の範囲が one / detail と矛盾 (D-204) | **M1** (+ L1・L2) | M1: 機能別 hook の「機能名の部署がある → 機能別」が事業部制 考点[1] と t02 図に反し、q021 の誤答イに寄る。L1: 事業部制 hook の「製品名・地名」がマトリックス table 図の事業軸にも当たる。L2: 事業部制 analogy の独立店舗像が別法人側に寄る。他の比喩 (部活動 / 厨房 / クラス担任と顧問 / 文化祭実行委員会 / 兄弟の財布 / 御者と馬車) と図 6 つは one・detail と整合 |
| (5) 前回修正の zh / en での退行 | なし | 前回 HIGH / MEDIUM 0 件。loc の各考点を jp と目視照合 (parity 0 diff) |
| (6) zh / en の語が引用題・quiz の誤答肢の読みに寄る | なし (L7 は誤答肢無しの LOW) | 職能別 detail_zh の 职能 / 机能 の交差は zh 見出し語との食い違いだが、両者は同じ形で誤答肢を作らない。マトリックス points zh「因此」/ en "so" は因果付加のみ。事業部制 points[1] en "a full set" は jp「ひとそろい」どおり (L3) |
| (7) D-210 改正前の文言の題 | N/A | 法・規格の題なし |
| 追加 (b21 u05 M1 型: 要語が他見出し語の語幹・他用語が別定義する役割) | **M1** (+ L7) | 機能別 hook の「何をする部か分かる部署名」は 事業部制 (考点[1]・t02 図) が別に位置付ける要素で、引用図題 q021 の誤答イへ寄る → M1。階層型 analogy の「監督・キャプテン・リーダー」、マトリックス analogy の「担任・顧問」、プロジェクト analogy の「実行委員会」、持株 analogy の「御者」は他の見出し語の語幹でも他用語が定義する役割でもない。zh「职能」は L7 |

## 5. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **13** (建议修 7: L1〜L7 / 記録のみ 6: L8〜L13) |

## 6. 判定

**FAIL** (D-199: MEDIUM 1)。全 8 用語・考点 10 件 (qid 付き 7 件、引用 9 題)・quiz / challenge の全 10 題で、考点の主張は正答と一致し、誤答肢を支持する考点・限定条件の落ち・D-198 写し ((i)(ii)(iii)) は無い。唯一の MEDIUM は機能別組織の hook が「機能名の部署名」を機能別の印とし、同単元の事業部制 考点[1]・t02 図と食い違い、引用図題 2012h24a-q021 の誤答イ (職能別組織) へ導く点 (M1) で、`terms[1].hook_jp/zh/en` の文字列置換 (B3 補丁) で解消できる。補丁時は同じ型の L1 (事業部制 hook) と L2〜L7 (建议修) も同時に当てることを推奨。

## 7. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-01-u08
✓ strategy-01-01-u08 unit: 0 issues (data/ip/textbook/units/strategy-01-01-u08.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-01-u08
✓ strategy-01-01-u08 parity: 35 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --file <scratchpad>/u08.patched.json   # M1・L1〜L7 適用後の複製
✓ strategy-01-01-u08 unit: 0 issues
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --file <scratchpad>/u08.patched.json
✓ strategy-01-01-u08 parity: 35 locations, 0 diff
EXIT=0
```
