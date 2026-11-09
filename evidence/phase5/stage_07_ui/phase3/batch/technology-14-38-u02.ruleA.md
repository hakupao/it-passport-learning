# Rule A 全数抽検 — technology-14-38-u02 (コーディング規約と構造化)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b73)、repo HEAD `72cc0ac8` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b73-u02-a1` merge 結果、`merged.json` と同一、sha256 先頭 `97914e898f0ee5eb`; jp r0 `ca7a342b71f1a145` / loc r0 `edbee24bb27991ec`)。
- **対象**: `data/ip/textbook/units/technology-14-38-u02.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (字下げ / インデンテーション / ネストの深さ / 命名規則 / モジュール分割 / メインルーチン / サブルーチン) + 単元レベル (goals / overview_rows / pairs / key_points / summary / overview / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致、スクリプト確認)。整合の参照: 同 topic の `technology-14-38-u01` (v2、言語の種類) と `technology-14-37-u01〜u05` (v2、アルゴリズムと擬似言語; 特に u03 手続 / 関数 / 戻り値)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。
- **前段の指摘**: journal `journal.b73-u02-a1.jsonl` の jp-review r1 = PASS (low 8、HIGH / MEDIUM 0)、loc-review r1 = PASS (low 6、HIGH / MEDIUM 0)。解消を確かめるべき HIGH / MEDIUM は無い。low は r0 のまま (補正 round なし) で、本監査で各 low を再判定した (§3 の L 項目に統合; loc-review の「只是 / only」の low は本監査で M1 に格上げ)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。hook は 命名規則・メインルーチン に無い (欄自体なし、validate 合格) — 記録対象外。
2. **考点 × 引用題 (考点 全 5 件 = exam 2 + mix 3、qid 付き 2 件 = 2 題)**: 各題の題文 (`translations/<exam>.json` の stem_jp_clean 優先)・選択肢・`correct_answer` を再読 (全題 topic `technology-14-38`)。
   - 2010h22a-q043 (正答ウ = コードの保守性向上; 誤答 = テスト計画の明確化・仕様書の品質・DB 設計の品質): 命名規則 points[0]「命名規則 などで書き方を統一する主なねらいは…保守性 を高めること」は正答と一致。題の「変数の命名規則やコメントの書き方など」の「など」は考点の「などで」・zh「等」・en "and the like" で保持。誤答 3 肢の語 (テスト / 仕様書 / データベース) は単元に現れない (option tracing なし)。
   - 2013h25h-q060 (正答エ = ロードモジュール; 誤答 = オブジェクトモジュール・ソースコード・テキストデータ): モジュール分割 points[0]「翻訳したプログラムを結合し、コンピュータがそのまま実行できる形の機械語にしたもの = ロードモジュール」は正答と一致し、「結合し」が誤答ア (翻訳しただけで未結合) との区別点を正しく含む。分類題 (何と呼ぶか) で正答を見出し語外の語の一般定義として述べる形 = D-209 の免除に当たり、題の語句・肢の並びは再現していない (題は「実行可能な形式の機械語プログラム」、考点は「結合し…そのまま実行できる形の機械語」で 12 字窓一致なし・近似一致なし)。detail 3 文目「モジュールという語は…翻訳・結合する段階で作られるプログラムの単位の呼び名にも使われる」が見出し語との橋渡しで、オブジェクトモジュールを実行可能とは言わない。
3. **quiz / challenge_questions** (quiz 3 枠 = 2010h22a-q043 / 2013h25h-q060 / 2009h21h-q060、challenge 4 題 = 前記 3 題 + 2017h29a-q081): 本文と矛盾しないことを確認。2009h21h-q060 (正答ウ プラグイン: アプリに組み込み機能拡張・個別に更新・不要なら影響なく削除) — 本文にプラグインの語は無いが、モジュール分割 hook「差し替え・追加ができる部品」・analogy「部品だけを取り替えられる」は正答の性質と同じ向きで、誤答 (スクリプト / パッチ / マクロ) へ寄せる記述は無い (D-208 (9) 該当なし)。2017h29a-q081 (正答イ ソースコード) — 本文はモジュール分割 detail で「ソースコードを翻訳・結合する」と語を使うのみで定義は u01 側 (u01 は前提単元)。両題とも「本文から解く手がかりが薄い」(jp-review low) → L6。
4. **D-198 写し**: validate の copy guard (本文 + 図ラベル・caption・総表・対比表) = 0 件、`warn  choice-echo` 行なし。独立照合として単元の JP 文字列 117 本 (派生フィールド・source_figures 除く) を topic 内全 13 題の題文 (stem_jp_clean 優先) + 選択肢と 12 字連続照合 (記法・句読点・記号・空白除去; ① カタカナ 4 字以上と英数を □ 1 字に遮蔽、遮蔽後の実字 6 未満の窓は除外 / ② 遮蔽なし) → **① 0 件 / ② 0 件**。1〜2 字置換の近似一致 (12 字窓、ハミング距離 1〜2) → **0 件**。カタカナの多い文の目視: ロードモジュール考点 (上記 §1-2)、インデンテーション one / points[0] (「英語名」「同じ整形」— 題に該当語なし)、メインルーチン / サブルーチン (topic 内に該当題なし) → 写しなし。(iii) option tracing: 考点は全て肯定の定義形で、誤答肢の否定・肢の集合・順序の再現なし。図の具体例 (orderCount / order_count / TAX_RATE、給与計算プログラムの 3 部品、繰り返し→条件分岐→条件分岐の 3 段) は全て自作で題に無い場面。
5. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 3/2/3/3/3/2/3 文、比喩・フックが定義の言い換えでないこと (字下げ hook は字面の読み下しで定義に近い → L4)、定義前使用 (入れ子 = ネスト one の同格、インデント = インデンテーション detail で定義、コーディング規約 = 命名規則 detail で定義、保守性 = 考点内「つまり」で定義、モジュール = モジュール分割 one の括弧、ロードモジュール = 考点内で定義、関数 / 手続き = サブルーチン detail で別名として導入; 「結合」は未定義 → L8)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → jp ヒット 0 [freq_badge は「低頻」]。zh / en 相当語 [考试 / 必须 / 记住 / 选项 / exam / must / always / important / remember / option / every / never / all] のヒットは `kind: "exam"`・"Example"・"overall"・"all capitals"・"everywhere"・"whenever" 等の部分一致で全て偽陽性)、図の型 (ネストの深さ = tree steps 3、命名規則 = static table、モジュール分割 = static tree、メインルーチン = flow steps 4、サブルーチン = svg [v1 の mermaid 図を継承、`figure` 互換欄あり]; 字下げ・インデンテーション = 図なし; 全て登録内)、pair 配置 (字下げ→ネストの深さ はネストの深さの後、メインルーチン→サブルーチン はサブルーチンの後、各組 key 行あり)。
6. **D-200**: 考点数 0/1/1/1/1/0/1 (≤3 ✓)、各 JP 文数 1・字数 43〜64 (≤100 ✓、最大はネストの深さ `points[0]` の 64 字)。**framing 件数** (validateV2 `POINT_FRAMING` の型で全考点を照合): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202〜D-205 / D-208 単元全体点検**: 書き方 7 (欄同士の「だけ / ではない / 只是 / only」の照合) → **M1** (ネストの深さ考点の zh / en「只是 / only」が字下げ detail の Python と衝突)、L2 (メインルーチンの「結果とともに戻る」が サブルーチン detail の別名「手続き」・14-37-u03 の 手続 = 値を返さない と緩く衝突)。書き方 8 (対比の出現欄): 字下げ / ネスト = `pairs[0]` + ネスト mix 考点 (2 箇所、goals_jp[0] は予告) → 許容; メイン / サブ = `pairs[1]` + サブルーチン mix 考点 + 図 caption・サブルーチン detail の「呼び出し元へ戻る」→ L4 (jp-review low と同じ)。書き方 9 (限定条件) → §2 表、落ち 0。D-204 (比喩・図の範囲): 入れ子の箱・家具の部品・現場監督・手順書の別ページ参照はいずれも one / detail を超える主張をしない。D-205 (言語の事実): 「多くの言語では字下げを変えても処理の結果は変わらない」「Python のように字下げでまとまりの範囲を決める言語もある」(一次資料: Python Language Reference §2.1.8 Indentation — 行頭の空白から字下げの段を計算し、それで文のまとまりを決める) /「言語によっては関数や手続きとも呼ばれ」/「コーディング規約の一部として定めることが多い」/ 命名の決まりは「例えば」 → 全てヘッジ付きで言い切りなし。改訂される文書の構成数の記述なし (対象外)。D-208 (3) 別名: 字下げ / インデンテーションは別名を「別々の手法ではない」と正しく扱う ✓。(8) 比喩の鍵語: 「現場監督」「職人」「部品」は他見出し語の役割と衝突しない ✓。(10) 閉じた列挙: 命名の決まり 3 例は「例えば…といった」で開いた列挙 ✓。(7) D-210: 法令・規格の改正前文言の題なし (対象外)。
8. **整合 (u01 / 14-37)**: u01 Python「字下げ (インデント) で処理のまとまりを表す」・14-37-u01 擬似言語「字下げで本体の範囲を示す」と、本単元の字下げ detail (Python のように範囲を決める言語もある) は一致。u01 の「ソースコードはコンパイラで機械語に翻訳」・「CPU が実行するのはその機械語」と ロードモジュール考点 (翻訳 + 結合 → 実行できる機械語) は一致。14-37-u03 の 手続 (値を返さずに戻る) / 関数 (値を返す) と、本単元 サブルーチン detail「言語によっては 関数 や 手続き とも呼ばれ」は一致するが、メインルーチン図・detail の「結果とともに戻る / 戻ってきた結果を使い」は値を返さない手続を想定しない言い切り → L2。表記: 本単元「手続き」と 14-37-u03 見出し語「手続」(シラバス表記) の送り仮名差 → L8。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 9 種 (字下げ / インデンテーション / ネストの深さ / 命名規則 / 保守性 / モジュール分割 / ロードモジュール / メインルーチン / サブルーチン) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 7 用語に見出し語の `[[jp:]]` あり (D-202)、zh 訳語が `zh_terms.json` に従うこと (缩进 / 子例程 / 主例程 / 过程 / 函数 一致、validate の B6 warn 0 / jp-origin warn 0; ロードモジュール・保守性 は表に無し — 保守性 = 可维护性 は quiz 訳と一致、ロードモジュール = 载入模块 は quiz 訳「装入模块」と不一致 → L1)。サブルーチンの svg 図はラベルが jp のみ (メインルーチン / サブルーチン1 / サブルーチン2、v1 継承、見出し語のみ) → O1。
10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 字下げ | OK — 考点なし。detail「多くの言語では結果は変わらないが、Python のように範囲を決める言語もある」は事実 (Python Language Reference §2.1.8)・ヘッジ付き。u01 Python / 14-37-u01 擬似言語の記述と一致 | OK (図なし) | one_en "visible on sight" (L7) | L4 (hook) / L7 |
| 2 | インデンテーション | OK — mix: インデンテーション と 字下げ は同じ整形の英語名と日本語名で別の手法ではない (別名を別物と教えない、D-208 (3) ✓)。detail「インデント = 行頭の空白そのもの / その幅」は正しい | OK (図なし、analogy 空) | OK | L4 (points[0] の言い直し) |
| 3 | ネストの深さ | OK — mix: 深さは構造の性質、字下げは見た目に表す手段で、幅を一律に広げても深さは変わらない (jp は正しい)。detail の 3 段の例と tree steps 3 (1→2→3 段) 一致 | OK | **zh「只是」/ en "only" が字下げ detail の Python と衝突 → M1** | M1 / L5 (steps[0] の数え方) |
| 4 | 命名規則 | OK — exam 1 / 1 題: 書き方の統一の主なねらい = 保守性 (2010h22a-q043 正答ウ; 限定条件「など」保持; 誤答肢の語なし)。table 3 行は detail の「例えば」と一致 | OK | OK | L4 (detail 1 文目と表) |
| 5 | モジュール分割 | OK — exam 1 / 1 題: 翻訳 + 結合で実行できる機械語 = ロードモジュール (2013h25h-q060 正答エ; 「結合し」で誤答ア オブジェクトモジュールと区別)。quiz 2009h21h-q060 (プラグイン) は hook / analogy と同じ向き、誤答へ寄らない。detail「1 つのモジュールに 1 つの役割」は設計の作法として妥当 | OK (D-209 分類題の定義形) | zh「载入模块」≠ quiz 訳「装入模块」(L1)、en 主語の数 (L3) | L1 / L3 / L6 / L8 |
| 6 | メインルーチン | OK — 考点なし。one「最初に動き、全体の流れを取りまとめる」は標準的な定義。flow steps 4 は呼び出し→戻り→次の手順で正しいが、「結果とともに戻る / 結果を使い」は値を返さない手続を想定しない言い切り | OK | 三語同じ向き | L2 |
| 7 | サブルーチン | OK — mix: メインは実行の起点として全体の順序を決め、サブは呼び出されたときだけ動いて呼び出し元へ戻る (正しい)。detail「1 か所直せば全ての呼び出し箇所に反映」「言語によっては 関数 や 手続き とも」「さらに別のサブルーチンを呼び出せる」は正しい。svg 図 (メイン → サブ 1・2 → メイン) は mix 考点と一致 | OK | svg ラベル jp のみ (O1) | L4 / L8 / O1 |

**単元レベル**: goals 3 点・overview_cols 2 (観点 / 主な効果)・overview_rows 7 行 (インデンテーション行は「字下げの英語名 / 字下げと同じ」で別名を正しく扱う)・pairs 2 組 (字下げ / ネストの深さ 3 行 key 1、メインルーチン / サブルーチン 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge_questions 4 件 (§1-3)。key_points[1]「深い部分は別の処理に切り出して浅く保つ」はネスト detail と一致。`pairs[0].rows[1].a`「書き方 (整形) の作法」は Python の場合を含めると狭いが、行の主題 (性質の対比) として誤りではない → L5。事実誤りなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 8 (うち 建議修 3)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[2](ネストの深さ).points[0].text_zh` / `text_en` | zh「**缩进**（[[jp:字下げ]]）**只是**把层次在外观上表现出来的手段」/ en "**indentation** ([[jp:字下げ]]) is **only** a way to show those levels visually" は jp に無い排他「〜にすぎない」を足し、同単元 `terms[0].detail_zh/en`「也有像 Python 这样用缩进决定代码块范围的语言」/ "some languages such as Python use indentation to decide where a block begins and ends" と矛盾する (Python では字下げが見た目だけでなくまとまりの範囲を決める)。zh / en だけの付加による欄同士の不整合 (書き方 7、D-208 (5)(6) 型; loc-review は low・任意で記録したが修正されていない) | zh: before `**缩进**（[[jp:字下げ]]）只是把层次在外观上表现出来的手段` → after `**缩进**（[[jp:字下げ]]）是把层次在外观上表现出来的手段` / en: before `while **indentation** ([[jp:字下げ]]) is only a way to show those levels visually` → after `while **indentation** ([[jp:字下げ]]) is a way to show those levels visually` (jp 変更なし) |
| L1 | LOW **建議修** | `terms[4](モジュール分割).points[0].text_zh` | ロードモジュールの zh 訳「载入模块」が、同用語の直下に出る quiz 2013h25h-q060 の zh 訳 (正答肢)「装入模块」と食い違う。`zh_terms.json` に項目なし。学習者は本文と正答肢で別名を見る | before `**载入模块**（[[jp:ロードモジュール]]）` → after `**装入模块**（[[jp:ロードモジュール]]）` (zh のみ) |
| L2 | LOW **建議修** | `terms[5](メインルーチン).detail_jp/zh/en` 1 文目、`terms[5].fig.data.nodes[2].label.jp/zh/en`、`nodes[3].label.jp/zh/en`、`fig.steps[3].caption_jp/zh/en` | 呼び出した処理が必ず「結果とともに戻る」「戻ってきた結果を使い」と読め (en "returns a result")、同単元 サブルーチン detail の別名「手続き」、および 14-37-u03 の 手続 =「結果の値を返さずに呼出し元へ戻る」・関数 mix 考点「手続 は値を返さないが 関数 は値を返す」と緩く衝突する (jp の「結果」は処理の成果とも読め、該当の過去問は無い [questions.json にサブルーチン / メインルーチン / 値を返さ 系の題なし] ので LOW; jp-review low を再判定) | detail_jp: `細かな個別の処理は自分で書かずに下位の処理を呼び出して任せ、戻ってきた結果を使って次の手順へ進む。` → `細かな個別の処理は自分で書かずに下位の処理を呼び出して任せ、処理が戻ってきたら次の手順へ進む。` / detail_zh: `细节的个别处理不由自己编写，而是调用下层处理来完成，再用返回的结果进入下一步。` → `细节的个别处理不由自己编写，而是调用下层处理来完成，处理返回后再进入下一步。` / detail_en: `It leaves individual detailed tasks to lower-level processing that it calls, then moves on to the next step with the returned result.` → `It leaves individual detailed tasks to lower-level processing that it calls, then moves on to the next step once that processing returns.` / nodes[2].label: jp `処理が終わり結果とともに戻る` → `処理が終わり呼び出し元へ戻る`、zh `处理结束，带着结果返回` → `处理结束，返回调用方`、en `Processing ends and returns a result` → `Processing ends and returns to the caller` / nodes[3].label: jp `結果を使って次の手順へ` → `戻ったところから次の手順へ`、zh `用结果进入下一步` → `从返回处进入下一步`、en `Use the result for the next step` → `Continue with the next step` / steps[3].caption: jp `メインルーチンは戻ってきた結果を使い、次の手順へ進む。` → `処理が戻ると、メインルーチンは次の手順へ進む。`、zh `主例程利用返回的结果，进入下一步。` → `处理返回后，主例程进入下一步。`、en `The main routine uses the returned result and moves on.` → `Once the processing returns, the main routine moves on to the next step.` (派生 `explanation_*` は自動追従) |
| L3 | LOW **建議修** | `terms[4](モジュール分割).points[0].text_en` | 複数主語 "Translated programs … are called" に単数補語 "a load module" (loc-review low、未修)。考点本文なので直す | before `Translated programs that have been linked into machine code the computer can run as is are called a **load module** ([[jp:ロードモジュール]]).` → after `Machine code produced by linking translated programs, ready for the computer to run as is, is called a **load module** ([[jp:ロードモジュール]]).` (en のみ) |
| L4 | LOW | `terms[1].points[0]`・`key_points_*[0]` / `terms[0].hook_*` / `terms[3].detail_*` 1 文目 / `terms[6].detail_*` 1 文目 | §9 / §6 の言い直し: インデンテーション mix 考点は one の言い直しで key_points[0] でも反復 / 字下げ hook は字面の読み下しで定義に近い / 命名規則 detail 1 文目は表 3 行の文章化 / サブルーチン detail 1 文目「呼び出し元の続きへ戻る」はメインルーチン caption 3・pairs[1].rows[2]・mix 考点と重なる (jp-review low 3 件と同旨)。事実誤りなし | 記録のみ (別名の取り違え防止は D-208 (3) の要点で、削ると別物と誤解する余地が増える) |
| L5 | LOW | `terms[2].fig.steps[0].caption_*` / `pairs[0].rows[1].a_*` | 中に何も入らない繰り返し 1 つを「入れ子 1 段」と数える (one の「中にさらに入る」と数え方のつながりが弱い、慣習としては正しい) / 字下げを「書き方 (整形) の作法」とする表の言い方は Python の場合を含めると狭い (detail は「どちらの場合も」で収める) (jp-review low 2 件) | 記録のみ |
| L6 | LOW | `terms[4].quiz[1]` (2009h21h-q060)、`challenge_questions[2..3]` (2009h21h-q060 / 2017h29a-q081) | プラグイン・ソースコードの語は本文で定義されず、解く手がかりが薄い (矛盾はない; 2017h29a-q081 の定義は前提単元 u01 側) (jp-review low) | 記録のみ |
| L7 | LOW | `terms[0].one_en`、`goals_en[1]` (+ `overview.intro_en`)、`key_points_en[0]`、zh の hook / analogy の「」 | loc-review low の未修分: "visible on sight" は不自然 / "**naming conventions** for names" は冗長 / key_points_en[0] は 2 見出し語を 1 語に畳む / zh 本文の引用に日本式「」(凹进处・鸟巢・年月_客户_内容・熬高汤的方法见另页・下面的、从属的; 字下げ hook の「字を下げる」は日本語引用で可) | 記録のみ (任意: one_en `visible on sight` → `visible at a glance`) |
| L8 | LOW | `terms[4].points[0].text_jp`「結合し」、`terms[6].detail_jp`「手続き」、`terms[4].points[0].text_zh`「编译后的」 | 「結合」(リンク) は初学者向けの注なし / 14-37-u03 見出し語は「手続」(送り仮名差、zh は両単元 过程 で一致) / zh「编译」は jp「翻訳」(コンパイル・アセンブルを含む) をやや狭める | 記録のみ |

