// Single robot or swarm: a nano quadrotor hovers alone over the floor while
// four more wait on their pads in front. The pointer brings the swarm up: the
// four take off, fly into formation round the first, and link to it, and the
// whole formation leans after the pointer. When it leaves they fly back to
// their pads and land.

import {
  add,
  block,
  circ,
  depth,
  type El,
  flat,
  line,
  type P,
  rrect,
  solid,
  unproj,
  type V,
  Z,
} from "./line-art";
import {
  type Figure,
  type FigureOptions,
  mount,
  spring,
  stepSpring,
} from "./stage";

/** Flying height, how far the leader leans after the pointer, rotor reach. */
const H = 46;
const LEAN = 16;
const ARM = 20;
const PROP = 10;

// Places on the floor in screen terms: `across` runs left to right on the
// screen, `toward` comes down it towards the viewer.
const at = (across: number, toward: number): [number, number] => [
  across + toward,
  toward - across,
];

// Each wingman's place in the formation, about the leader, and its pad: the
// same place on the floor, further forward. Taking off is a climb and a
// straight run back into place, so no path crosses another. The back pair
// leaves first.
const GROUND = 64;
const WINGS = [
  { slot: at(-40, -28), delay: 0 },
  { slot: at(40, -28), delay: 0 },
  { slot: at(-40, 28), delay: 0.15 },
  { slot: at(40, 28), delay: 0.15 },
].map((w) => {
  const ahead = at(0, GROUND);
  return { ...w, pad: [w.slot[0] + ahead[0], w.slot[1] + ahead[1]] as const };
});

/** One nano quadrotor with its base at `o`, props a blur when `flying`. */
function quad(o: V, flying: boolean, lead: boolean): El[] {
  const [x, y, z] = o;
  const motors: [number, number][] = [
    [ARM, 0],
    [0, ARM],
    [-ARM, 0],
    [0, -ARM],
  ];
  // The frame: two flat bars crossing under the board.
  const bar = rrect(-0.7, -1.6, 0.7, 1.6, 0.6);
  const arms = [
    ...solid([x - ARM, y, z + 5.5], [x + ARM, y, z + 5.5], bar, Z),
    ...solid([x, y - ARM, z + 5.5], [x, y + ARM, z + 5.5], bar, Z),
  ];
  const parts: { at: V; els: El[] }[] = motors.map(([dx, dy]) => ({
    at: [x + dx, y + dy, z],
    els: [
      ...block(x + dx, y + dy, z, z + 7.5, circ(3.2, 24), { bevel: 0.8 }),
      ...block(x + dx, y + dy, z + 7.5, z + 8.8, circ(1.8, 16), {
        bevel: 0.5,
      }),
    ],
  }));
  // The board, and the battery on it. The leader is the one lit.
  const cls = lead ? "hi" : "";
  parts.push({
    at: [x, y, z],
    els: [
      ...block(x, y, z + 4.8, z + 6.4, rrect(-8, -8, 8, 8, 2.5), { cls }),
      ...block(x, y, z + 6.4, z + 9, rrect(-5.5, -3.2, 5.5, 3.2, 1), {
        bevel: 0.8,
        cls,
      }),
    ],
  });
  parts.sort((a, b) => depth(a.at) - depth(b.at));

  // Props on top of everything: a blur when flying, two blades when parked.
  const props = motors
    .map(([dx, dy], k): { at: V; els: El[] } => {
      const [px, py, pz] = [x + dx, y + dy, z + 9.2];
      return {
        at: [px, py, pz],
        els: [
          flying
            ? flat(px, py, pz, circ(PROP, 32), "sil disc")
            : flat(
                px,
                py,
                pz,
                rrect(-PROP, -1.3, PROP, 1.3, 1.3, 4),
                "sil",
                0.5 + k * 0.8,
              ),
          flat(px, py, pz + 0.1, circ(1.4, 12), "crease"),
        ],
      };
    })
    .sort((a, b) => depth(a.at) - depth(b.at));

  return [
    ...arms,
    ...parts.flatMap((p) => p.els),
    ...props.flatMap((p) => p.els),
  ];
}

