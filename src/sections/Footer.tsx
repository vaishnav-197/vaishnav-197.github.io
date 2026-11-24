import { container } from "./Section";

export function Footer() {
  return (
    <footer className="border-t border-rule py-8">
      <div className={`${container} flex flex-wrap justify-between gap-4`}>
        <p className="meta">© {new Date().getFullYear()} Vaishnav Valsaraj</p>
        <p className="meta">Set in Instrument Serif, Inter and JetBrains Mono</p>
      </div>
    </footer>
  );
}
