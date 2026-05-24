import { describe, it, expect, beforeEach } from "vitest";
import {
  type Theme,
  THEMES,
  THEME_STORAGE_KEY,
  DEFAULT_THEME,
  loadTheme,
  saveTheme,
  isValidTheme,
} from "../useTheme";

const createMockStorage = (): Storage => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
};

describe("useTheme helpers", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMockStorage();
  });

  it("THEMES contains exactly 3 values", () => {
    expect(THEMES).toEqual(["gamified", "retro", "terminal"]);
  });

  it("DEFAULT_THEME is gamified", () => {
    expect(DEFAULT_THEME).toBe("gamified");
  });

  it("THEME_STORAGE_KEY is correct", () => {
    expect(THEME_STORAGE_KEY).toBe("itp:theme:v1");
  });

  it("isValidTheme validates known themes", () => {
    expect(isValidTheme("gamified")).toBe(true);
    expect(isValidTheme("retro")).toBe(true);
    expect(isValidTheme("terminal")).toBe(true);
    expect(isValidTheme("unknown")).toBe(false);
    expect(isValidTheme("")).toBe(false);
    expect(isValidTheme(null)).toBe(false);
  });

  it("loadTheme returns DEFAULT_THEME on empty storage", () => {
    expect(loadTheme(storage)).toBe(DEFAULT_THEME);
  });

  it("loadTheme returns stored theme", () => {
    storage.setItem(THEME_STORAGE_KEY, "retro");
    expect(loadTheme(storage)).toBe("retro");
  });

  it("loadTheme returns DEFAULT_THEME on invalid stored value", () => {
    storage.setItem(THEME_STORAGE_KEY, "bogus");
    expect(loadTheme(storage)).toBe(DEFAULT_THEME);
  });

  it("saveTheme persists to storage", () => {
    saveTheme(storage, "terminal");
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe("terminal");
  });

  it("saveTheme swallows storage errors", () => {
    const broken: Storage = {
      ...storage,
      setItem: () => { throw new Error("quota"); },
    };
    expect(() => saveTheme(broken, "retro")).not.toThrow();
  });
});
