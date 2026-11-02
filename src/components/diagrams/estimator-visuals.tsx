import { cn } from "@/lib/cn";

type Kind = "estimated" | "fixed" | "identity";

interface Cell {
  kind: Kind;
  note: string;
}

interface Row {
  plugin: string;
  cells: [Cell, Cell, Cell];
}

const TRANSFORMS = ["earth → map", "map → odom", "odom → base_link"];

// From the plugin READMEs in as2_state_estimator/plugins.
const ROWS: Row[] = [
  {
    plugin: "ground_truth",
    cells: [
      { kind: "fixed", note: "First pose" },
      { kind: "identity", note: "Identity" },
      { kind: "estimated", note: "The whole pose" },
    ],
  },
  {
    plugin: "raw_odometry",
    cells: [
      { kind: "fixed", note: "Identity or first GPS fix" },
      { kind: "identity", note: "Identity" },
      { kind: "estimated", note: "The platform's odometry" },
    ],
  },
  {
    plugin: "simple_ekf",
    cells: [
      { kind: "fixed", note: "First pose of a source" },
      { kind: "estimated", note: "Absolute corrections" },
      { kind: "estimated", note: "IMU and drifting sources" },
    ],
  },
];

function Pill({ cell }: { cell: Cell }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs",
        cell.kind === "estimated" && "bg-fd-primary/10 text-fd-primary",
        cell.kind === "fixed" &&
          "border border-fd-border bg-fd-background text-fd-foreground",
        cell.kind === "identity" &&
          "border border-dashed border-fd-border text-fd-muted-foreground",
      )}
    >
      {cell.kind === "estimated" && (
        <span className="size-1.5 shrink-0 rounded-full bg-fd-primary" />
      )}
      {cell.note}
    </span>
  );
}

/** What each state estimator plugin puts in each transform of the TF tree. */
export function EstimatorTransforms() {
  return (
    <figure className="not-prose my-6">
      <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-fd-border">
                <th className="px-4 py-2.5 text-start text-xs font-medium text-fd-muted-foreground">
                  Plugin
                </th>
                {TRANSFORMS.map((transform) => (
                  <th
                    key={transform}
                    className="px-3 py-2.5 text-start font-mono text-xs font-normal text-fd-foreground"
                  >
                    {transform}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.plugin}
                  className="border-b border-fd-border last:border-b-0"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 text-start font-mono text-xs font-medium whitespace-nowrap text-fd-foreground"
                  >
                    {row.plugin}
                  </th>
                  {row.cells.map((cell, index) => (
                    <td key={TRANSFORMS[index]} className="px-3 py-3">
                      <Pill cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-fd-border bg-fd-background/60 px-4 py-2.5 text-xs text-fd-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Pill cell={{ kind: "estimated", note: "Estimated" }} /> updated
            while flying
          </span>
          <span className="flex items-center gap-1.5">
            <Pill cell={{ kind: "fixed", note: "Fixed" }} /> set once at the
            start
          </span>
          <span className="flex items-center gap-1.5">
            <Pill cell={{ kind: "identity", note: "Identity" }} /> left as
            identity
          </span>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-fd-muted-foreground">
        What each plugin puts in the TF tree. Only the EKF corrects map → odom.
      </figcaption>
    </figure>
  );
}
