import type { Metadata } from "next";
import { GuestTryClient } from "@/components/try/GuestTryClient";

export const metadata: Metadata = {
  title: "Try Halo — free demo",
  description:
    "Try one private voice reflection without an account. Create an account to save it to your Universe.",
};

export default function TryPage() {
  return (
    <main
      className="min-h-dvh"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 90% 0%, color-mix(in srgb, var(--rose) 35%, transparent), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 100%, color-mix(in srgb, var(--gold) 35%, transparent), transparent 50%), var(--background)",
      }}
    >
      <GuestTryClient />
    </main>
  );
}
