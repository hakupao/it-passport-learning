# X track X1 — 母数外 excluded 105 題の集計と是正 (S130、L3 data lane)

D-150 §3 の X track (⑤-2 母数外 392 題) の 1 本目。母数 = 5 exam の excluded **105 題** (2015h27a 32 / 2016h28a 16 / 2016h28h 34 / 2017h29a 8 / 2017h29h 15)。準備は `evidence/quiz_X1_prep_S130.md`、名指しは `evidence/quiz_X1_named_S130.json`。
**Sonnet 5 単 pass**。手順の雛形 = B13 (`evidence/quiz_B13_2009h21a_S129.md`) / S122 log §1〜§7。

**状態: PHASE 2 (D-152 lock 下で apply・再生成・ゲート・事後 machdiff) 完了** (記録は §12)。§1〜§10 は PHASE 1 の記述に D-170 の追加を反映した版。書いたもの: 是正器 `scripts/quiz-fidfix-S130-x1.mjs`、machdiff の allowlist 1 行、本書、data (下記 §12)。git add / commit はしない (主 context が Rule D の後に行う)。

---

## 1. 入力と実行

- run: `wf_6ee4ff5a-693` (label `x1`、pass `sn`、Sonnet 5)、105/105 完走
- マニフェスト: `data/ip/quiz/.phase2/x1_fidelity_input_multi.json` (precrop 93/105、next_page_png 105/105)
- merge 結果: `evidence/phase5/stage_06_quiz_fidelity/x1_fidelity_multi_sn.json`
- 判定: **CLEAN 91 / DISCREPANT 14 / UNREADABLE 0**、差分 22 {semantic 2, cosmetic 20}、正解肢上 1 (agent 申告: 2016h28h-q096 エ)

## 2. 率

| unit | n | agent DISCREPANT (採用あり) | +machdiff | +fixer 走査 / CLEAN 抽検 | **計上 = 是正** | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|---|---|
| X1 (5 exam) | 105 | 14 (**12 題採用**、2015h27a-q008 / 2017h29a-q097 は不変) | **+1** (`2015h27a-q026` AI 見出し行) | **+6** (`2016h28h-q080` `q045` 走査、`2016h28h-q020` `2015h27a-q090` CLEAN 抽検、`2015h27a-q095` `q098` D-170) | **19 (18.1%)** | **4** (`2016h28h-q080 ウ` `2016h28h-q096 エ` `2017h29a-q092 エ` `2015h27a-q090 イ`) | **0** |

- 計上 19 題: 2015h27a-q026 q048 q064 q072 q085 q090 q095 q098 q100 / 2016h28a-q074 q082 / 2016h28h-q020 q022 q045 q054 q080 q096 / 2017h29a-q018 q092。2017h29h は 0。
- **U9 定義の計上**: agent 採用 12 + machdiff 実残差 1 (q026) = **13 題 (12.4%)**。q100 の選択肢行重複も machdiff 実残差だが、同題は agent 採用で計上済み。
- **論理差分** (題 × field、jp): **32** = semantic **2** / cosmetic **30** / answer_affecting **0**
  - semantic 2: `2015h27a-q100` stem (源に無い AI 挿入段落 + 選択肢行の重複、1 field = 1 差分) / `2016h28h-q022` stem (結合セルの複写「←（左に同じ）」)
  - cosmetic 30: 2015h27a q026 / q048 / q064 / q072 / q085 / q095 / q098 stem (7)、q090 イ ウ エ (3) / 2016h28a q074 / q082 stem (2) / 2016h28h q020 / q045 stem (2)、q054 イ (1)、q080 ア〜エ (4)、q096 stem + ア〜エ (5) / 2017h29a q018 stem (1)、q092 stem + ア〜エ (5)
- **`correct_answer` 変更 0**。key 誤りの疑い 0 (§6 の再導出と prep の 44 題再導出)。

## 3. machdiff — same 494 / AGENT_MISSED 26 / REPORTED 4 / TRANSCRIPT_PREFIX 1 (未裁定) / QUOTE_ASCII 0 / VERDICT_CONFLICT 0 (exit 1)

