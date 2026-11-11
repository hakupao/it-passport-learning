# H2 実測 — attempt 1: build が Google Fonts 取得失敗で停止

- 日時: 2026-11-11 S154、branch `hosting-cf` (H1-4 作業中、詳細 2 系統を一時的に事前生成した測定用の build)
- 入力: `pnpm build` (clean `.next`)、`practice/q/[qid]`・`glossary/[termId]` に一時的に generateStaticParams。
- 産物: build 失敗 (log `step_H2_measure_attempt_1_fontfetch.log`)。
- 技術判定: FAIL — Turbopack が `next/font/google` の取得でネットワーク一時失敗。コード起因ではない (同内容の再実行で成功)。H1-3 でも同じ失敗が 1 回あった。
- 業務判定: 影響なし (測定は attempt 2 で完了、`evidence/phase5/hosting/H2_measurement.md`)。
- 次の attempt の入力: 同一。**注意**: Cloudflare Workers Builds で build する場合も Google Fonts の取得に依存する → H4/H6 で font を self-host (ローカル同梱) するかを検討。
