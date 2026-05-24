"use client";

import type React from "react";

interface TerminalPromptProps {
  text: string;
}

export function TerminalPrompt({ text }: TerminalPromptProps): React.ReactElement {
  return (
    <div className="font-mono text-sm leading-relaxed">
      <span className="text-[#6a9955]">you@itp</span>
      <span className="text-[#808080]">:</span>
      <span className="text-[#569cd6]">~</span>
      <span className="text-[#808080]">$ </span>
      <span className="text-[#d4d4d4]">{text}</span>
    </div>
  );
}
