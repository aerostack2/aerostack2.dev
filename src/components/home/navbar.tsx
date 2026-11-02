"use client";

import { useSearchContext } from "fumadocs-ui/contexts/search";
import { ArrowRight, Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/cn";
import { appName, news } from "@/lib/shared";
import { mobileSections, NavMenus, type RepoStats } from "./nav-menus";

/**
 * Single-key shortcuts, shown as key caps next to the links they open. They
 * only fire when nothing else wants the key: no modifier held and no text
 * field focused.
 */
const shortcuts: Record<string, string> = {
  d: "/docs",
  g: "/docs/getting-started",
};

function Kbd({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center gap-0.5 rounded-sm border border-fd-border bg-fd-muted/50 px-1 font-mono text-[0.6875rem] leading-none text-fd-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

/** Small diamond where the column lines cross a horizontal rule. */
function Diamond({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute -bottom-[4.5px] z-10 size-2 rotate-45 border border-fd-border bg-fd-background",
        className,
      )}
    />
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px bg-fd-border" />;
}

function useShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target?.closest("input, textarea, select, [role='dialog']")
      ) {
        return;
      }
      const href = shortcuts[event.key.toLowerCase()];
      if (href) {
        event.preventDefault();
        router.push(href);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);
}

/**
 * Home page navbar. It sits inside the page's bordered column, so the
 * column's side lines run through it, with a diamond where they cross its
 * bottom rule. Below it, an optional news strip set in `news` (lib/shared).
 */
export function HomeNavbar({ repoStats }: { repoStats: RepoStats | null }) {
  const { enabled: searchEnabled, hotKey, setOpenSearch } = useSearchContext();
  const [open, setOpen] = useState(false);
  useShortcuts();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-fd-border bg-fd-background/80 backdrop-blur-lg">
        <div className="px-4 sm:px-6">
          <nav
            aria-label="Main"
            className="relative mx-auto flex h-14 max-w-[1280px] items-center gap-1 border-x border-fd-border px-3 sm:px-5"
          >
            <Diamond className="-left-[4.5px]" />
            <Diamond className="-right-[4.5px]" />

            <Link href="/" className="me-4 flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt=""
                width={24}
                height={24}
                className="rounded-md ring-1 ring-fd-border"
              />
              <span className="font-serif text-xl">{appName}</span>
            </Link>

            <NavMenus repoStats={repoStats} />

            <div className="ms-auto flex items-center gap-1.5">
              {searchEnabled && (
                <button
                  type="button"
                  onClick={() => setOpenSearch(true)}
                  aria-label="Search"
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
                >
                  <Search className="size-4" />
                  <Kbd className="max-sm:hidden">
                    {hotKey.map((key, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: fixed list
                      <span key={i}>{key.display}</span>
                    ))}
                  </Kbd>
                </button>
              )}
              <ThemeToggle className="me-0" />

              <span className="hidden items-center md:flex">
                <Divider />
              </span>

              <Link
                href="/docs"
                className="hidden items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-fd-accent md:flex"
              >
                Docs
                <Kbd>D</Kbd>
              </Link>
              <Link
                href="/docs/getting-started"
                className="button button-primary h-8 gap-2.5 ps-3 pe-1.5 max-sm:hidden"
              >
                Get started
                <Kbd className="border-white/30 bg-white/10 text-white">G</Kbd>
              </Link>

              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                className="-me-1 rounded-sm p-1.5 transition-colors hover:bg-fd-accent lg:hidden"
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </nav>
        </div>

        {open && (
          <div className="border-t border-fd-border px-4 sm:px-6 lg:hidden">
            <div className="mx-auto grid max-h-[70vh] max-w-[1280px] gap-5 overflow-y-auto border-x border-fd-border p-4 text-sm sm:grid-cols-2 sm:px-6 md:grid-cols-4">
              {mobileSections.map((section) => (
                <div key={section.title}>
                  <p className="mb-1.5 px-2 font-mono text-[0.6875rem] tracking-widest text-fd-muted-foreground uppercase">
                    {section.title}
                  </p>
                  <ul>
                    {section.links.map((link) => (
                      <li key={link.href + link.text}>
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-sm px-2 py-1.5 transition-colors hover:bg-fd-accent"
                        >
                          {link.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex flex-wrap gap-2 sm:col-span-2 md:col-span-4">
                <Link
                  href="/docs/getting-started"
                  onClick={() => setOpen(false)}
                  className="button button-primary h-9 px-4"
                >
                  Get started
                </Link>
                <Link
                  href="/docs"
                  onClick={() => setOpen(false)}
                  className="button button-secondary h-9 px-4"
                >
                  Docs
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {news && (
        <div className="border-b border-fd-border px-4 sm:px-6">
          <div className="relative mx-auto max-w-[1280px] border-x border-fd-border bg-[linear-gradient(to_right,transparent,color-mix(in_oklab,var(--color-fd-primary)_7%,transparent),transparent)]">
            <Diamond className="-left-[4.5px]" />
            <Diamond className="-right-[4.5px]" />
            <Link
              href={news.href}
              className="group flex items-center justify-center gap-2 px-4 py-2.5 text-center font-serif text-[0.9375rem]"
            >
              <span className="text-fd-primary">News</span>
              <span>{news.text}</span>
              <ArrowRight className="size-3.5 shrink-0 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
