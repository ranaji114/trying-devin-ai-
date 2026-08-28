/**
 * Seeds demo travelers and published journeys.
 *
 *   node --env-file=.env.local scripts/seed.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TRAVELERS = [
  {
    email: "aarav@treklog.demo",
    password: "treklog-demo-1",
    username: "aarav",
    fullName: "Aarav Mehta",
    bio: "Motorcycle routes across the Himalaya. Slow travel, long days.",
  },
  {
    email: "nisha@treklog.demo",
    password: "treklog-demo-1",
    username: "nisha",
    fullName: "Nisha Rao",
    bio: "Coastal rides, ferry timetables and quiet beaches.",
  },
];

const JOURNEYS = [
  {
    owner: "aarav",
    title: "Eight days across Spiti Valley",
    location: "Spiti Valley, Himachal Pradesh",
    description:
      "We rode from Shimla to Kaza over five days, taking altitude slowly and stopping in villages along the Sutlej.\n\nThe road past Nako turns to gravel in stretches, and the last hours into Kaza are cold even in July. Every village we stopped in had a place to sleep if we asked.",
    tips: "Carry cash — ATMs in Kaza are unreliable.\nInner Line Permit needed beyond Jangi if you enter from Shimla.\nSleep one night below 3,500 m before pushing to Kaza.",
    travel_style: "road-trip",
    difficulty: "hard",
    season: "summer",
    start_date: "2026-06-08",
    end_date: "2026-06-15",
    cover_image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=70",
    stops: [
      { name: "Shimla", latitude: 31.1048, longitude: 77.1734, arrival_date: "2026-06-08" },
      { name: "Sarahan", latitude: 31.5148, longitude: 77.7936, arrival_date: "2026-06-09" },
      { name: "Nako", latitude: 31.8797, longitude: 78.6303, arrival_date: "2026-06-11" },
      { name: "Tabo", latitude: 32.0955, longitude: 78.3823, arrival_date: "2026-06-12" },
      { name: "Kaza", latitude: 32.2264, longitude: 78.0714, arrival_date: "2026-06-14" },
    ],
  },
  {
    owner: "nisha",
    title: "A slow week down the Konkan coast",
    location: "Konkan Coast, Maharashtra",
    description:
      "Six days along the coastal road from Alibaug to Malvan, mostly on state highways and two ferries.\n\nWe stayed in homestays booked the same morning, ate at whatever was open, and swam every afternoon.",
    tips: "The Dabhol ferry stops running by dusk.\nMonsoon closes several beach roads — go in November.",
    travel_style: "road-trip",
    difficulty: "easy",
    season: "autumn",
    start_date: "2026-11-02",
    end_date: "2026-11-08",
    cover_image:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1600&q=70",
    stops: [
      { name: "Alibaug", latitude: 18.6411, longitude: 72.8722, arrival_date: "2026-11-02" },
      { name: "Harihareshwar", latitude: 17.9946, longitude: 73.0169, arrival_date: "2026-11-03" },
      { name: "Ganpatipule", latitude: 17.1449, longitude: 73.2685, arrival_date: "2026-11-05" },
      { name: "Malvan", latitude: 16.0667, longitude: 73.4667, arrival_date: "2026-11-07" },
    ],
  },
  {
    owner: "aarav",
    title: "Four days trekking to Kedarkantha",
    location: "Uttarkashi, Uttarakhand",
    description:
      "A short winter trek from Sankri with two camps before the summit push. Snow from Juda ka Talab upwards.\n\nWe started the summit climb at 4 a.m. and were back at camp before noon.",
    tips: "Rent gaiters in Sankri, they are cheaper than in Dehradun.\nWater freezes overnight — keep a bottle inside your sleeping bag.",
    travel_style: "trek",
    difficulty: "moderate",
    season: "winter",
    start_date: "2026-01-10",
    end_date: "2026-01-13",
    cover_image:
      "https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=1600&q=70",
    stops: [
      { name: "Sankri", latitude: 31.0836, longitude: 78.1817, arrival_date: "2026-01-10" },
      { name: "Juda ka Talab", latitude: 31.0475, longitude: 78.1725, arrival_date: "2026-01-11" },
      { name: "Kedarkantha Base", latitude: 31.0281, longitude: 78.1806, arrival_date: "2026-01-12" },
      { name: "Kedarkantha Summit", latitude: 31.0247, longitude: 78.1836, arrival_date: "2026-01-13" },
    ],
  },
];

async function ensureTraveler(traveler) {
  const { data: created, error } = await supabase.auth.admin.createUser({
    email: traveler.email,
    password: traveler.password,
    email_confirm: true,
    user_metadata: { username: traveler.username, full_name: traveler.fullName },
  });

  let userId = created?.user?.id;

  if (error) {
    if (!/already/i.test(error.message)) throw error;
    const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 });
    userId = list?.users.find((user) => user.email === traveler.email)?.id;
  }

  if (!userId) throw new Error(`Could not resolve user for ${traveler.email}`);

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    username: traveler.username,
    full_name: traveler.fullName,
    bio: traveler.bio,
  });
  if (profileError) throw profileError;

  return userId;
}

async function main() {
  const ids = {};
  for (const traveler of TRAVELERS) {
    ids[traveler.username] = await ensureTraveler(traveler);
    console.log(`traveler ready: @${traveler.username}`);
  }

  for (const journey of JOURNEYS) {
    const userId = ids[journey.owner];
    const { stops, owner, ...trip } = journey;

    const { data: existing } = await supabase
      .from("trips")
      .select("id")
      .eq("user_id", userId)
      .eq("title", trip.title)
      .maybeSingle();

    if (existing) {
      console.log(`journey exists: ${trip.title}`);
      continue;
    }

    const { data: inserted, error } = await supabase
      .from("trips")
      .insert({ ...trip, user_id: userId, status: "published" })
      .select("id")
      .single();
    if (error) throw error;

    const { error: stopsError } = await supabase.from("trip_stops").insert(
      stops.map((stop, index) => ({ ...stop, trip_id: inserted.id, position: index })),
    );
    if (stopsError) throw stopsError;

    console.log(`journey created: ${trip.title}`);
  }

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
