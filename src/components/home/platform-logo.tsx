import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import type { Platform } from "@/lib/platforms";

/**
 * The multirotor simulator's mark: a quadrotor from above whose body is a play
 * button, a drone that runs in software. One colour, like the other logos.
 */
function SimulatorMark({ size }: { size: number }) {
  const rotors = [
    [6, 6],
    [26, 6],
    [6, 26],
    [26, 26],
  ];
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      className="shrink-0"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2.4">
        {rotors.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="4.4" />
        ))}
        <path
          d="M9.3 9.3 11.4 11.4M22.7 9.3 20.6 11.4M9.3 22.7 11.4 20.6M22.7 22.7 20.6 20.6"
          strokeLinecap="round"
        />
      </g>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M16 9.2a6.8 6.8 0 1 1 0 13.6a6.8 6.8 0 1 1 0-13.6ZM13.9 12.4v7.2l5.9-3.6Z"
      />
    </svg>
  );
}

/**
 * A platform's logo as a one-colour silhouette in the current text colour,
 * or its name as a wordmark when it has no logo, beside a drawn mark when it
 * has one. `scale` shrinks the logo's set size, for smaller places like the
 * navbar menu.
 */
export function PlatformLogo({
  platform,
  scale = 1,
  className,
}: {
  platform: Platform;
  scale?: number;
  className?: string;
}) {
  // The simulator's lockup: the mark beside its full name in Michroma, two
  // lines of about the same length. Michroma is wide, so the name stacks
  // rather than runs on, and never drops below a legible size.
  if (platform.mark) {
    return (
      <span
        role="img"
        aria-label={platform.name}
        className={cn("flex items-center whitespace-nowrap", className)}
        style={{ gap: `${0.5 * scale}rem` }}
      >
        <SimulatorMark size={28 * scale} />
        <span
          aria-hidden="true"
          className="flex flex-col leading-[1.3]"
          style={{
            fontFamily: "var(--font-michroma)",
            fontSize: `max(${0.625 * scale}rem, 0.5625rem)`,
          }}
        >
          <span>Multirotor</span>
          <span>Simulator</span>
        </span>
      </span>
    );
  }

  if (!platform.logo) {
    return (
      <span
        className={cn("font-semibold tracking-tight", className)}
        style={{ fontSize: `${1.25 * scale}rem` }}
      >
        {platform.name}
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={platform.name}
      className={cn("home-logo block max-w-full", className)}
      style={
        {
          "--logo": `url(${platform.logo.src})`,
          width: platform.logo.width * scale,
          height: platform.logo.height * scale,
        } as CSSProperties
      }
    />
  );
}
