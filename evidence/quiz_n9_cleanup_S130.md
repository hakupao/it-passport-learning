# S130 ⑨ cleanup (n9-fixer) — page pointer の tracked 記録 + 小口 4 件

- lane: n9-fixer (executor opus、D-152 data lock 保持)。commit / push は lead
- 対象: S130 で ⑨ に登記した (a)〜(e) (session log §84)
- 成果物: `evidence/phase5/stage_06_quiz_fidelity/pagefix_S129_backfill_decisions.json` (tracked 決定記録) / `scripts/quiz-fidfix-S130-n9.mjs` (assert-before-replace、dry-run 既定、`--apply`)
- correct_answer 変更 0。jp raw 3 層 (questions.json / question_bank の stem・choices / by_year の stem・choices) 不変

## 1. (a) S129 page pointer 是正の tracked 決定記録

S129 B11 (`quiz-fidfix-S129-b11.mjs` PAGE_FIX) と B13 (`quiz-fidfix-S129-b13.mjs` PAGE_FIX) は gitignore 層 (question_bank.json / by_year) にだけ書いた。bank を再生成すると巻き戻る。`quiz-pagefix-apply.mjs` の形式の決定 JSON に記録した。

| id | bank (適用前) | 源の実読 (S130 n9) | 判定 |
|---|---|---|---|
| 2010h22a-q062 | page 24 | page-24 上段に問62 の題幹 + ア〜エ。図なし | MOVE_QUESTION 23→24 (既に適用済) |
| 2010h22a-q063 | page 24 | page-24 中段に問63 の題幹 + ア〜エ。図なし | MOVE_QUESTION 23→24 (既に適用済) |
| 2009h21a-q093 | page 37、**figure_page_* 無し** | page-36 = 中問B 前文 + 図 (商品別販売分析ワークシート) のみ。page-37 = 問93 の題幹 + ア〜エ | MOVE_QUESTION 36→37、**figure_page_number 36**、**bbox 是正** (Rule D MINOR-1) |

**想定との違い (q093)**: B13 は page_number だけを 36→37 に動かし、figure_page_* を書いていなかった。q093 の crop `figures/2009h21a-q093.png` はワークシート = page-36 の図 (目視で確認)。D-145 では figure_page_* が無ければ bbox は page_image (= page-37) 相対と読むので、再裁断すると page-37 の空白を切り出してしまう (S115 q097 で起きた回退と同じ型)。このため dry-run は「全件既適用」にならず、q093 の 1 件が適用対象になった。図ページ 36 を D-145 の figure_page_* に書いた。`figure_bbox_rebased: true` は事実と違うので使っていない。

**bbox (Rule D MINOR-1 で是正)**: 第 1 版では「bbox も page-36 実測」と書いたが、これは誤りだった。記録されていた `figure_bbox_pct {0.07, 0.362, 0.905, 0.865}` は page-36 でも既存 crop を再現しない (列記号行 A〜J を切り、下に約 0.15 の空白を足す。reviewer が再現)。既存 crop (1141×782) を page-36 で全探索の画素照合にかけると、原点 (146, 667) で平均絶対差 **0.000** の完全一致になった。pagefix-apply の trunc 式で同じ矩形 (146, 667)-(1287, 1449) を返す `{0.1019, 0.3291, 0.8982, 0.7149}` を決定 JSON に `bbox_check: BAD` + `proposed_bbox_pct` (+ `figure_bbox_pct_current`) として記録し、bank・by_year の 2 層に適用した。この枠で裁断した結果が既存 crop と **画素同一** (raw buffer の比較が一致) なので、再裁断は不要と判断して `--no-recrop` で適用した。crop と webp は不変 (`apps/web/public/quiz-figures/2009h21a-q093.webp` md5 `a4ea4046…` 前後同一)。

- 適用: `node scripts/quiz-pagefix-apply.mjs --no-recrop --decisions evidence/phase5/stage_06_quiz_fidelity/pagefix_S129_backfill_decisions.json` → 第 1 版で source 相 適用 1 / 既適用 2、MINOR-1 の再適用で bbox 相 適用 1
- 再 dry-run: **source 相 適用 0 / 既適用 3、bbox 相 適用 0 / 既適用 1 / 据置 2** (bank 再生成後もここから再適用できる)
- questions.json は逐字不変 (figure_page_* は出荷層に出ない)

### 1b. gitignore 層にだけ当てたポインタ是正で、ほかに残っているもの

