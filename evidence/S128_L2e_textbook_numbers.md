# S128 L2e — textbook 本文への figure_description 腐敗値の混入走査 (D-160)

- lane: S128 L2e (D-152 READ-ONLY)。data/・tracked file の変更 0、git 操作 0。新規は本書と `evidence/S128_L2e_textbook_numbers.json` だけ
- 入力 sha256 先頭 16: questions.json `73c4414e0e6d6502`、question_bank.json `2b3e45cc1f78fde4` (L2b と同一)
- 対象: `data/ip/textbook/units/*.json` 244 unit、`data/ip/textbook/figures/*.svg` 409 本 (mermaid 描画。ラベル `<p>` / `<text>` を抽出)。web は `data/ip/textbook` を直接読み (apps/web/src/lib/textbook/loader.ts)、apps/web 内に unit の複製は無い
- 候補: L2b `evidence/S128_L2b_scans.json` の SLASHED_ZERO_PAIR 12 題 (指名 5 題はすべてこの 12 題に含まれる)
- 脚本 (scratch、未 commit): `/private/tmp/claude-501/s128-l2e/refs.mjs` (id 参照 unit)、`body.mjs` (7 unit の数字入り文字列)、`global.mjs` (全 unit 文脈 grep + fd 断片照合)

## 結論

**textbook の学習者可視本文 (jp / zh / en、SVG ラベル含む) に腐敗値の混入は 0 件。** 是正対象なし。

## 1. 候補 id → unit (step 1)

| id | unit | 参照箇所 |
|---|---|---|
| 2009h21h-q098 | strategy-01-02-u13 | terms.2.inline_quiz.0, source_figures.1 |
| 2012h24a-q086 | technology-17-47-u01 | challenge_questions.3, source_figures.4 |
| 2012h24h-q005 | strategy-01-03-u02 | terms.1.inline_quiz.1, source_figures.1 |
| 2013h25h-q099 | strategy-03-10-u05 | challenge_questions.2, source_figures.1 |
| 2015h27a-q088 | strategy-01-02-u04 / strategy-01-02-u06 | challenge_questions.0 + source_figures.1 / terms.3.inline_quiz.0 + source_figures.3 |
| 2021r03-q050 | strategy-01-02-u03 | terms.2.inline_quiz.0, source_figures.1 |
| 2011h23tokubetsu-q094, 2012h24a-q088, 2019r01a-q002, 2024r06-q093, 2025r07-q054, 2026r08-q003 | なし | — |

7 unit / 6 題。L2b の「★ 6 題」と一致。指名 5 題のうち 2019r01a-q002 / 2026r08-q003 はどの unit にも参照されない。

inline_quiz / challenge_questions は id 文字列だけを持ち、現在の UnitReader.tsx:8-10 は描画しない (D-133 保留)。描画時は quiz 層 (quizModel.ts:120、stem_jp_clean 優先) から引くので figure_description は経由しない。

## 2. 7 unit の本文検査 (step 2)

source_figures を除く全文字列から数字を含むものを全数目視 (jp + zh + en)。7 unit の本文は概念説明・一般的な例 (変動費率 60/100、作業 A 3 日 等) だけで、過去問の図の数値を引用している箇所は 0。SVG 12 本のラベルも概念語と汎用の日数だけ (strategy-01-02-u03 の「作業A 3日」等は 2021r03-q050 の値 68/156/19/3 とは無関係)。

## 3. 全 unit 文脈 grep (step 3)

244 unit の本文 37,550 文字列 + SVG 409 本のラベルに対して:
- 腐敗値の文脈パターン: 788 / 138 (境界付き) / 法人税…58 / 68・156・19 秒 (seconds) / 悪化・恶化・deteriorat…8 / 1,800 件 / 860 / 4,800 / 39.9 / 3.6 / 80% / S006・福葉 / J+K・J0 / 36・45 時間・通販業務 / サラダ・玉子・沙拉・鸡蛋・salad
- 素の数字 (788|1800|4800|860|156|39.9|3.6|138|68、桁区切り可、前後非数字): **0 件**
- 文脈ヒット 2 件はいずれも偽陽性 (strategy-01-03-u01 terms.1.analogy_zh「鸡蛋」= ケーキの材料の比喩、technology-23-62-u02 terms.5.explanation_zh「鸡蛋放进同一个篮子」= 慣用句)
- figure_description の 12 字断片 (6 字刻み) が本文に現れるか: 12 題すべて 0

## 4. 混入ヒット (step 4)

なし (`textbook_body_hits: []`)。

## 5. 源照合 (step 5 + 追加)

| id | page PNG | figure_description | 源 | 判定 |
|---|---|---|---|---|
| 2012h24h-q005 | 2012h24h/page-03 | 売上高 4,800 | **4,000** | **CONFIRMED** |
| 2013h25h-q099 | 2013h25h/page-48 | 商品紹介 1,800 件、完了 860 件 | トップ→商品紹介 **1,000** 件。860 は源に無い (800 件 = キャンペーン→トップ) | **CONFIRMED** |
| 2012h24a-q086 (追加) | 2012h24a/page-34 | 牛丼 39.9% / カツ丼 28.3% / カレー 16.6% | 牛丼 **30.9%** / 親子丼 14.9% / カツ丼 **25.8%** / カレー **28.3%** | CONFIRMED (0→9 に加えて行ずれ。16.6% は源に無い) |
| 2015h27a-q088 (追加) | 2015h27a/page-38 | 評価平均 3.6 の基準線 | 問題文「評価平均は **3.0** を基準値とする線」 | CONFIRMED (問題文で。図 3 本体は page-39 で未閲覧) |
| 2019r01a-q002 / 2026r08-q003 / 2021r03-q050 | — | — | L2b / U6 §11 で確定済 | (再閲覧せず) |

補足:
- **2012h24h-q005**: raw の `stem_jp` (question_bank.json と questions.json の両方) も 4,800。表示層 (translations の `stem_jp_clean`) と zh / en は 4,000 で正しい。正答ウ 1,600 = 800 ÷ (1 − 2,000/4,000) は 4,000 でのみ成立。quiz の表示は quizModel.ts:120 で clean を優先するので学習者には 4,000 が見える
- **2013h25h-q099**: 数字の置換だけでなく図の流れの構造自体が誤り。源: 商品紹介→購入手続 100、購入手続→商品紹介 50、キャンペーン→購入手続 300、購入手続→キャンペーン 20、購入手続→完了 180、完了→商品紹介 100、キャンペーン→商品紹介 500、商品紹介→トップ 400、キャンペーン→トップ 800。fd の「購入手続400→完了50→完了860」「キャンペーン→購入手続500→完了300」は源に存在しない。slashed zero 走査が拾うのは腐敗の一部だけで、fd の誤りは数字の置き換え以上に広い
- mapping (`data/ip/exams/mappings/*_pages.json`) の頁番号は 4 題とも目視で正しい頁だった

## 6. 残るリスク

- source_figures の fd 値 (6 題、うち 4 題は本 lane で誤り確定) は unit JSON に複写されたまま。描画開始 / unit 再生成で表に出る (L2b §3.1 と同じ)
- 本 lane は数値の混入だけを見た。fd の構造誤り (2013h25h-q099 型) が生成文に意味のレベルで入った可能性は、7 unit の本文が過去問の図に言及していないことから実質 0 と判断
