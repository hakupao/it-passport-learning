"use client";

import { RetroWindow } from "./RetroWindow";

export function RetroBook(): React.ReactElement {
  return (
    <div className="p-4">
      <RetroWindow title="📖 Book.exe — Error">
        <div className="bg-[#c0c0c0] p-6 flex flex-col items-center gap-4 text-black">
          <div className="flex items-start gap-4">
            <div className="text-4xl leading-none">🚫</div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold">Book.exe has encountered a problem.</p>
              <p className="text-xs">
                The requested content is being rebuilt.
                Stage 8-11 pipeline in progress.
              </p>
              <p className="text-[10px] text-[#808080]">
                Error code: PIPELINE_IN_PROGRESS_0x0811
              </p>
            </div>
          </div>
          <button
            type="button"
            className="bg-[#c0c0c0] border-2 border-outset-retro px-6 py-0.5 text-xs active:border-inset-retro min-w-[5rem]"
          >
            OK
          </button>
        </div>
      </RetroWindow>
    </div>
  );
}
