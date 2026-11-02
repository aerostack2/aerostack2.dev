import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Link {
  transform: string;
  kind: string;
  description: string;
}

const LINKS: Link[] = [
  {
    transform: "earth → map",
    kind: "static",
    description: "Where the drone's local frame sits in the world. Set once.",
  },
  {
    transform: "map → odom",
    kind: "jumps",
    description: "Corrections from absolute measurements.",
  },
  {
    transform: "odom → base_link",
    kind: "smooth",
    description: "The drone's continuous motion, at sensor rate.",
  },
];

const DRONES = ["drone0", "drone1"];
const FRAMES = ["map", "odom", "base_link"];

// Every row has a fixed height, so nothing in the legend column can stretch
// the tree. Link rows are tall enough to hold a legend entry beside them.
const FRAME_ROW = "h-9";
const LINK_ROW = "h-20";

const line = "absolute bg-fd-border";

function Frame({
  ns,
  name,
  tag,
  shared = false,
}: {
  ns?: string;
  name: string;
  tag?: string;
  shared?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative z-10 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs whitespace-nowrap shadow-sm",
        shared
          ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
          : "border-fd-border bg-fd-card text-fd-foreground",
      )}
    >
      <span>
        {ns && <span className="text-fd-muted-foreground">{ns}/</span>}
        {name}
      </span>
      {tag && (
        <span
          className={cn(
            "rounded px-1 text-[10px] font-medium",
            shared
              ? "bg-white/20 text-fd-primary-foreground"
              : "bg-fd-primary/10 text-fd-primary",
          )}
        >
          {tag}
        </span>
      )}
    </span>
  );
}

function Cell({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {children}
    </div>
  );
}

function LegendItem({ link }: { link: Link }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <code className="font-mono text-xs text-fd-foreground">
          {link.transform}
        </code>
        <span className="rounded-full border border-fd-primary/40 px-1.5 py-px text-[10px] leading-none font-medium text-fd-primary">
          {link.kind}
        </span>
      </div>
      <span className="text-xs leading-snug text-fd-muted-foreground">
        {link.description}
      </span>
    </div>
  );
}

/** The legend cell beside a link. Hidden on narrow screens, where the legend moves below. */
function Legend({ link, className }: { link?: Link; className?: string }) {
  return (
    <div className={cn("hidden items-center ps-6 md:flex", className)}>
      {link && <LegendItem link={link} />}
    </div>
  );
}

/**
 * The Aerostack2 TF tree for two drones: one shared `earth` frame and a
 * `map -> odom -> base_link` chain per drone. On wide screens, what each link
 * means sits beside it.
 */
export function FrameTree() {
  return (
    <figure className="not-prose my-8">
      <div className="rounded-xl border border-fd-border bg-fd-card p-4 sm:p-6">
        <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_15rem]">
          {/* earth, centred over both drones */}
          <Cell className={cn("col-span-2", FRAME_ROW)}>
            <span className={cn(line, "top-1/2 bottom-0 left-1/2 w-px")} />
            <Frame name="earth" tag="shared" shared />
          </Cell>
          <Legend className={FRAME_ROW} />

          {/* Fork from earth down to each drone's map */}
          {DRONES.map((drone, index) => (
            <Cell key={drone} className={LINK_ROW}>
              {/* the stem from earth, on the boundary between the columns */}
              <span
                className={cn(
                  line,
                  "top-0 h-1/2 w-px",
                  index === 0 ? "right-0" : "left-0",
                )}
              />
              <span
                className={cn(
                  line,
                  "top-1/2 h-px",
                  index === 0 ? "right-0 left-1/2" : "right-1/2 left-0",
                )}
              />
              <span className={cn(line, "top-1/2 bottom-0 left-1/2 w-px")} />
            </Cell>
          ))}
          <Legend link={LINKS[0]} className={LINK_ROW} />

          {FRAMES.map((frame, index) => (
            <FrameRow key={frame} frame={frame} index={index} />
          ))}
        </div>

        {/* On narrow screens the legend moves under the tree. */}
        <div className="mt-5 grid gap-3 border-t border-fd-border pt-4 md:hidden">
          {LINKS.map((link) => (
            <LegendItem key={link.transform} link={link} />
          ))}
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-fd-muted-foreground">
        The TF tree for two drones. Every drone hangs its own chain off the
        shared earth frame.
      </figcaption>
    </figure>
  );
}

function FrameRow({ frame, index }: { frame: string; index: number }) {
  const last = index === FRAMES.length - 1;

  return (
    <>
      {/* The frame itself. The line runs on behind the box so it meets it
          without a gap; the last frame only needs it down to its centre. */}
      {DRONES.map((drone) => (
        <Cell key={`${drone}-${frame}`} className={FRAME_ROW}>
          <span
            className={cn(
              line,
              "top-0 left-1/2 w-px",
              last ? "bottom-1/2" : "bottom-0",
            )}
          />
          <Frame
            ns={drone}
            name={frame}
            tag={frame === "base_link" ? "FLU" : undefined}
          />
        </Cell>
      ))}
      <Legend className={FRAME_ROW} />

      {/* The link down to the next frame, with its meaning beside it. */}
      {!last && (
        <>
          {DRONES.map((drone) => (
            <Cell key={`${drone}-${frame}-link`} className={LINK_ROW}>
              <span className={cn(line, "inset-y-0 left-1/2 w-px")} />
            </Cell>
          ))}
          <Legend link={LINKS[index + 1]} className={LINK_ROW} />
        </>
      )}
    </>
  );
}
