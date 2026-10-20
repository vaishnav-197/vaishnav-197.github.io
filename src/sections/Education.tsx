import { education } from "@/content";
import { Section } from "./Section";

export function Education() {
  return (
    <Section id="education" number="08" label="Education">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="font-serif text-2xl md:text-3xl">{education.degree}</p>
        <p className="meta">{education.period}</p>
      </div>
      <p className="mt-1 text-muted">{education.school}</p>
    </Section>
  );
}
