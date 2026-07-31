import { Suspense } from "react";
import ChatClient from "@/components/ChatClient";

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Loading…</div>}>
      <ChatClient />
    </Suspense>
  );
}
