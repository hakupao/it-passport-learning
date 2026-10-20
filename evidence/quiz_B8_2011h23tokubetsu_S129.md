# B track B8 — 2011h23tokubetsu の集計と是正 (S129、L3 data lane)

D-150 §3 (母数外 1,692 題の全量再抄写) の **B8**。母数 = 2011h23tokubetsu **100 問 (q001〜q100、除外 0)**。準備は `evidence/quiz_B8_2011h23tokubetsu_prep_S129.md`、名指しは `evidence/quiz_B8_2011h23tokubetsu_named_S129.json` (分類器 = B3 規則、B7 の「raw だけの ASCII `"` = resolved」規則も lead 採用)。
**Sonnet 5 単 pass**。手順の雛形 = B7 (`evidence/quiz_B7_2012h24a_S129.md`) / B6 / S122 log §1〜§7。

**状態: PHASE 2 (apply・再生成・ゲート・事後核験) 完了**。D-152 data lock は B7 commit (`321c76e`) 後に付与された。git add / commit は主 context が行う (本 lane は commit しない)。PHASE 2 の記録は §12。

---

## 1. 入力と実行

- run: `wf_ee9ed363-965` (label `b8`、pass `sn`、model = **Sonnet 5**、gp)、100/100 完走
- マニフェスト: `data/ip/quiz/.phase2/b8_fidelity_input_2011h23tokubetsu.json` (`--precrop` 版、crop 69/100。skip 31 = page_mismatch 31 (OI-1、小問 19 + 中問 12))
- merge-parts: `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/b8_2011h23tokubetsu_sn data/ip/quiz/.phase2/b8_fidelity_input_2011h23tokubetsu.json 2011h23tokubetsu evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b8_2011h23tokubetsu_sn.json --journal <wf_ee9ed363-965/journal.jsonl>`
  - 結果: **journal 100 / part 0、part 欠落・壊れ 0** → 100/100
- 判定の内訳: **CLEAN 83 / DISCREPANT 17 / UNREADABLE 0**、差分 24 件 {semantic 4, cosmetic 20}、正解肢上 1 件 (q020 エ)
- 是正器: `scripts/quiz-fidfix-S129-b8.mjs` (既定は dry-run、`--apply` で書込み)。適用ループは B7 から流用し、解説 `correct` の zh / en 置換 2 行だけを追加した (q100 用)。

---

## 2. 率

| exam | n | agent DISCREPANT | +machdiff | +fixer 走査 / 名指し | **計上 = 是正** (率) | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|---|---|
| 2011h23tokubetsu | 100 | **17** (17 題とも採用あり) | **+1 題** (`q032 ア` 読点) | **+7 題** (`q024` `q035` `q041` `q049` `q052` `q060` `q094`) | **25 (25.0%)** | **1** (`q020 エ`) | **0** |

