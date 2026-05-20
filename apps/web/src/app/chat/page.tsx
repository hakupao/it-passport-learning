// Phase 2 Step 9 — standalone /chat page hosting the <Chat /> surface.
//
// Step 12 will wrap this in the 3-tab Layout per D-085 §2.3; for Step 9 the
// component is mounted on its own route so the first UI data point (Module C
// re-estimate input per D-094 §2.4) is captured without coupling to layout
// scaffolding work.

import { Chat } from "@/components/Chat";

export const metadata = {
  title: "Chat — IT パスポート 三語学習",
  description: "AI チューターと教科書ベースで対話（α 自用）",
};

export default function ChatPage(): React.ReactElement {
  return <Chat />;
}
