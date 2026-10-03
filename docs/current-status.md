# Current status

Updated: 2026-10-03 (Asia/Rangoon).

## Approved workflow

The user approved the four vertical tickets, default triage labels, and public garden-operation/browser test seam. Final review baseline: `939a5d1`. `AGENTS.md` is canonical agent context; `CLAUDE.md` imports it.

GitHub remains the authoritative tracker. Parent specification #1 stays open. Tickets #2 (first habit) and #3 (watering/growth) are complete. Tickets #4 (private Supabase garden) and #5 (final verification and handoff) are implemented, reviewed, and complete. Their hosted-service validation limits remain explicitly recorded. See `docs/tracker.json` for canonical URLs.

## Implemented

The README now introduces the project, live app, features, stack, local setup, deployment, and assets. It explains daily availability, consecutive-day streaks, permanent lifetime growth, missed-day examples, and all five growth milestones. This documents existing behavior; no growth or streak rules changed. All eight existing guest-garden tests passed, including next-day availability, missed-day streak reset with retained growth, and growth milestones. Documentation formatting and whitespace checks passed.

- Next.js landing page, dedicated `/login` and `/signup` pages, Today, My Garden, and create/edit routes.
- Responsive home landing page with an animated pixel-garden preview, habit-loop introduction, and account entry.
- Original transparent PNG sprites for oak, sunflower, mushroom, cactus, wildflower, all five growth stages, and garden scenery. Local licensed Pixelify Sans font.
- Crisp pixel scene, clouds, butterfly motion, plant sway, flower bounce, occasional sparkles, and reduced-motion support.
- Guest habit persistence, creation, editing, and confirmed removal; damaged data preserved with visible errors.
- Once-per-local-date completion, streaks, retained lifetime growth, and milestones at 0/1/3/7/14.
- Shared watering can, drops, bounce, particles, stage transformation, progress, and streak feedback on the garden, Today, and details.
- Supabase email sign-up/sign-in on dedicated account routes, PKCE and legacy token-hash confirmation callbacks, sign-out, and cookie session refresh through Next.js Proxy.
- Shared fluid typography tokens for responsive headings, copy, and labels while preserving browser text-size preferences; touch-sized text inputs and controls.
- Inline validation on the dedicated auth pages: each email/password field reports its own error on blur or submit, clears as corrected, and focuses the first invalid field before any Supabase request.
- Owner-checked PostgreSQL operations, row-level-security read policies, revoked direct client writes, fixed account timezone, server-time check-ins, and unique habit/date records.
- Separate guest/private state and guards against stale responses after account changes.
- One planting CTA in the empty Today state; populated Today keeps its heading action. A compact accessible account menu holds email, save-location context, sign-out, and guest sign-in options.

## Verification

The account-menu and Today UX update passes lint, typechecking, 19 library tests, and the full 20-check desktop/Pixel 7 browser suite. Browser checks cover the single empty-state CTA, guest sign-in navigation, signed-in account context, Escape dismissal and focus return, and sign-out. Desktop and mobile screenshots were inspected. Auth responses are mocked; hosted sign-out remains unverified.

The two-axis review of the UX update at `29c20bc`, using the agreed scaffold baseline and previous review context, found zero Standards breaches, zero actionable smells, and zero Spec findings.

The home route (`/`) was visually checked in the browser after the landing-page update. The 19 library tests pass, including public habit validation, auth credential rules, and confirmation callback behavior. The full 20-check browser suite passes on desktop and Pixel 7 using an isolated development server. It covers inline auth errors and clearing corrected fields, immediate signup when email confirmation is disabled, confirmation redirect settings, dedicated login/signup routes, account links, auth errors and expired-link messaging, guest CRUD, daily completion, keyboard access, reduced motion, and damaged-storage handling. Supabase responses are mocked; these checks do not validate hosted Auth. Typechecking, lint, Prettier, and the production build pass for the responsive typography, validation, and dedicated auth-page changes.

Ten public-operation tests pass, including real local PostgreSQL migration/operations through PGlite. They cover guest persistence/validation, local-date duplicates, streak reset, all milestones, private CRUD/check-ins, owner checks, timezone stability, and visible remote errors.

Type checking, source lint, and production build pass. The final two-axis review of `939a5d1...af27bd9` found zero Standards and zero Spec findings. Earlier findings were fixed. See `docs/reviews/final-v1.md`.

The focused review of dedicated account pages from `51fda90` found zero remaining Standards or Spec findings. The review caught and fixed the expired-confirmation redirect and clarified guest/private garden links.

Production dependency audit reports zero vulnerabilities. Development-tool advisories remain in the component CLI/lint toolchain; avoid blind forced downgrades.

## Vercel deployment

The user authorized public Vercel deployment on 2026-10-03. Production is live at [tiny-habit-garden.vercel.app](https://tiny-habit-garden.vercel.app) under `thawlinnhtet52-2489s-projects/tiny-habit-garden`, connected to this GitHub repository. Vercel uses Next.js, Node 24.x, `npm ci`, and `npm run build`. Both public Supabase variables are set for Production and Preview. `.vercelignore` excludes local environment files, generated builds, and test artifacts; all 35 pixel sprites are included.

The first production build passed. Anonymous HTTP checks returned 200 for home, garden, Today, login, signup, and a plant sprite. Desktop/mobile landing checks passed with no mobile horizontal overflow. The live guest flow passed creation, daily completion, seed-to-sprout growth, retained completion after reload, and removal of the temporary test habit. The production dependency audit found zero vulnerabilities. Supabase's public Auth settings report email signup enabled and auto-confirmation enabled; the user reports both production auth URLs are saved. Private-account persistence/sign-out, cross-account isolation, and hosted concurrent check-ins remain unverified pending an accessible signed-in session. See [Vercel deployment notes](vercel-deployment.md).

The final deployment slice at `8169969` passed both review axes against the agreed baseline, reusing the completed application review: zero Standards breaches, zero actionable smells, and zero Spec findings. Deployment notes pass Prettier and the diff has no whitespace errors.

## Supabase setup

Public configuration is present in the ignored `.env.local`. No service-role key is required. The user reports Supabase setup is complete. The app works with Supabase's default link template. Supabase's built-in mail provider restricts delivery and customization; see `docs/supabase-setup.md` if the project later configures custom SMTP. Apply `supabase/migrations/202610030001_garden.sql` once to a fresh project.

A public unauthenticated probe reached the hosted API; an anonymous RPC request returned PGRST202. This probe establishes API reachability, not successful authenticated migration validation. Successful hosted sign-up/confirmation/sign-in/sign-out, persistence across devices, direct-table RLS isolation, and simultaneous requests from independent connections have not run. PGlite executes requests on one local engine and cannot prove hosted concurrency. Keep these limits visible until verified.

## Environment notes

Project: `D:\tiny-habit-garden`. Preview: `http://127.0.0.1:3000`. Use Node 24 LTS. The system Node is 22.12.0; the bundled Node 24 runtime was used for validation.

GitHub connector issue writes returned 403, and regional CLI API routing timed out. Existing CLI authentication with an alternate verified API route published the tracker; tokens stayed in memory outside the repository. The current responsive typography and input-validation slice could not be added as a new GitHub issue: issue-write connector returned 403 and the CLI API route timed out. Normal Git pushes work.
