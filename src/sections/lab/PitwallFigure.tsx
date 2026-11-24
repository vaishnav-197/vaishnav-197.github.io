import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";

type Compound = "soft" | "medium" | "hard";
type Policy = "stick" | "react";

const LAPS = 57;

// The sample race from the pitwall-sim README: best plan per stop count, then 5,000 races each.
const plans: { stops: number; stints: [Compound, number][]; mean: Record<Policy, number>; wins: Record<Policy, number> }[] = [
  {
    stops: 2,
    stints: [["soft", 17], ["medium", 23], ["soft", 17]],
    mean: { stick: 5524.101, react: 5523.174 },
    wins: { stick: 60.9, react: 52.6 },
  },
  {
    stops: 3,
    stints: [["soft", 14], ["medium", 15], ["soft", 14], ["soft", 14]],
    mean: { stick: 5524.472, react: 5522.415 },
    wins: { stick: 38.8, react: 47.1 },
  },
  {
    stops: 1,
    stints: [["hard", 32], ["medium", 25]],
    mean: { stick: 5538.71, react: 5537.704 },
    wins: { stick: 0.3, react: 0.3 },
  },
];

const policies: { id: Policy; label: string; note: string }[] = [
  { id: "stick", label: "Stick to the plan", note: "Sticking to the plan, the 2-stop has the best average and wins 60.9% of races." },
  {
    id: "react",
    label: "Pit under safety car",
    note: "Pitting early under a safety car gives the 3-stop the best average, though the 2-stop still wins more races head to head.",
  },
];

const compound: Record<Compound, { short: string; className: string }> = {
  soft: { short: "S", className: "bg-accent text-paper" },
  medium: { short: "M", className: "bg-ink text-paper" },
  hard: { short: "H", className: "border border-ink text-ink" },
};

const ease = [0.22, 1, 0.36, 1] as const;

const raceTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = (seconds % 60).toFixed(1).padStart(4, "0");
  return `${h}:${String(m).padStart(2, "0")}:${s}`;
};

/** A number that eases to its new value when it changes. */
function Tween({ value, format }: { value: number; format: (n: number) => string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduce) {
      setShown(value);
      from.current = value;
      return;
    }
    const controls = animate(from.current, value, {
      duration: 0.8,
      ease,
      onUpdate: (v) => {
        from.current = v;
        setShown(v);
      },
    });
    return () => controls.stop();
  }, [value, reduce]);
  return <>{format(shown)}</>;
}

export default function PitwallFigure() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [policy, setPolicy] = useState<Policy>("stick");
  const ranked = [...plans].sort((a, b) => a.mean[policy] - b.mean[policy]);
  const best = ranked[0].mean[policy];
  const note = policies.find((p) => p.id === policy)!.note;

  return (
    <figure ref={ref} className="rounded-xl border border-rule p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="meta text-balance">57 laps · pit loss 22 s · safety car 2% a lap</p>
        <div role="radiogroup" aria-label="Safety car policy" className="flex rounded-full border border-rule p-0.5 text-xs">
          {policies.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={policy === p.id}
              onClick={() => setPolicy(p.id)}
              className={`relative rounded-full px-3 py-1.5 transition-colors duration-300 ${policy === p.id ? "text-paper" : "text-muted hover:text-ink"}`}
            >
              {policy === p.id && (
                <motion.span layoutId="pitwall-policy" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.5, ease }} />
              )}
              <span className="relative">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 hidden grid-cols-[1fr_7rem_4rem] gap-x-4 text-muted md:grid">
        <span className="meta">Plan</span>
        <span className="meta text-right">Mean time</span>
        <span className="meta text-right">Wins</span>
      </div>

      <ol className="mt-2 grid gap-y-4 md:gap-y-3">
        {ranked.map((plan, rank) => {
          let lap = 0;
          return (
            <motion.li
              layout
              key={plan.stops}
              transition={{ duration: 0.6, ease }}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 md:grid-cols-[1fr_7rem_4rem]"
            >
              <div className="col-span-2 md:col-span-1">
                <div className="mb-1 flex items-baseline gap-2 text-xs">
                  <span className="font-medium">{plan.stops}-stop</span>
                  {rank === 0 && <span className="meta text-accent">Fastest on average</span>}
                </div>
                <div className="flex h-6 gap-px" aria-label={plan.stints.map(([c, n]) => `${c} ${n} laps`).join(", then ")} role="img">
                  {plan.stints.map(([c, n], i) => {
                    const start = lap;
                    lap += n;
                    return (
                      <motion.span
                        key={i}
                        className={`grid place-items-center overflow-hidden rounded-[3px] font-mono text-[10px] ${compound[c].className}`}
                        style={{ width: `${(n / LAPS) * 100}%`, transformOrigin: "left" }}
                        initial={{ scaleX: 0 }}
                        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                        transition={{ duration: 0.5, ease, delay: 0.15 + (start / LAPS) * 0.9 }}
                      >
                        {compound[c].short}
                        {n}
                      </motion.span>
                    );
                  })}
                </div>
              </div>
              <span className="text-xs text-muted md:text-right">
                <span className="font-mono text-ink tabular-nums">
                  <Tween value={plan.mean[policy]} format={raceTime} />
                </span>
                {rank > 0 && (
                  <span className="ml-1.5 font-mono tabular-nums md:block md:ml-0">
                    +<Tween value={plan.mean[policy] - best} format={(n) => n.toFixed(1)} /> s
                  </span>
                )}
              </span>
              <span className="text-right font-mono text-sm tabular-nums">
                <Tween value={plan.wins[policy]} format={(n) => `${n.toFixed(1)}%`} />
              </span>
            </motion.li>
          );
        })}
      </ol>

      <div className="mt-3 flex justify-between font-mono text-[11px] text-muted md:mr-[13rem]">
        <span>Lap 1</span>
        <span>Lap 57</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule pt-4 text-xs text-muted">
        {(Object.keys(compound) as Compound[]).map((c) => (
          <span key={c} className="flex items-center gap-2 capitalize">
            <span className={`size-2.5 rounded-sm ${compound[c].className}`} />
            {c}
          </span>
        ))}
        <p className="w-full text-ink sm:ml-auto sm:w-auto sm:max-w-sm sm:text-right" aria-live="polite">
          {note}
        </p>
      </div>
    </figure>
  );
}
