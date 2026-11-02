import { ArrowUpRight } from "lucide-react";
import {
  type CitingPaper,
  getCitations,
  getCitingPapers,
} from "@/lib/citations";

/**
 * How many papers cite Aerostack2, from Google Scholar, monthly, linking to
 * the paper's page there. The citing papers are listed under it on the same
 * page.
 */
export async function CitationCount() {
  const { count, link } = await getCitations();
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer noopener"
      className="not-prose group my-6 flex items-center justify-between gap-4 rounded-lg border border-fd-border p-5 transition-colors hover:bg-fd-accent/50"
    >
      <span>
        <span className="block font-serif text-4xl tabular-nums">
          {count.toLocaleString("en-US")}
        </span>
        <span className="mt-1 block font-mono text-xs tracking-widest text-fd-muted-foreground uppercase">
          Citations on Google Scholar
        </span>
      </span>
      <span className="flex items-center gap-1 text-sm text-fd-muted-foreground transition-colors group-hover:text-fd-foreground">
        Open in Scholar
        <ArrowUpRight className="size-4" />
      </span>
    </a>
  );
}

/** Every paper that cites Aerostack2, grouped by year, newest first. */
export async function CitingPapers() {
  const [{ link }, papers] = await Promise.all([
    getCitations(),
    getCitingPapers(),
  ]);

  if (!papers || papers.length === 0) {
    return (
      <p>
        The list couldn't be fetched for this build. It's on{" "}
        <a href={link} target="_blank" rel="noreferrer noopener">
          Google Scholar
        </a>
        .
      </p>
    );
  }

  const years = new Map<string, CitingPaper[]>();
  for (const paper of papers) {
    const year = paper.year ? String(paper.year) : "Undated";
    years.set(year, [...(years.get(year) ?? []), paper]);
  }

  return (
    <>
      {[...years].map(([year, group]) => (
        <section key={year}>
          <h3 id={year.toLowerCase()}>{year}</h3>
          <ol className="not-prose my-4 flex flex-col divide-y divide-fd-border border-y border-fd-border">
            {group.map((paper) => (
              <li
                key={`${paper.title}-${paper.summary}`}
                className="flex items-baseline justify-between gap-6 py-3"
              >
                <span className="min-w-0">
                  {paper.link ? (
                    <a
                      href={paper.link}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-medium underline decoration-fd-primary/30 underline-offset-4 transition-colors hover:decoration-fd-primary"
                    >
                      {paper.title}
                    </a>
                  ) : (
                    <span className="font-medium">{paper.title}</span>
                  )}
                  <span className="mt-1 block text-sm text-fd-muted-foreground">
                    {paper.summary}
                  </span>
                </span>
                {paper.citedBy > 0 && (
                  <span
                    className="shrink-0 font-mono text-xs text-fd-muted-foreground tabular-nums"
                    title="Times this paper is cited"
                  >
                    {paper.citedBy}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}
