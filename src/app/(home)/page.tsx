import { highlight } from "fumadocs-core/highlight";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Community } from "@/components/home/community";
import { EditorWindow } from "@/components/home/editor-window";
import { HomeFooter } from "@/components/home/footer";
import {
  Cells,
  Eyebrow,
  Frame,
  Heading,
  Row,
  TextLink,
} from "@/components/home/frame";
import { HeroArt } from "@/components/home/hero/hero-art";
import { LineFigure, type LineFigureName } from "@/components/home/line-figure";
import { PlatformLogo } from "@/components/home/platform-logo";
import { cn } from "@/lib/cn";
import { platforms } from "@/lib/platforms";
import { appName, projectRepo } from "@/lib/shared";

const githubUrl = `https://github.com/${projectRepo.owner}/${projectRepo.repo}`;

/**
 * Each feature carries a line figure (components/home/line-figure) that
 * answers the pointer. The pairing is by meaning: keyboard teleoperation, a
 * swarm taking off round its leader, an onboard computer, a tree of swappable
 * packages, a 3D world, and ROS 2 messages hopping between nodes.
 */
const features: {
  figure: LineFigureName;
  label: string;
  title: string;
  body: string;
}[] = [
  {
    figure: "keyboard",
    label: "A keyboard whose keys sink under the pointer",
    title: "Teleoperation to autonomy",
    body: "Fly manually, or build systems that carry out aerial missions without an operator.",
  },
  {
    figure: "swarm",
    label:
      "A nano quadrotor hovering alone while four more wait on their pads; the pointer brings them up into formation round it",
    title: "Single robot or swarm",
    body: "Validated flying several heterogeneous drones at once, indoors and outdoors.",
  },
  {
    figure: "jetson",
    label:
      "A Jetson Orin NX developer kit; the pointer lifts the heatsink off its compute module and spins up the fan",
    title: "Hardware independent",
    body: "Runs on laptops and onboard computers, across DJI, Pixhawk, Crazyflie and more.",
  },
  {
    figure: "rebuild",
    label: "A tree of packages that rise with the one under the pointer",
    title: "Fully modular",
    body: "A plugin architecture lets every component be swapped without touching the rest.",
  },
  {
    figure: "terrain",
    label: "A field of pillars that rise around the pointer",
    title: "Simulation first",
    body: "The multirotor simulator starts in a second and runs anywhere, macOS included. Move to Gazebo for cameras, lidars and 3D worlds.",
  },
  {
    figure: "relay",
    label: "A hub whose links light up hop by hop toward the pointer",
    title: "Built on ROS 2",
    body: "Every component is a ROS 2 node talking over standard topics, services and actions, on Humble and Jazzy.",
  },
];

const stats = [
  { value: "9", label: "Aerial platforms, from simulators to DJI drones" },
  { value: "3", label: "Ways to write a mission" },
  { value: "2", label: "ROS 2 distributions, Humble and Jazzy" },
  { value: "4", label: "Ways to install, macOS included" },
];

const missionWays = [
  ["Python API", "Most missions, anything with logic or loops"],
  ["Behavior trees", "Reactive missions that wait for events"],
  ["Mission interpreter", "Plans sent at run time"],
];

const nextSteps = [
  {
    label: "Guide",
    title: "Develop guide",
    body: "Write your own packages, plugins and behaviors.",
    href: "/docs/develop-guide",
  },
  {
    label: "Tutorials",
    title: "Tutorials",
    body: "Build a platform, a behavior, or a controller or estimator plugin step by step.",
    href: "/docs/tutorials",
  },
  {
    label: "Guide",
    title: "Missions",
    body: "Write a mission in Python, as a behavior tree or as JSON.",
    href: "/docs/concepts/missions",
  },
];

const installCode = `sudo apt install ros-humble-aerostack2
git clone https://github.com/aerostack2/project_as2_multirotor_simulator.git
cd project_as2_multirotor_simulator
./launch_as2.bash`;

async function Terminal({ code }: { code: string }) {
  const rendered = await highlight(code, {
    lang: "bash",
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
    components: { pre: (props) => <Pre {...props} /> },
  });

  return (
    <CodeBlock title="Terminal" className="my-0 shadow-sm">
      {rendered}
    </CodeBlock>
  );
}

