# Clerk authentication migration

## Problem Statement

The user wants to replace Supabase Auth with Clerk and restore Google/GitHub sign-in with original provider icons after repeated authentication connection failures.

## Solution

Use Clerk for email/password and Google/GitHub authentication on the existing dedicated account pages. Retain Supabase PostgreSQL for private gardens and the native Clerk third-party integration for signed requests. The user selected a Clerk development setup on the existing Vercel URL.

## User Stories

1. As a gardener, I want to sign up with email, so I can save a private garden.
2. As a gardener, I want to verify my email by code, so I can finish signing up without an expired confirmation link.
3. As a gardener, I want to sign in with Google, so I can use my existing account.
4. As a gardener, I want to sign in with GitHub, so I can use my existing account.
5. As a gardener, I want recognizable original provider icons, so I can identify each sign-in option.
6. As a gardener, I want inline errors, so I can correct invalid inputs.
7. As a gardener, I want password recovery, so I can regain access.
8. As a gardener, I want to sign out, so my account closes on this device.
9. As a gardener, I want my own habits to persist across visits, so my plants keep their progress.
10. As a gardener, I want another account to have a separate garden, so my data stays private.
11. As a guest, I want to keep my browser garden, so I can use the app without signing up.
12. As a gardener, I want account and database errors to remain visible, so a connection failure never silently replaces my private garden.
13. As an existing gardener, I want stored habits, completion dates, and timezones preserved during migration.
14. As a mobile gardener, I want usable account controls that match the cozy garden theme.
15. As a gardener, I want day/night lighting and habit rules unchanged.

## Implementation Decisions

- Use our dedicated, manually written `/login` and `/signup` pages. The user explicitly rejected Clerk's default/prebuilt account screens on 2026-10-05. Clerk v7 custom-flow hooks supply email/password, email codes, device trust, authenticator codes, password recovery, and social authentication behind our own form controls.
- Keep field-level errors, password visibility, accessible focus, loading feedback, and resend cooldowns. The custom `/auth/sso-callback` consumes social results, transfers between sign-in/sign-up when appropriate, and collects a missing provider email.
- Keep the account-form welcome compact: a small pixel garden beside clear "Sign in" / "Create account" wording, replacing the circular sprout badge and generic "Come on in" greeting at the user's request. Match day/night colors, mobile widths, and reduced-motion preferences.
- Use the self-hosted, original Google and GitHub brand artwork in `public/brands`; retain source/license attribution. Render Clerk's CAPTCHA mount for signup and OAuth transfers.
- Required extra profile fields, unsupported verification factors, and session tasks must produce an explicit error rather than bypass authentication. Configure the app for the supported email/password/code and social flows.
- Clerk is the only active account-session source. Remove Supabase Auth client, confirmation callback, and cookie refresh logic.
- Supply fresh Clerk session tokens to the Supabase client using its native access-token option. Retain the owner-checked garden operation.
- Capture the Clerk session for each garden and reject outgoing tokens whose subject differs from its captured owner. Account changes cannot redirect an in-flight write into another user's garden.
- Preserve stored rows while supporting text account subjects and using verified JWT subjects for database ownership. Browser input cannot choose the owner.
- Existing Supabase-to-Clerk owner mappings require verified administrative migration; never infer ownership from a client-supplied email. No existing rows or hosted users are deleted.
- Missing Clerk configuration keeps the guest garden usable with a clear account-unavailable notice.
- Do not publish the migration to the live app before Clerk keys, third-party integration, and the database migration are ready.

## Testing Decisions

Reuse the approved public garden-operation and browser seams. Test signed private CRUD/check-ins and cross-owner rejection through real local PostgreSQL migrations; verify direct-table RLS protection. Preserve guest, lighting, and landing browser flows. Test account UI and provider redirects against configured Clerk, and distinguish mocked checks from real hosted authentication.

## Out of Scope

Replacing Supabase PostgreSQL, buying a domain, automatic password/user imports, social features beyond authentication, changing growth/streak rules, or repairing network connectivity.

## Further Notes

Development keys support a demo on the current Vercel URL; production Clerk requires an owned domain. The old Supabase connection issue may still affect database access. Hosted setup and existing-garden migration status must be recorded before rollout.
