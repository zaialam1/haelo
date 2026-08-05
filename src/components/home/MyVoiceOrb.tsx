"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";

type MyVoiceOrbProps = {
  nested?: boolean;
};

export function MyVoiceOrb({ nested = false }: MyVoiceOrbProps) {
  return (
    <TransitionLink
      href="/my-voice"
      variant="fade"
      className={
        nested
          ? "voice-orb group pointer-events-auto relative z-20 flex flex-col items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
          : "voice-orb group pointer-events-auto absolute top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
      }
      aria-label="My Voice"
    >
      <span className="relative flex size-40 items-center justify-center sm:size-48">
        {/* Outer violet aura */}
        <span
          className="absolute inset-[-10%] rounded-full motion-safe:animate-[star-wave_5s_ease-in-out_infinite]"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--violet) 42%, transparent), transparent 70%)",
          }}
          aria-hidden="true"
        />
        {/* Rose wave */}
        <span
          className="absolute inset-[-5%] rounded-full motion-safe:animate-[star-wave_4.4s_ease-in-out_infinite]"
          style={{
            animationDelay: "1.1s",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--rose) 38%, transparent), transparent 72%)",
          }}
          aria-hidden="true"
        />
        {/* Gold core glow */}
        <span
          className="absolute inset-[12%] rounded-full motion-safe:animate-[star-pulse_3.8s_ease-in-out_infinite]"
          style={{
            background:
              "radial-gradient(circle at 38% 32%, color-mix(in srgb, #fff8f0 70%, var(--gold)), color-mix(in srgb, var(--gold) 70%, var(--rose)), color-mix(in srgb, var(--violet) 55%, var(--gold)))",
            boxShadow:
              "0 0 32px color-mix(in srgb, var(--gold) 55%, transparent), 0 0 64px color-mix(in srgb, var(--rose) 35%, transparent)",
          }}
          aria-hidden="true"
        />
        {/* Soft highlight */}
        <span
          className="absolute top-[22%] left-[28%] size-9 rounded-full sm:size-11"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, #fff8f0 80%, transparent), transparent 70%)",
          }}
          aria-hidden="true"
        />
      </span>

      <span
        className="font-[family-name:var(--font-fraunces)] text-base tracking-tight text-[var(--foreground)] sm:text-lg"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
        }}
      >
        My Voice
      </span>
    </TransitionLink>
  );
}