ポインタを書く script をすべて走査した (`page_number = ` / `page_image = ` / `PAGE_FIX` / `figure_page_number = ` を grep)。

| 是正 | tracked な記録 | 状態 |
|---|---|---|
| S115 `2009h21h-q097` (42→43、図 42) | `pagefix_S118_decisions.json` SPLIT_FIGURE | 済 |
| S118 SPLIT_FIGURE / KEEP 36 件 | `pagefix_S118_decisions.json` | 済 |
| S125 `2021r03-q051` / `q053` | `pagefix_S125_u6_decisions.json` | 済 |
| S130 pagefix 5 件 | `pagefix_S130_decisions.json` | 済 |
| S129 B11 / B13 3 件 | **本記録** (`pagefix_S129_backfill_decisions.json`) | 本 lane で済 |
| **S115 `2010h22a-q089` (35→36) / `q090` / `q091` / `q092` (36→37)** | `scripts/quiz-pagefix-S115-2010h22a.mjs` (自己 assert 付き、**bank だけ**に書く) のみ。決定 JSON は無い | **⑨ 残す**。4 題とも図を持ち、bbox の基準ページが未検証 (q090 の y1≈0.01 は page-37 実測らしい、q091 は旧形式 `{left,top,right,bottom}`)。図ページの判定が要るので本 lane の範囲外 |
| S115f `2009h21h-q097` 差し戻し (`quiz-fidfix-S115f-ruleA.mjs`) | S118 SPLIT_FIGURE が後に上書き | 済 |

lead の想定 (「S115 は tracked decisions 済」) と違い、S115 2010h22a の 4 件は決定 JSON を持たない。ただし tracked script が自己 assert 付きで残っているので、再生成後に再実行はできる (by_year には書かないため、再実行後に B6 で 2 層の一致を確認すること)。

## 2. (b) 2015h27a-q021 解説の MBO

- 源 p09: 問21「利益の追求だけでなく，社会に対する貢献や地球環境の保護などの社会課題を認識して取り組むという企業活動の基本となる考え方はどれか。」 ア BCP / イ CSR / ウ M&A / エ MBO。key イ を再導出 (CSR の定義そのもの)
- 判断: 選択肢は企業活動・経営戦略の用語群で、MBO は M&A と並んでいる → **Management Buyout**。corpus の先例: M&A と MBO を並べる 2013h25h-q006 (「M&A の手段の一つである MBO」) と 2017h29a-q021 (ア M&A / イ MBO) の解説はどちらもバイアウト。knowledge_tree でも MBO は M&A / TOB と同じ戦略の枝にある (人事の枝にも MBO があり、略語に 2 つの意味がある)。S130 T2 の note もすでに「試験文脈の MBO = マネジメントバイアウト」と書いている
- 是正 (jp / zh / en): エの why_wrong を Management Buyout (経営陣が自社の株式・事業部門を買い取る M&A の手法、資本・所有を移す取引で企業理念ではない → 誤り) に書き換えた。「同じ略語が人事の目標管理も指すが、本問では買収」の 1 文を残した (2014h26a-q022 / 2018h30h-q028 の解説と同じ扱い)。要点 2 の「MBO＝目標による管理」は「経営陣による自社買収」にした
- 経路: `.phase2/expl_jp_` / `expl_tr_` → `quiz-phase2-merge.mjs 2015h27a`。D-143 note を final に後置 (`fidfix-S130-n9`)
- 残存確認: q021 の解説で「目標管理 / Objectives」が残るのは、意図して入れた二義の注記の 1 文だけ

## 3. (c) 2009h21a-q098 の note「key ア 不変」

- 由来: `scripts/quiz-phase2-explfix-S116.mjs:55` の RESOLVES[q098] 文字列 (commit `5c1280e`)
- 同じ script の「key X 不変」を 2009h21a の全 24 題で correct_answer と照合した → **23 題一致、q098 だけ不一致**。転記の誤り
- correct_answer の履歴: answer_keys `98: ウ` / question_bank の全世代 (backup・pre-s03〜pre-s71 の 13 ファイル) が ウ / tracked `questions.json` の全 79 commit で ウ。S116 で key を変えた事実は無い
- 再導出: 源 p40 前文「取引先…の担当者は原則 1 人であるが，取引先によっては部署ごとに 1 人存在することがある」+ 図1 取引先担当者表 (取引先コード / 部署名 / 所在地 / 名前 / 役職 / 電話番号)、p41 問98 → 取引先コード＋部署名 = **ウ**。一致
- 処置: 旧 note は書き換えず、final に訂正 note を後置 (D-143、`fidfix-S130-n9`)。S116 script は不変 (履歴)

