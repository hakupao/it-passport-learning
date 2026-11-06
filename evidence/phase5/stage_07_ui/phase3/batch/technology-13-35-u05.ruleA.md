# Rule A 全数抽検 — technology-13-35-u05 (ニューラルネットワークと深層学習)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (S148 続、b41)、repo HEAD `a08306eb` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b41-u05-a1` merge 結果、a1 初回通過、sha256 先頭 `9c5e0a9a821bc798`)。
- **対象**: `data/ip/textbook/units/technology-13-35-u05.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (ニューラルネットワーク / バックプロパゲーション / 活性関数 / 過学習 / ディープラーニング) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、D-208 / D-209 / D-210 / D-211、テンプレート既知型 (1)〜(10)。比較: `data/ip/textbook/.planning/v2/technology-13-35-u05/v1-original.json`、manifest (用語 5 語・`term_zh`・`term_en` は manifest / v1 と一致)。兄弟単元 u04 (特徴量 / 機械学習 / 教師あり・なし・強化学習) と u06 (事前学習 / ファインチューニング / 転移学習 / CNN / RNN) は境界の確認にだけ読んだ (並行監査中、本監査の対象外)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生 `definition_*` は `one_*` の記法除去版 (jp 5/5 一致、zh・en は `[[jp:X]]`→X 変換のみの差)。
2. **考点 × 引用題 (考点 8 件 = exam 5 + mix 3、引用 qid 延べ 11 = 異なり 10 題、全題 topic `technology-13-35`)**: `questions.json` の正答と翻訳 sidecar の `stem_jp_clean` で再読。topic 35 題のうち本単元の語を含む題は 10 題 (2025r07-q080 は u06 の語、対象外)。過学習を扱う題は topic に 0 題 (manifest freq 0) → 過学習は mix 考点のみ・quiz 空で妥当。
3. **技術的正確さ (呼び出し元の指定点)**: バックプロパゲーション = 出力と正解の誤差を出力層側から入力層側へ逆向きに伝え重みを修正 (one・detail・図 4 段・hook・key_points[1] 全て一致、計算は前向き・修正情報は後ろ向きと明記)。活性関数 = 重み付き合計を次へ送る値に変える非線形関数、例はステップ / シグモイド (0〜1) / ReLU (0 以下 0・正はそのまま) で全て正しい。過学習 = 訓練データでは高精度・未知データで低精度 (汎化の低下)、抑制例 (データを増やす・モデルを単純に) は「例えば」付き、学習不足 (両方低い) との区別も正しい。ディープラーニング = 中間層を多層に重ねた NN、特徴を人が指定せず自動抽出、浅い層 = 単純な特徴 / 深い層 = 組合せ (図 4 段も同じ)。hook「深い = 層の重なりが深い (多い)」は正しい。過度な一般化は見当たらない (L1・L6 は措辞級)。
4. **D-198 写し**: validate copy guard 0。独立照合 = 単元 JP 文字列 105 本 (派生除く) × topic 35 題の題文 (stem_jp_clean) + 選択肢、12 字連続窓 (句読点・記号除去):
   - カタカナ 4 字以上・英数を □ 遮蔽 (実字 6 未満の窓は除外): **0 件**。
   - 遮蔽なし: 7 件。うち 6 件は見出し語 (バックプロパゲーション / ニューラルネットワーク) + 助詞 1 字の窓で偽陽性。残り 1 件 `terms[0].points[0].text_jp` ↔ 2021r03-q003 題文「モデルにしてコンピュータ」(実字は「にして」のみ)。q003・q019・q095・q074 は分類型 (どの用語が X か) で、考点は見出し語の一般的定義 (脳の神経回路を数式モデルにして再現・DL の土台) を述べるので D-209 の免除内、選択肢の組・順序の再現なし → 偽陽性。
   - 近似一致 (12 字窓で 1〜2 字置換、見出し語主体の窓を除く): 2 系統。`terms[4].detail_jp`「それらを組み合わせた複雑」↔ 2009h21a-q060 (他 topic 由来の汎用句、偽陽性)。`terms[4].points[1].text_jp`「規則性を見つけ出し」↔ 2022r04-q067 正解イ (9 字一致)。文全体の ed 0.78 / Dice 0.35 で HIGH 較正値 (ed 0.14 / Dice 0.52) から遠い。他の主要考点も ed 0.72〜0.92 / Dice 0.06〜0.38。
   - カタカナの多い文の目視: NN points[0]・DL points[0]・活性関数 points[0] は各引用題の正解肢と同じ原則を自分の言葉で述べており、誤答肢の語句は再現しない。
5. **既知型 (1)〜(10) と choice-echo**: validate は `warn choice-echo` を出していない (0 行)。
   - (1) option tracing: `terms[1].points[0]` (重みを更新し、目的はずれを減らす) は 2026r08-q082 の 2 軸 ({重み / ノード数} × {誤差縮小 / 活性化関数選択 / 速度}) のうち正解の 2 値を述べる構文だが、誤答肢の語句・組を再現せず標準定義 → (iii) でない (L7)。`terms[2].points[1]` (mix: 活性関数 = 変換規則 / BP = 重みを直す手順) は q082 誤答イ (重み調整で活性化関数を選ぶ) と逆向きの内容だが、取り違えやすい 2 語を両側とも正の定義で述べた文 (D-209) で、誤答肢の場面は再現しない → 該当なし。`terms[2].points[0]` は 2023r05-q091 (正誤選択型) の正解エと同じ順の一般定義、D-211 (ii) / D-198「標準的な定義は正解肢が同じ原則でも写しでない」側 → 該当なし (L7)。`terms[4].points[1]` は L6。
   - (2) 「など」: 2023r05-q074 正解「DL などで用いられる」・2020r02o-q004 正解「DL などの AI 技術」。考点は「DL の土台」「DL は予測・判断に生かせる」で、NN を DL だけに、予測を DL だけに閉じる語 (だけ・のみ) はない → 落ちなし。
   - (3) 別名: 活性関数 / 活性化関数 (q091・q082 の表記) は one で同一物の別名として括弧併記 (zh / en も `[[jp:活性化関数]]`)。誤差逆伝播法・深層学習・オーバーフィッティング・隠れ層も同一物の括弧注 → 別物として教えていない。
   - (4) 比喩・図の範囲: 伝言ゲーム (重み)・味見のさかのぼり (後ろから直す)・判断のくせ (各ニューロンの変換)・一人用の服 (過学習)・線→部首→字 (層の分担) はいずれも one / detail と矛盾しない。
   - (5) 既修正の zh / en 回帰: 先行 Rule A なし (a1 初回)。jp-review / loc-review の指摘は全て low で、本文はそのまま (下の §3 で再判定)。
   - (6) zh / en が誤答肢寄り: なし (q082 誤答「ノード数を変更」に寄る訳語なし、q091 誤答「信頼度」「ニューロン数」に寄る訳語なし)。
   - (7) D-210: 法令・規格の引用なし → 対象外。
   - (8) 比喩・hook のキーワード: NN の伝言ゲーム「重く受け止め」= 重み、活性関数の「判断のくせ」= ニューロン内変換で、他用語の定義と役割が食い違わない。
   - (9) hook / 手がかりを引用題・challenge に当てる: DL hook (深い = 層が多い) は 2025r07-q086・2022r04-q067 で正解に向かう。BP hook (後ろへ伝わる) は q082 で正解アに向かう (ノード数でなく重み)。誤答に向く手がかりなし。
   - (10) 閉じた列挙: 活性関数の例は「例えば」/ 表の列名「活性関数の例」で閉じていない。過学習の抑制法も「例えば」。
6. **D-195 / D-197 / D-200 / §9**: one = 1 文 × 5 (太字あり)、detail 3 文 × 5、図 = NN flow static / BP flow steps 4 / 活性関数 table / 過学習 table / DL flow steps 4 (全て登録内)。pair 2 組 (NN→DL は DL の後、BP→活性関数 は活性関数の後、各 key 行 1)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が / 必须 / 考试 / must / always / important) → 「出る」3 (結果が出る、通常語)・「覚え」3 (覚え込む・文字を覚える、通常語)・「exam」5 (`kind` 値) のみ、定型締め句 0。D-197 羅列 validate 0。D-200: 考点数 1/1/2/1/3 (≤3)、JP 文数 1〜2・字数 48〜71 (≤100)。**framing 件数** (validateV2 `POINT_FRAMING`、全考点): jp 0 / zh 0 / en 0 (上限 2)。D-205: 改訂される文書の構成数なし → 対象外。
7. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・caption・pairs の三語一致 (parity 0 diff)。`[[jp:…]]` 原語 15 種が jp 本文に実在 (スクリプト、全 ok)。one_zh / one_en 全 5 用語に見出し語の `[[jp:]]` あり。zh 訳語は `zh_terms.unit.json` (神经网络 / 反向传播 / 激活函数 / 过拟合 / 深度学习 / 机器学习) と一致。zh・en hook の差 (過学習の zh「过拟合的过も同じ」、en「over-」) は字形 hook の現地化で事実の追加ではない。
8. **D-211 の扱い**: 本単元では quiz のみへの逃がし (D-211 (i)) は使われていない。正誤選択型の引用題 (2023r05-q074 / q091 / 2019r01a-q021 / 2022r04-q067 / 2026r08-q082) は全て正解が一般定義で、考点は誤答肢の組・順序を再現せずに一般表現で書けているため、(i) を使う必要はない。(ii) の判定は §1-5 (1)。
9. **quiz / challenge**: quiz 7 枠 (NN 3・BP 1・活性 1・過学習 0・DL 2) + challenge 3 題 (2022r04-q067 / 2024r06-q095 / 2025r07-q086)。q067 (DL = NN で自ら規則性を見つけ推論・判断; 誤答 = e ラーニング / エキスパートシステム / アダプティブ) は DL points[0..1]、q095 (DL に使う技術 = NN) は NN points[0]・pairs[0]、q086 (画像から特徴を自動抽出して識別 = DL) は DL one・detail・図で解ける。本文と矛盾なし。
10. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | ニューラルネットワーク | OK — exam 1 / 4 題: 脳の神経回路を数式モデルにしてコンピュータで再現、DL の土台 (2021r03-q003 正答ウ / 2020r02o-q019 正答ウ [DL を構成する技術] / 2023r05-q074 正答エ [DL などで用いられる] / 2024r06-q095 正答イ)。「など」は閉じていない。detail の入力層・中間層・出力層・重み・学習 = 重み調整は正しい | OK (図 flow static 3 ノード) | OK | L8 (対比反復)、O1 |
| 2 | バックプロパゲーション | OK — exam 1 / 1 題: 更新するのは重み、目的はずれ (誤差) を減らす (2026r08-q082 正答ア、誤答 = 活性化関数選択・ノード数変更 を支持しない)。one / detail / 図 4 段 / hook の向き (出力側→入力側) 全て正しい | OK | OK | L7 |
| 3 | 活性関数 | OK — exam 1 / 1 題 + mix 1: 一つのニューロンの中で受け取った値から次へ送る値を計算 (2023r05-q091 正答エ、誤答 = 結果の信頼度・中間層や最適なニューロン数 を支持しない)。mix の BP との区別は q082 誤答イの取り違えを防ぐ向き。非線形性・例 3 種は正しい | OK (table static) | detail zh / en の訳語 L2 | L1, L2, L7 |
| 4 | 過学習 | OK — 引用題なし (topic freq 0)、mix 1: 訓練データでは高く未知データで低い、両方低い = 学習不足。表 3 行は one・detail と一致 | OK (table static) | zh「学习不足」L4、zh / en の別名併記 L9 | L4, L7 (反復), L9 |
| 5 | ディープラーニング | OK — exam 2 / 4 題 (延べ 5) + mix 1: 多層 NN で特徴を人が指定せず自ら取り出して学習する AI 技術 (2019r01a-q021 正答エ / 2025r07-q086 正答エ / 2022r04-q067 正答イ) / 蓄積された大量データから規則性を見つけ予測・判断に生かせる (2020r02o-q004 正答ウ [DL などの AI 技術] / q067 イ)。one「機械学習の手法」は u04 の枠組みと整合 | OK (flow steps 4) | 別名 深層学習 の併記 L9 | L6, L8 |

**単元レベル**: goals 3・overview_cols 1 (単元内での位置づけ)・overview_rows 5・pairs 2 組 (NN / DL 3 行 key 1、BP / 活性関数 3 行 key 1)・key_points 5・challenge 3 (§1-9)。pairs[0].rows[1]「中間層の数: 1 層でもよい / 何層も重ねる」は正しい (en に L3)。goals_*[2] は L5。overview_rows / goals[0] は「重み」を terms[0].detail の定義より前に使う (L10)。事実誤りなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 10 (うち 建議修 5)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[2](活性関数).detail_jp` / `detail_zh` / `detail_en` (+ 派生 `explanation_*`) | ステップ関数の境界: detail は「基準を**超えた**ときだけ」、図の表 `fig.data.rows[0].cells[1]` は「基準の値**以上**なら 1」。境界値で食い違う (観点 7 の措辞級、事実誤り・誤答誘導なし。jp-review low の未修) | jp `合計が基準を超えたときだけ信号を送る関数` → `合計が基準に達したときだけ信号を送る関数` / zh `有的函数只在总和超过基准时才发出信号` → `有的函数只在总和达到基准时才发出信号` / en `Some functions send a signal only when the total exceeds a threshold` → `Some functions send a signal only when the total reaches a threshold` |
| L2 | LOW **建議修** | `terms[2](活性関数).detail_zh` / `detail_en` (+ 派生 `explanation_zh/en`) | 「直線的でない変換」の直訳。zh の標準語は「非线性」、en は "non-linear" (loc-review low の未修)。jp は可 | zh `正因为激活函数进行的是非直线的转换` → `正因为激活函数进行的是非线性的转换` / en `Because the activation function performs a conversion that is not a straight line` → `Because the activation function performs a non-linear conversion` |
| L3 | LOW **建議修** | `pairs[0].rows[1].a_en` | jp「1 層でもよい」/ zh「1 层也可以」に対し en "One layer is enough" は「1 層で足りる」と読め、DL との区別の軸 (層数) をぼかす (loc-review low の未修) | en `One layer is enough` → `Can be just one layer` (jp・zh は変更なし) |
| L4 | LOW **建議修** | `terms[3](過学習).fig.data.rows[0].cells[0].zh`、`terms[3](過学習).points[0].text_zh` | zh「学习不足」は日本語の字面移し。過拟合の対語の標準語は「欠拟合」(en は Underfitting で既に対応) (loc-review low の未修) | cell zh `学习不足` → `欠拟合` / points zh `两者都低的状态叫作学习不足（[[jp:学習不足]]）` → `两者都低的状态叫作欠拟合（[[jp:学習不足]]）` (jp・en は変更なし) |
| L5 | LOW **建議修** | `goals_jp[2]` / `goals_zh[2]` / `goals_en[2]` | 「過学習…を見分け、ディープラーニングとの関係を含めて」は過学習と DL の関係を約束するように読め (en "how it relates" の it = overfitting で明確にそう読める)、本文にその関係の記述はない。意図は NN と DL の関係 (pairs[0]・DL mix 考点)。観点 7 の措辞級 (jp-review low の未修) | jp `**ディープラーニング**との関係を含めて` → `ニューラルネットワークと**ディープラーニング**の関係を含めて` / zh `并结合与**深度学习**的关系讲清整体脉络` → `并结合神经网络与**深度学习**的关系讲清整体脉络` / en `including how it relates to **deep learning**` → `including how neural networks relate to **deep learning**` |
| L6 | LOW | `terms[4](ディープラーニング).points[1].text_jp/zh/en` | 「蓄積された大量のデータから規則性を見つけ出し、将来の予測や判断に生かせる」は機械学習一般の性質 (u04 機械学習 one とほぼ同内容) で、DL 固有の情報を足さない。2022r04-q067 正解イの「大量のデータ…規則性を見つけ出し…判断」と同じ順 (9 字一致、ed 0.78 / Dice 0.35)。正解肢 1 つの一般原則で誤答肢の組・順序は再現しない (D-198 標準原則側 / D-211 (ii)) → (iii) でない。事実は正しく、q004 の「など」も閉じていない | 記録のみ (直すなら考点 1 と統合。u04 との境界の重複は兄弟単元の監査結果と合わせて判断) |
| L7 | LOW | `terms[1].points[0]`、`terms[2].points[0]`、`terms[3].points[0]` / `detail_jp` 2 文目 / `key_points_jp[3]` | §9 言い直し: BP 考点は one・detail・key_points[1] の、活性関数 考点は one の言い直し (q091 正解エと同順の標準定義)。過学習の「訓練で高く未知で低い」は one・表・detail・考点・key_points で 5 回 | 記録のみ |
| L8 | LOW | `terms[0].points[0]`「DL の土台」/ `overview_rows[4].extra_jp` / `pairs[0].rows[0,2]` / `terms[4].points[2]` | 書き方 8: NN = 土台 / DL = 深くした発展形 の対比が pairs と mix 考点に加え NN exam 考点・総表 extra でも出る。NN 考点側は引用題 (q019・q095・q074) の正解内容なので削ると根拠が消える | 記録のみ |
| L9 | LOW | `terms[3].one_zh/en`、`terms[4].one_zh/en`、`terms[0].detail_en` ほか | jp の別名 (オーバーフィッティング / 深層学習 [単元タイトルの表記]) が zh / en で併記されない。en の主表記 "middle layer" は 中間層 の直訳 (hidden layer は括弧注あり) | 記録のみ (任意: `[[jp:深層学習]]` 併記) |
| L10 | LOW | `overview_rows[0..1].one_line_jp`、`goals_jp[0]` | 「重み」を terms[0].detail_jp の定義より前に使う (総表・目標は要約) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① NN (構造・土台) / DL (多層にした手法): `pairs[0].rows[0..2]`、`terms[4].points[2]` (mix)、`terms[0].points[0]`、`overview_rows[*].extra` → L8。② BP (学習の手順) / 活性関数 (ニューロン内の変換規則): `pairs[1].rows[0..2]`、`terms[2].points[1]` (mix)、`goals_jp[1]` (予告)、`overview_rows[*].extra` → 許容 (2 箇所 + 予告)。③ 過学習 / 学習不足 / ちょうどよい: `terms[3].fig` 表と mix 考点 → 許容。

