// Track L L4-a (D-217) — the zh UI catalog must not carry Japanese-only words written in kanji,
// which the kana-based scan cannot see. 分野 (the three exam categories) is 大类 in zh; 领域 stays
// for topics; 正答率 is 正确率 (not a D-189 book label). Extend the list when L4-b finds more.
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const zh = readFileSync(path.join(__dirname, "../../messages/zh.json"), "utf-8");

describe("messages/zh.json has no Japanese-only kanji words", () => {
  it.each(["分野", "正答率"])("no %s", (word) => {
    expect(zh.split(word).length - 1).toBe(0);
  });

  it("names the three categories 大类 and keeps 领域 for topics", () => {
    expect(zh).toContain("三个大类的正确率");
    expect(zh).toContain("大类・领域");
  });
});
