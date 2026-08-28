"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ToggleSaveResult {
  saved: boolean;
  error?: string;
}

export async function toggleSaveTrip(tripId: string): Promise<ToggleSaveResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { saved: false, error: "Log in to save journeys." };

  const { data: existing } = await supabase
    .from("saved_trips")
    .select("id")
    .eq("user_id", user.id)
    .eq("trip_id", tripId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("saved_trips").delete().eq("id", existing.id);
    if (error) return { saved: true, error: "Could not remove this journey." };
    revalidatePath("/saved");
    revalidatePath(`/trip/${tripId}`);
    return { saved: false };
  }

  const { error } = await supabase
    .from("saved_trips")
    .insert({ user_id: user.id, trip_id: tripId });

  if (error) return { saved: false, error: "Could not save this journey." };

  revalidatePath("/saved");
  revalidatePath(`/trip/${tripId}`);
  return { saved: true };
}
