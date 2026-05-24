import type { ReactNode } from "react";
export function GamifiedShell({ children }: { children: ReactNode }): React.ReactElement {
  return <div data-shell="gamified">{children}</div>;
}
