# Failure: phase2/step_09 / attempt_1 — react peer-dep ERESOLVE on Vercel npm install

## Metadata

| field | value |
|---|---|
| `attempt_id` | `step_09-2026-05-20-001` |
| `stage` | phase2/step_09_chat_ui |
| `timestamp` | 2026-05-20T06:32:18+09:00 |
| `triggered_by` | `evidence/phase2/step_09_chat_ui/ui_smoke_2026-05-20.md` flow row 1 |
| `git_sha` | (pre-commit; working tree at Session 41 mid-step) |
| `model_or_tool` | n/a (deploy-time tool failure: `Vercel CLI 54.2.0` invoking `npm install`) |
| `cost` | ~$0 (no lambdas booted; build aborted at install step) |
| `elapsed_minutes` | ~6 min (deploy-create through error surface) |

## Input

- Source state: `apps/web/package.json` with newly-added `@ai-sdk/react@^3.0.187` dep, `react@19.1.0`, `react-dom@19.1.0`.
- Local pre-deploy state: `pnpm test 157/157 ✅ + pnpm exec tsc --noEmit ✅ + pnpm lint ✅ + pnpm build ✅` all green.
- Deploy invocation: `cd apps/web && vercel deploy --yes`.

## Product

Vercel preview deploy `dpl_a5hjkjsbn-bojiangs-projects.vercel.app` entered BUILDING → ERROR at `Installing dependencies...` step. Key error from `--debug` capture:

```
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
npm error
npm error While resolving: web@0.1.0
npm error Found: react@19.1.0
npm error node_modules/react
npm error   react@"19.1.0" from the root project
npm error
npm error Could not resolve dependency:
npm error peer react@"^18 || ~19.0.1 || ~19.1.2 || ^19.2.1" from @ai-sdk/react@3.0.187
npm error node_modules/@ai-sdk/react
npm error   @ai-sdk/react@"^3.0.187" from the root project
npm error
npm error Fix the upstream dependency conflict, or retry this command with --force
npm error or --legacy-peer-deps to accept an incorrect (and potentially broken)
npm error dependency resolution.
```

## Technical verdict

**FAIL — npm strict-mode peer-dep resolution rejected the install.**

The `@ai-sdk/react@3.0.187` peer-dep range `^18 || ~19.0.1 || ~19.1.2 || ^19.2.1` has a tilde gap between `~19.0.1` (≥19.0.1 <19.1.0) and `~19.1.2` (≥19.1.2 <19.2.0). `react@19.1.0` falls in the gap and is rejected.

pnpm (Sessions 35-40 / Session 41 local) is lenient about peer-dep gaps and resolved cleanly, masking the issue locally. Vercel deploys from `apps/web/` (which does NOT contain the workspace-root `pnpm-lock.yaml`), so Vercel auto-detects npm and applies its strict resolution.

## Business verdict

**FAIL on shipping.** The deploy artifact did not become servable; the prior Step 8 prod canonical (`dpl_D4oQASueh2eTXrEEaApdmWNw4q3n`) continued to serve `/chat`-less Step 8 code until the fix landed.

## Root cause

Peer-dep gap in a transitive contract change. Specifically: the `@ai-sdk/react` maintainers tightened their tilde-range pins between 3.0.x patch versions (likely a React 19.1.2 bugfix coverage decision), and `react@19.1.0` sits in the resulting gap.

## Fix

Bumped React minor 19.1.0 → 19.2.6 (which satisfies the `^19.2.1` peer arm) in the same Step 9 wall:

```
$ pnpm add 'react@^19.2.1' 'react-dom@^19.2.1' '@types/react@^19.2.0' '@types/react-dom@^19.2.0'
```

Re-verified:
- 157/157 vitest still green
- tsc clean
- lint exit 0
- build green
- fresh-dir `npm install` (no lockfile) in `/tmp/web-fresh-test/` now succeeds

Re-deploy: preview `dpl_jyum90s88` READY → user re-auth `授权 vercel --prod` → prod `dpl_6mymk4bc2` (Prod-1) READY. (Prod-1 itself later required a second fix — see `step_09_attempt_2_*.md`.)

## Input to next attempt

`apps/web/package.json` with `react@^19.2.1` + `react-dom@^19.2.1`. No further changes needed; deploy succeeded.

## Lesson candidate (RETROSPECTIVE backlog)

> When introducing a new `@ai-sdk/*` peer-dep, pre-flight verify the deploy
> target's install behaviour (not just `pnpm install` locally). Either:
>   (a) deploy from workspace root so Vercel sees `pnpm-lock.yaml` and uses
>       pnpm (lenient peers), or
>   (b) maintain `apps/web/`-local install hygiene by running `npm install`
>       in a fresh tmp dir before deploy.
> Sessions 35-40 worked because they introduced no new peer-conflicting dep
> after the initial workspace setup; Step 9's `@ai-sdk/react` was the first
> additive dep that triggered the latent gap.

Candidate for RETROSPECTIVE.md "保留下来的做法 / 必须补上的缺口" section.

## Cross-product reflection (D-098 §4.4 sibling)

D-098 (Session 37) memorialized "partial supersede without cross-product compat check". This attempt is a sibling pattern: adding a new dep without cross-product compat check (pnpm-vs-npm peer resolution divergence). The "cross-product compat check" discipline applies to the deploy stack too, not just code-level contracts.
