export default function OrbitReflectLoading() {
  return (
    <main
      className="orbits-page relative flex min-h-dvh w-full flex-col overflow-x-hidden"
      style={{ background: "var(--background)" }}
    >
      <div
        className="universe-nebula-stars pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-8">
        <div
          className="h-3 w-40 rounded"
          style={{
            background: "color-mix(in srgb, var(--violet) 18%, transparent)",
          }}
        />
        <div
          className="mt-6 h-8 w-full max-w-xl rounded-lg"
          style={{
            background: "color-mix(in srgb, var(--foreground) 7%, transparent)",
          }}
        />
        <div
          className="mt-4 h-4 w-full max-w-md rounded"
          style={{
            background: "color-mix(in srgb, var(--foreground) 5%, transparent)",
          }}
        />
        <p className="sr-only">Loading Orbit reflection…</p>
      </div>
    </main>
  );
}
