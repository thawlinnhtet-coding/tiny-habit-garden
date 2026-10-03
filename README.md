# Tiny Habit Garden

A cozy pixel-art habit garden. Complete small real-life habits to grow plants; lifetime growth remains when a streak resets.

## Development

Use Node 24 LTS, then run:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000/garden (start with `npm run dev -- --hostname 127.0.0.1`). The guest garden stores habits in this browser. Sign in for a private Supabase garden. Five plant types grow at 0, 1, 3, 7, and 14 lifetime completions; streak resets preserve growth.

Follow [Supabase setup](docs/supabase-setup.md) to configure `.env.local`, run the SQL migration, and configure confirmation links. The account timezone is set on the first private-garden visit and remains fixed. Guest habits are not automatically imported. Read [current status](docs/current-status.md) for verification evidence and pending hosted checks.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

Playwright tests use isolated browser contexts with disposable data. Install test browsers with `npx playwright install chromium` if needed.

## Project context

- [Agent instructions](AGENTS.md)
- [Product requirements](docs/product.md)
- [V1 spec](docs/v1-spec.md)
- [Current progress](docs/current-status.md)
- [GitHub Issues](https://github.com/thawlinnhtet-coding/tiny-habit-garden/issues)

## Assets

Original 48×48 transparent sprites are in `public/sprites/`. Regenerate them with Python and Pillow:

```sh
python scripts/generate_sprites.py public/sprites
```

[Pixelify Sans](https://github.com/google/fonts/tree/main/ofl/pixelifysans) is bundled locally under its SIL Open Font License; see `public/fonts/OFL.txt`. Other pixel art in this repository is original to Tiny Habit Garden.
