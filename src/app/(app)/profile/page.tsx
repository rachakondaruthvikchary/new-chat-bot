import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ProfileForm
      initialName={user?.user_metadata?.full_name || ""}
      email={user?.email || ""}
      createdAt={user?.created_at || new Date().toISOString()}
    />
  );
}
