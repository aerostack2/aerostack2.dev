// Hardware independent: a Jetson Orin NX developer kit, the kind of onboard
// computer Aerostack2 flies on. The carrier board stands on four feet with
// its ports along the front edge and the 40-pin header down the side; the
// compute module sits under a finned heatsink and fan. The pointer lifts the
// heatsink off, the module's SoC lights, and the fan spins up.

import {
  block,
  circ,
  type El,
  flat,
  frame,
  line,
  ringOn,
  rrect,
  type V,
  X,
  Y,
} from "./line-art";
import {
  type Figure,
  type FigureOptions,
  mount,
  reduced,
  spring,
  stepSpring,
} from "./stage";

/** How far the heatsink lifts, and how fast the fan turns at full speed. */
const LIFT = 30;
const REVS = 1.4;

const BOARD = { top: 7.6 };
/** The compute module's centre, and the heights it and the SoC sit at. */
const MOD = { x: -6, y: -6, z0: 11, z1: 12 };
const SOC = 13.6;

/** A ring drawn on a port's front face, the board's front edge at y = 41. */
const face = (x: number, z: number) => frame([x, 41.1, z], Y, X);

// The ports along the front edge, left to right: barrel jack, DisplayPort,
// two stacks of USB-A, Ethernet, USB-C. Each a block and the openings on its
// face.
const ports: { x: number; els: El[] }[] = [
  {
    x: -42,
    els: [
      ...block(-42, 35, BOARD.top, 17, rrect(-4.5, -6, 4.5, 6, 1)),
      ringOn(face(-42, 12.3), circ(2.6, 24)),
      ringOn(face(-42, 12.3), circ(0.9, 12), "lo"),
    ],
  },
  {
    x: -30,
    els: [
      ...block(-30, 35, BOARD.top, 13.5, rrect(-5.5, -6, 5.5, 6, 0.8)),
      ringOn(face(-30, 10.6), rrect(-4, -1.6, 4, 1.6, 0.6)),
    ],
  },
  ...[-14, 3].map((x) => ({
    x,
    els: [
      ...block(x, 34, BOARD.top, 23, rrect(-7, -7, 7, 7, 0.8)),
      ringOn(face(x, 12), rrect(-5.5, -1.4, 5.5, 1.4, 0.4)),
      ringOn(face(x, 19), rrect(-5.5, -1.4, 5.5, 1.4, 0.4)),
    ],
  })),
  {
    x: 22,
    els: [
      ...block(22, 33, BOARD.top, 21, rrect(-8, -8, 8, 8, 1)),
      ringOn(face(22, 14), rrect(-5, -4, 5, 4, 0.6)),
      ringOn(face(22, 18.6), rrect(-1.8, -0.8, 1.8, 0.8, 0.3), "lo"),
    ],
  },
  {
    x: 38,
    els: [
      ...block(38, 37, BOARD.top, 11, rrect(-4.5, -4, 4.5, 4, 1.5)),
      ringOn(face(38, 9.3), rrect(-3.2, -1, 3.2, 1, 1)),
    ],
  },
];

// The 40-pin header down the right edge: a base and two rows of pins.
const header: El[] = [
  ...block(44, 0, BOARD.top, 10, rrect(-2.6, -26, 2.6, 26, 0.5), {
    bevel: 0.6,
  }),
  ...[-1.27, 1.27].flatMap((dx) =>
    Array.from({ length: 20 }, (_, k) => {
      const y = -24.1 + k * 2.54;
      return line(
        [
          [44 + dx, y, 10],
          [44 + dx, y, 15],
        ],
        "pin",
      );
    }),
  ),
];

// The carrier board on its four feet.
const carrier: El[] = [
  ...[
    [-45, -35],
    [45, -35],
    [-45, 35],
    [45, 35],
  ].flatMap(([x, y]) => block(x, y, 0, 6.2, circ(2.6, 20), { bevel: 0.6 })),
  ...block(0, 0, 6, BOARD.top, rrect(-50, -40, 50, 40, 3)),
];

