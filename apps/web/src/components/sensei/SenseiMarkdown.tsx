// D-181 §0-7 — renders an AI 先生 reply. react-markdown with its defaults: raw
// HTML is not rendered (no rehype-raw). Links: only https: and site-relative
// URLs survive `urlTransform` (anything else loses its href); https links open
// in a new tab with rel="noopener noreferrer". Images are shown as their alt
// text: the CSP's img-src would block a remote image anyway, and a model-chosen
// image URL should not be fetched. remark-gfm adds tables / autolinks / strikethrough
// (autolinks pass through the same urlTransform and link component).

import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/** https: or site-relative (no scheme, not protocol-relative); null for anything else. */
export function safeUrl(url: string): string | null {
  // whitespace / control characters / backslashes: browsers strip or rewrite
  // them (`java\tscript:`, `/\host` → `//host`), so they are never trusted
  if (/[\u0000- \u007f\\]/.test(url)) return null;
  if (url.startsWith("//")) return null;
  if (/^https:/i.test(url)) return url;
  const colon = url.indexOf(":");
  if (colon === -1) return url;
  const delimiter = url.search(/[/?#]/);
  return delimiter !== -1 && delimiter < colon ? url : null;
}

const components: Components = {
  a: ({ href, children }) =>
    href && /^https:/i.test(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <a href={href}>{children}</a>
    ),
  img: ({ alt }) => <span>{alt}</span>,
  // a wide table scrolls inside the panel instead of widening it (phone drawer)
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table>{children}</table>
    </div>
  ),
};

const REMARK_PLUGINS = [remarkGfm];

export function SenseiMarkdown({ text }: { text: string }): React.ReactElement {
  return (
    <Markdown remarkPlugins={REMARK_PLUGINS} urlTransform={(url) => safeUrl(url)} components={components}>
      {text}
    </Markdown>
  );
}
