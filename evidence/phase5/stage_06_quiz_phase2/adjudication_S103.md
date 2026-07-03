# S103 adjudication — Phase 2 scale batch (2022r04 / 2021r03)

主 context 源実読裁決の記録 (q052 protocol: sharp crop + 高倍率、数字は 3–5x 必須)。
Rule A 結果は `ruleA_result_S103_<exam>.json` を参照。

## 2022r04

generate `wf_a49fa8eb-6a8` (411 agent / 11.7M tok): 100/100, jp PASS 100, tr PASS 97 / CONCERNS 3。
merge: suspect 1 (q021)・stem-corruption 3 (q039/q091/q092、全て answer_affecting=false)。

### q021 — benign over-flag (不動)
- key_guard: figure_derivable=false (概念問「人間中心のAI社会原則」、外部知識必要)、derived=key=イ 一致、stem_corruption_suspected=false。
- S102 q058/q097 と同型の保守的 over-flag。解説は stored key 前提で正常生成済 → 不動。

### q039 エ — trailing OCR junk (是正)
- raw: 「文字の代わりに自分で作成したアイコンも利用可能である。**の 18 ey**」
- 源 (page-18 実読): 選択肢は「…利用可能である。」で終端。「の 18 ey」= 頁脚「— 18 —」の OCR 混入。
- 是正: strip (stemfix-S103)。key ア 不変 (エ は distractor)。zh/en 既正 (訳者は junk を無視)。
- 解説可視フィールドへの junk 混入なし (key_guard.note_jp の言及は腐敗の正当な記述 = 保持)。

### q091 エ — glyph 重複 + trailing junk (是正 ×2)
- raw: 「バッファを**あぶふれ**させ, 不正にプログラムを実行させる。**王 4 ご**」
- 源 (page-41 + 3x crop 実読): 「バッファを**あふれ**させ，不正にプログラムを実行させる。」で終端。
- 是正: 「あぶふれ→あふれ」+「王 4 ご」strip (stemfix-S103)。key イ 不変。zh/en 既正 (缓冲区溢出 / buffer overflow)。

### q092 ウ — 数字 OCR 誤読 3.0→3.6 (是正、zh/en 伝播あり)
- raw: 「従来の規格であるBluetooth **3.6**以前と互換性がある。」
- 源 (page-42 + **5x crop** 実読、S102 q075 教訓=数字は高倍率必須): 「Bluetooth **3.0**以前」— 小数点後は丸い 0 を確認。Bluetooth 3.6 という版は実在しない。
- 是正: raw bank 3.6→3.0 (stemfix-S103) + **zh/en も 3.6 を継承していたため trfix-S103 (choices.ウ.zh / choices.ウ.en) で是正**。key イ 不変 (ウ は「互換性がある」の点でどのみち誤り: BLE は Classic BT と非互換)。
- **解説 stale 注記清理**: 生成解説 distractor ウ (三語) が「※選択肢の 3.6 は表記腐敗で正しくは 3.0…」の注記を含んでいた。選択肢是正後は利用者に見えない値への言及になるため、.phase2 expl_jp/expl_tr を assert-once patch → re-merge。清理後の三語は「BLE は物理層・プロトコルが異なり互換性はない」で完結。

### invariants (git 確証)
- questions.json diff = 3 行 (q039 エ / q091 エ / q092 ウ、全て choice 値)。
- correct_answer 0 変更、quiz_index 不変。
- translations/2022r04.json = 2 フィールド (q092 ウ zh/en)。
- scripts: 新 `quiz-phase2-stemfix-S103.mjs` / 新 `quiz-phase2-trfix-S103.mjs` (choices.<letter>.<lang> 対応拡張)。

### Rule A
- N=26 = 全16図 + suspect q021 + 是正済 q039/q091/q092 (q091/q092 は prep N=24 に手動追加) + plain。
- run `wf_00b0ca9e-a00` → 結果は `ruleA_result_S103_2022r04.json`。

## 2021r03

generate `wf_d5a1ff7b-305` (419 agent / 11.9M tok): 100/100, jp PASS 99/CONCERNS 1, tr PASS 98/CONCERNS 2。
merge: suspect 4 (q036/q038/q039/q049)・stem-corruption 2 (q036* answer-affecting / q095)。

