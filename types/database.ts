export type TripStatus = "draft" | "published";
export type TravelStyle = "road-trip" | "trek" | "backpacking" | "family" | "solo" | "weekend";
export type Difficulty = "easy" | "moderate" | "hard";
export type Season = "spring" | "summer" | "monsoon" | "autumn" | "winter";

export type ProfileRow = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export type TripRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tips: string | null;
  location: string | null;
  travel_style: TravelStyle | null;
  difficulty: Difficulty | null;
  season: Season | null;
  start_date: string | null;
  end_date: string | null;
  cover_image: string | null;
  status: TripStatus;
  created_at: string;
  updated_at: string;
}

export type TripStopRow = {
  id: string;
  trip_id: string;
  name: string;
  latitude: number;
  longitude: number;
  position: number;
  arrival_date: string | null;
  notes: string | null;
  created_at: string;
}

export type TripDayRow = {
  id: string;
  trip_id: string;
  day_number: number;
  date: string | null;
  title: string | null;
  description: string | null;
  created_at: string;
}

export type TripMediaRow = {
  id: string;
  trip_id: string;
  day_id: string | null;
  storage_path: string | null;
  public_url: string;
  is_cover: boolean;
  created_at: string;
}

export type SavedTripRow = {
  id: string;
  user_id: string;
  trip_id: string;
  created_at: string;
}

export type FollowRow = {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string; username: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      trips: {
        Row: TripRow;
        Insert: Partial<TripRow> & { user_id: string; title: string };
        Update: Partial<TripRow>;
        Relationships: [];
      };
      trip_stops: {
        Row: TripStopRow;
        Insert: Omit<TripStopRow, "id" | "created_at"> & { id?: string };
        Update: Partial<TripStopRow>;
        Relationships: [];
      };
      trip_days: {
        Row: TripDayRow;
        Insert: Omit<TripDayRow, "id" | "created_at"> & { id?: string };
        Update: Partial<TripDayRow>;
        Relationships: [];
      };
      trip_media: {
        Row: TripMediaRow;
        Insert: Omit<TripMediaRow, "id" | "created_at"> & { id?: string };
        Update: Partial<TripMediaRow>;
        Relationships: [];
      };
      saved_trips: {
        Row: SavedTripRow;
        Insert: Omit<SavedTripRow, "id" | "created_at"> & { id?: string };
        Update: Partial<SavedTripRow>;
        Relationships: [];
      };
      follows: {
        Row: FollowRow;
        Insert: Omit<FollowRow, "created_at">;
        Update: Partial<FollowRow>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      trip_status: TripStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
}