全残差を源で裁定した:
- **実残差 → 採用**:
  - `2015h27a-q100 row 19`: 題幹末尾の「ア 120　　イ 140　　ウ 220　　エ 240」(en は a)〜d)) が選択肢の重複。agent は挿入段落だけを報告していた。
  - `2015h27a-q026 row 1`: 表の「| 項目 | 値 |」。源 p11 は見出し行のない 2 列表で、AI が付けた見出し (D-158)。corpus でもこの題だけ。
- **既知型 (不変)**:
  - `[表] a: X / b: Y` の一行化 (a 列が「X/」と比較される): `2015h27a-q055`、`2016h28a-q093`、`2017h29a-q076` (各 4 肢)。B8 の q090 と同じ。
  - 空欄枠 `[ a ]`: `2015h27a-q075`。corpus 慣行 (B8 q072 / q083)。
  - 図・前文の言語化: `2015h27a-q008` (DFD)、`q048` (流れ図)、`q085 row 10` (図題)、`q086 row 0` / `q096 @0` (中問前文。前文頁が窓外の既知型、prep §1)、`2016h28a-q025` (組織図)、`2017h29a-q097` (マトリクス表)。
  - `2016h28h-q022 row 4`: 結合セル。§4b で是正した。
  - `2016h28h-q054 ア ウ エ` の末尾「。」: 選択肢末の「。」の省略は exam 全体の型 (2016h28h は 50 肢が省略、母数側の q015 / q027 / q059 も同じ) → ⑨。
- **TRANSCRIPT_PREFIX `2016h28h-q078`** (+155): 源 p35 のネットワーク図を言語化したもの (ルータ 2 台と各ポートの IP、ハブ、PC1〜4)。ポート IP は図のラベルそのもので、言語化が解答の判断を先取りすることはない。→ **PHASE 2 で `TRANSCRIPT_PREFIX_ADJUDICATED` に apply 後の値で追加する** (B9 / B10 / B12 と同じ順序。x2-fixer と同時に脚本を編集しないよう lock 下で行う)。
- → 説明できない残差 0。

## 4. 裁定 (fixer が源を原寸で独立に実読)

実読した源:
- 頁: 2015h27a p45 / p47 (q100)、p40 (q089 / q090)、2017h29a p09 (q018)
- crop: 2015h27a q024 q026 q048 q064 q071 q072 q075 / 2016h28a q082 / 2016h28h q020 q022 q033 q045 q054 q063 q075 q078 q080 q093 q096 / 2017h29a q092 / 2017h29h q029 q034

### 4a. 題幹

