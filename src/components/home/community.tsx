import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import {
  avatarAt,
  type Contributor,
  getCommunity,
  getRepoStats,
  maintainers,
} from "@/lib/github";
import { appName } from "@/lib/shared";
import { CountUp } from "./count-up";
import { Cells, Heading, Row } from "./frame";

/**
 * The project's open source band. On the left, the heading, the repository's
 * numbers counting up, and the core maintainers. On the right, everyone who
 * has contributed, flying as a swarm round the maintainers, with a signal
 * running out along the formation's links. All of it comes from GitHub, once
 * a day (lib/github.ts); whatever GitHub doesn't answer is left out.
 */
export async function Community() {
  const [{ contributors, repos }, stats] = await Promise.all([
    getCommunity(),
    getRepoStats(),
  ]);
  const avatarOf = (login: string) =>
    contributors.find((person) => person.login === login)?.avatar ??
    `https://github.com/${login}.png`;
  const figures = [
    { value: stats?.stars, label: "Stars" },
    { value: stats?.forks, label: "Forks" },
    { value: contributors.length, label: "Contributors" },
    { value: repos, label: "Repositories" },
  ].filter((figure): figure is { value: number; label: string } =>
    Boolean(figure.value),
  );

  return (
    <Row
      corners
      className="bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--color-fd-primary)_9%,transparent),transparent_60%)]"
    >
      <div
        className={cn(
          "grid",
          contributors.length > 0 && "lg:grid-cols-[5fr_7fr]",
        )}
      >
        <div className="flex flex-col p-6 sm:p-12">
          <Heading className="text-fd-primary">Open source</Heading>
          <p className="mt-4 max-w-sm text-fd-muted-foreground">
            {appName} is built in the open on GitHub by anyone who wants to
            take part, with strong support from CVAR-UPM.
          </p>

          {figures.length > 0 && (
            <Cells className="mt-10 grid-cols-2 border border-fd-border">
              {figures.map((figure) => (
                <div key={figure.label} className="px-5 py-4">
                  <div className="font-serif text-3xl sm:text-4xl">
                    <CountUp value={figure.value} />
                  </div>
                  <div className="mt-1 font-mono text-xs tracking-widest text-fd-muted-foreground uppercase">
                    {figure.label}
                  </div>
                </div>
              ))}
            </Cells>
          )}

          <div className="mt-10">
            <p className="font-mono text-xs tracking-widest text-fd-muted-foreground uppercase">
              Core maintainers
            </p>
            <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {maintainers.map((person) => (
                <li key={person.login}>
                  <a
                    href={`https://github.com/${person.login}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    title={`@${person.login}`}
                    className="flex items-center gap-2.5 text-sm transition-colors hover:text-fd-primary"
                  >
                    <Image
                      src={avatarAt(avatarOf(person.login), 24)}
                      alt=""
                      width={24}
                      height={24}
                      className="size-6 rounded-[5px] ring-1 ring-fd-primary/40"
                    />
                    {person.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {contributors.length > 0 && <Swarm people={contributors} />}
      </div>
    </Row>
  );
}

/** The swarm's field, in the units of its SVG. */
const W = 600;
const H = 500;
/** The golden angle, which spreads a sunflower's seeds evenly. */
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
/** How long the signal takes over one link, in seconds. */
const STEP = 0.7;

type Node = Contributor & {
  x: number;
  y: number;
  size: number;
  core: boolean;
  parent: number;
  depth: number;
};

/**
 * Lays the swarm out as a sunflower, maintainers in the middle and the rest
 * outwards by contributions, so the most active fly closest. Each drone links
 * to the nearest one placed before it, which makes a tree rooted in the
 * middle; the signal runs out along it, one link per step.
 */
function formation(people: Contributor[]): Node[] {
  const core = new Set(maintainers.map((person) => person.login));
  const ordered = [
    ...people.filter((person) => core.has(person.login)),
    ...people.filter((person) => !core.has(person.login)),
  ];
  const spacing = Math.min(34, 205 / Math.sqrt(ordered.length));
  const most = Math.log(
    ordered[0] ? Math.max(...ordered.map((p) => p.contributions)) : 1,
  );

  const nodes: Node[] = [];
  ordered.forEach((person, i) => {
    const r = spacing * Math.sqrt(i + 0.5);
    const x = W / 2 + 1.25 * r * Math.cos(i * GOLDEN);
    const y = H / 2 + r * Math.sin(i * GOLDEN);
    const isCore = core.has(person.login);
    const weight = most > 0 ? Math.log(person.contributions) / most : 0;
    let parent = -1;
    let best = Number.POSITIVE_INFINITY;
    for (const [j, other] of nodes.entries()) {
      const d = (other.x - x) ** 2 + (other.y - y) ** 2;
      if (d < best) {
        best = d;
        parent = j;
      }
    }
    nodes.push({
      ...person,
      x,
      y,
      size: isCore ? 40 : 22 + 12 * Math.max(0, weight),
      core: isCore,
      parent,
      depth: parent < 0 ? 0 : (nodes[parent]?.depth ?? 0) + 1,
    });
  });
  return nodes;
}

/**
 * Everyone who has contributed, as a swarm in formation. Drawn on the server
 * and played by CSS (`.home-swarm` in global.css), so it ships no script. The
 * signal's keyframes depend on how deep the formation is, so they're written
 * here.
 */
function Swarm({ people }: { people: Contributor[] }) {
  const nodes = formation(people);
  const deepest = Math.max(...nodes.map((node) => node.depth));
  const cycle = (deepest + 3) * STEP;
  const travel = ((STEP / cycle) * 100).toFixed(2);
  const flash = ((0.25 / cycle) * 100).toFixed(2);
  const fade = ((1.2 / cycle) * 100).toFixed(2);
  const keyframes = `
@keyframes home-swarm-signal{0%{stroke-dashoffset:.3}${travel}%,100%{stroke-dashoffset:-1}}
@keyframes home-swarm-light{0%{box-shadow:0 0 0 0 transparent;transform:scale(1)}${flash}%{box-shadow:0 0 0 3px var(--color-fd-primary);transform:scale(1.12)}${fade}%,100%{box-shadow:0 0 0 0 transparent;transform:scale(1)}}`;

  return (
    <div className="home-swarm relative border-t border-fd-border p-4 sm:p-8 lg:border-t-0 lg:border-l">
      <style>{keyframes}</style>
      <div
        className="relative mx-auto aspect-[6/5] w-full max-w-[640px] [container-type:inline-size]"
        style={{ "--cycle": `${cycle}s` } as CSSProperties}
      >
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 size-full overflow-visible"
        >
          {nodes.map((node) => {
            const parent = nodes[node.parent];
            if (!parent) return null;
            const ends = {
              x1: parent.x,
              y1: parent.y,
              x2: node.x,
              y2: node.y,
            };
            return (
              <g key={node.login}>
                <line {...ends} className="home-swarm-link" />
                <line
                  {...ends}
                  pathLength={1}
                  className="home-swarm-signal"
                  style={
                    {
                      "--delay": `${(node.depth - 1) * STEP}s`,
                    } as CSSProperties
                  }
                />
              </g>
            );
          })}
        </svg>

        <ul>
          {nodes.map((node) => (
            <li
              key={node.login}
              className="group absolute -translate-x-1/2 -translate-y-1/2 hover:z-20 has-focus-visible:z-20"
              style={{
                left: `${(node.x / W) * 100}%`,
                top: `${(node.y / H) * 100}%`,
                width: `${(node.size / W) * 100}cqw`,
              }}
            >
              <a
                href={`https://github.com/${node.login}`}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${node.login}, ${node.contributions.toLocaleString("en-US")} contributions`}
                className={cn(
                  "home-swarm-node block overflow-hidden rounded-[22%] bg-fd-background ring-1",
                  node.core ? "ring-fd-primary/50" : "ring-fd-border",
                )}
                style={
                  {
                    "--delay": `${node.depth * STEP}s`,
                  } as CSSProperties
                }
              >
                <Image
                  src={avatarAt(node.avatar, Math.ceil(node.size))}
                  alt=""
                  width={Math.ceil(node.size)}
                  height={Math.ceil(node.size)}
                  loading="lazy"
                  className="block size-full"
                />
              </a>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 rounded-md border border-fd-border bg-fd-popover px-2 py-1 font-mono text-xs whitespace-nowrap text-fd-popover-foreground opacity-0 shadow-sm transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-has-focus-visible:translate-y-0 group-has-focus-visible:opacity-100"
              >
                @{node.login}
                <span className="ml-1.5 text-fd-muted-foreground">
                  {node.contributions.toLocaleString("en-US")}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
