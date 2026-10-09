// =============================================================================
// SHEET
// The drawing as data: an exploded static site. Three layers (Eleventy,
// Tailwind CSS, Stimulus) with the finished page on top, the source tree on
// the ground beside them, data flowing through the build into dist/, and the
// wiring of a scene site behind. Given a pose, the particles' places along
// the build, and the time, returns 3D segments, labels, and dots.
// Knows nothing about chapters, the clock, or the screen. Units: y is up;
// the layers are 4 wide and 3 deep.
// =============================================================================

import { pointAt } from "./flow.js";

export const BOUNDS = { min: [-7, 0, -3], max: [7, 6, 3] };

// A label's em in drawing units. The plotter sizes labels with the drawing,
// so anything drawn around a label can be measured against it.
export const LABEL_EM = 0.18;

const W = 2;          // half width of a layer
const D = 1.5;        // half depth of a layer
const T = 0.22;       // layer thickness
const LAYERS = ["Eleventy", "Tailwind CSS", "Stimulus"];

const TREE = [
  { text: "src/", depth: 0 },
  { text: "_data/", depth: 1 },
  { text: "_includes/", depth: 1 },
  { text: "assets/", depth: 1 },
  { text: "js/", depth: 2 },
  { text: "lib/", depth: 3 },
  { text: "index.njk", depth: 1 },
];

// Stands on the plane behind the layers that faces the viewer once the
// drawing has turned for the Scene Sites chapter; read left to right as z falls.
export const WIRING = [
  { text: "chapter", z: [2.9, 1.6] },
  { text: "scene controller", z: [1.15, -1.15] },
  { text: "lib/", z: [-1.45, -2.65] },
];

export const LABELS = [...new Set([...LAYERS, ...TREE.map((t) => t.text), "dist/", ...WIRING.map((w) => w.text)])];

const clamp = (v) => Math.min(1, Math.max(0, v));
const band = (v, from, to) => clamp((v - from) / (to - from));

function box(out, [x0, y0, z0], [x1, y1, z1], alpha, weight, part) {
  const c = (x, y, z) => [x, y, z];
  const corners = [
    c(x0, y0, z0), c(x1, y0, z0), c(x1, y0, z1), c(x0, y0, z1),
    c(x0, y1, z0), c(x1, y1, z0), c(x1, y1, z1), c(x0, y1, z1),
  ];
  const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  for (const [i, j] of edges) out.push({ a: corners[i], b: corners[j], alpha, weight, part });
}

function rect(out, corners, alpha, weight, part) {
  corners.forEach((a, i) => out.push({ a, b: corners[(i + 1) % corners.length], alpha, weight, part }));
}

// The bottom of each layer, given how far apart the pose has pulled them.
const levels = (explode) => LAYERS.map((_, i) => i * (T + 0.04 + explode * 1.15));

function layers(pose, segments, labels) {
  const bottoms = levels(pose.explode);
  const legible = band(pose.explode, 0.35, 0.75);
  bottoms.forEach((y, i) => {
    box(segments, [-W, y, -D], [W, y + T, D], 1, 1.4, "layer");
    // Each layer's own hatching on its top face, so the three read apart.
    const top = y + T;
    for (let k = 1; k < 6; k++) {
      const f = k / 6;
      if (i === 0) segments.push({ a: [-W, top, -D + 2 * D * f], b: [W, top, -D + 2 * D * f], alpha: 0.35, weight: 0.7, part: "layer" });
      if (i === 1) segments.push({ a: [-W + 2 * W * f, top, -D], b: [-W + 2 * W * f, top, D], alpha: 0.35, weight: 0.7, part: "layer" });
      if (i === 2) segments.push({ a: [-W + 2 * W * f, top, -D], b: [-W, top, -D + 2 * D * f], alpha: 0.35, weight: 0.7, part: "layer" });
    }
    const mid = y + T / 2;
    segments.push({ a: [W, mid, D], b: [W + 0.5, mid, D], alpha: legible, weight: 0.9, part: "leader" });
    labels.push({ text: LAYERS[i], at: [W + 0.6, mid, D], alpha: legible });
  });
  return bottoms[2] + T;
}

