---
layout: layouts/docs.njk
title: Scene Sites
description: An optional layer for sites with a live rendered scene that the page steers as the reader scrolls.
order: 15
prevPage:
  url: /checklist/
  title: Checklist
nextPage:
  url: /controllers/
  title: Controllers
---

{% raw %}
## When This Applies

A scene site has a live rendered scene, usually a WebGL canvas, that the page's content steers as the reader scrolls. Brochure sites skip this section. For scene sites, everything in Sections 1 through 10 still applies; this section adds one layer on top.

## The Body Plan

```
section[data-controller="chapter"]   (one per scrolling section)
        │
        │  window CustomEvents, detail = the look it wants:
        │    "<scene>:chapter"   it straddles mid-screen (exactly one at a time)
        │    "<scene>:approach"  it is coming up from below
        ▼
<scene>_controller.js                (the one joint)
        ├── lib/clock.js             time, advanced by dt
        ├── lib/<model>.js           pure domain math
        └── lib/renderer.js          WebGL2: draws what it is handed
```

| Part | Owns | Refuses to know |
|------|------|-----------------|
| Chapter controller | When its section is the active one, and announcing the look it wants | Who is listening, or how the look is drawn |
| Scene controller | The frame loop, pointer input, and every browser global (`requestAnimationFrame`, `performance.now`, `matchMedia`, `devicePixelRatio`, `AudioContext`) | Which section is on screen; it only hears announcements |
| `lib/` domain modules | The math of the subject | The DOM, Stimulus, the clock, the page's content |
| `lib/renderer.js` | Drawing one frame from the state it is handed | Where that state came from, or what time it is |

The scene controller is the only file that knows all the parts exist. It hands browser globals to `lib/` modules; `lib/` modules never reach for them. Anything that changes over time (a camera easing to a pose, lights fading to a look) advances by the `dt` the loop passes in, never by reading a clock itself.

## Directory Additions

```
src/assets/js/
├── application.js
├── controllers/
│   ├── <scene>_controller.js     # The one joint: loop, pointer, globals
│   └── chapter_controller.js     # Announces each section's look
└── lib/
    ├── clock.js                  # Scene time and rate
    ├── <model>.js                # Pure domain math (tested)
    └── renderer.js               # WebGL2; throws if unavailable
test/
└── <model>.test.js               # node:test, no browser
```

`lib/` is copied with the rest of `src/assets/js` by the existing passthrough (Section 4.2). No configuration changes.

## package.json

Scene sites add a fourth script:

```json
"scripts": {
  "dev": "eleventy --serve --watch",
  "build": "NODE_ENV=production eleventy",
  "clean": "rm -rf dist",
  "test": "node --test"
}
```

`node --test` is Node's built-in runner: no dependency, and it finds `test/*.test.js` on its own. A module under test must not touch browser globals when it is imported.

## chapter_controller.js

The same file serves every scene site; the look is data in the markup.

```javascript
import { Controller } from "@hotwired/stimulus";

/**
 * Chapter Controller
 *
 * A scrolling section of a scene site. When it straddles the vertical middle
 * of the viewport it announces the look it wants on a window event. It
 * refuses to know who is listening.
 *
 * The midpoint test, rather than an intersection ratio, stays correct for
 * sections taller than the viewport and keeps exactly one chapter active.
 * A section coming up from below also announces that it is approaching,
 * for scenes that warn before they change.
 *
 *   <section data-controller="chapter"
 *            data-chapter-scene-value="stage"
 *            data-chapter-look-value='{"label": "lights 10", "look": {...}}'>
 *
 * announces "stage:chapter" when it is active and "stage:approach" as it
 * comes up.
 */
export default class extends Controller {
  static values = { scene: String, look: Object };

  connect() {
    this.active = false;
    this.approaching = false;
    this.pending = false;
    this.onScroll = () => this.schedule();
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onScroll, { passive: true });
    this.schedule();
  }

  disconnect() {
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.onScroll);
  }

  schedule() {
    if (this.pending) return;
    this.pending = true;
    requestAnimationFrame(() => {
      this.pending = false;
      this.check();
    });
  }

  check() {
    const rect = this.element.getBoundingClientRect();
    const mid = window.innerHeight / 2;
    const contains = rect.top <= mid && rect.bottom > mid;
    const approaching = !contains && rect.top > mid && rect.top < window.innerHeight * 0.92;

    if (approaching !== this.approaching) {
      this.approaching = approaching;
      if (approaching) this.announce("approach");
    }
    if (contains === this.active) return;
    this.active = contains;
    this.element.classList.toggle("is-active", contains);
    if (contains) this.announce("chapter");
  }

  announce(kind) {
    window.dispatchEvent(new CustomEvent(`${this.sceneValue}:${kind}`, { detail: this.lookValue }));
  }
}
```

The `is-active` class lets CSS stage the section's own content (titles flying in, captions fading up) without another controller. Scenes that do not warn before a change simply do not listen for `approach`.

## The Scene Controller

One per site, named for the scene (`orrery_controller.js`, `sword_controller.js`). Its element must contain or precede the chapters, so its listener is attached before the first announcement.

