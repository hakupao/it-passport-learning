// D-181 §0-8 / Review Focus 1 — keep zod (used inside the AI SDK and the
// Anthropic provider) from probing `new Function("")` in the browser. The probe
// is caught, but under the production CSP (no 'unsafe-eval') it still fires a
// `securitypolicyviolation` ("script-src eval"). zod 4 skips it under its
// `jitless` config, which lives on globalThis.__zod_globalConfig (zod/v4/core/core.js),
// so it can be set without importing zod (not a direct dependency).
// Side-effect module: import it before anything that loads the AI SDK.

const g = globalThis as { __zod_globalConfig?: { jitless?: boolean } };
(g.__zod_globalConfig ??= {}).jitless = true;

export {};
