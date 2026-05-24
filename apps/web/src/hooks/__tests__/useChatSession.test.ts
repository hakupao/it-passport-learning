import { describe, it, expect } from "vitest";
import { extractMessageText, isBrowser } from "../useChatSession";

describe("useChatSession helpers", () => {
  it("extractMessageText extracts text parts", () => {
    const msg = { parts: [{ type: "text", text: "hello" }, { type: "text", text: " world" }] };
    expect(extractMessageText(msg as any)).toBe("hello world");
  });

  it("extractMessageText returns empty for no parts", () => {
    expect(extractMessageText({} as any)).toBe("");
  });

  it("extractMessageText skips non-text parts", () => {
    const msg = { parts: [{ type: "tool-call", text: "x" }, { type: "text", text: "hi" }] };
    expect(extractMessageText(msg as any)).toBe("hi");
  });

  it("isBrowser returns false in node", () => {
    expect(isBrowser()).toBe(false);
  });
});
