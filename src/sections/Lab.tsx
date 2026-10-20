import { lab, profile } from "@/content";
import { Section } from "./Section";

export function Lab() {
  return (
    <Section id="lab" number="04" label="Lab">
      {lab.length === 0 ? (
        <div>
          <p className="font-serif text-3xl leading-tight italic md:text-4xl">
            Go and distributed-systems experiments land here as they ship.
          </p>
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm link-underline">
            Follow along on GitHub ↗
          </a>
        </div>
      ) : (
        <ol>
          {lab.map((entry) => {
            const row = (
              <>
                <span className="font-serif text-2xl leading-snug">{entry.title}</span>
                <span className="text-[15px] text-muted">{entry.summary}</span>
                <span className="meta">{entry.stack.join(" · ")}</span>
                <span className="meta text-accent">{entry.status}</span>
              </>
            );
            return (
              <li key={entry.title} className="border-t border-rule last:border-b">
                {entry.href ? (
                  <a
                    href={entry.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid gap-2 py-4 hover:text-accent md:grid-cols-[1fr_auto] md:gap-x-6"
                  >
                    {row}
                  </a>
                ) : (
                  <div className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:gap-x-6">{row}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </Section>
  );
}
