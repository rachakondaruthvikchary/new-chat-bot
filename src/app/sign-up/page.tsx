"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConvergeMark from "@/components/ConvergeMark";
import GoogleButton from "@/components/GoogleButton";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSubmitted(true);
    router.replace("/dashboard");
    router.refresh();
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <ConvergeMark size={56} animate={false} />
        <h1 className="font-display text-xl font-semibold">Check your inbox</h1>
        <p className="max-w-sm text-muted">
          We sent a confirmation link to <strong>{email}</strong>. Confirm
          your email to finish creating your account.
        </p>
        <Link href="/sign-in" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <ConvergeMark size={56} animate={false} />
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-muted">
            Start getting clear answers, in seconds.
          </p>
        </div>

        <GoogleButton label="Continue with Google" />

        <div className="my-6 flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-border" />
          or continue with email
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary"
              placeholder="Ada Lovelace"
            />
          </div>

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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary"
              placeholder="At least 8 characters"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
