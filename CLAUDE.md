# Claude Code Instructions

This is the Static Site Spec documentation site — a meta site built to showcase and document the Static Site Specification v1.6.0.

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

All documentation content is derived from `STATIC_SITE_SPEC.md` (v1.5.0).

## Example Sites

Sites built to this specification:
- [Nomad Theater Company](https://tommy2118.github.io/nomad-theater-company) (v1.2)
- [The DBT Resource](https://thedbtresource.com) (v1.3)
- [Engineer's Manual](https://engineers-manual.com) (v1.4)
- [Lytle Landscape](https://lytle-landscape.com) (v1.5)

## Deployment

GitHub Actions workflow deploys to GitHub Pages on push to main. Build includes Pagefind index generation.
