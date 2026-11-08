# Rule A 全数抽検 — strategy-06-20-u01 (クラウドのサービスモデル(○aaS))

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b67)、repo HEAD `b72a24ee` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b67-u01-a1` merge 結果、sha256 先頭 `e33eef61b8bf2e8a`)。
- **対象**: `data/ip/textbook/units/strategy-06-20-u01.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (クラウドコンピューティング / SaaS / PaaS / IaaS / DaaS) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。同批の `strategy-06-20-u02` (配置形態・運用形態) と `strategy-06-20-u03` (SI / アウトソーシング / ASP / ホスティング / ハウジング) の現行本文と突き合わせた。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-211、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/strategy-06-20-u01/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。前段審査: `journal.b67-u01-a1.jsonl` (jp r0 → jp-review #1 REVISE medium 2 → jp r1 → jp-review #2 PASS → loc r0 → loc-review PASS)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士 (単元間を含む) の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・cell) / quiz` と単元レベル全フィールドを三語とも読んだ (派生フィールドを除いた平坦化 434 行)。派生フィールド (`summary.key_points_* / summary.memory_hooks_* / overview.intro_*`) は本体の記法除去版で一致 (`[[jp:X]]` → 括弧なしの X 連結は既コミット単元 management-11-30-u01 と同じ変換)。
2. **考点 × 引用題 (考点 6 件 = exam 3 + mix 3、うち qid 付き 5 件、引用 qid 延べ 8 件 = 異なり 6 題)**: `data/ip/quiz/questions.json` から題文 (stem_jp_clean 優先)・選択肢・`correct_answer` を再読 (全題 topic `strategy-06-20`)。quiz / challenge でのみ使う 2009h21h-q006 を加え計 7 題。
3. **前段 HIGH/MEDIUM の解消確認**: jp-review #1 medium 2 件 → §2-1。
4. **D-198 写し**: validate copy guard = 0。独立照合: 単元 JP 文字列 100 本 × topic 全 21 題の題文 + 選択肢、12 字連続窓 (句読点・記号除去、①カタカナ 4 字以上・英数を □ 遮蔽 / ②遮蔽なし) + 1〜2 字置換の近似窓 + 個別の ed / Dice 計算 (§2-2)。
5. **D-195 / D-200 / framing / §9**: 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh / en 相当語) → jp・zh ヒット 0、en は "only" の通常用法のみ (偽陽性)。framing (考点内の試験枠表現): jp 0 / zh 0 / en 0。考点数 3/1/1/1/0 (≤3)、各 JP 1〜2 文・56〜88 字 (≤100、最大 PaaS `points[0]` 88 字 2 文)。図: クラウド = compare static、IaaS = table static、他は図なし (登録内)。
6. **三語・訳語**: `[[jp:]]` 原語 8 種 (クラウドコンピューティング / オンプレミス / サービスモデル / アプリケーションソフトウェア / 基盤 / ミドルウェア / ハードウェア資源 / デスクトップ環境) 全て jp 本文に実在。one_zh / one_en 5/5 に見出し語併記 (SaaS 等は略号のまま)。zh_terms: 云计算 / 本地部署 一致、他の 6 種は表に無し (一般語)。
7. **単元間整合 (u02 / u03)**: クラウドの定義と「オンプレミスとの分かれ目」、IaaS / ハウジング / ホスティング、SaaS / ASP、オンプレミス / アウトソーシングの言い方を照合 (§2-3)。
8. **機械ゲート**: §6。

### 2-1. 前段 jp-review の MEDIUM の解消

| 前段指摘 | 現状 | 判定 |
|---|---|---|
| #1 medium `terms[1].points[0]` — 2017h29a-q011 エの「必要な機能 → 必要なとき → ネットワーク経由」の順をなぞり 2009h21h-q006 ウの課金句を足した | 現行は「アプリケーションの層まで事業者が用意するサービスモデルで、利用者は業務ソフトを自前で開発も導入もしない」= 層の枠組みで言い切る形。q011 エとの ed 0.86 / Dice 0.27、要素の並び・課金句なし。zh / en も同内容で正解肢の並びの再現なし | 解消、回帰なし |
| #1 medium `terms[1].points[1]` — 2015h27h-q020 題文と 12 字一致「環境で提供されるサービス」 | 考点ごと削除 (journal counts.points 7 → 6)。独立照合でもこの句のヒット 0 | 解消、回帰なし |

