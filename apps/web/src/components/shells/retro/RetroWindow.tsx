import type { ReactNode } from "react";

interface RetroWindowProps {
  title: string;
  children: ReactNode;
  statusLeft?: string;
  statusRight?: string;
}

export function RetroWindow({ title, children, statusLeft, statusRight }: RetroWindowProps): React.ReactElement {
  return (
    <div className="bg-[#c0c0c0] border-2 border-outset-retro shadow-retro">
      <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-0.5 text-white font-bold text-xs flex justify-between items-center">
        <span>{title}</span>
        <span className="flex gap-0.5">
          <button type="button" className="w-4 h-3.5 bg-[#c0c0c0] text-black text-[9px] flex items-center justify-center border-2 border-outset-retro">_</button>
          <button type="button" className="w-4 h-3.5 bg-[#c0c0c0] text-black text-[9px] flex items-center justify-center border-2 border-outset-retro">□</button>
          <button type="button" className="w-4 h-3.5 bg-[#c0c0c0] text-black text-[9px] flex items-center justify-center border-2 border-outset-retro">×</button>
        </span>
      </div>
      {children}
      {(statusLeft ?? statusRight) && (
        <div className="bg-[#c0c0c0] border-t border-[#808080] px-2 py-0.5 text-[10px] flex justify-between">
          <span>{statusLeft}</span>
          <span>{statusRight}</span>
        </div>
      )}
    </div>
  );
}
