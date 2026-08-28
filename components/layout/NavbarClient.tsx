"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils/cn";

interface NavbarClientProps {
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

const AUTHED_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/create", label: "Create Log" },
  { href: "/saved", label: "Saved" },
];

const GUEST_LINKS = [{ href: "/explore", label: "Explore" }];

export function NavbarClient({ username, fullName, avatarUrl }: NavbarClientProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = username ? AUTHED_LINKS : GUEST_LINKS;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const initials = (fullName ?? username ?? "T").slice(0, 1).toUpperCase();

  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === link.href ? "text-accent" : "text-muted hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        ))}

        {username ? (
          <div className="ml-2 flex items-center gap-2">
            <Link
              href={`/profile/${username}`}
              className="flex items-center gap-2 rounded-lg border border-line px-2 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-background"
            >
              <span
                aria-hidden
                className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-accent text-[11px] font-semibold text-white"
                style={
                  avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: "cover" } : undefined
                }
              >
                {avatarUrl ? "" : initials}
              </span>
              <span className="sr-only">Open your profile</span>
              <span aria-hidden>{username}</span>
            </Link>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                Log out
              </Button>
            </form>
          </div>
        ) : (
          <ButtonLink href="/login" size="sm" className="ml-2">
            Login
          </ButtonLink>
        )}
      </nav>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink md:hidden"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>

      {open ? (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-16 border-b border-line bg-surface px-4 py-4 shadow-sm md:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-background"
              >
                {link.label}
              </Link>
            ))}
            {username ? (
              <>
                <Link
                  href={`/profile/${username}`}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-background"
                >
                  Profile
                </Link>
                <form action={logout} className="px-1 pt-2">
                  <Button type="submit" variant="secondary" size="sm" className="w-full">
                    Log out
                  </Button>
                </form>
              </>
            ) : (
              <ButtonLink href="/login" size="sm" className="mt-2">
                Login
              </ButtonLink>
            )}
          </nav>
        </div>
      ) : null}
    </>
  );
}