## 4. (d) 2016h28h-q096 zh 題幹の引用符

- 適用前の zh 題幹は「成绩」と「%」、zh 選択肢は “%子” / “子%” / “%子%”。題内で字形が割れていた
- 是正: 題幹 2 か所を “成绩” / “%” にした (D-151 zh は “”。源 p44 も “成績” / “%”)。「%」だけを直すと「成绩」との混在が新たにできるので、両方を直した
- `.phase1 tr_` の zh 題幹は ASCII `"成绩"` / `"%"` で sidecar と乖離 → 不触 (出荷層は sidecar)
- 注記: X1 の note (`2016h28h-q096`) は「zh / en の選択肢も題幹の “” に揃えた」としていたが、zh 題幹は 「」 のままだった。本是正で実際に揃った。zh 解説の 「」/『』 は散文の引用で範囲外。corpus 全体の zh 「」→“” (⑨-c) は未解決のまま残す

## 5. (e) 2015h27a-q100 表見出し

- 源 p47 の表見出しは「処理速度（バイト／分）」(全角括弧・全角斜線)。単位表記で、D-162 の式中演算子ではない
- 出荷層は `translations/2015h27a.json` の `stem_jp_clean` だけが表を持つ (raw 3 層の stem_jp は表無し、`.phase1 tr_` の stem_jp_clean にも該当文字列無し)。`| 処理速度(バイト/分) |` → `| 処理速度（バイト／分） |`
- zh「处理速度（字节/分）」/ en は不変。解説散文の「200Mバイト/分」は計算式の中の単位で範囲外
- `quiz-punct-sweep-S130.mjs` には （）／ を戻す規則が無い (、〜 系のみ) ことを確認した

## 6. ゲート

| ゲート | 結果 |
|---|---|
| 適用前: `quiz-phase2-merge.mjs` 2015h27a / 2016h28h / 2009h21a | ✅ `git status data/` clean (drift 0) |
| pagefix backfill `--no-recrop` 適用 → n9 `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs` ×3 | ✅ pagefix 適用 1 / 既適用 2、n9 applied 11 |
| 冪等: n9 dry-run 再実行 | ✅ **applied 0 / skipped 11** |
| 冪等: pagefix backfill dry-run 再実行 | ✅ **適用 0 / 既適用 3** |
| `node scripts/quiz-keys-crosscheck.mjs --require-raw` | ✅ `questions=2900 exams=29 layerB=ran` / all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| `node --check scripts/quiz-fidfix-S130-n9.mjs` | ✅ |
| `pnpm --config.verify-deps-before-run=false -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm … -C apps/web lint` (eslint) | ✅ exit 0 (0 errors、既存 warning 1 = `RetroGlossary.tsx` `tTerm`) |
| `pnpm … -C apps/web test` (vitest) | ✅ 38 passed / 1 skipped (39 files)、563 passed / 2 skipped (565 tests) |
| `pnpm … -C apps/web build` | ✅ `Compiled successfully` |
| `correct_answer` 差分 `git diff -U0 data \| grep -cE '^[+-]\s*"correct_answer"'` | ✅ **0** |
| `questions.json` md5 | ✅ `110697d9…` 前後同一 |
| `answer_keys.json` md5 | ✅ `6802bb0b…` 不変 |
| tracked data diff | explanations 2009h21a / 2015h27a、translations 2015h27a / 2016h28h (計 10 行) |

## 7. 範囲追加 (f)〜(i): 解説監査 pilot の指摘 (`evidence/phase5/stage_06_quiz_phase2/ruleA_result_S130_eaudit_pilot.json`)

同じ lock、同じ script (`quiz-fidfix-S130-n9.mjs` の EXPL_ADD / AP_EXPL / AP_TR / NOTE_APPEND) で是正した。correct_answer は不変。

### 7.1 判定

