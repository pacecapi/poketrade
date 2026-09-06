# PokeTrade

A demo marketplace for buying and selling Pokémon cards, built with React + Vite.

## Running locally

```bash
npm install
npm run dev
```

## Building for production / deploying (e.g. Vercel)

```bash
npm install
npm run build
```

User accounts are real (see Supabase below). Everything else is still a prototype: listings, purchases, and the wishlist live in memory in the browser and reset on reload, and there is no real payment processing.

## Supabase (user accounts)

Auth is handled by Supabase: `auth.users` holds the credentials and sessions,
and a `public.profiles` row is created automatically for each new user.

### 1. Create the project

1. Sign in at [supabase.com](https://supabase.com) and create a new project.
2. Open **SQL Editor**, paste the contents of
   [`supabase/migrations/0001_profiles.sql`](supabase/migrations/0001_profiles.sql)
   and run it. (With the CLI linked: `supabase db push`.)
3. Under **Authentication > Providers**, make sure **Email** is enabled.
   While developing you can turn off "Confirm email" so sign-ups log in
   straight away.

### 2. Point the app at it

Copy `.env.example` to `.env` and fill in the two values from
**Project Settings > API**:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Both are public-by-design — the anon key only grants what the Row Level
Security policies allow. The `service_role` key must never go in this file.

For the deployed site, add the same two variables in the Vercel project's
**Environment Variables** and redeploy.

### 3. Install and run

```
npm install
npm run dev
```

Without the env vars the app still runs; the sign-in dialog just reports that
Supabase isn't configured.
