import { TransitionLink } from "@/components/transitions/TransitionLink";

type StardustChipProps = {
  balance: number;
  href?: string;
  className?: string;
  compact?: boolean;
};

export function StardustChip({
  balance,
  href = "/store",
  className,
  compact = false,
}: StardustChipProps) {
  const content = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] ${
        compact ? "px-2.5 py-1 text-[0.75rem]" : "px-3.5 py-1.5 text-sm"
      } ${className ?? ""}`}
      style={{
        background: "color-mix(in srgb, var(--gold) 28%, var(--surface))",
        color: "var(--foreground)",
        border: "1px solid color-mix(in srgb, var(--gold) 45%, transparent)",
      }}
    >
      <span
        aria-hidden="true"
        className="inline-block size-2 rounded-full"
        style={{
          background: "var(--gold)",
          boxShadow: "0 0 10px color-mix(in srgb, var(--gold) 60%, transparent)",
        }}
      />
      <span className="tabular-nums">{balance}</span>
      <span className="font-medium opacity-80">Stardust</span>
    </span>
  );

  if (!href) return content;

  return (
    <TransitionLink href={href} variant="fade" aria-label={`${balance} Stardust`}>
      {content}
    </TransitionLink>
  );
}
