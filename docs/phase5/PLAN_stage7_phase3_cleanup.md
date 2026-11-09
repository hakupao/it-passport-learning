# Stage 7 Phase 3c — 一括書き直し後の掃除 (D-215、S152 起案 / S153 実施)

> 一括書き直し (b01〜b78) で「記録のみ」「範囲外」「ユーザー判断待ち」になった項目の処置。ユーザー「都按照你建议得来」(S152) → D-019 の「你来定」経路で Claude が処置を決定 (D-214 / D-215)。
> Tier 2: 本 PLAN + evidence `evidence/phase5/stage_07_ui/phase3/cleanup/` + failures は既存 batch 置き場 + 完了時に `RETROSPECTIVE_stage7_ui.md` 一括書き直し節へ追記 (Rule C)。
> 同時実行 ≤ 4 (D-206 既定、一時例外は 11-09 で終了)。書き手 = 主 session、審査 = verifier opus (Rule D)。local Playwright 全項目 + 本番 HTML smoke (D-213)。local 走行中は units/・共有ファイルを書かない (S152 Rule B)。

## 処置表

| # | 項目 (出所) | 処置 | 編集経路 | 審査 | 状態 |
|---|---|---|---|---|---|
| C1 | OQ-19: v1 回帰テスト 2 件が v1 = 0 で無検査 | **D-214**: `v1-snapshot.test.ts` と `__snapshots__/v1-units.json`、zh-terms の `--probe-v1` を退役し、`v2-corpus.test.ts` に「全単元が `textbook-unit-v2`」の不変量を 1 件追加。`--check-units` は現行 (S152) のまま | コード (TDD: 不変量を先に追加して通過確認 → 旧テスト削除) | code-reviewer opus | todo |
| C2 | zh 本文 `**…**[[jp:…]]` 括弧なし表記で派生欄が「会计审计会計監査」と連結 (S150 b56 O1、S152 再計数 24 単元 / 244) | 派生欄を作る関数を直して全単元を再派生 (単元ごとの補丁にしない)。まず派生が merge 時保存か描画時かを確認し、保存なら merge 経路で再 `--write` | コード + 再 merge | verifier opus (派生欄の差分全件) | todo |
| C3 | b77 L3: v1 図 `figures/technology-14-39-u01-t01.svg` と `terms[1].figure.mermaid` の 〈p〉〈/p〉 全角山かっこ | 直接修正 (`&lt;p&gt;` / mermaid `#lt;p#gt;`)。`figure_index.json` に当該図の hash 等が無いことは S152 で確認済 | 図ファイル直接編集 | verifier opus (截図で目視) | todo |
| C4 | b32 u04 スクラム tree 図のインクリメント欠落 (f) | 図の構造修正 (図 data の追加)。B3 は文字列置換のみのため、merge 経路外の直接編集として evidence に before/after を残す | 単元 JSON 直接 + 記録 | verifier opus | todo |
| C5 | zh 訳語の単元間分裂: アクセシビリティ 可访问性 (19-50-u02) / 无障碍设计 (19-51-u01) | **可访问性に統一**。根拠: 2015h27a-q061 の誤答ア バリアフリーデザイン の zh 訳が「无障碍设计」で、19-51-u01 の訳は誤答肢と同語 (型 6)。zh_terms に登録 + B3 補丁 | B3 | verifier opus | todo |
| C6 | zh 訳語: Web ページ 网页 (多数 20 ファイル) / Web 页面 (14-38-u01・19-51-u04) | **网页に統一** (多数側、zh_terms に登録) | B3 | 同上 (C5 と合同) | todo |
| C7 | (g) 公的個人認証 zh/en、zh 电子证书、SECI 段階名 zh 表記 | zh_terms に登録し、不一致の欄を B3 で揃える。訳語は IPA 用語集 / 既存多数側から決め、根拠を evidence に | B3 + zh_terms | 同上 | todo |
| C8 | `zh_terms.json` の偽陽性 warn (バリュー→价值观、スイッチ→交换机、集合、尺度 等) | per_unit / excluded に登録して warn を消す (本文は変えない) | zh_terms | verifier opus | todo |
| C9 | v1 由来 `unit_summary_*` (b74 u02「高清」、b78「押さえ」) | 全 244 単元の `unit_summary_*` を §9 禁止句と既知の訳語問題で機械走査 → 該当を unit-level B3 補丁 (`unit.unit_summary_*`、既に 4 単元で実績) | B3 (unit-level) | verifier opus (Rule A: 走査結果の N 抽検) | todo |
| C10 | (i) strategy-04-13-u02 `title_zh`「产业化」 | 直接修正 + `unit_index.json` の title_zh も同時更新 (patch tool 対象外) | 直接 + index | 同上 | todo |
| C11 | (e) b30 u04 2012h24h-q012 クロスセリング (本文で解けない紐付け)、(h) 該当過去問 0 単元の `challenge_questions` が v1 継承の無関係題 (strategy-05-14-u08、technology-13-35-u07 等) | 全単元の `challenge_questions` / `term_questions` を「その単元の本文で解けるか」で走査し、無関係題を外す。配列欄のため直接編集 + evidence | 直接 + 記録 | verifier opus | todo |
| C12 | (k) quiz 解説 q091・q069 の「絶対参照」呼称 | **本 pass から外す**: quiz 層 (D-143 explfix 方針) の別工程に引き渡す | — | — | 引継ぎ |
| C13 | (l) validateV2 `wordAt` の漢字境界、en 層 D-198 Dice 基準 | **行わない** (生成は完了し、両者は新規生成・補丁時の検査のみに効く)。B3 を再開する場合に再検討 | — | — | 不採用 |
| C14 | (j) 金商法等改正の施行後に strategy-02-06-u03 へ暗号資産、日付追跡 4 件 | 日付到来時に B3 (STATE 次セッション行で追跡) | B3 | verifier opus | 日付待ち |
| C15 | リモート `stage7-ui` ブランチ | 削除を推奨: `origin/stage7-ui` (`1ef669ad`) は `origin/main` の祖先で独自 commit 0 (S152 確認)。外部への破壊的操作のためユーザー自身が実行: `! git push origin --delete stage7-ui` | ユーザー | — | **done (S152、ユーザー実行、`[deleted] stage7-ui`)** |
| C16 | Vercel deploy 保持期間 (D-212 §4) | 推奨 7 日 (最少 10 保持)。Vercel Project → Settings → Security → Deployment Retention でユーザーが設定 | ユーザー | — | ユーザー実行待ち |

## 順序 (S153)
1. C1 (テスト、独立) と C3・C10 (小さい直接修正) を先に。
2. C2 (派生関数、全単元再派生) — 他の単元編集より前に入れ、以降の補丁は新しい派生で再 merge。
3. C5〜C8 (zh 訳語・zh_terms) を 1 組で。
4. C9・C11 (全単元走査 → 該当のみ修正、Rule A 抽検)。
5. C4 (図の構造)。
6. gates → local e2e (全単元) → commit (項目ごと) → push → 本番 smoke (変更単元)。retro 追記。
