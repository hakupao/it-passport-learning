# Rule A 全数抽検 — technology-18-49-u04 (出力装置(表示・印刷))

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 補丁案の検証用コピーは scratchpad のみ)。
- **Date**: 2026-11-08 (S151 b64)、repo HEAD `d508d870` + 作業ツリー (単元 JSON は未コミットの書き直し版 = run `b64-u04-a1` merge 結果、sha256 先頭 `9bd2850d99ac6904`)。
- **対象**: `data/ip/textbook/units/technology-18-49-u04.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (液晶ディスプレイ / 有機ELディスプレイ / ヘッドマウントディスプレイ / プロジェクター / プリンター / 3Dプリンター) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-211、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `.planning/v2/technology-18-49-u04/v1-original.json` (用語 6 語・`term_zh`・`term_en` とも v1 と一致、スクリプト確認)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (node label・caption・table cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 6 件 = exam 6 / mix 0、引用 qid 延べ 7 = 異なり 7 題、全題 topic `technology-18-49`)**: `data/ip/quiz/questions.json` + translations の stem_jp_clean で各題の題文・選択肢・`correct_answer` を再読し、1 件ずつ照合 (§2)。数値の再計算: 2010h22h-q073 の解像度変更 (横×縦とも 4:3、画素数 1,228,800 → 786,432 = 0.64 倍、画面の大きさ不変なら 1 画素の一辺は 1.25 倍 → 文字は大きく = 正答イと一致)、VGA = 640×480 (正しい; q092 が挙げる規格名 2 つとは別の名前)、ppm = 1 分あたりのページ数・dpi = 1 インチ (2.54 cm) あたりのドット数 (正しい)。
3. **quiz / challenge_questions**: quiz 6 枠 (液晶 2 / プリンター 3 / 3D 1)、challenge 4 題 (2018h30a-q092 / 2014h26a-q049 / 2016h28h-q088 / 2019h31h-q080) は全て本文の引用題で、本文と矛盾しない。2022r04-q094 は考点の根拠だが quiz / challenge 外 (前回 JP-review の LOW、記録のみ)。topic 内の未引用題 17 題 (サーバ・スキャナー・タッチパネル・キーボード・ウェアラブル等) に本単元の主張と衝突するものなし。**topic 外の関連題**も検索: 2012h24h-q084 / 2013h25h-q054 (technology-20-53; dpi をプリンタ・スキャナの「解像度」の単位として問う) → L1 (§3)。
4. **D-198 写し**: validate の copy guard = 0 件、`warn choice-echo` の出力なし。独立照合: 単元の JP 文字列 106 本 (派生除く) を topic 内全 24 題の題文 (stem_jp_clean 優先) + 選択肢と 12 字連続照合 — (a) カタカナ 4 字以上・英数を □ に遮蔽 (遮蔽後実字 6 未満の窓は除外): **0 件**、(b) 遮蔽なし: **0 件**、(c) 1〜2 字置換の近似一致 (12 字窓 × 編集距離 ≤2): **0 件**。文単位の近似度 (校正: HIGH 例 ed 0.14 / Dice 0.52): 最も近いのは `terms[4].fig.data.rows[1].cells[1]` × 2016h28h-q088 題文 (ed 0.69 / Dice 0.37)、次いで `terms[4].points[1]` インクジェット側 × 2022r04-q094 正答肢 (0.67 / 0.28)、`overview_rows[5]` / `terms[5].points[0]` × 2019h31h-q080 正答肢 (0.65〜0.71 / 0.27〜0.31) — いずれも校正値から遠い。カタカナの多い文 (表の 3 方式行・考点 points[1]・3D の detail) は目視でも題の語句の並びを写していない。
5. **D-208 既知失敗型の明示点検**:
   - (1) (iii) 選択肢なぞり: `terms[4].points[1]` はレーザー方式とインクジェット方式を両側とも正の定義で対にした対比 (D-209 の免除)。2022r04-q094 (インクジェットの説明を選ぶ) では レーザー = 誤答肢、2016h28h-q088 (レーザーを選ぶ) では インクジェット = 誤答肢だが、考点は題の選択肢の組 (4 方式) も順序も再現せず、誤答肢の場面を否定する形でもない → 非該当。`terms[4].fig` 表 (インクジェット / レーザー / インパクト) は q088 / q094 の選択肢 4 方式のうち 3 つを含むが、熱転写・感熱を含まず順序も題と異なる方式比較表 (見出し語の一般分類) → 非該当、L3 で記録。`terms[4].points[2]` (ppm と dpi を両側とも正の定義で対に; dpi は 2014h26a-q049 の誤答肢) は D-209 の対比免除、q049 の他の誤答肢 (cpi / rpm) は出さない → 非該当。`terms[4].points[0]` / 表 rows[2].cells[2] の「同時に」は 2012h24a-q081 題文と共通の 1 語のみ (複写用紙を重ねる → 控えまで写る、と言い換え済み、誤答肢 3 方式は出さない) → 非該当。`terms[0].points[0]` は q073 の数値 (2 つの解像度) と誤答肢 (動画速度・画像の縮小・色数) を使わず一般則で述べる → 非該当。`terms[5].points[0]` は q080 の正答内容を見出し語の一般定義として述べ、誤答肢 3 つ (平面に 3D 効果画像・曲面への印刷・空間への立体像) の場面を否定しない → 非該当。
   - (2) 限定条件: `terms[0].points[0]`「画面の大きさを変えずに」(q073 の全画面表示の前提に対応) 保持。`key_points_jp[2]`「などがある」(熱転写・感熱方式を閉じない) 保持。`terms[1].detail`「曲げられる画面の製品もある」、`terms[5].detail`「樹脂などの材料」「3次元CAD など」保持。
   - (3) 別名を別物として教える: なし (インクジェット / レーザー / インパクトは別方式、VR / AR は別用途)。
   - (4) 比喩・図の範囲 (D-204): 液晶 = ブラインド (背面光を通す / 遮る、one・fig と一致)、有機EL = 夜のビルの窓明かり (部屋ごとに点灯 = 自発光、detail と一致)、HMD = 双眼鏡 (目の前の小さな画面が視界の大部分を占める; 前回 M2 の「映像だけが視界を占める」は削除済みで、AR の detail と衝突しない)、プロジェクター = 懐中電灯の影絵 (光で離れた面に映す)、プリンター 3 方式の比喩 (霧吹き / 粉 + アイロン / 判子; 判子の像は L6)、3D = 等高線の厚紙模型 (下から 1 層ずつ、fig・detail と一致)。
   - (5) zh / en の回帰: 前回修正点 (q092 の規格名、HMD 比喩) が zh / en にも残っていないこと確認 (SXGA / QVGA 0 件、HMD analogy_zh/en も双眼鏡)。
   - (6) zh / en の語が誤答肢寄り: なし (`硒鼓` は L7、誤答肢には寄らない)。
   - (7) D-210 改正前の版: 該当なし (法令・規格の改正を伴う題なし)。
   - (8) 比喩キーワードが他の見出し語の語幹: なし。
   - (9) フックを引用題に当てた場合: 3D hook (紙のプリンターに「高さ」が加わる) を q080 に当てると立体物を造形する正答を選び、平面に 3D 効果画像を刷る誤答には寄らない (「高さ」= 出来上がる物の次元)。impact hook (衝撃で下の紙まで写る) を q081 に当てると正答 (インパクト) を選ぶ。HMD hook (head + mount)・projector hook (前へ投げる)・EL hook (電気で光る)・液晶 hook (向きを変える光の門番) はいずれも引用題の誤答肢へ導かない。
   - (10) 法令・規格の範疇の閉じた列挙: なし。
6. **D-195**: 結論先行 (one = 1 文 × 6、太字あり)、展開 2 文 × 6。定義前使用: 画素 (液晶 detail の括弧注; 総表・図 caption で先に出るのは前回 LOW、一般語に近く記録のみ)、バックライト (液晶 detail)、解像度 (液晶 detail)、VR / AR (HMD detail の括弧注)、ルーメン (プロジェクター detail「光の量を表す」)、ppm / dpi (プリンター detail の括弧注)、トナー (表 rows[1] の括弧注「粉状のインク」)、ドラム (表 rows[1]「光で像を描いたドラム」; 前回 LOW の「感光ドラム」未説明は解消)、3次元CAD (形状データを作る道具として文脈で示す)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が; zh・en 相当語) → `terms[3].hook_jp`「と語源で覚える」1 件 (+ 派生 2) のみ、記憶フックの言い方で単元内 1 件 = 記録なし (前例どおり)。en の "exam" ヒットは points[].kind と "example" の偽陽性、"every" は図 caption の通常用法。図の型: 液晶 = flow steps 4、プリンター = static table (3 行 × 3 列、key 行 = インパクト)、3D = flow steps 4、有機EL / HMD / プロジェクター = 図なし — 全て登録内。pair 配置: 液晶→有機EL は有機ELの後、プリンター→3D は 3D の後、各組 key 行あり。
7. **D-200**: 考点数 2/0/0/0/3/1 (≤3 ✓)、各 JP 1 文・字数 65 / 42 / 47 / 69 / 61 / 45 (≤100 ✓)。**framing 件数** (`validateV2.pointFraming` を tsx で全考点に適用): jp 0 / zh 0 / en 0。
8. **D-205**: 改訂のある文書 (規格・法令・ガイドライン・知識体系) の構成要素の数・名前 — 該当なし。VGA = 640×480 は改訂のない規格名の 1 例で「例えば」付き。
9. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の整合: 液晶 one・detail・fig・pairs[0].a・overview_rows[0]・key_points[0] / 有機EL one・detail・pairs[0].b / プリンター detail・表・考点・key_points[2..3] / 3D one・detail・fig・pairs[1].b・key_points[4] を照合) → 不整合 0 (解像度の語の範囲は L1)。書き方 8 → §3 の列挙。書き方 9 → §1-5 (2)。§6 → §1-5 (4) と L6。§9 言い直し → L4 / L5。
10. **三語**: zh・en が jp と同じ事実か (追加・欠落なし; loc-review の LOW「字から」欠落は L7)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 17 種 (液晶ディスプレイ / 液晶 / バックライト / 画素 / 解像度 / 有機ELディスプレイ / ヘッドマウントディスプレイ / 仮想現実 / 拡張現実 / プロジェクター / ルーメン / プリンター / インパクト方式 / レーザー方式 / インクジェット方式 / 3Dプリンター / 3次元CAD) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 6 用語に見出し語の `[[jp:]]` あり (D-202)、zh 訳語 (validate の B6 warn 0 / jp-origin warn 0)。
11. **隣接単元との整合** (タスク指定): technology-15-42-u01 (アナログRGB の「光の三原色 RGB」・VGA 端子) — 液晶 fig の赤・緑・青フィルターと整合。VGA は 15-42-u01 では端子 (D-sub 15 ピン) の呼び名、本単元では解像度規格名で、どちらも正しい用法 (L8)。technology-18-49-u03 (スキャナーの読取りの細かさ = dpi、値が大きいほど細かい) — 本単元 dpi の定義・「数値が大きいほど性能が高い」と整合。18-49-u01 (ウェアラブル端末 = 腕時計型・眼鏡型) — HMD と矛盾なし。18-49-u02 (タッチパネル = 表示画面が入力面を兼ねる) — 衝突なし。15-42-u02〜u05 (インタフェース・センサー・アクチュエーター) — HMD detail「頭の向きを検出するセンサーと組み合わせると」と矛盾なし。topic 外の technology-20-53-u01 は dpi を「印刷などの解像度の単位」と教える → L1。
12. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。L1 補丁案を scratchpad のコピーに当てて `--file` で validate → 0 issues。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 液晶ディスプレイ | OK — exam 2 / 2 題: 画面の大きさを変えずに解像度を下げると画素が減って 1 つ分が大きく映り、文字・アイコンが大きく表示 (2010h22h-q073 正答イ 文字が大きくなる; 誤答 = 動画の再生速度・画像の縮小なし表示・色数減少 を支持しない; 再計算一致; 限定条件「画面の大きさを変えずに」保持) / 解像度の画素数の組には規格名があり例えば VGA = 640×480 (2018h30a-q092 正答ウ ディスプレイの解像度; 前回 M1 の題の規格名 2 つの流用は解消)。detail「液晶そのものは光らないため…バックライト」は透過型の標準説明 (反射型液晶は IT パスポートの範囲外、記録のみ)。fig steps 4 (バックライト → 液晶で光量調節 → RGB フィルター → 映像) は one・detail と一致 | OK | OK | L1 (解像度の範囲) / L2 (points[1] の「組ごとに」) |
| 2 | 有機ELディスプレイ | OK — 引用題 0 (term_questions 空)、考点 0。one (電流で自ら光る有機物の素子を画素ごとに並べる)・detail (バックライト不要、消灯画素で黒、薄く軽く作りやすい、曲げられる製品も「ある」)・pairs[0] は標準事実で正しい。hook: EL = Electro Luminescence (電界発光) は正しい | OK | OK | なし (hook の「自分で光る」への飛躍・en の綴りは前回 LOW、L7) |
| 3 | ヘッドマウントディスプレイ | OK — 引用題 0、考点 0。one・detail (頭の向き検出センサーと「組み合わせると」、VR / AR の機器) 正しい。前回 M2 (比喩が AR の用途と衝突) は双眼鏡の比喩 (小さな画面が視界の大部分を占めて大きく見える) に差し替えられ解消、zh / en も同じ。前回 LOW の overview_rows[2].extra (頭の動きの検出を無条件に要点とする) も「目のすぐ前に置く小型の画面」に変わり解消 | OK | OK | なし |
| 4 | プロジェクター | OK — 引用題 0、考点 0。one・detail (本体に画面を持たず内部の映像をレンズで拡大投影、会議室・教室向き、明るさ = ルーメン) 正しい | OK | OK | L7 (detail_zh の直訳調、loc LOW) |
| 5 | プリンター | OK — exam 3 / 4 題: インパクト方式は印字の圧力が紙を通るため複写用紙を重ねれば 1 回で控えまで写る (2012h24a-q081 正答イ) / レーザー = 粉状トナーをドラムから紙へ移し熱で定着、インクジェット = 液体インクの細かな粒を紙に直接当てる (2016h28h-q088 正答エ / 2022r04-q094 正答ア; 両側正の定義の対比で (iii) 非該当、§1-5 (1)) / ppm = 1 分あたりのページ数で速さ、dpi = 1 インチあたりのドット数で細かさ、どちらも大きいほど高性能 (2014h26a-q049 正答ウ ppm; 誤答 dpi は正の定義として対比、cpi / rpm は出さない)。表 3 行 (印字のしかた・特徴) は事実として正しい (インクジェット = 家庭向け・写真、レーザー = 速く大量印刷、インパクト = 控えの同時作成) | OK | OK | L3 (表 × q088/q094 の方式集合) / L4 (ppm・dpi 3 箇所) / L6 (判子の比喩) / L7 (硒鼓) |
| 6 | 3Dプリンター | OK — exam 1 / 1 題: 渡すのは 3 次元の形状データ、出てくるのは立体物そのもの (2019h31h-q080 正答イ; 誤答 3 つを支持しない、hook も誤答へ寄らない)。detail (3次元CAD などのデータを薄い断面に分け樹脂などを下から 1 層ずつ、金型不要で試作品・一点物) は正しい。fig steps 4 一致 | OK | OK | L5 (考点が one / pairs の言い直し) |

**単元レベル**: goals 3 点・overview_cols 2 (種類 / しくみの要点)・overview_rows 6 行・pairs 2 組 (液晶 / 有機EL 3 行 key 1、プリンター / 3D 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge_questions 4 件 (全て本文の引用題で矛盾なし)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 8 (うち 建議修 2: L1・L2)**

L1 の重大度判断: 本文に「解像度は画面だけの語」「dpi は解像度ではない」と**明言する文はなく**、`key_points_jp[3]` は「印刷の細かさは dpi」「画面の細かさは解像度」と両方とも正しい事実を並べたもの、`terms[0].detail_jp` も「横×縦に並ぶ画素の数を解像度という」という正しい定義である。限定は並置からの含意にとどまり、混同しうる題 (2012h24h-q084 / 2013h25h-q054) は topic 外で本単元の引用題ではなく、範囲内の整合対象 (18-49-u03) は dpi に「解像度」の語を使わないため矛盾しない。よって「明言された限定」(MEDIUM) ではなく「語の別の意味の欠落」として LOW 建議修とする。ただし q054 の誤答肢に画素 (pixel) があり、並置のまま学ぶとそちらへ寄る余地があるため、補丁での修正を強く推奨する。

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 (before → after) |
|---|---|---|---|---|
| L1 | LOW **建議修** | `key_points_jp/zh/en[3]` (+ 派生 `summary.key_points_*[3]`)、`terms[0](液晶ディスプレイ).detail_jp/zh/en` (+ 派生 `explanation_*`) | 「印刷の細かさは dpi、画面の細かさは解像度 (横×縦の画素数)」と dpi と解像度を別の尺度として並置し、液晶 detail も「解像度」を無限定で画素数と定義する。dpi はプリンター・スキャナーの解像度の単位でもあり (topic 外の 2012h24h-q084 / 2013h25h-q054 の正答、technology-20-53-u01 の定義)、解像度 = 画面の画素数だけと読める | **key_points_jp[3]**: 「印刷の速さは ppm、印刷の細かさは dpi、画面の細かさは解像度 (横×縦の画素数) で表す。」→「印刷の速さは ppm、印刷の細かさ (解像度) は dpi で表し、画面の解像度は横×縦の画素数で表す。」 / **key_points_zh[3]**: 「打印速度用 ppm 表示，打印精细程度用 dpi 表示，画面精细程度用分辨率（横×纵的像素数）表示。」→「打印速度用 ppm 表示，打印的精细程度（分辨率）用 dpi 表示，画面的分辨率则用横×纵的像素数表示。」 / **key_points_en[3]**: "Print speed is given in ppm, print fineness in dpi, and screen fineness in resolution (pixels in width × height)." → "Print speed is given in ppm and print fineness (resolution) in dpi, while screen resolution is given as pixels in width × height." / **terms[0].detail_jp**: 「横×縦に並ぶ画素の数を**解像度**という。」→「横×縦に並ぶ画素の数を画面の**解像度**という。」 / **terms[0].detail_zh**: 「横×纵排列的像素数量叫作**分辨率**（[[jp:解像度]]）。」→「横×纵排列的像素数量叫作画面的**分辨率**（[[jp:解像度]]）。」 / **terms[0].detail_en**: "the number of pixels in width × height is called the **resolution** ([[jp:解像度]])." → "the number of pixels in width × height is called the screen's **resolution** ([[jp:解像度]])." |
| L2 | LOW **建議修** | `terms[0](液晶ディスプレイ).points[1].text_jp/zh/en` | jp「横×縦の画素数の組ごとに規格名があり」は記述的に読めるが、en "Each width × height pixel combination of resolution has a standard name" と zh「每种…组合都有规格名称」は「どの組合せにも名前がある」という裏付けのない全称になる (q092 は規格名が解像度の表記であることだけを支持)。L1 と同じ「画面の」も補う | **text_jp**: 「**解像度**には横×縦の画素数の組ごとに規格名があり、」→「画面の**解像度**には、よく使われる横×縦の画素数の組ごとに規格名があり、」 / **text_zh**: 「**分辨率**的每种横×纵像素数组合都有规格名称，」→「画面**分辨率**中常用的横×纵像素数组合都有规格名称，」 / **text_en**: "Each width × height pixel combination of **resolution** has a standard name;" → "Common width × height pixel combinations of screen **resolution** have standard names;" (L1・L2 を当てたコピーで validate 0 issues、JP 1 文 52 字 [空白除く]) |
| L3 | LOW | `terms[4].fig.data.rows[0..2]` | 方式表 3 行は 2016h28h-q088 / 2022r04-q094 の選択肢 4 方式のうち 3 つを含み、レーザー行の工程の順 (ドラムに像 → トナー → 紙へ移す → 定着) は q088 題文の工程順と同じ。ただし工程順は方式そのものの標準説明、語は言い換え済み (ed 0.69 / Dice 0.37、12 字一致 0)、熱転写・感熱を含まず順序も題と異なる一般分類表 | 記録のみ (前回 JP-review r2 の LOW と同判断) |
| L4 | LOW | `terms[4].points[2]`、`terms[4].detail_*` 2 文目、`key_points_*[3]` | ppm = 速さ・dpi = 細かさの説明が 3 箇所で同じ文言 (D-203 §9 / 書き方 8)。key_points[2] (3 方式)・[3] (3 単位) は 1 文に非見出し語 3 つを並べる (§9 の趣旨、D-197 機械判定外) | 記録のみ |
| L5 | LOW | `terms[5].points[0]`、`pairs[1].rows[0..1]`、`key_points_*[4]`、`overview_rows[4].extra_jp[1]` | 3D の考点は one・pairs[1] の言い直しで「手に取れる立体物」が pairs と同文。プリンター / 3D の対比が pairs・key_points[4]・hook・overview・考点に出る (書き方 8 の上限超え)。`overview_rows[4].extra_jp[1]` と `pairs[1].rows[2].a_jp` は同一文字列 (インクやトナーを紙に付ける) | 記録のみ (考点は q080 の正答と一致し、誤答を打ち消す型でもない) |
| L6 | LOW | `terms[4].analogy_jp/zh/en` | インパクト方式の比喩「判子を強く押して下の紙まで写す」は、普通の判子は下の紙に写らないため複写の像として少しずれる (前回 LOW)。考点・表と矛盾する内容は運ばない | 記録のみ |
| L7 | LOW | `terms[0].hook_zh/en`、`terms[0,1,3,4,5].hook_zh`、`terms[3].detail_zh`、`terms[4].fig.data.rows[1].cells[1].en`、`terms[5].hook_zh`、`terms[1].hook_en`、`terms[4].*_zh` の「硒鼓」 | loc-review r1 の LOW 7 件 (jp「字から」の欠落、半角引用符 \"…\"、直訳調、"drum drawn on with light"、"Electro Luminescence" の分かち書き、硒鼓 vs 感光鼓) が未反映のまま。いずれも事実の誤りではない | 記録のみ (loc-review 判定どおり) |
| L8 | LOW | `terms[0].points[1]` × technology-15-42-u01 | VGA が 15-42-u01 では映像端子 (D-sub 15 ピン) の呼び名、本単元では解像度 640×480 の規格名として出る。どちらも正しい用法で矛盾ではない | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 液晶 = 背面光を調節 / 有機EL = 自発光: `pairs[0].rows[0]` (key)、各 one (定義そのもの)、`key_points[0]`、`overview_rows[0..1]` (総表の構造) → 許容。② 黒の表し方・薄さ: `pairs[0].rows[1..2]`、有機EL detail (片側のみ) → 許容。③ プリンター = 平面 / 3D = 立体: `pairs[1].rows[0..2]`、`key_points[4]`、3D hook・考点・overview → L5。④ 表示系 2 つ (HMD = 目の前 / プロジェクター = 離れた面): `key_points[1]` と各 one のみ → 許容。

**前回 JP-review / loc-review の解消確認 (回帰なし)**: r1 M1 (`terms[0].points[1]` が q092 の規格名 2 つを同じ組・順で主語にする) → VGA 640×480 の一般例に置換、三語とも SXGA / QVGA 0 件 = **解消**。r1 M2 (`terms[2].analogy` が「映像だけが視界を占める」と言い切り AR の detail と衝突) → 双眼鏡の比喩に差し替え、三語とも限定的な像 = **解消**。r1 LOW (overview_rows[2] の頭の動き検出・感光ドラム未説明・q049 の quiz 外) → 解消 (q049 は quiz に入った)。r1 LOW (画素の論理 / 物理の噛み合わせ) → 考点は「映像を組み立てる画素」と書き、記録のみで可。r2 LOW 8 件・loc LOW 7 件は L3〜L7 に引継ぎ。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **8** (建議修 2: L1・L2 / 記録のみ 6: L3〜L8) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 6 用語・考点 6 件 (全て qid 付き)・引用 7 題で、考点の主張は正答と一致し、誤答肢を支持する記述・選択肢なぞり・限定条件落ちは無い。前回 JP-review の MEDIUM 2 件は三語とも解消し回帰なし。LOW 建議修 2 件 (L1 解像度の語の範囲、L2 規格名の全称) は補丁 (B3) で修正推奨 (特に L1)、L3〜L8 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-18-49-u04
✓ technology-18-49-u04 unit: 0 issues (data/ip/textbook/units/technology-18-49-u04.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-18-49-u04
✓ technology-18-49-u04 parity: 28 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --file <scratchpad>/u04.patched.json   # L1 + L2 補丁案を当てたコピー
✓ technology-18-49-u04 unit: 0 issues
EXIT=0
```
