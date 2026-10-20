import { Marquee } from "@/components/ui/marquee";
import { profile, toolkit } from "@/content";
import { container } from "./Section";

export function Toolkit() {
  return (
    <section id="toolkit" className="border-t border-rule py-16 md:py-24">
      <h2 className={`${container} meta mb-8`}>05 — Toolkit</h2>

      <div className="border-y border-rule">
        {toolkit.map((group, i) => (
          <div key={group.label} className={`relative ${i > 0 ? "border-t border-rule" : ""}`}>
            <p className={`${container} pointer-events-none absolute inset-x-0 top-2 z-10`}>
              <span className="meta bg-paper pr-2">{group.label}</span>
            </p>
            <ul className="sr-only">
              {group.items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <Marquee
              aria-hidden
              reverse={i % 2 === 1}
              pauseOnHover
              className={`[--duration:60s] [--gap:2.5rem] ${i === 0 ? "pt-9 pb-5" : "pt-8 pb-4"}`}
            >
              {group.items.map((t) => (
                <span
                  key={t}
                  className={`flex items-center gap-10 font-serif ${
                    i === 0 ? "text-5xl md:text-6xl" : "text-3xl text-muted md:text-4xl"
                  } ${i === 1 ? "italic" : ""}`}
                >
                  {t}
                  <span className="text-xl text-accent">✳</span>
                </span>
              ))}
            </Marquee>
          </div>
        ))}
      </div>

      <p className={`${container} mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1`}>
        <span className="meta">Currently exploring</span>
        <a href="#lab" className="font-serif text-2xl italic link-underline">
          {profile.exploring.join(" · ")}
        </a>
      </p>
    </section>
  );
}
