import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const container = "mx-auto w-full max-w-6xl px-4 md:px-8";

type Props = {
  id: string;
  number: string;
  label: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Numbered editorial section: label column on the left, content on the right. */
export function Section({ id, number, label, aside, children, className }: Props) {
  return (
    <section id={id} className={cn("border-t border-rule py-16 md:py-24", className)}>
      <div className={cn(container, "grid gap-8 md:grid-cols-12")}>
        <div className="md:col-span-3">
          <div className="md:sticky md:top-24">
            <h2 className="meta">
              {number} — {label}
            </h2>
            {aside}
          </div>
        </div>
        <div className="min-w-0 md:col-span-9">{children}</div>
      </div>
    </section>
  );
}
