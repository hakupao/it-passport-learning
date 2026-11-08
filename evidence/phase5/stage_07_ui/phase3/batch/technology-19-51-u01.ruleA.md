# Rule A 全数抽検 — technology-19-51-u01 (インタフェース設計の基礎と入力操作)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / JP-review / localiser / loc-review) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成、照合スクリプトは scratchpad)。
- **Date**: 2026-11-08 (S151 b71)、repo HEAD `2f3bebf6` + 作業ツリー (単元 JSON は未コミットの書き直し版 = run `b71-u01-a1` merge 結果、sha256 先頭 `6ba9368cd9342b75`)。
- **対象**: `data/ip/textbook/units/technology-19-51-u01.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (ユーザビリティ / 人間中心設計 / ジェスチャーインタフェース / マルチタッチインタフェース / タップ / スワイプ / VUI) + 単元レベル (goals / overview / overview_rows / pairs 3 組 / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`docs/templates/ruleA_unit_audit.md` の既知失敗型 (1)〜(10)。比較: `.planning/v2/technology-19-51-u01/v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致)。同批で merge された `technology-19-51-u02.json` (フリック / ピンチ / ロングプレス / ウィンドウ / アイコン / ラジオボタン / チェックボックス) との整合も点検。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版 (`**` 除去、`[[jp:X]]` → X) であることをスクリプトで確認 (54 箇所、不一致 0)。
2. **考点 × 引用題 (考点 全 9 件 = exam 3 + mix 6、qid 付き 3 件 = 異なり 3 題)**: `data/ip/quiz/questions.json` から各題の題文 (stem_jp_clean 優先)・選択肢・`correct_answer` を再読 (全題 topic `technology-19-51`)。quiz / challenge のみの 2014h26h-q032 も同様に再読。考点の主張が正答と一致し、誤答肢を支持せず、題の前提 (限定条件) を外していないことを 1 件ずつ確認。
3. **quiz / challenge_questions** (quiz 計 5 枠 + challenge 4 題、本文で未引用 1 題 = 2014h26h-q032): 2014h26h-q032 (使いやすい画面のために考える項目の組 = 覚えやすさ・ボタン配置・文字サイズや色、障害の修復時間は含まない; 正答エ) は ユーザビリティ one / detail (使う側の体験で判断) と整合。前回 JP-review r0 low の「見た目の美しさではなく」は detail から消えており、文字サイズ・色を外すと読める余地は解消済み。HCD の one / 図とも矛盾なし。
4. **D-198 写し**: validate の copy guard = 0 件、`warn choice-echo` 出力なし。独立照合として単元の JP 文字列 148 本 (派生除く、source_figures 除く) を topic 内全 17 題の題文 (stem_jp_clean 優先) + 選択肢と 12 字連続照合 (句読点・記号・空白・`**`・`[[jp:]]` 除去):
   - カタカナ 4 字以上・英数を □ 遮蔽 (遮蔽後の実字 6 未満の窓は除外) → **0 件**。
   - 遮蔽なし → **1 件 = 偽陽性**: `terms[6].one_jp` ↔ 2014h26h-q093 の「User Interface」(VUI / GUI の展開名の英字部分)。
   - 1〜2 字置換の近似照合 → **1 件 = 同じ偽陽性** (「…ceUserInterf」~「…alUserInterf」)。較正の HIGH 例 (ed 0.14 / Dice 0.52) に近い対はない。
   - カタカナの多い文の目視: `terms[0].points[1]` (オートコンプリート) ↔ 2017h29a-q058 題文 — 題は「入力中の文字から過去の履歴を参照し候補一覧を表示、手間を軽減」、考点は「これまでに入力した文字列から打ちかけの文字に合う候補を示す…打つ手間を減らす」で語彙・語順とも組み替えられ 12 字連続なし。分類題 (どれか) の正答を見出し語の一般定義として述べる形 (D-209 免除)、誤答 3 肢 (インデント・オートフィルタ・ハイパリンク) への言及なし。`terms[3].points[0]` ↔ 2017h29h-q059 題文も「同時に触れ」の 4 字以外一致なし (定義題で標準定義の一般表現)。`terms[0].points[0]` ↔ 2009h21h-q067 は題の場面 (営業伝票・都道府県・リストボックス・担当者) を一切使わず「同じ値が続けて入力されやすい作業」へ一般化。
   - (iii) 選択肢なぞり: 考点 9 件とも誤答肢の否定・選択肢集合の再現なし。ただし hook / detail_zh の語に q059 の誤答肢 3 つのうち 2 つ (ダブルクリック = zh「双击」、マルチタスク) が出る → M1 / L2。
5. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 2 文 × 7 (≤3 ✓)、比喩・フックが定義の言い換えでないこと (駅の乗換え / 仕立て屋 / 手招き / 和音 / エレベーター / 紙を寄せる / 料理中の頼みごと; フックは語源・略語の手がかり)、定義前使用 (前回 r0 M2 の「タップなど」「ピンチなど」は木の図から消え、「1 本の指で触れる操作」「複数の指で同時に触れる操作」に直って解消。ピンチイン / ピンチアウトは マルチタッチ detail で定義してから表で使用、ダブルタップ・長押し・音声認識・音声合成・アクセシビリティ・オートコンプリートは初出の文の中で説明)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `freq_badge`「低頻」、`terms[0].hook_jp`「…と分解して覚える」(記憶フックの言い方、1 件のみ、前例どおり記録なし)、`terms[2].detail_jp`「扱い方を覚えなくても」・`terms[4].detail_jp` / `analogy_jp`「選ぶ」(通常の用法) — 全て定型締め句ではない。zh / en 相当語 (必须 / 考试 / must / exam / always / every) は `kind: "exam"` と "everyone" / "for example" のみで偽陽性。図の型 (ユーザビリティ・マルチタッチ = table static、人間中心設計・VUI = flow steps 4/4、ジェスチャー = tree static、タップ・スワイプ = 図なし; 全て登録内)、pair 配置 (各組 key 行あり)。
6. **D-200**: 考点数 3/1/0/2/1/1/1 (≤3 ✓)、各 JP 1 文・字数 47〜77 (≤100 ✓、最大は マルチタッチ `points[1]` の 77 字)。**framing 件数** (`validateV2.ts` の `pointFraming` を全考点に適用): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 / D-204 / D-205 単元全体点検**: 書き方 7 (欄同士): ユーザビリティ = 品質の度合い / HCD = 進め方 は goals[0]・overview_rows[0..1]・`terms[1].points[0]`・`pairs[0].rows[0]` で一致。ジェスチャー ⊃ (触れる動作 + 触れない手振り) は one・detail・木の図・`terms[3].points[1]`・`pairs[1]` で一致、マルチタッチ = 画面上の複数点の同時接触は one・detail・表・points・pairs で一致 (r0 low「画面以外の面 [タッチパッド] にも使う」は引用題 q059 がタッチパネル前提のため支持外の限定には当たらない)。タップ = 動かさず離す / スワイプ = 触れたまま滑らせる は one・pairs[2]・`terms[5].points[0]` で一致。VUI = 音声認識 + 音声合成 は detail・図・key_points[3] で一致 → 欄内の不整合 0。書き方 8 → 下の列挙。書き方 9 (限定条件) → §2 表、落ち 0。D-204: 図・比喩の範囲は one / detail と矛盾なし (ただし スワイプ の比喩は u02 の フリック と衝突 → L1)。**D-205 / 型 (10)**: ユーザビリティの「有効さ・効率・満足度」は ISO 9241-11 / JIS Z 8521 の定義の構成要素で、版の明記・「例えば」なしに one・図・pairs[0].rows[1]・key_points[0] で言い切る。ただし ISO 9241-11:1998 → 2018、JIS Z 8521:1999 → 2020 のどちらでも 3 要素は不変 (本監査の知識による照合; 原文は未取得) → management-09-26-u04 Rule A の前例 (スクラムの「3 つの役割」が全版で不変 → MEDIUM に当たらず LOW) に従い **L4**。満足度の図の説明「不快さがなく、好ましく感じて使える」は 1998 / JIS 1999 版の言い方 (2018 版は身体・認知・感情の反応) に近いが、矛盾はしない。HCD の 4 活動 (ISO 9241-210:2010 / 2019 で不変) は `detail_jp` が「例えば」で開いており、図は detail の例の段階化 → L6 (記録のみ)。D-210: 引用・quiz・challenge 4 題は規格の版に依拠しない。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 (ユーザビリティ / オートコンプリート / アクセシビリティ / 人間中心設計 / ジェスチャーインタフェース / マルチタッチインタフェース / マルチタッチ / ピンチアウト / ピンチイン / タップ / 長押し / ダブルタップ / スワイプ / 音声認識 / 音声合成) が jp 本文に実在、one_zh / one_en 全 7 用語に見出し語の `[[jp:]]` あり (VUI は zh / en とも見出し語そのものが原語) (D-202)、zh 訳語が `zh_terms.json` に従うこと (易用性 / 以人为本设计 / 手势界面 / 多点触控界面 / 轻点 / 滑动 / 语音用户界面 / 无障碍设计 一致; ダブルタップ・ピンチアウト・ピンチイン は表に項目なし)。**型 (5) 退行**: JP-review r0 の MEDIUM 2 件 (図の例の列の重なり / 未定義の操作名) は zh / en の対応欄でも解消 (図 rows・木ラベルの zh / en は jp と同じ内容)。**型 (6)**: `terms[4].detail_zh` の ダブルタップ = 「双击」が q059 誤答肢 (ダブルクリック) の zh 訳と同語 → **M1**。loc-review の LOW 10 件は単元に未反映 (loc の PASS 判定上は許容) — M1 以外は L7 に記録。
9. **u02 との整合 (同批 merge)**: マルチタッチ (u02 = 複数の接触点を一度に読み取る方式、ピンチはこの方式で初めてできる) と u01 one / detail は一致。ピンチアウト = 拡大 / ピンチイン = 縮小 は両単元一致。ロングプレス (u02、長押しとも呼ぶ) と u01 タップ考点の「長押し」は別名の関係で、u02 hook が [[jp:長押し]] を併記しているので用語の取り違えなし (対比の重複は L9)。**不一致 2 件**: ① u01 スワイプの比喩「すっと払って」が u02 フリック の定義語「素早く払って離す」と衝突 → L1; ② zh で ピンチイン を u01 は「捏合」、u02 は「向内捏合」(u02 では「捏合」= 見出し語 ピンチ [zh_terms] の総称) とし、同じ zh 語が単元ごとに別の範囲を指す → L5。
10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | ユーザビリティ | OK — exam 2 / 2 題 + mix 1: 同じ値が続けて入力されやすい作業では直前の値を初期値にすると手間が減る (2009h21h-q067 正答エ = 前画面で入力した値; 題の前提 [伝票を担当者・都道府県ごとにまとめて入力] は「同じ値が続けて入力されやすい作業では」として保持、誤答 [成績・会社数・五十音順] に触れない) / オートコンプリートは入力履歴から候補を示し打つ手間を減らす (2017h29a-q058 正答イ) / mix: ユーザビリティ = 想定した利用者にとっての使いやすさ、アクセシビリティ = 高齢者・障害のある人を含む誰もが使えるか (標準的な区別、ISO の specified users と一致)。図 3 行 (有効さ = 正しく最後まで / 効率 = 手間・時間 / 満足度 = 不快さなく好ましい) は r0 M1 (迷う・待つの重なり) が解消し、各行の例が自行の観点だけに当たる。2014h26h-q032 と矛盾なし | OK | OK (points[1] の zh / en だけ ユーザビリティ が太字 = L7) | L4 (D-205) / L8 |
| 2 | 人間中心設計 | OK — mix 1: ユーザビリティ = 品質、HCD = それを高める評価と改善の繰り返し (2014h26h-q032 の設問趣旨 [使いやすい画面の設計] と整合)。one「利用者の立場から評価」は r0 low (評価主体を利用者に限る) を解消し、専門家評価も含み得る言い方。図 4 段は detail「例えば」の段階化 | OK | hook_en の綴りが term_en と食い違う → L3 | L3 / L6 |
| 3 | ジェスチャーインタフェース | OK — 考点なし (引用題なし、freq 0)。one「身体の動きを読み取る入力方式の総称」・木の図 (触れる動作 [1 本指 / 複数指] + 触れない動作 [カメラ・センサー]) は一般的な定義で、u02 のタッチ操作群とも矛盾なし。detail「キーボードやマウスの扱い方を覚えなくても…操作できる点が特徴」は一般的な性質の記述 | OK | en「Its strength is」(loc low) = L7 | L7 |
| 4 | マルチタッチインタフェース | OK — exam 1 / 1 題 + mix 1: 画面の 2 点以上に同時に触れ組合せで操作 = マルチタッチ (2017h29h-q059 正答エ; 題の前提 [タッチパネル] は「画面の」で保持) / mix: マルチタッチ = 画面上の複数点、ジェスチャー = 触れない手振りまで含む総称 (positive 定義の対比、D-209 の (iii) 非該当)。表 (ピンチアウト / ピンチイン / 回転) は u02 ピンチと一致 | OK (points[0] は one の言い直し = L8) | zh ピンチイン「捏合」が u02 と食い違う → L5 | L2 (hook) / L5 / L8 |
| 5 | タップ | OK — mix 1: タップ = 触れてすぐ離す / 長押し = 触れたまま置く、違いは時間 (u02 ロングプレス考点と同趣旨)。one「最も基本的なタッチ操作」は v1 継承の最上級表現 (L9) | OK | **zh「双击」= q059 誤答肢の zh 訳と同語 → M1** | **M1** / L9 |
| 6 | スワイプ | OK — mix 1: タップ = 動かさず離す / スワイプ = 触れたまま滑らせる、違いは指を動かすか (positive 定義の対比)。detail (画面切替・一覧送り、向きで結果が変わる) 一般的 | 比喩が u02 フリック の像 → L1 | one_zh「滑动…滑动」循環 (loc low) = L7 | L1 / L7 / L9 |
| 7 | VUI | OK — mix 1: VUI = 声、ジェスチャー = 身体の動き、違いは入力手段 (positive 定義の対比)。detail・図 4 段 (話す → 音声認識 → 処理 → 音声合成) 一致、key_points[3]「手や目を使わずに操作できる」は detail「画面を見たり手で触れたりしなくても使える」の言い換えで可能性の記述 | OK | one_en「answers with sound」(loc low) = L7 | L7 |

