# Showcase pack tooling

Produces `showcase/` (video, poster, gallery, facts) from real footage of the app running on an invented demo account. Nothing here touches the production site or database.

## Pipeline

```bash
# 1. Local Supabase-compatible dev database (Docker: Postgres + PostgREST, gateway on :54321)
bash scripts/showcase/devdb/up.sh
node scripts/showcase/devdb/gateway.mjs &

# 2. Env for everything below
set -a; source scripts/showcase/devdb/.env.showcase; set +a
export NEXTAUTH_URL=http://localhost:3000 NEXTAUTH_SECRET=showcase-local-nextauth-secret

# 3. App, production build (no dev badge)
(cd frontend && npx next build && npx next start -p 3000 &)

# 4. Demo data (re-run before each recording; it replaces the previous demo data)
npx tsx scripts/seed-demo-data.ts

# 5. Film -> scripts/showcase/out/{frames/, events.json, master.mp4}
node scripts/showcase/record.mjs

# 6. Edit -> showcase/showcase-1920x1200.mp4 (Remotion 4, isolated in scripts/showcase/video)
(cd scripts/showcase/video && npm install && node render.mjs)

# 7. Gallery -> showcase/gallery/*.png (reseed first)
npx tsx scripts/seed-demo-data.ts && node scripts/showcase/gallery.mjs
```

The poster is a frame from the rendered video, for example:
`ffmpeg -ss 30.0 -i showcase/showcase-1920x1200.mp4 -frames:v 1 -q:v 1 showcase/cover-poster.jpg`.
Pick the timestamp from `scripts/showcase/out/edit.json`, which lists each named moment in output seconds.

## Safety

`seed-demo-data.ts` refuses to run unless the Supabase URL is localhost, or its host is listed in `SHOWCASE_ALLOWED_HOSTS` (for a staging project). It also refuses anything containing `imirezervimi.al` or `PRODUCTION_SUPABASE_URL`, or when `NODE_ENV`/`VERCEL_ENV` is `production`. Demo rows are identified by `@example.com` emails, and re-seeding deletes and recreates them.

## Notes

- Customer sign-in is simulated by minting the NextAuth session cookie with the local `NEXTAUTH_SECRET`. The salon signs in through a one-time magic-link token the seed creates.
- `devdb/local_overrides.sql` disables RLS in the local database. The salon dashboard reads appointments with the anon key, and no RLS policy allows that, so with RLS on it shows no appointments. This is very likely the cause of the "salon can't see appointments" bug in production.
- Recording uses the Chrome DevTools screencast (JPEG q95, 2880×1800 at deviceScaleFactor 2), not Playwright video. Every pointer move, click, scroll, wait and named moment is logged in `events.json`.
- `video/timeline.mjs` turns the log into the edit: trims loads, caps pauses, speeds up scrolls, places the camera zooms, dissolves between takes, and fades in and out.
- Remotion needs a paid company license for companies with more than 3 people.
