# Step 11 Attempt #1 — `kana_helper` runtime shape mismatch (TS `string | null` vs actual `{surface, reading, zh_concept, auto_backfill}`)

Phase 2 · Session 43 · 2026-05-20 · Rule B archive.

## Inputs

- Step 11 Term Popover UI client code shipped through Batches B-F (test + lint + tsc + build all green) and deployed to Vercel prod canonical `web-mu-sandy-78.vercel.app` (`dpl_AyCo8xTiHLHSnbWbNeEmFFtZwAXt`).
- First UI smoke attempt via Chrome DevTools MCP: navigate to `/glossary` with Basic Auth → page mount.

## Observation

Page failed to render. Chrome devtools snapshot:

```
heading "Application error: a client-side exception has occurred while loading
web-mu-sandy-78.vercel.app (see the browser console for more information)."
```

Console:

```
[error] Uncaught Error: Minified React error #31; visit
https://react.dev/errors/31?args[]=object%20with%20keys%20%7Bsurface%2C%20reading%2C%20zh_concept%2C%20auto_backfill%7D
```

React error #31 = "Objects are not valid as a React child (found: object with
keys {...}). If you meant to render a collection of children, use an array
instead." — the `{surface, reading, zh_concept, auto_backfill}` shape was
being rendered as a React text child.

## Root cause

`apps/web/src/lib/data/types.ts` declared:

```ts
export interface GlossaryEntry {
  ...
  kana_helper: string | null;
  ...
}
```

But the **real runtime payload** in `_fixtures/v1.0.3/glossary.json` (verified
across all 908 entries) is:

| Entries | `kana_helper` type |
|---|---|
| 600 / 908 | `null` |
| 308 / 908 | `{ surface: string, reading: string, zh_concept: string, auto_backfill: boolean }` |

Sample (id `g_009` "3Dプリンター"):

```json
"kana_helper": {
  "surface": "3Dプリンター",
  "reading": "3D purintā",
  "zh_concept": "3D打印机",
  "auto_backfill": false
}
```

Step 7 `lib/ai/hover.ts:86` SYSTEM_INSTRUCTION already references
`kana_helper.reading` — i.e. the LLM-facing layer always knew the true shape;
only the TS type declaration was wrong. Step 7 + 8 + Modules B/C up to Step 10
never read `kana_helper` from TypeScript (it was opaquely JSON-stringified
into the LLM context block), so the type drift went undetected.

Step 11 was the **first consumer** that read `kana_helper` from typed TS code:

```ts
// glossaryScope.ts buildGlossarySummary
return {
  ...
  kanaReading: entry.kana_helper ?? null,   // ← passes the object through unchanged
  ...
};

// TermPopover.tsx render
{summary.kanaReading && (
  <p ...>{READING_PREFIX}{summary.kanaReading}</p>   // ← React tries to render the object
)}
```

TS strict mode did NOT catch this because the declared type was `string | null`
which trivially satisfies React's children type contract; the runtime data
violated the declared contract, but `tsc` cannot know that.

## Technical judgment (Writer)

PASS — semantically a type contract violation; behaviour is fully recoverable
by aligning the TS type with the actual JSON shape and adjusting the one
consumer line to read `.reading`. Touches 3 files (types + scope + test).

## Business judgment (Reviewer)

PASS — the error blocked the whole `/glossary` page from rendering, so the
prod-promote attempt was effectively a no-op until fixed. After fix, the
prod re-promote produces the intended Module C 3/4 data point.

## Fix landed (same wall, in-source amendments per D-094 §2.1 + D-080 v1.1 §8)

1. **`apps/web/src/lib/data/types.ts`** — introduce `KanaHelper` interface and
   change `GlossaryEntry.kana_helper` to `KanaHelper | null`. Module comment
   points back to this archive.

2. **`apps/web/src/lib/glossary/glossaryScope.ts`** — `buildGlossarySummary`
   now reads `entry.kana_helper?.reading ?? null` instead of the raw object.

3. **`apps/web/src/lib/glossary/__tests__/glossaryScope.test.ts`** — first
   buildGlossarySummary test fixture switched from `kana_helper: "プロセッサ"`
   (the legacy fake) to the real-shape `{surface, reading, zh_concept,
   auto_backfill}` object. Asserted `kanaReading` equals the `reading` field.

Post-fix pipeline:

```
$ pnpm test --run     ⇒ 232/232 ✅ (no net change)
$ npx tsc --noEmit    ⇒ exit 0
$ pnpm lint           ⇒ exit 0
$ pnpm build          ⇒ /glossary ƒ 4.23 kB unchanged
```

Not D-NNN-worthy: the source of truth for the v1.0.3 glossary shape is the
JSON, not the TS sketch. This was a doc/code drift fix. ADR-grade decisions
(D-085 / D-088 / D-089 / D-097 / D-098) all remain undisturbed.

## Next attempt input

- Re-deploy to Vercel prod (preview + prod-promote).
- Re-attempt Chrome DevTools MCP UI smoke.
- Capture screenshots 1-4 + cache_audit data points + ui_smoke notes for the
  Step 11 evidence directory.
- This archive remains in `failures/` per Rule B regardless of how the next
  attempt lands.

## Lessons (for the Phase 2 retro at Module D close)

- TS type declarations sketched from a schema-doc are not authoritative —
  cross-check against a real payload before relying on the type. Especially
  for fields that are nullable + rarely-read; the rare reader is precisely
  who discovers the drift.
- `Object.keys` from a sample in the error message ARE the highest-signal
  artifact of a runtime shape mismatch; React error #31's args[] echoes the
  exact object shape, which made the fix unambiguous.