type Pose = { lead: V; wings: V[] };

function draw({ lead, wings }: Pose): El[] {
  // The floor: the pads, and a shadow under whatever is in the air.
  const floor: El[] = WINGS.flatMap(({ pad: [x, y] }) => [
    flat(x, y, 0, rrect(-17, -17, 17, 17, 3), "lo"),
    flat(x, y, 0, rrect(-11, -11, 11, 11, 1.5), "lo dash"),
  ]);
  for (const [x, y, z] of [lead, ...wings])
    if (z > 2) floor.push(flat(x, y, 0, circ(14, 32), "lo"));
  // A link from the leader to each wingman that has reached its height.
  const links = wings
    .filter((w) => w[2] > H * 0.85)
    .map((w) => line([add(lead, [0, 0, 6]), add(w, [0, 0, 6])], "nf hi dash"));
  const quads = [
    { o: lead, lead: true },
    ...wings.map((o) => ({ o, lead: false })),
  ].sort((a, b) => depth(a.o) - depth(b.o));
  return [
    ...floor,
    ...links,
    ...quads.flatMap((q) => quad(q.o, q.lead || q.o[2] > 1, q.lead)),
  ];
}

const rest: Pose = {
  lead: [0, 0, H],
  wings: WINGS.map(({ pad }) => [pad[0], pad[1], 0]),
};
const formed = (lx: number, ly: number): Pose => ({
  lead: [lx, ly, H],
  wings: WINGS.map(({ slot }) => [lx + slot[0], ly + slot[1], H]),
});

export function swarm(el: HTMLElement, options?: FigureOptions): Figure {
  const lead = { x: spring(0, 30, 11), y: spring(0, 30, 11) };
  const wings = WINGS.map((w) => ({
    ...w,
    x: spring(w.pad[0], 26, 10),
    y: spring(w.pad[1], 26, 10),
    z: spring(0, 40, 12.6),
  }));
  let active = false;
  let since = 0;

  const pose = (): Pose => ({
    lead: [lead.x.x, lead.y.x, H],
    wings: wings.map((w) => [w.x.x, w.y.x, w.z.x]),
  });

  return mount(
    el,
    {
      label:
        "A nano quadrotor hovering alone while four more wait on their pads. The pointer brings them up into formation round it.",
      extent: [
        ...draw(rest),
        ...Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2;
          return draw(formed(LEAN * Math.cos(a), LEAN * Math.sin(a)));
        }).flat(),
      ],
      draw: () => draw(pose()),
      point(p: P | null) {
        if ((p !== null) !== active) since = 0;
        active = p !== null;
        // The leader leans towards the pointer, held within LEAN of home.
        const [gx, gy] = p ? unproj(p, H) : [0, 0];
        const r = Math.hypot(gx, gy);
        const k = r > LEAN ? LEAN / r : 1;
        lead.x.t = gx * k;
        lead.y.t = gy * k;
      },
      step(dt: number) {
        since += dt;
        let moving = stepSpring(lead.x, dt);
        moving = stepSpring(lead.y, dt) || moving;
        for (const w of wings) {
          const [px, py] = w.pad;
          if (active) {
            // Up first, then over to its place by the leader.
            if (since < w.delay) moving = true;
            else w.z.t = H;
            const up = w.z.x > H / 2;
            w.x.t = up ? lead.x.x + w.slot[0] : px;
            w.y.t = up ? lead.y.x + w.slot[1] : py;
          } else {
            // Back over its pad first, then down.
            w.x.t = px;
            w.y.t = py;
            w.z.t = Math.hypot(w.x.x - px, w.y.x - py) < 3 ? 0 : H;
          }
          const sx = stepSpring(w.x, dt);
          const sy = stepSpring(w.y, dt);
          const sz = stepSpring(w.z, dt);
          moving = sx || sy || sz || moving;
        }
        return moving;
      },
    },
    options,
  );
}
