import type { ProfileRow, TripRow } from "@/types/database";
import type { TripSummary } from "@/types";

export type TripWithAuthor = TripRow & {
  profiles: Pick<ProfileRow, "username" | "full_name" | "avatar_url"> | null;
};

export const TRIP_CARD_COLUMNS =
  "id, title, location, cover_image, start_date, end_date, travel_style, difficulty, season, status, created_at, user_id, profiles!trips_user_id_fkey (username, full_name, avatar_url)";

const UNKNOWN_AUTHOR = { username: "traveler", full_name: "Traveler", avatar_url: null };

export function toTripSummary(row: TripWithAuthor, isSaved?: boolean): TripSummary {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    coverImage: row.cover_image,
    startDate: row.start_date,
    endDate: row.end_date,
    travelStyle: row.travel_style,
    difficulty: row.difficulty,
    season: row.season,
    author: row.profiles ?? UNKNOWN_AUTHOR,
    isSaved,
  };
}
