import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx";
import { PageContributors } from "@/components/page-contributors";
import { gitConfig } from "@/lib/shared";
import {
  getPageImageUrl,
  getPageMarkdownUrl,
  getPageTitle,
  getSectionName,
  source,
} from "@/lib/source";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const section = getSectionName(page.url);
  // Formatted here rather than with `PageLastUpdate`, which formats in the
  // browser's locale after hydration. UTC keeps the day the same everywhere.
  const lastUpdated = page.data.lastModified?.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const lastUpdatedNote = lastUpdated && (
    <p className="text-xs text-fd-muted-foreground">
      Last updated on {lastUpdated}
    </p>
  );

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      // Ruled off under the TOC entries, like the sidebar's footer.
      tableOfContent={{
        footer: lastUpdatedNote && (
          <div className="mt-2 border-t border-fd-border pt-3">
            {lastUpdatedNote}
          </div>
        ),
      }}
    >
      {/* Same label style as the home page's section labels. */}
      <p className="flex items-center gap-3 font-mono text-xs tracking-widest text-fd-muted-foreground uppercase">
        <span className="text-fd-primary">Docs</span>
        {section && (
          <>
            <span className="h-px w-6 bg-fd-border" />
            {section}
          </>
        )}
      </p>
      <DocsTitle className="font-serif text-3xl leading-[1.1] font-normal tracking-[-0.02em] sm:text-[2.5rem]">
        {page.data.title}
      </DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b border-dashed pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
        {/* `ms-auto` pushes the contributors to the far end of the row. */}
        <div className="ms-auto">
          <PageContributors path={page.path} />
        </div>
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
      {/* The TOC is hidden below `xl`, so the date falls back to the foot of
          the page there. */}
      {lastUpdatedNote && <div className="xl:hidden">{lastUpdatedNote}</div>}
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: getPageTitle(page),
    description: page.data.description,
    openGraph: {
      images: getPageImageUrl(page).url,
    },
  };
}
