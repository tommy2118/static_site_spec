// =============================================================================
// PLOTTER
// The renderer. Draws one frame from what it is handed: the paper, then the
// projected lines, dots, and labels of the drawing, in screen pixels. Labels
// come from an atlas drawn once, on a 2D canvas the caller provides. Never
// reads a clock, schedules a frame, or knows what the drawing shows.
// Throws when WebGL2 is unavailable, so the page can show its fallback.
// =============================================================================

const QUAD = `#version 300 es
in vec2 corner;
void main() { gl_Position = vec4(corner, 0.0, 1.0); }`;

const PAPER = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime, uDpr;
uniform vec3 uPaper, uInk;
out vec4 outColor;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float rule(vec2 px, float step) {
  vec2 g = abs(fract(px / step - 0.5) - 0.5) * step;
  return 1.0 - smoothstep(0.0, uDpr, min(g.x, g.y));
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / uRes;
  // Paper fibers run across the sheet; the grid is ruled in two weights.
  float fiber = noise(vec2(uv.x * 6.0, uv.y * 180.0)) * 0.6 + noise(uv * 40.0) * 0.4;
  vec3 col = uPaper * (0.95 + 0.07 * fiber);
  col = mix(col, uInk, rule(px, 24.0 * uDpr) * 0.05 + rule(px, 120.0 * uDpr) * 0.08);
  vec2 v = uv - 0.5;
  col *= 1.0 - 0.25 * dot(v, v);
  col += (hash(px + fract(uTime) * 61.0) - 0.5) * 0.012;
  outColor = vec4(col, 1.0);
}`;

// Each instance is a segment from a to b, width in pixels, and an alpha. A
// dot is a segment of no length.
const STROKE_VS = `#version 300 es
in vec2 a;
in vec2 b;
in float width;
in float alpha;
uniform vec2 uRes;
out vec2 vPos;
flat out vec2 vA;
flat out vec2 vB;
flat out float vHalf;
flat out float vAlpha;
void main() {
  vec2 corner = vec2(float(gl_VertexID & 1), float((gl_VertexID >> 1) & 1));
  vec2 d = b - a;
  float len = length(d);
  vec2 dir = len > 0.0001 ? d / len : vec2(1.0, 0.0);
  vec2 n = vec2(-dir.y, dir.x);
  float reach = width * 0.5 + 1.5;
  vec2 pos = mix(a, b, corner.x) + dir * (corner.x * 2.0 - 1.0) * reach + n * (corner.y * 2.0 - 1.0) * reach;
  vPos = pos; vA = a; vB = b; vHalf = width * 0.5; vAlpha = alpha;
  gl_Position = vec4(pos.x / uRes.x * 2.0 - 1.0, 1.0 - pos.y / uRes.y * 2.0, 0.0, 1.0);
}`;

const STROKE_FS = `#version 300 es
precision highp float;
uniform vec3 uInk;
in vec2 vPos;
flat in vec2 vA;
flat in vec2 vB;
flat in float vHalf;
flat in float vAlpha;
out vec4 outColor;
void main() {
  vec2 ab = vB - vA;
  float k = clamp(dot(vPos - vA, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);
  float d = length(vPos - vA - ab * k);
  float a = (1.0 - smoothstep(vHalf - 0.6, vHalf + 0.6, d)) * vAlpha;
  outColor = vec4(uInk * a, a);
}`;

const LABEL_VS = `#version 300 es
in vec2 at;
in vec2 size;
in vec4 uv;
in float alpha;
uniform vec2 uRes;
out vec2 vUv;
out float vAlpha;
void main() {
  vec2 corner = vec2(float(gl_VertexID & 1), float((gl_VertexID >> 1) & 1));
  vec2 pos = at + corner * size;
  vUv = uv.xy + corner * uv.zw;
  vAlpha = alpha;
  gl_Position = vec4(pos.x / uRes.x * 2.0 - 1.0, 1.0 - pos.y / uRes.y * 2.0, 0.0, 1.0);
}`;

const LABEL_FS = `#version 300 es
precision highp float;
uniform sampler2D uAtlas;
uniform vec3 uInk;
in vec2 vUv;
in float vAlpha;
out vec4 outColor;
void main() {
  float a = texture(uAtlas, vUv).a * vAlpha;
  outColor = vec4(uInk * a, a);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

function link(gl, vs, fs) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  return program;
}

const uniforms = (gl, program, names) => Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(program, n)]));

// A vertex array whose attributes advance once per instance, from one buffer.
function instanced(gl, program, layout) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const stride = layout.reduce((sum, [, size]) => sum + size, 0) * 4;
  let offset = 0;
  for (const [name, size] of layout) {
    const loc = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset);
    gl.vertexAttribDivisor(loc, 1);
    offset += size * 4;
  }
  gl.bindVertexArray(null);
  return { vao, buffer, floats: stride / 4 };
}

