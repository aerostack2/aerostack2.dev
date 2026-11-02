import Image from "next/image";
import Link from "next/link";
import { appDescription, appName, projectRepo } from "@/lib/shared";

const githubUrl = `https://github.com/${projectRepo.owner}/${projectRepo.repo}`;

const columns: { title: string; links: [string, string][] }[] = [
  {
    title: "Learn",
    links: [
      ["Getting started", "/docs/getting-started"],
      ["Concepts", "/docs/concepts"],
      ["Examples", "/docs/examples"],
      ["Aerial platforms", "/docs/aerial-platforms"],
      ["Behaviors", "/docs/behaviors"],
    ],
  },
  {
    title: "Build",
    links: [
      ["Develop guide", "/docs/develop-guide"],
      ["Tutorials", "/docs/tutorials"],
      ["Plugins", "/docs/plugins"],
      ["Python API", "/docs/api"],
      ["ROS 2 interfaces", "/docs/ros2-interfaces"],
      ["CLI", "/docs/cli"],
    ],
  },
  {
    title: "Project",
    links: [
      ["GitHub", githubUrl],
      ["Citations", "/docs/about/citations"],
      ["Projects", "/docs/projects"],
      ["About", "/docs/about"],
    ],
  },
];

const linkClass =
  "w-fit underline decoration-white/25 underline-offset-[3px] transition-colors hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/** Small diamond drawn where the column lines meet the footer's top edge. */
function Node({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute -top-[4.5px] z-10 size-2 rotate-45 border border-fd-border bg-fd-background ${className}`}
    />
  );
}

/**
 * Full-width blue footer. The page's bordered column carries on through it as
 * faint white lines, and a huge wordmark fills the bottom, faded and cropped.
 */
export function HomeFooter() {
  return (
    <footer className="home-footer relative isolate bg-[#1348dc] text-white">
      <div className="px-4 sm:px-6">
        <div className="relative mx-auto max-w-[1280px] border-x border-white/15">
          <Node className="-left-[4.5px]" />
          <Node className="-right-[4.5px]" />

          <div className="grid divide-white/15 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x">
            <div className="flex flex-col gap-4 border-b border-white/15 p-6 sm:col-span-3 sm:p-8 lg:col-span-2 lg:border-b-0">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-md ring-1 ring-white/20"
                />
                <span className="font-serif text-2xl">{appName}</span>
              </div>
              <p className="max-w-sm text-sm text-white/75">{appDescription}</p>
              <hr className="my-1 w-16 border-white/20" />
              <p className="text-xs text-white/60">
                Open source, built on ROS 2. Contributions are welcome on{" "}
                <a href={githubUrl} className={linkClass}>
                  GitHub
                </a>
                .
              </p>
            </div>

            {columns.map((column) => (
              <nav
                key={column.title}
                aria-label={column.title}
                className="flex flex-col gap-4 p-6 sm:p-8"
              >
                <h2 className="font-serif text-lg">{column.title}</h2>
                <ul className="flex flex-col gap-3 text-sm text-white/85">
                  {column.links.map(([label, href]) => {
                    const external = href.startsWith("http");
                    return (
                      <li key={label}>
                        <Link
                          href={href}
                          className={linkClass}
                          {...(external && {
                            target: "_blank",
                            rel: "noopener noreferrer",
                          })}
                        >
                          {label}
                        </Link>
                        {external && (
                          <span
                            aria-hidden="true"
                            className="ms-1.5 text-white/50"
                          >
                            ↗
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}
          </div>

          {/* The wordmark is SVG text stretched to the column's width with
              `textLength`, so it fills the row at any screen size. Only the
              top of the letters shows, fading out towards the bottom. */}
          <div
            aria-hidden="true"
            className="home-footer-wordmark overflow-hidden border-t border-dashed border-white/15 px-2 pt-6 select-none sm:px-4"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 1000 150"
              className="-mb-[3%] block w-full"
            >
              <text
                x="0"
                y="140"
                textLength="1000"
                lengthAdjust="spacingAndGlyphs"
                className="fill-white font-sans font-bold"
                fontSize="168"
              >
                AEROSTACK2
              </text>
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
