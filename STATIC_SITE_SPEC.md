# Static Site Specification

**Version:** 1.4.0
**Last Updated:** 9 January 2026
**Author:** Tommy A. Caruso Sr.

---

## 1. PURPOSE

### What This Spec Is

This document defines the canonical architecture, conventions, and implementation details for building static websites. It is prescriptive, not advisory. When building a static site under this specification, follow these patterns exactly.

### Who It's For

- **Primary:** Claude Code and AI assistants executing site builds
- **Secondary:** Human developers who need to understand or maintain sites built to this spec
- **Tertiary:** Collaborators who may receive sites built to this spec

### What "Done" Looks Like

A site is complete when:

1. All files conform to the directory structure defined in Section 3
2. `npm run dev` starts the development server without errors
3. `npm run build` produces a production build in `dist/`
4. All templates render without Nunjucks errors
5. Tailwind CSS compiles and applies styles correctly
6. Stimulus controllers initialize and respond to user interaction
7. The site deploys successfully to GitHub Pages
8. README.md documents all setup and customization steps
9. CLAUDE.md provides AI pairing context

---

## 2. STACK DECISIONS

### Core Technologies

| Technology | Version | Purpose | Installation |
|------------|---------|---------|--------------|
| Node.js | 20+ | Runtime | System install |
| Eleventy | 3.1.x | Static site generator | `@11ty/eleventy` |
| Tailwind CSS | 4.1.x | Utility-first CSS | `tailwindcss` |
| PostCSS | 8.x | CSS processing | `postcss` |
| @tailwindcss/postcss | 4.x | Tailwind PostCSS plugin | `@tailwindcss/postcss` |
| cssnano | 7.x | CSS minification | `cssnano` |
| Stimulus | 3.2.x | JavaScript behavior | `@hotwired/stimulus` |
| Nunjucks | (bundled) | Templating | Included with Eleventy |

### Module System

All JavaScript uses **ESM (ES Modules)**. No CommonJS.

```json
{
  "type": "module"
}
```

### What We Are NOT Using

| Technology | Reason |
|------------|--------|
| Vite | Unnecessary complexity for static sites; Eleventy handles builds |
| React/Vue/Svelte | Violates the "HTML-first" philosophy; Stimulus provides sufficient interactivity |
| SCSS/Sass | Tailwind 4's @theme directive replaces the need for preprocessors |
| npm-run-all/concurrently | Single-process build via eleventy.before hook eliminates need |
| tailwind.config.js | Tailwind 4 uses CSS-first configuration via @theme |
| PostCSS config file | Configuration lives in eleventy.config.js |
| Alpine.js | Stimulus is the standard; one JS framework only |
| TypeScript | Unnecessary complexity for static site JS; vanilla ES6+ suffices |

---

## 3. DIRECTORY STRUCTURE

```
project/
├── src/                          # All source files
│   ├── _data/                    # Global data files
│   │   ├── site.json             # Site metadata
│   │   └── navigation.json       # Navigation structure
│   │
│   ├── _includes/                # Reusable templates
│   │   ├── layouts/              # Page layouts
│   │   │   ├── base.njk          # Root layout (HTML shell)
│   │   │   ├── page.njk          # Standard page layout
│   │   │   ├── post.njk          # Blog post layout (if using blog)
│   │   │   └── project.njk       # Portfolio project layout (if using portfolio)
│   │   │
│   │   └── partials/             # Includable components
│   │       ├── head.njk          # <head> contents
│   │       ├── nav.njk           # Navigation
│   │       ├── footer.njk        # Footer
│   │       └── scripts.njk       # JS includes (before </body>)
│   │
│   ├── assets/                   # Static assets
│   │   ├── css/
│   │   │   └── main.css          # Tailwind entry point
│   │   │
│   │   ├── js/
│   │   │   ├── application.js    # Stimulus application setup
│   │   │   └── controllers/      # Stimulus controllers
│   │   │       └── .gitkeep      # Placeholder until controllers added
│   │   │
│   │   ├── images/               # Image assets
│   │   │   └── .gitkeep
│   │   │
│   │   └── fonts/                # Web fonts (if any)
│   │       └── .gitkeep
│   │
│   ├── content/                  # Blog content (if applicable)
│   │   └── posts/                # Blog posts
│   │       └── .gitkeep
│   │
│   ├── portfolio/                # Portfolio section (if applicable)
│   │   ├── index.njk             # Portfolio gallery page
│   │   └── projects/             # Individual project files
│   │       └── .gitkeep
│   │
│   ├── index.njk                 # Homepage
│   ├── about.njk                 # About page
│   └── contact.njk               # Contact page
│
├── dist/                         # Build output (gitignored)
│
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Pages deployment
│
├── .gitignore
├── eleventy.config.js            # Eleventy configuration
├── package.json
├── package-lock.json
├── CLAUDE.md                     # AI pairing context
└── README.md                     # Human documentation
```

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Directories | lowercase, hyphens | `_includes`, `my-section` |
| Layouts | lowercase, `.njk` | `base.njk`, `page.njk` |
| Partials | lowercase, `.njk` | `nav.njk`, `footer.njk` |
| Data files | lowercase, `.json` | `site.json`, `navigation.json` |
| CSS files | lowercase, `.css` | `main.css` |
| JS files | lowercase, underscores for controllers | `application.js`, `toggle_controller.js` |
| Stimulus controllers | `[name]_controller.js` | `mobile_nav_controller.js` |
| Content files | lowercase, hyphens, `.md` or `.njk` | `about-us.md`, `contact.njk` |
| Images | lowercase, hyphens | `hero-background.jpg` |

### What Goes Where

| Content Type | Location |
|--------------|----------|
| HTML structure, meta tags | `src/_includes/partials/head.njk` |
| Navigation markup | `src/_includes/partials/nav.njk` |
| Footer markup | `src/_includes/partials/footer.njk` |
| Script tags | `src/_includes/partials/scripts.njk` |
| Page chrome (combines partials) | `src/_includes/layouts/base.njk` |
| Site-wide data (title, description, author) | `src/_data/site.json` |
| Nav links | `src/_data/navigation.json` |
| Tailwind config + custom styles | `src/assets/css/main.css` |
| Stimulus setup | `src/assets/js/application.js` |
| Interactive behaviors | `src/assets/js/controllers/*.js` |
| Standalone pages | `src/*.njk` (index, about, contact) |
| Section landing pages | `src/[section]/index.njk` |
| Blog posts / articles | `src/content/posts/*.md` |
| Portfolio projects | `src/portfolio/projects/*.md` |
| Static images | `src/assets/images/` |

