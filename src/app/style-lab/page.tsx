"use client";

/*
 * TEMPORARY PAGE — not part of Attune.
 * Built to compare font pairings, card treatments and dark palettes side by side.
 * Delete this whole folder once the design decisions are locked in.
 */

import { useState } from "react";
import {
  Fraunces,
  Inter,
  Instrument_Serif,
  Newsreader,
  Plus_Jakarta_Sans,
} from "next/font/google";
import type { CSSProperties } from "react";

const fraunces = Fraunces({ subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"] });
const newsreader = Newsreader({ subsets: ["latin"], axes: ["opsz"] });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

/* ---------------------------------------------------------------- typography */

type Pairing = {
  id: string;
  name: string;
  note: string;
  headingClass: string;
  bodyClass: string;
  headingStyle: CSSProperties;
};

const PAIRINGS: Pairing[] = [
  {
    id: "fraunces",
    name: "Fraunces + Plus Jakarta Sans",
    note: "Soft, warm, a little characterful. Closest to the Headspace-meets-journal feeling.",
    headingClass: fraunces.className,
    bodyClass: jakarta.className,
    headingStyle: {
      fontVariationSettings: '"opsz" 96, "SOFT" 60, "WONK" 1, "wght" 500',
      letterSpacing: "-0.015em",
    },
  },
  {
    id: "newsreader",
    name: "Newsreader + Inter",
    note: "Quieter and more literary. Closest to Day One.",
    headingClass: newsreader.className,
    bodyClass: inter.className,
    headingStyle: {
      fontVariationSettings: '"opsz" 48, "wght" 500',
      letterSpacing: "-0.01em",
    },
  },
  {
    id: "instrument",
    name: "Instrument Serif + Inter",
    note: "High-contrast and editorial. The most obviously premium, and the coolest emotionally.",
    headingClass: instrumentSerif.className,
    bodyClass: inter.className,
    headingStyle: { letterSpacing: "-0.02em" },
  },
];

/* -------------------------------------------------------------------- themes */

type CardStyle = {
  label: string;
  bg: string;
  border: string;
  shadow: string;
};

type Theme = {
  id: string;
  name: string;
  note: string;
  bg: string;
  text: string;
  textMuted: string;
  hairline: string;
  violet: string;
  onViolet: string;
  rose: string;
  gold: string;
  onWarm: string;
  cards: Record<CardId, CardStyle>;
};

type CardId = "raised" | "subtle" | "tinted";

const CARD_IDS: CardId[] = ["raised", "subtle", "tinted"];

const CREAM = "#FFF8F0";
const CHARCOAL = "#333333";

const LIGHT: Theme = {
  id: "light",
  name: "Light",
  note: "Warm Cream background, Deep Violet at full strength.",
  bg: CREAM,
  text: CHARCOAL,
  textMuted: "#6B6259",
  hairline: "rgba(51, 51, 51, 0.10)",
  violet: "#5B4B8A",
  onViolet: "#FFFFFF",
  rose: "#E8A0BF",
  gold: "#F6D365",
  onWarm: "#3A2E17",
  cards: {
    raised: {
      label: "Pure white, soft shadow",
      bg: "#FFFFFF",
      border: "transparent",
      shadow:
        "0 1px 2px rgba(51, 51, 51, 0.05), 0 10px 30px rgba(51, 51, 51, 0.07)",
    },
    subtle: {
      label: "Barely-lighter cream, hairline border",
      bg: "#FFFCF7",
      border: "rgba(51, 51, 51, 0.09)",
      shadow: "none",
    },
    tinted: {
      label: "Deeper sand, no border",
      bg: "#F7EDE2",
      border: "transparent",
      shadow: "none",
    },
  },
};

const WARM_DARK: Theme = {
  id: "warm",
  name: "Warm dark",
  note: "Plum-charcoal. Keeps the candlelit feeling of the light theme.",
  bg: "#221D24",
  text: "#F2EAE3",
  textMuted: "#B0A49B",
  hairline: "rgba(242, 234, 227, 0.12)",
  violet: "#A392D6",
  onViolet: "#221D24",
  rose: "#E8A0BF",
  gold: "#F6D365",
  onWarm: "#3A2E17",
  cards: {
    raised: {
      label: "Raised plum surface, soft shadow",
      bg: "#332C38",
      border: "transparent",
      shadow: "0 10px 30px rgba(0, 0, 0, 0.45)",
    },
    subtle: {
      label: "Near-background surface, hairline border",
      bg: "#2A2430",
      border: "rgba(242, 234, 227, 0.11)",
      shadow: "none",
    },
    tinted: {
      label: "Rose-tinted surface",
      bg: "#33262F",
      border: "transparent",
      shadow: "none",
    },
  },
};

const NEUTRAL_DARK: Theme = {
  id: "neutral",
  name: "Neutral dark",
  note: "Conventional near-black greys, like most apps.",
  bg: "#121212",
  text: "#E8E8E8",
  textMuted: "#A0A0A0",
  hairline: "rgba(232, 232, 232, 0.12)",
  violet: "#9B8AC9",
  onViolet: "#121212",
  rose: "#E8A0BF",
  gold: "#F6D365",
  onWarm: "#3A2E17",
  cards: {
    raised: {
      label: "Raised grey surface, soft shadow",
      bg: "#242424",
      border: "transparent",
      shadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
    },
    subtle: {
      label: "Near-background surface, hairline border",
      bg: "#1C1C1C",
      border: "rgba(232, 232, 232, 0.11)",
      shadow: "none",
    },
    tinted: {
      label: "Faintly violet-tinted surface",
      bg: "#262229",
      border: "transparent",
      shadow: "none",
    },
  },
};

const VIOLET_DARK: Theme = {
  id: "violet",
  name: "Violet dark",
  note: "Backgrounds drawn from the Deep Violet family. Most distinctly on-brand.",
  bg: "#1A1526",
  text: "#EDE7F5",
  textMuted: "#A79CBD",
  hairline: "rgba(237, 231, 245, 0.13)",
  violet: "#B4A3E8",
  onViolet: "#1A1526",
  rose: "#E8A0BF",
  gold: "#F6D365",
  onWarm: "#3A2E17",
  cards: {
    raised: {
      label: "Raised violet surface, soft shadow",
      bg: "#2C2440",
      border: "transparent",
      shadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
    },
    subtle: {
      label: "Near-background surface, hairline border",
      bg: "#221B33",
      border: "rgba(237, 231, 245, 0.13)",
      shadow: "none",
    },
    tinted: {
      label: "Lifted violet surface",
      bg: "#2F2545",
      border: "transparent",
      shadow: "none",
    },
  },
};

const DARK_THEMES = [WARM_DARK, NEUTRAL_DARK, VIOLET_DARK];

/* ------------------------------------------------------------ sample content */

const SAMPLE = {
  eyebrow: "Your voice map",
  heading: "Everyone has more than one voice.",
  body: "You may sound different with friends than you do in class. That isn't good or bad — it's something you can explore.",
  cta: "Start recording",
  quiet: "Maybe later",
};

const MAP_POINTS = [
  { label: "Passion", x: 50, y: 15, size: 16, recent: true },
  { label: "Friends", x: 23, y: 35, size: 13, recent: false },
  { label: "School", x: 77, y: 43, size: 10, recent: false },
  { label: "Family", x: 21, y: 68, size: 12, recent: false },
  { label: "Challenge", x: 54, y: 85, size: 9, recent: false },
];

/* ------------------------------------------------------------------ elements */

function PrimaryButton({
  theme,
  pairing,
  children,
}: {
  theme: Theme;
  pairing: Pairing;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`${pairing.bodyClass} rounded-full px-6 py-3 text-[0.9375rem] font-semibold motion-safe:transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2`}
      style={{
        backgroundColor: theme.violet,
        color: theme.onViolet,
        outlineColor: theme.violet,
      }}
    >
      {children}
    </button>
  );
}

function Card({
  theme,
  card,
  className = "",
  children,
}: {
  theme: Theme;
  card: CardStyle;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 ${className}`}
      style={{
        backgroundColor: card.bg,
        borderColor: card.border,
        boxShadow: card.shadow,
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ theme, pairing }: { theme: Theme; pairing: Pairing }) {
  return (
    <p
      className={`${pairing.bodyClass} text-[0.6875rem] font-semibold tracking-[0.14em] uppercase`}
      style={{ color: theme.textMuted }}
    >
      {SAMPLE.eyebrow}
    </p>
  );
}

/** A heading + paragraph + button, so a typeface is judged in real use. */
function Specimen({ theme, pairing }: { theme: Theme; pairing: Pairing }) {
  return (
    <div className="flex flex-col gap-4">
      <Eyebrow theme={theme} pairing={pairing} />
      <h4
        className={`${pairing.headingClass} text-[2rem] leading-[1.12] sm:text-[2.5rem]`}
        style={{ ...pairing.headingStyle, color: theme.text }}
      >
        {SAMPLE.heading}
      </h4>
      <p
        className={`${pairing.bodyClass} max-w-prose text-[1.0625rem] leading-relaxed`}
        style={{ color: theme.textMuted }}
      >
        {SAMPLE.body}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-4">
        <PrimaryButton theme={theme} pairing={pairing}>
          {SAMPLE.cta}
        </PrimaryButton>
        <span
          className={`${pairing.bodyClass} text-[0.9375rem]`}
          style={{ color: theme.textMuted }}
        >
          {SAMPLE.quiet}
        </span>
      </div>
    </div>
  );
}

function ContextCard({
  theme,
  pairing,
  card,
}: {
  theme: Theme;
  pairing: Pairing;
  card: CardStyle;
}) {
  return (
    <Card theme={theme} card={card}>
      <div className="flex items-start justify-between gap-4">
        <h5
          className={`${pairing.headingClass} text-[1.375rem]`}
          style={{ ...pairing.headingStyle, color: theme.text }}
        >
          School
        </h5>
        <span
          className="mt-2 size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: theme.violet }}
          aria-hidden="true"
        />
      </div>
      <p
        className={`${pairing.bodyClass} mt-3 text-[0.9375rem] leading-relaxed`}
        style={{ color: theme.textMuted }}
      >
        Tell me about something you learned this week.
      </p>
      <div
        className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-4"
        style={{ borderColor: theme.hairline }}
      >
        <span
          className={`${pairing.bodyClass} text-[0.8125rem]`}
          style={{ color: theme.textMuted }}
        >
          Last recorded 3 days ago
        </span>
        <span
          className={`${pairing.bodyClass} rounded-full px-3 py-1 text-[0.75rem] font-semibold`}
          style={{ backgroundColor: theme.rose, color: CHARCOAL }}
        >
          More expressive lately
        </span>
      </div>
    </Card>
  );
}

function MilestoneCard({
  theme,
  pairing,
}: {
  theme: Theme;
  pairing: Pairing;
}) {
  return (
    <div
      className="rounded-3xl p-6"
      style={{ backgroundColor: theme.gold, color: theme.onWarm }}
    >
      <p
        className={`${pairing.bodyClass} text-[0.6875rem] font-semibold tracking-[0.14em] uppercase opacity-70`}
      >
        Milestone
      </p>
      <h5
        className={`${pairing.headingClass} mt-2 text-[1.5rem]`}
        style={pairing.headingStyle}
      >
        First ten recordings
      </h5>
      <p className={`${pairing.bodyClass} mt-1 text-[0.9375rem] opacity-80`}>
        You&rsquo;ve been at this for two weeks now.
      </p>
    </div>
  );
}

/** Rough stand-in for the Voice Map, only to check how the palette reads. */
function MapPreview({ theme, pairing }: { theme: Theme; pairing: Pairing }) {
  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-3xl border"
      style={{ borderColor: theme.hairline, backgroundColor: theme.bg }}
    >
      {[86, 62, 38].map((size) => (
        <div
          key={size}
          className="absolute top-1/2 left-1/2 rounded-full border"
          style={{
            width: `${size}%`,
            height: `${size}%`,
            transform: "translate(-50%, -50%)",
            borderColor: theme.violet,
            opacity: 0.14,
          }}
          aria-hidden="true"
        />
      ))}

      {MAP_POINTS.map((point) => (
        <div
          key={point.label}
          className="absolute flex flex-col items-center gap-1.5"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <span
            className="rounded-full"
            style={{
              width: point.size,
              height: point.size,
              backgroundColor: theme.violet,
              boxShadow: point.recent ? `0 0 0 5px ${theme.gold}66` : "none",
            }}
            aria-hidden="true"
          />
          <span
            className={`${pairing.bodyClass} text-[0.6875rem] font-medium whitespace-nowrap`}
            style={{ color: theme.textMuted }}
          >
            {point.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ controls */

function ControlGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; name: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <span
        className="text-[0.6875rem] font-semibold tracking-[0.12em] uppercase"
        style={{ color: LIGHT.textMuted }}
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.id)}
              className="rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: active ? LIGHT.violet : "transparent",
                color: active ? LIGHT.onViolet : CHARCOAL,
                borderColor: active ? LIGHT.violet : LIGHT.hairline,
                outlineColor: LIGHT.violet,
              }}
            >
              {option.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t pt-10" style={{ borderColor: LIGHT.hairline }}>
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
        style={{ color: LIGHT.textMuted }}
      >
        Section {number}
      </p>
      <h2
        className="mt-2 text-[1.5rem] font-semibold"
        style={{ color: CHARCOAL }}
      >
        {title}
      </h2>
      <p
        className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed"
        style={{ color: LIGHT.textMuted }}
      >
        {description}
      </p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

/* --------------------------------------------------------- contrast examples */

const CONTRAST_ROWS = [
  {
    name: "Golden Yellow #F6D365",
    bg: "#F6D365",
    white: "1.5 : 1",
    whitePass: false,
    dark: "8.7 : 1",
    darkPass: true,
  },
  {
    name: "Soft Rose #E8A0BF",
    bg: "#E8A0BF",
    white: "2.1 : 1",
    whitePass: false,
    dark: "6.1 : 1",
    darkPass: true,
  },
  {
    name: "Deep Violet #5B4B8A",
    bg: "#5B4B8A",
    white: "7.4 : 1",
    whitePass: true,
    dark: "1.7 : 1",
    darkPass: false,
  },
];

function ContrastSwatch({
  bg,
  textColor,
  ratio,
  pass,
  caption,
}: {
  bg: string;
  textColor: string;
  ratio: string;
  pass: boolean;
  caption: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex min-h-24 flex-col justify-center rounded-2xl px-5 py-4"
        style={{ backgroundColor: bg, color: textColor }}
      >
        <span className="text-[1.0625rem] font-semibold">Start recording</span>
        <span className="text-[0.8125rem] opacity-90">
          Forty-five seconds is plenty.
        </span>
      </div>
      <p className="text-[0.8125rem]" style={{ color: LIGHT.textMuted }}>
        <span
          className="font-semibold"
          style={{ color: pass ? "#2F6B4F" : "#9B2C2C" }}
        >
          {pass ? "Passes" : "Fails"} · {ratio}
        </span>{" "}
        — {caption}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------- page */

export default function StyleLabPage() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [darkId, setDarkId] = useState<string>(WARM_DARK.id);
  const [pairingId, setPairingId] = useState<string>(PAIRINGS[0].id);
  const [cardId, setCardId] = useState<CardId>("raised");

  const darkTheme = DARK_THEMES.find((t) => t.id === darkId) ?? WARM_DARK;
  const theme = mode === "light" ? LIGHT : darkTheme;
  const pairing = PAIRINGS.find((p) => p.id === pairingId) ?? PAIRINGS[0];
  const card = theme.cards[cardId];

  return (
    <div
      className={`${inter.className} min-h-screen`}
      style={{ backgroundColor: CREAM, color: CHARCOAL }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-5 py-12 sm:px-8 sm:py-16">
        <header className="flex flex-col gap-6">
          <div>
            <p
              className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
              style={{ color: LIGHT.textMuted }}
            >
              Temporary — delete after choosing
            </p>
            <h1
              className="mt-2 text-[2rem] font-semibold sm:text-[2.5rem]"
              style={{ color: CHARCOAL }}
            >
              Attune style lab
            </h1>
            <p
              className="mt-3 max-w-2xl text-[1.0625rem] leading-relaxed"
              style={{ color: LIGHT.textMuted }}
            >
              Every section below renders the same content so you are comparing
              choices in context rather than staring at swatches. Set the
              controls to whatever you like — your selections drive Sections 2,
              3 and 4, and the summary at the bottom is what you read back to
              me.
            </p>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:gap-8">
            <ControlGroup
              label="Preview"
              value={mode}
              onChange={setMode}
              options={[
                { id: "light" as const, name: "Light" },
                { id: "dark" as const, name: "Dark" },
              ]}
            />
            <ControlGroup
              label="Typeface"
              value={pairingId}
              onChange={setPairingId}
              options={PAIRINGS.map((p) => ({ id: p.id, name: p.name }))}
            />
            <ControlGroup
              label="Card surface"
              value={cardId}
              onChange={setCardId}
              options={[
                { id: "raised" as const, name: "Raised" },
                { id: "subtle" as const, name: "Subtle" },
                { id: "tinted" as const, name: "Tinted" },
              ]}
            />
            <ControlGroup
              label="Dark palette"
              value={darkId}
              onChange={setDarkId}
              options={DARK_THEMES.map((t) => ({ id: t.id, name: t.name }))}
            />
          </div>
        </header>

        <Section
          number="1"
          title="Font pairings"
          description="All three shown at once, in whichever theme you have previewed. Read the paragraph, not just the headline — body copy is where most of the app lives."
        >
          <div className="flex flex-col gap-6">
            {PAIRINGS.map((option) => (
              <div
                key={option.id}
                className="rounded-3xl border p-6 sm:p-8"
                style={{
                  backgroundColor: theme.bg,
                  borderColor: LIGHT.hairline,
                }}
              >
                <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    className="text-[0.8125rem] font-semibold"
                    style={{ color: theme.text }}
                  >
                    {option.name}
                  </span>
                  <span
                    className="text-[0.8125rem]"
                    style={{ color: theme.textMuted }}
                  >
                    {option.note}
                  </span>
                </div>
                <Specimen theme={theme} pairing={option} />
              </div>
            ))}
          </div>
        </Section>

        <Section
          number="2"
          title="Card surfaces"
          description="Cards have to separate from the page behind them without looking boxed in. Each option is shown on the real background, holding the real content it would hold."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {CARD_IDS.map((id) => (
              <div
                key={id}
                className="rounded-3xl border p-5"
                style={{
                  backgroundColor: theme.bg,
                  borderColor: LIGHT.hairline,
                }}
              >
                <p
                  className="mb-4 text-[0.8125rem] font-semibold"
                  style={{ color: theme.text }}
                >
                  {theme.cards[id].label}
                </p>
                <div className="flex flex-col gap-4">
                  <ContextCard
                    theme={theme}
                    pairing={pairing}
                    card={theme.cards[id]}
                  />
                  <MilestoneCard theme={theme} pairing={pairing} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          number="3"
          title="Dark palettes"
          description="Three full mini-screens. Deep Violet at #5B4B8A is too dark to read on any dark background, so each palette lightens it — that part is not optional, only the flavour is."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {DARK_THEMES.map((option) => (
              <div key={option.id} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span
                      className="text-[0.9375rem] font-semibold"
                      style={{ color: CHARCOAL }}
                    >
                      {option.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDarkId(option.id);
                        setMode("dark");
                      }}
                      className="text-[0.8125rem] font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{
                        color: LIGHT.violet,
                        outlineColor: LIGHT.violet,
                      }}
                    >
                      Use for whole page
                    </button>
                  </div>
                  <p
                    className="text-[0.8125rem] leading-relaxed"
                    style={{ color: LIGHT.textMuted }}
                  >
                    {option.note}
                  </p>
                </div>

                <div
                  className="flex flex-col gap-5 rounded-3xl p-6"
                  style={{ backgroundColor: option.bg }}
                >
                  <Specimen theme={option} pairing={pairing} />
                  <ContextCard
                    theme={option}
                    pairing={pairing}
                    card={option.cards[cardId]}
                  />
                  <MapPreview theme={option} pairing={pairing} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          number="4"
          title="Contrast check"
          description="Text needs a contrast ratio of at least 4.5 to 1 against its background to be readable for everyone. Two of your brand colours fail badly with white text and are fine with Soft Charcoal, which is worth seeing rather than taking on trust."
        >
          <div className="flex flex-col gap-8">
            {CONTRAST_ROWS.map((row) => (
              <div key={row.name} className="flex flex-col gap-3">
                <h3
                  className="text-[0.9375rem] font-semibold"
                  style={{ color: CHARCOAL }}
                >
                  {row.name}
                </h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <ContrastSwatch
                    bg={row.bg}
                    textColor="#FFFFFF"
                    ratio={row.white}
                    pass={row.whitePass}
                    caption="white text"
                  />
                  <ContrastSwatch
                    bg={row.bg}
                    textColor={CHARCOAL}
                    ratio={row.dark}
                    pass={row.darkPass}
                    caption="Soft Charcoal text"
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          number="5"
          title="The Voice Map, roughly"
          description="Not a design proposal — just enough of a sketch to check that Deep Violet stays dominant and that Golden Yellow reads as a highlight rather than noise. The gold ring marks the most recent recording."
        >
          <div className="max-w-md">
            <MapPreview theme={theme} pairing={pairing} />
          </div>
        </Section>

        <footer
          className="rounded-3xl border p-6 sm:p-8"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: LIGHT.hairline,
          }}
        >
          <h2
            className="text-[1.125rem] font-semibold"
            style={{ color: CHARCOAL }}
          >
            Your picks so far
          </h2>
          <dl className="mt-4 flex flex-col gap-3">
            {[
              ["Typeface", pairing.name],
              ["Card surface", card.label],
              ["Dark palette", darkTheme.name],
              ["Previewing", theme.name],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-wrap gap-x-2 text-[0.9375rem]">
                <dt style={{ color: LIGHT.textMuted }}>{label}:</dt>
                <dd className="font-semibold" style={{ color: CHARCOAL }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <p
            className="mt-5 text-[0.9375rem] leading-relaxed"
            style={{ color: LIGHT.textMuted }}
          >
            Read these four lines back to me and I will turn them into real
            design tokens, then delete this page.
          </p>
        </footer>
      </div>
    </div>
  );
}
