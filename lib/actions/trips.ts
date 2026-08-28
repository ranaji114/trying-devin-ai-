"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { journeySchema, type JourneyInput } from "@/lib/validations/trip";
import type { TripStatus } from "@/types/database";

export interface SaveJourneyResult {
  tripId?: string;
  error?: string;
}

/** Creates a journey with its stops, day placeholders and media rows. */
export async function saveJourney(
  input: JourneyInput,
  status: TripStatus,
): Promise<SaveJourneyResult> {
  const parsed = journeySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Some details are missing." };
  }
  const journey = parsed.data;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in to publish a journey." };

  const cover = journey.photos.find((photo) => photo.isCover) ?? journey.photos[0];

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      title: journey.title,
      description: journey.description,
      tips: journey.tips ?? null,
      location: journey.location,
      travel_style: journey.travelStyle,
      difficulty: journey.difficulty,
      season: journey.season,
      start_date: journey.startDate,
      end_date: journey.endDate,
      cover_image: cover?.publicUrl ?? null,
      status,
    })
    .select("id")
    .single();

  if (tripError || !trip) {
    return { error: tripError?.message ?? "Could not create the journey." };
  }

  const { error: stopsError } = await supabase.from("trip_stops").insert(
    journey.stops.map((stop, index) => ({
      trip_id: trip.id,
      name: stop.name,
      latitude: stop.latitude,
      longitude: stop.longitude,
      position: index,
      arrival_date: stop.arrivalDate ?? null,
      notes: stop.notes ?? null,
    })),
  );

  if (stopsError) {
    await supabase.from("trips").delete().eq("id", trip.id);
    return { error: "Could not save the route stops." };
  }

  if (journey.photos.length > 0) {
    const { error: mediaError } = await supabase.from("trip_media").insert(
      journey.photos.map((photo) => ({
        trip_id: trip.id,
        day_id: null,
        storage_path: photo.storagePath,
        public_url: photo.publicUrl,
        is_cover: photo.isCover,
      })),
    );
    if (mediaError) return { error: "The journey was saved but photos could not be attached." };
  }

  revalidatePath("/");
  revalidatePath("/explore");
  return { tripId: trip.id };
}

export async function deleteTrip(tripId: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in to delete a journey." };

  const { error } = await supabase.from("trips").delete().eq("id", tripId).eq("user_id", user.id);
  if (error) return { error: "Could not delete this journey." };

  revalidatePath("/");
  revalidatePath("/explore");
  return {};
}

export async function updateTripStatus(
  tripId: string,
  status: TripStatus,
): Promise<{ error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in to update a journey." };

  const { error } = await supabase
    .from("trips")
    .update({ status })
    .eq("id", tripId)
    .eq("user_id", user.id);

  if (error) return { error: "Could not update this journey." };

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(`/trip/${tripId}`);
  return {};
}
