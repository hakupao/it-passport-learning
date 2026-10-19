// D-148 — owner gate unit tests (cookie hash, constant-time compare, fail-closed).

import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  OWNER_COOKIE,
  isOwner,
  isOwnerRequest,
  ownerCookieValue,
  sha256Hex,
} from "../owner";

const KEY = "test-owner-key-123";
const KEY_HASH = createHash("sha256").update(KEY).digest("hex");

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sha256Hex", () => {
  it("matches node:crypto SHA-256 hex", async () => {
    expect(await sha256Hex(KEY)).toBe(KEY_HASH);
  });
});

describe("ownerCookieValue", () => {
  it("returns the hex SHA-256 of OWNER_KEY (never the plaintext)", async () => {
    vi.stubEnv("OWNER_KEY", KEY);
    const v = await ownerCookieValue();
    expect(v).toBe(KEY_HASH);
    expect(v).not.toContain(KEY);
  });

  it("returns null when OWNER_KEY is unset or empty", async () => {
    vi.stubEnv("OWNER_KEY", "");
    expect(await ownerCookieValue()).toBeNull();
  });
});

describe("isOwner", () => {
  it("true for the matching hash", async () => {
    vi.stubEnv("OWNER_KEY", KEY);
    expect(await isOwner(KEY_HASH)).toBe(true);
  });

  it("false for the plaintext key, a wrong hash, empty or missing value", async () => {
    vi.stubEnv("OWNER_KEY", KEY);
    expect(await isOwner(KEY)).toBe(false);
    const lastFlipped = KEY_HASH.slice(0, -1) + (KEY_HASH.endsWith("0") ? "1" : "0");
    expect(await isOwner(lastFlipped)).toBe(false);
    expect(await isOwner(KEY_HASH.slice(0, -1))).toBe(false);
    expect(await isOwner("")).toBe(false);
    expect(await isOwner(undefined)).toBe(false);
  });

  it("fail-closed: false when OWNER_KEY is unset, even for the hash of an empty string", async () => {
    vi.stubEnv("OWNER_KEY", "");
    expect(await isOwner(await sha256Hex(""))).toBe(false);
    expect(await isOwner(KEY_HASH)).toBe(false);
  });

  it("follows OWNER_KEY changes (no stale memo)", async () => {
    vi.stubEnv("OWNER_KEY", KEY);
    expect(await isOwner(KEY_HASH)).toBe(true);
    vi.stubEnv("OWNER_KEY", "rotated");
    expect(await isOwner(KEY_HASH)).toBe(false);
  });
});

describe("isOwnerRequest", () => {
  function req(cookie?: string): Request {
    return new Request("http://localhost/api/x", {
      method: "POST",
      headers: cookie ? { cookie } : {},
    });
  }

  it("reads the owner cookie among other cookies", async () => {
    vi.stubEnv("OWNER_KEY", KEY);
    expect(
      await isOwnerRequest(req(`a=1; ${OWNER_COOKIE}=${KEY_HASH}; b=2`)),
    ).toBe(true);
  });

  it("false without cookie header or with a wrong value", async () => {
    vi.stubEnv("OWNER_KEY", KEY);
    expect(await isOwnerRequest(req())).toBe(false);
    expect(await isOwnerRequest(req(`${OWNER_COOKIE}=nope`))).toBe(false);
    expect(await isOwnerRequest(req(`x${OWNER_COOKIE}=${KEY_HASH}`))).toBe(false);
  });
});