### 2-2. D-198 写し照合の結果

- 12 字窓 (遮蔽あり): **0 件**。遮蔽なし: 38 件、全て見出し語そのもの (クラウドコンピューティン… / アプリケーションソフトウ… / SaaSSoftware…・…asaService の略語展開) → 用語名で偽陽性。
- 1〜2 字置換の近似窓: 見出し語の変化形 (…コンピューティング環 / グリッドコンピューティング) と一般語の並び (サーバやソフトウェア / ソフトウェアの機能を / 利用者がネットワーク) のみ → 偽陽性。
- 個別計算 (正規化後、calibration HIGH = ed 0.14 / Dice 0.52):

| 欄 | 照合先 | ed | Dice | 判定 |
|---|---|---|---|---|
| `terms[0].detail_jp` 3 文目 (オンプレミスの定義) | 2019h31h-q030 題文 (分類型、正答 = オンプレミス) | 0.39 | 0.61 | 標準定義の言い換え。語順入替 + 「保有・」「置いて自ら」で ed は calibration から遠い → L5 記録のみ |
| `pairs[1].rows[0].a_jp`「ハードウェアに加えて OS・ミドルウェア」 | 2017h29a-q011 ウ (誤答肢 = PaaS の説明) | 0.48 | 0.53 | 「ハードウェア[機能]に加えて，OS」の骨組みが近い短いセル → L1 建議修 |
| `terms[0].points[0]` | 2018h30a-q009 イ (分類型の正答) | 0.74 | 0.34 | 正答の内容を定義として述べる (D-209 免除内)、語句の再現なし |
| `terms[0].points[1]` | 2021r03-q005 ウ | 0.94 | 0.12 | 片仮名語 (オンデマンド / スケーラブル) を説明に置換、列挙 (ソフトウェアやハードウェアなど) 落とし → 写しでない |
| `terms[1].points[0]` | 2017h29a-q011 エ | 0.86 | 0.27 | §2-1 |
| `terms[2].detail_jp` 1 文目 | 2015h27a-q005 イ (誤答肢) | 0.93 | 0.19 | {OS・DBMS・サーバ} の組は PaaS の標準構成。順序も異なる → L8 記録のみ |

- (iii) option tracing: `terms[2].points[0]` (SaaS / PaaS mix、2017h29a-q011・2015h27a-q005) と `terms[3].points[0]` (PaaS / IaaS mix、qid なし) は SaaS 題の誤答肢 (PaaS・IaaS の説明 / 自社システムを基盤上に構築する事例) と対応するが、両側とも肯定の定義で、誤答肢の語句・場面 (購買システム・汎用データベース) ・並びを使っていない → D-209 の対比免除内。`terms[1].points[0]`「自前で開発も導入もしない」は 2015h27a-q005 のイ・ウ (自社システムを構築) の否定にも読めるが、層の定義からの帰結として述べ「構築」の語・場面を使っていない → (iii) に当たらない (語の衝突は L13)。validate の `choice-echo` warn は 0 件。

### 2-3. 単元間整合 (u02 / u03)

