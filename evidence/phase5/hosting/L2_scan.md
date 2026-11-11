# L2 三言語混入走査 (読み取り専用)

- 生成: `node scripts/lang-leak-scan.ts` (2026-11-11T06:34:27.275Z)、全件 = `L2_scan.json` (4034 件)
- 規則と除外の定義 = `scripts/lib/lang-leak.ts`、対象と欄の認識方法 = `scripts/lang-leak-scan.ts` 冒頭

## 件数 (規則 × 対象、content / derived / ja-only)

- content = derived でも ja-only でもない言語欄 (表示されるかどうかは本走査では確かめていない)。
- derived = v1 互換欄 (terms[].definition / explanation / memory_hook、overview.intro、summary.key_points / memory_hooks)。merge が新欄から `compatText` で派生し、validateV2 の `compat` が派生値との一致を検査する。`compatText` は `[[jp:X]]` を「（X）」/「 (X)」に展開するので、注記の中の日本語が印なしで残り、ここに当たる。glossary / TodayTerms がこの欄を表示する (S154 C17 の記録)。
- ja-only = 兄弟言語の無い欄 (questions.json の IPA 原文 stem_jp / choices_jp / source_label、unit_index の rationale_jp 等、解説の key_guard.note_jp)。`key_guard.note_jp` は web が読まない (`apps/web/src/lib/quiz/quizModel.ts` が使うのは key_guard.suspect だけ)。

| rule | textbook-units | textbook-index | quiz-questions | quiz-translations | quiz-explanations | ui-messages |
| --- | --- | --- | --- | --- | --- | --- |
| R-zh-kana | 134 / 1331 / 0 | 4 / 0 / 0 | 0 / 0 / 0 | 59 / 0 / 0 | 147 / 0 / 0 | 14 / 0 / 0 |
| R-en-cjk | 115 / 2013 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 24 / 0 / 0 | 51 / 0 / 0 | 20 / 0 / 0 |
| R-ja-simp | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 50 | 0 / 0 / 0 |
| R-ja-latin-run | 1 / 4 / 0 | 0 / 0 / 0 | 0 / 0 / 9 | 9 / 0 / 0 | 14 / 0 / 21 | 0 / 0 / 0 |
| R-empty | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| R-same | 3 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 9 / 0 / 0 | 0 / 0 / 0 | 2 / 0 / 0 |

### 副分類

| rule subtag | 件数 |
| --- | --- |
| R-en-cjk punct-only | 31 |
| R-zh-kana punct-only | 255 |

punct-only = 当たりの字が ・ (U+30FB) / ー (U+30FC) だけ。missing = その言語のキー自体が無い、blank = 空文字・空白のみ。

## パターン別の上位 (content、punct-only を除く、規則ごとに 8 件)

| rule | 対象 | パターン | lang | 件数 |
| --- | --- | --- | --- | --- |
| R-zh-kana | textbook-units | `terms[].hook` | zh | 34 |
| R-zh-kana | quiz-explanations | `questions.<qid>.distractors.<ch>` | zh | 21 |
| R-zh-kana | quiz-explanations | `questions.<qid>.correct` | zh | 16 |
| R-zh-kana | quiz-translations | `questions.<qid>.stem` | zh | 14 |
| R-zh-kana | quiz-explanations | `questions.<qid>.points[]` | zh | 10 |
| R-zh-kana | quiz-translations | `questions.<qid>.choices.<ch>` | zh | 8 |
| R-zh-kana | textbook-units | `terms[].detail` | zh | 2 |
| R-zh-kana | textbook-units | `terms[].one` | zh | 2 |
| R-en-cjk | textbook-units | `terms[].hook` | en | 75 |
| R-en-cjk | quiz-explanations | `questions.<qid>.distractors.<ch>` | en | 25 |
| R-en-cjk | quiz-explanations | `questions.<qid>.correct` | en | 16 |
| R-en-cjk | quiz-translations | `questions.<qid>.stem` | en | 11 |
| R-en-cjk | quiz-translations | `questions.<qid>.choices.<ch>` | en | 11 |
| R-en-cjk | quiz-explanations | `questions.<qid>.points[]` | en | 7 |
| R-en-cjk | textbook-units | `terms[].detail` | en | 5 |
| R-en-cjk | textbook-units | `pairs[].rows[].a` | en | 2 |
| R-ja-latin-run | quiz-translations | `questions.<qid>.stem` | ja | 9 |
| R-ja-latin-run | quiz-explanations | `questions.<qid>.distractors.<ch>` | ja | 8 |
| R-ja-latin-run | quiz-explanations | `questions.<qid>.correct` | ja | 6 |
| R-ja-latin-run | textbook-units | `terms[].detail` | ja | 1 |
| R-same | quiz-translations | `questions.<qid>.choices.<ch>` | zh | 9 |
| R-same | textbook-units | `terms[].fig.data.rows[].cells[]` | zh | 2 |
| R-same | textbook-units | `terms[].fig.data.cols[]` | zh | 1 |
| R-same | ui-messages | `App.siteName` | zh | 1 |
| R-same | ui-messages | `App.siteName` | en | 1 |

