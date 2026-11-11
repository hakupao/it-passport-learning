// D-217 H3 — the "worker-routes" vitest project really runs the route tests through the Worker:
// under ROUTE_TARGET=worker every handler routeTarget hands out is the Worker's fetch (the Worker's
// own headers are on the response), otherwise the route.dev handlers are returned unchanged.

import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function load(target: string) {
  vi.stubEnv("ROUTE_TARGET", target);
  vi.stubEnv("OWNER_KEY", "");
  vi.resetModules();
  return import("../testing/routeTarget");
}

describe("routeTarget", () => {
  it("ROUTE_TARGET=worker → the Worker answers (403 with X-Robots-Tag)", async () => {
    const { routeTarget, ROUTE_TARGET } = await load("worker");
    expect(ROUTE_TARGET).toBe("worker");
    const dev = vi.fn<(request: Request) => Promise<Response>>(async () => new Response("dev"));
    const { GET } = routeTarget({ GET: dev });
    const res = await GET(new Request("http://localhost/api/learning"));
    expect(res.status).toBe(403);
    expect(res.headers.get("X-Robots-Tag")).toBe("noindex");
    expect(dev).not.toHaveBeenCalled();
  });

  it("otherwise → the handlers as given", async () => {
    const { routeTarget, ROUTE_TARGET } = await load("");
    expect(ROUTE_TARGET).toBe("next");
    const dev = async () => new Response("dev");
    expect(routeTarget({ GET: dev }).GET).toBe(dev);
  });
});