---

## 4. FILE SPECIFICATIONS

### 4.1 package.json

```json
{
  "name": "project-name",
  "version": "1.0.0",
  "description": "Project description",
  "type": "module",
  "scripts": {
    "dev": "eleventy --serve --watch",
    "build": "NODE_ENV=production eleventy",
    "clean": "rm -rf dist"
  },
  "author": "Author Name",
  "license": "MIT",
  "devDependencies": {
    "@11ty/eleventy": "^3.1.0",
    "@hotwired/stimulus": "^3.2.0",
    "@tailwindcss/postcss": "^4.1.0",
    "cssnano": "^7.0.0",
    "postcss": "^8.5.0",
    "tailwindcss": "^4.1.0"
  }
}
```

**Notes:**
- `type: "module"` is required for ESM
- Only three scripts: `dev`, `build`, `clean`
- All style/JS processing happens through Eleventy hooks
- No `start` script (use `dev`)
- No separate CSS watch script

### 4.2 eleventy.config.js

```javascript
import fs from "fs";
import path from "path";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import cssnano from "cssnano";

export default function (eleventyConfig) {
  // ---------------------------------------------------------------------------
  // PASSTHROUGH COPIES
  // ---------------------------------------------------------------------------

  // JavaScript (including Stimulus controllers)
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });

  // Images
  eleventyConfig.addPassthroughCopy({ "src/assets/images": "assets/images" });

  // Fonts
  eleventyConfig.addPassthroughCopy({ "src/assets/fonts": "assets/fonts" });

  // ---------------------------------------------------------------------------
  // CSS PROCESSING (Tailwind 4 via PostCSS)
  // ---------------------------------------------------------------------------

  const cssProcessor = postcss([
    tailwindcss(),
    ...(process.env.NODE_ENV === "production" ? [cssnano({ preset: "default" })] : []),
  ]);

  eleventyConfig.on("eleventy.before", async () => {
    const inputPath = path.resolve("./src/assets/css/main.css");
    const outputPath = "./dist/assets/css/main.css";
    const outputDir = path.dirname(outputPath);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const cssContent = fs.readFileSync(inputPath, "utf8");
    const result = await cssProcessor.process(cssContent, {
      from: inputPath,
      to: outputPath,
    });

    fs.writeFileSync(outputPath, result.css);

    if (result.map) {
      fs.writeFileSync(`${outputPath}.map`, result.map.toString());
    }
  });

  // ---------------------------------------------------------------------------
  // WATCH TARGETS
  // ---------------------------------------------------------------------------

  // Rebuild CSS when Tailwind input changes
  eleventyConfig.addWatchTarget("./src/assets/css/");

  // Rebuild when JS changes
  eleventyConfig.addWatchTarget("./src/assets/js/");

  // ---------------------------------------------------------------------------
  // FILTERS
  // ---------------------------------------------------------------------------

  // Format dates for display
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // ISO date for datetime attributes
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return new Date(dateObj).toISOString();
  });

  // Limit array to first N items (useful for "recent" sections)
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array)) return array;
    return array.slice(0, n);
  });

  // ---------------------------------------------------------------------------
  // SHORTCODES
  // ---------------------------------------------------------------------------

  // Current year (for copyright)
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // Key info callout box (for educational content)
  // Usage: {% keyInfo "Title", "Content text here" %}
  eleventyConfig.addShortcode("keyInfo", function (title, content) {
    return `<div class="key-info">
      <h4 class="font-semibold mb-2">${title}</h4>
      <p class="text-gray-600">${content}</p>
    </div>`;
  });

  // Section divider with decorative SVG
  // Usage: {% sectionDivider %}
  eleventyConfig.addShortcode("sectionDivider", function () {
    return `<div class="section-divider h-16 w-full relative my-12 overflow-hidden">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" class="absolute w-full h-full">
        <path d="M1200 120L0 16.48V0h1200v120z" fill="currentColor" opacity="0.1"></path>
      </svg>
    </div>`;
  });

  // ---------------------------------------------------------------------------
  // COLLECTIONS
  // ---------------------------------------------------------------------------

  // Blog posts collection (uncomment if using content/posts)
  // eleventyConfig.addCollection("posts", function (collectionApi) {
  //   return collectionApi
  //     .getFilteredByGlob("src/content/posts/**/*.md")
  //     .filter((item) => !item.data.draft)
  //     .sort((a, b) => b.date - a.date);
  // });

  // Portfolio projects collection (uncomment if using portfolio/projects)
  // eleventyConfig.addCollection("projects", function (collectionApi) {
  //   return collectionApi
  //     .getFilteredByGlob("src/portfolio/projects/**/*.md")
  //     .filter((item) => !item.data.draft)
  //     .sort((a, b) => b.date - a.date);
  // });

  // ---------------------------------------------------------------------------
  // CONFIGURATION
  // ---------------------------------------------------------------------------

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    // For GitHub Pages project sites (username.github.io/repo-name):
    // pathPrefix: process.env.GITHUB_ACTIONS ? "/repo-name/" : "/",
  };
}
```

### 4.3 src/assets/css/main.css

