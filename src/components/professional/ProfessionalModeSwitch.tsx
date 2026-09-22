"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  isProfessionalPath,
  personalHomePath,
  professionalHomePath,
  writeStoredAppMode,
  type HaloAppMode,
} from "@/lib/professional/mode";

type Props = {
  /** Compact for mobile header */
  compact?: boolean;
};

/**
 * Persistent Personal | Professional mode control for professional accounts.
 * Current mode is derived from the route (no effect sync).
 */
export function ProfessionalModeSwitch({ compact = false }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const mode: HaloAppMode = isProfessionalPath(pathname)
    ? "professional"
    : "personal";

  function switchTo(next: HaloAppMode) {
    if (next === mode) return;
    writeStoredAppMode(next);

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const navigate = () => {
      if (next === "professional") {
        router.push(professionalHomePath());
      } else {
        router.push(personalHomePath());
      }
    };

    if (reduceMotion) {
      navigate();
      return;
    }

    document.documentElement.classList.add("halo-mode-transition");
    document.documentElement.dataset.haloMode = next;
    window.setTimeout(() => {
      navigate();
      window.setTimeout(() => {
        document.documentElement.classList.remove("halo-mode-transition");
      }, 400);
    }, 180);
  }

  return (
    <div
      className={`halo-mode-switch ${compact ? "halo-mode-switch--compact" : ""}`}
      role="group"
      aria-label="Halo mode"
    >
      <button
        type="button"
        className="halo-mode-switch__option"
        aria-pressed={mode === "personal"}
        onClick={() => switchTo("personal")}
      >
        Personal
      </button>
      <span className="halo-mode-switch__mark" aria-hidden="true">
        ✦
      </span>
      <button
        type="button"
        className="halo-mode-switch__option"
        aria-pressed={mode === "professional"}
        onClick={() => switchTo("professional")}
      >
        Professional
      </button>
    </div>
  );
}
