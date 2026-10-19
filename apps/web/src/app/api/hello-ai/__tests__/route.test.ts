// D-148 — /api/hello-ai smoke endpoint is owner-gated like the other AI routes.
// `streamText` is mocked (no live LLM call) and the DataSource is stubbed.

import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
  streamText: vi.fn(() => ({
    toTextStreamResponse: ({ headers }: { headers?: Record<string, string> } = {}) =>
      new Response("ok", { status: 200, headers }),
  })),
}));

vi.mock("@/lib/data", () => ({
  getDataSource: () => ({ loadGlossary: async () => ({ entries: [] }) }),
  warmUp: async () => {},
}));

import { streamText } from "ai";
import { GET, POST } from "../route";

const OWNER_KEY = "test-owner-key";
const OWNER_COOKIE_HEADER = `itp_owner=${createHash("sha256").update(OWNER_KEY).digest("hex")}`;

function postRequest(cookie?: string): Request {
  return new Request("http://localhost/api/hello-ai", {
    method: "POST",
    headers: cookie ? { cookie } : {},
  });
}

beforeEach(() => {
  vi.stubEnv("OWNER_KEY", OWNER_KEY);
  vi.mocked(streamText).mockClear();
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/hello-ai — D-148 owner gate", () => {
  async function expectDisabled(res: Response): Promise<void> {
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "disabled" });
    expect(vi.mocked(streamText)).not.toHaveBeenCalled();
  }

  it("owner: reaches the (mocked) LLM and streams", async () => {
    const res = await POST(postRequest(OWNER_COOKIE_HEADER));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
    expect(vi.mocked(streamText)).toHaveBeenCalledOnce();
  });

  it("503 without the owner cookie", async () => {
    await expectDisabled(await POST(postRequest()));
  });

  it("503 with a wrong cookie value or the plaintext key as cookie", async () => {
    await expectDisabled(await POST(postRequest("itp_owner=deadbeef")));
    await expectDisabled(await POST(postRequest(`itp_owner=${OWNER_KEY}`)));
  });

  it("503 when OWNER_KEY is unset, even with the previously valid cookie (fail-closed)", async () => {
    vi.stubEnv("OWNER_KEY", "");
    await expectDisabled(await POST(postRequest(OWNER_COOKIE_HEADER)));
  });
});

describe("GET /api/hello-ai — help text", () => {
  it("describes the D-148 owner gate", async () => {
    const text = await (await GET()).text();
    expect(text).toMatch(/D-148/);
    expect(text).not.toMatch(/Basic Auth/);
  });
});
