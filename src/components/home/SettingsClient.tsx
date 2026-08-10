"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getAccountProfile,
  signOut,
  type AccountProfile,
} from "@/lib/auth/account";
import { deleteAccountAction } from "@/lib/auth/actions";
import { clearAgeGatePrototype } from "@/lib/age-gate/prototype";
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

type SettingsProfile = AccountProfile & {
  username: string | null;
  accountRole: AccountRole;
};

export function SettingsClient({
  username = null,
  accountRole = "user",
  professionalType = null,
  professionalDisplayName = null,
  verificationStatus = null,
}: {
  username?: string | null;
  accountRole?: AccountRole;
  professionalType?: ProfessionalType | null;
  professionalDisplayName?: string | null;
  verificationStatus?: ProfessionalVerificationStatus | null;
}) {
  const router = useRouter();
  const [account, setAccount] = useState<SettingsProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function logOut() {
    setBusy(true);
    setError(null);
    try {
      clearStoredAppMode();
      await signOut();
      clearAgeGatePrototype();
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
      clearAgeGatePrototype();
      router.push("/");
      router.refresh();
    } catch {
      setError("Couldn’t delete account. Try again.");
      setBusy(false);
    }
  }

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
        <section
          className="rounded-2xl border px-5 py-5"
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
            Account
          </p>

          {!ready ? null : account ? (
            <dl className="mt-4 space-y-4">
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
              className="mt-4 text-sm leading-relaxed"
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
        </section>

        {ready && account ? (
          <section
            className="mt-5 rounded-2xl border px-5 py-5"
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
              Account details
            </p>
            {account.accountRole === "professional" ? (
              <>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Professional tools live in Professional Mode — not here.
                  Use the Personal | Professional switch in the header.
                </p>
                <Link
                  href="/professional"
                  className="mt-4 inline-flex rounded-full bg-[var(--violet)] px-5 py-2.5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                >
                  Open Professional Mode
                </Link>
              </>
            ) : (
              <>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  See who you&rsquo;ve chosen to connect with. Connections never
                  share your private Haelo activity.
                </p>
                <Link
                  href="/settings/connections"
                  className="mt-4 inline-flex rounded-full bg-[var(--violet)] px-5 py-2.5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                >
                  View connections
                </Link>
              </>
            )}
          </section>
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

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={busy || !account}
              className="w-full rounded-full px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B2C2C]"
              style={{
                background: "color-mix(in srgb, #9B2C2C 12%, transparent)",
                color: "#9B2C2C",
              }}
            >
              Delete account
            </button>
          ) : (
            <div
              className="rounded-2xl border px-4 py-4"
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
                  className="flex-1 rounded-full bg-[#9B2C2C] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B2C2C]"
                >
                  {busy ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={busy}
                  className="flex-1 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--violet-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
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
