import { NextResponse, type NextRequest } from "next/server";
import type { DestinationSuggestion } from "@/types";

interface NominatimPlace {
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
}

/** Server-side proxy for OpenStreetMap Nominatim (keeps a proper User-Agent and avoids CORS). */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json<DestinationSuggestion[]>([]);
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "0");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "TrekLog/1.0 (travel journey logging app)",
        "Accept-Language": "en",
      },
      next: { revalidate: 86_400 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Destination lookup failed." }, { status: 502 });
    }

    const places = (await response.json()) as NominatimPlace[];
    const suggestions: DestinationSuggestion[] = places.map((place) => ({
      name: place.display_name,
      latitude: Number(place.lat),
      longitude: Number(place.lon),
    }));

    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json({ error: "Destination lookup failed." }, { status: 502 });
  }
}
