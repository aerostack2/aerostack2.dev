import Link from "fumadocs-core/link";
import { cn } from "@/lib/cn";

export interface LayerItem {
  label: string;
  href?: string;
}

export interface Layer {
  title: string;
  description?: string;
  items: LayerItem[];
}

export interface LayerDiagramProps {
  /** Layers from top to bottom. */
  layers: Layer[];
  /** A column that spans every layer, such as a shared communication layer. */
  rail?: Layer;
  caption?: string;
  className?: string;
}

function Chip({ item }: { item: LayerItem }) {
  const className =
    "inline-flex items-center rounded-md border border-fd-border bg-fd-background/70 px-2 py-0.5 text-xs text-fd-foreground transition-colors";

  if (!item.href) return <span className={className}>{item.label}</span>;

  return (
    <Link
      href={item.href}
      className={cn(
        className,
        "hover:border-fd-primary/60 hover:bg-fd-primary/10 hover:text-fd-primary",
      )}
    >
      {item.label}
    </Link>
  );
}

/**
 * A stack of layers, top to bottom, with an optional rail that spans all of
 * them. Lower layers get a stronger tint, so the stack reads as a foundation.
 */
export function LayerDiagram({
  layers,
  rail,
  caption,
  className,
}: LayerDiagramProps) {
  const count = layers.length;

  return (
    <figure className={cn("not-prose my-8", className)}>
      <div
        className={cn(
          "grid gap-2 rounded-xl border border-fd-border bg-fd-card p-2 sm:p-3",
          rail && "md:grid-cols-[1fr_11rem]",
        )}
      >
        <ol className="flex flex-col gap-2">
          {layers.map((layer, index) => {
            // 3% at the top, rising to about 15% at the bottom.
            const tint = 3 + Math.round((index / Math.max(count - 1, 1)) * 12);
            return (
              <li
                key={layer.title}
                className="relative overflow-hidden rounded-lg border border-fd-border p-3 ps-4"
                style={{
                  background: `color-mix(in oklab, var(--color-fd-primary) ${tint}%, var(--color-fd-background))`,
                }}
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 start-0 w-1 bg-fd-primary"
                  style={{
                    opacity: 0.25 + (index / Math.max(count - 1, 1)) * 0.75,
                  }}
                />
                <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-semibold text-fd-foreground">
                    {layer.title}
                  </span>
                  {layer.description && (
                    <span className="text-xs text-fd-muted-foreground">
                      {layer.description}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {layer.items.map((item) => (
                    <Chip key={item.label} item={item} />
                  ))}
                </div>
              </li>
            );
          })}
        </ol>

        {rail && (
          <div
            className="flex flex-col gap-2 rounded-lg border border-dashed border-fd-primary/50 p-3"
            style={{
              background:
                "color-mix(in oklab, var(--color-fd-primary) 6%, var(--color-fd-background))",
            }}
          >
            <div>
              <div className="text-sm font-semibold text-fd-foreground">
                {rail.title}
              </div>
              {rail.description && (
                <div className="text-xs text-fd-muted-foreground">
                  {rail.description}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 md:flex-col md:items-start">
              {rail.items.map((item) => (
                <Chip key={item.label} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-fd-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
