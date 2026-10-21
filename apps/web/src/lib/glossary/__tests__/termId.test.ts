// Stage 6 (D-179 / D-180 §0-1) — termId pure hash unit tests (no disk).
//
// Guards the URL-safe term id contract: "t" + FNV-1a32(nfc) + FNV-1a32(nfc + "#"),
// 16 lowercase hex digits, deterministic, NFC-normalized, never containing the
// raw headword's URL-special characters.

import { describe, expect, it } from "vitest";

import { termId } from "../termId";

describe("termId", () => {
  it("has the t + 16 lowercase hex format", () => {
    expect(termId("PDCA")).toMatch(/^t[0-9a-f]{16}$/);
    expect(termId("")).toMatch(/^t[0-9a-f]{16}$/);
  });

  it("is deterministic", () => {
    expect(termId("機能要件")).toBe(termId("機能要件"));
  });

  it("matches the FNV-1a 32-bit reference values", () => {
    // FNV-1a32("") = the offset basis; fnv() below is an independent reference.
    expect(termId("")).toBe("t811c9dc5" + fnv("#"));
    expect(fnv("a")).toBe("e40c292c"); // published FNV-1a 32 test vector
    expect(termId("a")).toBe("te40c292c" + fnv("a#"));
    // multibyte UTF-8 (3 bytes per kana/kanji) against the independent reference
    expect(termId("機能要件")).toBe("t" + fnv("機能要件") + fnv("機能要件#"));
  });

  it("normalizes to NFC (composed ガ === decomposed カ + ゙)", () => {
    const nfc = "ガ";
    const nfd = "ガ";
    expect(nfc).not.toBe(nfd);
    expect(termId(nfc)).toBe(termId(nfd));
  });

  it("never carries URL-special characters of the headword", () => {
    for (const t of ["ISO/IEC 27000", "M&A", "A/Bテスト", "What?", "Ver.1"]) {
      expect(termId(t)).toMatch(/^t[0-9a-f]{16}$/);
      expect(termId(t)).not.toContain("/");
    }
  });

  it("distinguishes different headwords", () => {
    expect(termId("機能要件")).not.toBe(termId("非機能要件"));
  });
});

/**
 * Independent reference FNV-1a 32 over UTF-8 bytes (Buffer + exact float math,
 * not TextEncoder + Math.imul): prime = 2^24 + 0x193, so
 * h * prime mod 2^32 = (h * 0x193 + (h & 0xff) * 2^24) mod 2^32, all < 2^53.
 */
function fnv(s: string): string {
  let h = 0x811c9dc5;
  for (const b of Buffer.from(s.normalize("NFC"), "utf-8")) {
    h = (h ^ b) >>> 0;
    h = (h * 0x193 + (h & 0xff) * 0x1000000) % 0x100000000;
  }
  return h.toString(16).padStart(8, "0");
}
