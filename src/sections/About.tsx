import { about } from "@/content";
import { Section } from "./Section";

export function About() {
  return (
    <Section id="about" number="01" label="About">
      <div className="grid gap-10 md:grid-cols-9 md:gap-12">
        <figure className="md:col-span-4">
          <div data-swarm="drag" className="group overflow-hidden">
            <img
              src="/about.webp"
              width={999}
              height={1250}
              alt="Vaishnav Valsaraj standing by a river in a mountain valley"
              className="aspect-[4/5] h-auto w-full object-cover grayscale-[40%] transition-[filter] duration-700 group-hover:grayscale-0"
              decoding="async"
            />
          </div>
          <figcaption data-swarm="pop" data-swarm-label="Fig. 01" className="meta mt-3 flex justify-between">
            <span>Off the clock</span>
            <span>Fig. 01</span>
          </figcaption>
        </figure>

        <div className="flex flex-col justify-between gap-10 md:col-span-5">
          <div>
            <p data-swarm="type" className="font-serif text-3xl leading-[1.15] md:text-[2.6rem]">
              {about.lead}
            </p>
            <p data-swarm="scan" className="mt-6 max-w-prose text-[15px] leading-relaxed text-muted">
              {about.body}
            </p>
          </div>

          <dl className="border-t border-ink">
            {about.facts.map(([term, value]) => (
              <div
                key={term}
                data-swarm="frame"
                className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b border-rule py-3"
              >
                <dt className="meta">{term}</dt>
                <dd className="text-[15px]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}
