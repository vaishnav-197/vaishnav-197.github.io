import { AuroraText } from "@/components/ui/aurora-text";
import { profile } from "@/content";
import { container } from "./Section";

export function Contact() {
  const links = [
    { label: "Email", href: `mailto:${profile.email}` },
    { label: "GitHub", href: profile.github },
    { label: "LinkedIn", href: profile.linkedin },
    { label: "Medium", href: `https://medium.com/@${profile.medium}` },
  ];

  return (
    <section id="contact" className="border-t border-rule py-20 md:py-32">
      <div className={container}>
        <h2 className="meta">09 — Contact</h2>
        <a href={`mailto:${profile.email}`} className="mt-6 block font-serif text-[clamp(4rem,14vw,11rem)] leading-[0.9] tracking-[-0.02em]">
          Say{" "}
          <AuroraText className="italic" colors={["#c23a22", "#e98a5c", "#b9a7e8", "#e98a5c"]} speed={0.6}>
            hello.
          </AuroraText>
        </a>
        <p className="mt-6 max-w-md text-muted">
          Happy to talk services, databases, front ends — or whatever you are building.
        </p>

        <div className="mt-12 grid gap-8 border-t border-rule pt-6 md:grid-cols-2">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="link-underline"
                  {...(l.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:justify-end">
            <li>
              <a href={profile.resume} download className="link-underline">
                Resume ↓
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
