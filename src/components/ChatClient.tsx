"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import MessageContent from "@/components/MessageContent";

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

const MAX_FILE_CHARS = 8000;

export default function ChatClient() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    content: string;
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl && idFromUrl !== activeId) {
      loadMessages(idFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations() {
    setLoadingConvos(true);
    setError(null);
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Couldn't load your conversations.");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoadingConvos(false);
    }
  }

  async function loadMessages(id: string) {
    setActiveId(id);
    setLoadingMessages(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) throw new Error("Couldn't load this conversation.");
      const data = await res.json();
      setMessages(
        (data.messages || []).map((m: Message) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleNewChat() {
    setError(null);
    try {
      const res = await fetch("/api/conversations", { method: "POST" });
      if (!res.ok) throw new Error("Couldn't start a new chat.");
      const data = await res.json();
      setConversations((prev) => [data.conversation, ...prev]);
      setActiveId(data.conversation.id);
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this conversation? This can't be undone.")) return;
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Couldn't delete this conversation.");
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const readableTypes = [
      "text/plain",
      "text/markdown",
      "text/csv",
      "application/json",
    ];
    const looksReadable =
      readableTypes.includes(file.type) || /\.(txt|md|csv|json)$/i.test(file.name);

    if (!looksReadable) {
      setError(
        "Only text-based files (.txt, .md, .csv, .json) are supported right now."
      );
      e.target.value = "";
      return;
    }

    if (file.size > 1_000_000) {
      setError("File is too large. Please keep it under 1MB for now.");
      e.target.value = "";
      return;
    }

    try {
      const text = await file.text();
      setAttachedFile({
        name: file.name,
        content: text.slice(0, MAX_FILE_CHARS),
      });
      setError(null);
    } catch {
      setError("Couldn't read that file.");
    } finally {
      e.target.value = "";
    }
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() && !attachedFile) return;

    let conversationId = activeId;

    // Auto-create a conversation if none is selected yet
    if (!conversationId) {
      try {
        const res = await fetch("/api/conversations", { method: "POST" });
        if (!res.ok) throw new Error("Couldn't start a new chat.");
        const data = await res.json();
        conversationId = data.conversation.id;
        setActiveId(conversationId);
        setConversations((prev) => [data.conversation, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        return;
      }
    }

    const userContent = attachedFile
      ? `${input.trim()}\n\n[Attached file: ${attachedFile.name}]\n\`\`\`\n${attachedFile.content}\n\`\`\``
      : input.trim();

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: userContent },
    ];
    setMessages(nextMessages);
    setInput("");
    setAttachedFile(null);
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(
          res.status === 401
            ? "Your session expired. Please sign in again."
            : "The AI didn't respond. Please try again."
        );
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantText,
          };
          return updated;
        });
      }

      loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      // Roll back the optimistic user message on failure
      setMessages((prev) => prev.slice(0, prev.length - 1));
    } finally {
      setSending(false);
    }
  }

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* Conversation list */}
      <div className="flex w-72 shrink-0 flex-col border-r border-border bg-surface">
        <div className="flex flex-col gap-3 p-4">
          <button
            onClick={handleNewChat}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            + New chat
          </button>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loadingConvos ? (
            <p className="px-2 text-sm text-muted">Loading…</p>
          ) : filteredConversations.length === 0 ? (
            <p className="px-2 text-sm text-muted">
              {search ? "No matches." : "No conversations yet."}
            </p>
          ) : (
            filteredConversations.map((c) => (
              <div
                key={c.id}
                onClick={() => loadMessages(c.id)}
                className={`group mb-1 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                  activeId === c.id
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-background"
                }`}
              >
                <span className="truncate">{c.title}</span>
                <button
                  onClick={(e) => handleDelete(c.id, e)}
                  className={`ml-2 shrink-0 opacity-0 transition group-hover:opacity-100 ${
                    activeId === c.id ? "text-white" : "text-muted"
                  }`}
                  aria-label="Delete conversation"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        {error && (
          <div className="border-b border-danger/30 bg-danger/10 px-6 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loadingMessages ? (
            <p className="text-sm text-muted">Loading conversation…</p>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 text-3xl">💬</div>
              <h2 className="font-display text-lg font-semibold">
                Ask anything
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted">
                Start a new conversation or pick one from the sidebar.
              </p>
            </div>
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
              {messages.map((m, i) => (
                <div
                  key={m.id || i}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-white"
                        : "border border-border bg-surface"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <MessageContent content={m.content || "…"} />
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <form
          onSubmit={handleSend}
          className="border-t border-border bg-surface px-6 py-4"
        >
          <div className="mx-auto flex max-w-2xl flex-col gap-2">
            {attachedFile && (
              <div className="flex w-fit items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted">
                📎 {attachedFile.name}
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="text-danger"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.md,.csv,.json"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 rounded-xl border border-border px-3 py-2.5 text-muted transition hover:bg-background"
                aria-label="Attach file"
              >
                📎
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e as unknown as FormEvent);
                  }
                }}
                placeholder="Message Converge…"
                rows={1}
                className="max-h-40 flex-1 resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={sending || (!input.trim() && !attachedFile)}
                className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {sending ? "…" : "Send"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
