import { lazy, Suspense, useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { experience, lab, work } from "@/content";

const loadMenu = () => import("@/components/FlowingMenu");
const FlowingMenu = lazy(loadMenu);

/** Start fetching the menu before it opens (on hover or focus of the menu button). */
export const preloadMenu = () => void loadMenu();

export const menuItems = [
  { id: "about", text: "About", meta: "01", marquee: "Off the clock · Bengaluru, India ·" },
  { id: "experience", text: "Experience", meta: "02", marquee: `${experience.map((r) => r.company).join(" · ")} ·` },
  { id: "work", text: "Work", meta: "03", marquee: `${work.map((w) => w.title).join(" · ")} ·` },
  { id: "lab", text: "Lab", meta: "04", marquee: `${lab.map((l) => l.title).join(" · ")} ·` },
  { id: "writing", text: "Writing", meta: "07", marquee: "Essays on Medium ·" },
  { id: "contact", text: "Contact", meta: "09", marquee: "Say hello · Email · GitHub · LinkedIn ·" },
];

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  open: boolean;
  activeId: string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
};

/** Full-screen contents panel under the masthead. */
export function SiteMenu({ open, activeId, onClose, onNavigate }: Props) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Everything except the masthead and this panel stops taking focus and clicks while open.
    const root = document.getElementById("root");
    const behind = [...(root?.children ?? [])].filter(
      (el) => el.tagName !== "HEADER" && el !== panelRef.current,
    ) as HTMLElement[];
    behind.forEach((el) => (el.inert = true));
    document.documentElement.style.overflow = "hidden";
    panelRef.current?.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      behind.forEach((el) => (el.inert = false));
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const hidden = reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" };
  const shown = reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          id="site-menu"
          role="dialog"
          aria-label="Site menu"
          tabIndex={-1}
          className="fixed inset-x-0 top-14 bottom-0 z-30 bg-paper outline-none"
          initial={hidden}
          animate={shown}
          exit={hidden}
          transition={{ duration: 0.6, ease }}
        >
          <Suspense fallback={null}>
            <FlowingMenu
              items={menuItems.map(({ id, text, meta, marquee }) => ({ text, meta, marquee, link: `#${id}` }))}
              activeIndex={menuItems.findIndex((item) => item.id === activeId)}
              onItemClick={(_, index, event) => {
                event.preventDefault();
                onNavigate(menuItems[index].id);
              }}
              ariaLabel="Sections"
              align="left"
              direction="alternate"
              speed={50}
              textColor="var(--ink)"
              bgColor="var(--paper)"
              marqueeBgColor="var(--ink)"
              marqueeTextColor="var(--paper)"
              borderColor="var(--rule)"
              className="font-serif"
            />
          </Suspense>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
