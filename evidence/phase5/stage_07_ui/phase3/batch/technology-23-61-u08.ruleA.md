# Rule A 全数抽検 — technology-23-61-u08 (パスワード・認証を狙う攻撃)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成、照合スクリプトは scratchpad)。
- **Date**: 2026-11-05 (S142 第 15 批 b15、attempt 2 = a1 r1 を seed にした `b15-u08-a2` の merge 結果)、repo HEAD `ce79887a` + 作業ツリー (単元 JSON は未コミットの書き直し版、sha256 先頭 `1a52e5a6945cfc3c`)。
- **対象**: `data/ip/textbook/units/technology-23-61-u08.json` (textbook-unit-v2)、用語 **4 / 4 = 全数** (辞書攻撃 / ブルートフォース攻撃 / パスワードリスト攻撃 / クレデンシャルスタッフィング) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し、(iii) 具体例・選択肢の組の流用、b14 追補: 穴埋め題は正答を埋めた題文とも照合、選択肢の列挙・打ち消しだけの考点は不可) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 (見出し語 `[[jp:]]`、書き方 7・8・9)、D-203 (§6 / §9 / 観点 8 = low、観点 7 = medium [事実誤りなら high]、観点 9 限定条件落ち = high)、D-204 (比喩・フックが考点・detail の否定する像を運ぶ = 観点 7 medium、引用題の支持しない限定 = medium)、D-205 (改訂される文書の構成数・名称には版か「例えば」)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `.planning/v2/technology-23-61-u08/v1-original.json` (用語 4 語・`term_zh`・`term_en`・`title_*`・`unit_summary_*` とも v1 と一致、スクリプト確認)。参照: IPA シラバス ver6.5 (4) 攻撃手法 用語例「辞書攻撃，総当たり（ブルートフォース）攻撃，パスワードリスト攻撃（クレデンシャルスタッフィング）」。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・引用題の支持しない限定 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 4 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。`terms[2]` (パスワードリスト攻撃) は `hook_*` キー自体が無く `memory_hook_*` = ""、`summary.memory_hooks_*` は 3 件 (辞書 / ブルートフォース / クレデンシャル)。hook 無しは許容形 (validateV2 は「三語とも有るか、全て無いか」だけを課し、reader.ts は空・欠如を null 表示; v2 全 388 用語中 79 用語が同形)。`terms[3].analogy_*` = "" も D-203 (b) の許容形。
2. **考点 × 引用題 (考点 全 7 件 = exam 6 + mix 1、qid 付き 6 件、引用 qid 延べ 8 件 = 異なり 6 題)**: `data/ip/quiz/questions.json` から各題の題文・選択肢・`correct_answer` を再読 (全題 topic `technology-23-61`; OCR 損傷のある題は translations の `stem_jp_clean` で判断 — 2019r01a-q080 / 2016h28a-q083 / 2017h29h-q081 / 2017h29h-q095 / 2022r04-q095 / 2025r07-q073。2011h23tokubetsu-q075 / 2014h26h-q051 は clean 無し、raw に損傷なし)。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化・限定をせず、題の前提を外していないこと、**引用題の選択肢を並べ直していないか / 誤答肢を打ち消すだけでないか (D-198 (iii))** を 1 件ずつ確認 (§2)。計算: 2014h26h-q051 (10 種・4→6 桁 → 10² = 100 倍、正答ウ) / 2019r01a-q080 (26 種・4→6 文字 → 26² = 676 倍、正答エ) を再計算し一致。図の表 (36 種: 36 / 1,296 / 46,656、1 桁ごと 36 倍) も再計算一致 (英小文字 26 + 数字 10 = 36)。
3. **quiz / challenge_questions** (quiz 計 8 枠 + challenge 5 題、うち本文で未引用 1 題 = 2025r07-q073): 2025r07-q073 は記述 a・b・c と攻撃名の組合せ題 (正答ウ = a ゼロデイ / b DDoS / c ブルートフォース)。c (理論上あり得るパスワードのパターンを順次試して正しいパスワードを見つけ侵入する) にブルートフォース攻撃を当てた読みは、`terms[1].one_jp` (使える文字のあらゆる組合せを順に試す総当たり) と `overview_rows[1]`・`pairs[0].rows[0].b` で解ける。ゼロデイ・DDoS は本単元に記述が無く、誤って支持する記述も無い (他単元の範囲)。challenge の他 4 題は §2 の引用題。
4. **穴埋め題の照合 (b14 追補)**: 引用 6 題 + challenge 1 題に **穴埋め題は無い** (知識の択一 4 題・計算 2 題・組合せ 1 題)。代わりに組合せ題 2025r07-q073 で「c の記述 + 正答の名称 (ブルートフォース攻撃)」を一文として、`terms[1].one_jp`・`terms[1].points[0..1]`・`overview_rows[1].one_line_jp`・`pairs[0].rows[0].b_jp` と照合 → 12 字窓 0、`terms[1].one_jp` との Dice 0.28 / ed 0.87。考点は c の記述をなぞらず、選択肢の組 (a・b の攻撃) も使わない。
5. **D-198 写し**: validate の copy guard (本文 + 図ラベル・caption・総表・対比表) = 0 件。独立照合として単元の JP 文字列 84 本 (派生フィールド・summary・overview.intro 除く) を topic 内全 89 題の題文 (stem_jp_clean 優先) + 選択肢と 12 字連続照合 (句読点・記号・空白除去)。
   - **カタカナ 4 字以上と英数を □ に遮蔽** (遮蔽後の実字 6 未満の窓は除外): **0 件**。
   - **遮蔽なし**: **3 件**。
     - `terms[1].one_jp` ↔ 2016h28h-q063 誤答ウ: 一致部「…してパスワードを割り出す」は動詞句の定型 (パスワード + 割り出す) で、one の主語 (使える文字のあらゆる組合せ) は q063 ウ (辞書のデータ) と別物 → 偽陽性。
     - `terms[2].points[0].text_jp` ↔ 2017h29h-q095 題文: 一致部は見出し語「パスワードリスト攻撃」+「の被」→ 用語名で偽陽性。
     - **`terms[2].fig.data.nodes[0].label.jp`「サイト X から ID とパスワードが漏えい」↔ 2017h29h-q095 題文の第 1 節**: 節同士で Dice 0.77 / ed 0.30 (題文 1 文全体とは Dice 0.37 / ed 0.76)。共有するのは「(サイト) から ID とパスワードが漏えい」で、パスワードリスト攻撃の定義の前提 (どこかで組が漏れる) を言う最小の言い方。題の特徴的な枠組み (その利用者が別サイトで被害に遭った → 利用者側の問題点を問う) と選択肢の組 (暗号化なし通信 / 同じ組 / 文字種少 / 短い) は図に再現されず、4 ノードの流れ (漏えい → 一覧化 → 別サイトで入力 → 使い回した人だけ侵入) は定義の手順化で題の判断項目ではない。step 4 caption と q095 正答イ は Dice 0.13 / ed 0.93。校正例 (HIGH: 文単位 ed 0.14 / Dice 0.52) より ed が大きく、写しではないと判断。ただし遮蔽なし 12 字窓の一致そのものは解消しておくのが安全 → **L1 建議修** (新文の 12 字照合 0)。
   - **近似照合** (文単位 Dice ≥ 0.40、19 件): 上位は見出し語「パスワードリスト攻撃」を含む短い選択肢 (選択肢 = 攻撃名だけ) との一致、`title_jp` (v1 不変) など、全て用語名の共有。最接近の本文は `overview_rows[1].one_line_jp` ↔ 2022r04-q091 誤答ア (総当たりの記述; Dice 0.46 / ed 0.73) と `terms[1].one_jp` ↔ 同ア (0.43 / 0.82) = 総当たりの標準定義の語彙 (あらゆる・文字の組合せ・総当たり) で、q091 は SE を問う題 (本単元未引用)、校正例から遠い → 写しではない。`terms[0].one_jp` ↔ 2016h28h-q063 誤答ウ (辞書攻撃の記述) は 0.35 / 0.70 = 辞書攻撃の標準定義。
   - **カタカナの多い文の目視**: `terms[3].one/hook`、`overview_rows[3]`、`terms[1].points[1]`・`terms[2].points[1]` (アカウントロック)、`pairs[1].rows[2]` を目視 → 題文・選択肢の言い回しの流用なし。
   - **(iii) 具体例・選択肢の組の流用**: 比喩 (植木鉢の下・郵便受けの裏を見て回る空き巣 / 3 桁ダイヤル錠 000〜999 / 家・車・ロッカーを 1 本の鍵) はいずれも題に無い場面。図の表は 36 種で、引用題の 10 種・26 種、4→6 桁の数値を使わない。考点ごとの判定は §2 (境界 2 件 = L4・L5、L10)。
