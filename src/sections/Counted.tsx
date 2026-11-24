import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";

// Loaded after first paint; until then the final figure shows as plain text.
const CountUp = lazy(() => import("@/components/CountUp"));

// "35%" counts up from 0; "from 4.2s to 2.5s" counts the second figure down from the first.
const figures = /(\d+(?:\.\d+)?)%|from (\d+(?:\.\d+)?)s to (\d+(?:\.\d+)?)s/g;

/** False while a swarm cursor has yet to build the surrounding element (see src/lib/swarm.ts). */
function useBuilt(ref: React.RefObject<HTMLElement | null>) {
  const [built, setBuilt] = useState(true);
  useEffect(() => {
    const host = ref.current?.closest<HTMLElement>("[data-swarm]");
    if (!host || !document.documentElement.classList.contains("swarm") || "swarmDone" in host.dataset) return;
    setBuilt(false);
    const onBuilt = () => setBuilt(true);
    host.addEventListener("swarm:built", onBuilt);
    return () => host.removeEventListener("swarm:built", onBuilt);
  }, [ref]);
  return built;
}

function Count({ from, to, suffix }: { from: string; to: string; suffix: string }) {
  const final = `${to}${suffix}`;
  const ref = useRef<HTMLSpanElement>(null);
  const built = useBuilt(ref);
  return (
    // The invisible copy reserves the final width, so the sentence doesn't shift while counting.
    <span ref={ref} className="relative inline-block whitespace-nowrap tabular-nums">
      <span className="invisible">{final}</span>
      <span aria-hidden className="absolute top-0 left-0">
        <Suspense fallback={final}>
          <CountUp from={Number(from)} to={Number(to)} suffix={suffix} duration={1.2} startWhen={built} />
        </Suspense>
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}

/** Renders text with its performance figures animated into view. */
export function Counted({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(figures)) {
    const start = match.index ?? 0;
    parts.push(text.slice(last, start));
    if (match[1]) {
      parts.push(<Count key={start} from="0" to={match[1]} suffix="%" />);
    } else {
      parts.push(`from ${match[2]}s to `, <Count key={start} from={match[2]} to={match[3]} suffix="s" />);
    }
    last = start + match[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}
