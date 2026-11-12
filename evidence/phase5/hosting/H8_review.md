# H8 Rule D 審査 — 収尾 docs (retro・ADR D-217 実績節・STATE・PLAN・_progress)

- reviewer: oh-my-claudecode:verifier (opus)、writer: 主 session。依頼文 `subagent_prompts/H8_review.md`。
- **判定 PASS-WITH-CHANGES** (HIGH 0 / MEDIUM 1 / LOW 9)。数値は全て一次資料で照合済 (16,194・3,806・12,885・735・159/0/2・30/30・6/6・445 B・26.2 ms・319 欄・522/659 ほか)、锁定决策 226・OQ 最大 24 を grep で確認、`_progress.json` valid、STATE の基础设施行は main の実体と一致 (L-3 を除く)。

| ID | 重さ | 内容 | 対応 |
|---|---|---|---|
| M-1 | MEDIUM | OQ-23 で「preview は runtime secret を継承しない」と断定 — 旧 preview モデルの Worker なら本番の秘密を使う (DEPLOY §2-2 LOW-2、未確認) | STATE OQ-23・session log を「未確認、ON の前に dashboard でモデル確認」に修正 |
| L-1 | LOW | retro の CPU 臨界は local 代理指標からの推定 | 「推定・見込み」に修正 |
| L-2 | LOW | H3 carry「Next 15.5.18 → 15.5.28」が What's Next に無い | What's Next 8・STATE 次セッションに追加、未使用 svg 5 個も任意として記載 |
| L-3 | LOW | 旧 `?owner_key=` 転送 script の置き場所は `[locale]/layout.tsx` | STATE Middleware 行を修正 |
| L-4 | LOW | STATE 锁定决策の D-217・D-218・D-212 要約に「覆った」注記が無い | 3 件に注記を追加 |
| L-5 | LOW | 審査前に H8 を PASS と記載 | 本記録の保存後に PASS (この commit) |
| L-6 | LOW | failures の H5 比較道具 timeout・H7 local-e2e が retro に無い | retro 缺口に「local の検証道具が環境と呼び方に脆い」を追加 |
| L-7 | LOW | 「補足 27」は一次資料内で不一致 (内訳 6+3+12+9 = 30) | retro を 30 + 不一致の注記に修正 (H5_fidelity.md は過去の evidence のため不変) |
| L-8 | LOW | trace の `06:1x` は ISO 不正 | `06:15` + `ts_approx: true` |
| L-9 | LOW | DEPLOY_cloudflare.md のヘッダーが H7 前の記述 | H7 済の注記を 1 行追加 |
