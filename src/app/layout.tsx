import type { Metadata } from "next";
import { Provider } from "@/components/provider";
import { fontVariables } from "@/lib/fonts";
import { appDescription, appName, siteUrl } from "@/lib/shared";
import "katex/dist/katex.css";
import "./global.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: appDescription,
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