```css
/* =============================================================================
   TAILWIND CSS 4.x ENTRY POINT
   ============================================================================= */

@import "tailwindcss";

/* =============================================================================
   SOURCE PATHS

   Tell Tailwind where to scan for class usage. Required in Tailwind 4.
   Without this, Tailwind won't detect classes in your templates.
   ============================================================================= */

@source "../../../src/**/*.njk";
@source "../../../src/**/*.md";
@source "../../../src/**/*.html";

/* =============================================================================
   THEME CONFIGURATION

   Tailwind 4 uses CSS-first configuration. All customizations live here.
   Reference: https://tailwindcss.com/docs/theme
   ============================================================================= */

@theme {
  /* ---------------------------------------------------------------------------
     COLORS

     Define project colors. Use semantic names.
     Format: --color-[name]-[shade]: [value];
     --------------------------------------------------------------------------- */

  /* Example: Custom brand colors */
  /* --color-brand-50: oklch(0.97 0.01 250); */
  /* --color-brand-500: oklch(0.55 0.15 250); */
  /* --color-brand-900: oklch(0.25 0.08 250); */

  /* ---------------------------------------------------------------------------
     FONTS

     Format: --font-[name]: [stack];
     --------------------------------------------------------------------------- */

  /* Example: Custom font stack */
  /* --font-display: "Inter", system-ui, sans-serif; */

  /* ---------------------------------------------------------------------------
     SPACING

     Extend or override spacing scale.
     Format: --spacing-[key]: [value];
     --------------------------------------------------------------------------- */

  /* ---------------------------------------------------------------------------
     BREAKPOINTS

     Format: --breakpoint-[name]: [value];
     --------------------------------------------------------------------------- */

  /* Defaults are fine for most projects:
     --breakpoint-sm: 40rem;   (640px)
     --breakpoint-md: 48rem;   (768px)
     --breakpoint-lg: 64rem;   (1024px)
     --breakpoint-xl: 80rem;   (1280px)
     --breakpoint-2xl: 96rem;  (1536px)
  */

  /* ---------------------------------------------------------------------------
     ANIMATIONS

     Format: --animate-[name]: [keyframe-name] [duration] [timing] [iteration];
     --------------------------------------------------------------------------- */
}

/* =============================================================================
   BASE STYLES

   Global element defaults. Use sparingly.
   ============================================================================= */

@layer base {
  html {
    scroll-behavior: smooth;
  }

  /* Improve focus visibility */
  :focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}

/* =============================================================================
   COMPONENTS

   Reusable component classes. Prefer utilities; use components sparingly.
   ============================================================================= */

@layer components {
  /* Button component example */
  /* .btn {
    @apply inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-colors;
  } */

  /* Prose component for content styling */
  /* .prose-custom {
    @apply max-w-none;

    h2 { @apply text-2xl font-bold mt-8 mb-4; }
    h3 { @apply text-xl font-semibold mt-6 mb-3; }
    p { @apply mb-4 leading-relaxed; }
    a { @apply underline hover:no-underline; }
    ul, ol { @apply mb-4 pl-6; }
    li { @apply mb-2; }
    blockquote { @apply border-l-4 pl-4 italic my-4; }
  } */

  /* Card component for galleries/grids */
  /* .project-card {
    @apply block group;
  }
  .project-card-image {
    @apply overflow-hidden rounded-lg aspect-4/3;

    img { @apply w-full h-full object-cover transition-transform duration-300 group-hover:scale-105; }
  }
  .project-card-title {
    @apply mt-3 font-medium transition-colors group-hover:text-accent;
  }
  .project-card-meta {
    @apply text-sm text-gray-500;
  } */
}

/* =============================================================================
   UTILITIES

   Custom utility classes. Should be single-purpose.
   ============================================================================= */

@layer utilities {
  /* Text utilities */
  /* .text-balance { text-wrap: balance; } */

  /* Scroll animation utilities (for use with animate_controller.js) */
  /* .animate-on-scroll {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }
  .animate-on-scroll.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
  .animate-delay-100 { transition-delay: 100ms; }
  .animate-delay-200 { transition-delay: 200ms; }
  .animate-delay-300 { transition-delay: 300ms; } */

  /* Reading progress bar (for use with reading_progress_controller.js) */
  /* .reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: var(--color-primary, #9333EA);
    z-index: 9999;
    transition: width 0.1s;
  } */
}

/* =============================================================================
   PRINT STYLES

   Essential for educational/reference content. Users print guides and worksheets.
   ============================================================================= */

@media print {
  /* Hide interactive elements */
  nav, footer, .share-buttons, .reading-progress,
  button, [data-controller] { display: none !important; }

  /* Reset backgrounds for print */
  body, main, article {
    background: white !important;
    color: #1a1a1a !important;
  }

  /* Convert dark backgrounds to light */
  .bg-gray-800, .bg-gray-900 {
    background: #f5f5f5 !important;
    border: 1px solid #ddd !important;
  }

  /* Show URLs for external links */
  a[href^="http"]:after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #666;
  }

  /* Prevent page breaks inside content blocks */
  h1, h2, h3, h4 { page-break-after: avoid; }
  p, li, blockquote { orphans: 3; widows: 3; }

  /* Add site attribution */
  body::after {
    content: "Printed from {{ site.url }}";
    display: block;
    text-align: center;
    margin-top: 2rem;
    font-size: 0.8em;
    color: #666;
  }
}
```

### 4.4 src/assets/js/application.js

```javascript
// =============================================================================
// STIMULUS APPLICATION
// =============================================================================

import { Application } from "@hotwired/stimulus";

// Start Stimulus application
const application = Application.start();

// Configure Stimulus development experience
application.debug = false;
window.Stimulus = application;

// =============================================================================
// CONTROLLER REGISTRATION
//
// Import and register controllers manually. This approach:
// - Works without a build step
// - Is explicit about what's loaded
// - Supports CDN-based Stimulus via importmap
// =============================================================================

// Example registration (uncomment when adding controllers):
// import ToggleController from "./controllers/toggle_controller.js";
// application.register("toggle", ToggleController);

// import MobileNavController from "./controllers/mobile_nav_controller.js";
// application.register("mobile-nav", MobileNavController);

export { application };
```

### 4.5 Example Stimulus Controller

`src/assets/js/controllers/toggle_controller.js`:

```javascript
import { Controller } from "@hotwired/stimulus";

/**
 * Toggle Controller
 *
 * A general-purpose controller for showing/hiding elements.
 *
 * Usage:
 *   <div data-controller="toggle">
 *     <button data-action="click->toggle#toggle" aria-expanded="false">
 *       Toggle Menu
 *     </button>
 *     <div data-toggle-target="content" class="hidden">
 *       Content to show/hide
 *     </div>
 *   </div>
 *
 * With custom hidden class:
 *   <div data-controller="toggle" data-toggle-hidden-class="invisible opacity-0">
 */
export default class extends Controller {
  static targets = ["content"];
  static values = {
    open: { type: Boolean, default: false },
  };
  static classes = ["hidden"];

  connect() {
    // Apply initial state
    this.sync();
  }

  toggle() {
    this.openValue = !this.openValue;
  }

  open() {
    this.openValue = true;
  }

  close() {
    this.openValue = false;
  }

  openValueChanged() {
    this.sync();
  }

  sync() {
    const hiddenClass = this.hasHiddenClass ? this.hiddenClass : "hidden";

    this.contentTargets.forEach((target) => {
      target.classList.toggle(hiddenClass, !this.openValue);
    });

    // Update aria-expanded on trigger elements
    this.element
      .querySelectorAll("[aria-expanded]")
      .forEach((el) => el.setAttribute("aria-expanded", this.openValue));
  }
}
```

### 4.6 Additional Stimulus Controllers

The following controllers are commonly needed. Add them as required.

#### animate_controller.js (Scroll Animations)

Replaces AOS or other animation libraries with native IntersectionObserver:

`src/assets/js/controllers/animate_controller.js`:

