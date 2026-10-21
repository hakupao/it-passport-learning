# S131 efix4h — 解説是正 (efull_5 のうち 2023r05、D-176 / D-177: 1 unit = 1 exam)

- lane: efix (executor opus、D-152 data lock 保持)。commit / push は lead。Rule D は別 type (verifier) で後置
- 入力: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_5.json` の 2023r05: medium 4 題 (q055 / q064 / q082 / q100) と key_guard_invalid 2 題 (q023 medium・q004 low)
- script: `scripts/quiz-fidfix-S131-efix4h.mjs` (efix4d と同じ形)
- correct_answer 変更 0。stem / choices / translations sidecar は不変。key_guard / round1 の値と既存 note は不可触 (D-143)。訂正は final の note に後置した

## 0. translations sidecar の照合

q055 (題幹は jp どおり)、q082 ウ (choice は「b」)、q100 ウ (zh「抽取具有相同值的记录」/ en "extracting records that have the same value"、"product" の語は無い) を確認した。解説の誤りは sidecar に無い → 変更なし (差分 0)。

## 1. 判定

| # | 題 | 指摘 (要約) | 照合 | 判定 / 処置 |
|---|---|---|---|---|
| 1 | 2023r05-q055 エ | 「最初の不足40人日との混同」 | 題幹: 10 名 × 15 日 = 150 人日の計画、最初の 5 日は 8 名。不足は 50 − 40 = 10 人日で、40 人日は消化済みの量。14 名になるのは 150 − 10 = 140 人日を残りとした場合 (140 ÷ 10 = 14)。正解は 110 ÷ 10 = 11 名 = イ | ACCEPT (jp / zh / en) |
| 2 | 2023r05-q064 要点 2 (jp) | 「代入演算子は「+」」 | + は加算演算子で、この擬似言語の代入は「←」。zh / en は「代入」を訳しておらず正しい | ACCEPT (jp だけ) |
| 3 | 2023r05-q082 ウ | 「OSS のソースコード入手が無償なのは正しい」 | OSD・GPL は無償配布を要件にしていない (有償頒布も可)。記述 b が誤りなのは主に「有償の保守サポートを受けなければならない」の部分 | ACCEPT。多くは無償だが無償は要件ではない、に改めた (jp / zh / en) |
| 4 | 2023r05-q100 ウ (en) | "intersection (product)" | 関係代数の product は直積 (Cartesian product) で、共通集合とは別の演算。jp の「共通集合（積）」は日本語の積集合なので正しい | ACCEPT (en だけ)。(product) を削除 |
| 5 | 2023r05-q023 key_guard (medium) | note の「設問は ISO/IEC 19519」は存在しない腐敗の主張だとする指摘 | 19519 は生成時点の stem に実在した: `git log -S 19519 -- data/ip/quiz/questions.json` で、0167626 (Phase 0) の stem_jp が「国際規格 ISO/IEC 19519」。S102 の 4dbac44 が「q023 ISO/IEC 19519→19510 (stem+zh+en)」と是正している。したがって key_guard の検出は当時正しく、note は S102 の是正で**陳腐化**しただけ。監査の「存在しない腐敗」という判断も同じ誤り。現在の stem_jp・stem_jp_clean・sidecar はいずれも 19510 | ACCEPT (note の陳腐化の記録)。陳腐化の訂正 note を final に後置した。stem_corruption_suspected=true と既存 note は union 則 (D-143 §4/§5) で保持。**Rule D (N1) の amend**: 初版の後置 note は「誤検出」としていた。同じ script で、その note を陳腐化の文に置き換えた (2 本目は足していない。冪等) |
| 6 | 2023r05-q004 key_guard (low) | note の「stem_jp / stem_jp_clean とも 306 のまま」は陳腐化 | 表示の stem_jp_clean は「利用料は300万円/年」に是正済み。306 は raw の stem_jp (OCR 原文として保持) にだけ残る。監査者の「stem_corruption_suspected も今は不要」は、raw に腐敗が残るので一部だけ当たる | ACCEPT (note の事実記述の訂正)。flag は union 則で保持 |

集計: 6 題 → **ACCEPT 6 / REJECT 0**。applied 14 = 置換 8 + note 後置 6。

## 2. 改写前後 (逐字、HEAD の explanations と再生成後の比較から機械的に出力)

#### 2023r05-q055 d:エ

- **jp before**: 14名では残り10日間で14×10＝140人日となり、110人日に対して大幅に過剰です。最初の不足40人日との混同など、残作業量の算定を誤った値です。
- **jp after**: 14名では残り10日間で14×10＝140人日となり、110人日に対して大幅に過剰です。全体150人日から、既に消化した40人日ではなく最初の5日間の不足分10人日を引いて、残作業を140人日とした誤り (140÷10日＝14名) です。

- **zh before**: 14 人在剩余 10 天内为 14×10＝140 人日，相对于 110 人日大幅过剩。这是与最初的不足 40 人日相混淆等、对剩余工作量的算定出错而得到的数值。
- **zh after**: 14 人在剩余 10 天内为 14×10＝140 人日，相对于 110 人日大幅过剩。这是从全部 150 人日中减去的不是已完成的 40 人日、而是最初 5 天的不足量 10 人日，把剩余工作量算成 140 人日的错误（140÷10 天＝14 人）。

- **en before**: With 14 people, the remaining 10 days give 14 × 10 = 140 person-days, far exceeding the 110 person-days. This value comes from miscalculating the remaining workload, such as confusing it with the initial shortfall of 40 person-days.
- **en after**: With 14 people, the remaining 10 days give 14 × 10 = 140 person-days, far exceeding the 110 person-days. This value comes from subtracting from the total of 150 person-days not the 40 person-days already completed but the 10 person-day shortfall of the first 5 days, giving a remaining workload of 140 person-days (140 ÷ 10 days = 14 people).


#### 2023r05-q064 p:1

- **jp before**: 総和（加算）は累積変数の初期値 0・代入演算子は「+」、総積（乗算）なら初期値 1・演算子は「×」と区別する。代入「←」と累積加算「← …+…」の違いにも注意。
- **jp after**: 総和（加算）は累積変数の初期値 0・演算子は「+」、総積（乗算）なら初期値 1・演算子は「×」と区別する。代入「←」と累積加算「← …+…」の違いにも注意。

- **zh**: (不変)
- **en**: (不変)

#### 2023r05-q082 d:ウ

- **jp before**: 「b」のみとするが、b は誤り。OSS のソースコード入手が無償なのは正しいが、有償の保守サポートは任意のサービスであって受ける義務はない。「受けなければならない」が不適切なので、b を正解とするこの選択肢は誤り。
- **jp after**: 「b」のみとするが、b は誤り。多くの OSS は無償で入手できるが無償であることは OSS の要件ではなく、また有償の保守サポートは任意のサービスであって受ける義務はない。「受けなければならない」が不適切なので、b を正解とするこの選択肢は誤り。

- **zh before**: 本选项仅选「b」，但 b 错误。OSS 的源代码可免费获取这点正确，但收费的维护支持属于可选服务，并无接受义务。「必须接受」并不恰当，因此把 b 当作正解的本选项错误。
- **zh after**: 本选项仅选「b」，但 b 错误。许多 OSS 可以免费获取，但免费并不是 OSS 的必要条件；而且收费的维护支持属于可选服务，并无接受义务。「必须接受」并不恰当，因此把 b 当作正解的本选项错误。

- **en before**: This picks only “b”, but b is wrong. It is true that obtaining the OSS source code is free of charge, but paid maintenance support is an optional service, not something you are obliged to receive. “Must receive” is inappropriate, so this option, which treats b as correct, is wrong.
- **en after**: This picks only “b”, but b is wrong. Many OSS products can be obtained free of charge, but being free is not a requirement of OSS; moreover, paid maintenance support is an optional service, not something you are obliged to receive. “Must receive” is inappropriate, so this option, which treats b as correct, is wrong.


#### 2023r05-q100 d:ウ

- **jp**: (不変)
- **zh**: (不変)
- **en before**: Although handling two tables resembles a join, ‘extracting records that have the same value’ is closer to a set operation like intersection (product), and does not match the join definition that links rows side by side by matching field values.
- **en after**: Although handling two tables resembles a join, ‘extracting records that have the same value’ is closer to a set operation like intersection, and does not match the join definition that links rows side by side by matching field values.


## 3. ゲート

| ゲート | 結果 |
|---|---|
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs 2023r05` | ✅ applied 14 |
| 変更範囲 | ✅ HEAD との差分を題 id 単位で比べると、explanations は対象の題だけ (§1)、トップレベルは同一。translations は §0 のとおり |
| 冪等: dry-run 再実行 | ✅ applied 0 / skipped 14 |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| correct_answer 差分 | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |
| tsc / eslint / vitest / build | D-177 により efix4k の後にまとめて 1 回 (efix4k の evidence に記録) |

