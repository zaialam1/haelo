"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  getAccountProfile,
  signOut,
  type AccountProfile,
} from "@/lib/auth/account";
import { deleteAccountAction } from "@/lib/auth/actions";
import { submitProductFeedbackAction } from "@/lib/feedback/actions";
import { setNotificationPrefAction } from "@/lib/preferences/actions";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_LABELS,
  isNotificationCategoryEnabled,
  type NotificationCategory,
  type UserPreferences,
} from "@/lib/preferences/types";
import { formatUsernameDisplay } from "@/lib/profiles/username";
import type { AccountRole } from "@/lib/profiles/types";
import { clearStoredAppMode } from "@/lib/professional/mode";
import {
  accountRoleLabel,
  professionalTypeLabel,
  verificationStatusLabel,
  type ProfessionalType,
  type ProfessionalVerificationStatus,
} from "@/lib/professional/types";
import {
  deleteSessionAction,
  listDeletableSessionsAction,
  type DeletableSessionSummary,
} from "@/lib/sessions/deleteSession";

type SettingsProfile = AccountProfile & {
  username: string | null;
  accountRole: AccountRole;
};

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="mt-5 rounded-2xl border px-5 py-5 first:mt-0"
      style={{
        background: "var(--surface)",
        borderColor: "var(--surface-border)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.12em] uppercase"
        style={{ color: "var(--violet)" }}
      >
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function SettingsClient({
  username = null,
  accountRole = "user",
  professionalType = null,
  professionalDisplayName = null,
  verificationStatus = null,
  initialPreferences,
}: {
  username?: string | null;
  accountRole?: AccountRole;
  professionalType?: ProfessionalType | null;
  professionalDisplayName?: string | null;
  verificationStatus?: ProfessionalVerificationStatus | null;
  initialPreferences: UserPreferences;
}) {
  const router = useRouter();
  const [account, setAccount] = useState<SettingsProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState(initialPreferences);
  const [micStatus, setMicStatus] = useState<string>("Checking…");
  const [sessions, setSessions] = useState<DeletableSessionSummary[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [confirmSessionId, setConfirmSessionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [prefPending, startPrefTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const profile = await getAccountProfile();
      if (!cancelled) {
        setAccount(
          profile
            ? {
                ...profile,
                username,
                accountRole,
              }
            : null,
        );
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username, accountRole]);

  useEffect(() => {
    let cancelled = false;
    async function checkMic() {
      try {
        if (!navigator.permissions?.query) {
          if (!cancelled) setMicStatus("Check your browser settings for microphone access.");
          return;
        }
        const result = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        if (cancelled) return;
        if (result.state === "granted") setMicStatus("Microphone access is allowed.");
        else if (result.state === "denied")
          setMicStatus("Microphone access is blocked in your browser.");
        else setMicStatus("Microphone access will be requested when you record.");
      } catch {
        if (!cancelled)
          setMicStatus("Microphone access is managed by your browser.");
      }
    }
    void checkMic();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await listDeletableSessionsAction();
      if (!cancelled) {
        setSessions(list);
        setSessionsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function logOut() {
    setBusy(true);
    setError(null);
    try {
      clearStoredAppMode();
      await signOut();
      router.push("/");
      router.refresh();
    } catch {
      setError("Couldn’t log out. Try again.");
      setBusy(false);
    }
  }

  async function deleteAccount() {
    setBusy(true);
    setError(null);
    try {
      const result = await deleteAccountAction();
      if (!result.ok) {
        setError(result.message);
        setBusy(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Couldn’t delete account. Try again.");
      setBusy(false);
    }
  }

  function togglePref(category: NotificationCategory, enabled: boolean) {
    const previous = prefs;
    setPrefs({
      ...prefs,
      notificationPrefs: { ...prefs.notificationPrefs, [category]: enabled },
    });
    startPrefTransition(async () => {
      const result = await setNotificationPrefAction(category, enabled);
      if (!result.ok) {
        setPrefs(previous);
        setError("Couldn’t save notification preference. Try again.");
      }
    });
  }

  async function deleteSession(sessionId: string) {
    setBusy(true);
    setError(null);
    const result = await deleteSessionAction(sessionId);
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? "Couldn’t delete this recording.");
      return;
    }
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setConfirmSessionId(null);
  }

  async function sendFeedback() {
    setBusy(true);
    setError(null);
    const result = await submitProductFeedbackAction({
      message: feedback,
      context: "settings_help",
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? "Couldn’t send feedback.");
      return;
    }
    setFeedback("");
    setFeedbackDone(true);
  }

  const connectionsHref =
    accountRole === "professional"
      ? "/professional/connections"
      : "/settings/connections";

  return (
    <div
      className="flex min-h-full flex-col"
      style={{
        background:
          "radial-gradient(ellipse 70% 40% at 100% 0%, color-mix(in srgb, var(--rose) 22%, transparent), transparent 50%), var(--background)",
      }}
    >
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          borderColor: "var(--hairline)",
          backgroundColor:
            "color-mix(in srgb, var(--background) 88%, transparent)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4 sm:h-16 sm:px-6">
          <Link
            href="/home"
            className="rounded-full px-2 py-1.5 text-sm font-medium text-[var(--violet)] transition-colors hover:bg-[var(--violet-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            ← Back
          </Link>
          <h1
            className="font-[family-name:var(--font-fraunces)] text-xl tracking-tight"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
            }}
          >
            Settings
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 sm:px-6">
        <SettingsSection title="Account">
          {!ready ? null : account ? (
            <dl className="space-y-4">
              <div>
                <dt
                  className="text-xs font-semibold"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Name
                </dt>
                <dd className="mt-1 text-[1.0625rem] font-medium">
                  {account.firstName || "—"}
                </dd>
              </div>
              <div>
                <dt
                  className="text-xs font-semibold"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Haelo name
                </dt>
                <dd className="mt-1 text-[1.0625rem] font-medium">
                  {account.username
                    ? formatUsernameDisplay(account.username)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt
                  className="text-xs font-semibold"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Account type
                </dt>
                <dd className="mt-1 text-[1.0625rem] font-medium">
                  {accountRoleLabel(account.accountRole)}
                </dd>
              </div>
              {account.accountRole === "professional" ? (
                <>
                  {professionalDisplayName ? (
                    <div>
                      <dt
                        className="text-xs font-semibold"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        Professional name
                      </dt>
                      <dd className="mt-1 text-[1.0625rem] font-medium">
                        {professionalDisplayName}
                      </dd>
                    </div>
                  ) : null}
                  {professionalType ? (
                    <div>
                      <dt
                        className="text-xs font-semibold"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        Professional role
                      </dt>
                      <dd className="mt-1 text-[1.0625rem] font-medium">
                        {professionalTypeLabel(professionalType)}
                      </dd>
                    </div>
                  ) : null}
                  {verificationStatus ? (
                    <div>
                      <dt
                        className="text-xs font-semibold"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        Verification
                      </dt>
                      <dd className="mt-1 text-[1.0625rem] font-medium">
                        {verificationStatusLabel(verificationStatus)}
                      </dd>
                    </div>
                  ) : null}
                </>
              ) : null}
              <div>
                <dt
                  className="text-xs font-semibold"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Email
                </dt>
                <dd className="mt-1 text-[1.0625rem] font-medium break-all">
                  {account.email}
                </dd>
              </div>
              <div>
                <dt
                  className="text-xs font-semibold"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Password
                </dt>
                <dd
                  className="mt-1 text-sm leading-relaxed"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  For security, your password isn&rsquo;t shown here.{" "}
                  <Link
                    href="/forgot-password"
                    className="font-semibold text-[var(--violet)] underline-offset-2 hover:underline"
                  >
                    Reset it
                  </Link>{" "}
                  if you need a new one.
                </dd>
              </div>
            </dl>
          ) : (
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              You&rsquo;re not signed in.{" "}
              <Link
                href="/login"
                className="font-semibold text-[var(--violet)] underline-offset-2 hover:underline"
              >
                Log in
              </Link>{" "}
              to see your account.
            </p>
          )}
        </SettingsSection>

        {ready && account ? (
          <>
            <SettingsSection title="Recording & Audio">
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--foreground)" }}
              >
                {micStatus}
              </p>
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                Your recordings are stored privately in your Haelo account so
                you can replay them and revisit your analysis. They are never
                shared with connections automatically.
              </p>
            </SettingsSection>

            <SettingsSection title="Notifications">
              <p
                className="mb-3 text-sm leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                Critical connection notices stay on. Everything else is optional.
              </p>
              <ul className="space-y-3">
                {NOTIFICATION_CATEGORIES.map((category) => {
                  const meta = NOTIFICATION_CATEGORY_LABELS[category];
                  const enabled = isNotificationCategoryEnabled(prefs, category);
                  return (
                    <li
                      key={category}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--foreground)" }}
                        >
                          {meta.title}
                        </p>
                        <p
                          className="mt-0.5 text-[0.8125rem] leading-relaxed"
                          style={{ color: "var(--foreground-muted)" }}
                        >
                          {meta.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        disabled={prefPending}
                        onClick={() => togglePref(category, !enabled)}
                        className="haelo-btn relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                        style={{
                          background: enabled
                            ? "var(--violet)"
                            : "color-mix(in srgb, var(--foreground) 18%, transparent)",
                        }}
                      >
                        <span
                          className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform"
                          style={{
                            left: enabled ? "1.35rem" : "0.15rem",
                          }}
                        />
                        <span className="sr-only">
                          {enabled ? "Disable" : "Enable"} {meta.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </SettingsSection>

            <SettingsSection title="Connections">
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--foreground)" }}
              >
                Connections can:
              </p>
              <ul
                className="mt-2 list-disc space-y-1 pl-5 text-sm"
                style={{ color: "var(--foreground-muted)" }}
              >
                <li>Recommend Orbits to you</li>
              </ul>
              <p
                className="mt-4 text-sm leading-relaxed"
                style={{ color: "var(--foreground)" }}
              >
                Connections cannot automatically see:
              </p>
              <ul
                className="mt-2 list-disc space-y-1 pl-5 text-sm"
                style={{ color: "var(--foreground-muted)" }}
              >
                <li>Recordings</li>
                <li>Transcripts</li>
                <li>Journey</li>
                <li>My Voice</li>
                <li>AI analyses</li>
                <li>Internal Journey scores</li>
              </ul>
              <Link
                href={connectionsHref}
                className="mt-4 inline-flex rounded-full bg-[var(--violet)] px-5 py-2.5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
              >
                Manage connections
              </Link>
              {account.accountRole === "professional" ? (
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Professional tools live in Professional Mode. Use the Personal
                  | Professional switch in the header.
                </p>
              ) : null}
            </SettingsSection>

            <SettingsSection title="Privacy & AI">
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                When Haelo analyzes a reflection, it receives your transcript
                and a few delivery signals (like pace). It never receives your
                raw audio file for analysis, and it never shares that analysis
                with connections.
              </p>
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                Journey scores are communication observations — how your voice
                moved in a moment — not personality judgments or grades.
              </p>
            </SettingsSection>

            <SettingsSection title="Data">
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                Deleting a recording removes the entire session: audio,
                transcript, analysis, and its Journey star.
              </p>
              {!sessionsLoaded ? (
                <p
                  className="mt-3 text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Loading your recordings…
                </p>
              ) : sessions.length === 0 ? (
                <p
                  className="mt-3 text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  You don&apos;t have any recordings to delete yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {sessions.slice(0, 12).map((session) => (
                    <li
                      key={session.id}
                      className="rounded-xl border px-3 py-3"
                      style={{ borderColor: "var(--hairline)" }}
                    >
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        {session.promptText?.slice(0, 80) ||
                          session.planet ||
                          "Recording"}
                        {session.promptText && session.promptText.length > 80
                          ? "…"
                          : ""}
                      </p>
                      <p
                        className="mt-0.5 text-[0.75rem]"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        {new Date(
                          session.completedAt ?? session.createdAt,
                        ).toLocaleDateString()}
                        {session.source === "orbit" ? " · Orbit" : ""}
                      </p>
                      {confirmSessionId === session.id ? (
                        <div className="mt-2 space-y-2">
                          <p className="text-[0.8125rem]" style={{ color: "#9B2C2C" }}>
                            Delete this entire session? This cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => deleteSession(session.id)}
                              className="rounded-full bg-[#9B2C2C] px-3 py-1.5 text-xs font-semibold text-white"
                            >
                              Yes, delete
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => setConfirmSessionId(null)}
                              className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                              style={{ borderColor: "var(--hairline)" }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmSessionId(session.id)}
                          className="mt-2 text-xs font-semibold text-[#9B2C2C] underline-offset-2 hover:underline"
                        >
                          Delete session
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 border-t pt-5" style={{ borderColor: "var(--hairline)" }}>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Deleting your account permanently removes your profile,
                  recordings, transcripts, Journey, My Voice, connections, and
                  recommendations.
                </p>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    disabled={busy}
                    className="mt-3 w-full rounded-full px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B2C2C]"
                    style={{
                      background: "color-mix(in srgb, #9B2C2C 12%, transparent)",
                      color: "#9B2C2C",
                    }}
                  >
                    Delete account
                  </button>
                ) : (
                  <div
                    className="mt-3 rounded-2xl border px-4 py-4"
                    style={{
                      borderColor: "color-mix(in srgb, #9B2C2C 35%, transparent)",
                      background: "color-mix(in srgb, #9B2C2C 8%, transparent)",
                    }}
                  >
                    <p className="text-sm" style={{ color: "#9B2C2C" }}>
                      Delete this account permanently? This cannot be undone.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={deleteAccount}
                        disabled={busy}
                        className="flex-1 rounded-full bg-[#9B2C2C] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
                      >
                        {busy ? "Deleting…" : "Yes, delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        disabled={busy}
                        className="flex-1 rounded-full border px-4 py-2.5 text-sm font-semibold"
                        style={{
                          borderColor: "var(--hairline)",
                          color: "var(--foreground)",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </SettingsSection>

            <SettingsSection title="Help">
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                Haelo is a private space to practice your voice. Record short
                reflections, see how they land, watch your Universe grow, and
                use Orbits when something specific is on your mind.
              </p>
              {feedbackDone ? (
                <p
                  className="mt-4 text-sm font-medium"
                  style={{ color: "var(--violet)" }}
                >
                  Thank you — your feedback was sent.
                </p>
              ) : (
                <>
                  <label className="mt-4 block">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      Send feedback
                    </span>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      maxLength={2000}
                      rows={4}
                      placeholder="What’s working? What’s confusing?"
                      className="mt-1 w-full resize-none rounded-2xl px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet)]"
                      style={{
                        background: "var(--background)",
                        border: "1px solid var(--hairline)",
                        color: "var(--foreground)",
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={busy || feedback.trim().length < 1}
                    onClick={sendFeedback}
                    className="haelo-btn mt-3 rounded-full bg-[var(--violet)] px-5 py-2.5 text-sm font-semibold text-[var(--on-violet)] disabled:opacity-60"
                  >
                    Send feedback
                  </button>
                </>
              )}
            </SettingsSection>
          </>
        ) : null}

        {error ? (
          <p
            className="mt-4 rounded-2xl border-2 px-4 py-3 text-sm"
            style={{
              borderColor: "color-mix(in srgb, #9B2C2C 35%, transparent)",
              backgroundColor: "color-mix(in srgb, #9B2C2C 8%, transparent)",
              color: "#9B2C2C",
            }}
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <section className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={logOut}
            disabled={busy}
            className="w-full rounded-full border px-5 py-3 text-sm font-semibold transition-colors hover:bg-[var(--violet-soft)] disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{
              borderColor: "var(--hairline)",
              color: "var(--violet)",
            }}
          >
            Log out
          </button>
        </section>

        <p
          className="mt-6 text-center text-xs"
          style={{ color: "var(--foreground-muted)" }}
        >
          Theme can be changed from the moon/sun icon on Home.
        </p>
      </main>
    </div>
  );
}
