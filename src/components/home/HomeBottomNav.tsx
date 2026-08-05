"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/transitions/TransitionLink";

function NavItem({
  href,
  label,
  active,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: ReactNode;
}) {
  return (
    <TransitionLink
      href={href}
      variant="fade"
      className="flex min-w-[5.5rem] flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
      style={{
        color: active ? "var(--violet)" : "var(--foreground-muted)",
      }}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span className="text-[0.6875rem] font-medium tracking-wide">{label}</span>
    </TransitionLink>
  );
}

export function HomeBottomNav() {
  const pathname = usePathname();
  const onUniverse = pathname === "/home" || pathname.startsWith("/home/");
  const onJourney = pathname === "/journey" || pathname.startsWith("/journey/");

  return (
    <nav
      className="home-bottom-nav pointer-events-auto absolute inset-x-0 bottom-0 z-40"
      aria-label="Primary"
    >
      <div
        className="mx-auto flex h-[4.25rem] items-center justify-center gap-2 px-4 pb-[env(safe-area-inset-bottom)] sm:h-20 sm:px-6"
        style={{
          background:
            "linear-gradient(to top, color-mix(in srgb, var(--background) 92%, transparent), color-mix(in srgb, var(--background) 55%, transparent) 70%, transparent)",
        }}
      >
        <div className="flex items-center gap-1">
          <NavItem
            href="/home"
            label="Universe"
            active={onUniverse}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="7.5" strokeOpacity="0.55" />
                <circle cx="12" cy="12" r="11" strokeOpacity="0.28" />
              </svg>
            }
          />
          <NavItem
            href="/journey"
            label="Journey"
            active={onJourney}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 19c2.5-1.5 4-4 4-7V6" />
                <path d="M12 19c2.5-1.5 4-4 4-7V6" />
                <path d="M8 10h8" strokeOpacity="0.5" />
                <circle cx="8" cy="6" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="16" cy="6" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            }
          />
        </div>
      </div>
    </nav>
  );
}
