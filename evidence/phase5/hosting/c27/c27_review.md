# C27 独立レビュー (Rule D, S163)

- reviewer: verifier (writer とは別 agent・別 context)
- 対象: `apply_report.json` の全 89 field (jp 30 / zh 29 / en 30, 27 問, patch 95)。Rule A の N = 全件。
- 入力: `c20/round3_jp_errors.json`, `apply_report.json`, `writer_verdicts.md`, `context.md`, 図 `data/ip/exams/figures/2009h21h-q071.png`, `2014h26a-q086-cC.png`, `2014h26a-q086-cD.png`, `data/ip/quiz/translations/{2009h21a,2011h23tokubetsu}.json` (選択肢訳の語の照合)

## 判定: PASS

HIGH 0 / MEDIUM 0 / LOW 6。内訳: flag 対象外の field の残りの誤りが 2 件 (LOW-1, LOW-2)、patch した field の文体・1:1 の細部が 3 件 (LOW-3, LOW-4, LOW-5)、flag した field で patch しなかった言語 (zh) の表現の細部が 1 件 (LOW-6)。どれも本 patch の可否には関係しない。

## 機械的な確認

| 確認 | 結果 |
|---|---|
| 作業ツリーの `data/ip/quiz/explanations/*.json` の 89 field が `apply_report.json` の `after` と完全に一致する | 一致 (不一致 0) |
| HEAD と作業ツリーの JSON を葉単位で比較し、変更された葉の数 | 89 (計画した 89 field 以外の変更なし。key_guard・answer・他 field は不変) |
| zh の after に 「」『』 がある | 0 件 |
| 二重スペース・句読点の重複・括弧や引用符の対応崩れ・en への全角句読点の混入 | 0 件 |
| 各問の全 field (correct / d:* / p:*、3 言語) を flag の誤りを表す語で検索した残り | 下記 LOW-1・LOW-2 (flag 対象外の field) のほかは 0 件 |

## field ごとの確認 (全 27 問)

| id | field | jp の修正は正しいか | zh/en は 1:1 か | 最小限か | 誤りは残っていないか |
|---|---|---|---|---|---|
| 2016h28a-q100 | correct | OK (正解ウ「a, b, d」だけ) | OK | OK | OK |
| 2012h24h-q019 | correct | OK (負け犬は資金の出入りがともに小さい) | OK (几乎不产生资金 / almost no cash) | OK | OK |
| 2013h25h-q032 | correct | OK (性能テスト ≠ 負荷テスト。p:1 が両者を別に挙げていることと整合する) | OK (测试 / test) | OK | OK |
| 2014h26h-q059 | correct | OK (信頼性・可用性・保守性 = RAS) | OK | OK | OK |
| 2018h30h-q047 | correct | OK (活用 = exploit。p:0・p:1 と整合する) | OK | OK | OK (d:ア は LOW-1) |
| 2018h30a-q095 | correct | OK (誤った限定を削除。後の文は主語なしでつながるが自然) | OK | OK | OK |
| 2020r02o-q013 | correct | OK (stem の a は自社サーバへのログイン) | OK | OK | OK (p:0 にも「他人のコンピュータ」はない) |
| 2010h22h-q097 | correct | OK | OK (〔S 公司的状况〕/ [situation of Company S] は stem 訳の見出しと一致) | OK | OK |
| 2009h21a-q094 | correct | OK (引用が選択肢ウの原文と一字一句一致する。読点も補った) | OK (選択肢訳の 利润大 / large profit と一致) | OK | OK (「利益率も高いので」は解説自身の推論で、引用ではない) |
| 2014h26a-q079 | correct, p:1 | OK | OK | OK | OK (p:1 の「アプリケーション層のデータ」は配られないものの説明で、誤りではない) |
| 2015h27a-q098 | correct, d:ア, d:イ | OK (3,240＋4,320＝7,560、ア 4,320 = ブラウン管 1 台、イ 6,480 = 3,240×2、エ 10,800 = 3 台分。いずれも stem の表どおり) | OK (LOW-5 を除く。台式PC主机 / 显像管显示器 / desktop PC main unit / CRT display は stem 訳の料金表の行名と一致) | changed_ratio > 0.5 の d:イ は、推測の文を表で確かめられる算術に置き換えたもの。新しい誤りや推測は入っていない | OK (公式/官方/official/取り込/收录/not included は 3 言語の全解説 field で 0 件。key_guard は範囲外の観察を参照) |
| 2009h21h-q094 | p:0 | OK (縦長の表には縦/横のラベルが合わない。correct の「縦方向 (年代の間)」はこの表でも正しい) | OK | OK | OK |
| 2011h23tokubetsu-q037 | p:1 | OK (「運用中」= ウ、「新たなシステム化」= ア) | OK (選択肢訳の 运行中 / 新的系统化 / in operation / new systemization と一致) | OK | OK |
| 2016h28a-q091 | p:1 | OK (下位から 1,2,4,…,32) | OK | OK | OK |
| 2009h21a-q079 | p:1 | OK | OK | OK | OK |
| 2010h22a-q063 | d:ア | OK (チェックサムは偶発的な破損の検出) | OK | OK | OK (p:1 も「誤り検出」) |
| 2009h21a-q084 | d:ア | OK (外部キーは UNIQUE 制約の列も参照できる。SQL 標準どおり) | OK | OK | OK |
| 2024r06-q083 | d:ア | OK (d:ウ と p:1 の余事象の説明は正しい) | OK | OK | OK |
| 2012h24a-q040 | d:ア | OK | en OK。zh は patch なしでよい (「是否张贴标识」は誤りではない。LOW-6 を参照) | OK | OK |
| 2015h27h-q062 | d:ア | OK (A∩B＝∅ のときだけ成り立つ。d:エ と同じ趣旨) | OK | OK | OK |
| 2009h21h-q071 | d:イ | OK (図を確認: 黒い部分は B∩C のうち A の外側。(B∪C)−A を「広い領域」とするのは正しい) | OK | OK | OK |
| 2009h21a-q046 | d:イ | OK (「正しい数え方からは出ない」は全称の言い過ぎを解消している) | OK (LOW-4 は文体だけ) | changed_ratio は高いが、もとが 2 文の短い field で、意味の変更は全称の限定だけ | OK |
| 2014h26a-q050 | d:イ | OK (マルウェア ⊃ ウイルス・不正アプリ) | OK | OK | OK |
| 2009h21a-q074 | d:ウ | OK (誤り検出・訂正が「発生を防ぐ」という誤りは消えている) | OK | OK | OK |
| 2010h22h-q017 | d:エ | OK | OK | OK | OK (glossary/词汇表 は 0 件) |
| 2021r03-q093 | d:エ | OK (配信するのは RSS フィード側。correct・p:0 の「配信するフォーマット」とも整合する) | OK | OK | OK |
| 2014h26a-q086 | d:エ | OK (図を確認: エ は 0日目 5 →2日目 10 →3日目 17 →4日目 22 →7日目 26 →9日目 約 31.5〜32。最後の段差は約 +6 で、E か G のどちらか 1 件 (費用 6)。両方なら 38 で縦軸の 35 を超える) | OK (E 或 G / E or G … neither) | OK | OK (d:ウ の jp は LOW-2) |

