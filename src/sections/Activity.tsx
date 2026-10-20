import { GithubGraph } from "@/components/unlumen-ui/github-graph";
import { profile } from "@/content";
import { Section } from "./Section";

export function Activity() {
  return (
    <Section id="activity" number="06" label="On GitHub">
      <div className="overflow-x-auto pb-2" role="img" aria-label="GitHub contributions over the last year">
        <GithubGraph
          account="vaishnav-197"
          months={12}
          variant="editorial"
          cellSize={12}
          cellGap={3}
          animation="wave"
          ambientEffect="none"
          showAccount={false}
          showLegend
        />
      </div>
      <p className="meta mt-4">
        Contributions over the last year ·{" "}
        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-ink link-underline">
          github.com/vaishnav-197 ↗
        </a>
      </p>
    </Section>
  );
}
