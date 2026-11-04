# Rule A 全数抽検 — strategy-01-03-u04 (資産・負債の区分)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成、補丁の試し当ては scratchpad の複製で実施)。
- **Date**: 2026-11-04 (S142 第 12 批 b12)、repo HEAD `e38e4a3` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b12-u04-a2` merge 結果 [attempt 2: a2 `jp.r0` は a1 `jp.r1` sha `27700d54…` + a1 jp-review #2 を種、a2 jp-review 1 輪目 PASS、`loc.r0` → loc-review 1 輪目 PASS]、sha256 先頭 `7292e9a5db77a7d0`、`merged.json` と同一)。
- **対象**: `data/ip/textbook/units/strategy-01-03-u04.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (流動資産 / 固定資産 / 有形資産 / 無形資産 / 繰延資産 / 流動負債 / 固定負債) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 (one_zh / one_en の `[[jp:]]` 見出し語、書き方 7・8・9)、D-203 (観点 8 対比反復・§6・§9 言い直し = low、観点 7 = medium [事実誤りなら high]、観点 9 限定条件落ち = high)、D-204 (比喩・hook の像が考点・detail の否定する内容を運べば medium) / D-205 (改訂される文書の構成数・名称に版か「例えば」)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `.planning/v2/strategy-01-03-u04/v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致、`unit_summary_*` は v1 と同文)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_* / overview.intro_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。hook は 固定資産・繰延資産・固定負債 の 3 語のみ (他 4 語は空、許容)。
2. **考点 × 引用題 (考点 全 12 件 = exam 6 + mix 6、うち qid 付き 6 件、引用 qid 延べ 7 件 = 異なり 4 題、全題 topic `strategy-01-03`)**: `data/ip/quiz/questions.json` の `correct_answer`・選択肢と、`translations/<exam>.json` の `stem_jp_clean` (2025r07-q026 は raw `stem_jp` の表が OCR 崩れ [取引内訳・金額が別物]、clean で判定) を再読。考点の主張が正答と一致し、誤答肢を支持せず、題が支持しない一般化・限定をせず、題の前提 (限定条件) を外していないことを 1 件ずつ確認。計算題 3 題を自分で再計算: 2025r07-q026 = 売上計上済み・未回収の ③ 1,300 + ④ 1,000 = 2,300 (正答ウ; ①② は回収済み、⑤ は受注のみで含まない) / 2015h27a-q026 = (480,000 − 300,000) × 0.625 = 112,500 (正答ア) / 2022r04-q028 = 3,000 ÷ 1,500 × 100 = 200 (正答エ)。2012h24h-q020 = 自社利用ソフトウェアは定額法 (正答ウ; 誤答 = 任意選択・定額 + 定率の併用・定率法)。
3. **quiz / challenge_questions** (quiz 計 6 枠 [流動資産 1・固定資産 2・有形資産 1・無形資産 1・流動負債 1、繰延資産・固定負債は 0 = 出題 0 語] + challenge 4 題 = 2025r07-q026 / 2015h27a-q026 / 2012h24h-q020 / 2022r04-q028、全て本文で引用済み): 本文と矛盾しないことを確認。未引用の quiz / challenge は無い。
4. **D-198 写し**: validate の copy guard (本文 + 図ラベル・caption・総表・対比表) = 0 件。独立照合として単元の JP 文字列 123 本 (派生フィールド除く、`unit_summary_jp` 含む) を topic 内全 90 題の題文 (raw `stem_jp` + `stem_jp_clean`) + 選択肢と 12 字連続照合 (記法・句読点・記号・空白除去)。**(イ) カタカナ 4 字以上と英数を □ 1 字に遮蔽** (見出し語は遮蔽しない、実字 6 未満の窓は除外) → **0 件**、**(ロ) 遮蔽なし** → **0 件**。**近似一致** (文単位、bigram Dice ≥ 0.33 を全列挙; 較正 = HIGH 例 ed 0.14 / Dice 0.52): 候補 **1 件のみ** = `terms[3].points[0].text_jp` ↔ 2012h24h-q020 の題文 (Dice 0.41 / ed 0.50)。重なりは題の前提「自社の業務で使うためにソフトウェアを買った」を言い換えた部分で、これは観点 9 が保持を求める限定条件 (市場販売目的のソフトとの判別点)。表現は別 (通常の業務に利用 → 業務で使う、購入し資産計上 → 買った … 計上し) で、1〜2 字置換の近似写しではない。**(iii) 数値**: 単元に数値例は無く (1年・× 100 の式のみ)、引用題の数値 (800 / 500 / 1,300 / 480,000 / 0.625 / 3,000 等) は一切使っていない。**目視**: カタカナの多い文はソフトウェアを含む 4 文のみで、いずれも引用題の文の並びではない。比喩 (八百屋の仕入れと売上・家や車・店舗の建物と厨房機械の写真・発明の権利と業務用ソフト・開店準備費の分担・家賃とカード代金・住宅ローン) はいずれも引用題に無い場面。
5. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 2〜3 文 (3/3/2/2/2/2/2 文)、比喩・フックが定義の言い換えでないこと (例外は L9)、定義前使用 (1年基準 = 流動資産 detail で定義 → 流動負債 detail・key_points で使用 / 耐用年数・減価償却 = 固定資産 detail で定義 → 有形資産の図・detail で使用 [a1 r1 L 解消] / 棚卸資産 = 流動資産 detail、図は「商品（在庫）」と書き定義前使用なし [a1 r2 L 解消] / 創立費 = 繰延資産 detail、図 step 1 は「会社の設立や開業の準備」と書き用語を使わない [a1 r1 L 解消] / 未償却残高・償却率 = 図の括弧注 / 投資その他の資産 = 固定資産 mix 考点内で文脈定義 / 社債 = 固定負債 detail / 純資産 = 前提単元 u03; 取得原価・支払手形は未定義 → L11)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → `freq_badge`「頻出」と `terms[5].analogy_jp` の 2 件のみ: 「とされる」は「引き落と**される**」の部分一致、「必ず」は支払義務を述べる通常の用法で定型締め句ではない → 偽陽性。zh・en 相当語の grep ヒット [`analogy_zh` 一定 / `analogy_en`・`terms[6].points[0].text_en` must / example 内の exam] も通常の用法で偽陽性)、図の型 (流動資産 = flow steps 4 / 固定資産 = tree static / 有形資産 = compare static / 繰延資産 = flow steps 3 / 無形資産・流動負債・固定負債 = 図なし; registry `types.ts` の 6 種 [svg / table / compare / flow / tree / network] の内)、**段階図の caption は全 7 本とも 1 文** (D-195 §2、a1 r2 M 解消)、pair 配置 (流動資産→固定資産 は固定資産の後、有形→無形 は無形の後、流動負債→固定負債 は固定負債の後、各組 key 行 1)。
6. **D-200**: 考点数 2/2/2/1/2/2/1 (≤3 ✓)、各 JP 文数 1〜2・字数 39〜71 (≤100 ✓、最大は固定資産 `points[0]` の 71 字)。**framing 件数** (validateV2 `POINT_FRAMING`、全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 / D-204 単元全体点検 (範囲の一致)**: 7 語の定義の範囲を one / overview_rows / pairs / 図 / 考点 / goals / key_points で照合 → §3 の対照表。書き方 8 (対比の出現欄を列挙) → L10。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → L9。比喩・hook 10 件の D-204 → medium 0 (§3)。
8. **D-205**: 改訂される文書 (法令) に由来する構成として、固定資産の図 (tree) の 3 区分 (有形固定資産 / 無形固定資産 / 投資その他の資産) と、繰延資産 mix 考点の「資産の部で流動資産・固定資産と並ぶ」(資産の部 3 区分) がある → L6。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 34 種が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 7 用語に見出し語の `[[jp:]]` あり (D-202)、zh 訳語が `zh_terms.json` (本単元分 18 語) に従うこと (validate の B6 warn 0; 流动资产 / 固定资产 / 有形资产 / 无形资产 / 递延资产 / 流动负债 / 固定负债 / 流动比率 / 净资产 一致)。validate の jp-origin warn 2 件 → L7。
10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。建議修 L1〜L5 を scratchpad の複製に当てた版も `--file` で validate 0 issues (warn は同じ 2 件のみ)、新 JP 文字列 4 本は topic 90 題と 12 字一致 0。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 流動資産 | OK — exam 1 / 1 題: 売掛金は売上計上で生じ回収で消え、受注だけでは生じない (2025r07-q026 正答ウ 2,300、再計算一致; ⑤ 受注のみを除く判別点そのもの) / mix: 本業の流れの中の資産は1年を超えそうでも流動、期間だけで決まらない (営業循環基準、正しい)。flow steps 4 (現金→商品→売掛金→現金) は detail の循環と一致 | OK | detail_en の修飾の曖昧さ (L5) | L5, L8, L12 |
| 2 | 固定資産 | OK — exam 1 / 2 題: 使って価値が減る固定資産 (建物・機械・業務用ソフト) は買ったとき資産計上し、使用期間にわたり償却で費用化 (2015h27a-q026 正答ア / 2012h24h-q020 正答ウ; 償却方法は限定せず、定率・定額のどちらの題とも整合。「使って価値が減る」の限定で土地を含めない) / mix: 長期保有目的の株式 = 投資その他の資産 (固定)、短期売買目的 = 流動 (正しい)。tree (有形 / 無形 / 投資その他) は mix 考点と一致 | OK (D-205 → L6) | software の「折旧 / depreciation」(L13) | L1 (総表), L3 (goals), L6, L9, L10 |
| 3 | 有形資産 | OK — exam 1 / 1 題: 定率法 = (取得原価 − 前年度までの償却累計額) × 償却率 (2015h27a-q026 正答ア 112,500、再計算一致; 題の前提「有形固定資産」は one と一致) / mix: 販売用の商品は形があっても棚卸資産として流動、有形固定資産に入らない (正しい)。compare (定額 = 毎期同額・総額 ÷ 耐用年数 / 定率 = 初年度ほど多い・未償却残高 × 償却率) 正しい | OK | OK | L4, L7, L11 |
| 4 | 無形資産 | OK — exam 1 / 1 題: 自社の業務で使うために買ったソフトウェアは無形固定資産、定額法で償却 (2012h24h-q020 正答ウ; 限定条件「自社の (通常の) 業務で使うため」保持、誤答の定率法・併用を支持しない)。detail ののれん = 買収時に純資産を超えて支払った額 (取得のれんのみ) 正しい。図なし | OK (近似 Dice 0.41 は限定条件の保持、§1-4) | OK | なし |
| 5 | 繰延資産 | OK — 出題 0 語、mix 2: 固定資産の内訳ではなく資産の部で流動・固定と並ぶ別区分 (会社計算規則の資産の部 3 区分、正しい) / 支払い済み費用の繰越しなので売って換金できない (正しい)。flow steps 3 (原則は支払期の費用 → 例外として繰延資産に計上 → 効果の及ぶ期間に償却) は創立費・開業費の扱いとして正しい | OK (D-205 → L6) | OK | L6, L9 |
| 6 | 流動負債 | OK — exam 1 / 1 題: 流動比率 = 流動資産 ÷ 流動負債 × 100 (%)、大きいほど短期の支払余力 (2022r04-q028 正答エ 200、再計算一致; 題の「短期の支払能力」と一致) / mix: 売掛金 = 権利 → 流動資産、買掛金 = 義務 → 流動負債 (正しい)。図なし | OK | OK | L2, L11 |
| 7 | 固定負債 | OK — 出題 0 語、mix 1: 社債は返済義務のある借入れで純資産でなく負債 (正しい)。detail: 長期借入金のうち1年以内返済分は流動負債へ振り替え (正しい、1年基準と整合)、退職給付引当金を固定負債の例とする (正しい)。図なし | OK | 退职福利准备金 (L13) | L9, L12 |

**単元レベル**: goals 3 点・overview_cols 2 (区分の決め手 / 例)・overview_rows 7 行・pairs 3 組 (流動資産 / 固定資産 3 行 key 1、有形資産 / 無形資産 3 行 key 1、流動負債 / 固定負債 2 行 key 1)・key_points 3・summary (記法除去版と一致)・challenge_questions 4 件 (§1-3)。事実誤りなし、三語一致 (訳語の任意改善は L13)。

## 3. 前回 MEDIUM の解消確認 (a1 #1 / a1 #2、回帰なし) と範囲の対照

| 前回 MEDIUM | 現在の該当欄 | 判定 |
|---|---|---|
| a1 r1: 有形資産 analogy「価値が目減り」(土地は償却しない detail と矛盾) | `terms[2].analogy_*` =「店が何年も使い続ける持ち物のうち、店舗の建物や厨房の機械のように写真に写せるもの」 | **解消**。目減りの像なし、「何年も使い続ける」で商品 (販売用) も除かれ mix 考点と整合 |
| a1 r1: 固定資産 = 「事業のために使う」限定 (図・考点の長期保有株式と矛盾) | `terms[1].one_*`・`overview_rows[1].one_line_*`・`pairs[0].rows[0].b_*` = 本業の流れの外 + 1年を超えて持ち続ける / `pairs[0].rows[2].b_*` =「事業に使う、または長期に保有する」 | **解消**。投資その他の資産 (長期保有株式) が定義・対比表・図・mix 考点の全てに収まる |
| a1 r1: key_points / goals の「資産も負債も流動と固定に分ける」(繰延資産と矛盾) | `goals_*[0]`・`key_points_*[0]` (+ 派生 `overview.intro_*`・`summary.key_points_*[0]`) =「繰延資産を除く資産と負債は…」 | **解消** (三語とも)。繰延資産 mix 考点 (資産の部の別区分) と整合 |
| a1 r1: 流動資産 analogy「すぐ支払いに回せる」(期間だけで決まらない mix 考点と矛盾) | `terms[0].analogy_*` = 八百屋の仕入れ→販売→現金の循環 | **解消**。換金の速さの像なし、detail・図の本業循環と同じ手がかり |
| a1 r2: 有形資産 one が形のある資産全般 (商品を含み得る) | `terms[2].one_*` =「固定資産のうち…物として形のある資産」/ `overview_rows[2]` =「物として形のある固定資産」 | **解消**。mix 考点 (販売用商品は有形固定資産に入らない) と整合 |
| a1 r2: 流動負債 (本業 or 1年以内) と固定負債 (1年超のみ) が重なる | `terms[6].one_*`・`overview_rows[6].one_line_*`・`pairs[2].rows[0].b_*` = 本業の取引以外で生じ **かつ** 1年を超えて先 / 流動負債 = 本業の取引で生じた **か** 1年以内 | **解消**。補集合として対称 (資産側と同型)、重なり・漏れなし。`overview_rows[6].extra_*[0]` も両条件 |
| a1 r2: 無形資産 analogy「店の評判」(自己創設のれんの計上を示唆) | `terms[3].analogy_*` =「お金を払って手に入れ…発明の権利や業務用のソフト」 | **解消**。取得して計上するものだけ、detail ののれん (買収時の超過支払額) と整合 |
| a1 r2: 繰延資産 `fig.steps[0].caption_jp` が 2 文 (D-195 §2) | 同 caption =「…支払った費用は、原則として支払った期の費用になる。」 | **解消**。段階図 caption 全 7 本 (流動資産 4・繰延資産 3) が三語とも 1 文 |

**範囲の対照 (7 語 × 欄)**: 流動資産 = one・総表 one_line・総表 決め手・pairs key・detail・mix 考点 で「本業の流れ or 1年以内」一致。固定資産 = one・総表 one_line・pairs key・mix 考点・図 で「本業の流れの外 and 1年超」一致、**総表 決め手 `overview_rows[1].extra_*[0]` だけが「1年を超えて持ち続けるか」と期間のみ** → L1。有形資産 = 「固定資産のうち形あり」で one・総表・図 (tree の有形固定資産)・mix 考点 一致。無形資産 = 「形なし・長く使う固定資産」で one・総表・pairs・detail 一致 (pairs key 行は「形がない」だけだが同用語 one が「長く使って収益を生む」で投資その他の資産と分ける → goals[1] の言い方と併せ L3)。繰延資産 = goals[0]・key_points[0] で流動/固定の外に置き、mix 考点で別区分 一致。流動負債 / 固定負債 = 上表のとおり対称。比喩 10 件 (analogy 7 + hook 3) の D-204: 土地 (減価償却しない) の像に反する比喩なし、流動資産の比喩は換金の速さでなく循環、無形資産の比喩は計上されない評判を含まない → medium 0 (流動負債の比喩は L2)。

## 4. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 13 (うち 建議修 5)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `overview_rows[1](固定資産).extra_jp/zh/en[0]` (列「区分の決め手」) | 決め手を「1年を超えて持ち続けるか」と期間だけで書き、同じ行の one_line・one・pairs key 行の「本業の流れの外」を落としている。固定負債の行 (`overview_rows[6].extra[0]`) は両条件を書いており非対称。流動資産 mix 考点「期間だけで決まるわけではない」と単独では食い違うが、同じ行の one_line と流動資産の行 (or 規則が先) で表としては正しく分類できるため medium にはしない | jp「1年を超えて持ち続けるか」→「本業の流れの外で、1年を超えて持ち続けるか」/ zh「是否持有超过1年」→「是否处于主营业务循环之外、持有超过1年」/ en "Held for more than one year" → "Outside the core business flow, held for more than one year" (JP 20 字、12 字一致 0) |
| L2 | LOW **建議修** | `terms[5](流動負債).analogy_jp/zh/en` | 像が「近いうちに必ず払う借り」(期限の近さ) だけで、one の二条件のうち「本業の取引で生じた」側を運ばない。家賃・カード代金は1年基準でも流動で正しく、流動負債には期限の近さを否定する考点も無いので D-204 medium ではない。流動資産の比喩 (八百屋の循環) と組にして、代表例 買掛金 と結ぶ方が手がかりとして強い (§9 grep のヒットは偽陽性で、修正理由ではない) | jp「月末に払う家賃や、来月引き落とされるカードの代金のように、近いうちに必ず払わなければならない借り。」→「八百屋が仕入れた野菜の代金を月末にまとめて払う約束のように、商売を回す中で生まれ、近いうちに払う借り。」/ zh「就像月底要交的房租、下个月要扣款的信用卡账单一样，是近期一定要还的欠款。」→「就像菜店把进菜的货款留到月底一起付的约定一样，是在做生意的循环中产生、近期要支付的欠款。」/ en "Like rent due at the end of the month or a card bill debited next month, debts that must be paid soon." → "Like a greengrocer's promise to pay for the vegetables it bought in one lump at the end of the month, a debt that arises in the course of running the business and is paid soon." (JP 48 字、12 字一致 0) |
| L3 | LOW **建議修** | `goals_jp/zh/en[1]` (+ 派生 `overview.intro_*`) | 「固定資産を形の有無で分け」は、固定資産の図 (tree) と mix 考点が置く第 3 の区分 投資その他の資産 (長期保有株式 = 形なし、無形固定資産でもない) を外した言い方。形の有無で分けると「形なし」側に株式も入り、無形資産と読める。detail は「例えば」付きで問題なし | jp「固定資産を形の有無で分け、**減価償却**の考え方を説明できる。」→「固定資産のうち長く使う資産を形の有無で有形と無形に分け、**減価償却**の考え方を説明できる。」/ zh「能够按有无实物形态划分固定资产，并说明**折旧**的思路。」→「能够把固定资产中长期使用的资产按有无实物形态分为有形与无形，并说明**折旧**的思路。」/ en "Divide non-current assets by whether they have physical form, and explain the idea behind **depreciation**." → "Divide the non-current assets a company uses over a long period into tangible and intangible by whether they have physical form, and explain the idea behind **depreciation**." (JP 41 字、12 字一致 0) |
| L4 | LOW **建議修** | `terms[2](有形資産).detail_jp/zh/en` 1 文目 (+ 派生 `explanation_*`) | 「減価償却のやり方には、図の定額法と定率法がある」は方法がこの 2 つだけと読める (生産高比例法等もある; a2 jp-review r1 L) | jp「減価償却のやり方には、図の**定額法**と**定率法**がある。」→「減価償却の代表的なやり方に、図の**定額法**と**定率法**がある。」/ zh「折旧的方法有图中的**直线法**」→「折旧的代表性方法有图中的**直线法**」/ en "Depreciation can be calculated with the **straight-line method** ([[jp:定額法]]) or the **declining-balance method** ([[jp:定率法]]) shown in the figure." → "Two representative ways to calculate depreciation are the **straight-line method** ([[jp:定額法]]) and the **declining-balance method** ([[jp:定率法]]) shown in the figure." |
| L5 | LOW **建議修** | `terms[0](流動資産).detail_en` (+ 派生 `explanation_en`) | "the right to collect payment for goods sold later" の later が sold に掛かり「後で売る商品」と読める (loc-review r1 L、未適用)。jp は「売った代金を後で受け取る権利」 | en "the right to collect payment for goods sold later," → "the right to collect payment later for goods already sold," |
| L6 | LOW | `terms[1].fig.data.root.children` (3 区分)、`terms[4].points[0].text_*` (資産の部 3 区分) | D-205 の境界: 会社計算規則 (法令) の表示区分の構成を版・「例えば」なしで示す (detail は「例えば」付き)。ただし両構成は引用題の年度 (2009〜2025) を通じて変わっておらず、図ラベルに「例えば」を入れる場所もない。版の誤りの危険は無い (a1 r1 L 観点 10 と同判断) | 記録のみ |
| L7 | LOW | `terms[2](有形資産).points[1].text_zh/en` (validate warn jp-origin 固定資産 ×2) | warn は text_jp「有形固定資産には入らない」の部分文字列「固定資産」に反応したもの。この考点が名指しする語は 有形固定資産 で、zh / en は `[[jp:有形固定資産]]` を併記済み。`[[jp:固定資産]]` を足すと jp 本文に無い独立の言及を作り原語の付け方として誤るので、修正しない (loc-review r1 と同判断) | 記録のみ (対応不要) |
| L8 | LOW | `terms[0](流動資産).quiz` | 2022r04-q028 は term_questions で流動資産にも結び付くが流動資産の quiz に無い (流動負債の quiz にのみ; a1 r2 / a2 r1 L)。誤りではない | 記録のみ |
| L9 | LOW | `terms[1].hook_*`、`terms[4].hook_*` 2 文目、`terms[6].hook_*` | 固定資産 hook「その場に据えて動かさない」は字義の手がかりだが同用語 analogy の「車」と像がずれ、定義の言い換えに近い / 繰延資産 hook 2 文目は one の言い直し / 固定負債 hook は例の社債の「債」を説明し見出し語の手がかりとして弱い (D-195 §6、a1 r2 / a2 r1 L) | 記録のみ |
| L10 | LOW | 流動 / 固定: `pairs[0].rows[0]`・`pairs[2].rows[0]` (key)、`goals[0]`、`key_points[0]`、流動資産 mix・固定資産 mix・繰延資産 mix; 有形 / 無形: `pairs[1].rows[0]`、`terms[1].detail` 3 文目、`goals[1]`; 定額 / 定率: `terms[2].fig`・`detail`・`terms[3].points[0]` | 書き方 8 の同じ対比の 3 箇所目以降 (overview 総表は D-195 §3 の構造、one は定義そのもので数えない; a2 r1 L) | 記録のみ (key_points / goals は単元の要約・予告) |
| L11 | LOW | `terms[5].detail_*` 1 文目、`terms[2].points[0].text_*` | 1 文に例 4 つ (買掛金・支払手形・短期借入金・未払金) を並べる (見出し語でないので D-197 機械検査外; §9 趣旨では多い) / 支払手形・取得原価は単元内で未定義 (文脈で推測可) | 記録のみ |
| L12 | LOW | `pairs[0].rows[2].a_*`、`terms[6].analogy_*` | 「持つ目的: 回して現金に戻す」は本業循環側だけで、1年基準で流動になる短期売買株式等を言わない (補助行、a2 r1 L) / 固定負債の比喩 (住宅ローン全体が長期) は detail の「1年以内返済分は流動へ振り替え」を運ばないが否定もしない | 記録のみ |
| L13 | LOW | `terms[4].detail_zh`・`overview_rows[4].extra_zh[1]`・`key_points_zh[2]` (开办费)、`terms[6].detail_zh` (退职福利准备金)、`terms[0].detail_zh` 等 (一年基准)、`terms[1].fig` en (fixed / non-current 混在)、`terms[4].hook_zh/en`・`terms[1].hook_en` (`[[jp:]]` なしの原語)、`pairs[1].rows[2].label_zh`・`terms[2].fig` zh (直訳調)、`terms[1].points[0].text_zh/en` (software の償却を 折旧 / depreciation [[jp:減価償却]] と訳す; jp は「償却」) | loc-review r1 の LOW が未適用 + software の訳語。いずれも誤訳ではない (日本の税法・引用題 2012h24h-q020 もソフトウェアに「減価償却」を使う) | 記録のみ (任意の修正案は loc-review r1 の fix_jp どおり) |

**範囲外の観察**:
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。事実は正しい。
- O2 `[[jp:]]` 併記量: 有形資産 exam 考点の zh / en は 6 語 (定率法・減価償却費・取得原価・償却累計額・未償却残高・償却率) を併記し多めだが、計算式の構成語で読みを妨げるほどではない。

確認済みで問題なし: 前回 MEDIUM 8 件の解消と回帰なし (§3)、7 語の定義範囲の一致 (§3、総表 決め手 1 欄のみ L1)、限定条件 (考点 12 件全て保持、§2)、計算題 3 題の再計算一致、§9 禁止句 grep (定型締め句 0、ヒット 2 件は偽陽性)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤3・≤2 文・≤71 字)、段階図 caption 1 文 (7/7)、写し (validate 0、独立照合 0、近似 1 件は限定条件の保持)、`[[jp:]]` 原語 (34 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (7/7)、zh 訳語表 (B6 warn 0)、図種 (flow steps ×2 / tree static ×1 / compare static ×1 / 図なし ×3 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。

## 5. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **13** (建議修 5: L1〜L5 / 記録のみ 8: L6〜L13) |

## 6. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 7 用語・考点 12 件 (qid 付き 6 件)・引用 4 題 (計算 3 題を再計算) で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。a1 #1 / #2 の MEDIUM 8 件は全て解消し回帰なし。建議修 L1〜L5 (いずれも 1 欄内の文字列置換、構造変更なし、複製への試し当てで validate 0 issues) は補丁 (B3) で修正推奨、L6〜L13 はバッチ証拠の「未修 LOW」表へ。validate の D-202 warn 2 件は部分文字列の偽陽性で修正不要 (L7)。

## 7. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-03-u04
✓ strategy-01-03-u04 unit: 0 issues (data/ip/textbook/units/strategy-01-03-u04.json), 2 warning(s)
  warn  jp-origin  terms[2](有形資産).points[1].text_zh  固定資産: headword named in text_jp without [[jp:固定資産]] at its first 考点 occurrence (D-202)
  warn  jp-origin  terms[2](有形資産).points[1].text_en  固定資産: headword named in text_jp without [[jp:固定資産]] at its first 考点 occurrence (D-202)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-03-u04
✓ strategy-01-03-u04 parity: 32 locations, 0 diff
EXIT=0
```
