# Test Fixtures

Per D-043, this directory has an underscore prefix (`_fixtures/`) so pytest does not
attempt to collect its contents as test modules.

## Policy

| Size | Location | Git tracking |
|---|---|---|
| Small (<100KB) | This directory directly | Committed |
| Large (>100KB) | Subdirectories listed in `.gitignore` | Not committed |

## Current contents

(empty — fixtures will be added as Phase 1 implementation progresses)

## Planned

- `mini_sample.epub` — minimal EPUB for unit tests (committed)
- `pages/` — full-resolution page images for integration tests (gitignored)
- `golden_outputs/` — small golden output snapshots (committed)
