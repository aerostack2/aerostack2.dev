import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { Callout } from "fumadocs-ui/components/callout";
import {
  CodeBlock,
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  Pre,
} from "fumadocs-ui/components/codeblock";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { CitationCount, CitingPapers } from "./citation-count";
import { BehaviorLifecycle } from "./diagrams/behavior-visuals";
import {
  AlertScale,
  ModeMatrix,
  PlatformInfoCard,
} from "./diagrams/channel-visuals";
import { ControlLoopDiagram } from "./diagrams/control-loop";
import { ControlModeLadder } from "./diagrams/controller-visuals";
import { EstimatorTransforms } from "./diagrams/estimator-visuals";
import { FrameTree } from "./diagrams/frame-tree";
import { LayerDiagram } from "./diagrams/layer-diagram";
import { PlatformStateMachine, ReadyToFly } from "./diagrams/platform-visuals";
import { Figure } from "./figure";
import { Video } from "./video";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // Registered explicitly rather than relying on the default, so the
    // CodeBlock options (allowCopy, keepBackground, icon, viewportProps) are
    // ours to set here. `title`, `lineNumbers`, `tab` and `noCopy` come in
    // through the fence meta string and arrive as props.
    pre: (props: ComponentProps<"pre">) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    CodeBlock,
    Pre,
    CodeBlockTab,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTabsTrigger,
    // Flat, like the bordered cells on the home page.
    Callout: (props: ComponentProps<typeof Callout>) => (
      <Callout {...props} className={cn("shadow-none", props.className)} />
    ),
    Tab,
    Tabs,
    Step,
    Steps,
    Accordion,
    Accordions,
    TypeTable,
    Figure,
    Video,
    LayerDiagram,
    ControlLoopDiagram,
    ModeMatrix,
    PlatformInfoCard,
    AlertScale,
    FrameTree,
    PlatformStateMachine,
    ReadyToFly,
    ControlModeLadder,
    EstimatorTransforms,
    BehaviorLifecycle,
    CitationCount,
    CitingPapers,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