```javascript
import { Controller } from "@hotwired/stimulus";
import Clock from "../lib/clock.js";
import Renderer from "../lib/renderer.js";

/**
 * Scene Controller
 *
 * The one joint. Owns the frame loop and the browser globals, and passes
 * messages between the lib modules. Chapters reach it only through the
 * "<identifier>:chapter" event, so an orrery controller hears "orrery:chapter".
 */
export default class extends Controller {
  static targets = ["canvas", "fallback"];

  connect() {
    this.still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    try {
      this.renderer = new Renderer(this.canvasTarget);
    } catch (error) {
      console.warn("Scene could not start:", error);
      this.fallbackTarget.hidden = false;
      return;
    }

    this.clock = new Clock({ rate: this.still ? 0 : 1 });
    this.onChapter = (event) => this.applyChapter(event.detail);
    window.addEventListener(`${this.identifier}:chapter`, this.onChapter);

    this.lastFrame = performance.now();
    this.frame = (now) => this.step(now);
    this.raf = requestAnimationFrame(this.frame);
  }

  disconnect() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener(`${this.identifier}:chapter`, this.onChapter);
  }

  applyChapter(look) {
    this.look = look;
  }

  step(now) {
    const dt = Math.max(0, Math.min(0.1, (now - this.lastFrame) / 1000));
    this.lastFrame = now;
    this.renderer.render({
      time: this.clock.tick(dt),
      dt,
      look: this.look,
      dpr: Math.min(2, window.devicePixelRatio || 1),
    });
    this.raf = requestAnimationFrame(this.frame);
  }
}
```

**Notes:**
- `dt` is clamped to 0.1s so a backgrounded tab does not jump the scene when it returns
- Device pixel ratio is capped at 2
- Pointer input binds here and is handed to `lib/` modules as plain numbers: on the canvas when the scene is dragged, on the window when the canvas sits behind the page

## Renderer Contract

`lib/renderer.js` exports a class that:

1. Takes the canvas in its constructor and calls `getContext("webgl2")`
2. Throws `new Error("WebGL2 is not available")` when that returns null, and throws the info log when a shader fails to compile or link
3. Draws one frame per `render(state)` call from what it is handed, sizing the drawing buffer from `canvas.clientWidth × dpr`
4. Never reads the clock, schedules frames, or queries the DOM beyond its own canvas

## Fallback and Motion

- Every scene has a fallback, in one of two forms:
  - **A hidden fallback element** (`data-<scene>-target="fallback"`) with a static image or a short note. The scene controller reveals it when the renderer throws. Use this when the scene fills the screen behind the page, as an orrery or a stage does.
  - **The plain page.** The page's own markup is the fallback, styled to read on its own, and the scene opts in: the controller adds a class (`has-scene`) only once the renderer has started, and CSS hands the drawing over to the canvas under that class. Use this when the scene draws behind specific elements, as slips behind lines of text do. A visitor without the scene sees the page exactly as written, with nothing to reveal.
- In either form, parts that do not draw (calls, captions, accent colors) may keep running without the scene.
- All text lives in the HTML. The canvas may repeat the page's words as labels, at a size that scales with the drawing, but it never carries words the page does not have. The page must read completely with the scene missing.
- The canvas is decorative: `aria-hidden="true"`.
- Under `prefers-reduced-motion: reduce`, nothing moves on its own: freeze or slow the clock, stop auto-rotation, and keep the reduced-motion CSS from Section 4.3. Direct input (dragging, pointing) still works.

## Testing

Test the `lib/` domain modules with `node:test`, importing them straight from `src/`:

```javascript
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { solveKepler } from "../src/assets/js/lib/ephemeris.js";

describe("solveKepler", () => {
  test("satisfies M = E - e sin E across the eccentricities we use", () => {
    for (const e of [0, 0.0167, 0.2056, 0.6]) {
      for (let M = -Math.PI; M <= Math.PI; M += 0.37) {
        const E = solveKepler(M, e);
        assert.ok(Math.abs(E - e * Math.sin(E) - M) < 1e-9);
      }
    }
  });
});
```

Domain modules are pure, so assert their results. The renderer and the controllers are checked in the browser against the checklist below, not unit tested. A build test that runs Eleventy's programmatic API (`new Eleventy("src", "dist", { configPath: "eleventy.config.js" }).toJSON()`) and reads the page is a cheap outer loop: it proves the data reaches the chapters without a browser.

Chapters check on `requestAnimationFrame` and pages scroll smoothly, and both pause in a hidden tab. When probing a scene from a script, scroll with `behavior: "instant"`.

## Scene Checklist

In addition to Section 10:

- [ ] `npm test` passes
- [ ] With WebGL disabled, the fallback shows (or the plain page stays plain) and every word of content is still on the page
- [ ] Every word the canvas draws is also in the HTML
- [ ] With reduced motion on, nothing animates on its own
- [ ] Scrolling activates exactly one chapter at a time, including sections taller than the viewport
- [ ] `grep -rnE '\bwindow\.|\bdocument\.|performance\.now|requestAnimationFrame\(' src/assets/js/lib/` finds nothing
- [ ] The frame loop stops when the scene controller disconnects
{% endraw %}
