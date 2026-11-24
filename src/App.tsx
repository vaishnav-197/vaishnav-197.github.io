import { lazy, Suspense, useEffect } from "react";
import { MotionConfig } from "motion/react";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Masthead } from "@/sections/Masthead";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Experience } from "@/sections/Experience";
import { Work } from "@/sections/Work";
import { Lab } from "@/sections/Lab";
import { Toolkit } from "@/sections/Toolkit";
import { Writing } from "@/sections/Writing";
import { Education } from "@/sections/Education";
import { Contact } from "@/sections/Contact";
import { Footer } from "@/sections/Footer";
import { startSwarm } from "@/lib/swarm";

const Band = lazy(() => import("@/sections/Band").then((m) => ({ default: m.Band })));
const Activity = lazy(() => import("@/sections/Activity").then((m) => ({ default: m.Activity })));

export default function App() {
  useEffect(() => startSwarm(), []);

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only rounded-full bg-ink text-sm text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-50 focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Masthead />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <About />
        <Experience />
        <Suspense fallback={<div className="h-[281px] border-t border-rule" />}>
          <Band />
        </Suspense>
        <Work />
        <Lab />
        <Toolkit />
        <Suspense fallback={<div id="activity" className="min-h-[320px] border-t border-rule" />}>
          <Activity />
        </Suspense>
        <Writing />
        <Education />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  );
}
