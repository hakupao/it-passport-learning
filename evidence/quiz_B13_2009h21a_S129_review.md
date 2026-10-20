# B13 (2009h21a) Rule D 独立審査 — S129

- Reviewer: `b13-reviewer` (`oh-my-claudecode:verifier`, opus)。Writer = `b13-fixer` (executor)。subagent_type・context とも別。
- 対象: 未 commit の `data/ip/quiz/{questions.json, translations/2009h21a.json, explanations/2009h21a.json}`、gitignore 層 `data/ip/exams/{question_bank.json, by_year/2009h21a.json}`、是正器 `scripts/quiz-fidfix-S129-b13.mjs`、記録 `evidence/quiz_B13_2009h21a_S129.md`。
- read-only (データ・スクリプト・git 不変)。HEAD 版を scratchpad に退避し、leaf 単位の構造 diff を自作スクリプトで取った。源は `data/ip/exams/pages/2009h21a/page-NN.png` を原寸で実読した。

## 判定: **PASS-with-notes** (MAJOR 0 / MINOR 1 / NIT 2)

## 1. git diff の説明可能性

| 検査 | 結果 |
|---|---|
| `questions.json` | 26 leaf / **13 題** (q005 ア イ、q007 stem、q008 エ、q015 イ、q018 ア〜エ、q048 ア〜エ、q073 イ、q082 エ、q086 イ、q093 ア〜エ、q094 ア〜エ、q095 stem、q096 stem)。2009h21a 以外は 0 |
| `translations/2009h21a.json` | 35 leaf。jp 側は sidecar のみの 5 題 (q017 q044 q060 q062 q089 の stem_jp_clean) + q095 q096 clean。zh / en は q008 q017 q044 q048 q082 q089 q093 q095 の追随。jp の論理差分は raw 26 + sidecar 5 = **31** で、記録 §12(i) の 31 と一致する。説明できない hunk は 0 |
| `explanations/2009h21a.json` | 54 leaf。final `note_jp` 12 件 (q005 q008 q017 q018 q048 q060 q062 q073 q086 q089 q093 q094) は**すべて純粋な後置** (`startsWith` + MARK `fidfix-S129-b13`)。`round1` 新設 8 件 (q005 q008 q017 q018 q048 q062 q073 q086) は merge の仕様どおり (D-143、B11 / B12 と同じ型)。本文の変化は q008 エ / q017 ○ / q048 ウ / q062 “tmb” / q082 5,000 / q093 D-162 だけ |
| `correct_answer` | `git diff -U0 data \| grep -c correct_answer` = **0** |
| 範囲外 | tracked は上記 3 件 + session log 4 行だけ |
| 中問 | q090〜q092 は jp / zh / en とも HEAD と全文一致。q089 の共通接頭は jp 516 / zh 448 / en 1717 字で、前文 (jp 466 / zh 394 / en 1542 字) より後ろだけが変化している。`chumon-groups-build --check` ✅ (probe 不変) |
| bank / by_year | q093 `source` は両層とも `page-37` (q092 = 35、q094 = 38)。p37 には「〔ストラテジ〕問93 … ア C2／B2 … エ D2／D12」が実在する ✓ |

## 2. 差分を源と照合

