import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

function Card({
  children,
  caption,
  className,
}: {
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("not-prose my-6", className)}>
      <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card">
        {children}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-fd-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------------ */

export interface ModeRow {
  mode: string;
  /** Topic name to a short note on what the mode reads from it. */
  uses: Record<string, string>;
  /** Shown instead of the cells when the mode uses no topics. */
  none?: string;
}

export interface ModeMatrixProps {
  /** Topic names, without the channel prefix. */
  topics: string[];
  /** Channel prefix shown above the topic columns, such as `motion_reference/`. */
  prefix: string;
  rows: ModeRow[];
  footnote?: ReactNode;
  caption?: ReactNode;
}

/** Which topics each control mode reads, as a grid of modes against topics. */
export function ModeMatrix({
  topics,
  prefix,
  rows,
  footnote,
  caption,
}: ModeMatrixProps) {
  return (
    <Card caption={caption}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-fd-border">
              <th className="px-4 py-2.5 text-start text-xs font-medium text-fd-muted-foreground">
                Control mode
              </th>
              {topics.map((topic) => (
                <th
                  key={topic}
                  className="px-3 py-2.5 text-start font-mono text-xs font-normal text-fd-muted-foreground"
                >
                  <span className="opacity-60">{prefix}</span>
                  <span className="text-fd-foreground">{topic}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.mode}
                className="border-b border-fd-border last:border-b-0"
              >
                <th
                  scope="row"
                  className="px-4 py-2.5 text-start font-medium whitespace-nowrap text-fd-foreground"
                >
                  {row.mode}
                </th>
                {row.none ? (
                  <td
                    colSpan={topics.length}
                    className="px-3 py-2.5 text-xs text-fd-muted-foreground italic"
                  >
                    {row.none}
                  </td>
                ) : (
                  topics.map((topic) => {
                    const note = row.uses[topic];
                    return (
                      <td key={topic} className="px-3 py-2.5">
                        {note ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-fd-primary/10 px-2 py-0.5 text-xs text-fd-primary">
                            <span className="size-1.5 rounded-full bg-fd-primary" />
                            {note}
                          </span>
                        ) : (
                          <>
                            <span
                              aria-hidden
                              className="text-fd-muted-foreground/40"
                            >
                              —
                            </span>
                            <span className="sr-only">Not used</span>
                          </>
                        )}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footnote && (
        <div className="border-t border-fd-border bg-fd-background/60 px-4 py-2.5 text-xs text-fd-muted-foreground">
          {footnote}
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------------ */

const PLATFORM_STATES = [
  "Disarmed",
  "Landed",
  "Taking off",
  "Flying",
  "Landing",
  "Emergency",
];

function Flag({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "grid size-5 place-items-center rounded-full",
          on
            ? "bg-fd-primary text-fd-primary-foreground"
            : "border border-fd-border",
        )}
      >
        {on && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span className="text-sm text-fd-foreground">{label}</span>
    </div>
  );
}

/** A sample `platform/info` message, laid out like a status readout. */
export function PlatformInfoCard() {
  return (
    <Card caption="A sample platform/info message from a drone in flight.">
      <div className="flex items-center justify-between border-b border-fd-border px-4 py-2.5">
        <code className="font-mono text-xs text-fd-foreground">
          /drone0/platform/info
        </code>
        <span className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-fd-primary motion-reduce:animate-none" />
          as2_msgs/PlatformInfo
        </span>
      </div>
      <div className="grid gap-5 p-4 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-row flex-wrap gap-x-5 gap-y-2 sm:flex-col">
          <Flag label="connected" on />
          <Flag label="armed" on />
          <Flag label="offboard" on />
        </div>
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 font-mono text-xs text-fd-muted-foreground">
              status
            </div>
            <div className="flex flex-wrap gap-1">
              {PLATFORM_STATES.map((state) => (
                <span
                  key={state}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-xs",
                    state === "Flying"
                      ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                      : "border-fd-border text-fd-muted-foreground",
                  )}
                >
                  {state}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1.5 font-mono text-xs text-fd-muted-foreground">
              current_control_mode
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-sm text-fd-foreground">
              <span className="rounded-md bg-fd-primary/10 px-2 py-0.5 text-xs text-fd-primary">
                Speed
              </span>
              <span className="text-fd-muted-foreground">+</span>
              <span className="rounded-md bg-fd-primary/10 px-2 py-0.5 text-xs text-fd-primary">
                Yaw angle
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------------ */

interface Alert {
  value: number;
  name: string;
  constant: string;
  /** False for alerts that are defined but that nothing acts on yet. */
  handled: boolean;
}

const PLATFORM_ALERTS: Alert[] = [
  {
    value: -3,
    name: "Emergency land",
    constant: "EMERGENCY_LAND",
    handled: false,
  },
  {
    value: -2,
    name: "Emergency hover",
    constant: "EMERGENCY_HOVER",
    handled: true,
  },
  { value: -1, name: "Kill switch", constant: "KILL_SWITCH", handled: true },
];
const INFO_ALERTS: Alert[] = [
  { value: 0, name: "Info", constant: "INFO_ALERT", handled: true },
];
const AS2_ALERTS: Alert[] = [
  { value: 1, name: "Force hover", constant: "FORCE_HOVER", handled: false },
  { value: 2, name: "Force land", constant: "FORCE_LAND", handled: false },
];

function AlertGroup({
  title,
  alerts,
  tone,
}: {
  title: string;
  alerts: Alert[];
  tone: "danger" | "neutral" | "primary";
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border p-2",
        tone === "danger" && "border-red-500/30 bg-red-500/[0.06]",
        tone === "neutral" && "border-fd-border bg-fd-background/60",
        tone === "primary" && "border-fd-primary/30 bg-fd-primary/[0.06]",
      )}
    >
      <div
        className={cn(
          "mb-2 px-1 text-xs font-medium",
          tone === "danger" && "text-red-600 dark:text-red-400",
          tone === "neutral" && "text-fd-muted-foreground",
          tone === "primary" && "text-fd-primary",
        )}
      >
        {title}
      </div>
      <div className="grid flex-1 auto-cols-fr grid-flow-col gap-1.5">
        {alerts.map((alert) => (
          <div
            key={alert.value}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md border bg-fd-card px-2 py-2 text-center",
              alert.handled
                ? "border-fd-border"
                : "border-dashed border-fd-muted-foreground/40 opacity-70",
            )}
          >
            <span
              className={cn(
                "font-mono text-lg leading-none font-semibold",
                tone === "danger" && "text-red-600 dark:text-red-400",
                tone === "neutral" && "text-fd-muted-foreground",
                tone === "primary" && "text-fd-primary",
              )}
            >
              {alert.value > 0 ? `+${alert.value}` : alert.value}
            </span>
            <span className="text-xs leading-tight text-fd-foreground">
              {alert.name}
            </span>
            <span className="font-mono text-[10px] break-all text-fd-muted-foreground">
              {alert.constant}
            </span>
            {!alert.handled && (
              <span className="mt-0.5 rounded-full border border-fd-border px-1.5 text-[10px] leading-4 text-fd-muted-foreground">
                not acted on yet
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The `AlertEvent` values on a scale. The sign says who is meant to handle each
 * alert; dashed alerts are defined but nothing acts on them yet.
 */
export function AlertScale() {
  return (
    <Card caption="AlertEvent values. The sign says who is meant to handle each alert, and dashed alerts aren't acted on yet.">
      <div className="grid gap-2 p-3 md:grid-cols-[3fr_1fr_2fr]">
        <AlertGroup
          title="For the platform"
          alerts={PLATFORM_ALERTS}
          tone="danger"
        />
        <AlertGroup title="Information" alerts={INFO_ALERTS} tone="neutral" />
        <AlertGroup title="For Aerostack2" alerts={AS2_ALERTS} tone="primary" />
      </div>
    </Card>
  );
}