- **クラウドの定義 × u02 プライベートクラウド**: u01 は「IT 資源を**自社で持たず**、事業者が用意したものを使う」(`terms[0].one_*`)、「事業者の資源を借りる**クラウドコンピューティングとは設備の持ち主で分かれる**」(`terms[0].points[2]`)、比較図 (列見出し = クラウドコンピューティング、行「設備の持ち主」= サービス事業者)、`key_points_*[0]`「自社で持たずに事業者から借り」、`overview_rows[0].one_line_*`「事業者から…借りて使う」、`goals_*[0]`「資源の持ち主で見分ける」と、**クラウド全体を事業者所有に限り、オンプレミスとの境を設備の持ち主に置く**。一方 u02 は プライベートクラウド `detail_jp`「自社のデータセンターに構築する場合もある」、オンプレミス `points[1]`「自社の施設で自社が運用する環境でも、クラウドの仕組みで 1 つの組織が専用に使うものはプライベートクラウドとも呼ばれる」、overview「自社内、または事業者内の専用区画」と書く。u02 を読んだ学習者には「自社設備のプライベートクラウドはクラウドなのか」が両単元で食い違う。これは u02 attempt 1 (`failures/.../strategy-06-20-u02_attempt_1.md`) の jp-review #1 medium と同じ型 (クラウド全体を事業者の設備に限る) → **M1**。u02 側は比較相手を パブリッククラウド に限って解消しているので、u01 も「事業者のクラウドを借りる場合」に範囲を絞る形で揃える。引用題 (2019h31h-q030 / 2021r03-q005 / 2018h30a-q009) はいずれも「クラウド = 自社で持たない」を問わず、正答は u01 の記述で引き続き解ける (HIGH ではない)。
- **オンプレミスの言い方**: u01 detail「自社で保有・管理する設備に置いて自ら運用」/ u02 one「自社が管理する施設に設置し、自社で運用」/ u03 アウトソーシング p1「自社で管理する設備にシステムを置いて自ら運用」→ 一致 (運用の担い手を含む定義で揃う。u02 マネージドサービスの「運用は別の軸」との関係は u02 側の論点で u01 は触れない)。
- **IaaS × u03 ハウジング / ホスティング**: u01 IaaS は「サーバ・ストレージ・回線 = 事業者」(図・one) で、u03 ホスティング (事業者のサーバを借りる) と同じ側、ハウジング (利用者の機器を事業者施設に置く) とは逆側。本文は整合。ただし IaaS の `analogy` (電気と水道の引かれた空き地を借り建物は自分で建てる) は「場所と電気・水道 (≒ 電源・回線) を借り、上物を自分で持ち込む」像で、u03 ハウジングの one (設置場所と設備環境を借りる) に重なる → L2。
- **SaaS × u03 ASP**: u03 ASP detail「u01 で学んだ SaaS と同じ系統」と、u01 SaaS (事業者のサーバで動くアプリの機能をネットワーク越しに借りる) は整合。
- **SI / アウトソーシング**: u01 は触れない (2015h27h-q020 の誤答 システムインテグレーション / エスクロー / ハウジングを u01 は否定も記述もしない) → 整合。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | クラウドコンピューティング | exam p0: 資源の提供と利用の形態 (2018h30a-q009 正答イ = コンピュータ資源の提供に関するサービスモデル; 誤答 = 通信プロトコル・開発手法・EDI 規格を支持しない) OK / exam p1: 置き場所を意識せずネットワーク越し、必要時に確保、後から増減 (2021r03-q005 正答ウ = ネットワーク経由・オンデマンド・スケーラブル; 誤答 = 集中処理・EUC・分散処理を支持しない) OK、2015h27h-q020 (正答 SaaS) は題文の前提でしか支持しない → L6 / mix p2: オンプレミス = 自社設備で自ら運用 (2019h31h-q030 正答イ) は正しいが「クラウドとは設備の持ち主で分かれる」が排他 → **M1**。図 compare 4 行 (持ち主 / 初期費用 / 料金 / 増減) はパブリックな事業者クラウドとしては正しいが列見出しが「クラウドコンピューティング」全体 → **M1** | one 1 文太字、detail 3 文、analogy (井戸 → 水道) は定義の言い換えでない、hook (雲の図) OK。オンプレミスが図で detail より先に出る → L10 | one_zh「需要时按需取用」は時・量の 2 点が曖昧 (loc LOW、M1 の修正文で同時に解消) / detail_en「keeps … low」は jp「抑えやすい」より強い → L4 | M1, L4, L5, L6, L7, L10 |
| 2 | SaaS | exam p0: アプリ層まで事業者、利用者は業務ソフトを自前で開発・導入しない (2017h29a-q011 正答エ / 2015h27a-q005 正答ア; 誤答 = 接続サービス・ハードウェア機能・基盤提供 / 基盤上で自社システム構築・自社サーバを事業者施設に設置 を支持しない) OK。detail「多くの利用企業が共同で使い利用量・期間で払う」は 2009h21h-q006 正答ウ (複数企業に提供・使用料) と整合 | analogy (動画配信) OK、hook (S = Software、「使う」だけ) は総表の「業務データの入力」より狭い (前段 LOW) → L8 | OK | L8, L13 |
| 3 | PaaS | mix p0: SaaS = 完成アプリを使う / PaaS = 自社アプリを載せる基盤を借りる、アプリを用意するのが事業者か利用者か (2017h29a-q011 ウ・2015h27a-q005 イの誤答肢と対応するが両側肯定定義 = D-209 免除、§2-2) OK。detail (OS・ミドルウェア・サーバを事業者、利用者はその上で自社アプリ) は 2017h29a-q011 ウの内容と一致 | 2 文 88 字。analogy (貸しキッチン) / hook (プラットホーム) OK | hook_zh「和车站「站台」是同一个词」は中国語では 平台 ≠ 站台 で通じにくい (loc LOW 未反映) → L3 | L3, L8 |
| 4 | IaaS | mix p0 (qid なし): PaaS は OS・ミドルウェアまで、IaaS はハードウェア資源まで事業者 → 2017h29a-q011 イ (= IaaS の説明) と一致。図 table 3 層 × 3 モデル (事業者 / 利用者) は各 one・pairs[1] と一致。detail「OS から上を自分で導入して管理、運用の手間が利用者に多く残る」OK | analogy は u03 ハウジング像に寄る → L2。PaaS/IaaS の境 (OS の管理) が図 key 行・detail・mix・pairs[1].rows[1] の 4 箇所 → L9 | OK | L2, L9 |
| 5 | DaaS | 考点・quiz なし (freq 0、v1 の quiz 2011h23a-q005 はホスティング / ハウジング / SaaS の組合せ題で DaaS を問わないため外したのは妥当)。one / detail (処理と保存はサーバ側、端末は表示と操作送信、紛失時の漏えいを抑えやすい、別端末から同じ環境) は標準的事実で正しく、引用題との矛盾なし | analogy (遠くの書斎を窓越しに使う) / hook OK。key_points[2] は detail の言い直し (前段 LOW、まとめ欄で許容) | detail_zh / key_points_zh「抑制…信息泄露」は語の結びつきがやや不自然 (loc LOW) → L12 | L12 |

