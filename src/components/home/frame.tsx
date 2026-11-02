import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The home page is one bordered column, split into rows by horizontal rules,
 * in the style of vercel.com. Each `Row` draws its own bottom rule, and the
 * column draws the sides.
 */
export function Frame({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className="px-4 sm:px-6">
      <div
        className={cn(
          "mx-auto w-full max-w-[1280px] border-x border-fd-border",
          className,
        )}
        {...props}
      />
    </div>
  );
}

/**
 * One horizontal band of the frame. `corners` puts the small plus marks on
 * the band's top corners, where its rule meets the frame's sides.
 */
export function Row({
  className,
  corners = false,
  children,
  ...props
}: ComponentProps<"section"> & { corners?: boolean }) {
  return (
    <section
      className={cn("relative border-b border-fd-border", className)}
      {...props}
    >
      {corners && (
        <>
          <Plus className="-top-[10.5px] -left-[10.5px]" />
          <Plus className="-top-[10.5px] -right-[10.5px]" />
        </>
      )}
      {children}
    </section>
  );
}

/**
 * Cells laid out on a grid whose gaps show the border colour through, so
 * every cell is ruled off from its neighbours by a single 1px line.
 */
export function Cells({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid gap-px bg-fd-border [&>*]:bg-fd-background",
        className,
      )}
      {...props}
    />
  );
}

/** The plus mark drawn where two rules cross. */
export function Plus({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 21 21"
      className={cn(
        "pointer-events-none absolute z-10 size-[21px] text-fd-muted-foreground",
        className,
      )}
    >
      <path d="M10.5 0v21M0 10.5h21" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/**
 * Numbered mono label above a section heading.
 */
export function Eyebrow({
  index,
  children,
}: {
  index: string;
  children: ReactNode;
}) {
  return (
    <p className="flex items-center gap-3 font-mono text-xs tracking-widest text-fd-muted-foreground uppercase">
      <span className="text-fd-primary">{index}</span>
      <span className="h-px w-6 bg-fd-border" />
      {children}
    </p>
  );
}

/** Serif display heading used for every section title on the home page. */
export function Heading({
  as: Tag = "h2",
  className,
  ...props
}: ComponentProps<"h2"> & { as?: "h1" | "h2" | "h3" }) {
  return (
    <Tag
      className={cn(
        "font-serif text-3xl leading-[1.1] font-normal tracking-[-0.02em] text-balance sm:text-[2.75rem]",
        className,
      )}
      {...props}
    />
  );
}

/** An underlined text link with an arrow, for a section's next step. */
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1 text-sm font-medium underline decoration-fd-primary/30 underline-offset-4 transition-colors hover:decoration-fd-primary"
    >
      {children}
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
