"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { planetAccent } from "@/lib/journey/mapSession";
import type {
  JourneyMonthAnchor,
  JourneyNode,
} from "@/lib/journey/types";

type JourneyConstellationProps = {
  nodes: JourneyNode[];
  monthAnchors: JourneyMonthAnchor[];
  selectedId: string | null;
  onSelect: (node: JourneyNode) => void;
  /** True when the full journey has zero sessions (not just a filtered empty) */
  journeyEmpty: boolean;
  /** Filtered empty while journey has sessions elsewhere */
  filterEmpty: boolean;
  filterLabel?: string;
};

const VIEW_H = 420;
const PAD_X = 56;
const PAD_Y = 48;
const BASE_W = 960;

function toX(x: number, contentWidth: number): number {
  return PAD_X + x * (contentWidth - PAD_X * 2);
}

function toY(y: number): number {
  return PAD_Y + y * (VIEW_H - PAD_Y * 2 - 40);
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function truncate(text: string, max = 42): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

/** Soft origin glow for empty / beginning states */
function OriginMarker({
  cx,
  cy,
  label,
}: {
  cx: number;
  cy: number;
  label: string;
}) {
  return (
    <g className="journey-origin" aria-hidden="true">
      <circle
        cx={cx}
        cy={cy}
        r={42}
        fill="none"
        stroke="color-mix(in srgb, var(--violet) 35%, transparent)"
        strokeWidth="1"
        strokeDasharray="3 5"
        opacity="0.55"
        className="journey-origin-orbit"
      />
      <circle
        cx={cx}
        cy={cy}
        r={18}
        fill="color-mix(in srgb, var(--violet) 12%, transparent)"
      />
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="color-mix(in srgb, var(--violet) 55%, transparent)"
      />
      <text
        x={cx}
        y={cy + 64}
        textAnchor="middle"
        fill="var(--foreground-muted)"
        fontSize="12"
        opacity="0.85"
      >
        {label}
      </text>
    </g>
  );
}

export function JourneyConstellation({
  nodes,
  monthAnchors,
  selectedId,
  onSelect,
  journeyEmpty,
  filterEmpty,
  filterLabel,
}: JourneyConstellationProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    scrollLeft: number;
    active: boolean;
  } | null>(null);
  const moved = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(320);
  const tooltipId = useId();

  const contentWidth = Math.max(
    BASE_W,
    journeyEmpty || filterEmpty
      ? BASE_W
      : PAD_X * 2 + Math.max(nodes.length, 1) * (nodes.length <= 3 ? 160 : 120),
  );

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
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
    setScrollLeft(el.scrollLeft);
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

  // Soft parallax on mouse move (desktop)
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const syncWidth = () => setViewportWidth(el.clientWidth);
    syncWidth();

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setParallax({ x: nx * 6, y: ny * 4 });
    };

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(syncWidth)
        : null;
    ro?.observe(el);
    el.addEventListener("mousemove", onMove);
    return () => {
      ro?.disconnect();
      el.removeEventListener("mousemove", onMove);
    };
  }, []);

  const hovered = nodes.find((n) => n.sessionId === hoveredId) ?? null;

  function handleNodeKey(
    e: ReactKeyboardEvent<SVGGElement>,
    node: JourneyNode,
  ) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(node);
    }
  }

  const ariaLabel = journeyEmpty
    ? "Empty journey constellation. Your first completed session will appear here."
    : filterEmpty
      ? `No ${filterLabel ?? "filtered"} sessions in your journey yet.`
      : `Journey constellation with ${nodes.length} session${nodes.length === 1 ? "" : "s"}`;

  return (
    <section
      className="journey-constellation relative z-10 flex-1 px-3 sm:px-6"
      aria-label="Your journey constellation"
    >
      <div
        ref={scrollerRef}
        className="journey-constellation-scroll relative h-full min-h-[280px] overflow-x-auto overflow-y-hidden rounded-[1.75rem] select-none sm:min-h-[360px]"
        style={{
          cursor: dragging ? "grabbing" : "grab",
          background:
            "radial-gradient(ellipse 60% 70% at 42% 40%, color-mix(in srgb, var(--violet) 14%, transparent), transparent 65%), radial-gradient(ellipse 45% 55% at 72% 55%, color-mix(in srgb, var(--rose) 10%, transparent), transparent 60%), color-mix(in srgb, var(--surface) 55%, transparent)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--shadow-soft)",
          WebkitOverflowScrolling: "touch",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
      >
        <div className="journey-starfield" aria-hidden="true" />
        <div
          className="journey-starfield-drift pointer-events-none absolute inset-0"
          style={{
            transform: `translate(${parallax.x * 0.4}px, ${parallax.y * 0.4}px)`,
          }}
          aria-hidden="true"
        />

        <svg
          width={contentWidth}
          height={VIEW_H}
          viewBox={`0 0 ${contentWidth} ${VIEW_H}`}
          className="relative z-[1] block h-full min-h-[280px] w-auto min-w-full sm:min-h-[360px]"
          role="img"
          aria-label={ariaLabel}
          style={{
            transform: `translate(${parallax.x * 0.15}px, ${parallax.y * 0.15}px)`,
            transition: dragging ? "none" : "transform 400ms ease-out",
          }}
        >
          {/* Soft horizon / time axis */}
          <line
            x1={PAD_X}
            y1={VIEW_H - 32}
            x2={contentWidth - PAD_X}
            y2={VIEW_H - 32}
            stroke="var(--hairline)"
            strokeWidth="1"
            opacity="0.7"
          />

          {!journeyEmpty &&
            !filterEmpty &&
            monthAnchors.map((m) => (
              <text
                key={m.key}
                x={toX(m.x, contentWidth)}
                y={VIEW_H - 12}
                textAnchor="middle"
                fill="var(--foreground-muted)"
                fontSize="11"
                letterSpacing="0.04em"
                opacity="0.75"
              >
                {m.label}
              </text>
            ))}

          {journeyEmpty ? (
            <OriginMarker
              cx={contentWidth * 0.38}
              cy={VIEW_H * 0.45}
              label="Where your constellation will begin"
            />
          ) : filterEmpty ? (
            <OriginMarker
              cx={contentWidth * 0.5}
              cy={VIEW_H * 0.45}
              label={
                filterLabel
                  ? `No ${filterLabel} stars yet`
                  : "No sessions for this planet yet"
              }
            />
          ) : (
            <>
              {/* Chronological connection paths */}
              {nodes.length > 1
                ? nodes.slice(0, -1).map((n, i) => {
                    const next = nodes[i + 1]!;
                    const x1 = toX(n.x, contentWidth);
                    const y1 = toY(n.y);
                    const x2 = toX(next.x, contentWidth);
                    const y2 = toY(next.y);
                    const mx = (x1 + x2) / 2;
                    const my = (y1 + y2) / 2 - 12;
                    return (
                      <path
                        key={`edge-${n.sessionId}-${next.sessionId}`}
                        d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                        fill="none"
                        stroke="color-mix(in srgb, var(--violet) 40%, transparent)"
                        strokeWidth="1.35"
                        strokeLinecap="round"
                        opacity="0.45"
                        className="journey-edge"
                      />
                    );
                  })
                : null}

              {/* Single-session origin ring */}
              {nodes.length === 1 ? (
                <OriginMarker
                  cx={toX(nodes[0]!.x, contentWidth)}
                  cy={toY(nodes[0]!.y)}
                  label=""
                />
              ) : null}

              {nodes.map((n) => {
                const cx = toX(n.x, contentWidth);
                const cy = toY(n.y);
                const accent = planetAccent(n.planet);
                const r = 6.5 * n.size * (n.isMilestone ? 1.15 : 1);
                const selected = selectedId === n.sessionId;
                const hoveredNow = hoveredId === n.sessionId;

                return (
                  <g
                    key={n.sessionId}
                    className="journey-node"
                    transform={`translate(${cx} ${cy})`}
                    style={{ cursor: "pointer" }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${n.planetLabel} session on ${shortDate(n.recordedAt)}: ${truncate(n.prompt, 60)}`}
                    aria-describedby={
                      hoveredNow || selected ? tooltipId : undefined
                    }
                    aria-pressed={selected}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (moved.current) return;
                      onSelect(n);
                    }}
                    onKeyDown={(e) => handleNodeKey(e, n)}
                    onFocus={() => setHoveredId(n.sessionId)}
                    onBlur={() =>
                      setHoveredId((id) => (id === n.sessionId ? null : id))
                    }
                    onMouseEnter={() => setHoveredId(n.sessionId)}
                    onMouseLeave={() =>
                      setHoveredId((id) => (id === n.sessionId ? null : id))
                    }
                  >
                    <circle
                      cx={0}
                      cy={0}
                      r={Math.max(r + 16, 24)}
                      fill="transparent"
                    />
                    {/* Soft halo — planet-tinted */}
                    <circle
                      cx={0}
                      cy={0}
                      r={r + (selected ? 14 : hoveredNow ? 11 : 9)}
                      fill={accent}
                      opacity={selected ? 0.22 : 0.1}
                      style={{ pointerEvents: "none" }}
                      className="journey-node-halo"
                    />
                    {/* Planet accent mark (small orbital dot) */}
                    <circle
                      cx={r + 5}
                      cy={-r * 0.35}
                      r={2.2}
                      fill={accent}
                      opacity="0.85"
                      style={{ pointerEvents: "none" }}
                    />
                    {n.isMilestone ? (
                      <circle
                        cx={0}
                        cy={0}
                        r={r + 7}
                        fill="none"
                        stroke="var(--gold)"
                        strokeWidth="1.4"
                        opacity="0.7"
                        style={{ pointerEvents: "none" }}
                      />
                    ) : null}
                    <circle
                      cx={0}
                      cy={0}
                      r={r + (selected ? 2.5 : 0)}
                      fill={accent}
                      opacity={selected ? 0.95 : 0.72}
                      style={{
                        pointerEvents: "none",
                        filter: `drop-shadow(0 0 ${selected ? 16 : 10}px color-mix(in srgb, ${accent} ${selected ? 70 : 45}%, transparent))`,
                      }}
                      className="journey-node-core"
                    />
                    {/* Tiny bright core */}
                    <circle
                      cx={-r * 0.2}
                      cy={-r * 0.25}
                      r={Math.max(1.4, r * 0.28)}
                      fill="color-mix(in srgb, white 70%, transparent)"
                      opacity="0.7"
                      style={{ pointerEvents: "none" }}
                    />
                    <circle
                      cx={0}
                      cy={0}
                      r={r + 12}
                      fill="none"
                      stroke="var(--violet)"
                      strokeWidth="1.75"
                      opacity="0"
                      className="journey-node-focus-ring"
                      style={{ pointerEvents: "none" }}
                    />
                  </g>
                );
              })}
            </>
          )}
        </svg>

        {/* HTML tooltip for hover / focus — accessible text */}
        {hovered && !journeyEmpty && !filterEmpty ? (
          <div
            id={tooltipId}
            role="tooltip"
            className="journey-node-tooltip pointer-events-none absolute z-[2] max-w-[14rem] rounded-xl px-3 py-2 text-left"
            style={{
              left: Math.min(
                viewportWidth - 160,
                Math.max(12, toX(hovered.x, contentWidth) - scrollLeft - 70),
              ),
              top: Math.max(8, toY(hovered.y) - 72),
              background: "color-mix(in srgb, var(--surface) 94%, transparent)",
              border: "1px solid var(--surface-border)",
              boxShadow: "var(--shadow-soft)",
              color: "var(--foreground)",
            }}
          >
            <p
              className="text-[0.625rem] font-semibold tracking-[0.1em] uppercase"
              style={{ color: planetAccent(hovered.planet) }}
            >
              {hovered.planetLabel}
              <span className="mx-1.5 opacity-40">·</span>
              <span style={{ color: "var(--foreground-muted)" }}>
                {shortDate(hovered.recordedAt)}
              </span>
            </p>
            <p className="mt-1 text-[0.75rem] leading-snug">
              &ldquo;{truncate(hovered.prompt, 48)}&rdquo;
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