| 項 | 題 | 指摘 | 照合 (題幹・選択肢) | 処置 |
|---|---|---|---|---|
| (f) | 2011h23tokubetsu-q093 | 誤答肢ウの第 1 の理由が反例 J＝−5 を使う。題幹は「J，K は 0 以上の整数」 | 題幹〔関数の仕様〕で J，K≧0 を確認。J，K≧0 なら和 ≦20 は各値 ≦20 を含意するので、「範囲外を通す」はウの欠陥ではない。本当の欠陥は正当な注文 (J＝15, K＝10、和 25) を L＝−1 で弾くこと。key ア を再導出 (購入条件「それぞれ 20 枚まで」= 0≦J≦20 and 0≦K≦20) | 第 1 の理由を差し替え、割引枝の後段と結論は保持 (jp / zh / en)。note 後置 |
| (g) | 2016h28a-q098 (+ corpus) | zh「防尾随」がアンチパスバックと共連れ (尾随) を混同させる | corpus の jp「アンチパスバック」は 4 題 (2016h28a-q098 / 2022r04-q074 / 2025r07-q077、解説だけ 2021r03-q058)。zh はすべて「防尾随」で、4 題とも同じ題の中で「尾随」= 共連れ。**2022r04-q074 では正解肢ア「防尾随（Anti-passback）」が題幹「为防止…尾随（共連れ）行为」と字面で直結 = 答えの手掛かり** (q098 より重い)。jp「共連れ防止」の訳としての「防尾随」(2022r04-q074 解説イ・要点 2) は正しい訳 | jp アンチパスバックに当たる field だけ「反潜回」に (解説 zh 13 か所 + sidecar 題幹 2・選択肢 2 + .phase1 同期)。q098 だけ直すと corpus の訳語が割れるので 4 題で統一した。note: q098 (題幹の語義) / 2022r04-q074 (**正解肢**の文字列) |
| (h) | 2020r02o-q094 | 誤答肢アの解説が「②が誤り」で終わり、③ を正と読める | ア = ①可用性 ②完全性 ③機密性。正解イ = ①可用性 ②機密性 ③完全性。③ も誤り | ③ も誤りと書き足し、締めを「②と③が誤り」に (jp / zh / en)。note 後置 |
| (i) | 2011h23tokubetsu-q095 | key_guard_valid=false | 再導出: テスト2 J＝15, K＝15 → 条件成立、J＋K＝30≧20 で d＝0.9×60,000＝54,000。テスト4 K＝30＞20 → e＝−1 → **イ** (一致)。false の理由は suspect=true / round1 の stem_corruption_suspected=true / figure_derivable=false が残っていること。前文の欠落は【S114 裁決】で解消済み (final の stem_corruption_suspected は既に false)。suspect は union(round1, final) の仕様 (D-143 §4/§5 anti-masking) なので flag は触らない。付随の指摘: 正解解説が本問に表示されない「図1 の流れ図」(題幹に図1 は無い) を根拠にしている、zh 末尾が「正解」 | 図1 の参照 2 か所を〔処理内容〕に差し替え (jp / zh / en)、zh「是正解」→「是正确答案」。flag は保持。再導出と解消済であることを note に記録 |

範囲外 (⑨ 低、監査の low 指摘で本 lane では触れない): 2011h23tokubetsu-q093 誤答肢イの例 J＝−30 (仕様上ありえない負の入力、もう一方の例 J＝5, K＝100 は妥当) / 2020r02o-q094 誤答肢ウの「逆」(実際は循環のずれ) と ③ への言及なし / 同 エ に「③ は正しい」の一言なし。

### 7.2 置換の件数 (assert 済)

- (g) 解説 zh: 2016h28a-q098 correct・ア・ウ・エ・p0・p1 各 1 / 2022r04-q074 correct 2・p0 1 / 2025r07-q077 ウ・p1 各 1 / 2021r03-q058 p1 1 = 13。sidecar zh: 2016h28a-q098 題幹 2 / 2022r04-q074 ア 1 / 2025r07-q077 ウ 1。.phase1 tr_ も同数
- 残存の「防尾随」: 解説 2022r04-q074 イ・要点 2 (jp「共連れ防止」の訳) と、今回追記した note の中の言及だけ

### 7.3 改写前後 (逐字、Rule A の reviewer 用)

(g) は「防尾随」→「反潜回」の語の置換だけなので、件数は §7.2 に記録した。以下は文を書き換えた field の全文。

#### 2011h23tokubetsu-q093 d:ウ

