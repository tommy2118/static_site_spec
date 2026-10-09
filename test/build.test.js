// The outer loop: build the real docs site with the real Eleventy config and
// read the homepage. Proves the Blueprint chapters reach the HTML, in order,
// each carrying a pose, and that the words stand without the drawing.
//
// Body plan (build time):
//   src/_data/blueprint.json   the chapters and the pose each asks for
//   src/index.njk              one chapter per entry; the words live here
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import Eleventy from "@11ty/eleventy";

let home;

const chapters = (html) =>
  [...html.matchAll(/data-chapter-look-value="([^"]*)"/g)].map((m) =>
    JSON.parse(m[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&"))
  );

before(async () => {
  const pages = await new Eleventy("src", "dist", { configPath: "eleventy.config.js", quietMode: true }).toJSON();
  home = pages.find((p) => p.url === "/").content;
});

describe("the homepage", () => {
  test("runs the drawing through the spec in order", () => {
    assert.deepEqual(chapters(home).map((c) => c.id), [
      "cover", "stack", "structure", "build", "controllers", "scene-sites", "title-block",
    ]);
  });

  test("announces every chapter to the blueprint", () => {
    const scenes = [...home.matchAll(/data-chapter-scene-value="([^"]*)"/g)].map((m) => m[1]);
    assert.equal(scenes.length, 7);
    assert.ok(scenes.every((s) => s === "blueprint"));
  });

  test("gives every chapter a complete pose", () => {
    for (const c of chapters(home)) {
      for (const key of ["explode", "yaw", "tree", "flow", "page", "live", "wiring", "zoom"]) {
        assert.equal(typeof c.pose[key], "number", `${c.id} is missing ${key}`);
      }
    }
  });

  test("keeps every word in the HTML", () => {
    assert.match(home, /<h1[^>]*>Static Site Spec<\/h1>/);
    assert.match(home, /Eleventy/);
    assert.match(home, /Tailwind CSS/);
    assert.match(home, /Stimulus/);
  });

  test("closes on a title block with the current version", () => {
    assert.match(home, /class="title-block"/);
    assert.match(home, /1\.7\.0/);
  });

  test("keeps the drawing's fallback hidden until the drawing fails", () => {
    assert.match(home, /<div class="sheet-fallback" hidden data-blueprint-target="fallback">/);
  });

  test("hides the drawing from assistive technology", () => {
    assert.match(home, /<canvas class="sheet" data-blueprint-target="canvas" aria-hidden="true">/);
  });
});
