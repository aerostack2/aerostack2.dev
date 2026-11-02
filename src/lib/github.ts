import { projectRepo } from "@/lib/shared";

/**
 * GitHub data for the home page, refreshed once a day: the repository's
 * star and fork counts (the navbar's GitHub card and the community section),
 * and the people behind the project (components/home/community.tsx).
 *
 * The maintainers are the code owners in the main repository's
 * .github/CODEOWNERS, plus Miguel Fernandez-Cortizas, who isn't listed there.
 * Names come from their GitHub profiles, or from the citation when a profile
 * has none.
 */
export const maintainers = [
  { login: "miferco97", name: "Miguel Fernandez-Cortizas" },
  { login: "RPS98", name: "Rafael Perez-Segui" },
  { login: "pariaspe", name: "Pedro Arias-Perez" },
  { login: "alvgaona", name: "Alvaro Gaona" },
  { login: "fjanguita", name: "Francisco Anguita" },
  { login: "rdasilva01", name: "Rodrigo Da Silva" },
  { login: "GPatiA2", name: "Guillermo García Patiño" },
];

/** Star and fork counts of the main repository. */
export interface RepoStats {
  stars: number;
  forks: number;
}

export type Contributor = {
  login: string;
  avatar: string;
  contributions: number;
};

export type Community = {
  contributors: Contributor[];
  repos: number;
};

/** Shared accounts and automation, which aren't people to credit. */
const skip = new Set(["cvar-developers"]);

type GitHubRepo = { name: string; fork: boolean; archived: boolean };
type GitHubContributor = {
  login: string;
  avatar_url: string;
  contributions: number;
  type: string;
};

async function github<T>(path: string): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  // Cached for a day. In production that's how often the home page refreshes
  // it, and in dev it saves asking GitHub again on every reload.
  const response = await fetch(`https://api.github.com/${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    next: { revalidate: 86400 },
  });
  if (!response.ok) throw new Error(`GitHub ${path}: ${response.status}`);
  return response.json();
}

/**
 * The main repository's star and fork counts. On any failure it gives back
 * null and the counts are left out.
 */
export async function getRepoStats(): Promise<RepoStats | null> {
  try {
    const data = await github<{
      stargazers_count: number;
      forks_count: number;
    }>(`repos/${projectRepo.owner}/${projectRepo.repo}`);
    return { stars: data.stargazers_count, forks: data.forks_count };
  } catch {
    return null;
  }
}

/**
 * Everyone who has contributed to the organization's active repositories,
 * forks and archived ones left out, with their contributions summed across
 * repositories and the most active first.
 *
 * It makes one request per repository, about fifty, so it needs
 * `GITHUB_TOKEN` to stay under the rate limit. On any failure it gives back
 * nothing and the section leaves the contributors out.
 */
export async function getCommunity(): Promise<Community> {
  try {
    const repos = (
      await github<GitHubRepo[]>(`orgs/${projectRepo.owner}/repos?per_page=100`)
    ).filter((repo) => !repo.fork && !repo.archived);
    const lists = await Promise.all(
      repos.map((repo) =>
        github<GitHubContributor[]>(
          `repos/${projectRepo.owner}/${repo.name}/contributors?per_page=100`,
        ).catch(() => []),
      ),
    );
    const people = new Map<string, Contributor>();
    for (const person of lists.flat()) {
      if (person.type !== "User" || skip.has(person.login)) continue;
      const seen = people.get(person.login);
      if (seen) seen.contributions += person.contributions;
      else
        people.set(person.login, {
          login: person.login,
          avatar: person.avatar_url,
          contributions: person.contributions,
        });
    }
    return {
      contributors: [...people.values()].sort(
        (a, b) => b.contributions - a.contributions,
      ),
      repos: repos.length,
    };
  } catch {
    return { contributors: [], repos: 0 };
  }
}

/** A GitHub avatar at `size` pixels, doubled for sharp screens. */
export const avatarAt = (url: string, size: number) =>
  `${url}${url.includes("?") ? "&" : "?"}s=${size * 2}`;
