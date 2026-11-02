// Mounts one of our line figures the way Hairline mounts its own: the same
// call shape, `figure(el, { label })` giving back `{ destroy }`, so the home
// page can mix both. A figure rests still and only redraws while something in
// it is moving, after the pointer arrives or leaves.

import { type El, markup, type P, viewBox } from "./line-art";

export type FigureOptions = { label?: string };
export type Figure = { destroy(): void };

/** What a figure gives the stage. */
export type Scene = {
  label: string;
  /** Every pose worth fitting in the frame: at rest, and fully answered. */
  extent: El[];
  /** The drawing as it stands now. */
  draw(): El[];
  /** Advances by `dt` seconds; true while anything still moves. */
  step(dt: number): boolean;
  /** The pointer in drawing units, or null once it has left. */
  point(p: P | null): void;
};

export const reduced = () =>
  typeof matchMedia === "function" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A damped spring towards `t`. */
export type Spring = { x: number; v: number; t: number; k: number; c: number };
export const spring = (x: number, k = 70, c = 15): Spring => ({
  x,
  v: 0,
  t: x,
  k,
  c,
});

/** Steps a spring; false once it has settled on its target. */
export function stepSpring(s: Spring, dt: number, eps = 0.01): boolean {
  if (reduced()) {
    s.x = s.t;
    s.v = 0;
    return false;
  }
  const n = Math.max(1, Math.ceil(dt * 240));
  const h = dt / n;
  for (let i = 0; i < n; i++) {
    s.v += (s.k * (s.t - s.x) - s.c * s.v) * h;
    s.x += s.v * h;
  }
  if (Math.abs(s.t - s.x) < eps && Math.abs(s.v) < eps * 4) {
    s.x = s.t;
    s.v = 0;
    return false;
  }
  return true;
}

export function mount(
  el: HTMLElement,
  scene: Scene,
  options: FigureOptions = {},
): Figure {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", viewBox(scene.extent));
  svg.setAttribute("aria-hidden", "true");
  const g = document.createElementNS(ns, "g");
  svg.appendChild(g);
  el.appendChild(svg);
  el.setAttribute("data-line-art", "");
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", options.label ?? scene.label);

  const paint = () => {
    g.innerHTML = markup(scene.draw());
  };
  paint();

  let raf = 0;
  let last = 0;
  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    const moving = scene.step(dt);
    paint();
    raf = moving ? requestAnimationFrame(frame) : 0;
  };
  const wake = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  // Pointer positions in drawing units, through the svg's own transform.
  const toDrawing = (e: PointerEvent): P | null => {
    const m = svg.getScreenCTM();
    if (!m) return null;
    const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [q.x, q.y];
  };
  let leaving = 0;
  const move = (e: PointerEvent) => {
    clearTimeout(leaving);
    scene.point(toDrawing(e));
    wake();
  };
  // A touch has no hover, so a tap holds the answer for a moment.
  const leave = (e: PointerEvent) => {
    clearTimeout(leaving);
    leaving = window.setTimeout(
      () => {
        scene.point(null);
        wake();
      },
      e.pointerType === "mouse" ? 0 : 1400,
    );
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerdown", move);
  el.addEventListener("pointerleave", leave);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      clearTimeout(leaving);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", move);
      el.removeEventListener("pointerleave", leave);
      svg.remove();
      for (const a of ["data-line-art", "role", "aria-label"])
        el.removeAttribute(a);
    },
  };
}
