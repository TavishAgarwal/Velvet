# Velvet

A curated, invite-only community app. Built on Expo + Supabase.

## What It Is
Velvet is a hyper-curated, application-gated mobile community. Users apply for membership, admins approve or reject, and approved members get access to a luxurious member directory, curated events, direct messaging, and an invite referral system. The aesthetic is dark luxury—deep blacks, warm gold accents, editorial typography, and soft glows.

## Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Expo (React Native) |
| Language | TypeScript |
| Routing | Expo Router |
| Backend | Supabase |
| Styling | NativeWind + Tailwind |
| Data | TanStack Query v5 |
| Animations | React Native Reanimated |

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account

### Setup
1. Clone the repo
2. npm install
3. Copy .env.example to .env.local and fill in values
4. Run Supabase migrations
5. npx expo start

## Environment Variables
EXPO_PUBLIC_SUPABASE_URL — your Supabase project URL
EXPO_PUBLIC_SUPABASE_ANON_KEY — your Supabase anon key
EXPO_PUBLIC_OPENAI_API_KEY — OpenAI key for AI messaging
EXPO_PUBLIC_POSTHOG_API_KEY — PostHog analytics key (optional)

## Project Structure
- `app/` — Application screens and routing (Expo Router)
- `components/` — Reusable React Native UI components
- `contexts/` — React Context providers for global state
- `hooks/` — Custom React hooks for data fetching and logic
- `lib/` — Utility functions, constants, and external service configurations
- `supabase/` — Database schema, migrations, seed data, and Edge Functions
- `assets/` — Static image assets and fonts
- `docs/` — Project documentation and guides
- `locales/` — Localization strings (i18n)
- `__tests__/` — Jest testing suite
- `types/` — TypeScript type definitions
- `.claude-logs/` — AI development logs

## Admin Setup
To set a user as an admin, access your Supabase dashboard and manually update their record in the `profiles` table. Change their `role` field value to `admin`. This grants them access to the `/admin` routing and all administrative features.

## Seed Data
To populate the application with demonstration data, you can run the provided seed script. Execute `supabase db reset` or run the `supabase/seed.sql` file against your database to insert mock profiles, applications, events, and messages for testing.
