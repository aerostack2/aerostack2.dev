"use client";

import "@xyflow/react/dist/base.css";
import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  Handle,
  MarkerType,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useStore,
} from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/cn";

type Side = "top" | "right" | "bottom" | "left";
/** Where on a side an edge attaches. Two edges between the same pair of
    nodes use `start` and `end` so they run side by side. */
type Slot = "start" | "center" | "end";

export interface FlowNode {
  id: string;
  x: number;
  y: number;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /**
   * `danger` marks a node in red. `group` draws a dashed frame around other
   * nodes, sized with `width` and `height`; list it first so it sits behind them.
   */
  variant?: "default" | "danger" | "group";
  width?: number;
  height?: number;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  from: Side;
  to: Side;
  fromSlot?: Slot;
  toSlot?: Slot;
  /** `danger` draws the edge in red when it's highlighted. */
  tone?: "default" | "danger";
  /** The channel this edge belongs to. Edges of the same channel highlight together. */
  channel: string;
  /** Shown on the edge. Leave out to draw the edge without a label. */
  label?: string;
  /**
   * Where the label sits, from 0 at the source to 1 at the target. Defaults
   * to the middle. Meant for straight edges, to stagger two parallel labels.
   */
  labelAt?: number;
}

export interface FlowChannel {
  title: string;
  description: ReactNode;
  topics?: string[];
  publishers: string[];
  subscribers: string[];
}

/** Headings of the details panel, for diagrams whose channels aren't topics. */
export interface FlowLabels {
  /** Names the list of channels, for screen readers. */
  channels?: string;
  /** Shown above the topics. Leave out to show them without a heading. */
  topics?: string;
  publishers?: string;
  subscribers?: string;
}

export interface FlowDiagramProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  /** Details for each channel, keyed by `FlowEdge.channel`, in display order. */
  channels: Record<string, FlowChannel>;
  /** Width over height of the drawing area. */
  aspectRatio?: number;
  /** Width of every box node, in diagram units. */
  nodeWidth?: number;
  labels?: FlowLabels;
  ariaLabel: string;
  caption?: string;
}

const NODE_WIDTH = 212;
const SLOTS: Record<Slot, string> = { start: "25%", center: "50%", end: "75%" };
const SIDES: Record<Side, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

interface HighlightState {
  active: string;
  select: (channel: string) => void;
  hover: (channel: string | null) => void;
  activeNodes: Set<string>;
}

const Highlight = createContext<HighlightState | null>(null);

function useHighlight() {
  const value = useContext(Highlight);
  if (!value) throw new Error("FlowDiagram parts must render inside it.");
  return value;
}

type DiagramNode = Node<{ node: FlowNode; width: number }, "box">;
type DiagramEdge = Edge<{ edge: FlowEdge }, "channel">;

function Handles() {
  const handleClass = "!size-1 !min-h-0 !min-w-0 !border-0 !bg-transparent";
  return (Object.keys(SIDES) as Side[]).flatMap((side) =>
    (Object.keys(SLOTS) as Slot[]).map((slot) => {
      const offset =
        side === "left" || side === "right"
          ? { top: SLOTS[slot] }
          : { left: SLOTS[slot] };
      const suffix = slot === "center" ? "" : `-${slot}`;
      return (
        <span key={`${side}${suffix}`}>
          <Handle
            id={`out-${side}${suffix}`}
            type="source"
            position={SIDES[side]}
            isConnectable={false}
            className={handleClass}
            style={offset}
          />
          <Handle
            id={`in-${side}${suffix}`}
            type="target"
            position={SIDES[side]}
            isConnectable={false}
            className={handleClass}
            style={offset}
          />
        </span>
      );
    }),
  );
}

