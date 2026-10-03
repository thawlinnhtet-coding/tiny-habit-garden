# Current status

Updated: 2026-10-03 (Asia/Rangoon).

## Approved workflow

The user approved the four vertical tickets, default triage labels, and public garden-operation/browser test seam. Final review baseline: `939a5d1`. `AGENTS.md` is canonical agent context; `CLAUDE.md` imports it.

GitHub remains the authoritative tracker. Parent specification #1 stays open. Tickets #2 (first habit) and #3 (watering/growth) are complete. Tickets #4 (private Supabase garden) and #5 (final verification and handoff) are implemented, reviewed, and complete. Their hosted-service validation limits remain explicitly recorded. See `docs/tracker.json` for canonical URLs.

## Implemented

- Next.js landing page, dedicated `/login` and `/signup` pages, Today, My Garden, and create/edit routes.
- Responsive home landing page with an animated pixel-garden preview, habit-loop introduction, and account entry.
- Original transparent PNG sprites for oak, sunflower, mushroom, cactus, wildflower, all five growth stages, and garden scenery. Local licensed Pixelify Sans font.
- Crisp pixel scene, clouds, butterfly motion, plant sway, flower bounce, occasional sparkles, and reduced-motion support.
- Guest habit persistence, creation, editing, and confirmed removal; damaged data preserved with visible errors.
- Once-per-local-date completion, streaks, retained lifetime growth, and milestones at 0/1/3/7/14.
- Shared watering can, drops, bounce, particles, stage transformation, progress, and streak feedback on the garden, Today, and details.
- Supabase email sign-up/sign-in on dedicated account routes, sign-out, confirmation route, and cookie session refresh through Next.js Proxy.
- Shared fluid typography tokens for responsive headings, copy, and labels while preserving browser text-size preferences; touch-sized text inputs and controls.
- Inline habit-name validation plus shared sign-in/sign-up credential validation before Supabase requests.
- Owner-checked PostgreSQL operations, row-level-security read policies, revoked direct client writes, fixed account timezone, server-time check-ins, and unique habit/date records.
- Separate guest/private state and guards against stale responses after account changes.

## Verification

The home route (`/`) was visually checked in the browser after the landing-page update. The 15 library tests pass, including public habit validation and auth credential rules. The full 14-check browser suite passes on desktop and Pixel 7 using an isolated development server. It covers dedicated login/signup routes, account links, auth errors and confirmation messaging (including expired links), guest CRUD, daily completion, keyboard access, reduced motion, and damaged-storage handling. Supabase responses are mocked; these checks do not validate hosted Auth. Typechecking, lint, Prettier, and the production build pass for the responsive typography, validation, and dedicated auth-page changes.

Ten public-operation tests pass, including real local PostgreSQL migration/operations through PGlite. They cover guest persistence/validation, local-date duplicates, streak reset, all milestones, private CRUD/check-ins, owner checks, timezone stability, and visible remote errors.

Type checking, source lint, and production build pass. The final two-axis review of `939a5d1...af27bd9` found zero Standards and zero Spec findings. Earlier findings were fixed. See `docs/reviews/final-v1.md`.

The focused review of dedicated account pages from `51fda90` found zero remaining Standards or Spec findings. The review caught and fixed the expired-confirmation redirect and clarified guest/private garden links.

Production dependency audit reports zero vulnerabilities. Development-tool advisories remain in the component CLI/lint toolchain; avoid blind forced downgrades.

## Hosted setup and remaining verification

Public configuration is present in the ignored `.env.local`. No service-role key is required. The user reports Supabase setup is complete. Follow `docs/supabase-setup.md` and apply `supabase/migrations/202610030001_garden.sql` once to a fresh project.

A public unauthenticated probe reached the hosted API; an anonymous RPC request returned PGRST202. This probe establishes API reachability, not successful authenticated migration validation. Successful hosted sign-up/confirmation/sign-in/sign-out, persistence across devices, direct-table RLS isolation, and simultaneous requests from independent connections have not run. PGlite executes requests on one local engine and cannot prove hosted concurrency. Keep these limits visible until verified.

## Environment notes

Project: `D:\tiny-habit-garden`. Preview: `http://127.0.0.1:3000`. Use Node 24 LTS. The system Node is 22.12.0; the bundled Node 24 runtime was used for validation.

GitHub connector issue writes returned 403, and regional CLI API routing timed out. Existing CLI authentication with an alternate verified API route published the tracker; tokens stayed in memory outside the repository. The current responsive typography and input-validation slice could not be added as a new GitHub issue: issue-write connector returned 403 and the CLI API route timed out. Normal Git pushes work.
