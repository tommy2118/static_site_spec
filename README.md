# Static Site Specification

A canonical architecture and conventions document for building static websites with modern tooling.

## Stack

- **Eleventy 3.1.x** — Static site generator
- **Tailwind CSS 4.1.x** — Utility-first CSS (CSS-first configuration)
- **Stimulus 3.2.x** — Lightweight JavaScript behavior
- **Nunjucks** — Templating (bundled with Eleventy)

## Who It's For

- **Primary:** Claude Code and AI assistants executing site builds
- **Secondary:** Human developers who need to understand or maintain sites built to this spec

## What's Included

The spec covers:

- Directory structure and naming conventions
- Complete file templates (config, layouts, partials, CSS, JS)
- Content authoring patterns (frontmatter, collections, Markdown)
- Stimulus controllers (toggle, animate, mobile-nav, form)
- Tailwind 4 theme configuration with `@theme` and `@source`
- Build and deployment (GitHub Pages)
- Documentation requirements
- Quality checklist

## Usage

Reference [STATIC_SITE_SPEC.md](./STATIC_SITE_SPEC.md) when building a new static site. The spec is prescriptive — follow the patterns exactly for consistency across projects.

## Example Sites

Sites built to this specification:

1. **carpinte.ro** — Woodworking portfolio
2. **nomad-theater-company** — Theater company website
3. **thedbtresource.com** — Educational resource site

## Version

Current: **v1.3.0**

See Appendix D in the spec for changelog.

## License

MIT
