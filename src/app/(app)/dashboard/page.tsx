import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  const { data: recentConversations } = await supabase
    .from("conversations")
    .select("id, title, updated_at")
    .eq("user_id", user?.id)
    .order("updated_at", { ascending: false })
    .limit(5);

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Welcome back, {firstName}
      </h1>
      <p className="mt-1 text-muted">
        Here&apos;s a quick look at what you can do next.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/chat"
          className="group rounded-2xl border border-border bg-surface p-6 transition hover:border-primary"
        >
          <div className="mb-3 text-2xl">💬</div>
          <h2 className="font-medium">Start a new chat</h2>
          <p className="mt-1 text-sm text-muted">
            Ask a question and get a clear, fast answer.
          </p>
        </Link>

        <Link
          href="/profile"
          className="group rounded-2xl border border-border bg-surface p-6 transition hover:border-primary"
        >
          <div className="mb-3 text-2xl">👤</div>
          <h2 className="font-medium">Complete your profile</h2>
          <p className="mt-1 text-sm text-muted">
            Add your name and preferences.
          </p>
        </Link>
      </div>

      <div className="mt-10">
        <h2 className="mb-3 text-sm font-medium text-muted">
          Recent conversations
        </h2>
        {recentConversations && recentConversations.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recentConversations.map((c) => (
              <Link
                key={c.id}
                href={`/chat?id=${c.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm transition hover:border-primary"
              >
                <span className="truncate">{c.title}</span>
                <span className="shrink-0 pl-3 text-xs text-muted">
                  {new Date(c.updated_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            No conversations yet. Click &quot;Start a new chat&quot; above to
            begin.
          </div>
        )}
      </div>
    </div>
  );
}
