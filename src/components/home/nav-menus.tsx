"use client";

import { NavigationMenu } from "@base-ui/react/navigation-menu";
import {
  ArrowRight,
  Boxes,
  ChevronDown,
  CircleDot,
  FlaskConical,
  Gamepad2,
  GitFork,
  Hammer,
  Layers,
  MessagesSquare,
  Network,
  Puzzle,
  Quote,
  Rocket,
  Route,
  Star,
  Tag,
  Terminal,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { RepoStats } from "@/lib/github";
import { platforms } from "@/lib/platforms";
import { projectRepo } from "@/lib/shared";
import { PlatformLogo } from "./platform-logo";

interface MenuItem {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
}

const learn: MenuItem[] = [
  {
    icon: <Rocket />,
    title: "Getting started",
    description: "What Aerostack2 is, what you need and where to start.",
    href: "/docs/getting-started",
  },
  {
    icon: <Layers />,
    title: "Concepts",
    description: "The ideas behind Aerostack2, in reading order.",
    href: "/docs/concepts",
  },
  {
    icon: <Boxes />,
    title: "Examples",
    description: "Ready-to-run projects for Gazebo, Crazyflie, DJI and more.",
    href: "/docs/examples",
  },
  {
    icon: <Workflow />,
    title: "Behaviors",
    description: "Take off, land, follow paths, avoid obstacles and more.",
    href: "/docs/concepts/behaviors",
  },
];

const build: MenuItem[] = [
  {
    icon: <Hammer />,
    title: "Develop",
    description:
      "Set up the code, then build a platform, a behavior or a plugin.",
    href: "/docs/develop",
  },
  {
    icon: <Puzzle />,
    title: "Plugins",
    description: "Every plugin that ships with Aerostack2.",
    href: "/docs/plugins",
  },
  {
    icon: <Terminal />,
    title: "CLI",
    description: "Build, test and move around a source workspace.",
    href: "/docs/cli",
  },
  {
    icon: <Route />,
    title: "Missions",
    description: "Python, behavior trees and the mission interpreter.",
    href: "/docs/concepts/missions",
  },
  {
    icon: <Network />,
    title: "ROS 2 interfaces",
    description: "The topics, services and actions components talk over.",
    href: "/docs/ros2-interfaces",
  },
  {
    icon: <Gamepad2 />,
    title: "User interfaces",
    description: "Keyboard teleoperation and the alphanumeric viewer.",
    href: "/docs/user-interfaces",
  },
];

const repoName = `${projectRepo.owner}/${projectRepo.repo}`;
const githubUrl = `https://github.com/${repoName}`;

const resources: MenuItem[] = [
  {
    icon: <MessagesSquare />,
    title: "Discussions",
    description: "Ask questions and share what you build.",
    href: `${githubUrl}/discussions`,
  },
  {
    icon: <CircleDot />,
    title: "Issues",
    description: "Report a bug or ask for a feature.",
    href: `${githubUrl}/issues`,
  },
  {
    icon: <Tag />,
    title: "Releases",
    description: "What changed in each version.",
    href: `${githubUrl}/releases`,
  },
  {
    icon: <Quote />,
    title: "Citations",
    description: "The papers to cite when you use Aerostack2.",
    href: "/docs/about/citations",
  },
  {
    icon: <FlaskConical />,
    title: "Projects",
    description: "Projects built on Aerostack2.",
    href: "/docs/projects",
  },
];

export type { RepoStats };

function formatCount(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
}

/** GitHub's mark, from Simple Icons. */
function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/**
 * A link inside a menu. Closes the menu when followed. Links off the site
 * open in a new tab.
 */
function MenuLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <NavigationMenu.Link
      {...(href.startsWith("http")
        ? { href, target: "_blank", rel: "noopener noreferrer" }
        : { render: <Link href={href} /> })}
      className={cn(
        "outline-none focus-visible:ring-2 focus-visible:ring-fd-ring",
        className,
      )}
    >
      {children}
    </NavigationMenu.Link>
  );
}