### q036 — ANSWER-AFFECTING 三重 0→9 数字腐敗 (是正、全層伝播)
- **key-guard が設計意図どおり捕捉**: generator が literal stem (19か月/1,900万円/49%) の算術破綻を検出 — EAC=600÷0.49≈1,224万 < 予算1,900万 で「予算超過はいくらか」が成立せず、全選択肢と不整合 → derived=unsure・matches_key=false で人間裁決へ回付。
- **主 context 源実読 (page-17 全頁 + 4x crop)**: 源 = 開発期間 **10** か月 / 人件費予算 **1,000** 万円 / 全体の **40**% を確定 (「10」の 0、「1,000」の三つの 0、「40」の 0 いずれも丸い 0 を高倍率で確認)。
- **検算 (答案整合)**: EAC = 600 ÷ 0.40 = 1,500万、超過 = 1,500 − 1,000 = **500万円 = エ = stored key**。腐敗前の値で問題が内部整合する唯一の読み。
- **伝播**: raw stem_jp + stem_jp_clean + zh (19 个月/1,900 万日元/49%) + en (19 months/19,000,000 yen/49%) の全層。Phase 1 訳者は腐敗数値を忠実に継承していた (S102 q004 と同型、数値腐敗は訳者が「見穿」できない)。
- **是正**: stemfix-S103 (raw stem 3 置換) + trfix-S103 (stem_jp_clean 3 + stem.zh 3 + stem.en 3 = 9 フィールド)。key エ 不変。
- **解説**: generator は正値 (1,000万/40% → 500万=エ) で解説本文を執筆済 → 可視フィールドに stale 参照 0 (プログラム確認)。key_guard.note_jp の腐敗記述は正当な歴史記録として保持。

### q005 エ — OCR 台→馬 (是正)
- raw: 「複数**馬**のコンピュータ」。源 (page-03 実読): 「複数**台**のコンピュータ」。
- generator が note_jp で申告 (stem_corruption_suspected=false の distractor cosmetic 扱い) → 主 context が拾って是正。key ウ 不変。zh/en 既正 (多台 / multiple computers)。

### q095 — S89 遺留疑義の解消 (不動)
- S89 記録「公式 answer key と critic 再計算の食い違い」→ 本 batch key-guard は **derived=ウ=stored key 一致** (5月内絞込 → 商品別合計 A=2,000×9=18,000 / B=4,000×6=24,000 / C=7,000×3=21,000 → ≥20,000 は B・C の 2 つ = ウ)。
- stem-corruption flag は **raw のみ** (売上番号 200003→Z00003 系 garble)。表示 stem_jp_clean は figure と完全一致で既正 (in-pipeline reviewer PASS も確認) → **不動** (S101 前例: 表示は stem_jp_clean [quizModel:117])。

### q038 / q039 / q049 — benign over-flag (不動)
- いずれも figure_derivable=false の概念問で derived=stored key 一致 (イ/エ/ウ)。S102 q058/q097 同型。
- q038: raw stem の選択肢表に行ずれ OCR があるが、stem_jp_clean + choices_jp は IPA 実問と整合済 (上流是正済) → note 記録のみ。

### tr CONCERNS 2 (q005 / q092) — 受容
- q005: 解説 distractor ア の zh が「管理整个系统的」を追加 — JP 解説には無いが**源選択肢に実在** (page-03 確認) → 源整合 gloss、benign。
- q092: LPWA の速度帯 (数百 bps〜数十 kbps) を zh/en が追加 — 事実正の説明 gloss、benign。

### invariants (git 確証)
- questions.json diff = 2 行 (q005 エ choice + q036 stem)。correct_answer 0 変更、quiz_index 不変。
- translations/2021r03.json = 3 フィールド (q036 stem_jp_clean / stem.zh / stem.en)。

### Rule A
- N=25 = 全8図 + suspect 4 (q036/q038/q039/q049) + q095 + 是正済 q005 (手動追加) + plain。
- run `wf_5f0521f3-7f4`: 初回 22/25 (session limit、resets 5pm JST) → probe + resume で 25/25 完走。
- **結果: accurate 24/25・none21/low3/high1・全 25 independent_answer == stored key (bad key 0)**。
- q095: critic 独立導出 ウ = key・none → S89 遺留疑義 三方独立一致で解消。
- high 1 = q036 cache 上の patch 前 audit。post-patch 独立検証 (別 agent、Rule D) = **PASS** (源自読 + 独立検算 エ=key + stale 0) → 実効 25/25。詳細 annotation は `ruleA_result_S103_2021r03.json` 内。

### q036 sidecar key_guard patch (S102 q075 方式)
- merge は round-1 key_guard を sidecar に書く (repair masking 防止設計)。q036 の round-1 note は round-2 で撤回済みの誤仮説 (「49%→25% に是正せよ」という、正しい stem を破壊しうる誤指示) を含み、歴史記録ではなく誤導情報 → generate_result の round1+final を裁決後確定記録に patch → re-merge。
- patch 後の note = 0→9×3 の源確証・全層是正済・EAC 検算 (600÷0.40=1,500 → 超過500=エ=key)・旧仮説撤回の履歴。独立 post-patch 検証 agent が源 page-17 自読+検算で PASS を確認。
