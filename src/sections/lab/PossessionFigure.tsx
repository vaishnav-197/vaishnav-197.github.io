import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

type State = "H" | "A" | "D";
type Frame = { truth: State; hidden: boolean; team: number; dead: number };

const FRAMES = 400; // 16 s at 25 fps
const truthRuns: [State, number, number][] = [
  ["H", 0, 100], ["A", 100, 124], ["H", 124, 200], ["A", 200, 262], ["D", 262, 300], ["H", 300, 362], ["A", 362, 400],
];
const hiddenRuns = [[36, 72], [160, 178], [318, 340]];
const looseRuns = [[96, 104], [196, 206], [356, 366]];
const inside = (runs: number[][], i: number) => runs.some(([a, b]) => i >= a && i < b);

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Made-up evidence per frame, shaped like the real problem: `team` is log-odds for home
 * (nearest player to the ball), `dead` is log-odds that the ball is out of play.
 */
function simulate(): Frame[] {
  const random = seeded(7);
  const noise = () => (random() + random() + random() + random() - 2) * 1.7;
  return Array.from({ length: FRAMES }, (_, i) => {
    const truth = truthRuns.find(([, a, b]) => i >= a && i < b)![0];
    const hidden = inside(hiddenRuns, i);
    let team = 0;
    let dead = 0;
    if (truth === "D") {
      team = noise() * 1.2;
      dead = 2.2 + noise() * 0.6;
    } else if (!hidden) {
      team = inside(looseRuns, i) ? noise() * 0.8 : (truth === "H" ? 1.3 : -1.3) + noise() * 1.5;
      dead = -0.6 + noise() * 0.3;
    }
    return { truth, hidden, team: Math.max(-3, Math.min(3, team)), dead };
  });
}

/** The naive read: nearest team wins each frame, and an unseen ball counts as dead. */
const baseline = (frames: Frame[]): State[] =>
  frames.map((f) => (f.hidden || f.dead > 1 ? "D" : f.team >= 0 ? "H" : "A"));

const STATES: State[] = ["H", "A", "D"];
const SCALE = 0.5;
const DEAD_COST = 8;

/** Cheapest H/A/D path through the whole clip, paying `switchCost` for each change of team. */
function viterbi(frames: Frame[], switchCost: number): State[] {
  const emit = (f: Frame, s: number) =>
    SCALE *
    (s === 0
      ? Math.max(0, -f.team) + Math.max(0, f.dead)
      : s === 1
        ? Math.max(0, f.team) + Math.max(0, f.dead)
        : Math.max(0, -f.dead));
  const move = (a: number, b: number) => (a === b ? 0 : a === 2 || b === 2 ? DEAD_COST : switchCost);

  let cost = [0, 1, 2].map((s) => emit(frames[0], s));
  const back: number[][] = [];
  for (let i = 1; i < frames.length; i++) {
    const next: number[] = [];
    const from: number[] = [];
    for (let b = 0; b < 3; b++) {
      let best = Infinity;
      let arg = 0;
      for (let a = 0; a < 3; a++) {
        const c = cost[a] + move(a, b);
        if (c < best) [best, arg] = [c, a];
      }
      next.push(best + emit(frames[i], b));
      from.push(arg);
    }
    cost = next;
    back.push(from);
  }
  let s = cost.indexOf(Math.min(...cost));
  const path = [s];
  for (let i = back.length - 1; i >= 0; i--) path.push((s = back[i][s]));
  return path.reverse().map((x) => STATES[x]);
}

const possessions = (labels: State[]) => {
  let count = 0;
  let previous: State | null = null;
  for (const s of labels) {
    if (s !== "D" && s !== previous) count++;
    previous = s;
  }
  return count;
};

function runsOf<T>(labels: T[]) {
  const runs: { value: T; start: number; length: number }[] = [];
  labels.forEach((value, i) => {
    const last = runs.at(-1);
    if (last && last.value === value) last.length++;
    else runs.push({ value, start: i, length: 1 });
  });
  return runs;
}

const fill: Record<State, string> = { H: "var(--ink)", A: "var(--accent)", D: "var(--rule)" };

