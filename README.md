# Static Site Spec

The canonical architecture and conventions for building modern static websites with Eleventy, Tailwind CSS 4, and Stimulus.

**Live site:** [tommy2118.github.io/static_site_spec](https://tommy2118.github.io/static_site_spec)

## Quick Start

```bash
npm install
npm run dev
```

Development server runs at `http://localhost:8080`.

## What This Is

This repository contains:

1. **STATIC_SITE_SPEC.md** — The canonical specification document
2. **The documentation site** — A live reference built to the spec itself (meta!)

## Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Eleventy | 3.1.x | Static site generator |
| Tailwind CSS | 4.1.x | Utility-first CSS |
| Stimulus | 3.2.x | JavaScript behavior |
| Pagefind | 1.x | Client-side search |

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build + Pagefind index |
| `npm run clean` | Remove dist/ |

## Example Sites

Sites built to this specification:

- **[Nomad Theater Company](https://tommy2118.github.io/nomad-theater-company)** — Theater company (v1.2)
- **[The DBT Resource](https://thedbtresource.com)** — Educational resource (v1.3)
- **[Engineer's Manual](https://engineers-manual.com)** — Technical reference book

## Version

Current: **v1.4.0**

## License

MIT
