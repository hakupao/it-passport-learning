# Step 15 — file tree outline (Session 48)

Scope: Playwright E2E ship-readiness gate per Module D row 15. No app code or
i18n message catalog changes — Step 15 only adds test infrastructure + specs.
Prod deploy `dpl_CCjwr37vkFKJoDBwV1q4T9PgQrjT` aliased canonical from
Session 47 Step 14 stands; no re-deploy required since Playwright surface is
test-only.

## New files (this step)

```
apps/web/
├── playwright.config.ts          # NEW — baseURL = prod canonical,
│                                 # extraHTTPHeaders injects D-097 Basic Auth
└── e2e/
    ├── chat.spec.ts              # NEW — 3 happy-path tests (ja/zh/en)
    ├── quiz.spec.ts              # NEW — 3 happy-path tests (ja/zh/en)
    ├── glossary.spec.ts          # NEW — 3 happy-path tests (ja/zh/en)
    └── firewall.spec.ts          # NEW — 2 D-097 firewall tests (401 / 200)
```

## Modified files (this step)

```
apps/web/
├── package.json                  # +1 devDep @playwright/test@^1.60.0
│                                 # +1 script "test:e2e": "playwright test"
├── pnpm-lock.yaml                # pnpm lockfile auto-refresh
└── .gitignore                    # +/playwright-report
                                  # +/test-results
                                  # +/playwright/.cache
```

## Untracked (artefacts; gitignored)

```
apps/web/
├── playwright-report/
│   ├── results.json              # JSON test report (copied to evidence/)
│   └── html/index.html           # HTML viewer
└── test-results/                 # empty (only populated on failure traces)
```

## Phase 2 evidence dir (this step)

```
evidence/phase2/step_15_deploy/
├── tree_outline.md               # THIS file
├── design_notes.md               # LD-1..LD-N design decisions
├── test_results.txt              # raw Playwright stdout + vitest tail
├── e2e_smoke.md                  # narrative run summary
└── e2e_results.json              # copy of playwright-report/results.json
```

No `vercel_deploy_prod.log` this step — Session 47 deploy stands (no new app
code committed in Step 15; only test infrastructure which lives outside the
Next.js bundle).