function Strip({ labels, height = 14 }: { labels: State[]; height?: number }) {
  return (
    <svg viewBox={`0 0 ${FRAMES} 1`} preserveAspectRatio="none" className="block w-full" style={{ height }} aria-hidden>
      {runsOf(labels).map((run) => (
        <rect key={run.start} x={run.start} width={run.length} y={0} height={1} fill={fill[run.value]} />
      ))}
    </svg>
  );
}

export default function PossessionFigure() {
  const reduce = useReducedMotion();
  const sliderId = useId();
  const frames = useMemo(simulate, []);
  const truth = useMemo(() => frames.map((f) => f.truth), [frames]);
  const naive = useMemo(() => baseline(frames), [frames]);
  const [switchCost, setSwitchCost] = useState(6);
  const decoded = useMemo(() => viterbi(frames, switchCost), [frames, switchCost]);

  const accuracy = (labels: State[]) =>
    `${Math.round((labels.filter((s, i) => s === truth[i]).length / FRAMES) * 100)}% of frames right`;

  const rows = [
    { label: "Truth", labels: truth, note: "annotated" },
    { label: "Baseline", labels: naive, note: accuracy(naive) },
    { label: "Viterbi", labels: decoded, note: accuracy(decoded) },
  ];

  return (
    <figure className="rounded-xl border border-rule p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        {(["H", "A", "D"] as const).map((s) => (
          <span key={s} className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm" style={{ background: fill[s] }} />
            {{ H: "Home", A: "Away", D: "Dead ball" }[s]}
          </span>
        ))}
        <span className="flex items-center gap-2">
          <span className="h-px w-4 bg-muted" />
          Ball hidden
        </span>
      </div>

      <motion.div
        className="mt-5 grid gap-y-3"
        initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
        whileInView={{ clipPath: "inset(0 0% 0 0)" }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="grid grid-cols-[5.5rem_1fr_6.5rem] items-center gap-x-3 max-sm:grid-cols-[1fr_auto]">
          <span className="meta max-sm:hidden">Ball</span>
          <svg viewBox={`0 0 ${FRAMES} 1`} preserveAspectRatio="none" className="block h-1.5 w-full max-sm:col-span-2" aria-hidden>
            {hiddenRuns.map(([a, b]) => (
              <rect key={a} x={a} width={b - a} y={0.4} height={0.2} fill="var(--muted)" />
            ))}
          </svg>
          <span className="max-sm:hidden" />
        </div>
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[5.5rem_1fr_6.5rem] items-center gap-x-3 gap-y-1 max-sm:grid-cols-[1fr_auto]">
            <span className="meta">{row.label}</span>
            <span className="max-sm:order-last max-sm:col-span-2">
              <Strip labels={row.labels} />
            </span>
            <span className="text-right font-mono text-xs tabular-nums">
              {possessions(row.labels)} poss.
            </span>
          </div>
        ))}
        <div className="grid grid-cols-[5.5rem_1fr_6.5rem] gap-x-3 font-mono text-[11px] text-muted max-sm:grid-cols-1">
          <span className="max-sm:hidden" />
          <span className="flex justify-between">
            <span>0 s</span>
            <span>16 s</span>
          </span>
        </div>
      </motion.div>

      <div className="mt-6 grid gap-3 border-t border-rule pt-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-x-6">
        <label htmlFor={sliderId} className="text-sm">
          Switch cost <span className="font-mono tabular-nums text-accent">{switchCost}</span>
          <span className="block text-xs text-muted">How much evidence it takes to change team.</span>
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={16}
          step={1}
          value={switchCost}
          onChange={(e) => setSwitchCost(Number(e.target.value))}
          className="w-full accent-[var(--accent)] sm:w-64"
          aria-valuetext={`${switchCost}: ${possessions(decoded)} possessions, ${accuracy(decoded)}`}
        />
        <p className="text-xs text-muted sm:col-span-2" aria-live="polite">
          {rows.slice(1).map((r) => `${r.label}: ${r.note}`).join(" · ")}
        </p>
      </div>
    </figure>
  );
}
