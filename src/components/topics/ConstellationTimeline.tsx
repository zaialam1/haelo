"use client";

import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { MonthAnchor, TimelineNode } from "@/lib/topics/types";

type ConstellationTimelineProps = {
  nodes: TimelineNode[];
  monthAnchors: MonthAnchor[];
  isEmpty: boolean;
  planetColor: string;
  selectedId: string | null;
  onSelect: (node: TimelineNode) => void;
};

const VIEW_W = 900;
const VIEW_H = 320;
const PAD_X = 48;
const PAD_Y = 36;

function toSvgX(x: number, scaleX: number): number {
  return (PAD_X + x * (VIEW_W - PAD_X * 2)) * scaleX;
}

function toSvgY(y: number): number {
  return PAD_Y + y * (VIEW_H - PAD_Y * 2 - 36);
}

/** Gentle empty constellation silhouette — decorative only, not selectable */
const EMPTY_PATH: Array<{ x: number; y: number }> = [
  { x: 0.12, y: 0.42 },
  { x: 0.28, y: 0.28 },
  { x: 0.42, y: 0.55 },
  { x: 0.58, y: 0.35 },
  { x: 0.72, y: 0.48 },
  { x: 0.88, y: 0.32 },
];

const EMPTY_MONTHS = ["Sep", "Oct", "Nov", "Dec", "Jan"];

