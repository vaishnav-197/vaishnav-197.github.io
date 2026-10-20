import { BlurFade } from "@/components/ui/blur-fade";
import { experience } from "@/content";
import { Section } from "./Section";

export function Experience() {
  return (
    <Section id="experience" number="02" label="Experience">
      {experience.map((role) => (
        <BlurFade key={role.company} inView>
          <article className="grid gap-6 md:grid-cols-9">
            <header className="md:col-span-3">
              <p className="meta">{role.period}</p>
              <h3 className="mt-2 font-serif text-3xl leading-tight">{role.company}</h3>
              <p className="mt-1 text-sm text-muted">{role.title}</p>
            </header>
            <ol className="md:col-span-6">
              {role.points.map((point, i) => (
                <li key={i} className="flex gap-4 border-t border-rule py-3 text-[15px] leading-relaxed first:border-t-0 first:pt-0">
                  <span className="meta pt-1">{String(i + 1).padStart(2, "0")}</span>
                  <span>{point}</span>
                </li>
              ))}
            </ol>
          </article>
        </BlurFade>
      ))}
    </Section>
  );
}