- **q018** (p08) 4 肢すべて源と逐字一致 (「一会計期間…貸借対照表…強制される。」「…会計報告を行う。」「財務諸表規則…会計処理を行う必要がある。」「…経営判断のための内部報告書を作成する。」)。エ = 正解肢 ✓
- **q005** (p04) ア 事業投資リスク / イ 情報漏えいリスク ✓ (ア = 正解肢)。**q015** (p07) イ「納品するまでの」✓。**q008** (p05) エ「生産受託する」✓。zh「受托生产服务」/ en "contract-manufacturing" / 解説 jp・zh の引用も受託側に揃った。イ「生産委託」は源どおり残っている ✓
- **q086** (p31) イ「2 系統」✓ (正解肢)。**q073** (p27) イ「バックドア」✓。**q082** (p30) エ「5,000」✓ (解説 jp / zh / en も)
- **q048** (p18 + `quiz-figures/2009h21a-q048.webp`): webp に 4 枚のグラフがア〜エのラベル付きで入っており、源 p18 と同じ図 ✓。choices は jp「図ア〜図エ」/ zh「图ア〜」/ en "Figure ア〜" ✓。ウの V 字の底は、x 軸の「製造」と「テスト」の間 (製造寄り) にある。解説ウの書き直し「製造とテストの間が最も低い」は図と合っており、旧文「テスト段階が最も低い」は図と合っていなかった ✓。正解の説明 (ア「ゆるやかに始まり終盤で急激に立ち上がる」) も図と一致する
- **q093** (p37) `C2/B2` 等、**q095** (p39) `I2+H3` は D-162 どおり (源の ／ ＊ ＋ を半角の演算子に)。〔条件〕(3) は前文の外 ✓。**q094** (p38) ア〜エ “商品え” / “商品か” / “商品く” / “商品こ” ✓ (ウ = 正解肢)
- **q044** (p16) “…”，区切り ✓。付加文の削除 (3 層) ✓。箱の言語化は 4 箱 ✓。**q060** (p23) 題幹の “” と「，」✓ (選択肢の表題は取り下げで不変、vitest fixture)。**q062** (p24) “tmb” ✓。**q017** (p08) ○ ✓。**q007** (p05) / **q096** (p39) の「。 」空白除去 ✓
- **q089** (p33 / webp): 新しい言語化は、記号種別の語 (データストア / 処理 / プロセス) を 3 層とも含まない。a / b と網掛け要素は中立の「要素n」で書かれ、網掛け要素の種別からの交互推測も封じられている (残るのは DFD の接続規則から推せる範囲だけで、これは本問が問う知識そのもの)。要素1 の網掛けは源どおり ✓。**ただし MINOR-1** (下記) がある

## 3. 独立した見落とし抽検

writer の CLEAN 標本 (q001 q012 q023 q031 q032 q040 q058 q068 q077 q087) と変更題に含まれない **q004 (p04)、q006 (p04)、q009 (p05)、q014 (p07)、q016 (p08)、q071 q072 (p27)、q088 (p31)** の 8 題について、表示 jp を源と逐字照合した。precrop の有る題と無い題 (q009 / q016 ほか) を両方含む。**見落としは 0 / 8**。q006 イ「運用,管理」の空白欠けは exam 全体の型 ⑨ として除外した。
残存語の走査 (〇・D2／・＊B2・I2＋H3・生産委託するサービス・パックドア・系続・5000 を解説 (key_guard を除く) と訳層で検索): 当たったのは q014 zh の伏字「〇〇」(既知) だけ。

## 4. ゲート (reviewer が再実行)

| ゲート | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29、all invariants hold (A1–A7, B1–B7) |
| `quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `tsc --noEmit` (apps/web) | ✅ exit 0 |
| vitest (apps/web) | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped |
| machdiff vitest (`--root scripts --globals`) | ✅ 42/42 |
| fidfix dry-run の冪等性 | ✅ applied 0 / skipped 283、files to write 0 |

## 5. Notes

- **MINOR-1 q089 の言語化で網掛け要素が 1 つ落ちた (3 層、本 unit で生じた欠落)**。源 p33 / webp では、右の網掛けプロセス (要素3) から上の網掛けデータストアへ矢印が出ている。HEAD の言語化はこれを「その処理 → データストア（網掛け・表示なし）」として持っていた。新しい jp / zh / en は「要素2 → 要素3 / 要素3 →（請求書）→顧客」だけで、この 4 つ目の網掛け要素とその接続が無い。漏洩の論点とは関係なく、正解にも影響しない (図は添付されている)。ただし図と一致しない言語化になっており、追記した note の「構造・接続・網掛けは保持」も事実と違う。**是正案**: 3 層に「要素3 → 要素4（網掛け・表示なし）」/「要素3 → 要素4（带网格底纹·未显示）」/ "Element 3 -> Element 4 (shaded; not shown)" を 1 行足す (要素4 から先へは何もつながっていない)。是正器に入れて再 apply すること。commit 前の処置を推奨する。
- **NIT-1** q096 の raw `stem_jp` (questions / bank) には「累計 _ した」「商 品回転率」「\nー」の残骸が残っている (本 unit は「。 」だけを除去)。表示は stem_jp_clean が優先され、clean は源と一致しているので出荷への影響は無い。既存の問題なので ⑨ でよい。
- **NIT-2** 記録 §12(a) のとおり、by_year の apply 前の退避は失われている。代替として行った bank との 100/100 一致は妥当だと判断した。reviewer の確認でも、両層の q093 は page-37、q092 / q094 は不変だった。

MAJOR なし。MINOR-1 (q089 に 1 行足す) を処置した後に commit してよい。他のデータ修正は不要。
