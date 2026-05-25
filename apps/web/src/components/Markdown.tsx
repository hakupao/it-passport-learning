"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className }: MarkdownProps) {
  if (!children) return null;
  return (
    <div className={className}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
