import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Serif,
  Michroma,
} from "next/font/google";

/**
 * Site fonts, from the IBM Plex family, plus one for a logo. `next/font`
 * downloads them at build time and serves them with the site, so visitors
 * never request them from Google. Each one only sets a CSS variable here;
 * global.css maps the Plex variables to Tailwind's `font-sans`, `font-mono`
 * and `font-serif`.
 */

/** Body text and UI. */
export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-plex-sans",
  display: "swap",
});

/** Code. */
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

/** Display headings. */
export const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-plex-serif",
  display: "swap",
});

/**
 * The multirotor simulator's wordmark (components/home/platform-logo.tsx),
 * wide and aerospace. Not preloaded: browsers fetch a font only when some
 * text uses it, so only pages showing that logo download it.
 */
export const michroma = Michroma({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-michroma",
  display: "swap",
  preload: false,
});

export const fontVariables = [
  plexSans.variable,
  plexMono.variable,
  plexSerif.variable,
  michroma.variable,
].join(" ");
