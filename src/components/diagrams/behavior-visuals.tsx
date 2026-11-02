// The behavior lifecycle from as2_behavior's BehaviorServer and the states
// in as2_msgs/msg/BehaviorStatus. Drawn as a fixed SVG so every arrow and
// label sits exactly where it should.

const ARROW = "behavior-lifecycle-arrow";

const STATES = [
  { x: 20, name: "Idle", constant: "IDLE", active: false },
  { x: 280, name: "Running", constant: "RUNNING", active: true },
  { x: 540, name: "Paused", constant: "PAUSED", active: false },
];

const W = 160;
const TOP = 84;
const H = 56;

const line = {
  fill: "none",
  stroke: "var(--color-fd-muted-foreground)",
  strokeWidth: 1.5,
  markerEnd: `url(#${ARROW})`,
} as const;

function Label({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      className="font-mono"
      fontSize={12}
      fill="var(--color-fd-foreground)"
    >
      {children}
    </text>
  );
}

/** The states of a behavior and the requests that move it between them. */
export function BehaviorLifecycle() {
  return (
    <figure className="not-prose my-6">
      <div className="overflow-x-auto rounded-xl border border-fd-border bg-fd-card px-4 py-3">
        <svg
          viewBox="0 0 720 220"
          className="mx-auto block w-full min-w-[34rem] max-w-3xl"
          role="img"
          aria-label="A behavior starts idle. Start moves it to running, and stop moves it back. Pause moves a running behavior to paused, and resume moves it back. Modify changes the goal while it runs. When the behavior succeeds or fails, it returns to idle."
        >
          <defs>
            <marker
              id={ARROW}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path
                d="M0 0 L10 5 L0 10 z"
                fill="var(--color-fd-muted-foreground)"
              />
            </marker>
          </defs>

          {/* start and stop, between idle and running */}
          <path d="M180 102 H276" {...line} />
          <Label x={230} y={95}>
            start
          </Label>
          <path d="M280 122 H184" {...line} />
          <Label x={230} y={139}>
            stop
          </Label>

          {/* pause and resume, between running and paused */}
          <path d="M440 102 H536" {...line} />
          <Label x={490} y={95}>
            pause
          </Label>
          <path d="M540 122 H444" {...line} />
          <Label x={490} y={139}>
            resume
          </Label>

          {/* modify, a loop on running */}
          <path d="M342 84 C 334 36, 386 36, 378 80" {...line} />
          <Label x={360} y={30}>
            modify
          </Label>

          {/* the behavior ends on its own */}
          <path
            d="M360 140 V176 Q360 188 348 188 H112 Q100 188 100 176 V144"
            {...line}
          />
          <Label x={230} y={206}>
            succeeds or fails
          </Label>

          {STATES.map((state) => (
            <g key={state.name}>
              <rect
                x={state.x}
                y={TOP}
                width={W}
                height={H}
                rx={12}
                fill={
                  state.active
                    ? "color-mix(in oklab, var(--color-fd-primary) 10%, var(--color-fd-card))"
                    : "var(--color-fd-card)"
                }
                stroke={
                  state.active
                    ? "var(--color-fd-primary)"
                    : "var(--color-fd-border)"
                }
                strokeWidth={1.5}
              />
              <text
                x={state.x + W / 2}
                y={TOP + 25}
                textAnchor="middle"
                fontSize={14}
                fontWeight={500}
                fill="var(--color-fd-foreground)"
              >
                {state.name}
              </text>
              <text
                x={state.x + W / 2}
                y={TOP + 42}
                textAnchor="middle"
                className="font-mono"
                fontSize={10.5}
                fill="var(--color-fd-muted-foreground)"
              >
                {state.constant}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm text-fd-muted-foreground">
        The life of a behavior. A paused behavior can also be stopped.
      </figcaption>
    </figure>
  );
}
