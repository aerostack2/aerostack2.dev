"use client";

import { keyboard, rebuild, relay, terrain } from "@lucasmarkes/hairline";
import { useEffect, useRef } from "react";
import { jetson } from "@/components/home/figures/jetson";
import { swarm } from "@/components/home/figures/swarm";
import { cn } from "@/lib/cn";

/**
 * Line figures that answer the pointer: some from Hairline
 * (@lucasmarkes/hairline), and our own drawn the same way
 * (./figures), which mount with the same call.
 *
 * Hairline's own React components are all created when its module loads, so
 * importing one pulls in all thirty-three figures. Its plain functions are
 * separate, so this wrapper imports only the ones the home page uses and
 * mounts them itself. Colours come from `.line-figure` in global.css.
 */
const figures = {
  jetson,
  keyboard,
  rebuild,
  relay,
  swarm,
  terrain,
};

export type LineFigureName = keyof typeof figures;

export function LineFigure({
  name,
  label,
  className,
}: {
  name: LineFigureName;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const figure = figures[name](ref.current, { label });
    return () => figure.destroy();
  }, [name, label]);

  // The figure draws at its box's width and a 5:4 aspect ratio. Reserving the
  // box up front keeps the layout still while it mounts.
  return (
    <div
      ref={ref}
      className={cn("line-figure aspect-[5/4] w-full", className)}
    />
  );
}