6. **D-195**: 結論先行 (one = 1 文 × 4、太字あり)、展開 2〜3 文 (2/3/2/2 文)、比喩・フックが定義の言い換えでないこと (辞書 hook =「辞書」の語義の取り違え防止、ブルートフォース hook = 語源、クレデンシャル hook = 語源; 比喩は別の場面)、定義前使用 (総当たり = ブルートフォース one で太字定義、アカウントロック = ブルートフォース detail で定義してから考点、キーロガー = 考点内の同格説明、認証情報 = クレデンシャル one の括弧注、漏えい = パスワードリスト one で太字; 辞書攻撃の mix 考点でブルートフォース攻撃が定義前に出るが同文中で中身を言う → L12)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `overview.freq_badge`「頻出」と `source_figures[0].figure_description`「選択肢表」(本文外の図メタ) のみ、本文 0。zh / en 相当語 (必须 / 一定 / 重要 / 考试 / 常考 / 记住 / must / exam / always / important / never / every) → zh「一定次数」×4 (= 一定回数、派生含む)、en "every combination" 系 ×7 と "never match"・"Strings … never match" (辞書 detail の「当たらない」) のみで全て通常の用法。図の型 (ブルートフォース = static table、パスワードリスト攻撃 = flow steps 4、辞書・クレデンシャル = 図なし; 全て登録内)、pair 配置 (辞書→ブルートフォースはブルートフォースの後、ブルートフォース→パスワードリストはパスワードリストの後、各組 key 行あり)。
7. **D-200**: 考点数 2/2/2/1 (≤3 ✓)、各 JP 文数 1・字数 48〜74 (≤100 ✓、最大はクレデンシャル `points[0]` の 74 字)。**framing 件数** (validateV2 `pointFraming` を全考点に適用、tsx で実行): jp 0 / zh 0 / en 0 (上限 2)。
8. **D-202 / D-203 / D-204 単元全体点検**: 書き方 7 (欄同士の「〜だけ」「〜ではない」の照合): 辞書攻撃の範囲は one (単語や文字列)・detail (当たりやすい候補だけ、一覧に無い文字列は当たらない)・analogy (よく隠される場所だけ、それ以外は探さない)・`pairs[0].rows[0].a`「単語の一覧だけ」・`rows[2].a`「一覧に無い文字列」で同方向 (「単語」と「単語や文字列」の幅の差 = L8)。ブルートフォースの「時間さえかければいつかは」は detail のみで、アカウントロックの考点 (途中で打ち切れる) と矛盾しない (前者は原理、後者は対策)。アカウントロックの範囲: `terms[1].points[1]`「1 つの ID に対する大量の試行」、`terms[2].points[1]`「ID ごとに少ない回数」、`pairs[1].rows[1]`「1 つの ID への失敗」で全て ID 単位 → 一致。漏えい元の範囲: パスワードリスト one / detail / 図 (管理の不備**など**) / overview / `pairs[1].rows[0].b` / クレデンシャル one・detail・hook・考点 = 全て「漏えい / 漏れた」で入手方法を限らない (§4 の a1 r2 MEDIUM 解消)。比喩・hook (D-204): 辞書 analogy は一覧の外を探さない像で detail・pairs と一致 (§4 の a1 r1 MEDIUM 解消)、ブルートフォースのダイヤル錠は全組合せ、パスワードリストの 1 本の鍵は使い回し → 漏えい 1 回で全部、で否定内容を運ぶものは無い (像の漏えい主体のずれ = L9)。書き方 8 → §3 末尾の列挙。書き方 9 → §2 表に考点ごとに記載、落ち 0。§6 → 指摘なし。§9 言い直し → L4・L7。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 8 種 (総当たり / 辞書攻撃 / キーロガー / ブルートフォース攻撃 / アカウントロック / パスワードリスト攻撃 / 使い回す / クレデンシャルスタッフィング) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 4 用語に見出し語の `[[jp:]]` あり (D-202)、zh 訳語が `zh_terms.json` (unit 抜粋 `zh_terms.unit.json`) に従うこと (validate の zh-term warn 0 / jp-origin warn 0; 字典攻击 / 暴力破解攻击 / 密码列表攻击 / 撞库攻击 / 键盘记录器 / 泄露 一致)。訳の残 LOW (loc-review a2 の未適用分) → L2・L3・L11。
10. **D-205**: 改訂される文書の構成数・名称への言及なし (該当 0)。
11. **事実確認 (クレデンシャルスタッフィング = パスワードリスト攻撃)**: v1 は「パスワードリスト攻撃の自動化・大規模版」と位置づけていたが、v2 one は「同じ手口を指す」。シラバス ver6.5 が「パスワードリスト攻撃（クレデンシャルスタッフィング）」と同義の併記で挙げ、2022r04-q095 も漏えい認証情報を大量に流用する攻撃の名称の正答をパスワードリスト攻撃としているので v2 の同義扱いは正しい。v1 の「自動化・大量」の要素は detail「多数の組をツールで自動的に入力することが多く」に傾向として残り、one と矛盾しない。
12. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (4 / 4)

