import { cn } from "@/lib/cn";

// Control modes from the highest level to the lowest, in the order of the
// mode codes in the control modes files. A controller's output is never
// higher than its input.
const MODES = [
  { id: "trajectory", label: "Trajectory" },
  { id: "position", label: "Position" },
  { id: "speed_in_a_plane", label: "Speed in a plane" },
  { id: "speed", label: "Speed" },
  { id: "attitude", label: "Attitude" },
  { id: "body_rates", label: "Body rates" },
] as const;

type Mode = (typeof MODES)[number]["id"];

interface Plugin {
  name: string;
  inputs: Mode[];
  outputs: Mode[];
}

// From plugins/<plugin>/config/available_modes.yaml in as2_motion_controller.
const PLUGINS: Plugin[] = [
  {
    name: "PID speed",
    inputs: ["trajectory", "position", "speed_in_a_plane", "speed"],
    outputs: ["speed"],
  },
  {
    name: "Differential flatness",
    inputs: ["trajectory"],
    outputs: ["body_rates"],
  },
  {
    name: "Geometric",
    inputs: ["trajectory", "position", "speed"],
    outputs: ["speed", "body_rates"],
  },
];

const ROW = "h-10";

function Tag({ kind }: { kind: "in" | "out" }) {
  return (
    <span
      className={cn(
        "relative z-10 rounded-full border px-1.5 text-[10.5px] leading-4 font-medium",
        kind === "in"
          ? "border-fd-primary/50 bg-fd-card text-fd-primary"
          : "border-fd-primary bg-fd-primary text-fd-primary-foreground",
      )}
    >
      {kind}
    </span>
  );
}

function PluginCell({ plugin, row }: { plugin: Plugin; row: number }) {
  const mode = MODES[row].id;
  const marked = MODES.map(
    (m) => plugin.inputs.includes(m.id) || plugin.outputs.includes(m.id),
  );
  const first = marked.indexOf(true);
  const last = marked.lastIndexOf(true);
  const isIn = plugin.inputs.includes(mode);
  const isOut = plugin.outputs.includes(mode);

  const used = isIn || isOut;

  return (
    <div
      className={cn(
        "relative grid grid-cols-[1fr_auto_1fr] items-center border-t border-fd-border",
        ROW,
      )}
    >
      {/* The spine, from the highest input down to the lowest output. */}
      {row > first && row <= last && (
        <span className="absolute top-0 left-1/2 h-1/2 w-px -translate-x-1/2 bg-fd-primary/40" />
      )}
      {row >= first && row < last && (
        <span className="absolute bottom-0 left-1/2 h-1/2 w-px -translate-x-1/2 bg-fd-primary/40" />
      )}
      <span className="flex justify-end pe-2">{isIn && <Tag kind="in" />}</span>
      <span
        className={cn(
          "relative z-10 size-2 rounded-full",
          !used && "invisible",
          isOut ? "bg-fd-primary" : "border border-fd-primary bg-fd-card",
        )}
      />
      <span className="flex justify-start ps-2">
        {isOut && <Tag kind="out" />}
      </span>
    </div>
  );
}

/** Which control modes each controller plugin takes in and puts out. */
export function ControlModeLadder() {
  return (
    <figure className="not-prose my-6">
      <div className="overflow-x-auto rounded-xl border border-fd-border bg-fd-card">
        <div
          className="grid min-w-[30rem]"
          style={{
            gridTemplateColumns: `minmax(8rem, 1fr) repeat(${PLUGINS.length}, minmax(6rem, 1fr))`,
          }}
        >
          <div className="flex items-end px-4 py-2.5 text-xs font-medium text-fd-muted-foreground">
            Control mode
          </div>
          {PLUGINS.map((plugin) => (
            <div
              key={plugin.name}
              className="flex items-end justify-center px-2 py-2.5 text-center text-xs font-medium text-fd-foreground"
            >
              {plugin.name}
            </div>
          ))}

          {MODES.map((mode, row) => (
            <div key={mode.id} className="contents">
              <div
                className={cn(
                  "flex items-center gap-2 border-t border-fd-border px-4 text-sm text-fd-foreground",
                  ROW,
                )}
              >
                {mode.label}
              </div>
              {PLUGINS.map((plugin) => (
                <PluginCell key={plugin.name} plugin={plugin} row={row} />
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-fd-border bg-fd-background/60 px-4 py-2.5 text-xs text-fd-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Tag kind="in" /> accepted from behaviors
          </span>
          <span className="flex items-center gap-1.5">
            <Tag kind="out" /> sent to the platform
          </span>
          <span>Higher modes at the top. Yaw modes left out.</span>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-fd-muted-foreground">
        The modes each plugin works with. A plugin always turns a reference into
        a command of the same level or lower.
      </figcaption>
    </figure>
  );
}
