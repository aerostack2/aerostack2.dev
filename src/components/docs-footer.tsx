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
 * it on row 4 adds a row under the page. It spans every column and is inset
 * by the sidebar and TOC widths, so it runs from the sidebar's edge to where
 * the TOC starts even on wide screens, where both are pinned to the screen
 * edges with gutters between them and the page. The widths are 0 wherever
 * those columns are hidden. The sidebar and TOC are sticky against the whole
 * grid, so they stay pinned beside this row rather than scrolling away.
 *
 * `contain: inline-size` keeps the footer from feeding its width into the
 * grid's column sizing. Without it, an item spanning the flexible gutters
 * widens them and squeezes the page column. That's also why the insets sit on
 * the inner element: margins on the footer itself would still count.
 */
export function DocsFooter() {
  return (
    <footer className="col-span-full row-start-4 [contain:inline-size]">
      <div className="ms-(--fd-sidebar-width) me-(--fd-toc-width) bg-[#1348dc] text-white">
        {/* The text keeps the page container's width and padding. The
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
      </div>
    </footer>
  );
}
