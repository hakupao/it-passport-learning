import { describe, it, expect } from "vitest";
import type { UIMessage } from "ai";
import { extractMessageText, isBrowser } from "../useChatSession";

describe("useChatSession helpers", () => {
  it("extractMessageText extracts text parts", () => {
    const msg = { parts: [{ type: "text", text: "hello" }, { type: "text", text: " world" }] } as unknown as UIMessage;
    expect(extractMessageText(msg)).toBe("hello world");
  });

  it("extractMessageText returns empty for no parts", () => {
    expect(extractMessageText({} as unknown as UIMessage)).toBe("");
  });

  it("extractMessageText skips non-text parts", () => {
    const msg = { parts: [{ type: "tool-call", text: "x" }, { type: "text", text: "hi" }] } as unknown as UIMessage;
    expect(extractMessageText(msg)).toBe("hi");
  });

  it("isBrowser returns false in node", () => {
    expect(isBrowser()).toBe(false);
  });
});
