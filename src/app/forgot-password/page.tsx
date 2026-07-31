"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import ConvergeMark from "@/components/ConvergeMark";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <ConvergeMark size={56} animate={false} />
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="text-sm text-muted">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6 text-center">
            <p className="text-sm">
              If an account exists for <strong>{email}</strong>, a reset link
              is on its way.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary"
                placeholder="you@example.com"
              />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          Remembered it?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
