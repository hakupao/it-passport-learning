# Quiz Phase 1.6 (D-139-B) — 全量 key+choices 盲推審計 結果 (Session 99)

> 2026-06-21 / 路由词「Phase 1.6 全量」。図題 **467 全数** を blind 盲推 (stored key 非開示) → key 比対 → bad-key 候補を **写審分離 3 パス** (deriver=general-purpose ≠ verifier=critic ×3 ≠ 裁決=主 context 高倍率実読) で裁決。
> 母集団: questions.json の `has_figure && figure` = 467 (29 回)。pilot 34 (S98) + 本 session 433 = 467/467 盲推完了。

## 実行
- **Phase A 盲推 (deriver=general-purpose opus, figure_png + figure_page_png 両読)**:
  - run1 `wf_1a4c4ae8-d6f`: 433 中 383 done (session limit 17:00 JST 直撃で 50 fail) — result_<id>.json 落盘で部分確定。
  - run2 `wf_0afb93da-238` (skip-existing で残 45): 45/45 done (全 high)。
  - **合計 467/467 盲推完了** (high 463 / medium 2 / low 2)。
- **compare** (`quiz-keyaudit-compare.mjs`, derived vs questions.json key): bad-key 候補 **5** / choices_faithful=false **28** / underivable **3**。
- **Phase B 検証 (verifier=oh-my-claudecode:critic ×3/候補, blind=key も deriver 答も非開示)** `wf_491d0f03-4dd`: 5 候補 ×3 = 15/15。
- **裁決 (主 context, sips crop+4〜6x 実読)**: S98 教訓「低解像度初読は誤判」に従い全 5 候補の figure を per-panel/per-cell 拡大実読。

## bad-key 候補 5 件の裁決 (各 5 独立パス: 3 critic + deriver + 主 context)

| id | type | key | derived | critic×3 | 主 context | 裁決 |
|---|---|---|---|---|---|---|
| **2009h21a-q012** | 順序図 | ア | ウ | ウ/ウ/ウ (全 unique) | ウ | 🔴 **BAD KEY → ウ** (5/5 一致) |
| **2010h22a-q091** | 網羅性 (出力結果表) | ア | エ | エ/エ/エ (全 unique) | エ | 🔴 **BAD KEY → エ** (5/5 一致) |
| 2009h21h-q096 | 積み上げグラフ | ア | イ | イ/ア/イ (**全 non-unique**) | ア figure-true | ✅ key OK (曖昧問) |
| 2012h24h-q091 | テストデータ b/c | ウ | エ | ウ/エ/ウ (majority ウ) | ウ | ✅ key OK |
| 2014h26h-q090 | 製造原価グラフ | ウ | ア | イ/ウ/ウ (majority ウ) | ウ | ✅ key OK (deriver 低解像度誤読) |

### 🔴 確定 bad key 1: 2009h21a-q012 (ア → ウ)
- 図 = ①→②→③→④→**実行計画策定** の直列 (箱は番号のみ、選択肢 ア〜エ を順序付け)。
- 確定論拠: 最終枠が「実行計画策定」⇒ ④ にはその基礎となる『ビジネス戦略の立案』(ウ) 以外入りえない (戦略を立案→実行計画を作成)。CSF 抽出 (ア) は環境分析の後・戦略立案の前 = ③。標準順序 ①ビジョン設定(エ)→②環境分析(イ)→③CSF抽出(ア)→④戦略立案(ウ)。
- 5/5 独立一致 (critic 3 全 high+unique, deriver, 主 context)。**Phase 1.5 零成本筛査 (writer が key=ア に追従) も S97 figkey 抽様も漏らした → 盲推のみ捕捉**。

### 🔴 確定 bad key 2: 2010h22a-q091 (ア → エ)
- 図 (表2 出力結果表) = 地区(A/B/C/D=4) × 3辺計(80/100/140まで=3) × 重量(5/10/20まで=3) = **4×3×3=36 列の完全列挙** (列見出し 1〜36、オドメータ式に全組合せ)。
- 確定論拠: 36 全組合せ網羅 = エ「要件から考えられるケースを網羅…すべてのケースを漏れなくテスト」と逐語一致。ア (エラー推測=誤りが起こりそうなケースの選択的抽出) は全数グリッドと矛盾、ウ (高頻度のみ少データ) は逆、イ (命令実行順追跡=ホワイトボックス) は入力組合せ表と無関係。
- 5/5 独立一致 (critic 3 全 high+unique, deriver, 主 context)。**S97 figkey 抽様 (この回は抽様外)・Phase 1.5 零成本筛査ともに漏らした net-new 発見**。

