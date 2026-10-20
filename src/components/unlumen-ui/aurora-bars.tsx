"use client";

import * as React from "react";
import { useAnimationFrame, useInView, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export interface AuroraBarsProps {
  /** @default 24 */
  barCount?: number;
  /** gradient color stops, bottom to top — @default ["#ff2d78", "#c04aff", "#4a6fff", "#0a1aff", "#00000000"] */
  colors?: string[];
  /** max bar height as fraction of container height — @default 0.92 */
  maxHeightRatio?: number;
  /** min bar height as fraction of container height — @default 0.18 */
  minHeightRatio?: number;
  /** undulation speed — @default 0.5 */
  speed?: number;
  /** @default 3 */
  gap?: number;
  /** px blur per bar, creates soft glow — @default 0 */
  blur?: number;
  /** @default "#000000" */
  background?: string;
  /** colour the edges fade into — @default "#000000cc" */
  vignette?: string;
  /** share of bar height driven by the waves vs the static arch, 0–1 — @default 0.35 */
  waveStrength?: number;
  className?: string;
}

/** two sine waves per bar for organic movement */
function barHeight(
  index: number,
  total: number,
  time: number,
  minH: number,
  maxH: number,
  waveStrength: number,
): number {
  // Arch envelope: tallest in the centre, shorter on edges
  // arch envelope: tallest in centre, shorter on edges
  const norm = index / (total - 1);
  const arch = Math.sin(norm * Math.PI);

  const phase1 = (index / total) * Math.PI * 2;
  const phase2 = (index / total) * Math.PI * 5.3;

  const wave =
    0.5 +
    0.25 * Math.sin(time * 1.1 + phase1) +
    0.25 * Math.sin(time * 0.7 + phase2);

  const blended = arch * (1 - waveStrength) + wave * waveStrength;

  return minH + blended * (maxH - minH);
}

export function AuroraBars({
  barCount = 24,
  colors = ["#ffd6eb", "#ff9acb", "#ff5aa6", "#ff2d78", "#00000000"],
  maxHeightRatio = 0.92,
  minHeightRatio = 0.18,
  speed = 0.5,
  gap = 3,
  blur = 0,
  background = "#000000",
  vignette = "#000000cc",
  waveStrength = 0.35,
  className,
}: AuroraBarsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const barsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const initial = React.useMemo(
    () =>
      Array.from({ length: barCount }, (_, i) =>
        barHeight(i, barCount, 0, minHeightRatio, maxHeightRatio, waveStrength),
      ),
    [barCount, minHeightRatio, maxHeightRatio, waveStrength],
  );

  const timeRef = React.useRef(0);
  const reduceMotion = useReducedMotion();
  const inView = useInView(containerRef);

  // Write transforms straight to the DOM: no React re-render per frame, and
  // scaleY stays on the compositor instead of re-laying out height.
  useAnimationFrame((_, delta) => {
    if (reduceMotion || !inView) return;
    timeRef.current += (delta / 1000) * speed;
    const t = timeRef.current;
    for (let i = 0; i < barCount; i++) {
      const bar = barsRef.current[i];
      if (bar) {
        bar.style.transform = `scaleY(${barHeight(i, barCount, t, minHeightRatio, maxHeightRatio, waveStrength)})`;
      }
    }
  });

  const gradientStop = colors
    .map((c, i) => `${c} ${Math.round((i / (colors.length - 1)) * 100)}%`)
    .join(", ");
  const gradient = `linear-gradient(to top, ${gradientStop})`;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden", className)}
      style={{ background }}
    >
      <div className="absolute inset-0 flex items-end">
        {initial.map((heightFraction, i) => {
          return (
            <div
              key={i}
              className="flex-1"
              style={{
                height: "100%",
                display: "flex",
                alignItems: "flex-end",
                padding: `0 ${gap / 2}px`,
              }}
            >
              <div
                ref={(el) => {
                  barsRef.current[i] = el;
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  transform: `scaleY(${heightFraction})`,
                  transformOrigin: "bottom",
                  willChange: "transform",
                  background: gradient,
                  borderRadius: "9999px 9999px 0 0",
                  filter: `blur(${blur}px)`,
                  opacity: 0.85,
                }}
              />
            </div>
          );
        })}
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            `radial-gradient(ellipse 90% 80% at 50% 100%, transparent 40%, ${vignette} 100%)`,
        }}
      />
    </div>
  );
}
