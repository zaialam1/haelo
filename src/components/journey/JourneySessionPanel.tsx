"use client";

import { useEffect, useId, useRef } from "react";
import { JourneySessionDetail } from "@/components/journey/JourneySessionDetail";
import type { JourneyNode, JourneySession } from "@/lib/journey/types";

type JourneySessionPanelProps = {
  session: JourneySession | JourneyNode | null;
  open: boolean;
  onClose: () => void;
};

export function JourneySessionPanel({
  session,
  open,
  onClose,
}: JourneySessionPanelProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open, session?.sessionId]);

  return (
    <>
      <div
        className="journey-panel-backdrop fixed inset-0 z-40 bg-black/25"
        data-open={open}
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        className="journey-session-panel fixed z-50 flex flex-col overflow-y-auto outline-none"
        style={{
          background: "var(--surface)",
          borderColor: "var(--surface-border)",
        }}
        data-open={open}
        aria-hidden={!open}
        aria-labelledby={titleId}
        role="dialog"
        aria-modal="true"
      >
        {session ? (
          <div
            key={session.sessionId}
            className="flex flex-1 flex-col px-6 py-6 sm:px-7"
          >
            <h2 id={titleId} className="sr-only">
              {session.planetLabel} session details
            </h2>
            <JourneySessionDetail
              session={session}
              headerAction={
                <button
                  type="button"
                  onClick={onClose}
                  className="journey-btn journey-btn-ghost rounded-full px-2.5 py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                  style={{ color: "var(--foreground-muted)" }}
                  aria-label="Close session details"
                >
                  Close
                </button>
              }
            />
          </div>
        ) : null}
      </aside>
    </>
  );
}
