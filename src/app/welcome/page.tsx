import Link from "next/link";
import ConvergeMark from "@/components/ConvergeMark";

export default function WelcomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-background px-6 py-12">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <ConvergeMark size={72} animate={false} />
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Meet Converge
          </h1>
          <p className="max-w-sm text-balance text-muted sm:text-lg">
            Ask anything. Get answers that think fast and stay clear —
            powered by AI, built for how you actually work.
          </p>
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <Link
          href="/sign-up"
          className="w-full rounded-xl bg-primary px-6 py-3 text-center font-medium text-white transition hover:opacity-90"
        >
          Create an account
        </Link>
        <Link
          href="/sign-in"
          className="w-full rounded-xl border border-border px-6 py-3 text-center font-medium text-foreground transition hover:bg-surface"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
