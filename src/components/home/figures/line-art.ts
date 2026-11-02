// Hairline's drawing method (github.com/lucasmarkes/hairline, MIT, © Lucas
// Marques), ported for our own figures: an orthographic 2:1 camera, rounded
// solids whose outline is the hull of their two end rings, one dim crease on
// the face towards the viewer, flat fills painted back to front. A solid can
// lie along any axis, not only stand upright. The same port draws the figures
// in the Rewire slides.

export type V = [number, number, number];
export type P = [number, number];
/** A point on a rounded outline in a solid's own plane, with its outward normal. */
export type Sample = { u: number; v: number; nu: number; nv: number };
export type El = { d: string; cls: string };

export const rad = (d: number) => (d * Math.PI) / 180;
export const add = (...vs: V[]): V =>
  vs.reduce((a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]);
export const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V, b: V): V => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const unit = (a: V) => mul(a, 1 / Math.hypot(...a));

export const X: V = [1, 0, 0];
export const Y: V = [0, 1, 0];
export const Z: V = [0, 0, 1];

// The camera every hairline figure rests at: ground turned 45°, 2:1 squash.
const AZ = rad(45);
const K = 0.5;
const ZF = Math.sqrt(1 - K * K);
const [S, C] = [Math.sin(AZ), Math.cos(AZ)];
export const proj = ([x, y, z]: V): P => [
  x * C - y * S,
  (x * S + y * C) * K - z * ZF,
];
/** The ground point at height `z` that projects to the screen point `p`. */
export const unproj = ([sx, sy]: P, z: number): V => {
  const yy = (sy + z * ZF) / K;
  return [sx * C + yy * S, -sx * S + yy * C, z];
};
/** Towards the viewer: a surface faces the camera when its normal points this way. */
export const VIEW: V = [ZF * S, ZF * C, K];
/** How near a point sits to the viewer, for painting back to front. */
export const depth = (p: V) => dot(p, VIEW);

const r2 = (n: number) => Math.round(n * 100) / 100;
const poly = (pts: P[]) =>
  `M${pts.map((p) => `${r2(p[0])} ${r2(p[1])}`).join("L")}Z`;
const open = (pts: P[]) =>
  pts.length < 2
    ? ""
    : `M${pts.map((p) => `${r2(p[0])} ${r2(p[1])}`).join("L")}`;

/** A rounded rectangle, sampled, `n` samples per corner. */
export function rrect(
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  r: number,
  n = 6,
): Sample[] {
  const rr = Math.max(0, Math.min(r, (u1 - u0) / 2, (v1 - v0) / 2));
  const out: Sample[] = [];
  const corners: [number, number, number][] = [
    [u1 - rr, v1 - rr, 0],
    [u0 + rr, v1 - rr, 90],
    [u0 + rr, v0 + rr, 180],
    [u1 - rr, v0 + rr, 270],
  ];
  for (const [cu, cv, a0] of corners)
    for (let k = 0; k <= n; k++) {
      const a = rad(a0 + (90 * k) / n);
      out.push({
        u: cu + rr * Math.cos(a),
        v: cv + rr * Math.sin(a),
        nu: Math.cos(a),
        nv: Math.sin(a),
      });
    }
  return out;
}

/** A circle of radius R, sampled. */
export const circ = (R: number, n = 48): Sample[] =>
  Array.from({ length: n }, (_, k) => {
    const a = (k / n) * Math.PI * 2;
    return {
      u: R * Math.cos(a),
      v: R * Math.sin(a),
      nu: Math.cos(a),
      nv: Math.sin(a),
    };
  });

/** Convex hull (monotone chain). */
function hull(input: P[]): P[] {
  const pts = [...input].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const x = (o: P, a: P, b: P) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: P[] = [];
  const up: P[] = [];
  for (const p of pts) {
    while (lo.length > 1 && x(lo[lo.length - 2], lo[lo.length - 1], p) <= 0)
      lo.pop();
    lo.push(p);
  }
  for (const p of pts.reverse()) {
    while (up.length > 1 && x(up[up.length - 2], up[up.length - 1], p) <= 0)
      up.pop();
    up.push(p);
  }
  lo.pop();
  up.pop();
  return lo.concat(up);
}

/** The one cyclic run of samples that pass `keep`, in ring order. */
function run<T>(ring: T[], keep: (q: T) => boolean): T[] {
  const n = ring.length;
  const s = ring.findIndex((q, i) => keep(q) && !keep(ring[(i + n - 1) % n]));
  if (s < 0) return keep(ring[0]) ? [...ring, ring[0]] : [];
  const out: T[] = [];
  for (let k = 0; k < n && keep(ring[(s + k) % n]); k++)
    out.push(ring[(s + k) % n]);
  return out;
}

