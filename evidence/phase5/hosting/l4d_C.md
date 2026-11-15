# L4-d round C (quiz) — ・(U+30FB) → 「•」(行頭の箇条) / 「、」(並列) (D-230)

> 施工 script: `scripts/l4d-quiz-apply.ts` (plan → `--apply`)。全欄の before/after: `l4d_quiz_apply.json`。fidelity baseline の取り直し照合: `l4d_fidelity_refresh.json`。

## 範囲と規則
- 対象: 訳 sidecar `data/ip/quiz/translations/*.json` の stem / choices (zh・en) と解説 sidecar `data/ip/quiz/explanations/*.json` の correct / distractors / points (zh・en)。ja (IPA 原文) と key_guard は対象外。
- 行頭の ・ (改行・`<br>`・表の `|`・全角空白の後、または「〔条件〕 」の直後) → 「•」(zh・en)。
- zh の文中 ・ → 「、」。片仮名を 1 字ずつ並べた列 (2011h23a-q073「ア、ク、セ、ス…」) と選択肢記号の並び (「ア、ウ、エ」) も並列として同じ。
- EXACT (読んで決めた 15 件): 外側が既に「、」の列の中の対 → 「/」(2014h26h q085〜q088「预定销毁/退还日期」、2010h22a-q010「ASP/SaaS 型」、2012h24h-q090「听课费/教材费/开课日」、2016h28a-q082「(数学35/英语85)」— 同文の「(45/30)」と揃える)。外側を「，」にする (2015h27a-q097「ア、イ 为3个词，ウ、エ 为4个词」、2016h28a-q082「B3、C3，D8 引用 B8、C8」)。ラベルの区切り → 「：」(2010h22h-q061「（Why：作为组织的宣告）」等 3)。2026r08-q032「扩大规模并抢占份额」。en: 2010h22a-q080「×, ○, ○」、2013h25a-q003「Price-Earnings」。
- 維持: 片仮名 1 字としての「ー」を論じる箇所 (2011h23a-q073 zh 3・en 3)。

## 結果
- 152 欄 (訳 39・解説 113)、行頭 156・並列 242・EXACT 15。訳 sidecar 19 ファイル、解説は 26 試験回を `quiz-phase2-merge.mjs` で再生成。
- 不変量 (script が強制): EXACT の窓を除き、before と after は同じ長さで違う字は ・ → 、/ • だけ。
- 書込み前: 26 回すべてで merge が committed sidecar を byte 一致で再現。書込み後: 再生成した sidecar = 施工前 + 計画欄 (他の変化 0)。`.phase2/expl_tr_*` は sidecar と一致を確かめてから変更。
- `.phase1/tr_*` (訳の過去の層、sidecar とずれ得る): 13 欄は同じ文があり修正、26 欄はずれていて触れない (L4 第 2 回と同じ「あれば直す」)。
- fidelity baseline (`evidence/phase5/stage_07_ui/baseline.jsonl`) を `CAPTURE_BASELINE=1` で取り直し、旧新 8,700 行で変化 152 欄 = 計画 152 欄 (行ごとの件数まで一致、多 0・少 0、ja の行 0)。
- 許可リスト: 2011h23a-q073 の片仮名の列が「・」で 1 続きだった当たりが 1 字ずつに分かれた (同じ question-data 判断) → `--write --accept-new`、新 25・削除 8 (全て同題)。gate PASS。
- 施工後の punct-only: 437 → 64 (quiz は「ー」6 だけ、残りは textbook の維持分)。

## Rule D (verifier opus、`l4d_C_review.md`) と対応
- 機構・完全性・baseline・gate・試験は全て PASS (sidecar の変化 152 葉 = 計画、ja・key_guard 不変、.phase2 = sidecar 960 値、.phase1 13 / 26 の報告どおり)。Rule A N = 30 (EXACT 13 欄 + seed 20261115 の層別 17) で 29 OK・1 MEDIUM。
- MEDIUM-1 (2013h25a-q003 p:1 zh「Price、Earnings」は PER 1 指標の英名、括弧内は「 / 」区切り → 2 項目に読める) → **修正**「Price-Earnings」(en と同じ)。
- LOW-1 (2011h23tokubetsu-q067 d:イ「AND、OR、NOT 等逻辑运算」が外側の 、 の列の中) → 「AND/OR/NOT」。LOW-2 (2010h22a-q010 p:1「ASP、SaaS 形态」と同題 correct「ASP/SaaS 型」が不揃い) → 「（ASP/SaaS 形态）」。
- 施工: `scripts/l4d-quiz-fix2.ts` (`l4d-quiz-apply.ts` は ・ が残っていないので再実行できない — LOW-3) — .phase2 を直接、3 回を re-merge、各 sidecar が施工前 + 対象 1 欄だけであることを検査。記録 `l4d_quiz_fix2.json`。baseline を再取得し、直前の取得から変わった行は 3 行 (各題の zh) だけ。
- EXACT は実質 15 + 追補 3。LOW-3 (apply 途中失敗の rollback なし・再実行不可・indent 判定) は記録のみ。
- 審査中に審査側が `lang-leak-scan.ts` を report モードで流して `evidence/phase5/hosting/L5_scan.{json,md}` (未追跡) ができた。commit には含めない (evidence 下の削除はユーザー確認事項)。
- 再審 (同 verifier) = **PASS** (sidecar vs HEAD 152 葉 = 計画 (3 欄は新値)、.phase2 = sidecar、baseline 152 / 118 / ja 0、gate PASS)。**最終値 = `l4d_quiz_apply.json` + `l4d_quiz_fix2.json`** (後者の 3 欄が前者の after を上書き)。
- 追補 3 (advisor の描画確認): 訳 39 欄を `StemBlocks` / `ChoiceBody` で施工前後とも描画し `fieldText` の `#sig` (pre/table/tr/th/td/img/br/ul/li の数) が全欄一致、本文の差は ・ → •/、 と EXACT の「/」4 欄だけ。描画経路 (QuizRichText・lib/quiz) に ・ を特別扱いする処理なし。en では U+2022 の後に空白がなく「•The results」になる → `scripts/l4d-quiz-fix3.ts` で en の行頭 • の後に空白 1 つ (3 欄 12 か所、zh は CJK として空白なし)、baseline 再取得で直前から 3 行 (en) だけ変化。記録 `l4d_quiz_fix3.json`。**最終値 = apply + fix2 + fix3**。
- attempt 1 の業務 FAIL は `failures/phase5/hosting/step_L4d_C_attempt_1_review_fail.md` (Rule B)。
- AI 先生: 回答前の「停止」が `NoOutputGeneratedError` (→ 接続できません) を出さないことを e2e に追加 (`sensei.spec.ts`「stop before the reply arrives」、緑)。
