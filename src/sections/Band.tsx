import ScrollVelocity from "@/components/ScrollVelocity";
import { profile } from "@/content";

const type = {
  fontFamily: "var(--font-serif)",
  fontWeight: 400,
  lineHeight: 1.15,
  filter: "none",
};

/** Decorative type band between sections; slides faster as the page scrolls. */
export function Band() {
  return (
    <div aria-hidden data-swarm="type" data-swarm-label="Services, databases…" className="overflow-hidden border-t border-rule py-10 md:py-16">
      <ScrollVelocity
        texts={[
          "Services, databases and the interfaces on top of them",
          <span className="italic text-accent">{profile.stack.join(" · ")}</span>,
        ]}
        velocity={40}
        numCopies={4}
        separator={<span className="text-muted">✳</span>}
        fontSize="clamp(2.75rem, 8vw, 6.5rem)"
        scrollerStyle={type}
        fadeEdges
      />
    </div>
  );
}
