export default function SessionLoading() {
  return (
    <main
      className="flex min-h-dvh w-full flex-col items-center justify-center px-5"
      style={{ background: "var(--background)" }}
    >
      <p
        className="text-sm"
        style={{ color: "var(--foreground-muted)" }}
        aria-live="polite"
      >
        Preparing your prompt…
      </p>
    </main>
  );
}
