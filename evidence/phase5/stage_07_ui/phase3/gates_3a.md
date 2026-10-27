# Stage 7 Phase 3a — Task 5 Step 1: Gates

- 日付: 2026-10-27 / HEAD `07fac01` (`07fac01e624d4c6b146395e61655efd1c06a77fd`, branch `stage7-ui`, working tree clean)
- 実行者: 実装 agent（`oh-my-claudecode:executor`）。Step 2 截图抽检 / Step 3 Rule D 整分支審査は別 agent。
- 場所: `apps/web/`
- ログ: `/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/977a122a-02e4-4287-a82a-156bea9c1433/scratchpad/gates_3a/`（scratchpad、未入库）

| # | Gate | コマンド | exit | 結果 |
|---|---|---|---|---|
| 1 | 型 | `npx tsc --noEmit` | 0 | 0 error（`tsc.log`） |
| 2 | lint | `npx eslint .` | 0 | 0 error / 0 warning（`eslint.log`） |
| 3 | unit | `npx vitest run` | 0 | Test Files **97 passed (97)** / Tests **1097 passed (1097)**, 8.31s（`vitest.log`） |
| 4 | build | `npm run build`（`next build --turbopack`, Next.js 15.5.18） | 0 | 成功（`build.log`） |
| 5 | nft IPA leak | `find .next -name '*.nft.json' -exec grep -lE 'data/ip/(exams\|sources\|syllabus)/' {} + \| wc -l` | 0 | `0`（対象 nft 27 本） |
| 6 | 本地 e2e 全量 | `PLAYWRIGHT_BASE_URL=http://localhost:3150 npx playwright test --retries=0 --reporter=list` | 0 | **118 passed**, 0 failed, 0 flaky, 0 skipped（1.8 min, 1 worker; `learning-owner.spec.ts` は E2E_OWNER_KEY 未設定で config の testIgnore = 従来どおり対象外）（`e2e_full.log`） |

## nft（gate 4 の turbopack build）

- 単元ページ `.next/server/app/[locale]/textbook/[unitId]/page.js.nft.json`: 全 **799** ファイル、うち `data/ip/` **659** = `data/ip/textbook/*` **658** + `data/ip/quiz/chumon_groups.json` **1**。questions.json / translations / explanations / exams / sources / syllabus なし。
- 参考（同 HEAD の webpack build `npx next build`、`build_webpack.log`）: 全 1883、`data/ip/` 1768 = textbook 1767 + `quiz/chumon_groups.json` 1、leak gate 0。この webpack build に対しても e2e 全量 118 passed / 0 failed（`e2e_full_webpack.log`）。gate 4〜6 は本番と同じ `npm run build`（turbopack）の結果を正とする。

## e2e サーバ

- gate 4 の build を `UPSTASH_REDIS_REST_URL= UPSTASH_REDIS_REST_TOKEN= KV_REST_API_URL= KV_REST_API_TOKEN= npx next start -p 3150` で起動（npx PID 17592 / listen PID 17694、`pids.txt`）。
- e2e 後 `kill 17592 17694` → `lsof -iTCP:3150 -sTCP:LISTEN` 空を確認。:3000 は使っていない。

## 判定: **PASS**（6 項目すべて緑）

---

## Re-run after whole-branch fix wave

- 日付: 2026-10-27 / HEAD `f49b83a`（branch `stage7-ui`, working tree clean）— whole-branch Rule D の Minor 修正波（term 集合の戻り先 `at=`、breadcrumb `<ol>` + pager label、`from=unit` は ids scope のみ、chumonMembers の path 固定テスト、狭幅の図の最小幅 + 図内スクロール）。
- 実行者: 実装 agent（`oh-my-claudecode:executor`）。
- ログ: `/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/977a122a-02e4-4287-a82a-156bea9c1433/scratchpad/gates_3a_rerun/`（scratchpad、未入库）
- build と e2e は commit 直前の同一内容の working tree で実行（その後の差分なし: commit 後 `git status` 空）、tsc / eslint / vitest は commit 後の HEAD で再実行。

| # | Gate | コマンド | exit | 結果 |
|---|---|---|---|---|
| 1 | 型 | `npx tsc --noEmit` | 0 | 0 error |
| 2 | lint | `npx eslint .` | 0 | 0 error / 0 warning |
| 3 | unit | `npx vitest run` | 0 | Test Files **98 passed (98)** / Tests **1105 passed (1105)**, 7.67s |
| 4 | build | `npm run build`（`next build --turbopack`） | 0 | 成功 |
| 5 | nft IPA leak | `find .next -name '*.nft.json' -exec grep -lE 'data/ip/(exams\|sources\|syllabus)/' {} + \| wc -l` | 0 | `0`（対象 nft 27 本） |
| 6 | 本地 e2e 全量 | `PLAYWRIGHT_BASE_URL=http://localhost:3150 npx playwright test --retries=0 --reporter=list` | 0 | **119 passed**, 0 failed, 0 flaky, 0 skipped（1.7 min, 1 worker; `learning-owner.spec.ts` は従来どおり testIgnore）（`e2e_full.log`） |

- 単元ページ nft: 全 **799**、`data/ip/` **659** = `data/ip/textbook/*` **658** + `data/ip/quiz/chumon_groups.json` **1**（前回と同じ）。
- e2e サーバ: `UPSTASH_REDIS_REST_URL= UPSTASH_REDIS_REST_TOKEN= KV_REST_API_URL= KV_REST_API_TOKEN= npx next start -p 3150`（npx PID 83217 / listen PID 83238）→ e2e と 390px 截图の後 kill → `lsof -iTCP:3150 -sTCP:LISTEN` 空を確認。:3000 不使用。
- 390px 截图（WBS 図、`management-10-27-u02`）: scratchpad `p3fix/`。

## 判定（re-run）: **PASS**（6 項目すべて緑）
