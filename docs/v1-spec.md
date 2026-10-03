# Tiny Habit Garden V1

## Problem Statement

Ordinary habit trackers feel like administrative checklists. A person building small real-life habits wants to see those efforts create something delightful without losing accumulated progress after a missed day.

## Solution

A small cozy pixel-art game where each habit owns a plant. Complete the habit once per day to water it, grow its permanent lifetime progress, and maintain a streak. Browse a personal garden and tap its plants to inspect habits.

## User Stories

1. As a gardener, I want to create a habit, so that a small seed represents my real-life intention.
2. As a gardener, I want to choose my plant type, so that my garden feels personal.
3. As a gardener, I want to name my habit, so that I know what to do in real life.
4. As a gardener, I want to edit a habit, so that it stays useful as my routine changes.
5. As a gardener, I want to delete a habit with confirmation, so that I can intentionally remove its plant.
6. As a gardener, I want to see seeds immediately after creation, so that starting feels rewarding.
7. As a gardener, I want to complete a habit once per local day, so that growth corresponds to actual daily effort.
8. As a gardener, I want duplicate completion attempts to preserve my totals, so that accidental clicks cannot inflate progress.
9. As a gardener, I want a watering can and falling droplets when I complete a habit, so that care feels tangible.
10. As a gardener, I want a gentle bounce and pixel particles, so that a check-in is satisfying.
11. As a gardener, I want five distinct plant stages, so that growth is visible over time.
12. As a gardener, I want each plant type to have its own sprites, so that my garden has variety.
13. As a gardener, I want a transformation when a stage advances, so that reaching a milestone feels special.
14. As a gardener, I want to see my current streak, so that I can recognize consistent effort.
15. As a gardener, I want a missed day to reset my streak while keeping growth, so that my past effort remains meaningful.
16. As a gardener, I want a Today view, so that I can find habits that still need care.
17. As a gardener, I want a pixel garden scene, so that my habit tracker feels like a small cozy game.
18. As a gardener, I want to tap a plant for habit details, so that I can inspect its streak, stage, and lifetime completions.
19. As a gardener, I want subtle clouds, butterflies, and plant movement, so that the garden feels alive.
20. As a gardener, I want crisp pixel sprites, so that my garden retains its intended visual style.
21. As a gardener, I want to sign up and sign in, so that I can keep a private garden across visits.
22. As a gardener, I want to sign out, so that my private garden is protected on a shared device.
23. As a gardener, I want my data isolated from other users, so that my habits remain private.
24. As a gardener, I want errors to leave existing progress intact, so that a failed save does not mislead me.
25. As a gardener, I want to use the app on a phone or with a keyboard, so that care fits into my day.
26. As a gardener, I want reduced-motion support, so that I can enjoy the garden comfortably.
27. As a new gardener, I want an explicitly labeled guest preview, so that I can try planting before configuring an account.
28. As a guest gardener, I want habits kept in this browser, so that refreshing does not erase my preview.

## Implementation Decisions

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth/PostgreSQL, Motion, and Lucide.
- A small public garden-operations interface owns create, edit, delete, read, and complete behavior. Guest storage uses the browser; signed-in data uses Supabase.
- Original transparent 48-pixel sprites for oak, sunflower, mushroom, cactus, wildflower, and garden scenery, rendered with nearest-neighbor scaling.
- Five growth stages at 0, 1, 3, 7, and 14 lifetime completions. Plant choice can change while retaining completion history.
- Completion dates use the garden's IANA timezone; the authenticated database uses server time. A unique habit/date constraint and an atomic operation prevent duplicate concurrent check-ins.
- Streaks derive from completion dates; lifetime growth survives a missed date.
- Guest gardens are clearly labeled and separate from authenticated gardens. Signing in does not silently import guest data.
- My Garden is the main visual experience; Today, landing/authentication, and create/edit remain small.
- UI transitions use Motion; CSS provides ambient sprite motion. Reduced motion preserves state feedback.
- Supabase row-level security restricts habits and completions to their owner; no service-role key is required in the app.

## Testing Decisions

The user approved the public garden operations and visible browser flows as test seams. Exercise behavior through real interfaces with injected clock/storage at system boundaries. Tests must survive internal refactors and use independent expected outcomes.

Cover persistence, validation, duplicate daily completion, consecutive dates, missed dates, retained growth, and stage milestones. Browser flows cover creation, plant details, editing, deletion, daily completion, keyboard access, and mobile layout. Live Supabase Auth, row-level-security isolation, and concurrency checks require a configured project; report any unverified live checks.

There are no prior app behavior tests in the scaffold. Introduce the first behavior test before its implementation, then proceed one vertical slice at a time.

## Out of Scope

AI, chat, social systems, friends, leaderboards, shops, coins, admin dashboards, complex statistics, marketplaces, multiplayer, and a game engine. Public deployment is not part of this local project request.

## Further Notes

Source requirements are the user's original Tiny Habit Garden request. On 2026-10-03 the user approved the four-ticket breakdown, default labels, and public-operation/browser test seam. The project directory and GitHub repository were supplied by the user. Live Supabase credentials have not been supplied.
