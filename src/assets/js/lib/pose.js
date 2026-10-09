// =============================================================================
// POSE
// Eases the drawing toward the pose a chapter asks for, advanced by the dt
// the frame loop hands it. Every value is a number; a value the new pose
// leaves out stays where it is. Never reads a clock.
// =============================================================================

const ease = (k) => k * k * (3 - 2 * k);
const mix = (a, b, k) => a + (b - a) * k;

export default class Pose {
  // move: seconds a change of pose takes.
  constructor(initial, { move = 1.4 } = {}) {
    this.move = move;
    this.from = { ...initial };
    this.to = { ...initial };
    this.elapsed = 0;
  }

  set(target) {
    this.from = this.current();
    this.to = { ...this.from, ...target };
    this.elapsed = 0;
  }

  advance(dt) {
    this.elapsed += dt;
    return this.current();
  }

  current() {
    const k = this.move === 0 ? 1 : ease(Math.min(1, this.elapsed / this.move));
    return Object.fromEntries(Object.keys(this.to).map((key) => [key, mix(this.from[key], this.to[key], k)]));
  }
}
