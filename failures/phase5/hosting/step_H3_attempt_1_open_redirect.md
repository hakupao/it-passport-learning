# H3 所有者 Worker — attempt 1: Rule D (security-reviewer) FAIL — 開放リダイレクト

- 日時: 2026-11-11 S154、branch `hosting-cf` (未 commit)
- 入力: PLAN §2 H3。`/api/owner?key=…&next=…` の有効化経路、`safeNextPath` で next を同一サイトの相対 path に限定。
- 産物: `apps/web/src/lib/ownerActivation.ts` ほか (H3 一式)。writer の open-redirect テスト 15 種は全通過。
- 技術判定: tsc / lint / vitest 1,477 / e2e 158 すべて通過。
- 業務判定: **FAIL** (HIGH 1)。`safeNextPath` は生の文字列で「/ 始まり・// 始まりでない・\ と制御文字なし」を確かめた後に `new URL(raw, origin)` で正規化するが、WHATWG の正規化で `.`・`..`・`%2e` が畳まれ `/.//evil.com` → pathname `//evil.com` (origin は自サイトのまま通過)。返した `//evil.com` を Location 作成で再度 `new URL(…, origin)` に通すと `https://evil.com/` になる。`/..//evil.com`、`/%2e//evil.com`、`/a/..//evil.com` など 7 形で再現。鍵は不要 (誤った key でも next へ 307)。
- 原因 (作成側): 検査を正規化の前にだけ置き、正規化後の値を再解析した (検査と使用で値が違う)。テストに dot-segment の類が無かった。
- 次 attempt の入力: 正規化後の URL に対して検査 (pathname が // で始まらない・同一 origin・/api でない)、検査済み URL オブジェクトをそのまま Location に使い再解析しない、上記 7 入力 + 自前の追加をテストし、新検査を外すとテストが落ちることを確認。併せて LOW: 非 GET で Sec-Fetch-Site が same-origin 以外なら 403、POST は Content-Type application/json 必須、feedback body に上限 (readCappedBody)、`pnpm audit`。
