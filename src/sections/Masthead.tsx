import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { container } from "./Section";
import { menuItems, preloadMenu, SiteMenu } from "./SiteMenu";

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

const ease = [0.22, 1, 0.36, 1] as const;

/** The id of the menu section crossing the middle of the viewport, if any. */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) setActive(id);
          else setActive((current) => (current === id ? null : current));
        }
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    for (const { id } of menuItems) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return active;
}

function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls="site-menu"
      onClick={onClick}
      onPointerEnter={preloadMenu}
      onFocus={preloadMenu}
      className="flex h-8 items-center gap-2.5 rounded-full border border-rule px-3 text-sm transition-colors duration-300 hover:border-ink active:scale-[0.98]"
    >
      {/* Two lines that cross into an X. */}
      <span aria-hidden className="relative block h-2.5 w-4">
        <motion.span
          className="absolute top-0 left-0 block h-px w-full bg-current"
          animate={open ? { y: 4.5, rotate: 45 } : { y: 0, rotate: 0 }}
          transition={{ duration: 0.5, ease }}
        />
        <motion.span
          className="absolute bottom-0 left-0 block h-px w-full bg-current"
          animate={open ? { y: -4.5, rotate: -45 } : { y: 0, rotate: 0 }}
          transition={{ duration: 0.5, ease }}
        />
      </span>
      {open ? "Close" : "Menu"}
    </button>
  );
}

export function Masthead() {
  const active = useActiveSection();
  const current = menuItems.find((item) => item.id === active);
  const [open, setOpen] = useState(false);
  const wasOpen = useRef(false);
  const reduce = useReducedMotion();

  // Return focus to the menu button when the panel closes.
  const buttonWrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (wasOpen.current && !open) buttonWrap.current?.querySelector("button")?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  const close = useCallback(() => setOpen(false), []);
  const navigate = useCallback(
    (id: string) => {
      setOpen(false);
      // Unlock scrolling first: changing overflow mid-scroll would cancel a smooth scroll.
      document.documentElement.style.overflow = "";
      document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      history.replaceState(null, "", `#${id}`);
    },
    [reduce],
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-md">
        <div className={`${container} flex h-14 items-center justify-between`}>
          <div className="flex items-baseline gap-5">
            <a href="#top" className="font-serif text-2xl leading-none" aria-label="V.V. — Vaishnav Valsaraj, home">
              V.V.
            </a>
            <LocalTime />
          </div>
          <div ref={buttonWrap} className="flex items-center gap-3 sm:gap-5">
            {/* Running head: the section you're in. */}
            <span className="meta hidden md:inline" aria-live="off">
              {current && !open ? `${current.meta} — ${current.text}` : ""}
            </span>
            <MenuButton open={open} onClick={() => setOpen((value) => !value)} />
            <AnimatedThemeToggler
              className="grid size-8 place-items-center rounded-full border border-rule transition-colors hover:border-ink [&_svg]:size-3.5"
              aria-label="Toggle colour theme"
            />
          </div>
        </div>
      </header>
      <SiteMenu open={open} activeId={active} onClose={close} onNavigate={navigate} />
    </>
  );
}
