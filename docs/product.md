# Tiny Habit Garden — V1 product requirements

Source: the user's original project request. These are the approved product requirements; implementation choices marked proposed in the progress document are separate.

## Goal and main loop

Complete real-life habits to grow animated pixel-art plants and gradually build a personal pixel garden. The application should feel like a small cozy pixel farming game.

Create habit → choose plant → seed appears in garden → complete real-life habit → watering animation → plant growth → streak increases → a more beautiful garden.

The intended feeling is: “I did something good in real life, and my little virtual world became more beautiful because of it.”

## Required stack

- Next.js and TypeScript
- Tailwind CSS and shadcn/ui
- Supabase Auth and Supabase PostgreSQL
- Motion / Framer Motion
- Lucide React

## Pixel direction

Use actual transparent PNG/WebP pixel-art assets or sprite sheets for seeds, sprouts, small plants, mature plants, trees, flowers, mushrooms, cacti, rocks, grass, butterflies, clouds, water drops, fences, and soil/tiles. Keep scaled assets crisp.

The garden should resemble a tiny cozy pixel farming game. Realistic plants, 3D graphics, clashing gradients, and generic SaaS illustrations are outside the visual direction.

## Plant ownership and growth

Each habit owns one plant. Users choose the plant type when creating a habit. Different plant types need their own growth sprites.

Every plant has five visual stages:

1. Seed
2. Sprout
3. Small plant
4. Mature plant
5. Fully grown

Example themes: study with an oak tree, exercise with a sunflower, and reading with a mushroom cluster. These are examples; habit names are user-defined.

Each completion increases growth progress. Growth is permanent even when a streak resets. The original request does not specify exact completion thresholds.

## Completion animation

When the user presses Complete:

1. A pixel watering can appears.
2. Water drops animate.
3. The plant shakes or bounces slightly.
4. Pixel particles appear.
5. Growth progress increases.
6. A newly reached stage animates into its next sprite.
7. The updated streak appears, such as “7 Day Streak!”

Use Motion for UI transitions and CSS sprite animations where appropriate. Add subtle plant swaying, occasional butterfly movement, slow clouds, gentle flower bounce, and occasional sparkles. Keep the motion cozy and restrained.

## Core features

### Authentication

Email sign-up, sign-in, and sign-out through Supabase Auth. Authenticated garden data belongs to its user.

### Habit management

Create, edit, and delete habits. Choose a plant type. A habit can be named “Study 30 minutes” and grow an oak tree.

### Daily check-in

A habit can be completed once per day. Record the completion, update the streak and plant progress, play watering feedback, and play a growth transformation when a new stage is reached.

### Streaks

Show the current consecutive-day streak. Missing a day resets the streak. Preserve the user's plant and accumulated growth.

### My Garden

Give this page the most visual attention. Display plants in a pixel-art garden scene rather than a normal card grid. Each plant represents one habit.

Click or tap a plant to show its habit name, plant type, current streak, growth stage, and total completions. Example: Study 30 Minutes, Oak Tree, 12-day streak, Fully grown, 34 total completions.

## V1 pages

1. Landing / Authentication
2. Today
3. My Garden
4. Create / Edit Habit

Provide a usable small-screen experience and keyboard access to the core interactions.

## Excluded features

AI, chat, social systems, friends, leaderboards, shops, coins, administration dashboards, complex statistics, marketplaces, multiplayer, and a game engine.

## Requested additions — 2026-10-04

The active addition is automatic day/night garden lighting based on device time, manual mode switching, smooth transitions, and animated night scenery. See [lighting requirements](social-auth-and-lighting.md). The user subsequently requested removal of Google and GitHub sign-in; authentication now uses email and password only. See [email-only authentication requirements](email-auth-only.md). Habit, streak, and growth rules remain unchanged.

## Repository and workflow

Project directory: `D:\tiny-habit-garden`.

GitHub repository and issue tracker: `https://github.com/thawlinnhtet-coding/tiny-habit-garden`.

Use the user's global Matt Pocock skills. The user explicitly requested project context in the agent instructions; `AGENTS.md` is the canonical context file, and `CLAUDE.md` imports it.