export function ConstellationTimeline({
  nodes,
  monthAnchors,
  isEmpty,
  planetColor,
  selectedId,
  onSelect,
}: ConstellationTimelineProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    scrollLeft: number;
    active: boolean;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const moved = useRef(false);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Defer capture until the pointer actually drags — otherwise clicks on
    // constellation nodes never reach the SVG hit targets.
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      active: false,
    };
    moved.current = false;
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    const state = drag.current;
    if (!el || !state) return;
    const dx = e.clientX - state.startX;
    if (!state.active) {
      if (Math.abs(dx) < 8) return;
      state.active = true;
      moved.current = true;
      setDragging(true);
      el.setPointerCapture(state.pointerId);
    }
    el.scrollLeft = state.scrollLeft - dx;
  }, []);

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    const state = drag.current;
    if (el && state?.active && el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    drag.current = null;
    setDragging(false);
  }, []);

  const contentWidth = Math.max(
    VIEW_W,
    isEmpty ? VIEW_W : PAD_X * 2 + Math.max(nodes.length, 1) * 110,
  );
  const scaleX = contentWidth / VIEW_W;

  return (
    <section className="relative z-10 mt-4 px-5 sm:px-8">
      <div
        ref={scrollerRef}
        className="planet-timeline-scroll overflow-x-auto overflow-y-hidden rounded-3xl select-none"
        style={{
          cursor: dragging ? "grabbing" : "grab",
          background: `radial-gradient(ellipse 55% 70% at 50% 38%, color-mix(in srgb, ${planetColor} 14%, transparent), transparent 65%), radial-gradient(ellipse 70% 80% at 50% 40%, color-mix(in srgb, var(--violet) 10%, transparent), transparent 60%), color-mix(in srgb, var(--surface) 72%, transparent)`,
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--shadow-soft)",
          WebkitOverflowScrolling: "touch",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="planet-timeline-starfield" aria-hidden="true" />

        <svg
          width={contentWidth}
          height={VIEW_H}
          viewBox={`0 0 ${contentWidth} ${VIEW_H}`}
          className="relative z-[1] block min-w-full"
          role="img"
          aria-label={
            isEmpty
              ? "Empty reflection constellation. Your first reflection will appear here."
              : "Reflection timeline constellation"
          }
        >
          <line
            x1={PAD_X * scaleX}
            y1={VIEW_H - 28}
            x2={contentWidth - PAD_X * scaleX}
            y2={VIEW_H - 28}
            stroke="var(--hairline)"
            strokeWidth="1"
          />

          {isEmpty
            ? EMPTY_MONTHS.map((label, i) => {
                const x =
                  PAD_X * scaleX +
                  (i / (EMPTY_MONTHS.length - 1)) *
                    (contentWidth - PAD_X * 2 * scaleX);
                return (
                  <text
                    key={label}
                    x={x}
                    y={VIEW_H - 10}
                    textAnchor="middle"
                    fill="var(--foreground-muted)"
                    fontSize="11"
                    opacity="0.55"
                  >
                    {label}
                  </text>
                );
              })
            : monthAnchors.map((m) => (
                <text
                  key={m.key}
                  x={toSvgX(m.x, scaleX)}
                  y={VIEW_H - 10}
                  textAnchor="middle"
                  fill="var(--foreground-muted)"
                  fontSize="11"
                >
                  {m.label}
                </text>
              ))}

          {isEmpty ? (
            <>
              {EMPTY_PATH.slice(0, -1).map((p, i) => {
                const n = EMPTY_PATH[i + 1];
                return (
                  <line
                    key={`e-${i}`}
                    x1={toSvgX(p.x, scaleX)}
                    y1={toSvgY(p.y)}
                    x2={toSvgX(n.x, scaleX)}
                    y2={toSvgY(n.y)}
                    stroke={planetColor}
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    opacity="0.2"
                  />
                );
              })}
              {EMPTY_PATH.map((p, i) => (
                <g key={`en-${i}`}>
                  <circle
                    cx={toSvgX(p.x, scaleX)}
                    cy={toSvgY(p.y)}
                    r={11 + (i % 3)}
                    fill={planetColor}
                    opacity="0.07"
                  />
                  <circle
                    cx={toSvgX(p.x, scaleX)}
                    cy={toSvgY(p.y)}
                    r={5 + (i % 3)}
                    fill={planetColor}
                    opacity="0.18"
                  />
                </g>
              ))}
              <text
                x={contentWidth / 2}
                y={VIEW_H / 2 + 8}
                textAnchor="middle"
                fill="var(--foreground-muted)"
                fontSize="13"
                opacity="0.9"
              >
                Your first reflection will appear here
              </text>
            </>
          ) : (
            <>
              {nodes.slice(0, -1).map((n, i) => {
                const next = nodes[i + 1];
                return (
                  <line
                    key={`edge-${n.id}-${next.id}`}
                    className="planet-edge"
                    x1={toSvgX(n.x, scaleX)}
                    y1={toSvgY(n.y)}
                    x2={toSvgX(next.x, scaleX)}
                    y2={toSvgY(next.y)}
                    stroke="color-mix(in srgb, var(--violet) 45%, transparent)"
                    strokeWidth="1.5"
                    opacity={Math.min(n.emphasis, next.emphasis) * 0.7}
                    strokeLinecap="round"
                  />
                );
              })}
              {nodes.map((n) => {
                const cx = toSvgX(n.x, scaleX);
                const cy = toSvgY(n.y);
                const r = 7 * n.size;
                const selected = selectedId === n.id;
                return (
                  <g
                    key={n.id}
                    className="planet-node planet-node-hit"
                    transform={`translate(${cx} ${cy})`}
                    style={{
                      opacity: n.emphasis,
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (moved.current) return;
                      onSelect(n);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${n.isDaily ? "Daily prompt reflection" : "Reflection"} from ${new Date(n.recordedAt).toLocaleDateString()}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(n);
                      }
                    }}
                  >
                    {/* Larger invisible hit target */}
                    <circle cx={0} cy={0} r={Math.max(r + 14, 22)} fill="transparent" />
                    <circle
                      cx={0}
                      cy={0}
                      r={r + 10}
                      fill={n.tint}
                      opacity={0.1 + n.glow * 0.1}
                      style={{ pointerEvents: "none" }}
                    />
                    {n.growth && (
                      <circle
                        cx={0}
                        cy={0}
                        r={r + 7}
                        fill="none"
                        stroke="var(--gold)"
                        strokeWidth="1.5"
                        opacity={0.65}
                        style={{ pointerEvents: "none" }}
                      />
                    )}
                    {n.isDaily && (
                      <circle
                        cx={0}
                        cy={0}
                        r={r + 5}
                        fill="none"
                        stroke="var(--gold)"
                        strokeWidth="1.25"
                        strokeDasharray="2.5 2"
                        opacity={0.85}
                        style={{ pointerEvents: "none" }}
                      />
                    )}
                    <circle
                      cx={0}
                      cy={0}
                      r={r + (selected ? 3.5 : 0)}
                      fill={n.tint}
                      opacity={0.5 + n.glow * 0.45}
                      style={{
                        pointerEvents: "none",
                        filter: `drop-shadow(0 0 ${8 + n.glow * 12}px color-mix(in srgb, ${n.tint} ${45 + n.glow * 35}%, transparent))`,
                        transition:
                          "r 300ms ease, opacity 350ms ease, filter 350ms ease",
                      }}
                    />
                    {n.isDaily && (
                      <text
                        x={0}
                        y={r + 16}
                        textAnchor="middle"
                        fill="var(--violet)"
                        fontSize="9"
                        fontWeight="600"
                        letterSpacing="0.06em"
                        style={{ pointerEvents: "none" }}
                      >
                        DAILY
                      </text>
                    )}
                  </g>
                );
              })}
            </>
          )}
        </svg>
      </div>
    </section>
  );
}
