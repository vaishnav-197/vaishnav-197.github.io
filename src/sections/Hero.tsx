import DecryptedText from "@/components/DecryptedText";
import Magnet from "@/components/Magnet";
import { AuroraBars } from "@/components/unlumen-ui/aurora-bars";
import { NoiseTexture } from "@/components/ui/noise-texture";
import { WordRotate } from "@/components/ui/word-rotate";
import { experience, profile } from "@/content";
import { container } from "./Section";

export function Hero() {
  const current = experience[0];

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
          <DecryptedText
            text={`${current.title} at ${current.company} · ${profile.location}`}
            animateOn="view"
            sequential
            speed={28}
            characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*+"
            encryptedClassName="text-accent"
          />
        </p>

        <h1 className="py-8 font-serif text-[clamp(4.5rem,28vw,13rem)] leading-[0.86] tracking-[-0.02em] md:py-16">
          <span data-swarm="type" className="block w-fit">
            {profile.name[0]}
          </span>{" "}
          <span data-swarm="type" className="block w-fit italic">
            {profile.name[1]}
          </span>
        </h1>

        <div className="grid items-end gap-6 border-t border-ink pt-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <p data-swarm="scan" className="max-w-md text-lg leading-snug">
              {profile.standfirst}
            </p>
            <span data-swarm="pop" data-swarm-label={profile.stack.join(", ")} className="block w-fit">
              <WordRotate
                words={profile.stack}
                duration={2200}
                className="block font-serif text-4xl italic text-accent md:text-5xl"
              />
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm md:col-span-5 md:justify-end">
            <span data-swarm="drag" data-swarm-from="right" className="inline-block">
              <Magnet padding={60} magnetStrength={3} maxOffset={12}>
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-block rounded-full bg-ink px-4 py-2 font-medium text-paper transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-accent active:scale-[0.98]"
                >
                  Email me
                </a>
              </Magnet>
            </span>
            <a data-swarm="pop" href={profile.resume} className="link-underline" download>
              Download resume ↓
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
