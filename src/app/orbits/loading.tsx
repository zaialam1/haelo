/**
 * Quiet loading shell — matches Orbits background without skeleton orbs.
 * Avoids a flashy mid-transition swap under the page fade veil.
 */
export default function OrbitsLoading() {
  return (
    <div
      className="orbits-page relative min-h-dvh w-full overflow-hidden"
      aria-busy="true"
      aria-label="Loading Orbits"
    >
      <div
        className="universe-nebula-stars pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      />
      <div
        className="universe-nebula-haze pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <div
        className="orbits-page-depth pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
    </div>
  );
}
