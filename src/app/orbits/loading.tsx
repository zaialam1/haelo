export default function OrbitsLoading() {
  return (
    <div className="orbits-page relative min-h-dvh w-full overflow-hidden">
      <div
        className="universe-nebula-stars pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      />
      <main className="relative z-10 w-full pb-28 pt-16 sm:pt-20">
        <div className="px-4 sm:px-8 lg:px-12">
          <div
            className="h-9 w-36 rounded-lg"
            style={{
              background: "color-mix(in srgb, var(--violet) 14%, transparent)",
            }}
          />
          <div
            className="mt-4 h-4 w-full max-w-md rounded"
            style={{
              background: "color-mix(in srgb, var(--foreground) 6%, transparent)",
            }}
          />
        </div>

        <div
          className="orbits-star-map relative mt-8 w-full"
          aria-busy="true"
          aria-label="Loading Orbit sky"
        >
          {[
            { left: "18%", top: "16%" },
            { left: "78%", top: "18%" },
            { left: "22%", top: "78%" },
            { left: "76%", top: "76%" },
          ].map((pos) => (
            <div
              key={`${pos.left}-${pos.top}`}
              className="absolute size-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: pos.left,
                top: pos.top,
                background:
                  "color-mix(in srgb, var(--violet) 16%, transparent)",
                boxShadow:
                  "0 0 24px color-mix(in srgb, var(--violet) 20%, transparent)",
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
