# Rule A 全数抽検 — technology-17-48-u01 (オープンソースソフトウェア(OSS)とライセンス)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b63)、repo HEAD `05c1955e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = run `b63-u01-a1` の merge 結果、`merged.json` と同一、sha256 先頭 `39a428d12655c2b9`)。
- **対象**: `data/ip/textbook/units/technology-17-48-u01.json` (textbook-unit-v2)、用語 **3 / 3 = 全数** (OSS / GPL / コピーレフト) + 単元レベル (goals / overview_cols・rows / pairs / key_points / overview.intro / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、Rule A 共通指示の既知失敗型 (1)〜(10)。比較: `v1-original.json`、`strategy-02-04-u03.json` (OSS / フリー / PDS, v2 済)。
- **一次資料 (考点が引用題を超える免許事実の確認)**: Open Source Definition (https://opensource.org/osd — 1 Free Redistribution「販売も無償配布も制限しない」、2 Source Code、3 Derived Works「改変・派生物を許し、同じ条件で配れること」、5 個人・団体の差別禁止、6 利用分野の差別禁止 [例: business, genetic research])、GNU 「What is Copyleft?」(https://www.gnu.org/licenses/copyleft.en.html — 再配布者は **変更の有無にかかわらず** 自由を引き継ぐ)、GNU GPL FAQ (https://www.gnu.org/licenses/gpl-faq.html — 改変版を公開する義務はない [私的利用]、公開するなら改変ソースを GPL で提供、コピーの販売は可、**バイナリを配るなら (改変の有無を問わず) 対応ソース全体も配る**)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 3 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (cols・rows・nodes label・steps caption) / quiz / inline_quiz` と単元レベル全フィールドを三語とも読んだ (OSS は hook なし、GPL は図なし)。
2. **考点 × 引用題 (考点 全 6 件 = exam 4 + mix 2、qid 付き 5 件、引用 qid 延べ 8 件 = 異なり 8 題)**: `questions.json` から各題の題文 (`stem_jp_clean` 優先)・選択肢・`correct_answer` を再読 (topic `technology-17-48` 全 25 題)。正答一致・誤答肢を支持しない・一般化 / 限定の過不足・限定条件保持を 1 件ずつ確認。引用題を超える免許事実は上記一次資料で確認。
3. **quiz / challenge_questions** (quiz 6 枠 = 異なり 5 題 [2009h21h-q055 / 2013h25a-q058 / 2019h31h-q067 / 2026r08-q073 / 2011h23tokubetsu-q074 / 2017h29h-q093]、challenge 5 題 [2023r05-q082 / 2024r06-q080 / 2025r07-q096 / 2018h30h-q078 / 2026r08-q097]) と、本文で未引用の残り topic 題 (2010h22a-q077 / 2015h27h-q057 / 2016h28h-q059 / 2017h29a-q064 / 2019r01a-q089 / 2020r02o-q096 / 2022r04-q063 / 2024r06-q097) を本文と照合 → 矛盾 0 (§2 下)。
4. **D-198 写し**: validate の copy guard = 0 件、`warn  choice-echo` 出力なし。独立照合: 単元 JP 文字列 68 本 (派生フィールド除く) × topic 25 題の題文 + 選択肢、12 字連続窓 (句読点・記号・空白・長音除去)、(a) カタカナ 4 字以上と英数を □ に遮蔽 (実字 6 未満の窓除外) → **0 件**、(b) 遮蔽なし → **2 件、全て偽陽性**: `terms[0].detail_jp` ↔ 2024r06-q080「…れているソフトウェアであ…」(一般的な文末の連なり)、`terms[0].fig.data.rows[1].cells[1].jp` ↔ 2019r01a-q089「Apache HTTP Server」(製品名)。(c) 1〜2 字置換の近似照合 (編集距離 1〜2): ヒットは「オープンソースソフトウェア」(見出し語の展開形)、「〜ているソフトウェアである」(一般文末)、製品名 (Android・FreeBSD・Apache HTTP Server・PostgreSQL) と、`key_points_jp[0]`「著作権は放棄され…」↔ 2026r08-q073 ア のみ。最後は 2015h27a-q065 **正答** エ (著作権は放棄されていない) の内容を正の定義で述べたもので、誤答肢の写しではない → 偽陽性。カタカナの多い文 (図の製品表・BSD/MIT の mix 考点) は目視でも題の語句列なし。
   - 図 `terms[0].fig.data.rows` (OS: Linux・Android・FreeBSD / Web サーバ: Apache HTTP Server / DBMS: MySQL・PostgreSQL / Web ブラウザ: Firefox / メール: Thunderbird) は分類型の題 (2013h25a-q058・2015h27h-q057・2018h30h-q078・2019h31h-q067・2022r04-q063・2024r06-q097・2016h28h-q059・2014h26h-q067 c) の正答を横断した標準的な代表例一覧。特定の題の列挙順は再現していない (2024r06-q097 は Android → FreeBSD → Linux、表は Linux → Android → FreeBSD; 用途列 4 つは 2013h25a-q058 の選択肢と重なるが表の行順 OS → Web サーバ → DBMS → ブラウザ は題の順 [DBMS → OS → Web サーバ → ブラウザ] と異なり、メールソフト行を加える)。写しではない (jp-review r2 の判定に同意)。確認題の答えが表に出る点は記録のみ (D-209 分類型の正答を一般の区分として述べる例外)。
5. **D-195**: one = 1 文 × 3 (太字あり)、detail 3/3/2 文、図の型 (OSS = static table、コピーレフト = flow steps 4、GPL = 図なし; 全て登録内)、pair 1 組 (GPL / コピーレフト、key 行 1、配置はコピーレフトの後)。定義前使用: ソースコード・ライセンス = OSS detail で定義、GNU = GPL detail と hook、派生物 = 「改変版」で統一 (r1 low の解消を確認、「派生」は本文に残らない)。BSD / MIT ライセンスは mix 考点で初出・説明は「改変版を別の条件で配ることを認める」のみ (L6)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → jp **0 件** (`freq_badge`「低頻」のみ)。zh / en 相当語 (必须 2・must 5・exam 5) は zh / en 本文の通常の義務表現と `points[].kind:"exam"` のキーで偽陽性。
6. **D-200**: 考点数 3/2/1 (≤3 ✓)、各 JP 文数 1〜2・字数 47〜89 (≤100 ✓、最大は GPL `points[1]` の 89 字)。**framing 件数** (`validateV2.pointFraming`、全考点を tsx で直接計測): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 / D-205 単元全体点検**: 書き方 7 (欄同士の整合) → **M1** (GPL detail の「改変したものを配るときは」とコピーレフト one の「改変して配るときにも」)。書き方 8 → L7。書き方 9 (限定条件) → §2 表、落ち 0。§6 (比喩・フック) → L1 / L3。D-205: 改訂される文書の構成数・名称の記述なし (OSD の基準数・GPL の版番号は本文に出ない; GPL の性質は v2 / v3 共通の範囲) → 該当なし。D-210: 引用題に法改正前提の題なし → 該当なし。
8. **三語**: zh・en が jp と同事実か、図ラベル・caption・表セル・対比行の三語一致、`[[jp:]]` 原語 6 種 (著作権 / ライセンス / ソースコード / コピーレフト / BSDライセンス / MITライセンス): 前 4 種は jp 本文に字どおり実在、後 2 種は jp 本文が「BSD ライセンス」「MIT ライセンス」(空白あり) で空白除去後に一致 (validate の jp-origin warn 0、L6 に記録)。one_zh / one_en の見出し語併記: OSS は見出し語の訳 `开源软件(OSS)` / `OSS (Open Source Software)` そのもの (v1_terms どおり、`[[jp:]]` 不要)、GPL は同綴り、コピーレフトは 3 語とも `[[jp:コピーレフト]]` あり。zh 訳語 `zh_terms.json` (OSS → 开源软件(OSS)、GPL → GPL、コピーレフト → Copyleft(著佐权)) に一致、validate B6 warn 0。`term_zh` / `term_en` は v1 と一致。
9. **既往指摘の解消確認 (journal `b63-u01-a1`)**: jp-review r1 MEDIUM 2 件 → (i) `terms[1].points[0]` の誤答肢 ウ 打ち消し: 現行文「…配布物にも元と同じ GPL を適用し、受け手が対応するソースコードを入手できるようにする。」は ウ の語句「改変部分のソースコード」「非公開としたまま」を含まず、主節は正答 エ (元と同じライセンスを適用) を正の形で述べる → **解消**。「対応するソースコード」は q073 の正答が述べない部分だが GPL FAQ (バイナリを配るなら対応ソース全体) で支持される一般原則で、ウ の範囲 (改変部分だけ) を残していない → L5 記録のみ。(ii) 著作権の主体「作者」→「著作権者」: `terms[0].points[1]` jp「著作権者が持ち続けたまま」/ zh「著作权人继续持有」/ en "The copyright holder keeps it"、`key_points_jp/zh/en[0]` も「著作権者 / 著作权人 / copyright holder」、単元内に「作者 / author」0 件 → **三語とも解消、退行なし**。jp-review r2 (PASS) の low 5 件と loc-review r1 (PASS) の low 4 件は §3 で個別に処置 (r2 low「GPL detail が改変版に限って義務を述べる」は一次資料照合の結果 M1 に格上げ)。

## 2. 用語別判定 (3 / 3)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | OSS | OK — exam 2 / 5 題 + mix 1 / 2 題: ① 改良版の再配布まで認め、配る相手・使う分野で扱いを分けない (2016h28a-q076 正答ア 手を加えて再配布可 / 2011h23a-q066 正答エ 改良した派生物を OSS として公開可、誤答ウ 特定分野で利用不可を否定 / 2014h26h-q067 正答エ = c のみ、b [分野・使用者の制限可] は不適切; OSD 5・6 と一致) / ② 著作権は放棄されず著作権者が持ち、ライセンスで条件を定める・条件はライセンスごとに異なる (2015h27a-q065 正答エ / 2017h29a-q100 正答イ) / mix ③ 「無料のソフト」と同義でない、再配布の有償・有償サポート可 (2011h23tokubetsu-q074 正答エ / 2021r03-q078 正答エ「有償サポートが提供される製品がある」; 考点「認められる」は許容の主張で、全製品にあるとは言わない → 限定条件保持; OSD 1 と一致)。detail: 「ソースコードを読めるだけでなく改変・再配布の自由まで」= 2021r03-q078 ア・2024r06-q080 b・2017h29a-q100 ウ (公開だけで OSS) を否定、「原則として無保証」= 2015h27a-q065 ウ・2016h28a-q076 エ を否定 (「原則として」保持)。one の「ソースコードが公開され」は IPA の定義の語で、2011h23tokubetsu-q074 ウ (インターネットからダウンロードできる必要) を支持する語句はない。図 (代表例表) は §1-4 | OK (copy 偽陽性のみ) | OK | L4 (points[0]) / L8 (points[1] en) / L2 (key_points_zh[0]) |
| 2 | GPL | exam 1 / 1 題: 改変して配るときは元と同じ GPL を適用し、対応するソースを入手可能に (2026r08-q073 正答エ; 前半は正答そのもの、後半は GPL FAQ で支持) / mix: BSD・MIT は改変版を別条件で配ることを認め、GPL は同じ GPL を求める (一次資料・一般知識で正しい; permissive は著作権表示の保持を求めるが「別の条件で配ることを認める」は正しい)。detail: GNU プロジェクト向けに作られた・Linux カーネル採用 (正しい) / 手元だけで使うなら義務なし (GPL FAQ: 改変版の公開義務なし、正しい) / **ただし 2 文目「自由に利用・改変・再配布できるが、改変したものを配るときは…ソースコード…同じ GPL」の「が」の対比は、改変しないまま配るときにはこの義務がないと読ませる** — GPL FAQ (バイナリを配るなら改変の有無を問わず対応ソース) と GNU copyleft (変更の有無にかかわらず) に反し、同じ単元の `terms[2].one_jp`「改変して配るとき**にも**」とも食い違う → **M1**。引用題で誤答に導く題はない (2017h29h-q093 ウ [集めた OSS を DVD で販売] は適切な行為のままで影響なし) ので HIGH ではない。hook (GNU = GNU's Not Unix の再帰的頭字語) 正しい。analogy (改変して渡すなら作り方と同じ約束書きも) は条件付きで像の範囲内 | OK | hook_zh 直訳調 L3 | **M1** / L3 / L5 / L6 |
| 3 | コピーレフト | OK — exam 1 / 1 題: 改変版を配る人は受け取った条件をそのまま次の受け手に付ける (2026r08-q073 正答エ「元と同じライセンスを適用」と一致; 誤答ア 著作権放棄・イ 対価要求必須・ウ 改変部分ソース非公開で配布可 のいずれも支持しない)。one「改変して配るときにも、元と同じ自由を受け手に引き継がせる」は GNU の定義 (変更の有無にかかわらず自由を引き継ぐ) と一致。detail「著作権者は著作権に基づいてライセンスを定め…同じ条件で配ることを求める」= ア (著作権放棄) を否定する正の説明。flow steps 4 (元 → 改変 → 配布: ソースを入手可能に + 元と同じ条件 → 受け手も同じ自由) は one・detail と一致。analogy (苗を分けるなら同じ約束も付ける) は条件付きで、r1 low「回覧板 = 配る義務の像」は苗の比喩への差し替えで解消。hook は L1 | OK | OK | L1 / L7 |

**単元レベル**: goals 3・overview_cols 2 (何を指すか / 改変版を配るとき)・overview_rows 3・pairs 1 組 3 行 (key 1)・key_points 4・overview.intro (goals の記法除去版) は本文と一致、三語一致。pairs[0].rows[1].b「GPL 以外のライセンスにも採られている」は事実 (LGPL / MPL / AGPL 等)。
**quiz / challenge 照合**: 2009h21h-q055 (イ 改良可; ウ 著作権放棄・エ 有償サポート不可 を本文が否定) / 2013h25a-q058・2019h31h-q067・2018h30h-q078 (図の表で解ける) / 2017h29h-q093 (不適切 = イ 元のライセンスに同業他社の利用禁止を追加 → OSS points[0] [相手で扱いを分けない] とコピーレフト points[0] [条件をそのまま] で解ける; ア 有償サポート・ウ DVD 販売・エ 独自改造 は本文で適切側) / 2023r05-q082 (a のみ) / 2024r06-q080 (a 販売可 = points[2]; b = detail で否定; c = points[1] で否定) / 2025r07-q096 (a・c; b を points[1] が否定) / 2026r08-q097 (a 有償媒体 = points[2]、b 分野制限 = points[0] で否定、c 修正ソースの提供) — 本文と矛盾なし。未引用題 (2010h22a-q077 / 2017h29a-q064 / 2019r01a-q089 / 2020r02o-q096 [ウ「ISO の同一ライセンス」は points[1]「ライセンスごとに異なる」が否定] / 2022r04-q063 / 2024r06-q097 / 2015h27h-q057 / 2016h28h-q059) も矛盾なし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 8 (うち 建議修 3)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** (観点 7 欄同士の不整合 + 一次資料に反する含意; jp-review r2 low の格上げ) | `terms[1](GPL).detail_jp` / `detail_zh` / `detail_en` 2 文目 (派生 `explanation_*` は自動追従) | 「GPL のプログラムは自由に利用・改変・再配布できる**が**、改変したものを配るときは、受け手がそのソースコードを入手できるようにし、配布物にも同じ GPL を付ける必要がある」は、対比の「が」により「改変しないで再配布するときはソースも GPL も要らない」と読ませる。GPL FAQ「if you distribute binaries, you must distribute the complete corresponding source code too」(改変の有無を問わない) と GNU copyleft「whether or not they have made changes」に反し、同単元 `terms[2].one_jp`「改変して配るとき**にも**」と食い違う。引用題を誤答させる題はないため HIGH ではない。他欄 (`goals_*[1]`・`overview_cols_*[1]`・`overview_rows[1].extra_*[1]`・`pairs[0].rows[2]`・`key_points_*[2]`・`terms[1].points[0]`・fig caption step 3) は「改変して配るときは〜」という真の条件文で、本文 2 文目だけが対比で範囲を絞るため、修正はこの 1 文に限る。3 文目「改変版を配らずに手元だけで使う場合には、この義務は生じない」は正しく変更不要 | jp before「GPL のプログラムは自由に利用・改変・再配布できるが、改変したものを配るときは、受け手がそのソースコードを入手できるようにし、配布物にも同じ GPL を付ける必要がある。」→ after「GPL のプログラムは自由に利用・改変・再配布できるが、配るときは改変したものも含めて、受け手がそのソースコードを入手できるようにし、配布物にも同じ GPL を付ける必要がある。」/ zh before「但分发修改后的版本时，必须让接收者能够获取其源代码，并给分发物附上同样的 GPL。」→ after「但分发时（包括分发修改后的版本），必须让接收者能够获取其源代码，并给分发物附上同样的 GPL。」/ en before "but anyone who distributes a modified version must let the recipients obtain its source code and attach the same GPL to it." → after "but anyone who distributes it, modified or not, must let the recipients obtain its source code and attach the same GPL to it." |
| L1 | LOW **建議修** | `terms[2](コピーレフト).hook_jp` / `hook_zh` (+ 派生 `memory_hook_jp/zh`、`summary.memory_hooks_jp/zh[]` の該当項) | 「copyright の right (右) を left (左) に置き換えた」は copyright の right が本来「右」の意味であるかのように読める (本来は「権利」、それを方向の「右」に見立てた言葉遊び)。jp-review r2 が修正案を出したが未反映。en "swaps the "right" in copyright for "left"" は誤読を生まず変更不要 | jp before「著作権を表す copyright の right (右) を left (左) に置き換えた言葉遊びの名前。」→ after「著作権を表す copyright の right (権利) を方向の「右」に見立て、left (左) に置き換えた言葉遊びの名前。」/ zh before「把表示著作权的 copyright 中的 right（右）换成 left（左）的文字游戏。」→ after「把表示著作权的 copyright 中的 right（权利）当作方向的“右”，换成 left（左）的文字游戏。」 |
| L2 | LOW **建議修** | `key_points_zh[0]` (+ 派生 `summary.key_points_zh[0]`) | 「源代码公开、使用、修改、再分发的自由由许可证明确允许的软件」は「源代码公开」が「使用・修改・再分发」と同列の項目に読める (loc-review r1 low、修正案未反映)。意味は jp と同じ | zh before「是源代码公开、使用、修改、再分发的自由由许可证明确允许的软件」→ after「是源代码公开，且使用、修改、再分发的自由由许可证明确允许的软件」 |
| L3 | LOW **建議修** | `terms[1](GPL).hook_zh` (+ 派生 `memory_hook_zh`、`summary.memory_hooks_zh[]` の該当項) | 「自己又重复出现在自己里面」は直訳調 (loc-review r1 low、未反映)。中国語 IT 用語では「递归缩写」が普通 | zh before「G 是 GNU 的首字母，GNU 这个名字是“GNU's Not Unix”的首字母缩写，自己又重复出现在自己里面。」→ after「G 是 GNU 的首字母，GNU 是“GNU's Not Unix”的递归缩写，名字本身又出现在展开式里。」 |
| L4 | LOW | `terms[0](OSS).points[0].text_jp/zh/en` 2 文目 | 「配る相手や使う分野によって扱いを分けることもしない」は 2014h26h-q067 の不適切項目 b (分野・使用者の制限可) と同じ組を打ち消す形。ただし語句は一般化 (使用者 → 相手)、順序は題と逆 (題: 分野 → 使用者)、題の場面も再現せず、内容は OSD 5・6 の正の定義 → D-209 の例外に当たり (iii) でない (jp-review r1・r2 と同判断) | 記録のみ |
| L5 | LOW | `terms[1](GPL).points[0].text_jp/zh/en` 後半 | 「受け手が対応するソースコードを入手できるようにする」は引用題 2026r08-q073 の正答 エ (同じライセンスを適用) が述べない部分。GPL FAQ で支持される一般原則で、誤答 ウ の語句 (改変部分・非公開としたまま) と範囲を残していない (r1 MEDIUM の解消形) | 記録のみ (根拠は一次資料、引用題は前半のみ支持) |
| L6 | LOW | `terms[1](GPL).points[1].text_jp/zh/en` | BSD ライセンス・MIT ライセンスが説明なしに初出 (性質は同文で述べる)。zh / en の `[[jp:BSDライセンス]]` `[[jp:MITライセンス]]` は jp 本文の「BSD ライセンス」(空白あり) と空白の有無だけ違う (validate jp-origin warn 0) | 記録のみ |
| L7 | LOW | `terms[1].detail` / `terms[1].points[0]` / `terms[2].points[0]` / `pairs[0].rows[2]` / `key_points_*[2]・[3]` / `terms[2].fig.steps[2]` / `overview_rows[1..2].extra_*[1]` | 「改変版を配るときはソースを入手可能にし、元と同じライセンス (GPL) を付ける」という同じ規則が多数の欄で繰り返される (書き方 8 / §9、jp-review r1・r2 low)。pairs[0].rows[2] は GPL 側とコピーレフト側が実質同内容で対比として弱い | 記録のみ (単元の中心規則で、削ると GPL とコピーレフトの関係が本文から薄れる) |
| L8 | LOW | `terms[0](OSS).points[1].text_en` | jp の 2 文の切れ目 (放棄されず持ち続けて条件を定める / 利用者は従う) と en の切れ目 (not given up / keeps … and users follow) がずれる (loc-review r1 low)。文数と意味は同じ、parity 0 diff | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① GPL = 個別のライセンス / コピーレフト = 考え方: `pairs[0].rows[0..1]`、`overview_rows[1..2]` の one_line・extra[0] (総表の構造)、`goals_*[2]`、GPL one (定義そのもの) → 許容。② 改変版を配るときの規則: L7。③ OSS とフリー (無料) の区別: OSS mix 考点のみ (strategy-02-04-u03 の pair が主) → 許容。

**範囲外の観察** (書き直し対象外):
- O1 `strategy-02-04-u03` (v2 済) の OSS mix 考点「OSS の著作権は放棄されておらず作者に残り」と `pairs[0].rows[3]`「作者に残る / 作者に残る」は、本単元の「著作権者」(r1 MEDIUM の修正結果) と主体の語が違う。作者も著作権者の一種で矛盾ではないが、企業が著作権を持つ OSS (2020r02o-q096 ア・2025r07-q096 a) を考えると本単元の言い方がより正確。今後 strategy-02-04-u03 を触る機会に「著作権者」へ揃えることを推奨 (本単元の指摘ではない)。他の点 (OSS = 公開 + 改変・再配布の許可、特定の人・分野を締め出さない、有償配布もある、レシピの比喩) は両単元で一致。
- O2 challenge 2025r07-q096 a・未引用 2020r02o-q096 ア (企業・団体が業務として開発する OSS もある) を直接支える文は本文にない。他の項目の消去で解け、本文と矛盾もしないため記録のみ。
- O3 unit_summary_jp/zh/en は v1 と同文 (未改稿)。「根幹思想であるコピーレフト」は本文の「考え方」と整合。

確認済みで問題なし: 限定条件 (qid 付き考点 5 件全て保持)、§9 禁止句 (jp 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤89 字)、D-198 写し (validate 0、独立照合は偽陽性のみ、choice-echo warn なし)、`[[jp:]]` 原語 (6 種、L6 の空白差のみ)、one_zh / one_en 見出し語、zh 訳語表 (B6 warn 0)、図種 (static table ×1 / flow steps ×1 / 図なし ×1 = 登録内)、既往 MEDIUM 2 件の解消と三語の退行なし、用語・`term_zh`・`term_en` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **8** (建議修 3: L1 / L2 / L3、記録のみ 5: L4〜L8) |

## 5. 判定

**FAIL → B3 補丁で解消可** (D-199: MEDIUM 1 件)。全 3 用語・考点 6 件 (qid 付き 5 件)・引用 8 題 + quiz / challenge / 未引用の topic 全 25 題で、考点の主張は正答と一致し、誤答肢を支持する記述・引用題の限定条件落ち・写しは無い。唯一の MEDIUM は GPL `detail` 2 文目の対比が「改変しない再配布には義務がない」と読ませる点 (一次資料 GPL FAQ / GNU copyleft に反し、コピーレフト one と食い違う) で、1 文の文字列置換 (jp / zh / en) で解消する。補丁 M1 + 建議修 L1〜L3 適用後に validate / parity を再実行し 0 issues / 0 diff なら PASS とみなせる (構造変更なし)。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-17-48-u01
✓ technology-17-48-u01 unit: 0 issues (data/ip/textbook/units/technology-17-48-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-17-48-u01
✓ technology-17-48-u01 parity: 19 locations, 0 diff
EXIT=0
```
