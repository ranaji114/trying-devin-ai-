import Link from "next/link";
import { Mountain } from "lucide-react";

const LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[15px] font-semibold">
            <Mountain className="h-4 w-4 text-accent" aria-hidden />
            TrekLog
          </div>
          <p className="mt-2 text-sm text-muted">
            Document your journey. Guide the next traveler.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="container-page py-4 text-xs text-muted">© 2026 TrekLog</div>
      </div>
    </footer>
  );
}