| id (p) | 層 | 源 | dataset | 判定 |
|---|---|---|---|---|
| 2015h27a-q100 (p45 / p47) | clean / zh / en | 問100 は「Aさんが処分するPCにおいて，専用ソフトの説明書によって，…」から | 前文の後に源に無い段落「Aさんは,これまで…HDDを内蔵するのは,次の2台である。・8G…・40G…Aさんは,…処分する。」+ 末尾の選択肢行 | **semantic**。挿入は計算対象の HDD 内蔵 2 台を特定する先取りで、D-168 の趣旨にも掛かる。段落と選択肢行を 3 層とも削除した。設問文の ASCII「,」は「，」にした (同じ field の前文が「，」)。挿入位置は jp idx 664 で、mqD の共通接頭 649 字より後ろ (q097〜q099 には挿入がない) → registry probe の範囲外 (D-167 に当たらない)。解説は挿入を引用していない |
| 2016h28h-q022 (p11) | clean / zh / en | B案の年間費用は運用・保守の 2 列にまたがる結合セル「初期費用の15%」が 1 つ | 運用欄「初期費用の15%（運用・保守の合算）」+ 保守欄「←（左に同じ）」 | **semantic** (agent どおり)。保守欄の複写は、15% を運用と保守の両方に計上する読みを誘う。S113 / B8 q004 (結合セルは展開しない、配置を示す括弧書きは残す) にならい、**複写セルだけを空にし、括弧「（運用・保守の合算）」は残した**。key は源の表から再導出した: A = 4億 + 700万×10 = 4.7億、B = 2億 + 3,000万×10 = 5億、C = 5,000万 + 4,300万×10 = 4.8億 → B > C > A = ウ (一致)。仮に二重計上で読んでも B = 8億で順序は変わらないので、answer_affecting ではない。解説の「運用・保守合算」と整合する |
| 2015h27a-q026 (p11) | raw / clean / zh / en | 見出し行なし | 「| 項目 | 値 |」 | cosmetic (D-158)。1 行目を見出しに繰り上げた (区切り行は任意、`quizRichText.ts:28`) |
| 2015h27a-q048 (p20) | clean | 比較（“xか?”，“yか?”，“zか?”） | 「xか？」等 | cosmetic (D-155、? は源の半角)。流れ図の言語化文の「」×16 は源に対応文がない描画補助なので不変 (⑨: field 内で字形が割れる)。en の «» も ⑨ |
| 2015h27a-q064 (p26) | clean | “入館履歴”表と“建物”表から，建物名が‘東館’を…ソートしたとき， | 「」と「、」 | cosmetic。‘’ は源の単引用符。この field は文ごと置換したので「、」も「，」にした |
| 2015h27a-q072 (p30) | clean | “売上”表，“顧客”表及び“商品”表 | 「」 | cosmetic。「a〜c」(U+301C) と源の「～」は ⑨ |
| 2015h27a-q085 (p36) | clean / zh / en | 図題「図 1　アンケート集計表と評価集計表のワークシート」 | 説明文「図1は、…ワークシートである。」 | cosmetic。図題の形に戻した (同題の「表 1　アンケートの内容」と同じ書式)。位置は共通接頭 577 字の後ろで、設問側にある |
| 2016h28a-q074 (p27) | clean | “気温”表の…間で，…条件として， | 「」と「、」 | cosmetic (文ごと置換) |
| 2016h28a-q082 (p30) | raw / clean / en | 計算式“IF(B2≧50,'合格',…)” / “合格” | 「」 | cosmetic。式中の ' は文字列リテラルなので原典どおり (D-166)。en の「」→“” (D-156) |
| 2016h28h-q096 (p44) | clean | “成績”表 / “%” /「，」 | 「」と「、」 | cosmetic (文ごと置換) |
| 2017h29a-q092 (p35) | clean | “所有者”，“所有者と同じグループの利用者”(改行)“その他の利用者”の順で | 「」+「，」+「」の後に空白 | cosmetic。2 語目と 3 語目の間は、源では改行だけで読点がない。1 行に起こすと区切りが要るので「，」は残した (下記 §9 判断 4)。「」の後の空白は除いた |
| 2017h29a-q018 (p09) | clean / zh / en | 図題は括弧なし | 「」/ zh “” / en ASCII " | cosmetic |
| 2016h28h-q020 (crop) | raw / clean | 法人税，住民税及び事業税 | 「、」 | cosmetic (CLEAN 抽検で検出)。この field には他に読点がないので、「，」にしても字形は割れない (B8 規則)。zh の「、」は中文として正しい |
| 2016h28h-q045 (crop) | raw (出荷層) | 「…ことをいう。購買業務…」と同一行 | 「。 購買」 | cosmetic (fixer 走査) |

### 4b. 選択肢 (raw = 出荷層)