- **jp before**: 「0≦J＋K≦20」は和だけを縛る条件式で、J と K それぞれの値は制限されない。例えば J＝−5、K＝25 は和が 20 なので Yes となり、負の J や 20 を超える K がそのまま金額計算に使われてしまう。加えて後続の判定との整合も崩れる。この条件を満たして進んだ場合 J＋K≦20 が保証されるため、次の判定 J＋K≧20 が Yes になるのは J＋K＝20 のちょうど一点だけとなり、割引を適用する L＝0.9×(3,000×J＋1,000×K) の枝がほぼ意味を失う。入力チェックとしても不十分で、流れ図の分岐設計としても不自然である。
- **jp after**: 「0≦J＋K≦20」は和だけを縛る条件式で、購入条件「大人と子供それぞれ 20 枚まで」と一致しない。J，K は 0 以上の整数なので和が 20 以下なら各値も 20 以下になるが、逆に条件を満たす正当な注文まで拒んでしまう。例えば J＝15、K＝10 はそれぞれ 20 枚以内で購入できるのに、和が 25 なので No となり L＝−1 が返される。加えて後続の判定との整合も崩れる。この条件を満たして進んだ場合 J＋K≦20 が保証されるため、次の判定 J＋K≧20 が Yes になるのは J＋K＝20 のちょうど一点だけとなり、割引を適用する L＝0.9×(3,000×J＋1,000×K) の枝がほぼ意味を失う。入力チェックとしても不十分で、流れ図の分岐設計としても不自然である。

- **zh before**: 「0≦J＋K≦20」是只约束和的条件表达式，J 和 K 各自的值并不受限制。例如 J＝−5、K＝25 时和为 20，所以为 Yes，于是为负的 J 和超过 20 的 K 会被原样用于金额计算。此外，与后续判断之间的一致性也被破坏。满足这个条件而继续前进时，J＋K≦20 得到保证，因此下一个判断 J＋K≧20 为 Yes 的情形只有 J＋K＝20 这恰好一点，应用折扣的 L＝0.9×(3,000×J＋1,000×K) 分支几乎失去了意义。它作为输入检查并不充分，作为流程图的分支设计也不自然。
- **zh after**: 「0≦J＋K≦20」是只约束和的条件表达式，与「成人票和儿童票各自最多 20 张」的购买条件不一致。由于 J、K 是 0 以上的整数，和在 20 以下时各自的值也在 20 以下，但反过来会把满足条件的正当订单也拒绝掉。例如 J＝15、K＝10 各自都在 20 张以内、本可购买，但和为 25，所以为 No，返回 L＝−1。此外，与后续判断之间的一致性也被破坏。满足这个条件而继续前进时，J＋K≦20 得到保证，因此下一个判断 J＋K≧20 为 Yes 的情形只有 J＋K＝20 这恰好一点，应用折扣的 L＝0.9×(3,000×J＋1,000×K) 分支几乎失去了意义。它作为输入检查并不充分，作为流程图的分支设计也不自然。

- **en before**: “0≦J＋K≦20” is a conditional expression that constrains only the sum, and it does not limit the individual values of J and K. For example, J＝−5 and K＝25 give a sum of 20, so the decision is Yes, and a negative J and a K greater than 20 are used for the amount calculation as they are. In addition, consistency with the later decision breaks down. When the flow proceeds after satisfying this condition, J＋K≦20 is guaranteed, so the next decision J＋K≧20 is Yes only at the single point J＋K＝20, and the branch that applies the discount, L＝0.9×(3,000×J＋1,000×K), almost loses its meaning. It is insufficient as an input check, and it is also unnatural as branch design for the flow diagram.
- **en after**: “0≦J＋K≦20” is a conditional expression that constrains only the sum, which does not match the purchase condition of at most 20 adult tickets and at most 20 child tickets. Because J and K are integers of 0 or more, a sum of 20 or less also keeps each value at 20 or less, but conversely the condition rejects valid orders that meet the purchase condition. For example, J＝15 and K＝10 are each within 20 tickets and could be bought, but their sum is 25, so the decision is No and L＝−1 is returned. In addition, consistency with the later decision breaks down. When the flow proceeds after satisfying this condition, J＋K≦20 is guaranteed, so the next decision J＋K≧20 is Yes only at the single point J＋K＝20, and the branch that applies the discount, L＝0.9×(3,000×J＋1,000×K), almost loses its meaning. It is insufficient as an input check, and it is also unnatural as branch design for the flow diagram.

#### 2020r02o-q094 d:ア

- **jp before**: ①を可用性とする点は正しいが、②を「完全性」としている。②は暗号化しなかったための情報漏えいなので、正確さの問題ではなく、許可されない者に情報が知られた「機密性」の侵害である。②が誤り。
- **jp after**: ①を可用性とする点は正しいが、②を「完全性」としている。②は暗号化しなかったための情報漏えいなので、正確さの問題ではなく、許可されない者に情報が知られた「機密性」の侵害である。さらに③を「機密性」としているが、③は不具合で誤ったデータが記録された=データの正確さが損なわれたので「完全性」の侵害である。②と③が誤り。

