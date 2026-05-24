"use client";

import type { ReactNode } from "react";
import { RetroMenuBar } from "./RetroMenuBar";

export function RetroShell({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <div
      className="min-h-screen bg-[#008080] p-2 sm:p-4 font-[Tahoma,sans-serif] text-xs"
      data-shell="retro"
    >
      {/* Main application window */}
      <div className="bg-[#c0c0c0] border-2 border-outset-retro shadow-retro">
        {/* Title bar */}
        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-0.5 text-white font-bold text-xs flex justify-between items-center">
          <span>📖 IT Passport Study v2.0</span>
          <span className="flex gap-0.5">
            <button
              type="button"
              className="w-4 h-3.5 bg-[#c0c0c0] text-black text-[9px] flex items-center justify-center border-2 border-outset-retro"
            >
              _
            </button>
            <button
              type="button"
              className="w-4 h-3.5 bg-[#c0c0c0] text-black text-[9px] flex items-center justify-center border-2 border-outset-retro"
            >
              □
            </button>
            <button
              type="button"
              className="w-4 h-3.5 bg-[#c0c0c0] text-black text-[9px] flex items-center justify-center border-2 border-outset-retro"
            >
              ×
            </button>
          </span>
        </div>

        {/* Menu bar */}
        <RetroMenuBar />

        {/* Content area */}
        <div className="bg-white border-2 border-inset-retro m-1 min-h-[calc(100vh-8rem)]">
          <main id="main-content" tabIndex={-1} className="focus:outline-none">
            {children}
          </main>
        </div>

        {/* Status bar */}
        <div className="bg-[#c0c0c0] border-t border-[#808080] px-2 py-0.5 text-[10px] flex justify-between">
          <span className="border border-inset-retro px-2">Ready</span>
          <span className="border border-inset-retro px-2">IT Passport Learning System</span>
        </div>
      </div>
    </div>
  );
}
