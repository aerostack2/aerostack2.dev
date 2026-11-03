import Image from "next/image";
import { avatarAt, getPageContributors } from "@/lib/github";

/** Avatars shown before the rest collapse into a "+N" count. */
const MAX_SHOWN = 5;

const AVATAR_CLASS =
  // The ring in the page colour cuts each avatar out of the one beneath it.
  "size-6 rounded-full ring-2 ring-fd-background";

/**
 * The people who wrote a docs page, as a row of overlapping GitHub avatars,
 * each linking to its profile. `path` is the page's file, relative to
 * `content/docs`. Renders nothing when GitHub has no contributors for it.
 */
export async function PageContributors({ path }: { path: string }) {
  const people = await getPageContributors(path);
  if (people.length === 0) return null;

  const shown = people.slice(0, MAX_SHOWN);
  const rest = people.length - shown.length;
  const names = people.map((person) => `@${person.login}`).join(", ");

  return (
    <div className="flex items-center gap-2.5">
      {/* Same label style as the section label at the top of the page. */}
      <span className="font-mono text-xs tracking-widest text-fd-muted-foreground uppercase">
        Authored by
      </span>
      <ul aria-label={names} className="flex items-center -space-x-1.5">
        {shown.map((person) => (
          <li key={person.login} className="flex">
            <a
              href={`https://github.com/${person.login}`}
              target="_blank"
              rel="noreferrer noopener"
              title={`@${person.login}`}
              className="rounded-full transition-transform hover:z-10 hover:-translate-y-0.5"
            >
              <Image
                src={avatarAt(person.avatar, 24)}
                alt={`@${person.login}`}
                width={24}
                height={24}
                className={AVATAR_CLASS}
              />
            </a>
          </li>
        ))}
        {rest > 0 && (
          <li
            title={names}
            className={`${AVATAR_CLASS} flex items-center justify-center bg-fd-muted font-mono text-[0.625rem] text-fd-muted-foreground`}
          >
            +{rest}
          </li>
        )}
      </ul>
    </div>
  );
}
