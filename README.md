# Tiny Habit Garden 🌱

Turn small real-life habits into a cozy pixel garden. Each habit starts as a seed, and every daily completion gives its plant a little more care. Over time, your garden fills with trees, flowers, mushrooms, and cacti.

**Create a habit → choose a plant → complete your habit → water your plant → watch it grow.**

[Visit the live garden](https://tiny-habit-garden.vercel.app) · [GitHub Issues](https://github.com/thawlinnhtet-coding/tiny-habit-garden/issues)

## A little care, one day at a time

- **My Garden:** a clickable pixel-art scene with soil, fences, clouds, butterflies, and your growing plants.
- **Today:** daily habits, watering feedback, growth progress, and consecutive-day streaks.
- **Your habits:** create, rename, remove, and choose between oak, sunflower, mushroom, cactus, and wildflower plants.
- **Cozy animation:** a watering can, droplets, plant bounces, pixel particles, and transformations when a plant reaches its next stage.
- **Clerk accounts:** email/password, verification codes, password recovery, and Google/GitHub sign-in with Clerk’s original provider icons.
- **Guest or account:** explore a garden in your browser, or sign up and sign in for a private Supabase garden.
- **Day and night:** Auto follows device time (Day 6 a.m.–6 p.m.); choose Day or Night yourself and the browser remembers your preference. Night adds a pixel moon, stars, shooting stars, and fireflies with smooth lighting transitions.
- **Accessible controls:** responsive layouts, keyboard access, inline form validation, and reduced-motion support.

The project stays intentionally small: no coins, shops, leaderboards, social features, or AI.

## Watering, streaks, and growth

Completing a real-life habit is what waters its plant. These are one action, with **one completion per habit per local calendar day**. There is no separate watering chore.

After completing a habit, Today shows **Watered today** and the action becomes unavailable until the next local day. At the start of that next day, the habit becomes available again. Yesterday's streak remains active while you still have time to complete today's habit.

| What happens after your first completion?          | Streak             | Plant growth                                                     |
| -------------------------------------------------- | ------------------ | ---------------------------------------------------------------- |
| Today: you complete the habit                      | 1 day              | 1 lifetime completion; the seed becomes a sprout                 |
| Tomorrow: you have not completed it yet            | Still 1 day        | Unchanged; today's completion is available                       |
| Tomorrow: you complete it                          | 2 days             | 2 lifetime completions; progress toward the next stage increases |
| You skip all of tomorrow; the following day starts | 0 days             | Still 1 lifetime completion; your sprout is preserved            |
| You return after that missed day and complete it   | A new 1-day streak | 2 lifetime completions; growth continues from where you left off |

**Missing a day pauses growth. It never shrinks, withers, or resets your plant.** Only the streak resets. Growth measures all the care you have given the habit, including completions from earlier streaks.

### Five growth stages

All five plant types use these lifetime-completion milestones, with their own sprites:

| Stage        | Lifetime completions needed |
| ------------ | --------------------------: |
| Seed         |                           0 |
| Sprout       |                           1 |
| Small plant  |                           3 |
| Mature plant |                           7 |
| Fully grown  |                          14 |

Every completion adds progress, but the sprite changes only at a milestone. For example, a second completion keeps the sprout sprite; the third turns it into a small plant. Fully grown plants remain in the garden, and their streaks and total completions can keep increasing.

Days follow a timezone rather than a rolling 24-hour countdown. Guest gardens use the browser's timezone. A private garden's timezone is captured on its first visit and remains fixed; Supabase uses server time to record the completion date. Open pages refresh garden data periodically and when the window regains focus.

## Where your garden is saved

| Mode      | Storage                      | What to expect                                                                           |
| --------- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| Guest     | This browser's local storage | Progress stays in this browser; clearing its storage removes the guest garden            |
| Signed in | Supabase PostgreSQL          | Habits belong to the signed-in account, protected by owner checks and row-level security |

Guest and private gardens are separate. Signing in does not automatically import guest habits. Signing out returns you to the browser's guest garden.

## Tech stack

Next.js App Router · React · TypeScript · Tailwind CSS · shadcn/ui with Base UI · Clerk Auth and Supabase PostgreSQL · Motion · Lucide React

## Run locally

Use **Node 24 LTS** and npm.

```sh
git clone https://github.com/thawlinnhtet-coding/tiny-habit-garden.git
cd tiny-habit-garden
npm ci
```

The guest garden runs without account configuration. To enable Clerk accounts and private storage, copy `.env.example` to `.env.local` and set:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
CLERK_SECRET_KEY=sk_test_YOUR_SECRET
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Follow the [Clerk setup guide](docs/clerk-setup.md) to enable Google/GitHub, connect Clerk to Supabase's native third-party authentication, and apply both database migrations in filename order. Existing projects need only the new Clerk migration. Existing private garden rows are preserved, but a verified administrator mapping is required to transfer old Supabase ownership to a Clerk account. Passwords and old sessions are not automatically migrated.

Keep credentials out of Git. The secret key is server-only; this app does not use a Supabase service-role key. Device-time lighting does not affect habit dates or streaks.

The current migration targets Clerk **Development** on the existing Vercel URL at the user's request. This is a demo setup: Clerk production requires a domain you own. See the setup guide before deploying.

```sh
npm run dev -- --hostname 127.0.0.1
```

Open [the local app](http://127.0.0.1:3000). Start at `/` for the introduction, `/garden` for the garden, or `/today` for daily care. Account pages are `/login` and `/signup`.

## Check the project

```sh
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Guest, lighting, landing, and missing-configuration browser checks run without Clerk keys. Configured Clerk UI checks require Clerk development keys and Google/GitHub enabled; those checks are explicitly skipped when keys are absent. Restart the server after configuring keys.

Library tests cover public garden operations, growth milestones, daily completion, streak resets, validation, and local PostgreSQL behavior through PGlite. Playwright covers desktop and mobile guest flows and configured Clerk account entry. PostgreSQL tests exercise the migrated owner checks, retained legacy data, and row-level security. Hosted consent, email verification, sessions, and independent-request concurrency require live verification.

The previous Supabase Auth release is live until the Clerk rollout is configured. Hosted Clerk authentication, private-account persistence, sign-out, account isolation, and concurrent check-ins require live verification. See [current status](docs/current-status.md) for the precise evidence and remaining checks.

## Deploy to Vercel

The live project is connected to this GitHub repository. Pushes to `main` trigger production builds. Set both Clerk keys and both public Supabase variables in Vercel, enable the native integration, and apply the Clerk database migration before publishing. The previous deployment notes describe the Supabase Auth release; use [Clerk setup](docs/clerk-setup.md) for this migration. Keep development Clerk keys for the current demo URL; use an owned domain and production Clerk instance for a production launch.

## Pixel assets

Original 48×48 transparent PNG sprites live in `public/sprites/`. Plants have five sprites each; scenery includes grass, soil, fences, rocks, clouds, butterflies, and watering effects. The app uses pixelated image rendering to keep them crisp.

Regenerate the sprites with Python and Pillow:

```sh
python scripts/generate_sprites.py public/sprites
```

[Pixelify Sans](https://github.com/google/fonts/tree/main/ofl/pixelifysans) is bundled locally under the SIL Open Font License; see [the font license](public/fonts/OFL.txt). Other pixel art in this repository is original to Tiny Habit Garden.

## Project context

- [Product requirements](docs/product.md) and [V1 specification](docs/v1-spec.md)
- [Current progress and verification](docs/current-status.md)
- [Domain vocabulary](GLOSSARY.md)
- [Agent instructions](AGENTS.md)
- [GitHub issue tracker](https://github.com/thawlinnhtet-coding/tiny-habit-garden/issues)
