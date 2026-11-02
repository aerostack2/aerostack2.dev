import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
import { appName, gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          {/* Same treatment as the brand in the home page footer. */}
          <Image
            src="/logo.png"
            alt=""
            width={24}
            height={24}
            className="rounded-md ring-1 ring-fd-border"
          />
          <span className="font-serif text-xl font-normal">{appName}</span>
        </>
      ),
    },
    // The provider already defaults to `system`; without this the switcher only
    // offers light/dark, so there is no way back to it once a user picks one.
    themeSwitch: {
      mode: "light-dark-system",
    },
    // No `links`: GlassLayout renders them into the sidebar, right under the
    // tab dropdown that already switches between the same root sections.
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