- **zh before**: 将①判定为可用性这一点是正确的，但把②判定为「完整性」。②是因未加密而导致的信息泄露，问题不在于准确性，而是信息被未经授权者获知，属于对「机密性」的侵害。②有误。
- **zh after**: 将①判定为可用性这一点是正确的，但把②判定为「完整性」。②是因未加密而导致的信息泄露，问题不在于准确性，而是信息被未经授权者获知，属于对「机密性」的侵害。此外把③判定为「机密性」，但③是因故障记录了错误的数据＝数据的准确性受损，属于对「完整性」的侵害。②和③有误。

- **en before**: Treating ① as availability is correct, but this treats ② as integrity. ② is an information leak caused by the lack of encryption, so it is not a matter of accuracy but a violation of confidentiality, in which information became known to unauthorized persons. ② is wrong.
- **en after**: Treating ① as availability is correct, but this treats ② as integrity. ② is an information leak caused by the lack of encryption, so it is not a matter of accuracy but a violation of confidentiality, in which information became known to unauthorized persons. In addition, this treats ③ as confidentiality, but ③ is incorrect data being recorded because of a malfunction = the accuracy of the data is lost, so it is a violation of integrity. ② and ③ are wrong.

#### 2011h23tokubetsu-q095 correct

- **jp before**: 正解はイ (d:54,000、e:−1)。この関数は、中問B の〔処理内容〕および 図1 の流れ図のとおり、(1) まず購入条件のチェック、(2) 条件を満たす場合だけ合計金額の計算、(3) 合計20枚以上なら1割引、という順で処理する。購入条件は、一度に購入できる枚数が大人・子供それぞれ20枚までであること、すなわち 0≦J≦20 かつ 0≦K≦20 であり、これを満たさなければ金額計算を行わずに L に −1 を代入して終了する。条件を満たす場合は L=3,000×J+1,000×K を求め、さらに J+K≧20 のときだけ1割引、つまり 0.9 を掛ける。まず既知のテスト1 でこの計算モデルを検証すると、J=3、K=2 は両方とも20以下で条件を満たし、J+K=5 で20未満だから割引はなく、L=3,000×3+1,000×2=9,000+2,000=11,000 となり表2の値と一致する。次に d を求める。テスト2 は J=15、K=15 でどちらも20以下なので購入条件は成立し、J+K=30 で20以上なので割引が適用され、L=0.9×(3,000×15+1,000×15)=0.9×(45,000+15,000)=0.9×60,000=54,000。よって d=54,000 である。続いて e を求める。テスト4 は J=10 は20以下だが K=30 が上限の20枚を超えており、大人・子供それぞれ20枚までという購入条件を満たさない。この場合は金額計算の分岐に入らず、流れ図の No 側で L=−1 が代入されて終了するので e=−1 である。d=54,000 かつ e=−1 の組合せはイだけであり、イが正解となる。テスト4 のように条件を満たさない異常系で −1 が返ることを確かめるのも、テストデータの重要な役割である。
- **jp after**: 正解はイ (d:54,000、e:−1)。この関数は、中問B の〔処理内容〕のとおり、(1) まず購入条件のチェック、(2) 条件を満たす場合だけ合計金額の計算、(3) 合計20枚以上なら1割引、という順で処理する。購入条件は、一度に購入できる枚数が大人・子供それぞれ20枚までであること、すなわち 0≦J≦20 かつ 0≦K≦20 であり、これを満たさなければ金額計算を行わずに L に −1 を代入して終了する。条件を満たす場合は L=3,000×J+1,000×K を求め、さらに J+K≧20 のときだけ1割引、つまり 0.9 を掛ける。まず既知のテスト1 でこの計算モデルを検証すると、J=3、K=2 は両方とも20以下で条件を満たし、J+K=5 で20未満だから割引はなく、L=3,000×3+1,000×2=9,000+2,000=11,000 となり表2の値と一致する。次に d を求める。テスト2 は J=15、K=15 でどちらも20以下なので購入条件は成立し、J+K=30 で20以上なので割引が適用され、L=0.9×(3,000×15+1,000×15)=0.9×(45,000+15,000)=0.9×60,000=54,000。よって d=54,000 である。続いて e を求める。テスト4 は J=10 は20以下だが K=30 が上限の20枚を超えており、大人・子供それぞれ20枚までという購入条件を満たさない。この場合は金額計算の分岐に入らず、〔処理内容〕(1) により L=−1 が代入されて終了するので e=−1 である。d=54,000 かつ e=−1 の組合せはイだけであり、イが正解となる。テスト4 のように条件を満たさない異常系で −1 が返ることを確かめるのも、テストデータの重要な役割である。

