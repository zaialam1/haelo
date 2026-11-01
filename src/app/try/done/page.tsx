import type { Metadata } from "next";
import { GuestDoneClient } from "@/components/try/GuestDoneClient";

export const metadata: Metadata = {
  title: "Thanks for trying Halo",
  description: "Try another question, create an account, or leave whenever you want.",
};

type PageProps = {
  searchParams: Promise<{ skipped?: string }>;
};

export default async function GuestDonePage({ searchParams }: PageProps) {
  const { skipped } = await searchParams;

  return (
    <main
      className="min-h-dvh"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 90% 0%, color-mix(in srgb, var(--rose) 35%, transparent), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 100%, color-mix(in srgb, var(--gold) 35%, transparent), transparent 50%), var(--background)",
      }}
    >
      <GuestDoneClient skipped={skipped === "1"} />
    </main>
  );
}
