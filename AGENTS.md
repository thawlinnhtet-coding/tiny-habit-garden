<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Tiny Habit Garden

## Start here

This repository contains a Next.js scaffold for a cozy pixel-art habit game. The product is still being built. Before implementation, read `docs/current-status.md` for completed work, verification results, and pending decisions, then `docs/product.md` for the user-authorized V1 scope.

## Product priorities

The loop is create a habit, choose its plant, complete the real-life habit, water the plant, and gradually grow a personal garden. Prioritize crisp pixel art, satisfying watering and growth animation, and the My Garden experience.

Keep V1 to landing/authentication, Today, My Garden, and create/edit habit. Each habit owns one plant; My Garden is a pixel scene with clickable plants. Completing a habit once per local day adds permanent growth and updates its streak. A missed day resets the streak while preserving the plant and lifetime completions.

The authorized stack is Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth and PostgreSQL, Motion, and Lucide React. Check `package.json` for installed versions. Read the relevant bundled Next.js guide under `node_modules/next/dist/docs/` before using framework APIs.

## Pixel assets and motion

Original transparent PNG sprites live in `public/sprites/`; `scripts/generate_sprites.py` reproduces them with Python and Pillow. Filenames use `<plant-type>-<stage>.png`, with stages 1 through 5. Choose a plant sprite by type and growth stage.

Use nearest-neighbor rendering (`image-rendering: pixelated`) and integer scaling where feasible. Build the garden from pixel soil, grass, fences, clouds, butterflies, rocks, and plant sprites. Use the PNG sprites for plants rather than emoji stand-ins.

On completion, show the watering can, droplets, a plant bounce, particles, updated progress and streak, and a sprite transformation when a stage advances. Honor reduced-motion preferences and preserve completion feedback when animation is reduced.

## Data integrity

Use Supabase Auth to identify users and PostgreSQL row-level security to isolate gardens. Keep server-only credentials on the server; commit an environment example with placeholders rather than credentials.

Enforce one completion per habit per local date in the database, including concurrent requests. Derive the date from the user's timezone and server time. Keep streak and lifetime growth separate. Authenticated gardens and any guest preview must have distinct storage and clear UI labels.

Before implementing growth thresholds or the timezone model, check `docs/current-status.md` for the status of those proposed decisions. Product rules in `docs/product.md` are authoritative; proposed implementation choices remain proposals until resolved.

## Agent skills

### Issue tracker

Use GitHub Issues in `thawlinnhtet-coding/tiny-habit-garden`. Before creating, reading, updating, or closing tickets, read `docs/agents/issue-tracker.md`.

### Domain docs

Use a single-context glossary and ADRs. Before domain exploration or architectural decisions, read `docs/agents/domain.md` and any relevant domain documents it identifies.

### Matt Pocock workflow

Use the user's global Matt Pocock skills from `C:/Users/Thaw Linn Htet/.agents/skills` when applicable. Read the selected `SKILL.md` before first use. For implementation work, follow `implement`; for specifications use `to-spec`; for vertical implementation tickets use `to-tickets`; for behavioral test-first work use `tdd`; and for final review use `code-review`.

Record the user's decisions in the repository so future sessions can resume without reconstructing chat history. Follow any explicit skill review requirements using existing user authorization; keep pending reviews visible in `docs/current-status.md`.

## Verification and handoff

Verify behavior through the agreed public operations and user-visible flows. Confirm the test boundary before writing tests when applying the TDD skill. Check duplicate daily completion, missed-day streak reset with retained growth, stage transitions, and persistence. Live Supabase authentication, isolation, and concurrency checks require a configured project; report when those checks have not run.

Run checks appropriate to the change, report their actual results, and update `docs/current-status.md` after each completed slice. Distinguish scaffold validation, implemented feature validation, and live service validation.

Keep this file focused on durable context. Put product requirements in `docs/product.md`, current progress in `docs/current-status.md`, and architectural decisions in ADRs. Preserve the generated Next.js block above. `CLAUDE.md` imports this file.