### ✅ deriver 偽陽性 3 件 (key 正、裁決で是正回避) — 写審分離の価値
- **2014h26h-q090** (D-139 で「疑い 1」として事前登録): deriver=ア だが **主 context 高倍率 + critic pixel 計測**で図 ア は破線切片が 2,000 より +23px 高い (=固定費増、不正解)。**ウ のみ**が実線・破線とも切片 2,000 同一 + 破線が急傾き直線 (=部品J 値上がり→変動費=傾き増、固定費=切片不変) で正。部品 J は 1 台ごとの仕入部品ゆえ傾きのみ増。**key ウ 正。deriver の低解像度誤読 (S98 と同型)**。
- **2012h24h-q091**: deriver=エ (c=No.4) だが **No.4=コースR はテキスト代請求なし**ゆえ「欠席時にテキスト代が請求されない」を検証できない。No.2=欠席+コースQ (テキスト代有) のみ検証可 → **c=2 = key ウ 正**。critic majority + 主 context 一致。
- **2009h21h-q096**: deriver=イ・key=ア。**図実値 (主 context 6x 実読: 10〜14[20代15/30代25/40代75/50代44]) で ア・イ 双方 figure-true** (ア: 30代 25→75=+200% < 40代 53→220=+315%、イ: 40代 が 14〜18→18〜22 で最大率)。critic 3 全 **unique=false**。図が key ア を**矛盾しない** (ア は真) ため strict 定義で bad key 非該当。**曖昧問 (ア・イ 二重正解) + stem_jp_clean 表は別途腐敗** → 是正せず backlog。

## choices_faithful=false 28 件 (choices↔figure 腐敗、**key は別軸・本 sweep で是正せず**)
全 28 件は deriver が figure とテキスト不一致を検出 (詳細 `full_sweep_compare.txt`)。代表:
- 値/区切り腐敗: q036(2.000→2,000)/q005(1.500→1,500)/q012(86→B6 セル参照)/q012(13,000→12,000) 等。
- 選択肢 swap/取り違え: 2024r06-q057 (c/d 逆転、字母取り違えの危険)・2017h29a-q092 (R/W/X ○− 腐敗)・2018h30h-q081 (顧客名→顧客番号) 等。
- 別問混入: 2011h23tokubetsu-q099 (サイト構成図→不等式)・2010h22a-q097 (番号著しく腐敗)。
- 全 28: 2009h21a-q036, 2010h22a-q061/q064/q066/q097, 2010h22h-q005/q077/q079, 2011h23a-q089, 2011h23tokubetsu-q070/q099, 2012h24a-q023, 2012h24h-q100, 2013h25h-q068, 2014h26h-q087/q090, 2016h28h-q001/q012/q080/q096, 2017h29a-q092, 2017h29h-q069, 2018h30h-q081, 2019r01a-q099, 2020r02o-q011, 2024r06-q057/q081, 2025r07-q078。
- → **choices-fidelity 是正トラック (別 track、ユーザー判断)**。key 不変。

## underivable 3 件 (incomplete-source 疑い)
- 2010h22a-q094 (low conf)・2012h24h-q087・2015h27a-q100 → 図/源不足で盲推不能。**Phase 2 で要追加対応 or 源再OCR** (backlog)。

## 結論
- **確定 bad key = 2 件** (`2009h21a-q012` ア→ウ / `2010h22a-q091` ア→エ)。いずれも 5 独立パス一致・確定的 (順序論理 / 36 全列挙)。
- deriver 偽陽性 3 件は写審分離 (critic + 主 context 高倍率) で是正回避 = **本審計の核心価値** (盲推 deriver の over-flag を独立検証が網兜)。
- choices 腐敗 28 + underivable 3 は key と別軸 → backlog (key 不変)。
- **figkey 全数化の意義実証**: S97 抽様 40/247 (bad key 0/40) が見逃した bad key を全数 sweep が 2 件捕捉。

