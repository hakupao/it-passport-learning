# D-149 — Quiz 題ごとの問題報告 (owner 限定) + 自動修復ループ

- **Status**: Locked (Session 126, 2026-10-19、ユーザー「可以，按此锁定」)
- **Relates**: D-148 (owner 鍵)、S99 figfix 管線 (`figcrop_audit_S99.md`)、⑤-2 fidfix 管線、D-146 (分批)。

## 背景 — 事実 (S126)
- ユーザーが本番 quiz で「図が不完全で解答に支障」を複数観測。本番 = 最新 commit `c698a79` (Vercel deployment success、図 md5 一致) で、未反映ではない。
- ⑤-2 (U0〜U9 完了、次 U10) は文字の保真核験で、**図の裁断完全性は範囲外**。図の全量検証は S99 の単一 sweep (467 図、25 修正) のみで召回は未計測。
- S126 の決定的縁辺走査 (530 webp、縁 2px の暗画素率 > 2%) で 267 候補、うち 6 枚を目視 → **実欠損 2**: `2016h28h-q033` (経路表が B 行で切断) / `2017h29a-q015` (選択肢表のエ行欠落 + 右端切断)。残 4 は上下の文字混入/罫線接触で解答に支障なし。走査は偽陽性が多く単独では使えない。
- ユーザー回答: 利用者は本人のみ / 種別選択 + 文字説明 / 修復は Claude が自動 / U10 と並行。

## 決定
1. **提出者**: owner のみ (D-148 の cookie)。非 owner にはボタンを出さず、API も 403。
2. **UI**: QuizSet の各題に「問題を報告」ボタン。種別 = `figure_incomplete` / `figure_wrong` / `text_error` / `translation_error` / `answer_or_explanation` / `other` + 任意説明 (≤ 1000 字)。題 ID・locale・時刻は自動付与。同題の既存報告と状態 (open / resolved) をダイアログに表示。三語 i18n。
3. **保存**: 既存 Upstash Redis (Vercel KV、Production 設定済)。
4. **修復ループ**: ユーザーの「处理反馈」(または session 開始時) に `scripts/quiz-feedback.mjs` で open を `data/` に取得 → 図系は S99 figfix (源全頁実読 → bbox → 再裁断 → 別 type critic 再検証)、文字系は ⑤-2 fidfix → Rule D → commit → `resolve` で状態更新。
5. **初期投入**: S126 で確認した 2 題を最初の修復対象にする。
6. **並行**: 本機能 (web コード) と ⑤-2 U10 (データ) は別 commit。

## 却下した代替案
| 案 | 却下理由 |
|---|---|
| 誰でも提出可 + rate limit | 利用者は本人のみ、スパム対策の手間に見合わない |
| 再度 AI 全量 sweep のみ | S99 で召回未計測・偽陽性あり、vision quota を大量消費。人の観測の方が精度が高い |
| 決定的縁辺走査で自動修復 | 267 候補中 実欠損 2/6 と偽陽性が多い |
| Web 上の手動裁断ツール | 実装量が大きい、ユーザーは自動修復を選択 |
| GitHub Issue 連携 | 公開 repo に作業ノイズ、token 管理が増える |
