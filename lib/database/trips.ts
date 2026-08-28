import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { TripDetail, TripSummary } from "@/types";
import type { TripDayRow, TripMediaRow, TripStopRow } from "@/types/database";
import { difficultySchema, seasonSchema, travelStyleSchema } from "@/lib/validations/trip";
import { TRIP_CARD_COLUMNS, toTripSummary, type TripWithAuthor } from "./mappers";

export interface TripFilters {
  query?: string;
  location?: string;
  travelStyle?: string;
  difficulty?: string;
  season?: string;
  maxDuration?: number;
  limit?: number;
}

async function savedTripIds(tripIds: string[]): Promise<Set<string>> {
  if (tripIds.length === 0) return new Set();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from("saved_trips")
    .select("trip_id")
    .eq("user_id", user.id)
    .in("trip_id", tripIds);

  return new Set((data ?? []).map((row) => row.trip_id));
}

function withinDuration(trip: TripWithAuthor, maxDuration?: number): boolean {
  if (!maxDuration) return true;
  if (!trip.start_date || !trip.end_date) return false;
  const days =
    Math.round(
      (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / 86_400_000,
    ) + 1;
  return days <= maxDuration;
}

export async function listPublishedTrips(filters: TripFilters = {}): Promise<TripSummary[]> {
  const supabase = createClient();
  let request = supabase
    .from("trips")
    .select(TRIP_CARD_COLUMNS)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 24);

  if (filters.query) {
    const term = `%${filters.query}%`;
    request = request.or(`title.ilike.${term},location.ilike.${term},description.ilike.${term}`);
  }
  if (filters.location) request = request.ilike("location", `%${filters.location}%`);
  const travelStyle = travelStyleSchema.safeParse(filters.travelStyle);
  if (travelStyle.success) request = request.eq("travel_style", travelStyle.data);

  const difficulty = difficultySchema.safeParse(filters.difficulty);
  if (difficulty.success) request = request.eq("difficulty", difficulty.data);

  const season = seasonSchema.safeParse(filters.season);
  if (season.success) request = request.eq("season", season.data);

  const { data, error } = await request.returns<TripWithAuthor[]>();
  if (error) throw new Error(error.message);

  const trips = (data ?? []).filter((trip) => withinDuration(trip, filters.maxDuration));
  const saved = await savedTripIds(trips.map((trip) => trip.id));
  return trips.map((trip) => toTripSummary(trip, saved.has(trip.id)));
}

export async function getTripDetail(id: string): Promise<TripDetail | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("trips")
    .select(`${TRIP_CARD_COLUMNS}, description, tips`)
    .eq("id", id)
    .maybeSingle<TripWithAuthor>();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const [stopsResult, daysResult, mediaResult, saved] = await Promise.all([
    supabase
      .from("trip_stops")
      .select("*")
      .eq("trip_id", id)
      .order("position", { ascending: true })
      .returns<TripStopRow[]>(),
    supabase
      .from("trip_days")
      .select("*")
      .eq("trip_id", id)
      .order("day_number", { ascending: true })
      .returns<TripDayRow[]>(),
    supabase
      .from("trip_media")
      .select("*")
      .eq("trip_id", id)
      .order("created_at", { ascending: true })
      .returns<TripMediaRow[]>(),
    savedTripIds([id]),
  ]);

  const media = mediaResult.data ?? [];

  return {
    ...toTripSummary(data, saved.has(id)),
    description: data.description,
    tips: data.tips,
    status: data.status,
    authorId: data.user_id,
    stops: stopsResult.data ?? [],
    days: (daysResult.data ?? []).map((day) => ({
      ...day,
      media: media.filter((item) => item.day_id === day.id),
    })),
    media,
  };
}

export async function listTripsByUsername(
  username: string,
  options: { includeDrafts?: boolean } = {},
): Promise<TripSummary[]> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (!profile) return [];

  let request = supabase
    .from("trips")
    .select(TRIP_CARD_COLUMNS)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (!options.includeDrafts) request = request.eq("status", "published");

  const { data, error } = await request.returns<TripWithAuthor[]>();
  if (error) throw new Error(error.message);

  const trips = data ?? [];
  const saved = await savedTripIds(trips.map((trip) => trip.id));
  return trips.map((trip) => toTripSummary(trip, saved.has(trip.id)));
}

export async function listSavedTrips(userId: string): Promise<TripSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("saved_trips")
    .select(`trip_id, created_at, trips!inner (${TRIP_CARD_COLUMNS})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<Array<{ trip_id: string; trips: TripWithAuthor }>>();

  if (error) throw new Error(error.message);
  return (data ?? []).filter((row) => row.trips).map((row) => toTripSummary(row.trips, true));
}

export async function listVisitedPlaces(username: string): Promise<string[]> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return [];

  const { data } = await supabase
    .from("trips")
    .select("trip_stops (name)")
    .eq("user_id", profile.id)
    .eq("status", "published")
    .returns<Array<{ trip_stops: Array<{ name: string }> }>>();

  const names = (data ?? []).flatMap((trip) => trip.trip_stops.map((stop) => stop.name));
  return Array.from(new Set(names));
}

export async function listProfileStops(
  username: string,
): Promise<Array<{ name: string; latitude: number; longitude: number }>> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return [];

  const { data } = await supabase
    .from("trips")
    .select("trip_stops (name, latitude, longitude)")
    .eq("user_id", profile.id)
    .eq("status", "published")
    .returns<Array<{ trip_stops: Array<{ name: string; latitude: number; longitude: number }> }>>();

  return (data ?? []).flatMap((trip) => trip.trip_stops);
}
