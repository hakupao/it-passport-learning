# FAILURE ARCHIVE — quiz Phase 1.5 S98-B3 / 2012h24a-q096 / n/m 定義の改悪

- **Date filed**: 2026-06-21 (Session 98, Batch S98-B3)
- **Step**: Stage 6 Quiz Phase 1.5 (D-138) stem 源再構成 (ランレングス符号化問)
- **Verdict**: in-pipeline critic = PASS (見逃し) / 独立 Rule A auditor (code-reviewer) = faithful=false, source_faithful=false, **high (answer-affecting)**

## 失敗内容 (defective product)
項目(2) の n/m 定義を修復過程で**改悪**:
- **defective (再構成)**: 「ランレングスの値を2進数で表現したときの**桁数を n とし**，その n の桁数が m のとき」(n=桁数 と再定義)
- **正 (backup)**: 「ランレングスの値を2進数で表現したときの**値 n に対して**，その n の桁数が m のとき」(n=値)
- 同 stem の例文は「2進数で表現した値 n は『10100』，その桁数 m は5」(n=値=10100, m=桁数=5) のまま → **定義と例が自己矛盾**。
- 改悪は zh (位数为 n)・en (Let n be the number of digits) にも伝播。

## 技術判定
JSON valid・merge 成功・回帰なし。in-pipeline critic も PASS (見逃し)。

## 業務判定
**answer-affecting (high)**: ③『ランレングスの情報：n』を字義通り読むと n=桁数 となりエンコードが壊れる (例 20→111010100 が不成立)。リテラル解答者を誤導。公式正解 ア 自体は規則本体・例が無傷なら導出可だが、定義文の破壊は学習材として欠陥。

## 是正
主 context が backup どおり「値 n に対して」へ jp/zh/en 同期是正 (独立 Rule A auditor が backup 照合で特定+訂正案提示)。項目(1)①規則 (m が0〜2→「0」表現)・先頭補完「000」・(3) 白始まり前提は auditor が「妥当な復元」と判定したため保持。再 merge で適用 (正解ア不変)。

## 教訓 (fix-checklist)
- 非figure marked 問で意味を担う定義文を「修復」する際、**例文との内部整合**を必ず確認 (n の定義と例の n 値が一致するか)。in-pipeline critic は定義↔例の矛盾を見逃した → 独立 Rule A が網兜。
- backup を権威とする原則 (S98-B2 q086 と同根)。
