import { motion } from "motion/react";
import { BlurFade } from "@/components/ui/blur-fade";
import { TextAnimate } from "@/components/ui/text-animate";
import { about } from "@/content";
import { Section } from "./Section";

const ease = [0.22, 1, 0.36, 1] as const;

export function About() {
  return (
    <Section id="about" number="01" label="About">
      <div className="grid gap-10 md:grid-cols-9 md:gap-12">
        {/* The figure is observed unclipped; the clip-path lives on a child, since a
            fully clipped element never reports as in view. */}
        <motion.figure
          className="md:col-span-4"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            className="group overflow-hidden"
            variants={{ hidden: { clipPath: "inset(100% 0 0 0)" }, shown: { clipPath: "inset(0% 0 0 0)" } }}
            transition={{ duration: 1.1, ease }}
          >
            <motion.img
              src="/about.webp"
              width={999}
              height={1250}
              alt="Vaishnav Valsaraj standing by a river in a mountain valley"
              className="aspect-[4/5] h-auto w-full object-cover grayscale-[40%] transition-[filter] duration-700 group-hover:grayscale-0"
              decoding="async"
              variants={{ hidden: { scale: 1.15 }, shown: { scale: 1 } }}
              transition={{ duration: 1.6, ease }}
            />
          </motion.div>
          <figcaption className="meta mt-3 flex justify-between">
            <span>Off the clock</span>
            <span>Fig. 01</span>
          </figcaption>
        </motion.figure>

        <div className="flex flex-col justify-between gap-10 md:col-span-5">
          <div>
            <TextAnimate
              as="p"
              by="word"
              animation="blurInUp"
              once
              className="font-serif text-3xl leading-[1.15] md:text-[2.6rem]"
            >
              {about.lead}
            </TextAnimate>
            <BlurFade inView delay={0.35}>
              <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-muted">{about.body}</p>
            </BlurFade>
          </div>

          <BlurFade inView delay={0.45}>
            <dl className="border-t border-ink">
              {about.facts.map(([term, value]) => (
                <div key={term} className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b border-rule py-3">
                  <dt className="meta">{term}</dt>
                  <dd className="text-[15px]">{value}</dd>
                </div>
              ))}
            </dl>
          </BlurFade>
        </div>
      </div>
    </Section>
  );
}