## 走査した欄の数

| 対象 | 言語 | tag | 欄数 |
| --- | --- | --- | --- |
| quiz-explanations | en | content | 17420 |
| quiz-explanations | ja | content | 17420 |
| quiz-explanations | ja | ja-only | 3579 |
| quiz-explanations | zh | content | 17420 |
| quiz-questions | ja | ja-only | 17400 |
| quiz-translations | en | content | 14500 |
| quiz-translations | ja | content | 1702 |
| quiz-translations | zh | content | 14500 |
| textbook-index | en | content | 370 |
| textbook-index | ja | content | 370 |
| textbook-index | ja | ja-only | 2094 |
| textbook-index | zh | content | 370 |
| textbook-units | en | content | 27067 |
| textbook-units | en | derived | 6726 |
| textbook-units | ja | content | 27067 |
| textbook-units | ja | derived | 6726 |
| textbook-units | zh | content | 27067 |
| textbook-units | zh | derived | 6726 |
| ui-messages | en | content | 455 |
| ui-messages | ja | content | 455 |
| ui-messages | zh | content | 455 |

## 除外 (許容) の大きさ

| 対象 | 規則 | [[jp:…]] 内でその規則の字種に当たる字数 | その字を含む欄 | 単独の選択肢記号 ア〜エ (個数) |
| --- | --- | --- | --- | --- |
| textbook-units | R-zh-kana | 18196 | 2403 | 0 |
| textbook-units | R-en-cjk | 28539 | 3531 | 0 |
| textbook-index | R-zh-kana | 0 | 0 | 0 |
| textbook-index | R-en-cjk | 0 | 0 | 0 |
| quiz-questions | R-zh-kana | 0 | 0 | 0 |
| quiz-questions | R-en-cjk | 0 | 0 | 0 |
| quiz-translations | R-zh-kana | 0 | 0 | 65 |
| quiz-translations | R-en-cjk | 0 | 0 | 57 |
| quiz-explanations | R-zh-kana | 0 | 0 | 4477 |
| quiz-explanations | R-en-cjk | 0 | 0 | 4463 |
| ui-messages | R-zh-kana | 0 | 0 | 0 |
| ui-messages | R-en-cjk | 0 | 0 | 0 |

R-same の除外 (ja が同一だが仮名・漢字を含まない = コード・数字・URL・ASCII のみ): textbook-units 86、textbook-index 0、quiz-questions 0、quiz-translations 201、quiz-explanations 0、ui-messages 6


- `[[jp:…]]` の中は R-zh-kana (仮名) / R-en-cjk (漢字・仮名) の対象外。ー もこの中に限り対象外。字数は規則ごとに、その規則の字種で数えた。
- **指示書からの拡張**: 前後に (・ 以外の) 仮名の無い ア / イ / ウ / エ (「选项ウ」「Choice ウ」「ア・ウ」) は選択肢記号として対象外にし、個数だけ数えた。quiz の sidecar には `[[jp:` が 1 件も無いため、この除外が無いと解説の zh / en がほぼ全件当たる。**過剰な許容**: 選択肢の引用でない単独の ア〜エ も通る (例: 2011h23a-q073 の LIKE パターン "%イ%ン_" の イ。この欄は ン で当たっている)。
- R-same は ja 側に仮名・漢字が無い文字列 (コード・数字・URL・ASCII のみ) を対象外とし、件数だけ数えた。

