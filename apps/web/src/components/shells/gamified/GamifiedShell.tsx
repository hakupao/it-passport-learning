"use client";

import type { ReactNode } from "react";
import { GamifiedNav } from "./GamifiedNav";

export function GamifiedShell({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white" data-shell="gamified" style={{ "--nav-height": "3rem" } as React.CSSProperties}>
      <GamifiedNav />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
    </div>
  );
}