**範囲外の観察**:
- O1 独立 copy 照合の遮蔽なし 7 ヒットは見出し語 + 助詞、または分類型題の定義句「モデルにしてコンピュータ」で偽陽性 (§1-4)。
- O2 兄弟境界: u04 (機械学習・特徴量) と、DL one「機械学習の手法」・「特徴を自動で取り出す」は整合。u06 (CNN / RNN / 転移学習) の内容は本単元に入っていない (DL detail の「画像認識・音声認識・翻訳」は用途例のみ)。

確認済みで問題なし: 技術的正確さ (BP の向き・活性関数の非線形性と例・過学習の定義と抑制例・DL = 多層)、限定条件 (「など」2 題とも閉じていない)、別名の扱い、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 (validate 0)、D-200、写し (遮蔽 0、遮蔽なし・近似は偽陽性または L6)、choice-echo warn 0、`[[jp:]]` 原語 15 種実在、one_zh / one_en の見出し語併記 5/5、zh 訳語表、図種 (flow static ×1 / flow steps ×2 / table static ×2 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **10** (建議修 5: L1〜L5 / 記録のみ 5: L6〜L10) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 8 件 (exam 5)・引用 10 題 + quiz / challenge で、考点の主張は正答と一致し、誤答肢を支持する記述も選択肢なぞりも無く、引用題の限定条件 (「など」) の落ちも無い。技術的内容 (誤差逆伝播の向き、活性関数の非線形性、過学習 = 汎化の低下、DL = 多層) は正しい。LOW 建議修 5 件 (L1〜L5) は補丁 (B3) で修正推奨、L6〜L10 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-35-u05
✓ technology-13-35-u05 unit: 0 issues (data/ip/textbook/units/technology-13-35-u05.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-35-u05
✓ technology-13-35-u05 parity: 28 locations, 0 diff
EXIT=0
```
