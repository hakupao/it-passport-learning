# 项目当前状态 / Project Live State

> **本文件 = "当前累计状态"的真相源**。Session 日志是历史档案（append-only）；本文件是当下事实快照。两者关系由 **D-028** 锁定。
>
> **更新规则**: 每场 session 结束前 Claude 必须 sync 到本文件（per **D-027** 第 5 条）。

| 字段 | 值 |
|---|---|
| 最后更新 | **2026-06-19 Session 97 — 図題 答案KEY 体検 (Phase 2 前ゲート) 完了**。ユーザー路由「Phase 2 之前先做图题答案键体检…抽样~40…估算坏键率;干净就上 Phase 2,有问题就全量 sweep;参考 S96 q002」。母集団 = **247** (図題で `choices_resourced_s7x` OR `figure_repaired`、`question_bank.json` で精確核対 = 247/467)。D-019 問答 2 問 (分層~40 / strict 坏键定義=correct_answer が図と矛盾する場合のみ) ユーザー承認。**分層 N=40 (確定的 `scripts/audit-figkey-manifest.mjs`、severity 超採+type 比例) + 校正4 (毒入1+特異度対照2+判定1)** を 1 WF (`wf_d0413500-e93`、64 agent/2.45M tok/~10分、`scripts/audit-figkey.workflow.mjs`) で vision 審計 (**写審分離 Rule D**: 審計 `general-purpose` ≠ 検証 `oh-my-claudecode:critic` ≠ 裁決 主context、各 agent が crop+権威全頁を Read し図から先に独立導出)。**strict 坏键率 = 0/40** (KEY_OK 38 [verified13+single25]/CONFIRMED_SWAP_ONLY 2/**BAD_KEY 0**/DISPUTED 0/全 high conf、全40 図導出可)。Wilson 95% CI [0%, 8.76%]、247 投影 点0/上限≤~22。**器具校正 OK (0/40 が盲点でない事を実証)**: 毒 `POISON-2009h21a-q013` CONFIRMED_BAD_KEY (審計+2検証が独立に ウ=300 導出・植込 ア=160 を限界利益distractorと特定=感度実証)・q002 KEY_OK_VERIFIED (S96 結論と独立一致)・**q052 裁決 CLEAN** (審計が「頁=ウ0.18」偽陽性 SWAP → 主context **5×実読で ウ0.10 確認**、stored 0.10 正・S94 結論維持。**偽陽性 BAD_KEY フラグ=0**)。**非キー選択肢汚染は別件 (坏键でない、strict rule で sweep 非対象、主context 自読で確認)**: q096 (`choices_jp[イ]` が別の偶然真な文に変異+stem表garble)・q078 (`choices_jp[ア]` 1↔図2)・q077対照 (ア/イ 説明文swap)、**key は全て正**、~5% (247投影≈12、CI[3,41])。**決定: keys clean → Phase 2 GO 推奨** (key 再導出ガードを Phase 2 に内蔵し残差≤22 を追加vision無しでカバー、cf. S89 q095「Phase 2 で自然再検証」)。**bank/questions.json/コード 不変・書込 0**。証拠 `evidence/phase5/stage_06_quiz_figkey_audit/` (PLAN/manifest/audit_results/rule_a_audit)。**ユーザー路由待ち: (a) Phase 2 GO / (b) 抽様拡張で上限を絞る / (c) 247 全 sweep。推奨=(a)**。<br><br>**(Session 96)** Quiz Phase 1 バッチ S96 (最終4回 `2010h22a`/`2010h22h`/`2009h21a`/`2009h21h`) 完了 → Phase 1 翻訳 29/29 完了**。ユーザー路由「Quiz Phase 1 续批」。**400/400 三語**を統合 1 WF (`wf_fc197c18-8ec`) で実行。**途中 weekly limit 直撃** (translator 400/400 はディスク確定、reviewer 305 が weekly limit で null) → 同 session 内で滚动窗口リセット後 **`resumeFromRunId` で再開し 305 review のみ再走** (400 訳+95 review は cached、854 agent/18.1M tok)。**Rule D in-pipeline 400/400 = PASS 396/CONCERNS 3/FAIL 1/null 0** (repair rounds>1 = 27、23→PASS)。**Rule A (独立 critic N=52、48 層化+強制4): accurate 50/52、none30/low18/medium1/high3**。**applied_fix 3 (全 2010h22h、独立 critic 再検証 ACCEPT、正解全不変)**: ① **q092** (high): stem_jp_clean が figure 注記「同じ名字の担当はいない」(正解イの根拠) を破壊 → 主 context が page-40 実読し復元+作業3詳細復元 (jp/zh/en)。② **q077** (medium): en ア/イ の自己矛盾的幾何補足を簡潔化 (zh 元から清)。③ **q002** (high、**REGRESSION→REVERT**): Rule A critic#1 が corrupted corpus 基準で「イ/ウ swap」と指摘→fixer が翻訳を swap (figure から AWAY) = 誤 fix → critic#2 が figure 指摘 → 主 context が **page-04 実読** (印刷版 イ=low/high・ウ=both-high、graph A社+20%<B社+100% growth・2008 margin 40%>36% → イ) → 翻訳 REVERT + 上流 `choices_jp` の s7x anti-figure swap を是正 (questions.json diff 当該2選択肢のみ、correct_answer イ不変) → **Rule B archive** (`failures/quiz_phase1_S96_2010h22h-q002_regression{.md,_defective.json}`) → critic#2 再検証 ACCEPT。**今バッチ最大の教訓 = S94 q052 の再演**: 選択肢「取り違え」指摘でも corpus choices_jp 自体が s7x で破損しうるため figure 実読必須 (テキスト一致≠corpus 正)。**検証全 GREEN**: tsc/eslint 0err (既存 warning 1=tTerm)/**vitest 455**/build exit0/**nft IPA 0** (quiz trace=translations/**29回**.json、4 新 sidecar resolve、粗4hits=除外glob+source-map文字列の誤検知)。**Phase 1 翻訳済 29/29 回 = 完了、残 0**。証拠 `evidence/phase5/stage_06_quiz_phase1/` (rule_a_audit_S96 + README S96 節) + Rule B `failures/quiz_phase1_S96_2010h22h-q002_*`。**累積 上流 backlog (要ユーザー判断、翻訳成果物に影響なし)**: S96 q077 (choices_jp↔figure↔key 反転)・q055 (choices_jp[エ] `$` 脱落)・q099/q100 (stem が源に無い表参照)。**次 = Phase 2 (解析預生成) へ路由** (ユーザー待ち)。** <br><br>**(Session 95)** Quiz Phase 1 スケール バッチ S95 (3回: `2012h24a`/`2011h23a`/`2011h23tokubetsu`) 完了**。ユーザー路由「Quiz Phase 1 续批」(最新優先3回)。**300/300 三語**を統合 1 WF (`wf_d98c1db4-af8`、640 agent/23.9M tok) で実行 (pause 指示なし→全量完走)。**Rule D raw 296 PASS/4 CONCERNS/0 FAIL/0 null** (S94 と違い FAIL/null/直列化 0 のクリーンパス、repair 回復 16 内 3 FAIL→PASS)。**Rule A (独立 critic N=37、各回12+強制4、層化 figure22): accurate 35/37、none23/low11/medium3/high0**。**not-accurate 2 + medium 1 を triage (全て figure-faithful 是正・正解不変・独立 critic ACCEPT)**: ① **`2011h23a-q033`** (medium、zh 用語、正解ウ不変): stem.zh「工程」(中文=engineering)→「过程」(JP 工程=作業段階/process、en は元から process)。② **`2012h24a-q002`** (medium、drift、正解イ不変): choice イ から源にない注記「（处理）/（数据存储）」除去、**「圆」維持** (主 context が figure_png+page-02 実読し イ=円(プロセス)+データストア+矢印の Yourdon-DeMarco DFD と確認、源 choices_jp.イ「四角形」は上流欠陥。**q052 教訓=translator 産出値 figure 正「圆」から「四角形」へ動かす誤 fix を回避**)。③ **`2011h23tokubetsu-q073`** (medium、OCR garble、正解ア不変): 区切り記号「ε」(OCR 誤読)→「CR」(改行コード) を stem_jp_clean/stem/全4選択肢で置換 (ε 0/CR 23) + 正解ア 末尾 CR 補完 (主 context が figure_png+page-26 実読・拡大確認、全選択肢末尾CR・ア=行優先カンマ「月,1月,2月 CR 売上高,500,600 CR」)。**独立再検証 (Rule D: critic≠fixer=主 context) = 3件 ACCEPT** (critic が q002/q073 の figure を自己実読+拡大で CR/円/末尾CR を裏付け)。**実効: 翻訳欠陥 0**、Rule B archive 不要 (REGRESSION なし)。**検証全 GREEN**: tsc/eslint 0err/**vitest 455**/build exit0/**nft IPA 0** (quiz trace=translations/25回.json、22+3 resolve 確認)。**Phase 1 翻訳済 25/29 回、残 4**。証拠 `evidence/phase5/stage_06_quiz_phase1/` (rule_a_audit_S95 + README S95 節)。**要ユーザー判断 backlog (上流、翻訳 zh/en 無影響)**: ~~`2012h24a-q002` choices_jp.イ (四角形→figure 円) / `2011h23tokubetsu-q073` stem+choices_jp ε→CR + garble~~ → **同 session フォローアップ (ユーザー指示「先修一下」) で派生 corpus 是正済 (drift-proof: raw bank 編集→build-quiz-corpus 再生成、questions.json diff 当該2問のみ 6+/6-、quiz_index/正解 不変、独立 Rule D 再検証=critic が figure 自己実読し 2件 PASS、RESOLVED_IN_CORPUS)**。**次=ユーザー「Quiz Phase 1 续批」** (次候補 `2010h22a`/`2010h22h`/`2009h21a`/`2009h21h`)。<br><br>**(Session 94)** Quiz Phase 1 スケール バッチ S94 (3回: `2013h25h`/`2013h25a`/`2012h24h`) 完了**。ユーザー路由「Quiz Phase1 续批」(最新優先3回)。**300/300 三語**を統合 1 WF (`wf_7fdb5ae3-2ed`、648 agent/23.7M tok/~69分) で実行 (pause 指示なし→全量完走)。**Rule D raw 294 PASS/3 CONCERNS/2 FAIL/1 null**。**null=`2013h25h-q028`** (in-pipeline reviewer のツール呼び出しパース失敗=infra、translator 出力 well-formed) → 独立 `code-reviewer` 再レビュー=PASS (Rule D 補缺、figure page-11 実読・損益表 全数値三語一致・正解エ整合)。**直列化修復=`2013h25a-q091`** (zh stem の引用符が未エスケープ ASCII `"` で落盤→JSON 不正で merge 失敗、en は `\"` で正、in-pipeline reviewer は schema 検証済 StructuredOutput 返却値を審査したため PASS) → 最小エスケープ修復 (訳文内容 0 改変) + Rule A 強制サンプルで語義再核験。**Rule A (独立 critic N=43、各回12+強制7、層化 figure27): accurate 39/43、none27/low12/medium1/high3**。**4 not-accurate を triage**: ① **`2012h24h-q018`** (high、genuine 用語誤訳、正解イ不変): 正解選択肢「職能別組織」(=functional organization) の zh が `职务制组织` (职务=post≠职能=function)・en `Job-function organization` → zh `职能制组织`/en `Functional organization` (S92 q025 確証訳一致) に是正、根因=supply glossary の同概念分裂 (機能別→职能制/職能別→职务制)→glossary backlog、独立 critic 再検証 PASS。② **`2013h25h-q096`** (high、clean stem 忠実度、正解イ不変): translator の E2 セル設定で絶対行参照 $14 脱落 (`D2/D14`→`D2/D$14`、複写時 相対化で誤) + 複写範囲 `E3〜E13`→`E3〜E14` を stem_jp_clean/zh/en 3 箇所是正、**主 context が page-44 を高解像度 crop 実読**し figure 確認、glyph は問内一貫性 (D2/F2/選択肢が半角) 優先で E2 除算も半角統一 ($14・E14 の意味修正は保持)、独立 critic 再検証 PASS。③ **`2013h25a-q052` = REGRESSION (誤 fix を REVERT)**: **Rule A 監査 critic が「choices.ウ の sidecar 0.10 は figure(crop+page-18)=0.18 に対し捏造」と誤判定 → 主 context が 0.10→0.18 に「是正」→ 独立検証 critic が page-18 を 8x 実読し figure=0.10 と反証 → 主 context が crop (=選択肢を含まない) + page-18 を高解像度直接実読し figure ウ=`0.10` を確認 (監査 critic の「crop が 0.18」はハルシネーション) → 0.18→0.10 に REVERT** (元訳が正、figure 整合)。`input.choices_jp.ウ`=0.18 は上流 OCR garble (0→8)→backlog。**Rule B archive** (`failures/quiz_phase1_S94_2013h25a-q052_regression{.md,_defective.json}`)。④ **`2012h24h-q092`** (medium、上流 OCR、正解ア不変): choices_jp.イ `大阪幸子20,800/東京三郎10,800円` vs figure(page-40) `20,000/10,000`、翻訳は input に忠実 → 上流 backlog (主 context figure 実読で確証)。**実効: 翻訳欠陥 0** (q018/q096 是正 + q052 元訳復帰後、全 300 が figure/源に忠実)。**今バッチ最大の教訓**: figure-value を変える fix は Rule A 監査 critic の figure 主張を鵜呑みにせず fixer (主 context) が figure フルページを高解像度実読して確認せよ (D-小6 を fixer にも適用)、特に **fix が translator 産出値から AWAY に動く時は要警戒** (q052 では translator が figure 正値 0.10 を産出済だったが in-pipeline reviewer・Rule A 監査 critic の双方が input 0.18 を正と誤認、第3独立パス=検証 critic + 主 context 実読で捕捉=写審分離+多段独立検証の複利)。**検証全 GREEN**: tsc/eslint 0err/**vitest 455**/build exit0/**nft IPA 0** (quiz trace=translations/22回.json、19+3 resolve 確認)。**Phase 1 翻訳済 22/29 回、残 7**。証拠 `evidence/phase5/stage_06_quiz_phase1/` (rule_a_audit_S94 + README S94 節) + Rule B `failures/quiz_phase1_S94_*` ×3。**追記 (同 session フォローアップ、ユーザー指示「下批开始前帮我做了」)**: 上流 choices_jp 欠陥 **3 件を派生 corpus で是正** (drift-proof: raw bank 編集→`build-quiz-corpus.mjs` 再生成→tr 編集→merge で sidecar 同期): `2013h25a-q052` ウ (0.18→0.10)・`2012h24h-q092` イ (20,800/10,800→20,000/10,000)・`2013h25h-q096` ア (`*`→`＋` 加算、半角正規化)。questions.json diff=当該3問のみ (3+/3-)・quiz_index/answer_keys/correct_answer (ア/ア/イ) 不変・**独立 Rule D 再検証 (critic≠fixer、page-18/40/44 を高解像度 per-cell crop 実読、`0.10` vs `0.18`/`20,000` vs `20,800`/`＋` vs `＊` の sub-glyph 区別含め三語整合・正解不変を確認) = 3件 PASS**・検証 GREEN (tsc/eslint 0/vitest 455/build0/nft IPA0)。→ **q052/q092/q096 は backlog 除去 (RESOLVED_IN_CORPUS)**、残 S94 backlog = `2012h24h-q018` glossary 職能別組織 (textbook scope) のみ。**次=ユーザー「Quiz Phase 1 续批」** (次候補 `2012h24a`/`2011h23a`/`2011h23tokubetsu`)。<br><br>**(Session 93)** Quiz Phase 1 スケール バッチ S93 (3回: `2015h27h`/`2014h26a`/`2014h26h`) 完了。ユーザー路由「Quiz Phase1 续批」(最新優先3回)。**300/300 三語**を統合 1 WF (`wf_e84fb128-f4b`、660 agent/24.2M tok) で実行 (pause 指示なし→全量完走)。**Rule D raw 295 PASS/4 CONCERNS/1 FAIL/null 0**。**FAIL=`2014h26h-q086`** (表計算 図1): in-pipeline reviewer 2R とも FAIL (再構成表が raw OCR と大差で疑問視、欠陥セル未特定)。**独立 Rule A critic が footing 分析で pinpoint**: translator は figure から表を大半正しく再構成したが**行12(17:00〜)の現状東/西を1か所転置** (clean=`88|86`、figure=`86|88`、zh/en伝播)。行16表示合計 東804/西808 に対し defective は列実セル和=806/806 で footing 破綻 → **行12 B|C を `86|88` へ surgical 転置是正** (他セル/行/選択肢/正解不変、三語同時、再merge) + **独立 critic 再検証=PASS** (figure page-35 実読で全13行×9列 0 mismatch・footing 三語整合・正解ウ=22 三語保持)。正解根拠 a=I15 は行12非依存で不変。**Rule B archive** (`failures/quiz_phase1_S93_2014h26h-q086_attempt_1{.md,_defective.json}`)。**4 CONCERNS は repair 後実訳文+独立 Rule A で triage**: q029/q039=accurate/low (本土zh文体)、**q093/q088=accurate/medium=上流 choices_jp 汚染** (翻訳は figure に忠実=正、input が破損)。**Rule A (独立 critic N=39、各回12+強制3、層化figure23): accurate 38/39、none22/low14/medium3/high0** (medium3=q086是正+q093/q088上流backlog、high 0)。**上流(Stage 2) OCR欠陥の申し送り (翻訳成果物に影響なし、要ユーザー判断)**: `2014h26a-q093` choices_jp が別問汚染 (UIウィジェット スクロールバー/チェックボックス等→figure の真選択肢は COUNTIF式4択 正解イ、翻訳は figure を正として正訳、**JP locale 表示が誤選択肢のため全面再OCR推奨=影響大**)・`2014h26h-q088` choices_jp[ウ] 商品D→商品C (最適化検算 B+C=220万 最大=正解ウ で figure が正、OCR破損)。S89 q011/S90 q061/S91 q069/S92 に続き独立 critic のフルページ照合が上流欠陥を継続捕捉=網兜。**検証全 GREEN**: tsc/eslint 0err/**vitest 455**/build exit0/**nft IPA 0** (quiz trace=translations/19回.json)。**Phase 1 翻訳済 19/29 回、残 10**。証拠 `evidence/phase5/stage_06_quiz_phase1/` (rule_a_audit_S93 + README S93 節)。**追記 (同 session フォローアップ、ユーザー指示)**: 上流 choices_jp 欠陥 2 件を**派生 corpus で是正** (figure 已確証・確定的単点改): `2014h26a-q093` (choices_jp 全4択 UIウィジェット汚染→figure-exact COUNTIF式、zh/en ウ/エ 範囲 `$B$2~$B$36`→`$B2~$B36` も整合) + `2014h26h-q088` (choices_jp[ウ] 商品D→商品C)。**方式=drift-proof** (raw bank `question_bank.json` 編集→`build-quiz-corpus.mjs` 再生成、idempotent): questions.json diff=当該2問のみ (5+/5-)・quiz_index/answer_keys/正解 (イ/ウ) 不変。**独立 Rule D 再検証 (critic≠fixer)=両問 PASS** (figure 5倍ズーム+コードポイント照合+算術再計算)。検証再走 GREEN (tsc/eslint 0/vitest 455/build0/nft IPA 0)。→ **q093/q088 は backlog から除去 (RESOLVED_IN_CORPUS)**。**次=ユーザー「Quiz Phase 1 续批」** (次候補 `2013h25h`/`2013h25a`/`2012h24h`)。<br><br>**(Session 92)** Quiz Phase 1 スケール バッチ S92 (3回: `2016h28a`/`2016h28h`/`2015h27a`) 完了。ユーザー路由「Quiz Phase 1 续批」(最新優先3回)。**300/300 三語**を統合 1 WF (`wf_eb5953ac-643`、644 agent/23.5M tok) で実行 (pause 指示なし→全量完走)。**Rule D raw 295 PASS/4 CONCERNS/1 null/FAIL 0**。**null=`2016h28h-q017`**: in-pipeline reviewer が `API Overloaded` (瞬時 infra 障害) で失敗し未レビュー (translator 出力は well-formed) → **独立 `code-reviewer` で当該 1 問再レビュー=PASS** (Rule D 補缺) + Rule A forced 監査でも accurate/none (二重カバー)。**4 CONCERNS (全 figure) は repair 後実落盘訳文+独立 Rule A で triage**: q096/q072/q086=accurate/**none**、q022=accurate/**low** (stem_jp_clean が figure の結合セル・否定条件を正しく復元した確認 low、欠陥でない)。全受容。**適用修正 1=`2016h28a-q020`** (in-pipeline PASS だったが Rule A が genuine 用語取り違え捕捉): stem.zh の評価項目「営業力」(=sales) を `营销能力` (营销=marketing) と取り違え、en は元から `Sales capability` で正 → **stem.zh 1 フィールドのみ `销售能力` へ定点修正** (唯一一致 assert、en/choices/数値・正解ウ=8 不変)、低深刻度 (重み1 固定値の非答案セル) だが genuine な語義誤り。独立 critic 再監査=accurate/**none** → **実効 296 PASS 相当/FAIL 0**。**Rule A (独立 critic N=40、各回12+強制5、層化 figure30): accurate 40/40、none29/low11/medium0/high0 — スケール 5 バッチ目で初の medium/high ゼロ**。**上流 (Stage 2) raw OCR 欠陥の申し送り (翻訳忠実度は PASS、Stage 2 backlog)**: `2016h28h-q001` (ア 16→10時間・イ garble、翻訳は figure に忠実)・`2016h28h-q012` (イ 13,000 vs figure 12,000、翻訳は input に忠実=input/figure ズレ)・`2016h28h-q096` (stem H004 数学 50→70・LIKE `%` 脱落・official 設問ウ/エ 二者該当)・`2015h27a-q088` (図3 基準値 3.6 vs 区分線 3.0、正解エは 0.5 区分線で非依存)。S89 q011/S90 q061/S91 q069 に続き **4 連続で独立 critic のフルページ照合が上流欠陥を捕捉=網兜**。glossary 不整合 1=`2016h28a-q025` (正解ウ 職能別組織の訳 `职能制组织` は IPA 標準で正、供給 glossary の `职务制组织` が誤誘導的→textbook glossary 再確認 backlog、訳は不修正)。**検証全 GREEN**: tsc/eslint 0err/**vitest 455**/build exit0/**nft IPA 0** (quiz trace=translations/16回.json)。**Phase 1 翻訳済 16/29 回、残 13**。証拠 `evidence/phase5/stage_06_quiz_phase1/` (rule_a_audit_S92 + README S92 節)。**次=ユーザー「Quiz Phase 1 续批」** (次候補 `2015h27h`/`2014h26a`/`2014h26h`)。<br><br>**(Session 91)** Quiz Phase 1 スケール バッチ S91 (3回: `2018h30h`/`2017h29a`/`2017h29h`) 完了。ユーザー路由「Quiz Phase 1 续批」(最新優先3回)。**300/300 三語**を統合 1 WF (`wf_0cd70973-55c`、666 agent/24.3M tok) で実行 (pause 指示なし→全量完走)。**Rule D raw 296 PASS/4 CONCERNS/FAIL 0**。4 CONCERNS は **repair 後の実落盘訳文で triage** (verdict ラベル非依存、S88 q072 教訓): q090 (R1 medium=zh `うどんすき`→`什锦乌冬面` が操作c 前方一致 `乌冬面%` を破壊し zh で c=1) は **repair が `乌冬面火锅` へ是正済** (zh 再計算 c=2→ア 一致)、q019 (R1 high=zh `特別利益`→`营业外利得` 会計区分混同) も **repair 是正済** + 残 low (`事業税`→`营业税`=廃止別税目) を **stem.zh 1 フィールド `事业税` へ定点修正** (en/choices 不変・唯一一致 assert)、q003/q069 は low-only 受容 → **実効 297 PASS 相当/3 CONCERNS/FAIL 0**。**Rule A (独立 critic N=37、層化 figure24+強制4 CONCERNS): accurate 37/37、none22/low14/medium1/high0、not-accurate 0**。q019/q090 強制サンプル=accurate/**none** (修正確認)。**medium1=`2017h29h-q069`=上流(Stage2)OCR欠陥の申し送り**: 翻訳は input `choices_jp` を 1:1 忠実訳出 (accurate=true・4 check 全 true) だが **input.choices_jp 自体**が権威フルページ page-29 とズレ (選択肢イ 誤OCR/ウ `社員名` 脱落)、**正解ア は不変**。誤選択肢配信は公式と異なる → **上流再OCR=backlog (Stage2 scope、ユーザー判断)**。S89 q011/S90 q061 と同型 (独立 critic のフルページ照合が上流欠陥を捕捉=網兜)。**D-小6 効果実測**: q001 (源 Z行 6,7,8→図 8,7,8 で最大22=ウ 整合、未修正なら正解崩壊)。**session limit で ruleA 7 失敗→`resumeFromRunId` 補完** (30 キャッシュ+7 live=37/37、resume 4 回目)。**新ヘルパ `scripts/quiz-phase1-batch.mjs`** (統合バッチ combiner、決定的、S88〜S90 インライン構築を置換、D-小8)。**検証全 GREEN**: tsc/eslint 0err/**vitest 455**/build exit0/**nft IPA 0** (quiz trace=translations/13回.json)。**Phase 1 翻訳済 13/29 回、残 16**。証拠 `evidence/phase5/stage_06_quiz_phase1/` (rule_a_audit_S91 + README S91 節)。**次=ユーザー「Quiz Phase 1 续批」** (次候補 `2016h28a`/`2016h28h`/`2015h27a`)。<br><br>**(Session 90)** Quiz Phase 1 スケール バッチ S90 (3回: `2019r01a`/`2019h31h`/`2018h30a`) 完了。ユーザー路由「Quiz Phase 1 续批」(最新優先3回)。**300/300 三語**を統合 1 WF (674 agent/14.4M tok、S89比-24%) で実行。**D-小7 を実装** (S89 q067 教訓): repair プロンプトに「是正は check FAIL+high/medium 限定、low 示唆は語義検証なしに採用しない」→ **初バッチで意図通り機能** (q010: medium 执行董事→高级管理人员 是正、R2 の矛盾 low 揺り戻し不採用 / repair 誘発 FAIL 0 / q082 真欠陥 FAIL→repair→PASS は維持)。ユーザー指示「400/602 で一時停止」→ journal result 計数監視で 402 時 TaskStop (翻訳 300/300 全落盘済) → 「継続」→ resume (3 回目実証)。**Rule D raw 291 PASS/9 CONCERNS/FAIL 0** → triage: 7 low-only 受容 / q026=figure 内 JP ラベル設計指摘 (v1 既定、backlog) / **q045 medium 1 件のみ** (distractor zh 软件方式设计=日式借词) → 1 フィールド定点修正 (软件架构设计) + 独立 re-review APPROVE → **実効 292 PASS 相当/8 CONCERNS/FAIL 0**。**Rule A (N=38、各回12+修復問強制2、figure20): accurate 38/38、none26/low12/med0/high0 — 連続 2 バッチ修復不要**。q045 強制サンプル=accurate/**none**。D-小6 効果再実測 2 件 (q053 59本→50本・q098 B2=88→80、フルページが源 OCR 破損を正是正)。**新 backlog (要ユーザー判断)**: `2019h31h-q061` の figure crop が隣問 (問62 RAID) を写すズレを Rule A critic が発見 — 翻訳無影響だが**アプリ上 q061 に誤図表示** → raw crop+webp 再裁剪は図管線 scope。**検証全 GREEN**: tsc/eslint 0err/vitest 455/build exit0/nft IPA 0 (quiz trace=translations/{10回}.json)。**Phase 1 翻訳済 10/29 回、残 19**。証拠 `evidence/phase5/stage_06_quiz_phase1/` (rule_a_audit_S90 + README S90 節)。**次=ユーザー「Quiz Phase 1 续批」**。<br><br>**(Session 89)** Quiz Phase 1 スケール バッチ S89 (3回: `2022r04`/`2021r03`/`2020r02o`) 完了。ユーザー路由「Quiz Phase 1 续批」(回数未指定→最新優先3回)。**300/300 三語翻訳**を統合 1 ワークフロー (658 agent/18.9M tok) で実行。**D-小6 を実装** (S88 fix-checklist): prep が raw bank `source.page_image` から figure 問に `figure_page_png` を注入、translator/reviewer/critic の 3 prompt を「crop+フルページ併読・フルページ権威・列脱落禁止」に増強 (scripts 3 ファイルのみ変更)。**ユーザー事前指示「総量の半分で一時停止」**→ 153 done で TaskStop (全 well-formed) → 「継続」→ `resumeFromRunId` で残 147 完走 (**resume 2 回目実証**)。**merge ×3 → committed sidecar (各 100/100、missing 0、clean stem 58/62/62)**。**Rule D in-pipeline 実効 299 PASS/1 CONCERNS**: FAIL1=`2021r03-q067` は **repair 誘発回帰** (R1 reviewer の low 示唆「保护性」を repair が機械採用→捏造語、R2 reviewer が正しく FAIL) → Rule B archive → writer ピンポイント是正 (zh 保全性/en Preservation、b 項 Maintainability 衝突回避) → 独立 re-review PASS 6/6・回帰 0。**教訓 (fix-checklist)**: repair は指摘欠陥の是正に限定、reviewer low 示唆の機械採用は語義区別を壊す (D-小7 候補)。CONCERNS1=`2020r02o-q011` は上流 choices_jp 転写品質 (翻訳は忠実、S87 q039 型) → 受容+backlog。**Rule A (N=36 独立 critic、層化 figure23): accurate 36/36 (100%)、none25/low11/med0/high0 — スケール初の修復不要バッチ**。D-小6 効果実測 3 件 (q050 移動60/C10 検算成立・q074 格納1・q071 D3=5,000、生 stem OCR 誤数値をフルページで正是正)。scope 外メモ: `2021r03-q095` 公式 answer key と critic 再計算の食い違い記録 (翻訳忠実・キー不改変、Phase 2 解析生成で自然再検証)。**検証全 GREEN**: tsc/eslint(0err)/**vitest 455**/build exit0/**nft IPA leak 0** (quiz trace=quiz_index+questions+translations/{7回}.json、粗 4 hits は Next 内部 pages/自作 textbook SVG の誤検知と確認)。**Phase 1 翻訳済 7/29 回、残 22**。証拠 `evidence/phase5/stage_06_quiz_phase1/` (rule_a_audit_S89 + README S89 節)。**次=ユーザー「Quiz Phase 1 续批」で次バッチ**。<br><br>**(Session 88)** Quiz Phase 1 スケール バッチ S88 (3回: `2026r08`/`2024r06`/`2023r05`) 完了。ユーザー路由「Quiz Phase 1 续批」(回数未指定→最新優先3回)。**300/300 三語翻訳**を統合 1 ワークフロー (658 agent/16.9M tok) で実行。途中ユーザー要請で 200done 付近 (batch-tr=211) で TaskStop→`resumeFromRunId` でキャッシュ再利用し残89完走 (**resume 実証**)。**merge ×3 → committed sidecar (各 100/100、missing 0、clean stem 48/39/56)**。**D-小5**: translate は id グローバル一意のため統合1WF (並列16=rate-limit優、merge は exam スコープで tested フォーマット維持)。**Rule A (N=36 独立 critic、層化 figure21)**: 原 **35/36 accurate** (high1=`2026r08-q072` の `stem_jp_clean` で口座表の実在列「口座種別」脱落+列順改変、zh/en伝播、**正解イは不変**=FK依存鎖保持)。根因=translator が figure crop のみ参照 (上端クロップで列欠落)、**in-pipeline reviewer も見逃し→独立 critic 単独捕捉** (写審分離の価値再実証)。**修復**: writer を **figure crop + page-35.png(権威full page)** で再 dispatch→正4列再構成、独立 critic 再監査 **ACCEPT** → **実効 36/36 accurate (high0)**。low16 は本土zh自然さ/figureクロップ観察(figure側scope外)/説明的グロス/FP法正規化=正誤無影響。**Rule B**: `failures/quiz_phase1_S88_2026r08-q072_attempt_1{.md,_defective.json}`。**Rule D**: writer(general-purpose)≠reviewer(code-reviewer)≠auditor(critic)≠修復re-auditor(critic別)。**検証全 GREEN**: tsc/eslint(0err)/**vitest 455**(S87維持)/build exit0/**nft IPA leak 0** (quiz trace=quiz_index+questions+translations/{4回}.json のみ)。**コード無変更** (reader/UI/next.config は S87 完成)、成果=sidecar 3+q072修正。UI screenshot は省略 (reader 不変+Rule A 意味検証が担保)。**学び (fix-checklist)**: figure 問 clean-stem は crop だけでなく full-page 併読すべき (crop端クロップで列欠落、D-小6候補) / 構造検査≠意味検査の再実証 (merge構造検査は q072 通過、Rule A が網兜)。**Phase 1 翻訳済 4/29 回、残 25**。証拠 `evidence/phase5/stage_06_quiz_phase1/` (rule_a_audit_S88 + README S88節)。**次=ユーザー「Quiz Phase 1 续批」で次バッチ**。<br><br>**(Session 87)** Quiz Phase 1 (翻訳 backfill) 実行設計 (D-136) + pilot `2025r07` 完了**。ユーザー「开 Phase 1」。Phase 0 commit 済 (`0167626`)。**D-019 設計問答 (全 4 推奨案)**: Q1=pilot-first / Q2=三語クリーン+vision / Q3=サイドカー+merge / Q4=教科書term束縛 → **D-136 lock**。**パイロット 2025r07 (100Q) 完了**: パイプライン `prep→translate.workflow(translate[general-purpose,opus]→review[code-reviewer,opus]2R、figure vision・term束縛・read-by-id)→merge(サイドカー決定的組立)→ruleA.workflow(critic N=12)`。**結果: 100/100 翻訳・clean stem 49**。**Rule D (in-pipeline, writer≠reviewer): 99 PASS/1 CONCERNS**。**Rule A (独立 critic N=12): accurate 12/12 (100%)・none×10/low×2/med-high 0・全check true**。**vision-clean 実証 (q026)**: raw OCR 表完全破損→図から完璧再構成 (正解 ウ=2,300 整合、critic 図一致確認)。**UI**: /{ja,zh,en}/quiz 200・zh应收账款/交付物・en accounts receivable 描画・ja clean stem 適用。**検証 GREEN**: tsc/eslint clean・vitest **455**(+9)・build exit0・**nft IPA leak 0** (quiz trace=quiz_index/questions/translations のみ)。**D-小3 (D-136-C 拡張)**: 非figure問の stem OCR 誤字も clean (Rule A clean_stem_faithful 12/12)。**D-小4**: read-by-id モード (args 軽量・29回スケール対応)。証拠 `evidence/phase5/stage_06_quiz_phase1/` (README+rule_a_audit+screenshots×4)。**次=① ユーザーゲート (残28回/2800問スケール GO 可否) ② commit (派生 translations 公開 repo へ=IPA 教育利用範囲、ユーザー確認ゲート)**。<br><br>**(Session 86)** Stage 6 サブ段階「Quiz 接過去問」設計完了(D-019、実施 Phase 0 GO 待ち)。ユーザー「首页止血修 + Quiz 接過去問的 D-019」。**首页 500 根因確定**: S63 削除の旧書本語料 `_fixtures/v1.0.3` に `FsDataSource` が依存→ENOENT。**血量広い**: quiz/glossary/tutor/chat + 4 API 全滅、教科書 reader のみ生存。設計 Q&A 2 ラウンド(D-019): Q1=band-aid せず直接 Quiz 再建/Q2=un-gitignore/Q3=三語預生成翻訳/Q4=主題別+年度別両方/Q5=JP 先上線・翻訳増量回填/Q6=解析預生成/Q7=figure 問含む。**IPA 著作権核査**(公式 FAQ): 過去問は教育利用**許諾・使用料不要**、ただし**出典明記+改変明記**条件・著作権非放棄 → 公開 repo OK(D-133 著作権顧慮解消)。**実装前 3 発見**: ①raw bank に内部 cruft+破損 OCR backup(`*_corrupted_backup`/`s027_*`)②figures **109M**(467 PNG)③一部 figure 問 stem に garble。→ **D-134 lock**(raw は gitignored 維持、**クリーン派生 `data/ip/quiz/`** を生成 un-gitignore・figure 467 ロスレス最適化・出典/改変 compliance 内蔵)+ **D-135 lock**(v1=JP-first 2 モード[主題別+年度別]真題面、翻訳/解析は預生成 backfill 管線 Phase 1/2、runtime AI 不使用)。段階: Phase 0(projection+un-gitignore+quizReader+quiz 再建→首页治癒)/1(翻訳)/2(解析)/3(教科書統合)。**Phase 0 = 実装+Rule D 完了**(ユーザー GO「按你推荐来」)。`build-quiz-corpus.mjs`(raw→派生 `data/ip/quiz/` 2900/63/29、出典導出、決定的・invariant)+`build-quiz-figures.mjs`(467 figure→`public/quiz-figures/*.webp` ロスレス 80.6M→30.7M)+自前 `quizReader.ts`/`quizModel.ts`(client/server split)+UI(`QuizBrowser` 2 モード+`QuizSet` reveal、自前クリーン面)+i18n Quiz ns+next.config tracing+middleware matcher。**stem garble 除去は Phase 1 へ繰延**(249/467 の `|` は大半が正当 markdown 表、決定的除去は危険)。検証全 GREEN: tsc/eslint 0err/**vitest 446**/build exit0/runtime `/`→/ja/quiz **200(首页治癒)**+全 quiz/figure/textbook 200/nft **IPA=0・_figure_ids=0**。**Rule D=APPROVE**(0 BLOCKER/0 HIGH/10 LOW、独立 Workflow、写審分離が middleware.test 未更新の full-suite red を捕捉→修正+post-review 8 LOW 修正)。証拠 `evidence/phase5/stage_06_quiz_phase0/`。**commit はユーザー確認ゲート**(公開 repo へ IPA 派生・不可逆)。<br><br>**(Session 85)** Stage 6 v1 教科書リーダー実装完了(244 unit 上線)。設計3問(D-019)回答 Q1=リーダー集中/Q2=gitignore 解除/Q3=精簡。**Q2 前提検証で食い違い surface**(自作は `textbook/` のみ、`exams/`1.2G・`sources/`168M は IPA 著作物・remote public)→ AskUserQuestion「只 textbook/」→ **D-133 lock**(自作のみ in-repo)。GO 後実装: 自己完結データ層 `reader.ts`(`ja`→`jp` ブリッジ・`cache()`・TDD 13/13)+ 精簡 UI(目録 `TextbookToc` + リーダー `UnitReader`[per-locale・SVG inline・pager])+ ルート rewrite(S81 検証 harness 削除)+ i18n 3 catalog(`Textbook` ns)+ 教科書 NavTab(3 shell)+ `.gitignore`/`next.config`(tracing)。**検証全 GREEN**: tsc/eslint(0err)/vitest **434 passed**/build exit0/runtime 全 200/screenshots ×4。**Rule D=APPROVE**(写審分離、reviewer 独立再検証)。**⚠ レビュー後の独自全軸 nft 再検査で 1.2GB IPA exams leak を捕捉**(reviewer は textbook 軸のみで見逃し)→ `textbookRoot` 直接解決 + `outputFileTracingExcludes` で **EXAMS/SOURCES/SYLLABUS=0**(規則 A: 単一 PASS≠全軸検証)。**OQ-03 → 同 session で b-cheap 解消**(ユーザー「开干」): `scripts/enrich-toc-i18n.mjs` で unit_index.json を決定的 enrich(unit→title_zh/en, topic→major/medium_zh/en, 追加のみ・invariant 検証 fallback0)→ `buildNav(index,locale)` 化 → **ToC が zh/en で unit タイトル+グループ見出し母語化**(小分類は JP 固定)。**`/`→/quiz の 500 は既存事項**(`_fixtures` 欠落 S63、後続 Quiz 段で是正)。証拠 `evidence/phase5/stage_06_reader_v1/`。次=OQ-03 判断 + 後続サブ段階(Quiz/Glossary/Tutor/双軌/デプロイ smoke)。<br><br>**(Session 85 設計)** 着手可否=前置全充足。D-133 ADR 済。<br><br>**(Session 84)** strategy 95 三語完了 → 全量 244/244 完成・Stage 4 (AI教科書生成) 完了**。中断復旧 (前回無ログ中断、disk 鑑識で「翻訳 pass 完了・merge 前」と特定) → ⑥ merge 95/95 (整合全通) → 三語構造検査全绿 (空0/和製形0/図161) → ⑦ Rule A 翻訳 N=18 (**100% faithful, 0 med/high**, critic 独立) → ⑧ 三語ゲート承認 (2026-06-08): センシング 计测→测量(+summary同期漏れを構造検査が捕捉) / EC 源文是正+重訳。**Rule D 漏判 (workflow reviewer が EC analogy の旧二元框架塌缩を PASS) を spot-read+独立 critic 再核で補修 = 写審分離の価値再実証**。残 strategy 0。証拠 `evidence/phase5/stage_04_content_jp_strat/`。次 = Stage 6 (Web App 統合)。<br><br>**(2026-06-05 Session 83)** step4 全量 Phase B 第二批 (technology 119 unit) 三語完了。日語生成 116P+3C+0F (2子批) → Rule A N=30 (97%accurate, 1 medium=リスク対応「低減」欠落を prose 補修[term 追加不可=knowledge_tree に低減 term 不在, invariant]+Rule D PASS) → 日語ゲート承認。**横断 zh 用語 policy 決定** (成果物→交付物/有效性确认→确认): translator prompt 更新 (全量) + 既存30 unit retrofit (47置換, 和製形清零)。翻訳 全 PASS (6 transient StructuredOutput hiccup を redo で回収) → Rule A 翻訳 N=20 (**100% faithful**, 誤訳0) → 三語ゲート承認 (2安全微調: 通貨例日源整合・业务用→商用)。**完了 149/244 (mgmt 23 + tech 123 + pilot strategy 3)**。残 strategy 95。証拠 `evidence/phase5/stage_04_content_jp_tech/`。次 = strategy 95 (最終批)。<br><br>**(Session 82)** step4 第一批 management 18 三語完了。脚本泛化 (`.pilot.json`→全量 `unit_index.json`、5本) + 即跑即測 (全244 fixtures、pilot 12/12 バイト一致、batch-safe ガード no-op 実証)。第一批 = management 全量 18 unit (非pilot 7 topic)、**日語のみ→日語ゲート** (ユーザー選択)。日語生成 18/18 PASS → **Rule A 意味抽检 N=18 accurate 18/18 (100%、high 0)** → 日語修正 (medium1 品質特性図8特性化+low6) で **Rule D 独立 reviewer が summary.key_points 同期漏れ2件捕捉 (本文○要約×)→修正→PASS** (写審分離の価値実証) → 日語ゲート承認 → 翻訳 18/18 PASS → 三語マージ (1887字段 empty0) → **Rule A 翻訳忠実度 N=12 faithful 12/12 (100%、誤訳0)** → 三語ゲート承認 (2安全 zh 本土化適用、横断用語ポリシーは全量 prompt 申し送り)。**最終: 18 unit/97 term 全 ToC 一致・図31/31・三語完整 (`stage4-unit-v1-trilingual`)**。証拠 `evidence/phase5/stage_04_content_jp_mgmt/`。次 = 残214 unit (strategy95+technology119) の cadence ユーザー選択。<br><br>**(Session 81)** step3 schema 落地体検 完了。pilot 12 unit を web app 最小阅读視図 (`/[locale]/textbook`) に接続し schema を核験。** 設計確認 (D-019、ユーザー回答): 最小验证脚手架 / 三語同屏 / quiz=題号+解析核験。harness 10 file (gitignore data を `TEXTBOOK_DATA_ROOT` で server 直読、SVG inline/PNG base64、commit は code のみ)。検証: build exit0 / tsc・eslint clean / 全ページ HTTP200 **SCHEMA OK** (12/12 lang-complete・生成図19/19・source図8/8・quiz 全解決 dead0・unit 級 12/12 no issues) + screenshot 3枚。**Rule D**: code-reviewer (≠writer) が false-OK 2件(HIGH, summary 空配列/空要素が無検出) 検出→REQUEST CHANGES→修正 (summary 空+要素空 error 化・est_minutes/freq_badge 検査・lang_status/source PNG warn→error・validateContent 純粋分離) + 証明テスト `validate.test.ts` **9/9 PASS** (CI安全) → 再 review **APPROVE**。**結論: schema 健全、全量 Phase B で同 pipeline 信頼可**。証拠 `evidence/phase5/stage_04_schema_check/`。次 = step4 全量 Phase B。<br><br>**(Session 80)** G4 全量 Phase A 完了。63/63 topic 規劃 → 正式 ToC `unit_index.json`。ToC ゲート承認済。step1 脚本泛化 (assemble→全63 / workflow→lean reviews 返却+境界prompt+args硬化 / 新 `phaseA-persist` [reviewer=code-reviewer は Write 非搭載のため返却値経由で review 永続化] / merge-toc→正式 unit_index.json + 確定性結構復検を HARD gate 化)。step2 = 検証批 5 (大節点91/88 + 亜下限3/4語) → gate PASS → 全量 55。**結果: 63 topic / 244 unit / 1417 term。Rule D PASS=54/CONCERNS=9/FAIL=0。HARD構造復検 失敗=0 (入力1417=配置1417, 過不足0/捏造0/重複0)**。大節点全 PASS (77語=1R)。実行=Workflow `wf_95479e6c-8ad`(検証5) + `wf_fdd23701-9ef`(残55, 186agent/9.3M tok)。pilot3 plan は再規劃せず複用。産出: `unit_index.json`(866KB) + `evidence/stage_04_toc/{toc.md,structural_audit.json,gate_report.md}`。**ToC ゲート (D-128-A) = ユーザー承認済 (2026-06-02、修正要望なし)。次 = step3 schema 体検 → step4 全量 Phase B。** |
| 当前阶段 | **Phase 5 Stage 6 (Web App 数据統合) 進行中。サブ段階「Quiz 接過去問」: Phase 0 = 完了+commit 済 (`0167626`)。Phase 1 (翻訳 backfill) = **完了 (翻訳済 29/29 回、S87 pilot + S88〜S96)**。各バッチ Rule A 独立抽検 (S92 40/40・S93 38/39・S94 39/43・S95 35/37・**S96 50/52** [q092 figure 注記/q077 en gloss/**q002 REGRESSION→REVERT+corpus fix**、全 figure-faithful・独立 critic ACCEPT])・Rule D 写審分離・全検証 GREEN。**Phase 2 前ゲート (図題答案KEY 体検、Session 97) = 完了**: 母集団 247 (choices_resourced_s7x OR figure_repaired)、分層 N=40 vision 審計 (写審分離+毒入校正)、**strict 坏键率 0/40** (BAD_KEY 0、Wilson 95% 上限≤~22)、器具校正 OK (毒 q013 命中=感度・q002/q052 clean=特異度、q052 は審計偽陽性を主context 5×実読で CLEAN 裁決)、非キー選択肢汚染は別件 (~5%、q096/q078/q077)。→ **keys clean → Phase 2 GO**。**Phase 2 (解析預生成) = 着手 (Session 97、ユーザー路由「a」)**: D-019 問答→**D-137 lock** (標準 schema 正解理由+各誤答+要点 / JP先生成→翻訳 / key-guard 内蔵 suspect-flag+照常生成+バッチ末汇总 / pilot-first)。パイプライン scripts×5 + データ層/UI/i18n/test 実装済 (quizExplanation.test 8/8、tsc/eslint clean)。**pilot 2025r07 (100問) 生成 WF `wf_89b6ad0d-52e` バックグラウンド実行中** → 完了後 merge/ruleA/検証/triage → pilot 報告 + ユーザー gate (全 29 回 scale)。 D-136(pilot-first / 翻訳サイドカー `data/ip/quiz/translations/` + reader merge / figure 問 vision 三語クリーン / 教科書 term 束縛) + D-小6 (figure crop+フルページ併読) + D-小7 (repair 語義ガード) + D-小8 (統合バッチ combiner `scripts/quiz-phase1-batch.mjs`、いずれも組込済)。**要ユーザー判断 backlog (上流データ品質、翻訳成果物に影響なし、累積)**: **S94** ~~q052/q092/q096 choices_jp~~ → **同 session で corpus 是正済 (RESOLVED_IN_CORPUS、独立 Rule D 再検証 PASS)**、残 `2012h24h-q018` glossary 職能別組織。(S93 の `2014h26a-q093`/`2014h26h-q088` choices_jp は同 session で corpus 是正済=RESOLVED) `2016h28h-q001`/`q012`/`q096` choices_jp・stem 再OCR + `2015h27a-q088` 図3 基準値 (Stage 2) / `2016h28a-q025` glossary 職能別組織 (textbook) / `2017h29h-q069` choices_jp 再OCR / `2019h31h-q061` figure crop ズレ (図管線 scope)。<br>**(S86 Phase 0)** **Phase 5 Stage 6 (Web App 数据統合) 進行中。サブ段階「Quiz 接過去問」Phase 0 = 実装+Rule D 完了 (Session 86、D-019)、commit 確認ゲート待ち。** — D-134(配信=クリーン派生 `data/ip/quiz/` を un-gitignore、raw bank/pages/figures は gitignored 維持、IPA 条款で公開 OK・出典/改変明記義務)+ D-135(v1=JP-first 2 モード真題面[syllabus 主題別+試験年度別]、翻訳/解析は預生成 backfill Phase 1/2)。**Phase 0 完了**: 首页 500(死語料 `_fixtures/v1.0.3` S63 削除)治癒、quiz 接過去問 v1 上線(2900 問・63 主題・29 回・467 figure、JP-first・出典・reveal)。検証全 GREEN(vitest 446/build/nft IPA=0)+Rule D APPROVE。残段階: 1(翻訳 2900×{zh,en})/2(解析 2900× 三語預生成)/3(教科書統合)。glossary/tutor/chat は死語料依存のまま 500、各自後続サブ段階で移行(band-aid せず)。<br>**(S85 完了)** v1 教科書リーダー(244 unit 上線、目録+per-locale+SVG inline+pager+教科書 NavTab、全検証 GREEN+Rule D APPROVE+nft IPA leak 修正、D-133)。Stage 4 完了(244/244 三語)・Stage 5 は S63 先行済。OQ-03 closed。 |
| 锁定决策 | **138** (D-001 ~ D-138)。**D-138** = Quiz Phase 1.5 (stem 源再構成) = Phase 2 scale 前の必須前段 (図題467 全数 figure 再構成 / 非fig marked 71 backup 照合 / 出力=翻訳サイドカー更新・reader 不変 / 三語整合 / pilot-first・writer≠figure↔stem checker)。**D-137** = Quiz Phase 2 (解析預生成、標準 schema / JP先生成→翻訳 / key-guard suspect-flag / pilot-first)。 |
| Open Questions | OQ-01 + OQ-02 (Phase 1 carryover, low priority)。**OQ-03 = CLOSED** (Session 85, reviewer 提起→同 session で b-cheap 解消: ToC の unit タイトル + major/medium グループ見出しを per-locale 化[訳語は既存・決定的結合]、小分類 name は corpus/IPA とも訳語ゼロのため全 locale JP 固定=ユーザー合意の意図的設計。任意 backlog: 63 小分類名翻訳=要 LLM+Rule A) |
| 次セッション | **▶ stem 品質体検 (Session 97、ユーザー「a」) = 完了 → Phase 1.5 (stem 源再構成) を Phase 2 scale 前に推奨**。分層 N=54+校正4 (図題=図照合/非fig=backup照合)、WF `wf_64cd3e68-819`。**坏 stem 率 (answer-affecting) 2/54=3.7%** (Wilson[1,12.5%]、2900 投影~107) — **q050 (figure_clean! 図 D←B/E←C を D←A/E←無 に改変→正解 ウ→ア 反転、Phase1 clean-stem 自体が誤)・q090 (非fig: s7x が「同時不可」条件節を別意味置換)**。**重大: 器具は figure-table 腐敗を過小検出** (校正 q066=真腐敗だが auditor+verifier が「忠実」と誤判=答案 robust ゆえ、主 context 3.5×実読で corpus 11行/図12行・成功失敗反転・行脱落を確認) → **figure-table 忠実度は標本監査で certify 不能・真の図 stem 腐敗率はより高い**。校正: q034(非fig語脱落)CAUGHT✓/q001/q026✓/q066 MISSED✗。UNCERTAIN q022/q035 は backup が別問 artifact で表示 stem は正 (bad stem でない)。**根因 3機構: ①s7x 修復の意味脱落 (q034「あと」/q090 条件節) ②Phase1 clean-stem の figure 不一致 (q050) ③図題 no-clean の raw 腐敗表 (q066、213件)**。**答案KEY は clean (別軸、S97+Phase2)**。証拠 `evidence/phase5/stage_06_quiz_stem_audit/`。**ユーザー選択 = (a) → D-138 LOCK (Phase 1.5 stem 源再構成)**。**▶ Phase 1.5 pilot (2025r07 図題 16、q066 含む) = 完了・成功**: reconstruct WF (writer general-purpose→独立 critic figure↔stem 照合) 16/16 PASS、8 実質変更。**q066 (体検で器具が miss した最悪ケース) を主 context 4×実読で再構成の正しさを逐項確証** (閾値 4月18→**4月10**・行 drift・8行目失敗→成功・9行目部署 001→003・行脱落補完で12行・条件語「だけ」復元、答案イ不変)。**第1回 run で 5問が解答選択肢表を stem に重複させる回帰を pilot が捕捉 → reconstruct prompt に「問題データ表は含め解答選択肢表は含めない」明記 → 第2回 run で重複0**。merge=translations サイドカー更新 (working tree 改・未 commit、JSON.stringify 書込で直列化 valid)。証拠 `evidence/phase5/stage_06_quiz_phase1.5/`。scripts `quiz-phase1.5-{prep,reconstruct.workflow,merge}.mjs`。**ユーザー gate 待ち: 全 467 図題 + 71 非fig marked (~538問) へ scale 可否 (+ pilot stems を commit するか)**。**scale 手順**: `quiz-phase1.5-prep <exam>` (全 at-risk) → Workflow `quiz-phase1.5-reconstruct.workflow` (args={exam_id,input_path,items:[{id,klass}]}) → `quiz-phase1.5-merge <exam>` → Rule A 独立抽検。出力=翻訳サイドカー `stem_jp_clean`+`stem.{zh,en}` 更新 (reader 不変)。**Phase 1.5 完了後 → Phase 2 (D-137) を figure-fidelity hardening 込みで再 pilot → scale**。<br><br>**(Phase 2 pilot 既報)** pilot 2025r07 = 完了、結果=要 hardening (スケール保留)。生成 100/100 (JP PASS99/null1・TR PASS100)・検証 GREEN (tsc/eslint/vitest **463**/build/nft IPA0)・**Rule A 独立 critic N=14 = accurate 11/14、high3 すべて independent_answer==stored key → 答案KEY 0 件不良 (S97 体検と整合)**。high の実体は **stem/解説の品質** (q034 非figure stem が「あと」脱落→誤誘導解説 [主 context 初回裁決 ウ は破損 stem に騙され critic が key イ 正と是正] / q066 figure問の clean stem 未生成→破損表で解説 / q026 は ruleA-prep の raw-stem artifact=修正済)。根因=上流 stem OCR 破損の解説伝播。**証拠 `evidence/phase5/stage_06_quiz_phase2/` (README/generate_result/ruleA_result)**。**ユーザー gate 待ち: (a) hardening 実施し pilot 再検証 [推奨] = ①ruleA-prep clean stem (済) ②generator/reviewer の figure-fidelity 強化 ③suspect 解説の誤誘導抑止 ④upstream stem 修正 (q034「あと」/q066 figure 再構成、要承認)→q034/q066 再生成→再 Rule A→scale gate / (b) 別方針**。**スケール手順 (hardening 後)**: 各回 `quiz-phase2-prep` → Workflow `quiz-phase2-generate.workflow` (args={exam_id,input_path,items}) → **生成結果を `.phase2/generate_result_<exam>.json` に永続化** → `quiz-phase2-merge` → `quiz-phase2-ruleA-prep <exam> 14` → Workflow `quiz-phase2-ruleA.workflow`。**起点ファイル**: scripts `quiz-phase2-{prep,generate.workflow,merge,ruleA-prep,ruleA.workflow}.mjs`、app `quizModel.ts`(QuizExplanationEntry/mergeExplanation/localizedExplanation)・`quizReader.ts`(loadExplanations)・`QuizSet.tsx`・`next.config.ts`。pilot サイドカー `data/ip/quiz/explanations/2025r07.json` は hardening 後に確定 (未 commit)。<br><br>**✅ Phase 1 (翻訳 backfill) = 完了 (翻訳済 29/29 回)**。**✅ Phase 2 前ゲート (図題答案KEY 体検、Session 97) = 完了: strict 坏键率 0/40、器具校正 OK、keys clean → Phase 2 GO。** 証拠 `evidence/phase5/stage_06_quiz_figkey_audit/`、再現スクリプト `scripts/audit-figkey-{manifest.mjs,workflow.mjs,run.generated.mjs}`。**ユーザー路由待ち: (a) Phase 2 GO [推奨] — 解析生成パイプラインに「各問の keyed answer を図から再導出できなければ flag」ガードを内蔵し残差≤22 をカバー / (b) 抽様 N≈80–120 拡張で事前上限を絞る / (c) 247 全 key sweep。** 新 backlog (非キー選択肢汚染、別 track、ユーザー判断): `2009h21h-q096` (choices_jp[イ] 別文変異+stem表garble)・`2025r07-q078` (choices_jp[ア] 1→2)・`2010h22h-q077` (ア/イ 説明文swap)。**`2013h25a-q052` は CLEAN 確定 (ウ=0.10、疑義除去)**。<br><br>S96 (最終 4 回) を含め全 29 回の三語翻訳 sidecar が `data/ip/quiz/translations/` に commit 済。(D-135: 解析も runtime AI 不使用の預生成 backfill)。**累積 上流 backlog (要ユーザー判断、翻訳成果物 zh/en に影響なし)**: S96 `2010h22h-q077` (choices_jp↔figure↔answer-key 反転、Stage 2 figure↔key 監査+possible re-key)・`q055` (choices_jp[エ] `$` 脱落)・`2009h21h-q099`/`2010h22a-q100` (stem が源に無い表を参照=Stage 2 データ欠落) + 既存 (S92 q001/q012/q096/q088 再OCR・q025/q018 glossary 職能別組織・q069 再OCR・`2019h31h-q061` figure crop ズレ)。<br><br>**🔑 (履歴) 路由词「Quiz Phase 1 续批」は Phase 1 完了 (29/29) により役目終了**。以下は当時のスケール手順 (参考保存)。<br><br>**🔑 路由词 (ユーザー合意、batch-by-batch スケール)**: ユーザーが新 session で **「Quiz Phase 1 续批」** (任意で回数指定) と言ったら = Phase 1 翻訳の**次の 1 バッチ**を実行する合図。手順: ① STATE+session-90 読了 ② 対象回を決定 (指定があればそれ、無ければ `data/ip/quiz/quiz_index.json` の exams[] から `data/ip/quiz/translations/*.json` 既訳を除いた**最新優先で 3〜5 回**、※既訳 22 回=2025r07(S87) + 2026r08/2024r06/2023r05(S88) + 2022r04/2021r03/2020r02o(S89) + 2019r01a/2019h31h/2018h30a(S90) + 2018h30h/2017h29a/2017h29h(S91) + 2016h28a/2016h28h/2015h27a(S92) + 2015h27h/2014h26a/2014h26h(S93) + 2013h25h/2013h25a/2012h24h(S94) + 2012h24a/2011h23a/2011h23tokubetsu(S95)、次候補=2010h22a/2010h22h/2009h21a/2009h21h、残=2009h21h/2009h21a/2010h22h/2010h22a) ③ 各回 `node scripts/quiz-phase1-prep.mjs <exam>` → 統合 input/items 構築 → Workflow `quiz-phase1-translate.workflow.mjs`(args={exam_id,input_path,items:[{id,has_figure}]}、統合 1 WF=D-小5) → `node scripts/quiz-phase1-merge.mjs <exam>` ×N → `node scripts/quiz-phase1-ruleA-prep.mjs <exam> 12` ×N → 統合 sidecar 構築 (+修復問は ruleA items に強制追加) → Workflow `quiz-phase1-ruleA.workflow.mjs` ④ 品質報告 (Rule A/D) + commit ⑤ 次バッチへ pause。Phase 0 commit=`0167626`、pilot=`56d0d5e`、S88=`b09b477`、S89=`19d28c2`。**D-小6 (フルページ併読) + D-小7 (repair 語義ガード) は scripts 組込済=追加作業不要**。<br><br>**Quiz Phase 1 進捗: 翻訳済 25/29 回 (S87 pilot + S88〜S95 各3回。Rule A: S89 36/36 / S90 38/38 / S91 37/37 / S92 40/40 [初の medium/high ゼロ] / S93 38/39 [q086 行12 転置是正] / S94 39/43 [q018 用語+q096 clean stem 是正、q052 は figure ハルシネーション誤 fix を REVERT] / S95 35/37 [q033 zh 用語+q002 注記除去(圆=figure 維持)+q073 ε→CR 是正、全 figure-faithful・独立 critic ACCEPT、REGRESSION なし])。残 4 回/400 問を batch-by-batch スケール (ユーザー合意)。要ユーザー判断 backlog (上流データ品質、翻訳成果物に影響なし、累積): **S94** q052/q092/q096 choices_jp は同 session で **corpus 是正済 (RESOLVED_IN_CORPUS)** / 残 `2012h24h-q018` glossary 職能別組織 / (S93 `2014h26a-q093`/`2014h26h-q088` choices_jp は同 session で corpus 是正済=RESOLVED) S92 `2016h28h-q001`/`q012`/`q096`・`2015h27a-q088` 再OCR + `2016h28a-q025` glossary 職能別組織 / S91以前 `2017h29h-q069` choices_jp イ/ウ 再OCR / `2019h31h-q061` figure crop ズレ (raw crop+webp 再裁剪=図管線 scope)。** スケール手順: 各回 `node scripts/quiz-phase1-prep.mjs <exam>` → Workflow `quiz-phase1-translate.workflow.mjs` (args={exam_id,input_path,items:[{id,has_figure}]}) → `node scripts/quiz-phase1-merge.mjs <exam>` → `node scripts/quiz-phase1-ruleA-prep.mjs <exam> 12` → Workflow `quiz-phase1-ruleA.workflow.mjs` (各回 Rule A)。全 29 回 exam_id は `data/ip/quiz/quiz_index.json` の exams[]。**起点ファイル**: `quizModel.ts`(三語+mergeTranslation/localizedStem/localizedChoices)・`quizReader.ts`(translations read時join)・`QuizSet.tsx`(locale三語)・`next.config.ts`(QUIZ_TRACE に translations/*.json)・scripts×5(prep/translate.workflow/merge/ruleA-prep/ruleA.workflow)。build-quiz-corpus 無改修。**既知 gap (backlog)**: clean-JP は translator 裁量で軽garble問に未生成あり/choices_jp JP ノイズ残存可 (zh/en clean)/q039 CONCERNS。Phase 2=解析預生成、Phase 3=教科書 unit 埋込。<br><br>**(S86 起点参考)** Quiz 接過去問 Phase 0 完了 (実装+Rule D APPROVE)。次 = ① commit 確認ゲート (解消済=`0167626`) ② Phase 1 (翻訳 backfill)。 Phase 0 産物: `scripts/build-quiz-corpus.mjs`(raw→派生 `data/ip/quiz/{quiz_index,questions}.json`)+`scripts/build-quiz-figures.mjs`(467→`apps/web/public/quiz-figures/*.webp`)+`apps/web/src/lib/quiz/{quizModel,quizReader}.ts`+`components/quiz/{QuizBrowser,QuizSet}.tsx`+`/[locale]/quiz/page.tsx`+i18n Quiz ns+next.config+middleware。**Phase 1 起点**: 翻訳管線 (2900×{zh,en} stem+choices、Stage-4 translate.workflow パターン=writer/reviewer/critic 別 subagent_type・各バッチ Rule A N-sample、派生 corpus 追記、stem garble も翻訳で自然 clean 化)。Phase 2=解析預生成、Phase 3=教科書 unit 埋込。backlog: glossary/tutor/chat 死語料移行 (各自サブ段階)、D-097 Basic-Auth stale コメント sweep (app 全体)、per-figure alt、63 小分類名翻訳 (S85 carryover)。<br><br>**(S85 完了起点参考)** 教科書: `apps/web/src/lib/textbook/reader.ts`(自己完結データ層)+ `components/textbook/{TextbookToc,UnitReader}.tsx`。**v1 実装の起点**: `apps/web/src/lib/textbook/reader.ts`(自己完結データ層・`buildNav(index,locale)`)+ `components/textbook/{TextbookToc,UnitReader}.tsx` + ルート `[locale]/textbook/{page,[unitId]/page}.tsx` + `next.config.ts`(tracing)+ `scripts/enrich-toc-i18n.mjs`(ToC i18n、再生成時 re-run)。任意 backlog: 63 小分類名翻訳(LLM+Rule A)、SVG content invariant のコード強制、`loader.ts` dead export 整理。証拠 `evidence/phase5/stage_06_reader_v1/`。<br>**Stage 4 学び (fix チェックリスト)**: ① 源文是正後の重訳は是正フィールドの忠実度を明示再確認 (汎用 reviewer は不変フィールドに anchor し塌缩を漏判しうる、S84 EC で実証) ② l10n/term 修正は summary.key_points/memory_hooks へ同期必須 (S82/S84 再発、構造検査が網兜) ③ workflow agentType は registry に合わせ全限定名 (`oh-my-claudecode:critic`/`code-reviewer`)。<br>残(非ブロック): low17題 / q065=answer ウ。Phase B scripts 全泛化・温存。 |

---

## Phase 5: 基于 IPA 官方源的 AI 教科書

### 方向 (D-108)

放弃教科書提取路线（Stage 8-11），转向 IPA 官方源 + AI 生成三语教科書。

| 数据源 | 版本 | 用途 |
|--------|------|------|
| シラバス | Ver.6.5 (2026-01-08) | 知識树骨架 |
| 過去問題 | FY2009~FY2026 (29回, 2900 題) | 题库 + 考点参考 |
| 試験要綱 | Ver.5.5 | 考试元信息 |
| IT用語集 | Ver.5.1 | 官方术語規範 |

### Stage 进度

| Stage | 内容 | Status |
|-------|------|--------|
| 1 | シラバス構造化提取 (Claude vision) | ✅ **Session 65 完成** |
| 2 | 過去問全量提取 (~2900 題) | ✅ **Session 66-67 完成** — 2,860題 (98.6%) |
| 2.5 | OCR 品質修復 + 全量 AI 審査 | ✅ **Session 68-69 完了** — P0-P3修復 + 29套全量AI審査 (935修正, 60題補録, 452図表更新) → 2,900題 29/29×100q |
| 2 補完 | ページマッピング + 図表裁剪 + 検証 + **FAIL修復** | ✅ **Session 70-71 完了** — 502図裁剪 → FAIL 96件を再推定で修復 (93修復+3降格) |
| 2.6 | **データ実測審核** (新視点+外部源で正確度を CI 付き実測) | ✅ **Session 72-73 完了** — 図表(単問16+共有図16群groups.json)+has_figure整合110+Phase C CI(critical 17/100, 母集団≈12%, answer_keys 100%) |
| 2.7 | **全量 stem/choices 源照合・修復** (Phase C 発見の garble≈12%除去) | ✅ **Session 74 完了** — 全2900スキャン→603候補→521修復(double-blind+3way, Rule A 95%)。再CI 残存≈5% |
| 2.7b | **hi-dpi/多ページ二次修復** (残存71フラグ) | ✅ **Session 75 完了 (D-125)** — 300dpi分帯+N/N+1+double-blind→71→10残存(0.34%)。confirmed 20/figure_inherent 15/cleared 28。Rule A監査 N=31(answer映射核験) |
| 3 | 知識マッピング (過去問 → シラバス节点) | ✅ **Session 76 完了 (G3, D-126)** — 2,900題 double-pass(95.9%一致)+tie-break+Rule A N=20(妥当率100%)。gap 0/63、enriched question_bank、invariant不変 |
| 3.5 | **後置クリーン** (low-conf 重判 + 語彙核心語補完) | ✅ **Session 77 完了 (D-127)** — 補词4 / 重判59(↑42低減: low59→17) / terms清洗17 / Rule A N=20(改判6是認, 補词4正[審計duplicate誤判をbackup証伪]) |
| 4 | AI 教科書生成 (三语详细讲解 + 图解) | ✅ **Session 84 完了** — 全量 **244/244 三語完成** (mgmt 23 + strategy 98 + tech 123)。S84 strategy 95: merge 95/95 → RuleA翻訳 N=18 (100% faithful, 0 med/high) → 三語ゲート (センシング l10n+summary同期 / EC 源文是正+重訳、**Rule D 漏判を独立critic補修**)。S83 tech 119 / S82 mgmt 18 / S81 schema OK / S80 ToC ゲート承認 |
| 5 | コードベース整理 | ✅ **Session 63 完成 (提前执行)** |
| 6 | Web App 数据統合 | 🔄 **S85: 教科書リーダー v1 完了** + **S86: Quiz Phase 0 完了** + **S87: Quiz Phase 1 (翻訳) pilot** + **S88〜S95: スケール バッチ ×8** (`2026r08`〜`2011h23tokubetsu` の最新 24 回、D-小6 フルページ併読 + D-小7 repair 語義ガード + D-小8 combiner 組込) (D-136、翻訳済 **29/29 回 = Phase 1 完了**・各 100/100 三語・Rule A S90 38/38・S91 37/37・S92 40/40・S93 38/39・S94 39/43 [q052 REGRESSION REVERT]・S95 35/37・**S96 50/52** [q092 figure 注記/q077 en gloss/**q002 REGRESSION→REVERT+corpus fix**、独立 critic ACCEPT]・Rule D 写審分離・nft IPA0、**残 0**。backlog: S94 q052/q092/q096 choices_jp は corpus 是正済 (RESOLVED) + q018 glossary / (S93 q093/q088 choices_jp は corpus 是正済=RESOLVED) S92 q001/q012/q096/q088 再OCR + q025 glossary / S91以前 q069 choices_jp 再OCR + `2019h31h-q061` figure crop ズレ=要ユーザー判断) — 教科書 244 unit 上線。Quiz: D-134(クリーン派生 `data/ip/quiz/` un-gitignore、IPA 条款で公開 OK・出典/改変明記)+D-135(JP-first 2 モード真題面、翻訳/解析は預生成 backfill)。**Phase 0 = 止血+地基 done**: 首页 500 治癒、quiz v1(2900 問/63 主題/29 回/467 figure WebP、出典・reveal)、vitest 446/build/nft IPA=0、Rule D APPROVE。残 Phase 1(翻訳)/2(解析)/3(教科書統合)。glossary/tutor/chat は死語料依存で 500(各自後続サブ段階)。D-133/D-134: 自作 `textbook/`+派生 `quiz/` のみ in-repo |

Plan: `docs/phase5/PLAN.md`

---

## 基础设施现状 (保留)

| 组件 | 状态 | 说明 |
|------|------|------|
| Next.js 15 app | ✅ 运行中 | `apps/web/` |
| AI Tutor | ✅ Phase 4 完成 | `/api/tutor` + DeepSeek V4 pro / Anthropic Sonnet 4.6 |
| Quiz 系统 | ✅ | Phase 2 QuizExplain + self-report |
| Glossary 系统 | ✅ | Phase 2 悬浮卡 |
| Chat 系统 | ✅ | Phase 2 `/api/chat` |
| i18n 三语 | ✅ | ja / zh / en via next-intl |
| Middleware firewall | ✅ | Basic Auth (D-097) |

---

## Session 63 重构变更摘要

### 新决策

| ID | 内容 |
|----|------|
| **D-110** | Phase 5 提取脚本统一使用 TypeScript，移除 Python 工具链（**D-132 精緻化**: LLM は Claude Code 経路、外部 Anthropic SDK/API は不使用; TS/JS は機械スクリプトのみ）|
| **D-111** | 保留 apps/web/ monorepo 结构，删除 packages/ |
| **D-112** | 历史文档激进归档 — Phase 1-3 session logs + Phase 1 ADRs → `docs/archive/` |
| **D-113** | Stage 5 清理提前到 Session 63 执行（不等 Stage 4） |

### 删除清单

- `packages/extractor/` — Phase 1 OCR pipeline (全部)
- `pyproject.toml` + `uv.lock` — Python 工具链配置
- `scripts/` 旧 Python 脚本 (stage9/10 等)
- `apps/web/src/app/[locale]/book/` — Book 路由 (含 chapter/[nn])
- `apps/web/src/components/Chapter*.tsx` / `Book*.tsx` / `SelectionToolbar.tsx` / `ParagraphTranslate.tsx`
- `apps/web/src/components/shells/*/GamifiedBook.tsx` / `RetroBook.tsx` / `TerminalBook.tsx`
- `apps/web/src/lib/book/` — chapterScope + progressStore 迁移到 `lib/data/`，translatePrompt 删除
- `apps/web/e2e/book.spec.ts`
- `apps/web/_fixtures/` — Phase 1 test fixtures

### 文档归档

- Session logs 1-52 + Phase 1 stage worksheets → `docs/archive/sessions/`
- Phase 1 ADRs (D-005 ~ D-081) → `docs/archive/decisions/`
- Phase 2/3/4 PLANs → `docs/archive/plans/`
- Release notes → `docs/archive/release-notes-legacy/`
- Validation → `docs/archive/validation/`

### 配置更新

- `.gitignore` — 精简，移除 Python 段落
- `CLAUDE.md` / `AGENTS.md` — 反映新结构
- `package.json` — 更新描述
- Nav 组件 — 移除 Book tab (3 themes)
- 首页重定向 — `/book` → `/quiz`

---

## 历史沿革 (Legacy Summary)

| Phase | 时间 | 内容 | Tag |
|-------|------|------|-----|
| Phase 1 | Sessions 1-26 | OCR + LLM content extraction pipeline | `phase1-ship-2026-05-19` |
| Phase 2 | Sessions 27-47 | Next.js web app (chat/quiz/glossary/AI) | `phase2-α-ship-2026-05-21` |
| Phase 3 | Sessions 48-52 | Book reader + progress tracking | `phase3-α-ship-2026-05-22` |
| Phase 4 | Sessions 53-58 | AI tutor (Module A-C done, D pending) | `phase4-α-ship-2026-05-23` |
| Stage 8-10 | Sessions 59-61 | 全书蓝图 + 内容重建 + 图片裁切 | **abandoned per D-108** |
| **Phase 5** | Session 62~ | **IPA 官方源 AI 教科書** | **current** |

### 决策历史

- D-001 ~ D-053: Phase 1 设计 + 实施 (archived)
- D-054 ~ D-093: Phase 2 设计 + 实施
- D-094 ~ D-101: Phase 3
- D-102 ~ D-107: Phase 4 + Stage 8-10
- D-108 ~ D-109: Phase 5 方向転換 + 数据目录
- **D-110 ~ D-113: Session 63 全量重构**
- **D-114 ~ D-118: Session 64 教科書設計（導航 + ユニット架构 + 記憶フック + 排列規則 + JSON Schema）**
- **D-119: Session 71 Stage 2.6 データ実測審核 + Stage 3 ゲート（分層審核 / 外部源許可 / 確実即修・曖昧帰档）**
- **D-120: Session 72 連問共有図「グループ共有図モデル」新設（group_id + groups メタ、sibling は複製せず参照）**
- **D-121: Session 72 duplicate_extraction 系統バグ確認（4件収束）+ 修復方針（PDF再抽出+answer_keys正答復元）+ choice_swap/choice_ocr 新類**
- **D-122: Session 73 Stage 2.7「全量 stem/choices 源照合・修復」新設（Phase C で stem garble≈12%・q085型内容不一致発見、answer_keys は100%健全）。Stage 3 ゲートに追加。**
- **D-123: Session 74 Stage 2.7 を多段パイプライン化（改良scan→scan先行ゲート→欠陥のみ独立検証→検証済のみ適用→再CI）。パイロットで単一パス検出＋即転写適用が不可信（ハルシネーション/プレースホルダ/group見逃し）と実証、却下。scan は印刷文を先に逐語転写。**
- **D-124: Session 74 Stage 2.7 検出を「Opus ブラインド転写→機械的diff」に確定。3パイロットで真因=モデルと実証（default explore は dense日本語OCR不可でエコー/ハルシネーション、Opus は既存173dpi画像で正確）。stored非開示でエコー不能、NFKC+バイグラム類似度で候補抽出（high recall、精度は検証段で担保）。**
- **D-125: Session 75 Stage 2.7b hi-dpi/多ページ二次パス方式を確定。300dpi分帯クロップ（整页高dpiは無効）+ ページN/N+1レンダ + double-blind(explore/code-reviewer) + bank規約正規化(問NN/〔分類〕/図ブロック剥離) + figure_inherent明示分類 + Rule A逐字監査(答案字母映射核験)。残71→10(0.34%)、全answer保存。教訓: NFKC+strip類似度は句読点/記号に盲目→独立逐字監査が機械の盲点を埋める。**
- **D-126: Session 75 Stage 3 知識マッピング設計を確定（ユーザー問答）。二層粒度(小分類primary + 用語tags) / 基数 primary+secondary[](1主+0〜2関連) / 検証=双盲(異subagent_type)+coverage分析。syllabus_refs を `[]`→{primary_topic, secondary_topics[], terms[], confidence, mapping_status} に。invariants 不変。実装は G3。ADR: `D-126-stage-3-knowledge-mapping-design.md`。**
- **D-128〜132: Session 78 Stage 4 (AI 教科書生成) 実行設計を確定。D-128 二段式生成(Phase A 規劃→ToCゲート→Phase B 内容)+pilot-first(3跨類節点)。D-129 全工程 Opus、三語=日語権威源→二次翻訳。D-130 per-topic LLM 規劃 pass(概念依存+頻度)→廉価 ToC ゲート。D-131 即時チェック=term題池/チャレンジ=節点抽样・頻度=題数分位・難度は捏造せず(年度+term跨度)・図解二軌(Mermaid新図 + Stage2原裁剪図を `figure_index.json` 索引附加し溯源)。規模更正(330〜530→~180〜240 unit)。 D-132 実行チャネル: 全 LLM 工作は Claude Code(subagents/Workflow/ultracode, `model=opus`)で実行、外部 Anthropic API/Message Batches API 不使用(ユーザー Max plan・定額; D-128-C Batches 案撤回, D-129 effort は Claude Code 構成, D-110 SDK 条項を精緻化)。ADR: `D-128〜132-*.md`。**
- **D-134〜135: Session 86 Quiz 接過去問サブ段階 設計(D-019)。D-134 配信: raw `question_bank.json`/`pages`(762M)/`figures`(109M) は gitignored 維持、クリーン派生 `data/ip/quiz/`(projection 済 field + 出典 + 最適化 figure 467 + 後段の翻訳/解析)を un-gitignore。IPA 公式 FAQ で過去問は教育利用許諾・使用料不要(出典明記+改変明記が条件、著作権非放棄)→ 公開 repo OK、D-133 著作権顧慮を解消。raw を晒さないのは内部 cruft(`*_corrupted_backup`/`s027_*`)+破損 OCR backup+容量回避。D-135 架構: v1=JP-first 真題練習面(JP stem/choices+正解+出典、2 モード=syllabus 主題別[教科書 unit 埋込]+試験年度別、figure 問含む、自前 `lib/quiz/quizReader.ts`=S85 reader 踏襲)。翻訳(2900×{zh,en})+解析(2900× 三語)は預生成・バッチ・各バッチ Rule A・増量 backfill(Stage-4/D-119 パターン、Workflow+opus、D-132 で外部 API 不使用)、runtime AI ではない。却下: raw as-is un-gitignore/全 gitignored+deploy 注入/私有 blob/live AI explain/全翻訳後一括上線。ADR: `D-134-quiz-data-distribution.md`/`D-135-quiz-substage-architecture.md`。Phase 0(止血+地基)実施は GO 待ち。**<br>- **D-133: Session 85 Stage 6 起動。自作教科書データ `data/ip/textbook/`(25M)のみ gitignore 解除して in-repo 化、IPA 由来(`exams/` 1.2G・`sources/` 168M・`syllabus/`)は著作権+容量で gitignored 維持。ユーザー前提「都是自己写的」は textbook のみに該当(実測で食い違いを surface)、AskUserQuestion で「只 textbook/」確認。unit の IPA 由来参照(inline_quiz/challenge=question_bank ID、source_figures=exam PNG)は v1 で繰延・loader は null 降級。D-050/D-109 の Release-only モデルを IPA 由来に限定する精緻化。却下: 全 un-gitignore(著作権暴露+20倍肥大) / `TEXTBOOK_DATA_ROOT` 直読(生産で不成立) / quiz-id manifest 先行(YAGNI)。ADR: `D-133-textbook-data-in-repo.md`。**
- **D-127: Session 77 Stage 3.5「Stage 3 後置クリーン」を新設（ユーザー選択、G4 前置の任意品質クリーン）。3.5a low-conf 59題を Opus+figure で跨段高精度重判（昇格可なら confidence↑、依然 low は入档、subagent_type 既存4段と相異=Rule D）。3.5b 語彙ギャップ19語を甄别し核心考点語4のみ knowledge_tree へ補完（サービスデスク/セキュリティパッチ/アジャイル/組込みシステム、仮想サーバ等は不補、term 1413→1417 文字列級挿入）。term計数 1413 は総出現数で正(当初「1391修正」案は Set去重の誤判定で撤回)。invariants 不変、バックアップ `.pre-s035`、Rule A/B/D 適用。ADR: `D-127-stage-3.5-post-mapping-cleanup.md`。**

---

## Session 64 新决策

| ID | 内容 |
|----|------|
| **D-114** | 学習路径組織方式 — 双軌導航：シラバス官方树为主导航 + テクノロジ→マネジメント→ストラテジ 推荐路径 |
| **D-115** | 学習ユニット内容架构 — 5~8 用語/~15 min 为原子单位，四段结构（概要→用語講解→まとめ→チャレンジ），深度嵌入即時チェック + AI Tutor |
| **D-116** | 記憶フック「○○といえば××」为每个用語的标准配置 |
| **D-117** | ユニット内用語排列 — 概念依赖优先 + 出題頻度辅助排序 |
| **D-118** | Stage 4 输出 JSON Schema — unit_index.json + units/{id}.json，Quiz 引用不内嵌，三语 `_jp/_zh/_en` 平铺 |

---

## Session 65 Stage 1 完成

### 产出物

| 文件 | 大小 | 内容 |
|------|------|------|
| `data/ip/syllabus/knowledge_tree.json` | 67 KB | 完整シラバス树: 3 categories / 9 大分類 / 23 中分類 / 63 topics / **1,413 用語** |
| `data/ip/syllabus/exam_meta.json` | 1.2 KB | IT Passport 考试元信息 (120分/100問/IRT/合格基準) |
| `data/ip/syllabus/official_glossary.json` | 1.6 KB | 考试用語規約 (記号/言語/表計算仕様) |

### Rule A 审核

N=10 独立抽检 (code-reviewer agent)，**10/10 PASS**。证据: `evidence/phase5/stage_01_audit.md`

---

## Session 66 Stage 2 過去問全量提取

### 产出物

| 文件 | 大小 | 内容 |
|------|------|------|
| `data/ip/exams/question_bank.json` | 2.3 MB | 29回統合: **2,677 題** (stem + choices + answer) |
| `data/ip/exams/answer_keys.json` | 57 KB | 29回 × 100 = **2,900 解答** (100% 正確) |
| `data/ip/exams/by_year/*.json` | 29 files | 年度別 JSON |
| `scripts/ocr-extract-questions.mjs` | — | Tesseract OCR 提取スクリプト |

### 提取統計 (final)

- 29 回試験: FY2009～FY2026 (58 PDF ダウンロード)
- **2,860 / 2,900 題抽出 (98.6%)**
- 解答正確率: 99.9% (2,858/2,860)
- **選択肢完全率: 100% (空選択肢ゼロ)**
- question_bank.json: 2.7 MB

### 提取方法

1. Tesseract OCR (v4, 4回のパーサ改善) → 題幹+解答の基盤データ
2. Claude vision (7並列 agent) → 564 空選択肢を PDF 視覚読取りで補完

証拠: `evidence/phase5/stage_02_audit.md`

---

## Session 68 Stage 2 OCR 品質修復

### 修復統計

| 修復類型 | 数量 |
|---------|------|
| P3 改行+ノイズ | 2,023 |
| P2 文字置換 (TIT→IT, 0SS→OSS, サーパ→サーバ 等) | 763 |
| P1 選択肢溢出切断 | 27 |
| P0 偽Q100/幽霊Q109 削除 | 20 |
| P0 Q1題幹 Claude vision 再抽出 | 13 |
| **合計** | **2,846** |

修復後: 2,840 題、切断題幹 0、幽霊題号 0、空答案 0、P2 残留 0

### 全量 AI 審査方案 (Session 69 で実行)

- 29 套 PDF → 画像変換 + ページマッピング
- 每套 5 分片 (10 ページ/片)、6 並行 agent
- 逐題: 画像 vs JSON 対照 → PASS / FIX
- 図表題: figure_description 追記
- 独立 reviewer 校験 (Rule D)

### 残存課題

- 数字 0↔9 誤認識: ~30+ (計算題に集中)
- 題幹-選択肢不整合: ~14 (2015h27h, 2022r04)
- 欠落問題: ~42 (図表題が主)
- 試験説明残留: 3

### 成果物

| ファイル | 内容 |
|---------|------|
| `scripts/fix-ocr-quality.mjs` | P2+P3+P1 一括修正 |
| `scripts/fix-p0-cleanup.mjs` | 偽Q100/幽霊Q109 除去 |
| `scripts/fix-p0-q1-patch.mjs` | Q1 vision パッチ |
| `evidence/phase5/stage_02_fix_report.md` | 修復証拠 |

---

## Session 69 Stage 2.5 全量 AI 審査完了

### 審査統計

| 指標 | 数値 |
|------|------|
| PDF 画像変換 | 29 PDF → 1,450 ページ PNG |
| 審査対象 | 3,038 題次 (29 agent 並行) |
| PASS | 1,784 (58.7%) |
| FIX 適用 | 935 件 |
| 欠落題補録 | 60 題 |
| 図表更新 | 452 件 |

### 修復後データ品質

| 指標 | 修復前 | 修復後 |
|------|--------|--------|
| 総題数 | 2,840 | **2,900** |
| 100題/套 | 0/29 | **29/29** |
| 空題幹 | 13 | **0** |
| 欠損選択肢 | 若干 | **0** |
| has_figure | ~220 | **358** |
| figure_description | ~0 | **266** |

### Rule D 独立審査

N=15 抽検 (code-reviewer agent, executor とは別): **12/15 PASS → CONDITIONAL PASS**
- 3 件の修正指摘を手動適用済
- 証拠: `evidence/phase5/stage_02_ai_review_audit.md`

### 成果物

| ファイル | 内容 |
|---------|------|
| `data/ip/exams/pages/` | 1,450 PNG |
| `data/ip/exams/reviews/*.json` | 29 審査レポート |
| `data/ip/exams/by_year/*.json` | 29 修正済 JSON (各 100 題) |
| `data/ip/exams/question_bank.json` | 統合 2,900 題 |
| `scripts/apply-ai-review.mjs` | AI 審査修正適用スクリプト |

---

## Session 70 Stage 2 補完

### 実施内容

1. **データ品質修正**: 空答案 28 題を `answer_keys.json` から回填 + 2025r07-q026 手動修正
2. **全量ページマッピング**: 二重チャネル（Tesseract OCR + Claude Vision 29 agent）→ 95.8% 一致率、Vision 採用
3. **図表裁剪**: 502 枚を bbox 座標で裁剪 → `data/ip/exams/figures/`
4. **JSON 回写**: 2,900 題に `source` (ページ溯源) + 493 題に `figure_path` / `figure_bbox_pct` / `figure_type`
5. **全量検証**: 502 枚全数を 13 バッチ agent で目視検証 → 400 PASS / 102 FAIL (20.3%)

### 成果物

| ファイル | 内容 |
|---------|------|
| `data/ip/exams/mappings/*_pages.json` | OCR マッピング (29 套) |
| `data/ip/exams/mappings/*_vision.json` | Vision マッピング (29 套) |
| `data/ip/exams/mappings/final/*.json` | merge 済最終マッピング (29 套) |
| `data/ip/exams/figures/*.png` | 裁剪済図表 (502 枚) |
| `data/ip/exams/figures/_all_fails.json` | 検証 FAIL 一覧 (102 件) |
| `scripts/build-page-mapping.py` | Tesseract OCR マッピング |
| `scripts/compare-and-merge-mappings.mjs` | 二重チャネル比対 |
| `scripts/crop-and-update.mjs` | 裁剪 + JSON 回写 |

---

## Session 71 Stage 2 補完完了（図表 FAIL 修復）

### 実施内容

1. **FAIL 計数調和 (Item 1)**: `_all_fails.json` の `total_fail:102` は誤り。`fails` 配列 97 件のうち 1 件重複 → **真の唯一 FAIL = 96 件**。証拠: `evidence/phase5/stage_02_fail_reconciliation.md` + canonical 清单 `figures/_fails_canonical.json`。
2. **Session 70 成果のコミット (Item 2)**: commit `7f85ca9`（STATE + session-70 ログ + 4 スクリプト）。
3. **図表 96 件修復 (Item 3)**: 主ループ編成 + workflow 並列ビジョンの多ラウンド方式。**93 修復 + 3 降格、未解決 0**。
   - ラウンド 1-3: ESTIMATE(general-purpose) → 確定的裁剪 → VERIFY(explore, Rule D) → loop-until-dry。86 件が自動収束。
   - 手動 7 件: 跨ページ誤マッピング 2 (q097→p42, q061→p24)、位置誤認 2 (q069, q008)、表頭截断 3 (q011, q026, q072)。
   - 降格 3 件: q063 / q090 / q029（真の図表なし、独立確認済）。
   - Rule A/D 最終監査 (code-reviewer, N=15): 14 PASS + 1 → q026 の **stem 汚染バグ**を発見し訂正（図表は正しかった）。
   - 証拠: `evidence/phase5/stage_02_figure_repair.md` + `audit_results_figure_repair.json`。

### データ最終状態

総 2,900 題 / 空答案 0 / figure_repaired 96 / has_figure(path付) 修復済。旧図 96 + 降格 3 を `figures/_rejected/` に温存 (Rule B)。

---

## Next (Session 72) — Stage 2.6 データ実測審核を実行

**Stage 3 の前に Stage 2.6 を完了させる**（D-119 ゲート）。ユーザー指示: 「遺留項ゼロまで実測してから Stage 3」。

実行仕様: **`docs/phase5/STAGE_2.6_AUDIT_PLAN.md`**（決定根拠 `docs/decisions/D-119-stage-2.6-data-audit.md`）。

要点:
1. **全量センサス**（L3 跨题汚染 / L4 図文引用 / L6 答案分布）を全 2,900 題に → フラグ triage。
2. **抽样深核**（L1 再解答逆検査 / L2 跨字段整合 / L5 数字 / L-ext 外部源交叉）を N≈100 層化 + 既知シードで → loop-until-no-new-class。
3. 欠陥は D-119 方針（確実→即時修+backup / 曖昧→帰档）。
4. ゲート 4 条件充足 → **Stage 3 開始**。

**既知シード**: has_figure 孤児 16 (`data/ip/exams/.tmp/repair/orphan_has_figure_no_path.json`) / 題幹-選択肢不整合 ~14 (@2015h27h,2022r04) / 0↔9 数字誤識 ~30 / q026 型 stem 汚染。
