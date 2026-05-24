"use client";

export function TerminalBook(): React.ReactElement {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)] max-w-5xl mx-auto p-4 gap-3 font-mono text-sm">
      {/* Header */}
      <div className="border-b border-[#444] pb-2">
        <div className="text-[#4ec9b0] font-semibold"># book</div>
        <div className="text-[#555] text-xs">IT Passport textbook viewer</div>
      </div>

      <div className="flex-1 space-y-1 py-2">
        <div className="flex items-center gap-0">
          <span className="text-[#6a9955]">you@itp</span>
          <span className="text-[#808080]">:</span>
          <span className="text-[#569cd6]">~</span>
          <span className="text-[#808080]">$ </span>
          <span className="text-[#d4d4d4]">cat /book/index</span>
        </div>

        <div className="pl-2 space-y-1 pt-1">
          <div className="text-[#f44747]">cat: /book/index: content pipeline in progress</div>
          <div className="text-[#555]">&nbsp;</div>
          <div className="text-[#d4d4d4]">[Stage 8-11] Building web-ready textbook...</div>
          <div className="text-[#d4d4d4]">████░░░░░░░░░░░░░░░░ 25%</div>
          <div className="text-[#555]">&nbsp;</div>
          <div className="text-[#6a9955]"># Pipeline stages:</div>
          <div className="text-[#555]">  [✓] OCR extraction</div>
          <div className="text-[#555]">  [✓] Content classification</div>
          <div className="text-[#555]">  [✓] Trilingual translation</div>
          <div className="text-[#555]">  [ ] Web rendering (in progress)</div>
        </div>

        <div className="pt-3 flex items-center gap-0">
          <span className="text-[#6a9955]">you@itp</span>
          <span className="text-[#808080]">:</span>
          <span className="text-[#569cd6]">~</span>
          <span className="text-[#808080]">$ </span>
          <span className="text-[#d4d4d4] animate-pulse">▌</span>
        </div>
      </div>
    </div>
  );
}