function BoxNode({ id, data }: NodeProps<DiagramNode>) {
  const { activeNodes } = useHighlight();
  const active = activeNodes.has(id);
  const { node } = data;
  const Icon = node.icon;
  const variant = node.variant ?? "default";

  if (variant === "group") {
    return (
      <div
        className={cn(
          "relative rounded-2xl border border-dashed transition-colors duration-200",
          active ? "border-red-500/60" : "border-fd-muted-foreground/40",
        )}
        style={{ width: node.width, height: node.height }}
      >
        <span
          className={cn(
            "absolute top-2.5 left-3.5 text-[11px] font-medium transition-colors duration-200",
            active
              ? "text-red-600 dark:text-red-400"
              : "text-fd-muted-foreground",
          )}
        >
          {node.title}
        </span>
        <Handles />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border bg-fd-card px-3 py-2.5 shadow-sm transition-[border-color,box-shadow,opacity] duration-200",
        active
          ? variant === "danger"
            ? "border-red-500/70 shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-red-500)_15%,transparent)]"
            : "border-fd-primary/70 shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-fd-primary)_15%,transparent)]"
          : cn(
              "opacity-70",
              variant === "danger" ? "border-red-500/40" : "border-fd-border",
            ),
      )}
      style={{ width: data.width }}
    >
      {Icon && (
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-200",
            variant === "danger"
              ? active
                ? "bg-red-500 text-white"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
              : active
                ? "bg-fd-primary text-fd-primary-foreground"
                : "bg-fd-primary/10 text-fd-primary",
          )}
        >
          <Icon className="size-4" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-[13px] leading-tight font-medium whitespace-nowrap text-fd-foreground">
          {node.title}
        </span>
        {node.subtitle && (
          <span className="block truncate font-mono text-[10.5px] text-fd-muted-foreground">
            {node.subtitle}
          </span>
        )}
      </span>
      <Handles />
    </div>
  );
}

function ChannelEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
}: EdgeProps<DiagramEdge>) {
  const { active, select, hover } = useHighlight();
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  if (!data) return null;
  const { edge } = data;
  const isActive = edge.channel === active;
  const at = edge.labelAt;
  const labelLeft =
    at === undefined ? labelX : sourceX + (targetX - sourceX) * at;
  const labelTop =
    at === undefined ? labelY : sourceY + (targetY - sourceY) * at;
  const danger = edge.tone === "danger";

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        className={cn(
          "transition-[stroke,opacity] duration-200",
          isActive && "flow-edge-active",
        )}
        style={{
          stroke: isActive
            ? danger
              ? "var(--color-red-500)"
              : "var(--color-fd-primary)"
            : "var(--color-fd-muted-foreground)",
          strokeWidth: isActive ? 2 : 1.25,
          opacity: isActive ? 1 : 0.35,
        }}
      />
      {edge.label && (
        <EdgeLabelRenderer>
          <button
            type="button"
            onClick={() => select(edge.channel)}
            onMouseEnter={() => hover(edge.channel)}
            onMouseLeave={() => hover(null)}
            className={cn(
              "nodrag nopan pointer-events-auto absolute rounded-full border px-2 py-0.5 font-mono text-[10.5px] transition-colors duration-200",
              isActive
                ? danger
                  ? "border-red-500 bg-red-500 text-white"
                  : "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                : "border-fd-border bg-fd-background text-fd-muted-foreground hover:border-fd-primary/60 hover:text-fd-primary",
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelLeft}px, ${labelTop}px)`,
            }}
          >
            {edge.label}
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

function slotSuffix(slot?: Slot) {
  return !slot || slot === "center" ? "" : `-${slot}`;
}

const detailHeading =
  "text-xs font-medium tracking-wide text-fd-muted-foreground uppercase";

const nodeTypes = { box: BoxNode };
const edgeTypes = { channel: ChannelEdge };

/** Refits the drawing whenever the container changes size. */
function AutoFit() {
  const { fitView } = useReactFlow();
  const width = useStore((s) => s.width);
  const height = useStore((s) => s.height);
  useEffect(() => {
    if (width && height) fitView({ padding: 0.1 });
  }, [fitView, width, height]);
  return null;
}

/**
 * A static node-and-edge diagram whose edges are grouped into channels.
 * Hovering or selecting a channel highlights its edges and the nodes it
 * connects, and shows its details underneath.
 */
export function FlowDiagram({
  nodes,
  edges,
  channels,
  aspectRatio = 4 / 3,
  nodeWidth = NODE_WIDTH,
  labels,
  ariaLabel,
  caption,
}: FlowDiagramProps) {
  const channelIds = Object.keys(channels);
  const [selected, setSelected] = useState(channelIds[0]);
  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ?? selected;

  const highlight = useMemo<HighlightState>(() => {
    const activeNodes = new Set<string>();
    for (const edge of edges) {
      if (edge.channel === active) {
        activeNodes.add(edge.source);
        activeNodes.add(edge.target);
      }
    }
    return { active, select: setSelected, hover: setHovered, activeNodes };
  }, [active, edges]);

  const flowNodes = useMemo<DiagramNode[]>(
    () =>
      nodes.map((node) => ({
        id: node.id,
        type: "box",
        position: { x: node.x, y: node.y },
        data: { node, width: nodeWidth },
        draggable: false,
        selectable: false,
        // A group frame sits behind the nodes and edges it surrounds.
        zIndex: node.variant === "group" ? -1 : 0,
        style: node.variant === "group" ? { pointerEvents: "none" } : undefined,
      })),
    [nodes, nodeWidth],
  );

  const flowEdges = useMemo<DiagramEdge[]>(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        type: "channel",
        source: edge.source,
        target: edge.target,
        sourceHandle: `out-${edge.from}${slotSuffix(edge.fromSlot)}`,
        targetHandle: `in-${edge.to}${slotSuffix(edge.toSlot)}`,
        data: { edge },
        selectable: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color:
            edge.channel !== active
              ? "var(--color-fd-muted-foreground)"
              : edge.tone === "danger"
                ? "var(--color-red-500)"
                : "var(--color-fd-primary)",
        },
      })),
    [edges, active],
  );

  const details = channels[selected];

  return (
    <Highlight.Provider value={highlight}>
      <figure className="not-prose my-8 overflow-hidden rounded-xl border border-fd-border bg-fd-card">
        {/* The box takes its size from the aspect ratio and the height cap;
            the drawing fills it absolutely, so it can never be taller than
            what's visible. */}
        <div
          className="relative w-full"
          style={{ aspectRatio, maxHeight: 440 }}
        >
          <div
            role="img"
            aria-label={ariaLabel}
            className="flow-diagram absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, color-mix(in oklab, var(--color-fd-muted-foreground) 22%, transparent) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          >
            <ReactFlowProvider>
              <ReactFlow
                nodes={flowNodes}
                edges={flowEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.1 }}
                minZoom={0.2}
                maxZoom={1}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag={false}
                panOnScroll={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                preventScrolling={false}
              >
                <AutoFit />
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        </div>
        {caption && (
          <figcaption className="border-t border-fd-border px-4 py-2 text-center text-sm text-fd-muted-foreground">
            {caption}
          </figcaption>
        )}

        <div className="border-t border-fd-border bg-fd-background/60 p-4">
          <div
            role="tablist"
            aria-label={labels?.channels ?? "Channels"}
            className="mb-3 flex flex-wrap gap-1.5"
          >
            {channelIds.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={id === selected}
                onClick={() => setSelected(id)}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "rounded-full border px-2.5 py-1 font-mono text-xs transition-colors",
                  id === selected
                    ? "border-fd-primary bg-fd-primary/10 text-fd-primary"
                    : "border-fd-border text-fd-muted-foreground hover:text-fd-foreground",
                )}
              >
                {id}
              </button>
            ))}
          </div>

          {details && (
            <div role="tabpanel" className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-fd-foreground">
                  {details.title}
                </div>
                <div className="text-fd-muted-foreground">
                  {details.description}
                </div>
              </div>
              {details.topics && details.topics.length > 0 && (
                <div>
                  {labels?.topics && (
                    <div className={detailHeading}>{labels.topics}</div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {details.topics.map((topic) => (
                      <code
                        key={topic}
                        className="rounded-md border border-fd-border bg-fd-muted px-1.5 py-0.5 font-mono text-xs text-fd-foreground"
                      >
                        {topic}
                      </code>
                    ))}
                  </div>
                </div>
              )}
              <dl className="grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className={detailHeading}>
                    {labels?.publishers ?? "Published by"}
                  </dt>
                  <dd className="text-fd-foreground">
                    {details.publishers.join(", ")}
                  </dd>
                </div>
                <div>
                  <dt className={detailHeading}>
                    {labels?.subscribers ?? "Used by"}
                  </dt>
                  <dd className="text-fd-foreground">
                    {details.subscribers.join(", ")}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </figure>
    </Highlight.Provider>
  );
}
