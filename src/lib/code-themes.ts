import vitesseDark from "@shikijs/themes/vitesse-dark";
import vitesseLight from "@shikijs/themes/vitesse-light";
import type { ThemeRegistration } from "@shikijs/types";

/**
 * The Vitesse themes, with shell snippets made easier to scan. Vitesse colours
 * every unquoted argument as a string and flags in a nearly identical brown, so
 * a command line reads as one colour. These rules use colours from Vitesse's
 * own palette, and only for shell tokens. Some shell scopes lack the `.shell`
 * suffix, so the rules select by the `source.shell` root instead.
 */
const shellRules = (palette: {
  text: string;
  flag: string;
  variable: string;
}): ThemeRegistration["tokenColors"] => [
  {
    // Subcommands, package names and paths, like `build` or `as2_core`.
    scope: ["source.shell string.unquoted.argument"],
    settings: { foreground: palette.text },
  },
  {
    scope: ["source.shell constant.other.option"],
    settings: { foreground: palette.flag },
  },
  {
    // `$HOME` and friends, also inside quoted strings.
    scope: [
      "source.shell variable.other",
      "source.shell punctuation.definition.variable",
    ],
    settings: { foreground: palette.variable },
  },
];

function extend(
  theme: ThemeRegistration,
  name: string,
  rules: ThemeRegistration["tokenColors"],
): ThemeRegistration {
  return {
    ...theme,
    name,
    tokenColors: [...(theme.tokenColors ?? []), ...(rules ?? [])],
  };
}

export const codeThemes = {
  light: extend(
    vitesseLight as ThemeRegistration,
    "aerostack2-light",
    shellRules({ text: "#393a34", flag: "#2f798a", variable: "#b07d48" }),
  ),
  dark: extend(
    vitesseDark as ThemeRegistration,
    "aerostack2-dark",
    shellRules({ text: "#dbd7caee", flag: "#4c9a91", variable: "#bd976a" }),
  ),
};
