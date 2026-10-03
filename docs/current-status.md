# Current status

Updated: 2026-10-03 (Asia/Rangoon).

## Approved workflow

The user approved the four vertical tickets, default triage labels, and public garden-operation/browser test seam with “go ahead.” The final review baseline is `939a5d1`, explicitly confirmed by the user. Agent context lives in `AGENTS.md`; `CLAUDE.md` imports it.

GitHub is the authoritative issue tracker:

- #1: V1 specification (parent; keep open).
- #2: Plant your first habit — complete.
- #3: Water a habit and grow its plant — complete.
- #4: Keep a private garden with Supabase; blocked by #3.
- #5: Verify the cozy V1 experience; blocked by #4.

All five labels and native ticket dependencies were created. Ticket #2 is assigned to the owner. `docs/tracker.json` records canonical URLs and GitHub database IDs.

## Implemented first slice

- Next.js App Router with landing, My Garden, Today, and create/edit habit routes.
- Original transparent pixel sprites for five plant types and garden scenery, plus a reproducible generation script.
- Crisp rendering, local pixel typography with its license, ambient plant/cloud/butterfly animation, and reduced-motion CSS.
- Persistent guest garden with public create/read/edit/remove operations and validated names/plant types.
- Pixel garden scene with clickable plants, habit details, edit links, and confirmed removal.
- Responsive layouts and shadcn dialog/form controls.

## Verified first slice

- Four public-operation tests pass, including damaged-data preservation.
- Four desktop/mobile browser tests pass: CRUD/persistence/removal plus keyboard/reduced-motion behavior.
- Browser inspection checked the rendered scene, details, editing, persistence, and cancellation of removal.
- Type checking, source lint, and production build pass.
- Two-axis code review completed; standards findings were fixed, and the first-slice Spec review had zero findings. See docs/reviews/first-habit.md.

## Remaining

Daily completion, permanent growth, streaks, and watering/transformation feedback are implemented and reviewed. Seven operation tests and six browser checks pass. Supabase Auth/database integration and final V1 verification remain. Growth thresholds are 0/1/3/7/14 lifetime completions; guest previews stay separate from private gardens.

Public Supabase configuration is present in the ignored .env.local file. No connected Supabase administration tool was supplied. Implement the integration and migration with placeholder configuration, then record which live-service checks require a configured project. Keep credentials out of Git.

## Environment notes

The local development preview runs at `http://127.0.0.1:3000`. Bundled Node 24 is available; the system Node version is 22.12.0. Use a supported Node runtime for developer tooling.

GitHub CLI API requests to the region's DNS address timed out; the connected GitHub app returned 403 for issue writes. Publication succeeded using existing CLI authentication with a verified alternate GitHub API route and normal hostname/certificate verification. The temporary helper is outside the repository and holds tokens only in memory. Git pushes work normally.

Dependency installation reported development-tool advisories. Assess the actual dependency paths before a forced upgrade/downgrade. Runtime security and live Supabase checks remain part of final verification.
