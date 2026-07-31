"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/welcome");
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
    >
      Sign out
    </button>
  );
}