| # | 用語 | 事実 (考点 × 引用題、限定条件、D-198 (iii)) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 辞書攻撃 | OK — exam 1 / 1 題 + mix 1: points[0] 辞書攻撃 = 単語の一覧でパスワードを割り出す、キーロガー (利用者の PC でキー入力を記録して盗む) とは別物 (2011h23tokubetsu-q075 正答イ = キーロガーの説明; 辞書攻撃は誤答ウの内容)。キーロガー側は正答と一致、辞書攻撃側は誤答ウを「キーロガーではない」と正しく位置づけ、誤答を支持しない。**D-198 (iii) 境界**: 選択肢を列挙・打ち消すだけではなく、両用語を正の定義で示す混同注意型 (u02 L4「盗聴 ≠ バックドア」と同型) → L4 (記録のみ)。mix: 辞書攻撃は候補を使われやすい語に絞り、ブルートフォース攻撃は絞らない — pairs[0].rows[0] と一致。detail「一覧に載っていない文字列は当たらない」「ランダムな文字列が対策」は正しい | OK (図なし = 定義型) | detail_zh の言い切り L11 | L4, L8, L11, L12 |
| 2 | ブルートフォース攻撃 | OK — exam 2 / 4 題: points[0] n 種類なら 1 桁で n 倍・2 桁で n² 倍 (2014h26h-q051 正答ウ 100 倍 / 2019r01a-q080 正答エ 676 倍、再計算一致; 限定条件「使える文字が n 種類なら」「最大の試行回数」保持、q080 の「文字数」は桁数と同義)。「2 桁増える」は両題の増分 (4→6) の一般化 → L10 (a1 r1 low #6 の継続、記録のみ) / points[1] アカウントロックはブルートフォースに有効、1 つの ID への大量試行を打ち切る (2016h28a-q083 正答ウ 総当たり / 2017h29h-q081 正答エ; 両題の前提「ある (同じ) ID に対して」を「1 つの ID に対する」で保持、誤答 DoS / SQLi / フィッシング / ゼロデイ / BOF を支持しない)。detail の n^k は正しいが zh / en の言い方が n^(k+1) とも読める → L2。表 (36 種) 再計算一致 | OK (table static、登録内) | detail_zh/en、key_points_en[1] L2 | L2, L10 |
| 3 | パスワードリスト攻撃 | OK — exam 2 / 2 題: points[0] 被害の原因は複数サイトでの同じ ID・パスワードの使い回し (2017h29h-q095 正答イ; 題の前提 [あるサイトから漏えい → 別サイトで被害] は one・図が担う。a2 r2 low の「短さ・文字種の少なさではない」= 誤答ウ・エの打ち消しは削除済み) / points[1] アカウントロックは、漏えいした組を ID ごとに少ない回数だけ試すこの攻撃には効きにくい (2017h29h-q081: パスワードリスト攻撃は誤答イ)。**限定・(iii) の判断**: 「ID ごとに少ない回数」は題に無い書き手の補足だが、主張の範囲を狭める限定ではなく、正答がブルートフォースで誤答イが劣る理由 (失敗が ID ごとに閾値に届かない) を説明する標準的な仕組みで、q081 の題意 (同じ ID への連続誤りで止める) と同じ ID 単位の見方 → 支持しない限定 (MEDIUM) には当たらない。誤答イを打ち消すだけでなく仕組みを与える → L5 (記録のみ)。図 flow 4 段 (漏えい → 一覧 → 別サイトで入力 → 使い回した人だけ侵入) は one・detail と一致。node[0] ラベルの 12 字窓 (遮蔽なし) → L1 | OK (flow steps 4、登録内) | points[1].text_zh L11、key_points_en[2] L3、overview_rows[2].one_line_en L11 | L1, L3, L5, L6, L9 |
| 4 | クレデンシャルスタッフィング | OK — exam 1 / 2 題: points[0] クレデンシャルスタッフィングとパスワードリスト攻撃はどちらも他所で漏えいした組を流用して標的サイトに入り込む攻撃を指す (2022r04-q095 正答ウ = パスワードリスト攻撃; 題文の入手方法「盗み出すなど」の例示を「漏えいした」で限らず保持 [a1 r2 MEDIUM 解消]、「別のサイトから」「流用」「標的サイトに侵入」保持; 「大量の」は考点に無いが detail「多数の組をツールで」が担い、量は名称判別の条件ではないので落ちには当たらない)。2017h29h-q095 は呼び名の同一性を直接問わない弱い支持 (a2 r1 low #1) → L7。同義扱いの事実は §1-11 | OK (図なし) | OK | L7 |

**単元レベル**: goals 3 点・overview_cols 2 (試す材料 / 破られやすい相手)・overview_rows 4 行 (rows[2] と rows[3] の extra は同一 = 同じ手口の別名なので正しい)・pairs 2 組 (辞書 / ブルートフォース 4 行 key 1、ブルートフォース / パスワードリスト 3 行 key 1)・key_points 3・summary (key_points は本体と同文、memory_hooks 3 件は各 hook と一致)・challenge_questions 5 件 (§1-3)。`pairs[0].rows[2]` は見出し「試さずに残る候補」/ b「無い」で、a2 r2 low (見出しと b のかみ合い) は解消。事実誤りなし、三語一致 (訳の残 LOW は §3)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 12 (うち 建議修 3: L1〜L3)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[2](パスワードリスト攻撃).fig.data.nodes[0].label.jp` | 遮蔽なし 12 字窓が 2017h29h-q095 題文の第 1 節と一致 (節単位 Dice 0.77 / ed 0.30)。定義の前提を言う最小の言い方で題の枠組み・選択肢は再現しないため写しではない (§1-5) が、一致そのものを解消する。zh / en は一致の対象外で変更不要 | jp: `サイト X から ID とパスワードが漏えい` → `サイト X で ID とパスワードの組が漏えい` (新文の 12 字照合 0、遮蔽有無とも) |
| L2 | LOW **建議修** | `terms[1](ブルートフォース攻撃).detail_jp` / `detail_zh` / `detail_en` (派生 `explanation_*` 追従)、`key_points_en[1]` (+ `summary.key_points_en[1]`) | 「n を k 回掛けた値」/「n 自乘 k 次的值」/ "n multiplied by itself k times" / "multiplied by itself as many times as the password is long" は字義どおりだと n^(k+1) とも読める (loc-review a2 low #1、未適用)。目標 2 が「最大の試行回数を計算できる」なので式の言い方をそろえる。表 (36 × 36) で読み直せるため LOW | jp: `組合せの数は n を k 回掛けた値になり、` → `組合せの数は n を k 個掛け合わせた値になり、` / zh: `组合数是 n 自乘 k 次的值，` → `组合数是 n 的 k 次方（k 个 n 相乘），` / en: `the number of combinations is n multiplied by itself k times, so` → `the number of combinations is n to the power k (k factors of n multiplied together), so` / key_points_en[1]: `equals the number of usable characters multiplied by itself as many times as the password is long.` → `equals the number of usable characters raised to the power of the password's length.` |
| L3 | LOW **建議修** | `key_points_en[2]` (+ `summary.key_points_en[2]`) | JP「別のサイトと同じ組を使っていれば」(利用者が同じ組を使う) に対し en "if another site uses the same pair" はサイトが主語になりずれる (loc-review a2 low #2、未適用) | en: `However long and complex a password is, if another site uses the same pair, a single leak from that site is enough to let an intruder in.` → `However long and complex a password is, if the same pair is also used on another site, a single leak from that site is enough to let an intruder in.` |
| L4 | LOW | `terms[0](辞書攻撃).points[0].text_*` (qid 2011h23tokubetsu-q075) | D-198 (iii) 境界: 引用題はキーロガーを問い、辞書攻撃は誤答ウの内容としてだけ現れる。考点は両用語を正の定義で区別する混同注意型 (u02 L4 と同型) で、選択肢の列挙・誤答の打ち消しだけではない (12 字窓 0、正答イと Dice 0.26、誤答ウと 0.20)。辞書攻撃の半分は one の言い直し (§9) | 記録のみ (辞書攻撃の引用題はこの 1 題だけ [freq 1] で、qid を保った置換では改善できない) |
| L5 | LOW | `terms[2](パスワードリスト攻撃).points[1].text_*` (qid 2017h29h-q081) | パスワードリスト攻撃は q081 の誤答イ。「ID ごとに少ない回数だけ試す」は題に無い書き手の補足 (a2 r1 low #5) だが、主張の範囲を限る語ではなく誤答が劣る理由の標準的な説明 (§2 #3)。D-198 (iii) の「打ち消すだけ」にも当たらない | 記録のみ |
| L6 | LOW | 対比 ②③ の出現欄 (下の列挙) | 書き方 8: ② 推測で候補を作る / 漏えいした実在の組 が `pairs[1].rows[0]`(key)・`terms[2].detail_jp` 1 文目・`terms[3].detail_jp` 1 文目・`key_points_jp[0]`・`goals_jp[0]` に、③ アカウントロックが効く / 効きにくい が `terms[1].points[1]`・`terms[2].points[1]` (どちらも exam)・`pairs[1].rows[1..2]` に出る (a1・a2 の JP 審査とも low) | 記録のみ (③ の 2 考点はそれぞれ別の引用題の正答・誤答を支える; ② は単元の主軸で goals・key_points の総括は D-195 §3 の構造) |
| L7 | LOW | `terms[3](クレデンシャルスタッフィング).one_jp` / `detail_jp` 1 文目 / `points[0].text_jp` / `overview_rows[3].one_line_jp` (三語とも) | 「パスワードリスト攻撃と同じ手口 (漏えいした実在の組の流用)」が 4 欄でほぼ同じ言い方 (§9 言い直し、a2 r1 low #2)。考点の qid 2017h29h-q095 は呼び名の同一性を問わず支持が弱い (a2 r1 low #1) | 記録のみ (別名の用語は新しい事実が少なく、考点は 2022r04-q095 の正答を支える) |
| L8 | LOW | `pairs[0].rows[0].a_*` / `rows[3].a_*`、`overview_rows[0].extra_*[0..1]` | one「単語や文字列」・detail「よくある数字の並び」に対し、対比表・総表は「単語」に寄せた書き方で幅がやや狭い (a2 r1 low #6)。事実誤りではない | 記録のみ (任意: `pairs[0].rows[0].a_jp`「選ばれがちな単語の一覧だけ」→「選ばれがちな単語や文字列の一覧だけ」、zh「仅限常被选用的单词和字符串列表」、en "Only a list of commonly chosen words and strings") |
| L9 | LOW | `terms[2](パスワードリスト攻撃).analogy_*` | 像では利用者本人が鍵を落とすが、本文・図の漏えい元はサイト側 (管理の不備など)。使い回し → 1 回の漏えいで全部開く、という中核は一致し、どの欄も否定しない (a2 r1 low #8) → D-204 medium には当たらない | 記録のみ |
| L10 | LOW | `terms[1].points[0].text_*`、`overview_rows[1].extra_*[1]`・`pairs[0].rows[3].b_*`、`key_points_*[2]` | (iii) の記録: 考点の「2 桁増えると n² 倍」は両引用題の増分 (4→6) をなぞる一般化 (a1 r1 low #6)、文字種・答えの数値は使わない。総表・対比表の「短く文字の種類が少ない」と key_points[2]「長く複雑にしても」は 2017h29h-q095 の誤答ウ・エの要素に近いが、総当たりに弱いパスワードの標準的な性質で考点ではない | 記録のみ |
| L11 | LOW | `terms[2].points[1].text_zh`、`pairs[1].rows[1].a_zh`、`overview_rows[2].one_line_en`、`terms[0].detail_zh` | loc-review a2 の未適用 low: zh「通过连续出错来停用 ID」は「誤りを手段に止める」と読める / zh「大量持续」は据わりが悪い / en "leaked elsewhere on a different site" は on 句が leaked にかかり得る / zh「有时尝试几次就能攻破」「就能防范」は JP より言い切りが強い | 記録のみ (任意: zh `通过连续出错来停用 ID 的` → `在连续输错后停用 ID 的` / zh `大量持续` → `大量连续失败` / en `Tries ID–password pairs leaked elsewhere on a different site` → `Tries, on another site, ID–password pairs leaked elsewhere` / zh `所以有时尝试几次就能攻破` → `所以有时用较少的尝试次数就能攻破`) |
| L12 | LOW | `terms[0].points[1]` (mix)、`terms[1].detail_jp` 1 文目 | ブルートフォース攻撃が定義前 (次の用語) に mix 考点で出るが同文中で中身を言う (a2 r1 low #7)。対比 ① (絞る / 絞らない) は pairs[0].rows[0] + mix 考点の 2 箇所に加え、ブルートフォース detail 1 文目「候補を絞らないので」でも触れる (理由節としての短い言及) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 辞書 = 選ばれがちな語に絞る / ブルートフォース = 全組合せ: `pairs[0].rows[0]`(key)・`terms[0].points[1]`(mix)・`terms[1].detail` 1 文目の理由節 → L12 (`key_points[0]`・`goals[0]` は ①② を「候補を作って当てる」側にまとめる総括で ① の対比そのものは述べない)。② 推測で作る / 漏えいした実在の組: L6。③ アカウントロック: L6。④ 総当たりの回数 (n^k): `terms[1].detail`・`points[0]`・表・`key_points[1]` は同一事実の説明・図・総括で対比ではない。

**先行 attempt の指摘の解消確認**:

| 先行指摘 | 状態 | 根拠 |
|---|---|---|
| a1 r1 **MEDIUM** 観点 7 / D-204 `terms[0].analogy_jp` — よくある場所を「先に」見て、その後で家じゅうを調べる像 (= 最後は総当たりに移る) が detail・pairs の「一覧の外は当たらない」を否定 | **解消、退行なし** | before (journal 引用): 「家じゅうを調べる前に…よく隠される場所から先に見る」→ after: 「…植木鉢の下や郵便受けの裏など、よく隠される場所**だけ**を見て回り、**それ以外の場所は探さない**ようなもの。」zh「只翻…常藏钥匙的地方，其他地方一概不找」/ en "checks only the usual hiding spots … and ignores everywhere else" も同範囲。`detail_jp` 2 文目 (一覧に載っていない文字列は当たらない)・`pairs[0].rows[0].a`「…一覧だけ」・`rows[2].a`「一覧に無い文字列」(試さずに残る) と一致。hook (攻撃者が用意した単語帳) も「後で全部試す」を含まない。「先に / 前に / 後で / いずれ」系の語は辞書攻撃の全欄に無い (ブルートフォース detail の「いつかは」はブルートフォース側) |
| a1 r2 **MEDIUM** 観点 9 / 7 `terms[3].points[0]` — 入手方法を「盗まれた」に限る (2022r04-q095 は「盗み出すなど」)、`terms[2].hook_jp`・`terms[3].hook_jp` の「盗まれて / 盗んだ」も同じ限定 | **解消、退行なし** | `terms[3].points[0]`: 「他所から盗まれた ID とパスワードの組」→「他所で**漏えいした** ID とパスワードの組」(zh 泄露 / en leaked)。`terms[3].hook_jp`: 盗んだ → 「**漏えいした**認証情報をログイン欄に次々と詰め込む」(zh 泄露 / en leaked)。`terms[2].hook_*` は言い換えではなく**削除** (キー無し、`memory_hook_*` = ""、`summary.memory_hooks_*` は 3 件に)。全欄 grep: `盗` / `窃` / `steal|stole` のヒットは `terms[0].points[0]` のキーロガーの説明 (盗み出す / 窃取 / steals) の 3 語のみで、認証情報の入手方法を限る用例 0。one / detail / 図 caption 1 (管理の不備**など**) / overview / pairs も「漏えい / 漏れ」で、q095 の「盗み出すなど」(例示) と 2017h29h-q095 の「漏えい」の双方を含む範囲 |
| a1 r2 low `terms[2].points[0]` — 誤答 2 肢 (短さ・文字種の少なさ) の打ち消し | 解消 | 考点は「原因は使い回し」の 1 文 (50 字) のみ。同要素は総表・対比表・key_points に残る → L10 (考点ではない) |
| a1 r2 low `pairs[0].rows[2].label_jp` の見出しと b のかみ合い | 解消 | 見出し「試さずに残る候補」/ b「無い」 |
| a1 r2 low `terms[2].points[1]`「正しい組」 | 解消 | 「漏えいした組を ID ごとに少ない回数だけ試す」 |
| a2 r1 / loc-review a2 の low | 未適用 (いずれも low) | L2・L3 を建議修、他は L6〜L12 に記録 |

確認済みで問題なし: 限定条件 (考点 6 件の qid 付き全てで前提の落ち 0、§2)、§9 禁止句 grep (本文 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤74 字)、図の文字列の写し (validate 0、独立照合は L1 の 1 件のみ要対処・他は偽陽性)、穴埋め題 0 (組合せ題 2025r07-q073 で代替照合)、`[[jp:]]` 原語 (8 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (4/4)、zh 訳語表 (warn 0)、図種 (table static ×1 / flow steps ×1 / 図なし ×2 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en`・`title_*`・`unit_summary_*` の v1 不変量、D-205 該当 0、クレデンシャルスタッフィング = パスワードリスト攻撃 の同義扱い (シラバス ver6.5 と一致)、比喩・hook が考点・detail の否定する像を運ぶ例 0 (D-204)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **12** (建議修 3: L1〜L3 / 記録のみ 9: L4〜L12、うち L8・L11 は任意の修正案あり) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 4 用語・考点 7 件 (qid 付き 6 件)・引用 6 題 + 未引用の challenge 1 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。先行 attempt の MEDIUM 2 件 (辞書攻撃 analogy の「後で全部試す」像 / 入手方法を「盗まれた」に限る記述 [hook を含む]) は全て解消し、退行なし。LOW 建議修 3 件 (L1 図ノードラベルの 12 字窓、L2 n^k の言い方、L3 key_points_en[2] の主語) は補丁 (B3) で修正推奨、L4〜L12 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-61-u08
✓ technology-23-61-u08 unit: 0 issues (data/ip/textbook/units/technology-23-61-u08.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-61-u08
✓ technology-23-61-u08 parity: 22 locations, 0 diff
EXIT=0
```
