# Rule A 全数抽検 — technology-14-38-u01 (代表的なプログラム言語の種類)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b73)、repo HEAD `72cc0ac8` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b73-u01-a1` merge 結果、sha256 先頭 `0527abe7f0834fd2`)。
- **対象**: `data/ip/textbook/units/technology-14-38-u01.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (C / Fortran / Java / C++ / Python / JavaScript / R) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-210、`docs/templates/ruleA_unit_audit.md` の既知失敗型 (1)〜(10)。比較: `data/ip/textbook/.planning/v2/technology-14-38-u01/v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致)。前段審査: `journal.b73-u01-a1.jsonl` (jp-review r1 REVISE / r2 PASS、loc-review r1 PASS)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (node label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`explanation_*` 等) が本体の記法除去版であることを確認。analogy は C / Java / JavaScript / R の 4 用語、hook は JavaScript 以外の 6 用語 (JavaScript は hook フィールド自体なし)。
2. **考点 × 引用題 (考点 全 8 件 = exam 5 + mix 3、引用 qid 延べ 6 件 = 異なり 6 題、全題 topic `technology-14-38`)**: `data/ip/quiz/questions.json` (+ `translations/<exam>.json` の stem_jp_clean) から各題の題文・選択肢・`correct_answer` を再読。topic 内全 13 題のうち言語の題 7 題 (上の 6 題 + 2013h25a-q055 インタプリタ/コンパイラ図) を本文と照合。
3. **quiz / challenge_questions**: challenge 5 題 (2010h22a-q054 / 2012h24a-q073 / 2017h29h-q070 / 2024r06-q088 / 2011h23tokubetsu-q081) は全て本文で引用済み、用語内 quiz 計 7 枠 (C 2 / Fortran 1 / Java 3 / JavaScript 1、C++ / Python / R は 0)。前段 MEDIUM の 2012h24h-q055 (CGI のスクリプト言語 = Perl) は Python / JavaScript の quiz と challenge の両方から外れている (解消確認)。
4. **D-198 写し**: validate の copy guard / choice-echo = 0 件 (warn 行なし)。独立照合として JP 文字列 96 本 (派生フィールド除く、図ラベル・caption・総表・対比表含む) を topic 内全 13 題の題文 + 選択肢と 12 字連続照合 (句読点・記号・空白除去) — **カタカナ 4 字以上・英数遮蔽あり 0 件 / 遮蔽なし 0 件**。近似照合 (14 字窓 × 編集距離 ≤3) → 2 件、いずれも偽陽性:
   - `terms[1].one_jp` ↔ 2017h29h-q070 (ed 3): 一致部は「高水準言語の一つである」の述部。題では**誤答肢イ** (機械語を主語とする) の述部だが、単元の主語は Fortran で事実として正しく、`detail_jp` が高水準言語を「機械語ではなく…」と定義して誤答イを支持しない。
   - `terms[5].detail_jp` ↔ 2009h21a-q068 (ed 3): 「ブラウザに組み込まれ(た/て)実行」— 単元は JavaScript の実行エンジン、題はアプレット。別の主張の定型句。
   - 全体類似度 (校正: HIGH 例 ed 0.14 / Dice 0.52): `key_points_jp[0]` ↔ 2017h29h-q070 正答ア ed/len 0.63・Dice 0.34 / `terms[1].points[0]` ↔ 同 0.64・0.40 / `terms[0].points[0]` ↔ 2011h23tokubetsu-q081 b 0.83・0.22 / `terms[2].one_jp` ↔ 2010h22a-q054 ウ 0.75・0.28 / `terms[2].points[0]` ↔ 同 0.96・0.09 / `terms[2].points[1]` ↔ 2012h24a-q073 題文 0.83・0.42、↔ 2009h21a-q068 ウ 0.77・0.39 / `terms[5].points[0]` ↔ 2024r06-q088 ア 0.78・0.26 → 全て校正値から遠い。`key_points_jp[0]` は 2017h29h-q070 正答アと同じ原則を 2 言語の組で述べる (言語順は逆、D-211 の一般原則)。`terms[5].points[0]` の「動的な振る舞い」は題の正答の語だが標準用語。
   - (iii) 選択肢なぞり (D-208 (1)): 2024r06-q088 の誤答 3 肢 (サーバ上だけ / 事前コンパイル必須 / Java のスクリプト版) に対し、`terms[5].detail_jp` 3 文目 (実行エンジンがソースを読み込んで動かす・サーバ側の実行環境もある) と `points[1]` (mix、Java と系統の違う別言語) が触れるが、いずれも正の定義で述べ、肢の文言・並び (肢順は イ→ウ→エ、detail はウ側→イ側の逆順) を再現しない → D-209 の除外 (取り違えやすい 2 語の対比を両側の正の定義で述べる) に当たり非該当 (jp-review r2 の LOW と同判断)。2010h22a-q054 の誤答 (マークアップ言語 / 科学技術計算向け / 事務処理計算向け) は単元が肢の組として並べない。ただし事務処理側は §3 M2。2012h24a-q073 (分類型) は アプレットの定義を一般定義で述べ、選択肢 4 語の組 (アプリケーション / アプレット / 仮想マシン / サーブレット) を再現しない。
5. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 3 文 × 7、定義前使用 (手続き型 = C detail 1 文目、コンパイラ = C detail の括弧注、高水準言語 = Fortran detail 1 文目、オブジェクト指向 = Java detail 1 文目、バイトコード = Java detail「中間形式」、インタプリタ = Python detail の括弧注、スクリプト言語 = JavaScript detail 1 文目; 未定義 = C++ one の「クラス」→ L6、goals / 総表の先行使用 → 前段 LOW 同様に許容)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → `terms[0].hook_jp`「と覚える」1 件 (+ 派生 2) のみ。6 hook 中 1 件で前例どおり記録なし。Java hook「ちなむとされ」は伝聞のぼかしで定型句ではない)。zh / en の試験枠語 grep (考试 / 考到 / 问到 / 选项 / 答案是 / exam / tested / asked / choices / answer is) は points の `kind:"exam"` キーのみで本文 0。全称・排他の語 (だけ / 必ず / 常に / すべて / always / never / only / must / 只有 / 总是) 0 件。図の型: Java = flow steps 4 (登録内)、他 6 用語は図なし。pair 配置 (C→C++ は C++ の後、Java→JavaScript は JavaScript の後、Python→R は R の後、各組 key 行 1)。
6. **D-200**: 考点数 1/1/2/1/0/2/1 (≤3 ✓; Python は 0 — topic 内に Python の性質を問う題が無く、前段で q055 を外した結果。記録のみ)、各 JP 文数 1〜2・字数 50〜80 (≤100 ✓、最大は `terms[5].points[1]` の 80 字)。**framing 件数** (validateV2 `EXAM_FRAMING`、全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 → **M1** (コンパイラの定義と Java の欄の不整合)、L9。書き方 8 (対比の出現欄) → 許容 (下に列挙)。書き方 9 (限定条件) → §2 表、落ち 0。§6 → L7。§9 言い直し → L8。
8. **三語**: zh・en が jp と同じ事実か、図ラベル・caption・総表・対比行の三語一致、`[[jp:…]]` 原語 7 種 (コンパイラ / 機械語 / 高水準言語 / アプレット / 手続き型 / オブジェクト指向 / スクリプト言語) が jp 本文に実在 (スクリプト、全 ok)。見出し語 7 語は全てラテン文字で三語同形 (`term_zh` = `term_en` = `term`) のため、one_zh / one_en の見出し語自体が原語表示を兼ね D-202 を満たす (validate も 0)。zh 訳語は `zh_terms.json` / `zh_terms.unit.json` に従う (`textbook-v2-zh-terms.mjs --check-units` → `technology-14-38-u01: 0 zh-term warning(s)`; 面向对象 / 操作系统 / 库 / 虚拟机 / 机器学习 / 游戏 / 服务器 / 仿真 一致)。前段 loc-review の LOW 4 件は未反映 → L2〜L5。
9. **単元外との整合**: `technology-14-38-u02` (merged) の字下げ detail「Python のように字下げでまとまりの範囲を決める言語もある」は本単元 Python detail と一致、モジュール分割の考点 (ロードモジュール = 機械語) とも矛盾なし。`technology-14-37-u01` 擬似言語「特定のプログラム言語の文法に縛られずに」と矛盾なし。他の v2 単元にコンパイラ / インタプリタ / スクリプト言語の定義は無い (grep)。
10. **言語の事実 (問題外の事実)**: D-205 (改訂文書の構成数) の対象は無し。問題が支えない事実 (C = 1970 年代初め・ベル研究所・UNIX・前身 B / Fortran = 1950 年代・IBM・Formula Translation / Java = Sun Microsystems・JVM・バイトコード・コーヒー由来 (「とされ」でぼかし) / C++ = 1980 年代・C の拡張・++ 演算子 / Python = 1990 年代初め・Guido van Rossum・Monty Python / JavaScript = 1995 年・Netscape・サーバ側実行環境 / R = 1990 年代・オークランド大学・S の系統・2 人の R) は、書き手は一次資料を明示していない。監査者は本 session で外部取得をしておらず、公知の一次資料 (Ritchie "The Development of the C Language"、python.org General Python FAQ、R FAQ §2.13、Stroustrup の C++ FAQ、Oracle Java Client Roadmap Update / JEP 289) の記載内容と照らして誤りを見つけなかった (記憶ベース)。言い切りが強すぎる 1 件 → L1。実行方式は Python / R とも「主に」インタプリタ、JavaScript は「主に」ブラウザで、全称化 (例: 「Python は常にインタプリタ」) は無い。
11. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | C | OK — exam 1 / 1 題: C のソースはコンパイラで機械語に翻訳され、CPU が実行するのは機械語 (2011h23tokubetsu-q081 正答ウ = b のみ; 誤答 a [機械語は CPU 非依存]・c [高水準言語なら機械語でできない演算ができる] を支持する記述なし — Java 図 step 2「特定の CPU 向けではない中間形式」は機械語の CPU 依存と整合)。quiz の 2017h29h-q070 (正答ア) とも一致 | OK。ただし detail のコンパイラ定義 → **M1** | OK | M1、L8 |
| 2 | Fortran | OK — exam 1 / 1 題: 数式に近い高水準言語で実行前にコンパイラで機械語へ翻訳 (2017h29h-q070 正答ア; 誤答イ [機械語は高水準言語] は detail の定義で否定、ウ・エ に触れる記述なし)。題は「機械語に変換されてから実行」で手段を言わないが、コンパイラは Fortran の標準的な処理系で限定の追加は事実どおり | OK (近似照合は偽陽性 §1-4) | zh「科学技术计算」→ L3 | L3 |
| 3 | Java | OK — exam 2 / 3 題: JVM の上で動くので機種・OS ごとに作り直さない (2010h22a-q054 正答ウ; 単元は「JVM が用意された環境なら」の条件を足しており事実どおり) / アプレット = Web サーバから送られブラウザ内で実行される Java のプログラム (2012h24a-q073 正答イ / 2009h21a-q068 正答ウ)。flow steps 4 (ソース→バイトコード→各 OS の JVM→実行) は detail と一致。detail「現在は使われていない」→ L1 | OK (D-209 分類型の除外) | hook の因果付加 → L2 | M1 (detail・fig の「コンパイラ」側)、M2 (総表)、L1、L2 |
| 4 | C++ | OK — 引用題なし、mix 1: C は手続き型、C++ は C にオブジェクト指向を足した言語 (pairs[0] と一致)。「1980 年代に開発」は 1979 年の前身 C with Classes を含めても大筋で正しい | 「クラス」未定義 → L6 | OK | L6、L8 |
| 5 | Python | 考点なし・quiz なし (topic 内に Python の性質を問う題が無い; 前段 MEDIUM の q055 除去の結果)。detail「主にインタプリタ」はぼかしあり、字下げは u02 と一致 | OK | hook_en「, not the snake」→ L5 | L5 |
| 6 | JavaScript | OK — exam 1 / 1 題: ブラウザ上で動かすと操作に応じて表示が変わる動的な振る舞いを持たせられる (2024r06-q088 正答ア; 題の「など」は単元の「ような」で例示に開いたまま、範囲を閉じない) / mix: Java と JavaScript は系統の違う別言語 (誤答エを打ち消す向きだが両側の正の定義、D-209)。detail「サーバ側で動かす実行環境もある」は誤答イ (サーバ上だけ) を支持しない、「ソースを読み込んで動かす」は誤答ウ (事前コンパイル必須) を支持しない | OK | OK | L11 |
| 7 | R | 引用題なし、mix 1: Python は汎用で分析は用途の一つ、R は統計解析のために作られた (pairs[2] と一致)。detail に「主にインタプリタ」が入り総表と一致 (前段 LOW 解消) | analogy が one の言い換え → L7 | OK | L7、L9 |

**単元レベル**: goals 3・overview_cols 2 (主な用途 / 動かし方の目印)・overview_rows 7 行・pairs 3 組 (C/C++ 2 行 key 1、Java/JavaScript 3 行 key 1、Python/R 2 行 key 1)・key_points 4・challenge 5。前段 LOW の pairs[0]「動かし方」同値行は削除済み。`goals_jp[1]` の「コンパイラで機械語に翻訳してから動かす言語 / JVM やブラウザの上で動く言語」の対置が M1 の不整合を際立たせる。`overview_rows[2].extra_jp[0]`「業務システム」→ M2。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 2 / LOW: 11 (うち 建議修 2)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 (B3、1 欄内の文字列置換) |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[0](C).detail_jp` / `detail_zh` / `detail_en` (派生 `explanation_*` は自動追従) | 単元で唯一のコンパイラの定義が「ソースをまとめて**機械語に**翻訳するプログラム」だが、`terms[2](Java).detail_jp`「Java のソースコードはコンパイラでバイトコードという中間形式に変換され」と `terms[2].fig.steps[1].caption_jp`「コンパイラが、特定の CPU 向けではない中間形式のバイトコードに変換する」は機械語でない出力にコンパイラを使う。`goals_jp[1]` が「コンパイラで機械語に翻訳してから動かす言語」と「JVM の上で動く言語」を対置するため、学習者は Java がコンパイラを使うのか使わないのかで矛盾を読む (書き方 7 の欄同士の不整合、IT パスポート水準の定義としては誤りではないので HIGH にはしない)。C 自体の事実は主節「で機械語にしてから動かす」が保つ | jp「**コンパイラ** (ソースをまとめて機械語に翻訳するプログラム)」→「**コンパイラ** (ソースをまとめて翻訳するプログラム)」/ zh「**编译器**（把源代码整体翻译成机器语言的程序）」→「**编译器**（把源代码整体进行翻译的程序）」/ en "a **compiler** (a program that translates the whole source into machine code in one go)" → "a **compiler** (a program that translates the whole source in one go)" |
| M2 | **MEDIUM** | `overview_rows[2](Java).extra_jp[0]` / `extra_zh[0]` / `extra_en[0]` | 「主な用途」列の Java =「業務システム」/「企业业务系统」/ "Business systems" は、引用題 2010h22a-q054 の**誤答肢エ** (事務処理計算向けに開発された言語 = 本来は COBOL) と同じ方向を指す。本文 (one / detail / pairs) に業務システムの記述は無く (v1 explanation からの残存)、`goals_jp[0]` が「作られた目的と主な用途で見分ける」と総表を判別の手がかりに据えるため、この欄を q054 に当てると正答ウと並んで誤答エが候補に残る (既知失敗型 (6)/(9))。列名は「用途」で肢は「開発目的」だという差はあるが、en "Business systems" は肢の business processing とほぼ同義に読める | jp「業務システム」→「大規模なシステム開発」/ zh「企业业务系统」→「大型系统开发」/ en "Business systems" → "Large-scale system development" (`pairs[1].rows[1].a_*`「大規模な開発にも向く汎用言語」と一致) |
| L1 | LOW **建議修** | `terms[2](Java).detail_jp` / `detail_zh` / `detail_en` 3 文目 | アプレットを「現在は使われていない」と全称で言い切る。支えがあるのは「主要なブラウザが対応を終えた」まで (前段 jp-review r1 LOW「現在形で定義」を直す際に言い過ぎた)。問題外の全称主張 | jp「主要なブラウザが対応を終えたため現在は使われていない。」→「主要なブラウザが対応を終えたため現在はほとんど使われていない。」/ zh「由于主流浏览器已停止支持，如今已不再使用。」→「由于主流浏览器已停止支持，如今基本上已不再使用。」/ en "applets are no longer used because the major browsers have dropped support for them." → "applets are hardly used any more because the major browsers have dropped support for them." |
| L2 | LOW **建議修** | `terms[2](Java).hook_zh` / `hook_en` (+ 派生 `memory_hook_zh/en`、`summary.memory_hooks_zh/en` の該当要素) | jp は「ジャワ島にちなむとされ、ロゴもコーヒーカップ」と並列だが、zh「所以」・en "which is why" が因果を足し、en は "steaming" も足す (三語の事実差。loc-review r1 LOW 未反映) | zh「据说名字取自咖啡产地爪哇岛，所以它的标志也是一只咖啡杯。」→「据说名字取自咖啡产地爪哇岛，它的标志也是一只咖啡杯。」/ en "The name is said to come from Java, the Indonesian island famous for coffee, which is why its logo is a steaming coffee cup." → "The name is said to come from Java, the Indonesian island famous for coffee, and its logo is a coffee cup." |
| L3 | LOW | `terms[1].one_zh` / `overview_rows[1].extra_zh[0]` / `key_points_zh[3]` | 「科学技术计算」は日本語の字面写し (loc-review r1 LOW 未反映)。意味は通じる | 記録のみ (任意: 3 欄の「科学技术计算」→「科学与工程计算」) |
| L4 | LOW | `pairs[1].rows[2].label_zh` | 「开发者」は個人を指しやすく、会社名の行の見出しに少し合わない (loc-review r1 LOW 未反映) | 記録のみ (任意: 「开发者」→「开发公司」) |
| L5 | LOW | `terms[4](Python).hook_en` | 末尾 ", not the snake" は jp / zh に無い付加 (loc-review r1 LOW 未反映、誤りではない) | 記録のみ |
| L6 | LOW | `terms[3](C++).one_jp/zh/en` | 「クラス」が単元内で未定義 (jp-review r2 LOW 未反映) | 記録のみ |
| L7 | LOW | `terms[6](R).analogy_jp/zh/en` | 「統計の計算とグラフ作りに特化した関数電卓」は one の言い換えに近い (D-203 §6、jp-review r2 LOW 未反映) | 記録のみ |
| L8 | LOW | `terms[0].points[0]`・`terms[1].points[0]`・`key_points_*[0]`・総表 / `terms[2].points[0]`・`one`・`key_points_*[1]` | 「コンパイラで機械語に翻訳してから実行」「JVM の上で動くので作り直さない」が 4〜5 欄で反復 (D-203 §9、前段 LOW 未反映) | 記録のみ |
| L9 | LOW | `terms[6](R).hook_jp/zh/en` | hook「前身の S」と detail「S 言語の流れをくむ」の呼び方の差 (R は S の実装系で、厳密な前身ではない)。措辞級 | 記録のみ |
| L10 | LOW | `terms[5](JavaScript)` | hook フィールドが無い (7 用語中 6 用語に hook)。validate は通る | 記録のみ |
| L11 | LOW | `terms[5].points[1].text_jp/zh/en` | 末尾「名前は似ていても系統の違う別の言語」は 2024r06-q088 誤答エを打ち消す向き。mix で qid なし、両側を正の定義で述べ D-209 で非該当 (jp-review r2 と同判断) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① C = 手続き型 / C++ = オブジェクト指向も: `pairs[0].rows[0..1]`、`terms[3].points[0]` (mix)、C++ one (定義そのもの) → 上限内。② Java = JVM / JavaScript = ブラウザのエンジン: `pairs[1].rows[0..1]`、`terms[5].points[1]` (mix)、`goals_jp[1]` (予告) → 上限内。③ Python = 汎用 / R = 統計: `pairs[2].rows[0..1]`、`terms[6].points[0]` (mix) → 上限内。

**前段審査の指摘の解消状況**:
- jp-review r1 MEDIUM (2012h24h-q055 を Python / JavaScript の quiz から外す) → **解消** (両 quiz と challenge に無し)。退行なし。
- jp-review r1 LOW: pairs[0]「動かし方」同値行 → 解消 / アプレットの時制 → 解消 (ただし言い過ぎ → L1) / R detail のインタプリタ → 解消 / Java 考点の one 言い直し 2 文目 → 解消 / 反復 → 未 (L8) / 用語定義前の使用 → 冒頭予告として許容のまま。
- jp-review r2 LOW: L6・L7・L8・L11 として残存 (記録のみ)。
- loc-review r1 LOW 4 件: 全て未反映 → L2 (建議修)・L3・L4・L5。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 2013h25a-q055 (インタプリタ / コンパイラの図の穴埋め) は `source_figures` に残るが v1 の challenge から外れた。C detail (コンパイラ) と Python detail (インタプリタ = 1 文ずつ解釈しながら実行) で解け、本文と矛盾しない。
- O2 `unit_summary_*` は v1 と同文 (未改稿)。
- O3 独立 copy 照合の近似 2 件は偽陽性 (§1-4)。

確認済みで問題なし: 限定条件 (exam 考点 5 件全て保持、q088 の「など」は開いたまま)、§9 禁止句 (定型締め句 0)、framing 0/0/0、全称・排他語 0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤80 字)、図の文字列の写し (validate 0、独立照合 0)、`[[jp:]]` 原語 7 種全て実在、zh 訳語 0 warn、図種 (flow steps ×1 = 登録内)、用語・`term_zh`・`term_en` の v1 不変量、u02 / 14-37-u01 との整合。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **2** (M1 コンパイラ定義と Java の欄の不整合 / M2 総表 Java「業務システム」が引用題の誤答肢を指す) |
| LOW | **11** (建議修 2: L1・L2 / 記録のみ 9: L3〜L11) |

## 5. 判定

**FAIL → B3 補丁で解消可** (D-199: MEDIUM 2 件のため PASS ではない)。HIGH は 0。全 7 用語・考点 8 件 (exam 5 + mix 3)・引用 6 題 + quiz / challenge で、考点の主張は正答と一致し、限定条件の落ちも誤答肢を支持する考点も無い。M1 (`terms[0].detail_*` の括弧注) と M2 (`overview_rows[2].extra_*[0]`) は各 1 欄内の文字列置換で直り、L1・L2 を同時に当てることを推奨。補丁後は validate / parity の再実行で足りる (構造変更なし)。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-38-u01
✓ technology-14-38-u01 unit: 0 issues (data/ip/textbook/units/technology-14-38-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-14-38-u01
✓ technology-14-38-u01 parity: 28 locations, 0 diff
EXIT=0
$ node scripts/textbook-v2-zh-terms.mjs --check-units | grep 14-38-u01
✓ technology-14-38-u01: 0 zh-term warning(s)
```
