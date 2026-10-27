// Stage 7 Phase 3 (D-196 §0-2, Task 3 review I-2) — the practice page's `from` resolution.
import { describe, expect, it, vi } from "vitest";

import { termId } from "../../glossary/termId";
import { loadReaderIndex, loadUnit } from "../../textbook/reader";
import { resolveSessionFrom } from "../sessionFrom";

const UNIT = "management-08-25-u01";

describe("resolveSessionFrom", () => {
  it("from=today needs no reader index", async () => {
    const index = vi.fn(loadReaderIndex);
    expect(await resolveSessionFrom({ from: "today" }, "ja", { loadReaderIndex: index, loadUnit })).toEqual({
      kind: "today",
    });
    expect(await resolveSessionFrom({}, "ja", { loadReaderIndex: index, loadUnit })).toBeNull();
    expect(index).not.toHaveBeenCalled();
  });

  it("a known unit → its title in the locale and its terms", async () => {
    const raw = await loadUnit(UNIT);
    const from = await resolveSessionFrom({ from: "unit", unit: UNIT }, "en");
    expect(from).toEqual({
      kind: "unit",
      unitId: UNIT,
      title: raw.title_en,
      terms: raw.terms.map((t) => ({ id: termId(t.term), term: t.term })),
    });
  });

  it("an unknown or malformed unit → null", async () => {
    expect(await resolveSessionFrom({ from: "unit", unit: "management-08-25-u99" }, "ja")).toBeNull();
    expect(await resolveSessionFrom({ from: "unit", unit: "../x" }, "ja")).toBeNull();
  });

  it("a unit that fails to load → null (logged); the practice set still runs", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const failing = () => Promise.reject(new Error("disk"));
    expect(await resolveSessionFrom({ from: "unit", unit: UNIT }, "ja", { loadReaderIndex, loadUnit: failing })).toBeNull();
    expect(
      await resolveSessionFrom({ from: "unit", unit: UNIT }, "ja", { loadReaderIndex: failing, loadUnit }),
    ).toBeNull();
    expect(err).toHaveBeenCalledTimes(2);
    err.mockRestore();
  });
});
