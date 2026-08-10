"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import {
  removeConnectionAction,
  searchHaeloUsernameAction,
  sendConnectionRequestAction,
} from "@/lib/connections/actions";
import {
  accountRoleDisplayLabel,
  connectionCounterpartId,
  type ConnectionStatus,
  type HaeloConnection,
} from "@/lib/connections/types";
import type { AccountRole } from "@/lib/profiles/types";
import { formatUsernameDisplay } from "@/lib/profiles/username";
import {
  blockUserAction,
  listBlockedAccountsAction,
  unblockUserAction,
} from "@/lib/safety/actions";
import type { BlockedAccount } from "@/lib/safety/types";
import { ProfessionalModeNav } from "@/components/professional/ProfessionalModeNav";
import { ReportModal } from "@/components/safety/ReportModal";
import { TransitionLink } from "@/components/transitions/TransitionLink";

function connectionUsernameLabel(username: string | null | undefined) {
  if (!username) return "@unknown";
  return formatUsernameDisplay(username);
}

type Props = {
  accountRole: AccountRole;
  ownUsername: string | null;
  ownUserId?: string;
  initialConnections: HaeloConnection[];
  variant?: "professional" | "settings";
  verified?: boolean;
  pendingVerification?: boolean;
};

export function ConnectionsClient({
  accountRole,
  ownUsername,
  ownUserId,
  initialConnections,
  variant = "settings",
  verified = true,
  pendingVerification = false,
}: Props) {
  const isProfessional = accountRole === "professional";
  const isProfessionalVariant = variant === "professional";

  return (
    <div
      className={isProfessionalVariant ? undefined : "flex min-h-full flex-col"}
      style={
        isProfessionalVariant
          ? undefined
          : {
              background:
                "radial-gradient(ellipse 70% 40% at 100% 0%, color-mix(in srgb, var(--rose) 22%, transparent), transparent 50%), var(--background)",
            }
      }
    >
      {!isProfessionalVariant ? (
        <header
          className="sticky top-0 z-40 border-b backdrop-blur-md"
          style={{
            borderColor: "var(--hairline)",
            backgroundColor:
              "color-mix(in srgb, var(--background) 88%, transparent)",
          }}
        >
          <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4 sm:h-16 sm:px-6">
            <TransitionLink
              href="/settings"
              variant="fade"
              className="rounded-full px-2 py-1.5 text-sm font-medium text-[var(--violet)] transition-colors hover:bg-[var(--violet-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            >
              ← Settings
            </TransitionLink>
            <h1
              className="font-[family-name:var(--font-fraunces)] text-xl tracking-tight"
              style={{
                fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
              }}
            >
              Connections
            </h1>
          </div>
        </header>
      ) : null}

      <main
        className={
          isProfessionalVariant
            ? "w-full"
            : "mx-auto w-full max-w-lg flex-1 px-4 py-8 sm:px-6"
        }
      >
        {isProfessionalVariant ? (
          <>
            <ProfessionalModeNav />
            <header className="mb-8 text-center">
              <h1
                className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight"
                style={{
                  fontVariationSettings:
                    '"opsz" 84, "SOFT" 45, "WONK" 0, "wght" 550',
                }}
              >
                Connections
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--foreground-muted)]">
                Connect with people on Haelo before recommending an Orbit.
              </p>
            </header>
          </>
        ) : null}

        {ownUsername && !isProfessionalVariant ? (
          <p
            className="mb-6 text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            Your Haelo name is{" "}
            <span className="font-semibold text-[var(--violet)]">
              {formatUsernameDisplay(ownUsername)}
            </span>
          </p>
        ) : null}

        {isProfessional ? (
          <ProfessionalConnections
            ownUserId={ownUserId}
            initialConnections={initialConnections}
            verified={verified}
            pendingVerification={pendingVerification}
            showFindSomeone
          />
        ) : (
          <UserConnections
            ownUserId={ownUserId}
            initialConnections={initialConnections}
          />
        )}
      </main>
    </div>
  );
}

