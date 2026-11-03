import { useMemo } from "react";
import useThemeCheck from "./useThemeCheck";

const read = (style, name) => style.getPropertyValue(name).trim();

/**
 * Chart colors from the design tokens in index.css. Recharts draws SVG with
 * literal colors, so the values are read once per theme instead of using classes.
 */
export default function useChartTheme() {
  const isLight = useThemeCheck();

  return useMemo(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      isLight,
      grid: read(style, "--chart-grid"),
      axis: read(style, "--fg-subtle"),
      text: read(style, "--fg"),
      muted: read(style, "--fg-muted"),
      surface: read(style, "--surface"),
      line: read(style, "--line"),
      brand: read(style, "--brand"),
      up: read(style, "--up"),
      down: read(style, "--down"),
    };
    // isLight is the trigger: the CSS variables change with the theme class
  }, [isLight]);
}
