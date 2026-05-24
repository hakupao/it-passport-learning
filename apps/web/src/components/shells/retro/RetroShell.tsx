import type { ReactNode } from "react";
export function RetroShell({ children }: { children: ReactNode }): React.ReactElement {
  return <div data-shell="retro">{children}</div>;
}
