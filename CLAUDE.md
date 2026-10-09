# Claude Code Instructions

This is the Static Site Spec documentation site — a meta site built to showcase and document the Static Site Specification v1.7.0.

## Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Eleventy | 3.1.x | Static site generator |
| Tailwind CSS | 4.1.x | Utility-first CSS (CSS-first config) |
| DaisyUI | 5.x | Component library |
| Stimulus | 3.2.x | JavaScript behavior |
| Pagefind | 1.x | Client-side search |

## Commands

```bash
npm run dev      # Development server at localhost:8080
npm run build    # Production build + Pagefind index
npm run clean    # Remove dist/
npm test         # node:test specs for lib/ and a full build test
```

## Project Structure

```
src/
├── _data/
│   ├── site.json        # Site metadata (title, version, github URL)
│   └── sections.json    # Navigation hierarchy
├── _includes/
│   ├── layouts/
│   │   ├── base.njk     # Root layout (head, nav, footer)
│   │   ├── page.njk     # Simple pages
│   │   ├── docs.njk     # Documentation (dual TOC: mobile details + desktop sidebar)
│   │   └── controller-demo.njk  # Three-panel demo layout
│   └── partials/
│       ├── head.njk, nav.njk, footer.njk, scripts.njk
│       ├── sidebar.njk        # Desktop sticky TOC
│       ├── mobile-toc.njk     # Mobile details/summary TOC
│       ├── prev-next.njk      # Chapter navigation
│       ├── search-modal.njk   # Pagefind search UI
│       └── code-block.njk     # Code with copy button
├── assets/
│   ├── css/main.css     # Tailwind 4 entry point
│   └── js/
│       ├── application.js
│       └── controllers/  # 8 Stimulus controllers
├── controllers/          # Controller demo pages
├── files/               # File reference pages
└── *.njk                # Top-level pages
```

## Stimulus Controllers

| Controller | File | Purpose |
|------------|------|---------|
| mobile-nav | mobile_nav_controller.js | Mobile menu drawer |
| search | search_controller.js | Pagefind modal (Cmd+K) |
| toc | toc_controller.js | Scroll-spy sidebar highlighting |
| reading-progress | reading_progress_controller.js | Progress bar |
| clipboard | clipboard_controller.js | Copy code button |
| toggle | toggle_controller.js | Show/hide content |
| animate | animate_controller.js | Scroll animations |
| chapter | chapter_controller.js | Announces a homepage section's pose (spec Section 11) |
| blueprint | blueprint_controller.js | The homepage scene's one joint: loop, globals, plotter |

## The Blueprint Homepage

The homepage is a scene site (spec Section 11): a live technical drawing of
an exploded static site, steered by its sections. Each section is a
`chapter` announcing a pose from `src/_data/blueprint.json`; the `blueprint`
controller eases the drawing toward it. `src/assets/js/lib/` holds the parts:
`sheet.js` (the drawing as data), `pose.js` and `flow.js` (advanced by dt),
`iso.js` (projection), and `plotter.js` (the WebGL2 renderer, which throws
without WebGL2 so the ruled-paper fallback shows). Paper and ink colors come
from `--sheet-paper` and `--sheet-ink`: whiteprint in light mode, cyanotype in
dark. Every word lives in `src/index.njk`; canvas labels only repeat a few.

Chapters check on `requestAnimationFrame` and pause in a hidden tab; probe
with `scrollIntoView({ behavior: "instant" })`.

## Key Patterns

### Tailwind CSS 4

Uses CSS-first configuration with `@theme` and `@source` directives:

```css
@import "tailwindcss";

@source "../../../src/**/*.njk";

@theme {
  --font-sans: "Inter", system-ui, sans-serif;
}
```

### Custom TOC Filter

`eleventy.config.js` includes a `toc` filter that extracts h2/h3 headings from rendered HTML for automatic sidebar generation.

### Dual TOC Pattern

- Mobile: `<details>` element at top of content
- Desktop: Sticky sidebar with scroll-spy highlighting

### Nunjucks Code Examples

When including Nunjucks syntax in code examples, wrap in raw tags:

```nunjucks
{% raw %}
{% include "partials/nav.njk" %}
{% endraw %}
```

## Content Source

All documentation content is derived from `STATIC_SITE_SPEC.md` (v1.7.0). `src/scene-sites.md` is generated from Section 11; regenerate it when Section 11 changes.

## Example Sites

Sites built to this specification:
- [Nomad Theater Company](https://tommy2118.github.io/nomad-theater-company) (v1.2)
- [The DBT Resource](https://thedbtresource.com) (v1.3)
- [Engineer's Manual](https://engineers-manual.com) (v1.4)
- [Lytle Landscape](https://lytle-landscape.com) (v1.5)
- [VetMGMedia](https://vetmgmedia.com) (v1.6)
- [Danny Caruso](https://dannycaruso.link) (v1.7)

## Deployment

GitHub Actions workflow deploys to GitHub Pages on push to main. Build includes Pagefind index generation.
