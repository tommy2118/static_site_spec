// =============================================================================
// FLOW
// Data moving through the build. Particles travel a path by distance along
// it, as fractions from 0 to 1, advanced by dt. Knows nothing about what the
// path passes through.
// =============================================================================

const length = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);

export function pointAt(path, t) {
  const legs = path.slice(1).map((p, i) => length(path[i], p));
  let remaining = Math.min(1, Math.max(0, t)) * legs.reduce((sum, l) => sum + l, 0);
  for (let i = 0; i < legs.length; i++) {
    if (remaining <= legs[i] || i === legs.length - 1) {
      const k = legs[i] === 0 ? 0 : Math.min(1, remaining / legs[i]);
      const [a, b] = [path[i], path[i + 1]];
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    }
    remaining -= legs[i];
  }
  return [...path[0]];
}

export default class Flow {
  constructor({ count, speed }) {
    this.speed = speed;
    this.phases = Array.from({ length: count }, (_, i) => i / count);
  }

  advance(dt) {
    this.phases = this.phases.map((t) => (t + this.speed * dt) % 1);
    return this.phases;
  }
}
