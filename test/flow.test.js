import { test, describe } from "node:test";
import assert from "node:assert/strict";

import Flow, { pointAt } from "../src/assets/js/lib/flow.js";

// Data moving through the build: particles travel a path from _data/ to
// dist/, measured by distance along it, advanced by dt.

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
const PATH = [[0, 0, 0], [3, 0, 0], [3, 1, 0]];

describe("pointAt", () => {
  test("starts at the first point and ends at the last", () => {
    assert.deepEqual(pointAt(PATH, 0), [0, 0, 0]);
    assert.deepEqual(pointAt(PATH, 1), [3, 1, 0]);
  });

  test("measures by distance along the path, not by corner count", () => {
    const quarter = pointAt(PATH, 0.25);
    close(quarter[0], 1);
    close(quarter[1], 0);
    const corner = pointAt(PATH, 0.75);
    close(corner[0], 3);
    close(corner[1], 0);
  });
});

describe("Flow", () => {
  test("spaces its particles evenly along the path", () => {
    assert.deepEqual(new Flow({ count: 4, speed: 0.1 }).advance(0), [0, 0.25, 0.5, 0.75]);
  });

  test("moves every particle forward by speed times dt", () => {
    const flow = new Flow({ count: 2, speed: 0.1 });
    const [a] = flow.advance(1);
    close(a, 0.1);
  });

  test("brings a particle back to the start when it reaches the end", () => {
    const flow = new Flow({ count: 1, speed: 0.4 });
    flow.advance(2);
    const [t] = flow.advance(1);
    close(t, 0.2);
  });
});
