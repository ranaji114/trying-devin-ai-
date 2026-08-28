"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ToggleFollowResult {
  following: boolean;
  error?: string;
}

export async function toggleFollow(
  targetProfileId: string,
  username: string,
): Promise<ToggleFollowResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { following: false, error: "Log in to follow travelers." };
  if (user.id === targetProfileId) return { following: false, error: "You cannot follow yourself." };

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetProfileId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetProfileId);
    if (error) return { following: true, error: "Could not unfollow." };
    revalidatePath(`/profile/${username}`);
    return { following: false };
  }

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, following_id: targetProfileId });

  if (error) return { following: false, error: "Could not follow this traveler." };

  revalidatePath(`/profile/${username}`);
  return { following: true };
}
