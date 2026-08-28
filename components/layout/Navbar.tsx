import Link from "next/link";
import { Mountain } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { NavbarClient } from "./NavbarClient";

export async function Navbar() {
  let username: string | null = null;
  let fullName: string | null = null;
  let avatarUrl: string | null = null;

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      username = profile?.username ?? null;
      fullName = profile?.full_name ?? null;
      avatarUrl = profile?.avatar_url ?? null;
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-[17px] font-semibold text-ink">
          <Mountain className="h-5 w-5 text-accent" aria-hidden />
          TrekLog
        </Link>
        <NavbarClient username={username} fullName={fullName} avatarUrl={avatarUrl} />
      </div>
    </header>
  );
}
