import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { TripSummary } from "@/types";
import { TRIP_CARD_COLUMNS, toTripSummary, type TripWithAuthor } from "./mappers";

export interface SearchResults {
  destinations: Array<{ name: string; tripCount: number }>;
  journeys: TripSummary[];
  travelers: Array<{ username: string; full_name: string | null; avatar_url: string | null }>;
}

export async function search(term: string): Promise<SearchResults> {
  const trimmed = term.trim();
  if (!trimmed) return { destinations: [], journeys: [], travelers: [] };

  const supabase = createClient();
  const pattern = `%${trimmed}%`;

  const [journeysResult, travelersResult, stopsResult] = await Promise.all([
    supabase
      .from("trips")
      .select(TRIP_CARD_COLUMNS)
      .eq("status", "published")
      .or(`title.ilike.${pattern},location.ilike.${pattern},description.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(24)
      .returns<TripWithAuthor[]>(),
    supabase
      .from("profiles")
      .select("username, full_name, avatar_url")
      .or(`username.ilike.${pattern},full_name.ilike.${pattern}`)
      .limit(12),
    supabase
      .from("trip_stops")
      .select("name, trips!inner (status)")
      .ilike("name", pattern)
      .eq("trips.status", "published")
      .limit(100)
      .returns<Array<{ name: string }>>(),
  ]);

  const counts = new Map<string, number>();
  for (const stop of stopsResult.data ?? []) {
    counts.set(stop.name, (counts.get(stop.name) ?? 0) + 1);
  }
  for (const trip of journeysResult.data ?? []) {
    if (trip.location && trip.location.toLowerCase().includes(trimmed.toLowerCase())) {
      counts.set(trip.location, counts.get(trip.location) ?? 0);
    }
  }

  return {
    destinations: Array.from(counts.entries())
      .map(([name, tripCount]) => ({ name, tripCount }))
      .sort((a, b) => b.tripCount - a.tripCount)
      .slice(0, 8),
    journeys: (journeysResult.data ?? []).map((trip) => toTripSummary(trip)),
    travelers: travelersResult.data ?? [],
  };
}