function ItemRow({ item }: { item: MenuItem }) {
  return (
    <MenuLink
      href={item.href}
      className="group flex gap-3 rounded-md p-2.5 transition-colors hover:bg-fd-accent"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-fd-border bg-fd-background text-fd-muted-foreground transition-colors group-hover:text-fd-primary [&_svg]:size-4">
        {item.icon}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{item.title}</span>
        <span className="text-xs leading-snug text-fd-muted-foreground">
          {item.description}
        </span>
      </span>
    </MenuLink>
  );
}

function Trigger({ children }: { children: ReactNode }) {
  return (
    <NavigationMenu.Trigger className="flex items-center gap-1 rounded-sm px-2.5 py-1.5 text-sm transition-colors outline-none hover:bg-fd-accent focus-visible:ring-2 focus-visible:ring-fd-ring data-[popup-open]:bg-fd-accent">
      {children}
      <NavigationMenu.Icon className="text-fd-muted-foreground transition-transform duration-200 data-[popup-open]:rotate-180">
        <ChevronDown className="size-3.5" />
      </NavigationMenu.Icon>
    </NavigationMenu.Trigger>
  );
}

/**
 * Each menu's panel slides in from the side the pointer came from, while the
 * popup around it resizes and moves to the new trigger.
 */
const contentClass =
  "h-full transition-[opacity,translate] duration-(--duration) ease-(--easing)" +
  " data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" +
  " data-[starting-style]:data-[activation-direction=left]:-translate-x-1/3" +
  " data-[starting-style]:data-[activation-direction=right]:translate-x-1/3" +
  " data-[ending-style]:data-[activation-direction=left]:translate-x-1/3" +
  " data-[ending-style]:data-[activation-direction=right]:-translate-x-1/3";

