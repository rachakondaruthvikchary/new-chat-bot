import { createClient } from "@/lib/supabase/server";
import ThemeToggle from "@/components/ThemeToggle";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-lg px-8 py-10">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Settings
      </h1>
      <p className="mt-1 text-muted">
        Manage how Converge looks and behaves.
      </p>

      <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-medium">Appearance</h2>
        <p className="mt-1 text-sm text-muted">
          Choose between light and dark mode.
        </p>
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-medium">Account</h2>
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">User ID</span>
            <span className="font-mono text-xs text-muted">{user?.id}</span>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-danger/30 bg-surface p-6">
        <h2 className="font-medium text-danger">Danger zone</h2>
        <p className="mt-1 text-sm text-muted">
          Account deletion isn&apos;t available yet — coming in a later
          phase alongside data export.
        </p>
      </section>
    </div>
  );
}
