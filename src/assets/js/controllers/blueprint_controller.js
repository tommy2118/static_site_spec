import { Controller } from "@hotwired/stimulus";
import Plotter from "../lib/plotter.js";
import Pose from "../lib/pose.js";
import Flow from "../lib/flow.js";
import { drawing, LABELS } from "../lib/sheet.js";
import { project } from "../lib/iso.js";

/**
 * Blueprint Controller
 *
 * The one joint of the homepage scene. Owns the frame loop and every browser
 * global, and passes messages between the pose, the flow, the sheet and the
 * plotter. Chapters reach it only through the blueprint:chapter event.
 *
 * The paper and ink colors come from CSS (--sheet-paper, --sheet-ink), so
 * the drawing follows the page's light and dark themes.
 */
const COVER = { explode: 0, yaw: Math.PI / 4, tree: 0, flow: 0, page: 1, live: 0, wiring: 0, zoom: 1 };

const LABEL_FONT = { weight: 500, size: 12, family: '"JetBrains Mono", ui-monospace, monospace' };

const rgb = (hex) => {
  const n = parseInt(hex.trim().replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
};

export default class extends Controller {
  static targets = ["canvas", "fallback"];

  connect() {
    this.isConnected = true;
    this.still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.pose = new Pose(COVER, { move: this.still ? 0 : 1.4 });
    this.flow = new Flow({ count: 16, speed: 0.11 });
    this.onChapter = (event) => this.pose.set(event.detail.pose);
    window.addEventListener(`${this.identifier}:chapter`, this.onChapter);

    // The labels are drawn once into an atlas, so wait for their face.
    const fonts = document.fonts ? document.fonts.load(`500 24px ${LABEL_FONT.family}`).catch(() => {}) : Promise.resolve();
    fonts.then(() => this.isConnected && this.start());
  }

  start() {
    try {
      this.plotter = new Plotter(this.canvasTarget, {
        labels: LABELS,
        makeCanvas: () => document.createElement("canvas"),
        font: LABEL_FONT,
      });
    } catch (error) {
      console.warn("Blueprint could not start:", error);
      this.fallbackTarget.hidden = false;
      return;
    }

    this.scheme = window.matchMedia("(prefers-color-scheme: dark)");
    this.onScheme = () => this.readColors();
    this.scheme.addEventListener("change", this.onScheme);
    this.readColors();

    this.elapsed = 0;
    this.lastFrame = performance.now();
    this.frame = (now) => this.step(now);
    this.raf = requestAnimationFrame(this.frame);
  }

  disconnect() {
    this.isConnected = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener(`${this.identifier}:chapter`, this.onChapter);
    this.scheme?.removeEventListener("change", this.onScheme);
  }

  readColors() {
    const css = window.getComputedStyle(this.element);
    this.paper = rgb(css.getPropertyValue("--sheet-paper"));
    this.ink = rgb(css.getPropertyValue("--sheet-ink"));
  }

  // Where the drawing sits: beside the words from 1100px, below them under
  // that (matching the CSS breakpoint that gives the words their paper).
  layout({ width, height }, zoom) {
    if (width < 1100) return { cx: width * 0.5, cy: height * 0.76, scale: Math.min(width / 13, height / 11) * zoom };
    return { cx: width * 0.68, cy: height * 0.64, scale: Math.min(width / 18, height / 9.5) * zoom };
  }

  step(now) {
    const dt = Math.max(0, Math.min(0.1, (now - this.lastFrame) / 1000));
    this.lastFrame = now;
    this.elapsed += dt;

    const pose = this.pose.advance(dt);
    const time = this.still ? 0 : this.elapsed;
    const sheet = drawing(pose, this.flow.advance(this.still ? 0 : dt), time);

    const { cx, cy, scale } = this.layout(this.plotter.size, pose.zoom);
    const view = { yaw: pose.yaw };
    const toScreen = (point) => {
      const p = project(point, view);
      return [cx + p.x * scale, cy - p.y * scale];
    };

    this.plotter.render({
      time,
      dpr: Math.min(2, window.devicePixelRatio || 1),
      paper: this.paper,
      ink: this.ink,
      segments: sheet.segments.map((s) => {
        const [ax, ay] = toScreen(s.a);
        const [bx, by] = toScreen(s.b);
        return { ax, ay, bx, by, width: s.weight, alpha: s.alpha };
      }),
      dots: sheet.dots.map((d) => {
        const [x, y] = toScreen(d.at);
        return { x, y, radius: 2.4, alpha: d.alpha };
      }),
      labels: sheet.labels.map((l) => {
        const [x, y] = toScreen(l.at);
        return { text: l.text, x, y, alpha: l.alpha };
      }),
    });
    this.raf = requestAnimationFrame(this.frame);
  }
}