| id (p) | 源 | dataset | 判定 / 追随 |
|---|---|---|---|
| 2016h28h-q096 ア〜エ (p44) | 国語が合格で，かつ，氏名が“%子”に該当する学生 等 | 「、」+ ASCII ` "%子" ` | cosmetic、**エ = 正解肢**。LIKE パターンは D-151 / D-156 では「検索式」として除外される型だが、源が “” なので D-155 (原典字形) を優先した (§9 判断 3)。zh / en の選択肢も、題幹にある “%” と同じ “%子” にそろえた |
| 2017h29a-q092 ア〜エ (p35) | 未設定 = 「－」 | 「ー」(長音 U+30FC)、凡例と zh は「－」 | cosmetic (fixer 走査)、**エ = 正解肢**。「:ー」→「:－」(「グループ」の ー は巻き込まない)。解説の − / － の混在は ⑨ |
| 2016h28h-q080 ア〜エ (p36) | ＊ ／ | 同じ | cosmetic (fixer 走査、**D-162** で * /)、**ウ = 正解肢**。zh / en と解説 (式の中の 13 + 26 字) も変えた。比較記号 ≧ ＞ ≦ ＜ は演算子ではないので原典どおり |
| 2015h27a-q090 イ ウ エ (p40) | (B2－C2)*D2 等 | − (U+2212) | cosmetic (CLEAN 抽検で検出、D-162 / D-159)、**イ = 正解肢**。zh / en と解説の式の引用 (jp 3 / tr 6) も変えた。散文中の「(売価 − 原価) × 販売数」は式ではないので不変 |
| 2016h28h-q054 イ (crop) | 完了によって，売上の増加 | 読点なし | cosmetic。字形は源の「，」(この field と同題の他肢には読点がない)。選択肢末の「。」の省略は ⑨ |

### 4c. 不変 (agent DISCREPANT だが不採用)

- `2015h27a-q008`: DFD 言語化の〔〕と注記「（データストアからの入力。矢印にラベルなし）」は描画補助。D-168 の観点でも、業務 A の字句選択 (a) の読解を代替していない (prep の answer_leak reviewed と一致)。添付図 `2015h27a-q008.webp` あり。
- `2017h29a-q097`: マトリクス表の見出し「今回の認証（パスワードは 5025）」「マトリクス表（左）」等は描画補助。64 セルの値は源 p38 と一致 (prep)。網掛けと矢印が言語化されていない点は、添付図 `2017h29a-q097.webp` で補える → ⑨ (図 lane)。

### 4d. 名指し / 走査

- 名指し (prep §3): q100 は採用、q097 は不変 (§4c)。`2016h28a-q075` のパス “．．￥．．￥DIRB￥Fn.txt” は B2 2014h26h-q068 / B7 q063 の先例どおり据え置いた (⑨: パス区切りの字幅)。`2016h28h-q020` は採用 (§4a)。A1 backlog の未処置 high 145 件 / 35 題は、採用分以外は prep の FP 判定どおり。
- fixer 走査 (表示 jp の ASCII `"`・「…」・「、」・CJK␠CJK・`。␠`・全角英数・〇・＊／－−): 追加は q080 / q092 ー / q045。
  - `2015h27a-q071` の `。␠` 4 件は表セル末の markdown の余白で FP。
  - `単位 百万円` (2016h28h-q012 / q020) と、氏名の姓名間の空白 (q096 / 2017h29h-q069) は ⑨ (源は全角空白)。
  - ／ は [表] の区切り・単位 (2015h27a-q054 / 2017h29a-q003 / q092 / 2016h28a-q060 / 2016h28h-q018 / q098) なので不変。
  - `2016h28h-q033` の表の「−」は「該当なし」のセルで演算子ではないので不変。この表は区切り行がないが renderer では任意 (同型が corpus に 11 題)。
- `2015h27a-q086`: recheck-fixer の結論はデータ変更 0 で、本 run も CLEAN → 処置なし。

### 4e. CLEAN 無作為抽検

母集団 = CLEAN 91 − 本 unit で源を読んだ CLEAN 5 (2015h27a-q026 / q071、2016h28h-q045 / q078 / q080) = 86。seed 130 の LCG (B8 §4f と同じ式) で 10 問を抽出: **2016h28h-q020 / 2015h27a-q090 / 2017h29h-q034 / 2015h27a-q075 / 2016h28h-q075 / 2016h28h-q033 / 2017h29h-q029 / 2016h28h-q063 / 2016h28h-q093 / 2015h27a-q024**。
- 結果: 語義の見落とし **0 / 10**。
- 字形の見落としが **2 / 10** あった:
  - q020: 「法人税、住民税」(源は「，」)
  - q090: 式中の −。源は ＝ 全角マイナス。D-162 で ASCII にする
