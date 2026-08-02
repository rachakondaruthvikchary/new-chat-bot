import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  console.log("DEBUG URL:", JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL));
  console.log("DEBUG KEY LEN:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
