# Topic page payload — Stage 7 Phase 2 Task 1 (§0-1, D-193)

Page: `/<locale>/practice/browse/technology-23-63` (largest topic: 217 questions, from `data/ip/quiz/questions.json`).
Measured with `curl -s <url> | wc -c` (raw) and `| gzip -c | wc -c` (gzip) against a local
`next build` + `next start -p 3150` (Redis env empty). Numbers only.

| locale | baseline raw (ba0b2a0) | after raw | after / baseline | baseline gzip | after gzip |
|---|---:|---:|---:|---:|---:|
| ja | 2,318,806 | 194,570 | 8.39 % | 688,091 | 29,229 |
| zh | 2,313,987 | 189,751 | 8.20 % | 688,316 | 29,448 |
| en | 2,318,149 | 193,913 | 8.36 % | 688,287 | 29,327 |

Acceptance (raw ≤ 15 % of baseline): **PASS** (all three locales).

On-demand fetch: `GET /api/quiz/questions?topic=technology-23-63&ids=<2 ids>` → 200, `cache-control: no-store`;
`ids=` empty → 400.