- **zh before**: 正确答案是イ（d:54,000、e:−1）。该函数按照 B 组大题的〔处理内容〕以及图1的流程图，依次进行：(1) 先检查购买条件；(2) 只有满足条件时才计算合计金额；(3) 合计20张以上则减价一成（打九折）。购买条件是一次能购买的张数为成人票、儿童票各自最多20张，即 0≦J≦20 且 0≦K≦20；不满足时就不进行金额计算，直接给 L 赋 −1 并结束。满足条件时求出 L=3,000×J+1,000×K，然后仅当 J+K≧20 时减价一成，即乘以 0.9。先用已知的测试1 验证这个计算模型：J=3、K=2 都在20以下，满足条件；J+K=5 不足20，所以不打折，L=3,000×3+1,000×2=9,000+2,000=11,000，与表2的值一致。接着求 d。测试2 是 J=15、K=15，两者都在20以下，购买条件成立；J+K=30 在20以上，所以适用折扣，L=0.9×(3,000×15+1,000×15)=0.9×(45,000+15,000)=0.9×60,000=54,000。因此 d=54,000。再求 e。测试4 中 J=10 在20以下，但 K=30 超过了上限的20张，不满足成人票、儿童票各自最多20张的购买条件。这种情况下不会进入金额计算的分支，而是在流程图的 No 一侧给 L 赋 −1 并结束，所以 e=−1。d=54,000 且 e=−1 的组合只有イ，因此イ是正解。像测试4 这样确认不满足条件的异常情况会返回 −1，也是测试数据的重要作用。
- **zh after**: 正确答案是イ（d:54,000、e:−1）。该函数按照 B 组大题的〔处理内容〕，依次进行：(1) 先检查购买条件；(2) 只有满足条件时才计算合计金额；(3) 合计20张以上则减价一成（打九折）。购买条件是一次能购买的张数为成人票、儿童票各自最多20张，即 0≦J≦20 且 0≦K≦20；不满足时就不进行金额计算，直接给 L 赋 −1 并结束。满足条件时求出 L=3,000×J+1,000×K，然后仅当 J+K≧20 时减价一成，即乘以 0.9。先用已知的测试1 验证这个计算模型：J=3、K=2 都在20以下，满足条件；J+K=5 不足20，所以不打折，L=3,000×3+1,000×2=9,000+2,000=11,000，与表2的值一致。接着求 d。测试2 是 J=15、K=15，两者都在20以下，购买条件成立；J+K=30 在20以上，所以适用折扣，L=0.9×(3,000×15+1,000×15)=0.9×(45,000+15,000)=0.9×60,000=54,000。因此 d=54,000。再求 e。测试4 中 J=10 在20以下，但 K=30 超过了上限的20张，不满足成人票、儿童票各自最多20张的购买条件。这种情况下不会进入金额计算的分支，而是按〔处理内容〕(1) 给 L 赋 −1 并结束，所以 e=−1。d=54,000 且 e=−1 的组合只有イ，因此イ是正确答案。像测试4 这样确认不满足条件的异常情况会返回 −1，也是测试数据的重要作用。

