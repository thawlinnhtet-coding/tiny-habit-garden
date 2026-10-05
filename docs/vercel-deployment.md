# Vercel deployment

Production: https://tiny-habit-garden.vercel.app

Vercel project: `thawlinnhtet52-2489s-projects/tiny-habit-garden`. The user authorized deployment on 2026-10-03. The project is connected to `thawlinnhtet-coding/tiny-habit-garden`; pushes to `main` trigger production builds.

## Latest release

Commit `85161f2` (pixel art, mobile sky layout, and day/night animations) is on `main`. GitHub reports the Vercel deployment completed successfully.

## Project settings

- Framework: Next.js
- Node: 24.x
- Root directory: repository root
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: Next.js default
- Production and Preview configuration: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The public settings are configured in Vercel. The application does not need a service-role key. Keep `.env.local` and `.vercel/` out of Git and deployment uploads. `.vercelignore` also excludes generated Next.js builds and test artifacts.

## Supabase URLs

The user reports these are saved under Authentication → URL Configuration:

- Site URL: `https://tiny-habit-garden.vercel.app`
- Redirect URL: `https://tiny-habit-garden.vercel.app/auth/confirm`

Email confirmation is disabled, verified through Supabase's public Auth settings. New signups receive a session immediately. Keep local development redirect URLs if still needed. A future custom domain needs matching production URL configuration.

## Verification

The Vercel production build passes. Public page routes and a plant sprite return HTTP 200. Live guest creation, daily completion, growth to sprout, reload persistence, and cleanup pass. Desktop/mobile landing screenshots were inspected, and mobile horizontal overflow is absent. The production dependency audit reports zero vulnerabilities.

Private-account persistence, sign-out, account isolation, and concurrent hosted check-ins remain pending until checked with live accounts. See `current-status.md` for the latest evidence. Browser unit/E2E results that mock Supabase do not establish hosted account behavior.

## Social sign-in and lighting release

The social-auth/lighting production release at `25939c1` is READY on Vercel and includes feature commit `9e82b73`. Live checks verified Day/Night switching, saved Night after reload, returning to Auto, both provider buttons on `/login`, and HTTP 200 for moon, star, and firefly sprites. Real provider consent and hosted sessions remain pending configuration; issue #6 stays open for that human setup.

Add the production `/auth/callback` redirect before using Google or GitHub. Follow [provider setup](social-auth-setup.md); this callback supplements the existing email confirmation URL.

## Future releases

Commit and push the verified changes to `main`. Check the deployment in Vercel and repeat the live core flow. The linked CLI can also deploy with `npx vercel --prod`; Vercel authentication is stored outside this repository. Never paste auth tokens into issue comments or commit them.