function page(pose, top, time, segments) {
  if (pose.page <= 0) return;
  // The page floats clear of the stack, so it reads as its own sheet.
  const y = top + 0.45 + pose.explode * 0.6;
  const a = pose.page;
  const x0 = -1.7, x1 = 1.7, z0 = -1.25, z1 = 1.25;
  rect(segments, [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], a, 1.2, "page");
  // The header bar, a headline, and lines of copy.
  segments.push({ a: [x0, y, z0 + 0.35], b: [x1, y, z0 + 0.35], alpha: a, weight: 0.9, part: "page" });
  segments.push({ a: [x0 + 0.25, y, z0 + 0.75], b: [0.4, y, z0 + 0.75], alpha: a, weight: 1.6, part: "page" });
  for (let k = 0; k < 4; k++) {
    const z = z0 + 1.1 + k * 0.28;
    segments.push({ a: [x0 + 0.25, y, z], b: [x1 - 0.5 - (k % 2) * 0.6, y, z], alpha: a * 0.6, weight: 0.7, part: "page" });
  }
  // Live: a menu slides in and out the way a controller drives it.
  if (pose.live > 0) {
    const open = 0.5 + 0.5 * Math.sin(time * 1.6);
    const edge = x1 - (0.15 + open * 1.0);
    rect(segments, [[edge, y, z0 + 0.35], [x1, y, z0 + 0.35], [x1, y, z1], [edge, y, z1]], a * pose.live, 1, "page");
    for (let k = 0; k < 3; k++) {
      const z = z0 + 0.7 + k * 0.35;
      segments.push({ a: [edge + 0.15, y, z], b: [x1 - 0.15, y, z], alpha: a * pose.live * open, weight: 0.8, part: "page" });
    }
  }
}

// The tree stands on its own sheet to the left of the layers, so its rows
// run straight down the page and their labels never collide. Standing it
// further back would lift it under the site header.
const TREE_Z = 0;
const rowY = (r) => 4.6 - r * 0.6;
const rowX = (depth) => -6.6 + depth * 0.55;

function tree(pose, segments, labels) {
  const shown = pose.tree * TREE.length;
  TREE.forEach((item, r) => {
    const alpha = clamp(shown - r);
    const x = rowX(item.depth);
    const y = rowY(r);
    if (item.depth > 0) {
      const parent = TREE.slice(0, r).findLastIndex((p) => p.depth === item.depth - 1);
      const spine = rowX(item.depth - 1) + 0.15;
      segments.push({ a: [spine, rowY(parent) - 0.18, TREE_Z], b: [spine, y, TREE_Z], alpha, weight: 0.9, part: "tree" });
      segments.push({ a: [spine, y, TREE_Z], b: [x, y, TREE_Z], alpha, weight: 0.9, part: "tree" });
    }
    labels.push({ text: item.text, at: [x + 0.08, y, TREE_Z], alpha });
  });
}

function build(pose, top, flowTs, segments, labels, dots) {
  const a = pose.flow;
  // dist/ waits on the ground to the right: what the build writes.
  rect(segments, [[4, 0, 0], [5.6, 0, 0], [5.6, 0, 1.6], [4, 0, 1.6]], a, 1.1, "dist");
  labels.push({ text: "dist/", at: [4.2, 0, 2.1], alpha: a });
  if (a <= 0) return;
  const path = [
    [rowX(1) + 0.9, rowY(1), TREE_Z],
    [-W, T / 2, -D + 0.2],
    [0, T / 2, 0],
    [0, top + 0.1, 0],
    [W, top + 0.1, 0.4],
    [4.8, 0, 0.8],
  ];
  for (const t of flowTs) dots.push({ at: pointAt(path, t), alpha: a });
}

function wiring(pose, segments, labels) {
  const a = pose.wiring;
  const x = -2.9, y0 = 4.4, y1 = 5.0;
  WIRING.forEach((w, i) => {
    rect(segments, [[x, y0, w.z[0]], [x, y0, w.z[1]], [x, y1, w.z[1]], [x, y1, w.z[0]]], a, 1.1, "wiring");
    labels.push({ text: w.text, at: [x, (y0 + y1) / 2, w.z[0] - 0.12], alpha: a });
    const next = WIRING[i + 1];
    if (next) segments.push({ a: [x, (y0 + y1) / 2, w.z[1]], b: [x, (y0 + y1) / 2, next.z[0]], alpha: a, weight: 1, part: "wiring" });
  });
}

export function drawing(pose, flowTs, time) {
  const segments = [];
  const labels = [];
  const dots = [];
  const top = layers(pose, segments, labels);
  page(pose, top, time, segments);
  tree(pose, segments, labels);
  build(pose, top, flowTs, segments, labels, dots);
  wiring(pose, segments, labels);
  return { segments, labels, dots };
}
