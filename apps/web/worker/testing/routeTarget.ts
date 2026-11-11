// D-217 H3 test helper — lets the existing route tests (src/app/api/**/__tests__) run against both
// entry points with the same cases. vitest.config.ts runs those files twice: project "unit" (the
// `next dev` route handlers, as before) and project "worker-routes" with ROUTE_TARGET=worker, where
// every handler is the Worker's fetch (worker/index.ts → routing by URL path and method → the same
// lib handlers, plus the Worker's own headers). The tests' loader mocks still apply: the Worker
// imports the same modules.

import { handleRequest } from "../index";

type Handler = (request: Request) => Promise<Response>;

export const ROUTE_TARGET: "next" | "worker" = process.env.ROUTE_TARGET === "worker" ? "worker" : "next";

/** `handlers` (the route.dev exports) unchanged, or — under ROUTE_TARGET=worker — each one replaced by the Worker. */
export function routeTarget<T extends Record<string, Handler>>(handlers: T): T {
  if (ROUTE_TARGET === "next") return handlers;
  const viaWorker: Handler = (request) => handleRequest(request, {});
  return Object.fromEntries(Object.keys(handlers).map((k) => [k, viaWorker])) as T;
}