## 是正方式 (ユーザー承認後、D-139-A 同方式 drift-proof)
raw bank `data/ip/exams/question_bank.json` (gitignored) の correct_answer を現値 assert 付きで編集 → `build-quiz-corpus.mjs` 再生成 → questions.json の correct_answer **2 件のみ** 変更 (stem/choices/quiz_index/translations 不変)。検証 tsc/eslint/vitest/build/nft GREEN。

---

## choices-fidelity track (Session 99、ユーザー「別開 track」→「phase2 前に全部做完」で同 session 実行)

choices_faithful=false 28 件 + underivable 3 件を写審分離で処理。

### パイプライン (写審分離 3 パス: deriver→proposer→critic)
1. **prep** `quiz-choicesfix-prep.mjs` → 28+3 の blind 入力 (現 choices + figure + deriver_issues 参考のみ)。
2. **Phase A proposer** `quiz-choicesfix.run.generated.mjs` (general-purpose、原典フルページから ア〜エ を独立逐字転写 → 修正案 + answer-affecting 判定): 31/31。**needs_fix 28 / 偽陽性 0** (key 審計では deriver 偽陽性 3/5 だったが choices flag は全真)。answer-affecting 18。
3. **Phase B critic verify** `quiz-choicesverify.run.generated.mjs` (oh-my-claudecode:critic、提案を図から独立再読 + key 整合確認): 28/28 = **APPROVE 27 / APPROVE_WITH_EDIT 1 (q087) / DISPUTE 0 / key 破れ 0**。
4. **主 context spot-check** (q057 swap / q099 別問混入 / q096 LIKE): zh/en も corrected_jp に忠実を確認 (Rule A)。

### jp 是正 (drift-proof)
`quiz-choicesfix-apply.mjs` (現値 assert、74 letter 変更) → raw bank → `build-quiz-corpus.mjs`。
**questions.json diff = choices 74 letter のみ (74+/74−)、correct_answer 0 変更 (keys invariant、git diff 確証)**。28 問。代表: 区切り/値腐敗 (1000→1,000・2.000→2,000・13,000→12,000・10−86→10−B6)、選択肢 swap (q057 c/d・q077 グラフ高低)、別問混入 (q099 不等式→サイト構成図)、表構造 (q081/q069/q092/q023)、数値 (q089 3→2・q001 16→10時間)。

### zh/en 再同期 (translations sidecar)
key 観察: 数値選択肢の zh/en は Phase 1 vision 翻訳で**既に figure 正** (例 q036 jp は OCR で "1000"/"2.000" 腐敗だが zh/en は "1,000"/"2,000")→ jp 修正で三語一致。テキスト/表選択肢の zh/en は**腐敗 jp を訳していた** (例 q057 zh c:快/d:慢) → 要是正。
`quiz-choicestr.run.generated.mjs` (general-purpose、変更字母のみ corrected_jp から再訳、現訳が正なら踏襲) 28/28 → **43 letter で現訳是正、残は数値/式で踏襲** → `quiz-choicestr-merge.mjs` で 13 sidecar 更新 (84+/84−)。

### underivable 3 件 triage
- `2010h22a-q094`: answerable=**false** (「形式1」の書式定義が page-40 に無し) → incomplete-source、Phase 2 / 源再OCR backlog。
- `2012h24h-q087`: answerable=**true** (表4/表5 から a∈{4,5} 導出可、deriver が見落とし)。問題なし。
- `2015h27a-q100`: answerable=**false** (HDD 容量/台数が page-47 に無く time=容量÷速度 不能、key=イ140 を導く源欠落) → incomplete-source、Phase 2 / 源再OCR backlog。

### 検証 (全 GREEN)
tsc 0 / eslint 0err (既存 warning 1) / **vitest 463** / build exit 0 / nft IPA leak 0 / 構造 (28 問 jp/zh/en 全非空)。

### 結論
- **choices 腐敗 28 件 = jp + zh/en 三語是正済** (figure-faithful、key invariant)。
- **underivable = 2 件が真の incomplete-source** (q094/q100-2015h27a → Phase 2 backlog)、1 件は解答可。
- choices flag は deriver 偽陽性 0 (key flag と対照的)。Phase 2 の choices 起因「自信のある誤り」リスク解消。
