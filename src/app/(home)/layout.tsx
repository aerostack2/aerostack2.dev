import { HomeLayout } from "fumadocs-ui/layouts/home";
import { HomeNavbar } from "@/components/home/navbar";
import { getRepoStats } from "@/lib/github";
import { baseOptions } from "@/lib/layout.shared";

export default async function Layout({ children }: LayoutProps<"/">) {
  const base = baseOptions();
  const repoStats = await getRepoStats();

  return (
    // `nav.component` replaces Fumadocs' header with ours, which lives in the
    // page's bordered column (src/components/home/navbar.tsx).
    <HomeLayout
      {...base}
      nav={{ ...base.nav, component: <HomeNavbar repoStats={repoStats} /> }}
    >
      {children}
    </HomeLayout>
  );
}