**単元レベル**: goals 3・overview_cols 2 (事業者が用意する範囲 / 利用者が受け持つこと)・overview_rows 5・pairs 2 組 (SaaS/PaaS 3 行 key 1、PaaS/IaaS 3 行 key 1)・key_points 3・summary (記法除去版と一致)・challenge_questions 5 (2021r03-q005 / 2015h27h-q020 / 2009h21h-q006 / 2017h29a-q011 / 2015h27a-q005、全て本文で解ける)。goals[0] / overview_rows[0] / key_points[0] は M1 の範囲。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 13 (うち 建議修 5)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 (before → after) |
|---|---|---|---|---|
| M1 | **MEDIUM** (観点 7 欄同士 / 単元間の不整合、裏付けのない排他) | 下記 6 欄 × 三語 (+ 派生 `summary.key_points_*[0]`, `overview.intro_*`) | クラウド全体を「自社で持たない・事業者所有」に限り、オンプレミスとの境を設備の持ち主に置く。同批 u02 の プライベートクラウド (自社データセンターに構築する場合もある / 自社施設・自社運用でもプライベートクラウドと呼ばれる) と食い違う (§2-3)。u02 attempt 1 で MEDIUM とされた型と同じ。引用題の正答は変わらない | 下の M1 修正表 |
| L1 | LOW **建議修** | `pairs[1].rows[0].a_jp/zh/en` | 2017h29a-q011 ウ (誤答肢) の「ハードウェア機能に加えて，OS や」と骨組みが近い (ed 0.48 / Dice 0.53)。短いセルで標準的内容だが、総表 `overview_rows[2].extra_jp[0]`「ハードウェアと OS などの実行基盤」と同じ言い方に揃えれば近似が消える | jp「ハードウェアに加えて OS・ミドルウェア」→「ハードウェアと OS・ミドルウェア」/ zh「硬件之外还有操作系统、中间件」→「硬件以及操作系统、中间件」/ en "Hardware plus the OS and middleware" → "Hardware, the OS and middleware" |
| L2 | LOW **建議修** (型 8 の近傍) | `terms[3].analogy_jp/zh/en` | 「電気と水道の引かれた空き地を借り、建物は自分で建てる」は、場所と電気・水道 (≒ 電源・回線) を借り上物を持ち込む像で、u03 ハウジングサービス (設置場所と設備環境を借りる) に重なる。IaaS では「サーバ・ストレージ・回線 = 事業者」(図・one)。引用・quiz 題で誤答を選ばせる場面は無い (2015h27h-q020 / 2016h28a-q022 のハウジングは IaaS と比較されない) ので LOW | jp「電気と水道の引かれた空き地だけを借り、建物は自分で建てるようなもの。」→「柱と壁だけが仕上がった建物を借り、内装や家具は自分でそろえるようなもの。」/ zh「就像只租一块通了水电的空地，房子由自己来盖。」→「就像租下一栋只完成了梁柱和墙壁的房子，内部装修和家具由自己置办。」/ en "It is like renting a bare plot of land with power and water hooked up, and putting up the building yourself." → "It is like renting a building where only the frame and walls are finished, and fitting out the interior and furniture yourself." |
| L3 | LOW **建議修** | `terms[2].hook_zh` (+ 派生 `summary.memory_hooks_zh[2]`) | 中国語では 平台 と 站台 は別語で、「同一个词」は英語の platform としての話だと補わないと通じない (loc-review LOW、未反映) | zh「P 是 Platform，和车站「站台」是同一个词。」→「P 是 Platform，在英语里和车站的「站台」（platform）是同一个词。」 |
| L4 | LOW **建議修** (型 5/6 の軽微形) | `terms[0].detail_en` | jp「初期費用を抑えやすい」(傾向) を en が "keeps … low" と言い切る (loc-review LOW、未反映) | en "which keeps the up-front cost of buying equipment low." → "which makes it easier to keep the up-front cost of buying equipment low." |
| L5 | LOW | `terms[0].detail_jp` 3 文目 / `terms[0].points[2].text_jp` 前半 | 2019h31h-q030 (分類型) 題文とのオンプレミス定義の近似 (ed 0.39 / Dice 0.61)。標準定義の言い換えで語順・語を変えており D-198 の定義例外内。u02 / u03 も同じ定義 | 記録のみ |
| L6 | LOW | `terms[0].points[1].qids[1]` | 2015h27h-q020 が問うのは「クラウド環境で提供されるサービス = SaaS」で、考点の「置き場所を意識しない / 必要時確保・増減」は題文の前提としてのみ支持 (前段 LOW ×2)。正答とは矛盾しない | 記録のみ (qid を SaaS の quiz に残しているので、外すなら points[1].qids から 1 件削るだけ) |
| L7 | LOW | `terms[0].points[0]`, `points[1]` | one の言い直し (D-203 §9)。また単元は「サービスモデル」を層の型として定義し、2018h30a-q009 正答はクラウド自体を「サービスモデル」と呼ぶ — 考点はこの語を避けて矛盾はない (前段 LOW) | 記録のみ |
| L8 | LOW | `terms[1].hook_*`, `terms[1].detail_jp`, `terms[2].detail_jp` | SaaS hook「使うことだけ」は総表の「業務データの入力」より狭い (使うに含むと読め誤りでない)。SaaS detail の要素順は 2009h21h-q006 ウと、PaaS detail の {OS・DBMS・サーバ} は 2015h27a-q005 イと重なるが標準的特徴の一般表現 (前段 LOW) | 記録のみ |
| L9 | LOW | `terms[3].fig` key 行 / `terms[3].detail_*` / `terms[3].points[0]` / `pairs[1].rows[0..1]` | PaaS / IaaS の境 (OS を誰が管理するか) が 4 箇所 (書き方 8: pairs + mix の 2 箇所まで) | 記録のみ (図は層表で単元の骨格、detail は IaaS の定義の中核) |
| L10 | LOW | `terms[0].fig.data.a`, `goals_jp[0]` | オンプレミスが detail で定義される前に図見出し・goals に出る (前段 LOW)。図の行から推測可 | 記録のみ |
| L11 | LOW **建議修** | `pairs[0].rows[2].a_zh` | 「业务负责人员」は責任者寄りに読める。原文「業務の担当者」= 実務を行う人 (loc-review LOW、未反映) | zh「业务负责人员」→「业务人员」 |
| L12 | LOW | `terms[0].fig.data.rows[2].a.zh`、`rows[3].label.zh`、`terms[4].detail_zh` / `key_points_zh[2]`、`terms[2].detail_en` | loc-review の現地化 LOW (直訳調「一直发生」/「增减能力时」/「抑制…信息泄露」/ en の同格挿入句) が未反映。意味の誤りはない | 記録のみ (任意: loc-review の fix_jp どおり) |
| L13 | LOW | `terms[1].points[0].text_jp` | 「自前で…導入もしない」の 導入 (= インストール) と、2015h27a-q005 題文の「購買システムの導入に当たり」(= 採用) の 導入 が衝突して見える。「自前で」が付き en "install" で意味は明確 | 記録のみ |

