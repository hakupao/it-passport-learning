# .source/

Gitignored host for input source artifacts: copyrighted material, raw inputs that must not be redistributed via this repo.

Per **D-082** and D-045 spirit. The whole dir is `.gitignore`d except this README (kept tracked so the dir's purpose is greppable from the project tree).

## What lives here

| File | Purpose | Provenance |
|---|---|---|
| `IT-Passport.epub` | The source Reiwa 6 IT パスポート textbook (256 MB). Phase 1 pipeline input — read by Stage 0 unpack. | Acquired separately; not redistributed (per `README.md` "License" + privacy rule) |

## What does NOT live here

- Stage 0..7 derived artifacts → `data/<cert_id>/runs/<run_id>/<stage>/` (per D-050)
- API secrets → `.env.local` at repo root (python-dotenv CWD convention)
- Anything tracked by git → other directories

## How to populate

If you cloned this repo and want to re-run the pipeline, drop your own legally-acquired EPUB here. The pipeline reads from `.source/IT-Passport.epub` (path baked into the run config). Schema-compatible source replacements (other versions of the same book, other certifications) need their own `pipelines/<cert_id>.yaml`.