Rule B: 失敗した attempt なし。

## 4. Rule D (verifier type、opus、編集なし) と amend

判定 **PASS-with-notes** (ブロッカー 0)。表示本文 4 題 (q055 / q064 / q082 / q100) は VERIFIED。再計算: q055 は 110 人日 ÷ 10 日 = 11 名 = イ、q004 は X > 1,000 = イ。q004 / q023 は正解キー イ が正しく、flag を保持して note を後置した処置も正しい。dry-run は applied 0、crosscheck は all invariants hold。差分は 6 題だけで、translations / questions の差分 0。
- **N1 (low〜medium、監査記録の正確さ) → amend 済み**: q023 の後置 note にあった「誤検出」は事実と違っていた。19519 は Phase 0 (0167626) の stem_jp に実在し、S102 (4dbac44) で 19510 に是正されている。key_guard の検出は当時正しく、note は陳腐化しただけ (監査の「存在しない腐敗」という判断も同じ誤り)。後置 note を Rule D の提案文そのままに**差し替えた** (2 本目は足していない)。script 冒頭のコメントと §1 #5 も同じ趣旨に直した。amend は applied 1 → build → merge 2023r05、再実行 0 / 15。lead が確認: final note に efix4h の note は 1 本だけで、「誤検出」の語は無い。crosscheck は all invariants hold
- low (任意、未修正): N2 q100 ウ の zh「交集（积）」、N3 q055 エ の zh の文体
