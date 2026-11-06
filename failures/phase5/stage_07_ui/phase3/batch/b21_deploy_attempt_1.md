# b21 — 本番投入 attempt 1 (Vercel build failure)

- 日期: 2026-11-06 (S147)
- 输入: main `eb783aa6` (b21 strategy-01-01 u01〜u05)、Vercel deployment `dpl_3Vbsy15yBhsTzfq6kqqj2vhzwTve` (GitHub deployment 7594037178)。
- 产物: なし (build failed、本番は `1e197f46` のまま)。本番 e2e (b21 指定) 18 fail / 23 pass (旧版に対する実行)。
- 技术判定: Turbopack build failed with 202 errors。全件 `[next]/internal/font/google/noto_sans_sc_8f69f4f3.module.css`: `Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'` / `next/font/google queries have exactly one entry`。Google Fonts が返した CSS の font URL が `https://fonts.gstatic.com/l/font?kit=…&skey=…&v=v41` 形式で、query 内の `&` を Turbopack の next/font replacer が単一 entry と解釈できない。
- 业务判定: 教科書データ・コードとは無関係 (直前の `1e197f46` 06:06 は成功、clean worktree の local build も成功)。Google の応答が環境・時刻で変わる外部要因。
- 対処: ユーザー判断「先 Redeploy 试一次」→ `npx vercel redeploy dpl_3Vbsy15yBhsTzfq6kqqj2vhzwTve` → `dpl_5p4EGhJcj3NW3Hae4ziSGDKCeGFP` Ready (2 分)、itlearn.bojiangz.com に alias。本番 e2e (b21 5 単元) **41/41**。
- 再発時の候補 (未実施): Noto Sans SC を next/font/google から外す (system font / local 自托管)。`apps/web/src/app/[locale]/layout.tsx:16,41`。
- 下一 attempt: なし (解決)。再発したら上の候補をユーザーに提示。
