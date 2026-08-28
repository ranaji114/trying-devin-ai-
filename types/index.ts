import type {
  Difficulty,
  ProfileRow,
  Season,
  TravelStyle,
  TripDayRow,
  TripMediaRow,
  TripRow,
  TripStopRow,
} from "./database";

export type Profile = ProfileRow;
export type Trip = TripRow;
export type TripStop = TripStopRow;
export type TripDay = TripDayRow;
export type TripMedia = TripMediaRow;

/** A trip plus the author information needed to render a card. */
export interface TripSummary {
  id: string;
  title: string;
  location: string | null;
  coverImage: string | null;
  startDate: string | null;
  endDate: string | null;
  travelStyle: TravelStyle | null;
  difficulty: Difficulty | null;
  season: Season | null;
  author: Pick<Profile, "username" | "full_name" | "avatar_url">;
  isSaved?: boolean;
}

/** Everything the trip detail page renders. */
export interface TripDetail extends TripSummary {
  description: string | null;
  tips: string | null;
  status: TripRow["status"];
  authorId: string;
  stops: TripStop[];
  days: Array<TripDay & { media: TripMedia[] }>;
  media: TripMedia[];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DestinationSuggestion {
  name: string;
  latitude: number;
  longitude: number;
}
