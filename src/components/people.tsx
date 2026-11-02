import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import {
  avatarAt,
  getReviews,
  maintainers,
  reviewsDiscussion,
} from "@/lib/github";

const link = "noreferrer noopener";

/** The core maintainers, with their GitHub avatars. */
export function Maintainers() {
  return (
    <ul className="not-prose my-6 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-fd-border bg-fd-border sm:grid-cols-2">
      {maintainers.map((person) => (
        <li key={person.login} className="bg-fd-background">
          <a
            href={`https://github.com/${person.login}`}
            target="_blank"
            rel={link}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-fd-accent/50"
          >
            <Image
              src={`https://github.com/${person.login}.png?size=64`}
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-md ring-1 ring-fd-border"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium">{person.name}</span>
              <span className="block font-mono text-xs text-fd-muted-foreground">
                @{person.login}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * The user reviews, from the comments on a GitHub discussion, refreshed once
 * a day (lib/github.ts). When they can't be fetched, only the link to the
 * discussion is left.
 */
export async function UserReviews() {
  const reviews = await getReviews();

  return (
    <>
      {reviews && reviews.length > 0 ? (
        <div className="not-prose my-6 grid gap-4">
          {reviews.map((review) => (
            <figure
              key={review.url}
              className="rounded-lg border border-fd-border p-5"
            >
              <blockquote className="flex flex-col gap-3 text-[0.9375rem] leading-relaxed">
                {review.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <Image
                  src={avatarAt(review.avatar, 28)}
                  alt=""
                  width={28}
                  height={28}
                  className="size-7 rounded-md ring-1 ring-fd-border"
                />
                <a
                  href={review.profile}
                  target="_blank"
                  rel={link}
                  className="text-sm transition-colors hover:text-fd-primary"
                >
                  {review.name ?? `@${review.login}`}
                  {review.name && (
                    <span className="ml-1.5 font-mono text-xs text-fd-muted-foreground">
                      @{review.login}
                    </span>
                  )}
                </a>
                <a
                  href={review.url}
                  target="_blank"
                  rel={link}
                  className="ml-auto font-mono text-xs text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                >
                  {new Date(review.date).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p>
          The reviews couldn't be fetched just now. Read them on{" "}
          <a href={reviewsDiscussion.url} target="_blank" rel={link}>
            GitHub
          </a>
          .
        </p>
      )}

      <a
        href={reviewsDiscussion.url}
        target="_blank"
        rel={link}
        className="not-prose group my-6 flex items-center justify-between gap-4 rounded-lg border border-fd-border p-5 transition-colors hover:bg-fd-accent/50"
      >
        <span>
          <span className="block font-medium">Used Aerostack2?</span>
          <span className="mt-1 block text-sm text-fd-muted-foreground">
            Leave your review as a comment on the GitHub discussion.
          </span>
        </span>
        <ArrowUpRight className="size-4 shrink-0 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground" />
      </a>
    </>
  );
}