- **en before**: The correct answer is イ (d:54,000, e:−1). Following the [Processing details] of question group B and the flowchart in Figure 1, this function works in this order: (1) first check the purchase conditions, (2) calculate the total amount only when the conditions are met, and (3) take 10% off when 20 or more tickets are bought in total. The purchase condition is that at most 20 adult tickets and at most 20 child tickets can be bought at one time, that is, 0≦J≦20 and 0≦K≦20; if this is not satisfied, the function does not calculate any amount but assigns −1 to L and ends. When the condition is satisfied, it computes L=3,000×J+1,000×K, and then takes 10% off, that is, multiplies by 0.9, only when J+K≧20. First, check this calculation model against the known Test 1: J=3 and K=2 are both 20 or less, so the condition is met; J+K=5 is less than 20, so there is no discount, and L=3,000×3+1,000×2=9,000+2,000=11,000, which matches the value in Table 2. Next, find d. In Test 2, J=15 and K=15 are both 20 or less, so the purchase condition holds; J+K=30 is 20 or more, so the discount applies, and L=0.9×(3,000×15+1,000×15)=0.9×(45,000+15,000)=0.9×60,000=54,000. Therefore d=54,000. Then find e. In Test 4, J=10 is 20 or less, but K=30 exceeds the upper limit of 20 tickets, so it does not meet the purchase condition of at most 20 tickets each for adults and children. In this case the flow never enters the amount-calculation branch; it takes the No side of the flowchart, assigns −1 to L, and ends, so e=−1. Only イ has the combination d=54,000 and e=−1, so イ is the correct answer. Confirming that −1 is returned in an abnormal case that fails the conditions, as in Test 4, is also an important role of test data.
- **en after**: The correct answer is イ (d:54,000, e:−1). Following the [Processing details] of question group B, this function works in this order: (1) first check the purchase conditions, (2) calculate the total amount only when the conditions are met, and (3) take 10% off when 20 or more tickets are bought in total. The purchase condition is that at most 20 adult tickets and at most 20 child tickets can be bought at one time, that is, 0≦J≦20 and 0≦K≦20; if this is not satisfied, the function does not calculate any amount but assigns −1 to L and ends. When the condition is satisfied, it computes L=3,000×J+1,000×K, and then takes 10% off, that is, multiplies by 0.9, only when J+K≧20. First, check this calculation model against the known Test 1: J=3 and K=2 are both 20 or less, so the condition is met; J+K=5 is less than 20, so there is no discount, and L=3,000×3+1,000×2=9,000+2,000=11,000, which matches the value in Table 2. Next, find d. In Test 2, J=15 and K=15 are both 20 or less, so the purchase condition holds; J+K=30 is 20 or more, so the discount applies, and L=0.9×(3,000×15+1,000×15)=0.9×(45,000+15,000)=0.9×60,000=54,000. Therefore d=54,000. Then find e. In Test 4, J=10 is 20 or less, but K=30 exceeds the upper limit of 20 tickets, so it does not meet the purchase condition of at most 20 tickets each for adults and children. In this case the flow never enters the amount-calculation branch; under [Processing details] (1) it assigns −1 to L and ends, so e=−1. Only イ has the combination d=54,000 and e=−1, so イ is the correct answer. Confirming that −1 is returned in an abnormal case that fails the conditions, as in Test 4, is also an important role of test data.

### 7.4 ゲート (範囲追加後に再実行)

| ゲート | 結果 |
|---|---|
| 適用前の drift: `quiz-phase2-merge.mjs` 2011h23tokubetsu / 2016h28a / 2020r02o / 2021r03 / 2022r04 / 2025r07 | ✅ 追加の差分 0 |
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs` ×9 exam | ✅ applied 35 (追加分) |
| 冪等: n9 dry-run | ✅ **applied 0 / skipped 46** |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold (A1–A7, B1–B7)、layerB=ran |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| tsc / eslint / vitest / build | ✅ exit 0 / 0 errors (既存 warning 1) / 563 passed・2 skipped / Compiled successfully |
| correct_answer 差分 | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |
| note 後置 | 2011h23tokubetsu-q093 / q095、2016h28a-q098、2020r02o-q094、2022r04-q074 (final のみ、round1 不変。2022r04-q074 は final note が空だったので、merge 出力に round1 ブロックが現れる = 仕様どおり) |

## 8. Rule D (PASS-with-notes) の処置

- **MINOR-1** (2009h21a-q093 の bbox が既存 crop と不一致): §1 のとおり、画素照合で実位置を求め、決定 JSON に bbox_check BAD を記録して bank・by_year に適用した (`--no-recrop`、新しい枠の裁断が既存 crop と画素同一)。§1 の「bbox も page-36 実測」という記述を訂正した。S115 2010h22a-q089〜q092 の bbox 基準ページの問題は §1b で ⑨ に登記済み
- **NIT-1**: 2021r03-q058 と 2025r07-q077 にも D-143 note を 1 行後置した (zh 訳語統一の追跡用、`fidfix-S130-n9`)
- 再ゲート: n9 dry-run applied 0 / skipped 48。pagefix backfill dry-run は source 既適用 3、bbox 既適用 1。crosscheck `--require-raw` は A1–A7 / B1–B7 hold、assert-clean GREEN、chumon `--check` 一致。correct_answer 0。questions.json md5 `110697d9…` / answer_keys md5 `6802bb0b…` 不変。tsc / eslint / vitest / build は下記
- tsc exit 0 / eslint 0 errors (既存 warning 1) / vitest 38 passed・1 skipped (39 files)、563 passed・2 skipped / next build Compiled successfully
