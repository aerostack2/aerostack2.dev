import type * as PageTree from "fumadocs-core/page-tree";
import { loader } from "fumadocs-core/source";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { applyMdxPreset } from "fumadocs-mdx/config";
import { defineDocs } from "fumadocs-mdx/macro";
import * as lucide from "lucide-react";
import { createElement } from "react";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { docsContentRoute, docsImageRoute, docsRoute } from "./shared";

const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema,
    // A collection-level `mdxOptions` object would drop Fumadocs' own plugins,
    // so extend the preset instead. rehype-katex must run before the syntax
    // highlighter.
    mdxOptions: applyMdxPreset({
      remarkPlugins: (v) => [...v, remarkMath],
      rehypePlugins: (v) => [rehypeKatex, ...v],
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [],
  // Resolves the `icon:` name in page and meta frontmatter to a lucide icon.
  icon(name) {
    if (!name) return;
    // Icons are `forwardRef` objects, not functions, so check membership.
    if (!(name in lucide)) {
      throw new Error(`Unknown lucide icon in frontmatter: ${name}`);
    }
    const Icon = (lucide as unknown as Record<string, lucide.LucideIcon>)[name];
    return createElement(Icon);
  },
});

type Page = (typeof source)["$inferPage"];

function containsUrl(folder: PageTree.Folder, url: string): boolean {
  if (folder.index?.url === url) return true;
  return folder.children.some((node) =>
    node.type === "page"
      ? node.url === url
      : node.type === "folder" && containsUrl(node, url),
  );
}

/** Name of the top-level sidebar section a page belongs to, if any. */
export function getSectionName(url: string): string | undefined {
  for (const node of source.getPageTree().children) {
    if (node.type === "folder" && containsUrl(node, url)) {
      return typeof node.name === "string" ? node.name : undefined;
    }
  }
}

/** True for a section's `index.mdx`, the page its sidebar folder opens. */
function isSectionIndex(page: Page): boolean {
  return page.slugs.length === 1 && page.path.endsWith("index.mdx");
}

/**
 * The page's own name: landing pages are all titled "Overview", so they go by
 * their section's name instead, and the docs root is "Documentation".
 */
export function getPageName(page: Page): string {
  if (page.slugs.length === 0) return "Documentation";
  if (isSectionIndex(page)) return getSectionName(page.url) ?? page.data.title;
  return page.data.title;
}

/**
 * The page's name for the browser tab. Titles repeat across sections
 * ("Motion controller" exists under Concepts, Plugins and ROS 2 Interfaces),
 * so every page below a landing page carries its section after it.
 */
export function getPageTitle(page: Page): string {
  const name = getPageName(page);
  const section = getSectionName(page.url);
  if (!section || isSectionIndex(page)) return name;
  return `${name} – ${section}`;
}

export function getPageImageUrl(page: Page) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url:
      "/" +
      [page.locale, ...docsImageRoute.split("/"), ...segments]
        .filter(Boolean)
        .join("/"),
  };
}

export function getPageMarkdownUrl(page: Page) {
  const segments = [...page.slugs, "content.md"];

  return {
    segments,
    url:
      "/" +
      [page.locale, ...docsContentRoute.split("/"), ...segments]
        .filter(Boolean)
        .join("/"),
  };
}

export async function getLLMText(page: Page) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title} (${page.url})

${processed}`;
}
