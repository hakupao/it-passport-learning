# Quiz Phase 1.5 (stem 源再構成) — pilot 2025r07 (figure) evidence

> Session 97 (2026-06-20) / D-138. Pilot = 2025r07 の図題 16 (q066=stem 体検で器具が miss した最悪ケースを含む)。
> パイプライン: prep(--figure-only) → reconstruct.workflow → merge(translations サイドカー更新)。

## 結果

- **reconstruct (writer general-purpose → 独立 critic figure↔stem 照合、repair≤2)**: **16/16 PASS**。
- 第1回 run (`wf_be99a958-d37`): 16/16 PASS だが **5 問 (q037/q039/q045/q062/q071) が ア/イ/ウ/エ の解答選択肢表を stem に重複** (choices_jp で別途表示されるため二重) = **回帰を pilot が捕捉**。
- **是正**: reconstruct prompt に「**問題データ表 (ログイン記録/取引表等) は stem に含め、解答選択肢表 (ア/イ/ウ/エ) は含めない**」を明記 → 第2回 run (`wf_18a5c135-c59`): 16/16 PASS、**選択肢表の重複 0**。
- merge: 16 updated、サイドカー `stem_jp_clean` + `stem.{zh,en}` を更新 (reader 不変、git diff で逐題審査可)。

## q066 — 主 context 高倍率実読で再構成を検証 (D-138 最高権威パス)

stem 体検で器具が「忠実」と誤判 (感度ギャップ) した q066 を、再構成後に主 context が page-31 を **4×ズーム実読**で逐項確認 — 再構成は**全て正しい**:
| 項目 | corpus (誤) | figure = 再構成 (正) |
|---|---|---|
| 閾値日付 | 4月**18**日 | **4月10日** ✓ (実読確証) |
| 4行目 | 09:00:16 / 10011 | 09:00:15 / **10001** ✓ |
| 6行目 | 09:08:33 / 10001 | 09:03:01 / **10008** ✓ |
| 8行目 結果 | 失敗 | **成功** ✓ |
| 9行目 部署 | 001 | **003** ✓ |
| 行数 | 11 | **12** (10:00:02/10011/001/失敗 を補完) ✓ |
| 条件語 | (脱落) | 「だけ」復元 ✓ |
正解は イ で不変 (correct_answer 一致)。**器具も主 context 初読 (低解像度 crop) も誤った表を、figure-grounded 再構成 + 独立 critic + 主 context 高倍率実読 が正した** = 多段独立の複利。

## 変更内訳 (8/16 が実質変更、8 は既に忠実)
- q066 (表全面是正)・q026 (設問文復元)・q037 (適合→遵守)・q039 (選択肢表除去)・q045 (選択肢表除去)・q054 (何分→何%)・q062 (助詞/読点+選択肢表除去)・q071 (条件語「つながりやすい」復元+選択肢表除去)。
- 無変更 8 (既に figure 忠実): q030/q069/q072/q073/q076/q078/q083/q099。

## 学び (fix-checklist 追記)
8. **stem 再構成は解答選択肢表を stem に入れない**: 図中で選択肢が表形式 (ア/イ/ウ/エ×a,b) でも choices_jp で別途表示されるため二重になる。**問題データ表 (計算/参照対象) のみ stem に含める**。pilot 第1回で回帰捕捉→prompt 是正で根絶。
9. **figure 再構成は figure-grounded writer + 独立 critic + 主 context 高倍率実読の三段が要**: 単一 vision (器具 auditor も主 context 低解像度初読も) は figure-table を誤読する (q066)。

## 検証
- merge は JSON.stringify 書込のため直列化は常に valid (q082 型の生 `"` 問題は発生しない)。
- コード不変 (前回 GREEN: tsc/eslint/vitest463/build/nft IPA0) → サイドカーは runtime で string として読まれ markdown 表は plain-text 描画 (既存 clean stem と同挙動)。

## 次 (ユーザー gate)
- pilot で **figure 再構成パス (難・標本 certify 不能な側) を 16 問 (最悪 q066 含む) で検証** + 回帰捕捉+是正。
- scale = 全 **467 図題 + 71 非fig marked** (非fig は backup 照合パス、stem 体検で q034/q090 捕捉済で有効性実証)。~538 問 × (reconstruct+check) の大規模 run。
- 完了後 → Phase 2 (D-137) を figure-fidelity hardening 込みで再 pilot → scale。
