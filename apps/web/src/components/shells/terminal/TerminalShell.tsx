import type { ReactNode } from "react";
export function TerminalShell({ children }: { children: ReactNode }): React.ReactElement {
  return <div data-shell="terminal">{children}</div>;
}
