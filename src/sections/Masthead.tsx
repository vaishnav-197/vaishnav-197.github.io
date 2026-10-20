import { useEffect, useState } from "react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { container } from "./Section";

const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
});

function LocalTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="meta hidden sm:inline">
      Bengaluru · <time dateTime={now.toISOString()}>{clock.format(now)}</time> IST
    </span>
  );
}

const links = [
  { href: "#work", label: "Work" },
  { href: "#writing", label: "Writing" },
  { href: "#contact", label: "Contact" },
];

export function Masthead() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-md">
      <div className={`${container} flex h-14 items-center justify-between`}>
        <div className="flex items-baseline gap-5">
          <a href="#top" className="font-serif text-2xl leading-none" aria-label="V.V. — Vaishnav Valsaraj, home">
            V.V.
          </a>
          <LocalTime />
        </div>
        <nav className="flex items-center gap-5 text-sm sm:gap-7">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="link-underline">
              {l.label}
            </a>
          ))}
          <AnimatedThemeToggler
            className="grid size-8 place-items-center rounded-full border border-rule transition-colors hover:border-ink [&_svg]:size-3.5"
            aria-label="Toggle colour theme"
          />
        </nav>
      </div>
    </header>
  );
}