- 2 件とも上の表で採用した。それ以外は源と一致した。字形以外の差は ASCII 読点後の空白欠落 (2017h29h-q029 ウ) と数字前後の空白 (2016h28h-q075 イ) だけで、どちらも exam の型 (⑨)。
- → 手順上は追加の全量走査を要しない (B8 と同水準)。演算子字形は machdiff が正規化するため見えない型 (B7 ⑨ と同件) なので、X2 以降の fixer 走査に「− (U+2212) の式内出現」を加えることを提案する。

## 5. 中問

- 2015h27a の中問 member 8 題のうち、触ったのは q085 (設問側の図題、共通接頭 577 字より後ろ)、q090 (選択肢)、q100 (前文の後の挿入段落 + 末尾、共通接頭 649 字より後ろ) の 3 題。前文 (registry probe / 共通接頭) には触れていない。D-167 型の論点はない。PHASE 2 で chumon `--check` を回して確認する。

## 6. D-143 NOTE_APPEND (final のみ、10 題、MARK = `fidfix-S130-x1`)

- 対象:
  - 語義: 2015h27a-q100、2016h28h-q022
  - 正解肢命中: 2016h28h-q080 (ウ)、q096 (エ)、2017h29a-q092 (エ)、2015h27a-q090 (イ)
  - note の記述が是正対象に触れているもの: 2015h27a-q026 (表は完全一致)、q064 / q072 / 2017h29a-q018 (clean は源と一致)、q090 ((B2−C2)*D2 を引用)
- 再導出 (note 本文と同じ):
  - q026: 180,000 × 0.625 = 112,500 = ア
  - q064: B002 の降順 2 番目 = S0004 = エ
  - q072: a・c = ウ
  - q090: (B2-C2)*D2 = イ
  - q100: 40 + 100 = 140 分 = イ
  - q022: B > C > A = ウ
  - q080: ウ
  - q096: 3 名 = エ
  - q018: ロードマップ = エ
  - q092: その他 R－W－X○ = エ
- 追記しない: 2015h27a-q048 / q085、2016h28a-q074 / q082、2016h28h-q020 / q045 / q054 (字形・空白だけで、note は是正対象に触れていない)。

## 7. 層と局所性 (PHASE 1 dry-run 実数)

```
node scripts/quiz-fidfix-S130-x1.mjs
(dry-run) quiz-fidfix-S130-x1: applied 218, skipped 81   (⚠ 行 0)   ← D-170 追加後
files to write (24): .phase1/tr_ 7 本 (2015h27a-q026 q090 / 2016h28a-q082 / 2016h28h-q020 q022 q080 q096)、questions.json、question_bank.json、
  by_year 4 本 (2015h27a 2016h28a 2016h28h 2017h29a)、translations 4 本、.phase2/expl_{jp,tr} 4 本 (2016h28h-q080 / 2015h27a-q090)、generate_result 4 本
```

- scratch の複製木 (questions / bank / by_year / translations / 5 exam の .phase1・.phase2) で `--apply` → 再実行すると **applied 0 / skipped 299** (冪等、D-170 追加後)。
- 変化した題:
  - `questions.json` の変化は 12 題: 2015h27a-q026 / q085 / q090 / q095 / q098、2016h28a-q082、2016h28h-q020 / q045 / q054 / q080 / q096、2017h29a-q092。
  - translations の変化は 17 題 (D-170 追加の q095 / q098 を含む)。
  - **correct_answer の変化 0**。
- 残存語の走査 (複製木の表示 jp):
  - 是正した字句の残りは 0。
  - 残っているのは次の 3 種類で、すべて ⑨:
    - 未是正の「、」28 field / 21 題 (§9 判断 1)
    - q048 の流れ図の言語化の「」
    - q092 の [表] の区切りの ／
