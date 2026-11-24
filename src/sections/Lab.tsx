import { lazy, Suspense, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { lab, profile, type LabEntry } from "@/content";
import { Section } from "./Section";

const loaders = {
  possession: () => import("./lab/PossessionFigure"),
  bundle: () => import("./lab/BundleFigure"),
  pitwall: () => import("./lab/PitwallFigure"),
};
const figures = {
  possession: lazy(loaders.possession),
  bundle: lazy(loaders.bundle),
  pitwall: lazy(loaders.pitwall),
};

const captions: Record<LabEntry["id"], string> = {
  possession: "Simulated frames, not match data. Drag the switch cost to see flicker turn into clean possessions.",
  bundle: "Output from the README example. Run it again to replay the check.",
  pitwall: "Numbers from the README’s sample race. Switch policy to see how reacting to safety cars reorders the plans.",
};

const ease = [0.22, 1, 0.36, 1] as const;

function Row({ entry, open, near, onToggle }: { entry: LabEntry; open: boolean; near: boolean; onToggle: () => void }) {
  const Figure = figures[entry.id];
  const panelId = `lab-${entry.id}`;

  return (
    <li className="border-t border-rule last:border-b">
      <h3 data-swarm="frame" data-swarm-label={entry.title}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          id={`${panelId}-button`}
          onClick={onToggle}
          onPointerEnter={() => void loaders[entry.id]()}
          className="group grid w-full grid-cols-[1fr_auto] gap-x-6 gap-y-2 py-5 text-left"
        >
          <span className="font-serif text-3xl leading-tight transition-colors duration-300 group-hover:text-accent">
            {entry.title}
          </span>
          <span className="flex items-center gap-3 self-start pt-2">
            <span className="meta text-accent">{entry.status}</span>
            <span aria-hidden className="relative grid size-6 place-items-center rounded-full border border-rule transition-colors duration-300 group-hover:border-ink">
              <span className="absolute h-px w-2.5 bg-current" />
              <motion.span
                className="absolute h-px w-2.5 bg-current"
                animate={{ rotate: open ? 0 : 90 }}
                transition={{ duration: 0.5, ease }}
              />
            </span>
          </span>
          <span className="col-span-2 max-w-2xl text-[15px] text-pretty text-muted">{entry.summary}</span>
          <span className="meta col-span-2">{entry.stack.join(" · ")}</span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={`${panelId}-button`}
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="pb-8">
              {near && (
                <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-wash" />}>
                  <Figure />
                </Suspense>
              )}
              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <p className="max-w-xl text-sm text-muted">{captions[entry.id]}</p>
                {entry.href && (
                  <a href={entry.href} target="_blank" rel="noopener noreferrer" className="text-sm link-underline">
                    Code on GitHub ↗
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function Lab() {
  const [openId, setOpenId] = useState<LabEntry["id"] | null>(lab[0]?.id ?? null);
  // Only fetch a figure once the section is close to the viewport.
  const listRef = useRef<HTMLOListElement>(null);
  const near = useInView(listRef, { once: true, margin: "400px 0px" });

  return (
    <Section id="lab" number="04" label="Lab" aside={lab.length > 0 && <p className="mt-3 text-sm text-muted">Open a project to run it.</p>}>
      {lab.length === 0 ? (
        <div>
          <p className="font-serif text-3xl leading-tight italic md:text-4xl">
            Go and distributed-systems experiments land here as they ship.
          </p>
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm link-underline">
            Follow along on GitHub ↗
          </a>
        </div>
      ) : (
        <ol ref={listRef}>
          {lab.map((entry) => (
            <Row
              key={entry.id}
              entry={entry}
              open={openId === entry.id}
              near={near}
              onToggle={() => setOpenId((current) => (current === entry.id ? null : entry.id))}
            />
          ))}
        </ol>
      )}
    </Section>
  );
}
