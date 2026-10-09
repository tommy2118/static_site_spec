import { test, describe } from "node:test";
import assert from "node:assert/strict";

import Pose from "../src/assets/js/lib/pose.js";

// Eases the drawing toward the pose a chapter asks for, advanced by dt.
// Never reads a clock.

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
const START = { explode: 0, tree: 0 };

describe("Pose", () => {
  test("starts where it is told to", () => {
    assert.deepEqual(new Pose(START, { move: 2 }).advance(0), START);
  });

  test("arrives once the move time has passed", () => {
    const pose = new Pose(START, { move: 2 });
    pose.set({ explode: 1, tree: 1 });
    pose.advance(1);
    const at = pose.advance(1);
    close(at.explode, 1);
    close(at.tree, 1);
  });

  test("is halfway there halfway through the move", () => {
    const pose = new Pose(START, { move: 2 });
    pose.set({ explode: 1, tree: 0 });
    close(pose.advance(1).explode, 0.5);
  });

  test("never overshoots", () => {
    const pose = new Pose(START, { move: 1 });
    pose.set({ explode: 1, tree: 0 });
    for (let i = 0; i < 90; i++) assert.ok(pose.advance(1 / 60).explode <= 1);
  });

  test("takes a new pose from wherever the drawing is, without a jump", () => {
    const pose = new Pose(START, { move: 2 });
    pose.set({ explode: 1, tree: 1 });
    const midway = pose.advance(1);
    pose.set({ explode: 0, tree: 0 });
    assert.deepEqual(pose.advance(0), midway);
  });

  test("keeps a value the new pose leaves out", () => {
    const pose = new Pose(START, { move: 0 });
    pose.set({ explode: 1, tree: 1 });
    pose.set({ explode: 0 });
    assert.equal(pose.advance(0).tree, 1);
  });

  test("snaps when there is no move time", () => {
    const pose = new Pose(START, { move: 0 });
    pose.set({ explode: 1, tree: 0 });
    assert.equal(pose.advance(0).explode, 1);
  });
});
