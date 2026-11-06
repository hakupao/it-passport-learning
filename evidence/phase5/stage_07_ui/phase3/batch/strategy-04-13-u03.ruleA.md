# Rule A 全数抽検 — strategy-04-13-u03 (アイデア創出・検証の実践手法)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (b35)、repo HEAD `68bd6497` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b35-u03-a2` (種付き: seed = a1 jp.r1 + 審査 #2) merge 結果、sha256 先頭 `6bd8fc4c6b5c236d`)。
- **対象**: `data/ip/textbook/units/strategy-04-13-u03.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (ハッカソン / デザイン思考 / ペルソナ法 / PoC / PoV / バックキャスティング / リーンスタートアップ) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197〜D-200、D-202〜D-205、D-208 (既知の失敗型 1〜10)、D-209、D-210、**D-211** (正誤選択型で正解肢が一般原則: 順序を変え列挙を落とした一般表現は (b) でない = D-198 側)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `.planning/v2/strategy-04-13-u03/v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致)。
- **前回 attempt**: `failures/phase5/stage_07_ui/phase3/batch/strategy-04-13-u03_attempt_1.md` (MEDIUM 3 件、§2-0 で三語とも解消を確認)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption・cell) / quiz / inline_quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 9 件 = exam 5 + mix 4、引用 qid 延べ 10 = 異なり 10 題、全題 topic `strategy-04-13`)**: `questions.json` の題文・選択肢・`correct_answer` を再読 (stem は translations の stem_jp_clean で判定)。
3. **quiz / challenge**: quiz 計 7 枠 (ハッカソン 2 / デザイン思考 1 / PoC 2 / バックキャスティング 1 / リーンスタートアップ 1、PoV・ペルソナ法 0) + challenge 3 題 (2025r07-q009 / 2025r07-q007 / 2026r08-q004) — 本文と矛盾しないこと、hook / 認識の手がかりを各題の場面に当てて誤答肢を選ばないこと (D-208 (9)) を確認。2024r06-q003 (正答 ウ バックキャスティング、誤答 PoC / PoV / フォアキャスティング) は `terms[5]` の quiz のみ、hook (fore → back) と mix 考点で正答に導かれ誤答側の読みなし。2022r04-q035 (コールセンタ AI 試行で効果・実現性を確かめる → PoC) は PoC detail「見込んだ効果が出るかといった実現性」で解け、PoV hook (Value) は選択肢に PoV が無く干渉しない。
4. **D-198 写し**: validate の copy guard = 0。独立照合: 単元 JP 文字列 119 本 (派生除く) × topic 内全 38 題の題文 + 選択肢、12 字窓 (句読点・記号・空白除去)。**カタカナ・英数遮蔽なし**: 4 件ヒット + 1〜2 字置換の近似 7 件 — 全て 2024r06-q003 の選択肢にある見出し語・正式名称 (「PoC (Proof of Concept)」「PoV (Proof of Value)」「バックキャスティング」) と `terms[3..4].one_jp` / `pairs[0].rows[0]` / `terms[5].one_jp` / `terms[5].points[0]` / `key_points_jp[3]` の一致で、用語名であり表現ではない → 偽陽性。**遮蔽あり** (カタカナ 4 字以上・英数を □、実字 6 未満の窓除外): 0 件 / 近似 0 件。カタカナの多い文 (ハッカソン one・detail、リーン detail の MVP 文、PoC/PoV hook) を目視 — 題の文と一致する句なし。
   - (iii) なぞり (D-208 (1)): §2-1 の表に考点ごとに記載。`warn choice-echo` は validate 出力に 0 行。
5. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 3 文 × 7、比喩・フック (§6 → L6)、定義前使用 (共創 = one 内、MVP = リーン detail で正式名称と訳を併記、アイデアソン = mix 考点内で定義、フォアキャスティング = mix 考点内で定義、概念実証 / 価値実証 = 括弧の訳)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → ヒットは「効果が出る」×2・「家を出る」のみ = 通常の用法; zh / en の 考试 / 必须 / must / exam / example / remember → "must be done"・"for example"・"Example questions" のみ = 通常の用法)、図の型 (flow steps ×6 [ハッカソン 4 / デザイン思考 4 / PoC 4 / バックキャスティング 3 / リーン 3]、static table ×1 [ペルソナ]、PoV = 図なし; 全て登録内)、pair 配置 (PoC/PoV は PoV の後、key 行 1)。
6. **D-200**: 考点数 2/1/1/1/1/2/1 (≤3 ✓)、各 JP 1 文・46〜62 字 (≤100 ✓、最大 デザイン思考 `points[0]` 62 字)。framing 件数: validate 0 issues (jp / zh / en とも上限 2 以内)。
7. **D-202 / D-203 / D-205 単元全体点検**: 書き方 7 (PoC「見込んだ効果が出るか」と PoV「効果が費用に見合うか」の切り分けが detail / fig caption / pairs / mix 考点で一貫、§2-0) → 不整合 0。書き方 8 → §3 の列挙。書き方 9 → 限定条件の落ち 0 (引用題に「など」等の範囲を閉じる語の脱落なし)。D-205: 改訂される文書の構成要素数・名称の記述なし (デザイン思考の 4 段の図は caption「例えば、」で開く)。D-210: 法令・規格の改正前文言に基づく引用題なし。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、図ラベル・表セル・比較行・caption の三語一致 (parity 0 diff)、`[[jp:…]]` 原語 10 種 (ハッカソン / アイデアソン / デザイン思考 / ペルソナ法 / ペルソナ / 概念実証 / 価値実証 / バックキャスティング / フォアキャスティング / リーンスタートアップ) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` 7/7 (PoC・PoV の one_zh は三語同形の略語で不要 = management-11-29-u05 の SPOC と同じ扱い; one_en は訳語 概念実証 / 価値実証 に併記)、zh 訳語 `zh_terms.json` 一致 (黑客马拉松 / 设计思维 / 用户画像法（Persona）/ PoC（概念验证）/ PoV（价值验证）/ 逆向规划（Backcasting）/ 精益创业; アイデアソン・ペルソナ・フォアキャスティング・MVP は表に無く validate の B6 warn 0)。zh / en の語が誤答肢寄りに読める箇所 (D-208 (6)) なし: PoC = 可行性 / feasibility、デザイン思考 = 以用户为中心 / user-centered (標準用語) 。
9. **機械ゲート**: §6 に出力全文。

### 2-0. attempt 1 の MEDIUM 3 件の解消 (三語)

| a1 指摘 | a2 の該当欄 (jp / zh / en) | 判定 |
|---|---|---|
| PoC/PoV の境目 (見込んだ効果) が両方に割り当て (`terms[4].detail_jp` が「業務の時間や費用がどれだけ減るか」を PoV の測定例に) | PoC `terms[3].detail_*`「技術的に動くか、見込んだ効果が出るかといった実現性」/「技术上能否跑通、能否达到预期效果等可行性」/ "whether it works technically and gives the expected effect"、`fig.steps[2]` 同旨、`pairs[0].rows[2].a_*` 同旨。PoV `terms[4].detail_*`「利用者が対価を払ってでも使いたいか、得られる効果がかかる費用に見合うか」/「用户是否愿意付费使用、获得的效果是否抵得上所花的成本」/ "whether users would pay to use it and whether the benefits justify the costs"、`pairs[0].rows[2].b_*` 同旨。境目 = 効果が出るか (実現性) / 効果が費用に見合うか (価値) で、`pairs[0].rows[1]`・`terms[4].points[0]` と三語とも一致。PoC 側は 2022r04-q035 (想定効果が得られるか → 実現性の検証 = PoC) が直接支持 | **解消** |
| デザイン思考の考点が 2019r01a-q030 正解イの句を同順でなぞる (a1:「使う人をいつも考えの起点に置き、その人が根本で求めていることから作るものを決める」) | a2 `terms[1].points[0].text_jp`「使う人への共感から解くべき課題を定め、試作と確認を繰り返して解決策を形にしていく、利用者中心の進め方」— イの骨格 (中心は常に利用者 → 本質的ニーズに基づき → デザインする) を追わず、detail と図 (共感 → 定義 → 発想 → 試作) の過程で述べる。「利用者中心 / 以用户为中心 / user-centered」は標準用語で イの語句ではない。誤答肢 (スタイルシート / BPR / オブジェクト指向) の打ち消しもなし | **解消** |
| PoV の quiz に無関係の 2024r06-q003 | `terms[4].quiz` / `inline_quiz` なし。2024r06-q003 は `terms[5].quiz` / `inline_quiz` のみ。PoV は topic 内で誤答肢としてのみ出るため quiz・exam qid 0 は妥当 | **解消** |

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件、(iii)) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | ハッカソン | OK — exam 1 / 4 題: 職種混成チーム・テーマ・短期間の試作・成果を競う (2019r01a-q019 / 2026r08-q004 正答 = ハッカソン [分類型]、2020r02o-q035 正答ウ [場面→用語]、2025r07-q009 正答ウ [正誤選択型]) / mix: アイデアソン = アイデアを出し磨く、ハッカソン = 試作まで — 正しい。(iii): 考点の句の並び「職種の違う人がチームを組み → テーマに沿った → 試作品を → 短期間で作り上げて → 成果を競う」は 2025r07-q009 ウの「複数の参加チーム → 与えられたテーマに関する → プロトタイプを → 短期間で作成し → 成果を発表して競い合う」と同順 (列挙「プログラマーやデザイナーなど」と「発表」は落ちている)。ただし各要素は q019 / q004 の題文 (テーマ・開発者や企画者・短期集中・成果を競う) と q035 の場面 (デザイナ・プログラマのチーム・数日) にも共通する見出し語の標準定義そのもの (one_jp と同内容) で、ウ固有の語句は無い → D-198「標準的な定義の一般表現」側 (D-211 (ii))、LOW → L1 (建議修: 順序を崩す)。detail 3 文目 (企業が社外の人材・発想を取り込む場として開く) は q035 の場面と方向が近いが フィンテック・職種の組・日数を使わない一般説明 → 写しでない (L9)。図 steps 4 は detail と一致 | OK | OK | L1 / L9 |
| 2 | デザイン思考 | OK — exam 1 / 1 題: 共感から課題を定め試作・確認を繰り返す利用者中心の進め方 (2019r01a-q030 正答イ [正誤選択型]; 誤答 = スタイルシートで Web デザイン・業務プロセス再設計・オブジェクトでシステム設計、いずれも支持せず。hook「見た目の装飾ではなく」はアの読みを退けるが、選択肢の場面の再演ではなく語義の注) — (iii) なし (§2-0)。図 4 段は「例えば」で開く (D-205) | OK | OK | なし |
| 3 | ペルソナ法 | OK — mix 1 (qid なし、topic に出題なし): 年齢層の集団ではなく一人の人物像 — 正しい。表 (森 健太・38 歳 …) は自作。hook (ラテン語 persona = 仮面 → 役柄) 正しい | OK | OK | L5 |
| 4 | PoC | OK — exam 1 / 3 題: 本格開発前に新しい考え・技術が実際に機能するかを小さく試す検証 (2020r02o-q028 / 2025r07-q007 正答 = PoC [分類型、題文 = 開発の前段階の実証]、2022r04-q035 正答イ [場面: 効果・実現性の試行])。q035 のコールセンタ・AI の場面は使わない。detail「見込んだ効果が出るか」は q035 が支持 (§2-0) | OK | OK | L2 / L6 |
| 5 | PoV | OK — mix 1: PoC = 実現できるか / PoV = 見合う価値があるか — 二語対比を両側の肯定定義で述べる (D-209 対比で (iii) でない)。2024r06-q003 では PoV は誤答肢で、本文の PoV 定義 (価値の検証) は同題の正答 (目標から逆算 = バックキャスティング) の読みと重ならない。detail 1 文目は PoC 後の段階を示唆するが事実として妥当 | OK (図なし) | OK | L4 / L6 |
| 6 | バックキャスティング | OK — exam 1 / 1 題: 将来の目標を先に決め、さかのぼって今取り組むことを決める (2024r06-q003 正答ウ [分類型]) / mix: フォアキャスティング = 現状と傾向から積み上げ、出発点が今か将来か — 両側肯定定義 (D-209)、誤答エ を正しく定義し支持しない。考点の要素順 (目標設定 → 起点から現在を振り返る → 今すべきこと) は題文の定義と同じだが、定義そのものの構造で 12 字一致なし → L3 (§9)。hook (forecast の fore → back) は語の成り立ちとして正しく、q003 の 4 肢に当てて正答ウに導く。detail の温室効果ガス例は自作 | OK | OK | L3 |
| 7 | リーンスタートアップ | OK — exam 1 / 1 題: 仮説検証の MVP を早く出し顧客の反応から学んで直す短周期 (2023r05-q001 正答エ [分類型]; 誤答 = カニバリゼーション / 業務モデリング / DX、支持せず)。題文の要素 (仮説・最小限・短期の繰り返し) は定義そのもの、12 字一致なし。MVP の正式名称・構築-計測-学習の図は標準 | OK | OK | なし |

**単元レベル**: goals 3・overview_cols 1 (中心となる問い)・overview_rows 7・pairs 1 組 (PoC / PoV 3 行 key 1)・key_points 5・summary (派生、記法除去版と一致)・challenge 3 題 (本文と矛盾なし; 重複は L8)。goals / key_points に PoV が出ない → L7。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 1)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[0].points[0].text_jp` / `text_zh` / `text_en` | 正誤選択型 2025r07-q009 正解ウと句の順序が同じ (チーム → テーマ → 試作品 → 短期間 → 成果を競う、§2 #1 に引用)。要素は他の引用 3 題の題文にも共通する標準定義で D-198 の写しには当たらないが、D-211 (ii) の「順序を変え列挙を落とす」形にすれば (b) 型の残りが消える | jp「ハッカソンは、職種の違う人がチームを組み、テーマに沿った試作品を短期間で作り上げて成果を競う催しである。」→「ハッカソンは、短期間で試作品を作り上げて成果を競う催しで、テーマは主催者が示し、職種の違う人どうしがチームを組んで取り組む。」/ zh「黑客马拉松（[[jp:ハッカソン]]）是不同职业的人组成团队，在短时间内做出符合主题的原型并比拼成果的活动。」→「黑客马拉松（[[jp:ハッカソン]]）是在短时间内做出原型并比拼成果的活动，主题由主办方给出，由不同职业的人组成团队参加。」/ en "A hackathon ([[jp:ハッカソン]]) is an event where people from different roles form teams, build a prototype on a theme in a short time, and compete on the results." → "A hackathon ([[jp:ハッカソン]]) is an event for building a prototype in a short time and competing on the results; the organizer sets the theme, and people from different roles form teams to take part." |
| L2 | LOW | `terms[3].points[0].text_*` | one の語順どおりの言い直し (D-203 §9、jp-review a2 #1 low と同旨)。引用 3 題と一致 | 記録のみ |
| L3 | LOW | `terms[5].points[0].text_*` | one の言い直し (§9)、要素順は 2024r06-q003 の題文定義と同じ (定義の構造) | 記録のみ |
| L4 | LOW | `terms[4].detail_*` 1 文目 | PoC/PoV (実現性 vs 価値) の対比の 3 箇所目 (書き方 8; pairs[0]・terms[4].points[0] に次ぐ)。矛盾なし | 記録のみ (PoV の存在理由の説明で、削ると detail の導入が消える) |
| L5 | LOW | `terms[2].points[0].text_*` | 集団 vs 一人の対比が detail 1〜2 文目と重複 (書き方 8)。考点は「性格や悩み」、one は「名前や年齢、暮らしぶり」で補い合い矛盾なし | 記録のみ |
| L6 | LOW | `terms[3].hook_*` / `terms[4].hook_*` | 正式名称の頭文字・直訳で、one の括弧書きと同内容 (§6) | 記録のみ (略語の見出しでは頭文字が最短の手がかり) |
| L7 | LOW | `goals_*[1]` / `key_points_*` | 目標・要点に PoV が出ず、PoC/PoV の見分けが目標から読めない (jp-review a2 #1 low)。goals[1] の「検証の目的」は両者を含みうる | 記録のみ |
| L8 | LOW | `challenge_questions` | 2025r07-q007 は quiz の 2020r02o-q028 と、2026r08-q004 は 2019r01a-q019 と同じ題文 (選択肢一部違い)。単元の未使用題がこれのみで選定誤りではない | 記録のみ |
| L9 | LOW | `terms[0].detail_*` 3 文目 | 2020r02o-q035 (企業がイベントを企画) と方向が近いが、場面固有の要素 (フィンテック・職種の組・日数) を使わない一般説明 → 写しでない | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① PoC = 実現性 / PoV = 価値: `pairs[0].rows[1..2]`、`terms[4].points[0]` (mix)、`terms[4].detail_*` 1 文目 (→ L4)、`overview_rows[3..4].extra_*` (総表の列 = D-195 §3 の構造、数えない)。② ペルソナ = 一人 / 集団: `terms[2].detail_*` 1〜2 文目、`terms[2].points[0]` (→ L5)。③ バック / フォア: `terms[5].points[1]` (mix) と hook (語の成り立ち、手がかり) のみ → 許容。④ アイデアソン / ハッカソン: `terms[0].points[1]` のみ → 許容。

確認済みで問題なし: a1 の MEDIUM 3 件の解消 (三語、§2-0) と退行なし (D-208 (5))、限定条件 (落ち 0)、§9 禁止句 (定型締め句 0)、D-197 羅列 (validate 0)、D-200 (≤62 字・1 文)、D-205 (図は「例えば」)、D-210 (該当題なし)、D-211 (正誤選択型 2 題 q009 / q030 = §2 #1・#2)、閉じた列挙の欠け (D-208 (10)) なし、hook を quiz 場面に当てた誤答 (D-208 (9)) なし、`[[jp:]]` 原語 10 種、zh 訳語表、図種登録内、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 1: L1 / 記録のみ 8: L2〜L9) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 7 用語・考点 9 件・引用 10 題 + quiz / challenge で、考点の主張は正答と一致し、誤答肢を支持する記述・限定条件の落ちは無い。attempt 1 の MEDIUM 3 件は三語とも解消。L1 は補丁 (B3) 推奨、L2〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node scripts/textbook-v2-validate.mjs --unit strategy-04-13-u03
✓ strategy-04-13-u03 unit: 0 issues (data/ip/textbook/units/strategy-04-13-u03.json)
exit 0
$ node scripts/textbook-v2-parity.mjs --unit strategy-04-13-u03
✓ strategy-04-13-u03 parity: 35 locations, 0 diff
exit 0
```