## 例 (規則ごとに最大 10 件、content 優先・punct-only は後回し・対象を巡回)

### R-zh-kana

| file | path | lang | tag | chars | excerpt |
| --- | --- | --- | --- | --- | --- |
| data/ip/textbook/units/management-09-26-u01.json | `terms[1].hook_zh` | zh | content | カプセル | 封装在日语里叫“カプセル化”（胶囊化）：就像药品胶囊一样，把内容物包在外壳里… |
| data/ip/textbook/unit_index.json | `topics[1].units[1].title_zh` | zh | content punct-only | ・ | 原因分析・管理・系统的结构化图表 |
| data/ip/quiz/translations/2009h21a.json | `questions.2009h21a-q093.stem.zh` | zh | content | あいうえおかきくけこ | … \| 销售构成比率累计（％） \| 等级 \|⏎\| 2 \| 商品あ \| 1,730 \| \| \| 30.8 \| 120 \| 1… |
| data/ip/quiz/explanations/2009h21a.json | `questions.2009h21a-q019.points[0].zh` | zh | content | フレーム | 共通框架（共通フレーム）的工序顺序: 规划（系统化构想、系统化计划）→ 需… |
| apps/web/messages/zh.json | `App.siteName` | zh | content | パスポートノ | ITパスポート 過去問ノート |
| data/ip/textbook/units/management-11-29-u03.json | `terms[2].hook_zh` | zh | content | リース | 日语里“リリース”是“放出”，“展開”是“铺开”。可以用动作来记：把… |
| data/ip/textbook/unit_index.json | `topics[11].units[1].title_zh` | zh | content punct-only | ・ | 质量与流程改进的管理技法（TQC・TQM・六西格玛・TOC） |
| data/ip/quiz/translations/2009h21a.json | `questions.2009h21a-q094.stem.zh` | zh | content | あいうえおかきくけこ | … \| 销售构成比率累计（％） \| 等级 \|⏎\| 2 \| 商品あ \| 1,730 \| \| \| 30.8 \| 120 \| 1… |
| data/ip/quiz/explanations/2009h21a.json | `questions.2009h21a-q093.correct.zh` | zh | content | あ | …列D是销售毛利，列E是销售毛利率（％），所以在求第2行（商品あ）销售毛利率的单元格E2中应输入「D2/B2」。按题目给出… |
| apps/web/messages/zh.json | `Practice.pointsTitle` | zh | content | こがポイント | ここがポイント |

### R-en-cjk

| file | path | lang | tag | chars | excerpt |
| --- | --- | --- | --- | --- | --- |
| data/ip/textbook/units/management-08-25-u05.json | `terms[1].hook_en` | en | content | 類推 | In the Japanese name, 類 means "similar" and 推 means … |
| data/ip/quiz/translations/2009h21a.json | `questions.2009h21a-q093.stem.en` | en | content | あいうえおかきくけこ | …io (%) \| Rank \|⏎\| 2 \| Product あ \| 1,730 \| \| \| 30.8 \| 120 \| 1… |
| data/ip/quiz/explanations/2009h21a.json | `questions.2009h21a-q093.correct.en` | en | content | あ | …fit margin for row 2 (Product あ), should contain “D2/B2”. As… |
| apps/web/messages/en.json | `App.siteName` | en | content | パスポート過去問ノ | ITパスポート 過去問ノート |
| data/ip/textbook/units/strategy-01-01-u01.json | `terms[0].hook_en` | en | content | 理念 | In the Japanese term, 理 means a guiding path and 念 m… |
| data/ip/quiz/translations/2009h21a.json | `questions.2009h21a-q094.stem.en` | en | content | あいうえおかきくけこ | …io (%) \| Rank \|⏎\| 2 \| Product あ \| 1,730 \| \| \| 30.8 \| 120 \| 1… |
| data/ip/quiz/explanations/2009h21a.json | `questions.2009h21a-q093.distractors.ウ.en` | en | content | あ | …e gross profit amount Product あ would earn if its margin equ… |
| apps/web/messages/en.json | `Today.colStars` | en | content | 頻出度 | 頻出度 |
| data/ip/textbook/units/strategy-01-01-u01.json | `terms[6].hook_en` | en | content | 費人件本的資 | …panese wording moves from the 費 (expense) in 人件費, personnel … |
| data/ip/quiz/translations/2009h21a.json | `questions.2009h21a-q094.choices.ア.en` | en | content | え | Product え earns profit through low-mar… |

