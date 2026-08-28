# TrekLog

Document Your Journey. Guide the Next Traveler.

TrekLog is a travel logging and route discovery platform: travelers document a trip
(route, stops, story, photos), publish it, and other travelers discover, follow and
save the route for their own trip.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (Auth, Postgres,
Storage) and MapLibre GL with OpenStreetMap tiles.

## Routes

| Route | Description |
| --- | --- |
| `/` | Hero, search, recent logs, featured journey |
| `/explore` | Journey grid with search and filters |
| `/search` | Categorized results: destinations, journeys, travelers |
| `/trip/[id]` | Journey detail: story, route map, timeline, photos, tips, save |
| `/create` | Multi-step journey builder (auth required) |
| `/profile/[username]` | Traveler profile, travel map, published journeys |
| `/saved` | Saved journeys (auth required) |
| `/login`, `/signup` | Authentication |

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase values
```

### 1. Create the schema

Run `supabase/migrations/0001_init.sql` against your project — either paste it into the
Supabase SQL editor, or:

```bash
psql "$SUPABASE_DB_URL" -f supabase/migrations/0001_init.sql
```

This creates the `profiles`, `trips`, `trip_stops`, `trip_days`, `trip_media`,
`saved_trips` and `follows` tables, all row level security policies, the
`handle_new_user` trigger, and the public `trip-media` storage bucket.

### 2. Seed demo data (optional)

```bash
npm run seed
```

Creates two demo travelers with published journeys. Requires `SUPABASE_SERVICE_ROLE_KEY`.

### 3. Run

```bash
npm run dev      # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | seed script only | Admin key, never sent to the browser |
| `SUPABASE_DB_URL` | migrations only | Postgres connection string |

## Deploying to Vercel

Import the repository, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
in the project's environment variables, and add the deployment URL to Supabase
Authentication → URL Configuration (site URL and `/auth/callback` redirect).
