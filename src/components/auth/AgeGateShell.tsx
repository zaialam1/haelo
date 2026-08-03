import Link from "next/link";

type AgeGateShellProps = {
  children: React.ReactNode;
  eyebrow?: string;
};

export function AgeGateShell({
  children,
  eyebrow = "Haelo",
}: AgeGateShellProps) {
  return (
    <div
      className="flex min-h-full flex-col"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 90% 0%, color-mix(in srgb, var(--rose) 28%, transparent), transparent 55%), radial-gradient(ellipse 50% 40% at 0% 100%, color-mix(in srgb, var(--gold) 22%, transparent), transparent 50%), var(--background)",
      }}
    >
      <header className="mx-auto flex w-full max-w-lg items-center justify-between px-5 py-6 sm:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-fraunces)] text-xl tracking-tight text-[var(--violet)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--violet)]"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          Haelo
        </Link>
        <p
          className="text-[0.6875rem] font-semibold tracking-[0.12em] uppercase"
          style={{ color: "var(--foreground-muted)" }}
        >
          {eyebrow}
        </p>
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 pb-16 sm:px-8">
        {children}
      </main>
    </div>
  );
}
