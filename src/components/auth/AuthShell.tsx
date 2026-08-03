import Link from "next/link";

type AuthShellProps = {
  children: React.ReactNode;
  /** Brand panel content (desktop) */
  brand: React.ReactNode;
};

export function AuthShell({ children, brand }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside
        className="relative flex flex-col overflow-hidden border-b px-5 py-8 sm:px-8 lg:w-[44%] lg:justify-between lg:border-b-0 lg:border-r lg:px-12 lg:py-14 xl:px-16"
        style={{
          borderColor: "color-mix(in srgb, var(--rose) 40%, transparent)",
          background:
            "radial-gradient(ellipse 80% 60% at 20% 20%, color-mix(in srgb, var(--gold) 45%, transparent), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, color-mix(in srgb, var(--rose) 45%, transparent), transparent 50%), radial-gradient(ellipse 50% 40% at 50% 50%, color-mix(in srgb, var(--violet) 22%, transparent), transparent 60%), var(--background)",
        }}
      >
        <div>
          <Link
            href="/"
            className="font-[family-name:var(--font-fraunces)] text-xl tracking-tight text-[var(--violet)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--violet)] sm:text-2xl"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
            }}
          >
            Haelo
          </Link>
          <Link
            href="/"
            className="mt-4 inline-flex text-sm font-medium text-[var(--violet)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            ← Back to home
          </Link>
        </div>

        <div className="mt-10 max-w-lg flex-1 lg:mt-0 lg:flex lg:flex-col lg:justify-center lg:pb-8">
          {brand}
        </div>

        <div
          className="pointer-events-none absolute -right-8 -bottom-10 hidden size-48 rounded-full opacity-70 lg:block xl:size-56"
          style={{
            background:
              "radial-gradient(circle, var(--gold), color-mix(in srgb, var(--rose) 70%, transparent))",
          }}
          aria-hidden="true"
        />
      </aside>

      <div className="flex flex-1 flex-col justify-center px-5 py-12 sm:px-10 lg:px-16 lg:py-16 xl:px-24">
        <div className="mx-auto w-full max-w-lg">{children}</div>
      </div>
    </div>
  );
}
