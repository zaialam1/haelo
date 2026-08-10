"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/professional", label: "Overview", exact: true },
  { href: "/professional/connections", label: "Connections" },
  { href: "/professional/recommend", label: "Recommend" },
] as const;

export function ProfessionalModeNav() {
  const pathname = usePathname();

  return (
    <nav className="professional-mode-nav" aria-label="Professional">
      {LINKS.map((link) => {
        const active =
          "exact" in link && link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <TransitionLink
            key={link.href}
            href={link.href}
            variant="fade"
            className={`professional-mode-nav__link${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </TransitionLink>
        );
      })}
    </nav>
  );
}