2012h24a-q040 の zh: writer が「zh はもともと正しい」としたことを確認した。zh d:ア は「与服务器机房是否张贴标识这种设施的物理安全对策无关」で、「標識を掲示する」とは書いていない。誤りではないので、patch しなかった判断は妥当。

## 指摘 (すべて LOW、本 patch を止めるものではない)

### LOW-1 2018h30h-q047 d:ア (jp/zh/en, flag 対象外)
予防接種は発生確率を下げる対応なので「軽減」にあたる。「回避（軽減）」は #5 と同じ型の併記。writer が補足で挙げたものと同じ指摘。
- jp: 「脅威を「回避（軽減）」する対応」→「脅威を「軽減」する対応」
- zh: 「属于对威胁的“规避（减轻）”」→「属于对威胁的“减轻”」
- en: 「an 'avoid (mitigate)' response」→「a 'mitigate' response」
- 同じ field の jp「予防接種で発生そのものを防ぐのは」は、軽減とする場合「予防接種で発生の可能性を下げるのは」とするとより整合する (任意)。

### LOW-2 2014h26a-q086 d:ウ jp (flag 対象外)
jp「EやGの費用まで含んだ値」は両方を含むとも読める。zh「E 或 G」・en「E or G」と、今回直した d:エ の「E又はG」は 1 件分の意味になっていて、jp だけが曖昧。ウ の図も最終値は約 32 (26＋6) で、1 件分。
- jp: 「約32とEやGの費用まで含んだ値」→「約32とE又はGの費用まで含んだ値」

### LOW-3 2009h21a-q074 d:ウ jp/zh/en (文の座り)
述語を「対処」に変えたので、並びの先頭にある「通信路の品質」が「対処の役割」の主体になり、少し座りが悪い。誤りではない。直すなら次の 1 案 (任意):
- jp: 「伝送エラーへの対処は通信路の品質やパリティ・CRC…」→「伝送エラーを減らしたり検出・訂正したりするのは通信路の品質やパリティ・CRC…」
- zh/en はこの jp に合わせる (例: en「Dealing with transmission errors is the job of」→「Reducing, detecting and correcting transmission errors is the job of」)。

### LOW-4 2009h21a-q046 d:イ zh/en (文体のみ)
- zh: 「9用正确的数法得不到。」→「用正确的数法得不出9。」
- en: 「9 does not come out of a correct way of counting.」→「No correct way of counting gives 9.」

### LOW-5 2015h27a-q098 d:ア en (1:1 の細部)
jp「ブラウン管ディスプレイ1台分の料金だけで」/ zh「只是显像管显示器1台的费用」に対して、en は「only the fee for the CRT display」で「1台」が落ちている。機器は 1 台だけなので意味は変わらない。
- en: 「only the fee for the CRT display」→「only the fee for one CRT display」(任意)

### LOW-6 2012h24a-q040 d:ア zh (1:1 の細部、任意)
jp は今回「標識を出さない」と言い切っているが、zh は「是否张贴标识」(張るかどうか) のままで、表現が完全には一致しない。誤りではない。合わせるなら次のとおり (correct zh の「不张贴…标识」と同じ言い方):
- zh: 「与服务器机房是否张贴标识这种设施的物理安全对策无关」→「与不在服务器机房张贴标识这种设施的物理安全对策无关」

## 範囲外の観察
- 2015h27a-q098 の `key_guard` は古いまま: `suspect: true`, `figure_derivable: false`, `derived_answer: "unsure"`, `note_jp`「料金表と…一覧が stem_jp/stem_jp_clean に埋め込まれておらず…」。今回の解説の修正と同じ前提の誤りがメタデータに残っている。解説 field ではないので本 patch の範囲外だが、suspect の表示や集計に使われているなら、表から独立に導出 (ウ 7,560 で key と一致) して更新するのがよい。C27 の後続として main session が判断すること。
- 作業ツリーでは `evidence/phase5/stage_07_ui/baseline.jsonl` も変更されている (C27 の apply_report には含まれない)。C27 と一緒に commit するかは main session が判断すること。