- .phase1 で無言 skip になった層: q064 / q074 / q096 / q100 / q085 / q018 の `tr_` は旧版の別文 (ASCII " や前文埋め込み前の文)。sidecar が出荷層の正 (B8 §7 / B13 §7 と同じ扱い)。
- 基準の取得時点: HEAD `170e767`。作業木には T1 lane の未 commit 変更がありうるが、X1 の 5 exam には触れない想定。PHASE 2 の冒頭に再 dry-run して基準と diff する。

**PHASE 2 (lock 取得時)** の手順:
1. HEAD で再 dry-run し、✓ 行を基準と全文 diff する
2. 退避してから `--apply`
3. `build-quiz-corpus`
4. `quiz-phase2-merge` を 4 exam に
5. machdiff の allowlist に `2016h28h-q078|stem` を追加 (apply 後の値)
6. 事後 machdiff
7. 残存語の走査・波及ゼロ・全ゲート (crosscheck / assert-clean / chumon --check / machdiff vitest / tsc / vitest / next build)

## 8. ゲート (PHASE 1)

| ゲート | 結果 |
|---|---|
| `node --check scripts/quiz-fidfix-S130-x1.mjs` | ✅ |
| fidfix dry-run | ✅ applied 218 / skipped 81 / files 24 / ⚠ 0 (D-170 追加後) |
| scratch apply → 再実行 | ✅ applied 0 (冪等) |
| `correct_answer` 差分 | ✅ 0 |
| crosscheck / assert-clean / chumon --check / tsc / vitest / build | PHASE 2 |

## 9. 主 context 判断が要る項目 (推奨つき) と ⑨

1. **読点「、」** → **主 context 裁定 D-170**: unit 内では、field 内で字形が割れる場合か、field を書き換える場合だけ「、」→「，」にする。exam 全体の「、」は、後で corpus 全体を機械的に一括処理する (⑨)。field 内の割れ: 2015h27a の中問 4 題 (前文「，」/ 設問文「、」) のうち、q085 / q095 / q098 は設問文側の「、」を「，」にした (共通接頭より後ろ)。**q090 の「、」は mqB 前文 (probe 範囲) にあるので不可触 (D-167)**。残る 24 field / 18 題は、field 内で字形がそろっているので不変。以下は裁定前の記述: X1 の 5 exam では「、」が exam 全体の型になっている。
   - 規模: 母数側でも 2015h27a 20 題 / 2016h28a 22 題 / 2017h29h 17 題が「、」で、U4 / U9 / U11 は許容表記揺れとして扱った。B8 の「4 題だけの外れ値」とは状況が違う。
   - 本 unit の扱い: 文ごと置換した field (q064 / q074 / q096 stem + 選択肢) と、field が割れない q020 だけを「，」にした。残る **28 field / 21 題は不変** にしている。
   - **推奨: 現状どおり ⑨** (exam 単位で一括正規化するかどうかを別途決める。X1 の分だけを正規化しても、同じ exam の母数側と割れる)。
   - 代替案: X1 の 28 field を全部「，」にする (B8 規則の機械的な延長)。
2. (裁定: 維持) **2016h28h-q022 の結合セル**: 複写セルを空にし、括弧書きは残した (S113 / B8 q004)。推奨: このまま。
3. (裁定: 維持。D-151 の範囲注記は主 context が付ける) **2016h28h-q096 の LIKE パターン “%子”**: D-151 / D-156 の検索式除外より、D-155 の原典字形 (源が “”) を優先した。zh / en の選択肢も、題幹の “%” と同じ字形にそろえた。推奨: このまま。D-151 の除外は「源が ASCII " の式」に限るという範囲注記を付けることも提案する。
4. (裁定: 維持) **2017h29a-q092 の「，」**: 源では 2 語目と 3 語目の間が改行だけ (区切りの印字がない)。1 行化に伴う読点を残した。推奨: このまま (源どおりに読点を外すと、1 行では語の境界が読めない)。
5. **2016h28h-q078 の allowlist**: PHASE 2 で追加する (図の言語化、漏洩なし)。
- ⑨:
  - 選択肢末の「。」の省略 (2016h28h ほか、exam の型)
  - q048: 流れ図の言語化の「」と en の «»
  - q072: 「〜」と「～」
  - 2016h28a-q075: パスの字幅
  - 2017h29a-q097: 網掛け・矢印 (図 lane)
  - q092: 解説の − と －
  - 2016h28h-q033: 区切り行のない表 (corpus 11 題)
  - 単位行・姓名の空白幅
  - machdiff が演算子字形 (− ＊ ／) を正規化するため、q090 型は agent と machdiff の両方が見落とす → X2 以降の fixer 走査項目に追加することを提案

## 10. Rule B / Rule D

- Rule B: run は 1 回で完走。dry-run の不具合は 1 件で、q092 エの「:ー」の想定回数を 2 と書いて assert で停止した。書き込み前に回数を 3 に直しただけで、data への影響はない (`failures/` の追加は不要)。
- Rule D: Writer = `x1-fixer` (executor)。Reviewer は apply 後に、別の subagent_type (opus) が行う。重点:
  - q100 の挿入段落の削除 (3 層、probe 範囲外であること)
  - q022 の結合セルの扱いと key の再導出
  - q096 / q092 / q080 / q090 の正解肢の字形変更
  - 「、」の範囲 (§9 判断 1)
  - CLEAN 標本を別に抽検すること

---

## 12. PHASE 2 (D-152 lock 付与後、HEAD `eac8943` = T1 commit 済)

**(a) rebase**
- HEAD で再 dry-run した: applied 218 / skipped 81。
- 基準 `x1_fidfix_dry_phase1.txt` (D-170 追加後) と `diff` → **全文一致** (T1 は X1 の field に触れていない)。
- apply 前に questions / bank / answer_keys / translations 4 本 / by_year 4 本 / .phase1 tr_ / generate_result 4 本 / 解説 .phase2 / explanations を scratchpad (`x1_backup/`) に退避した。
- `--apply` → applied 218。

**(b) 再生成**
- `build-quiz-corpus` (2900 問) を実行した。
- `quiz-phase2-merge` を 2015h27a / 2016h28a / 2016h28h / 2017h29a に実行した。
- 出た SUSPECT / STEM-CORRUPTION (2015h27a q099* / 2016h28a q051 q054 q068 / 2017h29a q017) は、どれも本 unit で触れていない題 (既存)。

**(c) allowlist**
- `scripts/quiz-fidelity-machdiff.mjs` の `TRANSCRIPT_PREFIX_ADJUDICATED` に `2016h28h-q078|stem` を追加した。値は extra 155 / head「-左のル-タと右のル-タが相互に接続されている.」/ sha1 `1d8c1663…`。
- q078 の表示は X1 で不変なので、apply 前後で同じ値になる。
- machdiff vitest は 42/42。

**(d) 事後 machdiff**
- 是正後の manifest `x1post` を precrop なしで再構成し、確認後に削除した。
```
machdiff: fields same=495 | AGENT_MISSED=28 | VERDICT_CONFLICT=0 | REPORTED=1 (whole-field 0) | TRANSCRIPT_PREFIX=0 (adjudicated 1) | QUOTE_ASCII=0   (exit 1 = AGENT_MISSED>0、PHASE 1 の run も exit 1)
```
- 消えたもの: `2015h27a-q100` (選択肢行) と `q026` (見出し行)。REPORTED は 4 → 1。q078 は adjudicated になった。
- 増えたもの (どれも裁定どおりで、新規の実残差ではない):
  - `2015h27a-q090 イ ウ エ`: transcript が U+2212 の − を書いている。表示は D-162 で ASCII - にした (normStr は U+2212 を正規化しない)。是正の向きは裁定どおり。
  - `2016h28h-q054 イ`: 読点の差が消えて、末尾「。」の既知型 (⑨) だけが見えるようになった。
  - `2016h28h-q022 row 4`: transcript は結合セルを 2 セルに複写して起こしている。表示は S113 / B8 q004 どおり非展開 (複写セルは空)。
- 残りの AGENT_MISSED は §3 の既知型のまま (q008 / q048 / q055 / q075 / q085 row 10 / q086 / q096 / 2016h28a-q025 / q093 / 2017h29a-q076 / q097)。
- → **新規実残差 0**。

**(e) 残存語** (表示 jp / zh / en、本 unit の是正 field)
- 是正した字句の残りは 0 (「」・ASCII "・「:ー」・＊／・− (式内)・← 複写・挿入段落・選択肢行)。
- 残っているのは ⑨ と §9 の裁定どおりのものだけ:
  - 未是正の「、」24 field / 18 題 (D-170)
  - q048 の流れ図の言語化
  - [表] の区切り ／

**(f) 波及ゼロ**

| 検査 | 結果 |
|---|---|
| `questions.json` の変化 (退避比) | **12 題** = 2015h27a-q026 q085 q090 q095 q098 / 2016h28a-q082 / 2016h28h-q020 q045 q054 q080 q096 / 2017h29a-q092 |
| `question_bank.json` | 同じ 12 題。他は変化 0 |
| `correct_answer` | `git diff -U0 data \| grep -c '"correct_answer"'` = **0** |
| translations | 4 exam で計 17 題 (2015h27a 9 / 2016h28a 2 / 2016h28h 4 / 2017h29a 2) |
| 中問前文 (2015h27a 4 組 × 3 層) | 変化は q085 / q095 / q098 / q100 だけで、どれも初出差分が共通接頭の後ろ: jp q085 578 (> 577) / q095 220 (> 177) / q098 680 (> 664) / q100 667 (> 649)、zh q085 477 (> 475) / q100 532 (= 共通長)、en q085 1486 (> 1477) / q100 1505 (= 共通長)。chumon `--check` 一致 |
| generate_result (退避比) | 変化 10 = note の純粋後置 10/10 (2015h27a 5 / 2016h28h 3 / 2017h29a 2)、他 0 |
| explanations | 10 題が key_guard (note 後置 + round1 publish 9、D-143)。correct / distractors の変化は 2015h27a-q090 と 2016h28h-q080 だけ (式の演算子、§4b) |
| tracked の変化 | explanations 3 本、questions.json、translations 4 本、machdiff 脚本 (+1 行)。新規ファイルは是正器と本書 |
| `answer_keys.json` | md5 `6802bb0bc13004da78ad3c4e5117d997` (前後で同一) |

**(g) ゲート**

| ゲート | 結果 |
|---|---|
| `node --check` 是正器 | ✅ |
| `quiz-keys-crosscheck` | ✅ all invariants hold (A1–A7, B1–B7) |
| `quiz-pagefix-derive-groups --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `quiz-chumon-groups-build --check` | ✅ 生成結果と一致 (mqTech1 / 2 の「registry 無し」は既存の情報行) |
| machdiff vitest | ✅ 42/42 |
| `tsc --noEmit` (apps/web) | ✅ exit 0 |
| eslint (apps/web) | ✅ 0 errors / 1 warning (`RetroGlossary.tsx:31` の未使用変数で既存、本 unit は apps に触れていない) |
| vitest (apps/web) | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped |
| `next build` | ✅ (ルート表まで出力) |
| 是正器の再実行 | ✅ applied 0 / skipped 299 |
| 事後 machdiff | ✅ 新規実残差 0 |
| e2e | 未実行 (B1〜B13 と同じく、文字列置換のみ) |

**(h) 最終の計上**
- **計上 19 / 105 (18.1%)**、U9 は 13 (12.4%)。
- 論理差分 32 = semantic 2 + cosmetic 30。
- 正解肢上 4 (2016h28h-q080 ウ・q096 エ、2017h29a-q092 エ、2015h27a-q090 イ)。
- answer_affecting 0、correct_answer の変更 0。
- Rule B: PHASE 2 で失敗した attempt はない (`failures/` の追加なし)。
- commit は主 context が行う (Rule D の後)。