/** A plane through `o`: `e1` is the ring's u, the v axis follows from the normal. */
export type Frame = { o: V; e1: V; e2: V };
export const frame = (o: V, normal: V, e1: V): Frame => {
  const n = unit(normal);
  const u = unit(sub(e1, mul(n, dot(n, e1))));
  return { o, e1: u, e2: cross(n, u) };
};
const at = (f: Frame, q: Sample, k = 1): V =>
  add(f.o, mul(f.e1, q.u * k), mul(f.e2, q.v * k));

/**
 * A solid from `a` to `b` with the cross-section `ring` (scaled by `taper` at
 * `b`). Its outline is the hull of the two end rings, so no side edge is ever
 * drawn; its one inner line is the crease, the near run of a ring inset by
 * `bevel` on whichever end faces the viewer.
 */
export function solid(
  a: V,
  b: V,
  ring: Sample[],
  e1: V,
  opts: { taper?: number; bevel?: number; cls?: string } = {},
): El[] {
  const { taper = 1, bevel = 1.2, cls = "" } = opts;
  const axis = sub(b, a);
  const [fa, fb] = [frame(a, axis, e1), frame(b, axis, e1)];
  const outline = hull([
    ...ring.map((q) => proj(at(fa, q))),
    ...ring.map((q) => proj(at(fb, q, taper))),
  ]);
  const [cap, k] = dot(axis, VIEW) > 0 ? [fb, taper] : [fa, 1];
  const facing = (q: Sample) =>
    dot(add(mul(cap.e1, q.nu), mul(cap.e2, q.nv)), VIEW) >= -1e-6;
  const inset = ring.map((q) => ({
    ...q,
    u: q.u - (q.nu * bevel) / k,
    v: q.v - (q.nv * bevel) / k,
  }));
  return [
    { d: poly(outline), cls: `sil ${cls}` },
    {
      d: open(run(inset, facing).map((q) => proj(at(cap, q, k)))),
      cls: `crease ${cls}`,
    },
  ];
}

/** An upright block standing on `z0`, `ring` drawn in x/y about (x, y). */
export const block = (
  x: number,
  y: number,
  z0: number,
  z1: number,
  ring: Sample[],
  opts?: { taper?: number; bevel?: number; cls?: string },
) => solid([x, y, z0], [x, y, z1], ring, X, opts);

/** A whole ring drawn flat on a plane: a lens, a hub, a seam. */
export const ringOn = (f: Frame, ring: Sample[], cls = "crease"): El => ({
  d: poly(ring.map((q) => proj(at(f, q)))),
  cls,
});
/** A flat ring lying on the ground plane at height `z`, about (x, y). */
export const flat = (
  x: number,
  y: number,
  z: number,
  ring: Sample[],
  cls = "crease",
  turn = 0,
): El =>
  ringOn(frame([x, y, z], Z, [Math.cos(turn), Math.sin(turn), 0]), ring, cls);
/** A line through world points. */
export const line = (pts: V[], cls = "crease"): El => ({
  d: open(pts.map(proj)),
  cls,
});

/** The elements as SVG markup. */
export const markup = (els: El[]): string =>
  els.map((e) => `<path d="${e.d}" class="${e.cls}"/>`).join("");

/** The box [x0, y0, x1, y1] that holds every element. */
export function bounds(els: El[]): [number, number, number, number] {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const e of els)
    for (const m of e.d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)) {
      xs.push(Number(m[1]));
      ys.push(Number(m[2]));
    }
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

/**
 * A 5:4 viewBox, the shape of the box the figures sit in, that holds every
 * element with the drawing filling `fill` of it, centred.
 */
export function viewBox(els: El[], fill = 0.8): string {
  const [x0, y0, x1, y1] = bounds(els);
  const w = Math.max((x1 - x0) / fill, ((y1 - y0) / fill) * 1.25);
  const h = w / 1.25;
  return [(x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - h / 2, w, h].map(r2).join(" ");
}

/** A rod that thins from r0 to r1, its ends rounded: the hull of two discs. */
export function rod(a: V, b: V, r0: number, r1: number, cls = ""): El {
  const disc = (c: P, r: number) =>
    Array.from(
      { length: 24 },
      (_, k): P => [
        c[0] + r * Math.cos((k * Math.PI) / 12),
        c[1] + r * Math.sin((k * Math.PI) / 12),
      ],
    );
  return {
    d: poly(hull([...disc(proj(a), r0), ...disc(proj(b), r1)])),
    cls: `sil ${cls}`,
  };
}

/**
 * The SVG transform that lays flat 2D drawing on the ground plane through
 * `o`: draw in plain x/y about the origin and it lands in the view. Anything
 * turning in that plane, like a prop, can then spin with a plain CSS rotate.
 */
export const planeMatrix = (o: V) => {
  const [e, f] = proj(o);
  return `matrix(${[C, S * K, -S, C * K, e, f].map((n) => Math.round(n * 1e4) / 1e4).join(" ")})`;
};
