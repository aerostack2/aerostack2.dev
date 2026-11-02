"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowDownToLine,
  Gamepad2,
  Link,
  OctagonAlert,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Power,
  PowerOff,
  SlidersHorizontal,
} from "lucide-react";
import {
  type FlowChannel,
  FlowDiagram,
  type FlowEdge,
  type FlowNode,
} from "./flow-diagram";

// States and transitions come from as2_core/src/platform_state_machine.cpp.
// Who sends each event comes from as2_core/src/aerial_platform.cpp and the
// take-off and land behaviors in as2_behaviors_motion.

// Box nodes are NODE_W wide and about 54 tall. The states sit on a grid
// inside a frame that stands for "any of these states", with emergency below.
const NODE_W = 172;
const COL = 300;
const ROW = 150;

const nodes: FlowNode[] = [
  {
    id: "states",
    x: -28,
    y: -44,
    width: 2 * COL + NODE_W + 56,
    height: ROW + 54 + 72,
    title: "Any of these states",
    variant: "group",
  },
  { id: "disarmed", x: 0, y: 0, title: "Disarmed", icon: PowerOff },
  { id: "landed", x: COL, y: 0, title: "Landed", icon: ArrowDownToLine },
  {
    id: "takingoff",
    x: 2 * COL,
    y: 0,
    title: "Taking off",
    icon: PlaneTakeoff,
  },
  { id: "flying", x: 2 * COL, y: ROW, title: "Flying", icon: Plane },
  { id: "landing", x: COL, y: ROW, title: "Landing", icon: PlaneLanding },
  {
    id: "emergency",
    x: COL,
    y: ROW + 54 + 28 + 86,
    title: "Emergency",
    icon: OctagonAlert,
    variant: "danger",
  },
];

const edges: FlowEdge[] = [
  {
    id: "arm",
    source: "disarmed",
    target: "landed",
    from: "right",
    to: "left",
    fromSlot: "start",
    toSlot: "start",
    channel: "ARM",
    label: "ARM",
    labelAt: 0.3,
  },
  {
    id: "disarm",
    source: "landed",
    target: "disarmed",
    from: "left",
    to: "right",
    fromSlot: "end",
    toSlot: "end",
    channel: "DISARM",
    label: "DISARM",
    labelAt: 0.3,
  },
  {
    id: "take-off",
    source: "landed",
    target: "takingoff",
    from: "right",
    to: "left",
    channel: "TAKE_OFF",
    label: "TAKE_OFF",
  },
  {
    id: "took-off",
    source: "takingoff",
    target: "flying",
    from: "bottom",
    to: "top",
    channel: "TOOK_OFF",
    label: "TOOK_OFF",
  },
  {
    id: "land",
    source: "flying",
    target: "landing",
    from: "left",
    to: "right",
    channel: "LAND",
    label: "LAND",
  },
  {
    id: "landed",
    source: "landing",
    target: "landed",
    from: "top",
    to: "bottom",
    channel: "LANDED",
    label: "LANDED",
  },
  {
    id: "emergency",
    source: "states",
    target: "emergency",
    from: "bottom",
    to: "top",
    tone: "danger",
    channel: "EMERGENCY",
    label: "EMERGENCY",
  },
];

