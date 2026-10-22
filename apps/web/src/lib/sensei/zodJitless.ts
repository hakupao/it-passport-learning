// D-181 §0-8 / Review Focus 1 — keep zod (used inside the AI SDK and the
// Anthropic provider) from probing `new Function("")` in the browser. The probe
// is caught, but under the production CSP (no 'unsafe-eval') it still fires a
// `securitypolicyviolation` ("script-src eval"). zod 4 skips the probe under its
// public `jitless` config (zod/v4/core/util.js `allowsEval`); zod is a direct
// dependency at the version the AI SDK resolves, so this configures the same instance.
// Side-effect module: import it before anything that loads the AI SDK.

import { z } from "zod";

z.config({ jitless: true });
