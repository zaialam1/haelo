"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  pickFocusShortlist,
  pickRandomThree,
} from "@/lib/questions/bank";
import type { BankQuestion } from "@/lib/questions/types";
import type { TopicCatalogEntry } from "@/lib/topics/types";
import { useOptionalPageTransition } from "@/components/transitions/PageTransitionProvider";

type FocusSectionButtonProps = {
  topic: TopicCatalogEntry;
};

export function FocusSectionButton({ topic }: FocusSectionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        style={{
          background: "var(--violet)",
          color: "var(--on-violet)",
          boxShadow: "0 8px 24px color-mix(in srgb, var(--violet) 28%, transparent)",
        }}
      >
        Focus on discussing this section
      </button>

      {open && (
        <FocusPickerModal topic={topic} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function FocusPickerModal({
  topic,
  onClose,
}: {
  topic: TopicCatalogEntry;
  onClose: () => void;
}) {
  const transition = useOptionalPageTransition();
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const shortlist = useMemo(
    () => pickFocusShortlist(topic.id, 10),
    [topic.id],
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      if (next.size >= 3) return prev;
      next.add(id);
      return next;
    });
  }

  function startWithIds(ids: string[]) {
    const href = `/speak?mode=focus&topicId=${encodeURIComponent(topic.id)}&q=${encodeURIComponent(ids.join(","))}`;
    if (transition) {
      transition.navigate({ href, variant: "fade" });
    } else {
      window.location.href = href;
    }
  }

  function startSelected() {
    if (selected.size !== 3) return;
    startWithIds(Array.from(selected));
  }

  function startRandom() {
    const three = pickRandomThree(shortlist);
    startWithIds(three.map((q) => q.id));
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 220ms ease",
      }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/35"
        aria-label="Close focus picker"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 mx-4 mb-[max(1rem,env(safe-area-inset-bottom))] flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl sm:mb-0"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--shadow-soft)",
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease",
          opacity: visible ? 1 : 0,
        }}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
          <div>
            <p
              id={titleId}
              className="font-[family-name:var(--font-fraunces)] text-xl leading-snug"
              style={{
                fontVariationSettings: '"opsz" 72, "SOFT" 45, "WONK" 0, "wght" 550',
                color: "var(--foreground)",
              }}
            >
              Focus on {topic.label}
            </p>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              Pick three questions from this shortlist. You&rsquo;ll answer them
              in one continuous recording on this planet.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2.5 py-1 text-lg leading-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{ color: "var(--foreground-muted)" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <ul className="mt-4 flex-1 space-y-2 overflow-y-auto px-5 pb-2 sm:px-6">
          {shortlist.map((q) => (
            <FocusQuestionRow
              key={q.id}
              question={q}
              checked={selected.has(q.id)}
              disabled={!selected.has(q.id) && selected.size >= 3}
              onToggle={() => toggle(q.id)}
            />
          ))}
        </ul>

        <div
          className="flex flex-col gap-2 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          style={{ borderColor: "var(--hairline)" }}
        >
          <button
            type="button"
            onClick={startRandom}
            className="rounded-full px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{
              color: "var(--violet)",
              background: "color-mix(in srgb, var(--violet) 10%, transparent)",
            }}
          >
            Choose 3 random for me
          </button>
          <button
            type="button"
            onClick={startSelected}
            disabled={selected.size !== 3}
            className="rounded-full bg-[var(--violet)] px-5 py-2.5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            Start ({selected.size}/3)
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function FocusQuestionRow({
  question,
  checked,
  disabled,
  onToggle,
}: {
  question: BankQuestion;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <label
        className="flex cursor-pointer gap-3 rounded-2xl px-3 py-3 transition-colors"
        style={{
          background: checked
            ? "color-mix(in srgb, var(--violet) 12%, var(--surface))"
            : "color-mix(in srgb, var(--rose) 8%, var(--surface))",
          border: checked
            ? "1px solid color-mix(in srgb, var(--violet) 40%, transparent)"
            : "1px solid transparent",
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onToggle}
          className="mt-1 size-4 shrink-0 accent-[var(--violet)]"
        />
        <span
          className="text-sm leading-relaxed"
          style={{ color: "var(--foreground)" }}
        >
          {question.text}
        </span>
      </label>
    </li>
  );
}