```javascript
import { Controller } from "@hotwired/stimulus";

/**
 * Animate Controller
 *
 * Triggers CSS animations when elements scroll into view.
 * Uses IntersectionObserver (no external dependencies).
 *
 * Usage:
 *   <div data-controller="animate">
 *     <div data-animate="fade-up">Animates on scroll</div>
 *     <div data-animate="fade-up" data-animate-delay="200">Delayed</div>
 *   </div>
 *
 * Requires CSS:
 *   .animate-on-scroll { opacity: 0; transform: translateY(20px); transition: all 0.6s ease-out; }
 *   .animate-on-scroll.is-visible { opacity: 1; transform: translateY(0); }
 */
export default class extends Controller {
  connect() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.animateDelay || 0;
            setTimeout(() => {
              entry.target.classList.add("is-visible");
            }, delay);
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    this.animatedElements = this.element.querySelectorAll("[data-animate]");
    this.animatedElements.forEach((el) => {
      el.classList.add("animate-on-scroll");
      this.observer.observe(el);
    });
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
```

#### mobile_nav_controller.js (Mobile Navigation)

Manages mobile menu with icon swapping:

`src/assets/js/controllers/mobile_nav_controller.js`:

```javascript
import { Controller } from "@hotwired/stimulus";

/**
 * Mobile Nav Controller
 *
 * Handles mobile menu toggle with icon swapping.
 *
 * Usage:
 *   <nav data-controller="mobile-nav">
 *     <button data-action="click->mobile-nav#toggle" data-mobile-nav-target="button" aria-expanded="false">
 *       <svg data-mobile-nav-target="iconOpen"><!-- hamburger --></svg>
 *       <svg data-mobile-nav-target="iconClose" class="hidden"><!-- X --></svg>
 *     </button>
 *     <div data-mobile-nav-target="menu" class="hidden">
 *       <!-- menu items -->
 *     </div>
 *   </nav>
 */
export default class extends Controller {
  static targets = ["menu", "button", "iconOpen", "iconClose"];

  connect() {
    this.isOpen = false;
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.sync();
  }

  sync() {
    this.menuTarget.classList.toggle("hidden", !this.isOpen);
    if (this.hasIconOpenTarget) {
      this.iconOpenTarget.classList.toggle("hidden", this.isOpen);
    }
    if (this.hasIconCloseTarget) {
      this.iconCloseTarget.classList.toggle("hidden", !this.isOpen);
    }
    this.buttonTarget.setAttribute("aria-expanded", this.isOpen);
  }
}
```

#### form_controller.js (Async Form Submission)

Handles form submission with loading states and feedback:

`src/assets/js/controllers/form_controller.js`:

```javascript
import { Controller } from "@hotwired/stimulus";

/**
 * Form Controller
 *
 * Handles async form submission with feedback messages.
 * Works with Web3Forms, Formspree, or similar services.
 *
 * Usage:
 *   <form data-controller="form" data-action="submit->form#submit" action="https://api.web3forms.com/submit" method="POST">
 *     <input type="hidden" name="access_key" value="YOUR-ACCESS-KEY">
 *     <input type="text" name="name" required>
 *     <button type="submit" data-form-target="submitButton">Send</button>
 *   </form>
 *
 * Optional conditional fields:
 *   <select data-form-target="inquiryType" data-action="change->form#toggleConditional">
 *   <div data-form-target="conditionalFields" class="hidden">
 */
export default class extends Controller {
  static targets = ["submitButton", "inquiryType", "conditionalFields"];

  async submit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    if (this.hasSubmitButtonTarget) {
      this.submitButtonTarget.disabled = true;
      this.originalButtonText = this.submitButtonTarget.textContent;
      this.submitButtonTarget.textContent = "Sending...";
    }

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        form.reset();
        this.showMessage("Thank you! Your message has been sent.", "success");
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
      this.showMessage("Sorry, there was an error. Please try again.", "error");
    } finally {
      if (this.hasSubmitButtonTarget) {
        this.submitButtonTarget.disabled = false;
        this.submitButtonTarget.textContent = this.originalButtonText;
      }
    }
  }

  toggleConditional() {
    if (!this.hasInquiryTypeTarget || !this.hasConditionalFieldsTarget) return;
    const showConditional = this.inquiryTypeTarget.value === "special-event";
    this.conditionalFieldsTarget.classList.toggle("hidden", !showConditional);
  }

  showMessage(text, type) {
    const existing = this.element.parentNode.querySelector(".form-message");
    if (existing) existing.remove();

    const message = document.createElement("div");
    message.className = `form-message mt-4 p-4 rounded-lg text-center ${
      type === "success"
        ? "bg-green-100 text-green-800 border border-green-300"
        : "bg-red-100 text-red-800 border border-red-300"
    }`;
    message.textContent = text;
    this.element.insertAdjacentElement("afterend", message);
    setTimeout(() => message.remove(), 5000);
  }
}
```

#### reading_progress_controller.js (Reading Progress Bar)

Shows a progress bar for long-form content. Only activates on pages with substantial content:

`src/assets/js/controllers/reading_progress_controller.js`:

```javascript
import { Controller } from "@hotwired/stimulus";

/**
 * Reading Progress Controller
 *
 * Shows a progress bar at the top of the page indicating scroll position.
 * Only activates on pages with >1000 characters of content.
 *
 * Usage:
 *   <body data-controller="reading-progress">
 *
 * Requires CSS:
 *   .reading-progress { position: fixed; top: 0; left: 0; height: 3px; background: var(--color-primary); z-index: 9999; transition: width 0.1s; }
 */
export default class extends Controller {
  connect() {
    if (this.shouldShow()) {
      this.createProgressBar();
      this.boundUpdateProgress = this.updateProgress.bind(this);
      window.addEventListener("scroll", this.boundUpdateProgress);
      this.updateProgress();
    }
  }

  disconnect() {
    if (this.boundUpdateProgress) {
      window.removeEventListener("scroll", this.boundUpdateProgress);
    }
    if (this.progressBar) {
      this.progressBar.remove();
    }
  }

  shouldShow() {
    const main = document.querySelector("main");
    return main && main.textContent.length > 1000;
  }

  createProgressBar() {
    this.progressBar = document.createElement("div");
    this.progressBar.className = "reading-progress";
    this.progressBar.style.width = "0%";
    document.body.prepend(this.progressBar);
  }

  updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.progressBar.style.width = `${Math.min(progress, 100)}%`;
  }
}
```

#### clipboard_controller.js (Copy to Clipboard)

Provides clipboard copy functionality with visual feedback:

`src/assets/js/controllers/clipboard_controller.js`:

