# Tiny Habit Garden

A cozy pixel-art habit garden. Complete small real-life habits to grow plants; lifetime growth remains when a streak resets.

## Development

Use Node 24 LTS, then run:

```sh
npm install
npm run dev
```

Open http://localhost:3000/garden. The guest garden stores its habits in the current browser. This is an actively developed V1; read [current status](docs/current-status.md) for implemented and remaining features.

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
