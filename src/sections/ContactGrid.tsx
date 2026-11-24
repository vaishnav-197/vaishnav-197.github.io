import { useEffect, useState } from "react";
import ShapeGrid from "@/components/ShapeGrid";

// Canvas can't read CSS variables, so resolve the theme tokens and re-read them when the theme toggles.
function useThemeColors() {
  const read = () => {
    const style = getComputedStyle(document.documentElement);
    return { rule: style.getPropertyValue("--rule").trim(), accent: style.getPropertyValue("--accent").trim() };
  };
  const [colors, setColors] = useState(read);

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

/** Faint graph-paper grid behind Contact; cells near the cursor light up in the accent colour. */
export default function ContactGrid() {
  const { rule, accent } = useThemeColors();

  return (
    <ShapeGrid
      shape="square"
      cellSize={44}
      direction="none"
      speed={0}
      lineColor={rule}
      hoverColor={accent}
      fillOpacity={0.08}
      glow={0}
      radius={1.6}
      trail={0.8}
      fade={1}
    />
  );
}
