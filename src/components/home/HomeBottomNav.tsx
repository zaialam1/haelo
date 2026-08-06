"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/transitions/TransitionLink";

function NavItem({
  href,
  label,
  active,
  icon,
  emphasize,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: ReactNode;
  /** Universe stays visually strongest / centered. */
  emphasize?: boolean;
}) {
  return (
    <TransitionLink
      href={href}
      variant="fade"
      className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-[color,transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] ${
        emphasize ? "min-w-[6.25rem]" : "min-w-[5.25rem]"
      }`}
      style={{
        color: active
          ? "var(--violet)"
          : emphasize
            ? "color-mix(in srgb, var(--foreground) 72%, var(--foreground-muted))"
            : "var(--foreground-muted)",
      }}
      aria-current={active ? "page" : undefined}
    >
      <span
        className={emphasize ? "scale-110" : undefined}
        style={{ display: "inline-flex" }}
      >
        {icon}
      </span>
      <span
        className={`tracking-wide ${
          emphasize
            ? "text-[0.75rem] font-semibold"
            : "text-[0.6875rem] font-medium"
        }`}
      >
        {label}
      </span>
    </TransitionLink>
  );
}

export function HomeBottomNav() {
  const pathname = usePathname();
  const onUniverse = pathname === "/home" || pathname.startsWith("/home/");
  const onJourney = pathname === "/journey" || pathname.startsWith("/journey/");
  const onOrbits = pathname === "/orbits" || pathname.startsWith("/orbits/");

  return (
    <nav
      className="home-bottom-nav pointer-events-auto absolute inset-x-0 bottom-0 z-40"
      aria-label="Primary"
    >
      <div
        className="mx-auto flex h-[4.25rem] items-center justify-center gap-1 px-3 pb-[env(safe-area-inset-bottom)] sm:h-20 sm:gap-2 sm:px-6"
        style={{
          background:
            "linear-gradient(to top, color-mix(in srgb, var(--background) 92%, transparent), color-mix(in srgb, var(--background) 55%, transparent) 70%, transparent)",
        }}
      >
        <div className="flex items-center gap-0.5 sm:gap-1">
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
          <NavItem
            href="/home"
            label="Universe"
            active={onUniverse}
            emphasize
            icon={
              <svg
                width="22"
                height="22"
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
            href="/orbits"
            label="Orbits"
            active={onOrbits}
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
                <ellipse cx="12" cy="12" rx="9" ry="4.5" />
                <ellipse
                  cx="12"
                  cy="12"
                  rx="9"
                  ry="4.5"
                  transform="rotate(60 12 12)"
                  strokeOpacity="0.55"
                />
                <ellipse
                  cx="12"
                  cy="12"
                  rx="9"
                  ry="4.5"
                  transform="rotate(120 12 12)"
                  strokeOpacity="0.35"
                />
                <circle cx="12" cy="12" r="1.75" fill="currentColor" stroke="none" />
              </svg>
            }
          />
        </div>
      </div>
    </nav>
  );
}
