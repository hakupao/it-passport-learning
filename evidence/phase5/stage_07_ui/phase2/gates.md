# Stage 7 Phase 2 — Task 7 Step 1: Gates

- 日付: 2026-10-27 / HEAD `7cbdfa2` (branch `stage7-ui`)
- 実行者: 独立検証 agent（実装・レビューとは別 context, Rule D）
- 場所: `apps/web/`

| # | Gate | コマンド | exit | 結果 |
|---|---|---|---|---|
| 1 | 型 | `npx tsc --noEmit` | 0 | 0 error |
| 2 | lint | `npm run lint` (eslint) | 0 | 0 error / 0 warning |
| 3 | unit | `npm test` (vitest run) | 0 | Test Files 92 passed (92) / Tests 1075 passed (1075) |
| 4 | build | `npm run build` (next build --turbopack) | 0 | 成功 |
| 5 | nft IPA leak | `find .next -name '*.nft.json' -exec grep -lE 'data/ip/(exams\|sources\|syllabus)/' {} + \| wc -l` | 0 | `0`（対象 nft 27 本） |
| 6 | 本地 e2e 全量 | `PLAYWRIGHT_BASE_URL=http://localhost:3150 npx playwright test --retries=0` | 0 | **104 passed**, 0 failed, 0 flaky, 0 skipped（1.6 min; `learning-owner.spec.ts` は E2E_OWNER_KEY 未設定で config の testIgnore = 従来どおり対象外） |

## e2e サーバ

- 上記 build を `UPSTASH_REDIS_REST_URL= UPSTASH_REDIS_REST_TOKEN= KV_REST_API_URL= KV_REST_API_TOKEN= npx next start -p 3150` で起動（npx PID 25492 / listen PID 25511）。
- 同サーバで Step 2 の Rule A 抽検（`audit.md`）も実施後、`kill 25511 25492` → `lsof -i :3150` 空を確認。
- :3000 は別プロジェクトの next-server（PID 59299, cwd は本 repo 外）で、一切触れていない。

## 判定: **PASS**（6 項目すべて緑）
