import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { drawing, LABELS, BOUNDS, WIRING, LABEL_EM } from "../src/assets/js/lib/sheet.js";

// The drawing as data: an exploded static site. Given a pose, the moving
// particles, and the time, it returns 3D segments, labels, and dots. It
// knows nothing about chapters, the clock, or the screen.

const ASSEMBLED = { explode: 0, tree: 0, flow: 0, page: 1, live: 0, wiring: 0 };
const EVERYTHING = { explode: 1, tree: 1, flow: 1, page: 1, live: 1, wiring: 1 };

const inside = ([x, y, z]) =>
  x >= BOUNDS.min[0] && x <= BOUNDS.max[0] &&
  y >= BOUNDS.min[1] && y <= BOUNDS.max[1] &&
  z >= BOUNDS.min[2] && z <= BOUNDS.max[2];

const plateLevels = (d) =>
  ["Eleventy", "Tailwind CSS", "Stimulus"].map((text) => d.labels.find((l) => l.text === text).at[1]);

describe("drawing", () => {
  test("stacks the three layers with no gaps when assembled", () => {
    const [eleventy, tailwind, stimulus] = plateLevels(drawing(ASSEMBLED, [], 0));
    assert.ok(eleventy < tailwind && tailwind < stimulus);
    assert.ok(stimulus - eleventy < 1);
  });

  test("pulls the layers apart as it explodes", () => {
    const together = plateLevels(drawing(ASSEMBLED, [], 0));
    const apart = plateLevels(drawing({ ...ASSEMBLED, explode: 1 }, [], 0));
    assert.ok(apart[2] - apart[0] > (together[2] - together[0]) * 3);
  });

  test("labels the layers only once they are apart enough to read", () => {
    const labelAlpha = (pose) => drawing(pose, [], 0).labels.find((l) => l.text === "Tailwind CSS").alpha;
    assert.equal(labelAlpha(ASSEMBLED), 0);
    assert.equal(labelAlpha({ ...ASSEMBLED, explode: 1 }), 1);
  });

  test("draws the directory tree as it is revealed", () => {
    const visible = (pose) => drawing(pose, [], 0).segments.filter((s) => s.part === "tree" && s.alpha > 0).length;
    assert.equal(visible(ASSEMBLED), 0);
    assert.ok(visible({ ...ASSEMBLED, tree: 0.5 }) < visible({ ...ASSEMBLED, tree: 1 }));
  });

  test("shows the data in flight only while the build runs", () => {
    assert.equal(drawing(ASSEMBLED, [0.1, 0.5], 0).dots.filter((d) => d.alpha > 0).length, 0);
    assert.equal(drawing({ ...ASSEMBLED, flow: 1 }, [0.1, 0.5], 0).dots.length, 2);
  });

  test("uses only labels it declares", () => {
    for (const label of drawing(EVERYTHING, [0.3], 2).labels) assert.ok(LABELS.includes(label.text), label.text);
  });

  test("keeps every part inside its bounds", () => {
    const d = drawing(EVERYTHING, [0, 0.5, 0.99], 3.7);
    for (const s of d.segments) assert.ok(inside(s.a) && inside(s.b), JSON.stringify(s));
    for (const l of d.labels) assert.ok(inside(l.at), l.text);
    for (const dot of d.dots) assert.ok(inside(dot.at));
  });

  test("makes every wiring box wide enough to hold its label", () => {
    for (const w of WIRING) {
      const width = Math.abs(w.z[0] - w.z[1]);
      // A monospace label is about 0.6 em per character, plus a margin each side.
      const needed = w.text.length * 0.6 * LABEL_EM + 0.3;
      assert.ok(width >= needed, `${w.text}: ${width.toFixed(2)} < ${needed.toFixed(2)}`);
    }
  });
});
