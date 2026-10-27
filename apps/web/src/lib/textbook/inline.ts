// Stage 7 Phase 3 (D-196 §0-12) — the two inline markers of v2 unit text:
//   **語**      keyword (D-195 §5 キーワード太字)
//   [[jp:語]]   the Japanese exam wording inside zh / en prose (D-195 §5 日本語原語の明示)
// parseInline → React nodes (strings + elements, never an HTML string);
// stripInline → plain text for the v1 compat fields; inlineErrors → validateV2.
// Unclosed or nested markers are not markup: they print (and strip) as-is, and
// inlineErrors reports them. Pure .ts (no JSX): Node scripts import this through
// validateV2.ts with native type stripping.

import { createElement, type ReactNode } from "react";

type Token = { t: "text" | "key" | "jp"; s: string };

const KEY = "**";
const JP_OPEN = "[[jp:";
const CLOSE = "]]";

/** Split into text / keyword / jp-label tokens; malformed markers stay in text tokens. */
function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let text = "";
  const flush = () => {
    if (text !== "") out.push({ t: "text", s: text });
    text = "";
  };
  let i = 0;
  while (i < src.length) {
    const key = src.startsWith(KEY, i);
    const jp = !key && src.startsWith(JP_OPEN, i);
    if (key || jp) {
      const open = key ? KEY : JP_OPEN;
      const close = key ? KEY : CLOSE;
      const j = src.indexOf(close, i + open.length);
      if (j === -1 || j === i + open.length) {
        // unclosed or empty: the opener is plain text
        text += open;
        i += open.length;
        continue;
      }
      const inner = src.slice(i + open.length, j);
      const nested = inner.includes(KEY) || inner.includes("[[") || inner.includes(CLOSE);
      if (nested) {
        text += src.slice(i, j + close.length);
      } else {
        flush();
        out.push({ t: key ? "key" : "jp", s: inner });
      }
      i = j + close.length;
      continue;
    }
    text += src[i];
    i += 1;
  }
  flush();
  return out;
}

/** v2 text → React nodes: `<strong>` for keywords, `<span lang="ja" data-inline="jp">` for JP labels. */
export function parseInline(src: string, cls?: { key?: string; jp?: string }): ReactNode[] {
  return tokenize(src).map((tok, i) =>
    tok.t === "text"
      ? tok.s
      : tok.t === "key"
        ? createElement("strong", { key: i, className: cls?.key }, tok.s)
        : createElement("span", { key: i, lang: "ja", "data-inline": "jp", className: cls?.jp }, tok.s),
  );
}

/** v2 text → plain text (markers removed, their content kept). */
export function stripInline(src: string): string {
  return tokenize(src)
    .map((tok) => tok.s)
    .join("");
}

/** Problems that parseInline would print as raw markers (empty = well-formed). */
export function inlineErrors(src: string): string[] {
  const errors: string[] = [];
  const toks = tokenize(src);
  toks.forEach((tok, i) => {
    // `***x***` tokenizes as key "*x" + text "*": more than two asterisks at a keyword edge is not markup
    if (tok.t === "key") {
      const edge =
        tok.s.startsWith("*") || tok.s.endsWith("*") || toks[i - 1]?.s.endsWith("*") === true || toks[i + 1]?.s.startsWith("*") === true;
      if (edge) errors.push(`stray "*" at a keyword edge: ${JSON.stringify(tok.s.slice(0, 40))}`);
    }
    if (tok.t !== "text") return;
    for (const m of [KEY, "[[", CLOSE]) {
      if (tok.s.includes(m)) errors.push(`stray or unclosed ${JSON.stringify(m)} in ${JSON.stringify(tok.s.slice(0, 40))}`);
    }
  });
  return errors;
}