### M1 修正表 (string replacement、構造変更なし。太字の数は各欄で不変)

| 欄 | before | after |
|---|---|---|
| `terms[0].one_jp` | **クラウドコンピューティング**は、サーバやソフトウェアなどの IT 資源を自社で持たず、事業者がネットワークの向こう側に用意したものを**必要なときに必要な量だけ**使う利用形態である。 | **クラウドコンピューティング**は、サーバやソフトウェアなどの IT 資源を、ネットワークの向こう側 (多くは事業者の設備) に用意されたものから**必要なときに必要な量だけ**使う利用形態である。 |
| `terms[0].one_zh` | **云计算**[[jp:クラウドコンピューティング]]是一种使用形态：企业不自己持有服务器、软件等 IT 资源，而是使用服务商在网络另一端准备好的资源，**需要时按需取用**。 | **云计算**[[jp:クラウドコンピューティング]]是一种使用形态：服务器、软件等 IT 资源准备在网络另一端（多数是服务商的设施），使用者**在需要时只取用所需的量**。 |
| `terms[0].one_en` | **Cloud computing** [[jp:クラウドコンピューティング]] is a way of using IT resources such as servers and software without owning them, drawing on what a provider has set up across the network **only when you need it and only as much as you need**. | **Cloud computing** [[jp:クラウドコンピューティング]] is a way of using IT resources such as servers and software that are set up across the network (usually in a provider's facilities), drawing on them **only when you need them and only as much as you need**. |
| `terms[0].points[2].text_jp` | **オンプレミス**は自社の設備に情報システムを置いて自ら運用する形態であり、事業者の資源を借りるクラウドコンピューティングとは設備の持ち主で分かれる。 | **オンプレミス**は自社の設備に情報システムを置いて自ら運用する形態であり、事業者の資源を借りて使う形態とは設備の持ち主で分かれる。 |
| `terms[0].points[2].text_zh` | **本地部署**[[jp:オンプレミス]]是把信息系统放在本公司设施里自行运营的形态；它和租用服务商资源的云计算，区别在于设施归谁所有。 | **本地部署**[[jp:オンプレミス]]是把信息系统放在本公司设施里自行运营的形态；它和租用服务商资源的使用形态，区别在于设施归谁所有。 |
| `terms[0].points[2].text_en` | **On-premises** [[jp:オンプレミス]] means keeping information systems in your own facilities and running them yourself; what separates it from cloud computing, which rents a provider's resources, is who owns the equipment. | **On-premises** [[jp:オンプレミス]] means keeping information systems in your own facilities and running them yourself; what separates it from renting a provider's resources is who owns the equipment. |
| `terms[0].fig.data.b.jp` | クラウドコンピューティング | 事業者のクラウドを借りる |
| `terms[0].fig.data.b.zh` | 云计算 | 租用服务商的云 |
| `terms[0].fig.data.b.en` | Cloud computing | Renting a provider's cloud |
| `key_points_jp[0]` | **クラウドコンピューティング**では IT 資源を自社で持たずに事業者から借り、使う量を後から増減できる。 | **クラウドコンピューティング**では IT 資源をネットワーク越しに使い、事業者から借りる場合は機器を自社で持たずに済み、使う量も後から増減できる。 |
| `key_points_zh[0]` | **云计算**[[jp:クラウドコンピューティング]]不自己持有 IT 资源，而是向服务商租用，用量之后还能增减。 | **云计算**[[jp:クラウドコンピューティング]]通过网络使用 IT 资源；向服务商租用时不必自己持有设备，用量之后也能增减。 |
| `key_points_en[0]` | With **cloud computing** [[jp:クラウドコンピューティング]], you rent IT resources from a provider instead of owning them, and can change the amount you use later. | With **cloud computing** [[jp:クラウドコンピューティング]], you use IT resources over the network; when you rent them from a provider you need not own the equipment, and you can change the amount you use later. |
| `overview_rows[0].one_line_jp` | IT 資源を事業者から必要な分だけ借りて使う利用形態 | IT 資源をネットワーク越しに必要な分だけ使う利用形態 |
| `overview_rows[0].one_line_zh` | 按需向服务商租用 IT 资源的使用形态 | 通过网络按需使用 IT 资源的使用形态 |
| `overview_rows[0].one_line_en` | A way of renting only the IT resources you need from a provider | A way of using only the IT resources you need over the network |
| `goals_jp[0]` | **クラウドコンピューティング**と**オンプレミス**を、資源の持ち主と料金の払い方で見分けられる。 | 事業者から借りる**クラウドコンピューティング**と**オンプレミス**を、資源の持ち主と料金の払い方で見分けられる。 |
| `goals_zh[0]` | 能根据资源归谁所有、费用怎么付，分清**云计算**[[jp:クラウドコンピューティング]]和**本地部署**[[jp:オンプレミス]]。 | 能根据资源归谁所有、费用怎么付，分清向服务商租用的**云计算**[[jp:クラウドコンピューティング]]和**本地部署**[[jp:オンプレミス]]。 |
| `goals_en[0]` | Tell **cloud computing** [[jp:クラウドコンピューティング]] and **on-premises** [[jp:オンプレミス]] apart by who owns the resources and how they are paid for. | Tell **cloud computing** [[jp:クラウドコンピューティング]] rented from a provider and **on-premises** [[jp:オンプレミス]] apart by who owns the resources and how they are paid for. |

派生 (`definition_* / summary.key_points_*[0] / overview.intro_*`) は記法除去で自動追従。修正後も 2018h30a-q009 (事業者が資源を提供するサービスモデル) / 2021r03-q005 / 2019h31h-q030 の正答と整合し、u02 の パブリッククラウド × オンプレミス 比較図 (設備を用意し管理する者 = 自社 / クラウド事業者) と同じ範囲取りになる。補丁後は validate / parity の再実行が要る。

**対比の出現欄 (書き方 8)**: ① SaaS / PaaS (アプリを用意するのは誰か): `pairs[0].rows[0]`、`terms[2].points[0]` → 2 箇所で許容 (総表は D-195 §3 の構造)。② PaaS / IaaS (OS の管理): 4 箇所 → L9。③ オンプレミス / クラウド (持ち主): 図 + `points[2]` + goals → M1 で範囲を直す (箇所数は許容)。

**範囲外の観察**:
- O1 `challenge_questions` は v1 (2012h24h-q026 / 2015h27h-q020 / 2016h28a-q022 / 2016h28h-q006 / 2018h30a-q009) から差し替え。外れた 2012h24h-q026 (ASP 題) は u03 が引用、2016h28h-q006 (SI 題) は u03 が引用、2016h28a-q022 (ハウジング題) は u01〜u03 の現行本文に引用なし (u03 ハウジングの one で解ける)。u01 の新 challenge 5 題は全て u01 の見出し語を問う題で妥当。
- O2 `unit_summary_*` は v1 と同文 (未改稿、範囲外)。

確認済みで問題なし: 前段 MEDIUM 2 件の解消 (§2-1、zh / en の回帰なし)、限定条件 (考点 5 件の引用題に落ちなし)、§9 禁止句 (0)、framing 0/0/0、D-197 (validate 0)、D-200 (≤2 文・≤88 字)、D-205 (改訂文書の構成要素の数・名前の記述なし)、D-210 (法令・規格改正の絡む題なし)、型 10 (閉じた列挙なし)、図の写し (validate 0、独立照合は見出し語の偽陽性のみ)、`[[jp:]]` 原語 8 種実在、one の見出し語併記 5/5、zh 訳語表 (云计算 / 本地部署)、図種 (compare static / table static / 図なし ×3 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **13** (建議修 5: L1 / L2 / L3 / L4 / L11、記録のみ 8: L5〜L10 / L12 / L13) |

## 5. 判定

**FAIL → 補丁 (B3) で解消可** (D-199: MEDIUM 1)。全 5 用語・考点 6 件 (qid 付き 5 件)・引用 6 題 + quiz / challenge のみの 1 題で、考点の主張は正答と一致し、誤答肢を支持する記述も引用題の限定条件の落ちも無い。前段 jp-review の MEDIUM 2 件は回帰なく解消。M1 はクラウドを事業者所有に限る記述が同批 u02 のプライベートクラウドと食い違う単元間不整合で、上表の string replacement (6 欄 × 三語) で直る。補丁適用後に validate / parity を再実行し、M1 の 6 欄を再確認すれば PASS 相当。LOW 建議修 5 件 (L1〜L4, L11) は同じ補丁で修正推奨、残りはバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-06-20-u01
✓ strategy-06-20-u01 unit: 0 issues (data/ip/textbook/units/strategy-06-20-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-06-20-u01
✓ strategy-06-20-u01 parity: 23 locations, 0 diff
EXIT=0
```
