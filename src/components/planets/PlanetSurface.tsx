import type { VoicePlanetId } from "@/lib/home/voicePlanets";

/** Shared SVG surfaces — same planets as the Universe map, scaled for any size */
export function PlanetSurface({
  id,
  gradientPrefix = "vp",
}: {
  id: VoicePlanetId;
  /** Unique prefix so map + hero can coexist on the same page without ID clashes */
  gradientPrefix?: string;
}) {
  const gid = `${gradientPrefix}-${id}`;

  if (id === "express") {
    return (
      <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
        <defs>
          <radialGradient id={`${gid}-body`} cx="34%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#FFF4F0" />
            <stop offset="35%" stopColor="#F2C4D4" />
            <stop offset="72%" stopColor="#E8A0BF" />
            <stop offset="100%" stopColor="#C4789A" />
          </radialGradient>
          <radialGradient id={`${gid}-shade`} cx="70%" cy="75%" r="55%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="#5B4B8A" stopOpacity="0.28" />
          </radialGradient>
          <linearGradient id={`${gid}-band`} x1="0%" y1="40%" x2="100%" y2="60%">
            <stop offset="0%" stopColor="#FFF8F0" stopOpacity="0" />
            <stop offset="40%" stopColor="#FFF8F0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFF8F0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="56" fill={`url(#${gid}-body)`} />
        <ellipse
          cx="48"
          cy="44"
          rx="38"
          ry="18"
          fill={`url(#${gid}-band)`}
          transform="rotate(-18 48 44)"
        />
        <ellipse
          cx="70"
          cy="72"
          rx="32"
          ry="12"
          fill="#E8A0BF"
          fillOpacity="0.25"
          transform="rotate(12 70 72)"
        />
        <circle cx="60" cy="60" r="56" fill={`url(#${gid}-shade)`} />
        <circle cx="42" cy="38" r="14" fill="#FFF8F0" fillOpacity="0.45" />
      </svg>
    );
  }

  if (id === "stand") {
    return (
      <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
        <defs>
          <radialGradient id={`${gid}-body`} cx="36%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#B5A8D4" />
            <stop offset="40%" stopColor="#7A6BA8" />
            <stop offset="78%" stopColor="#5B4B8A" />
            <stop offset="100%" stopColor="#3D345F" />
          </radialGradient>
          <linearGradient id={`${gid}-ridge`} x1="20%" y1="20%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#F6D365" stopOpacity="0" />
            <stop offset="45%" stopColor="#F6D365" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#F6D365" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="56" fill={`url(#${gid}-body)`} />
        <path
          d="M22 58 C38 48, 52 70, 68 52 C82 38, 96 58, 102 54"
          fill="none"
          stroke="#A392D6"
          strokeWidth="5"
          strokeOpacity="0.35"
          strokeLinecap="round"
        />
        <path
          d="M18 74 C40 66, 55 86, 78 68 C90 58, 100 72, 106 70"
          fill="none"
          stroke="#F6D365"
          strokeWidth="2.5"
          strokeOpacity="0.28"
          strokeLinecap="round"
        />
        <circle cx="60" cy="60" r="56" fill={`url(#${gid}-ridge)`} />
        <circle cx="40" cy="36" r="12" fill="#FFF8F0" fillOpacity="0.28" />
      </svg>
    );
  }

  if (id === "connect") {
    // #region agent log
    fetch('http://127.0.0.1:7260/ingest/327a9bfd-1a4e-4e3a-9bbf-2eff52fa2f90',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d29eb1'},body:JSON.stringify({sessionId:'d29eb1',runId:'post-fix',hypothesisId:'H1',location:'PlanetSurface.tsx:connect',message:'Connect surface gradient stops',data:{id,hardcodedStops:['#EAF4FA','#A9C9E0','#6B9BC7','#3F6F96'],expectedVoicePlanetColor:'#6B9BC7'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return (
      <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
        <defs>
          <radialGradient id={`${gid}-body`} cx="32%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#EAF4FA" />
            <stop offset="40%" stopColor="#A9C9E0" />
            <stop offset="75%" stopColor="#6B9BC7" />
            <stop offset="100%" stopColor="#3F6F96" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="56" fill={`url(#${gid}-body)`} />
        <circle cx="44" cy="52" r="22" fill="#8EB4D4" fillOpacity="0.4" />
        <circle cx="74" cy="58" r="20" fill="#5B4B8A" fillOpacity="0.12" />
        <circle cx="58" cy="78" r="16" fill="#F6D365" fillOpacity="0.1" />
        <circle cx="40" cy="38" r="11" fill="#FFF8F0" fillOpacity="0.4" />
      </svg>
    );
  }

  // explore
  // #region agent log
  fetch('http://127.0.0.1:7260/ingest/327a9bfd-1a4e-4e3a-9bbf-2eff52fa2f90',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d29eb1'},body:JSON.stringify({sessionId:'d29eb1',runId:'post-fix',hypothesisId:'H1',location:'PlanetSurface.tsx:explore',message:'Explore surface gradient stops',data:{id,hardcodedStops:['#FFF1E8','#F0C4A8','#E9A98A','#C47E5E'],expectedVoicePlanetColor:'#E9A98A'},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  return (
    <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
      <defs>
        <radialGradient id={`${gid}-body`} cx="34%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFF1E8" />
          <stop offset="32%" stopColor="#F0C4A8" />
          <stop offset="70%" stopColor="#E9A98A" />
          <stop offset="100%" stopColor="#C47E5E" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill={`url(#${gid}-body)`} />
      <circle cx="38" cy="42" r="2.2" fill="#F6D365" fillOpacity="0.85" />
      <circle cx="58" cy="34" r="1.6" fill="#FFF8F0" fillOpacity="0.75" />
      <circle cx="72" cy="48" r="2" fill="#F6D365" fillOpacity="0.7" />
      <circle cx="48" cy="68" r="1.8" fill="#FFF8F0" fillOpacity="0.65" />
      <circle cx="78" cy="72" r="1.5" fill="#F6D365" fillOpacity="0.6" />
      <path
        d="M38 42 L58 34 L72 48 M58 34 L48 68 M72 48 L78 72"
        fill="none"
        stroke="#F6D365"
        strokeWidth="0.8"
        strokeOpacity="0.35"
      />
      <circle cx="42" cy="36" r="12" fill="#FFF8F0" fillOpacity="0.35" />
    </svg>
  );
}

