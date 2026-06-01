# D-127 — Stage 3.5 「Stage 3 後置クリーン」設計

> Status: **Locked** (Session 77, 2026-06-01)
> 関連: D-126（Stage 3 マッピング設計）, D-118（Stage 4 出力 schema, terms→用語講解 / confidence を参照）, D-119（分層審核・確実即修/曖昧帰档）, Rule A/B/D
> 前提: Stage 3 完了（Session 76, G3）。enriched question_bank.json 2,900 題、confidence high2280/medium561/**low59**。knowledge_tree 63 小分類 / **1,413 用語（総出現数、記録通り正。unique=1391、重複実例22 は正常）**。

## 文脈

Stage 3 は Rule A N=20 で**妥当率100% / wrong0 / primary 全件正**を確認済。ただし 2 件の非ブロック残務が Session 76 で followup 登録されていた:
1. **low-confidence 59 題（2.0%）** — mapper の自己不確実申告。誤りではないが confidence の質が低い。
2. **語彙ギャップ** — mapper が付与したいが knowledge_tree 未収録の term（unique 19語、33題=1.1%に関与）。reconcile で自動除去済のため最終データに害はないが、G4 の用語講解で核心考点語が欠ける可能性。

ユーザーは「先做前置清理 → 再 G4」を選択。G4（AI 教科書生成、~330-530 ユニット三語）は重量級のため、品質基線を上げてから着手する方針。本決定で 2 件を **Stage 3.5** として正式化。

## 決定（ユーザー回答に基づく）

### 3.5a — low-conf 59 題の跨段高精度重判

59 題に対し **Opus + figure/追加文脈**で独立再判定（1 題 = 新 mapper、{primary, secondary, terms, confidence} を再産出）。

- 昇格可（high/medium と判定）→ confidence 更新 + mapping_status に再判フラグ。
- 依然 low → 明示入档（G4 生成時の「要注意」清単）。
- **invariants 不変**（correct_answer / answer_keys / stem / choices / figure / group / source）。
- subagent_type は既存 4 段（A=`general-purpose` / B=`explore` / tiebreak=`analyst` / RuleA=`code-reviewer`）と**相異**（Rule D）。
- 失敗 attempt は `failures/`（Rule B）。

**採用理由**: ユーザー選択。Rule A は妥当性（primary 正否）を保証するが confidence の質的向上には独立再判が最も徹底。Ultracode 下で成本非約束。

**却下案**:
- 「清単のみ作成し G4 で逐題処理」— 手戻り少だが confidence を更新せず、G4 が low のまま生成。
- 「現状受容」— 最軽量だが品質基線を上げない。Rule A 済とはいえ 2% を放置。

### 3.5b — 語彙ギャップの核心語のみ補完

19 unknown 語を甄别し、**真・核心考点語のみ** knowledge_tree.json の対応 topic.terms へ補完。

- **補完（確）**: サービスデスク→management-11-29 / セキュリティパッチ→technology-23-63 / アジャイル→management-09-26（いずれも IPA 核心考点、節点 term 突合で欠落確認済）。
- **境界候補（ユーザー確認）**: 組込みシステム→strategy-05-17（節点名に含むが term 欠）/ 仮想サーバ→technology-16-43（樹に「仮想化」「VM」上位語有）。
- **補完せず**: 分類名ノイズ（プロジェクトマネジメント等）/ 泛化・自作語（業務改善・売上高等）/ 樹内既存体系語（リスクマネジメント=完整 risk 体系有）。
- **term 計数（訂正）**: STATE/Session65 の **1,413 は term 総出現数で正しい**。当初の「1391 へ修正」案は当方が Set 去重で数えた誤判定のため**撤回**。補完後: total 1,413→1,417 / unique 1,391→1,395 / 重複実例 22（不変）。
- 独立 agent（≠補完実施 type）が補词恰当性 + 無重複 + 翻訳要否を核験（Rule D）。

**採用理由**: ユーザー選択。G4 用語講解品質に直結する核心語のみ補い、泛化語/分類名で樹を膨張させない。

**却下案**:
- 「全保留・G4 容錯」— 樹を汚さないが核心語欠を放置、G4 で容錯ロジックが必要。
- 「全部補完」— 泛化語・分類名で 1391→1410+ に膨張、樹の規範性低下。

## 影響

- 改變する锁定產物: `question_bank.json`（59題の confidence/status）+ `by_year/*`（同期）+ `knowledge_tree.json`（核心語4追加、文字列級挿入で原フォーマット保持）。いずれも `data/`(gitignored, D-109)、分発は Release。バックアップ必須（`.pre-s035`）。
- invariants（correct_answer/answer_keys/figure/group/source）は不変を検証。
- evidence: `evidence/phase5/stage_035_*.md`。Rule A 抽检 N サンプル。
- 完了後 G4（Stage 4）へ。Stage 3.5 は G4 のゲートではなくユーザー選択の品質前置。