**範囲外の観察** (書き直し対象外):
- O1 `terms[6].fig` (svg、v1 の mermaid 図を継承) はノード名が jp のみ (メインルーチン / サブルーチン1 / サブルーチン2)。見出し語だけで三語の読者が読めない量ではなく、validate の svg 互換規則を満たす。
- O2 `unit_summary_*` は v1 と同文 (未改稿)。事実は正しい。

確認済みで問題なし: 前段 (jp-review / loc-review) の HIGH / MEDIUM 0 で回帰対象なし、限定条件 (考点 2 件とも保持、§2)、§9 禁止句 grep (jp 0、zh / en は偽陽性のみ)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤64 字)、D-198 写し (validate 0、独立照合 遮蔽あり 0 / 遮蔽なし 0 / 近似 0、option tracing なし)、D-205 (言語の事実は全てヘッジ付き、Python は一次資料と一致)、`[[jp:]]` 原語 (9 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (7/7)、zh 訳語表 (B6 warn 0)、図種 (tree steps / static table / static tree / flow steps / svg = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、u01 / 14-37 との事実整合 (L2 の言い切りを除く)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **8** (建議修 3: L1 / L2 / L3 / 記録のみ 5: L4〜L8) |

## 5. 判定

**FAIL → B3 補丁で解消可** (D-199: MEDIUM 1)。M1 はネストの深さ mix 考点の zh / en だけに付いた「只是 / only」の削除 (同一欄内の文字列置換、jp 不変) で解消する。補丁時に L1〜L3 (建議修) を同時に当てることを推奨。補丁後は validate / parity の再実行と M1 の 2 欄の目視再確認で PASS 判定可。全 7 用語・考点 5 件 (qid 付き 2 件)・引用 2 題 + 未引用の quiz / challenge 2 題で、jp の考点は正答と一致し、誤答肢を支持する記述も引用題の限定条件の落ちも無い。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-38-u02
✓ technology-14-38-u02 unit: 0 issues (data/ip/textbook/units/technology-14-38-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-14-38-u02
✓ technology-14-38-u02 parity: 32 locations, 0 diff
EXIT=0
```
