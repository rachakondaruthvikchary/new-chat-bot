"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfileForm({
  initialName,
  email,
  createdAt,
}: {
  initialName: string;
  email: string;
  createdAt: string;
}) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: name },
    });

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="mx-auto max-w-lg px-8 py-10">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Profile
      </h1>
      <p className="mt-1 text-muted">Manage your account details.</p>

      <div className="mt-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-medium text-white">
          {name.charAt(0).toUpperCase() || "?"}
        </div>
        <div>
          <p className="font-medium">{name || "Unnamed user"}</p>
          <p className="text-sm text-muted">{email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Display name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="cursor-not-allowed rounded-xl border border-border bg-background px-4 py-2.5 text-muted"
          />
          <p className="text-xs text-muted">
            Email changes aren&apos;t supported yet.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Member since</label>
          <p className="text-sm text-muted">
            {new Date(createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {saved && (
          <p className="text-sm text-accent-mint">Profile updated.</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 w-fit rounded-xl bg-primary px-6 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
