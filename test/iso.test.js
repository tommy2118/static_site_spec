import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { project } from "../src/assets/js/lib/iso.js";

// Isometric projection: drawing units in, screen units out. Up is up on the
// screen (positive y); the caller maps to pixels.

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
const VIEW = { yaw: Math.PI / 4 };

describe("project", () => {
  test("puts the origin at the origin", () => {
    const p = project([0, 0, 0], VIEW);
    close(p.x, 0);
    close(p.y, 0);
  });

  test("draws the two ground axes as mirror images at the classic angle", () => {
    const right = project([1, 0, 0], VIEW);
    const left = project([0, 0, 1], VIEW);
    close(right.x, -left.x);
    close(right.y, left.y);
    assert.ok(right.y < 0, "toward the viewer sits lower on the sheet");
  });

  test("keeps verticals vertical and up on top", () => {
    const top = project([0, 1, 0], VIEW);
    close(top.x, 0);
    assert.ok(top.y > 0);
  });

  test("turns the drawing as the yaw changes", () => {
    const turned = project([1, 0, 0], { yaw: Math.PI / 4 + Math.PI / 2 });
    const before = project([1, 0, 0], VIEW);
    assert.ok(Math.sign(turned.x) !== Math.sign(before.x));
  });
});
