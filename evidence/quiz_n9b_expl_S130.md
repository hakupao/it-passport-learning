# S130 n9b — 解説是正 (opus targeted audit の指摘)

- lane: n9-fixer (executor opus、D-152 data lock 保持)。commit / push は lead
- 入力: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S130_etgt.json` (opus targeted audit、200 題、accurate 197)
- script: `scripts/quiz-fidfix-S130-n9b.mjs` (assert-before-replace、dry-run 既定、`--apply`)
- correct_answer 変更 0。jp raw 3 層・translations sidecar は不変 (変更は `.phase2` の expl_jp_ / expl_tr_ / generate_result final note → merge で再生成した `explanations/*.json` だけ)

## 1. 判定

| # | 題 | 指摘 | 照合 | 処置 |
|---|---|---|---|---|
| (1) | 2009h21a-q096 | 誤答肢イ・ウ・エの zh / en が商品を 丁/丙/甲/癸・D/C/A/J と呼ぶ。表・題幹・正解解説は 商品あ〜こ / Product あ〜こ | S130 T1 で中問B の表を jp kana ラベル (zh 商品あ〜こ / en Product あ〜こ) に統一済み。対応は え→丁/D、う→丙/C、あ→甲/A、こ→癸/J (jp の誤答解説の え・う・あ・こ と一致)。中問B (q093〜q096) の解説 jp / zh / en を走査し、十干・A〜J の**商品**ラベルが残るのは q096 だけ (q093 / q095 の A〜J は表の列記号で正) | イ・ウ・エの zh / en を 商品え・う・あ・こ / Product え・う・あ・こ に (12 置換)。script の事後 assert で q096 解説の十干の残存 0。key ア (累計 70% 以内 え・う・あ のうち回転率 10 回以下は え だけ) を再導出 |
| (2) | 2014h26h-q096 | 正解の根拠を「申請前の修正はシステム外の行為」としていて、題幹 (1)「申請前に稟議を一時保存できる」と矛盾する | 題幹に「申請前の入力情報は，履歴としては保存しない」と明記がある。これが ウ の決定的な根拠。履歴は「各画面の実行ボタンで処理を実行し，入力項目と日時を履歴として保存」。ア (日時)・イ (申請と承認の日時の差)・エ (差戻しの件数) は履歴から求まる | 正解解説と要点 1 (jp / zh / en) を、題幹の仕様文を引く形に書き直した。key_guard note は後置だけ (上記の導出も同じ理由付けだったことを明記) |
| (3) | 2015h27h-q096 | 誤答肢ウの「変動費率 0.05 を先月の利益 1,650千円 に掛ける」経路は成り立たない | 1,650 × 0.05 = 82.5、82.5 − 150 = −67.5 で +200 にならない。二重控除 500 − 150 − 150 = 200 は成り立つ。key エ (+500 − 150 = +350) を再導出 | 1,650 の経路を削り、二重控除の経路を式つきで残した (jp / zh / en)。後半 (正しい計算) は不変 |
| (4) | 2009h21a-q091 | key_guard_valid=false | 現在の final は matches_key=true / suspect=false だが、round1 の matches_key=false により union 則で suspect が残る。note 冒頭「stored correct_answer が『イ』」は S116 の key 是正 (イ→ウ) より前の記述。再導出: 100 の 70% = 70 を引当て在庫 30 → 優先 10 で在庫 20 → 20 × 70% = 14 = **ウ** 一致 | flag・旧 note は不変、解消済みの note を後置 |
| (4) | 2010h22h-q097 | 同上 | round1 の figure_derivable=false / stem_corruption_suspected=true は前文欠落時の判定。【S114 裁決】で前文埋め込み済み。再導出: (1) 拠点が少ない = 内部・不利 b、(2) T 社撤退 = 外部・有利 c = **ア** 一致 | 同上 |
| (4) | 2010h22h-q100 | 同上 | 同上。再導出: 12% + 10% = 22% で Q 社 25% に次ぐ 2 位 → 自社の強み (商品企画力) で攻撃 = **エ** 一致 | 同上 |
| (4) | 2011h23tokubetsu-q096 | 同上 (+ note 内の page-35 / page-38 の食い違い) | 前文は【S114 裁決】と S129 B8 で解消済み。page-35 は中問B 前文の頁、page-38 は本問の頁で、両方とも正しい。再導出: 10 × 4,000 + 20 × 1,500 = 70,000、J + K = 30 ≧ 20 で × 0.9 = 63,000 = **ウ** 一致 | 同上 (頁の対応も note に明記) |
| (4) | 2011h23tokubetsu-q098 | 同上 (+ note の「has_figure=false」が現データと食い違う) | 前文 (〔作成に関する主な指示〕(3) 200k バイト以下) は【S114 裁決】で埋め込み済み。has_figure=false は当時の状態で、今は中問C の共有図が付くが計算には関係しない。再導出: 2 × 3 インチ × 100dpi = 200 × 300 画素 × 3 バイト = 180,000 ≦ 200k、300dpi = 1,620,000 で超過 = **イ** 一致 | 同上 |

flag (suspect / round1) と既存 note は D-143 §4/§5 (union 則・純粋後置) に従い一切書き換えていない。

範囲外 (監査の low 指摘、⑨ 低):
- 2014h26h-q096 ア・要点 2 の「実行者」は題幹の「入力項目と日時」を超える表現
- 2015h27h-q096 アの「500千円を取り違えるか符号を逆に」は −200 の経路が具体的でない
- 2009h21a-q091 アの誤答経路の推測
- 2010h22h-q097 zh「中问 C」
- 2010h22h-q100 zh / en「应对 / respond to」(源は「適応」)
- 2011h23tokubetsu-q098 zh / en の「E 先生 / Mr. E」(性別付加)

## 2. 改写前後 (逐字、Rule A の reviewer 用)

#### 2009h21a-q096 d:イ

- **zh before**: 会得到2个品目，是把抽取条件误读成「商品周转率在 10 次**以上**」的情况。落在累计70%以内的是丁（9.2次）、丙（12.0次）、甲（14.4次）这3个品目，其中10次以上的是丙和甲共2个。而题目的条件是「10 次以下」，所以符合的只有丁这1个品目。
- **zh after**: 会得到2个品目，是把抽取条件误读成「商品周转率在 10 次**以上**」的情况。落在累计70%以内的是商品え（9.2次）、商品う（12.0次）、商品あ（14.4次）这3个品目，其中10次以上的是商品う和商品あ共2个。而题目的条件是「10 次以下」，所以符合的只有商品え这1个品目。

- **en before**: Two items result when the extraction condition is misread as a turnover of 10 times or **more**. The three items within the 70% cumulative ratio are D (9.2), C (12.0) and A (14.4), and two of them, C and A, have a turnover of 10 or more. The condition in the question is 10 times or less, so only D qualifies, giving one item.
- **en after**: Two items result when the extraction condition is misread as a turnover of 10 times or **more**. The three items within the 70% cumulative ratio are Product え (9.2), Product う (12.0) and Product あ (14.4), and two of them, Product う and Product あ, have a turnover of 10 or more. The condition in the question is 10 times or less, so only Product え qualifies, giving one item.

#### 2009h21a-q096 d:ウ

- **zh before**: 3个品目是只用「累计70%以内」这一个条件筛选出的丁、丙、甲的个数。这是忘记再叠加「周转率10次以下」这第二个条件的错误，丙（12.0次）和甲（14.4次）应被排除。
- **zh after**: 3个品目是只用「累计70%以内」这一个条件筛选出的商品え、商品う、商品あ的个数。这是忘记再叠加「周转率10次以下」这第二个条件的错误，商品う（12.0次）和商品あ（14.4次）应被排除。

- **en before**: Three items is the count of D, C, and A, obtained by filtering with only the condition of a cumulative ratio within 70%. It is the mistake of forgetting to also apply the second condition of a turnover ratio of 10 times or less; C (12.0 times) and A (14.4 times) are excluded.
- **en after**: Three items is the count of Product え, Product う, and Product あ, obtained by filtering with only the condition of a cumulative ratio within 70%. It is the mistake of forgetting to also apply the second condition of a turnover ratio of 10 times or less; Product う (12.0 times) and Product あ (14.4 times) are excluded.

#### 2009h21a-q096 d:エ

- **zh before**: 4个品目是把降序排列后的前4件（丁、丙、甲、癸）直接数出来的个数。加入癸后累计变为76.9%，超过70%，而且其周转率为14.0次，也不满足10次以下的条件，因此是错误的。
- **zh after**: 4个品目是把降序排列后的前4件（商品え、商品う、商品あ、商品こ）直接数出来的个数。加入商品こ后累计变为76.9%，超过70%，而且其周转率为14.0次，也不满足10次以下的条件，因此是错误的。

- **en before**: Four items is the count obtained by simply taking the top four after sorting in descending order (D, C, A, and J). Including J makes the cumulative ratio 76.9%, which exceeds 70%, and its turnover ratio of 14.0 times does not satisfy the 10-times-or-less condition either, so this is wrong.
- **en after**: Four items is the count obtained by simply taking the top four after sorting in descending order (Product え, Product う, Product あ, and Product こ). Including Product こ makes the cumulative ratio 76.9%, which exceeds 70%, and its turnover ratio of 14.0 times does not satisfy the 10-times-or-less condition either, so this is wrong.

#### 2014h26h-q096 correct

- **jp before**: 正解は ウ「申請前の修正回数」。稟議システム (ワークフローシステム) が履歴として残すのは、あくまで「システム上で実行された操作」である。申請が行われて初めてその案件がシステムに載り、以後の同意・差戻し・承認といった操作が、実行者と日時つきのログとして蓄積されていく。ところが「申請前の修正」は、起案者が申請ボタンを押す前に手元で文面を書き直しているだけで、システムに対する操作としては何も発生していない。したがって何回書き直したかという情報はシステムのどこにも渡っておらず、履歴からは確認できない。
- **jp after**: 正解は ウ「申請前の修正回数」。題幹の仕様では、稟議システムは申請・同意・差戻し・承認の各画面の実行ボタンが押されたときに処理を実行し、入力項目と日時を履歴として保存する。そのうえで「申請前の入力情報は，履歴としては保存しない」と明記されている。申請前の入力は (1) のとおり一時保存もできるシステム上の操作だが、仕様で履歴の対象から外されているので、申請前に何回修正したかは履歴に残らず、確認できない。これに対し、各操作の日時 (ア)、申請から承認までに掛かった時間 (イ = 申請と承認の日時の差)、差戻しの回数 (エ = 差戻しの履歴の件数) は、保存された履歴から求められる。

- **zh before**: 正确答案是 ウ「申请前的修改次数」。内部审批（稟議）系统（工作流系统）作为历史记录保留下来的，始终只是「在系统上执行过的操作」。只有在提出申请之后，该事项才会进入系统，此后的同意、退回、批准等操作才会带着执行人和日期时间，作为日志逐条积累起来。而「申请前的修改」只是起草人在按下申请按钮之前，在自己手边改写文稿而已，对系统而言并没有发生任何操作。因此改写了多少次这一信息根本没有传到系统的任何地方，也就无法从历史记录中确认。
- **zh after**: 正确答案是 ウ「申请前的修改次数」。按题干的规格，内部审批（稟議）系统在申请、同意、退回、批准各界面的执行按钮被按下时执行处理，并把输入项目和日期时间作为历史记录保存。题干同时明确写着「申请前的输入信息不作为历史记录保存」。申请前的输入如 (1) 所述可以暂存，是在系统上进行的操作，但按规格不属于历史记录的对象，因此申请前修改了多少次不会留在历史记录中，无法确认。与此相对，各操作的日期时间（ア）、从申请到批准所花的时间（イ＝申请与批准的日期时间之差）、退回的次数（エ＝退回历史记录的条数）都可以从保存的历史记录中求得。

- **en before**: The correct answer is ウ, the number of revisions made before the application. What a ringi system (an internal approval-request system, that is, a workflow system) keeps as history is strictly the operations that were actually performed on the system. Only after an application is submitted does the case enter the system, and from that point on operations such as agreement, return, and approval accumulate as log entries that carry the person who performed them and a date and time. A revision made before the application, however, is only the drafter rewriting the text at hand before pressing the application button, so nothing occurs as an operation on the system. Therefore the information on how many times it was rewritten never reaches the system anywhere, and it cannot be confirmed from the history.
- **en after**: The correct answer is ウ, the number of revisions made before the application. Under the specification in the stem, the ringi system (an internal approval-request system) executes processing when the execute button on the application, agreement, return, or approval screen is pressed, and saves the input items and the date and time as history. The stem also states explicitly that information entered before the application is not saved as history. Input before the application is an operation on the system, since a ringi can even be saved temporarily as in (1), but the specification excludes it from the history, so how many times it was revised before the application is not recorded and cannot be confirmed. In contrast, the date and time of each operation (ア), the time taken from application to approval (イ, the difference between the application and approval times), and the number of returns (エ, the count of return entries in the history) can all be obtained from the saved history.

#### 2014h26h-q096 p:0

- **jp before**: 稟議システム (ワークフローシステム) の履歴に残るのは「システム上で実行された操作」だけ。申請前の下書き・書き直しのようにシステム外で行われた行為は記録対象外である。
- **jp after**: 稟議システムの履歴は、仕様どおり申請・同意・差戻し・承認の実行時の入力項目と日時。「申請前の入力情報は，履歴としては保存しない」ので、一時保存はできても申請前の修正は履歴に残らない。

- **zh before**: 内部审批（稟議）系统（工作流系统）的历史记录中留下的，只有「在系统上执行过的操作」。像申请前的草稿、改写这样在系统之外进行的行为，不属于记录对象。
- **zh after**: 按规格，内部审批（稟議）系统的历史记录是申请、同意、退回、批准执行时的输入项目和日期时间。由于「申请前的输入信息不作为历史记录保存」，即使可以暂存，申请前的修改也不会留在历史记录中。

- **en before**: What remains in the history of a ringi system (a workflow system) is only the operations performed on the system. Acts carried out outside the system, such as drafting or rewriting before the application, are not subject to recording.
- **en after**: Per the specification, the history of the ringi system consists of the input items and the date and time at each execution of application, agreement, return, and approval. Because information entered before the application is not saved as history, revisions made before the application are not recorded even though a temporary save is possible.

#### 2015h27h-q096 d:ウ

- **jp before**: 「200千円増加する」は、変動費率 0.05 の効果を 10,000千円 ではなく先月の利益 1,650千円 など別の基準に掛けたり、150千円 を二重に差し引いたりした場合に出る誤答です。変動費率は売上高に掛けるものなので、効果額は 10,000千円 × 0.05 = 500千円 であり、そこから 150千円 を 1 回だけ引いて +350千円 となります。
- **jp after**: 「200千円増加する」は、150千円 を二重に差し引いた (500千円 − 150千円 − 150千円 = 200千円) 場合に出る誤答です。変動費率は売上高に掛けるものなので、効果額は 10,000千円 × 0.05 = 500千円 であり、そこから 150千円 を 1 回だけ引いて +350千円 となります。

- **zh before**: 「增加200千日元」是把变动成本率0.05乘到了别的基数上（例如上个月的利润1,650千日元）而不是10,000千日元，或者把150千日元重复扣了两次时出现的错误答案。变动成本率要乘以销售额，所以它的影响额是 10,000千日元 × 0.05 = 500千日元，再从中只减去一次150千日元，得到 +350千日元。
- **zh after**: 「增加200千日元」是把150千日元重复扣了两次（500千日元 − 150千日元 − 150千日元 = 200千日元）时出现的错误答案。变动成本率要乘以销售额，所以它的影响额是 10,000千日元 × 0.05 = 500千日元，再从中只减去一次150千日元，得到 +350千日元。

- **en before**: “Increases by 200 thousand yen” appears when the 0.05 change in the variable cost ratio is applied to some other base (such as last month's profit of 1,650 thousand yen) instead of 10,000 thousand yen, or when the 150 thousand yen is subtracted twice. The variable cost ratio is applied to sales, so its effect is 10,000 thousand yen × 0.05 = 500 thousand yen, and subtracting 150 thousand yen just once gives +350 thousand yen.
- **en after**: “Increases by 200 thousand yen” appears when the 150 thousand yen is subtracted twice (500 − 150 − 150 = 200 thousand yen). The variable cost ratio is applied to sales, so its effect is 10,000 thousand yen × 0.05 = 500 thousand yen, and subtracting 150 thousand yen just once gives +350 thousand yen.

## 3. ゲート

| ゲート | 結果 |
|---|---|
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs` ×5 (2009h21a 2010h22h 2011h23tokubetsu 2014h26h 2015h27h) | ✅ applied 29 |
| 変更範囲 | ✅ HEAD との差分を explanations の題 id 単位で比較すると、変わったのは対象 8 題だけ (2009h21a q091 / q096、2010h22h q097 / q100、2011h23tokubetsu q096 / q098、2014h26h q096、2015h27h q096)。トップレベルは同一 = merge の drift 0 |
| 冪等: n9b dry-run 再実行 | ✅ **applied 0 / skipped 29**。n9 も applied 0 / skipped 48 |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold (A1–A7, B1–B7)、layerB=ran |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| `node --check scripts/quiz-fidfix-S130-n9b.mjs` | ✅ |
| tsc / eslint / vitest / build | ✅ exit 0 / 0 errors (既存 warning 1) / 38 passed・1 skipped (39 files)、563 passed・2 skipped / Compiled successfully |
| correct_answer 差分 | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |

Rule B 記録: 1 回目の merge ループは zsh で `$E` が単語分割されず、5 exam の merge が実行されていなかった (crosscheck B4 が「再 merge 未実施?」で検出)。exam を明示して再実行し解消した。データの誤りではなく手順上の取りこぼし。適用前の drift 確認も同じ理由で空振りしていたので、上の「変更範囲」の id 単位比較で drift 0 を確認した。
