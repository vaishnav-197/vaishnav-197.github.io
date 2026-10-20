import { lazy, Suspense } from "react";
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

const Activity = lazy(() => import("@/sections/Activity").then((m) => ({ default: m.Activity })));

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <Masthead />
      <main>
        <Hero />
        <About />
        <Experience />
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
