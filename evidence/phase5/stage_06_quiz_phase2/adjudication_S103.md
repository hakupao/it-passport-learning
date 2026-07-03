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

(実行後に追記)
