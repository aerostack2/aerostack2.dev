import Link from "next/link";
import { appName } from "@/lib/shared";

const links: [string, string][] = [
  ["About", "/docs/about"],
  ["License", "/docs/about/license"],
  ["Citations", "/docs/about/citations"],
];

const linkClass =
  "underline decoration-white/25 underline-offset-[3px] transition-colors hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/**
 * Slim blue bar at the bottom of every docs page, in the home footer's blue.
 *
 * It sits in the docs layout's grid, which only defines three rows; starting
 * it on row 4 adds a row under the page. The sidebar and TOC are sticky against
 * the whole grid, so they stay pinned over this row rather than scrolling away.
 * The footer therefore starts at column 3, beside the sidebar instead of under
 * it, and `relative z-10` lifts it over the TOC, whose bottom would otherwise
 * cover its right end.
 */
export function DocsFooter() {
  return (
    <footer className="relative z-10 col-start-3 -col-end-1 row-start-4 grid grid-cols-subgrid bg-[#1348dc] text-white">
      {/* Shares the grid's columns, so the text sits in the main column with
          the same width and padding as the page container above it. The
          height matches the GitHub card at the foot of the sidebar
          (GITHUB_INFO_CLASS in src/app/docs/layout.tsx), so their top edges
          line up. */}
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-1 px-4 py-2 text-xs sm:h-10 sm:flex-row sm:items-center sm:justify-between sm:py-0 md:px-6 xl:px-8">
        <p className="text-white/75">
          © {new Date().getFullYear()} {appName}. Open source, built on ROS 2.
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-white/85">
            {links.map(([label, href]) => (
              <li key={label}>
                <Link href={href} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
