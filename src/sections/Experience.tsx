import { BlurFade } from "@/components/ui/blur-fade";
import { experience } from "@/content";
import { Section } from "./Section";

export function Experience() {
  return (
    <Section id="experience" number="02" label="Experience">
      <div className="space-y-12 md:space-y-16">
        {experience.map((role, index) => {
          const current = role.period.includes("Present");
          return (
            <BlurFade key={role.company} inView>
              <article
                className={`grid gap-5 md:grid-cols-9 md:gap-6 ${index > 0 ? "border-t border-ink pt-10 md:pt-14" : ""}`}
              >
                <header className="md:col-span-3">
                  <div className="flex items-center justify-between gap-3 md:block">
                    <p className="meta">{role.period}</p>
                    {current && (
                      <span className="meta rounded-full border border-accent px-2 py-0.5 text-accent md:mt-3 md:inline-block">
                        Current
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">{role.company}</h3>
                  <p className="mt-1 text-sm text-muted">{role.title}</p>
                </header>
                <ol className="border-t border-rule md:col-span-6 md:border-t-0">
                  {role.points.map((point, i) => (
                    <li
                      key={i}
                      className="flex gap-4 border-t border-rule py-3 text-[15px] leading-relaxed first:border-t-0 md:first:pt-0"
                    >
                      <span className="meta pt-1">{String(i + 1).padStart(2, "0")}</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ol>
              </article>
            </BlurFade>
          );
        })}
      </div>
    </Section>
  );
}
