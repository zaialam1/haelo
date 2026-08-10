"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import { ProfessionalIdentityMark } from "@/components/professional/ProfessionalIdentityMark";
import { ProfessionalModeNav } from "@/components/professional/ProfessionalModeNav";

type Props = {
  displayName: string | null;
  usernameDisplay: string | null;
  verified: boolean;
  pending: boolean;
  connectedCount: number;
  pendingIncomingCount: number;
  recentRecommendationCount: number;
};

export function ProfessionalHomeExperience({
  displayName,
  usernameDisplay,
  verified,
  pending,
  connectedCount,
  pendingIncomingCount,
  recentRecommendationCount,
}: Props) {
  const isEmpty =
    connectedCount === 0 &&
    pendingIncomingCount === 0 &&
    recentRecommendationCount === 0;

  return (
    <div className="professional-home">
      <div className="professional-home__sky" aria-hidden="true">
        <div className="professional-home__nebula" />
        <div className="professional-home__stars" />
        <svg
          className="professional-home__constellation"
          viewBox="0 0 720 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <g className="professional-home__lines" stroke="currentColor" strokeWidth="0.75">
            <line x1="360" y1="160" x2="120" y2="160" />
            <line x1="360" y1="160" x2="600" y2="160" />
            <line x1="360" y1="160" x2="200" y2="60" />
            <line x1="360" y1="160" x2="520" y2="60" />
            <line x1="360" y1="160" x2="200" y2="260" />
            <line x1="360" y1="160" x2="520" y2="260" />
          </g>
          <g className="professional-home__nodes">
            <circle className="node node--soft" cx="200" cy="60" r="3.5" />
            <circle className="node node--soft" cx="520" cy="60" r="3.5" />
            <circle className="node node--soft" cx="200" cy="260" r="3" />
            <circle className="node node--soft" cx="520" cy="260" r="3" />
            <circle className="node node--orbit" cx="120" cy="160" r="5" />
            <circle className="node node--orbit" cx="600" cy="160" r="5" />
          </g>
        </svg>
      </div>

      <div className="professional-home__content">
        <ProfessionalModeNav />

        <header className="professional-home__header">
          <p className="professional-home__eyebrow">Professional</p>
          <h1 className="professional-home__title">Professional</h1>
          <p className="professional-home__lede">
            Help someone find the right place to practice their voice.
          </p>
          {(usernameDisplay || displayName) && (
            <div className="professional-home__identity">
              <ProfessionalIdentityMark
                username={usernameDisplay}
                verified={verified}
                pending={pending}
              />
              {displayName ? (
                <p className="professional-home__display-name">{displayName}</p>
              ) : null}
            </div>
          )}
        </header>

        {pending ? (
          <section className="professional-home__pending-gate" aria-live="polite">
            <h2>Professional access pending</h2>
            <p>
              You can explore this space, but searching for people and recommending
              Orbits becomes available once your professional account is verified.
            </p>
          </section>
        ) : null}

        <div className="professional-home__constellation-actions">
          <TransitionLink
            href={verified ? "/professional/recommend" : "#"}
            variant="fade"
            className={`professional-node professional-node--recommend${pending ? " is-gated" : ""}`}
            aria-disabled={pending || undefined}
            onClick={(e) => {
              if (pending) e.preventDefault();
            }}
          >
            <span className="professional-node__glow" aria-hidden="true" />
            <span className="professional-node__label">Recommend an Orbit</span>
            <span className="professional-node__hint">
              Point someone toward a guided practice
            </span>
          </TransitionLink>

          <div className="professional-home__center" aria-hidden="true">
            <span className="professional-home__center-mark">✦</span>
            <span className="professional-home__center-label">Professional</span>
          </div>

          <TransitionLink
            href="/professional/connections"
            variant="fade"
            className={`professional-node professional-node--connections${pendingIncomingCount > 0 ? " has-pulse" : ""}`}
          >
            <span className="professional-node__glow" aria-hidden="true" />
            <span className="professional-node__label">Connections</span>
            <span className="professional-node__hint">
              {connectedCount === 0
                ? "People you've connected with on Haelo"
                : `${connectedCount} connected`}
            </span>
            {pendingIncomingCount > 0 ? (
              <span className="professional-node__badge">
                {pendingIncomingCount} connection
                {pendingIncomingCount === 1 ? " request" : " requests"}
              </span>
            ) : null}
          </TransitionLink>
        </div>

        {isEmpty && !pending ? (
          <section className="professional-home__empty">
            <h2>Your professional constellation starts here.</h2>
            <p>
              Connect with someone on Haelo, then you&rsquo;ll be able to recommend
              an Orbit when the right moment comes.
            </p>
            <div className="professional-home__empty-actions">
              <TransitionLink
                href="/professional/connections"
                variant="fade"
                className="professional-home__cta-primary"
              >
                Find someone
              </TransitionLink>
              <TransitionLink
                href="/orbits"
                variant="fade"
                className="professional-home__cta-secondary"
              >
                Explore Orbits
              </TransitionLink>
            </div>
          </section>
        ) : null}

        {!isEmpty ? (
          <section className="professional-home__activity">
            {pendingIncomingCount > 0 ? (
              <TransitionLink
                href="/professional/connections"
                variant="fade"
                className="professional-home__activity-card has-pulse"
              >
                <h3>Pending requests</h3>
                <p>
                  {pendingIncomingCount} connection
                  {pendingIncomingCount === 1 ? " request" : " requests"} waiting
                </p>
              </TransitionLink>
            ) : null}
            <div className="professional-home__activity-card">
              <h3>Connections</h3>
              <p>
                {connectedCount === 0
                  ? "No connections yet"
                  : `${connectedCount} connected`}
              </p>
            </div>
            {recentRecommendationCount > 0 ? (
              <TransitionLink
                href="/professional/recommend"
                variant="fade"
                className="professional-home__activity-card"
              >
                <h3>Recent recommendations</h3>
                <p>
                  {recentRecommendationCount} sent
                </p>
              </TransitionLink>
            ) : null}
            <TransitionLink
              href="/orbits"
              variant="fade"
              className="professional-home__activity-card"
            >
              <h3>Explore Orbits</h3>
              <p>Browse the same Orbit library you use personally</p>
            </TransitionLink>
          </section>
        ) : null}
      </div>
    </div>
  );
}