```javascript
import { Controller } from "@hotwired/stimulus";

/**
 * Clipboard Controller
 *
 * Copies URL or text to clipboard with visual feedback.
 *
 * Usage:
 *   <button data-controller="clipboard"
 *           data-clipboard-url-value="{{ page.url | url }}"
 *           data-action="click->clipboard#copy">
 *     <svg data-clipboard-target="icon"><!-- copy icon --></svg>
 *     <span data-clipboard-target="text">Copy Link</span>
 *   </button>
 */
export default class extends Controller {
  static targets = ["icon", "text"];
  static values = { url: String };

  copy() {
    const url = this.hasUrlValue ? this.urlValue : window.location.href;

    navigator.clipboard.writeText(url).then(() => {
      this.showFeedback();
    });
  }

  showFeedback() {
    const originalText = this.hasTextTarget ? this.textTarget.textContent : null;

    if (this.hasTextTarget) {
      this.textTarget.textContent = "Copied!";
    }

    if (this.hasIconTarget) {
      this.iconTarget.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />`;
    }

    setTimeout(() => {
      if (this.hasTextTarget && originalText) {
        this.textTarget.textContent = originalText;
      }
      if (this.hasIconTarget) {
        this.iconTarget.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />`;
      }
    }, 2000);
  }
}
```

### 4.7 src/_data/site.json

```json
{
  "name": "Site Name",
  "title": "Tagline or Descriptor",
  "tagline": "Short memorable phrase",
  "description": "Site description for meta tags and SEO.",
  "url": "https://example.com",
  "email": "contact@example.com",
  "author": {
    "name": "Author Name",
    "email": "author@example.com"
  },
  "language": "en",
  "theme": {
    "color": "#ffffff"
  },
  "social": {
    "patreon": "https://www.patreon.com/username",
    "instagram": "https://instagram.com/username"
  },
  "stats": {
    "metric1": "100+",
    "metric2": "50",
    "metric3": "100%"
  }
}
```

**Notes:**
- `name`: Brand or personal name (used in header, footer, copyright)
- `title`: Optional descriptor (e.g., "Woodworking & Craft")
- `tagline`: Short phrase for hero sections (e.g., "Professional Theater, Anywhere")
- `email`: Public contact email (displayed on site)
- `theme.color`: Browser theme color (address bar, PWA)
- `social`: External profile links (add as needed)
- `stats`: Displayable metrics for impact sections (keys are flexible)

### 4.8 src/_data/navigation.json

```json
{
  "main": [
    { "label": "Home", "url": "/" },
    { "label": "About", "url": "/about/" },
    { "label": "Contact", "url": "/contact/" }
  ],
  "footer": [
    { "label": "Privacy", "url": "/privacy/" },
    { "label": "Terms", "url": "/terms/" }
  ]
}
```

### 4.9 src/_includes/layouts/base.njk

```nunjucks
<!DOCTYPE html>
<html lang="{{ site.language | default('en') }}">
  <head>
    {% include "partials/head.njk" %}
  </head>
  <body class="min-h-screen flex flex-col">
    {% include "partials/nav.njk" %}

    <main class="flex-1">
      {{ content | safe }}
    </main>

    {% include "partials/footer.njk" %}
    {% include "partials/scripts.njk" %}
  </body>
</html>
```

### 4.10 src/_includes/layouts/page.njk

```nunjucks
---
layout: layouts/base.njk
---

<div class="container mx-auto px-4 py-12">
  {% if title %}
  <h1 class="text-4xl font-bold mb-8">{{ title }}</h1>
  {% endif %}

  <div class="prose max-w-none">
    {{ content | safe }}
  </div>
</div>
```

### 4.11 src/_includes/layouts/project.njk (Portfolio Sites)

```nunjucks
---
layout: layouts/base.njk
---

<article class="container mx-auto px-4 py-12">
  {# Back link #}
  <a href="/portfolio/" class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
    </svg>
    Back to Portfolio
  </a>

  {# Project header #}
  <header class="mb-8">
    <h1 class="text-4xl font-bold mb-2">{{ title }}</h1>
    {% if category %}
    <p class="text-gray-600">{{ category }}</p>
    {% endif %}
    {% if date %}
    <time datetime="{{ date | isoDate }}" class="text-sm text-gray-500">
      {{ date | readableDate }}
    </time>
    {% endif %}
  </header>

  {# Featured image #}
  {% if image %}
  <figure class="mb-8">
    <img
      src="{{ image }}"
      alt="{{ imageAlt | default(title) }}"
      class="w-full rounded-lg"
    >
  </figure>
  {% endif %}

  {# Content #}
  <div class="prose max-w-none">
    {{ content | safe }}
  </div>
</article>
```

### 4.12 src/_includes/partials/head.njk

```nunjucks
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>{{ title }}{% if title %} | {% endif %}{{ site.name }}</title>
<meta name="description" content="{{ description | default(site.description) }}">

{# Canonical URL #}
<link rel="canonical" href="{{ site.url }}{{ page.url }}">

{# Dynamic OG Image Selection (customize paths per section) #}
{%- if image -%}
  {%- set ogImage = image -%}
{%- elif "/portfolio/" in page.url -%}
  {%- set ogImage = "/assets/images/og-portfolio.png" -%}
{%- elif "/blog/" in page.url -%}
  {%- set ogImage = "/assets/images/og-blog.png" -%}
{%- else -%}
  {%- set ogImage = "/assets/images/og-default.png" -%}
{%- endif -%}

{# Open Graph #}
<meta property="og:title" content="{{ title | default(site.name) }}">
<meta property="og:description" content="{{ description | default(site.description) }}">
<meta property="og:type" content="website">
<meta property="og:url" content="{{ site.url }}{{ page.url }}">
<meta property="og:image" content="{{ site.url }}{{ ogImage }}">

{# Twitter Card #}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ title | default(site.name) }}">
<meta name="twitter:description" content="{{ description | default(site.description) }}">

{# Theme Color #}
<meta name="theme-color" content="{{ site.theme.color | default('#ffffff') }}">

{# Favicon - update paths as needed #}
<link rel="icon" href="/assets/images/favicon.ico" sizes="any">
<link rel="icon" href="/assets/images/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">

{# Google Fonts - uncomment and customize as needed #}
{# <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet"> #}

{# Stylesheet #}
<link rel="stylesheet" href="/assets/css/main.css">
```

### 4.13 src/_includes/partials/nav.njk

For fixed headers, use `fixed w-full z-50` and add `pt-20` or similar padding to `<main>` in base.njk.

```nunjucks
{# Fixed header variant: <header class="fixed w-full z-50 bg-white/95 backdrop-blur-sm border-b"> #}
<header class="bg-white border-b border-gray-200">
  <nav class="container mx-auto px-4" data-controller="mobile-nav">
    <div class="flex items-center justify-between h-16">
      {# Logo / Site Name #}
      <a href="/" class="text-xl font-bold">
        {{ site.name }}
      </a>

      {# Desktop Navigation #}
      <ul class="hidden md:flex items-center gap-6">
        {% for item in navigation.main %}
        <li>
          <a
            href="{{ item.url }}"
            class="text-gray-600 hover:text-gray-900 transition-colors{% if page.url == item.url %} text-gray-900 font-medium{% endif %}"
          >
            {{ item.label }}
          </a>
        </li>
        {% endfor %}
      </ul>

      {# Mobile Menu Button #}
      <button
        type="button"
        class="md:hidden p-2 -mr-2"
        data-controller="toggle"
        data-action="click->toggle#toggle"
        aria-expanded="false"
        aria-label="Toggle menu"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </div>

    {# Mobile Navigation #}
    <div data-toggle-target="content" class="hidden md:hidden pb-4">
      <ul class="flex flex-col gap-2">
        {% for item in navigation.main %}
        <li>
          <a
            href="{{ item.url }}"
            class="block py-2 text-gray-600 hover:text-gray-900{% if page.url == item.url %} text-gray-900 font-medium{% endif %}"
          >
            {{ item.label }}
          </a>
        </li>
        {% endfor %}
      </ul>
    </div>
  </nav>
</header>
```

### 4.14 src/_includes/partials/footer.njk

```nunjucks
<footer class="bg-gray-50 border-t border-gray-200">
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {# Copyright #}
      <p class="text-gray-600 text-sm">
        &copy; {% year %} {{ site.name }}. All rights reserved.
      </p>

      {# Footer Navigation #}
      {% if navigation.footer %}
      <ul class="flex gap-6">
        {% for item in navigation.footer %}
        <li>
          <a href="{{ item.url }}" class="text-gray-600 hover:text-gray-900 text-sm transition-colors">
            {{ item.label }}
          </a>
        </li>
        {% endfor %}
      </ul>
      {% endif %}
    </div>
  </div>
</footer>
```

### 4.15 src/_includes/partials/scripts.njk

```nunjucks
{# Stimulus via importmap (no build step required) #}
<script type="importmap">
{
  "imports": {
    "@hotwired/stimulus": "https://unpkg.com/@hotwired/stimulus@3.2.2/dist/stimulus.js"
  }
}
</script>

<script type="module" src="/assets/js/application.js"></script>

{# Analytics - uncomment and configure as needed #}
{#
{% if site.analytics.ga4 %}
<script async src="https://www.googletagmanager.com/gtag/js?id={{ site.analytics.ga4 }}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '{{ site.analytics.ga4 }}');
</script>
{% endif %}
#}
```

### 4.16 src/index.njk

```nunjucks
---
layout: layouts/base.njk
title: Home
description: Welcome to the site.
---

<section class="container mx-auto px-4 py-16">
  <h1 class="text-4xl md:text-5xl font-bold mb-6">
    Welcome to {{ site.name }}
  </h1>
  <p class="text-xl text-gray-600 max-w-2xl">
    {{ site.description }}
  </p>
</section>
```

### 4.17 .gitignore

```
# Dependencies
node_modules/

# Build output
dist/

# OS files
.DS_Store
Thumbs.db

# Editor directories
.idea/
.vscode/
*.swp
*.swo

# Environment files
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*

# Cache
.cache/
```

### 4.18 .github/workflows/deploy.yml

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 5. CONTENT AUTHORING

### Frontmatter Schema

Every content file must include frontmatter. Required and optional fields:

```yaml
---
# REQUIRED
layout: layouts/page.njk    # Layout to use
title: Page Title           # Page title (used in <title> and <h1>)

# RECOMMENDED
description: Description    # Meta description (SEO)
date: 2026-01-08           # Content date (for sorting)

# OPTIONAL
draft: false               # Exclude from build if true
tags:                      # For collections
  - tag1
  - tag2
image: /assets/images/og.jpg  # Open Graph / featured image
---
```

#### Portfolio Project Frontmatter

Projects in `src/portfolio/projects/` use additional fields:

```yaml
---
layout: layouts/project.njk
title: Project Name
description: Brief project description
date: 2026-01-08
category: Category Name     # e.g., "Furniture", "Cabinetry"
image: /assets/images/project-hero.jpg
imageAlt: Descriptive alt text for the image
draft: false
---
```

#### Educational/Long-Form Content Frontmatter

For guides, tutorials, and reference content with table of contents:

```yaml
---
layout: layouts/article.njk
title: Article Title
subtitle: Supporting subtitle for hero
description: Meta description for SEO
date: 2026-01-08

# Quick summary for social sharing and scannable reference
tldr: "One-sentence summary of key takeaway"

# Table of contents (renders navigation sidebar)
toc:
  - id: introduction
    title: Introduction
  - id: understanding
    title: Understanding the Concept
  - id: practical-tips
    title: Practical Tips

# Related content navigation
relatedArticles:
  - title: Related Article
    slug: related-article
    description: Brief description
---
```

### Markdown Conventions

1. **One H1 per page** — The `title` frontmatter becomes the H1. Don't add another.
2. **Headings in order** — H2, then H3, never skip levels.
3. **Alt text required** — All images must have descriptive alt text.
4. **Link text meaningful** — No "click here" links.

### Collections Pattern

Define collections in `eleventy.config.js`:

```javascript
eleventyConfig.addCollection("posts", function (collectionApi) {
  return collectionApi
    .getFilteredByGlob("src/content/posts/**/*.md")
    .filter((item) => !item.data.draft)
    .sort((a, b) => b.date - a.date);
});
```

Access in templates:

```nunjucks
{# All items #}
{% for post in collections.posts %}
  <article>
    <h2><a href="{{ post.url }}">{{ post.data.title }}</a></h2>
    <time datetime="{{ post.date | isoDate }}">{{ post.date | readableDate }}</time>
  </article>
{% endfor %}

{# Limited items (e.g., "Recent Work" on homepage) #}
{% for project in collections.projects | head(3) %}
  <a href="{{ project.url }}" class="project-card">
    <div class="project-card-image">
      <img src="{{ project.data.image }}" alt="{{ project.data.imageAlt }}">
    </div>
    <h3 class="project-card-title">{{ project.data.title }}</h3>
    <p class="project-card-meta">{{ project.data.category }}</p>
  </a>
{% endfor %}
```

---

## 6. STIMULUS CONVENTIONS

### Controller Naming

| Convention | Example |
|------------|---------|
| File name | `mobile_nav_controller.js` |
| Controller identifier | `mobile-nav` |
| Data attribute | `data-controller="mobile-nav"` |

The identifier is the file name without `_controller.js`, with underscores converted to hyphens.

### File Organization

```
src/assets/js/
├── application.js              # Stimulus setup + registrations
└── controllers/
    ├── toggle_controller.js    # Generic show/hide
    ├── mobile_nav_controller.js
    ├── clipboard_controller.js
    └── ...
```

### Data Attribute Patterns

```html
<!-- Controller attachment -->
<div data-controller="toggle">

<!-- Action binding -->
<button data-action="click->toggle#toggle">

<!-- Target definition -->
<div data-toggle-target="content">

<!-- Value definition -->
<div data-controller="toggle" data-toggle-open-value="true">

<!-- Class configuration -->
<div data-controller="toggle" data-toggle-hidden-class="invisible opacity-0">
```

### Controller Registration

All controllers must be explicitly imported and registered in `application.js`:

```javascript
import ToggleController from "./controllers/toggle_controller.js";
application.register("toggle", ToggleController);
```

Do not use autoloading or glob imports.

---

## 7. STYLING CONVENTIONS

### @theme Tokens

Define design tokens in `main.css` within the `@theme` directive:

```css
@theme {
  /* Colors use semantic naming */
  --color-primary-500: oklch(0.55 0.15 250);
  --color-surface: oklch(0.99 0 0);
  --color-text: oklch(0.15 0 0);

  /* Fonts include full stack */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Custom spacing only if defaults insufficient */
  --spacing-18: 4.5rem;
}
```

### Token Naming

| Category | Pattern | Example |
|----------|---------|---------|
| Colors | `--color-[semantic]-[shade]` | `--color-primary-500` |
| Fonts | `--font-[purpose]` | `--font-display` |
| Spacing | `--spacing-[value]` | `--spacing-18` |
| Breakpoints | `--breakpoint-[name]` | `--breakpoint-tablet` |

### Component Patterns

Prefer utilities. Use `@layer components` sparingly:

```css
@layer components {
  /* Only for truly reusable patterns */
  .prose-custom {
    @apply prose prose-lg prose-gray;
  }
}
```

### Responsive Approach

1. **Mobile-first** — Base styles are mobile; layer up with breakpoint prefixes.
2. **Standard breakpoints** — Use Tailwind defaults unless project requires custom.
3. **Container queries** — Use `@container` for component-level responsiveness when appropriate.

```html
<!-- Mobile-first responsive -->
<div class="text-base md:text-lg lg:text-xl">

<!-- Container queries -->
<div class="@container">
  <div class="@md:flex @md:gap-4">
```

---

## 8. BUILD & DEPLOY

### npm Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `eleventy --serve --watch` | Local development |
| `build` | `NODE_ENV=production eleventy` | Production build |
| `clean` | `rm -rf dist` | Remove build artifacts |

### Development Workflow

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Site available at http://localhost:8080
```

### Production Build

```bash
# Clean previous build
npm run clean

# Build for production
npm run build

# Output in dist/
```

### GitHub Pages Deployment

1. Repository must have GitHub Pages enabled.
2. Set source to "GitHub Actions" in repository settings.
3. Push to `main` branch triggers deployment.
4. Custom domain configured in repository settings (not CNAME file).

### Environment Considerations

| Environment | NODE_ENV | CSS Minification | Source Maps |
|-------------|----------|------------------|-------------|
| Development | (unset) | No | Yes |
| Production | production | Yes | No |

---

## 9. DOCUMENTATION REQUIREMENTS

### README.md Structure

Every project must include a README with these sections:

```markdown
# Project Name

Brief description of the project.

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Project Structure

[Tree diagram or brief explanation]

## Development

### Prerequisites

- Node.js 20+

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run clean` | Remove build artifacts |

### Adding Content

[How to add pages, posts, etc.]

### Styling

[How to modify theme tokens, add custom styles]

### JavaScript

[How to add Stimulus controllers]

## Deployment

[GitHub Pages configuration, custom domain setup]

## License

[License information]
```

### CLAUDE.md Requirements

Every project must include a CLAUDE.md for AI pairing context:

```markdown
# CLAUDE.md

## Project Overview

[One-paragraph description of what this site is and who it's for]

## Stack

- Eleventy 3.1.x (static site generator)
- Tailwind CSS 4.1.x (CSS-first configuration)
- Stimulus 3.2.x (JavaScript behavior)
- Nunjucks (templating)

## Key Files

- `eleventy.config.js` — Build configuration
- `src/assets/css/main.css` — Tailwind theme and styles
- `src/assets/js/application.js` — Stimulus setup
- `src/_data/site.json` — Site metadata
- `src/_includes/layouts/base.njk` — Root layout

## Commands

\`\`\`bash
npm run dev    # Development server
npm run build  # Production build
\`\`\`

## Conventions

- Layouts in `src/_includes/layouts/`
- Partials in `src/_includes/partials/`
- Stimulus controllers in `src/assets/js/controllers/`
- Controllers named `[name]_controller.js`

## Current State

[What's implemented, what's pending]

## Known Issues

[Any quirks or workarounds]
```

### Inline Comment Philosophy

1. **Explain why, not what** — Code shows what; comments explain why.
2. **Section headers in config files** — Use comment blocks to delineate sections.
3. **JSDoc for controllers** — Document usage examples in controller headers.
4. **No commented-out code** — Delete unused code; Git has history.

---

## 10. QUALITY CHECKLIST

Before marking a site "done," verify:

### Build

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts server without errors
- [ ] `npm run build` produces output in `dist/`
- [ ] No console errors in browser

### Structure

- [ ] Directory structure matches Section 3
- [ ] All required files present (eleventy.config.js, package.json, etc.)
- [ ] No files outside defined structure

### Templates

- [ ] Base layout renders complete HTML document
- [ ] All partials included without errors
- [ ] Navigation reflects navigation.json
- [ ] Site metadata populates from site.json

### Styles

- [ ] Tailwind CSS compiles without errors
- [ ] @theme tokens defined and applied
- [ ] No missing utility classes
- [ ] Responsive behavior works at all breakpoints

### JavaScript

- [ ] Stimulus application initializes
- [ ] All controllers registered
- [ ] Interactive elements function correctly
- [ ] No JavaScript errors in console

### Content

- [ ] All pages have required frontmatter
- [ ] Meta descriptions present
- [ ] No broken internal links

### Accessibility

- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA
- [ ] Focus states visible
- [ ] ARIA attributes correct

### Performance

- [ ] CSS minified in production build
- [ ] No unnecessary dependencies
- [ ] Images optimized

### Documentation

- [ ] README.md complete per Section 9
- [ ] CLAUDE.md present and accurate

### Deployment

- [ ] GitHub Actions workflow present
- [ ] Deployment succeeds
- [ ] Site accessible at expected URL

---

## APPENDIX A: Troubleshooting

### CSS Not Updating

**Symptom:** Changes to `main.css` don't appear in browser.

**Cause:** Tailwind processes before Eleventy, but browser may cache.

**Fix:**
1. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
2. Verify `eleventy.before` hook is running (add console.log)
3. Check `dist/assets/css/main.css` has new content

### Stimulus Controller Not Working

**Symptom:** Data attributes present but no behavior.

**Cause:** Controller not registered or import failed.

**Fix:**
1. Check browser console for import errors
2. Verify controller registered in `application.js`
3. Verify controller file exists and exports default class
4. Check data-controller name matches registration

### Nunjucks Template Errors

**Symptom:** Build fails with Nunjucks error.

**Common causes:**
- Missing closing `{% endif %}` or `{% endfor %}`
- Referencing undefined variable
- Include path wrong (should be relative to `_includes`)

**Fix:**
1. Read error message for line number
2. Check template syntax
3. Verify included partial exists

### GitHub Pages 404

**Symptom:** Site deploys but pages return 404.

**Cause:** Usually trailing slash or base URL issue.

**Fix:**
1. Ensure links use trailing slashes: `/about/` not `/about`
2. Check repository Pages settings
3. Verify `dist/` contains expected files

---

## APPENDIX B: Migration Notes

### From Tailwind 3.x

1. Remove `tailwind.config.js`
2. Remove `postcss.config.js`
3. Move theme configuration to `@theme` directive in `main.css`
4. Update `@tailwind` directives to `@import "tailwindcss"`
5. Update `ring` to `ring-3` (default changed from 3px to 1px)
6. Update `shadow-sm` to `shadow-xs` (scale shifted)

### From Eleventy 2.x

1. Update `package.json` to `"type": "module"`
2. Convert `module.exports` to `export default`
3. Convert `require()` to `import`
4. Rename `.eleventy.js` to `eleventy.config.js`

---

## APPENDIX C: Example Sites

Sites built to this specification serve as reference implementations:

1. **carpinte.ro** — Woodworking portfolio
2. **nomad-theater-company** — Theater company website
3. **thedbtresource.com** — Educational resource site (DBT/mental health)

---

## APPENDIX D: Changelog

### v1.4.0 (9 January 2026)

Learnings from engineers-manual implementation:

**Added:**
- `search_controller.js` — Pagefind integration with Cmd+K keyboard shortcut
- `toc_controller.js` — Scroll-spy sidebar highlighting using getBoundingClientRect()
- Dual TOC pattern: mobile `<details>` element + desktop sticky sidebar
- Custom `toc` Eleventy filter for automatic h2/h3 heading extraction
- Callout components (`.callout-note`, `.callout-warning`, `.callout-caution`)
- Prev/next chapter navigation partial
- Code block partial with filename header and copy button
- `docs.njk` layout with automatic table of contents

**Changed:**
- Build script now includes Pagefind index generation: `eleventy && npx pagefind --site dist`
- Section 4 expanded with search and TOC controller patterns

**Pattern notes:**
- Pagefind provides static site search without server infrastructure
- TOC controller uses getBoundingClientRect() for reliable scroll position (offsetTop unreliable with nested elements)
- Dual TOC pattern serves mobile (collapsible) and desktop (always-visible) UX
- Callouts use border-left-4 pattern with semantic color coding

---

### v1.3.0 (8 January 2026)

Learnings from thedbtresource.com implementation:

**Added:**
- `reading_progress_controller.js` — Reading progress bar with conditional activation (>1000 chars)
- `clipboard_controller.js` — Copy to clipboard with visual feedback
- Comprehensive print styles for educational/reference content
- Dynamic OG image selection based on URL path
- Educational content frontmatter: `tldr`, `toc`, `relatedArticles`
- `keyInfo` shortcode for callout boxes
- `sectionDivider` shortcode for visual section breaks
- `.reading-progress` CSS utility

**Pattern notes:**
- Reading progress controller only activates on substantial content pages
- Print styles essential for educational content users print for reference
- TL;DR field enables quick social sharing summaries
- ToC frontmatter enables automatic navigation generation

---

### v1.2.0 (8 January 2026)

Learnings from nomad-theater-company implementation:

**Added:**
- `animate_controller.js` — Scroll animations using native IntersectionObserver (replaces AOS)
- `mobile_nav_controller.js` — Mobile menu with hamburger/X icon swapping
- `form_controller.js` — Async form submission with Web3Forms, loading states, feedback messages
- Animation CSS utilities (`.animate-on-scroll`, `.is-visible`, delay classes)
- Site.json fields: `tagline`, `email`, `social`, `stats`
- Google Fonts preconnect pattern in head.njk
- Fixed header pattern documentation in nav.njk

**Changed:**
- Expanded Section 4.6 to "Additional Stimulus Controllers" with three controller patterns
- File specifications renumbered (4.7-4.18)
- Enhanced navigation partial with mobile-nav controller attachment

**Pattern notes:**
- IntersectionObserver eliminates external animation library dependencies
- Form controller handles conditional fields and async submission in one component
- Stats object in site.json enables flexible "impact metrics" sections

---

### v1.1.0 (January 2026)

Learnings from carpinte.ro implementation:

**Added:**
- `@source` directive documentation for Tailwind 4 class detection
- Portfolio/projects collection pattern alongside blog posts
- `project.njk` layout for portfolio items
- `head` filter for limiting collection items (e.g., "Recent Work")
- Portfolio-specific frontmatter fields (`category`, `imageAlt`)
- Prose and card component patterns in CSS
- `title` field in site.json (separate from `name`)
- `about.njk` and `contact.njk` in directory structure
- `pathPrefix` documentation for GitHub Pages project sites

**Changed:**
- Section structure expanded from `src/content/` to include `src/portfolio/`
- cssnano version pinned to 7.x (was "Latest")
- Collections now filter drafts by default
- File specifications renumbered (4.10-4.17)

**Clarified:**
- "What Goes Where" table expanded with section landing pages
- Component patterns shown commented but ready to uncomment

### v1.0.0 (January 2026)

Initial specification based on Eleventy 3.1, Tailwind 4.1, and Stimulus 3.2 stack.

---

*This specification is versioned. When patterns evolve, increment the version and document changes.*
