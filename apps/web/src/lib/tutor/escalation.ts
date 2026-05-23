// Pure heuristic deciding whether to escalate tutor model effort before each send.

import type { UIMessage } from "ai";

const KEYWORDS = [
  "わからない",
  "理解できない",
  "もっと詳しく",
  "詳しく説明",
  "難しい",
  "なぜ",
  "不懂",
  "不理解",
  "详细解释",
  "更详细",
  "太难了",
  "为什么",
  "don't understand",
  "explain more",
  "more detail",
  "too hard",
  "confused",
  "why is",
];

function extractText(msg: UIMessage): string {
  const parts = (msg as { parts?: Array<{ type: string; text?: string }> }).parts;
  if (!parts) return "";
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

function hasKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

function sharesTopic(userText: string, prevUserText: string): boolean {
  const cjkRe = /[぀-ヿ㐀-鿿＀-￯]/g;
  const aCjk: string[] = userText.match(cjkRe) ?? [];
  const bCjk: string[] = prevUserText.match(cjkRe) ?? [];
  for (const ch of aCjk) {
    if (bCjk.includes(ch)) return true;
  }

  const wordRe = /[a-zA-Z]{4,}/g;
  const aWords = (userText.match(wordRe) ?? []).map((w) => w.toLowerCase());
  const bWords = new Set((prevUserText.match(wordRe) ?? []).map((w) => w.toLowerCase()));
  for (const w of aWords) {
    if (bWords.has(w)) return true;
  }

  return false;
}

export function shouldEscalate(messages: UIMessage[]): boolean {
  if (messages.length === 0) return false;

  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") return false;

  const lastUserText = extractText(last);

  if (hasKeyword(lastUserText)) return true;

  if (messages.length >= 3) {
    const assistantMsg = messages[messages.length - 2];
    if (assistantMsg && assistantMsg.role === "assistant") {
      const assistantText = extractText(assistantMsg);
      if (assistantText.length < 100) {
        const prevUserMsg = messages
          .slice(0, messages.length - 2)
          .reverse()
          .find((m) => m.role === "user");
        if (prevUserMsg) {
          const prevUserText = extractText(prevUserMsg);
          if (sharesTopic(lastUserText, prevUserText)) return true;
        }
      }
    }
  }

  return false;
}