### R-ja-simp

| file | path | lang | tag | chars | excerpt |
| --- | --- | --- | --- | --- | --- |
| data/ip/quiz/explanations/2009h21a.json | `questions.2009h21a-q009.key_guard.note_jp` | ja | ja-only | 务 | …ge-05 の jp 選択肢ウ「職能別組織」を zh が「职务制组织」(職務・役職) と訳していたのを、corpus の… |
| data/ip/quiz/explanations/2009h21a.json | `questions.2009h21a-q071.key_guard.note_jp` | ja | ja-only | 发 | …件ある**」と具体に指摘した (『同报投递』← disk『群发同一内容』/ 読点挿入で連体修飾が切断され『的』が二重積層… |
| data/ip/quiz/explanations/2009h21a.json | `questions.2009h21a-q086.key_guard.note_jp` | ja | ja-only | 统 | …-175: zh 訳語を dual system = 双重系统 / duplex system = 双工系统 に統一 (… |
| data/ip/quiz/explanations/2009h21a.json | `questions.2009h21a-q098.key_guard.note_jp` | ja | ja-only | 业务对 | …の jp「取引先」の zh / en 訳語が中問C の中で 业务往来方・客户・交易方 / business partne… |
| data/ip/quiz/explanations/2009h21a.json | `questions.2009h21a-q099.key_guard.note_jp` | ja | ja-only | 对 | …jp「取引先」の zh / en 訳語を中問C の中で「交易对象」/ "business partner" に統一（選択… |
| data/ip/quiz/explanations/2009h21a.json | `questions.2009h21a-q100.key_guard.note_jp` | ja | ja-only | 对码 | …取引先コード」の zh / en 訳語を中問C の中で「交易对象代码」/ "Business partner code"… |
| data/ip/quiz/explanations/2009h21h.json | `questions.2009h21h-q076.key_guard.note_jp` | ja | ja-only | 开发 | … と「習得」= 技能の獲得 は語義が異なる)。zh「熟练掌握开发方法」/ en "Gaining proficiency… |
| data/ip/quiz/explanations/2009h21h.json | `questions.2009h21h-q098.key_guard.note_jp` | ja | ja-only | 业务 | …3 の jp 題幹「通販業務」を zh がこの段落だけ「网购业务」(オンライン購入) と訳し、前文の「邮购业务」と別業務… |
| data/ip/quiz/explanations/2010h22a.json | `questions.2010h22a-q025.key_guard.note_jp` | ja | ja-only | 识 | …た知識や情報」 と推定される (zh 訳 「数据库上积累的知识和信息」、en 訳 accumulated in data… |
| data/ip/quiz/explanations/2010h22a.json | `questions.2010h22a-q025.key_guard.round1.note_jp` | ja | ja-only | 识 | …た知識や情報」 と推定される (zh 訳 「数据库上积累的知识和信息」、en 訳 accumulated in data… |

### R-ja-latin-run (低信頼)

| file | path | lang | tag | chars | excerpt |
| --- | --- | --- | --- | --- | --- |
| data/ip/textbook/units/technology-23-62-u06.json | `terms[6].detail_jp` | ja | content | Cyber Rescue and Advice Team against tar | …言い表したのがサイバーレスキュー隊という関係にある。正式名 Cyber Rescue and Advice Team a… |
| data/ip/quiz/translations/2010h22a.json | `questions.2010h22a-q082.stem_jp_clean` | ja | content | a, b, c, d, e, f | a, b, c, d, e, f の6文字すべてを任意の順で… |
| data/ip/quiz/explanations/2009h21a.json | `questions.2009h21a-q077.distractors.ウ.jp` | ja | content | High bit rate Digital Subscriber Line | HDSL (High bit rate Digital Subscrib… |
| data/ip/quiz/translations/2010h22h.json | `questions.2010h22h-q070.stem_jp_clean` | ja | content | AB, AC, AD, BC, BD, CD | …なる。例えば A～D の 4 人が相互に通信を行う場合は, AB, AC, AD, BC, BD, CD の組合せの 6… |
| data/ip/quiz/explanations/2009h21h.json | `questions.2009h21h-q085.correct.jp` | ja | content | A,B,C,D,B,A,E,A,B,F | …t Recently Used) 方式そのものです。参照列 A,B,C,D,B,A,E,A,B,F を順に追うと次のよう… |
| data/ip/quiz/translations/2011h23a.json | `questions.2011h23a-q089.stem_jp_clean` | ja | content | w,w,b,b,b,w,w,w,b,w,w,w,b,w,w,b,w,w,w,b, | …のとおりになり，文字数はコンマを含めて 97 文字になる。⏎w,w,b,b,b,w,w,w,b,w,w,w,b,w,w,… |
| data/ip/quiz/explanations/2010h22h.json | `questions.2010h22h-q070.correct.jp` | ja | content | AB, AC, AD, BC, BD, CD | …で検算すると 4×3÷2 = 6 個となり、図に描かれた線（AB, AC, AD, BC, BD, CD）の 6 本と一… |
| data/ip/quiz/translations/2011h23a.json | `questions.2011h23a-q090.stem_jp_clean` | ja | content | w,w,b,b,b,w,w,w,b,w,w,w,b,w,w,b,w,w,w,b, | …のとおりになり，文字数はコンマを含めて 97 文字になる。⏎w,w,b,b,b,w,w,w,b,w,w,w,b,w,w,… |
| data/ip/quiz/explanations/2011h23a.json | `questions.2011h23a-q089.correct.jp` | ja | content | w,b,w,w,w,b,w | …ょうど 3 行目である。したがって求める画像は「3 行目が w,b,w,w,w,b,w」、すなわち□■□□□■□で 2 … |
| data/ip/quiz/translations/2011h23a.json | `questions.2011h23a-q091.stem_jp_clean` | ja | content | w,w,b,b,b,w,w,w,b,w,w,w,b,w,w,b,w,w,w,b, | …のとおりになり，文字数はコンマを含めて 97 文字になる。⏎w,w,b,b,b,w,w,w,b,w,w,w,b,w,w,… |

### R-empty

(0 件)

### R-same

| file | path | lang | tag | chars | excerpt |
| --- | --- | --- | --- | --- | --- |
| data/ip/textbook/units/management-08-25-u01.json | `terms[2].fig.data.cols[0].zh` | zh | content |  | 特性 (JIS X 25010:2013) |
| data/ip/quiz/translations/2016h28h.json | `questions.2016h28h-q080.choices.ア.zh` | zh | content |  | IF(A2≧3000, 整数部(A2*3/100),⏎   … |
| apps/web/messages/zh.json | `App.siteName` | zh | content |  | ITパスポート 過去問ノート |
| data/ip/textbook/units/technology-14-37-u01.json | `terms[5].fig.data.rows[1].cells[0].zh` | zh | content |  | if (条件) … else … endif |
| data/ip/quiz/translations/2016h28h.json | `questions.2016h28h-q080.choices.イ.zh` | zh | content |  | IF(A2＞3000, 整数部(A2*3/100),⏎   … |
| apps/web/messages/en.json | `App.siteName` | en | content |  | ITパスポート 過去問ノート |
| data/ip/textbook/units/technology-14-37-u01.json | `terms[5].fig.data.rows[2].cells[0].zh` | zh | content |  | while (条件) … endwhile |
| data/ip/quiz/translations/2016h28h.json | `questions.2016h28h-q080.choices.ウ.zh` | zh | content |  | IF(A2≦1000, 整数部(A2/100),⏎     … |
| data/ip/quiz/translations/2016h28h.json | `questions.2016h28h-q080.choices.エ.zh` | zh | content |  | IF(A2＜1000, 整数部(A2/100),⏎     … |
| data/ip/quiz/translations/2018h30h.json | `questions.2018h30h-q060.choices.ア.zh` | zh | content |  | IF($C2＜平均(C2：E2)，'○'，'×') |

## 走査しなかった文字列欄 (言語の印が無い、パターン別)

| 対象 パターン | 件数 |
| --- | --- |
| `quiz-explanations questions.<qid>.key_guard.derived_answer` | 2900 |
| `textbook-units terms[].points[].qids[]` | 2452 |
| `textbook-units terms[].points[].kind` | 2246 |
| `textbook-units terms[].quiz[]` | 1823 |
| `textbook-units terms[].inline_quiz[]` | 1823 |
| `textbook-units terms[].fig.data.nodes[].id` | 1740 |
| `textbook-units overview_rows[].term` | 1417 |
| `textbook-index topics[].units[].terms[].term` | 1417 |
| `textbook-units challenge_questions[]` | 989 |
| `textbook-units terms[].fig.kind` | 856 |
| `textbook-units terms[].fig.mode` | 856 |
| `quiz-explanations questions.<qid>.key_guard.round1.derived_answer` | 679 |
| `textbook-units pairs[].a` | 485 |
| `textbook-units pairs[].b` | 485 |
| `textbook-units source_figures[].source` | 423 |
| `textbook-units source_figures[].question_id` | 423 |
| `textbook-units source_figures[].figure_path` | 423 |
| `textbook-units source_figures[].figure_type` | 412 |
| `textbook-units terms[].fig.data.root.children[].id` | 329 |
| `textbook-units source_figures[].figure_description` | 257 |
| `textbook-units schema_version` | 244 |
| `textbook-units unit_id` | 244 |
| `textbook-units topic_id` | 244 |
| `textbook-units category` | 244 |
| `textbook-units overview.freq_badge` | 244 |
| `textbook-index topics[].unit_order[]` | 244 |
| `textbook-index topics[].units[].unit_id` | 244 |
| `textbook-index topics[].units[].topic_id` | 244 |
| `textbook-index topics[].units[].node_freq_badge` | 244 |
| `textbook-units prerequisites[]` | 208 |
| `textbook-units terms[].fig.data.root.children[].children[].id` | 208 |
| `textbook-index topics[].units[].prerequisites[]` | 208 |
| `textbook-units terms[].fig.data.root.id` | 110 |
| `textbook-index topics[].rule_d.history[].verdict` | 107 |
| `textbook-index topics[].topic_id` | 63 |
| `textbook-index topics[].category` | 63 |
| `textbook-index topics[].node_frequency.badge` | 63 |
| `textbook-index topics[].rule_d.verdict` | 63 |
| `textbook-units source_figures[].group_id` | 57 |
| `textbook-units terms[].fig.data.path` | 50 |
| `textbook-units terms[].figure.mermaid` | 50 |
| `textbook-units terms[].figure.svg_path` | 50 |
| `textbook-index topics[].structural_check.size_outliers[].unit_id` | 40 |
| `textbook-units terms[].fig.data.acts[].from` | 12 |
| `textbook-units terms[].fig.data.acts[].to` | 12 |
| `textbook-units terms[].fig.data.nodes[]` | 10 |
| `textbook-units terms[].fig.data.acts[].name` | 10 |
| `textbook-units terms[].fig.data.root.children[].children[].children[].id` | 8 |
| `textbook-index decisions[]` | 5 |
| `textbook-index schema_version` | 1 |
| `textbook-index generated_at` | 1 |
| `textbook-index scope` | 1 |

- `lang_status.{jp,zh,en}` は状態値であり本文ではないので対象外。
- quiz-questions と quiz-translations は欄を明示して走査したので、この表に出ない。走査しなかった欄: questions.json の id / exam_id / topic_id / category / correct_answer / figure / figure_type / terms[] / choice_figures、sidecar 最上位の schema_version / exam_id / source_note。

## 限界

- 文字種の規則は、zh 欄に漢字だけで書かれた日本語の文、ja 欄に簡体字表に無い字だけで書かれた中国語の文を見分けられない (ja と zh が共に漢字だけの文)。この穴は本走査ではなく **L3 の無作為抽出の通読** (当たり以外から 60 欄、各言語 20) が受け持つ。
- R-ja-simp の表は保守的 (Shift_JIS 外かつ IPA 原文に出ない字のみ)。表に無い簡体字 (例: 个・么・吗 など) を含む中国語は見えない。
- R-ja-latin-run は英単語 6 語以上の連なり。疑似言語・英文の固有名・規格名でも当たる (低信頼)。
- 当たりは混入の候補であり、内容が誤りだとは言っていない。分類 (本当の混入 / 正当な混在) は L3。

