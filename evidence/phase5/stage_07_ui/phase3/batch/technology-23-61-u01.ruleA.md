# Rule A 全数抽検 — technology-23-61-u01 (情報セキュリティの基礎と守るべき情報資産)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成。補丁案の試験は scratchpad の複製で実施)。
- **Date**: 2026-11-05 (S142 第 14 批 b14)、repo HEAD `74b12fb1` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b14-u01-a2` merge 結果、`merged.json` と同一 [cmp 一致]、sha256 先頭 `2027ecfe9e1778b3`)。attempt 2 = a1 の `jp.r1` (sha `061996d8…`) + a1 jp-review #2 を種とした seeded run (D-201 §0-2)。a1 は `failures/phase5/stage_07_ui/phase3/batch/technology-23-61-u01_attempt_1.md` に archive 済み。
- **対象**: `data/ip/textbook/units/technology-23-61-u01.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (サイバー空間 / サイバー攻撃 / 情報資産 / 漏えい / 紛失 / 破損 / クラッキング) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 (one_zh / one_en の `[[jp:]]` 見出し語、書き方 7・8・9)、D-203 (観点 8 対比反復・§6 比喩が定義の言い換え・§9 言い直し = low、観点 7 = medium [事実誤りなら high]、観点 9 限定条件落ち = high)、D-204 (比喩・hook の像が考点・detail の否定する内容を運ぶ = 観点 7 medium)、D-205 (改正される文書の構成・数・名称は版または「例えば」付き)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `data/ip/textbook/.planning/v2/technology-23-61-u01/v1-original.json` (用語 7 語・`term_zh`・`term_en`・`title_*`・`unit_summary_*` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 0. 前回 attempt / 審査の MEDIUM の解消確認 (回帰なし)

| 出所 | 指摘 (要旨) | 現行の該当欄 | 判定 |
|---|---|---|---|
| a1 jp-review #1 MEDIUM (観点 7) | 要点・目標が「3 つは主に損なわれる性質がそれぞれ異なり、性質で区別できる」と言い切り、破損 = 完全性 + 可用性 (紛失と可用性で重なる) とする総表・detail と不整合 | `goals_jp[1]`「漏えい・紛失・破損の 3 つを、**何が起きる被害かで**区別し、それぞれで**主に**損なわれる性質を言える」(区別の軸 = 起きること、性質は「主に」付きの対応) / `key_points_jp[1]`「漏えいで**主に**…機密性、紛失で**主に**…可用性」/ `key_points_jp[2]`「破損では、ファイルの内容が壊れれば完全性が、機器や媒体が壊れて動かなくなれば可用性が損なわれる」= `terms[5].detail_jp` 1 文目・`overview_rows[5].extra_jp[1]`「完全性・可用性」と同範囲。性質だけで 3 つを区別するとの主張は単元内に無い (grep `それぞれ異なる|性質で区別|基本形` = 0、zh `各不相同` = 0、en `differ… in` = 0)。紛失と破損の可用性の重なりは kp[1]・kp[2] から読み取れる | **解消** |
| a1 jp-review #2 MEDIUM (§9 / §7) | 要点 3 が単元構成の説明 (「本単元では 3 つを扱う」) だけで事実を言わず、目標 2・3 に当たる要点が無い | 構成説明文は削除 (grep `本単元|扱う` = 0、zh `本单元` = 0、en `this unit` = 0)。目標 1 ↔ `key_points_jp[0]` (情報資産を脅威から守る取組み、主な舞台の一つがサイバー空間)、目標 2 ↔ `key_points_jp[1..2]` (被害の形 ↔ 性質の対応)、目標 3 ↔ `key_points_jp[3]` (クラッキング = サイバー攻撃のうち他人のシステムへ不正に侵入して行うもの; `pairs[0].rows[0]`・`terms[6].detail_jp` と同範囲)。要点 4 件 (rules 3〜5 内)、JP 36〜48 字 | **解消** |
| a2 jp-review #1 / loc-review #1 | MEDIUM なし (PASS、low 6 + 4) | low は §3 で継続記録 (L1〜L4 は loc low の未修分) | — |

回帰確認: 改稿で新たに消えた中身・新たな言い切りは無い (§2・§3)。a1 で指摘された漏えい / 紛失の対比の 5 箇所反復は、現行では `pairs[1]` と `terms[4].points[0]` の 2 箇所に収まっている (漏えい detail の「原本が無事でも」、紛失比喩の「拾った人に見られる」は削除済み)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_* / overview.intro_*`) が本体の記法除去版 (`**` 除去、`[[jp:X]]` → X、memory_hooks は「訳語 + 区切り + hook」、intro は goals の連結) であることをスクリプトで確認 (72 件、不一致 0)。
2. **考点 × 引用題 (考点 全 6 件 = exam 4 + mix 2、qid 付き 4 件、引用 qid 4 題、全題 topic `technology-23-61`)**: `data/ip/quiz/questions.json` (+ `translations/<exam>.json` の `stem_jp_clean`) から題文・選択肢・`correct_answer` を再読。manifest `term_questions` と各用語 `quiz` / `inline_quiz` は一致 (サイバー攻撃 2・情報資産 1・クラッキング 1、他 4 用語 0)。
   - 2018h30h-q067 (サイバー攻撃の例でないもの; 正答ア = 廃棄メディアを物理的にあさる行為; 誤答 = 脆弱性を突いた侵入・改ざん / 大量アクセスでサービス停止 / バックドアで遠隔操作 = いずれもサイバー攻撃) → `terms[1].points[0]`「ネットワークやコンピュータを経由して行う攻撃を指し、現物をのぞき見たり持ち去ったりする**だけの**物理的な行為は含まれない」と一致。「だけの」で物理的手段のみの行為に限定しており、誤答肢 (どれもネットワーク経由) を除外しない。誤答ウ (大量アクセス) が侵入を伴わないサイバー攻撃である点は `pairs[0].rows[1].a_jp` と整合。
   - 2022r04-q069 (サイバーキルチェーンの説明; 正答ア = 攻撃段階を偵察・攻撃・目的の実行などの複数フェーズでモデル化; 誤答 = ネットワーク機器の数珠つなぎ / ブロックチェーン / チェーンメール) → `terms[1].points[1]`「下調べから最終的なねらいの達成まで進む流れを、いくつかの段階に分けて表したモデル」と一致。段階数を固定していない (D-205 の姿勢として適切)。
   - 2025r07-q093 (脅威の説明; 正答ウ = 情報資産に損害を与える原因; 誤答ア = 攻撃者が付け込める弱点 [= 脆弱性]、イ・エ = リスクの説明) → `terms[2].points[0]`「脅威は情報資産に損害をもたらすもとになる要因で、攻撃者につけ込まれるシステムの弱点 (脆弱性) とは別物」= 正答と一致、誤答アを明示的に否定。誤答イ・エ (リスク) は述べず支持もしない。
   - 2015h27a-q073 (クラッキングの説明; 正答イ = 悪意をもって不正侵入し盗み見・破壊; 誤答 = 耐久テスト / 機器の設定・保守 / 監査) → `terms[6].one_jp`・`points[0]` と一致。限定条件「悪意をもって」「無断で」保持。
   - mix 2 件 (`terms[4].points[0]` 紛失しただけでは中身を見られたとは限らない・拾った第三者に見られれば漏えいにもつながる / `terms[6].points[1]` ハッキングは悪意を含むとは限らず、悪意ある侵入・破壊を特に指す語がクラッキング) は一般事実として正しい。
3. **quiz / challenge_questions**: quiz 計 4 枠 (上記 4 題)。challenge 4 題 = 2009h21h-q068 / 2010h22a-q075 / 2010h22h-q087 / 2011h23tokubetsu-q075 (v1 の 5 題から 2011h23a-q059 [迷惑メールへの対応] を外したもの)。
   - 2009h21h-q068 (DoS 攻撃のねらい; 正答イ = サービス妨害) → `pairs[0].rows[1].a_jp` (大量の通信でサービスを使えなくする) と `terms[1].detail_jp` (サービスを使えなくする) で解ける。
   - 2010h22a-q075 (偽サイトに誘導して個人情報を盗む行為; 正答ウ = フィッシング) → 誤答アがクラッキング。単元の「他人のシステムへの不正侵入」という定義から、侵入を伴わない誘導型の手口はクラッキングでないと除外できる (矛盾なし)。正答名そのものは単元に無い。
   - 2010h22h-q087 (ソーシャルエンジニアリング) / 2011h23tokubetsu-q075 (キーロガー) → 本文と矛盾しないが、正答の手口は単元で扱わない → L9 (a1・a2 審査の low を継続記録)。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合として単元の JP 文字列 82 本 (派生フィールド・summary・overview 除く) を topic 内全 89 題 (うち `stem_jp_clean` 有り 43 題、無い題は raw `stem_jp`) の題文 + 選択肢と 12 字連続照合 (句読点・記号・空白・記法除去、遮蔽後の実字 6 未満の窓は除外):
   - カタカナ 4 字以上と英数を □ 1 字に遮蔽 → **0 件**
   - 遮蔽なし → **1 件**: `terms[0].one_jp` ↔ 2009h21a-q058 (ワームの題)「インターネットなどのネッ(トワーク)」= 一般的な言い回しで、題の内容 (自己増殖プログラム) と無関係 → 偽陽性。
   - 近似一致 (12 字窓の 1〜2 字置換、遮蔽なし) → **2 件**: `terms[0].one_jp` ↔ 2011h23a-q087 (同じ「…インターネットなどの」の一般句) / `terms[1].points[1].text_jp` ↔ 2022r04-q069 (「サイバーキルチェーンは / の説…」= 用語名 + 助詞のみ。この語は単元の見出し語ではないため validate では遮蔽されないが、用語名は表現ではない) → いずれも偽陽性。
   - 文単位の近似 (Dice ≥ 0.4 または ed ≤ 0.4) → 2 件: `overview_rows[1].one_line_jp` / `pairs[0].rows[0].a_jp` ↔ 2013h25a-q077 (P2P ソフトの定義; Dice 0.44 / 0.42、ed 0.54) = 「ネットワーク…コンピュータ…の総称」という構文の一致のみで内容は別 → 偽陽性 (校正例 HIGH = ed 0.14 / Dice 0.52 の両方に遠い)。
   - 目視の追加照合 (引用題の正答・誤答との最接近): `terms[6].one_jp` ↔ 2015h27a-q073 正答イ (Dice 0.42 / ed 0.55) = クラッキングの標準定義で、共有するのは「悪意・侵入・盗み見・壊す」の自然な語彙と語順のみ、12 字窓 0 → D-198「標準的な定義の一般表現」で写しではない。`terms[2].points[0]` 後半「攻撃者につけ込まれるシステムの弱点」↔ 2025r07-q093 誤答ア (Dice 0.47 / ed 0.43) = 脆弱性の標準定義を「脅威とは別物」と否定する側で使っており、誤答を支持しない。12 字窓 0、ed は校正例から遠い → 写しではない (単元内の最接近として O2 に記録)。
   - カタカナの多い文 (比率 > 15%、24 本) の目視: `overview_rows[1].one_line_jp`・`pairs[0].rows[0].a_jp`・`terms[1].one_jp`・`terms[6].detail_jp`・`terms[2].fig` の葉など → いずれも一般の言い方で、題文の写しではない。
   - (iii) 具体例の流用: 比喩 (通信回線でつながったもう一つの街 / 街の盗み・壊し・営業妨害 / 図書館の財産 / 合鍵で開けた金庫の書類を撮影 / 財布を落とす / ノートに水 / 鍵をこじ開けて家に入る) はいずれも題に無い場面。`terms[1].points[0]` は 2018h30h-q067 の場面 (廃棄メディアをあさる) を使わず「現物をのぞき見る・持ち去る」に一般化。`terms[4].detail_jp` の例 (ノート PC・USB メモリの置き忘れ、保管場所不明) も自作。
5. **D-205**: 改正される文書・法令・規格・知識体系の構成・数・名称の記述は**該当なし**。機密性・完全性・可用性は「3 要素」などの数を言わず個別に定義。サイバーキルチェーンは「いくつかの段階」で段階数を固定しない。`goals_jp[0..1]` の「3 つ」は単元自身の分け方の数で文書の構成ではない。
6. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 2 文 × 7、定義前使用 (脅威 = 情報資産 detail で定義、機密性 = 漏えい detail、可用性 = 紛失 detail、完全性 = 破損 one の括弧注、脆弱性 = 情報資産 points[0] の括弧注、ハッキング = クラッキング points[1] 内で定義、サイバーキルチェーン = points[1] 自身が定義、クラッカー = クラッキング detail; 総表・目標で先に出る 脅威 / 機密性 / 可用性 / 完全性 は L8)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → `freq_badge`「頻出」1 件と、`terms[3].hook_jp`「中身が外へにじみ**出る**イメージで**覚える**」+ 派生 2 件 = 「にじみ出る」は通常の動詞で偽陽性、「〜で覚える」は 7 用語中 1 フックのみの記憶フックの言い方で定型締め句ではない [23-63-u06 は 6 中 4 で初めて記録] → 記録しない。manifest `rules.banned_phrases` (理解しておきましょう / 非常に重要 / 必ず出題 等) と `exam_framing_outside_points` は jp・zh・en とも 0。zh grep (考试 / 选项 / 出题 / 答案 / 被问到 / 必须 / 重要 / 一定要 / 记住) → `terms[3].hook_zh`「记住」+ 派生のみ = 同じ記憶フックで記録しない。en grep (exam / asked / the answer / choice / must / always / important) → "must be protected" ×3 (情報資産の定義、通常用法)・"Examples" (図の root)・"example" (pairs) で偽陽性)、図の型 (情報資産 = tree static のみ、他 6 用語 = 図なし; tree は登録 6 種 [svg / table / compare / flow / tree / network] 内。v1 の SVG 2 枚 [`svg_available`] は不採用 → O3)、pair 配置 (サイバー攻撃 / クラッキング 1 組 = クラッキングの後、漏えい / 紛失 1 組 = 紛失の後、各組 key 行 rows[0] あり)。
7. **D-200**: 考点数 0/2/1/0/1/0/2 (≤3 ✓)、各 JP 文数 1〜2・字数 48〜74 (≤100 ✓、最大はクラッキング `points[1]` の 74 字)。**framing 件数** (validateV2 `pointFraming` を tsx で直接呼び出し、全考点): jp 0 / zh 0 / en 0 (上限 2)。
8. **D-202 / D-203 / D-204 単元全体点検**: 書き方 7 (欄同士の「〜だけ」「〜ではない」「主に」の照合): 漏えい・紛失の detail「〜が損なわれた状態にあたる」は総表の列見出し「**主に**損なわれる性質」・kp[1]「主に」の下で読め、紛失 mix 考点 (漏えいにもつながる) と矛盾しない。破損の one (正しさ「や」使える状態)・detail・総表 (完全性・可用性)・kp[2] は同範囲。kp[0]「主な舞台の**一つ**」は情報資産 detail (紙の書類も対象) と整合。クラッキングの範囲は one・detail・`pairs[0]`・kp[3] で同じ (侵入を伴う、サイバー攻撃の一部)。`goals_jp[0]` の 3 区分と総表「位置づけ」の 4 値 → L10。比喩・hook (D-204): 漏えいの比喩 (金庫の書類を撮影、原本は残る) は `pairs[1].rows[1]` と、破損の比喩 (水で字がにじむ) は完全性側と、紛失の比喩 (財布を落として使えない) は可用性と整合し、否定内容を運ぶものは無い。書き方 8 → §3 末尾の列挙。書き方 9 (限定条件) → 引用 4 題とも保持 (§1-2)。§6 → L6。§9 言い直し → L4・L5。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、図ラベル・総表セル・比較行の三語一致。`[[jp:…]]` 原語 11 種 (サイバー空間 / サイバー攻撃 / サイバーキルチェーン / 情報資産 / 脅威 / 脆弱性 / 漏えい / 紛失 / 破損 / クラッキング / ハッキング) が jp 本文に実在 (スクリプト、11/11)。one_zh / one_en 全 7 用語に見出し語の `[[jp:]]` あり (7/7、D-202)。zh 訳語が `zh_terms.json` (単元抜粋 `zh_terms.unit.json`) に従う: 网络空间 / 网络攻击 / 信息资产 / 泄露 / 丢失 / 损坏 / 破解 / 机密性 / 可用性 / 完整性 / 恶意软件 / 口令 / 文件 / 偷窥 / 组合 / U 盘（USB 闪存盘）/ PC（个人计算机） ✓ (validate B6 warn 0)。現地化の残り → L1〜L3・O1。
10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。建議修 L1・L2・L4 を適用した scratchpad 複製でも validate 0 issues / warn 0、parity 26 locations 0 diff を確認 (L3 を足すと zh-term warn 1 → L3 は記録のみ)。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 / D-205 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | サイバー空間 | OK — 考点なし (term_questions 0)。one (ネットワークでつながった仮想的な活動の空間)・detail (物理的な場所との対比、被害が現実の損害に直結) は一般事実として正しい。hook (cyberspace はギブスンの小説から広まった語) は事実一致 (1982 年の短編で造語、1984 年の長編で普及) | OK (図なし = 定義型) | OK | なし |
| 2 | サイバー攻撃 | OK — exam 2 / 2 題: 物理的手段だけの行為は含まない (2018h30h-q067 正答ア、「だけの」保持、誤答肢を除外しない) / サイバーキルチェーン = 攻撃の進行を段階に分けたモデル (2022r04-q069 正答ア)。detail「マルウェアや不正アクセスはこの総称の下」は正しい | OK | analogy_en の修飾関係 L3 | L3, L6 |
| 3 | 情報資産 | OK — exam 1 / 1 題: 脅威 = 損害のもとになる要因、脆弱性とは別物 (2025r07-q093 正答ウ、誤答ア [弱点] を否定、イ・エ [リスク] は不言及)。tree の 3 葉 (情報そのもの / 媒体・書類 / 機器・ソフトウェア) は one・detail と一致 | OK (tree static、登録内) | zh hook の「」 L2 | L2, L5, L7 |
| 4 | 漏えい | OK — 考点なし。機密性 = 許可された人だけが見られる性質 (標準定義と一致)、コピー・画面の盗み見で起こる | OK | zh hook の「」 L2 | L2 |
| 5 | 紛失 | OK — mix 1: 紛失だけでは中身を見られたとは限らない、拾った第三者に見られれば漏えいにも — 正しい。可用性 = 必要なときに使える性質 (標準定義と一致)。総表は「主に」の列見出しの下で可用性 | OK | zh hook の「」 L2 / detail_zh の PC 訳 L3 | L2, L3 |
| 6 | 破損 | OK — 考点なし。ファイル内容 → 完全性、機器・媒体 → 可用性、どちらかは何がどう壊れたかで決まる — 正しく、kp[2]・総表と同範囲 | OK | zh hook の「」 L2 | L2, O4 |
| 7 | クラッキング | OK — exam 1 / 1 題: 悪意ある無断侵入で盗み見・破壊 (2015h27a-q073 正答イ、限定条件「悪意」「無断」保持) / mix: ハッキングは悪意を含むとは限らない — 正しい。detail の入口 (推測しやすいパスワード・未修正の弱点) は正しい。hook (crack / safecracker) 事実一致 | OK | zh hook の「」 L2 | L2, L4, L5 |

**単元レベル**: goals 3 点・overview_cols 2 (位置づけ / 主に損なわれる性質)・overview_rows 7 行・pairs 2 組 (サイバー攻撃 / クラッキング 2 行 key 1、漏えい / 紛失 2 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 4 件 (§1-3)。事実誤りなし、三語一致 (L1 の英文法を除く)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 10 (うち 建議修 3: L1・L2・L4)** + 範囲外観察 4

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `key_points_en[2]` (+ 派生 `summary.key_points_en[2]`) | "a broken file content harms integrity" は可算・不可算の崩れた非文法的な英語 (loc 審査 #1 の low、未修)。意味は jp と一致 | before: `With **corruption**, a broken file content harms **integrity**, while broken equipment or media that stop working harm **availability**.` → after: `With **corruption**, damaged file content harms **integrity**, while broken equipment or media that stop working harm **availability**.` (jp・zh は変更なし) |
| L2 | LOW **建議修** | `terms[2].hook_zh` / `terms[3].hook_zh` / `terms[4].hook_zh` / `terms[5].hook_zh` / `terms[6].hook_zh` (+ 派生 `memory_hook_zh`、`summary.memory_hooks_zh[1..5]`) | zh 本文で日本式かぎ括弧「」を使用 (loc 審査 #1 の low、未修)。公開済み単元の zh は “” を使う (23-63-u06「0 / “18、strategy-01-03-u06「0 / “16、strategy-01-03-u01「0 / “8) ため表記の不統一 | `terms[2].hook_zh`: `「资产」` → `“资产”` / `terms[3].hook_zh`: `「漏」字` → `“漏”字` / `terms[4].hook_zh`: `「紛」是` → `“紛”是` (日本語の字そのものを示すので 紛 のまま) / `terms[5].hook_zh`: `由「破（破裂）」和「损（损害）」` → `由“破（破裂）”和“损（损害）”` / `terms[6].hook_zh`: `「弄出裂缝、打碎」` → `“弄出裂缝、打碎”` (jp・en は変更なし) |
| L3 | LOW 記録のみ | `terms[4].detail_zh` | 「随身携带的笔记本 PC（个人计算机）」は訳語表 PC → PC（个人计算机） の機械適用で不自然 (大陸では「笔记本电脑」が普通; loc 審査 #1 の low)。ただし「笔记本电脑」に替えると validate の zh-term warn が 1 件出る (scratchpad 複製で確認: `PC → PC（个人计算机） not in the zh text`) ため、warn 0 の慣行を優先して記録のみ | (参考) `笔记本 PC（个人计算机）或` → `笔记本电脑或` — 採る場合は zh-term warn 1 を許容する旨をバッチ証拠に明記 |
| L4 | LOW **建議修** | `terms[1].analogy_en` | "the theft, vandalism, and business disruption in a town that arrive over communication lines" は関係節 that arrive が town に掛かるようにも読め、jp の「通信回線を通って届くもの」の限定が曖昧 (loc 審査 #1 の low、未修) | before: `A single word for the theft, vandalism, and business disruption in a town that arrive over communication lines.` → after: `Of all the theft, vandalism, and business disruption that happen in a town, a single word for the ones that arrive over communication lines.` (jp・zh は変更なし) |
| L5 | LOW 記録のみ | `terms[6].points[0].text_jp/zh/en`、`terms[2].points[0].text_jp/zh/en` 前半 | D-203 §9: クラッキングの exam 考点は one の言い直し、情報資産の考点前半 (脅威の定義) は detail 2 文目の言い直し (a1 #1・#2、a2 #1 の low を継続)。事実は引用題と一致し、情報資産側の新情報 (脆弱性とは別物) は残る | 記録のみ (引用題の判別点を具体化すると正答肢の言い回しに近づくため) |
| L6 | LOW 記録のみ | `terms[1].analogy_jp/zh/en` | D-203 §6: 比喩「街の盗み・壊し・営業妨害のうち通信回線を通って届くもの」は one と points[0] の言い直しに近い (a2 #1 の low)。他欄と矛盾しない | 記録のみ |
| L7 | LOW 記録のみ | `terms[2].fig` (tree static) | D-195 §2: 3 葉は one・detail の列挙とほぼ同じで図としての情報は少ない (例を少し足している; a1 #1・a2 #1 の low) | 記録のみ |
| L8 | LOW 記録のみ | `overview_rows[*].extra_jp[1]` / `goals_jp[0..1]` | 観点 3: 総表・目標で 脅威 / 機密性 / 可用性 / 完全性 を本文での定義より先に使う。総表・目標は冒頭に置く構造 (D-195 §3) で避けにくい (a1・a2 の low) | 記録のみ |
| L9 | LOW 記録のみ | `challenge_questions` | 4 題中 3 題 (フィッシング・ソーシャルエンジニアリング・キーロガー) は正答の手口を単元で扱わない。DoS (2009h21h-q068) は単元で解け、フィッシング題は誤答のクラッキングを単元の定義で除外できる。manifest の候補が topic の個別手口の題に限られるため (a1・a2 の low) | 記録のみ |
| L10 | LOW 記録のみ | `goals_jp[0]` ↔ `overview_rows[*].extra_jp[0]` | 目標 1 は枠組みを「活動の場・守る対象・脅威の 3 つ」に分けるが、総表「位置づけ」列は 4 値 (活動の場 / 脅威 / 守る対象 / 被害の形)。被害の形は守る対象 (情報資産) に起きることで、目標 2 が別に扱うため、枠組みの第 4 の柱とは読めず不整合には当たらない | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① サイバー攻撃 ⊃ クラッキング (総称 / 侵入を伴う一部): `pairs[0].rows[0..1]`、`terms[6].detail_jp` 冒頭「サイバー攻撃のうち、」、`key_points_jp[3]` の 3 箇所 (+ 総表「位置づけ」の括弧 = §3 の構造) → 目安 2 箇所を 1 つ超える (a2 #1 の low)。kp[3] は目標 3 の中身として本タスクで必須、detail 冒頭は用語の位置づけを述べる一文のため、**記録のみ** (L 番号は付けず本列挙で扱う)。② 漏えい / 紛失 (起きること・原本が残るか・紛失から漏えいへ): `pairs[1].rows[0..1]`、`terms[4].points[0]` (mix) の 2 箇所 → 許容 (a1 の 5 箇所反復は解消)。③ 被害の形 ↔ 性質の対応: 総表の列 (D-195 §3 の構造)、漏えい・紛失・破損の detail (各性質を**定義する**場所)、`key_points_jp[1..2]` (目標 2 の要点) → 対比の反復ではなく構造・定義・要点の役割分担で許容。`goals_jp` は観点の予告。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `terms[3].hook_zh`「可以想象里面的东西向外渗出来记住它」はやや硬い zh だが意味は jp と一致 (loc 審査で未指摘)。
- O2 D-198 の最接近: `terms[2].points[0]`「攻撃者につけ込まれるシステムの弱点」↔ 2025r07-q093 誤答ア (Dice 0.47 / ed 0.43)、`terms[6].one_jp` ↔ 2015h27a-q073 正答イ (Dice 0.42 / ed 0.55)。どちらも標準定義の一般表現で 12 字窓 0、校正例 (ed 0.14 / Dice 0.52) から遠い (§1-4)。
- O3 図は 7 用語中 1 (情報資産 tree)。v1 の SVG 2 枚 (`figures/technology-23-61-u01-t01.svg` / `-t02.svg`) は不採用。定義型の用語が主で、§0-8 により図種の欠如は最大 low のため指摘しない。
- O4 `terms[5].term_en` "Corruption" は機器の物理的な故障には狭い英語だが、`term_en` は v1 不変量 (§0-9) で書き直し対象外。本文 (one_en / detail_en) は "breaks" で機器側も正しく述べている。

確認済みで問題なし: 前回 MEDIUM 2 件の解消 (§0)、限定条件 (引用 4 題とも保持、§1-2)、§9 禁止句 grep (定型締め句 0; manifest banned_phrases 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤74 字)、D-198 写し (validate 0、独立照合 遮蔽あり 0 / 遮蔽なし 1・近似 2・文単位 2 は全て偽陽性)、D-205 (該当なし)、`[[jp:]]` 原語 (11 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (7/7)、zh 訳語表 (B6 warn 0)、図種 (tree static ×1 / 図なし ×6 = 登録内)、派生フィールド一致 (72 件)、用語・`term_zh`・`term_en`・`title_*`・`unit_summary_*` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **10** (建議修 3: L1 / L2 / L4、記録のみ 7: L3 / L5〜L10) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 7 用語・考点 6 件 (qid 付き 4 件)・引用 4 題 + challenge 4 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。a1 の MEDIUM 2 件 (性質だけで 3 つを区別するとの言い切り / 構成説明だけの要点) は回帰なく解消し、要点は目標 2 (被害の形 ↔ 性質、破損は完全性・可用性の両方) と目標 3 (サイバー攻撃 ⊃ クラッキング) の中身を持つ。LOW 建議修 3 件 (L1・L2・L4) は補丁 (B3) で修正推奨 (適用後も validate 0 / warn 0、parity 0 diff を scratchpad 複製で確認済み)、L3・L5〜L10 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-61-u01
✓ technology-23-61-u01 unit: 0 issues (data/ip/textbook/units/technology-23-61-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-61-u01
✓ technology-23-61-u01 parity: 26 locations, 0 diff
EXIT=0
```
