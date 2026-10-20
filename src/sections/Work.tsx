import { lazy, Suspense } from "react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Highlighter } from "@/components/ui/highlighter";
import { Iphone } from "@/components/ui/iphone";
import { Safari } from "@/components/ui/safari";
import { archive, work, type CaseStudy } from "@/content";
import { Section } from "./Section";

const FpsTerminal = lazy(() => import("./FpsTerminal"));

function Outcome({ text, highlights }: { text: string; highlights: string[] }) {
  if (!highlights.length) return <>{text}</>;
  const pattern = new RegExp(`(${highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`);
  return (
    <>
      {text.split(pattern).map((part, i) =>
        highlights.includes(part) ? (
          <Highlighter key={i} action="underline" color="var(--accent)" strokeWidth={2} isView delay={700}>
            {part}
          </Highlighter>
        ) : (
          part
        ),
      )}
    </>
  );
}

function Media({ id }: { id: CaseStudy["id"] }) {
  if (id === "zenyum") {
    return (
      <div className="relative flex items-end gap-4 bg-wash p-6 md:p-10">
        <Safari url="zenyum.sg" imageSrc="/work/zenyum-web.webp" className="w-full md:w-[78%]" />
        <div className="absolute right-6 bottom-6 hidden w-[22%] md:block">
          <Iphone src="/work/zenyum-app.webp" />
        </div>
      </div>
    );
  }
  if (id === "fps") {
    return (
      <div className="min-h-[220px] bg-wash p-3 md:p-10">
        <Suspense fallback={null}>
          <FpsTerminal />
        </Suspense>
      </div>
    );
  }
  return null;
}

export function Work() {
  return (
    <Section id="work" number="03" label="Selected work">
      <div className="space-y-24">
        {work.map((study) => (
          <BlurFade key={study.id} inView>
            <article>
              <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3 className="font-serif text-5xl leading-none md:text-6xl">{study.title}</h3>
                <p className="meta">
                  {study.kicker} · {study.period}
                </p>
              </header>
              <p className="mt-4 font-serif text-2xl italic text-accent md:text-3xl">“{study.quote}”</p>

              <div className="mt-8">
                <Media id={study.id} />
              </div>

              <dl className="mt-8 grid gap-6 text-[15px] leading-relaxed md:grid-cols-3">
                {(
                  [
                    ["Problem", study.problem],
                    ["Approach", study.approach],
                  ] as const
                ).map(([term, body]) => (
                  <div key={term}>
                    <dt className="meta mb-2">{term}</dt>
                    <dd>{body}</dd>
                  </div>
                ))}
                <div>
                  <dt className="meta mb-2">Outcome</dt>
                  <dd>
                    <Outcome text={study.outcome} highlights={study.highlights} />
                  </dd>
                </div>
              </dl>

              <footer className="mt-6 flex flex-wrap items-baseline justify-between gap-4 border-t border-rule pt-4">
                <p className="meta">{study.stack.join(" · ")}</p>
                <div className="flex gap-5 text-sm">
                  {study.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              </footer>
            </article>
          </BlurFade>
        ))}

        <div>
          <h3 className="meta mb-3">Archive</h3>
          <ul>
            {archive.map((item) => (
              <li key={item.href} className="border-t border-rule">
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-baseline justify-between gap-4 py-3 hover:text-accent"
                >
                  <span className="font-serif text-2xl">{item.title}</span>
                  <span className="text-sm text-muted">{item.note} ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
