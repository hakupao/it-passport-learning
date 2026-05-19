// Unit tests for the module-level singleton boot loader (Session 34 Step 3, Q3=b).

import { afterEach, describe, expect, it } from "vitest";

import {
  __resetDataSourceForTesting,
  __setDataSourceForTesting,
  getDataSource,
  warmUp,
} from "../index";
import { FsDataSource } from "../FsDataSource";
import type { DataSource } from "../DataSource";

afterEach(() => {
  __resetDataSourceForTesting();
});

describe("getDataSource", () => {
  it("returns the same instance on repeated calls (singleton)", () => {
    const a = getDataSource();
    const b = getDataSource();
    expect(a).toBe(b);
  });

  it("returns an FsDataSource by default", () => {
    const ds = getDataSource();
    expect(ds).toBeInstanceOf(FsDataSource);
  });
});

describe("warmUp", () => {
  it("eagerly warms index + glossary; cache hit on second call", async () => {
    let indexCalls = 0;
    let glossaryCalls = 0;
    const stub: DataSource = {
      loadIndex: async () => {
        indexCalls += 1;
        return { stub: true } as unknown as Awaited<
          ReturnType<DataSource["loadIndex"]>
        >;
      },
      loadGlossary: async () => {
        glossaryCalls += 1;
        return { stub: true } as unknown as Awaited<
          ReturnType<DataSource["loadGlossary"]>
        >;
      },
      loadPage: async () => {
        throw new Error("not used");
      },
      loadChapter: async () => [],
      loadWholeBook: async () => [],
    };
    __setDataSourceForTesting(stub);

    await warmUp();
    expect(indexCalls).toBe(1);
    expect(glossaryCalls).toBe(1);

    // Calling warmUp again still hits the same stub; this guards against the
    // singleton being silently swapped between calls.
    await warmUp();
    expect(indexCalls).toBe(2);
    expect(glossaryCalls).toBe(2);
  });
});

describe("test-only injection helpers", () => {
  it("__setDataSourceForTesting swaps the singleton", () => {
    const stub = {} as DataSource;
    __setDataSourceForTesting(stub);
    expect(getDataSource()).toBe(stub);
  });

  it("__resetDataSourceForTesting clears the singleton", () => {
    const stub = {} as DataSource;
    __setDataSourceForTesting(stub);
    __resetDataSourceForTesting();
    const fresh = getDataSource();
    expect(fresh).not.toBe(stub);
    expect(fresh).toBeInstanceOf(FsDataSource);
  });
});
