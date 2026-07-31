import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
  const email = user.email || "";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar name={name} email={email} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
