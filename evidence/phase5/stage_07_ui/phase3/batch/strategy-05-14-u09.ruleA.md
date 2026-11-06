# Rule A 全数抽検 — strategy-05-14-u09 (AIのリスクと社会的課題)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S148〜149 第 b34 批)、repo HEAD `387e7a33` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b34-u09-a2` (seeded) merge 結果、sha256 先頭 `3337bd3112a024aa`)。journal `data/ip/textbook/.planning/v2/strategy-05-14-u09/journal.b34-u09-a2.jsonl` (JP 審査 PASS low 7、訳審査 PASS low 7)。前回 attempt: `failures/phase5/stage_07_ui/phase3/batch/strategy-05-14-u09_attempt_1.md`。
- **対象**: `data/ip/textbook/units/strategy-05-14-u09.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (アルゴリズムのバイアス / ハルシネーション / ディープフェイク / AIサービスの責任論 / トロッコ問題 / AIサービスのオプトアウトポリシー) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210 / **D-211** (正誤選択型・全項目正解型の一般原則)、`docs/templates/ruleA_unit_audit.md` の既知失敗型 (1)〜(10)。比較: `v1-original.json` (用語 6 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (nodes・steps caption・compare rows・svg 内テキスト)` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.*`) は本体の記法除去版で一致。責任論・トロッコ問題は hook 無し (memory_hook 空)、points 無し (freq 0 語)。
2. **考点 × 引用題** (考点 3 件 = exam 2 + mix 1、qid 付き 2 件 = 異なり 2 題): `data/ip/quiz/questions.json` + `translations/<exam>.json` の stem_jp_clean で再読。
   - 2025r07-q008 (全項目正解型: 学習データの扱いに関する 4 項目 [目的適合の確認・入手元/来歴の確認・目的に合わせた付与作業・人でも同定困難な画像の除外] が全て適切、正答イ)。
   - 2025r07-q010 (用語選択: もっともらしいが事実と異なる出力 = ハルシネーション 正答エ、誤答 = エコーチェンバー / シンギュラリティ / ディープフェイク)。
3. **quiz / challenge_questions**: challenge 3 題 = 2025r07-q008 / 2025r07-q010 / 2026r08-q017。q017 (AI 利活用で留意する事項 3 項目 [意図しない動作による生命・身体への危害 / 判断の差別的内容 / プライバシー侵害の内容] が全て適切、正答イ) は本文未引用だが、バイアス (差別的判断)・オプトアウト (データ利用の懸念)・トロッコ問題 / 責任論 (事故時の判断と責任) と整合し、本文はどの項目も否定しない。ディープフェイクの quiz に q010 (ディープフェイクが誤答肢) を置くのは mix 考点 (意図の有無の対比) と pairs[0] で解けるので可。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合: 単元の JP 文字列 96 本 (派生・summary 除く) × topic `strategy-05-14` 全 39 題の stem_jp_clean + 選択肢を 12 字連続照合 (句読点・記号・空白除去)、カタカナ 4 字以上・英数を □ に遮蔽 → **0 件**、遮蔽なし → **0 件**。近似照合 (12 字窓で 1〜2 字置換) → **1 件**: `terms[0].points[0].text_jp` 冒頭「バイアスの低減とデータ品…」↔ 2025r07-q008 題文「バイアスの低減やデータの…」。文全体では difflib ratio 0.22 / bigram Dice 0.20 (HIGH 較正例 ed 0.14 / Dice 0.52 に遠い)、一致部は題文の主題名 (判断項目・選択肢ではない) → 写しではないが L1 として記録。カタカナの多い文 (ディープフェイク one / オプトアウト fig / ハルシネーション fig) を目視、題文との並びの一致なし。
5. **D-208 既知失敗型**: (1) 選択肢なぞり — q008 考点は 4 項目を列挙も順序再現もせず「学習前のデータの準備全般」と一般化 (D-211 (ii) / D-209 全項目正解型の一般定義側、項目の語句・組・順序の再現なし); key_points[0]「データの集め方や整え方など」も項目の語句・順序を写さない。q010 考点 (中身の誤りを指す語、自然な文は正しさの裏付けにならない) は誤答肢に触れない。ディープフェイク mix 考点は二語対比を両側とも正の定義で述べる (D-209 対比免除、選択肢の組・順序なし)。validate の `choice-echo` warn 出力なし。(2) 「など」落ち — q008 は「など」なし; 本文の「入力データなど」「性別や年齢など」「開発した企業、…利用者など」保持。(3) 別名の別物扱いなし。(4) 比喩・図の範囲: 救命ボート (事前に誰を乗せるか決める) は detail の「事前に決める」と一致、トロッコ svg (切替 → 1 人 / 切替なし → 5 人) は detail と一致。(5) zh / en 後退なし (§2)。(6) zh / en の語が q010 の誤答肢に寄る箇所なし。(7) D-210: 法令・規格の改正前文言を引く題なし。(8) 比喩の鍵語が他の見出し語と衝突しない (見習い・着ぐるみ・回覧板・うろ覚えの道案内)。(9) hook を q010 / q017 の場面に当てても誤答に導かない (ハルシネーション hook「ない事実を語る」→ エ; ディープフェイク hook は作り方 + 偽物で、意図せぬ誤出力を指さない)。(10) 法的カテゴリーの閉じた列挙なし (責任の関係者は「例えば…など」)。
6. **D-195**: one = 1 文 × 6 (太字あり)、detail 2〜3 文、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出題 / 押さえ / 頻出 / 選択肢 / とされる / 挙が → 0; 「出る」10・「選ぶ」4 は「犠牲が出る」「出たい人が出る」「確率で選ぶ」等の通常用法; 「と覚える」1 件 [bias hook] + 派生 2; zh「必须」1 = トロッコ analogy の通常用法)、図種 (flow static ×1 / flow steps ×1 / compare static ×1 / svg static ×1 / 図なし ×2 = 登録内)、pair 配置 (ハルシネーション / ディープフェイク、責任論 / トロッコ問題; 各組 key 行あり)。
7. **D-200**: 考点数 1/1/1/0/0/0 (≤3 ✓)、各 JP 1 文・55 / 59 / 62 字 (≤100 ✓)。framing (POINT_FRAMING 各語の正規表現を全考点に目視適用): jp 0 / zh 0 / en 0。
8. **D-205**: 改訂のある文書 (指針・規格・法令) の項目数・名称の記述なし。
9. **三語**: zh・en が jp と同じ事実 (追加・欠落なし)、図ラベル・compare 行・caption の三語一致 (parity 0 diff)、`[[jp:]]` 原語 (6 見出し語 + バイアス / 生成AI) が jp 本文に実在、one_zh / one_en 全 6 用語に見出し語の `[[jp:]]` あり、zh 訳語が `zh_terms.json` に一致 (算法偏见 / 幻觉 / 深度伪造 / AI 服务的责任论 / 电车难题 / AI 服务的退出政策 / 生成式 AI / 深度学习 / 冒充 / 选择退出（opt-out） / 选择加入（opt-in））。
10. **機械ゲート**: §6。

## 2. 前回 attempt 1 の指摘の解消確認 (三語)

| attempt 1 指摘 | 現状 | 判定 |
|---|---|---|
| challenge に無関係の SFA 題 2015h27h-q013 | `challenge_questions` = 2025r07-q008 / 2025r07-q010 / 2026r08-q017。単元全体に「SFA」0 件。q017 は AI リスク (差別・危害・プライバシー) で単元に合う | 解消 |
| バイアス対策を「点検」に限る (vs 2025r07-q008) | `key_points_jp[0]`「学習に使うデータの集め方や整え方など、学習前のデータの準備全般に及ぶ」/ zh「涉及学习数据的收集方式、整理方式等，覆盖学习前数据准备的全过程」/ en "extend to all data preparation before training, including how training data is collected and cleaned up"; 考点・detail も「準備全般」「集めて整える段階」で範囲一致。「点検」0 件、zh / en に確認作業への限定なし。付与作業・除外 (項目 c・d) を外す限定なし | 解消 |
| トロッコ hook が偽の語義「分かれ目」 | `terms[4]` に hook なし (memory_hook_jp/zh/en 空、summary.memory_hooks にも無し)。「分かれ目」0 件、zh「分岔」・en "fork/junction" 0 件。detail の「暴走するトロッコの進路を切り替える」は設定の説明で語義を述べない | 解消 |
| 2a JP 審査 / 訳審査の low | 全て low (HIGH / MEDIUM なし)、未適用分は §3 で再判定 | — |

## 3. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | アルゴリズムのバイアス | OK — exam 1 / 1 題: 学習前のデータ準備全般が対策の対象 (2025r07-q008 正答イ = 4 項目全て適切 → 「全般」は正解と一致、どの部分集合の誤答肢も支持しない)。題の場面 (機械学習で使うデータの取扱い) 保持。「切り離せない取組み」は題が両者を並べるだけで不可分性までは述べない (誤りではない) | 近似照合 1 件 (L1) | OK | L1 / L5 |
| 2 | ハルシネーション | OK — exam 1 / 1 題: 中身の誤りを指す語・自然な文は正しさの裏付けにならない (2025r07-q010 正答エ; 誤答のディープフェイクを支持しない — 本文は意図の有無で区別)。flow steps 4 は detail と一致 | OK | en 図ラベル主語不揃い (記録のみ) | なし |
| 3 | ディープフェイク | OK — mix: 作り手が承知して作る合成物 vs 生成AIの意図しない誤出力 = 意図の有無 (pairs[0].rows[0] と同じ対比、2 箇所で上限内) | OK | OK | L4 |
| 4 | AIサービスの責任論 | OK — 引用題なし。one は「誰が責任を負うかを問う議論」で特定の者を責任者と断定しない。detail「関わる者が多く、責任の所在が定まりにくい」も断定なし (関係者は例示 + など)。ただし「使った人が責任を負うという従来の考え方」は従来の責任の考え方を使用者だけに寄せた言い方 (製造者側の責任を落とす) | OK | OK | L2 |
| 5 | トロッコ問題 | OK — 引用題なし。one (多数を救うために少数を犠牲にしてよいか)・detail (切替 1 人 / 非切替 5 人、自動運転で事前に決める、唯一の正解なし)・svg (三語は fig 側、svg 内 jp テキスト 5 個が mermaid と一致) は標準の設定どおり。偽の語義 hook は削除済 | OK | OK | なし |
| 6 | AIサービスのオプトアウトポリシー | OK — 引用題なし。範囲: 「利用者が申し出れば」「入力データなど」「AIの学習に使わせない」— 学習利用に限り、サービス利用そのものの停止やデータ削除まで広げない。compare (初期 = 利用する / 拒否を申し出る / 何もしなければ利用が続く) はオプトアウトの定義どおり、オプトインの側も正しい | OK | en "Ask to refuse" 硬い (記録のみ) | L3 (overview) / L6 |

**単元レベル**: goals 3 点・overview_cols 2・overview_rows 6・pairs 2 組 (各 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge 3 題 (§1-3)。pairs[1] (責任論 = 損害時・誰が責任・社会/法の議論 / トロッコ = 判断の仕方を決めるとき・どちらの犠牲・倫理学の思考実験) は両 one / detail と一致。事実誤りなし。

## 4. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 6 (うち 建議修 3)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[0].points[0].text_jp/zh/en` | 冒頭が 2025r07-q008 題文の主題名と 1〜2 字違い (近似照合、Dice 0.20 で写しではない)。加えて「切り離せない」は題が支持しない不可分性の言い切り (JP 審査 #2 low と同旨) | jp「バイアスの低減とデータ品質の確保は切り離せない取組みであり、学習に入る前のデータの準備全般が対策の対象になる。」→「バイアスを抑える対策はデータの質を保つ作業と重なり、学習に入る前のデータの準備全般が対策の対象になる。」/ zh「降低偏见（[[jp:バイアス]]）与确保数据质量是分不开的工作，进入学习之前的整个数据准备过程都属于对策的范围。」→「抑制偏见（[[jp:バイアス]]）的对策与保证数据质量的工作相互重叠，进入学习之前的整个数据准备过程都属于对策的范围。」/ en "Reducing bias ([[jp:バイアス]]) and ensuring data quality go hand in hand, so countermeasures cover all data preparation before training begins." → "Countermeasures against bias ([[jp:バイアス]]) overlap with the work of keeping data quality, so they cover all data preparation before training begins." |
| L2 | LOW **建議修** | `terms[3].detail_jp/zh/en` (+ 派生 explanation_*) | 「使った人が責任を負うという従来の考え方」は従来の責任の考え方を使用者のみとし、作った側 (製造者) の責任を落とす単純化。責任の所在について支持のない断定に近づく (引用題なし、誤答誘導なし) | jp「使った人が責任を負うという従来の考え方」→「道具を使った人や作った人が責任を負うという従来の考え方」/ zh「仅靠“谁使用谁负责”这一传统思路」→「仅靠“由使用或制造工具的人负责”这一传统思路」/ en "the traditional view that whoever used it is responsible" → "the traditional view that whoever used or made the tool is responsible" |
| L3 | LOW **建議修** | `key_points_en[3]` (+ 派生 summary.key_points_en[3]) | debated / debate の重複 (訳審査 low、未適用) | "so who is responsible is debated as the **AI service liability debate**." → "so where responsibility lies is the question taken up by the **AI service liability debate**." |
| L4 | LOW | `terms[2].hook_jp/zh/en` | 「目的」は偽物 (成果物の性質) を指すには緩い (JP 審査 low)。detail の悪用リスクと矛盾はしない | 記録のみ |
| L5 | LOW | `key_points_jp[0]` / `terms[0].detail_jp` / `terms[0].points[0]` | 「学習前のデータ準備が対策」の同義反復 3 箇所 (§9)、bias fig は因果 3 段を静的 flow で表示 | 記録のみ |
| L6 | LOW | `overview_rows[5].extra_jp[0]` (列「論点の種類」) / `terms[5].fig.data.rows[0]・rows[2]` / `rows[1].a.en・b.en` | 列の分類軸が 1 行だけ対処策; オプトインは図だけで定義、行 0 と 2 は同内容; en "Ask to refuse / Ask to allow" が硬い | 記録のみ |

確認済みで問題なし: 限定条件 (考点 3 件保持)、§9 禁止句 (定型締め句 0)、framing 0/0/0、D-197 (validate 0)、D-200、D-205 (該当なし)、D-210 (該当なし)、D-211 (q008 = 一般原則の一般表現、項目再現なし)、図の写し (validate 0、独立照合 0 + 近似 1 = L1)、`[[jp:]]` 原語、one_zh / one_en 見出し語併記 6/6、zh 訳語表、図種登録内、派生フィールド一致、用語・term_zh・term_en の v1 不変量、attempt 1 の 3 指摘解消 (三語)。

## 5. 合計 / 判定

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **6** (建議修 3: L1〜L3 / 記録のみ 3: L4〜L6) |

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-14-u09
✓ strategy-05-14-u09 unit: 0 issues (data/ip/textbook/units/strategy-05-14-u09.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-05-14-u09
✓ strategy-05-14-u09 parity: 28 locations, 0 diff
EXIT=0
```
