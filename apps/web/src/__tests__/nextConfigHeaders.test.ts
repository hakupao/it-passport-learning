// D-181 §0-8 — the static production CSP set by next.config.ts headers().
import { afterEach, describe, expect, it, vi } from "vitest";

import nextConfig from "../../next.config";

// Verbatim from D-181 §0-8; written out here so the test does not share the
// constant it checks.
const EXPECTED_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.anthropic.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("next.config headers()", () => {
  it("defines headers()", () => {
    expect(typeof nextConfig.headers).toBe("function");
  });

  it("sets the §0-8 CSP on /:path* in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const rules = (await nextConfig.headers?.()) ?? [];
    const all = rules.find((r) => r.source === "/:path*");
    expect(all).toBeDefined();
    const csp = all?.headers.filter((h) => h.key === "Content-Security-Policy") ?? [];
    expect(csp).toHaveLength(1);
    expect(csp[0]?.value).toBe(EXPECTED_CSP);
  });

  it("sets no CSP outside production", async () => {
    for (const env of ["development", "test"]) {
      vi.stubEnv("NODE_ENV", env);
      const rules = (await nextConfig.headers?.()) ?? [];
      const csp = rules.flatMap((r) => r.headers).filter((h) => h.key.toLowerCase() === "content-security-policy");
      expect(csp).toHaveLength(0);
    }
  });
});
