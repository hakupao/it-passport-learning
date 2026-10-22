import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("zodJitless", () => {
  it("turns on zod's jitless config (no new Function probe under the CSP)", async () => {
    await import("../zodJitless");
    expect(z.config().jitless).toBe(true);
  });
});