/** The Learn, Platforms, Build and Resources dropdowns. */
export function NavMenus({ repoStats }: { repoStats: RepoStats | null }) {
  return (
    <NavigationMenu.Root className="hidden lg:block" delay={80}>
      <NavigationMenu.List className="flex items-center gap-1">
        <NavigationMenu.Item>
          <Trigger>Learn</Trigger>
          <NavigationMenu.Content className={contentClass}>
            <div className="grid w-[600px] grid-cols-[210px_1fr] gap-2 p-2">
              <MenuLink
                href="/docs/getting-started/quickstart"
                className="group relative flex flex-col justify-end overflow-hidden rounded-md bg-[#1348dc] p-5 text-white"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.28),transparent_55%)]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px]"
                />
                <span className="relative font-mono text-[0.6875rem] tracking-widest text-white/70 uppercase">
                  Quickstart
                </span>
                <span className="relative mt-2 font-serif text-xl leading-tight">
                  Fly your first mission
                </span>
                <span className="relative mt-2 text-xs text-white/80">
                  In the multirotor simulator. No drone needed.
                </span>
                <ArrowRight className="relative mt-4 size-4 transition-transform group-hover:translate-x-1" />
              </MenuLink>
              <div className="flex flex-col">
                {learn.map((item) => (
                  <ItemRow key={item.href} item={item} />
                ))}
              </div>
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <Trigger>Platforms</Trigger>
          <NavigationMenu.Content className={contentClass}>
            <div className="w-[680px] p-2">
              <div className="grid grid-cols-4 gap-px overflow-hidden rounded-md border border-fd-border bg-fd-border">
                {platforms.map((platform) => (
                  <MenuLink
                    key={platform.href}
                    href={platform.href}
                    className="group flex h-32 flex-col justify-between bg-fd-popover p-3 transition-colors hover:bg-fd-accent"
                  >
                    <span className="flex h-8 items-center text-fd-muted-foreground transition-colors group-hover:text-fd-foreground">
                      <PlatformLogo platform={platform} scale={0.7} />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium">
                        {platform.name}
                      </span>
                      <span className="text-[0.6875rem] leading-snug text-fd-muted-foreground">
                        {platform.description}
                      </span>
                    </span>
                  </MenuLink>
                ))}
              </div>
              <div className="flex items-center justify-between px-1.5 pt-2.5 pb-1 text-xs">
                <MenuLink
                  href="/docs/aerial-platforms"
                  className="group flex items-center gap-1 font-medium"
                >
                  All platforms
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </MenuLink>
                <MenuLink
                  href="/docs/develop/aerial-platform"
                  className="group flex items-center gap-1 text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                >
                  Your drone isn't listed? Write a platform
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </MenuLink>
              </div>
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <Trigger>Build</Trigger>
          <NavigationMenu.Content className={contentClass}>
            <div className="grid w-[600px] grid-cols-2 gap-1 p-2">
              {build.map((item) => (
                <ItemRow key={item.href} item={item} />
              ))}
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <Trigger>Resources</Trigger>
          <NavigationMenu.Content className={contentClass}>
            <div className="grid w-[600px] grid-cols-[210px_1fr] gap-2 p-2">
              <MenuLink
                href={githubUrl}
                className="group relative flex flex-col overflow-hidden rounded-md border border-white/10 bg-neutral-950 p-5 text-white"
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-16 -right-16 size-48 rounded-full bg-[#1348dc] opacity-40 blur-3xl transition-opacity group-hover:opacity-60"
                />
                <GitHubMark className="relative size-7" />
                <span className="relative mt-auto pt-8 font-mono text-[0.6875rem] tracking-wide text-white/60">
                  {repoName}
                </span>
                <span className="relative mt-1.5 font-serif text-xl leading-tight">
                  Open source on GitHub
                </span>
                {repoStats && (
                  <span className="relative mt-3 flex items-center gap-4 text-xs text-white/80">
                    <span className="flex items-center gap-1.5">
                      <Star className="size-3.5" />
                      {formatCount(repoStats.stars)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GitFork className="size-3.5" />
                      {formatCount(repoStats.forks)}
                    </span>
                  </span>
                )}
              </MenuLink>
              <div className="flex flex-col">
                {resources.map((item) => (
                  <ItemRow key={item.href} item={item} />
                ))}
              </div>
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner
          sideOffset={10}
          collisionPadding={{ top: 5, bottom: 5, left: 16, right: 16 }}
          className="z-50 box-border h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-(--duration) ease-(--easing) before:absolute before:inset-x-0 before:-top-2.5 before:h-2.5 before:content-[''] data-[instant]:transition-none"
          style={
            {
              "--duration": "0.35s",
              "--easing": "cubic-bezier(0.22, 1, 0.36, 1)",
            } as CSSProperties
          }
        >
          <NavigationMenu.Popup className="relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-lg border border-fd-border bg-fd-popover text-fd-popover-foreground shadow-2xl shadow-black/15 transition-[opacity,scale,width,height] duration-(--duration) ease-(--easing) data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:duration-150 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <NavigationMenu.Viewport className="relative size-full overflow-hidden" />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

/** Menu sections, reused by the navbar's mobile panel. */
export const mobileSections = [
  {
    title: "Learn",
    links: [
      { text: "Quickstart", href: "/docs/getting-started/quickstart" },
      ...learn.map((item) => ({ text: item.title, href: item.href })),
    ],
  },
  {
    title: "Platforms",
    links: [
      { text: "All platforms", href: "/docs/aerial-platforms" },
      ...platforms.map((p) => ({ text: p.name, href: p.href })),
    ],
  },
  {
    title: "Build",
    links: build.map((item) => ({ text: item.title, href: item.href })),
  },
  {
    title: "Resources",
    links: [
      { text: "GitHub", href: githubUrl },
      ...resources.map((item) => ({ text: item.title, href: item.href })),
    ],
  },
];