// The module: its connector along the near edge, two posts at the far one,
// the board, and on it the SoC, two memory chips and a power chip.
const module = (lit: boolean): El[] => {
  const { x, y, z0, z1 } = MOD;
  return [
    ...[-30, 30].flatMap((dx) =>
      block(x + dx, y - 19, BOARD.top, z0, circ(1.6, 12), { bevel: 0.4 }),
    ),
    ...block(x, y + 20, BOARD.top, z0, rrect(-33, -2.5, 33, 2.5, 0.8), {
      bevel: 0.6,
    }),
    ...block(x, y, z0, z1, rrect(-35, -22.5, 35, 22.5, 1.5)),
    ...block(x - 22, y - 8, z1, z1 + 1.2, rrect(-5, -6, 5, 6, 0.6), {
      bevel: 0.6,
    }),
    ...block(x - 22, y + 8, z1, z1 + 1.2, rrect(-5, -6, 5, 6, 0.6), {
      bevel: 0.6,
    }),
    ...block(x + 22, y - 12, z1, z1 + 1, rrect(-3.5, -3.5, 3.5, 3.5, 0.5), {
      bevel: 0.5,
    }),
    ...block(x + 6, y, z1, SOC, rrect(-10, -10, 10, 10, 1), {
      cls: lit ? "hi" : "",
    }),
  ];
};

/** The heatsink, lifted by `lift`, with its fan turned to `spin` radians. */
function heatsink(lift: number, spin: number): El[] {
  const { x, y } = MOD;
  const z0 = SOC + lift;
  const z1 = z0 + 11;
  const fins = Array.from({ length: 14 }, (_, k) => -19.5 + k * 3);
  const els: El[] = [
    ...block(x, y, z0, z1, rrect(-34, -22, 34, 22, 2)),
    // The fin edges on the near side, and the fins seen from above.
    ...fins.map((fy) =>
      line(
        [
          [x + 34.1, y + fy, z0 + 1.5],
          [x + 34.1, y + fy, z1 - 0.6],
        ],
        "crease",
      ),
    ),
    ...fins.map((fy) =>
      line(
        [
          [x - 32, y + fy, z1],
          [x + 32, y + fy, z1],
        ],
        "lo",
      ),
    ),
    // The fan on top: its frame, the opening, seven blades and the hub.
    ...block(x, y, z1, z1 + 6, rrect(-21, -21, 21, 21, 3)),
    flat(x, y, z1 + 6, circ(18, 48), "crease"),
  ];
  for (let k = 0; k < 7; k++) {
    const pts: V[] = Array.from({ length: 6 }, (_, i) => {
      const r = 7 + (i / 5) * 10;
      const a = spin + (k / 7) * Math.PI * 2 + 0.06 * (r - 7);
      return [x + r * Math.cos(a), y + r * Math.sin(a), z1 + 6];
    });
    els.push(line(pts, "crease"));
  }
  els.push(flat(x, y, z1 + 6.2, circ(6.5, 32), "sil"));
  return els;
}

/** Dashed guides from the heatsink's near corners down to the module. */
function guides(lift: number): El[] {
  if (lift < 2) return [];
  const { x, y } = MOD;
  return [
    [x + 34, y + 22],
    [x - 34, y + 22],
    [x + 34, y - 22],
  ].map(([gx, gy]) =>
    line(
      [
        [gx, gy, MOD.z1],
        [gx, gy, SOC + lift],
      ],
      "lo dash",
    ),
  );
}

const draw = (lift: number, spin: number): El[] => [
  ...carrier,
  ...module(lift > LIFT / 4),
  ...guides(lift),
  ...heatsink(lift, spin),
  ...header,
  ...ports.sort((a, b) => a.x - b.x).flatMap((p) => p.els),
];

export function jetson(el: HTMLElement, options?: FigureOptions): Figure {
  const lift = spring(0, 60, 13);
  const speed = spring(0, 5, 4.5);
  let spin = 0;

  return mount(
    el,
    {
      label:
        "A Jetson Orin NX developer kit. The pointer lifts the heatsink off its compute module and spins up the fan.",
      extent: [...draw(0, 0), ...draw(LIFT, 0)],
      draw: () => draw(lift.x, spin),
      point(p) {
        lift.t = p ? LIFT : 0;
        speed.t = p ? 1 : 0;
      },
      step(dt) {
        const lifting = stepSpring(lift, dt);
        // Under reduced motion the heatsink still lifts, but the fan rests.
        if (reduced()) return lifting;
        const turning = stepSpring(speed, dt, 0.002) || speed.x > 0;
        spin += speed.x * REVS * Math.PI * 2 * dt;
        return lifting || turning;
      },
    },
    options,
  );
}
