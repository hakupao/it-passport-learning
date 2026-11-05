# Rule A 全数抽検 — technology-23-61-u13 (攻撃の準備段階 — 偵察行為)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-05 (S143 b16)、repo HEAD `09cdb2a2` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b16-u13-a1` merge 結果、`merged.json` と同一、sha256 先頭 `7b6b02ee49c528ff`)。
- **対象**: `data/ip/textbook/units/technology-23-61-u13.json` (textbook-unit-v2)、用語 **2 / 2 = 全数** (フットプリンティング / ポートスキャン) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し; (iii) 具体例・選択肢の組の流用、誤答肢の打ち消し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 (one_zh / one_en の `[[jp:]]` 見出し語、書き方 7・8・9)、D-203 (観点 8 対比反復・§6・§9 言い直し = low、観点 7 = medium [事実誤りなら high]、観点 9 限定条件落ち = high)、D-204 (比喩・hook の像が考点・detail の否定する内容を運ぶ = medium)、D-205 (改正される文書の構成・数・名称)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。b14〜b17 で追加された点検: 穴埋め題の埋め題文照合 (b14 u05 H1)、考点が引用題の選択肢の組を再現 / 誤答肢を同順で打ち消す / 誤答の場面を再演して否定する型 (b14 u02 M1 / b15 u07 M1)、シラバス上の別名を別物として教える型 (b15 u10 M1)、比喩・図の範囲が one / detail と食い違う型 (b15 u06 M1)。比較: `data/ip/textbook/.planning/v2/technology-23-61-u13/v1-original.json` (用語 2 語・`term_zh`・`term_en`・`title_*`・`unit_summary_*` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・D-198 (iii) 選択肢の組の流用 / 打ち消し / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 2 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (table cols・cells / flow nodes・steps caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。`summary.memory_hooks_*` は「見出し語: hook」形で一致。
2. **考点 × 引用題** (考点 全 2 件 = exam 1 + mix 1、qid 付き 1 件、引用 qid 1 題): `data/ip/quiz/questions.json` + `translations/2023r05.json` の stem_jp_clean から再読。
   - 2023r05-q073 (侵入後に再び入れるよう細工する手口を指す用語; 正答イ = バックドア; 誤答 = 盗聴 / フィッシング / ポートスキャン) → `terms[1].points[0]` (exam):「ポートスキャンは開いているポートを探る調査であり、侵入後に再び入るための仕掛けを残すバックドアとは別物」。主張は正答と一致 (バックドア = 侵入後の再侵入の仕掛け)、誤答肢 (ポートスキャン) を正答として支持しない。限定条件「侵入した後に」「再び入るための」は題の前提 (侵入後・再侵入のため) を保持。穴埋め題ではない。
   - 本単元の見出し語が q073 では**誤答肢**である点を D-198 (iii) で個別に点検 → §2 #2・L2 (境界、記録のみ)。
   - `terms[0].points[0]` (mix、qid なし):「フットプリンティングは下調べの段階で、それ自体は不正侵入ではない」— 標準的事実、正しい。
   - コーパス全体で見出し語 (フットプリンティング / ポートスキャン) を含む題は q073 の 1 題のみ (全 2900 題の terms・題文・選択肢を検索)。
3. **quiz / challenge_questions**: quiz = `terms[1].quiz` / `inline_quiz` = [2023r05-q073] のみ (フットプリンティングは 0、v1 の 2009h21a-q058 [ワーム] は challenge 側へ移動)。challenge 4 題 = 2010h22h-q087 (利用者を装い管理者に電話してパスワードを初期化させる = ソーシャルエンジニアリング、正答ウ) / 2009h21h-q068 (DoS 攻撃のねらい = サービス妨害、正答イ) / 2010h22a-q075 (偽サイト・偽メールで個人情報を盗む = フィッシング、正答ウ) / 2009h21a-q058 (自己増殖するプログラム = ワーム、正答エ)。いずれも本文と矛盾しない (q087 はフットプリンティング detail「人をだます攻撃の準備」とつながる; q068 の誤答「データの改ざん / 盗む」を本文は支持しない)。ただし 4 題とも本単元の用語を問わない → L7。CONFIRM 3〜5 は validate で充足。
4. **D-198 写し**: validate の copy guard (本文 + 図ラベル・caption・総表・対比表) = 0 件。独立照合: 単元の JP 文字列 52 本 (スクリプト抽出 53 本から `lang_status.jp` を除く; 派生・v1 不変の title / unit_summary は抽出対象外) × topic `technology-23-61` 全 89 題の題文 (stem_jp_clean) + 選択肢 445 本、12 字連続一致 (句読点・記号・空白・記法除去):
   - (a) カタカナ 4 字以上 + 英数を □ に遮蔽 (遮蔽後の実字 6 未満の窓は除外、見出し語は遮蔽しない) → **0 件**。
   - (b) 遮蔽なし → **0 件**。
   - (c) 近似 (12 字窓で 1〜2 字置換、遮蔽なし) → **0 件**。
   - (d) 文全体の類似度 (bigram Dice / 正規化編集距離 ed): 最大 Dice は `terms[1].fig.data.nodes[3].label.jp`「動いているサービスを推測する」↔ 2009h21h-q068 選択肢イ (サービスを妨害) 0.48 / ed 0.50 — 13 字と 9 字の短い句の「サービスを〜する」の長さ由来の値で、意味も逆 (推測 vs 妨害)。次点 `terms[0].fig.data.rows[0].cells[0].jp`「組織の Web サイト」↔ 2013h25a-q083 ウ 0.43 / ed 0.63 (一般名詞句)。他は全て Dice ≤0.36 / ed ≥0.75。**引用題との照合**: `terms[1].points[0]` ↔ q073 題文 Dice 0.10 / ed 0.93、最長共通連続「侵入した」4 字。較正 HIGH 例 (ed 0.14 / Dice 0.52) に近いものは無い。
   - (e) 目視 (カタカナの多い文: one・detail・fig の SNS / Web / ドメイン / サービス / ポート / ソフトウェア / インターホン / スキャナ を含む文): 題の表現の写しなし。比喩 (旅行先の店の下見・集合住宅のインターホン) と図 (情報源 4 行の表・選ぶ→試す→記録→推測の 4 段) はいずれも topic 内の題に無い場面。
   - (iii) 選択肢の組・場面: q073 の他の誤答 (盗聴・フィッシング) は本文のどこにも現れず、選択肢の組の再現・同順打ち消しは無い。詳細 §2 #2。
5. **D-195**: 結論先行 (one = 1 文 × 2、太字あり)、展開 (detail 2 / 3 文)、比喩・フック: フットプリンティング = 店の外からの下見 (場面の比喩) + 語源 footprint、ポートスキャン = インターホンを順に押す (場面の比喩) + 語源 scan / スキャナ。いずれも定義の言い換えではなく別の手がかり。定義前使用: ポート = one の括弧注、脆弱性 = detail の括弧注、バックドア = 考点内の同格説明、偵察 = key_points_jp[0]「標的を調べる偵察」、不正侵入 = 前提単元 (u09 / u10)、SNS は zh_terms どおり。**§9 禁止句 grep** (jp: 試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされ / 挙が / ポイント / 注意) → `freq_badge`「頻出」(topic バッジ)、「選ぶ」2 件 (`fig.nodes[0].label.jp` / `fig.steps[0].caption_jp` = ポート番号を選ぶ操作の通常の動詞で偽陽性)、**「と語源で覚える」1 件** (`terms[0].hook_jp` + 派生 2) → L6。zh (考试 / 必须 / 一定要 / 记住 / 选项 / 被视为 / 重要) 0 件、en (exam / important / must / remember / always / is considered / answer) → `terms[1].analogy_en`「units answer」(インターホンに応答する、の通常語) のみ偽陽性。**図の型**: フットプリンティング = table static (2 列 × 4 行)、ポートスキャン = flow steps 4 (nodes 4 = steps 4); 登録 6 種内。pair 配置: フットプリンティング / ポートスキャン は b の後、3 行 key 1 (rows[0])。
6. **D-200**: 考点数 1 / 1 (≤3 ✓)、各 JP 1 文・44 字 / 57 字 (≤100 ✓)。**framing 件数** (validateV2 `pointFraming`、tsx で実行、全考点): jp 0 / zh 0 / en 0。
7. **D-202 / D-203 / D-204 単元全体点検**:
   - 書き方 7 (欄同士): フットプリンティングの「中に入らず外から見える材料だけ」(analogy) /「不正侵入ではない」(points[0]) /「標的への通信 主に必要としない」(overview extra[1]・pairs rows[1].a) は相互に整合。ポートスキャンの one「どのポートが接続を受け付けるか」/ overview one_line「応答から動いているサービスを探る」/ key_points[2]「接続の結果から…割り出す」/ fig node「接続の可否を記録」→「サービスを推測」は同じ範囲で一致。analogy (インターホンを順に押し、返事のあった部屋を書き留める) の像は one・fig と一致し、考点・detail の否定する内容を運ばない (D-204 ✓)。比喩の範囲 (建物 = 1 台のコンピュータ、部屋 = ポート) は one の「標的のコンピュータのポート」と食い違わない (b15 u06 型なし)。
   - 書き方 8 (対比の出現欄): ① 手がかり (公開情報 / ポートの反応): `overview_rows[*].extra_*[0]`・`pairs[0].rows[0]` → 2 箇所 (L5)。② 標的への通信 (不要 / 送る): `overview_rows[*].extra_*[1]`・`pairs[0].rows[1]` → 2 箇所 (L5)。③ 分かること (人・製品 / ポート・サービス): `pairs[0].rows[2]` のみ (fig は片側ずつ)。≤2 箇所の上限内。
   - 書き方 9 (限定条件): q073 の前提 (侵入後・再侵入のため) 保持 (§1-2)。
   - §6: 比喩・hook とも定義の言い換えでない。§9 言い直し: L4。
   - **別名 (b15 u10 型)**: シラバス `data/ip/syllabus/knowledge_tree.json` は「フットプリンティング」「ポートスキャン」を別項目として列挙。本単元で別名を別物として教える箇所なし。D-205: 改正される文書の構成・数・名称の記述なし → 対象外。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 4 種 (フットプリンティング / ポートスキャン / 不正侵入 / バックドア) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` 併記 2/2 (D-202)、zh 訳語が `zh_terms.json` に従う (踩点(信息收集) / 端口扫描 / 后门 / 社交网络服务（SNS）; validate B6 warn 0)。one_zh が「踩点」だけで括弧の補足を省く点は loc-review low と同じく許容 (O2)。
9. **前段審査の追跡** (`journal.b16-u13-a1.jsonl` の result): jp r0 → jp-review r1 **PASS** (low 5: challenge 題の単元適合 / step 3 caption「使えない」/ フットプリンティング detail と表の重複 / ポートスキャン detail・caption・key_points の重複 / 総表と pairs の対比反復)、loc r0 → loc-review r1 **PASS** (low 4: points[0].text_zh「留下机关」/ one_zh の「踩点」のみ / overview_rows[1].extra_en[1]「Actually sent」/ fig cols[1].en)。前段に HIGH / MEDIUM は無く、持ち越し無し。low の fix は未適用で全て残る → L1・L3・L4・L5・L7・L8・O2 に対応。単元 = jp.r0 + loc.r0 の merge のまま (`merged.json` と同一)。
10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (2 / 2)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | フットプリンティング | OK — exam 0 / mix 1: 下調べの段階で、それ自体は標的のシステムへの不正侵入ではない — 正しい (標準的事実、引用題なし)。one「攻撃の前に、公開されている情報を集めて下調べ」= 受動的フットプリンティングの標準定義。detail (Web サイト・SNS・求人から社員名・メール形式・製品の手がかり → 狙いの絞り込み・技術的調査や人をだます攻撃の準備に使われる**ことがある**) 正しく留保あり。table 4 行 (Web サイト / ドメイン登録情報 / SNS・求人 / 検索エンジン) は one・detail と一致。analogy (店に入らず外から見える材料で下見) は「不正侵入ではない」と同じ向き | OK (図 = table static、copy 0) | OK (zh one「踩点」のみ = O2; en cols[1] L8) | L4, L6 |
| 2 | ポートスキャン | OK — exam 1 / 1 題: 開いているポートを探る調査で、侵入後に再び入るための仕掛けを残すバックドアとは別物 (2023r05-q073 正答イ = バックドア、本単元の見出し語は誤答エ)。**D-198 (iii) 境界の判定**: b15 u07 M1 (同用語の引用題の、見出し語と無関係な誤答肢 SEO を「別物」と打ち消すだけ) / b14 u02 M1 (誤答の場面を再演して打ち消す) と比べ、本件は (a) 打ち消される側が他所の誤答肢でなく**本単元の見出し語そのもの**で、前半は見出し語の標準定義、(b) 対比の相手 (バックドア) は正答で、その記述は標準定義 (u06 バックドアの one と同じ範囲) であって題文の細部を再演しない (Dice 0.10 / ed 0.93)、(c) 侵入前の偵察 / 侵入後の手口という段階の区別は `goals_jp[2]` が掲げる単元の学習目標で、取り違えうる組 (どちらも「入口」に関わる攻撃者の手口)、(d) q073 の他の誤答 (盗聴・フィッシング) は列挙しない → MEDIUM の型に当たらず **L2 (境界、記録のみ)**。detail (ポート番号でサービスを区別 → 動いているサービスの見当 → 既知の脆弱性を持つソフトの手がかり; 管理者が自組織に行えば点検) 正しい。flow steps 4 (選ぶ→試す→記録→推測) は one と一致。step 3 caption の「反応がなかったポートも使えない」は単純化 (L3) | OK (図 = flow steps 4、copy 0、(iii) 境界 L2) | points[0].text_zh「留下机关」(L1) / extra_en (L8) | L1, L2, L3, L4 |

**単元レベル**: goals 3 点 (偵察の役割 / フットプリンティングの情報源と例 / ポートスキャンの仕組みと侵入後の手口の区別 — 各用語の本文と一致)・overview_cols 2 (主な手がかり / 標的への通信)・overview_rows 2 行・pairs 1 組 (3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 4 件 (§1-3、本文と矛盾なし、L7)。key_points_jp[0]「偵察を行う**ことがある**」は留保付きで正しい。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 8 (うち 建議修 1: L1)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1](ポートスキャン).points[0].text_zh` | 「留下机关」は機械仕掛け・からくりの語感で、IT セキュリティの文脈として不自然 (loc-review r1 low、未適用)。意味は jp「仕掛けを残す」と一致 | zh: 「端口扫描（[[jp:ポートスキャン]]）是探查哪些端口开放的调查，与入侵后为了再次进入而留下机关的**后门**（[[jp:バックドア]]）不是一回事。」→「端口扫描（[[jp:ポートスキャン]]）是探查哪些端口开放的调查，与入侵后为了再次进入而预留的**后门**（[[jp:バックドア]]）不是一回事。」(太字 1・`[[jp:]]` 2 は不変、jp / en は変更なし) |
| L2 | LOW | `terms[1].points[0].text_jp/zh/en` (qids `2023r05-q073`) | D-198 (iii) 境界: 引用題 q073 で見出し語ポートスキャンは誤答肢。考点は「見出し語 ≠ 正答」の形をとるが、§2 #2 の (a)〜(d) により b14 u02 M1 / b15 u07 M1 の型 (誤答の場面の再演・無関係な誤答肢の打ち消し・選択肢の組の再現) には当たらない。見出し語を問う題がコーパスに q073 しか無いための構成 | 記録のみ (考点を消すとポートスキャンの exam 考点が 0 になり、q073 を引く欄が quiz だけになる) |
| L3 | LOW | `terms[1].fig.steps[2].caption_jp/zh/en` | 「拒否されたり反応がなかったりしたポートは使えないと記録」は、閉じたポートと応答のない (遮断された) ポートをまとめて「使えない」とする単純化 (jp-review r1 low)。スキャンする側から接続できない、の意味では誤りでなく、one・node「接続の可否を記録」と矛盾しない | 記録のみ |
| L4 | LOW | `terms[0].detail_jp` 1 文目 ↔ `terms[0].fig.data.rows`、`terms[1].detail_jp` 1 文目 ↔ `terms[1].fig.steps[3].caption_jp`、`terms[1].detail_jp` 3 文目 ↔ `key_points_jp[3]` (各 zh / en 同) | D-203 §9 の言い直し (jp-review r1 low 2 件と同じ)。detail の例示 (Web サイト・SNS・求人 / 社員名・製品) が直上の表の行と重なり、「開いたポートからサービスの見当」「自組織に行えば点検」が 2 欄ずつに出る | 記録のみ (key_points は単元の要約として各用語の要点を再掲する欄) |
| L5 | LOW | `overview_cols_*` + `overview_rows[*].extra_*` ↔ `pairs[0].rows[0..1]` | 書き方 8: 総表の 2 列 (手がかり / 標的への通信) と pairs の 1・2 行目が同じ対比 (各 2 箇所、上限内) (jp-review r1 low) | 記録のみ |
| L6 | LOW | `terms[0].hook_jp` (+ 派生 `memory_hook_jp`, `summary.memory_hooks_jp[0]`) | 「…拾い集める、と語源で覚える。」の §9 型の結び 1 件 (記憶フックの言い方としては許容、u06 L2 の前例は 4 件で記録) | 記録のみ (任意: 「…標的が世の中に残した足跡を拾い集める行為、と語源から読める。」) |
| L7 | LOW | `challenge_questions` | 4 題 (SE / DoS / フィッシング / ワーム) はどれも本単元の用語を問わない (jp-review r1 low)。コーパスで見出し語を含む題は q073 のみで、それは quiz に既出。本文と矛盾はせず、q087 は detail の「人をだます攻撃の準備」とつながる | 記録のみ (題の供給がないための選定) |
| L8 | LOW | `overview_rows[1].extra_en[1]`「Actually sent」、`terms[0].fig.data.cols[1].en`「Example information picked up」 | en の表セル・列見出しの据わり (loc-review r1 low)。意味は jp と一致 | 記録のみ (任意: 「Sent directly to the target」/「What can be learned (examples)」) |

**範囲外の観察**:
- O1 `overview_rows[0].extra_jp[1]` / `pairs[0].rows[1].a_*`「標的への通信: 主に必要としない」— detail の情報源に「組織の Web サイト」があり、閲覧は標的のサーバへの通常のアクセスではあるが、「主に」の留保と analogy「中に入らず外から見える材料だけ」で、攻撃的な通信を送らないという趣旨は保たれる。能動的フットプリンティング (問い合わせ等) を否定する言い切りではないので指摘しない。
- O2 `terms[0].one_zh` 等は「踩点」のみで `term_zh`「踩点(信息收集)」の括弧を省く (loc-review r1 low)。見出し `term_zh` と `[[jp:]]` 併記で同定でき、validate B6 warn 0。
- O3 `unit_summary_*` / `title_*` は v1 と同文 (未改稿)。「偵察」は zh_terms に未登録だが、本単元では一般語 (侦察 / reconnaissance) として三語一貫。

確認済みで問題なし: 限定条件 (qid 付き考点 1 件保持)、§9 禁止句 grep (定型締め句 0; 「と語源で覚える」は L6)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤57 字)、図の文字列の写し (validate 0、独立照合 遮蔽あり 0 / 遮蔽なし 0 / 近似 0)、穴埋め題なし、選択肢の組の再現・誤答場面の再演なし (L2 境界)、別名の取り違えなし、比喩・図の範囲と one / detail の一致 (D-204)、`[[jp:]]` 原語 (4 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (2/2)、zh 訳語表 (B6 warn 0)、図種 (table static ×1 / flow steps ×1 = 登録内)、D-205 対象外、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、前段審査の HIGH / MEDIUM 持ち越しなし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **8** (建議修 1: L1 / 記録のみ 7: L2〜L8、うち L6・L8 は任意の修正案あり) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 2 用語・考点 2 件 (qid 付き 1 件)・引用 1 題 + challenge 未引用 4 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。写しは独立照合 (遮蔽あり / なし / 近似) とも 0。見出し語が引用題の誤答肢である構成 (L2) は D-198 (iii) の MEDIUM 型と区別できる境界として記録。LOW 建議修 1 件 (L1: zh「留下机关」→「预留的」) は補丁 (B3) で修正推奨、L2〜L8 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-61-u13
✓ technology-23-61-u13 unit: 0 issues (data/ip/textbook/units/technology-23-61-u13.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-61-u13
✓ technology-23-61-u13 parity: 17 locations, 0 diff
EXIT=0
```
