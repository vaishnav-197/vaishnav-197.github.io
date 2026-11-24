import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

const command = "$ bundle-budget check stats.json --dir dist";

// The example run from the bundle-budget README.
const checks = [
  { budget: "chunk index", target: "index", size: "75.05 KB", limit: "70.00 KB", used: 107, compression: "gzip" },
  { budget: "chunk Settings", target: "Settings", size: "7.34 KB", limit: "10.00 KB", used: 73, compression: "gzip" },
  { budget: "asset assets/*.css", target: "assets/Settings-Bmu520Xm.css", size: "104 B", limit: "1.00 KB", used: 10, compression: "gzip" },
  { budget: "asset assets/*.css", target: "assets/index-jKOD1Osa.css", size: "140 B", limit: "1.00 KB", used: 14, compression: "gzip" },
  { budget: "total", target: "4 JS/CSS files", size: "71.63 KB", limit: "80.00 KB", used: 90, compression: "brotli" },
];

/** Bars run to 120% so going over the limit has somewhere to go. */
const SCALE = 120;
const ease = [0.22, 1, 0.36, 1] as const;

export default function BundleFigure() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [run, setRun] = useState(0);
  // typed characters, then one step per line: header, each check, summary.
  const [typed, setTyped] = useState(reduce ? command.length : 0);
  const [step, setStep] = useState(reduce ? checks.length + 2 : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    setTyped(0);
    setStep(0);
    let chars = 0;
    let lines = 0;
    let lineTimer: ReturnType<typeof setInterval>;
    const typeTimer = setInterval(() => {
      setTyped(++chars);
      if (chars < command.length) return;
      clearInterval(typeTimer);
      lineTimer = setInterval(() => {
        setStep(++lines);
        if (lines >= checks.length + 2) clearInterval(lineTimer);
      }, 380);
    }, 32);
    return () => {
      clearInterval(typeTimer);
      clearInterval(lineTimer);
    };
  }, [inView, reduce, run]);

  const done = step >= checks.length + 2;

  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-rule font-mono text-[11px] md:text-xs">
      <div className="flex items-center justify-between border-b border-rule px-4 py-3">
        <span className="flex gap-2" aria-hidden>
          <span className="size-2 rounded-full bg-red-500" />
          <span className="size-2 rounded-full bg-yellow-500" />
          <span className="size-2 rounded-full bg-green-500" />
        </span>
        <span className="text-muted">ci · size check</span>
      </div>

      <div className="grid min-h-60 content-start gap-y-2 p-4" role="img" aria-label="bundle-budget output: the index chunk is at 107% of its 70 KB gzip budget, the other four checks pass, so the job exits with code 1.">
        <p aria-hidden>
          {command.slice(0, typed)}
          {!done && typed < command.length && <span className="animate-pulse">▍</span>}
        </p>
        {step >= 1 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted" aria-hidden>
            vite build in dist (5 files)
          </motion.p>
        )}

        <ul className="mt-2 grid gap-y-2.5" aria-hidden>
          {checks.map((check, i) =>
            step >= i + 2 ? (
              <motion.li
                key={`${run}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease }}
                className="grid grid-cols-[3rem_1fr_auto] items-center gap-x-3 gap-y-1 md:grid-cols-[3rem_11rem_1fr_9.5rem_3rem]"
              >
                <span className={check.used > 100 ? "font-semibold text-accent" : "text-muted"}>
                  {check.used > 100 ? "FAIL" : "PASS"}
                </span>
                <span className="truncate" title={check.target}>
                  {check.budget}
                </span>
                {/* Budget bar: the tick is the limit. */}
                <span className="relative col-span-3 col-start-1 h-1.5 rounded-full bg-wash md:col-span-1 md:col-start-3 md:row-start-1">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${(Math.min(check.used, SCALE) / SCALE) * 100}%`,
                      background: check.used > 100 ? "var(--accent)" : "var(--ink)",
                      transformOrigin: "left",
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.7, ease, delay: 0.1 }}
                  />
                  <span className="absolute -inset-y-1 w-px bg-muted" style={{ left: `${(100 / SCALE) * 100}%` }} />
                </span>
                <span className="text-right text-muted tabular-nums max-md:hidden">
                  {check.size} / {check.limit}
                </span>
                <span className={`text-right tabular-nums ${check.used > 100 ? "text-accent" : ""} max-md:col-start-3 max-md:row-start-1`}>
                  {check.used}%
                </span>
              </motion.li>
            ) : null,
          )}
        </ul>

        {done && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2" aria-hidden>
            1 of 5 checks over budget. <span className="text-accent">exit 1</span>
          </motion.p>
        )}
      </div>

      <div className="flex justify-end border-t border-rule px-4 py-2.5">
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          disabled={!done || !!reduce}
          className="rounded-full border border-rule px-3 py-1 font-sans text-xs transition-colors duration-300 hover:border-ink active:scale-[0.98] disabled:opacity-40"
        >
          ↻ Run again
        </button>
      </div>
    </div>
  );
}