const channels: Record<string, FlowChannel> = {
  ARM: {
    title: "The motors are armed",
    description:
      "The platform raises this event itself whenever a request to arm succeeds.",
    topics: ["set_arming_state"],
    publishers: ["drone.arm() in the Python API", "Arm behavior tree action"],
    subscribers: ["Disarmed → Landed"],
  },
  DISARM: {
    title: "The motors are disarmed",
    description:
      "Raised by the platform when a request to disarm succeeds. The land behavior disarms the drone after every successful landing, so a landed drone ends up disarmed.",
    topics: ["set_arming_state"],
    publishers: [
      "drone.disarm() in the Python API",
      "Disarm behavior tree action",
      "Land behavior",
    ],
    subscribers: ["Landed → Disarmed"],
  },
  TAKE_OFF: {
    title: "A take-off starts",
    description: "The take-off behavior sends it as soon as it accepts a goal.",
    topics: ["platform/state_machine_event"],
    publishers: ["Take-off behavior"],
    subscribers: ["Landed → Taking off"],
  },
  TOOK_OFF: {
    title: "The take-off succeeded",
    description:
      "Sent when the take-off behavior finishes with success. With a native take-off the platform also sends it when its own take-off returns.",
    topics: ["platform/state_machine_event"],
    publishers: ["Take-off behavior", "Platform, on a native take-off"],
    subscribers: ["Taking off → Flying"],
  },
  LAND: {
    title: "A landing starts",
    description: "The land behavior sends it as soon as it accepts a goal.",
    topics: ["platform/state_machine_event"],
    publishers: ["Land behavior"],
    subscribers: ["Flying → Landing"],
  },
  LANDED: {
    title: "The landing succeeded",
    description:
      "Sent when the land behavior finishes with success, right before it disarms the drone. With a native landing the platform also sends it.",
    topics: ["platform/state_machine_event"],
    publishers: ["Land behavior", "Platform, on a native landing"],
    subscribers: ["Landing → Landed"],
  },
  EMERGENCY: {
    title: "Something went wrong",
    description:
      "Valid from every state. In emergency the platform sends a stop command on every cycle, and no event leads back out, so the platform has to be restarted.",
    topics: ["alert_event", "platform/state_machine_event"],
    publishers: [
      "A kill switch or emergency hover alert",
      "A take-off or landing that fails or is cancelled",
    ],
    subscribers: ["Any state → Emergency"],
  },
};

/** The platform state machine, with each event as a selectable channel. */
export function PlatformStateMachine() {
  return (
    <FlowDiagram
      nodes={nodes}
      edges={edges}
      channels={channels}
      aspectRatio={2}
      nodeWidth={NODE_W}
      labels={{
        channels: "Events",
        topics: "Through",
        publishers: "Sent by",
        subscribers: "Transition",
      }}
      ariaLabel="The platform state machine. Arming moves a disarmed drone to landed and disarming moves it back. A take-off moves it from landed through taking off to flying, and a landing from flying through landing back to landed. An emergency event moves any state to emergency, which has no way out."
      caption="The platform state machine. Select an event to see who sends it."
    />
  );
}

/* ------------------------------------------------------------------------ */

interface Condition {
  title: string;
  description: string;
  how: string;
  icon: LucideIcon;
}

// The checks in AerialPlatform::sendCommand, in the order a mission meets them.
const CONDITIONS: Condition[] = [
  {
    title: "Connected",
    description: "The platform has a live link to the autopilot or simulator.",
    how: "platform/info",
    icon: Link,
  },
  {
    title: "Armed",
    description: "The motors are armed and ready to spin.",
    how: "drone.arm()",
    icon: Power,
  },
  {
    title: "Offboard",
    description: "The autopilot takes its commands from Aerostack2.",
    how: "drone.offboard()",
    icon: Gamepad2,
  },
  {
    title: "Control mode set",
    description: "The first behavior has the controller pick a mode.",
    how: "drone.takeoff()",
    icon: SlidersHorizontal,
  },
];

/** The four conditions the platform checks before it sends a command. */
export function ReadyToFly() {
  return (
    <figure className="not-prose my-6">
      <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card p-3 sm:p-4">
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CONDITIONS.map((condition, index) => {
            const Icon = condition.icon;
            return (
              <li
                key={condition.title}
                className="flex flex-col gap-2 rounded-lg border border-fd-border bg-fd-background/60 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-fd-primary/10 text-fd-primary">
                    <Icon className="size-3.5" />
                  </span>
                  <span className="text-sm font-medium text-fd-foreground">
                    {condition.title}
                  </span>
                  <span className="ms-auto font-mono text-[10.5px] text-fd-muted-foreground">
                    {index + 1}
                  </span>
                </div>
                <p className="flex-1 text-xs leading-snug text-fd-muted-foreground">
                  {condition.description}
                </p>
                <code className="self-start rounded-md border border-fd-border bg-fd-muted px-1.5 py-0.5 font-mono text-[11px] leading-snug whitespace-nowrap text-fd-foreground">
                  {condition.how}
                </code>
              </li>
            );
          })}
        </ol>
        <div className="flex justify-center py-1.5 text-fd-muted-foreground">
          <ArrowDown className="size-4" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg border border-fd-primary/40 bg-fd-primary/[0.07] px-3 py-2.5 text-center text-sm">
          <span className="font-medium text-fd-primary">
            Commands reach the drone
          </span>
          <span className="text-fd-muted-foreground">at 100 Hz by default</span>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-fd-muted-foreground">
        The platform drops every command until all four hold.
      </figcaption>
    </figure>
  );
}
