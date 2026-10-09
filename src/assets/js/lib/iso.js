// =============================================================================
// ISO
// Isometric projection: drawing units in, screen units out, up is up. The
// drawing turns about its vertical axis by `yaw`; the tilt is the true
// isometric angle. The caller maps screen units to pixels.
// =============================================================================

const PITCH = Math.atan(1 / Math.SQRT2);
const LIFT = Math.cos(PITCH);
const DROP = Math.sin(PITCH);

export function project([x, y, z], { yaw }) {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const across = x * c - z * s;
  const toward = x * s + z * c;
  return { x: across, y: y * LIFT - toward * DROP };
}