function UserConnections({
  ownUserId,
  initialConnections,
}: {
  ownUserId?: string;
  initialConnections: HaeloConnection[];
}) {
  const router = useRouter();
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmBlockId, setConfirmBlockId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [blocks, setBlocks] = useState<BlockedAccount[]>([]);
  const [reportTarget, setReportTarget] = useState<{
    userId: string;
    username: string | null;
    objectId: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await listBlockedAccountsAction();
      if (!cancelled) setBlocks(list);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const connections = initialConnections
    .filter((c) => c.status === "accepted")
    .filter((c) => !removedIds.includes(c.id));

  async function remove(connectionId: string) {
    setBusyId(connectionId);
    setError(null);
    const result = await removeConnectionAction(connectionId);
    setBusyId(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setConfirmId(null);
    setRemovedIds((prev) => [...prev, connectionId]);
    startTransition(() => router.refresh());
  }

  async function block(connection: HaeloConnection) {
    if (!ownUserId) return;
    const targetId = connectionCounterpartId(connection, ownUserId);
    setBusyId(connection.id);
    setError(null);
    const result = await blockUserAction(targetId);
    setBusyId(null);
    if (!result.ok) {
      setError(result.message ?? "Couldn’t block this account.");
      return;
    }
    setConfirmBlockId(null);
    setRemovedIds((prev) => [...prev, connection.id]);
    setBlocks((prev) => [
      {
        userId: targetId,
        username: connection.counterpartUsername ?? null,
        blockedAt: new Date().toISOString(),
      },
      ...prev.filter((b) => b.userId !== targetId),
    ]);
    startTransition(() => router.refresh());
  }

  async function unblock(userId: string) {
    setBusyId(userId);
    setError(null);
    const result = await unblockUserAction(userId);
    setBusyId(null);
    if (!result.ok) {
      setError(result.message ?? "Couldn’t unblock this account.");
      return;
    }
    setBlocks((prev) => prev.filter((b) => b.userId !== userId));
  }

  return (
    <div className="space-y-5">
      <section
        className="rounded-2xl border px-5 py-5"
        style={{
          background: "var(--surface)",
          borderColor: "var(--surface-border)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <h2
          className="font-[family-name:var(--font-fraunces)] text-lg"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
          }}
        >
          People you&rsquo;ve connected with
        </h2>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Your recordings, Journey, transcripts, and analyses remain private.
          Remove ends the relationship; Block also stops future requests.
        </p>

        {connections.length === 0 ? (
          <p
            className="mt-5 text-sm leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            No connections yet. When someone sends a request, you&rsquo;ll see
            it on Universe.
          </p>
        ) : (
          <ul className="mt-5 space-y-4">
            {connections.map((c) => {
              const counterpartId = ownUserId
                ? connectionCounterpartId(c, ownUserId)
                : null;
              return (
                <li
                  key={c.id}
                  className="rounded-2xl border px-4 py-4"
                  style={{ borderColor: "var(--hairline)" }}
                >
                  <p
                    className="font-[family-name:var(--font-fraunces)] text-lg"
                    style={{
                      fontVariationSettings:
                        '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
                    }}
                  >
                    {connectionUsernameLabel(c.counterpartUsername)}
                  </p>
                  <p
                    className="mt-1 text-xs font-semibold uppercase tracking-[0.1em]"
                    style={{ color: "var(--violet)" }}
                  >
                    {accountRoleDisplayLabel(c.counterpartAccountRole)}
                  </p>
                  <p
                    className="mt-2 text-sm"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    Can recommend Orbits to you
                  </p>

                  {confirmId === c.id ? (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm" style={{ color: "var(--foreground)" }}>
                        Remove connection? They will no longer be able to send new
                        Orbit recommendations. They may request again later.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busyId === c.id || pending}
                          onClick={() => void remove(c.id)}
                          className="flex-1 rounded-full bg-[#9B2C2C] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
                        >
                          {busyId === c.id ? "Removing…" : "Remove"}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === c.id}
                          onClick={() => setConfirmId(null)}
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
                  ) : confirmBlockId === c.id && counterpartId ? (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm" style={{ color: "var(--foreground)" }}>
                        Block this account? They won&apos;t be able to connect or
                        recommend Orbits to you. They won&apos;t be told why.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busyId === c.id || pending}
                          onClick={() => void block(c)}
                          className="flex-1 rounded-full bg-[#9B2C2C] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                        >
                          {busyId === c.id ? "Blocking…" : "Block"}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === c.id}
                          onClick={() => setConfirmBlockId(null)}
                          className="flex-1 rounded-full border px-4 py-2.5 text-sm font-semibold"
                          style={{ borderColor: "var(--hairline)" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmBlockId(null);
                          setConfirmId(c.id);
                        }}
                        className="text-sm font-semibold text-[#9B2C2C] underline-offset-2 hover:underline"
                      >
                        Remove
                      </button>
                      {counterpartId ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmId(null);
                              setConfirmBlockId(c.id);
                            }}
                            className="text-sm font-semibold text-[#9B2C2C] underline-offset-2 hover:underline"
                          >
                            Block
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setReportTarget({
                                userId: counterpartId,
                                username: c.counterpartUsername ?? null,
                                objectId: c.id,
                              })
                            }
                            className="text-sm font-semibold text-[var(--violet)] underline-offset-2 hover:underline"
                          >
                            Report
                          </button>
                        </>
                      ) : null}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section
        className="rounded-2xl border px-5 py-5"
        style={{
          background: "var(--surface)",
          borderColor: "var(--surface-border)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <h2
          className="font-[family-name:var(--font-fraunces)] text-lg"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
          }}
        >
          Blocked accounts
        </h2>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Blocked accounts can&apos;t send connection requests or recommend
          Orbits to you.
        </p>
        {blocks.length === 0 ? (
          <p
            className="mt-4 text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            No blocked accounts.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {blocks.map((b) => (
              <li
                key={b.userId}
                className="flex items-center justify-between gap-3 rounded-xl border px-3 py-3"
                style={{ borderColor: "var(--hairline)" }}
              >
                <span className="text-sm font-medium">
                  {connectionUsernameLabel(b.username)}
                </span>
                <button
                  type="button"
                  disabled={busyId === b.userId}
                  onClick={() => void unblock(b.userId)}
                  className="text-xs font-semibold text-[var(--violet)] underline-offset-2 hover:underline disabled:opacity-70"
                >
                  {busyId === b.userId ? "Unblocking…" : "Unblock"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error ? (
        <p className="text-sm text-[#9B2C2C]" role="alert">
          {error}
        </p>
      ) : null}

      <ReportModal
        open={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        reportedUserId={reportTarget?.userId ?? ""}
        reportedUsername={
          reportTarget?.username
            ? formatUsernameDisplay(reportTarget.username)
            : null
        }
        objectType="account"
        objectId={reportTarget?.objectId ?? null}
      />
    </div>
  );
}

function statusLabel(status: ConnectionStatus | null): string {
  switch (status) {
    case "pending":
      return "Request pending";
    case "accepted":
      return "Connected";
    case "declined":
    case "removed":
      return "Not connected";
    default:
      return "";
  }
}

function ProfessionalConnections({
  ownUserId,
  initialConnections,
  verified,
  pendingVerification,
  showFindSomeone,
}: {
  ownUserId?: string;
  initialConnections: HaeloConnection[];
  verified: boolean;
  pendingVerification: boolean;
  showFindSomeone: boolean;
}) {
  const router = useRouter();
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hit, setHit] = useState<{
    id: string;
    username: string;
    accountRole: AccountRole;
    connectionStatus: ConnectionStatus | null;
  } | null>(null);
  const [confirmSend, setConfirmSend] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const connected = initialConnections
    .filter((c) => c.status === "accepted")
    .filter((c) => !removedIds.includes(c.id));
  const pending = initialConnections.filter((c) => c.status === "pending");
  const pendingIncoming = pending.filter(
    (c) => ownUserId && c.recipientUserId === ownUserId,
  );
  const pendingOutgoing = pending.filter(
    (c) => ownUserId && c.requesterUserId === ownUserId,
  );

  async function onSearch(event: React.FormEvent) {
    event.preventDefault();
    setSearching(true);
    setSearchError(null);
    setHit(null);
    setConfirmSend(false);
    setActionError(null);

    const result = await searchHaeloUsernameAction(query);
    setSearching(false);

    if (!result.ok) {
      setSearchError(result.message);
      return;
    }

    setHit({
      id: result.user.id,
      username: result.user.username,
      accountRole: result.user.accountRole,
      connectionStatus: result.connectionStatus,
    });
  }

  async function sendRequest() {
    if (!hit) return;
    setSending(true);
    setActionError(null);
    const result = await sendConnectionRequestAction(hit.id);
    setSending(false);

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    setHit((prev) =>
      prev ? { ...prev, connectionStatus: result.connection.status } : prev,
    );
    setConfirmSend(false);
    startTransition(() => router.refresh());
  }

  async function remove(connectionId: string) {
    setBusyId(connectionId);
    setActionError(null);
    const result = await removeConnectionAction(connectionId);
    setBusyId(null);
    if (!result.ok) {
      setActionError(result.message);
      return;
    }
    setConfirmRemoveId(null);
    setRemovedIds((prev) => [...prev, connectionId]);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-5">
      {pendingVerification ? (
        <section
          className="rounded-2xl border px-5 py-5 text-center"
          style={{
            background: "color-mix(in srgb, var(--surface) 80%, transparent)",
            borderColor:
              "color-mix(in srgb, var(--professional-silver, var(--violet)) 35%, var(--hairline))",
          }}
        >
          <h2
            className="font-[family-name:var(--font-fraunces)] text-lg"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
            }}
          >
            Professional access pending
          </h2>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            You can review connections here once verified. Searching for people
            and sending requests isn&rsquo;t available yet.
          </p>
        </section>
      ) : null}

      {showFindSomeone && verified ? (
        <section
          className="rounded-2xl border px-5 py-5"
          style={{
            background: "color-mix(in srgb, var(--surface) 75%, transparent)",
            borderColor:
              "color-mix(in srgb, var(--professional-silver, var(--violet)) 30%, var(--hairline))",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <h2
            className="font-[family-name:var(--font-fraunces)] text-lg"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
            }}
          >
            Find someone
          </h2>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Search by their exact Haelo username. Personal and Professional
            accounts can both appear.
          </p>

          <form className="mt-5 flex flex-col gap-3" onSubmit={onSearch}>
            <label htmlFor={searchId} className="sr-only">
              Haelo username
            </label>
            <div
              className="flex items-center rounded-2xl border-2 bg-[var(--background)]"
              style={{ borderColor: "var(--surface-border)" }}
            >
              <span
                className="pl-4 font-semibold text-[var(--violet)]"
                aria-hidden="true"
              >
                @
              </span>
              <input
                id={searchId}
                value={query}
                onChange={(e) => setQuery(e.target.value.replace(/^@+/, ""))}
                placeholder="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full bg-transparent px-2 py-3 text-[0.9375rem] outline-none"
                disabled={searching}
              />
            </div>
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              {searching ? "Searching…" : "Search"}
            </button>
          </form>

          {searchError ? (
            <p className="mt-4 text-sm text-[#9B2C2C]" role="alert">
              {searchError}
            </p>
          ) : null}

          {hit ? (
            <div
              className="mt-5 rounded-2xl border px-4 py-4"
              style={{ borderColor: "var(--hairline)" }}
            >
              <p
                className="font-[family-name:var(--font-fraunces)] text-xl"
                style={{
                  fontVariationSettings:
                    '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
                }}
              >
                {formatUsernameDisplay(hit.username)}
              </p>
              <p
                className="mt-1 text-xs font-semibold uppercase tracking-[0.1em]"
                style={{ color: "var(--violet)" }}
              >
                {accountRoleDisplayLabel(hit.accountRole)}
              </p>

              {hit.connectionStatus ? (
                <p
                  className="mt-3 text-sm font-semibold"
                  style={{ color: "var(--violet)" }}
                >
                  {statusLabel(hit.connectionStatus)}
                </p>
              ) : null}

              {!hit.connectionStatus ||
              hit.connectionStatus === "declined" ||
              hit.connectionStatus === "removed" ? (
                confirmSend ? (
                  <div className="mt-4 space-y-3">
                    <h3
                      className="font-[family-name:var(--font-fraunces)] text-base"
                      style={{
                        fontVariationSettings:
                          '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
                      }}
                    >
                      Connect with {formatUsernameDisplay(hit.username)}?
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {hit.accountRole === "professional"
                        ? "If they accept, you’ll both be able to recommend Orbits to each other. Private Haelo activity stays private on both sides."
                        : "If they accept, you’ll be able to recommend Haelo experiences to them. Their recordings, Journey, transcripts, and analyses remain private."}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={sending}
                        onClick={() => void sendRequest()}
                        className="flex-1 rounded-full bg-[var(--violet)] px-4 py-2.5 text-sm font-semibold text-[var(--on-violet)] disabled:opacity-70"
                      >
                        {sending ? "Sending…" : "Send request"}
                      </button>
                      <button
                        type="button"
                        disabled={sending}
                        onClick={() => setConfirmSend(false)}
                        className="flex-1 rounded-full border px-4 py-2.5 text-sm font-semibold"
                        style={{ borderColor: "var(--hairline)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmSend(true)}
                    className="mt-4 rounded-full border px-4 py-2.5 text-sm font-semibold text-[var(--violet)] transition-colors hover:bg-[var(--violet-soft)]"
                    style={{ borderColor: "var(--hairline)" }}
                  >
                    Send connection request
                  </button>
                )
              ) : null}

              {actionError ? (
                <p className="mt-3 text-sm text-[#9B2C2C]" role="alert">
                  {actionError}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <ConnectionGroup
        title="Connected"
        items={connected}
        empty="No connections yet."
        ownUserId={ownUserId}
        confirmRemoveId={confirmRemoveId}
        busyId={busyId}
        onConfirmRemove={setConfirmRemoveId}
        onRemove={(id) => void remove(id)}
        allowRemove
        allowSafety
      />
      <ConnectionGroup
        title="Pending"
        items={[...pendingIncoming, ...pendingOutgoing]}
        empty="No pending requests."
        ownUserId={ownUserId}
        showDirection
      />
      <ProfessionalBlockedList />
    </div>
  );
}

function ProfessionalBlockedList() {
  const [blocks, setBlocks] = useState<BlockedAccount[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await listBlockedAccountsAction();
      if (!cancelled) setBlocks(list);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function unblock(userId: string) {
    setBusyId(userId);
    const result = await unblockUserAction(userId);
    setBusyId(null);
    if (result.ok) {
      setBlocks((prev) => prev.filter((b) => b.userId !== userId));
    }
  }

  return (
    <section
      className="rounded-2xl border px-5 py-5"
      style={{
        background: "color-mix(in srgb, var(--surface) 75%, transparent)",
        borderColor:
          "color-mix(in srgb, var(--professional-silver, var(--violet)) 28%, var(--hairline))",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <h2
        className="font-[family-name:var(--font-fraunces)] text-lg"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
        }}
      >
        Blocked accounts
      </h2>
      {blocks.length === 0 ? (
        <p className="mt-3 text-sm" style={{ color: "var(--foreground-muted)" }}>
          No blocked accounts.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {blocks.map((b) => (
            <li
              key={b.userId}
              className="flex items-center justify-between gap-3 rounded-xl border px-3 py-3"
              style={{ borderColor: "var(--hairline)" }}
            >
              <span className="text-sm font-medium">
                {connectionUsernameLabel(b.username)}
              </span>
              <button
                type="button"
                disabled={busyId === b.userId}
                onClick={() => void unblock(b.userId)}
                className="text-xs font-semibold text-[var(--violet)] underline-offset-2 hover:underline"
              >
                Unblock
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ConnectionGroup({
  title,
  items,
  empty,
  ownUserId,
  showDirection = false,
  allowRemove = false,
  allowSafety = false,
  confirmRemoveId = null,
  busyId = null,
  onConfirmRemove,
  onRemove,
}: {
  title: string;
  items: HaeloConnection[];
  empty: string;
  ownUserId?: string;
  showDirection?: boolean;
  allowRemove?: boolean;
  allowSafety?: boolean;
  confirmRemoveId?: string | null;
  busyId?: string | null;
  onConfirmRemove?: (id: string | null) => void;
  onRemove?: (id: string) => void;
}) {
  const router = useRouter();
  const [confirmBlockId, setConfirmBlockId] = useState<string | null>(null);
  const [localBusy, setLocalBusy] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<{
    userId: string;
    username: string | null;
    objectId: string;
  } | null>(null);

  return (
    <section
      className="rounded-2xl border px-5 py-5"
      style={{
        background: "color-mix(in srgb, var(--surface) 75%, transparent)",
        borderColor:
          "color-mix(in srgb, var(--professional-silver, var(--violet)) 28%, var(--hairline))",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <h2
        className="font-[family-name:var(--font-fraunces)] text-lg"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
        }}
      >
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm" style={{ color: "var(--foreground-muted)" }}>
          {empty}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((c) => {
            const incoming =
              showDirection && ownUserId && c.recipientUserId === ownUserId;
            const counterpartId = ownUserId
              ? connectionCounterpartId(c, ownUserId)
              : null;
            return (
              <li
                key={c.id}
                className="rounded-xl border px-3 py-3"
                style={{ borderColor: "var(--hairline)" }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[1.0625rem] font-medium">
                    {connectionUsernameLabel(c.counterpartUsername)}
                  </p>
                  <p
                    className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: "var(--violet)" }}
                  >
                    {accountRoleDisplayLabel(c.counterpartAccountRole)}
                  </p>
                </div>
                {showDirection ? (
                  <p
                    className="mt-1 text-xs"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {incoming ? "Incoming request" : "Outgoing request"}
                  </p>
                ) : null}
                {allowRemove && onConfirmRemove && onRemove ? (
                  confirmRemoveId === c.id ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-[var(--foreground-muted)]">
                        Remove this connection?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busyId === c.id}
                          onClick={() => onRemove(c.id)}
                          className="rounded-full bg-[#9B2C2C] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-70"
                        >
                          {busyId === c.id ? "Removing…" : "Remove"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onConfirmRemove(null)}
                          className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                          style={{ borderColor: "var(--hairline)" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : confirmBlockId === c.id && counterpartId ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-[var(--foreground-muted)]">
                        Block this account? They won&apos;t be told why.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={localBusy === c.id}
                          onClick={() => {
                            void (async () => {
                              setLocalBusy(c.id);
                              const result = await blockUserAction(counterpartId);
                              setLocalBusy(null);
                              if (result.ok) {
                                setConfirmBlockId(null);
                                router.refresh();
                              }
                            })();
                          }}
                          className="rounded-full bg-[#9B2C2C] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-70"
                        >
                          {localBusy === c.id ? "Blocking…" : "Block"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmBlockId(null)}
                          className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                          style={{ borderColor: "var(--hairline)" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      <button
                        type="button"
                        onClick={() => onConfirmRemove(c.id)}
                        className="text-xs font-semibold text-[#9B2C2C] underline-offset-2 hover:underline"
                      >
                        Remove
                      </button>
                      {allowSafety && counterpartId ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setConfirmBlockId(c.id)}
                            className="text-xs font-semibold text-[#9B2C2C] underline-offset-2 hover:underline"
                          >
                            Block
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setReportTarget({
                                userId: counterpartId,
                                username: c.counterpartUsername ?? null,
                                objectId: c.id,
                              })
                            }
                            className="text-xs font-semibold text-[var(--violet)] underline-offset-2 hover:underline"
                          >
                            Report
                          </button>
                        </>
                      ) : null}
                    </div>
                  )
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <ReportModal
        open={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        reportedUserId={reportTarget?.userId ?? ""}
        reportedUsername={
          reportTarget?.username
            ? formatUsernameDisplay(reportTarget.username)
            : null
        }
        objectType="account"
        objectId={reportTarget?.objectId ?? null}
      />
    </section>
  );
}