- 計上した 25 題: q001 q004 q020 q022 q024 q025 q027 q029 q032 q033 q035 q041 q044 q049 q052 q054 q059 q060 q062 q073 q087 q094 q096 q098 q100。
- **U9 定義の計上**: agent DISCREPANT 題で採用差分のあるもの 17 + machdiff 実残差 1 = **18 題 (18.0%)**。B1〜B7 と同じく fixer 走査分を含む数を主とし、U9 定義の数を併記する。
- **論理差分** (題 × field、jp): **25** = cosmetic **18** / semantic **7** / answer_affecting **0**
  - semantic 7: `q001` stem (著作権**の**侵害、衍字) / `q004` stem (結合セルの複写) / `q020 エ` (知りながら → 知っていながら、**正解肢**) / `q025 エ` (パリュー → バリュー) / `q027 イ` (ガパナンス → ガバナンス) / `q087` stem (機能に当たらない → 機能にない) / `q096` stem (見出し〔配列の値〕の脱落 + ② → (2) + 読点、1 field = 1 論理差分)
  - cosmetic 18: `q022` (2,400) / `q024` `q041` `q049` `q094` (「、」) / `q029 エ` (末尾「「」) / `q032 ア` `q044` `q054` (読点の脱落) / `q033 ア` (「.,」) / `q035` `q052` `q060` (改行由来の空白) / `q059` `q062` `q073` (「」→ “”) / `q098 エ` (1,200dpi) / `q100` stem (引用符・src の ASCII ")
  - **agent の severity からの入れ替え** (Rule D の確認点):
    - `q001` cosmetic → **semantic**。源に無い助詞「の」の挿入 = 衍字 (B7 `q058` / B6 `q017 エ` と同じ扱い)。
    - `q004` cosmetic → **semantic**。結合セルの複写 = 源に無いセル内容の挿入 (S113)。括弧書きは主 context 裁定で残す (§4b)。
    - `q096` cosmetic → **semantic**。見出し語〔配列の値〕の脱落 = 語の脱落 (B6 `q058` 表題「商品」と同じ)。
- **正解肢上の差分 1 件**: `q020 エ` (語形のみ、意味同一)。**`correct_answer` は不変**、key 誤りの疑い 0 (§6 の NOTE で題ごとに再導出)。

### 既往波との比較

| | 標本 | 計上 | 率 | 正解肢上 | answer_affecting |
|---|---|---|---|---|---|
| 累計 (+B7、B7 evidence §2) | 1908 | 256 | 13.4% | 54 | 6 |
| **B8 2011h23tokubetsu (未 apply)** | **100** | **25** | **25.0%** | **1** | **0** |
| **累計 (+B8)** | **2008** | **281** | **14.0%** | **55** | **6** |

注: B6 は commit 時に計上 12 (evidence §2 の 11 から +1)。上の累計は B7 evidence の値をそのまま引いたもので、B6 の +1 は主 context の集計で反映すること。

B8 で多かった型:
1. **読点の字種・脱落** (「、」/ 脱落 / 「.,」) — q024 q032 q033 q041 q044 q049 q054 q094 q096 (9 題)。旧 exam の clean 再構成で「、」が入った題が多い
2. **改行由来の空白・残渣** — q029「「」、q035 q052 q060 (raw 出荷層)
3. **OCR の濁点・半濁点** — q025 パリュー / q027 ガパナンス (agent・prep とも検出)
4. **AI 付加・再構成** — q004 注記、q087「当たらない」(raw「たない」からの誤った再構成)、q096 見出し脱落

---

## 3. 機械 diff (machdiff、S128 L1a 改修版) — AGENT_MISSED 10 / QUOTE_ASCII 0 / TRANSCRIPT_PREFIX 0

```
node scripts/quiz-fidelity-machdiff.mjs data/ip/quiz/.phase2/b8_fidelity_input_2011h23tokubetsu.json \
  evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b8_2011h23tokubetsu_sn.json
machdiff: fields same=477 | AGENT_MISSED=10 | VERDICT_CONFLICT=0 | audits w/o transcript=0 | UNREADABLE skipped=0 | coverage 100/100 | same∩reported=3 | REPORTED=13 (whole-field 10) | REPORTED_TRUNCATED_QUOTE=0 | LAYOUT=0 | KNOWN_FP=0 | TRANSCRIPT_PREFIX=0 (adjudicated 0) | QUOTE_ASCII=0 | REPORTED_BUT_TRANSCRIPT_EQUALS_DISPLAYED=0
```

全残差を源で裁定した:
- **(a) `q032 ア` = 実残差 → 採用** (cosmetic)。源 p12「販売し，落札者から」。agent は CLEAN。名指し (prep §3) とも一致。
- **(b) `q015 ア〜エ` = 選択肢が図 (散布図 4 枚) で、表示は図の言語化 → 不変**。crop p07 と 4 文を照合し全一致 (ア 右上がり / イ 右下がり / ウ 水平帯 / エ 無相関)。答えを漏らす付加句 (「負の相関」等) は無い → D-163 の (1)(2) に当たらない。図 webp あり。⑨ に記録 (choice_figures 未整備の題、q070 / q099 も同型)。
- **(c) `q097` @151 = 前文の 図1 (懸賞ページ案) の言語化 → 不変**。源 p39 の図1 と全ラベル (〈懸賞ページタイトル〉〜注記) が一致。B7 `q021` / B5 `q052` と同じ描画補助の扱い。
- **(d) `q094` `q095` `q099` `q100` = 中問前文の偽陽性** (既知型、D-141。前文頁が source / prev に無い member、prep §2 の表どおり)。設問文以降を fixer が源ページで実読: q094 p37 / q095 p38 / q099 p41 / q100 p42 (q094 / q100 の別件は §4b)。
- (e) `q100` の agent 側 src 抜粋「完成したank」は前文頁不可視による transcript の切れで、内容の差ではない。

→ 実残差は **1 (q032)**。停止条件 (説明できない残差 > 3) には当たらない。正解肢上の見落としを machdiff だけが拾った例は本 unit では無い。

---

## 4. 裁定 (fixer が源を原寸で独立に実読)

実読した源:
- crop: q001 q015 q019 q020 q022 q024 q025 q026 q027 q029 q033 q035 q041 q049 q051 q052 q054 q059 q060 q061 q062 q064 q070 q072 q077 q087
- 源ページ全体: page-04 (q004 / q005)、page-12 (q030〜q032)、page-16 (q042〜q045)、page-26 (q073〜q075)、page-29 (q082〜q084)、page-33 (q089 / q090)、page-34 (q091 / q092)、page-37 (q094)、page-38 (q095 / q096)、page-39 (中問C 前文)、page-40 (q097 / q098)、page-41 (q099)、page-42 (q100)

agent の `source_text` は候補として扱い、from / to はすべて自分の目で読んでから決めた。

**読点の字種の規則** (本 unit の判断、Rule D 確認点): 2011h23tokubetsu の出荷層は ASCII「, 」の題が 74 題 (⑨、exam 全体の型で不変)。
- 「、」は源「，」に直す (q024 q041 q049 q094 q096 の field は「、」/ 無読点で、「，」に揃えても field 内で割れない)。
- 脱落した読点を補うときは **field の既存字種に揃える**: q044 / q054 は同 field が「, 」→「, 」、q032 ア は field に読点が無く同題ウが「, 」→「, 」。源の字形 (「，」) を入れると field / 題内で字種が割れるため。

### 4a. 選択肢 (raw = 出荷層)

| id (page) | 源 | dataset | 判定 / 追随 |
|---|---|---|---|
| `q020 エ` (p09) | 知って**い**ながら | 知りながら | **semantic**・**正解肢**。zh「明知」/ en "knowing" は可 → 不追随。解説の「知りながら」は地の文の言い換え (引用ではない) → 不変 |
| `q025 エ` (p10) | **バ**リューチェーン分析 | パリュー | **semantic**。zh / en は正 → 不追随。解説エの括弧書き (表記注記) を jp / zh / en とも削除 |
| `q027 イ` (p11) | IT ガ**バ**ナンス | ガパナンス | **semantic**。zh / en は正 → 不追随。解説イの括弧書き (字形注記) を jp / zh / en とも削除 |
| `q029 エ` (p11) | …表示される。 | 末尾「「」 | cosmetic |
| `q032 ア` (p12) | 販売し，落札者 | 読点なし | cosmetic (machdiff / 名指し)。字種は上記規則で「, 」 |
| `q033 ア` (p13) | 場合，クリティカル | 「場合., 」 | cosmetic。余分な「.」のみ除去 (「, 」は exam の型) |
| `q098 エ` (p40) | 1,200dpi | 1200dpi | cosmetic。zh / en の選択肢も同じ文字列なので揃えた。解説が選択肢エの値として引用する「1200dpi」(correct / エ / points[1]、jp / zh / en) も PHASE 2 で「1,200dpi」に揃えた。計算式の「1200²」は不変 |

**D-163**: 選択肢が図の題は q015 (散布図) / q070 (直列・並列構成) / q099 (ページ構成図)。いずれも choice_figures 未整備で図の言語化が表示されているが、源の図と全一致し、答えを漏らす付加句は無い (q099 の「(太枠)」は源の太枠どおり) → 是正なし、⑨ に記録。
**D-164**: 題中の表で定義された記号は無い → 該当なし。
**D-162**: 表計算式の題は無い。q093 / q094 の「J＋K」「≧」は流れ図・決定表の条件式で、q093 選択肢と揃ったまま不変 (⑨)。

### 4b. 題幹

| id (page) | 層 | 源 | dataset | 判定 |
|---|---|---|---|---|
| `q001` (p03) | raw = 出荷層 | 著作権侵害 | 著作権**の**侵害 | **semantic** (§2)。zh / en は可 → 不追随 |
| `q004` (p04) | clean | 最下段「契約締結」はユーザ・ベンダ両枠にまたがる 1 箱 | ベンダ列に「契約締結」を複写 | **semantic** (結合セルの展開)。下記 |
| `q022` (p09) | raw / clean | 2,400 万円 | 2400 | cosmetic。zh「2,400 万日元」も追随。en "24 million yen" は可。「／」「％」の字幅と ASCII 読点は exam の型で不変 |
| `q024` (p10) | clean | 「，」×3 | 「、」 | cosmetic |
| `q035` (p13) | raw = 出荷層 | 報告された。IT | 「。 IT」 | cosmetic (空白) |
| `q041` (p15) | clean | 「，」×2 | 「、」 | cosmetic |
| `q044` (p16) | clean | 是正や，新しい | 読点なし | cosmetic (agent)。raw「是正や。 新しい」は非出荷 (N5) |
| `q049` (p18) | clean | 場合，システム | 「、」 | cosmetic |
| `q052` (p19) | raw = 出荷層 | 最も適切 | 「適 切」 | cosmetic (空白、R8b) |
| `q054` (p19) | raw / clean | 場合，システムテスト | 読点なし | cosmetic (agent) |
| `q059` (p21) | clean | “社員” “高橋二郎” | 「」 | cosmetic。zh「」は ⑨-c、en は既に “” |
| `q060` (p21) | raw = 出荷層 | 何回実行 | 「何回 実行」 | cosmetic (空白、R8b) |
| `q062` (p22) | clean | “空港” “ダイヤ” | 「」 | cosmetic。zh ⑨-c、en は既に “” |
| `q073` (p26) | clean | “CR” (C の右下に R の制御コード表記) | 「CR」 | cosmetic。zh ⑨-c、en は既に “”。CR の組版表記は corpus 慣行の範囲 |
| `q087` (p30) | clean | 機能に**ない**もの (太字) | 機能に当たらないもの | **semantic**。raw の OCR「たない」から clean が誤って再構成。zh「不属于」/ en "NOT a feature" は可 → 不追随 |
| `q094` (p37) | raw / clean | 「，」×7 | 「、」 | cosmetic (設問文・注記1・注記2。注記2 後半の 2 か所は PHASE 2 の残存語走査で追加)。表1 の「J＋K」は不変 (§4a) |
| `q096` (p38) | clean | 「1 日券，2 日券」「〔処理内容〕の (2)」、配列値の前に〔配列の値〕 | 「1日券,2日券」「②」、見出しなし | **semantic** (見出しの脱落)。zh / en も ② → (2)、見出し〔数组的值〕/ [Array values] を補う。「J=10, K=20」・TP 列の「, 」は式の体裁で不変 |
| `q100` (p42) | clean | 下記 | 下記 | cosmetic。下記 |

**`q004` (流れ図の表への起こし)**: 表示 clean は図を 2 列の表に起こしている。他の段 (要件仕様書作成 → … → 調達先選定、② → ③ / ③ → ④) は図と一致 → **描画補助として不変** (B7 `q080` / B4 `q055`)。最下段は 2 点を分けて判断した:
  - ベンダ列の「契約締結」= 結合セルの複写 → 除去 (S113: 結合セルは展開しない)。
  - 「（ユーザ・ベンダ両者にまたがる）」= 文言は源に無いが事実 (箱が両枠にまたがる) は図にある配置の記述で、B7 `q080` の推論文とは異なる。fixer は当初削除としたが、**主 context 裁定 (S129、D-161): 残す** — 複写セルの除去で失われる配置情報を 1 回だけ担う事実記述で、推論ではない。
  - 是正後は `| 契約締結（ユーザ・ベンダ両者にまたがる） |  |`。zh / en も同形に。raw の言語化文 (「契約締結はユーザ・ベンダ両方にまたがる行。」) は非出荷 (N5)。

**`q100` (lead 指示 = D-155 で決め A3 の意図を記録)**:
- 〔ファイルの指定方法〕(1)〜(5): 源は “…”、表示は「」 → **引用符だけ “” に**。￥ / . の字幅は **S129 裁定** (B2 `2014h26h-q068` / B7 `q063` と同じく据え置き) に従い不変。zh (1)〜(5) の「」は ⑨-c、en は既に “”。
- **HTML の src="…"** (散文中の `src="ファイル名"` と〔写真1を表示するタグ〕の `<img src=" a ￥s01.jpeg " … >`): 源は ASCII `"`。**D-155 (源の字形) により jp / zh / en とも ASCII `"`** に是正し、解説 correct の `src=「..￥..￥tgazou￥s01.jpeg」` (jp / zh) / `src=“…”` (en) も ASCII `"` に揃えた。
  - **主 context 裁定 (S129、D-166 minor)**: コード片・HTML 属性内の引用符は源の ASCII `"` を保つ (D-151 / D-156 のコード除外と同じ扱い) → **採用**。**A1 の「raw だけの ASCII `"` = resolved」規則はコード片を対象外とする**。
  - **A3 の意図の記録**: A3 (S129) はコード片の `src=「…」` を意図的に不触とした (prep §3)。理由は「出荷層に ASCII `"` を入れない」方針との衝突回避とみられる。今回は (1) 源が ASCII `"`、(2) HTML の属性値を「」で示すのは構文として誤りで学習者を誤導する、(3) B7 の「raw だけの ASCII `"` = resolved」規則は散文の引用符を対象とし、コード片は対象外、の 3 点から D-155 を優先した。散文の引用符 (“”) とコード片 (`"`) を分けるのは B3 以降の表計算式 (`'○'`、D-162) と同じ考え方。A3 の不触はこの規則 (D-166) が無かったため。
  - **下流への影響** (PHASE 2 で確認): (i) 適用後の q100 は **corpus で初めて `stem_jp_clean` に ASCII `"` を持つ題**になる (現在 0。raw 出荷層では `2009h21h-q002` `2010h22h-q008` `2019h31h-q025` の 3 題に既存)。(ii) machdiff の QUOTE_ASCII は「表示に `"` があり transcript に `"` が無く “”/「」がある」場合だけ立つ (`scripts/quiz-fidelity-machdiff.mjs:171`)。q100 の transcript は src を ASCII `"` で写しているので**ヒットしない見込み** (exit にも影響しない)。(iii) A1 分類器は q100 の raw 0q.prose 36 件を「表示 jp に ASCII `"` が 0」を根拠に resolved にしていた → 適用後は未処置 high に戻りうる。B7 の resolved 規則に「コード片の ASCII `"` は対象外」の注記が要る (主 context 判断)。
- **zh の〔技术类〕**: zh stem だけに残った分野見出し (源の〔テクノロジ〕に相当)。jp / en / 他 member の zh には無い (S117 normalize で除去済みの型) → 除去 (cosmetic、訳層のみ)。

**中問の前文**: 12 member とも前文は registry の probe と一致 (prep §1)。前文領域は触らず、from はすべて設問文側の部分一致。

### 4c. 名指しの項目

- 名指し全件 (q020 / q025 / q027 / q087 / q001 / q022 / q098 / q033 / q029 / q044 / q054 / q032 / q059 / q062 / q096 / q100 / q073 / q004): 上記どおり採用。
- `q073`: 名指しの「要確認」→ 源 “CR” で採用。
- 要確認の空白: `q052` `q060` `q035` → 3 題とも源で確認し採用。
- 「、」の 4 題 (q024 / q041 / q049 / q094): 4 題とも源「，」で採用。
- A1 backlog の未処置 high (102 件 / 31 題) は、上記の採用分以外は prep の FP 判定 (中問の 0a.* = 前文挿入、2.nine_six = 表の値・日付・「6 か月」、q015 / q099 = 図の言語化文の語) を源照合で確認、不変。
- answer_affecting の疑い 30 題の再導出 (prep §3) は本 unit の是正後も成り立つ (変更した題は §6 で再導出)。

### 4d. 訳層・解説の追随

- 訳層 (sidecar zh 8 + en 6 操作、.phase1 20 操作):
  - 語義・構造: `q004` zh / en (最下段)、`q096` zh / en (② → (2)、見出し)
  - 数値: `q022` zh、`q098 エ` zh / en
  - コード片: `q100` zh / en (src の ASCII `"`)、zh〔技术类〕除去
- D-151 / D-156: 追加した引用符は jp の “” のみ。訳層に足したのはコード片の ASCII `"` だけ。
- 解説 (.phase2): `q025` エ / `q027` イ の括弧書き (OCR 崩れの注記) を jp / zh / en で削除、`q100` correct の src を jp / zh / en で ASCII `"`。
- 他の解説は是正対象の字句を引用していない (q001 / q020 / q022 / q098 は地の文・計算文で使用)。key_guard note の腐敗語言及は D-143 に従い書き換えず NOTE_APPEND (§6)。

### 4e. fixer 走査

出荷層 (clean があれば clean、選択肢は raw) を `/"/`・`「…」`・`CJK␠CJK`・`、`・`.,`・`。␠`・末尾「「」・重複字で走査し源照合。
- 採用: q024 q035 q041 q049 q052 q060 q094 (名指しの要確認と重複)。
- 不変: ASCII 読点「, 」(exam 全体)、q015 ウ / q099 イ〜エ の「、」(図の言語化文の中で源に対応文が無い)、q026「単位 百万円」(源「単位　百万円」、空白幅のみ)、q090 選択肢の「[表]」一行化 (B7 `q011` / `q083` と同じ)、q072 / q083 の空欄枠の「a」「［ a ］」表記 (corpus 慣行)。

### 4f. CLEAN 標本の無作為抽検

- 母集団: CLEAN 83 問から本 unit で既に読んだ題 (q005 q015 q024 q026 q030 q031 q032 q035 q041 q042 q043 q045 q049 q052 q060 q074 q075 q094 q095 q097 q099) を除いた **62 問** (id 昇順)。
- 抽出: B1〜B7 と同じ seed 128 の LCG (`s = (s·1103515245 + 12345) mod 2^31`、JS Number、`c[s mod 62]`、重複は引き直し) で 10 問: **q091 q061 q070 q077 q051 q072 q019 q090 q064 q083**。

| id | 実読結果 |
|---|---|
| `q091` `q061` `q077` `q051` `q019` `q064` `q083` | 一致 (読点の字種は exam 全体の型で除外) |
| `q070` | 一致 (選択肢は図の言語化、4 図と全一致、§4a D-163) |
| `q072` `q090` | 一致 (選択肢表の「[表]」一行化、値は全一致) |

→ 語義の見落とし **0 / 10**、字種を含めても **0 / 10**。本 unit で源を読んだ CLEAN 題での Sonnet の miss: q024 q041 q049 q094 (、)、q032 (読点)、q035 q052 q060 (空白) — いずれも cosmetic。semantic の miss は 0。

---

## 5. SOURCE_TYPOS

該当なし。

---

## 6. 採用した差分 (25 題 / 25 論理差分 + 訳層 + 解説 9)

| id (page) | field | 差分 | severity | 由来 |
|---|---|---|---|---|
| q001 (p03) | stem (raw) | 著作権の侵害 → 著作権侵害 | **semantic** (agent: cosmetic) | agent |
| q004 (p04) | stem (clean) | 最下段のベンダ列の複写セルを除去、括弧書きは残す (zh / en 追随) | **semantic** (agent: cosmetic) | agent |
| q020 (p09) | choice.エ | 知りながら → 知っていながら (**正解肢**) | **semantic** | agent |
| q022 (p09) | stem (raw / clean) | 2400 → 2,400 (zh 追随) | cosmetic | agent |
| q024 (p10) | stem (clean) | 、→ ，×3 | cosmetic | 名指し / 走査 |
| q025 (p10) | choice.エ | パリュー → バリュー (解説エ追随) | **semantic** | agent |
| q027 (p11) | choice.イ | ガパナンス → ガバナンス (解説イ追随) | **semantic** | agent |
| q029 (p11) | choice.エ | 末尾「「」除去 | cosmetic | agent |
| q032 (p12) | choice.ア | 読点を補う | cosmetic | **machdiff** |
| q033 (p13) | choice.ア | 「場合.,」→「場合,」 | cosmetic | agent |
| q035 (p13) | stem (raw) | 「。 IT」の空白 | cosmetic | 名指し / 走査 |
| q041 (p15) | stem (clean) | 、→ ，×2 | cosmetic | 名指し / 走査 |
| q044 (p16) | stem (clean) | 読点を補う | cosmetic | agent |
| q049 (p18) | stem (clean) | 、→ ， | cosmetic | 名指し / 走査 |
| q052 (p19) | stem (raw) | 「適 切」の空白 | cosmetic | 名指し / 走査 |
| q054 (p19) | stem (raw / clean) | 読点を補う | cosmetic | agent |
| q059 q062 q073 (p21 / 22 / 26) | stem (clean) | 「」→ “” | cosmetic ×3 | agent |
| q060 (p21) | stem (raw) | 「何回 実行」の空白 | cosmetic | 名指し / 走査 |
| q087 (p30) | stem (clean) | 機能に当たらない → 機能にない | **semantic** | agent |
| q094 (p37) | stem (raw / clean) | 、→ ，×7 | cosmetic | 名指し / 走査 |
| q096 (p38) | stem (clean) | 読点・② → (2)・〔配列の値〕(zh / en 追随) | **semantic** (agent: cosmetic) | agent |
| q098 (p40) | choice.エ | 1200dpi → 1,200dpi (zh / en) | cosmetic | agent |
| q100 (p42) | stem (clean) | (1)〜(5)「」→ “”、src の「」→ ASCII " (zh / en、解説 correct)、zh〔技术类〕除去 | cosmetic | agent |

**D-143 NOTE_APPEND (final のみ、18 題)**: q001 q004 q020 q022 q024 q025 q027 q032 q033 q035 q044 q052 q054 q060 q073 q087 q096 q098。
- 対象 = 語義 7 (q001 q004 q020 q025 q027 q087 q096) + 正解肢命中 1 (q020) + note が是正対象の字句を引用・言及 (q001 q004 q022 q024 q025 q027 q032 q033 q035 q044 q052 q054 q060 q073 q087 q096 q098)。
- 再導出 (correct_answer 不変): q001 ア / q004 イ / q020 エ / q022 エ (2,400 ÷ 600 = 4) / q024 ア / q025 ウ / q027 エ / q032 ウ / q033 ウ / q035 ア / q044 エ / q052 ア / q054 ア / q060 ウ (1.6G ÷ 4 = 4 億) / q073 ア / q087 イ / q096 ウ ((10×4,000 + 20×1,500) × 0.9 = 63,000) / q098 イ。
- 追記しない: q029 q041 q049 q059 q062 q094 q100 (字種のみで note に言及なし)。MARK = `fidfix-S129-b8`。

### 指示から外した点・判断の記録

1. `q100` の src を ASCII `"` に (D-166、主 context 裁定で採用、§4b)。
2. 補った読点の字種を field の既存字種「, 」に揃えた (q032 / q044 / q054、源は「，」)。
3. `q001` / `q004` / `q096` を semantic に格上げ。
4. `q004` の表起こしと括弧書きは据え置き (括弧書きは主 context 裁定)、複写セルだけ除去。`q015` / `q070` / `q099` の選択肢の図の言語化と `q097` 前文の図1 の言語化は不変 (D-163 の漏洩なし)。
5. 解説 3 題 (`q025` エ / `q027` イ / `q100` correct) を EXPL で追随。zh の〔技术类〕を除去。

---

## 7. 層と局所性 (PHASE 1 の dry-run 実数)

```
node scripts/quiz-fidfix-S129-b8.mjs
(dry-run) quiz-fidfix-S129-b8: applied 133, skipped 73   (⚠ 行 0)
files to write (21): .phase1/tr_2011h23tokubetsu-q{022,024,041,044,049,054,087,094,096,098}.json, questions.json, question_bank.json,
  by_year/2011h23tokubetsu.json, translations/2011h23tokubetsu.json, .phase2/expl_{jp,tr}_2011h23tokubetsu-q{025,027,100}.json,
  .phase2/generate_result_2011h23tokubetsu.json
```

| 層 | 置換操作数 |
|---|---|
| raw (`questions` / `question_bank` / `by_year`) | **48** (16 × 3) |
| sidecar `stem_jp_clean` | **24** |
| sidecar zh / en | **14** (zh 8 / en 6) |
| `.phase1/tr_<id>.json` | **20** |
| 解説 `.phase2/expl_*` | **9** |
| key_guard final note | **18** |
| **合計** | **applied 133 / skipped 73 / files 21 / ⚠ 0** |

- skip 73 は n===0 の無言 skip (clean だけにある from の raw 側、.phase1 に同文が無い分)。表示層向けの from はすべて ✓ を確認した (clean のある題は `translations.stem_jp_clean`、raw 出荷の q001 / q035 / q052 / q060 は `questions.stem_jp`、選択肢は `questions.choices_jp`、訳層は `translations.stem.*` / `choices.*`)。
- .phase1 で無言 skip した表示層の操作 (sidecar 側は ✓): `q100` の全 12 操作 (.phase1 の stem_jp_clean は別文で `src=「` を含まず、zh の〔技术类〕も別位置)、`q004` の jp / zh / en (.phase1 に注記なし)、`q059` `q062` `q073` (.phase1 の stem_jp_clean は別文)。再 merge 禁止の方針どおり sidecar が出荷層の正で、.phase1 の残りは記録のみ (B7 の q063 / q065 / q080 / q096 と同じ扱い)。
- 基準ファイル: `data/ip/quiz/.phase2/b8_fidfix_dry_phase1.txt` (✓ 行 133)。主 context 裁定 (q004 括弧書きを残す) を反映して取り直した (件数は不変、q004 の to 3 本と note 文言のみ変更)。
- 基準の取得時点: HEAD `5245a1a` (B6 commit 済み) + 作業木に B7 (2012h24a) の未 commit 変更 (`questions.json` / `translations/2012h24a.json` / `explanations/2012h24a.json`)。2011h23tokubetsu に触れる先行変更は無い。

**rebase の管理 (PHASE 2、lock 取得時)**:
1. その時点の commit 上で再 dry-run し、✓ 行を本基準 (**133 / 73 / 21**) と `diff` で行単位に比較する。
2. 消えた ✓ は「適用済み」とみなさない。その時点の field を読み直し、from を取り直す。
3. 重なりうる先行変更: B7 の `questions.json` / `question_bank.json` 全体書き戻し (2011h23tokubetsu の行には触れない見込み)。

---

## 8. 事後核験 (PHASE 2 で実施)

- 是正後の manifest を再構成し machdiff を再実行 (実残差 1 → 0 の見込み。残るのは q015 の選択肢の図言語化、q097 図1、中問前文の既知型)。
- 出荷層の残存語 0 の確認: `著作権の侵害となる` `またがる） | 契約締結 |` `双方） | 签订合同 |` `Vendor) | Conclude contract |` `知りながら，自社` `2400 万` `パリュー` `ガパナンス` `される。「` `販売し落札者` `場合.,` `。 IT` `適 切` `何回 実行` `場合 システム` `是正や新しい` `「社員」` `「空港」` `「CR」` `機能に当たらない` `、`(q024 q041 q049 q094 q096) `の②` `1200dpi` `src=「` `〔技术类〕`
- 波及ゼロ: correct_answer の差 0、translations は 2011h23tokubetsu のみ、note は純粋な後置 18/18・round1 変更 0、`answer_keys.json` の md5。

## 9. ゲート

| ゲート | PHASE 1 |
|---|---|
| `node --check scripts/quiz-fidfix-S129-b8.mjs` | ✅ |
| fidfix dry-run | ✅ applied 133 / skipped 73 / files 21 / ⚠ 0 |
| `correct_answer` の差分 | ✅ 0 (是正器は触れない) |
| crosscheck / assert-clean / chumon --check / tsc / vitest / build / 冪等の再実行 | PHASE 2 |

## 10. 見送り / backlog

| 項目 | 内容・理由 |
|---|---|
| ASCII 読点 | 2011h23tokubetsu 出荷層の「, 」74 題 (exam 全体の型、⑨) |
| ⑨-c | `q059` `q062` `q073` `q100` zh の「」 |
| 図の言語化 (描画補助) | `q004` 表への起こし、`q015` / `q070` / `q099` 選択肢、`q097` 前文 図1、`q090` / `q072` 選択肢表の一行化 |
| choice_figures 未整備 (図 lane) | `q015` `q070` `q099` (D-163 の漏洩なし、図化は図 lane) |
| 字幅 | `q100` ￥ / .(S129 裁定で据え置き)、`q022` ／ ％ |
| 演算子の字形 | `q093` / `q094` の「J＋K」(流れ図・決定表、D-162 の対象外として不変) |
| 解説の数値表記 | `q022` の「2400」(計算式の数値。選択肢の引用ではない)、`q098` の「1200²」(式) |
| N5 (raw の残存腐敗、clean が出荷層) | q004 raw の言語化文、q044 raw「是正や。 新しい」、q087 raw「機能にたない」、q096 raw の OCR 崩れ全般、q100 raw 冒頭〔テクノロジ〕、**q094 raw stem_jp の表1 で J / K 行の Y/N が入れ替わっている** (Rule D NIT-1、raw のみ・clean は源どおり) |

## 11. Rule B / Rule D

- **Rule B**: run は 1 回で完走。是正器の dry-run も初回で ⚠ 0 (failed attempt なし)。`failures/` への追加なし。
- **Rule D**: Writer = `b8-fixer` (opus)。Reviewer は別の `subagent_type` (opus) が apply 後に実施すること。審査の重点:
  1. §4b `q100` src の ASCII `"` (D-166) と (1)〜(5) の “”・zh〔技术类〕
  2. §4b `q004` (複写セルの除去、括弧書きは主 context 裁定で残す) と zh / en
  3. §4 冒頭の読点の字種規則 (補う読点を field の字種「, 」に揃えた q032 / q044 / q054、主 context 裁定で採用)
  4. §2 severity の入れ替え (`q001` / `q004` / `q096` 格上げ)、`q087` の再構成誤りの是正
  5. §4a `q020 エ` (正解肢) と D-163 の判断 (`q015` / `q070` / `q099`)
  6. §4f CLEAN 標本 (重ならない標本での追加抽検を推奨)

---

## 12. PHASE 2 (D-152 lock 付与後)

**(a) rebase**: lock 付与時の HEAD `321c76e` (B7 commit 済み、`data/ip/quiz` 作業木 clean) で再 dry-run → **applied 133 / skipped 73 / files 21**、✓ 行を基準 `b8_fidfix_dry_phase1.txt` と `diff` で行単位比較し **完全一致**。そのまま `--apply`。

**(b) 主 context 裁定の反映** (PHASE 1 報告後、apply 前): q004 括弧書きを残す (to 3 本と note 文言)、q100 = D-166、読点の字種規則 = 採用。基準は裁定反映後に取り直したもの。

**(c) 残存語走査で追加した是正** (lead 指示: 解説側の表・式引用も走査):
- `q094` 注記2 後半「結果が、Y，Y，Yとなったとき、合計金額」の「、」×2 → 「，」(raw 3 層 + clean + .phase1、5 操作)。PHASE 1 の from が注記2 前半で切れていた fixer の取りこぼし。
- `q098` 解説が選択肢エの値として引用する「1200dpi」→「1,200dpi」(correct / distractor エ / points[1] × jp / zh / en、9 操作)。B7 MINOR-1 (解説の式引用と選択肢の字形不一致) と同型。適用ループに points の置換 4 行を追加。
- `--apply` → applied 14 → 再生成・merge → 全ゲートを再実行。

**(d) 是正器の総計: applied 149 / files 23** (raw 51、clean 25、zh / en 14、.phase1 21、解説 20、note 18)。冪等: 再実行 (dry-run) は **applied 0 / skipped 222 / files 0**。
- Rule D (b8-reviewer、PASS-with-notes) の **NIT-2** を lock 保持中に是正: 解説の括弧書き削除で残った半角空白 2 か所 (q025 エ jp「バリューチェーン分析 は」/ q027 イ jp「IT ガバナンス を」)。zh / en に同型なし。apply 2 → 再生成・merge → 全ゲート再実行 (下表と同じ結果) → 冪等 (applied 0 / skipped 222)。

**(e) 再生成**: `node scripts/build-quiz-corpus.mjs` (2900 問 / 29 exam) → `node scripts/quiz-phase2-merge.mjs 2011h23tokubetsu` (explained 100 / missing 0、SUSPECT 4 / STEM-CORRUPTION 16 — key_guard は note_jp 以外の変化 0 なので名簿は構成上不変)。

**(f) 事後 machdiff** (是正後 manifest `b8post` を再構成。precrop は退避して `diff -rq` で 69/69 + report 一致を確認、`b8post` manifest は削除済み)
```
machdiff: fields same=490 | AGENT_MISSED=10 | VERDICT_CONFLICT=0 | ... | same∩reported=15 | REPORTED=0 (whole-field 0) | TRANSCRIPT_PREFIX=0 | QUOTE_ASCII=0
```
- REPORTED 13 → **0** (same 477 → 490)、q032 ア は**消えた**。q100 の ASCII `"` で QUOTE_ASCII は立たない (§4b の見込みどおり)。
- 残る AGENT_MISSED 10 は不変と裁定した既知型のみ: q015 選択肢の図言語化 (4)、q097 図1、中問前文 4 (q094 q095 q099 q100)、**q004 row 15** (主 context 裁定で残した括弧書き「（ユーザ・ベンダ両者にまたがる）」、裁定どおり)。**新規残差 0**。

**(g) 出荷層・解説の残存語** (jp: clean || raw stem + 選択肢 raw、zh / en: sidecar、解説: merge 後 explanations の note 以外):
- §8 の語 (`著作権の侵害となる` `またがる） | 契約締結 |` `知りながら，自社` `2400 万` `パリュー` `ガパナンス` `される。「` `販売し落札者` `場合.,` `。 IT` `適 切` `何回 実行` `場合 システム` `是正や新しい` `「社員」` `「空港」` `機能に当たらない` `の②` `1200dpi` `src=「` `src=“` `〔技术类〕` `1日券,2`) → **jp / zh / en 0**。`「CR」` は q073 zh の 1 件のみ (⑨-c)。
- 2011h23tokubetsu の jp 表示 stem の「、」 = **0** (是正前 q024 q041 q049 q094 q096)。
- 解説 (note 以外) の `パリュー` `ガパナンス` `1200dpi` `src=「` `src=“` `当たらないもの` = **0**。key_guard note には D-143 どおり残る (NOTE_APPEND で是正済みと追記)。
- zh の ASCII `"` は q100 のコード片のみ (D-166)。

**(h) 波及ゼロ**

| 検査 | 結果 |
|---|---|
| `questions.json` 2900 問の変化 id (HEAD 比) | **14 題** = q001 q020 q022 q025 q027 q029 q032 q033 q035 q052 q054 q060 q094 q098 (他の 11 題 q004 q024 q041 q044 q049 q059 q062 q073 q087 q096 q100 は sidecar のみ) |
| `question_bank.json` の変化 (適用前退避比) | 同じ 14 題 |
| `correct_answer` 変更 | **0 / 2900** (questions HEAD 比・bank 退避比)、`git diff -U0 data \| grep -c '"correct_answer"'` = **0** |
| translations の変化 | 2011h23tokubetsu の 15 題のみ (他 exam 0) |
| 中問前文 (3 組 12 member × jp clean / zh / en) | 先頭 300 字 (q100 zh は〔技术类〕除去位置の手前 150 字) が HEAD と **36/36 一致**。crosscheck A7 (probe 包含) GREEN |
| tracked の変化 | `questions.json` / `translations/2011h23tokubetsu.json` / `explanations/2011h23tokubetsu.json` の 3 本のみ |
| `generate_result_2011h23tokubetsu.json` (退避比) | note 変化 **18、純粋後置 18/18**、`key_guard_round1` 変化 **0**、note_jp 以外の変化 **0** |
| `explanations/2011h23tokubetsu.json` 内 MARK `fidfix-S129-b8` | **18** |
| `answer_keys.json` | md5 `6802bb0bc13004da78ad3c4e5117d997`、mtime `1788586696` **前後同一** |
| round1 publish (Rule D NIT-3) | merge 後 explanations で round1 由来の表示が 14 題 (D-143 §4/§5 の union 則による既存仕様、本 unit の変更ではない)。記録のみ |

**(i) ゲート** (追加 apply・再生成の後に全項目を再実行)

| ゲート | 結果 |
|---|---|
| `node --check scripts/quiz-fidfix-S129-b8.mjs` | ✅ |
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ `questions=2900 exams=29 layerB=ran` / all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 |
| `tsc --noEmit` (apps/web) | ✅ |
| vitest (apps/web) | ✅ 38 passed / 1 skipped (39 files)、562 passed / 2 skipped |
| `next build` (apps/web) | ✅ |
| fidfix 再実行 (dry-run) | ✅ applied 0 / skipped 222 / files 0 (完全冪等、NIT-2 後) |
| 事前 / 事後 machdiff | ✅ REPORTED 13 → 0、q032 消滅、新規残差 0 |
| e2e (Playwright) | **未実行** — B1〜B7 と同じ理由。本 unit は文字列置換のみ |

**(j) 最終の計上** (PHASE 2 の追加は既計上の題・field 内なので件数不変): **計上 25 (25.0%) / U9 定義 18 (18.0%) / 論理差分 25 = semantic 7 + cosmetic 18 / 正解肢上 1 (q020 エ) / answer_affecting 0 / correct_answer 変更 0**。

**(k) Rule B**: PHASE 2 の追加是正 (q094 / q098 解説) は fixer の取りこぼしで、失敗 attempt ではない (apply は成功、追加 apply で補完)。`failures/` への追加なし。