**単元レベル**: goals 3 点 (overview.intro は goals の記法除去連結)、overview_cols 2・overview_rows 7 行 (各 one と一致)、pairs 3 組 (ユーザビリティ / HCD 2 行 key 1、ジェスチャー / マルチタッチ 3 行 key 1、タップ / スワイプ 3 行 key 1)、key_points 4、summary (記法除去版と一致)、challenge_questions 4 件 (2014h26h-q032 / 2009h21h-q067 / 2017h29a-q058 / 2017h29h-q059 — 本文と矛盾なし)。`pairs[2].rows[2].b` スワイプ ≒ ホイールでのスクロール は用途で見た対応で r2 low のとおり軽微 (L9)。事実誤りなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 9 (うち 建議修 5)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[4](タップ).detail_zh` (+ 派生 `explanation_zh`) | 型 (6) (b18 u05 前例): jp「**ダブルタップ**」の zh を「**双击**」とし、同じ文の前半は「相当于鼠标的单击」。この単元の quiz / challenge 2017h29h-q059 (タッチパネルの複数点に同時に触れる方式はどれか) の誤答肢イ (マウスのダブルクリック) の zh 訳は同じ「双击」。zh 読者はこの単元で「双击 = タッチ画面の操作 (タップの派生、同じ所に 2 回触れる)」と学ぶため、q059 で「双击」を「画面に 2 回 [複数回] 触れるタッチ入力」と読んで選ぶ余地が生じる。jp / en (double tap) は問題なし。loc-review r1 が LOW で指摘したが未反映 | zh 置換: `比如在同一位置连续轻触两次的**双击**[[jp:ダブルタップ]]。` → `比如**连点两下**[[jp:ダブルタップ]]，即在同一位置连续轻触两次。` (jp / en 変更なし) |
| L1 | LOW **建議修** | `terms[5](スワイプ).analogy_jp` / `analogy_zh` / `analogy_en` | 型 (8): 比喩の要の語「すっと払って」/「轻轻一拂」/ "quick sweep" は、同批 u02 の見出し語 フリック の定義語 (素早く払って離す) で、u02 の考点は スワイプ と フリック を速さ・長さで分ける。比喩が フリック の像になっている。引用題・quiz に両語を問う題がないため MEDIUM には当たらない | jp `机の上に広げた紙を、指先で横へすっと払って脇へよける動作に近い。` → `机の上に広げた紙を、指先で触れたまま横へ滑らせて脇へよける動作に近い。` / zh `就像用指尖把摊在桌上的纸往旁边轻轻一拂，把它挪开。` → `就像用指尖按着摊在桌上的纸，朝旁边滑过去把它挪开。` / en `It is like brushing a sheet of paper on a desk aside with a quick sweep of your fingertip.` → `It is like sliding a sheet of paper across a desk with your fingertip pressed on it to move it aside.` |
| L2 | LOW **建議修** | `terms[3](マルチタッチインタフェース).hook_jp` / `hook_zh` / `hook_en` (+ 派生 `memory_hook_*`, `summary.memory_hooks_*[3]`) | 接頭語の仲間の例に「マルチタスク」/「多任务」/ "multitasking" を挙げるが、これは引用題 2017h29h-q059 の誤答肢ウ (zh 訳「多任务处理」、en "Multitasking")。型 (9) の当てはめ: フックは「ここでは触れる点が複数」で終わるので q059 に当てても正答エを選ぶ → MEDIUM には当たらないが、引用題の誤答肢を記憶の手がかりに並べる必要はない (q059 の誤答 3 肢のうち 2 つが本単元の文に出る: M1 と本件) | jp `マルチメディア、マルチタスクと同じ接頭語で、` → `マルチメディアなどと同じ接頭語で、` / zh `与多媒体、多任务中的 multi 是同一个前缀，` → `与多媒体等词中的 multi 是同一个前缀，` / en `It is the same prefix as in multimedia and multitasking, and here` → `It is the same prefix as in multimedia, and here` |
| L3 | LOW **建議修** | `terms[1](人間中心設計).hook_en` (+ 派生 `memory_hook_en`, `summary.memory_hooks_en[1]`) | 観点 7 の措辞級: `term_en` は "Human-Centered Design" なのに hook_en は "In English it is Human-Centred Design (HCD)." で、summary では "Human-Centered Design: In English it is Human-Centred Design (HCD)." と同じ行に 2 綴りが並ぶ。jp / zh は英語綴りの紹介として成り立つので変更不要 | en `In English it is Human-Centred Design (HCD).` → `It is abbreviated HCD.` |
| L4 | LOW **建議修** | `terms[0](ユーザビリティ).detail_jp` / `detail_zh` / `detail_en` (+ 派生 `explanation_*`) | D-205: 有効さ・効率・満足度 (規格の定義の構成要素) を one・図・`pairs[0].rows[1]`・`key_points[0]` で版なし・「例えば」なしに言い切る。ISO 9241-11:1998 / 2018、JIS Z 8521:1999 / 2020 で 3 要素は不変 (本監査の知識による照合、原文未取得) のため前例どおり LOW。出典の版を detail の末尾に 1 文足す (one・図は変えない)。本監査で ISO 公式頁 (iso.org/standard/63500.html・ISO OBP) の取得を試みたが HTTP 403 で未取得。補丁前に ISO OBP / JISC で一次確認すること | jp 末尾に追記: `…ユーザビリティを高める手段になる。` → `…ユーザビリティを高める手段になる。有効さ・効率・満足度の 3 つで捉えるのは、ISO 9241-11:2018 (JIS Z 8521:2020) の定義による。` / zh `…也是提高易用性的手段之一。` → `…也是提高易用性的手段之一。用有效性、效率、满意度这三点来把握，依据的是 ISO 9241-11:2018（JIS Z 8521:2020）的定义。` / en `…is also a way to raise usability.` → `…is also a way to raise usability. Framing it by effectiveness, efficiency and satisfaction follows the definition in ISO 9241-11:2018 (JIS Z 8521:2020).` |
| L5 | LOW **建議修** | `terms[3].detail_zh`、`terms[3].fig.data.rows[0].cells[0].zh` / `rows[1].cells[0].zh`、`pairs[1].rows[2].b_zh` | u02 との zh 訳語不一致: u01 は ピンチアウト =「张开」・ピンチイン =「捏合」、u02 は「向外张开」・「向内捏合」で、u02 では「捏合」= 見出し語 ピンチ (zh_terms「捏合（Pinch）」、両方向の総称)。同じ「捏合」が単元ごとに縮小だけ / 総称を指す。u02 側にそろえる | `terms[3].detail_zh`: `**张开**[[jp:ピンチアウト]]` → `**向外张开**[[jp:ピンチアウト]]`、`**捏合**[[jp:ピンチイン]]` → `**向内捏合**[[jp:ピンチイン]]` / `fig.data.rows[0].cells[0].zh` `张开` → `向外张开` / `rows[1].cells[0].zh` `捏合` → `向内捏合` / `pairs[1].rows[2].b_zh` `捏合、张开` → `向内捏合、向外张开` (key_points_zh[2] の動詞「张开、捏合」は操作名でないので据え置き) |
| L6 | LOW | `terms[1].fig.data.nodes[0..3]` | HCD の 4 活動 (ISO 9241-210 由来) を図が版なしで示す。detail が「例えば」で開いており、図はその段階化、2010 / 2019 版で不変 (r2 low と同旨) | 記録のみ |
| L7 | LOW | loc-review r1 の未反映 LOW: `terms[5].one_zh` (滑动…**滑动** の循環定義)、`pairs[2].rows[0].a_zh` / `terms[5].points[0].text_zh` (不离开触碰位置…松开)、`terms[6].one_zh` (括弧内太字)、`terms[0].points[1].text_zh/en` (ユーザビリティ の太字が jp にない)、`terms[0].detail_zh` 等「工夫」、`terms[6].one_en` "answers with sound"、`terms[2].detail_en` "Its strength is"、`terms[2..3].one_en` 冠詞、`overview_cols_en[1]` | いずれも事実・判定に影響しない訳の自然さ。loc-review の fix_jp が具体的なので、補丁に同梱してよい (任意) | 記録のみ (任意で loc-review r1 の fix_jp どおり) |
| L8 | LOW | `terms[3].points[0]`、`terms[0].detail_jp` 2 文目 / `points[0..1]` / `key_points_jp[0]` | D-203 §9: マルチタッチ exam 考点は one の言い直し、「入力の手間を減らす工夫がユーザビリティを高める」が 4 欄に出る (r1 / r2 low と同旨)。考点は個別の事実で引用題と一致 | 記録のみ |
| L9 | LOW | `terms[4].one_*`「最も基本的な」/ `terms[4].points[0]` ↔ u02 ロングプレス考点 / `terms[5].hook_*`「さっとこする・払う」/ `pairs[2].rows[2].b_*` | ① タップを「最も基本的な」と最上級で言う (v1 継承、支持題なし、一般的な言い方で誤学習には至らない); ② タップ / 長押し の時間による区別が u01 と u02 の両方の考点に出る (単元をまたぐ重複); ③ スワイプ hook の辞書的語義に「払う」(語義としては正しい、L1 の比喩を直せば フリック 像は残らない); ④ スワイプ ≒ ホイールスクロール は用途での対応 (r2 low) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① ユーザビリティ = 品質 / HCD = 進め方: `goals[0]` (予告)・`terms[1].points[0]`・`pairs[0].rows[0]` → 許容 (goals は予告で内容の反復に数えない)。② ジェスチャー = 総称・触れない手振りも / マルチタッチ = 画面上の複数点: `terms[3].points[1]`・`pairs[1].rows[0..1]` → 許容。③ タップ / スワイプ = 指を動かすか: `terms[5].points[0]`・`pairs[2].rows[0]` → 許容。④ タップ / 長押し: `terms[4].points[0]` のみ (u02 との重複は L9)。⑤ VUI / ジェスチャー = 入力手段: `terms[6].points[0]` のみ。⑥ ユーザビリティ / アクセシビリティ: `terms[0].points[2]` のみ。

**JP-review の HIGH / MEDIUM の解消 (退行なし)**: r1 で指摘された MEDIUM 2 件 — (a) `terms[0].fig.data.rows` の例の列の重なり → 現行 3 行は「誤りなく確定」/「少ない画面遷移」/「また使いたい」で同じ語の重複なし、zh / en も同内容 = 解消; (b) `terms[2].fig.data.root.children[0].children` の未定義操作名 → 「1 本の指で触れる操作」「複数の指で同時に触れる操作」(zh / en 同) = 解消。r1 low の hook 語源 (use + ability) → usable + -ity に修正済み、「見た目の美しさではなく」削除済み。r2 は PASS (low 4)。HIGH は全回 0。

**範囲外の観察** (書き直し対象外):
- O1 `source_figures` (2011h23tokubetsu-q099 / q097 の Web サイト構成図・懸賞ページ案、2014h26a-q093 のワークシート) は本単元の見出し語 (ユーザビリティ〜VUI) の内容と関係が薄い v1 継承のメタデータ。本文・図からは参照されない。
- O2 `unit_summary_*` は v1 と同文 (未改稿)。事実は正しい。

確認済みで問題なし: 限定条件 (exam 考点 3 件全て保持、§2)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤77 字)、D-198 写し (validate 0、独立照合は「User Interface」の偽陽性 1 件のみ、遮蔽後 0、近似照合も同偽陽性のみ、(iii) 非該当)、D-210 (版に依拠する題なし)、型 (1) (2) (3) (4) (7) (10) 該当 0、`[[jp:]]` 原語 15 種全て jp 本文に実在、one_zh / one_en の見出し語併記 (7/7)、zh 訳語表、図種 (table static ×2 / flow steps ×2 / tree static ×1 / 図なし ×2 = 登録内)、派生フィールド一致 (54 箇所)、用語・`term_zh`・`term_en` の v1 不変量、前回 MEDIUM 2 件の三語解消。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **9** (建議修 5: L1〜L5 / 記録のみ 4: L6〜L9) |

## 5. 判定

**FAIL → B3 補丁で PASS 可** (D-199: MEDIUM 1)。全 7 用語・考点 9 件 (qid 付き 3 件)・引用 3 題 + quiz / challenge のみ 1 題で、jp の事実は正答と一致し、誤答肢を支持する考点・限定条件の落ちは無い。MEDIUM は zh の訳語 1 箇所 (M1、型 (6)) のみで、B3 補丁 (`terms[4].detail_zh` の文字列置換) で解消できる。建議修 L1〜L5 も同じ補丁に同梱を推奨 (L4 は一次確認後)。補丁後に validate / parity を再実行し、M1 の解消を patch re-review で確認すること。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-19-51-u01
✓ technology-19-51-u01 unit: 0 issues (data/ip/textbook/units/technology-19-51-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-19-51-u01
✓ technology-19-51-u01 parity: 33 locations, 0 diff
EXIT=0
```