function Button({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: "primary" | "secondary";
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      // Styles are in global.css, under "Buttons".
      className={cn(
        "button h-10 min-w-36 px-5",
        variant === "primary" ? "button-primary" : "button-secondary",
      )}
    >
      {children}
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Frame>
        <Row>
          <div className="flex flex-col items-center px-6 pt-20 pb-12 text-center sm:pt-28">
            <p className="font-mono text-xs tracking-widest text-fd-muted-foreground uppercase">
              Open source · ROS 2 · Multi-robot
            </p>
            <Heading
              as="h1"
              className="mt-6 max-w-4xl text-5xl leading-[1.02] sm:text-7xl"
            >
              Build and fly aerial robots on ROS 2.
            </Heading>
            <p className="mt-6 max-w-xl text-lg text-balance text-fd-muted-foreground">
              {appName} is an open source framework for multi-robot aerial
              systems. Write a mission once, test it in simulation and fly it on
              real drones.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button href="/docs/getting-started">
                <Image
                  src="/logo.png"
                  alt=""
                  width={18}
                  height={18}
                  className="rounded-[4px]"
                />
                Get started
              </Button>
              <Button href="/docs" variant="secondary">
                Read the docs
              </Button>
            </div>
          </div>
          <HeroArt />
        </Row>

        <Row corners>
          <div className="flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:px-8">
            <p className="font-mono text-xs tracking-widest uppercase">
              One stack, every drone
            </p>
            <p className="text-sm text-fd-muted-foreground">
              Change the platform, keep the mission.
            </p>
          </div>
          <Cells className="grid-cols-2 border-t border-dashed border-fd-border sm:grid-cols-4">
            {platforms.map((platform) => (
              <Link
                key={platform.name}
                href={platform.href}
                className="group relative flex h-24 items-center justify-center overflow-hidden px-4 sm:h-28"
              >
                <span className="text-fd-muted-foreground transition duration-300 group-hover:-translate-y-2 group-hover:opacity-0">
                  <PlatformLogo platform={platform} />
                </span>
                <span className="absolute inset-0 flex translate-y-2 items-center justify-center gap-1 text-sm font-medium opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  Read the guide
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
            ))}
          </Cells>
        </Row>

        <Row corners>
          <Cells className="lg:grid-cols-[5fr_7fr]">
            <div className="flex flex-col p-6 sm:p-12">
              <Eyebrow index="01">Missions</Eyebrow>
              <Heading className="mt-6">Write the mission once.</Heading>
              <p className="mt-5 text-fd-muted-foreground">
                Take off, go to, follow a path and land are behaviors every
                drone understands. Call them from Python, a behavior tree or a
                JSON plan, and the same mission flies in simulation and on
                hardware.
              </p>
              <ul className="mt-8 border-t border-dashed border-fd-border text-sm">
                {missionWays.map(([name, body]) => (
                  <li
                    key={name}
                    className="flex flex-col gap-0.5 border-b border-dashed border-fd-border py-3 sm:flex-row sm:justify-between sm:gap-4"
                  >
                    <span className="font-medium">{name}</span>
                    <span className="text-fd-muted-foreground sm:text-end">
                      {body}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <TextLink href="/docs/concepts/missions">
                  How missions work
                </TextLink>
              </div>
            </div>
            <div className="home-hatch flex items-center p-4 sm:p-10">
              <EditorWindow className="w-full" />
            </div>
          </Cells>
        </Row>

        <Row corners>
          <div className="grid gap-6 px-6 pt-12 pb-10 sm:px-12 lg:grid-cols-2 lg:gap-12">
            <div>
              <Eyebrow index="02">Architecture</Eyebrow>
              <Heading className="mt-6">
                From one drone to a swarm, without rewriting the stack.
              </Heading>
            </div>
            <p className="self-end text-fd-muted-foreground">
              {appName} splits an aerial system into platforms, state
              estimators, motion controllers and behaviors. Each is a plugin, so
              you replace one piece and keep the rest.
            </p>
          </div>
          <Cells className="border-t border-dashed border-fd-border sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col">
                <div className="border-b border-dashed border-fd-border px-10 pt-4">
                  <LineFigure
                    name={feature.figure}
                    label={feature.label}
                    className="mx-auto max-w-[280px]"
                  />
                </div>
                <div className="p-6 sm:p-8">
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="mt-2 text-sm text-fd-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              </div>
            ))}
          </Cells>
        </Row>

        <Row corners>
          <Cells className="lg:grid-cols-2">
            <div className="flex flex-col p-6 sm:p-12">
              <Eyebrow index="03">Installation</Eyebrow>
              <Heading className="mt-6">Airborne in minutes.</Heading>
              <p className="mt-5 text-fd-muted-foreground">
                Install the binary packages for ROS 2 Humble, or build from
                source for Humble and Jazzy. Docker and Pixi work too, so you
                can try it without touching your system.
              </p>
              <div className="mt-8">
                <Terminal code={installCode} />
              </div>
              <div className="mt-8">
                <TextLink href="/docs/getting-started/quickstart">
                  Follow the quickstart
                </TextLink>
              </div>
            </div>
            <Cells className="grid-cols-2 bg-fd-border!">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col justify-end p-6 sm:p-10"
                >
                  <p className="font-serif text-6xl tracking-[-0.03em] sm:text-7xl">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-sm text-fd-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </Cells>
          </Cells>
        </Row>

        <Row corners>
          <Cells className="md:grid-cols-3">
            {nextSteps.map((step) => (
              <Link
                key={step.title}
                href={step.href}
                className="group flex flex-col p-6 transition-colors hover:bg-fd-card! sm:p-8"
              >
                <span className="font-mono text-xs tracking-widest text-fd-muted-foreground uppercase">
                  {step.label}
                </span>
                <span className="mt-8 flex items-center gap-1 font-serif text-2xl">
                  {step.title}
                  <ArrowUpRight className="size-5 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fd-foreground" />
                </span>
                <span className="mt-2 text-sm text-fd-muted-foreground">
                  {step.body}
                </span>
              </Link>
            ))}
          </Cells>
        </Row>

        <Community />

        <Row corners>
          <Cells className="lg:grid-cols-[2fr_1fr]">
            <div className="p-6 sm:p-12">
              <Heading className="sm:text-5xl">Ready for takeoff?</Heading>
              <p className="mt-4 max-w-md text-fd-muted-foreground">
                Install {appName} and fly your first mission in the multirotor
                simulator. No drone needed.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/docs/getting-started">Get started</Button>
                <Button href={githubUrl} variant="secondary">
                  Star on GitHub
                </Button>
              </div>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-12">
              <p className="font-serif text-xl">Using {appName} in research?</p>
              <p className="mt-2 text-sm text-fd-muted-foreground">
                Find the papers to cite and the projects built on it.
              </p>
              <div className="mt-5 flex flex-col items-start gap-2">
                <TextLink href="/docs/about/citations">Citations</TextLink>
                <TextLink href="/docs/projects">Projects</TextLink>
              </div>
            </div>
          </Cells>
        </Row>
      </Frame>
      <HomeFooter />
    </main>
  );
}