export function PlanetAtmosphere({
  id,
  color,
  variant = "map",
}: {
  id: VoicePlanetId;
  color: string;
  variant?: "map" | "hero";
}) {
  const heroScale = variant === "hero";

  if (id === "stand") {
    return (
      <span
        className="pointer-events-none absolute rounded-full"
        style={{
          inset: heroScale ? "-18%" : "-12%",
          background: `radial-gradient(circle, color-mix(in srgb, ${color} 22%, transparent), transparent 68%)`,
        }}
        aria-hidden="true"
      />
    );
  }

  if (id === "explore") {
    return (
      <>
        <span
          className="pointer-events-none absolute rounded-full"
          style={{
            inset: heroScale ? "-22%" : "-18%",
            background: `radial-gradient(circle, color-mix(in srgb, ${color} 28%, transparent), transparent 70%)`,
          }}
          aria-hidden="true"
        />
        <span
          className="voice-planet-rings pointer-events-none absolute opacity-40"
          style={{
            width: heroScale ? "160%" : "150%",
            height: heroScale ? "44%" : "42%",
            borderColor: `color-mix(in srgb, ${color} 55%, var(--gold))`,
          }}
          aria-hidden="true"
        />
      </>
    );
  }

  if (id === "connect") {
    return (
      <span
        className="pointer-events-none absolute rounded-full"
        style={{
          inset: heroScale ? "-28%" : "-22%",
          background: `radial-gradient(circle, color-mix(in srgb, ${color} 32%, transparent), transparent 72%)`,
          filter: "blur(8px)",
        }}
        aria-hidden="true"
      />
    );
  }

  // express — warm bloom
  return (
    <span
      className="pointer-events-none absolute rounded-full"
      style={{
        inset: heroScale ? "-20%" : "-16%",
        background: `radial-gradient(circle, color-mix(in srgb, ${color} 38%, transparent), color-mix(in srgb, var(--rose) 12%, transparent) 45%, transparent 72%)`,
        filter: "blur(4px)",
      }}
      aria-hidden="true"
    />
  );
}
