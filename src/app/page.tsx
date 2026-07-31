"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConvergeMark from "@/components/ConvergeMark";
import { createClient } from "@/lib/supabase/client";

const MIN_DISPLAY_MS = 2400;

export default function SplashScreen() {
  const router = useRouter();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    async function resolveDestination() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const elapsed = Date.now() - start;
      const remaining = Math.max(MIN_DISPLAY_MS - elapsed, 0);

      setTimeout(() => {
        if (cancelled) return;
        setFadeOut(true);
        setTimeout(() => {
          if (cancelled) return;
          router.replace(session ? "/dashboard" : "/welcome");
        }, 400);
      }, remaining);
    }

    resolveDestination();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main
      className={`flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-background px-6 text-center transition-opacity duration-400 ease-out ${
        fadeOut ? "opacity-0" : "opacity-100 animate-[fadeIn_0.6s_ease-out]"
      }`}
    >
      <ConvergeMark size={88} />

      <div className="flex flex-col items-center gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Converge
        </h1>
        <p className="max-w-xs text-sm text-muted sm:text-base">
          Every question, one clear answer.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </main>
  );
}
