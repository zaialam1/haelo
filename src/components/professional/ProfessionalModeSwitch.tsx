"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  isProfessionalPath,
  personalHomePath,
  professionalHomePath,
  writeStoredAppMode,
  type HaeloAppMode,
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
  const mode: HaeloAppMode = isProfessionalPath(pathname)
    ? "professional"
    : "personal";

  function switchTo(next: HaeloAppMode) {
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

    document.documentElement.classList.add("haelo-mode-transition");
    document.documentElement.dataset.haeloMode = next;
    window.setTimeout(() => {
      navigate();
      window.setTimeout(() => {
        document.documentElement.classList.remove("haelo-mode-transition");
      }, 400);
    }, 180);
  }

  return (
    <div
      className={`haelo-mode-switch ${compact ? "haelo-mode-switch--compact" : ""}`}
      role="group"
      aria-label="Haelo mode"
    >
      <button
        type="button"
        className="haelo-mode-switch__option"
        aria-pressed={mode === "personal"}
        onClick={() => switchTo("personal")}
      >
        Personal
      </button>
      <span className="haelo-mode-switch__mark" aria-hidden="true">
        ✦
      </span>
      <button
        type="button"
        className="haelo-mode-switch__option"
        aria-pressed={mode === "professional"}
        onClick={() => switchTo("professional")}
      >
        Professional
      </button>
    </div>
  );
}
