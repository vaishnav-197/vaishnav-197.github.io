import { AuroraBars } from "@/components/unlumen-ui/aurora-bars";
import { NoiseTexture } from "@/components/ui/noise-texture";
import { TextAnimate } from "@/components/ui/text-animate";
import { WordRotate } from "@/components/ui/word-rotate";
import { profile } from "@/content";
import { container } from "./Section";

export function Hero() {
  const year = new Date().getFullYear();

  return (
    <section id="top" className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-[75%] opacity-90 [mask-image:linear-gradient(to_top,black_55%,transparent)] dark:opacity-60"
      >
        <AuroraBars
          colors={["#f2a48c", "#e9b9c9", "#c9c3ee", "#f6e2b8", "#00000000"]}
          background="transparent"
          vignette="var(--paper)"
          blur={10}
          gap={4}
          barCount={22}
          speed={1}
          waveStrength={0.6}
        />
      </div>
      <NoiseTexture aria-hidden className="-z-10 opacity-20 mix-blend-multiply dark:opacity-25 dark:mix-blend-screen" />

      <div className={`${container} flex min-h-[calc(100svh-3.5rem)] flex-col justify-between py-10 md:py-14`}>
        <p className="meta">
          No. 04 · {year} · {profile.location}
        </p>

        <div className="py-16">
          <TextAnimate
            as="h1"
            by="word"
            animation="blurInUp"
            once
            className="font-serif text-[clamp(4.5rem,28vw,13rem)] leading-[0.86] tracking-[-0.02em]"
          >
            {profile.name[0]}
          </TextAnimate>
          <TextAnimate
            as="p"
            by="word"
            animation="blurInUp"
            delay={0.15}
            once
            className="font-serif text-[clamp(4.5rem,28vw,13rem)] italic leading-[0.86] tracking-[-0.02em]"
          >
            {profile.name[1]}
          </TextAnimate>
        </div>

        <div className="grid items-end gap-6 border-t border-ink pt-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="max-w-md text-lg leading-snug">
              {profile.standfirst}
            </p>
            <WordRotate
              words={profile.stack}
              duration={2200}
              className="block font-serif text-4xl italic text-accent md:text-5xl"
            />
          </div>
          <div className="flex gap-6 text-sm md:col-span-5 md:justify-end">
            <a href="#work" className="link-underline">
              Selected work ↓
            </a>
            <a href={profile.resume} className="link-underline" download>
              Resume ↓
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
