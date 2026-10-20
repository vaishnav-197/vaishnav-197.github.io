import { AnimatedSpan, Terminal, TypingAnimation } from "@/components/ui/terminal";

export default function FpsTerminal() {
  return (
    <Terminal className="max-w-none font-mono text-[11px] md:text-[13px]">
      <TypingAnimation>$ npm install @vyshnav18/react-native-fps-counter</TypingAnimation>
      <AnimatedSpan className="text-muted">added 1 package</AnimatedSpan>
      <TypingAnimation>$ cd ios && pod install</TypingAnimation>
      <AnimatedSpan className="text-muted">Pod installation complete</AnimatedSpan>
      <AnimatedSpan>
        <span>
          <span className="text-accent">import</span> {"{ FPSOverlay }"} <span className="text-accent">from</span>{" "}
          '@vyshnav18/react-native-fps-counter'
        </span>
      </AnimatedSpan>
      <AnimatedSpan>{"<FPSOverlay />  // JS + UI thread FPS"}</AnimatedSpan>
    </Terminal>
  );
}