// Draws every label once into a texture; each label keeps its rectangle.
function buildAtlas(gl, labels, makeCanvas, font) {
  const scale = 2;
  const pad = 4;
  const atlas = makeCanvas();
  const ctx = atlas.getContext("2d");
  ctx.font = `${font.weight} ${font.size * scale}px ${font.family}`;
  const widths = labels.map((text) => Math.ceil(ctx.measureText(text).width) + pad * 2);
  const rowHeight = Math.ceil(font.size * scale * 1.5);
  atlas.width = Math.max(...widths);
  atlas.height = rowHeight * labels.length;
  ctx.font = `${font.weight} ${font.size * scale}px ${font.family}`;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  const rects = new Map();
  labels.forEach((text, i) => {
    ctx.fillText(text, pad, i * rowHeight + rowHeight / 2);
    rects.set(text, {
      uv: [0, (i * rowHeight) / atlas.height, widths[i] / atlas.width, rowHeight / atlas.height],
      size: [widths[i] / scale, rowHeight / scale],
    });
  });

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return { texture, rects };
}

export default class Plotter {
  // labels: every string the drawing may show. makeCanvas: () => a 2D canvas.
  constructor(canvas, { labels, makeCanvas, font = { weight: 500, size: 12, family: "ui-monospace, Menlo, monospace" } }) {
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, premultipliedAlpha: true });
    if (!gl) throw new Error("WebGL2 is not available");
    this.canvas = canvas;
    this.gl = gl;

    this.paper = link(gl, QUAD, PAPER);
    this.paperU = uniforms(gl, this.paper, ["uRes", "uTime", "uDpr", "uPaper", "uInk"]);
    this.quad = gl.createVertexArray();
    gl.bindVertexArray(this.quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const corner = gl.getAttribLocation(this.paper, "corner");
    gl.enableVertexAttribArray(corner);
    gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    this.stroke = link(gl, STROKE_VS, STROKE_FS);
    this.strokeU = uniforms(gl, this.stroke, ["uRes", "uInk"]);
    this.strokes = instanced(gl, this.stroke, [["a", 2], ["b", 2], ["width", 1], ["alpha", 1]]);

    this.label = link(gl, LABEL_VS, LABEL_FS);
    this.labelU = uniforms(gl, this.label, ["uRes", "uInk", "uAtlas"]);
    this.labels = instanced(gl, this.label, [["at", 2], ["size", 2], ["uv", 4], ["alpha", 1]]);
    this.atlas = buildAtlas(gl, labels, makeCanvas, font);
  }

  get size() {
    return { width: this.canvas.clientWidth, height: this.canvas.clientHeight };
  }

  // Everything in CSS pixels. segments: { ax, ay, bx, by, width, alpha };
  // dots: { x, y, radius, alpha }; labels: { text, x, y, alpha }.
  // labelScale: how large labels draw relative to the font they were built at.
  render({ time, dpr, paper, ink, segments, dots, labels, labelScale = 1 }) {
    const { canvas, gl } = this;
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);

    gl.disable(gl.BLEND);
    gl.useProgram(this.paper);
    gl.uniform2f(this.paperU.uRes, w, h);
    gl.uniform1f(this.paperU.uTime, time);
    gl.uniform1f(this.paperU.uDpr, dpr);
    gl.uniform3fv(this.paperU.uPaper, paper);
    gl.uniform3fv(this.paperU.uInk, ink);
    gl.bindVertexArray(this.quad);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const strokes = [];
    for (const s of segments) if (s.alpha > 0.01) strokes.push(s.ax * dpr, s.ay * dpr, s.bx * dpr, s.by * dpr, s.width * dpr, s.alpha);
    for (const d of dots) if (d.alpha > 0.01) strokes.push(d.x * dpr, d.y * dpr, d.x * dpr, d.y * dpr, d.radius * 2 * dpr, d.alpha);
    if (strokes.length) {
      gl.useProgram(this.stroke);
      gl.uniform2f(this.strokeU.uRes, w, h);
      gl.uniform3fv(this.strokeU.uInk, ink);
      gl.bindVertexArray(this.strokes.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.strokes.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(strokes), gl.DYNAMIC_DRAW);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, strokes.length / this.strokes.floats);
    }

    const glyphs = [];
    for (const l of labels) {
      const rect = this.atlas.rects.get(l.text);
      if (!rect || l.alpha <= 0.01) continue;
      const [w, h] = [rect.size[0] * labelScale, rect.size[1] * labelScale];
      glyphs.push(l.x * dpr, (l.y - h / 2) * dpr, w * dpr, h * dpr, ...rect.uv, l.alpha);
    }
    if (glyphs.length) {
      gl.useProgram(this.label);
      gl.uniform2f(this.labelU.uRes, w, h);
      gl.uniform3fv(this.labelU.uInk, ink);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.atlas.texture);
      gl.uniform1i(this.labelU.uAtlas, 0);
      gl.bindVertexArray(this.labels.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.labels.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(glyphs), gl.DYNAMIC_DRAW);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, glyphs.length / this.labels.floats);
    }
    gl.bindVertexArray(null);
  }
}
